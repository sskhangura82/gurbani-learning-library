# Salok Sheikh Farid Ji — explicit source selection and source-only reader

Development candidate; independent review, qualified review and any release decision remain separate. Audio work is paused. This adds the 130 numbered Saloks collection, not every composition attributed to Farid Ji elsewhere in Sri Guru Granth Sahib Ji.

## What changes

The existing shared collection reader can now open `salok-farid/index.html?bani=salok-farid`. It carries 130 numbered Saloks, comprising 284 verse occurrences and 13 structural occurrences. The longer units are retained whole, including the eight-line first Salok and the six-line Salok 100. The original eleven Mahalla headings remain at their source positions.

There is no Farid teaching asset. Meaning and Study show a visibly empty state. No translation, explanation, practice, comparison, generated recitation or audio has been supplied. The existing private bookmark, reflection, export/import and offline mechanisms are reused with a separate edition identity.

The change deliberately leaves library navigation and the complete-passage search crosswalk for the concurrent integration work. A route existing is not authorization to expose this candidate before source-selection review.

## Frozen criteria and inherited record

Builder criteria were committed before implementation in `docs/FARID_READER_CRITERIA_20261127.md` at `2581839`.

The base is PR65, `4eee4f26bf7bad7ce52d4c958c06a94da1262ecb`. Every byte of `content-intake/farid/`, the inherited full-corpus inventory and all existing scripture/teaching files is preserved. In particular, the old intake's quarantine and “not runtime admitted” observations are not retroactively changed. `research/salok-farid/selection-ledger.json` is a new, explicit development selection.

The new edition is `salok-farid-selected-witness-34d2a7c-20261127`.

## Why there are 297 selected occurrences

The pinned OpenGranth source commit `34d2a7cab032c8ea24d21ff20f64653bd03766f4` has 296 consecutive occurrences from the Farid collection heading through numbered ending 130. That span contains the first line of Salok 2 but lacks its ending. The exact ending is retained elsewhere in that same frozen source at reported digital Ang 1377, ordinal 2, within the preceding Kabir vicinity:

`ਬੰਨੑਿ ਉਠਾਈ ਪੋਟਲੀ ਕਿਥੈ ਵੰਞਾ ਘਤਿ ॥੨॥`

The inherited Shabad OS grouping record puts the first and second lines in group G4W, ordered 1 and 2. Fresh original-only SriGranth display captures across reported Angs 1377–1385 also place the ending immediately after the first line, as the first original row on the 1378 display. The selected candidate therefore inserts that unchanged occurrence after its group mate.

The original locator is not repaired or overwritten. It remains the source's reported Ang 1377, ordinal 2; the secondary observation of 1378 is a separate field. Canonical Ang is null. This records a development selection supported by group and full-sequence evidence. It does not settle a printed-page attribution.

## Full secondary comparison, including disagreement

`tools/fetch-salok-farid-secondary.py` retrieves nine original-only display pages. It retains exact URLs, timestamps, response hashes and original Gurmukhi display rows; it does not preserve modern translations or dictionary tooltips. HTML presentation whitespace is collapsed, but Gurmukhi code points and punctuation are not normalized into agreement.

The bounded secondary sequence has all 297 corresponding occurrences. It agrees exactly with 291 selected strings. The six differences remain visible in the ledger:

- The selected source has a terminal danda on the collection heading; the secondary display omits it. The pinned source heading is retained explicitly.
- Five secondary display lines use the private-use character U+F03D where the pinned source uses valid Unicode nasal-mark sequences. The pinned source strings remain unchanged. No glyph equivalence is adjudicated.

The preceding Kabir ending and following next-section boundary are recorded. The displaced line is byte-identical in the secondary display at its selected place.

OpenGranth derives from Shabad OS SSA2. They are not counted as two independent textual lineages. SriGranth's full sequence comparison is an additional display witness; independence of its transmission lineage has not been established. Full printed-edition collation and qualified human review remain incomplete.

## Authorship and location

Every unit's canonical author is null. Neither the collection title nor the signature in a verse is used to infer an author's identity. Original Mahalla headings are retained as original text and linked by stable heading IDs; they do not silently assign authors to later unheaded units.

The reader labels its location values as selected digital-source locations. No canonical or independently authenticated printed Ang claim is introduced. The 1377/1378 discrepancy remains visible in the source record.

## Integrity and scope

The source pack, library manifest and selection ledger are separately sealed. The reader also pins the full selected text sequence and a custody representation containing every original occurrence, unit, locator, attribution and source audit. Rebuilding an outer file hash cannot silently bless a reordered heading, missing line, reassigned author or claimed approval.

`evidence/salok-farid/inputs/reader-scope.json` records exact before/after hashes for the small shared-reader extension, reader SRI policy and the three existing HTML files whose reader-script pins change. Existing markup remains unchanged after removing those pins. Existing module closures and scripture/teaching bytes retain their prior protections.

The global script inventory grows from 15 pages and 52 script occurrences to 16 pages and 58 occurrences. The offline manifest adds only the Farid directory alias, page and two data files. The service worker's update/storage logic is unchanged.

## Reproduction and verification

Run the source builder with a temporary pinned-witness directory:

```
node tools/fetch-farid-witnesses.mjs --output /tmp/glp-farid-witnesses
node tools/build-salok-farid-source.mjs --witness-dir /tmp/glp-farid-witnesses
```

The source tests independently enumerate the 130 endings, variable unit lengths and eleven headings; compare every selected byte and locator with the preserved intake; reproduce the source/ledger outputs; and exercise actual loader functions after deliberately resealing mutated outer files. Negative cases include omissions, duplication, reordering, heading substitutions, source location edits, inferred authors and inflated approval claims.

The new browser harness uses fresh desktop Chromium contexts and synthetic notes only. It checks complete rendered source order, passage navigation, empty explanations, 320/390/820-pixel widths, 60-pixel Gurmukhi wrapping, bookmark/reflection export and import, other-collection preservation, source corruption refusal and the actual root worker offline path. Existing Kabir source, binding and browser checks and Mahalla 9 content checks cover compatibility.

No physical iPhone, Safari, iPad, Android, Home Screen or VoiceOver success is claimed. Automated source checks are not qualified source approval.

The review seat should freeze its own criteria before examining the builder's evidence. No merge or deployment has been performed.
