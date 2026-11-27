// Browser-enforced reader SRI: unchanged positive controls and harmless altered-script probes.
// --baseline serves frozen PR56 bytes from git; ordinary mode serves the candidate worktree.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))),prefix='/gurbani-learning-library/';
const baseline=process.argv.includes('--baseline'),base='389e79baff4016a2ff61d1851908de0bd66beb8f';
if(process.argv.slice(2).some(a=>a!=='--baseline'))throw Error('Only --baseline is supported');
const stamp=new Date().toISOString().replace(/[:.]/g,'-'),out=path.join(root,'evidence','reader-sri',stamp+(baseline?'-baseline':'-candidate'));
await fs.mkdir(out,{recursive:true});
const report={schema:'glp.reader-sri-browser.v1',startedAtUtc:new Date().toISOString(),mode:baseline?'frozen-parent':'candidate',base,checks:[],limits:[
 'Fresh nonpersistent desktop Chromium contexts on localhost; no real iPhone, Safari or VoiceOver acceptance.',
 'Service workers are blocked to isolate browser subresource enforcement from worker caching.',
 'A matching integrity attribute checks subresource bytes relative to the served HTML. It does not authenticate compromised HTML, the service worker, or the root library module graph.',
 'No content or qualified-review approval follows from these checks.'
]};
const exec=promisify(execFile),cache=new Map();
async function read(relative){
 if(cache.has(relative))return cache.get(relative);
 const bytes=baseline?(await exec('git',['show',base+':'+relative],{cwd:root,encoding:'buffer',maxBuffer:64*1024*1024})).stdout:await fs.readFile(path.join(root,relative));
 cache.set(relative,bytes);return bytes;
}
const pages=[
 {page:'nitnem/index.html',query:'?bani=sohila',bani:'sohila',pack:'nitnem/data/sohila.json',entry:'nitnem/reader.js',count:6},
 {page:'full-japji.html',root:'#continuous-reader',rows:'.scripture-line',lines:385,entry:'js/japji-full.js',count:11},
 {page:'sukhmani.html',root:'#sukhmani-text',rows:'.sk-line',lines:2027,entry:'js/sukhmani-reader.js',count:7},
 {page:'salok-mahalla9/index.html',query:'?bani=salok-mahalla9',bani:'salok-mahalla9',pack:'salok-mahalla9/data/salok-mahalla9.json',entry:'nitnem/reader.js',count:6},
 {page:'salok-kabir/index.html',query:'?bani=salok-kabir',bani:'salok-kabir',pack:'salok-kabir/data/salok-kabir.json',entry:'nitnem/reader.js',count:6}
];
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
  if(!pathname.startsWith(prefix)){res.writeHead(404);res.end();return;}
  const tail=pathname.slice(prefix.length)||'index.html',relative=tail.endsWith('/')?tail+'index.html':tail;
  const file=path.resolve(root,relative);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const bytes=await read(relative);
  res.writeHead(200,{'content-type':mime[path.extname(relative)]||'application/octet-stream','cache-control':'no-store'});res.end(bytes);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
