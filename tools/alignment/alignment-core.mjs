/* GLP-001 M1 metadata-only timing validator. Never touches media or credentials. */
import crypto from 'node:crypto';
const VIDEO=/^[A-Za-z0-9_-]{11}$/;
const SHA=/^[0-9a-f]{64}$/i;
const STATES=new Set(['synthetic','candidate','line_checked','word_checked']);
const PROVENANCE=new Set(['synthetic_fixture','self_recorded','creator_supplied']);
const UNMAPPED=new Set(['intro','commentary','pause','ad','silence','other']);
const num=x=>typeof x==='number'&&Number.isFinite(x);
const issue=(reason,index)=>index===undefined?{reason}:{reason,index};

export function createLineIndex(units){
 const registry=new Map();
 for(const unit of units)for(const line of unit.lines){
  if(registry.has(line.id))throw Error('Duplicate canonical occurrence');
  const digest=crypto.createHash('sha256').update(line.text,'utf8').digest('hex');
  if(digest!==line.sha256)throw Error('Canonical scripture hash mismatch: '+line.id);
  registry.set(line.id,Object.freeze({sha256:line.sha256,tokenCount:(line.text.match(/\S+/gu)||[]).length,ang:line.ang,unitId:unit.id}));
 }
 return registry;
}

/* Bind reviewed timing to the actual checked YouTube upload/edition, not merely its ID.
   Anchors attest manual checking; they cannot fingerprint a mutable YouTube stream.
   An edited video with identical duration may be undetectable at runtime. */
function checkVideoBinding(map,lineIndex,errors){
 const rec=map.recording||{},v=rec.videoBinding;
 if(!rec.videoId)return;
 if(!v||typeof v!=='object'){errors.push(issue('youtube_version_binding_required'));return;}
 if(!Number.isInteger(v.observedDurationMs)||v.observedDurationMs<=0||v.observedDurationMs>86400000)errors.push(issue('video_duration_invalid'));
 if(!Number.isInteger(v.sourceOffsetMs)||Math.abs(v.sourceOffsetMs)>3600000)errors.push(issue('video_source_offset_invalid'));
 if(!/^20\d\d-\d\d-\d\d$/.test(v.checkedAt||''))errors.push(issue('video_version_review_date_required'));
 if(!Array.isArray(v.anchors)||v.anchors.length<3||v.anchors.length>100) {errors.push(issue('video_anchor_count_invalid'));return;}
 const seen=new Set();let previous=-1;
 for(let i=0;i<v.anchors.length;i++){
  const a=v.anchors[i],src=lineIndex?.get(a?.occurrenceId);
  if(!src||src.sha256!==a.sourceSha256||seen.has(a.occurrenceId)){errors.push(issue('anchor_occurrence_unverified',i));continue;}
  seen.add(a.occurrenceId);
  if(a.reviewerConfirmed!==true)errors.push(issue('anchor_human_check_missing',i));
  if(!Number.isInteger(a.videoTimeMs)||!Number.isInteger(a.sourceTimeMs)||a.videoTimeMs<0||a.sourceTimeMs<0||a.videoTimeMs<previous||a.videoTimeMs>=v.observedDurationMs)errors.push(issue('anchor_clock_invalid',i));
  if(Number.isInteger(v.sourceOffsetMs)&&Math.abs(a.videoTimeMs-a.sourceTimeMs-v.sourceOffsetMs)>500)errors.push(issue('anchor_offset_mismatch',i));
  const matched=segmentAt(map.segments,a.videoTimeMs);
  if(!matched||matched.occurrenceId!==a.occurrenceId)errors.push(issue('anchor_does_not_match_reviewed_video_segment',i));
  previous=a.videoTimeMs;
 }
 if(v.anchors.length>=3&&Array.isArray(map.segments)&&map.segments.length){
  const first=map.segments[0],last=map.segments.at(-1);
  const span=first&&last&&Number.isFinite(first.startMs)&&Number.isFinite(last.endMs)?last.endMs-first.startMs:NaN;
  const spread=v.anchors.at(-1).videoTimeMs-v.anchors[0].videoTimeMs;
  if(Number.isFinite(span)&&spread<span*.35)errors.push(issue('anchor_distribution_too_narrow'));
 }
}

