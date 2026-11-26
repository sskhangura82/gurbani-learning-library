import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createLineIndex,validateTimingMap,assessYouTubePlayback,segmentAt,boundaryError} from '../tools/alignment/alignment-core.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const bytes=fs.readFileSync(path.join(root,'js/japji-full-data.js'));
const ctxt={window:{}};vm.runInNewContext(bytes.toString('utf8'),ctxt);
const units=ctxt.window.GLP_FULL_JAPJI.units;
const idx=createLineIndex(units),sourceSha256=crypto.createHash('sha256').update(bytes).digest('hex'),scriptureRelease='japji-v1-0.9-r7';
const ids=['pauri01.line01','pauri01.line02','pauri01.line03'],lines=ids.map(id=>({id,...idx.get(id)}));
const opts={lineIndex:idx,scriptureRelease,corpusSha256:sourceSha256,durationMs:9900};
const synthetic={
 schema:1,reviewStatus:'synthetic',
 source:{scriptureRelease,corpusSha256:sourceSha256},
 recording:{recordingId:'synthetic_001',provenance:'synthetic_fixture',videoId:null},
 segments:[
 {kind:'unmapped',reason:'intro',startMs:0,endMs:500},
 {kind:'mapped',occurrenceId:ids[0],sourceSha256:lines[0].sha256,startMs:500,endMs:1800,confidence:.85},
 {kind:'unmapped',reason:'pause',startMs:1800,endMs:2100},
 {kind:'mapped',occurrenceId:ids[1],sourceSha256:lines[1].sha256,startMs:2100,endMs:3700,confidence:.9},
 {kind:'unmapped',reason:'commentary',startMs:3700,endMs:4100},
 {kind:'mapped',occurrenceId:ids[2],sourceSha256:lines[2].sha256,startMs:4100,endMs:6000}
 ]};
