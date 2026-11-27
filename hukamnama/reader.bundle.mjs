// hukamnama/core.mjs
var FIXTURE_SHA256 = "f9c7b46f2ec39e88569557a81d8a456db7e1099a10448123f9f64bda7a73ffd1";
var TIMEZONE = "Asia/Kolkata";
var EXAMPLE_DATE = "2026-11-25";
var MATCH = "DIGITAL_MATCH_DRAFT", HOLD = "HOLD_ENCODING_VARIANT";
var ID = "sggs.gujri.m1.ang504.shabad04", EDITION = "opengranth-34d2a7c";
function validDate(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = /* @__PURE__ */ new Date(s + "T00:00:00Z");
  return Number.isFinite(+d) && d.toISOString().slice(0, 10) === s;
}
function amritsarDate(instant2 = /* @__PURE__ */ new Date()) {
  const d = new Date(instant2);
  if (!Number.isFinite(+d)) throw Error("Invalid clock");
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit", calendar: "gregory", numberingSystem: "latn" }).formatToParts(d).map((p) => [p.type, p.value]));
  const result2 = parts.year.padStart(4, "0") + "-" + parts.month + "-" + parts.day;
  if (!validDate(result2)) throw Error("Invalid formatted date");
  return result2;
}
var fail = () => {
  throw Error("Fixture failed validation");
};
function deepFreeze(o) {
  if (o && typeof o === "object" && !Object.isFrozen(o)) {
    for (const v of Object.values(o)) deepFreeze(v);
    Object.freeze(o);
  }
  return o;
}
function validateFixture(p) {
  if (p?.schema !== "glp.hukamnama.fixture.v1" || p?.status !== "DEVELOPMENT_FIXTURE_NOT_RELEASE_APPROVED" || p.policy?.publicationApproved !== false || p.policy?.lessonApproved !== false || p.policy?.recordingPermission !== false || p.policy?.dailyAdapterActive !== false || p.policy?.timezone !== TIMEZONE || p.policy?.ritual !== "morning-mukhwak") fail();
  const c = p.canonical;
  if (c?.id !== ID || c.edition !== EDITION || c.angStart !== 504 || c.angEnd !== 505 || c.comparison?.qualifiedHumanApproved !== false || c.comparison?.matches !== 19 || c.comparison?.total !== 19 || !Array.isArray(c.occurrences) || c.occurrences.length !== 19) fail();
  for (let i = 0; i < 19; i++) {
    const x = c.occurrences[i], kind = i === 0 ? "heading" : i === 3 || i === 4 ? "rahao" : "verse", stanza = i === 0 ? null : i < 3 ? 1 : i < 5 ? "rahao" : Math.floor((i - 5) / 2) + 2;
    if (x.id !== ID + ".l" + String(i).padStart(2, "0") || x.ang !== (i < 4 ? 504 : 505) || x.kind !== kind || x.stanza !== stanza || typeof x.text !== "string" || !/[\u0a00-\u0a7f]/u.test(x.text) || /[<>@\ufffd\uE000-\uF8FF]/u.test(x.text) || !x.text.endsWith("॥")) fail();
  }
  if (c.occurrences[0].text !== "ਗੂਜਰੀ ਮਹਲਾ ੧ ॥" || !c.occurrences[4].text.endsWith("॥੧॥ ਰਹਾਉ ॥") || !c.occurrences[18].text.endsWith("॥੮॥੪॥")) fail();
  if (!Array.isArray(p.events) || p.events.length !== 3) fail();
  const expected = /* @__PURE__ */ new Map([["2017-11-25", HOLD], ["2025-10-14", MATCH], ["2026-11-25", MATCH]]);
  for (const e of p.events) {
    if (!validDate(e.date) || !expected.has(e.date) || e.status !== expected.get(e.date) || e.id !== "harmandir-morning." + e.date || e.shabadId !== ID || e.edition !== EDITION || !e.sourceUrl?.startsWith("https://sgpc.net/")) fail();
    if (e.status === HOLD && (e.conflict?.expected !== "ਜਿਨੑ" || e.conflict?.observed !== "ਜਿਨ@")) fail();
    expected.delete(e.date);
  }
  return deepFreeze(p);
}
async function decodeFixture(raw) {
  if (!(raw instanceof ArrayBuffer) || raw.byteLength > 65536 || !globalThis.crypto?.subtle) throw Error("Fixture integrity unavailable");
  const h = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", raw)), (b) => b.toString(16).padStart(2, "0")).join("");
  if (h !== FIXTURE_SHA256) throw Error("Fixture digest mismatch");
  return validateFixture(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(raw)));
}
function resolveDate(pack, date, instant2 = /* @__PURE__ */ new Date()) {
  const amritsar = amritsarDate(instant2);
  if (!validDate(date)) return { status: "INVALID_DATE", requested: date, amritsar };
  if (date > amritsar) return { status: "FUTURE_DATE", requested: date, amritsar };
  const e = pack.events.find((e2) => e2.date === date);
  if (!e) return { status: date === amritsar ? "TODAY_PENDING_NO_ADAPTER" : "DATE_UNAVAILABLE", requested: date, amritsar };
  if (e.status !== MATCH) return { status: "SOURCE_CONFLICT_HOLD", requested: date, amritsar, event: e };
  return { status: "DATED_DEVELOPMENT_EXAMPLE", requested: date, amritsar, event: e, shabad: pack.canonical };
}
function publishedReading(pack, date, instant2) {
  const r = resolveDate(pack, date, instant2);
  return { status: r.status === "DATED_DEVELOPMENT_EXAMPLE" ? "REVIEW_PENDING" : r.status, requested: r.requested, amritsar: r.amritsar };
}

// hukamnama/publication-key.mjs
var PUBLICATION_MODE = "DEVELOPMENT_PREVIEW";
var KEY_ID = "development-a11f39dec6ddf5238bd0a338";
var PUBLICATION_KEY = Object.freeze({ "kty": "EC", "x": "4MPM053dShO4tiVUMjyzETmChtUt_LCGq-wC1XMjNI8", "y": "9EoInSSN7hqfQyCsVlTvTrvu2GpfG9b-LufAcs9N-8M", "crv": "P-256" });

// hukamnama/json.mjs
var MAX_TEXT_LENGTH = 2621440;
var MAX_DEPTH = 40;
var whitespace = (character) => character === " " || character === "	" || character === "\n" || character === "\r";
function parseStrictJSON(text2) {
  if (typeof text2 !== "string") throw new TypeError("JSON input must be a string.");
  if (text2.length > MAX_TEXT_LENGTH) throw new RangeError("JSON input exceeds the text limit.");
  let position = 0;
  const syntax = (message) => {
    throw new SyntaxError(message + " at character " + position + ".");
  };
  const skipWhitespace = () => {
    while (whitespace(text2[position])) position++;
  };
  function stringToken(decode) {
    if (text2[position] !== '"') syntax("Expected a JSON string");
    const start = position++;
    while (position < text2.length) {
      const character = text2[position++];
      if (character === '"') {
        if (!decode) return;
        try {
          return JSON.parse(text2.slice(start, position));
        } catch {
          syntax("Malformed JSON string");
        }
      }
      if (character.charCodeAt(0) < 32) syntax("Unescaped control character in JSON string");
      if (character === "\\") {
        if (position >= text2.length) syntax("Unterminated JSON escape");
        position++;
      }
    }
    syntax("Unterminated JSON string");
  }
  function primitive() {
    if (!"-0123456789tfn".includes(text2[position] || "\0")) syntax("Expected a JSON value");
    const start = position;
    while (position < text2.length && !whitespace(text2[position]) && !",]}".includes(text2[position])) position++;
    const token = text2.slice(start, position);
    if (token.includes("{") || token.includes("[") || token.includes('"')) syntax("Malformed JSON primitive");
    try {
      JSON.parse(token);
    } catch {
      syntax("Malformed JSON primitive");
    }
  }
  function value(depth) {
    skipWhitespace();
    const character = text2[position];
    if (character === '"') {
      stringToken(false);
      return;
    }
    if (character !== "{" && character !== "[") {
      primitive();
      return;
    }
    if (depth >= MAX_DEPTH) throw new RangeError("JSON nesting exceeds the depth limit.");
    const object = character === "{", closing = object ? "}" : "]";
    position++;
    skipWhitespace();
    if (text2[position] === closing) {
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
        if (text2[position] !== ":") syntax("Expected a colon after JSON object key");
        position++;
      }
      value(depth + 1);
      skipWhitespace();
      if (text2[position] === closing) {
        position++;
        return;
      }
      if (text2[position] !== ",") syntax("Expected a JSON separator or closing delimiter");
      position++;
      skipWhitespace();
    }
  }
  value(0);
  skipWhitespace();
  if (position !== text2.length) syntax("Unexpected trailing JSON content");
  try {
    return JSON.parse(text2);
  } catch {
    syntax("Malformed JSON");
  }
}

