// Independent source, coverage, preservation and release-integrity assertions.
// Run only after course.complete.json and the release hashes are integrated.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const read = name => fs.readFileSync(new URL(name, root));
const json = name => JSON.parse(read(name));
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const canonical = value => Array.isArray(value)
  ? '[' + value.map(canonical).join(',') + ']'
  : value && typeof value === 'object'
    ? '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}'
    : JSON.stringify(value);
const recordHash = value => sha(canonical(value));
const present = value => typeof value === 'string' && value.trim().length > 2;
const pa = value => present(value) && /\p{Script=Gurmukhi}/u.test(value);
const normalCounter = value => value.replace(/॥[੦-੯]+॥$/u, '॥');
const research = 'research/nitnem/20261125/';
const names = ['jaap', 'savaiye', 'chaupai', 'anand', 'rehras', 'sohila'];
const totals = {jaap:[199,782],savaiye:[10,40],chaupai:[29,116],anand:[40,208],rehras:[44,159],sohila:[5,56]};
const course = json('nitnem/learning/course.complete.json');
const manifest = json('nitnem/data/library.json');
const baseline = json(research + 'previous-entry-hashes.json');
const amendments = json(research + 'source-amendments.json');
const editorial = json(research + 'editorial-amendments.json');
const boundaries = json(research + 'unit-boundaries.json');
const proposals = json(research + 'proposed-source-manifest.json');
const angMapping = json(research + 'rehras-sggs-ang-mapping.json');
const packs = Object.fromEntries(names.map(name => [name, json('nitnem/data/' + name + '.json')]));
const sourceLines = new Map(), sourceUnits = new Map(), checks = [];
for (const [name, pack] of Object.entries(packs)) for (const unit of pack.units) {
  assert.ok(!sourceUnits.has(name + '|' + unit.id), 'Repeated source unit key');
  sourceUnits.set(name + '|' + unit.id, unit);
  for (const line of unit.lines) {
    assert.ok(!sourceLines.has(name + '|' + line.id), 'Repeated source occurrence key');
    sourceLines.set(name + '|' + line.id, line);
  }
}
const sourceChanges = new Map(amendments.map(a => [a.compositionId + '|' + a.id, a]));
const changedEntries = new Map();
for (const a of editorial) {
  assert.ok(['meaning','study'].includes(a.type), 'Editorial amendment has an explicit entry type');
  const id = a.type + '|' + a.key;
  assert.ok(!changedEntries.has(id), 'One exact before/after object per changed entry: ' + id);
  changedEntries.set(id, a);
}
function test(name, fn) {
  fn();
  checks.push({name, status:'PASS'});
}

test('The immutable V16 entry-hash baseline remains intact', () => {
  assert.equal(sha(read(research + 'previous-entry-hashes.json')), '92e96b593c59a70b781987f3f5ca2a79316e13fe7e46ac3fb8f700cdd9e1b6bf');
  assert.equal(baseline.sourceCourseSHA256, '61aad9f2c2642d975747368616a3b47cab26306f66384d50ab6e7b0f3c7c09ed');
  assert.equal(Object.keys(baseline.meanings).length, 1039);
  assert.equal(Object.keys(baseline.studies).length, 247);
  assert.deepEqual(Object.keys(baseline.source).sort(), names.slice().sort());
});

test('Six additional banis retain all 327 units and 1,361 source IDs in their original order', () => {
  assert.deepEqual(Object.keys(manifest.entries).sort(), names.slice().sort());
  assert.equal(sourceUnits.size, 327);
  assert.equal(sourceLines.size, 1361);
  for (const name of names) {
    const pack = packs[name], [units, lines] = totals[name], old = baseline.source[name];
    assert.equal(pack.compositionId, name);
    assert.equal(pack.units.length, units);
    assert.equal(pack.unitCount, units);
    assert.equal(pack.units.flatMap(u => u.lines).length, lines);
    assert.equal(pack.originalLineCount, lines);
    assert.equal(manifest.entries[name].units, units);
    assert.equal(manifest.entries[name].lines, lines);
    assert.deepEqual(pack.units.map(u => u.id), old.units.map(u => u.id), name + ' unit order');
    for (let i=0;i<units;i++) assert.deepEqual(pack.units[i].lines.map(l => l.id), old.units[i].lines.map(l => l.id), name + ' line order');
    assert.ok(pack.previousEditionIds.includes(old.editionId), name + ' preserves prior learning-edition identity');
  }
});

