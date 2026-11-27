// Isolated browser regression: made-up notes only, never a personal browser profile.
// Run: npm install --no-save playwright && npx playwright install --with-deps chromium
//      node tests/sukhmani-browser.mjs
// CHROMIUM_PATH may select an existing browser executable. No server is required.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const evidence=path.join(root,'evidence'),shots=path.join(evidence,'screenshots','sukhmani');
const KEY='glp001.sukhmani.v1',JAPJI='glp001.continuous.v2',PREFIX='/gurbani-learning-library/';
const sentinel='SYNTHETIC JAPJI SENTINEL — DO NOT CHANGE';
const report={startedAt:new Date().toISOString(),engine:'chromium',browserVersion:null,fixture:'Ephemeral localhost server under /gurbani-learning-library/, fresh nonpersistent browser contexts',checks:[],screenshots:[],setupDiagnostics:[],runtimeErrors:[],limitations:['No physical iPhone, Safari Home Screen, VoiceOver or actual airplane-mode acceptance.','Hidden-page guide behavior uses an explicitly simulated document.hidden signal.','Offline service worker is explicitly registered by this test at trusted localhost; production pwa.js registers automatically on HTTPS.']};
await fs.mkdir(shots,{recursive:true});
const checks=report.checks;
let activePage=null,setupAttempt=0;
async function diagnostic(page,name){if(page&&!page.isClosed()){try{await screenshot(page,name);}catch(e){report.screenshots.push({name,error:e.message});}}}
async function check(name,fn,details={}){try{await fn();checks.push({name,status:'passed',...details});return true;}catch(e){checks.push({name,status:'failed',error:e.stack||String(e),...details});await diagnostic(activePage,'failure-'+checks.length+'-'+(details.width||'scenario'));return false;}}
function loadData(text,key){const context={window:{}};vm.runInNewContext(text,context,{timeout:3000});return JSON.parse(JSON.stringify(context.window[key]));}
const data=loadData(await fs.readFile(path.join(root,'js/sukhmani-data.js'),'utf8'),'GLP_SUKHMANI');
const teaching=loadData(await fs.readFile(path.join(root,'js/sukhmani-teaching.js'),'utf8'),'GLP_SUKHMANI_TEACHING');
const lines=data.ashtpadis.flatMap(a=>a.lines),firstStudyLine=lines.find(l=>l.ashtpadi===1&&l.kind==='pauri'),otherLine=lines.find(l=>l.ashtpadi===2&&l.kind==='pauri');
const lineById=new Map(lines.map(line=>[line.id,line])),lastAshtpadi=data.ashtpadis.at(-1).number;
const sourceStudyUnits=[...new Map(lines.filter(line=>['salok','pauri','rahau'].includes(line.kind)).map(line=>[line.unitId,line])).values()];
report.coverage={ashtpadis:data.ashtpadis.map(a=>a.number),sourceOccurrences:lines.length,studyUnits:sourceStudyUnits.length,overviews:data.ashtpadis.length,firstSix:{sourceOccurrences:lines.filter(line=>line.ashtpadi<=6).length,studyUnits:sourceStudyUnits.filter(line=>line.ashtpadi<=6).length,overviews:data.ashtpadis.filter(a=>a.number<=6).length}};
// Frozen first-six format with made-up learning; no current-reader export helper constructs it.
const firstSixState={version:2,read:'sukhmani.a06.p07.l03',guide:'sukhmani.a06.p06.l01',hasGuided:true,mode:'understand',theme:'amrit',size:34,pace:85,pronunciation:true,bookmarks:['sukhmani.a02.p08.l05','sukhmani.a06.p07.l03'],notes:{'sukhmani.a02.p08.l05':'SYNTHETIC first-six reflection on holy company.','sukhmani.a06.p07.l03':'SYNTHETIC first-six saved-place reflection.'}};
const firstSixExport={projectId:'GLP-001',format:'glp-sukhmani-learning',version:1,composition:'sukhmani',createdAt:'2026-11-23T00:00:00.000Z',state:{...structuredClone(firstSixState),bookmarks:[...firstSixState.bookmarks,'sukhmani.a04.p02.l03'],notes:{...firstSixState.notes,'sukhmani.a04.p02.l03':'SYNTHETIC reflection imported from a first-six backup.'}}};
// A frozen published first-twelve record, built without the current export helper.
const firstTwelveState={version:2,read:'sukhmani.a12.p08.l10',guide:'sukhmani.a11.p04.l03',hasGuided:true,mode:'study',theme:'amrit',size:38,pace:90,pronunciation:true,bookmarks:['sukhmani.a08.p02.l04','sukhmani.a12.p08.l10'],notes:{'sukhmani.a07.p03.l05':'SYNTHETIC published first-twelve reflection.','sukhmani.a12.p08.l10':'SYNTHETIC published-pack final-place reflection.'}};
const firstTwelveExport={projectId:'GLP-001',format:'glp-sukhmani-learning',version:1,composition:'sukhmani',createdAt:'2026-11-24T00:00:00.000Z',state:{...structuredClone(firstTwelveState),bookmarks:[...firstTwelveState.bookmarks,'sukhmani.a10.p04.l03'],notes:{...firstTwelveState.notes,'sukhmani.a10.p04.l03':'SYNTHETIC reflection imported from a first-twelve backup.'}}};
report.coverage.firstTwelve={sourceOccurrences:lines.filter(line=>line.ashtpadi<=12).length,studyUnits:sourceStudyUnits.filter(line=>line.ashtpadi<=12).length,overviews:data.ashtpadis.filter(a=>a.number<=12).length};
// Published first-eighteen saved state and backup, independently specified.
const firstEighteenState={version:2,read:'sukhmani.a18.p08.l10',guide:'sukhmani.a17.p04.l03',hasGuided:true,mode:'study',theme:'amrit',size:36,pace:95,pronunciation:true,bookmarks:['sukhmani.a13.p02.l04','sukhmani.a18.p08.l10'],notes:{'sukhmani.a15.p03.l05':'SYNTHETIC published first-eighteen reflection.','sukhmani.a18.p08.l10':'SYNTHETIC former end-of-pack reflection.'}};
const firstEighteenExport={projectId:'GLP-001',format:'glp-sukhmani-learning',version:1,composition:'sukhmani',createdAt:'2026-11-24T02:00:00.000Z',state:{...structuredClone(firstEighteenState),bookmarks:[...firstEighteenState.bookmarks,'sukhmani.a16.p04.l03'],notes:{...firstEighteenState.notes,'sukhmani.a16.p04.l03':'SYNTHETIC reflection imported from a first-eighteen backup.'}}};
report.coverage.firstEighteen={sourceOccurrences:lines.filter(line=>line.ashtpadi<=18).length,studyUnits:sourceStudyUnits.filter(line=>line.ashtpadi<=18).length,overviews:data.ashtpadis.filter(a=>a.number<=18).length};
const lineSelector=id=>`.sk-line[data-line-id="${id}"]`;
const sourceRows=lines.map(l=>({id:l.id,text:l.gurmukhi,ang:String(l.ang)}));
const sourceSnapshot=page=>page.locator('#sukhmani-text .sk-line').evaluateAll(rows=>rows.map(r=>({id:r.dataset.lineId,text:r.querySelector('p.tuk').textContent,ang:r.dataset.ang})));
const state=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);
const raw=page=>page.evaluate(key=>localStorage.getItem(key),KEY);
async function expectRestored(page,id){
 await page.waitForFunction(count=>document.querySelectorAll('#sukhmani-text .sk-line').length===count,lines.length);
 await page.evaluate(()=>document.fonts.ready);
 await page.waitForTimeout(450); // Observe after the reader's 200 ms scroll debounce.
 assert.equal((await state(page)).read,id,'Settled saved occurrence');
 assert.equal(await page.locator('.sk-line[data-current="true"]').getAttribute('id'),id);
 const rect=await page.locator(lineSelector(id)).evaluate(n=>({top:n.getBoundingClientRect().top,bottom:n.getBoundingClientRect().bottom}));
 assert.ok(rect.top>=-1&&rect.top<65&&rect.bottom>34,'Restored source occurrence must remain visible: '+JSON.stringify(rect));
 assert.equal(await page.locator('#resume-notice').isVisible(),false,'Reload restores directly; fresh navigation offers Resume');
}

