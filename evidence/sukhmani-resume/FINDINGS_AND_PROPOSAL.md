# SK-01: bounded mechanism investigation

## Scope and source identity

Read-only investigation; no application file, PR58 content, deployment, commit, push or comment was changed.

- Reported failing review commit: `8975171aef5d45cf544ab6bc71ea9c99181879f6`.
- Its Sukhmani reader, learning model, shared storage, two relevant stylesheets and browser test are byte-identical Git objects to published source `a3476ac4b9be90dde350fb35dd13ce0b672c120d`. See `observed-code-identity.json`.
- Current PR56 source: `389e79baff4016a2ff61d1851908de0bd66beb8f`.
- PR47 current head remains `d8202caa1b7761c493f70eb9c13514f9b87f2801`; the existing linked-visit repair is separate and already independently reviewed.
- Latest committed SK-01 note was read at review head `18fc9a62142b47842f35e3e5ebdf23b36bf7bf2c`, including correction commit `cf6c895f5dbe8248e0349c8ba89291c54055b688`.

The corrected historical count is one failure among 61 CI runs (60 passed). That is an observed sample, not an established probability or proof of a mechanism. The later correction does not contain event/geometry instrumentation.

## Evidence

- Harness: `sk01-bounded-observation.mjs`.
- Full report: `runs/2026-11-27T01-37-28-660Z/report.json`.
- Focused event extract: `pr56-resume-event-sequence.json`.
- Original review material: `upstream-review/`.
- Frozen relevant code snapshots: `frozen-code/`.
- Unmodified PR47 files additionally retrieved through GitHub: `pr47-readonly/`.

Eight scenarios were run once each: seeded explicit Resume and ordinary reload on each of published code, PR56 and PR47; the original CI bookmark/reflection/reload/Resume sequence on published code and PR56. They used fresh Chrome 158.0.8127.37 contexts, synthetic records and frozen Git objects served on loopback. There were no runtime errors or external requests. This is not a physical-device result or a repeated statistical flake-rate experiment.

## Demonstrated explicit-Resume defect

On all three frozen variants, the Resume control scrolls the selected row into place while the resume notice remains in the document. It then hides that notice.

At 390 pixels wide in this environment:

- The notice is 117 pixels tall. Its removal changes the source position by 137 pixels, including margins.
- Root scroll padding is 14 pixels and the row's scroll margin is 20 pixels, so the selected row initially lands near 34 pixels.
- Hiding the notice afterward moves `sukhmani.a01.p01.l02` to top -102.703125, bottom 11.296875.
- The next occurrence, `sukhmani.a01.p01.l03`, lands at top 20.296875.
- The capture function excludes rows whose bottom is below 12 pixels, then selects the top nearest 28 pixels. Its geometry therefore selects line 3.

A seed-only Resume can keep the stored ID at line 2 while leaving its text almost entirely above the screen. Storage assertions alone miss that visible failure.

## Demonstrated delayed overwrite in the original CI sequence

The exact CI-era source and PR56 both reproduced the forward saved-place shift after the ordinary test sequence. The immediate assertion point still saw line 2; after the debounce, the stored place was line 3.

PR56 trace after reload:

| Time | Event |
| --- | --- |
| 118.3 ms | Browser restoration scroll arrives and schedules the 200 ms capture. |
| 172.5 ms | Resume click begins. |
| 172.9–173.0 ms | Selected row is aligned while the resume notice is still visible. |
| 173.1 ms | Notice becomes hidden; source geometry moves upward. |
| 177.1 ms | The original test's immediate assertion point still sees stored line 2. |
| 183.9 ms | The explicit jump writes line 2 and its guide position. |
| 321.3 ms | The earlier uncancelled capture selects line 3 from the changed geometry. |
| 325.6 ms | Line 3 replaces the saved reading place. |

The event scheduled before Resume is not cancelled by `jump()`. The delayed callback does not recheck its guard in the PR56/CI-era implementation. The later scroll from the jump may be ignored while `internalScroll` is true, but that does not cancel the earlier timer.

This supplies a concrete mechanism consistent with the intermittent immediate CI assertion: a fast assertion samples before the delayed overwrite. It does not establish the exact scheduling of the historical failing CI run, whose full event trace is unavailable.

## Demonstrated ordinary-reload defect

After deliberate reading, the browser retained the exact same numeric scroll offset on reload. The new in-flow Resume notice was inserted above the source. The reader then persisted the newly displaced visible occurrence without any additional user action.

In the bounded runs, all three variants moved from `sukhmani.a06.p02.l07` to `sukhmani.a06.p02.l05` after the debounce while scrollY remained 39874. The stored row moved from top -4.015625 to 132.984375 solely because of the inserted notice.

The earlier RT-003 evidence recorded a one-line backward change at another font/geometry combination. The mechanism is compatible, but the exact count is geometry dependent. It must not be described as a universal fixed one-line offset.

## Relationship to PR47

PR47 does not fix these two ordinary resume/reload geometry paths. It adds:

- A distinct linked-visit state and preservation of the original reading/guide record.
- `alignLine()` with timer cancellation and two-frame guard.
- A recheck of `internalScroll`/dialog in the delayed scroll callback.
- Exact fragment resolution and explicit return/adoption controls.

Its ordinary `jump()` still aligns first and hides the resume notice afterward. Its ordinary initialization still inserts the notice above browser-restored scroll. The bounded observations confirmed the resulting geometry/reload issue on its exact head.

Do not reimplement or accidentally claim its linked-visit behavior as part of SK-01. If integrated later, retain the new PR56 Saved entry and address its separately recorded first-time wording and narrow notice issues.

## Minimal supported proposal for the reader-reliability candidate

JS only, with regression work; no scripture, teaching, CSS, storage-schema or shared-storage changes are needed for the demonstrated path.

1. Explicit navigation: cancel pending capture before the transition; hide the Resume notice before alignment; use a generation-aware bounded alignment guard through two animation frames. Recheck that guard and dialog state when a delayed capture actually executes.
2. Ordinary reload/cold Back/Forward, with a saved exact occurrence and no explicit passage fragment: suppress capture only during initialization, avoid introducing the in-flow Resume notice, and align the verified saved occurrence after page-show/layout readiness. Do not write storage or change guide/preferences merely to restore the view.
3. Keep native browser history restoration enabled. Preserve BFCache's retained DOM/position. Retain fresh-navigation Resume and the existing Saved-entry intent.
4. Release the transition guard once alignment settles. Subsequent scroll events must continue to save regardless of whether they came from wheel, touch, keyboard, assistive technology, a scrollbar or a programmatic accessibility control. Do not install an input-event whitelist.
5. Keep PR47 linked-visit integration explicitly separate.

Changing reload to restore directly means tests must stop unconditionally waiting for a visible Resume button after reload. That is a deliberate behavior change to verify, not a hidden assertion relaxation. Fresh-navigation Resume remains separately tested.

Required focused regression: settled occurrence and viewport geometry after explicit Resume, ordinary reload and Back/Forward; a queued scroll overlapping Resume; private record fields unchanged; and a scroll without a wheel/touch event still updates the saved reading place. SRI hashes must be regenerated after the final JS bytes.

No application repair has been made by this investigation.
