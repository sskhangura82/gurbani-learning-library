# D04 · Market research report (first pass)

**Status: started, not complete.** The assignment asks for hands-on inspection kept apart
from documentation-only research. Stated plainly:

- **I installed and used none of the apps below.** I have no phone and no app store.
- Three evidence classes are used and marked on every row:
  - **H — handled directly in this review**: I read the project's source repository or
    used its data.
  - **D — public documentation seen today** as extracts returned by web search (store
    listing, project or press page). Source link given. I did not open these pages in
    full, so anything not in the extract is unknown to me.
  - **K — my general knowledge to mid-2026, not re-checked today.** Treat as leads. Any K
    statement must be verified before it is repeated anywhere.
- No claim is made that this app is better or worse than any of them. The scorecard in D09
  is an internal score only.

## 1. Gurbani apps, sites and data projects

### SikhiToTheMax — Khalis Foundation · class H (repositories), not used as an app
- **What it is:** the long-standing tool for showing Gurbani with translations on screens
  in gurdwaras and at keertan; originally by SHARE Charity UK. Web, desktop and mobile.
- **Verified today:** web and desktop source are public under the Open Software License
  3.0; both active (last changes 2026-10-09 and 2026-11-20).
  `github.com/KhalisFoundation/sttm-web`, `…/sttm-desktop`.
- **Depth for a learner:** Read and search; translations alongside (K). Built for display
  and search, not for study.
- **Learn from it:** search by first letters is the habit of the whole community (K);
  a reader without it feels incomplete (CI-U-06).

### BaniDB — Khalis Foundation · class H (API repository), not queried
- **What it is:** the database and API behind SikhiToTheMax and Sundar Gutka (K).
- **Verified today:** API code is MIT-licensed and active (2026-10-23).
  `github.com/KhalisFoundation/banidb-api`. The licence of the *text and translations* it
  serves was not checked — **rights question open** (CI-P-01).
- **Relevance:** the app's Jaap Sahib text is a BaniDB snapshot [R]. Slips found there
  (CI-S-02, CI-S-03) should be reported to this project once checked against print.

### Sundar Gutka — Khalis Foundation · class D
- Source: App Store listing, `https://apps.apple.com/app/id431446112` (read 2026-11-25).
- **Platform, price:** iPhone, iPad, Mac, Vision; free. Version 5.8.3; 78.9 MB.
- **Scope:** daily and extended banis — far more compositions than this app.
- **Features listed:** choice of bani length (affects Aarti, Rehras, Chaupai and Kirtan
  Sohila); larivaar option; romanised option; English translations; re-orderable index;
  font size and type; background colours; bookmarks; stay-awake; auto-scroll; reminders.
- **Privacy label:** "usage data" and "diagnostics" may be collected, not linked to identity.
- **Reader comments seen on the listing:** bookmarks unreliable; meanings missing for some
  Sukhmani lines; a missing line reported in one bani; Gurmukhi display trouble after an
  iOS update.
- **Depth:** Read; Understand through an English translation. No word study or commentary
  listed.
- **Learn from it:** (1) *bani length as a setting* is how the leading gutka app handles
  the Rehras and Chaupai differences between traditions — the cleanest answer to CI-S-09.
  (2) Even the leading app draws complaints about bookmarks and missing lines: reliability
  of place and completeness is where trust is won.

### Khalis Sehaj Path — Khalis Foundation · class D
- Source: `https://apps.apple.com/app/id6752426194`. iPhone; free. Reading the whole Guru
  Granth Sahib gradually; paragraph mode; vishraams (pause marks) recently added.
- **Learn from it:** pause marks are being treated as a core reading aid.

### Shabad OS — class H (database used in this review; repositories read)
- **What it is:** an open database of Gurbani and other Panthic texts "with a public
  logbook of sangat-sourced corrections", plus a presenter and a viewer for proofreading.
- **Verified today:** database MIT-licensed; states it is "backed by real, physical
  sources" with "photographic evidence continuously reviewed"; several translations and
  teekas ship as separate assets (I used four); development has moved to a single
  repository (last change in the old ones 2026-08-22). `github.com/shabados/database`.
- **Handled:** I collated all 3,809 app occurrences against it and found one slip in it
  (CI-S-15).
- **Learn from it:** (1) corrections as a *public log with evidence* is the right model for
  this project's scripture changes. (2) Pause marks are stored inside the text and can be
  shown or hidden. (3) Its licence makes it a lawful base — but it is still one digital
  family, not print.

### The Guru Granth Sahib Project — Sikh Research Institute · class D
- Sources: `https://www.sikhdharma.org/?p=47812`;
  `https://sikhri.org/news/guru-granth-sahib-project-press-release`;
  `https://dvnetwork.org/projects/the-guru-granth-sahib-project---a-global-translation-and-transcreation-initiative`.
