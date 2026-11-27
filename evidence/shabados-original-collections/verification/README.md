# PIN and named-edition source-reader verification

Application bytes: `c3a4cc027b48c246027b545d9120dfb72d7ebe6f`.
The digest inventory records each changed runtime file. The subsequent offline
fixture amendment `d7928722b2c1a534ed8efe0376c911873f17f804` adds the five new
public shell paths to the independently expected inventory; no prior asset is
dropped. Later handoff and evidence changes do not alter that application.

## Contracts

`source-core.json` records all 16 core checks, including every committed manifest,
155 chunks, 11,019 complete provider groups and 128,313 original-text records.
`integration-contracts.tap` records 59 passing integration checks, no failures or
skips, covering source scopes, catalog, old reader SRI, complete script inventory,
toolchain lock, private offline exclusion, public Knowledge and existing Explore.

The first integration run omitted `GLP_SGGS_INDEX`, which the existing Explore
reconstruction deliberately requires. That failure is retained as
`integration-initial-missing-research-input.tap`. The successful run supplied the
unchanged 60,555-occurrence OpenGranth research packet. No application or test
assertion was changed to obtain that pass.

## Browser evidence

The new reader suite is under `evidence/source-readers/browser/`. Its final
35-scenario run covers complete cross-page groups, exact rendered source text,
deep links, previous/next/Back/reload, explicit source-bound save/resume, stale
and corrupt record preservation, wrong line pages, source tampering, both delayed
Resume outcomes, both unchanged-SRI script mutations, and 320-pixel layout at
normal and largest Gurmukhi sizes. Public source hashes match the named runtime.

The combined checks are under `../combined-browser/`:

- `continuation-navigation-smoke/results.json`: 10 passing checks of the full
  public/private navigation and existing Dasam reader links. The actual private
  collection route returns 404 before any file read; no PIN is used.
- `library-script-integrity/browser/2026-11-27T22-35-18-418Z-module-transport/report.json`:
  13 passing existing application delivery checks.
- `library-script-integrity/offline/2026-11-27T22-36-20-790Z/report.json`:
  6 passing real Chrome service-worker checks, including failed installs,
  activation, exact cache inventory and preserved synthetic saved learning.

The first offline attempt at `2026-11-27T22-35-20-864Z` stopped because the
fixture expected `CHROMIUM_PATH`, while the launcher supplied the other suites'
`GLP_CHROMIUM_EXECUTABLE` variable. The browser binary was not found. Its failed
report and log remain. The rerun supplied the existing Chrome path through the
documented variable; application and fixture bytes were unchanged. `logs/run.json`
records the initial three-command run, including that failed launch, rather than
rewriting it as a pass.

PIN contracts and browser results are separate under
`evidence/private-library/pin-20261127/` and
`evidence/private-library/browser/pin-20261127/`. They use synthetic credentials
and content. The owner collection's exact resealing receipt contains no secret.

## Limits

All browser checks used fresh temporary desktop Chrome contexts on the authorized
Mac. They did not open an existing profile or family reflections, and the owner
PIN was never transferred. Narrow desktop viewport checks do not establish
physical iPhone, Safari or VoiceOver acceptance. Suite counts overlap. These are
builder verification results; actual Claude review and release remain separate.
