// Real storage export/import and the actual reader file gate. All records are
// synthetic, in memory; no personal storage, network or source text is changed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),N=require('../nitnem/local-learning.js');
const kabir=JSON.parse(fs.readFileSync(new URL('../salok-kabir/data/salok-kabir.json',import.meta.url),'utf8'));
const reader=fs.readFileSync(new URL('../nitnem/reader.js',import.meta.url),'utf8');
const start=reader.indexOf('async function importLearning('),end=reader.indexOf('window.GLP_BEFORE_UPDATE=',start);
assert.ok(start>=0&&end>start,'The actual reader import function must be available');
const importCode=reader.slice(start,end)+'\n;importLearning';
const lineIds=pack=>pack.units.flatMap(unit=>unit.lines.map(line=>line.id));
const bytes=text=>Buffer.byteLength(text,'utf8');
function fixture(pack=kabir){
 const map=new Map(),storage={getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};
 const locks={request:async(_name,fn)=>fn()};
 return {map,manager:N.create(pack,{storage,locks})};
}
function readerImport(manager){
 const session={manager,lineId:lineIds(kabir)[0],lease:{available:true}};
 const elements=new Map(['note','bookmark','save-status'].map(id=>[id,{value:'',textContent:''}]));
 const state={toolsSession:session,savingBlocked:false,notes:{},bookmarks:[]};
 const context={state,toolsCurrent:s=>s===session,beginTools:()=>({}),endTools(){},
  saveReflection:async()=>true,settleWrites:async()=>true,$:id=>elements.get(id),
  syncLearning(record){state.notes=record.payload.notes;state.bookmarks=record.payload.bookmarks;},savedLines(){}};
 return {run:vm.runInNewContext(importCode,context,{filename:'actual nitnem/reader.js importLearning'}),elements};
}
const small={compositionId:'SYNTHETIC-ਛੋਟਾ',editionId:'current',previousEditionIds:['SYNTHETIC-ਪੁਰਾਣਾ-"\\'],
 units:[{lines:[{id:'SYNTHETIC.ਪੰਕਤੀ"\\01'},{id:'SYNTHETIC.02'},{id:'SYNTHETIC.003'},{id:'SYNTHETIC.004'}]}]};

test('A real Kabir export above the former 2.5M limit imports through the actual reader file gate',async()=>{
 const ids=lineIds(kabir),source=fixture(),target=fixture();
 const notes=Object.fromEntries(ids.slice(0,210).map((id,i)=>[id,
  i===0?'"\\\u0000\n'.repeat(3000):i===1?'\ud800'.repeat(12000):'ਨ'.repeat(12000)]));
 for(const note of Object.values(notes))assert.equal(note.length,12000);
 await source.manager.save(ids[0],{notes,bookmarks:{[ids[209]]:true}});
 const exported=source.manager.exportText(),file=new Blob([exported],{type:'application/json'});
 assert.ok(exported.length>2500000);assert.ok(file.size>2500000);
 assert.equal(file.size,bytes(exported));assert.ok(file.size<=source.manager.maxBackupBytes);
 assert.equal(source.manager.maxBackupBytes,target.manager.maxBackupBytes);
 const ui=readerImport(target.manager);await ui.run(file);
 assert.deepEqual(target.manager.read().payload.notes,notes);
 assert.deepEqual(target.manager.read().payload.bookmarks,[ids[209]]);
 assert.match(ui.elements.get('save-status').textContent,/Bookmarks and reflections merged/);
 assert.deepEqual(source.manager.parse(target.manager.exportText()).payload.notes,notes);
});

test('The collection-derived bound covers every line at the maximum JSON escaping expansion',async()=>{
 const ids=lineIds(kabir),source=fixture(),target=fixture();
 const note='\u0000'.repeat(12000),notes=Object.fromEntries(ids.map(id=>[id,note]));
 await source.manager.save(ids.at(-1),{notes,bookmarks:Object.fromEntries(ids.map(id=>[id,true])),
  preferences:{size:60,theme:'amrit',pace:200,mode:'meaning',view:'continuous'}});
 const exported=source.manager.exportText();assert.ok(bytes(exported)<=source.manager.maxBackupBytes);
 await target.manager.importText(exported);
 assert.equal(Object.keys(target.manager.read().payload.notes).length,486);
 assert.equal(target.manager.read().payload.notes[ids.at(-1)],note);
 assert.deepEqual(target.manager.read().payload.bookmarks,ids);
 // The final target's default position/settings, rather than the imported ones,
 // remain its current reading state.
 assert.equal(target.manager.read().payload.lineId,ids[0]);
 assert.equal(target.manager.read().payload.mode,'read');
});

