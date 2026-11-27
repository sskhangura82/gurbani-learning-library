# Reviewed stack integration — local builder handoff

27 November 2026. ChatGPT builder work, not an independent verdict. Acceptance was
committed at `272c45f` before conflict resolution. The integrated application tree
through all six reviewed tips was committed at
`f826168ffa5e589a233153595b17d84b0779e364`; subsequent changes repair the print
inspection instrument and record verification. No runtime content was changed
by that inspection repair.

## Integrated work

The branch contains the exact reviewed tips of #73 (Daily test publisher), #72
(Farid source-only reader), #66 (Haumai private learning), #74 (Explore complete
passages), #67 (quality-check visibility), and #71 (Kartarpur draft/history
registry), all on the #62/#63 composite. Every tip is an ancestor of this result.
The complete frozen SHAs are in the acceptance document.

No obsolete Knowledge PR or standalone Explorer #41 was merged. The closed
Knowledge bundle and source/teaching separation remain intact.

## Deliberate conflict resolutions

- `tools/build-offline.mjs`: union the required assets and use the single version
  `0.26-reviewed-integration-20261127-1`; regenerate `sw.js` from actual bytes.
  The result contains 107 unique shell paths, with the Farid and complete-passage
  assets present. Dated Daily source pairs retain their separate verified cache.
- `tests/library-script-integrity-inputs.mjs`: preserve separate exact Daily,
  Farid, Haumai and Explore scope functions. Each checks its own original
  before/after digests; the preservation loop exempts only those validated
  scopes. Both the bounded Farid reader extension and Haumai app change remain
  enforced. Explore's earlier Daily navigation witness is retained.
- `tests/library-script-integrity.mjs`: union the complete fixture input files
  for Farid, Haumai and Explore. Keep the positive fixture control and all
  negative loader/dependency/stale-source tests. The resolved files parse and
  the combined tests run; absence of merge markers was not the acceptance test.
- Bundle graph/policy merged cleanly. All four committed bundles reproduce
  without regeneration; there are 26 exact source inputs.

## Print inspection correction

The inherited `browser-and-print` failure was caused by PyMuPDF 1.26.6's text
extraction of dependent vowel signs after subjoined ਰ in the existing PDFs.
Rendering and geometry still use the existing backend. Fidelity checks now
always use **Poppler pdftotext**, declared with its version in the report.
There is no result-dependent engine fallback, no substitution of expected text,
and no removal of letters, vowel signs, joiners or punctuation. Normalization
remains NFC and collapsed whitespace only.

The workflow explicitly installs `poppler-utils`. Three regression tests check
all six existing PDFs, preserve significant characters through normalization,
and alter one actual PDF `/ActualText` cluster from `ਪ੍ਰਾ` to `ਪ੍ਰਾਾ` in a temporary
copy. That negative control changes semantic PDF text while leaving the source
artifact unchanged; the inspector refuses it. All six original A4/Letter PDFs
pass exact text, once-only/grouped passage and margin checks. PNG review remains
`NOT_PERFORMED_BY_SCRIPT`; this is not a claim about every PDF viewer or printer.

## Verification on this integrated tree

Environment: Linux, Node 24.22.3, locked esbuild 0.28.2/acorn 8.19.0, Python 3.12,
PyMuPDF 1.26.6. CI uses Node 22 and has not run for this local integration commit.

| Check | Result | Evidence |
|---|---|---|
| Combined new-feature, history, publishing refusal, source and scope contracts | 161/161; zero skips | `evidence/reviewed-stack-integration/combined-contracts-final.tap` |
| Full corpus reconstruction/search, mutation refusal and complete-passage crosswalk | 54/54; zero skips | `full-reconstruction-contracts.tap` |
| Combined module, loader, toolchain and reader integrity | 18/18 | `combined-integrity-contracts.tap` |
| Existing source, Article and private-learning preservation | 113/113 | `preservation-contracts.tap` |
| Print regression | 3/3, including an actual altered-PDF refusal | `print-text-regression.log` |
| Six existing PDFs, exact text and page geometry | 6/6 | `print-inspection.json` |
| Changed JavaScript parsing | 53 files parse | Resolved merge plus `node --check` |
| Bundle and loader reproduction | 4 bundles; 26 inputs; 58 pins on 16 pages | `bundles.json`, `app-sri.json`, `reader-sri.json` |
| Offline reproduction | 107 assets; clean generated diff | `offline.json` |
| Original and teaching preservation | 31 named files byte-identical to their frozen input | `source-preservation.json` |

The suites overlap. Their counts must not be added and described as that many
independent requirements or unique checks.

The full pinned original research capture was reconstructed from 1,430 source
files, producing 60,555 original occurrences and the same packet SHA-256
`43980370fe096349aba54519135c1c64145ff6448c3b9e88a5791147fd278058`.
Raw pages and the complete original-only packet remain outside Git. No modern
translations or generated transliterations were added to runtime or the repo.
The 303 owning source units reproduce 302 distinct complete passage bindings.

## Initial failures retained, and what they mean

1. The first combined run had no full research packet supplied: 158 pass, one
   required-reconstruction failure, two witness skips. The full reconstruction
   and final combined run above close this gap without skipping tests.
2. Initial source-capture environment detection encountered Git's filesystem
   boundary message. Running Git with full cross-filesystem discovery returned
   the expected genuine outside-worktree result. No guard was removed.
3. Source fetching reached 1,278 exact files before HTTP 429. A bounded sequential
   continuation verified the existing files, respected retry delays, acquired
   the remaining 152 and checked every original byte count and Git blob.
4. A later fixture run lacked Farid's `authors.json`, and a research refusal
   fixture attempted hard links across filesystem mounts. A separate complete
   12-file Farid witness capture and a same-filesystem temporary research copy
   resolved these fixture assumptions. No application or source contract was
   changed to accommodate the environment.
5. The local Chromium wrapper exists at `/usr/bin/chromium`, but its target
   `/usr/lib/chromium/chromium` does not. Both actual browser attempts with
   `CHROMIUM_PATH=/usr/bin/chromium` failed before any check ran. The standard
   Playwright browser download was denied HTTP 403. The failures are preserved
   in the browser logs and original failed report folders. **Combined browser
   verification remains pending**, not passed.

## Release boundaries and next integration

No remote ref, `main`, PR, production site, phone preview, credential or workflow
activation was changed. Daily remains inactive and restricted to its existing
isolated destination/activation gate. Private learning tests use synthetic data.

This branch needs the founder's newly authorized content-policy and protected
religious-text work integrated next. That work must refresh only its explicit
new scope records, bundle pins and offline inventory, then run the applicable
combined checks on the final result. This handoff does not authorize a merge or
deployment and makes no physical-device, scholarly-authority or hosting-rights
claim.
