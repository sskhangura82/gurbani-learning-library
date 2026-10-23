/* GLP-001 0.8: one persistent scripture document; depth never owns the guide clock. */
(() => {
'use strict';
const $=id=>document.getElementById(id),C=window.GLPContinuousCore,data=window.GLP_FULL_JAPJI,old=window.GURBANI_CONTENT;
if(!C||!data||data.units.length!==42){$('continuous-reader').textContent='The scripture package could not be verified.';return;}
const units=data.units,model=C.flatten(units),lines=model.lines,KEY='glp001.continuous.v2',LEGACY='glp001.fullJapji.v1';
if(lines.length!==385){$('continuous-reader').textContent='The scripture package has an unexpected line count.';return;}
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=u=>{try{const v=new URL(u);return v.protocol==='https:'?v.href:'#';}catch(_){return '#';}};
const a=(u,label)=>'<a href="'+h(safeUrl(u))+'" target="_blank" rel="noopener noreferrer">'+h(label)+' ↗</a>';
let raw=null,storageOK=true;try{raw=JSON.parse(localStorage.getItem(KEY)||localStorage.getItem(LEGACY)||'null');}catch(_){storageOK=false;}
let state=C.normalise(raw,model,units),playing=false,following=true,started=false,finished=false,raf=0,deadline=0,persistTimer=0;
let afterModalClose=null,modalReturn=null,dialogFocus=null,paintedIndex=-1,paintedTokens=[],scrollTimer=0,importCandidate=null,programmaticUntil=0;
started=state.hasGuided;
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),explanations=new Map();
const p2=units.find(u=>u.id==='pauri02');
p2.lines.forEach((line,i)=>{const prior=old?.scripture?.lines?.[i];if(prior?.text===line.text&&old.explanations[prior.id])explanations.set(line.id,old.explanations[prior.id]);});
function status(text){$('status').textContent=text;}
function persist(now=false){
 const save=()=>{persistTimer=0;try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){storageOK=false;}};
 if(now){clearTimeout(persistTimer);save();}else if(!persistTimer)persistTimer=setTimeout(save,450);
}
function sources(ids){return '<div class="source-links">'+(ids||[]).map(id=>old.sources[id]).filter(Boolean).map(s=>a(s.url,s.title)).join('')+'</div>';}
function deepMarkup(e){return '<div class="deep-study"><p class="draft-label">EXPLANATION · EDUCATIONAL DRAFT</p><p class="pronunciation">'+h(e.pronunciation)+'</p><h3>'+h(e.heading)+'</h3><div class="vocabulary">'+(e.words||[]).map(w=>'<div><b lang="pa">'+h(w[0])+'</b>'+h(w[1])+'</div>').join('')+'</div><p>'+h(e.study)+'</p><p class="punjabi" lang="pa">'+h(e.studyPunjabi)+'</p>'+(e.interpretationNote?'<p class="interpretation">'+h(e.interpretationNote)+'</p>':'')+sources(e.sourceIds)+'</div>';}
function tokensMarkup(line){let i=0;return line.parts.map(p=>/^\s+$/u.test(p)?h(p):'<span class="g-word" data-token="'+i+++'">'+h(p)+'</span>').join('');}
function lessonIntro(){const l=old.lesson;return '<div class="study-intro"><p class="draft-label">FULL LEARNING · DRAFT</p><h3>'+h(l.title)+'</h3><p>'+h(l.bridge)+'</p><p><strong>'+h(l.keyQuestion)+'</strong></p></div>';}
function lessonReflection(){const l=old.lesson;return '<div class="study-reflection"><h3>Bring the teaching into life</h3><p>'+h(l.application)+'</p><p class="punjabi-text" lang="pa">'+h(l.applicationPunjabi)+'</p><p><strong>Teach-back:</strong> '+h(l.teachBack)+'</p><div class="line-actions"><button data-action="related">Related teachings</button><button data-action="note" data-index="10">Keep a reflection</button></div><p class="draft-label">'+h(l.reviewNote)+'</p></div>';}
// Render every occurrence once. Mode changes only change visibility around it.
$('continuous-reader').innerHTML=units.map((u,ui)=>{
 const hasTeaching=u.id==='pauri02';
 const body=u.lines.map((l,li)=>{const i=model.starts[ui]+li,line=lines[i],e=explanations.get(l.id);
 return '<article class="scripture-line" id="line-'+i+'" data-index="'+i+'" data-occurrence="'+h(l.id)+'"><p class="tuk" lang="pa" data-text-sha256="'+h(l.sha256)+'">'+tokensMarkup(line)+'</p>'+(e?'<button type="button" class="simple-meaning" data-action="meaning" data-index="'+i+'" aria-label="Read more about '+h(u.title)+' line '+(li+1)+'"><span class="english">'+h(e.english)+'</span><span class="punjabi" lang="pa">'+h(e.punjabi)+'</span><span class="expand-hint">Draft meaning · tap to explore</span></button>'+deepMarkup(e):'')+'</article>';}).join('');
 return '<section class="passage" id="section-'+h(u.id)+'" data-unit="'+ui+'" aria-labelledby="caption-'+h(u.id)+'"><div class="section-caption"><h2 id="caption-'+h(u.id)+'">'+h(u.title)+'</h2></div>'+(hasTeaching?lessonIntro():'')+body+(!hasTeaching&&u.id!=='title'?'<p class="pending-meaning">Simple English and Punjabi meanings for this passage are not yet written.</p><p class="pending-study">The detailed lesson for this passage is not yet written. Original Gurbani continues below.</p>':'')+(hasTeaching?lessonReflection():'')+'</section>';
}).join('');
const rows=[...document.querySelectorAll('.scripture-line')],tuks=rows.map(r=>r.querySelector('.tuk')),wordNodes=tuks.map(t=>[...t.querySelectorAll('.g-word')]);
function updateBarHeight(){document.documentElement.style.setProperty('--bar-height',Math.ceil(document.querySelector('.reading-bar').getBoundingClientRect().height+16)+'px');}
function anchor(){
 const top=document.querySelector('.reading-bar').getBoundingClientRect().bottom+14;
 let lo=0,hi=rows.length-1;
 while(lo<hi){const mid=(lo+hi)>>1;if(rows[mid].getBoundingClientRect().bottom<=top)lo=mid+1;else hi=mid;}
 return {id:lines[lo].id,offset:rows[lo].getBoundingClientRect().top-top};
}
function restoreAnchor(point){const idx=model.byId.get(point.id);if(idx===undefined)return;programmaticUntil=performance.now()+150;for(let pass=0;pass<2;pass++){const top=document.querySelector('.reading-bar').getBoundingClientRect().bottom+14;const delta=rows[idx].getBoundingClientRect().top-top-point.offset;window.scrollTo({top:Math.max(0,scrollY+delta),behavior:'instant'});}}
function rememberVisible(){state.read=anchor();updateDock();persist();}
function applyAppearance(){document.documentElement.dataset.theme=state.theme;document.documentElement.dataset.radiance=String(state.radiance);document.documentElement.style.setProperty('--gurmukhi-size',state.size+'px');}
function applyMode(){document.body.dataset.depth=state.mode;document.querySelectorAll('.modes [data-depth]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.depth===state.mode)));$('mode-description').textContent={read:'Gurmukhi only. One continuous reading.',understand:'Short meanings below the words. Tap for more.',study:'Full learning: words, meaning, context and reflection.'}[state.mode];$('coverage-note').hidden=state.mode==='read';updateBarHeight();}
function updateDock(){
 const readIndex=model.byId.get(state.read.id)??state.guide.index;const current=(playing&&following)?state.guide.index:readIndex;
 $('dock-position').textContent=lines[current].unitTitle+' · line '+(lines[current].lineIndex+1);
 $('play').textContent=playing?'❚❚ Pause scroll':finished?'↺ Replay scroll':started?'▶ Resume scroll':'▶ Play scroll';
 $('pace-label').textContent=state.pace;$('return-follow').hidden=following||!started;
 const saved=state.bookmarks.includes(lines[readIndex].id);$('save-place').setAttribute('aria-pressed',String(saved));$('save-place').textContent=saved?'★ Saved':'☆ Save';
 $('guide-caption').textContent=finished?'Reading guide complete.':playing?(following?'Auto-scroll · visual pace, not audio-synced.':'Guide continues · scrolling held while you explore.'):'Silent visual guide · listen in your preferred app.';
}
function paint(){
 if(paintedIndex>=0&&paintedIndex!==state.guide.index){tuks[paintedIndex].removeAttribute('data-current');}
 paintedTokens.forEach(n=>n.removeAttribute('data-active'));
 const i=state.guide.index;tuks[i].dataset.current='true';paintedIndex=i;
 paintedTokens=state.emphasis==='line'?wordNodes[i]:[wordNodes[i][state.guide.token]];
 paintedTokens.forEach(n=>{if(n)n.dataset.active='true';});updateDock();
}
function focusGuide(force=false){
 if(!following||$('reader-dialog').open||(!playing&&!force))return;
 const rect=rows[state.guide.index].getBoundingClientRect(),top=document.querySelector('.reading-bar').getBoundingClientRect().bottom+12;
 const bottom=$('play').closest('.reading-dock').getBoundingClientRect().top-16;
 const item=state.emphasis==='word'?wordNodes[state.guide.index][state.guide.token]:tuks[state.guide.index];const ir=item.getBoundingClientRect();
 if(force||ir.top<top||ir.bottom>bottom){const target=top+Math.max(5,(bottom-top)*.28);programmaticUntil=performance.now()+600;window.scrollTo({top:Math.max(0,scrollY+ir.top-target),behavior:reduced.matches?'instant':'smooth'});}
}
function detach(){if(playing||started){following=false;window.scrollTo({top:scrollY,behavior:'instant'});updateDock();}}
function pause(reason){playing=false;cancelAnimationFrame(raf);raf=0;deadline=0;updateDock();persist();if(reason)status(reason);}
function step(){const next=C.advance(state.guide,lines);state.guide={index:next.index,token:next.token};paint();persist();if(next.finished){finished=true;pause('Reading guide complete.');return false;}if(next.newLine)focusGuide();else if(following)focusGuide();return next.newLine?620:0;}
function frame(now){if(!playing)return;if(!deadline)deadline=now+60000/state.pace;if(now>=deadline){const delay=step();if(!playing)return;deadline=now+60000/state.pace+(delay||0);}raf=requestAnimationFrame(frame);}
function begin(){
 if(finished){state.guide={index:0,token:0};finished=false;following=true;}
 else if(!started){const visible=anchor();state.guide={index:model.byId.get(visible.id)??0,token:0};following=true;}
 state.hasGuided=true;started=true;following=true;playing=true;deadline=0;paint();focusGuide(true);cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);persist();status('Silent reading guide started.');
}
function togglePlay(){playing?pause('Reading guide paused.'):begin();}
function startHere(index){state.guide={index,token:0};following=true;finished=false;started=true;begin();}
function goTo(index){detach();const point={id:lines[index].id,offset:0};state.read=point;restoreAnchor(point);updateDock();persist();}
function changeMode(mode,preferredAnchor){if(!['read','understand','study'].includes(mode))return;const point=preferredAnchor||anchor();if(mode==='study'&&playing)pause('Study mode: the visual guide is paused. External audio is unchanged.');state.mode=mode;applyMode();restoreAnchor(point);state.read=point;updateDock();persist();}
function openDialog(title,body,kicker='EXPLORE'){
 const d=$('reader-dialog');if(!d.open){modalReturn=anchor();dialogFocus=document.activeElement;detach();}
 $('dialog-title').textContent=title;$('dialog-kicker').textContent=kicker;$('dialog-body').innerHTML=body;
 if(!d.open)d.showModal();else d.scrollTop=0;
}
function closeDialog(after){afterModalClose=typeof after==='function'?after:null;if($('reader-dialog').open)$('reader-dialog').close();else{const done=afterModalClose;afterModalClose=null;if(done)done();}}
$('reader-dialog').addEventListener('close',()=>{if(modalReturn){restoreAnchor(modalReturn);state.read=modalReturn;}if(dialogFocus?.isConnected)dialogFocus.focus({preventScroll:true});modalReturn=null;dialogFocus=null;rememberVisible();const done=afterModalClose;afterModalClose=null;if(done)done();});
$('dialog-close').addEventListener('click',closeDialog);
function showMeaning(index){const line=lines[index],e=explanations.get(line.id);if(!e)return;
 openDialog(line.unitTitle+' · line '+(line.lineIndex+1),'<p class="excerpt" lang="pa">'+h(line.text)+'</p><div class="simple-dialog"><p>'+h(e.english)+'</p><p class="punjabi-text" lang="pa">'+h(e.punjabi)+'</p></div>'+deepMarkup(e)+'<div class="line-actions"><button data-action="study-at" data-index="'+index+'" class="primary">Open full learning here</button><button data-action="pause" type="button">Pause visual guide</button><button data-action="note" data-index="'+index+'">Reflection</button></div><p class="plain-note">The guide may continue while this explanation is open, but it will not move your reading. Close this panel to return to the same place.</p>','MEANING → DEEPER UNDERSTANDING');
}
function settings(){openDialog('Reading settings','<label class="setting-row">Appearance<select id="set-theme"><option value="day">Day</option><option value="amrit">Amrit Vela</option></select></label><label class="setting-row">Text size<input id="set-size" type="range" min="24" max="42" step="2" value="'+state.size+'"></label><label class="setting-row">Letter radiance<input id="set-radiance" type="checkbox" '+(state.radiance?'checked':'')+'></label><label class="setting-row">Visual pace<select id="set-pace">'+[50,70,100,140].map(v=>'<option value="'+v+'">'+v+' words / min</option>').join('')+'</select></label><label class="setting-row">Emphasis<select id="set-emphasis"><option value="word">Current word</option><option value="line">Current line</option></select></label><p class="plain-note">Play scroll advances the text at your chosen visual pace. It does not play sound or listen to another app, so adjust it yourself alongside your recording. The visual guide pauses when this page is hidden.</p><p class="plain-note">Reduced motion on your device removes animated scrolling and glow effects.</p>','READING · NOT AUDIO');$('set-theme').value=state.theme;$('set-pace').value=state.pace;$('set-emphasis').value=state.emphasis;}
function jumps(){openDialog('Jump within Japji Sahib','<p class="plain-note">These are bookmarks within one continuous page. Jumping never removes the surrounding Gurbani or resets a running guide.</p><div class="menu-list">'+units.map((u,i)=>'<button data-action="jump" data-index="'+model.starts[i]+'">'+h(u.title)+'<small>Ang '+h(u.angs.join('–'))+'</small></button>').join('')+'</div>','CONTENTS');}
function explore(){openDialog('Explore without losing your place','<div class="menu-list"><button data-action="related">Related teachings<small>Three contextual connections from the Pauri 2 lesson</small></button><button data-action="raag">Raag &amp; meaning<small>Musical context, separate from your reading depth</small></button><button data-action="gurdwaras">Gurdwaras<small>Quiet entrances to external broadcasts</small></button><button data-action="learning">Saved places &amp; reflections<small>Stored in this browser, exportable</small></button><button data-action="coverage">Sources &amp; coverage<small>What is written, and what still needs review</small></button></div>');}
function related(){openDialog('Related teachings','<p class="plain-note">These three links extend the Pauri 2 lesson. They are selected, source-checked drafts—not an exhaustive topic search or reviewed scholarship.</p>'+old.related.map((r,i)=>'<section class="connection-card"><p class="draft-label">'+h(r.author)+' · Ang '+r.ang+'</p><h3>'+h(r.title)+'</h3><p class="context-gurmukhi" lang="pa">'+h(r.excerpt)+'</p><p>'+h(r.english)+'</p><p class="punjabi-text" lang="pa">'+h(r.punjabi)+'</p><p><strong>Why connected:</strong> '+h(r.why)+'</p><button data-action="context" data-index="'+i+'">Read the complete context</button></section>').join(''),'CONNECTED TEACHING');}
function context(i){const r=old.related[i];if(!r)return;openDialog(r.title,'<p>'+h(r.author)+' · Ang '+r.ang+'</p>'+r.context.map(t=>'<p class="context-gurmukhi" lang="pa">'+h(t)+'</p>').join('')+'<p>'+h(r.adds)+'</p>'+sources(r.sourceIds)+'<button data-action="related">Back to related teachings</button>','ENCLOSING PASSAGE · DRAFT EXPLANATION');}
function raag(){const x=old.raagExample;openDialog('Raag & meaning','<h3>Japji Sahib</h3><p>No particular raag heading is assigned to Japji Sahib. A melody used by a performer is not a scriptural raag assignment.</p>'+sources(old.scripture.raag.sourceIds)+'<h3>'+h(x.title)+' · '+h(x.name)+'</h3><p class="context-gurmukhi" lang="pa">'+h(x.heading)+'</p><p>Ang '+x.ang+' · '+h(x.scope)+'</p>'+sources(x.sourceIds)+'<p class="plain-note">Musical lessons and performance verification are separate work. No recording or musical classification is inferred here.</p>','MUSICAL CONTEXT');}
function gurdwaras(){const p=window.GURDWARA_DIRECTORY?.places||[];openDialog('Visit a gurdwara broadcast','<p class="plain-note">Choose a place, then deliberately open its broadcaster. Nothing plays automatically. Stream availability is not checked here.</p><div class="menu-list">'+p.map((x,i)=>'<button data-action="place" data-index="'+i+'">'+h(x.name)+'<small>'+h(x.location)+'</small></button>').join('')+'</div>','A QUIET ARRIVAL');}
function place(i){const p=window.GURDWARA_DIRECTORY?.places?.[i];if(!p)return;let time='';try{time=new Intl.DateTimeFormat('en',{timeStyle:'short',timeZone:p.timeZone}).format(new Date());}catch(_){}
 openDialog(p.name,'<p class="eyebrow">'+h(p.location)+'</p>'+(p.namePunjabi?'<p class="context-gurmukhi" lang="pa">'+h(p.namePunjabi)+'</p>':'')+'<p>'+h(p.description)+'</p><p class="plain-note">Local time when opened: '+h(time)+'. This is not a programme schedule. Live availability is unverified.</p><div class="source-links">'+p.links.map(l=>a(l.url,l.label)+'<p class="plain-note">'+h(l.authority)+'</p>').join('')+'</div><p class="plain-note">Opening a link leaves for the broadcaster. Your reading position is retained here.</p><button data-action="gurdwaras">Choose another gurdwara</button>','ARRIVE · CHOOSE · LISTEN');}
function coverage(){openDialog('Sources & teaching coverage','<p><strong>Read:</strong> all 385 supplied Gurmukhi occurrences, including 38 pauris, remain in one page.</p><p><strong>Understand and Study:</strong> the six lines of Pauri 2 have existing bilingual and deeper educational drafts. Other explanations are not yet written. This interface revision does not claim a completed teaching edition.</p><p>Original text, existing explanations, related contexts and their source records are preserved unchanged. Source matching is not qualified human approval.</p><p>Play scroll is a silent visual guide, not a recitation or audio synchronization. The reading page stays still when you pause or explore independently.</p><p class="plain-note">Browser-only learning is not a family cloud account. People using the same browser may share its saved state. Export learning for backup.</p>'+a('https://github.com/opengranth/open-granth','Full-text corpus provenance')+sources(['D1','RI'])+'<p>'+a('https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame','Browser animation timing')+'</p>','VERSION 0.8-CONTINUOUS1');}
function note(index){const l=lines[index];openDialog('Your reflection','<p class="excerpt" lang="pa">'+h(l.text)+'</p><label for="reflection">'+h(l.unitTitle)+' · line '+(l.lineIndex+1)+'</label><textarea class="learning-field" id="reflection" maxlength="6000" data-line-id="'+h(l.id)+'">'+h(state.notes[l.id]||'')+'</textarea><p id="note-status" class="plain-note">Stored only in this browser. '+(storageOK?'':'Storage unavailable: export before closing.')+'</p><button data-action="export">Export learning</button>','PERSONAL NOTES');}
function learning(){const saved=state.bookmarks;openDialog('Saved learning','<p class="plain-note">Saved in this browser. Separate devices do not synchronize automatically.</p><div class="menu-list">'+saved.map(id=>{const i=model.byId.get(id),l=lines[i];return '<button data-action="jump" data-index="'+i+'">'+h(l.unitTitle)+' · line '+(l.lineIndex+1)+'<small lang="pa">'+h(l.text)+'</small></button>';}).join('')+(saved.length?'':'<p>No saved lines yet.</p>')+'</div><div class="line-actions"><button data-action="note" data-index="'+(model.byId.get(state.read.id)||0)+'">Write a reflection here</button><button data-action="export">Export learning</button></div><label class="file-import">Import this reader’s learning file<input type="file" id="import-file" accept="application/json,.json"></label><div id="import-preview"></div><p class="plain-note">Your previous Pauri 2 notebook has not been changed. It is still available in the original detailed lesson.</p><a href="pauri-2-lesson.html">Original Pauri 2 notebook ↗</a>','BOOKMARKS · NOTES · BACKUP');}
function exportLearning(){const blob=new Blob([C.exportState(state)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='Gurbani-learning.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),3000);status('Learning export prepared.');}
function action(kind,index){switch(kind){case'meaning':showMeaning(index);break;case'study-at':closeDialog(()=>{changeMode('study',{id:lines[index].id,offset:0});goTo(index);});break;case'pause':pause('Visual guide paused. External audio is unchanged.');break;case'note':note(index);break;case'jump':closeDialog(()=>goTo(index));break;case'related':related();break;case'context':context(index);break;case'raag':raag();break;case'gurdwaras':gurdwaras();break;case'place':place(index);break;case'coverage':coverage();break;case'learning':learning();break;case'export':exportLearning();break;case'apply-import':if(importCandidate){pause();try{localStorage.setItem(KEY+'.pre-import',JSON.stringify(state));}catch(_){}const incoming=importCandidate;importCandidate=null;closeDialog(()=>{state=incoming;started=state.hasGuided;finished=false;applyAppearance();applyMode();restoreAnchor(state.read);paint();persist(true);status('Learning imported.');});}break;}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const idx=Number(b.dataset.index);action(b.dataset.action,Number.isInteger(idx)?idx:0);});
document.querySelectorAll('.modes [data-depth]').forEach(b=>b.addEventListener('click',()=>changeMode(b.dataset.depth)));
$('play').addEventListener('click',togglePlay);$('start-here').addEventListener('click',()=>{const point=anchor();startHere(model.byId.get(point.id)??0);});
$('return-follow').addEventListener('click',()=>{following=true;paint();focusGuide(true);});
$('save-place').addEventListener('click',()=>{const id=anchor().id;state.read=anchor();state.bookmarks=state.bookmarks.includes(id)?state.bookmarks.filter(x=>x!==id):[...state.bookmarks,id];updateDock();persist();});
$('settings-open').addEventListener('click',settings);$('pace-open').addEventListener('click',settings);$('jump-open').addEventListener('click',jumps);$('explore').addEventListener('click',explore);$('coverage-open').addEventListener('click',coverage);$('back-start').addEventListener('click',()=>goTo(0));
$('dialog-body').addEventListener('input',e=>{if(e.target.id==='reflection'){const id=e.target.dataset.lineId;if(model.byId.has(id)){state.notes[id]=e.target.value.slice(0,6000);persist(true);$('note-status').textContent=storageOK?'Saved in this browser.':'Storage unavailable: export your learning before leaving.';}}if(e.target.id==='set-size'){state.size=Math.max(24,Math.min(42,Number(e.target.value)));applyAppearance();persist();}});
$('dialog-body').addEventListener('change',async e=>{
 const id=e.target.id;if(id==='set-theme'){state.theme=['day','amrit'].includes(e.target.value)?e.target.value:'day';applyAppearance();}
 if(id==='set-radiance'){state.radiance=e.target.checked;applyAppearance();}
 if(id==='set-pace'){const oldPace=state.pace;state.pace=Number(e.target.value);if(deadline)deadline=performance.now()+Math.max(0,deadline-performance.now())*oldPace/state.pace;}
 if(id==='set-emphasis'){state.emphasis=e.target.value;paint();}persist();
 if(id==='import-file'){try{const f=e.target.files?.[0];if(!f)return;if(f.size>2500000)throw Error('Learning file is too large.');importCandidate=C.parseImport(await f.text(),model,units);$('import-preview').innerHTML='<p>Import '+importCandidate.bookmarks.length+' saved places and '+Object.keys(importCandidate.notes).length+' reflections?</p><button data-action="apply-import">Replace this reader’s saved learning</button>';}catch(err){importCandidate=null;$('import-preview').textContent=err.message;}}
});
window.addEventListener('wheel',()=>{detach();},{passive:true});
let touchY=null;document.addEventListener('touchstart',e=>{touchY=e.touches[0]?.clientY??null;},{passive:true});document.addEventListener('touchmove',e=>{if(!$('reader-dialog').open&&touchY!==null&&Math.abs((e.touches[0]?.clientY??touchY)-touchY)>5)detach();},{passive:true});
document.addEventListener('keydown',e=>{if(!$('reader-dialog').open&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'')&&['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key))detach();});
window.addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{if(!$('reader-dialog').open)rememberVisible();},120);},{passive:true});
window.addEventListener('resize',()=>{updateBarHeight();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing)pause('Visual guide paused while the reading page is hidden.');});
window.addEventListener('pagehide',()=>{if(!$('reader-dialog').open)state.read=anchor();persist(true);cancelAnimationFrame(raf);});
applyAppearance();applyMode();paint();requestAnimationFrame(()=>{if(raw)restoreAnchor(state.read);rememberVisible();});
window.GLP_CONTINUOUS_DEBUG=Object.freeze({version:'0.8-continuous1',lineCount:lines.length,units:units.length,explanationCount:explanations.size,getState:()=>JSON.parse(JSON.stringify(state)),isPlaying:()=>playing,isFollowing:()=>following});
})();
