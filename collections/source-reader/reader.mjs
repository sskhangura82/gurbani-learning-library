import {SOURCES} from './source-lock.mjs';
import {
  verifyManifest, verifyChunk, unitsForPage, parseRoute, formatRoute,
  lineForRoute, makeProgress, progressUnit, validateProgress, progressKey
} from './core.mjs';

const $ = id => document.getElementById(id);
const root = document.documentElement;
const binding = SOURCES[root.dataset.collection];
const status = $('source-status'), groups = $('source-groups');
const pageInput = $('source-page'), sectionInput = $('source-section');
const previous = $('source-previous'), next = $('source-next');
const save = $('source-save-place'), resume = $('source-resume');
const progressStatus = $('source-progress-status');
const controls = [...document.querySelectorAll('[data-source-control]')];
let manifest, route, sequence = 0, progressSequence = 0, loadedUnits = [], savedRecord = null;
const chunkCache = new Map();

function state(value, message) {
  root.dataset.sourceState = value;
  status.textContent = message;
  groups.setAttribute('aria-busy', String(value === 'loading'));
  for (const control of controls) control.disabled = !manifest || value === 'loading';
  save.disabled = value !== 'ready';
  resume.disabled = !savedRecord || value === 'loading';
  previous.disabled = value !== 'ready' || route.page <= 1;
  next.disabled = value !== 'ready' || route.page >= manifest.counts.pages;
}

async function readBounded(url, expectedBytes) {
  const response = await fetch(url, {credentials: 'omit', cache: 'no-store', redirect: 'error'});
  if (!response.ok || response.redirected) throw Error('Source unavailable');
  const advertised = response.headers.get('content-length');
  const encoding = response.headers.get('content-encoding');
  if ((!encoding || encoding === 'identity') && advertised !== null && (!/^\d+$/.test(advertised) || Number(advertised) !== expectedBytes)) throw Error('Source length mismatch');
  const reader = response.body?.getReader();
  if (!reader) throw Error('Source stream unavailable');
  const bytes = new Uint8Array(expectedBytes); let offset = 0;
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      if (offset + value.length > expectedBytes) throw Error('Source exceeds bound');
      bytes.set(value, offset); offset += value.length;
    }
  } catch (error) { await reader.cancel().catch(() => {}); throw error; }
  finally { reader.releaseLock(); }
  if (offset !== expectedBytes) throw Error('Source incomplete');
  return bytes;
}

async function chunkFor(descriptor) {
  if (chunkCache.has(descriptor.chunkId)) return chunkCache.get(descriptor.chunkId);
  const info = manifest.chunks.find(chunk => chunk.id === descriptor.chunkId);
  const base = new URL(binding.path, import.meta.url);
  const request = readBounded(new URL(info.path, base), info.bytes)
    .then(bytes => verifyChunk(bytes, info, manifest));
  chunkCache.set(info.id, request);
  try {
    const chunk = await request;
    // Keep only a small in-memory reading window. No source is written to storage.
    while (chunkCache.size > 12) chunkCache.delete(chunkCache.keys().next().value);
    return chunk;
  } catch (error) { if (chunkCache.get(info.id) === request) chunkCache.delete(info.id); throw error; }
}

