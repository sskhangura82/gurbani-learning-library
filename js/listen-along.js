/* GLP-001 Listen-along page. Follows a YouTube recitation with the library's own Gurbani text.
   Uses only YouTube's documented IFrame Player API (privacy-enhanced host). Never downloads,
   records or listens to audio. Timing marks stay in this browser unless the reader shares them. */
{
'use strict';
const C=window.GLPListenAlongCore;
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const STORE='glp.listenAlong.v1';
const store={
 read(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{};}catch{return {};}},
 write(v){try{localStorage.setItem(STORE,JSON.stringify(v));return true;}catch{return false;}}
};
const S={
 baniId:null,comp:null,model:null,fingerprint:null,timeline:null,videoId:null,start:0,
 player:null,ready:false,playing:false,rate:1,duration:0,mode:'follow',
 current:-1,word:-1,shownState:'',statusText:'',els:[],userScrollAt:0,source:'',
 lastTime:0,sampleAt:0,raf:0,warnedSave:false,
 settings:{style:'paath',size:30,offset:0,words:true,night:true}
};

/* ---------- Scripture: the library's own files, verified before display ---------- */
const comps={};
function loadScript(src){return new Promise((ok,fail)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>fail(Error('Could not load '+src));document.head.append(s);});}
async function nitnem(id){const r=await fetch('nitnem/data/'+id+'.json');if(!r.ok)throw Error('Could not load '+id);return C.normalizeNitnem(await r.json());}
async function getComp(id){
 if(comps[id])return comps[id];
 let c;
 if(id==='japji')c=C.normalizeJapji(window.GLP_FULL_JAPJI);
 else if(id==='sukhmani'){if(!window.GLP_SUKHMANI)await loadScript('js/sukhmani-data.js');c=C.normalizeSukhmani(window.GLP_SUKHMANI);}
 else if(id==='morning'){const parts=[await getComp('japji')];for(const p of ['jaap','savaiye','chaupai','anand'])parts.push(await getComp(p));c=C.compose('morning','Morning Nitnem','ਨਿਤਨੇਮ',parts);}
 else if(['jaap','savaiye','chaupai','anand','rehras','sohila'].includes(id))c=await nitnem(id);
 else throw Error('Unknown bani');
 return comps[id]=c;
}
async function sha(text){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');}
async function verify(model){
 if(!(window.crypto&&crypto.subtle))return {checked:false,bad:0};
 let bad=0;for(const it of model.items)if(await sha(it.text)!==it.sha256)bad++;
 return {checked:true,bad,fingerprint:(await sha(model.fingerprintSource)).slice(0,16)};
}
async function useBani(id){
 const comp=await getComp(id),model=C.buildItems(comp),check=await verify(model);
 if(check.bad)throw Error(check.bad+' line(s) of '+comp.title+' no longer match their stored fingerprints, so the text is not shown.');
 S.baniId=id;S.comp=comp;S.model=model;S.fingerprint=check.fingerprint||null;S.current=-1;S.word=-1;
 $('text-check').textContent='Gurbani shown is the library’s own '+comp.title+' text · '+model.items.length+' lines · '+(check.checked?'every line matches its stored fingerprint.':'fingerprint check is not available in this browser.');
 render();
}
function render(){
 const out=[];let ui=-1;
 S.model.items.forEach((it,i)=>{
  if(it.unitIndex!==ui){if(ui>=0)out.push('</section>');ui=it.unitIndex;const u=S.comp.units[ui];
   out.push('<section class="unit"><h2'+(u.startsBani?' class="bani-start"':'')+'>'+esc(u.title)+'</h2>');}
  out.push('<button type="button" class="tuk'+(it.kind==='heading'?' heading':'')+'" lang="pa" data-i="'+i+'">'+it.words.map(w=>'<span class="w">'+esc(w.text)+'</span>').join(' ')+'</button>');
 });
 out.push('</section>');
 const root=$('bani-text');root.innerHTML=out.join('');root.classList.toggle('words',S.settings.words);
 S.els=Array.from(root.querySelectorAll('.tuk'));
}

/* ---------- YouTube player (official IFrame API, privacy-enhanced host) ---------- */
let api=null;
function loadYouTube(){
 if(window.YT&&window.YT.Player)return Promise.resolve();
 if(api)return api;
 api=new Promise((ok,fail)=>{
  const prev=window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady=()=>{if(typeof prev==='function')prev();ok();};
  const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';
  s.onerror=()=>{api=null;fail(Error('YouTube could not be reached. Check the internet connection and try again.'));};
  document.head.append(s);
  setTimeout(()=>fail(Error('YouTube is taking too long to answer. Try again in a moment.')),20000);
 });
 return api;
}
const PLAYER_ERRORS={2:'That link does not point to a playable video.',5:'This video cannot play in this browser.',100:'This video was removed or is private.',101:'The owner of this video does not allow it to play inside other apps. Choose another video.',150:'The owner of this video does not allow it to play inside other apps. Choose another video.',153:'YouTube refused to start the player here (it could not tell which site is asking). Open this page from the library’s web address, not a saved file.'};
async function openVideo(id,start){
 await loadYouTube();
 $('player-empty').hidden=true;
 S.videoId=id;S.start=start||0;S.ready=false;S.duration=0;
 if(S.player&&typeof S.player.cueVideoById==='function'){S.player.cueVideoById({videoId:id,startSeconds:S.start});S.ready=true;afterReady();return;}
 const vars={playsinline:1,rel:0,start:S.start};
 if(location.origin&&location.origin!=='null')vars.origin=location.origin;
 S.player=new YT.Player('player',{host:'https://www.youtube-nocookie.com',videoId:id,width:'100%',height:'100%',playerVars:vars,
  events:{
   onReady(){S.ready=true;afterReady();},
   onStateChange(e){
    S.playing=e.data===1;
    if(e.data===1||e.data===2||e.data===5){const d=S.player.getDuration();if(d>0)S.duration=d;}
    $('play').textContent=S.playing?'❚❚':'▶';$('play').setAttribute('aria-label',S.playing?'Pause':'Play');
    wake(S.playing);sample(true);
    if(S.playing&&!S.raf)S.raf=requestAnimationFrame(tick);
    update(true);
   },
   onPlaybackRateChange(e){S.rate=e.data;$('speed').value=String(e.data);sample(true);},
   onAutoplayBlocked(){toast('Tap the play button on the video itself the first time.');},
   onError(e){showError(PLAYER_ERRORS[e.data]||('YouTube could not play this video (code '+e.data+').'),true);}
  }});
}
function afterReady(){
 $('controls').hidden=false;$('chooser-error').hidden=true;
 const d=S.player.getDuration();if(d>0)S.duration=d;
 const rates=typeof S.player.getAvailablePlaybackRates==='function'?S.player.getAvailablePlaybackRates():[1];
 for(const o of $('speed').options)o.hidden=!rates.includes(Number(o.value));
 update(true);
}
function sample(force){
 if(!S.player||!S.ready||typeof S.player.getCurrentTime!=='function')return;
 const t=performance.now();
 if(force||t-S.sampleAt>250){const v=S.player.getCurrentTime();if(typeof v==='number'&&isFinite(v)){S.lastTime=v;S.sampleAt=t;}}
}
function now(){
 sample(false);
 return S.playing?S.lastTime+(performance.now()-S.sampleAt)/1000*S.rate:S.lastTime;
}
function tick(){update(false);S.raf=S.playing?requestAnimationFrame(tick):0;}
let lock=null;
async function wake(on){
 try{
  if(on&&!lock&&'wakeLock' in navigator){lock=await navigator.wakeLock.request('screen');lock.addEventListener('release',()=>{lock=null;});}
  else if(!on&&lock){const l=lock;lock=null;await l.release();}
 }catch{}
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&S.playing)wake(true);});

