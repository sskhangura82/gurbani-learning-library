/* This fixed two-phase physiological timing contract has no scripture or Simran inputs. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GLP_BREATHING=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const spec=Object.freeze({kind:'physiology-tool',practice:'paced-breathing',cycleMs:10000,
  phases:Object.freeze([Object.freeze({kind:'in',durationMs:5000,label:'Breathe in'}),Object.freeze({kind:'out',durationMs:5000,label:'Breathe out'})])});
 function frame(elapsedMs){
  const elapsed=Number.isFinite(elapsedMs)&&elapsedMs>=0?elapsedMs:0;
  const cycle=elapsed%spec.cycleMs,phase=cycle<spec.phases[0].durationMs?spec.phases[0]:spec.phases[1];
  return Object.freeze({phase:phase.kind,label:phase.label,scale:.66+.34*(.5-.5*Math.cos(2*Math.PI*cycle/spec.cycleMs))});
 }
 return Object.freeze({spec,frame});
});
