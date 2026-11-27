# Salok Mahalla 9 — complete reading and teaching draft

GLP-001 · 26 November 2026 · Development candidate; not a production release

## What this build completes

The prior October source-intake branch contained the complete source candidate, but had not integrated a Salok Mahalla 9 reader. The unrelated three-Salok knowledge pilot contains passages from Asa Di Vaar and Bhagat Kabir Ji; it is not Salok Mahalla 9.

This candidate provides the complete numbered Salok Mahalla 9 sequence in the existing composition reading engine:

| Coverage | This candidate |
| --- | --- |
| Numbered Saloks | 57, consecutively 1–57 |
| Verse occurrences | 114, two per Salok |
| Other original source occurrences | Invocation, collection heading and Dohra heading |
| Total original occurrences | 117 |
| Ang span | 1426–1429 |
| Concise English/Punjabi line explanations | 114 original draft pairs |
| Bilingual passage studies | 57 drafts |
| Heading/invocation explanations | 3 bilingual draft pairs |
| Qualified human collation or editorial approvals | 0 |
| Licensed recordings / certified pronunciation teaching | 0 |

Read, Meaning and Study retain the same Gurmukhi. The user can jump to any Salok, use continuous or single-passage reading, change text size and appearance, save a line, write a private reflection, and export/import learning. The source and teaching can be cached by the existing root service worker in this candidate. The new collection is outside the seven-Bani daily Nitnem order.

“Complete” here describes source-reading coverage and draft teaching coverage. It does not mean qualified scholarly approval, completed comparative studies, authenticated recordings, or physical iPhone acceptance.

## Source custody and composition boundaries

