/* Independent V9 source/editorial/rendering acceptance checks.
 * Rehras origins are located by exact source bytes and full unit order,
 * independently of the authoring compiler and its ID-mapping helper.
 * Renderer checks execute the real UI with a minimal DOM; no browser claim.
 */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {jaapEarlyLines,jaapEarlyDeep} from '../tools/nitnem/jaap-chhands01-15-drafts.mjs';
import {rehrasUniqueLineDrafts,rehrasUniqueDeepDrafts} from '../tools/nitnem/rehras-unique-source-drafts.mjs';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const raw=p=>fs.readFileSync(path.join(root,p));
const json=p=>JSON.parse(raw(p));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const v9Path='nitnem/learning/course.v9.json';
if(!fs.existsSync(path.join(root,v9Path))){
 console.log(JSON.stringify({status:'BLOCKED',reason:'course.v9.json has not been built',checks:0}));
 process.exit(1);
}
const historical={
 1:'5dc9f9dd1b3a8e882763ce48ee654200f84d34179df157eeb303da59f1258c57',
 2:'2a8e083779593b02f40d3f12204d9d0c18926baf4f5997dba140abc7743539d1',
 3:'12cec4b2b04ce70d1230fd0e1f8454f82b8da79306671285eefe4b1852b1f626',
 4:'6555b1b014eebaa3625e87957f0ad14cf6918cf146875f8c1be14d028b30325e',
 5:'dde2ac0910cc706fab65f1e01005251d064cdf8823352c1c91170989fec659b7',
 6:'87250fa63632aa2402ac4b008119a65e207436be2e794913f723261095ebe859',
 7:'a7840f1086ee18039d4b39704c7058e823f0230be609192061cda3a3a335c527',
 8:'b2fefd5aa5a76e7d47fe21ceae72bf987b35c49f507de89f119f3cf87bc2e8c5'
};
const prior=json('nitnem/learning/course.v8.json'),course=json(v9Path),manifest=json('nitnem/data/library.json');
const names=['jaap','savaiye','chaupai','anand','rehras','sohila'];
const source=Object.fromEntries(names.map(name=>[name,json('nitnem/'+manifest.entries[name].path)]));
const sourceLines=new Map(),sourceUnits=new Map();
for(const bani of names)for(const unit of source[bani].units){
 sourceUnits.set(bani+'|'+unit.id,unit);
 for(const line of unit.lines)sourceLines.set(bani+'|'+line.id,line);
}
const newLineKeys=Object.keys(course.closeTextNotes).filter(k=>!Object.hasOwn(prior.closeTextNotes,k));
const newUnitKeys=Object.keys(course.unitLessons).filter(k=>!Object.hasOwn(prior.unitLessons,k));
const results=[];
function check(name,fn){
 try{fn();results.push({name,status:'PASS'});}
 catch(error){results.push({name,status:'FAIL',error:String(error.message||error).slice(0,1200)});}
}
const sorted=a=>[...a].sort();
const keySetEqual=(actual,expected)=>assert.deepEqual(sorted(actual),sorted(expected));
const changed=(a,b)=>!crypto.timingSafeEqual(Buffer.from(sha(JSON.stringify(a))),Buffer.from(sha(JSON.stringify(b))));

// Locate origins by full ordered Gurmukhi equality, not by rewriting an ID.
const matches=new Map();
for(const destination of source.rehras.units){
 const candidates=[];
 for(const bani of ['chaupai','anand'])for(const origin of source[bani].units){
  if(destination.sourceFamily!==origin.sourceFamily||destination.lines.length!==origin.lines.length)continue;
  if(destination.lines.every((line,i)=>Buffer.from(line.text).equals(Buffer.from(origin.lines[i].text))))
   candidates.push({bani,unit:origin});
 }
 if(candidates.length===1)matches.set(destination.id,candidates[0]);
 else if(candidates.length>1)throw Error('Ambiguous exact Rehras source origin: '+destination.id);
}
const expectedReuseLines=[],expectedReuseUnits=[],expectedContexts=[];
for(const unit of source.rehras.units){
 for(const line of unit.lines){
  const key='rehras|'+line.id;
  if(Object.hasOwn(prior.closeTextNotes,key))continue;
  (matches.has(unit.id)?expectedReuseLines:expectedContexts).push(key);
 }
 if(matches.has(unit.id)&&!Object.hasOwn(prior.unitLessons,'rehras|'+unit.id))expectedReuseUnits.push('rehras|'+unit.id);
}
const aggregateKind='AGGREGATED_SOURCE_RECORD_EDUCATIONAL_CONTEXT_NOT_LITERAL_TRANSLATION';

