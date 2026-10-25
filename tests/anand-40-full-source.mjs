/* Anand Sahib complete 40-pauri digital source candidate with Pauri 24 hold.
 * No automatically corrected Gurbani or source/promotional permission.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {sha256,stableSourceDigest,validateComposition,learningNamespace} from '../tools/compositions/composition-core.mjs';
const root=new URL('../',import.meta.url);
const read=name=>JSON.parse(fs.readFileSync(new URL(name,root),'utf8'));
const model=read('docs/research/n2-anand/anand-40-original-candidate.json');
const ledger=read('docs/research/n2-anand/anand-complete-text-candidate-ledger.json');
const oldAudit=read('docs/research/n2-anand/anand-source-audit.json');
const lines=model.units.flatMap(u=>u.lines),checks=[];
const check=(name,fn)=>{fn();checks.push(name)};
check('Exactly 40 complete Anand pauris, not the six selected for Rehras',()=>{
 assert.equal(model.units.length,40);assert.equal(model.compositionId,'anand-sahib');assert.equal(model.edition.sourceFamily,'sggs');
});
check('Exactly 208 original verse rows plus two separate heading/Ik Onkar source rows',()=>{
 assert.equal(lines.length,208);assert.equal(model.prefaceOriginalDigitalCandidates.length,2);
 assert.equal(ledger.originalVerseRows,208);assert.equal(ledger.originalHeaders,2);
});
check('Pinned stable source digest catches whole-corpus word, sequence or hash drift',()=>{
 assert.equal(stableSourceDigest(model),'3efd383d9e5a351934d516582a7acb6d2eeb315f5faa8d4badf12cf3a31c9ab9');
});
check('All individual source line SHA-256s and unique IDs validate',()=>{
 const seen=new Set();
 for(const [i,u] of model.units.entries())for(const [j,line] of u.lines.entries()){
  assert.equal(line.id,u.unitId+'.line'+String(j+1).padStart(2,'0'));
  assert.equal(line.sha256,sha256(line.text));
  assert.ok(!seen.has(line.id));seen.add(line.id);
  assert.equal(line.location.pauri,i+1);
  assert.equal(line.location.pauriLine,j+1);
  assert.equal(line.location.system,'ang');
  assert.ok([917,918,919,920,921,922].includes(line.location.ang));
 }
});
check('Original digital source Ang and global row coverage is 0..209 exactly once',()=>{
 const indexes=[...model.prefaceOriginalDigitalCandidates.map((_,i)=>i),...lines.map(x=>x.location.globalSourceRow)].sort((a,b)=>a-b);
 assert.deepEqual(indexes,Array.from({length:210},(_,i)=>i));
});
check('Every original stanza has its numbered ending 1..40',()=>{
 const digits='੦੧੨੩੪੫੬੭੮੯';
 model.units.forEach((u,i)=>{
  const number=String(i+1).split('').map(c=>digits[Number(c)]).join('');
  assert.ok(u.lines.at(-1).text.includes('॥'+number+'॥'),u.unitId);
 });
});
check('Anand Pauri 24 has exactly one quarantined source anomaly',()=>{
 const suspicious=lines.filter(x=>x.humanTextEditionReviewNeeded);
 assert.equal(suspicious.length,1);
 assert.equal(suspicious[0].id,'anand24.line03');
 assert.equal(suspicious[0].location.globalSourceRow,123);
 assert.ok(suspicious[0].text.includes(String.fromCharCode(0xF03D)));
 assert.equal(model.units.filter(x=>x.reviewBlockedOnSourcePrivateUse).length,1);
});
check('Quarantined source text retains ORIGINAL SHA, is not machine corrected',()=>{
 const held=lines.find(x=>x.humanTextEditionReviewNeeded);
 assert.equal(sha256(held.text),held.sha256);
 assert.equal(ledger.originalLineAutoCorrectionPerformed,false);
});
check('Exactly 208 of 210 digital rows agree and two differences are honestly preserved',()=>{
 assert.equal(ledger.originalsMatchedNFC,208);
 assert.deepEqual(ledger.ambiguousRows.map(x=>x.globalRow),[0,123]);
 assert.equal(oldAudit.identicalNfcRows,208);
});
check('First digital source discrepancy is the title punctuation only',()=>{
 const x=ledger.ambiguousRows[0];
 assert.equal(x.originalPrimary,'ਰਾਮਕਲੀ ਮਹਲਾ ੩ ਅਨੰਦੁ');
 assert.equal(x.originalComparator,'ਰਾਮਕਲੀ ਮਹਲਾ ੩ ਅਨੰਦੁ ॥');
});
check('All source page URLs and SHA hashes are pinned to HTTPS receipts',()=>{
 assert.equal(ledger.primary.length,6);assert.equal(ledger.secondDigitalSource.length,6);
 for(const r of [...ledger.primary,...ledger.secondDigitalSource]){
  assert.equal(new URL(r.url).protocol,'https:');
  assert.equal(r.httpStatus,200);
  assert.match(r.pageSha256,/^[a-f0-9]{64}$/);
 }
});
check('Original edition is a machine-frozen candidate with no translator claim',()=>{
 const r=validateComposition(model);
 assert.equal(r.valid,true,JSON.stringify(r.errors));
 assert.equal(r.publishable,false);
 assert.equal(model.edition.humanCollationApproved,false);
 assert.equal(model.ui.meaningReviewStatus,'not_ingested');
 assert.equal(model.ui.studyReviewStatus,'not_ingested');
});
check('Publication gate refuses the unapproved full original',()=>{
 const r=validateComposition(model,{forPublication:true});
 assert.equal(r.publishable,false);
 assert.ok(r.errors.some(x=>x.reason==='second_bani_source_approval_missing'));
 assert.equal(ledger.publishedReaderReady,false);
});
check('Altered original Gurmukhi glyph fails before any reader adapter',()=>{
 const x=structuredClone(model);x.units[22].lines[0].text+='ਾ';
 assert.ok(validateComposition(x).errors.some(e=>e.reason==='immutable_line_hash_mismatch'));
});
check('Invented Ang outside SGGS bounds fails',()=>{
 const x=structuredClone(model);x.units[22].lines[0].location.ang=1900;
 assert.ok(validateComposition(x).errors.some(e=>e.reason==='invalid_sggs_ang'));
});
check('Independent local learning namespace preserves Japji reflection keys',()=>{
 assert.ok(learningNamespace(model.compositionId,model.edition.editionId).startsWith('glp001.bani.anand-sahib.'));
 assert.notEqual(learningNamespace(model.compositionId,model.edition.editionId),'glp001.continuous.v2');
});
check('No rights/qualified Sikh source approval was invented',()=>{
 assert.equal(ledger.digitalSourcesIndependentlyCollatedEdition,false);
 assert.equal(ledger.humanSikhPunjabiReview,'PENDING');
 assert.equal(ledger.rightsAndReuse,'PENDING');
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,cases:checks,pauris:40,originalVerseRows:208,quarantinedSourceRows:1,readableFamilyVersion:false},null,2));
