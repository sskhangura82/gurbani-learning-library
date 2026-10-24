## Independent bounded follow-up — candidate 2 (runtime b599b11)

**Scope.** Re-check of D1, D2, D4 and the documented D3 choice only. Read-only. Code statements are source inference from `js/japji-full.js`, `full-japji.html`, `css/japji-full.css`, `sw.js`, `tests/m0-reader-browser.js`; visual statements derive only from the four named desktop-Chrome screenshots. No physical-device, VoiceOver, service-worker, persistence, religious or translation claim is made.

### Verdicts

**Design: CONDITIONAL PASS.** D1, D2 and D4 are resolved in the candidate source and covered by new checks. D3 is an explicit, disclosed tradeoff, not a fix. D5, D6, D10 remain open as before.

**Release: BLOCKED for merge and publication** — independent of the design verdict. The three NOT-RUN gates (actual R7→M0→R7→M0 lifecycle, real-browser saved-learning write/reload/upgrade, physical iPhone/Safari/Home Screen/VoiceOver/airplane mode) are unchanged, and `evidence/m0-browser.json` still records `secureContext:false`, `serviceWorkerAPI:false`, `webLocks:false`. Pauri 13 line 1 is OPEN.

### D1 — Resolved
`READER_VERSION='0.9-japji-v1-m0-candidate-2'` (`js/japji-full.js:4`) is the single source for both the Sources panel (`:182`) and `GLP_CONTINUOUS_DEBUG.version` (`:238`); no `r6` literal remains. `sw.js:2` `VERSION="0.9-japji-v1-m0-candidate-2"`. The browser check (`tests/m0-reader-browser.js:63`) asserts the panel text contains the running `GLP_CONTINUOUS_DEBUG.version` and excludes `r6 · public`, so panel and identity cannot diverge.
*Residual (LOW):* three hand-maintained literals still exist — the JS constant, the footer string `M0 candidate 2` (`full-japji.html:19`) and `sw.js` `VERSION`. No check cross-verifies them.

### D2 — Resolved, with a narrowed residual
`css/japji-full.css:55` now sets `.scripture-line .expand-hint{display:block}`; the prior first-occurrence-only suppression is gone, and no `quiet-reading` rule overrides it. The hint is inside `.simple-meaning`, so it appears exactly where meanings appear. Check `:42` asserts all 385 hints have computed `display!=='none'` and contain "Draft meaning" while playing in immersive mode.

Scripture dominance holds in both inspected 390px screenshots: 30px Gurmukhi above ~14px English / ~16px Punjabi and a 10px accent hint, one per meaning. The repetition reads as a quiet recurring footnote, not competing text, in Day and Amrit Vela.

*Residual (LOW-MED):* (a) the page-level `#coverage-note` banner is still clipped under `body.quiet-reading` (`:79`), so visible disclosure now rests entirely on the 10px per-line hint; (b) each meaning button carries `aria-label="Read more about … line N"` (`js/japji-full.js:58`), which overrides its inner text, so the hint is visual-only — the clipped banner remains the only draft disclosure in the accessibility tree. Belongs on the VoiceOver gate; (c) the check tests `display` only, not clipping, size or contrast, and hint legibility at 60px scripture is not inspected.

### D4 — Resolved
`full-japji.html:33` adds `#pace-menu` "← Reading menu" as the first element of the pace tray; `js/japji-full.js:201` wires it to `closePaceTray(readingTools)`. The `close` listener (`:85`) restores the pace anchor, focuses `#tools-open`, then runs the queued callback, so Back lands in the Reading menu and X/Escape (native dialog close, no callback) land on the visible dock. Both paths are separately checked (`tests:36`): "Pace provides an explicit return to the grouped Reading menu" and "Closing pace returns keyboard focus to visible dock". `m0-pace-back-390.jpg` shows the button rendered above the tray heading with the unsynchronized-guide line intact.

### D3 — Documented choice, not dissolved
The dock still reads **Meaning** (`full-japji.html:26`) with accessible name "Meaning · Understand in English and Punjabi". Sources now says "**Meaning (Understand):**" (`js/japji-full.js:182`) and the QA frame button reads "Meaning (Understand)" in all four screenshots. The mapping is now explicit and the 44px/one-word constraint is real, so the tradeoff is defensible. The concern is reduced, not removed: "meaning" still names three objects (dock mode, per-line draft, Study "Passage meaning"), and work orders, certificate history and test names keep "Understand".

### Remaining concrete risks
1. `sw.js` `EXPECTED` pins SHA-256 hashes for `full-japji.html`, `css/japji-full.css` and `js/japji-full.js` — all changed in candidate 2. I cannot verify read-only that the manifest was regenerated; a stale entry fails install with "Reader release hash mismatch", and that path is NOT RUN.
2. D5 (long unit titles at 320px), D6 (unannounced automatic immersive entry), D10 (sequential traversal of 385 meaning buttons) remain deferred to the physical-device matrix.
3. Pauri 13 line 1 and qualified religious/translation review remain open.

Nothing here authorises merge, deployment or replacing the R7 family release.
