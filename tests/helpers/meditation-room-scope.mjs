// Exact candidate amendment. Historical scopes receive baseline bytes only after
// the current room, breathing changes and generated worker have been verified.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
export const MEDITATION_ROOM_BASE = 'cfded3e2186c1f6e325d135f1fa62da1f03d34bb';
export const MEDITATION_ROOM_PATHS = Object.freeze([
  'index.html', 'breathing.html', 'css/breathing.css', 'js/breathing-core.js', 'js/breathing.js'
]);
export const MEDITATION_ROOM_ADDITIONS = Object.freeze([
  'meditation.html', 'practice-sources.html', 'css/meditation.css', 'js/meditation.js'
]);
export const MEDITATION_ROOM_RECORD = 'evidence/meditation-breathing-room/change-scope.json';
const read = name => fs.readFile(path.join(root, name));
const prior = name => execFileSync('git', ['show', MEDITATION_ROOM_BASE + ':' + name], {cwd: root, maxBuffer: 64 * 1024 * 1024});
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const comparable = (name, bytes) => name === 'index.html'
  ? Buffer.from(bytes.toString().replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '<APPROVED_SCRIPT_LOADER>'))
  : bytes;

function workerParts(bytes) {
  const text = bytes.toString();
  const versions = [...text.matchAll(/^const VERSION=("[^"\n]+");$/gm)];
  const manifests = [...text.matchAll(/^const EXPECTED=(\{[^\n]+\});$/gm)];
  assert.equal(versions.length, 1, 'one exact worker version declaration');
  assert.equal(manifests.length, 1, 'one exact worker asset manifest');
  return {
    version: JSON.parse(versions[0][1]),
    assets: JSON.parse(manifests[0][1]),
    behavior: text.replace(versions[0][0], 'const VERSION=<VERSION>;').replace(manifests[0][0], 'const EXPECTED=<ASSETS>;')
  };
}

async function verifyWorker(current, readFile) {
  const before = workerParts(prior('sw.js'));
  const after = workerParts(current);
  assert.notEqual(after.version, before.version, 'changed assets need a fresh offline cache version');
  assert.equal(after.behavior, before.behavior, 'the existing worker behavior and private-data exclusions stay byte-identical');
  assert.deepEqual(Object.keys(after.assets).sort(), [
    ...Object.keys(before.assets), ...MEDITATION_ROOM_ADDITIONS.map(name => './' + name)
  ].sort(), 'offline inventory adds exactly the four room assets and removes nothing');
  const changedAssets = new Set(['./', ...MEDITATION_ROOM_PATHS.map(name => './' + name)]);
  for (const [asset, digest] of Object.entries(before.assets)) {
    if (!changedAssets.has(asset)) assert.equal(after.assets[asset], digest, asset + ' earlier cached bytes stay frozen');
  }
  for (const [asset, digest] of Object.entries(after.assets)) {
    assert.ok(asset.startsWith('./'), 'offline URL is local');
    const file = asset.endsWith('/') ? asset.slice(2) + 'index.html' : asset.slice(2);
    assert.equal(hash(await readFile(file)), digest, asset + ' exact on-disk cached bytes');
  }
}

export async function meditationRoomScope({readFile = read} = {}) {
  const record = JSON.parse(await readFile(MEDITATION_ROOM_RECORD));
  assert.equal(record.schema, 'glp.meditation-breathing.change-scope.v1');
  assert.equal(record.base, MEDITATION_ROOM_BASE);
  assert.deepEqual(record.files.map(item => item.path), MEDITATION_ROOM_PATHS);
  for (const item of record.files) {
    assert.equal(item.hashMode, item.path === 'index.html' ? 'script-loader-normalized' : 'raw-bytes');
    assert.equal(hash(comparable(item.path, prior(item.path))), item.beforeSha256, item.path + ' exact pre-room input');
    assert.equal(hash(comparable(item.path, await readFile(item.path))), item.afterSha256, item.path + ' exact room amendment');
    assert.notEqual(item.beforeSha256, item.afterSha256, item.path + ' declared change must be actual');
  }
  assert.deepEqual(record.added.map(item => item.path), MEDITATION_ROOM_ADDITIONS);
  for (const item of record.added) assert.equal(hash(await readFile(item.path)), item.sha256, item.path + ' exact new room asset');
  assert.equal(record.worker.path, 'sw.js');
  assert.equal(hash(prior('sw.js')), record.worker.beforeSha256, 'exact prior offline worker');
  const currentWorker = await readFile('sw.js');
  assert.equal(hash(currentWorker), record.worker.afterSha256, 'exact generated candidate worker');
  await verifyWorker(currentWorker, readFile);
  return new Set(MEDITATION_ROOM_PATHS);
}

export async function readBeforeMeditationRoom(name, fallback = read) {
  if (!MEDITATION_ROOM_PATHS.includes(name)) return fallback(name);
  await meditationRoomScope();
  return prior(name);
}

// A separate narrow adapter keeps the five application-input paths fixed above.
export async function readBeforeMeditationWorker(name, fallback = read) {
  if (name !== 'sw.js') return fallback(name);
  await meditationRoomScope();
  return prior(name);
}
