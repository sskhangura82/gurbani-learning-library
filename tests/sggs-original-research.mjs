import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,mkdir,rm,link,unlink,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,basename} from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT,loadInventory,parsePinnedPage,gitBlob,sha256,projectWitnessDirectory,loadProjectionContract,validatePacket,loadValidatedPacket,searchResearchRows,searchPacket} from '../tools/sggs-original-research.mjs';
const fixture=(lines=['ਕਾ ਖਾ ਗਾ ਘਾ ॥','ਗਾ ਘਾ ਕਾ ਖਾ ॥'],change={})=>{
 const text='---\nang: 1\nauthor: SYNTHETIC TEST HEADER NOT AUTHOR EVIDENCE\nlines: '+lines.length+'\n---\n\n'+lines.map((line,i)=>'<!-- LINE:1 -->\n**'+line+'**\n\n*protected transliteration must not enter the projection*\n\nProtected explanatory text is not original source.\n\n---\n').join('')+'\n*ੴ ਸਤਿ ਨਾਮੁ*\n';
 const bytes=Buffer.from(change.text??text),descriptor={ang:1,path:'corpus/ang-0001.md',bytes:bytes.length,gitBlob:gitBlob(bytes),...change.descriptor};
 return {bytes,descriptor};
};
const expectCode=(fn,code)=>assert.throws(fn,error=>error.code===code);
const parse=(lines,change)=>{const {bytes,descriptor}=fixture(lines,change);return parsePinnedPage(bytes,descriptor);};
test('synthetic original fields retain exact spelling, punctuation, Unicode and source byte slices',()=>{
 const {bytes,descriptor}=fixture(['ਕਾ ਖਾ; ਗਾ ਘਾ ॥','ਬੰਨੑਿ ॥੨॥']);
 const {occurrences}=parsePinnedPage(bytes,descriptor);
 assert.equal(occurrences[0].text,'ਕਾ ਖਾ; ਗਾ ਘਾ ॥');assert.equal(occurrences[1].text,'ਬੰਨੑਿ ॥੨॥');
 for(const row of occurrences)assert.equal(bytes.slice(row.sourceByteStart,row.sourceByteEnd).toString('utf8'),row.text);
 assert.equal(occurrences.length,2);assert.ok(!JSON.stringify(occurrences).includes('Protected'));
 assert.ok(occurrences.every(x=>!Object.hasOwn(x,'author')&&!Object.hasOwn(x,'translation')&&!Object.hasOwn(x,'raag')));
});
test('identical text and printed-line labels still produce separate immutable witness identities',()=>{
 const rows=parse(['ਕਾ ਖਾ ॥','ਕਾ ਖਾ ॥']).occurrences;
 assert.notEqual(rows[0].id,rows[1].id);assert.equal(rows[0].textSha256,rows[1].textSha256);
 assert.deepEqual(rows.map(r=>r.sourceWithinLine),[1,2]);
});
test('a byte change is rejected even at unchanged source path',()=>{const {bytes,descriptor}=fixture();bytes[bytes.length-2]^=1;expectCode(()=>parsePinnedPage(bytes,descriptor),'SOURCE_BYTES');});
test('source-file/page disagreement is rejected',()=>{const {bytes,descriptor}=fixture();expectCode(()=>parsePinnedPage(bytes,{...descriptor,ang:2}),'SOURCE_PATH');});
test('declared occurrence count cannot conceal omission',()=>{const {bytes}=fixture();expectCode(()=>parse(undefined,{text:bytes.toString().replace('lines: 2','lines: 3')}),'SOURCE_STRUCTURE');});
test('unparsed and malformed source markers are rejected',()=>{const {bytes}=fixture();expectCode(()=>parse(undefined,{text:bytes.toString().replace('<!-- LINE:1 -->','<!-- LINE:bad -->')}),'SOURCE_STRUCTURE');});
test('duplicate front-matter Ang assertions are rejected',()=>{const {bytes}=fixture();expectCode(()=>parse(undefined,{text:bytes.toString().replace('ang: 1','ang: 1\nang: 1')}),'SOURCE_STRUCTURE');});
test('invalid UTF-8 cannot be silently replaced',()=>{const bytes=Buffer.from([0xff,0xfe]);expectCode(()=>parsePinnedPage(bytes,{ang:1,path:'corpus/ang-0001.md',bytes:2,gitBlob:gitBlob(bytes)}),'SOURCE_ENCODING');});
test('reading-aid text cannot be relabelled as an original field',()=>expectCode(()=>parse(['ਕਾ English commentary']),'ORIGINAL_FIELD'));
test('whole-word search does not accept a substring',()=>{
 const rows=parse(['ਮਨੁ ਮਨਮੁਖ ॥']).occurrences;
 assert.equal(searchResearchRows(rows,'ਮਨੁ').totalHits,1);assert.equal(searchResearchRows(rows,'ਮਨ').totalHits,0);
});
test('joined and spaced initial letters at the start agree',()=>{
 const rows=parse().occurrences;
 assert.deepEqual(searchResearchRows(rows,'ਕ ਖ',{mode:'first-letter'}).occurrences,searchResearchRows(rows,'ਕਖ',{mode:'first-letter'}).occurrences);
 assert.equal(searchResearchRows(rows,'ਕਖ',{mode:'first-letter'}).totalHits,1);
});
test('initial letters within a line differ explicitly from start-only search',()=>{
 const rows=parse().occurrences;
 assert.equal(searchResearchRows(rows,'ਕਖ',{mode:'first-letter-anywhere'}).totalHits,2);
 assert.equal(searchResearchRows(rows,'ਗਘ',{mode:'first-letter'}).totalHits,1);
});
for(const query of ['NASA','category','haumai','Asa','psychology'])test('unsupported outside label cannot become scripture match: '+query,()=>{
 const result=searchResearchRows(parse().occurrences,query);assert.equal(result.querySupported,false);assert.equal(result.totalHits,0);
});
test('bounded results report total hits and truncation without modifying original text',()=>{
 const rows=parse(['ਕਾ ਖਾ ॥','ਕਾ ਖਾ ॥']).occurrences,result=searchResearchRows(rows,'ਕਾ',{limit:1});
 assert.equal(result.totalHits,2);assert.equal(result.returnedHits,1);assert.equal(result.truncated,true);assert.equal(result.occurrences[0].text,'ਕਾ ਖਾ ॥');
});
test('empty, oversized and unsupported search-mode inputs refuse',()=>{
 const rows=parse().occurrences;
 for(const query of ['','   ',null,'ਕ'.repeat(241)])expectCode(()=>searchResearchRows(rows,query),'QUERY');
 expectCode(()=>searchResearchRows(rows,'ਕਾ',{mode:'auto'}),'SEARCH_MODE');
 for(const limit of [0,101,1.5,'2'])expectCode(()=>searchResearchRows(rows,'ਕਾ',{limit}),'RESULT_LIMIT');
});
test('an unverified object cannot enter the public packet search',()=>expectCode(()=>searchPacket({occurrences:parse().occurrences},'ਕਾ'),'UNVERIFIED_PACKET'));
const witnessDir=process.env.GLP_SGGS_WITNESS_DIR,indexPath=process.env.GLP_SGGS_INDEX;
const actual=Boolean(witnessDir&&indexPath);
let packet,contract;
if(actual){packet=await loadValidatedPacket(indexPath);contract=await loadProjectionContract();}
test('full actual pinned corpus reproduces the recorded projection', {skip:!actual},async()=>{
 const projected=await projectWitnessDirectory(witnessDir);
 assert.deepEqual(projected.contract,contract);assert.equal(projected.packet.pages.length,1430);assert.equal(projected.packet.occurrences.length,60555);
 assert.deepEqual(validatePacket(projected.packet,contract),{status:'RESEARCH_ONLY',sourceFilesReproduced:1430,originalOccurrencesExtracted:60555,runtimeEligible:false,publicationReady:false,independentlyCollatedOccurrences:0,completeCompositionsAdmitted:0,qualifiedHumanReviewCount:0});
});
for(const [name,mutate]of [
 ['text',p=>p.occurrences[10].text+=' ਕ'],['identity',p=>p.occurrences[10].id=p.occurrences[11].id],
 ['order',p=>[p.occurrences[10],p.occurrences[11]]=[p.occurrences[11],p.occurrences[10]]],
 ['missing occurrence',p=>p.occurrences.pop()],['duplicate occurrence',p=>p.occurrences.push(p.occurrences[0])],
 ['source locator',p=>p.occurrences[10].sourcePrintedLine++],['unknown authority field',p=>p.canonicalAuthorId='invented'],
 ['runtime promotion',p=>p.runtimeEligible=true],['review promotion',p=>p.qualifiedHumanReviewCount=1],
 ['source commit',p=>p.sourceCommit='0'.repeat(40)],['page omission',p=>p.pages.pop()],
 ['known discrepancy erased',p=>p.occurrences.find(x=>x.discrepancyIds.length).discrepancyIds=[]],
 ['source raw digest',p=>p.pages[0].rawSha256='0'.repeat(64)]
])test('actual packet refuses changed '+name,{skip:!actual},()=>{const changed=structuredClone(packet);mutate(changed);assert.throws(()=>validatePacket(changed,contract));});
test('full corpus search finds exact words and refuses substring/name guesses',{skip:!actual},()=>{
 const found=searchPacket(packet,'ਸਾਸਿ ਸਾਸਿ',{limit:3});
 const oracle=packet.occurrences.filter(x=>/(?:^|\s)ਸਾਸਿ\s+ਸਾਸਿ(?:\s|$)/u.test(x.text));
 assert.equal(found.totalHits,oracle.length);assert.equal(found.totalHits,68);assert.equal(found.returnedHits,3);
 assert.ok(found.occurrences.every(x=>x.sourceLocatorStatus==='SOURCE_FILE_LABEL_NOT_INDEPENDENT_ANG_VERIFICATION'&&x.canonicalAuthorId===null&&x.completeComposition===false));
 for(const query of ['NASA','category','haumai'])assert.equal(searchPacket(packet,query).totalHits,0);
});
test('known displaced Farid occurrence and heading remain in research search at unchanged source location',{skip:!actual},()=>{
 const displaced=searchPacket(packet,'ਬੰਨੑਿ ਉਠਾਈ ਪੋਟਲੀ');assert.equal(displaced.totalHits,1);
 assert.deepEqual(displaced.occurrences[0].discrepancyIds,['og-location-1377-row002']);
 assert.equal(displaced.occurrences[0].reportedSourceAng,1377);assert.equal(displaced.occurrences[0].sourceOrdinal,2);
 const heading=searchPacket(packet,'ਸਲੋਕ ਸੇਖ ਫਰੀਦ ਕੇ');assert.equal(heading.totalHits,1);
 assert.deepEqual(heading.occurrences[0].discrepancyIds,['farid-heading-terminal-danda']);
 assert.equal(heading.occurrences[0].text,'ਸਲੋਕ ਸੇਖ ਫਰੀਦ ਕੇ ॥');
});
test('actual repeated source texts retain distinct occurrence IDs',{skip:!actual},()=>{
 const groups=new Map();for(const row of packet.occurrences){const ids=groups.get(row.textSha256)||[];ids.push(row.id);groups.set(row.textSha256,ids);}
 const repeated=[...groups.values()].filter(ids=>ids.length>1);assert.ok(repeated.length>0);
 for(const ids of repeated)assert.equal(new Set(ids).size,ids.length);
});
test('full initial-letter start and within-line searches preserve the complete exact phrase occurrence',{skip:!actual},()=>{
 const target=packet.occurrences.find(x=>x.text==='ਸਾਸਿ ਸਾਸਿ ਸਿਮਰਹੁ ਗੋਬਿੰਦ ॥');assert.ok(target);
 assert.ok(searchPacket(packet,'ਸਸਸਗ',{mode:'first-letter',limit:100}).occurrences.some(x=>x.id===target.id));
 assert.ok(searchPacket(packet,'ਸ ਗ',{mode:'first-letter-anywhere',limit:100}).totalHits>0);
});
test('canonical packet encoding refuses duplicate JSON keys, even when JSON.parse would conceal them',{skip:!actual},async()=>{
 const dir=await mkdtemp(resolve(tmpdir(),'glp-corpus-duplicate-'));
 try{const text=await readFile(indexPath,'utf8'),path=resolve(dir,'index.json');await writeFile(path,text.replace('{','{"runtimeEligible":true,'));await assert.rejects(()=>loadValidatedPacket(path),e=>e.code==='PACKET_ENCODING');}finally{await rm(dir,{recursive:true,force:true});}
});
test('missing, extra, symlink and changed witness files cannot produce a research packet',{skip:!actual},async()=>{
 const inventory=await loadInventory(),dir=await mkdtemp(resolve(tmpdir(),'glp-corpus-refusal-'));
 try{
  for(const file of [...inventory.files.map(x=>basename(x.path)),'capture.json'])await link(resolve(witnessDir,file),resolve(dir,file));
  const first=basename(inventory.files[0].path),target=resolve(dir,first);
  await unlink(target);await assert.rejects(()=>projectWitnessDirectory(dir),e=>e.code==='SOURCE_FILE_SET');
  await link(resolve(witnessDir,first),target);await writeFile(resolve(dir,'extra.md'),'synthetic');await assert.rejects(()=>projectWitnessDirectory(dir),e=>e.code==='SOURCE_FILE_SET');await unlink(resolve(dir,'extra.md'));
  await unlink(target);await symlink(resolve(witnessDir,first),target);await assert.rejects(()=>projectWitnessDirectory(dir),e=>e.code==='SOURCE_FILE_TYPE');await unlink(target);
  const original=await readFile(resolve(witnessDir,first)),changed=Buffer.from(original);changed[changed.length-2]^=1;await writeFile(target,changed);await assert.rejects(()=>projectWitnessDirectory(dir),e=>e.code==='SOURCE_BYTES');
  assert.equal(sha256(await readFile(resolve(witnessDir,first))),sha256(original));
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('existing output is not overwritten by the builder',{skip:!actual},()=>{
 const before=packet.occurrences[0].id;
 const result=spawnSync(process.execPath,['tools/build-sggs-research-index.mjs','--witness-dir',witnessDir,'--output',resolve(indexPath,'..')],{cwd:ROOT,encoding:'utf8'});
 assert.notEqual(result.status,0);assert.equal(packet.occurrences[0].id,before);assert.match(result.stderr,/EEXIST/);
});

for(const script of ['tools/fetch-sggs-research-witnesses.mjs','tools/build-sggs-research-index.mjs'])test('failed Git environment detection refuses before capture or output: '+script,async()=>{
 const dir=await mkdtemp(resolve(tmpdir(),'glp-corpus-env-')),output=resolve(dir,'must-not-exist');
 try{
  const args=script.includes('build-')?['--witness-dir',resolve(dir,'also-does-not-exist'),'--output',output]:['--output',output];
  const result=spawnSync(process.execPath,[script,...args],{cwd:ROOT,encoding:'utf8',env:{...process.env,PATH:dir}});
  assert.notEqual(result.status,0);assert.match(result.stderr,/ENVIRONMENT_GUARD|Git environment detection failed/);
  await assert.rejects(()=>readFile(resolve(output,'capture.json')),error=>error.code==='ENOENT');
  const {lstat}=await import('node:fs/promises');await assert.rejects(()=>lstat(output),error=>error.code==='ENOENT');
 }finally{await rm(dir,{recursive:true,force:true});}
});
