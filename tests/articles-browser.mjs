// Actual desktop Chromium checks on synthetic localhost data; no physical-device acceptance.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))),prefix='/article-review/';
const out=path.join(root,'evidence/articles'),pdfOut=path.join(out,'print');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.mjs':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webmanifest':'application/manifest+json'};
const cases=[
 {id:'haumai-source-sheet',composition:'salok-mahalla9',ordinal:19,ref:'glp.article-ref.salok-mahalla9.019'},
 {id:'dubidha-source-sheet',composition:'salok-kabir',ordinal:25,ref:'glp.article-ref.salok-kabir.025'}
];
for(const c of cases){
 const pack=JSON.parse(await fs.readFile(path.join(root,c.composition,'data',c.composition+'.json'),'utf8'));
 c.unit=pack.units.find(unit=>unit.id==='sggs.'+c.composition+'.salok'+String(c.ordinal).padStart(3,'0'));
 assert.ok(c.unit);
}
const report={startedAt:new Date().toISOString(),engine:'Desktop Chromium',checks:[],runtimeErrors:[],screenshots:[],pdfs:[],limitations:[
 'Desktop Chromium at narrow and wide viewport sizes. No physical iPhone, Safari, iPad, VoiceOver, or actual-user acceptance is claimed.',
 'Offline is browser network emulation, not a physical airplane-mode check.',
 'Print PDFs require separate extraction, page grouping and visual glyph inspection. Browser layout checks alone do not establish print quality.',
 'Source checks preserve a pinned digital edition; they do not establish theological meaning, independent textual lineage, thematic completeness or qualified review.'
]};
let server,browser,origin;
const contexts=[];
async function check(name,fn){
 try{await fn();report.checks.push({name,status:'PASS'});}
 catch(error){report.checks.push({name,status:'FAIL',error:error.stack||String(error)});}
}
async function fresh({route,offline=false,viewport={width:390,height:844}}={}){
 const context=await browser.newContext({viewport,serviceWorkers:offline?'allow':'block',reducedMotion:'reduce'});contexts.push(context);
 await context.addInitScript(()=>{
  window.__articlePrivacy={reads:0,writes:0,removes:0,clears:0};
  for(const [name,count] of [['getItem','reads'],['setItem','writes'],['removeItem','removes'],['clear','clears']]){
   const original=Storage.prototype[name];
   Storage.prototype[name]=function(...args){window.__articlePrivacy[count]++;return original.apply(this,args);};
  }
 });
 const page=await context.newPage();page.setDefaultTimeout(15000);
 page.on('pageerror',error=>report.runtimeErrors.push(error.message));
 if(route)await page.route('**/*',route);
 return page;
}
async function open(page,relative='articles/index.html'){
 await page.goto(origin+prefix+relative);
 await page.waitForFunction(()=>['ready','unavailable'].includes(document.documentElement.dataset.sourceState));
}
async function ready(page){await page.waitForFunction(()=>['ready','unavailable'].includes(document.documentElement.dataset.sourceState));assert.equal(await page.locator('html').getAttribute('data-source-state'),'ready');assert.equal(await page.locator('#article-error').isVisible(),false);}
async function unavailable(page){
 assert.equal(await page.locator('html').getAttribute('data-source-state'),'unavailable');
 assert.equal(await page.locator('#article-error').isVisible(),true);
 assert.equal(await page.locator('.source-line').count(),0);
 if(await page.locator('#print-article').count())assert.equal(await page.locator('#print-article').isDisabled(),true);
 assert.equal(await page.locator('a[data-article-id]:visible').count(),0);
}
async function capture(page,name){
 await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:path.join(out,name),fullPage:false});report.screenshots.push('evidence/articles/'+name);
}
async function noOverflow(page,width){
 await page.setViewportSize({width,height:900});
 const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
 assert.ok(layout.scroll<=layout.width+1,JSON.stringify(layout));
}
async function verifiedReleaseCache(page){
 const worker=await fs.readFile(path.join(root,'sw.js'),'utf8');
 const expected=JSON.parse(worker.match(/const EXPECTED=(\{[^\n]+\});/)[1]);
 const version=worker.match(/const VERSION="([^"]+)";/)[1];
 // Required new graph and complete Nitnem sources must not disappear merely
 // because a regenerated manifest omits them. Existing surface-specific checks remain below.
 for(const asset of [
  './library/app.bundle.mjs','./articles/app.bundle.mjs','./knowledge/','./knowledge/index.html',
  './knowledge/style.css','./knowledge/app.bundle.mjs','./knowledge/scripture.json','./knowledge/pilot.json',
  ...['jaap','savaiye','chaupai','anand','rehras','sohila'].map(name=>'./nitnem/data/'+name+'.json')
 ])assert.ok(Object.hasOwn(expected,asset),'Required offline asset: '+asset);
 const rows=[];
 for(const [asset,digest]of Object.entries(expected)){
  const filename=path.join(root,asset.endsWith('/')?asset+'index.html':asset);
  assert.equal(createHash('sha256').update(await fs.readFile(filename)).digest('hex'),digest,'Manifest must match actual release bytes: '+asset);
  const url=new URL(asset,origin+prefix+'sw.js');url.searchParams.set('glp_release',version);
  rows.push({url:url.href,sha256:digest});
 }
 rows.sort((a,b)=>a.url.localeCompare(b.url));
 const cache=await page.evaluate(async()=>{
  const names=await caches.keys(),cache=await caches.open(names[0]),keys=await cache.keys();
  const rows=await Promise.all(keys.map(async request=>{
   const response=await cache.match(request),digest=await crypto.subtle.digest('SHA-256',await response.arrayBuffer());
   return {url:request.url,sha256:Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('')};
  }));
  return {names,paths:keys.map(request=>new URL(request.url).pathname),rows:rows.sort((a,b)=>a.url.localeCompare(b.url))};
 });
 assert.deepEqual(cache.names,['glp-static:'+origin+prefix+':'+version]);
 assert.deepEqual(cache.rows,rows,'Every cache URL, release query and response body must match the current release');
 return cache;
}