// hukamnama/delivery.mjs
var RECORD_CACHE = "glp001.hukamnama.records.v1";
var EDITION2 = "opengranth-34d2a7c", VERIFIED = "DIGITAL_TEXT_VERIFIED_PREVIEW";
var ENVELOPE_LIMIT = 524288, SOURCE_LIMIT = 1048576, PAIR_LIMIT = 23e5;
var HEX = /^[a-f0-9]{64}$/, UTF8 = new TextDecoder("utf-8", { fatal: true });
var encoder = new TextEncoder();
function reject(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}
function insist(value, message) {
  if (!value) reject("SOURCE_REFUSED", message);
}
function plain(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function exactKeys(value, keys) {
  return plain(value) && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}
function freeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function instant(now) {
  const date = new Date(typeof now === "function" ? now() : now ?? Date.now());
  if (!Number.isFinite(+date)) reject("SOURCE_REFUSED", "The date could not be checked.");
  return date;
}
function checkDate(date, now) {
  if (!validDate(date)) reject("INVALID_DATE", "Choose a complete calendar date.");
  const today = amritsarDate(instant(now));
  if (date > today) reject("FUTURE_DATE", "This date has not arrived in Amritsar.");
  return today;
}
function bytes(raw, limit) {
  insist(raw instanceof ArrayBuffer && raw.byteLength > 0 && raw.byteLength <= limit, "The source size could not be verified.");
  return new Uint8Array(raw);
}
function base64(data) {
  let s = "";
  for (let i = 0; i < data.length; i += 16384) s += String.fromCharCode(...data.subarray(i, i + 16384));
  return btoa(s);
}
function unbase64(value, limit) {
  insist(typeof value === "string" && value.length > 0 && value.length <= Math.ceil(limit / 3) * 4 && /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value), "The signed source encoding is invalid.");
  const result2 = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
  insist(result2.length <= limit && base64(result2) === value, "The signed source encoding is not canonical.");
  return result2;
}
async function sha256(raw) {
  insist(globalThis.crypto?.subtle, "Source integrity is unavailable in this browser.");
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", raw)), (b) => b.toString(16).padStart(2, "0")).join("");
}
function parse(raw) {
  try {
    return parseStrictJSON(UTF8.decode(raw));
  } catch {
    reject("SOURCE_REFUSED", "The verified source could not be read.");
  }
}
function utc(value) {
  return typeof value === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
}
function officialDate(event, date, now) {
  insist(exactKeys(event, ["schema", "id", "date", "timezone", "venue", "ritual", "sourceUrl", "archiveUrl", "officialPublishedDate", "officialDisplayedTime", "checkedAtUtc", "officialOriginalSha256", "officialReceiptSha256", "source", "verification", "status", "publicationApproved", "revision", "lessons"]) && event.schema === "glp.hukamnama.event.v1", "The daily record format is unsupported.");
  insist(event.date === date && event.id === "harmandir-morning." + date && event.officialPublishedDate === date, "The official date does not match the requested date.");
  insist(event.timezone === TIMEZONE && event.venue === "sri-harmandir-sahib" && event.ritual === "morning-mukhwak", "The venue or daily selection is not the requested reading.");
  insist(event.sourceUrl === "https://hs.sgpc.net/" && event.archiveUrl === "https://hs.sgpc.net/archiveView.php", "The official source reference is invalid.");
  insist(event.officialDisplayedTime === null || typeof event.officialDisplayedTime === "string" && event.officialDisplayedTime.length <= 100, "The publication time is invalid.");
  insist(utc(event.checkedAtUtc) && Date.parse(event.checkedAtUtc) <= +instant(now) + 3e5, "The source check date is invalid.");
  insist(event.status === VERIFIED && event.publicationApproved === false && event.verification === "COMPLETE_ORDERED_TEXT_EQUALITY", "This reader only admits digitally checked development records.");
  insist(Number.isSafeInteger(event.revision) && event.revision >= 1, "The event revision is invalid.");
  const s = event.source;
  insist(exactKeys(s, ["id", "edition", "textSha256", "sha256", "path"]) && HEX.test(s.textSha256) && HEX.test(s.sha256) && s.id === "sggs.text." + s.textSha256 && s.edition === EDITION2 && s.path === "./sources/" + s.textSha256 + ".json", "The original source binding is invalid.");
  insist(event.officialOriginalSha256 === s.textSha256 && HEX.test(event.officialReceiptSha256), "The official original does not match the source.");
  insist(exactKeys(event.lessons, ["simple", "detailed", "learning"]), "The explanation states are missing or unsupported.");
  return event;
}
async function decodeEvent(raw, requestedDate, { now, publicKey = PUBLICATION_KEY, keyId = KEY_ID } = {}) {
  checkDate(requestedDate, now);
  insist(PUBLICATION_MODE === "DEVELOPMENT_PREVIEW", "This publisher is not enabled.");
  const envelope = parse(bytes(raw, ENVELOPE_LIMIT));
  insist(plain(envelope) && Object.keys(envelope).sort().join(",") === "keyId,payload,schema,signature" && envelope.schema === "glp.hukamnama.envelope.v1" && envelope.keyId === keyId, "The signed envelope is not recognized.");
  const payload = unbase64(envelope.payload, ENVELOPE_LIMIT), signature = unbase64(envelope.signature, 64);
  insist(signature.byteLength === 64, "The source signature is invalid.");
  insist(globalThis.crypto?.subtle, "Source integrity is unavailable in this browser.");
  let verified = false;
  try {
    const key = await crypto.subtle.importKey("jwk", publicKey, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
    verified = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, signature, payload);
  } catch {
  }
  insist(verified, "The daily source signature could not be verified.");
  checkDate(requestedDate, now);
  return freeze(officialDate(parse(payload), requestedDate, now));
}
async function decodeSource(raw, event) {
  const data = bytes(raw, SOURCE_LIMIT);
  insist(event?.source && await sha256(data) === event.source.sha256, "The original source bytes do not match the signed record.");
  const source = parse(data), binding = event.source;
  insist(exactKeys(source, ["schema", "id", "edition", "textSha256", "angStart", "angEnd", "occurrences", "provenance"]) && source.schema === "glp.hukamnama.source.v1" && source.id === binding.id && source.edition === binding.edition && source.textSha256 === binding.textSha256, "The original source identity is invalid.");
  insist(Number.isInteger(source.angStart) && Number.isInteger(source.angEnd) && source.angStart >= 1 && source.angEnd <= 1430 && source.angStart <= source.angEnd, "The witnessed page span is invalid.");
  insist(Array.isArray(source.occurrences) && source.occurrences.length >= 2 && source.occurrences.length <= 3e3, "The complete original selection is missing.");
  const counts = /* @__PURE__ */ new Map(), texts = [];
  let previousAng = source.angStart;
  for (const line of source.occurrences) {
    insist(exactKeys(line, ["id", "text", "sha256", "kind", "ang"]) && typeof line.text === "string" && line.text.length > 0 && line.text.length <= 12e3 && /[\u0a00-\u0a7f]/u.test(line.text) && !/[<>\u0000-\u001f\u007f@\ufffd\uE000-\uF8FF]/u.test(line.text), "An original line is invalid.");
    insist(["heading", "rahao", "verse"].includes(line.kind) && Number.isInteger(line.ang) && line.ang >= previousAng && line.ang >= source.angStart && line.ang <= source.angEnd, "The original sequence is invalid.");
    const digest = await sha256(encoder.encode(line.text)), count = (counts.get(digest) || 0) + 1;
    counts.set(digest, count);
    insist(line.sha256 === digest && line.id === source.id + ".line." + digest + "." + count, "An original occurrence has changed.");
    previousAng = line.ang;
    texts.push(line.text);
  }
  insist(source.occurrences[0].ang === source.angStart && source.occurrences.at(-1).ang === source.angEnd && source.occurrences[0].kind === "heading", "The source boundaries are incomplete.");
  insist(await sha256(encoder.encode(texts.join(" "))) === source.textSha256 && source.textSha256 === event.officialOriginalSha256, "The complete original selection does not match.");
  const p = source.provenance;
  insist(exactKeys(p, ["repository", "commit", "pages", "comparison", "comparisonScope", "precedingSha256", "followingSha256"]) && p.comparisonScope === "Unique full ordered sequence among entries beginning at the official starting Ang; adjacent pages establish continuation and boundaries. Global corpus uniqueness is not asserted." && p.repository === "opengranth/open-granth" && p.commit === "34d2a7cab032c8ea24d21ff20f64653bd03766f4" && p.comparison === "COMPLETE_ORDERED_TEXT_EQUALITY" && HEX.test(p.precedingSha256) && HEX.test(p.followingSha256) && Array.isArray(p.pages) && p.pages.length > 0, "The source witness is incomplete.");
  const pageAngs = /* @__PURE__ */ new Set();
  for (const page of p.pages) {
    insist(exactKeys(page, ["ang", "url", "sha256"]) && Number.isInteger(page.ang) && page.ang >= 1 && page.ang <= 1430 && !pageAngs.has(page.ang) && HEX.test(page.sha256) && typeof page.url === "string" && page.url === "https://raw.githubusercontent.com/" + p.repository + "/" + p.commit + "/corpus/ang-" + String(page.ang).padStart(4, "0") + ".md", "A source witness page is invalid.");
    pageAngs.add(page.ang);
  }
  insist(source.occurrences.every((line) => pageAngs.has(line.ang)), "A continuation page is not witnessed.");
  for (const layer of ["simple", "detailed", "learning"]) {
    const languages = event.lessons[layer];
    if (languages === null) continue;
    insist(plain(languages) && Object.keys(languages).length > 0 && Object.keys(languages).length <= 10, "An explanation language map is invalid.");
    for (const [language, candidate] of Object.entries(languages)) insist(/^[a-z]{2,3}(?:-[A-Za-z]{2,8})?$/.test(language) && admitLesson(candidate, { event, source, layer, language }) !== null, "A declared explanation lacks the required source, review, rights or citations.");
  }
  return freeze(source);
}
function expectedURL(base, path) {
  const url = new URL(path, base);
  insist(url.origin === base.origin && ["http:", "https:"].includes(url.protocol) && !url.username && !url.password && !url.hash && !url.search, "The daily source must stay on this site.");
  return url;
}
async function responseBytes(response, url, limit) {
  if (!response || !response.ok) {
    const e = new Error("The dated source is not available from this site.");
    e.code = "FETCH_UNAVAILABLE";
    throw e;
  }
  insist(!response.redirected && (!response.url || response.url === url.href), "The dated source redirected away from its exact path.");
  const size = Number(response.headers?.get?.("content-length"));
  insist(!Number.isFinite(size) || size <= limit, "The dated source is too large.");
  if (response.body?.getReader) {
    const reader = response.body.getReader(), chunks = [];
    let total = 0;
    try {
      for (; ; ) {
        const part = await reader.read();
        if (part.done) break;
        insist(part.value instanceof Uint8Array, "The source stream is invalid.");
        total += part.value.byteLength;
        if (total > limit) {
          try {
            await reader.cancel();
          } catch {
          }
          reject("SOURCE_REFUSED", "The dated source exceeds its safe read limit.");
        }
        chunks.push(part.value);
      }
    } finally {
      reader.releaseLock();
    }
    insist(total > 0, "The dated source is empty.");
    const joined = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      joined.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return joined.buffer;
  }
  const raw = await response.arrayBuffer();
  bytes(raw, limit);
  return raw;
}
function pairBody(eventRaw, sourceRaw) {
  return JSON.stringify({ schema: "glp.hukamnama.cached-pair.v1", event: base64(new Uint8Array(eventRaw)), source: base64(new Uint8Array(sourceRaw)) });
}
async function readPair(cache, key, date, options) {
  const response = await cache.match(key, { ignoreSearch: false });
  if (!response) return null;
  const pair = parse(bytes(await response.arrayBuffer(), PAIR_LIMIT));
  insist(exactKeys(pair, ["schema", "event", "source"]) && pair.schema === "glp.hukamnama.cached-pair.v1", "The saved original is incomplete.");
  const event = await decodeEvent(unbase64(pair.event, ENVELOPE_LIMIT).buffer, date, options);
  const source = await decodeSource(unbase64(pair.source, SOURCE_LIMIT).buffer, event);
  return { event, source };
}
async function loadReading(date, { now, fetchImpl = globalThis.fetch, cacheStorage = globalThis.caches, baseURL = new URL("./", import.meta.url), signal, publicKey = PUBLICATION_KEY, keyId = KEY_ID } = {}) {
  let today;
  try {
    today = checkDate(date, now);
  } catch (error) {
    return { status: error.code || "SOURCE_REFUSED", requested: date, message: error.message };
  }
  let cache = null, eventURL, base;
  const verification = { now, publicKey, keyId };
  const stopped = () => {
    if (signal?.aborted) reject("ABORTED", "The reading request was cancelled.");
    if (date === today && amritsarDate(instant(now)) !== today) reject("DATE_ROLLED_OVER", "A new day has begun in Amritsar. Open today's reading.");
  };
  try {
    base = new URL("./", baseURL);
    eventURL = expectedURL(base, "./events/" + date + ".json");
    if (globalThis.location?.origin && /^https?:$/.test(globalThis.location.protocol)) insist(base.origin === globalThis.location.origin, "Daily records must come from this site.");
    try {
      cache = await cacheStorage?.open(RECORD_CACHE);
    } catch {
    }
    stopped();
    let eventRaw, sourceRaw, event, source;
    try {
      eventRaw = await responseBytes(await fetchImpl(eventURL.href, { credentials: "omit", redirect: "error", cache: "no-store", signal }), eventURL, ENVELOPE_LIMIT);
      stopped();
      event = await decodeEvent(eventRaw, date, verification);
      const sourceURL = expectedURL(base, event.source.path);
      sourceRaw = await responseBytes(await fetchImpl(sourceURL.href, { credentials: "omit", redirect: "error", cache: "no-store", signal }), sourceURL, SOURCE_LIMIT);
      stopped();
      source = await decodeSource(sourceRaw, event);
      stopped();
    } catch (error) {
      stopped();
      if (error.code === "SOURCE_REFUSED" || error.code === "INVALID_DATE" || error.code === "FUTURE_DATE") throw error;
      if (cache) {
        const saved = await readPair(cache, eventURL.href, date, verification);
        stopped();
        if (saved) return { status: VERIFIED, requested: date, amritsar: amritsarDate(instant(now)), ...saved, fromCache: true, cacheSaved: true };
      }
      return { status: date === amritsarDate(instant(now)) ? "TODAY_PENDING" : "DATE_UNAVAILABLE", requested: date, amritsar: amritsarDate(instant(now)), fromCache: false, message: "This dated original is not available here yet. The official source remains available." };
    }
    let cacheSaved = false;
    if (cache) {
      let saved = null;
      try {
        saved = await readPair(cache, eventURL.href, date, verification);
      } catch {
      }
      if (saved) {
        insist(event.revision >= saved.event.revision, "An earlier revision cannot replace the saved dated record.");
        if (event.revision === saved.event.revision) insist(JSON.stringify(event) === JSON.stringify(saved.event), "The same daily revision has conflicting content.");
      }
      stopped();
      try {
        await cache.put(eventURL.href, new Response(pairBody(eventRaw, sourceRaw), { headers: { "Content-Type": "application/json" } }));
        cacheSaved = true;
      } catch {
      }
    }
    stopped();
    return { status: VERIFIED, requested: date, amritsar: amritsarDate(instant(now)), event, source, fromCache: false, cacheSaved };
  } catch (error) {
    return { status: signal?.aborted ? "ABORTED" : error.code || "SOURCE_REFUSED", requested: date, fromCache: false, message: error.code ? "The dated reading was not shown: " + error.message : "The complete dated source could not be verified." };
  }
}
function admitLesson(candidate, { event, source, layer, language } = {}) {
  try {
    if (candidate === null || candidate === void 0) return null;
    if (!["simple", "detailed", "learning"].includes(layer) || !exactKeys(candidate, ["schema", "id", "revision", "kind", "layer", "language", "source", "review", "rights", "claims"]) || candidate.schema !== "glp.hukamnama.lesson.v1" || candidate.kind !== "source-explanation" || candidate.layer !== layer || candidate.language !== language) return null;
    const reference = event?.lessons?.[layer]?.[language];
    if (!plain(reference) || JSON.stringify(reference) !== JSON.stringify(candidate) || !Number.isSafeInteger(candidate.revision) || candidate.revision < 1) return null;
    const b = candidate.source;
    if (!exactKeys(b, ["id", "edition", "textSha256", "sha256"]) || !event?.source || !source || ["id", "edition", "textSha256", "sha256"].some((k) => b[k] !== event.source[k]) || source.id !== b.id || source.textSha256 !== b.textSha256) return null;
    const review = candidate.review, rights = candidate.rights;
    if (!exactKeys(review, ["id", "status", "reviewer", "approvedAtUtc"]) || !exactKeys(review.reviewer, ["name", "qualification"]) || !exactKeys(rights, ["id", "status", "basis", "reference", "permissions"]) || !exactKeys(rights.permissions, ["display", "print", "offline"]) || !Object.values(rights.permissions).every((value) => value === true)) return null;
    if (review?.status !== "QUALIFIED_APPROVED" || typeof review.reviewer?.name !== "string" || !review.reviewer.name.trim() || typeof review.reviewer?.qualification !== "string" || !review.reviewer.qualification.trim() || !utc(review.approvedAtUtc) || rights?.status !== "CLEARED" || typeof rights.basis !== "string" || !rights.basis.trim() || typeof rights.reference !== "string" || !rights.reference.trim()) return null;
    if (typeof review.id !== "string" || !review.id || typeof rights.id !== "string" || !rights.id) return null;
    if (!Array.isArray(candidate.claims) || candidate.claims.length === 0 || candidate.claims.length > 200) return null;
    const occurrences = new Map(source.occurrences.map((x) => [x.id, x]));
    for (const claim of candidate.claims) {
      if (!exactKeys(claim, ["text", "citations"]) || typeof claim.text !== "string" || !claim.text.trim() || claim.text.length > 2e4 || !Array.isArray(claim.citations) || claim.citations.length === 0) return null;
      for (const citation of claim.citations) {
        if (!exactKeys(citation, ["sourceId", "occurrenceId", "sha256"])) return null;
        const line = occurrences.get(citation.occurrenceId);
        if (citation.sourceId !== source.id || !line || citation.sha256 !== line.sha256) return null;
      }
    }
    return freeze({ id: candidate.id, revision: candidate.revision, kind: candidate.kind, layer, language, source: { ...b }, review: structuredClone(review), rights: structuredClone(rights), claims: structuredClone(candidate.claims) });
  } catch {
    return null;
  }
}

