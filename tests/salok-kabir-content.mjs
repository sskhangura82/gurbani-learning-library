// Complete collection integrity, bilingual coverage and preservation contracts.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root)),json=p=>JSON.parse(read(p));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),BANI='salok-kabir';
const pack=json('salok-kabir/data/salok-kabir.json'),manifest=json('salok-kabir/data/library.json'),course=json('salok-kabir/learning/course.complete.json');
const raw=json('research/salok-kabir/source-selected.json'),overlay=json('research/salok-kabir/runtime-selection.json'),audit=json('research/salok-kabir/source-audit.json');
const original=[...pack.preface,...pack.units.flatMap(u=>[...u.metricalHeadings,...u.lines])],checks=[];
async function test(name,fn){await fn();checks.push({name,status:'PASS'});}
await test('The source seal and all494 selected original strings reproduce the frozen explicit selection',()=>{
 assert.equal(sha(read('salok-kabir/data/salok-kabir.json')),'34698bcbbaa8c54416de495011ee38493f549a5c0b92720e684f8c399dcf64f2');
 assert.equal(sha(read('salok-kabir/data/library.json')),'eae1fdfdd3e9fedd7937bf95ec6bbe64f35b8112ece472a8a4b252bdf40d6c8d');
 assert.equal(sha(original.map(l=>l.text).join('\n')),'f8de1c67654bbc6d62e1b6484c41ec31a27f930ea83cff13150a1b5eb4dae415');
 assert.equal(manifest.entries[BANI].sha256,sha(read('salok-kabir/data/salok-kabir.json')));
 const frozen=[...raw.preface,...raw.units.flatMap(u=>[...u.headings,...u.lines])];
 for(const [i,row]of original.entries())assert.equal(row.text,i===0?overlay.headingSelections[0].after:frozen[i].text);
 assert.equal(sha(read('research/salok-kabir/source-selected.json')),'e4649489194a7842a7bfb4bd06d69308a15b8ab79c0dfc455740011717d5af05');
});
await test('All243 two-line Saloks have stable identities and original consecutive counters',()=>{
 assert.equal(pack.units.length,243);assert.equal(original.length,494);assert.equal(new Set(original.map(x=>x.id)).size,494);
 for(const [i,u]of pack.units.entries()){
  const id='sggs.salok-kabir.salok'+String(i+1).padStart(3,'0'),digits=String(i+1).replace(/[0-9]/g,d=>'੦੧੨੩੪੫੬੭੮੯'[+d]);
  assert.equal(u.id,id);assert.equal(u.ordinal,i+1);assert.deepEqual(u.lines.map(l=>l.id),[id+'.line01',id+'.line02']);assert.ok(u.lines[1].text.endsWith('॥'+digits+'॥'));
  assert.equal(u.sourceDigest,sha([...u.metricalHeadings,...u.lines].map(l=>l.id+'\t'+l.sha256).join('\n')));
  for(const l of [...u.metricalHeadings,...u.lines])assert.equal(l.sha256,sha(l.text));
 }
});
await test('The collection heading precedes invocation and all six exact Mahalla headings retain their scope',()=>{
 assert.deepEqual(pack.preface.map(x=>x.text),['ਸਲੋਕ ਭਗਤ ਕਬੀਰ ਜੀਉ ਕੇ','ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥']);
 assert.deepEqual(pack.units.filter(u=>u.metricalHeadings.length).map(u=>[u.ordinal,u.metricalHeadings[0].text]),[[209,'ਮਹਲਾ ੫ ॥'],[210,'ਮਹਲਾ ੫ ॥'],[211,'ਮਹਲਾ ੫ ॥'],[214,'ਮਹਲਾ ੫ ॥'],[220,'ਮਃ ੩ ॥'],[221,'ਮਃ ੫ ॥']]);
 for(const unit of pack.units){assert.equal(unit.authorId,null);assert.equal(unit.attribution.canonicalAuthorId,null);assert.equal(unit.attribution.signatureAloneAssignsAuthorship,false);assert.equal(unit.attribution.qualifiedAttributionReviewed,false);assert.equal(!!unit.attribution.explicitMahalla,unit.metricalHeadings.length===1);}
 assert.deepEqual(pack.units.filter(u=>u.attribution.namedVoices.length).map(u=>[u.ordinal,u.attribution.namedVoices]),[[212,['Namdev','Trilochan']],[213,['Namdev','Trilochan']],[241,['Namdev']],[242,['Ravidas']]]);
});
await test('The Farid foreign row is quarantined outside the243 Saloks and both source boundaries survive',()=>{
 const foreign='f9312b97a0b94ce0412cc998d0289563b75d966001558a156d94f616d5ab01b0';
 assert.equal(original.some(x=>x.sha256===foreign),false);assert.equal(raw.quarantine[0].occurrence.textSha256,foreign);
 assert.equal(pack.sourceAudit.rawBoundedOccurrences,495);assert.equal(pack.sourceAudit.excludedFromKabir.length,1);
 assert.equal(pack.units.at(-1).lines[1].text,'ਬੈਰਾਗੀ ਬੰਧਨੁ ਕਰੈ ਤਾ ਕੋ ਬਡੋ ਅਭਾਗੁ ॥੨੪੩॥');
 assert.equal(pack.sourceAudit.boundaries.following.text,'ਸਲੋਕ ਸੇਖ ਫਰੀਦ ਕੇ ॥');assert.equal(pack.sourceAudit.excludedFromKabir[0].frozenPR50Modified,false);
});
await test('All digital Ang boundaries and separately observed printed extents are preserved without conflation',()=>{
 assert.deepEqual(pack.units.filter(u=>u.angStart!==u.angEnd).map(u=>u.ordinal),[10,29,67,104,141,159,177,195,213,231]);
 for(const [i,u]of pack.units.entries())for(const [j,l]of u.lines.entries()){assert.equal(l.location.ang,raw.units[i].lines[j].sourceAng);assert.equal(l.location.basis,'SELECTED_DIGITAL_WITNESS');}
 assert.equal(pack.units[176].lines[0].location.ang,1373);assert.deepEqual(pack.units[176].lines[0].location.printedExtentObservation.angs,[1373,1374]);
 assert.equal(pack.units[230].lines[0].location.ang,1376);assert.deepEqual(pack.units[230].lines[0].location.printedExtentObservation.angs,[1376,1377]);
 assert.equal(pack.sourceAudit.completePrintedCollation,false);assert.equal(pack.sourceAudit.printedEditionAuthenticated,false);
});
await test('Digital comparison reports493 exact entries,485 exact verses and one unresolved encoding',()=>{
 const byId=new Map(audit.occurrences.map(x=>[x.id,x]));
 assert.equal(original.filter(x=>x.text===byId.get(x.id).secondaryText).length,493);
 assert.equal(pack.units.flatMap(u=>u.lines).filter(x=>x.text===byId.get(x.id).secondaryText).length,485);
 assert.ok(pack.units[176].lines[0].text.includes('ਗਈਁ'));assert.ok(!original.some(x=>/[\uE000-\uF8FF\uFFFD]/u.test(x.text)));
 assert.equal(pack.sourceAudit.retainedDifferences[0].codePointEquivalenceAdjudicated,false);
});
await test('All486 meaning pairs,243 studies and8 heading contexts bind to the whole selected source',()=>{
 assert.equal(Object.keys(course.closeTextNotes).length,486);assert.equal(Object.keys(course.unitLessons).length,243);assert.equal(Object.keys(course.headingNotes).length,8);
 assert.equal(course.meta.boundManifestSHA256,sha(read('salok-kabir/data/library.json')));
 for(const u of pack.units){const lesson=course.unitLessons[BANI+'|'+u.id];assert.equal(lesson.sourcePassageSha256,u.sourceDigest);assert.equal(lesson.unitId,u.id);
  for(const l of u.lines){const n=course.closeTextNotes[BANI+'|'+l.id];assert.equal(n.lineId,l.id);assert.equal(n.sourceSha256,l.sha256);assert.equal(n.status,'DRAFT_AI_UNREVIEWED');}}
 const headings=[...pack.preface.map(h=>[h,pack.units[0]]),...pack.units.flatMap(u=>u.metricalHeadings.map(h=>[h,u]))];
 for(const [h,u]of headings){const n=course.headingNotes[BANI+'|'+h.id];assert.equal(n.headingSha256,h.sha256);assert.equal(n.unitId,u.id);assert.equal(n.status,'DRAFT_AI_UNREVIEWED');}
});
await test('Every learning field has English and Punjabi substance, source vocabulary and unique close reading',()=>{
 const en=s=>typeof s==='string'&&/[A-Za-z]/.test(s),pa=s=>typeof s==='string'&&/[\u0A00-\u0A7F]/u.test(s);
 for(const u of pack.units){const l=course.unitLessons[BANI+'|'+u.id];assert.ok(en(l.simple.en));assert.ok(pa(l.simple.pa));
  for(const f of ['focus','closeReading','interpretationCare','reflection','teachBack']){assert.ok(en(l.study[f]),u.id+' '+f);assert.ok(pa(l.study[f+'Pa']),u.id+' '+f+'Pa');}
  assert.equal(l.study.words.length,2);for(const w of l.study.words){assert.ok(u.lines.some(x=>x.text.includes(w.gurmukhi)),u.id+' '+w.gurmukhi);assert.ok(en(w.workingGloss));assert.ok(pa(w.workingGlossPa));assert.equal(w.status,'WORKING_GLOSS_NOT_APPROVED');}
  for(const line of u.lines){const n=course.closeTextNotes[BANI+'|'+line.id];assert.ok(en(n.simpleEn)&&pa(n.simplePa)&&en(n.interpretiveCaution)&&pa(n.interpretiveCautionPa),line.id);}}
 assert.equal(new Set(Object.values(course.unitLessons).map(x=>x.study.closeReading)).size,243);
});
await test('Source references retain distinct passage titles even when sharing an Ang URL',()=>{
 const refs=new Map(course.meta.references.map(x=>[x.key,x]));assert.equal(refs.size,course.meta.references.length);
 for(const u of pack.units){const list=course.unitLessons[BANI+'|'+u.id].sourceKeys.map(k=>refs.get(k));assert.ok(list.length);assert.ok(list.every(x=>x&&new URL(x.url).protocol==='https:'&&x.title&&x.scope));for(const ang of new Set(u.lines.map(l=>l.location.ang)))assert.ok(list.some(x=>new URL(x.url).hostname==='www.srigranth.org'&&new URL(x.url).searchParams.get('Param')===String(ang)),u.id+' reference Ang '+ang);}
});
await test('Draft authority is explicit and old scripture and teaching stay frozen',()=>{
 assert.equal(pack.releaseChannel,'DEVELOPMENT_REVIEW');assert.equal(pack.humanCollationApproved,false);assert.equal(pack.translationApproved,false);assert.equal(pack.sourceAudit.qualifiedHumanReviewCount,0);
 assert.equal(course.meta.publicationAllowed,false);assert.equal(course.meta.reviewer,null);assert.equal(course.coverage.reviewedUnitLessons,0);assert.equal(course.coverage.reviewedSourceMeaningLines,0);
 for(const [file,expected]of Object.entries({'nitnem/data/library.json':'9cf422955cba07ee9a8f49fbcedc4969b84232d497658fcaafe37a4aa63f4d75','nitnem/learning/course.complete.json':'5f9f877b37e2e0dba58076cdf6bfb5ec9201b2b5f02619d7b52821ec12d0e10c','salok-mahalla9/data/library.json':'abba1e752d13bd6a3dadef63d287d992fd20ac8a2408163239d501db2971769e','salok-mahalla9/data/salok-mahalla9.json':'f72690bb730b24e6631fbbabf574798e5451837987d227a807a3bcf49a366e75','salok-mahalla9/learning/course.complete.json':'e8fdcba77ac0cbf0ab396218a86225e45901ff9cb5b1c8524c7f6261a443bc79'}))assert.equal(sha(read(file)),expected,file);
});
await test('Reader pins, both pages script integrity and all69 offline assets match exact files',()=>{
 const reader=read('nitnem/reader.js').toString();assert.ok(reader.includes("const KABIR_SOURCE_MANIFEST='"+sha(read('salok-kabir/data/library.json'))+"'"));assert.ok(reader.includes("const KABIR_TEACHING='"+sha(read('salok-kabir/learning/course.complete.json'))+"'"));
 for(const page of ['salok-kabir/index.html','salok-mahalla9/index.html']){
  const scripts=[...read(page).toString().matchAll(/<script src="([^"]+)" integrity="sha256-([^"]+)" crossorigin="anonymous"><\/script>/g)];assert.equal(scripts.length,6);
  for(const m of scripts)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL(m[1],new URL(page,root)))).digest('base64'),m[2]);}
 const cache=JSON.parse(read('sw.js').toString().match(/const EXPECTED=(\{[^\n]+\});/)[1]);assert.equal(Object.keys(cache).length,73);
 for(const file of ['./salok-kabir/','./salok-kabir/index.html','./salok-kabir/data/library.json','./salok-kabir/data/salok-kabir.json','./salok-kabir/learning/course.complete.json'])assert.ok(cache[file]);
 for(const [name,digest]of Object.entries(cache))assert.equal(sha(read(name.endsWith('/')?name+'index.html':name)),digest,name);
});
await test('Storage uses separate collection identity and rejects foreign learning atomically',async()=>{
 const context={window:{},structuredClone,TextEncoder,TextDecoder,crypto:crypto.webcrypto};vm.runInNewContext(read('nitnem/local-learning.js').toString(),context);
 const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)},locks={request:async(_name,options,fn)=>typeof options==='function'?options():fn({name:_name})};
 const manager=context.GLP_NITNEM_STORAGE.create(pack,{storage,locks});const id=pack.units[230].lines[1].id;
 await manager.save(id,{notes:{[id]:'SYNTHETIC Kabir reflection'}});const before=manager.stored().raw,backup=JSON.parse(manager.exportText());assert.equal(backup.compositionId,BANI);assert.ok(manager.key.includes('salok-kabir'));
 for(const compositionId of ['salok-mahalla9','sohila']){assert.throws(()=>manager.parse(JSON.stringify({...backup,compositionId})),/this bani/);assert.equal(manager.stored().raw,before);}
});
const report={status:'PASS',checks,numberedSaloks:243,originalVerses:486,sourceOccurrences:494,bilingualMeaningDrafts:486,bilingualStudyDrafts:243,qualifiedHumanReviewed:0,
 inputSha256:Object.fromEntries(['salok-kabir/data/library.json','salok-kabir/data/salok-kabir.json','salok-kabir/learning/course.complete.json','nitnem/reader.js','sw.js'].map(p=>[p,sha(read(p))])),limitations:['Technical contracts and AI editorial checks are not qualified Gurbani/Punjabi review.','No physical iPhone, Safari or VoiceOver claim.']};
fs.mkdirSync(new URL('evidence/salok-kabir/',root),{recursive:true});fs.writeFileSync(new URL('evidence/salok-kabir/content.json',root),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',checks:checks.length,Saloks:243,sourceOccurrences:494,meanings:486,studies:243}));
