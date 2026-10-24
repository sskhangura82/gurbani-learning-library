# GLP-001 M2 — Deep Japji teaching quality gate and Work handoff

**Prepared:** 2026-10-24. **Status:** Draft / candidate manuscript, not released in the live family application.

## Baseline audit result (mechanical only)

The complete existing R7 source package was inspected directly:

| Structural item | Exact result |
|---|---:|
| Original Gurmukhi occurrences with correct SHA-256 source anchors | **385** |
| Bilingual short-meaning draft objects | **385** |
| Study lesson draft objects | **42** |
| Study objects with all required structural fields and matched source anchors | **42** |
| Discovered source-ID/hash/meaning-reference structural defects | **0** |
| Lesson draft objects bearing qualified human-review approval | **0** |

The mechanically complete 42 entries are valuable *seeds*. The test does **not** certify accuracy, scholarship, Punjabi style, pronunciation, spiritual interpretation or completeness. All 42 records need an editorial triage (KEEP / DEEPEN / REWRITE / RETIRE) based on substantive review, not a mechanical character-count score. No scripture, short meanings, Studio runtime or family learning data was modified.

## The first two editorial exemplars

`M2_PAURI_01_02_DEEP_LESSON_EXEMPLARS.md` offers **twelve original occurrence-based close readings** spanning Pauri 1 and 2, with one unifying concept per pauri, concise English and Punjabi drafts, working vocabulary, attributed disagreements, canonical narrative continuity, connections, application labeled as commentary, and teach-back prompts.

- Pauri 1: question **ਕਿਵ ਸਚਿਆਰਾ ਹੋਈਐ**, its relation to four insufficiencies, and **ਹੁਕਮਿ ਰਜਾਈ ਚਲਣਾ** as a way of life. Scholarly ambiguity for **ਸੋਚੈ** is exposed (Sahib Singh's purification grammar vs English thinking reading); one route is not silently declared universal.
- Pauri 2: Hukam's breadth and the distinction between being within Hukam and understanding it, with the ethical caution not to use the text to justify another person's suffering. Candidate connections to the *enclosing* haumai saloks on Ang 466 are clearly labeled.
- These drafts are not final Sikh exegesis; a qualified editor may change, challenge or reject them. The exact Gurmukhi source remains exclusively in `js/japji-full-data.js`.

## Two distinct review certificates

### Source-bound machine certificate (now)

- Auditor: `node tests/m2-editorial-audit.mjs`.
- Exemplar binding check: `node tests/m2-exemplar-integrity.mjs`.
- Artifact: `M2_EXEMPLAR_SOURCE_BINDINGS.json` with all 12 immutable occurrence hashes and frozen-file SHA-256. These tests check source identity and the presence of the nine teaching movements—not whether an interpretation is correct.
- No user notes, recordings, video credentials or private annotations enter these checks.

### Qualified human review (future, separately arranged)

For each teaching unit, a designated qualified reviewer is asked to supply:

| Dimension | Pass / comments / block |
|---|---|
| Exact original Gurmukhi and contextual segmentation | Pending |
| Punjabi idiom, grammar and comprehensibility | Pending |
| English close meaning versus commentary clear | Pending |
| Vocabulary forms, contested word readings and proper attributions | Pending |
| Historical/literary/philosophical claims supported by named sources | Pending |
| Connected teaching includes complete shabad/salok context and author/Ang | Pending |
| Pronunciation aid (if any) scoped to santhiya expertise | Pending |
| Application, analogy and reflection *not claimed to be scripture* | Pending |
| Approve exact content SHA and reviewer-role attestation | Pending |

Human reviewer identity/role, specific artifact checksum, date and scoped verdict must be recorded **privately when personally identifying**. A final public registry may contain an agreed attribution without exposing private contact details.

The founder's acceptance that a lesson captures the desired teaching experience is a separate product decision, never labeled as theological qualification by default. A fluent Punjabi speaker may review language but not automatically certify every religious or music claim.

## Integration specification for Work AFTER review

- Build a source-bound `lessons/v2/<pauri>.json` teaching layer from approved manuscripts, preserving canonical `sourceId`, original source SHA and review record.
- Allow Read→Understand→Study at the same original tuk; do not rebuild a separate lesson app or alter original text. Deep content may open in a modal or reader-side view while position is preserved.
- Keep original 385 concise meaning drafts/42 Study drafts unchanged until the new layer is independently reviewed and a migration/replacement decision is explicit.
- Each published deep explanation must label whether it is `draft`, `source_checked`, `qualified_human_reviewed`, or `founder_product_accepted` in *separate fields*. A lesson may have some but not all.
- Preserve the entire bibliography with claim-level connections. If a source is a translation, don't copy modern translation paragraphs without rights; write original commentary with citation.
- Select the next concept cluster only after evaluating the two exemplars in a small family teach-back test (not an engagement score). The clusters may include Pauri 1–2/Hukam, Suniai 8–11, Mannai 12–15 and Panj Khand 34–37.
- Pauri 13 line 1 independent text comparison remains **OPEN** for qualified collation. Do not modify its source bytes in a lesson UI revision.

**Promotion boundary:** This is a GitHub candidate review packet. No change to the live family reader, no claim of human approval, and no founder release word inferred.
