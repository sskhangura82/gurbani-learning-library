import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),fixture=path.join(process.env.HOME,'Library/Application Support/GurbaniLearningLibrary/workspaces/r7-upgrade-fixture'),link=fixture+'/current',base='http://127.0.0.1:8902';
const profile=fs.mkdtempSync('/tmp/glp-r7-lifecycle-'),chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--disable-background-networking','about:blank'],{stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms)),tasks=new Map(),checks=[];let seq=0,session,ws,fail=null;
function ok(name,condition){if(!condition)throw Error(name);checks.push(name);console.log('PASS',name);}
function send(method,params={},sid){return new Promise((resolve,reject)=>{const id=++seq,t=setTimeout(()=>{tasks.delete(id);reject(Error('Timeout '+method));},18000);tasks.set(id,{resolve,reject,t});ws.send(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})}));});}
async function run(expr){const out=await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true},session);if(out.exceptionDetails)throw Error(JSON.stringify(out.exceptionDetails));return out.result.value;}
async function until(expr,n=110){for(let i=0;i<n;i++){try{if(await run(expr))return;}catch{}await delay(170);}throw Error('Not ready: '+expr);}
async function reload(){await send('Page.reload',{ignoreCache:false},session);await delay(600);}
async function swap(which){fs.unlinkSync(link);fs.symlinkSync(fixture+'/'+which,link,'dir');}
async function promote(label){await run('(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();return true;})()');await until('(async()=>{const r=await navigator.serviceWorker.getRegistration();return !!r?.waiting;})()');const waiting=await run('(async()=>{const r=await navigator.serviceWorker.getRegistration();return r.waiting.scriptURL})()');ok(label+' downloaded a waiting new service worker',waiting.includes('/sw.js'));await run('(async()=>{const r=await navigator.serviceWorker.getRegistration();r.waiting.postMessage({type:"ACTIVATE_GLP_UPDATE"});return true;})()');await until('(async()=>{const r=await navigator.serviceWorker.getRegistration();return !!r?.active&&!r?.waiting;})()');await reload();}
async function checkLearning(label){const rec=await run('(function(){const s=JSON.parse(localStorage.getItem("glp001.continuous.v2")),full=JSON.parse(localStorage.getItem("glp001.fullJapji.v1")),legacy=JSON.parse(localStorage.getItem("glp001.reader.v1"));return {s,full,legacy};})()');ok(label+' preserves synthetic reflection and bookmarks',rec.s.notes['pauri02.line01']==='R7 QA synthetic · ਸੱਚ'&&rec.s.bookmarks.includes('pauri02.line01'));ok(label+' retains three learning generations',rec.full.notes.pauri04==='R7 QA full generation'&&rec.legacy.note==='R7 QA legacy generation');}
try{
 const file=profile+'/DevToolsActivePort';for(let i=0;!fs.existsSync(file)&&i<110;i++)await delay(100);ok('Isolated lifecycle browser starts',fs.existsSync(file));
 const [port,endpoint]=fs.readFileSync(file,'utf8').trim().split('\n');ws=new WebSocket('ws://127.0.0.1:'+port+endpoint);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const t=tasks.get(m.id);if(t){clearTimeout(t.t);tasks.delete(m.id);m.error?t.reject(Error(JSON.stringify(m.error))):t.resolve(m.result);}}};
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true}));await send('Page.enable',{},session);await send('Runtime.enable',{},session);
 await swap('r6');const initial=await send('Page.navigate',{url:base+'/full-japji.html'},session);if(initial.errorText)throw Error(initial.errorText);
 await until('window.GLP_CONTINUOUS_DEBUG?.version?.includes("r6")');
 await run('(async()=>{await navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"});return true;})()');
 await until('(async()=>!!(await navigator.serviceWorker.ready).active)()');
 await reload();await until('navigator.serviceWorker.controller!==null');
 ok('Revision 6 current service worker active',true);
 const seed='(function(){localStorage.setItem("glp001.reader.v1",JSON.stringify({note:"R7 QA legacy generation",bookmarks:[]}));localStorage.setItem("glp001.fullJapji.v1",JSON.stringify({schemaVersion:2,unit:6,bookmarks:["pauri04"],notes:{pauri04:"R7 QA full generation"}}));localStorage.setItem("glp001.continuous.v2",JSON.stringify({version:2,hasGuided:true,mode:"read",theme:"amrit",size:36,radiance:false,pace:140,guide:{index:10,token:0},read:{id:"pauri02.line01",offset:0},bookmarks:["pauri02.line01"],notes:{"pauri02.line01":"R7 QA synthetic · ਸੱਚ"}}));return true;})()';
 await run(seed);await reload();await until('window.GLP_CONTINUOUS_DEBUG?.lineCount===385');
 await checkLearning('Initial R6');
 await swap('r7');await promote('R6→R7');
 await until('window.GLP_CONTINUOUS_DEBUG?.version?.includes("r7")');ok('Reader upgraded to R7 without changing URL',true);
 await checkLearning('After R7 upgrade');
 await run('document.getElementById("pace-shortcut").click();document.getElementById("pace-slider").value="160";document.getElementById("pace-slider").dispatchEvent(new Event("input",{bubbles:true}));');
 await delay(850);ok('Custom 160 pace stored without overwriting original reflection',await run('(()=>{const s=JSON.parse(localStorage.getItem("glp001.continuous.v2"));return s.pace===160&&s.notes["pauri02.line01"]==="R7 QA synthetic · ਸੱਚ"})()'));
 await swap('r6-rollback');await promote('R7→R6 rollback');
 await until('window.GLP_CONTINUOUS_DEBUG?.version?.includes("r6")');
 await checkLearning('After actual rollback');
 await swap('r7-return');await promote('Rollback→R7 return');
 await until('window.GLP_CONTINUOUS_DEBUG?.version?.includes("r7")');await checkLearning('After return to R7');
 ok('New home entrypoint available after re-upgrade',await run('(async()=>{const r=await fetch("index.html");return r.ok&&(await r.text()).includes("A moment with")})()'));
 console.log('COMPLETE '+checks.length+' lifecycle checks');
}catch(e){fail=String(e);console.error('FAIL',fail);}
finally{
 fs.writeFileSync(root+'/evidence/r7-candidate-lifecycle.json',JSON.stringify({checks,count:checks.length,fail,environment:'Isolated secure loopback Chrome with real service-worker install, R6→R7→R6→R7',notes:'Only synthetic learning, no user data or public URL touched',checkedAt:new Date().toISOString(),limitations:['Not public HTTPS lifecycle, physical iPhone or real airplane mode']},null,2));
 try{await swap('r6')}catch{}try{if(ws?.readyState===1)await send('Browser.close')}catch{}ws?.close();await delay(250);if(chrome.exitCode===null)chrome.kill('SIGTERM');fs.rmSync(profile,{recursive:true,force:true});if(fail)process.exitCode=1;
}
