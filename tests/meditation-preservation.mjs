// Scope and negative controls for a separate room candidate; no content approval.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {
  meditationRoomScope, readBeforeMeditationRoom, readBeforeMeditationWorker,
  MEDITATION_ROOM_BASE, MEDITATION_ROOM_PATHS, MEDITATION_ROOM_ADDITIONS, MEDITATION_ROOM_RECORD
} from './helpers/meditation-room-scope.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => fs.readFile(path.join(root, name));
const git = (...args) => execFileSync('git', args, {cwd: root, maxBuffer: 64 * 1024 * 1024});
const application = name => !/^(?:\.github|docs|evidence|tests|tools)\//.test(name);
const hash = value => createHash('sha256').update(value).digest('hex');

test('The room declares exact five-path amendments, four additions and a generated-only worker change', async () => {
  assert.deepEqual([...await meditationRoomScope()], MEDITATION_ROOM_PATHS);
});

test('Every earlier application file outside the exact room scope remains byte-identical', async () => {
  await meditationRoomScope();
  const previous = git('ls-tree', '-r', '--name-only', MEDITATION_ROOM_BASE).toString().trim().split('\n').filter(application);
  const current = git('ls-files', '--cached', '--others', '--exclude-standard').toString().trim().split('\n').filter(application);
  assert.ok(previous.length > 300, 'the check covers the complete application and scripture inventory');
  assert.deepEqual([...new Set(current)].sort(), [...previous, ...MEDITATION_ROOM_ADDITIONS].sort(), 'exact application inventory, including no deleted or unexpected files');
  const amended = new Set([...MEDITATION_ROOM_PATHS, 'sw.js']);
  for (const name of previous) {
    if (!amended.has(name)) assert.deepEqual(await read(name), git('show', MEDITATION_ROOM_BASE + ':' + name), name + ' unchanged');
  }
});

test('The library home adds only the single room link; catalog, bundle and Simran stay untouched', async () => {
  const before = git('show', MEDITATION_ROOM_BASE + ':index.html').toString();
  const link = '<p><a class="primary-link" href="meditation.html">Explore the meditation &amp; breathing room</a></p>\n';
  const expected = before.replace('<div id="today-tools" class="tools-grid"></div>\n', '<div id="today-tools" class="tools-grid"></div>\n' + link);
  assert.notEqual(expected, before, 'the exact insertion anchor is present');
  assert.equal((await read('index.html')).toString(), expected, 'no unrelated home or loader edits');
  for (const name of ['library/catalog.mjs', 'library/app.bundle.mjs', 'simran.html', 'js/simran.js', 'css/simran.css']) {
    assert.deepEqual(await read(name), git('show', MEDITATION_ROOM_BASE + ':' + name), name + ' preserved');
  }
});

test('Historical reads return prior bytes only for the verified explicit paths and worker', async () => {
  for (const name of MEDITATION_ROOM_PATHS) assert.deepEqual(await readBeforeMeditationRoom(name), git('show', MEDITATION_ROOM_BASE + ':' + name));
  assert.deepEqual(await readBeforeMeditationWorker('sw.js'), git('show', MEDITATION_ROOM_BASE + ':sw.js'));
  const sentinel = Buffer.from('fallback');
  assert.equal(await readBeforeMeditationRoom('js/simran.js', () => sentinel), sentinel);
  assert.equal(await readBeforeMeditationWorker('js/simran.js', () => sentinel), sentinel);
  assert.equal(await readBeforeMeditationRoom('sw.js', () => sentinel), sentinel, 'worker is not a sixth application-input exemption');
});

test('Scope checking rejects a changed current input and a broadened whitelist', async () => {
  await assert.rejects(() => meditationRoomScope({readFile: async name => name === 'js/breathing.js' ? Buffer.concat([await read(name), Buffer.from('\n// unexpected change\n')]) : read(name)}));
  await assert.rejects(() => meditationRoomScope({readFile: async name => {
    if (name !== MEDITATION_ROOM_RECORD) return read(name);
    const record = JSON.parse(await read(name));
    record.files.push({...record.files[0], path: 'js/simran.js'});
    return Buffer.from(JSON.stringify(record));
  }}));
});

test('A freshly repinned worker still rejects changed behavior, missing assets or a reused cache version', async () => {
  const source = (await read('sw.js')).toString();
  const prior = git('show', MEDITATION_ROOM_BASE + ':sw.js').toString();
  const priorVersion = prior.match(/^const VERSION=("[^"\n]+");$/m)[1];
  const assets = JSON.parse(source.match(/^const EXPECTED=(\{[^\n]+\});$/m)[1]);
  const missing = {...assets}; delete missing['./simran.html'];
  for (const worker of [
    source + '\n// unexpected worker behavior change\n',
    source.replace(/^const VERSION="[^"\n]+";$/m, 'const VERSION=' + priorVersion + ';'),
    source.replace(/^const EXPECTED=\{[^\n]+\};$/m, 'const EXPECTED=' + JSON.stringify(missing) + ';')
  ]) {
    await assert.rejects(() => meditationRoomScope({readFile: async name => {
      if (name === 'sw.js') return Buffer.from(worker);
      if (name !== MEDITATION_ROOM_RECORD) return read(name);
      const record = JSON.parse(await read(name)); record.worker.afterSha256 = hash(worker);
      return Buffer.from(JSON.stringify(record));
    }}));
  }
});