// hukamnama/learning.mjs
var LEARNING_KEY = "glp001.hukamnama.learning.v1";
var LEARNING_FORMAT = "glp-hukamnama-learning";
var EXPORT_FILENAME = "Hukamnama-learning.json";
var LIMITS = Object.freeze({ records: 500, question: 4e3, reflection: 4e4, store: 1e6 });
var HEX2 = /^[a-f0-9]{64}$/, ID2 = /^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$/;
function plain2(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function exactKeys2(value, required, optional = []) {
  return plain2(value) && required.every((k) => Object.hasOwn(value, k)) && Object.keys(value).every((k) => required.includes(k) || optional.includes(k));
}
function fail2(message) {
  throw Error(message);
}
function assert(value, message) {
  if (!value) fail2(message);
}
function clone(value) {
  return structuredClone(value);
}
function freeze2(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze2);
    Object.freeze(value);
  }
  return value;
}
function time(value) {
  return typeof value === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value));
}
function empty() {
  return { format: LEARNING_FORMAT, version: 1, revision: 0, records: [] };
}
function result(store, extra = {}) {
  const snapshot = freeze2(clone(store));
  return { ok: true, store: snapshot, revision: snapshot.revision, records: snapshot.records, ...extra };
}
function refusal(status, message) {
  return { ok: false, status, message };
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
function timestamp(now) {
  const date = new Date(typeof now === "function" ? now() : now ?? Date.now());
  assert(Number.isFinite(+date), "The note date is invalid.");
  return date.toISOString();
}
function validateBinding(binding) {
  const fields = ["eventId", "date", "sourceId", "edition", "sourceSha256", "textSha256", "lineId", "lineSha256"];
  assert(exactKeys2(binding, fields), "A note source binding is incomplete or unsupported.");
  assert(validDate(binding.date) && binding.eventId === "harmandir-morning." + binding.date, "A note date binding is invalid.");
  assert(HEX2.test(binding.textSha256) && HEX2.test(binding.sourceSha256) && binding.sourceId === "sggs.text." + binding.textSha256, "A note source identity is invalid.");
  assert(typeof binding.edition === "string" && /^[a-zA-Z0-9._-]{1,100}$/.test(binding.edition), "A note edition is invalid.");
  if (binding.lineId === null) {
    assert(binding.lineSha256 === null, "A note line binding is incomplete.");
  } else {
    assert(HEX2.test(binding.lineSha256) && typeof binding.lineId === "string" && binding.lineId.startsWith(binding.sourceId + ".line." + binding.lineSha256 + ".") && /^[1-9]\d*$/.test(binding.lineId.slice((binding.sourceId + ".line." + binding.lineSha256 + ".").length)), "A note line identity is invalid.");
  }
  return binding;
}
function validateText(record) {
  assert(typeof record.question === "string" && record.question.length <= LIMITS.question && typeof record.reflection === "string" && record.reflection.length <= LIMITS.reflection, "The note is too long or has an unsupported format. Nothing was shortened.");
}
function validateRecord(record) {
  assert(exactKeys2(record, ["id", "binding", "question", "reflection", "createdAt", "updatedAt"], ["conflictOf"]), "A saved note has an unsupported format.");
  assert(typeof record.id === "string" && ID2.test(record.id), "A saved note identity is invalid.");
  if (Object.hasOwn(record, "conflictOf")) assert(typeof record.conflictOf === "string" && ID2.test(record.conflictOf) && record.conflictOf !== record.id, "A conflict-copy identity is invalid.");
  validateBinding(record.binding);
  validateText(record);
  assert(time(record.createdAt) && time(record.updatedAt) && record.createdAt <= record.updatedAt, "A saved note date is invalid.");
  return record;
}
function validateLearning(value) {
  assert(exactKeys2(value, ["format", "version", "revision", "records"]) && value.format === LEARNING_FORMAT && value.version === 1, "This is not a supported Daily Hukamnama learning backup.");
  assert(Number.isSafeInteger(value.revision) && value.revision >= 0 && value.revision < Number.MAX_SAFE_INTEGER, "The learning revision is invalid.");
  assert(Array.isArray(value.records) && value.records.length <= LIMITS.records, "The Daily learning record is too large.");
  const ids = /* @__PURE__ */ new Set();
  for (const record of value.records) {
    validateRecord(record);
    assert(!ids.has(record.id), "The backup contains duplicate note identities.");
    ids.add(record.id);
  }
  assert(JSON.stringify(value).length <= LIMITS.store, "The Daily learning record is too large. Nothing was shortened.");
  return freeze2(clone(value));
}
function loadLearning({ storage } = {}) {
  const target = storageOf(storage);
  if (!target || typeof target.getItem !== "function") return refusal("STORAGE_UNAVAILABLE", "Private notes are unavailable in this browser. Your existing record has not been changed.");
  let raw;
  try {
    raw = target.getItem(LEARNING_KEY);
  } catch {
    return refusal("STORAGE_UNAVAILABLE", "Private notes could not be read. Your existing record has not been changed.");
  }
  if (raw === null) return result(empty());
  try {
    if (typeof raw !== "string" || raw.length > LIMITS.store) fail2("oversize");
    return result(validateLearning(JSON.parse(raw)));
  } catch {
    return refusal("MALFORMED_STORE", "The existing Daily learning record needs recovery. It has been preserved without alteration; no notes were replaced.");
  }
}
function stableBinding(binding) {
  return JSON.stringify(["eventId", "date", "sourceId", "edition", "sourceSha256", "textSha256", "lineId", "lineSha256"].map((key) => binding[key]));
}
function sameVersion(a, b) {
  return stableBinding(a.binding) === stableBinding(b.binding) && a.question === b.question && a.reflection === b.reflection && a.createdAt === b.createdAt && a.updatedAt === b.updatedAt;
}
function sameRecord(a, b) {
  return a.id === b.id && a.conflictOf === b.conflictOf && sameVersion(a, b);
}
function uniqueId(records, idFactory) {
  const existing = new Set(records.map((r) => r.id));
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = idFactory ? idFactory() : globalThis.crypto?.randomUUID?.();
    if (typeof id === "string" && ID2.test(id) && !existing.has(id)) return id;
  }
  fail2("A private note identity could not be created.");
}
function commit(target, store, extra = {}) {
  let serialized;
  try {
    validateLearning(store);
    serialized = JSON.stringify(store);
  } catch (error) {
    return refusal("SIZE_OR_FORMAT_LIMIT", error.message + " Your existing record has been preserved.");
  }
  try {
    target.setItem(LEARNING_KEY, serialized);
  } catch (error) {
    return refusal(error?.name === "QuotaExceededError" ? "QUOTA_EXCEEDED" : "STORAGE_UNAVAILABLE", "The browser could not save this Daily learning record. Your existing record has been preserved. Keep or export your unsaved text before trying again.");
  }
  return result(store, extra);
}
async function locked({ storage, locks }, work) {
  const target = storageOf(storage), manager = locksOf(locks);
  if (!target || typeof target.getItem !== "function" || typeof target.setItem !== "function") return refusal("STORAGE_UNAVAILABLE", "Private notes cannot be saved in this browser. Your existing record has been preserved.");
  if (!manager || typeof manager.request !== "function") return refusal("LOCK_UNAVAILABLE", "This browser cannot safely coordinate private note edits between tabs. Saving and importing are unavailable; existing notes remain readable and exportable.");
  try {
    return await manager.request(LEARNING_KEY, { mode: "exclusive" }, () => work(target));
  } catch {
    return refusal("LOCK_UNAVAILABLE", "The private note lock was unavailable. Your existing record has been preserved; your unsaved text is still yours to keep.");
  }
}
async function saveLearning({ storage, locks, record, baseRevision, now, idFactory } = {}) {
  try {
    assert(exactKeys2(record, ["binding", "question", "reflection"], ["id"]), "The new note has an unsupported format.");
    validateBinding(record.binding);
    validateText(record);
    assert(Number.isSafeInteger(baseRevision) && baseRevision >= 0, "Reload the saved notes before editing.");
    if (Object.hasOwn(record, "id")) assert(typeof record.id === "string" && ID2.test(record.id), "The note identity is invalid.");
  } catch (error) {
    return refusal("INVALID_NOTE", error.message + " Your existing record has been preserved.");
  }
  return locked({ storage, locks }, (target) => {
    const loaded = loadLearning({ storage: target });
    if (!loaded.ok) return loaded;
    const store = clone(loaded.store), existing = record.id ? store.records.find((r) => r.id === record.id) : null;
    if (record.id && !existing) return refusal("NOTE_NOT_FOUND", "The original saved note is not present. Your existing record has been preserved; keep this text as a new note.");
    if (existing && stableBinding(existing.binding) !== stableBinding(record.binding)) return refusal("SOURCE_BINDING_MISMATCH", "A note cannot be moved onto a different reading or line. Your existing record has been preserved.");
    const conflict = Boolean(existing && baseRevision !== store.revision), date = timestamp(now);
    if (existing && date < existing.createdAt) return refusal("INVALID_CLOCK", "The device clock predates this note. Your existing record has been preserved.");
    const saved = { id: existing && !conflict ? existing.id : uniqueId(store.records, idFactory), binding: clone(record.binding), question: record.question, reflection: record.reflection, createdAt: existing && !conflict ? existing.createdAt : date, updatedAt: date };
    if (conflict) saved.conflictOf = existing.id;
    else if (existing?.conflictOf) saved.conflictOf = existing.conflictOf;
    if (existing && !conflict) store.records[store.records.findIndex((r) => r.id === existing.id)] = saved;
    else store.records.push(saved);
    store.revision++;
    return commit(target, store, { status: conflict ? "CONFLICT_PRESERVED" : "SAVED", savedRecord: freeze2(clone(saved)), conflictPreserved: conflict, message: conflict ? "Another edit was saved first. Both versions have been kept as separate notes." : "Private note saved on this device." });
  });
}
function exportLearning({ storage } = {}) {
  const loaded = loadLearning({ storage });
  if (!loaded.ok) return loaded;
  return { ok: true, status: "EXPORTED", filename: EXPORT_FILENAME, text: JSON.stringify(loaded.store, null, 2) + "\n", revision: loaded.revision };
}
async function importLearning({ storage, locks, text: text2, idFactory } = {}) {
  let incoming;
  try {
    assert(typeof text2 === "string" && text2.length <= LIMITS.store * 2, "The backup is too large or unreadable.");
    incoming = validateLearning(JSON.parse(text2));
  } catch {
    return refusal("INVALID_IMPORT", "This file is not a complete supported Daily Hukamnama learning backup. Your existing record has been preserved; nothing was imported.");
  }
  return locked({ storage, locks }, (target) => {
    const loaded = loadLearning({ storage: target });
    if (!loaded.ok) return loaded;
    const store = clone(loaded.store), existingById = new Map(store.records.map((r) => [r.id, r])), pending = [];
    let conflicts = 0, added = 0;
    for (const item of incoming.records) {
      const existing = existingById.get(item.id);
      if (!existing) {
        store.records.push(clone(item));
        added++;
      } else if (!sameRecord(existing, item)) pending.push(item);
    }
    for (const item of pending) {
      if (store.records.some((r) => r.conflictOf === item.id && sameVersion(r, item))) continue;
      const saved = clone(item);
      saved.id = uniqueId([...store.records, ...incoming.records], idFactory);
      saved.conflictOf = item.id;
      store.records.push(saved);
      conflicts++;
      added++;
    }
    if (added === 0) return result(store, { status: "UNCHANGED", conflictPreserved: false, imported: 0, message: "This backup is already present. Your saved notes have not changed." });
    store.revision++;
    return commit(target, store, { status: conflicts ? "CONFLICT_PRESERVED" : "IMPORTED", conflictPreserved: conflicts > 0, imported: added, message: conflicts ? "Backup restored. Conflicting versions were kept as separate notes." : "Daily learning backup restored. Existing notes were kept." });
  });
}

