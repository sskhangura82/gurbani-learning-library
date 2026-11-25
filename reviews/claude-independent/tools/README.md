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