const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
  if(!pathname.startsWith(PREFIX)){res.writeHead(404);res.end('Not found');return;}
  const relative=pathname.slice(PREFIX.length)||'index.html',filename=path.resolve(root,relative.endsWith('/')?relative+'index.html':relative);
  if(filename!==root&&!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const bytes=await fs.readFile(filename);res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);
 }catch{res.writeHead(404);res.end('Not found');}
});
let browser,origin;
async function fresh(viewport,{serviceWorkers='block',initial=null}={}){
 const context=await browser.newContext({viewport,deviceScaleFactor:1,acceptDownloads:true,serviceWorkers,reducedMotion:'reduce'});
 const attempt=++setupAttempt;let page,mainResponseStatus=null;
 try{
  await context.addInitScript(({KEY,JAPJI,sentinel,initial})=>{if(localStorage.getItem(JAPJI)===null)localStorage.setItem(JAPJI,sentinel);if(initial!==null&&localStorage.getItem(KEY)===null)localStorage.setItem(KEY,initial);},{KEY,JAPJI,sentinel,initial});
  page=await context.newPage();activePage=page;page.setDefaultTimeout(12000);page.on('pageerror',error=>report.runtimeErrors.push({viewport:viewport.width,message:error.message}));
  const response=await page.goto(origin+PREFIX+'sukhmani.html');mainResponseStatus=response?.status()??null;
  assert.equal(mainResponseStatus,200,'Sukhmani main document must return HTTP 200 before reader checks');
  await page.waitForFunction(count=>document.querySelectorAll('#sukhmani-text .sk-line').length===count,lines.length);
  return {context,page};
 }catch(error){
  const setup={attempt,width:viewport.width,height:viewport.height,mainResponseStatus,error:error.stack||String(error)};
  if(page&&!page.isClosed()){
   try{Object.assign(setup,await page.evaluate(()=>({url:location.href,title:document.title,bodyText:(document.body?.innerText||'').slice(0,2000),renderedLineCount:document.querySelectorAll('#sukhmani-text .sk-line').length})));}catch(diagnosticError){setup.diagnosticError=diagnosticError.message;}
   await diagnostic(page,'failure-initial-load-'+attempt+'-'+viewport.width);
  }
  report.setupDiagnostics.push(setup);
  try{await context.close();}catch(closeError){setup.closeError=closeError.message;}
  if(activePage===page)activePage=null;
  throw error;
 }
}
async function screenshot(page,name){await page.screenshot({path:path.join(shots,name+'.png'),fullPage:false});report.screenshots.push('evidence/screenshots/sukhmani/'+name+'.png');}
async function closeDialog(page){if(await page.locator('#sk-dialog').evaluate(d=>d.open)){await page.locator('#sk-dialog-close').click();await page.waitForFunction(()=>!document.getElementById('sk-dialog').open);}}
async function tools(page){await closeDialog(page);await page.locator('#sk-tools').click();await page.locator('#sk-theme').waitFor();}
async function openLine(page,id){await closeDialog(page);await page.locator(lineSelector(id)+' p.tuk').click();await page.locator('#sk-save-reflection').waitFor();}
async function waitNote(page,id,text){await page.waitForFunction(({KEY,id,text})=>JSON.parse(localStorage.getItem(KEY)||'{}').notes?.[id]===text,{KEY,id,text});}
async function saveNote(page,id,text){await openLine(page,id);await page.locator('#sk-reflection').fill(text);await page.locator('#sk-save-reflection').click();await waitNote(page,id,text);}
async function importFile(page,value){await page.locator('#sk-import').setInputFiles({name:'synthetic-sukhmani-learning.json',mimeType:'application/json',buffer:Buffer.from(typeof value==='string'?value:JSON.stringify(value))});}

