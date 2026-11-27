/* GLP-001 M2: audit only, no change to scripture/editorial data or saved learning */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ctx={window:{}};
for(const file of ['js/japji-full-data.js','js/line-meanings.js','js/japji-lessons.js']){
  const code=fs.readFileSync(path.join(root,file),'utf8');
  vm.runInNewContext(code,ctx,{filename:file});
}
const full=ctx.window.GLP_FULL_JAPJI,meanings=ctx.window.GLP_LINE_MEANINGS,lessons=ctx.window.GLP_JAPJI_LESSONS.lessons;
assert.equal(full.units.length,42);
const original=full.units.flatMap(u=>u.lines.map(l=>({unitId:u.id,...l})));
assert.equal(original.length,385);
assert.equal(meanings.length,385);
const lineMap=new Map(original.map(l=>[l.id,l]));
const sourceHash=l=>crypto.createHash('sha256').update(l.text,'utf8').digest('hex');
const defects=[];
for(const l of original){
 if(sourceHash(l)!==l.sha256)defects.push({type:'source_sha',id:l.id});
}
for(const m of meanings){
 if(!lineMap.has(m.id))defects.push({type:'unknown_meaning_id',id:m.id});
 if(!m.english||!m.punjabi)defects.push({type:'bilingual_missing',id:m.id});
 if(m.status!=='draft')defects.push({type:'unexpected_translation_status',id:m.id,status:m.status});
}
if(new Set(meanings.map(m=>m.id)).size!==385)defects.push({type:'duplicate_meaning'});
const wordCount=x=>String(x??'').trim().split(/\s+/u).filter(Boolean).length;
const records=[];
let totalAnchors=0;
for(const u of full.units){
 const item=lessons[u.id];
 if(!item){defects.push({type:'missing_lesson',id:u.id});continue;}
 const sourceRefs=Array.isArray(item.sources)?item.sources:[];
 const anchors=Array.isArray(item.sourceAnchors)?item.sourceAnchors:[];
 totalAnchors+=anchors.length;
 for(const a of anchors){
  const l=lineMap.get(a.passageId);
  if(!l||l.sha256!==a.sha256||l.ang!==a.ang||l.unitId!==u.id)defects.push({type:'mismatched_lesson_source_anchor',id:u.id,line:a.passageId});
 }
 if(anchors.length!==u.lines.length)defects.push({type:'incomplete_lesson_anchors',id:u.id,actual:anchors.length,expected:u.lines.length});
 const fields=['meaningEn','meaningPa','directSense','directSensePa','context','vocabulary','pronunciation','interpretations','reflection','reflectionPa','teachBack','teachBackPa','sources'];
 const missing=fields.filter(field=>Array.isArray(item[field])?!item[field].length:!String(item[field]??'').trim());
 const hashes=Object.fromEntries(u.lines.map(l=>[l.id,l.sha256]));
 records.push({
  unitId:u.id,pauri:item.pauri??null,ang:u.angs,originalOccurrences:u.lines.length,
  englishMeaningWords:wordCount(item.meaningEn),punjabiMeaningWords:wordCount(item.meaningPa),
  directSenseWords:wordCount(item.directSense),punjabiDirectSenseWords:wordCount(item.directSensePa),
  contextWords:wordCount(item.context),interpretationWords:wordCount(item.interpretations),
  vocabularyEntries:Array.isArray(item.vocabulary)?item.vocabulary.length:0,
  citations:sourceRefs.length,sourceAnchors:anchors.length,
  originalIds:u.lines.map(l=>l.id),
  sourceHashes:hashes,status:item.status||'missing',humanReviewed:item.humanReviewed===true,
  missingFields:missing,researchStatus:item.researchStatus??null,
  mechanicalSeedPreserved:missing.length===0&&anchors.length===u.lines.length,
  editorialRecommendation:'TRIAGE_MANUALLY_BEFORE_REWRITE',
  editorialApproval:'NOT_ASSESSED'
 });
}
const findings={
 project:'GLP-001',subject:'M2 full Study corpus baseline audit',scope:'Mechanical integrity and structural completeness only; this audit does not judge Punjabi language quality or theological accuracy.',
 asOf:'2026-10-24',sourceRevision:'main R7',totalUnits:full.units.length,
 totalScriptureOccurrences:original.length,totalBilingualMeaningDrafts:meanings.length,
 totalLessonDrafts:Object.keys(lessons).length,totalSourceAnchors:totalAnchors,
 humansReviewed:records.filter(x=>x.humanReviewed).length,
 mechanicallyCompleteSeeds:records.filter(x=>x.mechanicalSeedPreserved).length,
 defects,records
};
const dest=path.join(root,'docs','research','M2_STUDY_BASELINE_AUDIT.json');
fs.mkdirSync(path.dirname(dest),{recursive:true});
fs.writeFileSync(dest,JSON.stringify(findings,null,2)+'\n','utf8');
const result={
 status:defects.length?'FAIL':'PASS',
 units:records.length,meanings:meanings.length,sourceOccurrences:original.length,
 humanReviewed:findings.humansReviewed,mechanicallyCompleteSeeds:findings.mechanicallyCompleteSeeds,
 defects:defects.length,firstFour:records.filter(r=>/^pauri0[1-4]$/.test(r.unitId)).map(x=>({id:x.unitId,vocabularyEntries:x.vocabularyEntries,sourceCount:x.citations,contextWords:x.contextWords,interpretationWords:x.interpretationWords}))
};
console.log(JSON.stringify(result,null,2));
if(defects.length)process.exitCode=1;
