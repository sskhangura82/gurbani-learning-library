# Imported-note browser clock correction

Builder evidence, 27 November 2026. Product code and save timeouts are unchanged.

The hosted Daily run 46006668072 passed the repaired two-tab scenario, then timed out while saving an imported historical note. Its original report is preserved here. As with the earlier hosted failure, it contains no failure DOM snapshot.

The historical scenario imports an earlier backup into a new synthetic browser context. That new context previously started at the shared baseline time, while the imported note retained the exporting context's later creation/update timestamps. This made the success expectation timing-dependent.

An isolated diagnostic copy of the exact baseline test advanced the exporting clock five seconds before creating its original synthetic note. The historical save was then attempted at 12:00:00.231 against a note created and updated at 12:00:05.174. It reproduced the same scenario 29 timeout. The visible refusal was: **The device clock predates this note. Your existing record has been preserved.** Stored and unsaved text remained intact, and the tab was visible. This is the application's intended protection; it was not removed or bypassed.

Commit 062ae5aff9ca18b1706d6273efb43a9e806d666c changes only `tests/hukamnama-browser.mjs`. The fixture helper validates every imported creation/update timestamp, checks their order, and chooses a new context time strictly after the maximum imported timestamp and the baseline time. It refuses fixtures that would leave the staged Amritsar date. No timestamp or other imported note content is changed.

The target scenario now proves that the context begins after the imported timestamps, the helper leaves the fixture unchanged, all records and both timestamp fields are considered, malformed fixture timestamps are refused, and the actual save occurs after the imported record. The original date binding, creation time, edited reflection and later update time are checked after saving.

The full fresh-Chrome suite passed all 32 scenarios. The historical fixture's latest imported timestamp was 12:00:00.231, its initial context time 12:00:00.232, and the save attempt 12:00:00.414. The earlier two-tab no-rewind canary also passed. This is desktop Chromium verification with synthetic data, not phone or VoiceOver acceptance.

Files:

- `hosted-failure-report.json`: original hosted failure.
- `baseline-forced-import-clock.json`: controlled reproduction with actual UI refusal and clock values.
- `baseline-diagnostic.patch`: exact instrumentation/delay differences from the pinned baseline test.
- `after-full-browser-report.json`: complete repaired browser result.
- `diagnosis-and-verification.json`: pinned input/output hashes, product preservation and clock evidence.

The full repaired run's screenshots remain at `/tmp/glp001-daily-import-clock-diagnostics-20261127/fixed-full-browser-run`. No hosted rerun success is claimed here; the parent will preserve these records on the separate evidence branch and run the new exact source candidate through CI.
