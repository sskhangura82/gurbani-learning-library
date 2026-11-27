# GLP-001 — Generic composition contract and reader parity proof v0.1

**2026-10-24 · Nonshipping technical prototype.** This is engineering progress toward full Nitnem, **not** a second implemented bani, not a production renderer swap and not an invitation to import unverified text.

## Why this work exists

Japji Sahib now has complete original Gurmukhi reading across **385 immutable occurrences in 42 units**, plus draft explanatory layers, inside one app. The founder wants the same reader to handle all Nitnem and eventually Sri Guru Granth Sahib Ji. The risky engineering path is copying one full HTML reader per bani; the safer path is **edition- and source-aware data** rendered by one shared component while retaining the proven R7 reader until parity is demonstrable.

This work creates `tools/compositions/composition-core.mjs` (pure JavaScript, no HTTP/UI dependency) plus a **24-assertion automated parity suite**. It adapts the **existing frozen R7 Japji data in memory** to a generic model; it also constructs a clearly labelled **synthetic English two-shabad fixture** to test different stanza structures without fabricating Gurbani.

**No new Gurbani has been transcribed or copied; Kirtan Sohila is not imported.** The test renderer is a proof of data compatibility, not a deployable second reader.

## Main invariants

- `compositionId` and `editionId` are distinct stable identifiers; a source edition is never guessed from a title alone.
- `sourceFamily` distinguishes `sggs`, `dasam`, `composite`, `ardas` and `synthetic_test`; `locationScheme` cannot pretend that a Dasam Bani line has a Sri Guru Granth Sahib Ji Ang number.
- Every **original Unicode line** retains its exact source ID, SHA-256 and original Ang (if appropriate), in original order. A single matra change, reordered text, duplicate ID, invented Ang or missing Japji line fails source parity.
- Printed raag headings are source metadata, **never mood/music added by our interface**. Japji receives no invented raag. A new raag heading needs exact printed evidence; the synthetic fixture's heading is visibly TEST ONLY, never used publicly.
- Existing Japji reader is **grandfathered only as a pre-existing accepted machine-verified source edition**, without representing 385 draft explanations as qualified human-approved. Future second-bani publication requires a named edition, independent text collation, source rights and appropriate qualified reviewer. No “available reader” for a bani with status `not_ingested`.
- The generic editor layers (simple English/Punjabi, deep Study, related passages, musical metadata and media timing) are separate future structured records. The core prototype renders **original source text only** and does not change any active explanations.
- Learning namespaces are composition-and-edition-specific; **no migration** of old Japji browser-local reflections or bookmarks occurs inside this prototype. Existing saved data must be explicitly preserved with separate future upgrade tests.
- The proof renderer escapes source strings rather than injecting untrusted HTML. It uses `lang="pa"` for actual Gurmukhi and `lang="en"` in its synthetic fixture.

## Automated evidence

`node tests/composition-parity.mjs` covers **24 assertions**:

1. Original 42/385 unit counts and exact source bytes, Ang and hash.
2. Full 385 IDs in original order through a generic renderer outline.
3. Reject a single altered matra, altered SHA, duplicate or missing occurrence and invalid SGGS Ang.
4. Reject a fabricated Japji raag or a raag heading without source metadata.
5. Admit a **fake nonreligious two-shabad structure only in internal synthetic mode**; reject its public display and restrict sample text to clearly marked TEST ONLY.
6. Reject a second bani without source edition and second-source collation.
7. Reject Dasam Bani given a fictitious SGGS location.
8. Prove original Gurmukhi can share an algorithm with different stanza units without copying page components.
9. Confirm safe HTML escaping and composition-scoped learning namespaces, with no media, localStorage or external requests.

Existing R7 suites also remain required: 27 immutable/source/learning checks, eight service-worker, twelve shared learning, seven R6 and twelve R7.

## Integration and next Work order: N1 Kirtan Sohila (source-first)

**Phase N1-A — verified source intake, not UI redesign.** A designated source owner researches five Kirtan Sohila shabads in Sri Guru Granth Sahib Ji **Angs 12–13**, exact Gurmukhi Unicode, author/raag headings, title/stanza boundaries, independent comparator and edition/reference licensing. Review original collation before creating `composition/kirtan-sohila/<edition>.json`. If the source has a mismatch or unsupported stanza, stop and record it—not AI-repair the scripture.

**Phase N1-B — generic reader parity in a new branch.** Only after N1-A passes, feed the verified composition record to the *existing reader presentation* (Read/Understand/Study architecture, not the crude internal outline), retaining appearance, pace, accessibility, bookmark/note isolation, offline shell, link semantics and source review labels. Compare **Japji parity** byte-for-byte/visual against accepted R7 before a new bani goes public. Kirtan Sohila must not automatically inherit Japji’s 385 meanings or 42 Study drafts.

**Phase N1-C — physical iPhone and editorial review.** Verify the original shabads, raag metadata, Punjabi/English simple meanings and deep study through qualified human review, 320/390 CSS px, Safari Home Screen/VoiceOver, reduced motion, export/import and actual offline behavior. Publish only after usual independent creative/evidence and founder release gates.

**Phase N2+** can generalize Anand Sahib, exact Dasam Bani compositions and composite Rehras/Ardas with named source/version choices. Never assign a fictitious “SGGS Ang” to a text that comes from another corpus. The source/rights ledger distinguishes modern copyrighted translations and performances from old original scripture.

## Editorial and governance status

- **Original Japji text:** source bytes mechanically verified; qualified independent Pauri 13 line 1 comparison still OPEN.
- **42 existing Study passages / 385 short meanings:** preserved as drafts, not reviewed by a religious specialist.
- **Kirtan Sohila / other Nitnem:** NO imported source text in this PR, no reader, no claim of completion.
- **Claude:** architecture and quality reviewer; **Work:** future source-gated implementation; **founder:** rights/release and product intent; **qualified Sikh/Punjabi reviewers:** original text, meaning, language and raag.

**Never merge this tool code into the live PWA and replace the proven reader without a full parity certificate.** This PR simply gives Work a tested foundation for the next exercise.
