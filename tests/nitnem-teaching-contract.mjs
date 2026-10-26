/* GLP-001 editorial meaning/learning candidate:
 * fail-closed exact source occurrence binding, transparent coverage, no
 * unreviewed material masquerading as scripture or certified translation.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const read=f=>fs.readFileSync(new URL(f,root));
const json=f=>JSON.parse(read(f));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const course=json('nitnem/learning/course.v1.json');
const library=json('nitnem/data/library.json');
const document=read('nitnem/index.html').toString('utf8'),script=read('nitnem/reader.js').toString('utf8');
const checks=[];function check(n,fn){fn();checks.push(n);}
const names=['jaap','savaiye','chaupai','anand','rehras','sohila'];
const expected={jaap:[199,7,6],savaiye:[10,10,2],chaupai:[29,7,4],anand:[40,7,3],rehras:[44,14,2],sohila:[5,5,3]};
check('Education source pack digest and original-corpus manifest binding are pinned',()=>{
 assert.equal(sha(read('nitnem/learning/course.v1.json')),'5dc9f9dd1b3a8e882763ce48ee654200f84d34179df157eeb303da59f1258c57');
 assert.equal(course.meta.boundManifestSHA256,sha(read('nitnem/data/library.json')));
 assert.equal(course.meta.baseSourceCommit,library.sourceCommit);
});
check('All six non-Japji bani introductions contain original bilingual educational prose',()=>{
 assert.deepEqual(Object.keys(course.banis),names);
 for(const b of Object.values(course.banis)){
  assert.ok(b.simpleEn.length>=110);
  assert.ok(b.simplePa.length>=80);
  assert.ok(b.deeperEn.length>=125);
  assert.ok(b.words.length>=4);
  assert.ok(b.caution.length>60);
  assert.ok(b.reflection.length>30&&b.question.length>35);
 }
});
check('Coverage is the exact 327 source units, not a false fully explained Gutka',()=>{
 assert.equal(course.coverage.unitTotal,327);
 assert.equal(course.coverage.sourceLineTotal,1361);
 assert.equal(course.coverage.writtenUnitLessons,50);
 assert.equal(course.coverage.closeTextOccurrenceNotes,20);
 assert.equal(course.coverage.reviewedUnitLessons,0);
 assert.equal(course.coverage.reviewedSourceMeaningLines,0);
});
check('Each bani coverage declares real authored count, not generic placeholders',()=>{
 for(const [bani,values] of Object.entries(expected)){
  const r=course.coverage.byBani[bani];
  assert.deepEqual([r.totalUnits,r.draftLessons,r.firstLineNotes],values);
  assert.equal(Object.keys(course.unitLessons).filter(k=>k.startsWith(bani+'|')).length,values[1]);
  assert.equal(Object.keys(course.closeTextNotes).filter(k=>k.startsWith(bani+'|')).length,values[2]);
 }
});
check('All 50 unit explanations are anchored to the exact original source SHA',()=>{
 let count=0;
 for(const name of names){
  const original=json('nitnem/data/'+name+'.json');
  for(const [compound,lesson] of Object.entries(course.unitLessons)){
   if(!compound.startsWith(name+'|'))continue;
   const unit=original.units.find(u=>u.id===lesson.unitId);
   assert.ok(unit,compound);
   assert.ok(unit.lines.some(l=>l.id===lesson.sourceAnchor.id&&l.sha256===lesson.sourceAnchor.sha256));
   assert.equal(lesson.status,'DRAFT_AI_UNREVIEWED');
   assert.equal(lesson.type,'ORIGINAL_EDUCATIONAL_PARAPHRASE');
   assert.ok(lesson.simple.en.length>35&&lesson.simple.pa.length>30);
   assert.ok(lesson.study.words.length>=2);
   assert.ok(lesson.study.closeReading.length>90);
   assert.ok(lesson.study.interpretationCare.length>35);
   assert.ok(lesson.study.teachBack.length>20);
   count++;
  }
 }
 assert.equal(count,50);
});
check('All 20 close-text notes are strictly bound to original, non-quarantined lines',()=>{
 let count=0;
 for(const name of names){
  const original=json('nitnem/data/'+name+'.json');
  const source=new Map(original.units.flatMap(u=>u.lines.map(l=>[l.id,l])));
  for(const [compound,note] of Object.entries(course.closeTextNotes)){
   if(!compound.startsWith(name+'|'))continue;
   assert.equal(source.get(note.lineId).sha256,note.sourceSha256);
   assert.equal(source.get(note.lineId).held,false);
   assert.equal(note.status,'DRAFT_AI_UNREVIEWED');
   assert.ok(note.kind.includes('NOT_LITERAL'));
   count++;
  }
 }
 assert.equal(count,20);
});
check('Anand Pauri 24 has NO authored meaning or line note because the source is held',()=>{
 assert.ok(!Object.keys(course.unitLessons).includes('anand|anand24'));
 assert.ok(!Object.keys(course.closeTextNotes).includes('anand|anand24.line03'));
 const src=json('nitnem/data/anand.json');
 assert.equal(src.units[23].lines.find(l=>l.id==='anand24.line03').held,true);
});
check('Source meaning and study editorial review states are zero, not self-approved',()=>{
 assert.equal(course.meta.editorialStatus,'DRAFT_AI_UNREVIEWED');
 assert.equal(course.meta.publicationAllowed,false);
 assert.equal(course.meta.sourceOriginalUnchanged,true);
 assert.equal(course.meta.rightsStatus,'not_checked_for_public_teaching');
 assert.equal(course.meta.reviewer,null);
});
check('Draft vocabulary glosses are marked working and original Gurmukhi kept separate',()=>{
 assert.ok(Object.values(course.unitLessons).every(l=>l.study.words.every(w=>w.status==='WORKING_GLOSS_NOT_APPROVED')));
 assert.ok(!Object.values(course.unitLessons).some(l=>'originalText' in l||'sourceText' in l));
});
check('No inferred pronunciation/alignment, recorded media or remote translation API is bundled',()=>{
 const txt=JSON.stringify(course);
 assert.ok(!txt.includes('audioUrl')&&!txt.includes('ttsService'));
 assert.ok(!script.includes('fetch("https://'));
 assert.ok(!script.includes('XMLHttpRequest'));
});
check('Reader renders draft-only bilingual Meaning and deeper Learn without replacing Gurbani',()=>{
 assert.ok(document.includes('data-mode="meaning"'));
 assert.ok(document.includes('data-mode="study"'));
 assert.ok(document.includes('learning/learning-ui.js'));
 assert.ok(script.includes('L.unitLesson('));
 assert.ok(script.includes('L.lineNote('));
 assert.ok(script.includes('L.overview('));
 assert.ok(script.includes('DRAFT_AI_UNREVIEWED'));
 assert.ok(script.includes('Gurmukhi occurrence hash changed'));
});
check('User learning remains under edition-specific local keys, not editorial or Japji source',()=>{
 assert.ok(script.includes('glp001.nitnem.PRIVATE-SOURCE-REVIEW.v1.'));
 assert.ok(!script.includes('localStorage.setItem("glp001.continuous.v2"'));
 assert.ok(!document.includes('href="https://'));
});
check('All six overview source references are explicit and no website translation copied',()=>{
 const allowed=new Set(course.meta.references.map(x=>x.key));
 assert.ok(allowed.has('sikhri-anand')&&allowed.has('sahibsingh-sohila')&&allowed.has('sgpc'));
 for(const b of Object.values(course.banis))assert.ok(b.sourceKeys.every(k=>allowed.has(k)));
});
check('Meaning content does not manufacture explanations for unlisted chhands',()=>{
 assert.ok(!course.unitLessons['jaap|jaap099']);
 assert.ok(!course.unitLessons['anand|anand24']);
 const ui=read('nitnem/learning/learning-ui.js').toString();
 assert.ok(ui.includes('Detailed explanation not written yet'));
 assert.ok(ui.includes("view==='continuous'"));
 assert.ok(ui.includes('HUMAN REVIEW PENDING'));
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,cases:checks,sourceUnits:327,writtenUnitDrafts:50,closeTextDrafts:20,approvedLessons:0,publicRelease:false},null,2));
