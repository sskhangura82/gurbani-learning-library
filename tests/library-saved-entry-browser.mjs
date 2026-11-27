// Native Saved-entry checks. Synthetic local records in disposable desktop-browser contexts.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const out=path.join(root,'evidence/library-saved-entry');
const prefix='/gurbani-learning-library/';
const note='SYNTHETIC library Saved entry — ਪੰਜਾਬੀ — preserve this exact reflection.';
const otherKey='glp001.synthetic.other-reader',otherValue='SYNTHETIC other reader record — unchanged.';
const report={startedAt:new Date().toISOString(),scope:'Builder desktop browser checks with synthetic records only',checks:[],runtimeErrors:[],
  limitations:['Not physical iPhone, Safari, Home Screen, VoiceOver or airplane-mode acceptance.','No production or personal browser profile is used.','Independent Claude review is separate.']};
function dataScript(bytes,name){const context={window:{}};vm.runInNewContext(bytes,context,{timeout:3000});return JSON.parse(JSON.stringify(context.window[name]));}
const japji=dataScript(await fs.readFile(path.join(root,'js/japji-full-data.js'),'utf8'),'GLP_FULL_JAPJI');
const jl=japji.units.flatMap(u=>u.lines),jp=jl.find(l=>l.id==='pauri20.line01')||jl[200],jn=jl[3];
const sukhmani=dataScript(await fs.readFile(path.join(root,'js/sukhmani-data.js'),'utf8'),'GLP_SUKHMANI');
const sl=sukhmani.ashtpadis.flatMap(a=>a.lines),sp=sl.find(l=>l.id==='sukhmani.a06.p07.l03'),sn=sl.find(l=>l.id==='sukhmani.a02.p08.l05');
const readers=[
  {id:'japji',href:'full-japji.html',key:'glp001.continuous.v2',noteId:jn.id,position:jp.id,
    record:{version:2,read:{id:jp.id,offset:0},guide:{index:200,token:0},hasGuided:true,mode:'read',theme:'day',size:30,pace:70,bookmarks:[],notes:{[jn.id]:note}},
    sourceGlobal:'GLP_FULL_JAPJI'},
  {id:'sukhmani',href:'sukhmani.html',key:'glp001.sukhmani.v1',noteId:sn.id,position:sp.id,
    record:{version:2,read:sp.id,guide:sp.id,hasGuided:true,mode:'read',theme:'day',size:30,pace:70,pronunciation:false,bookmarks:[],notes:{[sn.id]:note}},
    sourceGlobal:'GLP_SUKHMANI'}
];
for(const [id,folder]of [['sohila','nitnem'],['salok-mahalla9','salok-mahalla9'],['salok-kabir','salok-kabir']]){
  const pack=JSON.parse(await fs.readFile(path.join(root,folder,'data',id+'.json'),'utf8'));
  const lines=pack.units.flatMap(u=>u.lines),position=pack.units[Math.min(2,pack.units.length-1)].lines[0].id,noteId=lines[1].id;
  readers.push({id,href:folder+'/index.html?bani='+id,key:'glp001.nitnem.PRIVATE-SOURCE-REVIEW.v1.'+id+'.'+pack.editionId,noteId,position,
    sourcePath:folder+'/data/'+id+'.json',record:{schema:1,compositionId:id,editionId:pack.editionId,rev:7,savedAt:'2026-11-26T00:00:00.000Z',
      payload:{lineId:position,size:30,theme:'day',pace:70,mode:'read',view:'continuous',bookmarks:[],notes:{[noteId]:note}}}});
}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
    if(!pathname.startsWith(prefix)){res.writeHead(404);res.end();return;}
    let relative=pathname.slice(prefix.length);if(!relative||relative.endsWith('/'))relative+='index.html';
    const filename=path.resolve(root,relative);
    if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    const bytes=await fs.readFile(filename);res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'text/plain','Cache-Control':'no-store'});res.end(bytes);
  }catch{res.writeHead(404);res.end();}
});
await fs.mkdir(out,{recursive:true});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
report.browser=browser.version();
let currentPage;
async function check(name,fn){
  try{await fn();report.checks.push({name,status:'PASS'});}
  catch(e){report.checks.push({name,status:'FAIL',error:e.stack||String(e)});
    if(currentPage&&!currentPage.isClosed())await currentPage.screenshot({path:path.join(out,'failure-'+report.checks.length+'.png')}).catch(()=>{});}
}
function target(r,query='learning=saved'){return r.href+(r.href.includes('?')?'&':'?')+query;}
async function fresh(r,{record=r.record,query='learning=saved',sourceFailure=false}={}){
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:'reduce',serviceWorkers:'block'});
  const raw=record===null?null:typeof record==='string'?record:JSON.stringify(record);
  await context.addInitScript(({key,raw,otherKey,otherValue,sourceGlobal,sourceFailure})=>{
    if(raw!==null&&localStorage.getItem(key)===null)localStorage.setItem(key,raw);
    if(localStorage.getItem(otherKey)===null)localStorage.setItem(otherKey,otherValue);
    if(sourceFailure&&sourceGlobal){
      let value;
      Object.defineProperty(window,sourceGlobal,{configurable:true,get:()=>value,set:v=>{
        value=JSON.parse(JSON.stringify(v));
        const line=sourceGlobal==='GLP_FULL_JAPJI'?value.units[0].lines[0]:value.ashtpadis[0].lines[0];
        if(sourceGlobal==='GLP_FULL_JAPJI')line.text+='x';else line.gurmukhi+='x';
      }});
    }
  },{key:r.key,raw,otherKey,otherValue,sourceGlobal:r.sourceGlobal,sourceFailure});
  if(sourceFailure&&r.sourcePath)await context.route('**/'+r.sourcePath,async route=>{
    const bytes=await fs.readFile(path.join(root,r.sourcePath));await route.fulfill({status:200,contentType:'application/json',body:Buffer.concat([bytes,Buffer.from(' ')])});
  });
  const page=await context.newPage();currentPage=page;page.setDefaultTimeout(20000);
  page.on('pageerror',e=>report.runtimeErrors.push({reader:r.id,message:e.message}));
  const response=await page.goto(origin+prefix+target(r,query),{waitUntil:'load'});assert.equal(response.status(),200);
  if(sourceFailure){
    if(r.sourceGlobal)await page.waitForSelector((r.id==='japji'?'#continuous-reader':'#sukhmani-text')+'[data-source-integrity=failed]');
    else await page.waitForFunction(()=>document.querySelector('#collection-status').textContent.startsWith('This bani could not load:'));
  }else{
    if(r.id==='japji')await page.waitForFunction(()=>window.GLP_CONTINUOUS_DEBUG?.lineCount===385);
    else if(r.id==='sukhmani')await page.waitForSelector('#sukhmani-text[data-source-integrity=verified] .sk-line');
    else await page.waitForFunction(()=>window.NITNEM_INTERNAL_QA?.getState().sourceVerified===true);
  }
  return {context,page,raw};
}
async function stored(page,r){return page.evaluate(key=>localStorage.getItem(key),r.key);}
async function visibleSaved(page,r){
  if(r.id==='japji')return await page.locator('#reader-dialog').getAttribute('open')!==null&&await page.locator('#dialog-title').textContent()==='Saved learning';
  if(r.id==='sukhmani')return await page.locator('#sk-dialog').getAttribute('open')!==null&&await page.locator('#sk-dialog-title').textContent()==='Saved learning';
  return await page.locator('#tools-dialog').getAttribute('open')!==null&&await page.locator('#saved-lines').getAttribute('open')!==null;
}
async function noSaved(page,r){assert.equal(await visibleSaved(page,r),false);}
async function preserves(page,r){
  const value=JSON.parse(await stored(page,r)),payload=value.payload||value;
  assert.equal(payload.notes[r.noteId],note);assert.deepEqual(payload.bookmarks,[]);
  assert.equal(r.id==='japji'?payload.read.id:r.id==='sukhmani'?payload.read:payload.lineId,r.position);
  assert.equal(await page.evaluate(k=>localStorage.getItem(k),otherKey),otherValue);
  if(r.id==='japji')assert.equal(await page.evaluate(()=>GLP_CONTINUOUS_DEBUG.isPlaying()),false);
  else if(r.id==='sukhmani')assert.equal(await page.locator('#sk-play').getAttribute('aria-pressed'),'false');
  else assert.equal(await page.evaluate(()=>NITNEM_INTERNAL_QA.getState().playing),false);
}
try{
  for(const r of readers){
    await check(r.id+': Saved opens directly, lists note without bookmark, preserves reading place and other store',async()=>{
      const {context,page}=await fresh(r);
      try{
        await page.waitForFunction(({id})=>{
          if(id==='japji')return document.querySelector('#reader-dialog').open&&document.querySelector('#dialog-title').textContent==='Saved learning';
          if(id==='sukhmani')return document.querySelector('#sk-dialog').open&&document.querySelector('#sk-dialog-title').textContent==='Saved learning';
          return document.querySelector('#tools-dialog').open&&document.querySelector('#saved-lines').open;
        },{id:r.id});
        await preserves(page,r);
        if(r.id==='japji'){assert.equal(await page.locator('#dialog-body .menu-list button').count(),1);assert.match(await page.locator('#dialog-body .menu-list').innerText(),/Reflection/);assert.equal(await page.locator('#dialog-body .file-import').innerText(),'Import or merge Japji learning, including earlier Japji notebooks');}
        else if(r.id==='sukhmani'){assert.equal(await page.locator('.sk-saved-list button').count(),1);assert.match(await page.locator('.sk-saved-list').innerText(),/Reflection saved/);}
        else{assert.equal(await page.locator('#saved-list button[data-saved-line="'+r.noteId+'"]').count(),1);assert.equal(await page.evaluate(()=>document.activeElement?.parentElement?.id),'saved-lines');}
        if(r.id==='japji'||r.id==='salok-kabir')await page.screenshot({path:path.join(out,r.id+'-saved-390.png')});
      }finally{await context.close();}
    });
    await check(r.id+': empty learning opens honest empty Saved state',async()=>{
      const {context,page}=await fresh(r,{record:null});
      try{await page.waitForFunction(id=>id==='japji'?document.querySelector('#reader-dialog').open:id==='sukhmani'?document.querySelector('#sk-dialog').open:document.querySelector('#saved-lines').open,r.id);
        assert.equal(await visibleSaved(page,r),true);
        const text=await page.locator(r.id==='japji'?'#dialog-body':r.id==='sukhmani'?'#sk-dialog-body':'#saved-list').innerText();
        assert.match(text,/No saved lines or reflections yet|No bookmarks or reflections yet|will appear here/);
      }finally{await context.close();}
    });
    await check(r.id+': damaged saved record is preserved and recovery warning stays visible',async()=>{
      const corrupt='{"SYNTHETIC damaged record":';
      const {context,page}=await fresh(r,{record:corrupt});
      try{await noSaved(page,r);assert.equal(await stored(page,r),corrupt);
        const warning=page.locator(r.id==='japji'?'#learning-recovery':r.id==='sukhmani'?'#storage-warning':'#learning-status');
        if(r.id==='japji')assert.match(await page.locator('body').innerText(),/preserv|recovery|could not|unavailable/i);
        else{assert.equal(await warning.isVisible(),true);assert.match(await warning.innerText(),/preserv|could not|Unexpected|JSON/i);}
      }finally{await context.close();}
    });
    await check(r.id+': source failure cannot open Saved or overwrite original learning',async()=>{
      const {context,page,raw}=await fresh(r,{sourceFailure:true});
      try{await noSaved(page,r);assert.equal(await stored(page,r),raw);
        if(r.id==='japji')assert.equal(await page.locator('#continuous-reader .gurbani-line').count(),0);
        else if(r.id==='sukhmani')assert.equal(await page.locator('#sukhmani-text .sk-line').count(),0);
        else assert.equal(await page.locator('#reader').isVisible(),false);
      }finally{await context.close();}
    });
  }
  for(const r of [readers[0],readers[1],readers[2]]){
    for(const query of ['learning=other','learning=Saved','learning=saved&learning=saved']){
      await check(r.id+': ignores nonexact/duplicate query '+query,async()=>{
        const {context,page}=await fresh(r,{query});
        try{await noSaved(page,r);assert.equal(JSON.parse(await stored(page,r)).payload?.notes[r.noteId]||JSON.parse(await stored(page,r)).notes[r.noteId],note);}
        finally{await context.close();}
      });
    }
  }
  await check('Nitnem Saved entry ignores unrelated unit and preserves selected occurrence',async()=>{
    const r=readers[2],{context,page}=await fresh(r,{query:'learning=saved&unit=1'});
    try{await page.waitForSelector('#saved-lines[open]');await preserves(page,r);}
    finally{await context.close();}
  });
  for(const href of ['nitnem/index.html?learning=saved','nitnem/index.html?bani=missing&learning=saved','nitnem/index.html?bani=sohila&bani=anand&learning=saved']){
    await check('Missing/unknown/ambiguous composition never auto-opens Saved: '+href,async()=>{
      const r={...readers[2],href},context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
      try{const page=await context.newPage();currentPage=page;await page.goto(origin+prefix+href,{waitUntil:'networkidle'});assert.equal(await page.locator('#tools-dialog').getAttribute('open'),null);}
      finally{await context.close();}
    });
  }
  await check('Browser Back returns to the library Saved URL',async()=>{
    const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
    try{const page=await context.newPage();currentPage=page;await page.goto(origin+prefix+'index.html?view=saved');
      await page.goto(origin+prefix+'full-japji.html?learning=saved');await page.waitForSelector('#reader-dialog[open]');
      await page.goBack();assert.equal(new URL(page.url()).searchParams.get('view'),'saved');assert.equal(new URL(page.url()).pathname,prefix+'index.html');
    }finally{await context.close();}
  });
  assert.equal(report.runtimeErrors.length,0,'No uncaught runtime errors');
}catch(e){report.fatal=e.stack||String(e);}
finally{
  report.finishedAt=new Date().toISOString();
  report.result=!report.fatal&&report.checks.every(c=>c.status==='PASS')?'PASS':'FAIL';
  await fs.writeFile(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();await new Promise(resolve=>server.close(resolve));
  console.log(JSON.stringify({result:report.result,checks:report.checks,errors:report.runtimeErrors,fatal:report.fatal},null,2));
  if(report.result!=='PASS')process.exitCode=1;
}
