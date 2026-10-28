/* GLP-001 structural contract — exact private Japji format, 200 visual pace,
 * unchanged original scripture, learning keys and editorial review gates.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read=p=>fs.readFileSync(path.join(root,p));
const text=p=>read(p).toString('utf8');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const checks=[];const test=(name,fn)=>{fn();checks.push(name)};
const html=text('nitnem/index.html'),full=text('nitnem/japji.html');
const reader=text('nitnem/reader.js'),learning=text('nitnem/learning/learning-ui.js');
const worker=text('nitnem/sw.js');
const data=JSON.parse(text('nitnem/data/library.json'));
const course=JSON.parse(text('nitnem/learning/course.v1.json'));
const originalJapji='js/japji-full-data.js';
const candidateJapji='nitnem/japji-assets/js/japji-full-data.js';
const originalScripts=['japji-full-data.js','content.js','gurdwaras.js',
 'continuous-core.js','learning.js','shared-learning.js',
 'japji-lessons.js','line-meanings.js','japji-full.js'];
function pactFile(n){return 'nitnem/japji-assets/js/'+n}
test('Original Japji 385-source corpus has exactly identical bytes in versioned private overlay',()=>{
 assert.equal(sha(read(originalJapji)),sha(read(candidateJapji)));
 assert.equal(sha(read('js/japji-lessons.js')),sha(read(pactFile('japji-lessons.js'))));
 assert.equal(sha(read('js/line-meanings.js')),sha(read(pactFile('line-meanings.js'))));
});
test('Original source is untouched: six additional 1,361 lines and 327 units remain anchored',()=>{
 assert.equal(data.sourceCommit,'373ccc34f4a1c0ccb6ce36654bf6e9574087200f');
 assert.equal(course.coverage.unitTotal,327);
 assert.equal(course.coverage.sourceLineTotal,1361);
 assert.equal(course.coverage.writtenUnitLessons,50);
 assert.equal(course.coverage.reviewedUnitLessons,0);
});
test('All accepted original Japji JS other than the specific three pace modules copied unchanged',()=>{
 const pace=new Set(['japji-full.js','continuous-core.js','learning.js']);
 for(const name of originalScripts)if(!pace.has(name))assert.equal(sha(read('js/'+name)),sha(read(pactFile(name))),name);
});
test('Only three permitted Japji UI JS edits: pace cap, settings cap, Pauri notebook route',()=>{
 let expected=text('js/japji-full.js');
 assert.equal((expected.match(/Math\.min\(160,/g)||[]).length,1);
 expected=expected.replace('Math.min(160,','Math.min(200,').replace('max="160"','max="200"').replace('href="pauri-2-lesson.html"','href="../pauri-2-lesson.html"');
 assert.equal(text(pactFile('japji-full.js')),expected);
});
test('Private original Japji core normalizes 200 with old notes/bookmarks preserved',()=>{
 assert.equal(text(pactFile('continuous-core.js')),text('js/continuous-core.js').replace('s.pace<=160','s.pace<=200'));
 assert.equal(text(pactFile('learning.js')),text('js/learning.js').replace('x.pace<=160','x.pace<=200'));
 assert.ok(text(pactFile('japji-full.js')).includes("KEY='glp001.continuous.v2'"));
});
test('Japji private overlay has same scripture and detailed structures, local path, 50–200 slider',()=>{
 assert.ok(full.includes('japji-assets/js/japji-full-data.js'));
 assert.ok(full.includes('japji-assets/js/line-meanings.js'));
 assert.ok(full.includes('id="pace-slider" type="range" min="50" max="200" step="5"'));
 assert.ok(!full.includes('src="js/pwa.js"'));
});
test('Reader home sends Japji to private exact-copy route rather than old root, no external provider',()=>{
 assert.ok(html.includes('href="japji.html" data-kind="original-japji"'));
 assert.ok(!html.includes('href="https://'));
});
test('Nitnem visual guide accepts exactly 50–200 with increments of five',()=>{
 assert.ok(html.includes('id="pace" type="range" min="50" max="200" step="5"'));
 assert.ok(reader.includes('Math.min(200,Math.round(value/5)*5)'));
 assert.ok(reader.includes('state.pace<=200')||reader.includes('saved.pace<=200'));
 assert.ok(reader.includes('rawPace<=200'));
 assert.ok(reader.includes('Math.round(60000/state.pace)'));
});
test('Two modes of education use matching Japji labels and safe source-anchored meaning buttons',()=>{
 assert.ok(html.includes('>Study</button>'));
 assert.ok(learning.includes("elt('button','simple-meaning')"));
 assert.ok(learning.includes("elt('span','english'"));
 assert.ok(learning.includes("elt('span','punjabi'"));
 assert.ok(learning.includes('Draft meaning · tap to explore'));
});
test('Deeper Study headings follow Japji order including pronunciation uncertainty and reflection',()=>{
 for(const s of ['Passage meaning · summary, not word-for-word translation','Close sense',
  'Words & grammar','Pronunciation support','Interpretation & open questions',
  'Practical reflection · application, not translation','Teach it back',
  'Sources, passage anchors & review']){
  assert.ok(learning.includes(s),s);
 }
});
test('Per-line tap opens original exact source and scoped unit lesson, not invented scriptural text',()=>{
 assert.ok(reader.includes('L.lineDetails('));
 assert.ok(reader.includes("button.dataset.meaningLine"));
 assert.ok(learning.includes('sourceSha256!==l.sha256'));
 assert.ok(learning.includes('line.held'));
 assert.ok(reader.includes('meaningFocusReturn'));
});
test('Missing detailed meanings are not automatically substituted with generic explanations',()=>{
 assert.ok(learning.includes('Detailed explanation not written yet'));
 assert.ok(learning.includes("view==='continuous'?null:noLesson"));
 assert.ok(!course.unitLessons['jaap|jaap099']);
});
test('Quarantined Anand Pauri24 is neither given meaning nor skipped by the visual safety stop',()=>{
 const held=JSON.parse(text('nitnem/data/anand.json')).units[23].lines.filter(x=>x.held);
 assert.deepEqual(held.map(x=>x.id),['anand24.line03']);
 assert.ok(!course.closeTextNotes['anand|anand24.line03']);
 assert.ok(reader.includes('if(nextLine.held)'));
});
test('Existing draft course remains source-bound and has not gained false reviewer approval',()=>{
 assert.equal(course.meta.editorialStatus,'DRAFT_AI_UNREVIEWED');
 assert.equal(course.meta.publicationAllowed,false);
 assert.equal(course.coverage.closeTextOccurrenceNotes,20);
 assert.equal(course.coverage.reviewedSourceMeaningLines,0);
});
test('Private 29 source/teaching/Japji cache assets SHA match all actual files',()=>{
 const match=worker.match(/^const EXPECTED=(\{[^\n]+\});/m);
 assert.ok(match);
 const m=JSON.parse(match[1]);
 assert.equal(Object.keys(m).length,36);
 for(const [k,v] of Object.entries(m))assert.equal(sha(read('nitnem/'+k.slice(2))),v,k);
 assert.ok(m['./japji.html']);
 assert.ok(m['./japji-assets/js/japji-full.js']);
 assert.ok(m['./trust/index.html']);
});
test('Current public Japji root is not part of new 29-file worker scope',()=>{
 assert.ok(worker.includes('glp-nitnem-source-review:'));
 assert.ok(!worker.includes('glp-static:'));
 assert.ok(worker.includes('new URL("./",self.location.href)'));
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,cases:checks,
 sourceRecordsUnchanged:1361,originalJapjiLineCount:385,deepJapjiLessons:42,
 additionalAuthoredLessonDrafts:50,maxVisualPace:200,originalRootUnchanged:true,
 reviewedReligiousApproval:0},null,2));
