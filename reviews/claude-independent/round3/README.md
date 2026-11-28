# Round 3 of the independent review — index

**Reviewer:** Claude (AI system). **Date:** 26 November 2026. **Everything in a browser was desktop emulation.**
**Subject:** PR #45, the knowledge library pilot, at `8fa9206d9b4d6e90835972575458853b5d08247a`.

| File | What it is |
|---|---|
| `00_BASELINE_AND_FROZEN_CRITERIA_ROUND3.md` | The exact version inspected, the Salok boundaries taken from my own reference, and the criteria — written before any file of the pilot was opened |
| `01_INDEPENDENT_FINDINGS_ROUND3.md` | Findings, written before the builder's tests were opened |
| `02_COMPARISON_WITH_BUILDER_TESTS_ROUND3.md` | The two sets of tests side by side, written afterwards |
| `evidence/` | One result file per script; nine screenshots; one print file |
| `tools/` | Eight scripts and the shared list of 35 edits |

## Verdict in one place

**PASS** for the Gurbani (19 of 19 lines exact, three Saloks whole), for refusing damaged data (21 of 21),
for privacy, and for honesty about being a draft.
**NEEDS_REVISION** on nine points before anything is built on it (R3-01…09).
**INCOMPLETE** as a library, as it says itself.

22 entries: S1 0 · S2 9 · S3 12 · 1 observation.

| The nine | In one line |
|---|---|
| R3-01 | The name given to a Salok also fits another Salok on the same Ang |
| R3-02 | A line has no lasting name of its own |
| R3-03 | Gurbani and teaching share one file and one fingerprint |
| R3-04 | The library's own titles stand as the names of the Saloks |
| R3-05 | Search returns unrelated items by accident of letters |
| R3-06 | First-letter search fails the two commonest ways people use it |
| R3-07 | The Haumai lesson leaves out the turn of its own Salok |
| R3-08 | The Punjabi carries less than the English in 4 of 6 parts |
| R3-09 | No item has an address; the browser's Back leaves the library |

## Not done in this round

- No device, no Safari, no screen reader, no print on paper, no qualified reader, no native Punjabi reader, no learner.
- The pilot's "second digital witness" and its two reference links were not opened.
- The repair candidate (#40) has not changed since re-test RT-001; there was nothing to re-test. Its conditions stand.
- My own drafts (#44, #46) have not yet been cross-reviewed by the builder.

---

**Later outcome, 26 November 2026.** R3-01, R3-02, R3-03 and the titles part of R3-04 were repaired in candidate
PR #48 (`94f004a`, stacked on PR #45) and re-tested: **all four fixed**. Record:
[`../round3b/README.md`](../round3b/README.md). R3-05 to R3-09 and the lower findings remain open. The repairs are
on an unmerged candidate.

