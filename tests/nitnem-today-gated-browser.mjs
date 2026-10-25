/* GLP-001 Full Nitnem today — actual Chrome QA. Gated external HTTPS only; no family data.
 * The seven reading links are external on purpose; this test never opens those
 * websites or makes any user spiritual activity visible outside test profile.
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const origin=process.env.GLP_NITNEM_PRIVATE_HTTPS_ORIGIN;
const inviteFile=process.env.GLP_NITNEM_PRIVATE_INVITE_FILE;
if(!origin||!/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(origin)||!inviteFile)
 throw Error('Explicit verified private HTTPS origin and local invite-file required');
const invite=fs.readFileSync(inviteFile,'utf8').trim();
if(!/^[A-Za-z0-9_-]{25,128}$/.test(invite))throw Error('Invalid private invite file');
const inviteUrl=origin+'/access/'+invite;
const profile=fs.mkdtempSync('/tmp/glp-nitnem-hub-');
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--disable-background-networking','about:blank'],{stdio:'ignore'});
let session,ws,seq=0,failed=null;const pending=new Map(),checks=[],errors=[],requests=[];
const wait=t=>new Promise(r=>setTimeout(r,t));
function ok(name,pass,data={}){if(!pass)throw Error(name+' '+JSON.stringify(data));checks.push({name,status:'PASS',data});console.log('PASS '+name);}
function send(method,params={},sid){return new Promise((resolve,reject)=>{const id=++seq,t=setTimeout(()=>{pending.delete(id);reject(Error('CDP '+method+' timeout'));},14000);pending.set(id,{resolve,reject,t});ws.send(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})}));});}
async function run(x){const r=await send('Runtime.evaluate',{expression:x,awaitPromise:true,returnByValue:true},session);if(r.exceptionDetails)throw Error('Browser JS error '+JSON.stringify(r.exceptionDetails));return r.result.value;}
async function until(expr,label){for(let i=0;i<120;i++){try{if(await run(expr))return;}catch{}await wait(100);}throw Error('Timeout '+label);}
try{
 const p=path.join(profile,'DevToolsActivePort');
 for(let i=0;!fs.existsSync(p)&&i<130;i++)await wait(100);
 ok('Fresh isolated browser launched',fs.existsSync(p));
 const [remote,ep]=fs.readFileSync(p,'utf8').trim().split('\n');
 ws=new WebSocket('ws://127.0.0.1:'+remote+ep);await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
 ws.onmessage=e=>{const x=JSON.parse(e.data);if(x.id){const t=pending.get(x.id);if(t){clearTimeout(t.t);pending.delete(x.id);x.error?t.reject(Error(JSON.stringify(x.error))):t.resolve(x.result);}}else if(x.method==='Runtime.exceptionThrown')errors.push('Uncaught browser exception');else if(x.method==='Network.requestWillBeSent')requests.push(x.params.request.url);};
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true}));
 await send('Page.enable',{},session);await send('Runtime.enable',{},session);await send('Network.enable',{},session);
 const nav=await send('Page.navigate',{url:inviteUrl},session);
 ok('Private invitation opens trusted HTTPS',!nav.errorText);
 await until('location.pathname==="/nitnem-today.html"&&document.querySelectorAll("[data-complete]").length===7','invitation finishes on Full Nitnem');
 const gate=await send('Network.getCookies',{urls:[origin+'/nitnem-today.html']},session);
 const cookie=gate.cookies?.find(x=>x.name==='glp_qa_access');
 ok('Secure HttpOnly SameSite signed cookie issued',cookie?.secure&&cookie?.httpOnly&&cookie?.sameSite==='Lax');
 ok('Invitation bearer token is absent from final reader address',await run('!location.href.includes("/access/")'));
 ok('Seven complete reading destinations grouped into 5 morning, 1 evening, 1 night',await run('document.querySelectorAll("#morning .bani").length===5 && document.querySelectorAll("#evening .bani").length===1 && document.querySelectorAll("#night .bani").length===1'));
 ok('Japji points to our own source and other six to external HTTPS full text',await run('(()=>{let a=[...document.querySelectorAll(".bani .primary")];return a.length===7&&a[0].getAttribute("href")==="full-japji.html"&&a.slice(1).every(x=>x.href.startsWith("https://")&&x.target==="_blank"&&x.rel.includes("noopener"))})()'));
 ok('Ardas kept separate from seven banis',await run('document.querySelectorAll(".ardas a[href^=https]").length===1'));
 ok('Nothing is automatically marked complete on page load',await run('document.getElementById("progress-label").textContent==="0 of 7 complete"'));
 for(const [w,h] of [[320,740],[390,844]]){
  await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:true},session);
  await wait(220);
  const data=await run('({scroll:document.documentElement.scrollWidth,width:innerWidth,buttonHeights:[...document.querySelectorAll(".bani .primary,.bani .complete")].map(x=>x.getBoundingClientRect().height),targets:document.querySelectorAll(".bani .primary").length})');
  ok(w+'px phone: no horizontal overflow and reading/complete targets 44px',data.width===w&&data.scroll<=w&&data.targets===7&&data.buttonHeights.every(x=>x>=44),data);
 }
 await run('document.querySelector("[data-complete=japji]").click()');
 ok('Explicit mark changes only one of seven',await run('document.getElementById("progress-label").textContent==="1 of 7 complete"&&document.querySelectorAll("[data-complete][aria-pressed=true]").length===1'));
 ok('Only local, explicitly requested completion recorded',await run('(()=>{const x=JSON.parse(localStorage.getItem("glp001.nitnem-today.progress.v1"));return x.complete.length===1&&x.complete[0]==="japji"})()'));
 await send('Page.reload',{},session);
 await until('document.readyState==="complete"&&document.getElementById("progress-label")?.textContent==="1 of 7 complete"','hub reopened with saved mark');
 ok('Marked daily completion persists on reload',await run('document.getElementById("progress-label").textContent==="1 of 7 complete"'));
 await run('document.querySelector("[data-complete=japji]").click()');
 ok('Mark toggles off without changing any external reading',await run('document.getElementById("progress-label").textContent==="0 of 7 complete"'));
 await run('document.querySelectorAll("[data-complete]").forEach(b=>b.click())');
 ok('Seven separate completion controls reach 7/7',await run('document.getElementById("progress-label").textContent==="7 of 7 complete"'));
 await run('(()=>{const k="glp001.nitnem-today.progress.v1";localStorage.setItem(k,JSON.stringify({date:"2026-01-01",complete:["japji","jaap"]}));})()');
 await send('Page.reload',{},session);
 await until('document.readyState==="complete"&&document.getElementById("progress-label")?.textContent==="0 of 7 complete"','hub reloaded next day');
 ok('Previous-day marks are not mistaken for current completion',await run('document.getElementById("progress-label").textContent==="0 of 7 complete"'));
 ok('No external provider is loaded merely by opening the Nitnem hub',requests.filter(x=>x.startsWith('https://')).every(x=>x.startsWith(origin+'/')),{requestCount:requests.length});
 const reader=await send('Page.navigate',{url:origin+'/full-japji.html'},session);
 ok('Existing Serenity Japji route stays navigable',!reader.errorText);
 await until('window.GLP_CONTINUOUS_DEBUG?.lineCount===385','full Japji original source ready');
 ok('Existing Japji 385 original occurrences stay available',await run('GLP_CONTINUOUS_DEBUG.lineCount===385'));
 const returnHub=await send('Page.navigate',{url:origin+'/nitnem-today.html'},session);
 ok('Returning from existing reader to Full Nitnem does not lose the hub',!returnHub.errorText);
 await until('document.querySelectorAll("[data-complete]").length===7','hub after original reader');
 ok('Hub route is not replaced by the original service-worker offline fallback',await run('document.title.includes("Nitnem")&&document.getElementById("page-title").textContent.includes("ਨਿਤਨੇਮ")'));
 ok('No unhandled script errors',errors.length===0);
 const png=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},session);
 fs.writeFileSync(path.join(root,'evidence/nitnem-today-gated-390.png'),Buffer.from(png.data,'base64'));
}catch(e){failed=String(e);errors.push(failed);console.error('FAIL '+failed);}
finally{
 const result={checkedAt:new Date().toISOString(),status:failed?'FAIL':'PASS',checks,errors,
  scope:'Mac Chrome phone viewport, invite-gated HTTPS Full Nitnem portal and original Japji reader; not physical iOS Safari',
  publicationScope:'GATED LINKED READING PREVIEW; external sources not edition certified',
  appScriptureChanged:false,externalSourceContentsCopied:false};
 fs.writeFileSync(path.join(root,'evidence/nitnem-today-gated-browser.json'),JSON.stringify(result,null,2)+'\n');
 try{if(ws?.readyState===1)await send('Browser.close')}catch{}
 try{ws?.close()}catch{}
 await wait(200);
 if(chrome.exitCode===null)chrome.kill('SIGTERM');
 fs.rmSync(profile,{recursive:true,force:true});
 if(failed)process.exitCode=1;
 console.log('RESULT '+result.status+' '+checks.length+' checks');
}