// Synthetic adversarial fixtures plus every original-only payload in the admitted editions.
// No browser profile, personal learning, private payload, network, or source database is read.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  verifyManifest, verifyChunk, unitsForPage, parseRoute, formatRoute, lineForRoute,
  makeProgress, progressUnit, validateProgress, progressKey,
} from '../collections/source-reader/core.mjs';

const tests = [];
const test = async (name, fn) => { await fn(); tests.push(name); };
const hash = value => createHash('sha256').update(value).digest('hex');
const rawJSON = value => Buffer.from(JSON.stringify(value) + '\n');
const clone = value => JSON.parse(JSON.stringify(value));
const binding = (manifest, raw) => ({collectionId: manifest.collectionId, editionId: manifest.editionId, sha256: hash(raw), bytes: raw.length});
const now = '2026-11-27T12:00:00.000Z';

function fixture() {
  const collectionId = 'sggs', editionId = 'shabados-5.0.0-next.0-SGGS-SSA2';
  const bodies = [
    {id: 'UA', sectionId: 'S1', sectionOrder: 1, authorId: 'A1', lines: [
      {id: 'LA1', order: 1, page: 1, printedLine: 1, text: 'ੴ ਸਤਿ ਨਾਮੁ; ॥'},
      {id: 'LA2', order: 2, page: 2, printedLine: 1, text: 'ਸ਼; ॥'},
    ]},
    {id: 'UB', sectionId: 'S1', sectionOrder: 2, authorId: 'A1', lines: [
      {id: 'LB1', order: 1, page: 2, printedLine: null, text: 'ਨਾਮੁ ॥'},
    ]},
    {id: 'UC', sectionId: 'S2', sectionOrder: 1, authorId: 'A1', lines: [
      {id: 'LC1', order: 1, page: 3, printedLine: null, text: 'ਸਿਮਰਉ ॥'},
    ]},
  ];
  const chunks = [
    {schema: 'glp.sikh-reader.chunk.v1', collectionId, editionId, id: 'c0001', units: bodies.slice(0, 2)},
    {schema: 'glp.sikh-reader.chunk.v1', collectionId, editionId, id: 'c0002', units: bodies.slice(2)},
  ];
  const manifest = {
    schema: 'glp.sikh-reader.manifest.v1', status: 'NAMED_DIGITAL_EDITION_ORIGINAL_ONLY', locatorStatus: 'SOURCE_REPORTED',
    collectionId, editionId, name: {Latn: 'Synthetic fixture', Guru: 'ਟੈਸਟ'},
    source: {packageName: '@shabados/database', packageVersion: '5.0.0-next.0', reportedGitHead: '1'.repeat(40),
      archiveSha256: '2'.repeat(64), databaseSha256: '3'.repeat(64), noticeSha256: '4'.repeat(64), sourceId: 'SGGS', assetId: 'SSA2'},
    counts: {units: 3, lines: 4, pages: 3},
    sections: [{id: 'S1', order: 1, name: {Latn: 'First'}}, {id: 'S2', order: 2, name: {Latn: 'Second'}}],
    authors: [{id: 'A1', name: {Guru: 'ਟੈਸਟ', Latn: 'Synthetic attribution'}}],
    units: bodies.map((unit, index) => ({id: unit.id, sectionId: unit.sectionId, sectionOrder: unit.sectionOrder,
      authorId: unit.authorId, lineCount: unit.lines.length, pages: [...new Set(unit.lines.map(line => line.page))],
      sha256: hash(JSON.stringify(unit)), chunkId: index < 2 ? 'c0001' : 'c0002'})),
    chunks: chunks.map(chunk => ({id: chunk.id, path: `chunks/${chunk.id}.json`, bytes: rawJSON(chunk).length,
      sha256: hash(rawJSON(chunk)), unitIds: chunk.units.map(unit => unit.id)})),
  };
  return {manifest, chunks};
}
async function verifiedFixture(value = fixture()) {
  const raw = rawJSON(value.manifest), manifest = await verifyManifest(raw, binding(value.manifest, raw));
  const chunks = [];
  for (let index = 0; index < value.chunks.length; index++) chunks.push(await verifyChunk(rawJSON(value.chunks[index]), manifest.chunks[index], manifest));
  return {manifest, chunks, units: chunks.flatMap(chunk => chunk.units)};
}
function repinChunk(value, index = 0, repinUnits = false) {
  const chunk = value.chunks[index], raw = rawJSON(chunk);
  value.manifest.chunks[index].bytes = raw.length;
  value.manifest.chunks[index].sha256 = hash(raw);
  if (repinUnits) for (const unit of chunk.units) value.manifest.units.find(item => item.id === unit.id).sha256 = hash(JSON.stringify(unit));
}
async function manifestRefusal(change, pattern = /SOURCE_/) {
  const {manifest} = fixture(); change(manifest);
  const raw = rawJSON(manifest);
  await assert.rejects(verifyManifest(raw, binding(manifest, raw)), pattern);
}
async function chunkRefusal(change, pattern = /SOURCE_/, repinUnits = false) {
  const value = fixture(); change(value.chunks[0]); repinChunk(value, 0, repinUnits);
  const raw = rawJSON(value.manifest), manifest = await verifyManifest(raw, binding(value.manifest, raw));
  await assert.rejects(verifyChunk(rawJSON(value.chunks[0]), manifest.chunks[0], manifest), pattern);
}

