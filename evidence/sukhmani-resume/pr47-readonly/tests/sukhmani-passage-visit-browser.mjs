// R2-X-04: actual reader in disposable localhost Chromium contexts.
// All notes and bookmarks are synthetic. No live user data.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))),prefix='/gurbani-learning-library/';
const key='glp001.sukhmani.v1',id='sukhmani.a03.p01.l01',other='sukhmani.a04.p02.l03';
const readFixture={version:2,read:id,guide:'sukhmani.a03.p01.l03',hasGuided:true,mode:'read',theme:'day',size:30,pace:70,pronunciation:false,bookmarks:[id],notes:{[id]:'SYNTHETIC existing note'}};
const raw=JSON.stringify(readFixture), ctx={window:{}};
vm.runInNewContext(await fs.readFile(path.join(root,'js/sukhmani-data.js'),'utf8'),ctx);
const pack=ctx.window.GLP_SUKHMANI, target=pack.ashtpadis.find(a=>a.number===17).lines[0].id;
const exact='sukhmani.a17.p01.l05';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png'};
const server=http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
 if(!url.pathname.startsWith(prefix)){res.writeHead(404);res.end();return;}
 let name=path.resolve(root,url.pathname.slice(prefix.length)||'index.html');if(!name.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 const stat=await fs.stat(name);if(stat.isDirectory())name=path.join(name,'index.html');
 res.writeHead(200,{'Content-Type':mime[path.extname(name)]||'application/octet-stream','Cache-Control':'no-store'});res.end(await fs.readFile(name));
}catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port+prefix;
let browser;
const checks=[],runtimeErrors=[];
const getRaw=page=>page.evaluate(key=>localStorage.getItem(key),key);
const getState=async page=>JSON.parse(await getRaw(page));
const active=page=>page.locator('.sk-line[data-current="true"]').getAttribute('id');
const waitReady=async page=>{await page.waitForFunction(()=>document.querySelectorAll('.sk-line').length===2027);};
const waitVisit=async(page,line)=>{await waitReady(page);await page.locator('#sk-link-visit').waitFor();await page.waitForFunction(id=>document.querySelector('.sk-line[data-current="true"]')?.id===id,line);await page.waitForTimeout(550);};
const assertSaved=async(page,expected=readFixture)=>{
 const actual=await getState(page);
 for(const k of ['read','guide','hasGuided'])assert.deepEqual(actual[k],expected[k],k+' changed during visit');
};
const go=async(page,hash='')=>{await page.goto(origin+'sukhmani.html'+hash);await waitReady(page);};
const jumpVisible=async(page,line)=>{await page.locator('[data-line-id="'+line+'"]').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));await page.waitForTimeout(600);};
async function scenario(name,fn,seed=raw,serviceWorkers='block'){
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',acceptDownloads:true,serviceWorkers});
 let page;
 try{
  page=await context.newPage();page.setDefaultTimeout(12000);
  page.on('pageerror',e=>runtimeErrors.push({name,error:e.message}));
  if(seed!==null){await page.goto(origin+'index.html');await page.evaluate(({key,seed})=>localStorage.setItem(key,seed),{key,seed});}
  const detail=await fn(page,context);checks.push({name,status:'passed',...detail});
 }catch(e){checks.push({name,status:'failed',error:e.stack||String(e)});}
 finally{await context.close();}
}
try{
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 await scenario('Opening Ashtpadi 17 reaches the actual verified text and leaves the complete saved record unchanged',async page=>{
  await go(page,'#ashtpadi-17');await waitVisit(page,target);
  assert.equal(await active(page),target);assert.match(await page.locator('#sk-link-visit-message').innerText(),/Saved place: Ashtpadi 3/);
  assert.equal(await getRaw(page),raw);
  const rect=await page.locator('#sk-link-visit').evaluate(n=>{const r=n.getBoundingClientRect(),b=n.querySelector('button').getBoundingClientRect();return {top:r.top,bottom:r.bottom,h:r.height,viewport:innerHeight,hit:n.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2))};});
  assert.ok(rect.h>=44&&rect.top>=-1&&rect.bottom<rect.viewport&&rect.hit,JSON.stringify(rect));
  return {target,noticeGeometry:rect};
 });
 await scenario('Visit remains nonpersistent after scroll, guide, visibility change and reload',async page=>{
  await go(page,'#ashtpadi-17');await waitVisit(page,target);
  await jumpVisible(page,exact);await page.locator('#sk-play').click();await page.waitForTimeout(500);await page.locator('#sk-play').click();
  // Simulate a hidden-document signal in desktop Chromium. This is not
  // evidence of a real device backgrounding the app.
  await page.evaluate(()=>{const own=Object.getOwnPropertyDescriptor(document,'hidden');Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));if(own)Object.defineProperty(document,'hidden',own);else delete document.hidden;});
  await page.waitForTimeout(400);assert.equal(await getRaw(page),raw);
  await page.reload();await waitVisit(page,target);assert.equal(await getRaw(page),raw);
 });
 await scenario('Return to saved place preserves its existing guide and notes',async page=>{
  await go(page,'#ashtpadi-17');await waitVisit(page,target);
  await page.locator('#sk-visit-return').click();await page.locator('#sk-link-visit').waitFor({state:'hidden'});
  await page.waitForTimeout(650);assert.equal(await active(page),id);assert.equal(new URL(page.url()).hash,'');assert.deepEqual(await getState(page),readFixture);
 });
 await scenario('Explicit adoption saves only the deliberately chosen passage',async page=>{
  await go(page,'#ashtpadi-17');await waitVisit(page,target);await jumpVisible(page,exact);
  assert.equal(await getRaw(page),raw);
  const chosen=await active(page);assert.equal(chosen,exact);
  await page.locator('#sk-visit-keep').click();await page.locator('#sk-link-visit').waitFor({state:'hidden'});
  await page.waitForFunction(({key,exact})=>JSON.parse(localStorage.getItem(key)||'{}').read===exact,{key,exact});await page.waitForTimeout(500);
  const s=await getState(page);assert.equal(s.read,exact);assert.deepEqual(s.bookmarks,readFixture.bookmarks);assert.deepEqual(s.notes,readFixture.notes);
  assert.equal(new URL(page.url()).hash,'');
 });
 await scenario('Intentional edits during a visit do not overwrite a newer reading position from another tab',async(page,context)=>{
  await go(page,'#'+exact);await waitVisit(page,exact);
  const second=await context.newPage();await second.goto(origin+'index.html');
  const advanced={...readFixture,read:other,guide:other,hasGuided:false};
  await second.evaluate(({key,advanced})=>localStorage.setItem(key,JSON.stringify(advanced)),{key,advanced});
  await page.waitForFunction(()=>document.getElementById('sk-link-visit-message').textContent.includes('Ashtpadi 4'));
  await page.locator('[data-line-id="'+exact+'"] .tuk').click();await page.locator('#sk-reflection').fill('SYNTHETIC linked-visit note');await page.locator('#sk-save-reflection').click();
  await page.waitForFunction(({key,exact})=>JSON.parse(localStorage.getItem(key)).notes[exact]==='SYNTHETIC linked-visit note',{key,exact});
  await page.locator('#sk-bookmark').click();await page.waitForFunction(({key,exact})=>JSON.parse(localStorage.getItem(key)).bookmarks.includes(exact),{key,exact});
  await page.locator('#sk-dialog-close').click();await page.locator('#sk-tools').click();
  await page.locator('#sk-theme').selectOption('amrit');await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).theme==='amrit',key);
  await assertSaved(page,advanced);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#sk-export').click()]);
  const backup=JSON.parse(await fs.readFile(await download.path(),'utf8'));
  for(const k of ['read','guide','hasGuided'])assert.deepEqual(backup.state[k],advanced[k]);
  assert.equal(backup.state.notes[exact],'SYNTHETIC linked-visit note');assert.ok(backup.state.bookmarks.includes(exact));
  await page.locator('#sk-dialog-close').click();await page.locator('#sk-visit-return').click();await page.waitForTimeout(650);
  assert.equal(await active(page),other);await assertSaved(page,advanced);await second.close();
 });
 await scenario('Exact line and unit links work across same-document hash changes and Back',async page=>{
  await go(page,'#ashtpadi-17');await waitVisit(page,target);
  await page.evaluate(id=>location.hash=id,exact);await waitVisit(page,exact);
  const unit=pack.ashtpadis.find(a=>a.number===17).lines.find(l=>l.id===exact).unitId;
  assert.ok(unit);const first=pack.ashtpadis.find(a=>a.number===17).lines.find(l=>l.unitId===unit).id;
  await page.evaluate(unit=>location.hash='unit-'+unit,unit);await waitVisit(page,first);
  await page.goBack();await waitVisit(page,exact);assert.equal(await getRaw(page),raw);
  await page.goBack();await waitVisit(page,target);assert.equal(await getRaw(page),raw);
 });
 await scenario('Invalid encoded or out-of-range fragments show an honest notice and preserve saved data',async page=>{
  for(const hash of ['#%','#ashtpadi-99','#does-not-exist']){
   await go(page,hash);await page.locator('#sk-link-visit').waitFor();await page.waitForTimeout(550);
   assert.match(await page.locator('#sk-link-visit-message').innerText(),/not found/);assert.equal(await page.locator('#sk-visit-keep').isDisabled(),true);assert.equal(await getRaw(page),raw);
  }
 });
 await scenario('A first-time visitor does not create a durable record until choosing a reading place',async page=>{
  await go(page,'#ashtpadi-17');await waitVisit(page,target);assert.equal(await getRaw(page),null);
  await page.locator('#sk-visit-keep').click();await page.waitForFunction(key=>!!localStorage.getItem(key),key);
  assert.equal((await getState(page)).read,target);
 },null);
 await scenario('A cached reader opens an offline linked passage without rewriting its saved place',async(page,context)=>{
  await go(page,'#ashtpadi-17');await waitVisit(page,target);
  // The actual PWA registers the worker on localhost. Wait for activation.
  await page.waitForFunction(()=>navigator.serviceWorker.controller,{},{timeout:20000});
  const cacheCount=await page.evaluate(async()=>{const keys=await caches.keys();let n=0;for(const k of keys){const c=await caches.open(k);n+=(await c.keys()).length;}return n;});
  assert.ok(cacheCount>=57,cacheCount);
  await context.setOffline(true);
  await page.reload();await waitVisit(page,target);
  assert.equal(await getRaw(page),raw);assert.equal(await active(page),target);
  return {cachedAssets:cacheCount,desktopNetworkDisabled:true};
 },raw,'allow');
}catch(e){checks.push({name:'setup',status:'failed',error:e.stack||String(e)});}
finally{
 if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
 const report={date:new Date().toISOString(),scope:'R2-X-04 temporary passage visit; desktop Chromium only; synthetic records only',status:checks.some(c=>c.status==='failed')||runtimeErrors.length?'FAIL':'PASS',checks,runtimeErrors};
 await fs.writeFile(path.join(root,'evidence/sukhmani-passage-visit-verification.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:report.status,passed:checks.filter(c=>c.status==='passed').length,failed:checks.filter(c=>c.status==='failed'),runtimeErrors},null,2));if(report.status!=='PASS')process.exitCode=1;
}
