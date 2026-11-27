/* Observable backup retry promises; synthetic memory stores only. */
import assert from 'node:assert/strict';
import test from 'node:test';
import {LEARNING_KEY,LEARNING_FORMAT,LIMITS,importLearning,exportLearning,loadLearning} from '../hukamnama/learning.mjs';
const copy=value=>structuredClone(value);
const hash='a'.repeat(64),sourceHash='b'.repeat(64),lineHash='c'.repeat(64);
const binding={eventId:'harmandir-morning.2026-11-27',date:'2026-11-27',sourceId:'sggs.text.'+hash,edition:'synthetic-edition',sourceSha256:sourceHash,textSha256:hash,lineId:null,lineSha256:null};
const record=(id,changes={})=>({id,binding:copy(binding),question:'Synthetic question',reflection:'  ਨਿੱਜੀ ਨੋਟ  e\u0301 👪\n',createdAt:'2026-11-27T08:00:00.000Z',updatedAt:'2026-11-27T09:00:00.000Z',...changes});
const backup=(records,revision=1)=>JSON.stringify({format:LEARNING_FORMAT,version:1,revision,records});
function memory(raw=null){let value=raw;const writes=[];return {writes,get raw(){return value;},getItem(key){assert.equal(key,LEARNING_KEY);return value;},setItem(key,next){assert.equal(key,LEARNING_KEY);writes.push(next);value=next;}};}
function locks(){let queue=Promise.resolve();return {request(name,options,fn){assert.equal(name,LEARNING_KEY);assert.deepEqual(options,{mode:'exclusive'});const next=queue.then(fn);queue=next.catch(()=>{});return next;}};}
function sequence(...values){let calls=0;const fn=()=>{calls++;return values[calls-1]??'unexpected-synthetic-'+calls;};Object.defineProperty(fn,'calls',{get:()=>calls});return fn;}
const run=(storage,records,extra={})=>importLearning({storage,locks:locks(),text:backup(records),...extra});
const reversed=value=>Array.isArray(value)?value.map(reversed):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).reverse().map(([k,v])=>[k,reversed(v)])):value;

test('Retrying the original conflicting backup leaves bytes, revision, count and identity allocation unchanged',async()=>{
 const original=record('note-a'),incoming=record('note-a',{reflection:'Second device version\n'}),storage=memory(backup([original]));
 const ids=sequence('preserved-b'),first=await run(storage,[incoming],{idFactory:ids});
 assert.equal(first.status,'CONFLICT_PRESERVED');assert.equal(first.imported,1);assert.equal(first.records.length,2);assert.deepEqual(first.records[0],original);
 const before=storage.raw,writes=storage.writes.length;
 const repeat=await run(storage,[incoming],{idFactory:ids});
 assert.equal(repeat.status,'UNCHANGED');assert.equal(repeat.imported,0);assert.equal(repeat.revision,first.revision);assert.equal(storage.raw,before);assert.equal(storage.writes.length,writes);assert.equal(ids.calls,1);
});

test('JSON key order does not turn an exact note or a preserved version into a new edit',async()=>{
 const original=record('note-a'),storage=memory(backup([original]));
 const same=await run(storage,[reversed(original)],{idFactory:sequence()});assert.equal(same.status,'UNCHANGED');assert.equal(storage.writes.length,0);
 const incoming=record('note-a',{question:'Another exact question'});
 assert.equal((await run(storage,[incoming],{idFactory:sequence('copy-b')})).status,'CONFLICT_PRESERVED');
 const before=storage.raw;
 assert.equal((await run(storage,[reversed(incoming)],{idFactory:sequence()})).status,'UNCHANGED');assert.equal(storage.raw,before);
});

test('Unrelated explicit identities with identical content remain independent notes',async()=>{
 const original=record('note-a'),independent=record('note-b'),storage=memory(backup([original]));
 const result=await run(storage,[independent],{idFactory:sequence()});assert.equal(result.status,'IMPORTED');assert.deepEqual(result.records,[original,independent]);
 const empty=memory(),linked=record('copy-a',{conflictOf:'note-a'});
 const fresh=await run(empty,[original,linked],{idFactory:sequence()});assert.deepEqual(fresh.records,[original,linked]);
});

