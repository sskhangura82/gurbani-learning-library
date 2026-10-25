/* GLP-001 complete Jaap digital ORIGINAL candidate, NOT scholarly/public release.
 * No web requests; check immutable source bytes, every 199 boundary and 67 holds.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {sha256,stableSourceDigest,validateComposition,learningNamespace} from '../tools/compositions/composition-core.mjs';
const root=new URL('../',import.meta.url);
const read=n=>JSON.parse(fs.readFileSync(new URL(n,root),'utf8'));
const model=read('docs/research/n3-dasam-jaap/jaap-199-original-candidate.json');
const ledger=read('docs/research/n3-dasam-jaap/jaap-text-discrepancy-ledger.json');
const plan=read('docs/research/full-nitnem-program-20261025.json');
const cases=[];function test(n,fn){fn();cases.push(n);}
const lines=model.units.flatMap(x=>x.lines);
const heads=model.units.flatMap(x=>x.metricalHeadingsDigitalCandidates);
test('Original source is exactly Jaap Sahib and explicitly Dasam Bani',()=>{
 assert.equal(model.compositionId,'jaap-sahib');assert.equal(model.edition.sourceFamily,'dasam');assert.equal(model.edition.locationScheme,'dasam_section');
 assert.equal(model.edition.sourceStatus,'machine_frozen');assert.equal(model.edition.humanCollationApproved,false);
});
test('199 numbered chhands and 782 frozen original verse paragraphs',()=>{
 assert.equal(model.units.length,199);assert.equal(lines.length,782);assert.equal(ledger.fullNumberedChhands,199);
});
test('All 21 metrical heading candidate rows remain separate from verse paragraphs',()=>{
 assert.equal(heads.length,21);
 assert.ok(heads.every(x=>x.text.includes('ਛੰਦ')&&x.humanVerified===false));
});
test('All six opening rows are preserved separately as candidate preface',()=>{
 assert.equal(model.prefaceOriginalDigitalCandidates.length,6);
 assert.equal(model.prefaceOriginalDigitalCandidates[0].originalText,'ਜਾਪੁ ਸਾਹਿਬ');
});
test('All 809 source paragraphs are covered exactly once without omitting/duplicating',()=>{
 const indexes=[...model.prefaceOriginalDigitalCandidates.map(x=>x.digitalParagraphIndex),...heads.map(x=>x.digitalParagraphIndex),...lines.map(x=>x.location.webParagraphIndex)];
 assert.equal(indexes.length,809);
 assert.deepEqual(indexes.sort((a,b)=>a-b),Array.from({length:809},(_,i)=>i));
});
test('Whole content source digest is pinned independently of each mutable line hash',()=>{
 assert.equal(stableSourceDigest(model),'dd41b99e82473e6f4e4387437ae07a33d33c7cfd717b0408599dec1e7d96f494');
});
test('All original line occurrence IDs are distinct and in chhand/source-line order',()=>{
 const ids=new Set();
 model.units.forEach((unit,i)=>{
  assert.equal(unit.unitId,'jaap'+String(i+1).padStart(3,'0'));
  assert.ok(unit.lines.length>=1);
  unit.lines.forEach((line,j)=>{
   assert.equal(line.id,unit.unitId+'.line'+String(j+1).padStart(2,'0'));
   assert.equal(line.location.chhand,i+1);
   assert.equal(line.location.sourceLine,j+1);
   assert.ok(!ids.has(line.id));ids.add(line.id);
  });
 });
 assert.equal(ids.size,782);
});
test('All original source-line SHA-256 values match unchanged exact Gurmukhi',()=>{
 lines.forEach(line=>{
  assert.equal(line.sha256,sha256(line.text));
  assert.equal(line.location.system,'dasam_section');
  assert.ok(!('ang' in line.location));
  assert.ok(line.text.trim().length>0);
 });
});
test('Every last source row ends with its respective original 1–199 number',()=>{
 const digits='੦੧੨੩੪੫੬੭੮੯';
 model.units.forEach((u,i)=>{
  const n=String(i+1).split('').map(x=>digits[Number(x)]).join('');
  assert.ok(u.lines.at(-1).text.endsWith('॥'+n+'॥'),u.unitId);
 });
});
test('Original metrical heading text and candidate source hashes are never inferred as Raag',()=>{
 assert.ok(model.units.every(u=>u.printedRaag===null&&u.raagEvidence===null));
 assert.equal(model.ui.raagStatus,'not_applicable');
 heads.forEach(x=>assert.equal(x.sha256,sha256(x.text)));
});
test('Primary and comparator page-byte source receipts are exact HTTPS records',()=>{
 for(const x of [ledger.primary,ledger.comparator]){
  assert.equal(new URL(x.url).protocol,'https:');
  assert.equal(x.httpStatus,200);
  assert.match(x.pageSha256,/^[0-9a-f]{64}$/);
  assert.ok(x.pageBytes>10000);
 }
});
test('Both digital sources carry exactly 199 ordered numbered chhand endings',()=>{
 assert.equal(ledger.fullNumberedChhands,199);assert.equal(ledger.perChhandComparison.length,199);
 assert.deepEqual(ledger.perChhandComparison.map(x=>x.chhand),Array.from({length:199},(_,i)=>i+1));
});
test('Only 132 chhand groups agree after exact heading-prefix removal and whitespace; 67 held',()=>{
 assert.equal(ledger.comparisonExactUnicodeIgnoringWhitespace,132);
 assert.equal(ledger.comparatorDisagreements,67);
 assert.equal(ledger.perChhandComparison.filter(x=>x.identicalUnicodeIgnoringWhitespace).length,132);
 assert.equal(ledger.perChhandComparison.filter(x=>x.requiresTextEditionAdjudication).length,67);
});
test('Every unresolved digital Jaap chhand preserves exact comparator original text',()=>{
 const diff=ledger.perChhandComparison.filter(x=>x.requiresTextEditionAdjudication);
 diff.forEach(x=>{
  assert.ok(x.originalDigitalComparatorVersion);
  assert.match(x.secondSiteChhandSourceSha256,/^[0-9a-f]{64}$/);
 });
});
test('All source comparison records bind to an unchanged primary chhand SHA',()=>{
 ledger.perChhandComparison.forEach((x,i)=>{
  assert.equal(x.originalLines,model.units[i].lines.length);
  assert.equal(x.primaryChhandSourceSha256,sha256(model.units[i].lines.map(l=>l.text).join(' ')));
 });
});
test('Original-source candidate is STRUCTURALLY valid but cannot be published',()=>{
 const r=validateComposition(model);assert.equal(r.valid,true,JSON.stringify(r.errors));assert.equal(r.publishable,false);
 const published=validateComposition(model,{forPublication:true});
 assert.equal(published.publishable,false);assert.ok(published.errors.some(e=>e.reason==='second_bani_source_approval_missing'));
});
test('There is no audio, meaning, study, rights or approved source edition',()=>{
 assert.equal(model.ui.readable,false);
 assert.equal(model.ui.meaningReviewStatus,'not_ingested');
 assert.equal(model.ui.studyReviewStatus,'not_ingested');
 assert.equal(model.edition.editionAuthority,null);
 assert.equal(model.edition.editionCitation,null);
 assert.equal(ledger.qualifiedSikhPunjabiReview,'PENDING');
 assert.equal(ledger.publishedReaderReady,false);
});
test('Single altered Gurmukhi mark is refused by the source validator',()=>{
 const x=structuredClone(model);x.units[21].lines[0].text+='ਾ';
 const r=validateComposition(x);assert.ok(r.errors.some(e=>e.reason==='immutable_line_hash_mismatch'));
});
test('Adding false SGGS Ang location to a Dasam source is refused',()=>{
 const x=structuredClone(model);x.units[21].lines[0].location={system:'ang',ang:12};
 const r=validateComposition(x);assert.ok(r.errors.some(e=>e.reason==='invalid_location_system'));
});
test('Learning namespace is distinct from legacy Japji data',()=>{
 assert.notEqual(learningNamespace(model.compositionId,model.edition.editionId),'glp001.continuous.v2');
});
test('Source candidate has no family route or unapproved publication override',()=>{
 const jaap=plan.records.find(x=>x.id==='jaap');
 assert.equal(jaap.readerRoute,null);
 assert.equal(plan.publicationAuthorized,false);
});
console.log(JSON.stringify({status:'PASS',checks:cases.length,cases,primaryOriginalLines:782,numberedChhands:199,comparisonExactChhands:132,sourceTextDifferences:67,published:false},null,2));
