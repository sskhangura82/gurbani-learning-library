// collections/source-reader/source-lock.mjs
var SOURCES = Object.freeze({
  sggs: Object.freeze({
    collectionId: "sggs",
    editionId: "shabados-5.0.0-next.0-SGGS-SSA2",
    path: "../source-data/sggs/manifest.json",
    bytes: 1116397,
    sha256: "04da157b5e7ba85ce0fe35aae983baba3284bc75990be374e556ab3c52da5def",
    title: "Sri Guru Granth Sahib Ji",
    locator: "Ang"
  }),
  dasam: Object.freeze({
    collectionId: "dasam",
    editionId: "shabados-5.0.0-next.0-SDGR-DGDG",
    path: "../source-data/dasam/manifest.json",
    bytes: 1101376,
    sha256: "2ba6005655429eeb07b4477d4bf9a18b4f62e86224107d72793ec5f2bd441ad6",
    title: "Sri Dasam Granth",
    locator: "Page"
  })
});

// collections/source-reader/core.mjs
var encoder = new TextEncoder();
var decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
var manifests = /* @__PURE__ */ new WeakMap();
var units = /* @__PURE__ */ new WeakMap();
var MANIFEST_LIMIT = 4 * 1024 * 1024;
var CHUNK_LIMIT = 128 * 1024;
var HASH = /^[a-f0-9]{64}$/;
var ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
var EDITIONS = Object.freeze({ sggs: ["SGGS", "SSA2"], dasam: ["SDGR", "DGDG"] });
var PROGRESS_KEYS = ["schema", "collectionId", "editionId", "unitId", "unitSha256", "lineId", "page", "updatedAt"];
function need(condition, code) {
  if (!condition) {
    const error = new Error(code);
    error.code = code;
    throw error;
  }
}
function keys(value, expected, code = "SOURCE_SCHEMA") {
  need(value !== null && typeof value === "object" && !Array.isArray(value), code);
  const actual = Object.keys(value);
  need(actual.length === expected.length && actual.every((key) => expected.includes(key)), code);
}
function integer(value, max = 1e6) {
  return Number.isSafeInteger(value) && value > 0 && value <= max;
}
function identifier(value) {
  return typeof value === "string" && ID.test(value);
}
function text(value, limit = 4096) {
  if (typeof value !== "string" || value.length === 0 || encoder.encode(value).byteLength > limit) return false;
  for (const character of value) {
    const code = character.codePointAt(0);
    if (code >= 55296 && code <= 57343) return false;
  }
  return true;
}
function metadataName(value, names) {
  keys(value, names);
  need(names.every((key) => text(value[key])), "SOURCE_NAME");
}
function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}
function freeze(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function inputBytes(input, limit) {
  need(input instanceof Uint8Array || input instanceof ArrayBuffer, "SOURCE_BYTES");
  const raw = input instanceof ArrayBuffer ? new Uint8Array(input.slice(0)) : new Uint8Array(input);
  need(raw.byteLength > 0 && raw.byteLength <= limit, "SOURCE_SIZE");
  return raw;
}
async function sha256(raw) {
  need(globalThis.crypto?.subtle, "SOURCE_CRYPTO");
  return Array.from(new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", raw)), (value) => value.toString(16).padStart(2, "0")).join("");
}
function parse(raw) {
  let value, decoded;
  try {
    decoded = decoder.decode(raw);
    value = JSON.parse(decoded);
  } catch {
    need(false, "SOURCE_JSON");
  }
  let canonical;
  try {
    canonical = JSON.stringify(value) + "\n";
  } catch {
    need(false, "SOURCE_JSON");
  }
  need(decoded === canonical, "SOURCE_CANONICAL_JSON");
  return value;
}
function manifestState(manifest) {
  const state = manifests.get(manifest);
  need(state, "SOURCE_UNVERIFIED_MANIFEST");
  return state;
}
function verifiedUnit(manifest, unit) {
  manifestState(manifest);
  const state = units.get(unit);
  need(state?.manifest === manifest, "SOURCE_UNVERIFIED_UNIT");
  return state.descriptor;
}
async function verifyManifest(input, binding) {
  need(binding && typeof binding === "object" && Object.hasOwn(EDITIONS, binding.collectionId) && typeof binding.editionId === "string" && HASH.test(binding.sha256) && integer(binding.bytes, MANIFEST_LIMIT), "SOURCE_BINDING");
  const raw = inputBytes(input, MANIFEST_LIMIT);
  need(raw.byteLength === binding.bytes, "SOURCE_MANIFEST_SIZE");
  const manifestSha256 = await sha256(raw);
  need(manifestSha256 === binding.sha256, "SOURCE_MANIFEST_DIGEST");
  const manifest = parse(raw);
  keys(manifest, ["schema", "status", "locatorStatus", "collectionId", "editionId", "name", "source", "counts", "sections", "authors", "units", "chunks"]);
  need(manifest.schema === "glp.sikh-reader.manifest.v1" && manifest.status === "NAMED_DIGITAL_EDITION_ORIGINAL_ONLY" && manifest.locatorStatus === "SOURCE_REPORTED" && manifest.collectionId === binding.collectionId && manifest.editionId === binding.editionId, "SOURCE_IDENTITY");
  metadataName(manifest.name, ["Latn", "Guru"]);
  const source2 = manifest.source;
  keys(source2, ["packageName", "packageVersion", "reportedGitHead", "archiveSha256", "databaseSha256", "noticeSha256", "sourceId", "assetId"]);
  const pair = EDITIONS[manifest.collectionId];
  need(source2.packageName === "@shabados/database" && typeof source2.packageVersion === "string" && /^[0-9]+\.[0-9]+\.[0-9]+(?:-[A-Za-z0-9.-]+)?$/.test(source2.packageVersion) && typeof source2.reportedGitHead === "string" && /^[a-f0-9]{40}$/.test(source2.reportedGitHead) && [source2.archiveSha256, source2.databaseSha256, source2.noticeSha256].every((value) => typeof value === "string" && HASH.test(value)) && source2.sourceId === pair[0] && source2.assetId === pair[1] && manifest.editionId === `shabados-${source2.packageVersion}-${source2.sourceId}-${source2.assetId}`, "SOURCE_PROVENANCE");
  keys(manifest.counts, ["units", "lines", "pages"]);
  need(Object.values(manifest.counts).every((value) => integer(value)), "SOURCE_COUNTS");
  need(Array.isArray(manifest.sections) && manifest.sections.length > 0 && Array.isArray(manifest.authors) && manifest.authors.length > 0 && Array.isArray(manifest.units) && manifest.units.length === manifest.counts.units && Array.isArray(manifest.chunks) && manifest.chunks.length > 0, "SOURCE_COUNTS");
  const sections = /* @__PURE__ */ new Map(), authors = /* @__PURE__ */ new Map(), byUnit = /* @__PURE__ */ new Map(), byChunk = /* @__PURE__ */ new Map(), byPage = /* @__PURE__ */ new Map();
  for (const [index, section] of manifest.sections.entries()) {
    keys(section, ["id", "order", "name"]);
    need(identifier(section.id) && section.order === index + 1 && !sections.has(section.id), "SOURCE_SECTION");
    metadataName(section.name, ["Latn"]);
    sections.set(section.id, section);
  }
  for (const author of manifest.authors) {
    keys(author, ["id", "name"]);
    need(identifier(author.id) && !authors.has(author.id), "SOURCE_AUTHOR");
    metadataName(author.name, ["Guru", "Latn"]);
    authors.set(author.id, author);
  }
  let lineCount = 0, previousSection = 0, sectionOrder = 0;
  for (const descriptor of manifest.units) {
    keys(descriptor, ["id", "sectionId", "sectionOrder", "authorId", "lineCount", "pages", "sha256", "chunkId"]);
    const section = sections.get(descriptor.sectionId);
    need(identifier(descriptor.id) && !byUnit.has(descriptor.id) && section && authors.has(descriptor.authorId) && integer(descriptor.lineCount) && typeof descriptor.sha256 === "string" && HASH.test(descriptor.sha256) && typeof descriptor.chunkId === "string" && /^c[0-9]{4}$/.test(descriptor.chunkId), "SOURCE_UNIT_DESCRIPTOR");
    if (section.order !== previousSection) {
      need(section.order === previousSection + 1, "SOURCE_UNIT_ORDER");
      previousSection = section.order;
      sectionOrder = 0;
    }
    need(descriptor.sectionOrder === ++sectionOrder, "SOURCE_UNIT_ORDER");
    need(Array.isArray(descriptor.pages) && descriptor.pages.length > 0 && descriptor.pages.length <= descriptor.lineCount, "SOURCE_UNIT_PAGES");
    let previousPage = 0;
    for (const page of descriptor.pages) {
      need(integer(page, manifest.counts.pages) && page > previousPage, "SOURCE_UNIT_PAGES");
      previousPage = page;
      if (!byPage.has(page)) byPage.set(page, []);
      byPage.get(page).push(descriptor);
    }
    lineCount += descriptor.lineCount;
    byUnit.set(descriptor.id, descriptor);
  }
  need(lineCount === manifest.counts.lines && previousSection === manifest.sections.length && byPage.size === manifest.counts.pages, "SOURCE_COVERAGE");
  for (let page = 1; page <= manifest.counts.pages; page++) need(byPage.has(page), "SOURCE_COVERAGE");
  let unitIndex = 0;
  for (const [index, descriptor] of manifest.chunks.entries()) {
    keys(descriptor, ["id", "path", "bytes", "sha256", "unitIds"]);
    need(descriptor.id === `c${String(index + 1).padStart(4, "0")}` && descriptor.path === `chunks/${descriptor.id}.json` && integer(descriptor.bytes, CHUNK_LIMIT) && typeof descriptor.sha256 === "string" && HASH.test(descriptor.sha256) && Array.isArray(descriptor.unitIds) && descriptor.unitIds.length > 0, "SOURCE_CHUNK_DESCRIPTOR");
    for (const id of descriptor.unitIds) {
      const unit = manifest.units[unitIndex++];
      need(unit && unit.id === id && unit.chunkId === descriptor.id, "SOURCE_CHUNK_COVERAGE");
    }
    byChunk.set(descriptor.id, descriptor);
  }
  need(unitIndex === manifest.units.length, "SOURCE_CHUNK_COVERAGE");
  for (const list of byPage.values()) Object.freeze(list);
  freeze(manifest);
  manifests.set(manifest, { byUnit, byChunk, byPage, lineOwners: /* @__PURE__ */ new Map(), manifestSha256 });
  return manifest;
}
async function verifyChunk(input, descriptor, manifest) {
  const state = manifestState(manifest);
  need(descriptor && state.byChunk.get(descriptor.id) === descriptor, "SOURCE_UNVERIFIED_DESCRIPTOR");
  const raw = inputBytes(input, CHUNK_LIMIT);
  need(raw.byteLength === descriptor.bytes, "SOURCE_CHUNK_SIZE");
  need(await sha256(raw) === descriptor.sha256, "SOURCE_CHUNK_DIGEST");
  const chunk = parse(raw);
  keys(chunk, ["schema", "collectionId", "editionId", "id", "units"]);
  need(chunk.schema === "glp.sikh-reader.chunk.v1" && chunk.collectionId === manifest.collectionId && chunk.editionId === manifest.editionId && chunk.id === descriptor.id, "SOURCE_CHUNK_IDENTITY");
  need(Array.isArray(chunk.units) && chunk.units.length === descriptor.unitIds.length, "SOURCE_CHUNK_COVERAGE");
  const lineOwners = /* @__PURE__ */ new Map(), digests = [];
  for (const [index, unit] of chunk.units.entries()) {
    keys(unit, ["id", "sectionId", "sectionOrder", "authorId", "lines"]);
    const expected = state.byUnit.get(descriptor.unitIds[index]);
    need(unit.id === expected.id && unit.sectionId === expected.sectionId && unit.sectionOrder === expected.sectionOrder && unit.authorId === expected.authorId, "SOURCE_UNIT_BINDING");
    need(Array.isArray(unit.lines) && unit.lines.length === expected.lineCount, "SOURCE_COMPLETE_UNIT");
    const pages = /* @__PURE__ */ new Set();
    for (const [lineIndex, line] of unit.lines.entries()) {
      keys(line, ["id", "order", "page", "printedLine", "text"]);
      need(identifier(line.id) && !lineOwners.has(line.id) && line.order === lineIndex + 1 && integer(line.page, manifest.counts.pages) && expected.pages.includes(line.page) && (line.printedLine === null || integer(line.printedLine)) && text(line.text, 65536), "SOURCE_LINE");
      lineOwners.set(line.id, unit.id);
      pages.add(line.page);
    }
    need(same([...pages].sort((a, b) => a - b), expected.pages), "SOURCE_UNIT_PAGES");
    digests.push([encoder.encode(JSON.stringify(unit)), expected.sha256]);
  }
  await Promise.all(digests.map(async ([rawUnit, expected]) => need(await sha256(rawUnit) === expected, "SOURCE_UNIT_DIGEST")));
  for (const [id, owner] of lineOwners) need(!state.lineOwners.has(id) || state.lineOwners.get(id) === owner, "SOURCE_DUPLICATE_LINE");
  freeze(chunk);
  for (const unit of chunk.units) units.set(unit, { manifest, descriptor: state.byUnit.get(unit.id) });
  for (const [id, owner] of lineOwners) state.lineOwners.set(id, owner);
  return chunk;
}
function unitsForPage(manifest, page) {
  const state = manifestState(manifest);
  need(integer(page, manifest.counts.pages) && state.byPage.has(page), "SOURCE_ROUTE_PAGE");
  return state.byPage.get(page);
}
function routeShape(route) {
  need(route && typeof route === "object" && !Array.isArray(route) && Object.hasOwn(route, "page") && Object.keys(route).every((key) => ["page", "unitId", "lineId"].includes(key)), "SOURCE_ROUTE");
  const unitId = route.unitId ?? null, lineId = route.lineId ?? null;
  need(integer(route.page) && (unitId === null || identifier(unitId)) && (lineId === null || identifier(lineId)) && (lineId === null || unitId !== null), "SOURCE_ROUTE");
  return { page: route.page, unitId, lineId };
}
function checkedRoute(manifest, value) {
  const state = manifestState(manifest), route = routeShape(value);
  unitsForPage(manifest, route.page);
  if (route.unitId !== null) need(state.byUnit.get(route.unitId)?.pages.includes(route.page), "SOURCE_ROUTE_UNIT");
  return Object.freeze(route);
}
function parseRoute(search, manifest) {
  manifestState(manifest);
  need(typeof search === "string" && search.length <= 512 && !search.includes("#"), "SOURCE_ROUTE");
  if (search === "" || search === "?") return checkedRoute(manifest, { page: 1 });
  need(search.startsWith("?") && !/%(?![0-9a-fA-F]{2})/.test(search), "SOURCE_ROUTE");
  try {
    decodeURIComponent(search);
  } catch {
    need(false, "SOURCE_ROUTE");
  }
  need(search.slice(1).split("&").every((part) => part.length > 0 && part.includes("=")), "SOURCE_ROUTE");
  const params = new URLSearchParams(search), seen = /* @__PURE__ */ new Set();
  for (const [key] of params) {
    need(["page", "unit", "line"].includes(key) && !seen.has(key), "SOURCE_ROUTE");
    seen.add(key);
  }
  need(params.has("page") && /^[1-9][0-9]{0,5}$/.test(params.get("page")), "SOURCE_ROUTE_PAGE");
  return checkedRoute(manifest, { page: Number(params.get("page")), unitId: params.get("unit"), lineId: params.get("line") });
}
function formatRoute(value) {
  const route = routeShape(value), params = new URLSearchParams({ page: String(route.page) });
  if (route.unitId !== null) params.set("unit", route.unitId);
  if (route.lineId !== null) params.set("line", route.lineId);
  return `?${params}`;
}
function lineForRoute(manifest, value, unit) {
  const route = checkedRoute(manifest, value);
  if (route.unitId === null) return null;
  const descriptor = verifiedUnit(manifest, unit);
  need(descriptor.id === route.unitId, "SOURCE_ROUTE_UNIT");
  if (route.lineId === null) return null;
  const line = unit.lines.find((item) => item.id === route.lineId);
  need(line && line.page === route.page, "SOURCE_ROUTE_LINE");
  return line;
}
function verifiedSourceIdentity(manifest, unit) {
  const state = manifestState(manifest), descriptor = verifiedUnit(manifest, unit);
  return Object.freeze({
    collectionId: manifest.collectionId,
    editionId: manifest.editionId,
    manifestSha256: state.manifestSha256,
    unitId: descriptor.id,
    unitSha256: descriptor.sha256
  });
}
function progressKey(manifest) {
  manifestState(manifest);
  return `glp001.sikh-source-place.v1:${manifest.collectionId}:${manifest.editionId}`;
}
function progressUnit(record, manifest) {
  const state = manifestState(manifest);
  keys(record, PROGRESS_KEYS, "SOURCE_PROGRESS_SCHEMA");
  need(record.schema === "glp.sikh-reader.progress.v1" && record.collectionId === manifest.collectionId && record.editionId === manifest.editionId && identifier(record.unitId) && identifier(record.lineId) && typeof record.unitSha256 === "string" && HASH.test(record.unitSha256), "SOURCE_PROGRESS_BINDING");
  const descriptor = state.byUnit.get(record.unitId);
  need(descriptor && descriptor.sha256 === record.unitSha256 && integer(record.page, manifest.counts.pages) && descriptor.pages.includes(record.page), "SOURCE_PROGRESS_BINDING");
  need(typeof record.updatedAt === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(record.updatedAt) && Number.isFinite(Date.parse(record.updatedAt)) && new Date(record.updatedAt).toISOString() === record.updatedAt, "SOURCE_PROGRESS_DATE");
  return descriptor;
}
function validateProgress(record, manifest, unit) {
  const descriptor = progressUnit(record, manifest);
  need(verifiedUnit(manifest, unit) === descriptor, "SOURCE_PROGRESS_UNIT");
  const line = unit.lines.find((item) => item.id === record.lineId);
  need(line && line.page === record.page, "SOURCE_PROGRESS_LINE");
  return Object.freeze({ ...record });
}
function makeProgress(manifest, unit, line, nowISO) {
  const descriptor = verifiedUnit(manifest, unit);
  need(line && unit.lines.some((item) => item === line), "SOURCE_PROGRESS_LINE");
  return validateProgress({
    schema: "glp.sikh-reader.progress.v1",
    collectionId: manifest.collectionId,
    editionId: manifest.editionId,
    unitId: unit.id,
    unitSha256: descriptor.sha256,
    lineId: line.id,
    page: line.page,
    updatedAt: nowISO
  }, manifest, unit);
}

// collections/source-reader/read-along-source.mjs
var freeze2 = (value) => {
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) freeze2(child);
    Object.freeze(value);
  }
  return value;
};
function createReadAlongSource({ fetcher = globalThis.fetch, baseURL = import.meta.url } = {}) {
  const states = /* @__PURE__ */ new Map();
  async function bounded(url, expectedBytes) {
    const controller2 = new AbortController();
    const timer = setTimeout(() => controller2.abort(), 2e4);
    try {
      const response = await fetcher(url, { credentials: "omit", cache: "no-store", redirect: "error", signal: controller2.signal });
      if (!response.ok || response.redirected) throw Error("SOURCE_UNAVAILABLE");
      const length = response.headers.get("content-length"), encoding = response.headers.get("content-encoding");
      if ((!encoding || encoding === "identity") && length !== null && (!/^\d+$/.test(length) || Number(length) !== expectedBytes)) throw Error("SOURCE_LENGTH");
      const reader = response.body?.getReader();
      if (!reader) throw Error("SOURCE_STREAM");
      const bytes = new Uint8Array(expectedBytes);
      let offset = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (offset + value.length > bytes.length) throw Error("SOURCE_LENGTH");
          bytes.set(value, offset);
          offset += value.length;
        }
      } catch (error) {
        await reader.cancel().catch(() => {
        });
        throw error;
      } finally {
        reader.releaseLock();
      }
      if (offset !== bytes.length) throw Error("SOURCE_LENGTH");
      return bytes;
    } finally {
      clearTimeout(timer);
    }
  }
  async function state(collectionId) {
    if (!Object.hasOwn(SOURCES, collectionId)) throw Error("SOURCE_COLLECTION");
    if (states.has(collectionId)) return states.get(collectionId);
    const lock = SOURCES[collectionId];
    const request = bounded(new URL(lock.path, baseURL), lock.bytes).then((bytes) => verifyManifest(bytes, lock)).then((manifest) => ({ manifest, lock, chunks: /* @__PURE__ */ new Map() }));
    states.set(collectionId, request);
    try {
      return await request;
    } catch (error) {
      if (states.get(collectionId) === request) states.delete(collectionId);
      throw error;
    }
  }
  async function unitFor(current, descriptor) {
    const { manifest, lock, chunks } = current;
    if (!chunks.has(descriptor.chunkId)) {
      const info = manifest.chunks.find((value) => value.id === descriptor.chunkId);
      const promise = bounded(new URL(info.path, new URL(lock.path, baseURL)), info.bytes).then((bytes) => verifyChunk(bytes, info, manifest));
      chunks.set(info.id, promise);
      promise.catch(() => {
        if (chunks.get(info.id) === promise) chunks.delete(info.id);
      });
    }
    const chunk = await chunks.get(descriptor.chunkId);
    while (chunks.size > 4) chunks.delete(chunks.keys().next().value);
    const unit = chunk.units.find((value) => value.id === descriptor.id);
    if (!unit) throw Error("SOURCE_GROUP");
    return unit;
  }
  function reading2(current, units2, selectionId, title) {
    if (!units2.length || units2.length > 100) throw Error("SOURCE_SELECTION");
    const identities = units2.map((unit) => verifiedSourceIdentity(current.manifest, unit));
    const first = identities[0];
    const lines = units2.flatMap((unit) => unit.lines.map((line) => ({
      id: line.id,
      text: line.text,
      page: line.page,
      unitId: unit.id,
      label: `${current.lock.locator} ${line.page}`
    })));
    if (!lines.length || lines.length > 2048 || new Set(lines.map((line) => line.id)).size !== lines.length) throw Error("SOURCE_SELECTION");
    return freeze2({
      title,
      locator: current.lock.locator,
      binding: {
        collectionId: first.collectionId,
        editionId: first.editionId,
        manifestSha256: first.manifestSha256,
        selectionId,
        units: identities.map((identity) => ({ id: identity.unitId, sha256: identity.unitSha256 }))
      },
      lines
    });
  }
  function groupTitle(current, descriptor) {
    const name = current.manifest.sections.find((section) => section.id === descriptor.sectionId).name.Latn;
    const first = descriptor.pages[0], last = descriptor.pages.at(-1);
    return `${name} · ${current.lock.locator} ${first}${first === last ? "" : "–" + last}`;
  }
  return Object.freeze({
    async japji() {
      const current = await state("sggs");
      const descriptors = current.manifest.units.filter((unit) => unit.sectionId === "1DSA");
      if (descriptors.length !== 39 || descriptors.reduce((sum, unit) => sum + unit.lineCount, 0) !== 385 || descriptors[0].id !== "DMP" || descriptors.at(-1).id !== "BB8") throw Error("SOURCE_JAPJI_SELECTION");
      const units2 = await Promise.all(descriptors.map((descriptor) => unitFor(current, descriptor)));
      return reading2(current, units2, "section:1DSA", "Japji Sahib");
    },
    async browsePage(collectionId, page) {
      const current = await state(collectionId), descriptors = unitsForPage(current.manifest, page);
      const units2 = await Promise.all(descriptors.map((descriptor) => unitFor(current, descriptor)));
      return freeze2(units2.map((unit, index) => ({
        id: unit.id,
        firstLine: unit.lines[0].text,
        lineCount: unit.lines.length,
        pages: [...descriptors[index].pages],
        title: groupTitle(current, descriptors[index])
      })));
    },
    async group(collectionId, page, unitId) {
      const current = await state(collectionId);
      const descriptor = unitsForPage(current.manifest, page).find((unit) => unit.id === unitId);
      if (!descriptor) throw Error("SOURCE_GROUP");
      return reading2(current, [await unitFor(current, descriptor)], "unit:" + unitId, groupTitle(current, descriptor));
    }
  });
}

