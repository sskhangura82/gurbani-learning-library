// Actual closed-bundle UI, independently pinned originals and synthetic saved records.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const directory = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const root = await fs.realpath(process.env.GLP_TARGET_DIRECTORY || directory);
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const out = path.resolve(process.env.GLP_LEARNING_OUTPUT || path.join(directory, 'evidence/gurbani-learning/browser', stamp));
await fs.mkdir(out, {recursive: true});
const sha = (value, algorithm = 'sha256') => createHash(algorithm).update(value).digest('hex');
const sri = value => 'sha384-' + createHash('sha384').update(value).digest('base64');
const prefix = '/gurbani-learning-review/';
const bundlePath = 'collections/source-reader/reader.bundle.mjs';
const sggsPath = 'collections/sggs/index.html';
const psychologyPaths = ['psychology/intellectual-humility.html', 'psychology/attention.html', 'psychology/emotion-regulation.html'];
const allowed = new Set([sggsPath, 'collections/dasam/read.html', bundlePath,
  'collections/source-reader/reader.css', 'collections/collections.css',
  'psychology/index.html', 'psychology/study.css', ...psychologyPaths]);
const isUnbundled = relative => relative.startsWith('collections/source-reader/') && relative.endsWith('.mjs') && relative !== bundlePath;
const isPublic = relative => allowed.has(relative) || /^collections\/source-data\/(?:sggs|dasam)\/(?:manifest\.json|chunks\/c[0-9]{4}\.json)$/.test(relative);
const report = {status: 'PASS', started: new Date().toISOString(), sourceCommit: null,
  sourceCommitMatchesAllReadFiles: null, checks: [], failures: [], sourceHashes: {}, sourceBytes: {}, limits: [
    'Actual desktop Chrome with fresh contexts and synthetic records only; no existing browser profile, owner PIN, private collection or personal reflection.',
    'UI and declared teaching transfer are checked; this is not independent interpretation, medical efficacy, printed collation or Claude review.',
    'Original DMP and LLL are independently hash-pinned; teaching expectations come from the separate declared lesson data.',
    'Service workers are blocked here to isolate learning delivery; the integration suite owns offline and update behavior.',
    'Narrow desktop viewports do not establish physical iPhone, Safari or VoiceOver behavior.'
  ]};
