# Round 2 of the independent review — index

**Reviewer:** Claude (AI system). **Dates:** 25–26 November 2026. **Everything in a browser was desktop emulation.**

| File | What it is |
|---|---|
| `00_BASELINE_AND_FROZEN_CRITERIA_ROUND2.md` | The exact versions inspected and the criteria, written before any code or test of #41 or #43 was opened |
| `01_INDEPENDENT_FINDINGS_ROUND2.md` | Findings on #43, #41, #42 and the Salok Mahalla 9 draft, written before the builder's tests were opened |
| `02_COMPARISON_WITH_BUILDER_TESTS.md` | The two sets of tests side by side, written afterwards |
| `03_BUILD_ORDER_CORRECTIONS.md` | Corrections to the plan in #42, with an exit test for every phase |
| `evidence/` | One result file per script; the source retrieval log; two print PDFs; 13 screenshots |
| `tools/` | The six scripts |

## Verdicts in one place

| Pull request | Verdict | Findings |
|---|---|---|
| #43 Daily Hukamnama reader | PASS as a development fixture · NEEDS_REVISION on four points · INCOMPLETE as a daily reader | R2-H-01…09 |
| #41 Explorer and Ashtpadi 17 | Gurbani PASS · teaching, sources and finder NEEDS_REVISION · human review and devices INCOMPLETE | R2-X-01…10 |
| #42 Build order | Sound · NEEDS_REVISION in four places | R2-P-01…04 |
| #40 First repairs | Unchanged since RT-001; its four asks stand; one more for the same reader (R2-X-04) | — |
| Salok Mahalla 9 draft | Recovered; one S1 problem before any use | R2-K-01 |

24 findings: S1 1 · S2 14 · S3 8 · 1 observation in the builder's favour.

## Drafts I wrote in this round — for the builder to cross-review, not for me to approve

| Pull request | What |
|---|---|
| #44 | Three-level lesson, English and Punjabi, for the Shabad at Ang 504–505. 19 of 19 occurrences. Stacked on #43. |
| #46 | Recording provenance and permission register (12 candidates, 0 cleared), three permission requests **not sent**, and the one-recording proof design. |

## Not done in this round

- **#45** (the builder's knowledge registry) appeared at `8fa9206` while this round was being written. Not opened, not reviewed. Criteria first, next round.
- **Work order item E** — trials of the daily source, the controlled publisher and its cache, the plan for covering all 1,430 Angs. I wrote the exit tests and risks for these (`03`), not the things themselves.
- **Three SGPC article pages** named in the Hukamnama data were not opened. My tool needs the owner's approval on screen to open an address that neither the owner nor a search supplied, and nobody was there to give it.
- No device, no Safari, no screen reader, no qualified human review of any text. As before.
