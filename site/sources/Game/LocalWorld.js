import { WorldState } from '../shared/WorldState.js'
const KEY = 'momozi-world-state-v1'
export class LocalWorld {
    constructor(server) {
        this.server = server
        let saved = {}
        try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') } catch {}
        this.world = new WorldState(saved)
        this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(KEY) : null
        if (this.channel) this.channel.onmessage = event => {
            if (!event.data?.snapshot) return
            Object.assign(this.world.data,event.data.snapshot)
            for (const message of event.data.messages || []) this.deliver(message)
        }
        server.local = true; server.connected = true
        document.documentElement.classList.remove('is-server-offline')
        document.documentElement.classList.add('is-server-online','is-local-world')
        this.deliver(this.world.snapshot())
        server.events.trigger('connected')
        this.timer = setInterval(()=>this.publish(this.world.tick()),1000)
    }
    deliver(data) {
        this.server.initData = this.world.snapshot()
        this.server.events.trigger('message',[data])
    }
    publish(messages) {
        if (!messages.length) return
        try {localStorage.setItem(KEY,JSON.stringify(this.world.data))} catch {}
        for (const message of messages) this.deliver(message)
        this.channel?.postMessage({snapshot:this.world.data,messages})
    }
    send(message) {
        this.publish(this.world.receive(message,this.server.uuid))
        return true
    }
}
