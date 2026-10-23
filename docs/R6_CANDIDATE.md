# Work Order 008 — Revision 6 candidate

Base: `3a1005067742b70f57d536c7ee494278efd71c59` (documentation/QA merge of PR #1). Runtime baseline remains R5 `c1bc7c90ef172509edd6dc7b206bc6b8f2a6a9ec`. The public family reader is unchanged while this candidate is tested.

Candidate worker version: `0.9-japji-v1-r6-darbar-3`.

## Implemented

- One continuous document: all 385 Gurmukhi occurrences, all 385 existing bilingual draft meanings and 42 Study drafts. Scripture, editorial assets, gurdwara directory, learning coordination, import/export and PWA update modules are byte-identical to R5; a portable manifest verifies them.
- Read/Understand have no decorative pauri rules or scripture cards. Accessible headings and Jump remain. Read gap: 9px within a pauri, 38px between pauris; 1.9 line-height at the existing adjustable 30px default. Understand attaches meaning with 5px padding and gives 19px before the next tuk.
- One 54px dock excluding safe-area inset: Play/Pause, current location/Jump, Read, Meaning (accessible name Understand), Study, expansion. All six buttons are at least 44×44 CSS px at 320px and 390px. The complete dock stays visible in immersive mode.
- Header recedes during guided reading or after scrolling into the text. Expansion reveals all options; keyboard Escape closes the dialog and returns focus. Optional persistent-page-controls preference prevents automatic immersive hiding. It uses the existing version-2 learning record and Web Locks merge protection.
- Mode/explanation changes preserve the reading occurrence and independent guide index. Study pauses guidance. Radiance, theme, notes and bookmarks remain available.
- Horizontal page swipes were evaluated and deferred: no edge gesture interception, touchmove cancellation, or VoiceOver-specific gesture claim. Three visible buttons and keyboard access provide depth switching. Physical iOS validation is required before adding gesture shortcuts.

## Evidence so far

- 52 portable Node checks: 27 inherited source/learning, 8 service-worker contracts, 12 multi-tab coordination, 5 new preservation/preference/entrypoint/traversal contracts.
- 38 browser interaction checks in `evidence/r6-browser-checks.json`, using a desktop Chrome iframe at 320/390/844 CSS px. Mode anchor before/after differs by less than 1px in the recorded check. A separate keyboard interaction verified Escape restores focus to Expand.
- `docs/screenshots/r6/`: actual desktop viewport captures, including the QA console outside the mobile-sized reader. Pauris 1, 2, 3 and 24 are represented across the set. These are not photographs of a physical phone. Screenshot cropping failed in the browser service; complete viewport captures are retained.
- R5 supplied chrome measurements were 60.6px top + 57px dock = 117.6px; R6 has no sticky top control bar and a 54px dock, a 63.6px reduction (54.1%) from that supplied R5 measurement. R5's archived `r5-compact-amrit.png` visually shows Day; it is retained as historical evidence and is not accepted as proof of the Amrit theme. Fresh R6 theme attributes and screenshots agree.

## Open gates / honest limits

- Actual HTTPS upgrade/rollback with synthetic saved learning: in progress, separate disposable origin. No family release will be downgraded for this test.
- Independent Claude design PASS/FAIL: requested again after fixing the first review packet and adding focus/motion checks. The first review withheld approval because filenames were not discoverable, and requested explicit focus and reduced-motion evidence.
- Physical iPhone/Safari, Home Screen, VoiceOver, real airplane mode and real Dynamic Type: NOT TESTED; only a Mac is connected and the available automated browser is desktop Chrome.
- A sustained >30-minute real browser scroll session is not yet recorded. Full guide traversal is covered by a deterministic contract, which is not elapsed-time evidence.
- Pauri 13 line 1 independent comparison remains OPEN. No scripture was repaired or substituted. All 385 meanings and 42 Study units remain unreviewed AI-assisted drafts; qualified Sikh/Punjabi/santhiya review remains separate from Claude design review.

## Reproduction

Run `node tests/verify.mjs`, `node tests/service-worker.mjs`, `node tests/shared-learning.mjs`, `node tests/r6-contract.mjs`. Serve the static repo and open `tests/reader-browser.html` for browser checks. On an insecure origin the reader protects learning by refusing unsafe writes; those viewport tests do not establish persistence.

`tests/sw-browser.html` refuses synthetic seeding outside a disposable HTTPS `trycloudflare.com` origin and refuses to overwrite non-fixture learning. It exercises the application's own Check update / Load update flow. The temporary server binds loopback, serves only curated public assets, disables directory listing, and can simulate an unavailable origin. Never expose the project root, account files, credentials or family exports.

## Rollback

Preserve the R5 commit and full release. Rollback must restore the complete R5 static bundle and generate a **new unique** worker version with `tests/build-sw.mjs`; do not delete a worker, reuse an installed cache version or clear browser learning. Close older reader tabs after exporting a backup. Release promotion and its receipt are separate from this candidate record.

## Review follow-up before second Claude pass

- Screenshot manifest now lists exact filenames; `mool-long-line.jpg` shows the longest source occurrence without a container.
- Added focus-in protection: main-column controls are scrolled above the dock when focused. Six meaning checks at 320/390px and 48px plus the final Study action pass. Expanded depth-anchor checks at Pauris 4/24 and closing Salok pass with subpixel offsets.
- Six reduced-motion branch checks pass using test-only `matchMedia` injection and exact CSS declarations extracted from the production media query. This exercises real CSS/guide branches, but is explicitly **not a real OS preference toggle or physical iPhone test**. No section whisper animation exists; location updates do not steal focus.
- The first motion run found an inherited emphasis shadow remaining when radiance was off. The production reduced-motion rule now removes that shadow for both radiance settings; the failing result is retained in `evidence/r6-reduced-motion-before-fix.json`.
- Typical one-row R6 tuk box is 57px at 30px × 1.9 line-height; including the 9px next-tuk gap gives a 66px row pitch. Source wrapping increases actual row height normally. Supplied R5 typical row measurement was 66.5px; this refinement primarily removes section decoration and top chrome, not text size.
- The temporary Cloudflare HTTPS origin was blocked in the available browser. An isolated `qa-r6/` GitHub Pages fixture now uses `glp001.qa-r6.*` keys and its own worker scope. Its addition does not change the family reader root assets.