/* ---------- Following: paint the line being recited ---------- */
function update(force){
 if(!S.timeline||!S.model)return;
 const t=now()+S.settings.offset;
 const pos=S.timeline.at(t,{duration:S.duration});
 paint(pos,force);
 status(pos);
 if(S.mode==='teach'){
  const i=S.timeline.nextIndex(now());const done=S.timeline.marks.length&&S.timeline.marks[S.timeline.marks.length-1].i>=S.model.items.length-1&&now()>=S.timeline.marks[S.timeline.marks.length-1].t;
  $('next-text').textContent=done?'End of '+S.comp.title:S.model.items[i].text;$('next-line').disabled=!!done;$('undo').disabled=!S.timeline.canUndo;
 }
}
function paint(pos,force){
 const i=pos.index,estimated=pos.state==='estimated'||(pos.state==='marked'&&pos.gapLines>3);
 if(i!==S.current||force){
  const old=S.els[S.current];if(old){old.removeAttribute('aria-current');old.classList.remove('estimated');const w=old.querySelector('.w.on');if(w)w.classList.remove('on');}
  S.els.forEach((el,k)=>el.classList.toggle('past',i>=0&&k<i));
  S.current=i;S.word=-1;
  const el=S.els[i];
  if(el){el.setAttribute('aria-current','true');if(Date.now()-S.userScrollAt>5000)el.scrollIntoView({block:'center',behavior:reduced?'auto':'smooth'});}
 }
 const el=S.els[i];if(!el)return;
 el.classList.toggle('estimated',estimated);
 if(S.settings.words){
  const k=C.wordAt(S.model.items[i],pos.frac);
  if(k!==S.word){const ws=el.querySelectorAll('.w');if(ws[S.word])ws[S.word].classList.remove('on');if(ws[k])ws[k].classList.add('on');S.word=k;}
 }
}
function status(pos){
 const n=S.timeline.marks.length,marks=n?' · '+n+' mark'+(n===1?'':'s'):'';
 let text;
 switch(pos.state){
  case 'none':text=S.playing?'When the recitation begins, tap “First line starts now”.':'Press play. When the recitation begins, tap “First line starts now”.';break;
  case 'waiting':text='Waiting for the first line at '+C.fmt(pos.next.t)+'.'+marks;break;
  case 'marked':text=(pos.gapLines>3?'Following your marks; between them the light is estimated.':'Following your marks.')+marks;break;
  case 'held':text='Kirtan: the light stays on the line you last tapped.'+marks;break;
  case 'ended':text='End of '+S.comp.title+'.'+marks;break;
  default:text=(pos.from==='marks'?'Estimating from the pace you marked.':pos.from==='video length'?'Estimating from the video’s length.':'Estimating at an average pace.')+' If the light drifts, tap the line being recited.'+marks;
 }
 if(S.source&&n)text+=' · '+S.source;
 if(text!==S.statusText){S.statusText=text;$('status').textContent=text;}
 $('mark-first').hidden=!(pos.state==='none'&&S.ready&&S.mode!=='teach');
}

