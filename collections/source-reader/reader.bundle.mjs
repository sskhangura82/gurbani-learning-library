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
function manifestState(manifest2) {
  const state2 = manifests.get(manifest2);
  need(state2, "SOURCE_UNVERIFIED_MANIFEST");
  return state2;
}
function verifiedUnit(manifest2, unit) {
  manifestState(manifest2);
  const state2 = units.get(unit);
  need(state2?.manifest === manifest2, "SOURCE_UNVERIFIED_UNIT");
  return state2.descriptor;
}
async function verifyManifest(input, binding2) {
  need(binding2 && typeof binding2 === "object" && Object.hasOwn(EDITIONS, binding2.collectionId) && typeof binding2.editionId === "string" && HASH.test(binding2.sha256) && integer(binding2.bytes, MANIFEST_LIMIT), "SOURCE_BINDING");
  const raw = inputBytes(input, MANIFEST_LIMIT);
  need(raw.byteLength === binding2.bytes, "SOURCE_MANIFEST_SIZE");
  need(await sha256(raw) === binding2.sha256, "SOURCE_MANIFEST_DIGEST");
  const manifest2 = parse(raw);
  keys(manifest2, ["schema", "status", "locatorStatus", "collectionId", "editionId", "name", "source", "counts", "sections", "authors", "units", "chunks"]);
  need(manifest2.schema === "glp.sikh-reader.manifest.v1" && manifest2.status === "NAMED_DIGITAL_EDITION_ORIGINAL_ONLY" && manifest2.locatorStatus === "SOURCE_REPORTED" && manifest2.collectionId === binding2.collectionId && manifest2.editionId === binding2.editionId, "SOURCE_IDENTITY");
  metadataName(manifest2.name, ["Latn", "Guru"]);
  const source = manifest2.source;
  keys(source, ["packageName", "packageVersion", "reportedGitHead", "archiveSha256", "databaseSha256", "noticeSha256", "sourceId", "assetId"]);
  const pair = EDITIONS[manifest2.collectionId];
  need(source.packageName === "@shabados/database" && typeof source.packageVersion === "string" && /^[0-9]+\.[0-9]+\.[0-9]+(?:-[A-Za-z0-9.-]+)?$/.test(source.packageVersion) && typeof source.reportedGitHead === "string" && /^[a-f0-9]{40}$/.test(source.reportedGitHead) && [source.archiveSha256, source.databaseSha256, source.noticeSha256].every((value) => typeof value === "string" && HASH.test(value)) && source.sourceId === pair[0] && source.assetId === pair[1] && manifest2.editionId === `shabados-${source.packageVersion}-${source.sourceId}-${source.assetId}`, "SOURCE_PROVENANCE");
  keys(manifest2.counts, ["units", "lines", "pages"]);
  need(Object.values(manifest2.counts).every((value) => integer(value)), "SOURCE_COUNTS");
  need(Array.isArray(manifest2.sections) && manifest2.sections.length > 0 && Array.isArray(manifest2.authors) && manifest2.authors.length > 0 && Array.isArray(manifest2.units) && manifest2.units.length === manifest2.counts.units && Array.isArray(manifest2.chunks) && manifest2.chunks.length > 0, "SOURCE_COUNTS");
  const sections = /* @__PURE__ */ new Map(), authors = /* @__PURE__ */ new Map(), byUnit = /* @__PURE__ */ new Map(), byChunk = /* @__PURE__ */ new Map(), byPage = /* @__PURE__ */ new Map();
  for (const [index, section] of manifest2.sections.entries()) {
    keys(section, ["id", "order", "name"]);
    need(identifier(section.id) && section.order === index + 1 && !sections.has(section.id), "SOURCE_SECTION");
    metadataName(section.name, ["Latn"]);
    sections.set(section.id, section);
  }
  for (const author of manifest2.authors) {
    keys(author, ["id", "name"]);
    need(identifier(author.id) && !authors.has(author.id), "SOURCE_AUTHOR");
    metadataName(author.name, ["Guru", "Latn"]);
    authors.set(author.id, author);
  }
  let lineCount = 0, previousSection = 0, sectionOrder = 0;
  for (const descriptor of manifest2.units) {
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
      need(integer(page, manifest2.counts.pages) && page > previousPage, "SOURCE_UNIT_PAGES");
      previousPage = page;
      if (!byPage.has(page)) byPage.set(page, []);
      byPage.get(page).push(descriptor);
    }
    lineCount += descriptor.lineCount;
    byUnit.set(descriptor.id, descriptor);
  }
  need(lineCount === manifest2.counts.lines && previousSection === manifest2.sections.length && byPage.size === manifest2.counts.pages, "SOURCE_COVERAGE");
  for (let page = 1; page <= manifest2.counts.pages; page++) need(byPage.has(page), "SOURCE_COVERAGE");
  let unitIndex = 0;
  for (const [index, descriptor] of manifest2.chunks.entries()) {
    keys(descriptor, ["id", "path", "bytes", "sha256", "unitIds"]);
    need(descriptor.id === `c${String(index + 1).padStart(4, "0")}` && descriptor.path === `chunks/${descriptor.id}.json` && integer(descriptor.bytes, CHUNK_LIMIT) && typeof descriptor.sha256 === "string" && HASH.test(descriptor.sha256) && Array.isArray(descriptor.unitIds) && descriptor.unitIds.length > 0, "SOURCE_CHUNK_DESCRIPTOR");
    for (const id of descriptor.unitIds) {
      const unit = manifest2.units[unitIndex++];
      need(unit && unit.id === id && unit.chunkId === descriptor.id, "SOURCE_CHUNK_COVERAGE");
    }
    byChunk.set(descriptor.id, descriptor);
  }
  need(unitIndex === manifest2.units.length, "SOURCE_CHUNK_COVERAGE");
  for (const list of byPage.values()) Object.freeze(list);
  freeze(manifest2);
  manifests.set(manifest2, { byUnit, byChunk, byPage, lineOwners: /* @__PURE__ */ new Map() });
  return manifest2;
}
async function verifyChunk(input, descriptor, manifest2) {
  const state2 = manifestState(manifest2);
  need(descriptor && state2.byChunk.get(descriptor.id) === descriptor, "SOURCE_UNVERIFIED_DESCRIPTOR");
  const raw = inputBytes(input, CHUNK_LIMIT);
  need(raw.byteLength === descriptor.bytes, "SOURCE_CHUNK_SIZE");
  need(await sha256(raw) === descriptor.sha256, "SOURCE_CHUNK_DIGEST");
  const chunk = parse(raw);
  keys(chunk, ["schema", "collectionId", "editionId", "id", "units"]);
  need(chunk.schema === "glp.sikh-reader.chunk.v1" && chunk.collectionId === manifest2.collectionId && chunk.editionId === manifest2.editionId && chunk.id === descriptor.id, "SOURCE_CHUNK_IDENTITY");
  need(Array.isArray(chunk.units) && chunk.units.length === descriptor.unitIds.length, "SOURCE_CHUNK_COVERAGE");
  const lineOwners = /* @__PURE__ */ new Map(), digests = [];
  for (const [index, unit] of chunk.units.entries()) {
    keys(unit, ["id", "sectionId", "sectionOrder", "authorId", "lines"]);
    const expected = state2.byUnit.get(descriptor.unitIds[index]);
    need(unit.id === expected.id && unit.sectionId === expected.sectionId && unit.sectionOrder === expected.sectionOrder && unit.authorId === expected.authorId, "SOURCE_UNIT_BINDING");
    need(Array.isArray(unit.lines) && unit.lines.length === expected.lineCount, "SOURCE_COMPLETE_UNIT");
    const pages = /* @__PURE__ */ new Set();
    for (const [lineIndex, line] of unit.lines.entries()) {
      keys(line, ["id", "order", "page", "printedLine", "text"]);
      need(identifier(line.id) && !lineOwners.has(line.id) && line.order === lineIndex + 1 && integer(line.page, manifest2.counts.pages) && expected.pages.includes(line.page) && (line.printedLine === null || integer(line.printedLine)) && text(line.text, 65536), "SOURCE_LINE");
      lineOwners.set(line.id, unit.id);
      pages.add(line.page);
    }
    need(same([...pages].sort((a, b) => a - b), expected.pages), "SOURCE_UNIT_PAGES");
    digests.push([encoder.encode(JSON.stringify(unit)), expected.sha256]);
  }
  await Promise.all(digests.map(async ([rawUnit, expected]) => need(await sha256(rawUnit) === expected, "SOURCE_UNIT_DIGEST")));
  for (const [id, owner] of lineOwners) need(!state2.lineOwners.has(id) || state2.lineOwners.get(id) === owner, "SOURCE_DUPLICATE_LINE");
  freeze(chunk);
  for (const unit of chunk.units) units.set(unit, { manifest: manifest2, descriptor: state2.byUnit.get(unit.id) });
  for (const [id, owner] of lineOwners) state2.lineOwners.set(id, owner);
  return chunk;
}
function unitsForPage(manifest2, page) {
  const state2 = manifestState(manifest2);
  need(integer(page, manifest2.counts.pages) && state2.byPage.has(page), "SOURCE_ROUTE_PAGE");
  return state2.byPage.get(page);
}
function routeShape(route2) {
  need(route2 && typeof route2 === "object" && !Array.isArray(route2) && Object.hasOwn(route2, "page") && Object.keys(route2).every((key) => ["page", "unitId", "lineId"].includes(key)), "SOURCE_ROUTE");
  const unitId = route2.unitId ?? null, lineId = route2.lineId ?? null;
  need(integer(route2.page) && (unitId === null || identifier(unitId)) && (lineId === null || identifier(lineId)) && (lineId === null || unitId !== null), "SOURCE_ROUTE");
  return { page: route2.page, unitId, lineId };
}
function checkedRoute(manifest2, value) {
  const state2 = manifestState(manifest2), route2 = routeShape(value);
  unitsForPage(manifest2, route2.page);
  if (route2.unitId !== null) need(state2.byUnit.get(route2.unitId)?.pages.includes(route2.page), "SOURCE_ROUTE_UNIT");
  return Object.freeze(route2);
}
function parseRoute(search, manifest2) {
  manifestState(manifest2);
  need(typeof search === "string" && search.length <= 512 && !search.includes("#"), "SOURCE_ROUTE");
  if (search === "" || search === "?") return checkedRoute(manifest2, { page: 1 });
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
  return checkedRoute(manifest2, { page: Number(params.get("page")), unitId: params.get("unit"), lineId: params.get("line") });
}
function formatRoute(value) {
  const route2 = routeShape(value), params = new URLSearchParams({ page: String(route2.page) });
  if (route2.unitId !== null) params.set("unit", route2.unitId);
  if (route2.lineId !== null) params.set("line", route2.lineId);
  return `?${params}`;
}
function lineForRoute(manifest2, value, unit) {
  const route2 = checkedRoute(manifest2, value);
  if (route2.unitId === null) return null;
  const descriptor = verifiedUnit(manifest2, unit);
  need(descriptor.id === route2.unitId, "SOURCE_ROUTE_UNIT");
  if (route2.lineId === null) return null;
  const line = unit.lines.find((item) => item.id === route2.lineId);
  need(line && line.page === route2.page, "SOURCE_ROUTE_LINE");
  return line;
}
function progressKey(manifest2) {
  manifestState(manifest2);
  return `glp001.sikh-source-place.v1:${manifest2.collectionId}:${manifest2.editionId}`;
}
function progressUnit(record, manifest2) {
  const state2 = manifestState(manifest2);
  keys(record, PROGRESS_KEYS, "SOURCE_PROGRESS_SCHEMA");
  need(record.schema === "glp.sikh-reader.progress.v1" && record.collectionId === manifest2.collectionId && record.editionId === manifest2.editionId && identifier(record.unitId) && identifier(record.lineId) && typeof record.unitSha256 === "string" && HASH.test(record.unitSha256), "SOURCE_PROGRESS_BINDING");
  const descriptor = state2.byUnit.get(record.unitId);
  need(descriptor && descriptor.sha256 === record.unitSha256 && integer(record.page, manifest2.counts.pages) && descriptor.pages.includes(record.page), "SOURCE_PROGRESS_BINDING");
  need(typeof record.updatedAt === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(record.updatedAt) && Number.isFinite(Date.parse(record.updatedAt)) && new Date(record.updatedAt).toISOString() === record.updatedAt, "SOURCE_PROGRESS_DATE");
  return descriptor;
}
function validateProgress(record, manifest2, unit) {
  const descriptor = progressUnit(record, manifest2);
  need(verifiedUnit(manifest2, unit) === descriptor, "SOURCE_PROGRESS_UNIT");
  const line = unit.lines.find((item) => item.id === record.lineId);
  need(line && line.page === record.page, "SOURCE_PROGRESS_LINE");
  return Object.freeze({ ...record });
}
function makeProgress(manifest2, unit, line, nowISO) {
  const descriptor = verifiedUnit(manifest2, unit);
  need(line && unit.lines.some((item) => item === line), "SOURCE_PROGRESS_LINE");
  return validateProgress({
    schema: "glp.sikh-reader.progress.v1",
    collectionId: manifest2.collectionId,
    editionId: manifest2.editionId,
    unitId: unit.id,
    unitSha256: descriptor.sha256,
    lineId: line.id,
    page: line.page,
    updatedAt: nowISO
  }, manifest2, unit);
}

