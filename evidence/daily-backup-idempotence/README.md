# Daily backup retry repair — builder evidence

Read independent findings first. These records are builder verification, not independent approval or a release decision.

Base: `df2c62fb3fef3d85cab9b752772e3f3f201dd791`. Criteria were committed at `3fc3c17` before implementation. Local records below describe the candidate working tree; exact committed-head hosted results are to be recorded separately.

## Reproduction before the repair

- `baseline-contracts.txt` is the first synthetic contract run. Its test identity allocator threw when unexpectedly called; the production lock wrapper then reported `LOCK_UNAVAILABLE`. This made the failure less direct than intended. The fixture was corrected to return additional synthetic identities, without changing the acceptance assertions or production code.
- `baseline-contracts-attempt2.txt` uses that corrected fixture against the unchanged implementation. Eleven retry/order/identity promises fail, while the unrelated-same-text positive control passes. The ordinary repeated-import failure is `CONFLICT_PRESERVED` where `UNCHANGED` is required.
- `baseline-browser.txt` and `../daily-hukamnama/ui/2026-11-27T06-47-50-168Z/report.json` preserve the actual UI failure. The second identical conflicting import never reaches the required already-present state. No physical phone was used.

## Repaired behavior

- `repaired-contracts.txt`: new retry checks and the existing private-learning checks pass.
- `final-local-results.json` and `final-local-*.txt`: exact commands and exit codes for the combined learning/delivery/parser checks, source-preservation and integrity checks, service-worker simulation and deterministic bundle/pin checks.
- `repaired-browser.txt` and `../daily-hukamnama/ui/2026-11-27T06-51-37-525Z/report.json`: full Daily suite passes, including actual user controls for A → import B → retry B unchanged → import C → export → restore into a fresh synthetic browser. Existing date, source, note-recovery, offline and layout scenarios remain covered.

The tests preserve exact source bindings, Unicode, timestamps and independent identities. They demonstrate no rewrite on an unchanged retry, one write for a real merge, coordinated concurrent retries, unchanged retry at the record limit, and safe refusal for genuine additional data beyond the limit or browser quota.

No existing duplicate is deleted. The existing direct conflict-parent format is retained, not promoted into complete ancestry tracking. No scripture/source event, explanation, publication key or other reader is changed. Nothing is merged, deployed or enabled automatically; the Daily publisher and qualified-content work remain separate.

All private learning data in these records is synthetic. Browser evidence is desktop Chromium only; physical iPhone, Safari, VoiceOver and airplane-mode acceptance are not claimed.

Raw command logs retain their original whitespace. The source/document whitespace check excludes only the two untouched failing Node output files; their bytes are included in `files.sha256.json`.
