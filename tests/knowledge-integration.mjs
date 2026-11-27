import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {execFileSync} from "node:child_process";
import {buildIndex,search,resolveIdentity,contentKind} from "../knowledge/core.mjs";
import {loadKnowledge,sha256} from "../knowledge/registry.mjs";

const root=fileURLToPath(new URL("../",import.meta.url));
const base="f720099b6181919d597e249f9ad42b9f00cabe68";
const stamp=new Date().toISOString().replace(/[:.]/g,"-");
const out=path.join(root,"evidence","knowledge-integration",stamp+"-contracts");
await fs.mkdir(out,{recursive:true});
const report={status:"PASS",started:new Date().toISOString(),base,criteria:"2026-11-27T010603Z-criteria.md",checks:[],failures:[],environment:{node:process.version,platform:process.platform},limits:["Builder interaction checks, not Claude's independent review.","No qualified Gurbani, printed-page or physical-device acceptance. No deployment."]};
const frozen=["knowledge/scripture.json","knowledge/pilot.json","knowledge/registry.mjs","knowledge/source-lock.mjs"];
const bytes=new Map(await Promise.all(frozen.map(async p=>[p,await fs.readFile(path.join(root,p))])));
const sourceBytes=bytes.get(frozen[0]),teachingBytes=bytes.get(frozen[1]);
const source=JSON.parse(sourceBytes),teaching=JSON.parse(teachingBytes);
const app=await fs.readFile(path.join(root,"knowledge/app.mjs"),"utf8");
const pin=app.match(/PACK_SHA256="([a-f0-9]{64})"/)?.[1];
const N="sggs.asa-di-vaar.pauri014.salok01",A="sggs.asa-di-vaar.pauri007.salok02",K="sggs.kabir.salok007";
const sourceLine=id=>{const line=source.occurrences.find(o=>o.id===id);assert.ok(line,"Existing source fixture "+id);return line;};
const firstVerse=sourceLine(N+".line01").text;
let index;
async function check(name,fn){try{await fn();report.checks.push({name,status:"PASS"});}catch(e){report.status="FAIL";const detail={name,status:"FAIL",error:e.stack||String(e)};report.checks.push(detail);report.failures.push(detail);}}
async function altered(mutate){const e=structuredClone(teaching);mutate(e);const raw=Buffer.from(JSON.stringify(e));return buildIndex(await loadKnowledge(sourceBytes,raw,await sha256(raw)));}
function occurrenceHits(hit){for(const id of hit.occurrenceIds){const o=sourceLine(id);assert.equal(o.passageId,hit.id);}}
try{
 report.files={};
 for(const p of ["knowledge/app.mjs","knowledge/core.mjs","knowledge/search.mjs","knowledge/kinds.mjs",...frozen])report.files[p]=await sha256(await fs.readFile(path.join(root,p)));
 await check("Frozen source, teaching, registry and lock bytes are identical to PR57",async()=>{
  for(const p of frozen){const prior=execFileSync("git",["show",base+":"+p],{cwd:root,maxBuffer:8*1024*1024});assert.deepEqual(bytes.get(p),prior,p);}
 });
 await check("Pinned control loads; all existing canonical occurrence identities and bytes survive the combined index",async()=>{
  assert.ok(pin);assert.equal(await sha256(teachingBytes),pin);
  index=buildIndex(await loadKnowledge(sourceBytes,teachingBytes,pin));
  assert.deepEqual(index.graph.occurrences,source.occurrences);
  for(const o of source.occurrences){assert.equal(resolveIdentity(index,o.id),o.id);assert.equal(index.occ.get(o.id).text,o.text);}
 });
 if(index){
  const snapshot=JSON.stringify(index.graph);
  await check("Unrelated words remain refused while both first-letter modes retain exact source identities",()=>{
   for(const q of ["NASA","category"])assert.deepEqual(search(index,q),[],q);
   const start=search(index,"ਫਫਫਬਕਨਆਪ",{mode:"first-letter"}).find(x=>x.id===N);
   assert.ok(start);assert.deepEqual(start.occurrenceIds,[N+".line03"]);assert.equal(start.matchOrigin,"source");assert.equal(start.kind,"scripture");
   assert.deepEqual(search(index,"ਦਭੲਮ",{mode:"first-letter"}),[]);
   const anywhere=search(index,"ਦਭੲਮ",{mode:"first-letter-anywhere"}).find(x=>x.id===A);
   assert.ok(anywhere);assert.deepEqual(anywhere.occurrenceIds,[A+".line05"]);assert.equal(anywhere.matchOrigin,"source");
   occurrenceHits(start);occurrenceHits(anywhere);
  });
  await check("Editorial author lookup does not claim source occurrence or infer an inflected signature",()=>{
   const aliases=search(index,"ਨਾਨਕ");
   assert.ok(aliases.some(x=>x.id==="author.guru-nanak"));
   assert.ok(aliases.some(x=>x.id===N));
   for(const h of aliases){assert.equal(h.matchOrigin,"editorial");assert.equal(h.matchBasis,"editorial-author-lookup");assert.match(h.reason,/Editorial author lookup/);assert.deepEqual(h.occurrenceIds,[]);}
   const actual=search(index,"ਨਾਨਕੁ",{mode:"phrase"}).find(x=>x.id===A);
   assert.ok(actual);assert.equal(actual.matchOrigin,"source");assert.equal(actual.matchBasis,"source-phrase");assert.deepEqual(actual.occurrenceIds,[A+".line07"]);occurrenceHits(actual);
  });
  await check("A literal Kabir hit remains distinct from the author lookup and keeps exact occurrence provenance",()=>{
   const hits=search(index,"ਕਬੀਰ"),literal=hits.find(x=>x.id===K),author=hits.find(x=>x.id==="author.bhagat-kabir");
   assert.ok(literal&&author);assert.equal(literal.matchOrigin,"source");assert.equal(literal.matchBasis,"source-phrase");assert.equal(literal.kind,"scripture");
   assert.deepEqual(literal.occurrenceIds,[K+".line01"]);assert.ok(literal.score>author.score);occurrenceHits(literal);
   assert.equal(author.kind,"source-index");assert.deepEqual(author.occurrenceIds,[]);
  });
  await check("An editorial passage alias leads to canonical source without becoming source evidence",async()=>{
   const modified=await altered(e=>{e.passageDescriptions.find(d=>d.passageId===N).aliases=["Integration family reflection"];});
   const h=search(modified,"Integration family reflection").find(x=>x.id===N);
   assert.ok(h);assert.equal(h.kind,"scripture");assert.equal(h.matchOrigin,"editorial");assert.match(h.reason,/Editorial title or alias/);assert.deepEqual(h.occurrenceIds,[]);
   assert.equal(h.title,firstVerse);assert.deepEqual(modified.graph.occurrences,source.occurrences);
  });
  const mutants=[
   ["prefixed heading",e=>{e.nodes.find(n=>n.id==="concept.humility").pa="ਵਿਸ਼ਾ ਸਲੋਕੁ ਮਃ ੧ ॥";}],
   ["full source line in word label",e=>{e.nodes.find(n=>n.type==="word").pa=firstVerse;}],
   ["source line in passage alias",e=>{e.passageDescriptions[0].aliases=[firstVerse];}]
  ];
  for(const [name,mutate] of mutants)await check("Re-pinned RB-01 mutant refused by attribution guard: "+name,async()=>{await assert.rejects(()=>altered(mutate),/EDITORIAL_TITLE_ATTRIBUTION/);});
  await check("Known accepted lexical gap stays editorial through retrieval without changing canonical source",async()=>{
   const marked="ਵਿਸ਼ਾ ਮ\u0300ਃ ੧ ॥",modified=await altered(e=>{e.nodes.find(n=>n.id==="concept.humility").pa=marked;});
   const n=modified.nodes.get("concept.humility"),h=search(modified,"humility").find(x=>x.id===n.id);
   assert.equal(n.pa,marked);assert.equal(contentKind(n),"editorial");assert.ok(h);assert.equal(h.kind,"editorial");assert.equal(h.matchOrigin,"editorial");assert.deepEqual(h.occurrenceIds,[]);
   assert.deepEqual(modified.graph.occurrences,source.occurrences);
  });
  await check("Source and graph stay unchanged after retrieval and all in-memory editorial mutations",async()=>{
   assert.equal(JSON.stringify(index.graph),snapshot);
   for(const p of frozen)assert.deepEqual(await fs.readFile(path.join(root,p)),bytes.get(p),p);
  });
 }
}catch(e){report.status="FAIL";report.failures.push({name:"Harness/setup",error:e.stack||String(e)});}
finally{
 report.finished=new Date().toISOString();
 await fs.writeFile(path.join(out,"report.json"),JSON.stringify(report,null,2)+"\n");
 console.log(JSON.stringify({status:report.status,checks:report.checks.length,evidence:path.relative(root,out),failures:report.failures}));
 if(report.status!=="PASS")process.exitCode=1;
}
