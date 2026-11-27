import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {createHash} from "node:crypto";
import {loadKnowledge,verifyScripture,sha256} from "../knowledge/registry.mjs";
import {SCRIPTURE_SHA256} from "../knowledge/source-lock.mjs";
import {buildIndex,passageLines,wordAt,resolveIdentity} from "../knowledge/core.mjs";
const read=name=>fs.readFile(new URL("../knowledge/"+name,import.meta.url));
const original=await read("scripture.json"),teaching=await read("pilot.json"),source=JSON.parse(original),editorial=JSON.parse(teaching);
const pin=await sha256(teaching),encode=o=>Buffer.from(JSON.stringify(o));
const checks=[];
async function test(name,fn){await fn();checks.push(name);}
const accept=(s=original,e=teaching,p=pin)=>loadKnowledge(s,e,p);
await test("Every original source line has an independent SHA-256 and stable logical ID",async()=>{
 const s=await verifyScripture(original);assert.equal(await sha256(original),SCRIPTURE_SHA256);
 assert.equal(s.occurrences.length,19);assert.equal(new Set(s.occurrences.map(o=>o.id)).size,19);
 for(const o of s.occurrences){assert.equal(await sha256(o.text),o.textSha256);assert.ok(!o.id.includes("opengranth")&&!o.id.includes(".row"));assert.ok(o.sourcePath&&o.ordinal);}
 assert.equal(s.passages.find(p=>p.angStart===470).id,"sggs.asa-di-vaar.pauri014.salok01");
 assert.equal(s.passages.find(p=>p.angStart===466).id,"sggs.asa-di-vaar.pauri007.salok02");
});
await test("Neighboring Saloks on one Ang have distinct structural identities",async()=>{
 const s=await verifyScripture(original),p=s.passages.find(p=>p.angStart===470);
 assert.notEqual(p.id,"sggs.asa-di-vaar.pauri013.salok01");
 assert.notEqual(p.id,"sggs.asa-di-vaar.pauri014.salok02");
 assert.equal(p.pauriNumber,14);assert.equal(p.salokPosition,1);
});
await test("Every old edition-row ID maps one-to-one to a logical occurrence",async()=>{
 const g=await accept();const i=buildIndex(g);
 assert.equal(Object.keys(source.legacyOccurrenceIds).length,19);
 for(const [old,id] of Object.entries(source.legacyOccurrenceIds)){assert.ok(i.occ.has(id));assert.ok(old.includes(".row"));assert.equal(resolveIdentity(i,old),id);}
 assert.equal(resolveIdentity(i,"sggs.asa.470.m1.salok01"),"sggs.asa-di-vaar.pauri014.salok01");assert.equal(passageLines(i,"sggs.asa.470.m1.salok01").length,9);
});
await test("Editorial re-seal leaves the independent scripture pin untouched",async()=>{
 const e=structuredClone(editorial);e.nodes.find(n=>n.type==="lesson").simple.en+=" Synthetic editorial revision.";
 const updated=encode(e),newPin=await sha256(updated);assert.notEqual(newPin,pin);
 const g=await accept(original,updated,newPin);assert.equal(g.occurrences.length,19);assert.equal(await sha256(original),SCRIPTURE_SHA256);
});
const sourceMutations=[
 ["removed sign",s=>s.occurrences[4].text=s.occurrences[4].text.replace("ੀ","")],
 ["middle line removed",s=>s.occurrences.splice(3,1)],
 ["last line removed",s=>s.passages[0].occurrenceIds.pop()],
 ["heading removed",s=>s.passages[0].occurrenceIds.shift()],
 ["line swapped",s=>[s.passages[0].occurrenceIds[1],s.passages[0].occurrenceIds[2]]=[s.passages[0].occurrenceIds[2],s.passages[0].occurrenceIds[1]]],
 ["changed closing number",s=>s.occurrences[8].text=s.occurrences[8].text.replace("੧","੨")],
 ["repeated word",s=>s.occurrences[6].text+=" ਨਿਵੈ"],
 ["invisible character",s=>s.occurrences[4].text+="\u200b"],
 ["pause mark",s=>s.occurrences[6].text+=";"],
 ["neighbor appended",s=>s.passages[0].occurrenceIds.push(s.occurrences[9].id)],
 ["author altered",s=>s.passages[0].authorId="author.bhagat-kabir"],
 ["Ang altered",s=>s.passages[0].angStart=471],
 ["Salok number altered",s=>s.passages[0].number=2],
 ["edition locator altered",s=>s.occurrences[0].ordinal++],
 ["logical identity altered",s=>s.occurrences[0].id+=".new"]
];
for(const [name,mutate] of sourceMutations)await test("Independent source seal rejects "+name+" even with a renewed editorial seal",async()=>{
 const s=structuredClone(source),e=structuredClone(editorial);mutate(s);e.nodes.find(n=>n.type==="lesson").revision++;
 const b=encode(e);await assert.rejects(()=>accept(encode(s),b,sha256Sync(b)),/Independent scripture digest mismatch/);
});
function sha256Sync(bytes){return createHash("sha256").update(bytes).digest("hex");}
const stale=[
 ["stale lesson",e=>e.nodes.find(n=>n.type==="lesson").sourceBindings[0].sha256="0".repeat(64)],
 ["stale dictionary",e=>e.nodes.find(n=>n.type==="word").senses[0].sourceBindings[0].sha256="0".repeat(64)],
 ["missing lesson binding",e=>delete e.nodes.find(n=>n.type==="lesson").sourceBindings],
 ["changed edge evidence",e=>e.edges.find(n=>n.refs).sourceBindings[0].sha256="0".repeat(64)],
 ["editorial scripture injection",e=>e.nodes.push(structuredClone(source.passages[0]))],
 ["editorial author override",e=>e.nodes.push({id:"author.guru-nanak",type:"author",title:"Wrong author"})],
 ["editorial occurrence injection",e=>e.occurrences=[source.occurrences[0]]],
 ["editorial attribution override",e=>e.passageDescriptions[0].authorId="author.bhagat-kabir"]
];
for(const [name,mutate] of stale)await test("Re-sealed editorial pack rejects "+name,async()=>{
 const e=structuredClone(editorial);mutate(e);const b=encode(e);await assert.rejects(()=>accept(original,b,sha256Sync(b)));
});
await test("Pinned dictionary and lessons resolve the same logical source",async()=>{
 const i=buildIndex(await accept()),pid="sggs.asa-di-vaar.pauri007.salok02",line=passageLines(i,pid).find(o=>o.text.includes("ਹੁਕਮੁ"));
 assert.equal(wordAt(i,line.id,"ਹੁਕਮੁ")[0].word.id,"word.hukam");
 const lesson=i.nodes.get(i.nodes.get("concept.haumai").lessonId);
 assert.ok(lesson.sourceBindings.some(b=>b.id===pid&&b.sha256===i.nodes.get(pid).passageSha256));
});
await test("Passage display identity is the original incipit, editorial titles are separately labeled",async()=>{
 const i=buildIndex(await accept());for(const p of i.passages){assert.equal(p.title,i.occ.get(p.incipitId).text);assert.ok(p.editorialTitle&&p.title!==p.editorialTitle);}
});
const report={status:"PASS",checks:checks.length,tests:checks,scope:"Digital pilot only, independent source pin and editorial bindings. Not scholarly authentication."};
await fs.mkdir(new URL("../evidence/knowledge-registry/",import.meta.url),{recursive:true});await fs.writeFile(new URL("../evidence/knowledge-registry/contracts.json",import.meta.url),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({status:"PASS",checks:checks.length,sourceMutations:sourceMutations.length,staleEditorialMutations:stale.length}));
