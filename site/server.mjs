import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { WebSocketServer, WebSocket } from 'ws'
import msgpack from 'msgpack-lite'
import { WorldState } from './sources/shared/WorldState.js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist')
const stateFile = process.env.STATE_FILE || path.join(path.dirname(root), 'data/world.json')
if (!fs.existsSync(path.join(root,'index.html'))) { console.error('Run npm run build:online first.'); process.exit(1) }
let saved = {}
try { saved = JSON.parse(fs.readFileSync(stateFile,'utf8')) } catch {}
const world = new WorldState(saved)
let dirty = false
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.mp3':'audio/mpeg','.wav':'audio/wav','.glb':'model/gltf-binary','.ktx':'image/ktx2','.webmanifest':'application/manifest+json'}
const server = http.createServer((req,res)=>{
    if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end();return}
    let pathname
    try {pathname=decodeURIComponent(new URL(req.url,'http://local').pathname)} catch {res.writeHead(400);res.end();return}
    if (pathname==='/api/health') {res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,world:'MoMoZi',clients:wss.clients.size}));return}
    const file = path.resolve(root, '.' + (pathname==='/'?'/index.html':pathname))
    if (!file.startsWith(root+path.sep)) {res.writeHead(403);res.end();return}
    fs.stat(file,(error,stat)=>{
        if (error || !stat.isFile()) {res.writeHead(404);res.end('Not found');return}
        res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':stat.size,'Cache-Control':file.endsWith('.html')?'no-cache':'public,max-age=3600','X-Content-Type-Options':'nosniff'})
        if(req.method==='HEAD') res.end();else fs.createReadStream(file).pipe(res)
    })
})
const wss = new WebSocketServer({server,path:'/world',maxPayload:8192})
const send = (socket,data)=>{if(socket.readyState===WebSocket.OPEN)socket.send(msgpack.encode(data))}
function broadcast(messages) {if(!messages.length)return;dirty=true;for(const message of messages)for(const socket of wss.clients)send(socket,message)}
wss.on('connection',(socket,request)=>{
    // A guest world endpoint, never an authenticated identity service.
    let count=0,period=Date.now()
    send(socket,world.snapshot())
    socket.on('message',bytes=>{
        if(Date.now()-period>1000){period=Date.now();count=0}
        if(++count>12)return
        try {
            const message=msgpack.decode(bytes)
            if(typeof message.uuid!=='string'||message.uuid.length>80)return
            broadcast(world.receive(message,message.uuid))
        } catch {socket.close(1003,'Invalid message')}
    })
    socket.on('error',()=>{})
})
function persist() {
    if(!dirty)return
    try {fs.mkdirSync(path.dirname(stateFile),{recursive:true});fs.writeFileSync(stateFile+'.tmp',JSON.stringify(world.data));fs.renameSync(stateFile+'.tmp',stateFile);dirty=false} catch(error){console.error('State save failed:',error.message)}
}
const timer=setInterval(()=>{broadcast(world.tick());persist()},1000)
function stop(){clearInterval(timer);persist();for(const socket of wss.clients)socket.close();server.close(()=>process.exit(0))}
process.on('SIGTERM',stop);process.on('SIGINT',stop)
server.listen(Number(process.env.PORT)||5179,process.env.HOST||'127.0.0.1',()=>console.log(`MoMoZi world: http://${process.env.HOST||'127.0.0.1'}:${Number(process.env.PORT)||5179}`))
