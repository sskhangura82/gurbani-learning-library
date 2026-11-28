import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const core=require('../js/breathing-core.js');
const close=(actual,expected,tolerance=1e-9)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} is not close to ${expected}`);
const timings={
 even:{standard:[['in',5000],['out',5000]],shorter:[['in',4000],['out',4000]]},
 'longer-exhale':{standard:[['in',4000],['out',6000]],shorter:[['in',3000],['out',4000]]},
 box:{standard:[['in',4000],['hold-in',4000],['out',4000],['hold-out',4000]],shorter:[['in',3000],['hold-in',3000],['out',3000],['hold-out',3000]]}
};

test('The existing no-hold default and content boundary remain available',()=>{
 assert.equal(core.spec,core.getPattern());
 assert.equal(core.spec.kind,'physiology-tool');
 assert.equal(core.spec.practice,'paced-breathing');
 assert.equal(core.spec.id,'even');
 assert.equal(core.spec.hasHolds,false);
 assert.equal(core.spec.cycleMs,10000);
 assert.deepEqual(core.spec.phases.map(({kind,durationMs})=>[kind,durationMs]),timings.even.standard);
 assert.equal(core.frame(0).phase,'in');
 assert.equal(core.frame(4999).phase,'in');
 assert.equal(core.frame(5000).phase,'out');
 assert.equal(core.frame(9999).phase,'out');
 assert.equal(core.frame(10000).phase,'in');
 assert.equal(core.frame(0).scale,.66);
 assert.equal(core.frame(5000).scale,1);
 assert.equal(core.frame(10000).scale,.66);
});

for(const [id,variants] of Object.entries(timings)){
 for(const [pace,expected] of Object.entries(variants)){
  test(`${id} / ${pace}: exact boundaries, complete cycles and phase countdowns`,()=>{
   const pattern=core.getPattern(id,pace);
   assert.equal(pattern.id,id);
   assert.equal(pattern.pace,pace);
   assert.equal(pattern.adapted,pace==='shorter');
   assert.equal(pattern.hasHolds,id==='box');
   assert.deepEqual(pattern.phases.map(({kind,durationMs})=>[kind,durationMs]),expected);
   assert.equal(pattern.cycleMs,expected.reduce((total,[,duration])=>total+duration,0));
   let offset=0;
   for(let index=0;index<expected.length;index++){
    const [kind,duration]=expected[index];
    for(const cycle of [0,1,31,10000]){
     const start=cycle*pattern.cycleMs+offset;
     const atStart=core.frame(start,pattern);
     assert.equal(atStart.phase,kind);
     assert.equal(atStart.phaseIndex,index);
     assert.equal(atStart.phaseProgress,0);
     assert.equal(atStart.remainingMs,duration);
     assert.equal(atStart.remainingSeconds,duration/1000);
     const beforeEnd=core.frame(start+duration-1,pattern);
     assert.equal(beforeEnd.phase,kind);
     assert.equal(beforeEnd.remainingMs,1);
     assert.equal(beforeEnd.remainingSeconds,1);
     assert.equal(core.frame(start+duration,pattern).phase,expected[(index+1)%expected.length][0]);
    }
    const midpoint=core.frame(offset+duration/2,pattern);
    assert.equal(midpoint.phaseProgress,.5);
    close(midpoint.scale,kind==='hold-in'?1:kind==='hold-out'?.66:.83);
    close(midpoint.cycleProgress,(offset+duration/2)/pattern.cycleMs);
    offset+=duration;
   }
   assert.deepEqual(core.frame(pattern.cycleMs*43,pattern),core.frame(0,pattern));
  });

  test(`${id} / ${pace}: circle remains continuous and holds are stationary`,()=>{
   const pattern=core.getPattern(id,pace);
   let offset=0;
   for(const {kind,durationMs} of pattern.phases){
    const from=core.frame(offset,pattern).scale;
    const to=core.frame(offset+durationMs-0.01,pattern).scale;
    if(kind==='in'){assert.equal(from,.66);close(to,1,1e-8);}
    else if(kind==='out'){assert.equal(from,1);close(to,.66,1e-8);}
    else{assert.equal(from,to);assert.equal(from,kind==='hold-in'?1:.66);}
    close(to,core.frame(offset+durationMs,pattern).scale,1e-8);
    const almostEnd=core.frame(offset+durationMs-0.000001,pattern);
    assert.ok(almostEnd.scale>=.66&&almostEnd.scale<=1);
    for(let elapsed=offset;elapsed<offset+durationMs;elapsed+=17){
     const value=core.frame(elapsed,pattern);
     assert.ok(value.scale>=.66&&value.scale<=1);
     assert.ok(value.phaseProgress>=0&&value.phaseProgress<1);
     assert.ok(value.remainingMs>0&&value.remainingMs<=durationMs);
    }
    offset+=durationMs;
   }
  });
 }
}

test('Box position follows four sides and joins every corner continuously',()=>{
 for(const pace of core.paces){
  const pattern=core.getPattern('box',pace),duration=pattern.phases[0].durationMs;
  for(const [multiplier,x,y] of [[0,0,0],[.5,.5,0],[1,1,0],[1.5,1,.5],[2,1,1],[2.5,.5,1],[3,0,1],[3.5,0,.5],[4,0,0]]){
   const value=core.frame(duration*multiplier,pattern);
   assert.equal(value.boxX,x);assert.equal(value.boxY,y);
  }
  for(let index=1;index<=4;index++){
   const before=core.frame(index*duration-0.01,pattern),after=core.frame(index*duration,pattern);
   close(before.boxX,after.boxX,.00001);close(before.boxY,after.boxY,.00001);
  }
 }
 assert.equal(Object.hasOwn(core.frame(0),'boxX'),false);
 assert.equal(Object.hasOwn(core.frame(0),'boxY'),false);
});

test('No unsupported timing pattern or invalid selection can enter the engine',()=>{
 for(const id of ['unknown','__proto__','constructor','',null,42,{},['even']])assert.throws(()=>core.getPattern(id),RangeError);
 for(const pace of ['custom','',null,0,{}])assert.throws(()=>core.getPattern('even',pace),RangeError);
 for(const pattern of [null,{},core.spec.phases,{...core.spec},JSON.parse(JSON.stringify(core.spec)),{cycleMs:1,phases:[{kind:'hold-in',durationMs:1}]}])
  assert.throws(()=>core.frame(0,pattern),RangeError);
});

test('Bad elapsed values return the initial frame; the engine never stores progress',()=>{
 for(const pattern of core.ids.flatMap(id=>core.paces.map(pace=>core.getPattern(id,pace)))){
  const initial=core.frame(0,pattern);
  for(const elapsed of [-1,-Infinity,Infinity,NaN,undefined,null,'5000',{},1n])assert.deepEqual(core.frame(elapsed,pattern),initial);
  const earlier=core.frame(1234,pattern);
  core.frame(56789,pattern);
  core.frame(0,core.getPattern('box','shorter'));
  assert.deepEqual(core.frame(1234,pattern),earlier);
 }
});

test('Exported configuration, phases and frames cannot be mutated',()=>{
 assert.ok(Object.isFrozen(core)&&Object.isFrozen(core.ids)&&Object.isFrozen(core.paces));
 for(const id of core.ids){
  for(const pace of core.paces){
   const pattern=core.getPattern(id,pace);
   assert.ok(Object.isFrozen(pattern)&&Object.isFrozen(pattern.phases)&&pattern.phases.every(Object.isFrozen));
   assert.throws(()=>{pattern.phases[0].durationMs=999999;},TypeError);
   assert.throws(()=>{pattern.phases.push({kind:'hold-in',durationMs:999999});},TypeError);
   const value=core.frame(1,pattern);
   assert.ok(Object.isFrozen(value));
   assert.throws(()=>{value.scale=5;},TypeError);
   assert.equal(core.getPattern(id,pace),pattern);
  }
 }
});
