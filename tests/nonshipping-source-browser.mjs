/* GLP-001 nonshipping Full Nitnem original-only browser QA.
 * Drives actual Chrome against trusted loopback, not public web/iPhone.
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const port=Number(process.env.GLP_NITNEM_QA_PORT||8990);
if(port!==8990)throw Error('Only a dedicated 127.0.0.1:8990 loopback fixture permitted');
const origin='http://127.0.0.1:'+port;
const profile=fs.mkdtempSync('/tmp/glp-nitnem-original-qa-');
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--disable-background-networking','about:blank'],{stdio:'ignore'});
let ws,session,seq=0,failed=null,exceptions=[],requests=[];
const pending=new Map(),checks=[],sleep=ms=>new Promise(r=>setTimeout(r,ms));
function check(label,test,details={}){if(!test)throw Error(label+': '+JSON.stringify(details));checks.push({label,status:'PASS',details});console.log('PASS '+label);}
function send(method,params={},sid){return new Promise((resolve,reject)=>{
 const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},16000);
 pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})}));
});}
async function run(expression){
 const response=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},session);
 if(response.exceptionDetails)throw Error('Browser expression exception: '+JSON.stringify(response.exceptionDetails));
 return response.result.value;
}
async function until(expression,label,timeout=22000){
 const end=Date.now()+timeout;
 while(Date.now()<end){
  try{if(await run(expression))return;}catch{}
  await sleep(110);
 }
 throw Error('Timed out: '+label);
}
async function click(selector){
 await run('(()=>{let b=document.querySelector('+JSON.stringify(selector)+');if(!b)throw Error("Missing control");b.click();return true})()');
}
async function size(width,height){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true},session);
 await sleep(100);
}
async function exactOriginal(){
 const inspect=[
  '(async()=>{',
  'const k=GLP_SOURCE_QA.getState().sourceKey;',
  'const src=k==="sohila"?"../docs/research/n1-sohila/sohila-candidate-original.json":k==="savaiye"?"../docs/research/n3-dasam-savaiye/savaiye-ten-original-candidate.json":"../docs/research/n4-chaupai-excerpt/chaupai-sgpc-excerpt-candidate.json";',
  'const r=await fetch(src,{cache:"no-store"}),x=await r.json();',
  'const expected=x.units.flatMap(u=>u.lines);',
  'const actual=[...document.querySelectorAll(".qa-source-line")];',
  'return actual.length===expected.length&&actual.every((e,i)=>e.textContent===expected[i].text&&e.dataset.id===expected[i].id&&e.dataset.sourceSha256===expected[i].sha256);',
  '})()'
 ].join('');
 return await run(inspect);
}
try{
 const pf=path.join(profile,'DevToolsActivePort');
 for(let i=0;!fs.existsSync(pf)&&i<130;i++)await sleep(100);
 check('Fresh isolated Chrome starts',fs.existsSync(pf));
 const [portDebug,endpoint]=fs.readFileSync(pf,'utf8').trim().split('\n');
 ws=new WebSocket('ws://127.0.0.1:'+portDebug+endpoint);
 await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
 ws.onmessage=e=>{
  const m=JSON.parse(e.data);
  if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}
  else if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails?.text||'Browser exception');
  else if(m.method==='Network.requestWillBeSent')requests.push(m.params.request?.url);
 };
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});
 ({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true}));
 await send('Page.enable',{},session);await send('Runtime.enable',{},session);await send('Network.enable',{},session);
 await size(320,740);
 const nav=await send('Page.navigate',{url:origin+'/tests/nonshipping-source-reader.html'},session);
 check('Local source QA page navigates',!nav.errorText);
 await until('window.GLP_SOURCE_QA?.getState().readerReady===true','Sohila source verified');
 const intro=await run('({message:document.querySelector(".qa-warning").textContent,secure:isSecureContext,location:location.hostname,status:document.getElementById("qa-status").textContent})');
 check('Page is trusted loopback and visibly warns against recitation',intro.secure&&intro.location==='127.0.0.1'&&intro.message.includes('UNREVIEWED DIGITAL SOURCE')&&intro.status.includes('SHA-256 verified'),intro);
 let current=await run('GLP_SOURCE_QA.getState()');
 check('Five frozen Sohila shabads and 56 source lines render but are unapproved',current.sourceKey==='sohila'&&current.unitCount===5&&current.lineCount===56&&!current.releaseAuthorized&&!current.learningStored,current);
 check('All 56 original Sohila line strings, source IDs and SHA-256 hashes match immutable model',await exactOriginal());
 const noMeaning=await run('(()=>{let a=[...document.querySelectorAll(".qa-footer button")];return a.length===2&&a.every(b=>b.disabled&&b.getAttribute("aria-label").includes("pending"))})()');
 check('Meaning and Study remain disabled pending specialist review',noMeaning);
 const first=await run('({prev:document.getElementById("qa-previous").disabled,next:document.getElementById("qa-next").disabled,active:document.querySelectorAll(".qa-source-line[aria-current=location]").length})');
 check('First shabad has one current marker and correct boundary controls',first.prev&&!first.next&&first.active===1,first);
 await click('#qa-next');
 current=await run('GLP_SOURCE_QA.getState()');
 check('Next navigates to source shabad 2 without changing a verse',current.position.index===12&&current.sourceKey==='sohila');
 await click('#qa-previous');
 check('Previous navigates back to original shabad 1',await run('GLP_SOURCE_QA.getState().position.index===0'));
 for(const [w,h] of [[320,740],[390,844]]){
  await size(w,h);
  const metric=await run('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,dockHeight:document.querySelector(".qa-dock").getBoundingClientRect().height})');
  check('Sohila candidate has no horizontal overflow at '+w+'px',metric.scrollWidth<=metric.width,metric);
 }
 await run('(()=>{const x=document.getElementById("qa-size");x.value="48";x.dispatchEvent(new Event("change",{bubbles:true}));return true;})()');
 const textSize=await run('parseFloat(getComputedStyle(document.querySelector(".qa-source-line")).fontSize)');
 check('Existing reader 48px larger Gurmukhi setting works',textSize===48,{size:textSize});
 await size(320,740);
 check('48px Gurmukhi does not cause horizontal page overflow at 320px',await run('document.documentElement.scrollWidth<=innerWidth'));
 const image1=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},session);
 fs.writeFileSync(path.join(root,'evidence/nitnem-original-qa-sohila-320.png'),Buffer.from(image1.data,'base64'));
 await click('#load-savaiye');
 await until('window.GLP_SOURCE_QA.getState().sourceKey==="savaiye" && window.GLP_SOURCE_QA.getState().readerReady','Savaiye 10x4 source verified');
 current=await run('GLP_SOURCE_QA.getState()');
 check('Ten Savaiye and all 40 source rows use the same existing continuous core',current.unitCount===10&&current.lineCount===40&&current.sourceKey==='savaiye',current);
 check('All 40 original Savaiye words, hashes and source IDs match frozen candidate',await exactOriginal());
 const preface=await run('({count:document.querySelectorAll(".qa-preface").length,gurmukhi:[...document.querySelectorAll(".qa-preface")].map(x=>x.textContent),sourceCount:document.querySelectorAll(".qa-source-line").length})');
 check('Three original candidate preface blocks are separately visible once',preface.count===3&&preface.sourceCount===40&&preface.gurmukhi[0]==='ੴ',preface);
 const privateState=await run('({storage:localStorage.length,serviceWorker:navigator.serviceWorker.controller!==null,media:!!document.querySelector("audio,video,iframe"),release:GLP_SOURCE_QA.getState().releaseAuthorized})');
 check('QA uses no private learning storage, worker, media, or release permission',privateState.storage===0&&!privateState.serviceWorker&&!privateState.media&&!privateState.release,privateState);
 const step=await run('(()=>{let before=GLP_SOURCE_QA.getState().position;let success=GLP_SOURCE_QA.step();let after=GLP_SOURCE_QA.getState().position;return {before,after,success}})()');
 check('Same token progression engine advances an original Savaiya word',step.success&&step.after.index===step.before.index&&step.after.token>step.before.token,step);
 await run('(()=>{const x=document.getElementById("qa-size");x.value="30";x.dispatchEvent(new Event("change",{bubbles:true}));return true;})()');
 await size(390,844);
 const image2=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},session);
 fs.writeFileSync(path.join(root,'evidence/nitnem-original-qa-savaiye-390.png'),Buffer.from(image2.data,'base64'));
 await click('#load-chaupai');
 await until('window.GLP_SOURCE_QA.getState().sourceKey==="chaupai"&&window.GLP_SOURCE_QA.getState().readerReady','SGPC excerpt 25x4 source verified');
 current=await run('GLP_SOURCE_QA.getState()');
 check('SGPC Rehras Chaupai excerpt has 25 pauris and 100 original tuk segments',current.sourceKey==='chaupai'&&current.unitCount===25&&current.lineCount===100&&!current.releaseAuthorized,current);
 check('All 100 bounded Chaupai original source strings, IDs and hashes match immutable digital candidate',await exactOriginal());
 check('The 25-pauri segment retains the exact SGPC start and end while avoiding any claim to complete morning Chaupai',await run('(()=>{const x=[...document.querySelectorAll(".qa-source-line")];return x[0].textContent.startsWith("ਹਮਰੀ ਕਰੋ")&&x.at(-1).textContent.startsWith("ਦੁਸਟ ਦੋਖ ਤੇ ਲੇਹੁ ਬਚਾਈ")&&document.getElementById("load-chaupai").textContent.includes("Rehras excerpt")})()'));
 await click('#qa-next');
 check('Existing reader core moves cleanly to the next Chaupai pauri',await run('GLP_SOURCE_QA.getState().position.index===4'));
 await click('#qa-previous');
 check('Previous button restores the first bounded Chaupai original tuk',await run('GLP_SOURCE_QA.getState().position.index===0'));
 await size(320,740);
 check('Bounded Chaupai original has no horizontal overflow at phone width',await run('document.documentElement.scrollWidth<=innerWidth'));
 const image3=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},session);
 fs.writeFileSync(path.join(root,'evidence/nitnem-original-qa-chaupai-320.png'),Buffer.from(image3.data,'base64'));
 check('All candidate network requests are same loopback origin',requests.every(x=>x.startsWith(origin+'/')),{requests:requests.length});
 check('No browser JavaScript exceptions',exceptions.length===0,{exceptions});
}catch(e){failed=String(e);exceptions.push(failed);console.error('FAIL '+failed);}
finally{
 const result={checkedAt:new Date().toISOString(),status:failed?'FAIL':'PASS',checks,errors:exceptions,
  scope:'Nonshipping source-only Chrome QA against existing continuous-core; two unapproved digital original candidates, no family app',
  actualIPhone:'NOT TESTED',humanEditionReview:'PENDING',publicationAllowed:false,
  screenshots:['evidence/nitnem-original-qa-sohila-320.png','evidence/nitnem-original-qa-savaiye-390.png','evidence/nitnem-original-qa-chaupai-320.png']};
 fs.writeFileSync(path.join(root,'evidence/nitnem-original-qa-browser.json'),JSON.stringify(result,null,2)+'\n');
 try{if(ws?.readyState===1)await send('Browser.close')}catch{}
 try{ws?.close()}catch{}
 await sleep(200);
 if(chrome.exitCode===null)chrome.kill('SIGTERM');
 fs.rmSync(profile,{recursive:true,force:true});
 if(failed)process.exitCode=1;
 console.log('RESULT '+result.status+' '+checks.length+' checks');
}
