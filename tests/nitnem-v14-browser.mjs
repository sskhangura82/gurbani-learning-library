/* Isolated Chrome + immutable candidate, synthetic learning only.
 * A real browser run, not a physical iPhone, Safari or qualified-content review.
 * No existing Chrome profile, invitation, cookie, public tunnel or live state.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'glp-v14-browser-'));
const site=path.join(temporary,'site'),profile=path.join(temporary,'profile');
const evidence=path.join(root,'evidence');
const source=JSON.parse(fs.readFileSync(path.join(root,'nitnem/data/jaap.json')));
const course=JSON.parse(fs.readFileSync(path.join(root,'nitnem/learning/course.v14.json')));
let chrome,ws,server,session,seq=0,failed=null;
const pending=new Map(),checks=[],errors=[],requests=[];
const delay=t=>new Promise(r=>setTimeout(r,t));
function check(name,condition,detail={}){if(!condition)throw Error(name+' '+JSON.stringify(detail));checks.push(name);console.log('PASS '+name);}
function send(method,params={},sid){return new Promise((resolve,reject)=>{const id=++seq;const timeout=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},15000);pending.set(id,{resolve,reject,timeout});ws.send(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})}));});}
async function run(expression){const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},session);if(r.exceptionDetails)throw Error('Browser script: '+JSON.stringify(r.exceptionDetails));return r.result.value;}
async function until(expression,label,limit=20000){const deadline=Date.now()+limit;while(Date.now()<deadline){if(await run(expression))return;await delay(100);}throw Error('Timed out '+label+' '+await run('document.body?.innerText?.slice(0,250)'));}
async function click(selector){await run('(()=>{const e=document.querySelector('+JSON.stringify(selector)+');if(!e)throw Error("Missing control");e.click();return true})()');}
async function nav(url){const r=await send('Page.navigate',{url},session);if(r.errorText)throw Error(r.errorText);}
async function phone(width,height=844){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true},session);}
async function shot(name){const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},session);fs.writeFileSync(path.join(evidence,name),Buffer.from(r.data,'base64'));}
try{
 const built=spawnSync('python3',['tools/nitnem/build-full-nitnem-v14-reader.py','--output',site],{cwd:root,encoding:'utf8'});
 if(built.status!==0)throw Error('Package build '+built.stderr);
 check('Actual immutable V14 package built',JSON.parse(built.stdout).assets===45);
 const allowed=new Set();function collect(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,e.name);if(e.isDirectory())collect(full);else if(e.isFile())allowed.add('/'+path.relative(site,full).split(path.sep).join('/'));}}collect(site);
 server=http.createServer((req,res)=>{
  let rel;try{rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
  if(!allowed.has(rel)){res.writeHead(404);res.end();return;}
  const ext=path.extname(rel);const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'}[ext]||'application/octet-stream';
  res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'});res.end(fs.readFileSync(path.join(site,rel)));
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const base='http://127.0.0.1:'+server.address().port;
 chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--disable-background-networking','about:blank'],{stdio:'ignore'});
 const portFile=path.join(profile,'DevToolsActivePort');
 for(let i=0;!fs.existsSync(portFile)&&i<100;i++)await delay(100);
 check('Fresh isolated Chrome profile starts',fs.existsSync(portFile));
 const [port,endpoint]=fs.readFileSync(portFile,'utf8').trim().split('\n');
 ws=new WebSocket('ws://127.0.0.1:'+port+endpoint);
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timeout);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails?.text||'Runtime exception');else if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);};
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true}));
 for(const method of ['Page.enable','Runtime.enable','Network.enable'])await send(method,{},session);
 await phone(390);await nav(base+'/index.html?bani=jaap');
 await until('window.NITNEM_INTERNAL_QA?.getState().sourceVerified&&NITNEM_INTERNAL_QA.getState().teachingAvailable','Jaap loaded');
 const state=await run('NITNEM_INTERNAL_QA.getState()');
 check('Jaap source and V14 course load in a secure loopback context',state.lineCount===782&&state.authoredLessons===90&&await run('isSecureContext&&!!crypto.subtle'),state);
 await click('[data-mode="meaning"]');
 check('All 346 Jaap notes render, including all 60 new records',await run('document.querySelectorAll(".simple-meaning[data-meaning-line]").length===346&&[...document.querySelectorAll(".simple-meaning[data-meaning-line]")].filter(e=>/^jaap(07[6-9]|08[0-9]|090)\./.test(e.dataset.meaningLine)).length===60'));
 const expected=source.units.slice(75,90).flatMap(u=>u.lines.map(l=>({id:l.id,text:l.text,sha:l.sha256,en:course.closeTextNotes['jaap|'+l.id].simpleEn,pa:course.closeTextNotes['jaap|'+l.id].simplePa})));
 check('Every new visible note matches its exact original line, hash and bilingual draft',await run('('+JSON.stringify(expected)+').every(x=>{const b=document.querySelector(`[data-meaning-line="${x.id}"]`);return b&&b.previousElementSibling.textContent===x.text&&b.parentElement.dataset.sourceSha256===x.sha&&b.textContent.includes(x.en)&&b.textContent.includes(x.pa)})'));
 await click('[data-meaning-line="jaap090.line02"]');
 await until('document.getElementById("meaning-dialog").open','line explanation');
 check('Expanded line explanation shows interpretive alternatives and pending review',await run('(()=>{const b=document.getElementById("meaning-dialog-body");return b.textContent.includes("smallest or the child")&&b.textContent.includes("HUMAN REVIEW PENDING")})()'));
 await click('#meaning-close');await until('!document.getElementById("meaning-dialog").open','dialog closed');
 await click('[data-mode="study"]');
 check('All 90 authored Jaap Study lessons render',await run('document.querySelectorAll("#source-unit .unit-lesson").length===90'));
 check('Each of the 15 new Study lessons shows its own close reading',await run('('+JSON.stringify(source.units.slice(75,90).map(u=>({index:Number(u.id.slice(4))-1,text:course.unitLessons['jaap|'+u.id].study.closeReading})))+').every(x=>document.querySelector(`.passage-block[data-unit-index="${x.index}"] .unit-lesson`)?.textContent.includes(x.text))'));
 await click('[data-mode="read"]');
 check('Read mode keeps teaching out of the scripture flow',await run('document.querySelectorAll("#source-unit .unit-lesson,#source-unit .simple-meaning").length===0'));
 await click('#reading-tools');await until('document.getElementById("tools-dialog").open','reading tools');
 await run('(()=>{const p=document.getElementById("pace");p.value="200";p.dispatchEvent(new Event("input",{bubbles:true}));document.getElementById("note").value="V14 synthetic QA reflection";return true})()');
 await click('#save-note');await click('#bookmark');await click('#tools-close');
 const before=await run('NITNEM_INTERNAL_QA.getState()');
 check('Pace 200 and synthetic saved learning use real reader controls',before.pace===200&&before.notes===1&&before.bookmarks===1,before);
 await click('[data-appearance="amrit"]');
 check('Dark mode is one tap without changing reading position or learning',await run('(()=>{const s=NITNEM_INTERNAL_QA.getState();return document.documentElement.dataset.theme==="amrit"&&document.querySelector("[data-appearance=amrit]").getAttribute("aria-pressed")==="true"&&s.pace===200&&s.notes===1&&s.bookmarks===1&&s.index==='+before.index+'})()'));
 await nav(base+'/index.html?bani=jaap');await until('window.NITNEM_INTERNAL_QA?.getState().sourceVerified&&NITNEM_INTERNAL_QA.getState().teachingAvailable','reload');
 check('Reload preserves Dark, pace 200, reflection and bookmark',await run('(()=>{const s=NITNEM_INTERNAL_QA.getState();return document.documentElement.dataset.theme==="amrit"&&s.pace===200&&s.notes===1&&s.bookmarks===1})()'));
 await click('[data-mode="meaning"]');
 await run('document.querySelector("[data-meaning-line=\\"jaap076.line01\\"]").scrollIntoView({block:"center",behavior:"instant"})');
 check('Dark header stays visible while reading later chhands',await run('(()=>{const r=document.querySelector(".appearance-header").getBoundingClientRect();return r.top>=-1&&r.bottom>0&&document.querySelectorAll("[data-appearance]").length===2})()'));
 await shot('nitnem-v14-jaap76-dark-390.png');
 await click('[data-appearance="day"]');
 check('Light mode switches without resetting saved learning',await run('document.documentElement.dataset.theme==="day"&&NITNEM_INTERNAL_QA.getState().notes===1&&NITNEM_INTERNAL_QA.getState().bookmarks===1'));
 await shot('nitnem-v14-jaap76-light-390.png');
 await phone(320,740);
 check('Reader and Light/Dark buttons fit 320px layout',await run('document.documentElement.scrollWidth<=innerWidth&&[...document.querySelectorAll("[data-appearance]")].every(e=>e.getBoundingClientRect().height>=44)'));
 await nav(base+'/index.html?bani=anand');await until('window.NITNEM_INTERNAL_QA?.getState().sourceVerified&&NITNEM_INTERNAL_QA.getState().teachingAvailable','Anand');
 await click('[data-mode="study"]');
 check('Anand retains 39 studies and the held Pauri 24',await run('document.querySelectorAll("#source-unit .unit-lesson").length===39&&!!document.querySelector(".passage-block[data-unit-index=\\"23\\"] .quarantine")'));
 await nav(base+'/japji.html');await until('window.GLP_CONTINUOUS_DEBUG?.lineCount===385','Japji');
 check('Embedded Japji retains all 385 original lines and shared Light preference',await run('document.querySelectorAll(".scripture-line").length===385&&document.documentElement.dataset.theme==="day"'));
 check('No application requests leave the isolated loopback server',requests.filter(u=>/^https?:/i.test(u)).every(u=>u.startsWith(base+'/')));
 check('No browser runtime exceptions',errors.length===0,{errors});
}catch(error){failed=String(error);console.error('FAIL '+failed);}
finally{
 const report={checkedAt:new Date().toISOString(),status:failed?'FAIL':'PASS',checks:checks.length,cases:checks,errors,failed,
 environment:'Fresh isolated headless Chrome on hosting Mac; 390px and 320px emulation; immutable V14 package served only on loopback',
 syntheticLearningOnly:true,existingUserProfileAccessed:false,privateInvitationAccessed:false,physicalIPhoneSafari:'NOT_TESTED',realOffline:'NOT_TESTED',scholarlyApproval:false};
 fs.writeFileSync(path.join(evidence,'glp-nitnem-v14-browser.json'),JSON.stringify(report,null,2)+'\n');
 try{if(ws?.readyState===1)await send('Browser.close');}catch{}
 ws?.close();for(const p of pending.values())clearTimeout(p.timeout);
 if(chrome&&chrome.exitCode===null)chrome.kill('SIGTERM');
 if(server)await new Promise(resolve=>server.close(resolve));
 await delay(200);
 if(fs.existsSync(site)){for(const e of ['data','']){try{fs.chmodSync(path.join(site,e),0o700);}catch{}}}
 fs.rmSync(temporary,{recursive:true,force:true});
 console.log('RESULT '+report.status+' '+checks.length+' checks');if(failed)process.exitCode=1;
}
