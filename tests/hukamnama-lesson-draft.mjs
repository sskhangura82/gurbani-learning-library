// Contract checks for the DRAFT three-level lesson on the Shabad at Ang 504–505. Draft only: nothing here approves the teaching.
// No dependencies. Run: node tests/hukamnama-lesson-draft.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url));
const sha=x=>createHash("sha256").update(x).digest("hex");
const LESSON="drafts/hukamnama-lessons/sggs.gujri.m1.ang504.shabad04.lesson.draft.json";
const lessonText=read(LESSON).toString("utf8"),L=JSON.parse(lessonText);
const fixtureBytes=read("hukamnama/fixture.json"),F=JSON.parse(fixtureBytes.toString("utf8"));
const occ=F.canonical.occurrences,short=o=>o.id.split(".").pop(),byShort=new Map(occ.map(o=>[short(o),o]));
const GUR=/[਀-੿]/u,runs=s=>String(s).match(/[਀-੿]+/gu)||[];
const shabadWords=new Set(occ.flatMap(o=>runs(o.text)));
const lines=L.detailed.units.flatMap(u=>u.lines);
let n=0;const test=(name,f)=>{f();n++;console.log("PASS "+name);};

test("It is a draft and says so; no approval is recorded",()=>{
 assert.match(L.status,/DRAFT/);assert.match(L.status,/NOT_FOR_PUBLICATION/);
 for(const [k,v] of Object.entries(L.approvals))assert.equal(v,false,k);
 assert.equal(F.policy.lessonApproved,false);
});
test("It is bound to the exact source file it was written against",()=>{
 assert.equal(sha(fixtureBytes),L.shabad.sourceFileSha256);assert.equal(L.shabad.id,F.canonical.id);
});
test("Every occurrence of the Shabad is covered once, in order: 19 of 19",()=>{
 assert.deepEqual(lines.map(l=>l.occ),occ.map(short));assert.equal(lines.length,19);
});
test("Each line carries the fingerprint of the source line it explains",()=>{
 for(const l of lines){const o=byShort.get(l.occ);assert.equal(l.occurrenceId,o.id);assert.equal(l.textSha256,sha(Buffer.from(o.text,"utf8")),l.occ);}
});
test("The Shabad's Gurmukhi is not copied into the lesson file",()=>{
 for(const o of occ)assert.ok(!lessonText.includes(o.text),"full line copied: "+short(o));
});
test("Every headword is a word of the very line it is listed under",()=>{
 let count=0;for(const l of lines){const text=byShort.get(l.occ).text,words=new Set(runs(text));assert.ok(l.words.length>=2,l.occ);
  for(const w of l.words){count++;const parts=w.g.split(" ");assert.ok(parts.length>1?text.includes(w.g):words.has(w.g),l.occ+" "+w.g);for(const k of ["roman","en","pa"])assert.ok(w[k]&&w[k].length>1,l.occ+" "+k);assert.ok(GUR.test(w.pa));}}
 assert.ok(count>=50);
});
test("Gurmukhi quoted inside the English teaching is found in the Shabad itself",()=>{
 const fields=[...lines.flatMap(l=>[l.en,l.note?.en]),...L.detailed.units.map(u=>u.teaching.en),...L.deep.sections.map(s=>s.en),...L.openQuestionsForQualifiedReviewers.map(q=>q.question)].filter(Boolean);
 for(const f of fields)for(const r of runs(f))assert.ok(shabadWords.has(r),"not in the Shabad: "+r);
});
test("English and Punjabi at all three levels",()=>{
 assert.equal(L.simple.en.length,L.simple.pa.length);assert.ok(L.simple.en.length>=3);
 for(const s of L.simple.pa)assert.ok(GUR.test(s));assert.ok(GUR.test(L.simple.reflection.pa));
 for(const l of lines){assert.ok(l.en.length>10&&GUR.test(l.pa),l.occ);if(l.note)assert.ok(l.note.en&&GUR.test(l.note.pa),l.occ);}
 for(const u of L.detailed.units)assert.ok(u.teaching.en.length>80&&GUR.test(u.teaching.pa)&&u.teaching.pa.length>80,u.id);
 for(const s of L.deep.sections)assert.ok(s.en.length>400&&GUR.test(s.pa)&&s.pa.length>400,s.id);
 for(const r of L.deep.reflection)assert.ok(r.en&&GUR.test(r.pa));
 assert.ok(GUR.test(L.deep.humanSciences.pa)&&GUR.test(L.deep.comparisons.howToRead.pa));
});
test("The Rahao has its own unit and is named the centre",()=>{
 const r=L.detailed.units.find(u=>u.id==="rahao");assert.deepEqual(r.lines.map(l=>l.occ),occ.filter(o=>o.kind==="rahao").map(short));
 assert.match(r.teaching.en,/centre/);assert.match(r.teaching.en,/grace/);
});
test("Each comparison gives a resemblance, a difference and a citation, in both languages",()=>{
 const items=L.deep.comparisons.items;assert.ok(items.length>=6);
 for(const c of items){assert.ok(c.citation.length>5,c.id);for(const k of ["resemblance","difference"]){assert.ok(c[k].en.length>60,c.id+k);assert.ok(GUR.test(c[k].pa),c.id+k);}
  for(const o of c.relatesTo)assert.ok(byShort.has(o),c.id+" "+o);}
});
test("Lines of Gurbani cited from elsewhere carry an Ang and are the ones the sections name",()=>{
 const ids=new Set(L.deep.gurbaniReferences.map(g=>g.id));assert.equal(ids.size,L.deep.gurbaniReferences.length);
 for(const g of L.deep.gurbaniReferences){assert.ok(Number.isInteger(g.ang)&&g.ang>=1&&g.ang<=1430);assert.ok(g.text.trim().endsWith("॥"));assert.ok(g.by.length>5);}
 for(const s of L.deep.sections)for(const id of s.gurbani||[])assert.ok(ids.has(id),s.id+" "+id);
});
test("Nothing is offered as treatment; science is kept apart from the teaching",()=>{
 assert.match(L.rules.notTreatment,/not offered as a substitute/);assert.match(L.deep.humanSciences.en,/not a treatment/);assert.match(L.deep.humanSciences.en,/do not test, confirm or refute/);
 assert.ok(L.deep.humanSciences.sources.length>=2);
});
test("Points the writer was unsure of are listed for qualified reviewers",()=>{
 assert.ok(L.openQuestionsForQualifiedReviewers.length>=7);
 for(const q of L.openQuestionsForQualifiedReviewers)assert.ok(q.occ==="all"||byShort.has(q.occ),q.occ);
});
test("The reader does not load this draft",()=>{
 for(const f of ["hukamnama/reader.mjs","hukamnama/core.mjs","hukamnama/index.html"])assert.ok(!read(f).toString("utf8").includes("lesson.draft"),f);
});
console.log(n+" draft-lesson contracts passed. They check form, coverage and binding to the source. They do not check that the teaching is right: that needs a qualified human reader.");
