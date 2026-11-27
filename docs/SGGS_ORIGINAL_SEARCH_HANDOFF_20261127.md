# Original-text search across the pinned corpus

27 November 2026 · source research candidate · independent review pending

## What is now possible

A bounded toolchain can fetch all 1,430 exact source files already inventoried in PR 65, extract only their marked original Gurmukhi occurrences, and search those occurrences with the application's existing Knowledge retrieval engine. Both joined and spaced first-letter queries work, as do complete-word phrases. Source wording and original occurrence order are preserved.

The actual pinned capture contains **60,555 marked original occurrences** in **1,430 files**, with 14,816,830 raw source bytes. The generated original-only research packet is 26,083,493 bytes. These are occurrence and file counts for this named digital witness. They are not a count of complete compositions, independent textual collation, authenticated Angs or qualified approval.

No additional reader, application search route, meaning, author assignment, audio facility or deployment is included. Audio work is paused following the founder's direction; the eventual personal recording does not block the original-text work.

## Identity and byte custody

The source is `opengranth/open-granth` at `34d2a7cab032c8ea24d21ff20f64653bd03766f4`. The existing file inventory is pinned separately by SHA-256. Every raw file must reproduce its recorded Git blob and byte count; the projection contract additionally pins each raw SHA-256, the number of marked original occurrences, and a digest covering every original string, position and identity on the page.

A witness occurrence ID is a SHA-256 commitment to the pinned source edition, file path, raw file SHA-256, exact byte start/end and original text digest. Source ordinals and printed-line labels are retained as descriptive locators, not as canonical IDs. Repeated identical lines have different occurrence IDs because they occupy different source bytes. These are immutable identities within this witness, not an invented promise that an ID persists through a different edition. A separately reviewed crosswalk is still needed for canonical passages and cross-edition migration.

The full original projection is kept in a temporary research artifact outside Git. The repository carries a compact per-page contract and reproducible code, not raw pages containing protected reading aids or the large unadmitted corpus. The fetcher and builder refuse destinations inside Git worktrees and refuse existing output destinations. The full source set, ordinary files, UTF-8, marker grammar, page counts, exact projection and absence of unknown packet fields are all checked before a packet can be searched.

A search packet must use the exact generated JSON encoding. Duplicate keys or alternate encodings are refused before the original projection is validated. Search revalidates a previously loaded packet, so changing it after loading does not gain access through a cached approval.

## Search limits

The adapter reuses `knowledge/search.mjs` directly. It does not fork the retrieval implementation or create a second UI. It passes explicit `phrase`, `first-letter` or `first-letter-anywhere` modes. The existing engine performs retrieval-only Unicode/word normalization; those forms never overwrite the original text in the packet or results.

The research search deliberately has no English topic aliases, fuzzy names, semantic mappings, inferred authors, inferred raags or canonical Ang lookup. `NASA`, `category` and romanized topic names cannot become scripture hits. A hit is a source occurrence, visibly not a complete Shabad or an approved lesson. Results include the full exact original occurrence and its source identity, total match count, returned count and a truncation flag. The maximum result page is 100 occurrences; default 20.

A `reportedSourceAng` is exactly that: the digital file's label. Every result marks it as **not independent Ang verification**. Source page front matter is never inherited as line-level author or raag attribution.

## Existing Farid disputes stay visible

The displaced closing occurrence still sits at its original source location in `corpus/ang-1377.md`, ordinal 2. A matching result carries `og-location-1377-row002`, with no relocation to 1378 and no automatic author or composition assignment. The collection heading retains its source terminal danda and the `farid-heading-terminal-danda` dispute identifier.

The incomplete forward Farid span and its frozen intake contract are unchanged. Searchability does not resolve that collection's missing number, approve a reordered selection or justify presenting an incomplete source package as a complete Bani.

## Run the research tools

```sh
node tools/fetch-sggs-research-witnesses.mjs --output /tmp/glp-sggs-witnesses-new
node tools/build-sggs-research-index.mjs --witness-dir /tmp/glp-sggs-witnesses-new --output /tmp/glp-sggs-index-new
node tools/search-sggs-research-index.mjs --index /tmp/glp-sggs-index-new/index.json --query 'ਸਾਸਿ ਸਾਸਿ' --mode phrase --limit 20
node tools/search-sggs-research-index.mjs --index /tmp/glp-sggs-index-new/index.json --query 'ਸਸਸਗ' --mode first-letter --limit 20
GLP_SGGS_WITNESS_DIR=/tmp/glp-sggs-witnesses-new GLP_SGGS_INDEX=/tmp/glp-sggs-index-new/index.json node --test tests/sggs-original-research.mjs
```

The complete-word query `ਸਾਸਿ ਸਾਸਿ` finds 68 occurrences in this exact witness. That is a literal-query result; it does not include every alternate spelling and is not a claim that only 68 lines address remembrance or breathing. A separate exact query for `ਸਾਸ ਸਾਸ` yields four occurrences. These observations do not reproduce or certify the earlier review-seat count of 71; that earlier count used a different source/query procedure, which has not been reconciled here. Nothing is removed or adjusted to force agreement. Search results and thematic or theological judgments must stay separate.

## Evidence and review

Builder criteria were frozen in commit `8a1ab3c` before implementation. Actual source capture and reconstruction succeeded, and the local checks exercise omitted, duplicated, reordered and modified occurrences; fabricated authority/locator fields; missing, extra, symlinked and altered files; invalid encoding; reading-aid exclusion; repeated-text identity; exact-word retrieval; both initial-letter modes; and known discrepancy retention. The full local evidence is under `evidence/sggs-original-search/`.

These are builder verification results on a Mac with Node 26, not Claude's independent findings, a qualified Gurbani review or a physical-phone test. A read-only proposed workflow repeats full capture, projection and retrieval checks using Node 22 and uploads only receipts and test reports. Hosted execution status belongs in a later evidence record after it actually runs.

Original Gurbani and source-policy references remain those in the unchanged PR 65 intake. OpenGranth's code license is not treated as a license for its modern translation; no modern translation or generated transliteration is extracted, searched or bundled.

## Next boundary

This completes a research extraction and retrieval path, not public-reader admission. The next useful increment is a reviewed canonical occurrence crosswalk and complete-unit selection layer, retaining documented source discrepancies. That layer can then connect approved passages to the existing Explore interface and readers without duplicating their scripture or treating file labels as independently established Angs. Independent review, qualified review and the founder's release decision remain separate.

## Builder peer correction

A builder peer found that the initial output guard accepted an unavailable Git executable as though it proved the destination was outside a worktree. Both command-line tools now fail closed on unavailable or abnormal Git detection, before any capture or output creation; only the ordinary verified outside-repository result is accepted. Separate CLI tests exercise the missing-Git failure in both paths. This is a builder-team correction, not Claude independent approval.
