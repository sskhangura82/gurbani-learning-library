// Synthetic records only. Failure and retry exercise the actual storage manager.
import assert from 'node:assert/strict';
import test from 'node:test';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),N=require('../nitnem/local-learning.js');
const pack={compositionId:'SYNTHETIC',editionId:'current',previousEditionIds:['previous'],
 units:[{lines:[{id:'a'},{id:'b'},{id:'c'}]}]};
function fixture({legacy=false,empty=false}={}){
 const map=new Map([['glp001.synthetic.other','SYNTHETIC OTHER READER']]);
 const edition=legacy?'previous':'current';
 const record={schema:1,compositionId:pack.compositionId,editionId:edition,rev:8,
  savedAt:'2026-11-26T00:00:00.000Z',payload:{notes:{a:'SYNTHETIC saved note'},bookmarks:['a'],
   lineId:'b',size:42,theme:'amrit',pace:80,mode:'meaning',view:'continuous'}};
 if(!empty)map.set(N.keyFor(pack.compositionId,edition),JSON.stringify(record));
 let failure=null,attempts=0;
 const storage={getItem:key=>map.get(key)??null,setItem(key,value){attempts++;if(failure)throw failure;map.set(key,value);}};
 const manager=N.create(pack,{storage,locks:{request:async(_name,fn)=>fn()}});
 const backup=JSON.stringify({project:N.PROJECT,schema:1,compositionId:pack.compositionId,
  editionId:'current',state:{...manager.seed(),notes:{c:'SYNTHETIC imported note'},bookmarks:['c']}});
 return {map,manager,backup,fail(error){failure=error;},get attempts(){return attempts;}};
}
const quotaErrors=[
 {name:'QuotaExceededError',code:22,message:'SYNTHETIC raw browser quota details'},
 {name:'NS_ERROR_DOM_QUOTA_REACHED',code:1014,message:'SYNTHETIC raw legacy quota details'},
 {name:'DOMException',code:22,message:'SYNTHETIC raw unnamed quota details'}
];
for(const raw of quotaErrors)test('Quota failure '+raw.name+' is explained and preserves every existing record',async()=>{
 const f=fixture(),before=[...f.map];f.fail(raw);
 await assert.rejects(f.manager.importText(f.backup),error=>{
  assert.equal(error.code,'LEARNING_STORAGE_FULL');
  assert.match(error.message,/not enough (?:available )?(?:storage )?space/i);
  assert.match(error.message,/existing saved learning is preserved/i);
  assert.match(error.message,/backup file/i);
  assert.doesNotMatch(error.message,/SYNTHETIC raw|setItem|DOMException/);
  return true;
 });
 assert.deepEqual([...f.map],before);assert.equal(f.attempts,1);
 assert.equal(f.manager.read().rev,8);assert.equal(f.manager.read().payload.lineId,'b');
 assert.equal(JSON.parse(f.manager.exportText()).state.notes.a,'SYNTHETIC saved note');
});
test('First restore into an empty collection leaves it empty on quota refusal',async()=>{
 const f=fixture({empty:true}),before=[...f.map];f.fail(quotaErrors[0]);
 await assert.rejects(f.manager.importText(f.backup),{code:'LEARNING_STORAGE_FULL'});
 assert.deepEqual([...f.map],before);assert.equal(f.manager.stored().raw,null);
});
test('Quota refusal during edition migration preserves the earlier edition byte for byte',async()=>{
 const f=fixture({legacy:true}),before=[...f.map];f.fail(quotaErrors[0]);
 await assert.rejects(f.manager.importText(f.backup),{code:'LEARNING_STORAGE_FULL'});
 assert.deepEqual([...f.map],before);assert.equal(f.map.has(f.manager.key),false);
 assert.equal(f.manager.read().rev,8);
});
test('A failed note edit neither advances revision nor alters existing notes or preferences',async()=>{
 const f=fixture(),before=[...f.map];f.fail(quotaErrors[0]);
 await assert.rejects(f.manager.save('c',{notes:{a:'SYNTHETIC replacement'}}),{code:'LEARNING_STORAGE_FULL'});
 assert.deepEqual([...f.map],before);
});
test('Storage access failures receive a preservation message without falsely claiming full storage',async()=>{
 const f=fixture(),before=[...f.map];f.fail({name:'SecurityError',message:'SYNTHETIC raw access detail'});
 await assert.rejects(f.manager.importText(f.backup),error=>{
  assert.equal(error.code,'LEARNING_STORAGE_UNAVAILABLE');
  assert.match(error.message,/existing saved learning is preserved/i);
  assert.doesNotMatch(error.message,/not enough|SYNTHETIC raw/);return true;
 });
 assert.deepEqual([...f.map],before);
});
test('The same import can be retried successfully after capacity is available, without a stuck lock',async()=>{
 const f=fixture(),other=f.map.get('glp001.synthetic.other');f.fail(quotaErrors[0]);
 await assert.rejects(f.manager.importText(f.backup),{code:'LEARNING_STORAGE_FULL'});
 f.fail(null);const imported=await f.manager.importText(f.backup);
 assert.equal(imported.rev,9);assert.equal(imported.payload.notes.a,'SYNTHETIC saved note');
 assert.equal(imported.payload.notes.c,'SYNTHETIC imported note');
 assert.deepEqual(imported.payload.bookmarks,['a','c']);assert.equal(imported.payload.lineId,'b');
 assert.equal(f.map.get('glp001.synthetic.other'),other);
});
