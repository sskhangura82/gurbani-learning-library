/* GLP-001 Full Nitnem local QA only. Two frozen ORIGINAL digital source
 * candidates share accepted continuous-core.js. Never served via family PWA.
 * No storage, audio, analytics, permissions or unverified teaching.
 */
const LOCAL_HOSTS=new Set(['localhost','127.0.0.1']);
const SOURCES=Object.freeze({
 sohila:{
  path:'../docs/research/n1-sohila/sohila-candidate-original.json',
  digest:'badd09042c55995be3b0d7af23059a3275cd8f317adc5250014db8b7e3f0dfde',
  compositionId:'kirtan-sohila',units:5,lines:56,sourceFamily:'sggs'
 },
 savaiye:{
  path:'../docs/research/n3-dasam-savaiye/savaiye-ten-original-candidate.json',
  digest:'bbd78d6efc4339757199e3b06191de43ea886455d026ca35b5a09a78eb14ba8e',
  compositionId:'tav-prasad-savaiye',units:10,lines:40,sourceFamily:'dasam'
 },
 chaupai:{
  path:'../docs/research/n4-chaupai-excerpt/chaupai-sgpc-excerpt-candidate.json',
  digest:'06fd09902871c1aed28913e265443080575ac60ebf1afff4195aa7f346ac3747',
  compositionId:'rehras-benti-chaupai-excerpt',units:25,lines:100,sourceFamily:'dasam'
 }
});
const $=id=>document.getElementById(id);
const C=window.GLPContinuousCore;
let sourceKey=null,units=[],model=null,position={index:0,token:0},unitIndex=0,playing=false,clock=null,readerReady=false;
const securityMsg='Engineering-only digital Gurmukhi candidate. No qualified source/edition approval or family release.';
async function sha(value){
 const bytes=new TextEncoder().encode(value);
 const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
 return [...hash].map(x=>x.toString(16).padStart(2,'0')).join('');
}
const metadata=o=>JSON.stringify(o.units.flatMap(u=>u.lines.map(l=>[u.unitId,l.id,l.text,l.sha256,l.location??null])));
function fail(message){
 pause();
 $('qa-status').textContent='SOURCE BLOCKED: '+message;
 $('composition-original').replaceChildren();
 $('original-preface').replaceChildren();
 readerReady=false;
 throw Error(message);
}
function pause(){
 playing=false;
 if(clock!==null){clearInterval(clock);clock=null;}
 $('qa-play').setAttribute('aria-pressed','false');
 $('qa-play').textContent='Play guide';
}
function status(label){$('qa-status').textContent=label;}
async function verifyRecord(record,spec){
 if(record.compositionId!==spec.compositionId||record.units?.length!==spec.units)fail('Unexpected source identity');
 if(record.edition?.sourceFamily!==spec.sourceFamily||record.edition?.humanCollationApproved!==false)fail('Source review identity mismatch');
 if(record.ui?.readable!==false||record.ui?.meaningReviewStatus!=='not_ingested'||record.ui?.studyReviewStatus!=='not_ingested')fail('This source fixture must remain UNAPPROVED');
 const sourceLines=record.units.flatMap(u=>u.lines);
 if(sourceLines.length!==spec.lines)fail('Missing original Gurmukhi line');
 if(await sha(metadata(record))!==spec.digest)fail('Candidate full original text/order hash does not match');
 const ids=new Set();
 for(const line of sourceLines){
  if(ids.has(line.id)||typeof line.text!=='string'||!line.text.trim())fail('Duplicate/empty original source');
  ids.add(line.id);
  if(await sha(line.text)!==line.sha256)fail('Original text SHA-256 verification failed');
  if(line.location?.system!==(spec.sourceFamily==='sggs'?'ang':'dasam_section'))fail('Inconsistent composition source locator');
  if(spec.sourceFamily==='dasam'&&('ang' in line.location))fail('Invented SGGS Ang on Dasam original');
 }
 if(spec.sourceFamily==='sggs'&&record.units.some(u=>u.sourceHeadingIncludedInLines!==true))fail('Original headings must remain exactly once in source');
 if(spec.sourceFamily==='dasam'&&record.prefaceOriginalCandidate?.length!==3)fail('Expected three original-source preface candidates');
 return sourceLines;
}
function createWords(line){
 const p=document.createElement('p');
 p.lang='pa';p.className='qa-source-line';p.dataset.id=line.id;p.dataset.sourceSha256=line.sha256;
 const parts=line.text.split(/(\s+)/u).filter(Boolean);
 for(const part of parts){
  if(/^\s+$/u.test(part)){p.append(document.createTextNode(part));continue;}
  const word=document.createElement('span');word.className='qa-word';word.textContent=part;
  word.dataset.word=String(p.querySelectorAll('.qa-word').length);
  p.append(word);
 }
 return p;
}
function build(record){
 const parent=$('composition-original'),preface=$('original-preface');
 const fragment=document.createDocumentFragment();
 for(const [i,u] of record.units.entries()){
  const section=document.createElement('section');
  section.className='qa-unit';section.id='qa-unit-'+i;section.dataset.unitId=u.unitId;
  const title=document.createElement('h2');
  title.textContent=(record.compositionId==='kirtan-sohila'?'Shabad ':record.compositionId==='tav-prasad-savaiye'?'Savaiya ':'Rehras Chaupai Pauri ')+(i+1)+' · DIGITAL SOURCE CANDIDATE';
  section.append(title);
  for(const l of u.lines)section.append(createWords(l));
  fragment.append(section);
 }
 parent.replaceChildren(fragment);
 const originalPreface=document.createDocumentFragment();
 if(Array.isArray(record.prefaceOriginalCandidate)){
  for(const r of record.prefaceOriginalCandidate){
   const p=document.createElement('p');
   p.className='qa-preface';p.lang='pa';p.textContent=r.text;
   originalPreface.append(p);
  }
 }
 preface.replaceChildren(originalPreface);
}
function updateLocation(){
 const current=model.lines[position.index];
 if(!current)return;
 $('qa-location').textContent=(sourceKey==='sohila'?'Shabad ':sourceKey==='savaiye'?'Savaiya ':'Rehras Chaupai Pauri ')+(current.unitIndex+1)+' · line '+(current.lineIndex+1);
 $('qa-previous').disabled=current.unitIndex===0;
 $('qa-next').disabled=current.unitIndex===units.length-1;
}
function mark(){
 for(const x of document.querySelectorAll('.qa-word[data-active=true]'))delete x.dataset.active;
 for(const x of document.querySelectorAll('.qa-source-line[aria-current]'))x.removeAttribute('aria-current');
 const l=model.lines[position.index],element=document.querySelector('[data-id="'+l.id+'"]');
 if(!element)return;
 const word=element.querySelectorAll('.qa-word')[position.token];
 if(word)word.dataset.active='true';
 element.setAttribute('aria-current','location');
 unitIndex=l.unitIndex;
 updateLocation();
 return element;
}
function goToUnit(i){
 if(!readerReady)return;
 pause();
 unitIndex=Math.max(0,Math.min(units.length-1,i));
 position={index:model.starts[unitIndex],token:0};
 mark();
 $('qa-unit-'+unitIndex).scrollIntoView({behavior:'instant',block:'start'});
 status('Unreviewed source · '+$('qa-location').textContent+'. '+securityMsg);
}
function step(){
 if(!readerReady||!model)return false;
 const next=C.advance(position,model.lines);
 if(next.finished){pause();status('Source guide completed. '+securityMsg);return false;}
 position={index:next.index,token:next.token};
 const current=mark();
 if(next.newLine&&current)current.scrollIntoView({behavior:'instant',block:'center'});
 return true;
}
function start(){
 if(!readerReady||playing)return;
 playing=true;$('qa-play').setAttribute('aria-pressed','true');$('qa-play').textContent='Pause guide';
 status('Silent visual guide · unapproved source candidate, not audio synchronized.');
 clock=setInterval(step,600);
}
async function load(key){
 if(!LOCAL_HOSTS.has(location.hostname)||!isSecureContext)throw Error('Nonshipping source viewer only works on trusted loopback');
 if(!Object.hasOwn(SOURCES,key))throw Error('Unknown research source');
 pause();readerReady=false;
 sourceKey=key;
 for(const button of document.querySelectorAll('[data-source]'))button.setAttribute('aria-pressed',String(button.dataset.source===key));
 status('Verifying immutable source hash for '+key+'…');
 $('composition-original').replaceChildren();
 const response=await fetch(SOURCES[key].path,{cache:'no-store'});
 if(!response.ok)fail('Frozen source candidate unavailable');
 const record=await response.json();
 await verifyRecord(record,SOURCES[key]);
 units=record.units.map(u=>({
  id:u.unitId,title:u.title,lines:u.lines.map(l=>({
   id:l.id,text:l.text,sha256:l.sha256,
   ang:l.location.system==='ang'?l.location.ang:null
  }))
 }));
 model=C.flatten(units);
 if(model.lines.length!==SOURCES[key].lines)fail('Continuous-core original count mismatch');
 build(record);position={index:0,token:0};readerReady=true;
 mark();
 window.scrollTo({top:0,behavior:'instant'});
 status('SHA-256 verified: '+model.lines.length+' ORIGINAL DIGITAL CANDIDATE lines; '+units.length+' units. '+securityMsg);
}
$('load-sohila').addEventListener('click',()=>load('sohila').catch(e=>status('SOURCE BLOCKED: '+e.message)));
$('load-savaiye').addEventListener('click',()=>load('savaiye').catch(e=>status('SOURCE BLOCKED: '+e.message)));
$('load-chaupai').addEventListener('click',()=>load('chaupai').catch(e=>status('SOURCE BLOCKED: '+e.message)));
$('qa-previous').addEventListener('click',()=>goToUnit(unitIndex-1));
$('qa-next').addEventListener('click',()=>goToUnit(unitIndex+1));
$('qa-play').addEventListener('click',()=>playing?pause():start());
$('qa-size').addEventListener('change',e=>{
 const size=Number(e.target.value);
 if(![30,40,48].includes(size)){e.target.value='30';return;}
 document.documentElement.style.setProperty('--qa-gurmukhi',size+'px');
 status('Gurmukhi '+size+'px · '+securityMsg);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.GLP_SOURCE_QA=Object.freeze({
 getState:()=>({sourceKey,readerReady,playing,unitCount:units.length,lineCount:model?.lines.length||0,position:{...position},
                sourceApproved:false,learningStored:false,releaseAuthorized:false,
                guideLastIndex:model?.lines.length-1??null}),
 step:()=>step()
});
load('sohila').catch(e=>status('SOURCE BLOCKED: '+e.message));
