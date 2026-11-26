# Gurbani Learning Library — GLP-001

**An account-free family reading and learning project.** Read Nitnem and Sukhmani Sahib, with complete Salok Mahalla 9 and Salok Bhagat Kabir Ji development candidates on this branch. Original Gurmukhi, English and Punjabi meanings, and passage Study drafts keep separate source and review records.

[Open the library](https://sskhangura82.github.io/gurbani-learning-library/) · [Open Nitnem](https://sskhangura82.github.io/gurbani-learning-library/nitnem/index.html) · [Read Japji Sahib](https://sskhangura82.github.io/gurbani-learning-library/full-japji.html) · [Read Sukhmani Sahib](https://sskhangura82.github.io/gurbani-learning-library/sukhmani.html)

## Complete Nitnem reading collection

The collection joins the existing complete Japji reader with Jaap Sahib (199 chhands), Tav-Prasad Savaiye (10), Benti Chaupai (the 25-pauri section plus four clearly marked additional pauris), Anand Sahib (all 40 pauris), the documented six-part Rehras selection, and Kirtan Sohila (five shabads). The six additional readers contain 1,361 source records, 1,361 English/Punjabi meaning pairs and 327 passage Study drafts. The restored V16 teaching is preserved except for individually reviewed source-related amendments.

Read, Meaning and Study use the same Gurmukhi. The reader has continuous and passage layouts, a silent visual guide, Light/Dark appearance, adjustable text size, saved positions, bookmarks, reflections and backup import/export. Imports merge learning; old documented edition backups remain compatible. Unknown or damaged saved records are preserved for recovery. The root service worker saves the whole library for offline reading and waits for an explicit action before applying an update.

The line meanings and passage summaries are bilingual. Earlier detailed studies are chiefly in English; the newly completed Jaap 121–199 and Anand Pauri 24 studies also have extended Punjabi fields. Qualified human collation, scholarly teaching review, santhiya and physical iPhone acceptance are still pending. See [Nitnem scope, sources and operation](docs/NITNEM_COMPLETE.md).

## Salok Mahalla 9: complete development candidate

This branch adds all **57 numbered Saloks**, **114 verse occurrences** and **three original headings/invocation occurrences**, Ang 1426–1429. It includes 114 original English/Punjabi line-meaning drafts, 57 bilingual passage-study drafts and three heading explanations. The following Mundavani Mahalla 5 is outside this composition. Salok 29 keeps its two Ang references; Dohra remains before Salok 53.

The additional Bani uses the existing shared composition reader, its navigation, Read/Meaning/Study, appearance settings and browser-local learning. Its source manifest, teaching pack and storage identity are separate from Nitnem. Existing Nitnem source/teaching files and Japji/Sukhmani learning remain unchanged. The original text agrees exactly with a second digital transcription across all 117 occurrences; qualified collation and teaching review remain pending.

This is a **draft review branch**, not a published update or a completed scholarly edition. The phone QA site still tests the separately frozen PR #40 repairs. See [Salok Mahalla 9 scope and review record](docs/SALOK_MAHALLA9_COMPLETE_DRAFT.md).

## Salok Bhagat Kabir Ji: complete collection development candidate

This continuation adds the complete **243 numbered Saloks**, **486 verse occurrences** and **eight headings/invocation occurrences** of the Kabir Salok collection, with separate bilingual educational drafts. Six original Mahalla headings remain visible and retain their immediate scope. This collection is distinct from Kabir’s Bani across the Raags and from the following Farid collection.

The source selection, one alternate heading, one unresolved digital encoding difference, a foreign Farid occurrence and printed-page spot checks have explicit research records. **493 of 494 runtime original entries match the second digital transcription exactly.** Qualified human collation, Punjabi and teaching review remain pending. See [Kabir collection scope, sources and review](docs/SALOK_KABIR_COMPLETE_DRAFT.md). This is a stacked development draft; it does not update the production or phone-QA site.

## Sukhmani Sahib: all 24 Ashtpadis

The existing `sukhmani.html` reader now contains the complete Sukhmani Sahib: all 24 introductory Saloks, 192 pauris and the Rahau, across Ang 262–296. Its 2,027 original source occurrences (including headings) are compared with a second digital transcription. English/Punjabi line explanations, 217 passage studies and approximate transliteration remain clearly labeled educational drafts. Read, Meaning and Study share the same continuous Gurmukhi, with separate browser-local Sukhmani bookmarks, reflections and backups.

See [complete scope, sources and review status](docs/SUKHMANI_COMPLETE.md). The preceding first-eighteen preview was published through PR #35. This continuation completes Sukhmani text coverage under the user's request for a usable, shareable app. Qualified human review and physical-device acceptance remain outstanding. Every published first-eighteen source object, meaning and study is preserved, as are the existing Japji runtime and learning.

## Existing reader and other features

- A simple, calming **home page** (Nitnem/Japji, Visit a Gurdwara, Simran Room).
- Japji Sahib 38 Pauris plus Mool Mantar and Saloks, continuous Unicode Gurmukhi across all 385 source occurrences.
- 385 English/Punjabi educational drafts and 42 Study drafts, **none qualified human-approved**.
- Optional *silent* guided reading light. Numeric pace 50–160 illustrative tokens/min, adjustable in five-token steps. This does **not** play or synchronize to external audio.
- Day and Amrit Vela reading environments, bookmarks, reflections stored locally, export/import and an installable offline shell.
- Three Gurdwara arrival pages with verified institution summaries, IANA local time and official outgoing broadcast links. No unlicensed photos or misleading 'live now' statuses.
- Distinct Simran Room **silent preview** without AI voices, breath-control prescriptions, streaks or metrics. Religious instructional material remains pending qualified review.

## Source of truth and editorial boundaries

The scripture, lessons, connections, musical metadata and saved learning are separate structures. Never change Gurmukhi to conform to a translation or UI. Every source record is checked against its stored hash. Japji and Sukhmani retain their documented Open Granth/Shabad OS witnesses; Nitnem uses the separately documented SGGS and Dasam witnesses in its source audit. Source corrections require evidence and an explicit amendment record. Qualified letter-by-letter collation, including Japji Pauri 13 line 1, is still needed. Study drafts do not imply formal Sikh scholarly endorsement.

Private reflections are **not uploaded** or committed to GitHub. The public Pages URL is available to anyone who knows it; noindex is not authentication.

## How to test locally

From the repository root, serve static files on localhost (for example, `python3 -m http.server 8080 --bind 127.0.0.1`) and open `http://127.0.0.1:8080/`. Production uses GitHub Pages.

Portable Node regression tests:

```sh
node tests/verify.mjs
node tests/service-worker.mjs
node tests/shared-learning.mjs
node tests/r6-contract.mjs
node tests/r7-contract.mjs
node tests/sukhmani-content.mjs
node tests/sukhmani-reader-core.mjs
node tests/nitnem-content.mjs
node tests/nitnem-learning.mjs
node tests/nitnem-backup-capacity.mjs
node tests/nitnem-ui-lifecycle.mjs
node tests/salok-mahalla9-content.mjs
node tests/salok-mahalla9-bindings.mjs
node tests/salok-kabir-content.mjs
node tests/salok-kabir-bindings.mjs
```

Chromium acceptance tests cover Sukhmani, Nitnem, Salok Mahalla 9 and Salok Bhagat Kabir Ji in their respective browser test files, alongside the source-integrity and retained-learning repair checks. They use disposable localhost contexts and made-up learning records. The quality-gate workflows install pinned Playwright and Gurmukhi fonts and retain reports and screenshots. Older Mac Chrome lifecycle harnesses remain in `tests/r7-*.mjs`.

After changing a cached static asset, regenerate the exact offline hashes with `node tools/build-offline.mjs` before testing the service worker.

## Project direction

The complete Salok Mahalla 9 reader and the complete Salok Bhagat Kabir Ji collection are development candidates. The next content sequence is Bhagat Kabir Ji’s remaining Bani across the Raags, then Bhagat Farid Ji and the wider Sri Guru Granth Sahib Ji library. Qualified review, deeper teaching, authentic audio and Punjabi review remain separate workstreams. See [Teaching architecture](docs/TEACHING_EXPANSION_ARCHITECTURE.md), [R7 scope/source register](docs/R7_HOME_SPEED_AND_SPACES.md) and [release candidate evidence](docs/R7_RELEASE_CANDIDATE.md).

**The unmerged concept PR #4 remains a separate design/research lane.** No unauthorized photograph, media extraction, synthetic recitation, credentials, advertising or personal learning data belongs in this repository.
