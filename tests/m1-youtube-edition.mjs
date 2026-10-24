/* Synthetic-only uploader-edition binding test: real YouTube identity + duration + 3 human-checked anchor commitments.
   Pass means metadata accepts reviewable recordings; it cannot fingerprint third-party video content at runtime. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createLineIndex,validateTimingMap,assessYouTubePlayback,segmentAt} from '../tools/alignment/alignment-core.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const file=fs.readFileSync(path.join(root,'js/japji-full-data.js'));
const c={window:{}};vm.runInNewContext(file.toString('utf8'),c);
const idx=createLineIndex(c.window.GLP_FULL_JAPJI.units);
const sha=crypto.createHash('sha256').update(file).digest('hex');
const lines=['pauri01.line01','pauri01.line02','pauri01.line03'];
const get=i=>idx.get(lines[i]).sha256;
const options={lineIndex:idx,scriptureRelease:'japji-v1-0.9-r7',corpusSha256:sha,forPublic:true,durationMs:9000};
const make=()=>({
 schema:1,reviewStatus:'line_checked',
 source:{scriptureRelease:'japji-v1-0.9-r7',corpusSha256:sha},
 recording:{
  recordingId:'consented_pilot_001',provenance:'creator_supplied',
  contentSha256:'a'.repeat(64),videoId:'M7lc1UVf-VE',
  rights:{privateConsentRef:'rights-consented_pilot1',analysisPermitted:true,publicTimingMetadataPermitted:true,publicReferencePermitted:true},
  videoBinding:{
   observedDurationMs:9000,
   sourceOffsetMs:1000,
   checkedAt:'2026-10-24',
   anchors:[
    {occurrenceId:lines[0],sourceSha256:get(0),sourceTimeMs:500,videoTimeMs:1500,reviewerConfirmed:true},
    {occurrenceId:lines[1],sourceSha256:get(1),sourceTimeMs:1800,videoTimeMs:2800,reviewerConfirmed:true},
    {occurrenceId:lines[2],sourceSha256:get(2),sourceTimeMs:4000,videoTimeMs:5000,reviewerConfirmed:true}
   ]
  }
 },
 reviewer:{reviewRecordId:'timing-review-pilot_001',role:'independent_timing_reviewer',date:'2026-10-24'},
 segments:[
 {kind:'unmapped',reason:'intro',startMs:0,endMs:1000},
 {kind:'mapped',occurrenceId:lines[0],sourceSha256:get(0),startMs:1000,endMs:1800},
 {kind:'unmapped',reason:'pause',startMs:1800,endMs:2300},
 {kind:'mapped',occurrenceId:lines[1],sourceSha256:get(1),startMs:2300,endMs:4000},
 {kind:'mapped',occurrenceId:lines[2],sourceSha256:get(2),startMs:4000,endMs:6000},
 {kind:'unmapped',reason:'other',startMs:6000,endMs:9000}
 ]});
const clone=x=>structuredClone(x);
const checkList=[],check=(label,fn)=>{fn();checkList.push(label);};
const err=m=>validateTimingMap(m,options).errors.map(e=>e.reason);
check('Valid synthetic-style metadata shape with attested creator-bound version is structurally accepted',()=>{
 const m=make();assert.equal(validateTimingMap(m,options).valid,true);
 assert.equal(validateTimingMap(m,options).eligibleForSynchronizedDisplay,true);
});
check('Player matching video ID and observed duration unlocks checked-map metadata gate',()=>{
 const result=assessYouTubePlayback(make(),options,{videoId:'M7lc1UVf-VE',providerDurationMs:9000});
 assert.equal(result.syncAllowed,true);
 assert.ok(result.limits.includes('same-duration'));
});
check('Eight-second additional intro fails closed despite identical YouTube ID',()=>{
 const r=assessYouTubePlayback(make(),options,{videoId:'M7lc1UVf-VE',providerDurationMs:17000});
 assert.equal(r.syncAllowed,false);assert.equal(r.reason,'video_edition_duration_mismatch');
});
check('Missing runtime duration fails closed until YouTube API returns it',()=>{
 for(const v of [0,null,NaN,Infinity,undefined])assert.equal(assessYouTubePlayback(make(),options,{videoId:'M7lc1UVf-VE',providerDurationMs:v}).syncAllowed,false);
});
check('Different video ID fails even with same duration',()=>{
 assert.equal(assessYouTubePlayback(make(),options,{videoId:'M7lc1UVf-VA',providerDurationMs:9000}).syncAllowed,false);
});
check('Reviewed map with YouTube ID but no checked upload descriptor fails',()=>{
 const m=make();delete m.recording.videoBinding;
 assert.ok(err(m).includes('youtube_version_binding_required'));
 assert.equal(assessYouTubePlayback(m,options,{videoId:'M7lc1UVf-VE',providerDurationMs:9000}).syncAllowed,false);
});
check('Original-audio offset disagreement fails the map',()=>{
 const m=make();m.recording.videoBinding.sourceOffsetMs=0;
 assert.ok(err(m).includes('anchor_offset_mismatch'));
});
check('Shifted creator upload anchor fails against original segment when duration was changed',()=>{
 const m=make();
 m.recording.videoBinding.observedDurationMs=17000;
 m.recording.videoBinding.sourceOffsetMs=9000;
 m.recording.videoBinding.anchors.forEach(a=>a.videoTimeMs+=8000);
 assert.ok(err(m).includes('anchor_does_not_match_reviewed_video_segment'));
});
check('Anchor without a checked original-text line hash cannot authorize sync',()=>{
 const m=make();m.recording.videoBinding.anchors[1].sourceSha256='b'.repeat(64);
 assert.ok(err(m).includes('anchor_occurrence_unverified'));
});
check('Anchors must be human checked, diverse, ordered and spaced through reviewed coverage',()=>{
 let m=make();m.recording.videoBinding.anchors[0].reviewerConfirmed=false;
 assert.ok(err(m).includes('anchor_human_check_missing'));
 m=make();m.recording.videoBinding.anchors[2].videoTimeMs=1700;m.recording.videoBinding.anchors[2].sourceTimeMs=700;
 assert.ok(err(m).includes('anchor_clock_invalid'));
 m=make();m.recording.videoBinding.anchors=m.recording.videoBinding.anchors.slice(0,2);
 assert.ok(err(m).includes('video_anchor_count_invalid'));
});
check('Intro and silence remain unhighlighted even with a valid video descriptor',()=>{
 const m=make();
 assert.equal(segmentAt(m.segments,500),null);assert.equal(segmentAt(m.segments,2000),null);
 assert.equal(segmentAt(m.segments,1800),null);assert.equal(segmentAt(m.segments,8500),null);
});
check('A title, hash and runtime clock do not let automated code detect a same-duration content edit',()=>{
 const m=make();
 const r=assessYouTubePlayback(m,options,{videoId:m.recording.videoId,providerDurationMs:9000});
 assert.equal(r.syncAllowed,true);
 assert.ok(r.limits.includes('Cannot detect same-duration content edits'));
});
check('Malformed reviewed map segment never crashes anchor validation',()=>{
 const m=make();m.segments[1]=null;
 const result=validateTimingMap(m,options);
 assert.equal(result.valid,false);
 assert.ok(result.errors.some(e=>e.reason==='segment_not_object'));
 assert.equal(assessYouTubePlayback(m,options,{videoId:'M7lc1UVf-VE',providerDurationMs:9000}).syncAllowed,false);
});
const report={status:'PASS',checkCount:checkList.length,checks:checkList,recordingConsumed:false,claim:'Metadata-only synthetic fixtures; NO verification of YouTube content audio itself.'};
fs.writeFileSync(path.join(root,'docs/research/M1_VIDEO_VERSION_BINDING_TESTS.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
