# Full Nitnem V14 — Jaap Sahib Chhands 76–90

Date: October 28, 2026.
Source branch: `feature/glp-jaap-76-90-20261028`.
Status: tested candidate; private deployment not yet activated.

## Reconciled starting point

The resumed live reader was already V13, not V12. Its exact course matched the saved source, and feature-branch receipt commit `889f329f1a61ef5e3eda386a5bd3f7edade976e9` matched origin. V13's 61–75 batch was preserved, not rewritten or counted again.

## New teaching

V14 adds 60 original English/Punjabi educational line explanations and 15 deeper Study drafts for Jaap Sahib Chhands 76–90. All fifteen source units contain four stored line records. The Rooaal heading at 79 and Madhubhaar heading at 87 remain separate; they receive no extra verse-count credit.

| Coverage | V13 | V14 |
| --- | ---: | ---: |
| Jaap explained source records | 286 / 782 | 346 / 782 |
| Jaap Study lessons | 75 / 199 | 90 / 199 |
| Six additional banis: explained source records | 859 / 1,361 | 919 / 1,361 |
| Six additional banis: Study lessons | 202 / 327 | 217 / 327 |

These totals count covered source occurrences, not unique translations. The previously labelled aggregated Rehras passage contexts remain unchanged. Japji remains separately preserved.

Read, Meaning and Study retain their established format. Each new Study includes bilingual summaries, a close reading, source-present vocabulary, interpretation care, practical reflection and teach-back. Topics include giving, knowing, light, mystery, nurture and mortality; the One and the many; the limits of descriptions and social identities; and dignity beyond status.

## Interpretation and source integrity

The complete source packs, thirteen earlier course files, all 859 earlier explanation objects and all 202 earlier Study objects remain exact. Neither original Gurmukhi nor punctuation, source occurrence identities, review flags or metrical headings were corrected silently.

New comparison references and bounded findings are in `tools/nitnem/jaap-chhands76-90-source-notes.mjs`. Public-domain text witnesses at SriDasam.org were compared with the frozen text. Derivative Bhai Vir Singh commentary notes at Sikh Translations were consulted, with their derivative status explicitly retained. The Mahan Kosh entry for ਬਾਲਾ provides lexical support, not an exact-line adjudication. A separate digital rendering documents the smallness alternative at Chhand 90. The selected higher-than-highest reading is explicitly contrasted with that alternative.

Other provisional choices include threefold honour, movement/order, place versus salutation, bodily adornment, limited self, capacity, experiential or self-revealing light, and the heroic arm image. Their uncertainty remains visible. Attempts to inspect a Rampur Khera PDF image failed, so it was not used as evidence for this increment. No visual PDF inspection is claimed.

All material remains `DRAFT_AI_UNREVIEWED`. Author editorial self-review and separate mechanical tests are not independent scholarly review. This iteration did not obtain independent-model or qualified Sikh/Punjabi approval. The global Jaap source caveat remains open. Anand Pauri 24's six explanation records and Study lesson remain fully withheld.

## Reader preservation and browser evidence

The Light/Dark controller, appearance styles, header markup, embedded Japji appearance integration, learning renderer and scripture assets are byte-identical to the accepted V13 baseline. The active reader changes only its new course path and course SHA. Pace remains 50–200.

A fresh isolated headless Chrome profile loaded the immutable 45-asset V14 package on a loopback-only server. Nineteen checks passed at 390px and 320px widths. All 60 new explanations matched their displayed original text, source hash and both languages. All 15 new Study close readings rendered. Read mode kept teaching out of the scripture flow. The expanded Chhand 90 note exposed its alternatives and pending-review label.

Actual reader controls saved a synthetic reflection and bookmark, set pace to 200, switched Dark, reloaded and switched Light without losing that learning. The header stayed visible when scrolled into the new batch. Anand retained 39 Study lessons and its held section; embedded Japji retained all 385 lines and the shared appearance preference. No application requests left loopback and no runtime exceptions occurred.

This browser test used no existing user profile, real private notes, invitation token or account. It is not physical iPhone/Safari/VoiceOver acceptance. Real offline behavior was not newly tested. Screenshots are local candidate evidence, not proof of live HTTPS delivery.

## Verification

| Test | Result |
| --- | ---: |
| Source, coverage, preservation and real-renderer contract | 14 / 14 |
| Shared appearance controller/integration | 14 / 14 |
| Private worker lifecycle/integrity | 7 / 7 |
| Synthetic private access gateway | 603 / 603 |
| Isolated real Chrome walkthrough | 19 / 19 |
| Original Japji, shared saved-learning and root-worker regressions | PASS |

The V13 and V14 course compilers reproduce the immutable course bytes exactly. The private worker also reproduces without an overwrite exception. Its cache contains 44 assets; the complete separate V14 reader package has 45. The new gateway retains all 532 older extra routes and adds 45, for 577. Authentication implementation is unchanged; the only gateway changes are the exact additional allowlist and invitation redirect.

Course SHA-256: `3a0d15041cccb837b063165ff5acbcdb3345a59616b57fca392c8be0d9f801d9`.

Synthetic gateway fixtures are not a substitute for hashing actual historical snapshot files; staging and live delivery checks are still required before activation.

## Rollback and continuation

Public main and the public/root Japji runtime are not targeted by this update. Private deployment must preserve the existing auth configuration, invitation expiry, tunnel and audience. The V13 snapshot and gateway are the rollback target; do not overwrite them or clear browser learning to upgrade.

After V14, Jaap still has 436 source records and 109 Study lessons to draft. Including the held Anand section, 442 records and 110 lessons remain. The next contiguous batch is Jaap Sahib Chhands 91–105.
