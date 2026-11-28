// A new bounded continuation scope; earlier review records remain unchanged.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const base = '68f47ffba4782271651716c71a97bc1825f96f48';
const git = (...args) => execFileSync('git', args, {cwd: root, maxBuffer: 64 * 1024 * 1024});
const read = name => fs.readFile(path.join(root, name));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const application = name => !/^(?:\.github|docs|evidence|tests|tools)\//.test(name);
const modified = [
  'collections/dasam/read.html', 'collections/sggs/index.html',
  'collections/source-reader/core.mjs', 'collections/source-reader/reader.bundle.mjs',
  'collections/source-reader/reader.css', 'collections/source-reader/reader.mjs',
  'psychology/index.html', 'sw.js'
];
const added = [
  'collections/source-reader/learning.mjs', 'collections/source-reader/lesson-core.mjs',
  'collections/source-reader/lesson-data.mjs', 'psychology/attention.html',
  'psychology/emotion-regulation.html', 'psychology/intellectual-humility.html', 'psychology/study.css'
];

test('Learning continuation declares exact modified and new application bytes from the stable Claude review target', async () => {
  const record = JSON.parse(await read('evidence/gurbani-learning/change-scope.json'));
  assert.equal(record.schema, 'glp.gurbani-learning.change-scope.v1');
  assert.equal(record.base, base);
  assert.equal(record.reviewStatus, 'BUILDER_RECORD_UNREVIEWED');
  assert.deepEqual(record.modified.map(value => value.path), modified);
  assert.deepEqual(record.added.map(value => value.path), added);
  for (const row of record.modified) {
    const previous = git('show', base + ':' + row.path), current = await read(row.path);
    assert.equal(hash(previous), row.beforeSha256, row.path + ' exact stable baseline');
    assert.equal(hash(current), row.afterSha256, row.path + ' explicit continuation bytes');
    assert.notEqual(row.beforeSha256, row.afterSha256, row.path + ' is an actual change');
  }
  for (const row of record.added) assert.equal(hash(await read(row.path)), row.sha256, row.path + ' new source');
});

test('Every other existing application file, including scripture, private pack and saved-learning code, remains byte-identical', async () => {
  const previousNames = git('ls-tree', '-r', '--name-only', base).toString().trim().split('\n').filter(application);
  const currentNames = git('ls-files', '--cached', '--others', '--exclude-standard').toString().trim().split('\n').filter(application);
  assert.deepEqual([...new Set(currentNames)].sort(), [...previousNames, ...added].sort(), 'No extra application files or deleted old inputs');
  const exempt = new Set(modified);
  for (const name of previousNames) {
    if (exempt.has(name)) continue;
    assert.deepEqual(await read(name), git('show', base + ':' + name), name + ' preserved exactly');
  }
});

test('Shared Dasam shell changes only its exact bundle integrity attribute', async () => {
  const stripIntegrity = html => html.replace(/integrity="sha384-[A-Za-z0-9+/=]+"/g, 'integrity="<BUNDLE_DIGEST>"');
  assert.equal(stripIntegrity((await read('collections/dasam/read.html')).toString()),
    stripIntegrity(git('show', base + ':collections/dasam/read.html').toString()));
});
