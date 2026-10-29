# Full Nitnem V15 candidate — Jaap Sahib Chhands 91–105

**Date:** October 28, 2026 Pacific. Final QA completed October 29, 2026 at 00:59 UTC (October 28 at 5:59 p.m. PDT).

**Status: TESTED CANDIDATE — NOT DEPLOYED.** The existing phone preview was not changed in this session. The initial desktop execution call was blocked before running, and that restriction was not bypassed. V14 is the last verified live release from the preceding session; this session did not establish a fresh live-host status.

## Exact source and evidence

Repository: `sskhangura82/gurbani-learning-library`.

Branch: `feature/glp-jaap-91-105-candidate-20261028`.

Tested application/build commit: `37045701d347923a72d2c621622dd79a490684ed`.

Preserved V14 baseline: `2f50e75732af3b8625a68ed897341d42d9a36f3c`.

[GitHub Actions run 40797602615](https://github.com/sskhangura82/gurbani-learning-library/actions/runs/40797602615) passed on the exact tested commit. This workflow has read-only repository permission and performs no deployment.

Artifact ID: `12864462279`. Artifact name: `glp-nitnem-v15-candidate-37045701d347923a72d2c621622dd79a490684ed`. GitHub retention expires November 12, 2026. A copy was downloaded into the conversation as `Full_Nitnem_V15_Candidate_91-105.zip`.

ZIP SHA-256: `7fb85fbb2a6efc1d13e60e4ae7ceab4bf05bb9fd0fe68a87e0f98280bfcf578d`.

Course V15 SHA-256: `f9c1148a943f0530c9df39be5d3875f930109817468d23f44ab5391e6a8b87d8`.

The downloaded ZIP hash and all 46 package asset hashes were independently recomputed after download. No font files are included.

## Teaching increment and coverage

The candidate adds 60 covered source occurrences and 15 deeper Study lessons for Jaap Sahib Chhands 91–105. There are 59 new main bilingual explanation entries plus one exact reuse of the earlier main explanation for the repeated line at 91.04, from 87.01. These are occurrence-coverage counts, not counts of unique translations. The newly covered repeated friend lines at 99.02 and 101.02 also use identical main wording.

All fifteen chhands contain four frozen source records. Metrical headings at 94, 96, 99 and 103 remain separate and receive no extra line-count credit.

| Coverage | V14 baseline | V15 candidate |
| --- | ---: | ---: |
| Jaap explained source records | 346/782 | 406/782 |
| Jaap Study drafts | 90/199 | 105/199 |
| Six additional banis: explained source records | 919/1,361 | 979/1,361 |
| Six additional banis: Study drafts | 217/327 | 232/327 |

All 919 previous explanation objects, 217 previous Study objects and fourteen previous course snapshots are preserved exactly. Original Gurmukhi, occurrence IDs, hashes, line grouping, source flags and the editorial/reuse history remain unchanged. The candidate uses the existing Read, Meaning and Study renderer. Silent visual pace remains available to 200.

Anand Pauri 24 remains fully withheld: its six teaching entries and Study lesson are absent. The disputed original text is not silently corrected. Jaap 106 onward remains pending.

Research sources, selected readings and genuine alternatives are recorded in `tools/nitnem/jaap-chhands91-105-research.mjs`. Topics include elemental-body language, radiance, generosity, the limits of names, creation and dissolution, universal scope, freedom from rivalry, dharam and adornment. Difficult interpretations remain explicitly provisional. No qualified Sikh/Punjabi, santhiya or independent-model review is claimed. All teaching remains `DRAFT_AI_UNREVIEWED`, with zero qualified human reviews and no public-publication clearance.

## Light/Dark scroll-jump defect fixed in the candidate

A stronger browser test revealed a real reader bug. The selector `[data-mode]` included the page BODY as well as the Read/Meaning/Study buttons. The BODY therefore received a mode-switch click listener, and unrelated clicks that bubbled to it could re-render the passage and scroll the reader. A real pointer click on Light reproduced a 220-pixel jump while the saved reading index stayed unchanged.

The generated candidate restricts both mode-control selectors to `button[data-mode]`. This is a two-occurrence JavaScript change, separate from the new course path and hash. It does not change the appearance controller, header, CSS or saved-learning storage modules.

The final pointer-driven regression passed: before and after changing theme, scrollY stayed at 109306, the reading index stayed at 346, and the visible source anchor stayed at 304.96875 pixels from the viewport top. The final Light and Dark screenshots show the same passage at the same position. This checks settled manual scrolling; rapid-switch race coverage is not claimed.

## Verification

The exact final commit passed 14 candidate contract checks and 21 real isolated Chrome checks, including source identity, all new bilingual notes and Study lessons, the actual teaching renderer, wrong-hash rejection, Gurmukhi glyph rendering, 390-pixel and 320-pixel layouts, sticky controls, pointer theme switching, saved synthetic reflection/bookmark preservation, reload and pace 200. No browser runtime exceptions occurred and application requests stayed on the isolated loopback test server.

Gurmukhi font availability was initially missing in the disposable Linux QA environment. Ubuntu's `fonts-noto-core` was installed in that runner only, and Chrome's platform-font inspection confirmed that real Gurmukhi fonts supplied the scripture and Punjabi explanation glyphs. Fonts were not added to the candidate package. Both final screenshots were visually inspected after download.

Baseline appearance, original Japji, shared-learning and worker regressions also passed. The existing 603-check V14 gateway suite passed as a baseline regression only: it is NOT evidence of a V15 gateway integration, authenticated HTTPS delivery or deployment.

Evidence in the artifact includes `evidence/build.json`, `contract.json`, `ci-receipt.json`, `glp-nitnem-v15-browser.json`, `rendered-fonts.json`, `theme-position.json` and the Light/Dark screenshots. The workflow also confirmed that tracked application-source files remained unchanged.

Physical iPhone, Safari, VoiceOver, real offline operation, live private-gateway integration and live HTTPS acceptance remain unverified for V15. Synthetic browser learning is not the user's real saved learning. The local browser diagnostic environment also rejected a localhost navigation; that restriction was not bypassed.

## Reproduction and release boundary

The branch's tracked `nitnem/` runtime remains the V14 baseline. **Do not deploy the raw tracked directory as V15.** The builder generates the V15 course and patched runtime into a new output package:

```sh
node tools/nitnem/build-nitnem-v15-candidate.mjs --out /absolute/new/output-directory
node tests/nitnem-v15-candidate.mjs --out /absolute/new/output-directory
node tests/nitnem-v15-browser-candidate.mjs --out /absolute/new/output-directory
```

The output directory must not already exist. Its `site/` contains 46 assets; the versioned worker caches 45. The browser test needs installed Chrome/Chromium and Gurmukhi fonts; it never accesses an existing user profile. No invitation, cookie or private authentication configuration is included in this artifact.

The remaining release work is to obtain working authorized host execution, reconcile current live state, preserve the active snapshot, stage the exact generated package through the existing private gateway with pinned hashes, verify backward compatibility and authenticated delivery, and retain rollback. Do not weaken authentication, bypass execution restrictions, change the audience, silently update originals or claim activation before those checks pass. None of those live-release steps was performed here.

Next content batch: Jaap Sahib Chhands 106–120. Candidate content remaining across the six additional banis: 382 records and 95 Study lessons, including the held Anand24 section. Completion of draft coverage is distinct from qualified review and release readiness.
