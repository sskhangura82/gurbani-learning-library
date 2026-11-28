# Meditation and guided breathing room — review candidate

Prepared 28 November 2026. This is a separate development candidate; it has not been merged or deployed. Steve retains release authority.

## What is built

The library’s Today page now has a direct entrance to **Meditation & breathing**. The room offers the existing Simran space, a visual breathing guide, and a short attention guide. Its appearance follows the library’s quiet ivory and jade palette, with readable text, explicit controls and no decorative sacred imagery.

The expanded breathing guide has three allowlisted patterns:

| Practice | Standard timing | Shorter comfort adaptation |
| --- | --- | --- |
| Even breathing | 5 seconds in, 5 out | 4 in, 4 out |
| Longer exhale | 4 seconds in, 6 out | 3 in, 4 out |
| Box breathing | 4 in, 4 hold, 4 out, 4 hold | 3 in, 3 hold, 3 out, 3 hold |

Even breathing without holds is the initial selection. Box breathing must be selected, its holds are explained before starting, and **Switch to no holds** stops the guide and selects even 4:4. The new selection starts only when requested. Shorter counts are explicitly described as adaptations, not the exact protocols studied.

An expanding circle guides the two-phase patterns. A marker follows a square for box breathing. Words identify every phase; the remaining seconds are visual only, while the phase label is a polite live region. The guide gives cues and does not measure the user’s breathing. No clinical or individual outcome is promised.

Start, Pause, Stop, Escape, a focus view and an option to keep the visual still are implemented. Pause asks the user to breathe naturally; restarting begins a fresh inhalation, never a partly completed hold. Pattern or pace changes stop the current guide. Hiding the page, leaving it, moving the guide completely offscreen, or an interrupted animation stops guidance. Returning does not restart it. Reduced-motion preference disables moving guidance while retaining the words.

The attention guide has separate **Breath** and **Surroundings** choices. Five original prompts advance only when the user chooses Continue; Back, End and Escape remain available. It has no timer or progress score. The prompts are labeled as a modern introduction, not a complete traditional practice or a treatment program.

The room and research guide identify Buddhist mindfulness of breathing, Classical Yoga, Sikh remembrance, and Stoic reflection separately. Named texts, translators and meaningful differences are given. No sacred words, recitation or Naam instructions are coupled to the physiological timer. The existing Simran page and its review status are preserved.

## Evidence and interpretation

The full research record is [MEDITATION_BREATHING_RESEARCH_20261128.md](MEDITATION_BREATHING_RESEARCH_20261128.md). The user-facing source guide is `practice-sources.html`.

The research includes the exact-pattern comparison by Marchant and colleagues (2025), the large active-comparison trial by Fincham and colleagues (2023), the exploratory breathing/mindfulness trial by Yilmaz Balban and colleagues (2023), the 2023 meta-analysis, and the newer box-breathing laboratory trial by McAllister and colleagues (2026). Positive and null findings appear together. Acute heart-rate variability, reported mood, stress reactivity and lasting benefit are not treated as interchangeable outcomes.

The 2026 study’s periodic prolonged-exhale maneuver is explicitly distinguished from continuous 4:6. The UI does not imply that study validates our 4:6 guide. Cyclic sighing, 4–7–8, alternate-nostril breathing and humming are recorded as distinct research topics; they are not silently enabled as additional exercises.

The source guide records the limits of the available evidence. It does not label these practices “scientifically proven,” prescribe a personal resonance rate, or promise nervous-system resets, cures or superior outcomes. The exact app has not been clinically validated.

## Scope and preservation

- Branch: `feature/meditation-breathing-room-20261128`.
- Base: `cfded3e2186c1f6e325d135f1fa62da1f03d34bb`, the learning candidate on `feature/gurbani-learning-next-20261127` / PR #76.
- PR #78’s audio review branch remains at `dee066bf1e89bc3f0e0f88a52ceaae3c11b5dcfb`; this work is isolated from it.
- Five existing application paths change: the Today entrance and the four breathing files. Four new application files provide the meditation room, its CSS/controller, and the source guide.
- The generated worker adds exactly those four new assets, updates the changed asset hashes and uses a fresh cache version. Worker behavior outside its version/manifest remains byte-identical.
- In the frozen application inventory, 360 of 366 prior files remain byte-identical. The other six are the five declared paths and generated worker. Four application files are added.
- Scripture, meanings, study lessons, saved-learning code, private collections, the library catalog/bundle and existing Simran files remain byte-identical.

