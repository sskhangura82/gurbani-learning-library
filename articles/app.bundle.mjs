var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// articles/source-contracts.mjs
var source_contracts_exports = {};
__export(source_contracts_exports, {
  ARTICLE_CONTRACTS: () => ARTICLE_CONTRACTS,
  REFERENCE_CONTRACTS: () => REFERENCE_CONTRACTS,
  SOURCE_CONTRACTS: () => SOURCE_CONTRACTS,
  TOPIC_CONTRACTS: () => TOPIC_CONTRACTS
});
var freeze, SOURCE_CONTRACTS, REFERENCE_CONTRACTS, TOPIC_CONTRACTS, ARTICLE_CONTRACTS;
var init_source_contracts = __esm({
  "articles/source-contracts.mjs"() {
    freeze = (value) => {
      if (value && typeof value === "object") {
        Object.values(value).forEach(freeze);
        Object.freeze(value);
      }
      return value;
    };
    SOURCE_CONTRACTS = freeze({
      "salok-mahalla9": {
        path: "../salok-mahalla9/data/salok-mahalla9.json",
        sha256: "f72690bb730b24e6631fbbabf574798e5451837987d227a807a3bcf49a366e75",
        editionId: "salok-mahalla9-opengranth-34d2a7c-20261126",
        releaseId: "salok-mahalla9-complete-draft-20261126",
        unitCount: 57,
        lineCount: 114,
        occurrenceCount: 117,
        sequenceSha256: "16649b80d412b71d628eab27e372208bb74a5c9289702a0f581967ce91604e28",
        collectionLabel: "Salok Mahalla 9",
        attributionLabel: "Guru Tegh Bahadur Ji - attribution from the collection heading",
        sectionLabel: "Standalone Salok collection; no musical Raag assigned here",
        repository: "opengranth/open-granth",
        commit: "34d2a7cab032c8ea24d21ff20f64653bd03766f4",
        sourceStatus: "DIGITAL_SOURCE_COMPARED_QUALIFIED_REVIEW_PENDING"
      },
      "salok-kabir": {
        path: "../salok-kabir/data/salok-kabir.json",
        sha256: "34698bcbbaa8c54416de495011ee38493f549a5c0b92720e684f8c399dcf64f2",
        editionId: "salok-kabir-selected-witnesses-34d2a7c-20261126",
        releaseId: "salok-kabir-complete-draft-20261126",
        unitCount: 243,
        lineCount: 486,
        occurrenceCount: 494,
        sequenceSha256: "f8de1c67654bbc6d62e1b6484c41ec31a27f930ea83cff13150a1b5eb4dae415",
        collectionLabel: "Salok Bhagat Kabir Ji",
        attributionLabel: "Collection attribution: Salok Bhagat Kabir Ji; individual attribution review pending",
        sectionLabel: "Standalone Salok collection; no musical Raag assigned here",
        repository: "opengranth/open-granth",
        commit: "34d2a7cab032c8ea24d21ff20f64653bd03766f4",
        sourceStatus: "SELECTED_DIGITAL_WITNESSES_WITH_DOCUMENTED_DIFFERENCES_QUALIFIED_REVIEW_PENDING"
      }
    });
    REFERENCE_CONTRACTS = freeze({
      "glp.article-ref.salok-mahalla9.019": {
        sourceId: "salok-mahalla9",
        editionId: SOURCE_CONTRACTS["salok-mahalla9"].editionId,
        unitId: "sggs.salok-mahalla9.salok019",
        ordinal: 19,
        sourceDigest: "b6ca3f8ab083a6c1a064ea84aa49921b829b5a066900f397dc7ec68708afeba3",
        lines: [
          { id: "sggs.salok-mahalla9.salok019.line01", sha256: "a7338568b2b32b7ed745bbb343d542ceb555ddaee75c74da986a4dd265f9f733" },
          { id: "sggs.salok-mahalla9.salok019.line02", sha256: "28fc104485a73799e815d556cbcd3510284a6dd5f02a0fec3d4a91c01c135d5d" }
        ]
      },
      "glp.article-ref.salok-kabir.025": {
        sourceId: "salok-kabir",
        editionId: SOURCE_CONTRACTS["salok-kabir"].editionId,
        unitId: "sggs.salok-kabir.salok025",
        ordinal: 25,
        sourceDigest: "1ae23b855dbcb5fc17ba8dea1eec4a6fae80dea791ab47e3f1bcff33bd92f5cb",
        lines: [
          { id: "sggs.salok-kabir.salok025.line01", sha256: "7d899f1634772b592177f7c2e78b5e96884b5490ea18b86e8d6b213c366db1eb" },
          { id: "sggs.salok-kabir.salok025.line02", sha256: "157be362ae307621ec83bcc11bc184c63e6627a25c660e52f8dffe0d715cddd3" }
        ]
      }
    });
    TOPIC_CONTRACTS = freeze([
      { id: "haumai", label: "Haumai", searchTerms: ["haumai", "ego"], articleIds: ["haumai-source-sheet"] },
      { id: "dubidha", label: "Dubidha", searchTerms: ["dubidha", "duality"], articleIds: ["dubidha-source-sheet"] }
    ]);
    ARTICLE_CONTRACTS = freeze([
      { id: "haumai-source-sheet", topicId: "haumai", title: "Haumai - source reading sheet", referenceIds: ["glp.article-ref.salok-mahalla9.019"], selectionToken: "ਹਉਮੈ" },
      { id: "dubidha-source-sheet", topicId: "dubidha", title: "Dubidha - source reading sheet", referenceIds: ["glp.article-ref.salok-kabir.025"], selectionToken: "ਦੁਬਿਧਾ" }
    ]);
  }
});

