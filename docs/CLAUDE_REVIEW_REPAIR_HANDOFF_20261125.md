# First repairs following Claude's independent review

## Status and exact review target

This is ChatGPT's implementation response to Claude's review, not an independent
approval. The app baseline is `a3476ac4b9be90dde350fb35dd13ce0b672c120d`. Claude's
completed review is `ffd3d179a16c9c656905dcedce34a080ffee54ff` on
`review/claude-independent-20261125`. Its 58 findings and final verdict remain intact.
The initial review at `1246fb4` is superseded where the comparison step corrected it.

Claude is the second reviewer. The product owner is not being asked to proofread
Gurbani, re-run tests, or substitute for that review. Qualified scholarly review and
physical-device testing remain distinct requirements; neither AI can supply them.

This repair candidate adds no composition and changes no scripture, meaning or study
data. Salok Mahalla 9 is being completed on a separate draft branch. It is held from
public addition in response to the final review's recommendation to address the
foundation first.

## Implemented changes

| Finding | Change | Evidence to re-test |
|---|---|---|
| CI-R-01 | Japji and Sukhmani verify a fixed full-source digest, every line digest, exact counts, IDs, sequence and source locations before constructing the reading model or accessing saved learning. Browser SRI pins both the original data file and verifier. | `tests/source-integrity.mjs` and `tests/source-integrity-browser.mjs` |
| CI-R-02 | Japji retains unknown note IDs, unknown bookmark IDs, oversized notes and conflicting legacy migrations. A visible notice opens a full, readonly recovery list. Normal learning continues; export/import preserves the retained records. Invalid raw data is kept unchanged. | `tests/japji-retained-learning.mjs` and `tests/review-repairs-browser.mjs` |
| CI-A-01 | Meaning buttons take their accessible name from their visible English and Punjabi text. Fixed labels no longer conceal the meaning. | Native Chromium accessibility-tree checks for all 3,773 meaning buttons in `tests/review-repairs-browser.mjs` |
| Draft disclosure | Japji and Nitnem now explicitly say the educational explanations are AI-assisted. Sukhmani already did. | Reader HTML and the same browser flows |
| Source review notice | Savaiye and Chaupai, and the Chaupai/Swaiya/Dohra parts of Rehras, state that comparison with a named printed edition is pending. | `nitnem/reader.js`; no source selection or wording changed |

The integrity code freezes the source synchronously before its first `await`. An
altered word with a recomputed line hash still fails the separately pinned full-object
digest. Missing or reordered records and changed Ang metadata also fail. A failed
check displays an explanation, keeps reading controls disabled, and leaves saved
learning alone. These checks verify agreement with the published digital edition;
they do not certify the edition's theological or textual correctness.

The saved-learning change does not guess a new location for an unknown ID. It retains
the original ID and full text in `keptAside`. Known notes and bookmarks remain usable.
Two different legacy notes that map to one current occurrence are both kept. Imports
merge distinct retained items and do not duplicate identical ones. A malformed
retained-data field refuses a write rather than being discarded.

## Preservation contract

`evidence/nitnem-prior-runtime-baseline.json` remains unchanged. Four reader/HTML files
are intentionally amended; their exact before/after hashes and finding IDs are in
`evidence/claude-review-runtime-amendments.json`. The preservation test permits only
those named amendments. All original scripture and teaching files still have their
published bytes, including the Nitnem course SHA-256:

`5f9f877b37e2e0dba58076cdf6bfb5ec9201b2b5f02619d7b52821ec12d0e10c`.

The offline shell adds the verifier, taking the asset count from 56 to 57. Its release
ID is `0.14.1-claude-review-repairs-20261125-1`. A failed hash still prevents installation
of an incomplete update. The existing Sukhmani and Nitnem browser suites remain in CI.

## Claude's re-review assignment

Review the actual PR head independently before reading the builder's PASS reports.
Record the head SHA, the checks performed and the limits of the result. Use synthetic
learning only. Do not edit the original independent findings to match the implementation.

1. Reproduce the original R-01 corruptions in both repaired readers. In addition to
   altered transport bytes, inject altered source objects before initialization so
   SRI cannot hide a missing runtime check. Change text with a matching line hash,
   remove and reorder lines and units, and change Ang/source metadata. Confirm zero
   displayed scripture and no saved-learning writes after failure.
2. Hold WebCrypto pending, then release it. Confirm there is no early display or
   enabled reading control, and that genuine data subsequently opens correctly.
3. Reproduce R-02 with an unknown note, an unknown bookmark, a note longer than 12,000
   characters, and a legacy migration collision. Save a different ordinary note,
   change preferences, reload, export, restore, and import the same backup twice.
   Confirm every distinct original text remains reachable with no truncation.
4. Inspect hostile/malformed recovery input. Confirm raw malformed saved data remains
   byte-identical, exports for recovery, and never becomes executable HTML.
5. Inspect the actual accessibility tree for English and Punjabi meaning text in all
   three readers. The automatic tree test is evidence for the code change, not a
   replacement for the physical VoiceOver acceptance criterion.
6. Re-run the previous reading, offline, update, concurrent-writing and preservation
   gates on this exact head. Check that loading is not indefinitely stuck and that
   the new module is cached before offline reading is reported ready.
7. Verify the scope: no new bani, no scripture normalization, no source-edition change,
   no new analytics, account or outbound transfer of reflections.

Return a finding-by-finding verdict: **reproduced and fixed**, **partly fixed with a
named remaining criterion**, or **not fixed**, with reproducible evidence. Do not
promote a browser-emulation result to a physical-device result. Do not describe an
AI-to-AI review as qualified Sikh/Punjabi/santhiya approval.

Useful commands:

```sh
node tests/japji-retained-learning.mjs
node --test tests/source-integrity.mjs
node tests/source-integrity-browser.mjs
node tests/review-repairs-browser.mjs
node tests/nitnem-browser.mjs
node tests/sukhmani-browser.mjs
```

The complete automated command set is in `.github/workflows/reader-qa.yml`. The
browser tools are pinned to Playwright 1.62.1; CI supplies Chromium and Noto fonts.

## Remaining work explicitly outside this repair

- CI-R-03: Nitnem unknown-edition discovery and line migration. No Nitnem line IDs or
  editions change in this candidate. This must precede the Rehras/source restructuring.
- CI-R-04: a single library-wide backup.
- The 138 Dasam Bani differences are candidates for named-edition collation, not 138
  proven scripture errors. Claude corrected its initial Jaap 62 order finding; that
  order was already right. Its heading classification remains a later migration task.
- Source-edition decisions, qualified review, faithful rewriting of the flagged
  meanings, Punjabi study gaps, reader unification and learning-depth work remain open.
- A physical iPhone/Safari/VoiceOver session is still unperformed. The code fix for
  accessible names does not close the entire physical accessibility gate.
- No project licence is chosen here. No external organization is contacted.

This candidate is not merged or published merely because its automated tests pass.
Claude's re-review is the next independent step. The current family preview remains
at the existing public URL while that happens.
