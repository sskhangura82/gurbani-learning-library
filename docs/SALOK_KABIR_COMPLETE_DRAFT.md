# Salok Bhagat Kabir Ji — complete collection development draft

## Scope and authority

This workstream adds the complete collection of 243 numbered Saloks under **ਸਲੋਕ ਭਗਤ ਕਬੀਰ ਜੀਉ ਕੇ** to the existing reader. It contains 486 verse occurrences, the collection heading and invocation, and six embedded Mahalla headings: 494 original occurrences altogether. It is not the whole of Bhagat Kabir Ji’s Bani across the Raags, and it does not include the following Salok Sheikh Farid collection.

The source pack, educational draft, review records and browser-local learning have separate identities. The shared reader is reused; Nitnem and Salok Mahalla 9 scripture and teaching bytes stay frozen. An independent code check also identified a pre-existing backup-size mismatch: valid saved notes could produce a backup larger than the importer accepted. This branch repairs the bounded import allowance while preserving the stored format, keys, per-note limit, merge rules and recovery behavior. Source strings retain stable occurrence IDs such as `sggs.salok-kabir.salok177.line01`; explanations bind to the individual verse digest and the enclosing full-passage digest.

**Release channel: DEVELOPMENT_REVIEW. Qualified human collation/review: 0. Publication approval: false.** Technical tests, digital agreement, page-image spot checks and independent AI editorial review do not change these values. No audio or pronunciation approval is claimed. The existing production site, frozen PR 40 phone-QA release and PR 51 review head are outside this change.

## Source selection and reproducibility

Pinned upstream: `opengranth/open-granth`, commit `34d2a7cab032c8ea24d21ff20f64653bd03766f4`, fourteen files covering source Ang 1364–1377. The fetcher checks each exact byte count and SHA-256. The source builder also checks Git blob identities and reconstructs each original occurrence and locator from the pinned files. Modern translation and transliteration layers are never imported.

Research records under `research/salok-kabir/` preserve:

- `source-selected.json`: the frozen raw-based 494-occurrence selection, including the original heading with its terminal danda. Its SHA-256 is `e4649489194a7842a7bfb4bd06d69308a15b8ab79c0dfc455740011717d5af05`.
- `source-witnesses.json`: fourteen raw-file fingerprints.
- `source-secondary-v1.json` and `source-audit.json`: independently retrieved original Gurmukhi strings and occurrence-level comparisons against SriGranth.
- `intake-discrepancy-review.json` and `.md`, with `upstream-line-groups.json`: bounded investigation of the two frozen PR 50 discrepancies, source metadata and page-image provenance.
- `intake-discrepancy-review-erratum-231.json`: the separately preserved correction identifying Salok 231 line 1 across printed Ang 1376–1377.
- `runtime-selection.json`: explicit selection decisions for this new reader. It does not rewrite the frozen intake or silently normalize scripture.

The runtime selects the exact alternate opening heading **ਸਲੋਕ ਭਗਤ ਕਬੀਰ ਜੀਉ ਕੇ**, without a terminal danda. SriGranth and the inspected page images support this heading. The original OpenGranth heading, before/after digests and evidence remain available. All 486 verse strings are unchanged from the frozen extraction.

The raw selection comparison has 492 exact matches out of 494. Following the explicit heading choice, the reader has 493 exact matches out of 494. Among the 486 verses, 485 match the second digital transcription exactly. Salok 177 line 1 retains the selected U+0A01 nasal-mark encoding; SriGranth’s retrieved string uses U+F03D. Raster images show a nasal mark but cannot establish code-point equivalence. This difference remains documented and unadjudicated.

### The Farid occurrence between Saloks 231 and 232

The raw OpenGranth bounded span has 495 records. Exactly one is excluded from this Kabir collection: source Ang 1377, row 2, hash `f9312b97a0b94ce0412cc998d0289563b75d966001558a156d94f616d5ab01b0`.

