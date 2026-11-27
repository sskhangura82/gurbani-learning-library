// Focused resume regression. Fresh profiles and synthetic learning only.
// CHROMIUM_PATH=... node tests/sukhmani-resume-browser.mjs [--source-ref COMMIT]
// EVIDENCE_DIR optionally chooses a parent directory; each run is timestamped.
// Genuine BFCache uses installed full Chrome, independently of the default shell:
// BFCACHE_CHROMIUM_PATH, then existing CHROMIUM_PATH, otherwise channel:'chrome'.
// An unavailable browser or a cold return fails; neither is converted to a pass.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const refIndex=process.argv.indexOf('--source-ref'),ref=refIndex<0?null:process.argv[refIndex+1];
if(refIndex>=0&&!/^[0-9a-f]{40}$/.test(ref||''))throw Error('Use a full frozen source commit.');
const out=path.join(process.env.EVIDENCE_DIR||path.join(root,'evidence','sukhmani-resume'),new Date().toISOString().replace(/[:.]/g,'-'));
const KEY='glp001.sukhmani.v1',JAPJI='glp001.continuous.v2',PREFIX='/gurbani-learning-library/';
const target='sukhmani.a01.p01.l02',later='sukhmani.a06.p02.l07',NOTE='SYNTHETIC ਸਿੱਖਣ ਦਾ ਨੋਟ — resume regression only';
const seed=id=>({version:2,read:id,guide:'sukhmani.a02.p01.l02',hasGuided:true,mode:'read',theme:'day',size:30,pace:70,pronunciation:false,bookmarks:[id],notes:{[id]:NOTE}});
const report={startedAt:new Date().toISOString(),source:ref||'working-tree',caseFilter:process.env.CASE_FILTER||null,checks:[],runtimeErrors:[],externalRequests:[],limitations:['Fresh desktop Chrome emulation only; no physical iPhone, Safari, VoiceOver or airplane-mode acceptance.','PR47 linked-visit behavior is deliberately outside this repair.','Waits exceed the existing 200 ms scroll debounce; assertions cover both logical occurrence and actual geometry.','Inherited rapid scrolling followed by leaving within 200 ms is outside this bounded repair; navigation cases settle for 450 ms first.']};
const cached=new Map(),types={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.json':'application/json;charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png'};
let server,browser,origin,activePage;
async function bytes(file){if(!ref)return fs.readFile(path.join(root,file));if(!cached.has(file))cached.set(file,execFileSync('git',['-C',root,'show',ref+':'+file],{maxBuffer:32*1024*1024}));return cached.get(file);}
const launch=extra=>chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),...extra});
async function browserIdentity(instance,selection){
 const cdp=await instance.newBrowserCDPSession();
 try{
  const protocol=await cdp.send('Browser.getVersion'),processes=await cdp.send('SystemInfo.getProcessInfo');
  const pid=processes.processInfo.find(p=>p.type==='browser')?.id;
  if(!Number.isInteger(pid))throw Error('The launched browser process could not be identified.');
  const actualExecutable=process.platform==='linux'?await fs.readlink('/proc/'+pid+'/exe'):process.platform==='darwin'?execFileSync('ps',['-p',String(pid),'-o','comm='],{encoding:'utf8'}).trim():null;
  return {...selection,browserVersion:instance.version(),product:protocol.product,revision:protocol.revision,actualExecutable,platform:process.platform,headless:true};
 }finally{await cdp.detach();}
}