let browser;
async function scenario(name,fn,{noRuntimeErrors=false}={}){
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[];page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
 try{const details=await fn(page,context);if(noRuntimeErrors)assert.deepEqual(errors,[],'Unchanged reader must have no uncaught runtime errors');report.checks.push({name,status:'PASS',...details,uncaughtRuntimeErrorsChecked:noRuntimeErrors,runtimeErrors:errors});}
 catch(error){report.checks.push({name,status:'FAIL',error:error.stack||String(error),runtimeErrors:errors});}
 finally{await context.close();}
}
async function healthy(page,spec){
 const response=await page.goto(origin+prefix+spec.page+(spec.query||''));assert.equal(response.status(),200);
 if(spec.bani){
  const pack=JSON.parse((await read(spec.pack)).toString()),count=pack.units.reduce((n,u)=>n+u.lines.length,0);
  await page.waitForFunction(({bani,count})=>window.NITNEM_INTERNAL_QA?.getState().bani===bani&&window.NITNEM_INTERNAL_QA.getState().sourceVerified&&document.querySelectorAll('#source-unit .scripture-line').length===count,{bani:spec.bani,count});
  return {sourceRows:count};
 }
 await page.locator(spec.root+'[data-source-integrity="verified"]').waitFor();
 assert.equal(await page.locator(spec.root+' '+spec.rows).count(),spec.lines);return {sourceRows:spec.lines};
}
let syntheticLearning;
async function syntheticLearningRecords(){
 if(syntheticLearning)return syntheticLearning;
 const json=bytes=>{const text=bytes.toString();return JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,''));};
 const japji=json(await read('js/japji-full-data.js')),sukhmani=json(await read('js/sukhmani-data.js'));
 const japjiId='pauri02.line01',sukhmaniId='sukhmani.a04.p02.l03';
 assert.ok(japji.units.some(u=>u.lines.some(l=>l.id===japjiId)));
 assert.ok(sukhmani.ashtpadis.some(u=>u.lines.some(l=>l.id===sukhmaniId)));
 const note='SYNTHETIC SRI refusal preservation · ਪੰਜਾਬੀ';
 // Same valid native shapes used by source-integrity-browser's export/restore controls.
 const records={
  'glp001.continuous.v2':JSON.stringify({version:2,read:{id:japjiId,offset:0},guide:{index:0,token:0},bookmarks:[japjiId],notes:{[japjiId]:note}},null,2)+'\n',
  'glp001.sukhmani.v1':JSON.stringify({version:2,read:sukhmaniId,guide:sukhmaniId,bookmarks:[sukhmaniId],notes:{[sukhmaniId]:note}},null,2)+'\n'
 };
 // Use the native storage contract to validate independently constructed synthetic records.
 const sandbox={module:{exports:{}}};
 vm.runInNewContext((await read('nitnem/local-learning.js')).toString(),sandbox);
 const storageAPI=sandbox.module.exports;
 for(const spec of pages.filter(p=>p.bani)){
  const pack=JSON.parse((await read(spec.pack)).toString()),ids=pack.units.flatMap(u=>u.lines.map(l=>l.id));
  const marked=ids[1]||ids[0],position=ids[4]||ids.at(-1);
  const payload={notes:{[marked]:note},bookmarks:[marked],lineId:position,size:42,theme:'amrit',pace:100,mode:'meaning',view:'continuous'};
  const raw=JSON.stringify({schema:1,compositionId:pack.compositionId,editionId:pack.editionId,rev:7,savedAt:'2026-10-28T00:00:00Z',payload},null,2)+'\n';
  const key=storageAPI.keyFor(pack.compositionId,pack.editionId),memory=new Map([[key,raw]]);
  let writes=0;
  const manager=storageAPI.create(pack,{storage:{getItem:k=>memory.get(k)??null,setItem(k,v){writes++;memory.set(k,v);}},locks:null});
  assert.deepEqual(JSON.parse(JSON.stringify(manager.read().payload)),payload);
  assert.equal(writes,0);assert.equal(manager.stored().raw,raw);records[key]=raw;
 }
 syntheticLearning=records;return records;
}
async function refusedEntryState(page,records){
 const state=await page.evaluate(()=>({
  verifiedElements:document.querySelectorAll('[data-source-integrity="verified"]').length,
  receipt:typeof window.GLP_SOURCE_INTEGRITY_RECEIPT,
  nitnemVerified:window.NITNEM_INTERNAL_QA?.getState().sourceVerified===true,
  scriptureRows:document.querySelectorAll('#source-unit .scripture-line,#continuous-reader .scripture-line,#sukhmani-text .sk-line').length
 }));
 assert.deepEqual(state,{verifiedElements:0,receipt:'undefined',nitnemVerified:false,scriptureRows:0},'A refused entry reader must not expose verified-source state or scripture rows');
 const stored=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),Object.keys(records));
 assert.deepEqual(stored,records,'Every seeded note, bookmark and reading position must remain byte-identical');
 return {refusedEntryState:state,preservedLearningRecords:Object.keys(records).length,preservedRecordDigests:Object.fromEntries(Object.entries(records).map(([key,raw])=>[key,createHash('sha256').update(raw).digest('hex')]))};
}
async function altered(page,spec,relative,expectedExecution,{repinHTML=false}={}){
 const original=await read(relative),marker='window.__GLP_READER_SRI_PROBE__='+JSON.stringify(relative)+';\n',changed=Buffer.concat([Buffer.from(marker),original]);
 const refusedEntry=!expectedExecution && relative===spec.entry && !repinHTML;
 const records=refusedEntry?await syntheticLearningRecords():null;
 if(records)await page.addInitScript(records=>{for(const [key,raw]of Object.entries(records))localStorage.setItem(key,raw);},records);
 let requested=0;const consoleErrors=[];
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});
 await page.route(origin+prefix+relative,async route=>{requested++;await route.fulfill({status:200,contentType:'text/javascript; charset=utf-8',body:changed});});
 if(repinHTML){
  let html=(await read(spec.page)).toString(),seen=0;
  html=html.replace(/<script\b[^>]*><\/script>/g,tag=>{
   const src=tag.match(/\bsrc="([^"]+)"/)?.[1];if(!src)return tag;
   if(path.posix.normalize(path.posix.join(path.posix.dirname(spec.page),src))!==relative)return tag;
   seen++;const integrity='sha384-'+createHash('sha384').update(changed).digest('base64');
   return tag.replace(/\bintegrity="[^"]+"/,'integrity="'+integrity+'"');
  });
  assert.equal(seen,1);await page.route(origin+prefix+spec.page+'*',route=>route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html}));
 }
 const response=await page.goto(origin+prefix+spec.page+(spec.query||''),{waitUntil:'load'});assert.equal(response.status(),200);
 assert.equal(requested,1,'The altered subresource was actually requested');
 const markerExecuted=await page.evaluate(relative=>window.__GLP_READER_SRI_PROBE__===relative,relative);
 assert.equal(markerExecuted,expectedExecution,'Unexpected marker execution');
 const integrityRefused=consoleErrors.some(s=>/integrity/i.test(s)&&/digest|hash|blocked/i.test(s));
 if(!expectedExecution)assert.equal(integrityRefused,true,'The browser must report a subresource-integrity refusal');
 const preservation=records?await refusedEntryState(page,records):{};
 return {page:spec.page,script:relative,expectedExecution,markerExecuted,integrityRefused,repinHTML,...preservation,originalSha256:createHash('sha256').update(original).digest('hex'),alteredSha256:createHash('sha256').update(changed).digest('hex'),consoleErrors};
}
try{
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 report.environment={platform:process.platform,node:process.version,browser:browser.version()};
 for(const spec of pages)await scenario('Unmodified '+spec.page+' renders its complete source without uncaught runtime errors',async(page)=>healthy(page,spec),{noRuntimeErrors:true});
 if(baseline){
  for(const [number,script,expected] of [[0,'nitnem/reader.js',true],[1,'js/japji-full.js',true],[2,'js/sukhmani-reader.js',true],[3,'nitnem/reader.js',false],[4,'nitnem/reader.js',false]])
   await scenario('Frozen parent altered-script probe: '+pages[number].page,async page=>altered(page,pages[number],script,expected));
 }else{
  for(const spec of pages){
   const html=(await read(spec.page)).toString(),scripts=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)].map(m=>path.posix.normalize(path.posix.join(path.posix.dirname(spec.page),m[1])));
   assert.equal(scripts.length,spec.count);
   for(const relative of scripts)await scenario('Changed subresource refuses: '+spec.page+' → '+relative,async page=>altered(page,spec,relative,false));
  }
  await scenario('Explicit synthetic HTML repin permits changed script: HTML is the trust boundary',async page=>altered(page,pages[0],'nitnem/reader.js',true,{repinHTML:true}));
 }
}catch(error){report.setupError=error.stack||String(error);}
finally{
 if(browser)await browser.close();await new Promise(r=>server.close(r));
 report.completedAtUtc=new Date().toISOString();report.status=report.setupError||report.checks.some(c=>c.status!=='PASS')?'FAIL':'PASS';
 await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:report.status,mode:report.mode,checks:report.checks.length,failed:report.checks.filter(c=>c.status!=='PASS').map(c=>({name:c.name,error:c.error})),setupError:report.setupError||null,evidence:path.relative(root,out)}));
 if(report.status!=='PASS')process.exitCode=1;
}
