// Exact-file desktop Chromium checks for the optional, silent breathing room.
// Uses an isolated localhost origin and synthetic inputs. No clinical or device acceptance claim.
// Run: CHROMIUM_PATH=/path/to/chromium node tests/breathing-browser.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {chromium} from 'playwright';

const require=createRequire(import.meta.url);
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const core=require('../js/breathing-core.js');
const out=path.join(root,'evidence/breathing');
const report={startedAt:new Date().toISOString(),browser:null,checks:[],runtimeErrors:[],requestFailures:[],externalRequests:[],privacyChecks:[],accessibleDescriptions:[],screenshots:[],limitations:[
 'Desktop Chromium, including narrow viewport emulation. No physical iPhone, Safari, VoiceOver or human usability acceptance.',
 'Lifecycle checks include synthetic visibility/page transition events and an emulated delayed animation frame. Real device suspension still needs acceptance.',
 'Research and traditional-context copy require independent review. Browser tests do not establish clinical efficacy, individual safety or religious authority.',
 'Links are checked for local destinations and named external source addresses. This suite does not establish continuing remote source availability.'
]};
const inputs=['breathing.html','css/breathing.css','js/breathing-core.js','js/breathing.js','meditation.html','practice-sources.html','tests/breathing-browser.mjs'];
const contexts=new Set();let server,browser,origin;
const stage=page=>page.locator('#pacer-stage');
const phase=page=>page.locator('#phase');

async function check(name,fn){
 try{await fn();report.checks.push({name,status:'passed'});}
 catch(error){report.checks.push({name,status:'failed',error:error.stack||String(error)});}
}

async function makePage(options={}){
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',...options});
 contexts.add(context);
 context.on('request',request=>{if(new URL(request.url()).origin!==origin)report.externalRequests.push({url:request.url(),method:request.method()});});
 context.on('requestfailed',request=>report.requestFailures.push({url:request.url(),error:request.failure()?.errorText}));
 await context.addInitScript(()=>{
  window.__breathingAudit={storageReads:0,storageWrites:0,fetches:0,indexedDBOpens:0,beacons:0};
  for(const method of ['getItem','key']){
   const original=Storage.prototype[method];
   Storage.prototype[method]=function(...args){window.__breathingAudit.storageReads++;return original.apply(this,args);};
  }
  for(const method of ['setItem','removeItem','clear']){
   const original=Storage.prototype[method];
   Storage.prototype[method]=function(...args){window.__breathingAudit.storageWrites++;return original.apply(this,args);};
  }
  const fetch=window.fetch;
  window.fetch=function(...args){window.__breathingAudit.fetches++;return fetch.apply(this,args);};
  const open=IDBFactory.prototype.open;
  IDBFactory.prototype.open=function(...args){window.__breathingAudit.indexedDBOpens++;return open.apply(this,args);};
  const beacon=Navigator.prototype.sendBeacon;
  if(beacon)Navigator.prototype.sendBeacon=function(...args){window.__breathingAudit.beacons++;return beacon.apply(this,args);};
 });
 const page=await context.newPage();page.setDefaultTimeout(8000);
 page.on('pageerror',error=>report.runtimeErrors.push(error.message));
 await page.goto(origin+'/breathing.html');
 await page.waitForFunction(()=>!document.getElementById('breathing-start').disabled);
 return page;
}

async function audit(page,name){
 const value=await page.evaluate(()=>window.__breathingAudit);
 const cookies=(await page.context().cookies()).length;
 report.privacyChecks.push({name,...value,cookies});
 assert.deepEqual(value,{storageReads:0,storageWrites:0,fetches:0,indexedDBOpens:0,beacons:0});
 assert.equal(cookies,0);
}

async function scenario(name,fn,options={}){
 await check(name,async()=>{
  const page=await makePage(options);
  try{await fn(page);await audit(page,name);}
  finally{contexts.delete(page.context());await page.context().close();}
 });
}

