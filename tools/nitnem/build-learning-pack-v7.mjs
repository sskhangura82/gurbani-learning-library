/* Bind every editorial overview, unit lesson and first-line explanation to
 * the already SHA-pinned original source pack. Meaning != source authority.
 * Never generate generic per-verse statements or falsely mark entire bani done.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {syllabus,lessons,lineDrafts} from './lesson-drafts.mjs';
import {sohilaAdditional} from './sohila-line-drafts.mjs';
import {savaiyeAdditional} from './savaiye-line-drafts.mjs';
import {chaupaiAdditional} from './chaupai-line-drafts.mjs';
import {chaupaiDeepAdditional} from './chaupai-deep-drafts.mjs';
import {anandNewLines,anandNewDeep} from './anand-8-20-drafts.mjs';
import {anand2130Lines,anand2130Deep} from './anand-21-30-drafts.mjs';
import {anand3140Lines,anand3140Deep} from './anand-31-40-drafts.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../');
const target=path.join(root,'nitnem/learning/course.v7.json');
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
for(const draft of [...lessons,...chaupaiDeepAdditional,...anandNewDeep,...anand2130Deep,...anand3140Deep]){
 const key=draft.bani+'|'+draft.unitId;
 const source=unitIndex.get(key);
 requireThat(source,'Meaning lesson references unknown unit '+key);
 requireThat(!seen.has(key),'Duplicate meaning lesson '+key);
 seen.add(key);
 for(const k of ['simpleEn','simplePa'])requireThat(typeof draft[k]==='string'&&draft[k].length>35,'Missing non-generic bilingual simple meaning '+key);
 const s=draft.study;
 requireThat(s&&s.words?.length>=2&&s.focus?.length>12&&s.closeReading?.length>90&&s.care?.length>35&&s.reflection?.length>20&&s.teachBack?.length>20,'Incomplete source-specific deep study '+key);
 if(draft.bani==='chaupai' && draft.unitId!=='chaupai-rehras01'){
  for(const [originalWord] of s.words)
   requireThat(source.lines.some(l=>l.text.includes(originalWord)),
    'Chaupai Study working vocabulary not present in exact source pauri: '+key+' '+originalWord);
 }
 if(draft.bani==='anand'&&/^anand(0[8-9]|[1-3][0-9]|40)$/.test(draft.unitId)){
  for(const [w] of s.words)requireThat(source.lines.some(l=>l.text.includes(w)),
   'Anand grammar vocabulary not exact-source-bound: '+key+' '+w);
 }
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
for(const draft of [...lineDrafts,...sohilaAdditional,...savaiyeAdditional,...chaupaiAdditional,...anandNewLines,...anand2130Lines,...anand3140Lines]){
 const key=draft.bani+'|'+draft.lineId;
 const line=sourceIndex.get(key);
 requireThat(line,'Close-meaning note references unknown source occurrence '+key);
 requireThat(!line.held,'No unreviewed line note for quarantined original');
 requireThat(!seenLines.has(key),'Duplicated first-line close reading '+key);
 seenLines.add(key);
 if(draft.bani==='sohila')requireThat(!draft.meaningKind||['HEADING_OR_INVOCATION_CONTEXT','SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION'].includes(draft.meaningKind),'Unapproved line classification '+key);
 requireThat(draft.simpleEn?.length>12&&draft.simplePa?.length>8&&draft.nuance?.length>28,'Too generic bilingual line note '+key);
 perLine[key]={lineId:draft.lineId,sourceSha256:line.sha256,status:'DRAFT_AI_UNREVIEWED',
  kind:draft.meaningKind||'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION',
  simpleEn:draft.simpleEn,simplePa:draft.simplePa,interpretiveCaution:draft.nuance};
 numbers[draft.bani].firstLineNotes++;
}
requireThat(numbers.sohila.firstLineNotes===56,'Sohila draft MUST be complete from first heading to final shabad; no omitted or double-mapped original line');
requireThat(Object.keys(perLine).filter(x=>x.startsWith('sohila|')).length===56,'Sohila exact source line map incomplete');
requireThat(numbers.savaiye.firstLineNotes===40,'All forty Savaiye stanza lines must have unique educational notes');
requireThat(numbers.chaupai.firstLineNotes===116,'All 29 Chaupai source pauris must have four original SHA-bound draft line meanings');
requireThat(numbers.chaupai.draftLessons===29,'Every Chaupai pauri must have a specific deeper lesson');
requireThat(numbers.anand.draftLessons===39,'Exactly 39 authored Anand deep units: all except Pauri24 held');
requireThat(numbers.anand.firstLineNotes===169,'Anand 169 original-line drafts, Pauri24 and older 1–7 gaps remain');
requireThat(seenLines.size===389,'Exactly 389 source-specific educational line-note drafts expected');
requireThat(seen.size===104,'Exactly 104 deep source-unit lessons expected');
const output={
 meta:{...syllabus.meta,revision:'ANAND_P31_40_COMPLETE_DEEP_EXCEPT24_V7',previousVersion:'course.v6.json',boundManifestSHA256:sha(fs.readFileSync(path.join(root,'nitnem/data/library.json'))),
  publicationAllowed:false,sourceOriginalUnchanged:true,
  specificSourceParaphrasesOnly:true,absentLessonsAlwaysLabelledPending:true},
 coverage:{unitTotal:totalUnits,sourceLineTotal:totalLines,writtenUnitLessons:lessons.length+chaupaiDeepAdditional.length+anandNewDeep.length+anand2130Deep.length+anand3140Deep.length,
  closeTextOccurrenceNotes:lineDrafts.length+sohilaAdditional.length+savaiyeAdditional.length+chaupaiAdditional.length+anandNewLines.length+anand2130Lines.length+anand3140Lines.length,reviewedUnitLessons:0,reviewedSourceMeaningLines:0,
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
console.log(JSON.stringify({status:'DRAFT_ONLY',lessons:lessons.length+chaupaiDeepAdditional.length+anandNewDeep.length+anand2130Deep.length+anand3140Deep.length,lineNotes:lineDrafts.length+sohilaAdditional.length+savaiyeAdditional.length+chaupaiAdditional.length+anandNewLines.length+anand2130Lines.length+anand3140Lines.length,
 totalOriginalSourceUnits:totalUnits,totalOriginalLines:totalLines,
 byBani:numbers,sha256:sha(bytes),reviewedLessons:0,published:false},null,2));
