const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const output=process.env.CHECK_OUTPUT || path.join(__dirname,'color-check');fs.mkdirSync(output,{recursive:true});
const url=process.env.SITE_URL || 'http://localhost:5178/';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-webgpu']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const report={url,checkedAt:new Date().toISOString(),errors:[],consoleErrors:[],failed:[],httpErrors:[],checks:[]};
 page.on('pageerror',e=>{report.errors.push(e.stack);console.log('ERROR',e.message)});
 page.on('console',m=>{if(m.type()==='error'){report.consoleErrors.push(m.text());console.log('CONSOLE',m.text().slice(0,200))}});
 page.on('requestfailed',r=>report.failed.push(r.url()));
 page.on('response',r=>{if(r.status()>=400)report.httpErrors.push(r.url())});
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForFunction(()=>!document.querySelector('#momo-enter').disabled,null,{timeout:180000});
 await page.locator('#momo-enter').click();await page.waitForFunction(()=>window.__playable,null,{timeout:180000});
 const day=async n=>{await page.evaluate(n=>{
   game.dayCycles.newAbsoluteProgress=n;game.dayCycles.newAbsoluteProgressBinding.manualValue=n;game.dayCycles.newAbsoluteProgressBinding.manual=true;game.dayCycles.update(true);
   game.weather.override.start({humidity:0,electricField:0,clouds:0,wind:.1},0);
 },n);await page.waitForTimeout(1800)};
 const shot=async name=>{await page.screenshot({path:path.join(output,name+'.png')})};
 await day(.1);await shot('landing-day');
 report.materials=await page.evaluate(()=>({
  trunks:['birchTrees','oakTrees','cherryTrees'].map(k=>({type:k,material:game.world[k].bodies.material.name})),
  trees:['birchTrees','oakTrees','cherryTrees'].map(k=>({type:k,colors:[game.world[k].colorA,game.world[k].colorB]})),
  bench:game.world.benches.instancedGroup.meshes.map(x=>({name:x.instance.name,material:x.instance.material.name})),
  pole:game.world.poleLights.instancedGroup.meshes.map(x=>({name:x.instance.name,material:x.instance.material.name,box:x.instance.geometry.boundingBox,position:x.instance.position})),
  poles:game.world.poleLights.references.slice(0,3).map(x=>({p:x.position})),
  lampVisible:game.world.poleLights.glass.visible,
  water:game.terrain.colors,
  renderer:game.rendering.renderer.backend.isWebGPUBackend
 }));
 for(const name of ['projects','social','lab']){
  await page.evaluate(n=>game.player.respawn(n),name);await page.waitForTimeout(3500);await shot(name+'-day');
 }
 await day(.45);await shot('lab-night');
 for(const name of ['landing','projects','social']){
  await page.evaluate(n=>game.player.respawn(n),name);await page.waitForTimeout(3500);await shot(name+'-night');
 }
 await day(.1);await page.locator('.momo-dock [data-momo-action="home"]').click();await page.waitForTimeout(400);await shot('about');await page.keyboard.press('Escape');await page.waitForTimeout(600);
 await page.evaluate(()=>game.quality.changeLevel(1));await page.waitForTimeout(1500);await shot('low-quality-day');
 await day(.45);await shot('low-quality-night');
 report.lowQuality=await page.evaluate(()=>({level:game.quality.level,pool:game.world.poleLights.poolStrength.value,lamps:game.world.poleLights.glass.visible}));
 assert.equal(report.lowQuality.level,1);
 assert.ok(report.lowQuality.pool>0.4);
 assert.equal(report.lowQuality.lamps,true);
 await page.setViewportSize({width:390,height:844});await day(.1);await shot('mobile-day');
 await day(.45);await shot('mobile-night');
 await page.locator('.momo-dock [data-momo-action="map"]').click();await page.waitForTimeout(500);
 assert.equal(await page.locator('.modal.map').isVisible(),true);await page.keyboard.press('Escape');await page.waitForTimeout(500);
 const start=await page.evaluate(()=>({...game.player.position}));await page.keyboard.down('w');await page.waitForTimeout(1000);await page.keyboard.up('w');
 const end=await page.evaluate(()=>({...game.player.position}));assert.ok(Math.hypot(end.x-start.x,end.z-start.z)>0.05);
 report.checks.push('high + low quality, 390px mobile, day/night emissive pools, map and driving');
 for(const trunk of report.materials.trunks)assert.equal(trunk.material,'momoTreeBark');
 assert.equal(report.materials.bench[0].material,'momoNaturalProps');
 assert.equal(report.materials.lampVisible,true);
 report.checks.push('day and night scenes captured; original profile remains available');
 fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 assert.equal(report.errors.length,0);assert.equal(report.httpErrors.length,0);assert.equal(report.consoleErrors.length,0);assert.equal(report.failed.length,0);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
