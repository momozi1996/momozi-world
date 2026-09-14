const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const out=process.env.CHECK_OUTPUT||path.resolve(__dirname,'../../release/v2/checks');fs.mkdirSync(out,{recursive:true});
const report={url:process.env.SITE_URL||'http://127.0.0.1:5192/',checks:[],errors:[],httpErrors:[],consoleErrors:[]};
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-unsafe-webgpu']});
async function enter(page){page.on('pageerror',e=>report.errors.push(e.stack));page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text())});page.on('response',r=>{if(r.status()>=400)report.httpErrors.push(r.url())});await page.goto(report.url);await page.waitForFunction(()=>!document.querySelector('#momo-enter').disabled,null,{timeout:180000});await page.click('#momo-enter');await page.waitForFunction(()=>window.__playable,null,{timeout:180000});await page.waitForTimeout(1200)}
async function shot(page,name){await page.waitForTimeout(500);await page.screenshot({path:path.join(out,name+'.png')})}
async function action(page,name,value){await page.locator(`.momo-island-modal [data-island-action="${name}"]${value===undefined?'':`[data-value="${value}"]`}`).first().click();await page.waitForTimeout(150)}
async function close(page){await page.locator('.island-close').click();await page.waitForTimeout(700)}
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
 await context.addInitScript(()=>{if(!localStorage.getItem('test-seeded')){localStorage.setItem('achievements',JSON.stringify({honk:10,projects:[0,1],landingLeave:1}));localStorage.setItem('test-seeded','1')}});
 const p=await context.newPage();await enter(p);await shot(p,'desktop-world-v2');
 assert.equal(await p.evaluate(()=>game.achievements.groups.get('honk').progress),10);
 const oldTotal=await p.evaluate(()=>game.achievements.globalProgress.totalCount);
 await p.click('[data-island-open]');await shot(p,'desktop-passport');
 assert.equal(await p.locator('.island-stamp.is-collected').count(),0);
 await action(p,'shelf');assert.equal(await p.locator('.island-reading-card').count(),6);await shot(p,'desktop-reading-shelf');
 for(const id of ['agent-route','harness','eval','code-story','director-story','yongle-story']) {
  await action(p,'reading',id);assert.equal(await p.locator('.island-reading-question').count(),1);
  const source=await p.locator('.island-actions a').first().getAttribute('href');assert.ok(source.startsWith('https://'));
  await p.locator('.island-source-note summary').click();assert.match(await p.locator('.island-source-note').innerText(),/导读短标题/);
  if(id==='code-story'){await shot(p,'desktop-code-reading');await action(p,'project','momo-code');assert.match(await p.locator('.island-code-case').innerText(),/不等于 LoRA/);await p.locator('.island-code-case img').scrollIntoViewIfNeeded();await shot(p,'desktop-code-case');await action(p,'passport');await action(p,'shelf')}
  else await action(p,'shelf');
 }
 report.checks.push('six source-backed readings: metadata, source links, editorial attribution, relevant corner/project links, author screenshot and Priors/LoRA distinction');
 await action(p,'passport');
 await action(p,'example');await action(p,'choice','image');assert.match(await p.locator('[data-decision]').innerText(),/感受放在第一位/);await shot(p,'desktop-roundtable');
 assert.equal(await p.locator('[data-island-action="choice"][aria-pressed="true"]').count(),1);
 await action(p,'project','directors');assert.match(await p.locator('.island-body').innerText(),/顺序链/);
 await action(p,'passport');assert.equal(await p.locator('.island-stamp.is-collected').count(),1);
 await action(p,'postcard');await p.waitForFunction(()=>!document.querySelector('[data-island-action="save-card"]').disabled);
 await action(p,'postcard','social');await p.waitForFunction(()=>!document.querySelector('[data-island-action="save-card"]').disabled);await shot(p,'desktop-postcard');
 const downloadPromise=p.waitForEvent('download');await action(p,'save-card');const download=await downloadPromise;await download.saveAs(path.join(out,'postcard-export.png'));
 assert.ok(fs.statSync(path.join(out,'postcard-export.png')).size>10000);
 await action(p,'passport');await action(p,'about');await p.waitForTimeout(600);assert.equal(await p.evaluate(()=>game.inputs.filters.has('menu')),true);
 await p.locator('[data-profile-tab="projects"]').click();await p.locator('[data-island-project="persona"]').click();await p.waitForTimeout(600);
 assert.equal(await p.evaluate(()=>game.inputs.filters.has('modal')),true,'profile → content keeps car controls locked');
 const before=await p.evaluate(()=>[game.player.position.x,game.player.position.z]);await p.keyboard.down('w');await p.waitForTimeout(500);await p.keyboard.up('w');
 const after=await p.evaluate(()=>[game.player.position.x,game.player.position.z]);assert.ok(Math.hypot(after[0]-before[0],after[1]-before[1])<.5,'no acceleration through reading panel');
 await action(p,'skills');assert.match(await p.locator('.island-example').innerText(),/食谱/);await shot(p,'desktop-skills');
 await action(p,'passport');assert.equal(await p.locator('.island-stamp.is-collected').count(),3);await shot(p,'desktop-passport-complete');
 // All five real world entry points, genuine proximity check-in, no auto popup on travel.
 for(const id of ['letter','bookmark','skills','roundtable','postoffice']){
  await action(p,'corner',id);
  if(id!=='letter')assert.equal(await p.locator('[data-island-action="checkin"]').count(),0);
  await action(p,'passport');await action(p,'visit',id);await p.waitForTimeout(6500);assert.equal(await p.locator('.momo-island-modal').isVisible(),false);
  await p.evaluate(id=>{const q=game.discoveries.points.get(id).position.clone();q.y+=2;game.physicalVehicle.moveTo(q,0)},id);await p.waitForTimeout(1600);
  // Hit the actual 3D interaction marker rather than calling open().
  const xy=await p.evaluate(id=>{const q=game.discoveries.points.get(id).position.clone().project(game.view.camera);return[(q.x+1)*innerWidth/2,(1-q.y)*innerHeight/2]},id);
  await p.mouse.move(...xy);await p.waitForTimeout(250);
  if(id==='letter') await p.keyboard.press('Enter',{delay:100});
  else await p.mouse.click(xy[0],xy[1],{delay:120});
  await p.waitForTimeout(600);
  assert.equal(await p.locator('.momo-island-modal').isVisible(),true,`3D entry ${id}`);
  await action(p,'checkin',id);assert.equal(await p.evaluate(id=>game.discoveries.progress('momoCorners').has(id),id),true);
  await shot(p,'corner-'+id);await action(p,'passport');
 }
 assert.equal(await p.evaluate(()=>game.achievements.globalProgress.totalCount),oldTotal);
 await close(p);await p.reload();await p.waitForFunction(()=>!document.querySelector('#momo-enter').disabled,null,{timeout:180000});await p.click('#momo-enter');await p.waitForFunction(()=>window.__playable,null,{timeout:180000});
 await p.click('[data-island-open]');assert.equal(await p.locator('.island-stamp.is-collected').count(),3);assert.equal(await p.evaluate(()=>game.discoveries.progress('momoCorners').size),5);assert.equal(await p.evaluate(()=>game.achievements.groups.get('honk').progress),10);
 await action(p,'reset');await action(p,'confirm-reset');assert.equal(await p.locator('.island-stamp.is-collected').count(),0);assert.equal(await p.evaluate(()=>game.achievements.groups.get('honk').progress),10);
 await p.keyboard.press('Escape');await p.waitForTimeout(700);assert.equal(await p.locator('.momo-island-modal').isVisible(),false);
 const pre=await p.evaluate(()=>[game.player.position.x,game.player.position.z]);await p.keyboard.down('w');await p.waitForTimeout(900);await p.keyboard.up('w');const post=await p.evaluate(()=>[game.player.position.x,game.player.position.z]);assert.ok(Math.hypot(post[0]-pre[0],post[1]-pre[1])>.1);
 report.checks.push('desktop: optional unordered route, three stamps, scripted choices, real PNG download, all five 3D entries/check-ins, no auto-popups, resume after reload, scoped replay preserves legacy achievements, menu/modal input isolation and Escape/driving recovery');
 // Denied image path: no false success, honest fallback, unaffected driving.
 const consoleCount=report.consoleErrors.length;await p.route('**/momozi/discoveries/*.webp',route=>route.abort());await p.click('[data-island-open]');await action(p,'postcard');await p.waitForTimeout(700);assert.match(await p.locator('[data-island-status]').innerText(),/暂时没能载入/);assert.equal(await p.locator('[data-island-action="save-card"]').isDisabled(),true);await close(p);await p.unroute('**/momozi/discoveries/*.webp');report.expectedFailureConsole=report.consoleErrors.splice(consoleCount);
 report.checks.push('postcard image failure: save disabled and manual screenshot fallback shown');
 await context.close();
 for(const width of [390,320]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});await enter(page);
  await page.click('.momo-dock [data-momo-action="home"]');await page.waitForTimeout(500);await page.click('[data-profile-tab="projects"]');await page.waitForTimeout(300);await shot(page,`mobile-${width}-projects`);
  assert.equal(await page.locator('.momo-project-card').first().evaluate(el=>el.getBoundingClientRect().right<=innerWidth-5),true,'project copy stays within screen');
  const box=await page.locator('.momo-project-card').first().locator('a').first().boundingBox();assert.ok(box.y>=0&&box.y+box.height<844,`first project CTA visible at ${width}`);
  await page.locator('[data-island-project="persona"]').click();await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>game.inputs.filters.has('modal')),true);await action(page,'passport');await shot(page,`mobile-${width}-passport`);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await action(page,'shelf');await shot(page,`mobile-${width}-reading-shelf`);await action(page,'reading','harness');await shot(page,`mobile-${width}-reading`);assert.equal(await page.evaluate(()=>document.querySelector('.island-scroll').scrollWidth<=document.querySelector('.island-scroll').clientWidth),true);await action(page,'passport');
  await action(page,'example');await action(page,'choice','production');await shot(page,`mobile-${width}-roundtable`);await action(page,'passport');await action(page,'postcard');await page.waitForFunction(()=>!document.querySelector('[data-island-action="save-card"]').disabled);await shot(page,`mobile-${width}-postcard`);
  await page.locator('.island-close').focus();await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('[data-island-action="save-card"]').evaluate(el=>el===document.activeElement),true);
  await close(page);await page.click('.momo-dock [data-momo-action="map"]');await page.waitForTimeout(500);assert.match(await page.locator('.modal.map').innerText(),/作品工坊/);await shot(page,`mobile-${width}-map`);await page.close();
  report.checks.push(`${width}px touch/reduced-motion: first project CTA above fold, no viewport overflow, passport, roundtable, postcard, focus loop, map preserved`);
 }
 assert.deepEqual(report.errors,[],'no runtime exceptions');assert.deepEqual(report.httpErrors,[],'no HTTP failures');assert.deepEqual(report.consoleErrors,[],'no unexpected console errors');
 report.passed=true;
}catch(e){report.passed=false;report.failure=e.stack;throw e}finally{fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));await browser.close()}
})();
