/* GLP-001: pure reading state; immutable scripture is input, never edited here. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GLPContinuousCore=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 const finite=(x,f=0)=>Number.isFinite(x)?x:f;
 const integer=(x,f=0)=>Number.isInteger(x)?x:f;
 const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
 function flatten(units){
  const lines=[],starts=[],ids=new Set();
  units.forEach((unit,ui)=>{starts.push(lines.length);unit.lines.forEach((line,li)=>{
   if(typeof line.text!=='string'||typeof line.id!=='string'||ids.has(line.id))throw Error('Invalid original line occurrence');
   ids.add(line.id);const parts=line.text.split(/(\s+)/u).filter(p=>p!=='');
   const tokens=parts.filter(p=>!/^\s+$/u.test(p));if(!tokens.length)throw Error('Empty scripture line');
   lines.push(Object.freeze({id:line.id,text:line.text,sha256:line.sha256,ang:line.ang,unitIndex:ui,lineIndex:li,unitId:unit.id,unitTitle:unit.title,parts:Object.freeze(parts),tokens:Object.freeze(tokens)}));
  });});return {lines:Object.freeze(lines),starts:Object.freeze(starts),byId:new Map(lines.map((l,i)=>[l.id,i]))};
 }
 function advance(position,lines){
  const index=clamp(integer(position.index),0,lines.length-1),token=clamp(integer(position.token),0,lines[index].tokens.length-1);
  if(token+1<lines[index].tokens.length)return {index,token:token+1,finished:false,newLine:false};
  if(index+1<lines.length)return {index:index+1,token:0,finished:false,newLine:true};
  return {index,token,finished:true,newLine:false};
 }
 function normalise(input,model,units){
  const s=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
  let guideIndex=0,guideToken=0;
  if(s.guide&&typeof s.guide==='object'){guideIndex=integer(s.guide.index);guideToken=integer(s.guide.token);}
  else{const ui=clamp(integer(s.unit),0,units.length-1);guideIndex=model.starts[ui]+clamp(integer(s.line),0,units[ui].lines.length-1);guideToken=integer(s.token);}
  guideIndex=clamp(guideIndex,0,model.lines.length-1);guideToken=clamp(guideToken,0,model.lines[guideIndex].tokens.length-1);
  const id=s.read&&model.byId.has(s.read.id)?s.read.id:model.lines[guideIndex].id;
  const bookmarks=[];for(const saved of Array.isArray(s.bookmarks)?s.bookmarks:[]){
   let lineId=model.byId.has(saved)?saved:null;
   if(!lineId){const u=units.findIndex(x=>x.id===saved);if(u>=0)lineId=model.lines[model.starts[u]].id;}
   if(lineId&&!bookmarks.includes(lineId))bookmarks.push(lineId);
  }
  const notes=Object.create(null);if(s.notes&&typeof s.notes==='object')for(const key of Object.keys(s.notes))if(typeof s.notes[key]==='string'){const ui=units.findIndex(u=>u.id===key),id=model.byId.has(key)?key:ui>=0?model.lines[model.starts[ui]].id:null;if(id)notes[id]=s.notes[key].slice(0,12000);}
  return {version:2,persistentControls:s.persistentControls===true,hasGuided:typeof s.hasGuided==='boolean'?s.hasGuided:Boolean(s.guide||s.token||s.line),mode:['read','understand','study'].includes(s.mode)?s.mode:'read',theme:['day','amrit'].includes(s.theme)?s.theme:'day',radiance:typeof s.radiance==='boolean'?s.radiance:true,size:clamp(integer(s.size,30),24,48),pace:Number.isInteger(s.pace)&&s.pace>=50&&s.pace<=160&&s.pace%5===0?s.pace:70,emphasis:['word','line'].includes(s.emphasis)?s.emphasis:'word',guide:{index:guideIndex,token:guideToken},read:{id,offset:clamp(finite(s.read?.offset),-400,800)},bookmarks,notes};
 }
 function parseImport(text,model,units){
  if(typeof text!=='string'||text.length>2500000)throw Error('Learning file is too large.');
  let data;try{data=JSON.parse(text);}catch(_){throw Error('This is not a valid learning file.');}
  if(data?.project!=='GLP-001-continuous'||data?.schema!==2||!data.state||typeof data.state!=='object')throw Error('Choose a continuous-reader learning export (version 2).');
  return normalise(data.state,model,units);
 }
 function exportState(state){return JSON.stringify({project:'GLP-001-continuous',schema:2,exportedAt:new Date().toISOString(),state},null,2);}
 return Object.freeze({flatten,advance,normalise,parseImport,exportState});
});
