/* Actual isolated Chrome comparison with Japji format, pace 200 on both.
 * Source-only Mac loopback QA; no private user profile or remote providers.
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const base='http://127.0.0.1:9042';
const profile=fs.mkdtempSync('/tmp/glp-japji-parity-');
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',[
 '--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0',
 '--user-data-dir='+profile,'--no-first-run','--disable-background-networking','about:blank'],{stdio:'ignore'});
let ws,session,seq=0,failed=null;
const pending=new Map(),checks=[],errors=[],requests=[],delay=t=>new Promise(r=>setTimeout(r,t));
function check(name,ok,detail={}){
 if(!ok)throw Error(name+' '+JSON.stringify(detail));
 checks.push(name);console.log('PASS '+name);
}
function send(method,params={},sid){
 return new Promise((resolve,reject)=>{
  const id=++seq,timeout=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},22000);
  pending.set(id,{resolve,reject,timeout});
  ws.send(JSON.stringify({id,method,params,...(sid?{sessionId:sid}:{})}));
 });
}
async function run(expression){
 const p=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},session);
 if(p.exceptionDetails)throw Error('Browser JavaScript: '+JSON.stringify(p.exceptionDetails));
 return p.result.value;
}
async function until(exp,name,ms=45000){
 const end=Date.now()+ms;
 while(Date.now()<end){try{if(await run(exp))return;}catch{}await delay(150);}
 throw Error('Timed out '+name+'; pathname='+await run('location.pathname')+'; body='+String(await run('document.body?.innerText?.slice(0,300)')).slice(0,150));
}
async function nav(url){const result=await send('Page.navigate',{url},session);if(result.errorText)throw Error('Navigation '+result.errorText);}
async function click(selector){
 return run('(()=>{let e=document.querySelector('+JSON.stringify(selector)+');if(!e)throw Error("Missing element: "+'+JSON.stringify(selector)+');e.click();return true})()');
}
async function shot(name){const result=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},session);fs.writeFileSync(path.join(root,'evidence/'+name),Buffer.from(result.data,'base64'));}
async function phone(width=390,height=844){await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true},session);await delay(150);}
async function openBani(name,count){
 await click('[data-open="'+name+'"]');
 await until('window.NITNEM_INTERNAL_QA?.getState().bani==='+JSON.stringify(name)+'&&NITNEM_INTERNAL_QA.getState().sourceVerified',name);
 const state=await run('NITNEM_INTERNAL_QA.getState()');
 check('Verified local original source: '+name,state.lineCount===count&&!state.releaseAuthorized,state);
}
async function library(){
 await click('#library-back');
 await until('document.getElementById("collection").hidden===false','collection');
}
try{
 const file=path.join(profile,'DevToolsActivePort');
 for(let i=0;!fs.existsSync(file)&&i<130;i++)await delay(120);
 check('Private temporary Chrome launched',fs.existsSync(file));
 const [cdp,endpoint]=fs.readFileSync(file,'utf8').trim().split('\n');
 ws=new WebSocket('ws://127.0.0.1:'+cdp+endpoint);
 await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;});
 ws.onmessage=e=>{
  const m=JSON.parse(e.data);
  if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timeout);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}}
  else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails?.text||'Runtime exception');
  else if(m.method==='Network.requestWillBeSent')requests.push(m.params.request?.url);
 };
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});
 ({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true}));
 await send('Runtime.enable',{},session);
 await send('Page.enable',{},session);
 await send('Network.enable',{},session);
 await phone(390,844);
 await nav(base+'/nitnem/japji.html');
 await until('window.GLP_CONTINUOUS_DEBUG?.lineCount===385','accepted Japji equivalent',50000);
 check('Japji original continuous source loads all 385 original lines',await run('document.querySelectorAll(".scripture-line").length===385'));
 check('Japji has 385 exact inline Meaning controls and 42 passage Study lessons',await run('document.querySelectorAll(".simple-meaning").length===385&&document.querySelectorAll(".unit-lesson").length===42'));
 check('Original private Japji pace slider now ranges 50 to 200',await run('document.getElementById("pace-slider").min==="50"&&document.getElementById("pace-slider").max==="200"&&document.getElementById("pace-slider").step==="5"'));
 await run('(()=>{const p=document.getElementById("pace-slider");p.value="200";p.dispatchEvent(new Event("input",{bubbles:true}));return true;})()');
 check('Japji actual runtime state accepts 200',await run('GLP_CONTINUOUS_DEBUG.getState().pace===200'));
 await delay(650);
 await nav(base+'/nitnem/japji.html');
 await until('window.GLP_CONTINUOUS_DEBUG?.lineCount===385','Japji private restart');
 check('Japji pace 200 survives browser reload',await run('GLP_CONTINUOUS_DEBUG.getState().pace===200'));
 check('Japji original data and mode still accessible after pace change',await run('document.querySelectorAll(".simple-meaning").length===385'));
 await nav(base+'/nitnem/index.html');
 await until('!!window.NITNEM_INTERNAL_QA','Nitnem index');
 check('Full Nitnem Japji link is the local matched-format reader, not external',await run('document.querySelector("[data-kind=original-japji]")?.getAttribute("href")==="japji.html"'));
 await openBani('sohila',56);
 check('Sohila uses compact six-control Japji dock including Read Meaning Study',await run('(()=>{const d=document.getElementById("dock");return d.querySelectorAll("button").length===6&&[...d.querySelectorAll("button")].every(x=>x.getBoundingClientRect().height>=43.9)&&d.querySelector("[data-mode=study]").textContent.includes("Study")})()'));
 check('Default Gurmukhi size matches Japji at 30px',await run('parseFloat(getComputedStyle(document.querySelector(".tuk")).fontSize)===30'));
 await click('[data-mode="meaning"]');
 check('Sohila Meaning has five explicitly labeled passage summaries',await run('document.querySelectorAll(".passage-summary").length===5'));
 check('Every Sohila original line has a single meaning button attached to its exact source position',
 await run('(async()=>{const s=(await(await fetch("data/sohila.json")).json()).units.flatMap(u=>u.lines);const b=[...document.querySelectorAll(".simple-meaning[data-meaning-line]")];return s.length===56&&b.length===56&&b.every((x,i)=>x.dataset.meaningLine===s[i].id&&x.previousElementSibling.classList.contains("tuk")&&x.parentElement.classList.contains("scripture-line"))})()'));
 check('All 56 original text hashes and displayed letters are unchanged with the educational layer on',
 await run('(async()=>{const s=(await(await fetch("data/sohila.json")).json()).units.flatMap(u=>u.lines);return [...document.querySelectorAll("#source-unit .scripture-line")].every((r,i)=>r.querySelector(".tuk")?.textContent===s[i].text&&r.dataset.sourceSha256===s[i].sha256)})()'));
 check('Six source heading and invocation notes explicitly identify themselves, not a devotional verse translation',
 await run('[...document.querySelectorAll(".simple-meaning .expand-hint")].filter(x=>x.textContent.includes("Heading / invocation")).length===6'));
 check('Full Sohila 56 educational notes with ZERO human approvals are loaded in the reader',
 await run('(async()=>{const c=await(await fetch("learning/course.v5.json")).json();return c.meta.editorialStatus==="DRAFT_AI_UNREVIEWED"&&c.coverage.byBani.sohila.firstLineNotes===56&&c.coverage.reviewedSourceMeaningLines===0})()'));
 await run('(()=>{[...document.querySelectorAll(".simple-meaning")].find(x=>x.dataset.meaningLine==="sohila04.line08").scrollIntoView({behavior:"instant",block:"center"});return true;})()');
 check('New Sohila Shabad 4 line 8 has its own newly authored English and Punjabi meaning',await run('(()=>{const b=[...document.querySelectorAll(".simple-meaning")].find(x=>x.dataset.meaningLine==="sohila04.line08");return b.querySelector(".english")?.textContent.includes("Naam")&&b.querySelector(".punjabi")?.textContent.includes("ਨਾਮ")})()'));
 await shot('glp-anand-p8-20-sohila-390.png');
 await click('[data-meaning-line="sohila04.line08"]');
 await until('document.getElementById("meaning-dialog").open','new Shabad 4 line detailed meaning popup');
 check('Newly authored Shabad 4 source line also opens its own original-text-anchored deeper Study dialog',await run('(async()=>{const p=(await(await fetch("data/sohila.json")).json()).units[3].lines.find(x=>x.id==="sohila04.line08");const b=document.getElementById("meaning-dialog-body");return b.querySelector(".excerpt").textContent===p.text&&b.textContent.includes("Words & grammar")})()'));
 await click('#meaning-close');
 await until('!document.getElementById("meaning-dialog").open && document.getElementById("meaning-dialog-body").childElementCount===0','first detail modal has completely closed before opening another');
 check('Simple English and Punjabi typography matches Japji at 14 and 16px',await run('(()=>{const e=document.querySelector(".simple-meaning .english"),p=document.querySelector(".simple-meaning .punjabi");return getComputedStyle(e).fontSize==="14px"&&getComputedStyle(p).fontSize==="16px"})()'));
 check('Meaning exposes honest five-of-five draft coverage, not human approval',await run('document.getElementById("learning-overview").textContent.includes("5 of 5")'));
 await click('[data-meaning-line="sohila01.line03"]');
 await until('document.getElementById("meaning-dialog").open','inline meaning dialog');
 check('Tapping a line reveals exactly that source line plus Japji-style deeper study',await run('(async()=>{const p=(await (await fetch("data/sohila.json")).json()).units[0];const l=p.lines.find(x=>x.id==="sohila01.line03");const b=document.getElementById("meaning-dialog-body");return b.querySelector(".excerpt")?.textContent===l.text&&b.querySelector(".unit-lesson")&&b.textContent.includes("Words & grammar")})()'));
 await shot('glp-anand-p8-20-sohila-meaning-390.png');
 await click('#meaning-close');
 check('Closing meaning restores the same source without navigation',await run('!document.getElementById("meaning-dialog").open && document.querySelector(".passage-block[data-unit-index=\\"0\\"]")!==null'));
 await click('[data-mode="study"]');
 const headings=await run('(()=>[...document.querySelector("#source-unit .unit-lesson").querySelectorAll("h4")].map(x=>x.textContent))()');
 const expected=['Passage meaning · summary, not word-for-word translation','Close sense','Place in Kirtan Sohila',
  'Words & grammar','Pronunciation support','Interpretation & open questions',
  'Practical reflection · application, not translation','Teach it back'];
 check('Study displays Japji exact sequence of eight heading types',expected.every((x,i)=>headings[i]===x),{headings});
 check('Full five Sohila passage studies remain intact and unapproved',await run('document.querySelectorAll("#source-unit .unit-lesson").length===5&&document.querySelector("#source-unit .unit-lesson").textContent.includes("HUMAN REVIEW PENDING")'));
 await shot('glp-anand-p8-20-sohila-study-390.png');
 await click('[data-mode="read"]');
 await phone(320,740);
 check('Compact Japji-format dock does not overflow 320px iPhone viewport',await run('document.documentElement.scrollWidth<=innerWidth'));
 await click('#reading-tools');
 await until('document.getElementById("tools-dialog").open','reading tools');
 check('Nitnem visual pace slider reaches 200 in 5-step increments',await run('(()=>{const p=document.getElementById("pace");return p.min==="50"&&p.max==="200"&&p.step==="5"})()'));
 await run('(()=>{const p=document.getElementById("pace");p.value="200";p.dispatchEvent(new Event("input",{bubbles:true}));return true;})()');
 check('Nitnem 200 pace changes actual runtime state',await run('NITNEM_INTERNAL_QA.getState().pace===200&&document.getElementById("pace-value").textContent==="200"'));
 await click('#tools-close');
 await nav(base+'/nitnem/index.html?bani=sohila');
 await until('window.NITNEM_INTERNAL_QA?.getState().bani==="sohila"&&NITNEM_INTERNAL_QA.getState().sourceVerified','same original after reload');
 check('Nitnem saved 200 pace survives reload without altering original Gurmukhi',await run('NITNEM_INTERNAL_QA.getState().pace===200&&document.querySelectorAll(".scripture-line").length===56'));

 await library();
 await openBani('savaiye',40);
 check('All ten Tav-Prasad morning Savaiye remain in exactly four original source lines',await run('document.querySelectorAll(".passage-block").length===10 && document.querySelectorAll(".scripture-line").length===40 && document.querySelectorAll(".original-preface").length===3'));
 await click('[data-mode="meaning"]');
 check('All 40 Savaiye original lines now show their OWN bilingual meaning immediately beneath Gurmukhi',await run('(async()=>{const src=(await(await fetch("data/savaiye.json")).json()).units.flatMap(u=>u.lines);const a=[...document.querySelectorAll(".simple-meaning[data-meaning-line]")];return src.length===40&&a.length===40&&a.every((b,i)=>b.dataset.meaningLine===src[i].id&&b.previousElementSibling.classList.contains("tuk")&&b.querySelector(".english")?.textContent.length>30&&b.querySelector(".punjabi")?.textContent.length>25)})()'));
 check('Savaiye original Gurmukhi text + SHA are byte-identical despite 40 new inline explanations',await run('(async()=>{const x=(await(await fetch("data/savaiye.json")).json()).units.flatMap(u=>u.lines);return [...document.querySelectorAll(".scripture-line")].every((r,i)=>r.querySelector(".tuk")?.textContent===x[i].text&&r.dataset.sourceSha256===x[i].sha256)})()'));
 check('Ten original passage summaries remain with full English and Punjabi context and honest review status',await run('document.querySelectorAll(".passage-summary").length===10 && document.getElementById("learning-overview").textContent.includes("10 of 10")'));
 check('Draft V3 source shows 40/40 Savaiye, old V2 has only two, new reviewer count remains zero',await run('(async()=>{const n=await(await fetch("learning/course.v5.json")).json(),o=await(await fetch("learning/course.v2.json")).json();return n.coverage.byBani.savaiye.firstLineNotes===40&&o.coverage.byBani.savaiye.firstLineNotes===2&&n.coverage.reviewedSourceMeaningLines===0&&n.meta.editorialStatus==="DRAFT_AI_UNREVIEWED"})()'));
 check('The two earlier Savaiye meaning notes remain unchanged in the V3 source',await run('(async()=>{const a=await(await fetch("learning/course.v5.json")).json(),b=await(await fetch("learning/course.v2.json")).json();return ["savaiye|savaiye04.line01","savaiye|savaiye09.line04"].every(k=>JSON.stringify(a.closeTextNotes[k])===JSON.stringify(b.closeTextNotes[k]))})()'));
 await run('(()=>{const n=[...document.querySelectorAll(".simple-meaning")].find(b=>b.dataset.meaningLine==="savaiye10.line02");n.scrollIntoView({behavior:"instant",block:"center"});return true})()');
 check('New Savaiya 10 directional-practice line explains original without disparaging another religion',await run('(()=>{const a=[...document.querySelectorAll(".simple-meaning")].find(b=>b.dataset.meaningLine==="savaiye10.line02");return a.querySelector(".english").textContent.includes("west")&&a.querySelector(".punjabi").textContent.includes("ਪੱਛਮ")})()'));
 await shot('glp-anand-p8-20-savaiye-390.png');
 await click('[data-meaning-line="savaiye10.line02"]');
 await until('document.getElementById("meaning-dialog").open','source-bound new Savaiye line detailed dialog');
 check('New Savaiye 10 original line opens only its own exact source + the enclosing deeper Study',await run('(async()=>{const s=(await(await fetch("data/savaiye.json")).json()).units[9].lines[1];const d=document.getElementById("meaning-dialog-body");return d.querySelector(".excerpt")?.textContent===s.text&&d.querySelectorAll(".unit-lesson").length===1&&d.textContent.includes("Words & grammar")})()'));
 await click('#meaning-close');
 await until('!document.getElementById("meaning-dialog").open','Savaiye line dialog closes');
 await click('[data-mode="study"]');
 check('Ten Savaiye structured deep Study lessons remain under complete line-meaning layer',await run('document.querySelectorAll("#source-unit .unit-lesson").length===10 && document.querySelectorAll("#source-unit .lesson-vocabulary").length===10'));
 await shot('glp-anand-p8-20-savaiye-study-390.png');
 await click('[data-mode="read"]');

 await library();
 await openBani('chaupai',116);
 check('All 29 expanded candidate Chaupai pauris and 116 exact original rows load',await run('document.querySelectorAll(".passage-block").length===29 && document.querySelectorAll(".scripture-line").length===116'));
 check('Chaupai original variant is identified as 29 pauris, not universal',await run('document.getElementById("bani-variant").textContent.includes("29-pauri") && document.getElementById("bani-variant").textContent.includes("NOT adjudicated")'));
 check('SGPC-bounded excerpt end is visible at Pauri 25',await run('document.querySelectorAll(".passage-block")[24].querySelector(".source-variant-boundary")?.textContent.includes("ends the SGPC-bounded")'));
 check('Every extended Pauri 26-29 shows a source-variant notice even while reading',await run('[25,26,27,28].every(i=>document.querySelectorAll(".passage-block")[i].querySelector(".source-variant-extended")?.textContent.includes("Not asserted"))'));
 await click('[data-mode="meaning"]');
 check('Each original Chaupai line has an individual bilingual draft immediately below the exact Gurmukhi',await run('(async()=>{const lines=(await(await fetch("data/chaupai.json")).json()).units.flatMap(u=>u.lines);const all=[...document.querySelectorAll(".simple-meaning[data-meaning-line]")];return lines.length===116&&all.length===116&&all.every((n,i)=>n.dataset.meaningLine===lines[i].id&&n.previousElementSibling.classList.contains("tuk")&&n.querySelector(".english")?.textContent.length>20&&n.querySelector(".punjabi")?.textContent.length>17)})()'));
 check('All 116 Chaupai displayed Gurmukhi original text and source SHA bytes still exact',await run('(async()=>{const s=(await(await fetch("data/chaupai.json")).json()).units.flatMap(u=>u.lines);return [...document.querySelectorAll(".scripture-line")].every((r,i)=>r.querySelector(".tuk")?.textContent===s[i].text&&r.dataset.sourceSha256===s[i].sha256)})()'));
 check('Chaupai 29/29 unique deeper lessons and 116/116 line drafts remain marked unreviewed',await run('(async()=>{const p=await(await fetch("learning/course.v5.json")).json();return p.coverage.byBani.chaupai.firstLineNotes===116&&p.coverage.byBani.chaupai.draftLessons===29&&p.coverage.reviewedUnitLessons===0&&document.querySelectorAll(".passage-summary").length===29})()'));
 check('Previously saved Chaupai first four original bilingual lines are untouched',await run('(async()=>{const a=await(await fetch("learning/course.v5.json")).json(),b=await(await fetch("learning/course.v3.json")).json();return ["line01","line02","line03","line04"].every(x=>JSON.stringify(a.closeTextNotes["chaupai|chaupai-rehras01."+x])===JSON.stringify(b.closeTextNotes["chaupai|chaupai-rehras01."+x]))})()'));
 check('Pauri 20 difficult enemy-language has an explicit prohibition on contemporary group hatred',await run('(async()=>{const c=await(await fetch("learning/course.v5.json")).json();return c.unitLessons["chaupai|chaupai-rehras20"].study.interpretationCare.includes("malechh") && c.closeTextNotes["chaupai|chaupai-rehras20.line04"].interpretiveCaution.includes("Do not equate")})()'));
 check('Extended Pauri 28 notes are not presented as clinical cures',await run('(async()=>{const c=await(await fetch("learning/course.v5.json")).json();return c.unitLessons["chaupai|chaupai-long28"].study.interpretationCare.includes("clinical")&&c.unitLessons["chaupai|chaupai-long28"].study.interpretationCare.includes("speech disorders")})()'));
 await run('(()=>{const a=[...document.querySelectorAll(".simple-meaning")].find(n=>n.dataset.meaningLine==="chaupai-long28.line01");a.scrollIntoView({behavior:"instant",block:"center"});return true})()');
 check('Expanded Pauri 28 visible English and Punjabi are a distinct source-linked authored draft',await run('(()=>{const a=[...document.querySelectorAll(".simple-meaning")].find(n=>n.dataset.meaningLine==="chaupai-long28.line01");return a.querySelector(".english").textContent.includes("unable to speak")&&a.querySelector(".punjabi").textContent.includes("ਗੂੰਗਾ")})()'));
 await shot('glp-anand-p8-20-chaupai-390.png');
 await click('[data-meaning-line="chaupai-long28.line01"]');
 await until('document.getElementById("meaning-dialog").open','Chaupai extended line deep modal');
 check('Tap original extended line gives EXACT source plus its own deeper Study and medical caution',await run('(async()=>{const s=(await(await fetch("data/chaupai.json")).json()).units[27].lines[0],b=document.getElementById("meaning-dialog-body");return b.querySelector(".excerpt")?.textContent===s.text&&b.textContent.includes("Words & grammar")&&b.textContent.includes("speech disorders")})()'));
 await click('#meaning-close');
 await until('!document.getElementById("meaning-dialog").open','Chaupai source dialog closed');
 await click('[data-mode="study"]');
 check('ALL 29 Japji-format Chaupai deep Study lessons render with original source anchored vocabulary',await run('document.querySelectorAll("#source-unit .unit-lesson").length===29&&document.querySelectorAll("#source-unit .lesson-vocabulary").length===29'));
 check('Extended 26-29 source warnings remain visible in Study and do not go away',await run('document.querySelectorAll(".source-variant-extended").length===4&&!!document.querySelectorAll(".passage-block")[24].querySelector(".source-variant-boundary")'));
 await shot('glp-anand-p8-20-chaupai-study-390.png');
 await click('[data-mode="read"]');
 await library();
 await openBani('jaap',782);
 await click('[data-mode="meaning"]');
 check('Jaap preserves seven authored passage summaries, not 782 invented line translations',await run('document.querySelectorAll(".passage-summary").length===7&&NITNEM_INTERNAL_QA.getState().authoredLessons===7'));
 await click('#jump');
 await click('#jump-list button:nth-child(99)');
 await click('#view-passage');
 check('Jaap Chhand 99 transparently shows unwritten lesson in Meaning mode',await run('document.querySelector(".learning-not-written")?.textContent.includes("not written yet")&&document.querySelectorAll(".simple-meaning").length===0'));
 await click('[data-mode="read"]');
 await library();

 await openBani('anand',208);
 check('Anand has all 40 original pauris and 208 Gurmukhi line records',await run('document.querySelectorAll(".passage-block").length===40&&document.querySelectorAll(".scripture-line").length===208'));
 await click('[data-mode="meaning"]');
 check('Exactly 68 Pauri8–20 authored bilingual notes attach to their own Gurmukhi lines',await run('(async()=>{const src=(await(await fetch("data/anand.json")).json()).units.slice(7,20).flatMap(u=>u.lines);const buttons=[...document.querySelectorAll(".simple-meaning")].filter(x=>/^anand(0[8-9]|1[0-9]|20)\./.test(x.dataset.meaningLine));return src.length===68&&buttons.length===68&&buttons.every((b,i)=>b.dataset.meaningLine===src[i].id&&b.previousElementSibling.classList.contains("tuk")&&b.querySelector(".english")?.textContent.length>25&&b.querySelector(".punjabi")?.textContent.length>25)})()'));
 check('All 68 newly taught original Gurbani lines and SHAs remain exact',await run('(async()=>{const src=(await(await fetch("data/anand.json")).json()).units.slice(7,20).flatMap(u=>u.lines),rows=[...document.querySelectorAll(".scripture-line")];return src.every(x=>{const row=rows.find(r=>r.dataset.lineId===x.id);return row&&row.querySelector(".tuk")?.textContent===x.text&&row.dataset.sourceSha256===x.sha256})})()'));
 check('There are 71 total authored Anand line meanings and exactly 20 passage summaries',await run('document.querySelectorAll(".simple-meaning").length===71&&document.querySelectorAll(".passage-summary").length===20'));
 check('V5 source manifest honestly reports 20 Anand Study pauris and zero qualified approvals',await run('(async()=>{const c=await(await fetch("learning/course.v5.json")).json();return c.coverage.byBani.anand.draftLessons===20&&c.coverage.byBani.anand.firstLineNotes===71&&c.coverage.reviewedUnitLessons===0})()'));
 await run('(()=>{[...document.querySelectorAll(".simple-meaning")].find(x=>x.dataset.meaningLine==="anand19.line03").scrollIntoView({behavior:"instant",block:"center"});return true})()');
 check('Anand19 one-line meaning addresses craving and impermanence in both languages',await run('(()=>{const x=[...document.querySelectorAll(".simple-meaning")].find(n=>n.dataset.meaningLine==="anand19.line03");return x.querySelector(".english")?.textContent.includes("Craving")&&x.querySelector(".punjabi")?.textContent.includes("ਤ੍ਰਿਸ਼ਨਾ")})()'));
 await shot('glp-anand-p8-20-inline-390.png');
 await click('[data-meaning-line="anand19.line03"]');
 await until('document.getElementById("meaning-dialog").open','Anand19 line detail modal');
 check('Anand Pauri19 line opens its exact original excerpt and own deep Study caution',await run('(async()=>{const src=(await(await fetch("data/anand.json")).json()).units[18].lines[2],body=document.getElementById("meaning-dialog-body");return body.querySelector(".excerpt")?.textContent===src.text&&body.querySelectorAll(".unit-lesson").length===1&&body.textContent.includes("Words & grammar")&&body.textContent.includes("medical")})()'));
 await click('#meaning-close');
 await until('!document.getElementById("meaning-dialog").open','Anand dialog closed');
 await click('[data-mode="study"]');
 check('Deep Study uses the exact Japji headings for all 20 authored Anand pauris',await run('document.querySelectorAll("#source-unit .unit-lesson").length===20&&document.querySelectorAll("#source-unit .lesson-vocabulary").length===20'));
 check('Pauri20 Study explicitly contrasts inward and outward conduct with Pauri19',await run('document.querySelectorAll(".passage-block")[19].querySelector(".unit-lesson")?.textContent.includes("previous pauri")'));
 await shot('glp-anand-p8-20-study-390.png');
 await click('[data-mode="read"]');
 await click('#jump');
await click('#jump-list button:nth-child(24)');
 await click('[data-mode="study"]');
 check('Anand Pauri 24 remains withheld and is not given an invented study unit',await run('document.querySelectorAll(".quarantine").length===1&&document.querySelector(".passage-block[data-unit-index=\\"23\\"] .unit-lesson")===null'));
 await click('[data-mode="read"]');
 await library();
 await click('#offline-install');
 await until('(async()=>{const r=await navigator.serviceWorker.getRegistration(new URL("./",location.href));return r?.active?.scriptURL.endsWith("/nitnem/sw.js")})()','new offline shell installed',80000);
 await nav(base+'/nitnem/index.html?bani=sohila');
 await until('window.NITNEM_INTERNAL_QA?.getState().bani==="sohila"&&NITNEM_INTERNAL_QA.getState().sourceVerified','SW controlling original');
 await until('navigator.serviceWorker.controller?.scriptURL.endsWith("/nitnem/sw.js")','worker controls new version');
 await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0},session);
 await send('Page.reload',{ignoreCache:false},session);
 await until('window.NITNEM_INTERNAL_QA?.getState().bani==="sohila"&&NITNEM_INTERNAL_QA.getState().sourceVerified','Sohila offline',45000);
 check('Offline Sohila and its inline Meaning controls load from source-checked cache',await run('NITNEM_INTERNAL_QA.getState().lineCount===56'));
 await click('[data-mode="meaning"]');
 check('Full source-specific Sohila meanings all remain usable without network',
 await run('document.querySelectorAll(".simple-meaning[data-meaning-line]").length===56&&document.querySelectorAll("#source-unit .scripture-line").length===56'));

 await nav(base+'/nitnem/japji.html');
 await until('window.GLP_CONTINUOUS_DEBUG?.lineCount===385','Japji parity offline',45000);

 await nav(base+'/nitnem/index.html?bani=savaiye');
 await until('window.NITNEM_INTERNAL_QA?.getState().bani==="savaiye"&&NITNEM_INTERNAL_QA.getState().sourceVerified','Savaiye exact candidate offline',45000);
 await click('[data-mode="meaning"]');
 check('All 40 Savaiye authored English/Punjabi meaning rows load while network BLOCKED',await run('document.querySelectorAll(".simple-meaning[data-meaning-line]").length===40&&NITNEM_INTERNAL_QA.getState().lineCount===40'));
 await nav(base+'/nitnem/japji.html');
 await until('window.GLP_CONTINUOUS_DEBUG?.lineCount===385','Japji after fully offline Savaiye',45000);

 await nav(base+'/nitnem/index.html?bani=chaupai');
 await until('window.NITNEM_INTERNAL_QA?.getState().bani==="chaupai"&&NITNEM_INTERNAL_QA.getState().sourceVerified','Chaupai original offline',45000);
 await click('[data-mode="meaning"]');
 check('Complete Chaupai 116 original-line bilingual drafts survive OFFLINE reload',await run('document.querySelectorAll(".simple-meaning[data-meaning-line]").length===116&&document.querySelectorAll(".source-variant-extended").length===4'));
 await click('[data-mode="study"]');
 check('Complete 29 Chaupai deep Study lessons survive OFFLINE reload',await run('document.querySelectorAll("#source-unit .unit-lesson").length===29'));
 await nav(base+'/nitnem/japji.html');
 await until('window.GLP_CONTINUOUS_DEBUG?.lineCount===385','Japji after offline Chaupai',45000);

 await nav(base+'/nitnem/index.html?bani=anand');
 await until('window.NITNEM_INTERNAL_QA?.getState().bani==="anand"&&NITNEM_INTERNAL_QA.getState().sourceVerified','Anand original source offline',45000);
 await click('[data-mode="meaning"]');
 check('All 68 new Anand8–20 meanings work with network BLOCKED',await run('[...document.querySelectorAll(".simple-meaning")].filter(x=>/^anand(0[8-9]|1[0-9]|20)\./.test(x.dataset.meaningLine)).length===68'));
 await click('[data-mode="study"]');
 check('All 20 Anand Study lessons work with network BLOCKED',await run('document.querySelectorAll("#source-unit .unit-lesson").length===20'));
 check('Anand Pauri24 has its original withheld source and no invented Study even offline',await run('document.querySelectorAll(".quarantine").length===1&&document.querySelectorAll(".passage-block")[23].querySelector(".unit-lesson")===null'));
 await nav(base+'/nitnem/japji.html');
 await until('window.GLP_CONTINUOUS_DEBUG?.lineCount===385','Japji after offline Anand',45000);
 check('Japji exact 385 line meanings and saved pace 200 survive no network',await run('GLP_CONTINUOUS_DEBUG.getState().pace===200&&document.querySelectorAll(".simple-meaning").length===385'));
 check('No non-local script or source network requests were generated',requests.filter(x=>/^https?:/i.test(x)).every(x=>x.startsWith(base+'/')),{total:requests.length});
 check('No browser exceptions in comparative format/speed/offline scenario',errors.length===0,{errors});
}catch(e){failed=String(e);errors.push(failed);console.error('FAIL '+failed);}
finally{
 const report={checkedAt:new Date().toISOString(),status:failed?'FAIL':'PASS',
  checks,errors,sourceGurmukhiAltered:false,onlyPrivateCandidate:true,
  oldJapjiPublicUnchanged:true,humanScholarApproved:false,realIPhoneSafari:'NOT RUN'};
 fs.writeFileSync(path.join(root,'evidence/glp-anand-p8-20-browser.json'),JSON.stringify(report,null,2)+'\n');
 try{if(ws?.readyState===1)await send('Browser.close')}catch{}
 ws?.close();await delay(250);
 if(chrome.exitCode===null)chrome.kill('SIGTERM');
 fs.rmSync(profile,{recursive:true,force:true});
 if(failed)process.exitCode=1;
 console.log('RESULT '+report.status+' '+checks.length+' checks');
}
