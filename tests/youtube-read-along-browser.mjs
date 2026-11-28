// Real browser / owned production bundle; TEST ONLY provider responses and records.
// This is not a live YouTube, recitation, rights, or physical-device verification.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const directory = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const root = await fs.realpath(process.env.GLP_TARGET_DIRECTORY || directory);
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const out = path.resolve(process.env.GLP_YOUTUBE_OUTPUT || path.join(os.tmpdir(), 'glp-youtube-read-along-browser', stamp));
const scenarioFilter = process.env.GLP_YOUTUBE_SCENARIO || '';
await fs.mkdir(out, {recursive: true});
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const sri = bytes => 'sha384-' + createHash('sha384').update(bytes).digest('base64');
const prefix = '/youtube-read-along-review/';
const pagePath = 'listen/index.html';
const bundlePath = 'collections/source-reader/read-along.bundle.mjs';
const configPath = 'collections/source-reader/read-along-config.mjs';
const VIDEO = 'fixture0001', OTHER_VIDEO = 'fixture0002';
const TIMING_PREFIX = 'glp001.youtube-timing.v1:';
const publicPaths = new Set([pagePath, bundlePath, 'listen/read-along.css', 'collections/collections.css',
  'collections/source-reader/reader.css', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
  'js/japji-full-data.js', 'js/sukhmani-data.js', ...['jaap','savaiye','chaupai','anand','rehras','sohila'].map(id => 'nitnem/data/' + id + '.json')]);
const publicSource = value => /^collections\/source-data\/(?:sggs|dasam)\/(?:manifest\.json|chunks\/c[0-9]{4}\.json)$/.test(value);
const isPublic = value => publicPaths.has(value) || publicSource(value);
const isUnbundled = value => value.startsWith('collections/source-reader/') && value.endsWith('.mjs') && value !== bundlePath;
const mime = {'.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png'};
const report = {status: 'PASS', started: new Date().toISOString(), sourceCommit: null, scenarioFilter,
  checks: [], failures: [], sourceHashes: {}, sourceBytes: {}, limits: [
    'Actual desktop Chrome, production owned bundle and DOM, with fresh contexts and synthetic records only.',
    'The positive fixture replaces only the public provider configuration in an independently repinned owned bundle.',
    'Official metadata, API script and player iframe requests receive TEST ONLY responses. No real YouTube request is allowed through.',
    'The simulated player exposes documented method/event shapes and an explicitly controlled media clock; it is not actual video playback.',
    'Default empty provider configuration is tested separately using the unchanged candidate bundle.',
    'Original expectations derive independently from fixed source manifests and whole-group hashes, not the production source adapter.',
    'No existing user browser profile, owner PIN, private plaintext, Claude session or real personal reflection is accessed.',
    'Service workers are blocked to isolate this feature; desktop viewports do not establish Safari, VoiceOver or physical-iPhone behavior.'
  ]};
try { report.sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).trim(); } catch {}

async function readPublic(relative, {configuration = false} = {}) {
  assert.ok(isPublic(relative) || configuration && relative === configPath, 'Only declared public fixture inputs');
  assert.ok(!relative.split('/').includes('private-library'), 'Private files are outside this fixture');
  const filename = await fs.realpath(path.resolve(root, relative));
  assert.ok(filename.startsWith(root + path.sep), 'Public input stays inside the candidate');
  assert.ok(!path.relative(root, filename).split(path.sep).includes('private-library'), 'No private symlink target');
  const bytes = await fs.readFile(filename), actual = hash(bytes);
  if (Object.hasOwn(report.sourceHashes, relative)) assert.equal(actual, report.sourceHashes[relative], 'Input unchanged during run: ' + relative);
  report.sourceHashes[relative] = actual; report.sourceBytes[relative] = bytes.length;
  return bytes;
}

const specs = {
  sggs: {editionId: 'shabados-5.0.0-next.0-SGGS-SSA2', bytes: 1116397,
    sha256: '04da157b5e7ba85ce0fe35aae983baba3284bc75990be374e556ab3c52da5def'},
  dasam: {editionId: 'shabados-5.0.0-next.0-SDGR-DGDG', bytes: 1101376,
    sha256: '2ba6005655429eeb07b4477d4bf9a18b4f62e86224107d72793ec5f2bd441ad6'}
};
const fixtures = {};
const baniSpecs = {
  japji: {path: 'js/japji-full-data.js', count: 385, sha256: '7f5f78ac33da1a944e14c3d2b901926686df7e520e6fe681f6a28802d85e9808', selection: '0cb9ffa9b4e787a287cfb08326f1663fb718d16bdb406eb4cd2d13bc4a27c6e5'},
  jaap: {path: 'nitnem/data/jaap.json', count: 808, sha256: 'f00ab63bfe27ad36fac6b7b285c480f3265780f5eb02bb077cafcc29c9e7dcec', selection: '12c5742dc062f1859914caccd97f90c151352424e6cf5d18cf26e145732ae671'},
  savaiye: {path: 'nitnem/data/savaiye.json', count: 43, sha256: '7d5e6fe9ac801b7649e4ef3547a25a79ee1f543f70c4f6bb52492d2d8f37cfaa', selection: '414cdbe09c4c691f8d0a5279c5a3a7aa489d843b634c92c7a246fc6d2c8f0b9f'},
  chaupai: {path: 'nitnem/data/chaupai.json', count: 121, sha256: '289bbd6d725a7921bf1e160620b14ac927fe5e5874c219849168ee70b9389046', selection: '03f25df63e1e67a89346c21f8119736dff03479ef9a65a749fc0183e2388d81f'},
  anand: {path: 'nitnem/data/anand.json', count: 210, sha256: '124245dfbfa260efd618f513683cbd5dd273e5f7aefdf86bee28db4ee778471a', selection: 'a951c8f897f2b86a71a70f4844899878499032da2cd65187b87e49a77e89f287'},
  rehras: {path: 'nitnem/data/rehras.json', count: 159, sha256: '81bff60d8c942a7eafc30a0b7f3ba994816c6e86a0c8d8daeb7c1ca2f2cebc3b', selection: 'c3ac38e711ff9115af16a8d1ea53524ee17136602ce397d229c8de144a3f0254'},
  sohila: {path: 'nitnem/data/sohila.json', count: 56, sha256: '7fe21aec71a889c452d639141994087ee2a1390d800c78b59bf604c4496df673', selection: '9a3ba57baaa353fa3408ba3e68b4f031261a90e748354bc69b024dfa14ebd204'},
  sukhmani: {path: 'js/sukhmani-data.js', count: 2027, sha256: '0cdd704749265c09ead442ec5fd6c84569b1da34dd40ec021585dacd4a1c65f6', selection: 'd4dc1072c401e20783adab6f703bfb6d2d58cb04a90164da9eaf2efa26071529'}
};
const baniReadings = new Map(), baniRaw = new Map();
async function prepareBanis() {
  for (const [id, spec] of Object.entries(baniSpecs)) {
    const bytes = await readPublic(spec.path); assert.equal(hash(bytes), spec.sha256);
    baniRaw.set(id, bytes);
    let literal = bytes.toString('utf8');
    if (spec.path.endsWith('.js')) literal = literal.slice(literal.indexOf('=') + 1).trim().replace(/;$/, '');
    const data = JSON.parse(literal), rows = [];
    if (id === 'japji' || id === 'sukhmani') {
      for (const unit of data[id === 'japji' ? 'units' : 'ashtpadis'])
        for (const line of unit.lines) rows.push({text: line[id === 'japji' ? 'text' : 'gurmukhi'], sourceUnitId: unit.id, sha256: line.sha256});
    } else {
      for (const line of data.preface || []) rows.push({...line, sourceUnitId: data.units[0].id});
      for (const unit of data.units) {
        const ordered = unit.sourceDisplayOrder ? unit.sourceDisplayOrder.map(item => item.kind === 'line'
          ? unit.lines.find(line => line.id === item.id) : unit.metricalHeadings[item.index])
          : [...(unit.metricalHeadings || []), ...unit.lines];
        for (const line of ordered) rows.push({...line, sourceUnitId: unit.id});
      }
    }
    assert.equal(rows.length, spec.count);
    for (const row of rows) assert.equal(hash(row.text), row.sha256);
    baniReadings.set(id, {binding: {collectionId: 'daily-bani', editionId: 'glp-daily-bani-pinned-originals-20261127-v1',
      manifestSha256: spec.selection, selectionId: 'bani:' + id, units: [{id, sha256: spec.sha256}]},
      lines: rows.map((row, index) => ({id: id + '-l' + String(index + 1).padStart(4, '0'),
        text: row.text, unitId: id, sourceUnitId: row.sourceUnitId, sha256: row.sha256}))});
  }
  const parts = ['japji', 'jaap', 'savaiye', 'chaupai', 'anand'];
  baniReadings.set('morning', {binding: {collectionId: 'daily-bani', editionId: 'glp-daily-bani-pinned-originals-20261127-v1',
    manifestSha256: '71109f361d9039db365987d5af016376a7ad2a33f7e69e540520ada3c477ede3', selectionId: 'bani:morning',
    units: parts.map(id => ({id, sha256: baniSpecs[id].sha256}))}, lines: parts.flatMap(id => baniReadings.get(id).lines)});
  assert.equal([...baniReadings.values()].slice(0, 8).reduce((sum, reading) => sum + reading.lines.length, 0), 3809);
  assert.equal(baniReadings.get('morning').lines.length, 1567);
}
async function prepareSource(collectionId) {
  const spec = specs[collectionId], base = 'collections/source-data/' + collectionId + '/';
  const bytes = await readPublic(base + 'manifest.json');
  assert.equal(bytes.length, spec.bytes); assert.equal(hash(bytes), spec.sha256);
  const manifest = JSON.parse(bytes);
  assert.equal(manifest.collectionId, collectionId); assert.equal(manifest.editionId, spec.editionId);
  const chunks = new Map(), groups = new Map();
  async function unitFor(id) {
    if (groups.has(id)) return groups.get(id);
    const descriptor = manifest.units.find(unit => unit.id === id); assert.ok(descriptor, 'Known independent unit ' + id);
    const chunkInfo = manifest.chunks.find(chunk => chunk.id === descriptor.chunkId); assert.ok(chunkInfo);
    if (!chunks.has(chunkInfo.id)) {
      const bytes = await readPublic(base + chunkInfo.path);
      assert.equal(bytes.length, chunkInfo.bytes); assert.equal(hash(bytes), chunkInfo.sha256);
      chunks.set(chunkInfo.id, {bytes, data: JSON.parse(bytes), relative: base + chunkInfo.path});
    }
    const unit = chunks.get(chunkInfo.id).data.units.find(value => value.id === id); assert.ok(unit);
    assert.equal(hash(JSON.stringify(unit)), descriptor.sha256); groups.set(id, unit); return unit;
  }
  fixtures[collectionId] = {manifest, spec, base, chunks, unitFor};
}
async function expectedReading(collectionId, selectionId) {
  const fixture = fixtures[collectionId];
  const descriptors = selectionId.startsWith('section:')
    ? fixture.manifest.units.filter(unit => unit.sectionId === selectionId.slice(8))
    : fixture.manifest.units.filter(unit => unit.id === selectionId.slice(5));
  assert.ok(descriptors.length);
  const units = await Promise.all(descriptors.map(unit => fixture.unitFor(unit.id)));
  return {binding: {collectionId, editionId: fixture.spec.editionId, manifestSha256: fixture.spec.sha256,
    selectionId, units: descriptors.map(unit => ({id: unit.id, sha256: unit.sha256}))},
    lines: units.flatMap(unit => unit.lines.map(line => ({id: line.id, unitId: unit.id, page: line.page, text: line.text})))};
}
const timingKey = (video, reading) => TIMING_PREFIX + video + ':' + reading.binding.collectionId + ':'
  + reading.binding.manifestSha256 + ':' + reading.binding.selectionId;
