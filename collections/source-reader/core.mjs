// Original-only, named digital editions. All locators and attributions are source-reported.
// This module performs no fetching, rendering, storage, text normalization, or interpretation.
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', {fatal: true, ignoreBOM: true});
const manifests = new WeakMap();
const units = new WeakMap();
const MANIFEST_LIMIT = 4 * 1024 * 1024;
const CHUNK_LIMIT = 128 * 1024;
const HASH = /^[a-f0-9]{64}$/;
const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const EDITIONS = Object.freeze({sggs: ['SGGS', 'SSA2'], dasam: ['SDGR', 'DGDG']});
const PROGRESS_KEYS = ['schema', 'collectionId', 'editionId', 'unitId', 'unitSha256', 'lineId', 'page', 'updatedAt'];

function need(condition, code) {
  if (!condition) { const error = new Error(code); error.code = code; throw error; }
}
function keys(value, expected, code = 'SOURCE_SCHEMA') {
  need(value !== null && typeof value === 'object' && !Array.isArray(value), code);
  const actual = Object.keys(value);
  need(actual.length === expected.length && actual.every(key => expected.includes(key)), code);
}
function integer(value, max = 1000000) { return Number.isSafeInteger(value) && value > 0 && value <= max; }
function identifier(value) { return typeof value === 'string' && ID.test(value); }
function text(value, limit = 4096) {
  if (typeof value !== 'string' || value.length === 0 || encoder.encode(value).byteLength > limit) return false;
  // Unpaired UTF-16 surrogates cannot represent the exact original UTF-8 text.
  for (const character of value) { const code = character.codePointAt(0); if (code >= 0xd800 && code <= 0xdfff) return false; }
  return true;
}
function metadataName(value, names) {
  keys(value, names);
  need(names.every(key => text(value[key])), 'SOURCE_NAME');
}
function same(left, right) { return JSON.stringify(left) === JSON.stringify(right); }
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function inputBytes(input, limit) {
  need(input instanceof Uint8Array || input instanceof ArrayBuffer, 'SOURCE_BYTES');
  const raw = input instanceof ArrayBuffer ? new Uint8Array(input.slice(0)) : new Uint8Array(input);
  need(raw.byteLength > 0 && raw.byteLength <= limit, 'SOURCE_SIZE');
  return raw;
}
async function sha256(raw) {
  need(globalThis.crypto?.subtle, 'SOURCE_CRYPTO');
  return Array.from(new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', raw)), value => value.toString(16).padStart(2, '0')).join('');
}
function parse(raw) {
  let value, decoded;
  try { decoded = decoder.decode(raw); value = JSON.parse(decoded); }
  catch { need(false, 'SOURCE_JSON'); }
  // The importer contract is compact JSON plus exactly one LF. This also refuses
  // duplicate keys (including escaped aliases), BOMs, and ambiguous encodings.
  let canonical;
  try { canonical = JSON.stringify(value) + '\n'; } catch { need(false, 'SOURCE_JSON'); }
  need(decoded === canonical, 'SOURCE_CANONICAL_JSON');
  return value;
}
function manifestState(manifest) {
  const state = manifests.get(manifest);
  need(state, 'SOURCE_UNVERIFIED_MANIFEST');
  return state;
}
function verifiedUnit(manifest, unit) {
  manifestState(manifest);
  const state = units.get(unit);
  need(state?.manifest === manifest, 'SOURCE_UNVERIFIED_UNIT');
  return state.descriptor;
}

export async function verifyManifest(input, binding) {
  need(binding && typeof binding === 'object' && Object.hasOwn(EDITIONS, binding.collectionId)
    && typeof binding.editionId === 'string' && HASH.test(binding.sha256)
    && integer(binding.bytes, MANIFEST_LIMIT), 'SOURCE_BINDING');
  const raw = inputBytes(input, MANIFEST_LIMIT);
  need(raw.byteLength === binding.bytes, 'SOURCE_MANIFEST_SIZE');
  need(await sha256(raw) === binding.sha256, 'SOURCE_MANIFEST_DIGEST');
  const manifest = parse(raw);
  keys(manifest, ['schema', 'status', 'locatorStatus', 'collectionId', 'editionId', 'name', 'source', 'counts', 'sections', 'authors', 'units', 'chunks']);
  need(manifest.schema === 'glp.sikh-reader.manifest.v1'
    && manifest.status === 'NAMED_DIGITAL_EDITION_ORIGINAL_ONLY'
    && manifest.locatorStatus === 'SOURCE_REPORTED'
    && manifest.collectionId === binding.collectionId && manifest.editionId === binding.editionId, 'SOURCE_IDENTITY');
  metadataName(manifest.name, ['Latn', 'Guru']);
  const source = manifest.source;
  keys(source, ['packageName', 'packageVersion', 'reportedGitHead', 'archiveSha256', 'databaseSha256', 'noticeSha256', 'sourceId', 'assetId']);
  const pair = EDITIONS[manifest.collectionId];
  need(source.packageName === '@shabados/database' && typeof source.packageVersion === 'string'
    && /^[0-9]+\.[0-9]+\.[0-9]+(?:-[A-Za-z0-9.-]+)?$/.test(source.packageVersion)
    && typeof source.reportedGitHead === 'string' && /^[a-f0-9]{40}$/.test(source.reportedGitHead)
    && [source.archiveSha256, source.databaseSha256, source.noticeSha256].every(value => typeof value === 'string' && HASH.test(value))
    && source.sourceId === pair[0] && source.assetId === pair[1]
    && manifest.editionId === `shabados-${source.packageVersion}-${source.sourceId}-${source.assetId}`, 'SOURCE_PROVENANCE');
  keys(manifest.counts, ['units', 'lines', 'pages']);
  need(Object.values(manifest.counts).every(value => integer(value)), 'SOURCE_COUNTS');
  need(Array.isArray(manifest.sections) && manifest.sections.length > 0
    && Array.isArray(manifest.authors) && manifest.authors.length > 0
    && Array.isArray(manifest.units) && manifest.units.length === manifest.counts.units
    && Array.isArray(manifest.chunks) && manifest.chunks.length > 0, 'SOURCE_COUNTS');
  const sections = new Map(), authors = new Map(), byUnit = new Map(), byChunk = new Map(), byPage = new Map();
  for (const [index, section] of manifest.sections.entries()) {
    keys(section, ['id', 'order', 'name']);
    need(identifier(section.id) && section.order === index + 1 && !sections.has(section.id), 'SOURCE_SECTION');
    metadataName(section.name, ['Latn']);
    sections.set(section.id, section);
  }
  for (const author of manifest.authors) {
    keys(author, ['id', 'name']);
    need(identifier(author.id) && !authors.has(author.id), 'SOURCE_AUTHOR');
    metadataName(author.name, ['Guru', 'Latn']);
    authors.set(author.id, author);
  }
  let lineCount = 0, previousSection = 0, sectionOrder = 0;
  for (const descriptor of manifest.units) {
    keys(descriptor, ['id', 'sectionId', 'sectionOrder', 'authorId', 'lineCount', 'pages', 'sha256', 'chunkId']);
    const section = sections.get(descriptor.sectionId);
    need(identifier(descriptor.id) && !byUnit.has(descriptor.id) && section && authors.has(descriptor.authorId)
      && integer(descriptor.lineCount) && typeof descriptor.sha256 === 'string' && HASH.test(descriptor.sha256)
      && typeof descriptor.chunkId === 'string' && /^c[0-9]{4}$/.test(descriptor.chunkId), 'SOURCE_UNIT_DESCRIPTOR');
    if (section.order !== previousSection) {
      need(section.order === previousSection + 1, 'SOURCE_UNIT_ORDER');
      previousSection = section.order; sectionOrder = 0;
    }
    need(descriptor.sectionOrder === ++sectionOrder, 'SOURCE_UNIT_ORDER');
    need(Array.isArray(descriptor.pages) && descriptor.pages.length > 0 && descriptor.pages.length <= descriptor.lineCount, 'SOURCE_UNIT_PAGES');
    let previousPage = 0;
    for (const page of descriptor.pages) {
      need(integer(page, manifest.counts.pages) && page > previousPage, 'SOURCE_UNIT_PAGES');
      previousPage = page;
      if (!byPage.has(page)) byPage.set(page, []);
      byPage.get(page).push(descriptor);
    }
    lineCount += descriptor.lineCount;
    byUnit.set(descriptor.id, descriptor);
  }
  need(lineCount === manifest.counts.lines && previousSection === manifest.sections.length
    && byPage.size === manifest.counts.pages, 'SOURCE_COVERAGE');
  for (let page = 1; page <= manifest.counts.pages; page++) need(byPage.has(page), 'SOURCE_COVERAGE');
  let unitIndex = 0;
  for (const [index, descriptor] of manifest.chunks.entries()) {
    keys(descriptor, ['id', 'path', 'bytes', 'sha256', 'unitIds']);
    need(descriptor.id === `c${String(index + 1).padStart(4, '0')}` && descriptor.path === `chunks/${descriptor.id}.json`
      && integer(descriptor.bytes, CHUNK_LIMIT) && typeof descriptor.sha256 === 'string' && HASH.test(descriptor.sha256)
      && Array.isArray(descriptor.unitIds) && descriptor.unitIds.length > 0, 'SOURCE_CHUNK_DESCRIPTOR');
    for (const id of descriptor.unitIds) {
      const unit = manifest.units[unitIndex++];
      need(unit && unit.id === id && unit.chunkId === descriptor.id, 'SOURCE_CHUNK_COVERAGE');
    }
    byChunk.set(descriptor.id, descriptor);
  }
  need(unitIndex === manifest.units.length, 'SOURCE_CHUNK_COVERAGE');
  for (const list of byPage.values()) Object.freeze(list);
  freeze(manifest);
  manifests.set(manifest, {byUnit, byChunk, byPage, lineOwners: new Map()});
  return manifest;
}

export async function verifyChunk(input, descriptor, manifest) {
  const state = manifestState(manifest);
  need(descriptor && state.byChunk.get(descriptor.id) === descriptor, 'SOURCE_UNVERIFIED_DESCRIPTOR');
  const raw = inputBytes(input, CHUNK_LIMIT);
  need(raw.byteLength === descriptor.bytes, 'SOURCE_CHUNK_SIZE');
  need(await sha256(raw) === descriptor.sha256, 'SOURCE_CHUNK_DIGEST');
  const chunk = parse(raw);
  keys(chunk, ['schema', 'collectionId', 'editionId', 'id', 'units']);
  need(chunk.schema === 'glp.sikh-reader.chunk.v1' && chunk.collectionId === manifest.collectionId
    && chunk.editionId === manifest.editionId && chunk.id === descriptor.id, 'SOURCE_CHUNK_IDENTITY');
  need(Array.isArray(chunk.units) && chunk.units.length === descriptor.unitIds.length, 'SOURCE_CHUNK_COVERAGE');
  const lineOwners = new Map(), digests = [];
  for (const [index, unit] of chunk.units.entries()) {
    keys(unit, ['id', 'sectionId', 'sectionOrder', 'authorId', 'lines']);
    const expected = state.byUnit.get(descriptor.unitIds[index]);
    need(unit.id === expected.id && unit.sectionId === expected.sectionId
      && unit.sectionOrder === expected.sectionOrder && unit.authorId === expected.authorId, 'SOURCE_UNIT_BINDING');
    need(Array.isArray(unit.lines) && unit.lines.length === expected.lineCount, 'SOURCE_COMPLETE_UNIT');
    const pages = new Set();
    for (const [lineIndex, line] of unit.lines.entries()) {
      keys(line, ['id', 'order', 'page', 'printedLine', 'text']);
      need(identifier(line.id) && !lineOwners.has(line.id) && line.order === lineIndex + 1
        && integer(line.page, manifest.counts.pages) && expected.pages.includes(line.page)
        && (line.printedLine === null || integer(line.printedLine)) && text(line.text, 65536), 'SOURCE_LINE');
      lineOwners.set(line.id, unit.id); pages.add(line.page);
    }
    need(same([...pages].sort((a, b) => a - b), expected.pages), 'SOURCE_UNIT_PAGES');
    // Hash the supplied insertion order. No rewriting, field removal, or Unicode normalization.
    digests.push([encoder.encode(JSON.stringify(unit)), expected.sha256]);
  }
  await Promise.all(digests.map(async ([rawUnit, expected]) => need(await sha256(rawUnit) === expected, 'SOURCE_UNIT_DIGEST')));
  // Also detect a repeated source line in another chunk if that chunk has been verified.
  for (const [id, owner] of lineOwners) need(!state.lineOwners.has(id) || state.lineOwners.get(id) === owner, 'SOURCE_DUPLICATE_LINE');
  freeze(chunk);
  for (const unit of chunk.units) units.set(unit, {manifest, descriptor: state.byUnit.get(unit.id)});
  for (const [id, owner] of lineOwners) state.lineOwners.set(id, owner);
  return chunk;
}

export function unitsForPage(manifest, page) {
  const state = manifestState(manifest);
  need(integer(page, manifest.counts.pages) && state.byPage.has(page), 'SOURCE_ROUTE_PAGE');
  return state.byPage.get(page);
}
function routeShape(route) {
  need(route && typeof route === 'object' && !Array.isArray(route) && Object.hasOwn(route, 'page')
    && Object.keys(route).every(key => ['page', 'unitId', 'lineId'].includes(key)), 'SOURCE_ROUTE');
  const unitId = route.unitId ?? null, lineId = route.lineId ?? null;
  need(integer(route.page) && (unitId === null || identifier(unitId)) && (lineId === null || identifier(lineId))
    && (lineId === null || unitId !== null), 'SOURCE_ROUTE');
  return {page: route.page, unitId, lineId};
}
function checkedRoute(manifest, value) {
  const state = manifestState(manifest), route = routeShape(value);
  unitsForPage(manifest, route.page);
  if (route.unitId !== null) need(state.byUnit.get(route.unitId)?.pages.includes(route.page), 'SOURCE_ROUTE_UNIT');
  return Object.freeze(route);
}
export function parseRoute(search, manifest) {
  manifestState(manifest);
  need(typeof search === 'string' && search.length <= 512 && !search.includes('#'), 'SOURCE_ROUTE');
  if (search === '' || search === '?') return checkedRoute(manifest, {page: 1});
  need(search.startsWith('?') && !/%(?![0-9a-fA-F]{2})/.test(search), 'SOURCE_ROUTE');
  try { decodeURIComponent(search); } catch { need(false, 'SOURCE_ROUTE'); }
  need(search.slice(1).split('&').every(part => part.length > 0 && part.includes('=')), 'SOURCE_ROUTE');
  const params = new URLSearchParams(search), seen = new Set();
  for (const [key] of params) {
    need(['page', 'unit', 'line'].includes(key) && !seen.has(key), 'SOURCE_ROUTE'); seen.add(key);
  }
  need(params.has('page') && /^[1-9][0-9]{0,5}$/.test(params.get('page')), 'SOURCE_ROUTE_PAGE');
  return checkedRoute(manifest, {page: Number(params.get('page')), unitId: params.get('unit'), lineId: params.get('line')});
}
export function formatRoute(value) {
  const route = routeShape(value), params = new URLSearchParams({page: String(route.page)});
  if (route.unitId !== null) params.set('unit', route.unitId);
  if (route.lineId !== null) params.set('line', route.lineId);
  return `?${params}`;
}
export function lineForRoute(manifest, value, unit) {
  const route = checkedRoute(manifest, value);
  if (route.unitId === null) return null;
  const descriptor = verifiedUnit(manifest, unit);
  need(descriptor.id === route.unitId, 'SOURCE_ROUTE_UNIT');
  if (route.lineId === null) return null;
  const line = unit.lines.find(item => item.id === route.lineId);
  need(line && line.page === route.page, 'SOURCE_ROUTE_LINE');
  return line;
}

export function progressKey(manifest) {
  manifestState(manifest);
  return `glp001.sikh-source-place.v1:${manifest.collectionId}:${manifest.editionId}`;
}
export function progressUnit(record, manifest) {
  const state = manifestState(manifest);
  keys(record, PROGRESS_KEYS, 'SOURCE_PROGRESS_SCHEMA');
  need(record.schema === 'glp.sikh-reader.progress.v1' && record.collectionId === manifest.collectionId
    && record.editionId === manifest.editionId && identifier(record.unitId) && identifier(record.lineId)
    && typeof record.unitSha256 === 'string' && HASH.test(record.unitSha256), 'SOURCE_PROGRESS_BINDING');
  const descriptor = state.byUnit.get(record.unitId);
  need(descriptor && descriptor.sha256 === record.unitSha256 && integer(record.page, manifest.counts.pages)
    && descriptor.pages.includes(record.page), 'SOURCE_PROGRESS_BINDING');
  need(typeof record.updatedAt === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(record.updatedAt)
    && Number.isFinite(Date.parse(record.updatedAt)) && new Date(record.updatedAt).toISOString() === record.updatedAt, 'SOURCE_PROGRESS_DATE');
  return descriptor;
}
export function validateProgress(record, manifest, unit) {
  const descriptor = progressUnit(record, manifest);
  need(verifiedUnit(manifest, unit) === descriptor, 'SOURCE_PROGRESS_UNIT');
  const line = unit.lines.find(item => item.id === record.lineId);
  need(line && line.page === record.page, 'SOURCE_PROGRESS_LINE');
  return Object.freeze({...record});
}
export function makeProgress(manifest, unit, line, nowISO) {
  const descriptor = verifiedUnit(manifest, unit);
  need(line && unit.lines.some(item => item === line), 'SOURCE_PROGRESS_LINE');
  return validateProgress({schema: 'glp.sikh-reader.progress.v1', collectionId: manifest.collectionId,
    editionId: manifest.editionId, unitId: unit.id, unitSha256: descriptor.sha256,
    lineId: line.id, page: line.page, updatedAt: nowISO}, manifest, unit);
}
