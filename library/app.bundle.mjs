// library/catalog.mjs
var freeze = (value) => {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
var savedHref = (href) => href + (href.includes("?") ? "&" : "?") + "learning=saved";
var pending = "Educational drafts · qualified review pending";
var development = "Development preview · qualified source and teaching review pending";
var binding = (path, sha256, compositionId, editionId) => ({
  path,
  sha256,
  ...compositionId ? { compositionId } : {},
  ...editionId ? { editionId } : {}
});
var reader = (entry) => ({ ...entry, savedHref: savedHref(entry.href) });
var READERS = freeze([
  reader({
    id: "japji",
    title: "Japji Sahib",
    titlePa: "ਜਪੁਜੀ ਸਾਹਿਬ",
    group: "nitnem",
    href: "full-japji.html",
    summary: "38 Pauris with the opening and closing material.",
    reviewLabel: pending,
    sourceFamily: "sggs",
    aliases: ["japji", "japji sahib", "ਜਪੁਜੀ ਸਾਹਿਬ"],
    sourceBindings: [binding("js/japji-full-data.js", "7f5f78ac33da1a944e14c3d2b901926686df7e520e6fe681f6a28802d85e9808")]
  }),
  reader({
    id: "jaap",
    title: "Jaap Sahib",
    titlePa: "ਜਾਪੁ ਸਾਹਿਬ",
    group: "nitnem",
    href: "nitnem/index.html?bani=jaap",
    summary: "199 numbered chhands in the selected digital reading.",
    reviewLabel: pending,
    sourceFamily: "dasam",
    aliases: ["jaap", "jaap sahib", "ਜਾਪੁ ਸਾਹਿਬ", "ਜਾਪ ਸਾਹਿਬ"],
    sourceBindings: [binding("nitnem/data/jaap.json", "f00ab63bfe27ad36fac6b7b285c480f3265780f5eb02bb077cafcc29c9e7dcec", "jaap", "jaap-banidb-direct-20261125")]
  }),
  reader({
    id: "savaiye",
    title: "Tav-Prasad Savaiye",
    titlePa: "ਤ੍ਵ ਪ੍ਰਸਾਦਿ ਸਵੱਯੇ",
    group: "nitnem",
    href: "nitnem/index.html?bani=savaiye",
    summary: "The selected collection of ten Savaiye.",
    reviewLabel: pending,
    sourceFamily: "dasam",
    aliases: ["tav prasad savaiye", "tavprasad savaiye", "savaiye", "swaiye", "ਤ੍ਵ ਪ੍ਰਸਾਦਿ ਸਵੱਯੇ"],
    sourceBindings: [binding("nitnem/data/savaiye.json", "7d5e6fe9ac801b7649e4ef3547a25a79ee1f543f70c4f6bb52492d2d8f37cfaa", "savaiye", "savaiye-discover-narrow-repairs-20261125")]
  }),
  reader({
    id: "chaupai",
    title: "Benti Chaupai Sahib",
    titlePa: "ਬੇਨਤੀ ਚੌਪਈ ਸਾਹਿਬ",
    group: "nitnem",
    href: "nitnem/index.html?bani=chaupai",
    summary: "The selected expanded 29-group reading. The Rehras selection has different boundaries.",
    reviewLabel: pending,
    sourceFamily: "dasam",
    aliases: ["benti chaupai sahib", "chaupai", "ਬੇਨਤੀ ਚੌਪਈ ਸਾਹਿਬ"],
    sourceBindings: [binding("nitnem/data/chaupai.json", "289bbd6d725a7921bf1e160620b14ac927fe5e5874c219849168ee70b9389046", "chaupai", "chaupai-expanded29-narrow-repairs-20261125")]
  }),
  reader({
    id: "anand",
    title: "Anand Sahib",
    titlePa: "ਅਨੰਦੁ ਸਾਹਿਬ",
    group: "nitnem",
    href: "nitnem/index.html?bani=anand",
    summary: "All 40 Pauris in the selected reading.",
    reviewLabel: pending,
    sourceFamily: "sggs",
    aliases: ["anand", "anand sahib", "ਅਨੰਦੁ ਸਾਹਿਬ", "ਅਨੰਦ ਸਾਹਿਬ"],
    sourceBindings: [binding("nitnem/data/anand.json", "124245dfbfa260efd618f513683cbd5dd273e5f7aefdf86bee28db4ee778471a", "anand", "anand-opengranth-pinned-20261125")]
  }),
  reader({
    id: "rehras",
    title: "Sodar Rehras Sahib",
    titlePa: "ਰਹਿਰਾਸਿ ਸਾਹਿਬ",
    group: "nitnem",
    href: "nitnem/index.html?bani=rehras",
    summary: "A six-section evening selection containing SGGS and Dasam Bani material.",
    reviewLabel: pending,
    sourceFamily: "composite",
    aliases: ["sodar rehras sahib", "rehras", "rehraas", "ਰਹਿਰਾਸਿ ਸਾਹਿਬ", "ਰਹਿਰਾਸ ਸਾਹਿਬ"],
    sourceBindings: [binding("nitnem/data/rehras.json", "81bff60d8c942a7eafc30a0b7f3ba994816c6e86a0c8d8daeb7c1ca2f2cebc3b", "rehras", "rehras-sgpc-selection-narrow-repairs-20261125")]
  }),
  reader({
    id: "sohila",
    title: "Kirtan Sohila",
    titlePa: "ਕੀਰਤਨ ਸੋਹਿਲਾ",
    group: "nitnem",
    href: "nitnem/index.html?bani=sohila",
    summary: "The five-Shabad Sohila reading.",
    reviewLabel: pending,
    sourceFamily: "sggs",
    aliases: ["kirtan sohila", "sohila", "ਕੀਰਤਨ ਸੋਹਿਲਾ"],
    sourceBindings: [binding("nitnem/data/sohila.json", "7fe21aec71a889c452d639141994087ee2a1390d800c78b59bf604c4496df673", "sohila", "sohila-srigranth-digitally-collated-20261125")]
  }),
  reader({
    id: "sukhmani",
    title: "Sukhmani Sahib",
    titlePa: "ਸੁਖਮਨੀ ਸਾਹਿਬ",
    group: "additional",
    href: "sukhmani.html",
    summary: "The complete reading across all 24 Ashtpadis.",
    reviewLabel: pending,
    sourceFamily: "sggs",
    aliases: ["sukhmani", "sukhmani sahib", "ਸੁਖਮਨੀ ਸਾਹਿਬ"],
    sourceBindings: [binding("js/sukhmani-data.js", "0cdd704749265c09ead442ec5fd6c84569b1da34dd40ec021585dacd4a1c65f6", "sukhmani")]
  }),
  reader({
    id: "salok-mahalla9",
    title: "Salok Mahalla 9",
    titlePa: "ਸਲੋਕ ਮਹਲਾ ੯",
    group: "additional",
    href: "salok-mahalla9/index.html?bani=salok-mahalla9",
    summary: "The collection of 57 Saloks, with source and teaching review status kept separate.",
    reviewLabel: development,
    sourceFamily: "sggs",
    aliases: ["salok mahalla 9", "salok mehla 9", "salok mahala 9", "salok mahalla9", "salok mehla9", "ਸਲੋਕ ਮਹਲਾ ੯"],
    sourceBindings: [binding("salok-mahalla9/data/salok-mahalla9.json", "f72690bb730b24e6631fbbabf574798e5451837987d227a807a3bcf49a366e75", "salok-mahalla9", "salok-mahalla9-opengranth-34d2a7c-20261126")]
  }),
  reader({
    id: "salok-kabir",
    title: "Salok Bhagat Kabir Ji",
    titlePa: "ਸਲੋਕ ਭਗਤ ਕਬੀਰ ਜੀਉ ਕੇ",
    group: "additional",
    href: "salok-kabir/index.html?bani=salok-kabir",
    summary: "The 243-Salok collection. Individual attribution review remains pending.",
    reviewLabel: development,
    sourceFamily: "sggs",
    aliases: ["salok bhagat kabir ji", "kabir salok", "kabeer salok", "ਸਲੋਕ ਭਗਤ ਕਬੀਰ ਜੀਉ ਕੇ"],
    sourceBindings: [binding("salok-kabir/data/salok-kabir.json", "34698bcbbaa8c54416de495011ee38493f549a5c0b92720e684f8c399dcf64f2", "salok-kabir", "salok-kabir-selected-witnesses-34d2a7c-20261126")]
  })
]);
var COLLECTIONS = freeze([
  {
    id: "nitnem",
    title: "Daily Nitnem",
    titlePa: "ਨਿਤਨੇਮ",
    href: "nitnem/index.html",
    readerIds: ["japji", "jaap", "savaiye", "chaupai", "anand", "rehras", "sohila"],
    summary: "Seven existing reading destinations, from morning to night.",
    aliases: ["nitnem", "daily nitnem", "ਨਿਤਨੇਮ"]
  },
  {
    id: "dasam-collection",
    title: "Sri Dasam Granth",
    titlePa: "ਸ੍ਰੀ ਦਸਮ ਗ੍ਰੰਥ",
    href: "collections/dasam/index.html",
    readerIds: ["jaap", "savaiye", "chaupai"],
    summary: "Three selected readings are available; the complete collection is still being prepared.",
    aliases: ["dasam", "dasam granth", "sri dasam granth", "ਦਸਮ ਗ੍ਰੰਥ"]
  }
]);
var EXPLORE = freeze([
  {
    id: "psychology",
    kind: "psychology-index",
    title: "Psychology",
    href: "psychology/index.html",
    summary: "Research references and reflection tools, available without the private reading password.",
    reviewLabel: "Open learning · research and Gurbani retain their own context",
    aliases: ["psychology", "intellectual humility"]
  },
  {
    id: "private-reading",
    kind: "private-reading",
    title: "Private reading",
    href: "private-library/index.html",
    summary: "Comparative religious texts for your trusted circle. A passphrase is required to read the collection.",
    reviewLabel: "Password protected · separate from public psychology",
    aliases: ["private reading", "private library"]
  },
  {
    id: "source-sheets",
    kind: "source-reading-index",
    title: "Study by topic",
    href: "articles/index.html",
    summary: "Two complete source reading sheets, selected by literal word matches.",
    reviewLabel: "Explanations awaiting qualified review",
    aliases: ["study by topic", "source reading sheets", "articles"]
  },
  {
    id: "haumai-source-sheet",
    kind: "source-reading-sheet",
    title: "Haumai — source reading sheet",
    href: "articles/article.html?id=haumai-source-sheet",
    summary: "A complete Salok from the Mahalla 9 collection. The explanation space remains empty.",
    reviewLabel: "Literal source-word match · thematic review pending",
    selectionBasis: "LITERAL_TOKEN",
    semanticReviewed: false,
    aliases: ["haumai", "ego"]
  },
  {
    id: "dubidha-source-sheet",
    kind: "source-reading-sheet",
    title: "Dubidha — source reading sheet",
    href: "articles/article.html?id=dubidha-source-sheet",
    summary: "A complete Salok from the Kabir collection. The explanation space remains empty.",
    reviewLabel: "Literal source-word match · thematic review pending",
    selectionBasis: "LITERAL_TOKEN",
    semanticReviewed: false,
    aliases: ["dubidha", "duality"]
  },
  {
    id: "gurdwaras",
    kind: "places",
    title: "Gurdwaras",
    href: "gurdwaras.html",
    summary: "The existing directory of places and official destinations.",
    reviewLabel: "Educational material awaiting qualified review",
    aliases: ["gurdwara", "gurdwaras", "places"]
  }
]);
var TOOLS = freeze([
  {
    id: "simran",
    kind: "simran-space",
    category: "Simran",
    title: "Simran Room",
    href: "simran.html",
    summary: "A silent space. The clock stays out of view while sitting.",
    reviewLabel: "Practice guidance awaiting qualified review",
    aliases: ["simran", "simran room", "quiet space"]
  },
  {
    id: "breathing",
    kind: "physiology-tool",
    category: "Optional personal tool",
    title: "Breathing tool",
    href: "breathing.html",
    summary: "A separate, optional visual breathing guide. Start and stop whenever you choose.",
    reviewLabel: "Physiology tool · not treatment",
    aliases: ["breathing", "breathing tool"]
  }
]);
var PLANNED = freeze([
  { id: "full-dasam-granth", title: "Complete Sri Dasam Granth", available: false, summary: "The open Dasam entrance currently links three existing readings. Additional compositions need their own source and edition records." },
  { id: "full-guru-granth-sahib", title: "Full Sri Guru Granth Sahib Ji", available: false, summary: "Complete sequential reading is a future library expansion." },
  { id: "knowledge-explorer", title: "Knowledge Explorer", available: false, summary: "The separate pilot is awaiting integration and outstanding review." },
  { id: "dictionary", title: "Gurbani dictionary", available: false, summary: "A source-linked vocabulary library remains to be built and reviewed." },
  { id: "history", title: "Sikh History & Living Heritage", available: false, summary: "Historical narratives and their source records remain to be developed and reviewed." },
  { id: "audio", title: "Gurbani audio library", available: false, summary: "Recordings require permission and verified mapping before they can be included." }
]);

// library/core.mjs
var VIEWS = Object.freeze(["today", "read", "explore", "saved"]);
function parseView(search2 = "") {
  if (typeof search2 !== "string" && !(search2 instanceof URLSearchParams)) return "today";
  const params = new URLSearchParams(search2);
  const values = params.getAll("view");
  return values.length === 1 && VIEWS.includes(values[0]) ? values[0] : "today";
}
function words(value) {
  return value.normalize("NFKC").replace(/\p{Cf}/gu, "").toLocaleLowerCase("en").split(/[^\p{L}\p{M}\p{N}]+/u).filter(Boolean);
}
function searchEntries(query, entries = READERS) {
  if (typeof query !== "string" || !Array.isArray(entries)) return [];
  if (!query.trim()) return [...entries];
  const required = words(query);
  if (!required.length) return [];
  return entries.filter((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const labels2 = [entry.title, entry.titlePa, ...Array.isArray(entry.aliases) ? entry.aliases : []].filter((value) => typeof value === "string");
    const allowed = new Set(labels2.flatMap(words));
    return required.every((word) => allowed.has(word));
  });
}
function getReader(id) {
  return typeof id === "string" ? READERS.find((entry) => entry.id === id) : void 0;
}
function getEntry(id) {
  if (typeof id !== "string") return void 0;
  return [...READERS, ...COLLECTIONS, ...EXPLORE, ...TOOLS, ...PLANNED].find((entry) => entry.id === id);
}

// library/passage-contracts.mjs
var freeze2 = (value) => {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze2);
    Object.freeze(value);
  }
  return value;
};
var CORPUS_COMMIT = "34d2a7cab032c8ea24d21ff20f64653bd03766f4";
var PROJECTION_CONTRACT = "1cecb2b130df6e214af165a3c01387344792c4ec600d196be02830ce28fcf74f";
var CROSSWALK_PATH = "library/complete-passages.json";
var CROSSWALK_SHA256 = "da4c8240e181de975892ddaac9f9f20ef2426f75eebad5d01e6b440601cba964";
var PASSAGE_SOURCES = freeze2([
  { id: "salok-mahalla9", path: "salok-mahalla9/data/salok-mahalla9.json", sha256: "f72690bb730b24e6631fbbabf574798e5451837987d227a807a3bcf49a366e75", editionId: "salok-mahalla9-opengranth-34d2a7c-20261126", format: "nitnem-source", unitCount: 57, label: "Salok Mahalla 9", review: "Digital source comparison · qualified review pending" },
  { id: "salok-kabir", path: "salok-kabir/data/salok-kabir.json", sha256: "34698bcbbaa8c54416de495011ee38493f549a5c0b92720e684f8c399dcf64f2", editionId: "salok-kabir-selected-witnesses-34d2a7c-20261126", format: "nitnem-source", unitCount: 243, label: "Salok Bhagat Kabir Ji", review: "Selected digital witnesses · attribution and qualified review pending" },
  { id: "knowledge", path: "knowledge/scripture.json", sha256: "cf5b6e72f1cfaad9180d41f4214081cb3dc795644309696d8aba91f3ede64d7b", editionId: "edition.sggs.opengranth-34d2a7c", format: "knowledge-source", unitCount: 3, label: "Knowledge source passages", review: "Digital source comparison · qualified review pending" }
]);
var KNOWLEDGE_UNITS = freeze2([
  { id: "sggs.asa-di-vaar.pauri014.salok01", label: "Asa Di Vaar · Pauri 14 · Salok 1" },
  { id: "sggs.asa-di-vaar.pauri007.salok02", label: "Asa Di Vaar · Pauri 7 · Salok 2" },
  { id: "sggs.kabir.salok007", label: "Kabir Salok 7 · Knowledge view" }
]);

