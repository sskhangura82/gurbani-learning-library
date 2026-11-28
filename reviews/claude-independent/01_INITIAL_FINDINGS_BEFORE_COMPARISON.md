# 01 · Initial findings, recorded before comparing with the builder's tests

**Reviewer:** Claude (Anthropic), independent second reviewer for GLP-001
**Version reviewed:** `main` @ `a3476ac4b9be90dde350fb35dd13ce0b672c120d` (see `00_BASELINE_AND_FROZEN_CRITERIA.md`)
**Recorded:** 2026-11-25

This file is step 5 of the review protocol: *record initial findings; only then compare with
the existing tests.* The commit that adds it is the proof of order. At the moment of this
commit I had **not opened** anything under `tests/`, any `evidence/*.json`, anything under
`docs/` or `research/`, the CI workflow, or any earlier review document. I had read the
README, the application's own HTML, CSS, JavaScript and data files (the things a browser
downloads), and GitHub's records for the release.

The full finding list is in [`FINDINGS_REGISTER.md`](FINDINGS_REGISTER.md) (55 entries:
17 high, 26 medium, 7 low, 5 "passed" notes; 7 of the high ones would become critical if a
print collation confirms them). This page records only what was examined and how much.

## What was actually examined

Kinds of evidence are kept apart. **Nothing below is physical-device testing.**

| Area | What I did | How much |
|---|---|---|
| Original Gurbani | Extracted every occurrence the app serves; recomputed hashes; Unicode and mark-order checks with a real text-shaping engine and four fonts; word-by-word collation against the Shabad OS Database v5 (SGPC Shabadaarth text for Sri Guru Granth Sahib; its Dasam Granth text for Dasam Bani); structure and verse-number sequences; page (Ang) references; rendered text against data in every reader and depth | **3,809 of 3,809** occurrences (3,773 lines + 36 prefaces/headings) for every scripted check. 11,319 rendered-line comparisons |
| Second witness for differences | Tried; only one line reached (Jaap 1.2: two web copies disagree with each other) | **1 of 140** differing occurrences — not done |
| Printed editions | None available to me | **0** — outstanding, needs qualified people |
| Meanings: scripted screens | Binding, emptiness, language, repetition, stale hashes, similarity to four published translations, misalignment, concept rendering, reporting voice, disclaimers | **3,773 of 3,773** line meanings; **610 of 610** studies |
| Meanings: read by me, line by line, English and Punjabi against the Gurmukhi | Japji 85/385 · Sukhmani 54/2,027 · Jaap 51/782 · Sohila 37/56 · Anand 16/208 · Chaupai 56/116 · Savaiye 16/40 · Rehras blocks 27/27 | **342 of 3,773** (9.1%). A sample, not an audit. I am an AI system, not a Sikh scholar; every observation needs qualified confirmation |
| First use and tasks | Simulated first-time reader at 390×664; tasks U-01…U-17 | All 17 tasks reached a verdict; simulated only, no real participants |
| Accessibility | axe-core 4.14.1 on every page and main state; measured contrast and target sizes; keyboard, focus, dialogs, 320 px reflow, reduced motion, font scaling | A-01…A-08 in emulation; A-09 (real screen reader) **not tested** |
| Offline, update, failed update | Service-worker flows with three served versions (good, updated, broken) | R-01…R-03 complete, Chromium only |
| Corrupted scripture data | Eight kinds of tampering for the Nitnem reader, four for Japji, two for Sukhmani | R-04 complete |
| Saved learning | Synthetic notes only: reload, export/wipe/import, merge, eleven hostile imports, two tabs, full storage, unknown line IDs, older edition IDs | D-01…D-07 complete; D-08 (Safari eviction) **not testable** |
| Privacy and security | Network logs of every flow; policies on all pages; repository scan for secrets and personal data; licences | PV-01…PV-07 complete |
| Live public site | Could not be reached from this environment | **Not verified** (CI-X-01) |
| Market research | Not started at the time of this commit | — |

## Headline observations at this point

