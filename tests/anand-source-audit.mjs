/* GLP-001 N2: read-only exact original Anand 40-pauri structural source audit. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const read=file=>JSON.parse(fs.readFileSync(new URL(file,root),'utf8'));
const evidence=read('docs/research/n2-anand/anand-source-audit.json');
const program=read('docs/research/full-nitnem-program-20261025.json');
const anand=program.records.find(x=>x.id==='anand');
const cases=[];function test(label,fn){fn();cases.push(label);}
test('Anand is strictly SGGS, not Dasam or Rehras composition',()=>{assert.equal(evidence.sourceFamily,'sggs');assert.equal(evidence.compositionId,'anand-sahib');assert.equal(anand.sourceFamily,'sggs');});
test('Candidate source covers all six Ang 917–922 pages',()=>{assert.deepEqual(evidence.sourceAngs,[917,918,919,920,921,922]);assert.equal(evidence.primary.length,6);assert.equal(evidence.comparator.length,6);});
test('Digital page rows exactly partition 210 source rows',()=>{assert.deepEqual(evidence.firstPageRows,[38,36,36,35,33,32]);assert.equal(evidence.firstPageRows.reduce((a,b)=>a+b),210);});
test('Anand full source contains precisely 40 consecutively numbered pauri endings',()=>{assert.equal(evidence.pauriCount,40);assert.equal(evidence.pauriNumberEndings.length,40);assert.deepEqual(evidence.pauriNumberEndings.map(x=>x.pauri),Array.from({length:40},(_,i)=>i+1));});
test('Pauri ending indices rise in original source reading order',()=>{for(let i=1;i<40;i++)assert.ok(evidence.pauriNumberEndings[i].globalRow>evidence.pauriNumberEndings[i-1].globalRow);});
test('Each pauri ending binds an Ang, original source digest and bounded row index',()=>{for(const r of evidence.pauriNumberEndings){assert.ok([917,918,919,920,921,922].includes(r.ang));assert.ok(r.globalRow>=2&&r.globalRow<210);assert.match(r.sourceSha256,/^[a-f0-9]{64}$/);}});
test('210 digital source rows are compared without hiding exactly two disagreements',()=>{assert.equal(evidence.totalCandidateDigitalRows,210);assert.equal(evidence.identicalNfcRows,208);assert.equal(evidence.unicodeOrHeadingMismatches.length,2);assert.deepEqual(evidence.unicodeOrHeadingMismatches.map(x=>x.globalRow),[0,123]);});
test('First discrepancy is only a source heading punctuation difference requiring review',()=>{const x=evidence.unicodeOrHeadingMismatches[0];assert.equal(x.ang,917);assert.equal(x.originalPrimary,'ਰਾਮਕਲੀ ਮਹਲਾ ੩ ਅਨੰਦੁ');assert.equal(x.originalComparator,'ਰਾਮਕਲੀ ਮਹਲਾ ੩ ਅਨੰਦੁ ॥');});
test('Ang 920 disagreement preserves PUA U+F03D without silently inventing a replacement',()=>{const x=evidence.unicodeOrHeadingMismatches[1];assert.equal(x.ang,920);assert.equal(x.globalRow,123);assert.ok(x.originalPrimary.includes(String.fromCharCode(0xF03D)));assert.ok(x.originalComparator.startsWith('ਕਹਦੇ ਕਚੇ ਸੁਣਦੇ ਕਚੇ'));assert.ok(x.primaryNonstandardUnicode.some(y=>y.codepoint==='U+F03D'));});
test('Digital retrieval references are HTTPS and pinned to original page-byte digests',()=>{for(const row of [...evidence.primary,...evidence.comparator]){assert.equal(new URL(row.url).protocol,'https:');assert.ok(['srigurugranth.net','opengranth.org'].includes(new URL(row.url).hostname));assert.match(row.pageSha256,/^[a-f0-9]{64}$/);assert.ok(row.bytes>10000);}});
test('No Anand source composition model is emitted or linked as available',()=>{assert.equal(evidence.candidateSourceModelProduced,false);assert.equal(anand.sourceState,'source_audit_blocked');assert.equal(anand.readerRoute,null);});
test('Human edition adjudication and publication remain separate gates',()=>{assert.equal(evidence.humanEditionCollation,'PENDING');assert.equal(evidence.rightsReview,'PENDING');assert.equal(evidence.publicationAuthorized,false);assert.equal(anand.sourceAudit.humanEditionAdjudication,'PENDING');});
test('Full Anand source is not replaced by the six-pauri Rehras selection',()=>{assert.ok(anand.originalScope.includes('Forty pauris'));assert.ok(program.records.find(x=>x.id==='rehras').sourceAnchor.includes('Anand'));});
test('Program explicitly binds the 40-pauri source review discrepancy to its own receipt',()=>{assert.equal(anand.sourceAudit.evidenceFile,'docs/research/n2-anand/anand-source-audit.json');assert.deepEqual(anand.sourceAudit.disputedDigitalRowIndexes,[0,123]);assert.equal(anand.sourceAudit.machineIntakePromotable,false);});
console.log(JSON.stringify({status:'PASS',checks:cases.length,cases,pauris:40,sourceRows:210,exactComparisons:208,unresolved:[0,123],release:false},null,2));
