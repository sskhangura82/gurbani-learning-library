/* Synthetic note stores only. This suite never reads browser profiles or real notes. */
import assert from "node:assert/strict";
import {webcrypto} from "node:crypto";
import {LEARNING_KEY,LEARNING_FORMAT,LIMITS,validateLearning,loadLearning,saveLearning,exportLearning,importLearning} from "../hukamnama/learning.mjs";
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const date="2026-11-27",now=new Date("2026-11-27T08:00:00.000Z");
const hash="a".repeat(64),sourceSha256="b".repeat(64),lineSha256="c".repeat(64);
const binding={eventId:"harmandir-morning."+date,date,sourceId:"sggs.text."+hash,edition:"opengranth-34d2a7c",sourceSha256,textSha256:hash,lineId:null,lineSha256:null};
const unicode="  ਸਾਸਿ ਸਾਸਿ ਸਿਮਰਹੁ ਗੋਬਿੰਦ ॥\nਜਿਨੑ  ਪ੍ਰ  👪  e\u0301 \n";
const input={binding,question:"What do I want to read again?\n",reflection:unicode};
function storage(initial=null){let value=initial;const log=[];return {log,getItem(key){assert.equal(key,LEARNING_KEY);return value;},setItem(key,next){assert.equal(key,LEARNING_KEY);log.push(next);value=next;},get raw(){return value;}};}
function locks(){let queue=Promise.resolve();const calls=[];return {calls,request(name,options,callback){calls.push({name,options});const answer=queue.then(callback);queue=answer.catch(()=>{});return answer;}};}
const copy=value=>structuredClone(value);
async function seed(target=storage(),manager=locks()){
 const saved=await saveLearning({storage:target,locks:manager,record:copy(input),baseRevision:0,now});
 assert.equal(saved.ok,true);return {storage:target,locks:manager,saved};
}
let passed=0,failures=0;
async function check(name,fn){try{await fn();passed++;console.log("PASS "+name);}catch(error){failures++;console.error("FAIL "+name+"\n"+error.stack);}}
await check("empty store is read without writing and immutable snapshots cannot mutate it",async()=>{
 const target=storage(),r=loadLearning({storage:target});assert.equal(r.ok,true);assert.equal(r.revision,0);assert.deepEqual(r.records,[]);assert.equal(target.log.length,0);assert(Object.isFrozen(r.store));
});
await check("source-bound question and Unicode reflection round-trip without trimming or normalization",async()=>{
 const {storage:target,saved,locks:manager}=await seed();
 assert.equal(saved.savedRecord.reflection,unicode);assert.equal(saved.records[0].question,input.question);assert.equal(target.log.length,1);
 assert.deepEqual(manager.calls,[{name:LEARNING_KEY,options:{mode:"exclusive"}}]);
 const exported=exportLearning({storage:target});assert.equal(exported.filename,"Hukamnama-learning.json");
 const parsed=JSON.parse(exported.text);assert.equal(parsed.format,LEARNING_FORMAT);assert.equal(parsed.records[0].reflection,unicode);
 assert.equal(parsed.records[0].binding.sourceSha256,sourceSha256);
 const restored=storage(),r=await importLearning({storage:restored,locks:locks(),text:exported.text});assert.equal(r.ok,true);assert.equal(r.records[0].reflection,unicode);assert.equal(r.records[0].question,input.question);
});
await check("same-revision edit updates only intended record and keeps creation identity",async()=>{
 const {storage:target,locks:manager,saved}=await seed();
 const r=await saveLearning({storage:target,locks:manager,record:{...copy(input),id:saved.savedRecord.id,reflection:"second"},baseRevision:saved.revision,now:new Date("2026-11-27T08:01:00Z")});
 assert.equal(r.ok,true);assert.equal(r.records.length,1);assert.equal(r.savedRecord.id,saved.savedRecord.id);assert.equal(r.savedRecord.createdAt,saved.savedRecord.createdAt);assert.equal(r.savedRecord.reflection,"second");assert.equal(r.revision,2);
});
await check("two tabs reread inside exclusive lock and preserve conflicting edits",async()=>{
 const {storage:target,locks:manager,saved}=await seed();
 const edits=await Promise.all(["first tab","second tab"].map(reflection=>saveLearning({storage:target,locks:manager,record:{...copy(input),id:saved.savedRecord.id,reflection},baseRevision:saved.revision,now})));
 assert.equal(edits.every(r=>r.ok),true);assert.equal(edits[1].status,"CONFLICT_PRESERVED");
 const current=loadLearning({storage:target});assert.equal(current.records.length,2);assert.equal(current.revision,3);
 assert.deepEqual(current.records.map(r=>r.reflection).sort(),["first tab","second tab"]);assert.equal(current.records.find(r=>r.reflection==="second tab").conflictOf,saved.savedRecord.id);
});
await check("concurrent new notes both survive and one key is written per transaction",async()=>{
 const target=storage(),manager=locks();
 const r=await Promise.all(["new one","new two"].map(reflection=>saveLearning({storage:target,locks:manager,record:{...copy(input),reflection},baseRevision:0,now})));
 assert(r.every(x=>x.ok));assert.equal(loadLearning({storage:target}).records.length,2);assert.equal(target.log.length,2);
});
await check("existing historical note remains editable under its unavailable source binding",async()=>{
 const historic=copy(input);historic.binding.date="2000-01-01";historic.binding.eventId="harmandir-morning.2000-01-01";historic.binding.edition="historical-edition-not-installed";
 const target=storage(),manager=locks(),first=await saveLearning({storage:target,locks:manager,record:historic,baseRevision:0,now});
 assert(first.ok);const next=await saveLearning({storage:target,locks:manager,record:{...historic,id:first.savedRecord.id,reflection:"still bound to the historical source"},baseRevision:first.revision,now});
 assert(next.ok);assert.deepEqual(next.savedRecord.binding,historic.binding);
});
await check("note cannot be silently rebound onto a different date, source, or line",async()=>{
 const {storage:target,locks:manager,saved}=await seed();const before=target.raw;
 for(const mutate of [b=>{b.date="2026-11-26";b.eventId="harmandir-morning."+b.date;},b=>{b.sourceSha256="d".repeat(64);},b=>{b.lineSha256=lineSha256;b.lineId=b.sourceId+".line."+lineSha256+".1";}]){
  const changed=copy(input);mutate(changed.binding);const r=await saveLearning({storage:target,locks:manager,record:{...changed,id:saved.savedRecord.id},baseRevision:saved.revision,now});
  assert.equal(r.status,"SOURCE_BINDING_MISMATCH");assert.equal(target.raw,before);
 }
});
await check("malformed and unknown existing stores are preserved on save/import/export",async()=>{
 const valid=(await seed()).storage.raw;
 for(const malformed of ["{broken",JSON.stringify({format:"future-format",version:2,records:[]}),""]){
  const target=storage(malformed);assert.equal(loadLearning({storage:target}).status,"MALFORMED_STORE");
  assert.equal((await saveLearning({storage:target,locks:locks(),record:copy(input),baseRevision:0,now})).ok,false);
  assert.equal((await importLearning({storage:target,locks:locks(),text:valid})).ok,false);
  assert.equal(exportLearning({storage:target}).ok,false);assert.equal(target.raw,malformed);assert.equal(target.log.length,0);
 }
});
await check("malformed, wrong-version, duplicate-id and oversized imports change nothing",async()=>{
 const {storage:target}=await seed(),before=target.raw,valid=JSON.parse(before),duplicate=copy(valid);duplicate.records.push(copy(duplicate.records[0]));
 for(const text of ["{broken",JSON.stringify({...valid,version:2}),JSON.stringify(duplicate),"x".repeat(LIMITS.store*2+1)]){
  const r=await importLearning({storage:target,locks:locks(),text});assert.equal(r.status,"INVALID_IMPORT");assert.equal(target.raw,before);
 }
});
await check("merge retains old notes and conflicting imported copies, repeated exact import is a no-op",async()=>{
 const {storage:target,saved}=await seed(),incoming=JSON.parse(target.raw);
 incoming.records[0].reflection="a different device edit";
 incoming.records.push({...copy(incoming.records[0]),id:"another-device-note",binding:{...copy(binding),date:"2010-01-01",eventId:"harmandir-morning.2010-01-01"}});
 const r=await importLearning({storage:target,locks:locks(),text:JSON.stringify(incoming)});
 assert(r.ok);assert.equal(r.status,"CONFLICT_PRESERVED");assert.equal(r.records.length,3);assert.equal(r.records.find(r=>r.id===saved.savedRecord.id).reflection,unicode);assert(r.records.some(r=>r.conflictOf===saved.savedRecord.id));
 const snapshot=exportLearning({storage:target}).text,before=target.raw;
 const again=await importLearning({storage:target,locks:locks(),text:snapshot});assert.equal(again.status,"UNCHANGED");assert.equal(target.raw,before);
});
await check("quota errors preserve previous note bytes for both save and full restore",async()=>{
 const original=(await seed()).storage.raw;
 const target={getItem(){return original;},setItem(){throw new DOMException("synthetic quota","QuotaExceededError");}};
 const current=loadLearning({storage:target});
 const saved=await saveLearning({storage:target,locks:locks(),record:{...copy(input),id:current.records[0].id,reflection:"unsaved change"},baseRevision:current.revision,now});
 assert.equal(saved.status,"QUOTA_EXCEEDED");assert.match(saved.message,/preserved/);assert.equal(target.getItem(),original);
 const incoming=JSON.parse(original);incoming.records[0].id="different-note";
 const imported=await importLearning({storage:target,locks:locks(),text:JSON.stringify(incoming)});
 assert.equal(imported.status,"QUOTA_EXCEEDED");assert.match(imported.message,/preserved/);assert.equal(target.getItem(),original);
});
await check("record and total-size limits refuse whole transaction without shortening text",async()=>{
 const {storage:target,locks:manager,saved}=await seed(),before=target.raw;
 const tooLong=await saveLearning({storage:target,locks:manager,record:{...copy(input),id:saved.savedRecord.id,reflection:"x".repeat(LIMITS.reflection+1)},baseRevision:saved.revision,now});
 assert.equal(tooLong.ok,false);assert.equal(target.raw,before);
 const full=JSON.parse(before);full.records=Array.from({length:LIMITS.records},(_,i)=>({...copy(full.records[0]),id:"note-"+i,reflection:""}));const fullTarget=storage(JSON.stringify(full)),fullBefore=fullTarget.raw;
 assert.equal((await saveLearning({storage:fullTarget,locks:locks(),record:copy(input),baseRevision:full.revision,now})).status,"SIZE_OR_FORMAT_LIMIT");assert.equal(fullTarget.raw,fullBefore);
});
await check("missing Web Locks refuses writes/import while read and export remain available",async()=>{
 const {storage:target}=await seed(),before=target.raw;
 assert.equal((await saveLearning({storage:target,locks:{},record:copy(input),baseRevision:1,now})).status,"LOCK_UNAVAILABLE");
 assert.equal((await importLearning({storage:target,locks:{},text:before})).status,"LOCK_UNAVAILABLE");
 assert(loadLearning({storage:target}).ok);assert(exportLearning({storage:target}).ok);assert.equal(target.raw,before);
});
await check("exact line identity round-trips and duplicate/wrong identities are rejected",async()=>{
 const precise=copy(input);precise.binding.lineSha256=lineSha256;precise.binding.lineId=binding.sourceId+".line."+lineSha256+".2";
 const target=storage();const r=await saveLearning({storage:target,locks:locks(),record:precise,baseRevision:0,now});assert(r.ok);assert.deepEqual(r.savedRecord.binding,precise.binding);
 const malformed=JSON.parse(target.raw);malformed.records[0].binding.lineId="row33";assert.throws(()=>validateLearning(malformed));assert.equal((await importLearning({storage:target,locks:locks(),text:JSON.stringify(malformed)})).status,"INVALID_IMPORT");
});
console.log("Private learning synthetic checks: "+passed+" passed; "+failures+" failed.");
if(failures)process.exitCode=1;
