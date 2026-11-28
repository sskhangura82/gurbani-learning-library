/* GLP-001 Listen-along core: pure timing logic for following a YouTube recitation.
   Scripture text is input only and is never edited here. No DOM, no network. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GLPListenAlongCore=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const SCHEMA='GLP-LISTEN-ALONG-TIMING-1';
 // Recitation weight: one unit per Gurmukhi letter that usually carries a syllable,
 // plus a breath at the end of every line and a longer one at the end of a pauri/chhand.
 const LINE_PAUSE=2, UNIT_PAUSE=3, IK_OANKAR=3;
 // Fallback pace when nothing else is known (assumption: Japji Sahib, weight ~6,000, in about 20 minutes).
 const DEFAULT_RATE=5;
 const TAP_LATENCY=0.2;   // people tap a little after a line begins
 const MERGE_WINDOW=0.3;  // two marks this close in time replace each other
 const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
 const finite=x=>typeof x==='number'&&Number.isFinite(x);

 function syllables(text){
  let n=0;
  for(const ch of String(text)){
   const c=ch.codePointAt(0);
   if((c>=0x0A05&&c<=0x0A14)||(c>=0x0A15&&c<=0x0A39)||(c>=0x0A59&&c<=0x0A5E))n++;
   else if(c===0x0A74)n+=IK_OANKAR;
  }
  return n;
 }
 function wordsOf(text){
  const words=String(text).split(/\s+/u).filter(Boolean);
  const raw=words.map(w=>Math.max(0.35,syllables(w)));
  return words.map((w,i)=>({text:w,w:raw[i]}));
 }

 /* ---------- Normalizers: app data files -> one shape ---------- */
 // Composition shape: {id,title,titleGurmukhi,units:[{id,title,items:[{key,text,sha256,kind}]}]}
 function normalizeJapji(data){
  if(!data||!Array.isArray(data.units))throw Error('Japji data missing');
  return {id:'japji',title:'Japji Sahib',titleGurmukhi:'ਜਪੁਜੀ ਸਾਹਿਬ',
   units:data.units.map(u=>({id:'japji:'+u.id,title:u.title,items:u.lines.map(l=>({key:'japji:'+l.id,text:l.text,sha256:l.sha256,kind:'line'}))}))};
 }
 function normalizeNitnem(data){
  if(!data||!Array.isArray(data.units))throw Error('Bani data missing');
  const id=data.compositionId, units=[];
  const pre=(data.preface||[]).map((p,i)=>({key:id+':preface'+(i+1),text:p.text,sha256:p.sha256,kind:'heading'}));
  data.units.forEach((u,ui)=>{
   const items=ui===0?pre.slice():[];
   const heading=(h,k)=>({key:id+':'+u.id+'.h'+(k+1),text:h.text,sha256:h.sha256,kind:'heading'});
   const line=l=>({key:id+':'+l.id,text:l.text,sha256:l.sha256,kind:'line'});
   if(Array.isArray(u.sourceDisplayOrder)){
    for(const o of u.sourceDisplayOrder){
     if(o.kind==='line'){const l=u.lines.find(x=>x.id===o.id);if(!l)throw Error('Display order names a missing line');items.push(line(l));}
     else if(o.kind==='metricalHeading')items.push(heading(u.metricalHeadings[o.index],o.index));
    }
   }else{(u.metricalHeadings||[]).forEach((h,k)=>items.push(heading(h,k)));u.lines.forEach(l=>items.push(line(l)));}
   units.push({id:id+':'+u.id,title:u.title,items});
  });
  return {id,title:data.title,titleGurmukhi:data.titleGurmukhi,units};
 }
 function normalizeSukhmani(data){
  if(!data||!Array.isArray(data.ashtpadis))throw Error('Sukhmani data missing');
  return {id:'sukhmani',title:'Sukhmani Sahib',titleGurmukhi:'ਸੁਖਮਨੀ ਸਾਹਿਬ',
   units:data.ashtpadis.map(a=>({id:'sukhmani:'+a.id,title:a.title,items:a.lines.map(l=>({key:'sukhmani:'+l.id,text:l.gurmukhi,sha256:l.sha256,kind:l.kind==='heading'?'heading':'line'}))}))};
 }
 function compose(id,title,titleGurmukhi,parts){
  return {id,title,titleGurmukhi,units:parts.flatMap(p=>p.units.map((u,i)=>({...u,title:i===0?p.title+' · '+u.title:u.title,startsBani:i===0?p.title:null})))};
 }

 /* ---------- Items with weights ---------- */
 function buildItems(comp){
  const items=[];const keys=new Set();let pos=0;
  comp.units.forEach((u,ui)=>{u.items.forEach((it,li)=>{
   if(typeof it.text!=='string'||!it.text.trim())throw Error('Empty scripture line');
   if(keys.has(it.key))throw Error('Duplicate line key '+it.key);keys.add(it.key);
   const words=wordsOf(it.text);
   const last=li===u.items.length-1;
   const body=words.reduce((s,w)=>s+w.w,0);
   const w=body+LINE_PAUSE+(last?UNIT_PAUSE:0);
   items.push({key:it.key,text:it.text,sha256:it.sha256,kind:it.kind,unitIndex:ui,lineIndex:li,start:pos,w,body,words});
   pos+=w;
  });});
  if(!items.length)throw Error('No lines');
  return {items,total:pos,fingerprintSource:items.map(i=>i.key+'='+(i.sha256||'')).join('\n')};
 }
 // weight position -> item index + fraction through its spoken body
 function locate(model,p){
  const it=model.items;
  if(p<=0)return {index:0,frac:0};
  if(p>=model.total)return {index:it.length-1,frac:1};
  let lo=0,hi=it.length-1;
  while(lo<hi){const mid=(lo+hi+1)>>1;if(it[mid].start<=p)lo=mid;else hi=mid-1;}
  return {index:lo,frac:clamp((p-it[lo].start)/it[lo].body,0,1)};
 }
 function wordAt(item,frac){
  const total=item.words.reduce((s,w)=>s+w.w,0);let acc=0;const target=frac*total;
  for(let i=0;i<item.words.length;i++){acc+=item.words[i].w;if(target<acc)return i;}
  return item.words.length-1;
 }

 /* ---------- Timeline: marks (time, item) -> position at any time ---------- */
 function createTimeline(model,opts={}){
  let style=opts.style==='kirtan'?'kirtan':'paath';
  let marks=[];const history=[];
  const sort=()=>marks.sort((a,b)=>a.t-b.t);
  const valid=m=>finite(m.t)&&m.t>=0&&Number.isInteger(m.i)&&m.i>=0&&m.i<model.items.length;
  function setMarks(list){marks=(list||[]).filter(valid).map(m=>({t:m.t,i:m.i}));sort();if(style==='paath')marks=monotone(marks);}
  // keep the latest-entered meaning when marks disagree about order (paath only)
  function monotone(list){const out=[];for(const m of list){while(out.length&&out[out.length-1].i>=m.i)out.pop();out.push(m);}return out;}
  function snapshot(){history.push(marks.map(m=>({...m})));if(history.length>200)history.shift();}
  function add(t,i,{latency=0}={}){
   const m={t:Math.max(0,t-latency),i};if(!valid(m))return false;
   snapshot();
   marks=marks.filter(x=>Math.abs(x.t-m.t)>MERGE_WINDOW);
   if(style==='paath')marks=marks.filter(x=>!((x.t<m.t&&x.i>=m.i)||(x.t>m.t&&x.i<=m.i)));
   marks.push(m);sort();return true;
  }
  function undo(){if(!history.length)return false;marks=history.pop();return true;}
  function clear(){if(!marks.length)return false;snapshot();marks=[];return true;}
  function rate(duration){
   const seg=[];for(let k=1;k<marks.length;k++){const a=marks[k-1],b=marks[k];if(b.i>a.i&&b.t-a.t>=1)seg.push([model.items[b.i].start-model.items[a.i].start,b.t-a.t]);}
   const recent=seg.slice(-6);
   if(recent.length){const dw=recent.reduce((s,x)=>s+x[0],0),dt=recent.reduce((s,x)=>s+x[1],0);return {rate:clamp(dw/dt,0.8,20),from:'marks'};}
   const last=marks[marks.length-1];
   if(last&&finite(duration)&&duration>0){const remainW=model.total-model.items[last.i].start,remainT=duration*0.97-last.t;if(remainT>20)return {rate:clamp(remainW/remainT,0.8,20),from:'video length'};}
   return {rate:DEFAULT_RATE,from:'default'};
  }
  function lastBefore(t){let lo=0,hi=marks.length-1,k=-1;while(lo<=hi){const mid=(lo+hi)>>1;if(marks[mid].t<=t){k=mid;lo=mid+1;}else hi=mid-1;}return k;}
  // state: none | waiting | marked (between two marks) | estimated (beyond last mark) | held (kirtan) | ended
  function at(t,{duration}={}){
   if(!marks.length)return {state:'none',index:-1,frac:0};
   const k=lastBefore(t);
   if(k<0)return {state:'waiting',index:-1,frac:0,next:marks[0]};
   const a=marks[k],b=marks[k+1],ia=model.items[a.i];
   if(style==='kirtan'){
    const r=rate(duration).rate;return {state:'held',index:a.i,frac:clamp((t-a.t)*r/ia.body,0,1)};
   }
   if(b&&b.i>a.i){
    const p=ia.start+(model.items[b.i].start-ia.start)*(t-a.t)/(b.t-a.t);
    const loc=locate(model,p);return {state:'marked',...loc,gapLines:b.i-a.i};
   }
   const {rate:r,from}=rate(duration);
   const p=ia.start+r*(t-a.t);
   if(p>=model.total)return {state:'ended',index:model.items.length-1,frac:1};
   return {state:'estimated',...locate(model,p),from};
  }
  // best-known start time for an item (used to jump the video to a tapped line)
  function timeOf(i,{duration}={}){
   if(!marks.length||i<0||i>=model.items.length)return null;
   const exact=marks.find(m=>m.i===i);if(exact)return exact.t;
   if(style==='kirtan')return null;
   const w=model.items[i].start;let k=-1;for(let j=0;j<marks.length;j++)if(marks[j].i<i)k=j;
   const a=marks[k],b=marks[k+1];
   if(a&&b){const wa=model.items[a.i].start,wb=model.items[b.i].start;return a.t+(b.t-a.t)*(w-wa)/(wb-wa);}
   const r=rate(duration).rate;
   if(a)return a.t+(w-model.items[a.i].start)/r;
   return Math.max(0,b.t-(model.items[b.i].start-w)/r);
  }
  function nextIndex(t){const k=lastBefore(t);if(k<0)return 0;return Math.min(model.items.length-1,marks[k].i+1);}
  return {
   get style(){return style;},
   setStyle(s){style=s==='kirtan'?'kirtan':'paath';},
   get marks(){return marks.map(m=>({...m}));},
   get canUndo(){return history.length>0;},
   setMarks,add,undo,clear,at,timeOf,nextIndex,rate,
   TAP_LATENCY
  };
 }

 /* ---------- YouTube links ---------- */
 const ID=/^[A-Za-z0-9_-]{11}$/;
 function parseYouTube(input){
  const s=String(input||'').trim();if(!s)return null;
  if(ID.test(s))return {id:s,start:0};
  let u;try{u=new URL(/^https?:\/\//i.test(s)?s:'https://'+s);}catch{return null;}
  const host=u.hostname.replace(/^(www|m|music)\./,'');
  let id=null;
  if(host==='youtu.be')id=u.pathname.split('/')[1];
  else if(host==='youtube.com'||host==='youtube-nocookie.com'){
   if(u.pathname==='/watch')id=u.searchParams.get('v');
   else{const m=u.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);if(m)id=m[1];}
  }
  if(!id||!ID.test(id))return null;
  const t=u.searchParams.get('t')||u.searchParams.get('start')||'';
  let start=0;const hms=t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/);
  if(hms&&t)start=(+hms[1]||0)*3600+(+hms[2]||0)*60+(+hms[3]||0);
  return {id,start};
 }

 /* ---------- Saving and sharing a timing (no audio, video or text inside) ---------- */
 function timingFile({videoId,bani,model,timeline,fingerprint,title}){
  return {schema:SCHEMA,video:{youtubeId:videoId,title:title||null},bani,
   textEdition:{items:model.items.length,fingerprint:fingerprint||null},
   style:timeline.style,
   marks:timeline.marks.map(m=>({t:Math.round(m.t*100)/100,line:model.items[m.i].key})),
   note:'Timing marks only. Contains no audio, video or scripture text.'};
 }
 function readTimingFile(obj,model){
  if(!obj||obj.schema!==SCHEMA)throw Error('This is not a listen-along timing file');
  if(!obj.video||!ID.test(obj.video.youtubeId||''))throw Error('Timing file has no valid video');
  const index=new Map(model.items.map((it,i)=>[it.key,i]));
  const marks=[];let missing=0;
  for(const m of obj.marks||[]){const i=index.get(m.line);if(i===undefined||!finite(m.t)){missing++;continue;}marks.push({t:m.t,i});}
  return {videoId:obj.video.youtubeId,bani:obj.bani,style:obj.style==='kirtan'?'kirtan':'paath',marks,missing,
   editionMatches:!obj.textEdition||obj.textEdition.items===model.items.length};
 }
 // compact form for a share link: "deciseconds~index" in base 36, dot-separated
 function encodeMarks(marks){return marks.map(m=>Math.round(m.t*10).toString(36)+'~'+m.i.toString(36)).join('.');}
 function decodeMarks(s,max){
  if(!s)return [];const out=[];
  for(const part of String(s).split('.')){const m=part.match(/^([0-9a-z]+)~([0-9a-z]+)$/);if(!m)continue;const t=parseInt(m[1],36)/10,i=parseInt(m[2],36);if(finite(t)&&Number.isInteger(i)&&i>=0&&i<max)out.push({t,i});}
  return out;
 }
 function fmt(sec){if(!finite(sec)||sec<0)return '0:00';sec=Math.floor(sec);const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return (h?h+':'+String(m).padStart(2,'0'):m)+':'+String(s).padStart(2,'0');}

 return Object.freeze({SCHEMA,DEFAULT_RATE,TAP_LATENCY,syllables,wordsOf,normalizeJapji,normalizeNitnem,normalizeSukhmani,compose,buildItems,locate,wordAt,createTimeline,parseYouTube,timingFile,readTimingFile,encodeMarks,decodeMarks,fmt});
});