async function useClock(page){await page.clock.install();await page.clock.pauseAt(new Date());}
async function selectPattern(page,id){
 if(await page.locator('#breathing-pattern').isVisible())await page.locator('#breathing-pattern').selectOption(id);
 else await page.locator(`.practice-choice[data-pattern="${id}"]`).click();
}
async function selectPace(page,pace){
 if(!await page.locator('#guide-settings').evaluate(element=>element.open))await page.locator('#guide-settings > summary').click();
 await page.locator('#breathing-pace').selectOption(pace);
}
async function begin(page){await page.locator('#breathing-start').click();assert.equal(await stage(page).getAttribute('data-state'),'running');}
async function stopped(page){
 assert.equal(await stage(page).getAttribute('data-state'),'ready');
 assert.equal(await stage(page).getAttribute('data-phase'),null);
 assert.equal(await phase(page).textContent(),'Ready when you are');
 assert.equal(await page.locator('#phase-count').textContent(),'');
 assert.equal(await page.locator('#breathing-start').isVisible(),true);
 assert.equal(await page.locator('#breathing-stop').isVisible(),false);
}
async function stop(page){await page.locator('#breathing-stop').click();await stopped(page);}
async function screenshot(page,name,fullPage=true){
 await page.screenshot({path:path.join(out,name),fullPage});report.screenshots.push('evidence/breathing/'+name);
}
async function fits(page){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'The document must fit the viewport width.');}
async function reachableControl(page,selector,label){
 const bounds=await page.locator(selector).boundingBox(),viewport=page.viewportSize();
 assert.ok(bounds&&bounds.width>=44&&bounds.height>=44,label+' must have a 44px touch target.');
 assert.ok(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=viewport.width+1&&bounds.y+bounds.height<=viewport.height+1,
  `${label} must be visible without scrolling: ${JSON.stringify({bounds,viewport})}`);
 const hit=await page.locator(selector).evaluate(element=>{
  const bounds=element.getBoundingClientRect();
  const hit=document.elementFromPoint(bounds.x+bounds.width/2,bounds.y+bounds.height/2);
  return hit===element||element.contains(hit);
 });
 assert.equal(hit,true,label+' must not be covered by another element.');
}

