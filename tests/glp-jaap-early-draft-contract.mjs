/* GLP-001 Jaap 1–15 source-only draft authoring.
 * 56 newly written EN/Punjabi source-anchored educational notes.
 * 8 new deeper Study drafts for Chhands 8–15, first 7 old deep unchanged.
 * No public release or claim of qualified Dasam/Braj review.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {jaapEarlyLines,jaapEarlyDeep} from '../tools/nitnem/jaap-chhands01-15-drafts.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const raw=x=>fs.readFileSync(path.join(root,x));
const json=x=>JSON.parse(raw(x));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const jaap=json('nitnem/data/jaap.json'),base=json('nitnem/learning/course.v7.json'),
 manifest=json('nitnem/data/library.json');
const tests=[];const test=(name,fn)=>{fn();tests.push(name)};
test('Original Jaap digital candidate unchanged, 199 chhands, 782 source lines',()=>{
 assert.equal(jaap.editionId,'jaap-199-digital-original-candidate-20261025');
 assert.equal(jaap.units.length,199);
 assert.equal(jaap.units.flatMap(u=>u.lines).length,782);
 assert.equal(sha(raw('nitnem/data/jaap.json')),manifest.entries.jaap.sha256);
 assert.equal(jaap.humanCollationApproved,false);
 assert.equal(jaap.rightsCleared,false);
});
test('Original first 15 Jaap chhands have 62 source occurrences, including 6 prior close notes',()=>{
 const src=jaap.units.slice(0,15).flatMap(u=>u.lines);
 assert.equal(src.length,62);
 const prev=src.filter(x=>base.closeTextNotes['jaap|'+x.id]);
 assert.deepEqual(prev.map(x=>x.id),['jaap001.line01','jaap001.line02','jaap002.line01','jaap002.line02','jaap002.line03','jaap002.line04']);
});
test('All 56 previously unwritten source-line educational drafts authored exactly once in frozen original sequence',()=>{
 const originals=jaap.units.slice(0,15).flatMap(u=>u.lines).filter(x=>!base.closeTextNotes['jaap|'+x.id]);
 assert.equal(originals.length,56);
 assert.deepEqual(jaapEarlyLines.map(x=>x.lineId),originals.map(x=>x.id));
});
test('All 56 drafts have substantive bilingual prose, exact original source SHA correspondence and honest uncertainty',()=>{
 const original=new Map(jaap.units.slice(0,15).flatMap(u=>u.lines).map(x=>[x.id,x]));
 for(const x of jaapEarlyLines){
  const s=original.get(x.lineId);
  assert.ok(s,x.lineId);
  assert.equal(sha(Buffer.from(s.text,'utf8')),s.sha256);
  assert.equal(x.bani,'jaap');
  assert.equal(x.editorialStatus,'DRAFT_AI_UNREVIEWED');
  assert.equal(x.meaningKind,'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION');
  assert.ok(x.simpleEn.length>42,x.lineId+' poor English');
  assert.ok(x.simplePa.length>30&&/[\u0a00-\u0a7f]/u.test(x.simplePa),x.lineId+' missing Punjabi');
  assert.ok(x.nuance.length>70,x.lineId+' lacks lexical/source caution');
 }
});
test('Chhand 1 two original short notes and Chhand 2 all four notes explicitly preserved',()=>{
 const keys=new Set(jaapEarlyLines.map(x=>x.lineId));
 for(const k of ['jaap001.line01','jaap001.line02','jaap002.line01','jaap002.line02','jaap002.line03','jaap002.line04'])
  assert.ok(!keys.has(k),k);
});
test('All eight newly written Jaap deep Study lessons have distinct Chhand source anchors',()=>{
 const ids=jaapEarlyDeep.map(x=>x.unitId);
 assert.deepEqual(ids,['jaap008','jaap009','jaap010','jaap011','jaap012','jaap013','jaap014','jaap015']);
 for(const id of ids)assert.ok(!base.unitLessons['jaap|'+id]);
});
test('Eight deep Jaap lessons use two exact-source vocabulary words, close reading, reflection and teach-back',()=>{
 for(const x of jaapEarlyDeep){
  const u=jaap.units.find(y=>y.id===x.unitId);
  assert.equal(x.editorialStatus,'DRAFT_AI_UNREVIEWED');
  assert.ok(x.simpleEn.length>65&&x.simplePa.length>50,x.unitId);
  const s=x.study;
  assert.ok(s.focus.length>15&&s.closeReading.length>210,x.unitId);
  assert.ok(s.words.length>=2,x.unitId);
  for(const [w,gloss] of s.words){
   assert.ok(u.lines.some(l=>l.text.includes(w)),x.unitId+' source missing '+w);
   assert.ok(gloss.length>10);
  }
  assert.ok(s.care.length>90);
  assert.ok(s.reflection.length>40&&s.teachBack.length>45);
 }
});
test('Historical Jaap1–7 deep lessons in same source are untouched by new raw manuscripts',()=>{
 assert.equal(Object.keys(base.unitLessons).filter(x=>x.startsWith('jaap|')).length,7);
 for(let i=1;i<=7;i++)assert.ok(base.unitLessons['jaap|jaap'+String(i).padStart(3,'0')]);
});
test('Provisional lexemes explicitly flagged in source-specific original notes',()=>{
 for(const id of ['jaap007.line01','jaap009.line03','jaap010.line03','jaap011.line03','jaap011.line04',
 'jaap012.line01','jaap013.line03','jaap014.line03','jaap015.line01']){
  const x=jaapEarlyLines.find(y=>y.lineId===id);
  assert.ok(x&&(/provisional|requires review|working|tentative|needs/i.test(x.simpleEn+' '+x.nuance)),id);
 }
});
test('Negative descriptions of Divine transcendence do not authorize caste hierarchy, moral harm or medical claims',()=>{
 for(const id of ['jaap005.line02','jaap006.line04','jaap015.line03']){
  const x=jaapEarlyLines.find(y=>y.lineId===id);
  assert.ok(x?.nuance.length>70,id);
 }
 assert.ok(jaapEarlyDeep.find(x=>x.unitId==='jaap015').study.care.includes('caste'));
});
test('No candidate source note is marked approved, published, certified santhiya or exact literal translation',()=>{
 assert.equal(base.meta.publicationAllowed,false);
 assert.equal(base.meta.reviewer,null);
 assert.ok(jaapEarlyLines.every(x=>x.editorialStatus==='DRAFT_AI_UNREVIEWED'));
 assert.ok(jaapEarlyDeep.every(x=>x.editorialStatus==='DRAFT_AI_UNREVIEWED'));
});
test('Source-only Jaap pilot does not mutate the current private reader, public Japji or previous lesson packages',()=>{
 assert.equal(sha(raw('nitnem/learning/course.v7.json')),'a7840f1086ee18039d4b39704c7058e823f0230be609192061cda3a3a335c527');
 assert.equal(sha(raw('nitnem/data/anand.json')),manifest.entries.anand.sha256);
 assert.equal(sha(raw('nitnem/data/rehras.json')),manifest.entries.rehras.sha256);
});
console.log(JSON.stringify({status:'PASS',checks:tests.length,cases:tests,
 authoredNewJaapLineDrafts:56,authoredNewDeepChhandLessons:8,
 sourceJaapLinesFirst15:62,preservedHistoricalJaapLineNotes:6,
 sourceChhandsTotal:199,sourceLinesTotal:782,
 scholarApproved:0,publicFamilyPublished:false},null,2));
