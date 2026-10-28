/* GLP-001: six ORIGINAL DIGITAL SOURCE CANDIDATES inside the existing reader site.
 * PRIVATE QA ONLY. No outside scripture links, translations or source approval.
 * Same pure continuous-core as Japji. Independent local learning namespaces.
 */
(()=>{
'use strict';
const EXPECTED_LIBRARY='b5865b293acc3ea91a20487dd82efd6f503d22dc5823bc2a67effcd146840d7a';
const EXPECTED_LEARNING='7516a55af45c91576239fa07b064af8f3b5fd2f8b97cf9b2905bbad6e31f4e32';
const EXPECTED_SOURCE_COMMIT='373ccc34f4a1c0ccb6ce36654bf6e9574087200f';
const NAMES=['jaap','savaiye','chaupai','anand','rehras','sohila'];
const $=id=>document.getElementById(id),C=window.GLPContinuousCore,L=window.GLP_NitnemLearning;
const codec=new TextDecoder('utf-8',{fatal:true});
const state={library:null,pack:null,model:null,units:[],bani:null,unit:0,index:0,token:0,playing:false,timeout:0,mode:'read',
 size:30,theme:'day',pace:70,view:'continuous',notes:{},bookmarks:[],currentKey:null,rev:0,sourceVerified:false,
 learning:null,learningError:null};
const sourceNotice='Digital original · private testing only. Independent scripture and rights review pending.';
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
async function teachingCourse(pack){
 const course=await jsonBytes('learning/course.v9.json',EXPECTED_LEARNING);
 if(course?.meta?.schema!=='GLP-NITNEM-TEACHING-DRAFT-V1'||
    course.meta.editorialStatus!=='DRAFT_AI_UNREVIEWED'||
    course.meta.publicationAllowed!==false||
    course.meta.sourceOriginalUnchanged!==true||
    course.meta.baseSourceCommit!==EXPECTED_SOURCE_COMMIT||
    course.meta.boundManifestSHA256!==EXPECTED_LIBRARY||
    course.coverage.reviewedUnitLessons!==0||
    course.coverage.reviewedSourceMeaningLines!==0||
    !course.banis?.[pack.compositionId])throw Error('Learning draft metadata or source-review hold is invalid');
 const unitMap=new Map(pack.units.map(u=>[u.id,u]));
 const lines=new Map(pack.units.flatMap(u=>u.lines.map(l=>[l.id,l])));
 for(const [key,entry] of Object.entries(course.unitLessons||{})){
  if(!key.startsWith(pack.compositionId+'|'))continue;
  const source=unitMap.get(entry.unitId);
  if(!source||entry.status!=='DRAFT_AI_UNREVIEWED'||!source.lines.some(l=>l.id===entry.sourceAnchor.id&&l.sha256===entry.sourceAnchor.sha256))
   throw Error('Educational unit is not bound to this exact Gurmukhi source: '+key);
 }
 for(const [key,note] of Object.entries(course.closeTextNotes||{})){
  if(!key.startsWith(pack.compositionId+'|'))continue;
  const original=lines.get(note.lineId);
  if(!original||original.held||original.sha256!==note.sourceSha256||note.status!=='DRAFT_AI_UNREVIEWED')
   throw Error('Simple lesson is not bound to this exact safe original occurrence: '+key);
 }
 return course;
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
 state.size=Number.isInteger(saved.size)&&saved.size>=24&&saved.size<=60?saved.size:30;
 state.theme=['day','amrit'].includes(saved.theme)?saved.theme:'day';
 state.pace=Number.isInteger(saved.pace)&&saved.pace>=50&&saved.pace<=200&&saved.pace%5===0?saved.pace:70;
 state.mode=['read','meaning','study'].includes(saved.mode)?saved.mode:'read';
 state.view=['continuous','passage'].includes(saved.view)?saved.view:'continuous';
 state.index=state.model.byId.has(saved.lineId)?state.model.byId.get(saved.lineId):0;
 state.unit=state.model.lines[state.index].unitIndex;state.token=0;
}
function save(){
 if(!state.pack)return false;
 const payload={notes:state.notes,bookmarks:state.bookmarks,lineId:state.model.lines[state.index].id,
  size:state.size,theme:state.theme,pace:state.pace,mode:state.mode,view:state.view};
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
  ?'Short English and Punjabi meanings below authored lines. Tap for more. Passage summaries and incomplete coverage are identified separately.'
  :mode==='study'
   ?'Study · source-bound passage meaning, close sense, context, words and grammar, interpretation, reflection and teach-back. Draft, not reviewed santhiya.'
   :'';
 if(mode==='study'&&state.playing)pause();
 if(state.sourceVerified){
  L.overview($('learning-overview'),state.learning,state.bani,mode);
  renderUnit();scrollToCurrent(false);
 }
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
  if(/^\s+$/u.test(part))current.append(document.createTextNode(part));
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
  boundary.textContent='Source boundary · This pauri ends the SGPC-bounded Benti Chaupai excerpt. Four additional pauris follow ONLY in this separately labeled 29-pauri digital candidate.';
  section.append(boundary);
 }
 if(state.bani==='chaupai'&&index>=25){
  const boundary=document.createElement('p');
  boundary.className='source-variant-boundary source-variant-extended';
  boundary.setAttribute('role','note');
  boundary.textContent='Extended source · Pauri '+(index+1)+' of a 29-pauri website candidate. Not asserted to be part of every morning or SGPC Rehras practice. Source and edition review pending.';
  section.append(boundary);
 }
 if(index===0)for(const p of state.pack.preface||[]){
  const element=document.createElement('p');element.className='original-preface';element.lang='pa';
  element.textContent=p.text;section.append(element);
 }
 for(const heading of u.metricalHeadings||[]){
  const h=document.createElement('p');h.className='meter-heading';h.lang='pa';h.textContent=heading.text;
  section.append(h);
 }
 for(const l of u.lines)section.append(createLine(l));
 if(state.mode!=='read'){
  const authored=L.unitLesson(state.learning,state.bani,u,state.mode,state.view);
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
 renderUnit();scrollToCurrent(false);save();
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
 announce('Reading '+state.pack.title+' · '+state.units[state.unit].title+'. Original digital source review pending.');
 const query=new URL(location.href);query.searchParams.set('bani',state.bani);query.searchParams.set('unit',String(state.unit+1));
 history.replaceState({bani:state.bani},'',query.pathname+query.search);
}
function updateScrolledLine(){
 scrollTrackTimer=0;
 if(!state.sourceVerified||!state.model||state.view!=='continuous'||state.playing||performance.now()<programmaticUntil)return;
 const lines=state.model.lines,at=Math.max(120,Math.min(innerHeight*.22,300));
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
 if(next.finished){pause();announce('Silent visual guide reached the end of this source candidate.');return false;}
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
  state.learning=null;state.learningError=null;
  try{state.learning=await teachingCourse(pack);}
  catch(err){state.learningError=err.message;state.learning=null;}
  state.units=pack.units.map(u=>({id:u.id,title:u.title,lines:u.lines.map(l=>({id:l.id,text:l.text,sha256:l.sha256,ang:l.location.system==='ang'?l.location.ang:null}))}));
  state.model=C.flatten(state.units);
  if(state.model.lines.length!==entry.lines)throw Error('Core original-source line count differs from signed manifest');
  loadSaved(pack);
  $('collection').hidden=true;$('reader').hidden=false;$('dock').hidden=false;$('library-back').hidden=false;
  $('bani-title-en').textContent=pack.title;
  $('bani-title-pa').textContent=pack.titleGurmukhi;
  $('bani-subtitle').textContent=pack.unitCount+' passages · continuous reading · source review';
  $('bani-variant').textContent=pack.reference+' · '+pack.caveat;
  applyStyle();
  state.sourceVerified=true;
  toggleMode(state.mode);
  const requested=new URL(location.href).searchParams.get('unit');
  const fromURL=requested===null?null:Number(requested);
  const selected=fromURL!==null&&Number.isInteger(fromURL)&&fromURL>=1&&fromURL<=pack.unitCount?fromURL-1:null;
  if(selected!==null&&selected!==state.unit)goUnit(selected);
  else if(state.index>0)scrollToCurrent(false);
  else{
   programmaticUntil=performance.now()+1100;
   $('reader').scrollIntoView({behavior:'instant',block:'start'});
  }
  status('Exact original hashes verified · '+pack.originalLineCount+' Gurmukhi records. '+(state.learning
   ?L.coverageText(state.learning,name)+' · educational DRAFT ONLY'
   :'Teaching unavailable: '+state.learningError));
  const query=new URL(location.href);query.searchParams.set('bani',name);history.replaceState({bani:name},'',query.pathname+query.search);
  return pack;
 })().catch(e=>{
  $('collection').hidden=false;$('reader').hidden=true;$('dock').hidden=true;$('library-back').hidden=true;
  state.pack=null;state.sourceVerified=false;announce('SOURCE BLOCKED: '+e.message);throw e;
 });
}
function collection(){
 pause();state.pack=null;state.model=null;state.bani=null;state.sourceVerified=false;
 lineNodes.clear();activeRow=null;activeWord=null;
 $('collection').hidden=false;$('reader').hidden=true;$('dock').hidden=true;$('library-back').hidden=true;
 $('learning-overview').hidden=true;$('learning-overview').replaceChildren();
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
function exportLearning(){
 if(!state.pack)return;
 const data={project:'GLP-001-NITNEM-PRIVATE-REVIEW',schema:1,compositionId:state.pack.compositionId,
  editionId:state.pack.editionId,exportedAt:new Date().toISOString(),
  state:{notes:state.notes,bookmarks:state.bookmarks,lineId:state.model.lines[state.index].id,
   size:state.size,theme:state.theme,pace:state.pace,mode:state.mode,view:state.view}};
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
 state.size=parsed.size;state.theme=parsed.theme;
 const rawPace=Number(incoming.state?.pace);
 state.pace=Number.isInteger(rawPace)&&rawPace>=50&&rawPace<=200&&rawPace%5===0?rawPace:parsed.pace;
 state.mode=parsed.mode;state.view=['continuous','passage'].includes(incoming.state.view)?incoming.state.view:'continuous';state.index=state.model.byId.get(parsed.read.id)??0;state.unit=state.model.lines[state.index].unitIndex;
 applyStyle();state.sourceVerified=true;toggleMode(state.mode);renderUnit();scrollToCurrent(false);
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
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>toggleMode(b.dataset.mode)));
$('play').addEventListener('click',toggleGuide);
$('size').addEventListener('input',e=>{state.size=Number(e.target.value);applyStyle();save();});
$('theme').addEventListener('change',e=>{state.theme=e.target.value;applyStyle();save();});
function setVisualPace(value){
 if(!Number.isFinite(value))return;
 const next=Math.max(50,Math.min(200,Math.round(value/5)*5));
 state.pace=next;applyStyle();save();
 if(state.playing){clearTimeout(state.timeout);state.timeout=setTimeout(pulse,Math.round(60000/state.pace));}
 announce('Silent visual guide: '+next+' illustrative tokens per minute. Not synchronized to audio.');
}
$('pace').addEventListener('input',e=>setVisualPace(Number(e.target.value)));
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
  index:state.index,token:state.token,playing:state.playing,mode:state.mode,pace:state.pace,
  notes:Object.keys(state.notes).length,bookmarks:state.bookmarks.length,view:state.view,
  sourceApproved:false,translationApproved:false,releaseAuthorized:false,
  teachingAvailable:!!state.learning,
  authoredLessons:state.learning?.coverage?.byBani?.[state.bani]?.draftLessons||0,
  sourceUnitCount:state.pack?.unitCount||0,
  editorReviewedLessons:0,
  offlineScope:'/nitnem/',lastLineHeld:!!currentLine()?.held}),
 step:()=>guideStep(),library:()=>library()
});
const initial=new URL(location.href).searchParams.get('bani');
if(initial&&NAMES.includes(initial))chooseBani(initial).catch(()=>{});
else library().then(()=>{$('offline-message').textContent='Six source-review texts are inside this library. Use “Prepare private offline reading” to cache them for QA.';})
 .catch(e=>$('offline-message').textContent='Source manifest unavailable: '+e.message);
})();
