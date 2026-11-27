// Builder checks of the selected source and actual reader. Independent review remains separate.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash,webcrypto} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {makePack} from '../tools/build-salok-farid-source.mjs';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root)),json=p=>JSON.parse(read(p));
const sha=x=>createHash('sha256').update(x).digest('hex'),encode=x=>JSON.stringify(x,null,2)+'\n';
const BASE='4eee4f26bf7bad7ce52d4c958c06a94da1262ecb',BANI='salok-farid';
const intake=json('content-intake/farid/manifest.json'),secondary=json('research/salok-farid/secondary-display.json');
const pack=json('salok-farid/data/salok-farid.json'),manifest=json('salok-farid/data/library.json'),ledger=json('research/salok-farid/selection-ledger.json');
const originals=x=>[...x.preface,...x.units.flatMap(u=>[...u.metricalHeadings,...u.lines])];
const records=originals(pack),SEQUENCE='1f76efa45d938db1623bc1f88ab3b3367305be19d59051ee2dab45e57ac8e60e';
const displaced=intake.quarantinedDiscrepancies[0].sourceOccurrence;

test('The frozen intake, quarantine, prior sources and teaching bytes are unchanged',()=>{
 const tracked=execFileSync('git',['ls-tree','-r','--name-only',BASE],{cwd:root,encoding:'utf8'}).trim().split('\n');
 const protectedPaths=tracked.filter(p=>/^content-intake\//.test(p)||/^research\/salok-kabir\//.test(p)||/^(nitnem|salok-kabir|salok-mahalla9)\/(data|learning)\//.test(p));
 assert.ok(protectedPaths.length>30);
 for(const p of protectedPaths)assert.deepEqual(read(p),execFileSync('git',['show',BASE+':'+p],{cwd:root,maxBuffer:32*1024*1024}),p);
 assert.equal(ledger.frozenIntake.modified,false);assert.equal(ledger.verseTextChanges,0);assert.equal(ledger.headingTextChanges,0);
});
test('Every original is retained exactly once, with one explicitly located closing line inserted',()=>{
 const raw=intake.observedForwardSpan.occurrences;
 assert.equal(raw.length,296);assert.equal(records.length,297);assert.equal(new Set(records.map(r=>r.id)).size,297);
 const expected=[...raw.slice(0,11),displaced,...raw.slice(11)];
 assert.deepEqual(records.map(r=>r.text),expected.map(r=>r.text));
 assert.equal(sha(records.map(r=>r.text).join('\n')),SEQUENCE);
 for(const [i,r]of records.entries()){
  assert.equal(r.sha256,sha(r.text));assert.equal(r.sha256,expected[i].textSha256);
  assert.equal(r.source.path,expected[i].sourcePath);assert.equal(r.source.row,expected[i].sourceOrdinal);
  assert.equal(r.source.gitBlob,expected[i].sourceGitBlob);assert.equal(r.location.ang,expected[i].sourceAng);
  assert.equal(r.location.basis,'SELECTED_DIGITAL_WITNESS');assert.equal(r.location.canonicalAng,null);
  assert.ok(!/[\uE000-\uF8FF\uFFFD]/u.test(r.text));
 }
 assert.equal(records[11].source.row,2);assert.equal(records[11].location.ang,1377);
 assert.equal(records[11].source.selectionObservation.secondaryReportedAng,1378);
 assert.equal(records[11].source.selectionObservation.canonicalAng,null);
 assert.equal(records[11].source.selectionObservation.originalLocatorUnchanged,true);
});
test('The complete 130-unit sequence preserves variable lengths, every ending and all eleven Mahalla headings',()=>{
 assert.equal(pack.units.length,130);assert.equal(pack.originalLineCount,284);
 assert.deepEqual(pack.units.filter(u=>u.lines.length!==2).map(u=>[u.ordinal,u.lines.length]),[[1,8],[13,3],[16,4],[49,3],[52,5],[97,3],[98,4],[99,4],[100,6],[128,4]]);
 assert.deepEqual(pack.units.filter(u=>u.metricalHeadings.length).map(u=>[u.ordinal,u.metricalHeadings[0].text]),[[13,'ਮਃ ੩ ॥'],[52,'ਮਃ ੩ ॥'],[75,'ਮਹਲਾ ੫ ॥'],[82,'ਮਹਲਾ ੫ ॥'],[83,'ਮਹਲਾ ੫ ॥'],[104,'ਮਃ ੩ ॥'],[105,'ਮਃ ੫ ॥'],[108,'ਮਃ ੫ ॥'],[109,'ਮਃ ੫ ॥'],[110,'ਮਃ ੫ ॥'],[111,'ਮਃ ੫ ॥']]);
 for(const [i,u]of pack.units.entries()){
  const id='sggs.salok-farid.salok'+String(i+1).padStart(3,'0'),digits=String(i+1).replace(/[0-9]/g,d=>'੦੧੨੩੪੫੬੭੮੯'[+d]);
  assert.equal(u.id,id);assert.equal(u.ordinal,i+1);assert.ok(u.lines.at(-1).text.endsWith('॥'+digits+'॥'));
  assert.equal(u.sourceDigest,sha([...u.metricalHeadings,...u.lines].map(r=>r.id+'\t'+r.sha256).join('\n')));
  assert.equal(u.authorId,null);assert.equal(u.attribution.canonicalAuthorId,null);assert.equal(u.attribution.qualifiedAttributionReviewed,false);
  assert.equal(u.attribution.signatureAloneAssignsAuthorship,false);assert.equal(u.attribution.collectionTitleAssignsAuthorship,false);
  assert.deepEqual(u.attribution.explicitMahallaHeadingIds,u.metricalHeadings.map(r=>r.id));
 }
});
test('Fresh full secondary display exposes six unresolved differences and makes no independent-lineage claim',()=>{
 assert.equal(secondary.pages.length,9);
 const all=secondary.pages.flatMap(p=>p.originalRows.map((text,i)=>({text,reportedAng:p.reportedAng,ordinal:i+1})));
 const start=all.findIndex(r=>r.text==='ਸਲੋਕ ਸੇਖ ਫਰੀਦ ਕੇ'),end=all.findIndex((r,i)=>i>=start&&r.text.endsWith('॥੧੩੦॥'));
 const full=all.slice(start,end+1);assert.equal(full.length,297);
 assert.ok(all[start-1].text.endsWith('॥੨੪੩॥'));assert.equal(all[end+1].reportedAng,1385);
 const differences=records.flatMap((r,i)=>r.text===full[i].text?[]:[i]);
 assert.deepEqual(differences,[0,19,30,79,177,192]);assert.equal(297-differences.length,291);
 assert.deepEqual(ledger.differences.map(d=>d.selectedIndex),differences);
 for(const d of ledger.differences){assert.equal(d.selectedText,records[d.selectedIndex].text);assert.equal(d.secondaryText,full[d.selectedIndex].text);assert.equal(d.equivalenceAdjudicated,false);}
 assert.ok(ledger.differences.slice(1).every(d=>d.secondaryText.includes('\uf03d')));
 assert.equal(full[11].text,displaced.text);assert.equal(full[11].reportedAng,1378);assert.equal(full[11].ordinal,1);
 assert.equal(ledger.secondary.independentTextualLineageEstablished,false);assert.equal(pack.sourceAudit.independentTextualLineageEstablished,false);
 assert.equal(pack.sourceAudit.completePrintedCollation,false);assert.equal(ledger.qualifiedHumanReviewCount,0);assert.equal(ledger.publicationApproved,false);
});
test('Source-only output and separate seals reproduce exactly without any teaching or translation file',()=>{
 const result=makePack(intake,secondary,{manifestSha256:sha(read('content-intake/farid/manifest.json')),secondarySha256:sha(read('research/salok-farid/secondary-display.json')),intakeContractSha256:sha(read('content-intake/farid/contract.json'))});
 for(const [name,value]of [['salok-farid/data/salok-farid.json',result.pack],['salok-farid/data/library.json',result.library],['research/salok-farid/selection-ledger.json',result.ledger],['research/salok-farid/selection-summary.json',result.summary]])assert.equal(read(name).toString(),encode(value),name);
 assert.equal(sha(read('salok-farid/data/library.json')),'f239e62d2e55fb54c060d827f3596b94ca85ccf3833fa4525315684788ac538c');
 assert.equal(manifest.entries[BANI].sha256,sha(read('salok-farid/data/salok-farid.json')));
 assert.equal(pack.sourceAudit.selectionLedgerSha256,sha(read('research/salok-farid/selection-ledger.json')));
 assert.equal(fs.existsSync(new URL('salok-farid/learning/',root)),false);
 assert.equal(pack.translationApproved,false);assert.equal(pack.humanCollationApproved,false);assert.equal(pack.releaseChannel,'DEVELOPMENT_REVIEW');
});

// Extract the actual production functions. Reseal the outer files intentionally:
// these counterexamples check custody after an erroneous rebuild, not just HTTP pins.
const reader=read('nitnem/reader.js').toString();
const first=reader.indexOf('async function digest(data)'),last=reader.indexOf('function syncLearning');
assert.ok(first>=0&&last>first);
const loaderCode=reader.slice(first,last)+'\n;({library,jsonBytes,verifyPack,teachingCourse})';
function fixture(change){
 const selected=structuredClone(pack),lib=structuredClone(manifest);change?.(selected);
 for(const r of originals(selected))r.sha256=sha(r.text);
 for(const u of selected.units)u.sourceDigest=sha([...u.metricalHeadings,...u.lines].map(r=>r.id+'\t'+r.sha256).join('\n'));
 const source=Buffer.from(encode(selected));lib.entries[BANI].sha256=sha(source);
 const library=Buffer.from(encode(lib)),requests=[];
 const urls=new Map([['data/library.json',library],['data/salok-farid.json',source]]);
 const api=vm.runInNewContext(loaderCode,{TextEncoder,TextDecoder,codec:new TextDecoder('utf8',{fatal:true}),crypto:webcrypto,Uint8Array,state:{library:null},coursePromise:null,salokCollection:false,kabirCollection:false,collectionNames:[BANI],collectionManifest:sha(library),collectionTeaching:null,collectionCommit:pack.sourceRepositoryCommit,collectionRelease:pack.releaseId,
  fetch:async url=>{requests.push(url);const bytes=urls.get(url);assert.ok(bytes,'Unexpected request '+url);return{ok:true,status:200,arrayBuffer:async()=>Uint8Array.from(bytes).buffer};}}, {timeout:5000});
 const load=async()=>{const l=await api.library(),entry=l.entries[BANI];return api.verifyPack(await api.jsonBytes(entry.path,entry.sha256),entry,BANI);};
 return {requests,load,teach:async()=>api.teachingCourse(await load())};
}
test('Actual reader loads the complete source and never fetches an explanation asset',async()=>{
 const f=fixture();assert.equal((await f.load()).units.length,130);assert.equal(await f.teach(),null);
 assert.ok(f.requests.every(u=>u==='data/library.json'||u==='data/salok-farid.json'));
});
test('Missing, duplicated and reordered originals fail despite renewed outer and line seals',async()=>{
 for(const mutate of [p=>p.units[1].lines.pop(),p=>p.units[1].lines[1]=structuredClone(p.units[1].lines[0]),p=>p.units[1].lines.reverse(),p=>p.preface.reverse(),p=>p.units.reverse(),p=>{p.units[51].lines.pop();p.originalLineCount--;}])await assert.rejects(fixture(mutate).load());
});
test('Editorial heading substitutions and every Mahalla relocation, omission or abbreviation change fail after resealing',async()=>{
 await assert.rejects(fixture(p=>p.preface[0].text='ਸਲੋਕ ਸੇਖ ਫਰੀਦ ਕੇ').load(),/Farid source/);
 for(const index of [12,51,74,81,82,103,104,107,108,109,110])for(const action of ['move','drop','substitute'])await assert.rejects(fixture(p=>{const u=p.units[index];if(action==='move')u.sourceDisplayOrder=[...u.lines.map(l=>({kind:'line',id:l.id})),{kind:'metricalHeading',index:0}];else if(action==='drop')u.metricalHeadings=[];else {const old=u.metricalHeadings[0].text;u.metricalHeadings[0].text=old.startsWith('ਮਃ')?old.replace('ਮਃ','ਮਹਲਾ'):old.replace('ਮਹਲਾ','ਮਃ');assert.notEqual(u.metricalHeadings[0].text,old);}}).load());
});
test('A locator repair, inferred author, hidden discrepancy or claimed approval cannot be silently resealed',async()=>{
 for(const mutate of [p=>p.units[1].lines[1].location.ang=1378,p=>p.units[1].lines[1].location.canonicalAng=1378,p=>p.units[0].authorId='FRID',p=>p.units[0].attribution.canonicalAuthorId='FRID',p=>p.sourceAudit.secondaryDifferences.pop(),p=>p.sourceAudit.completePrintedCollation=true,p=>p.sourceAudit.independentTextualLineageEstablished=true,p=>p.humanCollationApproved=true,p=>p.translationApproved=true,p=>p.releaseChannel='PRODUCTION'])await assert.rejects(fixture(mutate).load());
});
test('Secondary private-use nasal glyphs cannot overwrite selected original Unicode',async()=>{
 for(const d of ledger.differences.slice(1))await assert.rejects(fixture(p=>{originals(p)[d.selectedIndex].text=d.secondaryText;}).load(),/Unresolved source character/);
});
