/* Shared composition reader for Nitnem and the additional Salok collections.
 * Source assets and educational drafts are verified separately.
 * Learning stays on this device; writes merge under a Web Lock.
 */
(()=>{
'use strict';
const EXPECTED_LIBRARY='9cf422955cba07ee9a8f49fbcedc4969b84232d497658fcaafe37a4aa63f4d75';
const EXPECTED_LEARNING='5f9f877b37e2e0dba58076cdf6bfb5ec9201b2b5f02619d7b52821ec12d0e10c';
const EXPECTED_SOURCE_COMMIT='373ccc34f4a1c0ccb6ce36654bf6e9574087200f';
const RELEASE='nitnem-complete-20261125';
const NAMES=['jaap','savaiye','chaupai','anand','rehras','sohila'];
// Each collection has its own scripture manifest and teaching seal. Adding a
// lesson to Salok Mahalla 9 never re-seals the existing Nitnem scripture.
const collectionId=document.documentElement.dataset.readerCollection||'nitnem';
const salokCollection=collectionId==='salok-mahalla9';
const kabirCollection=collectionId==='salok-kabir';
const faridCollection=collectionId==='salok-farid';
if(!['nitnem','salok-mahalla9','salok-kabir','salok-farid'].includes(collectionId)){
 document.getElementById('collection-status').textContent='This reading collection is not recognised.';return;
}
const SALOK_SOURCE_MANIFEST='abba1e752d13bd6a3dadef63d287d992fd20ac8a2408163239d501db2971769e';
const SALOK_TEACHING='e8fdcba77ac0cbf0ab396218a86225e45901ff9cb5b1c8524c7f6261a443bc79';
const KABIR_SOURCE_MANIFEST='eae1fdfdd3e9fedd7937bf95ec6bbe64f35b8112ece472a8a4b252bdf40d6c8d';
const KABIR_TEACHING='909002381a351de0944cacb86ef2fd8b38438177e294a3fdd2b303a2ffbe86b9';
const FARID_SOURCE_MANIFEST='f239e62d2e55fb54c060d827f3596b94ca85ccf3833fa4525315684788ac538c';
const collectionManifest=salokCollection?SALOK_SOURCE_MANIFEST:kabirCollection?KABIR_SOURCE_MANIFEST:faridCollection?FARID_SOURCE_MANIFEST:EXPECTED_LIBRARY;
const collectionTeaching=salokCollection?SALOK_TEACHING:kabirCollection?KABIR_TEACHING:faridCollection?null:EXPECTED_LEARNING;
const collectionCommit=(salokCollection||kabirCollection||faridCollection)?'34d2a7cab032c8ea24d21ff20f64653bd03766f4':EXPECTED_SOURCE_COMMIT;
const collectionRelease=salokCollection?'salok-mahalla9-complete-draft-20261126':kabirCollection?'salok-kabir-complete-draft-20261126':faridCollection?'salok-farid-source-only-20261127':RELEASE;
const collectionNames=salokCollection?['salok-mahalla9']:kabirCollection?['salok-kabir']:faridCollection?['salok-farid']:NAMES;
const $=id=>document.getElementById(id),C=window.GLPContinuousCore,L=window.GLP_NitnemLearning;
const codec=new TextDecoder('utf-8',{fatal:true});
const state={library:null,pack:null,model:null,units:[],bani:null,unit:0,index:0,token:0,playing:false,timeout:0,mode:'read',
 size:30,theme:'day',pace:70,view:'continuous',notes:{},bookmarks:[],currentKey:null,rev:0,sourceVerified:false,
 learning:null,learningError:null,manager:null,savingBlocked:false,editorLease:null,toolsLineId:null,toolsSession:null};
const pendingWrites=new Set();let selection=0,coursePromise=null,toolsSerial=0;
const lineNodes=new Map();let activeRow=null,activeWord=null,scrollTrackTimer=0,programmaticUntil=0;
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
 const manifest=await jsonBytes('data/library.json',collectionManifest);
 if(manifest.schema!=='GLP-NITNEM-LIBRARY-V2'||manifest.sourceCommit!==collectionCommit
 ||manifest.releaseId!==collectionRelease||manifest.qualifiedHumanReviewed!==false
 ||Object.keys(manifest.entries).sort().join(',')!==collectionNames.slice().sort().join(',')){
  throw Error('Reading collection identity does not match this release');
 }
 state.library=manifest;
 return manifest;
}
async function verifyPack(x,entry,name){
 if(x.schema!=='GLP-NITNEM-SOURCE-V2'||x.compositionId!==name||x.releaseId!==collectionRelease
 ||x.sourceRepositoryCommit!==collectionCommit||x.editionId!==entry.editionId
 ||x.humanCollationApproved!==false||x.publicationStatus!=='EDUCATIONAL_DRAFT'
 ||x.unitCount!==entry.units||x.originalLineCount!==entry.lines
 ||x.units?.length!==entry.units)throw Error('Digital source identity, edition or review gate changed');
 const seen=new Set(),flattened=[];
 for(const p of x.preface||[])if(await digest(p.text)!==p.sha256)throw Error('Source preface hash changed');
 for(const u of x.units){
  if(!u.id||!Array.isArray(u.lines)||!u.lines.length)throw Error('Incomplete source unit');
  for(const heading of u.metricalHeadings||[]){
   if(await digest(heading.text)!==heading.sha256)throw Error('Original source heading hash changed');
  }
  if(u.sourceDisplayOrder){
   const ids=u.sourceDisplayOrder.filter(v=>v.kind==='line').map(v=>v.id);
   const headings=u.sourceDisplayOrder.filter(v=>v.kind==='metricalHeading').map(v=>v.index);
   if(ids.join('|')!==u.lines.map(l=>l.id).join('|')||headings.join('|')!==(u.metricalHeadings||[]).map((_,i)=>i).join('|')||ids.length+headings.length!==u.sourceDisplayOrder.length)throw Error('Source display order is incomplete');
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
 if(flattened.some(l=>l.held||/[\uE000-\uF8FF]/u.test(l.text)))throw Error('Unresolved source character or held text');
 if(salokCollection){
  const original=[...x.preface,...x.units.flatMap(u=>[...u.metricalHeadings,...u.lines])];
  if(x.unitCount!==57||x.originalLineCount!==114||original.length!==117||x.sourceOccurrenceCount!==117||
   new Set(original.map(l=>l.id)).size!==117||x.releaseChannel!=='DEVELOPMENT_REVIEW'||
   await digest(original.map(l=>l.text).join('\n'))!=='16649b80d412b71d628eab27e372208bb74a5c9289702a0f581967ce91604e28')throw Error('Salok Mahalla 9 source sequence does not match the selected edition');
  for(const [index,u] of x.units.entries()){
   const id='sggs.salok-mahalla9.salok'+String(index+1).padStart(3,'0');
   if(u.id!==id||u.ordinal!==index+1||u.lines.length!==2||u.lines[0].id!==id+'.line01'||u.lines[1].id!==id+'.line02'||
    u.sourceDigest!==await digest([...u.metricalHeadings,...u.lines].map(l=>l.id+'\t'+l.sha256).join('\n')))throw Error('Salok identity or whole-passage binding changed');
   const angs=index<9?[1426,1426]:index<28?[1427,1427]:index===28?[1427,1428]:index<47?[1428,1428]:[1429,1429];
   if('sourceDisplayOrder' in u||u.metricalHeadings.length!==(index===52?1:0)||
    u.lines.some((l,i)=>l.location.ang!==angs[i]))throw Error('Salok heading order or Ang boundary changed');
  }
 }
 if(kabirCollection){
  const original=[...x.preface,...x.units.flatMap(u=>[...u.metricalHeadings,...u.lines])];
  if(x.unitCount!==243||x.originalLineCount!==486||original.length!==494||x.sourceOccurrenceCount!==494||
   new Set(original.map(l=>l.id)).size!==494||x.releaseChannel!=='DEVELOPMENT_REVIEW'||x.translationApproved!==false||
   await digest(original.map(l=>l.text).join('\n'))!=='f8de1c67654bbc6d62e1b6484c41ec31a27f930ea83cff13150a1b5eb4dae415')throw Error('Kabir source sequence or review status changed');
  // Independently freeze locators, author-heading scope, named voices and provenance,
  // so renewing a surrounding manifest cannot silently reassign these meanings.
  if(await digest(JSON.stringify([x.preface,x.units,x.sourceAudit]))!=='f240b1f07aab0fc419429019efb3f8851afa0121f0e8b26e3e1efdb505670f19')throw Error('Kabir source structure, attribution or locator changed');
  for(const [index,u]of x.units.entries()){
   const id='sggs.salok-kabir.salok'+String(index+1).padStart(3,'0');
   if(u.id!==id||u.ordinal!==index+1||u.lines.length!==2||u.lines[0].id!==id+'.line01'||u.lines[1].id!==id+'.line02'||
    'sourceDisplayOrder' in u||u.sourceDigest!==await digest([...u.metricalHeadings,...u.lines].map(l=>l.id+'\t'+l.sha256).join('\n')))throw Error('Kabir identity or whole-passage binding changed');
  }
 }
 if(name==='salok-farid'){
  const original=[...x.preface,...x.units.flatMap(u=>[...u.metricalHeadings,...u.lines])];
  if(x.unitCount!==130||x.originalLineCount!==284||original.length!==297||x.sourceOccurrenceCount!==297||
   new Set(original.map(l=>l.id)).size!==297||x.releaseChannel!=='DEVELOPMENT_REVIEW'||x.translationApproved!==false||
   await digest(original.map(l=>l.text).join('\n'))!=='1f76efa45d938db1623bc1f88ab3b3367305be19d59051ee2dab45e57ac8e60e')throw Error('Farid source sequence or review status changed');
  if(await digest(JSON.stringify([x.preface,x.units,x.sourceAudit]))!=='79088bc12a6ec32ad4cb7f1be502500ca7c259f5947fb21bc70f82a1f4153449')throw Error('Farid source structure, attribution or selection record changed');
  for(const [index,u]of x.units.entries()){
   const id='sggs.salok-farid.salok'+String(index+1).padStart(3,'0');
   if(u.id!==id||u.ordinal!==index+1||u.authorId!==null||u.lines.some((l,i)=>l.id!==id+'.line'+String(i+1).padStart(2,'0'))||
    'sourceDisplayOrder' in u||u.sourceDigest!==await digest([...u.metricalHeadings,...u.lines].map(l=>l.id+'\t'+l.sha256).join('\n')))throw Error('Farid complete-passage binding changed');
  }
 }
 return x;
}
async function teachingCourse(pack){
 if(pack.compositionId==='salok-farid')return null; // This source-only edition has no explanation asset.

 if(!coursePromise)coursePromise=jsonBytes('learning/course.complete.json',collectionTeaching).catch(error=>{coursePromise=null;throw error;});
 const course=await coursePromise;
 if(course?.meta?.schema!=='GLP-NITNEM-TEACHING-DRAFT-V2'||course.meta.releaseId!==collectionRelease||
    course.meta.editorialStatus!=='DRAFT_AI_UNREVIEWED'||
    course.meta.baseSourceCommit!==collectionCommit||
    course.meta.boundManifestSHA256!==collectionManifest||
    course.coverage.reviewedUnitLessons!==0||
    course.coverage.reviewedSourceMeaningLines!==0||
    !course.banis?.[pack.compositionId])throw Error('Learning draft identity does not match this release');
 const unitMap=new Map(pack.units.map(u=>[u.id,u]));
 const lines=new Map(pack.units.flatMap(u=>u.lines.map(l=>[l.id,l])));
 for(const [key,entry] of Object.entries(course.unitLessons||{})){
  if(!key.startsWith(pack.compositionId+'|'))continue;
  const source=unitMap.get(entry.unitId);
  if(key!==pack.compositionId+'|'+entry.unitId||!source||entry.status!=='DRAFT_AI_UNREVIEWED'||!source.lines.some(l=>l.id===entry.sourceAnchor.id&&l.sha256===entry.sourceAnchor.sha256))
   throw Error('Educational unit is not bound to this exact Gurmukhi source: '+key);
  if((salokCollection||kabirCollection)&&entry.sourcePassageSha256!==source.sourceDigest)throw Error('Salok lesson does not match the complete passage: '+key);
 }
 for(const [key,note] of Object.entries(course.closeTextNotes||{})){
  if(!key.startsWith(pack.compositionId+'|'))continue;
  const original=lines.get(note.lineId);
  if(key!==pack.compositionId+'|'+note.lineId||!original||original.held||original.sha256!==note.sourceSha256||note.status!=='DRAFT_AI_UNREVIEWED')
   throw Error('Simple lesson is not bound to this exact safe original occurrence: '+key);
 }
 for(const unit of pack.units){
  if(!course.unitLessons[pack.compositionId+'|'+unit.id])throw Error('Missing passage study: '+unit.id);
  for(const line of unit.lines)if(!course.closeTextNotes[pack.compositionId+'|'+line.id])throw Error('Missing meaning: '+line.id);
 }
 if((salokCollection||kabirCollection)&&(course.meta.publicationAllowed!==false||course.meta.reviewer!==null||
  Object.keys(course.unitLessons).length!==(kabirCollection?243:57)||Object.keys(course.closeTextNotes).length!==(kabirCollection?486:114)))throw Error('Salok draft coverage or review status changed');
 if(salokCollection||kabirCollection){
  const headings=[...pack.preface.map(h=>({heading:h,unit:pack.units[0]})),...pack.units.flatMap(unit=>unit.metricalHeadings.map(heading=>({heading,unit})))];
  if(Object.keys(course.headingNotes||{}).length!==(kabirCollection?8:3))throw Error('Salok heading context coverage changed');
  for(const {heading,unit}of headings){const note=course.headingNotes[pack.compositionId+'|'+heading.id];
   if(!note||note.unitId!==unit.id||note.headingSha256!==heading.sha256||note.status!=='DRAFT_AI_UNREVIEWED')throw Error('Heading explanation is not bound to its source');}
 }
 return course;
}
function syncLearning(record){
 state.notes=record.payload.notes;state.bookmarks=record.payload.bookmarks;state.rev=record.rev;
 for(const [id,row] of lineNodes){if(state.bookmarks.includes(id))row.dataset.bookmarked='true';else delete row.dataset.bookmarked;}
}
function learningProblem(message){
 state.savingBlocked=true;
 const text='Your saved learning was kept unchanged. '+message+' You can still read and export a recovery copy.';
 $('learning-status').hidden=false;$('learning-status').textContent=text;announce(text);
 if($('tools-dialog').open){$('save-status').textContent=text;$('save-note').disabled=true;$('import-learning').disabled=true;$('bookmark').disabled=true;}
}
function loadSaved(pack){
 const storage={getItem:key=>window.localStorage.getItem(key),setItem:(key,value)=>window.localStorage.setItem(key,value)};
 state.manager=window.GLP_NITNEM_STORAGE.create(pack,{storage,locks:navigator.locks});
 state.currentKey=state.manager.key;state.rev=0;state.savingBlocked=false;
 $('learning-status').hidden=true;
 let saved,hasSaved=false;
 try{const record=state.manager.read();hasSaved=state.manager.stored().raw!==null;syncLearning(record);saved=record.payload;}
 catch(e){saved=state.manager.seed();state.notes={};state.bookmarks=[];learningProblem(e.message);}
 if(!state.manager.supported)learningProblem('This browser does not support safe concurrent saving.');
 state.size=saved.size;state.theme=window.GLP_APPEARANCE.adoptLegacy(hasSaved?saved.theme:undefined);
 state.pace=saved.pace;state.mode=saved.mode;state.view=saved.view;
 state.index=state.model.byId.get(saved.lineId)??0;state.unit=state.model.lines[state.index].unitIndex;state.token=0;
}
function save(edits={}){
 if(!state.pack||!state.manager||state.savingBlocked)return Promise.resolve(false);
 const manager=state.manager,position=state.model.lines[state.index].id;
 const work=manager.save(position,edits).then(record=>{
  if(state.manager===manager)syncLearning(record);return true;
 }).catch(e=>{if(state.manager===manager)learningProblem(e.message);return false;});
 pendingWrites.add(work);work.finally(()=>pendingWrites.delete(work));return work;
}
async function settleWrites(){await Promise.all([...pendingWrites]);return !state.savingBlocked;}
const sourceLabel=l=>{
 const loc=l.location||{};
 if(l.family==='dasam')return 'Dasam Bani · '+(loc.work||'source section under review');
 if(loc.system==='ang')return 'Sri Guru Granth Sahib Ji · '+(loc.basis==='SELECTED_DIGITAL_WITNESS'?'digital-source Ang ':'Ang ')+(loc.angRange||loc.ang);
 return 'Sri Guru Granth Sahib Ji · '+(loc.angRange?'Ang '+loc.angRange:'source reference');
};
function toggleMode(mode,persist=true){
 if(!['read','meaning','study'].includes(mode))return;
 state.mode=mode;document.body.dataset.mode=mode;
 document.querySelectorAll('button[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
 const pane=$('review-mode');
 pane.hidden=mode==='read';
 pane.textContent=mode==='meaning'
  ?'English and Punjabi meanings appear below the Gurbani. Tap a meaning for context and deeper study.'
  :mode==='study'
   ?'Study the passage, explore its words and context, and reflect on its teaching. Explanations are educational drafts.'
   :'';
 if(faridCollection&&mode!=='read')pane.textContent='No explanation or passage study has been supplied for this collection yet. The original Gurbani remains available.';
 if(mode==='study'&&state.playing)pause();
 if(state.sourceVerified){
  if(faridCollection){$('learning-overview').replaceChildren();$('learning-overview').hidden=true;}
  else L.overview($('learning-overview'),state.learning,state.bani,mode);
  renderUnit();scrollToCurrent(false);
 }
 if(persist)save({preferences:{mode}});
}
function applyStyle(){
 state.theme=window.GLP_APPEARANCE.get();
 document.body.dataset.theme=state.theme;
 document.documentElement.style.setProperty('--gurmukhi-size',state.size+'px');
 $('size').value=String(state.size);$('size-value').textContent=state.size+'px';
 $('theme').value=state.theme;$('pace').value=String(state.pace);$('pace-value').textContent=String(state.pace);
}
function words(line){
 const parts=state.model.lines[state.model.byId.get(line.id)].parts;
 const doc=document.createDocumentFragment();let token=0;
 // Match Japji's ending treatment: keep the final danda/numerals with the
 // preceding word without changing a single original Gurmukhi character.
 const words=parts.map((part,i)=>/^\s+$/u.test(part)?-1:i).filter(i=>i>=0);
 const last=words.at(-1),join=words.length>1&&/^[॥।੦-੯0-9]+$/u.test(parts[last]);
 const start=join?words.at(-2):-1;
 let current=doc;
 for(let i=0;i<parts.length;i++){
  const part=parts[i];
  if(i===start){
   const together=document.createElement('span');together.className='tuk-ending';
   doc.append(together);current=together;
  }
  if(/^\s+$/u.test(part)){
   current.append(document.createTextNode(part));
   if(line.family==='sggs'&&line.text.length>200&&i>0&&/॥[੦-੯0-9]*॥?$/u.test(parts[i-1]))current.append(document.createElement('br'));
  }
  else{
   const word=document.createElement('span');word.className='g-word';
   word.textContent=part;word.dataset.token=String(token++);current.append(word);
  }
  if(join&&i===last)current=doc;
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
  if(state.mode!=='read'&&state.learning){
   const note=L.lineNote(state.learning,state.bani,l);
   if(note)row.append(note);
  }
 }
 lineNodes.set(l.id,row);
 row.addEventListener('click',()=>{
  const i=state.model.byId.get(l.id);
  if(i==null)return;
  state.index=i;state.unit=state.model.lines[i].unitIndex;state.token=0;paint();save();
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
  ['Editorial status','Documented digital edition; qualified human collation and teaching review pending']
 ];
 if(l.location?.printedExtentObservation)facts.push(['Printed-page spot check','Ang '+l.location.printedExtentObservation.angs.join('–')+' · separately observed; full edition collation is pending']);
 for(const [name,value] of facts){
  const dt=document.createElement('dt');dt.textContent=name;
  const dd=document.createElement('dd');dd.textContent=value;block.append(dt,dd);
 }
 return block;
}
function passage(index){
 const u=state.pack.units[index],section=document.createElement('section');
 section.className='passage-block';section.dataset.unitIndex=String(index);
 section.id='nitnem-passage-'+index;
 section.setAttribute('aria-label',u.title);
 const top=document.createElement('h2');top.className='unit-heading';top.textContent=u.title;section.append(top);
 if(state.bani==='chaupai'&&index===24){
  const boundary=document.createElement('p');
  boundary.className='source-variant-boundary';
  boundary.setAttribute('role','note');
  boundary.textContent='Reading boundary · This pauri ends the 25-pauri Benti Chaupai section specified for Rehras in the SGPC Rehat Maryada. This reader also includes four additional pauris, clearly marked below.';
  section.append(boundary);
 }
 if(state.bani==='chaupai'&&index>=25){
  const boundary=document.createElement('p');
  boundary.className='source-variant-boundary source-variant-extended';
  boundary.setAttribute('role','note');
  boundary.textContent='Additional pauri '+(index+1)+' · This 29-pauri reading includes a continuation beyond the 25-pauri Rehras section. Recitation traditions differ.';
  section.append(boundary);
 }
 if(kabirCollection&&state.mode!=='read'){
  const attribution=u.attribution,mahalla=attribution.explicitMahalla,voices=attribution.namedVoices;
  if(mahalla||voices.length){
   const note=document.createElement('p');note.className='source-attribution editorial-note';note.setAttribute('role','note');
   const en=document.createElement('span'),pa=document.createElement('span');pa.lang='pa';
   if(mahalla){en.textContent='Editorial context · Mahalla '+mahalla.mahalla+': '+mahalla.authorLabel+'. The original heading below applies to this Salok.';pa.textContent=mahalla.mahalla===3?'ਸੰਪਾਦਕੀ ਜਾਣਕਾਰੀ · ਮਃ ੩ ਗੁਰੂ ਅਮਰ ਦਾਸ ਜੀ ਵੱਲ ਸੰਕੇਤ ਕਰਦਾ ਹੈ। ਹੇਠਲਾ ਮੂਲ ਸਿਰਲੇਖ ਇਸ ਸਲੋਕ ਨਾਲ ਜੁੜਿਆ ਹੈ।':'ਸੰਪਾਦਕੀ ਜਾਣਕਾਰੀ · ਮਹਲਾ ੫ ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ ਵੱਲ ਸੰਕੇਤ ਕਰਦਾ ਹੈ। ਹੇਠਲਾ ਮੂਲ ਸਿਰਲੇਖ ਇਸ ਸਲੋਕ ਨਾਲ ਜੁੜਿਆ ਹੈ।';}
   else{const labels={Namdev:['Bhagat Namdev Ji','ਭਗਤ ਨਾਮਦੇਵ ਜੀ'],Trilochan:['Bhagat Trilochan Ji','ਭਗਤ ਤ੍ਰਿਲੋਚਨ ਜੀ'],Ravidas:['Bhagat Ravidas Ji','ਭਗਤ ਰਵਿਦਾਸ ਜੀ']};en.textContent='Editorial context · Named voices: '+voices.map(v=>labels[v][0]).join(', ')+'. A name within the verse is not, by itself, an author assignment. See the passage study.';pa.textContent='ਸੰਪਾਦਕੀ ਜਾਣਕਾਰੀ · ਤੁਕਾਂ ਵਿੱਚ ਆਏ ਨਾਮ: '+voices.map(v=>labels[v][1]).join(', ')+'। ਤੁਕ ਵਿੱਚ ਆਇਆ ਨਾਮ ਆਪਣੇ ਆਪ ਰਚਨਾਕਾਰ ਦਾ ਨਿਰਣਾ ਨਹੀਂ ਕਰਦਾ। ਇਸ ਬਾਰੇ ਸਲੋਕ ਦੇ ਅਧਿਐਨ ਵਿੱਚ ਪੜ੍ਹੋ।';}
   note.append(en,document.createElement('br'),pa);section.append(note);
  }
 }
 if(index===0)for(const p of state.pack.preface||[]){
  const element=document.createElement('p');element.className='original-preface';element.lang='pa';
  element.textContent=p.text;section.append(element);
  if((salokCollection||kabirCollection)&&state.mode!=='read'){const note=L.headingNote(state.learning,state.bani,u,p);if(note)section.append(note);}
 }
 const appendHeading=heading=>{
  const h=document.createElement('p');h.className='meter-heading';h.lang='pa';h.textContent=heading.text;
  section.append(h);
  if(state.mode!=='read'){const note=L.headingNote(state.learning,state.bani,u,heading);if(note)section.append(note);}
 };
 if(u.sourceDisplayOrder){
  for(const item of u.sourceDisplayOrder){
   if(item.kind==='line')section.append(createLine(u.lines.find(l=>l.id===item.id)));
   else if(item.kind==='metricalHeading')appendHeading(u.metricalHeadings[item.index]);
  }
 }else{
  for(const heading of u.metricalHeadings||[])appendHeading(heading);
  for(const line of u.lines)section.append(createLine(line));
 }
 if(state.mode!=='read'){
  const authored=faridCollection?null:L.unitLesson(state.learning,state.bani,u,state.mode,state.view);
  if(authored)section.append(authored);
  if(state.mode==='study'&&state.view==='passage')section.append(detail(u.lines[0]));
 }
 return section;
}
function updateViewButtons(){
 document.body.dataset.view=state.view;
 $('view-continuous').setAttribute('aria-pressed',String(state.view==='continuous'));
 $('view-passage').setAttribute('aria-pressed',String(state.view==='passage'));
 $('view-help').textContent=state.view==='continuous'
  ?'Gurmukhi flows through the entire bani without another tap. Jump to any passage using the bottom reading dock.'
  :'One passage is shown at a time. Use Previous, Next or Jump to move.';
}
function renderUnit(){
 if(!state.pack)return;
 const holder=$('source-unit'),fragment=document.createDocumentFragment();
 lineNodes.clear();activeRow=null;activeWord=null;
 const current=state.unit;
 if(state.view==='continuous'){
  for(let i=0;i<state.pack.units.length;i++)fragment.append(passage(i));
 }else fragment.append(passage(current));
 holder.replaceChildren(fragment);
 updateViewButtons();
 $('prev-unit').disabled=current===0;
 $('next-unit').disabled=current===state.pack.units.length-1;
 $('reading-end').hidden=current!==state.pack.units.length-1;
 paint();
}
function paint(){
 if(activeRow)activeRow.removeAttribute('aria-current');
 if(activeWord)delete activeWord.dataset.active;
 activeRow=null;activeWord=null;
 const line=state.model?.lines[state.index];
 if(!line)return;
 const row=lineNodes.get(line.id);
 if(row){
  row.setAttribute('aria-current','location');activeRow=row;
  activeWord=row.querySelectorAll('.g-word')[state.token]||null;
  if(activeWord)activeWord.dataset.active='true';
 }
 const unit=state.pack.units[line.unitIndex];
 $('position-label').textContent=unit.title;
 $('position-detail').textContent='Line '+(line.lineIndex+1)+' of '+unit.lines.length;
 $('prev-unit').disabled=line.unitIndex===0;
 $('next-unit').disabled=line.unitIndex===state.pack.units.length-1;
 $('reading-end').hidden=line.unitIndex!==state.pack.units.length-1;
 const next=state.mode==='read'?-1:L.nextIndex(state.learning,state.bani,state.pack.units,state.unit);
 const button=$('next-written-lesson');button.hidden=next<0;
 if(next>=0){button.dataset.nextUnit=String(next);button.textContent='Next written '+(state.mode==='study'?'learning':'meaning')+' lesson · passage '+(next+1);}
 $('play').textContent=state.playing?'❚❚':'▶';
 $('play').setAttribute('aria-pressed',String(state.playing));
 $('play').setAttribute('aria-label',(state.playing?'Pause':'Play')+' silent visual guide');
 if(state.sourceVerified){
  const query=new URL(location.href),unit=String(line.unitIndex+1);
  if(query.searchParams.get('bani')!==state.bani||query.searchParams.get('unit')!==unit){query.searchParams.set('bani',state.bani);query.searchParams.set('unit',unit);history.replaceState({bani:state.bani},'',query.pathname+query.search);}
 }
}
function scrollToCurrent(focus=false){
 const line=state.model?.lines[state.index];
 if(!line)return;
 const row=lineNodes.get(line.id);
 if(!row)return;
 programmaticUntil=performance.now()+1100;
 row.scrollIntoView({behavior:'instant',block:'start'});
 if(focus)$('source-unit').focus({preventScroll:true});
}
function selectView(view){
 if(!state.pack||!['continuous','passage'].includes(view)||state.view===view)return;
 pause();
 state.view=view;
 renderUnit();scrollToCurrent(false);save({preferences:{view}});
 announce(view==='continuous'?'Continuous original Gurbani reading is ready.':'One passage at a time is ready.');
}
function goUnit(unit,focus=false){
 if(!state.pack)return;
 pause();
 state.unit=Math.max(0,Math.min(state.pack.units.length-1,Number(unit)||0));
 state.index=state.model.starts[state.unit];state.token=0;
 if(state.view==='passage')renderUnit();
 else paint();
 scrollToCurrent(focus);save();
 announce('Reading '+state.pack.title+' · '+state.units[state.unit].title+'.');
 const query=new URL(location.href);query.searchParams.set('bani',state.bani);query.searchParams.set('unit',String(state.unit+1));
 history.replaceState({bani:state.bani},'',query.pathname+query.search);
}
function updateScrolledLine(){
 scrollTrackTimer=0;
 if(!state.sourceVerified||!state.model||state.view!=='continuous'||state.playing||document.querySelector('dialog[open]')||performance.now()<programmaticUntil)return;
 const headerBottom=document.querySelector('.appearance-header')?.getBoundingClientRect().bottom||0;
 const lines=state.model.lines,at=Math.max(headerBottom+14,120,Math.min(innerHeight*.22,300));
 let lo=0,hi=lines.length-1;
 while(lo<hi){
  const mid=(lo+hi)>>1,el=lineNodes.get(lines[mid].id);
  if(el&&el.getBoundingClientRect().bottom<=at)lo=mid+1;
  else hi=mid;
 }
 const id=lines[lo].id;
 if(state.index!==lo){
  state.index=lo;state.unit=lines[lo].unitIndex;state.token=0;
  paint();save();
  $('position-label').textContent=state.pack.units[state.unit].title;
 }
}
function guideStep(){
 if(!state.model||!state.sourceVerified)return false;
 const next=C.advance({index:state.index,token:state.token},state.model.lines);
 if(next.finished){pause();announce('Silent visual guide reached the end of this bani.');return false;}
 const sourceUnit=state.pack.units[next.index===state.index?state.unit:state.model.lines[next.index].unitIndex];
 const nextLine=sourceUnit.lines[state.model.lines[next.index].lineIndex];
 if(nextLine.held){pause();state.index=next.index;state.token=0;state.unit=state.model.lines[next.index].unitIndex;
  if(state.view==='passage')renderUnit();else paint();
  scrollToCurrent(false);
  announce('STOP: Anand Sahib Pauri 24 original text needs an independent Unicode/source review.');save();return false;}
 const nextUnit=state.model.lines[next.index].unitIndex;
 state.index=next.index;state.token=next.token;
 if(nextUnit!==state.unit){
  state.unit=nextUnit;
  if(state.view==='passage')renderUnit();else paint();
 }else paint();
 const row=lineNodes.get(state.model.lines[state.index].id);
 if(row&&next.newLine){
  programmaticUntil=performance.now()+750;
  row.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
 }
 return true;
}
function pause(){
 const wasPlaying=state.playing;
 state.playing=false;
 if(state.timeout)clearTimeout(state.timeout);
 state.timeout=0;
 if(state.model)paint();
 if(wasPlaying&&state.sourceVerified)save();
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
async function chooseBani(name,{savedEntry=false}={}){
 if(!collectionNames.includes(name))throw Error('Unknown bani');
 const request=++selection;pause();
 if(state.toolsSession&&!await closeTools())return null;
 await settleWrites();
 if(request!==selection)return null;
 $('source-unit').textContent='Loading Gurbani…';state.sourceVerified=false;
 try{
  const lib=await library(),entry=lib.entries[name];
  const pack=await verifyPack(await jsonBytes(entry.path,entry.sha256),entry,name);
  let learning=null,learningError=null;
  try{learning=await teachingCourse(pack);}catch(e){learningError=e.message;}
  if(request!==selection)return null;
  state.pack=pack;state.bani=name;state.learning=learning;state.learningError=learningError;
  state.units=pack.units.map(u=>({id:u.id,title:u.title,lines:u.lines.map(l=>({id:l.id,text:l.text,sha256:l.sha256,ang:l.location.ang??null}))}));
  state.model=C.flatten(state.units);
  if(state.model.lines.length!==entry.lines)throw Error('Source count differs from the verified release');
  loadSaved(pack);
  $('collection').hidden=true;$('reader').hidden=false;$('dock').hidden=false;$('library-back').hidden=false;
  $('bani-title-en').textContent=pack.title;$('bani-title-pa').textContent=pack.titleGurmukhi;
  $('bani-subtitle').textContent=pack.unitCount+((salokCollection||kabirCollection||faridCollection)?' Saloks':' passages')+(faridCollection?' · Original Gurmukhi · explanations pending':' · Read, Meaning and Study');
  $('bani-variant').textContent=pack.reference+' · '+(kabirCollection?'Original headings retained. Documented source differences; qualified collation pending.':pack.caveat)+(['savaiye','chaupai'].includes(name)?' The Gurmukhi text is awaiting comparison with a named printed edition.':name==='rehras'?' The Chaupai, Swaiya and Dohra sections are awaiting comparison with a named printed edition.':'');
  const url=new URL(location.href),requested=!savedEntry&&url.searchParams.get('bani')===name?url.searchParams.get('unit'):null;
  const fromURL=requested===null?null:Number(requested);
  const selected=fromURL!==null&&Number.isInteger(fromURL)&&fromURL>=1&&fromURL<=pack.unitCount?fromURL-1:null;
  applyStyle();state.sourceVerified=true;toggleMode(state.mode,false);
  if(selected!==null&&selected!==state.unit)goUnit(selected);
  else if(state.index>0)scrollToCurrent(false);
  else{programmaticUntil=performance.now()+1100;$('reader').scrollIntoView({behavior:'instant',block:'start'});}
  status(faridCollection?'Original Gurmukhi · documented source selection. Explanations are not yet supplied.':state.learning?L.coverageText(state.learning,name):'Meanings could not load. Gurbani remains readable. '+state.learningError);
  const query=new URL(location.href);query.searchParams.set('bani',name);query.searchParams.set('unit',String(state.unit+1));
  history.replaceState({bani:name},'',query.pathname+query.search);return pack;
 }catch(e){
  if(request!==selection)return null;
  $('collection').hidden=false;$('reader').hidden=true;$('dock').hidden=true;$('library-back').hidden=true;
  state.pack=null;state.sourceVerified=false;
  $('collection-status').textContent='This bani could not load: '+e.message+'. Please try again.';announce($('collection-status').textContent);throw e;
 }
}
async function collection(){
 const request=++selection;
 if(state.toolsSession&&!await closeTools())return;
 pause();await settleWrites();if(request!==selection)return;
 state.pack=null;state.model=null;state.manager=null;state.bani=null;state.sourceVerified=false;
 lineNodes.clear();activeRow=null;activeWord=null;
 $('collection').hidden=false;$('reader').hidden=true;$('dock').hidden=true;$('library-back').hidden=true;
 $('learning-overview').hidden=true;$('learning-overview').replaceChildren();
 history.replaceState({},'',location.pathname);window.scrollTo({top:0,behavior:'instant'});
}
function modal(id,openedFrom){
 pause();const dialog=$(id);dialog.showModal();
 dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))openedFrom.focus({preventScroll:true});},{once:true});
}
function currentLine(){if(!state.pack)return null;return state.pack.units[state.unit].lines[state.model.lines[state.index].lineIndex];}
function toolsCurrent(session){
 return !!session&&!session.closed&&state.toolsSession===session&&state.manager===session.manager&&state.bani===session.bani&&$('tools-dialog').open;
}
function releaseTools(session){
 session?.lease?.release?.();
 if(state.editorLease===session?.lease)state.editorLease=null;
 if(session)session.lease=null;
}
function retireTools(session){
 if(!session)return;
 session.closed=true;
 if(state.toolsSession===session){state.toolsSession=null;state.toolsLineId=null;state.editorLease=null;}
 // Retain the editor lease until a dismissed session's outstanding write ends.
 if(!session.operation)releaseTools(session);
}
function toolsControls(session){
 if(!toolsCurrent(session))return;
 const editable=!!session.lease?.available&&!state.savingBlocked,busy=!!session.operation;
 $('note').disabled=!session.lease?.available;$('note').readOnly=state.savingBlocked||busy&&session.operation.freeze;
 for(const id of ['save-note','import-learning','bookmark'])$(id).disabled=!editable||busy;
 $('export-learning').disabled=busy;$('tools-close').disabled=busy;
 $('saved-list').querySelectorAll('button').forEach(button=>{button.disabled=busy;});
}
function beginTools(session,freeze,label){
 if(!toolsCurrent(session))return null;
 if(session.operation){$('save-status').textContent='Please wait for the current learning action to finish.';return null;}
 const operation={session,freeze};session.operation=operation;toolsControls(session);
 if(label)$('save-status').textContent=label;
 return operation;
}
function endTools(operation){
 if(!operation)return;
 const session=operation.session;
 if(session.operation===operation)session.operation=null;
 if(toolsCurrent(session))toolsControls(session);else releaseTools(session);
}
function dismissTools(session){
 if(!toolsCurrent(session))return false;
 retireTools(session);$('tools-dialog').close();return true;
}
function savedLines(){
 const list=$('saved-list');list.replaceChildren();
 const ids=new Set([...state.bookmarks,...Object.keys(state.notes).filter(id=>state.notes[id])]);
 for(const line of state.model.lines){
  if(!ids.has(line.id))continue;
  const button=document.createElement('button');button.type='button';button.dataset.savedLine=line.id;
  const label=document.createElement('span');label.textContent=state.pack.units[line.unitIndex].title+' · line '+(line.lineIndex+1);
  const text=document.createElement('span');text.lang='pa';text.textContent=line.text;button.append(label,text);
  button.addEventListener('click',async()=>{
   const session=state.toolsSession,operation=beginTools(session,true,'Saving your reflection before moving…');
   if(!operation)return;
   try{
    if(!await saveReflection(session)||!toolsCurrent(session))return;
    endTools(operation);if(!dismissTools(session))return;pause();
    if(state.manager!==session.manager||state.bani!==session.bani)return;
   state.index=state.model.byId.get(line.id);state.unit=line.unitIndex;state.token=0;
   if(state.view==='passage')renderUnit();else paint();scrollToCurrent(true);save();
   }finally{endTools(operation);}
  });list.append(button);
 }
 if(!list.childElementCount)list.textContent='Your bookmarked lines and reflections will appear here.';
 toolsControls(state.toolsSession);
}
async function openTools(){
 if(!state.pack||!state.sourceVerified)return;
 if(state.toolsSession)retireTools(state.toolsSession);
 const manager=state.manager,line=currentLine();
 const session={token:++toolsSerial,manager,bani:state.bani,lineId:line.id,lease:null,operation:null,closed:false};
 state.toolsSession=session;state.toolsLineId=line.id;state.editorLease=null;
 $('tools-current').textContent=state.pack.title+' · '+state.units[state.unit].title;
 $('note').value=state.notes[line.id]||'';
 $('bookmark').textContent=state.bookmarks.includes(line.id)?'★ Remove saved line':'☆ Save current line';
 $('save-status').textContent='';
 savedLines();
 for(const id of ['note','save-note','import-learning','bookmark'])$(id).disabled=true;
 $('note').readOnly=false;$('export-learning').disabled=false;$('tools-close').disabled=false;
 modal('tools-dialog',$('reading-tools'));
 let lease;try{lease=await manager.lease();}catch(e){if(toolsCurrent(session))$('save-status').textContent='Safe editing is unavailable. Your existing learning is unchanged.';return;}
 if(!toolsCurrent(session)){lease.release?.();return;}
 session.lease=lease;state.editorLease=lease;
 const allowed=lease.available&&!state.savingBlocked;
 toolsControls(session);
 if(!allowed)$('save-status').textContent=state.savingBlocked?'Saving is paused to preserve your existing learning. Export a recovery copy.':'A reflection is being edited in another tab. Close its reading tools to edit here.';
}
async function saveReflection(session=state.toolsSession){
 if(!toolsCurrent(session))return false;
 const id=session.lineId;
 if(!session.lease?.available)return true;
 if($('note').value===(state.notes[id]||''))return true;
 if(state.savingBlocked){$('save-status').textContent='Could not save this reflection. Keep this tab open and copy your text.';return false;}
 const text=$('note').value,saved=await save({notes:{[id]:text}});
 if(!toolsCurrent(session))return false;
 if(saved&&$('note').value!==text){$('save-status').textContent='The earlier text was saved. Your newer changes are still here; save them before leaving.';savedLines();return false;}
 $('save-status').textContent=saved?'Reflection saved on this device.':'Could not save. Your text is still here; copy it before leaving.';
 if(saved)savedLines();
 return saved;
}
async function closeTools(){
 const session=state.toolsSession;if(!session)return true;
 const operation=beginTools(session,true,'Saving your reflection…');if(!operation)return false;
 try{
  if(!await saveReflection(session)||!toolsCurrent(session))return false;
  endTools(operation);return dismissTools(session);
 }finally{endTools(operation);}
}
async function saveNote(){
 const session=state.toolsSession,operation=beginTools(session,false,'Saving your reflection…');if(!operation)return false;
 try{return await saveReflection(session);}finally{endTools(operation);}
}
$('tools-dialog').addEventListener('cancel',e=>{e.preventDefault();closeTools();});
$('tools-dialog').addEventListener('close',()=>{if(!$('tools-dialog').open)retireTools(state.toolsSession);});
let meaningFocusReturn=null;
function openMeaningDetail(button){
 if(!state.sourceVerified||!state.learning||!state.pack)return;
 const body=$('meaning-dialog-body'),dlg=$('meaning-dialog');
 let content=null,title='';
 if(button.dataset.meaningLine){
  const id=button.dataset.meaningLine,index=state.model.byId.get(id);
  if(index===undefined)return;
  const m=state.model.lines[index],source=state.pack.units[m.unitIndex].lines[m.lineIndex];
  if(source.held||source.sha256!==m.sha256)return;
  content=L.lineDetails(state.learning,state.bani,source,state.pack.units[m.unitIndex]);
  const isPassageContext=state.learning.closeTextNotes[state.bani+'|'+id]?.kind==='AGGREGATED_SOURCE_RECORD_EDUCATIONAL_CONTEXT_NOT_LITERAL_TRANSLATION';
  title=state.pack.units[m.unitIndex].title+(isPassageContext?' · source record ':' · line ')+(m.lineIndex+1);
 }else if(button.dataset.detailUnit){
  const u=state.pack.units.find(x=>x.id===button.dataset.detailUnit);
  if(!u)return;
  content=L.unitLesson(state.learning,state.bani,u,'study','passage');
  title=u.title+' · meaning and study';
 }
 if(!content)return;
 pause();
 meaningFocusReturn=button;
 $('meaning-dialog-title').textContent=title;
 body.replaceChildren(content);
 dlg.showModal();
 $('meaning-dialog-title').focus({preventScroll:true});
}
$('source-unit').addEventListener('click',e=>{
 const button=e.target.closest('button[data-meaning-line],button[data-detail-unit]');
 if(!button||!$('source-unit').contains(button))return;
 e.preventDefault();e.stopPropagation();
 openMeaningDetail(button);
});
$('meaning-close').addEventListener('click',()=>$('meaning-dialog').close());
$('meaning-dialog').addEventListener('close',()=>{
 $('meaning-dialog-body').replaceChildren();
 if(meaningFocusReturn?.isConnected)meaningFocusReturn.focus({preventScroll:true});
 meaningFocusReturn=null;
});
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
async function exportLearning(){
 const session=state.toolsSession,operation=beginTools(session,true,'Preparing your backup…');if(!operation)return;
 try{
  const reflectionSaved=await saveReflection(session);if(!toolsCurrent(session))return;
  await settleWrites();if(!toolsCurrent(session))return;
  let text,recovery=false;
  try{text=session.manager.exportText();}
  catch(e){try{text=session.manager.stored()?.raw;}catch(_){}recovery=true;}
  if(!text){$('save-status').textContent='No saved learning could be exported. Copy any unsaved reflection from the text box.';return;}
  if(!reflectionSaved&&!recovery){const backup=JSON.parse(text);backup.state.notes[session.lineId]=$('note').value;text=JSON.stringify(backup,null,2);}
  const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');
  a.href=url;a.download='nitnem-'+session.bani+(recovery?'-recovery':'-learning')+'.json';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
  $('save-status').textContent=recovery?'Recovery file prepared with the unchanged saved data. Also copy any unsaved reflection.':!reflectionSaved?'Backup includes the reflection currently in this text box. It may contain changes not yet saved on this device.':'Backup prepared. Keep this file somewhere you can find it.';
 }finally{endTools(operation);}
}
async function importLearning(file,session=state.toolsSession){
 if(!file||!Number.isSafeInteger(file.size)||file.size<0||file.size>(session?.manager?.maxBackupBytes??0))throw Error('Invalid or oversized learning file');
 if(!toolsCurrent(session)||state.savingBlocked||!session.lease?.available)throw Error('Safe saving is not available in this tab');
 const operation=beginTools(session,true,'Reading your learning backup…');if(!operation)return;
 try{
  if(!await saveReflection(session)){if(toolsCurrent(session))throw Error('Save or copy the current reflection first');return;}
  if(!toolsCurrent(session))return;
  if(!await settleWrites()){if(toolsCurrent(session))throw Error('Save or copy the current reflection first');return;}
  if(!toolsCurrent(session))return;
  const noteText=$('note').value,text=await file.text();
  if(!toolsCurrent(session))return;
  if($('note').value!==noteText)throw Error('Your reflection changed while the backup was reading. Save it before importing.');
  const record=await session.manager.importText(text);
  if(!toolsCurrent(session))return;
  const newerText=$('note').value!==noteText;syncLearning(record);
  if(!newerText)$('note').value=state.notes[session.lineId]||'';
  $('bookmark').textContent=state.bookmarks.includes(session.lineId)?'★ Remove saved line':'☆ Save current line';
  $('save-status').textContent='Bookmarks and reflections merged. Your current reading place and settings were kept.'+(record.previousEdition?' This backup used an earlier documented edition.':'')+(newerText?' Your newer reflection is still in the text box; save it before leaving.':'');
  savedLines();
 }finally{endTools(operation);}
}
window.GLP_BEFORE_UPDATE=async()=>{
 pause();const session=state.toolsSession,manager=state.manager;
 const operation=session?beginTools(session,true,'Saving before the update…'):null;
 if(session&&!operation)return false;
 try{
  if(session&&(!await saveReflection(session)||!toolsCurrent(session)))return false;
  const settled=await settleWrites();
  return settled&&state.manager===manager&&(!session||toolsCurrent(session));
 }finally{endTools(operation);}
};
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>chooseBani(b.dataset.open).catch(()=>{})));
$('library-back').addEventListener('click',collection);
$('prev-unit').addEventListener('click',()=>goUnit(state.unit-1,true));
$('next-unit').addEventListener('click',()=>goUnit(state.unit+1,true));
$('jump').addEventListener('click',openJump);$('jump-close').addEventListener('click',()=>$('jump-dialog').close());
$('reading-tools').addEventListener('click',openTools);$('tools-close').addEventListener('click',closeTools);
$('next-written-lesson').addEventListener('click',()=>{
 const button=$('next-written-lesson');
 if(button.hidden||!Number.isInteger(Number(button.dataset.nextUnit)))return;
 goUnit(Number(button.dataset.nextUnit),true);
});
$('view-continuous').addEventListener('click',()=>selectView('continuous'));
$('view-passage').addEventListener('click',()=>selectView('passage'));
window.addEventListener('scroll',()=>{
 if(!state.sourceVerified||state.view!=='continuous'||state.playing||performance.now()<programmaticUntil)return;
 if(scrollTrackTimer)clearTimeout(scrollTrackTimer);
 scrollTrackTimer=setTimeout(updateScrolledLine,130);
},{passive:true});
function userScrollIntent(event){
 if(event.isTrusted===false||!state.sourceVerified||state.view!=='continuous'||state.playing||document.querySelector('dialog[open]'))return;
 if(event.type==='keydown'){
  if(event.altKey||event.ctrlKey||event.metaKey||!['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))return;
  if(event.target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
  if(event.key===' '&&event.target?.closest?.('button'))return;
 }
 programmaticUntil=0;
 if(scrollTrackTimer)clearTimeout(scrollTrackTimer);
 scrollTrackTimer=setTimeout(updateScrolledLine,130);
}
for(const type of ['wheel','touchmove'])window.addEventListener(type,userScrollIntent,{passive:true});
window.addEventListener('keydown',userScrollIntent);
document.querySelectorAll('button[data-mode]').forEach(b=>b.addEventListener('click',()=>toggleMode(b.dataset.mode)));
$('play').addEventListener('click',toggleGuide);
$('size').addEventListener('input',e=>{state.size=Number(e.target.value);applyStyle();save({preferences:{size:state.size}});});
$('theme').addEventListener('change',e=>window.GLP_APPEARANCE.set(e.target.value));
window.addEventListener('glp:appearance',e=>{state.theme=e.detail.theme;$('theme').value=state.theme;});
function setVisualPace(value){
 if(!Number.isFinite(value))return;
 const next=Math.max(50,Math.min(200,Math.round(value/5)*5));
 state.pace=next;applyStyle();save({preferences:{pace:next}});
 if(state.playing){clearTimeout(state.timeout);state.timeout=setTimeout(pulse,Math.round(60000/state.pace));}
 announce('Silent visual guide: '+next+' illustrative tokens per minute. Not synchronized to audio.');
}
$('pace').addEventListener('input',e=>setVisualPace(Number(e.target.value)));
$('bookmark').addEventListener('click',async()=>{
 const session=state.toolsSession;if(!toolsCurrent(session)||!session.lease?.available)return;
 const operation=beginTools(session,false,'Saving your bookmark…');if(!operation)return;
 try{
  const id=session.lineId,selected=!state.bookmarks.includes(id);
  if(!await save({bookmarks:{[id]:selected}})||!toolsCurrent(session))return;
  $('bookmark').textContent=state.bookmarks.includes(id)?'★ Remove saved line':'☆ Save current line';
  $('save-status').textContent='Bookmark updated on this device.';announce('Bookmark updated.');savedLines();
 }finally{endTools(operation);}
});
$('save-note').addEventListener('click',saveNote);
$('export-learning').addEventListener('click',exportLearning);
$('import-learning').addEventListener('change',async e=>{
 const session=state.toolsSession;
 try{await importLearning(e.target.files?.[0],session);}catch(err){if(toolsCurrent(session))$('save-status').textContent='Import refused: '+err.message;}finally{if(toolsCurrent(session))e.target.value='';}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.addEventListener('storage',e=>{
 if(!state.manager||!state.pack||e.key!==state.currentKey&&e.key!==null)return;
 try{syncLearning(state.manager.read());announce('Saved bookmarks and reflections updated from another tab.');}
 catch(error){learningProblem(error.message);}
});
window.addEventListener('beforeunload',e=>{
 const session=state.toolsSession;
 if(toolsCurrent(session)&&(session.operation||session.lease?.available&&$('note').value!==(state.notes[session.lineId]||''))){e.preventDefault();e.returnValue='';}
});
window.NITNEM_INTERNAL_QA=Object.freeze({
 getState:()=>({bani:state.bani,sourceVerified:state.sourceVerified,
  unitCount:state.units.length,lineCount:state.model?.lines.length||0,unit:state.unit,
  index:state.index,token:state.token,playing:state.playing,mode:state.mode,pace:state.pace,
  notes:Object.keys(state.notes).length,bookmarks:state.bookmarks.length,view:state.view,
  sourceApproved:false,translationApproved:false,releaseAuthorized:!(salokCollection||kabirCollection||faridCollection),savingBlocked:state.savingBlocked,
  teachingAvailable:!!state.learning,
  authoredLessons:state.learning?.coverage?.byBani?.[state.bani]?.draftLessons||0,
  sourceUnitCount:state.pack?.unitCount||0,
  editorReviewedLessons:0,
  offlineScope:new URL('../',location.href).pathname,lastLineHeld:!!currentLine()?.held}),
 step:()=>guideStep(),library:()=>library()
});
const entryQuery=new URL(location.href).searchParams,initial=entryQuery.get('bani');
const learningEntry=entryQuery.getAll('learning');
const openSavedEntry=learningEntry.length===1&&learningEntry[0]==='saved'&&entryQuery.getAll('bani').length===1;
if(initial&&collectionNames.includes(initial))chooseBani(initial,{savedEntry:openSavedEntry}).then(async pack=>{
 // A source failure never reaches the tools. The initial Saved link does not
 // change the selected occurrence, even if an unrelated unit parameter exists.
 if(!pack||!openSavedEntry||!state.sourceVerified||state.savingBlocked)return;
 await openTools();
 if(!toolsCurrent(state.toolsSession))return;
 const list=$('saved-lines'),summary=list.querySelector('summary');
 list.open=true;summary.focus({preventScroll:true});list.scrollIntoView({block:'nearest',behavior:'instant'});
}).catch(()=>{});
else library().catch(e=>$('collection-status').textContent='Reading collection unavailable: '+e.message);
})();
