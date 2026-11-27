/* GLP-001 local learning. No network, no account, no audio clock. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GLP_LEARNING=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const FULL='glp001.fullJapji.v1',LEGACY='glp001.reader.v1',CONT='glp001.continuous.v2',RETAINED='glp001.continuous.retained.v1';
 let continuous=null;
 function configureContinuous(C,model,units){continuous={C,model,units};}
 function continuousState(s){if(!continuous)throw Error('Continuous reader is not ready.');return continuous.C.normalise(s,continuous.model,continuous.units);}
 const ids=['mool','title','opening',...Array.from({length:38},(_,i)=>'pauri'+String(i+1).padStart(2,'0')),'closing'];
 const plain=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const int=(v,min,max,d)=>Number.isInteger(v)?Math.max(min,Math.min(max,v)):d;
 function normalize(x){
  x=plain(x)?x:{};
  const s={schemaVersion:2,unit:int(x.unit,0,41,0),line:int(x.line,0,40,0),token:int(x.token,0,100,0),mode:['read','understand','study'].includes(x.mode)?x.mode:'read',theme:['day','amrit'].includes(x.theme)?x.theme:'day',radiance:x.radiance!==false,size:int(x.size,24,48,30),pace:Number.isInteger(x.pace)&&x.pace>=50&&x.pace<=160&&x.pace%5===0?x.pace:70,emphasis:x.emphasis==='line'?'line':'word',layout:x.layout==='continuous'?'continuous':'section',bookmarks:[...new Set(Array.isArray(x.bookmarks)?x.bookmarks.filter(id=>ids.includes(id)):[])],notes:{}};
  if(plain(x.notes))for(const id of ids)if(typeof x.notes[id]==='string'&&x.notes[id].length<=12000)s.notes[id]=x.notes[id];
  return s;
 }
 // The published v2 reader never writes this key. Archive before writing its
 // replaceable v2 record; an old tab or rollback cannot discard the archive.
 function readRetained(storage){
  const raw=storage.getItem(RETAINED);if(raw===null)return null;
  const record=JSON.parse(raw);
  if(!plain(record)||record.version!==1||Object.keys(record).some(k=>!['version','keptAside'].includes(k))||!plain(record.keptAside))throw Error('Saved learning archive needs recovery. Export the original backup.');
  return continuous.C.mergeKeptAside(record.keptAside);
 }
 function retainedRaw(storage,kept){
  const merged=continuous.C.mergeKeptAside(readRetained(storage),kept);
  return merged.notes.length||merged.bookmarks.length?JSON.stringify({version:1,keptAside:merged}):null;
 }
 function archiveRetained(storage,kept){
  const next=retainedRaw(storage,kept);
  if(next!==null&&next!==storage.getItem(RETAINED))storage.setItem(RETAINED,next);
 }
 function protectRetained(storage){
  function getItem(key){
   const raw=storage.getItem(key);if(key!==CONT)return raw;
   const archived=readRetained(storage);if(!archived)return raw;
   const fallback=raw===null?storage.getItem(FULL):raw;
   const record=fallback===null?{}:JSON.parse(fallback);
   if(!plain(record)||(record.version!=null&&record.version!==2)||(record.schemaVersion!=null&&![1,2].includes(record.schemaVersion)))throw Error('Saved learning needs recovery or a newer reader. Export a backup.');
   return JSON.stringify({...record,keptAside:continuous.C.mergeKeptAside(record.keptAside,archived)});
  }
  function setItem(key,raw){
   if(key!==CONT)return storage.setItem(key,raw);
   const record=JSON.parse(raw);
   if(!plain(record)||(record.version!=null&&record.version!==2))throw Error('Invalid continuous learning record.');
   const prior=getItem(CONT);
   // Validate both records before changing storage. A failed archive write
   // must prevent the replaceable record from being overwritten.
   const kept=continuous.C.mergeKeptAside(prior===null?null:continuousState(JSON.parse(prior)).keptAside,continuousState(record).keptAside);
   archiveRetained(storage,kept);
   storage.setItem(key,raw);
  }
  return {getItem,setItem,removeItem:key=>storage.removeItem(key)};
 }
 function parse(text){
  if(typeof text!=='string'||text.length>2500000)throw Error('This learning file is too large. Nothing has changed.');
  let x;try{x=JSON.parse(text);}catch{throw Error('This is not valid JSON. Nothing has changed.');}
  if(x?.projectId!=='GLP-001'&&x?.project!=='GLP-001-continuous')throw Error('This is not a GLP-001 learning file.');
  const records={};
  if(x.format==='glp-family-learning'&&x.version===1&&plain(x.records)){
   for(const key of [FULL,LEGACY,CONT,RETAINED])if(x.records[key]!=null){if(typeof x.records[key]!=='string')throw Error('Invalid learning record.');records[key]=x.records[key];}
  }else if(x.project==='GLP-001-continuous'&&x.schema===2&&plain(x.state)){records[CONT]=JSON.stringify(x.state);
  }else if(x.format==='glp-learning-export'&&[1,2,3].includes(x.version)&&plain(x.state)){records[LEGACY]=JSON.stringify(x.state);}
  else throw Error('This learning export format is not supported.');
  if(!Object.keys(records).length)throw Error('No saved learning found in this file.');
  for(const [key,raw] of Object.entries(records)){
   let s;try{s=JSON.parse(raw);}catch{throw Error('A saved record is damaged. Keep this backup for recovery; it cannot be imported automatically.');}
   if(!plain(s))throw Error('Invalid saved learning record.');
   if(key===RETAINED){
    if(!continuous)throw Error('Use the current Japji reader to restore kept-aside learning.');
    readRetained({getItem:()=>raw});
   }else if(key===CONT){
    if(!continuous)throw Error('Continuous reader is not ready.');
    if(s.version!=null&&s.version!==2)throw Error('This backup needs a newer reader.');
    if(s.notes!=null&&(!plain(s.notes)||Object.entries(s.notes).some(([id,n])=>!continuous.model.byId.has(id)||typeof n!=='string'||n.length>12000)))throw Error('Invalid line reflection.');
    if(s.bookmarks!=null&&(!Array.isArray(s.bookmarks)||s.bookmarks.some(id=>!continuous.model.byId.has(id))))throw Error('Unknown saved line.');
    continuousState(s); // Validate retained learning before an import can write any key.
   }else if(key===FULL){
    if(s.schemaVersion!=null&&![1,2].includes(s.schemaVersion))throw Error('This backup needs a newer reader.');
    if(s.notes!=null&&(!plain(s.notes)||Object.entries(s.notes).some(([id,n])=>!ids.includes(id)||typeof n!=='string'||n.length>12000)))throw Error('Invalid reflection record.');
    if(s.bookmarks!=null&&(!Array.isArray(s.bookmarks)||s.bookmarks.some(id=>!ids.includes(id))))throw Error('Unknown saved section.');
   }else if((s.note!=null&&(typeof s.note!=='string'||s.note.length>12000))||(s.bookmarks!=null&&(!Array.isArray(s.bookmarks)||s.bookmarks.some(id=>!/^sggs\.japji\.pauri02\.line0[1-6]$/.test(id)))))throw Error('Invalid Pauri 2 learning record.');
  }
  return records;
 }
 function mergeText(a,b){if(!a)return b||'';if(!b||a===b)return a;const n=a+'\n\n— Imported reflection —\n'+b;if(n.length>12000)throw Error('Combining reflections exceeds the limit. Keep both exports; no learning was changed.');return n;}
 function mergeRecord(key,current,incoming){
  const a=current?JSON.parse(current):{},b=JSON.parse(incoming);
  if(!plain(a)||!plain(b))throw Error('A current record needs recovery first.');
  if(key===CONT){if(a.version!=null&&a.version!==2)throw Error('Current learning needs a newer reader.');const x=continuousState(b),y=continuousState(a);if(current){x.bookmarks=[...new Set([...y.bookmarks,...x.bookmarks])];for(const id of new Set([...Object.keys(y.notes),...Object.keys(x.notes)]))x.notes[id]=mergeText(y.notes[id],x.notes[id]);x.keptAside=continuous.C.mergeKeptAside(y.keptAside,x.keptAside);}return JSON.stringify(x);}
  if(key===FULL){const x=normalize(b),y=normalize(a);if(current){x.bookmarks=[...new Set([...y.bookmarks,...x.bookmarks])];for(const id of ids)x.notes[id]=mergeText(y.notes[id],x.notes[id]);}return JSON.stringify(x);}
  const x={...b,...a};x.note=mergeText(a.note,b.note);x.bookmarks=[...new Set([...(a.bookmarks||[]),...(b.bookmarks||[])])];return JSON.stringify(x);
 }
 function exportAll(storage){const records={};for(const key of [FULL,LEGACY,CONT])records[key]=storage.getItem(key);const archived=storage.getItem(RETAINED);if(archived!==null)records[RETAINED]=archived;return JSON.stringify({format:'glp-family-learning',version:1,projectId:'GLP-001',createdAt:new Date().toISOString(),records},null,2);}
 function importAll(storage,records){
  records={...records};
  if(continuous&&records[FULL]){const projected=JSON.stringify(continuousState(JSON.parse(records[FULL])));records[CONT]=records[CONT]?mergeRecord(CONT,projected,records[CONT]):projected;}
  if(records[RETAINED]!=null){
   if(!continuous)throw Error('Use the current Japji reader to restore kept-aside learning.');
   const incoming=readRetained({getItem:()=>records[RETAINED]});
   const raw=records[CONT]??storage.getItem(CONT)??'{}',record=JSON.parse(raw);
   if(!plain(record)||(record.version!=null&&record.version!==2)||(record.schemaVersion!=null&&![1,2].includes(record.schemaVersion)))throw Error('Current learning needs recovery or a newer reader.');
   const state=continuousState(record);
   state.keptAside=continuous.C.mergeKeptAside(state.keptAside,incoming);
   records[CONT]=JSON.stringify(state);delete records[RETAINED];
  }
  const changes=[];
  for(const [key,raw] of Object.entries(records)){
   if(![FULL,LEGACY,CONT].includes(key))throw Error('Unknown learning key.');
   const before=storage.getItem(key),current=key===CONT&&continuous?protectRetained(storage).getItem(CONT):before;
   const after=mergeRecord(key,current,raw);
   if(key===CONT){
    const archive=retainedRaw(storage,JSON.parse(after).keptAside),prior=storage.getItem(RETAINED);
    if(archive!==null&&archive!==prior)changes.unshift({key:RETAINED,before:prior,after:archive});
   }
   changes.push({key,before,after});
  }
  const done=[];try{for(const c of changes){storage.setItem(c.key,c.after);done.push(c);}}catch(e){for(const c of done.reverse()){try{c.before===null?storage.removeItem(c.key):storage.setItem(c.key,c.before);}catch{}}throw Error('Storage could not save this import. Your downloaded backups are unchanged.');}
 }
 return {FULL,LEGACY,CONT,RETAINED,ids,normalize,parse,mergeText,mergeRecord,exportAll,importAll,configureContinuous,protectRetained,archiveRetained};
});