The upstream Shabad OS record is line V41B, group G4W, section X63C (SalokFareedJee), author FRID. Its page/line metadata places it near the top of 1377; the preceding line in its own group is near the end of 1377. The pinned importer’s sorting by page and line explains the interleaving. Inspected printed Ang 1378 begins with this disputed Farid line.

This resolves inclusion for the **Kabir collection only**. Its original bytes and reported location remain in the research record. No Farid reader is built by moving this row, no upstream issue is posted, and the frozen PR 50 canonical-location/attribution fields are not overwritten.

### Digital references and printed pages

Runtime Ang labels explicitly describe the selected digital witness. Printed-page observations are separate fields, shown in Study. Salok 177 line 1 crosses printed Ang 1373–1374. Salok 231 line 1 crosses printed Ang 1376–1377: the first page ends with ਕਬੀਰ ਸਾਧੂ and the next begins with ਸੰਗੁ ਪਰਾਪਤੀ. The separately preserved erratum records both page pairs and corrects the initial imprecise wording without altering the frozen review. Ten Saloks have their two digital verse records on different source Angs: 10, 29, 67, 104, 141, 159, 177, 195, 213, 231.

The Commons scan’s SGPC publisher attribution comes from the visible cover and uploader-provided metadata. The printing date and institutional authentication remain unknown. The SikhNet PDF is a typeset witness. Neither is described as a completed qualified collation. Image URLs, provenance and fingerprints are retained; external page images, complete PDFs, the database and modern commentary prose are not bundled in the application.

## Voices and original headings

| Salok | Original heading | Editorial context |
|---|---|---|
|209|ਮਹਲਾ ੫ ॥|Guru Arjan Dev Ji|
|210|ਮਹਲਾ ੫ ॥|Guru Arjan Dev Ji|
|211|ਮਹਲਾ ੫ ॥|Guru Arjan Dev Ji|
|214|ਮਹਲਾ ੫ ॥|Guru Arjan Dev Ji|
|220|ਮਃ ੩ ॥|Guru Amar Das Ji|
|221|ਮਃ ੫ ॥|Guru Arjan Dev Ji|

The exact full/abbreviated headings are preserved. Their scope is the immediately following numbered Salok; the software does not inherit a Guru heading indefinitely. Names within Saloks 212, 213, 241 and 242 are kept as named voices rather than automatically reassigned author IDs. The passage studies discuss the context and attribute interpretive readings. Qualified attribution review remains pending.

## Educational layer

The draft contains 486 original bilingual line explanations, 243 bilingual whole-passage studies, and eight bilingual heading contexts. Each study contains a summary, close reading, source-specific vocabulary, interpretation care, reflection and a teach-back prompt. Reflection is labelled application, separate from the meaning. English and Punjabi cover the same substantive points.

Original authored chunks, independent AI review records and exact before/after amendment ledgers are preserved. All 243 entries received a separate AI reading; 111 field amendments across 22 Saloks were applied and then rechecked against the frozen inputs. These are technical/editorial checks, with zero qualified human approvals. The teaching assembler verifies each input and reconstructs the amended result. Editing these explanations cannot reseal scripture. Every visible lesson remains an AI-assisted educational draft awaiting qualified Sikh scholarship and Punjabi review.

Psychology, comparative religious studies, Santhiya and three licensed recordings per composition remain separate workstreams. They are not filled with invented expertise or placeholder audio.

## Reader behavior and verification

The reader supports continuous and one-passage reading, 243 jump destinations, Read/Meaning/Study, Light/Dark appearance, 24–60px Gurmukhi, a silent visual guide, exact saved positions, saved lines, reflections without a bookmark, export/import, and offline reading. The source pack remains readable if educational assets fail verification. Imports from other collections are rejected atomically; damaged learning remains exportable without overwrite.

The backup parser and file-upload precheck share a collection-sized UTF-8 byte bound. For this pack, the maximum is 35,035,195 bytes: a 43,195-byte maximum valid export envelope plus 486 × 12,000 × 6 bytes for worst-case JSON escaping. This import allowance is not a promise about a browser’s storage quota. Existing quota failures preserve stored data and remain reported through the existing saving/recovery behavior. The per-note 12,000-code-unit limit and merge-conflict protection remain unchanged.