test('All source characters, hashes and sequence changes match the independently documented amendments', () => {
  assert.equal(amendments.length, 12);
  assert.equal(sourceChanges.size, 12);
  const observed = [];
  for (const [name, pack] of Object.entries(packs)) {
    for (const p of pack.preface || []) assert.equal(sha(p.text), p.sha256, name + ' preface');
    for (const unit of pack.units) {
      for (const h of unit.metricalHeadings || []) assert.equal(sha(h.text), h.sha256, unit.id + ' heading');
      const priorUnit = baseline.source[name].units.find(u => u.id === unit.id);
      for (const line of unit.lines) {
        const key = name + '|' + line.id, old = priorUnit.lines.find(l => l.id === line.id), amendment = sourceChanges.get(key);
        assert.equal(sha(line.text), line.sha256, key);
        assert.equal(line.held, false, key);
        assert.ok(!/[\uFFFD\uE000-\uF8FF]/u.test(line.text), key + ' contains unresolved source character');
        assert.ok(!('translation' in line) && !('simpleEn' in line) && !('meaning' in line), key + ' keeps source separate');
        if (amendment) {
          observed.push(key);
          assert.equal(old.sha256, amendment.oldSha256, key + ' prior source');
          assert.equal(sha(amendment.oldText), amendment.oldSha256);
          assert.equal(line.text, amendment.newText, key + ' amended original');
          assert.equal(line.sha256, amendment.newSha256);
          assert.ok(present(amendment.reason));
        } else assert.equal(line.sha256, old.sha256, key + ' changed without source evidence');
      }
    }
    const sequence = sha(pack.units.flatMap(u => u.lines.map(l => l.text)).join('\n'));
    assert.equal(sequence, proposals.files.find(p => p.compositionId === name).textSequenceSha256, name + ' independent sequence evidence');
    assert.equal(sequence, pack.sourceAudit.exactTextSequenceSha256, name + ' runtime sequence');
  }
  assert.deepEqual(observed.sort(), [...sourceChanges.keys()].sort());
});

test('Independent unit-boundary records agree with every first and last source occurrence', () => {
  assert.equal(boundaries.length, 327);
  const keys = new Set();
  for (const b of boundaries) {
    const key = b.compositionId + '|' + b.unitId, u = sourceUnits.get(key);
    assert.ok(u && !keys.has(key), key);
    keys.add(key);
    assert.equal(u.lines.length, b.sourceRecordCount, key);
    assert.deepEqual([u.lines[0].id,u.lines[0].text,u.lines[0].sha256], [b.firstId,b.firstText,b.firstSha256], key + ' first');
    assert.deepEqual([u.lines.at(-1).id,u.lines.at(-1).text,u.lines.at(-1).sha256], [b.lastId,b.lastText,b.lastSha256], key + ' last');
  }
});

test('Jaap has exactly 199 numbered chhands and closes at its documented terminal line', () => {
  assert.deepEqual(packs.jaap.units.map(u => u.id), Array.from({length:199},(_,i) => 'jaap' + String(i+1).padStart(3,'0')));
  const terminal = packs.jaap.units.at(-1).lines.at(-1);
  assert.equal(terminal.id, 'jaap199.line04');
  assert.equal(terminal.text, 'ਸਦਾ ਅੰਗ ਸੰਗੇ ਅਭੰਗੰ ਬਿਭੂਤੇ ॥੧੯੯॥');
  assert.equal(terminal.sha256, 'fcdb4cb8ca6853f5b6af20d8dc55b93dfb693c2888debe0370a3d7e2813b3f2b');
  assert.ok(!sourceUnits.has('jaap|jaap200'));
});

