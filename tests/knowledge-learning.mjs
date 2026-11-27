import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {LEARNING_KEY,FORMAT,LIMITS,JOURNEY_BINDING,loadLearning,validateLearning,saveLearning,exportLearning,importLearning,journeyAvailable,sameBinding,validDate,localDate,weekFrom,returnReady} from "../knowledge/learning.mjs";
import {loadKnowledge,sha256} from "../knowledge/registry.mjs";
import {buildIndex} from "../knowledge/core.mjs";
const source=await fs.readFile(new URL("../knowledge/scripture.json",import.meta.url)),teaching=await fs.readFile(new URL("../knowledge/pilot.json",import.meta.url));
const index=buildIndex(await loadKnowledge(source,teaching,await sha256(teaching)));
const stamp="2026-11-27T12:00:00.000Z";
function fixture(){
 const data=new Map([["synthetic.other.reader","preserved"]]);let writes=0,seq=0,quota=false;
 const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>{if(quota)throw new DOMException("quota","QuotaExceededError");writes++;data.set(k,v);}};
 const locks={request:async(name,options,fn)=>{assert.equal(name,LEARNING_KEY);assert.equal(options.mode,"exclusive");return fn();}};
 return {storage,locks,data,idFactory:()=>"synthetic-"+(++seq),now:()=>stamp,writes:()=>writes,setQuota:()=>quota=true};
}
const input=(extra={})=>({binding:{...JOURNEY_BINDING},question:"SYNTHETIC question",initialReflection:"SYNTHETIC initial",laterReflection:"",returnOn:"2026-12-04",...extra});
const save=(f,record=input(),baseRevision=0,extra={})=>saveLearning({...f,record,baseRevision,...extra});
const backup=r=>JSON.stringify({format:FORMAT,version:1,revision:0,records:r});
test("complete exact source and lesson binding; different source/revision unavailable",()=>{
 assert.ok(journeyAvailable(index));assert.equal(index.nodes.get(JOURNEY_BINDING.passageId).occurrenceIds.length,8);
 const p=index.nodes.get(JOURNEY_BINDING.passageId),before=p.passageSha256;p.passageSha256="0".repeat(64);assert.equal(journeyAvailable(index),false);p.passageSha256=before;
});
test("create, exact source binding and first reflection protected when saving later words",async()=>{
 const f=fixture(),a=await save(f);assert.ok(a.ok);assert.equal(a.records.length,1);assert.equal(f.writes(),1);
 const b=await save(f,input({id:a.savedRecord.id,laterReflection:"SYNTHETIC later"}),a.revision,{now:()=>"2026-12-04T12:00:00.000Z"});assert.ok(b.ok);assert.equal(b.records.length,1);assert.equal(b.savedRecord.initialReflection,"SYNTHETIC initial");assert.equal(b.savedRecord.laterReflection,"SYNTHETIC later");
 const raw=f.data.get(LEARNING_KEY);assert.equal((await save(f,input({id:a.savedRecord.id,initialReflection:"rewrite"}),b.revision)).status,"EARLIER_NOTE_PROTECTED");assert.equal(f.data.get(LEARNING_KEY),raw);assert.equal(f.data.get("synthetic.other.reader"),"preserved");
});
test("question immutable; empty first note and later words without first save refused",async()=>{
 const f=fixture();assert.equal((await save(f,input({question:"",initialReflection:""}))).status,"EMPTY_NOTE");assert.equal((await save(f,input({laterReflection:"already later"}))).status,"INVALID_NOTE");
 const a=await save(f);assert.equal((await save(f,input({id:a.savedRecord.id,question:"changed"}),a.revision)).status,"EARLIER_NOTE_PROTECTED");
});
test("stale edits preserve both later versions with identical earlier reflection",async()=>{
 const f=fixture(),a=await save(f),id=a.savedRecord.id;
 const b=await save(f,input({id,laterReflection:"SYNTHETIC version A"}),1);const c=await save(f,input({id,laterReflection:"SYNTHETIC version B"}),1);
 assert.ok(b.ok&&c.ok);assert.equal(c.status,"CONFLICT_PRESERVED");assert.equal(c.records.length,2);assert.deepEqual(c.records.map(r=>r.laterReflection),["SYNTHETIC version A","SYNTHETIC version B"]);assert.ok(c.records.every(r=>r.initialReflection==="SYNTHETIC initial"));assert.equal(c.savedRecord.conflictOf,id);
});
test("no-change save does not write or create another conflict copy",async()=>{
 const f=fixture(),a=await save(f),before=f.writes();const b=await save(f,input({id:a.savedRecord.id}),0);assert.equal(b.status,"UNCHANGED");assert.equal(f.writes(),before);
});
test("unknown source or lesson revision refuses save, preserves imported historical record",async()=>{
 const f=fixture(),a=await save(f),old=structuredClone(a.savedRecord);old.id="historical";old.binding.editionId="edition.sggs.older";old.binding.passageSha256="b".repeat(64);
 assert.ok((await importLearning({...f,text:backup([old])})).ok);const raw=f.data.get(LEARNING_KEY);const b=await save(f,{...input(),id:old.id,binding:old.binding},2);assert.equal(b.status,"INVALID_NOTE");assert.equal(f.data.get(LEARNING_KEY),raw);assert.match(exportLearning(f).text,/edition.sggs.older/);assert.ok(!sameBinding(old.binding,JOURNEY_BINDING));
});
test("an existing note cannot be rebound to the current passage",async()=>{
 const f=fixture(),a=await save(f),old=structuredClone(a.savedRecord);old.id="old-source";old.binding.passageId="sggs.other.salok01";await importLearning({...f,text:backup([old])});const raw=f.data.get(LEARNING_KEY);
 assert.equal((await save(f,input({id:old.id,laterReflection:"new"}),2)).status,"SOURCE_MISMATCH");assert.equal(f.data.get(LEARNING_KEY),raw);
});
test("quota refusal leaves all bytes intact and preserves meaningful recovery message",async()=>{
 const f=fixture(),a=await save(f),raw=f.data.get(LEARNING_KEY);f.setQuota();const r=await save(f,input({id:a.savedRecord.id,laterReflection:"unsaved"}),a.revision);
 assert.equal(r.status,"STORAGE_REFUSED");assert.match(r.message,/preserved/);assert.equal(f.data.get(LEARNING_KEY),raw);
});
test("missing locks preserves data while read and export still work",async()=>{
 const f=fixture(),a=await save(f),raw=f.data.get(LEARNING_KEY);const r=await saveLearning({...f,locks:{},record:input({id:a.savedRecord.id,laterReflection:"new"}),baseRevision:1});assert.equal(r.status,"LOCK_UNAVAILABLE");assert.equal(f.data.get(LEARNING_KEY),raw);assert.ok(loadLearning(f).ok&&exportLearning(f).ok);
});
test("corrupt existing record never reset by save or import",async()=>{
 const f=fixture(),g=fixture(),a=await save(g),raw='{"format":"broken"';f.data.set(LEARNING_KEY,raw);assert.equal(loadLearning(f).status,"RECOVERY_REQUIRED");assert.equal((await save(f)).status,"RECOVERY_REQUIRED");assert.equal((await importLearning({...f,text:backup(a.records)})).status,"RECOVERY_REQUIRED");assert.equal(f.data.get(LEARNING_KEY),raw);
});
test("oversized, unknown-field, duplicate-key and duplicate-identity imports refuse atomically",async()=>{
 const f=fixture(),a=await save(f),raw=f.data.get(LEARNING_KEY),rec=a.savedRecord;
 for(const text of [backup([rec,rec]),backup([{...rec,unexpected:"field"}]),'{"format":"wrong",'+raw.slice(1)," ".repeat(LIMITS.store*2+1),backup([{...rec,initialReflection:"x".repeat(LIMITS.reflection+1)}])]){
  const r=await importLearning({...f,text});assert.equal(r.status,"INVALID_IMPORT");assert.equal(f.data.get(LEARNING_KEY),raw);
 }
});
test("export roundtrip and repeated import are idempotent, with field order irrelevant",async()=>{
 const f=fixture();await save(f);const exported=exportLearning(f),g=fixture();assert.ok((await importLearning({...g,text:exported.text})).ok);const before=g.data.get(LEARNING_KEY),writes=g.writes();assert.equal((await importLearning({...g,text:exported.text})).status,"UNCHANGED");assert.equal(g.writes(),writes);assert.equal(g.data.get(LEARNING_KEY),before);
 const parsed=JSON.parse(exported.text);parsed.records=parsed.records.map(r=>Object.fromEntries(Object.entries(r).reverse()));assert.equal((await importLearning({...g,text:JSON.stringify(parsed)})).status,"UNCHANGED");
});
test("repeated conflicting backup keeps one imported version, without deleting independent notes",async()=>{
 const f=fixture(),a=await save(f),r=structuredClone(a.savedRecord);r.laterReflection="incoming B";
 const b=await importLearning({...f,text:backup([r])});assert.equal(b.status,"CONFLICT_PRESERVED");assert.equal(b.records.length,2);const before=f.data.get(LEARNING_KEY);
 assert.equal((await importLearning({...f,text:backup([r])})).status,"UNCHANGED");assert.equal(f.data.get(LEARNING_KEY),before);
 const independent={...r,id:"independent"};assert.equal((await importLearning({...f,text:backup([independent])})).records.length,3);
});
test("incoming explicit conflict copies recognized before parent conflicts, in either order",async()=>{
 for(const reverse of [false,true]){
  const f=fixture(),a=await save(f),incoming={...a.savedRecord,laterReflection:"B"},copy={...incoming,id:"copy-b",conflictOf:incoming.id};
  const records=reverse?[copy,incoming]:[incoming,copy];const r=await importLearning({...f,text:backup(records)});assert.ok(r.ok);assert.equal(r.records.length,2);assert.equal(r.records[1].id,"copy-b");
  assert.equal((await importLearning({...f,text:backup(records)})).status,"UNCHANGED");
 }
});
test("generated conflict ID cannot take a reserved incoming ID",async()=>{
 const f=fixture(),a=await save(f),b={...a.savedRecord,laterReflection:"B"},other={...a.savedRecord,id:"reserved",question:"other"};let n=0;
 const r=await importLearning({...f,text:backup([b,other]),idFactory:()=>++n===1?"reserved":"new-conflict"});assert.ok(r.ok);assert.equal(r.records.length,3);assert.deepEqual(new Set(r.records.map(x=>x.id)),new Set([a.savedRecord.id,"reserved","new-conflict"]));
});
test("record-count and aggregate limit refusal does not trim any prior notes",async()=>{
 const f=fixture(),a=await save(f),many=Array.from({length:100},(_,i)=>({...a.savedRecord,id:"record-"+i}));f.data.set(LEARNING_KEY,backup(many));const raw=f.data.get(LEARNING_KEY);assert.equal((await save(f,input(),0)).status,"SIZE_OR_FORMAT_LIMIT");assert.equal(f.data.get(LEARNING_KEY),raw);
 const g=fixture(),big=Array.from({length:30},(_,i)=>({...a.savedRecord,id:"large-"+i,initialReflection:"x".repeat(12000)}));g.data.set(LEARNING_KEY,backup(big));const extra=Array.from({length:15},(_,i)=>({...a.savedRecord,id:"extra-"+i,initialReflection:"y".repeat(12000)}));const before=g.data.get(LEARNING_KEY);assert.equal((await importLearning({...g,text:backup(extra)})).status,"SIZE_OR_FORMAT_LIMIT");assert.equal(g.data.get(LEARNING_KEY),before);
});
test("local-date intent and week addition survive month/year/leap/DST boundaries without scheduling",()=>{
 assert.equal(weekFrom("2026-11-27"),"2026-12-04");assert.equal(weekFrom("2026-12-28"),"2027-01-04");assert.equal(weekFrom("2028-02-24"),"2028-03-02");assert.equal(weekFrom("2026-03-05"),"2026-03-12");
 assert.equal(validDate("2026-02-29"),false);assert.ok(validDate("2028-02-29"));assert.equal(returnReady({returnOn:"2026-12-04"},"2026-12-03"),false);assert.ok(returnReady({returnOn:"2026-12-04"},"2026-12-04"));assert.equal(returnReady({returnOn:null},"2026-12-04"),false);
 const d=new Date(2026,10,27,23,59);assert.equal(localDate(d),"2026-11-27");
});
test("reversed device clock refuses editing rather than rewriting note chronology",async()=>{
 const f=fixture(),a=await save(f),before=f.data.get(LEARNING_KEY);const r=await save(f,input({id:a.savedRecord.id,laterReflection:"later"}),1,{now:()=>"2026-11-26T12:00:00.000Z"});assert.equal(r.status,"INVALID_CLOCK");assert.equal(f.data.get(LEARNING_KEY),before);
});

test("digest arrays or objects cannot enter historical records through regex coercion",async()=>{
 const f=fixture(),a=await save(f),before=f.data.get(LEARNING_KEY),writes=f.writes();
 for(const digest of [[JOURNEY_BINDING.passageSha256],{value:JOURNEY_BINDING.passageSha256},null,42]){
  const bad={...a.savedRecord,id:"synthetic-invalid-digest",binding:{...JOURNEY_BINDING,passageSha256:digest}};
  assert.equal((await importLearning({...f,text:backup([bad])})).status,"INVALID_IMPORT");
  assert.equal(f.data.get(LEARNING_KEY),before);assert.equal(f.writes(),writes);
 }
});