Source and semantic tests check exact sequence, stable IDs, whole-passage lesson bindings, all six headings, source boundaries, metadata and attribution custody, missing/swapped explanations, fake review promotion and recovery from unavailable teaching. Browser tests inspect all 494 source entries, 486 bilingual meaning controls, 243 studies, all 243 jump targets at 320/390/1280px, maximum text size, source-specific headings and locators, focus return, repeated reload position, saved-note export/import, preservation of other collections, and the real root worker’s 69 exact cache assets.

The repository evidence directory records completed results and input digests. Desktop Chromium and narrow viewport emulation are not a physical iPhone, Safari, installed Home Screen app or VoiceOver test.

## Completed development verification — 26 November 2026

The assembled branch was tested on the authorized Mac in Chrome 158.0.8127.37. All browser contexts were temporary and all notes synthetic.

| Verification | Result |
|---|---|
| Source reconstruction from fourteen pinned witnesses | Exact source pack, manifest, selected sequence and custody digests reproduced |
| Kabir content, source identities, bilingual coverage and preservation | 12 checks passed |
| Kabir semantic binding and tamper counterexamples | 12 tests passed |
| Backup capacity and exact import/export round trips | 6 tests passed |
| Kabir browser acceptance | 40 checks passed |
| Salok Mahalla 9 preservation | 11 content checks, 12 binding tests and 38 browser checks passed |
| Nitnem browser regression | 64 checks passed |
| Sukhmani browser regression | 35 checks passed |
| Existing source-integrity browser checks | 18 checks passed |
| Existing retained-learning/accessibility repair checks | 18 checks passed; 3,773 existing meaning controls inspected |
| Portable repository quality gates | All 20 commands passed; includes the backup capacity tests above |

The Kabir browser run covers all 243 jump destinations at 320, 390 and 1280 pixels, 486 bilingual meaning controls in the native Chromium accessibility tree, 243 studies, 60px Gurmukhi, repeat reloads, unbookmarked reflections, a real file upload above the former 2.5MB limit, and the actual service worker's 69 declared cache entries. The uploaded fixture contains Punjabi, JSON control escapes and a lone-surrogate escape, and re-exports exactly. The Node capacity tests separately cover every allowed note at maximum escaping expansion.

Evidence is in `evidence/salok-kabir/content.json`, `browser.json`, `portable-gates.json` and the adjacent screenshots. Existing regression reports remain in their established evidence paths. The three `editorial-recheck-*.json` records preserve exact replay results and the limited scope of the AI checks.

These results establish development behavior for the tested inputs and engine. They do not establish qualified interpretation approval, a complete printed-edition collation, Safari/VoiceOver behavior or physical iPhone acceptance. The production deployment, PR 40, PR 51 and isolated phone-QA release remain separate.

## Reproduce

```sh
node tools/fetch-salok-kabir-witnesses.mjs --output /temporary/glp-kabir-witnesses
node tools/build-salok-kabir-source.mjs --witness-dir /temporary/glp-kabir-witnesses
node tools/assemble-salok-kabir-teaching.mjs
node tools/refresh-salok-mahalla9-sri.mjs
node tools/refresh-salok-kabir-sri.mjs
node tools/build-offline.mjs
node tests/salok-kabir-content.mjs
node tests/salok-kabir-bindings.mjs
node tests/nitnem-backup-capacity.mjs
node tests/salok-kabir-browser.mjs
```

The temporary witness directory contains upstream modern translations alongside the original source and must stay outside the tracked repository. The source builder only extracts original Gurmukhi records. Existing reader, learning-preservation and repair gates remain mandatory.

## Next catalogue increment

Keep Salok collections distinct from author-wide catalogues. Kabir’s Raag Bani should follow the frozen broader intake through per-composition boundaries, source comparisons, stable IDs and qualified-review states. Farid follows its own collection boundary. The ultimate full-SGGS library should provide multiple views of the same source occurrences—composition, author, Raag, Ang and carefully sourced concepts—without duplicating or renaming scripture to suit lessons.
