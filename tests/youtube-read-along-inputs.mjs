import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {readAlongScope, READ_ALONG_BASE, READ_ALONG_MODIFIED, READ_ALONG_ADDED} from './helpers/youtube-read-along-scope.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const git = (...args) => execFileSync('git', args, {cwd: root, maxBuffer: 64*1024*1024});
const read = name => fs.readFile(path.join(root, name));
const application = name => !/^(?:\.github|docs|evidence|tests|tools)\//.test(name);

test('Read-along changes exactly its declared new application files, navigation and offline shell', async () => {
  assert.deepEqual([...await readAlongScope()], READ_ALONG_MODIFIED);
  const previous = git('ls-tree','-r','--name-only',READ_ALONG_BASE).toString().trim().split('\n').filter(application);
  const actual = git('ls-files','--cached','--others','--exclude-standard').toString().trim().split('\n').filter(application);
  assert.deepEqual([...new Set(actual)].sort(), [...previous,...READ_ALONG_ADDED].sort());
  for (const name of previous) {
    if (READ_ALONG_MODIFIED.includes(name)) continue;
    assert.deepEqual(await read(name), git('show',READ_ALONG_BASE+':'+name), name+' unchanged');
  }
});

test('Older reader pages keep their exact no-frame/script policies and no provider dependency', async () => {
  for (const name of ['full-japji.html','sukhmani.html','nitnem/index.html','salok-mahalla9/index.html',
    'salok-kabir/index.html','salok-farid/index.html','collections/sggs/index.html','collections/dasam/read.html']) {
    const value=(await read(name)).toString();
    assert.equal(value,git('show',READ_ALONG_BASE+':'+name).toString());
    assert.ok(!value.includes('iframe_api'));assert.match(value,/frame-src 'none'/);
  }
});

test('The public shell contains only owned companion assets; no provider, video or source corpus is precached', async () => {
  const worker=(await read('sw.js')).toString();
  const expected=JSON.parse(worker.match(/const EXPECTED=(\{[^\n]+\});/)[1]);
  for (const name of ['./listen/','./listen/index.html','./listen/read-along.css','./collections/source-reader/read-along.bundle.mjs'])
    assert.ok(Object.hasOwn(expected,name));
  assert.ok(Object.keys(expected).every(name=>!/^https?:/.test(name)&&!name.includes('source-data/')&&!name.includes('private-library/')));
});
