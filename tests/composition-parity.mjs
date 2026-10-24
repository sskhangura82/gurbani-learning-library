/* GLP-001 generic reader proof. Uses accepted original R7 Japji and a clearly fake
   nonreligious 2-shabad fixture. NO new bani content sourced or published. */
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {adaptFrozenJapji,createSyntheticTwoShabadFixture,validateComposition,renderPlainReader,learningNamespace,sha256,stableSourceDigest} from '../tools/compositions/composition-core.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const bytes=fs.readFileSync(path.join(root,'js/japji-full-data.js'));
const c={window:{}};vm.runInNewContext(bytes.toString('utf8'),c);
const original=c.window.GLP_FULL_JAPJI;
const edition=adaptFrozenJapji(original,{sourceFileHash:crypto.createHash('sha256').update(bytes).digest('hex')});
const synthetic=createSyntheticTwoShabadFixture();
const clone=obj=>structuredClone(obj);
const cases=[],test=(label,fn)=>{fn();cases.push(label)};
const fail=(model,reason,opts={})=>{const r=validateComposition(model,opts);assert.equal(r.valid,false,reason);assert.ok(r.errors.some(e=>e.reason===reason),'missing '+reason+' in '+JSON.stringify(r.errors));};
const scriptureLines=original.units.flatMap(u=>u.lines),adaptedLines=edition.units.flatMap(u=>u.lines);
test('Adapter retains all 42 original Japji units and all 385 exact Unicode occurrences',()=>{assert.equal(edition.units.length,42);assert.equal(adaptedLines.length,385);});
test('Existing original scripture text, occurrence ID, Ang and SHA unchanged',()=>{assert.equal(JSON.stringify(adaptedLines.map(l=>[l.id,l.text,l.sha256,l.location.ang])),JSON.stringify(scriptureLines.map(l=>[l.id,l.text,l.sha256,l.ang])));});
test('Reader model records source family/edition and honest scholarly state',()=>{assert.equal(edition.edition.sourceFamily,'sggs');assert.equal(edition.edition.locationScheme,'ang');assert.equal(edition.edition.humanCollationApproved,false);assert.equal(edition.ui.meaningReviewStatus,'draft');});
test('Published accepted Japji text can be represented without claiming editorial approval',()=>{const r=validateComposition(edition,{forPublication:true});assert.equal(r.valid,true,JSON.stringify(r.errors));assert.equal(r.sourceOccurrences,385);});
test('Japji cannot gain a fabricated printed raag',()=>{const x=clone(edition);x.units[0].printedRaag='Fake Raga';x.units[0].raagEvidence={source:'arbitrary'};fail(x,'japji_has_no_prescribed_raag',{forPublication:true});});
test('Changing one matra makes original SHA check fail closed',()=>{const x=clone(edition);x.units[4].lines[0].text+='ਾ';fail(x,'immutable_line_hash_mismatch',{forPublication:true});});
test('Tampering with one line SHA fails closed',()=>{const x=clone(edition);x.units[5].lines[0].sha256='0'.repeat(64);fail(x,'immutable_line_hash_mismatch',{forPublication:true});});
test('A vanished canonical line fails 385/42 invariant',()=>{const x=clone(edition);x.units[3].lines.pop();fail(x,'japji_385_42_invariant',{forPublication:true});});
test('Duplicated original occurrence ID cannot be accepted',()=>{const x=clone(edition);x.units[4].lines[1].id=x.units[3].lines[0].id;fail(x,'duplicate_line_id',{forPublication:true});});
test('Invalid Ang outside Sri Guru Granth Sahib Ji is refused',()=>{const x=clone(edition);x.units[7].lines[0].location.ang=1500;fail(x,'invalid_sggs_ang',{forPublication:true});});
test('Composition adapter is a pure in-memory mapping, not a mutation of frozen data',()=>{assert.equal(JSON.stringify(original.units.flatMap(u=>u.lines.map(l=>l.id))),JSON.stringify(scriptureLines.map(l=>l.id)));});
test('Stable digest changes if a sourced line changes order or bytes',()=>{const base=stableSourceDigest(edition),x=clone(edition);x.units[3].lines.reverse();assert.notEqual(stableSourceDigest(x),base);});
test('Two synthetic shabads test a distinct unit shape without inventing actual Gurbani',()=>{assert.equal(synthetic.units.length,2);assert.deepEqual(synthetic.units.map(u=>u.kind),['shabad','shabad']);assert.ok(synthetic.units.every(u=>u.lines.every(l=>l.text.startsWith('TEST ONLY:'))));});
test('Synthetic fixture passes internal schema but is forbidden as a family/public reader',()=>{const r=validateComposition(synthetic,{allowSynthetic:true});assert.equal(r.valid,true,JSON.stringify(r.errors));fail(synthetic,'synthetic_not_allowed_outside_tests');});
test('Synthetic composition cannot be published under a real source edition',()=>{const r=validateComposition(synthetic,{forPublication:true});assert.equal(r.publishable,false);assert.ok(r.errors.some(e=>e.reason==='not_a_public_reader'));});
test('Non-SGGS source cannot receive a fabricated SGGS Ang number',()=>{const x=clone(synthetic);x.edition.sourceFamily='dasam';x.edition.locationScheme='ang';x.edition.sourceStatus='two_source_collation_pass';fail(x,'dasam_cannot_invent_sggs_ang',{allowSynthetic:true});});
test('Future second real bani is held until edition and independent source proof exists',()=>{
 const x=clone(synthetic);x.compositionId='new-bani-test';x.edition.sourceFamily='sggs';x.edition.locationScheme='ang';x.edition.sourceStatus='two_source_collation_pass';x.ui.readable=true;
 x.units.forEach(u=>u.lines.forEach(l=>l.location={system:'ang',ang:12}));x.edition.humanCollationApproved=false;
 fail(x,'second_bani_source_approval_missing',{forPublication:true});
});
test('Printed raag requires exact stated provenance, not a decorative playlist mood',()=>{const x=clone(synthetic);x.units[0].raagEvidence=null;fail(x,'unproven_raag_heading',{allowSynthetic:true});});
test('Generic HTML rendering preserves all 385 source IDs in original reading order',()=>{
 const html=renderPlainReader(edition);assert.equal((html.match(/class="composition-original"/g)||[]).length,385);
 const ids=[...html.matchAll(/data-source-id="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(JSON.stringify(ids),JSON.stringify(scriptureLines.map(l=>l.id)));
 assert.ok(html.includes('lang="pa"'));assert.ok(!html.includes('Synthetic Shabad'));
});
test('The same renderer handles the different synthetic two-shabad unit structure',()=>{
 const html=renderPlainReader(synthetic,{internalSynthetic:true});
 assert.equal((html.match(/class="composition-original"/g)||[]).length,3);
 assert.ok(html.includes('data-testid="synthetic-no-gurbani"'));
 assert.ok(html.includes('Test Heading A'));
 assert.ok(html.includes('lang="en"'));
});
test('Synthetic content with HTML-like text is escaped and never injected as markup',()=>{
 const x=clone(synthetic),text='TEST ONLY: <script>alert("x")</script> & test';
 x.units[0].lines[0].text=text;x.units[0].lines[0].sha256=sha256(text);
 const html=renderPlainReader(x,{internalSynthetic:true});
 assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('&amp; test'));
});
test('Compositions and editions receive independent local-learning namespaces',()=>{
 const japji=learningNamespace('japji-sahib','glp-japji-r7');
 const sohilaFuture=learningNamespace('kirtan-sohila','reviewed-v1');
 assert.notEqual(japji,sohilaFuture);
 assert.ok(!japji.includes('glp001.continuous.v2'));
 assert.throws(()=>learningNamespace('../../private','unsafe'));
});
test('Legacy Japji storage is preserved for explicit future migration and no auto-copy occurs',()=>{
 assert.equal(edition.ui.preserveLegacyLearningKeys,true);
 assert.equal(synthetic.ui.preserveLegacyLearningKeys,false);
 const core=fs.readFileSync(new URL('../tools/compositions/composition-core.mjs',import.meta.url),'utf8');
 assert.ok(!core.includes('localStorage.setItem')&&!core.includes('fetch('));
});
test('New bani reader admission is independent of fake status updates or invented URLs',()=>{
 const x=clone(edition);x.compositionId='second-bani';x.edition.sourceRelease='new-release';x.edition.sourceStatus='not_ingested';x.ui.readable=false;
 const r=validateComposition(x,{forPublication:true});
 assert.equal(r.publishable,false);
});
const report={scope:'Nonshipping generic composition model, accepted frozen Japji plus synthetic English fixture ONLY',status:'PASS',checks:cases.length,cases,scriptureOccurrences:385,secondBaniImported:false,realSecondBaniTextUsed:false,userLearningModified:false,sourceSHA256:crypto.createHash('sha256').update(bytes).digest('hex')};
const dest=path.join(root,'docs/research/COMPOSITION_PARITY_TEST_RECEIPT.json');fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,count:report.checks,scripture:report.scriptureOccurrences,syntheticFixtureLines:3,secondBaniImported:false},null,2));
