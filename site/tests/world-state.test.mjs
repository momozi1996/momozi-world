import test from 'node:test'
import assert from 'node:assert/strict'
import {WorldState} from '../sources/shared/WorldState.js'
test('whispers persist and one guest replaces their own whisper',()=>{
 const world=new WorldState();world.receive({type:'whispersInsert',message:'Hello MoMoZi',countryCode:'CN',x:1,y:1,z:2},'a')
 world.receive({type:'whispersInsert',message:'Updated <hello>',x:2,y:1,z:2},'a')
 assert.equal(world.data.whispers.length,1);assert.equal(world.data.whispers[0].message,'Updated hello')
 assert.equal(new WorldState(world.data).snapshot().whispers.length,1)
})
test('reject invalid coordinates and bound whisper pool',()=>{
 const world=new WorldState();world.receive({type:'whispersInsert',message:'XSS',x:Infinity,y:0,z:0},'a');assert.equal(world.data.whispers.length,0)
 for(let i=0;i<35;i++)world.receive({type:'whispersInsert',message:'Hi',x:0,y:0,z:0},String(i))
 assert.equal(world.data.whispers.length,30)
})
test('race leaderboard sorts, retains daily scores, sanitizes tags',()=>{
 const world=new WorldState();world.receive({type:'circuitInsert',tag:'MOM',duration:55000,countryCode:'cn'})
 world.receive({type:'circuitInsert',tag:'ZIP',duration:35000});world.receive({type:'circuitInsert',tag:'BAD',duration:-5})
 assert.equal(world.data.circuitLeaderboard.length,2);assert.equal(world.data.circuitLeaderboard[0][0],'ZIP')
 assert.equal(new WorldState(world.data).data.circuitLeaderboard.length,2)
 world.tick(Date.now()+86400000);assert.equal(world.data.circuitLeaderboard.length,0)
})
test('cookie counter persists and rejects non-finite amounts',()=>{
 const world=new WorldState();world.receive({type:'cookiesInsert',amount:3});world.receive({type:'cookiesInsert',amount:-4});world.receive({type:'cookiesInsert',amount:NaN})
 assert.equal(new WorldState(world.data).data.cookiesCount,3)
})
test('three altar events activate a tornado and it ends',()=>{
 const world=new WorldState();for(let i=0;i<3;i++)world.receive({type:'cataclysmInsert'})
 assert.equal(world.data.cataclysmRunning,true);world.tick(Date.now()+46000);assert.equal(world.data.cataclysmRunning,false)
})
