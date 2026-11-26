import assert from "node:assert/strict";
import fs from "node:fs";
import {buildIndex,search,resolveIdentity} from "../knowledge/core.mjs";
import {loadKnowledge} from "../knowledge/registry.mjs";
const root=new URL("../",import.meta.url),app=fs.readFileSync(new URL("knowledge/app.mjs",root),"utf8");
const index=buildIndex(await loadKnowledge(fs.readFileSync(new URL("knowledge/scripture.json",root)),fs.readFileSync(new URL("knowledge/pilot.json",root)),app.match(/PACK_SHA256="([a-f0-9]{64})"/)[1]));
const before=JSON.stringify(index.graph),cases=[];
const ids=(q,opts)=>search(index,q,opts).map(x=>x.id);
function check(name,fn){fn();cases.push(name);}
const N="sggs.asa-di-vaar.pauri014.salok01",A="sggs.asa-di-vaar.pauri007.salok02",K="sggs.kabir.salok007";
// Manually transcribed before implementation; never derive expected initials from the algorithm.
const rows=[
 [N,1,"ਸਰਸਅਦਅਮ","ਸਰਸਅਦਅਮ"],[N,2,"ਓਜਆਆਕਜਨਕ","ੳਜਅਅਕਜਨਕ"],
 [N,3,"ਫਫਫਬਕਨਆਪ","ਫਫਫਬਕਨਅਪ"],[N,4,"ਮਨਨਗਚਤ","ਮਨਨਗਚਤ"],
 [N,5,"ਸਕਨਆਕਪਕਨਨਕ","ਸਕਨਅਕਪਕਨਨਕ"],[N,6,"ਧਤਤਨਸਗਹ","ਧਤਤਨਸਗਹ"],
 [N,7,"ਅਦਨਜਹਮ","ਅਦਨਜਹਮ"],[N,8,"ਸਨਕਥਜਰਕਜ","ਸਨਕਥਜਰਕਜ"],
 [A,1,"ਹਏਜਹਹਕਕ","ਹੲਜਹਹਕਕ"],[A,2,"ਹਏਬਫਫਜਪ","ਹੲਬਫਫਜਪ"],
 [A,3,"ਹਕਊਕਸਇਜ","ਹਕੳਕਸੲਜ"],[A,4,"ਹਏਹਹਪਕਫ","ਹੲਹਹਪਕਫ"],
 [A,5,"ਹਦਰਹਦਭਇਮ","ਹਦਰਹਦਭੲਮ"],[A,6,"ਕਕਜਆਤਗਕਸਕ","ਕਕਜਅਤਗਕਸਕ"],
 [A,7,"ਨਕਸਜਇਸਦਜ","ਨਕਸਜੲਸਦਜ"],[K,1,"ਕਸਤਹਬਹਤਭਸਕ","ਕਸਤਹਬਹਤਭਸਕ"],
 [K,2,"ਜਐਕਬਮਹਸ","ਜਅਕਬਮਹਸ"]
];
for(const [p,n,literal,carrier] of rows)check(p+" verse "+n+" literal/carrier, spaced/compact, automatic/explicit initials",()=>{
 const id=p+".line"+String(n).padStart(2,"0");
 for(const query of new Set([literal,carrier,[...literal].join(" "),[...carrier].join(" ")]))
 for(const mode of ["auto","first-letter"]){
  const found=search(index,query,{mode}).find(x=>x.id===p);
  assert.ok(found?.occurrenceIds.includes(id),query+" "+mode+" "+id);
 }
});
check("Two headings are searchable but counted separately from the 17 verses",()=>{
 assert.ok(search(index,"ਸਮ੧").some(x=>x.occurrenceIds.includes(N+".heading01")));
 assert.ok(search(index,"ਮ੨").some(x=>x.occurrenceIds.includes(A+".heading01")));
});
const negatives=["NASA","category","Oregon","San Diego","negotiation","basal","Pasadena","casa","Kasauli","conceited","kabira","nanakshahi calendar","sevadar","angadi","psychology of colour","buddhist monastery in Tibet","self awareness app","quantum computer","why do I get angry?"];
check("Unrelated words and topics never acquire incidental aliases",()=>{for(const q of negatives)assert.deepEqual(ids(q),[],q);});
check("Known names, question framing and Latin diacritics",()=>{
 for(const q of ["humility","ਨਿਮਰਤਾ","nimarta","Nimratā","nimrta"])assert.ok(ids(q).includes("concept.humility"),q);
 for(const q of ["What does ego mean?","tell me about haumai","ਹਉਮੈ","houmai"])assert.ok(ids(q).includes("concept.haumai"),q);
 assert.ok(ids("Āsā Kī Vār").includes("composition.asa-di-vaar"));
 assert.ok(ids("Kabīr").includes(K));assert.ok(ids("M2").includes(A));
});
check("Complete word boundaries, order and occurrence boundaries",()=>{
 const hit=search(index,"ਦਾਰੂ ਭੀ ਇਸੁ ਮਾਹਿ",{mode:"phrase"});assert.deepEqual(hit.map(x=>x.id),[A]);assert.deepEqual(hit[0].occurrenceIds,[A+".line05"]);
 for(const q of ["ਦਾਰ","ਮੈ ਦੀ","ਮੁਚੁ ਓਇ","ਰੋਗੁ ਦੀਰਘ ਹਉਮੈ"])for(const mode of ["auto","phrase"])assert.deepEqual(ids(q,{mode}),[],q);
 for(const q of ["ਹ","ਿ","॥","॥੭॥","  "])for(const mode of ["auto","phrase","first-letter"])assert.deepEqual(ids(q,{mode}),[],q);
 assert.ok(ids("ਹੈ",{mode:"phrase"}).includes(A));
});
check("Anywhere is explicit and differs from the beginning of a line",()=>{
 assert.deepEqual(ids("ਦਭੲਮ",{mode:"first-letter"}),[]);
 assert.deepEqual(search(index,"ਦਭੲਮ",{mode:"first-letter-anywhere"})[0].occurrenceIds,[A+".line05"]);
});
check("Ang and complete composition references in both scripts",()=>{
 for(const q of ["466","Ang 466","ang:466","ਅੰਗ ੪੬੬","page 466"])assert.deepEqual(ids(q),[A]);
 for(const q of ["Kabir Salok 7","ਭਗਤ ਕਬੀਰ ਜੀ ਸਲੋਕ ੭","Bhagat Kabir Ji's Salok 7"])assert.deepEqual(ids(q),[K]);
 for(const q of ["Asa Ki Vaar Pauri 7 Salok 2","Asa Di Vaar, Pauri 7, Salok 2","ਆਸਾ ਦੀ ਵਾਰ ਪਉੜੀ ੭ ਸਲੋਕ ੨"])assert.deepEqual(ids(q),[A]);
 for(const q of ["0","1431","Ang -466","Ang 466xyz","Kabir Salok 999"])assert.deepEqual(ids(q),[],q);
});
check("Author, collection, and result-type filtering",()=>{
 assert.deepEqual(ids("ਕਸਤਹਬਹਤਭਸਕ",{author:"author.guru-angad"}),[]);
 assert.deepEqual(ids("ਕਸਤਹਬਹਤਭਸਕ",{author:"author.bhagat-kabir"}),[K]);
 assert.deepEqual(ids("humility",{type:"passage",author:"author.guru-nanak"}),[N]);
 assert.deepEqual(ids("Ang 466",{collection:"collection.dasam"}),[]);
});
check("Literal result carries exact line identity; related topic is explicitly different",()=>{
 const literal=search(index,"ਹਉਮੈ ਦੀਰਘ ਰੋਗੁ ਹੈ",{mode:"auto"})[0];assert.equal(literal.id,A);assert.equal(literal.score,115);assert.deepEqual(literal.occurrenceIds,[A+".line05"]);
 const topic=search(index,"ego").find(x=>x.id===A);assert.match(topic.reason,/Related topic/);assert.deepEqual(topic.occurrenceIds,[]);
});
function synthetic(rows){
 const passages=rows.map(([id,authorId,text])=>({id,type:"passage",title:id,authorId,collectionId:"collection.test",occurrenceIds:[id+".line01"],angStart:1,angEnd:1}));
 const occurrences=rows.map(([id,,text])=>({id:id+".line01",passageId:id,text,kind:"verse"}));
 return {graph:{nodes:passages,edges:[],occurrences},nodes:new Map(passages.map(p=>[p.id,p])),passages,occ:new Map(occurrences.map(o=>[o.id,o]))};
}
check("Artificial retrieval fixture preserves consonant nukta without conflating it",()=>{
 const fixture=synthetic([["fixture.nukta","writer.one","ਸ਼ਬਦੁ ਕਰਿ"],["fixture.final-nukta","writer.one","ਕਰਿ ਸ਼ਬਦੁ"]]);
 for(const q of ["ਸ਼ਕ","ਸ਼ਕ","ਸ਼ ਕ"])assert.deepEqual(search(fixture,q,{mode:"first-letter"}).map(x=>x.id),["fixture.nukta"]);
 for(const q of ["ਸਕ","ਕਸ"])assert.deepEqual(search(fixture,q,{mode:"first-letter"}),[]);
 assert.deepEqual(search(fixture,"ਕਸ਼",{mode:"first-letter"}).map(x=>x.id),["fixture.final-nukta"]);
});
check("Artificial excluded-author word match cannot suppress selected-author initials",()=>{
 const fixture=synthetic([["fixture.one","writer.one","ਮਨ ਸੁਖੁ"],["fixture.two","writer.two","ਮਾਇਆ ਨਿਰਮਲ"]]);
 assert.deepEqual(search(fixture,"ਮਨ",{author:"writer.two"}).map(x=>x.id),["fixture.two"]);
});
check("All source text and metadata remain byte-equivalent in memory after retrieval",()=>assert.equal(JSON.stringify(index.graph),before));
check("Invalid modes and excessive input return no results",()=>{
 assert.deepEqual(ids("humility",{mode:"unknown"}),[]);assert.deepEqual(ids("ਹ".repeat(241)),[]);
});
const out=new URL("evidence/knowledge-search/",root);fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(new URL("contracts.json",out),JSON.stringify({status:"PASS",checks:cases.length,cases,verseInitialFixtures:17,headingFixtures:2,negativeQueries:negatives.length,limits:"Builder retrieval checks, not qualified Gurbani review or physical-device acceptance."},null,2));
console.log(JSON.stringify({status:"PASS",checks:cases.length,verseInitialFixtures:17,headingFixtures:2}));