test('Jaap 62 requires tera jor before the Chachari heading and preserves the remaining line order', () => {
  const u = sourceUnits.get('jaap|jaap062');
  assert.equal(u.lines[0].text, 'ਤੇਰਾ ਜੋਰੁ ॥');
  assert.equal(u.metricalHeadings[0].text, 'ਚਾਚਰੀ ਛੰਦ ॥');
  assert.deepEqual(u.sourceDisplayOrder, [
    {kind:'line',id:'jaap062.line01'}, {kind:'metricalHeading',index:0},
    ...[2,3,4,5].map(n => ({kind:'line',id:'jaap062.line' + String(n).padStart(2,'0')}))
  ]);
  for (const [key, unit] of sourceUnits) if (unit.sourceDisplayOrder) {
    assert.deepEqual(unit.sourceDisplayOrder.filter(x => x.kind==='line').map(x => x.id), unit.lines.map(x => x.id), key);
    assert.deepEqual(unit.sourceDisplayOrder.filter(x => x.kind==='metricalHeading').map(x => x.index), (unit.metricalHeadings || []).map((_,i) => i), key);
    assert.equal(unit.sourceDisplayOrder.length, unit.lines.length + (unit.metricalHeadings || []).length, key);
  }
});

test('Anand has all 40 pauris and the six-record Pauri 24 is repaired and fully released from its hold', () => {
  assert.deepEqual(packs.anand.units.map(u => u.id), Array.from({length:40},(_,i) => 'anand' + String(i+1).padStart(2,'0')));
  const u = sourceUnits.get('anand|anand24');
  assert.equal(u.lines.length, 6);
  assert.ok(u.lines.every(l => l.held===false && l.location.ang===920));
  assert.equal(u.lines[2].text, 'ਕਹਦੇ ਕਚੇ ਸੁਣਦੇ ਕਚੇ ਕਚਂੀ ਆਖਿ ਵਖਾਣੀ ॥');
  assert.equal(u.lines[2].sha256, 'afc775a4bdd3a1e45ac64fb748605048d56ecb2a70d021dd9886e8a49a897673');
  assert.ok(!/quarantin|withheld|unresolved|held for/i.test(packs.anand.caveat));
});

test('Chaupai clearly separates its 25 core groups from four selected closing groups', () => {
  assert.deepEqual(packs.chaupai.units.slice(0,25).map(u => u.id), Array.from({length:25},(_,i) => 'chaupai-rehras' + String(i+1).padStart(2,'0')));
  assert.deepEqual(packs.chaupai.units.slice(25).map(u => u.id), [26,27,28,29].map(n => 'chaupai-long'+n));
  assert.ok(packs.chaupai.units.slice(25).every(u => /extended/i.test(u.title)));
  assert.match(packs.chaupai.reference, /25/);
  assert.match(packs.chaupai.reference, /four|4/i);
  assert.equal(packs.rehras.units.filter(u => u.componentId==='chaupai-25').length,25);
  assert.ok(!packs.rehras.units.some(u => /chaupai(?:-long)?(?:26|27|28|29)$/.test(u.id)));
});

test('Rehras preserves the six-section sequence and its distinct morning/evening source boundaries', () => {
  const expected = [['sggs-nine','sggs',9],['chaupai-25','dasam',25],['savaiya-pae-gahe','dasam',1],['dohira-sagal-duar','dasam',1],['anand-selected','sggs',6],['mundawani-slok','sggs',2]];
  assert.deepEqual(packs.rehras.sections.map(s => [s.id,s.sourceFamily,s.units]), expected);
  assert.deepEqual(packs.rehras.units.map(u => u.componentId), expected.flatMap(([id,,n]) => Array(n).fill(id)));
  assert.deepEqual(packs.rehras.units.filter(u => u.componentId==='anand-selected').map(u => u.id), [1,2,3,4,5,40].map(n => 'rehras.anand'+String(n).padStart(2,'0')));
  assert.deepEqual(packs.rehras.units.slice(-2).map(u => u.id), ['rehras.mundawani','rehras.slok']);
  assert.notEqual(packs.savaiye.originalCompositionId, packs.rehras.originalCompositionId);
  assert.ok(sourceUnits.has('rehras|rehras.savaiya01') && sourceUnits.has('rehras|rehras.dohira01'));
});