/* ---------- Marks: taps become "this line starts now" ---------- */
function mark(i,{latency=S.playing?C.TAP_LATENCY:0,quiet=false}={}){
 if(!S.timeline)return;
 const t=now();if(!S.timeline.add(t,i,{latency}))return;
 S.source='';save();update(true);
 if(!quiet)toast('Marked at '+C.fmt(t),()=>{S.timeline.undo();save();update(true);});
}
$('mark-first').addEventListener('click',()=>mark(0,{quiet:true}));
$('bani-text').addEventListener('click',e=>{
 const el=e.target.closest('.tuk');if(!el||!S.timeline)return;
 const i=Number(el.dataset.i);
 if(!S.ready){toast('Open a video first.');return;}
 if(S.playing||S.mode==='teach'){mark(i);return;}
 const t=S.timeline.timeOf(i,{duration:S.duration});
 if(t===null){toast('Play the video, then tap this line when it is recited.');return;}
 S.player.seekTo(Math.max(0,t-S.settings.offset),true);S.lastTime=t;S.sampleAt=performance.now();S.userScrollAt=0;update(true);
 toast('Moved the video to this line.');
});
$('next-line').addEventListener('click',()=>{if(!S.timeline)return;mark(S.timeline.nextIndex(now()),{quiet:true});});
$('undo').addEventListener('click',()=>{if(S.timeline&&S.timeline.undo()){save();update(true);}});
document.addEventListener('keydown',e=>{
 if(S.mode!=='teach'||e.target.closest('input,select,textarea,dialog'))return;
 if(e.key==='ArrowDown'||e.key==='n'){e.preventDefault();$('next-line').click();}
 else if(e.key==='u'){e.preventDefault();$('undo').click();}
});
for(const b of document.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>{
 S.mode=b.dataset.mode;for(const x of document.querySelectorAll('[data-mode]'))x.setAttribute('aria-pressed',String(x===b));
 $('teach-panel').hidden=S.mode!=='teach';update(true);
 if(S.mode==='teach')toast('Tap the big button each time a new line begins.');
});

