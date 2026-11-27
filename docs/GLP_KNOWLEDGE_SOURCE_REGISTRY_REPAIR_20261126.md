# GLP-001 — Knowledge pilot source registry repair

Builder candidate, not a qualified review or public release.

Parent: PR #45, 8fa9206d9b4d6e90835972575458853b5d08247a.
Scope: R3-01, R3-02, R3-03, and the passage-title attribution portion of R3-04.
No fourth Salok, new lesson, production reader, storage migration or live deployment.

## Identity and custody

The three existing complete Saloks are identified as:
- sggs.asa-di-vaar.pauri007.salok02 (Guru Angad Dev Ji, Ang 466)
- sggs.asa-di-vaar.pauri014.salok01 (Guru Nanak Dev Ji, Ang 470)
- sggs.kabir.salok007 (Bhagat Kabir Ji, Ang 1364)

The Vaar's structural names distinguish repeated numbered Saloks on the same Ang.
The Pauri 7 closing is verified across Angs 466–467; the Pauri 14 group follows the
closing of Pauri 13. Each verse has a passage-relative logical line identity and
each heading has a separate identity. Edition, file, row and printed line are
locators, not the logical name. Existing pilot IDs have an explicit one-to-one
crosswalk; current reader storage keys and existing reader IDs are unchanged.
This is a provisional structural registry for a three-passage pilot, not an
approved global cross-corpus canon. A future change in segmentation or textual
variant must use a reviewed migration/edition record, not silently reuse IDs.

## Separate source and teaching

knowledge/scripture.json holds the original lines, author and composition
metadata, boundaries, identities, locators and digests. knowledge/source-lock.mjs
pins its exact bytes independently. Every line carries a UTF-8 SHA-256; every
passage has an expected occurrence count and an ordered content/identity digest.
knowledge/pilot.json is now editorial-only and separately pinned by app.mjs.
Lesson and comparison evidence points to passage fingerprints; dictionary senses
point to the exact line fingerprints. If a binding is stale, the pilot refuses
the pack rather than displaying an unreviewed interpretation against changed text.
The renderer derives the original incipit from verified scripture and marks
library topic wording separately. Source text and original lesson bodies are
unchanged. No claim of new scholarly or bilingual review.

A lesson-only re-seal does not change or authorize the independent scripture
pin. A party able to replace both the executable verifier and the source pin
can defeat the checks: this is separated custody and corruption detection, not
cryptographic authentication of an adversary controlling the entire release.

## Source evidence

Pinned Open Granth commit 34d2a7cab032c8ea24d21ff20f64653bd03766f4.
tests/knowledge-source-witness.mjs re-derives the exact selected occurrences,
boundary markers, line numbers, order and individual hashes from four upstream
files. It verifies their Git blob and SHA-256 hashes. The fourth file is the
Ang 467 boundary witness, not a fourth added passage. Raw witness files were
retrieved temporarily and are not included here; no translations were imported.
The test fails if a pinned witness is unavailable. Source rights, named printed
edition and qualified review remain open.

## Builder results

14 existing contracts, 29 new registry contracts (including 15 source mutations
with renewed editorial pins and eight stale/invalid editorial binding cases),
15 actual Chromium browser scenarios, plus 19/19 source rows from four pinned
witness files. Browser tests demonstrate that a re-pinned lesson edit can load
without re-sealing scripture, but a source mutation still refuses all rendering.
Evidence: evidence/knowledge-registry/{contracts,witness}.json and
evidence/knowledge-pilot/report.json. Local desktop browser viewports only;
no physical phone, Safari or VoiceOver acceptance.

Preserved scope: three complete Saloks, 19 original source occurrences including
two headings, six dictionary entries, six concept nodes and two existing lessons.
Search false positives/first-letter conventions, Haumai remedy interpretation,
Punjabi depth/parity, browser history and focus-line navigation remain open.
Existing reader/Hukamnama crosswalk integration and qualified reviewer approval
are not implemented. Do not interpret digital-source comparison as religious
authentication. No merge or deployment authorized. The #40 and #47 reader repair
candidates and original PR #45 remain frozen.
