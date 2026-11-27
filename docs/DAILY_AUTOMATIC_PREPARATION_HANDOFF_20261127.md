# Automatic Daily preparation — candidate handoff

## Problem and scope

The reader has an exact-date official-source record, but no recurring acquisition process. Re-running the importer also creates a fresh receipt at revision 1: replacing an already admitted same-day record with it would trigger the reader's same-revision conflict protection.

This candidate extends the existing preparation workflow and importer, with a bounded orchestration step. It does not introduce another reader, source adapter or interpretation system. Application files, the signed event already in the repository, source data, private learning and publication key remain unchanged.

## Review ordering

Please freeze independent acceptance criteria before opening the implementation or builder evidence. Builder criteria were committed separately before implementation. The peer check of runner code was builder-side assistance, not the independent review seat or qualified religious review. The builder's test command list is below; no test result substitutes for independent findings.

## Behavior

- One run chooses its Amritsar date once. Default mode is today; an explicit date is retained as a historical request.
- The original-only importer remains unchanged. The runner checks the resulting manifest, raw byte digests, strict source/receipt contract, source boundaries and exact date.
- Existing dated records are verified using the reader's signature/source decoders. A same-source observation preserves the existing envelope bytes and revision. An observed publication-time difference, source change or corrupt existing pair blocks automatic replacement.
- An archive-only recheck without a publication time does not erase an already recorded time.
- Midnight rollover holds a today-mode candidate as dated evidence. No prior date becomes today's reading.
- The run directory is exclusive and new. A running record starts with candidateReady=false. A final bounded report replaces it atomically; interruption can leave an honest RUNNING record.
- Reports carry only bounded metadata, identities, status codes and constant messages. They do not reproduce arbitrary exception text or raw portal HTML.
- Failed capture directories are not uploaded. The workflow always preserves only run.json; explicitly checked original artifacts are uploaded separately on success.

## Activation boundary

The existing workflow gains five UTC schedule entries per day through one cron expression. These correspond to 06:47, 07:47, 08:47, 10:47 and 13:47 in Amritsar. They are probe times, not a claimed publication timetable. Each invocation makes one bounded capture; there is no retry loop. An HTTP refusal is not described as necessarily transient.

The scheduled job remains disabled unless repository variable `GLP_HUKAMNAMA_PREPARE_ENABLED` is exactly `true`. No variable was created or changed. A deliberate manual dispatch can prepare an artifact. Permissions are read-only and checkout credentials are not persisted. There is no signing key, secret, repository write, commit, deployment or publication step.

GitHub schedules run from the default branch and can be delayed or dropped; dormant public-repository schedules can also be disabled. Therefore this is not a guaranteed delivery service. A reviewed deployment plan must keep visible unavailable states and operational monitoring. GitHub reference: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule

`sourceCommit` is recorded from the exact GitHub checkout in the workflow. The local CLI accepts it as caller-supplied audit metadata, not independent proof of where code executed.

## What remains before end-user automatic delivery

1. Independent review of this preparation candidate.
2. A separately reviewed publication/install decision that preserves dated artifacts and existing note bindings; this branch does not make that decision.
3. Founder activation of the chosen test-only deployment and scheduler after review. No live family release is authorized.
4. Observation that a new official day reaches the isolated reader, followed by the physical phone checks.

The current development signer is intentionally not an unattended production publisher. A preparation artifact does not mean the phone received today's reading.

## Builder verification entry points

- `node --test tests/hukamnama-preparation.mjs`
- `python3 tests/hukamnama-ingest.py`
- Existing JSON, staging, delivery and signer refusal checks.

Tests use temporary files, synthetic failures and ephemeral in-memory signing keys where needed. No learner data or actual publishing key is used.

## Integration context

The combined earlier candidate was tested against main in validation PR 63. Reader, Daily, Knowledge, integrity and backup workflows succeeded. The article print workflow remains failed on its already-open Gurmukhi PDF extraction/completeness finding. That failure is not waived, repaired here, or hidden by changing extractors.

The older five Knowledge pull requests are already represented in the composite and must not be merged again over it. CHAIN-02 remains the integration decision record. This feature branch does not merge, retarget, close or deploy that chain.
