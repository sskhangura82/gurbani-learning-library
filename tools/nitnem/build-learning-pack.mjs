/* Bind every editorial overview, unit lesson and first-line explanation to
 * the already SHA-pinned original source pack. Meaning != source authority.
 * Never generate generic per-verse statements or falsely mark entire bani done.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {syllabus,lessons,lineDrafts} from './lesson-drafts.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../');
const target=path.join(root,'nitnem/learning/course.v1.json');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'nitnem/data/library.json'),'utf8'));
const sha=t=>crypto.createHash('sha256').update(t).digest('hex');
function requireThat(x,msg){if(!x)throw Error('TEACHING_SOURCE_GUARD: '+msg);}
const names=['jaap','savaiye','chaupai','anand','rehras','sohila'];
requireThat(syllabus.meta.editorialStatus==='DRAFT_AI_UNREVIEWED','Editor flag must never be guessed as approved');
requireThat(manifest.sourceCommit===syllabus.meta.baseSourceCommit,'Source version no longer matches teaching');
requireThat(names.every(k=>!!syllabus.banis[k])&&Object.keys(syllabus.banis).length===6,'All six overview learning routes required');
const packages={},sourceIndex=new Map(),unitIndex=new Map(),numbers={};
let totalLines=0,totalUnits=0;
for(const name of names){
 const entry=manifest.entries[name],file=path.join(root,'nitnem',entry.path);
 const raw=fs.readFileSync(file);
 requireThat(sha(raw)===entry.sha256,'Source file is no longer immutable: '+name);
 const original=JSON.parse(raw.toString('utf8'));
 requireThat(original.humanCollationApproved===false&&original.rightsCleared===false,'Cannot promote source permissions via teaching');
 requireThat(original.units.length===entry.units,'Source unit count drift '+name);
 packages[name]=original;totalLines+=entry.lines;totalUnits+=entry.units;
 for(const u of original.units){
  const key=name+'|'+u.id;
  requireThat(!unitIndex.has(key),'Duplicate unit '+key);
  unitIndex.set(key,u);
  for(const line of u.lines){
   const k=name+'|'+line.id;
   requireThat(!sourceIndex.has(k),'Duplicate source occurrence');
   requireThat(sha(line.text)===line.sha256,'Mutated source text '+k);
   sourceIndex.set(k,line);
  }
 }
 numbers[name]={totalUnits:entry.units,draftLessons:0,firstLineNotes:0,sourceRecords:entry.lines,sourceEdition:original.editionId};
}
requireThat(totalLines===1361&&totalUnits===327,'Source coverage changed from six original candidates');
const authored={},perLine={},seen=new Set(),seenLines=new Set();
for(const draft of lessons){
 const key=draft.bani+'|'+draft.unitId;
 const source=unitIndex.get(key);
 requireThat(source,'Meaning lesson references unknown unit '+key);
 requireThat(!seen.has(key),'Duplicate meaning lesson '+key);
 seen.add(key);
 for(const k of ['simpleEn','simplePa'])requireThat(typeof draft[k]==='string'&&draft[k].length>35,'Missing non-generic bilingual simple meaning '+key);
 const s=draft.study;
 requireThat(s&&s.words?.length>=2&&s.focus?.length>12&&s.closeReading?.length>90&&s.care?.length>35&&s.reflection?.length>20&&s.teachBack?.length>20,'Incomplete source-specific deep study '+key);
 const opening=source.lines[0];
 requireThat(sha(opening.text)===opening.sha256,'Unit original anchor SHA changed');
 authored[key]={
  unitId:draft.unitId,sourceAnchor:{id:opening.id,sha256:opening.sha256},
  status:'DRAFT_AI_UNREVIEWED',type:'ORIGINAL_EDUCATIONAL_PARAPHRASE',
  simple:{en:draft.simpleEn,pa:draft.simplePa},
  study:{
    focus:s.focus,closeReading:s.closeReading,
    words:s.words.map(([gurmukhi,workingGloss])=>({gurmukhi,workingGloss,status:'WORKING_GLOSS_NOT_APPROVED'})),
    interpretationCare:s.care,reflection:s.reflection,teachBack:s.teachBack
  }
 };
 numbers[draft.bani].draftLessons++;
}
for(const draft of lineDrafts){
 const key=draft.bani+'|'+draft.lineId;
 const line=sourceIndex.get(key);
 requireThat(line,'Close-meaning note references unknown source occurrence '+key);
 requireThat(!line.held,'No unreviewed line note for quarantined original');
 requireThat(!seenLines.has(key),'Duplicated first-line close reading '+key);
 seenLines.add(key);
 requireThat(draft.simpleEn?.length>12&&draft.simplePa?.length>8&&draft.nuance?.length>28,'Too generic bilingual line note '+key);
 perLine[key]={lineId:draft.lineId,sourceSha256:line.sha256,status:'DRAFT_AI_UNREVIEWED',
  kind:'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION',
  simpleEn:draft.simpleEn,simplePa:draft.simplePa,interpretiveCaution:draft.nuance};
 numbers[draft.bani].firstLineNotes++;
}
const output={
 meta:{...syllabus.meta,boundManifestSHA256:sha(fs.readFileSync(path.join(root,'nitnem/data/library.json'))),
  publicationAllowed:false,sourceOriginalUnchanged:true,
  specificSourceParaphrasesOnly:true,absentLessonsAlwaysLabelledPending:true},
 coverage:{unitTotal:totalUnits,sourceLineTotal:totalLines,writtenUnitLessons:lessons.length,
  closeTextOccurrenceNotes:lineDrafts.length,reviewedUnitLessons:0,reviewedSourceMeaningLines:0,
  byBani:numbers},
 banis:syllabus.banis,
 unitLessons:authored,
 closeTextNotes:perLine
};
const bytes=Buffer.from(JSON.stringify(output,null,2)+'\n','utf8');
if(fs.existsSync(target)){
 const old=fs.readFileSync(target);requireThat(old.equals(bytes),'Do not overwrite earlier learning snapshot without explicit version bump');
}else{
 fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);
}
console.log(JSON.stringify({status:'DRAFT_ONLY',lessons:lessons.length,lineNotes:lineDrafts.length,
 totalOriginalSourceUnits:totalUnits,totalOriginalLines:totalLines,
 byBani:numbers,sha256:sha(bytes),reviewedLessons:0,published:false},null,2));
