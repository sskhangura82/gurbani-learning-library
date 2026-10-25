import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {indexOriginal,assertVerbatim,auditQuotationSurfaces,validateClaimEnvelope} from '../tools/contracts/source-envelope.mjs';
const scope={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../js/japji-full-data.js',import.meta.url),'utf8'),scope);
const corpus=indexOriginal(scope.window.GLP_FULL_JAPJI.units),line=corpus.get('pauri01.line02');
const quote={occurrenceId:line.occurrenceId,sourceSha256:line.sha256,quote:'ਚੁਪੈ ਚੁਪ',ang:1};
const status={sourceChecked:false,reviewerSignoffs:[],founderProductAccepted:false,publishedRevision:null};
const evidence={EXAMPLE:{url:'https://example.org/synthetic-test-only',checkedOn:null,exactQuote:null}};
const claim={claimId:'synthetic.mind.quiet',subjectId:line.occurrenceId,domain:'exegesis',
 lang:'en',text:'Synthetic manuscript example; not Gurbani.',steward:'unit-test',anchor:quote,
 attribution:'Test-only attribution',evidenceIds:['EXAMPLE'],status};

test('385 frozen original Gurmukhi occurrences all pass their hashes',()=>{
 assert.equal(corpus.size,385);
 for(const r of corpus.values())assert.equal(createHash('sha256').update(r.text).digest('hex'),r.sha256);
});
test('Source-bound exact phrase passes',()=>assert.equal(assertVerbatim(quote,corpus).valid,true));
test('PR #9 risk: invented ਚੁਪਿ instead of actual ਚੁਪੈ is rejected',()=>{
 assert.throws(()=>assertVerbatim({...quote,quote:'ਚੁਪਿ'},corpus),/NOT_VERBATIM_GURBANI/);
});
test('Wrong source hash, occurrence and Ang all fail',()=>{
 assert.throws(()=>assertVerbatim({...quote,sourceSha256:'0'.repeat(64)},corpus),/STILL_MATCHES_FROZEN_HASH/);
 assert.throws(()=>assertVerbatim({...quote,occurrenceId:'unrecovered'},corpus),/UNKNOWN_OCCURRENCE/);
 assert.throws(()=>assertVerbatim({...quote,ang:2},corpus),/ANG_MISMATCH/);
});
test('Editorial Punjabi is distinctly labeled, never scripture',()=>{
 assert.deepEqual(auditQuotationSurfaces([{role:'scripture',...quote},{role:'editorial',text:'Our thought',label:'ours'}],corpus),{scripture:1,editorial:1});
 assert.throws(()=>auditQuotationSurfaces([{role:'editorial',text:'Our thought'}],corpus),/EDITORIAL_NOT_LABELED/);
});
test('An unreviewed draft with unresolved evidence remains an unreviewed draft',()=>{
 const r=validateClaimEnvelope(claim,{corpus,evidence});
 assert.equal(r.sourceChecked,false);assert.equal(r.published,false);assert.equal(r.reviewedRoles.length,0);
});
test('Source-checked status cannot claim an unresolved outside quote',()=>{
 assert.throws(()=>validateClaimEnvelope({...claim,status:{...status,sourceChecked:true}},{corpus,evidence}),/NOT_SOURCE_CHECKED/);
});
test('Founder approval alone never becomes a scholarly approval or publication',()=>{
 const s={...status,founderProductAccepted:true};
 assert.equal(validateClaimEnvelope({...claim,status:s},{corpus,evidence}).reviewedRoles.length,0);
 assert.throws(()=>validateClaimEnvelope({...claim,status:{...s,publishedRevision:'bad'}},{corpus,evidence}),/PUBLISH_GATES_MISSING/);
});
test('A source-checked, founder-accepted exegesis still requires role-bound human review',()=>{
 const sources={EXAMPLE:{url:'https://example.org/synthetic-test-only',checkedOn:'2026-10-24',exactQuote:'Synthetic quote'}};
 const s={...status,sourceChecked:true,founderProductAccepted:true,publishedRevision:'bad'};
 assert.throws(()=>validateClaimEnvelope({...claim,status:s},{corpus,evidence:sources}),/REVIEW_MISSING_sikh-punjabi/);
});
test('Psychology analogy demands tier and a non-equivalence boundary',()=>{
 const c={...claim,domain:'psychology'};
 assert.throws(()=>validateClaimEnvelope(c,{corpus,evidence}),/EVIDENCE_TIER_REQUIRED/);
 assert.throws(()=>validateClaimEnvelope({...c,tier:'A'},{corpus,evidence}),/COMPARISON_BOUNDARY_REQUIRED/);
 assert.equal(validateClaimEnvelope({...c,tier:'B',comparisonBoundary:'Not the meaning of Naam'},{corpus,evidence}).published,false);
});
test('Media may not be marked published without public reuse permission',()=>{
 const sources={EXAMPLE:{url:'https://example.org/synthetic-test-only',checkedOn:'2026-10-24',exactQuote:'Synthetic quote'}};
 const c={...claim,domain:'media',mediaRights:{licenseOrPermission:'synthetic',publicUsePermitted:false}};
 const s={sourceChecked:true,founderProductAccepted:true,publishedRevision:'candidate',reviewerSignoffs:[{
  role:'media-rights',contentSha256:createHash('sha256').update(c.text).digest('hex'),reviewedOn:'2026-10-24'}]};
 assert.throws(()=>validateClaimEnvelope({...c,status:s},{corpus,evidence:sources}),/RIGHTS_NOT_GRANTED/);
});
test('Scripture surfaces cannot disguise an English explanation as original words',()=>{
 assert.throws(()=>validateClaimEnvelope({...claim,domain:'scripture',text:'Not original words'},{corpus,evidence}),/SCRIPTURE_TEXT_DIFFERS/);
});
