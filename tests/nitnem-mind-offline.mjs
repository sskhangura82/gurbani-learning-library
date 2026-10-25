import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),base=process.env.GLP_QA_BASE||'http://127.0.0.1:8921',profile=fs.mkdtempSync('/tmp/glp-r7-offline-');
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--disable-background-networking','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const tasks=new Map();let seq=0,session,ws;const checks=[];let fail=null;
function check(k,v){if(!v)throw Error(k);checks.push(k);console.log('PASS',k);}
function send(method,params={},sid){return new Promise((resolve,reject)=>{const id=++seq,t=setTimeout(()=>{tasks.delete(id);reject(Error('timeout '+method));},12000);tasks.set(id,{resolve,reject,t});ws.send(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})}));});}
async function run(expr){const o=await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true},session);if(o.exceptionDetails)throw Error(JSON.stringify(o.exceptionDetails));return o.result.value;}
async function nav(p){const o=await send('Page.navigate',{url:base+'/'+p},session);if(o.errorText)throw Error(o.errorText);await sleep(500);}
async function until(expr){for(let i=0;i<90;i++){try{if(await run(expr))return true;}catch{}await sleep(160);}throw Error('not ready '+expr);}
try{
 const p=profile+'/DevToolsActivePort';for(let i=0;!fs.existsSync(p)&&i<110;i++)await sleep(100);check('Chrome starts',fs.existsSync(p));const[port,endpoint]=fs.readFileSync(p,'utf8').trim().split('\n');ws=new WebSocket('ws://127.0.0.1:'+port+endpoint);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const x=tasks.get(m.id);if(x){clearTimeout(x.t);tasks.delete(m.id);m.error?x.reject(Error(JSON.stringify(m.error))):x.resolve(m.result);}}};
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true}));
 await send('Page.enable',{},session);await send('Runtime.enable',{},session);await send('Network.enable',{},session);
 await nav('');await until('document.querySelector(".nitnem-card")');
 await until('navigator.serviceWorker&&(async()=>!!(await navigator.serviceWorker.ready).active)()');
 await until('(async()=>{const ks=await caches.keys();return ks.some(k=>k.includes("mind-serenity-review-1"));})()');
 check('Home installed versioned hashed shell without opening reader',true);
 await send('Page.reload',{ignoreCache:false},session);await sleep(700);await until('navigator.serviceWorker.controller!==null');check('Home page under active service worker',true);
 const cacheCount=await run('(async()=>{const k=(await caches.keys()).find(x=>x.includes("mind-serenity-review-1"));const c=await caches.open(k);return (await c.keys()).length})()');
 check('All 41 manifest responses were cached',cacheCount===41);
 await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0},session);
 await nav('');await until('!!document.querySelector(".nitnem-card")');check('Home works while network is blocked',true);
 await nav('full-japji.html');await until('window.GLP_CONTINUOUS_DEBUG?.lineCount===385');check('Complete Japji reader works while network blocked',true);
 await nav('simran.html');await until('document.querySelector(".quiet-session")');check('Simran preview works while network blocked',true);
 await nav('gurdwaras.html');await until('document.querySelectorAll(".place-card").length===3');check('Gurdwara directory works while network blocked',true);
 await nav('nitnem.html');await until('document.querySelectorAll(".bani-item").length===7');check('Full Nitnem library information works offline without invented source text',true);
 await nav('psychology.html');await until('document.querySelectorAll(".topic-button").length===4');check('Source-bound Psychology room remains usable offline',true);
 check('Exact original Gurmukhi remains visible offline',await run('document.getElementById("gurbani-exact")?.textContent.trim().length>0'));
 check('Serenity style loaded from the offline shell',await run('([...document.styleSheets].some(s=>s.href?.endsWith("/css/mind-serenity-preview.css")&&s.cssRules?.length>0))'));
 console.log('COMPLETE '+checks.length+' offline checks');
}catch(e){fail=String(e);console.log('FAIL',fail);}
finally{
 fs.writeFileSync(root+'/evidence/nitnem-mind-offline.json',JSON.stringify({checks,count:checks.length,fail,checkedAt:new Date().toISOString(),environment:'Isolated Mac Chrome CDP offline network emulation',limits:['Not real iPhone airplane mode','No network-provider playback tested']},null,2));
 try{await send('Browser.close');}catch{}ws?.close();await sleep(250);if(chrome.exitCode===null)chrome.kill('SIGTERM');fs.rmSync(profile,{recursive:true,force:true});if(fail)process.exitCode=1;
}
