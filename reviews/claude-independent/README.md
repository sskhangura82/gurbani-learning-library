# Independent review by Claude — GLP-001

Second-reviewer work on the Gurbani Learning Library at commit
`a3476ac4b9be90dde350fb35dd13ce0b672c120d` (release PR #37). **This folder adds review
files only. No application file is changed.**

Start with [`D01_EXECUTIVE_ASSESSMENT.md`](D01_EXECUTIVE_ASSESSMENT.md).

**Since the review (25 November 2026):** the builder offered a first repair candidate
(PR #40) and asked for an independent re-test. The result is in
[`retests/RT-001_PR40_FIRST_REPAIRS.md`](retests/RT-001_PR40_FIRST_REPAIRS.md). While doing
it I found a gap in my own scripture audit and closed it:
[`ADDENDUM_S-A1_GURBANI_OUTSIDE_THE_READERS.md`](ADDENDUM_S-A1_GURBANI_OUTSIDE_THE_READERS.md).
The twelve deliverables below describe the published version and are unchanged except for
dated notes.

## Order of work (the commits prove it)

| Step | File | Commit |
|---|---|---|
| Pin the version; freeze criteria before testing | [`00_BASELINE_AND_FROZEN_CRITERIA.md`](00_BASELINE_AND_FROZEN_CRITERIA.md) | `5e19b7a` |
| Record findings before opening the builder's tests | [`01_INITIAL_FINDINGS_BEFORE_COMPARISON.md`](01_INITIAL_FINDINGS_BEFORE_COMPARISON.md) | `1246fb4` |
| Compare; correct my own error | [`02_COMPARISON_WITH_BUILDER_TESTS.md`](02_COMPARISON_WITH_BUILDER_TESTS.md) | `c90f708` |
| Deliverables | `D01` … `D12` | `ffd3d17` |
| Re-test of candidate PR #40; scripture addendum S-A1 | [`retests/`](retests/RT-001_PR40_FIRST_REPAIRS.md), [`ADDENDUM_S-A1…`](ADDENDUM_S-A1_GURBANI_OUTSIDE_THE_READERS.md) | this commit |

## Deliverables

1. [Executive assessment](D01_EXECUTIVE_ASSESSMENT.md)
2. [Gurbani source audit](D02_GURBANI_SOURCE_AUDIT.md) · [packet for scholars](scholar-packet/DASAM_BANI_DIFFERENCES_FOR_PRINT_COLLATION.md)
3. [Translation and teaching audit](D03_TRANSLATION_AND_TEACHING_AUDIT.md)
4. [Market research report — first pass](D04_MARKET_RESEARCH_REPORT.md)
5. [Competitive feature matrix — first pass](D05_COMPETITIVE_FEATURE_MATRIX.md)
6. [UX and accessibility audit](D06_UX_AND_ACCESSIBILITY_AUDIT.md)
7. [Technical and privacy review](D07_TECHNICAL_AND_PRIVACY_REVIEW.md)
8. [Learning architecture blueprint](D08_LEARNING_ARCHITECTURE_BLUEPRINT.md)
9. [Product excellence scorecard](D09_PRODUCT_EXCELLENCE_SCORECARD.md)
10. [Prioritized improvement backlog](D10_PRIORITIZED_IMPROVEMENT_BACKLOG.md)
11. [Implementation plan](D11_IMPLEMENTATION_PLAN.md)
12. [Final reviewer verdict](D12_FINAL_REVIEWER_VERDICT.md)

Registers: [findings](FINDINGS_REGISTER.md) (66 entries: 58 from the review, 6 found in
re-test RT-001, 2 found on 26 November 2026 while preparing the device test) · [coverage](COVERAGE_REGISTER.md) · scripture row by row
`evidence/s05_register.csv` (3,809 rows inside the readers) and `evidence/sA1_register.csv`
(31 rows outside them) · meanings read by hand `evidence/m05_manual_reading.json`.

Re-tests: [`retests/RT-001_PR40_FIRST_REPAIRS.md`](retests/RT-001_PR40_FIRST_REPAIRS.md) —
verdicts on CI-R-01, CI-R-02 and CI-A-01 for candidate PR #40. Defects that exist only in
an unmerged candidate are kept there (`retests/RT-001/candidate_findings.json`), not in the
main register.

Later work, each with its own index: [`round2/`](round2/README.md) (PRs #41–#43) ·
[`round3/`](round3/README.md) (PR #45) · `consolidated/` (assessment and roadmap, scripture
discrepancy register, replies to the builder, and — newest —
[the reconciliation after the owner's update of 26 November](consolidated/RECONCILIATION_AFTER_OWNER_UPDATE_20261126.md))
· [`device-test/`](device-test/README.md) (the iPhone script, prepared and **not yet run**;
the test copy checked against its source; two findings from the rehearsal, CI-R-11 and
CI-U-11) · [`retests/RT-002_FROZEN_CRITERIA…`](retests/RT-002_FROZEN_CRITERIA_BEFORE_SECOND_REPAIRS.md)
(criteria for the second re-test of PR #40) · [`retests/RT-002_PR40_SECOND_REPAIRS.md`](retests/RT-002_PR40_SECOND_REPAIRS.md)
(**the second re-test, PR #40 at `1470477`: three repairs fixed, two partly, two not attempted;
nothing broken; fit to stage for the phone check once the test banner is off the reader**).

## Reading the evidence labels

**[V]** verified in this review · **[R]** reported by the builder, not re-verified ·
**[I]** interpretation · **[A]** assumption · **[Q]** open question · **[REC]**
recommendation.

## Limits, stated once

- The reviewer is an AI system: not a Sikh scholar, not a lawyer.
- All app testing was in headless Chromium with phone emulation. No Safari, no iPhone, no
  VoiceOver. (Re-test RT-001 added one run in the WebKit engine on Linux — the engine
  family Safari is built on, but not Safari and not a device.)
- No printed saroop, Dasam Granth or gutka was available.
- No real person took part in any usability task. Personas are simulations.
- No other app was installed or used.
- Only made-up notes were used. No reader's private data was sought or touched.

## Regenerating

```
python3 -I reviews/claude-independent/tools/build_findings.py      # findings.json, FINDINGS_REGISTER.md
python3 -I reviews/claude-independent/tools/render_generated.py    # scholar packet, D09, D10
```

See [`tools/README.md`](tools/README.md) for the test scripts.