// hukamnama/reader.mjs
var $ = (id) => document.getElementById(id);
var text = (tag, value, className) => {
  const node = document.createElement(tag);
  node.textContent = value;
  if (className) node.className = className;
  return node;
};
var PANELS = ["original", "simple", "detailed", "learning"];
var params = new URL(location.href).searchParams;
var clockDate = amritsarDate();
var requestedDates = params.getAll("date");
var selectedDate = requestedDates.length === 0 ? clockDate : requestedDates.length === 1 && validDate(requestedDates[0]) ? requestedDates[0] : "";
var followingToday = requestedDates.length === 0;
var active = null, requestNumber = 0, controller = null, busy = false, boundaryTimer = null;
var notes = loadLearning();
var editor = { id: null, binding: null, baseRevision: notes.ok ? notes.revision : 0, question: "", reflection: "" };
var selectedPanel = params.get("learning") === "saved" ? "learning" : PANELS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "original";
var messages = {
  INVALID_DATE: "Choose a valid calendar date. No reading has been substituted.",
  FUTURE_DATE: "This date has not yet arrived in Amritsar. No reading is shown.",
  TODAY_PENDING: "Today's verified selection is not available in this preview yet. Read today's publication on the official SGPC site above.",
  DATE_UNAVAILABLE: "A verified selection for this date is not available here. The official site remains available; no other reading has been substituted.",
  SOURCE_REFUSED: "The complete dated source could not be verified, so no original or explanation is shown. Your saved notes have not been changed.",
  DATE_ROLLED_OVER: "The date changed in Amritsar while the reading was opening. Checking the new date.",
  ABORTED: "The previous request was cancelled."
};
function formattedDate(value) {
  if (!validDate(value)) return value || "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(/* @__PURE__ */ new Date(value + "T12:00:00Z"));
}
function formatChecked(value) {
  const date = new Date(value);
  return Number.isFinite(+date) ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(date) + " in Amritsar" : "Not available";
}
function external(label, href) {
  const node = text("a", label), url = new URL(href);
  if (url.protocol !== "https:" || url.username || url.password) throw Error("Invalid source link");
  node.href = url.href;
  node.target = "_blank";
  node.rel = "noopener noreferrer";
  return node;
}
function showPanel(name, { updateHash = true, focus = false } = {}) {
  if (!PANELS.includes(name)) return;
  selectedPanel = name;
  for (const key of PANELS) $(key + "-panel").hidden = key !== name;
  for (const link of document.querySelectorAll("[data-panel]")) {
    if (link.dataset.panel === name) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  if (updateHash) history.replaceState(null, "", location.pathname + location.search + "#" + name);
  if (focus) {
    const heading = $(name + "-title");
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
}
function sameBindingSource(binding) {
  return Boolean(active && binding && binding.eventId === active.event.id && binding.date === active.event.date && binding.sourceId === active.source.id && binding.edition === active.source.edition && binding.sourceSha256 === active.event.source.sha256 && binding.textSha256 === active.source.textSha256);
}
function sourceBinding() {
  if (!active) return null;
  return {
    eventId: active.event.id,
    date: active.event.date,
    sourceId: active.source.id,
    edition: active.source.edition,
    sourceSha256: active.event.source.sha256,
    textSha256: active.source.textSha256,
    lineId: null,
    lineSha256: null
  };
}
function draft() {
  return { binding: editor.binding, question: $("question").value, reflection: $("reflection").value };
}
function dirty() {
  return $("question").value !== editor.question || $("reflection").value !== editor.reflection;
}
function protectDraft() {
  if (busy) {
    $("note-status").textContent = "Please wait for the current save or import to finish. Your text is still here.";
    return false;
  }
  if (!dirty()) return true;
  return window.confirm("You have unsaved text in Learning. Cancel to keep editing, save it, or download it. OK discards the unsaved changes before switching.");
}
function updateEditorControls() {
  const bound = Boolean(editor.binding), writable = bound && notes.ok && !busy;
  $("question").disabled = !bound || busy;
  $("reflection").disabled = !bound || busy;
  $("save-note").disabled = !writable;
  $("new-note").disabled = !active || busy;
  $("line-choice").disabled = !bound || Boolean(editor.id) || !sameBindingSource(editor.binding) || busy;
  $("export-draft").disabled = !bound || !dirty();
  $("export-learning").disabled = busy;
  $("import-learning").disabled = busy;
}
function refreshSelectedLine() {
  const line = sameBindingSource(editor.binding) && editor.binding.lineId ? active.source.occurrences.find((item) => item.id === editor.binding.lineId && item.sha256 === editor.binding.lineSha256) : null;
  $("selected-line").textContent = line ? line.text : "";
  $("selected-line").hidden = !line;
}
function refreshEditorSource() {
  $("line-choice").replaceChildren(new Option("Complete reading", ""));
  if (active && sameBindingSource(editor.binding)) {
    for (const line of active.source.occurrences) $("line-choice").append(new Option(line.text, line.id));
  }
  if (editor.binding?.lineId) {
    if (![...$("line-choice").options].some((option) => option.value === editor.binding.lineId)) $("line-choice").append(new Option("Saved line — its original source is not open", editor.binding.lineId));
    $("line-choice").value = editor.binding.lineId;
  }
  if (!editor.binding) $("editor-source").textContent = "Open a verified dated reading to start a new note, or open a saved note below.";
  else {
    const detail = sameBindingSource(editor.binding) ? "This note is attached to this exact original." : "This note keeps its saved source identity. That exact original is not currently open; it has not been attached to another reading.";
    $("editor-source").textContent = formattedDate(editor.binding.date) + " · " + detail;
  }
  refreshSelectedLine();
  updateEditorControls();
}
function setEditor(record = null) {
  editor = {
    id: record?.id || null,
    binding: record ? structuredClone(record.binding) : sourceBinding(),
    baseRevision: notes.ok ? notes.revision : 0,
    question: record?.question || "",
    reflection: record?.reflection || ""
  };
  $("question").value = editor.question;
  $("reflection").value = editor.reflection;
  refreshEditorSource();
  $("note-title").textContent = record ? "Your saved question and reflection" : "Your private question and reflection";
  $("note-status").textContent = record ? record.conflictOf ? "This is a preserved version of a conflicting edit." : "Saved note opened. Changes stay unsaved until you choose Save." : "No note has been saved by opening this page.";
  if (!notes.ok) $("note-status").textContent = notes.message;
  refreshSelectedLine();
  updateEditorControls();
}
function clearReading() {
  active = null;
  $("reading").hidden = true;
  $("reading-empty").hidden = false;
  $("scripture").replaceChildren();
  $("source-details").replaceChildren();
  $("reading-title").textContent = "";
  $("meta").textContent = "";
  $("checked").textContent = "";
  for (const layer of ["simple", "detailed", "learning"]) {
    $(layer + "-content").replaceChildren();
    $(layer + "-pending").hidden = false;
  }
}
function refreshReadingLabels() {
  if (!active) return;
  const current = active.event.date === amritsarDate();
  $("reading-title").textContent = (current ? "Today's original · " : "Historical original · ") + formattedDate(active.event.date);
  $("meta").textContent = "Ang " + active.source.angStart + (active.source.angEnd !== active.source.angStart ? "–" + active.source.angEnd : "") + " · Sri Harmandir Sahib";
  $("checked").textContent = "Source checked " + formatChecked(active.event.checkedAtUtc) + ".";
  $("status").textContent = (active.fromCache ? "Opened from this browser's verified source cache." : "Complete original text checked.") + " Development preview.";
}
function showSourceLine(id) {
  const node = [...$("scripture").children].find((item) => item.dataset.occurrence === id);
  if (!node) return;
  showPanel("original");
  node.tabIndex = -1;
  node.focus({ preventScroll: true });
  node.scrollIntoView({ block: "center", behavior: "auto" });
}
function renderLessons() {
  for (const layer of ["simple", "detailed", "learning"]) {
    const admitted = admitLesson(active.event.lessons?.[layer]?.en, { event: active.event, source: active.source, layer, language: "en" });
    const container = $(layer + "-content");
    container.replaceChildren();
    $(layer + "-pending").hidden = Boolean(admitted);
    if (!admitted) continue;
    container.append(text("p", "Qualified review: " + admitted.review.reviewer.name + " · " + admitted.review.reviewer.qualification, "review-label"));
    for (const claim of admitted.claims) {
      const paragraph = text("p", claim.text);
      container.append(paragraph);
      const citations = document.createElement("div");
      citations.className = "claim-citations";
      claim.citations.forEach((citation, index) => {
        const button = text("button", "View source line" + (claim.citations.length > 1 ? " " + (index + 1) : ""), "secondary");
        button.type = "button";
        button.addEventListener("click", () => showSourceLine(citation.occurrenceId));
        citations.append(button);
      });
      container.append(citations);
    }
  }
}
function renderReading(result2) {
  active = result2;
  $("scripture").replaceChildren();
  for (const line of result2.source.occurrences) {
    const block = document.createElement("div");
    block.className = "pankti";
    block.dataset.kind = line.kind;
    block.dataset.occurrence = line.id;
    block.append(text("p", line.text, "original-text"));
    block.append(text("small", (line.kind === "rahao" ? "Rahao · " : "") + "Ang " + line.ang, "line-reference"));
    $("scripture").append(block);
  }
  $("source-details").append(
    text("p", "Official dated selection: " + result2.event.date + (result2.event.officialDisplayedTime ? " · published time shown by SGPC: " + result2.event.officialDisplayedTime : "")),
    text("p", "The complete ordered original was compared with a pinned digital transcription. This is a digital comparison, not a claim of qualified approval."),
    text("p", "Independent and qualified review remain separate. Daily automatic publication is not yet enabled."),
    text("p", "The library signs its own dated data to detect transport changes. SGPC has not signed the library’s record."),
    external("Open SGPC's current publication ↗", result2.event.sourceUrl),
    text("p", "The external portal shows its current publication; check its date separately.")
  );
  if (result2.source.provenance?.pages) {
    const list = document.createElement("ul");
    for (const page of result2.source.provenance.pages) {
      const item = document.createElement("li");
      item.append(external("Digital reference · Ang " + page.ang, page.url));
      list.append(item);
    }
    $("source-details").append(list);
  }
  $("reading").hidden = false;
  $("reading-empty").hidden = true;
  refreshReadingLabels();
  renderLessons();
}
function updateDateAddress(date, { today = false, preserveInvalidURL = false } = {}) {
  const address = new URL(location.href);
  if (today) address.searchParams.delete("date");
  else if (validDate(date) || !preserveInvalidURL) address.searchParams.set("date", date);
  history.replaceState(null, "", address.pathname + address.search + address.hash);
}
async function openDate(date, { today = false, record = null, bypassGuard = false, preserveInvalidURL = false } = {}) {
  if (!bypassGuard && !protectDraft()) {
    $("date").value = selectedDate;
    return false;
  }
  followingToday = today;
  selectedDate = date;
  updateDateAddress(date, { today, preserveInvalidURL });
  if (validDate(date)) $("date-controls").open = false;
  const request = ++requestNumber;
  if (controller) controller.abort();
  controller = new AbortController();
  clearReading();
  setEditor(record);
  $("date").value = date;
  $("rollover").hidden = true;
  $("status").textContent = "Checking the complete original for " + (formattedDate(date) || "the selected date") + "…";
  let result2;
  try {
    result2 = await loadReading(date, { baseURL: new URL("./", location.href), signal: controller.signal });
  } catch {
    result2 = { status: "SOURCE_REFUSED" };
  }
  if (request !== requestNumber) return false;
  if (result2.status === "DATE_ROLLED_OVER" && followingToday && !dirty()) {
    clockDate = amritsarDate();
    return openDate(clockDate, { today: true, bypassGuard: true });
  }
  if (followingToday && date !== amritsarDate() && !dirty()) return openDate(amritsarDate(), { today: true, bypassGuard: true });
  if (result2.status !== "DIGITAL_TEXT_VERIFIED_PREVIEW") {
    $("status").textContent = messages[result2.status] || messages.SOURCE_REFUSED;
    if (record) refreshEditorSource();
    return false;
  }
  renderReading(result2);
  if (record) refreshEditorSource();
  else if (!dirty()) setEditor();
  return true;
}
function refreshSaved() {
  notes = loadLearning();
  $("saved-list").replaceChildren();
  if (!notes.ok) {
    $("saved-status").textContent = notes.message;
    updateEditorControls();
    return;
  }
  $("saved-status").textContent = notes.records.length ? "These notes belong to this browser. Each keeps its original date and source identity." : "No Daily Hukamnama notes are saved on this device yet.";
  const sorted = [...notes.records].sort((a, b) => b.binding.date.localeCompare(a.binding.date) || b.updatedAt.localeCompare(a.updatedAt));
  for (const record of sorted) {
    const item = document.createElement("li");
    item.className = "saved-card";
    item.append(text("h4", formattedDate(record.binding.date)), text("p", record.binding.lineId ? "Attached to one exact line" : "Attached to the complete original", "small"));
    if (record.conflictOf) item.append(text("p", "Preserved version from a conflicting edit", "state-label"));
    if (record.question) {
      item.append(text("strong", "My question"), text("p", record.question, "private-preview"));
    }
    if (record.reflection) {
      item.append(text("strong", "My reflection"), text("p", record.reflection, "private-preview"));
    }
    const button = text("button", "Open saved note", "secondary");
    button.type = "button";
    button.dataset.noteId = record.id;
    button.addEventListener("click", async () => {
      if (!protectDraft()) return;
      showPanel("learning");
      await openDate(record.binding.date, { record, bypassGuard: true });
      $("note-title").scrollIntoView({ block: "start", behavior: "auto" });
    });
    item.append(button);
    $("saved-list").append(item);
  }
  updateEditorControls();
}
function download(content, filename, type = "application/json;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type })), link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
async function saveNote(event) {
  event.preventDefault();
  if (!editor.binding || busy) return;
  const submitted = draft(), recordId = editor.id;
  if (!submitted.question && !submitted.reflection) {
    $("note-status").textContent = "Write a question or a reflection before saving.";
    return;
  }
  const submittedRecord = { ...submitted };
  if (recordId) submittedRecord.id = recordId;
  busy = true;
  updateEditorControls();
  let result2;
  try {
    result2 = await saveLearning({ record: submittedRecord, baseRevision: editor.baseRevision });
  } catch {
    result2 = { ok: false, message: "The note could not be saved. Your text is still here; download the unsaved text before leaving." };
  }
  busy = false;
  if (result2.ok) {
    editor = { ...editor, id: result2.savedRecord.id, baseRevision: result2.revision, question: submitted.question, reflection: submitted.reflection };
    refreshSaved();
    $("note-title").textContent = "Your saved question and reflection";
  }
  $("note-status").textContent = result2.message;
  updateEditorControls();
}
async function importBackup(file) {
  if (!file || busy) return;
  if (file.size > LIMITS.store * 8) {
    $("backup-status").textContent = "This file is too large for a Daily backup. Your existing record has been preserved.";
    return;
  }
  busy = true;
  updateEditorControls();
  let result2;
  try {
    result2 = await importLearning({ text: await file.text() });
  } catch {
    result2 = { ok: false, message: "The backup could not be read. Your existing record and any unsaved text have been preserved." };
  }
  busy = false;
  if (result2.ok) refreshSaved();
  $("backup-status").textContent = result2.message;
  updateEditorControls();
}
function scheduleClockBoundary() {
  clearTimeout(boundaryTimer);
  const nextMidnight = Date.parse(amritsarDate() + "T00:00:00+05:30") + 864e5;
  boundaryTimer = setTimeout(checkClock, Math.max(1, nextMidnight - Date.now()));
}
function checkClock() {
  scheduleClockBoundary();
  const next = amritsarDate();
  $("clock").textContent = "Today in Amritsar: " + formattedDate(next);
  $("date").max = next;
  if (clockDate === next) return;
  clockDate = next;
  if (active) refreshReadingLabels();
  if (followingToday && selectedDate !== next) {
    if (dirty() || busy) {
      followingToday = false;
      updateDateAddress(selectedDate);
      $("rollover").hidden = false;
      $("rollover").textContent = "A new date has begun in Amritsar. Your unsaved text stays attached to " + formattedDate(selectedDate) + ". Save or download it, then choose Today in Amritsar.";
    } else {
      void openDate(next, { today: true, bypassGuard: true });
    }
  }
}
async function registerOffline() {
  const area = $("offline-status");
  if (!("serviceWorker" in navigator) || !globalThis.isSecureContext) {
    area.textContent = "Offline reader pages are not available in this browser context.";
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register(new URL("../sw.js", import.meta.url), { updateViaCache: "none" });
    const report = () => {
      if (registration.waiting) area.textContent = "A reader update is waiting. Open the Library home for the explicit update controls; this page will not reload itself.";
      else if (registration.active) area.textContent = "The reader shell is available offline. A dated reading must also be saved in this browser’s verified source cache.";
      else area.textContent = "Downloading the reader pages for offline use…";
    };
    report();
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      if (worker) worker.addEventListener("statechange", report);
      report();
    });
    navigator.serviceWorker.addEventListener("controllerchange", report);
  } catch {
    area.textContent = "Offline reader pages could not be prepared. Online reading and private-note recovery remain separate.";
  }
}
function init() {
  const offline = document.createElement("p");
  offline.id = "offline-status";
  offline.className = "small no-print";
  offline.textContent = "Checking offline reader availability…";
  const home = document.createElement("p");
  home.className = "small no-print";
  const homeLink = text("a", "Library home and update controls");
  homeLink.href = "../index.html";
  home.append(homeLink);
  $("date-help").after(offline, home);
  $("open").disabled = false;
  $("today").disabled = false;
  for (const link of document.querySelectorAll("[data-panel]")) link.addEventListener("click", (event) => {
    event.preventDefault();
    showPanel(link.dataset.panel, { focus: true });
  });
  window.addEventListener("hashchange", () => showPanel(location.hash.slice(1), { updateHash: false }));
  $("open").addEventListener("click", () => openDate($("date").value));
  $("today").addEventListener("click", () => openDate(amritsarDate(), { today: true }));
  $("date").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void openDate($("date").value);
    }
  });
  $("font-size").addEventListener("input", () => {
    const value = Number($("font-size").value);
    if (value >= 24 && value <= 52) {
      $("scripture").style.setProperty("--g-size", value + "px");
      $("font-value").textContent = value + " px";
    }
  });
  $("print").addEventListener("click", () => window.print());
  $("line-choice").addEventListener("change", () => {
    if (editor.id || !active || !editor.binding) return;
    const line = active.source.occurrences.find((item) => item.id === $("line-choice").value);
    editor.binding = { ...sourceBinding(), lineId: line?.id || null, lineSha256: line?.sha256 || null };
    refreshSelectedLine();
  });
  for (const id of ["question", "reflection"]) $(id).addEventListener("input", () => {
    $("note-status").textContent = dirty() ? "Unsaved text — save on this device or download it before leaving." : "No unsaved changes.";
    updateEditorControls();
  });
  $("note-form").addEventListener("submit", saveNote);
  $("saved-link").addEventListener("click", (event) => {
    event.preventDefault();
    showPanel("learning");
    $("saved-notes").scrollIntoView({ block: "start", behavior: "auto" });
  });
  $("new-note").addEventListener("click", () => {
    if (protectDraft()) {
      refreshSaved();
      setEditor();
    }
  });
  $("export-draft").addEventListener("click", () => {
    if (!editor.binding) return;
    download(JSON.stringify({ format: "glp-hukamnama-unsaved-text", version: 1, ...draft() }, null, 2) + "\n", "Hukamnama-unsaved-text.json");
    $("note-status").textContent = "Your current text was downloaded as a recovery file. This is not an importable Daily backup; the unsaved text remains here.";
  });
  $("export-learning").addEventListener("click", () => {
    const result2 = exportLearning();
    if (!result2.ok) {
      $("backup-status").textContent = result2.message;
      return;
    }
    download(result2.text, result2.filename);
    $("backup-status").textContent = "Saved Daily learning exported." + (dirty() ? " Your current unsaved text is not in this backup; use Download unsaved text for it." : "");
  });
  $("import-learning").addEventListener("click", () => $("import-file").click());
  $("import-file").addEventListener("change", async () => {
    const file = $("import-file").files[0];
    $("import-file").value = "";
    await importBackup(file);
  });
  window.addEventListener("beforeunload", (event) => {
    if (dirty() || busy) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
  window.addEventListener("storage", (event) => {
    if (event.key === LEARNING_KEY || event.key === null) {
      refreshSaved();
      if (editor.id) $("note-status").textContent = "Saved learning changed in another tab. Your current text stays here; saving keeps conflicting versions separately.";
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) checkClock();
  });
  window.addEventListener("pageshow", checkClock);
  window.addEventListener("focus", checkClock);
  showPanel(selectedPanel, { updateHash: false });
  refreshSaved();
  checkClock();
  void openDate(selectedDate, { today: followingToday, bypassGuard: true, preserveInvalidURL: requestedDates.length > 0 && selectedDate === "" });
  void registerOffline();
}
init();
