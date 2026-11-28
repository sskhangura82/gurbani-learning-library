import {BANI_COLLECTION_ID, BANI_EDITION_ID, BANI_ORDER_VERSION, BANI_SOURCES, BANI_SELECTIONS} from './read-along-bani-lock.mjs';

const SHA = /^[a-f0-9]{64}$/;
const fail = code => { throw new Error(code); };
const need = (value, code) => { if (!value) fail(code); };
const freeze = value => {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
};

function requireCrypto() {
  need(typeof globalThis.crypto?.subtle?.digest === 'function', 'BANI_CRYPTO_UNAVAILABLE');
}
async function sha256(bytes) {
  requireCrypto();
  const result = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(result), byte => byte.toString(16).padStart(2, '0')).join('');
}

// Property order here is part of the selection receipt. It binds the adapter's
// ordering contract and every constituent file, before any source is fetched.
function selectionIdentity(id, selection) {
  return JSON.stringify({schema: 'glp.read-along-bani-selection.v1',
    collectionId: BANI_COLLECTION_ID, editionId: BANI_EDITION_ID,
    selectionId: 'bani:' + id, orderVersion: BANI_ORDER_VERSION,
    sources: selection.parts.map(part => {
      const source = BANI_SOURCES[part];
      return {id: source.id, format: source.format, path: source.path,
        bytes: source.bytes, sha256: source.sha256, lineCount: source.lineCount,
        unitCount: source.unitCount, sourceEdition: source.sourceEdition};
    })});
}

function parseSource(bytes, source) {
  let text;
  try { text = new TextDecoder('utf-8', {fatal: true}).decode(bytes); }
  catch { fail('BANI_SOURCE_ENCODING'); }
  if (source.format !== 'nitnem') {
    const prefix = source.format === 'japji'
      ? '/* Source: Shabad OS via Open Granth; original Gurmukhi only. */\nwindow.GLP_FULL_JAPJI = '
      : '/* Original Gurmukhi: immutable source layer. Meanings are stored separately. */\nwindow.GLP_SUKHMANI = ';
    need(text.startsWith(prefix) && text.endsWith(';\n'), 'BANI_SOURCE_WRAPPER');
    text = text.slice(prefix.length, -2);
  }
  let data;
  try { data = JSON.parse(text); } catch { fail('BANI_SOURCE_JSON'); }
  need(data && typeof data === 'object' && !Array.isArray(data), 'BANI_SOURCE_SHAPE');
  if (source.format === 'japji') need(data.release === source.sourceEdition, 'BANI_SOURCE_EDITION');
  else {
    need(data.compositionId === source.id, 'BANI_SOURCE_EDITION');
    need((source.format === 'sukhmani' ? data.schema : data.editionId) === source.sourceEdition, 'BANI_SOURCE_EDITION');
  }
  return data;
}

function originalRows(data, source) {
  const units = source.format === 'sukhmani' ? data.ashtpadis : data.units;
  need(Array.isArray(units) && units.length === source.unitCount, 'BANI_SOURCE_UNITS');
  const rows = [], unitIds = new Set();
  function add(row, unit, kind) {
    const text = source.format === 'sukhmani' ? row?.gurmukhi : row?.text;
    need(typeof text === 'string' && text.length > 0 && typeof row.sha256 === 'string'
      && SHA.test(row.sha256), 'BANI_SOURCE_ROW');
    const reported = source.format === 'nitnem' ? row.location : row;
    const page = Number.isSafeInteger(reported?.ang) && reported.ang > 0 ? reported.ang : null;
    const end = page !== null && Number.isSafeInteger(reported?.angEnd) && reported.angEnd >= page
      ? reported.angEnd : page;
    const unitTitle = unit.title.startsWith(source.title) ? unit.title : source.title + ' · ' + unit.title;
    rows.push({id: source.id + '-l' + String(rows.length + 1).padStart(4, '0'), text,
      page, unitId: source.id, sourceUnitId: unit.id, kind, sha256: row.sha256,
      label: unitTitle + (page === null ? '' : ' · Ang ' + page + (end === page ? '' : '–' + end))});
  }
  for (const [index, unit] of units.entries()) {
    need(unit && typeof unit.id === 'string' && unit.id.length > 0 && !unitIds.has(unit.id)
      && typeof unit.title === 'string' && Array.isArray(unit.lines), 'BANI_SOURCE_UNIT');
    unitIds.add(unit.id);
    if (source.format !== 'nitnem') {
      for (const line of unit.lines) add(line, unit, line.kind === 'heading' ? 'heading' : 'line');
      continue;
    }
    const headings = unit.metricalHeadings ?? [];
    need(Array.isArray(headings), 'BANI_SOURCE_HEADINGS');
    if (index === 0) {
      need(Array.isArray(data.preface), 'BANI_SOURCE_PREFACE');
      for (const heading of data.preface) add(heading, unit, 'heading');
    }
    if (unit.sourceDisplayOrder !== undefined) {
      need(Array.isArray(unit.sourceDisplayOrder), 'BANI_SOURCE_ORDER');
      const byId = new Map(), seen = new Set();
      for (const line of unit.lines) {
        need(line && typeof line.id === 'string' && !byId.has(line.id), 'BANI_SOURCE_ORDER');
        byId.set(line.id, line);
      }
      for (const item of unit.sourceDisplayOrder) {
        let row, key, kind;
        if (item?.kind === 'line') { row = byId.get(item.id); key = 'line:' + item.id; kind = 'line'; }
        else if (item?.kind === 'metricalHeading' && Number.isSafeInteger(item.index)
          && item.index >= 0 && item.index < headings.length) {
          row = headings[item.index]; key = 'heading:' + item.index; kind = 'heading';
        } else fail('BANI_SOURCE_ORDER');
        need(row && !seen.has(key), 'BANI_SOURCE_ORDER');
        seen.add(key); add(row, unit, kind);
      }
      need(seen.size === unit.lines.length + headings.length, 'BANI_SOURCE_ORDER');
    } else {
      for (const heading of headings) add(heading, unit, 'heading');
      for (const line of unit.lines) add(line, unit, 'line');
    }
  }
  need(rows.length === source.lineCount && rows.length <= 2048, 'BANI_SOURCE_LINE_COUNT');
  return rows;
}

