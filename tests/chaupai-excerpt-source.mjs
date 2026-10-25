/* GLP N4 Chaupai: SGPC Rehras excerpt digital candidate, not complete morning Benti Chaupai. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {sha256,stableSourceDigest,validateComposition,learningNamespace} from '../tools/compositions/composition-core.mjs';
const root=new URL('../',import.meta.url),read=f=>JSON.parse(fs.readFileSync(new URL(f,root),'utf8'));
const model=read('docs/research/n4-chaupai-excerpt/chaupai-sgpc-excerpt-candidate.json');
const ledger=read('docs/research/n4-chaupai-excerpt/chaupai-variant-boundary-ledger.json');
const program=read('docs/research/full-nitnem-program-20261025.json');
const all=model.units.flatMap(u=>u.lines),checks=[];
function test(name,fn){fn();checks.push(name);}
function fail(x,reason){const r=validateComposition(x);assert.equal(r.valid,false);assert.ok(r.errors.some(e=>e.reason===reason),JSON.stringify(r.errors));}
test('SGPC Rehras excerpt is a Dasam-source component, not a full morning Chaupai default',()=>{
 assert.equal(model.compositionId,'rehras-benti-chaupai-excerpt');assert.equal(model.edition.sourceFamily,'dasam');
 assert.ok(ledger.scope.includes('Evening Rehras excerpt ONLY'));
 assert.ok(ledger.sourceVariants.some(s=>s.includes('not automatically the full version')));
});
test('Bounded source has 25 complete pauris of four original Gurmukhi tuk segments each',()=>{
 assert.equal(model.units.length,25);assert.ok(model.units.every(u=>u.lines.length===4&&u.kind==='stanza'));
 assert.equal(all.length,100);
});
test('SHA-256 and stable IDs match every original source tuk without invented SGGS Ang',()=>{
 for(const [i,u] of model.units.entries())for(const [j,l] of u.lines.entries()){
  assert.equal(l.id,'chaupai-rehras'+String(i+1).padStart(2,'0')+'.line'+String(j+1).padStart(2,'0'));
  assert.equal(sha256(l.text),l.sha256);
  assert.equal(l.location.system,'dasam_section');
  assert.equal(l.location.recitationPauri,i+1);
  assert.equal(l.location.tuk,j+1);
  assert.ok(!('ang' in l.location));
 }
});
test('Whole original reading order/source digest is pinned to one immutable candidate',()=>{
 assert.equal(stableSourceDigest(model),'06fd09902871c1aed28913e265443080575ac60ebf1afff4195aa7f346ac3747');
});
test('Original first and last text match exact agreed named SGPC boundary strings',()=>{
 assert.ok(all[0].text.startsWith('ਹਮਰੀ ਕਰੋ ਹਾਥ ਦੈ ਰੱਛਾ'));
 assert.ok(all.at(-1).text.startsWith('ਦੁਸਟ ਦੋਖ ਤੇ ਲੇਹੁ ਬਚਾਈ'));
 assert.ok(all.at(-1).text.endsWith('॥੨੫॥'));
});
test('Each last tuk is numbered 1–25 in the primary website candidate',()=>{
 const nums='੦੧੨੩੪੫੬੭੮੯';
 for(let i=1;i<=25;i++){
  const suffix='॥'+String(i).split('').map(x=>nums[Number(x)]).join('')+'॥';
  assert.ok(model.units[i-1].lines[3].text.endsWith(suffix),i+' '+suffix);
 }
});
test('Three original prefatory source candidates remain separate from 100 tuk segments',()=>{
 assert.equal(model.prefaceOriginalCandidate.length,3);
 for(const x of model.prefaceOriginalCandidate)assert.equal(x.sha256,sha256(x.text));
 assert.equal(model.prefaceOriginalCandidate[0].text,'ੴ');
});
test('Primary website 50 paired rows split only at original double-danda boundaries',()=>{
 assert.equal(ledger.primaryPairedDigitalRowsUsed,50);
 assert.equal(ledger.derivedGurmukhiTukSegments,100);
 assert.ok(ledger.method.includes('original danda boundaries'));
});
test('Comparator is the full Dasam sequence chhand numbers 377–401, not a separate SGGS Ang',()=>{
 assert.equal(ledger.comparator.startIndex,47);
 assert.equal(ledger.comparator.endIndex,146);
 assert.equal(ledger.comparator.correspondsToDasamChhandNumbers,'377–401');
});
test('39 exact rows, 51 rows after only verse-number comparison, and 49 unresolved digital differences',()=>{
 assert.equal(ledger.exactNfcMatches,39);
 assert.equal(ledger.matchesAfterOnlyTerminalVerseNumbersRemoved,51);
 assert.equal(ledger.substantiveOrthographicVariants,49);
 assert.equal(ledger.comparisons.length,100);
});
test('All 49 remaining differences preserve BOTH original digital strings without rewriting source',()=>{
 const disputed=ledger.comparisons.filter(x=>x.needsQualifiedTextReview);
 assert.equal(disputed.length,49);
 for(const r of disputed)assert.ok(r.primaryOriginal&&r.comparatorOriginal&&r.primaryOriginal!==r.comparatorOriginal);
});
test('Comparator evidence maps to the exact 100 original text SHA-256 bytes',()=>{
 for(const [i,r] of ledger.comparisons.entries()){
  assert.equal(r.ordinal,i+1);
  assert.equal(r.recitationPauri,Math.floor(i/4)+1);
  assert.equal(r.primaryOriginalSha256,all[i].sha256);
  assert.match(r.comparatorOriginalSha256,/^[a-f0-9]{64}$/);
 }
});
test('Both digital HTML original-source receipt SHA values and URLs are pinned',()=>{
 for(const x of [ledger.primary,ledger.comparator]){
  assert.equal(new URL(x.url).protocol,'https:');
  assert.equal(x.httpStatus,200);
  assert.match(x.pageSha256,/^[a-f0-9]{64}$/);
  assert.ok(x.retrievedBytes>30000);
 }
});
test('The model is structurally valid but categorically nonpublishable',()=>{
 assert.equal(validateComposition(model).valid,true);
 const result=validateComposition(model,{forPublication:true});
 assert.equal(result.publishable,false);
 assert.ok(result.errors.some(x=>x.reason==='second_bani_source_approval_missing'));
 assert.equal(model.ui.readable,false);
});
test('No scholarly/edition approval, translation, timing or rights were invented',()=>{
 assert.equal(model.edition.humanCollationApproved,false);
 assert.equal(model.edition.editionAuthority,null);
 assert.equal(model.edition.editionCitation,null);
 assert.equal(ledger.rightsApproval,'PENDING');
 assert.equal(ledger.printedEditionCollation,'PENDING');
 assert.equal(ledger.qualifiedSikhPunjabiReview,'PENDING');
});
test('Tampering with one original Gurmukhi matra fails the composition source hash gate',()=>{
 const x=structuredClone(model);x.units[3].lines[0].text+='ਿ';
 fail(x,'immutable_line_hash_mismatch');
});
test('A fake SGGS Ang on a Dasam Bani excerpt fails closed',()=>{
 const x=structuredClone(model);x.units[3].lines[0].location={system:'ang',ang:12};
 fail(x,'invalid_location_system');
});
test('A duplicate original occurrence ID fails closed',()=>{
 const x=structuredClone(model);x.units[1].lines[0].id=x.units[0].lines[0].id;
 fail(x,'duplicate_line_id');
});
test('Excerpt keeps an independent future learning namespace with no migration',()=>{
 const name=learningNamespace(model.compositionId,model.edition.editionId);
 assert.ok(name.startsWith('glp001.bani.rehras-benti-chaupai-excerpt.'));
 assert.notEqual(name,'glp001.continuous.v2');
});
test('Full Nitnem program has NO public reader for morning Chaupai or composite Rehras',()=>{
 assert.equal(program.records.find(x=>x.id==='chaupai').readerRoute,null);
 assert.equal(program.records.find(x=>x.id==='rehras').readerRoute,null);
 assert.equal(ledger.readerPublished,false);
 assert.equal(ledger.familyLearningModified,false);
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,cases:checks,recitationPauris:25,originalSegments:100,comparatorExact:39,counterOnlyEquivalent:51,unresolved:49,qualifiedReview:'PENDING',publicReader:false},null,2));
