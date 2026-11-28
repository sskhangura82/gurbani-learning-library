// Exact additive continuation. Older evidence continues to describe its original bytes.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root = fileURLToPath(new URL('../../', import.meta.url));
export const READ_ALONG_BASE = 'cfded3e2186c1f6e325d135f1fa62da1f03d34bb';
export const READ_ALONG_MODIFIED = ['index.html', 'sw.js'];
export const READ_ALONG_ADDED = [
  'collections/source-reader/read-along-config.mjs',
  'collections/source-reader/read-along-core.mjs',
  'collections/source-reader/read-along-player.mjs',
  'collections/source-reader/read-along-source.mjs',
  'collections/source-reader/read-along.bundle.mjs',
  'collections/source-reader/read-along.mjs',
  'listen/index.html', 'listen/read-along.css'
];
const read = name => fs.readFile(path.join(root, name));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const prior = name => execFileSync('git', ['show', READ_ALONG_BASE + ':' + name], {cwd: root, maxBuffer: 64*1024*1024});
export async function readAlongScope() {
  const record = JSON.parse(await read('evidence/youtube-read-along/change-scope.json'));
  assert.equal(record.schema, 'glp.youtube-read-along.change-scope.v1');
  assert.equal(record.base, READ_ALONG_BASE);
  assert.equal(record.reviewStatus, 'BUILDER_RECORD_UNREVIEWED');
  assert.deepEqual(record.modified.map(item => item.path), READ_ALONG_MODIFIED);
  assert.deepEqual(record.added.map(item => item.path), READ_ALONG_ADDED);
  for (const item of record.modified) {
    assert.equal(hash(prior(item.path)), item.beforeSha256, item.path + ' exact stable parent');
    assert.equal(hash(await read(item.path)), item.afterSha256, item.path + ' exact declared amendment');
  }
  for (const item of record.added) assert.equal(hash(await read(item.path)), item.sha256, item.path + ' exact addition');
  return new Set(READ_ALONG_MODIFIED);
}
export async function readBeforeReadAlong(name, fallback = read) {
  if (!READ_ALONG_MODIFIED.includes(name)) return fallback(name);
  await readAlongScope(); return prior(name);
}
