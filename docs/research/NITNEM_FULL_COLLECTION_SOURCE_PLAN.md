# GLP-001 — Completing Nitnem without compromising Gurbani

**2026-10-24 · Source-intake and curriculum plan · DRAFT, not release approval.**

## Current truthful coverage

| Composition | Original text in our actual reader | Meaning and deep-study status | Next action |
| --- | --- | --- | --- |
| Japji Sahib | **Complete original** — 385 occurrences, Mool Mantar, opening, 38 pauris, closing | All 385 short bilingual meaning drafts, 42 Study draft units. No qualified human approvals; original founding depth still being expanded. | Continue deep lessons; source collation/paired reviews |
| Jaap Sahib | **Not ingested** | Not authored | Establish precise Dasam Bani source edition, then source-collected text, second-source collation |
| Tav-Prasad Savaiye (Sravag Sudh) | Not ingested | Not authored | Confirm the ten-Savaiye boundaries and authoritative Gurmukhi edition |
| Benti Chaupai Sahib | Not ingested | Not authored | Resolve named recitation boundaries and text version; don't silently choose among traditions |
| Anand Sahib | Not ingested | Not authored | Full 40 pauris, SGGS Ang 917–922, preserve shorter Rehras excerpts distinctly |
| Sodar Rehras Sahib | Not ingested | Not authored | Model as an ordered composite of specifically identified units; SGPC and alternative traditions separately named |
| Kirtan Sohila | Not ingested | Not authored | Five shabads from SGGS Ang 12–13; ideal next renderer parity fixture due to size and authentic raag headings |
| Ardas | Not ingested | Not authored | Distinct public prayer text and status; accompanying practice, not simply another SGGS bani |

**No new original Gurbani was invented or bulk copied to meet a completeness target.** Six main Nitnem compositions remain unimplemented as readers. “All Nitnem complete” is not a valid milestone until every chosen edition's original text and minimum source checks are real.

## Authoritative practice and textual distinctions

The [SGPC Sikh Rehat Maryada, Article IV](https://sgpc.net/sikh-rehat-maryada-in-english/) names Japji, Jaap, ten Savaiye beginning Sravag Sudh, Chaupai and Anand Sahib (40 pauris) for morning; prescribed Sodar Rehras composition in evening; and Sohila at night. Some Sikh traditions maintain additions, variants and different practical recitation boundaries. The [Akhand Kirtani Jatha Nitnem description](https://akjsikh.org/nitnem/) is one explicitly named comparison source. A user may choose a correctly labeled reviewed edition, but the product may not say every community reads exactly the same sequence.

The scriptural heading **Raag** belongs to specific shabads; do not assign a raag to Japji Sahib because individual audio performances use a melody.

## Provenance choices; licensing is NOT automatically solved

- [Open Granth](https://github.com/opengranth/open-granth) covers SGGS Angs and has useful source/hashing methods; its MIT software code license explicitly **does not** license all imported modern translations. It does not supply Jaap, Tav-Prasad Savaiye, or Benti Chaupai.
- [BaniDB](https://github.com/KhalisFoundation/banidb-api) includes additional compositions and text source registers, but projects report specific NPOSL-3.0 obligations. Confirm actual upstream license/permissions before copying any database content. Modern translations, transliteration and audio have different rights from centuries-old original bani.
- For Dasam Bani and Rehras variants, name the institutional edition and stanza boundaries; preserve disputed textual/version differences rather than choosing by undocumented convenience.
- Record edition URL/book title, steward, retrieved date, scope, author/raag metadata, exact Gurmukhi text checksum, independent comparator, translator/editor attribution and rights status before publishing.

## Generic reader contract before the second bani

One general composition object, versioned and hash-checked:
- compositionId, editionId, source family (Sri Guru Granth Sahib, Dasam Bani, composite daily reading, or Ardas).
- language/script; global Ang if SGGS, original-edition location if Dasam, **not a fictitious SGGS Ang**.
- ordered units and occurrences; stable unique IDs, exact original Unicode, source hash, literal punctuation.
- author and raag only where printed/verified; no invented metadata for Japji.
- editorial layers: precise English/Punjabi short meaning, deeper lesson, concept connections and optional recording timing, each with reviewer role and separate revision.
- user state namespaced per composition and edition, with export/import and collision-safe local keys. Existing GLP Japji learning must not be migrated silently.
- partial educational layers may be present but visibly draft/unfinished. A missing source verse cannot be replaced by a fluent LLM guess.

## Build sequence (real engineering milestones)

**N0 — Japji learning standard.** Finish founding-level Mool/Pauri 1–2 exemplar, audit the 42 seeds, and author Pauri clusters (Hukam opening; Suniai 8–11; Mannai 12–15; Panj Khand 34–37) from hashed text, rather than mass-generating every line. The reader is already complete for simple paath and simple bilingual draft coverage; **deep teaching is not yet complete.**

**N1 — Second-bani parity.** Import **Kirtan Sohila** into a controlled generic reader as the small first parity test: five reviewed shabads and authentic raag headings. Run source-text hash diff, iPhone typesetting, cache/rollback and per-bani learning isolation. No claim of complete Nitnem yet.

**N2 — Core SGGS compositions.** Import 40-pauri Anand Sahib and the SGGS components of Rehras with exact author/Ang/raag and enclosed context; add correct short translations and deeper teaching drafts only after source trust is secured.

**N3 — Dasam Bani intake.** Jaap Sahib, Tav-Prasad Savaiye and Benti Chaupai from a chosen named, checked institutional source, with version/boundary ledger and licensed data source. A Jaap rhythm/chhand belongs in the reader but no false raag heading is added.

**N4 — Complete Rehras and Ardas.** Assemble one ordered composite by named practice edition, separately documenting other community variants and the official Ardas; no duplicate or silently omitted portions.

**N5 — Finished Nitnem editorial review.** Qualified reviewers check original Unicode, meaning, Punjabi naturalness, historical/raag/source context and appropriate pronunciation. The user can read every bani continuously, change explanation depth, listen separately and keep independently saved positions; then mark that particular Nitnem edition complete.

**N6 — Sukhmani Sahib next.** Source SGGS Ang 262–296, segment by astpadi/salok, reuse generic reader and SGGS concept links. Long-term Sri Guru Granth Sahib Ji becomes a verified corpus browser, not another 1,430 hand-built page templates.

## Creator and reviewer gates

One reviewer may cover several specialties but each approval names its discipline: original Gurmukhi/collation, Punjabi meaning, Sikh exegesis, santhiya/pronunciation, raag and licensing. Founder cultural/design acceptance is distinct from any qualified religious seal. App always labels drafts honestly.

**Open existing finding:** Pauri 13 line 1 independent digital-source comparison, not a permission to change the frozen source. No Jaap or Rehras copy may be imported from a random modern website based only on convenience or language fluency.

**Immediate Work packets:** (1) source-check Kirtan Sohila with no media and build one generic-reader parity candidate; (2) continue content-depth Mool+Pauri 1–2 review, then Pauri 3–7; (3) keep the new Psychology Room as a separately reviewed optional lens, never embedded as if scripture itself were teaching psychometrics.
