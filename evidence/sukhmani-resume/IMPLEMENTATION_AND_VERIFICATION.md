# Sukhmani resume: bounded builder repair

Date: 27 November 2026 UTC. This is builder evidence, not independent approval or a release decision.

## Scope

Built from frozen PR56 (`389e79baff4016a2ff61d1851908de0bd66beb8f`) in the isolated `reader-reliability` worktree. The separate PR47 linked-visit repair is not included and is not claimed to be closed by this work. No scripture, teaching, learning schema, storage key or saved-record migration was changed. No real notes or personal browser profiles were accessed.

Owned application file: `js/sukhmani-reader.js`. Owned tests: the new `tests/sukhmani-resume-browser.mjs` and two reload expectations in `tests/sukhmani-browser.mjs`. The parent builder owns the script pins, offline manifest and broader integration gates.

## Demonstrated mechanism

`FINDINGS_AND_PROPOSAL.md`, `pr56-resume-event-sequence.json`, and `runs/2026-11-27T01-37-28-660Z/report.json` retain the read-only investigation. Exact observed review-code identity is in `observed-code-identity.json`.

1. The original Resume action aligned the selected source occurrence before hiding an in-flow notice. Hiding that notice moved the selected row from about 34 pixels below the viewport top to about -103 pixels, with its next row at the reading anchor. Storage alone could still appear correct while the text had moved offscreen.
2. A capture timer already queued before Resume was not cancelled. In the original UI-created reflection/bookmark sequence, immediate storage checks saw line 2; the old callback later saved line 3. The recorded PR56 trace places that bad write after the original assertion point. This explains a concrete failure mechanism; it does not claim to reproduce the historical CI scheduler exactly.
3. Native reload restoration retained the old absolute scroll offset while the newly inserted notice changed the layout. The saved occurrence was consequently replaced by an earlier occurrence after the debounce. The displacement is geometry-dependent, not a universal one-line offset.

The frozen PR47 implementation still exhibits the ordinary Resume/reload geometry defect. It addresses a different linked-visit concern.

## Repair

- Remove the notice before aligning an explicit chosen occurrence.
- Cancel queued scroll capture when repositioning, guard both scheduling and execution, and use a generation token so an earlier animation-frame release cannot unlock a newer transition.
- For reload and cold history traversal, restore the saved occurrence after page-show, font readiness and layout frames. Restoration itself does not write the learning record or alter the guide position.
- Retain optional Resume for a fresh visit. Preserve the existing Saved-list entry intent and leave explicit fragment visits to their existing behavior.
- Cancel a pending initial restore when the reader makes an explicit reading action. Also cancel on wheel, touch outside the reading dock, and non-control scroll keys, so delayed layout cannot override deliberate movement.
- Keep the ordinary scroll listener general after initialization; it does not require wheel or touch evidence. Native `history.scrollRestoration` is unchanged. Genuine BFCache restoration retains its live document and viewport.

Final runtime fingerprint: `2deaff782567dd7d57bd2d19d37fc47c0242c2faecdea5c0bd15fc4466f04fe9`.

## Evidence retained, including failures

- Initial frozen regression: `regression-runs/2026-11-27T01-57-25-867Z/report.json`. Contains the real geometry failures and an instrument defect: the new note wait dereferenced storage before the asynchronous first save.
- Corrected frozen regression: `regression-runs/2026-11-27T01-58-40-204Z/report.json`. Keeps the real Resume/reload/traversal failures distinct from the BFCache wait issue below.
- First candidate: `regression-runs/2026-11-27T01-59-00-280Z/report.json`. All applicable checks passed except a harness wait for a new `load` event after genuine BFCache restoration. BFCache restores do not emit a new load event.
- Corrected frozen BFCache control: `regression-runs/2026-11-27T02-00-10-583Z/report.json`. The test waits for the restored document and `pageshow`, then requires `persisted: true`, a retained in-memory marker and unchanged geometry. Passed on the frozen baseline.
- Intermediate candidate: `regression-runs/2026-11-27T02-00-13-250Z/report.json`. Nine focused checks passed. This is not the final candidate because the following lifecycle gap was subsequently found.
- Added real-wheel regression before its repair: `regression-runs/2026-11-27T02-02-21-604Z/report.json`. A real wheel event moved the viewport during delayed font readiness, but the initial-restoration guard prevented it from being saved. This introduced gap was repaired narrowly in the final runtime fingerprint above.
- Intermediate existing suite: `existing-suite/20261127T015852Z/sukhmani-browser-verification.json`. All 35 existing checks passed, before the final manual-navigation cancellation patch.

Final candidate verification:

- `regression-runs/2026-11-27T02-04-17-684Z/report.json`: all 10 focused checks passed on the final runtime fingerprint, including actual wheel movement during delayed initialization and genuine BFCache preservation. No runtime errors or external requests were observed.
- `existing-suite/20261127T020431Z/sukhmani-browser-verification.json`: all 35 existing Sukhmani checks passed again on the exact final candidate, including the changed wheel-pause handler, legacy learning compatibility, imports and offline reload.
- `FINAL_VERIFICATION.json`: exact runtime/test fingerprints, report pointers, syntax checks and limits.

All prior results remain retained and are not relabelled. Independent review and release decisions remain pending.

## Limits

These are disposable desktop Chrome checks, including mobile viewport widths. They are not physical iPhone, Safari, Home Screen, VoiceOver or actual airplane-mode acceptance. The tests use synthetic Punjabi reflection text and bookmarks only. The controlled delayed-font condition changes only a test fixture promise; actual wheel movement is generated by the browser input interface.

The inherited case of scrolling and leaving within the existing 200 ms debounce is outside this bounded repair. Navigation tests deliberately wait 450 ms before leaving. No claim is made that this work closes PR47, theological review, teaching approval or real-device acceptance. No commit, push, merge or deployment was performed by this agent.
