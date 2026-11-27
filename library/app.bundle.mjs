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
  }
]);
var EXPLORE = freeze([
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
  { id: "daily-hukamnama", title: "Daily Hukamnama", available: false, summary: "The verified daily selection is not connected to this library yet." },
  { id: "full-guru-granth-sahib", title: "Full Sri Guru Granth Sahib Ji", available: false, summary: "Complete sequential reading is a future library expansion." },
  { id: "knowledge-explorer", title: "Knowledge Explorer", available: false, summary: "The separate pilot is awaiting integration and outstanding review." },
  { id: "dictionary", title: "Gurbani dictionary", available: false, summary: "A source-linked vocabulary library remains to be built and reviewed." },
  { id: "history", title: "Sikh History & Living Heritage", available: false, summary: "Historical narratives and their source records remain to be developed and reviewed." },
  { id: "audio", title: "Gurbani audio library", available: false, summary: "Recordings require permission and verified mapping before they can be included." }
]);

// library/core.mjs
var VIEWS = Object.freeze(["today", "read", "explore", "saved"]);
function parseView(search = "") {
  if (typeof search !== "string" && !(search instanceof URLSearchParams)) return "today";
  const params = new URLSearchParams(search);
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

// library/app.mjs
var $ = (id) => document.getElementById(id);
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
  const label = entry.id === "gurdwaras" ? "PLACES DIRECTORY" : entry.id === "source-sheets" ? "SOURCE READING SHEETS" : "LIBRARY TOPIC · SOURCE WORD MATCH";
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
  const q = $("library-search").value.trim(), filter = $("read-filter").value;
  if (q) url.searchParams.set("q", q);
  else url.searchParams.delete("q");
  if (filter !== "all") url.searchParams.set("collection", filter);
  else url.searchParams.delete("collection");
  history.replaceState(history.state, "", url);
}
function renderRead({ writeUrl = false } = {}) {
  const query = $("library-search").value, filter = $("read-filter").value;
  const candidates = filter === "all" ? READERS : READERS.filter((r) => r.group === filter);
  const matches = searchEntries(query, candidates);
  $("reader-list").replaceChildren(...matches.map(readingCard));
  $("read-empty").hidden = matches.length > 0;
  $("clear-library-search").hidden = query.length === 0;
  $("read-count").textContent = matches.length + " " + (matches.length === 1 ? "reading" : "readings") + (filter === "nitnem" ? " in Daily Nitnem" : filter === "additional" ? " outside the Nitnem group" : " available");
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
  $("library-search").value = oneParam(params, "q");
  $("read-filter").value = ["all", "nitnem", "additional"].includes(filter) ? filter : "all";
  renderRead();
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
  $("saved-list").replaceChildren(...READERS.map(savedCard));
  $("explore-list").replaceChildren(...EXPLORE.map(exploreCard));
  $("today-tools").replaceChildren(...TOOLS.map(toolCard));
  $("planned-list").replaceChildren(...PLANNED.map(plannedItem));
  openView();
  $("library-search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    renderRead({ writeUrl: true });
  });
  $("library-search").addEventListener("input", () => renderRead({ writeUrl: true }));
  $("read-filter").addEventListener("change", () => renderRead({ writeUrl: true }));
  $("clear-library-search").addEventListener("click", () => {
    $("library-search").value = "";
    renderRead({ writeUrl: true });
    $("library-search").focus();
  });
  $("reset-library-search").addEventListener("click", () => {
    $("library-search").value = "";
    $("read-filter").value = "all";
    renderRead({ writeUrl: true });
    $("library-search").focus();
  });
  window.addEventListener("popstate", openView);
  $("library-loading").hidden = true;
  document.documentElement.dataset.libraryState = "ready";
} catch (error) {
  for (const panel of document.querySelectorAll("[data-view-panel]")) panel.hidden = true;
  $("library-loading").hidden = true;
  $("library-error").hidden = false;
  $("library-error").replaceChildren(node("p", "The library directory could not open. Your readers and saved learning have not been changed."));
  const link = node("a", "Open Japji Sahib directly");
  link.href = "full-japji.html";
  $("library-error").append(link);
  document.documentElement.dataset.libraryState = "unavailable";
}
