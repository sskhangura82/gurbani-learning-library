#!/usr/bin/env node
// Authored educational content only. This tool cannot reseal scripture.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const read=p=>fs.readFile(path.join(root,p));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const manifestBytes=await read('salok-kabir/data/library.json'),sourceBytes=await read('salok-kabir/data/salok-kabir.json');
const manifestSHA='eae1fdfdd3e9fedd7937bf95ec6bbe64f35b8112ece472a8a4b252bdf40d6c8d';
assert.equal(sha(manifestBytes),manifestSHA,'Teaching assembly must not authorise a changed source manifest');
assert.equal(sha(sourceBytes),'34698bcbbaa8c54416de495011ee38493f549a5c0b92720e684f8c399dcf64f2','Selected source is frozen');
const pack=JSON.parse(sourceBytes),BANI='salok-kabir',references=[],byReference=new Map(),inputs=[];
const entries=[];
async function authoringInput(name,role){
 const pathname='research/salok-kabir/'+name,bytes=await read(pathname);
 inputs.push({path:pathname,sha256:sha(bytes),role});return {bytes,value:JSON.parse(bytes)};
}
for(const name of ['teaching-001-081.json','teaching-082-162.json','teaching-163-243.json']){
 const {bytes,value:x}=await authoringInput(name,'ORIGINAL_AI_AUTHORED_DRAFT');
 const list=Array.isArray(x)?x:(x.saloks||x.entries||x.lessons);
 assert.ok(Array.isArray(list),'Expected numbered authored Salok entries in '+name);
 {
  const range=name.slice('teaching-'.length,-'.json'.length);
  const {value:ledger}=await authoringInput('editorial-amendments-'+range+'.json','EXPLICIT_AI_EDITORIAL_AMENDMENTS');
  const {bytes:review}=await authoringInput('editorial-review-'+range+'.json','INDEPENDENT_AI_REVIEW_NOT_HUMAN_APPROVAL');
  assert.equal(ledger.inputFile,name);assert.equal(ledger.inputSha256,sha(bytes));
  assert.equal(ledger.independentReviewSha256,sha(review));
  if(ledger.lineContextSidecarSha256){
   const {bytes:context}=await authoringInput('line-context-amendments-'+range+'.json','BILINGUAL_LINE_CONTEXT_AMENDMENTS');
   assert.equal(ledger.lineContextSidecarSha256,sha(context));
  }
  assert.equal(ledger.sourceTextChanged,false);assert.equal(ledger.qualifiedHumanReviewed,false);
  for(const amendment of ledger.amendments){
   const draft=list.find(entry=>entry.ordinal===amendment.ordinal);assert.ok(draft);
   const keys=amendment.field.split('.');assert.ok(['lines','simple','study','sources'].includes(keys[0]));
   assert.ok(keys.every(key=>!['__proto__','constructor','prototype'].includes(key)));
   let parent=draft;for(const key of keys.slice(0,-1)){assert.ok(Object.hasOwn(parent,key),amendment.field);parent=parent[key];}
   const key=keys.at(-1);assert.ok(!['__proto__','constructor','prototype'].includes(key));
   assert.deepEqual(parent[key]??null,amendment.before,'Editorial amendment input drift: '+amendment.ordinal+' '+amendment.field);
   parent[key]=amendment.after;
  }
  assert.equal(sha(JSON.stringify(list,null,2)+'\n'),ledger.resultSha256,'Reproduced amended teaching must match the reviewed result');
 }
 entries.push(...list);
}
entries.sort((a,b)=>a.ordinal-b.ordinal);assert.equal(entries.length,243);
assert.ok(!JSON.stringify(entries).includes('\uFFFD'),'An authored field contains a replacement character');
function reference(source){
 assert.equal(new URL(source.url).protocol,'https:');assert.ok(source.title&&source.scope);
 // Several Saloks share an Ang URL. Their distinct passage titles must survive.
 const identity=JSON.stringify([source.url,source.title,source.scope]);
 if(byReference.has(identity))return byReference.get(identity);
 const key='kabir-'+sha(identity).slice(0,14);byReference.set(identity,key);references.push({key,...source});return key;
}
const notes={},lessons={};
for(const [index,draft] of entries.entries()){
 const unit=pack.units[index];assert.equal(draft.ordinal,index+1);assert.equal(draft.lines.length,2);
 const sourceKeys=draft.sources.map(reference);assert.ok(sourceKeys.length);
 for(const [i,line]of unit.lines.entries()){
  const meaning=draft.lines[i];assert.ok(meaning.simpleEn&&meaning.simplePa&&meaning.interpretiveCaution&&meaning.interpretiveCautionPa);
  notes[BANI+'|'+line.id]={lineId:line.id,sourceSha256:line.sha256,status:'DRAFT_AI_UNREVIEWED',
   kind:'ORIGINAL_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION',...meaning};
 }
 assert.ok(draft.simple.en&&draft.simple.pa);
 for(const f of ['focus','closeReading','interpretationCare','reflection','teachBack'])assert.ok(draft.study[f]&&draft.study[f+'Pa']);
 for(const word of draft.study.words)assert.ok(unit.lines.some(l=>l.text.includes(word.gurmukhi)),unit.id+' vocabulary '+word.gurmukhi);
 lessons[BANI+'|'+unit.id]={unitId:unit.id,sourceAnchor:{id:unit.lines[0].id,sha256:unit.lines[0].sha256},sourcePassageSha256:unit.sourceDigest,
  status:'DRAFT_AI_UNREVIEWED',type:'ORIGINAL_EDUCATIONAL_PARAPHRASE',simple:draft.simple,study:draft.study,sourceKeys};
}
const primaryKey=reference({url:'https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=1364&g=1&h=0&k=0&p=0&r=0&t=0',title:'Sri Guru Granth Sahib Ji, Salok Bhagat Kabir Ji, opening on Ang 1364',scope:'Original Gurmukhi heading and numbered opening; no modern translation imported.'});
const headingNotes={};
function headingContext(heading,unit,label,simpleEn,simplePa){headingNotes[BANI+'|'+heading.id]={unitId:unit.id,headingSha256:heading.sha256,status:'DRAFT_AI_UNREVIEWED',label,simpleEn,simplePa};}
headingContext(pack.preface[0],pack.units[0],'Collection heading · educational context',
 'This original heading names the Salok collection associated with Bhagat Kabir Ji. The six Mahalla headings within the collection remain visible and are explained where they occur. The collection title comes before the invocation in the selected source.',
 'ਇਹ ਮੂਲ ਸਿਰਲੇਖ ਭਗਤ ਕਬੀਰ ਜੀ ਨਾਲ ਸੰਬੰਧਿਤ ਸਲੋਕ-ਸੰਗ੍ਰਹਿ ਦੀ ਪਛਾਣ ਕਰਦਾ ਹੈ। ਸੰਗ੍ਰਹਿ ਦੇ ਅੰਦਰ ਆਉਂਦੇ ਛੇ ਮਹਲਾ-ਸਿਰਲੇਖ ਆਪਣੇ ਥਾਂ ਉੱਤੇ ਦਿਖਾਏ ਅਤੇ ਸਮਝਾਏ ਗਏ ਹਨ। ਚੁਣੇ ਸਰੋਤ ਵਿੱਚ ਸੰਗ੍ਰਹਿ ਦਾ ਸਿਰਲੇਖ ਮੰਗਲ ਤੋਂ ਪਹਿਲਾਂ ਆਉਂਦਾ ਹੈ।');
