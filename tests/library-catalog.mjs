import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {READERS, COLLECTIONS, EXPLORE, TOOLS, PLANNED} from '../library/catalog.mjs';
import {parseView, searchEntries, getReader, getEntry} from '../library/core.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceRoot = 'https://library.example/';
const ids = entries => entries.map(entry => entry.id);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const contents = filename => fs.readFileSync(path.join(root, filename));
const json = filename => JSON.parse(contents(filename));

function relativeRoute(href) {
  assert.equal(typeof href, 'string');
  assert.ok(!/^(?:[a-z]+:|\/|\\)/i.test(href), 'Only relative same-library routes');
  assert.ok(!href.includes('\\') && !href.includes('..'));
  const url = new URL(href, sourceRoot);
  assert.equal(url.origin, new URL(sourceRoot).origin);
  assert.equal(url.hash, '', 'Reader entry does not invent a hash route');
  const filename = fileURLToPath(new URL('.' + url.pathname, new URL('file://' + root)));
  assert.ok(filename.startsWith(root));
  assert.ok(fs.statSync(filename).isFile(), href + ' resolves to an existing page');
  return url;
}

function sourceObject(entry) {
  const source = entry.sourceBindings[0];
  const bytes = contents(source.path);
  assert.equal(hash(bytes), source.sha256, source.path + ' remains the pinned bytes');
  if (source.path.endsWith('.json')) return JSON.parse(bytes);
  const sandbox = {window: {}};
  vm.runInNewContext(bytes.toString('utf8'), sandbox, {timeout: 1000});
  return sandbox.window[entry.id === 'japji' ? 'GLP_FULL_JAPJI' : 'GLP_SUKHMANI'];
}

function allFrozen(value) {
  if (!value || typeof value !== 'object') return;
  assert.ok(Object.isFrozen(value));
  Object.values(value).forEach(allFrozen);
}

test('the directory names ten distinct existing readers and does not duplicate Japji', () => {
  assert.deepEqual(ids(READERS), ['japji', 'jaap', 'savaiye', 'chaupai', 'anand', 'rehras', 'sohila', 'sukhmani', 'salok-mahalla9', 'salok-kabir']);
  assert.equal(new Set(ids(READERS)).size, 10);
  assert.equal(READERS.filter(entry => entry.id === 'japji').length, 1);
  assert.equal(COLLECTIONS.length, 2);
  assert.deepEqual(COLLECTIONS[0].readerIds, ids(READERS.filter(entry => entry.group === 'nitnem')));
  assert.equal(new Set(COLLECTIONS[0].readerIds).size, 7);
  assert.ok(COLLECTIONS[0].readerIds.includes('japji'));
  assert.ok(!ids(READERS).includes('nitnem'));
  const dasam = COLLECTIONS.find(entry => entry.id === 'dasam-collection');
  assert.deepEqual(dasam.readerIds, ['jaap', 'savaiye', 'chaupai']);
  assert.ok(dasam.readerIds.every(id => getReader(id).sourceFamily === 'dasam'));
  relativeRoute(dasam.href);
});

test('every reader route exists and Saved entry preserves its exact reading route', () => {
  for (const entry of READERS) {
    const ordinary = relativeRoute(entry.href);
    const saved = relativeRoute(entry.savedHref);
    assert.equal(saved.pathname, ordinary.pathname);
    assert.deepEqual(saved.searchParams.getAll('learning'), ['saved']);
    saved.searchParams.delete('learning');
    assert.equal(saved.search, ordinary.search);
    assert.ok(!ordinary.searchParams.has('unit'), 'Directory resume links must not override a saved passage');
    assert.deepEqual([...ordinary.searchParams.keys()], ['japji', 'sukhmani'].includes(entry.id) ? [] : ['bani']);
    if (ordinary.searchParams.has('bani')) assert.equal(ordinary.searchParams.get('bani'), entry.id);
  }
});

test('each source binding matches exact file bytes and declared identity', () => {
  for (const entry of READERS) {
    assert.equal(entry.sourceBindings.length, 1);
    const binding = entry.sourceBindings[0];
    assert.match(binding.sha256, /^[0-9a-f]{64}$/);
    assert.ok(!path.isAbsolute(binding.path) && !binding.path.split('/').includes('..'));
    const source = sourceObject(entry);
    if (binding.compositionId) assert.equal(source.compositionId, binding.compositionId);
    if (binding.editionId) assert.equal(source.editionId, binding.editionId);
    if (source.title) assert.equal(entry.title, source.title);
    if (source.titleGurmukhi) assert.equal(entry.titlePa, source.titleGurmukhi);
    if (source.sourceFamily) assert.equal(entry.sourceFamily, source.sourceFamily);
  }
});

