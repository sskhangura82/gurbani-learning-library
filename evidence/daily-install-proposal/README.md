# Daily installation proposal — builder evidence

This is builder evidence for implementation a4ec6b0bf18f1a8ccdfc56bffe0a265f3c92f838, draft PR69, based on PR64. Read only after the independent reviewer has frozen criteria and recorded findings. It is not approval or deployment evidence.

## What was actually run

- Mac Node v26.0.0, Apple Git2.39.5. The initial13-check suite passed. Its combined stale/moving-reference test name was too broad: it checked stale-reference refusal and date rollover, not an actual mid-run reference change. The final suite separates those cases and performs a real synthetic mid-run ref change.
- Builder peer inspection identified Git replace-ref/local-diff portability and repository-subdirectory output isolation defects. The implementation now ignores replace refs, disallows all Git transports, fixes patch formatting, verifies patch replay, requires the actual repository root and excludes common Git storage. The final16-check suite passed; focused peer checks passed separately. The earlier logs remain unaltered.
- Existing preparation, signer, source staging and delivery contracts passed unchanged. `existing-contract-checks.log` is the actual output.
- `existing-date-observation.json` records a run of the committed code against the existing tracked27November envelope/source/receipt. It did not contact SGPC or read a signing key. The input was re-containerized from exact already-tracked public-source bytes. Result: ALREADY_ADMITTED, no patch, unchanged event/index/reference/tracked status.
- New-date signer-to-proposal-to-reader behavior uses ephemeral keys and temporary synthetic repositories. This is not a production-signing run, a live source capture, installation or physical-device test.
- Hosted Node22 final checks for the exact PR69 head are recorded in `../development-priorities-final-runs-20261127.json`. Both applicable workflows completed successfully. The already-open article-print issue is separately visible through PR67 and has not been waived.

Only original public-source artifacts and synthetic test records are used. No browser profile, actual private reflection or existing signing key was read.

## Artifact limits

The output is an exclusive review directory and a replay-verified exact-base patch. Git object writes are limited to new content-addressed objects; no reference, real index or worktree update is performed. The later deployment process must validate the artifact again and check its expected base at the moment of authorized installation. No schedule or delivery service was activated.
