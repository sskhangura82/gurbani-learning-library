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
| D-01 | 2 / 3 readers for notes (Nitnem, Japji); reading place in all 3 | Pass where tested — **except the Japji reading place, corrected 2026-11-26: see the last section (CI-R-11)** |
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

---

## Addendum after re-test RT-001 (25 November 2026)

The frozen test cases above are unchanged. Two things are added.

### Correction to the scripture rows

"3,809 / 3,809" is complete for the three readers. It is **not** every occurrence of
Gurbani in the app. Found and examined since
([`ADDENDUM_S-A1_GURBANI_OUTSIDE_THE_READERS.md`](ADDENDUM_S-A1_GURBANI_OUTSIDE_THE_READERS.md)):

| What | Examined / of | Kind | Result |
|---|---|---|---|
| Whole lines of Gurbani outside the readers | 31 / 31 | scripted, complete; one digital reference | 29 exact; 2 lines differ in three words (CI-S-16) |
| Gurmukhi quoted inside English teaching text | 1,889 / 1,889 | scripted, complete; 60 exceptions read one by one | No misquotation; 60 are labelled variants, dictionary headwords or grammar terms |
| Vocabulary headwords against their own passage | 1,508 / 1,508 | scripted, complete | 1,498 exact; 10 base forms or terms (CI-M-13) |
| Gurbani quoted inside Punjabi-language teaching text | 0 | — | **Not examined**: script alone cannot separate it from prose |
| Run-time check of the 31 lines when opened | 2 / 2 screens that show them from `js/content.js` | browser emulation | Fail on both versions (CI-R-07) |

### Re-test of candidate PR #40 at `09e829e`

Record: [`retests/RT-001_PR40_FIRST_REPAIRS.md`](retests/RT-001_PR40_FIRST_REPAIRS.md).
All in emulation. Device: none.

| Finding | Examined | Verdict |
|---|---|---|
| CI-R-01 | Original script: 13 variants across 3 readers. Wider: 21 alterations × 2 readers; offline copy damaged in 3 readers; late changes; WebKit engine, 4 situations × 2 readers | Reproduced and fixed |
| CI-R-02 | Original test; 8 kinds of unplaceable item; 10 kinds of unreadable record; backup, wipe, restore twice, 3 merges; 4 return situations for the notice; rollback and old tab | Partly fixed (RT1-01, CI-R-09) |
| CI-A-01 | 3,773 / 3,773 meaning buttons, name and role from the browser's accessibility tree; original scan on 21 screen states | Fixed in the browser; VoiceOver on a device not done |
| Regression | Update, 4 saved records, 3,809 / 3,809 rows on screen, 9 / 9 compositions offline, broken release, repair by later release | Pass |
| Builder's tests, run by this reviewer | 12 / 12 non-browser files; 2 / 2 browser suites (27 checks) | Pass |

A check on one of my own earlier statements: the first review listed "messages shown" with
a helper that could not tell drawn text from text clipped to one pixel. No finding rested
on it. Re-measured by size on screen: the Nitnem and Sukhmani warnings are real banners;
the Japji reader's are not visible (CI-R-09).

### Device-test preparation, 26 November 2026

Record: [`device-test/README.md`](device-test/README.md). All in emulation (Chromium,
phone-sized window). Device: none. WebKit engine: not available in this session.

| Examined | How much | Verdict |
|---|---|---|
| The Safari part of the iPhone script, rehearsed step by step | 14 / 14 steps, on the published version and on candidate PR #40 | 13 as written on both; step A7 differs (CI-R-11) |
| Japji reading place after reopening | 4 ways of reopening × 3 times each × 2 versions, as shipped and with the browser told not to restore scroll | Exact when opened afresh; moves back 301 pixels on every reload or Back, and is saved (CI-R-11). Exact in all four ways once the browser's own scroll restoring is off |
| Where a written note can be found again (Japji) | 1 note on an unsaved line; 1 note with no saved lines; export; return to the line — 2 versions | Not listed anywhere; kept, exported and shown at its line (CI-U-11) |

A correction to one of my own earlier verdicts. D-01 ("saved learning survives reload,
navigation between readers, and browser restart") was recorded as "pass where tested",
with the Japji reader's reading place included. Round 1 had seen the reader reopen about
three lines early and filed it as polish (CI-U-08); it did not reload a second time, and so
did not see that the wrong place is saved and the error repeats. For the Japji reading
place the D-01 verdict is withdrawn and replaced by CI-R-11. Notes and saved lines were
re-checked in this pass and do survive.

### Re-test of candidate PR #40 at `1470477`

Record: [`retests/RT-002_PR40_SECOND_REPAIRS.md`](retests/RT-002_PR40_SECOND_REPAIRS.md). Criteria:
[`retests/RT-002_FROZEN_CRITERIA_BEFORE_SECOND_REPAIRS.md`](retests/RT-002_FROZEN_CRITERIA_BEFORE_SECOND_REPAIRS.md).
All in emulation (Chromium). Device: none. WebKit engine: not available in this session.

| Finding | Examined | Verdict |
|---|---|---|
| RT1-01 | Rollback and old tab × 2 older versions (published, first candidate); all storage and what is shown; export, emptied browser, import; same backup × 3 and 3 more rounds; second record unreadable in 10 ways; writes refused in 3 situations | Fixed |
| CI-R-09 | Original scripts (9 moments, timeline, late tap); 36 combinations of width, mode, text size, guide; dismissal; accessibility tree; under the test banner at 3 widths | Fixed. Covered by the test banner 3 of 3 (staging, TC-01) |
| CI-R-11 | 4 ways of reopening × 3; 36 combinations of passage, mode, width, text size; 12 with the notice showing; storage writes in the first 3 seconds; the other two readers on both versions | Fixed. WebKit and iPhone not done |
| CI-U-11 | Original rehearsal; one note alone; both marks; order; tap; 200 notes; emptied note; network log | Partly fixed (tap does not open the note) |
| CI-R-08 | Damaged offline copy in 2 readers × 3 situations: refusal screen, export, storage; 10 + 10 damaged records; 21 alterations × 2 readers | Partly fixed (backup yes; recovery no) |
| CI-S-16 | Files holding the 31 lines: changed or not | Not attempted in this candidate |
| R2-X-04 | The round 2 steps, link opened directly | Not attempted; still reproduces |
| Regression | Data and teaching files; 3,809 / 3,809 rows on screen; 21 / 21 alterations × 2; 3,773 / 3,773 meaning names; update, offline, broken release, later release; RT-001 saved-learning set; network; storage names; offline list 57 / 57 | Pass |
| Builder's tests, run by this reviewer after my verdicts were committed | 12 / 12 non-browser suites; 2 / 2 repair browser suites (36 scenarios) | Pass |

Two corrections to my own work in this pass. The criteria file first said it was frozen before the candidate
existed; it was committed about ninety seconds after — before I knew of the candidate or had seen it — and the file
now says so. And one measurement in my notice script was confounded by my own scrolling; it was removed and the
question measured properly (0 of 12 overlaps).

