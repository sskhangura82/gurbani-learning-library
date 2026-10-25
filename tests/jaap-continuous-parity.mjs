/* Jaap original 199-chhand digital source candidate through unchanged R7 core.
 * This is a nonshipping parity proof, not a complete approved daily reader.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {adaptNonshippingSourceCandidate} from '../tools/compositions/continuous-source-parity.mjs';
import {validateComposition,stableSourceDigest} from '../tools/compositions/composition-core.mjs';
const root=new URL('../',import.meta.url);
const source=JSON.parse(fs.readFileSync(new URL('docs/research/n3-dasam-jaap/jaap-199-original-candidate.json',root),'utf8'));
const core=createRequire(import.meta.url)('../js/continuous-core.js');
const start=performance.now();
const derived=adaptNonshippingSourceCandidate(source,{explicitReviewOnly:true});
const flattened=core.flatten(derived.units);
const duration=Math.round(performance.now()-start);
const exact=source.units.flatMap(u=>u.lines),cases=[];
function test(label,fn){fn();cases.push(label);}
test('Existing continuous reader core accepts complete 199-chhand Jaap source shape',()=>{
 assert.equal(flattened.lines.length,782);assert.equal(flattened.starts.length,199);
});
test('Original Gurmukhi Unicode, exact line IDs and SHA hashes are unchanged',()=>{
 assert.deepEqual(flattened.lines.map(l=>[l.id,l.text,l.sha256]),exact.map(l=>[l.id,l.text,l.sha256]));
});
test('All Jaap line Ang values are null; no invented SGGS page',()=>{
 assert.equal(derived.sourceFamily,'dasam');
 assert.ok(flattened.lines.every(x=>x.ang===null));
});
test('Dasam section and chhand source locator map has 782 frozen original references',()=>{
 assert.equal(Object.keys(derived.sourceLocationByOccurrence).length,782);
 for(const l of exact){
  const ref=derived.sourceLocationByOccurrence[l.id];
  assert.equal(ref.system,'dasam_section');
  assert.ok(ref.chhand>=1&&ref.chhand<=199);
  assert.ok(!('ang' in ref));
  assert.ok(Object.isFrozen(ref));
 }
});
test('All 199 source unit IDs and boundaries survive flatten in order',()=>{
 assert.deepEqual(derived.units.map(x=>x.id),source.units.map(x=>x.unitId));
 for(let i=0;i<199;i++)assert.equal(flattened.lines[flattened.starts[i]].unitId,source.units[i].unitId);
});
test('Original 21 separately preserved source metre headings retain their SHA',()=>{
 const candidate=derived.units.flatMap(u=>u.meterHeadingDigitalCandidates);
 assert.equal(candidate.length,21);
 assert.ok(candidate.every(x=>x.qualifiedReview===false&&Object.isFrozen(x)));
 assert.deepEqual(candidate.map(x=>x.sha256),source.units.flatMap(u=>u.metricalHeadingsDigitalCandidates.map(x=>x.sha256)));
});
test('Original source head is NOT duplicated as an extra sound/verse line',()=>{
 assert.equal(flattened.lines.length,782);
 assert.ok(!flattened.lines.some(x=>x.text==='ਭੁਜੰਗ ਪ੍ਰਯਾਤ ਛੰਦ ॥'));
});
test('Every original split word recompiles to its exact source Unicode text',()=>{
 assert.ok(flattened.lines.every((l,i)=>l.parts.join('')===exact[i].text));
});
test('Source word-advance crosses from Jaap Chhand 1 to 2 at correct original boundary',()=>{
 const index=source.units[0].lines.length-1;
 const next=core.advance({index,token:flattened.lines[index].tokens.length-1},flattened.lines);
 assert.equal(next.finished,false);assert.equal(next.index,index+1);assert.equal(next.token,0);
 assert.equal(flattened.lines[next.index].unitId,'jaap002');
});
test('Word guide reaches true end of Jaap Chhand 199 without fake postscript',()=>{
 const end=flattened.lines.length-1;
 const last=core.advance({index:end,token:flattened.lines[end].tokens.length-1},flattened.lines);
 assert.equal(last.finished,true);assert.equal(last.index,end);
});
test('A source-selected middle chhand maps correctly to original bounded line',()=>{
 const i=98;
 const pos=flattened.starts[i];
 assert.equal(flattened.lines[pos].unitId,'jaap099');
});
test('Existing reader state normalizes source-specific bookmarks and notes, not global learning',()=>{
 const bookmark='jaap099.line01',note='jaap100.line01';
 const state=core.normalise({read:{id:bookmark,offset:13},bookmarks:[bookmark],notes:{[note]:'TEST ONLY'},size:48},flattened,derived.units);
 assert.equal(state.read.id,bookmark);assert.ok(state.bookmarks.includes(bookmark));
 assert.equal(state.notes[note],'TEST ONLY');
 assert.equal(state.size,48);
});
test('199-chhand model is immutable in review bridge',()=>{
 assert.ok(Object.isFrozen(derived.units)&&derived.units.every(u=>Object.isFrozen(u)&&Object.isFrozen(u.lines)&&u.lines.every(l=>Object.isFrozen(l))));
});
test('Source-specific learning namespace never writes legacy Japji learning',()=>{
 assert.ok(derived.learningNamespace.startsWith('glp001.bani.jaap-sahib.'));
 assert.notEqual(derived.learningNamespace,'glp001.continuous.v2');
});
test('No implicit reader use or claim of publication authority is permitted',()=>{
 assert.throws(()=>adaptNonshippingSourceCandidate(source),/explicitly request/);
 assert.equal(derived.uiRoute,null);assert.equal(derived.releaseAuthorized,false);
});
test('Fake source approval/readable claims are rejected even when model is otherwise valid',()=>{
 const x=structuredClone(source);x.ui.readable=true;
 assert.throws(()=>adaptNonshippingSourceCandidate(x,{explicitReviewOnly:true}),/not-yet-readable/);
 const y=structuredClone(source);y.edition.humanCollationApproved=true;
 assert.throws(()=>adaptNonshippingSourceCandidate(y,{explicitReviewOnly:true}),/not-yet-readable/);
});
test('One original matra changed fails before the existing reader receives it',()=>{
 const x=structuredClone(source);x.units[100].lines[0].text+='ਾ';
 assert.throws(()=>adaptNonshippingSourceCandidate(x,{explicitReviewOnly:true}),/hash mismatch/);
});
test('Source verdict remains non-publishable even after 199 complete numbered chhands',()=>{
 assert.equal(validateComposition(source,{forPublication:true}).publishable,false);
 assert.equal(derived.sourceDigest,stableSourceDigest(source));
});
console.log(JSON.stringify({status:'PASS',checks:cases.length,cases,numberedChhands:199,originalLines:782,sourceMeterHeadings:21,baselineFlattenMs:duration,sourceApproved:false,published:false},null,2));