async function mutationPage(modify,target='articles/catalog.json',html=false){
 return fresh({route:async route=>{
  const pathname=new URL(route.request().url()).pathname;
  if(pathname===prefix+target){
   const original=await fs.readFile(path.join(root,target),'utf8');
   const body=html?modify(original):JSON.stringify(modify(JSON.parse(original)));
   await route.fulfill({status:200,contentType:html?'text/html; charset=utf-8':'application/json; charset=utf-8',body});
  }else await route.continue();
 }});
}
try{
 await fs.mkdir(pdfOut,{recursive:true});
 server=http.createServer(async(req,res)=>{
  try{
   const u=new URL(req.url,'http://localhost');
   if(u.pathname==='/favicon.ico'){res.writeHead(204).end();return;}
   if(!u.pathname.startsWith(prefix)){res.writeHead(404).end();return;}
   let relative=decodeURIComponent(u.pathname.slice(prefix.length));if(!relative||relative.endsWith('/'))relative+='index.html';
   const file=path.resolve(root,relative);
   if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
   res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(await fs.readFile(file));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 report.browserVersion=browser.version();
 const index=await fresh();
 await check('Index shows two source sheets only after complete source resolution',async()=>{
  await open(index);await ready(index);
  assert.equal(await index.locator('a[data-article-id]:visible').count(),2);
  assert.match(await index.locator('#review-notice').textContent(),/awaiting qualified review/i);
  assert.equal(await index.locator('audio,video,iframe').count(),0);
  await capture(index,'index-390.png');
  await index.locator('#topic-list').evaluate(node=>node.scrollIntoView({block:'center',behavior:'instant'}));
  await capture(index,'index-cards-390.png');
 });
 await check('Search matches complete named words and Gurmukhi tokens without the old substring false matches',async()=>{
  const input=index.locator('#article-search');
  for(const [query,expected] of [['NASA',0],['category',0],['ha',0],['!!!',0],['Haumai',1],['ego',1],['ਹਉਮੈ',1],['duality',1],['ਦੁਬਿਧਾ',1],['duality unrelated',0],['',2]]){
   await input.fill(query);assert.equal(await index.locator('a[data-article-id]:visible').count(),expected,query);
  }
  await input.fill('duality');
  await index.locator('a[data-article-id="dubidha-source-sheet"]').click();await ready(index);
  assert.equal(await index.locator('#article-content').getAttribute('data-article-id'),'dubidha-source-sheet');
  await index.goBack();await index.waitForFunction(()=>document.documentElement.dataset.sourceState==='ready');
  assert.equal(await input.inputValue(),'duality');assert.equal(await index.locator('a[data-article-id]:visible').count(),1);
 });
 const pages=[];
 for(const c of cases){
  const page=await fresh();pages.push(page);
  await check(c.id+': exact complete Salok, source identity and empty explanation appear together',async()=>{
   await open(page,'articles/article.html?id='+c.id);await ready(page);
   assert.equal(await page.locator('#article-content').getAttribute('data-article-id'),c.id);
   assert.equal(await page.locator('.pair[data-reference-id="'+c.ref+'"]').count(),1);
   const lines=await page.locator('.source-line').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.lineId,text:node.textContent,lang:node.lang})));
   assert.deepEqual(lines,c.unit.lines.map(line=>({id:line.id,text:line.text,lang:'pa'})));
   assert.equal(await page.locator('.explanation-slot').count(),1);
   assert.match(await page.locator('.explanation-slot').textContent(),/No explanation has been written/);
   assert.match(await page.locator('#source-register').textContent(),/not an independent textual witness/);
   assert.match(await page.locator('#source-register').textContent(),/No qualified reviewer/);
   assert.match(await page.locator('#source-register').textContent(),new RegExp(c.ref.replaceAll('.','\\.')));
   assert.equal(await page.locator('#print-article').isEnabled(),true);
   const allText=await page.locator('#article-content').textContent();
   assert.doesNotMatch(allText,/Ang\s+\d/);
   const invalidLang=await page.evaluate(()=>{
    const walker=document.createTreeWalker(document.querySelector('#article-content'),NodeFilter.SHOW_TEXT);
    const bad=[];while(walker.nextNode()){const node=walker.currentNode;if(/[\u0A00-\u0A7F]/.test(node.textContent)&&node.parentElement.closest('[lang]')?.lang!=='pa')bad.push(node.textContent);}
    return bad;
   });assert.deepEqual(invalidLang,[]);
  });
  await check(c.id+': fits narrow, tablet and desktop layouts including enlarged text',async()=>{
   for(const width of [320,390,820,1440])await noOverflow(page,width);
   await page.setViewportSize({width:390,height:844});
   await page.evaluate(()=>document.documentElement.style.fontSize='200%');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.evaluate(()=>document.documentElement.style.fontSize='');
   await capture(page,c.id+'-390.png');
   await page.locator('.pair').evaluate(node=>node.scrollIntoView({block:'start',behavior:'instant'}));
   await capture(page,c.id+'-passage-390.png');
   const target=await page.locator('#print-article').boundingBox();assert.ok(target.height>=44);
  });
  await check(c.id+': print begins only on explicit activation and produces A4 and Letter evidence',async()=>{
   await page.evaluate(()=>{window.__printCalls=0;window.print=()=>window.__printCalls++;});
   assert.equal(await page.evaluate(()=>window.__printCalls),0);
   await page.locator('#print-article').focus();await page.keyboard.press('Enter');
   assert.equal(await page.evaluate(()=>window.__printCalls),1);
   await page.emulateMedia({media:'print'});await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('#print-article').isVisible(),false);
   assert.equal(await page.locator('#source-register').isVisible(),true);
   assert.equal(await page.locator('#article-notice').isVisible(),true);
   assert.equal(await page.locator('.reader-link').isVisible(),false);
   assert.equal(await page.locator('.pair').evaluate(node=>getComputedStyle(node).breakInside),'avoid');
   const expectation={pairs:[{id:c.ref,markers:[await page.locator('.attribution').textContent(),await page.locator('.explanation-slot p').textContent()],gurmukhi:c.unit.lines.map(line=>line.text)}]};
   await fs.writeFile(path.join(pdfOut,c.id+'-pairs.json'),JSON.stringify(expectation,null,2)+'\n');
   for(const format of ['A4','Letter']){
    const name=c.id+'-'+format.toLowerCase()+'.pdf';
    await page.pdf({path:path.join(pdfOut,name),format,printBackground:false,displayHeaderFooter:false,preferCSSPageSize:false});
    report.pdfs.push({file:'evidence/articles/print/'+name,expectations:'evidence/articles/print/'+c.id+'-pairs.json',kind:'actual source reading sheet',format});
   }
   await page.emulateMedia({media:'screen'});
  });
  await check(c.id+': reader link opens the referenced full Salok and Back returns to its sheet',async()=>{
   await page.locator('.reader-link').click();
   await page.waitForFunction(()=>window.__NITNEM_QA?.snapshot?.().sourceReady===true||document.querySelector('.scripture-line[aria-current="location"]'));
   assert.equal(new URL(page.url()).searchParams.get('bani'),c.composition);
   assert.equal(new URL(page.url()).searchParams.get('unit'),String(c.ordinal));
   await page.waitForFunction(expected=>document.querySelector('.scripture-line[aria-current="location"]')?.dataset.lineId===expected,c.unit.lines[0].id);
   await page.goBack();await page.waitForFunction(()=>document.documentElement.dataset.sourceState==='ready');
   assert.equal(await page.locator('#article-content').getAttribute('data-article-id'),c.id);
  });
 }
 await check('A boundary-stress PDF still keeps the complete passage, citation and empty slot together',async()=>{
  const page=pages[0],c=cases[0];
  await page.evaluate(()=>{
   const spacer=document.createElement('div');spacer.id='print-boundary-fixture';spacer.style.height='180mm';spacer.setAttribute('aria-hidden','true');
   document.querySelector('.pair').before(spacer);
  });
  await page.emulateMedia({media:'print'});
  for(const format of ['A4','Letter']){
   const name='pagination-stress-'+format.toLowerCase()+'.pdf';
   await page.pdf({path:path.join(pdfOut,name),format,printBackground:false,displayHeaderFooter:false,preferCSSPageSize:false});
   report.pdfs.push({file:'evidence/articles/print/'+name,expectations:'evidence/articles/print/'+c.id+'-pairs.json',kind:'synthetic blank-space pagination fixture; source unchanged',format});
  }
  await page.evaluate(()=>document.getElementById('print-boundary-fixture').remove());await page.emulateMedia({media:'screen'});
 });
 await check('Unknown article IDs fail closed without a random passage or print action',async()=>{
  const page=await fresh();await open(page,'articles/article.html?id=not-a-sheet');await unavailable(page);
 });
 const negatives=[
  ['Inserted explanation',c=>{c.articles[0].explanation='Unreviewed inserted teaching';return c;}],
  ['A claim with an otherwise resolving reference',c=>{c.articles[0].claims=[{text:'Unreviewed claim',referenceIds:c.articles[0].referenceIds}];return c;}],
  ['Scripture-style editorial title',c=>{c.articles[0].title='ਸਲੋਕੁ ਮਃ ੧ ॥';return c;}],
  ['Unknown source reference',c=>{c.articles[0].referenceIds=['sggs.salok-mahalla9.salok001'];return c;}],
  ['Unsupported comparative content',c=>{c.articles[0].comparison={text:'Outside content'};return c;}],
  ['A claimed approval inside content',c=>{c.articles[0].reviewStatus='APPROVED';return c;}],
  ['A missing second sheet',c=>{c.articles.pop();return c;}]
 ];
 for(const [name,modify] of negatives)await check(name+' blocks the entire reading sheet',async()=>{
  const page=await mutationPage(modify);await open(page,'articles/article.html?id=haumai-source-sheet');await unavailable(page);
 });
 await check('An unselected source line changed and internally resealed cannot pass a complete-package check',async()=>{
  const page=await mutationPage(pack=>{
   const line=pack.units[0].lines[0];line.text+=' ';line.sha256=createHash('sha256').update(line.text).digest('hex');return pack;
  },'salok-mahalla9/data/salok-mahalla9.json');
  await open(page,'articles/article.html?id=haumai-source-sheet');await unavailable(page);
 });
 await check('A missing complete source package blocks index and article instead of silently omitting it',async()=>{
  const page=await fresh({route:route=>new URL(route.request().url()).pathname===prefix+'salok-kabir/data/salok-kabir.json'?route.fulfill({status:404,body:'Unavailable'}):route.continue()});
  await open(page);await unavailable(page);await open(page,'articles/article.html?id=haumai-source-sheet');await unavailable(page);
 });
 await check('A controller cannot render source sheets under the wrong content layer',async()=>{
  const page=await mutationPage(html=>html.replace('data-content-layer="source-reading-sheet"','data-content-layer="comparison"'),'articles/article.html',true);
  await open(page,'articles/article.html?id=haumai-source-sheet');await unavailable(page);
 });
 await check('Sheet-only visits never access private browser storage or request external assets',async()=>{
  const page=await fresh(),external=[];
  page.on('request',request=>{if(new URL(request.url()).origin!==origin)external.push(request.url());});
  await open(page);await page.locator('a[data-article-id="haumai-source-sheet"]').click();await ready(page);
  assert.deepEqual(await page.evaluate(()=>window.__articlePrivacy),{reads:0,writes:0,removes:0,clears:0});
  assert.deepEqual(external,[]);assert.equal((await page.context().cookies()).length,0);
 });
 await check('The real worker serves both complete source sheets with the network unavailable',async()=>{
  const page=await fresh({offline:true});
  await page.goto(origin+prefix);await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
  const cache=await verifiedReleaseCache(page);
  for(const asset of ['articles/','articles/index.html','articles/article.html','articles/articles.css','articles/app.mjs','articles/core.mjs','articles/source-contracts.mjs','articles/catalog.json']){
   assert.ok(cache.paths.includes(prefix+asset),'Missing offline asset '+asset);
  }
  // Exact release URLs and response bytes were checked above; no stale flat asset count.
  await page.context().setOffline(true);
  await page.waitForFunction(()=>document.documentElement.dataset.libraryState==='ready');
  await page.locator('.library-nav a[data-view="explore"]').click();
  await page.waitForFunction(()=>document.documentElement.dataset.libraryState==='ready'&&document.documentElement.dataset.libraryView==='explore');
  await page.locator('a[href="articles/index.html"]').click();await page.waitForFunction(()=>document.documentElement.dataset.sourceState==='ready');
  for(const c of cases){
   const response=page.waitForResponse(r=>new URL(r.url()).pathname===prefix+'articles/article.html');
   await page.locator('a[data-article-id="'+c.id+'"]').click();
   assert.equal((await response).fromServiceWorker(),true);
   await page.waitForFunction(()=>document.documentElement.dataset.sourceState==='ready');
   assert.deepEqual(await page.locator('.source-line').allTextContents(),c.unit.lines.map(line=>line.text));
   await page.locator('.navigation a').click();await page.waitForFunction(()=>document.documentElement.dataset.sourceState==='ready');
  }
 });
 await check('No runtime script errors occurred',()=>assert.deepEqual(report.runtimeErrors,[]));
}catch(error){report.checks.push({name:'Harness setup/completion',status:'FAIL',error:error.stack||String(error)});}
finally{
 for(const context of contexts)await context.close().catch(()=>{});await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));
 report.finishedAt=new Date().toISOString();report.passed=report.checks.filter(c=>c.status==='PASS').length;report.failed=report.checks.filter(c=>c.status==='FAIL').length;
 report.inputSha256={};
 for(const file of ['articles/index.html','articles/article.html','articles/articles.css','articles/app.mjs','articles/core.mjs','articles/source-contracts.mjs','articles/catalog.json','sw.js','tests/articles-browser.mjs']){
  report.inputSha256[file]=createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex');
 }
 await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({passed:report.passed,failed:report.failed,failures:report.checks.filter(c=>c.status==='FAIL'),report:'evidence/articles/browser.json'}));
 if(report.failed)process.exitCode=1;
}