const timing = (reading, cues, videoId = VIDEO) => ({schema: 'glp.youtube-read-along.v1',
  timingStatus: 'USER_MARKED', videoId, source: structuredClone(reading.binding), cues});
const clone = value => JSON.parse(JSON.stringify(value));
const validMetadata = videoId => ({items: [{id: videoId,
  status: {embeddable: true, privacyStatus: 'public', madeForKids: false},
  snippet: {liveBroadcastContent: 'none'}}]});

// This function is serialized only into the intercepted official API response.
// It is never included in a production bundle, source file or deployed provider.
function testOnlyYouTubeSDK(configuration) {
  'use strict';
  const players = [], calls = [];
  class Player {
    constructor(frame, options) {
      if (!(frame instanceof HTMLIFrameElement)) throw Error('TEST ONLY SDK expects the real adapter iframe');
      this.frame = frame; this.events = options.events || {}; this.videoId = new URL(frame.src).pathname.split('/').at(-1);
      this.time = 0; this.duration = 600; this.state = -1; this.rate = 1; this.destroyed = false;
      this.index = players.length; players.push(this); calls.push(['construct', this.index, this.videoId]);
      this.ready = false;
      calls.push(['constructionControlsAbsent', this.index,
        ['getCurrentTime', 'getDuration', 'getPlayerState', 'getPlaybackRate', 'getVideoUrl', 'seekTo', 'pauseVideo']
          .every(name => typeof this[name] === 'undefined')]);
      // Real YouTube installs these methods only when the iframe is ready.
      // Keep them off the prototype too, so a premature check really fails.
      this.becomeReady = () => {
        Object.assign(this, {
          getCurrentTime: () => { calls.push(['getCurrentTime', this.index]); return this.time; },
          getDuration: () => this.duration,
          getPlayerState: () => this.state,
          getPlaybackRate: () => this.rate,
          getVideoUrl: () => 'https://www.youtube.com/watch?v=' + this.videoId,
          seekTo: (seconds, allowSeekAhead) => {
            const previousState = this.state, rect = this.frame.getBoundingClientRect();
            const geometry = {x: rect.x, y: rect.y, width: rect.width, height: rect.height,
              fullyVisible: rect.top >= 0 && rect.left >= 0 && rect.bottom <= innerHeight && rect.right <= innerWidth,
              centreUncovered: document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === this.frame};
            calls.push(['seekTo', this.index, seconds, allowSeekAhead, previousState, geometry]); this.time = seconds;
            // A paused player stays paused; other states start playback on seek.
            if (previousState !== 2) { this.state = 1; this.emit('onStateChange', 1); }
          },
          pauseVideo: () => {
            calls.push(['pauseVideo', this.index]);
            if (this.failPause) { this.failPause = false; throw Error('TEST ONLY pause failure'); }
            this.state = 2; this.emit('onStateChange', 2);
          }
        });
        this.ready = true; calls.push(['ready', this.index]); this.emit('onReady');
      };
      if (configuration.synchronousReady) this.becomeReady();
      else if (!configuration.manualReady) setTimeout(this.becomeReady, configuration.readyDelayMs || 0);
    }
    emit(name, data) { this.events[name]?.({target: this, data}); }
    destroy() { calls.push(['destroy', this.index]); this.destroyed = true; this.frame.remove(); }
  }
  window.YT = {Player, PlayerState: {UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5}};
  const current = () => players.filter(player => !player.destroyed).at(-1);
  window.__TEST_ONLY_YOUTUBE = {
    snapshot() { return {players: players.map(p => ({index: p.index, videoId: p.videoId, time: p.time,
      state: p.state, rate: p.rate, ready: p.ready, destroyed: p.destroyed,
      controlsAvailable: ['getCurrentTime', 'getDuration', 'getPlayerState', 'getPlaybackRate', 'getVideoUrl', 'seekTo', 'pauseVideo']
        .filter(name => typeof p[name] === 'function')})), calls: calls.map(value => [...value])}; },
    ready(index = players.length - 1) { players[index].becomeReady(); },
    clock(seconds, state, rate) {
      const player = current(); if (!player) throw Error('No synthetic player');
      player.time = seconds;
      if (rate !== undefined) { player.rate = rate; player.emit('onPlaybackRateChange', rate); }
      if (state !== undefined) { player.state = state; player.emit('onStateChange', state); }
    },
    nativeSeek(seconds) { const player = current(); player.seekTo(seconds, true); },
    error(code) { current().emit('onError', code); },
    failNextPause() { current().failPause = true; },
    blocked() { current().emit('onAutoplayBlocked'); },
    changeRecording(videoId) { const player = current(); player.videoId = videoId; player.state = 1; player.emit('onStateChange', 1); },
    late(index, seconds, state = 1) { const player = players[index]; player.time = seconds; player.state = state;
      player.emit('onReady'); player.emit('onStateChange', state); }
  };
  window.onYouTubeIframeAPIReady?.();
}
const sdkBody = configuration => '// TEST ONLY: synthetic official-player response; never production.\n('
  + testOnlyYouTubeSDK.toString() + ')(' + JSON.stringify(configuration) + ');\n';
const iframeBody = '<!doctype html><html><head><meta charset="utf-8"><title>TEST ONLY synthetic player</title></head>'
  + '<body style="margin:0;background:#17212c;color:white;display:grid;place-items:center;min-height:200px;font:16px sans-serif">'
  + '<p>TEST ONLY<br>Synthetic YouTube player<br>No recording is playing</p></body></html>';

