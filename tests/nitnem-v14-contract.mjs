/* Data acceptance checks separate from the compiler for the exact V14 increment.
 * This reads shipped JSON and exercises the real learning renderer.
 * It does not import the authoring compiler or claim browser/scholarly review.
 */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const raw=p=>fs.readFileSync(path.join(root,p));
const json=p=>JSON.parse(raw(p));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const prior=json('nitnem/learning/course.v13.json'),course=json('nitnem/learning/course.v14.json');
const manifest=json('nitnem/data/library.json');
const names=['jaap','savaiye','chaupai','anand','rehras','sohila'];
const packs=Object.fromEntries(names.map(n=>[n,json('nitnem/'+manifest.entries[n].path)]));
const lineMap=new Map(),unitMap=new Map();
for(const [bani,pack] of Object.entries(packs))for(const unit of pack.units){
 unitMap.set(bani+'|'+unit.id,unit);
 for(const line of unit.lines)lineMap.set(bani+'|'+line.id,line);
}
const expectedUnits=packs.jaap.units.filter(u=>Number(u.id.slice(4))>=76&&Number(u.id.slice(4))<=90);
const expectedLineKeys=expectedUnits.flatMap(u=>u.lines.map(l=>'jaap|'+l.id));
const expectedUnitKeys=expectedUnits.map(u=>'jaap|'+u.id);
const newLineKeys=Object.keys(course.closeTextNotes).filter(k=>!Object.hasOwn(prior.closeTextNotes,k));
const newUnitKeys=Object.keys(course.unitLessons).filter(k=>!Object.hasOwn(prior.unitLessons,k));
const sorted=a=>[...a].sort();
const sameKeys=(a,b)=>assert.deepEqual(sorted(a),sorted(b));
const results=[];
function check(name,fn){try{fn();results.push({name,status:'PASS'});}catch(error){results.push({name,status:'FAIL',error:error.message});}}

