/* GLP-001 SGGS two-new-collections project intake: source-held text stays
 * unrendered and no self-appointed Sant obtains authority from a meaning.
 */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read=p=>fs.readFileSync(path.join(root,p));
const load=p=>JSON.parse(read(p));
const sha=b=>createHash('sha256').update(b).digest('hex');
const original=load('study/sources/sukhmani-shabados-487-candidate.json');
const salok=load('study/sources/salok-mahala9-shabados-487-candidate.json');
const structure=load('study/sources/sukhmani-ashtpadi-pauri-outline.v1.json');
const lesson=load('study/content/sant-source-anchored-pilot.v1.json');
const allLines=original.intro.concat(original.ashtpadis.flatMap(g=>[g.salokHeading,...g.salok,g.ashtpadiHeading,...g.ashtpadi]));
const source=new Map(allLines.map(x=>[x.id,x]));
const checks=[];function check(n,cb){cb();checks.push(n);}
check('Exactly the existing source-sha anchored ashtpadi navigation was produced, no silent original rewrite',()=>{
 assert.equal(sha(read('study/sources/sukhmani-ashtpadi-pauri-outline.v1.json')),'64cbc189180fee9483cac288c265aaec1a87edfc94afec113d010b800b4c8069');
 assert.equal(structure.sourceFileSha256,sha(read('study/sources/sukhmani-shabados-487-candidate.json')));
 assert.equal(structure.ashtpadis.length,24);
 assert.equal(structure.pauriCount,192);
 assert.equal(structure.originalPauriSourceRows,1920);
 assert.equal(structure.distinctRahauRows,2);
});
check('All source-indexed 192 pauris consist of exactly ten original rows, with original source SHA per occurrence',()=>{
 const seen=new Set();
 for(const a of structure.ashtpadis){
  assert.equal(a.pauris.length,8,a.id);
  for(const [i,p] of a.pauris.entries()){
   assert.equal(p.ordinal,i+1);
   assert.equal(p.sourceLineIds.length,10);
   assert.equal(p.lineHashes.length,10);
   for(let j=0;j<10;j++){
    const id=p.sourceLineIds[j],row=source.get(id);
    assert.ok(row,id);
    assert.equal(p.lineHashes[j],row.textSha256,id);
    assert.ok(!seen.has(id),'duplicate pauri source row '+id);
    seen.add(id);
   }
  }
 }
 assert.equal(seen.size,1920);
});
check('Original 2-line Rahau is separately indexed after Pauri1, not counted as an extra numbered stanza',()=>{
 const a=structure.ashtpadis[0];
 assert.equal(a.refrain.length,2);
 assert.ok(a.refrainPlacement.includes('After Pauri 1'));
 assert.equal(structure.ashtpadis.slice(1).every(x=>x.refrain.length===0),true);
 for(const row of a.refrain)assert.equal(row.textSha256,source.get(row.sourceId).textSha256);
});
check('Only Sukhmani source glyph hold 7ST5 remains visible as hold metadata and never auto-corrected',()=>{
 const pauris=structure.ashtpadis.flatMap(g=>g.pauris);
 const held=pauris.filter(p=>p.unapprovedOriginalPresent);
 assert.equal(held.length,1);
 assert.deepEqual(held[0].heldOriginalLineIds,['7ST5']);
 assert.equal(source.get('7ST5').ang,282);
 assert.equal(original.provenance.humanSourceApproved,false);
});
check('Eight Sant theme pilot lines exactly match original Sukhmani SHA and authentic Ang',()=>{
 assert.equal(lesson.sukhmaniSant.length,8);
 const expected=new Map([['N9ZJ',265],['LB45',265],['91LZ',271],['V2NX',271],['CNCV',271],['44JT',279],['4U0A',279],['2HNK',288]]);
 for(const note of lesson.sukhmaniSant){
  assert.equal(note.ang,expected.get(note.sourceLineId));
  assert.equal(note.sourceTextSha256,source.get(note.sourceLineId)?.textSha256);
  assert.equal(note.editorialStatus,'DRAFT_AI_UNREVIEWED');
  assert.ok(note.meaningEn.length>35);
  assert.ok(note.meaningPa.length>30&&/[\u0a00-\u0a7f]/u.test(note.meaningPa));
  assert.ok(note.deeperEn.length>120&&note.deeperPa.length>50);
  assert.ok(note.care.length>55);
 }
 assert.equal(new Set(lesson.sukhmaniSant.map(x=>x.sourceLineId)).size,8);
});
check('Sant-ninda is distinguished from legitimate safeguarding and questioning',()=>{
 const note=lesson.sukhmaniSant.find(x=>x.sourceLineId==='4U0A');
 assert.ok(note.deeperEn.includes('honestly reporting harm'));
 assert.ok(note.deeperPa.includes('ਸਵਾਲ'));
 assert.ok(note.care.includes('not a threat'));
});
check('Sukhmani pilot emphasizes Naam/sangat/ego/analysis, not human authority or a paid religious product',()=>{
 assert.equal(lesson.familyPublicationAuthorized,false);
 assert.equal(lesson.humanPunjabiReviewerApproved,false);
 assert.equal(lesson.humanSikhReviewerApproved,false);
 assert.equal(lesson.noAIChatInReader,true);
 assert.ok(lesson.santInterpretationCaveat.includes('different referents'));
});
check('Salok Mahala 9 two linked pilot notes draw from exact first and second source couplets',()=>{
 assert.deepEqual(lesson.salokMahala9Connections.map(n=>n.ordinal),[12,56]);
 for(const e of lesson.salokMahala9Connections){
  const unit=salok.saloks[e.ordinal-1];
  assert.deepEqual(e.sourceLineIds,unit.sourceRows.map(x=>x.id));
  assert.deepEqual(e.sourceLineSha256,unit.sourceRows.map(x=>x.textSha256));
  assert.ok(e.simpleEn.length>50&&e.simplePa.length>35);
  assert.ok(e.deeperEn.length>110);
  assert.equal(e.editorialStatus,'DRAFT_AI_UNREVIEWED');
 }
});
check('No original source collection or Sangat teaching has been secretly activated or published',()=>{
 assert.equal(lesson.status,'REVIEW_CANDIDATE_NOT_IN_READER');
 assert.equal(original.publicationAllowed,false);
 assert.equal(salok.publicationAllowed,false);
 assert.equal(structure.publicFamilyRelease,false);
 assert.equal(structure.editorialReview,'NOT_APPROVED');
 assert.equal(lesson.copyrightedModernTeekaBundled,false);
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,cases:checks,
 sourceSukhmaniRows:2027,pauris:192,sourceSalok9Rows:117,saloks:57,
 knownSukhmaniGlyphHold:1,santTeachingPilotLines:8,salok9TeachingPilotStanzas:2,
 qualifiedReviewerApprovals:0,existingFamilyAppChanged:false},null,2));
