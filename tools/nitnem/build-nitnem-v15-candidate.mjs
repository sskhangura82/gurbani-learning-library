/* Builds ONLY into a new --out directory. Never updates the running reader,
 * repository runtime, old courses, gateway, auth configuration or public main.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {units91to95} from './jaap-chhands91-95-candidate.mjs';
import {units96to100} from './jaap-chhands96-100-candidate.mjs';
import {units101to105} from './jaap-chhands101-105-candidate.mjs';
import {references,sourceChecks} from './jaap-chhands91-105-research.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const flag=process.argv.indexOf('--out');
assert.ok(flag>=0&&process.argv[flag+1],'Usage: node tools/nitnem/build-nitnem-v15-candidate.mjs --out NEW_DIRECTORY');
const out=path.resolve(process.argv[flag+1]);
assert.ok(!fs.existsSync(out),'Refuse to overwrite any existing candidate');
assert.ok(out!==root&&!root.startsWith(out+path.sep),'Output cannot contain the source checkout');
const read=p=>fs.readFileSync(path.join(root,p));
const json=p=>JSON.parse(read(p));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const baseCommit='2f50e75732af3b8625a68ed897341d42d9a36f3c';
const priorHash='3a0d15041cccb837b063165ff5acbcdb3345a59616b57fca392c8be0d9f801d9';
assert.equal(sha(read('nitnem/learning/course.v14.json')),priorHash,'Pinned V14 course changed');
assert.equal(sha(read('nitnem/data/library.json')),'b5865b293acc3ea91a20487dd82efd6f503d22dc5823bc2a67effcd146840d7a');
const manifest=json('nitnem/data/library.json'),prior=json('nitnem/learning/course.v14.json');
assert.equal(manifest.sourceCommit,'373ccc34f4a1c0ccb6ce36654bf6e9574087200f');
assert.equal(prior.meta.editorialStatus,'DRAFT_AI_UNREVIEWED');
assert.equal(prior.meta.publicationAllowed,false);assert.equal(prior.meta.reviewer,null);
assert.equal(Object.keys(prior.closeTextNotes).length,919);assert.equal(Object.keys(prior.unitLessons).length,217);
const course=structuredClone(prior),packs={},sourceLines=new Map(),sourceUnits=new Map();
for(const [bani,e] of Object.entries(manifest.entries)){
 const bytes=read('nitnem/'+e.path);assert.equal(sha(bytes),e.sha256,bani);
 const pack=JSON.parse(bytes);packs[bani]=pack;
 assert.equal(pack.humanCollationApproved,false);assert.equal(pack.rightsCleared,false);
 assert.equal(pack.sourceRepositoryCommit,manifest.sourceCommit);
 for(const u of pack.units){
  assert.ok(!sourceUnits.has(bani+'|'+u.id));sourceUnits.set(bani+'|'+u.id,u);
  for(const l of u.lines){assert.equal(sha(l.text),l.sha256,l.id);assert.ok(!sourceLines.has(bani+'|'+l.id));sourceLines.set(bani+'|'+l.id,l);}
 }
}
assert.equal(sourceLines.size,1361);assert.equal(sourceUnits.size,327);
const drafts=[...units91to95,...units96to100,...units101to105];
assert.deepEqual(drafts.map(d=>d.n),Array.from({length:15},(_,i)=>91+i));
const targetUnits=packs.jaap.units.slice(90,105);
assert.equal(targetUnits.length,15);assert.ok(targetUnits.every(u=>u.lines.length===4));
assert.deepEqual(targetUnits.filter(u=>u.metricalHeadings.length).map(u=>u.id),['jaap094','jaap096','jaap099','jaap103']);
function text(x,label,min=8){assert.equal(typeof x,'string',label);assert.ok(x.trim().length>min,label);assert.ok(!/[\uFFFD\uE000-\uF8FF]/u.test(x),label+' invalid editorial Unicode');}
const reuse=[];
for(const d of drafts){
 const unitId='jaap'+String(d.n).padStart(3,'0'),u=sourceUnits.get('jaap|'+unitId);
 assert.ok(u&&u.lines.every(l=>!l.held));assert.equal(d.rows.length,u.lines.length);
 text(d.en,unitId+' summary',35);text(d.pa,unitId+' Punjabi summary');assert.match(d.pa,/\p{Script=Gurmukhi}/u);
 d.rows.forEach((r,i)=>{
  const l=u.lines[i],key='jaap|'+l.id;assert.ok(!Object.hasOwn(course.closeTextNotes,key),key);
  for(const f of ['en','pa','care'])text(r[f],key+' '+f);
  assert.match(r.pa,/\p{Script=Gurmukhi}/u);
  let en=r.en,pa=r.pa;
  if(r.reuseFrom){
   const priorKey='jaap|'+r.reuseFrom,from=sourceLines.get(priorKey),old=prior.closeTextNotes[priorKey];assert.ok(from&&old);
   const strip=t=>t.replace(/॥[੦-੯]+॥$/u,'॥');assert.equal(strip(from.text),strip(l.text),'Reuse requires the same source apart from stanza counter');
   en=old.simpleEn;pa=old.simplePa;reuse.push({from:priorKey,to:key,fields:['simpleEn','simplePa'],previousCourseSHA256:priorHash});
  }
  course.closeTextNotes[key]={lineId:l.id,sourceSha256:l.sha256,status:'DRAFT_AI_UNREVIEWED',kind:'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION',simpleEn:en,simplePa:pa,interpretiveCaution:r.care};
 });
 const s=d.study;assert.ok(s&&s.words.length>=2);
 for(const f of ['focus','closeReading','care','reflection','teachBack'])text(s[f],unitId+' '+f,f==='closeReading'?200:15);
 for(const [word,gloss] of s.words){assert.ok(u.lines.some(l=>l.text.includes(word)),unitId+' vocabulary absent: '+word);text(gloss,unitId+' gloss',1);}
 const key='jaap|'+unitId;assert.ok(!Object.hasOwn(course.unitLessons,key));
 course.unitLessons[key]={unitId,sourceAnchor:{id:u.lines[0].id,sha256:u.lines[0].sha256},status:'DRAFT_AI_UNREVIEWED',type:'ORIGINAL_EDUCATIONAL_PARAPHRASE',simple:{en:d.en,pa:d.pa},study:{focus:s.focus,closeReading:s.closeReading,words:s.words.map(([gurmukhi,workingGloss])=>({gurmukhi,workingGloss,status:'WORKING_GLOSS_NOT_APPROVED'})),interpretationCare:s.care,reflection:s.reflection,teachBack:s.teachBack}};
}
assert.equal(reuse.length,1);course.candidateV15Reuse=Object.freeze(reuse);
for(const [k,v] of Object.entries(prior.closeTextNotes))assert.deepEqual(course.closeTextNotes[k],v,k);
for(const [k,v] of Object.entries(prior.unitLessons))assert.deepEqual(course.unitLessons[k],v,k);
assert.deepEqual(course.editorialAmendments,prior.editorialAmendments);assert.deepEqual(course.sourceReuseEvidence,prior.sourceReuseEvidence);
for(const [b,c] of Object.entries(course.coverage.byBani)){
 c.firstLineNotes=Object.keys(course.closeTextNotes).filter(k=>k.startsWith(b+'|')).length;
 c.draftLessons=Object.keys(course.unitLessons).filter(k=>k.startsWith(b+'|')).length;
 if(b!=='jaap')assert.deepEqual(c,prior.coverage.byBani[b]);
}
course.coverage.closeTextOccurrenceNotes=Object.keys(course.closeTextNotes).length;
course.coverage.writtenUnitLessons=Object.keys(course.unitLessons).length;
assert.equal(course.coverage.closeTextOccurrenceNotes,979);assert.equal(course.coverage.writtenUnitLessons,232);
assert.equal(course.coverage.byBani.jaap.firstLineNotes,406);assert.equal(course.coverage.byBani.jaap.draftLessons,105);
assert.ok(!course.unitLessons['anand|anand24']);
for(const l of packs.anand.units.find(u=>u.id==='anand24').lines)assert.ok(!course.closeTextNotes['anand|'+l.id]);
const keys=new Set(course.meta.references.map(r=>r.key));
for(const r of references){assert.ok(!keys.has(r.key));assert.equal(new URL(r.url).protocol,'https:');keys.add(r.key);course.meta.references.push(r);course.banis.jaap.sourceKeys.push(r.key);}
for(const c of sourceChecks){assert.equal(c.humanReviewed,false);for(const k of c.referenceKeys)assert.ok(keys.has(k),k);for(const id of c.unitIds)assert.ok(targetUnits.some(u=>u.id===id));}
course.sourceChecks=[...(prior.sourceChecks||[]),...sourceChecks];
course.meta={...course.meta,revision:'JAAP_CHHANDS_91_105_V15_CANDIDATE',previousVersion:'course.v14.json',previousVersionSHA256:priorHash};
course.coverage.accounting={basis:'COVERED_SOURCE_OCCURRENCES_NOT_UNIQUE_NEW_TRANSLATIONS',previousSourceRecords:919,additionalSourceRecords:60,newJaapLineDrafts:59,newRehrasPassageContexts:0,exactSourceReusedLineDrafts:1,previousStudyLessons:217,additionalStudyLessons:15,newJaapStudyDrafts:15,newRehrasStudyDrafts:0,exactSourceReusedStudyDrafts:0};
const courseBytes=Buffer.from(JSON.stringify(course,null,2)+'\n');
const oldWorker=read('nitnem/sw.js').toString();
const match=oldWorker.match(/^const EXPECTED=(\{[^\n]+\});/m);assert.ok(match);
const oldExpected=JSON.parse(match[1]);assert.equal(Object.keys(oldExpected).length,44);
const files=new Map();
for(const [rel,digest] of Object.entries(oldExpected)){
 assert.ok(rel.startsWith('./')&&!rel.includes('..')&&!rel.includes('\\'));
 const bytes=read('nitnem/'+rel.slice(2));assert.equal(sha(bytes),digest,rel);files.set(rel.slice(2),bytes);
}
let reader=files.get('reader.js').toString();
const oldPin="const EXPECTED_LEARNING='"+priorHash+"';";
assert.equal(reader.split(oldPin).length,2);assert.equal(reader.split("jsonBytes('learning/course.v14.json',EXPECTED_LEARNING)").length,2);
reader=reader.replace(oldPin,"const EXPECTED_LEARNING='"+sha(courseBytes)+"';").replace("jsonBytes('learning/course.v14.json',EXPECTED_LEARNING)","jsonBytes('learning/course.v15.json',EXPECTED_LEARNING)");
// BODY carries data-mode for styling, but must not receive a mode-button
// click handler: bubbling theme/bookmark clicks otherwise rerender and jump.
const broadModeSelector="document.querySelectorAll('[data-mode]')";
assert.equal(reader.split(broadModeSelector).length,3,'Expected exactly the aria update and click binding');
reader=reader.replaceAll(broadModeSelector,"document.querySelectorAll('button[data-mode]')");
files.set('reader.js',Buffer.from(reader));files.set('learning/course.v15.json',courseBytes);
const expected=Object.fromEntries([...files].map(([name,bytes])=>['./'+name,sha(bytes)]));
assert.equal(Object.keys(expected).length,45);
const oldPrefix='const PREFIX="glp-nitnem-source-review:";';assert.equal(oldWorker.split(oldPrefix).length,2);
let worker=oldWorker.replace(oldPrefix,'const PREFIX="glp-nitnem-learning-v15-review:";');
worker=worker.replace(/^const VERSION=.*;$/m,'const VERSION='+JSON.stringify('glp-private-nitnem-qa-'+sha(JSON.stringify(expected)).slice(0,18))+';');
worker=worker.replace(/^const EXPECTED=.*;$/m,'const EXPECTED='+JSON.stringify(expected)+';');
files.set('sw.js',Buffer.from(worker));assert.equal(files.size,46);
fs.mkdirSync(path.join(out,'site'),{recursive:true});fs.mkdirSync(path.join(out,'evidence'));
for(const [name,bytes] of files){const p=path.join(out,'site',name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,bytes,{flag:'wx'});}
const preserved={};
for(const name of ['nitnem/data/library.json',...Object.values(manifest.entries).map(e=>'nitnem/'+e.path),...Array.from({length:14},(_,i)=>'nitnem/learning/course.v'+(i+1)+'.json'),'nitnem/appearance.js','nitnem/appearance.css','nitnem/index.html','nitnem/reader.css','nitnem/japji.html','nitnem/japji-assets/js/japji-full.js','full-japji.html','index.html','js/japji-full.js','sw.js'])preserved[name]=sha(read(name));
const report={status:'BUILT_NONDEPLOYING_CANDIDATE',baseCommit,courseSHA256:sha(courseBytes),sourceRecords:979,studyLessons:232,jaapRecords:406,jaapStudies:105,additionalCoveredRecords:60,originalNewMainExplanations:59,priorExactMainExplanationReuses:1,addedStudies:15,previousNotesPreserved:919,previousStudiesPreserved:217,originalFilesPreserved:preserved,assetHashes:Object.fromEntries([...files].map(([n,b])=>[n,sha(b)])),assets:46,cachedAssets:45,humanReviewed:0,independentModelReview:false,liveDeployment:false,publicMainChanged:false,desktopExecution:'BLOCKED_BEFORE_RUNNING',heldAnand24:true,runtimeAmendments:[{path:'reader.js',change:'Restrict both mode-control selectors to button[data-mode]',reason:'BODY also has data-mode; its inherited click listener caused unrelated clicks to rerender and scroll the reader',scope:'Generated candidate only; original runtime and appearance files unchanged'}]};
fs.writeFileSync(path.join(out,'evidence/build.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