headingContext(pack.preface[1],pack.units[0],'Invocation · educational context',
 'The invocation affirms the One and the grace of the True Guru. It follows the collection heading and precedes the first numbered Salok.',
 'ਮੰਗਲ ਇੱਕ ਪਰਮ ਸਤਿ ਅਤੇ ਸਤਿਗੁਰੂ ਦੀ ਕਿਰਪਾ ਵੱਲ ਸੰਕੇਤ ਕਰਦਾ ਹੈ। ਇਹ ਸੰਗ੍ਰਹਿ ਦੇ ਸਿਰਲੇਖ ਤੋਂ ਬਾਅਦ ਅਤੇ ਪਹਿਲੇ ਗਿਣਤੀ ਵਾਲੇ ਸਲੋਕ ਤੋਂ ਪਹਿਲਾਂ ਆਉਂਦਾ ਹੈ।');
for(const unit of pack.units)for(const heading of unit.metricalHeadings){
 const third=unit.attribution.explicitMahalla.mahalla===3;
 headingContext(heading,unit,'Mahalla heading · educational context',
  (third?'Mahalla 3 identifies Guru Amar Das Ji.':'Mahalla 5 identifies Guru Arjan Dev Ji.')+' This original heading introduces Salok '+unit.ordinal+' within the Kabir Salok collection. Its scope here is this numbered Salok; a later unheaded verse is not automatically reassigned.',
  (third?'ਮਹਲਾ ੩ ਗੁਰੂ ਅਮਰ ਦਾਸ ਜੀ ਵੱਲ ਸੰਕੇਤ ਕਰਦਾ ਹੈ।':'ਮਹਲਾ ੫ ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ ਵੱਲ ਸੰਕੇਤ ਕਰਦਾ ਹੈ।')+' ਇਹ ਮੂਲ ਸਿਰਲੇਖ ਕਬੀਰ ਜੀ ਦੇ ਸਲੋਕ-ਸੰਗ੍ਰਹਿ ਵਿੱਚ ਇਸ ਸਲੋਕ ਦੇ ਅੱਗੇ ਆਉਂਦਾ ਹੈ। ਇਸ ਦੀ ਪਛਾਣ ਇਸੇ ਗਿਣਤੀ ਵਾਲੇ ਸਲੋਕ ਨਾਲ ਜੁੜੀ ਹੈ; ਬਾਅਦ ਵਿੱਚ ਬਿਨਾਂ ਸਿਰਲੇਖ ਆਉਣ ਵਾਲੀ ਤੁਕ ਦਾ ਰਚਨਾਕਾਰ ਆਪਣੇ ਆਪ ਨਹੀਂ ਬਦਲਿਆ ਜਾਂਦਾ।');
}
const course={meta:{schema:'GLP-NITNEM-TEACHING-DRAFT-V2',editorialStatus:'DRAFT_AI_UNREVIEWED',
 interpretationType:'ORIGINAL_EDUCATIONAL_PARAPHRASE_NOT_CANONICAL_TRANSLATION',languageSupport:['en','pa'],reviewer:null,
 rightsStatus:'Original educational writing based on public-domain scripture; cited modern commentary consulted only for limited interpretive checks, not imported as prose.',
 authorNote:'AI-assisted English and Punjabi drafts. Technical and separate AI checks are not qualified Sikh scholarship or Punjabi review.',
 baseSourceCommit:pack.sourceRepositoryCommit,releaseId:pack.releaseId,boundManifestSHA256:manifestSHA,
 publicationAllowed:false,sourceOriginalUnchanged:true,specificSourceParaphrasesOnly:true,absentLessonsAlwaysLabelledPending:true,
 authoringInputs:inputs,references},
 coverage:{unitTotal:243,sourceLineTotal:486,sourceOccurrenceTotal:494,writtenUnitLessons:243,closeTextOccurrenceNotes:486,
  headingContextDrafts:8,reviewedUnitLessons:0,reviewedSourceMeaningLines:0,byBani:{[BANI]:{draftLessons:243,firstLineNotes:486,reviewedLessons:0}}},
 banis:{[BANI]:{titleEn:'Salok Bhagat Kabir Ji',titlePa:'ਸਲੋਕ ਭਗਤ ਕਬੀਰ ਜੀਉ ਕੇ',theme:'Naam, humility, discernment and wholehearted devotion',
  simpleEn:'These 243 Saloks address remembrance of the Divine, pride, attachment, love, truthful living and the limits of outward religious display. They use vivid images from everyday work, nature, social life and devotional practice. Each Salok deserves a complete reading, including its second line and its place among nearby passages.',
  simplePa:'ਇਹ ੨੪੩ ਸਲੋਕ ਪ੍ਰਭੂ ਦੇ ਸਿਮਰਨ, ਹੰਕਾਰ, ਮੋਹ, ਪ੍ਰੇਮ, ਸੱਚੇ ਜੀਵਨ ਅਤੇ ਬਾਹਰਲੇ ਧਾਰਮਿਕ ਦਿਖਾਵੇ ਦੀ ਸੀਮਾ ਬਾਰੇ ਗੱਲ ਕਰਦੇ ਹਨ। ਇਨ੍ਹਾਂ ਵਿੱਚ ਰੋਜ਼ਾਨਾ ਕੰਮ, ਕੁਦਰਤ, ਸਮਾਜਕ ਜੀਵਨ ਅਤੇ ਭਗਤੀ ਦੇ ਜੀਵੰਤ ਚਿੱਤਰ ਆਉਂਦੇ ਹਨ। ਹਰ ਸਲੋਕ ਨੂੰ ਉਸ ਦੀ ਦੂਜੀ ਤੁਕ ਅਤੇ ਨੇੜਲੇ ਸਲੋਕਾਂ ਦੇ ਪ੍ਰਸੰਗ ਸਮੇਤ ਪੂਰਾ ਪੜ੍ਹਨਾ ਚਾਹੀਦਾ ਹੈ।',
  deeperEn:'The sequence includes striking images and changes of voice. Some nearby Saloks develop or redirect a shared image. Six original Mahalla headings identify Guru contributions within the collection; they must remain visible. Names such as Namdev, Trilochan and Ravidas within the verses need careful contextual reading and do not independently settle authorship. Read the original words before treating a contemporary application as the passage’s meaning.',
  deeperPa:'ਇਸ ਲੜੀ ਵਿੱਚ ਪ੍ਰਭਾਵਸ਼ਾਲੀ ਚਿੱਤਰ ਅਤੇ ਬੋਲਣ ਵਾਲੀ ਆਵਾਜ਼ ਦੇ ਬਦਲਾਅ ਮਿਲਦੇ ਹਨ। ਕਈ ਨੇੜਲੇ ਸਲੋਕ ਇੱਕੋ ਚਿੱਤਰ ਦੀ ਗੱਲ ਅੱਗੇ ਵਧਾਉਂਦੇ ਜਾਂ ਉਸ ਨੂੰ ਨਵੀਂ ਦਿਸ਼ਾ ਦਿੰਦੇ ਹਨ। ਛੇ ਮੂਲ ਮਹਲਾ-ਸਿਰਲੇਖ ਸੰਗ੍ਰਹਿ ਵਿੱਚ ਗੁਰੂ ਸਾਹਿਬਾਨ ਦੀ ਬਾਣੀ ਦੀ ਪਛਾਣ ਕਰਦੇ ਹਨ; ਉਨ੍ਹਾਂ ਨੂੰ ਦਿਖਾਉਣਾ ਲਾਜ਼ਮੀ ਹੈ। ਤੁਕਾਂ ਵਿੱਚ ਨਾਮਦੇਵ, ਤ੍ਰਿਲੋਚਨ ਅਤੇ ਰਵਿਦਾਸ ਵਰਗੇ ਨਾਮ ਪ੍ਰਸੰਗ ਸਮੇਤ ਸਮਝਣੇ ਚਾਹੀਦੇ ਹਨ; ਕੇਵਲ ਨਾਮ ਰਚਨਾਕਾਰ ਦਾ ਨਿਰਣਾ ਨਹੀਂ ਕਰਦਾ। ਅੱਜ ਦੇ ਜੀਵਨ ਨਾਲ ਕੀਤੀ ਵਰਤੋਂ ਨੂੰ ਹੀ ਸਲੋਕ ਦਾ ਅਰਥ ਮੰਨਣ ਤੋਂ ਪਹਿਲਾਂ ਮੂਲ ਸ਼ਬਦ ਪੜ੍ਹੋ।',
  words:[['ਨਾਮੁ','Divine Name; remembrance of the Divine'],['ਪ੍ਰੇਮ','Love and devotion'],['ਭਗਤਿ','Devotion'],['ਸਾਧ','Saintly or spiritually disciplined person; sense depends on context']],
  caution:'The source sequence and the educational writing have separate provenance. One heading uses a documented alternate witness; one nasal-mark encoding differs from the second digital transcription. Ang labels follow the selected digital witness, with bounded printed-page observations recorded separately. The explanations are original AI-assisted drafts awaiting qualified Sikh and Punjabi review. Psychology, comparative religion, pronunciation teaching and licensed recordings remain separate work.',
  cautionPa:'ਮੂਲ ਪਾਠ ਦੀ ਲੜੀ ਅਤੇ ਸਿੱਖਿਆ ਲਈ ਲਿਖੇ ਅਰਥਾਂ ਦੇ ਸਰੋਤ ਵੱਖਰੇ ਦਰਜ ਹਨ। ਇੱਕ ਸਿਰਲੇਖ ਲਈ ਦਰਜ ਕੀਤੇ ਦੂਜੇ ਸਰੋਤ ਦੀ ਪੜ੍ਹਤ ਚੁਣੀ ਗਈ ਹੈ; ਇੱਕ ਨਾਸਕੀ ਚਿੰਨ੍ਹ ਦੀ ਡਿਜ਼ਿਟਲ ਕੋਡਿੰਗ ਦੂਜੀ ਲਿਖਤ ਤੋਂ ਵੱਖ ਹੈ। ਅੰਗ-ਪਛਾਣ ਚੁਣੇ ਡਿਜ਼ਿਟਲ ਸਰੋਤ ਅਨੁਸਾਰ ਹੈ; ਛਪੇ ਪੰਨਿਆਂ ਦੀ ਸੀਮਿਤ ਜਾਂਚ ਵੱਖਰੀ ਦਰਜ ਹੈ। ਅਰਥ ਏਆਈ ਦੀ ਸਹਾਇਤਾ ਨਾਲ ਲਿਖੇ ਮੂਲ ਮਸੌਦੇ ਹਨ; ਯੋਗ ਸਿੱਖ ਵਿਦਵਾਨਾਂ ਅਤੇ ਪੰਜਾਬੀ ਪਾਠਕਾਂ ਦੀ ਜਾਂਚ ਬਾਕੀ ਹੈ। ਮਨੋਵਿਗਿਆਨ, ਹੋਰ ਧਰਮਾਂ ਨਾਲ ਤੁਲਨਾ, ਉਚਾਰਨ ਅਤੇ ਇਜਾਜ਼ਤ ਵਾਲੀਆਂ ਰਿਕਾਰਡਿੰਗਾਂ ਵੱਖਰਾ ਕੰਮ ਹਨ।',
  reflection:'Choose one Salok. Notice its image, its address to the Divine or the human mind, and the turn made by its second line.',
  reflectionPa:'ਇੱਕ ਸਲੋਕ ਚੁਣੋ। ਉਸ ਦਾ ਚਿੱਤਰ, ਪ੍ਰਭੂ ਜਾਂ ਮਨੁੱਖੀ ਮਨ ਵੱਲ ਸੰਬੋਧਨ ਅਤੇ ਦੂਜੀ ਤੁਕ ਨਾਲ ਆਉਂਦੀ ਗੱਲ ਦੀ ਦਿਸ਼ਾ ਵੱਲ ਧਿਆਨ ਦਿਓ।',
  question:'What does this whole Salok say, and which part of your response is your own application?',
  questionPa:'ਇਹ ਪੂਰਾ ਸਲੋਕ ਕੀ ਆਖਦਾ ਹੈ, ਅਤੇ ਤੁਹਾਡੇ ਜਵਾਬ ਦਾ ਕਿਹੜਾ ਹਿੱਸਾ ਤੁਹਾਡੇ ਜੀਵਨ ਵਿੱਚ ਇਸ ਦੀ ਆਪਣੀ ਵਰਤੋਂ ਹੈ?',sourceKeys:[primaryKey]}},
 unitLessons:lessons,closeTextNotes:notes,headingNotes};
const bytes=JSON.stringify(course,null,2)+'\n',courseSHA=sha(bytes);
await fs.mkdir(path.join(root,'salok-kabir/learning'),{recursive:true});
await fs.writeFile(path.join(root,'salok-kabir/learning/course.complete.json'),bytes);
const readerPath=path.join(root,'nitnem/reader.js'),reader=await fs.readFile(readerPath,'utf8');
assert.match(reader,/const KABIR_TEACHING='(?:KABIR_TEACHING_PIN|[a-f0-9]{64})';/);
await fs.writeFile(readerPath,reader.replace(/const KABIR_TEACHING='[^']+';/,"const KABIR_TEACHING='"+courseSHA+"';"));
console.log(JSON.stringify({status:'PASS',verseMeaningDrafts:486,passageStudyDrafts:243,headingContextDrafts:8,courseSHA256:courseSHA,scriptureManifestUnchanged:sha(await read('salok-kabir/data/library.json'))===manifestSHA}));
