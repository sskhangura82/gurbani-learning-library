/* Sukhmani learning belongs to this browser. It never touches Japji storage. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GLP_SUKHMANI_LEARNING=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const KEY='glp001.sukhmani.v1',FORMAT='glp-sukhmani-learning';
 const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const modes=['read','understand','study'],themes=['day','amrit'];
 const fields=['version','read','guide','hasGuided','mode','theme','size','pace','pronunciation','bookmarks','notes'];
 function model(pack){
  if(!Array.isArray(pack?.ashtpadis))throw Error('The Sukhmani reading pack is unavailable.');
  const lines=pack.ashtpadis.flatMap(a=>a.lines||[]),byId=new Map();
  for(const line of lines){if(typeof line.id!=='string'||!line.id||line.id.length>160||byId.has(line.id)||typeof line.gurmukhi!=='string'||!line.gurmukhi)throw Error('The Sukhmani reading pack contains an invalid occurrence.');byId.set(line.id,line);}
  if(!lines.length)throw Error('The Sukhmani reading pack is empty.');
  return {lines,byId};
 }
 function seed(m){return {version:2,read:m.lines[0].id,guide:m.lines[0].id,hasGuided:false,mode:'read',theme:'day',size:30,pace:70,pronunciation:false,bookmarks:[],notes:{}};}
 function validate(m,s){
  if(!plain(s)||s.version!==2)throw Error('This saved learning needs a newer reader or recovery. Export its original backup before changing it.');
  if(Object.keys(s).some(k=>!fields.includes(k)))throw Error('This saved learning has fields this reader does not understand. Its original record has been preserved.');
  for(const k of ['read','guide'])if(s[k]!=null&&!m.byId.has(s[k]))throw Error('Saved learning refers to a line outside this reading pack. The original record has been preserved.');
  if(s.mode!=null&&!modes.includes(s.mode)||s.theme!=null&&!themes.includes(s.theme))throw Error('A saved reading preference is invalid. The original record has been preserved.');
  if(s.size!=null&&(!Number.isInteger(s.size)||s.size<24||s.size>48)||s.pace!=null&&(!Number.isInteger(s.pace)||s.pace<40||s.pace>160||s.pace%5!==0))throw Error('A saved reading size or pace is invalid. The original record has been preserved.');
  for(const k of ['pronunciation','hasGuided'])if(s[k]!=null&&typeof s[k]!=='boolean')throw Error('A saved reading preference is invalid.');
  if(s.bookmarks!=null&&(!Array.isArray(s.bookmarks)||s.bookmarks.length>m.lines.length||s.bookmarks.some(id=>!m.byId.has(id))))throw Error('A bookmark is outside this reading pack. The original record has been preserved.');
  if(s.notes!=null&&(!plain(s.notes)||Object.entries(s.notes).some(([id,n])=>!m.byId.has(id)||typeof n!=='string'||n.length>12000)))throw Error('A reflection is invalid or too long. The original record has been preserved.');
  return s;
 }
 function normalise(m,input){
  validate(m,input);const s={...seed(m),...input};
  s.bookmarks=[...new Set(s.bookmarks)];s.notes={...s.notes};return s;
 }
 function read(m,storage){const raw=storage.getItem(KEY);if(raw===null)return seed(m);let s;try{s=JSON.parse(raw);}catch{throw Error('Saved learning could not be read. Its original record has been preserved; download a backup for recovery.');}return normalise(m,s);}
 function parse(m,text){
  if(typeof text!=='string'||text.length>2500000)throw Error('The selected backup is too large. Nothing has changed.');
  let x;try{x=JSON.parse(text);}catch{throw Error('This file is not valid JSON. Nothing has changed.');}
  if(!plain(x)||x.projectId!=='GLP-001'||x.format!==FORMAT||x.version!==1||x.composition!=='sukhmani')throw Error('Choose a Sukhmani learning export from this reader. Japji exports remain separate.');
  return normalise(m,x.state);
 }
 function exportState(m,state){return JSON.stringify({projectId:'GLP-001',format:FORMAT,version:1,composition:'sukhmani',createdAt:new Date().toISOString(),state:normalise(m,state)},null,2);}
 function merge(m,current,incoming){
  const a=normalise(m,current),b=normalise(m,incoming),notes={...a.notes};
  for(const [id,n] of Object.entries(b.notes)){
   if(!n)continue;
   if(!notes[id])notes[id]=n;
   else if(notes[id]!==n){const merged=notes[id]+'\n\n— Imported reflection —\n'+n;if(merged.length>12000)throw Error('Combining reflections would exceed the limit. Keep both backups; nothing has changed.');notes[id]=merged;}
  }
  return normalise(m,{...a,bookmarks:[...new Set([...a.bookmarks,...b.bookmarks])],notes});
 }
 return Object.freeze({KEY,FORMAT,model,seed,validate,normalise,read,parse,exportState,merge});
});