- **What it is:** a web resource (first release August 2020) that works through Sri Guru
  Granth Sahib bani by bani in four steps: **annotation of each word** using etymology and
  history; a **literal translation** after that; an **interpretive** rendering; and
  **commentary** on what each shabad conveys. Described by its makers as a twenty-year
  effort on every word's etymology, grammar and meaning. Releases continued in 2026.
- **Scope:** Sri Guru Granth Sahib only; not Dasam Bani.
- **Depth:** the deepest word-level public resource I know of — levels 2 to 4 of the
  learning standard, done by named human teams.
- **Learn from it:** (1) the *order* — word first, then literal, then interpretive, then
  commentary — is the opposite of this app's (paraphrase first, a few words after).
  (2) Its literal and interpretive renderings are shown *separately*. (3) It exists; for
  Japji, Sukhmani, Anand and Sohila this app should link to it or seek to work with it
  rather than produce a weaker parallel. **Rights: its content is theirs; nothing may be
  copied without permission.**

### Open Granth — class H (the copy vendored in this repository)
- MIT licence and notice are kept in `vendor/opengranth/`. Source of the app's Japji,
  Sukhmani and Anand text; its Gurmukhi derives from Shabad OS.

### Others — class K (not re-checked today)
| Resource | What I believe it offers | To verify |
|---|---|---|
| iGurbani (Khalis Foundation) | Search across Gurbani with several translations; favourites | current state, features |
| Gurbani Searcher (Android) | Offline search, several scripts and translations | current state |
| SriGranth.org | Line search of Sri Guru Granth Sahib; several translations; Prof. Sahib Singh's teeka; dictionary lookups including Mahan Kosh | features; terms of use |
| SearchGurbani.com | Several granths including Dasam Granth and Bhai Gurdas; Mahan Kosh; translations | features; text sources |
| SikhNet | Gurbani audio library, daily hukamnama, learning articles and courses | scope; licences |
| Learn Shudh Gurbani | Correct pronunciation (santhya) with marked pauses and teacher audio | maker; licences |
| GurbaniNow | Desktop and API for presenting Gurbani | state |

## 2. Traditional books and teekas — class K throughout

These remain the standard a serious learner is measured against. None was opened in this
review.

| Work | What it gives | Rights note (not legal advice — I am not a lawyer) |
|---|---|---|
| SGPC *Shabdarth Sri Guru Granth Sahib Ji* | Text with word meanings in the margin | Institutional; ask SGPC. (My reference database carries this text as its primary.) |
| Prof. Sahib Singh, *Sri Guru Granth Sahib Darpan* | Grammar-based word meanings, then meaning, then gist, for every shabad | Author died 1977; likely still in copyright in India. Cite and link; do not reproduce |
| Bhai Vir Singh, *Santhya Sri Guru Granth Sahib* | Deep word study and context (incomplete) | Check status before any reuse |
| Faridkot Teeka | The classical Nirmala-tradition commentary | Early 1900s; likely public domain; confirm edition |
| Bhai Kahn Singh Nabha, *Mahan Kosh* (1930) | The standard encyclopaedic dictionary | Likely public domain; confirm, and credit the digitiser |
| Dr Rattan Singh Jaggi and Dr Gursharan Kaur Jaggi, Dasam Granth text and commentary | Edited text and Punjabi explanation of Dasam Bani | In copyright; cite only |
| Nitnem steeks (several authors) | Line-by-line Punjabi meaning of the daily banis | Varies; check each |

**What the books do that the app does not:** a named editor answerable for every reading;
stable pages; word meanings *before* the sentence meaning; pause marks; notes on variant
readings. The traditional teaching order — ਪਾਠ, ਪਦ-ਅਰਥ, ਅਰਥ, ਭਾਵ, with ਪ੍ਰਮਾਣ (supporting
verses) from elsewhere in Gurbani — is very close to the six-level standard in the
assignment. The standard is not a new invention; it is the steek tradition made digital.

## 3. Scripture study outside the Sikh world

| Resource | Class | Verified today | Believed (K) | Lesson |
|---|---|---|---|---|
| **Sefaria** (Jewish texts) | H repo | "Largest open-source database of Jewish texts"; public API and developer portal; code GPL-3.0; active today | Tap any verse to see linked commentaries and parallel passages; every text version carries its own licence | The cross-reference graph and per-version licence labels are the model for levels 4–5 and for CI-P-01 |
| **SuttaCentral** (early Buddhist texts) | H repo | Offline-capable web app with a JSON API; all code dedicated to the public domain; active | Root text and translations aligned segment by segment; parallels across canons | Segment-level alignment of original and meaning; a web app, not a store app, can serve a scripture library well |
| **Quran.com** | H repo (little detail) | Official open repository exists | Word-by-word meaning and transliteration on tap; many tafsirs; notes; reading goals | Word-on-tap is the familiar form of level 3. Its goals and streaks are *not* to be copied |
| Bible study tools (several) | K | — | Interlinear original-language text with dictionary numbers; cross-reference columns | Stable word IDs linking every occurrence to one dictionary entry |

