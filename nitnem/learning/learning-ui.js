/* GLP-001 private learning draft renderer.
 * Text DOM nodes only: no HTML injection, no improvisation, no provider calls.
 * The original Gurmukhi comes only from immutable source packs, NEVER here.
 */
(()=>{
'use strict';
const elt=(name,cls,text)=>{
 const n=document.createElement(name);
 if(cls)n.className=cls;
 if(text!==undefined)n.textContent=text;
 return n;
};
function para(label,text,lang){
 const box=elt('div','learn-paragraph');
 if(label)box.append(elt('p','learn-tag',label));
 const p=elt('p','learn-body',text);
 if(lang)p.lang=lang;
 box.append(p);return box;
}
function statusBadge(){
 const b=elt('span','learning-draft-label','EDUCATIONAL DRAFT · NOT SCHOLAR-REVIEWED');
 b.setAttribute('aria-label','This explanation has not been reviewed by a qualified Sikh or Punjabi scholar');
 return b;
}
function noLesson(reason,summary=false){
 const card=elt('div','learning-not-written');
 card.append(elt('strong',null,summary?'Lesson outline pending':'Detailed explanation not written yet'));
 card.append(elt('p',null,reason));
 return card;
}
function coverageText(course,bani){
 const record=course.coverage.byBani[bani];
 return record.draftLessons+' of '+record.totalUnits+' passages drafted · '+record.firstLineNotes+' selective line notes · 0 scholar-reviewed';
}
function overview(node,course,bani,mode){
 node.replaceChildren();node.hidden=mode==='read';
 if(mode==='read')return;
 if(!course||!course.banis?.[bani]){
  node.append(noLesson('This original-source reader works, but its authored learning package is not yet available. No meanings have been invented.',true));
  return;
 }
 const record=course.banis[bani],wrap=elt('article','learning-article');
 wrap.append(statusBadge());
 wrap.append(elt('p','learn-section-label',mode==='meaning'?'THE BANI IN SIMPLE WORDS':'UNDERSTANDING THE FULL BANI'));
 wrap.append(elt('h2','learn-topic',record.theme));
 wrap.append(para('Simple English',record.simpleEn,'en'));
 wrap.append(para('ਸੌਖੀ ਪੰਜਾਬੀ',record.simplePa,'pa'));
 if(mode==='study'){
  wrap.append(para('Study the whole bani',record.deeperEn,'en'));
  const words=elt('dl','learn-words');
  for(const pair of record.words){
   const dt=elt('dt',null,pair[0]);dt.lang='pa';
   words.append(dt,elt('dd',null,pair[1]));
  }
  const vocabulary=elt('section','learn-vocabulary');
  vocabulary.append(elt('h3',null,'Key words · ਮੁੱਖ ਸ਼ਬਦ'),words);
  wrap.append(vocabulary);
  wrap.append(para('Interpretive care',record.caution));
  wrap.append(para('Reflect',record.reflection));
  wrap.append(para('Teach-back question',record.question));
 }
 wrap.append(elt('p','learn-coverage',coverageText(course,bani)));
 wrap.append(elt('p','learn-coverage-detail',
  'The remaining passages are still being written. These are original educational paraphrases, not verified translations of every Gurbani line.'));
 node.append(wrap);
}
function unitLesson(course,bani,u,mode,view){
 if(mode==='read')return null;
 const draft=course?.unitLessons?.[bani+'|'+u.id];
 if(!draft){
  if(view==='continuous')return null;
  return noLesson('This passage has no finished bilingual draft. The Gurmukhi above remains unchanged; source-specific writing and human review are still pending.');
 }
 const card=elt('section','unit-learning');
 card.dataset.lessonUnit=u.id;
 card.append(statusBadge());
 card.append(elt('h3','learn-heading',mode==='meaning'?'Simple explanation · ਸਰਲ ਅਰਥ':'Learning room · ਵਿਸਥਾਰ'));
 card.append(para('English · educational paraphrase',draft.simple.en,'en'));
 card.append(para('ਸੌਖੀ ਪੰਜਾਬੀ · ਸਮਝ',draft.simple.pa,'pa'));
 if(mode==='study'){
  const study=draft.study;
  card.append(para('Main idea',study.focus));
  card.append(para('Close reading and context',study.closeReading));
  const dl=elt('dl','learn-words');
  for(const item of study.words){
   const dt=elt('dt',null,item.gurmukhi);dt.lang='pa';
   dl.append(dt,elt('dd',null,item.workingGloss));
  }
  const terms=elt('section','learn-vocabulary');
  terms.append(elt('h4',null,'Vocabulary · working glosses'),dl);
  card.append(terms);
  card.append(para('Where interpretation needs care',study.interpretationCare));
  card.append(para('Reflection · ਵਿਚਾਰ',study.reflection));
  card.append(para('Explain it back in your own words',study.teachBack));
 }
 return card;
}
function lineNote(course,bani,l){
 const record=course?.closeTextNotes?.[bani+'|'+l.id];
 if(!record||record.sourceSha256!==l.sha256)return null;
 const box=elt('aside','line-simple-note');
 box.dataset.lineLessonId=l.id;
 box.append(elt('p','learn-tag','SELECTIVE LINE NOTE · DRAFT, NOT LITERAL TRANSLATION'));
 box.append(para('English',record.simpleEn,'en'));
 box.append(para('ਪੰਜਾਬੀ',record.simplePa,'pa'));
 const nuance=elt('p','line-nuance','Interpretive care: '+record.interpretiveCaution);
 box.append(nuance);
 return box;
}
function nextIndex(course,bani,units,current){
 const lessons=course?.unitLessons;
 if(!lessons)return -1;
 for(let i=current+1;i<units.length;i++){
  if(Object.hasOwn(lessons,bani+'|'+units[i].id))return i;
 }
 return -1;
}
window.GLP_NitnemLearning=Object.freeze({overview,unitLesson,lineNote,nextIndex,coverageText});
})();
