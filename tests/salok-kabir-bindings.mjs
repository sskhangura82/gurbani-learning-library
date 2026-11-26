// Focused semantic-custody counterexamples against the actual reader loaders.
// These fixtures deliberately renew ALL surrounding file/content digests. They
// test semantic guards after a mistaken rebuild, not a network byte-pin bypass.
// The real source pack is read-only. Teaching prose below is synthetic, not Gurbani.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash,webcrypto} from 'node:crypto';
import test from 'node:test';

const BANI='salok-kabir';
const sourceURL=new URL('../salok-kabir/data/salok-kabir.json',import.meta.url);
const manifestURL=new URL('../salok-kabir/data/library.json',import.meta.url);
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
  state:{library:null},coursePromise:null,salokCollection:false,kabirCollection:true,collectionNames:[BANI],
  collectionManifest:libraryHash,collectionTeaching:teachingHash,
  collectionCommit:pack.sourceRepositoryCommit,collectionRelease:pack.releaseId,
  fetch:async url=>{requests.push(url);const bytes=urls.get(url);assert.ok(bytes,'Unexpected loader URL '+url);
   return {ok:true,status:200,arrayBuffer:async()=>Uint8Array.from(bytes).buffer};}};
 const api=vm.runInNewContext(loaderCode,context,{filename:'nitnem/reader.js actual loader functions',timeout:5000});
 async function loadSource(){const lib=await api.library(),entry=lib.entries[BANI];return api.verifyPack(await api.jsonBytes(entry.path,entry.sha256),entry,BANI);}
 async function loadTeaching(){const verified=await loadSource();return api.teachingCourse(verified);}
 return {pack,course,requests,packHash:sha(packBytes),libraryHash,teachingHash,loadSource,loadTeaching};
}

