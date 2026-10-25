/* N3 Dasam source-shortlist review: references, not reproduced scripture. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const x=JSON.parse(fs.readFileSync(new URL('docs/research/n3-dasam-source-shortlist.json',root),'utf8'));
const program=JSON.parse(fs.readFileSync(new URL('docs/research/full-nitnem-program-20261025.json',root),'utf8'));
const results=[];
function check(title,fun){fun();results.push(title);}
check('Reference-catalog-only source state cannot be treated as edition collation',()=>{
 assert.equal(x.status,'PUBLIC_LIBRARY_INDEXES_PLUS_SAVAIYE_DIGITAL_CANDIDATE_NOT_EDITION_VERIFIED');
 assert.equal(x.publicDigitizedIndex.checkedAs,'catalog_index_only_not_pdf_contents');
 assert.equal(x.publicDigitizedIndex.kind.includes('not an authenticated publisher seal'),true);
});
check('Named SGPC framework has HTTPS provenance',()=>assert.equal(new URL(x.publisherFramework.url).protocol,'https:'));
check('Vidhia library link is correctly catalog-only',()=>{assert.equal(new URL(x.publicDigitizedIndex.url).protocol,'https:');assert.ok(x.publicDigitizedIndex.items.length>=5);assert.ok(x.publicDigitizedIndex.items.every(e=>e.candidateOnly===true));});
check('All three morning Dasam Banis are tracked and not published',()=>{
 assert.deepEqual(x.banis.map(y=>y.id),['jaap','savaiye','chaupai']);
 assert.ok(x.banis.every(y=>y.sourceFamily==='dasam'&&!y.editionSelected&&!y.originalSourceImported&&y.readerRoute===null));
});
check('No guessed SGGS Ang in Dasam source anchors',()=>{for(const b of x.banis)assert.ok(!/Ang \d+/.test(JSON.stringify(b.namedBoundary)));});
check('Ten morning Savaiye explicitly differ from evening one',()=>{const b=x.banis.find(b=>b.id==='savaiye');assert.equal(b.expectedUnits,10);assert.ok(b.requirements.some(s=>s.includes('Pae Gahe')));});
check('Chaupai morning/SGPC evening source boundaries are held separately',()=>{const b=x.banis.find(b=>b.id==='chaupai');assert.ok(b.namedBoundary.start.includes('ਹਮਰੀ ਕਰੋ'));assert.ok(b.namedBoundary.end.includes('ਦੁਸਟ ਦੋਖ'));assert.ok(b.requirements.some(s=>s.includes('not equated silently')));});
check('Selected authentic primary edition and full text are both NOT available',()=>{assert.ok(x.banis.every(b=>b.editionSelected===false&&b.originalSourceImported===false));assert.equal(x.security.pdfContentsReviewed,false);});
check('No OCR, PDF commits, third-party copy permission or web live route claims',()=>{assert.equal(x.security.ocrPerformed,false);assert.equal(x.security.downloadedFilesCommitted,false);assert.equal(x.security.mediaRightsApproved,false);assert.equal(x.security.readersEnabled,false);});
check('N3 records Savaiye only as a digital research candidate, with no family-reader access',()=>{for(const y of x.banis){const v=program.records.find(p=>p.id===y.id);assert.equal(v.sourceState,y.id==='savaiye'?'digital_candidate':'not_ingested');assert.equal(v.readerRoute,null);}assert.equal(x.banis.find(b=>b.id==='savaiye').digitalResearchCandidate.familyRuntimeImported,false);});
check('Qualified human review and founder publication remain necessary',()=>{assert.equal(x.humanReviewStatus,'PENDING');assert.equal(x.releaseAuthorized,false);assert.equal(program.publicationAuthorized,false);});
console.log(JSON.stringify({status:'PASS',checks:results.length,cases:results,scope:'catalog candidates only; no textual edition verified'},null,2));