check('All eight historical course snapshots retain their accepted byte hashes',()=>{
 for(const [version,digest] of Object.entries(historical))
  assert.equal(sha(raw('nitnem/learning/course.v'+version+'.json')),digest,'V'+version+' changed');
 assert.equal(Object.keys(prior.closeTextNotes).length,422);
 assert.equal(Object.keys(prior.unitLessons).length,104);
});

check('Pinned manifest, six source packs, 1361 exact lines and 327 unique units remain immutable',()=>{
 assert.equal(sha(raw('nitnem/data/library.json')),'b5865b293acc3ea91a20487dd82efd6f503d22dc5823bc2a67effcd146840d7a');
 assert.equal(manifest.sourceCommit,'373ccc34f4a1c0ccb6ce36654bf6e9574087200f');
 keySetEqual(Object.keys(manifest.entries),names);
 let lineCount=0,unitCount=0;
 const allIDs=new Set();
 for(const bani of names){
  const pack=source[bani],entry=manifest.entries[bani];
  assert.equal(sha(raw('nitnem/'+entry.path)),entry.sha256,bani);
  assert.equal(pack.sourceRepositoryCommit,manifest.sourceCommit);
  assert.equal(pack.humanCollationApproved,false);
  assert.equal(pack.rightsCleared,false);
  assert.equal(pack.units.length,entry.units);
  let records=0;
  for(const unit of pack.units){
   unitCount++;
   for(const line of unit.lines){
    assert.equal(sha(Buffer.from(line.text,'utf8')),line.sha256,line.id);
    assert.ok(!allIDs.has(line.id),'Duplicate original ID '+line.id);allIDs.add(line.id);
    assert.equal(line.family,unit.sourceFamily,line.id+' source family');
    records++;lineCount++;
   }
  }
  assert.equal(records,entry.lines);
 }
 assert.equal(lineCount,1361);assert.equal(sourceLines.size,1361);
 assert.equal(unitCount,327);assert.equal(sourceUnits.size,327);
});

check('Prior 422 notes change only through exact retained before/after amendment evidence; all 104 studies survive',()=>{
 const ledger=course.editorialAmendments;
 assert.ok(Array.isArray(ledger));
 const ids=new Set();
 const allowedKinds=new Set(['EXISTING_V8_LINE_NOTE','SOURCE_PACKET_LINE_BEFORE_ADMISSION','SOURCE_PACKET_STUDY_BEFORE_ADMISSION']);
 for(const item of ledger){
  assert.ok(allowedKinds.has(item.kind));
  const id=item.kind+'|'+item.bani+'|'+item.id;
  assert.ok(!ids.has(id),'Repeated amendment '+id);ids.add(id);
  assert.equal(item.status,'DRAFT_EDITORIAL_REVISION_NOT_HUMAN_APPROVAL');
  assert.ok(item.reason?.trim().length>20);
  assert.ok(Array.isArray(item.sourceUrls)&&item.sourceUrls.length>0);
  for(const url of item.sourceUrls)assert.equal(new URL(url).protocol,'https:');
  assert.ok(changed(item.before,item.after),'No-op amendment '+id);
 }
 const amendments=ledger.filter(x=>x.kind==='EXISTING_V8_LINE_NOTE');
 const amendmentKeys=amendments.map(x=>x.bani+'|'+x.id);
 const changedOld=[];
 for(const [key,old] of Object.entries(prior.closeTextNotes)){
  const next=course.closeTextNotes[key];assert.ok(next,'Removed historical note '+key);
  if(changed(old,next))changedOld.push(key);
  else assert.deepEqual(next,old,key);
 }
 keySetEqual(changedOld,amendmentKeys);
 for(const item of amendments){
  const key=item.bani+'|'+item.id;
  assert.equal(item.bani,'anand');assert.match(item.id,/^anand0[1-7]\.line\d{2}$/);
  assert.deepEqual(item.before,prior.closeTextNotes[key],key+' before');
  assert.deepEqual(item.after,course.closeTextNotes[key],key+' after');
  keySetEqual(Object.keys(item.before),Object.keys(item.after));
  for(const field of Object.keys(item.before))if(!['simpleEn','simplePa','interpretiveCaution'].includes(field))
   assert.deepEqual(item.after[field],item.before[field],key+' identity/status '+field);
 }
 for(const [key,old] of Object.entries(prior.unitLessons))assert.deepEqual(course.unitLessons[key],old,key);
});

