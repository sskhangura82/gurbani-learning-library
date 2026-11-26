import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
import {buildIndex,search,connected,passageLines,wordAt} from "../knowledge/core.mjs";
const bytes=fs.readFileSync(new URL("../knowledge/pilot.json",import.meta.url)),graph=JSON.parse(bytes);
const app=fs.readFileSync(new URL("../knowledge/app.mjs",import.meta.url),"utf8");
const checks=[];function test(name,fn){fn();checks.push(name);}
const index=buildIndex(graph),ids=(q,opts)=>search(index,q,opts).map(x=>x.id);
const nanak="sggs.asa.470.m1.salok01",angad="sggs.asa.466.m2.salok02",kabir="sggs.kabir.salok007";
test("Exact pinned pack SHA-256, with separate original occurrences",()=>{assert.equal(createHash("sha256").update(bytes).digest("hex"),app.match(/PACK_SHA256="([a-f0-9]{64})"/)[1]);assert.equal(index.occ.size,19);assert.equal(index.passages.length,3);});
test("Complete Salok boundaries and selected original lines",()=>{
 const p=passageLines(index,nanak),a=passageLines(index,angad),k=passageLines(index,kabir);
 assert.equal(p.length,9);assert.equal(a.length,8);assert.equal(k.length,2);
 assert.equal(p[0].text,"ਸਲੋਕੁ ਮਃ ੧ ॥");assert.equal(p[4].text,"ਮਿਠਤੁ ਨੀਵੀ ਨਾਨਕਾ ਗੁਣ ਚੰਗਿਆਈਆ ਤਤੁ ॥");assert.equal(p.at(-1).text,"ਸੀਸਿ ਨਿਵਾਇਐ ਕਿਆ ਥੀਐ ਜਾ ਰਿਦੈ ਕੁਸੁਧੇ ਜਾਹਿ ॥੧॥");
 assert.equal(a[0].text,"ਮਹਲਾ ੨ ॥");assert.equal(a[5].text,"ਹਉਮੈ ਦੀਰਘ ਰੋਗੁ ਹੈ ਦਾਰੂ ਭੀ ਇਸੁ ਮਾਹਿ ॥");assert.equal(a.at(-1).text,"ਨਾਨਕੁ ਕਹੈ ਸੁਣਹੁ ਜਨਹੁ ਇਤੁ ਸੰਜਮਿ ਦੁਖ ਜਾਹਿ ॥੨॥");
 assert.equal(k[0].text,"ਕਬੀਰ ਸਭ ਤੇ ਹਮ ਬੁਰੇ ਹਮ ਤਜਿ ਭਲੋ ਸਭੁ ਕੋਇ ॥");assert.equal(k[1].text,"ਜਿਨਿ ਐਸਾ ਕਰਿ ਬੂਝਿਆ ਮੀਤੁ ਹਮਾਰਾ ਸੋਇ ॥੭॥");
});
test("Humility in English, Punjabi and curated Roman aliases resolves to same concept and both contributors",()=>{for(const q of ["humility","ਨਿਮਰਤਾ","nimarta"]){const r=ids(q);assert.ok(r.includes("concept.humility")&&r.includes(nanak)&&r.includes(kabir));}});
test("Haumai in English, Punjabi and Roman Punjabi resolves to Guru Angad passage",()=>{for(const q of ["ego","ਹਉਮੈ","haumai"]){const r=ids(q);assert.ok(r.includes("concept.haumai")&&r.includes(angad));}});
test("Ang numbers in both scripts",()=>{assert.deepEqual(ids("Ang 466"),[angad]);assert.deepEqual(ids("ਅੰਗ ੧੩੬੪"),[kabir]);});
test("Exact phrase and first-letter search use source rows",()=>{assert.deepEqual(ids("ਮਿਠਤੁ ਨੀਵੀ",{mode:"phrase"}),[nanak]);assert.ok(ids("ਮਨਨਗਚਤ",{mode:"first-letter"}).includes(nanak));});
test("Author and collection filtering",()=>{assert.deepEqual(ids("humility",{author:"author.guru-nanak"}),[nanak]);assert.deepEqual(ids("humility",{author:"author.bhagat-kabir"}),[kabir]);assert.deepEqual(ids("humility",{collection:"collection.dasam"}),[]);});
test("Author and composition indexes converge on same passage IDs",()=>{assert.ok(ids("Guru Angad Dev Ji").includes(angad));assert.ok(ids("Asa Di Vaar").includes(angad)&&ids("Asa Di Vaar").includes(nanak));});
test("Vocabulary exact form and occurrence identity, no invented sense",()=>{const row=passageLines(index,angad).find(o=>o.text.includes("ਹੁਕਮੁ"));assert.equal(wordAt(index,row.id,"ਹੁਕਮੁ")[0].word.id,"word.hukam");assert.deepEqual(wordAt(index,row.id,"ਹੁਕਮ"),[]);assert.deepEqual(wordAt(index,row.id,"invented"),[]);});
test("Versioned topic lesson and course share references, not copied teaching or scripture",()=>{const c=index.nodes.get("concept.humility"),l=index.nodes.get(c.lessonId),course=index.nodes.get("course.human-mind");assert.equal(c.simple,undefined);assert.equal(l.subjectId,c.id);assert.ok(course.orderedLessonIds.includes(l.id));assert.equal(graph.coverage.qualifiedApproved,0);});
test("Comparative edges require actual overlap, difference, passage and cited study",()=>{for(const type of ["psychological_parallel","philosophical_comparison"]){const e=graph.edges.find(e=>e.type===type);assert.ok(e.similarity&&e.difference&&e.refs.length&&index.nodes.get(e.to).reference);assert.equal(e.review,"EDITORIAL_DRAFT");}});
test("Unknown query returns no fabricated answer",()=>{assert.deepEqual(ids("quantum computer"),[]);assert.deepEqual(ids("why do I get angry?"),[]);});
test("Schema rejects wrong author, duplicate and reordered occurrence, wrong edition, orphan edge, unqualified review promotion, missing distinction and detached dictionary form",()=>{
 const variants=[
  x=>x.nodes.find(n=>n.id===nanak).authorId="author.bhagat-kabir",
  x=>x.occurrences.push(x.occurrences[0]),
  x=>x.nodes.find(n=>n.id===nanak).occurrenceIds.reverse(),
  x=>x.occurrences[0].editionId="other",
  x=>x.edges[0].to="missing",
  x=>x.nodes.find(n=>n.type==="lesson").review="APPROVED",
  x=>delete x.edges.find(e=>e.type==="psychological_parallel").difference,
  x=>x.nodes.find(n=>n.id==="word.haumai").senses[0].form="wrong",
  x=>x.coverage.qualifiedApproved=1
 ];for(const mutate of variants){const copy=structuredClone(graph);mutate(copy);assert.throws(()=>buildIndex(copy));}
});
test("No production reader integration, provider requests, live AI or personal query storage in pilot runtime",()=>{assert.match(app,/fetch\("\.\/pilot\.json"/);assert.doesNotMatch(app,/innerHTML|localStorage|sessionStorage|sendBeacon|WebSocket|fetch\(["']https?:/);assert.match(graph.integration.productZero,/advisory evidence only/);});
console.log(JSON.stringify({status:"PASS",checks:checks.length,coverage:graph.coverage,limitations:"Node contracts only, not scholarly approval or real-device verification"},null,2));