// library/kinds.mjs
var editorialNodeTypes = /* @__PURE__ */ new Set(["concept", "word", "study", "lesson", "course"]);
var contentKind = (n) => n.type === "passage" ? "scripture" : editorialNodeTypes.has(n.type) ? "editorial" : "source-index";

// library/search.mjs
var normalize = (value) => String(value ?? "").normalize("NFC").toLowerCase().trim().replace(/\s+/gu, " ");
var digits = (value) => value.replace(/[੦-੯]/gu, (c) => String("੦੧੨੩੪੫੬੭੮੯".indexOf(c)));
var words2 = (value) => normalize(value).match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}]*/gu) || [];
var roman = (value) => normalize(value).normalize("NFD").replace(/(\p{Script=Latin})\p{M}+/gu, "$1").normalize("NFC");
var labelWords = (value) => words2(digits(roman(value))).join(" ");
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
function names(node2) {
  const origin = contentKind(node2) === "editorial" ? "editorial" : "source";
  return [
    ...[node2.title, node2.pa, ...node2.aliases || []].map((text) => ({ text, origin, basis: origin + "-title-or-alias" })),
    ...[node2.editorialTitle, node2.editorialPa, ...node2.editorialAliases || []].map((text) => ({ text, origin: "editorial", basis: "editorial-title-or-alias" })),
    ...(lookupAliases[node2.id] || []).map((text) => ({ text, origin: "editorial", basis: node2.type === "author" ? "editorial-author-lookup" : "editorial-lookup" }))
  ].filter((label) => typeof label.text === "string" && label.text.trim()).map((label) => ({ ...label, text: labelWords(label.text) }));
}
var provenanceRank = (hit) => hit.matchBasis === "editorial-author-lookup" ? 3 : hit.matchOrigin === "editorial" ? 2 : 1;
var cache = /* @__PURE__ */ new WeakMap();
function retrieveIndex(index) {
  if (cache.has(index)) return cache.get(index);
  const labels2 = index.graph.nodes.map((node2) => ({ node: node2, labels: names(node2) }));
  const passages = index.passages.map((node2) => ({
    node: node2,
    lines: node2.occurrenceIds.map((id) => {
      const occurrence = index.occ.get(id), tokens = words2(occurrence.text);
      return { occurrence, tokens, initials: tokens.map((token) => foldInitial(firstUnit(token))) };
    })
  }));
  const value = { labels: labels2, passages };
  cache.set(index, value);
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
function referenceMatches(node2, q) {
  const kabir = q.match(/^(?:(?:bhagat|ਭਗਤ)\s+)?(?:kabir|kabeer|ਕਬੀਰ)(?:\s+(?:ji|ਜੀ))?\s+(?:salok|slok|ਸਲੋਕ)\s*(\d{1,3})$/u);
  if (kabir) return node2.compositionId === "composition.kabir-saloks" && node2.salokPosition === Number(kabir[1]);
  const asa = q.match(/^(?:asa (?:di|ki) va{1,2}r|ਆਸਾ (?:ਦੀ|ਕੀ) ਵਾਰ)\s+(?:pauri|ਪਉੜੀ)\s*(\d{1,3})\s+(?:salok|slok|ਸਲੋਕ)\s*(\d{1,3})$/u);
  return !!asa && node2.compositionId === "composition.asa-di-vaar" && node2.pauriNumber === Number(asa[1]) && node2.salokPosition === Number(asa[2]);
}
var relationReasons = {
  discusses: "Related topic",
  written_by: "Author",
  contains: "Composition",
  attested_in: "Word in this passage",
  in_raag: "Raag"
};
function search(index, query, { mode = "auto", author = "", type = "", collection = "" } = {}) {
  const q = normalize(query);
  if (!q || [...q].length > 240 || !modes.has(mode) || /(?:^|\s)[+−-]\s*\d/u.test(digits(q))) return [];
  const { labels: labels2, passages } = retrieveIndex(index), matches = /* @__PURE__ */ new Map();
  const allowed = (node2) => (!type || node2.type === type) && (!author || node2.type === "passage" && node2.authorId === author) && (!collection || node2.type === "passage" && node2.collectionId === collection);
  const add = (node2, score, reason, occurrenceIds = [], matchOrigin = "source", matchBasis = "source-reference") => {
    const prior = matches.get(node2.id);
    if (prior && prior.score > score) return;
    const ids2 = prior?.score === score ? [.../* @__PURE__ */ new Set([...prior.occurrenceIds, ...occurrenceIds])] : occurrenceIds;
    const hit = { id: node2.id, type: node2.type, title: node2.title, kind: contentKind(node2), matchOrigin, matchBasis, score, reason, occurrenceIds: ids2 };
    matches.set(node2.id, prior?.score === score && provenanceRank(prior) > provenanceRank(hit) ? { ...prior, occurrenceIds: ids2 } : hit);
  };
  const ang = digits(q).match(/^(?:(?:ang|ank|ਅੰਗ|page|ਪੰਨਾ|p\.)\s*:?\s*)?(\d{1,4})$/u);
  if (ang) {
    const value = Number(ang[1]);
    if (value < 1 || value > 1430) return [];
    for (const { node: node2 } of passages) if (value >= node2.angStart && value <= node2.angEnd) add(node2, 120, "Ang " + value);
  } else {
    if (mode === "auto") {
      const exact = labelWords(q), framed = aliasQuery(q);
      for (const { node: node2, labels: labelsForNode } of labels2) {
        for (const label of labelsForNode) {
          const score = label.text === exact ? 100 : framed !== exact && label.text === framed ? 90 : 0;
          if (!score) continue;
          const reason = label.basis === "editorial-author-lookup" ? "Editorial author lookup" : label.basis === "editorial-lookup" ? "Editorial lookup alias" : label.origin === "editorial" ? "Editorial title or alias" : "Source title or alias";
          add(node2, score, reason + (score === 100 ? " · exact indexed name" : " · indexed name in question"), [], label.origin, label.basis);
        }
      }
      for (const { node: node2 } of passages) if (referenceMatches(node2, labelWords(roman(q).replace(/(?:\u0027|\u2019)s\b/gu, "")))) add(node2, 125, "Composition reference");
    }
    const needle = words2(q);
    const hasPhrase = needle.some((token) => [...token].some(scriptLetter)) && [...needle.join("")].length >= 2;
    let hasText = false;
    if ((mode === "auto" || mode === "phrase") && hasPhrase) {
      for (const { node: node2, lines } of passages) {
        const found = lines.filter((line) => phraseAt(line.tokens, needle)).map((line) => line.occurrence.id);
        if (found.length) {
          add(node2, 115, "Complete words in the original text", found, "source", "source-phrase");
          if (allowed(node2)) hasText = true;
        }
      }
    }
    const initial = initialsQuery(q);
    if (initial && (mode === "first-letter" || mode === "first-letter-anywhere" || mode === "auto" && !hasText)) {
      const anywhere = mode === "first-letter-anywhere";
      for (const { node: node2, lines } of passages) {
        const found = lines.filter((line) => anywhere ? phraseAt(line.initials, initial) : initial.length <= line.initials.length && initial.every((unit, i) => unit === line.initials[i])).map((line) => line.occurrence.id);
        if (found.length) add(node2, 110, anywhere ? "First letters within a line" : "First letters at the start of a line", found, "source", "source-first-letter");
      }
    }
    if (mode === "auto") {
      for (const hit of [...matches.values()]) {
        if (hit.type === "passage") continue;
        for (const edge of index.graph.edges) {
          if (!relationReasons[edge.type] || edge.to !== hit.id && edge.from !== hit.id) continue;
          const other = index.nodes.get(edge.from === hit.id ? edge.to : edge.from);
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
  return [...matches.values()].filter((hit) => allowed(index.nodes.get(hit.id))).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

// library/passages.mjs
var decoder = new TextDecoder("utf-8", { fatal: true }), encoder = new TextEncoder();
var verified = /* @__PURE__ */ new WeakMap();
var need = (value, code) => {
  if (!value) {
    const e = new Error(code);
    e.code = code;
    throw e;
  }
};
var same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
var freeze3 = (value) => {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze3);
    Object.freeze(value);
  }
  return value;
};
async function fingerprint(value) {
  need(globalThis.crypto?.subtle, "SEARCH_CRYPTO");
  const bytes2 = typeof value === "string" ? encoder.encode(value) : value;
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes2)), (b) => b.toString(16).padStart(2, "0")).join("");
}
function bytes(input, limit) {
  need(input instanceof ArrayBuffer || input instanceof Uint8Array, "SEARCH_BYTES");
  const raw = new Uint8Array(input instanceof ArrayBuffer ? input.slice(0) : input);
  need(raw.byteLength > 0 && raw.byteLength <= limit, "SEARCH_SIZE");
  return raw;
}
function parse(raw) {
  try {
    return JSON.parse(decoder.decode(raw));
  } catch {
    need(false, "SEARCH_JSON");
  }
}
var keys = (v, names2) => need(v && typeof v === "object" && !Array.isArray(v) && same(Object.keys(v).sort(), [...names2].sort()), "SEARCH_SCHEMA");
var ids = (lines) => lines.map((l) => ({ id: l.id, sha256: l.sha256 }));
async function sourceUnits(sourceId, input) {
  const binding2 = PASSAGE_SOURCES.find((s) => s.id === sourceId);
  need(binding2, "SEARCH_SOURCE");
  const raw = bytes(input, 15e5);
  need(await fingerprint(raw) === binding2.sha256, "SEARCH_SOURCE_DIGEST");
  const pack = parse(raw), units = [];
  if (binding2.format === "nitnem-source") {
    need(pack.schema === "GLP-NITNEM-SOURCE-V2" && pack.compositionId === sourceId && pack.editionId === binding2.editionId && pack.units.length === binding2.unitCount, "SEARCH_SOURCE_IDENTITY");
    need(pack.humanCollationApproved === false && pack.translationApproved === false && pack.publicationStatus === "EDUCATIONAL_DRAFT", "SEARCH_SOURCE_REVIEW");
    for (let i = 0; i < pack.units.length; i++) {
      const u = pack.units[i], lines = [...u.metricalHeadings, ...u.lines];
      need(u.id === "sggs." + sourceId + ".salok" + String(i + 1).padStart(3, "0") && u.ordinal === i + 1 && u.lines.length === 2, "SEARCH_COMPLETE_UNIT");
      units.push({ sourceId, editionId: binding2.editionId, id: u.id, digest: u.sourceDigest, lines: lines.map((l) => ({ id: l.id, text: l.text, sha256: l.sha256, kind: l.kind })), label: binding2.label + " · Salok " + u.ordinal, href: sourceId + "/index.html?bani=" + sourceId + "&unit=" + u.ordinal, review: binding2.review });
    }
  } else {
    need(pack.schema === "glp.scripture.pilot.v1" && pack.edition.id === binding2.editionId && pack.passages.length === binding2.unitCount, "SEARCH_SOURCE_IDENTITY");
    const occurrences = new Map(pack.occurrences.map((l) => [l.id, l]));
    for (let i = 0; i < KNOWLEDGE_UNITS.length; i++) {
      const expected = KNOWLEDGE_UNITS[i], u = pack.passages[i];
      need(u.id === expected.id && u.occurrenceIds.length === u.expectedOccurrenceCount, "SEARCH_COMPLETE_UNIT");
      const lines = u.occurrenceIds.map((id) => {
        const l = occurrences.get(id);
        need(l && l.passageId === u.id && l.editionId === binding2.editionId, "SEARCH_SOURCE_IDENTITY");
        return { id: l.id, text: l.text, sha256: l.textSha256, kind: l.kind };
      });
      need(await fingerprint(JSON.stringify([u.id, u.authorId, u.compositionId, u.raagId, u.pauriNumber, u.salokPosition, u.angStart, u.angEnd, lines.map((l) => [l.id, l.sha256])])) === u.passageSha256, "SEARCH_UNIT_DIGEST");
      units.push({ sourceId, editionId: binding2.editionId, id: u.id, digest: u.passageSha256, lines, label: expected.label, href: "knowledge/index.html#item=" + encodeURIComponent(u.id), review: binding2.review });
    }
  }
  for (const unit of units) {
    need(new Set(unit.lines.map((l) => l.id)).size === unit.lines.length, "SEARCH_COMPLETE_UNIT");
    for (const line of unit.lines) need(typeof line.text === "string" && await fingerprint(line.text) === line.sha256, "SEARCH_LINE_DIGEST");
    if (binding2.format === "nitnem-source") need(await fingerprint(unit.lines.map((l) => l.id + "	" + l.sha256).join("\n")) === unit.digest, "SEARCH_UNIT_DIGEST");
  }
  return units;
}
function exactSequenceMatches(rows, unit) {
  const matches = [];
  for (let start = 0; start <= rows.length - unit.lines.length; start++) {
    if (rows[start].textSha256 !== unit.lines[0].sha256) continue;
    const selected = rows.slice(start, start + unit.lines.length);
    if (selected.every((row, i) => row.textSha256 === unit.lines[i].sha256 && row.text === unit.lines[i].text)) matches.push(selected);
  }
  return matches;
}
async function buildCrosswalkRecord(unit, rows) {
  const matches = exactSequenceMatches(rows, unit), status = matches.length === 1 ? "UNIQUE_COMPLETE_SEQUENCE" : matches.length === 0 ? "WITHHELD_NO_COMPLETE_SEQUENCE" : "WITHHELD_AMBIGUOUS_SEQUENCE";
  const projected = await Promise.all(matches.map(async (match) => ({ sequenceId: "sggs-witness-sequence-" + await fingerprint(match.map((r) => r.id).join("\n")), witnessIds: match.map((r) => r.id), sourcePaths: [...new Set(match.map((r) => r.sourcePath))], discrepancyIds: [...new Set(match.flatMap((r) => r.discrepancyIds))] })));
  return { sourceId: unit.sourceId, editionId: unit.editionId, unitId: unit.id, unitDigest: unit.digest, lines: ids(unit.lines), status, matches: projected };
}
async function loadCompletePassages(loadBytes) {
  need(typeof loadBytes === "function", "SEARCH_LOADER");
  const raw = bytes(await loadBytes(CROSSWALK_PATH, 15e5), 15e5);
  need(await fingerprint(raw) === CROSSWALK_SHA256, "SEARCH_CROSSWALK_DIGEST");
  const crosswalk = parse(raw);
  keys(crosswalk, ["schema", "status", "sourceCommit", "projectionContractSha256", "independentCollation", "qualifiedApproval", "sourceUnits", "units"]);
  need(crosswalk.schema === "glp.complete-passage-crosswalk.v1" && crosswalk.status === "DEVELOPMENT_REVIEW" && crosswalk.sourceCommit === CORPUS_COMMIT && crosswalk.projectionContractSha256 === PROJECTION_CONTRACT && crosswalk.independentCollation === false && crosswalk.qualifiedApproval === false, "SEARCH_CROSSWALK_IDENTITY");
  const all = (await Promise.all(PASSAGE_SOURCES.map(async (s) => sourceUnits(s.id, await loadBytes(s.path, 15e5))))).flat();
  need(crosswalk.sourceUnits === all.length && crosswalk.units.length === all.length, "SEARCH_CROSSWALK_COVERAGE");
  const groups = /* @__PURE__ */ new Map(), withheld = [];
  for (let i = 0; i < all.length; i++) {
    const unit = all[i], record = crosswalk.units[i];
    keys(record, ["sourceId", "editionId", "unitId", "unitDigest", "lines", "status", "matches"]);
    need(record.sourceId === unit.sourceId && record.editionId === unit.editionId && record.unitId === unit.id && record.unitDigest === unit.digest && same(record.lines, ids(unit.lines)), "SEARCH_CROSSWALK_BINDING");
    need(Array.isArray(record.matches) && ["UNIQUE_COMPLETE_SEQUENCE", "WITHHELD_NO_COMPLETE_SEQUENCE", "WITHHELD_AMBIGUOUS_SEQUENCE"].includes(record.status), "SEARCH_CROSSWALK_STATUS");
    if (record.status !== "UNIQUE_COMPLETE_SEQUENCE") {
      need(record.status === "WITHHELD_NO_COMPLETE_SEQUENCE" ? record.matches.length === 0 : record.matches.length >= 2, "SEARCH_CROSSWALK_STATUS");
      withheld.push({ sourceId: unit.sourceId, unitId: unit.id, status: record.status });
      continue;
    }
    need(record.matches.length === 1, "SEARCH_CROSSWALK_STATUS");
    const witness = record.matches[0];
    keys(witness, ["sequenceId", "witnessIds", "sourcePaths", "discrepancyIds"]);
    need(witness.witnessIds.length === unit.lines.length && new Set(witness.witnessIds).size === witness.witnessIds.length && witness.witnessIds.every((id) => /^witness-og-[a-f0-9]{64}$/.test(id)) && witness.sequenceId === "sggs-witness-sequence-" + await fingerprint(witness.witnessIds.join("\n")), "SEARCH_WITNESS_ID");
    need(witness.sourcePaths.length > 0 && witness.sourcePaths.every((p) => /^corpus\/ang-[0-9]{4}\.md$/.test(p)) && Array.isArray(witness.discrepancyIds), "SEARCH_WITNESS_ID");
    const route = { sourceId: unit.sourceId, unitId: unit.id, editionId: unit.editionId, label: unit.label, href: unit.href, review: unit.review };
    if (groups.has(witness.sequenceId)) {
      const group = groups.get(witness.sequenceId);
      need(same(group.lines.map((l) => l.text), unit.lines.map((l) => l.text)), "SEARCH_CROSSWALK_BINDING");
      group.routes.push(route);
    } else groups.set(witness.sequenceId, { id: witness.sequenceId, lines: unit.lines, routes: [route], witness });
  }
  const passages = [...groups.values()], catalog = freeze3({ status: "DEVELOPMENT_REVIEW", sourceUnits: all.length, uniqueCompletePassages: passages.length, withheld, passages, independentCollation: false, qualifiedApproval: false });
  const nodes = passages.map((p) => ({ id: p.id, type: "passage", title: p.routes[0].label, occurrenceIds: p.lines.map((l) => l.id) }));
  const index = { graph: { nodes, edges: [] }, passages: nodes, nodes: new Map(nodes.map((n) => [n.id, n])), occ: new Map(passages.flatMap((p) => p.lines.map((l) => [l.id, l]))) };
  verified.set(catalog, index);
  return catalog;
}
function searchCompletePassages(catalog, query, { mode = "phrase" } = {}) {
  const index = verified.get(catalog);
  need(index, "SEARCH_UNVERIFIED_CATALOG");
  need(typeof query === "string" && [...query].length <= 240 && ["phrase", "first-letter", "first-letter-anywhere"].includes(mode), "SEARCH_QUERY");
  const supported = /\p{Script=Gurmukhi}/u.test(query) && !/[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Arabic}]/u.test(query);
  const matches = supported ? search(index, query, { mode }) : [], byId = new Map(catalog.passages.map((p) => [p.id, p]));
  return { supported, mode, total: matches.length, matches: matches.map((hit) => ({ passage: byId.get(hit.id), matchedLineIds: hit.occurrenceIds, matchBasis: hit.matchBasis })) };
}

