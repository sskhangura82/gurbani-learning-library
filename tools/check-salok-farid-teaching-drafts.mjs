#!/usr/bin/env node
// Checks the authored Salok Sheikh Farid teaching drafts against the frozen selected edition.
// Authored educational content only: this tool reads scripture and never writes it.
// It validates the Salok Kabir authoring shape, adapted to Farid's variable line counts.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const read = (p) => fs.readFile(path.join(root, p));
const sha = (x) => crypto.createHash('sha256').update(x).digest('hex');
const SOURCE = 'salok-farid/data/salok-farid.json';
const MANIFEST = 'salok-farid/data/library.json';
const SOURCE_SHA = '4141000d0d1b408d277163408d92fa88d530050ad5f89cc1ea1ad0330e01d643';
const MANIFEST_SHA = 'f239e62d2e55fb54c060d827f3596b94ca85ccf3833fa4525315684788ac538c';
const RESEARCH = 'research/salok-farid';

const sourceBytes = await read(SOURCE);
assert.equal(sha(sourceBytes), SOURCE_SHA, 'The selected Farid edition is frozen; teaching drafts must not authorise a changed source.');
assert.equal(sha(await read(MANIFEST)), MANIFEST_SHA, 'The Farid scripture manifest is frozen.');
const pack = JSON.parse(sourceBytes);
const units = new Map(pack.units.map((u) => [u.ordinal, u]));
assert.equal(units.size, 130);

const gurmukhi = /[਀-੿]/u;
const latin = /[A-Za-z]/;
const letters = (s) => [...s].filter((c) => /\p{L}|\p{M}/u.test(c));
function punjabi(field, value) {
  assert.equal(typeof value, 'string', field);
  assert.ok(value.trim().length > 0, field + ' is empty');
  const ls = letters(value);
  const share = ls.filter((c) => gurmukhi.test(c)).length / ls.length;
  assert.ok(share >= 0.9, `${field} should be written in Gurmukhi (share ${share.toFixed(2)})`);
}
function english(field, value) {
  assert.equal(typeof value, 'string', field);
  assert.ok(value.trim().length > 0 && latin.test(value), field + ' must be English text');
}
const forbidden = ['�', 'TODO', 'TBD', 'lorem'];

const names = (await fs.readdir(path.join(root, RESEARCH))).filter((n) => /^teaching-\d{3}-\d{3}\.json$/.test(n)).sort();
assert.ok(names.length, 'No teaching drafts found');
const drafted = new Map();
const report = {status: 'PASS', files: [], drafted: 0, lines: 0, words: 0, namedCommentatorNotes: 0};