test('Punjabi UTF-8, paired and lone surrogates, control characters, quotes and backslashes round-trip exactly',async()=>{
 const ids=lineIds(small),a=fixture(small),b=fixture(small);
 const notes={
  [ids[0]]:'ਪੰਜਾਬੀ'.repeat(2000),
  [ids[1]]:'🙂'.repeat(6000),
  [ids[2]]:'\ud800'.repeat(12000),
  [ids[3]]:'"\\\b\f\n\r\t\u0000\u001f\u2028\u2029\udfff'.repeat(1000)
 };
 for(const note of Object.values(notes))assert.equal(note.length,12000);
 await a.manager.save(ids[0],{notes});const exported=a.manager.exportText();
 assert.ok(bytes(exported)>exported.length);assert.ok(bytes(exported)<=a.manager.maxBackupBytes);
 await b.manager.importText(exported);assert.deepEqual(b.manager.read().payload.notes,notes);
});

test('An exact-bound legacy-format backup is accepted; one extra byte is rejected atomically',async()=>{
 const ids=lineIds(small),a=fixture(small),b=fixture(small);
 const longest=values=>values.reduce((x,y)=>bytes(JSON.stringify(x))>=bytes(JSON.stringify(y))?x:y);
 const notes=Object.fromEntries(ids.map(id=>[id,'\u0000'.repeat(12000)]));
 await a.manager.save(longest(ids),{notes,bookmarks:Object.fromEntries(ids.map(id=>[id,true])),
  preferences:{size:60,theme:'amrit',pace:200,mode:'meaning',view:'continuous'}});
 const old=JSON.parse(a.manager.exportText());old.project=N.LEGACY_PROJECT;
 old.editionId=longest([small.editionId,...small.previousEditionIds]);
 old.exportedAt='+999999-12-31T23:59:59.999Z';
 const exact=JSON.stringify(old,null,2);assert.equal(bytes(exact),a.manager.maxBackupBytes);
 const parsed=a.manager.parse(exact);assert.equal(parsed.previousEdition,true);assert.deepEqual(parsed.payload.notes,notes);
 await b.manager.importText(exact);const before=b.manager.stored().raw;
 await assert.rejects(async()=>b.manager.importText(exact+' '),/too large/);
 assert.equal(b.manager.stored().raw,before);
});

test('Both file and text guards enforce the same byte bound, including multibyte input',async()=>{
 const {manager}=fixture(small),ids=lineIds(small);await manager.save(ids[0],{notes:{[ids[0]]:'SYNTHETIC existing'}});
 const before=manager.stored().raw,limit=manager.maxBackupBytes,ui=readerImport(manager);
 let readCalls=0;
 await assert.rejects(ui.run({size:limit+1,text:async()=>{readCalls++;return '{}';}}),/oversized/);
 assert.equal(readCalls,0,'The file gate must reject before allocating file text');
 const multibyte='ਕ'.repeat(Math.floor(limit/3)+1);
 assert.ok(multibyte.length<limit);assert.ok(bytes(multibyte)>limit);
 await assert.rejects(async()=>manager.importText(multibyte),/too large/);
 await assert.rejects(async()=>manager.importText(' '.repeat(limit+1)),/too large/);
 assert.equal(manager.stored().raw,before);
 for(const size of [NaN,Infinity,-1,limit+0.5])await assert.rejects(ui.run({size,text:async()=>{readCalls++;return '{}';}}),/oversized/);
 assert.equal(readCalls,0);
 assert.ok(limit<fixture().manager.maxBackupBytes,'The bound grows with this collection’s permitted capacity');
});

test('Larger total capacity does not relax per-note or foreign-ID validation',async()=>{
 const {manager}=fixture(),ids=lineIds(kabir);await manager.save(ids[0],{notes:{[ids[0]]:'SYNTHETIC kept'}});
 const before=manager.stored().raw,base=JSON.parse(manager.exportText());
 for(const notes of [{[ids[1]]:'x'.repeat(12001)},{'another-collection.line01':'SYNTHETIC foreign'}]){
  const changed=JSON.stringify({...base,state:{...base.state,notes}});
  assert.ok(bytes(changed)<manager.maxBackupBytes);await assert.rejects(async()=>manager.importText(changed),/invalid or outside/);
  assert.equal(manager.stored().raw,before);
 }
});