test('source package metadata and existing manifests agree with the directory bindings', () => {
  for (const manifestPath of ['nitnem/data/library.json', 'salok-mahalla9/data/library.json', 'salok-kabir/data/library.json']) {
    const manifest = json(manifestPath);
    const parent = path.dirname(path.dirname(manifestPath));
    for (const [id, item] of Object.entries(manifest.entries)) {
      const entry = getReader(id);
      assert.ok(entry);
      assert.equal(entry.sourceBindings[0].path, path.posix.join(parent, item.path));
      assert.equal(entry.sourceBindings[0].sha256, item.sha256);
      assert.equal(entry.sourceBindings[0].editionId, item.editionId);
      assert.equal(entry.title, item.title);
      assert.equal(entry.titlePa, item.titleGurmukhi);
      assert.equal(manifest.qualifiedHumanReviewed, false);
    }
  }
});

test('Nitnem preserves its mixed source families instead of relabelling everything SGGS', () => {
  assert.deepEqual(ids(READERS.filter(entry => entry.sourceFamily === 'dasam')), ['jaap', 'savaiye', 'chaupai']);
  assert.equal(getReader('rehras').sourceFamily, 'composite');
  assert.equal(getReader('anand').sourceFamily, 'sggs');
  assert.equal(getReader('sohila').sourceFamily, 'sggs');
  assert.match(getReader('chaupai').summary, /29-group/);
  assert.match(getReader('chaupai').summary, /Rehras.*different boundaries/);
  assert.match(getReader('salok-kabir').summary, /Individual attribution review remains pending/);
});

test('directory records contain navigation metadata, not verse copies or authority claims', () => {
  const permitted = new Set(['id', 'title', 'titlePa', 'group', 'href', 'savedHref', 'summary', 'reviewLabel', 'sourceFamily', 'aliases', 'sourceBindings']);
  for (const entry of READERS) {
    assert.ok(Object.keys(entry).every(key => permitted.has(key)));
    assert.ok(entry.reviewLabel.includes('qualified') && entry.reviewLabel.includes('pending'));
    assert.ok(!Object.values(entry).some(value => typeof value === 'string' && /[।॥]/u.test(value)), 'No verse or original-heading punctuation is copied into directory text');
    assert.ok(!Object.keys(entry).some(key => /^(?:text|gurmukhi|lines|verses|meaning|translation|claims|ang|author|approved|authentic)$/i.test(key)));
    assert.ok(!/\b(?:authenticated|authoritative|approved translation|qualified approval)\b/i.test(entry.reviewLabel));
  }
});

test('all catalog arrays, records and nested aliases/bindings are immutable', () => {
  [READERS, COLLECTIONS, EXPLORE, TOOLS, PLANNED].forEach(allFrozen);
});

test('whole-token directory search rejects substring traps and unrelated metadata', () => {
  for (const query of ['NASA', 'category', 'ha', 'authentic', 'sggs', 'dasam', 'qualified', 'sourceBindings', 'pauri']) {
    assert.deepEqual(ids(searchEntries(query)), [], query);
  }
  assert.deepEqual(ids(searchEntries('Salok')), ['salok-mahalla9', 'salok-kabir']);
  assert.deepEqual(ids(searchEntries('japji')), ['japji']);
  assert.deepEqual(ids(searchEntries('  JAPJI SAHIB ')), ['japji']);
  assert.deepEqual(ids(searchEntries('sukhmani')), ['sukhmani']);
  assert.deepEqual(ids(searchEntries('jaap')), ['jaap']);
  assert.deepEqual(ids(searchEntries('jap')), []);
  assert.deepEqual(ids(searchEntries('sahib jaap')), ['jaap']);
});

test('explicit Punjabi and transliterated title aliases resolve without searching descriptions', () => {
  assert.deepEqual(ids(searchEntries('ਜਪੁਜੀ')), ['japji']);
  assert.deepEqual(ids(searchEntries('ਸੁਖਮਨੀ ਸਾਹਿਬ')), ['sukhmani']);
  assert.deepEqual(ids(searchEntries('ਸਲੋਕ ਮਹਲਾ ੯')), ['salok-mahalla9']);
  assert.deepEqual(ids(searchEntries('salok mehla 9')), ['salok-mahalla9']);
  assert.deepEqual(ids(searchEntries('salok mahalla9')), ['salok-mahalla9']);
  assert.deepEqual(ids(searchEntries('kabeer')), ['salok-kabir']);
  assert.deepEqual(ids(searchEntries('tav prasad savaiye')), ['savaiye']);
});

