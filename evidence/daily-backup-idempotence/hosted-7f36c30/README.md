# Daily backup repair — exact-candidate hosted record

Read independent findings before builder outcomes. This evidence is saved on a separate branch; the reviewed implementation remains `7f36c3039ca95fac6e69ca28f631b9e3734c70e9` in draft PR #62.

All applicable hosted checks completed successfully against that candidate. `checks.json` and the three run JSON records identify the workflows, exact source commit, job links and attempt numbers. `browser-report.json` is the newly generated hosted report selected from the successful retry artifact, with its original path recorded separately. Older local reports in the same artifact were not relabelled as hosted results.

The browser record demonstrates the actual create/import/retry/import-new-version/export/fresh-restore controls. The repeated incoming backup no longer changes the saved record, while distinct versions remain. Existing Daily source/date refusal, note-recovery and offline checks also remain covered.

## Retained first failure

The first browser job failed while installing dependencies, before application tests ran. The Microsoft Ubuntu package feed returned HTTP 403; the package manager refused that repository. `browser-install-attempt1.log` preserves the raw output. Only the failed job was rerun once on a fresh runner, without changing source code, package versions, signature checks or test assertions. The second attempt completed successfully.

Raw installer output retains its original whitespace. Source/document whitespace checking excludes only that raw log; `files.sha256.json` covers its exact bytes.

## Limits and release state

Fresh synthetic desktop Chromium contexts only. No actual user notes, physical iPhone, Safari, VoiceOver or airplane-mode test. The app has no new explanatory text, recording or active daily publisher. These checks do not grant qualified-content approval or release authorization.

PR #62 is a small successor to the unchanged PR #61. The candidate is draft and unmerged. No deployment or live-site change was made by this work. See `release-state.json` for the repository state checked while completing this record.