test('All494 real originals and complete independently sealed synthetic teaching pass',async()=>{
 const f=fixture(),course=await f.loadTeaching();assert.equal(Object.keys(course.unitLessons).length,243);assert.equal(Object.keys(course.closeTextNotes).length,486);assert.equal(Object.keys(course.headingNotes).length,8);
 assert.deepEqual(f.requests,['data/library.json','data/salok-kabir.json','learning/course.complete.json']);
});
test('An editorial-only reseal cannot change the source seal',async()=>{
 const a=fixture(),b=fixture({changeTeaching(c,p){c.unitLessons[key(p.units[0].id)].simple.en+=' SYNTHETIC revision';}});assert.equal(a.packHash,b.packHash);assert.equal(a.libraryHash,b.libraryHash);assert.notEqual(a.teachingHash,b.teachingHash);await b.loadTeaching();
});
test('Every Mahalla heading is protected against relocation, abbreviation substitution and omission after resealing',async()=>{
 for(const index of [208,209,210,213,219,220])for(const action of ['move','substitute','drop']){
  const f=fixture({changeSource(p){const u=p.units[index];if(action==='move')u.sourceDisplayOrder=[...u.lines.map(l=>({kind:'line',id:l.id})),{kind:'metricalHeading',index:0}];else if(action==='drop')u.metricalHeadings=[];else u.metricalHeadings[0].text=u.metricalHeadings[0].text.startsWith('ਮਃ')?'ਮਹਲਾ ੫ ॥':'ਮਃ ੫ ॥';}});
  await assert.rejects(f.loadSource(),/Kabir source/);
 }
});
test('Heading/invocation reversal and re-insertion of the excluded Farid occurrence fail despite renewed seals',async()=>{
 for(const action of ['reverse','farid']){
  const f=fixture({changeSource(p){if(action==='reverse')p.preface.reverse();else p.units[230].lines[1].text='ਬੰਨੑਿ ਉਠਾਈ ਪੋਟਲੀ ਕਿਥੈ ਵੰਞਾ ਘਤਿ ॥੨॥';}});await assert.rejects(f.loadSource(),/Kabir source/);
 }
});
test('The retained nasal Unicode mark cannot be silently replaced by a private-use character',async()=>{
 const f=fixture({changeSource(p){p.units[176].lines[0].text=p.units[176].lines[0].text.replace('ਁ','\uF03D');}});await assert.rejects(f.loadSource(),/Unresolved source character/);
});
test('All ten split digital-Ang units reject collapse onto either Ang after resealing',async()=>{
 for(const index of [9,28,66,103,140,158,176,194,212,230])for(const lineIndex of [0,1]){
  const f=fixture({changeSource(p){const u=p.units[index],ang=u.lines[lineIndex].location.ang;for(const l of u.lines)l.location.ang=ang;}});await assert.rejects(f.loadSource(),/Kabir source structure/);
 }
});
test('Printed extents cannot replace the recorded digital locator or be promoted to full collation',async()=>{
 for(const action of ['replace','promote']){
  const f=fixture({changeSource(p){if(action==='replace')p.units[230].lines[0].location.ang=1377;else p.sourceAudit.completePrintedCollation=true;}});await assert.rejects(f.loadSource(),/Kabir source structure/);
 }
});
test('A Guru heading cannot be inherited by an unheaded Salok or inferred from a name in a verse',async()=>{
 for(const action of ['inherit','namdev','ravidas']){
  const f=fixture({changeSource(p){if(action==='inherit')p.units[211].attribution.explicitMahalla=clone(p.units[210].attribution.explicitMahalla);else{const u=p.units[action==='namdev'?240:241];u.authorId=action;u.attribution.signatureAloneAssignsAuthorship=true;u.attribution.canonicalAuthorId=action;}}});await assert.rejects(f.loadSource(),/Kabir source structure/);
 }
});
test('Source and teaching cannot be promoted to publication or human-reviewed authority by resealing',async()=>{
 for(const action of ['channel','translation','human']){const f=fixture({changeSource(p){if(action==='channel')p.releaseChannel='PRODUCTION';else if(action==='translation')p.translationApproved=true;else p.humanCollationApproved=true;}});await assert.rejects(f.loadSource(),/review gate|review status/);}
 for(const action of ['publish','reviewer','reviewed-count']){const f=fixture({changeTeaching(c){if(action==='publish')c.meta.publicationAllowed=true;else if(action==='reviewer')c.meta.reviewer='invented reviewer';else c.coverage.reviewedUnitLessons=243;}});await assert.rejects(f.loadTeaching(),/draft coverage|draft identity/);}
});
test('Missing or extra studies, meanings and heading contexts fail complete coverage',async()=>{
 for(const name of ['unitLessons','closeTextNotes','headingNotes'])for(const action of ['missing','extra']){
  const f=fixture({changeTeaching(c){const first=Object.keys(c[name])[0];if(action==='missing')delete c[name][first];else c[name][BANI+'|invented']=clone(c[name][first]);}});await assert.rejects(f.loadTeaching(),/Missing passage|Missing meaning|bound|coverage/);
 }
});
test('Swapped map values and first-line-only study bindings cannot misattach meanings',async()=>{
 for(const name of ['unitLessons','closeTextNotes','headingNotes']){
  const f=fixture({changeTeaching(c){const[a,b]=Object.keys(c[name]);[c[name][a],c[name][b]]=[c[name][b],c[name][a]];}});await assert.rejects(f.loadTeaching(),/bound/);
 }
 const f=fixture({changeTeaching(c,p){c.unitLessons[key(p.units[176].id)].sourcePassageSha256=p.units[176].lines[0].sha256;}});await assert.rejects(f.loadTeaching(),/complete passage/);
});
test('A correct heading hash still needs the exact enclosing Salok and draft status',async()=>{
 for(const action of ['enclosing','authority']){const f=fixture({changeTeaching(c,p){const n=c.headingNotes[key(p.units[208].metricalHeadings[0].id)];if(action==='enclosing')n.unitId=p.units[209].id;else n.status='QUALIFIED_HUMAN_REVIEWED';}});await assert.rejects(f.loadTeaching(),/Heading explanation is not bound/);}
 assert.equal(sha(fs.readFileSync(sourceURL)),sha(originalSourceBytes));assert.equal(sha(fs.readFileSync(manifestURL)),sha(originalManifestBytes));
});
