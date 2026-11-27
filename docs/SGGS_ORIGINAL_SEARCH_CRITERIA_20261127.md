# Original-text corpus search research — builder criteria

27 November 2026. Frozen before implementation. Source base: PR 65, `4eee4f26bf7bad7ce52d4c958c06a94da1262ecb`. This is builder preparation, not independent or qualified review.

## Intended increment

Produce and exercise a research-only original-text search corpus from the existing pinned 1,430-file inventory. Reuse the existing Knowledge search engine for whole-word and Gurmukhi first-letter retrieval. Do not build a second reader or search UI. Audio work is paused by the founder; no recording research or implementation belongs in this increment.

## Required checks and boundaries

1. Require the exact frozen inventory and all 1,430 source files, each with the recorded Git blob and byte count. No partial-success package, latest-branch fetch, silent skip, symlink, overwrite or source normalization.
2. Fetch raw files only to a fresh temporary directory outside every Git worktree. Raw files contain modern translation and generated transliteration; never track, publish, package or search those layers.
3. Extract each original-text occurrence exactly, with byte custody and ordering. Cross-check every source marker and declared page count; malformed structure and invalid UTF-8 refuse the package. Preserve duplicates as separate occurrences.
4. Source identities must bind the pinned edition, source file, byte offset and exact text digest. Row numbers, page numbers, first lines and fuzzy matches cannot be canonical IDs. These are immutable witness IDs, not cross-edition scripture identities or verified composition IDs.
5. Retain reported source-file Ang and source printed-line labels only as qualified source locators. Do not infer author or raag from whole-page front matter. Preserve both known Farid discrepancies and unresolved attribution/boundary status; never repair or relocate text during indexing.
6. Package admission flags remain false. Record full-corpus extracted/searchable occurrences separately from independent collation, complete compositions admitted, qualified review, runtime approval and release; the latter remain zero or false.
7. Search uses explicit modes (whole words, initial letters at start, initial letters within a line) through the existing Knowledge engine. No automatic English/romanized concept mapping, fuzzy match, semantic claim or inference that a hit is a complete Shabad.
8. Search validates the package before use, has bounded query/result sizes, returns original byte-preserved text and source identity, and reports total hits separately from truncated results. Corruption, missing/extra records, fabricated provenance, locator changes and approval promotion must refuse before returning hits.
9. Test source corruption, missing/extra files, repeated text identity, invalid UTF-8, malformed markers, protected reading-aid exclusion, exact-word versus substring behavior, both initial-letter modes, empty/oversized/unsupported queries and known Farid quarantine retention. Synthetic fixtures must be visibly synthetic and carry no genuine-text verification claim.
10. Existing source packs, source locks, original intake records, application scripts, teaching, private data, workflows and test-site state remain unchanged. A read-only dedicated CI check may be added for the new tools.
11. Produce a reproducible receipt from the actual pinned corpus if retrieval succeeds. If any source blocks or fails, say so; never claim that a file inventory or synthetic fixture demonstrates a full-corpus build.

No merge, deployment, schedule activation, permission request, custodian contact or human approval is authorized by this record. No physical-device, independent source or historical authenticity claim is established by extraction and retrieval.