await test('Manifest and chunk require separately trusted exact byte lengths and digests', async () => {
  const value = fixture(), raw = rawJSON(value.manifest), pin = binding(value.manifest, raw);
  await assert.rejects(verifyManifest(raw, {...pin, bytes: pin.bytes - 1}), /SOURCE_MANIFEST_SIZE/);
  const changed = Buffer.from(raw); changed[100] ^= 1;
  await assert.rejects(verifyManifest(changed, pin), /SOURCE_MANIFEST_DIGEST/);
  await assert.rejects(verifyManifest(raw, {...pin, collectionId: 'dasam'}), /SOURCE_IDENTITY/);
  const manifest = await verifyManifest(raw, pin), chunk = rawJSON(value.chunks[0]); chunk[100] ^= 1;
  await assert.rejects(verifyChunk(chunk, manifest.chunks[0], manifest), /SOURCE_CHUNK_DIGEST/);
  await assert.rejects(verifyChunk(rawJSON(value.chunks[0]), clone(manifest.chunks[0]), manifest), /SOURCE_UNVERIFIED_DESCRIPTOR/);
});
await test('Duplicate JSON keys, escaped duplicate aliases, BOM and invalid UTF-8 refuse even with a renewed fixture pin', async () => {
  const {manifest} = fixture(), raw = rawJSON(manifest);
  const variants = [
    Buffer.from(raw.toString().replace('{"schema":', '{"schema":"ignored","schema":')),
    Buffer.from(raw.toString().replace('{"schema":', '{"sch\\u0065ma":"ignored","schema":')),
    Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), raw]),
    Buffer.concat([raw.subarray(0, -1), Buffer.from([0xff, 10])]),
    Buffer.from(JSON.stringify(manifest, null, 2) + '\n'),
  ];
  for (const changed of variants) await assert.rejects(verifyManifest(changed, binding(manifest, changed)), /SOURCE_(JSON|CANONICAL_JSON)/);
});
await test('Closed source schema refuses teaching fields, translations, wrong selected asset and verified-commit claims', async () => {
  for (const change of [m => { m.teaching = 'fixture'; }, m => { m.source.assetId = 'ENGLISH'; },
    m => { m.source.gitCommit = m.source.reportedGitHead; }, m => { m.sections[0].description = 'fixture'; },
    m => { m.name.translation = 'fixture'; }, m => { m.locatorStatus = 'INDEPENDENTLY_COLLATED'; },
    m => { m.status = 'CANONICAL'; }, m => { m.authors[0].name.verified = true; }]) await manifestRefusal(change);
});
await test('Manifest coverage rejects dropped or duplicated units, false counts, page gaps, reordered groups and unsafe paths', async () => {
  for (const change of [m => { m.counts.lines--; }, m => { m.units[1].id = m.units[0].id; },
    m => { m.units[0].sectionOrder = 2; }, m => { m.units[0].pages = [1, 1]; },
    m => { m.units[2].pages = [2]; }, m => { m.units[0].authorId = 'UNKNOWN'; },
    m => { m.chunks[0].unitIds.pop(); }, m => { m.chunks[0].unitIds[1] = m.chunks[0].unitIds[0]; },
    m => { m.chunks[0].path = '../outside.json'; }, m => { m.chunks[0].bytes = 131073; }]) await manifestRefusal(change);
});
await test('Independent whole-unit hash refuses text, punctuation, metadata or order changes after a chunk repin', async () => {
  for (const change of [c => { c.units[0].lines[0].text = c.units[0].lines[0].text.replace(';', ''); },
    c => { c.units[0].lines[0].printedLine = 2; }, c => { c.units[0].lines[1].text = c.units[0].lines[1].text.normalize('NFD'); }]) {
    await chunkRefusal(change, /SOURCE_UNIT_DIGEST/);
  }
});
await test('Renewed pins cannot admit clipped groups, duplicate lines, false page sets, missing null locators or extra fields', async () => {
  for (const change of [c => { c.units[0].lines.pop(); }, c => { c.units[0].lines[1].id = c.units[0].lines[0].id; },
    c => { c.units[0].lines[1].order = 1; }, c => { c.units[0].lines[1].page = 1; },
    c => { delete c.units[1].lines[0].printedLine; }, c => { c.units[1].lines[0].printedLine = 0; },
    c => { c.units[0].lines[0].translation = 'fixture'; }, c => { c.units[0].lines[0].text = '\ud800'; },
    c => { c.units.reverse(); }, c => { c.collectionId = 'dasam'; }]) await chunkRefusal(change, /SOURCE_/, true);
});
await test('Cross-chunk line collisions refuse on verification without granting a partial verified unit', async () => {
  const value = fixture(); value.chunks[1].units[0].lines[0].id = 'LA1'; repinChunk(value, 1, true);
  const raw = rawJSON(value.manifest), manifest = await verifyManifest(raw, binding(value.manifest, raw));
  await verifyChunk(rawJSON(value.chunks[0]), manifest.chunks[0], manifest);
  await assert.rejects(verifyChunk(rawJSON(value.chunks[1]), manifest.chunks[1], manifest), /SOURCE_DUPLICATE_LINE/);
  assert.throws(() => makeProgress(manifest, value.chunks[1].units[0], value.chunks[1].units[0].lines[0], now), /SOURCE_UNVERIFIED_UNIT/);
});
await test('Page lookup returns complete ordered owning descriptors and verified text remains byte-exact and immutable', async () => {
  const value = fixture(), verified = await verifiedFixture(value);
  assert.deepEqual(unitsForPage(verified.manifest, 1).map(unit => unit.id), ['UA']);
  assert.deepEqual(unitsForPage(verified.manifest, 2).map(unit => unit.id), ['UA', 'UB']);
  assert.deepEqual(verified.units[0].lines.map(line => line.text), value.chunks[0].units[0].lines.map(line => line.text));
  assert.deepEqual(verified.units[0].lines.map(line => line.page), [1, 2]);
  assert.throws(() => { verified.units[0].lines[0].text = 'changed'; }, TypeError);
  assert.throws(() => { unitsForPage(verified.manifest, 2).pop(); }, TypeError);
  assert.throws(() => unitsForPage(clone(verified.manifest), 1), /SOURCE_UNVERIFIED_MANIFEST/);
});
await test('Stable routes round-trip while malformed, foreign, duplicated and unowned destinations refuse explicitly', async () => {
  const {manifest} = await verifiedFixture();
  assert.deepEqual(parseRoute('', manifest), {page: 1, unitId: null, lineId: null});
  const route = {page: 2, unitId: 'UA', lineId: 'LA2'};
  assert.equal(formatRoute(route), '?page=2&unit=UA&line=LA2');
  assert.deepEqual(parseRoute(formatRoute(route), manifest), route);
  for (const search of ['?page=0', '?page=04', '?page=4', '?page=1&page=2', '?page=1&unknown=x', '?unit=UA',
    '?page=1&unit=UC', '?page=2&line=LA2', '?page=2&unit=', '?page=2&unit=NOPE', '?page=1&unit=%FF',
    '?page=1&unit=%', '?page=1#fragment', '?page=1&', '?page', 'page=1']) assert.throws(() => parseRoute(search, manifest), /SOURCE_ROUTE/);
  assert.throws(() => formatRoute({page: 2, lineId: 'LA2'}), /SOURCE_ROUTE/);
});
await test('A route line must belong to both its verified unit and the selected reported page', async () => {
  const {manifest, units} = await verifiedFixture();
  assert.equal(lineForRoute(manifest, parseRoute('?page=2&unit=UA&line=LA2', manifest), units[0]), units[0].lines[1]);
  assert.equal(lineForRoute(manifest, parseRoute('?page=2&unit=UA', manifest), units[0]), null);
  for (const line of ['LA1', 'LB1', 'UNKNOWN']) assert.throws(() => lineForRoute(manifest, parseRoute(`?page=2&unit=UA&line=${line}`, manifest), units[0]), /SOURCE_ROUTE_LINE/);
  assert.throws(() => lineForRoute(manifest, parseRoute('?page=2&unit=UA&line=LA2', manifest), units[1]), /SOURCE_ROUTE_UNIT/);
});
await test('Progress is separately source-bound and resume requires a verified actual line and page', async () => {
  const {manifest, units} = await verifiedFixture(), record = makeProgress(manifest, units[0], units[0].lines[1], now);
  assert.equal(progressKey(manifest), 'glp001.sikh-source-place.v1:sggs:shabados-5.0.0-next.0-SGGS-SSA2');
  assert.equal(progressUnit(record, manifest), manifest.units[0]);
  assert.deepEqual(validateProgress(JSON.parse(JSON.stringify(record)), manifest, units[0]), record);
  assert.throws(() => validateProgress(record, manifest), /SOURCE_UNVERIFIED_UNIT/);
  assert.throws(() => validateProgress(record, manifest, clone(units[0])), /SOURCE_UNVERIFIED_UNIT/);
  assert.throws(() => makeProgress(manifest, units[0], clone(units[0].lines[1]), now), /SOURCE_PROGRESS_LINE/);
  const wrongLine = {...record, lineId: 'LB1'};
  assert.equal(progressUnit(wrongLine, manifest), manifest.units[0]); // Deliberately only a preflight.
  assert.throws(() => validateProgress(wrongLine, manifest, units[0]), /SOURCE_PROGRESS_LINE/);
  assert.throws(() => validateProgress({...record, page: 1}, manifest, units[0]), /SOURCE_PROGRESS_LINE/);
});
await test('Malformed, newer or foreign saved records refuse unchanged, without reading or writing any storage', async () => {
  const {manifest, units} = await verifiedFixture(), record = makeProgress(manifest, units[0], units[0].lines[1], now);
  for (const patch of [{schema: 'glp.sikh-reader.progress.v2'}, {collectionId: 'dasam'}, {editionId: 'different'},
    {unitSha256: '0'.repeat(64)}, {unitId: 'UNKNOWN'}, {page: 3}, {updatedAt: '2026-02-30T12:00:00.000Z'},
    {updatedAt: 'not-a-date'}, {future: true}, {lineId: ''}]) {
    const changed = {...record, ...patch}, original = JSON.stringify(changed);
    assert.throws(() => validateProgress(changed, manifest, units[0]), /SOURCE_PROGRESS/);
    assert.equal(JSON.stringify(changed), original);
  }
});

