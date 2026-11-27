import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root));
const json=p=>JSON.parse(read(p)),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const pack=json('salok-mahalla9/data/salok-mahalla9.json');
const manifest=json('salok-mahalla9/data/library.json'),course=json('salok-mahalla9/learning/course.complete.json');
const original=[...pack.preface,...pack.units.flatMap(u=>[...u.metricalHeadings,...u.lines])];
const checks=[];async function test(name,fn){await fn();checks.push({name,status:'PASS'});}
await test('The selected 117-occurrence source stays byte-locked separately from teaching',()=>{
 assert.equal(sha(read('salok-mahalla9/data/salok-mahalla9.json')),'f72690bb730b24e6631fbbabf574798e5451837987d227a807a3bcf49a366e75');
 assert.equal(sha(original.map(l=>l.text).join('\n')),'16649b80d412b71d628eab27e372208bb74a5c9289702a0f581967ce91604e28');
 assert.equal(manifest.entries['salok-mahalla9'].sha256,sha(read('salok-mahalla9/data/salok-mahalla9.json')));
});
await test('All 57 Saloks have two verses, lasting identities, and consecutive original counters',()=>{
 assert.equal(pack.units.length,57);assert.equal(original.length,117);
 assert.equal(new Set(original.map(l=>l.id)).size,117);
 for(const [i,u]of pack.units.entries()){
  const id='sggs.salok-mahalla9.salok'+String(i+1).padStart(3,'0');
  assert.equal(u.id,id);assert.equal(u.ordinal,i+1);assert.equal(u.lines.length,2);
  assert.deepEqual(u.lines.map(l=>l.id),[id+'.line01',id+'.line02']);
  const number=String(i+1).replace(/[0-9]/g,d=>'੦੧੨੩੪੫੬੭੮੯'[Number(d)]);
  assert.ok(u.lines[1].text.endsWith(i===56?'॥੫੭॥੧॥':'॥'+number+'॥'),id);
  assert.equal(u.sourceDigest,sha([...u.metricalHeadings,...u.lines].map(l=>l.id+'\t'+l.sha256).join('\n')));
 }
 for(const l of original){assert.equal(l.sha256,sha(l.text));assert.equal(l.family,'sggs');assert.equal(l.held,false);}
});
await test('Invocation, collection heading, Dohra, and next-composition boundary keep their roles',()=>{
 assert.deepEqual(pack.preface.map(l=>[l.kind,l.text]),[['invocation','ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥'],['heading','ਸਲੋਕ ਮਹਲਾ ੯ ॥']]);
 assert.equal(pack.units.flatMap(u=>u.metricalHeadings).length,1);
 assert.equal(pack.units[52].metricalHeadings[0].text,'ਦੋਹਰਾ ॥');
 assert.equal(pack.units[0].lines[0].text,'ਗੁਨ ਗੋਬਿੰਦ ਗਾਇਓ ਨਹੀ ਜਨਮੁ ਅਕਾਰਥ ਕੀਨੁ ॥');
 assert.equal(pack.units[56].lines[1].text,'ਜਿਹ ਸਿਮਰਤ ਸੰਕਟ ਮਿਟੈ ਦਰਸੁ ਤੁਹਾਰੋ ਹੋਇ ॥੫੭॥੧॥');
 assert.equal(pack.sourceAudit.boundaries.following.text,'ਮੁੰਦਾਵਣੀ ਮਹਲਾ ੫ ॥');
 assert.ok(!original.some(l=>l.text.includes('ਮੁੰਦਾਵਣੀ')));
});
await test('Ang counts and the Salok 29 crossing are exact',()=>{
 const counts={};for(const l of original)counts[l.location.ang]=(counts[l.location.ang]||0)+1;
 assert.deepEqual(counts,{1426:20,1427:39,1428:37,1429:21});
 assert.deepEqual(pack.units[28].lines.map(l=>l.location.ang),[1427,1428]);
 assert.equal(pack.units[53].lines[1].text,'ਨਾਨਕ ਸਭੁ ਕਿਛੁ ਤੁਮਰੈ ਹਾਥ ਮੈ ਤੁਮ ਹੀ ਹੋਤ ਸਹਾਇ ॥੫੪॥');
});
await test('Every line meaning and full passage study bind to the exact selected scripture',()=>{
 assert.equal(Object.keys(course.closeTextNotes).length,114);assert.equal(Object.keys(course.unitLessons).length,57);
 for(const u of pack.units){
  const lesson=course.unitLessons['salok-mahalla9|'+u.id];assert.equal(lesson.sourcePassageSha256,u.sourceDigest);
  assert.deepEqual(lesson.sourceAnchor,{id:u.lines[0].id,sha256:u.lines[0].sha256});
  assert.equal(lesson.status,'DRAFT_AI_UNREVIEWED');
  for(const l of u.lines){const n=course.closeTextNotes['salok-mahalla9|'+l.id];assert.equal(n.lineId,l.id);assert.equal(n.sourceSha256,l.sha256);assert.equal(n.status,'DRAFT_AI_UNREVIEWED');}
 }
});
await test('Both languages have distinct line meanings, summaries, study, vocabulary, and reflection drafts',()=>{
 const en=s=>typeof s==='string'&&s.trim().length>12&&!/^(pending|tbd|todo)$/i.test(s.trim());
 const pa=s=>en(s)&&/[\u0A00-\u0A7F]/u.test(s)&&!s.includes('\uFFFD');
 for(const n of Object.values(course.closeTextNotes)){assert.ok(en(n.simpleEn));assert.ok(pa(n.simplePa));assert.ok(en(n.interpretiveCaution));assert.ok(pa(n.interpretiveCautionPa));}
 for(const u of pack.units){const l=course.unitLessons['salok-mahalla9|'+u.id];assert.ok(en(l.simple.en));assert.ok(pa(l.simple.pa));
  for(const field of ['focus','closeReading','interpretationCare','reflection','teachBack']){assert.ok(en(l.study[field]),u.id+' '+field);assert.ok(pa(l.study[field+'Pa']),u.id+' '+field+'Pa');}
  assert.ok(l.study.closeReading.split(/\s+/).length>=60,u.id+' English study');assert.ok(l.study.closeReadingPa.split(/\s+/).length>=40,u.id+' Punjabi study');
  assert.ok(l.study.words.length>=1);for(const w of l.study.words){assert.ok(u.lines.some(v=>v.text.includes(w.gurmukhi)),u.id+' exact word');assert.ok(typeof w.workingGloss==='string'&&w.workingGloss.trim());assert.ok(typeof w.workingGlossPa==='string'&&/[\u0A00-\u0A7F]/u.test(w.workingGlossPa));}
 }
 assert.equal(new Set(Object.values(course.unitLessons).map(l=>l.study.closeReading)).size,57);
});
await test('Source references resolve and educational labels do not claim qualified approval',()=>{
 const refs=new Map(course.meta.references.map(r=>[r.key,r]));assert.equal(refs.size,course.meta.references.length);
 for(const u of pack.units)for(const key of course.unitLessons['salok-mahalla9|'+u.id].sourceKeys){
  assert.ok(refs.has(key));const ref=refs.get(key);assert.equal(new URL(ref.url).protocol,'https:');
  for(const match of ref.title.matchAll(/\bSalok\s*(\d+)\b/g))assert.equal(Number(match[1]),u.ordinal,'Reference title points at another Salok');
 }
 assert.equal(course.meta.publicationAllowed,false);assert.equal(course.meta.reviewer,null);
 assert.equal(course.coverage.reviewedUnitLessons,0);assert.equal(course.coverage.reviewedSourceMeaningLines,0);
 assert.equal(pack.humanCollationApproved,false);assert.equal(pack.translationApproved,false);
 assert.equal(pack.sourceAudit.modernTranslationsImported,false);assert.equal(pack.sourceAudit.printedEditionReviewed,false);
 assert.equal(pack.releaseChannel,'DEVELOPMENT_REVIEW');assert.equal(manifest.audioSynced,false);
});
await test('The independent comparison records all 117 occurrences without promoting its authority',()=>{
 const audit=json('research/salok-mahalla9/source-audit-independent.json');
 assert.equal(audit.actualScope.selectedOccurrences,117);assert.equal(audit.actualScope.verses,114);
 assert.match(audit.reviewKind,/AI-assisted/);assert.match(audit.reviewer,/not a qualified human/);
 assert.equal(pack.sourceAudit.secondaryExactMatches,117);assert.equal(pack.sourceAudit.secondaryMismatches,0);
});
await test('The six previous Nitnem source packs and complete teaching course remain unchanged',()=>{
 assert.equal(sha(read('nitnem/data/library.json')),'9cf422955cba07ee9a8f49fbcedc4969b84232d497658fcaafe37a4aa63f4d75');
 assert.equal(sha(read('nitnem/learning/course.complete.json')),'5f9f877b37e2e0dba58076cdf6bfb5ec9201b2b5f02619d7b52821ec12d0e10c');
 for(const e of Object.values(json('nitnem/data/library.json').entries))assert.equal(sha(read('nitnem/'+e.path)),e.sha256);
});
await test('Both collection pins, full-course binding, script SRI, and offline assets match the actual files',()=>{
 const reader=read('nitnem/reader.js').toString(),mh=sha(read('salok-mahalla9/data/library.json')),ch=sha(read('salok-mahalla9/learning/course.complete.json'));
 assert.ok(reader.includes("const SALOK_SOURCE_MANIFEST='"+mh+"'"));assert.ok(reader.includes("const SALOK_TEACHING='"+ch+"'"));
 assert.equal(course.meta.boundManifestSHA256,mh);
 const html=read('salok-mahalla9/index.html').toString();assert.match(html,/data-reader-collection="salok-mahalla9"/);
 for(const match of html.matchAll(/<script src="([^"]+)" integrity="sha256-([^"]+)"/g)){
  const file=new URL(match[1],new URL('salok-mahalla9/index.html',root));assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('base64'),match[2]);
 }
 assert.ok([...html.matchAll(/<script src=/g)].length>=6);assert.equal([...html.matchAll(/<script src=/g)].length,[...html.matchAll(/integrity="sha256-/g)].length);
 const worker=read('sw.js').toString(),cache=JSON.parse(worker.match(/const EXPECTED=(\{[^\n]+\});/)[1]);
 for(const p of ['./salok-mahalla9/','./salok-mahalla9/index.html','./salok-mahalla9/data/library.json','./salok-mahalla9/data/salok-mahalla9.json','./salok-mahalla9/learning/course.complete.json'])assert.ok(cache[p],p);
 for(const [p,h]of Object.entries(cache))assert.equal(sha(read(p.endsWith('/')?p+'index.html':p)),h,p);
});
await test('The reused saved-learning manager keeps Salok learning separate and rejects another Bani backup',async()=>{
 const context={window:{},module:{exports:{}}};vm.runInNewContext(read('nitnem/local-learning.js').toString(),context);
 const api=context.module.exports,store=new Map(),locks={request:async(key,fn)=>fn()};
 const manager=api.create(pack,{storage:{getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value)},locks});
 await manager.save(pack.units[28].lines[1].id,{notes:{[pack.units[28].lines[1].id]:'Synthetic reflection'}});
 const backup=JSON.parse(manager.exportText());assert.equal(backup.compositionId,'salok-mahalla9');
 assert.equal(backup.state.notes[pack.units[28].lines[1].id],'Synthetic reflection');assert.equal(store.size,1);
 assert.throws(()=>manager.parse(JSON.stringify({...backup,compositionId:'sohila'})),/this bani/);
 assert.throws(()=>manager.parse(JSON.stringify({...backup,state:{...backup.state,notes:{unknown:'Keep me'}}})),/preserved/);
});
const report={status:'PASS',checks,numberedSaloks:57,originalVerses:114,allSourceOccurrences:117,bilingualMeaningDrafts:114,bilingualStudyDrafts:57,qualifiedHumanReviewed:0,
 inputSha256:Object.fromEntries(['salok-mahalla9/data/library.json','salok-mahalla9/data/salok-mahalla9.json','salok-mahalla9/learning/course.complete.json','nitnem/reader.js','sw.js'].map(p=>[p,sha(read(p))])),
 scope:'Node source, binding, preservation and local-learning checks; not physical-device, visual, or scholarly approval'};
fs.mkdirSync(new URL('evidence/salok-mahalla9/',root),{recursive:true});fs.writeFileSync(new URL('evidence/salok-mahalla9/content.json',root),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',checks:checks.length,numberedSaloks:57,sourceOccurrences:117,meaningDrafts:114,studyDrafts:57}));
