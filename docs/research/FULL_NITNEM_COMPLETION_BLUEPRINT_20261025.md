# GLP-001 · Full Nitnem completion program

**Program record: 25 October 2026. NONSHIPPING — research and engineering evidence.**

## Objective and existing baseline

Finish **seven named daily bani reading experiences** inside the *existing Gurbani Learning Library*, sharing one source-aware, mobile-first reader architecture. Ardas is included as a separate accompanying prayer, never misrepresented as an SGGS composition. The live Japji Sahib (R7, all original text) remains untouched. Full Nitnem means more than a list of title links: every original source requires a pinned edition, correct composition boundaries, complete sequence, mobile/offline reading, accessibility and a qualified text/review trail. Original script, source notes, translations and personal reflections remain distinct layers.

The daily sequence is anchored to the [SGPC Sikh Rehat Maryada](https://sgpc.net/sikh-rehat-maryada-in-english/), with the five-bani morning practice also described by Sikh institutions. The collection must **name its chosen edition and variant** rather than assert that all Sikh traditions recite identical limits. The morning Anand candidate is the **full 40-pauri** composition; the selected first five and concluding pauri found within composite Rehras are NOT a replacement for the full morning Anand. Rehras is a sourced **composite**, not one invented uniform source.

## Actual completion ledger

| Bani | Source lane | State at this checkpoint | Next provable gate |
|---|---|---|---|
| Japji Sahib | SGGS Ang 1–8 | Existing accepted original reader, 385 occurrences; explanation drafts not human-approved | Preserve R7; M0/Serenity release and qualified review remain separate |
| Jaap Sahib | Dasam Bani | Original source **not ingested** | Select edition and bound complete Jaap; no fictitious SGGS Ang |
| Tav-Prasad Savaiye | Dasam Bani | Original source **not ingested** | Identify exact ten Savaiye beginning *Sravag Sudh* |
| Benti Chaupai Sahib | Dasam Bani | Original source **not ingested** | Name SGPC boundary and compare longer variants without silent truncation |
| Anand Sahib | SGGS Ang 917–922 | **40 numbered pauris, 210 digital source rows audited; 208/210 rows match a second digital source exactly.** Two disagreements are preserved: heading punctuation and a private-use Unicode code point in Pauri 24 | Independent edition/Unicode adjudication; no source model or reader published |
| Rehras Sahib | Composite SGGS + Dasam | Ordered source components **not ingested** | Compose verified So Dar/So Purakh + Benti Chaupai + selected passages in documented SGPC order |
| Kirtan Sohila | SGGS Ang 12–13 | **Five shabads, 56 digitally frozen source rows**; one second-web-source comparator positive 56/56 as normalized substrings, 51/56 as exact displayed rows; not edition-approved | Review five line/heading segmentation differences, human original-corpus collation and rights |
| Ardas | Prayer accompanying morning/evening | Model and sources pending | SGPC prescribed base and permissible occasion-specific wording review |

Machine-readable state: `docs/research/full-nitnem-program-20261025.json`. **NO new reader route is enabled in the registry, main or preview.**

## Kirtan Sohila N1 — candidate source protocol

The N1-a capture is deterministic and refuses to rewrite an existing snapshot.

- **Primary digital reference**: [Siri Guru Granth Ang 12](https://srigurugranth.net/0012.html) and [Ang 13](https://srigurugranth.net/0013.html).
- **Second digital comparator**: [Open Granth Ang 12](https://opengranth.org/ang/12/) and [Ang 13](https://opengranth.org/ang/13/). Open Granth says it derives its original digital corpus from Shabad OS; a different hostname is **not necessarily an independent source edition**.
- **Exact bounded dataset**: first `ਸੋਹਿਲਾ ਰਾਗੁ ਗਉੜੀ ਦੀਪਕੀ ਮਹਲਾ ੧` through `ਨਾਨਕ ਦਾਸੁ ਇਹੈ ਸੁਖੁ ਮਾਗੈ ਮੋ ਕਉ ਕਰਿ ਸੰਤਨ ਕੀ ਧੂਰੇ ॥੪॥੫॥`. Five sections with **12, 8, 14, 11, 11 source rows** respectively, including printed original headings.
- **Source findings**: 56/56 candidate strings have positive normalized-substring matches in the comparator. Its HTML merges some adjacent rows or page-boundary rows; only 51/56 map directly to a single comparator displayed row. The very first printed heading is presented with a terminal punctuation difference. Neither mismatch has been "corrected" automatically. Full per-original digests and digital retrieval SHA-256 receipts are in `docs/research/n1-sohila/sohila-source-comparison.json`.
- **Candidate model**: `docs/research/n1-sohila/sohila-candidate-original.json` follows the existing pure composition model from PR #14. Each Gurmukhi line has a stable occurrence ID, original Unicode (not OCR), SHA-256 and SGGS Ang. Unit headings are already original lines; a later renderer must NOT repeat them as extra lyrics.
- **State**: `sourceStatus=machine_frozen`, `humanCollationApproved=false`, `ui.readable=false`, meanings/Study `not_ingested`, `rightsStatus=...not_yet_cleared...`. The existing generic model reports structurally valid but **REJECTS forPublication** (`not_a_public_reader`, `second_bani_source_approval_missing`). No UI/router/worker or source release changed.

Source capture is manual/research-only: `python3 tools/compositions/intake_sohila.py --capture`. Running CI does **not** fetch the internet; the frozen source model and comparison evidence are pinned, and `node tests/sohila-source-intake.mjs` checks original immutable bytes and every hold. Human collation can identify a different source-edition choice; produce a new reviewed version rather than silently rewriting this candidate.

## Unresolved critical questions to solve before Full Nitnem publication

1. **Edition authority and rights.** Name the exact physical/SGPC edition for each scriptural family, edition variation, full text source and reuse provenance. Modern translations are separate copyrighted works and are NOT imported from websites in this source-only PR.
2. **Source segmentation.** Kirtan Sohila heading/line layout; Anand 40 numbered pauris, with nonstandard digital Unicode requiring human comparison; Dasam Bani exact recitation start/end; Rehras composite order and repeat passages.
3. **One reader, seven compositions.** Adapt source-approved models into the *existing* Read / Meaning / Study presentation and six-button dock. Never fork seven unrelated apps, lose full Japji learning or hide draft status; edition-specific bookmark namespaces and migration contracts are required.
4. **Pronunciation, recitation and teaching.** Teach each line accurately, with bilingual context and a clearly unapproved manuscript until qualified Sikh/Punjabi review. A silent visual guide is not audio timing; any recording requires rights and measured alignment.
5. **Physical family acceptance.** Real iPhone Safari / Home Screen / VoiceOver / true offline / large Gurmukhi / no lost learning, and independent design review on every reader version. Chrome simulation is useful but is not iOS proof.
6. **Authority.** A source candidate's own Boolean "passed" fields are not trustworthy human attestations. Independent, out-of-band review receipts and explicit founder publication approval must be checked separately. Draft PRs do not auto-merge or release.

## Parallel engineering work orders — do not idle for editorial reviews

**N1** Sohila source receipt + generic-reader bridge. The frozen 56-line original source now passes an explicit *nonshipping* adapter `tools/compositions/continuous-source-parity.mjs` against the existing R7 continuous-reader core (five boundaries, 56 exact lines, every token, passage transition, source-specific prospective storage namespace, and no active route). `tests/sohila-continuous-parity.mjs` proves source parity, refuses unreviewed public claims, and never writes browser data. Accepted R7 supports 48px scripture; the 60px Serenity successor is a **separate future integration** and is not falsely claimed by this baseline. No second-bani public reader or source approval exists.

**N2** Full Anand original-source audit. A **40-pauri / 210-row** digital cross-comparison now exists at `docs/research/n2-anand/anand-source-audit.json` (208/210 exact NFC row matches). Global row 0 has a heading-terminator difference; global row 123 (Ang 920, digital row 13) has a source-private-use U+F03D character where the second website uses a different Gurmukhi combining character sequence. Neither is silently normalized or certified; no Anand composition model or reader is generated. Independent SGGS edition adjudication and qualified review are required before ingestion. Other lanes need not idle.

**N3** Jaap, Savaiye, Chaupai original-source versions and bounded comparison (names/limits/edition). Build independent data validation tests; no SGGS Ang assignments to Dasam text.

**N4** Rehras six-section **non-text** SGPC composition manifest is now authored under `docs/research/n4-rehras-component-ledger.json`: nine SGGS hymns; Benti Chaupai excerpt; distinct evening Savaiya; distinct Dohira; Anand first five plus 40th pauri; Mundawani and Mahla 5 Slok. `tests/rehras-component-ledger.mjs` forbids invented Dasam Ang labels, conflating the morning ten Savaiye with the evening one, or silently offering any unverified verse. It contains **no Rehras text**, no enabled route and does not settle community-version differences.

**N5** Integration: reconcile the source contracts from this branch with PR #12's existing Nitnem collection and PR #18's proven Serenity reader, without including PR #12's unreviewed Mind lesson in a production release. Use one reader framework, per-composition local state, release worker manifest, stable rollback. Ardas is a companion practice.

**N6** Qualified source/exegesis review, physical iPhone checks, family usage and final founder release word. Prepare staged previews without assigning approval to machines.

**Definition of done:** all seven complete source-verified original banis are available in the library's accepted reader, appropriately reviewed and tested; Ardas is separately navigable; all unapproved teaching is explicitly labeled; audio is honest; family learning survives updates. The current state **does not** satisfy this definition.

No personal browser learning, family account, recordings, credentials, new paid services, GitHub main or public Pages were accessed or modified by this candidate source intake.
