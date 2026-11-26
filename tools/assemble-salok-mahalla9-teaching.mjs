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
const manifestBytes=await read('salok-mahalla9/data/library.json'),sourceBytes=await read('salok-mahalla9/data/salok-mahalla9.json');
const manifestSHA='abba1e752d13bd6a3dadef63d287d992fd20ac8a2408163239d501db2971769e';
assert.equal(sha(manifestBytes),manifestSHA,'Teaching assembly must not authorise a changed source manifest');
assert.equal(sha(sourceBytes),'f72690bb730b24e6631fbbabf574798e5451837987d227a807a3bcf49a366e75','Selected source is frozen');
const pack=JSON.parse(sourceBytes),BANI='salok-mahalla9',references=[],byReference=new Map(),inputs=[];
const entries=[];
async function authoringInput(name,role){
 const pathname='research/salok-mahalla9/'+name,bytes=await read(pathname);
 inputs.push({path:pathname,sha256:sha(bytes),role});return {bytes,value:JSON.parse(bytes)};
}
for(const name of ['teaching-01-29.json','teaching-30-57.json']){
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
entries.sort((a,b)=>a.ordinal-b.ordinal);assert.equal(entries.length,57);
function reference(source){
 assert.equal(new URL(source.url).protocol,'https:');assert.ok(source.title&&source.scope);
 // Several Saloks share an Ang URL. Their distinct passage titles must survive.
 const identity=JSON.stringify([source.url,source.title,source.scope]);
 if(byReference.has(identity))return byReference.get(identity);
 const key='m9-'+sha(identity).slice(0,14);byReference.set(identity,key);references.push({key,...source});return key;
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
const primaryKey=reference({url:'https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=1426&g=1&h=0&k=0&p=0&r=0&t=0',title:'Sri Guru Granth Sahib Ji, Salok Mahalla 9, opening on Ang 1426',scope:'Original Gurmukhi heading and numbered opening; no modern translation imported.'});
const headingNotes={};
function headingContext(heading,unit,label,simpleEn,simplePa){headingNotes[BANI+'|'+heading.id]={unitId:unit.id,headingSha256:heading.sha256,status:'DRAFT_AI_UNREVIEWED',label,simpleEn,simplePa};}
headingContext(pack.preface[0],pack.units[0],'Invocation · educational context',
 'The opening invocation affirms the One and the grace of the True Guru. It belongs before the collection heading in this selected source.',
 'ਆਰੰਭਕ ਮੰਗਲ ਇੱਕ ਪਰਮ ਸਤਿ ਅਤੇ ਸਤਿਗੁਰੂ ਦੀ ਕਿਰਪਾ ਵੱਲ ਸੰਕੇਤ ਕਰਦਾ ਹੈ। ਚੁਣੇ ਹੋਏ ਸਰੋਤ ਵਿੱਚ ਇਹ ਸਲੋਕਾਂ ਦੇ ਸਿਰਲੇਖ ਤੋਂ ਪਹਿਲਾਂ ਆਉਂਦਾ ਹੈ।');
headingContext(pack.preface[1],pack.units[0],'Collection heading · educational context',
 'Mahalla 9 identifies the ninth Guru, Guru Tegh Bahadur Ji. This heading names the collection; the numbered Saloks follow.',
 'ਮਹਲਾ ੯ ਨੌਵੇਂ ਗੁਰੂ, ਗੁਰੂ ਤੇਗ ਬਹਾਦਰ ਜੀ ਵੱਲ ਸੰਕੇਤ ਕਰਦਾ ਹੈ। ਇਹ ਸਿਰਲੇਖ ਸਲੋਕਾਂ ਦੇ ਇਸ ਸੰਗ੍ਰਹਿ ਦੀ ਪਛਾਣ ਹੈ; ਇਸ ਤੋਂ ਅੱਗੇ ਗਿਣਤੀ ਵਾਲੇ ਸਲੋਕ ਆਉਂਦੇ ਹਨ।');
headingContext(pack.units[52].metricalHeadings[0],pack.units[52],'Dohra heading · educational context',
 'This original heading introduces the Dohra section before Salok 53. The source numbering continues through Salok 57; the heading is not an extra Salok.',
 'ਇਹ ਮੂਲ ਸਿਰਲੇਖ ਸਲੋਕ ੫੩ ਤੋਂ ਪਹਿਲਾਂ ਦੋਹਰੇ ਦੇ ਭਾਗ ਨੂੰ ਦਰਸਾਉਂਦਾ ਹੈ। ਮੂਲ ਗਿਣਤੀ ਸਲੋਕ ੫੭ ਤੱਕ ਜਾਰੀ ਰਹਿੰਦੀ ਹੈ; ਇਹ ਸਿਰਲੇਖ ਵੱਖਰਾ ਵਾਧੂ ਸਲੋਕ ਨਹੀਂ ਹੈ।');
const course={meta:{schema:'GLP-NITNEM-TEACHING-DRAFT-V2',editorialStatus:'DRAFT_AI_UNREVIEWED',
 interpretationType:'ORIGINAL_EDUCATIONAL_PARAPHRASE_NOT_CANONICAL_TRANSLATION',languageSupport:['en','pa'],reviewer:null,
 rightsStatus:'Original educational writing based on public-domain scripture; cited modern commentary consulted only for limited interpretive checks, not imported as prose.',
 authorNote:'AI-assisted English and Punjabi drafts. Technical and separate AI checks are not qualified Sikh scholarship or Punjabi review.',
 baseSourceCommit:pack.sourceRepositoryCommit,releaseId:pack.releaseId,boundManifestSHA256:manifestSHA,
 publicationAllowed:false,sourceOriginalUnchanged:true,specificSourceParaphrasesOnly:true,absentLessonsAlwaysLabelledPending:true,
 authoringInputs:inputs,references},
 coverage:{unitTotal:57,sourceLineTotal:114,sourceOccurrenceTotal:117,writtenUnitLessons:57,closeTextOccurrenceNotes:114,
  headingContextDrafts:3,reviewedUnitLessons:0,reviewedSourceMeaningLines:0,byBani:{[BANI]:{draftLessons:57,firstLineNotes:114,reviewedLessons:0}}},
 banis:{[BANI]:{titleEn:'Salok Mahalla 9',titlePa:'ਸਲੋਕ ਮਹਲਾ ੯',theme:'Remembrance, freedom from attachment and the passing of life',
  simpleEn:'These 57 Saloks call the mind toward the Divine amid a changing life. They speak of Naam, freedom from possessiveness and pride, fearlessness, the limits of worldly support, and the grace on which spiritual freedom depends.',
  simplePa:'ਇਹ ੫੭ ਸਲੋਕ ਬਦਲਦੇ ਜੀਵਨ ਵਿੱਚ ਮਨ ਨੂੰ ਪਰਮਾਤਮਾ ਵੱਲ ਮੋੜਦੇ ਹਨ। ਇਨ੍ਹਾਂ ਵਿੱਚ ਨਾਮ, ਮਮਤਾ ਅਤੇ ਹੰਕਾਰ ਤੋਂ ਛੁਟਕਾਰਾ, ਨਿਰਭੈਤਾ, ਦੁਨਿਆਵੀ ਆਸਰਿਆਂ ਦੀ ਸੀਮਾ ਅਤੇ ਆਤਮਕ ਮੁਕਤੀ ਲਈ ਪ੍ਰਭੂ ਦੀ ਕਿਰਪਾ ਦੀ ਗੱਲ ਹੈ।',
  deeperEn:'Read each couplet as a whole. The second line often answers, completes or redirects the first. Repeated addresses to the mind draw the reader into reflection; they are more than detached descriptions of someone else. The closing Saloks move through helplessness, renewed strength, abiding support and remembrance. Historical stories about their composition require their own evidence and are not presumed here.',
  deeperPa:'ਹਰੇਕ ਦੋ-ਤੁਕੀ ਸਲੋਕ ਨੂੰ ਪੂਰਾ ਪੜ੍ਹੋ। ਦੂਜੀ ਤੁਕ ਅਕਸਰ ਪਹਿਲੀ ਦੀ ਗੱਲ ਪੂਰੀ ਕਰਦੀ, ਉਸ ਦਾ ਜਵਾਬ ਦਿੰਦੀ ਜਾਂ ਮਨ ਨੂੰ ਨਵੀਂ ਦਿਸ਼ਾ ਵੱਲ ਮੋੜਦੀ ਹੈ। ਮਨ ਨੂੰ ਵਾਰ-ਵਾਰ ਕੀਤਾ ਸੰਬੋਧਨ ਪੜ੍ਹਨ ਵਾਲੇ ਨੂੰ ਆਪਣੇ ਜੀਵਨ ਉੱਤੇ ਵਿਚਾਰ ਕਰਨ ਲਈ ਬੁਲਾਉਂਦਾ ਹੈ; ਇਹ ਕੇਵਲ ਕਿਸੇ ਹੋਰ ਦਾ ਵਰਣਨ ਨਹੀਂ। ਅੰਤਲੇ ਸਲੋਕ ਬੇਵਸੀ, ਮਿਲੀ ਤਾਕਤ, ਟਿਕਾਊ ਆਸਰੇ ਅਤੇ ਸਿਮਰਨ ਦੀ ਗੱਲ ਕਰਦੇ ਹਨ। ਇਨ੍ਹਾਂ ਦੀ ਰਚਨਾ ਨਾਲ ਜੁੜੀਆਂ ਇਤਿਹਾਸਕ ਕਥਾਵਾਂ ਲਈ ਵੱਖਰਾ ਪ੍ਰਮਾਣ ਚਾਹੀਦਾ ਹੈ; ਇੱਥੇ ਉਨ੍ਹਾਂ ਨੂੰ ਪਹਿਲਾਂ ਤੋਂ ਸੱਚ ਨਹੀਂ ਮੰਨਿਆ ਗਿਆ।',
  words:[['ਨਾਮੁ','Divine Name; remembrance of the Divine'],['ਮਮਤਾ','Possessive attachment'],['ਭੈ','Fear'],['ਮੁਕਤਿ','Spiritual liberation']],
  caution:'The complete source sequence is present. Digital comparison, drafted explanations, qualified review, pronunciation teaching and licensed recordings are separate stages. Psychology and comparisons with other traditions will be separately sourced additions; they do not replace the theological meaning of these Saloks.',
  cautionPa:'ਮੂਲ ਪਾਠ ਦੀ ਪੂਰੀ ਲੜੀ ਇੱਥੇ ਹੈ। ਡਿਜ਼ਿਟਲ ਤੁਲਨਾ, ਅਰਥਾਂ ਦੇ ਮਸੌਦੇ, ਯੋਗ ਵਿਦਵਾਨਾਂ ਦੀ ਜਾਂਚ, ਉਚਾਰਨ ਦੀ ਸਿੱਖਿਆ ਅਤੇ ਇਜਾਜ਼ਤ ਵਾਲੀਆਂ ਰਿਕਾਰਡਿੰਗਾਂ ਵੱਖਰੇ ਪੜਾਅ ਹਨ। ਮਨੋਵਿਗਿਆਨ ਅਤੇ ਹੋਰ ਧਰਮਾਂ ਨਾਲ ਤੁਲਨਾਵਾਂ ਵੱਖਰੇ ਸਰੋਤਾਂ ਸਮੇਤ ਜੋੜੀਆਂ ਜਾਣਗੀਆਂ; ਉਹ ਸਲੋਕਾਂ ਦੇ ਆਤਮਕ ਅਰਥ ਦੀ ਥਾਂ ਨਹੀਂ ਲੈਣਗੀਆਂ।',
  reflection:'Choose one Salok and notice how its two lines work together before asking how it speaks to your life.',
  reflectionPa:'ਇੱਕ ਸਲੋਕ ਚੁਣੋ। ਆਪਣੇ ਜੀਵਨ ਨਾਲ ਜੋੜਨ ਤੋਂ ਪਹਿਲਾਂ ਵੇਖੋ ਕਿ ਉਸ ਦੀਆਂ ਦੋਵੇਂ ਤੁਕਾਂ ਆਪਸ ਵਿੱਚ ਕਿਵੇਂ ਜੁੜਦੀਆਂ ਹਨ।',
  question:'What does your chosen Salok say about the Divine, the mind, and what lasts?',
  questionPa:'ਚੁਣਿਆ ਸਲੋਕ ਪਰਮਾਤਮਾ, ਮਨ ਅਤੇ ਟਿਕਾਊ ਆਸਰੇ ਬਾਰੇ ਕੀ ਆਖਦਾ ਹੈ?',sourceKeys:[primaryKey]}},
 unitLessons:lessons,closeTextNotes:notes,headingNotes};
const bytes=JSON.stringify(course,null,2)+'\n',courseSHA=sha(bytes);
await fs.mkdir(path.join(root,'salok-mahalla9/learning'),{recursive:true});
await fs.writeFile(path.join(root,'salok-mahalla9/learning/course.complete.json'),bytes);
const readerPath=path.join(root,'nitnem/reader.js'),reader=await fs.readFile(readerPath,'utf8');
assert.match(reader,/const SALOK_TEACHING='(?:SALOK_TEACHING_PIN|[a-f0-9]{64})';/);
await fs.writeFile(readerPath,reader.replace(/const SALOK_TEACHING='[^']+';/,"const SALOK_TEACHING='"+courseSHA+"';"));
console.log(JSON.stringify({status:'PASS',verseMeaningDrafts:114,passageStudyDrafts:57,headingContextDrafts:3,courseSHA256:courseSHA,scriptureManifestUnchanged:sha(await read('salok-mahalla9/data/library.json'))===manifestSHA}));
