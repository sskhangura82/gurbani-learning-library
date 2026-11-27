/* Optional silent breathing guide. All transient state dies when this page closes. */
(()=>{'use strict';
 const contract=window.GLP_BREATHING,root=document.documentElement;
 if(!contract||root.dataset.contentLayer!==contract.spec.kind||root.dataset.practiceKind!==contract.spec.practice)return;
 const $=id=>document.getElementById(id),stage=$('pacer-stage'),orb=$('pacer-orb'),phase=$('phase'),detail=$('phase-detail'),start=$('breathing-start'),stop=$('breathing-stop'),motion=$('show-motion'),state=$('breathing-state');
 const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
 let running=false,startedAt=0,animation=null,lastPhase='';
 function setMotion(){motion.disabled=preference.matches;$('motion-note').hidden=!preference.matches;stage.dataset.motion=motion.checked&&!preference.matches?'on':'off';}
 motion.checked=!preference.matches;setMotion();motion.addEventListener('change',setMotion);
 preference.addEventListener('change',()=>{if(preference.matches)motion.checked=false;setMotion();});
 function cancel(){if(animation!==null)cancelAnimationFrame(animation);animation=null;}
 function finish(message='Stopped. Continue with your normal breathing whenever you choose.'){
  running=false;cancel();lastPhase='';stage.dataset.state='ready';delete stage.dataset.phase;orb.style.transform='scale(.66)';
  phase.textContent='Ready when you are';detail.textContent='No need to follow a pace';start.hidden=false;start.textContent='Begin breathing guide';stop.hidden=true;state.textContent=message;
 }
 function render(now){
  if(!running)return;
  const value=contract.frame(now-startedAt);stage.dataset.phase=value.phase;
  if(stage.dataset.motion==='on')orb.style.transform='scale('+value.scale.toFixed(5)+')';
  if(value.phase!==lastPhase){phase.textContent=value.label;detail.textContent='Gently, without holding';lastPhase=value.phase;}
  animation=requestAnimationFrame(render);
 }
 start.disabled=false;state.textContent='Ready. The guide is silent and saves nothing.';
 start.addEventListener('click',()=>{
  if(running||document.hidden)return;
  running=true;startedAt=performance.now();lastPhase='';stage.dataset.state='running';start.hidden=true;stop.hidden=false;
  state.textContent='Follow only while comfortable. You can stop at any time.';stop.focus();render(startedAt);
 });
 stop.addEventListener('click',()=>{finish();start.focus();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)finish('Stopped when this page was hidden. Begin again only if you choose.');});
 window.addEventListener('pagehide',()=>{if(running)finish('Stopped when you left this page. Begin again only if you choose.');});
 window.addEventListener('pageshow',event=>{if(event.persisted)finish('Ready. Begin again only if you choose.');});
})();
