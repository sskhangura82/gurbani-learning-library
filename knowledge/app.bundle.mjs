// knowledge/source-lock.mjs
var SCRIPTURE_SHA256 = "cf5b6e72f1cfaad9180d41f4214081cb3dc795644309696d8aba91f3ede64d7b";

// knowledge/registry.mjs
var need = (ok, message) => {
  if (!ok) throw Error(message);
};
var utf8 = new TextEncoder(), decode = new TextDecoder("utf-8", { fatal: true });
async function sha256(value) {
  const bytes = typeof value === "string" ? utf8.encode(value) : value;
  const result2 = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(result2), (x) => x.toString(16).padStart(2, "0")).join("");
}
var digestShape = (s) => typeof s === "string" && /^[a-f0-9]{64}$/.test(s);
function unique(items) {
  need(Array.isArray(items), "Registry array missing");
  const map = /* @__PURE__ */ new Map();
  for (const x of items) {
    need(typeof x?.id === "string" && !map.has(x.id), "Duplicate registry identity");
    map.set(x.id, x);
  }
  return map;
}
function passagePayload(p, lines) {
  return JSON.stringify([p.id, p.authorId, p.compositionId, p.raagId, p.pauriNumber, p.salokPosition, p.angStart, p.angEnd, lines.map((o) => [o.id, o.textSha256])]);
}
function exactBindings(bindings, ids, map, field) {
  need(Array.isArray(bindings) && bindings.length === ids.length, "Source bindings missing");
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i], b = bindings[i];
    need(b?.id === id && b.sha256 === map.get(id)?.[field] && digestShape(b.sha256), "Source binding stale or wrong: " + id);
  }
}
async function verifyScripture(bytes) {
  need(await sha256(bytes) === SCRIPTURE_SHA256, "Independent scripture digest mismatch");
  const s = JSON.parse(decode.decode(bytes));
  need(s.schema === "glp.scripture.pilot.v1" && s.status === "DIGITAL_SOURCE_DRAFT" && s.edition?.humanCollated === false, "Invalid scripture status");
  const passages = unique(s.passages), lines = unique(s.occurrences), taxonomy = unique(s.sourceNodes), used = /* @__PURE__ */ new Set();
  need(s.sourceNodes.every((n) => ["collection", "author", "raag", "composition"].includes(n.type)), "Invalid source taxonomy");
  const typed = (id, type) => taxonomy.get(id)?.type === type;
  need(typed(s.edition.collectionId, "collection"), "Invalid edition collection");
  need(passages.size === 3 && lines.size === 19, "Pilot source coverage changed");
  for (const p of passages.values()) {
    const ids = p.occurrenceIds;
    need(typed(p.collectionId, "collection") && typed(p.authorId, "author") && typed(p.compositionId, "composition") && (p.raagId === null || typed(p.raagId, "raag")), "Invalid locked source attribution");
    need(p.type === "passage" && p.review === "DIGITAL_SOURCE_DRAFT" && Array.isArray(ids) && ids.length === p.expectedOccurrenceCount && ids.includes(p.focusId) && ids.includes(p.incipitId), "Incomplete passage");
    const expectedId = p.pauriNumber === null ? "sggs.kabir.salok" + String(p.salokPosition).padStart(3, "0") : "sggs.asa-di-vaar.pauri" + String(p.pauriNumber).padStart(3, "0") + ".salok" + String(p.salokPosition).padStart(2, "0");
    need(p.id === expectedId && p.number === p.salokPosition, "Structural passage identity mismatch");
    let verse = 0, prior = null;
    const rows = [];
    for (const id of ids) {
      const o = lines.get(id);
      need(o && !used.has(id) && o.passageId === p.id && o.editionId === s.edition.id, "Invalid occurrence membership");
      need(o.ang >= p.angStart && o.ang <= p.angEnd && o.sourceBlob === s.sourceWitnesses[String(o.ang)]?.gitBlob && o.sourcePath === s.sourceWitnesses[String(o.ang)]?.path, "Invalid edition locator");
      if (prior) need(o.ang > prior.ang || o.ang === prior.ang && o.ordinal > prior.ordinal, "Source order mismatch");
      prior = o;
      const heading = o.kind === "heading";
      if (!heading) verse++;
      need(heading ? rows.length === 0 && o.verseNumber === null && id === p.id + ".heading01" : o.kind === "verse" && o.verseNumber === verse && id === p.id + ".line" + String(verse).padStart(2, "0"), "Invalid logical line identity");
      need(typeof o.text === "string" && o.text.length > 0 && await sha256(o.text) === o.textSha256, "Line fingerprint mismatch");
      used.add(id);
      rows.push(o);
    }
    need(rows.find((o) => o.kind === "verse")?.id === p.incipitId && await sha256(passagePayload(p, rows)) === p.passageSha256, "Passage fingerprint mismatch");
  }
  need(used.size === lines.size, "Unbound source row");
  need(Object.keys(s.legacyOccurrenceIds).length === 19 && new Set(Object.values(s.legacyOccurrenceIds)).size === 19, "Incomplete migration crosswalk");
  for (const id of Object.values(s.legacyOccurrenceIds)) need(lines.has(id), "Unknown legacy line target");
  for (const id of Object.values(s.legacyPassageIds)) need(passages.has(id), "Unknown legacy passage target");
  return s;
}
function editorialComparable(value) {
  return value.normalize("NFKC").replace(/[\p{Cf}\p{Default_Ignorable_Code_Point}]/gu, "").replace(/[੦-੯]/gu, (c) => String(c.codePointAt(0) - 2662));
}
function titleSignature(value) {
  return editorialComparable(value).replace(/[\p{P}\p{Z}\s]/gu, "");
}
function validateEditorialText(value, sourceSignatures, field, { wordForm = false } = {}) {
  need(typeof value === "string" && value.trim().length > 0, "INVALID_EDITORIAL_TITLE: expected nonempty text in " + field);
  const text = editorialComparable(value), key = titleSignature(value);
  need(key.length > 0, "INVALID_EDITORIAL_TITLE: expected visible text in " + field);
  const heading = /(?:ੴ|(?:ਸਲੋਕ(?:ੁ|ਾ)?[\p{P}\p{Z}\s]*)?(?:ਮਹਲਾ|ਮਃ)[\p{P}\p{Z}\s]*[0-9]+|(?<![\p{L}\p{M}\p{N}])ਮ[\p{P}\p{Z}\s]*[0-9]+|(?:ਪਉੜੀ|ਰਹਾਉ)[\p{P}\p{Z}\s]*[0-9]+|(?:ਸਲੋਕ(?:ੁ|ਾ)?|ਪਉੜੀ|ਰਹਾਉ)[\p{Z}\s]*[।॥])/u;
  const bare = /^(?:ਸਲੋਕ(?:ੁ|ਾ)?|ਪਉੜੀ|ਰਹਾਉ)$/u;
  const numberedUnit = /[।॥][\p{P}\p{Z}\s]*[0-9]+[\p{P}\p{Z}\s]*[।॥]/u;
  const copiedLine = [...sourceSignatures].some((line) => key.includes(line));
  need(
    !copiedLine && !heading.test(text) && !numberedUnit.test(text) && (!bare.test(key) || wordForm),
    "EDITORIAL_TITLE_ATTRIBUTION: original text or scripture heading in " + field
  );
}
function validateAliases(aliases, sourceSignatures, field, forms = /* @__PURE__ */ new Set()) {
  if (aliases === void 0) return;
  need(Array.isArray(aliases), "INVALID_EDITORIAL_TITLE: aliases must be an array in " + field);
  for (const value of aliases) validateEditorialText(value, sourceSignatures, field, { wordForm: forms.has(value) });
}
function validateNodeText(n, sourceSignatures, lines) {
  need(!["editorialTitle", "editorialPa", "editorialAliases"].some((key) => Object.hasOwn(n, key)), "Editorial node attempts to define joined passage metadata");
  const forms = /* @__PURE__ */ new Set();
  if (n.type === "word") {
    need(Array.isArray(n.senses), "Invalid vocabulary senses");
    for (const sense of n.senses) {
      need(
        typeof sense.form === "string" && Array.isArray(sense.occurrenceIds) && sense.occurrenceIds.length > 0 && sense.occurrenceIds.every((id) => lines.get(id)?.text.split(/\s+/u).includes(sense.form)),
        "Unbound dictionary form"
      );
      forms.add(sense.form);
      for (const language of ["en", "pa"]) validateEditorialText(sense[language], sourceSignatures, n.id + ".senses." + language);
    }
  }
  validateEditorialText(n.title, sourceSignatures, n.id + ".title", { wordForm: forms.has(n.title) });
  if (n.pa !== void 0) validateEditorialText(n.pa, sourceSignatures, n.id + ".pa", { wordForm: forms.has(n.pa) });
  validateAliases(n.aliases, sourceSignatures, n.id + ".aliases", forms);
  if (n.type === "lesson") for (const depth2 of ["simple", "detailed", "deep"]) {
    for (const language of ["en", "pa"]) validateEditorialText(n[depth2]?.[language], sourceSignatures, n.id + "." + depth2 + "." + language);
  }
  for (const field of ["citation", "discipline"]) if (n[field] !== void 0) validateEditorialText(n[field], sourceSignatures, n.id + "." + field);
}
async function loadKnowledge(sourceBytes, teachingBytes, teachingPin) {
  const s = await verifyScripture(sourceBytes);
  need(await sha256(teachingBytes) === teachingPin, "Editorial digest mismatch");
  const e = JSON.parse(decode.decode(teachingBytes));
  need(e.schema === "glp.knowledge.editorial.v2" && e.status === "NONPUBLISHING_DRAFT" && !Object.hasOwn(e, "occurrences"), "Invalid editorial pack");
  const passages = unique(s.passages), lines = unique(s.occurrences);
  need(e.nodes.every((n) => ["concept", "word", "study", "lesson", "course"].includes(n.type)), "Editorial pack attempts to define scripture or its attribution");
  const sourceSignatures = new Set(s.occurrences.map((o) => titleSignature(o.text)));
  const descriptions = /* @__PURE__ */ new Map();
  for (const d of e.passageDescriptions) {
    need(passages.has(d.passageId) && !descriptions.has(d.passageId) && Object.keys(d).every((k) => ["passageId", "title", "pa", "aliases"].includes(k)), "Invalid editorial passage description");
    validateEditorialText(d.title, sourceSignatures, d.passageId + ".title");
    validateEditorialText(d.pa, sourceSignatures, d.passageId + ".pa");
    validateAliases(d.aliases, sourceSignatures, d.passageId + ".aliases");
    descriptions.set(d.passageId, d);
  }
  need(descriptions.size === passages.size, "Missing passage description");
  for (const n of e.nodes) {
    validateNodeText(n, sourceSignatures, lines);
    if (n.type === "lesson") exactBindings(n.sourceBindings, n.sourcePassageIds, passages, "passageSha256");
    if (n.type === "word") for (const sense of n.senses) exactBindings(sense.sourceBindings, sense.occurrenceIds, lines, "textSha256");
  }
  for (const edge of e.edges) {
    for (const field of ["reason", "similarity", "difference"]) if (edge[field] !== void 0) validateEditorialText(edge[field], sourceSignatures, edge.id + "." + field);
    if (edge.refs) exactBindings(edge.sourceBindings, edge.refs, passages, "passageSha256");
  }
  const sourceNodes = s.passages.map((p) => {
    const d = descriptions.get(p.id);
    return { ...p, title: lines.get(p.incipitId).text, editorialTitle: d.title, editorialPa: d.pa, editorialAliases: d.aliases || [] };
  });
  const { passageDescriptions, ...rest } = e;
  return { ...rest, schema: "glp.knowledge.v1", nodes: [...e.nodes, ...s.sourceNodes, s.edition, ...sourceNodes], occurrences: s.occurrences, legacyPassageIds: s.legacyPassageIds, legacyOccurrenceIds: s.legacyOccurrenceIds };
}

