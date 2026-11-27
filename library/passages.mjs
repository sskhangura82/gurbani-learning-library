// Complete, already-carried source units only. No corpus-wide admission or interpretation.
import {PASSAGE_SOURCES,KNOWLEDGE_UNITS,CORPUS_COMMIT,PROJECTION_CONTRACT,CROSSWALK_PATH,CROSSWALK_SHA256} from './passage-contracts.mjs';
import {search as retrieve} from './search.mjs';
const decoder=new TextDecoder('utf-8',{fatal:true}),encoder=new TextEncoder();
const verified=new WeakMap();
const need=(value,code)=>{if(!value){const e=new Error(code);e.code=code;throw e;}};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export async function fingerprint(value){
 need(globalThis.crypto?.subtle,'SEARCH_CRYPTO');const bytes=typeof value==='string'?encoder.encode(value):value;
 return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
}
function bytes(input,limit){need(input instanceof ArrayBuffer||input instanceof Uint8Array,'SEARCH_BYTES');const raw=new Uint8Array(input instanceof ArrayBuffer?input.slice(0):input);need(raw.byteLength>0&&raw.byteLength<=limit,'SEARCH_SIZE');return raw;}
function parse(raw){try{return JSON.parse(decoder.decode(raw));}catch{need(false,'SEARCH_JSON');}}
const keys=(v,names)=>need(v&&typeof v==='object'&&!Array.isArray(v)&&same(Object.keys(v).sort(),[...names].sort()),'SEARCH_SCHEMA');
const ids=lines=>lines.map(l=>({id:l.id,sha256:l.sha256}));
export async function sourceUnits(sourceId,input){
 const binding=PASSAGE_SOURCES.find(s=>s.id===sourceId);need(binding,'SEARCH_SOURCE');
 const raw=bytes(input,1500000);need(await fingerprint(raw)===binding.sha256,'SEARCH_SOURCE_DIGEST');const pack=parse(raw),units=[];
 if(binding.format==='nitnem-source'){
  need(pack.schema==='GLP-NITNEM-SOURCE-V2'&&pack.compositionId===sourceId&&pack.editionId===binding.editionId&&pack.units.length===binding.unitCount,'SEARCH_SOURCE_IDENTITY');
  need(pack.humanCollationApproved===false&&pack.translationApproved===false&&pack.publicationStatus==='EDUCATIONAL_DRAFT','SEARCH_SOURCE_REVIEW');
  for(let i=0;i<pack.units.length;i++){
   const u=pack.units[i],lines=[...u.metricalHeadings,...u.lines];
   need(u.id==='sggs.'+sourceId+'.salok'+String(i+1).padStart(3,'0')&&u.ordinal===i+1&&u.lines.length===2,'SEARCH_COMPLETE_UNIT');
   units.push({sourceId,editionId:binding.editionId,id:u.id,digest:u.sourceDigest,lines:lines.map(l=>({id:l.id,text:l.text,sha256:l.sha256,kind:l.kind})),label:binding.label+' · Salok '+u.ordinal,href:sourceId+'/index.html?bani='+sourceId+'&unit='+u.ordinal,review:binding.review});
  }
 }else{
  need(pack.schema==='glp.scripture.pilot.v1'&&pack.edition.id===binding.editionId&&pack.passages.length===binding.unitCount,'SEARCH_SOURCE_IDENTITY');
  const occurrences=new Map(pack.occurrences.map(l=>[l.id,l]));
  for(let i=0;i<KNOWLEDGE_UNITS.length;i++){
   const expected=KNOWLEDGE_UNITS[i],u=pack.passages[i];need(u.id===expected.id&&u.occurrenceIds.length===u.expectedOccurrenceCount,'SEARCH_COMPLETE_UNIT');
   const lines=u.occurrenceIds.map(id=>{const l=occurrences.get(id);need(l&&l.passageId===u.id&&l.editionId===binding.editionId,'SEARCH_SOURCE_IDENTITY');return {id:l.id,text:l.text,sha256:l.textSha256,kind:l.kind};});
   need(await fingerprint(JSON.stringify([u.id,u.authorId,u.compositionId,u.raagId,u.pauriNumber,u.salokPosition,u.angStart,u.angEnd,lines.map(l=>[l.id,l.sha256])]))===u.passageSha256,'SEARCH_UNIT_DIGEST');
   units.push({sourceId,editionId:binding.editionId,id:u.id,digest:u.passageSha256,lines,label:expected.label,href:'knowledge/index.html#item='+encodeURIComponent(u.id),review:binding.review});
  }
 }
 for(const unit of units){
  need(new Set(unit.lines.map(l=>l.id)).size===unit.lines.length,'SEARCH_COMPLETE_UNIT');
  for(const line of unit.lines)need(typeof line.text==='string'&&await fingerprint(line.text)===line.sha256,'SEARCH_LINE_DIGEST');
  if(binding.format==='nitnem-source')need(await fingerprint(unit.lines.map(l=>l.id+'\t'+l.sha256).join('\n'))===unit.digest,'SEARCH_UNIT_DIGEST');
 }
 return units;
}
export function exactSequenceMatches(rows,unit){
 const matches=[];
 for(let start=0;start<=rows.length-unit.lines.length;start++){
  if(rows[start].textSha256!==unit.lines[0].sha256)continue;
  const selected=rows.slice(start,start+unit.lines.length);
  if(selected.every((row,i)=>row.textSha256===unit.lines[i].sha256&&row.text===unit.lines[i].text))matches.push(selected);
 }
 return matches;
}
export async function buildCrosswalkRecord(unit,rows){
 const matches=exactSequenceMatches(rows,unit),status=matches.length===1?'UNIQUE_COMPLETE_SEQUENCE':matches.length===0?'WITHHELD_NO_COMPLETE_SEQUENCE':'WITHHELD_AMBIGUOUS_SEQUENCE';
 const projected=await Promise.all(matches.map(async match=>({sequenceId:'sggs-witness-sequence-'+await fingerprint(match.map(r=>r.id).join('\n')),witnessIds:match.map(r=>r.id),sourcePaths:[...new Set(match.map(r=>r.sourcePath))],discrepancyIds:[...new Set(match.flatMap(r=>r.discrepancyIds))]})));
 return {sourceId:unit.sourceId,editionId:unit.editionId,unitId:unit.id,unitDigest:unit.digest,lines:ids(unit.lines),status,matches:projected};
}
export async function loadCompletePassages(loadBytes){
 need(typeof loadBytes==='function','SEARCH_LOADER');
 const raw=bytes(await loadBytes(CROSSWALK_PATH,1500000),1500000);need(await fingerprint(raw)===CROSSWALK_SHA256,'SEARCH_CROSSWALK_DIGEST');const crosswalk=parse(raw);
 keys(crosswalk,['schema','status','sourceCommit','projectionContractSha256','independentCollation','qualifiedApproval','sourceUnits','units']);
 need(crosswalk.schema==='glp.complete-passage-crosswalk.v1'&&crosswalk.status==='DEVELOPMENT_REVIEW'&&crosswalk.sourceCommit===CORPUS_COMMIT&&crosswalk.projectionContractSha256===PROJECTION_CONTRACT&&crosswalk.independentCollation===false&&crosswalk.qualifiedApproval===false,'SEARCH_CROSSWALK_IDENTITY');
 const all=(await Promise.all(PASSAGE_SOURCES.map(async s=>sourceUnits(s.id,await loadBytes(s.path,1500000))))).flat();
 need(crosswalk.sourceUnits===all.length&&crosswalk.units.length===all.length,'SEARCH_CROSSWALK_COVERAGE');
 const groups=new Map(),withheld=[];
 for(let i=0;i<all.length;i++){
  const unit=all[i],record=crosswalk.units[i];keys(record,['sourceId','editionId','unitId','unitDigest','lines','status','matches']);
  need(record.sourceId===unit.sourceId&&record.editionId===unit.editionId&&record.unitId===unit.id&&record.unitDigest===unit.digest&&same(record.lines,ids(unit.lines)),'SEARCH_CROSSWALK_BINDING');
  need(Array.isArray(record.matches)&&['UNIQUE_COMPLETE_SEQUENCE','WITHHELD_NO_COMPLETE_SEQUENCE','WITHHELD_AMBIGUOUS_SEQUENCE'].includes(record.status),'SEARCH_CROSSWALK_STATUS');
  if(record.status!=='UNIQUE_COMPLETE_SEQUENCE'){need(record.status==='WITHHELD_NO_COMPLETE_SEQUENCE'?record.matches.length===0:record.matches.length>=2,'SEARCH_CROSSWALK_STATUS');withheld.push({sourceId:unit.sourceId,unitId:unit.id,status:record.status});continue;}
  need(record.matches.length===1,'SEARCH_CROSSWALK_STATUS');const witness=record.matches[0];keys(witness,['sequenceId','witnessIds','sourcePaths','discrepancyIds']);
  need(witness.witnessIds.length===unit.lines.length&&new Set(witness.witnessIds).size===witness.witnessIds.length&&witness.witnessIds.every(id=>/^witness-og-[a-f0-9]{64}$/.test(id))&&witness.sequenceId==='sggs-witness-sequence-'+await fingerprint(witness.witnessIds.join('\n')),'SEARCH_WITNESS_ID');
  need(witness.sourcePaths.length>0&&witness.sourcePaths.every(p=>/^corpus\/ang-[0-9]{4}\.md$/.test(p))&&Array.isArray(witness.discrepancyIds),'SEARCH_WITNESS_ID');
  const route={sourceId:unit.sourceId,unitId:unit.id,editionId:unit.editionId,label:unit.label,href:unit.href,review:unit.review};
  if(groups.has(witness.sequenceId)){
   const group=groups.get(witness.sequenceId);need(same(group.lines.map(l=>l.text),unit.lines.map(l=>l.text)),'SEARCH_CROSSWALK_BINDING');group.routes.push(route);
  }else groups.set(witness.sequenceId,{id:witness.sequenceId,lines:unit.lines,routes:[route],witness});
 }
 const passages=[...groups.values()],catalog=freeze({status:'DEVELOPMENT_REVIEW',sourceUnits:all.length,uniqueCompletePassages:passages.length,withheld,passages,independentCollation:false,qualifiedApproval:false});
 const nodes=passages.map(p=>({id:p.id,type:'passage',title:p.routes[0].label,occurrenceIds:p.lines.map(l=>l.id)}));
 const index={graph:{nodes,edges:[]},passages:nodes,nodes:new Map(nodes.map(n=>[n.id,n])),occ:new Map(passages.flatMap(p=>p.lines.map(l=>[l.id,l])))};
 verified.set(catalog,index);return catalog;
}
export function searchCompletePassages(catalog,query,{mode='phrase'}={}){
 const index=verified.get(catalog);need(index,'SEARCH_UNVERIFIED_CATALOG');need(typeof query==='string'&&[...query].length<=240&&['phrase','first-letter','first-letter-anywhere'].includes(mode),'SEARCH_QUERY');
 const supported=/\p{Script=Gurmukhi}/u.test(query)&&!/[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Arabic}]/u.test(query);
 const matches=supported?retrieve(index,query,{mode}):[],byId=new Map(catalog.passages.map(p=>[p.id,p]));
 return {supported,mode,total:matches.length,matches:matches.map(hit=>({passage:byId.get(hit.id),matchedLineIds:hit.occurrenceIds,matchBasis:hit.matchBasis}))};
}
