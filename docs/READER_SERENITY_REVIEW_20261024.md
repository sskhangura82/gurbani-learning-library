# GLP-001 — serene continuous-reader overlay · nondeployed review candidate

**24 October 2026 · Reader UX review only · branch parent: PR #11, head `97f4cf82f9b99198de8239934718d8e7db0c0bf0`.**

The founder's iPhone screenshot of the older Cloudflare reader showed large mode tabs, a tall explanatory top bar, outsized Mool Mantar whitespace and a double-row dock occupying valuable vertical space. The accepted R7 reader and PR #11 already corrected much of this: original Gurbani is continuous, mode switches occur within the same page, and M0 reduces the dock to six stable ≥44px controls.

This candidate is deliberately an **overlay on PR #11**, not a parallel application or override of that PR's review authority.

## Actual change

- Add `css/reader-serenity.css` after existing `css/japji-full.css` in **full-japji.html only**.
- Compact the mobile title into one quiet line with Punjabi beside English instead of a multi-row hero.
- Decrease gaps between pauris and adjacent original lines in Read/Understand, preserving a **roomy spacing** user option.
- Reduce the weight of explanatory chrome. The global review note remains accessible to assistive technology, while the individual 385 meaning controls retain their visible Draft labels.
- Keep the six M0 reading controls as one **52px dock**, each with at least 44px touch height/width. Play, current location, Read, Meaning, Study and More remain directly reachable. No new auto-hiding gesture or timer.
- Keep original text/punctuation untouched; keep line radiance, while honoring `prefers-reduced-motion`.
- No change to original corpus, meanings, 42 Study drafts, 385 occurrence IDs, navigation/learning/persistence JS, service worker, multimedia, location, or permissions.

## Evidence

A fresh, isolated headless Chrome was launched against the actual local HTTP origin, at **320×740** and **390×844** mobile-simulated CSS dimensions. **18 focused browser checks passed; no browser JS exceptions observed.**

| Test | 320px | 390px |
|---|---:|---:|
| First source line from viewport top (Read) | 90px | 96px |
| Bottom reader dock height | 52px | 52px |
| Horizontal overflow | None | None |
| Persistent dock controls | 6 with ≥44px targets | 6 with ≥44px targets |
| Understand mode | 385 source + meaning records remain | Same |

Additional PASS: 200%-sized Gurmukhi at 320px reflows without horizontal overflow; visual Guide Play/Pause responds; all **385 original strings** exactly reconstruct the frozen source; all **385 English/Punjabi meaning records** and **42 Study records** remain mounted. `node tests/m0-contract.mjs` (9 checks) and `node tests/m0-coverage.mjs` passed.

Screenshots: `evidence/serenity-read-320.png`, `serenity-read-390.png`, `serenity-understand-320.png`, `serenity-understand-390.png`, `serenity-large-320.png`.

**Not tested:** physical iPhone Safari, 200% iOS Dynamic Type, VoiceOver screen reader, installed Home Screen, actual audio player integration, long-reading session or cross-tab upgrade behavior. This overlay is not evidence that PR #11's M0 blocked gate can be waived. PR #11's screenshot set remains the baseline for comparison.

## Integration, rollback and next work

1. Ask PR #11's review owner to compare these before/after screenshots and measure 320/390/large-text interaction. Do not merge this child branch directly to main while M0 is blocked.
2. On acceptance, integrate as a scoped CSS overlay into the same reader codebase and regenerate the **versioned service worker** with `tests/build-sw.mjs`, using a fresh release version; do not reuse an installed cache ID.
3. Verify on an actual iPhone and pass the existing M0 gates. Only then promote.
4. Rollback: remove the one CSS link and the added CSS file; no migrations or stored-learning changes.

This candidate does not modify the current anonymous GitHub Pages family release, Governed Studio production, GitHub protected settings, or anyone's bookmarks.