test('Every distinct exact text, timestamp and source binding remains a separate preserved version',async()=>{
 const original=record('note-a'),storage=memory(backup([original]));
 const variants=[
  r=>{r.question+=' ';},r=>{r.reflection+='\n';},r=>{r.reflection=r.reflection.normalize('NFC');},
  r=>{r.createdAt='2026-11-27T07:00:00.000Z';},r=>{r.updatedAt='2026-11-27T10:00:00.000Z';},
  r=>{r.binding.date='2026-11-26';r.binding.eventId='harmandir-morning.2026-11-26';},
  r=>{r.binding.edition='another-synthetic-edition';},r=>{r.binding.sourceSha256='d'.repeat(64);},
  r=>{r.binding.textSha256='e'.repeat(64);r.binding.sourceId='sggs.text.'+r.binding.textSha256;},
  r=>{r.binding.lineSha256=lineHash;r.binding.lineId=r.binding.sourceId+'.line.'+lineHash+'.1';}
 ];
 for(let i=0;i<variants.length;i++){
  const incoming=copy(original);variants[i](incoming);const added=await run(storage,[incoming],{idFactory:sequence('copy-'+i)});
  assert.equal(added.status,'CONFLICT_PRESERVED');assert.equal(added.records.length,i+2);assert.deepEqual(added.records.at(-1),{...incoming,id:'copy-'+i,conflictOf:original.id});
  const before=storage.raw;assert.equal((await run(storage,[incoming],{idFactory:sequence()})).status,'UNCHANGED');assert.equal(storage.raw,before);
 }
 assert.deepEqual(loadLearning({storage}).records[0],original);
});

test('A backup already containing its conflict copy adds no manufactured duplicate in either input order',async()=>{
 const original=record('note-a'),changed=record('note-a',{reflection:'other version'}),preserved={...copy(changed),id:'copy-b',conflictOf:'note-a'};
 for(const incoming of [[changed,preserved],[preserved,changed]]){
  const storage=memory(backup([original]));const result=await run(storage,incoming,{idFactory:sequence()});
  assert.equal(result.ok,true);assert.equal(result.imported,1);assert.deepEqual(result.records,[original,preserved]);
  const before=storage.raw;assert.equal((await run(storage,incoming,{idFactory:sequence()})).status,'UNCHANGED');assert.equal(storage.raw,before);
 }
});

test('Generated copies cannot occupy an explicit incoming identity',async()=>{
 const original=record('note-a'),changed=record('note-a',{reflection:'changed'}),incoming=record('incoming-b',{reflection:'independent'}),storage=memory(backup([original]));
 const ids=sequence('incoming-b','generated-c'),result=await run(storage,[changed,incoming],{idFactory:ids});
 assert.equal(result.ok,true);assert.equal(ids.calls,2);assert.deepEqual(result.records.find(r=>r.id==='incoming-b'),incoming);
 assert.equal(result.records.find(r=>r.id==='generated-c').reflection,'changed');
 const before=storage.raw;assert.equal((await run(storage,[changed,incoming],{idFactory:sequence()})).status,'UNCHANGED');assert.equal(storage.raw,before);
});

test('Nested conflict versions and their exports restore without repeated growth',async()=>{
 const original=record('note-a'),first=record('copy-b',{conflictOf:'note-a',reflection:'first conflict'}),storage=memory(backup([original,first]));
 const changed={...copy(first),reflection:'edited conflict'};
 const imported=await run(storage,[changed],{idFactory:sequence('copy-c')});assert.equal(imported.status,'CONFLICT_PRESERVED');assert.equal(imported.records.at(-1).conflictOf,'copy-b');
 const before=storage.raw;assert.equal((await run(storage,[changed],{idFactory:sequence()})).status,'UNCHANGED');assert.equal(storage.raw,before);
 const exported=exportLearning({storage}),fresh=memory();assert((await importLearning({storage:fresh,locks:locks(),text:exported.text})).ok);
 assert.deepEqual(loadLearning({storage:fresh}).records,loadLearning({storage}).records);
 const freshBefore=fresh.raw;assert.equal((await importLearning({storage:fresh,locks:locks(),text:exported.text,idFactory:sequence()})).status,'UNCHANGED');assert.equal(fresh.raw,freshBefore);
});