`evidence/meditation-breathing-room/change-scope.json` records exact before/after hashes and additions. The older preservation chains receive prior bytes only after that complete amendment is checked. Their earlier manifests were not rewritten. Negative tests reject an altered current file, an expanded whitelist, worker behavior changes, a missing old asset, and reuse of the cache version.

## Verification completed

| Check | Result | Evidence |
| --- | --- | --- |
| Timing, preservation, script-integrity and workflow contracts | 53 passed | `evidence/meditation-breathing-room/node-contracts.log` |
| Worker simulation | 9 passed | `evidence/meditation-breathing-room/service-worker.log` |
| Breathing browser scenarios | 36 passed | `evidence/breathing/report.json` |
| Meditation browser scenarios | 14 passed | `evidence/meditation-room/report.json` |
| Real worker / offline navigation | 8 passed | `evidence/learning-practice/offline.json` |
| Script pins | 26 pages, 62 pins; check mode passes | `node tools/refresh-app-sri.mjs --check` |
| Existing bundle reproducibility | Five bundles, 32 inputs; unchanged | `node tools/build-app-bundles.mjs --check` |

The desktop browser was Chromium 158.0.8127.0. Tests serve the application files with their actual integrity pins. Narrow viewport tests are emulation, not physical iPhone testing. A separate interactive preview inspection exercised the real room entrance, breathing selection, focus view, pause, and manual attention prompts.

The breathing report records 34 interactive privacy audits with zero storage access, IndexedDB opens, application fetches, beacons or cookies. It records no external/failed requests or runtime errors. The room scripts contain no narration, audio, analytics or session persistence. Browser history and the existing public asset cache are separate from an application practice history.

The offline test installs and verifies every byte of the 125-asset shell, then disables networking. Breathing, the manual attention guide, the source summaries and existing Simran navigation work through the real service worker. External research papers still require a connection. The offline test compares local storage before and after the practice navigation.

### Defects found and corrected during this build

1. **Short phone screen:** the initial box layout placed Stop below a 320 × 568 viewport. On narrow screens, Start now brings the cue and adjacent controls into view together. Tests measure and hit-test both Stop and Switch to no holds in normal/focus views at 320 × 568 and 390 × 844. The initial failure is retained in `evidence/meditation-breathing-room/short-screen-before.json`.
2. **Hidden accessibility description:** the initial Start button referenced the box warning even for no-hold patterns. The description now includes that warning only for box breathing. A regression reads Chromium’s actual accessibility tree for default even, longer exhale, box and the no-hold escape; the resolved descriptions are retained in the report.
3. **Small-screen heading spacing:** hiding a line break joined two words in the attention heading. The source now contains the separating space at either layout.

### Reproduce focused checks

```sh
node --test tests/breathing-core.mjs tests/meditation-preservation.mjs tests/gurbani-learning-inputs.mjs tests/library-script-integrity-inputs.mjs tests/library-script-integrity.mjs tests/qa-workflow-coverage.mjs
node tests/service-worker.mjs
node tools/refresh-app-sri.mjs --check
node tools/build-app-bundles.mjs --check
CHROMIUM_PATH=/path/to/chromium node tests/breathing-browser.mjs
CHROMIUM_PATH=/path/to/chromium node tests/meditation-room.mjs
CHROMIUM_PATH=/path/to/chromium node tests/learning-practice-offline.mjs
```

The existing focused CI workflow now includes the new contracts and meditation browser test. GitHub execution is recorded separately from these local results.

## Independent review and remaining work

Review this as an initial room foundation. An independent source/copy audit found the accessibility-description problem above and no additional evidence-fidelity or authenticity blocker in the examined candidate; that audit is not clinical validation or specialist religious approval.

The remaining acceptance work is physical iPhone/Safari behavior, real screen-reader phase-announcement timing, practical comfort/usability feedback, and qualified review of any fuller traditional teaching. The English introductory copy has not been presented as a reviewed Punjabi course. No audio guidance, individual physiological measurement, clinical outcomes or full traditional curriculum is claimed.

Future expansion should add complete, individually researched practice modules with source records, precise instruction, accessible controls and honest outcome limits. The next content candidates are cyclic sighing, natural-breath meditation depth, and carefully reviewed alternate-nostril/humming instruction; their research records already identify the gaps. More techniques should not erase the simple default or create pressure to hold longer, breathe deeper or complete a streak.

No merge, deployment, review request, medical claim approval or production acceptance is implied by this handoff.
