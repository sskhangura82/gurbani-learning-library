/* Add Jaap Chhands 31–45 to the exact released V10 educational draft.
 * Earlier course files, previous explanations and original Gurbani are immutable.
 * Source integrity is a mechanical check, never qualified religious approval.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {jaap31to37Lines,jaap31to37Deep} from './jaap-chhands31-37-drafts.mjs';
import {jaap38to45Lines,jaap38to45Deep} from './jaap-chhands38-45-drafts.mjs';
import {jaap31to45References,jaap31to45SourceChecks} from './jaap-chhands31-45-source-notes.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const raw=p=>fs.readFileSync(path.join(root,p));
const json=p=>JSON.parse(raw(p));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const priorPath='nitnem/learning/course.v10.json';
const priorHash='ba32eb65d0592738160ab1cece6e59ca01d608b80026a10ae3c51f80e9a59e28';
assert.equal(sha(raw(priorPath)),priorHash,'Released V10 changed');
const prior=json(priorPath),course=structuredClone(prior),manifest=json('nitnem/data/library.json');
assert.equal(sha(raw('nitnem/data/library.json')),'b5865b293acc3ea91a20487dd82efd6f503d22dc5823bc2a67effcd146840d7a');
assert.equal(manifest.sourceCommit,'373ccc34f4a1c0ccb6ce36654bf6e9574087200f');
assert.equal(prior.meta.editorialStatus,'DRAFT_AI_UNREVIEWED');
assert.equal(prior.meta.publicationAllowed,false);assert.equal(prior.meta.reviewer,null);
const lines=new Map(),units=new Map(),packs={};
for(const [bani,entry] of Object.entries(manifest.entries)){
 const bytes=raw('nitnem/'+entry.path);assert.equal(sha(bytes),entry.sha256,bani);
 const pack=JSON.parse(bytes);packs[bani]=pack;
 assert.equal(pack.humanCollationApproved,false);assert.equal(pack.rightsCleared,false);
 assert.equal(pack.sourceRepositoryCommit,manifest.sourceCommit);
 for(const unit of pack.units){
  const unitKey=bani+'|'+unit.id;assert.ok(!units.has(unitKey));units.set(unitKey,unit);
  for(const line of unit.lines){
   const key=bani+'|'+line.id;assert.ok(!lines.has(key));lines.set(key,line);
   assert.equal(sha(Buffer.from(line.text)),line.sha256,key);
  }
 }
}
assert.equal(lines.size,1361);assert.equal(units.size,327);
const expectedUnits=packs.jaap.units.slice(30,45);
assert.deepEqual(expectedUnits.map(u=>u.id),Array.from({length:15},(_,i)=>'jaap'+String(i+31).padStart(3,'0')));
const expectedLineIds=expectedUnits.flatMap(u=>u.lines.map(l=>l.id));
assert.equal(expectedLineIds.length,60);
const drafts=[...jaap31to37Lines,...jaap38to45Lines];
const studies=[...jaap31to37Deep,...jaap38to45Deep];
const sorted=a=>[...a].sort();
assert.deepEqual(sorted(drafts.map(x=>x.lineId)),sorted(expectedLineIds));
assert.deepEqual(sorted(studies.map(x=>x.unitId)),sorted(expectedUnits.map(x=>x.id)));
function validText(text,label,min=8){
 assert.equal(typeof text,'string',label);assert.ok(text.trim().length>min,label);
 assert.ok(!/[\uFFFD\uE000-\uF8FF]/u.test(text),label+' invalid editorial Unicode');
}
for(const draft of drafts){
 const key='jaap|'+draft.lineId,line=lines.get(key);
 assert.equal(draft.bani,'jaap');assert.ok(line&&!line.held,key);
 assert.ok(!course.closeTextNotes[key],key+' already has a previous note');
 assert.equal(draft.editorialStatus,'DRAFT_AI_UNREVIEWED');assert.equal(draft.humanReviewed,false);
 assert.equal(draft.meaningKind,'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION');
 for(const k of ['simpleEn','simplePa','nuance'])validText(draft[k],key+' '+k);
 assert.match(draft.simplePa,/\p{Script=Gurmukhi}/u);
 course.closeTextNotes[key]={lineId:draft.lineId,sourceSha256:line.sha256,
  status:'DRAFT_AI_UNREVIEWED',kind:draft.meaningKind,
  simpleEn:draft.simpleEn,simplePa:draft.simplePa,interpretiveCaution:draft.nuance};
}
for(const draft of studies){
 const key='jaap|'+draft.unitId,unit=units.get(key),s=draft.study;
 assert.equal(draft.bani,'jaap');assert.equal(draft.editorialStatus,'DRAFT_AI_UNREVIEWED');assert.equal(draft.humanReviewed,false);
 assert.ok(unit&&!unit.lines.some(l=>l.held),key);assert.ok(!course.unitLessons[key],key+' already has a previous Study');
 validText(draft.simpleEn,key+' English summary',35);validText(draft.simplePa,key+' Punjabi summary');
 assert.match(draft.simplePa,/\p{Script=Gurmukhi}/u);
 for(const k of ['focus','closeReading','care','reflection','teachBack'])validText(s[k],key+' '+k,k==='closeReading'?90:15);
 assert.ok(s.words.length>=2,key+' vocabulary');
 for(const [word,gloss] of s.words){
  assert.ok(unit.lines.some(l=>l.text.includes(word)),key+' absent source vocabulary '+word);
  validText(gloss,key+' working gloss',1);
 }
 course.unitLessons[key]={unitId:draft.unitId,
  sourceAnchor:{id:unit.lines[0].id,sha256:unit.lines[0].sha256},status:'DRAFT_AI_UNREVIEWED',
  type:'ORIGINAL_EDUCATIONAL_PARAPHRASE',simple:{en:draft.simpleEn,pa:draft.simplePa},
  study:{focus:s.focus,closeReading:s.closeReading,
   words:s.words.map(([gurmukhi,workingGloss])=>({gurmukhi,workingGloss,status:'WORKING_GLOSS_NOT_APPROVED'})),
   interpretationCare:s.care,reflection:s.reflection,teachBack:s.teachBack}};
}
// Preserve all existing content and its V10 editorial/reuse history exactly.
for(const [key,note] of Object.entries(prior.closeTextNotes))assert.deepEqual(course.closeTextNotes[key],note,key);
for(const [key,lesson] of Object.entries(prior.unitLessons))assert.deepEqual(course.unitLessons[key],lesson,key);
assert.deepEqual(course.editorialAmendments,prior.editorialAmendments);
assert.deepEqual(course.sourceReuseEvidence,prior.sourceReuseEvidence);
assert.ok(!course.unitLessons['anand|anand24']);
for(const line of packs.anand.units.find(u=>u.id==='anand24').lines)assert.ok(!course.closeTextNotes['anand|'+line.id]);
for(const [bani,coverage] of Object.entries(course.coverage.byBani)){
 coverage.firstLineNotes=Object.keys(course.closeTextNotes).filter(k=>k.startsWith(bani+'|')).length;
 coverage.draftLessons=Object.keys(course.unitLessons).filter(k=>k.startsWith(bani+'|')).length;
}
course.coverage.closeTextOccurrenceNotes=Object.keys(course.closeTextNotes).length;
course.coverage.writtenUnitLessons=Object.keys(course.unitLessons).length;
assert.equal(course.coverage.closeTextOccurrenceNotes,755);assert.equal(course.coverage.writtenUnitLessons,172);
assert.equal(course.coverage.byBani.jaap.firstLineNotes,182);assert.equal(course.coverage.byBani.jaap.draftLessons,45);
const referenceKeys=new Set(course.meta.references.map(x=>x.key));
for(const reference of jaap31to45References){
 assert.ok(!referenceKeys.has(reference.key),'Duplicate research reference');referenceKeys.add(reference.key);
 assert.equal(new URL(reference.url).protocol,'https:');validText(reference.title,'reference title');validText(reference.scope,'reference scope');
 course.meta.references.push(reference);course.banis.jaap.sourceKeys.push(reference.key);
}
assert.ok(jaap31to45SourceChecks.length>=1,'Research notes absent');
for(const check of jaap31to45SourceChecks){
 assert.ok(check.unitIds?.length);for(const id of check.unitIds)assert.ok(expectedUnits.some(u=>u.id===id));
 assert.ok(check.referenceKeys?.length);for(const key of check.referenceKeys)assert.ok(referenceKeys.has(key));
 validText(check.finding,'source check');assert.equal(check.humanReviewed,false);
}
course.sourceChecks=[...(prior.sourceChecks||[]),...jaap31to45SourceChecks];
course.meta={...course.meta,revision:'JAAP_CHHANDS_31_45_V11',previousVersion:'course.v10.json',previousVersionSHA256:priorHash};
course.coverage.accounting={basis:'COVERED_SOURCE_OCCURRENCES_NOT_UNIQUE_NEW_TRANSLATIONS',
 previousSourceRecords:695,additionalSourceRecords:60,newJaapLineDrafts:60,newRehrasPassageContexts:0,exactSourceReusedLineDrafts:0,
 previousStudyLessons:157,additionalStudyLessons:15,newJaapStudyDrafts:15,newRehrasStudyDrafts:0,exactSourceReusedStudyDrafts:0};
const bytes=Buffer.from(JSON.stringify(course,null,2)+'\n'),output=path.join(root,'nitnem/learning/course.v11.json');
if(fs.existsSync(output))assert.ok(fs.readFileSync(output).equals(bytes),'V11 already exists; use a new version for later edits');
else fs.writeFileSync(output,bytes);
console.log(JSON.stringify({status:'DRAFT_ONLY',sourceRecords:755,studyLessons:172,
 addedLineDrafts:60,addedStudyLessons:15,sha256:sha(bytes),originalSourcesUnchanged:true,previousTeachingUnchanged:true,humanReviewed:0},null,2));