test('empty search shows readers, punctuation-only and invalid input do not', () => {
  assert.deepEqual(ids(searchEntries('')), ids(READERS));
  assert.deepEqual(ids(searchEntries(' \n\t ')), ids(READERS));
  assert.deepEqual(ids(searchEntries('!!!')), []);
  assert.deepEqual(ids(searchEntries('---')), []);
  assert.deepEqual(searchEntries(null), []);
  assert.deepEqual(searchEntries('japji', null), []);
});

test('only one explicit valid view is accepted; ambiguous and malformed view state defaults to Today', () => {
  for (const view of ['today', 'read', 'explore', 'saved']) {
    assert.equal(parseView('?view=' + view), view);
    assert.equal(parseView(new URLSearchParams('view=' + view)), view);
  }
  for (const input of ['', '?q=japji', '?view=', '?view=READ', '?view=unknown', '?view=read&view=read', '?view=read&view=saved', '?view=%', '?view=https://example.com', null, {}, 42]) {
    assert.equal(parseView(input), 'today');
  }
  assert.equal(parseView('?view=read&q=salok'), 'read');
});

test('Explore only links existing destinations and preserves literal-topic status', () => {
  assert.deepEqual(ids(EXPLORE), ['psychology', 'private-reading', 'source-sheets', 'haumai-source-sheet', 'dubidha-source-sheet', 'gurdwaras']);
  const catalog = json('articles/catalog.json');
  for (const entry of EXPLORE) relativeRoute(entry.href);
  for (const entry of EXPLORE.filter(item => item.kind === 'source-reading-sheet')) {
    const article = catalog.articles.find(item => item.id === entry.id);
    assert.ok(article);
    assert.equal(entry.selectionBasis, 'LITERAL_TOKEN');
    assert.equal(entry.semanticReviewed, false);
    assert.equal(article.selection.semanticReviewed, false);
    assert.equal(article.explanation, null);
    assert.deepEqual(article.claims, []);
    assert.equal(new URL(entry.href, sourceRoot).searchParams.get('id'), article.id);
    const topic = catalog.topics.find(item => item.id === article.topicId);
    assert.deepEqual(entry.aliases, topic.searchTerms);
  }
  assert.deepEqual(ids(searchEntries('ego', EXPLORE)), ['haumai-source-sheet']);
  assert.deepEqual(ids(searchEntries('ha', EXPLORE)), []);
  assert.deepEqual(ids(searchEntries('category', EXPLORE)), []);
});

test('Simran and physiology remain distinct navigation categories', () => {
  assert.deepEqual(ids(TOOLS), ['simran', 'breathing']);
  for (const entry of TOOLS) relativeRoute(entry.href);
  const simran = TOOLS.find(item => item.id === 'simran');
  const breathing = TOOLS.find(item => item.id === 'breathing');
  assert.notEqual(simran.kind, breathing.kind);
  assert.notEqual(simran.category, breathing.category);
  assert.equal(breathing.kind, 'physiology-tool');
  assert.ok(!READERS.some(entry => TOOLS.some(tool => tool.href === entry.href)));
});

test('planned modules are unavailable metadata rather than functioning links or substitutes', () => {
  assert.ok(!PLANNED.some(entry => entry.id === 'daily-hukamnama'));
  relativeRoute('hukamnama/index.html');
  relativeRoute('hukamnama/index.html?learning=saved');
  assert.ok(PLANNED.some(entry => entry.id === 'full-guru-granth-sahib'));
  for (const entry of PLANNED) {
    assert.equal(entry.available, false);
    assert.ok(!Object.hasOwn(entry, 'href'));
    assert.ok(!Object.hasOwn(entry, 'sourceBindings'));
  }
  const all = [...READERS, ...COLLECTIONS, ...EXPLORE, ...TOOLS, ...PLANNED];
  assert.equal(new Set(ids(all)).size, all.length);
});

test('lookup helpers only return the declared catalogue entry', () => {
  assert.equal(getReader('japji'), READERS[0]);
  assert.equal(getReader('simran'), undefined);
  assert.equal(getEntry('simran'), TOOLS[0]);
  assert.equal(getEntry('daily-hukamnama'), undefined, 'Daily dated reader is separate from the fixed Bani catalogue');
  assert.equal(getReader('__proto__'), undefined);
  assert.equal(getEntry('constructor'), undefined);
  assert.equal(getEntry('../full-japji.html'), undefined);
});