check('Exactly 213 source records and 38 studies are added in the stated three categories',()=>{
 assert.equal(newLineKeys.length,213);assert.equal(newUnitKeys.length,38);
 assert.equal(expectedReuseLines.length,130);assert.equal(expectedContexts.length,27);assert.equal(expectedReuseUnits.length,28);
 const expectedJaap=source.jaap.units.slice(0,15).flatMap(u=>u.lines.map(l=>'jaap|'+l.id))
  .filter(k=>!Object.hasOwn(prior.closeTextNotes,k));
 const expectedJaapUnits=source.jaap.units.slice(0,15).map(u=>'jaap|'+u.id)
  .filter(k=>!Object.hasOwn(prior.unitLessons,k));
 assert.equal(expectedJaap.length,56);assert.equal(expectedJaapUnits.length,8);
 keySetEqual(newLineKeys,[...expectedReuseLines,...expectedContexts,...expectedJaap]);
 keySetEqual(newUnitKeys,[...expectedReuseUnits,'rehras|rehras.sggs07','rehras|rehras.sggs08',...expectedJaapUnits]);
 assert.deepEqual(course.coverage.accounting,{
  basis:'COVERED_SOURCE_OCCURRENCES_NOT_UNIQUE_NEW_TRANSLATIONS',
  previousSourceRecords:422,additionalSourceRecords:213,newJaapLineDrafts:56,
  newRehrasPassageContexts:27,exactSourceReusedLineDrafts:130,
  previousStudyLessons:104,additionalStudyLessons:38,newJaapStudyDrafts:8,
  newRehrasStudyDrafts:2,exactSourceReusedStudyDrafts:28
 });
});

check('130 reused Rehras notes match exact original text, family, SHA, order, current draft and provenance',()=>{
 assert.equal(matches.size,31);
 let matchedLines=0;
 for(const destination of source.rehras.units){
  const match=matches.get(destination.id);if(!match)continue;
  for(let i=0;i<destination.lines.length;i++){
   const target=destination.lines[i],origin=match.unit.lines[i];matchedLines++;
   assert.equal(target.text,origin.text);assert.equal(target.family,origin.family);
   assert.equal(target.sha256,origin.sha256);assert.equal(target.held,false);assert.equal(origin.held,false);
   const key='rehras|'+target.id;if(!newLineKeys.includes(key))continue;
   const note=course.closeTextNotes[key],base=course.closeTextNotes[match.bani+'|'+origin.id];
   assert.deepEqual(note.provenance,{method:'EXACT_SOURCE_TEXT_AND_SHA_REUSE',bani:match.bani,id:origin.id,
    sourceSha256:origin.sha256,teachingCourse:'course.v9.json',separateRehrasOccurrence:true});
   for(const field of ['simpleEn','simplePa','interpretiveCaution'])assert.equal(note[field],base[field],key+' '+field);
   assert.ok(note.sourceContext.includes(match.bani+'|'+origin.id));
   assert.ok(note.sourceContext.includes(origin.family));
  }
 }
 assert.equal(matchedLines,132);
 keySetEqual(newLineKeys.filter(k=>course.closeTextNotes[k].provenance),expectedReuseLines);
});

