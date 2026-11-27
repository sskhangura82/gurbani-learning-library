// Actual Chromium localStorage and reader import UI; fresh temporary origin,
// synthetic notes only. No quota estimate, mocked setItem or personal storage.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'evidence/storage-quota');
const pack=JSON.parse(await fs.readFile(path.join(root,'salok-kabir/data/salok-kabir.json'),'utf8'));
const ids=pack.units.flatMap(unit=>unit.lines.map(line=>line.id));
const storageKey='glp001.nitnem.PRIVATE-SOURCE-REVIEW.v1.'+pack.compositionId+'.'+pack.editionId;
const seed={notes:{},bookmarks:[],lineId:ids[0],size:30,theme:'day',pace:70,mode:'read',view:'continuous'};
const makeBackup=notes=>JSON.stringify({project:'GLP-001-NITNEM',schema:1,compositionId:pack.compositionId,
 editionId:pack.editionId,exportedAt:'2026-11-26T00:00:00.000Z',state:{...seed,notes}});
const record={schema:1,compositionId:pack.compositionId,editionId:pack.editionId,rev:7,
 savedAt:'2026-11-26T00:00:00.000Z',payload:{...seed,notes:{[ids[8]]:'SYNTHETIC original note'},
 bookmarks:[ids[3]],lineId:ids[8],size:42,theme:'amrit',pace:80,mode:'meaning'}};
const report={testedAt:new Date().toISOString(),engine:'Desktop Chromium',browserVersion:null,
 storageSHA256:createHash('sha256').update(await fs.readFile(path.join(root,'nitnem/local-learning.js'))).digest('hex'),
 environment:'Ephemeral localhost origin, fresh browser contexts, native browser quota and synthetic records only',
 limitations:['Not Safari, iPhone, VoiceOver, or a promise of available capacity on another browser.',
 'The JSON format allowance remains a parser bound; a valid backup is not a guarantee that localStorage can hold it.'],
 checks:[]};
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(path.resolve(root)+path.sep)){res.writeHead(403).end();return;}
  const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(data);
 }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
