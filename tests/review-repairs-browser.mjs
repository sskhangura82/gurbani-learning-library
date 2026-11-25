// Focused real-browser acceptance for CI-R-02 (retained learning) and CI-A-01
// (visible bilingual meanings in computed accessible names). Synthetic data only.
// Run: node tests/review-repairs-browser.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))),prefix='/gurbani-learning-library/',KEY='glp001.continuous.v2';
const report={schema:'glp.review-repairs-browser.v1',startedAtUtc:new Date().toISOString(),engine:'Chromium',checks:[],runtimeErrors:[],accessibility:[],limitations:['No physical iPhone, Safari or VoiceOver acceptance is claimed.','Accessible names are read from Chromium’s native Accessibility.getFullAXTree, matched to real DOM backend node IDs. This is not an assistive-technology listening test.','All learning fixtures and downloads are synthetic and use fresh nonpersistent browser contexts.']};
const longText='SYNTHETIC LONG REFLECTION\n'+'ਕ'.repeat(12050)+'\nEND <retained> & complete.',unknownText='SYNTHETIC unmatched reflection <keep> & ਪੰਜਾਬੀ\nSecond line. ',knownText='SYNTHETIC existing ordinary note.',newText='SYNTHETIC ordinary note saved after retained-learning recovery.';
const unknownId='future-edition.line99',longId='pauri02.line01',knownId='pauri02.line02';
const seedState={version:2,read:{id:'mool.line01',offset:0},guide:{index:0,token:0},mode:'read',theme:'day',size:30,pace:70,bookmarks:[unknownId,knownId],notes:{[unknownId]:unknownText,[longId]:longText,[knownId]:knownText}};
const names=['jaap','savaiye','chaupai','anand','rehras','sohila'];
const counts=Object.fromEntries(await Promise.all(names.map(async n=>[n,JSON.parse(await fs.readFile(path.join(root,'nitnem/data/'+n+'.json'),'utf8')).originalLineCount])));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}if(!pathname.startsWith(prefix)){res.writeHead(404);res.end();return;}const filename=path.resolve(root,pathname.slice(prefix.length)||'index.html');if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}const bytes=await fs.readFile(filename);res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);}catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
let browser;
async function scenario(name,fn,seed){
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',reducedMotion:'reduce',acceptDownloads:true});
 if(seed!==undefined)await context.addInitScript(({key,raw})=>{if(localStorage.getItem(key)===null)localStorage.setItem(key,raw);},{key:KEY,raw:seed});
 const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>report.runtimeErrors.push({scenario:name,error:e.message}));
 try{const detail=await fn(page,context);report.checks.push({name,status:'passed',...(detail?{detail}:{})});}catch(e){report.checks.push({name,status:'failed',error:e.stack||String(e)});}finally{await context.close();}
}
async function go(page,file){const response=await page.goto(origin+prefix+file);assert.equal(response.status(),200);}
async function japjiReady(page){await page.waitForFunction(()=>window.GLP_CONTINUOUS_DEBUG?.lineCount===385);assert.equal(await page.locator('#continuous-reader').getAttribute('data-source-integrity'),'verified');}
async function exportJapji(page){const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#dialog-body button[data-action="export"]').click()]);const file=await download.path();assert.ok(file);return JSON.parse(await fs.readFile(file,'utf8'));}
function retainedAssertions(s){
 assert.equal(s.keptAside.notes.length,2);assert.deepEqual(s.keptAside.bookmarks,[unknownId]);
 assert.deepEqual(s.keptAside.notes.find(x=>x.id===unknownId),{id:unknownId,text:unknownText,reason:'unknown_line'});
 assert.deepEqual(s.keptAside.notes.find(x=>x.id===longId),{id:longId,text:longText,reason:'long_reflection'});
 assert.equal(s.notes[knownId],knownText);assert.ok(s.bookmarks.includes(knownId));
}
const norm=x=>String(x||'').replace(/\s+/gu,' ').trim();
async function nativeNames(page,context,label,count){
 const visible=await page.locator('button.simple-meaning').evaluateAll(nodes=>nodes.map(n=>({en:n.querySelector('.english')?.textContent||'',pa:n.querySelector('.punjabi')?.textContent||'',visible:n.getClientRects().length>0})));
 assert.equal(visible.length,count,'Meaning-button count must cover the full selected source');assert.ok(visible.every(x=>x.visible&&x.en&&x.pa),'Each meaning button must display both language fields');
 const session=await context.newCDPSession(page);await session.send('Accessibility.enable');
 try{
  const snapshot=await session.send('DOMSnapshot.captureSnapshot',{computedStyles:[]}),main=snapshot.documents[0],table=snapshot.strings,backend=[];
  assert.ok(main?.nodes?.backendNodeId,'DOMSnapshot must provide real backend node IDs');
  for(let i=0;i<main.nodes.nodeName.length;i++){
   if(table[main.nodes.nodeName[i]]!=='BUTTON')continue;const attrs=main.nodes.attributes[i]||[];let cls='';
   for(let j=0;j<attrs.length;j+=2)if(table[attrs[j]]==='class')cls=table[attrs[j+1]];
   if(cls.split(/\s+/).includes('simple-meaning'))backend.push(main.nodes.backendNodeId[i]);
  }
  assert.equal(backend.length,visible.length,'DOM and snapshot meaning-button order must align');
  const tree=await session.send('Accessibility.getFullAXTree'),byBackend=new Map(tree.nodes.filter(n=>n.role?.value==='button').map(n=>[n.backendDOMNodeId,n]));
  for(let i=0;i<backend.length;i++){
   const ax=byBackend.get(backend[i]);assert.ok(ax&&!ax.ignored,label+' meaning '+i+' must exist in the native accessibility tree');
   const actual=norm(ax.name?.value);assert.ok(actual.includes(norm(visible[i].en)),label+' English missing from computed name at index '+i);assert.ok(actual.includes(norm(visible[i].pa)),label+' Punjabi missing from computed name at index '+i);
  }
  const aria=await page.locator('button.simple-meaning').first().ariaSnapshot();
  const result={reader:label,meaningButtonsChecked:visible.length,bilingualNameChecks:visible.length*2,nativeAXNodes:tree.nodes.length,firstAriaSnapshotSha256:createHash('sha256').update(aria).digest('hex'),method:'Chromium native AX tree joined to DOMSnapshot.backendNodeId; visible EN/PA compared after whitespace collapse only'};report.accessibility.push(result);return result;
 }finally{await session.detach();}
}
try{
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});report.browserVersion=browser.version();
 await scenario('Unknown and long Japji learning remains visible, complete, editable elsewhere, exportable and stable after reload',async(page)=>{
  await go(page,'full-japji.html');await japjiReady(page);const notice=page.locator('#retained-learning');await notice.waitFor({state:'visible'});assert.match(await notice.innerText(),/3 saved items/);
  await notice.locator('button').click();const items=page.locator('#retained-learning-items');await items.waitFor();assert.match(await items.innerText(),new RegExp(unknownId.replaceAll('.','\\.')));
  const details=items.locator('details');assert.equal(await details.count(),2);for(let i=0;i<2;i++)await details.nth(i).locator('summary').click();
  const fields=await items.locator('textarea').evaluateAll(nodes=>nodes.map(n=>({value:n.value,readonly:n.readOnly,visible:n.getClientRects().length>0})));
  assert.equal(fields.length,2);assert.ok(fields.every(x=>x.readonly&&x.visible));assert.ok(fields.some(x=>x.value===unknownText));assert.ok(fields.some(x=>x.value===longText));
  await page.locator('#dialog-close').click();await page.locator('#dock-position').click();await page.locator('#dialog-body button[data-action="jump"][data-index="0"]').click();await page.waitForFunction(()=>window.GLP_CONTINUOUS_DEBUG.getState().read.id==='mool.line01');
  await page.locator('#tools-open').click();await page.locator('#dialog-body button[data-action="note"][data-index="0"]').click();await page.waitForFunction(()=>document.querySelector('#reflection')&&!document.querySelector('#reflection').disabled);assert.equal(await page.locator('#reflection').getAttribute('data-line-id'),'mool.line01');
  await page.locator('#reflection').fill(newText);await page.waitForFunction(({key,text})=>JSON.parse(localStorage.getItem(key)).notes['mool.line01']===text,{key:KEY,text:newText});
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);retainedAssertions(saved);assert.equal(saved.notes['mool.line01'],newText);
  const backup=await exportJapji(page);assert.equal(backup.format,'glp-family-learning');const exported=JSON.parse(backup.records[KEY]);retainedAssertions(exported);assert.equal(exported.notes['mool.line01'],newText);
  await page.reload();await japjiReady(page);await page.locator('#retained-learning').waitFor({state:'visible'});const reread=await page.evaluate(()=>window.GLP_CONTINUOUS_DEBUG.getState());retainedAssertions(reread);assert.equal(reread.notes['mool.line01'],newText);
  return {retainedNotes:2,retainedBookmarks:1,longNoteCharacters:longText.length,fullReadonlyValuesChecked:true,ordinarySaveAndExportChecked:true,reloadIdempotenceChecked:true};
 },JSON.stringify(seedState));
 for(const [name,raw] of [['malformed JSON','{"version":2,"notes":'],['invalid note shape',JSON.stringify({version:2,notes:{'mool.line01':42}})]]){
  await scenario('Japji '+name+' remains byte-identical through loading and original-record export',async(page)=>{
   await go(page,'full-japji.html');await japjiReady(page);await page.locator('#retained-learning').waitFor({state:'visible'});assert.match(await page.locator('#retained-learning').innerText(),/needs recovery/);
   await page.locator('#retained-learning button').click();const backup=await exportJapji(page);assert.equal(backup.records[KEY],raw);assert.equal(await page.evaluate(key=>localStorage.getItem(key),KEY),raw);
   await page.locator('#dialog-close').click();await page.locator('.modes button[data-depth="understand"]').click();await page.waitForTimeout(650);assert.equal(await page.evaluate(key=>localStorage.getItem(key),KEY),raw);
   return {rawRecordPreserved:true,exportPreserved:true,readingContinues:true};
  },raw);
 }
 await scenario('Japji all visible EN/PA meanings are in native accessible names',async(page,context)=>{await go(page,'full-japji.html');await japjiReady(page);await page.locator('.modes button[data-depth="understand"]').click();return await nativeNames(page,context,'Japji',385);});
 await scenario('Sukhmani all visible EN/PA meanings are in native accessible names',async(page,context)=>{await go(page,'sukhmani.html');await page.waitForFunction(()=>document.querySelectorAll('#sukhmani-text .sk-line').length===2027);await page.locator('.modes button[data-depth="understand"]').click();return await nativeNames(page,context,'Sukhmani',2027);});
 for(const name of names)await scenario('Nitnem '+name+': all visible EN/PA meanings are in native accessible names',async(page,context)=>{
  await go(page,'nitnem/index.html');await page.locator('button[data-open="'+name+'"]').click();await page.waitForFunction(({name,count})=>window.NITNEM_INTERNAL_QA?.getState().bani===name&&window.NITNEM_INTERNAL_QA.getState().sourceVerified&&document.querySelectorAll('#source-unit .scripture-line').length===count,{name,count:counts[name]});
  assert.equal(await page.evaluate(()=>window.NITNEM_INTERNAL_QA.getState().teachingAvailable),true);await page.locator('.modes button[data-mode="meaning"]').click();return await nativeNames(page,context,'Nitnem '+name,counts[name]);
 });
 if(report.runtimeErrors.length)report.checks.push({name:'No uncaught runtime errors',status:'failed',errors:report.runtimeErrors});
}catch(e){report.setupError=e.stack||String(e);}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));report.completedAtUtc=new Date().toISOString();report.status=report.setupError||report.checks.some(x=>x.status!=='passed')?'FAIL':'PASS';await fs.writeFile(path.join(root,'evidence/review-repairs-browser-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,passed:report.checks.filter(x=>x.status==='passed').length,failed:report.checks.filter(x=>x.status!=='passed').length,meaningButtonsChecked:report.accessibility.reduce((n,x)=>n+x.meaningButtonsChecked,0),setupError:report.setupError||null},null,2));if(report.status!=='PASS')process.exitCode=1;}
