/* Educational explanations are kept separate from the verified Gurmukhi. */
(()=>{
'use strict';
const elt=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=value;return n;};
const appendText=(parent,tag,cls,value,lang)=>{const n=elt(tag,cls,value);if(lang)n.lang=lang;parent.append(n);return n;};
function paragraph(text,lang){const p=elt('p',lang==='pa'?'punjabi-text':'',text);if(lang)p.lang=lang;return p;}
function field(root,title,en,pa){if(!en&&!pa)return;root.append(elt('h4','',title));if(en)root.append(paragraph(en,'en'));if(pa)root.append(paragraph(pa,'pa'));}
function note(text){const p=elt('p','pending-meaning',text);p.setAttribute('role','note');return p;}
function draft(label='EDUCATIONAL DRAFT · QUALIFIED HUMAN REVIEW PENDING'){return elt('p','draft-label',label);}
function references(course,keys){
 const list=elt('ul','reference-list');
 for(const key of [...new Set(keys||[])]){
  const source=course.meta.references.find(s=>s.key===key);if(!source)continue;
  const item=elt('li','source-reference');
  let valid=false;try{valid=new URL(source.url).protocol==='https:';}catch(_){}
  if(valid){const a=elt('a','',source.title||source.key);a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';item.append(a);}
  else item.append(elt('span','',source.title||source.key));
  if(source.scope)item.append(elt('span','reference-scope',' — '+source.scope));list.append(item);
 }return list;
}
function coverageText(course,bani){const r=course?.coverage?.byBani?.[bani];return r?r.draftLessons+' passage studies · '+r.firstLineNotes+(bani==='rehras'?' source records explained':' English / Punjabi meaning pairs'):'Learning could not load.';}
function overview(node,course,bani,mode){
 node.replaceChildren();node.hidden=mode==='read';if(mode==='read')return;
 if(!course?.banis?.[bani]){node.append(note('The teaching material could not load. You can still read the Gurmukhi.'));return;}
 const r=course.banis[bani],details=elt('details','learning-disclosure'),intro=elt('section','learning-article');
 details.append(elt('summary','learning-summary','About this bani · themes and sources'));
 intro.append(draft());appendText(intro,'h3','learn-topic',r.theme);
 field(intro,'Overview',r.simpleEn,r.simplePa);
 if(mode==='study'){
  field(intro,'A closer reading',r.deeperEn,r.deeperPa);
  const vocab=elt('dl','learn-dl');for(const [word,gloss] of r.words||[]){appendText(vocab,'dt','',word,'pa');appendText(vocab,'dd','',gloss);}
  intro.append(elt('h4','','Words to understand'),vocab);
  field(intro,'Interpretation and context',r.caution,r.cautionPa);
  const action=elt('section','application');field(action,'Reflection · application, not translation',r.reflection,r.reflectionPa);field(action,'Teach it back',r.question,r.questionPa);intro.append(action);
 }
 intro.append(elt('p','learn-coverage',coverageText(course,bani)));
 if(bani==='rehras')intro.append(note('Some stored Rehras passages contain several verse lines. Their meanings are labeled “Passage context.” Recurring Chaupai and Anand passages retain their own place within Rehras.'));
 intro.append(note(bani==='salok-kabir'
  ?'All 243 Saloks have English and Punjabi line explanations and passage-study drafts. The original Mahalla headings and named voices are preserved. Qualified Gurbani and Punjabi review is pending. Pronunciation teaching and recordings are planned separately.'
  :bani==='salok-mahalla9'
  ?'All 57 Saloks have English and Punjabi line explanations and passage-study drafts. Qualified Gurbani and Punjabi review is pending. Pronunciation teaching and recordings are planned separately.'
  :'Meanings and study are original educational paraphrases. Earlier detailed studies are chiefly in English, with bilingual line meanings and passage summaries. These notes do not provide pronunciation instruction or recorded paath.'));
 const sources=elt('details','lesson-sources');sources.append(elt('summary','','Reference list'),references(course,r.sourceKeys));intro.append(sources);details.append(intro);node.append(details);
}
function vocabList(study){
 const dl=elt('dl','lesson-vocabulary');for(const word of study.words||[]){appendText(dl,'dt','',word.gurmukhi,'pa');appendText(dl,'dd','',word.workingGloss,'en');if(word.workingGlossPa)appendText(dl,'dd','punjabi-text',word.workingGlossPa,'pa');}return dl;
}
function sourceDetails(course,bani,unit){
 const lesson=course.unitLessons[bani+'|'+unit.id],details=elt('details','lesson-sources');
 details.append(elt('summary','','Sources and review'));
 appendText(details,'p','','Gurmukhi source: '+lesson.sourceAnchor.id);
 appendText(details,'p','source-hash','Source SHA-256: '+lesson.sourceAnchor.sha256);
 if(lesson.provenance)appendText(details,'p','source-reference','This passage shares an explanation with the same text in '+lesson.provenance.bani+'. Its place within Rehras is kept distinct.');
 appendText(details,'p','','Qualified human review is pending. References support the research; they do not imply approval of this explanation. The full reference list is under “About this bani.”');
 if(lesson.sourceKeys?.length)details.append(references(course,lesson.sourceKeys));
 return details;
}
function unitLesson(course,bani,u,mode,view){
 if(mode==='read')return null;
 const e=course?.unitLessons?.[bani+'|'+u.id];if(!e)return view==='continuous'?null:note('The study for this passage could not load.');
 if(mode==='meaning'){
  const card=elt('section','passage-summary');card.dataset.lessonUnit=u.id;
  card.append(elt('p','meaning-label','Passage summary · educational draft'),paragraph(e.simple.en,'en'),paragraph(e.simple.pa,'pa'));
  const button=elt('button','passage-explore','Explore this passage');button.type='button';button.dataset.detailUnit=u.id;button.setAttribute('aria-label','Explore deeper study for '+u.title);card.append(button);return card;
 }
 const card=elt('section','unit-lesson'),s=e.study;card.dataset.lessonUnit=u.id;card.append(draft(),elt('h3','',u.title+' · meaning and study'));
 field(card,'Passage summary',e.simple.en,e.simple.pa);
 field(card,'A closer reading',s.closeReading,s.closeReadingPa);
 field(card,'Place in '+(course.banis?.[bani]?.titleEn||'this bani'),s.focus,s.focusPa);
 card.append(elt('h4','','Words to understand'),vocabList(s));
 field(card,'Interpretation and context',s.interpretationCare,s.interpretationCarePa);
 const action=elt('section','application');field(action,'Reflection · application, not translation',s.reflection,s.reflectionPa);field(action,'Teach it back',s.teachBack,s.teachBackPa);
 card.append(action,sourceDetails(course,bani,u));return card;
}
function lineNote(course,bani,line){
 const entry=course?.closeTextNotes?.[bani+'|'+line.id];if(!entry||entry.sourceSha256!==line.sha256||line.held)return null;
 const aggregate=entry.kind==='AGGREGATED_SOURCE_RECORD_EDUCATIONAL_CONTEXT_NOT_LITERAL_TRANSLATION';
 const button=elt('button','simple-meaning');button.type='button';button.dataset.meaningLine=line.id;
 // The visible English and Punjabi meaning supplies the accessible name.
 const en=elt('span','english',entry.simpleEn),pa=elt('span','punjabi',entry.simplePa);en.lang='en';pa.lang='pa';
 button.append(en,pa,elt('span','expand-hint',(aggregate?'Passage context':entry.kind==='HEADING_OR_INVOCATION_CONTEXT'?'Heading / invocation':'Draft meaning')+' · tap to explore'));return button;
}
function lineDetails(course,bani,line,unit){
 const entry=course?.closeTextNotes?.[bani+'|'+line.id];if(!entry||entry.sourceSha256!==line.sha256||line.held)return null;
 const wrapper=elt('div','line-detail');appendText(wrapper,'p','excerpt',line.text,'pa');
 const simple=elt('div','simple-dialog');simple.append(paragraph(entry.simpleEn,'en'),paragraph(entry.simplePa,'pa'));wrapper.append(simple,draft());
 if(entry.kind==='AGGREGATED_SOURCE_RECORD_EDUCATIONAL_CONTEXT_NOT_LITERAL_TRANSLATION')wrapper.append(note('This explanation summarizes the whole displayed passage, which contains several verse lines.'));
 field(wrapper,'Interpretation and context',entry.interpretiveCaution,entry.interpretiveCautionPa);
 const study=unitLesson(course,bani,unit,'study','passage');if(study){wrapper.append(note('The study below covers the whole enclosing passage.'),study);}return wrapper;
}
function headingNote(course,bani,unit,heading){
 const entries=Object.values(course?.headingNotes||{});
 const entry=entries.find(e=>e.unitId===unit.id&&(e.headingSha256||e.sourceSha256||e.sourceAnchor?.sha256)===heading.sha256);
 if(!entry)return null;
 const box=elt('aside','heading-note');box.append(elt('p','meaning-label',entry.label||'Metre heading · educational context'));
 const en=entry.simpleEn||entry.simple?.en,pa=entry.simplePa||entry.simple?.pa;if(en)box.append(paragraph(en,'en'));if(pa)box.append(paragraph(pa,'pa'));return box;
}
function nextIndex(course,bani,units,current){for(let i=current+1;i<units.length;i++)if(course?.unitLessons?.[bani+'|'+units[i].id])return i;return -1;}
window.GLP_NitnemLearning=Object.freeze({overview,unitLesson,lineNote,lineDetails,headingNote,nextIndex,coverageText});
})();
