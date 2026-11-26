// Focused semantic-custody counterexamples against the actual reader loaders.
// These fixtures deliberately renew ALL surrounding file/content digests. They
// test semantic guards after a mistaken rebuild, not a network byte-pin bypass.
// The real source pack is read-only. Teaching prose below is synthetic, not Gurbani.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash,webcrypto} from 'node:crypto';
import test from 'node:test';

const BANI='salok-mahalla9';
const sourceURL=new URL('../salok-mahalla9/data/salok-mahalla9.json',import.meta.url);
const manifestURL=new URL('../salok-mahalla9/data/library.json',import.meta.url);
const readerURL=new URL('../nitnem/reader.js',import.meta.url);
const originalSourceBytes=fs.readFileSync(sourceURL),originalManifestBytes=fs.readFileSync(manifestURL);
const source=JSON.parse(originalSourceBytes),manifest=JSON.parse(originalManifestBytes);
const reader=fs.readFileSync(readerURL,'utf8');
const start=reader.indexOf('async function digest(data)'),end=reader.indexOf('function syncLearning');
assert.ok(start>=0&&end>start,'Expected the actual digest/library/source/teaching loader block');
const loaderCode=reader.slice(start,end)+'\n;({library,jsonBytes,verifyPack,teachingCourse})';
const sha=value=>createHash('sha256').update(value).digest('hex');
const serialise=value=>JSON.stringify(value,null,2)+'\n';
const key=id=>BANI+'|'+id;
const clone=value=>structuredClone(value);
const headingRecords=pack=>[...pack.preface.map(heading=>({heading,unit:pack.units[0]})),
 ...pack.units.flatMap(unit=>unit.metricalHeadings.map(heading=>({heading,unit})))];

function syntheticTeaching(pack){
 const course={meta:{schema:'GLP-NITNEM-TEACHING-DRAFT-V2',releaseId:pack.releaseId,
  editorialStatus:'DRAFT_AI_UNREVIEWED',baseSourceCommit:pack.sourceRepositoryCommit,
  boundManifestSHA256:null,publicationAllowed:false,reviewer:null},
  coverage:{reviewedUnitLessons:0,reviewedSourceMeaningLines:0},banis:{[BANI]:{}},
  unitLessons:{},closeTextNotes:{},headingNotes:{}};
 for(const unit of pack.units){
  course.unitLessons[key(unit.id)]={unitId:unit.id,status:'DRAFT_AI_UNREVIEWED',
   sourceAnchor:{id:unit.lines[0].id,sha256:unit.lines[0].sha256},sourcePassageSha256:unit.sourceDigest,
   simple:{en:'SYNTHETIC study for '+unit.id,pa:'SYNTHETIC Punjabi fixture for '+unit.id},study:{}};
  for(const line of unit.lines)course.closeTextNotes[key(line.id)]={lineId:line.id,
   sourceSha256:line.sha256,status:'DRAFT_AI_UNREVIEWED',simpleEn:'SYNTHETIC meaning for '+line.id,simplePa:'SYNTHETIC Punjabi fixture for '+line.id};
 }
 for(const {heading,unit}of headingRecords(pack))course.headingNotes[key(heading.id)]={
  unitId:unit.id,headingSha256:heading.sha256,status:'DRAFT_AI_UNREVIEWED',
  simpleEn:'SYNTHETIC heading context for '+heading.id,simplePa:'SYNTHETIC Punjabi fixture for '+heading.id};
 return course;
}

function fixture({changeSource,changeTeaching}={}){
 const pack=clone(source),library=clone(manifest);
 if(changeSource)changeSource(pack);
 // A careless content rebuild could renew all local hashes. Deliberately do
 // that here so the requested counterexamples exercise independent semantics.
 for(const heading of pack.preface)heading.sha256=sha(heading.text);
 for(const unit of pack.units){
  for(const item of [...unit.metricalHeadings,...unit.lines])item.sha256=sha(item.text);
  unit.sourceDigest=sha([...unit.metricalHeadings,...unit.lines].map(item=>item.id+'\t'+item.sha256).join('\n'));
 }
 const packBytes=Buffer.from(serialise(pack));library.entries[BANI].sha256=sha(packBytes);
 const libraryBytes=Buffer.from(serialise(library)),libraryHash=sha(libraryBytes);
 const course=syntheticTeaching(pack);course.meta.boundManifestSHA256=libraryHash;
 if(changeTeaching)changeTeaching(course,pack);
 const teachingBytes=Buffer.from(serialise(course)),teachingHash=sha(teachingBytes);
 const urls=new Map([['data/library.json',libraryBytes],[library.entries[BANI].path,packBytes],['learning/course.complete.json',teachingBytes]]);
 const requests=[];
 const context={TextEncoder,TextDecoder,codec:new TextDecoder('utf-8',{fatal:true}),crypto:webcrypto,Uint8Array,
  state:{library:null},coursePromise:null,salokCollection:true,kabirCollection:false,collectionNames:[BANI],
  collectionManifest:libraryHash,collectionTeaching:teachingHash,
  collectionCommit:pack.sourceRepositoryCommit,collectionRelease:pack.releaseId,
  fetch:async url=>{requests.push(url);const bytes=urls.get(url);assert.ok(bytes,'Unexpected loader URL '+url);
   return {ok:true,status:200,arrayBuffer:async()=>Uint8Array.from(bytes).buffer};}};
 const api=vm.runInNewContext(loaderCode,context,{filename:'nitnem/reader.js actual loader functions',timeout:5000});
 async function loadSource(){const lib=await api.library(),entry=lib.entries[BANI];return api.verifyPack(await api.jsonBytes(entry.path,entry.sha256),entry,BANI);}
 async function loadTeaching(){const verified=await loadSource();return api.teachingCourse(verified);}
 return {pack,course,requests,packHash:sha(packBytes),libraryHash,teachingHash,loadSource,loadTeaching};
}

