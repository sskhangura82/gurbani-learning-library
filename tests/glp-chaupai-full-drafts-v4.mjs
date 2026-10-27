/* GLP-001: verify EVERY source line of the named expanded-29 Chaupai
 * has a distinct English+Punjabi draft and ALL 29 pauris have a detailed
 * source-bound Study draft. Never infer authorized Sikh edition approval.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const ROOT=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const buf=x=>fs.readFileSync(path.join(ROOT,x));
const json=x=>JSON.parse(buf(x));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const old=json('nitnem/learning/course.v3.json');
const now=json('nitnem/learning/course.v4.json');
const source=json('nitnem/data/chaupai.json');
const library=json('nitnem/data/library.json');
const reader=buf('nitnem/reader.js').toString();
const notes=[];
function test(title,fn){fn();notes.push(title)}
test('Frozen original Dasam Chaupai 29-pauri digital candidate exact SHA is unchanged',()=>{
 assert.equal(source.originalCompositionId,'chaupai-website-expanded-29-variant');
 assert.equal(source.editionId,'dasam-chaupai-expanded-29-website-candidate-20261025');
 assert.equal(sha(buf('nitnem/data/chaupai.json')),library.entries.chaupai.sha256);
 assert.equal(source.unitCount,29);
 assert.equal(source.originalLineCount,116);
 assert.equal(source.humanCollationApproved,false);
 assert.equal(source.rightsCleared,false);
});
test('Three original introductory records are distinct from the 116 quatrain verse lines',()=>{
 assert.equal(source.preface.length,3);
 for(const e of source.preface)assert.equal(sha(Buffer.from(e.text,'utf8')),e.sha256);
 assert.equal(source.units.length,29);
 assert.equal(source.units.reduce((s,u)=>s+u.lines.length,0),116);
});
test('Previous frozen teaching V3 package remains intact and unchanged',()=>{
 assert.equal(sha(buf('nitnem/learning/course.v3.json')),'12cec4b2b04ce70d1230fd0e1f8454f82b8da79306671285eefe4b1852b1f626');
 assert.equal(old.coverage.writtenUnitLessons,50);
 assert.equal(old.coverage.closeTextOccurrenceNotes,111);
 for(const [k,v] of Object.entries(old.unitLessons))assert.deepEqual(now.unitLessons[k],v);
 for(const [k,v] of Object.entries(old.closeTextNotes))assert.deepEqual(now.closeTextNotes[k],v);
});
test('Exactly 112 NEW Chaupai line notes added and original 4 in Pauri 1 preserved',()=>{
 const added=Object.keys(now.closeTextNotes).filter(k=>!Object.hasOwn(old.closeTextNotes,k));
 assert.equal(added.length,112);
 assert.ok(added.every(k=>k.startsWith('chaupai|')));
 for(const l of source.units[0].lines){
  const key='chaupai|'+l.id;
  assert.deepEqual(now.closeTextNotes[key],old.closeTextNotes[key]);
 }
});
test('Exactly 22 genuinely NEW deeper Chaupai unit studies added, first seven preserved',()=>{
 const add=Object.keys(now.unitLessons).filter(k=>!Object.hasOwn(old.unitLessons,k));
 assert.equal(add.length,22);
 assert.ok(add.every(k=>k.startsWith('chaupai|')));
 assert.equal(now.coverage.byBani.chaupai.draftLessons,29);
 assert.equal(now.coverage.writtenUnitLessons,72);
 for(let i=0;i<7;i++){
  const id='chaupai|'+source.units[i].id;
  assert.deepEqual(now.unitLessons[id],old.unitLessons[id]);
 }
});
test('ALL 116 original source occurrences have unique, exact-SHA anchored English+Punjabi meaning notes',()=>{
 let count=0;
 for(const u of source.units){
  assert.equal(u.lines.length,4,u.id);
  for(const l of u.lines){
   const n=now.closeTextNotes['chaupai|'+l.id];
   assert.ok(n,l.id);
   assert.equal(n.sourceSha256,l.sha256);
   assert.equal(sha(Buffer.from(l.text,'utf8')),l.sha256);
   assert.equal(n.lineId,l.id);
   assert.equal(n.status,'DRAFT_AI_UNREVIEWED');
   assert.ok(n.simpleEn.length>22,l.id+' short English');
   assert.ok(n.simplePa.length>18&&/[\u0A00-\u0A7F]/u.test(n.simplePa),l.id+' Punjabi absent');
   assert.ok(n.interpretiveCaution.length>35,l.id+' no source-specific care');
   count++;
  }
 }
 assert.equal(count,116);
});
test('ALL 29 Chaupai pauri studies contain individual focus, close reading, glossary, reflection and teach-back',()=>{
 for(const u of source.units){
  const x=now.unitLessons['chaupai|'+u.id];
  assert.ok(x,u.id);
  assert.equal(x.status,'DRAFT_AI_UNREVIEWED');
  assert.equal(x.sourceAnchor.id,u.lines[0].id);
  assert.equal(x.sourceAnchor.sha256,u.lines[0].sha256);
  assert.ok(x.simple.en.length>45&&x.simple.pa.length>35,u.id);
  const s=x.study;
  assert.ok(s.focus.length>18&&s.closeReading.length>100,u.id);
  assert.ok(s.words.length>=2,u.id);
  assert.ok(s.interpretationCare.length>50,u.id);
  assert.ok(s.reflection.length>25&&s.teachBack.length>20,u.id);
  for(const w of s.words)assert.ok(u.lines.some(l=>l.text.includes(w.gurmukhi)),u.id+' missing source word '+w.gurmukhi);
 }
});
test('SGPC-bounded 25-pauri vs four expanded source pauris are NEVER silently merged',()=>{
 const u=source.units.map(x=>x.id);
 assert.ok(u[24].startsWith('chaupai-rehras25'));
 assert.deepEqual(u.slice(25),['chaupai-long26','chaupai-long27','chaupai-long28','chaupai-long29']);
 assert.ok(reader.includes("state.bani==='chaupai'&&index>=25"));
 assert.ok(reader.includes('Extended source · Pauri'));
 assert.ok(reader.includes('This pauri ends the SGPC-bounded Benti Chaupai excerpt'));
});
test('Extended Pauri 29 is identified as authorial date and location, NOT a miracle promise',()=>{
 const s=now.unitLessons['chaupai|chaupai-long29'];
 assert.ok(s.study.closeReading.includes('Sutlej'));
 assert.ok(s.study.interpretationCare.includes('Gregorian'));
 const l=now.closeTextNotes['chaupai|chaupai-long29.line04'];
 assert.ok(l.simpleEn.includes('Sutlej'));
});
test('Extended Pauri 28 miracle imagery warns against unsafe medical or disability claims',()=>{
 const s=now.unitLessons['chaupai|chaupai-long28'];
 assert.ok(s.study.interpretationCare.includes('speech'));
 assert.ok(s.study.interpretationCare.includes('clinical'));
 assert.ok(now.closeTextNotes['chaupai|chaupai-long28.line01'].interpretiveCaution.includes('NOT evidence'));
});
test('Historically charged group language in Pauri 20 is handled with interpretive responsibility',()=>{
 const x=now.unitLessons['chaupai|chaupai-rehras20'];
 assert.ok(x.study.interpretationCare.includes('malechh'));
 assert.ok(x.study.interpretationCare.includes('contemporary'));
 const note=now.closeTextNotes['chaupai|chaupai-rehras20.line04'];
 assert.ok(note.interpretiveCaution.toLowerCase().includes('do not equate contemporary'));
});
test('Final course v4 is bound to original source and still unapproved for family/public release',()=>{
 assert.equal(now.meta.revision,'CHAUPAI_COMPLETE_LINE_AND_STUDY_DRAFT_V4');
 assert.equal(now.meta.previousVersion,'course.v3.json');
 assert.equal(now.meta.boundManifestSHA256,sha(buf('nitnem/data/library.json')));
 assert.equal(now.meta.baseSourceCommit,library.sourceCommit);
 assert.equal(now.meta.editorialStatus,'DRAFT_AI_UNREVIEWED');
 assert.equal(now.meta.publicationAllowed,false);
 assert.equal(now.meta.reviewer,null);
 assert.equal(now.coverage.reviewedSourceMeaningLines,0);
 assert.equal(now.coverage.reviewedUnitLessons,0);
});
test('No false completeness claim: across six new banis we have 223/1361 and 72/327 editorial drafts',()=>{
 assert.equal(now.coverage.sourceLineTotal,1361);
 assert.equal(now.coverage.closeTextOccurrenceNotes,223);
 assert.equal(now.coverage.unitTotal,327);
 assert.equal(now.coverage.writtenUnitLessons,72);
 assert.equal(now.coverage.byBani.chaupai.firstLineNotes,116);
 assert.equal(now.coverage.byBani.chaupai.sourceRecords,116);
});
test('Previously completed Sohila and Savaiye remain complete with exactly identical learning records',()=>{
 for(const name of ['sohila','savaiye']){
  assert.deepEqual(now.coverage.byBani[name],old.coverage.byBani[name]);
  for(const [k,v] of Object.entries(old.closeTextNotes))if(k.startsWith(name+'|'))assert.deepEqual(now.closeTextNotes[k],v);
 }
 assert.equal(now.coverage.byBani.sohila.firstLineNotes,56);
 assert.equal(now.coverage.byBani.savaiye.firstLineNotes,40);
});
test('Quarantined Anand Pauri 24 line is still held, never given a fabricated translation',()=>{
 const a=json('nitnem/data/anand.json');
 const quarantine=a.units.flatMap(u=>u.lines).filter(l=>l.held);
 assert.deepEqual(quarantine.map(l=>l.id),['anand24.line03']);
 assert.ok(!now.closeTextNotes['anand|anand24.line03']);
});
test('Active private reader loads exact source SHA-bound V4; no new remote translation API',()=>{
 assert.ok(reader.includes("EXPECTED_LEARNING='"+sha(buf('nitnem/learning/course.v4.json'))+"'"));
 assert.ok(reader.includes("jsonBytes('learning/course.v4.json',EXPECTED_LEARNING)"));
 assert.ok(reader.includes('Gurmukhi occurrence hash changed'));
 assert.ok(!reader.includes('fetch("https://'));
});
console.log(JSON.stringify({status:'PASS',checks:notes.length,cases:notes,
 newChaupaiLineDrafts:112,fullChaupaiLineDrafts:116,newChaupaiDeepLessons:22,
 fullChaupaiDeepLessons:29,additionalNitnemSourceLines:1361,
 bilingualLineDrafts:223,deepUnitDrafts:72,editorApproved:0,
 publicFamilyPublished:false,unchangedOriginalText:true},null,2));
