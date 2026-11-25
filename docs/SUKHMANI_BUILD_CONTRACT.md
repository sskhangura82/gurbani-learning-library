# Sukhmani Sahib expansion — build contract (draft)
Date: 2026-11-23
Status updated 2026-11-24 (Pacific): The first-twelve public preview was published through PR #34. The continuation reaches Ashtpadi 18; see `SUKHMANI_FIRST_EIGHTEEN.md` for scope, source comparison, tests and remaining review. This is not a claim of a complete 24-Ashtpadi release or qualified human approval.

## Goal
Add Sukhmani Sahib to the **existing** Gurbani Learning Library alongside Japji Sahib, never as a second separate app. Do not modify production content merely to announce completion.

## Structure and data
- Complete Sukhmani Sahib by Guru Arjan Dev Ji, Sri Guru Granth Sahib Ji Ang 262–296, with 24 Ashtpadis and introductory Saloks in scriptural order.
- Store immutable, occurrence-keyed original Unicode Gurmukhi separately from interpretations. Every entry has Ang, section, sequence, source edition/corpus, exact hash, and collation status.
- Independently collate original text (including punctuation, spellings, and boundaries) against a reliable SGGS source and record discrepancies; no fabricated scripture lines or silent corrections.
- Three layers: **Read** original; **Understand** concise original Punjabi and English editorial drafts; **Study** detailed vocabulary, grammar, traditional interpretation, variant scholarly readings, context, reflection. Drafts must carry visible review status.
- Transliteration, if offered, is approximated and must not purport to be certified santhiya.

## Reader experience
- Ashtpadi 1–24 navigation, uninterrupted reading, resume/bookmark, font controls, accessible contrast and screen-reader order.
- Optional silent guide only; never claim audio synchronization or generate synthetic recitation.
- Keep learning entirely in existing browser-local data and preserve Japji bookmarks/reflections; explicit export/import and upgrade checks.
- Home entry shown only after a functional preview is verified. Support mobile Safari, offline shell, keyboard and VoiceOver, reduced motion.
- Source, meaning, and user-state modules remain separate. Avoid copying third-party copyrighted translations/recordings.

## Scholarly study paths
- Ashtpadi 7: Saadh and Saadh Sangat.
- Ashtpadi 8: Brahm Gyani, with attention to metaphor and spiritual realization.
- Ashtpadi 13: Sant Ninda with care that criticism and accountability are not incorrectly prohibited.
- Ashtpadi 23: vision of the Divine and Hukam.
- Historical topic: Baba Sri Chand Ji and Udasi traditions as **labeled historical interpretation**; not assert that Sukhmani Sahib names him or that the traditional Ashtpadi 17 encounter is proved.
- Exact Ang/line links and enclosing context for every connection.

## Acceptance gates
1. Full source package and provenance with mechanically enforced source hash/occurrence count; independent human Gurmukhi collation documented.
2. Feature PR with safe route, no broken links, section navigation, accessible rendering, mobile regression and screenshots.
3. Offline/service-worker integrity and persistence regression: R6/R7 local learning survives upgrade, reload and rollback.
4. Interpretations clearly marked AI-assisted draft until qualified human review; ensure review count distinct from scripture coverage.
5. Test on physical iPhone Safari and explain limits; no deployment/merge without explicit release review.

## Existing release context
The older R7 candidate document was superseded by `docs/R7_RELEASE_AND_ROLLBACK.md`: R7 was published on 2026-10-23. The subsequent first-twelve Sukhmani preview was published on 2026-11-24 at `39e2c410f0ef942bd611ba4de1a2d3b2d9ad1355`, with successful GitHub Pages deployment.

The owner explicitly requested a usable, fully set-up, shareable application while material is still being added. That authorization led to the first-twelve preview release review in PR #34 and carries forward to this continuation. Partial content and AI-assisted teaching remain labeled; final acceptance goals above, especially qualified human collation and physical-device review, are not marked complete. Each preview increment requires an evidence-based technical release review before publishing to the same app. Other Nitnem development branches remain intact.

References: README.md; docs/TEACHING_EXPANSION_ARCHITECTURE.md; docs/R7_RELEASE_CANDIDATE.md.
