const {chromium}=require('/Users/jyxc-dz-0100378/.agents/skills/skillhub-upload/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-webgpu']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'});const errors=[],failed=[];
 page.on('pageerror',e=>{errors.push(e.stack);console.log(e.stack)});page.on('requestfailed',r=>failed.push(r.url()));
 await page.goto('http://localhost:5179/',{waitUntil:'domcontentloaded',timeout:90000});await page.waitForFunction(()=>!document.querySelector('#momo-enter').disabled,null,{timeout:180000});await page.screenshot({path:'momozi-world/research/mobile-intro.png'});await page.locator('#momo-enter').tap();await page.waitForFunction(()=>window.__playable,null,{timeout:120000});await page.waitForTimeout(3000);await page.screenshot({path:'momozi-world/research/mobile-world.png'});
 const state=await page.evaluate(()=>({quality:game.quality.level,mode:game.inputs.mode,width:innerWidth,overflow:document.body.scrollWidth>innerWidth,connected:game.server.connected,nipple:!!game.inputs.nipple}));
 await page.locator('[data-momo-action="home"]').tap();await page.waitForTimeout(1500);await page.screenshot({path:'momozi-world/research/mobile-about.png'});
 fs.writeFileSync('momozi-world/research/mobile-test.json',JSON.stringify({state,errors,failed},null,2));console.log({state,errors,failed});await browser.close()
})().catch(e=>{console.error(e);process.exit(1)})
