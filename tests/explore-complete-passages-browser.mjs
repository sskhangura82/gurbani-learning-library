// Builder browser evidence only. Fresh isolated contexts, synthetic storage, no real-device claim.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {loadCompletePassages,searchCompletePassages} from '../library/passages.mjs';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))),prefix='/explore-review/';
const stamp=new Date().toISOString().replace(/[:.]/g,'-'),out=path.join(root,'evidence/explore-complete-passages/browser',stamp);
const read=n=>fs.readFile(path.join(root,n));
const catalog=await loadCompletePassages(read);
const canaryKey='glp001.explore.synthetic-canary',canary='SYNTHETIC private reflection · ਪੰਜਾਬੀ · preserve unchanged';
const report={schema:'glp.explore.complete-passages.browser.v1',startedAtUtc:new Date().toISOString(),checks:[],layouts:[],screenshots:[],requests:[],runtimeErrors:[],limitations:[
 'Desktop Chromium only; narrow viewports simulate phone layout. No physical iPhone, iPad, Safari, VoiceOver or Home Screen acceptance.',
 'Offline means browser network emulation with an actual service worker, not physical airplane-mode testing.',
 'Fresh nonpersistent profiles and synthetic storage only. This is builder evidence, not independent or qualified review.',
 'Only the 302 connected complete passages are searchable. No whole-corpus admission or printed-Ang authentication is asserted.'
]};
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
let server,browser,origin,page;const contexts=new Set();
async function check(name,run){try{const detail=await run();report.checks.push({name,status:'PASS',detail});}catch(error){report.checks.push({name,status:'FAIL',error:error.stack||String(error)});if(page&&!page.isClosed())try{await capture(page,'failure-'+report.checks.length);}catch{}throw error;}}
async function fresh({serviceWorkers='block'}={}){
 const context=await browser.newContext({serviceWorkers,viewport:{width:390,height:844},reducedMotion:'reduce'});contexts.add(context);
 await context.addInitScript(({key,value})=>{if(localStorage.getItem(key)===null)localStorage.setItem(key,value);},{key:canaryKey,value:canary});
 context.on('request',r=>report.requests.push({url:r.url(),referrer:r.headers().referer||null}));
 const p=await context.newPage();p.setDefaultTimeout(20000);p.on('pageerror',e=>report.runtimeErrors.push({path:new URL(p.url()).pathname,message:e.message}));page=p;return p;
}
async function close(p){await p.context().close();contexts.delete(p.context());}
async function ready(p){await p.waitForSelector('html[data-library-state="ready"]');await p.waitForFunction(()=>!document.getElementById('passage-submit').disabled);}
async function open(p,view='explore'){await p.goto(origin+prefix+'?view='+view,{waitUntil:'domcontentloaded'});if(view==='explore')await ready(p);else await p.waitForSelector('html[data-library-state="ready"]');}
async function search(p,query,mode='phrase'){await p.locator('#passage-query').fill(query);await p.locator('#passage-mode').selectOption(mode);await p.locator('#passage-submit').click();}
async function originals(p){return p.locator('#passage-results .passage-result').evaluateAll(cards=>cards.map(card=>({id:card.dataset.passageId,lines:[...card.querySelectorAll('.passage-original p')].map(l=>[...l.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join('')),routes:[...card.querySelectorAll('[data-source-unit]')].map(a=>({id:a.dataset.sourceUnit,href:a.getAttribute('href')}))})));}
async function storage(p){return p.evaluate(()=>Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])));}
async function capture(p,name){await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:path.join(out,name+'.png'),fullPage:false});report.screenshots.push(name+'.png');}
try{
 await fs.mkdir(out,{recursive:true});
 report.candidate={commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),trackedChanges:execFileSync('git',['diff','--name-only','HEAD'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(Boolean),sha256:{}};
 for(const name of ['index.html','library/app.bundle.mjs','library/library.css','library/complete-passages.json','sw.js','tests/explore-complete-passages-browser.mjs'])report.candidate.sha256[name]=createHash('sha256').update(await read(name)).digest('hex');
 server=http.createServer(async(req,res)=>{try{
  const u=new URL(req.url,'http://localhost');if(u.pathname==='/favicon.ico'){res.writeHead(204).end();return;}
  if(!u.pathname.startsWith(prefix)){res.writeHead(404).end();return;}
  let relative=decodeURIComponent(u.pathname.slice(prefix.length));if(!relative||relative.endsWith('/'))relative+='index.html';
  const target=path.resolve(root,relative);if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'}).end(await fs.readFile(target));
 }catch{res.writeHead(404).end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port;
 const executablePath=process.env.CHROMIUM_PATH||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined);
 browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});report.browser=browser.version();

 await check('Source packages load only in Explore, and exact first letters open Kabir Salok 1 then restore with Back',async()=>{
  const p=await fresh();await open(p,'today');
  assert.equal(report.requests.some(r=>r.url.includes('/library/complete-passages.json')),false,'Today must not eagerly load source search');
  await p.locator('.library-nav [data-view="explore"]').click();await ready(p);
  const before=await storage(p);await search(p,'ਕਮਸਰਊਰ','first-letter');const joined=await originals(p);assert.ok(joined.length>0);
  await search(p,'ਕ ਮ ਸ ਰ ਊ ਰ','first-letter');assert.deepEqual(await originals(p),joined);
  assert.deepEqual(await storage(p),before,'Search has no storage writes');
  const route=p.locator('[data-source-unit="sggs.salok-kabir.salok001"]');assert.equal(await route.count(),1);await route.click();
  await p.waitForFunction(()=>window.NITNEM_INTERNAL_QA?.getState().sourceVerified);
  const state=await p.evaluate(()=>window.NITNEM_INTERNAL_QA.getState());assert.equal(state.bani,'salok-kabir');assert.equal(state.unit,0);
  assert.equal(await p.locator('[data-line-id="sggs.salok-kabir.salok001.line01"]').count(),1);
  await p.goBack({waitUntil:'domcontentloaded'});await ready(p);
  assert.equal(await p.locator('#passage-query').inputValue(),'ਕ ਮ ਸ ਰ ਊ ਰ');assert.equal(await p.locator('#passage-mode').inputValue(),'first-letter');assert.deepEqual(await originals(p),joined);
  assert.equal((await storage(p))[canaryKey],canary);
  await p.reload({waitUntil:'domcontentloaded'});await ready(p);assert.deepEqual(await originals(p),joined,'Fragment restores the same complete search on reload');
  await close(p);return {unit:'sggs.salok-kabir.salok001',backRestores:true,reloadRestores:true};
 });
 await check('Haumai renders all eight source rows including the remedy and opens its existing Knowledge passage',async()=>{
  const p=await fresh();await open(p);await search(p,'ਹਉਮੈ ਦੀਰਘ ਰੋਗੁ');
  const expected=searchCompletePassages(catalog,'ਹਉਮੈ ਦੀਰਘ ਰੋਗੁ').matches;assert.equal(expected.length,1);
  const shown=await originals(p);assert.equal(shown.length,1);assert.deepEqual(shown[0].lines,expected[0].passage.lines.map(l=>l.text));assert.equal(shown[0].lines.length,8);
  assert.ok(shown[0].lines.includes('ਹਉਮੈ ਦੀਰਘ ਰੋਗੁ ਹੈ ਦਾਰੂ ਭੀ ਇਸੁ ਮਾਹਿ ॥'));
  assert.match(await p.locator('#passage-results .card-review').textContent(),/awaiting qualified review/);
  await capture(p,'haumai-390');await p.locator('.passage-result').screenshot({path:path.join(out,'haumai-complete-card.png')});report.screenshots.push('haumai-complete-card.png');
  const readerLink=p.locator('[data-source-unit="sggs.asa-di-vaar.pauri007.salok02"]');await readerLink.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
  const geometry=await readerLink.evaluate(e=>{const a=e.getBoundingClientRect(),b=document.querySelector('.library-nav').getBoundingClientRect();return {top:a.top,bottom:a.bottom,navTop:b.top};});assert.ok(geometry.top>=0&&geometry.bottom<=geometry.navTop,'The reader link must be reachable above fixed phone navigation');await capture(p,'haumai-reader-link-390');await readerLink.click();
  await p.waitForSelector('.scripture .pankti');assert.equal(await p.locator('.scripture .pankti').count(),8);assert.ok((await p.locator('.scripture').textContent()).includes('ਦਾਰੂ ਭੀ ਇਸੁ ਮਾਹਿ'));
  await p.goBack({waitUntil:'domcontentloaded'});await ready(p);assert.deepEqual(await originals(p),shown);
  await close(p);return {completeRows:8,existingKnowledgeRoute:true};
 });
 await check('English false positives stay empty; overlapping originals are grouped with both reader links',async()=>{
  const p=await fresh();await open(p);const before=await storage(p);
  for(const q of ['NASA','category','<script>alert(1)</script>']){await search(p,q);assert.equal((await originals(p)).length,0);assert.ok((await p.locator('#passage-search-status').textContent()).includes('Enter original Gurmukhi'));}
  const overlap=catalog.passages.find(v=>v.routes.length===2),query=overlap.lines[0].text;await search(p,query);const shown=await originals(p),card=shown.find(x=>x.id===overlap.id);assert.ok(card);assert.equal(card.routes.length,2);assert.equal(shown.filter(x=>x.id===overlap.id).length,1);
  await search(p,'ਸਰਊਰ','first-letter-anywhere');assert.ok((await originals(p)).some(x=>x.routes.some(r=>r.id==='sggs.salok-kabir.salok001')));
  assert.deepEqual(await storage(p),before);await p.locator('#passage-clear').click();assert.equal(new URL(p.url()).hash,'');assert.equal(await p.locator('#passage-query').inputValue(),'');
  await close(p);return {overlapRoutes:2,noApplicationSearchHistory:true};
 });
 await check('Complete results and controls fit narrow, tablet and desktop layouts, enlarged text and dark appearance',async()=>{
  const p=await fresh();await open(p);await search(p,'ਹਉਮੈ ਦੀਰਘ ਰੋਗੁ');
  for(const width of [320,390,820,1440]){
   await p.setViewportSize({width,height:900});await p.locator('#passage-search-title').scrollIntoViewIfNeeded();
   const info=await p.evaluate(()=>({viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,controls:[...document.querySelectorAll('#passage-search input,#passage-search select,#passage-search button:not([hidden])')].map(e=>({id:e.id,height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width}))}));
   assert.ok(info.documentWidth<=width+1,JSON.stringify(info));assert.ok(info.controls.every(c=>c.height>=44),JSON.stringify(info));report.layouts.push(info);await capture(p,'explore-'+width);
  }
  await p.setViewportSize({width:390,height:844});
  // The automatic initial appearance follows the local clock. Establish and
  // verify Day before exercising the actual control's switch to Amrit Vela.
  const initialTheme=await p.locator('body').getAttribute('data-theme');assert.ok(['day','amrit'].includes(initialTheme));
  if(initialTheme==='amrit')await p.locator('#home-theme').click();
  assert.equal(await p.locator('body').getAttribute('data-theme'),'day');
  assert.equal(await p.locator('#home-theme').getAttribute('aria-pressed'),'false');
  await p.locator('#home-theme').click();assert.equal(await p.locator('body').getAttribute('data-theme'),'amrit');
  assert.equal(await p.locator('#home-theme').getAttribute('aria-pressed'),'true');
  await p.locator('#passage-search-title').scrollIntoViewIfNeeded();const colors=await p.locator('#passage-query').evaluate(e=>({color:getComputedStyle(e).color,background:getComputedStyle(e).backgroundColor}));assert.notEqual(colors.color,colors.background);assert.notEqual(colors.background,'rgb(255, 255, 255)');await capture(p,'explore-dark-390');
  await p.evaluate(()=>{document.documentElement.style.fontSize='200%';});await p.locator('#passage-results a').first().scrollIntoViewIfNeeded();
  const big=await p.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth}));assert.ok(big.documentWidth<=big.width+1);report.layouts.push({enlarged:true,...big});await capture(p,'explore-enlarged-390');await close(p);
 });
 await check('A damaged crosswalk or unavailable source withholds results while existing Read navigation remains usable',async()=>{
  for(const target of ['crosswalk','source']){
   const p=await fresh();
   if(target==='crosswalk')await p.route('**/library/complete-passages.json',async r=>r.fulfill({status:200,contentType:'application/json',body:Buffer.concat([await read('library/complete-passages.json'),Buffer.from(' ')] )}));
   else await p.route('**/salok-mahalla9/data/salok-mahalla9.json',r=>r.abort());
   await p.goto(origin+prefix+'?view=explore',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>document.getElementById('passage-search-status')?.textContent.includes('withheld'));
   assert.equal(await p.locator('#passage-submit').isDisabled(),true);assert.equal((await originals(p)).length,0);
   await p.locator('.library-nav [data-view="read"]').click();await p.waitForFunction(()=>document.documentElement.dataset.libraryView==='read'&&document.querySelectorAll('#reader-list [data-reader-id]').length===10);assert.equal(await p.locator('#reader-list [data-reader-id]').count(),10);assert.equal((await storage(p))[canaryKey],canary);await close(p);
  }
 });
 await check('The installed exact offline shell serves search, complete passages and their existing Kabir reader',async()=>{
  const p=await fresh({serviceWorkers:'allow'});await open(p);await p.evaluate(()=>navigator.serviceWorker.ready);
  await p.waitForFunction(()=>!!navigator.serviceWorker.controller,{},{timeout:30000});
  const cached=await p.evaluate(async()=>{const names=await caches.keys(),urls=[];for(const n of names){const c=await caches.open(n);urls.push(...(await c.keys()).map(r=>new URL(r.url).pathname));}return urls;});
  assert.ok(cached.some(u=>u.endsWith('/library/complete-passages.json')));
  await p.context().setOffline(true);report.offlineSourceResponse=await p.evaluate(async()=>{const r=await fetch('./library/complete-passages.json',{cache:'no-store'});return {status:r.status,url:r.url,redirected:r.redirected};});assert.equal(report.offlineSourceResponse.status,200);assert.ok(new URL(report.offlineSourceResponse.url).searchParams.has('glp_release'));await p.reload({waitUntil:'domcontentloaded'});await ready(p);await search(p,'ਕਮਸਰਊਰ','first-letter');
  await p.locator('[data-source-unit="sggs.salok-kabir.salok001"]').click();await p.waitForFunction(()=>window.NITNEM_INTERNAL_QA?.getState().sourceVerified);assert.equal(await p.evaluate(()=>window.NITNEM_INTERNAL_QA.getState().unit),0);
  await p.goBack({waitUntil:'domcontentloaded'});await ready(p);assert.equal(await p.locator('#passage-query').inputValue(),'ਕਮਸਰਊਰ');assert.equal((await storage(p))[canaryKey],canary);await close(p);
 });
 await check('Original queries remain in the fragment and are absent from source requests, referrers and remote services',async()=>{
  const requests=report.requests.filter(r=>/^https?:/.test(r.url));assert.ok(requests.length>0);
  for(const request of requests){assert.equal(new URL(request.url).origin,origin);assert.equal(/gurbani=|%E0%A8|%E0%A9|[\u0a00-\u0a7f]/i.test(request.url),false,request.url);assert.equal(request.referrer?.includes('#')||false,false);}
  assert.deepEqual(report.runtimeErrors,[]);return {sameOrigin:true,noQueryTransmission:true};
 });
}catch(error){report.failure=error.stack||String(error);process.exitCode=1;}
finally{
 for(const context of contexts)await context.close().catch(()=>{});if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));
 report.finishedAtUtc=new Date().toISOString();await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:process.exitCode?'FAIL':'PASS',checks:report.checks.map(c=>({name:c.name,status:c.status,...(c.error?{error:c.error}: {})})),evidence:path.relative(root,out)}));
}
