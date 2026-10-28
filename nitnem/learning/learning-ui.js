/* GLP-001 — Japji-format aligned teaching renderer.
 * Canonical original Gurbani is NEVER sourced from this file.
 * Bilingual line meaning directly under the exact occurrence, tap to explore.
 * Unit-level summaries are explicitly distinguished from line translations.
 * Study follows Japji's actual heading order; missing fields are disclosed,
 * not invented. All text constructed with textContent, never untrusted HTML.
 */
(()=>{
'use strict';
const elt=(tag,cls,value)=>{
 const n=document.createElement(tag);
 if(cls)n.className=cls;
 if(value!==undefined)n.textContent=value;
 return n;
};
const appendText=(parent,tag,cls,value,lang)=>{
 const el=elt(tag,cls,value);
 if(lang)el.lang=lang;
 parent.append(el);
 return el;
};
function draft(label='ORIGINAL STUDY DRAFT · HUMAN REVIEW PENDING'){
 return elt('p','draft-label',label);
}
function paragraph(text,lang){
 const p=elt('p',lang==='pa'?'punjabi-text':'',text);
 if(lang)p.lang=lang;return p;
}
function field(root,heading,text,lang){
 root.append(elt('h4','',heading),paragraph(text,lang));
}
function pending(text){
 const note=elt('p','pending-meaning',text);
 note.setAttribute('role','note');
 return note;
}
function coverageText(course,bani){
 const r=course?.coverage?.byBani?.[bani];
 return r?r.draftLessons+' of '+r.totalUnits+' Study drafts · '+r.firstLineNotes+' of '+r.sourceRecords+(bani==='rehras'?' source records explained':' line drafts')+' · 0 scholar-reviewed':'Learning is not yet verified.';
}
function overview(node,course,bani,mode){
 node.replaceChildren();node.hidden=mode==='read';
 if(mode==='read')return;
 if(!course||!course.banis?.[bani]){
  node.append(pending('Educational material unavailable. The original Gurmukhi remains readable; no translation has been generated.'));
  return;
 }
 const r=course.banis[bani],rCount=course.coverage.byBani[bani];
 const details=elt('details','learning-disclosure');
 const summary=elt('summary','learning-summary','About this bani · '+rCount.draftLessons+' of '+rCount.totalUnits+' drafts');
 const intro=elt('section','learning-article');
 intro.append(draft('FULL LEARNING · ORIGINAL EDUCATIONAL DRAFT · HUMAN REVIEW PENDING'));
 appendText(intro,'h3','learn-topic',r.theme);
 field(intro,'Passage meaning · overview, not word-for-word translation',r.simpleEn,'en');
 intro.append(paragraph(r.simplePa,'pa'));
 if(mode==='study'){
  field(intro,'Close sense',r.deeperEn,'en');
  field(intro,'Place in this bani',r.theme,'en');
  const vocab=elt('dl','learn-dl');
  for(const [word,gloss] of r.words){
   appendText(vocab,'dt','',word,'pa');
   appendText(vocab,'dd','',gloss);
  }
  intro.append(elt('h4','', 'Words & grammar · working glosses'),vocab);
  intro.append(pending('Grammatical parsing and human-checked pronunciation are not yet written for every word.'));
  field(intro,'Interpretation & open questions',r.caution);
  const action=elt('section','application');
  field(action,'Practical reflection · application, not translation',r.reflection);
  field(action,'Teach it back',r.question);
  intro.append(action);
 }
 intro.append(elt('p','learn-coverage',coverageText(course,bani)));
 intro.append(pending(bani==='rehras'
  ?'Some Rehras source records contain several verse lines. Their explanations are marked as passage context. Exact recurring Chaupai and Anand passages reuse earlier educational drafts; all require qualified review.'
  :'Only authored passages display explanations. The original source is preserved, with disputed text withheld. Full educational coverage is still being written.'));
 details.append(summary,intro);
 node.append(details);
}
function noLesson(reason){
 const box=elt('div','learning-not-written');
 box.append(elt('strong','', 'Detailed explanation not written yet'));
 box.append(elt('p','',reason));
 return box;
}
function vocabList(study){
 const dl=elt('dl','lesson-vocabulary');
 for(const item of study.words){
  appendText(dl,'dt','',item.gurmukhi,'pa');
  appendText(dl,'dd','',item.workingGloss);
 }
 return dl;
}
function sourceDetails(course,bani,unit){
 const lesson=course.unitLessons[bani+'|'+unit.id];
 const details=elt('details','lesson-sources');
 details.append(elt('summary','', 'Sources, passage anchors & review'));
 appendText(details,'p','', 'Original source occurrence: '+lesson.sourceAnchor.id);
 appendText(details,'p','source-hash', 'Source SHA-256: '+lesson.sourceAnchor.sha256);
 if(lesson.provenance)appendText(details,'p','source-reference','This passage reuses a draft for the same original text in '+lesson.provenance.bani+' ('+lesson.provenance.id+'). Its Rehras context and occurrence remain distinct.');
 appendText(details,'p','', 'The source edition and these explanations are still unapproved. The citations below are research starting points, not scholarly approval.');
 const info=course.banis?.[bani];
 for(const k of info?.sourceKeys||[]){
  const src=course.meta.references.find(x=>x.key===k);
  if(src)appendText(details,'p','source-reference',(src.title||src.key)+' · '+(src.scope||'source information'));
 }
 return details;
}
function unitLesson(course,bani,u,mode,view){
 if(mode==='read')return null;
 const e=course?.unitLessons?.[bani+'|'+u.id];
 if(!e){
  return view==='continuous'?null:noLesson('The original source is available, but this passage has no authored bilingual explanation. Qualified review is also pending.');
 }
 if(mode==='meaning'){
  const card=elt('section','passage-summary');
  card.dataset.lessonUnit=u.id;
  card.append(draft('PASSAGE SUMMARY · NOT THE MEANING OF A SINGLE LINE'));
  card.append(elt('p','meaning-label','Passage meaning · summary, not word-for-word translation'));
  card.append(paragraph(e.simple.en,'en'),paragraph(e.simple.pa,'pa'));
  const more=elt('button','passage-explore','Explore deeper passage study');
  more.type='button';more.dataset.detailUnit=u.id;
  more.setAttribute('aria-label','Explore unreviewed detailed study for '+u.title);
  card.append(more);
  return card;
 }
 const card=elt('section','unit-lesson');
 card.dataset.lessonUnit=u.id;
 card.append(draft());
 card.append(elt('h3','',u.title+' · meaning and study'));
 field(card,'Passage meaning · summary, not word-for-word translation',e.simple.en,'en');
 card.append(paragraph(e.simple.pa,'pa'));
 field(card,'Close sense',e.study.closeReading,'en');
 card.append(pending('Extended Punjabi close-sense interpretation pending independent editorial review.'));
 field(card,'Place in '+(course.banis?.[bani]?.titleEn||'this bani'),e.study.focus,'en');
 card.append(elt('h4','', 'Words & grammar'),vocabList(e.study));
 card.append(pending('These are working vocabulary glosses; detailed inflection/grammar review has not been completed.'));
 field(card,'Pronunciation support','Not yet available. These teaching notes are not santhiya, a recording or a checked audio alignment.');
 field(card,'Interpretation & open questions',e.study.interpretationCare,'en');
 const application=elt('section','application');
 field(application,'Practical reflection · application, not translation',e.study.reflection,'en');
 application.append(pending('An expanded Punjabi practical reflection has not been independently authored/reviewed.'));
 field(application,'Teach it back',e.study.teachBack,'en');
 card.append(application,sourceDetails(course,bani,u));
 return card;
}
function lineNote(course,bani,l){
 const e=course?.closeTextNotes?.[bani+'|'+l.id];
 if(!e||e.sourceSha256!==l.sha256||l.held)return null;
 const button=elt('button','simple-meaning');
 button.type='button';button.dataset.meaningLine=l.id;
 const aggregate=e.kind==='AGGREGATED_SOURCE_RECORD_EDUCATIONAL_CONTEXT_NOT_LITERAL_TRANSLATION';
 button.setAttribute('aria-label',aggregate?'Passage context, educational draft. This source record may contain several verse lines. Tap to explore.':'Draft meaning for this line. Tap for more; qualified review pending.');
 const en=elt('span','english',e.simpleEn),pa=elt('span','punjabi',e.simplePa);
 pa.lang='pa';
 const label=aggregate?'Passage context · educational draft · tap to explore':e.kind==='HEADING_OR_INVOCATION_CONTEXT'
  ?'Heading / invocation · draft context · tap to explore'
  :'Draft meaning · tap to explore';
 button.append(en,pa,elt('span','expand-hint',label));
 return button;
}
function lineDetails(course,bani,line,unit){
 const e=course?.closeTextNotes?.[bani+'|'+line.id];
 if(!e||e.sourceSha256!==line.sha256||line.held)return null;
 const wrapper=elt('div','line-detail');
 appendText(wrapper,'p','excerpt',line.text,'pa');
 const simple=elt('div','simple-dialog');
 simple.append(paragraph(e.simpleEn,'en'),paragraph(e.simplePa,'pa'));
 wrapper.append(simple);
 const aggregate=e.kind==='AGGREGATED_SOURCE_RECORD_EDUCATIONAL_CONTEXT_NOT_LITERAL_TRANSLATION';
 wrapper.append(draft(aggregate?'PASSAGE CONTEXT · EDUCATIONAL DRAFT':'EXPLANATION · EDUCATIONAL DRAFT'));
 if(aggregate)wrapper.append(pending('This explanation summarizes the whole stored passage, which may contain several verse lines. It is not a separate translation of each internal line.'));
 if(e.provenance)wrapper.append(pending('Reused from the same original text in '+e.provenance.bani+' ('+e.provenance.id+'). This Rehras occurrence keeps its own reading position and source identity.'));
 field(wrapper,'Interpretation & open questions',e.interpretiveCaution);
 const study=course.unitLessons?.[bani+'|'+unit.id];
 if(study){
  wrapper.append(pending('The following Study draft covers the entire enclosing passage, not just this line.'));
  wrapper.append(unitLesson(course,bani,unit,'study','passage'));
 }else{
  wrapper.append(noLesson('Only a selective line note is authored. Deeper passage study is still being prepared.'));
 }
 return wrapper;
}
function nextIndex(course,bani,units,current){
 for(let i=current+1;i<units.length;i++)
  if(course?.unitLessons?.[bani+'|'+units[i].id])return i;
 return -1;
}
window.GLP_NitnemLearning=Object.freeze({overview,unitLesson,lineNote,lineDetails,nextIndex,coverageText});
})();