function bindCheckedVideo(map){
 map.recording.videoBinding={
  observedDurationMs:9900,sourceOffsetMs:1000,checkedAt:'2026-10-24',
  anchors:[
   {occurrenceId:ids[0],sourceSha256:lines[0].sha256,videoTimeMs:1500,sourceTimeMs:500,reviewerConfirmed:true},
   {occurrenceId:ids[1],sourceSha256:lines[1].sha256,videoTimeMs:2900,sourceTimeMs:1900,reviewerConfirmed:true},
   {occurrenceId:ids[2],sourceSha256:lines[2].sha256,videoTimeMs:5000,sourceTimeMs:4000,reviewerConfirmed:true}
  ]
 };
 return map;
}
const clone=x=>structuredClone(x);
const errors=m=>validateTimingMap(m,opts).errors.map(e=>e.reason);
const checks=[];const check=(label,fn)=>{fn();checks.push(label);};
check('Frozen 385 occurrence registry uses original per-line hashes',()=>assert.equal(idx.size,385));
check('Synthetic timeline is well-formed but cannot claim synchronization',()=>{
 const result=validateTimingMap(synthetic,opts);assert.equal(result.valid,true);assert.equal(result.eligibleForSynchronizedDisplay,false);
 assert.equal(result.mappedSegments,3);assert.equal(result.coveredOccurrences,3);
});
check('Unmapped introduction and pauses produce no bogus highlight',()=>{
 assert.equal(segmentAt(synthetic.segments,200),null);
 assert.equal(segmentAt(synthetic.segments,1800),null);
 assert.equal(segmentAt(synthetic.segments,3900),null);
 assert.equal(segmentAt(synthetic.segments,1500).occurrenceId,ids[0]);
 assert.equal(segmentAt(synthetic.segments,2100).occurrenceId,ids[1]);
 assert.equal(segmentAt(synthetic.segments,9901),null);
});
check('Public sync rejects synthetic fixture even if mechanically valid',()=>assert.equal(validateTimingMap(synthetic,{...opts,forPublic:true}).eligibleForSynchronizedDisplay,false));
check('Invalid or missing canonical Gurmukhi source is rejected',()=>{
 const bad=clone(synthetic);bad.source.corpusSha256='f'.repeat(64);
 assert.ok(errors(bad).includes('source_release_or_hash_mismatch'));
 bad.source.corpusSha256=sourceSha256;bad.segments[1].sourceSha256='f'.repeat(64);
 assert.ok(errors(bad).includes('unknown_or_altered_scripture'));
});
check('Timeline overlap or time reversal cannot pass',()=>{
 const bad=clone(synthetic);bad.segments[2].startMs=1700;
 assert.ok(errors(bad).includes('overlap_or_backwards_time'));
 bad.segments[2].startMs=-1;
 assert.ok(errors(bad).includes('bad_time'));
});
check('Undeclared repeats cannot be mistaken for another source occurrence',()=>{
 const bad=clone(synthetic);const s={...bad.segments[1],startMs:6000,endMs:7200};bad.segments.push(s);
 assert.ok(errors(bad).includes('repeat_must_be_explicit'));
 s.repeatTake=1;assert.equal(validateTimingMap(bad,opts).valid,true);
});
check('Missing independent human review cannot claim line sync',()=>{
 const rec=clone(synthetic);rec.reviewStatus='candidate';rec.recording={recordingId:'pilot_0001',provenance:'self_recorded',contentSha256:'a'.repeat(64),videoId:'M7lc1UVf-VE',rights:{privateConsentRef:'rights-consent_00001',analysisPermitted:true}};
 assert.equal(validateTimingMap(rec,opts).valid,true);
 assert.equal(validateTimingMap(rec,opts).eligibleForSynchronizedDisplay,false);
 assert.ok(validateTimingMap(rec,{...opts,forPublic:true}).errors.some(e=>e.reason==='not_checked_for_public_sync'));
});
check('Real recording without consent record cannot be admitted',()=>{
 const rec=clone(synthetic);rec.reviewStatus='candidate';rec.recording={recordingId:'pilot_0002',provenance:'creator_supplied',contentSha256:'a'.repeat(64),videoId:'M7lc1UVf-VE',rights:{}};
 assert.ok(errors(rec).includes('private_rights_attestation_missing'));
});
check('Only checked line map with recording rights and review seal can sync',()=>{
 const map=clone(synthetic);map.reviewStatus='line_checked';
 map.recording={recordingId:'pilot_0003',provenance:'creator_supplied',contentSha256:'a'.repeat(64),videoId:'M7lc1UVf-VE',rights:{privateConsentRef:'rights-consent_00003',analysisPermitted:true,publicTimingMetadataPermitted:true,publicReferencePermitted:true}};
 map.reviewer={reviewRecordId:'timing-review-00003',role:'independent_timing_reviewer',date:'2026-10-24'};
 bindCheckedVideo(map);
 assert.equal(validateTimingMap(map,{...opts,forPublic:true}).eligibleForSynchronizedDisplay,true);
 map.recording.rights.publicTimingMetadataPermitted=false;
 assert.equal(validateTimingMap(map,{...opts,forPublic:true}).eligibleForSynchronizedDisplay,false);
});
check('Word maps require reviewed indices and source bounds',()=>{
 const map=clone(synthetic);map.reviewStatus='word_checked';
 map.recording={recordingId:'pilot_0004',provenance:'self_recorded',contentSha256:'a'.repeat(64),videoId:null,rights:{privateConsentRef:'rights-consent_00004',analysisPermitted:true}};
 map.reviewer={reviewRecordId:'timing-review-00004',role:'word_boundary_reviewer',date:'2026-10-24'};
 map.segments.filter(s=>s.kind==='mapped').forEach((s,i)=>s.wordIndex=i);
 assert.equal(validateTimingMap(map,opts).valid,true);
 map.segments[1].wordIndex=999;
 assert.ok(errors(map).includes('word_index_out_of_range'));
});
check('Word index cannot be laundered into line-reviewed mapping',()=>{
 const bad=clone(synthetic);bad.segments[1].wordIndex=2;
 assert.ok(errors(bad).includes('unreviewed_word_index'));
});
check('Invalid video IDs cannot be used in metadata',()=>{
 const bad=clone(synthetic);bad.recording.videoId='youtube.com/watch';
 assert.ok(errors(bad).includes('invalid_youtube_video_id'));
});
check('Unknown occurrence, missing mapped kind and invalid confidence rejected',()=>{
 const bad=clone(synthetic);bad.segments[1].occurrenceId='fake.line99';
 assert.ok(errors(bad).includes('unknown_or_altered_scripture'));
 const other=clone(synthetic);other.segments[1].confidence=2;
 assert.ok(errors(other).includes('invalid_confidence'));
});
check('Boundary measurement calculates declared sample error, not invented accuracy',()=>{
 const r=boundaryError({expected:[1000,2000,3000,4000,5000],actual:[1100,2300,3100,4500,5200]});
 assert.equal(r.sample,5);assert.equal(r.medianAbsMs,200);assert.equal(r.p95AbsMs,500);
});
check('No media data, secret or YouTube downloads in alignment core',()=>{
 const text=fs.readFileSync(path.join(root,'tools/alignment/alignment-core.mjs'),'utf8');
 for(const forbidden of ['youtube-dl','yt-dlp','getUserMedia','MediaRecorder','captions.download','api_key','OPENAI_API_KEY'])assert.ok(!text.includes(forbidden),forbidden);
});
check('Consecutive mapped words of one tuk do not count as a repeated performance',()=>{
 const base={
  ...clone(synthetic),
  reviewStatus:'word_checked',
  recording:{recordingId:'pilot_word1',provenance:'self_recorded',contentSha256:'a'.repeat(64),videoId:null,rights:{privateConsentRef:'rights-consent_00005',analysisPermitted:true}},
  reviewer:{reviewRecordId:'timing-review-00005',role:'word_boundary_reviewer',date:'2026-10-24'},
  segments:[
   {kind:'mapped',occurrenceId:ids[0],sourceSha256:lines[0].sha256,wordIndex:0,startMs:0,endMs:350},
   {kind:'mapped',occurrenceId:ids[0],sourceSha256:lines[0].sha256,wordIndex:1,startMs:350,endMs:700},
   {kind:'mapped',occurrenceId:ids[0],sourceSha256:lines[0].sha256,wordIndex:2,startMs:700,endMs:1100}
  ]
 };
 assert.equal(validateTimingMap(base,opts).valid,true);
 const repeat=clone(base);repeat.segments.push({...repeat.segments[0],startMs:1100,endMs:1400});
 assert.ok(errors(repeat).includes('repeat_must_be_explicit'));
 repeat.segments.at(-1).repeatTake=1;
 assert.equal(validateTimingMap(repeat,opts).valid,true);
});
check('Malformed segments cannot crash metadata validation',()=>{
 const broken=clone(synthetic);broken.segments='bad';
 const result=validateTimingMap(broken,opts);
 assert.equal(result.valid,false);assert.ok(result.errors.some(e=>e.reason==='invalid_segments'));
});
const result={project:'GLP-001',suite:'M1 metadata preregistration',status:'PASS',count:checks.length,checks,realMediaProcessed:false,qualifiedReviewPerformed:false};
fs.mkdirSync(path.join(root,'docs','research'),{recursive:true});
fs.writeFileSync(path.join(root,'docs','research','M1_PROTOCOL_TEST_RECEIPT.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,checks:result.count,realMediaProcessed:false,qualifiedReviewPerformed:false},null,2));
