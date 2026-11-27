// Builder browser checks for the unified library; fresh synthetic data only.
// Run with the installed desktop Chrome on macOS, or CHROMIUM_PATH elsewhere.
// Add --offline after the new shell is included in the regenerated service worker.
// Every run retains its own evidence directory, including failures.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const prefix='/library-review/';
const runId=new Date().toISOString().replace(/[:.]/g,'-');
const out=path.join(root,'evidence/library/browser',runId);
const includeOffline=process.argv.includes('--offline')||process.env.LIBRARY_OFFLINE==='1';
const themeKey='glp001.home.theme';
const canaryKey='glp001.continuous.v2';
const canary=JSON.stringify({version:2,theme:'day',hasGuided:true,notes:{'synthetic.unmapped':'SYNTHETIC library privacy canary — ਪੰਜਾਬੀ — must stay intact.'},bookmarks:['synthetic.unmapped'],read:{lineId:'synthetic.unmapped',offset:11},qaFixture:true});
const views=['today','read','explore','saved'];
const expectedReaders=[
 ['japji','full-japji.html',null],
 ['sukhmani','sukhmani.html',null],
 ['jaap','nitnem/index.html','jaap'],
 ['savaiye','nitnem/index.html','savaiye'],
 ['chaupai','nitnem/index.html','chaupai'],
 ['anand','nitnem/index.html','anand'],
 ['rehras','nitnem/index.html','rehras'],
 ['sohila','nitnem/index.html','sohila'],
 ['salok-mahalla9','salok-mahalla9/index.html','salok-mahalla9'],
 ['salok-kabir','salok-kabir/index.html','salok-kabir']
];
const report={
 schema:'glp.library-browser.v1',startedAtUtc:new Date().toISOString(),runId,
 scope:'Builder desktop browser verification of the unified library shell',
 checks:[],layouts:[],screenshots:[],runtimeErrors:[],externalRequests:[],serverErrors:[],
 offlineRequested:includeOffline,
 limitations:[
  'No physical iPhone, iPad, Safari, Home Screen, VoiceOver, TalkBack or real-user acceptance is claimed.',
  'Narrow desktop viewports and measured text enlargement are browser simulations.',
  'Offline checks, when requested, disable browser networking; this is not physical airplane-mode acceptance.',
  'Only fresh nonpersistent browser contexts and synthetic saved records are used.',
  'This is builder evidence, not independent Claude review or qualified Gurbani review.',
  'Source labels and native links do not establish theological interpretation, printed-source collation or rights clearance.'
 ]
};
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
let server,browser,origin,currentPage;
const contexts=new Set();
const cap=s=>s[0].toUpperCase()+s.slice(1);
async function check(name,fn){
 try{
  const detail=await fn();
  report.checks.push({name,status:'PASS',...(detail?{detail}:{})});
 }catch(error){
  report.checks.push({name,status:'FAIL',error:error.stack||String(error)});
  if(currentPage&&!currentPage.isClosed())try{await capture(currentPage,'failure-'+report.checks.length);}catch{}
 }
}
async function fresh({serviceWorkers='block',privacy=false,reducedMotion='reduce',viewport={width:390,height:844}}={}){
 const context=await browser.newContext({viewport,serviceWorkers,reducedMotion,acceptDownloads:false});
 contexts.add(context);
 context.on('request',request=>{
  let u;try{u=new URL(request.url());}catch{return;}
  if(/^https?:$/.test(u.protocol)&&u.origin!==origin)report.externalRequests.push(u.origin+u.pathname);
 });
 if(privacy)await context.addInitScript(({key,raw,theme})=>{
  if(localStorage.getItem(key)===null)localStorage.setItem(key,raw);
  window.__libraryStorageOps=[];
  for(const name of ['setItem','removeItem','clear']){
   const original=Storage.prototype[name];
   Storage.prototype[name]=function(...args){
    window.__libraryStorageOps.push({method:name,area:this===localStorage?'local':'session',key:name==='clear'?null:String(args[0])});
    return original.apply(this,args);
   };
  }
  const open=indexedDB.open.bind(indexedDB);
  indexedDB.open=(...args)=>{
   window.__libraryStorageOps.push({method:'indexedDB.open',key:String(args[0])});
   return open(...args);
  };
 },{key:canaryKey,raw:canary,theme:themeKey});
 const page=await context.newPage();currentPage=page;page.setDefaultTimeout(20000);
 page.on('pageerror',error=>report.runtimeErrors.push({path:new URL(page.url()).pathname,message:error.message}));
 return page;
}
async function close(page){
 const context=page.context();await context.close();contexts.delete(context);
}
async function go(page,query=''){
 currentPage=page;
 const response=await page.goto(origin+prefix+query,{waitUntil:'domcontentloaded'});
 assert.equal(response?.status(),200,'Library route must load');
 await ready(page);
 return response;
}
async function ready(page){
 await page.waitForSelector('html[data-library-state="ready"]');
}
async function assertView(page,view){
 await ready(page);
 assert.equal(await page.title(),cap(view)+' · Gurbani Learning Library');
 assert.equal(await page.locator('.library-nav a[data-view]').count(),4);
 assert.equal(await page.locator('.library-nav a[data-view][aria-current="page"]').count(),1);
 assert.equal(await page.locator('.library-nav a[data-view="'+view+'"]').getAttribute('aria-current'),'page');
 for(const other of views){
  const panel=page.locator('[data-view-panel="'+other+'"]');
  assert.equal(await panel.count(),1,other+' panel must exist once');
  assert.equal(await panel.isVisible(),other===view,other+' visibility');
  if(other!==view)assert.equal(await panel.getAttribute('hidden')!==null,true,other+' is actually hidden');
 }
 const heading=page.locator('[data-view-panel="'+view+'"] [data-view-heading]');
 assert.equal(await heading.count(),1,'Each view has one named heading');
 assert.equal(await heading.isVisible(),true);
 const focus=await page.evaluate(()=>{
  const el=document.activeElement;
  return {hiddenPanel:!!el?.closest('[data-view-panel][hidden]'),tag:el?.tagName};
 });
 assert.equal(focus.hiddenPanel,false,'Focus cannot remain in a hidden panel');
}
async function capture(page,name){
 await page.evaluate(()=>document.fonts.ready);
 const filename=name+'.png';
 await page.screenshot({path:path.join(out,filename),fullPage:false});
 report.screenshots.push(path.relative(root,path.join(out,filename)));
}
async function settle(page){
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
async function layout(page,view,width,kind='normal'){
 await page.setViewportSize({width,height:900});await settle(page);
 const value=await page.evaluate(()=>{
  const panel=[...document.querySelectorAll('[data-view-panel]')].find(n=>!n.hidden);
  const nav=document.querySelector('.library-nav');
  const rect=nav?.getBoundingClientRect();
  return {width:innerWidth,documentWidth:document.documentElement.scrollWidth,panelVisible:!!panel&&!!panel.getClientRects().length,navPosition:nav?getComputedStyle(nav).position:null,navHeight:rect?.height??null};
 });
 assert.ok(value.documentWidth<=value.width+1,view+' '+kind+' must fit '+width+'px: '+JSON.stringify(value));
 assert.ok(value.panelVisible);
 report.layouts.push({view,kind,...value});
}
async function fontSamples(page,view){
 const paragraph={today:'.today-primary p:not(.section-kicker)',read:'#reader-list p',explore:'#explore-list p',saved:'.saved-explanation p'}[view];
 const definitions=[
  {label:'active heading',selector:'[data-view-panel="'+view+'"] [data-view-heading]'},
  {label:'current navigation label',selector:'.library-nav a[data-view="'+view+'"] span'},
  {label:'active content paragraph',selector:paragraph},
  {label:view==='read'?'directory input':'appearance control',selector:view==='read'?'#library-search':'#home-theme'}
 ];
 const samples=[];
 for(const definition of definitions){
  const locator=page.locator(definition.selector).first();
  assert.equal(await locator.count(),1,definition.label+' must be present');
  assert.equal(await locator.isVisible(),true,definition.label+' must be visible');
  const pixels=await locator.evaluate(node=>parseFloat(getComputedStyle(node).fontSize));
  assert.ok(Number.isFinite(pixels)&&pixels>0,definition.label+' has a numeric rendered font size');
  samples.push({...definition,pixels});
 }
 return samples;
}
async function lastActionClear(page,view,width,kind){
 const last=page.locator('[data-view-panel="'+view+'"] a:visible').last();
 assert.ok(await last.count(),'Each entrance has an available destination');
 // A text-enlarged clickable card can be taller than the usable viewport.
 // Verify its end can be reached, rather than requiring the whole card to fit at once.
 await last.evaluate(node=>node.scrollIntoView({block:'end',inline:'nearest',behavior:'instant'}));await settle(page);
 const geometry=await last.evaluate(node=>{
  const nav=document.querySelector('.library-nav'),a=node.getBoundingClientRect(),b=nav?.getBoundingClientRect();
  const fixed=nav&&getComputedStyle(nav).position==='fixed';
  const cue=(node.querySelector('.card-action')||node).getBoundingClientRect();
  return {action:{top:a.top,bottom:a.bottom,height:a.height},cue:{top:cue.top,bottom:cue.bottom,height:cue.height},viewport:innerHeight,nav:fixed?{top:b.top,bottom:b.bottom,height:b.height}:null,
   overlap:!!fixed&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top};
 });
 assert.equal(geometry.overlap,false,'Final '+view+' action clears fixed navigation at '+width+'px ('+kind+'): '+JSON.stringify(geometry));
 assert.ok(geometry.action.bottom>0&&geometry.action.top<geometry.viewport,'Final action can be brought into the viewport');
 if(geometry.nav){
  assert.ok(geometry.action.bottom<=geometry.nav.top+1,'Final action end can be brought above fixed navigation');
  assert.ok(geometry.cue.top>=-1&&geometry.cue.bottom<=geometry.nav.top+1,'Final action label is fully visible above fixed navigation');
 }
 report.layouts.push({view,width,kind,finalAction:geometry});
}
function locatorTarget(href){
 const u=new URL(href,origin+prefix);
 assert.equal(u.origin,origin,'Native reader stays in this origin');
 assert.ok(u.pathname.startsWith(prefix),'Native reader stays in the app scope');
 return {path:u.pathname.slice(prefix.length),bani:u.searchParams.get('bani'),learning:u.searchParams.get('learning'),url:u.href};
}
function targetKey(target){return target.path+'?bani='+(target.bani??'');}
async function directoryCount(page,count){
 await page.waitForFunction(expected=>[...document.querySelectorAll('#reader-list a[data-reader-id]')].filter(n=>n.getClientRects().length>0).length===expected,count);
 assert.equal(await page.locator('#reader-list a[data-reader-id]:visible').count(),count);
}
async function mapLinks(page,selector){
 return page.locator(selector).evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.readerId??n.dataset.savedReader,href:n.getAttribute('href')})));
}
function assertNativeMap(items,{saved=false}={}){
 assert.equal(items.length,10);
 assert.equal(new Set(items.map(x=>x.id)).size,10,'Reader IDs must be unique');
 const expected=expectedReaders.map(([,p,b])=>p+'?bani='+(b??'')).sort();
 const actual=items.map(item=>{
  const target=locatorTarget(item.href);
  if(saved)assert.equal(target.learning,'saved','Saved link must request its native learning view');
  else assert.equal(target.learning,null);
  return targetKey(target);
 }).sort();
 assert.deepEqual(actual,expected,'All ten existing readers must be reachable without invented paths');
}
try{
 await fs.mkdir(out,{recursive:true});
 server=http.createServer(async(req,res)=>{
  let pathname='';
  try{
   const u=new URL(req.url,'http://localhost');pathname=u.pathname;
   if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}
   if(!pathname.startsWith(prefix)){res.writeHead(404).end();return;}
   let relative=decodeURIComponent(pathname.slice(prefix.length));if(!relative||relative.endsWith('/'))relative+='index.html';
   const filename=path.resolve(root,relative);
   if(!filename.startsWith(root+path.sep)){res.writeHead(403).end();return;}
   const data=await fs.readFile(filename);
   res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'}).end(data);
  }catch(error){
   report.serverErrors.push({path:pathname,error:error.code??String(error)});
   res.writeHead(404).end();
  }
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 origin='http://127.0.0.1:'+server.address().port;
 const executablePath=process.env.CHROMIUM_PATH||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined);
 browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
 report.browser=browser.version();

 await check('All four entrances load directly with matching title, heading and current navigation',async()=>{
  const page=await fresh();
  await go(page);await assertView(page,'today');
  for(const view of views){
   await go(page,'?view='+view);await assertView(page,view);
   const links=await page.locator('.library-nav a[data-view]').evaluateAll(nodes=>nodes.map(n=>({view:n.dataset.view,href:n.getAttribute('href')})));
   assert.deepEqual(links.map(x=>x.view).sort(),[...views].sort());
   for(const link of links){
    const url=new URL(link.href,page.url());
    assert.equal(url.origin,origin);assert.equal(url.searchParams.get('view'),link.view);
    assert.ok(!link.href.startsWith('#'),'Navigation uses ordinary shareable URLs');
   }
   await capture(page,view+'-390');
  }
  await close(page);
 });

 await check('Keyboard entrance navigation and browser Back preserve the selected view',async()=>{
  const page=await fresh();await go(page);
  const read=page.locator('.library-nav a[data-view="read"]');
  await read.focus();assert.equal(await read.evaluate(n=>n===document.activeElement),true);
  await Promise.all([page.waitForURL(url=>url.searchParams.get('view')==='read'),page.keyboard.press('Enter')]);await assertView(page,'read');
  const saved=page.locator('.library-nav a[data-view="saved"]');
  await saved.focus();await Promise.all([page.waitForURL(url=>url.searchParams.get('view')==='saved'),page.keyboard.press('Enter')]);await assertView(page,'saved');
  await page.goBack();await assertView(page,'read');
  await page.goBack();await assertView(page,'today');
  await close(page);
 });

 await check('Directory search matches whole tokens and filters seven Nitnem plus three additional readers',async()=>{
  const page=await fresh();await go(page,'?view=read');
  const search=page.locator('#library-search'),filter=page.locator('#read-filter');
  await directoryCount(page,10);
  for(const [query,count] of [['NASA',0],['category',0],['ha',0],['salok',2],['japji',1],['',10]]){
   await search.fill(query);await directoryCount(page,count);
  }
  await filter.selectOption('nitnem');await directoryCount(page,7);
  await filter.selectOption('additional');await directoryCount(page,3);
  await filter.selectOption('all');await directoryCount(page,10);
  await search.fill('japji');await filter.selectOption('nitnem');await directoryCount(page,1);
  const current=new URL(page.url());
  assert.equal(current.searchParams.get('view'),'read');
  assert.equal(current.searchParams.get('q'),'japji');
  assert.equal(current.searchParams.get('collection'),'nitnem');
  await page.reload();await ready(page);await assertView(page,'read');
  assert.equal(await search.inputValue(),'japji');assert.equal(await filter.inputValue(),'nitnem');await directoryCount(page,1);
  await page.locator('#reader-list a[data-reader-id]').click();
  await page.waitForFunction(()=>window.GLP_CONTINUOUS_DEBUG?.lineCount===385);
  assert.equal(new URL(page.url()).pathname, prefix+'full-japji.html');
  assert.equal(await page.locator('#continuous-reader').getAttribute('data-source-integrity'),'verified');
  await page.goBack();await assertView(page,'read');
  assert.equal(await search.inputValue(),'japji');assert.equal(await filter.inputValue(),'nitnem');await directoryCount(page,1);
  await close(page);
 });

 await check('Read and Saved link to the same ten native readers with separate saved-entry intent',async()=>{
  const page=await fresh();await go(page,'?view=read');
  const readers=await mapLinks(page,'#reader-list a[data-reader-id]');assertNativeMap(readers);
  await go(page,'?view=saved');
  const saved=await mapLinks(page,'#saved-list a[data-saved-reader]');assertNativeMap(saved,{saved:true});
  assert.deepEqual(saved.map(x=>x.id).sort(),readers.map(x=>x.id).sort());
  // Inspect a native Salok link in a fresh context without creating or importing a record.
  const kabir=readers.find(x=>locatorTarget(x.href).bani==='salok-kabir');
  await page.goto(new URL(kabir.href,origin+prefix).href,{waitUntil:'domcontentloaded'});
  // The frozen native reader exposes its current occurrence in the DOM, not a QA global.
  const current=page.locator('.scripture-line[aria-current="location"]');
  await current.waitFor({state:'visible'});
  const pack=JSON.parse(await fs.readFile(path.join(root,'salok-kabir/data/salok-kabir.json'),'utf8'));
  assert.equal(await current.getAttribute('data-line-id'),pack.units[0].lines[0].id);
  assert.equal(new URL(page.url()).searchParams.get('bani'),'salok-kabir');
  await close(page);
 });

 await check('Explore exposes existing source sheets and places without publishing the blocked knowledge pilot',async()=>{
  const page=await fresh();await go(page,'?view=explore');
  const links=await page.locator('#explore-list a[data-explore-id]').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.exploreId,href:n.getAttribute('href')})));
  assert.ok(links.length>=2);
  assert.equal(new Set(links.map(x=>x.id)).size,links.length);
  const paths=links.map(link=>new URL(link.href,page.url()).pathname);
  assert.ok(paths.includes(prefix+'articles/index.html'));
  assert.ok(paths.includes(prefix+'gurdwaras.html'));
  assert.ok(paths.every(p=>!p.includes('/knowledge/')&&!p.includes('/hukamnama/')));
  const sheets=links.find(x=>new URL(x.href,page.url()).pathname===prefix+'articles/index.html');
  await page.goto(new URL(sheets.href,page.url()).href,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('html[data-source-state="ready"]');
  assert.equal(await page.locator('a[data-article-id]:visible').count(),2);
  await page.goBack();await assertView(page,'explore');
  await close(page);
 });

 await check('Library keeps source scripture out of its directory and carries qualified-review limits',async()=>{
  const page=await fresh();
  const samples=[];
  for(const name of ['salok-mahalla9','salok-kabir']){
   const pack=JSON.parse(await fs.readFile(path.join(root,name,'data',name+'.json'),'utf8'));
   samples.push(...pack.units.flatMap(u=>u.lines.map(l=>l.text)).filter(text=>text.length>=30).slice(0,3));
  }
  for(const view of views){
   await go(page,'?view='+view);
   assert.equal(await page.locator('.scripture-line,.source-line,[data-line-id]').count(),0);
   const text=await page.locator('body').innerText();
   for(const sample of samples)assert.equal(text.includes(sample),false,'The directory must not duplicate source lines');
   assert.match(text,/qualified(?:\s+\w+){0,3}\s+review/i);
   assert.doesNotMatch(text,/\b(?:scholar[- ]approved|authoritative translation|fully authenticated scripture|verified meanings)\b/i);
  }
  await close(page);
 });

 await check('Every entrance fits all widths and actual 200 percent text, with actions clear of fixed navigation',async()=>{
  const page=await fresh();
  for(const view of views){
   await go(page,'?view='+view);
   for(const width of [320,390,820,1440])await layout(page,view,width);
   for(const width of [320,390]){
    await page.setViewportSize({width,height:900});
    await page.evaluate(()=>document.documentElement.style.fontSize='');await settle(page);
    const before=await fontSamples(page,view);
    await layout(page,view,width,'normal-mobile');
    await lastActionClear(page,view,width,'normal-mobile');
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');await settle(page);
    const after=await fontSamples(page,view);
    const comparisons=before.map((sample,index)=>{
     const enlarged=after[index];
     assert.equal(enlarged.label,sample.label);
     const ratio=enlarged.pixels/sample.pixels;
     assert.ok(ratio>=1.95&&ratio<=2.05,view+' '+width+'px '+sample.label+' must actually double: '+JSON.stringify({before:sample.pixels,after:enlarged.pixels,ratio}));
     return {label:sample.label,selector:sample.selector,beforePx:sample.pixels,afterPx:enlarged.pixels,ratio};
    });
    (report.fontScaling??=[]).push({view,width,comparisons});
    await layout(page,view,width,'measured-text-200-percent');
    await lastActionClear(page,view,width,'measured-text-200-percent');
    if(view==='read'||view==='today'){
     await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await settle(page);
     await capture(page,view+'-text-200-'+width);
    }
    await page.evaluate(()=>document.documentElement.style.fontSize='');await settle(page);
   }
  }
  await go(page,'?view=read');
  await page.setViewportSize({width:390,height:844});
  // Explicitly choose the persisted appearance even if the clock defaults to dark.
  if(await page.locator('body').getAttribute('data-theme')==='amrit')await page.locator('#home-theme').click();
  await page.locator('#home-theme').click();
  assert.equal(await page.locator('#home-theme').getAttribute('aria-pressed'),'true');
  await capture(page,'read-dark-390');
  await page.reload();await ready(page);
  assert.equal(await page.locator('body').getAttribute('data-theme'),'amrit');
  assert.equal(await page.evaluate(()=>localStorage.getItem('glp001.home.theme')),'amrit');
  await page.emulateMedia({reducedMotion:'reduce'});await settle(page);
  assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);
  const animations=await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running'&&a.effect?.getTiming().iterations===Infinity).length);
  assert.equal(animations,0,'Reduced motion has no perpetual decorative animation');
  await close(page);
 });

 await check('Library visits and theme changes preserve synthetic reader data and create no learning or tracking store',async()=>{
  const page=await fresh({privacy:true});
  const writes=[];
  for(const view of views){
   await go(page,'?view='+view);
   await page.locator('#home-theme').click();
   assert.equal(await page.evaluate(key=>localStorage.getItem(key),canaryKey),canary);
   assert.equal((await page.locator('body').innerText()).includes('SYNTHETIC library privacy canary'),false,'The shell does not expose private reflection content');
   const ops=await page.evaluate(()=>window.__libraryStorageOps);writes.push(...ops);
   assert.ok(ops.every(op=>op.method==='setItem'&&op.area==='local'&&op.key==='glp001.home.theme'),JSON.stringify(ops));
   assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage).sort()),[canaryKey,themeKey].sort());
   assert.equal(await page.evaluate(()=>sessionStorage.length),0);
  }
  assert.equal((await page.context().cookies()).length,0);
  await close(page);
  return {readerRecordPreserved:true,allowedWrittenKey:themeKey,themeWrites:writes.length};
 });

 if(includeOffline){
  await check('The actual hashed worker serves every entrance and directory state without browser networking',async()=>{
   const page=await fresh({serviceWorkers:'allow'});await go(page);
   await page.waitForFunction(()=>navigator.serviceWorker.controller!==null,null,{timeout:60000});
   const cachesBefore=await page.evaluate(async()=>{
    const names=await caches.keys();const paths=[];
    for(const name of names){const cache=await caches.open(name);for(const req of await cache.keys())paths.push(new URL(req.url).pathname);}
    return {names,paths};
   });
   assert.ok(cachesBefore.paths.includes(prefix+'index.html'));
   assert.ok(cachesBefore.paths.some(p=>p.includes('/library/')&&p.endsWith('.mjs')),'Library modules are in the real offline shell');
   await page.context().setOffline(true);
   for(const view of views){
    const response=await go(page,'?view='+view);assert.equal(response.fromServiceWorker(),true);
    await assertView(page,view);
   }
   await go(page,'?view=read&q=salok&collection=all');
   await directoryCount(page,2);
   await page.locator('.library-nav a[data-view="explore"]').click();await assertView(page,'explore');
   const actualLinks=await page.locator('#explore-list a[data-explore-id]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
   const href=actualLinks.find(x=>new URL(x,origin+prefix).pathname===prefix+'articles/index.html');
   assert.ok(href);
   await page.goto(new URL(href,origin+prefix).href,{waitUntil:'domcontentloaded'});
   await page.waitForSelector('html[data-source-state="ready"]');
   assert.equal(await page.locator('a[data-article-id]:visible').count(),2);
   await close(page);
   return {cacheNames:cachesBefore.names,network:'Browser network disabled; no physical-device claim'};
  });
 }else{
  report.checks.push({name:'Offline manifest integration',status:'NOT_RUN',reason:'Run with --offline after the root regenerates the service worker; no offline result is claimed.'});
 }

 await check('All examined library behavior produced no external requests or uncaught runtime errors',async()=>{
  assert.deepEqual(report.externalRequests,[]);
  assert.deepEqual(report.runtimeErrors,[]);
  assert.deepEqual(report.serverErrors,[]);
 });
}catch(error){
 report.fatal=error.stack||String(error);
}finally{
 for(const context of contexts)try{await context.close();}catch{}
 if(browser)await browser.close();
 if(server)await new Promise(resolve=>server.close(resolve));
 report.finishedAtUtc=new Date().toISOString();
 report.result=report.fatal||report.checks.some(c=>c.status==='FAIL')?'FAIL':'PASS_ON_RUN_CHECKS';
 report.offlineResult=includeOffline?(report.checks.find(c=>c.name.startsWith('The actual hashed worker'))?.status??'NOT_REACHED'):'NOT_RUN';
 await fs.mkdir(out,{recursive:true});
 await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({result:report.result,offlineResult:report.offlineResult,browser:report.browser,evidence:path.relative(root,path.join(out,'report.json')),checks:report.checks.map(c=>({name:c.name,status:c.status,...(c.error?{error:c.error}:{}),...(c.reason?{reason:c.reason}:{})})),fatal:report.fatal},null,2));
 if(report.result==='FAIL')process.exitCode=1;
}
