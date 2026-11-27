// Chromium acceptance for the complete Salok Bhagat Kabir Ji reader.
// Uses ephemeral localhost, fresh browser contexts and synthetic notes only.
// Run: node tests/salok-kabir-browser.mjs (optional CHROMIUM_PATH).
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const out=path.join(root,'evidence','salok-kabir');
const PREFIX='/gurbani-learning-library/',BANI='salok-kabir';
const PAGE='salok-kabir/index.html?bani='+BANI;
const SOURCE='salok-kabir/data/salok-kabir.json';
const TEACHING='salok-kabir/learning/course.complete.json';
// Frozen selected494-entry digital sequence with one explicit alternate heading.
// This is not qualified or complete printed-edition collation. LF joined; no trailing LF.
const SELECTED_SEQUENCE_SHA256='f8de1c67654bbc6d62e1b6484c41ec31a27f930ea83cff13150a1b5eb4dae415';
const sha=value=>createHash('sha256').update(value).digest('hex');
const compact=value=>String(value).replace(/\s+/gu,' ').trim();
const readJSON=async relative=>JSON.parse(await fs.readFile(path.join(root,relative),'utf8'));
const id=(number,line)=>'sggs.salok-kabir.salok'+String(number).padStart(3,'0')+(line?'.line'+String(line).padStart(2,'0'):'');
const keyFor=(name,edition)=>'glp001.nitnem.PRIVATE-SOURCE-REVIEW.v1.'+name+'.'+edition;
const report={startedAt:new Date().toISOString(),engine:'Chromium',browserVersion:null,
 fixture:'Ephemeral localhost under '+PREFIX+'; nonpersistent browser contexts and synthetic learning only.',
 coverage:{numberedSaloks:243,verseOccurrences:486,headingsAndInvocation:8,sourceOccurrences:494,navigationViewports:[320,390,1280],maxGurmukhiSize:60},
 checks:[],screenshots:[],runtimeErrors:[],limitations:[
  'This is desktop Chromium, including narrow viewport emulation; it is not a physical iPhone, Safari, Home Screen or VoiceOver check.',
  'Offline checks use Chromium network emulation and the actual repository root service worker.',
  'Source agreement and UI checks are not qualified Gurbani, Punjabi, Santhiya or interpretation review.',
  'The source-tamper checks renew the changed occurrence hash but intentionally leave the separately pinned source-pack digest unchanged.',
  'Saved-note navigation is checked by opening the selected line through Reading tools; no direct note preview is claimed.'
 ]};
let pack,course,storageKey,expectedAssets,workerSource,browser,origin,activePage,server;
let exportedBackup;
const contexts=new Set();
const SENTINELS={'glp001.continuous.v2':'SYNTHETIC existing Japji record — untouched',
 'glp001.continuous.retained.v1':'SYNTHETIC retained learning — untouched',
 'glp001.sukhmani.v1':'SYNTHETIC existing Sukhmani record — untouched'};
const NOTE='SYNTHETIC Kabir reflection without a bookmark — keep every character.';
const BOOKMARK_ID=id(20,2),NOTE_ID=id(34,2);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json',
 '.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};

