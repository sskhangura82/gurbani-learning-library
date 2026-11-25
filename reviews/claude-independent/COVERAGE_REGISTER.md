# Coverage register

Every test case frozen in `00_BASELINE_AND_FROZEN_CRITERIA.md`, with how much was actually
examined. "Complete" is used only where numerator equals denominator. A sample is called a
sample. Emulation is called emulation.

**73 test cases · 70 reached a verdict · 3 did not (S-06, A-09, D-08).**

Row-level registers: scripture — `evidence/s05_register.csv` (3,809 rows); meanings read by
hand — `evidence/m05_manual_reading.json` (342 rows); findings — `findings/findings.json`.

## Scripture

| ID | Examined / of | Kind | Verdict |
|---|---|---|---|
| S-01 | 3,809 / 3,809 occurrences | scripted, complete | Pass |
| S-02 | 3,809 / 3,809 | scripted, complete | Pass |
| S-03 | 3,809 / 3,809 | scripted, complete | Pass with note (26 lines; CI-S-14) |
| S-04 | 5,222 / 5,222 distinct words × 4 fonts | scripted, complete; not Apple's engine | Fail (CI-S-02); CI-S-13 to check on device |
| S-05 | 3,809 / 3,809 | scripted, complete; one digital reference | Done: 138 letter-level differences, all in Dasam Bani |
| S-06 | 1 / 138 differences | — | **No verdict** |
| S-07 | 9 / 9 compositions | scripted, complete | Pass |
| S-08 | 2,733 / 2,733 page references | scripted, complete | Pass |
| S-09 | 9 / 9 compositions | scripted + on screen | Fail (CI-S-05, CI-S-10; CI-S-01 low) |
| S-10 | 2 / 2 boundaries | reading + SGPC Rehat Maryada as cited by the builder [R] | Partial (CI-S-09) |
| S-11 | 11,319 / 11,319 line renderings; 1,397 / 1,397 Nitnem rows for order | browser emulation, complete | Pass |
| S-12 | 9 / 9 compositions | reading | Fail (CI-S-12, CI-X-03) |
| — | 0 / 3,809 against print | — | **Outstanding** |

## Meanings and teaching

| ID | Examined / of | Kind | Verdict |
|---|---|---|---|
| M-01 | 3,773 / 3,773 | scripted, complete | Pass |
| M-02 | 3,748 / 3,773 scripted; 342 / 3,773 read | scripted + sample | Pass |
| M-03 | 3,773 lines + 610 studies | scripted, complete | Fail, minor (CI-M-08, CI-M-11) |
| M-04 | 3,773 / 3,773 | scripted, complete | Reported; acceptable |
| M-05 | **342 / 3,773 (9.1%)** | **sample, read by an AI reviewer** | Mixed: sound for Japji and Sukhmani; problems in the Nitnem set (CI-M-01, 02, 04, 05) |
| M-06 | all occurrences of 17 terms | scripted, complete | Fail (CI-M-06) |
| M-07 | all screen types | reading + browser | Partial (CI-M-09, CI-M-01) |
| M-08 | Sukhmani vocabulary | reading | Partial (CI-M-11) |
| M-09 | 610 / 610 studies; 259 / 259 page citations | scripted, complete | Citations pass; depth and Punjabi fail (CI-M-10, CI-E-01) |
| M-10 | 1,361 line notes + 610 studies | scripted, complete | Fail (CI-M-07) |
| — | 0 / 3,773 by a qualified person | — | **Outstanding** |

## Learning design

| ID | Examined / of | Kind | Verdict |
|---|---|---|---|
| E-01 | 9 / 9 compositions × 6 levels | reading | Three levels thin or absent (CI-E-01) |
| E-02 | 610 / 610 studies | scripted | Absent as a word layer |
| E-03 | 3 / 3 readers | browser | Absent (CI-E-02) |
| E-04 | all code and screens | search + browser | Pass: none found |

## Use (simulated; emulation only)

U-01 … U-17: 17 / 17 run. 6 pass, 10 partial, 1 fail. Table in D06 §2. Real participants: **0**.

## Accessibility (emulation only)

| ID | Examined / of | Verdict |
|---|---|---|
| A-01 | every page and main state, light and dark | Fail (CI-A-01, CI-A-02) |
| A-02 | all text styles measured | Pass with two exceptions (CI-A-03) |
| A-03 | all controls measured | Pass with exceptions (CI-A-03) |
| A-04 | 4 pages, 3 dialogs | Pass |
| A-05 | all Gurmukhi runs | Pass |
| A-06 | 10 pages + 6 depth states at 320 px | Pass; fixed pixel sizes noted (CI-U-05) |
| A-07 | 3 readers | Pass |
| A-08 | all custom controls | Fail (same cause as A-01) |
| A-09 | 0 real screen readers | **No verdict** (CI-A-05) |

## Reliability and saved learning (Chromium only; synthetic notes)

| ID | Examined / of | Verdict |
|---|---|---|
| R-01 | 56 / 56 offline entries | Pass |
| R-02 | 1 legitimate update | Pass |
| R-03 | 1 broken update | Pass |
| R-04 | 8 + 3 + 2 tamper variants across 3 readers | Fail in 2 of 3 readers (CI-R-01) |
| R-05 | every flow run | Pass (one ignored-policy console error) |
| R-06 | 4 pages, 2 lab profiles | Reported (CI-U-09); local server uncompressed |
| D-01 | 2 / 3 readers for notes (Nitnem, Japji); reading place in all 3 | Pass where tested |
| D-02 | 1 / 3 readers (Nitnem) | Pass for Nitnem; others not tested by me |
| D-03 | 11 hostile files (Nitnem); damaged records (Japji, Sukhmani) | Pass |
| D-04 | Nitnem | Pass |
| D-05 | Nitnem | Pass |
| D-06 | Nitnem | Pass |
| D-07 | Nitnem | Pass for notes and bookmarks |
| D-08 | 0 — needs Safari on a device | **No verdict** (CI-R-04) |
| extra | unknown line IDs, older edition names, 3 readers | Fail (CI-R-02, CI-R-03) |

## Privacy, integrity, licence

PV-01 … PV-07: 7 / 7. Pass except PV-02 (one legacy page) and PV-07 (no licence; CI-P-01).

## Market research

Apps installed and used: **0**. Repositories or data handled directly: 11 repositories
read (README, licence, last change), 1 database used in full. Public documents: extracts
returned by web search for 2 store listings and 8 project or press pages; no page was
opened in full. Everything else in D04 and D05 is marked as unverified prior knowledge.

## Comparison with the builder's work

Read after my findings were committed (`1246fb4`): 30 test files (inventory and targeted
reading), 69 evidence files (inventory; 6 read), 27 documents (2 in full, the rest
searched), 16 research files (7 read). Builder's ten Node test files re-run: 10 / 10 pass.
