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

export function segmentAt(segments,clockMs){
 if(!num(clockMs)||!Array.isArray(segments))return null;
 let lo=0,hi=segments.length-1;
 while(lo<=hi){const mid=(lo+hi)>>1,seg=segments[mid];if(clockMs<seg.startMs)hi=mid-1;else if(clockMs>=seg.endMs)lo=mid+1;else return seg.kind==='mapped'?seg:null;}
 return null;
}
export function boundaryError({expected,actual}){
 if(!Array.isArray(expected)||!Array.isArray(actual)||!expected.length||expected.length!==actual.length)throw Error('Matched boundary data required');
 const errors=expected.map((e,i)=>{if(!num(e)||!num(actual[i]))throw Error('Non-numeric boundary');return Math.abs(actual[i]-e)}).sort((a,b)=>a-b);
 return {sample:errors.length,medianAbsMs:errors[Math.floor((errors.length-1)/2)],p95AbsMs:errors[Math.ceil(.95*errors.length)-1],maxAbsMs:errors.at(-1)};
}