async function screenshot(page,name){
 await page.screenshot({path:path.join(out,name+'.png'),fullPage:false});
 report.screenshots.push('evidence/salok-kabir/'+name+'.png');
}
async function check(name,fn,detail={}){
 try{await fn();report.checks.push({name,status:'passed',...detail});}
 catch(error){report.checks.push({name,status:'failed',error:error.stack||String(error),...detail});
  try{if(activePage&&!activePage.isClosed())await screenshot(activePage,'failure-'+report.checks.length);}catch{}
 }
}
async function newContext({width=390,height=844,serviceWorkers='block',seed={}}={}){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,acceptDownloads:true,serviceWorkers,reducedMotion:'reduce'});
 contexts.add(context);
 await context.addInitScript(values=>{for(const[key,value]of Object.entries(values))if(localStorage.getItem(key)===null)localStorage.setItem(key,value);},{...SENTINELS,...seed});
 return context;
}
async function newPage(context,relative=PAGE){
 const page=await context.newPage();activePage=page;page.setDefaultTimeout(20000);
 page.on('pageerror',error=>report.runtimeErrors.push({url:page.url(),message:error.message}));
 const response=await page.goto(origin+PREFIX+relative);assert.equal(response?.status(),200);return page;
}
async function closeContext(context){await context.close();contexts.delete(context);}
const qa=page=>page.evaluate(()=>window.NITNEM_INTERNAL_QA.getState());
const raw=(page,key=storageKey)=>page.evaluate(key=>localStorage.getItem(key),key);
const saved=async page=>JSON.parse(await raw(page));
const rowSelector=lineId=>'.scripture-line[data-line-id="'+lineId+'"]';
async function ready(page,{teaching=true,count=486}={}){
 await page.waitForFunction(({bani,count})=>window.NITNEM_INTERNAL_QA?.getState().bani===bani&&window.NITNEM_INTERNAL_QA.getState().sourceVerified&&document.querySelectorAll('#source-unit .scripture-line').length===count,{bani:BANI,count});
 assert.equal((await qa(page)).teachingAvailable,teaching);
}
async function mode(page,value){await page.locator('button[data-mode="'+value+'"]').click();await page.waitForFunction(value=>document.body.dataset.mode===value,value);}
async function jump(page,index){
 await page.locator('#jump').click();await page.locator('#jump-list button').nth(index).click();
 await page.waitForFunction(index=>!document.getElementById('jump-dialog').open&&window.NITNEM_INTERNAL_QA.getState().unit===index,index);
}
async function openTools(page,{editable=true}={}){
 await page.locator('#reading-tools').click();await page.waitForFunction(()=>document.getElementById('tools-dialog').open);
 if(editable)await page.waitForFunction(()=>!document.getElementById('note').disabled);
}
async function closeTools(page){await page.locator('#tools-close').click();await page.waitForFunction(()=>!document.getElementById('tools-dialog').open);}
async function selectLine(page,lineId){
 await page.locator(rowSelector(lineId)+' > .tuk').click();
 await page.waitForFunction(lineId=>document.querySelector('.scripture-line[aria-current="location"]')?.dataset.lineId===lineId,lineId);
}
async function waitSavedLine(page,lineId){await page.waitForFunction(({key,lineId})=>JSON.parse(localStorage.getItem(key)||'{}').payload?.lineId===lineId,{key:storageKey,lineId});}
async function waitSavedNote(page,lineId,text){await page.waitForFunction(({key,lineId,text})=>JSON.parse(localStorage.getItem(key)||'{}').payload?.notes?.[lineId]===text,{key:storageKey,lineId,text});}
async function unchangedOthers(page){for(const[key,value]of Object.entries(SENTINELS))assert.equal(await raw(page,key),value,'Other-reader learning changed: '+key);}
async function importBackup(page,value){
 await page.locator('#save-status').evaluate(node=>{node.textContent='';});
 await page.locator('#import-learning').setInputFiles({name:'synthetic-m9-backup.json',mimeType:'application/json',buffer:Buffer.from(typeof value==='string'?value:JSON.stringify(value))});
}
async function downloadBackup(page){const pending=page.waitForEvent('download');await page.locator('#export-learning').click();return fs.readFile(await(await pending).path(),'utf8');}
function sourceOrder(){
 const all=[];
 for(const[index,unit]of pack.units.entries()){
  if(index===0)for(const preface of pack.preface||[])all.push({kind:'preface',text:preface.text});
  const addLine=lineId=>{const line=unit.lines.find(row=>row.id===lineId);all.push({kind:'line',id:line.id,text:line.text});};
  const addHeading=index=>all.push({kind:'heading',text:unit.metricalHeadings[index].text});
  if(unit.sourceDisplayOrder)for(const entry of unit.sourceDisplayOrder)entry.kind==='line'?addLine(entry.id):addHeading(entry.index);
  else{for(let i=0;i<(unit.metricalHeadings||[]).length;i++)addHeading(i);for(const line of unit.lines)addLine(line.id);}
 }
 return all;
}
const domSource=page=>page.locator('#source-unit > .passage-block').evaluateAll(blocks=>blocks.flatMap(block=>[...block.children].flatMap(node=>
 node.classList.contains('original-preface')?[{kind:'preface',text:node.textContent}]:node.classList.contains('meter-heading')?[{kind:'heading',text:node.textContent}]:
 node.classList.contains('scripture-line')?[{kind:'line',id:node.dataset.lineId,text:node.querySelector('.tuk').textContent}]:[])));