check('All thirteen earlier course snapshots keep their released byte hashes',()=>{
 const hashes=[
  '5dc9f9dd1b3a8e882763ce48ee654200f84d34179df157eeb303da59f1258c57',
  '2a8e083779593b02f40d3f12204d9d0c18926baf4f5997dba140abc7743539d1',
  '12cec4b2b04ce70d1230fd0e1f8454f82b8da79306671285eefe4b1852b1f626',
  '6555b1b014eebaa3625e87957f0ad14cf6918cf146875f8c1be14d028b30325e',
  'dde2ac0910cc706fab65f1e01005251d064cdf8823352c1c91170989fec659b7',
  '87250fa63632aa2402ac4b008119a65e207436be2e794913f723261095ebe859',
  'a7840f1086ee18039d4b39704c7058e823f0230be609192061cda3a3a335c527',
  'b2fefd5aa5a76e7d47fe21ceae72bf987b35c49f507de89f119f3cf87bc2e8c5',
  '7516a55af45c91576239fa07b064af8f3b5fd2f8b97cf9b2905bbad6e31f4e32',
  'ba32eb65d0592738160ab1cece6e59ca01d608b80026a10ae3c51f80e9a59e28',
  'dde70081af4576620da500b712a7c8eb1c5c4ea1e35753b7ccdfb0a0bc755d69',
  '431642c41ce9634643f115737d63dd6067a2c2fe16eba7a29302134ce41e3d3b',
  '4d9ba106831d499fdec8982a0c9ec1415f90e64cb86f02a93db0b6096280fdb4'
 ];
 hashes.forEach((digest,i)=>assert.equal(sha(raw('nitnem/learning/course.v'+(i+1)+'.json')),digest,'V'+(i+1)));
});
check('Pinned manifest and all six original packs preserve every source occurrence and review status',()=>{
 assert.equal(sha(raw('nitnem/data/library.json')),'b5865b293acc3ea91a20487dd82efd6f503d22dc5823bc2a67effcd146840d7a');
 assert.equal(manifest.sourceCommit,'373ccc34f4a1c0ccb6ce36654bf6e9574087200f');
 assert.equal(lineMap.size,1361);assert.equal(unitMap.size,327);
 for(const bani of names){
  const pack=packs[bani],entry=manifest.entries[bani];
  assert.equal(sha(raw('nitnem/'+entry.path)),entry.sha256,bani);
  assert.equal(pack.humanCollationApproved,false);assert.equal(pack.rightsCleared,false);
  assert.equal(pack.units.length,entry.units);assert.equal(pack.sourceRepositoryCommit,manifest.sourceCommit);
  assert.equal(pack.units.flatMap(u=>u.lines).length,entry.lines);
  for(const unit of pack.units)for(const line of unit.lines){
   assert.equal(sha(Buffer.from(line.text)),line.sha256,line.id);assert.equal(line.family,unit.sourceFamily);
  }
 }
});
check('All 859 previous notes, 202 previous studies and the editorial/reuse evidence are identical',()=>{
 assert.equal(Object.keys(prior.closeTextNotes).length,859);assert.equal(Object.keys(prior.unitLessons).length,202);
 for(const [key,note] of Object.entries(prior.closeTextNotes))assert.deepEqual(course.closeTextNotes[key],note,key);
 for(const [key,lesson] of Object.entries(prior.unitLessons))assert.deepEqual(course.unitLessons[key],lesson,key);
 assert.deepEqual(course.editorialAmendments,prior.editorialAmendments);
 assert.deepEqual(course.sourceReuseEvidence,prior.sourceReuseEvidence);
 for(const bani of names){
  const old=structuredClone(prior.banis[bani]),next=structuredClone(course.banis[bani]);
  if(bani==='jaap'){assert.deepEqual(next.sourceKeys.slice(0,old.sourceKeys.length),old.sourceKeys);delete next.sourceKeys;delete old.sourceKeys;}
  assert.deepEqual(next,old,bani);
 }
});
check('The increment is exactly 60 Jaap notes and 15 studies for Chhands 76 through 90',()=>{
 assert.equal(expectedUnits.length,15);assert.equal(expectedLineKeys.length,60);
 sameKeys(newLineKeys,expectedLineKeys);sameKeys(newUnitKeys,expectedUnitKeys);
 assert.equal(newLineKeys.length,60);assert.equal(newUnitKeys.length,15);
 assert.deepEqual(course.coverage.accounting,{
  basis:'COVERED_SOURCE_OCCURRENCES_NOT_UNIQUE_NEW_TRANSLATIONS',previousSourceRecords:859,additionalSourceRecords:60,
  newJaapLineDrafts:60,newRehrasPassageContexts:0,exactSourceReusedLineDrafts:0,
  previousStudyLessons:202,additionalStudyLessons:15,newJaapStudyDrafts:15,newRehrasStudyDrafts:0,exactSourceReusedStudyDrafts:0
 });
});
check('All sixty original lines and the two separate metre headings retain their identities',()=>{
 assert.deepEqual(expectedUnits.map(u=>u.lines.length),Array(15).fill(4));
 assert.deepEqual(expectedUnits.filter(u=>u.metricalHeadings.length).map(u=>u.id),['jaap079','jaap087']);
 assert.deepEqual(expectedUnits.flatMap(u=>u.metricalHeadings.map(h=>h.sha256)),[
  '6aa31fc27e13cc352e34607edc18fd1c3544b17546d642c04752b933d34668c3',
  '85a305c3f2ac6d523e5bbfd49aa197a00f98d70fbd6b0ac86317cb0a084aa731'
 ]);
 for(const u of expectedUnits){
  assert.equal(u.sourceHeadingIncluded,false);
  assert.equal(newLineKeys.filter(k=>k.startsWith('jaap|'+u.id+'.')).length,4);
 }
});
check('Interpretive alternatives remain explicit without claiming scholarly approval',()=>{
 assert.match(course.closeTextNotes['jaap|jaap079.line02'].interpretiveCaution,/three realms or across three times/);
 assert.match(course.closeTextNotes['jaap|jaap085.line03'].interpretiveCaution,/interpretively difficult/);
 assert.match(course.closeTextNotes['jaap|jaap090.line02'].interpretiveCaution,/smallest or the child/);
 assert.match(course.unitLessons['jaap|jaap090'].study.interpretationCare,/qualified Sikh/);
 assert.ok(course.sourceChecks.some(c=>c.finding.includes('No independent model review')));
});
check('Every new explanation has exact source identity, both languages and explicit unreviewed status',()=>{
 for(const key of newLineKeys){
  const note=course.closeTextNotes[key],line=lineMap.get(key);
  assert.equal(note.lineId,line.id);assert.equal(note.sourceSha256,line.sha256);assert.equal(line.held,false);
  assert.equal(note.status,'DRAFT_AI_UNREVIEWED');assert.equal(note.kind,'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION');
  assert.ok(note.simpleEn.trim().length>8);assert.match(note.simplePa,/\p{Script=Gurmukhi}/u);
  assert.ok(note.interpretiveCaution.trim().length>15);assert.equal(note.provenance,undefined);
  for(const text of [note.simpleEn,note.simplePa,note.interpretiveCaution])assert.ok(!/[\uFFFD\uE000-\uF8FF]/u.test(text));
  assert.ok(!('originalText' in note)&&!('sourceText' in note));
 }
});
check('Each new Study is substantive, source-anchored and uses vocabulary present in its own chhand',()=>{
 for(const key of newUnitKeys){
  const lesson=course.unitLessons[key],unit=unitMap.get(key),s=lesson.study;
  assert.equal(lesson.unitId,unit.id);assert.equal(lesson.status,'DRAFT_AI_UNREVIEWED');
  assert.equal(lesson.type,'ORIGINAL_EDUCATIONAL_PARAPHRASE');
  assert.deepEqual(lesson.sourceAnchor,{id:unit.lines[0].id,sha256:unit.lines[0].sha256});
  assert.ok(lesson.simple.en.length>35);assert.match(lesson.simple.pa,/\p{Script=Gurmukhi}/u);
  for(const field of ['focus','closeReading','interpretationCare','reflection','teachBack'])assert.ok(s[field].length>(field==='closeReading'?90:15),key+' '+field);
  assert.ok(s.words.length>=2);
  for(const word of s.words){assert.equal(word.status,'WORKING_GLOSS_NOT_APPROVED');assert.ok(unit.lines.some(l=>l.text.includes(word.gurmukhi)),key+' '+word.gurmukhi);}
 }
});
check('Totals reconcile to 919 notes and 217 studies; every other bani retains the previous coverage',()=>{
 assert.equal(course.coverage.closeTextOccurrenceNotes,919);assert.equal(Object.keys(course.closeTextNotes).length,919);
 assert.equal(course.coverage.writtenUnitLessons,217);assert.equal(Object.keys(course.unitLessons).length,217);
 assert.equal(course.coverage.sourceLineTotal,1361);assert.equal(course.coverage.unitTotal,327);
 for(const bani of names){
  const c=course.coverage.byBani[bani];
  assert.equal(c.firstLineNotes,Object.keys(course.closeTextNotes).filter(k=>k.startsWith(bani+'|')).length);
  assert.equal(c.draftLessons,Object.keys(course.unitLessons).filter(k=>k.startsWith(bani+'|')).length);
  if(bani!=='jaap')assert.deepEqual(c,prior.coverage.byBani[bani]);
  else assert.deepEqual([c.firstLineNotes,c.draftLessons,c.sourceRecords,c.totalUnits],[346,90,782,199]);
 }
});
check('Anand Pauri 24 remains fully withheld and Jaap 91 onward remains pending',()=>{
 const held=packs.anand.units.find(u=>u.id==='anand24');assert.equal(held.lines.length,6);
 assert.ok(held.lines.find(l=>l.id==='anand24.line03').text.includes('\uF03D'));
 assert.ok(!course.unitLessons['anand|anand24']);for(const l of held.lines)assert.ok(!course.closeTextNotes['anand|'+l.id]);
 for(const u of packs.jaap.units.slice(90)){assert.ok(!course.unitLessons['jaap|'+u.id]);for(const l of u.lines)assert.ok(!course.closeTextNotes['jaap|'+l.id]);}
});
check('Research references and alternative-reading notes never confer human approval',()=>{
 assert.equal(course.meta.revision,'JAAP_CHHANDS_76_90_V14');assert.equal(course.meta.previousVersion,'course.v13.json');
 assert.equal(course.meta.previousVersionSHA256,sha(raw('nitnem/learning/course.v13.json')));
 for(const k of ['editorialStatus','reviewer','rightsStatus','publicationAllowed','sourceOriginalUnchanged','boundManifestSHA256','baseSourceCommit'])assert.deepEqual(course.meta[k],prior.meta[k],k);
 assert.equal(course.coverage.reviewedUnitLessons,0);assert.equal(course.coverage.reviewedSourceMeaningLines,0);
 assert.deepEqual(course.meta.references.slice(0,prior.meta.references.length),prior.meta.references);
 const keys=new Set(course.meta.references.map(r=>r.key));assert.equal(keys.size,course.meta.references.length);
 assert.ok(course.sourceChecks.length>0);
 assert.deepEqual(course.sourceChecks.slice(0,prior.sourceChecks.length),prior.sourceChecks);
 for(const c of course.sourceChecks.slice(prior.sourceChecks.length)){assert.equal(c.humanReviewed,false);assert.ok(c.finding.length>15);for(const id of c.unitIds)assert.ok(expectedUnitKeys.includes('jaap|'+id));for(const key of c.referenceKeys)assert.ok(keys.has(key));}
});

