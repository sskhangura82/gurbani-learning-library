/* Browser-local Nitnem learning. Explicit edits merge under a cross-tab lock.
 * Existing private-preview exports remain readable through named edition aliases.
 * Unknown or damaged records are preserved; no recovery path silently resets them.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GLP_NITNEM_STORAGE=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const payloadFields=['notes','bookmarks','lineId','size','theme','pace','mode','view'];
 const recordFields=['schema','compositionId','editionId','rev','savedAt','payload'];
 const PROJECT='GLP-001-NITNEM',LEGACY_PROJECT='GLP-001-NITNEM-PRIVATE-REVIEW';
 const NOTE_LIMIT=12000;
 const keyFor=(name,edition)=>'glp001.nitnem.PRIVATE-SOURCE-REVIEW.v1.'+name+'.'+edition;
 // Count the UTF-8 bytes without allocating an encoded copy of a large backup.
 // Unpaired surrogates have the same three-byte replacement as File/Blob UTF-8.
 function utf8Bytes(text,limit=Infinity){
  let bytes=0;
  for(let i=0;i<text.length;i++){
   const c=text.charCodeAt(i);
   if(c<0x80)bytes++;
   else if(c<0x800)bytes+=2;
   else if(c>=0xD800&&c<=0xDBFF&&i+1<text.length&&text.charCodeAt(i+1)>=0xDC00&&text.charCodeAt(i+1)<=0xDFFF){bytes+=4;i++;}
   else bytes+=3;
   if(bytes>limit)return bytes;
  }
  return bytes;
 }
 function create(pack,{storage,locks}){
  const ids=new Set(pack.units.flatMap(u=>u.lines.map(l=>l.id))),first=pack.units[0].lines[0].id;
  const aliases=[...new Set(pack.previousEditionIds||[])],editions=new Set([pack.editionId,...aliases]);
  const key=keyFor(pack.compositionId,pack.editionId),supported=typeof locks?.request==='function';
  const seed=()=>({notes:{},bookmarks:[],lineId:first,size:30,theme:'day',pace:70,mode:'read',view:'continuous'});
  // Every valid export fits: all line IDs as note keys and bookmarks, the longest
  // accepted identifiers/preferences, and the maximum ISO date width (27).
  // One permitted UTF-16 note code unit needs at most six JSON UTF-8 bytes
  // (a control character or lone surrogate becomes \\uXXXX). Ordinary Punjabi
  // takes three; a surrogate pair takes four for two code units. Empty note
  // strings in the envelope already account for quotes, commas and indentation.
  const longest=values=>values.reduce((a,b)=>utf8Bytes(JSON.stringify(a))>=utf8Bytes(JSON.stringify(b))?a:b);
  const maxEnvelope={project:longest([PROJECT,LEGACY_PROJECT]),schema:1,compositionId:pack.compositionId,
   editionId:longest([...editions]),exportedAt:'+999999-12-31T23:59:59.999Z',
   state:{notes:Object.fromEntries([...ids].map(id=>[id,''])),bookmarks:[...ids],lineId:longest([...ids]),
    size:60,theme:'amrit',pace:200,mode:'meaning',view:'continuous'}};
  const maxBackupBytes=utf8Bytes(JSON.stringify(maxEnvelope,null,2))+ids.size*NOTE_LIMIT*6;
  function normalise(value){
   if(!plain(value)||Object.keys(value).some(k=>!payloadFields.includes(k)))throw Error('Saved learning contains fields this reader does not understand. Its original record is preserved.');
   const s={...seed(),...value};
   if(!ids.has(s.lineId)||!['day','amrit'].includes(s.theme)||!['read','meaning','study'].includes(s.mode)||!['continuous','passage'].includes(s.view))throw Error('Saved reading position or preferences need recovery. Nothing has been overwritten.');
   if(!Number.isInteger(s.size)||s.size<24||s.size>60||!Number.isInteger(s.pace)||s.pace<50||s.pace>200||s.pace%5!==0)throw Error('Saved text size or reading pace is invalid. The original record is preserved.');
   if(!Array.isArray(s.bookmarks)||s.bookmarks.length>ids.size||s.bookmarks.some(id=>!ids.has(id)))throw Error('A saved bookmark is outside this edition. The original record is preserved.');
   if(!plain(s.notes)||Object.entries(s.notes).some(([id,n])=>!ids.has(id)||typeof n!=='string'||n.length>NOTE_LIMIT))throw Error('A reflection is invalid or outside this edition. The original record is preserved.');
   return {...s,notes:{...s.notes},bookmarks:[...new Set(s.bookmarks)]};
  }
  function stored(){
   const raw=storage.getItem(key);if(raw!==null)return {key,raw};
   for(const edition of aliases){const oldKey=keyFor(pack.compositionId,edition),old=storage.getItem(oldKey);if(old!==null)return {key:oldKey,raw:old};}
   return {key,raw:null};
  }
  function read(){
   const found=stored();if(found.raw===null)return {payload:seed(),rev:0,originKey:key};
   let r;try{r=JSON.parse(found.raw);}catch{throw Error('Saved learning could not be read. Download its original recovery backup; the record is preserved.');}
   if(!plain(r)||Object.keys(r).some(k=>!recordFields.includes(k))||r.schema!==1||r.compositionId!==pack.compositionId||!editions.has(r.editionId)||!Number.isInteger(r.rev)||r.rev<0||typeof r.savedAt!=='string')throw Error('This saved-learning version or edition needs recovery or a newer reader. The original record is preserved.');
   return {payload:normalise(r.payload),rev:r.rev,originKey:found.key};
  }
  function exclusive(fn){if(!supported)return Promise.reject(Error('Safe saving is unavailable in this browser. Reading and backup export remain available.'));return locks.request(key+':write',fn);}
  function write(payload,rev){const valid=normalise(payload),record={schema:1,compositionId:pack.compositionId,editionId:pack.editionId,rev:rev+1,savedAt:new Date().toISOString(),payload:valid};storage.setItem(key,JSON.stringify(record));return record;}
  function save(position,edits={}){return exclusive(()=>{
   const latest=read(),next=normalise({...latest.payload,...edits.preferences,...(position?{lineId:position}:{})});
   if(edits.notes)next.notes={...next.notes,...edits.notes};
   const marks=new Set(next.bookmarks);for(const [id,on]of Object.entries(edits.bookmarks||{})){if(!ids.has(id)||typeof on!=='boolean')throw Error('Invalid bookmark edit.');on?marks.add(id):marks.delete(id);}next.bookmarks=[...marks];
   return write(next,latest.rev);
  });}
  function parse(text){
   if(typeof text!=='string'||text.length>maxBackupBytes||utf8Bytes(text,maxBackupBytes)>maxBackupBytes)throw Error('The selected backup is too large. Nothing changed.');
   let x;try{x=JSON.parse(text);}catch{throw Error('The selected file is not valid JSON. Nothing changed.');}
   if(!plain(x)||![PROJECT,LEGACY_PROJECT].includes(x.project)||x.schema!==1||x.compositionId!==pack.compositionId||!editions.has(x.editionId))throw Error('Choose a backup for this bani and one of its documented source editions.');
   return {payload:normalise(x.state),previousEdition:x.editionId!==pack.editionId};
  }
  function merge(current,incoming){
   const a=normalise(current),b=normalise(incoming),notes={...a.notes};
   for(const [id,n]of Object.entries(b.notes)){
    if(!n)continue;if(!notes[id])notes[id]=n;
    else if(notes[id]!==n&&!notes[id].split('\n\n— Imported reflection —\n').includes(n)){
     const joined=notes[id]+'\n\n— Imported reflection —\n'+n;if(joined.length>NOTE_LIMIT)throw Error('Combining these reflections would exceed the limit. Keep both backups; nothing changed.');notes[id]=joined;
    }
   }
   return normalise({...a,notes,bookmarks:[...new Set([...a.bookmarks,...b.bookmarks])]});
  }
  function importText(text){const incoming=parse(text);return exclusive(()=>{const latest=read();return {...write(merge(latest.payload,incoming.payload),latest.rev),previousEdition:incoming.previousEdition};});}
  function exportText(){return JSON.stringify({project:PROJECT,schema:1,compositionId:pack.compositionId,editionId:pack.editionId,exportedAt:new Date().toISOString(),state:read().payload},null,2);}
  function lease(){if(!supported)return Promise.resolve({available:false,reason:'Safe reflection editing is unavailable in this browser.'});return new Promise((resolve,reject)=>{locks.request(key+':editor',{ifAvailable:true},lock=>{if(!lock){resolve({available:false,reason:'A reflection is open in another tab. Close it there before editing here.'});return;}return new Promise(release=>resolve({available:true,release}));}).catch(reject);});}
  return Object.freeze({key,supported,maxBackupBytes,seed,normalise,stored,read,save,parse,merge,importText,exportText,lease});
 }
 return Object.freeze({create,keyFor,PROJECT,LEGACY_PROJECT});
});
