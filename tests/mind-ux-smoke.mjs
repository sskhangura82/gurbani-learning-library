import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';
const work=fs.mkdtempSync('/tmp/glp-mind-look-');
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+work,'--no-first-run','--disable-background-networking','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const r={checks:[],screens:[],errors:[],note:'Mac Chrome simulated mobile viewport. Not a physical iPhone or approved psychology lesson.'};let ws,seq=0,sid;const pending=new Map();
function pass(label,condition){if(!condition)throw Error(label);r.checks.push(label);console.log('PASS',label);}
function send(method,params={},sessionId){return new Promise((resolve,reject)=>{const id=++seq;const t=setTimeout(()=>{pending.delete(id);reject(Error('Timeout '+method));},10000);pending.set(id,{resolve,reject,t});ws.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});}
async function js(expr){const x=await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true},sid);if(x.exceptionDetails)throw Error(JSON.stringify(x.exceptionDetails));return x.result.value;}
async function ready(){for(let i=0;i<80;i++){try{if(await js('!!window.GLP_FULL_JAPJI && document.querySelectorAll("#topic-nav button").length===4 && document.getElementById("gurbani-exact").textContent.length>0'))return;}catch{}await sleep(120);}throw Error('Mind page did not initialize');}
async function capture(name){const x=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},sid);const f='docs/screenshots/nitnem-mind/mind-serenity-'+name+'.png';fs.writeFileSync(f,Buffer.from(x.data,'base64'));r.screens.push(f);}
try{
 const pf=path.join(work,'DevToolsActivePort');for(let i=0;!fs.existsSync(pf)&&i<90;i++)await sleep(100);pass('Chrome starts isolated',fs.existsSync(pf));
 const [port,endpoint]=fs.readFileSync(pf,'utf8').trim().split('\n');ws=new WebSocket('ws://127.0.0.1:'+port+endpoint);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.t);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')r.errors.push(m.params.exceptionDetails)};
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});({sessionId:sid}=await send('Target.attachToTarget',{targetId,flatten:true}));await send('Page.enable',{},sid);await send('Runtime.enable',{},sid);await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]},sid);
 for(const [width,height] of [[390,844],[320,740]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true},sid);
  const nav=await send('Page.navigate',{url:'http://127.0.0.1:8892/psychology.html'},sid);pass('Page navigation '+width,!nav.errorText);await ready();
  await js('window.scrollTo(0,0)');
  const x=await js('(()=>{const b=document.getElementById("gurbani-exact").getBoundingClientRect(),heading=document.querySelector(".entrance h1").getBoundingClientRect();return {firstTop:b.top,sourcePx:parseFloat(getComputedStyle(document.getElementById("gurbani-exact")).fontSize),titlePx:parseFloat(getComputedStyle(document.querySelector(".entrance h1")).fontSize),headingTop:heading.top,scrollWidth:document.documentElement.scrollWidth,navItems:[...document.querySelectorAll("#topic-nav button")].map(el=>el.getBoundingClientRect().height)};})()');
  pass('Source line appears in first phone screen '+width,x.firstTop<220);
  pass('Source lettering dominates title '+width,x.sourcePx>x.titlePx);
  pass('All topics are accessible list rows '+width,x.navItems.length===4&&x.navItems.every(n=>n>=44));
  pass('No horizontal scroll '+width,x.scrollWidth<=width);
  pass('No decorative emblem or scripture card '+width,await js('!document.querySelector(".circle") && getComputedStyle(document.querySelector(".lesson")).borderTopWidth==="0px"'));
  pass('History shelf closed by default '+width,await js('!document.querySelector(".history details").open'));
  pass('Original source line unchanged '+width,await js('document.getElementById("gurbani-exact").textContent===GLP_FULL_JAPJI.units[0].lines[0].text'));
  await capture('day-'+width);
  await js('document.querySelector("#topic-nav button[data-topic=haumai]").click()');await sleep(180);
  pass('Topic selection loads exact new scripture '+width,await js('document.getElementById("gurbani-exact").textContent===GLP_FULL_JAPJI.units.find(u=>u.id==="pauri02").lines[5].text'));
  pass('Explanations remain separately labelled '+width,await js('document.querySelector(".psych-lens .section-label").textContent.includes("separate lens")'));
  pass('No media, remote inputs, or user analytics '+width,await js('document.querySelectorAll("audio,video,iframe,input[type=password]").length===0'));
 }
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true},sid);
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'}]},sid);await sleep(100);
 await capture('amrit-390');
 pass('Dark variant is high contrast',await js('getComputedStyle(document.body).backgroundColor==="rgb(18, 27, 43)"'));
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]},sid);
 await send('Page.navigate',{url:'http://127.0.0.1:8892/index.html'},sid);await sleep(220);
 pass('Home still has exactly three primary room cards',await js('document.querySelectorAll(".nitnem-card,.destination-grid .destination").length===3'));
 pass('Study paths are a quiet row, not a fourth card',await js('document.querySelectorAll(".study-paths a").length===2&&!document.querySelector(".mind-door")'));
 pass('Home contains both Mind preview and Nitnem roadmap',await js('Array.from(document.querySelectorAll(".study-paths a")).map(x=>x.getAttribute("href")).sort().join(",")==="nitnem.html,psychology.html"'));
 pass('Home has no horizontal overflow',await js('document.documentElement.scrollWidth<=innerWidth'));
 await capture('home-390');
 pass('No JavaScript exceptions',r.errors.length===0);
 console.log('CHECKS',r.checks.length);
}catch(e){r.errors.push(String(e));console.error('FAILED',String(e));process.exitCode=1;}
finally{fs.writeFileSync('evidence/mind-serenity-browser.json',JSON.stringify({...r,finishedAt:new Date().toISOString()},null,2));try{if(ws?.readyState===1)await send('Browser.close')}catch{}ws?.close();await sleep(350);if(chrome.exitCode===null)chrome.kill('SIGTERM');fs.rmSync(work,{recursive:true,force:true});}
