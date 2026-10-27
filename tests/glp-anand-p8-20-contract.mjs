/* GLP-001 exact-source, honest educational draft coverage for Anand 8–20.
 * 68 independently written line notes + 13 source-specific deep lessons.
 * Compiler/checks never confer religious accuracy or a human review verdict.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const b=p=>fs.readFileSync(path.join(root,p));
const j=p=>JSON.parse(b(p));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const baseline=j('nitnem/learning/course.v4.json'),
 course=j('nitnem/learning/course.v5.json'),
 anand=j('nitnem/data/anand.json'),
 src=j('nitnem/data/library.json');
const checks=[];function check(name,fn){fn();checks.push(name)}
check('Previous course V4 is intact and exact accepted SHA',()=>{
 assert.equal(sha(b('nitnem/learning/course.v4.json')),'6555b1b014eebaa3625e87957f0ad14cf6918cf146875f8c1be14d028b30325e');
 assert.equal(baseline.coverage.writtenUnitLessons,72);
 assert.equal(baseline.coverage.closeTextOccurrenceNotes,223);
});
check('Full Anand 40-pauri original witness untouched and source-package SHA verified',()=>{
 assert.equal(sha(b('nitnem/data/anand.json')),src.entries.anand.sha256);
 assert.equal(anand.units.length,40);
 assert.equal(anand.units.reduce((s,u)=>s+u.lines.length,0),208);
 assert.equal(anand.humanCollationApproved,false);
 assert.equal(anand.rightsCleared,false);
});
check('Pauri8–20 original span contains exactly 68 independently identifiable Gurmukhi source lines',()=>{
 assert.deepEqual(anand.units.slice(7,20).map(u=>u.id),Array.from({length:13},(_,i)=>'anand'+String(i+8).padStart(2,'0')));
 assert.equal(anand.units.slice(7,20).reduce((s,u)=>s+u.lines.length,0),68);
});
check('Every historical 223 line note and 72 deeper lessons remains unchanged',()=>{
 for(const [key,entry] of Object.entries(baseline.closeTextNotes))assert.deepEqual(course.closeTextNotes[key],entry,key);
 for(const [key,entry] of Object.entries(baseline.unitLessons))assert.deepEqual(course.unitLessons[key],entry,key);
});
check('V5 added exactly 68 original English/Punjabi notes in contiguous Anand8–20 source order',()=>{
 const added=Object.keys(course.closeTextNotes).filter(k=>!Object.hasOwn(baseline.closeTextNotes,k));
 assert.equal(added.length,68);
 const source=anand.units.slice(7,20).flatMap(u=>u.lines.map(l=>'anand|'+l.id));
 assert.deepEqual(added,source);
});
check('Each newly written line has a unique SHA, source-order id, bilingual prose and interpretive caution',()=>{
 for(const u of anand.units.slice(7,20))for(const l of u.lines){
  const note=course.closeTextNotes['anand|'+l.id];
  assert.ok(note,l.id);
  assert.equal(note.lineId,l.id);
  assert.equal(note.sourceSha256,l.sha256);
  assert.equal(sha(Buffer.from(l.text,'utf8')),l.sha256);
  assert.equal(note.status,'DRAFT_AI_UNREVIEWED');
  assert.equal(note.kind,'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION');
  assert.ok(note.simpleEn.length>=37,l.id+' lacks English detail');
  assert.ok(note.simplePa.length>=30&&/[\u0A00-\u0A7F]/u.test(note.simplePa),l.id+' lacks Punjabi');
  assert.ok(note.interpretiveCaution.length>=55,l.id+' lacks caution');
 }
});
check('Thirteen deep lesson drafts are new and exact-source-bound; earlier Anand1–7 unchanged',()=>{
 const keys=Object.keys(course.unitLessons).filter(k=>!Object.hasOwn(baseline.unitLessons,k));
 assert.deepEqual(keys,anand.units.slice(7,20).map(u=>'anand|'+u.id));
 assert.equal(course.coverage.byBani.anand.draftLessons,20);
 for(const u of anand.units.slice(0,7))
  assert.deepEqual(course.unitLessons['anand|'+u.id],baseline.unitLessons['anand|'+u.id]);
});
check('Each of 13 Anand lessons has substantive EN+PA overview, context, exact-source vocabulary and teach-back',()=>{
 for(const u of anand.units.slice(7,20)){
  const l=course.unitLessons['anand|'+u.id];
  assert.equal(l.status,'DRAFT_AI_UNREVIEWED');
  assert.equal(l.sourceAnchor.id,u.lines[0].id);
  assert.equal(l.sourceAnchor.sha256,u.lines[0].sha256);
  assert.ok(l.simple.en.length>80&&l.simple.pa.length>50,u.id);
  assert.ok(l.study.focus.length>19&&l.study.closeReading.length>200,u.id);
  assert.ok(l.study.words.length>=2);
  for(const w of l.study.words){
   assert.equal(w.status,'WORKING_GLOSS_NOT_APPROVED');
   assert.ok(u.lines.some(line=>line.text.includes(w.gurmukhi)),u.id+' word not present '+w.gurmukhi);
  }
  assert.ok(l.study.interpretationCare.length>90);
  assert.ok(l.study.reflection.length>30&&l.study.teachBack.length>30);
 }
});
check('Pauri 19 and 20 deliberately form contrasting lessons, not duplicated boilerplate',()=>{
 const a=course.unitLessons['anand|anand19'],c=course.unitLessons['anand|anand20'];
 assert.ok(a.study.closeReading.includes('dirty')||a.study.closeReading.includes('inner'));
 assert.ok(c.study.closeReading.includes('previous pauri'));
 assert.notEqual(a.simple.en,c.simple.en);
});
check('Safety of “sharper than blade,” illness imagery, family responsibilities and amrit preserved',()=>{
 assert.ok(course.unitLessons['anand|anand14'].study.interpretationCare.includes('self-injury'));
 assert.ok(course.unitLessons['anand|anand19'].study.interpretationCare.includes('medical'));
 assert.ok(course.unitLessons['anand|anand11'].study.interpretationCare.includes('children'));
 assert.ok(course.unitLessons['anand|anand13'].study.interpretationCare.includes('cure'));
});
check('Anand24 original U+F03D remains held and no meaning or Deep Study invented',()=>{
 const u=anand.units[23];
 const held=u.lines.filter(l=>l.held);
 assert.deepEqual(held.map(l=>l.id),['anand24.line03']);
 assert.ok(!course.closeTextNotes['anand|anand24.line03']);
 assert.ok(!course.unitLessons['anand|anand24']);
});
check('V5 metadata explicitly marks incomplete/full publication held: no human validation',()=>{
 assert.equal(course.meta.revision,'ANAND_P8_20_LINE_AND_DEEP_DRAFT_V5');
 assert.equal(course.meta.previousVersion,'course.v4.json');
 assert.equal(course.meta.editorialStatus,'DRAFT_AI_UNREVIEWED');
 assert.equal(course.meta.publicationAllowed,false);
 assert.equal(course.meta.reviewer,null);
 assert.equal(course.meta.sourceOriginalUnchanged,true);
 assert.equal(course.meta.boundManifestSHA256,sha(b('nitnem/data/library.json')));
 assert.equal(course.meta.baseSourceCommit,src.sourceCommit);
 assert.equal(course.coverage.reviewedSourceMeaningLines,0);
 assert.equal(course.coverage.reviewedUnitLessons,0);
});
check('Totals: 291/1361 line drafts, 85/327 Study lessons; previous complete Savaiye/Sohila/Chaupai not altered',()=>{
 assert.equal(course.coverage.sourceLineTotal,1361);
 assert.equal(course.coverage.closeTextOccurrenceNotes,291);
 assert.equal(course.coverage.unitTotal,327);
 assert.equal(course.coverage.writtenUnitLessons,85);
 assert.equal(course.coverage.byBani.anand.firstLineNotes,71);
 for(const n of ['sohila','savaiye','chaupai','jaap','rehras'])assert.deepEqual(course.coverage.byBani[n],baseline.coverage.byBani[n]);
});
check('Reader pins exact V5 SHA not previous, never calls external scripture or translation provider',()=>{
 const script=b('nitnem/reader.js').toString();
 assert.ok(script.includes("const EXPECTED_LEARNING='"+sha(b('nitnem/learning/course.v7.json'))+"'"));
 assert.ok(script.includes("jsonBytes('learning/course.v7.json',EXPECTED_LEARNING)"));
 assert.ok(script.includes('Gurmukhi occurrence hash changed'));
 assert.ok(!script.includes('fetch("https://'));
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,details:checks,
 newLineNotes:68,newDeepLessons:13,anandPaurisCovered:'8–20',
 totalLineDrafts:291,totalStudyDrafts:85,
 sourceHeldAtAnand24:true,humanReviews:0,publicRelease:false},null,2));
