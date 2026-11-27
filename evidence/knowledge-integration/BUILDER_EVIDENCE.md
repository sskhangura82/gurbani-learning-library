# Combined Knowledge candidate — builder evidence

Read after independent findings are recorded. These are builder checks, not Claude's review or qualified content approval.

## Tested state

The runtime is based on PR57 `f720099b6181919d597e249f9ad42b9f00cabe68`, with PR49 `1a4537edeecea070d7418e4dbc85f6b18207bbdf` search/navigation integrated. The passing reports record per-file digests of the tested runtime and all four protected files. No source, teaching, registry or source-lock byte changed.

Local interaction runs used Node 26.0.0 and desktop Chrome 158.0.8127.37. Hosted CI is configured for Node 22 and its installed Chromium; its result is separate. Browser contexts were fresh and nonpersistent, with synthetic fixture mutations only.

## Current outcomes

- Inherited source contracts, registry, editorial-title and editorial-boundary checks passed.
- Original PR49 search checks passed; the pinned upstream witness matched all 19 pilot occurrences.
- The three inherited browser suites passed again after the startup sequencing repair.
- The combined node report passed its 11 bounded interaction checks.
- The combined browser report passed its 8 interaction groups, including actual source refusal before any teaching request, re-pinned attribution mutations, and source/editorial separation through navigation.
- No application page errors or external page requests were recorded in the final combined browser run.
- `git diff --check` and syntax checks were clean at handoff preparation.

Current interaction reports:

- `2026-11-27T01-09-19-808Z-contracts/report.json`
- `2026-11-27T01-13-31-412Z-browser/report.json`
- Criteria frozen before those runs: `2026-11-27T010603Z-criteria.md`
- Raw inherited-suite receipts: `parent-runs/`

The runtime checks cover both positive controls and rejected cases. They do not claim exhaustive semantic detection or full-Granth search.

## Finding and instrument corrections

Code inspection against the frozen interaction criteria found that inherited startup fetched source and teaching concurrently. The application now verifies the source before requesting teaching. The affected browser suites were rerun, and the new interaction suite observes zero teaching requests when the source is damaged.

Three earlier combined-browser reports remain in their timestamped directories. They exposed harness errors: a doubled-slash server-root check, response headers written before file-read completion, and a locator that measured only a result button rather than its enclosing row with the visible match reason. The exact expected wording and criteria were retained. See `2026-11-27T011100Z-instrument-correction.md`; no failed report was deleted.

## Limits and disposition

The source packages remain digital witnesses; qualified Gurbani/Punjabi review and printed-page collation are separate. Exact written-word search does not infer inflected forms. RB-02's split-field semantic limit remains open. No physical iPhone, Safari, Home Screen, VoiceOver or participant testing is claimed.

This candidate is not exposed in the unified phone preview. It requires its own independent review before any integration decision. Passing builder or hosted checks does not authorize merge or deployment.