// knowledge/json.mjs
var MAX_TEXT_LENGTH = 2621440;
var MAX_DEPTH = 40;
var whitespace = (character) => character === " " || character === "	" || character === "\n" || character === "\r";
function parseStrictJSON(text) {
  if (typeof text !== "string") throw new TypeError("JSON input must be a string.");
  if (text.length > MAX_TEXT_LENGTH) throw new RangeError("JSON input exceeds the text limit.");
  let position = 0;
  const syntax = (message) => {
    throw new SyntaxError(message + " at character " + position + ".");
  };
  const skipWhitespace = () => {
    while (whitespace(text[position])) position++;
  };
  function stringToken(decode2) {
    if (text[position] !== '"') syntax("Expected a JSON string");
    const start2 = position++;
    while (position < text.length) {
      const character = text[position++];
      if (character === '"') {
        if (!decode2) return;
        try {
          return JSON.parse(text.slice(start2, position));
        } catch {
          syntax("Malformed JSON string");
        }
      }
      if (character.charCodeAt(0) < 32) syntax("Unescaped control character in JSON string");
      if (character === "\\") {
        if (position >= text.length) syntax("Unterminated JSON escape");
        position++;
      }
    }
    syntax("Unterminated JSON string");
  }
  function primitive() {
    if (!"-0123456789tfn".includes(text[position] || "\0")) syntax("Expected a JSON value");
    const start2 = position;
    while (position < text.length && !whitespace(text[position]) && !",]}".includes(text[position])) position++;
    const token = text.slice(start2, position);
    if (token.includes("{") || token.includes("[") || token.includes('"')) syntax("Malformed JSON primitive");
    try {
      JSON.parse(token);
    } catch {
      syntax("Malformed JSON primitive");
    }
  }
  function value(depth2) {
    skipWhitespace();
    const character = text[position];
    if (character === '"') {
      stringToken(false);
      return;
    }
    if (character !== "{" && character !== "[") {
      primitive();
      return;
    }
    if (depth2 >= MAX_DEPTH) throw new RangeError("JSON nesting exceeds the depth limit.");
    const object = character === "{", closing = object ? "}" : "]";
    position++;
    skipWhitespace();
    if (text[position] === closing) {
      position++;
      return;
    }
    const keys = object ? /* @__PURE__ */ new Set() : null;
    while (true) {
      if (object) {
        const key = stringToken(true);
        if (keys.has(key)) syntax("Duplicate JSON object key");
        keys.add(key);
        skipWhitespace();
        if (text[position] !== ":") syntax("Expected a colon after JSON object key");
        position++;
      }
      value(depth2 + 1);
      skipWhitespace();
      if (text[position] === closing) {
        position++;
        return;
      }
      if (text[position] !== ",") syntax("Expected a JSON separator or closing delimiter");
      position++;
      skipWhitespace();
    }
  }
  value(0);
  skipWhitespace();
  if (position !== text.length) syntax("Unexpected trailing JSON content");
  try {
    return JSON.parse(text);
  } catch {
    syntax("Malformed JSON");
  }
}

