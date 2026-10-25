/* Actual Chrome QA for private internal FULL Nitnem source-only reader.
 * Loopback-only; real service worker and real local storage; no family browser.
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const base=process.env.GLP_NITNEM_GATED_ORIGIN;
if(!base||!/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(base))
 throw Error('Require exact verified private HTTPS QA host, never a general remote target');
const invitePath=process.env.GLP_NITNEM_GATED_INVITE_FILE;
const invite=invitePath&&fs.readFileSync(invitePath,'utf8').trim();
if(!invite||!/^[A-Za-z0-9_-]{25,128}$/.test(invite))
 throw Error('Private invitation must be provided in an owner-only file, not source/command args');
const profile=fs.mkdtempSync('/tmp/glp-internal-nitnem-gated-');
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',[
 '--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0',
 '--user-data-dir='+profile,'--no-first-run','--disable-background-networking','about:blank'],{stdio:'ignore'});
let ws,session,seq=0,failed=null;
const pending=new Map(),checks=[],errors=[],requests=[],delay=t=>new Promise(r=>setTimeout(r,t));
function check(name,ok,detail={}){if(!ok)throw Error(name+' '+JSON.stringify(detail));checks.push({name,result:'PASS',detail});console.log('PASS '+name);}
function send(method,params={},sid){return new Promise((resolve,reject)=>{
 const id=++seq,timeout=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},20000);
 pending.set(id,{resolve,reject,timeout});
 ws.send(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})}));
});}
async function run(expression){
 const p=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},session);
 if(p.exceptionDetails)throw Error('Chrome JS: '+JSON.stringify(p.exceptionDetails));
 return p.result.value;
}
async function until(expression,label,ms=45000){
 const end=Date.now()+ms;
 while(Date.now()<end){try{if(await run(expression))return;}catch{}await delay(160);}
 throw Error('Timeout '+label+': '+String(await run('document.getElementById("announcer")?.textContent').catch(()=>'?')).slice(-700));
}
async function click(q){await run('(()=>{const el=document.querySelector('+JSON.stringify(q)+');if(!el)throw Error("No button");el.click();return true})()');}
async function nav(u){const r=await send('Page.navigate',{url:u},session);if(r.errorText)throw Error('Page navigation '+r.errorText);}
async function viewport(w,h){await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:true},session);await delay(200);}
async function source(k,n,m){
 await click('[data-open="'+k+'"]');
 await until('NITNEM_INTERNAL_QA.getState().bani==='+JSON.stringify(k)+'&&NITNEM_INTERNAL_QA.getState().sourceVerified','Bani '+k);
 const s=await run('NITNEM_INTERNAL_QA.getState()');
 check(k+' is verified, internally loaded and NOT approved',s.sourceVerified&&s.lineCount===n&&s.unitCount===m&&!s.releaseAuthorized,s);
 return s;
}
async function back(){
 await click('#library-back');await until('document.getElementById("collection").hidden===false','collection');
}
try{
 const file=path.join(profile,'DevToolsActivePort');
 for(let i=0;!fs.existsSync(file)&&i<150;i++)await delay(110);
 check('Fresh isolated Chrome profile launched',fs.existsSync(file));
 const [cdp,ep]=fs.readFileSync(file,'utf8').trim().split('\n');
 ws=new WebSocket('ws://127.0.0.1:'+cdp+ep);
 await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timeout);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails?.text||'Chrome exception');else if(m.method==='Network.requestWillBeSent')requests.push(m.params.request?.url);};
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});
 ({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true}));
 await send('Runtime.enable',{},session);await send('Page.enable',{},session);await send('Network.enable',{},session);
 await viewport(390,844);
 await nav(base+'/access/'+invite);
 await until('location.pathname==="/nitnem/index.html"&&!!window.NITNEM_INTERNAL_QA','private access redirects to integrated reader',35000);
 const secure=await send('Network.getCookies',{urls:[base+'/nitnem/index.html']},session);
 const auth=secure.cookies?.find(x=>x.name==='glp_qa_access');
 check('Existing private invitation opens IN-APP all-seven reader with Secure HttpOnly SameSite cookie',!!auth&&auth.secure&&auth.httpOnly&&auth.sameSite==='Lax');
 check('Private bearer invitation is absent from final reader address',await run('!location.href.includes("/access/")'));
 const cards=await run('({all:document.querySelectorAll(".bani-card").length,internal:document.querySelectorAll(".bani-card[data-open]").length,links:[...document.querySelectorAll(".bani-card[href]")].map(a=>a.getAttribute("href")),warn:document.querySelector(".candidate-banner").textContent})');
 check('All seven bani cards are inside library and ONLY Japji links to an internal route',cards.all===7&&cards.internal===6&&cards.links.length===1&&cards.links[0]==='../full-japji.html',cards);
 check('Private source and qualified-review warning visibly shown',cards.warn.includes('source-review')&&cards.warn.includes('not completed'));
 const lib=await run('NITNEM_INTERNAL_QA.library().then(m=>({keys:Object.keys(m.entries).sort(),family:m.familyReady,commit:m.sourceCommit,source:m.sourceCleared}))');
 check('Original-source manifest has exact six candidate entries and no publication authority',lib.keys.join(',')==='anand,chaupai,jaap,rehras,savaiye,sohila'&&!lib.family&&!lib.source&&lib.commit==='373ccc34f4a1c0ccb6ce36654bf6e9574087200f');
 await source('sohila',56,5);
 let meta=await run('({units:document.querySelectorAll(".unit-heading").length,originalRows:document.querySelectorAll(".scripture-line").length,pa:document.getElementById("bani-title").textContent,first:document.querySelector(".scripture-line .tuk")?.textContent,links:document.querySelectorAll("#reader a").length})');
 check('Sohila source contains visible original Gurmukhi and no third-party links',meta.units===1&&meta.originalRows===12&&meta.first?.startsWith('ਸੋਹਿਲਾ ਰਾਗੁ')&&meta.links===0,meta);
 await click('#next-unit');
 check('Next passage moves to Sohila Shabad 2 in same reader',await run('NITNEM_INTERNAL_QA.getState().unit===1'));
 await click('#jump');
 check('Passage menu has exactly five directly accessible Sohila sections',await run('document.querySelectorAll("#jump-list button").length===5'));
 await click('#jump-list button:last-child');
 check('Jump to final Sohila Shabad 5 works',await run('NITNEM_INTERNAL_QA.getState().unit===4'));
 await click('[data-mode="meaning"]');
 check('Meaning keeps original Gurmukhi visible but does not fabricate a translation',await run('!document.getElementById("review-mode").hidden&&document.getElementById("review-mode").textContent.includes("No guessed translation")&&!!document.querySelector(".tuk")'));
 await click('[data-mode="study"]');
 check('Study offers source-line facts, not purported religious interpretation',await run('document.querySelectorAll(".source-study dt").length===5&&document.getElementById("review-mode").textContent.includes("source-location facts")'));
 await click('[data-mode="read"]');
 await viewport(320,740);
 const phone=await run('({width:innerWidth,scroll:document.documentElement.scrollWidth,dockVisible:!document.getElementById("dock").hidden,dockWidth:Math.round(document.getElementById("dock").getBoundingClientRect().width),targets:[...document.querySelectorAll("#dock button")].map(x=>Math.round(x.getBoundingClientRect().height))})');
 check('Small iPhone viewport fits reader and six dock buttons ≥44px',phone.width===320&&phone.scroll<=320&&phone.dockVisible&&phone.targets.length===6&&phone.targets.every(h=>h>=44),phone);
 await click('#reading-tools');
 await until('document.getElementById("tools-dialog").open','tools open');
 await run('(()=>{const v=document.getElementById("size");v.value="60";v.dispatchEvent(new Event("input",{bubbles:true}));const theme=document.getElementById("theme");theme.value="amrit";theme.dispatchEvent(new Event("change",{bubbles:true}));return true})()');
 check('60px Gurmukhi and Amrit dark appearance controlled and visible',await run('parseFloat(getComputedStyle(document.querySelector(".tuk")).fontSize)===60 && document.body.dataset.theme==="amrit"'));
 await click('#bookmark');
 check('Private scoped bookmark saves by source occurrence',await run('NITNEM_INTERNAL_QA.getState().bookmarks===1'));
 await run('(()=>{const note=document.getElementById("note");note.value="QA-only reflection · ਸਤਿ ਨਾਮ";return true})()');
 await click('#save-note');
 check('Private reflection saves in this bani/edition local namespace',await run('NITNEM_INTERNAL_QA.getState().notes===1 && document.getElementById("save-status").textContent.includes("Saved in this browser")'));
 await click('#tools-close');
 await nav(base+'/nitnem/index.html?bani=sohila');
 await until('NITNEM_INTERNAL_QA.getState().sourceVerified&&NITNEM_INTERNAL_QA.getState().bani==="sohila"','Sohila reload persisted');
 check('Saved source-scoped learning, size and theme survive full reload',await run('NITNEM_INTERNAL_QA.getState().bookmarks===1 && NITNEM_INTERNAL_QA.getState().notes===1 && document.body.dataset.theme==="amrit" && parseFloat(getComputedStyle(document.querySelector(".tuk")).fontSize)===60'));
 await back();await source('savaiye',40,10);
 check('Savaiye independent learning namespace has no Sohila bookmarks/notes',await run('NITNEM_INTERNAL_QA.getState().notes===0&&NITNEM_INTERNAL_QA.getState().bookmarks===0'));
 await back();await source('chaupai',116,29);
 check('Chaupai reader clearly labels 29-pauri digital variation, not SGPC-universal original',await run('document.getElementById("bani-variant").textContent.includes("29-pauri") && document.getElementById("bani-variant").textContent.includes("NOT adjudicated")'));
 await back();await source('jaap',782,199);
 check('Long Jaap does not render 782 rows in the DOM at once',await run('document.querySelectorAll(".scripture-line").length < 20 && document.querySelectorAll(".unit-heading").length===1'));
 await click('#jump');
 check('Jaap picker has 199 chhands',await run('document.querySelectorAll("#jump-list button").length===199'));
 await click('#jump-list button:nth-child(99)');
 check('Direct navigation to chhand 99 works',await run('NITNEM_INTERNAL_QA.getState().unit===98&&document.querySelector(".unit-heading")?.textContent.includes("99")'));
 await back();await source('anand',208,40);
 await click('#jump');await click('#jump-list button:nth-child(24)');
 const held=await run('({unit:NITNEM_INTERNAL_QA.getState().unit,warnings:document.querySelectorAll(".quarantine").length,hasPUA:document.querySelector("#source-unit").textContent.includes(String.fromCharCode(0xF03D)),holdText:document.querySelector(".quarantine")?.textContent})');
 check('Anand Pauri 24 original is held with visible warning, no PUA displayed',held.unit===23&&held.warnings===1&&!held.hasPUA&&held.holdText.includes('source review'),held);
 await back();await source('rehras',159,44);
 await click('#jump');await click('#jump-list button:nth-child(35)');
 const mixed=await run('({source:document.querySelector(".unit-source")?.textContent,head:document.querySelector(".unit-heading")?.textContent,unit:NITNEM_INTERNAL_QA.getState().unit})');
 check('Mixed SGGS+Dasam Rehras Savaiya unit is independently labeled as Dasam',mixed.unit===34&&mixed.head?.includes('Savaiya'),mixed);
 await viewport(390,844);
 check('Rehras mixed-source reader has no horizontal overflow',await run('document.documentElement.scrollWidth<=innerWidth'));
 const screenshot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},session);
 fs.writeFileSync(path.join(root,'evidence/nitnem-internal-gated-rehras-390.png'),Buffer.from(screenshot.data,'base64'));
 await back();
 const install=await run('NITNEM_INTERNAL_QA.getState().sourceVerified===false && !!document.getElementById("offline-install")');
 check('Offline install is explicit opt-in, preserving the existing Japji service worker',install);
 await click('#offline-install');
 await until('(async()=>{const r=await navigator.serviceWorker.getRegistration(new URL("./",location.href));return r?.active?.scriptURL?.endsWith("/nitnem/sw.js")})()','nitnem scoped SW active',80000);
 const registration=await run('(async()=>{const r=await navigator.serviceWorker.getRegistration(new URL("./",location.href));return {active:r?.active?.state,scope:r?.scope,script:r?.active?.scriptURL,keys:(await caches.keys()).filter(x=>x.startsWith("glp-nitnem-source-review:"))}})()');
 check('New worker is ONLY registered under /nitnem/ with one source-bound cache',registration.active==='activated'&&registration.scope.endsWith('/nitnem/')&&registration.keys.length===1,registration);
 await nav(base+'/nitnem/index.html?bani=jaap');
 await until('NITNEM_INTERNAL_QA.getState().bani==="jaap"&&NITNEM_INTERNAL_QA.getState().sourceVerified','Jaap controlled online');
 await until('navigator.serviceWorker.controller?.scriptURL.endsWith("/nitnem/sw.js")','scope-controlled page',30000);
 await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0},session);
 await send('Page.reload',{ignoreCache:false},session);
 await until('NITNEM_INTERNAL_QA.getState().bani==="jaap"&&NITNEM_INTERNAL_QA.getState().sourceVerified','Jaap offline reload',45000);
 check('Whole Jaap original 199/782 reads from private verified offline cache with network BLOCKED',await run('(()=>{const s=NITNEM_INTERNAL_QA.getState();return s.lineCount===782 && s.unitCount===199})()'));
 await back();await source('anand',208,40);
 check('Different Anand original 40/208 also loads while network is BLOCKED',await run('NITNEM_INTERNAL_QA.getState().lineCount===208'));
 await back();await source('rehras',159,44);
 check('Mixed SGGS+Dasam Rehras source also loads while network BLOCKED',await run('NITNEM_INTERNAL_QA.getState().lineCount===159'));
 check('No third-party website requests ever occur in six-source internal reader',requests.filter(u=>/^https?:/.test(u)).every(u=>u.startsWith(base+'/')),{requests:requests.length});
 check('No browser JS exceptions across online/offline tests',errors.length===0,{errors});
}catch(e){failed=String(e);errors.push(failed);console.error('FAIL '+failed);}
finally{
 const report={checkedAt:new Date().toISOString(),status:failed?'FAIL':'PASS',checks,errors,
  app:'GLP owner-invitation-gated HTTPS integrated original digital source reader',privateReview:true,
  sourceFamilies:'SGGS + Dasam, unresolved edition/rights/human review',noExternalLinks:true,
  nativeIPhoneSafari:'NOT RUN',sourceScholarApproved:false,publicFamilyPublished:false};
 fs.writeFileSync(path.join(root,'evidence/nitnem-internal-gated-browser.json'),JSON.stringify(report,null,2).replaceAll(base,'[PRIVATE_QA_HOST_REDACTED]').replaceAll(invite,'[PRIVATE_INVITATION_REDACTED]')+'\n');
 try{if(ws?.readyState===1)await send('Browser.close')}catch{}
 ws?.close();await delay(220);
 if(chrome.exitCode===null)chrome.kill('SIGTERM');
 fs.rmSync(profile,{recursive:true,force:true});
 if(failed)process.exitCode=1;
 console.log('RESULT '+report.status+' '+checks.length+' checks');
}
