// Real service-worker upgrade checks on an isolated localhost origin and fresh profile.
// The previous release is read from a frozen git object; no existing user profile is opened.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const priorRef='e0a6cff22771d42ce3a2fe91ad96863daae214ed';
const prefix='/library-offline-review/';
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const out=path.join(root,'evidence/library-script-integrity/offline',stamp);
const exec=promisify(execFile),sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const additions=[
 './library/app.bundle.mjs','./articles/app.bundle.mjs',
 './library/complete-passages.json','./library/passage-contracts.mjs','./library/passages.mjs',
 './library/passage-ui.mjs','./library/search.mjs','./library/kinds.mjs',
 './knowledge/','./knowledge/index.html','./knowledge/style.css',
 './knowledge/app.bundle.mjs','./knowledge/scripture.json','./knowledge/pilot.json',
 './hukamnama/','./hukamnama/index.html','./hukamnama/style.css','./hukamnama/reader.bundle.mjs',
 './salok-farid/','./salok-farid/index.html','./salok-farid/data/library.json','./salok-farid/data/salok-farid.json',
 './collections/dasam/','./collections/dasam/index.html','./collections/collections.css','./psychology/','./psychology/index.html',
 './collections/sggs/','./collections/sggs/index.html','./collections/dasam/read.html',
 './collections/source-reader/reader.css','./collections/source-reader/reader.bundle.mjs',
 './psychology/intellectual-humility.html','./psychology/attention.html','./psychology/emotion-regulation.html','./psychology/study.css',
 './listen/','./listen/index.html','./listen/read-along.css','./collections/source-reader/read-along.bundle.mjs'
];
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8',
 '.css':'text/css; charset=utf-8','.png':'image/png','.webmanifest':'application/manifest+json'};
const report={schema:'glp.library-offline-update.v1',startedAtUtc:new Date().toISOString(),
 priorRef,checks:[],requests:[],limitations:[
 'Actual desktop Chromium service workers and Cache Storage on localhost; offline is browser network emulation.',
 'Fresh nonpersistent browser context and synthetic notes only. No real iPhone, Safari, iPad, VoiceOver or physical airplane-mode claim.',
 'Tests missing and altered bundle installation plus explicit activation of the valid candidate; not storage exhaustion or every possible failed update.',
 'A service-worker hash manifest is relative to trusted worker bytes. It does not authenticate rewritten HTML or a compromised worker.'
 ]};
