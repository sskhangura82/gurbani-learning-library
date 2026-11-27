// knowledge/source-lock.mjs
var SCRIPTURE_SHA256 = "cf5b6e72f1cfaad9180d41f4214081cb3dc795644309696d8aba91f3ede64d7b";

// knowledge/registry.mjs
var need = (ok, message) => {
  if (!ok) throw Error(message);
};
var utf8 = new TextEncoder(), decode = new TextDecoder("utf-8", { fatal: true });
async function sha256(value) {
  const bytes = typeof value === "string" ? utf8.encode(value) : value;
  const result = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(result), (x) => x.toString(16).padStart(2, "0")).join("");
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
      const exact = labelWords(q), framed = aliasQuery(q);
      for (const { node, labels: labelsForNode } of labels) {
        for (const label of labelsForNode) {
          const score = label.text === exact ? 100 : framed !== exact && label.text === framed ? 90 : 0;
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
var require2 = (ok, message) => {
  if (!ok) throw Error(message);
};
var nonempty = (s) => typeof s === "string" && !!s.trim();
function unique2(items, what) {
  const map = /* @__PURE__ */ new Map();
  for (const x of items) {
    require2(nonempty(x.id) && !map.has(x.id), "Duplicate/missing " + what + " ID");
    map.set(x.id, x);
  }
  return map;
}
function buildIndex(g) {
  require2(g?.schema === "glp.knowledge.v1" && g.status === "NONPUBLISHING_DRAFT", "Not a development knowledge pack");
  require2(Array.isArray(g.nodes) && Array.isArray(g.occurrences) && Array.isArray(g.edges), "Incomplete knowledge pack");
  const nodes = unique2(g.nodes, "node"), occ = unique2(g.occurrences, "occurrence");
  unique2(g.edges, "edge");
  const typed = (id, type) => nodes.get(id)?.type === type;
  const ref = (id, type) => require2(typed(id, type), "Broken " + type + " reference: " + id);
  const passages = g.nodes.filter((n) => n.type === "passage"), used = /* @__PURE__ */ new Set();
  for (const n of g.nodes) {
    require2(types.has(n.type), "Unknown node type");
    if (n.type === "edition") {
      ref(n.collectionId, "collection");
      require2(n.humanCollated === false, "No qualified collation asserted in this pilot");
    }
    if (n.type === "composition") ref(n.collectionId, "collection");
    if (n.type === "concept" && n.lessonId) {
      ref(n.lessonId, "lesson");
      require2(nodes.get(n.lessonId).subjectId === n.id, "Wrong lesson subject");
    }
    if (n.type === "lesson") {
      ref(n.subjectId, "concept");
      require2(Number.isInteger(n.revision) && n.revision > 0 && n.review === "AI_ASSISTED_DRAFT", "Invalid lesson review/revision");
      require2(Array.isArray(n.sourcePassageIds) && n.sourcePassageIds.length > 0, "Lesson lacks source passages");
      for (const id of n.sourcePassageIds) ref(id, "passage");
      for (const k of ["simple", "detailed", "deep"]) require2(nonempty(n[k]?.en) && nonempty(n[k]?.pa), "Missing bilingual teaching layer");
    }
    if (n.type === "course") {
      require2(Array.isArray(n.orderedLessonIds) && n.orderedLessonIds.length > 0, "Course has no lessons");
      for (const id of n.orderedLessonIds) ref(id, "lesson");
    }
    if (n.type === "word") {
      require2(n.senses?.length > 0, "Word without sense");
      for (const s of n.senses) {
        ref(s.passageId, "passage");
        require2(s.review === "AI_ASSISTED_DRAFT" && nonempty(s.en) && nonempty(s.pa) && nonempty(s.form) && s.occurrenceIds?.length > 0, "Unbound vocabulary sense");
        for (const id of s.occurrenceIds) {
          const o = occ.get(id);
          require2(o?.passageId === s.passageId && o.text.split(/\s+/u).includes(s.form), "Word sense does not match exact occurrence");
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
    require2(nodes.get(p.editionId).collectionId === p.collectionId && nodes.get(p.compositionId).collectionId === p.collectionId, "Cross-collection mismatch");
    require2(p.review === "DIGITAL_SOURCE_DRAFT" && p.occurrenceIds?.length > 0 && p.occurrenceIds.includes(p.focusId), "Unbound passage");
    let prior = null;
    for (const id of p.occurrenceIds) {
      const o = occ.get(id);
      require2(o && o.passageId === p.id && o.editionId === p.editionId && o.ang >= p.angStart && o.ang <= p.angEnd && nonempty(o.text) && /^[a-f0-9]{40}$/.test(o.sourceBlob), "Invalid source occurrence");
      require2(!used.has(id), "Duplicate source occurrence in passage membership");
      used.add(id);
      if (prior) require2(o.ang > prior.ang || o.ang === prior.ang && o.ordinal > prior.ordinal, "Source order mismatch");
      prior = o;
    }
  }
  require2(used.size === occ.size, "Orphan source occurrence");
  for (const e of g.edges) {
    const a = nodes.get(e.from), b = nodes.get(e.to), sig = relationships[e.type];
    require2(a && b && sig && a.type === sig[0] && b.type === sig[1], "Invalid relationship endpoints");
    if (editorial.has(e.type)) {
      require2(e.review === "EDITORIAL_DRAFT" && nonempty(e.reason) && Array.isArray(e.refs) && e.refs.length > 0, "Unreviewed or unsupported editorial edge");
      for (const id of e.refs) ref(id, "passage");
    } else require2(e.review === "SOURCE_DRAFT", "Source edge status mismatch");
    if (e.type === "psychological_parallel" || e.type === "philosophical_comparison") require2(nonempty(e.similarity) && nonempty(e.difference) && nonempty(b.reference), "Comparison requires similarity, difference and reference");
    if (e.type === "written_by") require2(a.authorId === b.id, "Author edge disagrees with source metadata");
    if (e.type === "contains") require2(b.compositionId === a.id, "Composition edge disagrees with source metadata");
    if (e.type === "in_raag") require2(a.raagId === b.id, "Raag edge disagrees with source metadata");
  }
  require2(g.coverage.qualifiedApproved === 0 && g.coverage.originalOccurrences === occ.size && g.coverage.passageCount === passages.length, "Coverage mismatch");
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
var el = (tag, text, cls) => {
  const n = document.createElement(tag);
  if (text !== void 0) n.textContent = text;
  if (cls) n.className = cls;
  return n;
};
var section = $("content"), status = $("status"), results = $("results"), wordDialog = $("word-dialog");
var index, current = null, depth = "simple", returnFocus = null;
var link = (text, url) => {
  const a = el("a", text);
  const u = new URL(url);
  if (u.protocol !== "https:" || u.username || u.password) throw Error("Unsafe source URL");
  a.href = u.href;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  return a;
};
var control = (text, fn) => {
  const b = el("button", text);
  b.type = "button";
  b.addEventListener("click", fn);
  return b;
};
var note = (text) => el("p", text, "note");
var kindLabel = (n) => contentKind(n) === "scripture" ? "Original Gurbani · digital source" : contentKind(n) === "source-index" ? "Source index" : n.type === "study" ? "Comparative study · editorial draft" : n.type === "word" ? "Dictionary entry · editorial draft" : n.type === "lesson" ? "Lesson · editorial draft" : n.type === "course" ? "Learning pathway · editorial draft" : "Library topic · editorial draft";
var editorialNote = (text) => {
  const p = note(text);
  p.classList.add("editorial-note");
  p.dataset.contentKind = "editorial";
  return p;
};
var addText = (parent, x) => {
  if (!x) return;
  const copy = el("div", void 0, "editorial-copy");
  copy.dataset.contentKind = "editorial";
  copy.setAttribute("aria-label", "Editorial explanation draft");
  copy.append(el("p", "Editorial explanation · awaiting qualified review", "editorial-label"), el("p", x.en));
  const pa = el("p", x.pa, "editorial-pa");
  pa.lang = "pa";
  copy.append(pa);
  parent.append(copy);
};
var routeParams = () => new URLSearchParams(location.hash.slice(1));
var selectedLine = null, navToken = history.state?.glpKnowledgeToken || crypto.randomUUID(), renderedHash = null, scrollTimer;
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
  if (route.depth !== "simple") p.set("depth", route.depth);
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
  renderedHash = location.hash;
  render();
  const target = selectedLine ? section.querySelector('[data-occurrence="' + selectedLine + '"]') : section;
  if (focus) {
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
  requestAnimationFrame(() => {
    if (restoreScroll !== null) scrollTo(0, restoreScroll);
    else if (focus) (selectedLine ? section.querySelector('[data-occurrence="' + selectedLine + '"]') : section)?.scrollIntoView({ block: "start", behavior: "auto" });
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
  if (index) followHistory();
});
window.addEventListener("hashchange", () => {
  if (index && renderedHash !== location.hash) followHistory();
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
  const title = el("span", n.title || n.id, "result-title " + (kind === "scripture" ? "scripture-title" : kind === "editorial" ? "editorial-title" : "source-index-title"));
  if (kind === "scripture") title.lang = "pa";
  b.append(el("span", kindLabel(n), "result-kind"), title);
  if (n.pa) {
    const pa = el("span", n.pa, kind === "editorial" ? "editorial-pa" : "source-index-pa");
    pa.lang = "pa";
    b.append(pa);
  }
  const div = el("div");
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
    const occurrence = index.occ.get(hit.occurrenceIds[0]), quote = el("p", occurrence.text, "result-quote");
    quote.lang = "pa";
    quote.dataset.contentKind = "scripture";
    quote.dataset.occurrence = occurrence.id;
    quote.setAttribute("aria-label", "Original Gurbani match from the pinned digital source");
    div.append(quote);
  }
  return div;
}
function showWord(occ, form, button) {
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
  returnFocus = button;
  wordDialog.showModal();
}
wordDialog.addEventListener("close", () => {
  if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
});
$("close-word").addEventListener("click", () => wordDialog.close());
function render() {
  const n = index.nodes.get(current);
  section.replaceChildren();
  if (!n) {
    section.append(el("h2", "This learning link is unavailable"), note("This link does not identify an item or line in the current pilot."), control("Start exploring", () => open("concept.humility")));
    return;
  }
  const back = control("← Previous learning page", navigateBack);
  back.disabled = history.state?.glpKnowledgeToken !== navToken || history.state.step <= 0;
  section.append(back);
  const kind = contentKind(n);
  section.append(el("p", kindLabel(n) + " · DEVELOPMENT DRAFT", "kicker"));
  const heading = el("h2", n.title || n.id, kind === "scripture" ? "scripture-title" : kind === "editorial" ? "editorial-title" : "source-index-title");
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
    const p = el("p", n.pa, kind === "editorial" ? "editorial-pa" : "source-index-pa");
    p.dataset.contentKind = kind;
    p.lang = "pa";
    section.append(p);
  }
  if (n.type === "concept") {
    const l = n.lessonId && index.nodes.get(n.lessonId);
    if (l) {
      const modes2 = el("div", void 0, "modes");
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
    const body = el("div", void 0, "scripture");
    body.dataset.contentKind = "scripture";
    body.setAttribute("aria-label", "Original Gurbani from the pinned digital source");
    body.lang = "pa";
    if (selectedLine) {
      const label = el("p", "Selected line is highlighted below", "line-label");
      label.lang = "en";
      section.append(label);
    }
    for (const o of passageLines(index, n.id)) {
      const line = el("p", void 0, "pankti");
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
      section.append(note("Source word · contextual explanation below is an editorial draft"), el("h3", s.form, "source-token"));
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
    section.append(el("h3", "Related knowledge"));
    for (const { edge, node } of edges) {
      const box = el("div", void 0, "connection");
      box.append(row(node, edge.type.replaceAll("_", " ")));
      if (edge.reason) box.append(editorialNote("Editorial connection: " + edge.reason));
      if (edge.similarity) {
        const comparison = el("div", void 0, "editorial-copy");
        comparison.dataset.contentKind = "editorial";
        comparison.setAttribute("aria-label", "Editorial comparison, not a Gurbani explanation");
        comparison.append(el("p", "Comparative study · editorial draft", "editorial-label"), el("p", "Similarity: " + edge.similarity), el("p", "Difference: " + edge.difference), note("Editorial comparison awaiting independent and qualified review."));
        box.append(comparison);
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
      const opt = el("option", n.title);
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
    displayRoute(route, { restoreScroll: previous?.glpKnowledgeToken === navToken && Number.isFinite(previous.scroll) ? previous.scroll : null, focus: !!route?.line });
  } catch (e) {
    status.textContent = "Knowledge pack could not be verified. Nothing is displayed.";
    results.replaceChildren();
    section.replaceChildren();
  }
}
start();
export {
  PACK_SHA256
};
