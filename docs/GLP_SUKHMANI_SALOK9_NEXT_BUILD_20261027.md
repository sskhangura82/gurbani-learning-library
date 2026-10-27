# GLP-001 — Next Full Scripture Collections: Sukhmani Sahib and Salok Mahalla 9

**Source-only engineering order · October 27, 2026 · DRAFT for review · No public or family release authority**

## User's intent and priority

The user wants **Sukhmani Sahib** next, with a special interest in what it teaches about **ਸੰਤ (Sant)**. **Salok Mahalla 9** is next after Sukhmani. These are *additional stand-alone scripture collections*, NOT changes to the SGPC morning/evening/night Nitnem order. The user explicitly does not want external websites as the reading experience, a competing rebuilt app, paywalls, AI chat, streaks or redesign.

Continue from the latest verified versioned Gurbani Learning Library, preserving the Japji Sahib text-first model:

**Read** — original Gurmukhi, simple calm navigation, variable source-accurate section titles, original text larger than anything else.

**Meaning** — accurate English and easy Punjabi directly below the *exact* original line, never a generic passage summary masquerading as a translation. Missing meanings remain labeled unwritten.

**Study** — context, vocabulary, grammar when verified, attribution, theological interpretation, differing scholarly readings, reflection and teach-back, all under the source line. Drafts require qualified Sikh/Punjabi review before family promotion.

**Pace** — silent visual-guidance slider **50–200 tokens/minute**, not proof of synchronized recitation or fast paath. Existing bookmarks/reflections remain local; no account, tracking or monetization.

## Accomplished source-only work in this packet

Two original-scripture **DIGITAL WITNESS CANDIDATES** imported from a single SHA-pinned archived Shabad OS Database release 4.8.7, SQLite sha256 `d8e071347bd5485cc6aa2533c1f51347a16ed1724b4d8abaa4939520257074c2`.

Shabad OS documentation: <https://www.shabados.com/docs/database/> and original source/notice: <https://github.com/shabados/database>. The archived DB is historical (2022), not automatically equivalent to the newest 2026 Shabad OS source. For every original source row we preserve the exact **legacy ASCII**, exact unique source ID, Ang, original source order, and SHA. A pinned `gurmukhi-utils@3.2.2` tool derives Gurmukhi Unicode. The builder checks conversion reversibility rather than silently rewriting text. No English/Punjabi translation from that database has been imported, bundled or assumed licensed.

| Collection | Original source candidate | Verified structural intake | New teaching |
| --- | --- | --- | --- |
| Sukhmani Sahib · Guru Arjan Sahib · Angs 262–296 | 2,027 original source rows including headings, saloks, Rahau and pauri lines | **24 Saloks, 24 Ashtpadis, 192 numbered pauris of exactly 10 scripture lines, two distinct Rahau lines**, independently SHA-bound | Pilot: **8 distinct Sant/Sadh source-line explanations**, original English/Punjabi and interpretive care |
| Salok Mahalla 9 · Guru Tegh Bahadur Sahib · Angs 1426–1429 | 117 original rows: 114 verse lines plus invocation, original title and later Dohra heading | **57 two-line saloks** in original order, each with verified source-end numbering | Pilot: **Saloks 12 and 56**, source-SHA-bound simple/deep educational stanza drafts |

Original Gurmukhi files:
- `study/sources/sukhmani-shabados-487-candidate.json`
- `study/sources/sukhmani-ashtpadi-pauri-outline.v1.json`
- `study/sources/salok-mahala9-shabados-487-candidate.json`

Deterministic builders:
- `tools/study/build-source-intake.mjs`, requires privately stored exact SQLite and pinned conversion package; can verify byte equality.
- `tools/study/build-source-outline.mjs`, verifies exactly 192 numbered pauris and keeps 2 first-Ashtpadi Rahau lines separate.
- `tools/study/build-sant-learning-pilot.mjs`, binds editorial notes to source SHA; no generated scripture and no runtime AI.

## One genuine source defect: must NOT be repaired silently

**Sukhmani source line ID `7ST5` at Ang 282** is an exact legacy ASCII vs Unicode round-trip mismatch. Original source legacy bytes: `tUtI gwFnhwr guopwl ]`; conversion gives a derived Unicode spelling that fails strict reversible source validation. We preserved the **exact original ASCII** and original SHA and marked this row `sourceTextHeld=true`. The related pauri is present in navigation/custody but cannot be displayed as an approved correction or silently edited for family recitation.