// collections/source-reader/reader.mjs
var $ = (id) => document.getElementById(id);
var root = document.documentElement;
var binding = SOURCES[root.dataset.collection];
var status = $("source-status"), groups = $("source-groups");
var pageInput = $("source-page"), sectionInput = $("source-section");
var previous = $("source-previous"), next = $("source-next");
var save = $("source-save-place"), resume = $("source-resume");
var progressStatus = $("source-progress-status");
var controls = [...document.querySelectorAll("[data-source-control]")];
var manifest, route, sequence = 0, progressSequence = 0, loadedUnits = [], savedRecord = null;
var chunkCache = /* @__PURE__ */ new Map();
function state(value, message) {
  root.dataset.sourceState = value;
  status.textContent = message;
  groups.setAttribute("aria-busy", String(value === "loading"));
  for (const control of controls) control.disabled = !manifest || value === "loading";
  save.disabled = value !== "ready";
  resume.disabled = !savedRecord || value === "loading";
  previous.disabled = value !== "ready" || route.page <= 1;
  next.disabled = value !== "ready" || route.page >= manifest.counts.pages;
}
async function readBounded(url, expectedBytes) {
  const response = await fetch(url, { credentials: "omit", cache: "no-store", redirect: "error" });
  if (!response.ok || response.redirected) throw Error("Source unavailable");
  const advertised = response.headers.get("content-length");
  const encoding = response.headers.get("content-encoding");
  if ((!encoding || encoding === "identity") && advertised !== null && (!/^\d+$/.test(advertised) || Number(advertised) !== expectedBytes)) throw Error("Source length mismatch");
  const reader = response.body?.getReader();
  if (!reader) throw Error("Source stream unavailable");
  const bytes = new Uint8Array(expectedBytes);
  let offset = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (offset + value.length > expectedBytes) throw Error("Source exceeds bound");
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
  if (offset !== expectedBytes) throw Error("Source incomplete");
  return bytes;
}
async function chunkFor(descriptor) {
  if (chunkCache.has(descriptor.chunkId)) return chunkCache.get(descriptor.chunkId);
  const info = manifest.chunks.find((chunk) => chunk.id === descriptor.chunkId);
  const base = new URL(binding.path, import.meta.url);
  const request = readBounded(new URL(info.path, base), info.bytes).then((bytes) => verifyChunk(bytes, info, manifest));
  chunkCache.set(info.id, request);
  try {
    const chunk = await request;
    while (chunkCache.size > 12) chunkCache.delete(chunkCache.keys().next().value);
    return chunk;
  } catch (error) {
    if (chunkCache.get(info.id) === request) chunkCache.delete(info.id);
    throw error;
  }
}
async function unitFor(descriptor) {
  const chunk = await chunkFor(descriptor);
  const unit = chunk.units.find((value) => value.id === descriptor.id);
  if (!unit) throw Error("Owning source group unavailable");
  return unit;
}
function node(tag, className, text2) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text2 !== void 0) element.textContent = text2;
  return element;
}
function renderUnit(unit, requestedPage) {
  const descriptor = manifest.units.find((value) => value.id === unit.id);
  const section = manifest.sections.find((value) => value.id === unit.sectionId);
  const article = node("article", "source-group");
  article.dataset.groupId = unit.id;
  const heading = node("h2", "group-heading", section.name.Latn);
  article.append(heading);
  const first = descriptor.pages[0], last = descriptor.pages.at(-1);
  article.append(node("p", "group-context", `${binding.locator} ${first}${first === last ? "" : "–" + last} · Complete source group · ${unit.lines.length} lines`));
  if (descriptor.pages.length > 1) article.append(node("p", "group-boundary", "This source group continues across page boundaries. All of its lines are shown together."));
  const text2 = node("div", "source-lines");
  for (const line of unit.lines) {
    const row = node("div", "source-line");
    row.dataset.requestedPage = String(line.page === requestedPage);
    const original = node("p", "gurmukhi", line.text);
    original.lang = "pa-Guru";
    original.tabIndex = -1;
    original.dataset.sourceLineId = line.id;
    original.dataset.sourcePage = String(line.page);
    const locator = node("span", "line-locator", `${binding.locator} ${line.page}${line.printedLine === null ? "" : " · line " + line.printedLine}`);
    row.append(original, locator);
    text2.append(row);
  }
  article.append(text2);
  const attribution = manifest.authors.find((value) => value.id === unit.authorId);
  if (attribution) {
    const detail = node("details", "source-attribution");
    detail.dataset.sourceAuthorId = unit.authorId;
    detail.append(node("summary", "", "Source attribution"));
    detail.append(node("p", "", `${attribution.name.Latn} — as recorded by this digital source. This metadata is not a separate historical authorship finding.`));
    article.append(detail);
  }
  return article;
}
function refuse(message) {
  groups.replaceChildren();
  loadedUnits = [];
  route = null;
  $("source-page-label").textContent = "Reading unavailable";
  state("refused", message);
}
async function show(search, { scroll = false } = {}) {
  const current = ++sequence;
  groups.replaceChildren();
  loadedUnits = [];
  route = null;
  state("loading", "Checking the complete source groups for this reading…");
  try {
    const requested = parseRoute(search, manifest);
    const descriptors = unitsForPage(manifest, requested.page);
    const units2 = await Promise.all(descriptors.map(unitFor));
    if (current !== sequence) return;
    const focusUnit = requested.unitId ? units2.find((unit) => unit.id === requested.unitId) : null;
    if (focusUnit) lineForRoute(manifest, requested, focusUnit);
    const fragment = document.createDocumentFragment();
    for (const unit of units2) fragment.append(renderUnit(unit, requested.page));
    groups.replaceChildren(fragment);
    loadedUnits = units2;
    route = requested;
    pageInput.value = String(route.page);
    sectionInput.value = (focusUnit || units2[0]).sectionId;
    $("source-page-label").textContent = `${binding.locator} ${route.page} of ${manifest.counts.pages}`;
    document.title = `${binding.locator} ${route.page} · ${binding.title} · Gurbani Learning Library`;
    state("ready", `${units2.length} complete source ${units2.length === 1 ? "group" : "groups"}. Page labels follow the named digital edition.`);
    if (scroll || requested.lineId || requested.unitId) {
      const anchor = requested.lineId ? [...groups.querySelectorAll("[data-source-line-id]")].find((element) => element.dataset.sourceLineId === requested.lineId) : [...groups.querySelectorAll("[data-source-line-id]")].find((element) => Number(element.dataset.sourcePage) === route.page && (!requested.unitId || element.closest("[data-group-id]").dataset.groupId === requested.unitId));
      if (anchor) {
        anchor.scrollIntoView({ block: "start" });
        anchor.focus({ preventScroll: true });
      }
    }
  } catch {
    if (current !== sequence) return;
    refuse("This reading could not be verified. Check the page number and your connection, then choose Go. No partial source text is shown.");
  }
}
async function navigate(search) {
  try {
    const requested = parseRoute(search, manifest);
    const nextURL = new URL(location.href);
    nextURL.search = formatRoute(requested);
    nextURL.hash = "";
    if (nextURL.href !== location.href) history.pushState(null, "", nextURL);
    await show(nextURL.search, { scroll: true });
  } catch {
    ++sequence;
    refuse("That page or source location is not available in this edition. Enter a valid page number and choose Go.");
  }
}
async function loadSavedPlace() {
  const current = ++progressSequence;
  savedRecord = null;
  resume.disabled = true;
  try {
    const raw = localStorage.getItem(progressKey(manifest));
    if (raw === null) {
      progressStatus.textContent = "Save a place when you want to return to a line on this device.";
      return;
    }
    if (raw.length > 4096) throw Error("Saved record exceeds bound");
    const record = JSON.parse(raw), descriptor = progressUnit(record, manifest);
    const unit = await unitFor(descriptor);
    validateProgress(record, manifest, unit);
    if (current !== progressSequence) return;
    savedRecord = record;
    progressStatus.textContent = `Saved place: ${binding.locator} ${record.page}. Resume opens the same source line.`;
    resume.disabled = root.dataset.sourceState === "loading";
  } catch {
    if (current !== progressSequence) return;
    progressStatus.textContent = "The saved place cannot be matched to this edition. It has been kept unchanged. You can continue reading or explicitly save a new place.";
  }
}
$("source-page-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (manifest) void navigate("?page=" + encodeURIComponent(pageInput.value));
});
previous.addEventListener("click", () => {
  if (route) void navigate("?page=" + (route.page - 1));
});
next.addEventListener("click", () => {
  if (route) void navigate("?page=" + (route.page + 1));
});
sectionInput.addEventListener("change", () => {
  if (!manifest) return;
  const unit = manifest.units.find((value) => value.sectionId === sectionInput.value);
  if (unit) void navigate(formatRoute({ page: unit.pages[0], unitId: unit.id, lineId: null }));
});
window.addEventListener("popstate", () => {
  if (manifest) void show(location.search, { scroll: true });
});
save.addEventListener("click", () => {
  if (!route || root.dataset.sourceState !== "ready") return;
  try {
    const elements = [...groups.querySelectorAll("[data-source-line-id]")];
    const top = Math.max(0, $("source-reading-actions").getBoundingClientRect().bottom);
    const visible = elements.find((element) => {
      const rect = element.getBoundingClientRect();
      return rect.bottom > top && rect.top < innerHeight;
    });
    const anchor = visible || elements.find((element) => element.dataset.sourceLineId === route.lineId) || elements.find((element) => Number(element.dataset.sourcePage) === route.page);
    const unit = loadedUnits.find((value) => value.id === anchor.closest("[data-group-id]").dataset.groupId);
    const line = unit.lines.find((value) => value.id === anchor.dataset.sourceLineId);
    const record = makeProgress(manifest, unit, line, (/* @__PURE__ */ new Date()).toISOString());
    localStorage.setItem(progressKey(manifest), JSON.stringify(record));
    ++progressSequence;
    savedRecord = record;
    resume.disabled = false;
    progressStatus.textContent = `Place saved at ${binding.locator} ${record.page} on this device.`;
  } catch {
    progressStatus.textContent = "Your place could not be saved on this device. Reading is still available.";
  }
});
resume.addEventListener("click", async () => {
  if (!savedRecord || !manifest) return;
  const record = savedRecord, navigationAtStart = sequence, progressAtStart = progressSequence;
  const stillCurrent = () => navigationAtStart === sequence && progressAtStart === progressSequence && savedRecord === record;
  try {
    const unit = await unitFor(progressUnit(record, manifest));
    validateProgress(record, manifest, unit);
    if (!stillCurrent()) return;
    await navigate(formatRoute({ page: record.page, unitId: record.unitId, lineId: record.lineId }));
  } catch {
    if (!stillCurrent()) return;
    savedRecord = null;
    resume.disabled = true;
    progressStatus.textContent = "This saved source line is unavailable. The stored record has been kept unchanged.";
  }
});
$("source-theme").addEventListener("click", (event) => {
  const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  root.dataset.theme = current === "dark" ? "light" : "dark";
  event.currentTarget.setAttribute("aria-pressed", String(root.dataset.theme === "dark"));
  event.currentTarget.textContent = root.dataset.theme === "dark" ? "Day appearance" : "Night appearance";
});
$("source-size").addEventListener("change", (event) => {
  root.dataset.size = event.target.value;
});
async function start() {
  state("loading", "Opening the named digital edition…");
  try {
    if (!binding) throw Error("Unknown collection");
    manifest = await verifyManifest(await readBounded(new URL(binding.path, import.meta.url), binding.bytes), binding);
    for (const section of manifest.sections) {
      const option = node("option", "", section.name.Latn);
      option.value = section.id;
      sectionInput.append(option);
    }
    pageInput.setAttribute("aria-label", binding.locator + " number");
    await show(location.search);
    await loadSavedPlace();
  } catch {
    refuse("This edition could not be opened and checked. Reconnect and reload to try again. No source text has been displayed.");
  }
}
void start();