## 4. Learning tools

| Tool | Class | Lesson for this app | What not to copy |
|---|---|---|---|
| Anki | H repo (AGPL; active) | Spaced return to what you chose to remember | Daily counts, review debt |
| Readwise | K | Your own saved passages resurfacing quietly | Streaks, email nudges |
| Kindle | K | Tap a word for its meaning without leaving the page; export highlights | Popular-highlight social features |
| Khan Academy | K | Small steps with a check for understanding ("teach-back" already exists here) | Points and badges |

## 5. What this first pass suggests

1. **Nobody visible combines** careful daily-reading design, private on-device notes, and
   layered study in one calm web app. That is a real space. **[I]**
2. **The app is behind on three basics** the community already expects: search, choice of
   bani length, and pause marks. **[I]**
3. **It is ahead on one thing that matters**: nothing leaves the device, with no account —
   the leading gutka app's own listing says it collects usage data. **[D]**
4. **For deep study of Sri Guru Granth Sahib banis, a far stronger human-made resource
   already exists** (The Guru Granth Sahib Project). The honest strategy is to point to it
   and to the teekas, and to spend this project's own effort where little exists: the
   reading experience, Punjabi-first explanation, Dasam Bani nitnem with a properly
   established text, and private reflection. **[I]**

## 6. Still to do

- Verify every K row.
- Hands-on sessions on a real phone for Sundar Gutka, SikhiToTheMax, iGurbani and one or
  two nitnem apps, using the same task list as D06 so results can be laid side by side.
- Read the licences and terms of BaniDB, SriGranth and SearchGurbani.
- Ask The Guru Granth Sahib Project and Shabad OS whether and how they welcome linking or
  collaboration (owner's decision to approach).

## Appendix · Record sheets in the assignment's fifteen fields

Only resources for which I hold H or D evidence. "n/i" = not inspected; I did not use the
product, so reading quality, search, accessibility and offline behaviour are n/i unless a
document states them. Date inspected for every column: 2026-11-25.

| Field | Sundar Gutka | SikhiToTheMax | Shabad OS | The Guru Granth Sahib Project | Sefaria | SuttaCentral |
|---|---|---|---|---|---|---|
| Version and how inspected | 5.8.3; store listing (D) | repositories at 2026-10-09 / 2026-11-20 (H) | database v5.0.0-next.0 used; repositories (H) | project and press pages (D) | repository at 2026-11-25 (H) | repository at 2026-11-19 (H) |
| Platforms, availability | iPhone, iPad, Mac, Vision; free (D) | web, desktop, mobile (H/K) | web viewer, desktop presenter, mobile in development (H) | web (D) | web, apps (H/K) | installable web app with API (H) |
| Features actually verified | none used; listed: bani length, larivaar, romanised, English translation, bookmarks, auto-scroll, reminders (D) | none used | text and four translation assets read directly (H) | none used; four-step method described (D) | none used; API and developer portal stated (H) | none used |
| Accuracy, source transparency | modelled on a named gutka tradition (D); text source n/i | BaniDB (K) | states physical sources, photographs, public correction log (H); I found one list slip | named institute and teams (D) | per-version sources and licences (K) | per-edition (K) |
| Reading quality | n/i | n/i | n/i | n/i | n/i | n/i |
| Educational depth | translation only (D) | translations, teekas (K) | translations, teekas as data (H) | word, literal, interpretive, commentary (D) | linked commentary (K) | aligned translations, parallels (K) |
| Search, navigation | re-orderable index (D); search n/i | search is its core (K) | search (H) | n/i | n/i | n/i |
| Language learning | romanised option (D) | n/i | n/i | etymology per word (D) | n/i | n/i |
| Offline | n/i (store app) | n/i | n/i | n/i | n/i | built as installable web app (H) |
| Accessibility | n/i | n/i | n/i | n/i | n/i | n/i |
| Privacy | usage and diagnostics data may be collected, not linked to identity (D) | n/i | n/i | n/i | n/i | n/i |
| Price, model | free; foundation (D) | free; foundation (H) | free; volunteer organisation (H) | free; donation-funded institute (D) | free; non-profit (K) | free; non-profit (K) |
| Strengths | breadth of banis; tradition lengths; long-established | the community's display standard; open code | open data with evidence trail; MIT | human scholarship at word level | cross-reference graph; open data | open licence; segment alignment |
| Weaknesses seen | listing reviews: bookmarks, missing lines and meanings (D) | not a study tool (K) | still one digital family, not print | Sri Guru Granth Sahib only; coverage still growing (D) | n/i | n/i |
| Lessons for this library | bani length setting; reliability of place | first-letter search | public correction log; pause marks in data | word first, then literal, then interpretive — shown separately | per-item licence and review labels; linked references | align meaning to original segment by segment |