const bytes={prior:new Map(),candidate:new Map()};
let phase='prior',origin,server,browser,context,page;
async function read(release,relative){
 const map=bytes[release];if(map.has(relative))return map.get(relative);
 const data=release==='prior'
  ?(await exec('git',['show',priorRef+':'+relative],{cwd:root,encoding:'buffer',maxBuffer:64*1024*1024})).stdout
  :await fs.readFile(path.join(root,relative));
 map.set(relative,data);return data;
}
function workerSpec(bytes){
 const text=bytes.toString(),version=text.match(/const VERSION="([^"]+)";/)?.[1];
 const raw=text.match(/const EXPECTED=(\{[^\n]+\});/)?.[1];
 assert.ok(version&&raw,'Worker version and exact release inventory are present');
 return {version,expected:JSON.parse(raw),workerSha256:sha(bytes)};
}
async function check(name,fn){
 try{const detail=await fn();report.checks.push({name,status:'PASS',...detail});}
 catch(error){report.checks.push({name,status:'FAIL',error:error.stack||String(error)});throw error;}
}
function cacheName(spec){return 'glp-static:'+origin+prefix+':'+spec.version;}
function expectedCache(spec){
 return Object.entries(spec.expected).map(([asset,digest])=>{
  const url=new URL(asset,origin+prefix+'sw.js');url.searchParams.set('glp_release',spec.version);
  return {url:url.href,sha256:digest};
 }).sort((a,b)=>a.url.localeCompare(b.url));
}
async function snapshot(name){
 return page.evaluate(async name=>{
  const cache=await caches.open(name),keys=await cache.keys();
  const rows=await Promise.all(keys.map(async request=>{
   const response=await cache.match(request),digest=await crypto.subtle.digest('SHA-256',await response.arrayBuffer());
   return {url:request.url,sha256:Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('')};
  }));
  return rows.sort((a,b)=>a.url.localeCompare(b.url));
 },name);
}
async function storage(){
 return page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])));
}
async function attemptUpdate(){
 return page.evaluate(async()=>{
  const registration=await navigator.serviceWorker.getRegistration();
  const oldActive=registration.active,oldController=navigator.serviceWorker.controller;
  return new Promise((resolve,reject)=>{
   let watched=false;
   const timer=setTimeout(()=>reject(Error('Update did not reach installed or redundant state')),20000);
   const observe=worker=>{
    if(!worker||watched)return;watched=true;
    const finish=()=>{
     if(!['installed','redundant','activated'].includes(worker.state))return;
     clearTimeout(timer);resolve({newWorkerState:worker.state,
      activeUnchanged:registration.active===oldActive,controllerUnchanged:navigator.serviceWorker.controller===oldController,
      waiting:!!registration.waiting});
    };
    worker.addEventListener('statechange',finish);finish();
   };
   registration.addEventListener('updatefound',()=>observe(registration.installing),{once:true});
   registration.update().then(()=>observe(registration.installing)).catch(error=>{clearTimeout(timer);reject(error);});
  });
 });
}
async function syntheticRecords(){
 const data=(await read('prior','js/sukhmani-data.js')).toString();
 const source=JSON.parse(data.slice(data.indexOf('=')+1).trim().replace(/;$/,''));
 const id='sukhmani.a04.p02.l03',note='SYNTHETIC offline update preservation · ਪੰਜਾਬੀ';
 const suk={version:2,read:id,guide:id,hasGuided:false,mode:'read',theme:'day',size:30,pace:70,
  pronunciation:false,bookmarks:[id],notes:{[id]:note}};
 const box={module:{exports:{}}};vm.runInNewContext((await read('prior','js/sukhmani-learning.js')).toString(),box);
 const api=box.module.exports;api.validate(api.model(source),suk);
 const legacy={schemaVersion:2,unit:3,line:0,token:0,mode:'read',theme:'day',radiance:true,size:30,pace:70,
  emphasis:'line',layout:'continuous',bookmarks:['pauri02'],notes:{pauri02:note}};
 const jap={module:{exports:{}}};vm.runInNewContext((await read('prior','js/learning.js')).toString(),jap);
 assert.deepEqual(JSON.parse(JSON.stringify(jap.module.exports.normalize(legacy))),legacy);
 return {'glp001.sukhmani.v1':JSON.stringify(suk,null,2)+'\n',
  'glp001.fullJapji.v1':JSON.stringify(legacy,null,2)+'\n'};
}
let prior,candidate,seed,storageBefore,priorSnapshot;
try{
 await fs.mkdir(out,{recursive:true});
 prior=workerSpec(await read('prior','sw.js'));candidate=workerSpec(await read('candidate','sw.js'));
 report.prior=prior;report.candidate=candidate;
 report.testSha256=sha(await fs.readFile(fileURLToPath(import.meta.url)));
 await check('Candidate inventory preserves the prior release, Knowledge/Daily shell and exact Farid source-only additions',async()=>{
  assert.notEqual(candidate.version,prior.version,'A changed release needs a distinct cache version');
  assert.notEqual(candidate.workerSha256,prior.workerSha256);
  assert.equal(Object.keys(prior.expected).length,85,'Frozen prior reference contains the known 85-asset release');
  assert.deepEqual(Object.keys(candidate.expected).sort(),[...new Set([...Object.keys(prior.expected),...additions])].sort(),
   'No prior asset or required new bundle/Knowledge asset may be silently omitted');
  for(const [release,spec]of [['prior',prior],['candidate',candidate]]){
   for(const [asset,digest]of Object.entries(spec.expected)){
    const relative=(asset.endsWith('/')?asset+'index.html':asset).replace(/^\.\//,'');
    assert.equal(sha(await read(release,relative)),digest,release+' exact bytes: '+asset);
   }
  }
  return {priorAssetCount:Object.keys(prior.expected).length,candidateAssetCount:Object.keys(candidate.expected).length,requiredAdditions:additions};
 });
 seed=await syntheticRecords();
 server=http.createServer(async(req,res)=>{
  try{
   const url=new URL(req.url,'http://localhost');
   if(url.pathname==='/favicon.ico'){res.writeHead(204).end();return;}
   if(!url.pathname.startsWith(prefix)){res.writeHead(404).end();return;}
   let relative=decodeURIComponent(url.pathname.slice(prefix.length));if(!relative||relative.endsWith('/'))relative+='index.html';
   if(!path.resolve(root,relative).startsWith(root+path.sep)){res.writeHead(403).end();return;}
   const requestPhase=phase,release=requestPhase==='prior'?'prior':'candidate';
   if(requestPhase==='missing'&&relative==='knowledge/app.bundle.mjs'){
    report.requests.push({phase:requestPhase,path:relative,query:url.search,status:404});
    res.writeHead(404,{'cache-control':'no-store'}).end('Synthetic missing candidate bundle');return;
   }
   let body=await read(release,relative);
   if(requestPhase==='corrupt'&&relative==='knowledge/app.bundle.mjs')
    body=Buffer.concat([body,Buffer.from('\n/* SYNTHETIC altered bundle: installation must reject these bytes. */\n')]);
   report.requests.push({phase:requestPhase,path:relative,query:url.search,status:200,sha256:sha(body)});
   res.writeHead(200,{'content-type':mime[path.extname(relative)]||'application/octet-stream','cache-control':'no-store'}).end(body);
  }catch(error){res.writeHead(404,{'cache-control':'no-store'}).end('Unavailable synthetic test asset');}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 report.environment={engine:'Desktop Chromium',browserVersion:browser.version(),platform:process.platform,node:process.version};
 context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'allow',reducedMotion:'reduce'});
 page=await context.newPage();page.setDefaultTimeout(20000);
 await check('Prior git release installs and renders before any candidate update is attempted',async()=>{
  await page.goto(origin+prefix);
  await page.waitForFunction(()=>navigator.serviceWorker.controller!==null&&document.documentElement.dataset.libraryState==='ready');
  assert.deepEqual(await page.evaluate(()=>caches.keys()),[cacheName(prior)]);
  priorSnapshot=await snapshot(cacheName(prior));assert.deepEqual(priorSnapshot,expectedCache(prior));
  await page.evaluate(records=>{for(const [key,value]of Object.entries(records))localStorage.setItem(key,value);},seed);
  storageBefore=await storage();for(const [key,value]of Object.entries(seed))assert.equal(storageBefore[key],value);
  return {cache:cacheName(prior),cachedResponses:priorSnapshot.length,
   syntheticLearningDigests:Object.fromEntries(Object.entries(seed).map(([key,value])=>[key,sha(value)]))};
 });
 for(const failure of ['corrupt','missing'])await check(failure+' candidate bundle fails installation while prior worker, exact cache and learning survive',async()=>{
  phase=failure;const start=report.requests.length,result=await attemptUpdate();
  assert.equal(result.newWorkerState,'redundant');assert.equal(result.activeUnchanged,true);assert.equal(result.controllerUnchanged,true);assert.equal(result.waiting,false);
  await page.waitForFunction(async expected=>JSON.stringify(await caches.keys())===JSON.stringify([expected]),cacheName(prior));
  assert.deepEqual(await snapshot(cacheName(prior)),priorSnapshot,'Every prior cache URL and body is unchanged');
  assert.deepEqual(await storage(),storageBefore,'Every synthetic note, bookmark and reading preference is byte-identical');
  const probe=report.requests.slice(start).find(r=>r.path==='knowledge/app.bundle.mjs'&&r.phase===failure);
  assert.ok(probe,'The candidate bundle was actually requested');assert.equal(probe.status,failure==='missing'?404:200);
  if(failure==='corrupt')assert.notEqual(probe.sha256,candidate.expected['./knowledge/app.bundle.mjs']);
  await context.setOffline(true);
  const readHash=await page.evaluate(async()=>{
   const response=await fetch('./full-japji.html');
   if(!response.ok)throw Error('Prior reader unavailable offline');
   const digest=await crypto.subtle.digest('SHA-256',await response.arrayBuffer());
   return Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
  });
  assert.equal(readHash,prior.expected['./full-japji.html'],'Prior working reader remains obtainable with the network unavailable');
  await context.setOffline(false);
  return {...result,failedAsset:probe,priorCacheVerifiedResponses:priorSnapshot.length,
   preservedLearningRecords:Object.keys(seed).length,priorReaderServedOffline:true};
 });
 await check('Valid candidate waits for explicit activation and then replaces only the prior shell',async()=>{
  phase='candidate';const result=await attemptUpdate();
  assert.equal(result.newWorkerState,'installed');assert.equal(result.activeUnchanged,true);assert.equal(result.controllerUnchanged,true);assert.equal(result.waiting,true);
  assert.deepEqual((await page.evaluate(()=>caches.keys())).sort(),[cacheName(prior),cacheName(candidate)].sort());
  assert.deepEqual(await snapshot(cacheName(prior)),priorSnapshot);
  assert.deepEqual(await snapshot(cacheName(candidate)),expectedCache(candidate));
  assert.deepEqual(await storage(),storageBefore);
  await page.evaluate(async()=>{
   const registration=await navigator.serviceWorker.getRegistration();
   await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error('Explicit update did not take control')),20000);
    navigator.serviceWorker.addEventListener('controllerchange',()=>{clearTimeout(timer);resolve();},{once:true});
    registration.waiting.postMessage({type:'ACTIVATE_GLP_UPDATE'});
   });
  });
  await page.waitForFunction(async expected=>JSON.stringify(await caches.keys())===JSON.stringify([expected]),cacheName(candidate));
  assert.deepEqual(await snapshot(cacheName(candidate)),expectedCache(candidate));
  assert.deepEqual(await storage(),storageBefore);
  return {waitingBeforeExplicitAction:true,activeCache:cacheName(candidate),cachedResponses:Object.keys(candidate.expected).length,
   preservedLearningRecords:Object.keys(seed).length};
 });
 await check('Library, complete source sheets and both Knowledge URLs render through the cached bundled graph offline',async()=>{
  await context.setOffline(true);
  const served=[];
  page.on('response',response=>{const url=new URL(response.url());if(url.origin===origin)served.push({path:url.pathname,fromServiceWorker:response.fromServiceWorker()});});
  const home=await page.goto(origin+prefix);assert.equal(home.fromServiceWorker(),true);
  await page.waitForFunction(()=>document.documentElement.dataset.libraryState==='ready');
  const source=JSON.parse((await read('candidate','knowledge/scripture.json')).toString());
  const passage=source.occurrences[0].passageId;
  const expectedLines=source.occurrences.filter(line=>line.passageId===passage).map(line=>({id:line.id,text:line.text}));
  for(const destination of ['knowledge/','knowledge/index.html']){
   const response=await page.goto(origin+prefix+destination+'#item='+encodeURIComponent(passage));
   assert.equal(response.fromServiceWorker(),true);
   await page.waitForFunction(()=>document.getElementById('search-button')?.disabled===false);
   assert.deepEqual(await page.locator('.scripture .pankti').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.occurrence,text:n.textContent.trim()}))),expectedLines);
  }
  for(const [article,collection,unit]of [['haumai-source-sheet','salok-mahalla9',19],['dubidha-source-sheet','salok-kabir',25]]){
   const response=await page.goto(origin+prefix+'articles/article.html?id='+article);
   assert.equal(response.fromServiceWorker(),true);
   await page.waitForFunction(()=>document.documentElement.dataset.sourceState==='ready');
   const pack=JSON.parse((await read('candidate',collection+'/data/'+collection+'.json')).toString());
   const target=pack.units.find(x=>x.id==='sggs.'+collection+'.salok'+String(unit).padStart(3,'0'));
   assert.deepEqual(await page.locator('.source-line').allTextContents(),target.lines.map(line=>line.text));
  }
  for(const relative of ['library/app.bundle.mjs','articles/app.bundle.mjs','knowledge/app.bundle.mjs','knowledge/scripture.json','knowledge/pilot.json'])
   assert.ok(served.some(row=>row.path===prefix+relative&&row.fromServiceWorker),'Offline graph response must come from worker: '+relative);
  assert.deepEqual(await snapshot(cacheName(candidate)),expectedCache(candidate));
  assert.deepEqual(await storage(),storageBefore,'Navigating the offline library does not modify private records');
  return {served,knowledgeCompleteOccurrences:expectedLines.length,completeSourceSheets:2,
   finalCacheVerifiedResponses:Object.keys(candidate.expected).length,preservedLearningRecords:Object.keys(seed).length};
 });
 await check('All three public psychology studies remain readable from the verified shell offline',async()=>{
  const pages=[];
  for(const [slug,title]of [['intellectual-humility','Intellectual humility'],['attention','Attention while reading'],['emotion-regulation','Emotion regulation']]){
   const response=await page.goto(origin+prefix+'psychology/'+slug+'.html');
   assert.equal(response.fromServiceWorker(),true);
   assert.equal(await page.locator('main h1').textContent(),title);
   assert.equal(await page.locator('script,input[type=password],form').count(),0);
   for(const id of ['research','limits','reflection','sources'])
    assert.ok((await page.locator('section[aria-labelledby="'+id+'"]').textContent()).length>80,id+' remains substantive offline');
   pages.push(slug);
  }
  assert.deepEqual(await snapshot(cacheName(candidate)),expectedCache(candidate));
  assert.deepEqual(await storage(),storageBefore,'Offline study never changes saved learning');
  return {pages,publicAccess:true,savedLearningUnchanged:true};
 });
}catch(error){report.failure=error.stack||String(error);process.exitCode=1;}
finally{
 await context?.close();await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));
 report.finishedAtUtc=new Date().toISOString();report.status=report.failure?'FAIL':'PASS';
 await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:report.status,checks:report.checks.length,failure:report.failure||null,evidence:path.relative(root,out)}));
}
