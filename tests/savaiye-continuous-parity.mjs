/* GLP N3: source-only ten-Savaiye compatibility with the existing Japji
 * continuous word clock, refusing SGGS Angs or new public scripture routes.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {adaptNonshippingSourceCandidate} from '../tools/compositions/continuous-source-parity.mjs';
import {validateComposition,stableSourceDigest} from '../tools/compositions/composition-core.mjs';
const root=new URL('../',import.meta.url),read=f=>JSON.parse(fs.readFileSync(new URL(f,root),'utf8'));
const C=createRequire(import.meta.url)('../js/continuous-core.js');
const model=read('docs/research/n3-dasam-savaiye/savaiye-ten-original-candidate.json');
const parsed=adaptNonshippingSourceCandidate(model,{explicitReviewOnly:true});
const source=model.units.flatMap(x=>x.lines),flat=C.flatten(parsed.units);
const tests=[];function check(name,fn){fn();tests.push(name);}
check('Ten four-line units fit the same existing continuous reader core',()=>{
 assert.equal(parsed.units.length,10);assert.equal(flat.lines.length,40);
 assert.deepEqual(flat.starts,[0,4,8,12,16,20,24,28,32,36]);
});
check('Every original source byte, ID and hash remain untouched',()=>{
 assert.deepEqual(flat.lines.map(x=>[x.id,x.text,x.sha256]),source.map(x=>[x.id,x.text,x.sha256]));
});
check('Every word token reconstructs the exact 40 original-line strings',()=>{
 assert.ok(flat.lines.every((line,i)=>line.parts.join('')===source[i].text));
});
check('No fictitious SGGS Ang can be displayed for Dasam Bani',()=>{
 assert.ok(flat.lines.every(x=>x.ang===null));
 assert.equal(parsed.sourceFamily,'dasam');
});
check('Real source locations remain available separately from SGGS Ang labels',()=>{
 for(const line of source){
  const loc=parsed.sourceLocationByOccurrence[line.id];
  assert.equal(loc.system,'dasam_section');
  assert.ok(loc.savaiya>=1&&loc.savaiya<=10);
  assert.ok(loc.line>=1&&loc.line<=4);
  assert.equal(loc.ang,undefined);
  assert.ok(Object.isFrozen(loc));
 }
});
check('Existing timed word guide walks from one Savaiya to the next',()=>{
 const last=flat.lines[3],point={index:3,token:last.tokens.length-1};
 const next=C.advance(point,flat.lines);
 assert.equal(next.index,4);assert.equal(next.token,0);assert.equal(next.newLine,true);assert.equal(next.finished,false);
});
check('Guide terminates exactly after tenth Savaiya without extra website footer',()=>{
 const last=flat.lines.at(-1),end=C.advance({index:39,token:last.tokens.length-1},flat.lines);
 assert.equal(end.index,39);assert.equal(end.finished,true);
 assert.ok(flat.lines.every(x=>!x.text.includes('ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ')));
});
check('The candidate contains ten full numbered Savaiye, not the evening Rehras one',()=>{
 assert.equal(model.units.length,10);
 assert.ok(flat.lines.at(-1).text.endsWith('॥੧੦॥'));
 assert.ok(flat.lines[0].text.startsWith('ਸ੍ਰਾਵਗ ਸੁੱਧ'));
});
check('Pending prefatory text is separately retained, not misclassified as lyrics',()=>{
 assert.equal(model.prefaceOriginalCandidate.length,3);
 assert.equal(flat.lines.length,40);
 assert.ok(!flat.lines.some(x=>x.text==='ੴ'));
});
check('A source-specific future learning namespace cannot touch Japji learning keys',()=>{
 assert.ok(parsed.learningNamespace.startsWith('glp001.bani.tav-prasad-savaiye.'));
 assert.notEqual(parsed.learningNamespace,'glp001.continuous.v2');
});
check('Our existing R7 pure core holds 48px settings only and this is not falsely 60px',()=>{
 const s=C.normalise({size:60,bookmarks:['savaiye02.line03'],read:{id:'savaiye07.line01',offset:8}},flat,parsed.units);
 assert.equal(s.size,48);
 assert.ok(s.bookmarks.includes('savaiye02.line03'));
 assert.equal(s.read.id,'savaiye07.line01');
});
check('The new adapter never silently substitutes translations or educational content',()=>{
 assert.equal(parsed.uiRoute,null);assert.equal(parsed.releaseAuthorized,false);
 assert.equal(parsed.kind,'NONSHIPPING_SOURCE_PARITY_ONLY');
 assert.equal(parsed.sourceDigest,stableSourceDigest(model));
});
check('Untrusted source model cannot declare itself published or approved',()=>{
 const x=structuredClone(model);x.ui.readable=true;
 assert.throws(()=>adaptNonshippingSourceCandidate(x,{explicitReviewOnly:true}),/not-yet-readable/);
 const y=structuredClone(model);y.edition.humanCollationApproved=true;
 assert.throws(()=>adaptNonshippingSourceCandidate(y,{explicitReviewOnly:true}),/not-yet-readable/);
});
check('Tampering with one matra fails the source SHA gate before reaching renderer',()=>{
 const x=structuredClone(model);x.units[0].lines[0].text+='ਾ';
 assert.throws(()=>adaptNonshippingSourceCandidate(x,{explicitReviewOnly:true}),/hash mismatch/);
});
check('Synthetic/non-source normalizations cannot promote the original web comparison',()=>{
 const report=read('docs/research/n3-dasam-savaiye/savaiye-digital-discrepancy-ledger.json');
 assert.equal(report.sourceDifferencesAfterCounterComparison,13);
 assert.equal(report.publicationAuthorized,false);
 assert.equal(validateComposition(model,{forPublication:true}).publishable,false);
});
check('All source-unit records are frozen and rejected without explicit review-only caller flag',()=>{
 assert.ok(Object.isFrozen(parsed.units));assert.ok(parsed.units.every(u=>Object.isFrozen(u)&&u.lines.every(l=>Object.isFrozen(l))));
 assert.throws(()=>adaptNonshippingSourceCandidate(model),/explicitly request/);
});
console.log(JSON.stringify({status:'PASS',checks:tests.length,cases:tests,dasamAngInvented:false,originalLines:40,savaiye:10,sourceApproved:false,published:false},null,2));
