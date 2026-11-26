/* Source nodes stay mounted. Teaching and browser-owned learning are separate. */
(async()=>{
 'use strict';
 const $=id=>document.getElementById(id),L=window.GLP_SUKHMANI_LEARNING,pack=window.GLP_SUKHMANI,teaching=window.GLP_SUKHMANI_TEACHING||{};
 const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!=null)e.textContent=text;if(cls)e.className=cls;return e;};
 const button=(text,fn,attrs={})=>{const b=el('button',text);b.type='button';for(const [k,v]of Object.entries(attrs))b.setAttribute(k,v);b.addEventListener('click',fn);return b;};
 const announce=text=>{$('status').textContent=text;};
 const sourceRoot=$('sukhmani-text'),sourceControls=[...document.querySelectorAll('button,input,select')].map(node=>[node,node.disabled]),sourceFooter=document.querySelector('.end-note');
 sourceRoot.dataset.sourceIntegrity='checking';sourceRoot.setAttribute('aria-busy','true');sourceRoot.textContent='Checking original scripture…';sourceControls.forEach(([node])=>{node.disabled=true;});if(sourceFooter)sourceFooter.hidden=true;
 let m;try{
  if(!L||!window.GLPSourceIntegrity)throw Error('The verification module is unavailable.');
  window.GLP_SOURCE_INTEGRITY_RECEIPT=await window.GLPSourceIntegrity.verify('sukhmani',pack);
  m=L.model(pack);
 }catch(error){
  sourceRoot.dataset.sourceIntegrity='failed';sourceRoot.setAttribute('aria-busy','false');sourceRoot.setAttribute('role','alert');sourceRoot.replaceChildren(el('p','The original scripture could not be verified, so it has not been displayed. Your saved learning has not been changed.','coverage-note'));
  const recovery=el('section',null,'coverage-note'),result=el('p');result.setAttribute('role','status');
  const backup=button('Export original learning',()=>{
   try{
    const key='glp001.sukhmani.v1',raw=localStorage.getItem(key);
    if(raw===null){result.textContent='No saved Sukhmani learning found in this browser.';return;}
    // Preserve the exact raw string in either envelope. Valid v2 state can be
    // imported by the normal reader once its source has verified.
    let state;try{state=JSON.parse(raw);}catch{}
    const valid=state&&typeof state==='object'&&!Array.isArray(state)&&state.version===2;
    const envelope=valid?{projectId:'GLP-001',format:'glp-sukhmani-learning',version:1,composition:'sukhmani',createdAt:new Date().toISOString(),state,raw}:{projectId:'GLP-001',format:'glp-sukhmani-raw-recovery',version:1,key,createdAt:new Date().toISOString(),raw};
    download(valid?'sukhmani-learning.json':'sukhmani-original-record.json',JSON.stringify(envelope,null,2));
    result.textContent='Backup download requested. Keep the file and check it before removing any site data.';
   }catch(_){result.textContent='Backup unavailable. Do not clear site data.';}
  },{id:'source-failure-export'});
  recovery.append(el('p','Export your learning before attempting recovery. A normal reload may still use a damaged offline copy. Do not clear website data or remove the installed app until you have checked your backup.'),backup,result);
  sourceRoot.append(recovery);announce('Scripture verification failed. Original learning export remains available.');return;
 }
 sourceRoot.dataset.sourceIntegrity='verified';sourceRoot.setAttribute('aria-busy','false');sourceRoot.textContent='';sourceControls.forEach(([node,disabled])=>{node.disabled=disabled;});if(sourceFooter)sourceFooter.hidden=false;
 const firstAshtpadi=pack.ashtpadis[0].number,lastAshtpadi=pack.ashtpadis[pack.ashtpadis.length-1].number,totalAshtpadis=24;
 const ashtpadiRange=firstAshtpadi===lastAshtpadi?String(firstAshtpadi):firstAshtpadi+'–'+lastAshtpadi,coverageLabel='Ashtpadis '+ashtpadiRange+' of '+totalAshtpadis;
 const salokCount=pack.ashtpadis.filter(a=>a.lines.some(l=>l.kind==='salok')).length,pauriCount=new Set(m.lines.filter(l=>l.pauri).map(l=>l.ashtpadi+'.'+l.pauri)).size;
 const remainingScope=lastAshtpadi<totalAshtpadis?'Ashtpadis '+(lastAshtpadi+1)+'–'+totalAshtpadis+' are not included in this reading pack.':'All '+totalAshtpadis+' Ashtpadis are included in this reading pack.';
 const scopeNote='This pack contains '+salokCount+' introductory Saloks and '+pauriCount+' pauris in their original order. '+remainingScope;
 let state=L.seed(m),storage=null,shared=null,writable=false,originalRaw=null,loadError='',pending=Promise.resolve(true),scrollTimer=null,guideTimer=null,playing=false,internalScroll=false,lastActive=null,editorLease=null,editor=null,returnFocus=null,dialogGeneration=0;
 const nodes=new Map(),units=new Map(),unitLines=new Map(),meanings=teaching.meanings||{},lessons=teaching.ashtpadis||{},dialog=$('sk-dialog'),body=$('sk-dialog-body');
 try{storage=window.localStorage;originalRaw=storage.getItem(L.KEY);state=L.read(m,storage);shared=window.GLP_SHARED_LEARNING.create({storage,locks:navigator.locks,key:L.KEY,normalise:s=>L.normalise(m,s),seed:L.seed(m)});writable=shared.supported;if(!writable)loadError='Safe saving is unavailable in this browser. You can read and download Sukhmani learning for this session.';}catch(e){loadError=e.message;}
 const initialRead=state.read;
 // A URL fragment is a visit, not consent to replace persistent learning.
 // The skip link is ordinary in-page accessibility navigation.
 let linkedVisit=Boolean(location.hash&&location.hash!=='#sukhmani-text'),visitProblem='';
 let savedPosition={read:state.read,guide:state.guide,hasGuided:state.hasGuided};
 const visitNotice=el('section',null,'resume-notice sk-link-visit'),visitMessage=el('p');
 visitNotice.id='sk-link-visit';visitNotice.hidden=true;
 visitNotice.setAttribute('aria-label','Linked passage visit');
 visitMessage.id='sk-link-visit-message';visitMessage.setAttribute('role','status');
 const visitActions=el('div',null,'sk-visit-actions');
 const returnButton=button('Return to saved place',()=>finishVisit(false),{id:'sk-visit-return'});
 const keepButton=button('Use this as my reading place',()=>finishVisit(true),{id:'sk-visit-keep'});
 visitActions.append(returnButton,keepButton);visitNotice.append(visitMessage,visitActions);
 $('sukhmani-text').before(visitNotice);
 function updateSavedPosition(s){savedPosition={read:s.read,guide:s.guide,hasGuided:s.hasGuided};}
 function readLatestPosition(){
  // If the original record cannot be read, keep the last known position
  // in memory. Do not try to fix or overwrite the original record here.
  try{if(storage)updateSavedPosition(L.read(m,storage));return true;}catch(_){return false;}
 }
 function updateVisitNotice(){
  visitNotice.hidden=!linkedVisit;document.body.classList.toggle('sk-visiting',linkedVisit);
  if(!linkedVisit)return;
  const message=(visitProblem||'Visiting a linked passage.')+' Saved place: '+sourceNotes(m.byId.get(savedPosition.read))+'. It will stay unchanged unless you choose to use this as your reading place.';
  if(visitMessage.textContent!==message)visitMessage.textContent=message;
  keepButton.disabled=!writable||Boolean(visitProblem);
  document.documentElement.style.setProperty('--sk-visit-height',visitNotice.getBoundingClientRect().height+'px');
 }
 function visitAnchorTop(){return linkedVisit&&!visitNotice.hidden?visitNotice.getBoundingClientRect().height:0;}
 function alignLine(id,focus=false){
  const row=nodes.get(id);if(!row)return;
  clearTimeout(scrollTimer);internalScroll=true;
  row.scrollIntoView({block:'start',behavior:'instant'});
  if(focus)row.querySelector('.tuk').focus({preventScroll:true});
  requestAnimationFrame(()=>requestAnimationFrame(()=>{internalScroll=false;}));
 }
 function linkedTarget(hash){
  if(!hash||hash==='#sukhmani-text')return null;
  let name;try{name=decodeURIComponent(hash.slice(1));}catch(_){return null;}
  if(m.byId.has(name))return name;
  const section=/^ashtpadi-([1-9][0-9]?)$/.exec(name);
  if(section)return pack.ashtpadis.find(a=>a.number===Number(section[1]))?.lines[0]?.id||null;
  if(name.startsWith('unit-'))return unitLines.get(name.slice(5))?.[0]?.id||null;
  return null;
 }
 function showLinkedPassage(){
  if(!location.hash||location.hash==='#sukhmani-text'){
   if(linkedVisit)finishVisit(false,false);
   return;
  }
  pause();clearTimeout(scrollTimer);linkedVisit=true;readLatestPosition();
  const id=linkedTarget(location.hash);
  visitProblem=id?'':'This passage link was not found in this reading pack.';
  $('resume-notice').hidden=true;updateVisitNotice();
  if(id){current(id);state.guide=id;alignLine(id,true);}
  else{current(savedPosition.read);state.guide=savedPosition.guide;alignLine(savedPosition.read,false);}
 }
 async function finishVisit(adopt,clearHash=true){
  if(!linkedVisit||adopt&&(!writable||visitProblem))return;
  pause();clearTimeout(scrollTimer);
  if(adopt){
   // Commit the explicitly chosen visible place, under the existing write lock.
   const point=capture();if(point)current(point.id);state.guide=state.read;
   // Do not leave visit mode if the save fails.
   if(!await save({},false))return;
  }else{
   readLatestPosition();Object.assign(state,savedPosition);current(savedPosition.read);
  }
  linkedVisit=false;visitProblem='';
  if(clearHash&&location.hash&&location.hash!=='#sukhmani-text')history.replaceState(history.state,'',location.pathname+location.search);
  updateVisitNotice();document.documentElement.style.removeProperty('--sk-visit-height');
  alignLine(state.read,true);announce(adopt?'Reading place saved.':'Returned to your saved reading place.');
 }

 function warn(text){$('storage-warning').hidden=false;$('storage-warning').textContent=text;}
 if(loadError)warn(loadError);
 function locationLabel(line){return 'Ashtpadi '+line.ashtpadi+' · '+(line.unitId?.endsWith('.salok')||line.kind==='salok'?'Salok':line.pauri?'Pauri '+line.pauri:line.kind==='rahau'?'Rahau':'Opening');}
 function groupId(line){return line.unitId||('sukhmani.a'+String(line.ashtpadi).padStart(2,'0')+(line.pauri?'.p'+String(line.pauri).padStart(2,'0'):'.salok'));}
 function sourceNotes(line){return locationLabel(line)+' · Ang '+line.ang;}
 function bilingual(parent,value,cls=''){
  if(!value)return;
  if(Array.isArray(value)){value.forEach(v=>bilingual(parent,v,cls));return;}
  if(typeof value==='string'){parent.append(el('p',value,cls));return;}
  if(value.en)parent.append(el('p',value.en,cls));
  if(value.pa){const p=el('p',value.pa,('punjabi-text '+cls).trim());p.lang='pa';parent.append(p);}
 }
 function vocab(parent,items){
  if(!Array.isArray(items)||!items.length)return;
  parent.append(el('h4','Words to notice'));const list=el('dl');
  for(const v of items){const dt=el('dt');const word=el('span',v.gurmukhi||v.word||'');word.lang='pa';dt.append(word);if(v.roman)dt.append(document.createTextNode(' · '+v.roman));list.append(dt);const dd=el('dd');bilingual(dd,{en:v.en||v.meaning,pa:v.pa});list.append(dd);}parent.append(list);
 }
 function studySources(parent,sources){
  if(!Array.isArray(sources))return;
  const list=el('ul'),seen=new Set();
  for(const source of sources){
   if(!source||typeof source.url!=='string')continue;
   let url;try{url=new URL(source.url);}catch{continue;}
   if(url.protocol!=='https:'||url.username||url.password||seen.has(url.href))continue;
   seen.add(url.href);
   const label=[source.label,source.title].find(value=>typeof value==='string'&&value.trim())||url.hostname;
   const item=el('li'),link=el('a',label);link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',label+' (opens in a new tab)');item.append(link);
   const use=[source.use,source.role].find(value=>typeof value==='string'&&value.trim());if(use)item.append(el('p',use,'sk-study-source-use'));
   list.append(item);
  }
  if(!list.childElementCount)return;
  const disclosure=el('details',null,'sk-study-sources');disclosure.append(el('summary','Sources for this study'),list);parent.append(disclosure);
 }
 function studyCard(value,fallback){
  if(!value)return null;const c=el('section',null,'sk-study');c.setAttribute('aria-label',fallback+' study draft');
  c.append(el('p','STUDY · EDUCATIONAL DRAFT','draft-label'));
  const t=typeof value.title==='string'?value.title:value.title?.en;c.append(el('h3',t||fallback));
  if(value.title?.pa){const p=el('p',value.title.pa,'punjabi-text');p.lang='pa';c.append(p);}
  for(const field of ['overview','explanation','meaning','context','grammar','interpretiveNote','interpretation'])bilingual(c,value[field]);
  if(value.caution){const caution=el('div',null,'interpretation');caution.append(el('h4','Interpretive caution'));bilingual(caution,value.caution);c.append(caution);}
  vocab(c,value.vocabulary);
  for(const [field,title]of [['reflection','Reflection · application, not scripture'],['teachBack','Check your understanding']])if(value[field]){const r=el('div',null,'reflection');r.append(el('h4',title));bilingual(r,value[field]);c.append(r);}
  studySources(c,value.sources);
  return c;
 }
 function attachUnitLesson(container,a,unit){
  const lesson=lessons[String(a.number)];if(!lesson)return;
  const n=unitLines.get(unit)?.find(l=>l.pauri)?.pauri;
  const value=unit.endsWith('.salok')?lesson.salok:unit.endsWith('.rahau')?lesson.rahau:(lesson.pauris||[]).find(p=>Number(p.number)===Number(n));
  const c=studyCard(value,unit.endsWith('.salok')?'Salok':unit.endsWith('.rahau')?'Rahau':'Pauri '+n);if(c){const lines=unitLines.get(unit)||[];if(lines.length){const start=Math.min(...lines.map(l=>l.ang)),end=Math.max(...lines.map(l=>l.ang));c.append(el('p',locationLabel(lines[0])+' · Ang '+start+(end!==start?'–'+end:''),'draft-label'));}container.append(c);}
 }
 function render(){
  document.title='Sukhmani Sahib · Ashtpadis '+ashtpadiRange+' · Gurbani Learning Library';
  $('sk-coverage').textContent='Guru Arjan Dev Ji · Raag Gauri · '+coverageLabel;$('sk-scope').textContent=scopeNote;
  $('sukhmani-text').setAttribute('aria-label','Sukhmani Sahib, Ashtpadis '+firstAshtpadi+' to '+lastAshtpadi);
  $('sk-end-title').textContent='End of Ashtpadi '+lastAshtpadi;$('sk-end-scope').textContent=lastAshtpadi<totalAshtpadis?'This is the end of this reading pack. Sukhmani Sahib continues through Ashtpadi '+totalAshtpadis+'.':'End of Sukhmani Sahib.';
  $('sk-version').textContent='GLP-001 · Sukhmani '+ashtpadiRange+' · Public preview';
  const fragment=document.createDocumentFragment();$('ashtpadi-nav').replaceChildren();
  for(const a of pack.ashtpadis){
   const link=el('a',String(a.number));link.href='#ashtpadi-'+a.number;link.setAttribute('aria-label','Read Ashtpadi '+a.number);link.addEventListener('click',e=>{e.preventDefault();jump(a.lines[0].id);});$('ashtpadi-nav').append(link);
   const section=el('section',null,'sk-ashtpadi');section.id='ashtpadi-'+a.number;section.setAttribute('aria-labelledby','ashtpadi-title-'+a.number);
   const title=el('h2','Ashtpadi '+a.number);title.id='ashtpadi-title-'+a.number;section.append(title);
   const angs=a.lines.map(l=>l.ang);section.append(el('p','Ang '+Math.min(...angs)+'–'+Math.max(...angs),'ashtpadi-context'));
   const lesson=lessons[String(a.number)];if(lesson){const c=studyCard({title:lesson.title,overview:lesson.overview,vocabulary:lesson.vocabulary,context:lesson.context,interpretiveNote:lesson.interpretiveNote,caution:lesson.caution,reflection:lesson.reflection,teachBack:lesson.teachBack,sources:lesson.sources},'Ashtpadi '+a.number);if(c)section.append(c);}
   let currentUnit=null,unitEl=null;
   for(const line of a.lines){
    const unit=groupId(line);
    if(unit!==currentUnit){if(unitEl)attachUnitLesson(unitEl,a,currentUnit);currentUnit=unit;unitEl=el('section',null,'sk-unit');unitEl.id='unit-'+unit;unitEl.setAttribute('aria-label',locationLabel(line));unitEl.append(el('h3',locationLabel(line).split(' · ')[1],'sk-unit-label'));section.append(unitEl);units.set(unit,unitEl);unitLines.set(unit,[]);}
    unitLines.get(unit).push(line);
    const row=el('div',null,'sk-line');row.id=line.id;row.dataset.lineId=line.id;row.dataset.unit=unit;row.dataset.ang=String(line.ang);row.dataset.kind=line.kind;
    const text=el('p',line.gurmukhi,'tuk');text.lang='pa';text.tabIndex=0;text.setAttribute('role','button');text.setAttribute('aria-label',line.gurmukhi+' '+sourceNotes(line)+'. Open line details and saved learning.');text.addEventListener('click',()=>openLine(line));text.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openLine(line);}});row.append(text);
    const meaning=meanings[line.id];if(meaning){const text=el('button',null,'simple-meaning');text.type='button';text.title='Open study for '+sourceNotes(line);if(meaning.en)text.append(el('span',meaning.en,'english'));if(meaning.pa){const p=el('span',meaning.pa,'punjabi');p.lang='pa';text.append(p);}text.addEventListener('click',()=>{pause();setMode('study');const unit=units.get(groupId(line));const study=unit?.querySelector('.sk-study');if(study){study.tabIndex=-1;study.focus({preventScroll:true});study.scrollIntoView({block:'center',behavior:'auto'});}});row.append(text);
     if(meaning.transliteration)row.append(el('p',meaning.transliteration,'transliteration'));
    }
    const meta=el('p',null,'line-meta');meta.append(el('span','Ang '+line.ang,'ang-label'));const saved=el('span','','line-saved');saved.setAttribute('aria-label','Saved bookmark');meta.append(saved);row.append(meta);unitEl.append(row);nodes.set(line.id,row);
   }
   if(unitEl)attachUnitLesson(unitEl,a,currentUnit);
   fragment.append(section);
  }
  $('sukhmani-text').replaceChildren(fragment);
 }
 function appearance(){document.documentElement.dataset.theme=state.theme;document.documentElement.style.setProperty('--gurmukhi-size',state.size+'px');document.body.dataset.depth=state.mode;document.body.dataset.pronunciation=String(state.pronunciation);$('teaching-note').hidden=state.mode==='read';document.querySelector('meta[name="theme-color"]').content=state.theme==='amrit'?'#111929':'#faf6ec';for(const b of document.querySelectorAll('.modes button'))b.setAttribute('aria-pressed',String(b.dataset.depth===state.mode));}
 function syncMarks(){for(const [id,row]of nodes){const saved=state.bookmarks.includes(id);row.dataset.bookmarked=String(saved);row.querySelector('.line-saved').textContent=saved?'Saved':'';}}
 function current(id){if(!m.byId.has(id))return;if(lastActive)nodes.get(lastActive)?.removeAttribute('data-current');lastActive=id;nodes.get(id)?.setAttribute('data-current','true');state.read=id;const line=m.byId.get(id);$('sk-position').replaceChildren(document.createTextNode('Ashtpadi '+line.ashtpadi),el('small',line.pauri?'Pauri '+line.pauri:line.kind==='rahau'?'Rahau':'Salok · opening'));for(const a of $('ashtpadi-nav').children)a.setAttribute('aria-current',String(a.textContent===String(line.ashtpadi)));}
 function save(edits={},preservePosition=linkedVisit){
  if(!writable)return Promise.resolve(false);
  // No storage write at all for passive viewing, scrolling, guide ticks or
  // visibility changes during a visit. Intentional learning edits still merge.
  if(preservePosition&&!Object.values(edits).some(v=>v&&Object.keys(v).length))return pending;
  const snapshot={...state};
  pending=pending.then(async()=>{try{
   const s=await shared.save(snapshot,edits,{preservePosition});
   updateSavedPosition(s);state.notes=s.notes;state.bookmarks=s.bookmarks;syncMarks();updateVisitNotice();return true;
  }catch(e){writable=false;updateVisitNotice();warn(e.message+' Download Sukhmani learning to keep your current session.');return false;}});return pending;
 }
 function capture(){let best=nodes.get(state.read);let distance=Infinity;for(const row of nodes.values()){const r=row.getBoundingClientRect();if(r.bottom<12+visitAnchorTop())continue;const d=Math.abs(r.top-28-visitAnchorTop());if(d<distance){best=row;distance=d;}if(r.top>window.innerHeight)break;}return best?{id:best.id,top:best.getBoundingClientRect().top}:null;}
 function maintainAnchor(fn){const anchor=capture();fn();if(anchor&&nodes.has(anchor.id)){internalScroll=true;window.scrollBy({top:nodes.get(anchor.id).getBoundingClientRect().top-anchor.top,behavior:'instant'});requestAnimationFrame(()=>{internalScroll=false;});}}
 function setMode(mode){if(!['read','understand','study'].includes(mode))return;if(mode==='study')pause();maintainAnchor(()=>{state.mode=mode;appearance();});save({preferences:{mode}});announce(mode==='read'?'Gurmukhi reading.':mode==='understand'?'English and Punjabi explanation drafts.':'Study drafts are now shown after each passage.');}
 function jump(id,focus=false){if(!nodes.has(id))return;pause();current(id);state.guide=id;internalScroll=true;nodes.get(id).scrollIntoView({block:'start',behavior:'auto'});if(focus)nodes.get(id).querySelector('.tuk').focus({preventScroll:true});requestAnimationFrame(()=>{internalScroll=false;});save();$('resume-notice').hidden=true;}
 function pause(){playing=false;clearTimeout(guideTimer);guideTimer=null;$('sk-play').textContent='▶';$('sk-play').setAttribute('aria-pressed','false');$('sk-play').setAttribute('aria-label','Start silent line guide');}
 function tick(){if(!playing)return;const index=m.lines.findIndex(l=>l.id===state.guide);if(index<0){pause();return;}const line=m.lines[index];current(line.id);state.hasGuided=true;internalScroll=true;nodes.get(line.id).scrollIntoView({block:'center',behavior:'auto'});requestAnimationFrame(()=>{internalScroll=false;});save();const delay=Math.max(1600,line.gurmukhi.split(/\s+/).length*60000/state.pace);guideTimer=setTimeout(()=>{if(!playing)return;if(index+1===m.lines.length){pause();announce('Reached the end of Ashtpadi '+lastAshtpadi+'. '+remainingScope);return;}state.guide=m.lines[index+1].id;tick();},delay);}
 function toggleGuide(){if(playing){pause();announce('Silent guide paused.');return;}if(state.mode==='study')setMode('read');state.guide=state.read;playing=true;$('sk-play').textContent='Ⅱ';$('sk-play').setAttribute('aria-pressed','true');$('sk-play').setAttribute('aria-label','Pause silent line guide');announce('Silent visual guide started. It is not synchronized to a recording.');tick();}
 async function releaseEditor(saveDraft=true){
  if(editor&&saveDraft&&editor.input.value!==editor.original){const value=editor.input.value;state.notes[editor.id]=value;await save({notes:{[editor.id]:value}});}
  editor=null;if(editorLease){editorLease.release();editorLease=null;}
 }
 async function openDialog(title,kicker='SUKHMANI SAHIB'){
  pause();const generation=++dialogGeneration;await releaseEditor();returnFocus=document.activeElement;body.replaceChildren();$('sk-dialog-title').textContent=title;$('sk-dialog-kicker').textContent=kicker;if(!dialog.open)dialog.showModal();return generation;
 }
 async function closeDialog(){++dialogGeneration;await releaseEditor();dialog.close();if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
 function plainNote(text){return el('p',text,'sk-reader-note');}
 async function openLine(line){
  current(line.id);const generation=await openDialog(locationLabel(line),'ORIGINAL · ANG '+line.ang);
  const excerpt=el('p',line.gurmukhi,'excerpt');excerpt.lang='pa';body.append(excerpt);const meaning=meanings[line.id];if(meaning){body.append(el('p','EDUCATIONAL DRAFT','draft-label'));bilingual(body,meaning);if(meaning.transliteration)body.append(el('p',meaning.transliteration,'pronunciation'));}
  body.append(plainNote('Tap “Start here” to return to this line. The guide is silent and independent of recordings.'));
  const actions=el('div',null,'sk-actions');actions.append(button('Start here',async()=>{await closeDialog();jump(line.id,true);}));
  const marked=state.bookmarks.includes(line.id);const mark=button(marked?'Remove bookmark':'Bookmark this line',async()=>{const on=!state.bookmarks.includes(line.id);state.bookmarks=on?[...state.bookmarks,line.id]:state.bookmarks.filter(id=>id!==line.id);syncMarks();await save({bookmarks:{[line.id]:on}});mark.textContent=on?'Remove bookmark':'Bookmark this line';announce(on?'Line bookmarked.':'Bookmark removed.');},{'id':'sk-bookmark','aria-pressed':String(marked)});mark.addEventListener('click',()=>mark.setAttribute('aria-pressed',String(state.bookmarks.includes(line.id))));actions.append(mark);body.append(actions);
  body.append(el('h3','Your reflection','sk-section-title'),plainNote('Private to this browser. Export Sukhmani learning for a separate backup; Japji learning is not included.'));
  const field=el('textarea',null,'sk-note-field');field.id='sk-reflection';field.maxLength=12000;field.setAttribute('aria-label','Your private reflection on this Sukhmani line');field.value=state.notes[line.id]||'';body.append(field);const noteState=el('p','','sk-note-state');noteState.id='sk-note-state';body.append(noteState);
  const saveButton=button('Save reflection',async()=>{const submitted=field.value;state.notes[line.id]=submitted;const ok=await save({notes:{[line.id]:submitted}});if(editor?.input===field)editor.original=submitted;noteState.textContent=field.value!==submitted?'You have further unsaved edits.':ok?'Reflection saved in this browser.':'Kept for this session. Download Sukhmani learning before closing.';},{id:'sk-save-reflection'});
  if(writable){try{const lease=await shared.lease();if(!dialog.open||generation!==dialogGeneration){if(lease.available)lease.release();return;}if(lease.available){editorLease=lease;editor={id:line.id,input:field,original:field.value};}else{field.readOnly=true;saveButton.disabled=true;noteState.textContent=lease.reason;}}catch(e){field.readOnly=true;saveButton.disabled=true;noteState.textContent=e.message;}}
  else{editor={id:line.id,input:field,original:field.value};noteState.textContent='Saving is unavailable. You can write here and export this session.';}
  field.addEventListener('input',()=>{noteState.textContent='Unsaved reflection. Save or close this panel to keep it in this session.';});body.append(saveButton);
  body.append(el('div',null,'sk-source'));body.lastChild.append(plainNote(sourceNotes(line)),plainNote('Gurmukhi is reproduced as supplied by the source; explanations do not alter it.'));
 }
 async function openJump(){await openDialog('Choose a passage','ASHTPADIS '+ashtpadiRange);for(const a of pack.ashtpadis){body.append(el('h3','Ashtpadi '+a.number,'sk-section-title'));const grid=el('div',null,'sk-options');for(const [unit,lines]of unitLines){if(lines[0].ashtpadi!==a.number||unit.endsWith('.intro'))continue;const first=lines[0];const b=button(first.pauri?'Pauri '+first.pauri:unit.endsWith('.rahau')?'Rahau':'Salok',async()=>{await closeDialog();jump(first.id,true);});b.append(el('small','Ang '+first.ang));grid.append(b);}body.append(grid);}}
 function row(label,control){const r=el('div',null,'sk-control-row'),l=el('label',label);l.htmlFor=control.id;r.append(l,control);return r;}
 function download(filename,text){const blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
 async function exportLearning(){await releaseEditor();await pending;
  if(linkedVisit){
   if(!readLatestPosition()){warn('The saved reading record needs recovery. Download the original saved record instead.');return;}
   download('sukhmani-learning.json',L.exportState(m,{...state,...savedPosition}));
  }else download('sukhmani-learning.json',L.exportState(m,state));
  announce('Sukhmani learning exported. Japji learning has its own export.');
 }
 function rawBackup(){let raw=originalRaw;try{raw=storage?.getItem(L.KEY)??raw;}catch{}if(raw===null){announce('There is no saved Sukhmani record in this browser.');return;}download('sukhmani-original-record.json',JSON.stringify({projectId:'GLP-001',format:'glp-sukhmani-raw-recovery',version:1,key:L.KEY,createdAt:new Date().toISOString(),raw},null,2));announce('Original saved record downloaded without changes.');}
 async function openSaved(){await openDialog('Saved learning','SUKHMANI ONLY');const ids=[...new Set([...state.bookmarks,...Object.keys(state.notes).filter(id=>state.notes[id])])];if(!ids.length)body.append(plainNote('No bookmarks or reflections yet. Tap a Gurbani line to save it.'));else{const list=el('div',null,'sk-saved-list');for(const id of ids){const line=m.byId.get(id);if(!line)continue;const b=button(sourceNotes(line),()=>openLine(line));const p=el('p',line.gurmukhi,'excerpt');p.lang='pa';b.append(p);if(state.notes[id])b.append(el('small','Reflection saved'));list.append(b);}body.append(list);}}
 async function openTools(){
  await openDialog('Reading settings');
  const theme=el('select');theme.id='sk-theme';for(const [v,t]of [['day','Day'],['amrit','Amrit Vela']]){const o=el('option',t);o.value=v;theme.append(o);}theme.value=state.theme;theme.addEventListener('change',()=>{state.theme=theme.value;appearance();save({preferences:{theme:state.theme}});});body.append(row('Appearance',theme));
  const size=el('input');size.type='range';size.id='sk-size';size.min='24';size.max='48';size.step='1';size.value=String(state.size);const sr=row('Gurmukhi size · '+state.size+' px',size);size.addEventListener('input',()=>{maintainAnchor(()=>{state.size=Number(size.value);appearance();});sr.querySelector('label').textContent='Gurmukhi size · '+state.size+' px';save({preferences:{size:state.size}});});body.append(sr);
  const pronunciation=el('input');pronunciation.type='checkbox';pronunciation.id='sk-pronunciation';pronunciation.checked=state.pronunciation;pronunciation.addEventListener('change',()=>{maintainAnchor(()=>{state.pronunciation=pronunciation.checked;appearance();});save({preferences:{pronunciation:state.pronunciation}});});body.append(row('Approximate pronunciation',pronunciation));body.append(plainNote('Roman transliteration is a reading aid, not certified santhiya or a substitute for learning pronunciation from a qualified teacher.'));
  const pace=el('input');pace.type='range';pace.id='sk-pace';pace.min='40';pace.max='160';pace.step='5';pace.value=String(state.pace);const pr=row('Visual pace · '+state.pace,pace);pace.addEventListener('input',()=>{state.pace=Number(pace.value);pr.querySelector('label').textContent='Visual pace · '+state.pace;save({preferences:{pace:state.pace}});});body.append(pr,plainNote('Illustrative tokens per minute. This is a silent line guide; it does not play or follow any recording.'));
  body.append(el('h3','Your Sukhmani learning','sk-section-title'));const actions=el('div',null,'sk-actions');actions.append(button('Bookmarks & reflections',openSaved,{id:'sk-saved'}),button('Export Sukhmani learning',exportLearning,{id:'sk-export'}),button('Original saved record',rawBackup,{id:'sk-export-raw'}));body.append(actions,plainNote('These files contain only Sukhmani learning. Export Japji separately from the Japji reader. Keep a backup before updating or moving devices.'));
  const file=el('input');file.type='file';file.id='sk-import';file.accept='.json,application/json';const label=el('label','Import Sukhmani learning','sk-file');label.htmlFor=file.id;label.append(file);body.append(label);const outcome=el('p','','sk-notification');outcome.id='sk-import-result';outcome.setAttribute('role','status');body.append(outcome);
  file.addEventListener('change',async()=>{const f=file.files?.[0];if(!f)return;try{if(!writable)throw Error('Safe import is unavailable. Your current saved record has been preserved.');if(f.size>2500000)throw Error('The selected backup is too large. Nothing has changed.');const incoming=L.parse(m,await f.text());await pending;const merged=await shared.importWith(()=>{const combined=L.merge(m,L.read(m,storage),incoming);storage.setItem(L.KEY,JSON.stringify(combined));return combined;});state.notes=merged.notes;state.bookmarks=merged.bookmarks;syncMarks();outcome.textContent='Bookmarks and reflections merged. Current reading preferences and place are unchanged.';}catch(e){outcome.textContent=e.message;}file.value='';});
  body.append(el('h3','Offline reading','sk-section-title'));const offline=el('p','Offline availability depends on the installed static reading pack.','sk-reader-note');offline.id='offline-status';body.append(offline);const updates=el('div',null,'sk-actions');updates.append(button('Check for update',()=>{},{id:'check-update'}));const apply=button('Load available update',()=>{},{id:'apply-update'});apply.hidden=true;updates.append(apply);body.append(updates,button('Sources & review status',openSources));
 }
 async function openSources(){
  await openDialog('Sources & review status',coverageLabel.toUpperCase());
  body.append(plainNote(scopeNote),el('h3','Original Gurmukhi','sk-section-title'));
  const source=pack.source||pack.meta?.source||{};body.append(el('p','Source: '+(source.name||'See the source manifest supplied with this reading pack')+'.'),plainNote(m.lines.length+' preserved source occurrences, including headings and Rahau. Each retains its Ang reference and source identifier.'));
  if(source.status)body.append(plainNote('Digital source status: '+String(source.status).replaceAll('_',' ')+'.'));
  if(source.comparison?.matchedOccurrences)body.append(plainNote(source.comparison.matchedOccurrences+' occurrences were compared against '+source.comparison.name+'. This does not establish that the digital sources derive from independent printed editions.'));
  body.append(plainNote('Digital comparison is distinct from qualified human collation. No human letter-by-letter approval is claimed.'));
  if(source.commit)body.append(plainNote('Pinned source revision: '+source.commit));
  if(source.repository&&/^https:\/\//.test(source.repository)){const a=el('a','Original corpus and provenance');a.href=source.repository;a.target='_blank';a.rel='noopener noreferrer';body.append(a);}
  if(source.comparison?.url&&/^https:\/\//.test(source.comparison.url)){const p=el('p'),a=el('a','Comparison source · SriGranth.org');a.href=source.comparison.url;a.target='_blank';a.rel='noopener noreferrer';p.append(a);body.append(p);}
  body.append(el('h3','Meanings & study','sk-section-title'),el('p','English and Punjabi explanations, vocabulary and study notes are AI-assisted educational drafts. They are not qualified translations or religious approval.'),plainNote('The learning material is original editorial work. Gurbani, interpretation and personal application are kept separate. Transliteration is approximate.'));
  const supplied=Object.values(meanings).filter(x=>x?.en&&x?.pa).length;body.append(plainNote(supplied+' source occurrences have English and Punjabi explanation drafts.'));
  body.append(el('h3','Your privacy','sk-section-title'),plainNote('Bookmarks, reading place and reflections stay in this browser. No account or analytics is used. Sukhmani exports contain only Sukhmani learning; the existing Japji record is not changed.'),el('h3','Silent visual guide','sk-section-title'),plainNote('The guide advances at an illustrative pace. It has no audio and is not synchronized to any recitation. It pauses when this page is hidden or you begin scrolling manually.'));
 }
 render();appearance();current(state.read);syncMarks();
 if(!linkedVisit&&initialRead!==m.lines[0].id){$('resume-notice').hidden=false;$('resume-label').textContent='Saved place: '+sourceNotes(m.byId.get(initialRead));}
 $('resume-reading').addEventListener('click',()=>jump(initialRead,true));$('dismiss-resume').addEventListener('click',()=>{$('resume-notice').hidden=true;});
 $('sk-play').addEventListener('click',toggleGuide);$('sk-position').addEventListener('click',openJump);$('sk-tools').addEventListener('click',openTools);$('sources-open').addEventListener('click',openSources);$('sources-footer').addEventListener('click',openSources);$('back-start').addEventListener('click',()=>jump(m.lines[0].id,true));$('sk-dialog-close').addEventListener('click',closeDialog);dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
 for(const b of document.querySelectorAll('.modes button'))b.addEventListener('click',()=>setMode(b.dataset.depth));
 window.addEventListener('scroll',()=>{if(internalScroll||dialog.open)return;clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{if(internalScroll||dialog.open)return;const a=capture();if(a){current(a.id);save();}},200);},{passive:true});
 window.addEventListener('wheel',()=>{if(playing)pause();},{passive:true});window.addEventListener('touchstart',e=>{if(playing&&!e.target.closest('.reading-dock'))pause();},{passive:true});
 document.addEventListener('keydown',e=>{if(playing&&['PageDown','PageUp','Home','End','ArrowDown','ArrowUp',' '].includes(e.key)&&!e.target.closest('button,a,input,textarea,select,dialog,[role="button"]'))pause();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();save();}});
 window.addEventListener('storage',e=>{if(e.key!==L.KEY||!writable)return;try{const latest=L.read(m,storage);updateSavedPosition(latest);state.notes=latest.notes;state.bookmarks=latest.bookmarks;syncMarks();updateVisitNotice();}catch(e){writable=false;updateVisitNotice();warn(e.message);}});
 window.addEventListener('pagehide',()=>{pause();});
 window.GLP_BEFORE_UPDATE=async()=>{await releaseEditor();return await save();};
 window.addEventListener('hashchange',showLinkedPassage);
 window.addEventListener('resize',updateVisitNotice);
 if(typeof ResizeObserver==='function')new ResizeObserver(()=>{if(linkedVisit)updateVisitNotice();}).observe(visitNotice);
 if(linkedVisit)showLinkedPassage();
})();
