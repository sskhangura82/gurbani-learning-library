import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadCompletePassages,sourceUnits,searchCompletePassages,exactSequenceMatches,buildCrosswalkRecord,fingerprint} from '../library/passages.mjs';
import {PASSAGE_SOURCES,CROSSWALK_PATH,CROSSWALK_SHA256} from '../library/passage-contracts.mjs';
import {sourceResponseUrlMatches} from '../library/passage-ui.mjs';
import {reproduceCrosswalk} from '../tools/build-explore-crosswalk.mjs';
const ROOT=fileURLToPath(new URL('../',import.meta.url)),read=name=>fs.readFile(path.join(ROOT,name));
const catalog=await loadCompletePassages(read);

test('303 immutable owning units become 302 unique complete passages, with the overlapping view preserved',()=>{
 assert.equal(catalog.sourceUnits,303);assert.equal(catalog.uniqueCompletePassages,302);assert.deepEqual(catalog.withheld,[]);
 assert.equal(catalog.independentCollation,false);assert.equal(catalog.qualifiedApproval,false);
 const overlap=catalog.passages.filter(p=>p.routes.length===2);assert.equal(overlap.length,1);assert.equal(overlap[0].routes[0].unitId,'sggs.salok-kabir.salok007');assert.equal(overlap[0].routes[1].unitId,'sggs.kabir.salok007');
 for(const p of catalog.passages){assert.equal(p.lines.length,p.witness.witnessIds.length);assert.ok(p.lines.length>=2);assert.ok(p.routes.every(r=>r.href.startsWith(r.sourceId==='knowledge'?'knowledge/index.html#item=':r.sourceId+'/index.html?bani='+r.sourceId+'&unit=')));assert.ok(!Object.hasOwn(p,'angStart'));assert.ok(!Object.hasOwn(p,'authorId'));}
});
test('the complete crosswalk reproduces against the full 60,555-occurrence research packet',async()=>{
 const index=process.env.GLP_SGGS_INDEX;if(!index)throw Error('This source reconstruction check requires GLP_SGGS_INDEX; it must not silently skip.');
 const reconstructed=Buffer.from(JSON.stringify(await reproduceCrosswalk(index),null,2)+'\n');assert.deepEqual(reconstructed,await read(CROSSWALK_PATH));assert.equal(await fingerprint(reconstructed),CROSSWALK_SHA256);
});
test('literal Haumai matches return complete originals, retaining the remedy clause',()=>{
 const result=searchCompletePassages(catalog,'ਹਉਮੈ');assert.ok(result.total>1);
 const passage=result.matches.find(x=>x.passage.routes.some(r=>r.unitId==='sggs.asa-di-vaar.pauri007.salok02')).passage;
 assert.equal(passage.lines.length,8);assert.ok(passage.lines.some(l=>l.text==='ਹਉਮੈ ਦੀਰਘ ਰੋਗੁ ਹੈ ਦਾਰੂ ਭੀ ਇਸੁ ਮਾਹਿ ॥'));assert.equal(passage.routes[0].href,'knowledge/index.html#item=sggs.asa-di-vaar.pauri007.salok02');
});
test('joined and spaced first-letter queries return the same complete Kabir unit',()=>{
 const a=searchCompletePassages(catalog,'ਕਮਸਰਊਰ',{mode:'first-letter'}),b=searchCompletePassages(catalog,'ਕ ਮ ਸ ਰ ਊ ਰ',{mode:'first-letter'});
 assert.ok(a.total>0);assert.deepEqual(a,b);assert.ok(a.matches.some(x=>x.passage.routes.some(r=>r.unitId==='sggs.salok-kabir.salok001')));
 const anywhere=searchCompletePassages(catalog,'ਸਰਊਰ',{mode:'first-letter-anywhere'});assert.ok(anywhere.matches.some(x=>x.passage.routes.some(r=>r.unitId==='sggs.salok-kabir.salok001')));
});
test('English topic names, substring mistakes and unsupported syntax do not become scripture matches',()=>{
 for(const q of ['NASA','category','ego','haumai','Kabir','<script>alert(1)</script>','ਹਉਮੈ NASA']){const r=searchCompletePassages(catalog,q);assert.equal(r.total,0,q);assert.equal(r.supported,false,q);}
 for(const q of ['ਹਉਮ','ਕ','੧੪੩੦'])assert.equal(searchCompletePassages(catalog,q).total,0,q);
 assert.throws(()=>searchCompletePassages(catalog,'ਹਉਮੈ',{mode:'auto'}));assert.throws(()=>searchCompletePassages(catalog,'ਹ'.repeat(241)));
});
test('missing or corrupted source packages withhold the whole result set',async()=>{
 for(const source of PASSAGE_SOURCES){
  await assert.rejects(loadCompletePassages(async name=>{if(name===source.path)throw Error('missing');return read(name);}));
  await assert.rejects(loadCompletePassages(async name=>name===source.path?Buffer.concat([await read(name),Buffer.from(' ')]):read(name)),{code:'SEARCH_SOURCE_DIGEST'});
 }
});
test('retargeted, promoted, truncated, extra and duplicate-key crosswalks refuse before source disclosure',async()=>{
 const raw=await read(CROSSWALK_PATH),original=JSON.parse(raw);
 const mutations=[v=>{v.qualifiedApproval=true;},v=>{v.units[0].unitId=v.units[1].unitId;},v=>{v.units.pop();},v=>{v.units[0].href='https://attacker.invalid';},v=>{v.units[0].matches[0].witnessIds.reverse();}];
 for(const change of mutations){const v=structuredClone(original);change(v);await assert.rejects(loadCompletePassages(async p=>p===CROSSWALK_PATH?Buffer.from(JSON.stringify(v)+'\n'):read(p)),{code:'SEARCH_CROSSWALK_DIGEST'});}
 const duplicate=raw.toString().replace('"qualifiedApproval": false','"qualifiedApproval": true, "qualifiedApproval": false');await assert.rejects(loadCompletePassages(async p=>p===CROSSWALK_PATH?Buffer.from(duplicate):read(p)),{code:'SEARCH_CROSSWALK_DIGEST'});
});
test('full ordered equality rejects first-line-only and normalization fallbacks, retaining ambiguity',async()=>{
 const unit=(await sourceUnits(PASSAGE_SOURCES[0].id,await read(PASSAGE_SOURCES[0].path)))[0];
 const make=(line,id)=>({id:'witness-og-'+String(id).padStart(64,'0'),sourcePath:'corpus/ang-1426.md',text:line.text,textSha256:line.sha256,discrepancyIds:[]});
 const exact=unit.lines.map((l,i)=>make(l,i+1));assert.equal(exactSequenceMatches(exact,unit).length,1);
 assert.equal(exactSequenceMatches([exact[0],{...exact[1],text:exact[1].text+' '}],unit).length,0);
 assert.equal(exactSequenceMatches([...exact].reverse(),unit).length,0);assert.equal(exactSequenceMatches([exact[0]],unit).length,0);
 const ambiguous=await buildCrosswalkRecord(unit,[...exact,...unit.lines.map((l,i)=>make(l,i+10))]);assert.equal(ambiguous.status,'WITHHELD_AMBIGUOUS_SEQUENCE');assert.equal(ambiguous.matches.length,2);
 const missing=await buildCrosswalkRecord(unit,[exact[0]]);assert.equal(missing.status,'WITHHELD_NO_COMPLETE_SEQUENCE');assert.equal(missing.matches.length,0);
});
test('source text and exact identities remain immutable after load and cannot be supplied by an unverified catalog',()=>{
 assert.throws(()=>{catalog.passages[0].lines[0].text='changed';},TypeError);assert.throws(()=>searchCompletePassages(structuredClone(catalog),'ਹਉਮੈ'),{code:'SEARCH_UNVERIFIED_CATALOG'});
});
test('closed-library search mirrors are exactly the existing Knowledge implementation',async()=>{
 assert.deepEqual(await read('library/search.mjs'),await read('knowledge/search.mjs'));assert.deepEqual(await read('library/kinds.mjs'),await read('knowledge/kinds.mjs'));
});

test('cached response URLs accept only the same local path and one release marker; content digests remain required',()=>{
 const expected='https://local.example.test/library/library/complete-passages.json';
 for(const actual of ['',expected,expected+'?glp_release=0.24-explore-complete-passages-20261127-1'])assert.equal(sourceResponseUrlMatches(expected,actual),true,actual);
 for(const actual of ['not a URL','https://other.example.test/library/library/complete-passages.json',expected.replace('/library/library/','/wrong/'),expected+'?q=anything',expected+'?glp_release=',expected+'?glp_release=one&glp_release=two',expected+'?glp_release=one&other=two',expected+'?glp_release='+('a'.repeat(97)),expected+'#fragment','https://user:secret@local.example.test/library/library/complete-passages.json'])assert.equal(sourceResponseUrlMatches(expected,actual),false,actual);
});