test('SGGS records carry exact Ang mappings and Dasam records never borrow an SGGS Ang', () => {
  let sggs=0, dasam=0;
  for (const [key, l] of sourceLines) {
    if (l.family==='sggs') {
      sggs++;
      assert.equal(l.location.system,'ang',key);
      assert.ok(Number.isInteger(l.location.ang) && l.location.ang>=1 && l.location.ang<=1430,key);
      if (l.location.angs) {
        assert.ok(l.location.angs.every(a => Number.isInteger(a)&&a>=1&&a<=1430),key);
        assert.equal(l.location.ang,l.location.angs[0],key);
        assert.equal(l.location.angEnd,l.location.angs.at(-1),key);
      }
    } else {
      dasam++;
      assert.equal(l.family,'dasam',key);
      assert.equal(l.location.system,'dasam_section',key);
      for (const field of ['ang','angEnd','angs','angRange']) assert.ok(!(field in l.location),key+' false SGGS locator');
    }
  }
  assert.equal(sggs,321);
  assert.equal(dasam,1040);
  assert.deepEqual([...new Set(packs.anand.units.flatMap(u=>u.lines.map(l=>l.location.ang)))],[917,918,919,920,921,922]);
  assert.deepEqual([...new Set(packs.sohila.units.flatMap(u=>u.lines.map(l=>l.location.ang)))],[12,13]);
  assert.equal(angMapping.rows.length,57);
  for (const row of angMapping.rows) {
    const l=sourceLines.get('rehras|'+row.id);
    assert.equal(l.sha256,row.textSha256,row.id);
    assert.deepEqual(l.location,row.location,row.id);
  }
});

test('Every original source record has a bound bilingual meaning and every unit a complete study', () => {
  assert.deepEqual(Object.keys(course.closeTextNotes).sort(),[...sourceLines.keys()].sort());
  assert.deepEqual(Object.keys(course.unitLessons).sort(),[...sourceUnits.keys()].sort());
  for (const [key,l] of sourceLines) {
    const n=course.closeTextNotes[key];
    assert.equal(n.lineId,l.id,key);
    assert.equal(n.sourceSha256,l.sha256,key);
    assert.equal(n.status,'DRAFT_AI_UNREVIEWED',key);
    assert.ok(present(n.simpleEn)&&pa(n.simplePa)&&present(n.interpretiveCaution),key);
    assert.ok(!/^(pending|todo|tbd|translation pending)$/i.test(n.simpleEn.trim()),key);
  }
  for (const [key,u] of sourceUnits) {
    const l=course.unitLessons[key];
    assert.equal(l.unitId,u.id,key);
    assert.equal(l.status,'DRAFT_AI_UNREVIEWED',key);
    assert.ok(u.lines.some(s=>s.id===l.sourceAnchor.id&&s.sha256===l.sourceAnchor.sha256),key+' source anchor');
    assert.ok(present(l.simple.en)&&pa(l.simple.pa),key+' bilingual summary');
    for (const f of ['focus','closeReading','interpretationCare','reflection','teachBack']) assert.ok(present(l.study[f]),key+' '+f);
    assert.ok(l.study.words.length>=2,key+' vocabulary');
  }
});

