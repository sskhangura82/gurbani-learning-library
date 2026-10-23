/* GLP-001. Reader only. No media playback, capture, provider SDK, or media-session ownership. */
(() => {
  'use strict';
  const G=window.GLP, C=window.GURBANI_CONTENT, $=id=>document.getElementById(id), h=G.escapeHTML;
  const faults=G.validateContent(C);
  if(faults.length){$('reader').textContent='This content package did not pass validation. '+faults.join('; '); return;}
  G.deepFreeze(C);
  let storage; try { storage=window.localStorage; } catch (_) { storage=null; }
  const saved=G.readState(storage);
  let state=saved.state, toastTimer, scrollTimer, pendingImport=null;
  let openPanel='', returnFocus=null, returnScroll=0;
  const dialog=$('explore-dialog');
  const colorQuery=window.matchMedia('(prefers-color-scheme: dark)');
  let quiet=false;
  function applyAppearance(){
    const a=state.appearance;
    const theme=a.theme==='system'?(colorQuery.matches?'amrit':'day'):a.theme;
    document.documentElement.dataset.environment=theme;
    document.documentElement.dataset.halo=String(a.halo);
    document.documentElement.style.colorScheme=theme==='amrit'?'dark':'light';
  }
  colorQuery.addEventListener?.('change',()=>{if(state.appearance.theme==='system')applyAppearance();});
  const descriptions={read:'Original Gurmukhi. A quiet space for paath.',understand:'Original Gurbani, with a simple explanation in both languages.',study:'Read, reflect, and explore the passage in its full teaching context.'};
  const bookmarkIcon='<svg viewBox="0 0 14 16" aria-hidden="true"><path d="M3 2h8v12l-4-3-4 3V2Z"/></svg>';
  function notify(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3300);}
  function save(){const ok=G.saveState(storage,state);const el=$('note-status');if(el)el.textContent=ok?'Saved in this browser. Export a copy for a durable backup.':'Browser storage is unavailable. Export a copy before closing.';return ok;}
  function sources(ids){return '<ul class="source-list">'+[...new Set(ids)].map(id=>{const s=C.sources[id];return s?`<li><a href="${h(s.url)}" target="_blank" rel="noopener noreferrer">${h(s.title)} ↗</a><small>${h(s.kind)}</small></li>`:''}).join('')+'</ul>';}
  function currentAnchor(){
    const els=[...document.querySelectorAll('.verse')];
    const visible=els.find(el=>el.getBoundingClientRect().bottom>125)||els[els.length-1];
    return visible?{id:visible.id,top:visible.getBoundingClientRect().top}:null;
  }
  function captureReading(){const a=currentAnchor();if(a)state.anchor=a.id;return a;}
  function renderReader(anchor){
    applyAppearance();
    document.documentElement.style.setProperty('--gurmukhi-size',state.fontSize+'px');
    document.body.dataset.depth=state.mode;
    document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===state.mode)));
    $('font-less').disabled=state.fontSize<=23;$('font-more').disabled=state.fontSize>=40;
    $('mode-description').textContent=descriptions[state.mode];
    const intro=state.mode==='study'?`<div class="lesson-intro"><span class="draft-badge">SOURCE-CHECKED DRAFT · HUMAN REVIEW PENDING</span><h2>${h(C.lesson.title)}</h2><p>${h(C.lesson.bridge)}</p><p><strong>Carry this question:</strong> ${h(C.lesson.keyQuestion)}</p></div>`:'';
    const lines=C.scripture.lines.map((line,i)=>{
      const e=C.explanations[line.id],marked=state.bookmarks.includes(line.id);
      const simple=state.mode==='read'?'':`<p class="explanation-label">EXPLANATION · DRAFT</p><p class="simple-english">${h(e.english)}</p><p class="simple-punjabi" lang="pa">${h(e.punjabi)}</p>`;
      const study=state.mode==='study'?`<div class="study-section"><p class="pronunciation" aria-label="Approximate pronunciation">${h(e.pronunciation)}</p><h3>${h(e.heading)}</h3><p>${h(e.study)}</p><p class="pa-study" lang="pa">${h(e.studyPunjabi)}</p><div class="word-list">${e.words.map(w=>`<div class="word"><b lang="pa">${h(w[0])}</b>${h(w[1])}</div>`).join('')}</div>${e.interpretationNote?`<p class="interpretation">${h(e.interpretationNote)}</p>`:''}<button class="text-button" data-line-source="${h(line.id)}">Source & explanation status ↗</button></div>`:'';
      return `<article class="verse" id="${h(line.id)}" data-line-index="${i+1}"><div class="verse-top"><span class="verse-number">${String(i+1).padStart(2,'0')} / 06</span><button class="save-line" data-bookmark="${h(line.id)}" aria-pressed="${marked}" aria-label="${marked?'Remove bookmark from':'Bookmark'} line ${i+1}">${bookmarkIcon}<span>${marked?'Saved':'Save'}</span></button></div><p class="gurbani" lang="pa">${h(line.text)}</p>${simple}${study}</article>`;
    }).join('');
    const end=state.mode==='study'?`<section class="application"><p class="eyebrow">REFLECTION · NOT A LITERAL TRANSLATION</p><h2>What could change in daily life?</h2><p>${h(C.lesson.application)}</p><p class="pa-study" lang="pa">${h(C.lesson.applicationPunjabi)}</p><p><strong>Teach it back:</strong> ${h(C.lesson.teachBack)}</p><button class="solid-button" data-open-notes>Write a reflection</button><p class="tiny">${h(C.lesson.pronunciationNote)}</p></section>`:'';
    $('reader').className='reader-'+state.mode;$('reader').innerHTML=intro+lines+end;
    if(anchor){requestAnimationFrame(()=>{const el=document.getElementById(anchor.id);if(el)window.scrollBy(0,el.getBoundingClientRect().top-anchor.top);});}
  }
  function open(title,kicker,content,panel){
    if(!dialog.open){returnFocus=document.activeElement;returnScroll=window.scrollY;captureReading();dialog.showModal();}
    $('dialog-title').textContent=title;$('dialog-kicker').textContent=kicker;$('dialog-content').innerHTML=content;openPanel=panel;dialog.scrollTop=0;
    $('dialog-close').focus({preventScroll:true});
  }
  function close(){dialog.close();}
  dialog.addEventListener('close',()=>{openPanel='';pendingImport=null;window.scrollTo(0,returnScroll);returnFocus?.focus?.({preventScroll:true});save();});
  $('dialog-close').addEventListener('click',close);
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right)close();}});
  function showRelated(theme=null){
    const cards=theme?C.related.filter(c=>c.themes.includes(theme)):C.related;
    const intro=`<div class="coverage-banner">${cards.length} selected ${theme?'connections for '+h(theme):'connections'} · educational drafts. This is not a search of the whole Guru Granth Sahib Ji.</div><p>Follow a teaching into another context. The links below are editorial connections, not scriptural annotations.</p>`;
    const html=cards.map(c=>`<article class="related-card"><span class="card-type">${h(c.type.replaceAll('_',' '))}</span><p class="meta">ANG ${c.ang} · ${h(c.author)}</p><h3>${h(c.title)}</h3><p class="gurbani" lang="pa">${h(c.excerpt)}</p><p>${h(c.english)}</p><p class="simple-punjabi" lang="pa">${h(c.punjabi)}</p><p class="tiny"><strong>Why this connection?</strong> ${h(c.why)}</p><button class="outline-button" data-context="${h(c.id)}">Read the complete context →</button></article>`).join('');
    open(theme?`Explore ${theme==='hukam'?'Hukam':'haumai'}`:'Related teachings','FROM PAURI 2',intro+html,'related');
  }
  function showContext(id){
    const c=C.related.find(x=>x.id===id);if(!c)return;
    open(c.title,`ANG ${c.ang} · ${c.author}`,`<button class="back-link" data-related-back>← All related teachings</button><span class="draft-badge">CONNECTION DRAFT · NOT HUMAN REVIEWED</span><p><strong>Why connected:</strong> ${h(c.why)}</p><p class="simple-punjabi" lang="pa">${h(c.whyPunjabi)}</p><p><strong>What this adds:</strong> ${h(c.adds)}</p><div class="context-lines">${c.context.map(t=>`<p class="gurbani ${t.includes(c.excerpt)?'match':''}" lang="pa">${h(t)}</p>`).join('')}</div><p class="tiny">${h(c.contextScope)}</p><p><strong>Meaning in this context:</strong> ${h(c.english)}</p><p class="simple-punjabi" lang="pa">${h(c.punjabi)}</p><p class="tiny">The detailed line-by-line lesson for this related passage is not yet written. The complete source and commentary remain available below.</p>${sources(c.sourceIds)}<button class="solid-button" data-return-reader>Return to Pauri 2</button>`,'context');
  }
  function showRaag(anand=false){
    const a=anand?C.raagExample:C.scripture.raag;
    const content=anand?`<div class="raag-heading"><p class="eyebrow">EXPLICIT SCRIPTURAL HEADING · ANG 917</p><h3>${h(a.name)}</h3><p class="gurbani" lang="pa">${h(a.heading)}</p></div><p>${h(a.scope)}</p><p>The heading supplies the raag association. It does not, on its own, verify the musical form of any particular recording.</p>${sources(a.sourceIds)}<button class="outline-button" data-raag-japji>Compare with Japji Sahib</button>`:
      `<div class="raag-heading"><p class="eyebrow">JAPJI SAHIB</p><h3>${h(G.raagLabel(a))}</h3><p>No particular raag is assigned to Japji Sahib. This is different from metadata that has not yet been checked.</p></div><p>A reciter’s melody or the time of day does not establish a scriptural raag heading.</p>${sources(a.sourceIds)}<button class="outline-button" data-raag-anand>Explore Anand Sahib · Ramkali →</button>`;
    open(anand?'Anand Sahib · Ramkali':'Raag & meaning','MUSICAL CONTEXT',content+`<div class="review-stack"><strong>Scriptural association</strong><p>The heading or source record belongs to the passage.</p><strong>Musical teaching</strong><p>Raag form, traditions and interpretive accounts need attributed teaching. That expanded lesson is not included yet.</p><strong>A particular performance</strong><p>No specialist-verified performance or recording is bundled. External listening is not inspected or classified by this reader.</p></div>`,'raag');
  }
  function showNotes(){
    const bookmarks=state.bookmarks.map(id=>{const line=C.scripture.lines.find(l=>l.id===id);return `<button class="bookmark-item" data-goto="${h(id)}"><span>PAURI 2 · LINE ${C.scripture.lines.indexOf(line)+1}</span><p class="gurbani" lang="pa">${h(line.text)}</p></button>`;}).join('');
    open('Your saved learning','PRIVATE · THIS BROWSER',`<p>${h(C.lesson.teachBack)}</p><label for="reflection-note" class="note-label">Your reflection or question</label><textarea id="reflection-note" maxlength="12000" placeholder="Write in English or Punjabi…">${h(state.note)}</textarea><div class="note-status" id="note-status">${storage?'Saved in this browser. Export a copy for a durable backup.':'Storage unavailable. Export a copy before closing.'}</div><div class="actions-row"><button class="solid-button" id="export-learning">Export learning</button><label class="outline-button import-label">Import learning<input type="file" id="import-learning" accept="application/json,.json" aria-label="Import a saved learning file"></label></div><div id="import-area"></div><p class="tiny">Export includes your reflection, bookmarks and reading settings. Older learning exports are accepted; retired audio metadata is ignored. Import requires confirmation before replacing this browser’s learning.</p><h3 style="margin-top:30px">Bookmarked lines</h3>${bookmarks||'<p class="empty-state">Use Save beside a line to keep it here.</p>'}`,'notes');
    $('reflection-note').addEventListener('input',e=>{state.note=e.target.value;save();});
    $('export-learning').addEventListener('click',()=>{captureReading();const blob=new Blob([G.exportState(state)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='GLP-001-my-learning.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Learning exported. Keep the file somewhere safe.');});
    $('import-learning').addEventListener('change',async e=>{
      const file=e.target.files[0];e.target.value='';if(!file)return;
      try{if(file.size>100000)throw new Error('That file is too large for a learning export.');pendingImport=G.importState(await file.text());
        $('import-area').innerHTML=`<div class="import-preview"><p>This export contains ${pendingImport.bookmarks.length} bookmarked lines and a ${pendingImport.note.length}-character reflection. It will replace the current saved learning. Export your current copy first to keep both.</p><div class="actions-row"><button id="confirm-import" class="solid-button">Replace saved learning</button><button id="cancel-import" class="outline-button">Cancel</button></div></div>`;
        $('confirm-import').addEventListener('click',()=>{if(!pendingImport)return;state=pendingImport;pendingImport=null;save();renderReader();showNotes();notify('Learning restored. Your external listening is unchanged.');});
        $('cancel-import').addEventListener('click',()=>{pendingImport=null;$('import-area').textContent='Import cancelled. Your learning is unchanged.';});
      }catch(err){pendingImport=null;$('import-area').textContent=err.message;}
    });
  }
  function showSources(){open('Sources & review','TEXT IS NOT INTERPRETATION',`<span class="draft-badge">HUMAN REVIEW PENDING</span><p>${h(C.lesson.reviewNote)}</p><p>The Gurbani, concise meanings, detailed teaching and practical applications are separate layers. Switching reading depth never changes the original text.</p>${sources(['D1','D466','D472','D394','D917','EJ'])}<p class="tiny">Sources consulted 22 October 2026. Links open external websites only when you choose them. No third-party corpus database, modern commentary text, font files, or recordings are distributed with this prototype.</p>`,'sources');}
  function showAbout(){open('A beginning, not a finished library','GLP-001 · VERSION 0.6',`<p>A purpose-built reader for the teaching experience you asked for. This first working build deliberately stays small.</p><div class="review-stack"><strong>Included</strong><p>All six lines of Pauri 2; three reading modes; three selected connections with complete enclosing text; Japji and Anand Sahib raag metadata; bookmarks, reflections and export/import. Day and Amrit Vela visual themes, an optional static halo and explicit quiet-reading mode. No built-in audio player. A seven-place gurdwara directory opens calm source profiles before any external broadcast link.</p><strong>Not included</strong><p>A full-corpus search, complete Nitnem, human-approved lessons, linked-audio playback, synchronized highlighting or cloud sync.</p><strong>Read alongside your own listening</strong><p>Play your preferred recording separately in YouTube, Apple Music or your own file player. Follow the text manually in any reading mode. Pause and resume in that player. This reader does not know its playback position or request microphone access.</p><strong>Future possibility</strong><p>Optional supported-source linking and verified word or line highlighting belong to a later build. No audio connection or automatic following is active here. A separate silent design experiment is not a recitation clock.</p><strong>Privacy</strong><p>No account, analytics, provider key, AI API call or background network request. Reflections stay in browser storage unless you export them. Clearing browser data can remove them.</p><strong>Development status</strong><p>This is a tested browser prototype, not an App Store app. Desktop browser checks do not establish real-device behavior alongside external listening apps. External playback remains subject to its own app and device behavior.</p></div><button class="solid-button" data-open-notes>Open saved learning</button>`,'about');}

  function showGurdwaras(){
    const D=window.GURDWARA_DIRECTORY,P=window.GLP_PLACES;
    if(!D||!P||P.validate(D).length){open('Gurdwara sources unavailable','SOURCE CHECK','<p>The directory did not pass validation. Your reader is unchanged.</p>','gurdwaras');return;}
    const cards=D.places.map(p=>`<button class="place-card" data-place="${h(p.id)}"><span class="place-location">${h(p.location)}</span><strong>${h(p.name)}</strong><span>Enter quietly <span aria-hidden="true">→</span></span></button>`).join('');
    open('A quiet doorway','GURDWARAS · ਗੁਰਦੁਆਰੇ',`<div class="visit-intro"><p class="visit-lead">Choose a place.<br>Take a moment.<br>Join when you are ready.</p><p>Nothing plays here automatically. Your Japji reading place is kept.</p></div><div class="places-grid">${cards}</div><p class="tiny">Seven selected places, not a complete directory. Source pages checked 22 October 2026. Broadcasts are not monitored by this reader.</p>`,'gurdwaras');
  }
  function showPlace(id){
    const D=window.GURDWARA_DIRECTORY,P=window.GLP_PLACES,p=D.places.find(p=>p.id===id);if(!p)return;
    const links=p.links.map(l=>`<a class="visit-link" href="${h(P.safeURL(l.url))}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer" data-broadcast-link><strong>${h(l.label)} <span aria-hidden="true">↗</span></strong><small>${h(l.authority)} · ${h(new URL(l.url).hostname)}</small></a>`).join('');
    const sourceLinks=p.sources.map(u=>`<li><a href="${h(P.safeURL(u))}" target="_blank" rel="noopener noreferrer">${h(new URL(u).hostname)} ↗</a></li>`).join('');
    open(p.name,'A MOMENT BEFORE YOU JOIN',`<button class="back-link" data-places-back>← Gurdwaras</button><section class="visit-arrival">${p.namePunjabi?`<p class="place-punjabi" lang="pa">${h(p.namePunjabi)}</p>`:''}<p class="place-location">${h(p.location)}</p><p class="place-clock">There: ${h(P.localClock(p))}<br><small>Local time from your device clock · not a programme schedule</small></p><p class="visit-lead">Set aside the rush.</p><p>${h(p.description)}</p></section><div class="visit-links">${links}</div><p class="visit-disclosure">These buttons open the broadcaster or radio service outside this reader. Its own playback, privacy, advertising and background-listening rules apply. A source may show a replay or no programme. Live status has not been checked.</p><details class="visit-provenance"><summary>Source & visit information</summary><ul>${sourceLinks}</ul><p>Source references checked ${h(p.sourceCheckedOn)}. No audio stream was tested, copied or embedded. This is a digital introduction, not a substitute for being at the gurdwara. Photographs and expanded history are not bundled in this build.</p></details><button class="outline-button" data-return-reader>Return to my reading</button>`,'place');
  }
  $('gurdwaras-button').addEventListener('click',showGurdwaras);
  $('dialog-content').addEventListener('click',event=>{
    const p=event.target.closest('[data-place]');if(p)showPlace(p.dataset.place);
    if(event.target.closest('[data-places-back]'))showGurdwaras();
    // Persist only the reading state already captured when the panel opened.
    if(event.target.closest('[data-broadcast-link]'))save();
  });

  function setQuiet(enabled){
    const anchor=captureReading();quiet=enabled;
    document.body.classList.toggle('quiet-reading',enabled);
    document.querySelectorAll('.sidebar,.topbar,.page-heading,.context-toolbar,.study-rail,.page-footer').forEach(el=>{el.inert=enabled;});
    $('exit-focus').hidden=!enabled;
    if(anchor)requestAnimationFrame(()=>{const el=document.getElementById(anchor.id);if(el)window.scrollBy(0,el.getBoundingClientRect().top-anchor.top);});
    if(enabled)$('exit-focus').focus({preventScroll:true});
    else $('appearance-button').focus({preventScroll:true});
  }
  function showAppearance(){
    open('Make room for the words','READING APPEARANCE',`
      <p>Choose what is easiest on your eyes. These are visual environments, not rules about when to read.</p>
      <fieldset class="appearance-group"><legend>Environment</legend><div class="theme-options">
      ${[['day','Day','Warm paper and deep ink'],['amrit','Amrit Vela','Quiet indigo and warm lettering'],['system','Device setting','Follow your device’s light or dark appearance']].map(([id,title,desc])=>`<button type="button" data-appearance-theme="${id}" aria-pressed="${state.appearance.theme===id}"><strong>${title}</strong><span>${desc}</span></button>`).join('')}
      </div></fieldset>
      <label class="setting-row"><input type="checkbox" id="halo-setting" ${state.appearance.halo?'checked':''}><span><strong>Soft letter light</strong><small>Optional static halo. No breathing, flashing or moving text.</small></span></label>
      <fieldset class="appearance-group"><legend>Quiet reading</legend><p>Hide navigation and the teaching sidebar. The reading-depth buttons and a visible exit remain available. Your current explanation stays open.</p><button class="solid-button" id="quiet-setting">${quiet?'Leave quiet reading':'Enter quiet reading'}</button></fieldset>
      <div class="review-stack"><strong>Text comes first</strong><p>Lines wrap at word boundaries when needed. The original words, vowel signs and punctuation are unchanged. Use A− / A+ or your browser’s zoom.</p><strong>Larivaar</strong><p>Planned as a separately checked reading display. This build does not remove word spaces or claim a verified larivaar transcription.</p><strong>No sound here</strong><p>Listen in your own app and follow manually. Appearance choices do not connect to or control another app’s audio.</p></div>`,'appearance');
    document.querySelectorAll('[data-appearance-theme]').forEach(button=>button.addEventListener('click',()=>{
      state.appearance.theme=button.dataset.appearanceTheme;applyAppearance();save();
      document.querySelectorAll('[data-appearance-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.appearanceTheme===state.appearance.theme)));
    }));
    $('halo-setting').addEventListener('change',event=>{state.appearance.halo=event.target.checked;applyAppearance();save();});
    $('quiet-setting').addEventListener('click',()=>{close();requestAnimationFrame(()=>setQuiet(!quiet));});
  }
  $('appearance-button').addEventListener('click',showAppearance);
  $('exit-focus').addEventListener('click',()=>setQuiet(false));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&quiet&&!dialog.open){event.preventDefault();setQuiet(false);}});

  function changeMode(mode){const anchor=captureReading();state=G.setMode(state,mode);renderReader(anchor);save();}
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>changeMode(b.dataset.mode)));
  function changeSize(delta){const anchor=captureReading();state.fontSize=Math.min(40,Math.max(23,state.fontSize+delta));renderReader(anchor);save();}
  $('font-less').addEventListener('click',()=>changeSize(-2));$('font-more').addEventListener('click',()=>changeSize(2));
  $('reader').addEventListener('click',e=>{
    const b=e.target.closest('[data-bookmark]');if(b){state=G.toggleBookmark(state,b.dataset.bookmark);const marked=state.bookmarks.includes(b.dataset.bookmark);b.setAttribute('aria-pressed',String(marked));b.setAttribute('aria-label',(marked?'Remove bookmark from':'Bookmark')+' line '+b.closest('.verse').dataset.lineIndex);b.innerHTML=bookmarkIcon+'<span>'+(marked?'Saved':'Save')+'</span>';save();notify(marked?'Line saved to your learning.':'Bookmark removed.');}
    if(e.target.closest('[data-line-source]'))showSources();if(e.target.closest('[data-open-notes]'))showNotes();
  });
  $('dialog-content').addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.context)showContext(b.dataset.context);
    if(b.hasAttribute('data-related-back'))showRelated();
    if(b.hasAttribute('data-return-reader'))close();
    if(b.hasAttribute('data-raag-anand'))showRaag(true);
    if(b.hasAttribute('data-raag-japji'))showRaag(false);
    if(b.hasAttribute('data-open-notes'))showNotes();
    if(b.dataset.goto){const id=b.dataset.goto;close();requestAnimationFrame(()=>{document.getElementById(id)?.scrollIntoView({block:'start'});state.anchor=id;save();});}
  });
  const map={'related-button':()=>showRelated(),'raag-button':()=>showRaag(),'anand-link':()=>showRaag(true),'saved-link':showNotes,'notes-button':showNotes,'reflect-button':showNotes,'sources-button':showSources,'about-link':showAbout,'coverage-button':showAbout};
  Object.entries(map).forEach(([id,fn])=>$(id).addEventListener('click',fn));
  document.querySelectorAll('[data-theme]').forEach(b=>b.addEventListener('click',()=>showRelated(b.dataset.theme)));
  function home(e){e.preventDefault();window.scrollTo(0,0);state.anchor=C.scripture.lines[0].id;save();}
  $('home-link').addEventListener('click',home);$('current-lesson').addEventListener('click',home);
  window.addEventListener('scroll',()=>{if(dialog.open)return;clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{captureReading();save();},250);},{passive:true});
  window.addEventListener('pagehide',()=>{captureReading();save();});
  renderReader();
  if(state.anchor!==C.scripture.lines[0].id)requestAnimationFrame(()=>document.getElementById(state.anchor)?.scrollIntoView({block:'start'}));
  save(); // Migrate v1/v2 learning, retain reading data, ignore retired media fields.
  if(!saved.persisted)notify('Browser storage is unavailable or damaged. Export learning before closing.');
})();
