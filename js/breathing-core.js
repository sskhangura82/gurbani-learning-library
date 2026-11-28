/* Silent physiological pacing only. Timings are allowlisted; no sacred text or session state. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GLP_BREATHING=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';

 const ids=Object.freeze(['even','longer-exhale','box']);
 const paces=Object.freeze(['standard','shorter']);
 const labels=Object.freeze({in:'Breathe in',out:'Breathe out','hold-in':'Hold after inhaling','hold-out':'Hold after exhaling'});
 const definitions={
  even:{name:'Even breathing',standard:[['in',5],['out',5]],shorter:[['in',4],['out',4]]},
  'longer-exhale':{name:'Longer exhale',standard:[['in',4],['out',6]],shorter:[['in',3],['out',4]]},
  box:{name:'Box breathing',standard:[['in',4],['hold-in',4],['out',4],['hold-out',4]],shorter:[['in',3],['hold-in',3],['out',3],['hold-out',3]]}
 };
 const catalogue=new Map();
 for(const id of ids){
  for(const pace of paces){
   const definition=definitions[id];
   const phases=Object.freeze(definition[pace].map(([kind,seconds])=>Object.freeze({kind,durationMs:seconds*1000,label:labels[kind]})));
   catalogue.set(id+':'+pace,Object.freeze({
    kind:'physiology-tool',practice:'paced-breathing',id,name:definition.name,pace,
    adapted:pace==='shorter',hasHolds:id==='box',
    cycleMs:phases.reduce((total,phase)=>total+phase.durationMs,0),phases
   }));
  }
 }
 const allowed=new Set(catalogue.values());

 function getPattern(id='even',pace='standard'){
  if(typeof id!=='string'||typeof pace!=='string'||!ids.includes(id)||!paces.includes(pace))
   throw new RangeError('Choose an available breathing pattern and pace.');
  return catalogue.get(id+':'+pace);
 }

 const spec=getPattern();

 function frame(elapsedMs,pattern=spec){
  if(!allowed.has(pattern))throw new RangeError('Use a breathing pattern returned by getPattern.');
  const elapsed=Number.isFinite(elapsedMs)&&elapsedMs>=0?elapsedMs:0;
  const cycle=elapsed%pattern.cycleMs;
  let phaseIndex=0,phaseStart=0;
  while(phaseIndex<pattern.phases.length-1&&cycle>=phaseStart+pattern.phases[phaseIndex].durationMs){
   phaseStart+=pattern.phases[phaseIndex].durationMs;
   phaseIndex++;
  }
  const phase=pattern.phases[phaseIndex];
  const phaseElapsed=cycle-phaseStart;
  const phaseProgress=phaseElapsed/phase.durationMs;
  const eased=(1-Math.cos(Math.PI*phaseProgress))/2;
  const scale=phase.kind==='in'?.66+.34*eased:
   phase.kind==='out'?.66+.34*(1-eased):phase.kind==='hold-in'?1:.66;
  const remainingMs=phase.durationMs-phaseElapsed;
  const value={phase:phase.kind,label:phase.label,scale,phaseIndex,phaseProgress,
   remainingMs,remainingSeconds:Math.ceil(remainingMs/1000),cycleProgress:cycle/pattern.cycleMs};
  if(pattern.id==='box'){
   // Clockwise from the top-left corner: in, hold after in, out, hold after out.
   value.boxX=phaseIndex===0?phaseProgress:phaseIndex===1?1:phaseIndex===2?1-phaseProgress:0;
   value.boxY=phaseIndex===0?0:phaseIndex===1?phaseProgress:phaseIndex===2?1:1-phaseProgress;
  }
  return Object.freeze(value);
 }

 return Object.freeze({ids,paces,spec,getPattern,frame});
});