/* ---------- Saving, sharing, opening timings ---------- */
const key=()=>S.baniId+'|'+S.videoId;
function currentFile(){return C.timingFile({videoId:S.videoId,bani:S.baniId,model:S.model,timeline:S.timeline,fingerprint:S.fingerprint});}
function save(){
 const all=store.read();all.timings=all.timings||{};
 if(S.timeline.marks.length)all.timings[key()]={...currentFile(),updated:new Date().toISOString()};else delete all.timings[key()];
 all.last={bani:S.baniId,video:S.videoId};all.settings=S.settings;
 if(!store.write(all)&&!S.warnedSave){S.warnedSave=true;toast('This browser is not keeping the timing. Use Share timing to keep a copy.');}
 summary();
}
async function findTiming(){
 const hash=new URLSearchParams(location.hash.slice(1));
 if(hash.get('a')&&hash.get('v')===S.videoId&&hash.get('b')===S.baniId){
  const n=Number(hash.get('n'));
  if(n===S.model.items.length)return {marks:C.decodeMarks(hash.get('a'),n),style:hash.get('s')==='k'?'kirtan':'paath',source:'from a shared link',fromLink:true};
  toast('The shared timing was made for a different edition of this text, so it was not used.');
 }
 const saved=store.read().timings?.[key()];
 if(saved){try{const r=C.readTimingFile(saved,S.model);return {marks:r.marks,style:r.style,source:''};}catch{}}
 try{
  const r=await fetch('timings/index.json',{cache:'no-cache'});
  if(r.ok){const lib=await r.json();const hit=(lib.timings||[]).find(x=>x.bani===S.baniId&&x.youtubeId===S.videoId);
   if(hit&&/^[a-z0-9._-]+\.json$/i.test(hit.file)){const f=await fetch('timings/'+hit.file);if(f.ok){const t=C.readTimingFile(await f.json(),S.model);return {marks:t.marks,style:t.style,source:'timing from the library'};}}}
 }catch{}
 return {marks:[],style:S.settings.style,source:''};
}
function shareLink(){
 const p=new URLSearchParams({v:S.videoId,b:S.baniId,s:S.timeline.style==='kirtan'?'k':'p',n:String(S.model.items.length),a:C.encodeMarks(S.timeline.marks)});
 return location.origin+location.pathname+'#'+p.toString();
}
async function copy(text,done){try{await navigator.clipboard.writeText(text);toast(done);}catch{toast('Copying is not allowed here. Use Save timing file instead.');}}
async function share(){
 if(!S.timeline||!S.timeline.marks.length){toast('There is no timing to share yet.');return;}
 const url=shareLink();
 if(navigator.share){try{await navigator.share({title:S.comp.title+' · listen along',url});return;}catch(e){if(e&&e.name==='AbortError')return;}}
 copy(url,'Link copied. Anyone who opens it gets this timing.');
}
$('copy-link').addEventListener('click',share);
$('copy-file').addEventListener('click',()=>{if(S.timeline)copy(JSON.stringify(currentFile(),null,1),'Timing file copied.');});
$('download').addEventListener('click',()=>{
 if(!S.timeline||!S.timeline.marks.length){toast('There is no timing to save yet.');return;}
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(currentFile(),null,1)],{type:'application/json'}));
 a.download='timing-'+S.baniId+'-'+S.videoId+'.json';document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);
});
$('open-file').addEventListener('change',async e=>{
 const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;
 try{
  const obj=JSON.parse(await f.text());
  if(obj.bani&&obj.bani!==S.baniId){$('bani').value=obj.bani;await useBani(obj.bani);}
  if(!S.model)await useBani($('bani').value);
  const r=C.readTimingFile(obj,S.model);
  if(r.videoId!==S.videoId){$('link').value='https://youtu.be/'+r.videoId;await openVideo(r.videoId,0);}
  S.timeline=C.createTimeline(S.model,{style:r.style});S.timeline.setMarks(r.marks);S.source='';save();update(true);
  toast('Opened a timing with '+r.marks.length+' marks'+(r.missing?' ('+r.missing+' did not match this text)':'')+'.');
  $('settings').close();
 }catch(err){toast(err.message||'That file could not be read.');}
});
$('clear').addEventListener('click',()=>openDialog($('confirm')));
$('confirm-clear').addEventListener('click',()=>{$('confirm').close();if($('settings').open)$('settings').close();if(S.timeline&&S.timeline.clear()){save();update(true);toast('Timing cleared.',()=>{S.timeline.undo();save();update(true);});}});
function summary(){
 const n=S.timeline?S.timeline.marks.length:0;
 $('timing-summary').textContent=S.videoId?(n?n+' marks for this video, about '+Math.max(1,Math.round(JSON.stringify(currentFile()).length/1024))+' KB. It holds only times and line names, no sound, video or text.':'No marks yet for this video.'):'Open a video first.';
}