test('Exactly 322 meanings and 80 studies are added; all 80 new studies have substantial Punjabi detail', () => {
  const addedMeanings=Object.keys(course.closeTextNotes).filter(k=>!(k in baseline.meanings));
  const addedStudies=Object.keys(course.unitLessons).filter(k=>!(k in baseline.studies));
  const expectedStudies=[...Array.from({length:79},(_,i)=>'jaap|jaap'+(i+121)),'anand|anand24'];
  assert.equal(addedMeanings.length,322);
  assert.deepEqual(addedStudies.sort(),expectedStudies.sort());
  for (const key of addedStudies) {
    const l=course.unitLessons[key],u=sourceUnits.get(key);
    for (const f of ['focusPa','closeReadingPa','interpretationCarePa','reflectionPa','teachBackPa']) assert.ok(pa(l.study[f]),key+' '+f);
    assert.ok(l.study.closeReading.split(/\s+/).length>=40,key+' substantive English close reading');
    assert.ok(l.study.closeReadingPa.split(/\s+/).length>=30,key+' substantive Punjabi close reading');
    assert.ok(Array.isArray(l.sourceKeys)&&l.sourceKeys.length,key+' exact reference keys');
    for (const w of l.study.words) {
      assert.ok(pa(w.workingGlossPa)&&present(w.workingGloss),key+' bilingual vocabulary');
      assert.ok(u.lines.some(s=>s.text.includes(w.gurmukhi)),key+' vocabulary belongs to the source');
    }
  }
  assert.equal(course.coverage.sourceLineTotal,1361);
  assert.equal(course.coverage.unitTotal,327);
  assert.equal(course.coverage.closeTextOccurrenceNotes,1361);
  assert.equal(course.coverage.writtenUnitLessons,327);
  for (const name of names) {
    assert.equal(course.coverage.byBani[name].firstLineNotes,totals[name][1]);
    assert.equal(course.coverage.byBani[name].draftLessons,totals[name][0]);
  }
});

test('The previous 1,039 meanings and 247 studies change only through exact documented before/after entries', () => {
  const used=new Set();
  for (const [type,prior,current] of [['meaning',baseline.meanings,course.closeTextNotes],['study',baseline.studies,course.unitLessons]]) {
    for (const [key,digest] of Object.entries(prior)) {
      assert.ok(current[key],type+' disappeared: '+key);
      const id=type+'|'+key,change=changedEntries.get(id);
      if (recordHash(current[key])===digest) {
        assert.ok(!change,id+' has a redundant amendment');
      } else {
        assert.ok(change,id+' changed without a complete editorial record');
        assert.equal(recordHash(change.before),digest,id+' before must match immutable V16');
        assert.deepEqual(change.after,current[key],id+' after must equal the actual release entry');
        assert.ok(present(change.reason)&&change.review,id+' reason and review');
        used.add(id);
      }
    }
  }
  assert.deepEqual([...used].sort(),[...changedEntries.keys()].sort(),'No unexplained or unused editorial exception');
});

test('Exact-source reuse keeps provenance bound to the repaired origin and destination', () => {
  let reusedNotes=0,reusedStudies=0;
  for (const [key,n] of Object.entries(course.closeTextNotes)) if (n.provenance?.method==='EXACT_SOURCE_TEXT_AND_SHA_REUSE') {
    reusedNotes++;
    const p=n.provenance,from=sourceLines.get(p.bani+'|'+p.id),to=sourceLines.get(key);
    assert.ok(from&&to,key);
    assert.equal(from.text,to.text,key+' source text');
    assert.equal(from.family,to.family,key+' source family');
    assert.equal(p.sourceSha256,from.sha256,key+' origin hash');
    assert.equal(n.sourceSha256,to.sha256,key+' destination hash');
  }
  for (const [key,l] of Object.entries(course.unitLessons)) if (l.provenance?.method==='EXACT_SOURCE_TEXT_AND_SHA_REUSE') {
    reusedStudies++;
    const p=l.provenance,from=sourceUnits.get(p.bani+'|'+p.id),to=sourceUnits.get(key);
    assert.ok(from&&to,key);
    assert.deepEqual(from.lines.map(x=>x.text),to.lines.map(x=>x.text),key+' whole source passage');
    assert.equal(p.sourceSha256,from.lines[0].sha256,key+' origin anchor');
    assert.equal(l.sourceAnchor.sha256,to.lines[0].sha256,key+' destination anchor');
  }
  assert.equal(reusedNotes,130);
  assert.equal(reusedStudies,28);
  const repeats=[...(course.candidateV15Reuse||[]),...(course.candidateV16Reuse||[]),...(course.completionReuse||[])];
  assert.ok(Array.isArray(course.completionReuse)&&course.completionReuse.length>=28,'New reuse is explicit');
  for (const r of repeats) {
    const from=sourceLines.get(r.from),to=sourceLines.get(r.to);
    assert.ok(from&&to,r.to+' repeat endpoints');
    assert.equal(normalCounter(from.text),normalCounter(to.text),r.to+' permits only terminal counter differences');
    for (const f of r.fields) assert.equal(course.closeTextNotes[r.from][f],course.closeTextNotes[r.to][f],r.to+' '+f);
  }
});