// articles/core.mjs
var core_exports = {};
__export(core_exports, {
  ArticleSourceError: () => ArticleSourceError,
  loadArticleCatalog: () => loadArticleCatalog
});
function freeze2(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze2);
    Object.freeze(value);
  }
  return value;
}
function copyBytes(value, limit) {
  need(value instanceof Uint8Array || value instanceof ArrayBuffer, "ARTICLE_BYTES", "Expected original file bytes.");
  const bytes2 = value instanceof Uint8Array ? new Uint8Array(value) : new Uint8Array(value.slice(0));
  need(bytes2.byteLength > 0 && bytes2.byteLength <= limit, "ARTICLE_BYTES", "File size is outside this reading sheet contract.");
  return bytes2;
}
async function sha256(bytes2) {
  need(globalThis.crypto?.subtle, "ARTICLE_CRYPTO", "Secure source checking is unavailable.");
  try {
    return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", typeof bytes2 === "string" ? encoder.encode(bytes2) : bytes2)), (b) => b.toString(16).padStart(2, "0")).join("");
  } catch (error) {
    if (error instanceof ArticleSourceError) throw error;
    throw new ArticleSourceError("ARTICLE_CRYPTO", "Secure source checking could not finish.");
  }
}
function parse(bytes2) {
  try {
    return JSON.parse(decoder.decode(bytes2));
  } catch (_) {
    throw new ArticleSourceError("ARTICLE_JSON", "This reading sheet file could not be read.");
  }
}
function keys(value, expected, label) {
  need(value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).sort().join("|") === expected.slice().sort().join("|"), "ARTICLE_SCHEMA", "Unexpected or missing " + label + " fields.");
}
function equalList(value, expected, label) {
  need(Array.isArray(value) && value.length === expected.length && value.every((v, i) => v === expected[i]), "ARTICLE_BINDING", label + " does not match the fixed reference contract.");
}
function verifyCatalog(bytes2) {
  const c = parse(copyBytes(bytes2, 32768));
  keys(c, ["schema", "releaseStatus", "contentLayer", "topics", "articles"], "catalog");
  need(c.schema === "glp.articles.catalog.v1" && c.releaseStatus === "REVIEW_CANDIDATE" && c.contentLayer === "SOURCE_READING_SHEET", "ARTICLE_LAYER", "Unsupported catalog layer or release status.");
  need(Array.isArray(c.topics) && c.topics.length === TOPIC_CONTRACTS.length && Array.isArray(c.articles) && c.articles.length === ARTICLE_CONTRACTS.length, "ARTICLE_COVERAGE", "The reading sheet catalog is incomplete or contains unknown items.");
  for (let i = 0; i < TOPIC_CONTRACTS.length; i++) {
    const t = c.topics[i], expected = TOPIC_CONTRACTS[i];
    keys(t, ["id", "label", "searchTerms", "articleIds"], "topic");
    need(t.id === expected.id && t.label === expected.label, "ARTICLE_TITLE", "Unknown topic identity or editorial title.");
    equalList(t.searchTerms, expected.searchTerms, "Topic search aliases");
    equalList(t.articleIds, expected.articleIds, "Topic membership");
  }
  for (let i = 0; i < ARTICLE_CONTRACTS.length; i++) {
    const a = c.articles[i], expected = ARTICLE_CONTRACTS[i];
    keys(a, ["id", "topicId", "title", "kind", "rights", "reviewStatus", "selection", "referenceIds", "explanation", "claims"], "reading sheet");
    need(a.id === expected.id && a.topicId === expected.topicId && a.title === expected.title, "ARTICLE_TITLE", "Unknown reading sheet identity or editorial title.");
    need(a.kind === "SOURCE_READING_SHEET" && a.rights === "ORIGINAL_SCRIPTURE_ONLY" && a.reviewStatus === "AWAITING_QUALIFIED_REVIEW", "ARTICLE_LAYER", "Unapproved article content, rights or review status.");
    keys(a.selection, ["kind", "token", "semanticReviewed"], "selection");
    need(a.selection.kind === "LITERAL_TOKEN" && a.selection.token === expected.selectionToken && a.selection.semanticReviewed === false, "ARTICLE_SELECTION", "The term-selection basis has changed.");
    equalList(a.referenceIds, expected.referenceIds, "Article reference");
    need(a.explanation === null && Array.isArray(a.claims) && a.claims.length === 0, "ARTICLE_EXPOSITION", "Explanation and claim content is not enabled in this review candidate.");
  }
  return c;
}
async function verifyPackage(sourceId, input) {
  const contract = SOURCE_CONTRACTS[sourceId];
  need(contract, "ARTICLE_SOURCE", "Unknown source package.");
  const bytes2 = copyBytes(input, 2e6);
  need(await sha256(bytes2) === contract.sha256, "ARTICLE_SOURCE_DIGEST", "The complete original source package does not match the pinned edition.");
  const pack = parse(bytes2);
  need(pack.schema === "GLP-NITNEM-SOURCE-V2" && pack.compositionId === sourceId && pack.originalCompositionId === sourceId && pack.sourceFamily === "sggs" && pack.editionId === contract.editionId && pack.releaseId === contract.releaseId && pack.sourceRepositoryCommit === contract.commit, "ARTICLE_SOURCE_IDENTITY", "The original package identity does not match this edition.");
  need(pack.humanCollationApproved === false && pack.translationApproved === false && pack.sourceStatus === contract.sourceStatus && pack.publicationStatus === "EDUCATIONAL_DRAFT" && pack.releaseChannel === "DEVELOPMENT_REVIEW", "ARTICLE_SOURCE_REVIEW", "The original package review gate has changed.");
  need(pack.unitCount === contract.unitCount && pack.originalLineCount === contract.lineCount && pack.sourceOccurrenceCount === contract.occurrenceCount && Array.isArray(pack.units) && pack.units.length === contract.unitCount && Array.isArray(pack.preface), "ARTICLE_SOURCE_COVERAGE", "The complete source package is required.");
  const rows = [...pack.preface], unitMap = /* @__PURE__ */ new Map();
  for (let i = 0; i < pack.units.length; i++) {
    const u = pack.units[i], id = "sggs." + sourceId + ".salok" + String(i + 1).padStart(3, "0");
    need(u.id === id && u.ordinal === i + 1 && !unitMap.has(id) && Array.isArray(u.lines) && u.lines.length === 2 && Array.isArray(u.metricalHeadings) && !own(u, "sourceDisplayOrder"), "ARTICLE_SOURCE_IDENTITY", "A Salok identity, order or complete unit has changed.");
    need(u.lines.every((line, j) => line.id === id + ".line" + String(j + 1).padStart(2, "0") && line.kind === "verse"), "ARTICLE_SOURCE_IDENTITY", "A verse occurrence identity has changed.");
    const unitRows = [...u.metricalHeadings, ...u.lines];
    need(await sha256(unitRows.map((line) => line.id + "	" + line.sha256).join("\n")) === u.sourceDigest, "ARTICLE_SOURCE_BINDING", "A complete Salok binding has changed.");
    rows.push(...unitRows);
    unitMap.set(id, u);
  }
  need(rows.length === contract.occurrenceCount && new Set(rows.map((l) => l.id)).size === rows.length, "ARTICLE_SOURCE_COVERAGE", "A source occurrence is missing or duplicated.");
  for (const row of rows) {
    need(typeof row.id === "string" && typeof row.text === "string" && row.text.length > 0 && typeof row.sha256 === "string" && /^[a-f0-9]{64}$/.test(row.sha256) && row.held === false && !/[\uE000-\uF8FF]/u.test(row.text), "ARTICLE_SOURCE_OCCURRENCE", "An original source occurrence is not ready for display.");
    need(row.family === "sggs" && row.source?.repository === contract.repository && row.source?.commit === contract.commit, "ARTICLE_SOURCE_IDENTITY", "The occurrence provenance changed.");
  }
  const fingerprints = await Promise.all(rows.map((row) => sha256(row.text)));
  need(rows.every((row, i) => row.sha256 === fingerprints[i]), "ARTICLE_SOURCE_DIGEST", "An original occurrence fingerprint changed.");
  need(pack.sourceTextSequenceSha256 === contract.sequenceSha256 && await sha256(rows.map((row) => row.text).join("\n")) === contract.sequenceSha256, "ARTICLE_SOURCE_SEQUENCE", "The complete original source sequence changed.");
  return { pack, unitMap };
}
function resolveReference(id, packages) {
  const ref = REFERENCE_CONTRACTS[id];
  need(ref, "ARTICLE_REFERENCE", "The source reference has no registered crosswalk.");
  const contract = SOURCE_CONTRACTS[ref.sourceId], source = packages.get(ref.sourceId), unit = source?.unitMap.get(ref.unitId);
  need(source?.pack.editionId === ref.editionId && unit?.id === ref.unitId && unit.ordinal === ref.ordinal && unit.sourceDigest === ref.sourceDigest && unit.lines.length === ref.lines.length, "ARTICLE_REFERENCE", "The explicit source edition or complete Salok binding could not be resolved.");
  need(unit.lines.every((line, i) => line.id === ref.lines[i].id && line.sha256 === ref.lines[i].sha256), "ARTICLE_REFERENCE", "An exact ordered source occurrence binding could not be resolved.");
  return {
    id,
    compositionId: ref.sourceId,
    unitId: ref.unitId,
    label: contract.collectionLabel + " - Salok " + ref.ordinal,
    collectionLabel: contract.collectionLabel,
    attributionLabel: contract.attributionLabel,
    sectionLabel: contract.sectionLabel,
    readerPath: "../" + ref.sourceId + "/index.html?bani=" + ref.sourceId + "&unit=" + ref.ordinal,
    lines: unit.lines.map((line) => ({ id: line.id, text: line.text, sha256: line.sha256 })),
    sourceRegister: {
      label: contract.collectionLabel + " - selected digital source package",
      editionId: ref.editionId,
      repository: contract.repository,
      commit: contract.commit,
      registeredOn: "2026-11-26",
      upstreamLineage: "Open Granth derives from Shabad OS. Agreement within this lineage is not an independent textual witness.",
      verificationScope: "Exact package bytes, complete original sequence and this complete Salok were checked against fixed bindings. This does not verify an explanation.",
      qualifiedReview: false,
      printedPageCollation: false
    }
  };
}
async function loadArticleCatalog(catalogBytes, loadSourceBytes) {
  const catalog = verifyCatalog(catalogBytes);
  need(typeof loadSourceBytes === "function", "ARTICLE_LOADER", "A source loader is required.");
  const sourceIds = [...new Set(ARTICLE_CONTRACTS.flatMap((article) => article.referenceIds.map((id) => REFERENCE_CONTRACTS[id].sourceId)))];
  const loaded = await Promise.all(sourceIds.map(async (sourceId) => {
    let bytes2;
    try {
      bytes2 = await loadSourceBytes(sourceId);
    } catch (_) {
      throw new ArticleSourceError("ARTICLE_SOURCE_UNAVAILABLE", "The complete local source package is unavailable.");
    }
    return [sourceId, await verifyPackage(sourceId, bytes2)];
  }));
  const packages = new Map(loaded);
  const articles = catalog.articles.map((article) => {
    const references = article.referenceIds.map((id) => resolveReference(id, packages));
    need(references.every((ref) => ref.lines.some((line) => line.text.split(/[\s\u0964\u0965]+/u).includes(article.selection.token))), "ARTICLE_SELECTION", "The literal selection token does not occur in the linked Salok.");
    return { id: article.id, topicId: article.topicId, title: article.title, selection: { ...article.selection }, references, explanation: null, claims: [], reviewStatus: article.reviewStatus };
  });
  return freeze2({ schema: catalog.schema, topics: catalog.topics.map((t) => ({ ...t, searchTerms: [...t.searchTerms], articleIds: [...t.articleIds] })), articles });
}
var encoder, decoder, own, ArticleSourceError, need;
var init_core = __esm({
  "articles/core.mjs"() {
    init_source_contracts();
    encoder = new TextEncoder(), decoder = new TextDecoder("utf-8", { fatal: true });
    own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
    ArticleSourceError = class extends Error {
      constructor(code, message) {
        super(message);
        this.name = "ArticleSourceError";
        this.code = code;
      }
    };
    need = (condition, code, message) => {
      if (!condition) throw new ArticleSourceError(code, message);
    };
  }
});

