/* GLP N1-B source-only existing reader parity, not an enabled Kirtan Sohila route. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {stableSourceDigest,validateComposition} from '../tools/compositions/composition-core.mjs';
import {adaptNonshippingSourceCandidate} from '../tools/compositions/continuous-source-parity.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const require=createRequire(import.meta.url);
const C=require('../js/continuous-core.js');
const model=JSON.parse(fs.readFileSync(path.join(root,'docs/research/n1-sohila/sohila-candidate-original.json'),'utf8'));
const clone=x=>structuredClone(x),cases=[];
function check(name,fn){fn();cases.push(name);}
const preview=adaptNonshippingSourceCandidate(model,{explicitReviewOnly:true});
const flattened=C.flatten(preview.units);
const original=model.units.flatMap(u=>u.lines);
check('Existing continuous core accepts 5 distinct non-Japji shabads with 56 original source rows',()=>{
 assert.equal(preview.units.length,5);assert.equal(flattened.lines.length,56);
});
check('Exact original Unicode order, stable occurrence IDs, Ang and SHA are preserved',()=>{
 assert.deepEqual(flattened.lines.map(l=>[l.id,l.text,l.sha256,l.ang]),original.map(l=>[l.id,l.text,l.sha256,l.location.ang]));
});
check('All original source headings occur once in reader line stream, not duplicated as lyrics',()=>{
 for(const u of model.units){
  assert.equal(flattened.lines.filter(l=>l.text===u.lines[0].text).length,1);
  assert.ok(preview.units.find(p=>p.id===u.unitId).originalHeadingIsFirstLine);
 }
});
check('Every source word retains the exact full unmodified text when flattening',()=>{
 assert.ok(flattened.lines.every((l,i)=>l.parts.join('')===original[i].text));
});
check('Original source ID lookup and each shabad start index are deterministic',()=>{
 assert.deepEqual(flattened.starts,[0,12,20,34,45]);
 preview.units.forEach((u,i)=>assert.equal(flattened.byId.get(u.lines[0].id),flattened.starts[i]));
});
check('Reader word guide can transition across a shabad without source mutation',()=>{
 const endIndex=11,last=flattened.lines[endIndex],lastToken=last.tokens.length-1;
 const next=C.advance({index:endIndex,token:lastToken},flattened.lines);
 assert.deepEqual(next,{index:12,token:0,finished:false,newLine:true});
 assert.equal(flattened.lines[next.index].id,'sohila02.line01');
});
check('Last original word ends a bounded five-shabad reading without synthetic lines',()=>{
 const i=55,last=flattened.lines[i];
 const next=C.advance({index:i,token:last.tokens.length-1},flattened.lines);
 assert.equal(next.finished,true);assert.equal(next.index,55);
});
check('Accepted R7 core preserves source state at its supported 48px maximum',()=>{
 const s=C.normalise({size:48,bookmarks:['sohila01.line03'],notes:{'sohila04.line03':'TEST ONLY Punjabi · ਪੰਜਾਬੀ'},read:{id:'sohila05.line01',offset:12}},flattened,preview.units);
 assert.equal(s.size,48);assert.ok(s.bookmarks.includes('sohila01.line03'));
 assert.equal(s.notes['sohila04.line03'],'TEST ONLY Punjabi · ਪੰਜਾਬੀ');
 assert.equal(s.read.id,'sohila05.line01');
});
check('A future source-specific learning namespace cannot overwrite existing Japji state',()=>{
 assert.equal(preview.learningNamespace,'glp001.bani.kirtan-sohila.'+model.edition.editionId+'.learning.v1');
 assert.notEqual(preview.learningNamespace,'glp001.continuous.v2');
});
check('The bridge freezes source line records to prohibit accidental changes',()=>{
 assert.ok(Object.isFrozen(preview.units));assert.ok(preview.units.every(u=>Object.isFrozen(u)&&Object.isFrozen(u.lines)&&u.lines.every(l=>Object.isFrozen(l))));
});
check('Adapter does not claim a public route, publisher authority or human review',()=>{
 assert.equal(preview.uiRoute,null);assert.equal(preview.releaseAuthorized,false);
 assert.equal(preview.kind,'NONSHIPPING_SOURCE_PARITY_ONLY');
 assert.equal(preview.sourceDigest,stableSourceDigest(model));
});
check('Unsafe implicit preview use is refused',()=>{
 assert.throws(()=>adaptNonshippingSourceCandidate(model),/explicitly request/);
});
check('Spoofed machine approval/readable flag is refused by source-only adapter',()=>{
 const x=clone(model);x.ui.readable=true;
 assert.throws(()=>adaptNonshippingSourceCandidate(x,{explicitReviewOnly:true}),/not-yet-readable/);
 const y=clone(model);y.edition.humanCollationApproved=true;
 assert.throws(()=>adaptNonshippingSourceCandidate(y,{explicitReviewOnly:true}),/not-yet-readable/);
});
check('Source mutation or invented Ang cannot enter existing reader engine',()=>{
 const a=clone(model);a.units[0].lines[0].text+='ਾ';
 assert.throws(()=>adaptNonshippingSourceCandidate(a,{explicitReviewOnly:true}),/hash mismatch/);
 const b=clone(model);b.units[0].lines[0].location.ang=1500;
 assert.throws(()=>adaptNonshippingSourceCandidate(b,{explicitReviewOnly:true}),/hash mismatch/);
});
check('Draft meaning or study data cannot be laundered through source parity',()=>{
 const x=clone(model);x.ui.meaningReviewStatus='draft';
 assert.throws(()=>adaptNonshippingSourceCandidate(x,{explicitReviewOnly:true}),/unapproved study/);
});
check('This source model still fails the existing public composition gate',()=>{
 assert.equal(validateComposition(model,{forPublication:true}).publishable,false);
});
check('Production Japji pages, frozen source and learning scripts are not changed by adapter',()=>{
 const js=fs.readFileSync(new URL('../tools/compositions/continuous-source-parity.mjs',import.meta.url),'utf8');
 assert.ok(!js.includes('localStorage')&&!js.includes('fetch(')&&!js.includes('document.createElement'));
});
console.log(JSON.stringify({status:'PASS',checks:cases.length,cases,originalLines:56,shabads:5,published:false},null,2));
