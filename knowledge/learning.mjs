// Knowledge-owned private notes. No network, practice activity, or automatic answers.
import {parseStrictJSON} from "./json.mjs";
export const LEARNING_KEY="glp001.knowledge.learning.v1";
export const EXPORT_FILENAME="Knowledge-learning.json";
export const FORMAT="glp-knowledge-learning";
export const LIMITS=Object.freeze({records:100,question:4000,reflection:12000,store:500000});
export const JOURNEY_BINDING=Object.freeze({
 journeyId:"journey.haumai.v1",passageId:"sggs.asa-di-vaar.pauri007.salok02",
 editionId:"edition.sggs.opengranth-34d2a7c",
 passageSha256:"a4df72d9dc683a83f229048df86ef66a9ba2df9d63253b3b3de7a9748f51f306",
 lessonId:"lesson.haumai.r1",lessonRevision:1
});
const fields=Object.keys(JOURNEY_BINDING),HEX=/^[a-f0-9]{64}$/,ID=/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,159}$/;
const plain=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const exact=(x,required,optional=[])=>plain(x)&&required.every(k=>Object.hasOwn(x,k))&&Object.keys(x).every(k=>required.includes(k)||optional.includes(k));
const require=(ok,message)=>{if(!ok)throw Error(message);};
const clone=x=>structuredClone(x);
const freeze=x=>{if(x&&typeof x==="object"){Object.values(x).forEach(freeze);Object.freeze(x);}return x;};
const preserved=" Your existing record has been preserved.";
const fail=(status,message)=>({ok:false,status,message});
const result=(store,extra={})=>{const snapshot=freeze(clone(store));return {ok:true,store:snapshot,revision:snapshot.revision,records:snapshot.records,...extra};};
const empty=()=>({format:FORMAT,version:1,revision:0,records:[]});
const signature=b=>JSON.stringify(fields.map(k=>b[k]));
export function sameBinding(a,b){return plain(a)&&plain(b)&&signature(a)===signature(b);}
export function validDate(value){
 if(typeof value!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const d=new Date(value+"T12:00:00.000Z");return Number.isFinite(+d)&&d.toISOString().slice(0,10)===value;
}
export function localDate(now=new Date()){
 const d=new Date(now);if(!Number.isFinite(+d))throw Error("The device date is unavailable.");
 return String(d.getFullYear()).padStart(4,"0")+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
export function weekFrom(date=localDate()){
 require(validDate(date),"The chosen date is invalid.");const d=new Date(date+"T12:00:00.000Z");d.setUTCDate(d.getUTCDate()+7);return d.toISOString().slice(0,10);
}
export function returnReady(record,date=localDate()){return validDate(record.returnOn)&&validDate(date)&&record.returnOn<=date;}
function validTime(value){return typeof value==="string"&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value;}
function binding(value){
 require(exact(value,fields),"The source binding is incomplete or unsupported.");
 for(const name of ["journeyId","passageId","editionId","lessonId"])require(typeof value[name]==="string"&&ID.test(value[name]),"The source identity is invalid.");
 require(typeof value.passageSha256==="string"&&HEX.test(value.passageSha256)&&Number.isSafeInteger(value.lessonRevision)&&value.lessonRevision>0,"The source or lesson revision is invalid.");return value;
}
function textFields(record){
 require(typeof record.question==="string"&&record.question.length<=LIMITS.question,"The question is too long or unsupported.");
 for(const k of ["initialReflection","laterReflection"])require(typeof record[k]==="string"&&record[k].length<=LIMITS.reflection,"The reflection is too long or unsupported.");
 require(record.returnOn===null||validDate(record.returnOn),"The return date is invalid.");
}
function recordValid(record){
 require(exact(record,["id","binding","question","initialReflection","laterReflection","returnOn","createdAt","updatedAt"],["conflictOf"]),"The saved note has an unsupported format.");
 require(typeof record.id==="string"&&ID.test(record.id),"The note identity is invalid.");
 if(Object.hasOwn(record,"conflictOf"))require(typeof record.conflictOf==="string"&&ID.test(record.conflictOf)&&record.conflictOf!==record.id,"The conflict identity is invalid.");
 binding(record.binding);textFields(record);
 require(validTime(record.createdAt)&&validTime(record.updatedAt)&&record.createdAt<=record.updatedAt,"The saved note date is invalid.");
}
export function validateLearning(store){
 require(exact(store,["format","version","revision","records"])&&store.format===FORMAT&&store.version===1,"This is not a supported Knowledge learning backup.");
 require(Number.isSafeInteger(store.revision)&&store.revision>=0,"The revision is invalid.");
 require(Array.isArray(store.records)&&store.records.length<=LIMITS.records,"There are too many saved notes.");
 const ids=new Set();for(const record of store.records){recordValid(record);require(!ids.has(record.id),"The backup repeats a note identity.");ids.add(record.id);}
 require(JSON.stringify(store).length<=LIMITS.store,"The learning record is too large. Nothing was shortened.");return store;
}
function storageOf(storage){try{return storage??globalThis.localStorage;}catch{return null;}}
function locksOf(locks){try{return locks??globalThis.navigator?.locks;}catch{return null;}}
export function loadLearning({storage}={}){
 const target=storageOf(storage);let raw;
 try{if(!target?.getItem)throw Error();raw=target.getItem(LEARNING_KEY);}catch{return fail("STORAGE_UNAVAILABLE","Private notes are unavailable in this browser."+preserved);}
 if(raw===null)return result(empty());
 try{require(typeof raw==="string"&&raw.length<=LIMITS.store,"oversize");return result(validateLearning(parseStrictJSON(raw)));}
 catch{return fail("RECOVERY_REQUIRED","The saved Knowledge learning record needs recovery. Keep the original backup; nothing has been reset."+preserved);}
}
function nextId(records,factory=()=>globalThis.crypto.randomUUID()){
 const used=new Set(records.map(r=>r.id));for(let n=0;n<20;n++){const id=factory();if(typeof id==="string"&&ID.test(id)&&!used.has(id))return id;}throw Error("A fresh note identity could not be created.");
}
function commit(target,store,extra){
 let text;try{validateLearning(store);text=JSON.stringify(store);}catch(error){return fail("SIZE_OR_FORMAT_LIMIT",error.message+preserved);}
 try{target.setItem(LEARNING_KEY,text);}catch{return fail("STORAGE_REFUSED","The browser could not save this learning record. Keep or export your unsaved text before trying again."+preserved);}
 return result(store,extra);
}
async function locked({storage,locks},work){
 const target=storageOf(storage),manager=locksOf(locks);
 if(!target?.getItem||!target?.setItem)return fail("STORAGE_UNAVAILABLE","Private notes cannot be saved in this browser."+preserved);
 if(!manager?.request)return fail("LOCK_UNAVAILABLE","This browser cannot safely coordinate private note edits between tabs. Saving and importing are unavailable; existing notes remain readable and exportable."+preserved);
 try{return await manager.request(LEARNING_KEY,{mode:"exclusive"},()=>work(target));}
 catch{return fail("SAVE_UNAVAILABLE","The private learning operation could not finish. Keep your unsaved text."+preserved);}
}
export function journeyAvailable(index){
 const p=index?.nodes?.get(JOURNEY_BINDING.passageId),l=index?.nodes?.get(JOURNEY_BINDING.lessonId);
 return Boolean(p?.type==="passage"&&p.editionId===JOURNEY_BINDING.editionId&&p.passageSha256===JOURNEY_BINDING.passageSha256&&p.expectedOccurrenceCount===8&&p.occurrenceIds?.length===8&&p.occurrenceIds.every(id=>index.occ.get(id)?.passageId===p.id)&&l?.revision===JOURNEY_BINDING.lessonRevision&&l.sourceBindings?.some(b=>b.id===p.id&&b.sha256===p.passageSha256));
}
export async function saveLearning({storage,locks,record,baseRevision,now=()=>Date.now(),idFactory}={}){
 try{
  require(exact(record,["binding","question","initialReflection","laterReflection","returnOn"],["id"]),"The new note has an unsupported format.");binding(record.binding);textFields(record);
  require(sameBinding(record.binding,JOURNEY_BINDING),"This note belongs to an unavailable source or lesson revision. It can still be read and exported.");
  require(Number.isSafeInteger(baseRevision)&&baseRevision>=0,"Reload the saved notes before editing.");
  if(Object.hasOwn(record,"id"))require(typeof record.id==="string"&&ID.test(record.id),"The note identity is invalid.");
 }catch(error){return fail("INVALID_NOTE",error.message+preserved);}
 return locked({storage,locks},target=>{
  const loaded=loadLearning({storage:target});if(!loaded.ok)return loaded;
  const store=clone(loaded.store),existing=record.id?store.records.find(r=>r.id===record.id):null;
  if(record.id&&!existing)return fail("NOTE_NOT_FOUND","The original saved note is unavailable. Keep this text before reopening Saved."+preserved);
  if(existing&&!sameBinding(existing.binding,record.binding))return fail("SOURCE_MISMATCH","A note cannot move to another source or lesson revision."+preserved);
  if(existing&&(existing.question!==record.question||existing.initialReflection!==record.initialReflection))return fail("EARLIER_NOTE_PROTECTED","Your earlier question and reflection stay as originally saved. Start another note for a new reflection."+preserved);
  if(!existing&&record.laterReflection!=="")return fail("INVALID_NOTE","Save the first reflection before adding a later one."+preserved);
  if(!record.question.trim()&&!record.initialReflection.trim()&&!record.laterReflection.trim())return fail("EMPTY_NOTE","Write a question or reflection before saving."+preserved);
  if(existing&&existing.laterReflection===record.laterReflection&&existing.returnOn===record.returnOn)return result(store,{status:"UNCHANGED",savedRecord:freeze(clone(existing)),message:"This reflection is already saved."});
  const date=new Date(typeof now==="function"?now():now).toISOString();
  if(existing&&date<existing.updatedAt)return fail("INVALID_CLOCK","The device clock predates the saved note. Keep your unsaved text."+preserved);
  const conflict=Boolean(existing&&baseRevision!==store.revision);
  const saved={id:existing&&!conflict?existing.id:nextId(store.records,idFactory),binding:clone(record.binding),question:record.question,initialReflection:record.initialReflection,laterReflection:record.laterReflection,returnOn:record.returnOn,createdAt:existing?.createdAt||date,updatedAt:date};
  if(conflict)saved.conflictOf=existing.id;else if(existing?.conflictOf)saved.conflictOf=existing.conflictOf;
  if(existing&&!conflict)store.records[store.records.findIndex(r=>r.id===existing.id)]=saved;else store.records.push(saved);
  store.revision++;return commit(target,store,{status:conflict?"CONFLICT_PRESERVED":"SAVED",savedRecord:freeze(clone(saved)),message:conflict?"Another edit was saved first. Both versions have been kept as separate notes.":"Private reflection saved on this device."});
 });
}
const sameVersion=(a,b)=>sameBinding(a.binding,b.binding)&&["question","initialReflection","laterReflection","returnOn","createdAt","updatedAt"].every(k=>a[k]===b[k]);
const sameRecord=(a,b)=>a.id===b.id&&a.conflictOf===b.conflictOf&&sameVersion(a,b);
export function exportLearning({storage}={}){
 const loaded=loadLearning({storage});if(!loaded.ok)return loaded;
 return {ok:true,filename:EXPORT_FILENAME,text:JSON.stringify(loaded.store,null,2)+"\n",revision:loaded.revision};
}
export async function importLearning({storage,locks,text,idFactory}={}){
 let incoming;try{require(typeof text==="string"&&text.length<=LIMITS.store*2,"oversize");incoming=validateLearning(parseStrictJSON(text));}
 catch{return fail("INVALID_IMPORT","This is not a complete supported Knowledge learning backup. Nothing was imported."+preserved);}
 return locked({storage,locks},target=>{
  const loaded=loadLearning({storage:target});if(!loaded.ok)return loaded;
  const store=clone(loaded.store),byId=new Map(store.records.map(r=>[r.id,r])),pending=[];let added=0,conflicts=0;
  for(const record of incoming.records){const current=byId.get(record.id);if(!current){store.records.push(clone(record));added++;}else if(!sameRecord(current,record))pending.push(record);}
  for(const record of pending){
   if(store.records.some(r=>r.conflictOf===record.id&&sameVersion(r,record)))continue;
   const saved=clone(record);saved.id=nextId([...store.records,...incoming.records],idFactory);saved.conflictOf=record.id;store.records.push(saved);added++;conflicts++;
  }
  if(!added)return result(store,{status:"UNCHANGED",message:"This backup is already present. Your saved notes have not changed."});
  store.revision++;return commit(target,store,{status:conflicts?"CONFLICT_PRESERVED":"IMPORTED",message:conflicts?"Backup restored. Conflicting versions were kept as separate notes.":"Knowledge learning backup restored. Existing notes were kept."});
 });
}