// knowledge/learning.mjs
var LEARNING_KEY = "glp001.knowledge.learning.v1";
var EXPORT_FILENAME = "Knowledge-learning.json";
var FORMAT = "glp-knowledge-learning";
var LIMITS = Object.freeze({ records: 100, question: 4e3, reflection: 12e3, store: 5e5 });
var JOURNEY_BINDING = Object.freeze({
  journeyId: "journey.haumai.v1",
  passageId: "sggs.asa-di-vaar.pauri007.salok02",
  editionId: "edition.sggs.opengranth-34d2a7c",
  passageSha256: "a4df72d9dc683a83f229048df86ef66a9ba2df9d63253b3b3de7a9748f51f306",
  lessonId: "lesson.haumai.r1",
  lessonRevision: 1
});
var fields = Object.keys(JOURNEY_BINDING), HEX = /^[a-f0-9]{64}$/, ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,159}$/;
var plain = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
var exact = (x, required, optional = []) => plain(x) && required.every((k) => Object.hasOwn(x, k)) && Object.keys(x).every((k) => required.includes(k) || optional.includes(k));
var require2 = (ok, message) => {
  if (!ok) throw Error(message);
};
var clone = (x) => structuredClone(x);
var freeze = (x) => {
  if (x && typeof x === "object") {
    Object.values(x).forEach(freeze);
    Object.freeze(x);
  }
  return x;
};
var preserved = " Your existing record has been preserved.";
var fail = (status2, message) => ({ ok: false, status: status2, message });
var result = (store, extra = {}) => {
  const snapshot = freeze(clone(store));
  return { ok: true, store: snapshot, revision: snapshot.revision, records: snapshot.records, ...extra };
};
var empty = () => ({ format: FORMAT, version: 1, revision: 0, records: [] });
var signature = (b) => JSON.stringify(fields.map((k) => b[k]));
function sameBinding(a, b) {
  return plain(a) && plain(b) && signature(a) === signature(b);
}
function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = /* @__PURE__ */ new Date(value + "T12:00:00.000Z");
  return Number.isFinite(+d) && d.toISOString().slice(0, 10) === value;
}
function localDate(now = /* @__PURE__ */ new Date()) {
  const d = new Date(now);
  if (!Number.isFinite(+d)) throw Error("The device date is unavailable.");
  return String(d.getFullYear()).padStart(4, "0") + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function weekFrom(date = localDate()) {
  require2(validDate(date), "The chosen date is invalid.");
  const d = /* @__PURE__ */ new Date(date + "T12:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString().slice(0, 10);
}
function returnReady(record, date = localDate()) {
  return validDate(record.returnOn) && validDate(date) && record.returnOn <= date;
}
function validTime(value) {
  return typeof value === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}
function binding(value) {
  require2(exact(value, fields), "The source binding is incomplete or unsupported.");
  for (const name of ["journeyId", "passageId", "editionId", "lessonId"]) require2(typeof value[name] === "string" && ID.test(value[name]), "The source identity is invalid.");
  require2(HEX.test(value.passageSha256) && Number.isSafeInteger(value.lessonRevision) && value.lessonRevision > 0, "The source or lesson revision is invalid.");
  return value;
}
function textFields(record) {
  require2(typeof record.question === "string" && record.question.length <= LIMITS.question, "The question is too long or unsupported.");
  for (const k of ["initialReflection", "laterReflection"]) require2(typeof record[k] === "string" && record[k].length <= LIMITS.reflection, "The reflection is too long or unsupported.");
  require2(record.returnOn === null || validDate(record.returnOn), "The return date is invalid.");
}
function recordValid(record) {
  require2(exact(record, ["id", "binding", "question", "initialReflection", "laterReflection", "returnOn", "createdAt", "updatedAt"], ["conflictOf"]), "The saved note has an unsupported format.");
  require2(typeof record.id === "string" && ID.test(record.id), "The note identity is invalid.");
  if (Object.hasOwn(record, "conflictOf")) require2(typeof record.conflictOf === "string" && ID.test(record.conflictOf) && record.conflictOf !== record.id, "The conflict identity is invalid.");
  binding(record.binding);
  textFields(record);
  require2(validTime(record.createdAt) && validTime(record.updatedAt) && record.createdAt <= record.updatedAt, "The saved note date is invalid.");
}
function validateLearning(store) {
  require2(exact(store, ["format", "version", "revision", "records"]) && store.format === FORMAT && store.version === 1, "This is not a supported Knowledge learning backup.");
  require2(Number.isSafeInteger(store.revision) && store.revision >= 0, "The revision is invalid.");
  require2(Array.isArray(store.records) && store.records.length <= LIMITS.records, "There are too many saved notes.");
  const ids = /* @__PURE__ */ new Set();
  for (const record of store.records) {
    recordValid(record);
    require2(!ids.has(record.id), "The backup repeats a note identity.");
    ids.add(record.id);
  }
  require2(JSON.stringify(store).length <= LIMITS.store, "The learning record is too large. Nothing was shortened.");
  return store;
}
function storageOf(storage) {
  try {
    return storage ?? globalThis.localStorage;
  } catch {
    return null;
  }
}
function locksOf(locks) {
  try {
    return locks ?? globalThis.navigator?.locks;
  } catch {
    return null;
  }
}
function loadLearning({ storage } = {}) {
  const target = storageOf(storage);
  let raw;
  try {
    if (!target?.getItem) throw Error();
    raw = target.getItem(LEARNING_KEY);
  } catch {
    return fail("STORAGE_UNAVAILABLE", "Private notes are unavailable in this browser." + preserved);
  }
  if (raw === null) return result(empty());
  try {
    require2(typeof raw === "string" && raw.length <= LIMITS.store, "oversize");
    return result(validateLearning(parseStrictJSON(raw)));
  } catch {
    return fail("RECOVERY_REQUIRED", "The saved Knowledge learning record needs recovery. Keep the original backup; nothing has been reset." + preserved);
  }
}
function nextId(records, factory = () => globalThis.crypto.randomUUID()) {
  const used = new Set(records.map((r) => r.id));
  for (let n = 0; n < 20; n++) {
    const id = factory();
    if (typeof id === "string" && ID.test(id) && !used.has(id)) return id;
  }
  throw Error("A fresh note identity could not be created.");
}
function commit(target, store, extra) {
  let text;
  try {
    validateLearning(store);
    text = JSON.stringify(store);
  } catch (error) {
    return fail("SIZE_OR_FORMAT_LIMIT", error.message + preserved);
  }
  try {
    target.setItem(LEARNING_KEY, text);
  } catch {
    return fail("STORAGE_REFUSED", "The browser could not save this learning record. Keep or export your unsaved text before trying again." + preserved);
  }
  return result(store, extra);
}
async function locked({ storage, locks }, work) {
  const target = storageOf(storage), manager = locksOf(locks);
  if (!target?.getItem || !target?.setItem) return fail("STORAGE_UNAVAILABLE", "Private notes cannot be saved in this browser." + preserved);
  if (!manager?.request) return fail("LOCK_UNAVAILABLE", "This browser cannot safely coordinate private note edits between tabs. Saving and importing are unavailable; existing notes remain readable and exportable." + preserved);
  try {
    return await manager.request(LEARNING_KEY, { mode: "exclusive" }, () => work(target));
  } catch {
    return fail("SAVE_UNAVAILABLE", "The private learning operation could not finish. Keep your unsaved text." + preserved);
  }
}
function journeyAvailable(index2) {
  const p = index2?.nodes?.get(JOURNEY_BINDING.passageId), l = index2?.nodes?.get(JOURNEY_BINDING.lessonId);
  return Boolean(p?.type === "passage" && p.editionId === JOURNEY_BINDING.editionId && p.passageSha256 === JOURNEY_BINDING.passageSha256 && p.expectedOccurrenceCount === 8 && p.occurrenceIds?.length === 8 && p.occurrenceIds.every((id) => index2.occ.get(id)?.passageId === p.id) && l?.revision === JOURNEY_BINDING.lessonRevision && l.sourceBindings?.some((b) => b.id === p.id && b.sha256 === p.passageSha256));
}
async function saveLearning({ storage, locks, record, baseRevision, now = () => Date.now(), idFactory } = {}) {
  try {
    require2(exact(record, ["binding", "question", "initialReflection", "laterReflection", "returnOn"], ["id"]), "The new note has an unsupported format.");
    binding(record.binding);
    textFields(record);
    require2(sameBinding(record.binding, JOURNEY_BINDING), "This note belongs to an unavailable source or lesson revision. It can still be read and exported.");
    require2(Number.isSafeInteger(baseRevision) && baseRevision >= 0, "Reload the saved notes before editing.");
    if (Object.hasOwn(record, "id")) require2(typeof record.id === "string" && ID.test(record.id), "The note identity is invalid.");
  } catch (error) {
    return fail("INVALID_NOTE", error.message + preserved);
  }
  return locked({ storage, locks }, (target) => {
    const loaded = loadLearning({ storage: target });
    if (!loaded.ok) return loaded;
    const store = clone(loaded.store), existing = record.id ? store.records.find((r) => r.id === record.id) : null;
    if (record.id && !existing) return fail("NOTE_NOT_FOUND", "The original saved note is unavailable. Keep this text before reopening Saved." + preserved);
    if (existing && !sameBinding(existing.binding, record.binding)) return fail("SOURCE_MISMATCH", "A note cannot move to another source or lesson revision." + preserved);
    if (existing && (existing.question !== record.question || existing.initialReflection !== record.initialReflection)) return fail("EARLIER_NOTE_PROTECTED", "Your earlier question and reflection stay as originally saved. Start another note for a new reflection." + preserved);
    if (!existing && record.laterReflection !== "") return fail("INVALID_NOTE", "Save the first reflection before adding a later one." + preserved);
    if (!record.question.trim() && !record.initialReflection.trim() && !record.laterReflection.trim()) return fail("EMPTY_NOTE", "Write a question or reflection before saving." + preserved);
    if (existing && existing.laterReflection === record.laterReflection && existing.returnOn === record.returnOn) return result(store, { status: "UNCHANGED", savedRecord: freeze(clone(existing)), message: "This reflection is already saved." });
    const date = new Date(typeof now === "function" ? now() : now).toISOString();
    if (existing && date < existing.updatedAt) return fail("INVALID_CLOCK", "The device clock predates the saved note. Keep your unsaved text." + preserved);
    const conflict = Boolean(existing && baseRevision !== store.revision);
    const saved = { id: existing && !conflict ? existing.id : nextId(store.records, idFactory), binding: clone(record.binding), question: record.question, initialReflection: record.initialReflection, laterReflection: record.laterReflection, returnOn: record.returnOn, createdAt: existing?.createdAt || date, updatedAt: date };
    if (conflict) saved.conflictOf = existing.id;
    else if (existing?.conflictOf) saved.conflictOf = existing.conflictOf;
    if (existing && !conflict) store.records[store.records.findIndex((r) => r.id === existing.id)] = saved;
    else store.records.push(saved);
    store.revision++;
    return commit(target, store, { status: conflict ? "CONFLICT_PRESERVED" : "SAVED", savedRecord: freeze(clone(saved)), message: conflict ? "Another edit was saved first. Both versions have been kept as separate notes." : "Private reflection saved on this device." });
  });
}
var sameVersion = (a, b) => sameBinding(a.binding, b.binding) && ["question", "initialReflection", "laterReflection", "returnOn", "createdAt", "updatedAt"].every((k) => a[k] === b[k]);
var sameRecord = (a, b) => a.id === b.id && a.conflictOf === b.conflictOf && sameVersion(a, b);
function exportLearning({ storage } = {}) {
  const loaded = loadLearning({ storage });
  if (!loaded.ok) return loaded;
  return { ok: true, filename: EXPORT_FILENAME, text: JSON.stringify(loaded.store, null, 2) + "\n", revision: loaded.revision };
}
async function importLearning({ storage, locks, text, idFactory } = {}) {
  let incoming;
  try {
    require2(typeof text === "string" && text.length <= LIMITS.store * 2, "oversize");
    incoming = validateLearning(parseStrictJSON(text));
  } catch {
    return fail("INVALID_IMPORT", "This is not a complete supported Knowledge learning backup. Nothing was imported." + preserved);
  }
  return locked({ storage, locks }, (target) => {
    const loaded = loadLearning({ storage: target });
    if (!loaded.ok) return loaded;
    const store = clone(loaded.store), byId = new Map(store.records.map((r) => [r.id, r])), pending = [];
    let added = 0, conflicts = 0;
    for (const record of incoming.records) {
      const current2 = byId.get(record.id);
      if (!current2) {
        store.records.push(clone(record));
        added++;
      } else if (!sameRecord(current2, record)) pending.push(record);
    }
    for (const record of pending) {
      if (store.records.some((r) => r.conflictOf === record.id && sameVersion(r, record))) continue;
      const saved = clone(record);
      saved.id = nextId([...store.records, ...incoming.records], idFactory);
      saved.conflictOf = record.id;
      store.records.push(saved);
      added++;
      conflicts++;
    }
    if (!added) return result(store, { status: "UNCHANGED", message: "This backup is already present. Your saved notes have not changed." });
    store.revision++;
    return commit(target, store, { status: conflicts ? "CONFLICT_PRESERVED" : "IMPORTED", message: conflicts ? "Backup restored. Conflicting versions were kept as separate notes." : "Knowledge learning backup restored. Existing notes were kept." });
  });
}

// knowledge/journey.mjs
var JOURNEY_ID = JOURNEY_BINDING.journeyId;
var SAVED_ID = "knowledge.saved";
var drafts = /* @__PURE__ */ new Map();
var notice = "";
function showNotice(parent) {
  if (notice) {
    const p = el("p", notice, "note");
    p.setAttribute("role", "status");
    parent.append(p);
    notice = "";
  }
}
var el = (tag, text, cls) => {
  const n = document.createElement(tag);
  if (text !== void 0) n.textContent = text;
  if (cls) n.className = cls;
  return n;
};
var button = (text, fn) => {
  const b = el("button", text);
  b.type = "button";
  b.addEventListener("click", fn);
  return b;
};
var paragraph = (text) => el("p", text, "note");
function download(text, filename, type = "application/json") {
  const url = URL.createObjectURL(new Blob([text], { type })), a = el("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function backups(parent, onImported) {
  const box = el("section", void 0, "private-learning backup-tools");
  box.dataset.privateLearning = "true";
  box.append(el("h3", "Your Knowledge learning backup"), paragraph("This file contains only your private Knowledge questions and reflections. Other readers have their own backups."));
  const status2 = el("p", "", "note");
  status2.setAttribute("role", "status");
  const output = button("Export Knowledge learning", () => {
    const r = exportLearning();
    if (r.ok) {
      download(r.text, r.filename);
      status2.textContent = "Knowledge learning exported. Keep this private file somewhere safe.";
    } else status2.textContent = r.message;
  });
  const label = el("label", "Import Knowledge learning"), input = el("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.id = "journey-import";
  label.htmlFor = input.id;
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;
    input.disabled = true;
    try {
      if (file.size > LIMITS.store * 6) {
        status2.textContent = "This backup is too large. Your existing record has been preserved.";
        return;
      }
      const r = await importLearning({ text: await file.text() });
      status2.textContent = r.message;
      if (r.ok && box.isConnected) {
        notice = r.message;
        onImported?.(r);
      }
    } catch {
      status2.textContent = "The backup could not be read. Your existing record has been preserved.";
    } finally {
      input.disabled = false;
      input.value = "";
    }
  });
  box.append(output, label, input, status2);
  parent.append(box);
  return status2;
}
function source(parent, index2) {
  const p = index2.nodes.get(JOURNEY_BINDING.passageId), box = el("section", void 0, "journey-original");
  box.dataset.contentKind = "scripture";
  box.append(el("h3", "Read the complete source passage"), paragraph("Original Gurbani · pinned digital source · " + index2.nodes.get(p.authorId).title + " · " + index2.nodes.get(p.compositionId).title));
  for (const id of p.occurrenceIds) {
    const o = index2.occ.get(id), line = el("p", o.text, "pankti" + (o.kind === "heading" ? " source-heading" : ""));
    line.lang = "pa";
    line.dataset.occurrence = id;
    box.append(line);
  }
  const a = el("a", "Open the pinned source");
  a.href = p.sourceUrl;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  box.append(paragraph(p.comparison), a);
  parent.append(box);
}
function learningSlots(parent, navigate) {
  const box = el("section", void 0, "journey-review");
  box.dataset.contentKind = "editorial";
  for (const [id, title] of [["explanation", "Qualified explanation"], ["practice", "Gurbani practice guidance"]]) {
    const slot = el("section", void 0, "review-slot");
    slot.dataset.reviewSlot = id;
    slot.dataset.reviewStatus = "AWAITING_QUALIFIED_REVIEW";
    slot.append(el("h3", title), paragraph("Awaiting qualified review. No approved content is available here."));
    box.append(slot);
  }
  const details = el("details");
  details.append(el("summary", "Existing editorial drafts — optional, awaiting qualified review"), paragraph("The existing Haumai draft has an unresolved omission: it does not discuss the complete remedy clause in the source passage. It is not a finished or qualified explanation."), button("Open existing labelled draft", () => navigate({ id: "concept.haumai", depth: "simple" })));
  box.append(details);
  parent.append(box);
}
function comparison(parent, index2) {
  const edge = index2.graph.edges.find((e) => e.id === "edge.24"), study = edge && index2.nodes.get(edge.to);
  if (!edge || !study) return;
  const details = el("details", void 0, "journey-comparison");
  details.dataset.contentKind = "comparison";
  details.setAttribute("aria-label", "Optional comparative study, separate from Gurbani explanation");
  details.append(el("summary", "Optional comparison — editorial draft"), paragraph("This existing comparison is separate from the passage's explanation and practice guidance. Qualified review is pending."), el("h3", study.title), el("p", "Similarity: " + edge.similarity), el("p", "Difference: " + edge.difference));
  const a = el("a", study.citation);
  a.href = study.reference;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  details.append(a);
  parent.append(details);
}
function noteFields(form, record, draft) {
  const inputs = {};
  for (const [key, title] of [["question", "Your question"], ["initialReflection", record ? "Your earlier reflection — kept as saved" : "Your first reflection"], ["laterReflection", "Your later reflection"]]) {
    const label2 = el("label", title), input = el("textarea");
    input.id = "journey-" + key;
    input.rows = key === "question" ? 3 : 6;
    input.maxLength = key === "question" ? LIMITS.question : LIMITS.reflection;
    input.value = draft[key];
    label2.htmlFor = input.id;
    if (record && key !== "laterReflection") input.readOnly = true;
    if (!record && key === "laterReflection") input.disabled = true;
    inputs[key] = input;
    form.append(label2, input);
  }
  const label = el("label", "Optional return date"), date = el("input");
  date.type = "date";
  date.id = "journey-return-date";
  date.value = draft.returnOn || "";
  label.htmlFor = date.id;
  inputs.returnOn = date;
  form.append(label, date, paragraph("Choose a date if you want to revisit your own note. This is a personal reading intention, with no notifications or practice tracking."));
  return inputs;
}
function editor(parent, index2, record, loaded, navigate) {
  const key = record?.id || "new", existing = drafts.get(key);
  const original = { question: record?.question || "", initialReflection: record?.initialReflection || "", laterReflection: record?.laterReflection || "", returnOn: record?.returnOn || null };
  const draft = existing || { ...original, baseRevision: loaded.revision };
  const form = el("form", void 0, "private-learning journey-editor");
  form.dataset.privateLearning = "true";
  form.addEventListener("submit", (e) => e.preventDefault());
  form.append(el("h3", record ? "Return to your own words" : "Your question and reflection"), paragraph("What would you like to understand about this passage? What would you like to remember when you return? Your words stay on this device unless you export them."));
  if (record) {
    if (record.conflictOf) form.append(paragraph("This is a preserved version from a conflicting edit or backup. Both versions remain in Saved."));
    if (returnReady(record)) form.append(paragraph("Your chosen return date has arrived. Your earlier reflection is here whenever you want to revisit it."));
    else if (record.returnOn) form.append(paragraph("Your chosen return date: " + record.returnOn + ". You can revisit this note at any time."));
  }
  const inputs = noteFields(form, record, draft), status2 = el("p", "", "note");
  status2.id = "journey-note-status";
  status2.setAttribute("role", "status");
  const collect = () => ({ question: inputs.question.value, initialReflection: inputs.initialReflection.value, laterReflection: inputs.laterReflection.value, returnOn: inputs.returnOn.value || null });
  const remember = () => {
    const value = collect();
    if (Object.keys(original).every((k) => value[k] === original[k])) drafts.delete(key);
    else drafts.set(key, { ...value, baseRevision: draft.baseRevision });
  };
  Object.values(inputs).forEach((input) => input.addEventListener("input", remember));
  const week = button("Return in a week", () => {
    inputs.returnOn.value = weekFrom(localDate());
    remember();
  });
  const clear = button("No return date", () => {
    inputs.returnOn.value = "";
    remember();
  });
  const save = button(record ? "Save later reflection" : "Save first reflection", async () => {
    const value = collect();
    remember();
    status2.textContent = "Saving your reflection…";
    save.disabled = true;
    week.disabled = true;
    clear.disabled = true;
    Object.values(inputs).forEach((i) => i.disabled = true);
    const r = await saveLearning({ record: { ...record ? { id: record.id } : {}, binding: JOURNEY_BINDING, ...value }, baseRevision: draft.baseRevision });
    status2.textContent = r.message;
    if (r.ok) {
      drafts.delete(key);
      if (form.isConnected) {
        navigate({ id: JOURNEY_ID, note: r.savedRecord.id });
        document.getElementById("journey-note-status").textContent = r.message;
      }
    } else {
      save.disabled = false;
      week.disabled = false;
      clear.disabled = false;
      for (const [k, i] of Object.entries(inputs)) i.disabled = !record && k === "laterReflection";
    }
  });
  const keep = button("Download unsaved text", () => {
    const v = collect();
    download("Private Knowledge reflection\n\nQuestion\n" + v.question + "\n\nEarlier reflection\n" + v.initialReflection + "\n\nLater reflection\n" + v.laterReflection + "\n\nReturn date: " + (v.returnOn || "Not chosen") + "\n", "Knowledge-unsaved-reflection.txt", "text/plain");
  });
  const actions = el("div", void 0, "journey-actions");
  actions.append(week, clear, save, keep);
  form.append(actions, status2);
  parent.append(form);
}
function renderJourney({ parent, index: index2, noteId, navigate }) {
  showNotice(parent);
  parent.append(el("p", "LEARNING MECHANICS · DEVELOPMENT CANDIDATE", "kicker"), el("h2", "Haumai — read, ask, reflect"), paragraph("A source-bound reading and private reflection space. Qualified explanation and practice guidance are still incomplete."));
  const nav = el("div", void 0, "journey-actions");
  nav.append(button("Saved Knowledge learning", () => navigate({ id: SAVED_ID })), button("Start another reflection", () => navigate({ id: JOURNEY_ID, note: "new" })));
  parent.append(nav);
  if (!journeyAvailable(index2)) {
    parent.append(paragraph("This journey's exact source or lesson revision is unavailable. Saved questions and reflections remain readable and exportable."));
    return;
  }
  source(parent, index2);
  learningSlots(parent, navigate);
  const loaded = loadLearning();
  if (!loaded.ok) {
    parent.append(paragraph(loaded.message));
    backups(parent);
    return;
  }
  const bound = loaded.records.filter((r) => sameBinding(r.binding, JOURNEY_BINDING));
  let record = noteId && noteId !== "new" ? loaded.records.find((r) => r.id === noteId) : noteId === "new" ? null : bound.at(-1) || null;
  if (noteId && noteId !== "new" && !record) {
    parent.append(paragraph("This saved note is unavailable. Open Saved Knowledge learning to choose a record."));
  } else if (record && !sameBinding(record.binding, JOURNEY_BINDING)) {
    parent.append(paragraph("This saved note belongs to another source or lesson revision. Open Saved to read or export it; it cannot be moved onto this passage."));
  } else editor(parent, index2, record, loaded, navigate);
  comparison(parent, index2);
  backups(parent, (r) => {
    if (!drafts.size && parent.isConnected) navigate({ id: SAVED_ID });
  });
}
function renderSaved({ parent, index: index2, navigate }) {
  showNotice(parent);
  parent.append(el("p", "PRIVATE LEARNING · ON THIS DEVICE", "kicker"), el("h2", "Saved Knowledge learning"), paragraph("Questions and reflections you chose to save. No practice sessions, scores, or reminders are recorded."), button("Open Haumai reading and reflection", () => navigate({ id: JOURNEY_ID })));
  const loaded = loadLearning();
  if (!loaded.ok) parent.append(paragraph(loaded.message));
  else if (!loaded.records.length) parent.append(paragraph("No Knowledge reflections saved on this device yet."));
  else {
    const list = el("div", void 0, "private-learning");
    list.dataset.privateLearning = "true";
    for (const record of loaded.records) {
      const card = el("section", void 0, "saved-reflection");
      card.dataset.noteId = record.id;
      card.append(el("h3", "Your saved reflection"), paragraph("Saved " + record.createdAt.slice(0, 10)));
      if (record.conflictOf) card.append(paragraph("Preserved conflict version."));
      if (record.returnOn) card.append(paragraph((returnReady(record) ? "Ready to revisit · " : "Chosen return date · ") + record.returnOn));
      for (const [key, title] of [["question", "Your question"], ["initialReflection", "Your earlier reflection"], ["laterReflection", "Your later reflection"]]) {
        card.append(el("h4", title));
        const p = el("p", record[key] || "Nothing written here.", "private-copy");
        card.append(p);
      }
      if (journeyAvailable(index2) && sameBinding(record.binding, JOURNEY_BINDING)) card.append(button("Open this reflection", () => navigate({ id: JOURNEY_ID, note: record.id })));
      else card.append(paragraph("The source or lesson revision for this record is unavailable. Your words remain here and in your export; they have not been attached to a different passage."));
      list.append(card);
    }
    parent.append(list);
  }
  backups(parent, (r) => {
    if (parent.isConnected) navigate({ id: SAVED_ID });
  });
}
if (typeof window !== "undefined") window.addEventListener("beforeunload", (event) => {
  if (drafts.size) {
    event.preventDefault();
    event.returnValue = "";
  }
});

// knowledge/kinds.mjs
var editorialNodeTypes = /* @__PURE__ */ new Set(["concept", "word", "study", "lesson", "course"]);
var contentKind = (n) => n.type === "passage" ? "scripture" : editorialNodeTypes.has(n.type) ? "editorial" : "source-index";

// knowledge/search.mjs
var normalize = (value) => String(value ?? "").normalize("NFC").toLowerCase().trim().replace(/\s+/gu, " ");
var digits = (value) => value.replace(/[੦-੯]/gu, (c) => String("੦੧੨੩੪੫੬੭੮੯".indexOf(c)));
var words = (value) => normalize(value).match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}]*/gu) || [];
var roman = (value) => normalize(value).normalize("NFD").replace(/(\p{Script=Latin})\p{M}+/gu, "$1").normalize("NFC");
var labelWords = (value) => words(digits(roman(value))).join(" ");
var carriers = new Map([...["ੳਉਊਓ", "ਅਆਐਔ", "ੲਇਈਏ"].flatMap((group) => [...group].map((c) => [c, group[0]]))]);
var firstUnit = (token) => [...token][0] + ([...token][1] === "਼" ? "਼" : "");
var foldInitial = (unit) => digits(carriers.get(unit) || unit);
var scriptLetter = (c) => /\p{L}/u.test(c) && /\p{Script=Gurmukhi}/u.test(c);
var modes = /* @__PURE__ */ new Set(["auto", "phrase", "first-letter", "first-letter-anywhere"]);
var lookupAliases = {
  "composition.asa-di-vaar": ["Asa Ki Vaar", "Asa Ki Var", "ਆਸਾ ਕੀ ਵਾਰ"],
  "author.guru-nanak": ["Guru Nanak Dev", "Mehl 1", "Mahalla 1", "Mahala 1", "Mahla 1", "M1", "ਮਹਲਾ ੧", "ਮਃ ੧", "ਗੁਰੂ ਨਾਨਕ", "ਨਾਨਕ"],
  "author.guru-angad": ["Guru Angad Dev", "Mehl 2", "Mahalla 2", "Mahala 2", "Mahla 2", "M2", "ਮਹਲਾ ੨", "ਮਃ ੨", "ਗੁਰੂ ਅੰਗਦ", "ਅੰਗਦ"],
  "author.bhagat-kabir": ["Bhagat Kabir", "Bhagat Kabeer", "ਭਗਤ ਕਬੀਰ", "ਕਬੀਰ"],
  "raag.asa": ["aasaa"],
  "concept.humility": ["nimrta", "humbleness"],
  "concept.haumai": ["houmai", "haumein"],
  "concept.seva": ["sewa"],
  "concept.shabad": ["sabad", "ਸਬਦੁ"]
};
function names(node) {
  const origin = contentKind(node) === "editorial" ? "editorial" : "source";
  return [
    ...[node.title, node.pa, ...node.aliases || []].map((text) => ({ text, origin, basis: origin + "-title-or-alias" })),
    ...[node.editorialTitle, node.editorialPa, ...node.editorialAliases || []].map((text) => ({ text, origin: "editorial", basis: "editorial-title-or-alias" })),
    ...(lookupAliases[node.id] || []).map((text) => ({ text, origin: "editorial", basis: node.type === "author" ? "editorial-author-lookup" : "editorial-lookup" }))
  ].filter((label) => typeof label.text === "string" && label.text.trim()).map((label) => ({ ...label, text: labelWords(label.text) }));
}
var provenanceRank = (hit) => hit.matchBasis === "editorial-author-lookup" ? 3 : hit.matchOrigin === "editorial" ? 2 : 1;
var cache = /* @__PURE__ */ new WeakMap();
function retrieveIndex(index2) {
  if (cache.has(index2)) return cache.get(index2);
  const labels = index2.graph.nodes.map((node) => ({ node, labels: names(node) }));
  const passages = index2.passages.map((node) => ({
    node,
    lines: node.occurrenceIds.map((id) => {
      const occurrence = index2.occ.get(id), tokens = words(occurrence.text);
      return { occurrence, tokens, initials: tokens.map((token) => foldInitial(firstUnit(token))) };
    })
  }));
  const value = { labels, passages };
  cache.set(index2, value);
  return value;
}
function aliasQuery(query) {
  return labelWords(query).replace(/^(?:what (?:is|are|does)|tell me about|teach me about|show me|learn about)\s+/u, "").replace(/\s+(?:mean|means)$/u, "");
}
function phraseAt(haystack, needle) {
  if (!needle.length || needle.length > haystack.length) return false;
  for (let i = 0; i <= haystack.length - needle.length; i++) if (needle.every((token, j) => token === haystack[i + j])) return true;
  return false;
}
function initialsQuery(query) {
  const compact = query.replace(/\s+/gu, "");
  const units = compact.match(/[\p{L}0-9੦-੯]\u0a3c?/gu) || [];
  if (units.length < 2 || units.join("") !== compact || !units.some((unit) => scriptLetter([...unit][0]))) return null;
  if (!units.every((unit) => scriptLetter([...unit][0]) || /^[0-9੦-੯]$/u.test(unit))) return null;
  return units.map(foldInitial);
}
function referenceMatches(node, q) {
  const kabir = q.match(/^(?:(?:bhagat|ਭਗਤ)\s+)?(?:kabir|kabeer|ਕਬੀਰ)(?:\s+(?:ji|ਜੀ))?\s+(?:salok|slok|ਸਲੋਕ)\s*(\d{1,3})$/u);
  if (kabir) return node.compositionId === "composition.kabir-saloks" && node.salokPosition === Number(kabir[1]);
  const asa = q.match(/^(?:asa (?:di|ki) va{1,2}r|ਆਸਾ (?:ਦੀ|ਕੀ) ਵਾਰ)\s+(?:pauri|ਪਉੜੀ)\s*(\d{1,3})\s+(?:salok|slok|ਸਲੋਕ)\s*(\d{1,3})$/u);
  return !!asa && node.compositionId === "composition.asa-di-vaar" && node.pauriNumber === Number(asa[1]) && node.salokPosition === Number(asa[2]);
}
var relationReasons = {
  discusses: "Related topic",
  written_by: "Author",
  contains: "Composition",
  attested_in: "Word in this passage",
  in_raag: "Raag"
};
function search(index2, query, { mode = "auto", author = "", type = "", collection = "" } = {}) {
  const q = normalize(query);
  if (!q || [...q].length > 240 || !modes.has(mode) || /(?:^|\s)[+−-]\s*\d/u.test(digits(q))) return [];
  const { labels, passages } = retrieveIndex(index2), matches = /* @__PURE__ */ new Map();
  const allowed = (node) => (!type || node.type === type) && (!author || node.type === "passage" && node.authorId === author) && (!collection || node.type === "passage" && node.collectionId === collection);
  const add = (node, score, reason, occurrenceIds = [], matchOrigin = "source", matchBasis = "source-reference") => {
    const prior = matches.get(node.id);
    if (prior && prior.score > score) return;
    const ids = prior?.score === score ? [.../* @__PURE__ */ new Set([...prior.occurrenceIds, ...occurrenceIds])] : occurrenceIds;
    const hit = { id: node.id, type: node.type, title: node.title, kind: contentKind(node), matchOrigin, matchBasis, score, reason, occurrenceIds: ids };
    matches.set(node.id, prior?.score === score && provenanceRank(prior) > provenanceRank(hit) ? { ...prior, occurrenceIds: ids } : hit);
  };
  const ang = digits(q).match(/^(?:(?:ang|ank|ਅੰਗ|page|ਪੰਨਾ|p\.)\s*:?\s*)?(\d{1,4})$/u);
  if (ang) {
    const value = Number(ang[1]);
    if (value < 1 || value > 1430) return [];
    for (const { node } of passages) if (value >= node.angStart && value <= node.angEnd) add(node, 120, "Ang " + value);
  } else {
    if (mode === "auto") {
      const exact2 = labelWords(q), framed = aliasQuery(q);
      for (const { node, labels: labelsForNode } of labels) {
        for (const label of labelsForNode) {
          const score = label.text === exact2 ? 100 : framed !== exact2 && label.text === framed ? 90 : 0;
          if (!score) continue;
          const reason = label.basis === "editorial-author-lookup" ? "Editorial author lookup" : label.basis === "editorial-lookup" ? "Editorial lookup alias" : label.origin === "editorial" ? "Editorial title or alias" : "Source title or alias";
          add(node, score, reason + (score === 100 ? " · exact indexed name" : " · indexed name in question"), [], label.origin, label.basis);
        }
      }
      for (const { node } of passages) if (referenceMatches(node, labelWords(roman(q).replace(/(?:\u0027|\u2019)s\b/gu, "")))) add(node, 125, "Composition reference");
    }
    const needle = words(q);
    const hasPhrase = needle.some((token) => [...token].some(scriptLetter)) && [...needle.join("")].length >= 2;
    let hasText = false;
    if ((mode === "auto" || mode === "phrase") && hasPhrase) {
      for (const { node, lines } of passages) {
        const found = lines.filter((line) => phraseAt(line.tokens, needle)).map((line) => line.occurrence.id);
        if (found.length) {
          add(node, 115, "Complete words in the original text", found, "source", "source-phrase");
          if (allowed(node)) hasText = true;
        }
      }
    }
    const initial = initialsQuery(q);
    if (initial && (mode === "first-letter" || mode === "first-letter-anywhere" || mode === "auto" && !hasText)) {
      const anywhere = mode === "first-letter-anywhere";
      for (const { node, lines } of passages) {
        const found = lines.filter((line) => anywhere ? phraseAt(line.initials, initial) : initial.length <= line.initials.length && initial.every((unit, i) => unit === line.initials[i])).map((line) => line.occurrence.id);
        if (found.length) add(node, 110, anywhere ? "First letters within a line" : "First letters at the start of a line", found, "source", "source-first-letter");
      }
    }
    if (mode === "auto") {
      for (const hit of [...matches.values()]) {
        if (hit.type === "passage") continue;
        for (const edge of index2.graph.edges) {
          if (!relationReasons[edge.type] || edge.to !== hit.id && edge.from !== hit.id) continue;
          const other = index2.nodes.get(edge.from === hit.id ? edge.to : edge.from);
          if (other?.type === "passage") {
            const authorLookup = hit.matchBasis === "editorial-author-lookup";
            const origin = hit.matchOrigin === "editorial" || edge.review === "EDITORIAL_DRAFT" ? "editorial" : "source";
            const basis = authorLookup ? "editorial-author-lookup" : origin === "editorial" ? "editorial-association" : "source-relationship";
            const reason = authorLookup ? "Editorial author lookup · Indexed author: " + hit.title : (origin === "editorial" ? "Editorial association" : "Source relationship") + " · " + relationReasons[edge.type] + " · " + hit.title;
            add(other, Math.max(35, hit.score - 20), reason, [], origin, basis);
          }
        }
      }
    }
  }
  return [...matches.values()].filter((hit) => allowed(index2.nodes.get(hit.id))).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

// knowledge/core.mjs
var types = /* @__PURE__ */ new Set(["collection", "edition", "author", "raag", "composition", "passage", "concept", "word", "study", "lesson", "course"]);
var editorial = /* @__PURE__ */ new Set(["discusses", "related_concept", "psychological_parallel", "philosophical_comparison", "has_lesson"]);
var relationships = {
  written_by: ["passage", "author"],
  contains: ["composition", "passage"],
  in_raag: ["passage", "raag"],
  discusses: ["passage", "concept"],
  related_concept: ["concept", "concept"],
  attested_in: ["word", "passage"],
  psychological_parallel: ["concept", "study"],
  philosophical_comparison: ["concept", "study"],
  has_lesson: ["concept", "lesson"]
};
var require3 = (ok, message) => {
  if (!ok) throw Error(message);
};
var nonempty = (s) => typeof s === "string" && !!s.trim();
function unique2(items, what) {
  const map = /* @__PURE__ */ new Map();
  for (const x of items) {
    require3(nonempty(x.id) && !map.has(x.id), "Duplicate/missing " + what + " ID");
    map.set(x.id, x);
  }
  return map;
}
function buildIndex(g) {
  require3(g?.schema === "glp.knowledge.v1" && g.status === "NONPUBLISHING_DRAFT", "Not a development knowledge pack");
  require3(Array.isArray(g.nodes) && Array.isArray(g.occurrences) && Array.isArray(g.edges), "Incomplete knowledge pack");
  const nodes = unique2(g.nodes, "node"), occ = unique2(g.occurrences, "occurrence");
  unique2(g.edges, "edge");
  const typed = (id, type) => nodes.get(id)?.type === type;
  const ref = (id, type) => require3(typed(id, type), "Broken " + type + " reference: " + id);
  const passages = g.nodes.filter((n) => n.type === "passage"), used = /* @__PURE__ */ new Set();
  for (const n of g.nodes) {
    require3(types.has(n.type), "Unknown node type");
    if (n.type === "edition") {
      ref(n.collectionId, "collection");
      require3(n.humanCollated === false, "No qualified collation asserted in this pilot");
    }
    if (n.type === "composition") ref(n.collectionId, "collection");
    if (n.type === "concept" && n.lessonId) {
      ref(n.lessonId, "lesson");
      require3(nodes.get(n.lessonId).subjectId === n.id, "Wrong lesson subject");
    }
    if (n.type === "lesson") {
      ref(n.subjectId, "concept");
      require3(Number.isInteger(n.revision) && n.revision > 0 && n.review === "AI_ASSISTED_DRAFT", "Invalid lesson review/revision");
      require3(Array.isArray(n.sourcePassageIds) && n.sourcePassageIds.length > 0, "Lesson lacks source passages");
      for (const id of n.sourcePassageIds) ref(id, "passage");
      for (const k of ["simple", "detailed", "deep"]) require3(nonempty(n[k]?.en) && nonempty(n[k]?.pa), "Missing bilingual teaching layer");
    }
    if (n.type === "course") {
      require3(Array.isArray(n.orderedLessonIds) && n.orderedLessonIds.length > 0, "Course has no lessons");
      for (const id of n.orderedLessonIds) ref(id, "lesson");
    }
    if (n.type === "word") {
      require3(n.senses?.length > 0, "Word without sense");
      for (const s of n.senses) {
        ref(s.passageId, "passage");
        require3(s.review === "AI_ASSISTED_DRAFT" && nonempty(s.en) && nonempty(s.pa) && nonempty(s.form) && s.occurrenceIds?.length > 0, "Unbound vocabulary sense");
        for (const id of s.occurrenceIds) {
          const o = occ.get(id);
          require3(o?.passageId === s.passageId && o.text.split(/\s+/u).includes(s.form), "Word sense does not match exact occurrence");
        }
      }
    }
  }
  for (const p of passages) {
    ref(p.collectionId, "collection");
    ref(p.editionId, "edition");
    ref(p.authorId, "author");
    ref(p.compositionId, "composition");
    if (p.raagId !== null) ref(p.raagId, "raag");
    require3(nodes.get(p.editionId).collectionId === p.collectionId && nodes.get(p.compositionId).collectionId === p.collectionId, "Cross-collection mismatch");
    require3(p.review === "DIGITAL_SOURCE_DRAFT" && p.occurrenceIds?.length > 0 && p.occurrenceIds.includes(p.focusId), "Unbound passage");
    let prior = null;
    for (const id of p.occurrenceIds) {
      const o = occ.get(id);
      require3(o && o.passageId === p.id && o.editionId === p.editionId && o.ang >= p.angStart && o.ang <= p.angEnd && nonempty(o.text) && /^[a-f0-9]{40}$/.test(o.sourceBlob), "Invalid source occurrence");
      require3(!used.has(id), "Duplicate source occurrence in passage membership");
      used.add(id);
      if (prior) require3(o.ang > prior.ang || o.ang === prior.ang && o.ordinal > prior.ordinal, "Source order mismatch");
      prior = o;
    }
  }
  require3(used.size === occ.size, "Orphan source occurrence");
  for (const e of g.edges) {
    const a = nodes.get(e.from), b = nodes.get(e.to), sig = relationships[e.type];
    require3(a && b && sig && a.type === sig[0] && b.type === sig[1], "Invalid relationship endpoints");
    if (editorial.has(e.type)) {
      require3(e.review === "EDITORIAL_DRAFT" && nonempty(e.reason) && Array.isArray(e.refs) && e.refs.length > 0, "Unreviewed or unsupported editorial edge");
      for (const id of e.refs) ref(id, "passage");
    } else require3(e.review === "SOURCE_DRAFT", "Source edge status mismatch");
    if (e.type === "psychological_parallel" || e.type === "philosophical_comparison") require3(nonempty(e.similarity) && nonempty(e.difference) && nonempty(b.reference), "Comparison requires similarity, difference and reference");
    if (e.type === "written_by") require3(a.authorId === b.id, "Author edge disagrees with source metadata");
    if (e.type === "contains") require3(b.compositionId === a.id, "Composition edge disagrees with source metadata");
    if (e.type === "in_raag") require3(a.raagId === b.id, "Raag edge disagrees with source metadata");
  }
  require3(g.coverage.qualifiedApproved === 0 && g.coverage.originalOccurrences === occ.size && g.coverage.passageCount === passages.length, "Coverage mismatch");
  return { graph: g, nodes, occ, passages };
}
function connected(index2, id) {
  id = resolveIdentity(index2, id);
  if (!id) return [];
  return index2.graph.edges.filter((e) => e.from === id || e.to === id).map((e) => ({ edge: e, node: index2.nodes.get(e.from === id ? e.to : e.from) }));
}
function resolveIdentity(index2, id) {
  if (typeof id !== "string") return null;
  const aliases = index2.graph.legacyPassageIds || {}, occAliases = index2.graph.legacyOccurrenceIds || {};
  const resolved = Object.hasOwn(aliases, id) ? aliases[id] : Object.hasOwn(occAliases, id) ? occAliases[id] : id;
  return index2.nodes.has(resolved) || index2.occ.has(resolved) ? resolved : null;
}
function passageLines(index2, id) {
  const p = index2.nodes.get(resolveIdentity(index2, id));
  return p?.type === "passage" ? p.occurrenceIds.map((x) => index2.occ.get(x)) : [];
}
function wordAt(index2, occurrenceId, form) {
  return index2.graph.nodes.filter((n) => n.type === "word").flatMap((n) => n.senses.filter((s) => s.form === form && s.occurrenceIds.includes(resolveIdentity(index2, occurrenceId))).map((s) => ({ word: n, sense: s })));
}

// knowledge/app.mjs
var PACK_SHA256 = "c3136d8f170b1ed5623123cd133bf4c3b7d998644801c31a6b21d8a2311dcdaf";
var $ = (id) => document.getElementById(id);
var el2 = (tag, text, cls) => {
  const n = document.createElement(tag);
  if (text !== void 0) n.textContent = text;
  if (cls) n.className = cls;
  return n;
};
var section = $("content"), status = $("status"), results = $("results"), wordDialog = $("word-dialog");
var index, current = null, depth = "simple", returnFocus = null;
var link = (text, url) => {
  const a = el2("a", text);
  const u = new URL(url);
  if (u.protocol !== "https:" || u.username || u.password) throw Error("Unsafe source URL");
  a.href = u.href;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  return a;
};
var control = (text, fn) => {
  const b = el2("button", text);
  b.type = "button";
  b.addEventListener("click", fn);
  return b;
};
var note = (text) => el2("p", text, "note");
var kindLabel = (n) => contentKind(n) === "scripture" ? "Original Gurbani · digital source" : contentKind(n) === "source-index" ? "Source index" : n.type === "study" ? "Comparative study · editorial draft" : n.type === "word" ? "Dictionary entry · editorial draft" : n.type === "lesson" ? "Lesson · editorial draft" : n.type === "course" ? "Learning pathway · editorial draft" : "Library topic · editorial draft";
var editorialNote = (text) => {
  const p = note(text);
  p.classList.add("editorial-note");
  p.dataset.contentKind = "editorial";
  return p;
};
var addText = (parent, x) => {
  if (!x) return;
  const copy = el2("div", void 0, "editorial-copy");
  copy.dataset.contentKind = "editorial";
  copy.setAttribute("aria-label", "Editorial explanation draft");
  copy.append(el2("p", "Editorial explanation · awaiting qualified review", "editorial-label"), el2("p", x.en));
  const pa = el2("p", x.pa, "editorial-pa");
  pa.lang = "pa";
  copy.append(pa);
  parent.append(copy);
};
var routeParams = () => new URLSearchParams(location.hash.slice(1));
var selectedLine = null, selectedNote = null, navToken = history.state?.glpKnowledgeToken || crypto.randomUUID(), renderedHash = null, scrollTimer;
var scrollPositions = /* @__PURE__ */ new Map();
function readRoute() {
  if (!location.hash) return { id: "concept.humility", depth: "simple", line: null };
  const p = routeParams();
  let raw = p.get("item");
  if (!raw) {
    try {
      raw = decodeURIComponent(location.hash.slice(1));
    } catch {
      return null;
    }
  }
  if ([JOURNEY_ID, SAVED_ID].includes(raw)) {
    const notes = p.getAll("note");
    if (notes.length > 1 || notes.length && (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,159}$/.test(notes[0]) || raw !== JOURNEY_ID)) return null;
    return { id: raw, depth: "simple", line: null, note: notes[0] || null };
  }
  if (!index) return null;
  const id = resolveIdentity(index, raw), occ = index.occ.get(id), node = index.nodes.get(occ?.passageId || id);
  if (!node) return null;
  const requested = p.get("line"), line = requested ? resolveIdentity(index, requested) : occ?.id || null;
  if (p.has("line") && !line || line && index.occ.get(line)?.passageId !== node.id) return null;
  const d = p.get("depth") || "simple";
  if (!["simple", "detailed", "deep"].includes(d)) return null;
  return { id: node.id, depth: d, line };
}
function routeHash(route) {
  const p = new URLSearchParams({ item: route.id });
  if (route.line) p.set("line", route.line);
  if (route.note) p.set("note", route.note);
  if (route.depth && route.depth !== "simple") p.set("depth", route.depth);
  return "#" + p;
}
function recordScroll() {
  if (history.state?.glpKnowledgeToken === navToken) {
    scrollPositions.set(history.state.entryKey, scrollY);
    history.replaceState({ ...history.state, scroll: scrollY }, "");
  }
}
function displayRoute(route, { restoreScroll = null, focus = false } = {}) {
  current = route?.id || null;
  depth = route?.depth || "simple";
  selectedLine = route?.line || null;
  selectedNote = route?.note || null;
  renderedHash = location.hash;
  render();
  const target = selectedLine ? section.querySelector('[data-occurrence="' + selectedLine + '"]') : selectedNote && selectedNote !== "new" ? section.querySelector(".journey-editor") || section : section;
  if (focus) {
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
  requestAnimationFrame(() => {
    if (restoreScroll !== null) scrollTo(0, restoreScroll);
    else if (focus) target?.scrollIntoView({ block: "start", behavior: "auto" });
  });
}
function visit(route) {
  clearTimeout(scrollTimer);
  recordScroll();
  const step = history.state?.glpKnowledgeToken === navToken ? history.state.step : 0;
  history.pushState({ glpKnowledgeToken: navToken, entryKey: crypto.randomUUID(), step: step + 1, scroll: 0 }, "", routeHash(route));
  scrollPositions.set(history.state.entryKey, 0);
  displayRoute(route, { focus: true });
}
function open(raw) {
  const id = resolveIdentity(index, raw), occ = index.occ.get(id), n = index.nodes.get(occ?.passageId || id);
  if (!n) return;
  visit({ id: n.id, depth: "simple", line: occ?.id || null });
}
function navigateBack() {
  if (history.state?.glpKnowledgeToken === navToken && history.state.step > 0) {
    recordScroll();
    history.back();
  }
}
function followHistory() {
  clearTimeout(scrollTimer);
  const route = readRoute(), own = history.state?.glpKnowledgeToken === navToken;
  const position = own ? scrollPositions.get(history.state.entryKey) ?? history.state.scroll ?? 0 : null;
  if (!own) history.replaceState({ glpKnowledgeToken: navToken, entryKey: crypto.randomUUID(), step: 0, scroll: 0 }, "");
  displayRoute(route, { restoreScroll: position, focus: true });
}
window.addEventListener("popstate", () => {
  if (index || [JOURNEY_ID, SAVED_ID].includes(readRoute()?.id)) followHistory();
});
window.addEventListener("hashchange", () => {
  if ((index || [JOURNEY_ID, SAVED_ID].includes(readRoute()?.id)) && renderedHash !== location.hash) followHistory();
});
window.addEventListener("scroll", () => {
  if (!index || history.state?.glpKnowledgeToken !== navToken) return;
  scrollPositions.set(history.state.entryKey, scrollY);
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(recordScroll, 500);
}, { passive: true });
window.addEventListener("pagehide", () => {
  clearTimeout(scrollTimer);
  recordScroll();
});
window.addEventListener("beforeunload", recordScroll);
function row(n, detail, hit) {
  const target = hit?.occurrenceIds?.[0] || n.id;
  const kind = contentKind(n), b = control("", () => open(target));
  b.className = "result result-" + kind;
  b.dataset.contentKind = kind;
  b.dataset.resultId = n.id;
  if (hit) {
    b.dataset.matchOrigin = hit.matchOrigin;
    b.dataset.matchBasis = hit.matchBasis;
  }
  const title = el2("span", n.title || n.id, "result-title " + (kind === "scripture" ? "scripture-title" : kind === "editorial" ? "editorial-title" : "source-index-title"));
  if (kind === "scripture") title.lang = "pa";
  b.append(el2("span", kindLabel(n), "result-kind"), title);
  if (n.pa) {
    const pa = el2("span", n.pa, kind === "editorial" ? "editorial-pa" : "source-index-pa");
    pa.lang = "pa";
    b.append(pa);
  }
  const div = el2("div");
  div.append(b);
  if (n.type === "passage") {
    div.append(note("Ang " + n.angStart + " · " + index.nodes.get(n.authorId).title));
    if (n.editorialTitle) div.append(editorialNote("Library topic (editorial): " + n.editorialTitle));
  }
  if (detail) {
    const label = hit?.matchOrigin === "editorial" ? editorialNote(detail) : note(detail);
    if (hit) {
      label.dataset.matchOrigin = hit.matchOrigin;
      label.dataset.matchBasis = hit.matchBasis;
    }
    div.append(label);
  }
  if (hit?.occurrenceIds?.length) {
    const occurrence = index.occ.get(hit.occurrenceIds[0]), quote = el2("p", occurrence.text, "result-quote");
    quote.lang = "pa";
    quote.dataset.contentKind = "scripture";
    quote.dataset.occurrence = occurrence.id;
    quote.setAttribute("aria-label", "Original Gurbani match from the pinned digital source");
    div.append(quote);
  }
  return div;
}
function showWord(occ, form, button2) {
  const list = wordAt(index, occ, form);
  if (!list.length) return;
  $("word-title").textContent = form;
  $("word-body").replaceChildren();
  for (const { word, sense } of list) {
    addText($("word-body"), sense);
    $("word-body").append(note("Context-specific vocabulary draft. Grammar and pronunciation review pending."), control("Open dictionary entry", () => {
      wordDialog.close();
      open(word.id);
    }));
  }
  returnFocus = button2;
  wordDialog.showModal();
}
wordDialog.addEventListener("close", () => {
  if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
});
$("close-word").addEventListener("click", () => wordDialog.close());
function render() {
  section.replaceChildren();
  if (current === JOURNEY_ID || current === SAVED_ID) {
    const back2 = control("← Previous learning page", navigateBack);
    back2.disabled = history.state?.glpKnowledgeToken !== navToken || history.state.step <= 0;
    section.append(back2);
    if (current === JOURNEY_ID) renderJourney({ parent: section, index, noteId: selectedNote, navigate: visit });
    else renderSaved({ parent: section, index, navigate: visit });
    return;
  }
  const n = index?.nodes.get(current);
  if (!n) {
    section.append(el2("h2", "This learning link is unavailable"), note("This link does not identify an item or line in the current pilot."), control("Start exploring", () => open("concept.humility")));
    return;
  }
  const back = control("← Previous learning page", navigateBack);
  back.disabled = history.state?.glpKnowledgeToken !== navToken || history.state.step <= 0;
  section.append(back);
  const kind = contentKind(n);
  section.append(el2("p", kindLabel(n) + " · DEVELOPMENT DRAFT", "kicker"));
  const heading = el2("h2", n.title || n.id, kind === "scripture" ? "scripture-title" : kind === "editorial" ? "editorial-title" : "source-index-title");
  heading.dataset.contentKind = kind;
  if (n.type === "passage") heading.lang = "pa";
  section.append(heading);
  if (n.type === "passage" && n.editorialTitle) {
    section.append(editorialNote("Library topic (editorial): " + n.editorialTitle));
    if (n.editorialPa) {
      const d = editorialNote("ਲਾਇਬ੍ਰੇਰੀ ਦਾ ਵਿਸ਼ਾ (ਸੰਪਾਦਕੀ): " + n.editorialPa);
      d.classList.add("editorial-pa");
      d.lang = "pa";
      section.append(d);
    }
  }
  if (n.pa) {
    const p = el2("p", n.pa, kind === "editorial" ? "editorial-pa" : "source-index-pa");
    p.dataset.contentKind = kind;
    p.lang = "pa";
    section.append(p);
  }
  if (n.type === "concept") {
    const l = n.lessonId && index.nodes.get(n.lessonId);
    if (l) {
      const modes2 = el2("div", void 0, "modes");
      for (const d of ["simple", "detailed", "deep"]) {
        const b = control({ simple: "Simple", detailed: "Detailed", deep: "Deep study" }[d], () => {
          visit({ id: current, depth: d, line: selectedLine });
          document.querySelector('[data-depth="' + d + '"]')?.focus({ preventScroll: true });
        });
        b.dataset.depth = d;
        b.setAttribute("aria-pressed", String(d === depth));
        modes2.append(b);
      }
      section.append(modes2);
      addText(section, l[depth]);
      section.append(note("AI-assisted educational draft, not a translation or scholar-approved lesson."));
    } else section.append(note("Indexed concept only; teaching has not been written."));
  } else if (n.type === "passage") {
    section.append(note(index.nodes.get(n.authorId).title + " · " + index.nodes.get(n.compositionId).title + " · Ang " + n.angStart + " · " + (n.raagId ? index.nodes.get(n.raagId).title : "No Raag assigned to this unit")));
    const body = el2("div", void 0, "scripture");
    body.dataset.contentKind = "scripture";
    body.setAttribute("aria-label", "Original Gurbani from the pinned digital source");
    body.lang = "pa";
    if (selectedLine) {
      const label = el2("p", "Selected line is highlighted below", "line-label");
      label.lang = "en";
      section.append(label);
    }
    for (const o of passageLines(index, n.id)) {
      const line = el2("p", void 0, "pankti");
      line.dataset.occurrence = o.id;
      if (o.kind === "heading") line.classList.add("source-heading");
      if (o.id === selectedLine) line.classList.add("selected-line");
      for (const token of o.text.split(/(\s+)/u)) {
        if (!token) continue;
        const senses = wordAt(index, o.id, token);
        if (senses.length) {
          const b = control(token, () => showWord(o.id, token, b));
          b.className = "word";
          b.lang = "pa";
          line.append(b);
        } else line.append(document.createTextNode(token));
      }
      body.append(line);
    }
    section.append(body, note("Tap underlined words with authored contextual senses. All other words stay in the original line. This is the full selected Salok, not the full Ang."), note(n.comparison), link("Pinned source", n.sourceUrl), document.createTextNode(" · "), link("Second digital witness", n.secondaryUrl));
    section.append(note("No recording is rights-cleared for this pilot. Complete reader deep-link integration is pending; return to this learning page using Previous."));
  } else if (n.type === "author") {
    const count = index.passages.filter((p) => p.authorId === n.id).length;
    section.append(note(count + " selected passage" + (count === 1 ? "" : "s") + " in this pilot. This is not the complete Bani of this author."));
  } else if (n.type === "word") {
    for (const s of n.senses) {
      section.append(note("Source word · contextual explanation below is an editorial draft"), el2("h3", s.form, "source-token"));
      addText(section, s);
      section.append(row(index.nodes.get(s.passageId), "Exact word occurrence in this passage"));
    }
  } else if (n.type === "study") {
    section.append(note("Comparative study — not a literal Gurbani interpretation"), link(n.citation, n.reference));
  } else if (n.type === "course") {
    section.append(note("Draft pathway composed from existing lesson revisions, not duplicated scripture."));
    for (const id of n.orderedLessonIds) {
      const l = index.nodes.get(id);
      section.append(row(index.nodes.get(l.subjectId), "Lesson revision " + l.revision));
    }
  } else if (n.type === "lesson") {
    section.append(note("Versioned education record"));
    addText(section, n.simple);
    section.append(row(index.nodes.get(n.subjectId), "Open all three teaching levels"));
  }
  const edges = connected(index, n.id).filter(({ node }) => node.type !== "lesson" && !(n.type === "word" && node.type === "passage"));
  if (edges.length) {
    section.append(el2("h3", "Related knowledge"));
    for (const { edge, node } of edges) {
      const box = el2("div", void 0, "connection");
      box.append(row(node, edge.type.replaceAll("_", " ")));
      if (edge.reason) box.append(editorialNote("Editorial connection: " + edge.reason));
      if (edge.similarity) {
        const comparison2 = el2("div", void 0, "editorial-copy");
        comparison2.dataset.contentKind = "editorial";
        comparison2.setAttribute("aria-label", "Editorial comparison, not a Gurbani explanation");
        comparison2.append(el2("p", "Comparative study · editorial draft", "editorial-label"), el2("p", "Similarity: " + edge.similarity), el2("p", "Difference: " + edge.difference), note("Editorial comparison awaiting independent and qualified review."));
        box.append(comparison2);
      }
      section.append(box);
    }
  }
}
function find() {
  const q = $("query").value, mode = $("mode").value, author = $("author").value;
  results.replaceChildren();
  const matches = search(index, q, { mode, author });
  status.textContent = matches.length ? matches.length + " indexed result" + (matches.length === 1 ? "" : "s") + " in this pilot" : "No indexed result in this pilot. Try an exact topic or author, complete Gurmukhi words, first letters, or an Ang. The full scripture is not indexed here yet.";
  for (const hit of matches) results.append(row(index.nodes.get(hit.id), (hit.matchOrigin === "editorial" ? "Matched through editorial indexing" : "Matched through source indexing") + " · " + hit.reason, hit));
}
$("journey-open").addEventListener("click", () => visit({ id: JOURNEY_ID }));
$("journey-saved").addEventListener("click", () => visit({ id: SAVED_ID }));
async function start() {
  try {
    if (!crypto?.subtle) throw Error("Knowledge data unavailable");
    const original = await fetch("./scripture.json", { credentials: "same-origin", cache: "no-store" });
    if (!original.ok) throw Error("Knowledge source unavailable");
    const sourceBytes = await original.arrayBuffer();
    await verifyScripture(sourceBytes);
    const teaching = await fetch("./pilot.json", { credentials: "same-origin", cache: "no-store" });
    if (!teaching.ok) throw Error("Knowledge teaching unavailable");
    index = buildIndex(await loadKnowledge(sourceBytes, await teaching.arrayBuffer(), PACK_SHA256));
    for (const n of index.graph.nodes.filter((x) => x.type === "author")) {
      const opt = el2("option", n.title);
      opt.value = n.id;
      $("author").append(opt);
    }
    $("search-form").addEventListener("submit", (e) => {
      e.preventDefault();
      find();
    });
    $("browse").replaceChildren(...["concept.humility", "concept.haumai", "author.bhagat-kabir", "word.haumai", "course.human-mind"].map((id) => row(index.nodes.get(id))));
    $("search-button").disabled = false;
    status.textContent = "Source files checked · three selected Saloks · two topic lessons. Qualified review pending; not the full 1,430-Ang library.";
    const route = readRoute();
    const previous = history.state;
    history.scrollRestoration = "manual";
    history.replaceState({ glpKnowledgeToken: navToken, entryKey: previous?.entryKey || crypto.randomUUID(), step: previous?.glpKnowledgeToken === navToken ? previous.step : 0, scroll: previous?.scroll || 0 }, "", route ? routeHash(route) : location.href);
    displayRoute(route, { restoreScroll: previous?.glpKnowledgeToken === navToken && Number.isFinite(previous.scroll) ? previous.scroll : null, focus: !!route?.line || [JOURNEY_ID, SAVED_ID].includes(route?.id) });
  } catch (e) {
    status.textContent = "Knowledge pack could not be verified. Source and teaching are unavailable.";
    results.replaceChildren();
    section.replaceChildren();
    if ([JOURNEY_ID, SAVED_ID].includes(readRoute()?.id)) displayRoute(readRoute());
  }
}
start();
export {
  PACK_SHA256
};