check('28 reused Rehras studies preserve source study content with separate occurrence and context',()=>{
 for(const key of expectedReuseUnits){
  const lesson=course.unitLessons[key],destination=sourceUnits.get(key),match=matches.get(destination.id);
  const base=course.unitLessons[match.bani+'|'+match.unit.id];
  assert.deepEqual(lesson.provenance,{method:'EXACT_SOURCE_TEXT_AND_SHA_REUSE',bani:match.bani,id:match.unit.id,
   sourceSha256:match.unit.lines[0].sha256,teachingCourse:'course.v9.json',separateRehrasOccurrence:true});
  assert.deepEqual(lesson.simple,base.simple);
  for(const field of ['focus','closeReading','words','reflection','teachBack'])assert.deepEqual(lesson.study[field],base.study[field],key+' '+field);
  assert.ok(lesson.study.interpretationCare.startsWith(base.study.interpretationCare));
  assert.ok(lesson.study.interpretationCare.includes(destination.id));
  assert.ok(lesson.sourceContext.includes(match.bani+'|'+match.unit.id));
  assert.equal(lesson.sourceAnchor.id,destination.lines[0].id);
 }
 keySetEqual(newUnitKeys.filter(k=>course.unitLessons[k].provenance),expectedReuseUnits);
 const evidence=course.sourceReuseEvidence;
 assert.equal(evidence.matchedOriginalUnits,matches.size);assert.equal(evidence.matchedOriginalSourceLines,132);
 assert.equal(evidence.newExactSourceLineNoteDrafts,130);assert.equal(evidence.newExactSourceStudyDrafts,28);
 assert.equal(evidence.priorRehrasLineNotesPreserved.length,2);assert.equal(evidence.priorRehrasStudyUnitsPreserved.length,3);
 assert.deepEqual(evidence.pendingNoteSourceMatches,[]);
 assert.equal(evidence.allOriginalTextByteEqual,true);assert.equal(evidence.qualifiedReligiousApproval,false);
});

check('27 distinct Rehras contexts identify aggregated source records and their actual scripture family',()=>{
 keySetEqual(Object.keys(course.closeTextNotes).filter(k=>course.closeTextNotes[k].kind===aggregateKind),expectedContexts);
 for(const key of expectedContexts){
  const note=course.closeTextNotes[key],line=sourceLines.get(key);
  assert.equal(note.kind,aggregateKind);assert.equal(note.provenance,undefined);
  assert.ok(note.sourceContext.startsWith('REHRAS_ORIGINAL_AGGREGATED_TUK_RECORD;'));
  assert.ok(note.sourceContext.includes(line.family+' family'));
  assert.ok(note.sourceContext.includes('not literal'));
 }
 const evening=['rehras.savaiya01','rehras.dohira01'];
 for(const id of evening)assert.equal(sourceUnits.get('rehras|'+id).sourceFamily,'dasam');
 for(const id of ['rehras.mundawani','rehras.slok'])assert.equal(sourceUnits.get('rehras|'+id).sourceFamily,'sggs');
});

