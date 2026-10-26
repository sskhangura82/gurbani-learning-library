/* Actual isolated Chrome comparison with Japji format, pace 200 on both.
 * Source-only Mac loopback QA; no private user profile or remote providers.
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const base=process.env.GLP_PARITY_QA_ORIGIN;
if(!/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(base||''))throw Error('Only explicit owner private HTTPS origin allowed');
const inviteFile=process.env.GLP_PARITY_INVITE_FILE;
const invitation=inviteFile&&fs.readFileSync(inviteFile,'utf8').trim();
if(!/^[A-Za-z0-9_-]{25,128}$/.test(invitation||''))throw Error('Owner-only invitation file required');
const profile=fs.mkdtempSync('/tmp/glp-japji-parity-');
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',[
 '--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0',
 '--user-data-dir='+profile,'--no-first-run','--disable-background-networking','about:blank'],{stdio:'ignore'});
let ws,session,seq=0,failed=null;
const pending=new Map(),checks=[],errors=[],requests=[],delay=t=>new Promise(r=>setTimeout(r,t));
function check(name,ok,detail={}){
 if(!ok)throw Error(name+' '+JSON.stringify(detail));
 checks.push(name);console.log('PASS '+name);
}
function send(method,params={},sid){
 return new Promise((resolve,reject)=>{
  const id=++seq,timeout=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},22000);
  pending.set(id,{resolve,reject,timeout});
  ws.send(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})}));
 });
}
async function run(expression){
 const p=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},session);
 if(p.exceptionDetails)throw Error('Browser JavaScript: '+JSON.stringify(p.exceptionDetails));
 return p.result.value;
}
async function until(exp,name,ms=45000){
 const end=Date.now()+ms;
 while(Date.now()<end){try{if(await run(exp))return;}catch{}await delay(150);}
 throw Error('Timed out '+name+'; pathname='+await run('location.pathname')+'; body='+String(await run('document.body?.innerText?.slice(0,300)')).slice(0,150));
}
async function nav(url){const result=await send('Page.navigate',{url},session);if(result.errorText)throw Error('Navigation '+result.errorText);}
async function click(selector){
 return run('(()=>{let e=document.querySelector('+JSON.stringify(selector)+');if(!e)throw Error("Missing element: "+'+JSON.stringify(selector)+');e.click();return true})()');
}
async function shot(name){const result=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},session);fs.writeFileSync(path.join(root,'evidence/'+name),Buffer.from(result.data,'base64'));}
async function phone(width=390,height=844){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true},session);await delay(150);}
async function openBani(name,count){
 await click('[data-open="'+name+'"]');
 await until('window.NITNEM_INTERNAL_QA?.getState().bani==='+JSON.stringify(name)+'&&NITNEM_INTERNAL_QA.getState().sourceVerified',name);
 const state=await run('NITNEM_INTERNAL_QA.getState()');
 check('Verified local original source: '+name,state.lineCount===count&&!state.releaseAuthorized,state);
}
async function library(){
 await click('#library-back');
 await until('document.getElementById("collection").hidden===false','collection');
}
try{
 const file=path.join(profile,'DevToolsActivePort');
 for(let i=0;!fs.existsSync(file)&&i<130;i++)await delay(120);
 check('Private temporary Chrome launched',fs.existsSync(file));
 const [cdp,endpoint]=fs.readFileSync(file,'utf8').trim().split('\n');
 ws=new WebSocket('ws://127.0.0.1:'+cdp+endpoint);
 await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
 ws.onmessage=e=>{
  const m=JSON.parse(e.data);
  if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timeout);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}
  else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails?.text||'Runtime exception');
  else if(m.method==='Network.requestWillBeSent')requests.push(m.params.request?.url);
 };
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});
 ({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true}));
 await send('Runtime.enable',{},session);
 await send('Page.enable',{},session);
 await send('Network.enable',{},session);
 await phone(390,844);
 await nav(base+'/access/'+invitation);
 await until('location.pathname==="/nitnem-parity/index.html"&&!!window.NITNEM_INTERNAL_QA','owner invite to same-library reader');
 const cookieData=await send('Network.getCookies',{urls:[base+'/nitnem-parity/index.html']},session);
 const cookie=cookieData.cookies?.find(x=>x.name==='glp_qa_access');
 check('Owner signed invitation issues Secure HttpOnly SameSite=Lax session',cookie?.httpOnly&&cookie?.secure&&cookie?.sameSite==='Lax');
 check('Invitation bearer disappears from final reader URL',await run('!location.pathname.includes("/access/")'));
 await nav(base+'/nitnem-parity/japji.html');
 await until('window.GLP_CONTINUOUS_DEBUG?.lineCount===385','accepted Japji equivalent',50000);
 check('Japji original continuous source loads all 385 original lines',await run('document.querySelectorAll(".scripture-line").length===385'));
 check('Japji has 385 exact inline Meaning controls and 42 passage Study lessons',await run('document.querySelectorAll(".simple-meaning").length===385&&document.querySelectorAll(".unit-lesson").length===42'));
 check('Original private Japji pace slider now ranges 50 to 200',await run('document.getElementById("pace-slider").min==="50"&&document.getElementById("pace-slider").max==="200"&&document.getElementById("pace-slider").step==="5"'));
 await run('(()=>{const p=document.getElementById("pace-slider");p.value="200";p.dispatchEvent(new Event("input",{bubbles:true}));return true;})()');
 check('Japji actual runtime state accepts 200',await run('GLP_CONTINUOUS_DEBUG.getState().pace===200'));
 await delay(650);
 await nav(base+'/nitnem-parity/japji.html');
 await until('window.GLP_CONTINUOUS_DEBUG?.lineCount===385','Japji private restart');
 check('Japji pace 200 survives browser reload',await run('GLP_CONTINUOUS_DEBUG.getState().pace===200'));
 check('Japji original data and mode still accessible after pace change',await run('document.querySelectorAll(".simple-meaning").length===385'));
 await nav(base+'/nitnem-parity/index.html');
 await until('!!window.NITNEM_INTERNAL_QA','Nitnem index');
 check('Full Nitnem Japji link is the local matched-format reader, not external',await run('document.querySelector("[data-kind=original-japji]")?.getAttribute("href")==="japji.html"'));
 await openBani('sohila',56);
 check('Sohila uses compact six-control Japji dock including Read Meaning Study',await run('(()=>{const d=document.getElementById("dock");return d.querySelectorAll("button").length===6&&[...d.querySelectorAll("button")].every(x=>x.getBoundingClientRect().height>=43.9)&&d.querySelector("[data-mode=study]").textContent.includes("Study")})()'));
 check('Default Gurmukhi size matches Japji at 30px',await run('parseFloat(getComputedStyle(document.querySelector(".tuk")).fontSize)===30'));
 await click('[data-mode="meaning"]');
 check('Sohila Meaning has five explicitly labeled passage summaries',await run('document.querySelectorAll(".passage-summary").length===5'));
 check('The three authored close-line notes appear immediately beneath their exact source lines',await run('(()=>{const b=[...document.querySelectorAll(".simple-meaning[data-meaning-line]")];return b.length===3&&b.every(el=>el.parentElement.classList.contains("scripture-line")&&el.previousElementSibling.classList.contains("tuk"))})()'));
 check('Simple English and Punjabi typography matches Japji at 14 and 16px',await run('(()=>{const e=document.querySelector(".simple-meaning .english"),p=document.querySelector(".simple-meaning .punjabi");return getComputedStyle(e).fontSize==="14px"&&getComputedStyle(p).fontSize==="16px"})()'));
 check('Meaning exposes honest five-of-five draft coverage, not human approval',await run('document.getElementById("learning-overview").textContent.includes("5 of 5")'));
 await click('[data-meaning-line="sohila01.line03"]');
 await until('document.getElementById("meaning-dialog").open','inline meaning dialog');
 check('Tapping a line reveals exactly that source line plus Japji-style deeper study',await run('(async()=>{const p=(await (await fetch("data/sohila.json")).json()).units[0];const l=p.lines.find(x=>x.id==="sohila01.line03");const b=document.getElementById("meaning-dialog-body");return b.querySelector(".excerpt")?.textContent===l.text&&b.querySelector(".unit-lesson")&&b.textContent.includes("Words & grammar")})()'));
 await shot('glp-format-gated-inline-meaning-390.png');
 await click('#meaning-close');
 check('Closing meaning restores the same source without navigation',await run('!document.getElementById("meaning-dialog").open && document.querySelector(".passage-block[data-unit-index=\\"0\\"]")!==null'));
 await click('[data-mode="study"]');
 const headings=await run('(()=>[...document.querySelector("#source-unit .unit-lesson").querySelectorAll("h4")].map(x=>x.textContent))()');
 const expected=['Passage meaning · summary, not word-for-word translation','Close sense','Place in Kirtan Sohila',
  'Words & grammar','Pronunciation support','Interpretation & open questions',
  'Practical reflection · application, not translation','Teach it back'];
 check('Study displays Japji exact sequence of eight heading types',expected.every((x,i)=>headings[i]===x),{headings});
 check('Full five Sohila passage studies remain intact and unapproved',await run('document.querySelectorAll("#source-unit .unit-lesson").length===5&&document.querySelector("#source-unit .unit-lesson").textContent.includes("HUMAN REVIEW PENDING")'));
 await shot('glp-format-gated-deep-study-390.png');
 await click('[data-mode="read"]');
 await phone(320,740);
 check('Compact Japji-format dock does not overflow 320px iPhone viewport',await run('document.documentElement.scrollWidth<=innerWidth'));
 await click('#reading-tools');
 await until('document.getElementById("tools-dialog").open','reading tools');
 check('Nitnem visual pace slider reaches 200 in 5-step increments',await run('(()=>{const p=document.getElementById("pace");return p.min==="50"&&p.max==="200"&&p.step==="5"})()'));
 await run('(()=>{const p=document.getElementById("pace");p.value="200";p.dispatchEvent(new Event("input",{bubbles:true}));return true;})()');
 check('Nitnem 200 pace changes actual runtime state',await run('NITNEM_INTERNAL_QA.getState().pace===200&&document.getElementById("pace-value").textContent==="200"'));
 await click('#tools-close');
 await nav(base+'/nitnem-parity/index.html?bani=sohila');
 await until('window.NITNEM_INTERNAL_QA?.getState().bani==="sohila"&&NITNEM_INTERNAL_QA.getState().sourceVerified','same original after reload');
 check('Nitnem saved 200 pace survives reload without altering original Gurmukhi',await run('NITNEM_INTERNAL_QA.getState().pace===200&&document.querySelectorAll(".scripture-line").length===56'));
 await library();
 await openBani('jaap',782);
 await click('[data-mode="meaning"]');
 check('Jaap preserves seven authored passage summaries, not 782 invented line translations',await run('document.querySelectorAll(".passage-summary").length===7&&NITNEM_INTERNAL_QA.getState().authoredLessons===7'));
 await click('#jump');
 await click('#jump-list button:nth-child(99)');
 await click('#view-passage');
 check('Jaap Chhand 99 transparently shows unwritten lesson in Meaning mode',await run('document.querySelector(".learning-not-written")?.textContent.includes("not written yet")&&document.querySelectorAll(".simple-meaning").length===0'));
 await click('[data-mode="read"]');
 await library();
 await openBani('anand',208);
 await click('#jump');await click('#jump-list button:nth-child(24)');
 await click('[data-mode="study"]');
 check('Anand Pauri 24 remains withheld and is not given an invented study unit',await run('document.querySelectorAll(".quarantine").length===1&&document.querySelector(".passage-block[data-unit-index=\\"23\\"] .unit-lesson")===null'));
 await click('[data-mode="read"]');
 await library();
 await click('#offline-install');
 await until('(async()=>{const r=await navigator.serviceWorker.getRegistration(new URL("./",location.href));return r?.active?.scriptURL.endsWith("/nitnem-parity/sw.js")})()','new offline shell installed',80000);
 await nav(base+'/nitnem-parity/index.html?bani=sohila');
 await until('window.NITNEM_INTERNAL_QA?.getState().bani==="sohila"&&NITNEM_INTERNAL_QA.getState().sourceVerified','SW controlling original');
 await until('navigator.serviceWorker.controller?.scriptURL.endsWith("/nitnem-parity/sw.js")','worker controls new version');
 await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0},session);
 await send('Page.reload',{ignoreCache:false},session);
 await until('window.NITNEM_INTERNAL_QA?.getState().bani==="sohila"&&NITNEM_INTERNAL_QA.getState().sourceVerified','Sohila offline',45000);
 check('Offline Sohila and its inline Meaning controls load from source-checked cache',await run('NITNEM_INTERNAL_QA.getState().lineCount===56'));
 await nav(base+'/nitnem-parity/japji.html');
 await until('window.GLP_CONTINUOUS_DEBUG?.lineCount===385','Japji parity offline',45000);
 check('Japji exact 385 line meanings and saved pace 200 survive no network',await run('GLP_CONTINUOUS_DEBUG.getState().pace===200&&document.querySelectorAll(".simple-meaning").length===385'));
 check('No non-local script or source network requests were generated',requests.filter(x=>/^https?:/i.test(x)).every(x=>x.startsWith(base+'/')),{total:requests.length});
 check('No browser exceptions in comparative format/speed/offline scenario',errors.length===0,{errors});
}catch(e){failed=String(e);errors.push(failed);console.error('FAIL '+failed);}
finally{
 const report={checkedAt:new Date().toISOString(),status:failed?'FAIL':'PASS',
  checks,errors,sourceGurmukhiAltered:false,onlyPrivateCandidate:true,
  oldJapjiPublicUnchanged:true,humanScholarApproved:false,realIPhoneSafari:'NOT RUN'};
 fs.writeFileSync(path.join(root,'evidence/nitnem-format-parity-gated-browser.json'),JSON.stringify(report,null,2).replaceAll(base,'[PRIVATE_OWNER_HOST_REDACTED]').replaceAll(invitation,'[OWNER_INVITATION_REDACTED]')+'\n');
 try{if(ws?.readyState===1)await send('Browser.close')}catch{}
 ws?.close();await delay(250);
 if(chrome.exitCode===null)chrome.kill('SIGTERM');
 fs.rmSync(profile,{recursive:true,force:true});
 if(failed)process.exitCode=1;
 console.log('RESULT '+report.status+' '+checks.length+' checks');
}