await fs.mkdir(out,{recursive:true});
let browser,contexts=[];
async function fresh(existing=false){
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',acceptDownloads:true});
 contexts.push(context);
 await context.addInitScript(({key,existing,record})=>{
  if(!sessionStorage.getItem('synthetic-initialized')){
   localStorage.setItem('glp001.synthetic.other','SYNTHETIC OTHER READER');
   if(existing)localStorage.setItem(key,JSON.stringify(record));
   sessionStorage.setItem('synthetic-initialized','yes');
  }
 },{key:storageKey,existing,record});
 const page=await context.newPage();page.setDefaultTimeout(20000);
 await page.goto(origin+'/salok-kabir/index.html?bani=salok-kabir');
 await page.waitForFunction(()=>window.NITNEM_INTERNAL_QA?.getState().sourceVerified&&document.querySelectorAll('.scripture-line').length===486);
 await page.locator('#reading-tools').click();
 await page.waitForFunction(()=>document.getElementById('tools-dialog').open&&!document.getElementById('note').disabled);
 return page;
}
async function snapshot(page){
 return page.evaluate(()=>{window.SYNTHETIC_BEFORE=Object.fromEntries(Object.keys(localStorage).map(key=>[key,localStorage.getItem(key)]));return Object.keys(window.SYNTHETIC_BEFORE).length;});
}
async function unchanged(page){
 assert.equal(await page.evaluate(()=>{
  const keys=Object.keys(localStorage),before=window.SYNTHETIC_BEFORE;
  return keys.length===Object.keys(before).length&&keys.every(key=>before[key]===localStorage.getItem(key));
 }),true,'Every existing record must remain byte-identical');
}
async function importFile(page,text){
 await page.locator('#save-status').evaluate(node=>{node.textContent='';});
 await page.locator('#import-learning').setInputFiles({name:'SYNTHETIC-learning.json',mimeType:'application/json',buffer:Buffer.from(text)});
 await page.waitForFunction(()=>/Import refused:|Bookmarks and reflections merged/.test(document.getElementById('save-status').textContent));
 return page.locator('#save-status').innerText();
}
async function refuse(page,text,label){
 await snapshot(page);
 const message=await importFile(page,text);
 assert.match(message,/Import refused:.*not enough space/i);
 assert.match(message,/existing saved learning is preserved/i);
 assert.match(message,/Keep your backup file/);
 assert.doesNotMatch(message,/setItem|QuotaExceededError|exceeded the quota/);
 await unchanged(page);
 assert.equal(await page.locator('#export-learning').isEnabled(),true);
 assert.equal(await page.locator('#import-learning').isEnabled(),true);
 assert.equal(await page.locator('#note').inputValue(),await page.evaluate(key=>{
  const r=JSON.parse(localStorage.getItem(key)||'null');return r?.payload.notes[document.querySelector('.scripture-line[aria-current="location"]')?.dataset.lineId]||'';
 },storageKey));
 report.checks.push({name:label,status:'PASS',backupBytes:Buffer.byteLength(text),message});
}
try{
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 report.browserVersion=browser.version();
 const small=makeBackup(Object.fromEntries(ids.map(id=>[id,'\u0a15'.repeat(8000)])));
 let page=await fresh();
 const success=await importFile(page,small);assert.match(success,/Bookmarks and reflections merged/);
 assert.ok(Buffer.byteLength(small)>10000000);
 const download=page.waitForEvent('download');await page.locator('#export-learning').click();
 const exported=JSON.parse(await fs.readFile(await(await download).path(),'utf8'));
 assert.deepEqual(exported.state.notes,JSON.parse(small).state.notes);
 report.checks.push({name:'A valid Punjabi backup above ten million UTF-8 bytes imports and exports every note exactly',status:'PASS',backupBytes:Buffer.byteLength(small),noteCount:ids.length});
 page=await fresh();
 const max=makeBackup(Object.fromEntries(ids.map(id=>[id,'\u0a15'.repeat(12000)])));
 await refuse(page,max,'Maximum valid backup on a fresh collection reaches native quota with a clear preservation message');
 page=await fresh(true);
 assert.equal(await page.locator('#note').inputValue(),'SYNTHETIC original note');
 const nonconflicting=makeBackup(Object.fromEntries(ids.filter(id=>id!==ids[8]).map(id=>[id,'\u0a15'.repeat(12000)])));
 await refuse(page,nonconflicting,'Maximum nonconflicting restore preserves the existing note, bookmarks, preferences, position and revision');
 await page.screenshot({path:path.join(out,'preserved-import-message.png'),fullPage:false});
 page=await fresh(true);
 // Deliberately occupy only this synthetic origin until native quota refuses.
 // This is test fixture preparation, never code used by the product.
 const occupied=await page.evaluate(()=>{
  let count=0,units=0;
  for(const size of [65536,4096,256]){
   for(let n=0;n<10000;n++){
    try{localStorage.setItem('glp001.synthetic.filler.'+count,'x'.repeat(size));count++;units+=size;}
    catch(error){if(error.name!=='QuotaExceededError')throw error;break;}
   }
  }
  return {count,units};
 });
 const ordinary=makeBackup({[ids[1]]:'SYNTHETIC new note '.repeat(600)});
 await refuse(page,ordinary,'A small valid backup into an already full origin refuses atomically too');
 const beforeRetryRev=await page.evaluate(key=>{
  for(const k of Object.keys(localStorage))if(k.startsWith('glp001.synthetic.filler.'))localStorage.removeItem(k);
  return JSON.parse(localStorage.getItem(key)).rev;
 },storageKey);
 assert.match(await importFile(page,ordinary),/Bookmarks and reflections merged/);
 const retried=await page.evaluate(key=>{
  const after=JSON.parse(localStorage.getItem(key));
  return {afterRev:after.rev,notes:after.payload.notes,position:after.payload.lineId,other:localStorage.getItem('glp001.synthetic.other')};
 },storageKey);
 assert.equal(retried.afterRev,beforeRetryRev+1);assert.equal(retried.notes[ids[8]],'SYNTHETIC original note');
 assert.equal(retried.notes[ids[1]],JSON.parse(ordinary).state.notes[ids[1]]);
 assert.equal(retried.other,'SYNTHETIC OTHER READER');
 report.checks.push({name:'A second file-picker import succeeds after test-only filler is removed; the product never removes records for space',status:'PASS',syntheticOccupiedUnits:occupied.units});
}catch(error){report.failure=error.stack||String(error);process.exitCode=1;}
finally{
 for(const context of contexts)await context.close().catch(()=>{});
 if(browser)await browser.close();
 await new Promise(resolve=>server.close(resolve));
 await fs.writeFile(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:report.failure?'FAIL':'PASS',checks:report.checks.length,failure:report.failure,browserVersion:report.browserVersion}));
}
