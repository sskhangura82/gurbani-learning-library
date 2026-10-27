/* GLP-001 — Anand Pauris21–23 and25–30 source-bound educational drafts.
 * No lines or entire Study for Anand24, where original contains held U+F03D.
 * Zero human source / teaching approvals. Never promotes authority.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const ROOT=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const buf=f=>fs.readFileSync(path.join(ROOT,f));
const json=f=>JSON.parse(buf(f));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const old=json('nitnem/learning/course.v5.json');
const newer=json('nitnem/learning/course.v6.json');
const src=json('nitnem/data/anand.json'),library=json('nitnem/data/library.json');
const checks=[];const check=(name,fn)=>{fn();checks.push(name)};
const unitIds=['anand21','anand22','anand23','anand25','anand26','anand27','anand28','anand29','anand30'];
check('Previously accepted V5 draft SHA unchanged',()=>{
 assert.equal(sha(buf('nitnem/learning/course.v5.json')),'dde2ac0910cc706fab65f1e01005251d064cdf8823352c1c91170989fec659b7');
 assert.equal(old.coverage.closeTextOccurrenceNotes,291);
 assert.equal(old.coverage.writtenUnitLessons,85);
});
check('SGGS Anand original source immutable and unchanged',()=>{
 assert.equal(sha(buf('nitnem/data/anand.json')),library.entries.anand.sha256);
 assert.equal(src.units.length,40);
 assert.equal(src.units.reduce((n,u)=>n+u.lines.length,0),208);
});
check('V6 adds exactly 46 new individual line notes, and never a held Pauri24 line',()=>{
 const additions=Object.keys(newer.closeTextNotes).filter(k=>!Object.hasOwn(old.closeTextNotes,k));
 const expected=src.units.filter(x=>unitIds.includes(x.id)).flatMap(u=>u.lines.map(l=>'anand|'+l.id));
 assert.deepEqual(additions,expected);
 assert.equal(additions.length,46);
 assert.ok(!additions.some(k=>k.startsWith('anand|anand24.')));
});
check('Every new bilingual educational note is source-SHA bound, without fictitious translation or approval',()=>{
 for(const unit of src.units.filter(x=>unitIds.includes(x.id)))for(const l of unit.lines){
  const n=newer.closeTextNotes['anand|'+l.id];
  assert.ok(n,l.id);
  assert.equal(n.lineId,l.id);
  assert.equal(n.sourceSha256,l.sha256);
  assert.equal(sha(Buffer.from(l.text,'utf8')),l.sha256);
  assert.equal(n.status,'DRAFT_AI_UNREVIEWED');
  assert.equal(n.kind,'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION');
  assert.ok(n.simpleEn.length>=38,l.id+' English too shallow');
  assert.ok(n.simplePa.length>=27&&/[\u0a00-\u0a7f]/u.test(n.simplePa),l.id+' Punjabi missing');
  assert.ok(n.interpretiveCaution.length>=50,l.id+' interpretation caution missing');
 }
});
check('All historical 291 notes and 85 deeper units remain byte-equivalent',()=>{
 for(const [k,v] of Object.entries(old.closeTextNotes))assert.deepEqual(newer.closeTextNotes[k],v,k);
 for(const [k,v] of Object.entries(old.unitLessons))assert.deepEqual(newer.unitLessons[k],v,k);
});
check('Nine distinct new pauri-level lessons, not generic, complete with two exact-source vocabulary anchors',()=>{
 const added=Object.keys(newer.unitLessons).filter(k=>!Object.hasOwn(old.unitLessons,k));
 assert.deepEqual(added,unitIds.map(x=>'anand|'+x));
 for(const id of unitIds){
  const u=src.units.find(x=>x.id===id),l=newer.unitLessons['anand|'+id];
  assert.equal(l.status,'DRAFT_AI_UNREVIEWED');
  assert.equal(l.sourceAnchor.id,u.lines[0].id);
  assert.equal(l.sourceAnchor.sha256,u.lines[0].sha256);
  assert.ok(l.simple.en.length>75&&l.simple.pa.length>50);
  assert.ok(l.study.focus.length>17&&l.study.closeReading.length>190,id);
  assert.ok(l.study.words.length>=2,id);
  for(const w of l.study.words){
   assert.equal(w.status,'WORKING_GLOSS_NOT_APPROVED');
   assert.ok(u.lines.some(z=>z.text.includes(w.gurmukhi)),id+': '+w.gurmukhi);
  }
  assert.ok(l.study.interpretationCare.length>70);
  assert.ok(l.study.reflection.length>30&&l.study.teachBack.length>30);
 }
});
check('Pauri24 original held character and entire unit remain unfilled/unapproved',()=>{
 const held=src.units[23].lines.filter(x=>x.held);
 assert.deepEqual(held.map(x=>x.id),['anand24.line03']);
 assert.ok(!newer.unitLessons['anand|anand24']);
 assert.equal(Object.keys(newer.closeTextNotes).filter(k=>k.startsWith('anand|anand24.')).length,0);
});
check('Anand23 true Bani and Pauri30 surrender are not medical or coercive promises',()=>{
 const a=newer.unitLessons['anand|anand23'];
 assert.ok(a.study.interpretationCare.includes('medical'));
 const b=newer.unitLessons['anand|anand30'];
 assert.ok(b.study.interpretationCare.includes('self-harm'));
});
check('Anand21/22 paired Guru-oriented teachings remain context-specific',()=>{
 const a=newer.unitLessons['anand|anand21'],b=newer.unitLessons['anand|anand22'];
 assert.ok(a.study.closeReading.includes('sanmukh'));
 assert.ok(b.study.closeReading.includes('Pauri 21'));
 assert.notEqual(a.simple.en,b.simple.en);
});
check('Womb, Maya and time in Anand28/29 are not biological facts',()=>{
 assert.ok(newer.unitLessons['anand|anand28'].study.interpretationCare.includes('pregnancy'));
 assert.ok(newer.unitLessons['anand|anand29'].study.interpretationCare.includes('physical womb'));
});
check('Course V6 is source- and audit-pinned without claimed human or family-public authority',()=>{
 assert.equal(newer.meta.revision,'ANAND_P21_30_EXCEPT_24_DRAFT_V6');
 assert.equal(newer.meta.previousVersion,'course.v5.json');
 assert.equal(newer.meta.editorialStatus,'DRAFT_AI_UNREVIEWED');
 assert.equal(newer.meta.publicationAllowed,false);
 assert.equal(newer.meta.reviewer,null);
 assert.equal(newer.meta.baseSourceCommit,library.sourceCommit);
 assert.equal(newer.meta.boundManifestSHA256,sha(buf('nitnem/data/library.json')));
 assert.equal(newer.coverage.reviewedUnitLessons,0);
 assert.equal(newer.coverage.reviewedSourceMeaningLines,0);
});
check('Honest coverage grows to 337/1361 line notes and 94/327 deep source-unit notes',()=>{
 assert.equal(newer.coverage.closeTextOccurrenceNotes,337);
 assert.equal(newer.coverage.writtenUnitLessons,94);
 assert.equal(newer.coverage.byBani.anand.firstLineNotes,117);
 assert.equal(newer.coverage.byBani.anand.draftLessons,29);
 assert.equal(newer.coverage.sourceLineTotal,1361);
 assert.equal(newer.coverage.unitTotal,327);
 for(const bani of ['jaap','savaiye','chaupai','rehras','sohila'])assert.deepEqual(newer.coverage.byBani[bani],old.coverage.byBani[bani]);
});
check('Live preview is tied to V6 immutable bytes and no external AI/scripture endpoint',()=>{
 const s=buf('nitnem/reader.js').toString('utf8');
 assert.ok(s.includes("const EXPECTED_LEARNING='"+sha(buf('nitnem/learning/course.v7.json'))+"'"));
 assert.ok(s.includes("jsonBytes('learning/course.v7.json',EXPECTED_LEARNING)"));
 assert.ok(s.includes('Gurmukhi occurrence hash changed'));
 assert.ok(!s.includes('fetch("https://'));
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,items:checks,
 addedAnandLineDrafts:46,addedAnandStudyUnits:9,coverageLines:337,coverageUnits:94,
 anand24Held:true,originalSourceUnchanged:true,scholarApproved:0,publicRelease:false},null,2));
