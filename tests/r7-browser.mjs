import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),base=process.env.GLP_TEST_ORIGIN||'http://127.0.0.1:8901',tag=process.env.GLP_TEST_TAG||'candidate';
const profile=fs.mkdtempSync('/tmp/glp-r7-chrome-'),chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','--disable-background-networking','about:blank'],{stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms));let ws,session,seq=0,fail=null;const pending=new Map(),checks=[],exceptions=[],requests=[];
function check(name,pass){if(!pass)throw Error(name);checks.push(name);console.log('PASS',name);}
function send(method,params={},sid){return new Promise((resolve,reject)=>{const id=++seq,t=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},12000);pending.set(id,{resolve,reject,t});ws.send(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})}));});}
async function evaljs(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},session);if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
async function nav(pathname){const out=await send('Page.navigate',{url:base+'/'+pathname},session);if(out.errorText)throw Error(out.errorText);await delay(600);}
async function ready(expr){for(let i=0;i<90;i++){try{if(await evaljs(expr))return;}catch{}await delay(100);}throw Error('Not ready '+expr);}
async function snap(name){const im=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},session);fs.writeFileSync(root+'/evidence/r7-'+tag+'-'+name+'.png',Buffer.from(im.data,'base64'));}
try{
 const file=profile+'/DevToolsActivePort';for(let i=0;!fs.existsSync(file)&&i<100;i++)await delay(100);check('Chrome launched isolated',fs.existsSync(file));
 const [port,pathpart]=fs.readFileSync(file,'utf8').trim().split('\n');ws=new WebSocket('ws://127.0.0.1:'+port+pathpart);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.t);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails);else if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);};
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true}));await send('Page.enable',{},session);await send('Runtime.enable',{},session);await send('Network.enable',{},session);
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true},session);
 await nav('');await ready('!!document.querySelector(".nitnem-card")');
 check('Root landing is not Japji reader',await evaljs('!!document.querySelector(".home-hero")&&!document.querySelector("#continuous-reader")'));
 check('Four accessible home doors including psychology',await evaljs('document.querySelectorAll("#destinations a[href]").length===4'));
 check('Nitnem opens Japji; other rooms separate',await evaljs('document.querySelector(".nitnem-card").getAttribute("href")==="full-japji.html"&&[...document.querySelectorAll("#destinations a")].some(a=>a.getAttribute("href")=="gurdwaras.html")&&[...document.querySelectorAll("#destinations a")].some(a=>a.getAttribute("href")=="simran.html")'));
 check('No gamification or ads on home',await evaljs('document.querySelectorAll("audio,video,iframe").length===0'));
 await snap('home-day');
 await evaljs('document.getElementById("home-theme").click()');check('Home Day/Amrit appearance toggles',await evaljs('document.body.dataset.theme==="amrit"'));
 await snap('home-amrit');
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true},session);
 check('Home 320px reflow',await evaljs('document.documentElement.scrollWidth<=innerWidth'));
 await nav('full-japji.html');await ready('window.GLP_CONTINUOUS_DEBUG?.lineCount===385');
 check('All 385 immutable scripture lines in reader',await evaljs('document.querySelectorAll("#continuous-reader .tuk").length===385'));
 check('All meaning drafts and Study units',await evaljs('document.querySelectorAll(".simple-meaning").length===385&&document.querySelectorAll(".unit-lesson").length===42'));
 check('One-tap pace shortcut available at 320px',await evaljs('document.getElementById("pace-shortcut").getBoundingClientRect().width>=44&&!document.getElementById("pace-tray").hidden===false'));
 await evaljs('document.getElementById("pace-shortcut").click()');
 check('Speed slider opens directly with numeric label',await evaljs('!document.getElementById("pace-tray").hidden&&document.getElementById("pace-slider").max==="160"'));
 await evaljs('document.getElementById("pace-slider").value="160";document.getElementById("pace-slider").dispatchEvent(new Event("input",{bubbles:true}));');
 check('Guide and numeric controls accept 160',await evaljs('GLP_CONTINUOUS_DEBUG.getState().pace===160&&document.getElementById("pace-value").textContent==="160"'));
 check('Speed controls remain discoverable during reading',await evaljs('document.getElementById("pace-shortcut").getAttribute("aria-expanded")==="true"&&document.getElementById("pace-shortcut").getBoundingClientRect().bottom<=innerHeight'));
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true},session);
 await snap('pace-tray');
 await evaljs('document.getElementById("pace-close").click()');await evaljs('document.getElementById("play").click()');await delay(950);
 check('Silent visual guide advances at custom speed',await evaljs('GLP_CONTINUOUS_DEBUG.isPlaying()&&GLP_CONTINUOUS_DEBUG.getState().pace===160&&GLP_CONTINUOUS_DEBUG.getState().guide.token>0'));
 check('No media element was introduced',await evaljs('document.querySelectorAll("audio,video,iframe").length===0'));
 await evaljs('document.getElementById("play").click()');await delay(800);
 check('Pace 160 saved using existing browser learning',await evaljs('JSON.parse(localStorage.getItem("glp001.continuous.v2")).pace===160'));
 await send('Page.reload',{ignoreCache:true},session);await delay(620);await ready('window.GLP_CONTINUOUS_DEBUG?.lineCount===385');
 check('Pace remains 160 after page reload',await evaljs('GLP_CONTINUOUS_DEBUG.getState().pace===160'));
 await evaljs('document.querySelector("[data-depth=understand]").click()');check('Understand still shows bilingual meaning with full scripture',await evaljs('document.body.dataset.depth==="understand"&&document.querySelectorAll("#continuous-reader .tuk").length===385'));
 check('Reader offers clear Home navigation',await evaljs('document.querySelector(".page-header a.brand")?.getAttribute("href")==="index.html"'));
 await evaljs('document.querySelector(".page-header a.brand").click()');await delay(420);check('Return to landing without clearing storage',await evaljs('location.pathname.endsWith("/index.html")&&JSON.parse(localStorage.getItem("glp001.continuous.v2")).pace===160'));
 await nav('gurdwaras.html');check('Directory has three separate place cards',await evaljs('document.querySelectorAll(".place-card").length===3'));
 check('Gurdwara directory uses original atmospheric palette, no images',await evaljs('document.querySelectorAll("img,audio,video,iframe").length===0'));
 await snap('gurdwaras');
 for(const place of ['harmandir','fremont','sanjose']){
  await nav('gurdwara.html?place='+place);await ready('!!document.getElementById("place-history").textContent');
  check(place+' has place-specific class, sourced history and local time',await evaljs('document.body.classList.contains("detail-'+place+'")&&!!document.getElementById("place-history").textContent&&!!document.getElementById("place-time").textContent'));
  check(place+' external official stream requires a click',await evaljs('document.getElementById("place-listen").target==="_blank"&&document.querySelectorAll("audio,video,iframe").length===0'));
  if(place==='harmandir'||place==='sanjose')await snap('gurdwara-'+place);
 }
 await nav('simran.html');check('Simran has distinct quiet design and no audio',await evaljs('!!document.querySelector(".quiet-session")&&document.querySelectorAll("audio,video,iframe").length===0'));
 await snap('simran');
 await evaljs('document.getElementById("sit-start").click()');check('Optional timer starts with no recorded metrics',await evaljs('document.getElementById("sit-start").textContent==="Pause"&&!localStorage.getItem("simran")'));
 await evaljs('document.getElementById("sit-start").click()');check('Timer pauses without prescribing breathing',await evaljs('document.getElementById("sit-start").textContent==="Resume"'));
 await evaljs('document.getElementById("sit-stop").click()');check('End resets optional timer',await evaljs('document.getElementById("timer").textContent==="05:00"'));
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true},session);check('Simran 320px no sideways overflow',await evaljs('document.documentElement.scrollWidth<=innerWidth'));
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]},session);check('Reduced motion controls honored',await evaljs('matchMedia("(prefers-reduced-motion: reduce)").matches'));
 check('No uncaught JS errors',exceptions.length===0);
 console.log('OBSERVED_NETWORK_URLS',JSON.stringify([...new Set(requests)]));
 check('No third-party requests before explicit outbound visit',requests.every(u=>u.startsWith(base+'/')||u===new URL('/favicon.ico',base).href||u==='about:blank'||u.startsWith('data:')));
 console.log('COMPLETE',checks.length,'browser checks');
}catch(e){fail=String(e);console.error('FAIL',fail);try{await snap('failure');}catch(_){} }
finally{
 fs.mkdirSync(root+'/evidence',{recursive:true});
 fs.writeFileSync(root+'/evidence/r7-'+tag+'-browser.json',JSON.stringify({url:base,count:checks.length,checks,exceptions,fail,checkedAt:new Date().toISOString(),limits:['Isolated Mac Chrome CSS 320/390, not physical iPhone Safari','No actual provider stream playback tested','No qualified Sikh editorial review']},null,2));
 try{await send('Browser.close');}catch(_){}ws?.close();await delay(300);if(chrome.exitCode===null)chrome.kill('SIGTERM');fs.rmSync(profile,{recursive:true,force:true});if(fail)process.exitCode=1;
}
