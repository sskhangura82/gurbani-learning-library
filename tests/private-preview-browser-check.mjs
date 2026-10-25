/* GLP-001: private HTTPS Serenity preview, real Chrome + service worker.
 * Headless Mac Chrome is not iPhone Safari or VoiceOver acceptance.
 * Never reads family origin/storage or exports synthetic notes.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const preview=process.env.GLP_PRIVATE_PREVIEW_URL;
const url=preview&&new URL(preview);
if(!url||url.protocol!=='https:'||!url.hostname.endsWith('.ts.net')||!['10000','10001'].includes(url.port)||url.pathname!=='/full-japji.html')
 throw Error('Set GLP_PRIVATE_PREVIEW_URL to the private tailnet HTTPS reader URL on approved port 10000 or 10001');
const source=preview;
const profile=fs.mkdtempSync('/tmp/glp-private-phoneqa-');
const chromePath='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chrome=spawn(chromePath,['--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--disable-background-networking','about:blank'],{stdio:'ignore'});
let seq=0,ws,session,failed=null;
const pending=new Map(),checks=[],errors=[],delay=t=>new Promise(r=>setTimeout(r,t));
function assert(ok,name,details={}){if(!ok)throw Error(name);checks.push({name,status:'PASS',details,at:new Date().toISOString()});console.log('PASS '+name);}
function send(method,params={},sid){return new Promise((resolve,reject)=>{
 const id=++seq,t=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},20000);
 pending.set(id,{resolve,reject,t});ws.send(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})}));
});}
async function run(expression){
 const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},session);
 if(result.exceptionDetails)throw Error('Browser JS exception '+JSON.stringify(result.exceptionDetails));
 return result.result.value;
}
async function until(expression,name,timeout=30000){
 const limit=Date.now()+timeout;
 while(Date.now()<limit){
  try{if(await run(expression))return;}catch{}
  await delay(170);
 }
 throw Error('Timeout: '+name);
}
async function nav(uri,label){
 const p=await send('Page.navigate',{url:uri},session);
 if(p.errorText)throw Error('Navigation failure '+label+': '+p.errorText);
}
async function reload(label){
 await send('Page.reload',{ignoreCache:false},session);
 await delay(700);
 await until('document.readyState==="complete"&&window.GLP_CONTINUOUS_DEBUG?.lineCount===385',label+' reader ready');
}
const synthetic='GLP Serenity QA synthetic Punjabi · ਸਿਰਫ਼ ਟੈਸਟ';
try{
 const pf=path.join(profile,'DevToolsActivePort');
 for(let i=0;!fs.existsSync(pf)&&i<120;i++)await delay(100);
 assert(fs.existsSync(pf),'Isolated Chrome profile started');
 const [port,endpoint]=fs.readFileSync(pf,'utf8').trim().split('\n');
 ws=new WebSocket('ws://127.0.0.1:'+port+endpoint);
 await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.t);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown'){errors.push('Runtime exception');}};
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});
 ({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true}));
 await send('Page.enable',{},session);await send('Runtime.enable',{},session);await send('Network.enable',{},session);
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true},session);
 await nav(source,'private preview');
 await until('window.GLP_CONTINUOUS_DEBUG?.lineCount===385','reader data');
 const env=await run('({secure:isSecureContext,sw:"serviceWorker" in navigator,locks:!!navigator.locks,reader:GLP_CONTINUOUS_DEBUG?.version,lines:GLP_CONTINUOUS_DEBUG?.lineCount,css:[...document.styleSheets].some(s=>s.href?.endsWith("/css/reader-serenity.css")&&s.cssRules?.length>0)})');
 assert(env.secure&&env.sw&&env.locks,'Private URL provides real HTTPS, SW and Web Locks',{secure:env.secure,sw:env.sw,locks:env.locks});
 assert(env.lines===385&&env.css,'Complete reader and Serenity styling rendered',{version:env.reader});
 const corpus=await run('JSON.stringify([...document.querySelectorAll(".tuk")].map(x=>x.textContent))===JSON.stringify(GLP_FULL_JAPJI.units.flatMap(u=>u.lines.map(l=>l.text)))');
 assert(corpus,'Original 385 Gurmukhi source strings byte-equivalent');
 for(const [w,h] of [[320,740],[390,844]]){
  await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:true},session);
  await delay(280);
  const g=await run('(()=>{const d=document.querySelector(".reading-dock").getBoundingClientRect();return {scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,dockHeight:Math.round(d.height),controls:[...document.querySelectorAll(".reading-dock > button,.reading-dock .modes button")].map(x=>({width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height}))};})()');
  assert(g.scrollWidth<=w&&g.controls.length===6&&g.controls.every(t=>t.height>=44&&t.width>=44),'Serenity 6-button dock fits '+w+'px',{dockHeight:g.dockHeight});
 }
 await until('(async()=>!!(await navigator.serviceWorker.ready).active)()','service worker active',45000);
 await reload('controlled page');
 await until('navigator.serviceWorker.controller!==null','reader controlled',20000);
 const cached=await run('(async()=>{const ks=(await caches.keys()).filter(k=>k.startsWith("glp-static:"));const c=await caches.open(ks[0]);return {keys:ks.length,hasCSS:!!await c.match(new URL("/css/reader-serenity.css",location.origin),{ignoreSearch:true}),hasReader:!!await c.match(new URL("/full-japji.html",location.origin),{ignoreSearch:true})};})()');
 assert(cached.keys===1&&cached.hasCSS&&cached.hasReader,'Versioned release worker caches Serenity CSS and reader',{versionCount:cached.keys});
 // The actual app UI owns both writes. Use synthetic QA-only data on this new origin.
 await run('document.getElementById("tools-open").click();true');
 await until('!!document.querySelector("#dialog-body [data-action=note]")','reflection action in reading menu');
 await run('document.querySelector("#dialog-body [data-action=note]").click();true');
 await until('!!document.getElementById("reflection")&&!document.getElementById("reflection").disabled','editor lease',25000);
 await run('(()=>{const e=document.getElementById("reflection");e.value='+JSON.stringify(synthetic)+';e.dispatchEvent(new Event("input",{bubbles:true}));return true;})()');
 await until('document.getElementById("note-status")?.textContent.includes("Saved in this browser")','reflection persisted',25000);
 await run('document.getElementById("dialog-close").click();true');
 await until('!document.getElementById("reader-dialog").open','reflection closed');
 await run('document.getElementById("tools-open").click();true');
 await until('!!document.querySelector("#dialog-body [data-action=reader-save]")','bookmark action');
 await run('document.querySelector("#dialog-body [data-action=reader-save]").click();true');
 await delay(450);
 await reload('browser learning reload');
 const learn=await run('(()=>{const s=window.GLP_CONTINUOUS_DEBUG.getState();return {notes:Object.values(s.notes).length,synthetic:Object.values(s.notes).some(v=>v.includes("GLP Serenity QA synthetic Punjabi")),bookmarks:s.bookmarks.length}})()');
 assert(learn.synthetic&&learn.bookmarks>0,'Synthetic reflection and bookmark persist after reload',{notes:learn.notes,bookmarks:learn.bookmarks});
 await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0},session);
 await reload('offline cached reader');
 const offReader=await run('({lines:window.GLP_CONTINUOUS_DEBUG.lineCount,css:[...document.styleSheets].some(s=>s.href?.endsWith("/css/reader-serenity.css")&&s.cssRules?.length>0)})');
 assert(offReader.lines===385&&offReader.css,'Full original reader and stylesheet work with network blocked');
 await nav(new URL('index.html',source).href,'offline home');
 await until('!!document.querySelector(".nitnem-card")','offline home rendered');
 assert(true,'Home loads from cache with network blocked');
 await nav(source,'offline reader return');
 await until('window.GLP_CONTINUOUS_DEBUG?.lineCount===385','offline reader return');
 const after=await run('(()=>{const s=window.GLP_CONTINUOUS_DEBUG.getState();return {saved:Object.values(s.notes).some(v=>v.includes("GLP Serenity QA synthetic Punjabi")),bookmarks:s.bookmarks.length}})()');
 assert(after.saved&&after.bookmarks>0,'Synthetic saved learning survives offline navigation');
 await send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1},session);
 assert(errors.length===0,'No browser runtime exceptions in tested flow');
}catch(e){failed=String(e);errors.push(failed);console.error('FAIL '+failed);}
finally{
 const result={testedAt:new Date().toISOString(),scope:'Private tailnet HTTPS reader on disposable Mac Chrome mobile viewports',status:failed?'FAIL':'PASS',checks,errors,notes:['Only synthetic QA learning on new isolated origin; no personal notes read or exported','Native iPhone Safari/VoiceOver and real airplane mode NOT TESTED','Private tailnet URL intentionally omitted from public evidence']};
 fs.writeFileSync(path.join(root,'evidence/serenity-private-https-readiness.json'),JSON.stringify(result,null,2)+'\n');
 try{if(ws?.readyState===1)await send('Browser.close')}catch{}
 ws?.close();await delay(300);if(chrome.exitCode===null)chrome.kill('SIGTERM');
 fs.rmSync(profile,{recursive:true,force:true});
 if(failed)process.exitCode=1;
 console.log('RESULT '+result.status+' checks='+checks.length);
}