// library/passage-ui.mjs
var $ = (id) => document.getElementById(id);
var element = (tag, text, className) => {
  const node2 = document.createElement(tag);
  if (text !== void 0) node2.textContent = text;
  if (className) node2.className = className;
  return node2;
};
var MODES = ["phrase", "first-letter", "first-letter-anywhere"];
function sourceResponseUrlMatches(requested, actual) {
  if (!actual) return true;
  try {
    const expected = new URL(requested), received = new URL(actual);
    if (expected.search || expected.hash || received.origin !== expected.origin || received.pathname !== expected.pathname || received.username || received.password || received.hash) return false;
    if (!received.search) return true;
    const entries = [...received.searchParams];
    return entries.length === 1 && entries[0][0] === "glp_release" && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,95}$/.test(entries[0][1]);
  } catch {
    return false;
  }
}
async function localBytes(relative, limit) {
  const base = new URL("../", import.meta.url), url = new URL(relative, base);
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname) || url.search || url.hash) throw Error("SOURCE_PATH");
  const response = await fetch(url.href, { credentials: "omit", redirect: "error", cache: "no-store" });
  if (!response.ok || response.redirected || !sourceResponseUrlMatches(url.href, response.url)) throw Error("SOURCE_UNAVAILABLE");
  const size = Number(response.headers.get("content-length"));
  if (Number.isFinite(size) && size > limit) throw Error("SOURCE_SIZE");
  const reader2 = response.body?.getReader();
  if (!reader2) throw Error("SOURCE_STREAM");
  const chunks = [];
  let total = 0;
  try {
    for (; ; ) {
      const part = await reader2.read();
      if (part.done) break;
      total += part.value.byteLength;
      if (total > limit) {
        await reader2.cancel();
        throw Error("SOURCE_SIZE");
      }
      chunks.push(part.value);
    }
  } finally {
    reader2.releaseLock();
  }
  const raw = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    raw.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return raw;
}
function fragment() {
  const p = new URLSearchParams(location.hash.slice(1));
  if (p.getAll("gurbani").length !== 1 || p.getAll("mode").length !== 1 || [...p.keys()].some((k) => !["gurbani", "mode"].includes(k))) return { query: "", mode: "phrase" };
  const query = p.get("gurbani"), mode = p.get("mode");
  return [...query].length <= 240 && MODES.includes(mode) ? { query, mode } : { query: "", mode: "phrase" };
}
function rememberAddress(query, mode) {
  const url = new URL(location.href);
  url.hash = query ? new URLSearchParams({ gurbani: query, mode }).toString() : "";
  history.replaceState(history.state, "", url);
}
function resultCard(hit) {
  const { passage, matchedLineIds } = hit, article = element("article", void 0, "passage-result");
  article.dataset.passageId = passage.id;
  article.append(element("p", "LIBRARY REFERENCE · COMPLETE SOURCE PASSAGE", "section-kicker"), element("h3", passage.routes[0].label));
  const original = element("div", void 0, "passage-original");
  original.lang = "pa";
  original.setAttribute("aria-label", "Complete original Gurbani");
  for (const line of passage.lines) {
    const p = element("p", line.text, line.kind === "heading" ? "passage-heading" : "passage-line");
    p.dataset.sourceOccurrence = line.id;
    if (matchedLineIds.includes(line.id)) {
      p.classList.add("passage-match");
      const tag = element("span", "Matched line", "match-label");
      tag.lang = "en";
      p.append(tag);
    }
    original.append(p);
  }
  article.append(original, element("p", "Complete digital-source match · awaiting qualified review.", "card-review"));
  const links = element("div", void 0, "passage-links");
  for (const route of passage.routes) {
    const a = element("a", route.sourceId === "knowledge" ? "Open this passage in Knowledge →" : "Open the complete Salok in its reader →");
    a.href = route.href;
    a.dataset.sourceUnit = route.unitId;
    links.append(a);
  }
  article.append(links);
  if (passage.witness.discrepancyIds.length) article.append(element("p", "This source occurrence has a documented locator or heading difference. Review it in the source record.", "passage-warning"));
  return article;
}
function setupPassageSearch() {
  let catalog = null, loading = null, limit = 20;
  function show() {
    if (!catalog) return;
    const query = $("passage-query").value.trim(), mode = $("passage-mode").value;
    $("passage-results").replaceChildren();
    $("passage-more").hidden = true;
    if (!query) {
      $("passage-search-status").textContent = "Ready: " + catalog.uniqueCompletePassages + " complete passages are connected to their source readers.";
      return;
    }
    const result = searchCompletePassages(catalog, query, { mode });
    if (!result.supported) {
      $("passage-search-status").textContent = "Enter original Gurmukhi words or their first letters. English topics are available in the topic cards below.";
      return;
    }
    $("passage-results").replaceChildren(...result.matches.slice(0, limit).map(resultCard));
    $("passage-search-status").textContent = result.total ? "Showing " + Math.min(limit, result.total) + " of " + result.total + " complete " + (result.total === 1 ? "passage." : "passages.") : "No complete passage matches in these connected collections. The remaining library is still being connected.";
    $("passage-more").hidden = result.total <= limit;
  }
  async function activate() {
    const selected = fragment();
    $("passage-query").value = selected.query;
    $("passage-mode").value = selected.mode;
    limit = 20;
    if (catalog) {
      show();
      return;
    }
    if (loading) return loading;
    $("passage-search-status").textContent = "Checking the complete source packages…";
    $("passage-submit").disabled = true;
    loading = loadCompletePassages(localBytes).then((value) => {
      catalog = value;
      $("passage-submit").disabled = false;
      $("passage-source-status").textContent = value.uniqueCompletePassages + " complete passages · " + value.sourceUnits + " source views" + (value.withheld.length ? " · " + value.withheld.length + " units withheld" : "");
      show();
    }).catch(() => {
      $("passage-search-status").textContent = "These source packages could not be checked. Search results have been withheld. Use Read to open a reader.";
      $("passage-results").replaceChildren();
      $("passage-submit").disabled = true;
      loading = null;
    });
    return loading;
  }
  $("passage-search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    limit = 20;
    rememberAddress($("passage-query").value.trim(), $("passage-mode").value);
    show();
  });
  $("passage-clear").addEventListener("click", () => {
    $("passage-query").value = "";
    limit = 20;
    rememberAddress("", "phrase");
    show();
    $("passage-query").focus();
  });
  $("passage-more").addEventListener("click", () => {
    limit += 20;
    show();
  });
  window.addEventListener("hashchange", () => {
    if (document.documentElement.dataset.libraryView === "explore") activate();
  });
  return { activate };
}