/* ---------- Choosing a bani and a video ---------- */
function showError(msg,withLink){
 const p=$('chooser-error');p.hidden=false;p.textContent=msg;
 if(withLink&&S.videoId){const a=document.createElement('a');a.href='https://www.youtube.com/watch?v='+S.videoId;a.textContent=' Open it on YouTube instead.';a.target='_blank';a.rel='noopener';p.append(a);}
}
async function openSession(baniId,videoId,start){
 try{
  $('chooser-error').hidden=true;
  if(baniId!==S.baniId||!S.model)await useBani(baniId);
  if(videoId!==S.videoId||!S.player)await openVideo(videoId,start);
  const found=await findTiming();
  S.timeline=C.createTimeline(S.model,{style:found.style});S.timeline.setMarks(found.marks);S.source=found.source;
  S.settings.style=found.style;$('style').value=found.style;
  if(found.fromLink){save();history.replaceState(null,'',location.pathname+'#'+new URLSearchParams({v:videoId,b:baniId}).toString());toast('Opened with the shared timing ('+found.marks.length+' marks).');}
  else{const all=store.read();all.last={bani:baniId,video:videoId};store.write(all);if(!location.hash.includes(videoId))history.replaceState(null,'',location.pathname+'#'+new URLSearchParams({v:videoId,b:baniId}).toString());}
  $('how').hidden=S.timeline.marks.length>0;
  S.current=-1;summary();update(true);
 }catch(err){showError(err.message||'Something went wrong.');}
}
$('chooser').addEventListener('submit',e=>{
 e.preventDefault();const v=C.parseYouTube($('link').value);
 if(!v){showError('That does not look like a YouTube link. Copy it from the Share button under a YouTube video.');return;}
 openSession($('bani').value,v.id,v.start);
});
$('bani').addEventListener('change',()=>{if(S.videoId)openSession($('bani').value,S.videoId,0);});
$('play').addEventListener('click',()=>{if(!S.ready)return;if(S.playing)S.player.pauseVideo();else S.player.playVideo();});
$('again').addEventListener('click',()=>{
 if(!S.ready||!S.timeline||S.current<0){toast('Once the light is on a line, this plays that line again.');return;}
 const t=S.timeline.timeOf(S.current,{duration:S.duration});
 if(t===null){toast('This line has no time yet.');return;}
 S.player.seekTo(Math.max(0,t-0.3-S.settings.offset),true);S.lastTime=Math.max(0,t-0.3);S.sampleAt=performance.now();update(true);
});
$('speed').addEventListener('change',()=>{if(S.ready)S.player.setPlaybackRate(Number($('speed').value));});
$('share').addEventListener('click',share);

