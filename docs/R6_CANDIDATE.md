# Work Order 008 — Revision 6 Darbar reader

Runtime baseline: R5 `c1bc7c90ef172509edd6dc7b206bc6b8f2a6a9ec`, preserved as tag `japji-v1-0.9-r5`. Work began from verified main after documentation PR #1; subsequent main advances were isolated `qa-r6/` test fixtures, never replacement family reader assets. Candidate PR: #3. Runtime worker: `0.9-japji-v1-r6-darbar-6`.

## Implemented

- All 385 original Gurmukhi occurrences remain in one mounted document. Source text, whitespace, hashes and guide token indexes are preserved. All 385 bilingual meaning drafts, 42 Study drafts and review labels remain. Eleven frozen scripture/editorial/directory/learning/PWA files are byte-identical to R5.
- Read and Understand remove decorative scripture containers and pauri rules. Accessible headings and Jump remain. Read uses 9px between tuks and 38px between pauris, with 1.9 line-height and 30px default. Understand attaches meaning at 5px and separates subsequent tuks by 19px.
- One 54px dock, excluding safe-area inset, contains six targets of at least 44×44px: Play/Pause, current location/Jump, Read, Meaning, Study and expansion. The entire dock stays visible in immersive mode. Expansion exposes every secondary action; Escape returns focus. A persistent-page-controls preference is saved in the existing version-2 learning record with Web Locks merge protection.
- Read/Understand switches retain the reading occurrence, offset and independent guide index, including during Play. Study pauses the guide. Meanings can open without resetting the clock and return to the same reading place.
- Mool Mantar uses 600-weight typography without a card. A presentation-only span keeps each terminal danda/numeral with its preceding word. At ≤380px, 10px main margins and no inner tuk padding keep even the Pauri 25 ending pair inside the column at 48px. No scripture was shortened or edited.
- Active color and underline change together immediately; only the restrained shadow transitions. Reduced motion suppresses all shadows and transitions in both radiance states. Day/Amrit Vela, optional radiance, pause/resume, saved reflections/bookmarks, related teachings, raag context and the gurdwara directory remain available.
- Horizontal depth gestures are deferred until actual iOS navigation and VoiceOver can be checked. Visible buttons and keyboard access are the supported controls. No edge gesture interception, audio, TTS or false recording alignment was added.

## Evidence

| Check | Result and scope |
| --- | --- |
| Portable Node suite | 53 PASS: 27 source/learning, 8 service-worker, 12 shared-learning, 6 R6 contracts |
| Browser interactions | 47 PASS, desktop Chrome at 320/390/844 CSS px; includes all 385 ending pairs at 30/48px, active-Play mode change, exact DOM reconstruction and focused controls above the dock |
| Reduced-motion branch | 8 PASS, forced `matchMedia` branch and extracted production CSS; explicitly not an OS-toggle or iPhone test |
| Independent Claude review | PASS DESIGN, `CLAUDE_R6_DESIGN_REVIEW.md`; bounded AI review, not religious or language approval |
| Screenshot set | Nine final-runtime captures under `docs/screenshots/r6/`; themes, depths, Pauris 1/2/3, immersive, longest source occurrence and 320px/48px |
| Actual HTTPS lifecycle | Final darbar-6 → unique R5 rollback passed with three synthetic learning generations, bookmarks, theme, 36px text and radiance choice; R6-created reflection also retained. Final R5 → R6 return and cached reload after server files returned HTTP 404 also PASS; `evidence/r6-https-final-lifecycle.json`. |
| Elapsed-time performance | First R6 31-minute run PASS, all 385 nodes stable, no observed interruptions/long tasks. Final darbar-6 run also PASS: 31.000005 active visible minutes, no failures or visibility interruptions. This observes performance and DOM stability, not a complete timed reading of all 385 occurrences. |
| Physical iPhone/Safari | NOT TESTED: portrait/landscape, real Dynamic Type, VoiceOver, Home Screen, notched safe-area and airplane mode. Only a Mac and desktop Chrome were available. |

The 47 viewport checks do not establish storage safety on an insecure origin; storage is checked separately over actual HTTPS using `glp001.qa-r6.*` records. No family learning key is seeded, exported or written by that fixture.

The supplied R5 measurements were 60.6px sticky top controls plus 57px dock = 117.6px. R6 removes the sticky top bar and uses a 54px dock, reducing that measured reserved chrome by 63.6px (54.1%). A typical one-row tuk is 57px tall, or 66px including the next-tuk gap. These are desktop CSS measurements, not physical-device acceptance.

## Findings retained honestly

Claude's first review was blocked by an incomplete screenshot manifest; its second identified three design defects. All three were fixed before the third PASS. The new tests also found a real active-color lag and the oversized Pauri 25 ending pair at the largest narrow-screen setting; both were corrected.

Two harness errors were corrected: label comparison initially counted an aria-hidden dot, and an old update observer incorrectly used the unchanged human-facing “Revision 6” label to infer reload between two R6 worker versions. The lifecycle harness now waits for the iframe load event. An initial final-retention check encountered the radiance value deliberately changed by another QA tab; the final lifecycle run restored the explicit fixture setting and separated viewport QA onto a different origin. The failing records remain in evidence.

Nonblocking Claude follow-ups remain: repeated per-passage meaning hint; narrower apparent pauri separation in Understand; truncated visual location at 320px (complete accessible name retained); meaning-button speech-name refinement; platform-specific Mool font-weight inspection. The first reduced-motion block is drift-checked; the second is redundant. Ending geometry is swept in Read; the source column width is shared by the other depths.

Pauri 13, line 1 independent comparison remains **OPEN**. No source was silently repaired. All 385 meanings and 42 Study lessons remain unreviewed AI-assisted drafts pending qualified Sikh/Punjabi/santhiya review.

## Reproduce

Run `node tests/verify.mjs`, `node tests/service-worker.mjs`, `node tests/shared-learning.mjs`, and `node tests/r6-contract.mjs`. Serve the static files and open `tests/reader-browser.html`; the test waits for reader/font initialization. `tests/long-session.html` measures 31 real visible minutes without acceleration. `tests/generate-reduced-motion-fixture.py` regenerates the forced-motion fixture from production CSS.

`tests/sw-browser.html` permits seeding/loading only on an isolated HTTPS test location and refuses to overwrite non-fixture records. Deployment copies must replace the learning prefix with `glp001.qa-r6.` and use an independent worker scope. The temporary public QA fixture is removed after testing. Do not expose the project root, private notes, account material or credentials.

See `R6_RELEASE_AND_ROLLBACK.md` for operator instructions. Applicable desktop and HTTPS acceptance gates are closed in `R6_ACCEPTANCE.md`. The exact promoted commit is recorded in the subsequent release receipt.
