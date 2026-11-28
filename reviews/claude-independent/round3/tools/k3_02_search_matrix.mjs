// Round 3 — search behaviour of PR #45, driven through its own core.mjs with my expectations.
// Usage: node k3_02_search_matrix.mjs <path to PR45 checkout> <out.json>
import fs from 'node:fs'; import path from 'node:path'; import {pathToFileURL} from 'node:url';
const [root, out] = process.argv.slice(2);
const core = await import(pathToFileURL(path.join(root, 'knowledge/core.mjs')).href);
const g = JSON.parse(fs.readFileSync(path.join(root, 'knowledge/pilot.json'), 'utf8'));
const index = core.buildIndex(g);
const occ = new Map(g.occurrences.map(o => [o.id, o]));
const passages = g.nodes.filter(n => n.type === 'passage');
const res = {groups: {}, cases: []};
const rec = (group, name, query, opts, got, ok, expect) => { res.cases.push({group, name, query: query.length > 90 ? query.slice(0, 87) + '…' : query, opts, expect, got, ok});
  const s = res.groups[group] ??= {cases: 0, ok: 0}; s.cases++; if (ok) s.ok++; };
const ids = r => r.map(x => x.id);
const run = (q, o = {}) => core.search(index, q, o);

// KQ-01 exact phrase: every row, whole; without closing marks; two- and three-word phrases; in "phrase" mode and in the default mode
for (const p of passages) for (const id of p.occurrenceIds) { const t = occ.get(id).text; const w = t.split(/\s+/).filter(x => /^[਀-੿]/.test(x));
  for (const mode of ['phrase', 'auto']) {
    let r = run(t, {mode}); rec('KQ-01 whole row · ' + mode, id, t, {mode}, ids(r), ids(r).includes(p.id), [p.id]);
    const bare = t.replace(/\s*॥.*$/u, ''); r = run(bare, {mode}); rec('KQ-01 row without closing marks · ' + mode, id, bare, {mode}, ids(r), ids(r).includes(p.id), [p.id]);
    if (w.length >= 3) { const ph = w.slice(1, 3).join(' '); r = run(ph, {mode}); rec('KQ-01 two-word phrase · ' + mode, id, ph, {mode}, ids(r), ids(r).includes(p.id), [p.id]); }
  } }
// KQ-01b a phrase must be a phrase: letters from inside words, and words in the wrong order, should find nothing
for (const [name, q] of [['one letter', 'ਹ'], ['one vowel sign', 'ਿ'], ['two letters from inside a word', 'ਉਮ'], ['words of one row in the wrong order', 'ਰੋਗੁ ਦੀਰਘ ਹਉਮੈ'], ['end of one word + start of next', 'ਮੈ ਦੀ'], ['closing mark only', '॥'], ['a number mark only', '॥੧॥']])
  for (const mode of ['phrase', 'auto']) { const r = run(q, {mode}); rec('KQ-01b not a phrase · ' + mode, name, q, {mode}, ids(r), r.length === 0, []); }

// KQ-02 first letters. (a) the first code point of each word, as the code does it; (b) the convention used by Gurbani search tools: the three vowel carriers stand for their vowels
const carrier = c => 'ਉਊਓ'.includes(c) ? 'ੳ' : 'ਅਆਐਔ'.includes(c) ? 'ਅ' : 'ਇਈਏ'.includes(c) ? 'ੲ' : c;
let differs = 0;
for (const p of passages) for (const id of p.occurrenceIds) { const t = occ.get(id).text; const w = t.split(/\s+/).filter(x => /^[਀-੿]/.test(x));
  const strict = w.map(x => [...x][0]).join(''), conv = w.map(x => carrier([...x][0])).join('');
  let r = run(strict, {mode: 'first-letter'}); rec('KQ-02 first letters, as written', id, strict, {mode: 'first-letter'}, ids(r), ids(r).includes(p.id), [p.id]);
  if (conv !== strict) { differs++; r = run(conv, {mode: 'first-letter'}); rec('KQ-02 first letters, vowel-carrier convention', id, conv, {mode: 'first-letter'}, ids(r), ids(r).includes(p.id), [p.id]); }
  if (strict.length >= 4) { r = run(strict.slice(0, 4), {mode: 'first-letter'}); rec('KQ-02 first four letters', id, strict.slice(0, 4), {mode: 'first-letter'}, ids(r), ids(r).includes(p.id), [p.id]); }
  r = run(strict, {mode: 'auto'}); rec('KQ-02 first letters typed without choosing the mode', id, strict, {mode: 'auto'}, ids(r), ids(r).includes(p.id), [p.id]);
  r = run(strict.split('').join(' '), {mode: 'first-letter'}); rec('KQ-02 first letters with spaces', id, strict.split('').join(' '), {mode: 'first-letter'}, ids(r), ids(r).includes(p.id), [p.id]);
}
res.rowsWhereConventionDiffers = differs;

