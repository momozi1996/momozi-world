const {chromium}=require('/Users/jyxc-dz-0100378/.agents/skills/skillhub-upload/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-webgpu']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[],failed=[],checks={};
 page.on('pageerror',e=>{errors.push(e.stack);console.log('ERROR',e.stack)});page.on('requestfailed',r=>failed.push(r.url()));
 await page.goto('http://localhost:5179/',{waitUntil:'domcontentloaded',timeout:90000});await page.waitForFunction(()=>!document.querySelector('#momo-enter').disabled,null,{timeout:180000});await page.locator('#momo-enter').click();await page.waitForFunction(()=>window.__playable,null,{timeout:120000});
 async function scene(name){await page.evaluate(n=>game.player.respawn(n),name);await page.waitForTimeout(4500)}
 await scene('projects');await page.evaluate(()=>game.world.areas.projects.open());await page.waitForTimeout(5000);await page.screenshot({path:'momozi-world/research/projects.png'});
 checks.projects=await page.evaluate(()=>({title:game.world.areas.projects.navigation.current.title,loaded:game.world.areas.projects.images.initiated,images:game.world.areas.projects.navigation.current.images}));
 await page.keyboard.press('ArrowRight');await page.waitForTimeout(2000);checks.projectNext=await page.evaluate(()=>game.world.areas.projects.navigation.current.title);await page.keyboard.press('Escape');await page.waitForTimeout(2000);
 await scene('lab');await page.evaluate(()=>game.world.areas.lab.open());await page.waitForTimeout(4500);await page.screenshot({path:'momozi-world/research/lab.png'});checks.lab=await page.evaluate(()=>({title:game.world.areas.lab.navigation.current.title,loaded:game.world.areas.lab.images.initiated}));await page.keyboard.press('Escape');await page.waitForTimeout(2000);
 await scene('social');await page.screenshot({path:'momozi-world/research/social.png'});
 await page.evaluate(()=>game.menu.open('whispers'));await page.waitForTimeout(1000);await page.locator('.whispers-content .js-input').fill('Hello from MoMoZi!');await page.locator('.whispers-content form').evaluate(f=>f.requestSubmit());await page.waitForTimeout(1200);checks.whisper=await page.evaluate(()=>({connected:game.server.connected,items:game.world.whispers.data.items?.filter(w=>!w.available).map(w=>w.message)}));
 await page.evaluate(()=>game.menu.open('options'));await page.waitForTimeout(1000);await page.locator('.js-quality-toggle').click();checks.quality=await page.evaluate(()=>game.quality.level);await page.keyboard.press('Escape');await page.waitForTimeout(1000);
 await scene('bowling');checks.bowling=await page.evaluate(()=>{const b=game.world.areas.bowling;b.restart();b.ball.body.applyImpulse({x:0,y:0,z:-.4},true);return {pins:b.pins.items.length,ball:b.ball.body.translation()}});await page.waitForTimeout(1800);await page.screenshot({path:'momozi-world/research/bowling.png'});
 await scene('circuit');await page.evaluate(()=>game.world.areas.circuit.restart());await page.waitForTimeout(6500);checks.circuit=await page.evaluate(()=>({state:game.world.areas.circuit.state,timer:game.world.areas.circuit.timer.elapsedTime,filters:[...game.inputs.filters]}));await page.screenshot({path:'momozi-world/research/circuit.png'});await page.evaluate(()=>game.world.areas.circuit.finish(true));await page.waitForTimeout(1500);
 await page.evaluate(()=>{game.menu.close();game.modals.close();game.reset()});await page.waitForTimeout(3000);checks.reset=await page.evaluate(()=>({position:game.player.position,reveal:game.reveal.step}));
 fs.writeFileSync('momozi-world/research/deep-test.json',JSON.stringify({checks,errors,failed},null,2));console.log(JSON.stringify({checks,errors,failed},null,2));await browser.close()
})().catch(e=>{console.error(e);process.exit(1)})