test('Every cited reference and new metrical heading resolves to actual retained evidence', () => {
  const refs=new Map(course.meta.references.map(r=>[r.key,r]));
  assert.equal(refs.size,course.meta.references.length,'Reference keys are unique');
  for (const [key,l] of Object.entries(course.unitLessons)) for (const ref of l.sourceKeys||[]) assert.ok(refs.has(ref),key+' unknown reference '+ref);
  for (const c of course.sourceChecks||[]) {
    for (const ref of c.referenceKeys||[]) assert.ok(refs.has(ref),'Unknown source-check reference '+ref);
    assert.equal(c.humanReviewed,false,'A model check is not qualified human approval');
  }
  assert.ok(Object.keys(course.headingNotes||{}).length>=4,'New metre transitions have explanatory notes');
  for (const [key,h] of Object.entries(course.headingNotes)) {
    const u=sourceUnits.get('jaap|'+h.unitId);
    assert.ok(u?.metricalHeadings.some(x=>x.sha256===h.headingSha256),key+' heading anchor');
    assert.ok(present(h.simpleEn)&&pa(h.simplePa)&&present(h.interpretiveCaution),key+' bilingual heading');
  }
});

test('Publication and review labels distinguish source checks, model drafts and qualified human review', () => {
  assert.equal(manifest.qualifiedHumanReviewed,false);
  assert.equal(manifest.releaseStatus,'PUBLIC_EDUCATIONAL_DRAFT');
  assert.equal(course.meta.editorialStatus,'DRAFT_AI_UNREVIEWED');
  assert.equal(course.coverage.reviewedSourceMeaningLines,0);
  assert.equal(course.coverage.reviewedUnitLessons,0);
  assert.equal(course.meta.reviewer,null);
  for (const [name,p] of Object.entries(packs)) {
    assert.equal(p.humanCollationApproved,false,name);
    assert.equal(p.translationApproved,false,name);
    assert.equal(p.sourceAudit.qualifiedHumanReviewCount,0,name);
    assert.equal(p.sourceAudit.modernTranslationsImported,false,name);
    assert.equal(p.publicationStatus,'EDUCATIONAL_DRAFT',name);
  }
});

