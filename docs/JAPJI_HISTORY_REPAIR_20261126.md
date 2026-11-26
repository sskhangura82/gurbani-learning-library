# Japji history restoration candidate — 26 November 2026

## Problem and bounded change

Claude's desktop Safari finding SF-01 is reproducible: a reader restored from the browser's back/forward cache keeps its JavaScript state, but Safari returns its viewport to the top while `history.scrollRestoration` is `manual`. The existing `pageshow` handler paused the guide but did not reapply the saved occurrence. Reload testing alone missed this path.

The candidate keeps occurrence-relative restoration and the existing manual-restoration setting. On departure it captures the place, cancels a pending scroll callback, and marks the page suspended. While suspended, scroll callbacks cannot replace the saved place. On return it restores that occurrence immediately and once in the next animation frame, then resumes normal scroll recording. The visual guide remains paused.

No scripture, teaching, storage schema, note content, migration rule, or other reader is changed by this repair.

## Reproduced behavior

`tests/japji-history-browser.mjs` serves the actual reader from a newly allocated localhost origin and inserts synthetic reflections/bookmarks only. With `BASELINE_REF`, only the served Japji controller is replaced by the frozen script from the requested Git revision. Original-source verification still runs.

Actual desktop Safari 26.6 reproduced the old failure in both Read and Meaning. In the candidate, Read with persistent headings, Read with the default receding heading, and Meaning all return to the same occurrence and offset after Library → Back and Forward → Back. A following reload keeps that place. Repeated reloads remain stable, the synthetic reflection and bookmark survive, and a running guide returns paused. Safari recorded `pageshow.persisted: true` and an unchanged `performance.timeOrigin`, establishing that the cached-document return path was exercised.

At the 650 ms settled observation used here, the old script's delayed scroll callback had also saved the incorrect top occurrence. This adds a delayed observation to Claude's earlier report that the stored place initially survived. It does not invalidate his observation at a different point in the lifecycle.

The same candidate scenarios pass in a fresh Chromium context at a narrow viewport. Chromium's automation history path does not establish Safari back/forward-cache behavior; the actual Safari run supplies that evidence.

## Reproduction commands

From the repository root on the connected Mac:

```sh
ENGINE=safari BASELINE_REF=792afa209c98bb53f257a8dfd5500bef10bfc8e3 node tests/japji-history-browser.mjs
ENGINE=safari node tests/japji-history-browser.mjs
ENGINE=chromium CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/japji-history-browser.mjs
```

The baseline command is expected to fail. Each Safari run launches and closes its own safaridriver session. It does not attach to personal browser tabs or read a production origin. No service worker is installed by this focused history test.

Evidence:

- `evidence/japji-history/safari-baseline.json`
- `evidence/japji-history/safari-candidate.json`
- `evidence/japji-history/chromium-candidate.json`

The reports identify the served controller by SHA-256 and contain only synthetic records.

## Limits and review status

This is builder verification, not independent approval or a release. Claude must independently recheck the candidate. Physical iPhone, Safari on iOS, Home Screen, VoiceOver, and airplane-mode acceptance remain outstanding. The frozen reader and the phone-test deployment have not changed.
