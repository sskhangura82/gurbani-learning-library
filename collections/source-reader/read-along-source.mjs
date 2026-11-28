import {SOURCES} from './source-lock.mjs';
import {verifyManifest, verifyChunk, unitsForPage, verifiedSourceIdentity} from './core.mjs';

const freeze = value => {
  if (value && typeof value === 'object') { for (const child of Object.values(value)) freeze(child); Object.freeze(value); }
  return value;
};

export function createReadAlongSource({fetcher = globalThis.fetch, baseURL = import.meta.url} = {}) {
  const states = new Map();
  async function bounded(url, expectedBytes) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetcher(url, {credentials: 'omit', cache: 'no-store', redirect: 'error', signal: controller.signal});
      if (!response.ok || response.redirected) throw Error('SOURCE_UNAVAILABLE');
      const length = response.headers.get('content-length'), encoding = response.headers.get('content-encoding');
      if ((!encoding || encoding === 'identity') && length !== null
        && (!/^\d+$/.test(length) || Number(length) !== expectedBytes)) throw Error('SOURCE_LENGTH');
      const reader = response.body?.getReader(); if (!reader) throw Error('SOURCE_STREAM');
      const bytes = new Uint8Array(expectedBytes); let offset = 0;
      try {
        while (true) {
          const {done, value} = await reader.read(); if (done) break;
          if (offset + value.length > bytes.length) throw Error('SOURCE_LENGTH');
          bytes.set(value, offset); offset += value.length;
        }
      } catch (error) { await reader.cancel().catch(() => {}); throw error; }
      finally { reader.releaseLock(); }
      if (offset !== bytes.length) throw Error('SOURCE_LENGTH');
      return bytes;
    } finally { clearTimeout(timer); }
  }
  async function state(collectionId) {
    if (!Object.hasOwn(SOURCES, collectionId)) throw Error('SOURCE_COLLECTION');
    if (states.has(collectionId)) return states.get(collectionId);
    const lock = SOURCES[collectionId];
    const request = bounded(new URL(lock.path, baseURL), lock.bytes)
      .then(bytes => verifyManifest(bytes, lock)).then(manifest => ({manifest, lock, chunks: new Map()}));
    states.set(collectionId, request);
    try { return await request; }
    catch (error) { if (states.get(collectionId) === request) states.delete(collectionId); throw error; }
  }
  async function unitFor(current, descriptor) {
    const {manifest, lock, chunks} = current;
    if (!chunks.has(descriptor.chunkId)) {
      const info = manifest.chunks.find(value => value.id === descriptor.chunkId);
      const promise = bounded(new URL(info.path, new URL(lock.path, baseURL)), info.bytes)
        .then(bytes => verifyChunk(bytes, info, manifest));
      chunks.set(info.id, promise);
      promise.catch(() => { if (chunks.get(info.id) === promise) chunks.delete(info.id); });
    }
    const chunk = await chunks.get(descriptor.chunkId);
    while (chunks.size > 4) chunks.delete(chunks.keys().next().value);
    const unit = chunk.units.find(value => value.id === descriptor.id);
    if (!unit) throw Error('SOURCE_GROUP');
    return unit;
  }
  function reading(current, units, selectionId, title) {
    if (!units.length || units.length > 100) throw Error('SOURCE_SELECTION');
    const identities = units.map(unit => verifiedSourceIdentity(current.manifest, unit));
    const first = identities[0];
    const lines = units.flatMap(unit => unit.lines.map(line => ({
      id: line.id, text: line.text, page: line.page, unitId: unit.id,
      label: `${current.lock.locator} ${line.page}`
    })));
    if (!lines.length || lines.length > 2048 || new Set(lines.map(line => line.id)).size !== lines.length) throw Error('SOURCE_SELECTION');
    return freeze({title, locator: current.lock.locator,
      binding: {collectionId: first.collectionId, editionId: first.editionId,
        manifestSha256: first.manifestSha256, selectionId,
        units: identities.map(identity => ({id: identity.unitId, sha256: identity.unitSha256}))}, lines});
  }
  function groupTitle(current, descriptor) {
    const name = current.manifest.sections.find(section => section.id === descriptor.sectionId).name.Latn;
    const first = descriptor.pages[0], last = descriptor.pages.at(-1);
    return `${name} · ${current.lock.locator} ${first}${first === last ? '' : '–' + last}`;
  }
  return Object.freeze({
    async japji() {
      const current = await state('sggs');
      const descriptors = current.manifest.units.filter(unit => unit.sectionId === '1DSA');
      if (descriptors.length !== 39 || descriptors.reduce((sum, unit) => sum + unit.lineCount, 0) !== 385
        || descriptors[0].id !== 'DMP' || descriptors.at(-1).id !== 'BB8') throw Error('SOURCE_JAPJI_SELECTION');
      const units = await Promise.all(descriptors.map(descriptor => unitFor(current, descriptor)));
      return reading(current, units, 'section:1DSA', 'Japji Sahib');
    },
    async browsePage(collectionId, page) {
      const current = await state(collectionId), descriptors = unitsForPage(current.manifest, page);
      const units = await Promise.all(descriptors.map(descriptor => unitFor(current, descriptor)));
      return freeze(units.map((unit, index) => ({id: unit.id, firstLine: unit.lines[0].text,
        lineCount: unit.lines.length, pages: [...descriptors[index].pages], title: groupTitle(current, descriptors[index])})));
    },
    async group(collectionId, page, unitId) {
      const current = await state(collectionId);
      const descriptor = unitsForPage(current.manifest, page).find(unit => unit.id === unitId);
      if (!descriptor) throw Error('SOURCE_GROUP');
      return reading(current, [await unitFor(current, descriptor)], 'unit:' + unitId, groupTitle(current, descriptor));
    }
  });
}
