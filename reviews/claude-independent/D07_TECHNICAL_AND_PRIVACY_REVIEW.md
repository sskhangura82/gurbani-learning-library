# D07 · Technical and privacy review

All tests on commit `a3476ac` served locally, in headless Chromium. Synthetic notes only;
no real reader's data was touched or looked for. Safari and iOS behaviour is untested.

## 1. What the app is

A static website (229 files) with no server logic, no account and no third-party code at
run time. A service worker stores 56 files for offline use and checks each file's hash when
it installs. Saved learning lives in the browser's local storage on the device.

There are **three separate reader programs**:

| Reader | Code | Scripture data | Checks data when it loads? | Saved-learning store |
|---|---|---|---|---|
| Japji Sahib | `js/japji-full.js`, `js/continuous-core.js` | script file `js/japji-full-data.js` | **No** (line count only) | `glp001.continuous.v2` and two older keys |
| Six Nitnem banis | `nitnem/reader.js`, `nitnem/local-learning.js` | fetched JSON, one per bani | **Yes** — file hash, every line hash, counts | six keys, one per bani and edition |
| Sukhmani Sahib | `js/sukhmani-reader.js` | script file `js/sukhmani-data.js` | **No** | `glp001.sukhmani.v1` |

`js/continuous-core.js` and `nitnem/continuous-core.js` are two copies of one file that
have already drifted (maximum text size 48 and 60).

## 2. Reliability and offline (R-01 … R-06)

| ID | Test | Result |
|---|---|---|
| R-01 | Every file a page needs is in the offline list with a matching hash | Pass: 56 of 56 |
| R-02 | A new version waits until the reader accepts it | Pass. Old page keeps working after reload; text typed but not yet saved is saved before the switch |
| R-03 | A broken update (one file fails its hash) | Pass. The working version stays complete, online and offline; notes and bookmarks intact |
| R-04 | Scripture data altered in transit | **Fail in two of three readers.** Nitnem reader refused all 8 variants (letter changed with or without a recomputed hash, line removed, duplicated, swapped, unit removed, file cut short, emptied). Japji showed an altered word in both word-change variants and, with a line removed, an empty reader with no explanation. Sukhmani showed an altered word and, separately, 2,026 lines instead of 2,027. No message in any of these (CI-R-01) |
| R-05 | Script errors; requests to other sites | 0 requests to any other site in every flow. One console error on home: a framing rule placed where browsers ignore it (CI-P-02) |
| R-06 | Weight and speed | Home 5 kB compressed. Nitnem shell 35 kB + Jaap 61 kB; first switch to Meaning fetches 503 kB. Japji 159 kB. **Sukhmani 625 kB (3.16 MB uncompressed) before the first line**, 24,600 page elements (CI-U-09). Whole offline package 7.17 MB (about 1.48 MB compressed) fetched in the background on first visit (CI-R-05). Lab timings in `evidence/r06_slow.json` were taken with an uncompressed local server and overstate real waits |

## 3. Saved learning (D-01 … D-08)

| ID | Test | Nitnem reader | Japji reader | Sukhmani reader |
|---|---|---|---|---|
| D-01 | Survives reload and navigation | Pass | Pass | Reading place: pass; a written note: n/t |
| D-02 | Survives an app update | Pass | n/t | n/t |
| D-03 | Hostile import files | Pass: 11 of 11 refused with clear messages; nothing overwritten; no script ran | Bad files refused and kept; markup in notes shown as text | Bad files refused and kept |
| D-04 | Merge on import | Pass: both notes kept under "Imported reflection"; no duplicates | n/t | n/t |
| D-05 | Two tabs | Pass: second tab is read-only | Pass [R, not re-run] | n/t |
| D-06 | Storage full | Pass: "Could not save. Your text is still here…" (the word "quota" leaks into one message) | n/t | n/t |
| D-07 | Export → wipe → import | Notes and bookmarks lossless; reading place and settings deliberately not restored | n/t | n/t |
| — | Note on a line ID the reader does not know | Saving pauses; no repair path in the app (CI-R-03) | **Note silently deleted** (CI-R-02) | Kept, with a message |
| — | Record under an older edition name not on the list | Not shown, not mentioned (CI-R-03) | n/a | n/a |
| D-08 | Safari clearing site data after seven days | **Not testable here.** Only the Japji information sheet tells readers to export before moving to the Home Screen (CI-R-04) | | |

"n/t" = not tested by me. The builder's Node tests cover parts of these [R]; I re-ran those
ten test files and all pass.

## 4. Privacy, security, licence (PV-01 … PV-07)

| ID | Test | Result |
|---|---|---|
| PV-01 | Network log of whole sessions | Pass: same-site requests only |
| PV-02 | Security policy on every page | Pass on 8 pages; the older `pauri-2-lesson.html` allows inline styles (CI-P-02) |
| PV-03 | Cookies, analytics, fingerprinting, remote fonts | None |
| PV-04 | Reader-written text never run as code | Pass, in code and in D-03 |
| PV-05 | Outgoing links | Marked and cannot reach back |
| PV-06 | Secrets or personal data in the repository | None found in 229 files |
| PV-07 | Licences | **Fail: the project has no licence.** Open Granth's MIT licence and notice are kept; BaniDB and SriGranth have no formal notice (CI-P-01) |

Smaller points: no referrer policy on most pages; the install description and
`robots.txt` are out of date; 28 draft pull requests (#4–#33) are open.

## 5. The builder's test suite, seen from outside

- Ten Node test files and two browser suites (Sukhmani, Nitnem) run in the quality gate;
  all Node files pass when I run them. **[V]**
- The Japji browser suites (`tests/reader-browser.js`, `tests/r7-browser.mjs`) and the
  offline and lifecycle suites exist but are not run by the gate. **[V]**
- No accessibility rule is tested anywhere. **[V]**
- Running the Node tests rewrites three tracked files under `evidence/` (new timestamps),
  so a plain test run leaves the repository modified. **[V]**
- The tests are strong on *preservation* (hashes, IDs, counts unchanged) and silent on
  *correctness* against anything outside the repository. **[I]**

## 6. Recommendations, in order

1. Give the Japji and Sukhmani readers the Nitnem reader's integrity check (CI-R-01).
2. Never delete or hide saved items the reader cannot place; show them in a "kept aside"
   list with export (CI-R-02, CI-R-03).
3. Build and test saved-learning migration **before** any scripture correction that
   changes a line ID. This is the hinge of the whole correction programme.
4. One reader program, one data shape, one saved-learning store, one backup file
   (CI-U-01, CI-R-04). Retire the duplicated core file (CI-R-05).
5. Add to the quality gate: the tamper test, the unknown-ID test, an automated
   accessibility scan, and the Japji browser suites.
6. Choose a licence (owner decision, CI-P-01).

## 7. Evidence

`evidence/r02_r03_update.json`, `r04_corrupt_package.json`, `r06_slow.json`,
`d_tests_nitnem.json`, `d_tests_nitnem2.json`, `d_tests_japji_sukhmani.json`,
`a01_axe.json`; screenshots `60_…`, `65_…`, `66_…`; scripts in `tools/browser/`.
