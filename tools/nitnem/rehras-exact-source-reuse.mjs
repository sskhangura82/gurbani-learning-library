/* GLP-001 Rehras: strictly source-exact reuse of prior Chaupai and Anand.
 *
 * Rehras digital witness (SGGS/Dasam composite, still NOT source approved):
 * 25 four-line Chaupai units = 100 source records;
 * Anand 1–5 and 40 = 32 source records.
 *
 * Reuse teaching if, and ONLY if, the exact original text bytes, UTF-8 SHA,
 * source family and entire source unit line order match a known immutable
 * source in the same library. This does not adjudicate variants or permit
 * editing underlying Gurbani. An exact text match is not an endorsement of
 * the AI-authored draft meaning and never elevates editorialStatus.
 *
 * Caller must have the frozen original Rehras, Chaupai, Anand source packs
 * and a source-hash-pinned educational course. Historical Rehras notes take
 * precedence and are never overwritten, even when the same source exists.
 */
import crypto from 'node:crypto';
const sha=s=>crypto.createHash('sha256').update(Buffer.from(s,'utf8')).digest('hex');
function ensure(x,msg){if(!x)throw Error('REHRAS SOURCE REUSE STOP: '+msg);}
function sourceFor(unit){
 if(/^rehras\.chaupai\d{2}$/.test(unit.id))
  return {bani:'chaupai',unitId:'chaupai-rehras'+unit.id.slice(-2),family:'dasam'};
 if(/^rehras\.anand(?:0[1-5]|40)$/.test(unit.id))
  return {bani:'anand',unitId:unit.id.slice('rehras.'.length),family:'sggs'};
 return null;
}
export function deriveExactRehrasTeaching({rehras,chaupai,anand,course,requireAll=false}){
 ensure(rehras.editionId==='sgpc-digital-composite-unreviewed-20261025','Unrecognized Rehras source edition');
 ensure(chaupai.originalCompositionId==='chaupai-website-expanded-29-variant','Unrecognized named Chaupai witness');
 ensure(anand.units.length===40,'Anand must have exactly 40 source pauris');
 ensure(course?.meta?.editorialStatus==='DRAFT_AI_UNREVIEWED'&&course.meta.publicationAllowed===false,'Teaching review state may not be promoted');
 const families={chaupai,anand};
 const lineDrafts=[],deepDrafts=[],reused=[],missingNotes=[],skippedHistorical=[],skippedUnitHistory=[];
 let matchedLineCount=0,matchingUnits=0;
 for(const dst of rehras.units){
  const src=sourceFor(dst);
  if(!src)continue;
  ensure(dst.sourceFamily===src.family,'Wrong source-family attribution '+dst.id);
  const found=families[src.bani].units.find(u=>u.id===src.unitId);
  ensure(found&&found.lines.length===dst.lines.length,'Missing/mixed original source unit '+dst.id);
  matchingUnits++;
  for(let i=0;i<dst.lines.length;i++){
   const target=dst.lines[i],origin=found.lines[i];
   ensure(!target.held&&!origin.held,'Held source cannot be reused '+dst.id);
   ensure(target.text===origin.text,'Source original bytes differ '+dst.id+' row '+i);
   ensure(target.sha256===origin.sha256&&sha(target.text)===target.sha256,'Original source SHA differs '+dst.id+' row '+i);
   matchedLineCount++;
   const dstKey='rehras|'+target.id,srcKey=src.bani+'|'+origin.id;
   const base=course.closeTextNotes[srcKey];
   const retained=course.closeTextNotes[dstKey];
   if(retained){
    ensure(retained.sourceSha256===target.sha256,'Historical Rehras note has wrong original SHA '+dstKey);
    skippedHistorical.push({rehrasLineId:target.id,originBani:src.bani,sourceLineId:origin.id,priorNoteKept:true});
   }else if(base){
    ensure(base.sourceSha256===origin.sha256&&base.status==='DRAFT_AI_UNREVIEWED','Source lesson has wrong SHA or unsafe approval '+srcKey);
    const entry={bani:'rehras',lineId:target.id,simpleEn:base.simpleEn,simplePa:base.simplePa,
     nuance:base.interpretiveCaution,
     meaningKind:'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION',
     editorialStatus:'DRAFT_AI_UNREVIEWED',
     sourceContext:'REUSED_ONLY_AFTER_EXACT_SOURCE_SHA_MATCH; '+srcKey+'; '+src.family+' witness; separate Rehras occurrence id'};
    ensure(entry.simpleEn.length>12&&entry.simplePa.length>8&&entry.nuance.length>28,'Insufficient source-bound note '+srcKey);
    lineDrafts.push(entry);
    reused.push({rehrasLineId:target.id,sourceBani:src.bani,originalLineId:origin.id,sha256:origin.sha256});
   }else missingNotes.push({rehrasLineId:target.id,sourceBani:src.bani,sourceLineId:origin.id,sha256:origin.sha256});
  }
  const dstKey='rehras|'+dst.id,srcKey=src.bani+'|'+found.id;
  if(course.unitLessons[dstKey]){
   skippedUnitHistory.push({rehrasUnitId:dst.id,priorStudyKept:true});
  }else{
   const old=course.unitLessons[srcKey];
   ensure(old&&old.status==='DRAFT_AI_UNREVIEWED','Source study missing for exact unit '+srcKey);
   ensure(old.sourceAnchor.id===found.lines[0].id&&old.sourceAnchor.sha256===found.lines[0].sha256,'Source deep-study anchor incorrect '+srcKey);
   const s=old.study;
   ensure(s&&s.words.length>=2,'Source study lacks words '+srcKey);
   for(const w of s.words)
    ensure(found.lines.some(l=>l.text.includes(w.gurmukhi))&&w.status==='WORKING_GLOSS_NOT_APPROVED','Unsafe original source word '+srcKey+' '+w.gurmukhi);
   const draft={bani:'rehras',unitId:dst.id,simpleEn:old.simple.en,simplePa:old.simple.pa,
    study:{focus:s.focus,closeReading:s.closeReading,
      words:s.words.map(x=>[x.gurmukhi,x.workingGloss]),
      care:s.interpretationCare+
       ' The exact same original source stanza also occurs here as Rehras '+dst.id+
       '; source context differs, do not silently conflate variant or recitation order.',
      reflection:s.reflection,teachBack:s.teachBack},
    editorialStatus:'DRAFT_AI_UNREVIEWED',
    sourceContext:'Exact full unit/source-text hash checked against '+srcKey};
   ensure(draft.simpleEn.length>35&&draft.simplePa.length>35&&draft.study.closeReading.length>90,'Incomplete old deep study '+srcKey);
   deepDrafts.push(draft);
  }
 }
 ensure(matchingUnits===31,'Expected 31 exact recurring source units, not '+matchingUnits);
 ensure(matchedLineCount===132,'Expected exact 132 recurring lines, not '+matchedLineCount);
 ensure(deepDrafts.length===28,'Expected exactly 28 previously unwritten recurring deeper Rehras units');
 ensure(skippedUnitHistory.length===3,'Exactly three original Rehras deep units must be preserved');
 ensure(skippedHistorical.length===2,'Exactly two historical Rehras line notes must stay unchanged');
 if(requireAll)ensure(missingNotes.length===0,'Some source notes not yet written: '+missingNotes.length);
 return {lineDrafts,deepDrafts,evidence:{
  matchedOriginalSourceLines:matchedLineCount,matchedOriginalUnits:matchingUnits,
  newExactSourceLineNoteDrafts:lineDrafts.length,newExactSourceStudyDrafts:deepDrafts.length,
  priorRehrasLineNotesPreserved:skippedHistorical,
  priorRehrasStudyUnitsPreserved:skippedUnitHistory,
  pendingNoteSourceMatches:missingNotes,
  allOriginalTextByteEqual:true,qualifiedReligiousApproval:false
 }};
}