/* ---------- Reading comfort ---------- */
const markScroll=()=>{S.userScrollAt=Date.now();if(S.current>=0&&S.playing)$('return').hidden=false;};
addEventListener('wheel',markScroll,{passive:true});addEventListener('touchmove',markScroll,{passive:true});
setInterval(()=>{if(!$('return').hidden&&Date.now()-S.userScrollAt>5000){$('return').hidden=true;}},1000);
$('return').addEventListener('click',()=>{S.userScrollAt=0;$('return').hidden=true;const el=S.els[S.current];if(el)el.scrollIntoView({block:'center',behavior:reduced?'auto':'smooth'});});
let toastTimer=0;
function toast(text,undo){
 $('toast-text').textContent=text;const b=$('toast-undo');b.hidden=!undo;b.onclick=undo?()=>{undo();$('toast').hidden=true;}:null;
 $('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('toast').hidden=true;},undo?6000:3500);
}
function openDialog(d){if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','');}
for(const b of document.querySelectorAll('[data-close]'))b.addEventListener('click',()=>b.closest('dialog').close());
// closing a dialog returns focus to the top of the page; bring the recitation back into view
for(const d of document.querySelectorAll('dialog'))d.addEventListener('close',()=>{S.userScrollAt=0;const el=S.els[S.current];if(el)requestAnimationFrame(()=>el.scrollIntoView({block:'center',behavior:'auto'}));});
$('open-settings').addEventListener('click',()=>{summary();openDialog($('settings'));});
function applySettings(){
 const s=S.settings;document.documentElement.dataset.theme=s.night?'amrit':'day';
 document.documentElement.style.setProperty('--size',s.size+'px');
 $('style').value=s.style;$('size').value=s.size;$('offset').value=s.offset;$('offset-out').textContent=(s.offset>0?'+':'')+s.offset+' s';
 $('words').checked=s.words;$('night').checked=s.night;$('bani-text').classList.toggle('words',s.words);
 const all=store.read();all.settings=s;store.write(all);
}
$('style').addEventListener('change',()=>{S.settings.style=$('style').value;if(S.timeline){S.timeline.setStyle(S.settings.style);save();}applySettings();update(true);});
$('size').addEventListener('input',()=>{S.settings.size=Number($('size').value);applySettings();});
$('offset').addEventListener('input',()=>{S.settings.offset=Number($('offset').value);applySettings();update(true);});
$('words').addEventListener('change',()=>{S.settings.words=$('words').checked;applySettings();update(true);});
$('night').addEventListener('change',()=>{S.settings.night=$('night').checked;applySettings();});

/* ---------- Start: shared link, or where the reader left off ---------- */
(function start(){
 const saved=store.read();
 if(saved.settings&&typeof saved.settings==='object')Object.assign(S.settings,saved.settings);
 S.settings.size=Math.min(44,Math.max(22,Number(S.settings.size)||30));S.settings.offset=Math.min(2,Math.max(-2,Number(S.settings.offset)||0));
 applySettings();
 const hash=new URLSearchParams(location.hash.slice(1));
 const v=hash.get('v'),b=hash.get('b');
 const bani=$('bani');
 const valid=x=>Array.from(bani.options).some(o=>o.value===x);
 if(v&&C.parseYouTube(v)&&valid(b)){bani.value=b;$('link').value='https://youtu.be/'+v;openSession(b,v,0);return;}
 if(saved.last&&saved.last.video&&valid(saved.last.bani)){bani.value=saved.last.bani;$('link').value='https://youtu.be/'+saved.last.video;}
})();
}
