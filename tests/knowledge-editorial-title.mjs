import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {loadKnowledge,sha256} from "../knowledge/registry.mjs";

const source=await fs.readFile(new URL("../knowledge/scripture.json",import.meta.url));
const editorial=await fs.readFile(new URL("../knowledge/pilot.json",import.meta.url));
const original=JSON.parse(source), teaching=JSON.parse(editorial);
const pass=await loadKnowledge(source,editorial,await sha256(editorial));
assert.equal(pass.occurrences.length,19);
async function altered(field,value){
 const e=structuredClone(teaching);e.passageDescriptions[0][field]=value;
 const bytes=Buffer.from(JSON.stringify(e));
 return loadKnowledge(source,bytes,await sha256(bytes));
}
const headings=[
 "ਸਲੋਕੁ ਮਃ ੧ ॥", "ਸਲੋਕੁ ਮਃ ੧", "ਸਲੋਕ ਮਃ 1 ॥",
 "ਸਲੋਕੁ\u200b ਮਃ\u00a0੧ ॥", "ਸਲੋਕੁ ਮਃ ੧ ॥ example",
 "ਮਹਲਾ ੨ ॥", "ਮਹਲਾ ੧", "ਸਲੋਕੁ ਮਹਲਾ ੩ ॥",
 "ਪਉੜੀ ॥", "ਪਉੜੀ ੧ ॥", "ਰਹਾਉ ॥", "ੴ",
];
let denied=0,allowed=0;
for(const field of ["title","pa"]){
 for(const value of [...headings,...original.occurrences.map(o=>o.text)]){
  await assert.rejects(()=>altered(field,value),/EDITORIAL_TITLE_ATTRIBUTION/);
  denied++;
 }
 for(const value of ["A reflection on humility","ਸਲੋਕ ਬਾਰੇ ਵਿਚਾਰ","ਹਉਮੈ ਅਤੇ ਕਿਰਪਾ","Understanding Salok Mahalla 1"]){
  const g=await altered(field,value);
  const p=g.nodes.find(n=>n.id===teaching.passageDescriptions[0].passageId);
  assert.equal(p[field==="title"?"editorialTitle":"editorialPa"],value);
  assert.equal(p.title,original.occurrences.find(o=>o.id===p.incipitId).text);
  assert.deepEqual(g.occurrences,original.occurrences);
  allowed++;
 }
 for(const value of [null,"","   ",123,["title"]]){
  await assert.rejects(()=>altered(field,value),/INVALID_EDITORIAL_TITLE/);
  denied++;
 }
}
console.log(JSON.stringify({status:"PASS",denied,allowed,unchangedSourceOccurrences:19}));