// KQ-03 Ang
const P = {470: 'sggs.asa.470.m1.salok01', 466: 'sggs.asa.466.m2.salok02', 1364: 'sggs.kabir.salok007'};
for (const [q, want] of [['466', [P[466]]], ['470', [P[470]]], ['1364', [P[1364]]], ['Ang 466', [P[466]]], ['ang470', [P[470]]], ['ਅੰਗ ੪੬੬', [P[466]]], ['੪੭੦', [P[470]]], ['੧੩੬੪', [P[1364]]], ['Ang 1364', [P[1364]]],
   ['465', []], ['471', []], ['0', []], ['1431', []], ['14300', []], ['-1', []], ['466.5', []], ['4 6 6', []], ['page 466', [P[466]]], ['Ang466 ', [P[466]]], ['ang 0466', [P[466]]], ['p. 470', [P[470]]], ['Ank 470', [P[470]]], ['ਪੰਨਾ ੪੭੦', [P[470]]]]) {
  const r = run(q); rec('KQ-03 Ang', q, q, {}, ids(r), JSON.stringify(ids(r)) === JSON.stringify(want), want); }
// with the mode left on "first letters" or "phrase", an Ang number still answers
for (const mode of ['first-letter', 'phrase']) { const r = run('466', {mode}); rec('KQ-03 Ang in another mode', mode, '466', {mode}, ids(r), ids(r).includes(P[466]), [P[466]]); }

// KQ-04 other names: every curated name finds its item, whatever the capitals; and common spellings a learner would try
for (const n of g.nodes) for (const a of new Set([n.title, n.pa, ...(n.aliases || [])].filter(Boolean))) for (const v of new Set([a, a.toUpperCase(), '  ' + a + '  '])) {
  const r = run(v); rec('KQ-04 curated name finds its item', n.id, v, {}, ids(r).slice(0, 4), ids(r)[0] === n.id || (r.find(x => x.id === n.id)?.score === r[0]?.score), [n.id]); }
for (const [q, want] of [['humbleness', 'concept.humility'], ['nimarta', 'concept.humility'], ['nimrta', 'concept.humility'], ['Nimratā', 'concept.humility'], ['houmai', 'concept.haumai'], ['haumein', 'concept.haumai'], ['haumai?', 'concept.haumai'], ['what is haumai', 'concept.haumai'], ['egoism', 'concept.haumai'], ['pride', 'concept.haumai'], ['hankar', 'concept.haumai'], ['ahankar', 'concept.haumai'],
   ['Asa Ki Vaar', 'composition.asa-di-vaar'], ['Asa di Var', 'composition.asa-di-vaar'], ['Aasaa', 'raag.asa'], ['Kabeer', 'author.bhagat-kabir'], ['Bhagat Kabir', 'author.bhagat-kabir'], ['Guru Nanak Dev Ji', 'author.guru-nanak'], ['Guru Angad Dev', 'author.guru-angad'], ['Mahalla 2', 'author.guru-angad'], ['Mehl 1', 'author.guru-nanak'], ['M2', 'author.guru-angad'], ['ਮਹਲਾ ੨', 'author.guru-angad'], ['ਕਬੀਰ', 'author.bhagat-kabir'], ['ਗੁਰੂ ਨਾਨਕ', 'author.guru-nanak'], ['ਨਾਨਕ', 'author.guru-nanak'],
   ['simmal', P[470]], ['simmal tree', P[470]], ['grace', 'concept.kirpa'], ['hukam', 'concept.hukam'], ['sewa', 'concept.seva'], ['shabad', 'concept.shabad'], ['sabad', 'concept.shabad'], ['ਸਬਦੁ', 'concept.shabad'], ['ਹੁਕਮੁ', 'word.hukam'], ['ਨਿਵੈ', P[470]]]) {
  const r = run(q); rec('KQ-04b spellings a learner would try', q, q, {}, ids(r).slice(0, 4), ids(r).includes(want), [want]); }

