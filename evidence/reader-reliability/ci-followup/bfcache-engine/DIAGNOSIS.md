# PR59 BFCache environment diagnosis

27 November 2026 UTC. Frozen application candidate: `b69d6b31941adc025a1159ab0826d39a3fb58bc3`. Sukhmani reader digest remains `2deaff782567dd7d57bd2d19d37fc47c0242c2faecdea5c0bd15fc4466f04fe9`. No application file has been changed for this investigation.

## Finding

The hosted failure is a genuine cold return in the selected environment, not a valid BFCache pass. Selecting full Chromium151 alone does not fix it. Event-based navigation alone also does not fix it. Frozen source389 exhibits the same full151 failure, so this experiment does not establish a regression introduced by the new reader repair.

| Engine / case | Observed result |
| --- | --- |
| Bundled Chrome Headless Shell151, repaired reader | Marker absent; cold return. With CDP diagnostics, reasons include `BackForwardCacheDisabledForDelegate` and `BrowsingInstanceNotSwapped`. |
| Bundled full Chrome for Testing151, repaired reader | Marker absent; cold return. CDP reports `JavaScriptExecution`. `performance.notRestoredReasons` reports `masked`. |
| Full151 with event-based commit wait, repaired reader | Same `JavaScriptExecution` result. Polling was not established as the cause. |
| Full151 with event-based commit wait, frozen source389 | Same `JavaScriptExecution` result. Original reader digest `ac1c5551fe760a8315306c03586ddb2a13a11d79b510892335a7075f6c9bf86b`. |
| Full151 minimal same-origin page, both polling and event-based navigation | True cache retention: marker retained, `pageshow.persisted=true`, scroll retained. |
| Full151 minimal page with asynchronous visibility-save through Web Locks | True cache retention. This small control did not isolate the reader's particular executing continuation. |
| Previously tested installed full Chrome158, repaired reader | True cache retention recorded in the original final candidate evidence; this remains a separate engine result, not a151 pass. |

The experiment is bounded: it compares browser implementations, one navigation-instrument change, the frozen predecessor, and a minimal capability control. It does not infer an arbitrary timing fix or modify the reader to force cache eligibility.

## Primary-source guidance

- [Playwright browser documentation](https://playwright.dev/docs/browsers#chromium-headless-shell): a headless launch without a channel selects the separate shell. [The Chromium channel](https://playwright.dev/docs/browsers#chromium-new-headless-mode) selects full/new headless. The documentation explicitly warns that branded full browsers can behave differently from the shell. Consulted 27 November2026.
- [Chrome's headless documentation](https://developer.chrome.com/docs/automation-and-testing/headless): unified headless uses the full browser implementation; the old separate implementation is distributed as `chrome-headless-shell`. Consulted 27 November2026.
- [Playwright Page API](https://playwright.dev/docs/api/class-page#page-go-back): native history navigation supports a commit wait. Its use here did not convert the actual151 reader case into a cached restoration.

Pinned Playwright remains1.62.1. Its installed `browsers.json` identifies both full Chromium and headless shell as revision1234, browser151.0.7922.34. Neither Playwright nor the pinned browser version was upgraded to change a result. Browser downloads used an isolated investigation directory; no normal browser profile was opened.

## Evidence

- `../45926739987/failed-jobs.log`: original hosted failure and separate infrastructure/test failures, retained by the parent builder.
- `paired-app-receipt.json`, `paired-app-runs/`, `bundled-headless-shell.log`, `bundled-full-chrome.log`: original assertions against both same-version executables; launch logs identify the binaries.
- `channel-diagnostic/2026-11-27T02-16-24-516Z/report.json`: metadata-probe defect. Browser command-line retrieval was unavailable because that API requires an automation flag. No test acceptance was inferred from this failed diagnostic.
- `channel-diagnostic/2026-11-27T02-17-20-845Z/report.json`: corrected metadata probe and full151 not-restored reason.
- `commit-full/` and `commit-shell/`: native commit-wait comparison with CDP reasons.
- `baseline389-full/`: frozen predecessor comparison.
- `minimal-controls.json` and its script: real capability control, both navigation instruments.
- `minimal-visibility-save-control.json` and its script: bounded asynchronous-save control.
- Original positive fullChrome158 receipt: repository `evidence/sukhmani-resume/regression-runs/2026-11-27T02-04-17-684Z/report.json`.

## Implemented harness follow-up

Retain the pinned bundled browser for the ordinary and cold-traversal tests. A separate strict BFCache lane may target an explicitly identified installed full Chrome browser, matching the full-browser lane used locally. Record its channel, actual browser version and executable selection. Require the same retained marker, `pageshow.persisted=true`, and unchanged viewport. A cold return must continue to fail that lane. The application code remains frozen, and the151 failures remain visible evidence.


## Final bounded smoke

`final-mixed-engine/2026-11-27T02-23-27-035Z/report.json` passed all10 checks. The ordinary lane used bundled HeadlessChrome151.0.7922.34; the genuine BFCache lane selected the already-installed full Chrome via `channel:chrome`, actually executed `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` version158.0.8127.37, and observed a retained document marker, `pageshow.persisted=true`, and unchanged geometry. No application bytes changed.

The harness now records each lane's selection, actual executable obtained from that launched browser's process identity, CDP product/revision and version. The strict BFCache acceptance statement block is byte-identical to the original candidate. No unavailable browser or cold return becomes a pass. Ordinary launch behavior remains unchanged. `BFCACHE_CHROMIUM_PATH` may explicitly choose the full browser; existing `CHROMIUM_PATH` remains a local override; otherwise only the BFCache lane selects installed `channel:chrome`.

This does not relabel the151 failures. Full151 application cache retention remains INCOMPLETE with unisolated `JavaScriptExecution`. The polling-causation hypothesis was not established, so no navigation-wait rewrite was carried into the repository harness.

The official [Ubuntu24.04 runner inventory](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md) listed Google Chrome157.0.8103.78 when checked on27November2026. The parent builder will record the actual hosted executable version and rerun CI. No browser/package upgrade is required for this selection, and this local result does not claim the hosted157 lane has passed.