test('Existing accidental duplicates are retained but not multiplied',async()=>{
 const original=record('note-a'),changed=record('note-a',{reflection:'preserved'});
 const copies=['copy-b','copy-c'].map(id=>({...copy(changed),id,conflictOf:'note-a'}));const storage=memory(backup([original,...copies])),before=storage.raw;
 assert.equal((await run(storage,[changed],{idFactory:sequence()})).status,'UNCHANGED');assert.equal(storage.raw,before);assert.equal(storage.writes.length,0);
});

test('Mixed imports add only new identities and new versions with one revision and write',async()=>{
 const original=record('note-a'),old=record('copy-b',{conflictOf:'note-a',reflection:'old conflict'}),storage=memory(backup([original,old],7));
 const unchanged={...copy(old),id:'note-a'};delete unchanged.conflictOf;
 const newNote=record('new-c'),nested={...copy(old),question:'A new nested question'};
 const imported=await run(storage,[unchanged,newNote,nested],{idFactory:sequence('new-d')});assert.equal(imported.ok,true);assert.equal(imported.imported,2);assert.equal(imported.revision,8);assert.equal(storage.writes.length,1);
 const before=storage.raw;assert.equal((await run(storage,[unchanged,newNote,nested],{idFactory:sequence()})).status,'UNCHANGED');assert.equal(storage.raw,before);
});

test('Concurrent retries reread under the lock and preserve a single incoming version',async()=>{
 const original=record('note-a'),changed=record('note-a',{reflection:'incoming'}),storage=memory(backup([original])),manager=locks(),ids=sequence('copy-b');
 const results=await Promise.all([1,2].map(()=>importLearning({storage,locks:manager,text:backup([changed]),idFactory:ids})));
 assert.deepEqual(results.map(r=>r.status),['CONFLICT_PRESERVED','UNCHANGED']);assert.equal(storage.writes.length,1);assert.equal(loadLearning({storage}).records.length,2);
});

test('At the record limit, an already represented restore is unchanged and genuinely new content refuses atomically',async()=>{
 const original=record('note-a'),changed=record('note-a',{reflection:'incoming'}),preserved={...copy(changed),id:'copy-b',conflictOf:'note-a'};
 const filler=Array.from({length:LIMITS.records-2},(_,i)=>record('filler-'+i,{reflection:''}));const storage=memory(backup([original,preserved,...filler])),before=storage.raw;
 assert.equal((await run(storage,[changed],{idFactory:sequence()})).status,'UNCHANGED');assert.equal(storage.raw,before);assert.equal(storage.writes.length,0);
 assert.equal((await run(storage,[record('new-note')],{idFactory:sequence()})).status,'SIZE_OR_FORMAT_LIMIT');assert.equal(storage.raw,before);assert.equal(storage.writes.length,0);
});

test('Quota failure preserves the entire old store and unchanged restores do not attempt a write',async()=>{
 const original=record('note-a'),changed=record('note-a',{reflection:'incoming'}),preserved={...copy(changed),id:'copy-b',conflictOf:'note-a'},raw=backup([original,preserved]);let attempts=0;
 const storage={getItem:()=>raw,setItem(){attempts++;throw new DOMException('synthetic quota','QuotaExceededError');}};
 assert.equal((await run(storage,[changed],{idFactory:sequence()})).status,'UNCHANGED');assert.equal(attempts,0);
 assert.equal((await run(storage,[record('new-c')],{idFactory:sequence()})).status,'QUOTA_EXCEEDED');assert.equal(attempts,1);assert.equal(storage.getItem(),raw);
});