class Element{
 constructor(tag){this.tagName=tag.toUpperCase();this.className='';this.dataset={};this.attributes={};this.children=[];this.value='';}
 set textContent(v){this.value=String(v);this.children=[];}get textContent(){return this.value+this.children.map(x=>typeof x==='string'?x:x.textContent).join('');}
 append(...children){this.children.push(...children);}replaceChildren(...children){this.value='';this.children=[...children];}
 setAttribute(k,v){this.attributes[k]=String(v);}getAttribute(k){return this.attributes[k]??null;}
}
function renderer(){const window={};vm.runInNewContext(raw('nitnem/learning/learning-ui.js').toString(),{window,document:{createElement:tag=>new Element(tag)}});return window.GLP_NitnemLearning;}
check('The real renderer exposes all new notes and studies while Read stays clear and wrong hashes fail closed',()=>{
 const ui=renderer();
 for(const unit of expectedUnits){
  assert.equal(ui.unitLesson(course,'jaap',unit,'read','continuous'),null);
  const study=ui.unitLesson(course,'jaap',unit,'study','passage');assert.ok(study);
  const lesson=course.unitLessons['jaap|'+unit.id];assert.ok(study.textContent.includes(lesson.study.closeReading));
  assert.ok(study.textContent.includes(lesson.simple.pa));assert.ok(study.textContent.includes('HUMAN REVIEW PENDING'));
  for(const line of unit.lines){
   const note=course.closeTextNotes['jaap|'+line.id],inline=ui.lineNote(course,'jaap',line),detail=ui.lineDetails(course,'jaap',line,unit);
   assert.equal(inline.dataset.meaningLine,line.id);assert.ok(inline.textContent.includes(note.simpleEn)&&inline.textContent.includes(note.simplePa));
   assert.ok(detail.textContent.includes(line.text)&&detail.textContent.includes(note.interpretiveCaution));
   assert.equal(ui.lineNote(course,'jaap',{...line,sha256:'0'.repeat(64)}),null);
  }
 }
 assert.match(ui.coverageText(course,'jaap'),/90 of 199 Study drafts.*346 of 782 line drafts/);
 const held=packs.anand.units.find(u=>u.id==='anand24');for(const l of held.lines)assert.equal(ui.lineNote(course,'anand',l),null);
 const context=Object.entries(course.closeTextNotes).find(([,n])=>n.kind==='AGGREGATED_SOURCE_RECORD_EDUCATIONAL_CONTEXT_NOT_LITERAL_TRANSLATION');
 assert.ok(ui.lineNote(course,'rehras',lineMap.get(context[0])).textContent.includes('Passage context'));
});
check('The active course, unchanged learning renderer and public Japji remain pinned',()=>{
 const digest=sha(raw('nitnem/learning/course.v14.json')),reader=raw('nitnem/reader.js').toString();
 assert.ok(reader.includes("const EXPECTED_LEARNING='"+digest+"';"));assert.ok(reader.includes("jsonBytes('learning/course.v14.json',EXPECTED_LEARNING)"));
 assert.equal(sha(raw('nitnem/learning/learning-ui.js')),'63d3132f166681cbc23d2286988c8ada0a852735dd84c317776c6160b51215dc');
 const unchanged={"full-japji.html":"f415a6dfef423abc26a3227e5ec61a312c76b7b292b3bb429ef3dd8691070a9a","index.html":"bfa25eae0cd7fd0e187b3fb006d205829c8ad1ab1cc52c6ff87cddc47cc1c4d0","js/japji-full.js":"752d21c0e71cadad53f801cb959e2d1f2a2e88b6f162526e889bf555515b7162","sw.js":"76382caed1a80f5ebd1d0b2d2cfe3fb223d70cc4a084ca345002b139aac21eac","nitnem/continuous-core.js":"9b48fa24327076bd35693dfdd5144cbbf004de488a9a6b962f3fa61d6174d78c","nitnem/japji-assets/js/japji-full-data.js":"7f5f78ac33da1a944e14c3d2b901926686df7e520e6fe681f6a28802d85e9808","nitnem/japji-assets/js/japji-lessons.js":"4f77c593d2df8dd6e72ead4cb2b2012991a3ca0ad56495f6f5a30ae96a7d7078","nitnem/japji-assets/js/line-meanings.js":"5f2ccfea58faa9fc5a31edac3ec9d3483e0ec2360e471fd3616f17eed005485a","nitnem/japji-assets/js/shared-learning.js":"8a35f16992769174163c9a3b0b6dacc767dac4cdf33e2f3e9e4c4d9f57eebe2b"};
 for(const [file,digest] of Object.entries(unchanged))assert.equal(sha(raw(file)),digest,file);
 const preservedAppearance={'nitnem/appearance.js':'64dafaea92554e904abd565b652b5b544ccb9b15ff3c63a7a3520217a95e5a5f','nitnem/appearance.css':'01cef2268ca54a5ada570878f96a640090364bc1b82fda22a74e16bba05e7377','nitnem/index.html':'971572b412a17af2fcdef246b4bcec6e0b339a837e4704a3990a14d872e23bed','nitnem/reader.css':'49c6c16643aa8975dcd1d51756196e5901cee0324a2c1069cb0d4d9bc2df559a','nitnem/japji.html':'8ea4e1d9dd5ff7d2862e680c7019503f963a9223cd163d2f290e04378f785c81','nitnem/japji-assets/js/japji-full.js':'7a8ee5a2c0e36888f73130565afc4aae7a05fe2fbf00b2bd7db6a11710178570'};
 for(const [file,digest] of Object.entries(preservedAppearance))assert.equal(sha(raw(file)),digest,file);
 assert.ok(reader.includes('window.GLP_APPEARANCE.get()'));assert.ok(reader.includes("window.addEventListener('glp:appearance',e=>{state.theme=e.detail.theme;"));
 assert.match(raw('nitnem/index.html').toString(),/id="pace"[^>]*max="200"/);
});
check('The worker pins all fourteen course files and every active offline asset to current bytes',()=>{
 const worker=raw('nitnem/sw.js').toString(),expected=JSON.parse(worker.match(/^const EXPECTED=(\{[^\n]+\});/m)[1]);
 assert.equal(Object.keys(expected).length,44);
 for(let i=1;i<=14;i++)assert.equal(expected['./learning/course.v'+i+'.json'],sha(raw('nitnem/learning/course.v'+i+'.json')));
 for(const [rel,digest] of Object.entries(expected)){assert.ok(rel.startsWith('./')&&!rel.includes('..')&&!rel.includes('\\'));assert.equal(digest,sha(raw('nitnem/'+rel.slice(2))),rel);}
 assert.ok(worker.includes('e=>e.waitUntil('));
});
const failed=results.filter(x=>x.status==='FAIL').length;
console.log(JSON.stringify({status:failed?'FAIL':'PASS',checks:results.length,failed,sourceRecords:919,studyLessons:217,
 newLineDrafts:newLineKeys.length,newStudyLessons:newUnitKeys.length,previousNotesPreserved:859,previousStudiesPreserved:202,
 humanReviewed:0,heldAnand24:true,environment:'Node source/hash checks and real renderer with DOM stub; no browser/device claim',results},null,2));
if(failed)process.exitCode=1;