2,143 of 2,144 rows reverse-convert without a mismatch; exactly one is held. Resolve via a second independent vetted SGGS source/physical source, log the discrepancy and require a qualified source reviewer before opening that line to readers. Keep the untouched original witness and create a new version for any adjudicated text, never overwrite or silently normalize.

## Sant in Sukhmani: pilot attribution and teaching safety

Eight individually drafted source-bound entries, with original source IDs and Angs:

- `N9ZJ`, `LB45` — Ang 265, Ashtpadi 2: good company, seva, Naam.
- `91LZ`, `V2NX`, `CNCV` — Ang 271, Ashtpadi 7: less ego, more sugiān, praise of the spiritually devoted.
- `44JT`, `4U0A` — Ang 279, Ashtpadi 13 salok: Sant’s refuge and the powerful caution on **ninda**.
- `2HNK` — Ang 288, Ashtpadi 19: study and reflection within spiritually wise company.

The pilot makes no universal claim that **Sant** always denotes one specific living person, or that self-claimed titles prove truth. In Sikh exegetical discussions, references to Sant/Sadh may depend on whether the text speaks of the Divine, Guru, Gurmukh or holy company. Ninda warnings do not prevent truthful safeguarding concerns, evidence-based questioning or holding leaders accountable. No AI-generated religious ruling or fear-based punishment copy.

Two optional conceptual connections to Salok Mahalla 9: **Salok 12** discusses Santan proclaiming Divine presence in every heart, and **Salok 56** names Naam, Sadhu, Guru and Gobind among abiding supports. Pilot content is under `study/content/sant-source-anchored-pilot.v1.json`.

## Non-negotiable next admission gates

1. **G0 Source integrity:** source IDs, SHA, Ang, source grouping, 24×8 pauris and all 57 numbered couplets validated; classify historical headers and refrain separately. Byte integrity PASS *does not* equal religious correctness.
2. **G1 Independent textual review:** compare against the newest Shabad OS monorepo and a vetted SGGS physical/edition witness; adjudicate Ang 282 `7ST5` without changing the original record; verify punctuation, traditional vishraam and passage identity. Reject falsely confident variants.
3. **G2 Rights and attribution:** SGGS scripture in original, upstream database public-domain/content notice and conversion license reviewed. Any twentieth-century commentary (Darpan, modern translations) cited, not copied without permission.
4. **G3 Exactly one existing reader:** add optional cards under an **Additional Banis / Study** collection in the existing GLP, not required Nitnem sequence. Sukhmani navigates Ashtpadi → Salok/Pauri → line and keeps the Rahau. Salok9 navigates 1–57. All content must be same-origin and cached. No external reader handoff.
5. **G4 Editorial pilot and scaling:** use the eight Sant thematic explanations and Salok9 12/56 as an **unapproved** formatting sample. Then write distinct source-anchored bilingual short and deeper explanations for the rest. Do not auto-fill with generalized text. Secure Sikh/Punjabi/santhiya editorial review before family use.
6. **G5 Device and security acceptance:** current no-account/offline/fail-closed source hashes maintained. Test real iPhone Safari at 320/390/large text, VoiceOver Punjabi locale, 200 visual pace, offline airplane mode, stored position, and honest explanation coverage; preserve rollback to all previous full Nitnem versions.

## What is and is not delivered

**Delivered now:** full **source-only** unapproved input manifests for Sukhmani and Salok Mahalla 9, correct navigation structure for both, the exact Ang 282 hold, and ten initial original editorial study examples. Code and data live on a new review-only GitHub branch; the current private family Nitnem reader is **not replaced or changed**, and the new collections have **not been released as reader pages**.

**Still outstanding:** independent 2026 SGGS text collation, religious/source/rights approval, direct family app integration and native iPhone QA, and comprehensive original EN/PA line-level and deeper meanings for Sukhmani and all 57 Saloks. Avoid saying either bani is “fully built for family” until the above gates pass.

**Strategic work order:** First complete source-review and private-reader integration for **Sukhmani Sahib** while preserving the Sant study as an important theme. Then implement **Salok Mahalla 9**, with its 57 paired saloks and source-bound Word/Meaning/Study. Both follow the existing GLP's calm, scripture-first Darbar standard.