1. **Sri Guru Granth Sahib text** (2,735 occurrences: Japji, Sukhmani, Anand, Sohila, the
   Rehras shabads): no letter differs from the reference database. That shows careful
   copying from one digital family, not confirmation against print (CI-S-12).
2. **Dasam Bani text** (1,074 occurrences): 140 differ at letter level (13.0%) — Jaap 36,
   Savaiye 12, Chaupai 50, the Rehras copy of Chaupai 40, Swaiya and Dohra 2. One heading
   order is reversed (CI-S-01); the same word is spelled two ways in adjacent verses
   (CI-S-02); opening lines are fused (CI-S-05). Savaiye and Chaupai come from a web text
   that is not named.
3. **Rehras** stores nine shabads as 23 run-on blocks with 105 missing spaces (CI-S-10).
4. **Two readers show altered Gurbani without warning** when their data is changed
   (CI-R-01); the third refuses. **The Japji reader can silently delete a note** (CI-R-02).
5. **Meanings divide in two.** Japji and Sukhmani (2,412 lines) read as careful and direct;
   I found no serious error in 139 lines read. The six Nitnem banis added in the latest
   release (1,361 lines) are uneven: many entries describe the verse from a distance, call
   Guru Sahib "the poet", soften strong lines, and attach medical-style disclaimers
   (CI-M-01, CI-M-02, CI-M-07).
6. **Screen-reader users cannot hear the meanings** in any reader (CI-A-01).
7. **What holds up well:** nothing leaves the device; offline works; a failed update does
   not damage the working version; the Nitnem reader's saved-learning handling is careful;
   counts and verse numbering are right; no copying from published translations.

## Evidence index

All under `reviews/claude-independent/evidence/`; scripts under `…/tools/`.

| File | What it holds |
|---|---|
| `baseline-sha256.txt` | Hash of all 229 files at the reviewed commit |
| `s02_s03_integrity.json`, `s04_shaping.json`, `s07_structure.json` | Hash, Unicode, shaping and structure results |
| `s05_register.csv` | **Coverage register for scripture:** one row per occurrence (3,809) with its collation status |
| `s05_differences.json`, `s05_summary.json` | Every individual difference (260 records) and totals |
| `s11_rendered.json` | Rendered text equals data, per reader and depth |
| `m_screens.json`, `m06_concepts.json`, `m07*_reporting_voice*.json`, `m_compare_summary.json` | Scripted meaning screens |
| `m05_manual_reading.json` | **Coverage register for meanings read by hand:** 342 rows with observations |
| `a01_axe.json`, `a02_contrast_targets.json`, `ua_remaining.json`, `u09_u15.json` | Accessibility and use |
| `r02_r03_update.json`, `r04_corrupt_package.json`, `r06_slow.json`, `d_tests_*.json` | Offline, update, tamper, speed, saved learning |
| `screenshots/` | Fourteen screens referred to by findings |

Not committed, on purpose: the working file that sets the app's meanings beside four
published translations (it contains other people's copyrighted text).

---

## Correction appended 2026-11-25, during the comparison step

This page is left as first written. One thing in it was wrong, and I found that out only
when I compared my findings with the builder's records:

- I reported that Jaap Sahib chhand 62 showed its heading and invocation in reversed order
  (then CI-S-01, "would be critical if confirmed"). **That was my mistake.** My extraction
  script listed headings before lines inside every unit; the reader draws chhand 62 in the
  order the data file asks for, which is the reference order. Checked on screen:
  `evidence/s09_jaap62_order.json`, `evidence/s11c_rendered_order.json`. I then verified
  that on-screen order equals collation order at every other position in all six Nitnem
  banis.
- Corrected totals: letter-level differences are **138** (not 140) of 3,809; Dasam Bani
  **138 of 1,074 (12.8%)**; Jaap Sahib **34 of 808** (not 36). `evidence/s05_*.{csv,json}`
  now hold the corrected run; the first run is in the previous commit.
- CI-S-01 is kept under the same ID with its severity lowered from high to low and its text
  rewritten; S0 candidates are now 6, not 7.

Details: `02_COMPARISON_WITH_BUILDER_TESTS.md`.
