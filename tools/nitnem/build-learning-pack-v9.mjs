/* Add reviewed-as-draft source packets to the exact recovered active V8.
 * All original scripture and prior course snapshots are immutable.
 * Explicit editorial amendments retain their before/after evidence.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {deriveExactRehrasTeaching} from './rehras-exact-source-reuse.mjs';
import {rehrasUniqueLineDrafts,rehrasUniqueDeepDrafts} from './rehras-unique-source-drafts.mjs';
import {jaapEarlyLines,jaapEarlyDeep} from './jaap-chhands01-15-drafts.mjs';
import {anandOpeningAmendments} from './anand-opening-editorial-amendments.mjs';
import {jaapEarlyAmendments,jaapEarlyStudyAmendments} from './jaap-early-editorial-amendments.mjs';
import {rehrasUniqueAmendments,rehrasUniqueStudyAmendments} from './rehras-unique-editorial-amendments.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const raw=p=>fs.readFileSync(path.join(root,p));
const json=p=>JSON.parse(raw(p));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const basePath='nitnem/learning/course.v8.json';
assert.equal(sha(raw(basePath)),'b2fefd5aa5a76e7d47fe21ceae72bf987b35c49f507de89f119f3cf87bc2e8c5','Recovered live V8 changed');
const prior=json(basePath),course=structuredClone(prior),manifest=json('nitnem/data/library.json');
assert.equal(sha(raw('nitnem/data/library.json')),prior.meta.boundManifestSHA256);
assert.equal(prior.meta.editorialStatus,'DRAFT_AI_UNREVIEWED');
assert.equal(prior.meta.publicationAllowed,false);
assert.equal(prior.meta.reviewer,null);
const source={},lines=new Map(),units=new Map();
for(const [bani,entry] of Object.entries(manifest.entries)){
 const bytes=raw('nitnem/'+entry.path);
 assert.equal(sha(bytes),entry.sha256,bani+' immutable source');
 const pack=JSON.parse(bytes);source[bani]=pack;
 assert.equal(pack.humanCollationApproved,false);assert.equal(pack.rightsCleared,false);
 assert.equal(pack.sourceRepositoryCommit,manifest.sourceCommit);
 assert.equal(pack.units.length,entry.units);
 for(const unit of pack.units){
  const key=bani+'|'+unit.id;assert.ok(!units.has(key));units.set(key,unit);
  for(const line of unit.lines){
   const k=bani+'|'+line.id;assert.ok(!lines.has(k));
   assert.equal(sha(Buffer.from(line.text)),line.sha256,k);lines.set(k,line);
  }
 }
}
assert.equal(lines.size,1361);assert.equal(units.size,327);
const amendments=[];
function validateText(value,label){
 assert.equal(typeof value,'string',label);
 assert.ok(value.trim().length>8,label);
 assert.ok(!/[\uFFFD\uE000-\uF8FF]/u.test(value),label+' has invalid editorial Unicode');
}
function recordAmendment(bani,id,before,after,entry,kind){
 assert.ok(entry.reason?.length>20);assert.ok(entry.sourceUrls?.length);
 amendments.push({bani,id,kind,status:'DRAFT_EDITORIAL_REVISION_NOT_HUMAN_APPROVAL',
  reason:entry.reason,sourceUrls:entry.sourceUrls,before,after});
}
for(const patch of anandOpeningAmendments){
 const key='anand|'+patch.lineId,note=course.closeTextNotes[key];assert.ok(note,key);
 assert.ok(/^anand0[1-7]\.line\d{2}$/.test(patch.lineId));
 assert.equal(note.simpleEn,patch.previousSimpleEn,key+' prior English');
 assert.equal(note.simplePa,patch.previousSimplePa,key+' prior Punjabi');
 if(patch.previousNuance!==undefined)assert.equal(note.interpretiveCaution,patch.previousNuance);
 const before=structuredClone(note);
 note.simpleEn=patch.simpleEn;note.simplePa=patch.simplePa;note.interpretiveCaution=patch.nuance;
 recordAmendment('anand',patch.lineId,before,structuredClone(note),patch,'EXISTING_V8_LINE_NOTE');
}

const jaapLines=structuredClone(jaapEarlyLines),jaapDeep=structuredClone(jaapEarlyDeep);
const rehrasLines=structuredClone(rehrasUniqueLineDrafts),rehrasDeep=structuredClone(rehrasUniqueDeepDrafts);
function amendPacket(bani,packetLines,packetDeep,linePatches,studyPatches){
for(const patch of linePatches){
 const note=packetLines.find(x=>x.lineId===patch.lineId);assert.ok(note,patch.lineId);
 assert.equal(note.simpleEn,patch.previousSimpleEn);assert.equal(note.simplePa,patch.previousSimplePa);
 if(patch.previousNuance!==undefined)assert.equal(note.nuance,patch.previousNuance);
 const before=structuredClone(note);
 note.simpleEn=patch.simpleEn;note.simplePa=patch.simplePa;note.nuance=patch.nuance;
 recordAmendment(bani,patch.lineId,before,structuredClone(note),patch,'SOURCE_PACKET_LINE_BEFORE_ADMISSION');
}
for(const patch of studyPatches){
 const lesson=packetDeep.find(x=>x.unitId===patch.unitId);assert.ok(lesson,patch.unitId);
 assert.deepEqual(lesson.study,patch.previousStudy);
 const before=structuredClone(lesson);
 if(patch.previousSimpleEn!==undefined){
  assert.equal(lesson.simpleEn,patch.previousSimpleEn);assert.equal(lesson.simplePa,patch.previousSimplePa);
  lesson.simpleEn=patch.simpleEn;lesson.simplePa=patch.simplePa;
 }
 lesson.study=structuredClone(patch.study);
 recordAmendment(bani,patch.unitId,before,structuredClone(lesson),patch,'SOURCE_PACKET_STUDY_BEFORE_ADMISSION');
}
}
amendPacket('jaap',jaapLines,jaapDeep,jaapEarlyAmendments,jaapEarlyStudyAmendments);
amendPacket('rehras',rehrasLines,rehrasDeep,rehrasUniqueAmendments,rehrasUniqueStudyAmendments);
const reuse=deriveExactRehrasTeaching({rehras:source.rehras,chaupai:source.chaupai,anand:source.anand,course,requireAll:true});
assert.equal(reuse.lineDrafts.length,130);assert.equal(reuse.deepDrafts.length,28);
assert.equal(rehrasUniqueLineDrafts.length,27);assert.equal(rehrasUniqueDeepDrafts.length,2);
assert.equal(jaapLines.length,56);assert.equal(jaapDeep.length,8);
const reusedLineKeys=new Set(reuse.lineDrafts.map(x=>'rehras|'+x.lineId));
const reusedUnitKeys=new Set(reuse.deepDrafts.map(x=>'rehras|'+x.unitId));
function originFor(dstId,isUnit=false){
 const isChaupai=dstId.startsWith('rehras.chaupai');
 const bani=isChaupai?'chaupai':'anand';
 const id=isChaupai&&isUnit?dstId.replace('rehras.chaupai','chaupai-rehras'):dstId.replace('rehras.','');
 const origin=isUnit?units.get(bani+'|'+id).lines[0]:lines.get(bani+'|'+id);
 return {method:'EXACT_SOURCE_TEXT_AND_SHA_REUSE',bani,id,sourceSha256:origin.sha256,
  teachingCourse:'course.v9.json',separateRehrasOccurrence:true};
}
for(const draft of [...reuse.lineDrafts,...rehrasLines,...jaapLines]){
 const key=draft.bani+'|'+draft.lineId,line=lines.get(key);
 assert.ok(line,key);assert.ok(!line.held,key+' is held');
 assert.ok(!course.closeTextNotes[key],key+' would overwrite history');
 assert.equal(draft.editorialStatus,'DRAFT_AI_UNREVIEWED');
 const entry={lineId:draft.lineId,sourceSha256:line.sha256,status:'DRAFT_AI_UNREVIEWED',
  kind:draft.meaningKind,simpleEn:draft.simpleEn,simplePa:draft.simplePa,interpretiveCaution:draft.nuance};
 if(draft.sourceContext)entry.sourceContext=draft.sourceContext;
 if(reusedLineKeys.has(key))entry.provenance=originFor(draft.lineId);
 course.closeTextNotes[key]=entry;
}
for(const draft of [...reuse.deepDrafts,...rehrasDeep,...jaapDeep]){
 const key=draft.bani+'|'+draft.unitId,unit=units.get(key),s=draft.study;
 assert.ok(unit,key);assert.ok(!course.unitLessons[key],key+' would overwrite Study history');
 assert.ok(!unit.lines.some(l=>l.held),key+' held unit');
 for(const [word] of s.words)assert.ok(unit.lines.some(l=>l.text.includes(word)),key+' missing source word '+word);
 const entry={unitId:draft.unitId,sourceAnchor:{id:unit.lines[0].id,sha256:unit.lines[0].sha256},
  status:'DRAFT_AI_UNREVIEWED',type:'ORIGINAL_EDUCATIONAL_PARAPHRASE',
  simple:{en:draft.simpleEn,pa:draft.simplePa},study:{focus:s.focus,closeReading:s.closeReading,
   words:s.words.map(([gurmukhi,workingGloss])=>({gurmukhi,workingGloss,status:'WORKING_GLOSS_NOT_APPROVED'})),
   interpretationCare:s.care,reflection:s.reflection,teachBack:s.teachBack}};
 if(draft.sourceContext)entry.sourceContext=draft.sourceContext;
 if(reusedUnitKeys.has(key))entry.provenance=originFor(draft.unitId,true);
 course.unitLessons[key]=entry;
}
for(const [key,note] of Object.entries(course.closeTextNotes)){
 const original=lines.get(key);assert.ok(original&&!original.held,key);
 assert.equal(note.sourceSha256,original.sha256);assert.equal(note.status,'DRAFT_AI_UNREVIEWED');
 for(const field of ['simpleEn','simplePa','interpretiveCaution'])validateText(note[field],key+' '+field);
 assert.ok(/[\u0A00-\u0A7F]/u.test(note.simplePa),key+' Punjabi absent');
}
for(const [key,old] of Object.entries(prior.unitLessons))assert.deepEqual(course.unitLessons[key],old,key);
const amendedOldKeys=new Set(anandOpeningAmendments.map(x=>'anand|'+x.lineId));
for(const [key,old] of Object.entries(prior.closeTextNotes))if(!amendedOldKeys.has(key))assert.deepEqual(course.closeTextNotes[key],old,key);
for(const [bani,n] of Object.entries(course.coverage.byBani)){
 n.firstLineNotes=Object.keys(course.closeTextNotes).filter(x=>x.startsWith(bani+'|')).length;
 n.draftLessons=Object.keys(course.unitLessons).filter(x=>x.startsWith(bani+'|')).length;
}
course.coverage.closeTextOccurrenceNotes=Object.keys(course.closeTextNotes).length;
course.coverage.writtenUnitLessons=Object.keys(course.unitLessons).length;
assert.equal(course.coverage.closeTextOccurrenceNotes,635);assert.equal(course.coverage.writtenUnitLessons,142);
assert.equal(course.coverage.byBani.anand.firstLineNotes,202);assert.equal(course.coverage.byBani.anand.draftLessons,39);
assert.equal(course.coverage.byBani.rehras.firstLineNotes,159);assert.equal(course.coverage.byBani.rehras.draftLessons,44);
assert.equal(course.coverage.byBani.jaap.firstLineNotes,62);assert.equal(course.coverage.byBani.jaap.draftLessons,15);
assert.equal(Object.keys(course.closeTextNotes).filter(x=>x.startsWith('anand|anand24.')).length,0);
assert.ok(!course.unitLessons['anand|anand24']);
course.meta={...course.meta,revision:'REHRAS_RECORD_COVERAGE_AND_JAAP_01_15_V9',previousVersion:'course.v8.json',
 previousVersionSHA256:sha(raw(basePath)),editorialAmendmentsRecorded:true};
course.coverage.accounting={basis:'COVERED_SOURCE_OCCURRENCES_NOT_UNIQUE_NEW_TRANSLATIONS',
 previousSourceRecords:422,additionalSourceRecords:213,newJaapLineDrafts:56,
 newRehrasPassageContexts:27,exactSourceReusedLineDrafts:130,
 previousStudyLessons:104,additionalStudyLessons:38,newJaapStudyDrafts:8,
 newRehrasStudyDrafts:2,exactSourceReusedStudyDrafts:28};
course.editorialAmendments=amendments;
course.sourceReuseEvidence=reuse.evidence;
const output=path.join(root,'nitnem/learning/course.v9.json');
const bytes=Buffer.from(JSON.stringify(course,null,2)+'\n');
if(fs.existsSync(output))assert.ok(fs.readFileSync(output).equals(bytes),'V9 is immutable; use a new version for later edits');
else fs.writeFileSync(output,bytes);
console.log(JSON.stringify({status:'DRAFT_ONLY',sourceRecords:635,studyLessons:142,
  amendments:amendments.length,sourceReuse:reuse.evidence,sha256:sha(bytes),humanReviewed:0},null,2));
