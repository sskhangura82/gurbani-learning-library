# Sukhmani Sahib — Ashtpadis 1–18

> Historical milestone: this first-eighteen preview was published through [PR #35](https://github.com/sskhangura82/gurbani-learning-library/pull/35), commit `a4d40ba51750cd01cda16efce0f389863815d899`, with successful Pages deployment and exact public-file verification. The current continuation completes the composition; see [SUKHMANI_COMPLETE.md](SUKHMANI_COMPLETE.md).

Prepared: 2026-11-24 (Pacific)

## Scope of this continuation

The existing Gurbani Learning Library continues from its published first-twelve preview through **Ashtpadi 18 of 24**, across **Ang 262–288**. The same `sukhmani.html` reader provides uninterrupted Read, Meaning and Study modes. This is an expansion of the existing app and its public preview, with the remaining six Ashtpadis still to be added.

The preceding public release is main commit `39e2c410f0ef942bd611ba4de1a2d3b2d9ad1355`, merged through [PR #34](https://github.com/sskhangura82/gurbani-learning-library/pull/34). Its [GitHub Pages deployment](https://github.com/sskhangura82/gurbani-learning-library/actions/runs/45401847408) completed successfully on 2026-11-24. This supersedes the development-only status in the historical first-twelve notes.

Every previously published first-twelve source object, occurrence ID, meaning and study is retained exactly. Canonical hashes in `evidence/sukhmani-first-twelve-baseline.json` are checked mechanically alongside the original first-six preservation baseline. Existing Japji content and saved learning remain separate.

| Material | Added in 13–18 | Total in 1–18 |
| --- | ---: | ---: |
| Ashtpadis | 6 | 18 |
| Introductory Saloks | 6 | 18 |
| Pauris | 48 | 144 |
| Pauri verse lines | 480 | 1,440 |
| Salok verse lines | 12 | 43 |
| Rahau verse lines | 0 | 2 |
| Original headings and invocation | 12 | 38 |
| Source occurrences, including headings | 504 | 1,523 |
| English/Punjabi explanation pairs | 504 | 1,523 |
| Passage studies | 54 | 163 |
| Ashtpadi overviews | 6 | 18 |
| Vocabulary entries | 59 | 160 |
| Qualified human-reviewed explanations | 0 | 0 |

**1,523 is a count of source occurrences, including headings, not a verse count.** There are 1,485 verse lines excluding the 38 headings and invocation entries. The six newly added Saloks each contain two verse lines; earlier Saloks of different lengths are preserved.

## Study sequence

These descriptions are editorial study themes, not additional scriptural headings.

| Ashtpadi | Angs | Study focus |
| --- | --- | --- |
| 13 | 279–281 | Sant Ninda: slander, its spiritual consequences, grace and the possibility of restoration. |
| 14 | 281–282 | Trust in the Divine, remembrance, truthful conduct and freedom from attachment. |
| 15 | 282–283 | Divine agency through changing conditions; contentment, humility and liberation. |
| 16 | 283–285 | The Creator's sustaining presence, Naam and the limits of human description. |
| 17 | 285–286 | Enduring Truth, the Guru's teaching and the transformation of spiritual understanding. |
| 18 | 286–288 | Guru and disciple, remembrance, guidance and the gift of Naam. |

## Source fidelity

The original Gurmukhi remains pinned to [Open Granth / Shabad OS commit 34d2a7cab032c8ea24d21ff20f64653bd03766f4](https://github.com/opengranth/open-granth/tree/34d2a7cab032c8ea24d21ff20f64653bd03766f4). The corpus attributes its Gurmukhi asset to SSA2 / Shabadaarth / SGPC. Modern English translations supplied in upstream files are excluded from the app.

The new segment begins with the Salok before Ashtpadi 13, immediately following `ਨਾਮੁ ਜਪੈ ਨਾਨਕ ਮਨਿ ਪ੍ਰੀਤਿ ॥੮॥੧੨॥`, and ends at Ang 288 with:

`ਅਨਿਕ ਬਾਰ ਨਾਨਕ ਬਲਿਹਾਰੀ ॥੮॥੧੮॥`

The complete 1–18 Gurmukhi sequence, joined by single newlines, has SHA-256:

`159f53f611e550b1996305d2f2a87e610e5375bfc5eca254dbd12dbfd7b7cda8`

Each new entry retains its Ang, upstream record, sequence, stable occurrence ID and exact Unicode hash. All **504 new occurrences** match a separately retrieved [SriGranth Gurmukhi transcription](https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=279&g=1&h=0&k=0&p=0&r=0&t=0) in text, order and Ang. Together with the retained first-twelve comparison, this gives **1,523/1,523 digital matches**. Only HTML-added spacing is collapsed in the comparison copy; source scripture is not altered.

Evidence is retained in the overall and 13–18 source-collation reports, the Gurmukhi-only SriGranth extract, the upstream manifest and `evidence/sukhmani-upstream-verification-13-18.json`.

Separate digital retrieval does not prove independent printed-edition lineage. Qualified human letter-by-letter collation remains pending.

## Teaching boundaries

English and Punjabi meanings, vocabulary, contextual explanation and personal reflections are original AI-assisted educational drafts. They remain visibly identified as such. Each passage study encloses the complete source passage and links to its exact Angs; consulted commentary is attributed separately. No qualified human approval is claimed.

Independent AI editorial review covers all 504 new bilingual meaning pairs, all 54 bilingual passage studies and all six overviews with their vocabulary, teach-back prompts and cautions. Its actual scope, adopted wording and grammatical refinements, and frozen authoring-file hashes are recorded in `evidence/sukhmani-editorial-review-13-15.json`, `evidence/sukhmani-editorial-review-16-18.json` and the separate Ashtpadi 15 overview receipt. This is a record of AI review, not scholarly certification.

Ashtpadi 13 retains the text's strong warnings about slander, spiritual estrangement, rebirth and judgment, together with its repeated possibility of grace and restoration. Its study distinguishes malicious denigration from truthful reporting, careful questions and accountability. The passage does not establish that someone is a saint merely because they hold a title. Its language is not used to diagnose illness, assign blame to people in hardship or threaten those who raise concerns.

Ashtpadi 17 preserves the exact Gurmukhi of its opening Salok, including the spelling `ਭਿ`, with a reading note specific to Ang 285. Its brief historical note attributes the Sri Chand/Guru Nanak Salok account to Gurbachan Singh Talib's Punjabi University encyclopedia entry and identifies it as a traditional account. The note is separate from the words of Guru Granth Sahib Ji; the text on Ang 285 does not itself narrate a meeting or name Sri Chand Ji. No contemporary historical proof or certification of a person's spiritual status is claimed.

Reflections are explicitly educational applications, separate from Gurbani. Transliteration remains an approximate reading aid. The guide is silent and no synthesized recitation is provided.

## Reader and saved learning

Eighteen navigation targets fit in three rows of six, with the existing 44-pixel touch targets. The complete original sequence stays mounted as reading depth changes. The existing Day / Amrit Vela appearance, type-size controls, resume, bookmarks, private reflections, export/import and offline shell are retained.

The `glp001.sukhmani.v1` storage key and version-2 record format are unchanged. Compatibility scenarios include both earlier first-six records and the published first-twelve format, using invented test notes only. Earlier backups merge with new Ashtpadi 18 learning while keeping the current reading place and preferences. Unknown or future records continue to be preserved rather than overwritten.

An explicit service-worker update supplies the larger static reading pack. It does not upload or cache personal reflections. Japji learning is not included in a Sukhmani export.

## Verification and release review

The exact verification outcome is recorded in `evidence/sukhmani-first-eighteen-build-verification.json` and the continuation pull request. Test files alone are not evidence of a pass. Browser reports and screenshots are retained as GitHub Actions artifacts for the tested commit.

All **88 portable checks passed locally**: 66 existing-reader contracts, ten Sukhmani source/content checks and twelve saved-learning checks. The pinned-upstream comparison independently matched all 1,523 occurrences to the retained upstream files. Browser verification is recorded separately for the exact candidate commit.

Verification covers source and teaching coverage; exact preservation of the first six and twelve; navigation through Ashtpadi 18; real rendered Gurmukhi and bilingual study; saved-learning resume and imports; narrow and desktop layouts; and service-worker offline reload. The portable test commands remain listed in the README.

Physical iPhone Safari, VoiceOver, Home Screen installation and actual-device airplane-mode acceptance remain unperformed. Chromium viewport checks are not physical-device acceptance. Qualified Gurbani/Punjabi editorial review remains pending, with its count distinct from digital source coverage and automated checks.

The user has requested a usable, publicly shareable app while content continues to grow. This increment follows that authorization as a clearly labeled public preview on the existing URL after its technical release review. The full-composition and qualified-review acceptance goals in the build contract remain outstanding. The previous published first-twelve commit is the rollback reference; a rollback must use a fresh service-worker version and preserve any learning attached to later passages.

The next unimplemented content is **Ashtpadis 19–24**.
