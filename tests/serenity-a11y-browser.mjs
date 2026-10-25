/* GLP-001 Serenity D5/D6/D10 desktop a11y readiness test.
 * An actual headless Chrome accessibility tree is checked, but native iOS
 * VoiceOver and physical phone actions remain untested.
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const base=process.env.GLP_A11Y_BASE||'http://127.0.0.1:8969';
if(!/^http:\/\/127\.0\.0\.1:8969$/.test(base))throw Error('Loopback-only QA origin required');
const profile=fs.mkdtempSync('/tmp/glp-serenity-a11y-');
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--disable-background-networking','about:blank'],{stdio:'ignore'});
let ws,session,seq=0,failed=null;
const delay=ms=>new Promise(r=>setTimeout(r,ms)),pending=new Map(),checks=[],errors=[];
function check(name,condition,details={}){if(!condition)throw Error(name+' '+JSON.stringify(details));checks.push({name,status:'PASS',details});console.log('PASS '+name);}
function send(method,params={},sid){return new Promise((resolve,reject)=>{
 const id=++seq,timeout=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method));},20000);
 pending.set(id,{resolve,reject,timeout});
 ws.send(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})}));
});}
async function run(expression,byValue=true){const a=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:byValue},session);if(a.exceptionDetails)throw Error('Browser expression failed '+JSON.stringify(a.exceptionDetails));return byValue?a.result.value:a.result;}
async function until(expression,name){for(let i=0;i<120;i++){try{if(await run(expression))return;}catch{}await delay(120);}throw Error('Not ready '+name);}
async function click(query){return await run('(()=>{const b=document.querySelector('+JSON.stringify(query)+');if(!b)throw Error("Missing control");b.click();return true;})()');}
try{
 const pf=path.join(profile,'DevToolsActivePort');
 for(let i=0;!fs.existsSync(pf)&&i<110;i++)await delay(100);
 check('Isolated Chrome launched',fs.existsSync(pf));
 const [port,endpoint]=fs.readFileSync(pf,'utf8').trim().split('\n');
 ws=new WebSocket('ws://127.0.0.1:'+port+endpoint);
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timeout);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown'){errors.push('Chrome Runtime.exceptionThrown');}};
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});
 ({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true}));
 await send('Page.enable',{},session);await send('Runtime.enable',{},session);await send('Accessibility.enable',{},session);
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true},session);
 const nav=await send('Page.navigate',{url:base+'/full-japji.html'},session);
 check('QA reader navigates in actual Chrome',!nav.errorText);
 await until('window.GLP_CONTINUOUS_DEBUG?.lineCount===385','original 385 occurrences');
 const source=await run('(()=>{const original=GLP_FULL_JAPJI.units.flatMap(u=>u.lines);const rows=[...document.querySelectorAll(".scripture-line")];return {n:rows.length,matching:rows.every((r,i)=>r.dataset.occurrence===original[i].id&&r.querySelector(".tuk").textContent===original[i].text),passages:document.querySelectorAll(".passage[aria-labelledby]").length,meaningCount:document.querySelectorAll(".simple-meaning").length,draftLabels:[...document.querySelectorAll(".simple-meaning")].every(b=>b.getAttribute("aria-label")?.includes("Draft meaning")&&b.getAttribute("aria-label")?.includes("qualified review pending"))};})()');
 check('385 exact source lines, 42 named passages and 385 accessible draft labels',source.n===385&&source.matching&&source.passages===42&&source.meaningCount===385&&source.draftLabels,source);
 await run('document.getElementById("dock-position").focus();true');
 await click('#dock-position');
 await until('document.getElementById("reader-dialog")?.open','Jump dialog');
 let state=await run('(()=>{const a=[...document.querySelectorAll("#dialog-body .menu-list [data-action=jump]")],p=document.querySelector(".jump-adjacent");return {rows:a.length,group:p?.getAttribute("role"),previous:p?.children[0]?.disabled,next:p?.children[1]?.disabled,current:a.filter(x=>x.getAttribute("aria-current")==="location").length,position:document.querySelector("#dialog-body .plain-note").textContent,metrics:[...p.querySelectorAll("button")].map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height}))};})()');
 check('Initial Jump has concise previous/next navigation and exactly one current passage',state.rows===42&&state.group==='group'&&state.previous===true&&state.next===false&&state.current===1,state);
 check('320px adjacent buttons remain at least 44px and unclipped',state.metrics.every(x=>x.w>=44&&x.h>=44)&&await run('document.documentElement.scrollWidth<=innerWidth'),state.metrics);
 const screenshot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},session);
 fs.writeFileSync(path.join(root,'evidence/serenity-a11y-jump-320.png'),Buffer.from(screenshot.data,'base64'));
 await click('.jump-adjacent button:last-child');
 await until('!document.getElementById("reader-dialog").open','next passage');
 await until('GLP_CONTINUOUS_DEBUG.getState().read.id===GLP_FULL_JAPJI.units[1].lines[0].id&&document.getElementById("status").textContent.includes("Moved to")','next passage complete');
 const after=await run('(()=>({id:GLP_CONTINUOUS_DEBUG.getState().read.id,expected:GLP_FULL_JAPJI.units[1].lines[0].id,status:document.getElementById("status").textContent,focus:document.activeElement.id}))()');
 check('Next passage moves reading anchor, announces destination and restores focus',after.id===after.expected&&after.status.includes('Moved to')&&after.focus==='dock-position',after);
 await click('#dock-position');
 await until('document.getElementById("reader-dialog").open','reopen Jump');
 state=await run('(()=>{const a=document.querySelector(".jump-adjacent");return {prev:a.children[0].disabled,next:a.children[1].disabled,current:[...document.querySelectorAll("#dialog-body .menu-list button")].filter(b=>b.getAttribute("aria-current")==="location").length};})()');
 check('Middle passage offers both neighbors with one current marker',!state.prev&&!state.next&&state.current===1,state);
 await click('.jump-adjacent button:first-child');
 await until('!document.getElementById("reader-dialog").open','previous passage');
 await until('GLP_CONTINUOUS_DEBUG.getState().read.id===GLP_FULL_JAPJI.units[0].lines[0].id','previous passage complete');
 check('Previous passage restores exact first-unit anchor',await run('GLP_CONTINUOUS_DEBUG.getState().read.id===GLP_FULL_JAPJI.units[0].lines[0].id'));
 await click('#dock-position');
 await until('document.getElementById("reader-dialog").open','last jump');
 const last=await run('document.querySelector("#dialog-body .menu-list button:last-child").dataset.index');
 await click('#dialog-body .menu-list button:last-child');
 await until('!document.getElementById("reader-dialog").open','last reached');
 await until('GLP_CONTINUOUS_DEBUG.getState().read.id===GLP_FULL_JAPJI.units.at(-1).lines[0].id','last passage complete');
 await click('#dock-position');
 await until('document.getElementById("reader-dialog").open','last boundary');
 check('Last passage disables Next and preserves all 42 jump destinations',await run('document.querySelector(".jump-adjacent button:last-child").disabled&&document.querySelectorAll("#dialog-body .menu-list button").length===42'),{last});
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27},session);
 await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27},session);
 await until('!document.getElementById("reader-dialog").open','Escape closes Jump');
 check('Escape closes native Jump dialog and returns keyboard focus to dock',await run('document.activeElement.id==="dock-position"'));
 await click('.modes [data-depth="understand"]');
 await until('document.body.dataset.depth==="understand"','Meaning mode');
 const elem=await run('document.querySelectorAll(".simple-meaning")[16]',false);
 const tree=await send('Accessibility.getPartialAXTree',{objectId:elem.objectId,fetchRelatives:false},session);
 const node=tree.nodes?.find(x=>x.role?.value==='button');
 check('Chrome accessibility tree identifies draft button and review disclaimer',!!node?.name?.value?.includes('Draft meaning')&&node.name.value.includes('qualified review pending'),{accessibleName:node?.name?.value});
 const sr=await run('({width:document.documentElement.scrollWidth,window:innerWidth,meaningVisible:getComputedStyle(document.querySelector(".simple-meaning")).display!=="none"})');
 check('Meaning mode remains usable at 320px with no overflow',sr.meaningVisible&&sr.width<=sr.window,sr);
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]},session);
 const motion=await run('(()=>{const g=document.querySelector(".g-word");return {matches:matchMedia("(prefers-reduced-motion: reduce)").matches,shadow:getComputedStyle(g).textShadow,transition:getComputedStyle(g).transitionDuration}})()');
 check('Reduced-motion preference disables Gurmukhi animated transition',motion.matches&&motion.transition==='0s',motion);
 check('No unhandled JavaScript exceptions',errors.length===0);
}catch(e){failed=String(e);errors.push(failed);console.error('FAIL '+failed);}
finally{
 fs.writeFileSync(path.join(root,'evidence/serenity-a11y-qa.json'),JSON.stringify({checkedAt:new Date().toISOString(),status:failed?'FAIL':'PASS',checks,errors,environment:'Actual isolated Mac Chrome accessibility tree + 320px mobile viewport. Not physical iOS Safari/VoiceOver.'},null,2)+'\n');
 try{if(ws?.readyState===1)await send('Browser.close');}catch{}
 ws?.close();await delay(300);if(chrome.exitCode===null)chrome.kill('SIGTERM');fs.rmSync(profile,{recursive:true,force:true});
 if(failed)process.exitCode=1;
 console.log('RESULT '+(failed?'FAIL':'PASS')+' '+checks.length+' checks');
}