async function unitFor(descriptor) {
  const chunk = await chunkFor(descriptor);
  const unit = chunk.units.find(value => value.id === descriptor.id);
  if (!unit) throw Error('Owning source group unavailable');
  return unit;
}

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderUnit(unit, requestedPage) {
  const descriptor = manifest.units.find(value => value.id === unit.id);
  const section = manifest.sections.find(value => value.id === unit.sectionId);
  const article = node('article', 'source-group'); article.dataset.groupId = unit.id;
  const heading = node('h2', 'group-heading', section.name.Latn);
  article.append(heading);
  const first = descriptor.pages[0], last = descriptor.pages.at(-1);
  article.append(node('p', 'group-context', `${binding.locator} ${first}${first === last ? '' : '–' + last} · Complete source group · ${unit.lines.length} lines`));
  if (descriptor.pages.length > 1) article.append(node('p', 'group-boundary', 'This source group continues across page boundaries. All of its lines are shown together.'));
  const text = node('div', 'source-lines');
  for (const line of unit.lines) {
    const row = node('div', 'source-line'); row.dataset.requestedPage = String(line.page === requestedPage);
    const original = node('p', 'gurmukhi', line.text);
    original.lang = 'pa-Guru'; original.tabIndex = -1;
    original.dataset.sourceLineId = line.id; original.dataset.sourcePage = String(line.page);
    const locator = node('span', 'line-locator', `${binding.locator} ${line.page}${line.printedLine === null ? '' : ' · line ' + line.printedLine}`);
    row.append(original, locator); text.append(row);
  }
  article.append(text);
  // Names are provider attributions, not independently established authorship.
  const attribution = manifest.authors.find(value => value.id === unit.authorId);
  if (attribution) {
    const detail = node('details', 'source-attribution');
    detail.dataset.sourceAuthorId = unit.authorId;
    detail.append(node('summary', '', 'Source attribution'));
    detail.append(node('p', '', `${attribution.name.Latn} — as recorded by this digital source. This metadata is not a separate historical authorship finding.`));
    article.append(detail);
  }
  return article;
}

function refuse(message) {
  groups.replaceChildren(); loadedUnits = []; route = null;
  $('source-page-label').textContent = 'Reading unavailable';
  state('refused', message);
}

async function show(search, {scroll = false} = {}) {
  const current = ++sequence;
  groups.replaceChildren(); loadedUnits = []; route = null;
  state('loading', 'Checking the complete source groups for this reading…');
  try {
    const requested = parseRoute(search, manifest);
    const descriptors = unitsForPage(manifest, requested.page);
    const units = await Promise.all(descriptors.map(unitFor));
    if (current !== sequence) return;
    const focusUnit = requested.unitId ? units.find(unit => unit.id === requested.unitId) : null;
    if (focusUnit) lineForRoute(manifest, requested, focusUnit);
    const fragment = document.createDocumentFragment();
    for (const unit of units) fragment.append(renderUnit(unit, requested.page));
    groups.replaceChildren(fragment); loadedUnits = units; route = requested;
    pageInput.value = String(route.page);
    sectionInput.value = (focusUnit || units[0]).sectionId;
    $('source-page-label').textContent = `${binding.locator} ${route.page} of ${manifest.counts.pages}`;
    document.title = `${binding.locator} ${route.page} · ${binding.title} · Gurbani Learning Library`;
    state('ready', `${units.length} complete source ${units.length === 1 ? 'group' : 'groups'}. Page labels follow the named digital edition.`);
    if (scroll || requested.lineId || requested.unitId) {
      const anchor = requested.lineId
        ? [...groups.querySelectorAll('[data-source-line-id]')].find(element => element.dataset.sourceLineId === requested.lineId)
        : [...groups.querySelectorAll('[data-source-line-id]')].find(element => Number(element.dataset.sourcePage) === route.page && (!requested.unitId || element.closest('[data-group-id]').dataset.groupId === requested.unitId));
      if (anchor) { anchor.scrollIntoView({block: 'start'}); anchor.focus({preventScroll: true}); }
    }
  } catch {
    if (current !== sequence) return;
    refuse('This reading could not be verified. Check the page number and your connection, then choose Go. No partial source text is shown.');
  }
}

async function navigate(search) {
  try {
    const requested = parseRoute(search, manifest);
    const nextURL = new URL(location.href); nextURL.search = formatRoute(requested); nextURL.hash = '';
    if (nextURL.href !== location.href) history.pushState(null, '', nextURL);
    await show(nextURL.search, {scroll: true});
  } catch { ++sequence; refuse('That page or source location is not available in this edition. Enter a valid page number and choose Go.'); }
}

