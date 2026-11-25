# Sukhmani Sahib — Ashtpadis 1–12

Date: 2026-11-23 (Pacific)

**Historical checkpoint.** This first-twelve preview was subsequently published on 2026-11-24 through [PR #34](https://github.com/sskhangura82/gurbani-learning-library/pull/34), at main commit `39e2c410f0ef942bd611ba4de1a2d3b2d9ad1355`. Its [Pages deployment succeeded](https://github.com/sskhangura82/gurbani-learning-library/actions/runs/45401847408). This publication supersedes the development-only release status recorded below. The current continuation is documented in [SUKHMANI_FIRST_EIGHTEEN.md](SUKHMANI_FIRST_EIGHTEEN.md); the counts and verification in this historical document describe 1–12 only.

## Current scope

The existing Gurbani Learning Library reader now continues through **Ashtpadi 12 of 24**. This extends the first-six development build frozen at commit `28337270a1f149b96882acf420cf7dcd5c8910ce`. It uses the same `sukhmani.html` route, Read / Meaning / Study modes, appearance, bookmarks, reflections and offline shell.

The original first-six source objects, occurrence IDs, English/Punjabi meanings and study lessons are retained exactly. Their canonical hashes are recorded in `evidence/sukhmani-first-six-baseline.json` and enforced by the content test. This expansion adds content without changing the Sukhmani storage key or record version.

| Material | Added in 7–12 | Total in 1–12 |
| --- | ---: | ---: |
| Ashtpadis | 6 | 12 |
| Introductory Saloks | 6 | 12 |
| Pauris | 48 | 96 |
| Pauri verse lines | 480 | 960 |
| Salok verse lines | 17 | 31 |
| Rahau verse lines | 0 | 2 |
| Original headings and invocation | 12 | 26 |
| Source occurrences, including headings | 509 | 1,019 |
| English/Punjabi explanation pairs | 509 | 1,019 |
| Passage studies | 54 | 109 |
| Ashtpadi overviews and vocabulary sets | 6 | 12 |
| Qualified human-reviewed explanations | 0 | 0 |

**1,019 is a source-occurrence count, not a verse count.** Saloks have different lengths: Ashtpadis 7 and 9 each have four Salok verse lines, while Ashtpadi 8 has three. All original lines are retained.

## The new study sequence

The themes below describe the original educational drafts; they are not added scriptural headings.

| Ashtpadi | Angs | Study focus |
| --- | --- | --- |
| 7 | 271–272 | Saadh and Saadh Sangat: the company of those devoted to the Divine, humility, remembrance and the transformation of conduct. |
| 8 | 272–274 | The Brahm Gyani: detachment, equal regard, patience, service, humility and profound realization of the Divine. |
| 9 | 274–275 | Spiritual identities and practices understood through inward remembrance and conduct; the servant of God and liberation while living. |
| 10 | 275–276 | Countless lives, forms, worlds and modes of worship; creation cannot exhaust the Creator. |
| 11 | 276–278 | Divine agency, Hukam and grace through changing conditions; the final passage returns to spiritual union. |
| 12 | 278–279 | Pride, humility, contentment and dependence on the Divine; the concluding praise of the Creator and creation. |

The first-six themes and the original implementation checkpoint remain documented in [SUKHMANI_FIRST_SIX.md](SUKHMANI_FIRST_SIX.md).

## Source preservation and digital comparison

The source remains [Open Granth / Shabad OS at commit 34d2a7cab032c8ea24d21ff20f64653bd03766f4](https://github.com/opengranth/open-granth/tree/34d2a7cab032c8ea24d21ff20f64653bd03766f4). Its provenance attributes the Gurmukhi asset to SSA2 / Shabadaarth / SGPC. The project imports only ancient Gurmukhi, the source references and the already retained approximate transliteration tool. Modern translations present in upstream Markdown files are excluded.

The expanded source spans **Ang 262–279**. The new segment starts with the Salok before Ashtpadi 7, immediately after the prior endpoint `ਨਾਨਕ ਇਨ ਕੈ ਕਛੂ ਨ ਹਾਥ ॥੮॥੬॥`, and ends exactly at:

`ਨਾਮੁ ਜਪੈ ਨਾਨਕ ਮਨਿ ਪ੍ਰੀਤਿ ॥੮॥੧੨॥`

Each occurrence retains its Ang, upstream record, stable ID, sequence and exact Unicode hash. The entire 1–12 Gurmukhi sequence, joined by single newlines, has SHA-256:

`5e4a556a4cf30520b7ebc76e228429dfb9c098527626f72f5c00e2215e935481`

All **509 new occurrences** match a separately retrieved [SriGranth Gurmukhi transcription](https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=271&g=1&h=0&k=0&p=0&r=0&t=0), in text, order and Ang. Combined with the preserved first-six comparison, the total is **1,019/1,019 matches**. HTML-added whitespace is collapsed only in comparison copies. The original source text is unchanged.

Evidence is retained in:

- `evidence/sukhmani-source-collation.json`: full current scope, retrieval URLs and page hashes.
- `evidence/sukhmani-source-collation-7-12.json`: the new segment's comparison report.
- `evidence/sukhmani-srigranth-gurmukhi.json`: the Gurmukhi-only comparison extract.
- `evidence/sukhmani-upstream-manifest.json`: hashes of the pinned upstream files used.
- `evidence/sukhmani-first-six-baseline.json`: the earlier source, meaning and study preservation contract.

The two digital sources may share an underlying editorial lineage. No independent printed-edition comparison or qualified human letter-by-letter approval is claimed.

## Teaching and interpretive boundaries

The new English and modern Punjabi explanations are original AI-assisted educational drafts. They are stored separately from Gurmukhi and attached to exact source IDs and source hashes. Every passage has its own study and primary-source links; selected lexical commentary is attributed where consulted.

The new segment contributes 51 vocabulary entries, giving 101 across the first twelve Ashtpadis. Structural authoring checks are recorded in `evidence/sukhmani-authoring-validation-7-9.json` and `evidence/sukhmani-authoring-validation-10-12.json`. Separate AI editorial reviews record the exact input hashes, passages read and adopted refinements. They are evidence of the review work performed, not qualified human approval.

`evidence/sukhmani-editorial-spot-review-7-12.json` records a separate AI review of all 509 new English meanings, all 54 English passage studies, selected Punjabi meanings/studies and all six bilingual overviews/cautions. Additional focused bilingual reviews are in `evidence/sukhmani-editorial-review-ashtpadi7.json` and `evidence/sukhmani-editorial-review-ashtpadi12.json`.

Ashtpadis 7 and 8 address the user's interest in saintly company and the Brahm Gyani. The draft keeps the strong language of Divine realization and unity in the source, while discussing it alongside humility, equal regard, service and ethical conduct. It does not certify a historical person or a contemporary claimant on the strength of a title, lineage or institution. This addition does not identify Sri Chand Ji as a named referent of these passages.

Religious accounts of rebirth, liberation, grace and Hukam are retained. Interpretive notes distinguish devotional assurances and extraordinary Divine-power language from medical promises or instructions. The text's criticism of pride is not used to assign moral blame to people who are ill, poor or otherwise disadvantaged. Reflections are explicitly educational applications, separate from scripture.

Optional Roman transliteration uses the same pinned tool as the first-six build. It is approximate and does not constitute certified santhiya or recorded recitation. The app's guide remains silent.

## Reader and saved-learning compatibility

Coverage labels, section navigation, the source panel and the final guide message derive from the loaded pack. Twelve navigation targets fit in two rows of six, retaining touch targets on narrow screens. The reader still mounts the complete original sequence once; changing reading depth preserves the source nodes and reading anchor.

The existing `glp001.sukhmani.v1` storage key and version-2 record format remain unchanged. Original first-six IDs continue to resolve. The expanded reader accepts earlier saved records and backups, including preferences, notes and bookmarks. Import merges earlier learning with new Ashtpadi 12 learning while retaining the current reading place. Unknown or future data continues to be preserved rather than overwritten. Japji learning is not part of a Sukhmani export.

Only synthetic notes are used in the tests. No personal reflections are uploaded, committed, or inserted into the static offline cache.

## Verification

The content test now checks full 1–12 coverage and exact preservation of the first-six source objects, meanings and studies. Core and browser regressions exercise old-record resume, earlier-backup import, navigation to Ashtpadi 12, actual rendered Gurmukhi and bilingual teaching, and offline access through the final included passage.

All **87 portable checks passed locally**: 66 existing-reader contracts, nine Sukhmani source/content checks and 12 Sukhmani saved-learning checks. The pinned-upstream script independently matched all 1,019 source occurrences to the retrieved source files. `evidence/sukhmani-first-twelve-build-verification.json` records the commands, counts, runtime hashes and final wording/cache recheck; the browser result is recorded separately.

```sh
node tests/verify.mjs
node tests/service-worker.mjs
node tests/shared-learning.mjs
node tests/r6-contract.mjs
node tests/r7-contract.mjs
node tests/sukhmani-content.mjs
node tests/sukhmani-reader-core.mjs
node tests/sukhmani-browser.mjs
python3 tools/sukhmani/verify-upstream.py
```

Browser checks run in isolated GitHub Actions Chromium contexts. The final observed outcome and downloadable report/screenshots are linked from [PR #34](https://github.com/sskhangura82/gurbani-learning-library/pull/34); the existence of a test file is not a passing result. The local authoring environment cannot launch Chromium, so no local-browser pass is claimed.

Physical iPhone Safari, VoiceOver, Home Screen installation and actual device airplane-mode behavior remain separate acceptance work. Chromium phone-sized viewport checks do not constitute physical-device validation. Qualified Gurbani/Punjabi editorial review remains pending.

## Release status

This continuation remains on `feature/sukhmani-reader-foundation-20261123` in the existing repository and PR. It does not merge other Nitnem development branches, redesign the app, or publish a new public site. The service-worker version must change when runtime assets change, preserving all saved learning and the explicit update flow.

The next unimplemented content is **Ashtpadis 13–24**. Publication still follows the project's [Sukhmani build contract](SUKHMANI_BUILD_CONTRACT.md) and its release-review requirements.
