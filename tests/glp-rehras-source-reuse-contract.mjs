/* GLP-001 source provenance for Rehras SGGS/Dasam mixed witness.
 * Tests a mechanical rule, not human theological or rights permission.
 * 132 exact recurrent rows can share EXISTING draft teaching; 27 unique
 * original SGGS/Dasam records require separate context-specific summaries.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {deriveExactRehrasTeaching} from '../tools/nitnem/rehras-exact-source-reuse.mjs';
import {rehrasUniqueLineDrafts,rehrasUniqueDeepDrafts} from '../tools/nitnem/rehras-unique-source-drafts.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const bytes=x=>fs.readFileSync(path.join(root,x));
const json=x=>JSON.parse(bytes(x));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const packages={rehras:json('nitnem/data/rehras.json'),chaupai:json('nitnem/data/chaupai.json'),anand:json('nitnem/data/anand.json')};
const previous=json('nitnem/learning/course.v7.json');
const manifest=json('nitnem/data/library.json');
let cases=[];function check(name,fn){fn();cases.push(name);}
check('Source witness has exactly 44 mixed-family Rehras units and 159 original SHA records',()=>{
 assert.equal(packages.rehras.editionId,'sgpc-digital-composite-unreviewed-20261025');
 assert.equal(packages.rehras.units.length,44);
 assert.equal(packages.rehras.units.flatMap(u=>u.lines).length,159);
 assert.equal(sha(bytes('nitnem/data/rehras.json')),manifest.entries.rehras.sha256);
 assert.equal(packages.rehras.humanCollationApproved,false);
 assert.equal(packages.rehras.rightsCleared,false);
});
check('Historical source packages and prior seven versions are unchanged',()=>{
 assert.equal(manifest.sourceCommit,'373ccc34f4a1c0ccb6ce36654bf6e9574087200f');
 assert.equal(sha(bytes('nitnem/learning/course.v7.json')),'a7840f1086ee18039d4b39704c7058e823f0230be609192061cda3a3a335c527');
 assert.equal(previous.coverage.sourceLineTotal,1361);
 assert.equal(previous.coverage.closeTextOccurrenceNotes,389);
 assert.equal(previous.coverage.writtenUnitLessons,104);
});
const r=deriveExactRehrasTeaching({...packages,course:previous});
check('Exactly 31 complete source-identical units: Chaupai25, Anand1–5+40',()=>{
 assert.equal(r.evidence.matchedOriginalUnits,31);
 assert.equal(r.evidence.matchedOriginalSourceLines,132);
 assert.equal(r.evidence.allOriginalTextByteEqual,true);
});
check('All direct reuse is still draft educational explanation, source-SHA true, never newly approved',()=>{
 assert.equal(r.lineDrafts.length,106);
 assert.ok(r.lineDrafts.every(x=>x.bani==='rehras'&&x.editorialStatus==='DRAFT_AI_UNREVIEWED'));
 assert.ok(r.lineDrafts.every(x=>x.sourceContext.includes('REUSED_ONLY_AFTER_EXACT_SOURCE_SHA_MATCH')));
 assert.equal(r.evidence.pendingNoteSourceMatches.length,24);
 assert.equal(r.evidence.qualifiedReligiousApproval,false);
});
check('Exactly 28 complete source-hash-bound deep-unit reuse drafts; three original Rehras deep units retained',()=>{
 assert.equal(r.deepDrafts.length,28);
 assert.equal(r.evidence.priorRehrasStudyUnitsPreserved.length,3);
 const expected=['rehras.chaupai01','rehras.anand01','rehras.anand40'];
 assert.deepEqual(new Set(r.evidence.priorRehrasStudyUnitsPreserved.map(x=>x.rehrasUnitId)),new Set(expected));
});
check('Previously authored two direct Rehras lines are never overwritten by duplicate teaching',()=>{
 assert.equal(r.evidence.priorRehrasLineNotesPreserved.length,2);
 const expected=['rehras.chaupai-rehras01.line01','rehras.anand01.line01'];
 assert.deepEqual(new Set(r.evidence.priorRehrasLineNotesPreserved.map(x=>x.rehrasLineId)),new Set(expected));
 assert.ok(!r.lineDrafts.some(x=>expected.includes(x.lineId)));
});
check('Remaining 27 Rehras unique source records have one fully individual bilingual contextual source note',()=>{
 const unique=packages.rehras.units.filter(u=>!/^rehras\.(chaupai\d{2}|anand(?:0[1-5]|40))$/.test(u.id)).flatMap(u=>u.lines);
 assert.equal(unique.length,27);
 assert.equal(rehrasUniqueLineDrafts.length,27);
 assert.deepEqual(new Set(rehrasUniqueLineDrafts.map(x=>x.lineId)),new Set(unique.map(x=>x.id)));
 for(const note of rehrasUniqueLineDrafts){
  assert.equal(note.editorialStatus,'DRAFT_AI_UNREVIEWED');
  assert.equal(note.meaningKind,'AGGREGATED_SOURCE_RECORD_EDUCATIONAL_CONTEXT_NOT_LITERAL_TRANSLATION');
  assert.ok(note.sourceContext.includes('AGGREGATED_TUK_RECORD'));
  assert.ok(note.simpleEn.length>=60,note.lineId);
  assert.ok(note.simplePa.length>=55&&/[\u0a00-\u0a7f]/u.test(note.simplePa),note.lineId);
  assert.ok(note.nuance.length>=70,note.lineId);
 }
});
check('Independent SGGS07 and SGGS08 source excerpts have two detailed pauri studies bound to exact source words',()=>{
 assert.deepEqual(rehrasUniqueDeepDrafts.map(x=>x.unitId),['rehras.sggs07','rehras.sggs08']);
 for(const lesson of rehrasUniqueDeepDrafts){
  const u=packages.rehras.units.find(x=>x.id===lesson.unitId);
  assert.ok(lesson.simpleEn.length>60&&lesson.simplePa.length>55);
  assert.ok(lesson.study.closeReading.length>250);
  assert.ok(lesson.study.care.length>90);
  assert.ok(lesson.study.reflection.length>50&&lesson.study.teachBack.length>50);
  for(const [word] of lesson.study.words)assert.ok(u.lines.some(x=>x.text.includes(word)),lesson.unitId+' '+word);
 }
});
check('Unmatched evening Pae Gahe is NEVER silently reused from morning Sravag Sudh Savaiye',()=>{
 assert.ok(!r.lineDrafts.some(x=>x.lineId.startsWith('rehras.savaiya01')));
 assert.ok(rehrasUniqueLineDrafts.some(x=>x.lineId==='rehras.savaiya01.line01'));
});
check('Source mutation in one repeated Chaupai line REFUSES reuse even with the same source ID',()=>{
 const clone=structuredClone(packages);
 const u=clone.rehras.units.find(x=>x.id==='rehras.chaupai02');
 u.lines[0].text+='ਨਕਲ';
 assert.throws(()=>deriveExactRehrasTeaching({...clone,course:previous}),/SOURCE REUSE STOP.*Source original bytes differ/);
});
check('Source reordering within a repeated Anand pauri is refused',()=>{
 const clone=structuredClone(packages);
 const u=clone.rehras.units.find(x=>x.id==='rehras.anand02');
 [u.lines[0],u.lines[1]]=[u.lines[1],u.lines[0]];
 assert.throws(()=>deriveExactRehrasTeaching({...clone,course:previous}),/SOURCE REUSE STOP.*Source original bytes differ/);
});
check('Attempting to publish an approved/reviewer-promoted base course REFUSES all reuse',()=>{
 const bad=structuredClone(previous);
 bad.meta.publicationAllowed=true;
 assert.throws(()=>deriveExactRehrasTeaching({...packages,course:bad}),/SOURCE REUSE STOP.*review state/);
});
check('Can reach full 130 new repeated source notes ONLY after all 24 missing Anand notes are present',()=>{
 const simulated=structuredClone(previous);
 for(const item of r.evidence.pendingNoteSourceMatches){
  const baseKey=item.sourceBani+'|'+item.sourceLineId;
  simulated.closeTextNotes[baseKey]={
   lineId:item.sourceLineId,sourceSha256:item.sha256,
   status:'DRAFT_AI_UNREVIEWED',
   simpleEn:'SYNTHETIC QA FIXTURE — not publishable content, only a schema placeholder for a source-specific note.',
   simplePa:'ਇਹ ਸਿਰਫ਼ ਜਾਂਚ ਲਈ ਬਣਾਇਆ ਨਮੂਨਾ ਹੈ, ਇਸ ਨੂੰ ਅਸਲ ਅਰਥ ਵਜੋਂ ਕਦੇ ਪ੍ਰਕਾਸ਼ਿਤ ਨਹੀਂ ਕੀਤਾ ਜਾਣਾ ਚਾਹੀਦਾ।',
   interpretiveCaution:'Synthetic only: never publish this test wording, and never claim human interpretation approval.'
  };
 }
 const complete=deriveExactRehrasTeaching({...packages,course:simulated,requireAll:true});
 assert.equal(complete.lineDrafts.length,130);
 assert.equal(complete.evidence.pendingNoteSourceMatches.length,0);
 assert.equal(complete.deepDrafts.length,28);
});
check('Current prior course incomplete for 24 duplicated Anand records must be explicitly rejected in strict publish mode',()=>{
 assert.throws(()=>deriveExactRehrasTeaching({...packages,course:previous,requireAll:true}),/Some source notes not yet written: 24/);
});
console.log(JSON.stringify({status:'PASS',checks:cases.length,cases,
 exactSameSourceRecords:132,sourceSpecificDistinctRecords:27,
 oldCourseReusableDirectDrafts:106,oldCoursePendingAnandDrafts:24,
 futureCompleteDuplicateDrafts:130,
 deepStudiesReusable:28,independentDeepStudiesDrafted:2,
 releaseBlockedUntilV8AndEditorialReview:true,publicFamilyPublished:false},null,2));
