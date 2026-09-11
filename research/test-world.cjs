const {chromium}=require('/Users/jyxc-dz-0100378/.agents/skills/skillhub-upload/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-webgpu']});
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});const errors=[],failed=[];
 page.on('pageerror',e=>{errors.push(e.message);console.log('ERROR',e.stack)});
 page.on('console',m=>{if(m.type()==='error'){errors.push(m.text().slice(0,300));console.log('CONSOLE',m.text().slice(0,300))}});
 page.on('requestfailed',r=>{failed.push({url:r.url(),error:r.failure()});console.log('FAIL',r.url().slice(0,150))});
 await page.goto('http://localhost:5178/',{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>window.__ready,null,{timeout:180000});console.log('ASSETS READY');
 await page.waitForFunction(()=>!document.querySelector('#momo-enter').disabled,null,{timeout:120000});
 await page.screenshot({path:'momozi-world/research/intro.png'});
 await page.locator('#momo-enter').click(); console.log('CLICKED ENTER');
 await page.waitForFunction(()=>window.__playable,null,{timeout:180000}); console.log('PLAYABLE');
 await page.waitForTimeout(6000);
 const state=()=>page.evaluate(()=>({position:game.player.position,renderer:game.rendering.renderer.backend.isWebGPUBackend,calls:game.rendering.renderer.info.render.calls,filters:[...game.inputs.filters],reveal:game.reveal.step,day:game.dayCycles.progress,server:game.server.connected,local:game.server.local}));
 console.log('STATE',await state());
 await page.screenshot({path:'momozi-world/research/world.png'});
 const before=await page.evaluate(()=>({...game.player.position}));
 await page.keyboard.down('w');await page.waitForTimeout(2200);await page.keyboard.up('w');const after=await page.evaluate(()=>({...game.player.position}));
 console.log('DRIVE',before,after);
 await page.locator('[data-momo-action="map"]').click();await page.waitForTimeout(2000);await page.screenshot({path:'momozi-world/research/map.png'});
 console.log('MAP',await page.locator('.js-map-container .location').count());
 await page.keyboard.press('Escape');await page.waitForTimeout(600);
 await page.locator('[data-momo-action="home"]').click();await page.waitForTimeout(1200);await page.screenshot({path:'momozi-world/research/about.png'});
 await page.keyboard.press('Escape');await page.waitForTimeout(600);
 await page.locator('[data-momo-action="day"]').click();await page.waitForTimeout(5000);await page.screenshot({path:'momozi-world/research/night.png'});console.log('NIGHT',await state());
 fs.writeFileSync('momozi-world/research/browser-test.json',JSON.stringify({errors,failed,before,after,state:await state()},null,2));
 await browser.close()
})().catch(e=>{console.error(e);process.exit(1)})
