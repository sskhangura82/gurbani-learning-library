/* GLP-001: ALL 40 Sravag Sudh source verse lines now have separately
 * authored English + Punjabi educational drafts, not human-certified
 * translations. Source original and all V1/V2 teaching immutable.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const ROOT=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const buf=p=>fs.readFileSync(path.join(ROOT,p));
const text=p=>buf(p).toString('utf8');
const json=p=>JSON.parse(text(p));
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const old=json('nitnem/learning/course.v2.json'),
      course=json('nitnem/learning/course.v3.json'),
      root=json('nitnem/data/library.json'),
      original=json('nitnem/data/savaiye.json');
const tests=[];const check=(n,fn)=>{fn();tests.push(n);};
check('Previously frozen V2 lesson file is still SHA-identical',()=>{
 assert.equal(sha(buf('nitnem/learning/course.v2.json')),'2a8e083779593b02f40d3f12204d9d0c18926baf4f5997dba140abc7743539d1');
 assert.equal(old.coverage.closeTextOccurrenceNotes,73);
});
check('V3 source manifest and authoring provenance match frozen original research',()=>{
 assert.equal(course.meta.editorialStatus,'DRAFT_AI_UNREVIEWED');
 assert.equal(course.meta.revision,'SAVAIYE_COMPLETE_LINE_DRAFT_V3');
 assert.equal(course.meta.previousVersion,'course.v2.json');
 assert.equal(course.meta.boundManifestSHA256,sha(buf('nitnem/data/library.json')));
 assert.equal(course.meta.baseSourceCommit,'373ccc34f4a1c0ccb6ce36654bf6e9574087200f');
 assert.equal(sha(buf('nitnem/data/savaiye.json')),root.entries.savaiye.sha256);
});
check('Original Savaiye text includes ten four-line stanzas and three separately verified original preface records',()=>{
 assert.equal(original.unitCount,10);
 assert.equal(original.originalLineCount,40);
 assert.equal(original.units.reduce((x,u)=>x+u.lines.length,0),40);
 assert.equal(original.preface.length,3);
 for(const entry of original.preface)assert.equal(sha(Buffer.from(entry.text,'utf8')),entry.sha256);
});
check('V2 Sohila 56/56 and all original 50 deep-unit lesson drafts remain unchanged',()=>{
 assert.deepEqual(course.banis,old.banis);
 assert.deepEqual(course.unitLessons,old.unitLessons);
 for(const [key,meaning] of Object.entries(old.closeTextNotes))assert.deepEqual(course.closeTextNotes[key],meaning);
});
check('Exactly 38 newly authored Savaiye line notes were added, not duplicated or substituted',()=>{
 const next=new Set(Object.keys(course.closeTextNotes));
 const prev=new Set(Object.keys(old.closeTextNotes));
 const added=[...next].filter(x=>!prev.has(x));
 assert.equal(added.length,38);
 assert.ok(added.every(x=>x.startsWith('savaiye|')));
 assert.equal(next.size,111);
 assert.equal(course.coverage.closeTextOccurrenceNotes,111);
});
check('Every one of 40 Savaiye source lines has a unique exact SHA-pinned bilingual note',()=>{
 let total=0;
 const seen=new Set();
 for(const unit of original.units)for(const line of unit.lines){
  const key='savaiye|'+line.id,note=course.closeTextNotes[key];
  assert.ok(note,key+' missing');
  assert.ok(!seen.has(key));seen.add(key);
  assert.equal(note.sourceSha256,line.sha256,key);
  assert.equal(sha(Buffer.from(line.text,'utf8')),line.sha256,key);
  assert.equal(note.lineId,line.id,key);
  assert.equal(note.status,'DRAFT_AI_UNREVIEWED');
  assert.equal(note.kind,'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION');
  assert.ok(note.simpleEn.length>=45,key+' too short');
  assert.ok(note.simplePa.length>=32&&/[\u0a00-\u0a7f]/u.test(note.simplePa),key+' Punjabi missing');
  assert.ok(note.interpretiveCaution.length>=45,key+' caution missing');
  total++;
 }
 assert.equal(total,40);
});
check('All ten Savaiye have four distinct original and meaning rows',()=>{
 for(let i=1;i<=10;i++){
  const u=original.units[i-1];
  assert.equal(u.lines.length,4);
  assert.equal(u.lines.filter(l=>!!course.closeTextNotes['savaiye|'+l.id]).length,4);
 }
});
check('Exactly two older Savaiye notes and 38 new ones preserve their original source text',()=>{
 for(const id of ['savaiye09.line04','savaiye04.line01']){
  const key='savaiye|'+id;
  assert.deepEqual(course.closeTextNotes[key],old.closeTextNotes[key]);
 }
 assert.equal(course.coverage.byBani.savaiye.firstLineNotes,40);
 assert.equal(old.coverage.byBani.savaiye.firstLineNotes,2);
});
check('Sohila and all other non-Savaiye per-bani coverage and data remain unchanged',()=>{
 for(const [name,counts] of Object.entries(old.coverage.byBani))if(name!=='savaiye'){
  assert.deepEqual(course.coverage.byBani[name],counts,name);
 }
 assert.equal(course.coverage.byBani.sohila.firstLineNotes,56);
 assert.equal(course.coverage.byBani.jaap.firstLineNotes,6);
});
check('Full additional Nitnem 1361 original lines, only 111 drafts, zero certified translations',()=>{
 assert.equal(course.coverage.sourceLineTotal,1361);
 assert.equal(course.coverage.unitTotal,327);
 assert.equal(course.coverage.writtenUnitLessons,50);
 assert.equal(course.coverage.closeTextOccurrenceNotes,111);
 assert.equal(course.coverage.reviewedSourceMeaningLines,0);
 assert.equal(course.coverage.reviewedUnitLessons,0);
 assert.equal(course.meta.publicationAllowed,false);
 assert.equal(course.meta.reviewer,null);
});
check('Anand quarantined source remains withheld from teaching',()=>{
 const anand=json('nitnem/data/anand.json');
 const held=anand.units.flatMap(u=>u.lines).filter(x=>x.held);
 assert.deepEqual(held.map(x=>x.id),['anand24.line03']);
 assert.ok(!course.closeTextNotes['anand|anand24.line03']);
});
check('New source editor cannot substitute Rehras evening Savaiya for morning Sravag Sudh',()=>{
 assert.equal(original.originalCompositionId,'tav-prasad-savaiye');
 assert.ok(course.closeTextNotes['savaiye|savaiye09.line04']);
 assert.ok(!course.closeTextNotes['rehras|savaiye09.line04']);
});
check('No runtime external translation calls; pinned course SHA and original immutability checks retained',()=>{
 const script=text('nitnem/reader.js');
 assert.ok(script.includes("const EXPECTED_LEARNING='"+sha(buf('nitnem/learning/course.v6.json'))+"'"));
 assert.ok(script.includes("jsonBytes('learning/course.v6.json',EXPECTED_LEARNING)"));
 assert.ok(script.includes('Gurmukhi occurrence hash changed'));
 assert.ok(!script.includes('fetch("https://'));
});
check('Original poetry about other traditions includes caution, not disrespect or violence instructions',()=>{
 for(const id of ['savaiye01.line01','savaiye04.line02','savaiye05.line01','savaiye08.line03','savaiye10.line02']){
  const x=course.closeTextNotes['savaiye|'+id];
  assert.ok(x?.interpretiveCaution.length>=45,id);
 }
});
console.log(JSON.stringify({status:'PASS',checks:tests.length,cases:tests,
 newBilingualLineDrafts:38,fullyDraftedSavaiyeOriginalVerseLines:40,
 totalBilingualLineDrafts:111,totalOriginalNonJapjiLines:1361,
 qualifiedScholarApprovals:0,publishedFamilyRelease:false},null,2));
