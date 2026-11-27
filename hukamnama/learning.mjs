/* Private Daily learning only: one atomic key, no network or practice history. */
import {validDate} from "./core.mjs";
export const LEARNING_KEY="glp001.hukamnama.learning.v1";
export const LEARNING_FORMAT="glp-hukamnama-learning";
export const EXPORT_FILENAME="Hukamnama-learning.json";
export const LIMITS=Object.freeze({records:500,question:4000,reflection:40000,store:1000000});
const HEX=/^[a-f0-9]{64}$/,ID=/^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$/;
function plain(value){return value!==null&&typeof value==="object"&&!Array.isArray(value);}
function exactKeys(value,required,optional=[]){return plain(value)&&required.every(k=>Object.hasOwn(value,k))&&Object.keys(value).every(k=>required.includes(k)||optional.includes(k));}
function fail(message){throw Error(message);}
function assert(value,message){if(!value)fail(message);}
function clone(value){return structuredClone(value);}
function freeze(value){if(value&&typeof value==="object"&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
function time(value){return typeof value==="string"&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value)&&Number.isFinite(Date.parse(value));}
function empty(){return {format:LEARNING_FORMAT,version:1,revision:0,records:[]};}
function result(store,extra={}){const snapshot=freeze(clone(store));return {ok:true,store:snapshot,revision:snapshot.revision,records:snapshot.records,...extra};}
function refusal(status,message){return {ok:false,status,message};}
function storageOf(storage){try{return storage??globalThis.localStorage;}catch{return null;}}
function locksOf(locks){try{return locks??globalThis.navigator?.locks;}catch{return null;}}
function timestamp(now){const date=new Date(typeof now==="function"?now():now??Date.now());assert(Number.isFinite(+date),"The note date is invalid.");return date.toISOString();}
function validateBinding(binding){
 const fields=["eventId","date","sourceId","edition","sourceSha256","textSha256","lineId","lineSha256"];
 assert(exactKeys(binding,fields),"A note source binding is incomplete or unsupported.");
 assert(validDate(binding.date)&&binding.eventId==="harmandir-morning."+binding.date,"A note date binding is invalid.");
 assert(HEX.test(binding.textSha256)&&HEX.test(binding.sourceSha256)&&binding.sourceId==="sggs.text."+binding.textSha256,"A note source identity is invalid.");
 assert(typeof binding.edition==="string"&&/^[a-zA-Z0-9._-]{1,100}$/.test(binding.edition),"A note edition is invalid.");
 if(binding.lineId===null){assert(binding.lineSha256===null,"A note line binding is incomplete.");}
 else{assert(HEX.test(binding.lineSha256)&&typeof binding.lineId==="string"&&binding.lineId.startsWith(binding.sourceId+".line."+binding.lineSha256+".")&&/^[1-9]\d*$/.test(binding.lineId.slice((binding.sourceId+".line."+binding.lineSha256+".").length)),"A note line identity is invalid.");}
 return binding;
}
function validateText(record){
 assert(typeof record.question==="string"&&record.question.length<=LIMITS.question&&typeof record.reflection==="string"&&record.reflection.length<=LIMITS.reflection,"The note is too long or has an unsupported format. Nothing was shortened.");
}
function validateRecord(record){
 assert(exactKeys(record,["id","binding","question","reflection","createdAt","updatedAt"],["conflictOf"]),"A saved note has an unsupported format.");
 assert(typeof record.id==="string"&&ID.test(record.id),"A saved note identity is invalid.");
 if(Object.hasOwn(record,"conflictOf"))assert(typeof record.conflictOf==="string"&&ID.test(record.conflictOf)&&record.conflictOf!==record.id,"A conflict-copy identity is invalid.");
 validateBinding(record.binding);validateText(record);
 assert(time(record.createdAt)&&time(record.updatedAt)&&record.createdAt<=record.updatedAt,"A saved note date is invalid.");
 return record;
}
export function validateLearning(value){
 assert(exactKeys(value,["format","version","revision","records"])&&value.format===LEARNING_FORMAT&&value.version===1,"This is not a supported Daily Hukamnama learning backup.");
 assert(Number.isSafeInteger(value.revision)&&value.revision>=0&&value.revision<Number.MAX_SAFE_INTEGER,"The learning revision is invalid.");
 assert(Array.isArray(value.records)&&value.records.length<=LIMITS.records,"The Daily learning record is too large.");
 const ids=new Set();for(const record of value.records){validateRecord(record);assert(!ids.has(record.id),"The backup contains duplicate note identities.");ids.add(record.id);}
 assert(JSON.stringify(value).length<=LIMITS.store,"The Daily learning record is too large. Nothing was shortened.");
 return freeze(clone(value));
}
export function loadLearning({storage}={}){
 const target=storageOf(storage);if(!target||typeof target.getItem!=="function")return refusal("STORAGE_UNAVAILABLE","Private notes are unavailable in this browser. Your existing record has not been changed.");
 let raw;
 try{raw=target.getItem(LEARNING_KEY);}catch{return refusal("STORAGE_UNAVAILABLE","Private notes could not be read. Your existing record has not been changed.");}
 if(raw===null)return result(empty());
 try{if(typeof raw!=="string"||raw.length>LIMITS.store)fail("oversize");return result(validateLearning(JSON.parse(raw)));}
 catch{return refusal("MALFORMED_STORE","The existing Daily learning record needs recovery. It has been preserved without alteration; no notes were replaced.");}
}
function stableBinding(binding){return JSON.stringify(["eventId","date","sourceId","edition","sourceSha256","textSha256","lineId","lineSha256"].map(key=>binding[key]));}
function uniqueId(records,idFactory){
 const existing=new Set(records.map(r=>r.id));
 for(let attempt=0;attempt<5;attempt++){const id=idFactory?idFactory():globalThis.crypto?.randomUUID?.();if(typeof id==="string"&&ID.test(id)&&!existing.has(id))return id;}
 fail("A private note identity could not be created.");
}
function commit(target,store,extra={}){
 let serialized;
 try{validateLearning(store);serialized=JSON.stringify(store);}catch(error){return refusal("SIZE_OR_FORMAT_LIMIT",error.message+" Your existing record has been preserved.");}
 try{target.setItem(LEARNING_KEY,serialized);}catch(error){return refusal(error?.name==="QuotaExceededError"?"QUOTA_EXCEEDED":"STORAGE_UNAVAILABLE","The browser could not save this Daily learning record. Your existing record has been preserved. Keep or export your unsaved text before trying again.");}
 return result(store,extra);
}
async function locked({storage,locks},work){
 const target=storageOf(storage),manager=locksOf(locks);
 if(!target||typeof target.getItem!=="function"||typeof target.setItem!=="function")return refusal("STORAGE_UNAVAILABLE","Private notes cannot be saved in this browser. Your existing record has been preserved.");
 if(!manager||typeof manager.request!=="function")return refusal("LOCK_UNAVAILABLE","This browser cannot safely coordinate private note edits between tabs. Saving and importing are unavailable; existing notes remain readable and exportable.");
 try{return await manager.request(LEARNING_KEY,{mode:"exclusive"},()=>work(target));}
 catch{return refusal("LOCK_UNAVAILABLE","The private note lock was unavailable. Your existing record has been preserved; your unsaved text is still yours to keep.");}
}
export async function saveLearning({storage,locks,record,baseRevision,now,idFactory}={}){
 try{
  assert(exactKeys(record,["binding","question","reflection"],["id"]),"The new note has an unsupported format.");
  validateBinding(record.binding);validateText(record);
  assert(Number.isSafeInteger(baseRevision)&&baseRevision>=0,"Reload the saved notes before editing.");
  if(Object.hasOwn(record,"id"))assert(typeof record.id==="string"&&ID.test(record.id),"The note identity is invalid.");
 }catch(error){return refusal("INVALID_NOTE",error.message+" Your existing record has been preserved.");}
 return locked({storage,locks},target=>{
  const loaded=loadLearning({storage:target});if(!loaded.ok)return loaded;
  const store=clone(loaded.store),existing=record.id?store.records.find(r=>r.id===record.id):null;
  if(record.id&&!existing)return refusal("NOTE_NOT_FOUND","The original saved note is not present. Your existing record has been preserved; keep this text as a new note.");
  if(existing&&stableBinding(existing.binding)!==stableBinding(record.binding))return refusal("SOURCE_BINDING_MISMATCH","A note cannot be moved onto a different reading or line. Your existing record has been preserved.");
  const conflict=Boolean(existing&&baseRevision!==store.revision),date=timestamp(now);
  if(existing&&date<existing.createdAt)return refusal("INVALID_CLOCK","The device clock predates this note. Your existing record has been preserved.");
  const saved={id:existing&&!conflict?existing.id:uniqueId(store.records,idFactory),binding:clone(record.binding),question:record.question,reflection:record.reflection,createdAt:existing&&!conflict?existing.createdAt:date,updatedAt:date};
  if(conflict)saved.conflictOf=existing.id;else if(existing?.conflictOf)saved.conflictOf=existing.conflictOf;
  if(existing&&!conflict)store.records[store.records.findIndex(r=>r.id===existing.id)]=saved;else store.records.push(saved);
  store.revision++;
  return commit(target,store,{status:conflict?"CONFLICT_PRESERVED":"SAVED",savedRecord:freeze(clone(saved)),conflictPreserved:conflict,message:conflict?"Another edit was saved first. Both versions have been kept as separate notes.":"Private note saved on this device."});
 });
}
export function exportLearning({storage}={}){
 const loaded=loadLearning({storage});if(!loaded.ok)return loaded;
 return {ok:true,status:"EXPORTED",filename:EXPORT_FILENAME,text:JSON.stringify(loaded.store,null,2)+"\n",revision:loaded.revision};
}
export async function importLearning({storage,locks,text,idFactory}={}){
 let incoming;
 try{assert(typeof text==="string"&&text.length<=LIMITS.store*2,"The backup is too large or unreadable.");incoming=validateLearning(JSON.parse(text));}
 catch{return refusal("INVALID_IMPORT","This file is not a complete supported Daily Hukamnama learning backup. Your existing record has been preserved; nothing was imported.");}
 return locked({storage,locks},target=>{
  const loaded=loadLearning({storage:target});if(!loaded.ok)return loaded;
  const store=clone(loaded.store);let conflicts=0,added=0;
  for(const item of incoming.records){
   const existing=store.records.find(r=>r.id===item.id);
   if(existing&&JSON.stringify(existing)===JSON.stringify(item))continue;
   const saved=clone(item);
   if(existing){saved.id=uniqueId(store.records,idFactory);saved.conflictOf=existing.id;conflicts++;}
   store.records.push(saved);added++;
  }
  if(added===0)return result(store,{status:"UNCHANGED",conflictPreserved:false,imported:0,message:"This backup is already present. Your saved notes have not changed."});
  store.revision++;
  return commit(target,store,{status:conflicts?"CONFLICT_PRESERVED":"IMPORTED",conflictPreserved:conflicts>0,imported:added,message:conflicts?"Backup restored. Conflicting versions were kept as separate notes.":"Daily learning backup restored. Existing notes were kept."});
 });
}