export function validateTimingMap(map,{lineIndex,scriptureRelease,corpusSha256,forPublic=false,durationMs=null}={}){
 const errors=[];
 if(!(lineIndex instanceof Map)||lineIndex.size===0)errors.push(issue('no_canonical_index'));
 if(!map||typeof map!=='object'||Array.isArray(map))return {valid:false,eligibleForSynchronizedDisplay:false,errors:[issue('map_missing')]};
 if(map.schema!==1)errors.push(issue('schema_version_mismatch'));
 if(!STATES.has(map.reviewStatus))errors.push(issue('unknown_review_status'));
 if(map.source?.scriptureRelease!==scriptureRelease||map.source?.corpusSha256!==corpusSha256||!SHA.test(map.source?.corpusSha256||''))errors.push(issue('source_release_or_hash_mismatch'));
 const rec=map.recording||{};
 if(!PROVENANCE.has(rec.provenance))errors.push(issue('unknown_recording_provenance'));
 if(!/^[-A-Za-z0-9_]{4,96}$/.test(rec.recordingId||''))errors.push(issue('invalid_recording_reference'));
 if(rec.videoId!==null&&rec.videoId!==undefined&&!VIDEO.test(rec.videoId))errors.push(issue('invalid_youtube_video_id'));
 if(rec.provenance!=='synthetic_fixture'&&!SHA.test(rec.contentSha256||''))errors.push(issue('source_audio_hash_missing'));
 if(rec.provenance==='synthetic_fixture'&&map.reviewStatus!=='synthetic')errors.push(issue('synthetic_cannot_be_reviewed'));
 const rights=rec.rights||{};
 if(rec.provenance!=='synthetic_fixture'&&(!rights.analysisPermitted||!/^rights[-_][A-Za-z0-9_-]{4,96}$/.test(rights.privateConsentRef||'')))errors.push(issue('private_rights_attestation_missing'));
 if(!Array.isArray(map.segments)||!map.segments.length||map.segments.length>100000)errors.push(issue('invalid_segments'));
 else{
  let end=-1;
  const occurrences=new Map(); // occurrenceId -> {takes,lastWordIndex}; word segments in the same take are not repeated lines
  for(let i=0;i<map.segments.length;i++){
   const seg=map.segments[i];
   if(!seg||typeof seg!=='object'){errors.push(issue('segment_not_object',i));continue;}
   if(!Number.isInteger(seg.startMs)||!Number.isInteger(seg.endMs)||seg.startMs<0||seg.endMs<=seg.startMs)errors.push(issue('bad_time',i));
   if(seg.startMs<end)errors.push(issue('overlap_or_backwards_time',i));
   if(num(durationMs)&&seg.endMs>durationMs+2000)errors.push(issue('beyond_duration',i));
   if(Number.isInteger(seg.endMs))end=seg.endMs;
   if(seg.kind==='unmapped'){
    if(!UNMAPPED.has(seg.reason)||seg.occurrenceId||seg.wordIndex!==undefined)errors.push(issue('bad_unmapped_marker',i));
    continue;
   }
   if(seg.kind!=='mapped'){errors.push(issue('bad_kind',i));continue;}
   const source=lineIndex?.get(seg.occurrenceId);
   if(!source||source.sha256!==seg.sourceSha256)errors.push(issue('unknown_or_altered_scripture',i));
   else{
    if(map.reviewStatus==='word_checked'){
     if(!Number.isInteger(seg.wordIndex)||seg.wordIndex<0||seg.wordIndex>=source.tokenCount)errors.push(issue('word_index_out_of_range',i));
    }else if(seg.wordIndex!==undefined)errors.push(issue('unreviewed_word_index',i));
    const previous=occurrences.get(seg.occurrenceId);
    if(!previous){
     if(seg.repeatTake!==undefined&&seg.repeatTake!==0)errors.push(issue('bad_first_take',i));
     occurrences.set(seg.occurrenceId,{takes:0,lastWordIndex:seg.wordIndex??null});
    }else if(map.reviewStatus==='word_checked'){
     const nextTake=seg.repeatTake===undefined?previous.takes:seg.repeatTake;
     if(nextTake===previous.takes&&Number.isInteger(seg.wordIndex)&&seg.wordIndex>previous.lastWordIndex){
      previous.lastWordIndex=seg.wordIndex; // ordinary next word, not a repeated recitation
     }else if(nextTake===previous.takes+1&&Number.isInteger(seg.wordIndex)){
      previous.takes=nextTake;previous.lastWordIndex=seg.wordIndex;
     }else errors.push(issue('repeat_must_be_explicit',i));
    }else{
     if(seg.repeatTake!==previous.takes+1)errors.push(issue('repeat_must_be_explicit',i));
     previous.takes+=1;
    }
   }
   if(seg.confidence!==undefined&&(!num(seg.confidence)||seg.confidence<0||seg.confidence>1))errors.push(issue('invalid_confidence',i));
  }
 }
 const reviewed=['line_checked','word_checked'].includes(map.reviewStatus);
 if(reviewed&&rec.videoId)checkVideoBinding(map,lineIndex,errors);
 const seal=map.reviewer||{};
 if(reviewed&&(!/^timing-review-[A-Za-z0-9_-]{4,96}$/.test(seal.reviewRecordId||'')||typeof seal.role!=='string'||seal.role.trim().length<3||!/^20\d\d-\d\d-\d\d$/.test(seal.date||'')))errors.push(issue('qualified_review_record_missing'));
 if(forPublic){
  if(!reviewed)errors.push(issue('not_checked_for_public_sync'));
  if(rec.provenance==='synthetic_fixture')errors.push(issue('synthetic_never_public'));
  if(!rights.publicTimingMetadataPermitted||!rights.publicReferencePermitted)errors.push(issue('public_rights_attestation_missing'));
 }
 const valid=errors.length===0;
 const safeSegments=Array.isArray(map.segments)?map.segments:[];
 return {valid,eligibleForSynchronizedDisplay:Boolean(valid&&reviewed&&rec.provenance!=='synthetic_fixture'),reviewStatus:map.reviewStatus,mappedSegments:safeSegments.filter(s=>s?.kind==='mapped').length,coveredOccurrences:new Set(safeSegments.filter(s=>s?.kind==='mapped').map(s=>s.occurrenceId)).size,errors};
}