test('Complete real source and faithfully source-bound synthetic teaching pass the actual loaders',async()=>{
 const f=fixture(),course=await f.loadTeaching();assert.equal(Object.keys(course.unitLessons).length,57);
 assert.equal(Object.keys(course.closeTextNotes).length,114);assert.equal(Object.keys(course.headingNotes).length,3);
 assert.deepEqual(f.requests,['data/library.json','data/salok-mahalla9.json','learning/course.complete.json']);
 assert.equal(sha(fs.readFileSync(sourceURL)),sha(originalSourceBytes));assert.equal(sha(fs.readFileSync(manifestURL)),sha(originalManifestBytes));
});

test('An editorial-only revision can get its own teaching seal without changing the source seal',async()=>{
 const original=fixture(),revision=fixture({changeTeaching(course,pack){course.unitLessons[key(pack.units[0].id)].simple.en+=' — SYNTHETIC revised draft';}});
 assert.equal(revision.packHash,original.packHash);assert.equal(revision.libraryHash,original.libraryHash);assert.notEqual(revision.teachingHash,original.teachingHash);
 await revision.loadTeaching();
});

test('Swapped whole-lesson values are rejected after the teaching file is resealed',async()=>{
 const f=fixture({changeTeaching(course,pack){const[a,b]=pack.units.slice(0,2).map(unit=>key(unit.id));[course.unitLessons[a],course.unitLessons[b]]=[course.unitLessons[b],course.unitLessons[a]];}});
 await assert.rejects(f.loadTeaching(),/Educational unit is not bound/);
 assert.equal(f.requests.at(-1),'learning/course.complete.json','The freshly sealed teaching bytes must reach semantic validation');
});

test('Swapped line-note values cannot attach a correct note to the wrong dictionary key',async()=>{
 const f=fixture({changeTeaching(course,pack){const[a,b]=pack.units[0].lines.map(line=>key(line.id));[course.closeTextNotes[a],course.closeTextNotes[b]]=[course.closeTextNotes[b],course.closeTextNotes[a]];}});
 await assert.rejects(f.loadTeaching(),/Simple lesson is not bound/);
});

test('Dohra moved after Salok53 via display metadata is rejected despite renewed source/manifest seals',async()=>{
 const f=fixture({changeSource(pack){const unit=pack.units[52];unit.sourceDisplayOrder=[...unit.lines.map(line=>({kind:'line',id:line.id})),{kind:'metricalHeading',index:0}];}});
 await assert.rejects(f.loadSource(),/Salok heading order or Ang boundary changed/);
 assert.equal(f.requests.at(-1),'data/salok-mahalla9.json');
});

test('Both forms of collapsing Salok29 onto one Ang are rejected after resealing',async()=>{
 for(const ang of [1427,1428]){
  const f=fixture({changeSource(pack){for(const line of pack.units[28].lines)line.location.ang=ang;}});
  await assert.rejects(f.loadSource(),/Salok heading order or Ang boundary changed/,'Collapsed both Salok29 lines onto '+ang);
 }
});

test('Swapping invocation/title or title/Dohra context values is rejected after resealing',async()=>{
 for(const positions of [[0,1],[1,2]]){
  const f=fixture({changeTeaching(course,pack){const records=headingRecords(pack);const[a,b]=positions.map(index=>key(records[index].heading.id));[course.headingNotes[a],course.headingNotes[b]]=[course.headingNotes[b],course.headingNotes[a]];}});
  await assert.rejects(f.loadTeaching(),/Heading explanation is not bound/);
 }
});

test('A heading context with the right heading hash but the wrong enclosing Salok is rejected',async()=>{
 const f=fixture({changeTeaching(course,pack){course.headingNotes[key(pack.units[52].metricalHeadings[0].id)].unitId=pack.units[51].id;}});
 await assert.rejects(f.loadTeaching(),/Heading explanation is not bound/);
});

test('Promoting any of the three heading contexts to reviewed is rejected after resealing',async()=>{
 for(let index=0;index<3;index++){
  const f=fixture({changeTeaching(course,pack){const heading=headingRecords(pack)[index].heading;course.headingNotes[key(heading.id)].status='QUALIFIED_HUMAN_REVIEWED';}});
  await assert.rejects(f.loadTeaching(),/Heading explanation is not bound/);
 }
});

test('Missing or extra heading context cannot silently alter complete three-heading coverage',async()=>{
 for(const mutation of ['missing','extra']){
  const f=fixture({changeTeaching(course,pack){const first=key(pack.preface[0].id);if(mutation==='missing')delete course.headingNotes[first];else course.headingNotes[BANI+'|invented-heading']=clone(course.headingNotes[first]);}});
  await assert.rejects(f.loadTeaching(),/Salok heading context coverage changed/);
 }
});

test('A first-line binding alone cannot substitute for the complete Salok passage digest',async()=>{
 const f=fixture({changeTeaching(course,pack){const unit=pack.units[28];course.unitLessons[key(unit.id)].sourcePassageSha256=unit.lines[0].sha256;}});
 await assert.rejects(f.loadTeaching(),/Salok lesson does not match the complete passage/);
});

test('Changing a source heading still fails the independent sequence digest when every surrounding hash is renewed',async()=>{
 const f=fixture({changeSource(pack){pack.units[52].metricalHeadings[0].text+=' ਅ';}});
 await assert.rejects(f.loadSource(),/Salok Mahalla 9 source sequence does not match/);
 assert.equal(sha(fs.readFileSync(sourceURL)),sha(originalSourceBytes));assert.equal(sha(fs.readFileSync(manifestURL)),sha(originalManifestBytes));
});
