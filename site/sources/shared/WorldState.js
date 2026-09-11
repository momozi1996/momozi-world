/** MoMoZi-owned state protocol. Never connects to Bruno's production server. */
export class WorldState {
    constructor(saved = {}) {
        const day = Math.floor(Date.now() / 86400000) * 86400000
        this.data = {
            whispers: Array.isArray(saved.whispers) ? saved.whispers.slice(-30) : [],
            cookiesCount: Math.max(0, Number(saved.cookiesCount) || 0),
            circuitLeaderboard: saved.circuitResetTime === day && Array.isArray(saved.circuitLeaderboard) ? saved.circuitLeaderboard.slice(0,10) : [],
            circuitResetTime: day,
            cataclysmCount: Math.max(0, Number(saved.cataclysmCount) || 0),
            cataclysmProgress: 0,
            cataclysmRunning: false,
            cataclysmEnds: 0
        }
    }
    snapshot() { return {type:'init', ...this.data} }
    tick(now = Date.now()) {
        const messages = []
        const day = Math.floor(now / 86400000) * 86400000
        if (day !== this.data.circuitResetTime) {
            this.data.circuitResetTime = day; this.data.circuitLeaderboard = []
            messages.push({type:'init',...this.data})
        }
        if (this.data.cataclysmRunning && now >= this.data.cataclysmEnds) {
            this.data.cataclysmRunning = false
            messages.push({type:'cataclysmUpdate', ...this.data})
        }
        return messages
    }
    receive(message, uuid = '') {
        if (!message || typeof message !== 'object') return []
        const d = this.data
        const messages = this.tick()
        const country = /^[a-z]{2}$/i.test(message.countryCode || '') ? message.countryCode.toLowerCase() : ''
        if (message.type === 'whispersInsert') {
            const text = String(message.message || '').replace(/[<>\x00-\x1F]/g, '').trim().slice(0,80)
            if (!text || !['x','y','z'].every(k => Number.isFinite(message[k]) && Math.abs(message[k]) < 300)) return messages
            const old = d.whispers.find(w => w.uuid === uuid)
            if (old) d.whispers.splice(d.whispers.indexOf(old),1)
            if (d.whispers.length >= 30) messages.push({type:'whispersDelete',whispers:[d.whispers.shift()]})
            const whisper = {id:old?.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`,uuid,message:text,countrycode:country,x:message.x,y:message.y,z:message.z}
            d.whispers.push(whisper); messages.push({type:'whispersInsert',whispers:[whisper]})
        }
        else if (message.type === 'cookiesInsert') {
            if (!Number.isFinite(message.amount)) return messages
            d.cookiesCount += Math.min(100, Math.max(0,Math.floor(message.amount)))
            messages.push({type:'cookiesUpdate',cookiesCount:d.cookiesCount})
        }
        else if (message.type === 'circuitInsert') {
            const tag = String(message.tag || '').toUpperCase().replace(/[^A-Z]/g,'').slice(0,3)
            if (tag.length !== 3 || !Number.isFinite(message.duration) || message.duration < 5000 || message.duration > 3600000) return messages
            d.circuitLeaderboard.push([tag,country,Math.round(message.duration)])
            d.circuitLeaderboard.sort((a,b)=>a[2]-b[2]); d.circuitLeaderboard = d.circuitLeaderboard.slice(0,10)
            messages.push({type:'circuitUpdate',circuitLeaderboard:d.circuitLeaderboard})
        }
        else if (message.type === 'cataclysmInsert') {
            d.cataclysmCount++
            d.cataclysmProgress = (d.cataclysmCount % 3)/3
            if (d.cataclysmCount % 3 === 0) {d.cataclysmRunning=true;d.cataclysmEnds=Date.now()+45000}
            messages.push({type:'cataclysmUpdate',cataclysmCount:d.cataclysmCount,cataclysmProgress:d.cataclysmProgress,cataclysmRunning:d.cataclysmRunning})
        }
        return messages
    }
}