try { report.sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']}).trim(); } catch {}

async function readPublic(relative, {dataModule = false} = {}) {
  assert.ok(typeof relative === 'string' && !relative.split('/').includes('private-library'), 'Never read private-library');
  assert.ok(isPublic(relative) || dataModule && relative === 'collections/source-reader/lesson-data.mjs', 'Only declared public fixture files');
  const filename = await fs.realpath(path.resolve(root, relative));
  assert.ok(filename.startsWith(root + path.sep), 'Read stays inside the candidate');
  assert.ok(!path.relative(root, filename).split(path.sep).includes('private-library'), 'No private-library symlink target');
  const bytes = await fs.readFile(filename);
  if (Object.hasOwn(report.sourceHashes, relative)) assert.equal(sha(bytes), report.sourceHashes[relative], 'Public asset stays unchanged during the run: ' + relative);
  report.sourceHashes[relative] = sha(bytes); report.sourceBytes[relative] = bytes.length;
  return bytes;
}

const specs = {
  sggs: {path: sggsPath, edition: 'shabados-5.0.0-next.0-SGGS-SSA2',
    manifestHash: '04da157b5e7ba85ce0fe35aae983baba3284bc75990be374e556ab3c52da5def', manifestBytes: 1116397, pages: 1430, locator: 'Ang'},
  dasam: {path: 'collections/dasam/read.html', edition: 'shabados-5.0.0-next.0-SDGR-DGDG',
    manifestHash: '2ba6005655429eeb07b4477d4bf9a18b4f62e86224107d72793ec5f2bd441ad6', manifestBytes: 1101376, pages: 1428, locator: 'Page'}
};
const pinned = {
  DMP: {count: 10, hash: 'ae2d9ba49508ddb5b05c818c55925fa7e51c9067aa62a26f00730c4babcd6566',
    lines: ['0NVY', 'RBP6', 'J92N', 'K0U6', 'BL70', 'GJW9', 'ZERL', '9MN2', 'MK1Q', 'H0PC']},
  LLL: {count: 6, hash: '55bd7530247d2464e0cde6eac490588557c8f1676d3e618737d7006dce4d6eab',
    lines: ['60LK', 'UVSL', 'GLXS', 'P2VG', 'MX4P', 'FKUU']}
};
const fixtures = {};
async function prepareSource(id) {
  const spec = specs[id], base = 'collections/source-data/' + id + '/';
  const bytes = await readPublic(base + 'manifest.json');
  assert.equal(bytes.length, spec.manifestBytes); assert.equal(sha(bytes), spec.manifestHash);
  const manifest = JSON.parse(bytes), chunks = new Map(), units = new Map();
  assert.equal(manifest.collectionId, id); assert.equal(manifest.editionId, spec.edition);
  async function unitFor(unitId) {
    if (units.has(unitId)) return units.get(unitId);
    const descriptor = manifest.units.find(unit => unit.id === unitId); assert.ok(descriptor);
    const info = manifest.chunks.find(chunk => chunk.id === descriptor.chunkId); assert.ok(info);
    if (!chunks.has(info.id)) {
      const relative = base + info.path, chunkBytes = await readPublic(relative);
      assert.equal(chunkBytes.length, info.bytes); assert.equal(sha(chunkBytes), info.sha256);
      chunks.set(info.id, {bytes: chunkBytes, data: JSON.parse(chunkBytes), relative});
    }
    const unit = chunks.get(info.id).data.units.find(value => value.id === unitId); assert.ok(unit);
    assert.equal(sha(JSON.stringify(unit)), descriptor.sha256); units.set(unitId, unit); return unit;
  }
  fixtures[id] = {id, spec, manifest, base, chunks, unitFor,
    key: 'glp001.sikh-source-place.v1:' + id + ':' + spec.edition};
  for (const descriptor of manifest.units.filter(unit => unit.pages.includes(1) || id === 'sggs' && unit.pages.includes(2))) await unitFor(descriptor.id);
}

let browser, server, origin, lessons, seed;
const mime = {'.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8'};
const ready = page => page.waitForSelector('html[data-source-state="ready"]');
async function open(page, id = 'sggs', query = '?page=1') {
  await page.goto(origin + prefix + fixtures[id].spec.path + query); await ready(page);
  await page.waitForFunction(() => document.getElementById('source-progress-status')?.textContent.trim());
}
const panelFor = (page, unit) => page.locator('details.source-learning[data-lesson-unit="' + unit + '"]');
async function exactPage(page, id, number) {
  const fixture = fixtures[id], label = fixture.spec.locator + ' ' + number + ' of ' + fixture.spec.pages;
  await page.waitForFunction(label => document.documentElement.dataset.sourceState === 'ready'
    && document.getElementById('source-page-label')?.textContent === label, label);
  const descriptors = fixture.manifest.units.filter(unit => unit.pages.includes(number));
  assert.deepEqual(await page.locator('#source-groups [data-group-id]').evaluateAll(nodes => nodes.map(node => node.dataset.groupId)), descriptors.map(unit => unit.id));
  for (const descriptor of descriptors) {
    const unit = await fixture.unitFor(descriptor.id);
    const actual = await page.locator('[data-group-id="' + unit.id + '"] [data-source-line-id]').evaluateAll(nodes => nodes.map(node =>
      ({id: node.dataset.sourceLineId, page: Number(node.dataset.sourcePage), text: node.textContent})));
    assert.deepEqual(actual, unit.lines.map(line => ({id: line.id, page: line.page, text: line.text})), 'Exact original ' + unit.id);
  }
}
async function preserved(page, context, {trace = true, collection = 'sggs'} = {}) {
  if (!trace) {
    const state = await context.storageState();
    const stored = state.origins.find(value => value.origin === origin)?.localStorage || [];
    assert.deepEqual(Object.fromEntries(stored.map(value => [value.name, value.value])), seed, 'All synthetic saved records remain exact');
    assert.deepEqual(state.cookies, []); return null;
  }
  const snapshot = await page.evaluate(() => window.__learningSnapshot());
  assert.deepEqual(snapshot.local, seed, 'All synthetic saved records remain exact');
  assert.deepEqual(snapshot.session, {}, 'No session storage created');
  assert.deepEqual(await context.cookies(), [], 'No account cookies');
  const calls = await page.evaluate(() => window.__learningStorage);
  assert.ok(calls); assert.deepEqual(calls.writes, []); assert.deepEqual(calls.removes, []); assert.deepEqual(calls.clears, []);
  assert.ok(calls.reads.every(([area, key]) => area === 'local' && key === fixtures[collection].key), 'Reader only reads its own saved-place key');
  return calls;
}
async function scenario(name, run, {mutations = {}, javascript = true, consoleRefusal = false} = {}) {
  const check = {name, status: 'PASS', requests: [], external: [], pageErrors: [], consoleErrors: []}; report.checks.push(check);
  const context = await browser.newContext({viewport: {width: 320, height: 860}, serviceWorkers: 'block',
    reducedMotion: 'reduce', colorScheme: 'light', javaScriptEnabled: javascript,
    storageState: {cookies: [], origins: [{origin, localStorage: Object.entries(seed).map(([name, value]) => ({name, value}))}]}});
  if (javascript) await context.addInitScript(() => {
    const original = {get: Storage.prototype.getItem, set: Storage.prototype.setItem, remove: Storage.prototype.removeItem, clear: Storage.prototype.clear};
    const area = storage => storage === localStorage ? 'local' : 'session';
    window.__learningStorage = {reads: [], writes: [], removes: [], clears: []};
    Storage.prototype.getItem = function(key) { window.__learningStorage.reads.push([area(this), String(key)]); return original.get.call(this, key); };
    Storage.prototype.setItem = function(key, value) { window.__learningStorage.writes.push([area(this), String(key), String(value)]); return original.set.call(this, key, value); };
    Storage.prototype.removeItem = function(key) { window.__learningStorage.removes.push([area(this), String(key)]); return original.remove.call(this, key); };
    Storage.prototype.clear = function() { window.__learningStorage.clears.push(area(this)); return original.clear.call(this); };
    const snapshot = storage => Object.fromEntries(Array.from({length: storage.length}, (_, index) => {
      const key = storage.key(index); return [key, original.get.call(storage, key)];
    }));
    window.__learningSnapshot = () => ({local: snapshot(localStorage), session: snapshot(sessionStorage)});
  });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) { check.external.push(url.href); await route.abort(); return; }
    const relative = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : '';
    if (Object.hasOwn(mutations, relative)) {
      await route.fulfill({status: 200, contentType: mime[path.extname(relative)], body: mutations[relative]}); return;
    }
    await route.continue();
  });
  const page = await context.newPage(); page.setDefaultTimeout(15000);
  page.on('request', request => check.requests.push({path: new URL(request.url()).pathname, method: request.method(), body: request.postData()}));
  page.on('pageerror', error => check.pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') check.consoleErrors.push(message.text()); });
  try {
    await run(page, check, context);
    assert.deepEqual(check.pageErrors, []); assert.deepEqual(check.external, []);
    if (!consoleRefusal) assert.deepEqual(check.consoleErrors, []);
    assert.ok(check.requests.every(request => request.method === 'GET' && request.body === null), 'No data sent from study');
    assert.ok(check.requests.every(request => !request.path.includes('/private-library/') && !isUnbundled(request.path.slice(prefix.length))), 'No private or unbundled reader request');
  } catch (error) {
    check.status = 'FAIL'; check.error = error.stack || String(error);
    report.status = 'FAIL'; report.failures.push({name, error: error.message});
  } finally { await context.close(); }
}
async function choose(page, unit, language, depth) {
  const panel = panelFor(page, unit);
  if (!await panel.evaluate(element => element.open)) await panel.locator(':scope > summary').click();
  await panel.locator('button[data-learning-language="' + language + '"]').click();
  await panel.locator('button[data-learning-depth="' + depth + '"]').click();
  return panel;
}
async function geometry(page) {
  const value = await page.evaluate(() => ({viewport: innerWidth, documentWidth: document.documentElement.scrollWidth}));
  assert.ok(value.documentWidth <= value.viewport, 'No horizontal overflow');
  return value;
}

