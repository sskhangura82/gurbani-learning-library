// Existing published source files are the independent fixtures. No data, reader,
// teaching draft, stored learning or provider response is rewritten by this suite.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createBaniReadAlongSource} from '../collections/source-reader/read-along-bani.mjs';
import {createReadAlongSource} from '../collections/source-reader/read-along-source.mjs';
import {emptyTiming, putCue, validateTiming, serializeTiming, timingKey} from '../collections/source-reader/read-along-core.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const baseURL = new URL('https://source.invalid/review/collections/source-reader/read-along.bundle.mjs');
const digest = value => createHash('sha256').update(value).digest('hex');
const editionId = 'glp-daily-bani-pinned-originals-20261127-v1';
const videoId = 'fixture0001';
const morning = ['japji', 'jaap', 'savaiye', 'chaupai', 'anand'];
const selectionHashes = {
  japji: '0cb9ffa9b4e787a287cfb08326f1663fb718d16bdb406eb4cd2d13bc4a27c6e5',
  jaap: '12c5742dc062f1859914caccd97f90c151352424e6cf5d18cf26e145732ae671',
  savaiye: '414cdbe09c4c691f8d0a5279c5a3a7aa489d843b634c92c7a246fc6d2c8f0b9f',
  chaupai: '03f25df63e1e67a89346c21f8119736dff03479ef9a65a749fc0183e2388d81f',
  anand: 'a951c8f897f2b86a71a70f4844899878499032da2cd65187b87e49a77e89f287',
  rehras: 'c3ac38e711ff9115af16a8d1ea53524ee17136602ce397d229c8de144a3f0254',
  sohila: '9a3ba57baaa353fa3408ba3e68b4f031261a90e748354bc69b024dfa14ebd204',
  sukhmani: 'd4dc1072c401e20783adab6f703bfb6d2d58cb04a90164da9eaf2efa26071529',
  morning: '71109f361d9039db365987d5af016376a7ad2a33f7e69e540520ada3c477ede3'
};
const fixed = {
  japji: {file: 'js/japji-full-data.js', bytes: 83714, count: 385,
    sha256: '7f5f78ac33da1a944e14c3d2b901926686df7e520e6fe681f6a28802d85e9808'},
  jaap: {file: 'nitnem/data/jaap.json', bytes: 538376, count: 808,
    sha256: 'f00ab63bfe27ad36fac6b7b285c480f3265780f5eb02bb077cafcc29c9e7dcec'},
  savaiye: {file: 'nitnem/data/savaiye.json', bytes: 27078, count: 43,
    sha256: '7d5e6fe9ac801b7649e4ef3547a25a79ee1f543f70c4f6bb52492d2d8f37cfaa'},
  chaupai: {file: 'nitnem/data/chaupai.json', bytes: 70494, count: 121,
    sha256: '289bbd6d725a7921bf1e160620b14ac927fe5e5874c219849168ee70b9389046'},
  anand: {file: 'nitnem/data/anand.json', bytes: 127242, count: 210,
    sha256: '124245dfbfa260efd618f513683cbd5dd273e5f7aefdf86bee28db4ee778471a'},
  rehras: {file: 'nitnem/data/rehras.json', bytes: 149365, count: 159,
    sha256: '81bff60d8c942a7eafc30a0b7f3ba994816c6e86a0c8d8daeb7c1ca2f2cebc3b'},
  sohila: {file: 'nitnem/data/sohila.json', bytes: 26637, count: 56,
    sha256: '7fe21aec71a889c452d639141994087ee2a1390d800c78b59bf604c4496df673'},
  sukhmani: {file: 'js/sukhmani-data.js', bytes: 1241749, count: 2027,
    sha256: '0cdd704749265c09ead442ec5fd6c84569b1da34dd40ec021585dacd4a1c65f6'}
};
const raw = new Map(), originals = new Map();
for (const [id, receipt] of Object.entries(fixed)) {
  const bytes = await fs.readFile(path.join(root, receipt.file));
  assert.equal(bytes.length, receipt.bytes, id + ' published byte count');
  assert.equal(digest(bytes), receipt.sha256, id + ' independently fixed source file');
  raw.set(receipt.file, bytes);
  // These two trusted legacy data files contain one JSON assignment. Parse the
  // literal; do not execute their scripts or initialize any old reader.
  let json = bytes.toString('utf8');
  if (receipt.file.endsWith('.js')) json = json.slice(json.indexOf('=') + 1).trim().replace(/;$/, '');
  originals.set(id, JSON.parse(json));
}

