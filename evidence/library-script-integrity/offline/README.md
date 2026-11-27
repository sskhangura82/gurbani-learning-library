# Library script integrity: offline update evidence

Builder checks on a fresh, nonpersistent desktop Chromium 158.0.8127.37 context on the authorized Mac. Synthetic learning records only. These are not independent review, physical-device acceptance or a release approval.

## Actual failed updates and recovery

`2026-11-27T03-03-10-203Z/report.json` records six passing checks. The previous working release was loaded from frozen git reference `e0a6cff22771d42ce3a2fe91ad96863daae214ed`, not reconstructed from the candidate. Its home rendered and its 85 cached response URLs and SHA-256 digests matched that release exactly.

A changed Knowledge bundle and then a missing Knowledge bundle were served to two actual service-worker update attempts. In each case the new worker reached `redundant`, the original worker retained control, every prior cached URL and response body remained identical, and synthetic notes, bookmarks and reading preferences remained byte-identical. Prior Japji HTML was still served with the browser network unavailable. No claim is made that this was a complete offline interaction test of that older reader.

The valid candidate installed all 93 assets but remained waiting. Only an explicit `ACTIVATE_GLP_UPDATE` message activated it. The prior shell was then removed; the candidate's exact 93 cache URLs, release queries and body digests matched its manifest and on-disk files. The Library, both Knowledge directory and explicit HTML URLs, and both complete source reading sheets rendered offline. All three bundles and both Knowledge JSON responses came from the worker. Synthetic learning was unchanged.

The candidate inventory must equal all 85 prior assets plus the eight explicitly required new entries. It cannot pass merely by deriving a smaller count from a damaged manifest. No worker installation or activation logic changed in this workstream: only the version and generated inventory changed.

## Existing regression suites

`rechecks-2026-11-27T03-03-49-444651+00-00/articles/` retains the actual article suite report, newly generated print outputs and runtime captures: 25 checks passed. These PDFs were not newly extraction-validated or visually approved; the copied older print gate/visual verdict files were removed. The run's artifact manifest lists only files actually produced in this run. `practice/` retains the practice suite report and captures: five checks passed.

The stale flat count of 81 was replaced with exact cache URL, release-query and response-digest comparisons, including verification against the current on-disk assets. Required complete Nitnem sources and new Knowledge/bundle assets are asserted separately; the existing article/practice asset-presence checks remain.

## Harness corrections, preserved

`fixture-baseline-2026-11-27T03-02-19-946Z.json` records a separate probe on the unchanged previous release. The practice fixture omitted the JavaScript MIME type for `.mjs`; Chromium refused the module and left the library loading. With only that MIME correction the baseline reached ready. The same baseline DOM established that the older `.personal-tools` and `.home-hero` selectors no longer existed; the current `.today-quiet`, `.today-hero` and two tool links did. The harness now follows those current selectors while retaining its behavior assertions. The article offline entry similarly follows the current Explore navigation to source sheets.

`launch-correction.md` records a separate command-launch error before a test executed. No failed application result was overwritten. All actual test runs use timestamped evidence.

## Limits

Network blocking is Chromium emulation. No iPhone, Safari, iPad, VoiceOver, physical airplane mode, quota exhaustion or universal update-failure coverage is claimed. The manifest and script pins remain relative to trusted served HTML and worker bytes. Unreviewed teaching remains unreviewed.