/* Strict, metadata-only runtime gate. No access to video pixels/audio is assumed. */
export function assessYouTubePlayback(map,opts,{videoId,providerDurationMs}={}){
 const validated=validateTimingMap(map,{...opts,forPublic:true});
 if(!validated.eligibleForSynchronizedDisplay)return {syncAllowed:false,reason:'rights_review_or_video_binding_failed'};
 const binding=map.recording?.videoBinding;
 if(!binding||map.recording.videoId!==videoId)return {syncAllowed:false,reason:'youtube_id_mismatch'};
 if(!Number.isFinite(providerDurationMs)||providerDurationMs<=0)return {syncAllowed:false,reason:'video_duration_unavailable'};
 const tolerance=Math.min(2000,Math.max(1000,binding.observedDurationMs*.001));
 if(Math.abs(providerDurationMs-binding.observedDurationMs)>tolerance)return {syncAllowed:false,reason:'video_edition_duration_mismatch'};
 return {syncAllowed:true,reason:'id_duration_reviewed_anchors_match_metadata',limits:'Cannot detect same-duration content edits automatically; re-check suspicious uploads'};
}

export function segmentAt(segments,clockMs){
 if(!num(clockMs)||!Array.isArray(segments))return null;
 let lo=0,hi=segments.length-1;
 while(lo<=hi){const mid=(lo+hi)>>1,seg=segments[mid];if(!seg||!Number.isFinite(seg.startMs)||!Number.isFinite(seg.endMs))return null;if(clockMs<seg.startMs)hi=mid-1;else if(clockMs>=seg.endMs)lo=mid+1;else return seg.kind==='mapped'?seg:null;}
 return null;
}
export function boundaryError({expected,actual}){
 if(!Array.isArray(expected)||!Array.isArray(actual)||!expected.length||expected.length!==actual.length)throw Error('Matched boundary data required');
 const errors=expected.map((e,i)=>{if(!num(e)||!num(actual[i]))throw Error('Non-numeric boundary');return Math.abs(actual[i]-e)}).sort((a,b)=>a-b);
 return {sample:errors.length,medianAbsMs:errors[Math.floor((errors.length-1)/2)],p95AbsMs:errors[Math.ceil(.95*errors.length)-1],maxAbsMs:errors.at(-1)};
}