export function createBaniReadAlongSource({fetcher = globalThis.fetch, baseURL = import.meta.url} = {}) {
  const states = new Map();
  async function bounded(source) {
    need(typeof fetcher === 'function', 'BANI_SOURCE_FETCH');
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetcher(new URL(source.path, baseURL), {
        credentials: 'omit', cache: 'no-store', redirect: 'error', signal: controller.signal});
      need(response.ok && !response.redirected, 'BANI_SOURCE_UNAVAILABLE');
      const length = response.headers.get('content-length'), encoding = response.headers.get('content-encoding');
      if ((!encoding || encoding === 'identity') && length !== null) {
        need(/^\d+$/.test(length) && Number(length) === source.bytes, 'BANI_SOURCE_LENGTH');
      }
      const reader = response.body?.getReader();
      need(reader, 'BANI_SOURCE_STREAM');
      const bytes = new Uint8Array(source.bytes); let offset = 0;
      try {
        while (true) {
          const {done, value} = await reader.read(); if (done) break;
          need(value instanceof Uint8Array && offset + value.length <= bytes.length, 'BANI_SOURCE_LENGTH');
          bytes.set(value, offset); offset += value.length;
        }
      } catch (error) { await reader.cancel().catch(() => {}); throw error; }
      finally { reader.releaseLock(); }
      need(offset === bytes.length, 'BANI_SOURCE_LENGTH');
      return bytes;
    } finally { clearTimeout(timer); }
  }
  async function sourceRows(id) {
    if (states.has(id)) return states.get(id);
    const source = BANI_SOURCES[id];
    const request = (async () => {
      const bytes = await bounded(source);
      need(await sha256(bytes) === source.sha256, 'BANI_SOURCE_DIGEST');
      const rows = originalRows(parseSource(bytes, source), source);
      // A whole-file receipt authenticates the input; each row receipt also
      // checks that selecting the display order preserved its entire string.
      for (let offset = 0; offset < rows.length; offset += 64) {
        await Promise.all(rows.slice(offset, offset + 64).map(async row => {
          need(await sha256(new TextEncoder().encode(row.text)) === row.sha256, 'BANI_SOURCE_ROW_DIGEST');
        }));
      }
      return freeze(rows);
    })();
    states.set(id, request);
    try { return await request; }
    catch (error) { if (states.get(id) === request) states.delete(id); throw error; }
  }
  return Object.freeze({
    async reading(id) {
      requireCrypto();
      need(typeof id === 'string' && Object.hasOwn(BANI_SELECTIONS, id), 'BANI_SELECTION');
      const selection = BANI_SELECTIONS[id];
      need(await sha256(new TextEncoder().encode(selectionIdentity(id, selection)))
        === selection.manifestSha256, 'BANI_SELECTION_DIGEST');
      const parts = await Promise.all(selection.parts.map(part => sourceRows(part)));
      const lines = parts.flat();
      need(lines.length === selection.lineCount && lines.length <= 2048
        && new Set(lines.map(line => line.id)).size === lines.length
        && selection.parts.length <= 8, 'BANI_SELECTION_LINES');
      return freeze({title: selection.title, titlePunjabi: selection.titlePunjabi,
        locator: 'Source unit / reported Ang',
        binding: {collectionId: BANI_COLLECTION_ID, editionId: BANI_EDITION_ID,
          manifestSha256: selection.manifestSha256, selectionId: 'bani:' + id,
          units: selection.parts.map(part => ({id: part, sha256: BANI_SOURCES[part].sha256}))},
        sourceEditions: selection.parts.map(part => ({id: part, title: BANI_SOURCES[part].title,
          editionId: BANI_SOURCES[part].sourceEdition, sha256: BANI_SOURCES[part].sha256,
          readerPath: BANI_SOURCES[part].readerPath})), lines});
    }
  });
}
