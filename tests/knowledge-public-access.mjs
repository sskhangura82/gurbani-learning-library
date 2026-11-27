// Public record admission checks. Synthetic mutations only; no private content.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {loadKnowledge,sha256,PUBLIC_STUDY_ADMISSIONS} from '../knowledge/registry.mjs';
import {buildIndex,search} from '../knowledge/core.mjs';
import {JOURNEY_BINDING,journeyAvailable} from '../knowledge/learning.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const base='a123b39e61c5fba94acc38ea77ab7c81e664f61d';
const before=path=>execFileSync('git',['show',base+':'+path],{cwd:root,maxBuffer:8*1024*1024});
const source=await fs.readFile(new URL('../knowledge/scripture.json',import.meta.url));
const bytes=await fs.readFile(new URL('../knowledge/pilot.json',import.meta.url));
const old=JSON.parse(before('knowledge/pilot.json')),current=JSON.parse(bytes);
const index=buildIndex(await loadKnowledge(source,bytes,await sha256(bytes)));
const resealed=async change=>{const pack=structuredClone(current);change(pack);const raw=Buffer.from(JSON.stringify(pack));return buildIndex(await loadKnowledge(source,raw,await sha256(raw)));};
const study=current.nodes.find(n=>n.id==='study.intellectual-humility');
const previousReligion=old.nodes.find(n=>n.id==='study.buddhist-conceit');

test('public psychology stays searchable with its exact reference, wording and distinct comparison',()=>{
 const previous=old.nodes.find(n=>n.id===study.id),{access,...withoutAccess}=study;
 assert.deepEqual(withoutAccess,previous);
 assert.deepEqual(access,{audience:'PUBLIC',contentClass:'PSYCHOLOGY'});
 assert.ok(search(index,'psychology').some(hit=>hit.id===study.id));
 assert.ok(search(index,'intellectual humility').some(hit=>hit.id===study.id));
 assert.deepEqual(current.edges.find(e=>e.id==='edge.23'),old.edges.find(e=>e.id==='edge.23'));
 assert.deepEqual(Object.keys(PUBLIC_STUDY_ADMISSIONS),[study.id]);
 assert.equal(current.coverage.psychologyStudies,1);
 assert.equal(current.coverage.comparativeReligionStudies,0);
});

test('the current public projection contains no religious study, edge or religious study result',()=>{
 assert.equal(index.nodes.has(previousReligion.id),false);
 assert.equal(current.edges.some(e=>e.id==='edge.24'||e.type==='philosophical_comparison'),false);
 for(const query of ['buddhism','buddhist','Tibetan','Bible','Saṃyutta Nikāya'])assert.deepEqual(search(index,query),[],query);
 assert.equal(current.nodes.filter(n=>n.type==='study').length,1);
 assert.deepEqual(current.accessPolicy,{schema:'glp.knowledge.public-access.v1',audience:'PUBLIC',psychology:'PUBLIC',comparativeReligion:'PRIVATE_ONLY'});
});

test('humility changes only its declared revision and narrow English/Punjabi comparison sentence',()=>{
 const previous=old.nodes.find(n=>n.id==='lesson.humility.r1');
 const next=current.nodes.find(n=>n.id===previous.id),{access,...withoutAccess}=next;
 const expected=structuredClone(previous);expected.revision=2;
 expected.deep.en=expected.deep.en.replace('intellectual humility, and the Buddhist examination of rank-based conceit, while','intellectual humility while');
 expected.deep.pa=expected.deep.pa.replace('ਦੂਜੇ ਦਰਸ਼ਨਾਂ ਨਾਲ ਤੁਲਨਾ ਕਰਦੇ ਸਮੇਂ','ਮਨੋਵਿਗਿਆਨਕ ਵਿਚਾਰਾਂ ਨਾਲ ਤੁਲਨਾ ਕਰਦੇ ਸਮੇਂ');
 assert.deepEqual(withoutAccess,expected);
 assert.equal(access.contentClass,'GURBANI_LEARNING');
 assert.deepEqual(current.nodes.find(n=>n.type==='course').orderedLessonIds,old.nodes.find(n=>n.type==='course').orderedLessonIds);
});

