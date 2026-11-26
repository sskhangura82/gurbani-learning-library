// Desktop Chromium checks for a silent, independent physiological breathing tool.
// Synthetic isolated localhost only. No device, VoiceOver or clinical validation claim.
// Run: CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/breathing-browser.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {chromium} from 'playwright';
const require=createRequire(import.meta.url),root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const core=require('../js/breathing-core.js'),out=path.join(root,'evidence/breathing');
const report={startedAt:new Date().toISOString(),browser:null,checks:[],runtimeErrors:[],screenshots:[],limitations:[
 'Desktop Chromium with narrow viewport emulation only. No physical iPhone, Safari, VoiceOver or human usability acceptance.',
 'Visibility suspension is tested with a synthetic hidden-state event; mobile background timing needs a real-device check.',
 'Research copy awaits independent review; browser checks do not establish clinical efficacy or safety for an individual.'
]};
const contexts=[];let server,browser,origin,page;
const inputs=['breathing.html','css/breathing.css','js/breathing-core.js','js/breathing.js','tests/breathing-browser.mjs'];
async function check(name,fn){try{await fn();report.checks.push({name,status:'passed'});}catch(error){report.checks.push({name,status:'failed',error:error.stack||String(error)});}}
async function makePage(options={}){
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',...options});contexts.push(context);
 await context.addInitScript(()=>{
  window.__breathingObservations={storageReads:0,storageWrites:0,fetches:0};
  const read=Storage.prototype.getItem,write=Storage.prototype.setItem;
  Storage.prototype.getItem=function(...args){window.__breathingObservations.storageReads++;return read.apply(this,args);};
  Storage.prototype.setItem=function(...args){window.__breathingObservations.storageWrites++;return write.apply(this,args);};
  const fetch=window.fetch;window.fetch=function(...args){window.__breathingObservations.fetches++;return fetch.apply(this,args);};
 });
 const item=await context.newPage();item.setDefaultTimeout(12000);item.on('pageerror',error=>report.runtimeErrors.push(error.message));
 await item.goto(origin+'/breathing.html');await item.waitForFunction(()=>!document.getElementById('breathing-start').disabled);
 return item;
}
async function layout(item,width){await item.setViewportSize({width,height:900});assert.ok(await item.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
async function screenshot(item,name){await item.screenshot({path:path.join(out,name),fullPage:true});report.screenshots.push('evidence/breathing/'+name);}
try{
 await fs.mkdir(out,{recursive:true});report.inputSha256={};for(const item of inputs)report.inputSha256[item]=createHash('sha256').update(await fs.readFile(path.join(root,item))).digest('hex');
 await check('The physiology contract has exactly two equal phases and no configurable holding phase',()=>{
  assert.equal(core.spec.kind,'physiology-tool');assert.equal(core.spec.practice,'paced-breathing');assert.equal(core.spec.cycleMs,10000);
  assert.deepEqual(core.spec.phases.map(p=>[p.kind,p.durationMs]),[['in',5000],['out',5000]]);
  assert.ok(Object.isFrozen(core)&&Object.isFrozen(core.spec)&&Object.isFrozen(core.spec.phases)&&core.spec.phases.every(Object.isFrozen));
  for(let ms=0;ms<=30000;ms+=10){const frame=core.frame(ms);assert.ok(['in','out'].includes(frame.phase));assert.ok(frame.scale>=.66&&frame.scale<=1);}
  assert.equal(core.frame(0).phase,'in');assert.equal(core.frame(4999).phase,'in');assert.equal(core.frame(5000).phase,'out');assert.equal(core.frame(9999).phase,'out');assert.equal(core.frame(10000).phase,'in');
  assert.equal(core.frame(0).scale,.66);assert.equal(core.frame(5000).scale,1);assert.equal(core.frame(10000).scale,.66);
 });
 server=http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,'http://localhost');if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
  const relative=decodeURIComponent(url.pathname).slice(1)||'breathing.html',file=path.resolve(root,relative);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  let body=await fs.readFile(file);if(relative==='breathing.html'&&url.searchParams.get('wrong-layer'))body=Buffer.from(body.toString().replace('data-content-layer="physiology-tool"','data-content-layer="scripture"'));
  const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'};
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
 }catch{res.writeHead(404);res.end('Not found');}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});report.browser=browser.version();page=await makePage();
 await check('The tool is explicitly physiological, starts idle and includes comfort and not-treatment instructions',async()=>{
  assert.equal(await page.locator('html').getAttribute('data-content-layer'),'physiology-tool');assert.equal(await page.locator('#pacer-stage').getAttribute('data-state'),'ready');
  assert.match(await page.locator('#comfort').textContent(),/without taking bigger breaths.*no holding/s);assert.match(await page.locator('#caution').textContent(),/Stop if.*not treatment.*does not replace medical care/s);
  assert.equal(await page.locator('audio,video,iframe').count(),0);assert.match(await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content'),/connect-src 'none'; media-src 'none'/);
 });
 await check('All three source links resolve to in-page references and no unsupported individual outcome is promised',async()=>{
  for(const href of await page.locator('.citation').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href'))))assert.equal(await page.locator(href).count(),1);
  assert.equal(await page.locator('.references a').count(),3);assert.match(await page.locator('.research-copy').textContent(),/six breaths per minute will not suit everyone/);
  assert.match(await page.locator('.research-copy').textContent(),/has not been clinically validated/);
 });
 await check('Layout fits at 320, 390, 820 and 1440 pixels with a usable Stop target',async()=>{
  for(const width of [320,390,820,1440])await layout(page,width);
  await layout(page,390);await screenshot(page,'ready-390.png');
  await page.locator('#breathing-start').click();const bounds=await page.locator('#breathing-stop').boundingBox();assert.ok(bounds.width>=44&&bounds.height>=44);await page.locator('#breathing-stop').click();
 });
 await check('Keyboard activation starts immediately with inhale, reaches exhale at five seconds and inhale at ten without a hold',async()=>{
  await page.clock.install();await page.clock.pauseAt(new Date());
  await page.locator('#breathing-start').focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('#phase').textContent(),'Breathe in');assert.equal(await page.locator('#breathing-stop').evaluate(el=>el===document.activeElement),true);
  await page.clock.runFor(5100);assert.equal(await page.locator('#phase').textContent(),'Breathe out');
  await page.clock.runFor(5000);assert.equal(await page.locator('#phase').textContent(),'Breathe in');
  assert.equal(await page.locator('#breathing-start').isVisible(),false);await screenshot(page,'active-390.png');
 });
 await check('Stopping cancels the guide and restores keyboard focus without storing a session',async()=>{
  await page.locator('#breathing-stop').click();assert.equal(await page.locator('#pacer-stage').getAttribute('data-state'),'ready');assert.equal(await page.locator('#breathing-start').evaluate(el=>el===document.activeElement),true);
  await page.clock.runFor(15000);assert.equal(await page.locator('#phase').textContent(),'Ready when you are');assert.equal(await page.locator('#breathing-stop').isVisible(),false);
 });
 await check('Motion can be turned off while the guide remains usable through words',async()=>{
  await page.locator('#show-motion').uncheck();await page.locator('#breathing-start').click();const before=await page.locator('#pacer-orb').evaluate(el=>getComputedStyle(el).transform);
  await page.clock.runFor(5100);const after=await page.locator('#pacer-orb').evaluate(el=>getComputedStyle(el).transform);assert.equal(before,after);assert.equal(await page.locator('#phase').textContent(),'Breathe out');await page.locator('#breathing-stop').click();
 });
 await check('A hidden-page event stops the guide and returning does not restart it',async()=>{
  await page.locator('#breathing-start').click();await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  assert.equal(await page.locator('#pacer-stage').getAttribute('data-state'),'ready');await page.clock.runFor(10000);assert.equal(await page.locator('#phase').textContent(),'Ready when you are');
 });
 await check('Page exit and a persisted return leave the guide stopped',async()=>{
  await page.locator('#breathing-start').click();await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));assert.equal(await page.locator('#pacer-stage').getAttribute('data-state'),'ready');
  await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));assert.equal(await page.locator('#breathing-stop').isVisible(),false);
 });
 await check('The guide never reads or writes web storage, fetches data or creates cookies',async()=>{
  assert.deepEqual(await page.evaluate(()=>window.__breathingObservations),{storageReads:0,storageWrites:0,fetches:0});assert.equal((await page.context().cookies()).length,0);
 });
 const reduced=await makePage({reducedMotion:'reduce'});
 await check('Reduced-motion preference disables animation initially and cannot be overridden accidentally',async()=>{
  assert.equal(await reduced.locator('#show-motion').isChecked(),false);assert.equal(await reduced.locator('#pacer-stage').getAttribute('data-motion'),'off');
  assert.equal(await reduced.locator('#show-motion').isDisabled(),true);assert.equal(await reduced.locator('#motion-note').isVisible(),true);assert.equal(await reduced.locator('#pacer-stage').getAttribute('data-motion'),'off');await reduced.locator('#breathing-start').click();await screenshot(reduced,'reduced-motion-390.png');await reduced.locator('#breathing-stop').click();
 });
 await check('A mismatched content layer cannot start the physiological controller',async()=>{
  const blocked=await reduced.context().newPage();await blocked.goto(origin+'/breathing.html?wrong-layer=1');await blocked.waitForLoadState('load');assert.equal(await blocked.locator('#breathing-start').isDisabled(),true);assert.equal(await blocked.locator('#pacer-stage').getAttribute('data-state'),'ready');await blocked.close();
 });
 await check('No runtime JavaScript failures occurred',()=>assert.deepEqual(report.runtimeErrors,[]));
}catch(error){report.checks.push({name:'Harness setup/completion',status:'failed',error:error.stack||String(error)});}
finally{
 for(const context of contexts)await context.close().catch(()=>{});await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));
 report.finishedAt=new Date().toISOString();report.passed=report.checks.filter(item=>item.status==='passed').length;report.failed=report.checks.filter(item=>item.status==='failed').length;
 await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({passed:report.passed,failed:report.failed,failures:report.checks.filter(item=>item.status==='failed'),report:'evidence/breathing/report.json'}));if(report.failed)process.exitCode=1;
}
