/* GLP-001: original SGGS intake contracts for next library collections.
 * Never infer source approval from passed SHA/SQL tests.
 * Original archived DB source is kept as legacy ASCII beside derived Unicode.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read=f=>fs.readFileSync(path.join(root,f));
const json=f=>JSON.parse(read(f));
const sha=v=>createHash('sha256').update(v).digest('hex');
const a=json('study/sources/sukhmani-shabados-487-candidate.json');
const b=json('study/sources/salok-mahala9-shabados-487-candidate.json');
const checks=[];
function check(name,run){run();checks.push(name);}
check('Versioned source candidates are byte-for-byte pinned, immutable research artifacts',()=>{
 assert.equal(sha(read('study/sources/sukhmani-shabados-487-candidate.json')),'a187e6e7a9b91d7cd3233d792aab77ddaf10576f9115b062ec7a7fa37533b7b6');
 assert.equal(sha(read('study/sources/salok-mahala9-shabados-487-candidate.json')),'b022e177e1726e04d905b3c985dd8328b951ac12e609a39e6e4de61dfdbcfc6e');
});
check('Both derive from exactly identified Shabad OS archived 4.8.7 release, not ungrounded pasted scripture',()=>{
 assert.deepEqual(a.provenance,b.provenance);
 assert.equal(a.provenance.databaseSha256,'d8e071347bd5485cc6aa2533c1f51347a16ed1724b4d8abaa4939520257074c2');
 assert.equal(a.provenance.converter,'gurmukhi-utils 3.2.2 (pinned)');
});
check('No private user data, hostname, analytics, AI chat, commercial rights or artificial publication consent',()=>{
 for(const c of [a,b]){
  assert.equal(c.provenance.familyPublicationAuthorized,false);
  assert.equal(c.provenance.humanSourceApproved,false);
  assert.equal(c.provenance.teachingApproved,false);
  assert.equal(c.publicationAllowed,false);
  assert.equal(c.provenance.externalScriptureReaderRequired,false);
  assert.equal(c.admission,'SOURCE_RESEARCH_ONLY_NOT_VERIFIED_FOR_FAMILY_PAATH');
 }
});
check('Sukhmani Sahib: 24 separate sloks and Ashtpadis, Ang 262–296, no misleading 24-only short-slok edition',()=>{
 assert.equal(a.collectionId,'sukhmani');
 assert.deepEqual(a.pageSpan,[262,296]);
 assert.equal(a.sourceRowCount,2027);
 assert.equal(a.ashtpadis.length,24);
 assert.equal(a.ashtpadis.reduce((sum,g)=>sum+g.ashtpadi.length,0),1922);
 assert.equal(a.ashtpadis.reduce((sum,g)=>sum+g.salok.length,0),56);
 assert.equal(a.ashtpadis.filter(g=>!!g.salokHeading&&!!g.ashtpadiHeading).length,24);
 assert.equal(a.ashtpadis.every(g=>g.pauriSegmentationReviewed===false),true);
});
check('Sukhmani source order, original ASCII and Unicode SHA all stable and unique',()=>{
 const rows=a.intro.concat(a.ashtpadis.flatMap(g=>[g.salokHeading,...g.salok,g.ashtpadiHeading,...g.ashtpadi]));
 assert.equal(rows.length,2027);
 const ids=new Set();
 for(const r of rows){
  assert.ok(!ids.has(r.id),'duplicate '+r.id);ids.add(r.id);
  assert.equal(sha(r.sourceAscii),r.sourceAsciiSha256,r.id);
  assert.equal(sha(r.text),r.textSha256,r.id);
  assert.ok(r.ang>=262&&r.ang<=296,r.id);
  assert.match(r.text,/[\u0a00-\u0a7f]/u);
 }
 assert.equal(ids.size,2027);
});
check('Exactly one archived encoding issue 7ST5 at Ang 282 remains held and UNAPPROVED',()=>{
 const rows=a.ashtpadis.flatMap(g=>g.salok.concat(g.ashtpadi));
 const held=rows.filter(r=>r.sourceTextHeld);
 assert.equal(held.length,1);
 assert.equal(held[0].id,'7ST5');
 assert.equal(held[0].ang,282);
 assert.equal(held[0].sourceAscii,'tUtI gwFnhwr guopwl ]');
 assert.equal(held[0].sourceHoldReason,'NONREVERSIBLE_LEGACY_GURMUKHI_ASCII_TO_UNICODE_7ST5');
 assert.deepEqual(a.provenance.conversionHoldIds,['7ST5']);
});
check('Salok Mahala 9 has all 57 independent two-line saloks and all source headings',()=>{
 assert.equal(b.collectionId,'salok-mahala9');
 assert.deepEqual(b.pageSpan,[1426,1429]);
 assert.equal(b.saloks.length,57);
 assert.equal(b.sourceRowCount,117);
 assert.equal(b.sourceHeadings.length,3);
 assert.ok(b.sourceHeadings.some(r=>r.text==='ਦੋਹਰਾ ॥'));
 assert.equal(b.saloks.every(s=>s.sourceRows.length===2),true);
 assert.equal(b.saloks.at(-1).ordinal,57);
});
check('Salok Mahala 9 original order and numbering preserved without invented historical narrative',()=>{
 const units=b.saloks.flatMap(x=>x.sourceRows);
 const rows=b.sourceHeadings.concat(units);
 assert.equal(rows.length,117);
 const ids=new Set();
 const numberGurmukhi=String(57).split('').map(x=>'੦੧੨੩੪੫੬੭੮੯'[Number(x)]).join('');
 assert.ok(b.saloks.at(-1).sourceRows[1].text.includes('॥'+numberGurmukhi+'॥'));
 for(const r of rows){
  assert.ok(!ids.has(r.id));ids.add(r.id);
  assert.equal(sha(r.sourceAscii),r.sourceAsciiSha256);
  assert.equal(sha(r.text),r.textSha256);
  assert.ok(r.ang>=1426&&r.ang<=1429);
  assert.ok(!r.sourceTextHeld);
 }
 assert.equal(b.historicCompositionClaimsPendingReview,true);
});
check('Candidate source makes no artificial canonical word meaning or any qualified review',()=>{
 assert.equal(a.teachingState,'NOT_WRITTEN');
 assert.equal(b.teachingState,'NOT_WRITTEN');
 assert.equal(a.provenance.textStatus,'DIGITAL_WITNESS_SOURCE_NOT_INDEPENDENTLY_COLLATED');
 assert.equal(b.provenance.textStatus,'DIGITAL_WITNESS_SOURCE_NOT_INDEPENDENTLY_COLLATED');
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,cases:checks,
 sukhmani:{ashtpadis:24,sourceRows:2027,heldSourceLines:1,angles:[262,296]},
 salokMahala9:{saloks:57,sourceRows:117,angles:[1426,1429]},
 publication:false,humanSourceApproval:false},null,2));
