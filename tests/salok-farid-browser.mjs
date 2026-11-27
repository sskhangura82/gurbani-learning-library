// Desktop Chromium, fresh contexts and synthetic learning only. No real-device claim.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))),out=path.join(root,'evidence/salok-farid');
const PREFIX='/gurbani-learning-library/',PAGE='salok-farid/index.html?bani=salok-farid',SOURCE='salok-farid/data/salok-farid.json';
const pack=JSON.parse(await fs.readFile(path.join(root,SOURCE),'utf8'));
const sha=x=>createHash('sha256').update(x).digest('hex');
const key='glp001.nitnem.PRIVATE-SOURCE-REVIEW.v1.salok-farid.'+pack.editionId;
const id=(n,line)=>'sggs.salok-farid.salok'+String(n).padStart(3,'0')+'.line'+String(line).padStart(2,'0');
const NOTE_ID=id(52,5),BOOKMARK=id(2,2),NOTE='SYNTHETIC Farid reflection. Preserve the whole note.';
const sentinelKey='glp001.sukhmani.v1',sentinel='SYNTHETIC unrelated saved record — never change';
const report={startedAt:new Date().toISOString(),browser:null,checks:[],screenshots:[],errors:[],limitations:['Desktop Chromium only, including narrow viewports; no physical iPhone, Safari, Home Screen, Android or VoiceOver check.','No human language, source-selection, theology or printed-page approval.','Only synthetic notes in fresh nonpersistent contexts.']};
const contexts=new Set(),requests=[];let server,browser,origin,currentPage,backup;
const qa=p=>p.evaluate(()=>window.NITNEM_INTERNAL_QA.getState());
const raw=p=>p.evaluate(key=>localStorage.getItem(key),key);
const saved=async p=>JSON.parse(await raw(p));
async function check(name,fn){try{await fn();report.checks.push({name,status:'PASS'});}catch(e){report.checks.push({name,status:'FAIL',error:e.stack});}}
async function capture(p,name){await p.screenshot({path:path.join(out,name+'.png'),fullPage:false});report.screenshots.push('evidence/salok-farid/'+name+'.png');}
async function context(width=390,serviceWorkers='block'){
 const ctx=await browser.newContext({viewport:{width,height:844},acceptDownloads:true,serviceWorkers,reducedMotion:'reduce'});contexts.add(ctx);
 await ctx.addInitScript(({key,value})=>{if(!localStorage.getItem(key))localStorage.setItem(key,value);},{key:sentinelKey,value:sentinel});return ctx;
}
async function page(ctx,url=PAGE){const p=await ctx.newPage();currentPage=p;p.setDefaultTimeout(15000);p.on('pageerror',e=>report.errors.push(e.message));p.on('request',r=>requests.push(r.url()));await p.goto(origin+PREFIX+url);return p;}
async function ready(p){await p.waitForFunction(()=>window.NITNEM_INTERNAL_QA?.getState().sourceVerified&&document.querySelectorAll('#source-unit .scripture-line').length===284);const state=await qa(p);assert.equal(state.teachingAvailable,false);assert.equal(state.authoredLessons,0);assert.equal(state.releaseAuthorized,false);assert.equal(state.sourceApproved,false);assert.equal(state.translationApproved,false);}
async function unchanged(p){assert.equal(await p.evaluate(k=>localStorage.getItem(k),sentinelKey),sentinel);}
async function jump(p,index){await p.locator('#jump').click();await p.locator('#jump-list button').nth(index).click();await p.waitForFunction(index=>!document.getElementById('jump-dialog').open&&window.NITNEM_INTERNAL_QA.getState().unit===index,index);}
async function tools(p){await p.locator('#reading-tools').click();await p.waitForFunction(()=>document.getElementById('tools-dialog').open&&!document.getElementById('note').disabled);}
async function closeTools(p){await p.locator('#tools-close').click();await p.waitForFunction(()=>!document.getElementById('tools-dialog').open);}
async function select(p,line){await p.locator('.scripture-line[data-line-id="'+line+'"] > .tuk').click();await p.waitForFunction(line=>document.querySelector('.scripture-line[aria-current="location"]')?.dataset.lineId===line,line);}
async function source(p){
 const expected=pack.units.flatMap((u,i)=>[...(i===0?pack.preface.map(r=>({kind:'preface',text:r.text})):[]),...u.metricalHeadings.map(r=>({kind:'heading',text:r.text})),...u.lines.map(r=>({kind:'line',id:r.id,text:r.text}))]);
 const actual=await p.locator('#source-unit > .passage-block').evaluateAll(blocks=>blocks.flatMap(block=>[...block.children].flatMap(n=>n.classList.contains('original-preface')?[{kind:'preface',text:n.textContent}]:n.classList.contains('meter-heading')?[{kind:'heading',text:n.textContent}]:n.classList.contains('scripture-line')?[{kind:'line',id:n.dataset.lineId,text:n.querySelector('.tuk').textContent}]:[])));
 assert.deepEqual(actual,expected);assert.equal(sha(actual.map(r=>r.text).join('\n')),'1f76efa45d938db1623bc1f88ab3b3367305be19d59051ee2dab45e57ac8e60e');
 assert.equal(await p.locator('.quarantine').count(),0);
}
async function layout(p,label){const size=await p.evaluate(()=>({width:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth,overflow:[...document.querySelectorAll('.tuk,.meter-heading,.original-preface,#dock')].filter(n=>n.getClientRects().length).map(n=>({kind:n.className,left:n.getBoundingClientRect().left,right:n.getBoundingClientRect().right})).filter(r=>r.left< -1||r.right>innerWidth+1)}));assert.ok(size.doc<=size.width+1&&size.body<=size.width+1,label+' overflow '+JSON.stringify(size));assert.deepEqual(size.overflow,[],label);}
async function imported(p,value){await p.locator('#import-learning').setInputFiles({name:'synthetic-farid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});}
try{
 await fs.mkdir(out,{recursive:true});report.inputSha256={};for(const file of [SOURCE,'salok-farid/data/library.json','salok-farid/index.html','nitnem/reader.js','sw.js','tests/salok-farid-browser.mjs'])report.inputSha256[file]=sha(await fs.readFile(path.join(root,file)));
 const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.webmanifest':'application/manifest+json'};
 server=http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}if(!pathname.startsWith(PREFIX)){res.writeHead(404);res.end();return;}let relative=pathname.slice(PREFIX.length)||'index.html';if(relative.endsWith('/'))relative+='index.html';const filename=path.resolve(root,relative);if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}const bytes=await fs.readFile(filename);res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);}catch{res.writeHead(404);res.end('Not found');}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});report.browser=browser.version();
 for(const width of [320,390,820]){
  const ctx=await context(width),p=await page(ctx,'salok-farid/index.html');
  await check('Collection entrance labels its pending source review at '+width+' px',async()=>{await p.waitForFunction(()=>window.NITNEM_INTERNAL_QA);assert.match(await p.locator('body').innerText(),/independent review|review pending|qualified/i);await layout(p,'collection '+width);if(width===390)await capture(p,'collection-390');});
  await p.locator('[data-open="salok-farid"]').click();await ready(p);
  await check('All 297 originals render in selected order at '+width+' px',async()=>{await source(p);await layout(p,'reader '+width);if(width===390)await capture(p,'reader-390');});
  await check('Complete long and final Saloks navigate without truncation at '+width+' px',async()=>{
   for(const n of [2,13,52,100,130]){await jump(p,n-1);await p.locator('#view-passage').click();assert.deepEqual(await p.locator('#source-unit .tuk').allTextContents(),pack.units[n-1].lines.map(r=>r.text));await p.locator('#view-continuous').click();}await unchanged(p);
  });
  await check('Meaning and study remain honestly empty at '+width+' px',async()=>{for(const value of ['meaning','study']){await p.locator('button[data-mode="'+value+'"]').click();await p.waitForFunction(value=>document.body.dataset.mode===value,value);assert.equal(await p.locator('.unit-lesson,button[data-meaning-line]').count(),0);assert.equal((await qa(p)).teachingAvailable,false);assert.match(await p.locator('#review-mode').innerText(),/No explanation|not yet|not.*supplied/i);await source(p);}if(width===390)await capture(p,'study-empty-390');});
  await check('Large Gurmukhi wraps within '+width+' px',async()=>{await p.locator('button[data-mode="read"]').click();await tools(p);await p.locator('#size').evaluate(n=>{n.value='60';n.dispatchEvent(new Event('input',{bubbles:true}));});await closeTools(p);await jump(p,0);await layout(p,'large scripture '+width);});
  await ctx.close();contexts.delete(ctx);
 }
 const ctx=await context(),p=await page(ctx);await ready(p);
 await check('A bookmark and a separate private note save and export under Farid’s own edition',async()=>{
  await jump(p,1);await select(p,BOOKMARK);await tools(p);await p.locator('#bookmark').click();await p.waitForFunction(({key,id})=>JSON.parse(localStorage.getItem(key)||'{}').payload?.bookmarks?.includes(id),{key,id:BOOKMARK});await closeTools(p);
  await jump(p,51);await select(p,NOTE_ID);await tools(p);await p.locator('#note').fill(NOTE);await p.locator('#save-note').click();await p.waitForFunction(({key,id,note})=>JSON.parse(localStorage.getItem(key)||'{}').payload?.notes?.[id]===note,{key,id:NOTE_ID,note:NOTE});
  const event=p.waitForEvent('download');await p.locator('#export-learning').click();backup=JSON.parse(await fs.readFile(await(await event).path(),'utf8'));
  assert.equal(backup.compositionId,'salok-farid');assert.equal(backup.editionId,pack.editionId);assert.equal(backup.state.notes[NOTE_ID],NOTE);assert.ok(backup.state.bookmarks.includes(BOOKMARK));await unchanged(p);await closeTools(p);
 });
 await check('Reload keeps the private note without manufacturing teaching',async()=>{await p.reload();await ready(p);assert.equal((await saved(p)).payload.notes[NOTE_ID],NOTE);assert.equal((await qa(p)).teachingAvailable,false);await unchanged(p);});
 const importCtx=await context(),q=await page(importCtx);await ready(q);await tools(q);
 await check('The actual export imports into a fresh context without moving its reading place',async()=>{assert.ok(backup);await imported(q,backup);await q.waitForFunction(()=>document.getElementById('save-status').textContent.startsWith('Bookmarks and reflections merged.'));const s=(await saved(q)).payload;assert.equal(s.notes[NOTE_ID],NOTE);assert.ok(s.bookmarks.includes(BOOKMARK));assert.equal(s.lineId,id(1,1));await unchanged(q);});
 await check('A different collection backup is refused and existing bytes are preserved',async()=>{const before=await raw(q),wrong={...structuredClone(backup),compositionId:'salok-kabir'};await q.locator('#save-status').evaluate(n=>{n.textContent='';});await imported(q,wrong);await q.waitForFunction(()=>document.getElementById('save-status').textContent.includes('Import refused'));assert.equal(await raw(q),before);await unchanged(q);});
 await closeTools(q);await ctx.close();contexts.delete(ctx);await importCtx.close();contexts.delete(importCtx);
 for(const change of ['missing','changed']){
  const badCtx=await context();const altered=structuredClone(pack);if(change==='missing')altered.units[1].lines.pop();else altered.units[1].lines[1].text+=' ਅ';
  await badCtx.route('**/'+SOURCE,r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(altered)}));const bad=await page(badCtx);
  await check('An '+change+' original fails closed before any scripture is shown',async()=>{await bad.waitForFunction(()=>document.getElementById('collection-status').textContent.includes('could not load'));assert.equal((await qa(bad)).sourceVerified,false);assert.equal(await bad.locator('#source-unit .scripture-line').count(),0);await unchanged(bad);});await badCtx.close();contexts.delete(badCtx);
 }
 const offlineCtx=await context(390,'allow'),offline=await page(offlineCtx);await ready(offline);
 await check('The real root service worker caches Farid’s pinned source-only reader',async()=>{
  await offline.waitForFunction(()=>navigator.serviceWorker.controller,{},{timeout:30000});
  const names=await offline.evaluate(()=>caches.keys());assert.ok(names.some(n=>n.startsWith('glp-static:')));
  const cached=await offline.evaluate(async prefix=>{const keys=[];for(const name of await caches.keys())if(name.startsWith('glp-static:'))for(const request of await(await caches.open(name)).keys())keys.push(new URL(request.url).pathname);return keys;},PREFIX);
  for(const relative of ['salok-farid/','salok-farid/index.html','salok-farid/data/library.json',SOURCE])assert.ok(cached.includes(PREFIX+relative),relative);
  await offlineCtx.setOffline(true);await offline.reload();await ready(offline);await source(offline);await jump(offline,129);assert.equal((await qa(offline)).unit,129);await capture(offline,'offline-final-390');
 });await offlineCtx.close();contexts.delete(offlineCtx);
 await check('No Farid teaching request or uncaught browser error occurs',()=>{assert.equal(requests.some(u=>/salok-farid\/learning\//.test(u)),false);assert.deepEqual(report.errors,[]);});
}catch(e){report.checks.push({name:'Harness completion',status:'FAIL',error:e.stack});if(currentPage&&!currentPage.isClosed())try{await capture(currentPage,'harness-failure');}catch{}}
finally{for(const ctx of contexts)await ctx.close().catch(()=>{});await browser?.close();if(server?.listening)await new Promise(resolve=>server.close(resolve));report.completedAt=new Date().toISOString();report.passed=report.checks.filter(c=>c.status==='PASS').length;report.failed=report.checks.filter(c=>c.status==='FAIL').length;report.status=report.failed?'FAIL':'PASS';await fs.writeFile(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,passed:report.passed,failed:report.failed,browser:report.browser,failures:report.checks.filter(c=>c.status==='FAIL')},null,2));process.exitCode=report.failed?1:0;}
