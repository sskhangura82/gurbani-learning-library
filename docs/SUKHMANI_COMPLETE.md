# Sukhmani Sahib — complete composition, Ashtpadis 1–24

Prepared: 2026-11-24 (Pacific)

## Scope

The existing Gurbani Learning Library now contains the complete Sukhmani Sahib source sequence, **Ashtpadis 1–24, Ang 262–296**, in its continuous `sukhmani.html` reader. Read, Meaning and Study remain three depths of the same reading experience. This release adds Ashtpadis 19–24 to the published first-eighteen pack.

**Complete composition means complete text coverage.** The original English and Punjabi explanations remain visibly labeled AI-assisted educational drafts. Qualified human Gurmukhi collation, Gurbani/Punjabi editorial approval and physical-device acceptance are separate goals and remain pending.

The preceding release was published through [PR #35](https://github.com/sskhangura82/gurbani-learning-library/pull/35), merge commit `a4d40ba51750cd01cda16efce0f389863815d899`. Its [Pages deployment](https://github.com/sskhangura82/gurbani-learning-library/actions/runs/45528890856) succeeded, and its eight principal public files were verified against the tested files. That published release is the preservation and rollback reference for this continuation.

Every published source object, occurrence ID, meaning and study in Ashtpadis 1–18 is preserved exactly. The new canonical baseline in `evidence/sukhmani-first-eighteen-baseline.json` is checked alongside the first-six and first-twelve baselines. The existing Japji runtime is unchanged.

| Material | Added in 19–24 | Complete 1–24 |
| --- | ---: | ---: |
| Ashtpadis | 6 | 24 |
| Introductory Saloks | 6 | 24 |
| Pauris | 48 | 192 |
| Pauri verse lines | 480 | 1,920 |
| Salok verse lines | 12 | 55 |
| Rahau verse lines | 0 | 2 |
| Headings and invocation entries | 12 | 50 |
| Source occurrences, including headings | 504 | 2,027 |
| English/Punjabi explanation pairs | 504 | 2,027 |
| Passage studies | 54 | 217 |
| Ashtpadi overviews | 6 | 24 |
| Qualified human-reviewed explanations | 0 | 0 |

**2,027 counts source occurrences, including headings; it is not a verse count.** Excluding the 50 heading/invocation entries, the source contains 1,977 verse lines in this corpus's segmentation. The Rahau is one two-line passage. Each Ashtpadi contains eight ten-line pauris; introductory Saloks vary in length.

## Final six study themes

These are editorial descriptions, not additional scriptural headings.

| Ashtpadi | Angs | Focus |
| --- | --- | --- |
| 19 | 288–289 | Naam as enduring wealth; remembrance, holy company and living the teaching. |
| 20 | 289–290 | Prayer for Naam, grace, loving devotion and recognition of the Divine's gifts. |
| 21 | 290–292 | The One beyond and within creation; the repeated questions about distinctions before manifested form. |
| 22 | 292–293 | Divine agency, sustenance and the recognition of the One through the Guru. |
| 23 | 293–295 | Transformed perception, the Divine throughout creation, command and the liberating company of devotees. |
| 24 | 295–296 | Attentive listening, remembrance, humility and the composition's concluding teaching. |

## Exact source and closing boundary

Original Gurmukhi remains pinned to [Open Granth / Shabad OS commit 34d2a7cab032c8ea24d21ff20f64653bd03766f4](https://github.com/opengranth/open-granth/tree/34d2a7cab032c8ea24d21ff20f64653bd03766f4). The upstream corpus attributes the Gurmukhi asset to SSA2 / Shabadaarth / SGPC. Modern English translations in upstream Markdown are not imported into the app.

All **504 new occurrences** match separately retrieved SriGranth Gurmukhi in text, order and Ang. With the retained earlier comparisons, the complete pack has **2,027/2,027 digital matches**. Each source record retains its exact Unicode hash, occurrence ID, Ang and upstream line/record identifiers. The complete Gurmukhi sequence, joined with single newlines, has SHA-256:

`bcfceeff3d9baf79bdf9db8466ccaee8d7bcad109ab4e3af9d94f425074768fa`

The opening remains `ਗਉੜੀ ਸੁਖਮਨੀ ਮਃ ੫ ॥` on Ang 262. The final included line is:

`ਨਾਨਕ ਇਹ ਗੁਣਿ ਨਾਮੁ ਸੁਖਮਨੀ ॥੮॥੨੪॥`

Its stable ID is `sukhmani.a24.p08.l10`, Ang 296. The next record is `ਥਿਤੀ ਗਉੜੀ ਮਹਲਾ ੫ ॥`, the heading of the following composition. It is excluded. Both digital sources agree on this adjacency; no additional Sukhmani closing Salok occurs between these records. See `evidence/sukhmani-composition-boundary.json` and the [primary Ang 296 text](https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=296&g=1&h=0&k=0&p=0&r=0&t=0).

The 19–24 and combined source-collation reports, Gurmukhi-only comparison extract, upstream manifest and source-verification receipt are retained in `evidence/`. Only HTML-added spacing is collapsed in the comparison copy; the source scripture is not normalized or rewritten. Two separately retrieved digital transcriptions do not establish independent printed-edition lineage. Qualified human letter-by-letter collation remains pending.

## Teaching and interpretation

English and Punjabi meanings, vocabulary, grammar notes, overviews, passage explanations and reflections are original educational drafts. Scripture and interpretation remain separate data layers. Each study encloses its complete original passage and links to its Angs; scholarly commentary is attributed when an interpretive construction is followed. Reflection prompts are explicitly applications rather than scripture.

The final sections retain Gurbani's claims about liberation, birth and death, Divine agency, grace and remembrance. The discussion of creation and *sunn samaadhi* is theological exposition; it does not identify the passage with a modern physical model. Spiritual imagery of illumination, unstruck sound, medicine and treasure is explained in context. The meanings retain the images, while explanatory notes distinguish their devotional application from guaranteed material or medical outcomes.

AI editorial review is documented separately from authorship. The continuation's review receipts identify the passages actually read, the adopted corrections and the final authoring-file hashes. No qualified human scholarly approval is claimed. Existing Ashtpadi 13 Sant Ninda studies and the attributed Ashtpadi 17 Sri Chand tradition note remain unchanged.

Approximate Roman transliteration remains a reading aid. The guide is silent and does not generate or synchronize audio.

## Reader and saved learning

All 24 Ashtpadi navigation links use the existing 44-pixel targets. The reader displays the full source continuously and ends with “End of Sukhmani Sahib.” The home card and static fallback text also describe complete coverage. Day / Amrit Vela appearance, font sizing, resume, bookmarks, reflections and export/import remain available.

The `glp001.sukhmani.v1` storage key and version-2 record format are unchanged. Compatibility scenarios use independently specified, invented records from the first-six, first-twelve and first-eighteen releases. They check both resuming old learning and merging old backups with new Ashtpadi 24 learning, retaining current preferences and place. Unknown or future records remain preserved.

The versioned service worker updates the full static pack through the existing explicit update flow. Personal reflections remain browser-local and are not placed into the static cache. Sukhmani and Japji backups remain separate.

## Verification and publication

The portable checkpoint is recorded in `evidence/sukhmani-complete-build-verification.json`. The continuation pull request records the exact tested commit, browser CI outcome, screenshot review and deployment receipt. Browser evidence is retained in the Actions artifact; test files alone are not evidence of a pass.

Verification covers complete source and teaching coverage; the exact closing boundary; preservation of the first six, twelve and eighteen; all 24 navigation targets; rendered Gurmukhi, meanings and studies; saved learning and imports; mobile and desktop viewports; and genuine service-worker offline reload. The independent pinned-upstream comparison covers all 2,027 original occurrences.

Physical iPhone Safari, VoiceOver, Home Screen installation and actual-device airplane-mode acceptance remain unperformed. Chromium viewport checks do not establish those results.

The owner has requested a fully set-up, publicly shareable app while content grows and has authorized this continuation. After technical release review and successful exact-commit browser CI, this increment is published to the existing app URL. Complete Sukhmani text coverage does not claim completion of the other Nitnem development branches. A rollback must use a fresh cache version and preserve learning attached to the new passages.