// collections/source-reader/read-along-core.mjs
var MAX_TIMING_BYTES = 262144;
var MAX_CUES = 5e3;
var MAX_TIME_MS = 7 * 24 * 60 * 60 * 1e3;
var SCHEMA = "glp.youtube-read-along.v1";
var VIDEO = /^[A-Za-z0-9_-]{11}$/;
var SHA = /^[a-f0-9]{64}$/;
var ID2 = /^[A-Za-z0-9_-]{1,80}$/;
var fail = (code) => {
  throw new Error(code);
};
var need2 = (value, code) => {
  if (!value) fail(code);
};
var ownKeys = (value, expected) => value && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...expected].sort());
function freeze3(value) {
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) freeze3(child);
    Object.freeze(value);
  }
  return value;
}
function secondsFromLink(value) {
  if (value === null || value === "") return 0;
  let seconds;
  if (/^\d+(?:\.\d{1,3})?$/.test(value)) seconds = Number(value);
  else {
    const match = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+(?:\.\d{1,3})?)s)?$/.exec(value);
    need2(match && match[0], "YOUTUBE_LINK_TIME");
    seconds = Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
  }
  need2(Number.isFinite(seconds) && seconds >= 0 && seconds * 1e3 <= MAX_TIME_MS, "YOUTUBE_LINK_TIME");
  return seconds;
}
function parseYouTubeURL(input) {
  need2(typeof input === "string" && input.length <= 2048 && !/[\u0000-\u001f\u007f]/.test(input), "YOUTUBE_LINK");
  let value = input.trim();
  if (VIDEO.test(value)) return Object.freeze({ videoId: value, startSeconds: 0 });
  if (/^(?:www\.|m\.|music\.)?youtube\.com\//i.test(value) || /^youtu\.be\//i.test(value)) value = "https://" + value;
  let url;
  try {
    url = new URL(value);
  } catch {
    fail("YOUTUBE_LINK");
  }
  need2(url.protocol === "https:" && !url.username && !url.password && !url.port, "YOUTUBE_LINK");
  const host = url.hostname.toLowerCase();
  let videoId;
  if (host === "youtu.be") {
    const match = /^\/([A-Za-z0-9_-]{11})\/?$/.exec(url.pathname);
    videoId = match?.[1];
  } else if (["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"].includes(host)) {
    if (url.pathname === "/watch") {
      need2(url.searchParams.getAll("v").length === 1, "YOUTUBE_LINK");
      videoId = url.searchParams.get("v");
    } else videoId = /^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})\/?$/.exec(url.pathname)?.[1];
  } else if (host === "www.youtube-nocookie.com" || host === "youtube-nocookie.com") {
    videoId = /^\/embed\/([A-Za-z0-9_-]{11})\/?$/.exec(url.pathname)?.[1];
  }
  need2(typeof videoId === "string" && VIDEO.test(videoId), "YOUTUBE_LINK");
  const times = [...url.searchParams.getAll("t"), ...url.searchParams.getAll("start")];
  if (url.hash.startsWith("#t=")) times.push(url.hash.slice(3));
  need2(times.length <= 1, "YOUTUBE_LINK_TIME");
  return Object.freeze({ videoId, startSeconds: secondsFromLink(times[0] ?? null) });
}
function checkedReading(reading2) {
  const binding = reading2?.binding;
  need2(ownKeys(binding, ["collectionId", "editionId", "manifestSha256", "selectionId", "units"]), "TIMING_SOURCE");
  need2(["sggs", "dasam"].includes(binding.collectionId) && typeof binding.editionId === "string" && binding.editionId.length <= 120 && SHA.test(binding.manifestSha256) && /^(?:section|unit):[A-Za-z0-9_-]{1,80}$/.test(binding.selectionId), "TIMING_SOURCE");
  need2(Array.isArray(binding.units) && binding.units.length > 0 && binding.units.length <= 100, "TIMING_SOURCE");
  const units2 = /* @__PURE__ */ new Set();
  for (const unit of binding.units) {
    need2(ownKeys(unit, ["id", "sha256"]) && typeof unit.id === "string" && ID2.test(unit.id) && typeof unit.sha256 === "string" && SHA.test(unit.sha256) && !units2.has(unit.id), "TIMING_SOURCE");
    units2.add(unit.id);
  }
  need2(Array.isArray(reading2.lines) && reading2.lines.length > 0 && reading2.lines.length <= 2048, "TIMING_SOURCE");
  const lines = /* @__PURE__ */ new Set();
  for (const line of reading2.lines) {
    need2(line && typeof line.id === "string" && ID2.test(line.id) && units2.has(line.unitId) && !lines.has(line.id), "TIMING_SOURCE");
    lines.add(line.id);
  }
  return { binding, lines };
}
function sameBinding(actual, expected) {
  if (!ownKeys(actual, ["collectionId", "editionId", "manifestSha256", "selectionId", "units"])) return false;
  if (["collectionId", "editionId", "manifestSha256", "selectionId"].some((key) => actual[key] !== expected[key])) return false;
  return Array.isArray(actual.units) && actual.units.length === expected.units.length && actual.units.every((unit, index) => ownKeys(unit, ["id", "sha256"]) && unit.id === expected.units[index].id && unit.sha256 === expected.units[index].sha256);
}
function emptyTiming(videoId, reading2) {
  need2(VIDEO.test(videoId), "TIMING_VIDEO");
  const { binding } = checkedReading(reading2);
  return freeze3({
    schema: SCHEMA,
    timingStatus: "USER_MARKED",
    videoId,
    source: structuredClone(binding),
    cues: []
  });
}
function validateTiming(input, reading2, videoId) {
  const { binding, lines } = checkedReading(reading2);
  need2(VIDEO.test(videoId), "TIMING_VIDEO");
  let value = input;
  if (typeof input === "string") {
    need2(new TextEncoder().encode(input).length <= MAX_TIMING_BYTES, "TIMING_TOO_LARGE");
    try {
      value = JSON.parse(input);
    } catch {
      fail("TIMING_JSON");
    }
  }
  need2(ownKeys(value, ["schema", "timingStatus", "videoId", "source", "cues"]) && value.schema === SCHEMA && value.timingStatus === "USER_MARKED", "TIMING_SCHEMA");
  need2(value.videoId === videoId, "TIMING_VIDEO");
  need2(sameBinding(value.source, binding), "TIMING_SOURCE_MISMATCH");
  need2(Array.isArray(value.cues) && value.cues.length <= MAX_CUES, "TIMING_CUES");
  let previous = -1;
  for (const cue of value.cues) {
    need2(ownKeys(cue, ["at", "lineId"]) && Number.isSafeInteger(cue.at) && cue.at >= 0 && cue.at <= MAX_TIME_MS && cue.at > previous, "TIMING_ORDER");
    need2(cue.lineId === null || typeof cue.lineId === "string" && lines.has(cue.lineId), "TIMING_LINE");
    previous = cue.at;
  }
  const result = {
    schema: SCHEMA,
    timingStatus: "USER_MARKED",
    videoId,
    source: structuredClone(binding),
    cues: value.cues.map((cue) => ({ at: cue.at, lineId: cue.lineId }))
  };
  need2(new TextEncoder().encode(JSON.stringify(result)).length <= MAX_TIMING_BYTES, "TIMING_TOO_LARGE");
  return freeze3(result);
}
function putCue(map, reading2, atMs, lineId) {
  const checked = validateTiming(map, reading2, map?.videoId);
  need2(Number.isSafeInteger(atMs) && atMs >= 0 && atMs <= MAX_TIME_MS, "TIMING_TIME");
  const cues = checked.cues.filter((cue) => cue.at !== atMs).map((cue) => ({ ...cue }));
  cues.push({ at: atMs, lineId });
  cues.sort((a, b) => a.at - b.at);
  return validateTiming({ ...checked, cues }, reading2, checked.videoId);
}
function lineAt(map, mediaSeconds) {
  if (!Number.isFinite(mediaSeconds) || mediaSeconds < 0 || !Array.isArray(map?.cues) || map.cues.length < 2) return null;
  const time = mediaSeconds * 1e3, cues = map.cues;
  let left = 0, right = cues.length;
  while (left < right) {
    const middle = left + right >>> 1;
    if (cues[middle].at <= time) left = middle + 1;
    else right = middle;
  }
  const index = left - 1;
  return index >= 0 && index < cues.length - 1 && time < cues[index + 1].at ? cues[index].lineId : null;
}
function timingKey(videoId, reading2) {
  need2(VIDEO.test(videoId), "TIMING_VIDEO");
  const { binding } = checkedReading(reading2);
  return `glp001.youtube-timing.v1:${videoId}:${binding.collectionId}:${binding.manifestSha256}:${binding.selectionId}`;
}
function serializeTiming(map) {
  const value = JSON.stringify(map);
  need2(typeof value === "string" && new TextEncoder().encode(value).length <= MAX_TIMING_BYTES, "TIMING_TOO_LARGE");
  return value;
}
function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds), hours = Math.floor(total / 3600), minutes = Math.floor(total % 3600 / 60);
  return (hours ? hours + ":" + String(minutes).padStart(2, "0") : String(minutes)) + ":" + String(total % 60).padStart(2, "0");
}

