/* GLP-001 SOHILA 56 / 56 complete authoring candidate. NOT religiously approved.
 * This test protects immutable SGGS original, v1 course, per-record occurrence,
 * prose provenance, explicit heading-vs-verse classification and prior coverage.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const ROOT=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read=f=>fs.readFileSync(path.join(ROOT,f));
const json=f=>JSON.parse(read(f));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const old=json('nitnem/learning/course.v1.json');
const now=json('nitnem/learning/course.v2.json');
const source=json('nitnem/data/sohila.json');
const library=json('nitnem/data/library.json');
const ui=read('nitnem/learning/learning-ui.js').toString();
const script=read('nitnem/reader.js').toString();
const checks=[];const test=(n,fn)=>{fn();checks.push(n);};
test('V1 course remains preserved at exact accepted SHA-256',()=>{
 assert.equal(sha(read('nitnem/learning/course.v1.json')),'5dc9f9dd1b3a8e882763ce48ee654200f84d34179df157eeb303da59f1258c57');
 assert.equal(old.coverage.closeTextOccurrenceNotes,20);
});
test('V2 source manifests and original SGGS/Dasam edition stay byte-bound',()=>{
 assert.equal(now.meta.boundManifestSHA256,sha(read('nitnem/data/library.json')));
 assert.equal(now.meta.baseSourceCommit,library.sourceCommit);
 assert.equal(sha(read('nitnem/data/sohila.json')),library.entries.sohila.sha256);
});
test('Human authorization stays NOT APPROVED, including for newly drafted lines',()=>{
 assert.equal(now.meta.editorialStatus,'DRAFT_AI_UNREVIEWED');
 assert.equal(now.meta.publicationAllowed,false);
 assert.equal(now.meta.reviewer,null);
 assert.equal(now.coverage.reviewedSourceMeaningLines,0);
 assert.equal(now.coverage.reviewedUnitLessons,0);
});
test('All previous 50 unit lessons survive V2 without modification',()=>{
 assert.deepEqual(now.unitLessons,old.unitLessons);
 assert.deepEqual(now.banis,old.banis);
});
test('All 20 original line meanings preserved verbatim and SHA-anchored',()=>{
 for(const [id,meaning] of Object.entries(old.closeTextNotes))
  assert.deepEqual(now.closeTextNotes[id],meaning,'Historical V1 text mutated '+id);
});
test('Exactly 53 NEW Sohila line drafts added, no other bani modified',()=>{
 const additions=Object.keys(now.closeTextNotes).filter(x=>!Object.hasOwn(old.closeTextNotes,x));
 assert.equal(additions.length,53);
 assert.ok(additions.every(x=>x.startsWith('sohila|')));
 for(const [bani,entry] of Object.entries(now.coverage.byBani)){
  assert.equal(entry.draftLessons,old.coverage.byBani[bani].draftLessons);
  if(bani!=='sohila')assert.deepEqual(entry,old.coverage.byBani[bani]);
 }
});
test('Exact new coverage 73/1361 source records; Sohila 56 of 56, all five shabads',()=>{
 assert.equal(now.coverage.closeTextOccurrenceNotes,73);
 assert.equal(now.coverage.byBani.sohila.firstLineNotes,56);
 assert.equal(now.coverage.byBani.sohila.sourceRecords,56);
 assert.equal(source.units.length,5);
 assert.equal(source.units.reduce((t,u)=>t+u.lines.length,0),56);
});
test('Every SOHILA source occurrence has exactly one specific English/Punjabi explanation with its original line SHA',()=>{
 const seen=new Set();
 for(const unit of source.units)for(const line of unit.lines){
  const key='sohila|'+line.id,entry=now.closeTextNotes[key];
  assert.ok(entry,'Unwritten source occurrence '+key);
  assert.ok(!seen.has(key),'Duplicate occurrence '+key);
  seen.add(key);
  assert.equal(entry.sourceSha256,line.sha256,key);
  assert.equal(sha(Buffer.from(line.text,'utf8')),line.sha256,key);
  assert.equal(entry.lineId,line.id,key);
  assert.equal(entry.status,'DRAFT_AI_UNREVIEWED');
  assert.ok(entry.simpleEn.length>=25,key);
  assert.ok(/[\u0A00-\u0A7F]/u.test(entry.simplePa),key+' missing actual Punjabi');
  assert.ok(entry.simplePa.length>15,key);
  assert.ok(entry.interpretiveCaution.length>=30,key);
 }
 assert.equal(seen.size,56);
});
test('Raag/Guru heading records and opening invocation never misrepresented as devotional literal translation',()=>{
 const headings=new Set(['sohila01.line01','sohila01.line02','sohila02.line01',
 'sohila03.line01','sohila04.line01','sohila05.line01']);
 const meta=Object.entries(now.closeTextNotes).filter(([key,val])=>key.startsWith('sohila|')&&val.kind==='HEADING_OR_INVOCATION_CONTEXT');
 assert.equal(meta.length,6);
 assert.deepEqual(new Set(meta.map(([key])=>key.split('|')[1])),headings);
 for(const [key,entry] of meta)assert.ok(entry.simpleEn.includes('heading')||entry.simpleEn.includes('invocation'),key);
});
test('Sohila remaining 50 records are labeled educational drafts, not exact canonical Gurbani translation',()=>{
 const scripture=Object.entries(now.closeTextNotes).filter(([key,val])=>key.startsWith('sohila|')&&val.kind!=='HEADING_OR_INVOCATION_CONTEXT');
 assert.equal(scripture.length,50);
 assert.ok(scripture.every(([,x])=>x.kind==='SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION'));
});
test('Sohila V2 immutable and current V3 reader source-pinned with no external APIs',()=>{
 assert.ok(script.includes('learning/course.v5.json'));
 assert.ok(!script.includes('jsonBytes("https://'));
 assert.ok(script.includes("EXPECTED_LEARNING='"+sha(read('nitnem/learning/course.v5.json'))+"'"));
 assert.ok(ui.includes("e.kind==='HEADING_OR_INVOCATION_CONTEXT'"));
 assert.ok(ui.includes('Draft meaning · tap to explore'));
 assert.ok(script.includes('Gurmukhi occurrence hash changed'));
});
test('Original Anand Pauri24 held line remains quarantined without new meaning',()=>{
 const anand=json('nitnem/data/anand.json');
 const held=anand.units.flatMap(u=>u.lines).filter(x=>x.held);
 assert.deepEqual(held.map(x=>x.id),['anand24.line03']);
 assert.ok(!now.closeTextNotes['anand|anand24.line03']);
});
test('No additional modern teeka text, recorded pronunciation or service tracking imported',()=>{
 for(const f of ['nitnem/learning/course.v2.json','tools/nitnem/sohila-line-drafts.mjs']){
  const t=read(f).toString('utf8');
  assert.ok(!t.includes('cloudVoice')&&!t.includes('advertisingPixel'));
 }
 assert.ok(!script.includes('fetch("https://'));
});
test('Original Jaap, Anand, Rehras, Savaiye and Chaupai coverage still honestly incomplete',()=>{
 for(const b of ['jaap','anand','rehras','savaiye','chaupai']){
  assert.equal(now.coverage.byBani[b].firstLineNotes,old.coverage.byBani[b].firstLineNotes);
 }
 assert.equal(now.coverage.byBani.jaap.firstLineNotes,6);
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,cases:checks,
 totalSohilaSourceRecords:56,sohilaAuthoredLineDrafts:56,
 totalBaniRecords:1361,totalBaniAuthoredLineDrafts:73,netNewLineDrafts:53,
 unchangedOriginalSource:true,published:false,qualifiedReligiousReview:false},null,2));
