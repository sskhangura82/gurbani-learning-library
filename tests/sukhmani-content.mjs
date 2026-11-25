import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), 'utf8');
const json = path => JSON.parse(read(path));
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
function canonical(value) {
  if (Array.isArray(value)) return '['+value.map(canonical).join(',')+']';
  if (value && typeof value==='object') return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
function data(path, name) {
  const context = {window: {}};
  vm.runInNewContext(read(path), context, {timeout: 3000});
  return JSON.parse(JSON.stringify(context.window[name]));
}
const source = data('js/sukhmani-data.js', 'GLP_SUKHMANI');
const teaching = data('js/sukhmani-teaching.js', 'GLP_SUKHMANI_TEACHING');
const lines = source.ashtpadis.flatMap(a => a.lines);
const byId = new Map(lines.map(l => [l.id, l]));
const checks = [];
function test(name, fn) { fn(); checks.push(name); }
const bilingual = x => x && typeof x.en === 'string' && x.en.trim().length > 0 && typeof x.pa === 'string' && /[\u0a00-\u0a7f]/u.test(x.pa);

test('Exactly Ashtpadis 1–18, without claiming the complete composition', () => {
  assert.deepEqual(source.ashtpadis.map(a => a.number), Array.from({length:18},(_,i)=>i+1));
  assert.equal(source.completeComposition, false);
  assert.equal(lines.length, 1523);
  assert.equal(source.lineCount, 1523);
  assert.equal(new Set(lines.map(l => l.id)).size, 1523);
  assert.deepEqual(source.ashtpadis.map(a=>a.lines.length), [90,84,84,84,84,84,86,85,86,84,84,84,84,84,84,84,84,84]);
});
test('All original Unicode bytes match the frozen first-eighteen sequence', () => {
  const actual = hash(lines.map(l => l.gurmukhi).join('\n'));
  assert.equal(actual, '159f53f611e550b1996305d2f2a87e610e5375bfc5eca254dbd12dbfd7b7cda8');
  assert.equal(source.textSequenceSha256, actual);
  for (const [i,l] of lines.entries()) {
    assert.equal(l.sha256, hash(l.gurmukhi), l.id);
    assert.equal(l.sequence, i+1, l.id);
    assert.ok(l.sourceId.startsWith('opengranth:34d2a7cab032c8ea24d21ff20f64653bd03766f4:'), l.id);
  }
});
test('The first-six source records, IDs, meanings and studies remain exactly preserved', () => {
  const frozen=json('evidence/sukhmani-first-six-baseline.json');
  assert.equal(frozen.frozenCommit, '28337270a1f149b96882acf420cf7dcd5c8910ce');
  const firstSix=source.ashtpadis.filter(a=>a.number<=6);
  const originalLines=firstSix.flatMap(a=>a.lines);
  assert.equal(originalLines.length,510);
  assert.equal(hash(originalLines.map(l=>l.gurmukhi).join('\n')),frozen.textSequenceSha256);
  assert.equal(hash(canonical(firstSix)),frozen.sourceAshtpadisSha256);
  assert.equal(hash(canonical(Object.fromEntries(originalLines.map(l=>[l.id,teaching.meanings[l.id]])))),frozen.meaningsSha256);
  assert.equal(hash(canonical(Object.fromEntries(firstSix.map(a=>[a.number,teaching.ashtpadis[a.number]])))),frozen.studyAshtpadisSha256);
});
test('The published first-twelve source objects, meanings and studies remain exactly preserved', () => {
  const frozen=json('evidence/sukhmani-first-twelve-baseline.json');
  assert.equal(frozen.frozenCommit, '39e2c410f0ef942bd611ba4de1a2d3b2d9ad1355');
  const firstTwelve=source.ashtpadis.filter(a=>a.number<=12);
  const originalLines=firstTwelve.flatMap(a=>a.lines);
  assert.equal(originalLines.length,1019);
  assert.equal(hash(originalLines.map(l=>l.gurmukhi).join('\n')),frozen.textSequenceSha256);
  assert.equal(hash(canonical(firstTwelve)),frozen.sourceAshtpadisSha256);
  assert.equal(hash(canonical(Object.fromEntries(originalLines.map(l=>[l.id,teaching.meanings[l.id]])))),frozen.meaningsSha256);
  assert.equal(hash(canonical(Object.fromEntries(firstTwelve.map(a=>[a.number,teaching.ashtpadis[a.number]])))),frozen.studyAshtpadisSha256);
});
test('A separately retrieved transcription agrees in exact order, text and Ang', () => {
  const comparison = json('evidence/sukhmani-srigranth-gurmukhi.json');
  assert.deepEqual(lines.map(l => ({ang:l.ang, gurmukhi:l.gurmukhi})), comparison.lines);
  const report = json('evidence/sukhmani-source-collation.json');
  assert.equal(report.exactMatches, 1523);
  assert.deepEqual(report.differences, []);
  assert.deepEqual(report.differentAngs, []);
  assert.equal(report.humanCollationApproved, false);
  assert.equal(report.comparisonSourcesIndependentEditionsProven, false);
});
test('Eighteen complete Saloks, 144 ten-line pauris, both Rahau lines and all headings survive', () => {
  const count = kind => lines.filter(l => l.kind === kind).length;
  assert.equal(count('pauri'), 1440);
  assert.equal(count('salok'), 43);
  assert.equal(count('rahau'), 2);
  assert.equal(count('heading'), 38);
  const salokVerseCounts=[4,2,2,2,2,2,4,3,4,2,2,2,2,2,2,2,2,2];
  for (const a of source.ashtpadis) {
    assert.equal(a.lines.filter(l=>l.kind==='salok').length, salokVerseCounts[a.number-1]);
    for (let p=1;p<=8;p++) assert.equal(a.lines.filter(l=>l.kind==='pauri' && l.pauri===p).length, 10);
  }
  assert.equal(lines[0].gurmukhi, 'ਗਉੜੀ ਸੁਖਮਨੀ ਮਃ ੫ ॥');
  assert.equal(lines.at(-1).gurmukhi, 'ਅਨਿਕ ਬਾਰ ਨਾਨਕ ਬਲਿਹਾਰੀ ॥੮॥੧੮॥');
  assert.deepEqual([...new Set(lines.map(l=>l.ang))], Array.from({length:27},(_,i)=>262+i));
});
test('Every source occurrence has its own bilingual draft and optional reading aid', () => {
  assert.deepEqual(Object.keys(teaching.meanings).sort(), [...byId.keys()].sort());
  for (const l of lines) {
    const m = teaching.meanings[l.id];
    assert.ok(bilingual(m), l.id);
    assert.equal(m.status, 'draft', l.id);
    assert.equal(m.sourceHash, l.sha256, l.id);
    assert.equal(typeof m.transliteration, 'string', l.id);
    assert.ok(m.transliteration.trim(), l.id);
  }
  assert.equal(teaching.meta.status, 'draft');
  assert.equal(teaching.meta.humanReviewed, false);
});
test('Eighteen introductions and all 163 passage studies have exact contextual anchors', () => {
  let total=0;
  for (const a of source.ashtpadis) {
    const t=teaching.ashtpadis[a.number];
    assert.ok(bilingual(t.title));
    assert.ok(bilingual(t.overview));
    assert.ok(bilingual(t.teachBack));
    assert.ok(bilingual(t.caution));
    assert.ok(t.vocabulary.length >= 6);
    for (const v of t.vocabulary) assert.ok(v.gurmukhi && v.roman && v.en && v.pa);
    assert.deepEqual(t.pauris.map(p=>p.number), [1,2,3,4,5,6,7,8]);
    const groups = [t.salok,...t.pauris,...(a.number===1?[t.rahau]:[])];
    for (const g of groups) {
      total++;
      assert.ok(bilingual(g.title), `Ashtpadi ${a.number}: title`);
      assert.ok(bilingual(g.explanation), `Ashtpadi ${a.number}: explanation`);
      assert.ok(bilingual(g.reflection), `Ashtpadi ${a.number}: reflection`);
      assert.ok(g.sourceIds.length > 0);
      for (const id of g.sourceIds) {
        const l=byId.get(id);
        assert.ok(l, id);
        assert.equal(l.ashtpadi,a.number,id);
        if (g.number) assert.equal(l.pauri,g.number,id);
      }
      const expectedIds=a.lines.filter(l=>l.unitId===(g.number?'sukhmani.a'+String(a.number).padStart(2,'0')+'.p'+String(g.number).padStart(2,'0'):g===t.salok?'sukhmani.a'+String(a.number).padStart(2,'0')+'.salok':'sukhmani.a'+String(a.number).padStart(2,'0')+'.rahau')).map(l=>l.id);
      assert.deepEqual(g.sourceIds,expectedIds,'Study must enclose the complete original passage');
      assert.ok(g.sources?.some(s=>s.url?.startsWith('https://www.srigranth.org/')), 'Passage source links are available in-app');
    }
  }
  assert.equal(total, 163);
});
test('Source and editorial content remain separate and source attribution is retained', () => {
  assert.ok(lines.every(l=>!('en' in l) && !('translation' in l) && !('meaning' in l)));
  assert.equal(source.source.humanCollationApproved, false);
  assert.ok(read('vendor/opengranth/LICENSE').includes('MIT License'));
  assert.ok(read('vendor/opengranth/NOTICE').includes('Shabad OS'));
  assert.ok(read('tools/sukhmani/transliteration.py').includes('approximate'));
});
test('Existing library entry and offline shell include the functional reader', () => {
  assert.ok(read('index.html').includes('href="sukhmani.html"'));
  assert.ok(read('index.html').includes('Ashtpadis 1–18 of 24'));
  const sw = read('sw.js');
  for (const name of ['sukhmani.html','css/sukhmani.css','js/sukhmani-reader.js','js/sukhmani-data.js','js/sukhmani-teaching.js','js/sukhmani-learning.js']) {
    assert.ok(sw.includes('"./'+name+'"'), name);
  }
});

const report={status:'PASS', total:checks.length, checks, sourceOccurrences:lines.length, newSourceOccurrences:504, firstSixPreserved:true, firstTwelvePreserved:true, pauriVerseLines:1440, salokVerseLines:43, rahauLines:2, headings:38, meaningDrafts:Object.keys(teaching.meanings).length, passageStudyDrafts:163, humanReviewed:0};
fs.writeFileSync(new URL('evidence/sukhmani-content-verification.json',root),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