check('Jaap and Rehras packet amendments retain true before values and admitted after values',()=>{
 const ledger=course.editorialAmendments;
 const linePatches=ledger.filter(x=>x.kind==='SOURCE_PACKET_LINE_BEFORE_ADMISSION');
 const studyPatches=ledger.filter(x=>x.kind==='SOURCE_PACKET_STUDY_BEFORE_ADMISSION');
 const changedLines=[],changedStudies=[];
 for(const [bani,lineDrafts,deepDrafts] of [
  ['jaap',jaapEarlyLines,jaapEarlyDeep],['rehras',rehrasUniqueLineDrafts,rehrasUniqueDeepDrafts]
 ]){
  for(const draft of lineDrafts){
   const key=bani+'|'+draft.lineId,note=course.closeTextNotes[key];assert.ok(note,key);
   const differs=draft.simpleEn!==note.simpleEn||draft.simplePa!==note.simplePa||draft.nuance!==note.interpretiveCaution;
   const amendment=linePatches.find(x=>x.bani===bani&&x.id===draft.lineId);
   if(differs){
    changedLines.push(key);assert.ok(amendment,'Unlogged packet change '+key);
    assert.deepEqual(amendment.before,draft);
    assert.equal(amendment.after.simpleEn,note.simpleEn);assert.equal(amendment.after.simplePa,note.simplePa);
    assert.equal(amendment.after.nuance,note.interpretiveCaution);
    for(const field of Object.keys(draft))if(!['simpleEn','simplePa','nuance'].includes(field))
     assert.deepEqual(amendment.after[field],draft[field],key+' '+field);
   }else assert.equal(amendment,undefined,'Unnecessary packet amendment '+key);
  }
  for(const draft of deepDrafts){
   const key=bani+'|'+draft.unitId,next=course.unitLessons[key];assert.ok(next,key);
   const study={focus:next.study.focus,closeReading:next.study.closeReading,
    words:next.study.words.map(w=>[w.gurmukhi,w.workingGloss]),care:next.study.interpretationCare,
    reflection:next.study.reflection,teachBack:next.study.teachBack};
   const admitted={...draft,simpleEn:next.simple.en,simplePa:next.simple.pa,study};
   const amendment=studyPatches.find(x=>x.bani===bani&&x.id===draft.unitId);
   if(changed(admitted,draft)){
    changedStudies.push(key);assert.ok(amendment,'Unlogged packet Study change '+key);
    assert.deepEqual(amendment.before,draft,key+' original full lesson');
    assert.deepEqual(amendment.after,admitted,key+' admitted full lesson');
    assert.deepEqual(next.simple,{en:amendment.after.simpleEn,pa:amendment.after.simplePa});
    keySetEqual(Object.keys(amendment.after),Object.keys(draft));
    for(const field of Object.keys(draft))if(!['simpleEn','simplePa','study'].includes(field))
     assert.deepEqual(amendment.after[field],draft[field],key+' identity/status '+field);
   }else assert.equal(amendment,undefined,'Unnecessary packet Study amendment '+key);
  }
 }
 keySetEqual(linePatches.map(x=>x.bani+'|'+x.id),changedLines);
 keySetEqual(studyPatches.map(x=>x.bani+'|'+x.id),changedStudies);
 assert.ok([...linePatches,...studyPatches].every(x=>['jaap','rehras'].includes(x.bani)));
});

check('Every admitted note and Study is source-bound, bilingual, unreviewed and contains no rewritten scripture',()=>{
 for(const [key,note] of Object.entries(course.closeTextNotes)){
  const line=sourceLines.get(key);assert.ok(line,key);assert.equal(line.held,false,key);
  assert.equal(note.lineId,line.id);assert.equal(note.sourceSha256,line.sha256);
  assert.equal(note.status,'DRAFT_AI_UNREVIEWED');
  assert.ok(note.simpleEn.trim().length>8&&note.interpretiveCaution.trim().length>8,key);
  assert.match(note.simplePa,/\p{Script=Gurmukhi}/u,key);
  assert.ok(!('originalText' in note)&&!('sourceText' in note));
  for(const text of [note.simpleEn,note.simplePa,note.interpretiveCaution])assert.ok(!/[\uFFFD\uE000-\uF8FF]/u.test(text),key+' editorial Unicode');
 }
 for(const key of newUnitKeys){
  const lesson=course.unitLessons[key],unit=sourceUnits.get(key);assert.ok(unit,key);
  assert.equal(lesson.unitId,unit.id);assert.equal(lesson.status,'DRAFT_AI_UNREVIEWED');
  assert.equal(lesson.type,'ORIGINAL_EDUCATIONAL_PARAPHRASE');
  assert.deepEqual(lesson.sourceAnchor,{id:unit.lines[0].id,sha256:unit.lines[0].sha256});
  assert.ok(!unit.lines.some(l=>l.held));assert.match(lesson.simple.pa,/\p{Script=Gurmukhi}/u);
  assert.ok(lesson.simple.en.length>35&&lesson.study.closeReading.length>90);
  assert.ok(lesson.study.words.length>=2);
  for(const word of lesson.study.words){
   assert.equal(word.status,'WORKING_GLOSS_NOT_APPROVED');
   assert.ok(unit.lines.some(l=>l.text.includes(word.gurmukhi)),key+' absent vocabulary '+word.gurmukhi);
  }
 }
});

