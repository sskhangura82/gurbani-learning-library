// CI-R-02: real normalizer/storage, synthetic records; no user learning accessed.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),C=require('../js/continuous-core.js'),L=require('../js/learning.js'),S=require('../js/shared-learning.js');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../js/japji-full-data.js',import.meta.url),'utf8'),context);
const units=context.window.GLP_FULL_JAPJI.units,model=C.flatten(units),norm=value=>C.normalise(value,model,units);
L.configureContinuous(C,model,units);
const checks=[];
async function test(name,fn){await fn();checks.push({name,status:'PASS'});}
const storage=()=>{const rows=new Map();return{getItem:key=>rows.get(key)??null,setItem:(key,value)=>rows.set(key,value),removeItem:key=>rows.delete(key)};};
const locks={request:async(name,options,fn)=>typeof options==='function'?options():fn({})};
await test('An unknown saved note is kept in full with its original identifier',()=>{
 const text='SYNTHETIC original note · ਪੰਜਾਬੀ',state=norm({notes:{'future.line01':text}});
 assert.deepEqual(state.keptAside.notes,[{id:'future.line01',text,reason:'unknown_line'}]);
 assert.equal(state.notes['future.line01'],undefined);
});
await test('Unknown bookmarks are kept separately while recognized bookmarks still work',()=>{
 const state=norm({bookmarks:['future.line01','pauri02.line01','pauri02']});
 assert.deepEqual(state.bookmarks,['pauri02.line01']);assert.deepEqual(state.keptAside.bookmarks,['future.line01']);
});
await test('A reflection beyond the editing limit is retained without truncation',()=>{
 const text='SYNTHETIC '+ 'ਕ'.repeat(12010),state=norm({notes:{'pauri02.line01':text}});
 assert.equal(state.keptAside.notes[0].text,text);assert.equal(state.keptAside.notes[0].reason,'long_reflection');assert.equal(state.notes['pauri02.line01'],undefined);
});
await test('Legacy section and occurrence notes that collide are both preserved',()=>{
 const state=norm({notes:{pauri02:'SYNTHETIC section note','pauri02.line01':'SYNTHETIC line note'}});
 assert.equal(state.notes['pauri02.line01'],'SYNTHETIC section note');
 assert.deepEqual(state.keptAside.notes,[{id:'pauri02.line01',text:'SYNTHETIC line note',reason:'migration_collision'}]);
});
await test('Repeated reads neither duplicate retained entries nor lose their contents',()=>{
 const state=norm({notes:{unknown:'SYNTHETIC retained'},bookmarks:['unknown']});assert.deepEqual(norm(state),state);assert.deepEqual(norm(norm(state)),state);
});
await test('Known notes and reading controls remain usable with retained items present',async()=>{
 const store=storage(),state=norm({notes:{unknown:'SYNTHETIC retained'},bookmarks:['unknown']});store.setItem(L.CONT,JSON.stringify(state));
 const manager=S.create({storage:store,locks,key:L.CONT,normalise:norm,seed:state});
 const saved=await manager.save(state,{notes:{'pauri02.line01':'SYNTHETIC new note'},preferences:{mode:'study'}});
 assert.equal(saved.notes['pauri02.line01'],'SYNTHETIC new note');assert.equal(saved.mode,'study');assert.deepEqual(saved.keptAside,state.keptAside);
});
await test('A stale tab keeps newly retained items from the latest stored record',async()=>{
 const store=storage(),old=norm({}),current=norm({notes:{unknown:'SYNTHETIC other-tab retained'}});store.setItem(L.CONT,JSON.stringify(current));
 const manager=S.create({storage:store,locks,key:L.CONT,normalise:norm,seed:old});await manager.save(old,{preferences:{theme:'amrit'}});
 assert.deepEqual(JSON.parse(store.getItem(L.CONT)).keptAside,current.keptAside);
});
await test('Export and restore to an empty browser keeps every retained note and bookmark',()=>{
 const first=storage(),second=storage(),state=norm({notes:{unknown:'SYNTHETIC exported'},bookmarks:['unknown']});first.setItem(L.CONT,JSON.stringify(state));
 L.importAll(second,L.parse(L.exportAll(first)));assert.deepEqual(JSON.parse(second.getItem(L.CONT)).keptAside,state.keptAside);
});
await test('Import merges both sets of retained notes without replacing conflicting text',()=>{
 const store=storage(),one=norm({notes:{unknown:'SYNTHETIC current'}}),two=norm({notes:{unknown:'SYNTHETIC imported'},bookmarks:['unknown']});store.setItem(L.CONT,JSON.stringify(one));
 const incoming=L.parse(C.exportState(two));L.importAll(store,incoming);L.importAll(store,incoming);
 const result=JSON.parse(store.getItem(L.CONT));assert.deepEqual(result.keptAside.notes.map(n=>n.text),['SYNTHETIC current','SYNTHETIC imported']);assert.deepEqual(result.keptAside.bookmarks,['unknown']);
});
await test('Malformed retained-learning fields refuse writes and preserve the original raw record',async()=>{
 for(const keptAside of [{notes:'wrong',bookmarks:[]},{notes:[{id:'x',text:123,reason:'unknown_line'}],bookmarks:[]},{notes:[],bookmarks:[17]}]){
  const store=storage(),raw=JSON.stringify({...norm({}),keptAside});store.setItem(L.CONT,raw);
  const manager=S.create({storage:store,locks,key:L.CONT,normalise:norm,seed:norm({})});await assert.rejects(()=>manager.save(norm({})));assert.equal(store.getItem(L.CONT),raw);
 }
});
await test('Invalid non-text notes refuse normalization rather than silently disappearing',()=>{assert.throws(()=>norm({notes:{unknown:{text:'SYNTHETIC'}}}));assert.throws(()=>norm({bookmarks:[17]}));});
// Older readers normalize and replace only the v2 record. Model that exact
// destructive write using a deliberately old-shaped record: never touch RETAINED.
function oldWrite(store,preferences={}){
 const prior=JSON.parse(store.getItem(L.CONT)||'{}');
 const old=norm({...prior,...preferences});delete old.keptAside;
 store.setItem(L.CONT,JSON.stringify(old));
}
const savedFixture=()=>norm({notes:{unknown:'SYNTHETIC retained across rollback','pauri02.line01':'SYNTHETIC ordinary'},bookmarks:['unknown']});
const archiveOf=store=>JSON.parse(store.getItem(L.RETAINED)).keptAside;
await test('New write archives retained items before an old tab can replace the v2 record',async()=>{
 const store=storage(),seed=savedFixture(),safe=L.protectRetained(store);
 store.setItem(L.CONT,JSON.stringify(seed));
 const manager=S.create({storage:safe,locks,key:L.CONT,normalise:norm,seed});
 await manager.save(seed);
 const savedArchive=store.getItem(L.RETAINED);
 assert.deepEqual(archiveOf(store),seed.keptAside);
 oldWrite(store,{theme:'amrit'});
 assert.equal(JSON.parse(store.getItem(L.CONT)).keptAside,undefined);
 assert.equal(store.getItem(L.RETAINED),savedArchive);
 assert.deepEqual(manager.read().keptAside,seed.keptAside);
 assert.equal(manager.read().theme,'amrit');
 await manager.save(manager.read(),{notes:{'pauri02.line01':'SYNTHETIC edited after rollback'}});
 assert.deepEqual(archiveOf(store),seed.keptAside);
});
await test('Archive is persisted even when a previously unseen unknown note is opened before any main write',()=>{
 const store=storage(),raw=JSON.stringify({version:2,notes:{future:'SYNTHETIC unplaced'},bookmarks:['future']});
 store.setItem(L.CONT,raw);
 const state=norm(JSON.parse(L.protectRetained(store).getItem(L.CONT)));
 L.archiveRetained(store,state.keptAside);
 assert.equal(store.getItem(L.CONT),raw);
 oldWrite(store);
 assert.deepEqual(norm(JSON.parse(L.protectRetained(store).getItem(L.CONT))).keptAside,state.keptAside);
});
await test('Export after an old overwrite carries the independent archive and restores it to a new browser',()=>{
 const store=storage(),dest=storage(),seed=savedFixture();
 L.protectRetained(store).setItem(L.CONT,JSON.stringify(seed));oldWrite(store);
 const backup=L.exportAll(store),bundle=JSON.parse(backup);
 assert.equal(bundle.records[L.RETAINED],store.getItem(L.RETAINED));
 assert.equal(bundle.records[L.CONT],store.getItem(L.CONT));
 L.importAll(dest,L.parse(backup));
 assert.deepEqual(archiveOf(dest),seed.keptAside);
 assert.deepEqual(norm(JSON.parse(L.protectRetained(dest).getItem(L.CONT))).keptAside,seed.keptAside);
});
await test('Restoring a retained archive alone keeps current notes and merges the retained records',()=>{
 const store=storage(),seed=savedFixture(),safe=L.protectRetained(store);
 safe.setItem(L.CONT,JSON.stringify(seed));
 const incoming={version:1,keptAside:norm({notes:{unknown:'SYNTHETIC second retained'}}).keptAside};
 const backup=JSON.stringify({format:'glp-family-learning',version:1,projectId:'GLP-001',records:{[L.RETAINED]:JSON.stringify(incoming)}});
 L.importAll(store,L.parse(backup));L.importAll(store,L.parse(backup));
 assert.equal(archiveOf(store).notes.length,2);
 assert.equal(norm(JSON.parse(safe.getItem(L.CONT))).notes['pauri02.line01'],'SYNTHETIC ordinary');
});
await test('If writing the separate archive fails, the original primary record is not replaced',async()=>{
 const store=storage(),state=savedFixture(),raw=JSON.stringify(state);
 store.setItem(L.CONT,raw);
 const put=store.setItem;store.setItem=(k,v)=>{if(k===L.RETAINED)throw Error('SYNTHETIC quota');put(k,v);};
 const manager=S.create({storage:L.protectRetained(store),locks,key:L.CONT,normalise:norm,seed:state});
 await assert.rejects(()=>manager.save(state,{preferences:{theme:'amrit'}}),/quota/);
 assert.equal(store.getItem(L.CONT),raw);assert.equal(store.getItem(L.RETAINED),null);
});
await test('Damaged archive refuses new writes and is exported byte for byte',async()=>{
 const store=storage(),seed=savedFixture(),bad='{"version":1,"keptAside":';
 const raw=JSON.stringify(seed);store.setItem(L.CONT,raw);store.setItem(L.RETAINED,bad);
 const manager=S.create({storage:L.protectRetained(store),locks,key:L.CONT,normalise:norm,seed});
 await assert.rejects(()=>manager.save(seed));
 assert.equal(store.getItem(L.CONT),raw);assert.equal(store.getItem(L.RETAINED),bad);
 const bundle=JSON.parse(L.exportAll(store));assert.equal(bundle.records[L.RETAINED],bad);assert.equal(bundle.records[L.CONT],raw);
});
await test('Failed primary write during import rolls back the archive without losing earlier retained items',()=>{
 const store=storage(),seed=savedFixture(),safe=L.protectRetained(store);
 safe.setItem(L.CONT,JSON.stringify(seed));const prior=store.getItem(L.RETAINED),primary=store.getItem(L.CONT);
 const put=store.setItem;store.setItem=(k,v)=>{if(k===L.CONT)throw Error('SYNTHETIC quota');put(k,v);};
 const incoming=L.parse(C.exportState(norm({notes:{future:'SYNTHETIC other'}})));
 assert.throws(()=>L.importAll(store,incoming));assert.equal(store.getItem(L.RETAINED),prior);assert.equal(store.getItem(L.CONT),primary);
});
await test('An ordinary reader without retained items does not create an archive',()=>{
 const store=storage();L.protectRetained(store).setItem(L.CONT,JSON.stringify(norm({notes:{'pauri02.line01':'SYNTHETIC ordinary'}})));
 assert.equal(store.getItem(L.RETAINED),null);
});
await test('The actual published normalizer and shared writer cannot erase the new separate archive',async()=>{
 const OldC=require('./fixtures/rt1-published/continuous-core.js'),OldS=require('./fixtures/rt1-published/shared-learning.js');
 const oldModel=OldC.flatten(units),oldNorm=v=>OldC.normalise(v,oldModel,units);
 const store=storage(),seed=savedFixture(),old=OldS.create({storage:store,locks,key:L.CONT,normalise:oldNorm,seed:oldNorm({})});
 L.protectRetained(store).setItem(L.CONT,JSON.stringify(seed));
 const archive=store.getItem(L.RETAINED);
 await old.save(oldNorm({}),{preferences:{theme:'amrit'}});
 assert.equal(JSON.parse(store.getItem(L.CONT)).keptAside,undefined);
 assert.equal(store.getItem(L.RETAINED),archive);
 const reopened=L.protectRetained(store);
 assert.deepEqual(norm(JSON.parse(reopened.getItem(L.CONT))).keptAside,seed.keptAside);
 assert.equal(norm(JSON.parse(reopened.getItem(L.CONT))).notes['pauri02.line01'],'SYNTHETIC ordinary');
});
const report={status:'PASS',total:checks.length,scope:'Japji retained-learning preservation, published old-writer fixture, backup and failure behavior; synthetic records only',checks};
fs.writeFileSync(new URL('../evidence/japji-retained-learning-verification.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',total:checks.length}));
