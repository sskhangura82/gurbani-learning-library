/* GLP-001 PR18: isolated Chrome QA of the real R7 -> M0 -> R7 -> M0 lifecycle.
 * It never opens a family browser profile or origin. It only uses disposable QA keys.
 * Needs a prebuilt, new /tmp fixture from m0-build-lifecycle-fixture.py.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const fixture=path.resolve(process.argv[2]||'');
const port=Number(process.argv[3]||8937);
if(!fixture.startsWith('/tmp/glp-serenity-loopback-qa-')||!Number.isInteger(port)||port<1024||port>65535)throw Error('Explicit disposable /tmp QA fixture and unprivileged port required');
for(const s of ['01-r7','02-m0','03-r7-rollback','04-m0-repeat']){
 const o=JSON.parse(fs.readFileSync(path.join(fixture,s,'fixture-stage.json'),'utf8'));
 if(o.stage!==s||!o.version.startsWith('qa-m0-'))throw Error('Non-QA source rejected: '+s);
}
const chromePath='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile=fs.mkdtempSync('/tmp/glp-serenity-chrome-');
const base='http://127.0.0.1:'+port,checks=[],errors=[];
let server,chrome,ws,session,seq=0,failed=null;const tasks=new Map();
const delay=t=>new Promise(r=>setTimeout(r,t));
const log=(name,data={})=>{checks.push({name,status:'PASS',data,at:new Date().toISOString()});console.log('PASS '+name);};
function ensure(b,s){if(!b)throw Error(s);}
function send(method,params={},sid){return new Promise((resolve,reject)=>{
 const id=++seq,t=setTimeout(()=>{tasks.delete(id);reject(Error('CDP timeout '+method));},20000);
 tasks.set(id,{resolve,reject,t});
 ws.send(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})}));
});}
async function run(expr){
 const x=await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true},session);
 if(x.exceptionDetails)throw Error('Browser exception: '+JSON.stringify(x.exceptionDetails));
 return x.result.value;
}
async function until(expr,label,ms=60000){
 const deadline=Date.now()+ms;
 while(Date.now()<deadline){try{if(await run(expr))return;}catch{}
  await delay(180);
 }
 const report=await run('document.getElementById("report")?.textContent').catch(()=>'(report inaccessible)');
 throw Error('Timeout '+label+'; report '+String(report).slice(-1500));
}
async function report(){return await run('JSON.parse(document.getElementById("report").textContent)');}
async function waitCheck(prefix,count){
 await until(`(()=>{let x;try{x=JSON.parse(document.getElementById("report").textContent)}catch{return false};return x.checks?.filter(z=>z.name.startsWith(${JSON.stringify(prefix)})).length>${count};})()`,prefix,85000);
 const x=await report();const f=x.checks.find(z=>z.status==='FAIL');if(f)throw Error('Fixture action FAIL: '+JSON.stringify(f));
 return x.checks.filter(z=>z.name.startsWith(prefix)).at(-1);
}
function swap(stage){
 const to=path.join(fixture,stage),tmp=path.join(fixture,'next-stage');
 ensure(!fs.existsSync(tmp)&&!fs.existsSync(tmp+'.lock'),'Unexpected pending stage');
 fs.symlinkSync(to,tmp,'dir');fs.renameSync(tmp,path.join(fixture,'current'));
}
async function readStage(stage){
 const worker=await run('(async()=>{const r=await navigator.serviceWorker.getRegistration(new URL("../",location.href));return {active:r?.active?.state,waiting:r?.waiting?.state,controller:!!navigator.serviceWorker.controller}})()');
 const reader=await run('(()=>{const a=document.getElementById("app").contentWindow;return {version:a?.GLP_CONTINUOUS_DEBUG?.version,lines:a?.GLP_CONTINUOUS_DEBUG?.lineCount,source:a?.document?.querySelectorAll(".tuk").length}})()');
 ensure(reader.lines===385,'Source count changed at '+stage+': '+reader.lines);
 ensure(worker.active==='activated','Service worker inactive at '+stage+': '+JSON.stringify(worker));
 const css=await run('(async()=>{const versions=(await caches.keys()).filter(x=>x.startsWith("glp-static:"));if(versions.length!==1)return {versions,hasCSS:false};const c=await caches.open(versions[0]);return {versions,hasCSS:!!await c.match(new URL("/css/reader-serenity.css",location.origin),{ignoreSearch:true})};})()');
 ensure(css.versions.length===1,'Stale/duplicate versioned cache '+JSON.stringify(css.versions));
 if(stage.includes('m0'))ensure(css.hasCSS,'Serenity CSS missing from active precache');
 else ensure(!css.hasCSS,'R7 incorrectly holds future candidate-only CSS');
 log('Real browser at '+stage,{reader,worker,css});
}
async function click(id){await run(`document.getElementById(${JSON.stringify(id)}).click();true`);}
async function updateTo(stage,n){
 swap(stage);
 await click('check');await waitCheck('Versioned update is waiting',n);
 const still=await run('document.getElementById("app").contentWindow.GLP_CONTINUOUS_DEBUG?.version');
 ensure(typeof still==='string','Live reader lost before user chose activation');
 log('Update waited for explicit user action '+stage,{oldReader:still});
 await click('apply');await waitCheck('Explicit application update completed',n);
 await waitCheck('Learning retained in',n+1);
 await readStage(stage);
}
try{
 server=spawn('python3',[path.join(root,'tests/serve-upgrade-fixture.py'),fixture,'--port',String(port)],{stdio:'ignore'});
 chrome=spawn(chromePath,['--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--disable-background-networking','about:blank'],{stdio:'ignore'});
 const file=path.join(profile,'DevToolsActivePort');
 for(let i=0;!fs.existsSync(file)&&i<150;i++)await delay(100);
 ensure(fs.existsSync(file),'Chrome isolated profile did not launch');
 const [devPort,endpoint]=fs.readFileSync(file,'utf8').trim().split('\n');
 ws=new WebSocket('ws://127.0.0.1:'+devPort+endpoint);
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 ws.onmessage=e=>{const msg=JSON.parse(e.data);if(msg.id){const t=tasks.get(msg.id);if(t){clearTimeout(t.t);tasks.delete(msg.id);msg.error?t.reject(Error(JSON.stringify(msg.error))):t.resolve(msg.result);}}};
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});
 ({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true}));
 await send('Runtime.enable',{},session);await send('Page.enable',{},session);
 const nav=await send('Page.navigate',{url:base+'/tests/m0-sw-browser.html'},session);
 ensure(!nav.errorText,'QA loopback navigation failed: '+nav.errorText);
 await until('!!document.getElementById("seed")','fixture ready');
 log('Real Chrome isolated loopback available',{base,profile:'disposable'});
 await click('seed');
 await waitCheck('Initial real loopback service worker installed',0);
 await waitCheck('Learning retained in',0);
 await readStage('01-r7');
 await updateTo('02-m0',0);
 await updateTo('03-r7-rollback',1);
 await updateTo('04-m0-repeat',2);
 await click('reload');
 await waitCheck('Reader reload completed',0);
 await waitCheck('Learning retained in',4);
 fs.writeFileSync(path.join(fixture,'origin-unavailable'),'QA-only origin-503 simulation');
 await click('reload');
 await waitCheck('Reader reload completed',1);
 await waitCheck('Learning retained in',5);
 const offline=await run('(()=>{const w=document.getElementById("app").contentWindow,d=w.document;return {lines:w.GLP_CONTINUOUS_DEBUG.lineCount,styleSheets:[...d.styleSheets].map(x=>x.href?.split("/").at(-1)),dockHeight:getComputedStyle(d.querySelector(".reading-dock")).height}})()');
 ensure(offline.lines===385&&offline.styleSheets.some(x=>x==='reader-serenity.css'),'Origin failure lost cached reader styles or scripture '+JSON.stringify(offline));
 log('CSS and scripture survive simulated 503 with saved learning',{offline});
 const finalReport=await report();
 ensure(finalReport.checks.every(x=>x.status==='PASS'),'Fixture report contains FAIL');
 log('No fixture FAIL results',{checks:finalReport.checks.length});
}catch(e){failed=String(e);errors.push(failed);console.error('FAIL '+failed);}
finally{
 try{fs.rmSync(path.join(fixture,'origin-unavailable'),{force:true});}catch{}
 const result={scenario:'PR18 serenity actual Chrome R7→M0→R7→M0, versioned cache, explicit activation, synthetic learning, origin 503',at:new Date().toISOString(),status:failed?'FAIL':'PASS',checks,errors,limits:['Isolated Chrome on trusted loopback, not physical iPhone','QA protocol guard and private namespace patched only inside temp fixture','Simulated origin 503, not physical airplane mode']};
 fs.writeFileSync(path.join(root,'evidence/serenity-real-lifecycle.json'),JSON.stringify(result,null,2)+'\n');
 try{if(ws?.readyState===1)await send('Browser.close')}catch{}
 try{ws?.close()}catch{}
 try{chrome?.kill('SIGTERM')}catch{}
 try{server?.kill('SIGTERM')}catch{}
 await delay(300);
 try{fs.rmSync(profile,{recursive:true,force:true})}catch{}
 try{swap('01-r7')}catch{}
 if(failed)process.exitCode=1;
 console.log('RESULT '+result.status+', '+checks.length+' evidence checks');
}