// KQ-05 author filter
for (const [a, want] of [['author.guru-nanak', [P[470]]], ['author.guru-angad', [P[466]]], ['author.bhagat-kabir', [P[1364]]]]) {
  for (const q of ['humility', 'haumai', 'ਹਉਮੈ', '470', 'kabir']) { const r = run(q, {author: a}); rec('KQ-05 author filter returns only that author', a + ' · ' + q, q, {author: a}, ids(r), r.every(x => want.includes(x.id)), 'subset of ' + want); } }

// KQ-06 what must find nothing
const nothing = ['car', 'war', 'ant', 'a', 'the', 'x', '?', '   ', '', 'zzzz', 'category', 'Oregon', 'San Diego', 'negotiation', 'basal', 'Pasadena', 'NASA', 'casa', 'Kasauli', 'vegetable', 'humbug', 'conceited', 'kabira', 'nanakshahi calendar', 'sevadar', 'several', 'angadi', 'psychology of colour', 'buddhist monastery in Tibet', 'self awareness app',
  '<img src=x onerror=alert(1)>', '<script>alert(1)</script>', '.*', '(', '[a-z]+', '\\', '%', '#%', 'SELECT * FROM lines', '🙏', '​', '‍', 'ਹ‍ਉਮੈ', 'hੳumai', 'x'.repeat(5000), 'humility '.repeat(40), 'ੴ', 'ਵਾਹਿਗੁਰੂ', 'ਜਪੁ', 'waheguru', 'mool mantar', 'ik onkar', 'japji', 'ਸੋ ਦਰੁ', 'ਨਾਨਕ ਨਾਮ ਚੜ੍ਹਦੀ ਕਲਾ'];
for (const q of nothing) { let r, err = null; try { r = run(q); } catch (e) { err = String(e); r = []; }
  rec('KQ-06 should find nothing', JSON.stringify(q.length > 40 ? q.slice(0, 37) + '…' : q), q, {}, err ? 'ERROR ' + err : r.map(x => x.id + ' (' + x.reason + ')'), !err && r.length === 0, []); }

// KQ-07 same order every time; every result carries a reason
{ const qs = ['humility', 'haumai', 'ਹਉਮੈ', 'kabir', '466', 'asa']; let stable = true, reasons = true;
  for (const q of qs) { const a = JSON.stringify(run(q)); for (let i = 0; i < 5; i++) if (JSON.stringify(run(q)) !== a) stable = false; for (const x of run(q)) if (!x.reason) reasons = false; }
  rec('KQ-07 order and reasons', 'same order on six queries × five repeats', qs.join(' | '), {}, {stable, reasons}, stable && reasons, {stable: true, reasons: true});
  res.reasonsSeen = [...new Set(qs.flatMap(q => run(q).map(x => x.reason)))]; }

fs.writeFileSync(out, JSON.stringify(res, null, 1));
for (const [k, v] of Object.entries(res.groups)) console.log(String(v.ok).padStart(3) + ' of ' + String(v.cases).padStart(3) + '  ' + k);
console.log('rows where the vowel-carrier convention differs:', differs);
console.log('reasons seen:', res.reasonsSeen);
for (const c of res.cases) if (!c.ok && !c.group.startsWith('KQ-01 ')) console.log('  ✗', c.group, '|', c.name, '| got', JSON.stringify(c.got).slice(0, 150));
