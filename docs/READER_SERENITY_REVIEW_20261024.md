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
- No change to original corpus, meanings, 42 Study drafts, 385 occurrence IDs, navigation/learning/persistence JS, multimedia, location, or permissions. The **draft review branch** now regenerates its candidate service worker with a unique review version and includes the Serenity CSS in the hash-checked precache. The live family service worker remains untouched.

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

**Additional engineering verification (24 October, Pacific):** The original manifest was stale relative to the changed reader HTML and omitted `css/reader-serenity.css`. Corrected `tests/build-sw.mjs`, regenerated **review-only** `sw.js` version `0.9-japji-v1-m0-serenity-review-1`, and added a 48-assertion precache/source-reference check (**PASS**). An isolated, real Mac Chrome service-worker run on trusted loopback passed **10 independently recorded checks** across R7 → M0 Serenity → R7 rollback → M0 Serenity repeat, explicit waiting/activation, preservation of QA-only notes/bookmarks, cache generation and CSS/scripture during simulated origin HTTP 503. The actual fixture `tests/m0-serenity-real-browser.mjs` and `evidence/serenity-real-lifecycle.json` record stage versions and clean results. The fixture patches the HTTPS-only registration guard **in temporary copies only** to enable secure loopback; production `js/pwa.js` stays byte-identical.

**Still not tested:** physical iPhone Safari, 200% iOS Dynamic Type, VoiceOver screen reader, installed Home Screen, actual audio player integration, real airplane mode, long-reading session or real family cross-tab upgrade behavior. No qualified editorial acceptance. This does not clear PR #11's separate M0 release hold. PR #11's screenshot set remains the baseline for comparison.

## Integration, rollback and next work

1. Ask PR #11's review owner to compare these before/after screenshots and measure 320/390/large-text interaction. Do not merge this child branch directly to main while M0 is blocked.
2. On acceptance, integrate as a scoped CSS overlay into the same reader codebase and regenerate the **versioned service worker** with `tests/build-sw.mjs`, using a fresh release version; do not reuse an installed cache ID.
3. Verify on an actual iPhone and pass the existing M0 gates. Only then promote.
4. Rollback: revert the overlay and its precache-list addition together. If a later release had been installed, generate a **new unique** rollback worker version from the accepted files (never reuse an installed cache ID); no migrations or stored-learning changes.

This candidate does not modify the current anonymous GitHub Pages family release, Governed Studio production, GitHub protected settings, or anyone's bookmarks.
