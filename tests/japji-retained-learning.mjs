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
const report={status:'PASS',total:checks.length,scope:'Japji unknown/oversize/colliding saved-learning preservation, real normalizer and storage; synthetic records only',checks};
fs.writeFileSync(new URL('../evidence/japji-retained-learning-verification.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',total:checks.length}));