// library/app.mjs
var passageSearch;
var $2 = (id) => document.getElementById(id);
var labels = { today: "Today", read: "Read", explore: "Explore", saved: "Saved" };
var node = (tag, text, className) => {
  const e = document.createElement(tag);
  if (text !== void 0 && text !== null) e.textContent = text;
  if (className) e.className = className;
  return e;
};
function appendText(parent, tag, text, className, lang) {
  if (!text) return;
  const e = node(tag, text, className);
  if (lang) e.lang = lang;
  parent.append(e);
  return e;
}
function checkedHref(href) {
  if (typeof href !== "string" || !href || href.startsWith("/") || href.includes("\\")) throw Error("A library destination is unavailable.");
  const url = new URL(href, new URL("../", import.meta.url));
  const base = new URL("../", import.meta.url);
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) throw Error("A library destination is outside this reading library.");
  return href;
}
function readingCard(reader2) {
  const a = node("a", null, "directory-card");
  a.href = checkedHref(reader2.href);
  a.dataset.readerId = reader2.id;
  appendText(a, "span", reader2.group === "nitnem" ? "DAILY NITNEM" : "ADDITIONAL READING", "card-group");
  appendText(a, "h2", reader2.title);
  appendText(a, "span", reader2.titlePa, "title-pa", "pa");
  appendText(a, "p", reader2.summary, "card-summary");
  appendText(a, "span", reader2.reviewLabel, "card-review");
  appendText(a, "span", "Open the reader →", "card-action");
  return a;
}
function savedCard(reader2) {
  const a = node("a", null, "saved-card");
  a.href = checkedHref(reader2.savedHref);
  a.dataset.savedReader = reader2.id;
  appendText(a, "h2", reader2.title);
  appendText(a, "span", reader2.titlePa, "title-pa", "pa");
  appendText(a, "span", "Open saved learning →", "card-action");
  a.setAttribute("aria-label", "Open saved learning for " + reader2.title);
  return a;
}
function exploreCard(entry) {
  const a = node("a", null, "directory-card explore-card");
  a.href = checkedHref(entry.href);
  a.dataset.exploreId = entry.id;
  const label = entry.kind === "psychology-index" ? "PSYCHOLOGY · OPEN ACCESS" : entry.kind === "private-reading" ? "FOR YOUR TRUSTED CIRCLE" : entry.id === "gurdwaras" ? "PLACES DIRECTORY" : entry.id === "source-sheets" ? "SOURCE READING SHEETS" : "LIBRARY TOPIC · SOURCE WORD MATCH";
  appendText(a, "span", label, "card-group");
  appendText(a, "h2", entry.title);
  appendText(a, "p", entry.summary, "card-summary");
  appendText(a, "span", entry.reviewLabel, "card-review");
  appendText(a, "span", "Open →", "card-action");
  return a;
}
function toolCard(entry) {
  const a = node("a", null, "tool-card");
  a.href = checkedHref(entry.href);
  a.dataset.toolId = entry.id;
  appendText(a, "span", entry.id === "simran" ? "SIMRAN · SILENT SPACE" : "SEPARATE PHYSIOLOGY TOOL", "entry-kind");
  appendText(a, "h3", entry.title);
  appendText(a, "p", entry.summary);
  return a;
}
function plannedItem(entry) {
  const box = node("article", null, "planned-item");
  box.dataset.plannedId = entry.id;
  appendText(box, "h3", entry.title);
  appendText(box, "p", entry.summary || entry.reason || "In development; not available in this preview.");
  appendText(box, "span", "NOT AVAILABLE YET", "availability-label");
  return box;
}
function oneParam(params, key, max = 120) {
  const values = params.getAll(key);
  return values.length === 1 ? values[0].slice(0, max) : "";
}
function updateDirectoryUrl() {
  const url = new URL(location.href);
  url.searchParams.set("view", "read");
  const q = $2("library-search").value.trim(), filter = $2("read-filter").value;
  if (q) url.searchParams.set("q", q);
  else url.searchParams.delete("q");
  if (filter !== "all") url.searchParams.set("collection", filter);
  else url.searchParams.delete("collection");
  history.replaceState(history.state, "", url);
}
function renderRead({ writeUrl = false } = {}) {
  const query = $2("library-search").value, filter = $2("read-filter").value;
  const candidates = filter === "all" ? READERS : READERS.filter((r) => r.group === filter);
  const matches = searchEntries(query, candidates);
  $2("reader-list").replaceChildren(...matches.map(readingCard));
  $2("read-empty").hidden = matches.length > 0;
  $2("clear-library-search").hidden = query.length === 0;
  $2("read-count").textContent = matches.length + " " + (matches.length === 1 ? "reading" : "readings") + (filter === "nitnem" ? " in Daily Nitnem" : filter === "additional" ? " outside the Nitnem group" : " available");
  if (writeUrl) updateDirectoryUrl();
}
function openView() {
  const view = parseView(location.search);
  document.documentElement.dataset.libraryView = view;
  document.title = labels[view] + " · Gurbani Learning Library";
  for (const a of document.querySelectorAll(".library-nav a[data-view]")) {
    if (a.dataset.view === view) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
  for (const panel of document.querySelectorAll("[data-view-panel]")) panel.hidden = panel.dataset.viewPanel !== view;
  const params = new URLSearchParams(location.search), filter = oneParam(params, "collection", 24);
  $2("library-search").value = oneParam(params, "q");
  $2("read-filter").value = ["all", "nitnem", "additional"].includes(filter) ? filter : "all";
  renderRead();
  if (view === "explore") passageSearch?.activate();
}
try {
  if (READERS.length !== 10 || new Set(READERS.map((r) => r.id)).size !== READERS.length) throw Error("The reading directory is incomplete.");
  const nitnem = COLLECTIONS.find((c) => c.id === "nitnem");
  if (!nitnem || nitnem.readerIds.length !== 7 || new Set(nitnem.readerIds).size !== 7 || nitnem.readerIds.some((id) => !getReader(id))) throw Error("The Nitnem directory is incomplete.");
  for (const a of document.querySelectorAll("[data-open-reader]")) {
    const reader2 = getReader(a.dataset.openReader);
    if (!reader2) throw Error("A reading shortcut is unavailable.");
    a.href = checkedHref(reader2.href);
  }
  $2("saved-list").replaceChildren(...READERS.map(savedCard));
  $2("explore-list").replaceChildren(...EXPLORE.map(exploreCard));
  $2("today-tools").replaceChildren(...TOOLS.map(toolCard));
  $2("planned-list").replaceChildren(...PLANNED.map(plannedItem));
  passageSearch = setupPassageSearch();
  openView();
  $2("library-search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    renderRead({ writeUrl: true });
  });
  $2("library-search").addEventListener("input", () => renderRead({ writeUrl: true }));
  $2("read-filter").addEventListener("change", () => renderRead({ writeUrl: true }));
  $2("clear-library-search").addEventListener("click", () => {
    $2("library-search").value = "";
    renderRead({ writeUrl: true });
    $2("library-search").focus();
  });
  $2("reset-library-search").addEventListener("click", () => {
    $2("library-search").value = "";
    $2("read-filter").value = "all";
    renderRead({ writeUrl: true });
    $2("library-search").focus();
  });
  window.addEventListener("popstate", openView);
  $2("library-loading").hidden = true;
  document.documentElement.dataset.libraryState = "ready";
} catch (error) {
  for (const panel of document.querySelectorAll("[data-view-panel]")) panel.hidden = true;
  $2("library-loading").hidden = true;
  $2("library-error").hidden = false;
  $2("library-error").replaceChildren(node("p", "The library directory could not open. Your readers and saved learning have not been changed."));
  const link = node("a", "Open Japji Sahib directly");
  link.href = "full-japji.html";
  $2("library-error").append(link);
  document.documentElement.dataset.libraryState = "unavailable";
}
