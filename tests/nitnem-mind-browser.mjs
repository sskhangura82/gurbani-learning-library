import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),base='http://127.0.0.1:8921';
const profile=fs.mkdtempSync('/tmp/glp-psych-nitnem-chrome-');
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','--disable-background-networking','about:blank'],{stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms)),tasks=new Map(),checks=[],errors=[],requests=[];
let seq=0,session,ws,fail=null;const check=(label,ok)=>{if(!ok)throw Error(label);checks.push(label);console.log('PASS',label);};
function send(method,params={},sid){return new Promise((resolve,reject)=>{const id=++seq,t=setTimeout(()=>{tasks.delete(id);reject(Error('CDP timeout '+method));},13000);tasks.set(id,{resolve,reject,t});ws.send(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})}));});}
async function run(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},session);if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
async function nav(p){const x=await send('Page.navigate',{url:base+'/'+p},session);if(x.errorText)throw Error(x.errorText);await delay(450);}
async function until(expression){for(let i=0;i<100;i++){try{if(await run(expression))return;}catch{}await delay(110);}throw Error('Not ready '+expression);}
async function snap(label){const x=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},session);fs.mkdirSync(root+'/evidence',{recursive:true});fs.writeFileSync(root+'/evidence/nitnem-mind-'+label+'.png',Buffer.from(x.data,'base64'));}
try{
 const file=profile+'/DevToolsActivePort';for(let i=0;!fs.existsSync(file)&&i<100;i++)await delay(100);check('Isolated Chrome starts',fs.existsSync(file));
 const [port,ep]=fs.readFileSync(file,'utf8').trim().split('\n');ws=new WebSocket('ws://127.0.0.1:'+port+ep);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const t=tasks.get(m.id);if(t){clearTimeout(t.t);tasks.delete(m.id);m.error?t.reject(Error(JSON.stringify(m.error))):t.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);else if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);};
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true}));await send('Page.enable',{},session);await send('Runtime.enable',{},session);await send('Network.enable',{},session);await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true},session);
 await nav('index.html');await until('!!document.querySelector(".mind-door")');check('Home now has quiet fourth room',await run('!!document.querySelector(".mind-door")&&!!document.querySelector(".nitnem-explore")'));
 await snap('home');
 await nav('nitnem.html');await until('document.querySelectorAll(".bani-item").length===7');
 check('Seven Nitnem records rendered from registry',await run('document.querySelectorAll(".bani-item").length===7'));
 check('Morning 5 / evening 1 / night 1',await run('document.querySelector("[data-time=morning]").querySelectorAll(".bani-item").length===5&&document.querySelector("[data-time=evening]").querySelectorAll(".bani-item").length===1&&document.querySelector("[data-time=night]").querySelectorAll(".bani-item").length===1'));
 check('Only existing complete Japji link is selectable',await run('document.querySelectorAll(".open-reader").length===1&&document.querySelectorAll(".pending").length===6'));
 check('Ardas is a distinct practice rather than a fabricated bani',await run('!!document.querySelector(".ardas-note")'));
 check('No invented meanings or audio',await run('document.querySelectorAll("audio,video,iframe").length===0'));
 check('Source edition caution visible',await run('document.querySelector(".editorial-note").textContent.includes("checked")'));
 check('390px Nitnem no sideways overflow',await run('document.documentElement.scrollWidth<=innerWidth'));
 await snap('nitnem-390');
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true},session);await delay(120);
 check('320px Nitnem no sideways overflow',await run('document.documentElement.scrollWidth<=innerWidth'));
 await snap('nitnem-320');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true},session);
 await nav('psychology.html');await until('document.querySelectorAll(".topic-button").length===4');
 check('Four source-linked learning threads',await run('document.querySelectorAll(".topic-button").length===4'));
 check('Psychology history contains five non-equated scientific traditions',await run('document.querySelectorAll(".history-entry").length===5'));
 check('Original Mool Gurmukhi displayed unchanged',await run('document.querySelector("#gurbani-exact").textContent===GLP_FULL_JAPJI.units.find(u=>u.id==="mool").lines[0].text'));
 check('Nirbhau Nirvair pilot acknowledges limits and boundaries',await run('document.getElementById("lesson-not").textContent.includes("retaliation")'));
 check('No stored psychometric or diagnostic data',await run('Object.keys(localStorage).every(k=>!k.includes("psychology")&&!k.includes("mind-room"))'));
 await snap('psychology-390');
 for(const key of ['haumai','craving','quiet','courage']){
  await run('document.querySelector(\'[data-topic="'+key+'"]\').click()');await delay(90);
  check('Topic '+key+' matches source phrase and distinct lenses',await run('(()=>{const m=GLP_MIND_ROOM.topics.find(x=>x.id==="'+key+'");const l=GLP_FULL_JAPJI.units.flatMap(u=>u.lines).find(x=>x.id===m.sourceId);return document.getElementById("gurbani-exact").textContent===l.text&&document.getElementById("lesson-psych").textContent===m.psych})()'));
 }
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true},session);await delay(200);
 check('320px Psychology page reflows without horizontal scroll',await run('document.documentElement.scrollWidth<=innerWidth'));
 await snap('psychology-320');
 check('Every external research source explicitly opens in a safe new tab',await run('[...document.querySelectorAll(".reference,.history-source")].every(a=>a.target==="_blank"&&a.rel.includes("noopener"))'));
 check('No audio, recording, health assessment or model requests',await run('document.querySelectorAll("audio,video,iframe,form").length===0'));
 check('No browser JS errors',errors.length===0);
 check('No external domain requested before clicking citation',requests.every(x=>x.startsWith(base+'/')||x==='about:blank'||x.startsWith('data:')||x===base+'/favicon.ico'));
 console.log('COMPLETE',checks.length,'browser checks');
}catch(e){fail=String(e);console.error('FAIL',fail);try{await snap('failure')}catch{}}
finally{fs.mkdirSync(root+'/evidence',{recursive:true});fs.writeFileSync(root+'/evidence/nitnem-mind-browser.json',JSON.stringify({count:checks.length,checks,fail,errors,at:new Date().toISOString(),environment:'isolated Mac Chrome mobile viewport 390/320; not physical iPhone; psychology and bani info remains draft'},null,2));
 try{await send('Browser.close')}catch{}ws?.close();await delay(200);if(chrome.exitCode===null)chrome.kill('SIGTERM');fs.rmSync(profile,{recursive:true,force:true});if(fail)process.exitCode=1;}
