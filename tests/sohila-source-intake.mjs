/* GLP-001 N1 original source and Full Nitnem program, offline and nonshipping. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256,stableSourceDigest,validateComposition,learningNamespace} from '../tools/compositions/composition-core.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const model=read('docs/research/n1-sohila/sohila-candidate-original.json');
const receipt=read('docs/research/n1-sohila/sohila-source-comparison.json');
const program=read('docs/research/full-nitnem-program-20261025.json');
const clone=x=>structuredClone(x),counts=[12,8,14,11,11],tests=[];
function test(name,fn){fn();tests.push(name);}
function fail(x,reason){const r=validateComposition(x);assert.equal(r.valid,false);assert.ok(r.errors.some(e=>e.reason===reason),JSON.stringify(r.errors));}
const all=model.units.flatMap(u=>u.lines);
test('Candidate source identity and review flags are explicit',()=>{
 assert.equal(model.compositionId,'kirtan-sohila');assert.equal(model.edition.sourceFamily,'sggs');assert.equal(model.edition.locationScheme,'ang');
 assert.equal(model.edition.sourceStatus,'machine_frozen');assert.equal(model.edition.humanCollationApproved,false);assert.equal(model.ui.readable,false);
});
test('Five Shabads and 56 Gurmukhi source rows are intact',()=>{
 assert.equal(model.units.length,5);assert.deepEqual(model.units.map(u=>u.lines.length),counts);assert.equal(all.length,56);
 assert.ok(model.units.every(u=>u.kind==='shabad'&&u.sourceHeadingIncludedInLines===true));
});
test('Pinned cross-run digest prevents even rehashed content drift',()=>assert.equal(stableSourceDigest(model),'badd09042c55995be3b0d7af23059a3275cd8f317adc5250014db8b7e3f0dfde'));
test('56 unique IDs, byte-accurate SHA-256 and real SGGS Angs',()=>{
 const seen=new Set();model.units.forEach((u,i)=>u.lines.forEach((l,j)=>{
  assert.equal(l.id,'sohila'+String(i+1).padStart(2,'0')+'.line'+String(j+1).padStart(2,'0'));
  assert.equal(sha256(l.text),l.sha256);assert.ok(!seen.has(l.id));seen.add(l.id);assert.ok([12,13].includes(l.location.ang));assert.equal(l.location.system,'ang');
 }));
});
test('Five printed raag headings are preserved in the original, with specific source refs',()=>{
 model.units.forEach(u=>{assert.equal(u.printedRaag,u.lines[0].text);assert.equal(u.raagEvidence.sourceRow,u.lines[0].digitalPageRow);assert.ok(u.raagEvidence.source.startsWith('https://'));});
});
test('Draft source validates structurally but can never be treated as a release',()=>{
 const r=validateComposition(model);assert.equal(r.valid,true,JSON.stringify(r.errors));assert.equal(r.publishable,false);
 const pub=validateComposition(model,{forPublication:true});assert.equal(pub.publishable,false);assert.ok(pub.errors.some(e=>e.reason==='second_bani_source_approval_missing'));
});
test('No new meaning, study, media or browser learning is imported',()=>{
 assert.equal(model.ui.meaningReviewStatus,'not_ingested');assert.equal(model.ui.studyReviewStatus,'not_ingested');
 assert.ok(!JSON.stringify(model).includes('localStorage'));
 assert.ok(model.units.every(u=>u.lines.every(l=>Object.keys(l).sort().join('|')==='digitalPageRow|id|location|sha256|sourceLayer|text')));
});
test('Two primary and two comparator HTTP 200 receipts remain bound to named HTTPS sources',()=>{
 assert.equal(receipt.primary.length,2);assert.equal(receipt.comparator.length,2);
 for(const row of [...receipt.primary,...receipt.comparator]){
  const u=new URL(row.url);assert.equal(u.protocol,'https:');assert.ok(['srigurugranth.net','opengranth.org'].includes(u.hostname));
  assert.equal(row.httpStatus,200);assert.match(row.pageSha256,/^[a-f0-9]{64}$/);assert.ok(row.retrievedBytes>10000);
 }
});
test('Comparator positive-only ledger transparently records 51 row/56 substring matches',()=>{
 assert.equal(receipt.primaryOriginalRows,56);assert.equal(receipt.comparatorExactNormalizedRows,51);assert.equal(receipt.comparatorExactPositiveSubstrings,56);
 assert.equal(receipt.segmentationOrHeadingReviewRequired.length,5);assert.equal(receipt.allComparisons.length,56);
});
test('Comparison entries carry ordered original line SHA and Ang identity',()=>receipt.allComparisons.forEach((r,i)=>{
 assert.equal(r.primaryOrdinal,i+1);assert.equal(r.primaryOriginalSha256,all[i].sha256);assert.equal(r.ang,all[i].location.ang);
 assert.equal(r.comparatorExactNormalizedSubstring,true);
}));
test('Heading and cross-Ang segmentation difference is disclosed, not AI-corrected',()=>{
 assert.ok(receipt.segmentationOrHeadingReviewRequired.some(x=>x.primaryOrdinal===1));
 assert.ok(receipt.segmentationOrHeadingReviewRequired.some(x=>x.ang===13));
 assert.ok(receipt.warnings.some(s=>s.includes('NOT auto-corrected')));
});
test('Qualified source collation and public release remain expressly pending',()=>{
 assert.equal(receipt.qualifiedSikhPunjabiApproval,'PENDING');assert.equal(receipt.independentEditionCollation,'PENDING');
 assert.equal(receipt.publicationAllowed,false);
});
test('One invented matra fails source validation',()=>{const x=clone(model);x.units[0].lines[2].text+='ਾ';fail(x,'immutable_line_hash_mismatch');});
test('Incorrect source Ang fails closed',()=>{const x=clone(model);x.units[2].lines[0].location.ang=1500;fail(x,'invalid_sggs_ang');});
test('Duplicated original ID fails closed',()=>{const x=clone(model);x.units[4].lines[1].id=x.units[4].lines[0].id;fail(x,'duplicate_line_id');});
test('Unproven raag heading fails closed',()=>{const x=clone(model);x.units[0].raagEvidence=null;fail(x,'unproven_raag_heading');});
test('Removing a line changes the pinned source digest',()=>{const x=clone(model);x.units[1].lines.pop();assert.notEqual(stableSourceDigest(x),stableSourceDigest(model));});
test('Composition- and edition-scoped learning is isolated from Japji',()=>{
 assert.ok(learningNamespace('kirtan-sohila',model.edition.editionId).startsWith('glp001.bani.kirtan-sohila.'));
 assert.throws(()=>learningNamespace('../../other','invalid'));
});
test('Seven core banis and separate Ardas are registered without invented readers',()=>{
 assert.deepEqual(program.records.map(x=>x.id),['japji','jaap','savaiye','chaupai','anand','rehras','sohila']);
 assert.equal(program.companionPractice.id,'ardas');
 assert.equal(program.records[0].readerRoute,'full-japji.html');
 assert.ok(program.records.slice(1).every(x=>x.readerRoute===null));
});
test('Morning-five/evening-one/night-one and composite source policy are retained',()=>{
 assert.equal(program.records.filter(x=>x.period==='morning').length,5);assert.equal(program.records.filter(x=>x.period==='evening').length,1);assert.equal(program.records.filter(x=>x.period==='night').length,1);
 assert.equal(program.records.find(x=>x.id==='rehras').sourceFamily,'composite');
});
test('Full Anand is not silently replaced by its short Rehras usage',()=>{
 assert.ok(program.records.find(x=>x.id==='anand').originalScope.includes('Forty pauris'));
 assert.ok(program.records.find(x=>x.id==='rehras').sourceAnchor.includes('Anand'));
});
test('Dasam Bani never has invented SGGS Ang attribution',()=>{
 for(const x of program.records.filter(x=>x.sourceFamily==='dasam'))assert.ok(!/\bAng \d/.test(x.sourceAnchor));
});
test('Sohila roadmap binds to this exact candidate and honest status',()=>{
 const s=program.records.find(x=>x.id==='sohila');
 assert.equal(s.sourceState,'digital_candidate');assert.equal(s.candidate.digitalOriginalRows,all.length);
 assert.equal(s.candidate.exactWebRowMatches,receipt.comparatorExactNormalizedRows);
 assert.equal(s.candidate.normalizedWebSubstringMatches,receipt.comparatorExactPositiveSubstrings);
 assert.equal(s.humanSourceReview,'pending');
});
test('Publication must have independent edition, qualified reviewer and founder word',()=>{
 assert.equal(program.publicationAuthorized,false);
 assert.ok(program.requiredReleaseGates.includes('independent_edition_collation'));
 assert.ok(program.requiredReleaseGates.includes('qualified_sikh_punjabi_review'));
 assert.ok(program.requiredReleaseGates.includes('founder_final_publication_word'));
});
console.log(JSON.stringify({status:'PASS',count:tests.length,cases:tests,source:'DIGITAL_CANDIDATE_ONLY',published:false},null,2));
