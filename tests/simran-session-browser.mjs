// Local browser checks for the existing silent room. Synthetic clocks and storage only.
// CHROMIUM_PATH is optional. No physical-device or VoiceOver result is claimed.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
const root=fileURLToPath(new URL('../',import.meta.url));
const evidence=path.join(root,'evidence/simran-session');
const baseline=process.env.SIMRAN_TEST_BASELINE==='1';
const original=execFileSync('git',['show','792afa209c98bb53f257a8dfd5500bef10bfc8e3:simran.html'],{cwd:root,encoding:'utf8'});
const originalLine=original.match(/<p class="gurbani-line" lang="pa">([^<]+)<\/p>/)[1];
const report={startedAt:new Date().toISOString(),engine:'Chromium',browserVersion:null,baseline,checks:[],errors:[],limitations:['Desktop Chromium with narrow viewports and a simulated clock; not a physical iPhone, iOS Safari or VoiceOver check.','Visibility and pagehide lifecycle events are simulated explicitly; this does not certify physical background timing.','No qualified interpretation or printed-page collation performed.']};
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root)){res.writeHead(403).end();return;}
  const data=baseline&&['/simran.html','/js/simran.js','/css/simran.css'].includes(pathname)?execFileSync('git',['show','792afa209c98bb53f257a8dfd5500bef10bfc8e3:'+pathname.slice(1)],{cwd:root}):await fs.readFile(file);
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(data);
 }catch{res.writeHead(404).end();}
});
let browser,context,page,origin;
await fs.mkdir(evidence,{recursive:true});
const checks=async(name,run)=>{if(baseline&&!/Exact original|Beginning by keyboard|Pagehide pauses/.test(name))return;try{if(baseline)await page.goto(origin+'/simran.html');await run();report.checks.push({name,status:'passed'});}catch(e){report.checks.push({name,status:'failed',error:e.message});}};
async function noClock(){
 assert.equal(await page.locator('[role="timer"]').count(),0,'No live timer is present');
 assert.equal(await page.locator('#sit-setup').isVisible(),false,'Pre-sitting duration choices are hidden');
 const accessible=await page.locator('body').ariaSnapshot();
 assert.doesNotMatch(accessible,/\b(?:3|5|10|15) min\b|quiet boundary of|Time remaining|\d\d:\d\d/,'No chosen duration or time appears in the accessible tree');
 assert.doesNotMatch(await page.locator('body').innerText(),/\b(?:3|5|10|15) min\b|quiet boundary of|\d\d:\d\d/,'No chosen duration or time appears visually');
}
try{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});report.browserVersion=browser.version();
 context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 await page.clock.install({time:new Date('2026-11-26T12:00:00Z')});
 await page.goto(origin+'/simran.html');
 await page.evaluate(()=>{localStorage.setItem('glp001.synthetic.unrelated','SYNTHETIC reflection — preserve');sessionStorage.setItem('glp001.synthetic.session','SYNTHETIC unrelated state');});
 const storageBefore=await page.evaluate(()=>({local:{...localStorage},session:{...sessionStorage}}));
 await checks('Exact original Gurmukhi retained with Punjabi language; no unreviewed Ang assertion',async()=>{
  assert.equal(await page.locator('.gurbani-line').textContent(),originalLine);assert.equal(await page.locator('.gurbani-line').getAttribute('lang'),'pa');
  assert.ok((await page.locator('.learning-boundary').first().innerText()).includes('PAURI 4'));
  assert.doesNotMatch(await page.locator('.learning-boundary').first().innerText(),/ANG 2|See source Ang 2/);
 });
 await checks('Beginning by keyboard removes the chosen duration from view and accessible tree',async()=>{
  await page.locator('[data-minutes="3"]').click();await page.locator('#sit-start').focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('#sit-start').textContent(),'Pause');await noClock();
 });
 await checks('Pause keeps time invisible; resume preserves the remaining chosen interval',async()=>{
  await page.clock.fastForward(60_000);await page.locator('#sit-start').click();assert.equal(await page.locator('#sit-start').textContent(),'Resume');await noClock();
  await page.clock.fastForward(360_000);assert.equal(await page.locator('#sit-start').textContent(),'Resume');
  await page.locator('#sit-start').click();await noClock();await page.clock.fastForward(119_000);assert.equal(await page.locator('#sit-start').textContent(),'Pause');
  await page.clock.fastForward(2_000);assert.equal(await page.locator('#sit-start').textContent(),'Begin again');
  assert.equal(await page.locator('#sit-state').textContent(),'Your quiet sitting has ended. Nothing was recorded.');
 });
 await checks('Completion makes one silent message and does not keep announcing on later ticks',async()=>{
  await page.evaluate(()=>{window.syntheticEndChanges=0;window.syntheticObserver=new MutationObserver(()=>window.syntheticEndChanges++);window.syntheticObserver.observe(document.getElementById('sit-state'),{childList:true,subtree:true,characterData:true});});
  await page.clock.fastForward(1_000_000);assert.equal(await page.evaluate(()=>window.syntheticEndChanges),0);
  assert.equal(await page.locator('audio,video').count(),0);assert.equal(await page.locator('#sit-stop').isVisible(),false);assert.equal(await page.locator('#sit-setup').isVisible(),true);
  await page.evaluate(()=>window.syntheticObserver.disconnect());
 });
 await checks('Pagehide pauses before Back/Forward cache restoration, with a working Resume button',async()=>{
  await page.locator('[data-minutes="5"]').click();await page.locator('#sit-start').click();await page.clock.fastForward(30_000);
  await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));
  await page.clock.fastForward(600_000);await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  assert.equal(await page.locator('#sit-start').textContent(),'Resume');await noClock();
  await page.locator('#sit-start').click();await page.clock.fastForward(269_000);assert.equal(await page.locator('#sit-start').textContent(),'Pause');
  await page.clock.fastForward(2_000);assert.equal(await page.locator('#sit-start').textContent(),'Begin again');
 });
 await checks('Hidden-page pause keeps remaining time; ending early restores preparation controls',async()=>{
  await page.locator('#sit-start').click();await page.clock.fastForward(10_000);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  assert.equal(await page.locator('#sit-start').textContent(),'Resume');await noClock();
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await page.locator('#sit-stop').click();assert.equal(await page.locator('#sit-start').textContent(),'Begin quiet sitting');assert.equal(await page.locator('#sit-setup').isVisible(),true);
 });
 await checks('All four offered lengths end at their chosen boundary without a countdown',async()=>{
  for(const minutes of [3,5,10,15]){
   await page.locator('[data-minutes="'+minutes+'"]').click();assert.equal(await page.locator('[data-minutes="'+minutes+'"]').getAttribute('aria-pressed'),'true');
   await page.locator('#sit-start').click();await noClock();await page.clock.fastForward(minutes*60_000-1_000);assert.equal(await page.locator('#sit-start').textContent(),'Pause');
   await page.clock.fastForward(2_000);assert.equal(await page.locator('#sit-start').textContent(),'Begin again');
  }
 });
 await checks('Preparing and active layouts fit narrow and wide desktop viewports',async()=>{
  for(const width of [320,390,820,1440]){
   await page.setViewportSize({width,height:900});
   for(const active of [false,true]){
    if(active)await page.locator('#sit-start').click();
    const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,gurmukhiSize:parseFloat(getComputedStyle(document.querySelector('.gurbani-line')).fontSize)}));assert.ok(layout.scroll<=layout.width+1,JSON.stringify(layout));assert.ok(layout.gurmukhiSize>=23,'The scripture anchor must retain its intended readable size');
    if(width===390&&!baseline)await page.screenshot({path:path.join(evidence,active?'active-390.png':'ready-390.png'),fullPage:true});
    if(active){await noClock();await page.locator('#sit-stop').click();}
   }
  }
 });
 await checks('No session record, metrics or unrelated-learning change',async()=>{
  assert.deepEqual(await page.evaluate(()=>({local:{...localStorage},session:{...sessionStorage}})),storageBefore);
  assert.deepEqual(report.errors,[]);
 });
}finally{
 report.finishedAt=new Date().toISOString();report.passed=report.checks.filter(x=>x.status==='passed').length;report.failed=report.checks.filter(x=>x.status==='failed').length;
 await fs.writeFile(path.join(evidence,baseline?'baseline.json':'report.json'),JSON.stringify(report,null,2)+'\n');
 await context?.close();await browser?.close();await new Promise(resolve=>server.close(resolve));
 console.log(JSON.stringify(report,null,2));
}
if(report.failed)process.exitCode=1;
