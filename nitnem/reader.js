/* GLP-001: six ORIGINAL DIGITAL SOURCE CANDIDATES inside the existing reader site.
 * PRIVATE QA ONLY. No outside scripture links, translations or source approval.
 * Same pure continuous-core as Japji. Independent local learning namespaces.
 */
(()=>{
'use strict';
const EXPECTED_LIBRARY='b5865b293acc3ea91a20487dd82efd6f503d22dc5823bc2a67effcd146840d7a';
const EXPECTED_SOURCE_COMMIT='373ccc34f4a1c0ccb6ce36654bf6e9574087200f';
const NAMES=['jaap','savaiye','chaupai','anand','rehras','sohila'];
const $=id=>document.getElementById(id),C=window.GLPContinuousCore;
const codec=new TextDecoder('utf-8',{fatal:true});
const state={library:null,pack:null,model:null,units:[],bani:null,unit:0,index:0,token:0,playing:false,timeout:0,mode:'read',
 size:36,theme:'day',pace:70,notes:{},bookmarks:[],currentKey:null,rev:0,sourceVerified:false};
const sourceNotice='Digital original · private testing only. Independent scripture and rights review pending.';
function announce(s){$('announcer').textContent=s;}
function status(s){$('source-lineage').textContent=s;announce(s);}
function error(s){pause();$('source-unit').replaceChildren();status('SOURCE BLOCKED: '+s);state.sourceVerified=false;throw Error(s);}
async function digest(data){
 const bytes=typeof data==='string'?new TextEncoder().encode(data):data;
 const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
 return Array.from(hash,b=>b.toString(16).padStart(2,'0')).join('');
}
async function jsonBytes(url,expected){
 const result=await fetch(url,{cache:'no-store',credentials:'same-origin'});
 if(!result.ok)throw Error('Cannot load local source asset: '+result.status+' '+url);
 const bytes=new Uint8Array(await result.arrayBuffer());
 if(await digest(bytes)!==expected)throw Error('Source SHA-256 verification failed: '+url);
 return JSON.parse(codec.decode(bytes));
}
async function library(){
 if(state.library)return state.library;
 const manifest=await jsonBytes('data/library.json',EXPECTED_LIBRARY);
 if(manifest.schema!=='GLP-001-INTERNAL-NITNEM-REVIEW-V1'||manifest.sourceCommit!==EXPECTED_SOURCE_COMMIT
 ||manifest.familyReady!==false||manifest.sourceCleared!==false
 ||Object.keys(manifest.entries).sort().join(',')!==NAMES.slice().sort().join(',')){
  throw Error('Original-source manifest identity or review hold changed');
 }
 state.library=manifest;
 return manifest;
}
async function verifyPack(x,entry,name){
 if(x.schema!=='GLP-001-NITNEM-SOURCE-REVIEW-V1'||x.compositionId!==name
 ||x.sourceRepositoryCommit!==EXPECTED_SOURCE_COMMIT||x.editionId!==entry.editionId
 ||x.humanCollationApproved!==false||x.rightsCleared!==false||x.publishedAsFamilyScripture!==false
 ||x.unitCount!==entry.units||x.originalLineCount!==entry.lines
 ||x.units?.length!==entry.units)throw Error('Digital source identity, edition or review gate changed');
 const seen=new Set(),flattened=[];
 for(const u of x.units){
  if(!u.id||!Array.isArray(u.lines)||!u.lines.length)throw Error('Incomplete source unit');
  for(const heading of u.metricalHeadings||[]){
   if(await digest(heading.text)!==heading.sha256)throw Error('Original source heading hash changed');
  }
  for(const l of u.lines){
   if(typeof l.text!=='string'||!l.text||seen.has(l.id))throw Error('Missing or duplicated source original');
   seen.add(l.id);
   if(await digest(l.text)!==l.sha256)throw Error('Gurmukhi occurrence hash changed: '+l.id);
   if(l.family==='dasam'&&('ang' in l.location))throw Error('Dasam verse given a false SGGS Ang');
   if(l.family==='sggs'&&!['ang','sggs_rehras_section'].includes(l.location?.system))throw Error('SGGS source locator invalid');
   flattened.push(l);
  }
 }
 if(flattened.length!==entry.lines)throw Error('Missing source lines');
 const held=flattened.filter(l=>l.held).map(l=>l.id);
 if(name==='anand'&&held.join(',')!=='anand24.line03')throw Error('Anand Pauri24 source uncertainty cannot disappear');
 if(name!=='anand'&&held.length)throw Error('Unexpected original-source hold: '+name);
 return x;
}
function storageKey(x){
 return 'glp001.nitnem.PRIVATE-SOURCE-REVIEW.v1.'+x.compositionId+'.'+x.editionId;
}
function loadSaved(pack){
 state.currentKey=storageKey(pack);state.rev=0;
 let saved={};
 try{
  const record=JSON.parse(localStorage.getItem(state.currentKey)||'null');
  if(record?.schema===1&&record.compositionId===pack.compositionId&&record.editionId===pack.editionId&&typeof record.payload==='object'){
   saved=record.payload;state.rev=Number.isInteger(record.rev)?record.rev:0;
  }
 }catch(_){announce('Local learning unavailable; this session can still read originals.');}
 const acceptable=new Set(state.model.lines.map(l=>l.id));
 state.notes={};
 if(saved.notes&&typeof saved.notes==='object')for(const [id,value] of Object.entries(saved.notes)){
  if(acceptable.has(id)&&typeof value==='string')state.notes[id]=value.slice(0,12000);
 }
 state.bookmarks=Array.isArray(saved.bookmarks)?saved.bookmarks.filter(id=>acceptable.has(id)).slice(0,2000):[];
 state.size=Number.isInteger(saved.size)&&saved.size>=28&&saved.size<=60?saved.size:36;
 state.theme=['day','amrit'].includes(saved.theme)?saved.theme:'day';
 state.pace=Number.isInteger(saved.pace)&&saved.pace>=50&&saved.pace<=160?saved.pace:70;
 state.mode=['read','meaning','study'].includes(saved.mode)?saved.mode:'read';
 state.index=state.model.byId.has(saved.lineId)?state.model.byId.get(saved.lineId):0;
 state.unit=state.model.lines[state.index].unitIndex;state.token=0;
}
function save(){
 if(!state.pack)return false;
 const payload={notes:state.notes,bookmarks:state.bookmarks,lineId:state.model.lines[state.index].id,
  size:state.size,theme:state.theme,pace:state.pace,mode:state.mode};
 const record={schema:1,compositionId:state.pack.compositionId,editionId:state.pack.editionId,
  rev:++state.rev,savedAt:new Date().toISOString(),payload};
 try{localStorage.setItem(state.currentKey,JSON.stringify(record));return true;}
 catch(_){announce('Unable to save on this device. Export your learning if needed.');return false;}
}
const sourceLabel=l=>{
 const loc=l.location||{};
 if(l.family==='dasam')return 'Dasam Bani · '+(loc.work||'source section under review');
 if(loc.system==='ang')return 'Sri Guru Granth Sahib Ji · Ang '+loc.ang;
 return 'Sri Guru Granth Sahib Ji · source Ang under collation';
};
function toggleMode(mode){
 if(!['read','meaning','study'].includes(mode))return;
 state.mode=mode;document.body.dataset.mode=mode;
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
 const pane=$('review-mode');
 pane.hidden=mode==='read';
 pane.textContent=mode==='meaning'
  ?'Meaning: source-approved Punjabi/English line translations are still being prepared. No guessed translation is displayed.'
  :mode==='study'
   ?'Study: these are source-location facts and review status, not interpretations or spiritual advice.'
   :'';
 if(state.sourceVerified)renderUnit();
 save();
}
function applyStyle(){
 document.body.dataset.theme=state.theme;
 document.documentElement.style.setProperty('--gurmukhi-size',state.size+'px');
 $('size').value=String(state.size);$('size-value').textContent=state.size+'px';
 $('theme').value=state.theme;$('pace').value=String(state.pace);$('pace-value').textContent=String(state.pace);
}
function words(line){
 const parts=state.model.lines[state.model.byId.get(line.id)].parts;
 const doc=document.createDocumentFragment();let token=0;
 for(const part of parts){
  if(/^\s+$/u.test(part)){doc.append(document.createTextNode(part));continue;}
  const word=document.createElement('span');word.className='g-word';word.textContent=part;
  word.dataset.token=String(token++);doc.append(word);
 }
 return doc;
}
function createLine(l){
 const row=document.createElement('article');row.className='scripture-line';row.dataset.lineId=l.id;
 row.dataset.sourceSha256=l.sha256;
 if(state.bookmarks.includes(l.id))row.dataset.bookmarked='true';
 if(l.held){
  const box=document.createElement('div');
  box.className='quarantine';box.lang='en';box.setAttribute('role','note');
  const title=document.createElement('strong');title.textContent='Original line held for source review';
  const text=document.createElement('p');
  text.textContent='Anand Sahib Pauri 24 contains an unresolved digital Gurmukhi character (U+F03D). Its exact source is preserved in our research, but not presented as approved reading text.';
  const small=document.createElement('small');small.textContent='Source occurrence '+l.id+' · editor review pending';
  box.append(title,text,small);row.append(box);
 }else{
  const tuk=document.createElement('p');tuk.className='tuk';tuk.lang='pa';tuk.append(words(l));
  row.append(tuk);
 }
 row.addEventListener('click',()=>{
  const i=state.model.byId.get(l.id);
  if(i==null)return;
  state.index=i;state.token=0;paint();save();
 });
 return row;
}
function detail(l){
 const block=document.createElement('dl');block.className='source-study';
 const facts=[
  ['Original source family',l.family==='sggs'?'Sri Guru Granth Sahib Ji':'Dasam Bani'],
  ['Recorded source locator',sourceLabel(l)],
  ['Original occurrence ID',l.id],
  ['Original SHA-256',l.sha256],
  ['Editorial status','Digital source candidate; human edition and rights review pending']
 ];
 for(const [name,value] of facts){
  const dt=document.createElement('dt');dt.textContent=name;
  const dd=document.createElement('dd');dd.textContent=value;block.append(dt,dd);
 }
 return block;
}
function renderUnit(){
 if(!state.pack)return;
 const section=$('source-unit');section.replaceChildren();
 const u=state.pack.units[state.unit];
 const top=document.createElement('h2');top.className='unit-heading';top.textContent=u.title;
 section.append(top);
 if(state.unit===0)for(const p of state.pack.preface||[]){
  const element=document.createElement('p');element.className='original-preface';element.lang='pa';element.textContent=p.text;section.append(element);
 }
 for(const h of u.metricalHeadings||[]){
  const header=document.createElement('p');header.className='meter-heading';header.lang='pa';header.textContent=h.text;section.append(header);
 }
 for(const l of u.lines)section.append(createLine(l));
 if(state.mode==='study')section.append(detail(u.lines[0]));
 else if(state.mode==='meaning'){
  const note=document.createElement('div');note.className='source-study';
  note.textContent='No reviewed line-by-line meaning is available for this bani yet. Original Gurmukhi above remains visible.';
  section.append(note);
 }
 $('position-label').textContent=u.title.replace('DIGITAL SOURCE CANDIDATE','');
 $('position-detail').textContent='Line '+(state.model.lines[state.index].lineIndex+1)+' of '+u.lines.length;
 $('prev-unit').disabled=state.unit===0;
 $('next-unit').disabled=state.unit===state.pack.units.length-1;
 $('reading-end').hidden=state.unit!==state.pack.units.length-1;
 paint();
}
function paint(){
 for(const e of $('source-unit').querySelectorAll('.g-word[data-active=true]'))delete e.dataset.active;
 for(const e of $('source-unit').querySelectorAll('.scripture-line[aria-current]'))e.removeAttribute('aria-current');
 const l=state.model?.lines[state.index];if(!l)return;
 const row=$('source-unit').querySelector('[data-line-id="'+l.id+'"]');
 if(row){
  row.setAttribute('aria-current','location');
  const word=row.querySelectorAll('.g-word')[state.token];
  if(word)word.dataset.active='true';
 }
 $('position-detail').textContent='Line '+(l.lineIndex+1)+' of '+state.units[l.unitIndex].lines.length;
 $('play').textContent=state.playing?'❚❚':'▶';
 $('play').setAttribute('aria-pressed',String(state.playing));
 $('play').setAttribute('aria-label',(state.playing?'Pause':'Play')+' silent visual guide');
}
function goUnit(unit,focus=false){
 if(!state.pack)return;
 pause();state.unit=Math.min(state.pack.units.length-1,Math.max(0,Number(unit)||0));
 state.index=state.model.starts[state.unit];state.token=0;
 renderUnit();save();
 $('source-unit').scrollIntoView({behavior:'instant',block:'start'});
 if(focus)$('source-unit').focus({preventScroll:true});
 announce('Reading '+state.pack.title+' · '+state.units[state.unit].title+'. Original digital source review pending.');
 const query=new URL(location.href);query.searchParams.set('bani',state.bani);query.searchParams.set('unit',String(state.unit+1));
 history.replaceState({bani:state.bani},'',query.pathname+query.search);
}
function guideStep(){
 if(!state.model||!state.sourceVerified)return false;
 const next=C.advance({index:state.index,token:state.token},state.model.lines);
 if(next.finished){pause();announce('Silent visual guide reached the end of this source candidate.');return false;}
 const sourceUnit=state.pack.units[next.index===state.index?state.unit:state.model.lines[next.index].unitIndex];
 const nextLine=sourceUnit.lines[state.model.lines[next.index].lineIndex];
 if(nextLine.held){pause();state.index=next.index;state.token=0;state.unit=state.model.lines[next.index].unitIndex;renderUnit();
  announce('STOP: Anand Sahib Pauri 24 original text needs an independent Unicode/source review.');save();return false;}
 const nextUnit=state.model.lines[next.index].unitIndex;
 state.index=next.index;state.token=next.token;
 if(nextUnit!==state.unit){state.unit=nextUnit;renderUnit();}
 else paint();
 const row=$('source-unit').querySelector('[data-line-id="'+state.model.lines[state.index].id+'"]');
 if(row&&next.newLine)row.scrollIntoView({behavior:'smooth',block:'center'});
 return true;
}
function pause(){
 state.playing=false;
 if(state.timeout)clearTimeout(state.timeout);
 state.timeout=0;
 if(state.model)paint();
}
function pulse(){
 if(!state.playing)return;
 if(!guideStep())return;
 state.timeout=setTimeout(pulse,Math.round(60000/state.pace));
}
function toggleGuide(){
 if(!state.model)return;
 if(state.playing){pause();return;}
 const l=state.pack.units[state.unit].lines[state.model.lines[state.index].lineIndex];
 if(l.held){announce('This original text line remains held for source review, not silent recitation.');return;}
 state.playing=true;paint();
 state.timeout=setTimeout(pulse,Math.round(60000/state.pace));
 announce('Silent visual word guide started. This is not synchronized audio.');
}
function chooseBani(name){
 if(!NAMES.includes(name))return Promise.reject(Error('Unknown bani'));
 pause();$('source-unit').textContent='Verifying original Gurmukhi source hashes…';
 state.sourceVerified=false;state.pack=null;state.library=null;
 return (async()=>{
  const lib=await library(),entry=lib.entries[name];
  const pack=await verifyPack(await jsonBytes(entry.path,entry.sha256),entry,name);
  state.pack=pack;state.bani=name;
  state.units=pack.units.map(u=>({id:u.id,title:u.title,lines:u.lines.map(l=>({id:l.id,text:l.text,sha256:l.sha256,ang:l.location.system==='ang'?l.location.ang:null}))}));
  state.model=C.flatten(state.units);
  if(state.model.lines.length!==entry.lines)throw Error('Core original-source line count differs from signed manifest');
  loadSaved(pack);
  $('collection').hidden=true;$('reader').hidden=false;$('dock').hidden=false;$('library-back').hidden=false;
  $('bani-title').textContent=pack.titleGurmukhi;
  $('bani-subtitle').textContent=pack.title;
  $('bani-variant').textContent=pack.reference+' · '+pack.caveat;
  applyStyle();
  state.sourceVerified=true;
  toggleMode(state.mode);
  const fromURL=Number(new URL(location.href).searchParams.get('unit'));
  goUnit(Number.isInteger(fromURL)&&fromURL>=1&&fromURL<=pack.unitCount?fromURL-1:state.unit);
  status('Exact original source hashes verified · '+pack.originalLineCount+' Gurmukhi records · edition review pending.');
  const query=new URL(location.href);query.searchParams.set('bani',name);history.replaceState({bani:name},'',query.pathname+query.search);
  return pack;
 })().catch(e=>{
  $('collection').hidden=false;$('reader').hidden=true;$('dock').hidden=true;$('library-back').hidden=true;
  state.pack=null;state.sourceVerified=false;announce('SOURCE BLOCKED: '+e.message);throw e;
 });
}
function collection(){
 pause();state.pack=null;state.model=null;state.bani=null;state.sourceVerified=false;
 $('collection').hidden=false;$('reader').hidden=true;$('dock').hidden=true;$('library-back').hidden=true;
 history.replaceState({},'',location.pathname);window.scrollTo({top:0,behavior:'instant'});
}
function modal(id,openedFrom){
 pause();const dialog=$(id);dialog.showModal();
 dialog.addEventListener('close',()=>openedFrom.focus({preventScroll:true}),{once:true});
}
function currentLine(){if(!state.pack)return null;return state.pack.units[state.unit].lines[state.model.lines[state.index].lineIndex];}
function openTools(){
 if(!state.pack)return;
 const line=currentLine();$('tools-current').textContent=state.pack.title+' · '+state.units[state.unit].title+' · '+line.id;
 $('note').value=state.notes[line.id]||'';
 $('bookmark').textContent=state.bookmarks.includes(line.id)?'★ Remove saved line':'☆ Save current line';
 $('save-status').textContent='';
 modal('tools-dialog',$('reading-tools'));
}
function openJump(){
 if(!state.pack)return;
 const list=$('jump-list');list.replaceChildren();
 state.pack.units.forEach((u,i)=>{
  const b=document.createElement('button');b.type='button';b.textContent=(i+1)+'. '+u.title;
  if(i===state.unit)b.setAttribute('aria-current','location');
  b.addEventListener('click',()=>{$('jump-dialog').close();goUnit(i,true);});
  list.append(b);
 });
 modal('jump-dialog',$('jump'));
}
function exportLearning(){
 if(!state.pack)return;
 const data={project:'GLP-001-NITNEM-PRIVATE-REVIEW',schema:1,compositionId:state.pack.compositionId,
  editionId:state.pack.editionId,exportedAt:new Date().toISOString(),
  state:{notes:state.notes,bookmarks:state.bookmarks,lineId:state.model.lines[state.index].id,
   size:state.size,theme:state.theme,pace:state.pace,mode:state.mode}};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');
 a.href=url;a.download='nitnem-source-review-'+state.bani+'-learning.json';document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
 $('save-status').textContent='Export prepared. Your reflections remain local.';
}
async function importLearning(file){
 if(!file||file.size>2500000)throw Error('Invalid or oversized learning file');
 const incoming=JSON.parse(await file.text());
 if(incoming.project!=='GLP-001-NITNEM-PRIVATE-REVIEW'||incoming.schema!==1
 ||incoming.compositionId!==state.pack.compositionId||incoming.editionId!==state.pack.editionId)
 throw Error('This is not the matching private-review bani and edition.');
 const parsed=C.normalise({...incoming.state,read:{id:incoming.state.lineId,offset:0}},state.model,state.units);
 state.notes=parsed.notes;state.bookmarks=parsed.bookmarks;
 state.size=parsed.size;state.theme=parsed.theme;state.pace=parsed.pace;
 state.mode=parsed.mode;state.index=state.model.byId.get(parsed.read.id)??0;state.unit=state.model.lines[state.index].unitIndex;
 applyStyle();state.sourceVerified=true;toggleMode(state.mode);renderUnit();
 if(!save())throw Error('Browser rejected imported learning; do not close until exported');
 $('save-status').textContent='Matching edition learning imported only into this private beta.';
}
async function offline(){
 if(!('serviceWorker' in navigator)||!isSecureContext){$('offline-message').textContent='Service worker is unavailable; use online reading.';return false;}
 try{
  const registration=await navigator.serviceWorker.register('sw.js',{scope:'./',updateViaCache:'none'});
  const active=registration.active;
  if(registration.waiting){
   $('offline-message').textContent='An updated source-review shell is waiting. Close open tabs before applying a reviewed update.';
   return false;
  }
  if(active){
   $('offline-message').textContent='Private source-review shell installed. Actual iPhone Airplane Mode remains to be tested.';
   return true;
  }
  const installing=registration.installing;
  if(installing){
   await new Promise((res,rej)=>{
    const end=setTimeout(()=>rej(Error('offline preparation timed out')),30000);
    installing.addEventListener('statechange',()=>{if(installing.state==='activated'){clearTimeout(end);res();}if(installing.state==='redundant'){clearTimeout(end);rej(Error('offline original package not installed'));}});
   });
   $('offline-message').textContent='Private source-review shell cached. Reload once before testing offline.';
   return true;
  }
  return false;
 }catch(e){$('offline-message').textContent='Offline review unavailable: '+e.message;return false;}
}
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>chooseBani(b.dataset.open).catch(()=>{})));
$('library-back').addEventListener('click',collection);
$('prev-unit').addEventListener('click',()=>goUnit(state.unit-1,true));
$('next-unit').addEventListener('click',()=>goUnit(state.unit+1,true));
$('jump').addEventListener('click',openJump);$('jump-close').addEventListener('click',()=>$('jump-dialog').close());
$('reading-tools').addEventListener('click',openTools);$('tools-close').addEventListener('click',()=>$('tools-dialog').close());
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>toggleMode(b.dataset.mode)));
$('play').addEventListener('click',toggleGuide);
$('size').addEventListener('input',e=>{state.size=Number(e.target.value);applyStyle();save();});
$('theme').addEventListener('change',e=>{state.theme=e.target.value;applyStyle();save();});
$('pace').addEventListener('input',e=>{state.pace=Number(e.target.value);applyStyle();save();});
$('bookmark').addEventListener('click',()=>{
 const id=currentLine().id;
 if(state.bookmarks.includes(id))state.bookmarks=state.bookmarks.filter(x=>x!==id);
 else state.bookmarks=[...state.bookmarks,id];
 save();$('bookmark').textContent=state.bookmarks.includes(id)?'★ Remove saved line':'☆ Save current line';
 const row=$('source-unit').querySelector('[data-line-id="'+id+'"]');if(row){if(state.bookmarks.includes(id))row.dataset.bookmarked='true';else delete row.dataset.bookmarked;}
 $('save-status').textContent='Bookmark updated locally.';announce('Bookmark updated for '+id);
});
$('save-note').addEventListener('click',()=>{
 const id=currentLine().id;state.notes[id]=$('note').value.slice(0,12000);
 $('save-status').textContent=save()?'Saved in this browser, separate from Japji Sahib.':'Could not save; export now.';
});
$('export-learning').addEventListener('click',exportLearning);
$('import-learning').addEventListener('change',async e=>{
 try{await importLearning(e.target.files?.[0]);}catch(err){$('save-status').textContent='Import refused: '+err.message;}finally{e.target.value='';}
});
$('offline-install').addEventListener('click',offline);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.addEventListener('storage',e=>{if(e.key===state.currentKey&&state.pack)announce('Saved learning changed in another tab. Export your edits before continuing.');});
window.NITNEM_INTERNAL_QA=Object.freeze({
 getState:()=>({bani:state.bani,sourceVerified:state.sourceVerified,
  unitCount:state.units.length,lineCount:state.model?.lines.length||0,unit:state.unit,
  index:state.index,token:state.token,playing:state.playing,mode:state.mode,
  notes:Object.keys(state.notes).length,bookmarks:state.bookmarks.length,
  sourceApproved:false,translationApproved:false,releaseAuthorized:false,
  offlineScope:'/nitnem/',lastLineHeld:!!currentLine()?.held}),
 step:()=>guideStep(),library:()=>library()
});
const initial=new URL(location.href).searchParams.get('bani');
if(initial&&NAMES.includes(initial))chooseBani(initial).catch(()=>{});
else library().then(()=>{$('offline-message').textContent='Six source-review texts are inside this library. Use “Prepare private offline reading” to cache them for QA.';})
 .catch(e=>$('offline-message').textContent='Source manifest unavailable: '+e.message);
})();