function expectedRows(id) {
  const data = originals.get(id), rows = [];
  if (id === 'japji' || id === 'sukhmani') {
    for (const unit of data[id === 'japji' ? 'units' : 'ashtpadis'])
      for (const line of unit.lines) rows.push({text: line[id === 'japji' ? 'text' : 'gurmukhi'],
        sourceUnitId: unit.id, originalId: line.id, sha256: line.sha256});
  } else {
    // This is the established reader's display contract: first preface, then
    // whole units; Jaap 62 explicitly places its heading after the first line.
    for (const line of data.preface || []) rows.push({text: line.text,
      sourceUnitId: data.units[0].id, sha256: line.sha256});
    for (const unit of data.units) {
      const ordered = unit.sourceDisplayOrder
        ? unit.sourceDisplayOrder.map(item => item.kind === 'line'
          ? unit.lines.find(line => line.id === item.id) : unit.metricalHeadings[item.index])
        : [...(unit.metricalHeadings || []), ...unit.lines];
      for (const line of ordered) rows.push({text: line.text, sourceUnitId: unit.id,
        originalId: line.id, sha256: line.sha256});
    }
  }
  assert.equal(rows.length, fixed[id].count);
  for (const row of rows) assert.equal(digest(row.text), row.sha256, 'Independent original line fingerprint');
  return rows.map((row, index) => ({...row, id: id + '-l' + String(index + 1).padStart(4, '0'), unitId: id}));
}
const expected = new Map(Object.keys(fixed).map(id => [id, expectedRows(id)]));
function harness({mutate, failStatus} = {}) {
  const requests = [];
  const source = createBaniReadAlongSource({baseURL, fetcher: async (url, options) => {
    const target = new URL(url);
    assert.equal(target.origin, baseURL.origin); assert.ok(target.pathname.startsWith('/review/'));
    const name = target.pathname.slice('/review/'.length);
    assert.ok(raw.has(name), 'Only one of the eight immutable original files may be requested: ' + name);
    assert.equal(options.credentials, 'omit'); assert.equal(options.cache, 'no-store');
    requests.push(name);
    if (failStatus) return new Response('Unavailable', {status: failStatus});
    return new Response(mutate ? mutate(name, Buffer.from(raw.get(name))) : raw.get(name));
  }});
  return {source, requests};
}
const projection = lines => lines.map(({id, unitId, sourceUnitId, text}) => ({id, unitId, sourceUnitId, text}));
test('All eight named Bani selections retain all 3,809 original rows, exact text, order and isolated source identities', async () => {
  let total = 0;
  const identifiers = new Set();
  for (const [id, receipt] of Object.entries(fixed)) {
    const {source, requests} = harness(), reading = await source.reading(id);
    total += reading.lines.length;
    assert.deepEqual(projection(reading.lines), projection(expected.get(id)), id + ' complete ordered originals');
    assert.equal(reading.binding.collectionId, 'daily-bani'); assert.equal(reading.binding.editionId, editionId);
    assert.equal(reading.binding.selectionId, 'bani:' + id);
    assert.equal(reading.binding.manifestSha256, selectionHashes[id]);
    assert.deepEqual(reading.binding.units, [{id, sha256: receipt.sha256}]);
    assert.deepEqual(requests, [receipt.file]);
    assert.ok(Object.isFrozen(reading) && Object.isFrozen(reading.binding)
      && Object.isFrozen(reading.binding.units) && Object.isFrozen(reading.lines)
      && reading.lines.every(Object.isFrozen), 'Verified source cannot be changed after admission');
    for (const line of reading.lines) { assert.ok(!identifiers.has(line.id)); identifiers.add(line.id); }
  }
  assert.equal(total, 3809); assert.equal(identifiers.size, 3809);
});

test('Morning Nitnem contains exactly the five complete constituent editions in their established order', async () => {
  const {source, requests} = harness(), reading = await source.reading('morning');
  const rows = morning.flatMap(id => expected.get(id));
  assert.equal(reading.lines.length, 1567); assert.deepEqual(projection(reading.lines), projection(rows));
  assert.equal(reading.binding.collectionId, 'daily-bani'); assert.equal(reading.binding.editionId, editionId);
  assert.equal(reading.binding.selectionId, 'bani:morning');
  assert.equal(reading.binding.manifestSha256, selectionHashes.morning);
  assert.deepEqual(reading.binding.units, morning.map(id => ({id, sha256: fixed[id].sha256})));
  assert.deepEqual([...new Set(requests)].sort(), morning.map(id => fixed[id].file).sort());
  assert.deepEqual([0,385,1193,1236,1357].map(index => reading.lines[index].unitId), morning);
  assert.equal(reading.lines.at(-1).unitId, 'anand');
});

