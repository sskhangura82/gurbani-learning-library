# Daily browser test: preserve the shared synthetic clock

27 November 2026 · builder test-instrument correction · product code unchanged

## Observed failure

The Daily automatic-preparation candidate's hosted run [46004681381](https://github.com/sskhangura82/gurbani-learning-library/actions/runs/46004681381) installed its browser successfully and then timed out in the first save of the two-tab note scenario. The preceding scenarios passed and there were no page errors. The runner did not capture the failed page's status or clock, so its report alone cannot establish the exact cause.

The test helper installed a synthetic clock every time it opened a page. In the installed Playwright 1.62.1 implementation, `page.clock` refers to its browser context's clock. Installing it for a second page resets the clock in all existing frames of that context. Thus opening the second tab could move the first tab's clock backwards before the existing note's creation time.

The application already refuses that condition with `INVALID_CLOCK`, preserving both the stored note and the unsaved edit. That is the intended behavior. No reader, source, private-learning, timestamp or date logic was changed; the twelve-second save wait was not increased.

## Isolated reproduction with unchanged application bytes

Two instrumented copies of the original test ran in new temporary Chromium contexts, outside the branch. Their reports and the exact diagnostic patch are retained under `evidence/daily-browser-clock/`.

- A normal baseline passed but recorded the first tab clock moving from 12:00:00.961 to 12:00:00.019 when the helper opened the second page. The timing happened to permit the subsequent save.
- A controlled baseline advanced the synthetic clock five seconds before creating the original note. That note was created at 12:00:05.173. Opening the second page moved the first tab from 12:00:05.963 to 12:00:00.017. The same first-tab save wait failed. The visible status was exactly: **The device clock predates this note. Your existing record has been preserved.** The first tab was not hidden; the original stored reflection and the attempted unsaved edit were both retained.

This reproduces a concrete test-instrument defect capable of producing the hosted failure. It is not a claim to have observed the already-completed runner's missing DOM diagnostics.

## Scoped correction

Only `tests/hukamnama-browser.mjs` changes executable code.

The page helper now records the initial time and one installation promise in a WeakMap keyed by browser context. Later pages reuse that clock. Requesting a different initial time in the same context fails before creating a page.

The two-tab scenario deliberately advances the clock five seconds before opening the second tab and asserts that the first tab never moves backwards. It also checks that a conflicting initial-time request is refused without opening a page. The existing exact-note, conflict-copy and private-data checks remain in place.

## Result and evidence

The complete fresh-browser suite passed with all 32 scenarios and no page errors. The new canary recorded 12:00:06.037 before the second page and 12:00:06.074 afterwards; it also confirmed refusal of a conflicting clock request. Both first-tab and second-tab edits survived through the existing exact assertions.

Records:

- `hosted-failure-report.json`: the original hosted failure, preserved without rewriting.
- `baseline-normal.json` and `baseline-forced-rewind.json`: isolated baseline observations.
- `baseline-diagnostic.patch`: reproducible instrumentation and controlled-delay difference from the pinned original test.
- `diagnosis.json`: source pin, Playwright implementation evidence and unchanged product hashes.
- `after-full-browser-report.json` and `after-verification.json`: the repaired suite's results and canary values.

The full local screenshot directory is retained outside the branch at `/tmp/glp001-daily-clock-diagnostics-20261127/fixed-full-browser-run`. The bounded report is committed with the test correction. All browser data was synthetic. These are desktop Chrome checks, not physical iPhone, Safari or VoiceOver acceptance. The prior failure remains in the record; no passing rerun or application release is implied for GitHub until a new hosted run completes.