Selected source: [Open Granth commit 34d2a7cab032c8ea24d21ff20f64653bd03766f4](https://github.com/opengranth/open-granth/tree/34d2a7cab032c8ea24d21ff20f64653bd03766f4), `corpus/ang-1426.md` through `ang-1429.md`. Extraction preserves exact Gurmukhi strings. Modern translations and generated transliteration in those upstream files are not imported into the application.

The source-only builder checks each raw witness’s byte length, SHA-256 and Git blob hash before extraction. Its selection is bounded by the invocation immediately before `ਸਲੋਕ ਮਹਲਾ ੯ ॥` and the final `॥੫੭॥੧॥`. The preceding passage and the following `ਮੁੰਦਾਵਣੀ ਮਹਲਾ ੫ ॥` are retained as boundary evidence and excluded from the reading text.

| Ang | Included source occurrences |
| --- | --- |
| 1426 | 20: invocation, collection heading, Saloks 1–9 |
| 1427 | 39: Saloks 10–28 and the first verse of 29 |
| 1428 | 37: the second verse of 29 and Saloks 30–47 |
| 1429 | 21: Saloks 48–57 and Dohra before 53 |

The independent digital comparison checked all 117 selected occurrences against [SriGranth Ang 1426](https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=1426&g=1&h=0&k=0&p=0&r=0&t=0), [1427](https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=1427&g=1&h=0&k=0&p=0&r=0&t=0), [1428](https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=1428&g=1&h=0&k=0&p=0&r=0&t=0) and [1429](https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=1429&g=1&h=0&k=0&p=0&r=0&t=0). All 117 strings and both adjacent boundaries match. This comparison uses independently retrieved web-extracted strings; it is not raw-HTML byte collation, a printed-saroop comparison, or proof of independent textual lineage.

The complete ordered text sequence digest is `16649b80d412b71d628eab27e372208bb74a5c9289702a0f581967ce91604e28`: UTF-8 text occurrences joined by LF without a final LF. The independent audit and its exact input are under `research/salok-mahalla9/`.

Salok 54 agrees between the selected witnesses, including `ਤੁਮਰੈ ਹਾਥ ਮੈ`. Different digital displays and historical attribution discussions exist elsewhere. This build does not insert a Mahalla 10 heading or narrate a prison correspondence as established history. It preserves the actual collection heading; any future historical treatment needs separately sourced review.

## Lasting names and the archived intake

Unit identities are `sggs.salok-mahalla9.salok001` through `sggs.salok-mahalla9.salok057`; each has `.line01` and `.line02`. The invocation, collection heading and Dohra heading have their own typed identities. Ang, file row and printed line are locators rather than the identities themselves. Salok 29 remains one unit across its Ang boundary.

The archived Shabad OS 4.8.7 intake remains unchanged on commit `d0dc1f29666fa2615234d4b62899873179bde024`. `legacy-source-crosswalk.json` maps its 117 source IDs to the new logical identities: three headings match exactly; 114 verse strings differ only by that witness’s editorial ASCII pause marks. Ang assignments remain the same. Comparison removes those marks from a temporary comparison copy only. This is a documented source selection, not a silent rewrite of the archived witness or an automatic saved-learning migration. No prior Salok Mahalla 9 reader edition is claimed to have been published.

These names are a bounded composition registry. Integration with the separate knowledge registry and full SGGS crosswalk remains future work; this candidate does not pretend the whole 1,430-Ang catalog is already implemented.

## Teaching, sources and authority

Original Gurmukhi is in `salok-mahalla9/data/salok-mahalla9.json`; the collection manifest pins its exact bytes. Authored teaching is in the separate `learning/course.complete.json`. The shared reader keeps separate source and teaching pins for this collection and preserves the existing Nitnem pins.

Every line explanation binds to the source occurrence and its exact hash. Every passage study binds to the entire Salok, including its applicable original heading, rather than only its first verse. Runtime checks also require dictionary keys to agree with the entry’s own source identity. The three heading explanations bind to their own source hashes and remain unreviewed educational drafts.

The teaching assembler refuses to proceed if the selected source or source manifest has changed. An editorial edit updates only the teaching digest. A source change requires a separate evidence-backed source revision. Reference identity includes URL, title and scope, so different Saloks sharing an Ang cannot inherit each other’s source titles. A content check rejects a passage reference explicitly titled for a different Salok.

These controls detect corruption and inconsistent authoring; they are not signatures against an attacker able to replace the entire executable application.

Both languages include line explanations, a short passage summary, a closer reading, vocabulary, interpretive care, reflection and a teach-back question. The drafts preserve references to the Divine, Naam, liberation, rebirth and grace where present. Applications are marked separately. Modern commentary is consulted for limited named interpretive checks; its prose is not imported as the library’s writing.

Both authored halves retain their original drafts and explicit editorial amendment ledgers. The assembler verifies every before-value and reproduces the amended result by hash. The independent AI recheck records resolution of six findings, including Punjabi line-context parity and the attributed garb-of-detachment reading in Salok 17. The second-half review resolves three findings, including consistent interpretation across the layers of Salok 56 and specific provenance for the elephant-bathing image in Salok 46. All proposed amendments were replayed and independently checked against the frozen inputs. These editorial records are distinct from qualified human approval.

Psychology and interfaith comparisons require their own evidence and review. They have not been added automatically to all 57 Saloks. Source agreement and a second AI review never count as qualified Gurbani, Punjabi or Santhiya approval.

## Preservation, offline reading and review separation

Base: frozen PR #40 at `1470477b5a27a8f975f1efce74443a0e136aa94e`. This branch does not advance that review head, PR #47’s Sukhmani visit fix, or the knowledge/Kabir review branches. The isolated iPhone QA site remains on its separately verified PR #40 build.

The new page reuses the same `nitnem/reader.js`, learning renderer and saved-learning manager. It has a separate collection profile, source/teaching files and composition/edition storage key. Existing Nitnem source packs and teaching course stay byte-identical. Japji and Sukhmani source, learning code and stored records are untouched.

The candidate adds its assets to the root offline manifest with a new development cache version. Updates remain explicit. Personal notes are never included in static assets, source records, evidence, or the service-worker cache. All verification uses disposable contexts and synthetic learning.

## Verification and remaining work

Verification commands:

```sh
node tools/fetch-salok-mahalla9-witnesses.mjs --output /temporary/glp-m9-witnesses
node tools/build-salok-mahalla9-source.mjs --witness-dir /temporary/glp-m9-witnesses
node tools/assemble-salok-mahalla9-teaching.mjs
node tools/refresh-salok-mahalla9-sri.mjs
node tools/build-offline.mjs
node tests/salok-mahalla9-content.mjs
node tests/salok-mahalla9-bindings.mjs
node tests/salok-mahalla9-browser.mjs
```

The witness download contains upstream commentary and belongs in a temporary directory. Only the selected original Gurmukhi and provenance are retained in this repository. Upstream code licensing is not treated as a blanket licence for modern translations, commentary, recordings or images.

Exact local and hosted test results are recorded in the pull request and `evidence/salok-mahalla9/`. Browser checks use desktop Chromium at phone, tablet or desktop-sized viewports; they do not establish real iPhone Safari, Home Screen, VoiceOver or device airplane-mode acceptance.

### Local verification, 26 November 2026

- Fresh download of all four pinned witnesses and deterministic source reconstruction: passed; source and manifest hashes remain unchanged.
- Content and preservation: 11 grouped checks passed.
- Semantic binding and corruption rejection: 12 tests passed, none skipped.
- Complete Salok reader: 38 browser checks passed in Chrome 158.0.8127.37, with 320px, 390px and 1280px viewports, 60px Gurmukhi, native Chromium accessibility names, learning backup/restore, and the real offline cache.
- Existing Nitnem reader: 64 browser checks passed. Its historical static-asset-count assertion was updated from 57 to the new explicit 64; exact cache membership and byte comparisons remain.
- Existing portable regressions and syntax checks: all 19 commands passed with Node v22.15.0; the service-worker suite includes eight checks.
- Final teaching SHA-256: `e8fdcba77ac0cbf0ab396218a86225e45901ff9cb5b1c8524c7f6261a443bc79`.
- Content, browser and portable evidence record the exact input file hashes. Screenshots of narrow reading, the expanded meaning dialog, saved reflections and offline Study were retained; representative reading/dialog layouts were visually inspected.

These are development checks. Hosted CI runs the same candidate and the existing Sukhmani and repair browser gates. Neither automated checks nor AI editorial checking establish qualified scholarly or physical-iPhone acceptance.

Remaining gates are Claude’s independent review of this exact candidate, qualified source and bilingual editorial review, physical-device acceptance, and an explicit release decision. Existing repair findings retain their own status. After this composition, the next content work is Bhagat Kabir Ji’s Salok collection and remaining Bani, preserving individual attribution and source discrepancies already recorded in PR #50.
