// Dev-only art capture: fixed views of the actual island, without HUD or messages.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-webgpu']});
 try {
  const page = await browser.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:1});
  page.on('pageerror', e => console.error(e));
  await page.goto(process.env.SITE_URL || 'http://127.0.0.1:5192/');
  await page.waitForFunction(()=>!document.querySelector('#momo-enter').disabled,null,{timeout:180000});
  await page.click('#momo-enter');await page.waitForFunction(()=>window.__playable,null,{timeout:180000});
  await page.mouse.move(0,0);
  await page.addStyleTag({content:'body * { visibility:hidden !important } .js-canvas { visibility:visible !important }'});
  for (const name of ['landing','social','projects']) {
   await page.evaluate(name=>{
    game.player.respawn(name,()=>{game.view.focusPoint.isTracking=true});
    const time=name==='social'?.45:.1;
    game.dayCycles.newAbsoluteProgress=time;
    Object.assign(game.dayCycles.newAbsoluteProgressBinding,{manual:true,manualValue:time});game.dayCycles.update(true);
   },name);
   await page.waitForTimeout(5000);
   await page.evaluate(name=>{
    game.interactivePoints.temporaryHide();
    // Local development mode has no server messages. Also hide local whisper visuals.
    game.inputs.filters.clear();game.inputs.filters.add('modal');
    const target=game.view.focusPoint.position.clone();
    if(name==='social'){target.x=26.5;target.z=-18.5;target.y=.8;}
    if(name==='landing'){target.x=43;target.z=39;target.y=.4;}
    if(name==='projects'){target.x=36;target.z=13;target.y=1;}
    const position=target.clone();position.x+=20;position.y+=25;position.z+=20;
    game.view.cinematic.start(position,target);
   },name);
   await page.waitForTimeout(3000);
   const buffer=await page.locator('.js-canvas').screenshot();
   const dest=path.resolve(__dirname,'../static/momozi/discoveries');fs.mkdirSync(dest,{recursive:true});
   await sharp(buffer).resize(1440,900).webp({quality:87}).toFile(path.join(dest,name+'.webp'));
   await page.evaluate(()=>game.view.cinematic.end());
   await page.waitForTimeout(1600);
  }
 } finally {await browser.close();}
})();