// collections/source-reader/read-along-config.mjs
var YOUTUBE_DATA_API_KEY = "";

// collections/source-reader/read-along-player.mjs
var VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
var STATES = Object.freeze({ "-1": "unstarted", 0: "ended", 1: "playing", 2: "paused", 3: "buffering", 5: "cued" });
var CHECK_TIMEOUT_MS = 1e4;
var PLAYER_TIMEOUT_MS = 15e3;
var POLL_MS = 250;
var mounts = /* @__PURE__ */ new WeakMap();
var apiPromise = null;
var nextPlayerId = 0;
function problem(code, message) {
  return Object.assign(new Error(message), { code });
}
function cancelled() {
  return problem("YOUTUBE_CANCELLED", "This player request has been closed or replaced.");
}
function validateRequest(videoId, apiKey) {
  if (typeof videoId !== "string" || !VIDEO_ID.test(videoId)) {
    throw problem("YOUTUBE_VIDEO_ID", "Choose a link to one YouTube recording.");
  }
  if (typeof apiKey !== "string" || !apiKey.trim()) {
    throw problem("YOUTUBE_NOT_CONFIGURED", "YouTube playback is not configured for this build. You can open the recording on YouTube.");
  }
  if (apiKey.length > 256 || /\s/.test(apiKey)) {
    throw problem("YOUTUBE_CONFIGURATION", "The YouTube provider configuration is invalid.");
  }
}
function abortable(promise, signal) {
  return new Promise((resolve, reject) => {
    const abort = () => reject(cancelled());
    if (signal.aborted) {
      reject(cancelled());
      return;
    }
    signal.addEventListener("abort", abort, { once: true });
    Promise.resolve(promise).then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
  });
}
async function readVideo(videoId, { apiKey, fetcher }, outerSignal) {
  validateRequest(videoId, apiKey);
  if (typeof fetcher !== "function") throw problem("YOUTUBE_CHECK_FAILED", "The video status check is unavailable in this browser.");
  const abortController = new AbortController();
  let timedOut = false;
  const abort = () => abortController.abort();
  if (outerSignal?.aborted) throw cancelled();
  outerSignal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(() => {
    timedOut = true;
    abortController.abort();
  }, CHECK_TIMEOUT_MS);
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "id,status,snippet");
  url.searchParams.set("id", videoId);
  url.searchParams.set("fields", "items(id,status(embeddable,privacyStatus,madeForKids),snippet(liveBroadcastContent))");
  url.searchParams.set("key", apiKey);
  try {
    const response = await abortable(fetcher(url.href, {
      method: "GET",
      credentials: "omit",
      cache: "no-store",
      redirect: "error",
      referrerPolicy: "strict-origin-when-cross-origin",
      signal: abortController.signal
    }), abortController.signal);
    if (!response?.ok) throw problem("YOUTUBE_CHECK_FAILED", "YouTube could not verify this recording. Check the provider configuration or open it on YouTube.");
    const data = await abortable(response.json(), abortController.signal);
    if (!Array.isArray(data?.items) || data.items.length !== 1 || data.items[0]?.id !== videoId) {
      throw problem("YOUTUBE_VIDEO_UNAVAILABLE", "This recording could not be found or is unavailable for this player.");
    }
    const { status: status2, snippet } = data.items[0];
    if (typeof status2?.madeForKids !== "boolean" || typeof status2?.embeddable !== "boolean" || !["public", "unlisted", "private"].includes(status2?.privacyStatus)) {
      throw problem("YOUTUBE_STATUS_UNKNOWN", "YouTube did not return the required recording status. Playback has not been enabled.");
    }
    if (!status2.embeddable) throw problem("YOUTUBE_EMBED_DISABLED", "The recording owner does not allow embedded playback. Open it on YouTube.");
    if (!["public", "unlisted"].includes(status2.privacyStatus)) {
      throw problem("YOUTUBE_VIDEO_UNAVAILABLE", "This recording is not available for public embedded playback.");
    }
    if (snippet?.liveBroadcastContent !== "none") {
      throw problem("YOUTUBE_LIVE_UNSUPPORTED", "Read along currently supports fixed recordings. A live or unverified timeline cannot be aligned here.");
    }
    return Object.freeze({
      videoId,
      madeForKids: status2.madeForKids,
      embeddable: true,
      privacyStatus: status2.privacyStatus,
      liveBroadcastContent: "none"
    });
  } catch (error) {
    if (timedOut) throw problem("YOUTUBE_CHECK_TIMEOUT", "The YouTube status check timed out. Try connecting again.");
    if (outerSignal?.aborted) throw cancelled();
    if (typeof error?.code === "string" && error.code.startsWith("YOUTUBE_")) throw error;
    throw problem("YOUTUBE_CHECK_FAILED", "The YouTube status check failed. No player has been loaded.");
  } finally {
    clearTimeout(timeout);
    outerSignal?.removeEventListener("abort", abort);
  }
}
async function checkVideo(videoId, { apiKey = YOUTUBE_DATA_API_KEY, fetcher = fetch } = {}) {
  return readVideo(videoId, { apiKey, fetcher });
}
function loadYouTubeApi() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    let settled = false;
    const previousReady = window.onYouTubeIframeAPIReady;
    const youtubeAPIScript = document.createElement("script");
    youtubeAPIScript.src = "https://www.youtube.com/iframe_api";
    youtubeAPIScript.async = true;
    youtubeAPIScript.referrerPolicy = "strict-origin-when-cross-origin";
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      youtubeAPIScript.removeEventListener("error", failed);
      youtubeAPIScript.removeEventListener("load", loaded);
      if (window.onYouTubeIframeAPIReady === ready) window.onYouTubeIframeAPIReady = previousReady;
      if (error) {
        youtubeAPIScript.remove();
        reject(error);
      } else resolve(window.YT);
    };
    const failed = () => finish(problem("YOUTUBE_API_LOAD_FAILED", "The YouTube player could not load. Open the recording on YouTube or try again."));
    const loaded = () => {
      if (typeof window.YT?.Player === "function") finish();
    };
    const ready = () => {
      if (typeof previousReady === "function") {
        try {
          previousReady();
        } catch {
        }
      }
      if (typeof window.YT?.Player === "function") finish();
      else failed();
    };
    const timeout = setTimeout(() => finish(problem("YOUTUBE_API_TIMEOUT", "The YouTube player did not become available. Try connecting again.")), PLAYER_TIMEOUT_MS);
    window.onYouTubeIframeAPIReady = ready;
    youtubeAPIScript.addEventListener("error", failed, { once: true });
    youtubeAPIScript.addEventListener("load", loaded);
    try {
      document.head.append(youtubeAPIScript);
    } catch {
      failed();
    }
  }).catch((error) => {
    apiPromise = null;
    throw error;
  });
  return apiPromise;
}
function videoFromPlayerUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname) || url.pathname !== "/watch") return null;
    const id = url.searchParams.get("v");
    return VIDEO_ID.test(id ?? "") ? id : null;
  } catch {
    return null;
  }
}
async function createYouTubePlayer({ mount: mount2, videoId, onUpdate, onError, apiKey = YOUTUBE_DATA_API_KEY }) {
  let controller2 = null;
  let reported = null;
  const notifyError = (error) => {
    if (reported === error.code || error.code === "YOUTUBE_CANCELLED") return;
    reported = error.code;
    if (typeof onError === "function") {
      try {
        onError(Object.freeze({ code: error.code, message: error.message }));
      } catch {
      }
    }
  };
  try {
    validateRequest(videoId, apiKey);
    if (!mount2?.isConnected || mount2.ownerDocument !== document || typeof mount2.replaceChildren !== "function" || !["http:", "https:"].includes(window.location.protocol) || window.location.origin === "null") {
      throw problem("YOUTUBE_CONTEXT", "The player needs a connected page served from a valid web origin.");
    }
    mounts.get(mount2)?.destroy();
    const holder = document.createElement("div");
    holder.className = "read-along-player-host";
    const abortController = new AbortController();
    let player = null, destroyed = false, ready = false, constructing = false, reading2 = false;
    let polling = null, readyTimeout = null, failure = null, pauseOnReady = false;
    let observer = null, visibilityObserver = null;
    let pendingEvents = [];
    let current = Object.freeze({ ready: false, videoId, timeSeconds: 0, durationSeconds: 0, state: "unstarted", rate: 1 });
    const isCurrent = () => !destroyed && mounts.get(mount2) === controller2 && mount2.isConnected && holder.isConnected && mount2.contains(holder);
    const stopPolling = () => {
      clearTimeout(polling);
      polling = null;
    };
    const emit = () => {
      if (!isCurrent() || typeof onUpdate !== "function") return;
      try {
        onUpdate(current);
      } catch {
        fail2(problem("YOUTUBE_UPDATE_FAILED", "The reading display could not receive the player update. Reconnect to continue."));
      }
    };
    const fail2 = (error, { pausePlayer = true, actualId = videoId } = {}) => {
      if (!isCurrent() || failure) return;
      failure = error;
      ready = false;
      clearTimeout(readyTimeout);
      stopPolling();
      current = Object.freeze({ ready: false, videoId: actualId, timeSeconds: 0, durationSeconds: 0, state: "error", rate: 1 });
      if (pausePlayer && player) {
        try {
          player.pauseVideo();
        } catch {
        }
      }
      emit();
      if (isCurrent()) notifyError(error);
    };
    const refresh = (notify = true) => {
      if (!isCurrent() || !ready || failure || reading2) return current;
      reading2 = true;
      try {
        const state = STATES[player.getPlayerState()];
        const timeSeconds = player.getCurrentTime(), durationSeconds = player.getDuration(), rate = player.getPlaybackRate();
        const playerUrl = player.getVideoUrl();
        const actualId = videoFromPlayerUrl(playerUrl);
        if (actualId && actualId !== videoId) {
          fail2(problem("YOUTUBE_RECORDING_CHANGED", "The YouTube player changed recordings. Select that recording explicitly to align its text."), { pausePlayer: false, actualId });
          return current;
        }
        if (!state || ![timeSeconds, durationSeconds, rate].every(Number.isFinite) || timeSeconds < 0 || durationSeconds < 0 || rate <= 0 || !actualId && (state === "playing" || timeSeconds > 0)) {
          throw problem("YOUTUBE_CLOCK_UNAVAILABLE", "The recording clock could not be verified. Following has stopped.");
        }
        current = Object.freeze({ ready: true, videoId, timeSeconds, durationSeconds, state, rate });
      } catch (error) {
        fail2(typeof error?.code === "string" && error.code.startsWith("YOUTUBE_") ? error : problem("YOUTUBE_CLOCK_UNAVAILABLE", "The recording clock could not be read. Following has stopped."));
      } finally {
        reading2 = false;
      }
      if (notify && !failure) emit();
      return current;
    };
    const schedule = () => {
      stopPolling();
      if (!isCurrent() || !ready || failure || document.hidden) return;
      polling = setTimeout(() => {
        polling = null;
        if (!isCurrent()) {
          controller2.destroy();
          return;
        }
        refresh();
        schedule();
      }, POLL_MS);
    };
    const pause = () => {
      if (!isCurrent()) return false;
      pauseOnReady = true;
      stopPolling();
      if (player && (ready || failure)) {
        try {
          player.pauseVideo();
          refresh();
        } catch {
          fail2(problem("YOUTUBE_PAUSE_FAILED", "The player could not pause and has been closed. Reconnect to continue."));
          controller2.destroy();
          return false;
        }
      }
      schedule();
      return true;
    };
    const visibilityChanged = () => {
      if (!isCurrent()) {
        controller2.destroy();
        return;
      }
      if (document.hidden) pause();
      else {
        refresh();
        schedule();
      }
    };
    const releasePlayer = () => {
      if (!player) return;
      try {
        player.pauseVideo();
      } catch {
      }
      try {
        player.destroy();
      } catch {
      }
      player = null;
    };
    controller2 = Object.freeze({
      snapshot: () => refresh(false),
      seek(seconds) {
        if (!isCurrent() || !ready || failure) return false;
        if (!Number.isFinite(seconds) || seconds < 0 || current.durationSeconds > 0 && seconds > current.durationSeconds) {
          fail2(problem("YOUTUBE_SEEK_INVALID", "This timing marker is outside the recording."));
          return false;
        }
        try {
          player.seekTo(seconds, true);
          refresh();
          schedule();
          return !failure;
        } catch {
          fail2(problem("YOUTUBE_SEEK_FAILED", "The player could not seek to that timing marker."));
          return false;
        }
      },
      pause,
      destroy() {
        if (destroyed) return;
        destroyed = true;
        ready = false;
        abortController.abort();
        stopPolling();
        clearTimeout(readyTimeout);
        observer?.disconnect();
        visibilityObserver?.disconnect();
        document.removeEventListener("visibilitychange", visibilityChanged);
        window.removeEventListener("pagehide", pageHidden);
        releasePlayer();
        holder.remove();
        pendingEvents = [];
        if (mounts.get(mount2) === controller2) mounts.delete(mount2);
        current = Object.freeze({ ...current, ready: false, timeSeconds: 0, durationSeconds: 0, state: failure ? "error" : "unstarted", rate: 1 });
      }
    });
    const pageHidden = () => controller2.destroy();
    mounts.set(mount2, controller2);
    mount2.replaceChildren(holder);
    if (typeof MutationObserver === "function") {
      observer = new MutationObserver(() => {
        if (!isCurrent()) controller2.destroy();
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
    document.addEventListener("visibilitychange", visibilityChanged);
    window.addEventListener("pagehide", pageHidden);
    await readVideo(videoId, { apiKey, fetcher: fetch }, abortController.signal);
    if (!isCurrent()) throw cancelled();
    const YT = await abortable(loadYouTubeApi(), abortController.signal);
    if (!isCurrent()) throw cancelled();
    const frame = document.createElement("iframe");
    frame.id = `read-along-youtube-${++nextPlayerId}`;
    frame.className = "read-along-player-frame";
    frame.title = "YouTube Gurbani recording";
    frame.width = "100%";
    frame.height = "270";
    frame.allow = "autoplay; encrypted-media; fullscreen";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    const embed = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
    for (const [key, value] of Object.entries({
      enablejsapi: "1",
      origin: window.location.origin,
      autoplay: "0",
      controls: "1",
      playsinline: "1"
    })) embed.searchParams.set(key, value);
    frame.src = embed.href;
    holder.append(frame);
    const handleEvent = (type, event) => {
      if (constructing) {
        pendingEvents.push([type, event]);
        return;
      }
      if (!isCurrent() || failure || event?.target !== player) return;
      if (type === "error") {
        const code = Number.isInteger(event.data) ? String(event.data) : "UNKNOWN";
        const messages = {
          2: "The YouTube recording identifier is invalid.",
          5: "This browser could not play the recording.",
          100: "This recording was removed or made private.",
          101: "The recording owner does not allow embedded playback.",
          150: "The recording owner does not allow embedded playback.",
          153: "YouTube could not identify this embedding page. Open the recording on YouTube."
        };
        fail2(problem(`YOUTUBE_PLAYER_${code}`, messages[code] || "YouTube reported a playback error. Open the recording on YouTube."));
        return;
      }
      if (type === "blocked") {
        refresh();
        if (isCurrent()) notifyError(problem("YOUTUBE_PLAYBACK_BLOCKED", "The browser blocked playback. Use the YouTube player’s Play control."));
        return;
      }
      if (type === "ready") {
        ready = true;
        clearTimeout(readyTimeout);
        if (document.hidden || pauseOnReady) pause();
      }
      refresh();
      schedule();
    };
    readyTimeout = setTimeout(() => fail2(problem("YOUTUBE_PLAYER_TIMEOUT", "The YouTube player did not become ready. Try connecting again.")), PLAYER_TIMEOUT_MS);
    if (!isCurrent()) throw cancelled();
    constructing = true;
    try {
      player = new YT.Player(frame, { events: {
        onReady: (event) => handleEvent("ready", event),
        onStateChange: (event) => handleEvent("state", event),
        onPlaybackRateChange: (event) => handleEvent("rate", event),
        onError: (event) => handleEvent("error", event),
        onAutoplayBlocked: (event) => handleEvent("blocked", event)
      } });
    } finally {
      constructing = false;
    }
    if (!player || ["getPlayerState", "getCurrentTime", "getDuration", "getPlaybackRate", "getVideoUrl", "seekTo", "pauseVideo", "destroy"].some((method) => typeof player[method] !== "function")) {
      throw problem("YOUTUBE_PLAYER_INVALID", "The YouTube player did not expose the required controls.");
    }
    for (const [type, event] of pendingEvents) handleEvent(type, event);
    pendingEvents = [];
    if (!isCurrent()) throw cancelled();
    if (failure) throw failure;
    if (typeof IntersectionObserver === "function") {
      visibilityObserver = new IntersectionObserver((entries) => {
        if (!isCurrent()) {
          controller2.destroy();
          return;
        }
        if (entries.some((entry) => entry.target === frame && !entry.isIntersecting)) pause();
      });
      visibilityObserver.observe(frame);
    }
    return controller2;
  } catch (error) {
    const failure = typeof error?.code === "string" && error.code.startsWith("YOUTUBE_") ? error : problem("YOUTUBE_PLAYER_FAILED", "The YouTube player could not be created. Open the recording on YouTube.");
    notifyError(failure);
    controller2?.destroy();
    throw failure;
  }
}

// collections/source-reader/read-along.mjs
var $ = (id) => document.getElementById(id);
var textPanel = $("read-along-text"), mount = $("youtube-player");
var source = createReadAlongSource();
var reading = null, timing = null, video = null, controller = null, media = null;
var sourceSequence = 0, playerSequence = 0, contextSequence = 0, browseSequence = 0, importSequence = 0, mapRevision = 0;
var selectedId = null, activeId = null, baseline = null, dirty = false, connecting = false, browsing = false;
var pendingStart = null, undo = [], options = [], optionBinding = null, pendingAction = null, dialogReturn = null;
var rows = /* @__PURE__ */ new Map(), lineIndices = /* @__PURE__ */ new Map();
function node(tag, className, text3) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text3 !== void 0) element.textContent = text3;
  return element;
}
function text2(id, value) {
  if ($(id).textContent !== value) $(id).textContent = value;
}
function status(id, state, message) {
  $(id).dataset.state = state;
  text2(id, message);
}
function hasClock(snapshot = media) {
  return Boolean(controller && video && reading && snapshot?.ready && snapshot.videoId === video.videoId && snapshot.state !== "error" && Number.isFinite(snapshot.timeSeconds) && snapshot.timeSeconds >= 0);
}
function updateFallback() {
  let identity;
  try {
    identity = parseYouTubeURL($("video-url").value);
  } catch {
    identity = video;
  }
  $("youtube-fallback").hidden = !identity;
  if (identity) $("youtube-fallback").href = "https://www.youtube.com/watch?v=" + encodeURIComponent(identity.videoId);
  else $("youtube-fallback").removeAttribute("href");
}
function updateControls() {
  const clock = hasClock(), chosenIndex = lineIndices.get(selectedId);
  $("video-load").disabled = !reading;
  $("video-disconnect").disabled = !controller && !connecting;
  $("mark-selected").disabled = !clock || !timing || chosenIndex === void 0;
  $("mark-next").disabled = !clock || !timing || chosenIndex === void 0 || chosenIndex >= reading.lines.length - 1;
  $("mark-pause").disabled = !clock || !timing;
  $("timing-undo").disabled = !undo.length;
  $("timing-save").disabled = !timing || !dirty && !timing.cues.length;
  $("timing-load").disabled = !timing;
  $("timing-export").disabled = !timing;
  $("timing-import").disabled = !timing;
  $("timing-delete").disabled = !timing;
  $("timing-clear").disabled = !timing?.cues.length;
  $("timing-replay").disabled = !clock || !timing?.cues.length;
  for (const button of $("timing-cues").querySelectorAll("button")) button.disabled = !clock;
  const mode = $("source-mode").value;
  $("source-find").disabled = mode === "japji" || browsing;
  $("source-open").disabled = mode !== "japji" && (!optionBinding || !options.some((option) => option.id === $("source-group").value));
}
function rowState(id) {
  const row = rows.get(id);
  if (!row) return;
  const selected = id === selectedId, active = id === activeId;
  row.dataset.selected = String(selected);
  row.dataset.active = String(active);
  row.tabIndex = selected ? 0 : -1;
  row.setAttribute("aria-pressed", String(selected));
  if (active) row.setAttribute("aria-current", "true");
  else row.removeAttribute("aria-current");
  row.querySelector(".read-along-line-state").textContent = [selected ? "Selected" : "", active ? "Timed line" : ""].filter(Boolean).join(" · ");
}
function revealRow(id, { follow = false } = {}) {
  const row = rows.get(id);
  if (!row?.isConnected) return;
  if (follow && (!$("follow-timings").checked || textPanel.contains(document.activeElement))) return;
  const panelBox = textPanel.getBoundingClientRect(), box = row.getBoundingClientRect();
  const top = textPanel.scrollTop + box.top - panelBox.top - 12;
  textPanel.scrollTo({ top: Math.max(0, top), behavior: "auto" });
}
function selectLine(id, { focus = false, reveal = false } = {}) {
  if (!lineIndices.has(id)) return;
  const previous = selectedId;
  selectedId = id;
  rowState(previous);
  rowState(id);
  const index = lineIndices.get(id), line = reading.lines[index];
  text2("selected-line", "Selected: line " + (index + 1) + " of " + reading.lines.length + " · " + line.label);
  if (reveal) revealRow(id);
  if (focus) rows.get(id).focus({ preventScroll: true });
  updateControls();
}
function setActive(id) {
  if (id && !rows.has(id)) id = null;
  if (id === activeId) return;
  const previous = activeId;
  activeId = id;
  rowState(previous);
  rowState(id);
  if (id) revealRow(id, { follow: true });
}
function alignmentMessage() {
  if (!reading) return "Original text is not yet available.";
  if (!video || !timing) return "Connect a recording when you want to mark its timing.";
  if (!timing.cues.length) return "No timing markers yet. Select a line and mark its start.";
  if (!hasClock()) return "Timings are open. Connect the recording to follow its clock.";
  if (activeId) return "Timed line " + (lineIndices.get(activeId) + 1) + " · " + reading.lines[lineIndices.get(activeId)].label;
  const at = media.timeSeconds * 1e3;
  let left = 0, right = timing.cues.length;
  while (left < right) {
    const middle = left + right >>> 1;
    if (timing.cues[middle].at <= at) left = middle + 1;
    else right = middle;
  }
  const index = left - 1;
  if (index < 0) return "No marked text for this part of the recording.";
  if (index < timing.cues.length - 1 && timing.cues[index].lineId === null) return "A text pause is marked for this interval.";
  if (index === timing.cues.length - 1 && timing.cues[index].lineId !== null) return "The latest line mark needs a following mark or a text pause/end.";
  return "After the final text pause/end marker. No line is highlighted.";
}
function updateAlignment() {
  setActive(hasClock() && timing ? lineAt(timing, media.timeSeconds) : null);
  text2("alignment-status", alignmentMessage());
}
function updateClock() {
  const states = { unstarted: "Ready", cued: "Ready", playing: "Playing", paused: "Paused", buffering: "Buffering", ended: "Ended", error: "Playback unavailable" };
  text2("player-state", media ? states[media.state] || "Opening player" : "Not connected");
  text2("media-time", media?.ready && Number.isFinite(media.timeSeconds) ? formatTime(media.timeSeconds) + (Number.isFinite(media.durationSeconds) && media.durationSeconds > 0 ? " / " + formatTime(media.durationSeconds) : "") : "—");
  text2("playback-rate", media?.ready && Number.isFinite(media.rate) && media.rate > 0 ? media.rate + "×" : "");
  updateAlignment();
  updateControls();
}
function acceptSnapshot(snapshot, token, expectedReading, expectedVideo) {
  if (token !== playerSequence || reading !== expectedReading || video?.videoId !== expectedVideo || snapshot?.videoId !== expectedVideo) return;
  media = snapshot;
  if (controller && snapshot.ready && pendingStart !== null) {
    const start = pendingStart;
    pendingStart = null;
    if (start > 0) {
      controller.pause();
      controller.seek(start);
      const current = controller.snapshot();
      if (token !== playerSequence || reading !== expectedReading || current?.videoId !== expectedVideo) return;
      media = current;
    }
  }
  if (media.ready && media.state !== "error" && $("video-status").dataset.state !== "ready")
    status("video-status", "ready", "Recording connected. Use YouTube’s controls for play, pause, seeking and speed.");
  updateClock();
}
function playerError(error, token, expectedReading, expectedVideo) {
  if (token !== playerSequence || reading !== expectedReading || video?.videoId !== expectedVideo || error?.code === "YOUTUBE_CANCELLED") return;
  const message = error?.code === "YOUTUBE_NOT_CONFIGURED" ? "YouTube playback setup is not connected yet. You can still read here or open the video on YouTube." : error?.code === "YOUTUBE_CONFIGURATION" ? "YouTube playback setup is unavailable. You can still read here or open the video on YouTube." : error?.message || "The recording could not be opened here. You can still read or watch it on YouTube.";
  status("video-status", "unavailable", message);
  if (error?.code !== "YOUTUBE_PLAYBACK_BLOCKED") {
    media = null;
    updateClock();
  }
  updateFallback();
}
function detachPlayer(message) {
  ++playerSequence;
  connecting = false;
  pendingStart = null;
  const previous = controller;
  controller = null;
  media = null;
  try {
    previous?.pause();
  } catch {
  }
  try {
    previous?.destroy();
  } catch {
  }
  mount.replaceChildren();
  mount.hidden = true;
  $("player-placeholder").hidden = false;
  setActive(null);
  updateClock();
  if (message) status("video-status", "idle", message);
}
function resetTiming() {
  timing = null;
  video = null;
  baseline = null;
  dirty = false;
  undo = [];
  ++mapRevision;
  ++importSequence;
  renderTiming();
}
function renderSource() {
  const expected = reading, fragment = document.createDocumentFragment();
  rows.clear();
  lineIndices.clear();
  selectedId = null;
  activeId = null;
  expected.lines.forEach((line, index) => {
    const row = node("button", "read-along-line");
    row.type = "button";
    row.dataset.lineId = line.id;
    row.dataset.selected = "false";
    row.dataset.active = "false";
    row.tabIndex = -1;
    const original = node("span", "read-along-original", line.text);
    original.lang = "pa-Guru";
    row.append(
      original,
      node("span", "read-along-locator", line.label + " · Line " + (index + 1)),
      node("span", "read-along-line-state")
    );
    row.addEventListener("click", () => {
      if (reading === expected) selectLine(line.id);
    });
    rows.set(line.id, row);
    lineIndices.set(line.id, index);
    fragment.append(row);
  });
  textPanel.replaceChildren(fragment);
  textPanel.scrollTop = 0;
  textPanel.setAttribute("aria-busy", "false");
  text2("source-title", expected.title);
  status("source-status", "ready", expected.lines.length + " original rows checked");
  text2("source-provenance", "Named edition: " + expected.binding.editionId + ". This selection contains " + expected.lines.length + " original rows in " + expected.binding.units.length + " complete source " + (expected.binding.units.length === 1 ? "group." : "groups."));
  document.documentElement.dataset.readAlongState = "ready";
  selectLine(expected.lines[0].id);
  updateAlignment();
  updateControls();
}
async function openSource(load) {
  const token = ++sourceSequence;
  ++contextSequence;
  detachPlayer("Text selection changed. Choose Load video to connect a recording for this text.");
  resetTiming();
  reading = null;
  rows.clear();
  lineIndices.clear();
  selectedId = null;
  activeId = null;
  textPanel.replaceChildren();
  textPanel.setAttribute("aria-busy", "true");
  text2("source-title", "Opening original text");
  text2("selected-line", "Select a source line after it has been checked.");
  status("source-status", "loading", "Checking the complete original text…");
  document.documentElement.dataset.readAlongState = "loading";
  updateControls();
  updateFallback();
  try {
    const next = await load();
    if (token !== sourceSequence) return;
    reading = next;
    renderSource();
  } catch {
    if (token !== sourceSequence) return;
    textPanel.replaceChildren();
    textPanel.setAttribute("aria-busy", "false");
    text2("source-title", "Original text unavailable");
    status("source-status", "refused", "This complete source selection could not be verified. Choose the text again to retry.");
    document.documentElement.dataset.readAlongState = "refused";
    updateAlignment();
    updateControls();
  }
}
function chooserChanged() {
  ++browseSequence;
  browsing = false;
  options = [];
  optionBinding = null;
  const mode = $("source-mode").value, isJapji = mode === "japji";
  $("source-page-field").hidden = isJapji;
  $("source-group-field").hidden = isJapji;
  text2("source-page-label", mode === "dasam" ? "Source page · 1–1428" : "Ang number · 1–1430");
  $("source-group").replaceChildren(node("option", "", "Find passages to choose one"));
  $("source-group").disabled = true;
  text2("source-options-status", isJapji ? "Japji includes all 385 original rows in this named digital edition." : "Find a page, then choose the passage beginning you want. The complete provider group will open.");
  updateControls();
}
async function browse() {
  const collectionId = $("source-mode").value, raw = $("source-page").value;
  if (!["sggs", "dasam"].includes(collectionId) || !/^[1-9][0-9]{0,3}$/.test(raw) || Number(raw) > (collectionId === "sggs" ? 1430 : 1428)) {
    text2("source-options-status", "Enter an available Ang or source-page number.");
    return;
  }
  const page = Number(raw), token = ++browseSequence;
  browsing = true;
  options = [];
  optionBinding = null;
  $("source-group").disabled = true;
  text2("source-options-status", "Checking complete passages on this page…");
  updateControls();
  try {
    const found = await source.browsePage(collectionId, page);
    if (token !== browseSequence || $("source-mode").value !== collectionId || $("source-page").value !== raw) return;
    options = found;
    optionBinding = { collectionId, page };
    browsing = false;
    const fragment = document.createDocumentFragment();
    for (const value of found) {
      const option = node("option", "", value.title + " · " + value.lineCount + " rows · " + value.firstLine);
      option.value = value.id;
      fragment.append(option);
    }
    $("source-group").replaceChildren(fragment);
    $("source-group").disabled = !found.length;
    text2("source-options-status", found.length + " complete passages available. Choose a beginning, then Open selected text.");
    updateControls();
  } catch {
    if (token !== browseSequence) return;
    browsing = false;
    text2("source-options-status", "These source passages could not be verified. Check the page number and try again.");
    updateControls();
  }
}
function proceed(action, description) {
  if (!dirty) {
    action();
    return;
  }
  pendingAction = action;
  dialogReturn = document.activeElement;
  text2("discard-description", "You have unsaved timing changes. Save or export a copy before you " + description + ".");
  text2("discard-status", "");
  $("discard-save").disabled = !timing;
  try {
    controller?.pause();
  } catch {
    detachPlayer("Video disconnected while you review your timing changes.");
  }
  mount.hidden = true;
  if (!$("discard-dialog").open) $("discard-dialog").showModal();
}
function finishPending() {
  const action = pendingAction;
  pendingAction = null;
  $("discard-dialog").close();
  action?.();
}
async function connectVideo(identity) {
  const expectedReading = reading;
  if (!expectedReading) {
    status("video-status", "refused", "Open and verify the original text before connecting a recording.");
    return;
  }
  const isSame = video?.videoId === identity.videoId && timing;
  detachPlayer();
  if (!isSame) {
    ++contextSequence;
    ++importSequence;
    ++mapRevision;
    video = identity;
    timing = emptyTiming(identity.videoId, expectedReading);
    baseline = serializeTiming(timing);
    dirty = false;
    undo = [];
    status("timing-status", "idle", "New recording and text selected. Mark timings or explicitly load a saved map.");
  } else video = identity;
  const token = playerSequence;
  connecting = true;
  pendingStart = identity.startSeconds;
  const holder = node("div", "player-instance");
  mount.replaceChildren(holder);
  mount.hidden = false;
  $("player-placeholder").hidden = true;
  status("video-status", "loading", "Checking the recording before opening YouTube…");
  renderTiming();
  updateFallback();
  updateControls();
  try {
    const next = await createYouTubePlayer({
      mount: holder,
      videoId: identity.videoId,
      onUpdate: (snapshot) => acceptSnapshot(snapshot, token, expectedReading, identity.videoId),
      onError: (error) => playerError(error, token, expectedReading, identity.videoId)
    });
    if (token !== playerSequence || reading !== expectedReading || video?.videoId !== identity.videoId) {
      try {
        next.destroy();
      } catch {
      }
      return;
    }
    controller = next;
    connecting = false;
    acceptSnapshot(next.snapshot(), token, expectedReading, identity.videoId);
    updateControls();
  } catch (error) {
    if (token !== playerSequence || reading !== expectedReading || video?.videoId !== identity.videoId) return;
    connecting = false;
    controller = null;
    media = null;
    mount.replaceChildren();
    mount.hidden = true;
    $("player-placeholder").hidden = false;
    playerError(error, token, expectedReading, identity.videoId);
    updateClock();
    updateControls();
  }
}
function loadVideo(event) {
  event?.preventDefault();
  if (!reading) {
    status("video-status", "refused", "Open and verify the original text before connecting a recording.");
    return;
  }
  let identity;
  try {
    identity = parseYouTubeURL($("video-url").value);
  } catch {
    status("video-status", "refused", "Use a link to one YouTube recording, such as a watch, share or shorts link.");
    updateFallback();
    return;
  }
  updateFallback();
  if (video?.videoId === identity.videoId) void connectVideo(identity);
  else proceed(() => {
    void connectVideo(identity);
  }, "change recordings");
}
function replaceTiming(next, { clean = false, keepUndo = true } = {}) {
  const previous = timing, serial = serializeTiming(next);
  if (keepUndo && previous && serializeTiming(previous) !== serial) {
    undo.push(previous);
    if (undo.length > 20) undo.shift();
  }
  timing = next;
  ++mapRevision;
  ++importSequence;
  if (clean) baseline = serial;
  dirty = serial !== baseline;
  renderTiming();
  updateAlignment();
  updateControls();
}
function renderTiming() {
  $("timing-cues").replaceChildren();
  if (!timing || !reading) {
    text2("timing-summary", "Connect a recording to create or load timings for this text.");
    text2("cue-count", "No markers yet.");
    updateControls();
    return;
  }
  const intervals = timing.cues.slice(0, -1).filter((cue) => cue.lineId !== null).length;
  text2("timing-summary", timing.cues.length + " markers · " + intervals + " bounded line intervals" + (dirty ? " · Unsaved changes" : ""));
  const first = Math.max(0, timing.cues.length - 20);
  text2("cue-count", timing.cues.length ? first ? "Showing the latest 20 of " + timing.cues.length + " markers." : "Your markers in recording-time order." : "No markers yet.");
  $("timing-cues").start = first + 1;
  for (let index = first; index < timing.cues.length; index++) {
    const cue = timing.cues[index], item = node("li");
    const label = cue.lineId === null ? "Text pause or end" : "Line " + (lineIndices.get(cue.lineId) + 1) + " · " + reading.lines[lineIndices.get(cue.lineId)].label;
    const go = node("button", "quiet", formatTime(cue.at / 1e3) + " · " + label);
    go.type = "button";
    go.dataset.cueAt = String(cue.at);
    go.addEventListener("click", () => seek(cue.at / 1e3));
    item.append(go);
    if (index === timing.cues.length - 1 && cue.lineId !== null) item.append(node("small", "", "This final line marker needs a following marker to define its interval."));
    $("timing-cues").append(item);
  }
  updateControls();
}
function currentClock() {
  if (!controller || !video || !reading) return null;
  const snapshot = controller.snapshot();
  if (!hasClock(snapshot)) return null;
  media = snapshot;
  return Math.round(snapshot.timeSeconds * 1e3);
}
function mark(lineId, { select = false } = {}) {
  if (!timing || !reading) return;
  const at = currentClock();
  if (at === null) {
    status("timing-status", "refused", "The recording clock is not available. Use the player controls or reconnect before marking.");
    updateClock();
    return;
  }
  try {
    const next = putCue(timing, reading, at, lineId);
    replaceTiming(next);
    if (select && lineId) selectLine(lineId, { reveal: true });
    status("timing-status", dirty ? "dirty" : "loaded", (lineId === null ? "Text pause/end" : "Selected line") + " marked at " + formatTime(at / 1e3) + ". Choose Save on device to keep your changes.");
  } catch {
    status("timing-status", "refused", "This marker could not be added. Your current map is unchanged; check the recording time or export your map.");
  }
}
function seek(seconds) {
  const target = controller, snapshot = target?.snapshot();
  if (!hasClock(snapshot)) return false;
  const token = playerSequence, expectedReading = reading, expectedVideo = video.videoId;
  if (!["playing", "buffering"].includes(snapshot.state) && target.pause() === false) return false;
  if (token !== playerSequence || controller !== target) return false;
  const moved = target.seek(seconds);
  if (token !== playerSequence || controller !== target) return false;
  acceptSnapshot(target.snapshot(), token, expectedReading, expectedVideo);
  return moved !== false;
}
function saveTiming() {
  if (!timing || !reading || !video) return false;
  try {
    const checked = validateTiming(timing, reading, video.videoId), serial = serializeTiming(checked);
    localStorage.setItem(timingKey(video.videoId, reading), serial);
    baseline = serial;
    dirty = false;
    renderTiming();
    status("timing-status", "saved", "Timings saved on this device for this recording and exact source selection.");
    return true;
  } catch {
    status("timing-status", "refused", "Timings could not be saved on this device. Your current map is still open; export it to keep a copy.");
    return false;
  }
}
function exportTiming() {
  if (!timing || !reading || !video) return;
  try {
    const checked = validateTiming(timing, reading, video.videoId);
    const url = URL.createObjectURL(new Blob([serializeTiming(checked) + "\n"], { type: "application/json" }));
    const link = node("a");
    link.href = url;
    link.download = "Gurbani-timings-" + video.videoId + "-" + reading.binding.selectionId.replace(":", "-") + ".json";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
    status("timing-status", dirty ? "dirty" : "loaded", "Timing file exported. It contains your markers and source identity, without the recording.");
  } catch {
    status("timing-status", "refused", "The timing file could not be exported. Your current map remains open.");
  }
}
function loadSaved() {
  if (!timing || !reading || !video) return;
  const expectedContext = contextSequence, expectedReading = reading, expectedVideo = video.videoId;
  const current = () => expectedContext === contextSequence && reading === expectedReading && video?.videoId === expectedVideo;
  const readSaved = () => {
    const raw = localStorage.getItem(timingKey(expectedVideo, expectedReading));
    if (raw === null) return null;
    return validateTiming(raw, expectedReading, expectedVideo);
  };
  const restore = () => {
    if (!current()) return;
    try {
      const next = readSaved();
      if (!next) {
        status("timing-status", dirty ? "dirty" : "idle", "No saved timings were found for this recording and exact text selection.");
        return;
      }
      replaceTiming(next, { clean: true });
      status("timing-status", "loaded", "Saved timings loaded for this recording and exact text selection.");
    } catch {
      status("timing-status", "refused", "The saved timings could not be loaded or matched to this recording and source. The stored record and current map have been kept unchanged.");
    }
  };
  if (!dirty) {
    restore();
    return;
  }
  try {
    if (!readSaved()) {
      status("timing-status", "dirty", "No saved timings were found for this recording and exact text selection.");
      return;
    }
    proceed(restore, "load the saved timings");
  } catch {
    status("timing-status", "refused", "The saved timings could not be loaded or matched to this recording and source. The stored record and current map have been kept unchanged.");
  }
}
async function importTiming(event) {
  const file = event.target.files?.[0];
  if (!file || !timing || !reading || !video) return;
  const token = ++importSequence, expectedContext = contextSequence, revision = mapRevision, expectedReading = reading, expectedVideo = video.videoId;
  const current = () => token === importSequence && revision === mapRevision && expectedContext === contextSequence && reading === expectedReading && video?.videoId === expectedVideo;
  try {
    if (file.size > MAX_TIMING_BYTES) throw Error("Too large");
    const raw = await file.text();
    if (!current()) return;
    const next = validateTiming(raw, expectedReading, expectedVideo);
    proceed(() => {
      if (expectedContext !== contextSequence || reading !== expectedReading || video?.videoId !== expectedVideo || revision !== mapRevision) return;
      replaceTiming(next);
      status("timing-status", dirty ? "dirty" : "loaded", "Timing file loaded. Save on this device if you want to keep a local copy.");
    }, "import a different timing map");
  } catch {
    if (current()) status("timing-status", "refused", "This file is too large, malformed, or belongs to another recording or source edition. Your current map is unchanged.");
  } finally {
    if (event.target.files?.[0] === file) event.target.value = "";
  }
}
$("video-form").addEventListener("submit", loadVideo);
$("video-url").addEventListener("input", updateFallback);
$("video-disconnect").addEventListener("click", () => detachPlayer("Video disconnected. Your current timings remain open to save or export."));
$("source-mode").addEventListener("change", chooserChanged);
$("source-page").addEventListener("input", chooserChanged);
$("source-find").addEventListener("click", () => {
  void browse();
});
$("source-group").addEventListener("change", updateControls);
$("source-open").addEventListener("click", () => {
  const mode = $("source-mode").value;
  if (mode === "japji") proceed(() => {
    void openSource(() => source.japji());
  }, "open complete Japji Sahib");
  else if (optionBinding && options.some((option) => option.id === $("source-group").value)) {
    const { collectionId, page } = optionBinding, unitId = $("source-group").value;
    proceed(() => {
      void openSource(() => source.group(collectionId, page, unitId));
    }, "change the source passage");
  }
});
textPanel.addEventListener("keydown", (event) => {
  if (!reading || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  let index = lineIndices.get(selectedId) ?? 0;
  index = event.key === "Home" ? 0 : event.key === "End" ? reading.lines.length - 1 : Math.max(0, Math.min(reading.lines.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)));
  selectLine(reading.lines[index].id, { focus: true, reveal: true });
});
$("mark-selected").addEventListener("click", () => {
  if (selectedId) mark(selectedId);
});
$("mark-next").addEventListener("click", () => {
  const index = lineIndices.get(selectedId);
  if (reading && index !== void 0 && index + 1 < reading.lines.length) mark(reading.lines[index + 1].id, { select: true });
});
$("mark-pause").addEventListener("click", () => mark(null));
$("timing-undo").addEventListener("click", () => {
  const previous = undo.pop();
  if (!previous) return;
  replaceTiming(previous, { keepUndo: false });
  status("timing-status", dirty ? "dirty" : "loaded", "Previous timing map restored.");
});
$("follow-timings").addEventListener("change", () => {
  if (activeId) revealRow(activeId, { follow: true });
});
$("timing-save").addEventListener("click", saveTiming);
$("timing-load").addEventListener("click", loadSaved);
$("timing-export").addEventListener("click", exportTiming);
$("timing-import").addEventListener("change", (event) => {
  void importTiming(event);
});
$("timing-replay").addEventListener("click", () => {
  if (!timing?.cues.length) return;
  if (seek(timing.cues[0].at / 1e3))
    status("timing-status", dirty ? "dirty" : "loaded", "Moved to the first marker. Use the YouTube Play control to replay.");
});
$("timing-clear").addEventListener("click", () => {
  if (!timing || !reading || !video) return;
  const expectedContext = contextSequence;
  proceed(() => {
    if (expectedContext !== contextSequence || !reading || !video) return;
    replaceTiming(emptyTiming(video.videoId, reading));
    status("timing-status", dirty ? "dirty" : "idle", "Current markers cleared. Saved timings on this device have not been changed.");
  }, "clear the current map");
});
$("timing-delete").addEventListener("click", () => {
  if (!timing || !reading || !video) return;
  try {
    localStorage.removeItem(timingKey(video.videoId, reading));
    baseline = serializeTiming(emptyTiming(video.videoId, reading));
    dirty = serializeTiming(timing) !== baseline;
    renderTiming();
    status("timing-status", dirty ? "dirty" : "idle", "Saved timings deleted from this device. Your current map remains open.");
  } catch {
    status("timing-status", "refused", "Saved timings could not be deleted on this device. Your current map remains open.");
  }
});
$("discard-cancel").addEventListener("click", () => {
  pendingAction = null;
  $("discard-dialog").close();
});
$("discard-confirm").addEventListener("click", finishPending);
$("discard-export").addEventListener("click", exportTiming);
$("discard-save").addEventListener("click", () => {
  if (saveTiming()) finishPending();
  else text2("discard-status", "Saving was not available. Export a copy or keep editing.");
});
$("discard-dialog").addEventListener("close", () => {
  pendingAction = null;
  if ((controller || connecting) && mount.childElementCount) {
    mount.hidden = false;
    $("player-placeholder").hidden = true;
  }
  if (dialogReturn?.isConnected) dialogReturn.focus({ preventScroll: true });
  dialogReturn = null;
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    try {
      controller?.pause();
    } catch {
    }
  }
});
window.addEventListener("pagehide", () => detachPlayer("Video disconnected. Choose Load video to connect again."));
window.addEventListener("beforeunload", (event) => {
  if (dirty) {
    event.preventDefault();
    event.returnValue = "";
  }
});
chooserChanged();
updateFallback();
renderTiming();
void openSource(() => source.japji());