try{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});report.browserVersion=browser.version();
 await check('The complete reading pack covers all 24 Ashtpadis',()=>{assert.deepEqual(data.ashtpadis.map(a=>a.number),Array.from({length:24},(_,i)=>i+1));assert.equal(data.completeComposition,true);assert.equal(lines.at(-1).gurmukhi,'ਨਾਨਕ ਇਹ ਗੁਣਿ ਨਾਮੁ ਸੁਖਮਨੀ ॥੮॥੨੪॥');});

 // The real source pack is compared with actual rendered text, not a reimplementation.
 for(const viewport of [{width:390,height:844},{width:320,height:740},{width:1280,height:900}]){
  let context,page;
  try{
   ({context,page}=await fresh(viewport));
   await check('All '+lines.length+' original occurrences, exact Unicode, order and Ang',async()=>assert.deepEqual(await sourceSnapshot(page),sourceRows),{width:viewport.width});
   await check('Every occurrence and study retains its own English and Punjabi teaching',async()=>{
    const rendered=await page.locator('#sukhmani-text .sk-line').evaluateAll(rows=>rows.map(r=>({id:r.dataset.lineId,en:r.querySelector('.simple-meaning .english')?.textContent,pa:r.querySelector('.simple-meaning .punjabi')?.textContent})));
    assert.deepEqual(rendered,lines.map(l=>({id:l.id,en:teaching.meanings[l.id].en,pa:teaching.meanings[l.id].pa})));
    const studies=await page.locator('.sk-unit > .sk-study').evaluateAll(cards=>Object.fromEntries(cards.map(card=>[card.parentElement.id.slice('unit-'.length),card.textContent])));
    const overviews=await page.locator('.sk-ashtpadi > .sk-study').evaluateAll(cards=>Object.fromEntries(cards.map(card=>[card.parentElement.id,card.textContent])));
    assert.equal(Object.keys(studies).length,sourceStudyUnits.length);assert.equal(Object.keys(overviews).length,data.ashtpadis.length);
    for(const a of data.ashtpadis){
     const lesson=teaching.ashtpadis[String(a.number)];
     for(const language of ['en','pa'])assert.ok(overviews['ashtpadi-'+a.number].includes(lesson.overview[language]),'Overview '+a.number+' '+language+' must retain its text');
     for(const unit of [lesson.salok,lesson.rahau,...lesson.pauris].filter(Boolean)){
      const unitId=lineById.get(unit.sourceIds[0])?.unitId;assert.ok(studies[unitId],'Study must be attached to '+unitId);
      for(const field of ['explanation','reflection'])for(const language of ['en','pa'])assert.ok(studies[unitId].includes(unit[field][language]),unitId+' '+field+' '+language+' must retain its text');
     }
    }
   },{width:viewport.width});
   await check('All '+data.ashtpadis.length+' Ashtpadi links fit and navigate without replacing text',async()=>{
    const navigation=page.locator('#ashtpadi-nav a');assert.equal(await navigation.count(),data.ashtpadis.length);
    assert.ok(await navigation.evaluateAll(links=>links.every(link=>{const r=link.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.left>=0&&r.right<=innerWidth;})),'Navigation touch targets must fit the viewport');
    for(const a of data.ashtpadis){await navigation.filter({hasText:new RegExp('^'+a.number+'$')}).click();await page.waitForFunction(id=>document.querySelector('.sk-line[data-current="true"]')?.id===id,a.lines[0].id);assert.equal(await page.locator('.sk-line').count(),lines.length);assert.ok(Math.abs(await page.locator(lineSelector(a.lines[0].id)).evaluate(n=>n.getBoundingClientRect().top))<65);}
    assert.equal(await page.locator('#sk-end-title').textContent(),'End of Ashtpadi '+lastAshtpadi);assert.match(await page.locator('#sk-coverage').textContent(),/Ashtpadis 1–24 of 24/);
    assert.equal(await page.locator('#sk-end-scope').textContent(),'End of Sukhmani Sahib.');assert.match(await page.locator('#sk-scope').textContent(),/All 24 Ashtpadis are included/);
   },{width:viewport.width});
   await check('Mode changes preserve original nodes and the reading anchor',async()=>{
    const target=lines.find(l=>l.ashtpadi===3&&l.pauri===3&&l.kind==='pauri').id;
    await page.locator(lineSelector(target)).evaluate(n=>n.scrollIntoView({block:'start'}));
    await page.evaluate(()=>{window.__originalSukhmaniNodes=Array.from(document.querySelectorAll('.sk-line p.tuk'));});
    for(const mode of ['understand','study','read']){
     const before=await page.locator(lineSelector(target)).evaluate(n=>n.getBoundingClientRect().top);
     await page.locator('.modes button[data-depth="'+mode+'"]').click();
     const after=await page.locator(lineSelector(target)).evaluate(n=>n.getBoundingClientRect().top);
     assert.ok(Math.abs(before-after)<5,'Reading anchor moved by '+(after-before)+'px');
     assert.ok(await page.evaluate(()=>window.__originalSukhmaniNodes.every((n,i)=>n===document.querySelectorAll('.sk-line p.tuk')[i])));
    }
   },{width:viewport.width});
   await check('Largest Gurmukhi, theme and pronunciation remain usable without horizontal overflow',async()=>{
    await tools(page);await page.locator('#sk-theme').selectOption('amrit');await page.locator('#sk-size').press('End');await page.locator('#sk-pronunciation').check();await closeDialog(page);
    await page.waitForFunction(()=>document.documentElement.dataset.theme==='amrit'&&getComputedStyle(document.documentElement).getPropertyValue('--gurmukhi-size').trim()==='48px');
    assert.ok(await page.locator('.transliteration').first().isVisible());
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    assert.equal(await page.locator('.reading-dock').evaluate(n=>n.getBoundingClientRect().height>60),false);
    if(viewport.width===320){await page.locator('#back-start').click();await screenshot(page,'amrit-320');}
    await tools(page);await page.locator('#sk-size').press('Home');for(let i=0;i<6;i++)await page.locator('#sk-size').press('ArrowRight');await page.locator('#sk-theme').selectOption('day');await page.locator('#sk-pronunciation').uncheck();await closeDialog(page);
   },{width:viewport.width});
   if(viewport.width===390)await check('Read, Meaning and Study preview screenshots',async()=>{
    for(const [mode,name]of [['read','read-390'],['understand','meaning-390'],['study','study-390']]){
     await closeDialog(page);
     await page.locator('.modes button[data-depth="'+mode+'"]').click();
     await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
     if(mode==='read'){
      await page.locator('#ashtpadi-nav a').filter({hasText:/^1$/}).click();
      await page.waitForFunction(()=>document.getElementById('sk-position').textContent.includes('Ashtpadi 1'));
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      await page.evaluate(()=>scrollTo(0,0));
     }else{
      await page.locator('#sk-position').click();
      await page.locator('#sk-dialog .sk-options').first().getByRole('button',{name:/^Pauri 1\b/}).click();
      await page.waitForFunction(()=>!document.getElementById('sk-dialog').open&&document.getElementById('sk-position').textContent.includes('Ashtpadi 1')&&document.getElementById('sk-position').textContent.includes('Pauri 1'));
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const unit=page.locator('.sk-unit').filter({has:page.locator(lineSelector(firstStudyLine.id))});
      // Keep the final verse with its following study so the visible passage and dock agree after scroll tracking settles.
      const target=mode==='understand'?page.locator(lineSelector(firstStudyLine.id)):unit.locator('.sk-line').last();
      const targetId=await target.getAttribute('data-line-id');
      await target.evaluate(n=>n.scrollIntoView({block:'start'}));
      await page.waitForFunction(id=>document.querySelector('.sk-line[data-current="true"]')?.id===id,targetId);
      assert.match(await page.locator('#sk-position').innerText(),/Pauri 1/);
     }
     assert.match(await page.locator('#sk-position').innerText(),/Ashtpadi 1/);
     assert.equal(await page.locator('#ashtpadi-nav a').filter({hasText:/^1$/}).getAttribute('aria-current'),'true');
     await screenshot(page,name);
    }
    for(const [number,pauri]of [[23,1],[24,8]]){
     const lastLine=lines.filter(line=>line.ashtpadi===number&&(pauri?line.pauri===pauri:line.kind==='salok')).at(-1);assert.ok(lastLine);
     await page.locator('#sk-position').click();await page.locator('#sk-dialog .sk-options').nth(data.ashtpadis.findIndex(a=>a.number===number)).getByRole('button',{name:pauri?new RegExp('^Pauri '+pauri+'\\b'):/^Salok\b/}).click();
     await page.waitForFunction(n=>!document.getElementById('sk-dialog').open&&document.getElementById('sk-position').textContent.includes('Ashtpadi '+n),number);
     await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
     await page.locator(lineSelector(lastLine.id)).evaluate(n=>n.scrollIntoView({block:'start'}));await page.waitForFunction(id=>document.querySelector('.sk-line[data-current="true"]')?.id===id,lastLine.id);
     const study=page.locator('.sk-unit').filter({has:page.locator(lineSelector(lastLine.id))}).locator('.sk-study');
     assert.ok(await study.evaluate(n=>{const r=n.getBoundingClientRect();return r.top<innerHeight-100&&r.bottom>0;}),'Ashtpadi '+number+' teaching must be visible in its screenshot');
     assert.ok((await page.locator('#sk-position').innerText()).includes('Ashtpadi '+number));await screenshot(page,'study-ashtpadi-'+number+'-390');
    }
   },{width:viewport.width});
  }catch(e){checks.push({name:'Viewport scenario setup or execution',width:viewport.width,status:'failed',error:e.stack||String(e)});await diagnostic(page,'failure-setup-'+viewport.width);}finally{await context?.close();}
 }

 // Persistence, backups and cross-tab writes use only synthetic notes.
 let context,page;
 try{
  ({context,page}=await fresh({width:390,height:844}));
  const note='SYNTHETIC reflection for automated verification only.';
  await check('Bookmark and reflection survive reload and resume; Japji remains unchanged',async()=>{
   await saveNote(page,firstStudyLine.id,note);
   assert.equal(await page.locator('#sk-bookmark').textContent(),'Bookmark this line');assert.equal(await page.locator('#sk-bookmark').getAttribute('aria-pressed'),'false');
   for(const marked of [true,false,true]){
    await page.locator('#sk-bookmark').click();
    await page.waitForFunction(({KEY,id,marked})=>JSON.parse(localStorage.getItem(KEY)||'{}').bookmarks?.includes(id)===marked&&document.getElementById('sk-bookmark').textContent===(marked?'Remove bookmark':'Bookmark this line'),{KEY,id:firstStudyLine.id,marked});
    assert.equal(await page.locator('#sk-bookmark').getAttribute('aria-pressed'),String(marked));
   }
   await closeDialog(page);
   await page.reload();await expectRestored(page,firstStudyLine.id);
   const s=await state(page);assert.equal(s.notes[firstStudyLine.id],note);assert.ok(s.bookmarks.includes(firstStudyLine.id));assert.equal(s.read,firstStudyLine.id);assert.equal(await page.evaluate(key=>localStorage.getItem(key),JAPJI),sentinel);
   await openLine(page,firstStudyLine.id);assert.equal(await page.locator('#sk-bookmark').textContent(),'Remove bookmark');assert.equal(await page.locator('#sk-bookmark').getAttribute('aria-pressed'),'true');await closeDialog(page);
  });
  let exported;
  await check('Sukhmani export contains the saved learning and excludes Japji',async()=>{
   await tools(page);const ready=page.waitForEvent('download');await page.locator('#sk-export').click();const file=await ready;exported=JSON.parse(await fs.readFile(await file.path(),'utf8'));assert.equal(exported.composition,'sukhmani');assert.equal(exported.state.notes[firstStudyLine.id],note);assert.equal(JSON.stringify(exported).includes(sentinel),false);
  });
  await check('Valid import merges notes and bookmarks while preserving current place',async()=>{
   assert.ok(exported,'Export must be available');const incoming=structuredClone(exported);incoming.state.notes[firstStudyLine.id]='SYNTHETIC imported reflection';incoming.state.bookmarks=[otherLine.id];const before=(await state(page)).read;await importFile(page,incoming);await page.waitForFunction(()=>document.getElementById('sk-import-result').textContent.includes('merged'));
   const s=await state(page);assert.ok(s.notes[firstStudyLine.id].includes(note));assert.ok(s.notes[firstStudyLine.id].includes('SYNTHETIC imported reflection'));assert.ok(s.bookmarks.includes(firstStudyLine.id)&&s.bookmarks.includes(otherLine.id));assert.equal(s.read,before);
  });
  await check('Unknown lines, corrupt JSON, foreign and future exports preserve the complete saved record',async()=>{
   assert.ok(exported);const unknown=structuredClone(exported);unknown.state.bookmarks=['not.a.source.line'];const future=structuredClone(exported);future.state.version=3;
   for(const [value,message]of [[unknown,'outside'],['{broken','valid JSON'],[{projectId:'GLP-001',format:'glp-family-learning',version:1},'Sukhmani'],[future,'newer']]){const before=await raw(page);await importFile(page,value);await page.waitForFunction(text=>document.getElementById('sk-import-result').textContent.includes(text),message);assert.equal(await raw(page),before);}
   assert.equal(await page.evaluate(key=>localStorage.getItem(key),JAPJI),sentinel);
  });
  await check('Two tabs coordinate reflection edits and preserve each other’s saved notes',async()=>{
   await closeDialog(page);await openLine(page,firstStudyLine.id);const second=await context.newPage();second.on('pageerror',e=>report.runtimeErrors.push({scenario:'second tab',message:e.message}));await second.goto(origin+PREFIX+'sukhmani.html');await second.waitForFunction(count=>document.querySelectorAll('.sk-line').length===count,lines.length);await openLine(second,otherLine.id);
   assert.ok(await second.locator('#sk-reflection').evaluate(n=>n.readOnly),'Concurrent editor should be read-only');assert.ok(await second.locator('#sk-save-reflection').isDisabled());
   await page.locator('#sk-reflection').fill('SYNTHETIC note from tab one');await page.locator('#sk-save-reflection').click();await waitNote(page,firstStudyLine.id,'SYNTHETIC note from tab one');await closeDialog(page);
   await closeDialog(second);await saveNote(second,otherLine.id,'SYNTHETIC note from tab two');await closeDialog(second);const s=await state(second);assert.equal(s.notes[firstStudyLine.id],'SYNTHETIC note from tab one');assert.equal(s.notes[otherLine.id],'SYNTHETIC note from tab two');assert.equal(await second.evaluate(key=>localStorage.getItem(key),JAPJI),sentinel);await second.close();
  });
  await check('Silent guide advances and pauses on manual wheel input',async()=>{
   await closeDialog(page);await tools(page);await page.locator('#sk-pace').press('End');await closeDialog(page);await page.locator('.modes button[data-depth="read"]').click();await page.locator('#ashtpadi-nav a').filter({hasText:/^1$/}).click();await page.locator('#sk-play').click();await page.waitForFunction(()=>document.getElementById('sk-play').getAttribute('aria-pressed')==='true');const start=await page.locator('.sk-line[data-current="true"]').getAttribute('id');await page.waitForFunction(id=>document.querySelector('.sk-line[data-current="true"]')?.id!==id,start,{timeout:10000});await page.mouse.wheel(0,150);await page.waitForFunction(()=>document.getElementById('sk-play').getAttribute('aria-pressed')==='false');
  });
  await check('A simulated hidden-page visibility signal pauses the silent guide',async()=>{
   await page.locator('#sk-play').click();await page.waitForFunction(()=>document.getElementById('sk-play').getAttribute('aria-pressed')==='true');await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;});assert.equal(await page.locator('#sk-play').getAttribute('aria-pressed'),'false');
  });
 }catch(e){checks.push({name:'Learning scenario setup or execution',status:'failed',error:e.stack||String(e)});await diagnostic(page,'failure-setup-learning');}finally{await context?.close();}

 // First-six, first-twelve and first-eighteen published records retain their original schema.
 for(const [legacyLabel,legacyState,legacyExport]of [['first-six',firstSixState,firstSixExport],['published first-twelve',firstTwelveState,firstTwelveExport],['published first-eighteen',firstEighteenState,firstEighteenExport]]){
 let legacyContext,legacyPage;try{
  ({context:legacyContext,page:legacyPage}=await fresh({width:390,height:844},{initial:JSON.stringify(legacyState)}));
  await check('An existing '+legacyLabel+' record resumes with its notes, bookmarks and preferences intact',async()=>{
   assert.deepEqual(await state(legacyPage),legacyState);assert.equal(await legacyPage.locator('#storage-warning').isVisible(),false);
   await legacyPage.locator('#resume-reading').click();await legacyPage.waitForFunction(id=>document.querySelector('.sk-line[data-current="true"]')?.id===id,legacyState.read);
   const resumed=await state(legacyPage);assert.equal(resumed.read,legacyState.read);assert.deepEqual(resumed.notes,legacyState.notes);assert.deepEqual(resumed.bookmarks,legacyState.bookmarks);
   for(const key of ['version','mode','theme','size','pace','pronunciation'])assert.equal(resumed[key],legacyState[key]);
   assert.equal(await legacyPage.evaluate(key=>localStorage.getItem(key),JAPJI),sentinel);
  });
  await check('Ashtpadi '+lastAshtpadi+' Pauri 8 is readable and a '+legacyLabel+' backup merges without losing new learning',async()=>{
   const target=lines.find(line=>line.ashtpadi===lastAshtpadi&&line.pauri===8&&line.kind==='pauri');assert.ok(target,'The last included Pauri 8 must be present');
   await legacyPage.locator('#sk-position').click();await legacyPage.locator('#sk-dialog .sk-options').nth(data.ashtpadis.findIndex(a=>a.number===lastAshtpadi)).getByRole('button',{name:/^Pauri 8\b/}).click();
   await legacyPage.waitForFunction(n=>!document.getElementById('sk-dialog').open&&document.getElementById('sk-position').textContent.includes('Ashtpadi '+n)&&document.getElementById('sk-position').textContent.includes('Pauri 8'),lastAshtpadi);
   assert.equal(await legacyPage.locator(lineSelector(target.id)+' p.tuk').textContent(),target.gurmukhi);assert.equal(await legacyPage.locator(lineSelector(target.id)+' .simple-meaning .english').textContent(),teaching.meanings[target.id].en);
   await saveNote(legacyPage,target.id,'SYNTHETIC reflection in Ashtpadi '+lastAshtpadi+'.');await legacyPage.locator('#sk-bookmark').click();await legacyPage.waitForFunction(({KEY,id})=>JSON.parse(localStorage.getItem(KEY)||'{}').bookmarks?.includes(id),{KEY,id:target.id});await closeDialog(legacyPage);
   const before=await state(legacyPage);await tools(legacyPage);await importFile(legacyPage,legacyExport);await legacyPage.waitForFunction(()=>document.getElementById('sk-import-result').textContent.includes('merged'));
   const after=await state(legacyPage);assert.equal(after.read,before.read);assert.equal(after.read,target.id);assert.equal(after.notes[target.id],'SYNTHETIC reflection in Ashtpadi '+lastAshtpadi+'.');assert.ok(after.bookmarks.includes(target.id));
   for(const [id,note]of Object.entries(legacyExport.state.notes))assert.equal(after.notes[id],note);
   for(const id of legacyExport.state.bookmarks)assert.ok(after.bookmarks.includes(id));
   for(const key of ['version','guide','hasGuided','mode','theme','size','pace','pronunciation'])assert.equal(after[key],before[key]);
   assert.equal(await legacyPage.evaluate(key=>localStorage.getItem(key),JAPJI),sentinel);
   await closeDialog(legacyPage);await legacyPage.reload();await expectRestored(legacyPage,target.id);assert.equal((await state(legacyPage)).notes[target.id],after.notes[target.id]);
  });
 }catch(e){checks.push({name:legacyLabel+' compatibility scenario setup or execution',status:'failed',error:e.stack||String(e)});await diagnostic(legacyPage,'failure-setup-'+legacyLabel.replaceAll(' ','-')+'-compatibility');}finally{await legacyContext?.close();}

 }

 for(const [name,record]of [['corrupt','{unfinished'],['future',JSON.stringify({version:99,notes:{private:'SYNTHETIC future-format note'}})]]){
  let context,page;try{
   ({context,page}=await fresh({width:390,height:844},{initial:record}));
   await check('A '+name+' stored record remains untouched and can be recovered',async()=>{
    assert.ok(await page.locator('#storage-warning').isVisible());await tools(page);await page.locator('#sk-theme').selectOption('amrit');await closeDialog(page);await page.locator('.modes button[data-depth="understand"]').click();await tools(page);assert.equal(await raw(page),record);const ready=page.waitForEvent('download');await page.locator('#sk-export-raw').click();const file=await ready;const recovery=JSON.parse(await fs.readFile(await file.path(),'utf8'));assert.equal(recovery.raw,record);assert.equal(await page.evaluate(key=>localStorage.getItem(key),JAPJI),sentinel);
   });
  }catch(e){checks.push({name:name+'-record setup',status:'failed',error:e.stack||String(e)});await diagnostic(page,'failure-setup-'+name);}finally{await context?.close();}
 }

 // A real service worker install and genuinely offline reload in a disposable profile.
 let offlineContext,offlinePage;try{
  ({context:offlineContext,page:offlinePage}=await fresh({width:390,height:844},{serviceWorkers:'allow'}));
  await check('Versioned static shell installs with the complete expected asset set',async()=>{
   const expected=JSON.parse((await fs.readFile(path.join(root,'sw.js'),'utf8')).match(/const EXPECTED=(\{.*?\});/s)[1]);
   await offlinePage.evaluate(async()=>{await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});await Promise.race([navigator.serviceWorker.ready,new Promise((resolve,reject)=>setTimeout(()=>reject(Error('Static shell did not activate within 30 seconds.')),30000))]);});await offlinePage.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:30000});
   const count=await offlinePage.evaluate(async()=>{const names=(await caches.keys()).filter(n=>n.startsWith('glp-static:'+location.origin+'/gurbani-learning-library/:'));if(names.length!==1)throw Error('Unexpected cache count: '+names.length);return (await (await caches.open(names[0])).keys()).length;});assert.equal(count,Object.keys(expected).length);
  });
  await check('Offline reload renders all source and teaching while preserving local notes',async()=>{
   await saveNote(offlinePage,otherLine.id,'SYNTHETIC offline reflection');await closeDialog(offlinePage);const before=await raw(offlinePage);await offlineContext.setOffline(true);await offlinePage.reload();await offlinePage.waitForFunction(count=>document.querySelectorAll('.sk-line').length===count,lines.length);assert.deepEqual(await sourceSnapshot(offlinePage),sourceRows);assert.equal(await offlinePage.locator('.simple-meaning').count(),lines.length);assert.equal(await raw(offlinePage),before);await offlinePage.locator('#ashtpadi-nav a').filter({hasText:new RegExp('^'+lastAshtpadi+'$')}).click();assert.ok((await offlinePage.locator('#sk-position').innerText()).includes('Ashtpadi '+lastAshtpadi));assert.equal(await offlinePage.evaluate(key=>localStorage.getItem(key),JAPJI),sentinel);
   const leaked=await offlinePage.evaluate(async()=>{for(const name of await caches.keys()){const c=await caches.open(name);for(const req of await c.keys()){const r=await c.match(req);if((await r.text()).includes('SYNTHETIC offline reflection'))return true;}}return false;});assert.equal(leaked,false,'Private reflections must not enter the static cache');
  });
 }catch(e){checks.push({name:'Offline scenario setup or execution',status:'failed',error:e.stack||String(e)});await diagnostic(offlinePage,'failure-setup-offline');}finally{await offlineContext?.close();}
 await check('No JavaScript runtime errors across the isolated scenarios',()=>assert.deepEqual(report.runtimeErrors,[]));
}catch(e){checks.push({name:'Browser harness execution',status:'failed',error:e.stack||String(e)});}
finally{
 await browser?.close();if(server.listening)await new Promise(resolve=>server.close(resolve));
 report.completedAt=new Date().toISOString();report.passed=checks.filter(c=>c.status==='passed').length;report.failed=checks.filter(c=>c.status==='failed').length;report.status=report.failed?'failed':'passed';
 await fs.writeFile(path.join(evidence,'sukhmani-browser-verification.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:report.status,passed:report.passed,failed:report.failed,browser:report.browserVersion,failures:checks.filter(c=>c.status==='failed').map(({name,width,error})=>({name,width,error}))},null,2));
 process.exitCode=report.failed?1:0;
}
