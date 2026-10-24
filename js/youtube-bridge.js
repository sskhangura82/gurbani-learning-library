/* GLP-001 YouTube consent, identifier and timing-map contracts.
   Never downloads captions, audiovisual data or reads microphone content. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GLP_YOUTUBE_BRIDGE=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const ID=/^[A-Za-z0-9_-]{11}$/;
 function parseVideoId(input){
  if(typeof input!=='string'||input.length>2048)return null;
  let url;try{url=new URL(input.trim());}catch{return null;}
  if(url.protocol!=='https:'||url.username||url.password||url.port)return null;
  const host=url.hostname.toLowerCase().replace(/\.$/,'');
  let candidate='';
  if(host==='youtu.be')candidate=url.pathname.split('/').filter(Boolean)[0]||'';
  else if(['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(host)){
   const parts=url.pathname.split('/').filter(Boolean);
   if(parts[0]==='watch')candidate=url.searchParams.get('v')||'';
   else if(['embed','shorts','live'].includes(parts[0]))candidate=parts[1]||'';
  }
  return ID.test(candidate)?candidate:null;
 }
 function validateTimingMap(map,{videoId,sourceRelease,occurrences,durationSec}){
  if(!map||map.videoId!==videoId||map.sourceRelease!==sourceRelease)return {valid:false,reason:'video/source mismatch'};
  if(!['line_checked','word_checked'].includes(map.reviewStatus))return {valid:false,reason:'timing not independently checked'};
  if(!Array.isArray(map.segments)||!map.segments.length||map.segments.length>50000)return {valid:false,reason:'invalid segments'};
  let previous=-Infinity;
  const valid=map.segments.every(segment=>{
   if(!segment||!occurrences.has(segment.occurrenceId))return false;
   const real=occurrences.get(segment.occurrenceId);
   if(segment.sha256!==real.sha256)return false;
   if(!Number.isFinite(segment.startSec)||!Number.isFinite(segment.endSec))return false;
   if(segment.startSec<0||segment.endSec<=segment.startSec||segment.startSec<previous)return false;
   if(Number.isFinite(durationSec)&&segment.endSec>durationSec+2)return false;
   if(map.reviewStatus==='word_checked'&&(!Number.isInteger(segment.wordIndex)||segment.wordIndex<0||segment.wordIndex>=real.tokenCount))return false;
   previous=segment.endSec;return true;
  });
  return valid?{valid:true,segments:map.segments}:{valid:false,reason:'unverified/invalid timing or source token mismatch'};
 }
 function segmentAt(segments,time){
  if(!Array.isArray(segments)||!Number.isFinite(time))return null;
  let lo=0,hi=segments.length-1;
  while(lo<=hi){const mid=(lo+hi)>>1,s=segments[mid];if(time<s.startSec)hi=mid-1;else if(time>=s.endSec)lo=mid+1;else return s;}
  return null;
 }
 function formatTime(seconds){const whole=Math.max(0,Math.floor(Number.isFinite(seconds)?seconds:0));return String(Math.floor(whole/60)).padStart(2,'0')+':'+String(whole%60).padStart(2,'0');}
 return Object.freeze({parseVideoId,validateTimingMap,segmentAt,formatTime});
});
