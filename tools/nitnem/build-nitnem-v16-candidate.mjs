/* Generate V16 into a new isolated output. Preserve raw runtime and sources.
 * V15 is reproduced first; its exact 46-asset site is the immediate baseline.
 */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const flag=process.argv.indexOf('--out');assert.ok(flag>=0&&process.argv[flag+1]);const out=path.resolve(process.argv[flag+1]);
assert.ok(!fs.existsSync(out),'Refuse to overwrite an existing candidate');assert.ok(out!==root&&!root.startsWith(out+path.sep));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),json=p=>JSON.parse(fs.readFileSync(p));
const result=spawnSync(process.execPath,['tools/nitnem/build-nitnem-v15-candidate.mjs','--out',path.join(out,'previous-v15')],{cwd:root,encoding:'utf8'});assert.equal(result.status,0,result.stderr);
const previous=path.join(out,'previous-v15/site'),priorBytes=fs.readFileSync(path.join(previous,'learning/course.v15.json'));
const priorHash='f9c1148a943f0530c9df39be5d3875f930109817468d23f44ab5391e6a8b87d8';assert.equal(sha(priorBytes),priorHash);
const prior=JSON.parse(priorBytes),course=structuredClone(prior),manifest=json(path.join(previous,'data/library.json'));
assert.equal(Object.keys(prior.closeTextNotes).length,979);assert.equal(Object.keys(prior.unitLessons).length,232);
const lines=new Map(),units=new Map();
for(const [b,e] of Object.entries(manifest.entries)){
 const bytes=fs.readFileSync(path.join(previous,e.path));assert.equal(sha(bytes),e.sha256);const pack=JSON.parse(bytes);
 assert.equal(pack.humanCollationApproved,false);assert.equal(pack.rightsCleared,false);
 for(const u of pack.units){units.set(b+'|'+u.id,u);for(const l of u.lines){assert.equal(sha(l.text),l.sha256);lines.set(b+'|'+l.id,l);}}
}
assert.equal(lines.size,1361);assert.equal(units.size,327);
const drafts=json(path.join(root,'tools/nitnem/jaap-chhands106-120-drafts.json'));
assert.deepEqual(drafts.map(d=>d.n),Array.from({length:15},(_,i)=>i+106));
const normal=t=>t.replace(/॥[੦-੯]+॥$/u,'॥');const known=new Map();
for(const [key,note] of Object.entries(prior.closeTextNotes))if(key.startsWith('jaap|')){const text=normal(lines.get(key).text);if(!known.has(text))known.set(text,{key,note,prior:true});}
const reuse=[];function text(s,min=8){assert.equal(typeof s,'string');assert.ok(s.trim().length>min);assert.ok(!/[\uFFFD\uE000-\uF8FF]/u.test(s));}
for(const d of drafts){
 const id='jaap'+String(d.n).padStart(3,'0'),unit=units.get('jaap|'+id);assert.ok(unit);assert.equal(unit.lines.length,4);assert.equal(unit.metricalHeadings.length,0);assert.equal(d.rows.length,4);
 for(let i=0;i<4;i++){
  const l=unit.lines[i],key='jaap|'+l.id,r=d.rows[i];assert.ok(!l.held&&!course.closeTextNotes[key]);for(const f of ['en','pa','care'])text(r[f]);assert.match(r.pa,/\p{Script=Gurmukhi}/u);
  const match=known.get(normal(l.text));let en=r.en,pa=r.pa;
  if(match){en=match.note.simpleEn;pa=match.note.simplePa;reuse.push({from:match.key,to:key,origin:match.prior?'PRIOR_V15':'EARLIER_IN_V16',fields:['simpleEn','simplePa']});}
  const note={lineId:l.id,sourceSha256:l.sha256,status:'DRAFT_AI_UNREVIEWED',kind:'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION',simpleEn:en,simplePa:pa,interpretiveCaution:r.care};course.closeTextNotes[key]=note;
  if(!match)known.set(normal(l.text),{key,note,prior:false});
 }
 const s=d.study;for(const f of ['focus','closeReading','care','reflection','teachBack'])text(s[f],f==='closeReading'?400:15);text(d.en,35);text(d.pa,35);assert.match(d.pa,/\p{Script=Gurmukhi}/u);
 assert.ok(s.words.length>=2);for(const [word,gloss] of s.words){assert.ok(unit.lines.some(l=>l.text.includes(word)),id+' vocabulary '+word);text(gloss,1);}
 const key='jaap|'+id;assert.ok(!course.unitLessons[key]);course.unitLessons[key]={unitId:id,sourceAnchor:{id:unit.lines[0].id,sha256:unit.lines[0].sha256},status:'DRAFT_AI_UNREVIEWED',type:'ORIGINAL_EDUCATIONAL_PARAPHRASE',simple:{en:d.en,pa:d.pa},study:{focus:s.focus,closeReading:s.closeReading,words:s.words.map(([gurmukhi,workingGloss])=>({gurmukhi,workingGloss,status:'WORKING_GLOSS_NOT_APPROVED'})),interpretationCare:s.care,reflection:s.reflection,teachBack:s.teachBack}};
}
for(const [k,v] of Object.entries(prior.closeTextNotes))assert.deepEqual(course.closeTextNotes[k],v);
for(const [k,v] of Object.entries(prior.unitLessons))assert.deepEqual(course.unitLessons[k],v);
assert.equal(reuse.length,5);assert.ok(reuse.every(x=>x.origin==='EARLIER_IN_V16'));course.candidateV16Reuse=reuse;
const research=json(path.join(root,'tools/nitnem/jaap-chhands106-120-research.json')),keys=new Set(course.meta.references.map(r=>r.key));
for(const r of research.references){assert.ok(!keys.has(r.key));keys.add(r.key);assert.equal(new URL(r.url).protocol,'https:');course.meta.references.push(r);course.banis.jaap.sourceKeys.push(r.key);}
for(const c of research.sourceChecks){assert.equal(c.humanReviewed,false);for(const k of c.referenceKeys)assert.ok(keys.has(k));for(const id of c.unitIds)assert.ok(drafts.some(d=>'jaap'+d.n===id));}
course.sourceChecks.push(...research.sourceChecks);
course.meta={...course.meta,revision:'JAAP_CHHANDS_106_120_V16_CANDIDATE',previousVersion:'course.v15.json',previousVersionSHA256:priorHash};
course.coverage.closeTextOccurrenceNotes=Object.keys(course.closeTextNotes).length;course.coverage.writtenUnitLessons=Object.keys(course.unitLessons).length;
course.coverage.byBani.jaap.firstLineNotes=Object.keys(course.closeTextNotes).filter(k=>k.startsWith('jaap|')).length;course.coverage.byBani.jaap.draftLessons=Object.keys(course.unitLessons).filter(k=>k.startsWith('jaap|')).length;
assert.equal(course.coverage.closeTextOccurrenceNotes,1039);assert.equal(course.coverage.writtenUnitLessons,247);assert.equal(course.coverage.byBani.jaap.firstLineNotes,466);assert.equal(course.coverage.byBani.jaap.draftLessons,120);
course.coverage.accounting={basis:'COVERED_SOURCE_OCCURRENCES_NOT_UNIQUE_NEW_TRANSLATIONS',previousSourceRecords:979,additionalSourceRecords:60,newJaapLineDrafts:55,exactSourceReusedLineDrafts:5,priorVersionMainReuses:0,withinBatchMainReuses:5,previousStudyLessons:232,additionalStudyLessons:15,newJaapStudyDrafts:15,exactSourceReusedStudyDrafts:0};
const bytes=Buffer.from(JSON.stringify(course,null,2)+'\n'),oldBuild=json(path.join(out,'previous-v15/evidence/build.json')),files=new Map();
for(const [name,digest] of Object.entries(oldBuild.assetHashes)){const b=fs.readFileSync(path.join(previous,name));assert.equal(sha(b),digest);files.set(name,b);}
let reader=files.get('reader.js').toString();assert.equal(reader.split("const EXPECTED_LEARNING='"+priorHash+"';").length,2);assert.equal(reader.split("jsonBytes('learning/course.v15.json',EXPECTED_LEARNING)").length,2);
reader=reader.replace("const EXPECTED_LEARNING='"+priorHash+"';","const EXPECTED_LEARNING='"+sha(bytes)+"';").replace("jsonBytes('learning/course.v15.json',EXPECTED_LEARNING)","jsonBytes('learning/course.v16.json',EXPECTED_LEARNING)");
assert.equal(reader.split("document.querySelectorAll('button[data-mode]')").length,3);files.set('reader.js',Buffer.from(reader));files.set('learning/course.v16.json',bytes);
const expected=Object.fromEntries([...files].filter(([n])=>n!=='sw.js').map(([n,b])=>['./'+n,sha(b)]));assert.equal(Object.keys(expected).length,46);
let worker=files.get('sw.js').toString();assert.equal(worker.split('glp-nitnem-learning-v15-review:').length,2);worker=worker.replace('glp-nitnem-learning-v15-review:','glp-nitnem-learning-v16-review:').replace(/^const VERSION=.*;$/m,'const VERSION='+JSON.stringify('glp-private-nitnem-qa-'+sha(JSON.stringify(expected)).slice(0,18))+';').replace(/^const EXPECTED=.*;$/m,'const EXPECTED='+JSON.stringify(expected)+';');files.set('sw.js',Buffer.from(worker));assert.equal(files.size,47);
fs.mkdirSync(path.join(out,'site'));fs.mkdirSync(path.join(out,'evidence'));for(const [name,b] of files){const f=path.join(out,'site',name);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,b,{flag:'wx'});}
const report={status:'BUILT_NONDEPLOYING_CANDIDATE',courseSHA256:sha(bytes),previousCourseSHA256:priorHash,sourceRecords:1039,studyLessons:247,jaapRecords:466,jaapStudies:120,additionalCoveredRecords:60,originalNewMainExplanations:55,withinBatchMainExplanationReuses:5,previousNotesPreserved:979,previousStudiesPreserved:232,assets:47,cachedAssets:46,assetHashes:Object.fromEntries([...files].map(([n,b])=>[n,sha(b)])),humanReviewed:0,independentModelReview:false,liveDeployment:false,heldAnand24:true,publicMainChanged:false};
fs.writeFileSync(path.join(out,'evidence/build.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,courseSHA256:report.courseSHA256,records:1039,studies:247,reuse,assets:47},null,2));
