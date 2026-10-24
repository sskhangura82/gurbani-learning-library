# M0 candidate: rollback custody and remaining lifecycle gate

This is a **candidate-only** packet. Nothing in these instructions authorizes merging, publishing, modifying Pages settings or replacing the family release. R7 stays live while acceptance is blocked.

## Pinned custody

- Verified base main: `254f3871b785b756208379138dcc17472a3733ff`.
- Accepted R7 runtime: `57d0acdf43b6f4935e159468128ec9a503b5aaa1`, tag `japji-v1-0.9-r7`.
- R7 service worker: `0.9-japji-v1-r7-home-speed-2`.
- Candidate worker: `0.9-japji-v1-m0-candidate-1`; 32 content-hash-checked cache routes.
- R7 runtime custody hashes: `R7_APP_MANIFEST.json`; candidate hashes: `M0_APP_MANIFEST.json`.
- Unchanged learning record keys and schemas; `js/shared-learning.js` is byte-identical to R7. No clearing, renaming, migrating or uploading family browser storage.

## Actual-browser lifecycle gate — NOT RUN

The available controlled Chrome preview is an insecure HTTP preview. It provides neither service workers nor Web Locks. Portable worker/locking simulations are separate evidence. No physical iPhone or controlled Chrome loopback connection was available for this run. Do not treat R6/R7 historical lifecycle evidence as an M0 result.

The following reproducible fixture is prepared for an operator with an isolated local Chrome profile. It binds loopback only and does not need public hosting, account changes or payments. Use synthetic records exclusively. The browser harness refuses public origins and uses `glp001.qa-m0.*`, distinct from all family keys. It refuses to overwrite any nonfixture content in those keys.

From a candidate checkout, prepare an immutable R7 snapshot in a new temporary directory:

```sh
git archive 57d0acdf43b6f4935e159468128ec9a503b5aaa1 | tar -x -C /absolute/new-r7-snapshot
python3 tests/m0-build-lifecycle-fixture.py --r7 /absolute/new-r7-snapshot --candidate . --output /absolute/new-m0-fixture
python3 tests/serve-upgrade-fixture.py /absolute/new-m0-fixture --port 8766
```

The directory names are explicit placeholders to replace; create the R7 snapshot directory first. The builder refuses an existing output directory. Open `http://127.0.0.1:8766/tests/m0-sw-browser.html` in the isolated local browser. Never use family browser data or copy private notes into the fixture.

1. With `current` pointing at `01-r7`, click **Seed synthetic QA learning and load reader**. Require actual active worker, 385 source occurrences, three preserved synthetic records, bookmark, Punjabi note, theme, size 36 and radiance preference.
2. Switch only the fixture `current` symlink to `02-m0`, atomically. Click **Check for waiting update**. The old reader must remain until **Load waiting update** is deliberately clicked. Require M0 version, exact learning and hashes.
3. Switch to `03-r7-rollback`, repeat waiting/apply/inspection. This is R7 runtime with a fresh QA rollback worker version, not reused stale cache metadata.
4. Switch to `04-m0-repeat`, repeat again. Reload and inspect. Export QA evidence only after all stages.
5. Create the fixture-root `origin-unavailable` marker, reload the already cached reader, and verify Home, Read, Understand, Study and saved-learning access. Remove that marker afterward. This is origin-failure simulation; physical airplane mode remains a separate iPhone check.
6. Save timestamps, actual worker/cache versions, loaded runtime versions, exported synthetic results and redacted screenshots. A prepared fixture or Node simulation is not a pass.

One safe atomic fixture switch (local fixture only):

```python
from pathlib import Path
import os
fixture = Path('/absolute/new-m0-fixture')
next_stage = '02-m0'  # then 03-r7-rollback, then 04-m0-repeat
pending = fixture / 'next-stage'
if pending.exists() or pending.is_symlink():
    raise SystemExit('Unexpected pending symlink; inspect before proceeding')
pending.symlink_to(next_stage, target_is_directory=True)
os.replace(pending, fixture / 'current')
```

## Production rollback procedure — prepare only until a release is authorized

If M0 is eventually accepted and later requires rollback, create a normal rollback branch from then-current main. Preserve newer documentation and unrelated accepted changes; do not force-reset main. Restore the six runtime files changed by M0 from the accepted R7 commit: `full-japji.html`, `css/japji-full.css`, `js/japji-full.js`, `js/continuous-core.js`, `js/learning.js`, and the R7 runtime inputs to `sw.js` (the worker itself must be regenerated, not copied with an already-used version). Verify the runtime diff against `R7_APP_MANIFEST.json`.

Run `node tests/build-sw.mjs` with a **new unique rollback version**. Run the R7 portable suite at the pinned R7 checkout and the actual lifecycle fixture above. If other runtime changes have since been accepted, reconcile them explicitly before constructing the rollback. Open a reviewed rollback PR; the founder retains publishing approval. No production command is executed by this packet.

Before any accepted version switch, export saved learning in each Safari/Home Screen context. Use the in-app update flow and close old tabs after a successful update. Never clear site data, unregister the user's worker as a repair shortcut, or delete an installed icon to force an upgrade.

**Downgrade size caveat:** M0 supports 60px (200% of the 30px default). R7 caps continuous-reader size at 48px; an R7 save may retain that cap on returning to M0. Re-select 60px after re-upgrade. Notes, bookmarks, reading IDs and the shared-learning format are unchanged. The fixture deliberately uses a shared supported size of 36px; do not claim that the new 60px preference survives an R7 downgrade unchanged.