try {
  const {chromium} = await import(process.env.GLP_PLAYWRIGHT_MODULE || 'playwright');
  await prepareSource('sggs'); await prepareSource('dasam');
  for (const [id, expected] of Object.entries(pinned)) {
    const unit = await fixtures.sggs.unitFor(id);
    assert.equal(unit.lines.length, expected.count); assert.equal(sha(JSON.stringify(unit)), expected.hash);
    assert.deepEqual(unit.lines.map(line => line.id), expected.lines);
  }
  await readPublic('collections/source-reader/lesson-data.mjs', {dataModule: true});
  ({LESSONS: lessons} = await import(pathToFileURL(path.join(root, 'collections/source-reader/lesson-data.mjs')).href));
  assert.deepEqual(lessons.map(lesson => lesson.unitId), ['DMP', 'LLL']);
  const unit = await fixtures.sggs.unitFor('LLL'), line = unit.lines[0];
  const progress = {schema: 'glp.sikh-reader.progress.v1', collectionId: 'sggs', editionId: specs.sggs.edition,
    unitId: unit.id, unitSha256: pinned.LLL.hash, lineId: line.id, page: line.page, updatedAt: '2026-11-27T12:00:00.000Z'};
  seed = {
    'glp001.knowledge.learning.v1': JSON.stringify({format: 'glp-knowledge-learning', version: 1, revision: 0, records: []}),
    'glp001.sukhmani.v1': 'SYNTHETIC BANI RECORD — never personal data',
    'unrelated.synthetic.reflection': 'SYNTHETIC PRESERVATION SENTINEL',
    [fixtures.sggs.key]: JSON.stringify(progress)
  };
  const bundle = await readPublic(bundlePath), html = await readPublic(sggsPath);
  const baselineSRI = sri(bundle);
  assert.equal(html.toString().split(baselineSRI).length - 1, 1, 'HTML pins the exact closed bundle');
  assert.match(bundle.toString(), /\b(?:var|const|let)\s+LESSONS\s*=/, 'Observed closed bundle exposes the declared data before async source loading');
  server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (pathname === '/favicon.ico') { response.writeHead(204); response.end(); return; }
      if (!pathname.startsWith(prefix)) throw Error('Outside fixture mount');
      let relative = pathname.slice(prefix.length);
      if (relative.endsWith('/')) relative += 'index.html';
      if (isUnbundled(relative)) { response.writeHead(403); response.end('Closed bundle required.'); return; }
      if (!isPublic(relative)) throw Error('Undeclared public path');
      const bytes = await readPublic(relative);
      response.writeHead(200, {'content-type': mime[path.extname(relative)], 'content-length': String(bytes.length), 'cache-control': 'no-store'});
      response.end(bytes);
    } catch { response.writeHead(404, {'cache-control': 'no-store'}); response.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch({headless: true, ...(process.env.GLP_CHROMIUM_EXECUTABLE ? {executablePath: process.env.GLP_CHROMIUM_EXECUTABLE} : {}), args: ['--no-sandbox']});
  report.environment = {node: process.version, platform: process.platform, browser: browser.version(),
    executable: process.env.GLP_CHROMIUM_EXECUTABLE || 'Playwright browser'};

  await scenario('Ang 1 has exactly DMP and LLL optional drafts; ZKH has none', async (page, check, context) => {
    await open(page); await exactPage(page, 'sggs', 1);
    assert.deepEqual(await page.locator('.source-learning').evaluateAll(nodes => nodes.map(node => node.dataset.lessonUnit)), ['DMP', 'LLL']);
    assert.deepEqual(await page.locator('.source-learning').evaluateAll(nodes => nodes.map(node => node.open)), [false, false]);
    assert.equal(await page.locator('[data-group-id="ZKH"] .source-learning, [data-group-id="ZKH"] .source-learning-unavailable').count(), 0);
    assert.equal(await page.locator('.source-lines .source-learning, .source-lines [data-content-kind="editorial"]').count(), 0);
    for (const lesson of lessons) {
      const panel = panelFor(page, lesson.unitId);
      assert.equal(await panel.locator('.source-learning-title').textContent(), lesson.title.en);
      assert.equal(await panel.locator('.source-learning-review').getAttribute('data-review-status'), 'AI_ASSISTED_DRAFT');
      assert.equal(await panel.locator('.source-learning-review').getAttribute('data-second-review'), 'PENDING');
      assert.match(await panel.locator('.source-learning-review').textContent(), /AI-assisted draft.*Claude review pending/);
      assert.equal(await panel.locator('input, textarea, form').count(), 0);
    }
    check.storage = await preserved(page, context);
  });

  for (const lesson of lessons) for (const language of ['en', 'pa']) for (const depth of ['simple', 'detailed', 'deep']) {
    await scenario(lesson.unitId + ': exact ' + language + ' ' + depth + ' teaching, original rows and source anchors', async (page, check, context) => {
      await open(page); const beforeURL = page.url(), beforeHistory = await page.evaluate(() => history.length);
      const panel = await choose(page, lesson.unitId, language, depth);
      assert.equal(await panel.getAttribute('lang'), language === 'pa' ? 'pa-Guru' : 'en');
      assert.equal(await panel.locator('.source-learning-title').textContent(), lesson.title[language]);
      assert.equal(await panel.locator('.source-learning-language button[aria-pressed="true"]').count(), 1);
      assert.equal(await panel.locator('.source-learning-levels button[aria-pressed="true"]').count(), 1);
      assert.equal(await panel.locator('button[data-learning-language="' + language + '"]').getAttribute('aria-pressed'), 'true');
      assert.equal(await panel.locator('button[data-learning-depth="' + depth + '"]').getAttribute('aria-pressed'), 'true');
      assert.ok(await panel.evaluate(element => element.open));
      const paragraphs = lesson.sections.flatMap(section => section[depth]);
      assert.deepEqual(await panel.locator('.source-learning-section > h3').allTextContents(), lesson.sections.map(section => section.title[language]));
      assert.deepEqual(await panel.locator('.source-learning-explanation').allTextContents(), paragraphs.map(paragraph => paragraph[language]));
      assert.deepEqual(await panel.locator('.source-learning-paragraph [data-learning-line-id]').evaluateAll(nodes => nodes.map(node => node.dataset.learningLineId)), paragraphs.flatMap(paragraph => paragraph.lineIds));
      const sourceMap = new Map(lesson.sources.map(source => [source.id, source]));
      const refs = await panel.locator('.source-learning-paragraph [data-learning-source-id]').evaluateAll(nodes => nodes.map(node =>
        ({id: node.dataset.learningSourceId, label: node.textContent, href: node.href})));
      assert.deepEqual(refs, paragraphs.flatMap(paragraph => paragraph.sourceIds.map(id => ({id, label: sourceMap.get(id).label, href: sourceMap.get(id).url}))));
      for (const lineId of lesson.lineIds) {
        await panel.locator('button[data-learning-line-id="' + lineId + '"]').first().click();
        assert.equal(await page.evaluate(() => document.activeElement?.dataset.sourceLineId), lineId);
        assert.equal(await page.evaluate(() => document.activeElement.closest('[data-group-id]').dataset.groupId), lesson.unitId);
        assert.ok(await page.evaluate(() => document.activeElement.getBoundingClientRect().top + 1
          >= document.getElementById('source-reading-actions').getBoundingClientRect().bottom), 'Focused original is below the sticky reading controls');
      }
      assert.equal(page.url(), beforeURL); assert.equal(await page.evaluate(() => history.length), beforeHistory);
      await exactPage(page, 'sggs', 1); check.storage = await preserved(page, context);
      check.coverage = {unit: lesson.unitId, sourceRows: lesson.lineIds.length, language, depth, paragraphs: paragraphs.length, focusedRows: lesson.lineIds};
    });
  }

  await scenario('Disclosure and language/depth controls work by keyboard without losing focus', async (page, check, context) => {
    await open(page); const panel = panelFor(page, 'DMP'), summary = panel.locator(':scope > summary');
    await summary.focus(); await page.keyboard.press('Space'); assert.ok(await panel.evaluate(element => element.open));
    const language = panel.locator('button[data-learning-language="pa"]');
    await language.focus(); await page.keyboard.press('Enter');
    assert.ok(await language.evaluate(element => element === document.activeElement));
    const depth = panel.locator('button[data-learning-depth="deep"]');
    await depth.focus(); await page.keyboard.press('Space');
    assert.ok(await depth.evaluate(element => element === document.activeElement));
    assert.equal(await depth.getAttribute('aria-pressed'), 'true');
    await summary.focus(); await page.keyboard.press('Space'); assert.equal(await panel.evaluate(element => element.open), false);
    check.storage = await preserved(page, context); await exactPage(page, 'sggs', 1);
  });

  await scenario('Ang 2 inherits no lesson; Back/Forward and reload retain correct source ownership', async (page, check, context) => {
    await open(page); await choose(page, 'DMP', 'pa', 'deep'); await preserved(page, context);
    await page.locator('#source-next').click(); await exactPage(page, 'sggs', 2);
    assert.equal(await page.locator('.source-learning, .source-learning-unavailable').count(), 0);
    await page.goBack(); await exactPage(page, 'sggs', 1);
    assert.deepEqual(await page.locator('.source-learning').evaluateAll(nodes => nodes.map(node => node.dataset.lessonUnit)), ['DMP', 'LLL']);
    await page.goForward(); await exactPage(page, 'sggs', 2); await preserved(page, context);
    await page.reload(); await ready(page); await exactPage(page, 'sggs', 2);
    assert.equal(await page.locator('.source-learning, .source-learning-unavailable').count(), 0);
    check.storage = await preserved(page, context);
  });

  await scenario('Dasam remains original-text only', async (page, check, context) => {
    await open(page, 'dasam'); await exactPage(page, 'dasam', 1);
    assert.equal(await page.locator('.source-learning, .source-learning-unavailable').count(), 0);
    check.storage = await preserved(page, context, {collection: 'dasam'});
  });

  const firstChunk = fixtures.sggs.chunks.get(fixtures.sggs.manifest.units.find(unit => unit.id === 'DMP').chunkId);
  const changed = structuredClone(firstChunk.data);
  changed.units.find(unit => unit.id === 'DMP').lines[0].text = changed.units.find(unit => unit.id === 'DMP').lines[0].text.replace(/[\u0a00-\u0a7f]/u, character => character === 'ਖ' ? 'ਗ' : 'ਖ');
  const corruptChunk = Buffer.from(JSON.stringify(changed) + (firstChunk.bytes.at(-1) === 10 ? '\n' : ''));
  assert.equal(corruptChunk.length, firstChunk.bytes.length); assert.notEqual(sha(corruptChunk), sha(firstChunk.bytes));
  await scenario('Changed source chunk withholds both original and learning', async (page, check, context) => {
    check.mutation = {path: firstChunk.relative, before: sha(firstChunk.bytes), after: sha(corruptChunk)};
    await page.goto(origin + prefix + sggsPath + '?page=1');
    await page.waitForSelector('html[data-source-state="refused"]');
    assert.equal(await page.locator('[data-source-line-id], .source-learning, .source-learning-unavailable').count(), 0);
    check.storage = await preserved(page, context);
  }, {mutations: {[firstChunk.relative]: corruptChunk}});

  for (const [name, change] of [
    ['stale unit digest', "target.unitSha256 = '0'.repeat(64); return target.unitSha256 === '0'.repeat(64);"],
    ['invented completed review', "target.review.secondReview = 'CLAUDE_APPROVED'; return target.review.secondReview === 'CLAUDE_APPROVED';"]
  ]) {
    const mutant = Buffer.concat([bundle, Buffer.from('\n// SYNTHETIC FIXTURE ONLY: mutate optional data before async source loading.\n'
      + ';globalThis.__glpSyntheticInvalidLesson = (() => { const target = LESSONS.find(lesson => lesson.unitId === "DMP"); '
      + change + ' })();\n')]);
    const resignedHTML = Buffer.from(html.toString().replace(baselineSRI, sri(mutant)));
    await scenario('Re-signed synthetic optional teaching with ' + name + ' refuses DMP locally; LLL and originals remain available', async (page, check, context) => {
      check.mutation = {path: bundlePath, before: sha(bundle), after: sha(mutant), syntheticResignedHTML: sha(resignedHTML), kind: name};
      await open(page); assert.equal(await page.evaluate(() => globalThis.__glpSyntheticInvalidLesson), true, 'Mutation ran before optional validation');
      await exactPage(page, 'sggs', 1);
      assert.equal(await page.locator('[data-group-id="DMP"] .source-learning').count(), 0);
      assert.equal(await page.locator('[data-group-id="DMP"] .source-learning-unavailable').count(), 1);
      assert.deepEqual(await page.locator('.source-learning').evaluateAll(nodes => nodes.map(node => node.dataset.lessonUnit)), ['LLL']);
      assert.equal(await page.locator('.source-learning-unavailable').count(), 1);
      await choose(page, 'LLL', 'pa', 'deep');
      assert.equal(await panelFor(page, 'LLL').locator('.source-learning-explanation').count(), lessons[1].sections.flatMap(section => section.deep).length);
      check.storage = await preserved(page, context);
    }, {mutations: {[bundlePath]: mutant, [sggsPath]: resignedHTML}});
  }

  const changedBundle = Buffer.concat([bundle, Buffer.from('\nglobalThis.__glpSyntheticSRIExecuted = true;\n')]);
  await scenario('Native unchanged SRI blocks altered bundle before any source or teaching appears', async (page, check, context) => {
    check.mutation = {path: bundlePath, before: sha(bundle), after: sha(changedBundle)};
    await page.goto(origin + prefix + sggsPath);
    assert.equal(await page.locator('html').getAttribute('data-source-state'), 'loading');
    assert.equal(await page.locator('[data-source-line-id], .source-learning, .source-learning-unavailable').count(), 0);
    assert.equal(await page.evaluate(() => globalThis.__glpSyntheticSRIExecuted), undefined);
    assert.ok(check.consoleErrors.some(message => /integrity|valid digest/i.test(message)));
    assert.ok(check.requests.every(request => !request.path.includes('/collections/source-data/')));
    check.storage = await preserved(page, context);
  }, {mutations: {[bundlePath]: changedBundle}, consoleRefusal: true});

  await scenario('Punjabi Deep study fits 320px with largest original text, dark appearance and desktop layout', async (page, check, context) => {
    await open(page); await page.locator('#source-size').selectOption('largest');
    const panel = await choose(page, 'DMP', 'pa', 'deep');
    const original = page.locator('[data-group-id="DMP"] [data-source-line-id]').first();
    await original.evaluate(element => element.scrollIntoView({block: 'start'}));
    check.largestGeometry = await geometry(page);
    await page.screenshot({path: path.join(out, 'original-largest-320.png'), fullPage: false});
    await panel.locator(':scope > summary').evaluate(element => element.scrollIntoView({block: 'start'}));
    check.studyGeometry = await geometry(page);
    assert.ok(await panel.locator('.source-learning-controls button').evaluateAll(nodes => nodes.every(node => {
      const box = node.getBoundingClientRect(); return box.left >= 0 && box.right <= innerWidth && box.height >= 44;
    })), 'All learning controls fit with minimum touch height');
    await page.screenshot({path: path.join(out, 'study-punjabi-deep-320.png'), fullPage: false});
    await page.locator('#source-theme').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await panel.locator(':scope > summary').evaluate(element => element.scrollIntoView({block: 'start'}));
    check.darkGeometry = await geometry(page);
    await page.screenshot({path: path.join(out, 'study-punjabi-dark-320.png'), fullPage: false});
    await page.setViewportSize({width: 1280, height: 900});
    await page.locator('#source-theme').click(); await choose(page, 'DMP', 'en', 'detailed');
    await panel.locator(':scope > summary').evaluate(element => element.scrollIntoView({block: 'start'}));
    check.desktopGeometry = await geometry(page);
    await page.screenshot({path: path.join(out, 'study-english-desktop.png'), fullPage: false});
    check.screenshots = ['original-largest-320.png', 'study-punjabi-deep-320.png', 'study-punjabi-dark-320.png', 'study-english-desktop.png'];
    await exactPage(page, 'sggs', 1); check.storage = await preserved(page, context);
  });

  for (const relative of psychologyPaths) await scenario(relative + ': substantive open study works without JavaScript at 320px', async (page, check, context) => {
    await page.goto(origin + prefix + relative);
    assert.equal(await page.locator('main#main.study-copy').count(), 1);
    assert.equal(await page.locator('script, form, input, textarea, iframe').count(), 0);
    for (const id of ['research', 'limits', 'reflection', 'sources', 'beside-gurbani']) {
      const section = page.locator('section[aria-labelledby="' + id + '"]');
      assert.equal(await section.count(), 1); assert.ok((await section.innerText()).trim().length > 80);
    }
    assert.equal(await page.locator('section[aria-labelledby="reflection"] > ol > li').count(), 3);
    assert.equal(await page.locator('.study-nav a').count(), 3);
    assert.equal(await page.locator('.study-nav [aria-current="page"]').count(), 1);
    assert.match(await page.locator('.review-note').textContent(), /AI-assisted.*Claude.*pending/s);
    const sourceURLs = await page.locator('.source-list a[href]').evaluateAll(nodes => nodes.map(node => node.href));
    const citations = await page.locator('a.citation[href]').evaluateAll(nodes => nodes.map(node => node.href));
    assert.ok(sourceURLs.length >= 2 && citations.length >= 2);
    for (const value of [...sourceURLs, ...citations]) { const url = new URL(value); assert.equal(url.protocol, 'https:'); assert.equal(url.username + url.password, ''); }
    const withoutFragment = value => { const url = new URL(value); url.hash = ''; return url.href; };
    assert.ok(citations.every(value => sourceURLs.some(source => withoutFragment(source) === withoutFragment(value))), 'Each near-claim citation identifies a bibliography source');
    assert.ok(check.requests.every(request => !request.path.endsWith('.mjs') && !request.path.endsWith('.js')));
    check.geometry = await geometry(page); check.citations = citations; check.sources = sourceURLs;
    check.screenshot = path.basename(relative, '.html') + '-no-js-320.png';
    await page.screenshot({path: path.join(out, check.screenshot), fullPage: false});
    await preserved(page, context, {trace: false});
  }, {javascript: false});

  await scenario('Optional psychology link opens public study and Back returns to the exact source route without saving anything', async (page, check, context) => {
    const query = '?page=1&unit=DMP&line=0NVY';
    await open(page, 'sggs', query); const sourceURL = page.url();
    const panel = await choose(page, 'DMP', 'en', 'simple');
    await preserved(page, context);
    await panel.locator('.source-learning-psychology a').click();
    assert.equal(new URL(page.url()).pathname, prefix + psychologyPaths[0]);
    assert.equal(await page.locator('input[type="password"], script').count(), 0);
    await preserved(page, context);
    await page.goBack(); await ready(page); await exactPage(page, 'sggs', 1);
    assert.equal(page.url(), sourceURL);
    check.storage = await preserved(page, context);
  });
} catch (error) {
  report.status = 'FAIL'; report.failures.push({name: 'fixture preparation', error: error.stack || String(error)});
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  if (report.sourceCommit) {
    const mismatches = [];
    for (const [relative, expected] of Object.entries(report.sourceHashes)) {
      try {
        const bytes = execFileSync('git', ['show', report.sourceCommit + ':' + relative], {cwd: root, maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore']});
        if (sha(bytes) !== expected) mismatches.push(relative);
      } catch { mismatches.push(relative); }
    }
    report.sourceCommitMatchesAllReadFiles = mismatches.length === 0;
    report.filesDifferentFromRecordedHead = mismatches;
  }
  report.finished = new Date().toISOString();
  report.fixtureSha256 = sha(await fs.readFile(fileURLToPath(import.meta.url)));
  report.passed = report.checks.filter(check => check.status === 'PASS').length;
  report.failed = report.failures.length;
  await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({status: report.status, checks: report.checks.length, passed: report.passed, failures: report.failures, evidence: out}));
if (report.status !== 'PASS') process.exitCode = 1;