async function fresh({width=390,initial=seed(target),browserInstance=browser,query=''}={}){
 const context=await browserInstance.newContext({viewport:{width,height:844},deviceScaleFactor:1,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(({KEY,JAPJI,initial})=>{
  if(initial&&localStorage.getItem(KEY)===null)localStorage.setItem(KEY,JSON.stringify(initial));
  if(localStorage.getItem(JAPJI)===null)localStorage.setItem(JAPJI,'SYNTHETIC untouched Japji sentinel');
  window.__resumeEvents=[];window.__resumeWrites=[];
  addEventListener('pageshow',e=>window.__resumeEvents.push({event:'pageshow',persisted:e.persisted,t:performance.now()}));
  addEventListener('pagehide',e=>window.__resumeEvents.push({event:'pagehide',persisted:e.persisted,t:performance.now()}));
  const set=Storage.prototype.setItem;
  Storage.prototype.setItem=function(k,v){const result=set.call(this,k,v);if(this===localStorage&&k===KEY)window.__resumeWrites.push({t:performance.now(),value:v});return result;};
 },{KEY,JAPJI,initial});
 context.on('request',r=>{const u=new URL(r.url());if(/^https?:$/.test(u.protocol)&&u.origin!==origin)report.externalRequests.push(u.origin+u.pathname);});
 const page=await context.newPage();activePage=page;page.setDefaultTimeout(10000);
 page.on('pageerror',e=>report.runtimeErrors.push(e.message));
 await page.goto(origin+PREFIX+'sukhmani.html'+query);await ready(page);
 return {context,page};
}
async function ready(page){await page.waitForFunction(()=>document.querySelectorAll('#sukhmani-text .sk-line').length===2027);await page.evaluate(()=>document.fonts.ready);}
const stored=page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
async function snap(page,id){return page.evaluate(({KEY,id})=>{const r=document.getElementById(id).getBoundingClientRect();return {stored:JSON.parse(localStorage.getItem(KEY)),current:document.querySelector('.sk-line[data-current="true"]')?.id,top:r.top,bottom:r.bottom,scrollY,noticeHidden:document.getElementById('resume-notice').hidden,navigation:performance.getEntriesByType('navigation')[0]?.type,events:window.__resumeEvents,writes:window.__resumeWrites};},{KEY,id});}
async function settled(page,id,expected){await page.waitForTimeout(450);const s=await snap(page,id);assert.equal(s.stored.read,id);assert.equal(s.current,id);assert.ok(s.top>=-1&&s.top<65,'Chosen occurrence must start in the reading viewport; top='+s.top);assert.ok(s.bottom>34);if(expected){for(const field of ['notes','bookmarks','mode','theme','size','pace','pronunciation','guide','hasGuided'])assert.deepEqual(s.stored[field],expected[field],field+' preserved');}assert.equal(await page.evaluate(k=>localStorage.getItem(k),JAPJI),'SYNTHETIC untouched Japji sentinel');return s;}
async function check(name,fn){if(process.env.CASE_FILTER&&!new RegExp(process.env.CASE_FILTER).test(name))return;const c={name};report.checks.push(c);try{c.evidence=await fn();c.status='passed';}catch(e){c.status='failed';c.error=e.stack||String(e);if(activePage&&!activePage.isClosed()){try{c.snapshot=await snap(activePage,target);c.screenshot='failure-'+report.checks.length+'.png';await activePage.screenshot({path:path.join(out,c.screenshot)});}catch{}}}console.log(JSON.stringify({name,status:c.status,error:c.error}));}
async function closeDialog(page){if(await page.locator('#sk-dialog').evaluate(d=>d.open)){await page.locator('#sk-dialog-close').click();await page.waitForFunction(()=>!document.getElementById('sk-dialog').open);}}
async function chooseStoredByScroll(page,id){await page.locator('.sk-line[data-line-id="'+id+'"]').evaluate(n=>n.scrollIntoView({block:'start',behavior:'instant'}));await page.waitForFunction(({KEY,id})=>JSON.parse(localStorage.getItem(KEY)).read===id,{KEY,id});}
try{
 await fs.mkdir(out,{recursive:true});
 report.runtimeSha256=createHash('sha256').update(await bytes('js/sukhmani-reader.js')).digest('hex');
 report.testSha256=createHash('sha256').update(await fs.readFile(fileURLToPath(import.meta.url))).digest('hex');
 server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost'),pathname=decodeURIComponent(u.pathname);if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}if(pathname===PREFIX+'resume-away.html'){res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'max-age=60'}).end('<!doctype html><title>Disposable navigation fixture</title><a href="sukhmani.html">Return to Sukhmani</a>');return;}if(!pathname.startsWith(PREFIX))throw Error('path');const file=pathname.slice(PREFIX.length)||'index.html';if(file.includes('..')||file.startsWith('/'))throw Error('path');const body=await bytes(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'max-age=0'}).end(body);}catch{res.writeHead(404).end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port;browser=await launch();report.browser=browser.version();report.browserLanes={ordinary:await browserIdentity(browser,{requestedChannel:null,requestedExecutable:process.env.CHROMIUM_PATH||null,selection:process.env.CHROMIUM_PATH?'CHROMIUM_PATH':'Playwright default bundled headless shell',backForwardCacheDisabledByHarness:true})};
 for(const width of [320,390])await check('Fresh entry offers Resume and keeps the selected occurrence visible after pending capture ('+width+'px)',async()=>{
  const {context,page}=await fresh({width});try{assert.equal(await page.locator('#resume-notice').isVisible(),true);const before=await stored(page);await page.evaluate(()=>{scrollTo(0,80);dispatchEvent(new Event('scroll'));});await page.locator('#resume-reading').click();const s=await settled(page,target,{...before,guide:target});assert.equal(s.noticeHidden,true);return s;}finally{await context.close();}
 });
 await check('UI-created note and bookmark survive direct reload without a delayed line shift',async()=>{
  const {context,page}=await fresh({initial:null});try{await page.locator('.sk-line[data-line-id="'+target+'"] p.tuk').click();await page.locator('#sk-reflection').fill(NOTE);await page.locator('#sk-save-reflection').click();await page.waitForFunction(({KEY,target,NOTE})=>JSON.parse(localStorage.getItem(KEY)||'{}').notes?.[target]===NOTE,{KEY,target,NOTE});for(const marked of [true,false,true]){await page.locator('#sk-bookmark').click();await page.waitForFunction(({KEY,target,marked})=>JSON.parse(localStorage.getItem(KEY)).bookmarks.includes(target)===marked,{KEY,target,marked});}await closeDialog(page);const before=await stored(page);await page.reload();await ready(page);const after=await settled(page,target,before);assert.equal(after.noticeHidden,true);assert.equal(after.writes.length,0,'Restoration itself must not save');return {before,after};}finally{await context.close();}
 });
 await check('Later manual reading restores its exact occurrence on reload; subsequent non-wheel scrolling still saves',async()=>{
  const {context,page}=await fresh({initial:seed(later)});try{await page.locator('#dismiss-resume').click();await chooseStoredByScroll(page,later);await settled(page,later);const before=await stored(page);await page.reload();await ready(page);const restored=await settled(page,later,before);assert.equal(restored.writes.length,0);const next='sukhmani.a07.p01.l02';await chooseStoredByScroll(page,next);const moved=await settled(page,next);return {restored,moved};}finally{await context.close();}
 });
 await check('Cold Back and Forward restore the saved occurrence without a Resume banner',async()=>{
  const {context,page}=await fresh({initial:seed(later)});try{await page.locator('#dismiss-resume').click();await chooseStoredByScroll(page,later);await settled(page,later);const before=await stored(page);await page.goto(origin+PREFIX+'resume-away.html');await page.goBack();await ready(page);const back=await settled(page,later,before);assert.equal(back.navigation,'back_forward');assert.equal(back.events.at(-1)?.persisted,false,'This is the explicit cold-traversal control');await page.goForward();assert.match(await page.title(),/Disposable navigation/);await page.goBack();await ready(page);const again=await settled(page,later,before);return {back,again};}finally{await context.close();}
 });
 await check('Saved-list entry opens its existing dialog without moving or rewriting the saved record',async()=>{
  const initial=seed(later),{context,page}=await fresh({initial,query:'?learning=saved'});try{await page.waitForFunction(()=>document.getElementById('sk-dialog').open);await page.waitForTimeout(450);assert.match(await page.locator('#sk-dialog-title').innerText(),/Bookmarks|Saved|reflections/);assert.deepEqual(await stored(page),initial);await page.reload();await ready(page);await page.waitForFunction(()=>document.getElementById('sk-dialog').open);await page.waitForTimeout(450);assert.deepEqual(await stored(page),initial);return {title:await page.locator('#sk-dialog-title').innerText(),state:await stored(page)};}finally{await context.close();}
 });
 await check('An explicit navigation cancels pending reload alignment',async()=>{
  const {context,page}=await fresh({initial:seed(later)});try{await page.locator('#dismiss-resume').click();await chooseStoredByScroll(page,later);await settled(page,later);await page.addInitScript(()=>{const realReady=document.fonts.ready;let release;const wait=new Promise(resolve=>release=resolve);Object.defineProperty(document.fonts,'ready',{configurable:true,get:()=>Promise.all([realReady,wait])});window.__releaseFontReadiness=release;});await page.reload();await page.waitForFunction(()=>document.querySelectorAll('#sukhmani-text .sk-line').length===2027);await page.locator('#ashtpadi-nav a').filter({hasText:/^8$/}).click();const chosen=await page.locator('.sk-line[data-current="true"]').getAttribute('id');assert.notEqual(chosen,later);await page.evaluate(()=>window.__releaseFontReadiness());const result=await settled(page,chosen);return {controlledCondition:'Font-readiness promise delayed only in this disposable fixture; explicit Ashtpadi action before release',result};}finally{await context.close();}
 });
 await check('A real wheel action during delayed reload layout wins over automatic restoration',async()=>{
  const {context,page}=await fresh({initial:seed(later)});try{
   await page.locator('#dismiss-resume').click();await chooseStoredByScroll(page,later);await settled(page,later);
   await page.addInitScript(()=>{const realReady=document.fonts.ready;let release;const wait=new Promise(resolve=>release=resolve);Object.defineProperty(document.fonts,'ready',{configurable:true,get:()=>Promise.all([realReady,wait])});window.__releaseFontReadiness=release;});
   await page.reload();await page.waitForFunction(()=>document.querySelectorAll('#sukhmani-text .sk-line').length===2027);
   const atReload=await snap(page,later);await page.mouse.move(150,400);await page.mouse.wheel(0,520);await page.waitForTimeout(450);
   const userState=await stored(page),beforeRelease=await snap(page,userState.read);
   await page.evaluate(()=>window.__releaseFontReadiness());await page.waitForTimeout(450);
   const afterRelease=await snap(page,userState.read);
   report.checks.at(-1).observations={atReload,beforeRelease,afterRelease};
   assert.notEqual(beforeRelease.scrollY,atReload.scrollY,'The real wheel action must move the viewport');
   assert.notEqual(userState.read,later,'The wheel action must be saved before readiness completes');
   assert.equal(afterRelease.scrollY,beforeRelease.scrollY,'Delayed restoration must not override the user viewport');
   assert.equal(afterRelease.top,beforeRelease.top);assert.equal(afterRelease.current,userState.read);assert.equal(afterRelease.stored.read,userState.read);
   for(const field of ['notes','bookmarks','guide','hasGuided','mode','theme','size','pace','pronunciation'])assert.deepEqual(afterRelease.stored[field],beforeRelease.stored[field]);
   return {controlledCondition:'Only font-readiness completion is delayed; movement comes from a real browser wheel event',atReload,beforeRelease,afterRelease};
  }finally{await context.close();}
 });
 await check('A genuine BFCache restoration retains the live document and its viewport',async()=>{
  // Shell151 disables BFCache at its delegate. Full151 also evicted this reader
  // and frozen389 with unisolated JavaScriptExecution; see retained CI follow-up.
  // This lane explicitly targets installed full Chrome, not a newer download.
  const executable=process.env.BFCACHE_CHROMIUM_PATH||process.env.CHROMIUM_PATH;
  const options={headless:true,...(executable?{executablePath:executable}:{channel:'chrome'}),ignoreDefaultArgs:['--disable-back-forward-cache']};
  const bfcacheBrowser=await chromium.launch(options);let context;try{report.browserLanes.bfcache=await browserIdentity(bfcacheBrowser,{requestedChannel:options.channel||null,requestedExecutable:executable||null,selection:process.env.BFCACHE_CHROMIUM_PATH?'BFCACHE_CHROMIUM_PATH':process.env.CHROMIUM_PATH?'CHROMIUM_PATH':'Installed full Chrome via channel:chrome',backForwardCacheDisabledByHarness:false});const freshPage=await fresh({initial:seed(later),browserInstance:bfcacheBrowser});context=freshPage.context;const page=freshPage.page;await page.locator('#dismiss-resume').click();await chooseStoredByScroll(page,later);await settled(page,later);await page.evaluate(()=>{window.__retainedDocument='SYNTHETIC BFCache document marker';scrollBy(0,21);});await page.waitForTimeout(450);const before=await snap(page,later);await page.goto(origin+PREFIX+'resume-away.html');await page.evaluate(()=>history.back());await page.waitForFunction(()=>location.pathname.endsWith('/sukhmani.html')&&document.querySelectorAll('#sukhmani-text .sk-line').length===2027&&window.__resumeEvents?.at(-1)?.event==='pageshow');await page.waitForTimeout(450);const after=await snap(page,later);report.browserLanes.bfcache.observation={retainedMarker:await page.evaluate(()=>window.__retainedDocument),persisted:after.events.at(-1)?.persisted,notRestoredReasons:await page.evaluate(()=>performance.getEntriesByType('navigation')[0]?.notRestoredReasons?.toJSON?.()||null)};assert.equal(await page.evaluate(()=>window.__retainedDocument),'SYNTHETIC BFCache document marker');assert.equal(after.events.at(-1)?.persisted,true,'BFCache must be observed, not inferred from Back');assert.equal(after.scrollY,before.scrollY);assert.equal(after.top,before.top);assert.equal(after.stored.read,before.stored.read);return {before,after};}finally{await context?.close();await bfcacheBrowser.close();}
 });
 await check('No runtime errors or external requests',async()=>{assert.deepEqual(report.runtimeErrors,[]);assert.deepEqual(report.externalRequests,[]);return {runtimeErrors:[],externalRequests:[]};});
}catch(e){report.harnessError=e.stack||String(e);}
finally{await browser?.close();if(server?.listening)await new Promise(resolve=>server.close(resolve));report.completedAt=new Date().toISOString();report.status=report.harnessError||report.checks.some(c=>c.status==='failed')?'failed':'passed';await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,report:path.join(out,'report.json'),failed:report.checks.filter(c=>c.status==='failed').map(c=>c.name),harnessError:report.harnessError},null,2));process.exitCode=report.status==='passed'?0:1;}