for (const name of names) {
  const [lo, hi] = name.slice(9, -5).split('-').map(Number);
  const bytes = await read(`${RESEARCH}/${name}`);
  const text = bytes.toString('utf8');
  for (const f of forbidden) assert.ok(!text.includes(f), `${name} contains ${JSON.stringify(f)}`);
  const list = JSON.parse(text);
  assert.ok(Array.isArray(list), name + ' must be a list of Salok entries');
  assert.equal(text, JSON.stringify(list, null, 2) + '\n', name + ' must use the canonical two-space JSON layout the assembler hashes');
  assert.deepEqual(list.map((e) => e.ordinal), Array.from({length: hi - lo + 1}, (_, i) => lo + i), name + ' must cover its range in order');

  for (const entry of list) {
    const unit = units.get(entry.ordinal);
    const id = unit.id;
    assert.ok(!drafted.has(entry.ordinal), `Salok ${entry.ordinal} is drafted twice`);
    drafted.set(entry.ordinal, name);
    assert.deepEqual(Object.keys(entry), ['ordinal', 'lines', 'simple', 'study', 'sources'], id + ' top-level fields');
    assert.equal(entry.lines.length, unit.lines.length, `${id} needs one meaning per verse line (${unit.lines.length})`);
    entry.lines.forEach((line, i) => {
      assert.deepEqual(Object.keys(line), ['simpleEn', 'simplePa', 'interpretiveCaution', 'interpretiveCautionPa'], `${id} line ${i + 1} fields`);
      english(`${id}.lines[${i}].simpleEn`, line.simpleEn);
      punjabi(`${id}.lines[${i}].simplePa`, line.simplePa);
      english(`${id}.lines[${i}].interpretiveCaution`, line.interpretiveCaution);
      punjabi(`${id}.lines[${i}].interpretiveCautionPa`, line.interpretiveCautionPa);
      if (/Prof\. Sahib Singh|Faridkot Teeka|Bhai Manmohan Singh|Sant Singh Khalsa/.test(line.interpretiveCaution)) report.namedCommentatorNotes++;
    });
    report.lines += entry.lines.length;
    english(`${id}.simple.en`, entry.simple.en);
    punjabi(`${id}.simple.pa`, entry.simple.pa);
    const s = entry.study;
    for (const f of ['focus', 'closeReading', 'interpretationCare', 'reflection', 'teachBack']) {
      english(`${id}.study.${f}`, s[f]);
      punjabi(`${id}.study.${f}Pa`, s[f + 'Pa']);
    }
    assert.ok(s.words.length >= 2 && s.words.length <= 4, id + ' should teach two to four words');
    for (const w of s.words) {
      assert.ok(unit.lines.some((l) => l.text.includes(w.gurmukhi)), `${id} vocabulary ${w.gurmukhi} must appear exactly in the selected source`);
      assert.equal(w.status, 'WORKING_GLOSS_NOT_APPROVED');
      english(`${id} gloss ${w.gurmukhi}`, w.workingGloss);
      punjabi(`${id} gloss ${w.gurmukhi}`, w.workingGlossPa);
    }
    report.words += s.words.length;
    assert.ok(entry.sources.length >= 1);
    for (const src of entry.sources) {
      assert.equal(new URL(src.url).protocol, 'https:');
      assert.ok(src.title && src.scope, id + ' source needs title and scope');
    }
    const ang = entry.sources[0];
    assert.equal(new URL(ang.url).searchParams.get('Param'), String(unit.angStart), `${id} first source must be its Ang page`);
    assert.ok(ang.title.includes(`Salok Sheikh Farid ${entry.ordinal},`), id + ' Ang source title');
    if (unit.metricalHeadings.length) {
      assert.ok(/Mahalla/.test(s.interpretationCare + s.closeReading), `${id} has a Mahalla heading; the lesson must address it`);
    }
  }

  const evName = `teaching-evidence-${name.slice(9)}`;
  const evidence = JSON.parse(await read(`${RESEARCH}/${evName}`));
  assert.equal(evidence.teaching.sha256, sha(bytes), `${evName} must bind the current ${name}`);
  assert.equal(evidence.sourcePack.sha256, SOURCE_SHA);
  const expected = list.flatMap((e) => units.get(e.ordinal).lines);
  assert.deepEqual(evidence.lines.map((l) => [l.lineId, l.sourceSha256]), expected.map((l) => [l.id, l.sha256]), `${evName} must cover every line in range`);
  const overlapBytes = await read(evidence.overlapCheck.path);
  assert.equal(evidence.overlapCheck.sha256, sha(overlapBytes));
  const overlap = JSON.parse(overlapBytes);
  assert.equal(overlap.status, 'PASS', 'Commentary overlap check must pass');
  assert.equal(overlap.files[0].sha256, sha(bytes), 'Overlap check must have run on the current draft');
  assert.equal(evidence.humanReview.qualifiedSikhReview, false, 'This tool cannot record a human review');
  report.files.push({name, range: [lo, hi], sha256: sha(bytes), evidence: evName});
}

const headings = JSON.parse(await read(`${RESEARCH}/heading-context-drafts.json`));
assert.equal(headings.status, 'DRAFT_AI_UNREVIEWED');
const allHeadings = [...pack.preface, ...pack.units.flatMap((u) => u.metricalHeadings)];
assert.deepEqual(headings.headings.map((h) => [h.headingId, h.headingSha256]), allHeadings.map((h) => [h.id, h.sha256]), 'Every original heading needs one context draft');
for (const h of headings.headings) {
  english(h.headingId, h.simpleEn);
  punjabi(h.headingId, h.simplePa);
}

report.drafted = drafted.size;
report.remaining = pack.units.filter((u) => !drafted.has(u.ordinal)).map((u) => u.ordinal);
report.headingDrafts = headings.headings.length;
report.signatureOnlyNanakUnits = pack.units
  .filter((u) => !u.metricalHeadings.length && u.lines.some((l) => l.text.includes('ਨਾਨਕ')))
  .map((u) => ({ordinal: u.ordinal, drafted: drafted.has(u.ordinal)}));
console.log(JSON.stringify({...report, remaining: `${report.remaining.length} Saloks`}, null, 1));