check('Coverage reconciles 635 records and 142 studies while Anand24 and remaining Jaap stay pending',()=>{
 const expected={jaap:[199,782,15,62],savaiye:[10,40,10,40],chaupai:[29,116,29,116],
  anand:[40,208,39,202],rehras:[44,159,44,159],sohila:[5,56,5,56]};
 for(const [bani,counts] of Object.entries(expected)){
  const c=course.coverage.byBani[bani];
  assert.deepEqual([c.totalUnits,c.sourceRecords,c.draftLessons,c.firstLineNotes],counts,bani);
  assert.equal(Object.keys(course.closeTextNotes).filter(k=>k.startsWith(bani+'|')).length,c.firstLineNotes);
  assert.equal(Object.keys(course.unitLessons).filter(k=>k.startsWith(bani+'|')).length,c.draftLessons);
 }
 assert.equal(course.coverage.sourceLineTotal,1361);assert.equal(course.coverage.unitTotal,327);
 assert.equal(course.coverage.closeTextOccurrenceNotes,635);assert.equal(course.coverage.writtenUnitLessons,142);
 assert.equal(Object.keys(course.closeTextNotes).length,635);assert.equal(Object.keys(course.unitLessons).length,142);
 const held=source.anand.units.find(u=>u.id==='anand24');
 assert.equal(held.lines.length,6);assert.equal(held.lines.filter(l=>l.held).length,1);
 assert.ok(held.lines.find(l=>l.id==='anand24.line03').text.includes('\uF03D'));
 for(const line of held.lines)assert.equal(course.closeTextNotes['anand|'+line.id],undefined);
 assert.equal(course.unitLessons['anand|anand24'],undefined);
 for(const unit of source.jaap.units.slice(15)){
  assert.equal(course.unitLessons['jaap|'+unit.id],undefined);
  for(const line of unit.lines)assert.equal(course.closeTextNotes['jaap|'+line.id],undefined);
 }
});

check('Draft metadata and review totals retain the existing authority boundary',()=>{
 assert.equal(course.meta.revision,'REHRAS_RECORD_COVERAGE_AND_JAAP_01_15_V9');
 assert.equal(course.meta.previousVersion,'course.v8.json');assert.equal(course.meta.previousVersionSHA256,historical[8]);
 assert.equal(course.meta.boundManifestSHA256,sha(raw('nitnem/data/library.json')));
 assert.equal(course.meta.baseSourceCommit,manifest.sourceCommit);
 assert.equal(course.meta.editorialStatus,'DRAFT_AI_UNREVIEWED');assert.equal(course.meta.reviewer,null);
 assert.equal(course.meta.publicationAllowed,false);assert.equal(course.meta.rightsStatus,prior.meta.rightsStatus);
 assert.equal(course.meta.sourceOriginalUnchanged,true);assert.equal(course.meta.editorialAmendmentsRecorded,true);
 assert.equal(course.coverage.reviewedUnitLessons,0);assert.equal(course.coverage.reviewedSourceMeaningLines,0);
 assert.deepEqual(course.banis,prior.banis);
});

class Element{
 constructor(tag){this.tagName=tag.toUpperCase();this.className='';this.dataset={};this.attributes={};this.children=[];this.value='';}
 set textContent(value){this.value=String(value);this.children=[];}
 get textContent(){return this.value+this.children.map(x=>typeof x==='string'?x:x.textContent).join('');}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.value='';this.children=[...children];}
 setAttribute(name,value){this.attributes[name]=String(value);}
 getAttribute(name){return this.attributes[name]??null;}
}
function renderer(){
 const window={};
 vm.runInNewContext(raw('nitnem/learning/learning-ui.js').toString(),{window,document:{createElement:tag=>new Element(tag)}},
  {filename:'nitnem/learning/learning-ui.js'});
 return window.GLP_NitnemLearning;
}
const childWithClass=(element,name)=>element.children.find(x=>x instanceof Element&&x.className.split(' ').includes(name));
function contextLabel(text){
 assert.match(text,/passage|record/i);
 assert.match(text,/summary|context/i);
 assert.match(text,/draft/i);
 assert.ok(!/draft meaning for this line/i.test(text),'Aggregated record is misrepresented as a single line');
}

