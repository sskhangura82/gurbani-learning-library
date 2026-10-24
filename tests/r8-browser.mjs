import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),origin='http://127.0.0.1:8903',profile=fs.mkdtempSync('/tmp/glp-r8-browser-');
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','--disable-background-networking','about:blank'],{stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms));let ws,session,seq=0,fail=null;const pending=new Map(),checks=[],exceptions=[],requests=[];
function test(k,v){if(!v)throw Error(k);checks.push(k);console.log('PASS',k);}
function send(method,params={},sid){return new Promise((resolve,reject)=>{const id=++seq,t=setTimeout(()=>{pending.delete(id);reject(Error('Timeout '+method));},13000);pending.set(id,{resolve,reject,t});ws.send(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})}));});}
async function run(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},session);if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
async function waitFor(expr){for(let i=0;i<80;i++){try{if(await run(expr))return;}catch{}await delay(125);}throw Error('Not ready: '+expr);}
async function snap(name){const o=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},session);fs.mkdirSync(root+'/evidence',{recursive:true});fs.writeFileSync(root+'/evidence/r8-'+name+'.png',Buffer.from(o.data,'base64'));}
try {
 const portfile=profile+'/DevToolsActivePort';for(let i=0;!fs.existsSync(portfile)&&i<95;i++)await delay(100);test('Isolated browser starts',fs.existsSync(portfile));const [port,endpoint]=fs.readFileSync(portfile,'utf8').trim().split('\n');ws=new WebSocket('ws://127.0.0.1:'+port+endpoint);await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.t);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails);else if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);};
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true}));await send('Page.enable',{},session);await send('Runtime.enable',{},session);await send('Network.enable',{},session);
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true},session);
 const nav=await send('Page.navigate',{url:origin+'/full-japji.html'},session);test('Reader loads on a real origin',!nav.errorText);await waitFor('window.GLP_CONTINUOUS_DEBUG?.lineCount===385');
 test('No video player or external scripts before opt-in',await run('document.getElementById("youtube-panel").hidden && document.querySelectorAll("#youtube-player-host iframe").length===0'));
 test('385 exact Gurmukhi occurrences preserved',await run('document.querySelectorAll(".tuk").length===385'));
 await run('document.getElementById("tools-open").click()');
 test('Short reader menu is in compact grouped layout',await run('document.getElementById("reader-dialog").open && document.getElementById("reader-dialog").dataset.view==="reader-menu"&&document.querySelectorAll(".reader-menu-grid button").length===5'));
 test('Reading menu has less than three-quarters screen height',await run('document.getElementById("reader-dialog").getBoundingClientRect().height<innerHeight*.76'));
 test('More controls are collapsed, and previous functions remain available',await run('!document.querySelector(".reader-more").open && document.querySelectorAll(".reader-more-actions button").length>=5'));
 await snap('compact-menu-day');
 await run('document.querySelector(".reader-more summary").click()');
 test('Secondary actions become available without replacing main menu',await run('document.querySelector(".reader-more").open&&document.querySelector("[data-action=reader-start]")'));
 await run('document.querySelector("[data-action=reader-listen]").click()');
 test('YouTube chooser appears with search link and paste field',await run('document.getElementById("reader-dialog").open && !!document.getElementById("youtube-url")&&!!document.getElementById("youtube-query")&&!!document.getElementById("youtube-search")'));
 test('Still no external YouTube requests before actual selection',requests.every(x=>!x.includes('youtube.com')));
 await snap('youtube-chooser');
 await run('document.getElementById("youtube-url").value="javascript:alert(1)";document.querySelector("[data-action=youtube-load]").click()');
 test('Unsafe URL visibly rejected',await run('document.getElementById("youtube-error").textContent.includes("HTTPS") && !document.getElementById("youtube-error").hidden'));
 await run('window.YT={PlayerState:{PLAYING:1,PAUSED:2},Player:class {constructor(id,options){const n=document.getElementById(id);const f=document.createElement("iframe");f.src="about:blank";f.width="100%";f.height="212";n.replaceWith(f);this.iframe=f;this.options=options;window.GLP_MOCK_PLAYER=this;options.events.onReady();}getCurrentTime(){return 165;}pauseVideo(){window.GLP_PAUSED=true;}destroy(){this.iframe.remove();window.GLP_DESTROYED=true;}}};');
 await run('document.getElementById("youtube-url").value="https://youtu.be/M7lc1UVf-VE?t=3";document.querySelector("[data-action=youtube-load]").click()');
 await waitFor('!document.getElementById("youtube-panel").hidden');
 test('Explicit choice mounts a visible official API player container',await run('document.querySelector("#youtube-player-host iframe")!==null&&document.getElementById("youtube-status").textContent.includes("no checked timing")'));
 test('Player viewport meets YouTube minimum height',await run('document.querySelector(".youtube-player-frame").getBoundingClientRect().height>=200'));
 test('No automatic play after loading',await run('window.GLP_MOCK_PLAYER.options.playerVars.autoplay===0'));
 test('Video marked unaligned rather than pretending to glow',await run('document.getElementById("youtube-status").textContent.includes("timing map")&&GLP_CONTINUOUS_DEBUG.getState().guide.token===0'));
 await snap('visible-companion-simulated');
 await run('document.getElementById("tools-open").click()');
 test('Study menu pauses/hides video before covering it',await run('document.getElementById("youtube-panel").hidden&&window.GLP_PAUSED===true&&document.getElementById("reader-dialog").open'));
 await run('document.getElementById("dialog-close").click()');await delay(160);
 test('Closing dialog restores paused visible player',await run('!document.getElementById("youtube-panel").hidden&&document.getElementById("youtube-status").textContent.includes("paused while you studied")'));
 await run('document.getElementById("youtube-close").click()');
 test('Closing player destroys it so audio cannot continue hidden',await run('window.GLP_DESTROYED===true&&document.getElementById("youtube-panel").hidden&&document.querySelectorAll("#youtube-player-host iframe").length===0'));
 test('All three modes work after closing video',await run('document.querySelector("[data-depth=understand]").click();document.body.dataset.depth==="understand"'));
 test('Existing original Gurmukhi unchanged after all interactions',await run('JSON.stringify([...document.querySelectorAll(".tuk")].map(t=>t.textContent))===JSON.stringify(GLP_FULL_JAPJI.units.flatMap(u=>u.lines.map(l=>l.text)))'));
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true},session);
 test('320px menu layout has no horizontal scroll',await run('document.documentElement.scrollWidth<=innerWidth'));
 await run('document.getElementById("tools-open").click()');await snap('compact-menu-320');
 test('No javascript exceptions',exceptions.length===0);
 console.log('TOTAL PASSED',checks.length);
}catch(err){fail=String(err);console.error('FAIL',fail);try{await snap('failure');}catch{}}
finally {
 fs.mkdirSync(root+'/evidence',{recursive:true});fs.writeFileSync(root+'/evidence/r8-browser.json',JSON.stringify({checks,count:checks.length,fail,exceptions,scope:'Isolated desktop Chrome; mock YouTube API; NOT actual YouTube playback nor physical iPhone',checkedAt:new Date().toISOString()},null,2));
 try{if(ws?.readyState===1)await send('Browser.close')}catch{}ws?.close();await delay(200);if(chrome.exitCode===null)chrome.kill('SIGTERM');fs.rmSync(profile,{recursive:true,force:true});if(fail)process.exitCode=1;
}
