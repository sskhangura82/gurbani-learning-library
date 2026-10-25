/* GLP Rehras mixed-origin SGPC-source parity with unchanged Japji core */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {adaptNonshippingRehrasComposite} from '../tools/compositions/continuous-rehras-composite.mjs';
const src=JSON.parse(fs.readFileSync(new URL('../docs/research/n4-rehras-composite/rehras-sgpc-digital-composite-candidate.json',import.meta.url)));
const C=createRequire(import.meta.url)('../js/continuous-core.js');
const checks=[],test=(label,fn)=>{fn();checks.push(label)};
const review=adaptNonshippingRehrasComposite(src,{explicitReviewOnly:true});
const model=C.flatten(review.units);
const prior=src.sections.flatMap(s=>s.units).flatMap(u=>u.lines);
test('44 units, 159 source records traverse the same accepted continuous-core engine',()=>{
 assert.equal(review.units.length,44);assert.equal(model.lines.length,159);
});
test('Six SGPC component boundaries are exactly 0, 9, 34, 35, 36, 42',()=>{
 assert.deepEqual(review.sectionStarts.map(x=>x.unitStart),[0,9,34,35,36,42]);
});
test('Six SGPC components preserve their mixed SGGS+Dasam source families',()=>{
 assert.deepEqual(review.sectionStarts.map(x=>x.sourceFamily),['sggs','dasam','dasam','dasam','sggs','sggs']);
});
test('All original Unicode, IDs and source SHA-256 values remain EXACT',()=>{
 assert.deepEqual(model.lines.map(x=>[x.id,x.text,x.sha256]),prior.map(x=>[x.id,x.text,x.sha256]));
});
test('Every original Unicode row can be reconstructed exactly from reader parts',()=>{
 assert.ok(model.lines.every((x,i)=>x.parts.join('')===prior[i].text));
});
test('Six section starts map to the correct original source unit IDs',()=>{
 const x=review.sectionStarts.map(s=>model.lines[model.starts[s.unitStart]].id);
 assert.deepEqual(x,[
 'rehras.sggs01.line01',
 'rehras.chaupai-rehras01.line01',
 'rehras.savaiya01.line01',
 'rehras.dohira01.line01',
 'rehras.anand01.line01',
 'rehras.mundawani.line01'
 ]);
});
test('9th SGGS hymn to Dasam 25-pauri Chaupai transition is structurally exact',()=>{
 const u=8;const last=model.starts[u+1]-1;
 const next=C.advance({index:last,token:model.lines[last].tokens.length-1},model.lines);
 assert.equal(model.lines[next.index].unitId,review.units[u+1].id);
 assert.equal(review.units[u].sourceFamily,'sggs');
 assert.equal(review.units[u+1].sourceFamily,'dasam');
});
test('Last Chaupai pauri to evening Savaiya transition is exact',()=>{
 const last=model.starts[34]-1;
 const next=C.advance({index:last,token:model.lines[last].tokens.length-1},model.lines);
 assert.equal(model.lines[next.index].unitId,'rehras.savaiya01');
});
test('Evening Savaiya, Dohira and selected Anand original section transitions survive',()=>{
 const sec=[34,35,36];
 for(let i=0;i<2;i++){
  const last=model.starts[sec[i]+1]-1;
  const next=C.advance({index:last,token:model.lines[last].tokens.length-1},model.lines);
  assert.equal(model.lines[next.index].unitId,review.units[sec[i+1]].id);
 }
});
test('Full Anand selected 1–5 plus 40 is intact but never incorrectly includes Pauri 24',()=>{
 assert.deepEqual(review.units.slice(36,42).map(x=>x.id),[
  'rehras.anand01','rehras.anand02','rehras.anand03','rehras.anand04','rehras.anand05','rehras.anand40']);
 assert.ok(!review.units.some(x=>x.id==='rehras.anand24'));
});
test('Mundawani and final Mahla 5 Slok end the narrow variant, no website postscript',()=>{
 assert.deepEqual(review.units.slice(42).map(x=>x.id),['rehras.mundawani','rehras.slok']);
 const last=model.lines.length-1;
 assert.equal(C.advance({index:last,token:model.lines[last].tokens.length-1},model.lines).finished,true);
});
test('Dasam source contains ZERO invented SGGS Ang fields',()=>{
 for(const x of model.lines){
  const l=review.sourceLocators[x.id];
  if(l.sourceFamily==='dasam')assert.equal(x.ang,null);
 }
});
test('SGGS source references are typed as canonical Ang ONLY where original carried it',()=>{
 assert.ok(model.lines.some(x=>Number.isInteger(x.ang)));
 assert.ok(model.lines.some(x=>x.ang===null));
});
test('Prospective learning namespace remains independent from Japji private reflections',()=>{
 assert.ok(review.learningNamespace.startsWith('glp001.bani.'));
 assert.notEqual(review.learningNamespace,'glp001.continuous.v2');
});
test('Renderer cannot present the candidate as approved for family recitation',()=>{
 assert.equal(review.uiRoute,null);
 assert.equal(review.releaseAuthorized,false);
 assert.equal(review.approvedForRecitation,false);
 assert.equal(review.kind,'NONSHIPPING_MIXED_SOURCE_PARITY_ONLY');
});
test('Cannot construct mixed SGGS/Dasam source adapter without explicit review-only word',()=>{
 assert.throws(()=>adaptNonshippingRehrasComposite(src),/explicitly authorized/);
});
test('Tampered source wording, even with the same component count, is refused',()=>{
 const copy=structuredClone(src);
 copy.sections[0].units[0].lines[0].text+='ਾ';
 assert.throws(()=>adaptNonshippingRehrasComposite(copy,{explicitReviewOnly:true}),/Source hash mismatch/);
});
test('A Dasam verse with a false SGGS Ang or family label is refused',()=>{
 const a=structuredClone(src);
 a.sections[1].units[0].lines[0].location.ang=12;
 assert.throws(()=>adaptNonshippingRehrasComposite(a,{explicitReviewOnly:true}),/False SGGS Ang/);
 const b=structuredClone(src);
 b.sections[1].units[0].lines[0].sourceFamily='sggs';
 assert.throws(()=>adaptNonshippingRehrasComposite(b,{explicitReviewOnly:true}),/misattributed/);
});
test('Fake in-model human approval or changed SGPC component sequence is refused',()=>{
 const a=structuredClone(src);a.sourceApproved=true;
 assert.throws(()=>adaptNonshippingRehrasComposite(a,{explicitReviewOnly:true}),/release authority/);
 const b=structuredClone(src);b.sections[2].componentId='invented';
 assert.throws(()=>adaptNonshippingRehrasComposite(b,{explicitReviewOnly:true}),/SGPC component/);
});
test('All original source locators remain frozen and independent of UI',()=>{
 assert.ok(Object.isFrozen(review.units));
 assert.ok(Object.isFrozen(review.sourceLocators));
 assert.ok(Object.values(review.sourceLocators).every(x=>Object.isFrozen(x)));
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,cases:checks,sourceFamilies:['sggs','dasam'],originalRecords:159,sourceUnits:44,release:false},null,2));
