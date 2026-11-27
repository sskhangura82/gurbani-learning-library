# Sukhmani resume evidence index

Start with `IMPLEMENTATION_AND_VERIFICATION.md` for the demonstrated mechanism, the narrow repair, final results and retained failures. `FINAL_VERIFICATION.json` pins the exact runtime and test bytes.

- `FINDINGS_AND_PROPOSAL.md`: read-only diagnosis before implementation.
- `observed-code-identity.json`: exact code relationship to the reported historical CI failure.
- `pr56-resume-event-sequence.json` and `runs/`: the original bounded geometry/write traces and screenshots.
- `regression-runs/`: timestamped frozen baseline, instrument corrections, intermediate candidates, the additional manual-input failure and the final candidate.
- `existing-suite/`: existing full-suite receipts before and after the final manual-navigation patch.
- `upstream-review/`: the source review record read for this investigation, preserved without editing it.
- `frozen-code/` and `pr47-readonly/`: exact read-only comparison snapshots, not additional implementation candidates.
- `sk01-bounded-observation.mjs`: original frozen-object diagnostic instrument. The maintained focused regression is `tests/sukhmani-resume-browser.mjs` in the repository.

This is builder evidence using synthetic learning in fresh browser contexts. It is not independent approval, a merge, deployment or physical-device acceptance.
