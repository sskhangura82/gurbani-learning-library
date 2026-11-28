# Review tools

Everything here was written for the independent review. None of it is part of the app and
none of it changes app files.

## Scripted checks (no browser)

| Script | Test cases | Needs |
|---|---|---|
| `extract_corpus.py` | S-01 | the repository |
| `s02_s03_integrity.py` | S-02, S-03 | output of `extract_corpus.py` |
| `s04_shaping.py` | S-04 | `uharfbuzz`; Gurmukhi fonts |
| `s05_collate_shabados.py` | S-05, S-08 | `@shabados/database` 5.0.0-next.0 (`master.sqlite`) |
| `s07_structure.py` | S-07 | output of `extract_corpus.py` |
| `extract_teaching.py`, `m_screens.py` | M-01…M-04, M-06, M-09 | the repository |
| `m_compare_published.py` | M-02, originality | Shabad OS database. Its row-level output contains published translations and must not be committed |
| `build_findings.py` | — | writes `findings/findings.json` and `FINDINGS_REGISTER.md` |

## Browser checks (`browser/`)

Python Playwright with Chromium, iPhone 14 emulation unless a script says otherwise. They
expect the reviewed commit to be served at `http://127.0.0.1:8080/gurbani-learning-library/`
(`python3 -m http.server 8080` one directory above a clean checkout). `switch_server.py`
serves three prepared versions for the update tests. Paths inside the scripts point at the
reviewer's working folders; change `BASE`, `SITE` and output paths to run them elsewhere.

These are emulation results. They are not Safari, not an iPhone, and not VoiceOver.

| Script | Test cases |
|---|---|
| `firstuse_01…07`, `u03_resume.py`, `u_tasks_1.py`, `u09_u15.py`, `u15b.py`, `ua_remaining.py` | U-01…U-17, A-04, A-06, A-07 |
| `a01_axe.py`, `a02_contrast_targets.py` | A-01…A-03, A-05, A-08 (axe-core 4.14.1) |
| `s11_rendered_fidelity.py`, `s11b.py`, `shots_problem_text.py` | S-11 |
| `r02_r03_update.py`, `r02b.py`, `switch_server.py` | R-02, R-03, D-02 |
| `r04_corrupt_package.py`, `r04_shots.py` | R-04 |
| `r06_slow.py` | R-06 (lab profile; local server sends files uncompressed) |
| `d_tests_nitnem.py`, `d_tests_nitnem2.py`, `d_tests_japji_sukhmani.py` | D-01…D-07 (synthetic notes only) |

## Added during re-test RT-001 (25 November 2026)

| Script | What it checks | Needs |
|---|---|---|
| `sA1_gurbani_outside_readers.py` | Addendum S-A1, part A: the 31 whole-line occurrences of Gurbani outside the three readers, collated | repository; Shabad OS database; `app_corpus.json` |
| `sA1b_gurmukhi_quoted_in_english_teaching.py` | Part B: every Gurmukhi run quoted inside English teaching text | repository; outputs of the above |
| `sA1c_vocabulary_headwords.py` | Part C: every vocabulary headword against its own passage | repository; `app_corpus.json` |
| `sA1_shot_doubled_ha.py` | Screenshots for CI-S-16 | browser |

The re-test's own browser scripts are in `../retests/RT-001/tools/`. They expect the
published version at port 8080, candidate PR #40 at port 8082, and `switch_server.py` at
port 8090 serving prepared copies (`v1` published, `v5` candidate, `v6` the candidate under
a later release name, `v7` the candidate with one damaged file, `v8`/`v9` the candidate with
one word of scripture changed, without and with matching page tags). One script,
`rt6_webkit_engine.py`, runs under the system Python with WebKitGTK and a virtual display.

`switch_server.py` (both copies) no longer answers "not changed" by file date. The copy used
in the first review did. That does not affect the first review's update tests, which only
moved forward to newer files, but it would mislead any test that swaps back to an older
version — which is how the fault was found.