test('Jaap 62 retains the mid-chhand heading after its first line, including in Morning Nitnem', async () => {
  for (const selection of ['jaap', 'morning']) {
    const reading = await harness().source.reading(selection);
    const lines = reading.lines.filter(line => line.unitId === 'jaap' && line.sourceUnitId === 'jaap062');
    assert.deepEqual(lines.map(line => line.text), ['ਤੇਰਾ ਜੋਰੁ ॥', 'ਚਾਚਰੀ ਛੰਦ ॥', 'ਜਲੇ ਹੈਂ ॥', 'ਥਲੇ ਹੈਂ ॥', 'ਅਭੀਤ ਹੈਂ ॥', 'ਅਭੇ ਹੈਂ ॥੬੨॥']);
    assert.equal(lines.length, 6);
  }
});

test('Changing original text and its matching per-line hash cannot defeat the independently pinned raw source file', async () => {
  for (const [id, receipt] of Object.entries(fixed)) {
    const row = expected.get(id).find(row => /[\u0A00-\u0A7F]/u.test(row.text));
    const forged = row.text.replace(/[\u0A00-\u0A7F]/u, char => char === 'ਕ' ? 'ਖ' : 'ਕ');
    const mutated = raw.get(receipt.file).toString('utf8')
      .replace(JSON.stringify(row.text), JSON.stringify(forged)).replace(row.sha256, digest(forged));
    assert.notEqual(mutated, raw.get(receipt.file).toString('utf8'));
    assert.equal(Buffer.byteLength(mutated), receipt.bytes, 'Tampering preserves byte length');
    const {source} = harness({mutate: (name, bytes) => name === receipt.file ? Buffer.from(mutated) : bytes});
    await assert.rejects(source.reading(id), undefined, id + ' forged source refused');
  }
});

test('Missing crypto refuses a new reading before requesting or displaying original source', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  Object.defineProperty(globalThis, 'crypto', {configurable: true, value: undefined});
  try {
    const {source, requests} = harness();
    await assert.rejects(source.reading('japji')); assert.deepEqual(requests, []);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'crypto', descriptor); else delete globalThis.crypto;
  }
});

test('An unsupported selection, failed fetch or truncated constituent cannot return partial scripture', async () => {
  const unknown = harness();
  for (const id of ['foreign', '../jaap', 'SGGS', '', null]) await assert.rejects(unknown.source.reading(id));
  assert.deepEqual(unknown.requests, []);
  await assert.rejects(harness({failStatus: 503}).source.reading('sohila'));
  const partial = harness({mutate: (name, bytes) => name === fixed.chaupai.file ? bytes.subarray(0, bytes.length - 1) : bytes});
  await assert.rejects(partial.source.reading('morning'));
});

test('Timing maps stay bound to each named selection, its exact edition and constituent digest order', async () => {
  const source = harness().source, japji = await source.reading('japji'), composite = await source.reading('morning');
  const map = putCue(putCue(emptyTiming(videoId, japji), japji, 1000, japji.lines[0].id), japji, 2000, null);
  assert.deepEqual(validateTiming(serializeTiming(map), japji, videoId), map);
  assert.throws(() => validateTiming(map, composite, videoId), 'A standalone Bani map does not silently become a composite map');
  assert.notEqual(timingKey(videoId, japji), timingKey(videoId, composite));
  for (const mutate of [value => {value.source.editionId += '-other';},
    value => {value.source.manifestSha256 = '0'.repeat(64);},
    value => {value.source.units[0].sha256 = '0'.repeat(64);},
    value => {value.source.selectionId = 'bani:morning';}]) {
    const changed = structuredClone(map); mutate(changed); assert.throws(() => validateTiming(changed, japji, videoId));
  }
  const compositeMap = emptyTiming(videoId, composite), reversed = structuredClone(compositeMap);
  reversed.source.units.reverse(); assert.throws(() => validateTiming(reversed, composite, videoId));
  const sggs = createReadAlongSource({baseURL, fetcher: async url => new Response(await fs.readFile(path.join(root,
    new URL(url).pathname.slice('/review/'.length))))});
  const namedSGGS = await sggs.japji();
  assert.equal(namedSGGS.lines.length, japji.lines.length, 'Both editions happen to have 385 rows');
  assert.throws(() => validateTiming(map, namedSGGS, videoId), 'Equal line counts never establish the same source edition');
  assert.notEqual(timingKey(videoId, japji), timingKey(videoId, namedSGGS));
});