try{
 await fs.mkdir(out,{recursive:true});
 report.inputSha256={};
 for(const input of inputs)report.inputSha256[input]=createHash('sha256').update(await fs.readFile(path.join(root,input))).digest('hex');
 await check('The frozen default remains a two-phase 5:5 physiological guide without holds',()=>{
  assert.equal(core.spec.kind,'physiology-tool');assert.equal(core.spec.practice,'paced-breathing');assert.equal(core.spec.cycleMs,10000);
  assert.deepEqual(core.spec.phases.map(part=>[part.kind,part.durationMs]),[['in',5000],['out',5000]]);
  assert.ok(Object.isFrozen(core)&&Object.isFrozen(core.spec)&&Object.isFrozen(core.spec.phases)&&core.spec.phases.every(Object.isFrozen));
  assert.equal(core.spec.hasHolds,false);
  for(let time=0;time<=30000;time+=10){const value=core.frame(time);assert.ok(['in','out'].includes(value.phase));assert.ok(value.scale>=.66&&value.scale<=1);}
 });
 server=http.createServer(async(request,response)=>{
  try{
   const url=new URL(request.url,'http://localhost');
   if(url.pathname==='/favicon.ico'){response.writeHead(204);response.end();return;}
   const relative=decodeURIComponent(url.pathname).slice(1)||'breathing.html';
   const filename=path.resolve(root,relative);
   if(!filename.startsWith(root+path.sep)){response.writeHead(403);response.end();return;}
   let body=await fs.readFile(filename);
   // Negative document-boundary test only. Runtime scripts and SRI pins are always served unchanged.
   if(relative==='breathing.html'&&url.searchParams.has('wrong-layer'))body=Buffer.from(body.toString().replace('data-content-layer="physiology-tool"','data-content-layer="scripture"'));
   if(relative==='breathing.html'&&url.searchParams.has('wrong-practice'))body=Buffer.from(body.toString().replace('data-practice-kind="paced-breathing"','data-practice-kind="simran"'));
   const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
   response.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});response.end(body);
  }catch{response.writeHead(404);response.end('Not found');}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});report.browser=browser.version();

 await scenario('The guide loads idle, defaults to no holds, and states its comfort and medical limits',async page=>{
  await stopped(page);assert.equal(await page.locator('html').getAttribute('data-content-layer'),'physiology-tool');
  assert.equal(await page.locator('#breathing-pattern').inputValue(),'even');assert.equal(await page.locator('#breathing-pace').inputValue(),'standard');
  assert.equal(await page.locator('#hold-notice').isVisible(),false);assert.equal(await page.locator('#skip-holds').isVisible(),false);
  assert.match(await page.locator('#comfort').textContent(),/gentle.*without taking bigger breaths/s);
  assert.match(await page.locator('#caution').textContent(),/Stop if.*dizzy.*normal breathing.*not treatment.*does not replace medical care/s);
  assert.equal(await page.locator('audio,video,iframe').count(),0);
  assert.match(await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content'),/connect-src 'none'; media-src 'none'/);
  assert.equal(await page.locator('#phase-count').getAttribute('aria-hidden'),'true');
  assert.equal(await page.locator('#phase').getAttribute('aria-live'),'polite');
  await screenshot(page,'ready-390.png');
 });

 await scenario('Chromium exposes the box hold warning to assistive technology only when box breathing is selected',async page=>{
  const accessibility=await page.context().newCDPSession(page);
  try{
   async function startDescription(selection){
    const {nodes}=await accessibility.send('Accessibility.getFullAXTree');
    const candidates=nodes.filter(node=>!node.ignored&&node.role?.value==='button'&&node.name?.value==='Begin breathing guide');
    assert.equal(candidates.length,1,'Exactly one exposed Begin button must be present in the accessibility tree.');
    const description=candidates[0].description?.value;
    assert.equal(typeof description,'string','The Begin button must expose its safety description.');
    assert.match(description,/Keep the breath gentle/);
    assert.match(description,/does not replace medical care/);
    report.accessibleDescriptions.push({selection,description});
    return description;
   }
   assert.doesNotMatch(await startDescription('default even'),/Box breathing includes two holds|Do not strain or wait for the cue/);
   await selectPattern(page,'longer-exhale');
   assert.doesNotMatch(await startDescription('longer exhale'),/Box breathing includes two holds|Do not strain or wait for the cue/);
   await selectPattern(page,'box');
   const boxDescription=await startDescription('box');
   assert.match(boxDescription,/Box breathing includes two holds/);
   assert.match(boxDescription,/Do not strain or wait for the cue if you need to breathe/);
   await page.locator('#skip-holds').click();
   assert.equal(await page.locator('#breathing-pattern').inputValue(),'even');
   assert.doesNotMatch(await startDescription('even after switching away from holds'),/Box breathing includes two holds|Do not strain or wait for the cue/);
  }finally{await accessibility.detach();}
 });

 for(const id of core.ids){
  await scenario(`Standard ${id}: all phase boundaries, labels and current-step indicators follow the actual browser clock`,async page=>{
   await useClock(page);await selectPattern(page,id);const pattern=core.getPattern(id);
   if(id==='box'){
    assert.equal(await page.locator('#hold-notice').isVisible(),true);
    assert.match(await page.locator('#hold-notice').textContent(),/Do not strain|need to breathe/);
    assert.equal(await page.locator('.box-track').isVisible(),true);
    assert.equal(await page.locator('#phase-sequence li').count(),4);
   }
   await page.locator('#breathing-start').focus();await page.keyboard.press('Enter');
   assert.equal(await page.locator('#breathing-stop').evaluate(element=>element===document.activeElement),true);
   let elapsed=0,offset=0;
   async function advanceTo(target){await page.clock.runFor(target-elapsed);elapsed=target;}
   for(let index=0;index<pattern.phases.length;index++){
    const part=pattern.phases[index];
    assert.equal(await stage(page).getAttribute('data-phase'),part.kind);
    assert.equal(await phase(page).textContent(),part.label);
    assert.equal(await page.locator('#phase-sequence li[aria-current="step"]').count(),1);
    assert.equal(await page.locator('#phase-sequence li').nth(index).getAttribute('aria-current'),'step');
    await advanceTo(offset+part.durationMs-32);
    assert.equal(await stage(page).getAttribute('data-phase'),part.kind);
    assert.equal(await page.locator('#phase-count').textContent(),'1');
    await advanceTo(offset+part.durationMs+32);
    assert.equal(await stage(page).getAttribute('data-phase'),pattern.phases[(index+1)%pattern.phases.length].kind);
    offset+=part.durationMs;
   }
   await stop(page);await page.clock.runFor(20000);await stopped(page);
  });
 }

 for(const id of ['even','box']){
  await scenario(`Shorter ${id}: adapted timings are labelled and used in the pacer`,async page=>{
   await useClock(page);await selectPattern(page,id);await selectPace(page,'shorter');
   assert.match(await page.locator('#pace-adaptation').textContent(),/comfort adaptation.*not the exact timing/s);
   const pattern=core.getPattern(id,'shorter');
   assert.match(await page.locator('#pace-label').textContent(),new RegExp(pattern.phases[0].durationMs/1000+' seconds in'));
   await begin(page);await page.clock.runFor(pattern.phases[0].durationMs-32);assert.equal(await stage(page).getAttribute('data-phase'),'in');
   await page.clock.runFor(64);assert.equal(await stage(page).getAttribute('data-phase'),pattern.phases[1].kind);await stop(page);
  });
 }

 await scenario('The box marker follows its sides while the circle stays fixed during a hold',async page=>{
  await useClock(page);await selectPattern(page,'box');await begin(page);
  await page.clock.runFor(2000);
  let marker=await page.locator('#box-dot').evaluate(element=>({x:Number(element.getAttribute('cx')),y:Number(element.getAttribute('cy'))}));
  assert.ok(Math.abs(marker.x-50)<1.5);assert.equal(marker.y,7);
  await page.clock.runFor(2100);assert.equal(await stage(page).getAttribute('data-phase'),'hold-in');
  const held=await page.locator('#pacer-orb').evaluate(element=>getComputedStyle(element).transform);
  await page.clock.runFor(1900);
  assert.equal(await page.locator('#pacer-orb').evaluate(element=>getComputedStyle(element).transform),held);
  marker=await page.locator('#box-dot').evaluate(element=>({x:Number(element.getAttribute('cx')),y:Number(element.getAttribute('cy'))}));
  assert.equal(marker.x,93);assert.ok(Math.abs(marker.y-50)<1.5);await stop(page);
 });

 await scenario('Pausing during a hold gives a neutral cue; restart begins a fresh inhale',async page=>{
  await useClock(page);await selectPattern(page,'box');await begin(page);await page.clock.runFor(4100);
  assert.equal(await stage(page).getAttribute('data-phase'),'hold-in');await page.locator('#breathing-pause').click();
  assert.equal(await stage(page).getAttribute('data-state'),'paused');assert.equal(await stage(page).getAttribute('data-phase'),null);
  assert.equal(await phase(page).textContent(),'Breathe naturally');assert.equal(await page.locator('#phase-count').textContent(),'');
  assert.equal(await page.locator('#phase-sequence li[aria-current]').count(),0);
  assert.equal(await page.locator('#breathing-start').evaluate(element=>element===document.activeElement),true);
  await page.clock.runFor(9000);assert.equal(await phase(page).textContent(),'Breathe naturally');
  await begin(page);assert.equal(await stage(page).getAttribute('data-phase'),'in');assert.equal(await page.locator('#phase-count').textContent(),'4');
  await page.clock.runFor(3500);assert.equal(await stage(page).getAttribute('data-phase'),'in');await stop(page);
 });

 await scenario('Switching away from holds selects 4:4, stops, and requires a fresh Start',async page=>{
  await useClock(page);await selectPattern(page,'box');await begin(page);await page.clock.runFor(4100);
  await page.locator('#skip-holds').click();await stopped(page);
  assert.equal(await page.locator('#breathing-pattern').inputValue(),'even');assert.equal(await page.locator('#breathing-pace').inputValue(),'shorter');
  assert.equal(await page.locator('#hold-notice').isVisible(),false);assert.equal(await page.locator('#skip-holds').isVisible(),false);
  assert.match(await page.locator('#pace-label').textContent(),/4 seconds in.*4 seconds out.*No holds/);
  await page.clock.runFor(16000);await stopped(page);await begin(page);assert.equal(await stage(page).getAttribute('data-phase'),'in');await stop(page);
 });

 await scenario('Changing a pattern or pace stops a running guide instead of inheriting its clock',async page=>{
  await useClock(page);await begin(page);await page.clock.runFor(3000);await selectPattern(page,'longer-exhale');await stopped(page);
  await begin(page);await page.clock.runFor(5000);assert.equal(await stage(page).getAttribute('data-phase'),'out');
  await selectPace(page,'shorter');await stopped(page);await page.clock.runFor(12000);await stopped(page);
  await begin(page);assert.equal(await stage(page).getAttribute('data-phase'),'in');assert.equal(await page.locator('#phase-count').textContent(),'3');await stop(page);
 });

 await scenario('Invalid pattern and pace selections fail closed and can recover through a valid choice',async page=>{
  await begin(page);
  await page.locator('#breathing-pattern').evaluate(element=>{element.value='unsupported';element.dispatchEvent(new Event('change',{bubbles:true}));});
  await stopped(page);assert.equal(await page.locator('#breathing-start').isDisabled(),true);
  await page.locator('#breathing-start').evaluate(element=>element.click());await stopped(page);
  await selectPattern(page,'even');assert.equal(await page.locator('#breathing-start').isDisabled(),false);await begin(page);
  await page.locator('#breathing-pace').evaluate(element=>{element.value='unsupported';element.dispatchEvent(new Event('change',{bubbles:true}));});
  await stopped(page);assert.equal(await page.locator('#breathing-start').isDisabled(),true);
  await selectPace(page,'standard');assert.equal(await page.locator('#breathing-start').isDisabled(),false);await stopped(page);
 });

 await scenario('Escape stops a hold, exits focus view, and restores Start focus',async page=>{
  await useClock(page);await selectPattern(page,'box');await page.locator('#focus-guide').click();await begin(page);await page.clock.runFor(4100);
  await page.keyboard.press('Escape');await stopped(page);assert.equal(await page.locator('html').getAttribute('data-focus-guide'),'off');
  assert.equal(await page.locator('#focus-guide').getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator('#breathing-start').evaluate(element=>element===document.activeElement),true);await page.clock.runFor(10000);await stopped(page);
 });

 for(const initialState of ['running','paused']){
  await scenario(`Hiding a ${initialState} guide stops it; becoming visible does not resume it`,async page=>{
   await useClock(page);await begin(page);if(initialState==='paused')await page.locator('#breathing-pause').click();
   await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await stopped(page);
   await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
   await page.clock.runFor(12000);await stopped(page);
  });
 }

 await scenario('Page exit and a persisted page return leave an active guide stopped',async page=>{
  await useClock(page);await begin(page);
  await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));await stopped(page);
  await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await page.clock.runFor(15000);await stopped(page);
 });

 await scenario('A delayed animation frame stops instead of jumping into a missed hold',async page=>{
  await useClock(page);await selectPattern(page,'box');await begin(page);await page.clock.runFor(1000);
  await page.clock.fastForward(5000);await stopped(page);
  assert.match(await page.locator('#breathing-state').textContent(),/interruption/);
  await page.clock.runFor(20000);await stopped(page);
 });

 await scenario('Actual scrolling away from the visual guide stops it and returning does not restart it',async page=>{
  await begin(page);
  await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
  await page.waitForFunction(()=>document.getElementById('pacer-stage').getBoundingClientRect().bottom<=0);
  await page.waitForFunction(()=>document.getElementById('pacer-stage').dataset.state==='ready');
  assert.match(await page.locator('#breathing-state').textContent(),/off screen/);
  await page.locator('#pacer-card').scrollIntoViewIfNeeded();await stopped(page);
 });

 await scenario('A manual still guide keeps text cues moving without moving the orb or box marker',async page=>{
  await useClock(page);await selectPattern(page,'box');await page.locator('#guide-settings > summary').click();await page.locator('#show-motion').uncheck();
  await begin(page);
  const before=await page.locator('#pacer-stage').evaluate(element=>({orb:getComputedStyle(element.querySelector('#pacer-orb')).transform,x:element.querySelector('#box-dot').getAttribute('cx'),y:element.querySelector('#box-dot').getAttribute('cy')}));
  await page.clock.runFor(4100);assert.equal(await stage(page).getAttribute('data-phase'),'hold-in');
  const after=await page.locator('#pacer-stage').evaluate(element=>({orb:getComputedStyle(element.querySelector('#pacer-orb')).transform,x:element.querySelector('#box-dot').getAttribute('cx'),y:element.querySelector('#box-dot').getAttribute('cy')}));
  assert.deepEqual(after,before);assert.equal(await stage(page).getAttribute('data-motion'),'off');await stop(page);
 });

 await scenario('Reduced motion starts still, cannot accidentally be overridden, and retains phase guidance',async page=>{
  await useClock(page);await page.locator('#guide-settings > summary').click();
  assert.equal(await page.locator('#show-motion').isChecked(),false);assert.equal(await page.locator('#show-motion').isDisabled(),true);
  assert.equal(await page.locator('#motion-note').isVisible(),true);assert.equal(await stage(page).getAttribute('data-motion'),'off');
  await begin(page);const before=await page.locator('#pacer-orb').evaluate(element=>getComputedStyle(element).transform);
  await page.clock.runFor(5100);assert.equal(await phase(page).textContent(),'Breathe out');
  assert.equal(await page.locator('#pacer-orb').evaluate(element=>getComputedStyle(element).transform),before);
  await screenshot(page,'reduced-motion-390.png',false);await stop(page);
 },{reducedMotion:'reduce'});

 await scenario('A live reduced-motion preference change stops visual motion without stopping text guidance',async page=>{
  await useClock(page);await begin(page);await page.clock.runFor(1000);await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.getElementById('show-motion').disabled);
  assert.equal(await stage(page).getAttribute('data-motion'),'off');
  const before=await page.locator('#pacer-orb').evaluate(element=>getComputedStyle(element).transform);
  await page.clock.runFor(4100);assert.equal(await phase(page).textContent(),'Breathe out');
  assert.equal(await page.locator('#pacer-orb').evaluate(element=>getComputedStyle(element).transform),before);
  await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>!document.getElementById('show-motion').disabled);
  assert.equal(await page.locator('#show-motion').isChecked(),false);assert.equal(await stage(page).getAttribute('data-motion'),'off');await stop(page);
 });

 for(const viewport of [{width:320,height:568},{width:390,height:844}]){
  for(const mode of ['normal','focus']){
   for(const id of ['even','box']){
    await scenario(`${mode} view at ${viewport.width}×${viewport.height}, ${id}: keyboard access and reachable exit controls`,async page=>{
     await useClock(page);await selectPattern(page,id);await fits(page);
     if(mode==='focus'){
      await page.locator('#focus-guide').focus();await page.keyboard.press('Enter');
      assert.equal(await page.locator('html').getAttribute('data-focus-guide'),'on');
      assert.equal(await page.locator('#focus-guide').getAttribute('aria-pressed'),'true');
     }
     await page.locator('#breathing-start').focus();await page.keyboard.press('Enter');
     // Measure immediately after the app's own positioning; no locator action may scroll the controls into view first.
     await reachableControl(page,'#breathing-stop','Stop');
     if(id==='box')await reachableControl(page,'#skip-holds','Switch to no holds');
     await fits(page);
     if(mode==='focus'&&viewport.width===390&&id==='box')await screenshot(page,'box-focus-390.png',false);
     if(mode==='focus'&&viewport.width===320&&id==='even')await screenshot(page,'focus-320.png',false);
     if(mode==='normal'&&viewport.width===320&&id==='box')await screenshot(page,'box-active-320.png',false);
     await page.keyboard.press('Enter');await stopped(page);
     if(mode==='focus'){await page.locator('#focus-guide').click();assert.equal(await page.locator('html').getAttribute('data-focus-guide'),'off');}
    },{viewport});
   }
  }
 }

 await scenario('The desktop catalogue selects a pattern, mirrors the mobile selector, and fits wide layouts',async page=>{
  await fits(page);await screenshot(page,'ready-1440.png');await selectPattern(page,'longer-exhale');
  assert.equal(await page.locator('#breathing-pattern').inputValue(),'longer-exhale');
  assert.equal(await page.locator('.practice-choice[aria-pressed="true"]').getAttribute('data-pattern'),'longer-exhale');
  await begin(page);await stop(page);
  for(const width of [820,390,320]){await page.setViewportSize({width,height:900});await fits(page);}
 },{viewport:{width:1440,height:1000}});

 await scenario('The narrow active guide is captured with readable cues and an enabled Stop',async page=>{
  await useClock(page);await begin(page);await page.clock.runFor(1800);
  assert.equal(await phase(page).textContent(),'Breathe in');assert.equal(await page.locator('#breathing-stop').isEnabled(),true);
  await screenshot(page,'active-390.png',false);await stop(page);
 });

 await scenario('Research copy names its limits and local source links resolve to actual sections',async page=>{
  assert.match(await page.locator('#pattern-evidence').textContent(),/do not guarantee/);
  await selectPattern(page,'longer-exhale');assert.match(await page.locator('#pattern-evidence').textContent(),/not a requirement|promise/);
  await selectPattern(page,'box');assert.match(await page.locator('#pattern-evidence').textContent(),/small 2026 laboratory trial.*does not establish lasting benefits.*ideal pattern/s);
  assert.match(await page.locator('.practice-evidence').textContent(),/2025.*no meaningful.*mood.*blood pressure/s);
  assert.doesNotMatch(await page.locator('main').textContent(),/scientifically proven|cures? anxiety|reset your nervous system/i);
  const links=await page.locator('a[href]').evaluateAll(elements=>elements.map(element=>element.getAttribute('href')));
  for(const href of links){
   const url=new URL(href,origin+'/breathing.html');
   if(url.origin!==origin){assert.equal(url.protocol,'https:');continue;}
   const filename=path.resolve(root,'.'+url.pathname);
   assert.ok(filename.startsWith(root+path.sep));const html=await fs.readFile(filename,'utf8');
   if(url.hash){
    const id=decodeURIComponent(url.hash.slice(1));
    assert.equal(await page.evaluate(({html,id})=>[...new DOMParser().parseFromString(html,'text/html').querySelectorAll('[id]')].filter(element=>element.id===id).length,{html,id}),1,href);
   }
  }
  const sourceHTML=await fs.readFile(path.join(root,'practice-sources.html'),'utf8');
  assert.match(sourceHTML,/has not been clinically validated/);
  for(const source of ['s10484-025-09688-z','s41598-023-49279-8','PMC9873947','PMC13321280','breathing-exercises-for-stress'])assert.ok(sourceHTML.includes(source),source);
 });

 for(const parameter of ['wrong-layer','wrong-practice']){
  await scenario(`An incorrect document boundary (${parameter}) cannot activate the controller`,async page=>{
   await page.goto(origin+'/breathing.html?'+parameter+'=1');await page.waitForLoadState('load');
   assert.equal(await page.locator('#breathing-start').isDisabled(),true);assert.equal(await page.locator('#breathing-pattern').isDisabled(),true);
   assert.equal(await stage(page).getAttribute('data-state'),'ready');
  });
 }

 await check('No runtime errors, failed requests, external requests, storage access or cookies occurred',()=>{
  assert.deepEqual(report.runtimeErrors,[]);assert.deepEqual(report.requestFailures,[]);assert.deepEqual(report.externalRequests,[]);
  assert.ok(report.privacyChecks.length>20,'Privacy checks must have run across the interactive scenarios.');
  for(const {name,...value} of report.privacyChecks)assert.deepEqual(value,{storageReads:0,storageWrites:0,fetches:0,indexedDBOpens:0,beacons:0,cookies:0},name);
 });
}catch(error){report.checks.push({name:'Harness setup/completion',status:'failed',error:error.stack||String(error)});}
finally{
 for(const context of contexts)await context.close().catch(()=>{});await browser?.close();
 if(server)await new Promise(resolve=>server.close(resolve));
 report.finishedAt=new Date().toISOString();report.passed=report.checks.filter(item=>item.status==='passed').length;report.failed=report.checks.filter(item=>item.status==='failed').length;
 await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({passed:report.passed,failed:report.failed,failures:report.checks.filter(item=>item.status==='failed'),report:'evidence/breathing/report.json'}));
 if(report.failed)process.exitCode=1;
}
