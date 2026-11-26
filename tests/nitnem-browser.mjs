// Real Chromium acceptance, isolated contexts, synthetic learning only.
// Run after installing Playwright's Chromium: node tests/nitnem-browser.mjs
// CHROMIUM_PATH is optional; leave unset for Playwright's downloaded browser in CI.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const evidence=path.join(root,'evidence'),shots=path.join(evidence,'screenshots','nitnem');
const PREFIX='/gurbani-learning-library/',NAMES=['jaap','savaiye','chaupai','anand','rehras','sohila'];
const SENTINELS={'glp001.continuous.v2':'SYNTHETIC JAPJI — unchanged','glp001.sukhmani.v1':'SYNTHETIC SUKHMANI — unchanged'};
const readJSON=async file=>JSON.parse(await fs.readFile(path.join(root,file),'utf8'));
const packs=Object.fromEntries(await Promise.all(NAMES.map(async name=>[name,await readJSON('nitnem/data/'+name+'.json')])));
const course=await readJSON('nitnem/learning/course.complete.json');
const workerSource=await fs.readFile(path.join(root,'sw.js'),'utf8');
const expectedAssets=JSON.parse(workerSource.match(/const EXPECTED=(\{[^\n]+\});/)[1]);
const workerVersion=JSON.parse(workerSource.match(/const VERSION=("[^"]+");/)[1]);
const loadGlobal=async(file,name)=>{const context={window:{}};vm.runInNewContext(await fs.readFile(path.join(root,file),'utf8'),context,{timeout:5000});return JSON.parse(JSON.stringify(context.window[name]));};
const japji=await loadGlobal('js/japji-full-data.js','GLP_FULL_JAPJI');
const sukhmani=await loadGlobal('js/sukhmani-data.js','GLP_SUKHMANI');
const report={startedAt:new Date().toISOString(),engine:'chromium',browserVersion:null,
 fixture:'Ephemeral trusted localhost under /gurbani-learning-library/; fresh nonpersistent browser contexts and synthetic learning only',
 coverage:{sourceOccurrences:Object.values(packs).reduce((n,p)=>n+p.originalLineCount,0),passageStudies:Object.values(packs).reduce((n,p)=>n+p.unitCount,0),banis:NAMES,viewports:[320,390,1280],maxGurmukhiSize:60},
 checks:[],screenshots:[],runtimeErrors:[],limitations:['No physical iPhone, Safari Home Screen, VoiceOver or device airplane-mode acceptance.','Offline navigation uses Chromium network emulation and the real root service worker.','The update check changes only the served worker version in this isolated server; it does not publish or alter repository assets.']};
await fs.mkdir(shots,{recursive:true});
let browser,origin,activePage,serveUpdatedWorker=false;
const contexts=new Set();
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
  if(!pathname.startsWith(PREFIX)){res.writeHead(404);res.end('Not found');return;}
  const relative=pathname.slice(PREFIX.length)||'index.html';
  const filename=path.resolve(root,relative.endsWith('/')?relative+'index.html':relative);
  if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  let bytes=await fs.readFile(filename);
  if(relative==='sw.js'&&serveUpdatedWorker)bytes=Buffer.from(workerSource.replace('const VERSION='+JSON.stringify(workerVersion)+';','const VERSION='+JSON.stringify(workerVersion+'-browser-update')+';'));
  res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);
 }catch{res.writeHead(404);res.end('Not found');}
});
async function screenshot(page,name){await page.screenshot({path:path.join(shots,name+'.png'),fullPage:false});report.screenshots.push('evidence/screenshots/nitnem/'+name+'.png');}
async function check(name,fn,details={}){
 try{await fn();report.checks.push({name,status:'passed',...details});return true;}
 catch(e){report.checks.push({name,status:'failed',error:e.stack||String(e),...details});try{if(activePage&&!activePage.isClosed())await screenshot(activePage,'failure-'+report.checks.length);}catch{}return false;}
}
const qa=page=>page.evaluate(()=>window.NITNEM_INTERNAL_QA.getState());
const keyFor=(name,edition=packs[name].editionId)=>'glp001.nitnem.PRIVATE-SOURCE-REVIEW.v1.'+name+'.'+edition;
const raw=(page,key)=>page.evaluate(key=>localStorage.getItem(key),key);
const stored=async(page,name)=>JSON.parse(await raw(page,keyFor(name)));
const lineSelector=id=>'.scripture-line[data-line-id="'+id+'"]';
async function waitReady(page,name){await page.waitForFunction(({name,count})=>window.NITNEM_INTERNAL_QA?.getState().bani===name&&window.NITNEM_INTERNAL_QA.getState().sourceVerified&&document.querySelectorAll('#source-unit .scripture-line').length===count,{name,count:packs[name].originalLineCount});assert.equal((await qa(page)).teachingAvailable,true,'The teaching course must pass runtime source binding');}
async function newContext({width=390,height=844,serviceWorkers='block',seed={},sentinels=true}={}){
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,acceptDownloads:true,serviceWorkers,reducedMotion:'reduce'});contexts.add(context);
 const values={...(sentinels?SENTINELS:{}),...seed};
 await context.addInitScript(values=>{for(const [key,value]of Object.entries(values))if(localStorage.getItem(key)===null)localStorage.setItem(key,value);},values);
 return context;
}
async function newPage(context,url='nitnem/index.html'){
 const page=await context.newPage();activePage=page;page.setDefaultTimeout(20000);
 page.on('pageerror',e=>report.runtimeErrors.push({url:page.url(),message:e.message}));
 const response=await page.goto(origin+PREFIX+url);assert.equal(response?.status(),200);return page;
}
async function choose(page,name){
 if(await page.locator('#reader').isVisible())await page.locator('#library-back').click();
 await page.locator('button[data-open="'+name+'"]').click();await waitReady(page,name);
}
async function mode(page,name){await page.locator('button[data-mode="'+name+'"]').click();await page.waitForFunction(name=>document.body.dataset.mode===name,name);}
async function jump(page,index){await page.locator('#jump').click();await page.locator('#jump-list button').nth(index).click();await page.waitForFunction(index=>!document.getElementById('jump-dialog').open&&window.NITNEM_INTERNAL_QA.getState().unit===index,index);}
async function openTools(page,{editable=true}={}){await page.locator('#reading-tools').click();await page.waitForFunction(()=>document.getElementById('tools-dialog').open);if(editable)await page.waitForFunction(()=>!document.getElementById('note').disabled);}
async function closeTools(page){await page.locator('#tools-close').click();await page.waitForFunction(()=>!document.getElementById('tools-dialog').open);}
async function selectLine(page,id){await page.locator(lineSelector(id)+' > .tuk').click();await page.waitForFunction(id=>document.querySelector('.scripture-line[aria-current="location"]')?.dataset.lineId===id,id);}
async function waitNote(page,name,id,text){await page.waitForFunction(({key,id,text})=>JSON.parse(localStorage.getItem(key)||'{}').payload?.notes?.[id]===text,{key:keyFor(name),id,text});}
async function importFile(page,value){await page.locator('#save-status').evaluate(node=>{node.textContent='';});await page.locator('#import-learning').setInputFiles({name:'synthetic-nitnem-learning.json',mimeType:'application/json',buffer:Buffer.from(typeof value==='string'?value:JSON.stringify(value))});}
async function unchangedOtherLearning(page){for(const[key,value]of Object.entries(SENTINELS))assert.equal(await raw(page,key),value);}
const sourceSnapshot=page=>page.locator('#source-unit .scripture-line').evaluateAll(rows=>rows.map(r=>({id:r.dataset.lineId,text:r.querySelector('.tuk')?.textContent,sha256:r.dataset.sourceSha256})));
const expectedRows=name=>packs[name].units.flatMap(u=>u.lines.map(l=>({id:l.id,text:l.text,sha256:l.sha256})));
function expectedOrder(pack){return pack.units.map((unit,index)=>{
 const rows=index===0?(pack.preface||[]).map(p=>({kind:'preface',text:p.text})):[];
 const addLine=id=>{const line=unit.lines.find(l=>l.id===id);rows.push({kind:'line',id,text:line.text});};
 const addHeading=i=>rows.push({kind:'heading',text:unit.metricalHeadings[i].text});
 if(unit.sourceDisplayOrder)for(const entry of unit.sourceDisplayOrder)entry.kind==='line'?addLine(entry.id):addHeading(entry.index);
 else{for(let i=0;i<(unit.metricalHeadings||[]).length;i++)addHeading(i);for(const line of unit.lines)addLine(line.id);}
 return {index,rows};
});}
async function assertSource(page,name){
 assert.deepEqual(await sourceSnapshot(page),expectedRows(name));
 const order=await page.locator('#source-unit > .passage-block').evaluateAll(blocks=>blocks.map(block=>({index:Number(block.dataset.unitIndex),rows:[...block.children].flatMap(node=>node.classList.contains('original-preface')?[{kind:'preface',text:node.textContent}]:node.classList.contains('meter-heading')?[{kind:'heading',text:node.textContent}]:node.classList.contains('scripture-line')?[{kind:'line',id:node.dataset.lineId,text:node.querySelector('.tuk').textContent}]:[])})));
 assert.deepEqual(order,expectedOrder(packs[name]));
 assert.equal(await page.locator('.quarantine').count(),0);
}
async function assertMeanings(page,name){
 const rows=await page.locator('#source-unit .scripture-line').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.lineId,en:n.querySelector('.simple-meaning .english')?.textContent,pa:n.querySelector('.simple-meaning .punjabi')?.textContent})));
 assert.deepEqual(rows,packs[name].units.flatMap(u=>u.lines.map(l=>{const m=course.closeTextNotes[name+'|'+l.id];return {id:l.id,en:m.simpleEn,pa:m.simplePa};})));
}
async function assertStudies(page,name){
 const studies=await page.locator('#source-unit .unit-lesson').evaluateAll(nodes=>Object.fromEntries(nodes.map(n=>[n.dataset.lessonUnit,n.textContent])));
 assert.equal(Object.keys(studies).length,packs[name].unitCount);
 for(const unit of packs[name].units){
  const lesson=course.unitLessons[name+'|'+unit.id],text=studies[unit.id];assert.ok(text,unit.id+' study present');
  for(const value of [lesson.simple.en,lesson.simple.pa,...Object.entries(lesson.study).filter(([key,v])=>key!=='words'&&typeof v==='string').map(([,v])=>v)])assert.ok(text.includes(value),unit.id+' must render its complete authored field: '+value.slice(0,100));
  for(const word of lesson.study.words)for(const value of [word.gurmukhi,word.workingGloss,word.workingGlossPa].filter(Boolean))assert.ok(text.includes(value),unit.id+' vocabulary '+value);
 }
 const headings=await page.locator('#source-unit .heading-note').evaluateAll(nodes=>nodes.map(n=>({index:Number(n.closest('.passage-block').dataset.unitIndex),en:n.querySelector('p[lang="en"]')?.textContent,pa:n.querySelector('p[lang="pa"]')?.textContent})));
 const expected=[];
 for(const [index,unit]of packs[name].units.entries())for(const heading of unit.metricalHeadings||[]){const entry=Object.values(course.headingNotes||{}).find(e=>e.unitId===unit.id&&(e.headingSha256||e.sourceSha256||e.sourceAnchor?.sha256)===heading.sha256);if(entry)expected.push({index,en:entry.simpleEn||entry.simple?.en,pa:entry.simplePa||entry.simple?.pa});}
 assert.deepEqual(headings,expected);
}
async function assertLayout(page,label){
 const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth,overflows:[...document.querySelectorAll('#dock,.appearance-header,.tuk,.meter-heading,.original-preface,.simple-meaning,.unit-lesson')].filter(n=>n.getClientRects().length).map(n=>({tag:n.className,left:n.getBoundingClientRect().left,right:n.getBoundingClientRect().right})).filter(r=>r.left< -1||r.right>innerWidth+1).slice(0,8)}));
 assert.ok(layout.scroll<=layout.width+1&&layout.body<=layout.width+1,label+' horizontal overflow: '+JSON.stringify(layout));assert.deepEqual(layout.overflows,[],label+' overflowing text/control boxes');
}
async function size60(page){await openTools(page);await page.locator('#size').evaluate(input=>{input.value='60';input.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await page.locator('#size-value').textContent(),'60px');await closeTools(page);assert.equal(await page.locator('#source-unit .tuk').first().evaluate(n=>getComputedStyle(n).fontSize),'60px');}
async function assertThemeStability(page){
 const before=await page.evaluate(()=>{window.__nitnemSourceNode=document.querySelector('.scripture-line[aria-current="location"]');return {line:window.__nitnemSourceNode.dataset.lineId,top:window.__nitnemSourceNode.getBoundingClientRect().top,y:scrollY,mode:document.body.dataset.mode};});
 for(const theme of ['amrit','day']){
  await page.locator('button[data-appearance="'+theme+'"]').click();
  const after=await page.evaluate(()=>({line:document.querySelector('.scripture-line[aria-current="location"]')?.dataset.lineId,same:window.__nitnemSourceNode===document.querySelector('.scripture-line[aria-current="location"]'),top:window.__nitnemSourceNode.getBoundingClientRect().top,y:scrollY,mode:document.body.dataset.mode,theme:document.body.dataset.theme}));
  assert.equal(after.theme,theme);assert.equal(after.line,before.line);assert.equal(after.mode,before.mode);assert.equal(after.same,true,'Appearance pointer event must not rerender source');assert.ok(Math.abs(after.y-before.y)<3&&Math.abs(after.top-before.top)<3,'Appearance must preserve viewport anchor: '+JSON.stringify({before,after}));
 }
}

try{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});report.browserVersion=browser.version();
 await check('Release contains all 1,361 source occurrences and 327 passage studies',()=>{assert.equal(report.coverage.sourceOccurrences,1361);assert.equal(report.coverage.passageStudies,327);assert.equal(packs.jaap.units.at(-1).lines.at(-1).text,'ਸਦਾ ਅੰਗ ਸੰਗੇ ਅਭੰਗੰ ਬਿਭੂਤੇ ॥੧੯੯॥');assert.ok(packs.anand.units[23].lines.every(l=>!l.held&&!/[\uE000-\uF8FF]/u.test(l.text)));});
 const context=await newContext(),page=await newPage(context);
 await check('Collection exposes all six new readers and the canonical existing Japji',async()=>{assert.deepEqual(await page.locator('button[data-open]').evaluateAll(nodes=>nodes.map(n=>n.dataset.open)),NAMES);assert.equal(await page.locator('[data-kind="original-japji"]').getAttribute('href'),'../full-japji.html');await screenshot(page,'collection-390');});
 for(const name of NAMES){
  await choose(page,name);
  await check(name+': all exact Gurmukhi, occurrence hashes, prefaces and metre order in the DOM',()=>assertSource(page,name));
  await check(name+': every bilingual meaning renders in Meaning mode',async()=>{await mode(page,'meaning');await assertMeanings(page,name);assert.equal(await page.locator('#source-unit .passage-summary').count(),packs[name].unitCount);});
  await check(name+': every full Study and authored bilingual heading renders',async()=>{await mode(page,'study');await assertMeanings(page,name);await assertStudies(page,name);});
  await check(name+': every passage is reachable and the final passage works in both layouts',async()=>{
   await page.locator('#jump').click();assert.equal(await page.locator('#jump-list button').count(),packs[name].unitCount);assert.deepEqual(await page.locator('#jump-list button').allTextContents(),packs[name].units.map((u,i)=>(i+1)+'. '+u.title));await page.locator('#jump-list button').last().click();
   assert.equal((await qa(page)).unit,packs[name].unitCount-1);assert.equal(await page.locator('#reading-end').isVisible(),true);
   await page.locator('#view-passage').click();assert.deepEqual(await sourceSnapshot(page),expectedRows(name).slice(-packs[name].units.at(-1).lines.length));assert.equal(await page.locator('#next-unit').isDisabled(),true);
   await page.locator('#prev-unit').click();assert.equal((await qa(page)).unit,packs[name].unitCount-2);await page.locator('#next-unit').click();assert.equal((await qa(page)).unit,packs[name].unitCount-1);
   await page.locator('#view-continuous').click();await assertSource(page,name);
  });
  await check(name+': meaning dialog uses actual teaching and returns keyboard focus',async()=>{
   await mode(page,'meaning');const unit=packs[name].units.at(-1),line=unit.lines[0],button=page.locator('button[data-meaning-line="'+line.id+'"]');await button.click();
   await page.waitForFunction(()=>document.getElementById('meaning-dialog').open);assert.equal(await page.evaluate(()=>document.activeElement.id),'meaning-dialog-title');assert.equal(await page.locator('#meaning-dialog .excerpt').textContent(),line.text);
   assert.ok((await page.locator('#meaning-dialog-body').textContent()).includes(course.unitLessons[name+'|'+unit.id].study.closeReading));
   await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.getElementById('meaning-dialog').open);assert.equal(await page.evaluate(()=>document.activeElement.dataset.meaningLine),line.id);
  });
 }
 await choose(page,'jaap');await mode(page,'study');await jump(page,160);await screenshot(page,'jaap-161-study-390');await page.locator('.unit-lesson[data-lesson-unit="jaap161"]').evaluate(node=>node.scrollIntoView({block:'start'}));await screenshot(page,'jaap-161-deeper-study-390');await jump(page,198);await screenshot(page,'jaap-199-study-390');
 await choose(page,'anand');await mode(page,'study');await jump(page,23);await screenshot(page,'anand-24-study-390');await page.locator('.unit-lesson[data-lesson-unit="anand24"]').evaluate(node=>node.scrollIntoView({block:'start'}));await screenshot(page,'anand-24-deeper-study-390');await unchangedOtherLearning(page);await context.close();contexts.delete(context);

 for(const width of [320,390,1280]){
  const ctx=await newContext({width,height:width===1280?900:844}),p=await newPage(ctx);activePage=p;
  for(const name of NAMES){await choose(p,name);await check(name+': 60px Read, Meaning and Study fit at '+width+'px, with stable Light/Dark switching',async()=>{
   await size60(p);const index=name==='jaap'?160:name==='anand'?23:Math.min(1,packs[name].unitCount-1);await jump(p,index);
   for(const depth of ['read','meaning','study']){await mode(p,depth);assert.equal((await qa(p)).unit,index);await assertLayout(p,name+' '+depth+' '+width);}
   await assertThemeStability(p);if(name==='jaap')await screenshot(p,'jaap-161-study-60px-'+width);if(name==='rehras'&&width===320)await screenshot(p,'rehras-study-60px-320');
  },{width,bani:name});}
  await unchangedOtherLearning(p);await ctx.close();contexts.delete(ctx);
 }

 const legacyEdition='jaap-199-digital-original-candidate-20261025',legacyKey=keyFor('jaap',legacyEdition),currentKey=keyFor('jaap');
 const savedId='jaap161.line02',otherId='jaap162.line01';
 // Independently specified historical format; not generated by the current storage helper.
 const legacyPayload={notes:{[savedId]:'SYNTHETIC older-edition reflection'},bookmarks:[savedId],lineId:savedId,size:42,theme:'amrit',pace:200,mode:'meaning',view:'continuous'};
 const legacyRecord={schema:1,compositionId:'jaap',editionId:legacyEdition,rev:7,savedAt:'2026-10-28T00:00:00Z',payload:legacyPayload},legacyRaw=JSON.stringify(legacyRecord);
 const migrationContext=await newContext({seed:{[legacyKey]:legacyRaw}}),migrationPage=await newPage(migrationContext);activePage=migrationPage;await choose(migrationPage,'jaap');
 await check('Old edition reading place, Meaning mode, pace 200 and reflections migrate without changing old bytes',async()=>{
  assert.equal((await qa(migrationPage)).mode,'meaning');assert.equal((await qa(migrationPage)).pace,200);assert.equal(await migrationPage.locator('.scripture-line[aria-current="location"]').getAttribute('data-line-id'),savedId);
  assert.equal(await raw(migrationPage,legacyKey),legacyRaw);assert.equal(await raw(migrationPage,currentKey),null);
  await mode(migrationPage,'study');await migrationPage.waitForFunction(key=>localStorage.getItem(key)!==null,currentKey);
  const current=await stored(migrationPage,'jaap');assert.equal(current.payload.notes[savedId],legacyPayload.notes[savedId]);assert.equal(current.payload.lineId,savedId);assert.equal(current.payload.pace,200);assert.equal(current.payload.mode,'study');assert.equal(await raw(migrationPage,legacyKey),legacyRaw);
 });
 await check('Learning import merges bookmarks and conflicting notes, retains settings, and is idempotent',async()=>{
  await openTools(migrationPage);const before=(await stored(migrationPage,'jaap')).payload;
  const incoming={project:'GLP-001-NITNEM-PRIVATE-REVIEW',schema:1,compositionId:'jaap',editionId:legacyEdition,state:{...legacyPayload,notes:{[savedId]:'SYNTHETIC imported conflicting reflection',[otherId]:'SYNTHETIC imported second reflection'},bookmarks:[otherId],lineId:otherId,pace:50,size:24,mode:'read'}};
  await importFile(migrationPage,incoming);await migrationPage.waitForFunction(()=>document.getElementById('save-status').textContent.startsWith('Bookmarks and reflections merged.'));
  const after=(await stored(migrationPage,'jaap')).payload;assert.equal(after.notes[savedId],legacyPayload.notes[savedId]+'\n\n— Imported reflection —\nSYNTHETIC imported conflicting reflection');assert.equal(after.notes[otherId],'SYNTHETIC imported second reflection');assert.deepEqual(new Set(after.bookmarks),new Set([savedId,otherId]));
  for(const key of ['lineId','size','theme','pace','mode','view'])assert.equal(after[key],before[key]);
  const beforeRepeatRevision=(await stored(migrationPage,'jaap')).rev;await importFile(migrationPage,incoming);await migrationPage.waitForFunction(({key,rev})=>JSON.parse(localStorage.getItem(key)).rev>rev,{key:currentKey,rev:beforeRepeatRevision});assert.deepEqual((await stored(migrationPage,'jaap')).payload,after);
  const ready=migrationPage.waitForEvent('download');await migrationPage.locator('#export-learning').click();const download=await ready,backup=JSON.parse(await fs.readFile(await download.path(),'utf8'));assert.equal(backup.project,'GLP-001-NITNEM');assert.deepEqual(backup.state,after);assert.equal(await raw(migrationPage,legacyKey),legacyRaw);await unchangedOtherLearning(migrationPage);
 });
 await check('Malformed and wrong-edition imports are refused without changing saved data',async()=>{
  for(const incoming of ['{broken',JSON.stringify({project:'GLP-001-NITNEM',schema:1,compositionId:'sohila',editionId:packs.sohila.editionId,state:legacyPayload}),JSON.stringify({project:'GLP-001-NITNEM',schema:1,compositionId:'jaap',editionId:'unknown-edition',state:legacyPayload})]){
   const before=await raw(migrationPage,currentKey);await importFile(migrationPage,incoming);await migrationPage.waitForFunction(()=>document.getElementById('save-status').textContent.startsWith('Import refused:'));assert.equal(await raw(migrationPage,currentKey),before);
  }
  await closeTools(migrationPage);
 });
 await check('Reload keeps the selected occurrence, depth and latest notes',async()=>{
  await selectLine(migrationPage,'jaap161.line03');await migrationPage.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).payload.lineId==='jaap161.line03',currentKey);const before=(await stored(migrationPage,'jaap')).payload;
  await migrationPage.reload();await waitReady(migrationPage,'jaap');assert.equal(await migrationPage.locator('.scripture-line[aria-current="location"]').getAttribute('data-line-id'),'jaap161.line03');assert.equal((await qa(migrationPage)).mode,before.mode);assert.deepEqual((await stored(migrationPage,'jaap')).payload,before);await unchangedOtherLearning(migrationPage);
 });
 await migrationContext.close();contexts.delete(migrationContext);

 for(const [label,recordKey,malformed]of [['malformed JSON',currentKey,'{SYNTHETIC broken JSON'],['future saved schema',currentKey,JSON.stringify({...legacyRecord,editionId:packs.jaap.editionId,schema:99})],['unknown saved field',legacyKey,JSON.stringify({...legacyRecord,payload:{...legacyPayload,futurePreference:true}})]]){
  const ctx=await newContext({seed:{[recordKey]:malformed}}),p=await newPage(ctx);activePage=p;await choose(p,'jaap');
  await check(label+': original bytes survive reading and recovery export',async()=>{
   assert.equal((await qa(p)).savingBlocked,true);assert.equal(await p.locator('#learning-status').isVisible(),true);await mode(p,'meaning');await openTools(p,{editable:false});assert.equal(await p.locator('#save-note').isDisabled(),true);assert.equal(await p.locator('#import-learning').isDisabled(),true);
   const ready=p.waitForEvent('download');await p.locator('#export-learning').click();const download=await ready;assert.equal(await fs.readFile(await download.path(),'utf8'),malformed);assert.equal(await raw(p,recordKey),malformed);if(recordKey!==currentKey)assert.equal(await raw(p,currentKey),null);await unchangedOtherLearning(p);await closeTools(p);
  });await ctx.close();contexts.delete(ctx);
 }

 const delayedContext=await newContext(),delayedPage=await newPage(delayedContext);activePage=delayedPage;await choose(delayedPage,'jaap');
 await check('A delayed file import is cancelled after its tools session closes and another bani opens',async()=>{
  await openTools(delayedPage);
  await delayedPage.evaluate(()=>{const original=File.prototype.text;window.__originalFileText=original;File.prototype.text=async function(){const text=await original.call(this);window.__fileReadStarted=true;await new Promise(resolve=>{window.__releaseFileRead=resolve;});window.__fileReadReturned=true;return text;};});
  await importFile(delayedPage,{project:'GLP-001-NITNEM',schema:1,compositionId:'jaap',editionId:packs.jaap.editionId,state:{...legacyPayload,notes:{[savedId]:'SYNTHETIC obsolete import must not apply'}}});
  await delayedPage.waitForFunction(()=>window.__fileReadStarted===true);assert.equal(await delayedPage.locator('#note').evaluate(node=>node.readOnly),true,'Import freezes editing while the file is being read');
  // An explicit programmatic close exercises a stale async session even while its ordinary controls are frozen.
  await delayedPage.locator('#tools-dialog').evaluate(dialog=>dialog.close());await choose(delayedPage,'sohila');await openTools(delayedPage);
  const before={jaap:await raw(delayedPage,keyFor('jaap')),sohila:await raw(delayedPage,keyFor('sohila')),status:await delayedPage.locator('#save-status').textContent()};
  await delayedPage.evaluate(()=>window.__releaseFileRead());await delayedPage.waitForFunction(()=>window.__fileReadReturned===true);await delayedPage.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  assert.equal(await raw(delayedPage,keyFor('jaap')),before.jaap);assert.equal(await raw(delayedPage,keyFor('sohila')),before.sohila);assert.equal(await delayedPage.locator('#save-status').textContent(),before.status);assert.equal(await delayedPage.locator('#note').inputValue(),'');assert.equal((await qa(delayedPage)).bani,'sohila');await unchangedOtherLearning(delayedPage);
  await delayedPage.evaluate(()=>{File.prototype.text=window.__originalFileText;});await closeTools(delayedPage);
 });await delayedContext.close();contexts.delete(delayedContext);

 const tabsContext=await newContext(),one=await newPage(tabsContext),two=await newPage(tabsContext);await choose(one,'jaap');await choose(two,'jaap');activePage=one;
 await check('Two real tabs serialize editors and preserve disjoint notes and bookmarks',async()=>{
  await jump(one,160);await openTools(one);await openTools(two,{editable:false});await two.waitForFunction(()=>document.getElementById('save-status').textContent.includes('another tab'));assert.equal(await two.locator('#note').isDisabled(),true);
  await one.locator('#note').fill('SYNTHETIC tab one note');await one.locator('#save-note').click();await waitNote(one,'jaap','jaap161.line01','SYNTHETIC tab one note');await one.locator('#bookmark').click();await one.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).payload.bookmarks.includes('jaap161.line01'),currentKey);await closeTools(one);await closeTools(two);await one.waitForFunction(async key=>!(await navigator.locks.query()).held.some(lock=>lock.name===key+':editor'),currentKey);
  await jump(two,161);await openTools(two);await two.locator('#note').fill('SYNTHETIC tab two note');await Promise.all([mode(one,'meaning'),two.locator('#save-note').click()]);await waitNote(two,'jaap','jaap162.line01','SYNTHETIC tab two note');await two.locator('#bookmark').click();await two.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).payload.bookmarks.includes('jaap162.line01'),currentKey);await closeTools(two);
  const current=(await stored(one,'jaap')).payload;assert.equal(current.notes['jaap161.line01'],'SYNTHETIC tab one note');assert.equal(current.notes['jaap162.line01'],'SYNTHETIC tab two note');assert.deepEqual(new Set(current.bookmarks),new Set(['jaap161.line01','jaap162.line01']));await one.waitForFunction(()=>window.NITNEM_INTERNAL_QA.getState().notes===2);await unchangedOtherLearning(one);await unchangedOtherLearning(two);
 });await tabsContext.close();contexts.delete(tabsContext);

 const offlineContext=await newContext({serviceWorkers:'allow',sentinels:false}),offlinePage=await newPage(offlineContext);activePage=offlinePage;
 await check('The real root worker verifies and caches all 69 assets, including Nitnem, Sukhmani and both Salok collections',async()=>{
  await offlinePage.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:60000});
  const actual=await offlinePage.evaluate(async()=>{const prefix='glp-static:'+location.origin+'/gurbani-learning-library/:',names=(await caches.keys()).filter(n=>n.startsWith(prefix));return {names,assets:await Promise.all(names.map(async name=>(await (await caches.open(name)).keys()).map(request=>new URL(request.url).pathname)))};});
  assert.equal(actual.names.length,1);assert.deepEqual(actual.assets[0].sort(),Object.keys(expectedAssets).map(asset=>new URL(asset,origin+PREFIX+'sw.js').pathname).sort());assert.equal(actual.assets[0].length,69);
  assert.equal(await offlinePage.evaluate(async()=>new URL((await navigator.serviceWorker.getRegistration()).scope).pathname),PREFIX);
 });
 await choose(offlinePage,'jaap');await jump(offlinePage,198);await openTools(offlinePage);await offlinePage.locator('#note').fill('SYNTHETIC offline final Jaap reflection');await offlinePage.locator('#save-note').click();await waitNote(offlinePage,'jaap','jaap199.line01','SYNTHETIC offline final Jaap reflection');await closeTools(offlinePage);await mode(offlinePage,'meaning');
 await offlineContext.setOffline(true);
 await check('All six new banis load exact complete text and meanings with the network offline',async()=>{
  for(const name of NAMES){const response=await offlinePage.goto(origin+PREFIX+'nitnem/index.html?bani='+name);assert.equal(response.status(),200);await waitReady(offlinePage,name);await mode(offlinePage,'meaning');await assertSource(offlinePage,name);await assertMeanings(offlinePage,name);}
  await offlinePage.goto(origin+PREFIX+'nitnem/index.html?bani=jaap&unit=199');await waitReady(offlinePage,'jaap');await mode(offlinePage,'study');assert.equal((await stored(offlinePage,'jaap')).payload.notes['jaap199.line01'],'SYNTHETIC offline final Jaap reflection');await screenshot(offlinePage,'jaap-199-study-offline-390');
 });
 await check('Canonical Japji and the complete Sukhmani remain readable under the same offline worker',async()=>{
  await offlinePage.goto(origin+PREFIX+'full-japji.html');await offlinePage.waitForFunction(count=>document.querySelectorAll('#continuous-reader .scripture-line').length===count,japji.units.flatMap(u=>u.lines).length);
  assert.deepEqual(await offlinePage.locator('#continuous-reader .scripture-line').evaluateAll(rows=>rows.map(r=>({id:r.dataset.occurrence,text:r.querySelector('.tuk').textContent}))),japji.units.flatMap(u=>u.lines.map(l=>({id:l.id,text:l.text}))));
  await offlinePage.goto(origin+PREFIX+'sukhmani.html');const skLines=sukhmani.ashtpadis.flatMap(a=>a.lines);await offlinePage.waitForFunction(count=>document.querySelectorAll('#sukhmani-text .sk-line').length===count,skLines.length);
  assert.deepEqual(await offlinePage.locator('#sukhmani-text .sk-line').evaluateAll(rows=>rows.map(r=>({id:r.dataset.lineId,text:r.querySelector('.tuk').textContent}))),skLines.map(l=>({id:l.id,text:l.gurmukhi})));assert.equal(sukhmani.ashtpadis.length,24);
  const leaked=await offlinePage.evaluate(async()=>{for(const name of await caches.keys()){const cache=await caches.open(name);for(const request of await cache.keys())if((await (await cache.match(request)).text()).includes('SYNTHETIC offline final Jaap reflection'))return true;}return false;});assert.equal(leaked,false,'Private learning must never enter the static asset cache');
 });
 await offlineContext.setOffline(false);await offlinePage.goto(origin+PREFIX+'nitnem/index.html?bani=jaap&unit=199');await waitReady(offlinePage,'jaap');activePage=offlinePage;
 await check('A new worker waits for explicit action, then preserves the open reflection during activation',async()=>{
  await offlinePage.evaluate(async()=>{await caches.open('glp-static:'+location.origin+'/other-app/:sentinel');});
  await openTools(offlinePage);serveUpdatedWorker=true;await offlinePage.locator('#check-update').click();
  await offlinePage.waitForFunction(()=>!document.getElementById('apply-update').hidden,null,{timeout:60000});
  const before=await offlinePage.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();return {waiting:!!r.waiting,controlled:!!navigator.serviceWorker.controller,names:await caches.keys()};});assert.equal(before.waiting,true);assert.equal(before.controlled,true);assert.ok(before.names.some(n=>n.endsWith(':'+workerVersion)),'Old worker remains active until requested');
  await offlinePage.locator('#note').fill('SYNTHETIC unsaved reflection captured before explicit update');
  await Promise.all([offlinePage.waitForEvent('load'),offlinePage.locator('#apply-update').click()]);await waitReady(offlinePage,'jaap');
  assert.equal((await stored(offlinePage,'jaap')).payload.notes['jaap199.line01'],'SYNTHETIC unsaved reflection captured before explicit update');
  const names=await offlinePage.evaluate(()=>caches.keys());assert.ok(names.includes('glp-static:'+origin+'/other-app/:sentinel'));assert.deepEqual(names.filter(n=>n.startsWith('glp-static:'+origin+PREFIX+':')),['glp-static:'+origin+PREFIX+':'+workerVersion+'-browser-update']);
 });await offlineContext.close();contexts.delete(offlineContext);
 await check('No uncaught browser runtime errors',()=>assert.deepEqual(report.runtimeErrors,[]));
}catch(error){report.checks.push({name:'Browser harness execution',status:'failed',error:error.stack||String(error)});try{if(activePage&&!activePage.isClosed())await screenshot(activePage,'harness-failure');}catch{}}
finally{
 for(const context of contexts)try{await context.close();}catch{}
 await browser?.close();if(server.listening)await new Promise(resolve=>server.close(resolve));
 report.completedAt=new Date().toISOString();report.passed=report.checks.filter(c=>c.status==='passed').length;report.failed=report.checks.filter(c=>c.status==='failed').length;report.status=report.failed?'failed':'passed';
 await fs.writeFile(path.join(evidence,'nitnem-browser-verification.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:report.status,passed:report.passed,failed:report.failed,browser:report.browserVersion,failures:report.checks.filter(c=>c.status==='failed')},null,2));process.exitCode=report.failed?1:0;
}
