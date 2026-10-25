import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';
const profile=fs.mkdtempSync('/tmp/glp-serenity-'),delay=ms=>new Promise(r=>setTimeout(r,ms));
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--disable-background-networking','about:blank'],{stdio:'ignore'});
let ws,seq=0,session;const pending=new Map(),checks=[],metrics=[],errors=[];
function ok(name,condition){if(!condition)throw Error('FAILED '+name);checks.push(name);console.log('PASS '+name);}
function send(method,params={},sid){return new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(Error('Timeout '+method));},12000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})}));});}
async function run(expression){const x=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},session);if(x.exceptionDetails)throw Error(JSON.stringify(x.exceptionDetails));return x.result.value;}
async function screenshot(name){const x=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},session);fs.writeFileSync('evidence/serenity-'+name+'.png',Buffer.from(x.data,'base64'));}
async function width(w,h){await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:true},session);await delay(150);}
async function ready(){for(let i=0;i<100;i++){try{if(await run('window.GLP_CONTINUOUS_DEBUG?.lineCount===385'))return;}catch{}await delay(100);}throw Error('Reader not ready');}
const measure='(()=>{const first=document.querySelector(".scripture-line .tuk").getBoundingClientRect(),header=document.querySelector(".page-header").getBoundingClientRect(),dock=document.querySelector(".reading-dock").getBoundingClientRect();return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,firstTop:Math.round(first.top),dockHeight:Math.round(dock.height),headerHeight:Math.round(header.height),targets:[...document.querySelectorAll(".reading-dock > button,.reading-dock .modes button")].map(x=>({id:x.id||x.dataset.depth,width:x.getBoundingClientRect().width,height:x.getBoundingClientRect().height})),depth:document.body.dataset.depth};})()';
try{
 const pf=path.join(profile,'DevToolsActivePort');for(let i=0;!fs.existsSync(pf)&&i<100;i++)await delay(100);
 ok('Isolated browser available',fs.existsSync(pf));
 const [port,endpoint]=fs.readFileSync(pf,'utf8').trim().split('\n');
 ws=new WebSocket('ws://127.0.0.1:'+port+endpoint);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);};
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});
 ({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true}));
 await send('Page.enable',{},session);await send('Runtime.enable',{},session);
 await width(390,844);
 const qaPort=Number(process.env.GLP_SERENITY_QA_PORT||8894);if(![8894,8969].includes(qaPort))throw Error('Serenity smoke QA must use approved loopback port');
 const v=await send('Page.navigate',{url:'http://127.0.0.1:'+qaPort+'/full-japji.html'},session);ok('Real local HTML navigation',!v.errorText);await ready();
 ok('385 source lines preserved',await run('JSON.stringify([...document.querySelectorAll(".tuk")].map(x=>x.textContent))===JSON.stringify(GLP_FULL_JAPJI.units.flatMap(u=>u.lines.map(l=>l.text)))'));
 ok('385 meanings and 42 units remain mounted',await run('GLP_CONTINUOUS_DEBUG.explanationCount===385&&GLP_CONTINUOUS_DEBUG.units===42'));
 for(const [w,h] of [[320,740],[390,844]]){
   await width(w,h);await run('window.scrollTo(0,0)');await delay(120);
   const m=await run(measure);metrics.push(m);
   ok(w+'px no horizontal overflow',m.scrollWidth<=w);
   ok(w+'px reader starts near top',m.firstTop<215);
   ok(w+'px compact dock',m.dockHeight<=70);
   ok(w+'px six accessible controls',m.targets.length===6&&m.targets.every(x=>x.height>=44&&x.width>=44));
   await screenshot('read-'+w);
   await run('document.querySelector("[data-depth=understand]").click()');await delay(180);
   const u=await run(measure);metrics.push(u);ok(w+'px Understand no overflow',u.scrollWidth<=w);
   await screenshot('understand-'+w);
   await run('document.querySelector("[data-depth=read]").click()');
 }
 await width(320,740);
 await run('document.documentElement.style.setProperty("--gurmukhi-size","60px")');
 ok('320px/200% scripture reflows',await run('document.documentElement.scrollWidth<=innerWidth'));
 await screenshot('large-320');
 await run('document.documentElement.style.removeProperty("--gurmukhi-size")');
 await run('document.getElementById("play").click()');await delay(1200);
 ok('Guided visual play works',await run('GLP_CONTINUOUS_DEBUG.isPlaying()'));
 await run('document.getElementById("play").click()');
 ok('Guide pauses',await run('!GLP_CONTINUOUS_DEBUG.isPlaying()'));
 ok('No JS exceptions',errors.length===0);
 console.log('ALL_CHECKS',checks.length);
}catch(e){errors.push(String(e));console.error(String(e));process.exitCode=1;}
finally{
 fs.writeFileSync('evidence/serenity-smoke.json',JSON.stringify({checkedAt:new Date().toISOString(),checks,metrics,errors,scope:'Isolated Mac Chrome simulated 320/390 widths, not physical iPhone'},null,2));
 try{if(ws?.readyState===1)await send('Browser.close');}catch{}
 ws?.close();await delay(300);if(chrome.exitCode===null)chrome.kill('SIGTERM');
 fs.rmSync(profile,{recursive:true,force:true});
}
