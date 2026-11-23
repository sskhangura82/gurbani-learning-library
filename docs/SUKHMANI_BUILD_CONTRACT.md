# Sukhmani Sahib expansion — build contract (draft)
Date: 2026-11-23
Status: DEVELOPMENT SPECIFICATION ONLY — no source-text acceptance, feature release, or deployment claimed.

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
README and docs/R7_RELEASE_CANDIDATE.md describe R7 as implementation candidate, not certified production. Preserve the current live release until reviewed and deployed deliberately.

References: README.md; docs/TEACHING_EXPANSION_ARCHITECTURE.md; docs/R7_RELEASE_CANDIDATE.md.
