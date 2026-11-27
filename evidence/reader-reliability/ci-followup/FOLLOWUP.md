# Test-environment follow-up to frozen reader candidate

Application baseline for this follow-up: `b69d6b31941adc025a1159ab0826d39a3fb58bc3`. Application, scripture, teaching, HTML, worker, storage and source-integrity bytes remain unchanged. The follow-up changes only two test instruments, two active workflow runner selections, and evidence.

## Runner installation

The first reader workflow failed overall. One job stopped before browser execution because an Ubuntu 26.04 package index returned HTTP 403. The active reader and unified-library workflows now select the documented, supported `ubuntu-24.04` image. Signature and transport checks remain enabled. The first logs and run identity remain in this directory; no browser success is inferred from pre-existing reports uploaded after the failed setup.

## Exact offline inventory

The old Nitnem browser test asserted 81 files despite frozen PR #56 already containing 85. The replacement verifies the complete declared URL set and hashes every cached response. An explicit required-asset inventory additionally rejects omission of source/library files from the manifest itself.

The first replacement test was wrong too: it omitted the worker's existing `glp_release=VERSION` cache key. That browser failure is preserved at `nitnem-browser-20261127T022148Z/`. The correction constructs the exact release key from the declared worker version, without stripping queries from actual keys. Wrong, missing, duplicated and additional query parameters are rejected, as are wrong bytes and omitted required files. See the two `nitnem-cache-*` records and `nitnem-cache-release-key-correction-*` records for the explicit instrument history.

Final local browser rerun: `nitnem-browser-20261127T022632Z/report.json`, all 64 existing Nitnem checks passed, including the stronger cache check, original-source/offline reading, private-learning exclusion and preserved learning during explicit updates. The test's later offline and privacy assertions remain unchanged.

## Retained-document browser lane

The first hosted BFCache assertion failed and remains a failure. A bounded comparison found that bundled headless shell 151 disables BFCache at its delegate. Full Chromium 151 retained a minimal page but returned a cold document for both this candidate and frozen PR #56, reporting an unisolated `JavaScriptExecution` reason. Neither changing channel nor changing to an event-based wait established a passing reader BFCache result on 151. Polling was not established as the cause, and full-151 reader BFCache verification remains INCOMPLETE.

The ordinary/cold lane remains on the pinned default browser. The genuine retained-document lane now explicitly targets already-installed full Chrome: `BFCACHE_CHROMIUM_PATH`, then the existing `CHROMIUM_PATH`, otherwise `channel: 'chrome'`. Its marker, persisted-event and geometry assertions are byte-identical. It records the actual executable, version and protocol revision; an unavailable browser or cold return still fails. No browser version is upgraded by this change.

The final local mixed-engine run uses bundled HeadlessChrome 151 for ordinary/cold checks and installed full Chrome 158 for genuine retention. All ten focused checks passed, and the retained-document case actually observed `pageshow.persisted=true`. See `bfcache-engine/SUMMARY.json`, `bfcache-engine/DIAGNOSIS.md` and `bfcache-engine/final-mixed-engine/2026-11-27T02-23-27-035Z/report.json`. All negative experiments and controls remain retained. The hosted run records its own installed Chrome version; local success does not predict or replace it.

## Status

This follow-up is ready for the hosted rerun. It does not claim the next run's result in advance. The unchanged application still requires independent review and founder decision. Physical-device, qualified-content and source-collation gates remain open. No merge or deployment occurred.
