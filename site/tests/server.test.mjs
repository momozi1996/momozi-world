import test from 'node:test'
import assert from 'node:assert/strict'
import {spawn} from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {WebSocket} from 'ws'
import msgpack from 'msgpack-lite'

test('self-hosted server broadcasts, persists, and blocks traversal', {skip:!fs.existsSync('dist/index.html'),timeout:15000}, async()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'momo-world-test-'))
 const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'5180',STATE_FILE:path.join(tmp,'state.json')},stdio:['ignore','pipe','pipe']})
 let a,b
 try {
  await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);child.once('exit',c=>reject(new Error('server exit '+c)))})
  const health=await fetch('http://127.0.0.1:5180/api/health').then(r=>r.json());assert.equal(health.ok,true)
  const forbidden=await fetch('http://127.0.0.1:5180/%2e%2e%2fpackage.json');assert.equal(forbidden.status,403)
  const connect=()=>new Promise((resolve,reject)=>{const ws=new WebSocket('ws://127.0.0.1:5180/world');ws.once('error',reject);ws.once('message',d=>{assert.equal(msgpack.decode(d).type,'init');resolve(ws)})})
  a=await connect();b=await connect()
  const receive=new Promise(resolve=>b.once('message',d=>resolve(msgpack.decode(d))))
  a.send(msgpack.encode({type:'cookiesInsert',amount:7,uuid:'test-a'}))
  assert.equal((await receive).cookiesCount,7)
  await new Promise(r=>setTimeout(r,1200))
  assert.equal(JSON.parse(fs.readFileSync(path.join(tmp,'state.json'),'utf8')).cookiesCount,7)
 } finally {a?.close();b?.close();child.kill('SIGTERM');await new Promise(r=>child.once('exit',r));fs.rmSync(tmp,{recursive:true,force:true})}
})
