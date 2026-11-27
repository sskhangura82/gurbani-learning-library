# Hosted verification follow-up

First hosted reader run: `45926739987`, candidate `b69d6b31941adc025a1159ab0826d39a3fb58bc3`. Its overall result is FAILURE and is retained as such. `first-run.json`, `first-jobs.json`, `first-artifacts.json` and `first-failed-jobs.log` preserve the run identity and failures. The separate unified-library workflow succeeded on that head.

## Three distinct observations

1. The review-repairs browser job never reached its tests: installation stopped when the Ubuntu 26.04 image's Microsoft package repository returned HTTP 403 and apt rejected its unavailable signed index. This is an installation failure, not a passing browser run. No signature, TLS or repository-authentication check is disabled.
2. The Nitnem browser suite passed its existing expected-asset set comparison, then failed the inherited fixed count of 81 against the actual 85. The frozen parent already contains 85 assets. The complete manifest, required-file inventory and actual cache contents must still agree; a count alone is insufficient.
3. The focused Sukhmani test reached its strict retained-document history check, but bundled browser 151 returned a new document instead. This is a failed BFCache test, not a successful BFCache observation. `first-hosted-sukhmani-resume.json` and its screenshot retain that result. Earlier successful full-Chrome observations remain separate.

The Sukhmani job stops before running its later legacy suite when the focused command fails. Likewise, the review-repairs job does not execute its tests after an installation failure. Artifacts may contain reports checked into the source tree; their presence is not evidence those tests ran in this hosted attempt. Use the job steps and the explicitly copied current-run reports here.

## Environment scope

The two active workflows are being pinned to the supported Ubuntu 24.04 runner rather than following the moving `ubuntu-latest` label. GitHub documents the October–November 2026 migration to Ubuntu 26.04 and explicitly offers pinning 24.04 for workflows that are not ready for the changed image:

- https://github.blog/changelog/2026-09-17-ubuntu-26-generally-available-and-latest-migration/
- https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/choose-the-runner-for-a-job

Playwright separately documents its default headless shell and the full Chromium channel. That distinction is a hypothesis to test, not proof of the failed history case's cause:

- https://playwright.dev/docs/browsers#chromium-headless-shell
- https://playwright.dev/docs/browsers#chromium-new-headless-mode

The paired browser investigation and exact final selection are recorded separately. The application bytes, source fixtures, HTML pins and offline worker remain those of the frozen candidate; this follow-up concerns test instruments and the hosted environment. No merge or deployment is authorized by these records.