let browser, server, origin, japji, positiveBundle, positiveHTML, seed;
const ready = page => page.waitForSelector('#source-status[data-state="ready"]');
async function openApp(page) {
  await page.goto(origin + prefix + pagePath); await ready(page);
  await page.waitForFunction(() => document.querySelectorAll('#read-along-text [data-line-id]').length === 385);
  assert.equal(await page.locator('#timing-editor').evaluate(element => element.open), false,
    'Timing editor starts closed so the reading remains prominent');
}
async function eventually(predicate, label) {
  const until = Date.now() + 15000;
  while (!predicate()) {
    if (Date.now() >= until) throw Error('Timed out: ' + label);
    await new Promise(resolve => setTimeout(resolve, 25));
  }
}
async function exactSource(page, reading) {
  const actual = await page.locator('#read-along-text [data-line-id]').evaluateAll(nodes => nodes.map(node => ({
    id: node.dataset.lineId, text: node.querySelector('.read-along-original')?.textContent
  })));
  assert.deepEqual(actual, reading.lines.map(line => ({id: line.id, text: line.text})), 'Exact complete selected originals');
  assert.equal(new Set(actual.map(line => line.id)).size, reading.lines.length);
}
async function selectedLine(page, id) {
  await page.locator('#read-along-text [data-line-id="' + id + '"]').click();
  await page.waitForFunction(id => document.querySelector('#read-along-text [data-line-id="' + id + '"]')?.dataset.selected === 'true', id);
}
async function clickTimingEditorControl(page, id) {
  const button = page.locator('#' + id);
  const editorId = await button.evaluate(element => element.closest('details')?.id);
  assert.equal(editorId, 'timing-editor', 'Marking controls belong to the optional timing editor');
  const editor = page.locator('#' + editorId);
  if (!await editor.evaluate(element => element.open)) await editor.locator(':scope > summary').click();
  await button.click();
}
async function connect(page, video = VIDEO, input) {
  await page.locator('#video-url').fill(input || 'https://www.youtube.com/watch?v=' + video);
  await page.locator('#video-load').click();
  await page.waitForSelector('#video-status[data-state="ready"]');
  await page.waitForFunction(video => window.__TEST_ONLY_YOUTUBE?.snapshot().players.some(p => !p.destroyed && p.videoId === video), video);
}
async function mediaClock(page, seconds, state = 1, rate) {
  await page.evaluate(({seconds, state, rate}) => window.__TEST_ONLY_YOUTUBE.clock(seconds, state, rate), {seconds, state, rate});
}
async function activeLine(page, id) {
  await page.waitForFunction(id => {
    const active = [...document.querySelectorAll('#read-along-text [data-line-id][data-active="true"]')];
    return id === null ? active.length === 0 : active.length === 1 && active[0].dataset.lineId === id;
  }, id);
}
async function openSourceChooser(page) {
  const chooser = page.locator('details.source-chooser');
  if (!await chooser.evaluate(element => element.open)) await chooser.locator(':scope > summary').click();
}
async function browseGroup(page, collection, pageNumber, unitId) {
  await openSourceChooser(page);
  await page.locator('#source-mode').selectOption(collection);
  await page.locator('#source-page').fill(String(pageNumber)); await page.locator('#source-find').click();
  const expected = fixtures[collection].manifest.units.filter(unit => unit.pages.includes(pageNumber)).map(unit => unit.id);
  await page.waitForFunction(ids => {
    const values = [...document.querySelectorAll('#source-group option')].map(option => option.value).filter(Boolean);
    return JSON.stringify(values) === JSON.stringify(ids);
  }, expected);
  assert.deepEqual(await page.locator('#source-group option').evaluateAll(nodes => nodes.map(node => node.value).filter(Boolean)), expected);
  await page.locator('#source-group').selectOption(unitId); await page.locator('#source-open').click(); await ready(page);
  const reading = await expectedReading(collection, 'unit:' + unitId);
  await page.waitForFunction(({first, length}) => {
    const rows = document.querySelectorAll('#read-along-text [data-line-id]');
    return rows.length === length && rows[0]?.dataset.lineId === first;
  }, {first: reading.lines[0].id, length: reading.lines.length});
  await exactSource(page, reading); return reading;
}
async function chooseBani(page, id) {
  await openSourceChooser(page);
  await page.locator('#source-mode').selectOption('bani');
  await page.locator('#source-bani').selectOption(id);
}
async function openBani(page, id) {
  await chooseBani(page, id); await page.locator('#source-open').click(); await ready(page);
  const reading = baniReadings.get(id);
  await page.waitForFunction(({first, count}) => {
    const rows = document.querySelectorAll('#read-along-text [data-line-id]');
    return rows.length === count && rows[0]?.dataset.lineId === first;
  }, {first: reading.lines[0].id, count: reading.lines.length});
  await exactSource(page, reading); return reading;
}
async function exported(page) {
  const pending = page.waitForEvent('download'); await page.locator('#timing-export').click();
  const download = await pending, stream = await download.createReadStream(); assert.ok(stream);
  const parts = []; for await (const part of stream) parts.push(part);
  const bytes = Buffer.concat(parts); assert.ok(bytes.length <= 262144);
  return {value: JSON.parse(bytes), sha256: hash(bytes), bytes: bytes.length, name: download.suggestedFilename()};
}
async function importTiming(page, value, name = 'synthetic-timings.json') {
  const before = await page.evaluate(() => window.__TEST_TIMING_MUTATIONS || 0);
  await page.locator('#timing-import').setInputFiles({name, mimeType: 'application/json',
    buffer: Buffer.from(typeof value === 'string' ? value : JSON.stringify(value))});
  await page.waitForFunction(before => (window.__TEST_TIMING_MUTATIONS || 0) > before, before);
}
async function preserveLearning(page, {noWrites = false} = {}) {
  const value = await page.evaluate(() => window.__TEST_READ_ALONG_STORAGE_SNAPSHOT());
  for (const [key, text] of Object.entries(seed)) assert.equal(value.local[key], text, 'Unchanged previous record ' + key);
  assert.deepEqual(value.session, {}, 'No session-storage side channel');
  const audit = await page.evaluate(() => window.__TEST_READ_ALONG_STORAGE);
  const onlyTiming = entry => entry[0] === 'local' && entry[1].startsWith(TIMING_PREFIX);
  assert.ok(audit.reads.every(onlyTiming), 'No reads of old learning, private data or other stores');
  assert.ok(audit.writes.every(onlyTiming), 'Only explicit timing records may be written');
  assert.ok(audit.removes.every(onlyTiming), 'Only companion timing records may be removed');
  assert.deepEqual(audit.clears, [], 'Never clear a storage area');
  if (noWrites) { assert.deepEqual(audit.writes, []); assert.deepEqual(audit.removes, []); }
  for (const key of Object.keys(value.local)) assert.ok(Object.hasOwn(seed, key) || key.startsWith(TIMING_PREFIX), 'No unrelated new storage key');
  return {audit, local: value.local};
}
async function geometry(page, width) {
  await page.setViewportSize({width, height: 900});
  assert.equal(await page.locator('#timing-editor').evaluate(element => element.open), false,
    'Reading screenshots retain the initially collapsed timing editor');
  const fixtureBody = page.frameLocator('#youtube-player iframe').locator('body')
    .filter({hasText: 'TEST ONLY'}).filter({hasText: 'No recording is playing'});
  await fixtureBody.waitFor({state: 'visible'});
  await page.evaluate(async () => {
    const workspace = document.querySelector('.workspace');
    window.scrollTo({top: Math.max(0, scrollY + workspace.getBoundingClientRect().top - 16), behavior: 'instant'});
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
  await fixtureBody.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const metrics = await page.evaluate(() => {
    const frame = document.querySelector('#youtube-player iframe'), rect = frame?.getBoundingClientRect();
    return {viewport: innerWidth, documentWidth: document.documentElement.scrollWidth,
      frame: rect ? {x: rect.x, y: rect.y, width: rect.width, height: rect.height} : null,
      centreUncovered: !!rect && document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === frame};
  });
  assert.ok(metrics.documentWidth <= metrics.viewport, 'No horizontal page overflow');
  assert.ok(metrics.frame && metrics.frame.width >= 200 && metrics.frame.height >= 200, 'Player viewport at least 200 by 200 CSS px');
  assert.ok(metrics.frame.x >= 0 && metrics.frame.x + metrics.frame.width <= metrics.viewport + 1, 'Player fits viewport');
  assert.equal(metrics.centreUncovered, true, 'App text and controls do not cover the player');
  return metrics;
}

async function scenario(name, run, options = {}) {
  if (scenarioFilter && !name.includes(scenarioFilter)) return;
  const check = {name, status: 'PASS', requests: [], provider: [], unexpectedExternal: [], routeErrors: [], pageErrors: [], consoleErrors: []};
  report.checks.push(check);
  const context = await browser.newContext({viewport: {width: 320, height: 900}, serviceWorkers: 'block',
    reducedMotion: 'reduce', colorScheme: 'light', acceptDownloads: true,
    storageState: {cookies: [], origins: [{origin, localStorage: Object.entries({...seed, ...options.records}).map(([name, value]) => ({name, value}))}]}});
  await context.addInitScript(({quota}) => {
    if (window !== window.top) return;
    const original = {get: Storage.prototype.getItem, set: Storage.prototype.setItem,
      remove: Storage.prototype.removeItem, clear: Storage.prototype.clear, key: Storage.prototype.key};
    const area = storage => storage === localStorage ? 'local' : 'session';
    window.__TEST_READ_ALONG_STORAGE = {reads: [], writes: [], removes: [], clears: []};
    Storage.prototype.getItem = function(key) { window.__TEST_READ_ALONG_STORAGE.reads.push([area(this), String(key)]); return original.get.call(this, key); };
    Storage.prototype.setItem = function(key, value) {
      window.__TEST_READ_ALONG_STORAGE.writes.push([area(this), String(key), String(value)]);
      if (quota && String(key).startsWith('glp001.youtube-timing.v1:')) throw new DOMException('TEST ONLY quota failure', 'QuotaExceededError');
      return original.set.call(this, key, value);
    };
    Storage.prototype.removeItem = function(key) { window.__TEST_READ_ALONG_STORAGE.removes.push([area(this), String(key)]); return original.remove.call(this, key); };
    Storage.prototype.clear = function() { window.__TEST_READ_ALONG_STORAGE.clears.push(area(this)); return original.clear.call(this); };
    const snapshot = storage => Object.fromEntries(Array.from({length: storage.length}, (_, index) => {
      const key = original.key.call(storage, index); return [key, original.get.call(storage, key)];
    }));
    window.__TEST_READ_ALONG_STORAGE_SNAPSHOT = () => ({local: snapshot(localStorage), session: snapshot(sessionStorage)});
    addEventListener('DOMContentLoaded', () => {
      window.__TEST_TIMING_MUTATIONS = 0;
      const status = document.getElementById('timing-status');
      if (status) new MutationObserver(() => { window.__TEST_TIMING_MUTATIONS++; }).observe(status, {subtree: true, childList: true, characterData: true, attributes: true});
    });
  }, {quota: options.quota === true});
  await context.route('**/*', async route => {
    try {
    const request = route.request(), url = new URL(request.url());
    if (url.origin === origin) {
      const relative = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : '';
      if (options.beforeLocal) await options.beforeLocal(relative, check);
      const mutations = {...(options.configured === false ? {} : {[pagePath]: positiveHTML, [bundlePath]: positiveBundle}), ...options.mutations};
      if (Object.hasOwn(mutations, relative)) {
        await route.fulfill({status: 200, contentType: mime[path.extname(relative)], body: mutations[relative]}); return;
      }
      await route.continue(); return;
    }
    const log = {host: url.hostname, path: url.pathname, method: request.method()};
    check.provider.push(log);
    if (options.configured === false) { check.unexpectedExternal.push(log); await route.abort(); return; }
    if (url.origin === 'https://www.googleapis.com' && url.pathname === '/youtube/v3/videos') {
      log.kind = 'metadata'; log.videoId = url.searchParams.get('id');
      assert.equal(url.searchParams.get('key'), 'fixture-key', 'Synthetic provider configuration only');
      assert.equal(url.searchParams.get('part'), 'id,status,snippet');
      assert.equal(request.method(), 'GET'); assert.equal(request.postData(), null);
      const supplied = options.metadata ? await options.metadata(log.videoId, check) : {body: validMetadata(log.videoId)};
      try { await route.fulfill({status: supplied.status || 200, contentType: 'application/json',
        headers: {'access-control-allow-origin': origin, 'cache-control': 'no-store'},
        body: JSON.stringify(supplied.body ?? validMetadata(log.videoId))}); } catch (error) {
        if (!request.failure() && !/closed|cancel|aborted|handled|invalid interception|interception.*not found/i.test(error.message)) throw error;
      }
      return;
    }
    if (url.href === 'https://www.youtube.com/iframe_api') {
      log.kind = 'sdk';
      if (options.sdkFailure) { await route.abort(); return; }
      await route.fulfill({status: 200, contentType: 'text/javascript', body: sdkBody(options.sdk || {})}); return;
    }
    if (url.origin === 'https://www.youtube-nocookie.com' && /^\/embed\/[A-Za-z0-9_-]{11}$/.test(url.pathname)) {
      log.kind = 'frame'; log.videoId = url.pathname.split('/').at(-1);
      assert.equal(url.searchParams.get('origin'), origin);
      assert.equal(url.searchParams.get('enablejsapi'), '1'); assert.equal(url.searchParams.get('autoplay'), '0');
      assert.equal(url.searchParams.get('controls'), '1');
      await route.fulfill({status: 200, contentType: 'text/html', body: iframeBody}); return;
    }
    check.unexpectedExternal.push(log); await route.abort();
    } catch (error) {
      check.routeErrors.push(error.stack || String(error));
      await route.abort().catch(() => {});
    }
  });
  const page = await context.newPage(); page.setDefaultTimeout(15000);
  page.on('request', request => check.requests.push({host: new URL(request.url()).hostname,
    path: new URL(request.url()).pathname, method: request.method(), body: request.postData()}));
  page.on('pageerror', error => check.pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') check.consoleErrors.push(message.text()); });
  try {
    await run(page, check, context);
    assert.deepEqual(check.pageErrors, []); assert.deepEqual(check.unexpectedExternal, []); assert.deepEqual(check.routeErrors, []);
    if (!options.consoleRefusal) assert.deepEqual(check.consoleErrors, []);
    assert.ok(check.requests.every(request => request.method === 'GET' && request.body === null), 'No notes, timings or source text uploaded');
    assert.ok(check.requests.every(request => !request.path.includes('/private-library/') && !isUnbundled(request.path.slice(prefix.length))), 'No private or unbundled app request');
    assert.deepEqual(await context.cookies(), [], 'The fixture stores no provider or account cookies');
  } catch (error) {
    check.status = 'FAIL'; check.error = error.stack || String(error); report.status = 'FAIL';
    report.failures.push({name, error: error.message});
  } finally { await context.close(); }
}

try {
  const {chromium} = await import(process.env.GLP_PLAYWRIGHT_MODULE || 'playwright');
  await prepareSource('sggs'); await prepareSource('dasam');
  await prepareBanis();
  japji = await expectedReading('sggs', 'section:1DSA');
  assert.equal(japji.binding.units.length, 39); assert.equal(japji.lines.length, 385);
  assert.deepEqual(japji.binding.units.map(unit => unit.id).slice(0, 2), ['DMP', 'LLL']);
  assert.equal(japji.binding.units.at(-1).id, 'BB8');
  assert.equal(japji.binding.units[0].sha256, 'ae2d9ba49508ddb5b05c818c55925fa7e51c9067aa62a26f00730c4babcd6566');
  assert.equal(japji.binding.units.at(-1).sha256, '50a642efe773df2294499cfcc82e0f993ab8856e369cac51635bf37c92c1300e');
  await fixtures.sggs.unitFor('ZKH'); await fixtures.sggs.unitFor('TNM');
  await fixtures.dasam.unitFor('2NB'); await fixtures.dasam.unitFor('4TJ');
  seed = {
    'glp001.continuous.v2': '{"version":999,"notes":{"mool.line01":"SYNTHETIC old Japji reflection — ਪੰਜਾਬੀ"},"future":"preserve exactly"}',
    'glp001.fullJapji.v1': '{SYNTHETIC malformed legacy record, deliberately unrepaired',
    'glp001.sukhmani.v1': 'SYNTHETIC Sukhmani record — untouched',
    'glp001.knowledge.learning.v1': '{"SYNTHETIC":"knowledge reflection"}',
    'glp001.nitnem.PRIVATE-SOURCE-REVIEW.v1.jaap.fixture': 'SYNTHETIC Nitnem reflection — untouched',
    ['glp001.sikh-source-place.v1:sggs:' + specs.sggs.editionId]: 'SYNTHETIC SGGS place — untouched',
    'private.synthetic.do-not-read': 'SYNTHETIC private-data sentinel, not an owner PIN',
    'unrelated.synthetic.reflection': 'SYNTHETIC unrelated record — untouched'
  };
  const bundle = await readPublic(bundlePath), html = await readPublic(pagePath), configuration = await readPublic(configPath, {configuration: true});
  assert.match(configuration.toString(), /export\s+const\s+YOUTUBE_DATA_API_KEY\s*=\s*(['"])\1\s*;/, 'Candidate provider configuration is explicitly empty');
  const originalSRI = sri(bundle);
  assert.equal(html.toString().split(originalSRI).length - 1, 1, 'Candidate HTML pins its actual owned bundle');
  const {buildAppBundle} = await import(pathToFileURL(path.join(root, 'tools/build-app-bundles.mjs')).href);
  const fixture = await buildAppBundle('read-along', {directory: root, overrides: {
    [configPath]: 'export const YOUTUBE_DATA_API_KEY = "fixture-key";\n'
  }});
  positiveBundle = Buffer.from(fixture.code); positiveHTML = Buffer.from(html.toString().replace(originalSRI, sri(positiveBundle)));
  report.syntheticFixture = {mode: fixture.graph.mode, overridePaths: [configPath],
    bundleSha256: hash(positiveBundle), htmlSha256: hash(positiveHTML), disclosure: 'TEST ONLY provider configuration and responses'};
  server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (pathname === '/favicon.ico') { response.writeHead(204); response.end(); return; }
      if (!pathname.startsWith(prefix)) throw Error('Outside fixture mount');
      let relative = pathname.slice(prefix.length); if (relative.endsWith('/')) relative += 'index.html';
      if (!isPublic(relative) || isUnbundled(relative)) throw Error('Undeclared public path');
      const bytes = await readPublic(relative);
      response.writeHead(200, {'content-type': mime[path.extname(relative)], 'content-length': String(bytes.length), 'cache-control': 'no-store'}); response.end(bytes);
    } catch { response.writeHead(404, {'cache-control': 'no-store'}); response.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch({headless: true, ...(process.env.GLP_CHROMIUM_EXECUTABLE ? {executablePath: process.env.GLP_CHROMIUM_EXECUTABLE} : {}), args: ['--no-sandbox']});
  report.environment = {node: process.version, platform: process.platform, browser: browser.version(),
    executable: process.env.GLP_CHROMIUM_EXECUTABLE || 'Playwright browser'};

  await scenario('Actual default build reads full Japji and refuses unconfigured playback without any provider request', async (page, check) => {
    await openApp(page); await exactSource(page, japji);
    assert.equal(await page.locator('#youtube-player iframe').count(), 0); assert.deepEqual(check.provider, []);
    await page.locator('#video-url').fill('https://youtu.be/' + VIDEO);
    assert.deepEqual(check.provider, []);
    await page.locator('#video-load').click();
    await page.waitForSelector('#video-status[data-state="unavailable"], #video-status[data-state="refused"]');
    assert.match(await page.locator('#video-status').textContent(), /configur|setup/i);
    assert.equal(await page.locator('#youtube-player iframe').count(), 0); assert.deepEqual(check.provider, []);
    assert.ok((await page.locator('#youtube-fallback').getAttribute('href')).includes(VIDEO));
    await page.setViewportSize({width: 1280, height: 900});
    await page.evaluate(() => {
      const status = document.getElementById('video-status');
      window.scrollTo({top: Math.max(0, scrollY + status.getBoundingClientRect().top - 16), behavior: 'instant'});
    });
    check.screenshot = 'actual-candidate-unconfigured-1280.png';
    await page.screenshot({path: path.join(out, check.screenshot), fullPage: false});
    check.storage = await preserveLearning(page, {noWrites: true});
  }, {configured: false});

  await scenario('Player readiness waits for controls installed by the iframe ready event', async (page, check) => {
    await openApp(page);
    await page.locator('#video-url').fill('https://youtu.be/' + VIDEO); await page.locator('#video-load').click();
    await page.waitForFunction(() => window.__TEST_ONLY_YOUTUBE?.snapshot().players.length === 1);
    const before = await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.snapshot());
    assert.equal(before.players[0].ready, false); assert.equal(before.players[0].destroyed, false);
    assert.deepEqual(before.players[0].controlsAvailable, [], 'No playback controls exist before onReady');
    assert.ok(before.calls.some(call => call[0] === 'constructionControlsAbsent' && call[2] === true));
    assert.equal(before.calls.some(call => ['getCurrentTime', 'seekTo', 'pauseVideo'].includes(call[0])), false,
      'The adapter does not read or control the unready player');
    assert.equal(await page.locator('#youtube-player iframe').count(), 1, 'Keep the connecting iframe');
    assert.equal(await page.locator('#mark-selected').isDisabled(), true);
    await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.ready());
    await page.waitForSelector('#video-status[data-state="ready"]');
    const after = await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.snapshot());
    assert.equal(after.players[0].controlsAvailable.length, 7); assert.equal(after.players[0].destroyed, false);
    assert.equal(await page.locator('#mark-selected').isDisabled(), false);
    check.lifecycle = {before, after}; check.storage = await preserveLearning(page, {noWrites: true});
  }, {sdk: {manualReady: true}});

  await scenario('Configured fixture stays disconnected until Load and preserves a visible native-provider surface at 320 and 1280px', async (page, check) => {
    await openApp(page); await exactSource(page, japji); assert.deepEqual(check.provider, []);
    await connect(page, VIDEO, 'https://youtu.be/' + VIDEO);
    assert.deepEqual(check.provider.filter(value => value.kind === 'metadata').map(value => value.videoId), [VIDEO]);
    assert.equal(check.provider.filter(value => value.kind === 'sdk').length, 1);
    await page.waitForSelector('#youtube-player iframe');
    assert.equal(await page.locator('#youtube-player iframe').getAttribute('referrerpolicy'), 'strict-origin-when-cross-origin');
    check.narrow = await geometry(page, 320);
    await page.screenshot({path: path.join(out, 'synthetic-player-320.png'), fullPage: false});
    check.desktop = await geometry(page, 1280);
    await page.screenshot({path: path.join(out, 'synthetic-player-1280.png'), fullPage: false});
    check.screenshots = ['synthetic-player-320.png', 'synthetic-player-1280.png'];
    await exactSource(page, japji); check.storage = await preserveLearning(page, {noWrites: true});
  });

  for (const [name, alter] of [
    ['embedding disabled', body => { body.items[0].status.embeddable = false; }],
    ['missing MadeForKids status', body => { delete body.items[0].status.madeForKids; }],
    ['ambiguous video identity', body => { body.items.push(clone(body.items[0])); }],
    ['live timeline', body => { body.items[0].snippet.liveBroadcastContent = 'live'; }],
    ['missing recording', body => { body.items = []; }]
  ]) await scenario('Metadata preflight refuses ' + name + ' before loading the player script', async (page, check) => {
    await openApp(page); await page.locator('#video-url').fill('https://www.youtube.com/watch?v=' + VIDEO);
    await page.locator('#video-load').click();
    await page.waitForSelector('#video-status[data-state="unavailable"], #video-status[data-state="refused"]');
    assert.equal(check.provider.filter(value => value.kind === 'metadata').length, 1);
    assert.equal(check.provider.filter(value => value.kind === 'sdk' || value.kind === 'frame').length, 0);
    assert.equal(await page.locator('#youtube-player iframe').count(), 0); await exactSource(page, japji);
    check.storage = await preserveLearning(page, {noWrites: true});
  }, {metadata: async id => { const body = validMetadata(id); alter(body); return {body}; }});

  await scenario('Provider metadata HTTP failure remains an honest fallback', async (page, check) => {
    await openApp(page); await page.locator('#video-url').fill('https://www.youtube.com/watch?v=' + VIDEO); await page.locator('#video-load').click();
    await page.waitForSelector('#video-status[data-state="unavailable"], #video-status[data-state="refused"]');
    assert.equal(check.provider.filter(value => value.kind === 'sdk' || value.kind === 'frame').length, 0);
    check.storage = await preserveLearning(page, {noWrites: true});
  }, {metadata: async () => ({status: 403, body: {error: {message: 'TEST ONLY quota/configuration refusal'}}}), consoleRefusal: true});

  await scenario('Checked MadeForKids recording with a positive link offset and synchronous readiness seeks while paused without autoplay', async (page, check) => {
    await openApp(page); await connect(page, VIDEO, 'https://www.youtube.com/shorts/' + VIDEO + '?t=1m23s');
    assert.equal(check.provider.filter(value => value.kind === 'metadata').length, 1);
    const snapshot = await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.snapshot());
    const player = snapshot.players.find(value => !value.destroyed);
    assert.equal(player.time, 83); assert.equal(player.state, 2, 'A start offset must not autoplay');
    const seekIndex = snapshot.calls.findIndex(call => call[0] === 'seekTo' && call[1] === player.index);
    assert.ok(seekIndex >= 0); assert.equal(snapshot.calls[seekIndex][2], 83);
    assert.equal(snapshot.calls[seekIndex][4], 2, 'Pause before seek, including synchronous readiness');
    assert.ok(snapshot.calls.slice(0, seekIndex).some(call => call[0] === 'pauseVideo' && call[1] === player.index));
    assert.equal(await page.locator('#player-state').textContent(), 'Paused');
    await exactSource(page, japji); check.storage = await preserveLearning(page, {noWrites: true});
  }, {metadata: async id => { const body = validMetadata(id); body.items[0].status.madeForKids = true; return {body}; },
    sdk: {synchronousReady: true}});

  await scenario('A share-link offset beyond the recording is ignored with a clear notice while the native player remains connected', async (page, check) => {
    await openApp(page); await connect(page, VIDEO, 'https://youtu.be/' + VIDEO + '?t=601');
    const snapshot = await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.snapshot());
    const player = snapshot.players.find(value => !value.destroyed);
    assert.ok(player, 'The 600-second fixture recording remains open');
    assert.equal(player.time, 0); assert.notEqual(player.state, 1, 'Ignoring an offset does not autoplay');
    assert.deepEqual(snapshot.calls.filter(call => call[0] === 'seekTo'), [], 'No invalid seek is sent to the provider');
    assert.equal(await page.locator('#youtube-player iframe').count(), 1);
    assert.equal(await page.locator('#video-disconnect').isDisabled(), false);
    const message = await page.locator('#video-status').textContent();
    assert.match(message, /offset|start time/i); assert.match(message, /ignored/i);
    assert.doesNotMatch(message, /timing marker|unavailable/i);
    await mediaClock(page, 5, 2);
    assert.equal(await page.locator('#video-status').getAttribute('data-state'), 'ready');
    assert.equal(await page.locator('#mark-selected').isDisabled(), false, 'A valid recording still supplies a usable clock');
    await exactSource(page, japji); check.storage = await preserveLearning(page, {noWrites: true});
  }, {sdk: {synchronousReady: true}});

  await scenario('An arbitrary host or iframe HTML never becomes a provider request', async (page, check) => {
    await openApp(page);
    for (const input of ['https://youtube.com.evil.invalid/watch?v=' + VIDEO, '<iframe src="https://www.youtube.com/embed/' + VIDEO + '"></iframe>']) {
      await page.locator('#video-url').fill(input); await page.locator('#video-load').click();
      await page.waitForSelector('#video-status[data-state="refused"]');
      assert.deepEqual(check.provider, []); assert.equal(await page.locator('#youtube-player iframe').count(), 0);
    }
    check.storage = await preserveLearning(page, {noWrites: true});
  });

  await scenario('Source selection exposes complete SGGS cross-Ang groups without contacting YouTube', async (page, check) => {
    await openApp(page); const short = await browseGroup(page, 'sggs', 2, 'ZKH');
    assert.ok(short.lines.some(line => line.page === 1) && short.lines.some(line => line.page === 2));
    const long = await browseGroup(page, 'sggs', 929, 'TNM');
    assert.equal(long.lines.length, 399); assert.equal(long.lines.at(-1).page, 938);
    assert.deepEqual(check.provider, []); check.storage = await preserveLearning(page, {noWrites: true});
  });

  await scenario('Dasam page 738 offers both complete owning groups and opens all 426 rows of 4TJ', async (page, check) => {
    await openApp(page); const reading = await browseGroup(page, 'dasam', 738, '4TJ');
    assert.equal(reading.lines.length, 426); assert.equal(reading.lines[0].page, 738); assert.equal(reading.lines.at(-1).page, 748);
    assert.deepEqual(check.provider, []); check.storage = await preserveLearning(page, {noWrites: true});
  });

  const first = japji.lines[0].id, second = japji.lines[1].id, last = japji.lines.at(-1).id;
  const marked = timing(japji, [{at: 10000, lineId: first}, {at: 20000, lineId: second},
    {at: 30000, lineId: null}, {at: 40000, lineId: first}, {at: 50000, lineId: null}]);
  const key = timingKey(VIDEO, japji);

  for (const viewport of [{width: 320, height: 640}, {width: 1280, height: 900}])
    await scenario('Marker jump restores the player before seeking at ' + viewport.width + 'px', async (page, check) => {
      await page.setViewportSize(viewport); await openApp(page); await connect(page);
      await page.locator('#timing-load').click();
      await page.locator('.cue-details > summary').click();
      const cue = page.locator('#timing-cues button[data-cue-at="40000"]');
      check.jumps = [];
      for (const activation of ['pointer', 'keyboard']) {
        await page.locator('.workspace').evaluate(element => {
          window.scrollTo({top: Math.max(0, scrollY + element.getBoundingClientRect().top - 16), behavior: 'instant'});
        });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await mediaClock(page, 12, 1);
        await cue.scrollIntoViewIfNeeded();
        await page.waitForFunction(() => window.__TEST_ONLY_YOUTUBE.snapshot().players.find(p => !p.destroyed).state === 2);
        const before = await page.evaluate(() => {
          const rect = document.querySelector('#youtube-player iframe').getBoundingClientRect();
          return {offscreen: rect.bottom <= 0 || rect.top >= innerHeight, provider: window.__TEST_ONLY_YOUTUBE.snapshot()};
        });
        assert.equal(before.offscreen, true, 'Reviewing the lower marker list moves the player offscreen');
        assert.equal(before.provider.players.find(p => !p.destroyed).state, 2, 'The offscreen pause still works');
        if (activation === 'pointer') await cue.click();
        else { await cue.focus(); await page.keyboard.press('Enter'); }
        await activeLine(page, first);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const after = await page.evaluate(() => {
          const frame = document.querySelector('#youtube-player iframe'), rect = frame.getBoundingClientRect();
          return {provider: window.__TEST_ONLY_YOUTUBE.snapshot(), frame: {x: rect.x, y: rect.y, width: rect.width, height: rect.height},
            fullyVisible: rect.top >= 0 && rect.left >= 0 && rect.bottom <= innerHeight && rect.right <= innerWidth,
            centreUncovered: document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === frame,
            focused: document.activeElement === frame};
        });
        const seeks = after.provider.calls.slice(before.provider.calls.length).filter(call => call[0] === 'seekTo');
        assert.equal(seeks.length, 1); assert.equal(seeks[0][2], 40, 'Jump to the repeated occurrence, not its earlier mark');
        assert.equal(seeks[0][5].fullyVisible, true, 'Player is fully onscreen when seek is called');
        assert.equal(seeks[0][5].centreUncovered, true, 'Nothing covers the player during seek');
        assert.equal(after.fullyVisible, true, 'Player remains onscreen after observer callbacks');
        assert.equal(after.centreUncovered, true); assert.equal(after.focused, true, 'Keyboard focus follows the jump to the native player');
        const player = after.provider.players.find(p => !p.destroyed);
        assert.equal(player.time, 40); assert.equal(player.state, 2, 'Jumping never resumes a paused recording');
        assert.equal(await page.locator('#player-state').textContent(), 'Paused');
        check.jumps.push({activation, before, after});
      }
      check.screenshot = 'marker-jump-' + viewport.width + '.png';
      await page.screenshot({path: path.join(out, check.screenshot), fullPage: false});
      check.storage = await preserveLearning(page, {noWrites: true});
    }, {records: {[key]: JSON.stringify(marked)}, sdk: {synchronousReady: true}});

  await scenario('Mark selected, next, pause, repeat and undo create only explicit per-video annotations; save/export/replay are exact', async (page, check) => {
    await openApp(page); await connect(page); await selectedLine(page, first);
    await mediaClock(page, 10); await clickTimingEditorControl(page, 'mark-selected');
    await mediaClock(page, 20); await clickTimingEditorControl(page, 'mark-next');
    await mediaClock(page, 30); await clickTimingEditorControl(page, 'mark-pause');
    await clickTimingEditorControl(page, 'timing-undo');
    await mediaClock(page, 25); await activeLine(page, null);
    await mediaClock(page, 30); await clickTimingEditorControl(page, 'mark-pause');
    await selectedLine(page, first); await mediaClock(page, 40); await clickTimingEditorControl(page, 'mark-selected');
    await mediaClock(page, 50); await clickTimingEditorControl(page, 'mark-pause');
    await preserveLearning(page, {noWrites: true});
    const exportedMap = await exported(page); assert.deepEqual(exportedMap.value, marked); check.export = exportedMap;
    await page.locator('#timing-save').click();
    await page.waitForFunction(key => window.__TEST_READ_ALONG_STORAGE_SNAPSHOT().local[key] !== undefined, key);
    assert.deepEqual(JSON.parse((await preserveLearning(page)).local[key]), marked);
    await mediaClock(page, 22, 2); await activeLine(page, second);
    await page.locator('#timing-replay').click();
    const snapshot = await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.snapshot());
    assert.ok(snapshot.calls.some(call => call[0] === 'seekTo' && call[2] === 20 && call[3] === true));
    assert.equal(snapshot.players.find(player => !player.destroyed).state, 2, 'Replay preserves a paused recording');
    await exactSource(page, japji);
  });

  await scenario('Explicit local load restores the exact map; actual clock handles gaps, repetition, pause, seek, rate and buffering', async (page, check) => {
    await openApp(page); await connect(page);
    assert.deepEqual((await preserveLearning(page, {noWrites: true})).audit.reads, [], 'No automatic timing load');
    await page.locator('#timing-load').click();
    assert.deepEqual((await exported(page)).value, marked);
    for (const [seconds, state, rate, line] of [[9, 1, 1, null], [10, 1, 1, first], [22, 1, 1.5, second],
      [25, 2, 1.5, second], [35, 3, 1.5, null], [42, 1, 0.75, first], [50, 0, 0.75, null]]) {
      await mediaClock(page, seconds, state, rate); await activeLine(page, line);
    }
    await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.nativeSeek(12)); await activeLine(page, first);
    await mediaClock(page, 12, 2); const before = await page.locator('[data-line-id][data-active="true"]').getAttribute('data-line-id');
    await page.waitForTimeout(550);
    assert.equal(await page.locator('[data-line-id][data-active="true"]').getAttribute('data-line-id'), before, 'Paused media position does not become an illustrative timer');
    assert.ok([null, 'off'].includes(await page.locator('#alignment-status').getAttribute('aria-live')),
      'Automatic clock following is not a repeated live announcement');
    assert.notEqual(await page.locator('#alignment-status').getAttribute('role'), 'status');
    assert.equal(await page.locator('#media-time').getAttribute('aria-live'), 'off', 'Polling clock output does not announce each tick');
    assert.equal(await page.locator('#timing-status').getAttribute('aria-live'), 'polite', 'Deliberate marker actions retain their status feedback');
    await exactSource(page, japji); check.storage = await preserveLearning(page, {noWrites: true});
  }, {records: {[key]: JSON.stringify(marked)}});

  await scenario('Follow can be disabled while exact line highlighting continues without taking focus', async (page, check) => {
    const map = timing(japji, [{at: 0, lineId: first}, {at: 10_000, lineId: last}, {at: 20_000, lineId: null}]);
    await openApp(page); await connect(page); await importTiming(page, map);
    await page.locator('#follow-timings').check(); await mediaClock(page, 12); await activeLine(page, last);
    await page.waitForFunction(() => document.getElementById('read-along-text').scrollTop > 0);
    await page.locator('#follow-timings').uncheck(); await page.locator('#follow-timings').focus();
    await page.locator('#read-along-text').evaluate(element => { element.scrollTop = 0; });
    await mediaClock(page, 1); await activeLine(page, first); await mediaClock(page, 12); await activeLine(page, last);
    assert.equal(await page.locator('#read-along-text').evaluate(element => element.scrollTop), 0);
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'follow-timings');
    await exactSource(page, japji); check.storage = await preserveLearning(page, {noWrites: true});
  });

  await scenario('Import rejects wrong video, source identity, order, row, schema, malformed and oversized files while retaining the loaded map', async (page, check) => {
    await openApp(page); await connect(page); await page.locator('#timing-load').click();
    const bad = [];
    let value = clone(marked); value.videoId = OTHER_VIDEO; bad.push(['wrong-video', value]);
    value = clone(marked); value.source.editionId += '-foreign'; bad.push(['wrong-edition', value]);
    value = clone(marked); value.source.manifestSha256 = '0'.repeat(64); bad.push(['wrong-manifest', value]);
    value = clone(marked); value.source.units.reverse(); bad.push(['reordered-groups', value]);
    value = clone(marked); value.source.units[0].sha256 = '0'.repeat(64); bad.push(['wrong-group-digest', value]);
    value = clone(marked); value.cues[0].lineId = 'FOREIGN'; bad.push(['foreign-line', value]);
    value = clone(marked); value.cues[1].at = value.cues[0].at; bad.push(['duplicate-time', value]);
    value = clone(marked); value.timingStatus = 'APPROVED'; bad.push(['invented-approval', value]);
    bad.push(['malformed', '{not-json'], ['oversized', ' '.repeat(262145)]);
    for (const [name, value] of bad) {
      await importTiming(page, value, name + '.json');
      await page.waitForSelector('#timing-status[data-state="refused"]');
      assert.deepEqual((await exported(page)).value, marked, 'Refused ' + name + ' keeps current map');
    }
    assert.equal((await preserveLearning(page, {noWrites: true})).local[key], JSON.stringify(marked));
  }, {records: {[key]: JSON.stringify(marked)}});

  await scenario('Valid import/export is lossless and a group-bound map cannot be applied to full Japji', async (page, check) => {
    await openApp(page); await connect(page); await importTiming(page, marked);
    assert.deepEqual((await exported(page)).value, marked);
    await page.locator('#timing-save').click();
    const lll = await expectedReading('sggs', 'unit:LLL');
    const foreign = timing(lll, [{at: 0, lineId: lll.lines[0].id}, {at: 1000, lineId: null}]);
    await importTiming(page, foreign); await page.waitForSelector('#timing-status[data-state="refused"]');
    assert.deepEqual((await exported(page)).value, marked);
    check.storage = await preserveLearning(page);
  });

  await scenario('Dirty source replacement requires a real choice; cancel preserves marks and confirm replaces only the draft', async (page, check) => {
    await openApp(page); await connect(page); await selectedLine(page, first);
    await mediaClock(page, 10); await clickTimingEditorControl(page, 'mark-selected');
    const before = (await exported(page)).value;
    await openSourceChooser(page);
    await page.locator('#source-mode').selectOption('sggs'); await page.locator('#source-page').fill('1'); await page.locator('#source-find').click();
    await page.waitForFunction(() => [...document.querySelectorAll('#source-group option')].some(option => option.value === 'LLL'));
    await page.locator('#source-group').selectOption('LLL');
    await mediaClock(page, 12, 1);
    const beforeDialog = await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.snapshot());
    await page.locator('#source-open').click();
    await page.waitForSelector('#discard-dialog[open]');
    assert.equal(await page.locator('#youtube-player').isHidden(), true, 'Modal does not cover an exposed player');
    const duringDialog = await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.snapshot());
    assert.equal(duringDialog.players.find(value => !value.destroyed).state, 2, 'Pause before hiding the player');
    assert.ok(duringDialog.calls.slice(beforeDialog.calls.length).some(call => call[0] === 'pauseVideo'));
    await page.locator('#discard-cancel').click();
    await page.waitForSelector('#discard-dialog', {state: 'hidden'});
    await page.waitForSelector('#youtube-player iframe', {state: 'visible'});
    assert.equal((await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.snapshot())).players.find(value => !value.destroyed).state, 2,
      'Cancel restores a visible paused player without restarting playback');
    await exactSource(page, japji); assert.deepEqual((await exported(page)).value, before);
    await page.locator('#source-open').click(); await page.waitForSelector('#discard-dialog[open]'); await page.locator('#discard-confirm').click();
    await ready(page); await exactSource(page, await expectedReading('sggs', 'unit:LLL'));
    await activeLine(page, null); check.storage = await preserveLearning(page, {noWrites: true});
  });

  await scenario('Save and continue before loading timings restores the newly saved draft rather than a stale captured map', async (page, check) => {
    await openApp(page); await connect(page); await page.locator('#timing-load').click();
    assert.deepEqual((await exported(page)).value, marked);
    await selectedLine(page, first); await mediaClock(page, 55); await clickTimingEditorControl(page, 'mark-selected');
    const revised = clone(marked); revised.cues.push({at: 55000, lineId: first});
    assert.deepEqual((await exported(page)).value, revised);
    await page.locator('#timing-load').click(); await page.waitForSelector('#discard-dialog[open]');
    await page.locator('#discard-save').click();
    await page.waitForSelector('#discard-dialog', {state: 'hidden'});
    await page.waitForSelector('#timing-status[data-state="loaded"]');
    const stored = await preserveLearning(page);
    assert.deepEqual(JSON.parse(stored.local[key]), revised, 'Save persists the current revised map');
    assert.deepEqual((await exported(page)).value, revised, 'Loaded/clean UI matches that persisted map');
    assert.doesNotMatch(await page.locator('#timing-summary').textContent(), /Unsaved changes/);
    assert.equal(stored.audit.writes.length, 1); check.storage = stored;
  }, {records: {[key]: JSON.stringify(marked)}});

  await scenario('Switching videos destroys the previous player and ignores its late ready/time callbacks', async (page, check) => {
    await openApp(page); await connect(page); await page.locator('#timing-load').click();
    await mediaClock(page, 12); await activeLine(page, first);
    await connect(page, OTHER_VIDEO);
    await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.late(0, 42));
    await activeLine(page, null);
    const snapshot = await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.snapshot());
    assert.equal(snapshot.players[0].destroyed, true);
    assert.equal(snapshot.players.filter(player => !player.destroyed).length, 1);
    assert.equal(snapshot.players.filter(player => !player.destroyed)[0].videoId, OTHER_VIDEO);
    assert.ok((await page.locator('#youtube-player iframe').getAttribute('src')).includes('/' + OTHER_VIDEO + '?'));
    assert.equal((await preserveLearning(page, {noWrites: true})).local[key], JSON.stringify(marked));
  }, {records: {[key]: JSON.stringify(marked)}});

  let releaseOldMetadata, oldMetadataReleased = false;
  const oldMetadataGate = new Promise(resolve => { releaseOldMetadata = resolve; });
  await scenario('Disconnect cancels an unfinished metadata attempt and its late response cannot replace the next recording', async (page, check) => {
    try {
      await openApp(page); await page.locator('#video-url').fill('https://www.youtube.com/watch?v=' + VIDEO);
      await page.locator('#video-load').click();
      await eventually(() => check.provider.some(value => value.kind === 'metadata' && value.videoId === VIDEO), 'first metadata request');
      await page.locator('#video-disconnect').click();
      await connect(page, OTHER_VIDEO);
      releaseOldMetadata(); await eventually(() => oldMetadataReleased, 'old metadata released');
      await page.waitForTimeout(350);
      assert.ok((await page.locator('#youtube-player iframe').getAttribute('src')).includes('/' + OTHER_VIDEO + '?'));
      assert.ok(check.provider.filter(value => value.kind === 'frame').every(value => value.videoId === OTHER_VIDEO));
      const snapshot = await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.snapshot());
      assert.deepEqual(snapshot.players.filter(value => !value.destroyed).map(value => value.videoId), [OTHER_VIDEO]);
      await exactSource(page, japji); check.storage = await preserveLearning(page, {noWrites: true});
    } finally { releaseOldMetadata(); }
  }, {metadata: async id => {
    if (id === VIDEO) { await oldMetadataGate; oldMetadataReleased = true; }
    return {body: validMetadata(id)};
  }});

  await scenario('A native autoplay block reports a recoverable state and native Play can restore following', async (page, check) => {
    await openApp(page); await connect(page); await page.locator('#timing-load').click();
    await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.blocked());
    await page.waitForFunction(() => /blocked|Play control|playback/i.test(document.getElementById('video-status').textContent));
    await mediaClock(page, 12, 1); await page.waitForSelector('#video-status[data-state="ready"]'); await activeLine(page, first);
    check.storage = await preserveLearning(page, {noWrites: true});
  }, {records: {[key]: JSON.stringify(marked)}});

  await scenario('Native provider navigation to another recording stops associating the old timing map', async (page, check) => {
    await openApp(page); await connect(page); await page.locator('#timing-load').click();
    await mediaClock(page, 12); await activeLine(page, first);
    await page.evaluate(video => window.__TEST_ONLY_YOUTUBE.changeRecording(video), OTHER_VIDEO);
    await page.waitForSelector('#video-status[data-state="unavailable"], #video-status[data-state="refused"]');
    await activeLine(page, null); assert.equal(await page.locator('#mark-selected').isDisabled(), true);
    check.storage = await preserveLearning(page, {noWrites: true});
  }, {records: {[key]: JSON.stringify(marked)}});

  await scenario('Player errors clear alignment and retain the exact saved annotations and original text', async (page, check) => {
    await openApp(page); await connect(page); await page.locator('#timing-load').click();
    await mediaClock(page, 12); await activeLine(page, first);
    await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.error(100));
    await page.waitForSelector('#video-status[data-state="unavailable"], #video-status[data-state="refused"]');
    await activeLine(page, null); await exactSource(page, japji);
    check.storage = await preserveLearning(page, {noWrites: true});
  }, {records: {[key]: JSON.stringify(marked)}});

  await scenario('A self-destroying pause failure cannot reopen an empty player after discard cancellation or interfere with reconnection', async (page, check) => {
    await openApp(page); await connect(page); await page.locator('#timing-load').click();
    await selectedLine(page, first); await mediaClock(page, 12, 2);
    await clickTimingEditorControl(page, 'mark-selected');
    const revised = timing(japji, [{at: 10000, lineId: first}, {at: 12000, lineId: first},
      {at: 20000, lineId: second}, {at: 30000, lineId: null}, {at: 40000, lineId: first}, {at: 50000, lineId: null}]);
    await chooseBani(page, 'sohila');
    await page.locator('#source-open').scrollIntoViewIfNeeded();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.failNextPause());
    await page.locator('#source-open').click();
    await page.waitForSelector('#discard-dialog[open]');
    await page.waitForSelector('#video-status[data-state="unavailable"]');
    assert.match(await page.locator('#video-status').textContent(), /pause|closed|reconnect/i);
    await page.locator('#discard-cancel').click();
    await page.waitForSelector('#discard-dialog', {state: 'hidden'});
    assert.equal(await page.locator('#youtube-player iframe').count(), 0);
    assert.equal(await page.locator('#youtube-player').isHidden(), true, 'Dialog close does not expose an empty player box');
    assert.equal(await page.locator('#player-placeholder').isVisible(), true);
    for (const id of ['video-disconnect', 'mark-selected', 'mark-pause', 'timing-replay'])
      assert.equal(await page.locator('#' + id).isDisabled(), true, id + ' has no stale controller');
    await exactSource(page, japji); assert.deepEqual((await exported(page)).value, revised);
    await connect(page);
    await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.late(0, 42));
    await mediaClock(page, 12, 2); await activeLine(page, first);
    const snapshot = await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.snapshot());
    assert.equal(snapshot.players[0].destroyed, true);
    assert.equal(snapshot.players.filter(player => !player.destroyed).length, 1);
    assert.equal(await page.locator('#youtube-player iframe').count(), 1);
    assert.equal(await page.locator('#video-status').getAttribute('data-state'), 'ready');
    assert.equal(await page.locator('#video-disconnect').isDisabled(), false);
    assert.deepEqual((await exported(page)).value, revised);
    check.storage = await preserveLearning(page, {noWrites: true});
  }, {records: {[key]: JSON.stringify(marked)}});

  await scenario('SDK network failure leaves a fallback and usable exact source', async (page, check) => {
    await openApp(page); await page.locator('#video-url').fill('https://www.youtube.com/watch?v=' + VIDEO); await page.locator('#video-load').click();
    await page.waitForSelector('#video-status[data-state="unavailable"], #video-status[data-state="refused"]');
    assert.equal(await page.locator('#youtube-player iframe').count(), 0);
    await exactSource(page, japji); check.storage = await preserveLearning(page, {noWrites: true});
  }, {sdkFailure: true, consoleRefusal: true});

  await scenario('Explicit deletion removes only this companion profile', async (page, check) => {
    await openApp(page); await connect(page); await page.locator('#timing-load').click();
    await page.locator('#timing-delete').click();
    await page.waitForFunction(key => !Object.hasOwn(window.__TEST_READ_ALONG_STORAGE_SNAPSHOT().local, key), key);
    const kept = await preserveLearning(page);
    assert.deepEqual(kept.audit.removes.map(entry => entry[1]), [key]);
    assert.deepEqual(kept.audit.writes, []);
  }, {records: {[key]: JSON.stringify(marked)}});

  await scenario('Storage quota failure preserves previous records and keeps unsaved marks exportable', async (page, check) => {
    await openApp(page); await connect(page); await selectedLine(page, first);
    await mediaClock(page, 10); await clickTimingEditorControl(page, 'mark-selected');
    await mediaClock(page, 20); await clickTimingEditorControl(page, 'mark-pause');
    await page.locator('#timing-save').click(); await page.waitForSelector('#timing-status[data-state="refused"]');
    const unsaved = timing(japji, [{at: 10000, lineId: first}, {at: 20000, lineId: null}]);
    assert.deepEqual((await exported(page)).value, unsaved);
    const kept = await preserveLearning(page); assert.equal(kept.local[key], JSON.stringify(marked));
  }, {quota: true, records: {[key]: JSON.stringify(marked)}});

  await scenario('Named Bani presets expose all 3809 originals and Morning 1567 only after Open, without connecting a provider or restoring an old shared address', async (page, check) => {
    await page.goto(origin + prefix + pagePath + '#v=' + VIDEO + '&b=jaap&s=p&n=808&a=0~0');
    await ready(page); await exactSource(page, japji); assert.deepEqual(check.provider, []);
    await page.locator('#video-url').fill('https://youtu.be/' + VIDEO);
    await chooseBani(page, 'jaap');
    assert.deepEqual(await page.locator('#source-bani option').evaluateAll(options => options.map(option => option.value)),
      ['japji','jaap','savaiye','chaupai','anand','rehras','sohila','sukhmani','morning']);
    assert.deepEqual(await page.locator('#source-bani option').evaluateAll(options => options.map(option => option.textContent)),
      ['Japji Sahib','Jaap Sahib','Tav-Prasad Savaiye','Benti Chaupai Sahib','Anand Sahib',
        'Sodar Rehras Sahib','Kirtan Sohila','Sukhmani Sahib','Morning Bani selection']);
    await exactSource(page, japji);
    assert.ok(!check.requests.some(request => request.path === prefix + baniSpecs.jaap.path), 'Menu choice alone does not load a source');
    for (const id of [...Object.keys(baniSpecs), 'morning']) {
      const reading = await openBani(page, id);
      assert.equal(reading.lines.length, id === 'morning' ? 1567 : baniSpecs[id].count);
      assert.equal(await page.locator('#youtube-player iframe').count(), 0);
      assert.deepEqual(check.provider, []);
    }
    assert.equal(await page.locator('#timing-editor').evaluate(element => element.open), false);
    check.storage = await preserveLearning(page, {noWrites: true});
    assert.deepEqual(check.storage.audit.reads, [], 'Preset browsing does not read saved reader or timing state');
  });

  await scenario('Equal-length named Japji and full-SGGS timing maps cannot cross editions; refused import preserves source and both saved profiles', async (page, check) => {
    await openApp(page); await connect(page); await page.locator('#timing-load').click();
    const providerCount = check.provider.length, named = await openBani(page, 'japji');
    assert.equal(check.provider.length, providerCount, 'Opening a preset does not reconnect the recording');
    assert.equal(named.lines.length, japji.lines.length); assert.equal(await page.locator('#youtube-player iframe').count(), 0);
    await connect(page);
    await importTiming(page, marked); await page.waitForSelector('#timing-status[data-state="refused"]');
    await exactSource(page, named); assert.deepEqual((await exported(page)).value, timing(named, []));
    const own = timing(named, [{at: 1000, lineId: named.lines[0].id}, {at: 2000, lineId: null}]);
    const foreign = clone(own); foreign.source.editionId += '-different';
    await importTiming(page, foreign); await page.waitForSelector('#timing-status[data-state="refused"]');
    await exactSource(page, named); assert.deepEqual((await exported(page)).value, timing(named, []));
    await importTiming(page, own); await page.locator('#timing-save').click();
    const ownKey = timingKey(VIDEO, named), kept = await preserveLearning(page);
    assert.notEqual(ownKey, key); assert.equal(kept.local[key], JSON.stringify(marked));
    assert.deepEqual(JSON.parse(kept.local[ownKey]), own); check.storage = kept;
  }, {records: {[key]: JSON.stringify(marked)}});

  await scenario('Compact teaching records exact Jaap62 rows including its mid-unit heading, repetitions and the final row without automatic saving', async (page, check) => {
    await openApp(page); const named = await openBani(page, 'jaap'); await connect(page);
    const rows = named.lines.filter(line => line.sourceUnitId === 'jaap062');
    assert.deepEqual(rows.slice(0, 3).map(line => line.text), ['ਤੇਰਾ ਜੋਰੁ ॥', 'ਚਾਚਰੀ ਛੰਦ ॥', 'ਜਲੇ ਹੈਂ ॥']);
    assert.equal(await page.locator('[data-line-id="' + rows[0].id + '"]').getAttribute('data-kind'), 'line');
    assert.equal(await page.locator('[data-line-id="' + rows[1].id + '"]').getAttribute('data-kind'), 'heading');
    assert.match(await page.locator('[data-line-id="' + rows[1].id + '"] .read-along-line-state').textContent(), /Source heading/);
    assert.equal(await page.locator('#teach-toggle').getAttribute('aria-pressed'), 'false');
    await selectedLine(page, rows[0].id); await clickTimingEditorControl(page, 'teach-toggle');
    assert.equal(await page.locator('#teach-line').textContent(), rows[0].text);
    await mediaClock(page, 10, 2); await clickTimingEditorControl(page, 'teach-next');
    assert.equal(await page.locator('#teach-line').textContent(), rows[1].text);
    await mediaClock(page, 20, 2); await clickTimingEditorControl(page, 'teach-next');
    assert.equal(await page.locator('#teach-line').textContent(), rows[2].text);
    await clickTimingEditorControl(page, 'timing-undo');
    assert.equal(await page.locator('#teach-line').textContent(), rows[1].text, 'Teaching Undo returns to the just-marked row for a corrected tap');
    assert.equal(await page.locator('#teach-next').isDisabled(), false);
    assert.deepEqual((await exported(page)).value, timing(named, [{at: 10000, lineId: rows[0].id}]),
      'Teaching Undo restores the exact previous map');
    await mediaClock(page, 20, 2); await clickTimingEditorControl(page, 'teach-next');
    assert.equal(await page.locator('#teach-line').textContent(), rows[2].text);
    await mediaClock(page, 30, 2); await clickTimingEditorControl(page, 'mark-pause');
    await selectedLine(page, rows[0].id);
    assert.equal(await page.locator('#teach-line').textContent(), rows[0].text, 'Selecting a previous row prepares a repetition');
    await mediaClock(page, 40, 2); await clickTimingEditorControl(page, 'teach-next');
    await mediaClock(page, 50, 2); await clickTimingEditorControl(page, 'mark-pause');
    const final = named.lines.at(-1); await selectedLine(page, final.id);
    assert.equal(await page.locator('#teach-line').textContent(), final.text);
    await mediaClock(page, 60, 2); await clickTimingEditorControl(page, 'teach-next');
    assert.equal(await page.locator('#teach-next').isDisabled(), true);
    assert.equal(await page.locator('#teach-line').textContent(), '');
    await mediaClock(page, 70, 2); await clickTimingEditorControl(page, 'mark-pause');
    assert.deepEqual((await exported(page)).value, timing(named, [
      {at: 10000, lineId: rows[0].id}, {at: 20000, lineId: rows[1].id}, {at: 30000, lineId: null},
      {at: 40000, lineId: rows[0].id}, {at: 50000, lineId: null}, {at: 60000, lineId: final.id}, {at: 70000, lineId: null}
    ]));
    await exactSource(page, named); check.storage = await preserveLearning(page, {noWrites: true});
  });

  await scenario('Replay follows the current bounded occurrence, preserves pause, and refuses gaps and an unfinished tail', async (page, check) => {
    await openApp(page); await connect(page); await page.locator('#timing-load').click();
    for (const [time, start, line] of [[12,10,first],[22,20,second],[42,40,first]]) {
      await mediaClock(page, time, 2); await activeLine(page, line);
      await page.locator('#timing-replay').click();
      const snapshot = await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.snapshot());
      assert.equal(snapshot.calls.filter(call => call[0] === 'seekTo').at(-1)[2], start);
      const player = snapshot.players.find(player => !player.destroyed);
      assert.equal(player.time, start); assert.equal(player.state, 2);
    }
    for (const time of [9,35,50]) {
      await mediaClock(page, time, 2); await activeLine(page, null);
      assert.equal(await page.locator('#timing-replay').isDisabled(), true);
    }
    await importTiming(page, timing(japji, [{at: 0, lineId: first}, {at: 10000, lineId: second}]));
    await mediaClock(page, 12, 2); await activeLine(page, null);
    assert.equal(await page.locator('#timing-replay').isDisabled(), true, 'No guessed end for an unfinished final marker');
    check.storage = await preserveLearning(page, {noWrites: true});
  }, {records: {[key]: JSON.stringify(marked)}});

  await scenario('Fractional-second replay stays on the same paused occurrence and never bridges a genuinely earlier gap', async (page, check) => {
    await openApp(page); await connect(page);
    const fractional = timing(japji, [{at: 0, lineId: first}, {at: 1005, lineId: second},
      {at: 2000, lineId: null}, {at: 40001, lineId: first}, {at: 41000, lineId: null}]);
    await importTiming(page, fractional);
    for (const [inside, cueMs, expected] of [[1.5,1005,second], [40.5,40001,first]]) {
      await mediaClock(page, inside, 2); await activeLine(page, expected);
      for (let attempt = 0; attempt < 3; attempt++) {
        await page.locator('#timing-replay').click(); await activeLine(page, expected);
        const snapshot = await page.evaluate(() => window.__TEST_ONLY_YOUTUBE.snapshot());
        const player = snapshot.players.find(player => !player.destroyed);
        assert.equal(snapshot.calls.filter(call => call[0] === 'seekTo').at(-1)[2], cueMs / 1000);
        assert.equal(player.time, cueMs / 1000); assert.equal(player.state, 2);
        assert.equal(await page.locator('#timing-replay').isDisabled(), false);
        assert.match(await page.locator('#alignment-status').textContent(), /Timed line/);
      }
    }
    await mediaClock(page, 1.004, 2); await activeLine(page, first);
    for (const time of [2,39.999,40,41]) {
      await mediaClock(page, time, 2); await activeLine(page, null);
      assert.equal(await page.locator('#timing-replay').isDisabled(), true, 'Real earlier or ended interval ' + time);
    }
    await mediaClock(page, 40, 2);
    assert.match(await page.locator('#alignment-status').textContent(), /text pause/i, 'One millisecond early remains a real gap');
    assert.deepEqual((await exported(page)).value, fractional);
    check.storage = await preserveLearning(page, {noWrites: true});
  });

  await scenario('Keyboard navigation during teaching keeps the focused original row visible without jumping back to the teaching panel', async (page, check) => {
    await page.setViewportSize({width: 320, height: 640}); await openApp(page);
    const named = await openBani(page, 'jaap');
    const index = named.lines.findIndex(line => line.sourceUnitId === 'jaap062');
    await selectedLine(page, named.lines[index].id); await clickTimingEditorControl(page, 'teach-toggle');
    await page.evaluate(id => {
      const panel = document.getElementById('read-along-text');
      const top = document.querySelector('.video-card').getBoundingClientRect().height + 8;
      window.scrollTo({top: scrollY + panel.getBoundingClientRect().top - top, behavior: 'instant'});
      panel.querySelector('[data-line-id="' + id + '"]').focus({preventScroll: true});
    }, named.lines[index].id);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const before = await page.evaluate(() => window.scrollY);
    check.keyboard = [];
    for (const [key, row] of [['ArrowDown',named.lines[index + 1]], ['ArrowUp',named.lines[index]],
      ['End',named.lines.at(-1)], ['Home',named.lines[0]]]) {
      await page.keyboard.press(key);
      await page.waitForFunction(id => document.activeElement?.dataset.lineId === id, row.id);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.equal(await page.locator('#teach-line').textContent(), row.text, key + ' updates exact teaching preview');
      const metrics = await page.evaluate(() => {
        const row = document.activeElement, rect = row.getBoundingClientRect();
        const panel = document.getElementById('read-along-text').getBoundingClientRect();
        const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return {windowY: scrollY, lineId: row.dataset.lineId, selected: row.dataset.selected,
          top: rect.top, bottom: rect.bottom, height: rect.height, panelTop: panel.top, panelBottom: panel.bottom,
          inViewport: rect.top >= 0 && rect.bottom <= innerHeight,
          inPanel: rect.top >= panel.top && rect.bottom <= panel.bottom,
          uncovered: hit === row || row.contains(hit)};
      });
      check.keyboard.push({key, ...metrics});
      assert.equal(metrics.windowY, before, key + ' does not move the window to the teaching controls');
      assert.equal(metrics.lineId, row.id); assert.equal(metrics.selected, 'true');
      assert.equal(metrics.inViewport, true, key + ' focused row stays in the viewport');
      assert.equal(metrics.inPanel, true, key + ' focused row stays in the original-text panel');
      assert.equal(metrics.uncovered, true, key + ' focused row is not hidden under another surface');
    }
    assert.deepEqual(check.provider, []); check.storage = await preserveLearning(page, {noWrites: true});
  });

  let releaseBani, pendingBaniReleased = false;
  const pendingBani = new Promise(resolve => { releaseBani = resolve; });
  await scenario('A slow earlier Bani load cannot replace the source chosen later', async (page, check) => {
    try {
      await openApp(page); await chooseBani(page, 'jaap'); await page.locator('#source-open').click();
      await eventually(() => check.requests.some(request => request.path === prefix + baniSpecs.jaap.path), 'held Jaap source request');
      const later = await openBani(page, 'sohila');
      const response = page.waitForResponse(value => new URL(value.url()).pathname === prefix + baniSpecs.jaap.path);
      releaseBani(); await response; await eventually(() => pendingBaniReleased, 'held source released');
      await page.waitForTimeout(750);
      await exactSource(page, later); assert.deepEqual(check.provider, []);
      check.storage = await preserveLearning(page, {noWrites: true});
    } finally { releaseBani(); }
  }, {beforeLocal: async relative => {
    if (relative === baniSpecs.jaap.path) { await pendingBani; pendingBaniReleased = true; }
  }});

  const jaapOriginal = baniReadings.get('jaap').lines[0];
  const forgedText = jaapOriginal.text.replace(/[\u0A00-\u0A7F]/u, char => char === 'ਕ' ? 'ਖ' : 'ਕ');
  const forgedJaap = baniRaw.get('jaap').toString().replace(JSON.stringify(jaapOriginal.text), JSON.stringify(forgedText))
    .replace(jaapOriginal.sha256, hash(forgedText));
  assert.equal(Buffer.byteLength(forgedJaap), baniRaw.get('jaap').length);
  await scenario('A forged named-Bani row with its matching replacement line hash refuses before any partial text is rendered', async (page, check) => {
    await openApp(page); await chooseBani(page, 'jaap'); await page.locator('#source-open').click();
    await page.waitForSelector('#source-status[data-state="refused"]');
    assert.equal(await page.locator('#read-along-text [data-line-id]').count(), 0);
    assert.equal(await page.locator('#video-load').isDisabled(), true);
    assert.deepEqual(check.provider, []); check.storage = await preserveLearning(page, {noWrites: true});
  }, {mutations: {[baniSpecs.jaap.path]: forgedJaap}});

  await scenario('Teaching keeps the native player, exact preview and tap control visible together on phone and desktop after explicit actions', async (page, check, context) => {
    check.layouts = []; check.screenshots = [];
    const layoutFailures = [];
    const viewports = [{width: 320, height: 640}, {width: 390, height: 844}, {width: 1280, height: 900}];
    let firstPage = true;
    async function visibleTeaching(surface, expectedText, label) {
      // Observe the application's own explicit-action reveal. No test scrolling
      // repairs a hidden preview or control before these assertions.
      await surface.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.equal(await surface.locator('#teach-line').textContent(), expectedText, label + ' complete original preview');
      const metrics = await surface.evaluate(() => {
        const box = element => {
          const rect = element.getBoundingClientRect();
          const points = [[rect.left + 8, rect.top + 8], [rect.right - 8, rect.top + 8],
            [rect.left + 8, rect.bottom - 8], [rect.right - 8, rect.bottom - 8],
            [rect.left + rect.width / 2, rect.top + rect.height / 2]];
          return {x: rect.x, y: rect.y, width: rect.width, height: rect.height,
            right: rect.right, bottom: rect.bottom,
            fullyVisible: rect.width > 0 && rect.height > 0 && rect.left >= 0 && rect.top >= 0
              && rect.right <= innerWidth + 0.01 && rect.bottom <= innerHeight + 0.01,
            uncovered: points.every(([x, y]) => {
              const hit = document.elementFromPoint(x, y); return hit === element || element.contains(hit);
            })};
        };
        return {viewport: {width: innerWidth, height: innerHeight}, documentWidth: document.documentElement.scrollWidth,
          frame: box(document.querySelector('#youtube-player iframe')),
          preview: box(document.querySelector('#teach-panel .teach-preview')),
          control: box(document.getElementById('teach-next')),
          previewTextHeight: document.getElementById('teach-line').scrollHeight,
          previewClientHeight: document.getElementById('teach-line').clientHeight};
      });
      check.layouts.push({label, ...metrics});
      assert.ok(metrics.documentWidth <= metrics.viewport.width, label + ' no horizontal overflow');
      assert.ok(metrics.frame.width >= 200 && metrics.frame.height >= 200, label + ' at least 200×200 native player');
      for (const item of ['frame', 'preview', 'control']) {
        assert.equal(metrics[item].fullyVisible, true, label + ' entire ' + item + ' is inside viewport: ' + JSON.stringify(metrics[item]));
        assert.equal(metrics[item].uncovered, true, label + ' ' + item + ' is not covered by another app surface');
      }
      assert.equal(await surface.locator('#teach-next').isDisabled(), false, label + ' tap remains usable');
      if (metrics.previewTextHeight > metrics.previewClientHeight + 1) {
        const before = await surface.evaluate(() => window.scrollY);
        const preview = surface.locator('#teach-line');
        await preview.evaluate(element => element.focus({preventScroll: true}));
        await surface.keyboard.press('End');
        await surface.waitForFunction(() => {
          const element = document.getElementById('teach-line');
          return element.scrollTop > 0 && element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
        });
        assert.equal(await preview.textContent(), expectedText, label + ' scrolling retains the complete original');
        assert.equal(await surface.evaluate(() => window.scrollY), before, label + ' preview scrolling does not hide the player or tap button');
        await surface.keyboard.press('Home');
        await surface.waitForFunction(() => document.getElementById('teach-line').scrollTop === 0);
        await preview.evaluate(element => element.blur());
      }
    }
    for (const viewport of viewports) for (const id of ['japji', 'jaap']) {
      const surface = firstPage ? page : await context.newPage();
      if (!firstPage) {
        surface.setDefaultTimeout(15000);
        surface.on('request', request => check.requests.push({host: new URL(request.url()).hostname,
          path: new URL(request.url()).pathname, method: request.method(), body: request.postData()}));
        surface.on('pageerror', error => check.pageErrors.push(error.message));
        surface.on('console', message => { if (message.type() === 'error') check.consoleErrors.push(message.text()); });
      }
      firstPage = false;
      try {
        await surface.setViewportSize(viewport); await openApp(surface);
        const named = await openBani(surface, id); await connect(surface);
        await surface.frameLocator('#youtube-player iframe').locator('body')
          .filter({hasText: 'TEST ONLY'}).filter({hasText: 'No recording is playing'}).waitFor({state: 'visible'});
        const selected = id === 'japji' ? named.lines[0]
          : named.lines.find(line => line.sourceUnitId === 'jaap062' && line.text === 'ਤੇਰਾ ਜੋਰੁ ॥');
        assert.ok(selected); if (id === 'japji') assert.ok(selected.text.length > 60, 'Use the full long opening invocation');
        await selectedLine(surface, selected.id); await mediaClock(surface, 12, 2);
        await clickTimingEditorControl(surface, 'teach-toggle');
        await visibleTeaching(surface, selected.text, viewport.width + '×' + viewport.height + ' ' + id + ' enabled');
        if (id === 'japji' && [320,1280].includes(viewport.width)) {
          const name = 'bani-teach-' + viewport.width + '.png';
          await surface.screenshot({path: path.join(out, name), fullPage: false}); check.screenshots.push(name);
        }
        await clickTimingEditorControl(surface, 'teach-next');
        const next = named.lines[named.lines.findIndex(line => line.id === selected.id) + 1];
        await visibleTeaching(surface, next.text, viewport.width + '×' + viewport.height + ' ' + id + ' after tap');
        await preserveLearning(surface, {noWrites: true});
      } catch (error) {
        layoutFailures.push({viewport, bani: id, error: error.stack || String(error)});
      } finally { await surface.close(); }
    }
    assert.deepEqual(layoutFailures, [], 'Every teaching viewport and original-row length must remain usable');
  });

  const corrupted = fixtures.sggs.chunks.get('c0001').bytes.toString().replace('ੴ', '੨');
  assert.equal(Buffer.byteLength(corrupted), fixtures.sggs.chunks.get('c0001').bytes.length);
  await scenario('Same-length source corruption refuses the complete reading without exposing partial source or touching notes', async (page, check) => {
    await page.goto(origin + prefix + pagePath);
    await page.waitForSelector('#source-status[data-state="refused"]');
    assert.equal(await page.locator('#read-along-text [data-line-id]').count(), 0);
    assert.deepEqual(check.provider, []); check.storage = await preserveLearning(page, {noWrites: true});
  }, {mutations: {[fixtures.sggs.chunks.get('c0001').relative]: corrupted}});
} catch (error) {
  report.status = 'FAIL'; report.failures.push({name: 'fixture preparation', error: error.stack || String(error)});
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  if (report.sourceCommit) {
    const changed = [];
    for (const [relative, expected] of Object.entries(report.sourceHashes)) {
      try {
        const bytes = execFileSync('git', ['show', report.sourceCommit + ':' + relative], {cwd: root, maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore']});
        if (hash(bytes) !== expected) changed.push(relative);
      } catch { changed.push(relative); }
    }
    report.sourceCommitMatchesAllReadFiles = changed.length === 0; report.filesDifferentFromRecordedHead = changed;
  }
  report.finished = new Date().toISOString(); report.fixtureSha256 = hash(await fs.readFile(fileURLToPath(import.meta.url)));
  report.passed = report.checks.filter(check => check.status === 'PASS').length; report.failed = report.failures.length;
  await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({status: report.status, checks: report.checks.length, passed: report.passed, failures: report.failures, evidence: out}));
if (report.status !== 'PASS') process.exitCode = 1;
