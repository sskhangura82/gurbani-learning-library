/* GLP-001 N3 Sravag Sudh source-candidate verification.
 * This is never authoritative edition, translation, or public reader approval.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {sha256,stableSourceDigest,validateComposition,learningNamespace} from '../tools/compositions/composition-core.mjs';
const root=new URL('../',import.meta.url);
const read=f=>JSON.parse(fs.readFileSync(new URL(f,root),'utf8'));
const model=read('docs/research/n3-dasam-savaiye/savaiye-ten-original-candidate.json');
const ledger=read('docs/research/n3-dasam-savaiye/savaiye-digital-discrepancy-ledger.json');
const program=read('docs/research/full-nitnem-program-20261025.json');
const caseNames=[],test=(name,fn)=>{fn();caseNames.push(name);};
const original=model.units.flatMap(u=>u.lines),clone=x=>structuredClone(x);
const fail=(x,reason)=>{const r=validateComposition(x);assert.equal(r.valid,false);assert.ok(r.errors.some(e=>e.reason===reason),'Missing '+reason+': '+JSON.stringify(r.errors));};
test('Candidate is Dasam Bani (Akal Ustat, Sravag Sudh), never SGGS',()=>{
 assert.equal(model.compositionId,'tav-prasad-savaiye');
 assert.equal(model.edition.sourceFamily,'dasam');
 assert.equal(model.edition.locationScheme,'dasam_section');
 assert.ok(model.sourceWork.includes('Akal Ustat'));
});
test('Exactly ten four-original-line Savaiye are present; no extra unrelated verse',()=>{
 assert.equal(model.units.length,10);assert.equal(original.length,40);
 assert.ok(model.units.every(u=>u.kind==='stanza'&&u.lines.length===4));
});
test('All 40 stable original-text IDs, hashes and Dasam-specific references are valid',()=>{
 let n=0;
 for(const [i,u] of model.units.entries())for(const [j,l] of u.lines.entries()){
  assert.equal(l.id,'savaiye'+String(i+1).padStart(2,'0')+'.line'+String(j+1).padStart(2,'0'));
  assert.equal(l.sha256,sha256(l.text));
  assert.equal(l.location.system,'dasam_section');
  assert.equal(l.location.savaiya,i+1);
  assert.equal(l.location.line,j+1);
  assert.ok(!('ang' in l.location));
  n++;
 }
 assert.equal(n,40);
});
test('Frozen candidate digest prevents future unreviewed changes including rehashed content',()=>{
 assert.equal(stableSourceDigest(model),'bbd78d6efc4339757199e3b06191de43ea886455d026ca35b5a09a78eb14ba8e');
});
test('All first four lines are exactly first Sravag Sudh Savaiya',()=>{
 assert.ok(model.units[0].lines[0].text.startsWith('ਸ੍ਰਾਵਗ ਸੁੱਧ'));
 assert.ok(model.units[0].lines.at(-1).text.endsWith('॥੧॥'));
});
test('Last four lines carry the complete tenth Savaiya and numbered closure',()=>{
 assert.ok(model.units[9].lines.at(-1).text.endsWith('॥੧੦॥'));
 assert.ok(model.units[9].lines[0].text.startsWith('ਕਾਹੂ ਲੈ ਪਾਹਨ'));
});
test('Three preface Gurmukhi records are separately preserved as source candidates',()=>{
 assert.equal(model.prefaceOriginalCandidate.length,3);
 assert.equal(model.prefaceOriginalCandidate[0].text,'ੴ');
 for(const p of model.prefaceOriginalCandidate)assert.equal(sha256(p.text),p.sha256);
});
test('Devotional site footer after tenth Savaiya was NOT added as a source lyric',()=>{
 assert.equal(ledger.primarySiteExtraDevotionalFooterExcluded,true);
 assert.match(ledger.siteFooterNotPartOfTenSavaiyeSha256,/^[a-f0-9]{64}$/);
 assert.ok(!original.some(x=>x.text.includes('ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ')));
});
test('No source heading is mistakenly given an SGGS raag',()=>{
 assert.ok(model.units.every(u=>u.printedRaag===null&&u.raagEvidence===null));
 assert.equal(model.ui.raagStatus,'not_applicable');
});
test('Digital source model is structurally valid, but public gate is BLOCKED',()=>{
 const r=validateComposition(model);assert.equal(r.valid,true,JSON.stringify(r.errors));assert.equal(r.publishable,false);
 const pub=validateComposition(model,{forPublication:true});assert.equal(pub.publishable,false);
 assert.ok(pub.errors.some(e=>e.reason==='second_bani_source_approval_missing'));
});
test('No modern translations or Study drafts are inside the candidate',()=>{
 assert.equal(model.ui.meaningReviewStatus,'not_ingested');
 assert.equal(model.ui.studyReviewStatus,'not_ingested');
 assert.equal(model.ui.readable,false);
 assert.ok(!JSON.stringify(model).includes('localStorage'));
});
test('Source/edition approvals and reuse rights are unproven, never machine-certified',()=>{
 assert.equal(model.edition.humanCollationApproved,false);
 assert.equal(model.edition.editionCitation,null);
 assert.equal(model.edition.editionAuthority,null);
 assert.equal(ledger.humanEditionCollation,'PENDING');
 assert.equal(ledger.reuseRights,'NOT_CLEARED');
 assert.equal(ledger.publicationAuthorized,false);
});
test('Two original public-source HTTPS retrieval receipts have full original-page hashes',()=>{
 for(const r of [ledger.primary,ledger.comparator]){
  assert.equal(new URL(r.url).protocol,'https:');
  assert.equal(r.httpStatus,200);
  assert.ok(r.contentBytes>20000);
  assert.match(r.pageSha256,/^[a-f0-9]{64}$/);
 }
});
test('All 40 line-to-line comparisons and original SHA matches are present',()=>{
 assert.equal(ledger.comparisons.length,40);
 for(const [i,row] of ledger.comparisons.entries()){
  assert.equal(row.ordinal,i+1);
  assert.equal(row.savaiya,Math.floor(i/4)+1);
  assert.equal(row.lineWithinSavaiya,(i%4)+1);
  assert.equal(row.primarySourceSHA256,original[i].sha256);
  assert.match(row.comparatorSourceSHA256,/^[a-f0-9]{64}$/);
 }
});
test('Original exact digital rows match 21/40; only verse numerals normalized 27/40',()=>{
 assert.equal(ledger.exactNfcWebRowMatches,21);
 assert.equal(ledger.numeralOnlyNormalizedRowMatches,27);
 assert.equal(ledger.sourceDifferencesAfterCounterComparison,13);
 assert.equal(ledger.comparisons.filter(x=>x.exactNfcWebRowMatch).length,21);
 assert.equal(ledger.comparisons.filter(x=>x.trailingNumeralsRemovedComparisonMatch).length,27);
});
test('All 13 substantive or orthographic variants are explicitly recorded with original text',()=>{
 const different=ledger.comparisons.filter(x=>x.requiresHumanSourceReview);
 assert.equal(different.length,13);
 assert.ok(different.every(x=>x.primaryDigitalOriginal&&x.comparatorDigitalOriginal));
 assert.ok(different.some(x=>x.savaiya===5));
});
test('External comparator independence is NOT claimed',()=>{
 assert.equal(ledger.independenceOfDigitalTextLineages,'UNVERIFIED');
 assert.ok(ledger.risks.some(x=>x.includes('not independent authoritative')));
});
test('Tampering with a matra fails without any text auto-repair',()=>{
 const x=clone(model);x.units[2].lines[0].text+='ਾ';
 fail(x,'immutable_line_hash_mismatch');
});
test('SGGS Ang added to Dasam source is rejected',()=>{
 const x=clone(model);x.units[3].lines[1].location={system:'ang',ang:1};
 fail(x,'invalid_location_system');
});
test('Duplicate ID fails occurrence uniqueness gate',()=>{
 const x=clone(model);x.units[0].lines[1].id=x.units[0].lines[0].id;
 fail(x,'duplicate_line_id');
});
test('Printed raag invented for unprescribed source fails unless separately proven',()=>{
 const x=clone(model);x.units[0].printedRaag='Invented';x.units[0].raagEvidence=null;
 fail(x,'unproven_raag_heading');
});
test('A hypothetical source edition update requires distinct learning namespace',()=>{
 assert.ok(learningNamespace(model.compositionId,model.edition.editionId).includes('tav-prasad-savaiye'));
 assert.notEqual(learningNamespace(model.compositionId,model.edition.editionId),'glp001.continuous.v2');
});
test('Morning Savaiye is not evening Pae Gahe segment in Rehras ledger',()=>{
 const rehras=read('docs/research/n4-rehras-component-ledger.json');
 assert.ok(rehras.segments[2].sourceReference.includes('not a substitute'));
 assert.equal(program.records.find(x=>x.id==='savaiye').period,'morning');
});
test('No release route, family site change, or whole-Nitnem publication claim',()=>{
 const x=program.records.find(x=>x.id==='savaiye');
 assert.equal(x.readerRoute,null);
 assert.equal(program.publicationAuthorized,false);
 assert.equal(ledger.fullReaderReady,false);
});
console.log(JSON.stringify({status:'PASS',checks:caseNames.length,cases:caseNames,digitalStanzas:10,digitalSourceLines:40,exactWebRows:21,countersOnlyComparableRows:27,unresolvedVariants:13,familyReaderPublished:false},null,2));