check('Real renderer labels all 27 aggregate summaries in inline, accessible and detail views',()=>{
 const ui=renderer();
 for(const key of expectedContexts){
  const line=sourceLines.get(key),unit=source.rehras.units.find(u=>u.lines.some(l=>l.id===line.id));
  const note=ui.lineNote(course,'rehras',line);assert.ok(note,key);
  assert.equal(note.dataset.meaningLine,line.id);
  assert.equal(childWithClass(note,'english').textContent,course.closeTextNotes[key].simpleEn);
  assert.equal(childWithClass(note,'punjabi').textContent,course.closeTextNotes[key].simplePa);
  contextLabel(childWithClass(note,'expand-hint').textContent);
  contextLabel(note.getAttribute('aria-label'));
  const detail=ui.lineDetails(course,'rehras',line,unit);assert.ok(detail,key);
  assert.equal(childWithClass(detail,'excerpt').textContent,line.text);
  contextLabel(childWithClass(detail,'draft-label').textContent);
 }
 const text=ui.coverageText(course,'rehras');
 assert.match(text,/159[^·]*record/i);assert.ok(!text.includes('159 selective line notes'));
 const held=source.anand.units.find(u=>u.id==='anand24');
 for(const line of held.lines){assert.equal(ui.lineNote(course,'anand',line),null);assert.equal(ui.lineDetails(course,'anand',line,held),null);}
 const original=source.chaupai.units[0].lines[0],ordinary=ui.lineNote(course,'chaupai',original);
 assert.ok(ordinary);assert.ok(!/aggregated|passage summary|passage context/i.test(childWithClass(ordinary,'expand-hint').textContent));
 assert.equal(ui.lineNote(course,'chaupai',{...original,sha256:'0'.repeat(64)}),null);
});

check('Reader selects exactly SHA-pinned V9 and its worker pins every retained course and asset',()=>{
 const script=raw('nitnem/reader.js').toString(),digest=sha(raw(v9Path));
 const active=script.match(/const EXPECTED_LEARNING=['"]([a-f0-9]{64})['"]/);
 assert.ok(active);assert.equal(active[1],digest);
 assert.match(script,/jsonBytes\(['"]learning\/course\.v9\.json['"],\s*EXPECTED_LEARNING\)/);
 const worker=raw('nitnem/sw.js').toString();
 const match=worker.match(/^const EXPECTED=(\{[^\n]+\});/m);assert.ok(match,'Worker asset hashes missing');
 const expected=JSON.parse(match[1]);
 for(let version=1;version<=9;version++)assert.equal(expected['./learning/course.v'+version+'.json'],sha(raw('nitnem/learning/course.v'+version+'.json')));
 for(const name of ['reader.js','learning/learning-ui.js','data/library.json',...names.map(n=>'data/'+n+'.json')])
  assert.equal(expected['./'+name],sha(raw('nitnem/'+name)),name+' missing or stale cache entry');
 for(const [relative,hash] of Object.entries(expected)){
  assert.ok(relative.startsWith('./')&&!relative.includes('..')&&!relative.includes('\\'));
  assert.equal(hash,sha(raw('nitnem/'+relative.slice(2))),relative+' worker hash');
 }
});

const failed=results.filter(x=>x.status==='FAIL').length;
console.log(JSON.stringify({status:failed?'FAIL':'PASS',checks:results.length,failed,
 sourceRecords:course.coverage.closeTextOccurrenceNotes,studyLessons:course.coverage.writtenUnitLessons,
 addedSourceRecords:newLineKeys.length,addedStudyLessons:newUnitKeys.length,
 exactReusedRecords:expectedReuseLines.length,aggregatedRehrasContexts:expectedContexts.length,
 humanReviewed:course.coverage.reviewedUnitLessons,heldPauri24:true,
 environment:'Local source/hash contracts and real renderer in DOM stub; not a browser/device acceptance test',results},null,2));
if(failed)process.exitCode=1;