test('The manifest, complete course, reader pins and offline assets agree byte for byte', () => {
  const manifestSHA=sha(read('nitnem/data/library.json')),courseSHA=sha(read('nitnem/learning/course.complete.json'));
  for (const [name,e] of Object.entries(manifest.entries)) {
    assert.equal(sha(read('nitnem/'+e.path)),e.sha256,name+' entry manifest');
    assert.equal(packs[name].editionId,e.editionId,name);
  }
  assert.equal(course.meta.boundManifestSHA256,manifestSHA);
  const reader=read('nitnem/reader.js').toString();
  assert.equal(reader.match(/const EXPECTED_LIBRARY=['"]([a-f0-9]{64})['"]/)[1],manifestSHA);
  assert.equal(reader.match(/const EXPECTED_LEARNING=['"]([a-f0-9]{64})['"]/)[1],courseSHA);
  const worker=read('sw.js').toString(),expected=JSON.parse(worker.match(/const EXPECTED=(\{[^\n]+\});/)[1]);
  const required=['./nitnem/','./nitnem/index.html','./nitnem/reader.js','./nitnem/reader.css','./nitnem/local-learning.js','./nitnem/offline.js','./nitnem/learning/learning-ui.js','./nitnem/learning/course.complete.json','./nitnem/data/library.json',...names.map(n=>'./nitnem/data/'+n+'.json')];
  for (const name of required) assert.ok(expected[name],name+' offline coverage');
  for (const [name,digest] of Object.entries(expected)) {
    assert.ok(name.startsWith('./')&&!name.includes('..')&&!name.includes('\\'),name);
    assert.equal(sha(read(name.endsWith('/')?name+'index.html':name)),digest,name+' offline hash');
  }
  const japji=new URL(manifest.canonicalJapji,new URL('nitnem/',root));
  assert.equal(japji.href,new URL('full-japji.html',root).href);
  assert.ok(fs.existsSync(japji),'Seventh bani resolves to the preserved Japji reader');
});

test('Published source and teaching are unchanged; explicitly recorded runtime amendments form a continuous chain', () => {
  const frozen=json('evidence/nitnem-prior-runtime-baseline.json');
  assert.equal(sha(read('evidence/nitnem-prior-runtime-baseline.json')),'aa94396a6b6c773661c5ab261e537c580e2fd68385b4fc3324cc5991aabdb1fb','The original baseline itself is immutable');
  assert.equal(frozen.commit,'41194b8d135e511d6d3af499e7906562437a55e2');
  const ledger=json('evidence/claude-review-runtime-amendments.json');
  assert.equal(sha(read('evidence/claude-review-runtime-amendments.json')),'d0ba2af3b1200b4cc7ccca9c487aca29a702139e4474b2d640920aa43fea6833','The first runtime ledger is immutable');
  assert.equal(ledger.sourceBaseline,frozen.commit);
  assert.equal(ledger.changeBaseline,'a3476ac4b9be90dde350fb35dd13ce0b672c120d');
  assert.equal(ledger.claudeReviewCommit,'ffd3d179a16c9c656905dcedce34a080ffee54ff');
  assert.deepEqual(Object.keys(ledger.amendments).sort(),['full-japji.html','js/japji-full.js','js/sukhmani-reader.js','sukhmani.html']);
  const followup=json('evidence/claude-review-runtime-followup-amendments.json');
  assert.equal(sha(read('evidence/claude-review-runtime-followup-amendments.json')),'160e3a6e1d64e6b94558c30ccebae2fe1f82bb52c14a4791c6722cbfb5429829','The follow-up runtime ledger is immutable');
  assert.equal(followup.changeBaseline,'09e829efd63e99fc5c3f5f849f122a49b0dc22a9');
  assert.equal(followup.priorLedgerSHA256,sha(read('evidence/claude-review-runtime-amendments.json')));
  assert.deepEqual(Object.keys(followup.amendments).sort(),['js/japji-full.js','js/sukhmani-reader.js']);
  const historyRepair=json('evidence/learning-practice/runtime-amendments.json');
  assert.equal(sha(read('evidence/learning-practice/runtime-amendments.json')),'6e85863ac1bef301e7c7c2428018ea493b07c4b44bd48f73f333abffef47aa75','The history-repair ledger is immutable');
  assert.equal(historyRepair.changeBaseline,'792afa209c98bb53f257a8dfd5500bef10bfc8e3');
  assert.equal(historyRepair.priorLedgerSHA256,sha(read('evidence/claude-review-runtime-followup-amendments.json')));
  assert.deepEqual(Object.keys(historyRepair.amendments),['js/japji-full.js']);
  assert.equal(historyRepair.scriptureChanges,false);
  assert.equal(historyRepair.independentApproval,false);
  // PR56 already changed Saved-entry handling. Append its frozen receipt instead
  // of rewriting a prior ledger or charging those changes to this repair.
  const parentPath='evidence/reader-reliability/library-parent-amendments.json';
  assert.equal(sha(read(parentPath)),'550d79ed70ecec88b1434dc19fe37ab01e1c70a890b9888114f4fa02693a860a','The retrospective frozen-parent receipt is immutable');
  const libraryParent=json(parentPath);
  assert.equal(libraryParent.schema,'glp001.runtime-parent-amendments.v1');
  assert.equal(libraryParent.status,'RETROSPECTIVE_BUILDER_RECORD_NOT_APPROVAL');
  assert.equal(libraryParent.changeBaseline,'8917beaab7acc5770cb5a8fee682c9702a0689cb');
  assert.equal(libraryParent.frozenParentCommit,'389e79baff4016a2ff61d1851908de0bd66beb8f');
  assert.equal(libraryParent.priorLedgerPath,'evidence/learning-practice/runtime-amendments.json');
  assert.equal(libraryParent.priorLedgerSHA256,sha(read(libraryParent.priorLedgerPath)));
  assert.equal(libraryParent.retrospective,true);
  assert.deepEqual(Object.keys(libraryParent.amendments).sort(),['js/japji-full.js','js/sukhmani-reader.js']);
  const repairPath='evidence/reader-reliability/runtime-amendments.json';
  assert.equal(sha(read(repairPath)),'0fbe1a31d3e27c458e8d84a9b42f869ff48d6ddddc7f703cce92f3346f8d4607','The reader-reliability candidate receipt is pinned');
  const reliability=json(repairPath);
  assert.equal(reliability.schema,'glp001.reader-reliability-runtime-amendments.v1');
  assert.equal(reliability.status,'BUILDER_CANDIDATE_NOT_APPROVED');
  assert.equal(reliability.changeBaseline,libraryParent.frozenParentCommit);
  assert.equal(reliability.priorLedgerPath,parentPath);
  assert.equal(reliability.priorLedgerSHA256,sha(read(parentPath)));
  assert.deepEqual(Object.keys(reliability.amendments).sort(),['full-japji.html','js/sukhmani-reader.js','sukhmani.html']);
  for(const record of [libraryParent,reliability]){
    assert.equal(record.scriptureChanges,false);assert.equal(record.teachingChanges,false);assert.equal(record.independentApproval,false);
  }
  for (const [path,digest] of Object.entries(frozen.files)) {
    const amendment=ledger.amendments[path],next=followup.amendments[path];
    if(amendment){assert.equal(amendment.before,digest,path+' immutable prior hash');assert.ok(amendment.findings.includes('CI-R-01'));}
    const previous=amendment?.after||digest;
    if(next){assert.equal(next.before,previous,path+' exact prior runtime hash');assert.ok(next.findings.includes('CI-R-08'));}
    const priorRuntime=next?.after||previous,history=historyRepair.amendments[path];
    if(history){assert.equal(history.before,priorRuntime,path+' exact pre-history-repair hash');assert.deepEqual(history.findings,['SF-01']);}
    const historyRuntime=history?.after||priorRuntime,parent=libraryParent.amendments[path];
    if(parent)assert.equal(parent.before,historyRuntime,path+' exact pre-library runtime hash');
    const parentRuntime=parent?.after||historyRuntime,repair=reliability.amendments[path];
    if(repair){
      assert.equal(repair.before,parentRuntime,path+' exact frozen PR56 runtime hash');
      assert.deepEqual(repair.findings,path==='js/sukhmani-reader.js'?['SK-01']:['SRI-01']);
    }
    assert.equal(sha(read(path)),repair?.after||parentRuntime,path+' documented runtime or source preservation');
  }
});

const report={status:'PASS',environment:'Node content/preservation verification; not visual or qualified scholarly approval',total:checks.length,checks,sourceRecords:sourceLines.size,sourceUnits:sourceUnits.size,meaningDrafts:Object.keys(course.closeTextNotes).length,studyDrafts:Object.keys(course.unitLessons).length,additionalMeanings:322,additionalStudies:80,documentedSourceAmendments:amendments.length,documentedEditorialAmendments:editorial.length,priorMeaningEntries:1039,priorStudyEntries:247,sourceIDsAndOrderPreserved:true,jaap62SourceDisplayOrderVerified:true,qualifiedHumanReviewed:0,courseSHA256:sha(read('nitnem/learning/course.complete.json')),manifestSHA256:sha(read('nitnem/data/library.json'))};
fs.writeFileSync(new URL('evidence/nitnem-content-verification.json',root),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,total:report.total,sourceRecords:report.sourceRecords,studyDrafts:report.studyDrafts,courseSHA256:report.courseSHA256}));
