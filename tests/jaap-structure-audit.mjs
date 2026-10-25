/* GLP N3 Jaap 199 ending-chhand web-structure research contract.
 * This DOES NOT assert independent original-text equivalence.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const read=name=>JSON.parse(fs.readFileSync(new URL(name,root),'utf8'));
const report=read('docs/research/n3-dasam-jaap/jaap-199-structure-audit.json');
const program=read('docs/research/full-nitnem-program-20261025.json');
const checks=[];function test(name,fn){fn();checks.push(name);}
const first=report.primary,second=report.comparator,expected=Array.from({length:199},(_,i)=>i+1);
test('Jaap is Dasam original research only, with no appointed source edition',()=>{
 assert.equal(report.composition,'jaap-sahib');assert.equal(report.sourceFamily,'dasam');
 assert.equal(report.sourceEditionHumanApproval,'PENDING');
});
test('Both public source transcriptions were retrieved over HTTPS and hashed',()=>{
 for(const p of [first,second]){
  assert.equal(new URL(p.url).protocol,'https:');assert.equal(p.httpStatus,200);
  assert.match(p.webPageSha256,/^[a-f0-9]{64}$/);assert.ok(p.retrievedBytes>10000);
 }
});
test('Discover has 59 grouped Gurmukhi paragraphs and Gurdwaras has 809',()=>{
 assert.equal(first.gurmukhiHtmlParagraphs,59);assert.equal(second.gurmukhiHtmlParagraphs,809);
 assert.equal(first.paragraphsMayContainMultipleChhands,true);
 assert.equal(second.paragraphsMayContainMultipleChhands,false);
});
test('Both sources contain exactly 199 numbered chhand endings',()=>{
 assert.equal(first.numberedChhands,199);
 assert.equal(second.numberedChhands,199);
 assert.equal(first.chhandNumbers.length,199);assert.equal(second.chhandNumbers.length,199);
});
test('Both original web sources have the exact ordered sequence 1 through 199',()=>{
 assert.deepEqual(first.chhandNumbers.map(x=>x.ordinal),expected);
 assert.deepEqual(second.chhandNumbers.map(x=>x.ordinal),expected);
 assert.deepEqual(report.commonOrderedChhandNumbers,expected);
});
test('All numbered paragraph locators are in each source bounds',()=>{
 for(const src of [first,second]){
  let prior=-1;
  for(const r of src.chhandNumbers){
   assert.ok(r.digitalParagraph>=prior);
   assert.ok(r.digitalParagraph>=0&&r.digitalParagraph<src.gurmukhiHtmlParagraphs);
   assert.match(r.paragraphSha256,/^[a-f0-9]{64}$/);
   prior=r.digitalParagraph;
  }
 }
});
test('First numbered entry follows a separate source preface',()=>{
 assert.ok(first.firstNumberedParagraphIndex>0);
 assert.ok(second.firstNumberedParagraphIndex>0);
 assert.ok(second.lastNumberedParagraphIndex<second.gurmukhiHtmlParagraphs);
});
test('199th chhand is bounded to last display paragraph in each web source',()=>{
 assert.equal(first.chhandNumbers.at(-1).ordinal,199);
 assert.equal(second.chhandNumbers.at(-1).ordinal,199);
 assert.equal(first.lastNumberedParagraphIndex,first.gurmukhiHtmlParagraphs-1);
 assert.equal(second.lastNumberedParagraphIndex,second.gurmukhiHtmlParagraphs-1);
});
test('Both sources agree only on ordinal structure; textual correspondence remains UNTESTED',()=>{
 assert.equal(report.matchingChhandOrdinalStructure,true);
 assert.equal(report.comparisonTextEquality,'NOT_ATTEMPTED_BECAUSE_HTML_SEGMENTATION_DIFFERS');
 assert.equal(report.sourceLineageIndependence,'UNVERIFIED');
});
test('No Jaap text model or verse-by-verse immutable source proof is claimed',()=>{
 assert.equal(report.originalGurmukhiSourceModelBuilt,false);
 assert.equal(report.allOriginalTextLineHashesVerified,false);
 assert.equal(report.sanskritPersianChhandHeadingsIndependentlyCollated,false);
});
test('No reader route is created for Jaap',()=>{
 assert.equal(program.records.find(x=>x.id==='jaap').readerRoute,null);
 assert.equal(program.records.find(x=>x.id==='jaap').sourceState,'not_ingested');
});
test('No human review, permissions, or public publication authority exists',()=>{
 assert.equal(report.sourceEditionHumanApproval,'PENDING');
 assert.equal(report.reuseRights,'PENDING');
 assert.equal(report.releaseAuthorized,false);
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,cases:checks,ordinalMarkers:199,digitalOriginalEditionReviewed:false,published:false},null,2));