async function assertSource(page){
 const actual=await domSource(page);assert.deepEqual(actual,sourceOrder());
 assert.equal(sha(actual.map(row=>row.text).join('\n')),SELECTED_SEQUENCE_SHA256);
 assert.deepEqual(await page.locator('#source-unit .scripture-line').evaluateAll(rows=>rows.map(row=>({id:row.dataset.lineId,sha256:row.dataset.sourceSha256}))),pack.units.flatMap(unit=>unit.lines.map(line=>({id:line.id,sha256:line.sha256}))));
 assert.equal(await page.locator('.quarantine').count(),0);
}
async function assertMeanings(page){
 const actual=await page.locator('#source-unit .scripture-line').evaluateAll(rows=>rows.map(row=>({id:row.dataset.lineId,en:row.querySelector('.simple-meaning .english')?.textContent,pa:row.querySelector('.simple-meaning .punjabi')?.textContent,enLang:row.querySelector('.simple-meaning .english')?.lang,paLang:row.querySelector('.simple-meaning .punjabi')?.lang})));
 const expected=pack.units.flatMap(unit=>unit.lines.map(line=>{const entry=course.closeTextNotes[BANI+'|'+line.id];return{id:line.id,en:entry.simpleEn,pa:entry.simplePa,enLang:'en',paLang:'pa'};}));
 assert.equal(actual.length,486);assert.deepEqual(actual,expected);
 for(const row of actual){assert.ok(row.en?.trim(),'Empty English meaning '+row.id);assert.ok(row.pa?.trim(),'Empty Punjabi meaning '+row.id);}
}
async function assertStudies(page){
 const rendered=await page.locator('#source-unit .unit-lesson').evaluateAll(nodes=>Object.fromEntries(nodes.map(node=>[node.dataset.lessonUnit,node.textContent])));
 assert.equal(Object.keys(rendered).length,243);
 for(const unit of pack.units){
  const lesson=course.unitLessons[BANI+'|'+unit.id],text=rendered[unit.id];assert.ok(text,unit.id+' study missing');
  for(const value of [lesson.simple.en,lesson.simple.pa,...Object.values(lesson.study).filter(value=>typeof value==='string')])if(value)assert.ok(text.includes(value),'Missing study field in '+unit.id+': '+value.slice(0,60));
  for(const word of lesson.study.words||[])for(const value of [word.gurmukhi,word.workingGloss,word.workingGlossPa].filter(Boolean))assert.ok(text.includes(value),'Missing vocabulary in '+unit.id);
 }
}
async function assertLayout(page,label){
 const data=await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth,
  overflow:[...document.querySelectorAll('#dock,.appearance-header,.tuk,.meter-heading,.original-preface,.simple-meaning,.unit-lesson')].filter(n=>n.getClientRects().length).map(n=>({kind:n.className,left:n.getBoundingClientRect().left,right:n.getBoundingClientRect().right})).filter(r=>r.left< -1||r.right>innerWidth+1).slice(0,8)}));
 assert.ok(data.document<=data.width+1&&data.body<=data.width+1,label+' page overflow '+JSON.stringify(data));assert.deepEqual(data.overflow,[],label+' content overflow');
}
async function setSize60(page){await openTools(page);await page.locator('#size').evaluate(node=>{node.value='60';node.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await page.locator('#size-value').textContent(),'60px');await closeTools(page);assert.equal(await page.locator('#source-unit .tuk').first().evaluate(node=>getComputedStyle(node).fontSize),'60px');}
async function nativeMeaningNames(page){
 const cdp=await page.context().newCDPSession(page);
 try{
  const {root:document}=await cdp.send('DOM.getDocument');
  const {nodeIds}=await cdp.send('DOM.querySelectorAll',{nodeId:document.nodeId,selector:'#source-unit button[data-meaning-line]'});
  const descriptions=await Promise.all(nodeIds.map(nodeId=>cdp.send('DOM.describeNode',{nodeId})));
  const {nodes}=await cdp.send('Accessibility.getFullAXTree');const byBackend=new Map(nodes.map(node=>[node.backendDOMNodeId,node]));
  assert.equal(descriptions.length,486);
  for(const[{node},line]of descriptions.map((entry,index)=>[entry,pack.units.flatMap(unit=>unit.lines)[index]])){
   const ax=byBackend.get(node.backendNodeId),meaning=course.closeTextNotes[BANI+'|'+line.id];
   assert.equal(ax?.ignored,false,line.id+' ignored by native accessibility tree');assert.equal(ax.role?.value,'button');
   const name=compact(ax.name?.value);assert.ok(name.includes(compact(meaning.simpleEn)),line.id+' English absent from native accessible name');assert.ok(name.includes(compact(meaning.simplePa)),line.id+' Punjabi absent from native accessible name');
  }
 }finally{await cdp.detach();}
}

try{
 await fs.mkdir(out,{recursive:true});
 report.inputSha256={};
 for(const file of [SOURCE,TEACHING,'salok-kabir/data/library.json','salok-kabir/index.html','nitnem/reader.js','nitnem/reader.css','nitnem/learning/learning-ui.js','sw.js','tests/salok-kabir-browser.mjs'])report.inputSha256[file]=sha(await fs.readFile(path.join(root,file)));
 [pack,course]=await Promise.all([readJSON(SOURCE),readJSON(TEACHING)]);storageKey=keyFor(BANI,pack.editionId);
 const existing=await readJSON('nitnem/data/library.json'),m9=await readJSON('salok-mahalla9/data/library.json');
 SENTINELS[keyFor('salok-mahalla9',m9.entries['salok-mahalla9'].editionId)]='SYNTHETIC existing Mahalla9 record — untouched';
 for(const[name,entry]of Object.entries(existing.entries))SENTINELS[keyFor(name,entry.editionId)]='SYNTHETIC existing '+name+' record — untouched';
 workerSource=await fs.readFile(path.join(root,'sw.js'),'utf8');
 const expectedMatch=workerSource.match(/const EXPECTED\s*=\s*(\{[^\n]+\});/);assert.ok(expectedMatch,'Root service worker must expose its expected asset manifest');expectedAssets=JSON.parse(expectedMatch[1]);
 server=http.createServer(async(req,res)=>{try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
  if(!pathname.startsWith(PREFIX)){res.writeHead(404);res.end('Not found');return;}
  let relative=pathname.slice(PREFIX.length)||'index.html';if(relative.endsWith('/'))relative+='index.html';
  const filename=path.resolve(root,relative);if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const bytes=await fs.readFile(filename);res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);
 }catch{res.writeHead(404);res.end('Not found');}});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});report.browserVersion=browser.version();

 await check('The reader bundle contains all 243 Saloks and the selected and documented 494-occurrence sequence',()=>{
  assert.equal(pack.compositionId,BANI);assert.equal(pack.unitCount,243);assert.equal(pack.originalLineCount,486);assert.equal(pack.units.length,243);assert.equal(pack.preface.length,2);
  assert.equal(pack.units.reduce((n,u)=>n+(u.metricalHeadings||[]).length,0),6);
  assert.deepEqual(pack.units.map(unit=>unit.id),Array.from({length:243},(_,i)=>id(i+1)));
  for(const[number,unit]of pack.units.entries()){assert.equal(unit.lines.length,2);assert.deepEqual(unit.lines.map(line=>line.id),[id(number+1,1),id(number+1,2)]);}
  assert.equal(sourceOrder().length,494);assert.equal(sha(sourceOrder().map(row=>row.text).join('\n')),SELECTED_SEQUENCE_SHA256);
 });
 const primaryContext=await newContext(),page=await newPage(primaryContext);await ready(page);
 await check('The Salok Bhagat Kabir Ji address opens its complete reader with explicit pending-review status',async()=>{
  const state=await qa(page);assert.equal(state.bani,BANI);assert.equal(state.unitCount,243);assert.equal(state.lineCount,486);assert.equal(state.sourceApproved,false);assert.equal(state.translationApproved,false);assert.equal(state.editorReviewedLessons,0);assert.equal(state.releaseAuthorized,false);
  assert.match(await page.locator('#bani-title-en').textContent(),/Salok/i);assert.match(await page.locator('#bani-variant').textContent(),/1364.*1377/);await screenshot(page,'reader-390');
 });
 await check('Every source occurrence and occurrence digest renders in selected source order',()=>assertSource(page));
 await check('Meaning mode displays all 486 English/Punjabi pairs and 243 summaries',async()=>{await mode(page,'meaning');await assertSource(page);await assertMeanings(page);assert.equal(await page.locator('#source-unit .passage-summary').count(),243);});
 await check('All 486 meaning controls expose their actual bilingual text in Chromium accessibility names',()=>nativeMeaningNames(page));
 await check('Study mode renders every authored field in all 243 studies without changing Gurbani',async()=>{await mode(page,'study');await assertSource(page);await assertMeanings(page);await assertStudies(page);});
 await check('Every Study clearly identifies its unreviewed educational status and source references',async()=>{
  assert.equal(await page.locator('#source-unit .unit-lesson > .draft-label').count(),243);
  for(const label of await page.locator('#source-unit .unit-lesson > .draft-label').allTextContents())assert.match(label,/DRAFT.*REVIEW PENDING/i);
  assert.equal(await page.locator('#source-unit .unit-lesson .lesson-sources').count(),243);
  for(const text of await page.locator('#source-unit .unit-lesson .lesson-sources').allTextContents())assert.match(text,/Qualified human review is pending/);
 });
 await check('All ten digital Ang transitions stay intact in one-passage reading',async()=>{
  await page.locator('#view-passage').click();
  for(const index of [9,28,66,103,140,158,176,194,212,230]){await jump(page,index);assert.deepEqual(await page.locator('#source-unit .tuk').allTextContents(),pack.units[index].lines.map(l=>l.text));assert.equal(await page.locator('#source-unit .unit-lesson').count(),1);}
  await page.locator('#view-continuous').click();
 });
 await check('All six exact Guru headings render before their verses with separately labelled context',async()=>{
  for(const index of [208,209,210,213,219,220]){
   const block=page.locator('#source-unit .passage-block[data-unit-index="'+index+'"]');
   const order=await block.evaluate(n=>[...n.children].filter(x=>x.classList.contains('meter-heading')||x.classList.contains('scripture-line')).map(x=>x.classList.contains('meter-heading')?x.textContent:x.querySelector('.tuk').textContent));
   assert.deepEqual(order,[pack.units[index].metricalHeadings[0].text,...pack.units[index].lines.map(l=>l.text)]);
   assert.match(await block.locator('.source-attribution').textContent(),index===219?/Guru Amar Das Ji/:/Guru Arjan Dev Ji/);
  }
  assert.equal((await domSource(page)).filter(r=>r.kind==='heading').length,6);assert.equal(await page.locator('#source-unit .heading-note').count(),8);
  for(const index of [211,212,240,241])assert.match(await page.locator('.passage-block[data-unit-index="'+index+'"] .source-attribution').textContent(),/Named voices/);
  assert.equal(await page.locator('#source-unit .source-attribution').count(),10);
 });
 await check('Digital locator and printed-page observation remain distinct in Study',async()=>{
  await jump(page,230);await page.locator('#view-passage').click();const text=await page.locator('.source-study').textContent();assert.match(text,/digital-source Ang 1376/);assert.match(text,/Printed-page spot checkAng 1376–1377/);await page.locator('#view-continuous').click();
 });
 await check('The last Salok retains243 and ends before Farid; passage boundary controls work',async()=>{
  await jump(page,242);assert.equal(await page.locator('#reading-end').isVisible(),true);await page.locator('#view-passage').click();
  assert.equal(await page.locator('#source-unit .tuk').last().textContent(),'ਬੈਰਾਗੀ ਬੰਧਨੁ ਕਰੈ ਤਾ ਕੋ ਬਡੋ ਅਭਾਗੁ ॥੨੪੩॥');assert.equal(await page.locator('#next-unit').isDisabled(),true);
  assert.equal((await page.locator('#source-unit').textContent()).includes('ਸਲੋਕ ਸੇਖ ਫਰੀਦ ਕੇ'),false);
  await page.locator('#prev-unit').click();assert.equal((await qa(page)).unit,241);await page.locator('#next-unit').click();assert.equal((await qa(page)).unit,242);
  await jump(page,0);assert.equal(await page.locator('#prev-unit').isDisabled(),true);await page.locator('#view-continuous').click();
 });
 await check('A fresh direct link opens Salok 29 without dropping either source line',async()=>{
  const ctx=await newContext(),p=await newPage(ctx,PAGE+'&unit=29');await ready(p);assert.equal((await qa(p)).unit,28);assert.equal(await p.locator('.scripture-line[aria-current="location"]').getAttribute('data-line-id'),id(29,1));await assertSource(p);await closeContext(ctx);activePage=page;
 });
 await check('Invalid passage numbers leave a fresh reader at a valid first Salok',async()=>{
  for(const value of ['0','244','not-a-number']){const ctx=await newContext(),p=await newPage(ctx,PAGE+'&unit='+value);await ready(p);assert.equal((await qa(p)).unit,0);assert.equal((await qa(p)).lineCount,486);await closeContext(ctx);}activePage=page;
 });
 await unchangedOthers(page);await closeContext(primaryContext);

 for(const width of [320,390,1280]){
  const ctx=await newContext({width,height:width===1280?900:844}),p=await newPage(ctx);await ready(p);
  await check('All 243 Jump destinations select their exact first line at '+width+'px',async()=>{
   await p.locator('#jump').click();assert.equal(await p.locator('#jump-list button').count(),243);assert.deepEqual(await p.locator('#jump-list button').allTextContents(),pack.units.map((unit,i)=>(i+1)+'. '+unit.title));await p.locator('#jump-close').click();
   for(let i=0;i<243;i++){
    await jump(p,i);assert.equal(await p.locator('.scripture-line[aria-current="location"]').getAttribute('data-line-id'),id(i+1,1));
    const visible=await p.locator(rowSelector(id(i+1,1))+' > .tuk').evaluate(node=>{const r=node.getBoundingClientRect();return r.width>0&&r.bottom>0&&r.top<innerHeight;});assert.equal(visible,true,'Jump target outside viewport: '+(i+1));
   }
   await screenshot(p,'salok243-'+width);await unchangedOthers(p);
  },{width,destinations:243});
  await check('60px Read, Meaning and Study fit with stable Dark/Light switching at '+width+'px',async()=>{
   await setSize60(p);await jump(p,28);
   for(const depth of ['read','meaning','study']){await mode(p,depth);await assertLayout(p,depth+' '+width);assert.equal((await qa(p)).unit,28);}
   const before=await p.evaluate(()=>{window.__kabirAnchor=document.querySelector('.scripture-line[aria-current="location"]');return{id:window.__kabirAnchor.dataset.lineId,y:scrollY,top:window.__kabirAnchor.getBoundingClientRect().top};});
   for(const theme of ['amrit','day']){
    await p.locator('button[data-appearance="'+theme+'"]').click();
    const after=await p.evaluate(()=>({theme:document.body.dataset.theme,id:document.querySelector('.scripture-line[aria-current="location"]')?.dataset.lineId,same:window.__kabirAnchor===document.querySelector('.scripture-line[aria-current="location"]'),y:scrollY,top:window.__kabirAnchor.getBoundingClientRect().top}));
    assert.equal(after.theme,theme);assert.equal(after.id,before.id);assert.equal(after.same,true);assert.ok(Math.abs(after.y-before.y)<3&&Math.abs(after.top-before.top)<3,'Theme moved the reading anchor');await assertLayout(p,theme+' '+width);
   }
   await screenshot(p,'study-60px-'+width);await unchangedOthers(p);
  },{width,size:60,modes:['read','meaning','study']});await closeContext(ctx);
 }

 const modalContext=await newContext({width:320}),modal=await newPage(modalContext);await ready(modal);
 await check('A long meaning dialog scrolls at 320px while its close control stays reachable',async()=>{
  await mode(modal,'meaning');await jump(modal,52);await modal.locator('button[data-meaning-line="'+id(53,2)+'"]').click();
  await modal.waitForFunction(()=>document.getElementById('meaning-dialog').open);assert.equal(await modal.evaluate(()=>document.activeElement.id),'meaning-dialog-title');
  assert.equal(await modal.locator('#meaning-dialog .excerpt').textContent(),pack.units[52].lines[1].text);
  const text=await modal.locator('#meaning-dialog-body').textContent();assert.ok(text.includes(course.unitLessons[BANI+'|'+id(53)].study.closeReading));
  const geometry=await modal.locator('#meaning-dialog').evaluate(node=>{const r=node.getBoundingClientRect();node.scrollTop=node.scrollHeight;return{left:r.left,right:r.right,width:innerWidth,scrollable:node.scrollHeight>node.clientHeight};});assert.ok(geometry.left>=0&&geometry.right<=geometry.width+1);assert.equal(geometry.scrollable,true);
  await screenshot(modal,'meaning-dialog-320');await modal.locator('#meaning-close').click();assert.equal(await modal.evaluate(()=>document.activeElement.dataset.meaningLine),id(53,2));
 });
 await check('Escape returns focus to the same meaning; keyboard Jump reaches Salok 243',async()=>{
  await modal.locator('button[data-meaning-line="'+id(53,2)+'"]').click();await modal.keyboard.press('Escape');await modal.waitForFunction(()=>!document.getElementById('meaning-dialog').open);assert.equal(await modal.evaluate(()=>document.activeElement.dataset.meaningLine),id(53,2));
  await modal.locator('#jump').focus();await modal.keyboard.press('Enter');await modal.locator('#jump-list button').last().focus();await modal.keyboard.press('Enter');await modal.waitForFunction(()=>!document.getElementById('jump-dialog').open&&window.NITNEM_INTERNAL_QA.getState().unit===242);assert.equal(await modal.locator('.scripture-line[aria-current="location"]').getAttribute('data-line-id'),id(243,1));
 });await unchangedOthers(modal);await closeContext(modalContext);

 const learningContext=await newContext(),learning=await newPage(learningContext);await ready(learning);
 await check('A bookmarked second line stays exact through three consecutive reloads',async()=>{
  await jump(learning,19);await selectLine(learning,BOOKMARK_ID);await openTools(learning);await learning.locator('#bookmark').click();await closeTools(learning);await waitSavedLine(learning,BOOKMARK_ID);
  for(let n=0;n<3;n++){await learning.reload();await ready(learning);assert.equal(await learning.locator('.scripture-line[aria-current="location"]').getAttribute('data-line-id'),BOOKMARK_ID);assert.equal((await saved(learning)).payload.lineId,BOOKMARK_ID);assert.ok((await saved(learning)).payload.bookmarks.includes(BOOKMARK_ID));}
 });
 await check('A reflection without a bookmark is listed and its actual text can be reopened',async()=>{
  await jump(learning,33);await selectLine(learning,NOTE_ID);await openTools(learning);await learning.locator('#note').fill(NOTE);await learning.locator('#save-note').click();await waitSavedNote(learning,NOTE_ID,NOTE);assert.equal((await saved(learning)).payload.bookmarks.includes(NOTE_ID),false);await closeTools(learning);
  await jump(learning,0);await openTools(learning);await learning.locator('#saved-lines').evaluate(node=>{node.open=true;});assert.equal(await learning.locator('button[data-saved-line="'+NOTE_ID+'"]').count(),1);
  await learning.locator('button[data-saved-line="'+NOTE_ID+'"]').click();await learning.waitForFunction(()=>!document.getElementById('tools-dialog').open);assert.equal(await learning.locator('.scripture-line[aria-current="location"]').getAttribute('data-line-id'),NOTE_ID);
  await openTools(learning);assert.equal(await learning.locator('#note').inputValue(),NOTE);await screenshot(learning,'saved-reflection-390');await closeTools(learning);
 });
 await check('Export includes the unbookmarked reflection and current learning',async()=>{
  await openTools(learning);exportedBackup=JSON.parse(await downloadBackup(learning));assert.equal(exportedBackup.project,'GLP-001-NITNEM');assert.equal(exportedBackup.compositionId,BANI);assert.equal(exportedBackup.editionId,pack.editionId);assert.equal(exportedBackup.state.notes[NOTE_ID],NOTE);assert.equal(exportedBackup.state.bookmarks.includes(NOTE_ID),false);assert.ok(exportedBackup.state.bookmarks.includes(BOOKMARK_ID));await closeTools(learning);
 });
 await check('Every existing reader and retained-learning sentinel survives navigation and edits',()=>unchangedOthers(learning));
 const importContext=await newContext(),importPage=await newPage(importContext);await ready(importPage);await openTools(importPage);
 await check('A real exported file restores notes and bookmarks into a fresh context',async()=>{
  assert.ok(exportedBackup,'Export fixture must have succeeded');await importBackup(importPage,exportedBackup);await importPage.waitForFunction(()=>document.getElementById('save-status').textContent.startsWith('Bookmarks and reflections merged.'));
  const restored=(await saved(importPage)).payload;assert.equal(restored.notes[NOTE_ID],NOTE);assert.ok(restored.bookmarks.includes(BOOKMARK_ID));assert.equal(restored.bookmarks.includes(NOTE_ID),false);assert.equal(restored.lineId,id(1,1),'Import must preserve this reader’s current reading place');
 });
 await check('Reimport is idempotent and conflicting reflections are retained once',async()=>{
  const base=structuredClone(exportedBackup);base.state.notes[NOTE_ID]='SYNTHETIC different imported reflection';
  for(let n=0;n<2;n++){const rev=(await saved(importPage)).rev;await importBackup(importPage,base);await importPage.waitForFunction(({key,rev})=>JSON.parse(localStorage.getItem(key)).rev>rev,{key:storageKey,rev});}
  const text=(await saved(importPage)).payload.notes[NOTE_ID];assert.equal(text,NOTE+'\n\n— Imported reflection —\nSYNTHETIC different imported reflection');assert.deepEqual((await saved(importPage)).payload.bookmarks,[BOOKMARK_ID]);
 });
 await check('Another bani’s backup is refused without changing either reader’s bytes',async()=>{
  for(const [name,edition]of [['sohila',existing.entries.sohila.editionId],['salok-mahalla9',m9.entries['salok-mahalla9'].editionId]]){const wrong={...structuredClone(exportedBackup),compositionId:name,editionId:edition};const before=await raw(importPage);await importBackup(importPage,wrong);await importPage.waitForFunction(()=>document.getElementById('save-status').textContent.startsWith('Import refused:'));assert.equal(await raw(importPage),before);await unchangedOthers(importPage);}
 });
 await check('Malformed, unknown-edition and out-of-collection backups are rejected atomically',async()=>{
  const foreign=structuredClone(exportedBackup);foreign.state.notes['sggs.kabir.salok007.line01']='SYNTHETIC wrong collection';
  for(const value of ['{invalid', {...structuredClone(exportedBackup),editionId:'unknown-kabir-edition'},foreign]){const before=await raw(importPage);await importBackup(importPage,value);await importPage.waitForFunction(()=>document.getElementById('save-status').textContent.startsWith('Import refused:'));assert.equal(await raw(importPage),before);}
 });await closeTools(importPage);await unchangedOthers(importPage);await closeContext(importContext);await closeContext(learningContext);

 const capacityContext=await newContext(),capacityPage=await newPage(capacityContext);await ready(capacityPage);
 await check('A real Punjabi backup above 2.5MB survives file upload and re-export below the origin storage quota',async()=>{
  const largeBackup=await capacityPage.evaluate(async pack=>{
   const map=new Map(),storage={getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};
   const manager=window.GLP_NITNEM_STORAGE.create(pack,{storage,locks:{request:async(_name,fn)=>fn()}});
   const ids=pack.units.flatMap(unit=>unit.lines.map(line=>line.id));
   const notes=Object.fromEntries(ids.slice(0,150).map((id,i)=>[id,
    i===0?'"\\\u0000\n'.repeat(1500):i===1?'\ud800'.repeat(6000):'ਨ'.repeat(6000)]));
   await manager.save(ids[0],{notes});return manager.exportText();
  },pack);
  assert.ok(largeBackup.length<2500000);assert.ok(Buffer.byteLength(largeBackup,'utf8')>2500000);
  await openTools(capacityPage);await importBackup(capacityPage,largeBackup);
  await capacityPage.waitForFunction(()=>document.getElementById('save-status').textContent.startsWith('Bookmarks and reflections merged.'));
  const expected=JSON.parse(largeBackup).state.notes,actual=(await saved(capacityPage)).payload.notes;
  assert.equal(Object.keys(actual).length,150);assert.deepEqual(actual,expected);
  const again=JSON.parse(await downloadBackup(capacityPage));assert.deepEqual(again.state.notes,expected);
  await closeTools(capacityPage);await unchangedOthers(capacityPage);
 });await closeContext(capacityContext);

 const brokenRaw='{SYNTHETIC damaged Kabir learning';
 const recoveryContext=await newContext({seed:{[storageKey]:brokenRaw}}),recovery=await newPage(recoveryContext);await ready(recovery);
 await check('Damaged saved learning preserves its original bytes and remains exportable',async()=>{
  assert.equal((await qa(recovery)).savingBlocked,true);await assertSource(recovery);await mode(recovery,'meaning');await openTools(recovery,{editable:false});assert.equal(await recovery.locator('#save-note').isDisabled(),true);assert.equal(await recovery.locator('#import-learning').isDisabled(),true);assert.equal(await downloadBackup(recovery),brokenRaw);assert.equal(await raw(recovery),brokenRaw);await unchangedOthers(recovery);
 });await closeContext(recoveryContext);

 for(const mutation of ['verse-with-renewed-hash','mahalla-heading-with-renewed-hash']){
  const ctx=await newContext();const changed=structuredClone(pack);
  if(mutation.startsWith('verse')){changed.units[28].lines[1].text+=' ਅ';changed.units[28].lines[1].sha256=sha(changed.units[28].lines[1].text);}
  else{changed.units[208].metricalHeadings[0].text+=' ਅ';changed.units[208].metricalHeadings[0].sha256=sha(changed.units[208].metricalHeadings[0].text);}
  await ctx.route('**/'+SOURCE,route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(changed)}));const p=await newPage(ctx);
  await check('Changed source is blocked even after its local hash is renewed: '+mutation,async()=>{
   await p.waitForFunction(()=>document.getElementById('collection-status').textContent.includes('could not load'));assert.equal((await qa(p)).sourceVerified,false);assert.equal(await p.locator('#source-unit .scripture-line').count(),0);assert.match(await p.locator('#collection-status').textContent(),/SHA-256|verification|integrity/i);await unchangedOthers(p);
  });await closeContext(ctx);
 }
 for(const mutation of ['changed-teaching','missing-teaching']){
  const ctx=await newContext();const altered=structuredClone(course);altered.closeTextNotes[BANI+'|'+id(1,1)].simpleEn='SYNTHETIC altered teaching must not render';
  await ctx.route('**/'+TEACHING,route=>route.fulfill(mutation==='missing-teaching'?{status:404,body:'Not found'}:{status:200,contentType:'application/json',body:JSON.stringify(altered)}));const p=await newPage(ctx);await ready(p,{teaching:false});
  await check('Gurbani remains fully readable when teaching is unavailable: '+mutation,async()=>{
   await assertSource(p);await mode(p,'meaning');assert.equal(await p.locator('#source-unit button[data-meaning-line]').count(),0);assert.equal((await p.locator('#source-unit').textContent()).includes('SYNTHETIC altered teaching'),false);assert.match(await p.locator('#learning-overview').textContent(),/could not load|still read/i);await jump(p,242);assert.equal((await qa(p)).unit,242);await unchangedOthers(p);
  });await closeContext(ctx);
 }

 const offlineContext=await newContext({serviceWorkers:'allow'}),offline=await newPage(offlineContext);await ready(offline);
 await check('The actual root worker verifies and caches all declared assets, including the new reader',async()=>{
  await offline.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:60000});
  const version=JSON.parse(workerSource.match(/const VERSION=("[^"]+");/)[1]);
  const required=[SOURCE,TEACHING,'salok-kabir/','salok-kabir/index.html','salok-kabir/data/library.json',
   'nitnem/reader.js','nitnem/continuous-core.js','nitnem/appearance.js','nitnem/local-learning.js',
   'nitnem/learning/learning-ui.js','nitnem/offline.js','library/app.bundle.mjs','articles/app.bundle.mjs','knowledge/app.bundle.mjs'];
  for(const asset of required)assert.ok(Object.hasOwn(expectedAssets,'./'+asset),'Required source or executable in offline manifest: '+asset);
  const expected=Object.entries(expectedAssets).map(([asset,digest])=>{
   assert.ok(asset.startsWith('./'));const url=new URL(asset,origin+PREFIX+'sw.js');
   assert.equal(url.origin,origin);assert.ok(url.pathname.startsWith(PREFIX));assert.equal(url.search,'');assert.equal(url.hash,'');assert.match(digest,/^[a-f0-9]{64}$/);
   url.searchParams.set('glp_release',version);return{url:url.href,sha256:digest};
  }).sort((a,b)=>a.url.localeCompare(b.url));
  assert.equal(new Set(expected.map(entry=>entry.url)).size,expected.length,'Every declared release URL is unique');
  const actual=await offline.evaluate(async()=>{
   const prefix='glp-static:'+location.origin+'/gurbani-learning-library/:';
   const names=(await caches.keys()).filter(name=>name.startsWith(prefix));
   const assets=await Promise.all(names.map(async name=>{
    const cache=await caches.open(name),entries=[];
    for(const request of await cache.keys()){
     const response=await cache.match(request);if(!response?.ok)throw Error('Missing or unsuccessful cached response');
     const hash=await crypto.subtle.digest('SHA-256',await response.arrayBuffer());
     entries.push({url:request.url,sha256:Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('')});
    }
    return entries.sort((a,b)=>a.url.localeCompare(b.url));
   }));
   return{names,scope:new URL((await navigator.serviceWorker.getRegistration()).scope).pathname,assets};
  });
  assert.equal(actual.scope,PREFIX);
  assert.deepEqual(actual.names,['glp-static:'+origin+PREFIX+':'+version]);
  assert.deepEqual(actual.assets[0].map(entry=>entry.url),expected.map(entry=>entry.url),'The cache has exactly the declared versioned URLs');
  assert.deepEqual(actual.assets[0],expected,'Every cached response has its independently declared digest');
  for(const relative of required)assert.ok(actual.assets[0].some(entry=>new URL(entry.url).pathname===PREFIX+relative),'Missing offline asset '+relative);
  report.coverage.verifiedOfflineAssetCount=expected.length;
 });
 await jump(offline,33);await selectLine(offline,NOTE_ID);await openTools(offline);await offline.locator('#note').fill(NOTE);await offline.locator('#save-note').click();await waitSavedNote(offline,NOTE_ID,NOTE);await closeTools(offline);await offlineContext.setOffline(true);
 await check('Offline reload retains all 494 source occurrences, 486 meanings and 243 studies',async()=>{
  await offline.reload();await ready(offline);await assertSource(offline);await mode(offline,'meaning');await assertMeanings(offline);await mode(offline,'study');await assertStudies(offline);assert.equal((await saved(offline)).payload.notes[NOTE_ID],NOTE);await screenshot(offline,'study-offline-390');
 });
 await check('Offline passage navigation and a fresh deep link work through the real cache',async()=>{
  for(const index of [0,28,52,242]){await jump(offline,index);assert.equal((await qa(offline)).unit,index);}
  await offline.locator('#view-passage').click();assert.deepEqual(await offline.locator('#source-unit .tuk').allTextContents(),pack.units[242].lines.map(line=>line.text));await offline.locator('#view-continuous').click();
  const p=await newPage(offlineContext,PAGE+'&unit=29');await ready(p);assert.equal((await qa(p)).unit,28);await assertSource(p);await p.close();activePage=offline;
 });
 await check('Offline reflection export works and private notes never enter static caches',async()=>{
  await jump(offline,33);await selectLine(offline,NOTE_ID);await openTools(offline);assert.equal(await offline.locator('#note').inputValue(),NOTE);const backup=JSON.parse(await downloadBackup(offline));assert.equal(backup.state.notes[NOTE_ID],NOTE);await closeTools(offline);
  const leaked=await offline.evaluate(async marker=>{for(const name of await caches.keys()){const cache=await caches.open(name);for(const request of await cache.keys()){const response=await cache.match(request);if((await response.text()).includes(marker))return{cache:name,url:request.url};}}return null;},NOTE);assert.equal(leaked,null);await unchangedOthers(offline);
 });await closeContext(offlineContext);
 await check('There are no uncaught browser runtime errors',()=>assert.deepEqual(report.runtimeErrors,[]));
}catch(error){report.checks.push({name:'Browser harness completion',status:'failed',error:error.stack||String(error)});try{if(activePage&&!activePage.isClosed())await screenshot(activePage,'harness-failure');}catch{}}
finally{
 for(const context of contexts)try{await context.close();}catch{}
 await browser?.close();if(server?.listening)await new Promise(resolve=>server.close(resolve));
 report.completedAt=new Date().toISOString();report.passed=report.checks.filter(check=>check.status==='passed').length;report.failed=report.checks.filter(check=>check.status==='failed').length;report.status=report.failed?'failed':'passed';
 await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:report.status,passed:report.passed,failed:report.failed,browser:report.browserVersion,failures:report.checks.filter(check=>check.status==='failed')},null,2));process.exitCode=report.failed?1:0;
}