test('all original Gurbani and existing Haumai saved-learning bindings remain exact',async()=>{
 for(const path of ['knowledge/scripture.json','knowledge/source-lock.mjs','knowledge/learning.mjs','knowledge/journey.mjs','knowledge/json.mjs'])
  assert.deepEqual(await fs.readFile(new URL('../'+path,import.meta.url)),before(path),path);
 assert.deepEqual(index.graph.occurrences,JSON.parse(source).occurrences);
 assert.ok(journeyAvailable(index));
 assert.equal(JOURNEY_BINDING.lessonRevision,1);
 assert.equal(JOURNEY_BINDING.lessonId,'lesson.haumai.r1');
 const {access,...haumai}=current.nodes.find(n=>n.id===JOURNEY_BINDING.lessonId);
 assert.deepEqual(haumai,old.nodes.find(n=>n.id===JOURNEY_BINDING.lessonId));
 for(const n of current.nodes.filter(n=>n.type==='word')){const {access,...word}=n;assert.deepEqual(word,old.nodes.find(p=>p.id===n.id));}
});

test('renewing the editable pack pin cannot restore the removed religious study',async()=>{
 for(const access of [{audience:'PRIVATE',contentClass:'COMPARATIVE_RELIGION'},{audience:'PUBLIC',contentClass:'COMPARATIVE_RELIGION'}]){
  await assert.rejects(()=>resealed(pack=>pack.nodes.push({...previousReligion,access})),/PUBLIC_ACCESS_LABEL/);
 }
 await assert.rejects(()=>resealed(pack=>pack.nodes.push({...previousReligion,discipline:'psychology',access:{audience:'PUBLIC',contentClass:'PSYCHOLOGY'}})),/PUBLIC_STUDY_NOT_ADMITTED/);
});

test('an existing public study identity cannot conceal a relabelled religious study after resealing',async()=>{
 await assert.rejects(()=>resealed(pack=>{
  const target=pack.nodes.findIndex(n=>n.id===study.id);
  pack.nodes[target]={...previousReligion,id:study.id,discipline:'psychology',reference:study.reference,access:{...study.access}};
 }),/PUBLIC_STUDY_METADATA/);
 await assert.rejects(()=>resealed(pack=>{pack.nodes.find(n=>n.id===study.id).reference=previousReligion.reference;}),/PUBLIC_STUDY_METADATA/);
 await assert.rejects(()=>resealed(pack=>{pack.nodes.find(n=>n.id===study.id).discipline='comparative religion';}),/PUBLIC_STUDY_NOT_ADMITTED/);
});

test('even a resolving source-bound philosophical comparison cannot enter the public graph',async()=>{
 await assert.rejects(()=>resealed(pack=>{pack.edges.push({...pack.edges.find(e=>e.id==='edge.23'),id:'synthetic.religious-comparison',type:'philosophical_comparison'});}),/PUBLIC_COMPARISON_RESTRICTED/);
});

test('missing, private, unknown or self-expanded public admission labels refuse',async()=>{
 for(const change of [
  p=>{delete p.accessPolicy;},
  p=>{p.accessPolicy.comparativeReligion='PUBLIC';},
  p=>{p.accessPolicy.admittedStudies=['study.buddhist-conceit'];},
  p=>{delete p.nodes[0].access;},
  p=>{p.nodes[0].access.audience='PRIVATE';},
  p=>{p.nodes[0].access.contentClass='UNKNOWN';},
  p=>{p.nodes[0].access.approved=true;},
  p=>{p.coverage.comparativeReligionStudies=1;}
 ])await assert.rejects(()=>resealed(change),/PUBLIC_(?:ACCESS|STUDY)/);
 await assert.rejects(()=>resealed(p=>{p.schema='glp.knowledge.editorial.v2';}),/Invalid editorial pack/);
});

test('ordinary non-study editorial revision remains possible without pretending to classify prose meaning',async()=>{
 const result=await resealed(pack=>{pack.nodes.find(n=>n.id==='concept.humility').title='Humility and truthful reflection';});
 assert.equal(result.nodes.get('concept.humility').title,'Humility and truthful reflection');
 assert.deepEqual(result.graph.occurrences,index.graph.occurrences);
});
