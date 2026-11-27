// Actual public source-reader UI, isolated browser profiles and synthetic saved places.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const {chromium}=await import(process.env.GLP_PLAYWRIGHT_MODULE||'playwright');
const directory=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const root=await fs.realpath(process.env.GLP_TARGET_DIRECTORY||directory);
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const out=process.env.GLP_SOURCE_READER_OUTPUT?path.resolve(process.env.GLP_SOURCE_READER_OUTPUT):path.join(directory,'evidence/source-readers/browser',stamp);
await fs.mkdir(out,{recursive:true});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const definitions={
  sggs:{path:'collections/sggs/index.html',edition:'shabados-5.0.0-next.0-SGGS-SSA2',locator:'Ang',pages:1430,manifestBytes:1116397,manifestHash:'04da157b5e7ba85ce0fe35aae983baba3284bc75990be374e556ab3c52da5def',groups:[
    {id:'ZKH',count:14,pages:[1,2],hash:'bc3275de1d5ddb6720801a23e8d6b9a64b6ff129330b3115db2af698c2d2ec77'},
    {id:'SKD',count:15,pages:[465,466],hash:'3ed04a09de046a1a86456ff7c6049121c59378a445adde65c01a95a30d57855b'},
    {id:'TNM',count:399,pages:[929,930,931,932,933,934,935,936,937,938],hash:'94dc9ad828d63831bd90b859d1c5a430c5a66c7899770030d8d766fb365a663f'},
    {id:'FD3',count:62,pages:[1429,1430],hash:'77139375e425ddf80c44e41e2f13087f4da7ae93fa2aadf4bd6febf512fa4a72'}]},
  dasam:{path:'collections/dasam/read.html',edition:'shabados-5.0.0-next.0-SDGR-DGDG',locator:'Page',pages:1428,manifestBytes:1101376,manifestHash:'2ba6005655429eeb07b4477d4bf9a18b4f62e86224107d72793ec5f2bd441ad6',groups:[
    {id:'KKH',count:10,pages:[1],hash:'8b27e6d5c13e2d2ed0b7d7fef49c741a29d3b3943d0baad0aad865d1fd763850'},
    {id:'4TJ',count:426,pages:[738,739,740,741,742,743,744,745,746,747,748],hash:'9f57690ed71103740d89bfc9ec7a7fd06b6bc12e4f3a858d07c8a4ea24cbc7d0'},
    {id:'BTE',count:43,pages:[1427,1428],hash:'911f6c1957c13d25c35576f47cd856835fd104e095669e980e7fe727a7ffce0f'}]}
};
const sourceHashes={},fixtures={},prefix='/source-reader-review/';
const unbundled=new Set(['collections/source-reader/reader.mjs','collections/source-reader/core.mjs','collections/source-reader/source-lock.mjs']);
async function readPublic(relative){
  assert.ok(!relative.startsWith('private-library/'),'Private collection is outside this fixture');
  const filename=path.resolve(root,relative);
  assert.ok(filename.startsWith(root+path.sep),'Source path stays inside the candidate');
  const bytes=await fs.readFile(filename);sourceHashes[relative]=hash(bytes);return bytes;
}
for(const [id,spec] of Object.entries(definitions)){
  const base=`collections/source-data/${id}/`,bytes=await readPublic(base+'manifest.json');
  assert.equal(bytes.length,spec.manifestBytes,`${id} frozen manifest size`);
  assert.equal(hash(bytes),spec.manifestHash,`${id} frozen manifest digest`);
  const manifest=JSON.parse(bytes),chunks=new Map(),units=new Map();
  assert.equal(manifest.collectionId,id);assert.equal(manifest.editionId,spec.edition);
  assert.equal(manifest.counts.pages,spec.pages);
  async function unitFor(unitId){
    if(units.has(unitId))return units.get(unitId);
    const descriptor=manifest.units.find(unit=>unit.id===unitId);assert.ok(descriptor);
    const info=manifest.chunks.find(chunk=>chunk.id===descriptor.chunkId);assert.ok(info);
    if(!chunks.has(info.id)){
      const bytes=await readPublic(base+info.path);assert.equal(bytes.length,info.bytes);assert.equal(hash(bytes),info.sha256);
      chunks.set(info.id,{bytes,data:JSON.parse(bytes),relative:base+info.path});
    }
    const unit=chunks.get(info.id).data.units.find(unit=>unit.id===unitId);assert.ok(unit);
    assert.equal(hash(JSON.stringify(unit)),descriptor.sha256);units.set(unitId,unit);return unit;
  }
  for(const expected of spec.groups){
    const unit=await unitFor(expected.id);assert.equal(hash(JSON.stringify(unit)),expected.hash);
    assert.equal(unit.lines.length,expected.count);assert.deepEqual([...new Set(unit.lines.map(line=>line.page))],expected.pages);
  }
  fixtures[id]={id,spec,manifest,bytes,base,chunks,unitFor,key:`glp001.sikh-source-place.v1:${id}:${spec.edition}`};
}
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
    if(!pathname.startsWith(prefix))throw Error('Outside test mount');
    let relative=pathname.slice(prefix.length);if(!relative||relative.endsWith('/'))relative+='index.html';
    if(relative.startsWith('private-library/'))throw Error('Private paths are excluded');
    if(unbundled.has(relative)){res.writeHead(403,{'cache-control':'no-store'});res.end('The fixture requires the closed reader bundle.');return;}
    const bytes=await readPublic(relative);
    res.writeHead(200,{'content-type':mime[path.extname(relative)]||'application/octet-stream','cache-control':'no-store','content-length':String(bytes.length)});res.end(bytes);
  }catch{res.writeHead(404,{'cache-control':'no-store'});res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
let sourceCommit=null;try{sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();}catch{}
const report={status:'PASS',started:new Date().toISOString(),sourceCommit,checks:[],failures:[],sourceHashes,limits:[
  'Named digital-source group ownership and exact imported text, not a claim of independently resolved edition or authorship disputes.',
  'Fresh desktop Chrome contexts at 320 CSS pixels; not physical iPhone, Safari, VoiceOver or independent Claude review.',
  'Synthetic saved places only; no owner PIN, private collection, personal reflection or existing browser profile.',
  'Service workers are blocked to isolate reader delivery, route handling and authenticated source data.'
]};
const browser=await chromium.launch({headless:true,...(process.env.GLP_CHROMIUM_EXECUTABLE?{executablePath:process.env.GLP_CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox']});
report.environment={node:process.version,platform:process.platform,browser:browser.version()};
const ready=page=>page.waitForSelector('html[data-source-state="ready"]');
const settled=async page=>{await ready(page);await page.waitForFunction(()=>document.getElementById('source-progress-status')?.textContent.trim());};
async function open(page,fixture,query=''){await page.goto(origin+prefix+fixture.spec.path+query);await ready(page);}
async function noSource(page){assert.equal(await page.locator('#source-groups [data-source-line-id]').count(),0);assert.equal(await page.locator('#source-groups').textContent(),'');assert.ok(await page.locator('#source-save-place').isDisabled());}
async function exactPage(page,fixture,number){
  const label=`${fixture.spec.locator} ${number} of ${fixture.spec.pages}`;
  await page.waitForFunction(label=>document.documentElement.dataset.sourceState==='ready'&&document.getElementById('source-page-label')?.textContent===label,label);
  assert.equal(await page.locator('#source-page-label').textContent(),label);
  const descriptors=fixture.manifest.units.filter(unit=>unit.pages.includes(number));
  assert.deepEqual(await page.locator('#source-groups [data-group-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.groupId)),descriptors.map(unit=>unit.id),'Every owning group is rendered in source order');
  for(const descriptor of descriptors){
    const unit=await fixture.unitFor(descriptor.id);
    const actual=await page.locator(`[data-group-id="${descriptor.id}"] [data-source-line-id]`).evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.sourceLineId,page:Number(node.dataset.sourcePage),text:node.textContent})));
    assert.deepEqual(actual,unit.lines.map(line=>({id:line.id,page:line.page,text:line.text})),`Exact complete ${fixture.id}/${unit.id}`);
  }
}
function savedRecord(fixture,unit,line){return {schema:'glp.sikh-reader.progress.v1',collectionId:fixture.id,editionId:fixture.spec.edition,unitId:unit.id,unitSha256:hash(JSON.stringify(unit)),lineId:line.id,page:line.page,updatedAt:'2026-11-27T12:00:00.000Z'};}
const unrelated={'glp001.sukhmani.v1':'SYNTHETIC EXISTING READER RECORD','glp001.source-reader-old-edition':'SYNTHETIC STALE OTHER NAMESPACE','unrelated.synthetic.reflection':'SYNTHETIC NOT A PERSONAL REFLECTION'};
async function scenario(name,fn,{seed={},mutations={},observeResume=false}={}){
  const check={name,status:'PASS',requests:[],external:[],pageErrors:[],consoleErrors:[],storage:null};report.checks.push(check);
  const context=await browser.newContext({viewport:{width:320,height:740},serviceWorkers:'block',reducedMotion:'reduce'});
  await context.addInitScript(({seed,observeResume})=>{
    const get=Storage.prototype.getItem,set=Storage.prototype.setItem,remove=Storage.prototype.removeItem,clear=Storage.prototype.clear;
    if(get.call(localStorage,'__synthetic_source_reader_fixture__')===null){for(const [key,value] of Object.entries(seed))set.call(localStorage,key,value);set.call(localStorage,'__synthetic_source_reader_fixture__','seeded');}
    window.__sourceStorage={reads:[],writes:[],removes:[],clears:0};
    Storage.prototype.getItem=function(key){if(this===localStorage)window.__sourceStorage.reads.push(String(key));return get.call(this,key);};
    Storage.prototype.setItem=function(key,value){if(this===localStorage)window.__sourceStorage.writes.push([String(key),String(value)]);return set.call(this,key,value);};
    Storage.prototype.removeItem=function(key){if(this===localStorage)window.__sourceStorage.removes.push(String(key));return remove.call(this,key);};
    Storage.prototype.clear=function(){if(this===localStorage)window.__sourceStorage.clears++;return clear.call(this);};
    window.__sourceSnapshot=()=>Object.fromEntries(Object.keys(localStorage).map(key=>[key,get.call(localStorage,key)]));
    if(observeResume){
      const add=EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener=function(type,listener,options){
        if(this.id==='source-resume'&&type==='click'&&typeof listener==='function'){
          return add.call(this,type,function(event){const result=listener.call(this,event);window.__sourceResumeTask=Promise.resolve(result);return result;},options);
        }
        return add.call(this,type,listener,options);
      };
    }
  },{seed,observeResume});
  await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.origin!==origin){check.external.push(route.request().url());await route.abort();return;}
    const relative=url.pathname.slice(prefix.length),mutation=mutations[relative];
    if(mutation){await route.fulfill({status:200,contentType:mime[path.extname(relative)],body:mutation});return;}
    await route.continue();
  });
  const page=await context.newPage();page.setDefaultTimeout(15000);
  page.on('request',request=>check.requests.push(new URL(request.url()).pathname));
  page.on('pageerror',error=>check.pageErrors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')check.consoleErrors.push(message.text());});
  try{
    await fn(page,check,context);
    assert.deepEqual(check.pageErrors,[],'No uncaught reader errors');assert.deepEqual(check.external,[],'No external requests');
    assert.ok(check.requests.every(request=>!unbundled.has(request.slice(prefix.length))),'Reader uses the closed bundle without secondary module requests');
    check.storage=await page.evaluate(()=>window.__sourceStorage||null);
  }catch(error){check.status='FAIL';check.error=error.message;report.failures.push({name,error:error.message});report.status='FAIL';}
  finally{await context.close();}
}
async function assertUnchanged(page,seed){const snapshot=await page.evaluate(()=>window.__sourceSnapshot());for(const [key,value] of Object.entries(seed))assert.equal(snapshot[key],value,`Preserved ${key}`);const trace=await page.evaluate(()=>window.__sourceStorage);assert.deepEqual(trace.removes,[]);assert.equal(trace.clears,0);return trace;}

try{
  for(const fixture of Object.values(fixtures))for(const expected of fixture.spec.groups){
    await scenario(`${fixture.id} ${expected.id}: complete owning group at both page boundaries`,async(page,check)=>{
      check.expected={unit:expected.id,lines:expected.count,pages:expected.pages,sha256:expected.hash};
      for(const number of [...new Set([expected.pages[0],expected.pages.at(-1)])]){await open(page,fixture,'?page='+number);await exactPage(page,fixture,number);}
      if(expected.id==='FD3'){
        const detail=page.locator('[data-group-id="FD3"] details.source-attribution');
        assert.equal(await detail.getAttribute('data-source-author-id'),'ALAM');
        assert.match(await detail.textContent(),/Poet Alam.*as recorded by this digital source.*not a separate historical authorship finding/s);
      }
      if(fixture.id==='dasam')assert.ok(!/\bAng\b/.test(await page.locator('#source-page-label').textContent()));
    });
  }

  for(const fixture of Object.values(fixtures)){
    await scenario(`${fixture.id}: page entry, next/previous, reload and browser history`,async page=>{
      await open(page,fixture);await exactPage(page,fixture,1);
      assert.ok(await page.locator('#source-previous').isDisabled());
      await page.locator('#source-next').click();await page.waitForFunction(()=>new URL(location.href).searchParams.get('page')==='2');await ready(page);await exactPage(page,fixture,2);
      await page.goBack();await ready(page);await exactPage(page,fixture,1);
      await page.goForward();await ready(page);await exactPage(page,fixture,2);
      await page.reload();await ready(page);await exactPage(page,fixture,2);
      await page.locator('#source-previous').click();await ready(page);await exactPage(page,fixture,1);
      await page.locator('#source-page').fill(String(fixture.spec.pages));await page.locator('#source-page-form button[type="submit"]').click();await ready(page);await exactPage(page,fixture,fixture.spec.pages);
      assert.ok(await page.locator('#source-next').isDisabled());
      await page.locator('#source-page').fill('2');await page.locator('#source-page-form button[type="submit"]').click();await ready(page);await exactPage(page,fixture,2);
    });
    await scenario(`${fixture.id}: exact line deep link focuses its owner without filtering the page`,async page=>{
      const expected=fixture.spec.groups.at(-1),unit=await fixture.unitFor(expected.id),line=unit.lines.at(-1);
      const query=`?page=${line.page}&unit=${unit.id}&line=${line.id}`;
      await open(page,fixture,query);await exactPage(page,fixture,line.page);
      assert.equal(await page.evaluate(()=>document.activeElement?.dataset.sourceLineId),line.id);
      await page.reload();await ready(page);await exactPage(page,fixture,line.page);
      assert.equal(await page.evaluate(()=>document.activeElement?.dataset.sourceLineId),line.id);
    });
    await scenario(`${fixture.id}: invalid routes clear source and Go recovers`,async(page,check)=>{
      const unit=await fixture.unitFor(fixture.spec.groups.at(-1).id),last=unit.lines.at(-1),firstPage=unit.lines[0].page;
      const invalid=['?page=0',`?page=${fixture.spec.pages+1}`,'?page=01','?page=1&page=2','?page=1&unknown=1','?page=x','?line=unknown','?page=1&unit=unknown',`?page=1&unit=${unit.id}`,`?page=${firstPage}&unit=${unit.id}&line=${last.id}`];
      check.invalidRoutes=invalid;
      for(const query of invalid){await page.goto(origin+prefix+fixture.spec.path+query);await page.waitForSelector('html[data-source-state="refused"]');await noSource(page);}
      assert.ok(await page.locator('#source-page').isEnabled());await page.locator('#source-page').fill('1');await page.locator('#source-page-form button[type="submit"]').click();await ready(page);await exactPage(page,fixture,1);
    });

    const targetUnit=await fixture.unitFor(fixture.spec.groups.at(-1).id),targetLine=targetUnit.lines.at(-1),valid=savedRecord(fixture,targetUnit,targetLine);
    const other=fixtures[fixture.id==='sggs'?'dasam':'sggs'];
    await scenario(`${fixture.id}: saved places use only this edition's namespace and require explicit actions`,async page=>{
      const seed={...unrelated,[other.key]:'SYNTHETIC OTHER COLLECTION RECORD'};
      await open(page,fixture,'?page='+targetLine.page);await settled(page);
      let trace=await assertUnchanged(page,seed);assert.deepEqual(trace.writes,[]);assert.deepEqual([...new Set(trace.reads)],[fixture.key]);
      await page.locator('#source-save-place').click();
      trace=await assertUnchanged(page,seed);assert.equal(trace.writes.length,1);assert.equal(trace.writes[0][0],fixture.key);
      const record=JSON.parse(trace.writes[0][1]);
      assert.deepEqual(Object.keys(record).sort(),['schema','collectionId','editionId','unitId','unitSha256','lineId','page','updatedAt'].sort());
      assert.equal(record.schema,'glp.sikh-reader.progress.v1');assert.equal(record.collectionId,fixture.id);assert.equal(record.editionId,fixture.spec.edition);
      const unit=await fixture.unitFor(record.unitId),line=unit.lines.find(line=>line.id===record.lineId);assert.ok(line);assert.equal(record.unitSha256,hash(JSON.stringify(unit)));assert.equal(record.page,line.page);assert.equal(new Date(record.updatedAt).toISOString(),record.updatedAt);
      await page.locator('#source-page').fill('1');await page.locator('#source-page-form button[type="submit"]').click();await ready(page);await exactPage(page,fixture,1);
      await page.locator('#source-resume').click();await ready(page);await exactPage(page,fixture,record.page);
      const route=new URL(page.url()).searchParams;assert.equal(route.get('unit'),record.unitId);assert.equal(route.get('line'),record.lineId);
      trace=await assertUnchanged(page,seed);assert.equal(trace.writes.length,1,'Resume and navigation do not rewrite the saved place');
    },{seed:{...unrelated,[other.key]:'SYNTHETIC OTHER COLLECTION RECORD'}});
    await scenario(`${fixture.id}: a valid synthetic saved place verifies before explicit Resume`,async page=>{
      const seed={...unrelated,[fixture.key]:JSON.stringify(valid)};
      await open(page,fixture);await page.waitForFunction(()=>!document.getElementById('source-resume').disabled);await exactPage(page,fixture,1);
      let trace=await assertUnchanged(page,seed);assert.deepEqual(trace.writes,[]);
      await page.locator('#source-resume').click();await ready(page);await exactPage(page,fixture,targetLine.page);
      assert.equal(await page.evaluate(()=>document.activeElement?.dataset.sourceLineId),targetLine.id);
      trace=await assertUnchanged(page,seed);assert.deepEqual(trace.writes,[]);
    },{seed:{...unrelated,[fixture.key]:JSON.stringify(valid)}});
    for(const [kind,raw] of [
      ['corrupt','{"schema":'],
      ['stale edition',JSON.stringify({...valid,editionId:valid.editionId+'-previous'})],
      ['stale unit digest',JSON.stringify({...valid,unitSha256:'0'.repeat(64)})],
      ['wrong line page',JSON.stringify({...valid,page:targetUnit.lines[0].page})]
    ])await scenario(`${fixture.id}: ${kind} saved record remains untouched`,async page=>{
      const seed={...unrelated,[fixture.key]:raw};await open(page,fixture);await settled(page);await exactPage(page,fixture,1);
      assert.ok(await page.locator('#source-resume').isDisabled());assert.match(await page.locator('#source-progress-status').textContent(),/kept unchanged/i);
      const trace=await assertUnchanged(page,seed);assert.deepEqual(trace.writes,[]);assert.deepEqual([...new Set(trace.reads)],[fixture.key]);
    },{seed:{...unrelated,[fixture.key]:raw}});

    const manifestMutation=structuredClone(fixture.manifest);manifestMutation.name.Latn='X'+manifestMutation.name.Latn.slice(1);
    const changedManifest=Buffer.from(JSON.stringify(manifestMutation)+(fixture.bytes.at(-1)===10?'\n':''));
    assert.equal(changedManifest.length,fixture.bytes.length,'Tamper keeps the expected byte length');
    await scenario(`${fixture.id}: same-length manifest tampering refuses all source`,async(page,check)=>{
      check.mutation={path:fixture.base+'manifest.json',before:hash(fixture.bytes),after:hash(changedManifest)};
      await page.goto(origin+prefix+fixture.spec.path);await page.waitForSelector('html[data-source-state="refused"]');await noSource(page);
      assert.ok(await page.locator('#source-page').isDisabled());
    },{mutations:{[fixture.base+'manifest.json']:changedManifest}});
    const chunkInfo=fixture.manifest.chunks.find(chunk=>chunk.id===fixture.manifest.units.find(unit=>unit.id===fixture.spec.groups[0].id).chunkId);
    await fixture.unitFor(fixture.spec.groups[0].id);const originalChunk=fixture.chunks.get(chunkInfo.id);
    const changed=structuredClone(originalChunk.data),line=changed.units[0].lines[0];
    line.text=line.text.replace(/[\u0a00-\u0a7f]/u,char=>char==='ਖ'?'ਗ':'ਖ');
    const changedChunk=Buffer.from(JSON.stringify(changed)+(originalChunk.bytes.at(-1)===10?'\n':''));
    assert.equal(changedChunk.length,originalChunk.bytes.length);assert.notEqual(hash(changedChunk),hash(originalChunk.bytes));
    await scenario(`${fixture.id}: same-length original-line chunk tampering refuses all source`,async(page,check)=>{
      check.mutation={path:originalChunk.relative,before:hash(originalChunk.bytes),after:hash(changedChunk)};
      await page.goto(origin+prefix+fixture.spec.path);await page.waitForSelector('html[data-source-state="refused"]');await noSource(page);
    },{mutations:{[originalChunk.relative]:changedChunk}});
    const bundlePath='collections/source-reader/reader.bundle.mjs',bundle=await readPublic(bundlePath),changedBundle=Buffer.concat([bundle,Buffer.from('\nglobalThis.__sourceReaderTamperExecuted=true;\n')]);
    await scenario(`${fixture.id}: changed reader bundle is blocked by unchanged SRI before source requests`,async(page,check)=>{
      check.mutation={path:bundlePath,before:hash(bundle),after:hash(changedBundle)};
      await page.goto(origin+prefix+fixture.spec.path);assert.equal(await page.locator('html').getAttribute('data-source-state'),'loading');await noSource(page);
      assert.equal(await page.evaluate(()=>globalThis.__sourceReaderTamperExecuted),undefined);
      assert.ok(check.consoleErrors.some(message=>/integrity|valid digest/i.test(message)),'Browser reports integrity refusal');
      assert.ok(check.requests.every(request=>!request.includes('/collections/source-data/')),'A blocked bundle requests no source manifest or chunk');
    },{mutations:{[bundlePath]:changedBundle}});
    await scenario(`${fixture.id}: 320-pixel layout and qualified page labels`,async(page,check)=>{
      await open(page,fixture,'?page=2');await exactPage(page,fixture,2);
      check.geometry=await page.evaluate(()=>({viewport:innerWidth,documentWidth:document.documentElement.scrollWidth}));assert.ok(check.geometry.documentWidth<=check.geometry.viewport);
      await page.screenshot({path:path.join(out,fixture.id+'-320.png'),fullPage:false});check.screenshot=fixture.id+'-320.png';
      assert.equal(await page.locator('input[type="password"]').count(),0,'Public source reading is open');
    });
  }
  const raceFixture=fixtures.sggs,raceUnit=await raceFixture.unitFor('FD3'),raceLine=raceUnit.lines.at(-1),raceRecord=savedRecord(raceFixture,raceUnit,raceLine);
  const raceChunkId=raceFixture.manifest.units.find(unit=>unit.id==='FD3').chunkId;
  const raceChunk=raceFixture.base+raceFixture.manifest.chunks.find(chunk=>chunk.id===raceChunkId).path;
  const evictionPages=raceFixture.manifest.chunks.filter(chunk=>chunk.id!=='c0001'&&chunk.id!==raceChunkId).slice(0,14).map(chunk=>raceFixture.manifest.units.find(unit=>unit.id===chunk.unitIds[0]).pages[0]);
  for(const completion of ['success','failure'])await scenario(`A new explicit Save wins over a delayed Resume ${completion}`,async(page,check)=>{
    await open(page,raceFixture);await page.waitForFunction(()=>!document.getElementById('source-resume').disabled);
    for(const number of evictionPages){await page.locator('#source-page').fill(String(number));await page.locator('#source-page-form button[type="submit"]').click();await exactPage(page,raceFixture,number);}
    check.evictionPages=evictionPages;
    const beforeURL=page.url(),beforeLabel=await page.locator('#source-page-label').textContent();
    let release;const held=new Promise(resolve=>{release=resolve;});
    const raceRoute=url=>url.pathname===prefix+raceChunk;
    await page.route(raceRoute,async route=>{await held;if(completion==='failure')await route.abort('failed');else await route.continue();});
    const requested=page.waitForRequest(request=>new URL(request.url()).pathname===prefix+raceChunk);
    await page.locator('#source-resume').click();await requested;
    try{
      await page.locator('#source-save-place').click();
      const newRaw=await page.evaluate(key=>window.__sourceSnapshot()[key],raceFixture.key),newRecord=JSON.parse(newRaw);
      assert.notEqual(newRecord.unitId,raceRecord.unitId,'Save records the current place, not the old requested source');
      release();await page.evaluate(()=>window.__sourceResumeTask);
      assert.equal(page.url(),beforeURL,'Old Resume cannot navigate after explicit Save');assert.equal(await page.locator('#source-page-label').textContent(),beforeLabel);
      assert.equal(await page.evaluate(key=>window.__sourceSnapshot()[key],raceFixture.key),newRaw);
      assert.ok(await page.locator('#source-resume').isEnabled());assert.match(await page.locator('#source-progress-status').textContent(),/Place saved at/);
      await page.unroute(raceRoute);
      await page.locator('#source-resume').click();await page.evaluate(()=>window.__sourceResumeTask);await exactPage(page,raceFixture,newRecord.page);
      const query=new URL(page.url()).searchParams;assert.equal(query.get('unit'),newRecord.unitId);assert.equal(query.get('line'),newRecord.lineId);
      const trace=await assertUnchanged(page,unrelated);assert.equal(trace.writes.length,1);assert.equal(trace.writes[0][0],raceFixture.key);
    }finally{release();}
  },{seed:{...unrelated,[raceFixture.key]:JSON.stringify(raceRecord)},observeResume:true});
}catch(error){report.status='FAIL';report.failures.push({name:'fixture preparation',error:error.message});}
finally{
  report.finished=new Date().toISOString();report.fixtureSha256=hash(await fs.readFile(fileURLToPath(import.meta.url)));
  await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();await new Promise(resolve=>server.close(resolve));
}
console.log(JSON.stringify({status:report.status,checks:report.checks.length,failures:report.failures,evidence:out}));
if(report.status!=='PASS')process.exitCode=1;