// articles/app.mjs
var $ = (id) => document.getElementById(id);
var page = document.body.dataset.page;
var ready = false;
var element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== void 0) node.textContent = text;
  return node;
};
function sourceWord(text) {
  const node = element("span", "source-word", text);
  node.lang = "pa";
  return node;
}
function fail() {
  ready = false;
  for (const id of ["article-content", "index-content"]) {
    const node = $(id);
    if (node) {
      node.hidden = true;
      if (id === "article-content") node.replaceChildren();
    }
  }
  if ($("topic-list")) $("topic-list").replaceChildren();
  if ($("print-article")) $("print-article").disabled = true;
  $("article-loading").hidden = true;
  $("article-error").hidden = false;
  document.documentElement.dataset.sourceState = "unavailable";
}
async function bytes(relative) {
  const url = new URL(relative, import.meta.url);
  if (url.origin !== location.origin) throw new Error("Unsupported source origin");
  const response = await fetch(url, { credentials: "omit", redirect: "error", cache: "no-store" });
  if (!response.ok) throw new Error("Source file unavailable");
  return response.arrayBuffer();
}
function normalizeWords(value) {
  return value.normalize("NFKC").replace(/\p{Cf}/gu, "").toLocaleLowerCase("en").split(/[^\p{L}\p{M}\p{N}]+/u).filter(Boolean);
}
function renderIndex(catalog) {
  const fragment = document.createDocumentFragment();
  for (const topic of catalog.topics) {
    for (const articleId of topic.articleIds) {
      const article = catalog.articles.find((item) => item.id === articleId);
      const card = element("a", "topic-card");
      card.dataset.articleId = article.id;
      card.dataset.topicId = topic.id;
      card.href = "article.html?id=" + encodeURIComponent(article.id);
      card.append(element("span", "card-kicker", "LIBRARY TOPIC · SOURCE WORD MATCH"));
      const title = element("h3", "", topic.label);
      title.append(document.createTextNode(" "), sourceWord(article.selection.token));
      card.append(title);
      const ref = article.references[0];
      card.append(element("p", "", ref.label));
      card.append(element("p", "", "Complete Salok · Explanation awaiting qualified review"));
      card.append(element("span", "card-action", "Open source sheet →"));
      fragment.append(card);
    }
  }
  $("topic-list").replaceChildren(fragment);
  const input = $("article-search");
  input.value = new URL(location.href).searchParams.get("q") || "";
  const filter = () => {
    const words = normalizeWords(input.value);
    let count = 0;
    for (const topic of catalog.topics) {
      const topicArticles = catalog.articles.filter((item) => item.topicId === topic.id);
      const allowed = new Set([topic.label, ...topic.searchTerms, ...topicArticles.map((item) => item.selection.token)].flatMap(normalizeWords));
      const visible = !input.value.trim() || words.length > 0 && words.every((word) => allowed.has(word));
      for (const card of $("topic-list").children) {
        if (card.dataset.topicId === topic.id) {
          card.hidden = !visible;
          if (visible) count++;
        }
      }
    }
    $("no-results").hidden = count !== 0;
    $("search-status").textContent = count === 1 ? "1 source reading sheet" : count + " source reading sheets";
    const url = new URL(location.href);
    if (input.value.trim()) url.searchParams.set("q", input.value.trim());
    else url.searchParams.delete("q");
    history.replaceState(null, "", url);
  };
  input.addEventListener("input", filter);
  $("topic-search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    filter();
  });
  filter();
  $("index-content").hidden = false;
}
function appendRegister(list, title, text) {
  list.append(element("dt", "", title), element("dd", "", text));
}
function renderArticle(catalog) {
  const articleId = new URL(location.href).searchParams.get("id");
  const article = catalog.articles.find((item) => item.id === articleId);
  if (!article) throw new Error("Unknown source sheet");
  const topic = catalog.topics.find((item) => item.id === article.topicId);
  const fragment = document.createDocumentFragment();
  for (const ref of article.references) {
    const pair = element("div", "pair");
    pair.dataset.referenceId = ref.id;
    const verse = element("div", "verse");
    for (const line of ref.lines) {
      const row = element("p", "gur source-line", line.text);
      row.lang = "pa";
      row.dataset.lineId = line.id;
      verse.append(row);
    }
    pair.append(verse);
    pair.append(element("p", "cite", ref.label));
    pair.append(element("p", "cite attribution", ref.attributionLabel));
    pair.append(element("p", "basis", ref.sectionLabel + ". Source reference checked against the selected digital edition; qualified review is pending."));
    const link = element("a", "reader-link", "Open this Salok in the reader →");
    link.href = ref.readerPath;
    pair.append(link);
    const slot = element("div", "slot explanation-slot");
    slot.dataset.reviewStatus = "AWAITING_QUALIFIED_REVIEW";
    slot.append(element("span", "who", "Explanation · Awaiting qualified review"), element("p", "", "No explanation has been written. This space remains empty until qualified content is available."));
    pair.append(slot);
    fragment.append(pair);
  }
  const register = document.createDocumentFragment();
  for (const ref of article.references) {
    appendRegister(register, "Gurmukhi source", ref.sourceRegister.label + ". " + ref.sourceRegister.verificationScope);
    appendRegister(register, "Source lineage", ref.sourceRegister.upstreamLineage);
    appendRegister(register, "Source edition", ref.sourceRegister.editionId + ". Reference registered " + ref.sourceRegister.registeredOn + ".");
    appendRegister(register, "Stable reference", ref.id);
    register.append(element("dt", "", "Pinned upstream source"));
    const upstream = element("dd", "source-edition");
    const sourceLink = element("a", "", ref.sourceRegister.repository + " @ " + ref.sourceRegister.commit);
    sourceLink.href = "https://github.com/" + ref.sourceRegister.repository + "/tree/" + ref.sourceRegister.commit;
    sourceLink.rel = "noopener noreferrer";
    upstream.append(sourceLink);
    register.append(upstream);
  }
  appendRegister(register, "What the reference check establishes", "The displayed passage resolves to the selected source edition. This does not establish the meaning of an explanation, the completeness of a topic selection, or qualified approval.");
  appendRegister(register, "Passage location", "The composition and Salok number identify the passage here. No Ang number is presented as an independently established locator. Printed-page collation remains outstanding.");
  appendRegister(register, "Topic selection", "A literal source-word match. The selection is an editorial example awaiting qualified review, not a complete thematic collection.");
  appendRegister(register, "Explanation and review", "No explanation, translation or comparison has been added to this sheet. No qualified reviewer is recorded.");
  appendRegister(register, "Material and permissions", "Only the original scripture from the existing source package is displayed. No modern article, commentary or translation has been reproduced. Permission for outside articles remains pending.");
  appendRegister(register, "Printing", "Each current passage, citation, source note and empty explanation space is grouped for printing. Page layout is designed for A4 and US Letter; your print settings can affect pagination. Copying Gurmukhi from a saved PDF can change characters in some viewers. Use the reader for the original text.");
  $("article-title").textContent = topic.label;
  $("article-title").append(document.createTextNode(" "), sourceWord(article.selection.token));
  $("article-subtitle").textContent = "Source reading sheet · " + article.references[0].label;
  const selection = element("span", "", "The exact source word ");
  selection.append(sourceWord(article.selection.token), document.createTextNode(" occurs in the Salok below. The full Salok is included. The topic selection awaits qualified review."));
  $("selection-basis").replaceChildren(selection);
  $("passages").replaceChildren(fragment);
  $("source-register-list").replaceChildren(register);
  $("article-content").dataset.articleId = article.id;
  $("article-content").hidden = false;
  document.title = topic.label + " · Source reading sheet · Gurbani Learning Library";
  $("print-article").disabled = false;
}
$("retry-load")?.addEventListener("click", () => location.reload());
$("print-article")?.addEventListener("click", () => {
  if (ready) window.print();
});
try {
  const expected = page === "index" ? "editorial-source-index" : page === "article" ? "source-reading-sheet" : null;
  if (!expected || document.documentElement.dataset.contentLayer !== expected) throw new Error("Unsupported content layer");
  const [{ loadArticleCatalog: loadArticleCatalog2 }, { SOURCE_CONTRACTS: SOURCE_CONTRACTS2 }] = await Promise.all([Promise.resolve().then(() => (init_core(), core_exports)), Promise.resolve().then(() => (init_source_contracts(), source_contracts_exports))]);
  const catalog = await loadArticleCatalog2(await bytes("catalog.json"), (sourceId) => {
    if (!Object.hasOwn(SOURCE_CONTRACTS2, sourceId)) throw new Error("Unsupported source");
    return bytes(SOURCE_CONTRACTS2[sourceId].path);
  });
  if (page === "index") renderIndex(catalog);
  else renderArticle(catalog);
  ready = true;
  $("article-loading").hidden = true;
  document.documentElement.dataset.sourceState = "ready";
} catch {
  fail();
}
