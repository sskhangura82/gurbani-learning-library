import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {loadKnowledge,sha256,verifyScripture} from "../knowledge/registry.mjs";
import {buildIndex,search,contentKind} from "../knowledge/core.mjs";
import {SCRIPTURE_SHA256} from "../knowledge/source-lock.mjs";

const source=await fs.readFile(new URL("../knowledge/scripture.json",import.meta.url));
const bytes=await fs.readFile(new URL("../knowledge/pilot.json",import.meta.url));
const original=JSON.parse(source),teaching=JSON.parse(bytes),checks=[];
const first=original.passages[0],verse=original.occurrences.find(o=>o.kind==="verse").text;
async function altered(mutate){
 const e=structuredClone(teaching);mutate(e);
 const raw=Buffer.from(JSON.stringify(e));
 assert.equal(await sha256(source),SCRIPTURE_SHA256);
 const graph=await loadKnowledge(source,raw,await sha256(raw));
 assert.deepEqual(graph.occurrences,original.occurrences);
 return graph;
}
const fields=[];
for(const type of ["concept","word","study","lesson","course"]){
 for(const field of ["title","pa","aliases"]){
  fields.push({name:type+"."+field,set:(e,value)=>{const n=e.nodes.find(n=>n.type===type);n[field]=field==="aliases"?[value]:value;}});
 }
}
for(const field of ["title","pa","aliases"])fields.push({name:"passageDescriptions."+field,set:(e,value)=>{e.passageDescriptions[0][field]=field==="aliases"?[value]:value;}});
for(const depth of ["simple","detailed","deep"])for(const lang of ["en","pa"])fields.push({name:"lesson."+depth+"."+lang,set:(e,value)=>{e.nodes.find(n=>n.type==="lesson")[depth][lang]=value;}});
for(const lang of ["en","pa"])fields.push({name:"word.senses."+lang,set:(e,value)=>{e.nodes.find(n=>n.type==="word").senses[0][lang]=value;}});
for(const field of ["citation","discipline"])fields.push({name:"study."+field,set:(e,value)=>{e.nodes.find(n=>n.type==="study")[field]=value;}});
for(const field of ["reason","similarity","difference"])fields.push({name:"edge."+field,set:(e,value)=>{e.edges.find(e=>e.similarity)[field]=value;}});
const attacks=[
 ["prefixed heading","ਵਿਸ਼ਾ ਸਲੋਕੁ ਮਃ ੧ ॥"],
 ["prefixed Mahalla","ਵਿਸ਼ਾ ਮਹਲਾ ੫ ॥"],
 ["prefixed bare heading","ਵਿਸ਼ਾ ਸਲੋਕੁ ॥"],
 ["zero-width and bidi","ਵਿਸ਼ਾ ਸਲੋ\u200bਕੁ ਮਃ \u202e੧ ॥"],
 ["combining grapheme joiner","ਵਿਸ਼ਾ ਸਲੋਕੁ ਮ\u034fਃ ੧ ॥"],
 ["numbered unit","ਨਿਮਰਤਾ ॥੧॥"],
 ["source verse",verse],
 ["prefixed source verse","ਵਿਚਾਰ: "+verse],
 ["numbered Pauri","ਵਿਸ਼ਾ ਪਉੜੀ ੨ ॥"]
];
let denied=0,allowed=0;
for(const field of fields){
 for(const [name,value] of attacks){
  await assert.rejects(()=>altered(e=>field.set(e,value)),/EDITORIAL_TITLE_ATTRIBUTION/,field.name+" / "+name);
  denied++;
 }
}
checks.push("Re-pinned attacks refused across all 31 displayed or indexed editorial field classes; independent source remains unchanged");
for(const field of fields){
 for(const value of ["A reflection on humility","ਸਲੋਕ ਬਾਰੇ ਵਿਚਾਰ","ਹਉਮੈ ਅਤੇ ਕਿਰਪਾ","ਮਿਹਨਤ ੧","ਨਾਨਕ","Guru Arjan"]){
  if(field.name.startsWith("study.")){
   await assert.rejects(()=>altered(e=>field.set(e,value)),/PUBLIC_STUDY_(?:METADATA|NOT_ADMITTED)/);
   denied++;continue;
  }
  buildIndex(await altered(e=>field.set(e,value)));allowed++;
 }
}
checks.push("English and Punjabi vocabulary, titles, names and teaching revisions remain ordinary editorial content; public study revisions require an explicit admission update");
for(const type of ["concept","word","study","lesson","course"]){
 for(const key of ["editorialTitle","editorialPa","editorialAliases"]){
  await assert.rejects(()=>altered(e=>{e.nodes.find(n=>n.type===type)[key]=key==="editorialAliases"?[verse]:verse;}),/joined passage metadata/);
  denied++;
 }
}
checks.push("Unexpected joined-passage fields cannot create a second editorial search path");
for(const value of ["alias",null,42,[null],[""]]){
 await assert.rejects(()=>altered(e=>{e.passageDescriptions[0].aliases=value;}),/INVALID_EDITORIAL_TITLE/);denied++;
}
for(const value of ["alias",null,42,[null],[""]]){
 await assert.rejects(()=>altered(e=>{e.nodes[0].aliases=value;}),/INVALID_EDITORIAL_TITLE/);denied++;
}
checks.push("Malformed aliases fail before a registry reaches search");
const alias="Synthetic family reflection";
const graph=await altered(e=>{e.passageDescriptions[0].aliases=[alias];});
const index=buildIndex(graph),passage=index.nodes.get(first.id);
assert.equal(Object.hasOwn(passage,"aliases"),false);
assert.deepEqual(passage.editorialAliases,[alias]);
assert.equal(passage.title,index.occ.get(first.incipitId).text);
const hit=search(index,alias).find(x=>x.id===first.id);
assert.equal(hit.kind,"scripture");assert.equal(hit.matchOrigin,"editorial");assert.match(hit.reason,/Editorial title or alias/);
const sourceHit=search(index,verse,{mode:"phrase"});
assert.equal(sourceHit.length,1);assert.equal(sourceHit[0].kind,"scripture");assert.equal(sourceHit[0].matchOrigin,"source");
checks.push("Editorial passage aliases remain searchable but carry editorial provenance and cannot replace source identity");
const wordGraph=await altered(e=>{
 const word=e.nodes.find(n=>n.type==="word"),heading=original.occurrences.find(o=>o.kind==="heading");
 word.title="ਸਲੋਕੁ";word.pa="ਸਲੋਕੁ";word.aliases=["ਸਲੋਕੁ"];
 Object.assign(word.senses[0],{form:"ਸਲੋਕੁ",passageId:heading.passageId,occurrenceIds:[heading.id],sourceBindings:[{id:heading.id,sha256:heading.textSha256}]});
});
buildIndex(wordGraph);allowed++;
assert.equal(contentKind(wordGraph.nodes.find(n=>n.type==="word")),"editorial");
await assert.rejects(()=>altered(e=>{e.nodes.find(n=>n.type==="word").senses[0].form=verse;}),/Unbound dictionary form/);denied++;
checks.push("An attested single dictionary word stays valid; a copied verse cannot masquerade as a bound form");
await verifyScripture(source);
const report={status:"PASS",denied,allowed,fieldClasses:fields.length,checks,limitations:[
 "Syntactic boundary for this frozen pilot, not theological review or a semantic classifier.",
 "Source lines are compared without rewriting the independently sealed source; all 19 source occurrences unchanged.",
 "No claim of qualified or physical-device approval."
]};
const out=new URL("../evidence/knowledge-editorial-boundary/",import.meta.url);await fs.mkdir(out,{recursive:true});
await fs.writeFile(new URL("contracts.json",out),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify({status:report.status,denied,allowed,fieldClasses:fields.length,checks:checks.length}));
