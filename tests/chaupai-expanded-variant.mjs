/* N3 Chaupai 25-pauri SGPC Rehras excerpt versus site-specific 29.
 * Both digital originals are research candidates; no universal morning scope,
 * editorial approval, personal data or in-app family reader.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {sha256,stableSourceDigest,validateComposition,learningNamespace} from '../tools/compositions/composition-core.mjs';
const root=new URL('../',import.meta.url);
const read=n=>JSON.parse(fs.readFileSync(new URL(n,root),'utf8'));
const core=read('docs/research/n4-chaupai-excerpt/chaupai-sgpc-excerpt-candidate.json');
const model=read('docs/research/n3-chaupai-variants/chaupai-site-expanded-29-pauri-candidate.json');
const evidence=read('docs/research/n3-chaupai-variants/chaupai-long-short-boundary-ledger.json');
const tests=[];function check(n,fn){fn();tests.push(n);}
const units=model.units,lines=units.flatMap(u=>u.lines);
check('Extended variant is explicitly named as website-specific, NOT universal SGPC morning rule',()=>{
 assert.equal(model.compositionId,'chaupai-website-expanded-29-variant');
 assert.equal(evidence.expandedVariantPracticeApproved,false);
 assert.ok(evidence.warning.includes('NOT assert'));
});
check('Exactly 29 four-tuk original units and 116 individually hashed original rows',()=>{
 assert.equal(units.length,29);assert.equal(lines.length,116);
 assert.ok(units.every(x=>x.lines.length===4));
});
check('Entire version-specific source digest is pinned',()=>{
 assert.equal(stableSourceDigest(model),'38f72beb6d004281739e37f36e124eab7e43d3ec4a90d8bd822cfaedf468b3b2');
});
check('First 25 SGPC Rehras excerpt pauris are reused byte-for-byte without changing Gurmukhi',()=>{
 const prior=core.units.flatMap(u=>u.lines);
 assert.equal(prior.length,100);
 for(let i=0;i<100;i++){
  assert.equal(lines[i].text,prior[i].text);
  assert.equal(lines[i].sha256,prior[i].sha256);
  assert.equal(lines[i].id,prior[i].id);
 }
});
check('Additional website Pauris 26–29 have correct numbered closing boundaries',()=>{
 const digits='੦੧੨੩੪੫੬੭੮੯';
 for(let i=26;i<=29;i++){
  const u=units[i-1];
  const ending=String(i).split('').map(n=>digits[Number(n)]).join('');
  assert.equal(u.lines.length,4);
  assert.ok(u.lines.at(-1).text.endsWith('॥'+ending+'॥'),u.unitId);
 }
});
check('Pauree 28 Arill and 29 Chaupai metre headings stay independent from verse rows',()=>{
 const extra=units.slice(25);
 assert.deepEqual(extra.map(x=>x.meterHeadingDigitalCandidate?.length||0),[0,0,1,1]);
 assert.ok(extra[2].meterHeadingDigitalCandidate[0].text.startsWith('ਅੜਿੱਲ'));
 assert.ok(extra[3].meterHeadingDigitalCandidate[0].text.startsWith('ਚੌਪਈ'));
 assert.ok(!extra.flatMap(u=>u.lines).some(l=>l.text==='ਅੜਿੱਲ ॥'||l.text==='ਚੌਪਈ ॥'));
});
check('Original 116 text byte hashes and non-SGGS location schemes validate',()=>{
 const unique=new Set();
 for(const l of lines){
  assert.equal(sha256(l.text),l.sha256);
  assert.ok(!unique.has(l.id));unique.add(l.id);
  assert.equal(l.location.system,'dasam_section');
  assert.ok(!('ang' in l.location));
 }
});
check('Boundary difference 25 versus 29 has independent named records',()=>{
 assert.equal(evidence.SGPCRehrasBound.pauris,25);
 assert.equal(evidence.expandedWebsiteBound.pauris,29);
 assert.deepEqual(evidence.expandedWebsiteBound.remainingPauris,[26,27,28,29]);
});
check('Four added pauris contain 16 original new tuks and no silent rewritten bytes',()=>{
 assert.equal(evidence.additionalPaureeOriginals,16);
 assert.equal(units.slice(25).flatMap(u=>u.lines).length,16);
});
check('16 extra digital comparisons record 7 exact and 9 after verse number comparison',()=>{
 const diffs=evidence.additionComparedWithSecondSite;
 assert.equal(diffs.length,16);
 assert.equal(evidence.newAdditionalTukExactMatches,7);
 assert.equal(evidence.newAdditionalTukCounterComparisonMatches,9);
});
check('Every changed additional source record includes both original digital variants',()=>{
 const selected=evidence.additionComparedWithSecondSite.filter(x=>x.needsHumanEditionComparison);
 assert.equal(selected.length,7);
 assert.ok(selected.every(x=>x.primaryDigitalText&&x.comparatorDigitalText));
});
check('Website additional Savaiya and Dohira remain separate from 29-pauri Chaupai',()=>{
 assert.deepEqual(evidence.postScriptCandidateSections.map(x=>x.kind),['evening_savaiya_candidate','dohira_candidate']);
 assert.deepEqual(evidence.postScriptCandidateSections.map(x=>x.originalLines.length),[4,2]);
 assert.equal(lines.length,116);
});
check('Website devotional signoff was recorded as a digest, never inserted into Gurbani originals',()=>{
 assert.match(evidence.unapprovedDevotionalWebsiteFooterSha256,/^[a-f0-9]{64}$/);
 assert.ok(!lines.some(l=>l.text.includes('ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ')));
});
check('This machine-digitized expanded source is structurally valid but cannot be published',()=>{
 assert.equal(validateComposition(model).valid,true);
 const r=validateComposition(model,{forPublication:true});
 assert.equal(r.publishable,false);
 assert.ok(r.errors.some(x=>x.reason==='second_bani_source_approval_missing'));
});
check('A one-matra source mutation fails the line hash guard',()=>{
 const x=structuredClone(model);x.units[26].lines[0].text+='ਾ';
 assert.ok(validateComposition(x).errors.some(x=>x.reason==='immutable_line_hash_mismatch'));
});
check('The expanded 29-pauri source has its own learning key namespace',()=>{
 assert.notEqual(learningNamespace(model.compositionId,model.edition.editionId),learningNamespace(core.compositionId,core.edition.editionId));
 assert.notEqual(learningNamespace(model.compositionId,model.edition.editionId),'glp001.continuous.v2');
});
check('Printed edition, public release and qualified Sikh/Punjabi signoff are withheld',()=>{
 assert.equal(evidence.humanSourceEditionReview,'PENDING');
 assert.equal(evidence.rightsApproved,false);
 assert.equal(evidence.published,false);
 assert.equal(model.edition.humanCollationApproved,false);
});
console.log(JSON.stringify({status:'PASS',checks:tests.length,tests,SGPCRehrasPauris:25,siteExpandedPauris:29,additionalVariantDifferences:7,published:false},null,2));