async function loadSavedPlace() {
  const current = ++progressSequence;
  savedRecord = null; resume.disabled = true;
  try {
    const raw = localStorage.getItem(progressKey(manifest));
    if (raw === null) { progressStatus.textContent = 'Save a place when you want to return to a line on this device.'; return; }
    if (raw.length > 4096) throw Error('Saved record exceeds bound');
    const record = JSON.parse(raw), descriptor = progressUnit(record, manifest);
    const unit = await unitFor(descriptor);
    validateProgress(record, manifest, unit);
    if (current !== progressSequence) return;
    savedRecord = record;
    progressStatus.textContent = `Saved place: ${binding.locator} ${record.page}. Resume opens the same source line.`;
    resume.disabled = root.dataset.sourceState === 'loading';
  } catch {
    if (current !== progressSequence) return;
    progressStatus.textContent = 'The saved place cannot be matched to this edition. It has been kept unchanged. You can continue reading or explicitly save a new place.';
  }
}

$('source-page-form').addEventListener('submit', event => {
  event.preventDefault(); if (manifest) void navigate('?page=' + encodeURIComponent(pageInput.value));
});
previous.addEventListener('click', () => { if (route) void navigate('?page=' + (route.page - 1)); });
next.addEventListener('click', () => { if (route) void navigate('?page=' + (route.page + 1)); });
sectionInput.addEventListener('change', () => {
  if (!manifest) return;
  const unit = manifest.units.find(value => value.sectionId === sectionInput.value);
  if (unit) void navigate(formatRoute({page: unit.pages[0], unitId: unit.id, lineId: null}));
});
window.addEventListener('popstate', () => { if (manifest) void show(location.search, {scroll: true}); });
save.addEventListener('click', () => {
  if (!route || root.dataset.sourceState !== 'ready') return;
  try {
    const elements = [...groups.querySelectorAll('[data-source-line-id]')];
    const top = Math.max(0, $('source-reading-actions').getBoundingClientRect().bottom);
    const visible = elements.find(element => { const rect = element.getBoundingClientRect(); return rect.bottom > top && rect.top < innerHeight; });
    const anchor = visible || elements.find(element => element.dataset.sourceLineId === route.lineId) || elements.find(element => Number(element.dataset.sourcePage) === route.page);
    const unit = loadedUnits.find(value => value.id === anchor.closest('[data-group-id]').dataset.groupId);
    const line = unit.lines.find(value => value.id === anchor.dataset.sourceLineId);
    const record = makeProgress(manifest, unit, line, new Date().toISOString());
    localStorage.setItem(progressKey(manifest), JSON.stringify(record));
    ++progressSequence;
    savedRecord = record; resume.disabled = false;
    progressStatus.textContent = `Place saved at ${binding.locator} ${record.page} on this device.`;
  } catch { progressStatus.textContent = 'Your place could not be saved on this device. Reading is still available.'; }
});
resume.addEventListener('click', async () => {
  if (!savedRecord || !manifest) return;
  const record = savedRecord, navigationAtStart = sequence;
  try {
    const unit = await unitFor(progressUnit(record, manifest));
    validateProgress(record, manifest, unit);
    if (navigationAtStart !== sequence) return;
    await navigate(formatRoute({page: record.page, unitId: record.unitId, lineId: record.lineId}));
  } catch { savedRecord = null; resume.disabled = true; progressStatus.textContent = 'This saved source line is unavailable. The stored record has been kept unchanged.'; }
});
$('source-theme').addEventListener('click', event => {
  const current = root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  root.dataset.theme = current === 'dark' ? 'light' : 'dark';
  event.currentTarget.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
  event.currentTarget.textContent = root.dataset.theme === 'dark' ? 'Day appearance' : 'Night appearance';
});
$('source-size').addEventListener('change', event => { root.dataset.size = event.target.value; });

async function start() {
  state('loading', 'Opening the named digital edition…');
  try {
    if (!binding) throw Error('Unknown collection');
    manifest = await verifyManifest(await readBounded(new URL(binding.path, import.meta.url), binding.bytes), binding);
    for (const section of manifest.sections) {
      const option = node('option', '', section.name.Latn); option.value = section.id; sectionInput.append(option);
    }
    pageInput.setAttribute('aria-label', binding.locator + ' number');
    await show(location.search);
    await loadSavedPlace();
  } catch { refuse('This edition could not be opened and checked. Reconnect and reload to try again. No source text has been displayed.'); }
}
void start();
