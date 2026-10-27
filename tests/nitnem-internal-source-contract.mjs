/* Full Nitnem source-only internal beta: offline/reproducible source integrity.
 * No web access, no publication approval. Source candidate digest is pinned.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const read=p=>fs.readFileSync(path.join(root,p));
const payload=p=>JSON.parse(read(p).toString('utf-8'));
const lib=payload('nitnem/data/library.json');
const checks=[];const test=(name,fn)=>{fn();checks.push(name);};
const ids=['jaap','savaiye','chaupai','anand','rehras','sohila'];
const counts={jaap:[199,782],savaiye:[10,40],chaupai:[29,116],anand:[40,208],rehras:[44,159],sohila:[5,56]};
const pinned='373ccc34f4a1c0ccb6ce36654bf6e9574087200f';
const page=read('nitnem/index.html').toString();
const script=read('nitnem/reader.js').toString();
const sw=read('nitnem/sw.js').toString();
test('Original source manifest is the exact hard-pinned library version',()=>{
 assert.equal(sha(read('nitnem/data/library.json')),'b5865b293acc3ea91a20487dd82efd6f503d22dc5823bc2a67effcd146840d7a');
 assert.equal(lib.schema,'GLP-001-INTERNAL-NITNEM-REVIEW-V1');
 assert.equal(lib.sourceCommit,pinned);
 assert.deepEqual(Object.keys(lib.entries),ids);
});
test('All seven banis are represented, with original Japji as same-site link only',()=>{
 assert.equal((page.match(/class="bani-card"/g)||[]).length,7);
 assert.ok(page.includes('href="japji.html"'));
 assert.ok(!page.includes('href="https://'));
});
test('All six additional original-text assets are local and hash-pinned',()=>{
 for(const [id,entry] of Object.entries(lib.entries)){
  assert.equal(sha(read('nitnem/'+entry.path)),entry.sha256,id);
  assert.deepEqual([entry.units,entry.lines],counts[id]);
 }
});
test('All 1,361 additional Gurmukhi source rows preserve their original SHA-256 exactly',()=>{
 let sum=0;const allIDs=new Set();
 for(const id of ids){
  const entry=lib.entries[id],p=payload('nitnem/'+entry.path);
  assert.equal(p.compositionId,id);
  assert.equal(p.unitCount,counts[id][0]);
  assert.equal(p.originalLineCount,counts[id][1]);
  assert.equal(p.units.length,entry.units);
  assert.equal(p.sourceRepositoryCommit,pinned);
  assert.equal(p.humanCollationApproved,false);
  assert.equal(p.rightsCleared,false);
  let seen=0;
  for(const u of p.units)for(const line of u.lines){
   assert.equal(sha(line.text),line.sha256,line.id);
   assert.ok(!allIDs.has(line.id),'Duplicate across banis '+line.id);
   allIDs.add(line.id);
   assert.ok(/\p{Script=Gurmukhi}/u.test(line.text));
   if(line.family==='dasam')assert.ok(!('ang' in line.location));
   seen++;
  }
  assert.equal(seen,entry.lines);
  sum+=seen;
 }
 assert.equal(sum,1361);
});
test('Jaap exact 199 chhands / 782 originals and separate metrical headings are intact',()=>{
 const p=payload('nitnem/data/jaap.json');
 assert.equal(p.units.length,199);
 assert.equal(p.units.reduce((a,u)=>a+u.metricalHeadings.length,0),21);
 assert.equal(p.preface.length,6);
});
test('SGPC Rehras 44 units preserve mixed SGGS and Dasam provenance',()=>{
 const p=payload('nitnem/data/rehras.json');
 assert.deepEqual(p.sections.map(s=>s.id),['sggs-nine','chaupai-25','savaiya-pae-gahe','dohira-sagal-duar','anand-selected','mundawani-slok']);
 assert.deepEqual(p.sections.map(s=>s.units),[9,25,1,1,6,2]);
 assert.ok(p.units.some(u=>u.sourceFamily==='sggs'));
 assert.ok(p.units.some(u=>u.sourceFamily==='dasam'));
});
test('Rehras never contains the Anand Pauri24 unverified source glyph',()=>{
 const p=payload('nitnem/data/rehras.json');
 assert.ok(!p.units.flatMap(u=>u.lines).some(l=>l.id.includes('anand24')));
});
test('Anand Pauri 24 source line is explicit and withheld, not normalized',()=>{
 const p=payload('nitnem/data/anand.json');
 const hold=p.units.flatMap(u=>u.lines).filter(l=>l.held);
 assert.equal(hold.length,1);
 assert.equal(hold[0].id,'anand24.line03');
 assert.ok(hold[0].text.includes(String.fromCharCode(0xF03D)));
 assert.ok(script.includes('if(l.held)'));
 assert.ok(script.includes('if(nextLine.held)'));
});
test('The 29-pauri Chaupai source clearly names its site-specific unapproved variant',()=>{
 const p=payload('nitnem/data/chaupai.json');
 assert.equal(p.units.length,29);
 assert.ok(p.reference.includes('29-pauri'));
 assert.ok(p.reference.includes('NOT adjudicated'));
 assert.equal(p.humanCollationApproved,false);
});
test('Library has original Read, Meaning, Study controls but does not fabricate translations',()=>{
 assert.deepEqual([...page.matchAll(/<button[^>]+data-mode="([^"]+)"/g)].map(x=>x[1]),['read','meaning','study']);
 assert.ok(script.includes('DRAFT')&&script.includes('teachingCourse'));
 assert.ok(script.includes('L.unitLesson('));
 assert.ok(!page.includes('translation='));
});
test('Gurmukhi reader, word-guide and settings use the existing exact continuous core',()=>{
 assert.equal(sha(read('nitnem/continuous-core.js')),sha(read('js/continuous-core.js')));
 assert.ok(script.includes('const next=C.advance'));
 assert.ok(script.includes('C.flatten'));
 assert.ok(page.includes('id="size" min="24" max="60"'));
 assert.ok(page.includes('id="view-continuous"')&&page.includes('id="view-passage"'));
 assert.ok(script.includes("view:'continuous'")&&script.includes("state.view==='continuous'"));
 assert.ok(script.includes('updateScrolledLine')&&script.includes('lineNodes.get'));
 assert.ok(script.includes("if(nextLine.held)"));
});
test('Saved reading namespaces cannot collide with canonical Japji learning',()=>{
 assert.ok(script.includes('glp001.nitnem.PRIVATE-SOURCE-REVIEW.v1.'));
 assert.ok(!script.includes('localStorage.setItem("glp001.continuous.v2"'));
});
test('Internal page contains zero third-party scripture links or remote script sources',()=>{
 const refs=[...page.matchAll(/(?:src|href)="([^"]+)"/g)].map(x=>x[1]);
 assert.ok(refs.every(x=>!/^https?:\/\//.test(x)),refs);
 assert.ok(page.includes("connect-src 'self'"));
 assert.ok(!/<iframe\b/i.test(page));
});
test('Scoped second service worker does not replace or delete Japji root cache',()=>{
 assert.equal(sha(read('nitnem/sw.js')),'2751987693557a341b393dbc1deea60f99b74f12823d9e5a26e4612fcfbe9e04');
 assert.ok(sw.includes('glp-nitnem-source-review:'));
 assert.ok(!sw.includes('glp-static:'));
 assert.ok(sw.includes('new URL("./",self.location.href)'));
 assert.ok(!sw.includes('self.skipWaiting()')||sw.includes('ACTIVATE_PRIVATE_NITNEM_UPDATE'));
});
test('Cache manifest covers all six data JSON assets and exact 11 QA app files',()=>{
 const m=sw.match(/^const EXPECTED=(\{[^\n]+\});/m);
 assert.ok(m);
 const expected=JSON.parse(m[1]);
 assert.equal(Object.keys(expected).length,31);
 assert.ok(expected['./trust/index.html']);
 assert.ok(expected['./trust/corrections.html']);
 assert.ok(expected['./trust/trust.css']);
 assert.ok(expected['./learning/course.v1.json']);
 assert.ok(expected['./learning/learning-ui.js']);
 for(const [file,hash] of Object.entries(expected)){
  assert.equal(sha(read('nitnem/'+file.slice(2))),hash);
 }
});
test('Source approval, permissions, and family production release remain explicitly prohibited',()=>{
 assert.equal(lib.familyReady,false);
 assert.equal(lib.sourceCleared,false);
 assert.ok(page.includes('not completed independent scripture-edition'));
 assert.ok(!page.includes('releaseApproved=true'));
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,cases:checks,sourceRecords:1361,internalBanis:7,
 originalSourceApproval:'PENDING',publicFamilyPublished:false},null,2));
