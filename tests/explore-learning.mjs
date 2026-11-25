// Contract checks for the source-linked learning pilot. Editorial draft, no personal data.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=n=>fs.readFileSync(path.join(root,n),"utf8");
const lesson=JSON.parse(read("explore/lesson-17.json"));
const html=read("explore/index.html"),css=read("explore/style.css"),app=read("explore/app.js"),reader=read("js/sukhmani-reader.js");
const checks=[];
function test(name,fn){fn();checks.push(name);}
test("One unapproved lesson, source remains in original reader",()=>{
 assert.equal(lesson.schema,"glp.source-linked-lesson.v1");
 assert.equal(lesson.composition.ashtpadi,17);
 assert.deepEqual(lesson.composition.angs,[285,286]);
 assert.match(lesson.status,/NOT_QUALIFIED_HUMAN_REVIEWED/);
 assert.equal(lesson.quality.humanScriptureCollationApproved,false);
 assert.equal(lesson.quality.humanMeaningReviewApproved,false);
 assert.equal(lesson.quality.physicalIPhoneAccepted,false);
 assert.equal(lesson.composition.originalReader,"../sukhmani.html#ashtpadi-17");
 assert.match(reader,/section\.id='ashtpadi-'\+a\.number/);
 assert.match(html, /href="\.\.\/sukhmani\.html#ashtpadi-17"/);
});
test("Exactly one Salok and eight Pauris in correct order",()=>{
 assert.equal(lesson.units.length,9);
 assert.deepEqual(lesson.units.map(u=>u.id),["salok",...Array.from({length:8},(_,i)=>"pauri-"+(i+1))]);
 assert.deepEqual(lesson.units.map(u=>u.pauri),[null,1,2,3,4,5,6,7,8]);
 assert.deepEqual(lesson.units.map(u=>u.ang),["285","285","285","285","285","285–286","286","286","286"]);
 assert.ok(lesson.units.every(u=>u.cue.includes("॥")&&u.newcomer.length>90&&u.punjabi.length>65&&u.deep.length>180&&u.caution.length>40&&u.prompt.length>20));
});
test("Opening cues independently identify documented source, no fabricated full-text",()=>{
 const cues=["ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਸਚੁ ॥","ਚਰਨ ਸਤਿ ਸਤਿ ਪਰਸਨਹਾਰ ॥","ਸਤਿ ਸਰੂਪੁ ਰਿਦੈ ਜਿਨਿ ਮਾਨਿਆ ॥","ਠਾਕੁਰ ਕਾ ਸੇਵਕੁ ਆਗਿਆਕਾਰੀ ॥","ਅਪੁਨੇ ਜਨ ਕਾ ਪਰਦਾ ਢਾਕੈ ॥","ਨੀਕੀ ਕੀਰੀ ਮਹਿ ਕਲ ਰਾਖੈ ॥","ਬਾਰੰ ਬਾਰ ਬਾਰ ਪ੍ਰਭੁ ਜਪੀਐ ॥","ਬੋਲਹੁ ਜਸੁ ਜਿਹਬਾ ਦਿਨੁ ਰਾਤਿ ॥","ਮਨ ਮੇਰੇ ਤਿਨ ਕੀ ਓਟ ਲੇਹਿ ॥"];
 assert.deepEqual(lesson.units.map(u=>u.cue),cues);
 assert.match(html,/not the complete original/);
 assert.match(lesson.scope,/not another scripture transcription/);
});
test("Newcomer English/Punjabi and vocabulary exist throughout",()=>{
 for(const u of lesson.units){
  assert.ok(u.vocabulary.length>=2,u.id);
  for(const word of u.vocabulary){
   for(const k of ["g","roman","en","pa"])assert.ok(word[k]&&String(word[k]).trim().length>1,u.id+" "+k);
   assert.ok(/[\u0a00-\u0a7f]/u.test(word.g),u.id);
  }
  assert.ok(/[\u0a00-\u0a7f]/u.test(u.punjabi),u.id);
 }
 assert.equal(lesson.terms.length,4);
});
test("Optional comparison edges contain both a similarity and non-equivalence",()=>{
 const byId=new Map(lesson.comparisons.map(c=>[c.id,c]));
 assert.equal(byId.size,lesson.comparisons.length);
 assert.equal(byId.size,3);
 assert.ok(["Hindu philosophy","Early Buddhist text","Modern psychology"].every(k=>lesson.comparisons.some(c=>c.kind===k)));
 for(const u of lesson.units)for(const id of u.compare){
  const c=byId.get(id);assert.ok(c,u.id+" bad comparison "+id);
  assert.ok(c.relevantTo.includes(u.id),u.id+" comparison not bound");
 }
 for(const c of lesson.comparisons){
  assert.ok(c.similarity.length>60&&c.difference.length>100);
  assert.match(c.source.url,/^https:\/\//);
  assert.equal(new URL(c.source.url).username,"");
 }
});
test("Historical Sri Chand tradition flagged as contested, not scripture",()=>{
 assert.ok(lesson.contextualNotes.some(n=>n.status==="CONTESTED_HISTORY_NOT_SCRIPTURE"&&n.text.includes("Sri Chand")));
 assert.ok(lesson.contextualNotes.some(n=>n.text.includes("ਭਿ")&&n.text.includes("ਭੀ")));
});
test("Primary and comparison sources are complete and HTTPS-only",()=>{
 assert.ok(lesson.bibliography.length>=7);
 assert.ok(lesson.bibliography.some(s=>s.url.includes("Param=285")));
 assert.ok(lesson.bibliography.some(s=>s.url.includes("Param=286")));
 assert.ok(lesson.bibliography.some(s=>s.url.includes("gurugranthsahib.io")));
 assert.ok(lesson.bibliography.some(s=>s.url.includes("pubmed.ncbi.nlm.nih.gov")));
 for(const s of lesson.bibliography)assert.match(s.url,/^https:\/\//);
});
test("The question interface is controlled and does not promise generative AI",()=>{
 assert.match(html,/does not improvise an AI answer/);
 assert.match(html,/processed on this device/);
 assert.match(app,/textContent/);
 assert.doesNotMatch(app,/innerHTML|eval\(|Function\(/);
 assert.match(app,/fetch\("\.\/lesson-17\.json"/);
 assert.doesNotMatch(app,/fetch\(\s*["']https?:|XMLHttpRequest|WebSocket|sendBeacon|OpenAI|anthropic/i);
 assert.match(app,/we have not authored a checked lesson/i);
});
test("Search and beginner/deep/optional comparison controls are accessible",()=>{
 for(const id of ["find-query","find-form","find-help","search-feedback","ashtpadi-select","ashtpadi-open","surprise","lesson-nav","lesson","lesson-heading","beginner-text","beginner-pa","advanced","comparison-list"])assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/role="search"/);
 assert.match(html,/aria-live="polite"/);
 assert.match(html,/lang="pa"/);
 assert.match(app,/aria-current/);
 assert.match(app,/event\.preventDefault\(\)/);
});
test("Phone-first, tablet and desktop with reduced-motion and print rules",()=>{
 assert.match(html,/name="viewport"/);
 assert.match(css,/@media\(max-width:720px\)/);
 assert.match(css,/@media\(max-width:1100px\)/);
 assert.match(css,/@media\(min-width:721px\) and \(max-width:890px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/@media print/);
 assert.match(css,/min-height:44px/);
});
test("No new user data collection, analytics, rank or gamification",()=>{
 const all=html+"\n"+app;
 assert.doesNotMatch(all,/localStorage\.|sessionStorage\.|indexedDB\.|navigator\.sendBeacon|google-analytics|hotjar|mixpanel/);
 assert.match(html,/No analytics, streaks, scores or outbound search/);
});
const summary={status:"PASS",total:checks.length,scope:"Source-linked editorial learning pilot only, not a human theological review or device verification",checks};
console.log(JSON.stringify(summary,null,2));