// Independent pins make the all-payload acceptance check fail if only a runtime lock is repinned.
const actualBindings = [
  {collectionId: 'sggs', editionId: 'shabados-5.0.0-next.0-SGGS-SSA2', bytes: 1116397,
    sha256: '04da157b5e7ba85ce0fe35aae983baba3284bc75990be374e556ab3c52da5def', counts: {units: 5549, lines: 60555, pages: 1430}, chunks: 75, sections: 51, authors: 35},
  {collectionId: 'dasam', editionId: 'shabados-5.0.0-next.0-SDGR-DGDG', bytes: 1101376,
    sha256: '2ba6005655429eeb07b4477d4bf9a18b4f62e86224107d72793ec5f2bd441ad6', counts: {units: 5470, lines: 67758, pages: 1428}, chunks: 80, sections: 17, authors: 1},
];
const dataRoot = process.env.GLP_SOURCE_DATA_ROOT ? resolve(process.env.GLP_SOURCE_DATA_ROOT) : fileURLToPath(new URL('../collections/source-data/', import.meta.url));
const actual = new Map();
for (const pin of actualBindings) await test(`Every ${pin.collectionId} chunk and whole unit verifies, with exact total coverage and globally unique lines`, async () => {
  const root = resolve(dataRoot, pin.collectionId), manifest = await verifyManifest(await readFile(resolve(root, 'manifest.json')), pin);
  assert.deepEqual(manifest.counts, pin.counts); assert.equal(manifest.chunks.length, pin.chunks);
  assert.equal(manifest.sections.length, pin.sections); assert.equal(manifest.authors.length, pin.authors);
  const byUnit = new Map(), allLines = [];
  for (const descriptor of manifest.chunks) {
    const chunk = await verifyChunk(await readFile(resolve(root, descriptor.path)), descriptor, manifest);
    assert.ok(descriptor.bytes <= 131072);
    for (const unit of chunk.units) { byUnit.set(unit.id, unit); allLines.push(...unit.lines); }
  }
  assert.equal(byUnit.size, pin.counts.units); assert.equal(allLines.length, pin.counts.lines);
  assert.equal(new Set(allLines.map(line => line.id)).size, pin.counts.lines);
  assert.deepEqual([...new Set(allLines.map(line => line.page))].sort((a, b) => a - b), Array.from({length: pin.counts.pages}, (_, i) => i + 1));
  for (let page = 1; page <= pin.counts.pages; page++) for (const descriptor of unitsForPage(manifest, page)) {
    const unit = byUnit.get(descriptor.id); assert.equal(unit.lines.length, descriptor.lineCount);
    assert.ok(unit.lines.some(line => line.page === page));
  }
  actual.set(pin.collectionId, {manifest, byUnit, allLines});
});
await test('Real SGGS page boundaries retain all source-declared lines, stable line links and the reported Raagmala attribution', () => {
  const {manifest, byUnit} = actual.get('sggs');
  const expected = [
    ['ZKH', 14, 1, 2, 'VUQD', '6VSN'], ['SKD', 15, 465, 466, 'DGUG', 'TVY1'],
    ['TNM', 399, 929, 938, 'Z32D', 'CM75'], ['FD3', 62, 1429, 1430, 'J9XT', 'CUSP'],
  ];
  for (const [id, count, firstPage, lastPage, firstLine, lastLine] of expected) {
    const unit = byUnit.get(id); assert.equal(unit.lines.length, count);
    assert.equal(unit.lines[0].id, firstLine); assert.equal(unit.lines.at(-1).id, lastLine);
    for (let page = firstPage; page <= lastPage; page++) assert.ok(unitsForPage(manifest, page).some(item => item.id === id));
    const line = unit.lines.at(-1), route = parseRoute(formatRoute({page: line.page, unitId: id, lineId: line.id}), manifest);
    assert.equal(lineForRoute(manifest, route, unit), line);
    assert.equal(validateProgress(makeProgress(manifest, unit, line, now), manifest, unit).lineId, lastLine);
  }
  assert.equal(byUnit.get('DMP').lines[0].text, 'ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ; ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥');
  assert.equal(byUnit.get('FD3').authorId, 'ALAM');
  assert.equal(manifest.locatorStatus, 'SOURCE_REPORTED');
});
await test('Real Dasam preserves the largest complete unit, null printed lines, and reported-page regressions without inventing corrections', () => {
  const {manifest, byUnit, allLines} = actual.get('dasam'), unit = byUnit.get('4TJ');
  assert.equal(unit.lines.length, 426); assert.equal(unit.lines[0].id, '90G2'); assert.equal(unit.lines.at(-1).id, 'MRY4');
  for (let page = 738; page <= 748; page++) assert.ok(unitsForPage(manifest, page).some(item => item.id === '4TJ'));
  assert.equal(allLines.filter(line => line.printedLine === null).length, 66957);
  const reported = byUnit.get('9QK').lines;
  assert.equal(reported.filter((line, i) => i > 0 && line.page < reported[i - 1].page).length, 14);
  assert.equal(reported.find(line => line.id === '3NZ6').page, 158);
  assert.equal(reported.find(line => line.id === 'TT76').page, 155);
  const line = reported.find(item => item.id === 'TT76');
  assert.equal(lineForRoute(manifest, {page: 155, unitId: '9QK', lineId: line.id}, byUnit.get('9QK')), line);
  assert.notEqual(progressKey(manifest), progressKey(actual.get('sggs').manifest));
});

console.log(JSON.stringify({passed: tests.length, verifiedCollections: actualBindings.map(pin => ({collectionId: pin.collectionId, ...pin.counts, chunks: pin.chunks})), tests}, null, 2));
