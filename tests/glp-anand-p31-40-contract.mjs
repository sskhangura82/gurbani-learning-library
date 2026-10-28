/* GLP-001 — Anand Sahib 31–40 source and editorial custody.
 * 52 new bilingual line drafts, 10 distinct pauri-level Study lessons.
 * No human religious reviews; source Pauri24 remains held.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const raw=p=>fs.readFileSync(path.join(root,p));
const j=p=>JSON.parse(raw(p));
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const old=j('nitnem/learning/course.v6.json'),now=j('nitnem/learning/course.v7.json');
const src=j('nitnem/data/anand.json'),manifest=j('nitnem/data/library.json');
const checks=[];function check(name,fn){fn();checks.push(name)}
check('Frozen V6 source teaching is unchanged at exact prior accepted SHA',()=>{
 assert.equal(sha(raw('nitnem/learning/course.v6.json')),'87250fa63632aa2402ac4b008119a65e207436be2e794913f723261095ebe859');
 assert.equal(old.coverage.closeTextOccurrenceNotes,337);
 assert.equal(old.coverage.writtenUnitLessons,94);
});
check('Anand original 40 pauris and 208 Gurmukhi source lines are unmodified',()=>{
 assert.equal(sha(raw('nitnem/data/anand.json')),manifest.entries.anand.sha256);
 assert.equal(src.units.length,40);
 assert.equal(src.units.reduce((sum,u)=>sum+u.lines.length,0),208);
 assert.equal(src.humanCollationApproved,false);
});
check('Anand P31–40 span is exactly 52 distinct original Gurmukhi occurrences',()=>{
 assert.deepEqual(src.units.slice(30).map(x=>x.id),Array.from({length:10},(_,i)=>'anand'+(i+31)));
 assert.equal(src.units.slice(30).reduce((sum,u)=>sum+u.lines.length,0),52);
});
check('All 337 earlier source-specific line meanings and 94 deeper lessons are preserved as authored',()=>{
 for(const [key,v] of Object.entries(old.closeTextNotes))assert.deepEqual(now.closeTextNotes[key],v,key);
 for(const [key,v] of Object.entries(old.unitLessons))assert.deepEqual(now.unitLessons[key],v,key);
});
check('Exactly 52 new line meanings and ten new Study lessons admitted without duplicate or omissions',()=>{
 const a=Object.keys(now.closeTextNotes).filter(k=>!Object.hasOwn(old.closeTextNotes,k));
 const b=Object.keys(now.unitLessons).filter(k=>!Object.hasOwn(old.unitLessons,k));
 assert.deepEqual(a,src.units.slice(30).flatMap(u=>u.lines.map(l=>'anand|'+l.id)));
 assert.deepEqual(b,src.units.slice(30).map(u=>'anand|'+u.id));
 assert.equal(a.length,52);assert.equal(b.length,10);
});
check('Each original Anand31–40 line has an independently source-SHA-bound English and Punjabi note',()=>{
 for(const u of src.units.slice(30))for(const l of u.lines){
  const n=now.closeTextNotes['anand|'+l.id];
  assert.ok(n,l.id);
  assert.equal(n.lineId,l.id);
  assert.equal(n.sourceSha256,l.sha256);
  assert.equal(sha(Buffer.from(l.text,'utf8')),l.sha256);
  assert.equal(n.status,'DRAFT_AI_UNREVIEWED');
  assert.equal(n.kind,'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION');
  assert.ok(n.simpleEn.length>=38,l.id);
  assert.ok(n.simplePa.length>=28&&/[\u0a00-\u0a7f]/u.test(n.simplePa),l.id);
  assert.ok(n.interpretiveCaution.length>=45,l.id);
 }
});
check('All ten deep units have meaningful unique close reading, working source vocabulary, context and teach-back',()=>{
 for(const u of src.units.slice(30)){
  const x=now.unitLessons['anand|'+u.id];
  assert.equal(x.status,'DRAFT_AI_UNREVIEWED');
  assert.equal(x.sourceAnchor.id,u.lines[0].id);
  assert.equal(x.sourceAnchor.sha256,u.lines[0].sha256);
  assert.ok(x.simple.en.length>80&&x.simple.pa.length>50,u.id);
  assert.ok(x.study.closeReading.length>250,u.id);
  assert.ok(x.study.words.length>=2,u.id);
  for(const w of x.study.words){
   assert.equal(w.status,'WORKING_GLOSS_NOT_APPROVED');
   assert.ok(u.lines.some(l=>l.text.includes(w.gurmukhi)),u.id+' source lacks '+w.gurmukhi);
  }
  assert.ok(x.study.interpretationCare.length>95);
  assert.ok(x.study.reflection.length>45&&x.study.teachBack.length>45);
 }
});
check('Pauri36 eye and 37 ear imagery never stigmatize people with visual or hearing disability',()=>{
 assert.ok(now.unitLessons['anand|anand36'].study.interpretationCare.toLowerCase().includes('blind'));
 assert.ok(now.unitLessons['anand|anand37'].study.interpretationCare.toLowerCase().includes('deaf'));
});
check('Anand38 tenth doorway not claimed medical anatomy or breath-control prescription',()=>{
 const x=now.unitLessons['anand|anand38'];
 assert.ok(x.study.interpretationCare.includes('anatomical'));
 assert.ok(x.study.interpretationCare.includes('breath-holding'));
});
check('Anand40 true illness/disease words are kept, with explicit non-treatment caveat',()=>{
 const x=now.unitLessons['anand|anand40'];
 assert.ok(x.study.closeReading.includes('dookh rog santaap'));
 assert.ok(x.study.interpretationCare.includes('medical care'));
 assert.ok(now.closeTextNotes['anand|anand40.line03'].simpleEn.includes('illness'));
});
check('Full source held Pauri24 untouched without ANY new line note or deep lesson',()=>{
 const h=src.units[23].lines.filter(x=>x.held);
 assert.deepEqual(h.map(x=>x.id),['anand24.line03']);
 assert.ok(!now.unitLessons['anand|anand24']);
 assert.equal(Object.keys(now.closeTextNotes).filter(x=>x.startsWith('anand|anand24.')).length,0);
});
check('No premature full Anand claim: one held pauri and 33 original Pauri1–7 line meanings unwritten',()=>{
 assert.equal(now.coverage.byBani.anand.draftLessons,39);
 assert.equal(now.coverage.byBani.anand.firstLineNotes,169);
 assert.equal(now.coverage.byBani.anand.sourceRecords,208);
 assert.equal(208-169,39);
});
check('Overall authored six-bani draft coverage 389/1361 lines, 104/327 deep lessons, zero human approval',()=>{
 assert.equal(now.coverage.sourceLineTotal,1361);
 assert.equal(now.coverage.closeTextOccurrenceNotes,389);
 assert.equal(now.coverage.unitTotal,327);
 assert.equal(now.coverage.writtenUnitLessons,104);
 assert.equal(now.coverage.reviewedUnitLessons,0);
 assert.equal(now.coverage.reviewedSourceMeaningLines,0);
 for(const n of ['jaap','savaiye','chaupai','rehras','sohila'])
  assert.deepEqual(now.coverage.byBani[n],old.coverage.byBani[n]);
});
check('V7 audit retains source custody, DRAFT editor and no family/public release',()=>{
 assert.equal(now.meta.revision,'ANAND_P31_40_COMPLETE_DEEP_EXCEPT24_V7');
 assert.equal(now.meta.previousVersion,'course.v6.json');
 assert.equal(now.meta.editorialStatus,'DRAFT_AI_UNREVIEWED');
 assert.equal(now.meta.publicationAllowed,false);
 assert.equal(now.meta.reviewer,null);
 assert.equal(now.meta.boundManifestSHA256,sha(raw('nitnem/data/library.json')));
 assert.equal(now.meta.baseSourceCommit,manifest.sourceCommit);
});
check('Reader loads exactly hashed V7, and does not call third-party text or AI service',()=>{
 const s=raw('nitnem/reader.js').toString('utf8');
 assert.ok(s.includes("const EXPECTED_LEARNING='"+sha(raw('nitnem/learning/course.v8.json'))+"'"));
 assert.ok(s.includes("jsonBytes('learning/course.v8.json',EXPECTED_LEARNING)"));
 assert.ok(s.includes('Gurmukhi occurrence hash changed'));
 assert.ok(!s.includes('fetch("https://'));
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,cases:checks,newAnandLineDrafts:52,newAnandDeepStudy:10,
 anandLineDrafts:169,anandStudyUnits:39,allAddedBaniLineDrafts:389,allAddedBaniDeepStudy:104,
 heldPauri24:true,qualifiedReligiousApprovals:0,familyPublicRelease:false},null,2));
