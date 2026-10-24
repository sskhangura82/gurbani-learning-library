# GLP-001 Revision 7 — public release and rollback

Published 2026-10-23 (Pacific) through merged [PR #5](https://github.com/sskhangura82/gurbani-learning-library/pull/5).

- **Production GitHub main merge receipt:** `57d0acdf43b6f4935e159468128ec9a503b5aaa1`
- **App code candidate commit:** `77fd8f0f819f05b317558abbe1baf0924e6e9e4c`
- **Previous accepted R6 main receipt:** `afd5843ac6a85b872a7edd1786c1fef3c4d37a2a`
- **Preserved R6 accepted runtime:** `fa6e4fecd1a5c602b30ffd13ca23416ae911ea83`; previous Git tag `japji-v1-0.9-r6`.
- **Family home:** https://sskhangura82.github.io/gurbani-learning-library/
- **Full Japji deep route:** https://sskhangura82.github.io/gurbani-learning-library/full-japji.html
- **Worker cache version:** `0.9-japji-v1-r7-home-speed-2`

## Actual user-facing changes

The Home Screen entrypoint opens a separate three-destination library home: Nitnem → Japji Sahib, Gurdwaras, Simran Room. Day/Amrit Vela palette persists as a home-only preference and never overwrites the reader's saved learning. The Japji reader remains the original R6 source and editorial layers (385 unchanged original Gurmukhi occurrences, 385 bilingual draft meanings, 42 Study drafts), except for a Home return link and a directly available **50–160 illustrative-token/min visual guide pace slider** with numeric display and 5-step buttons. It is silent, not audio-synchronized.

The three Gurdwara Arrival pages provide verified institutional history, accurate IANA local clocks and deliberate links to their official broadcaster pages, with separate color atmospheres and no fabricated live information. They contain no photographs pending cleared usage rights. The jade/teal Simran Room is an optional silent-sitting *preview*, with exactly referenced Japji Pauri 4 Ang 2 Gurbani. It is not yet a reviewed Naam Simran lesson.

The manifest retains app ID `./` but changes launch entry to `./`. Existing iPhone Home Screen icons may continue opening their originally installed `full-japji.html` URL. **Do not clear site data.** To add a Home icon, open the family home in Safari → Share → Add to Home Screen. If Safari and standalone app maintain separate storage, export saved learning from one and import into the other. No login or paid account is required.

## Verification evidence

- Revision 7 candidate: 66 portable Node checks (27 core source/learning, 8 SW, 12 shared learning, 7 inherited R6, 12 R7).
- 36 isolated Mac Chrome journey checks covering 320/390px home, reader, 160 pace, save/reload, all Gurdwara and Simran routes.
- 8 offline network-emulation checks: 32 hash-verified shell responses; home/reader/room pages loaded with simulated network offline.
- 16 actual isolated trusted-loopback browser service-worker lifecycle checks: R6→R7→R6 rollback→R7 return, preserving three synthetic saved-learning generations, bookmarks and original reflections, plus adjusting 160 visual pace.
- **36 production HTTPS Chrome checks passed** using a fresh isolated profile (see `evidence/r7-public-browser.json`).
- **All 32 public source assets were HTTP 200 and SHA-256 identical** to the release worker's pinned manifest (see `evidence/r7-public-assets.json`).
- The first public browser test incorrectly classified the ordinary same-origin `https://sskhangura82.github.io/favicon.ico` request as a third-party request, because it lies outside the Pages project path. The test was corrected with that **exact same-origin/favicon.ico whitelist only**, and all 36 checks passed. No other out-of-project or third-party application requests were observed. The corrected test is `tests/r7-browser.mjs`.

## Rollback (not performed on the public site)

Preserve R6 and R7 source. A rollback **must be a complete runtime**, not merely removing the SW. Use a separate checkout from R6 accepted runtime/tag, restore its exact root entrypoint, reader, scripts, styles, manifest and all files from that pinned version. Rebuild the service worker with `node tests/build-sw.mjs <fresh-never-used-rollback-worker-version>`, validate all pinned hashes, run source/learning/upgrade contracts, create a reviewed GitHub PR, and publish only the complete verified bundle. Do **not force-push**, reuse an older installed worker version, clear LocalStorage, or reset the family reader's saved state. Install/activate explicitly and verify note continuity with synthetic learning first.

If the family needs an older full reader while R7's home is reviewed, the direct `full-japji.html` route remains available within the live site.

## Open acceptance / religious integrity

- Physical iPhone Safari, Home Screen, VoiceOver, Dynamic Type, actual reduced-motion and actual airplane-mode offline functionality: **NOT TESTED**; Chrome viewport simulation is not equivalent.
- The Gurmukhi Pauri 13 line 1 independent comparison remains **OPEN**; no scripture bytes changed.
- The bilingual meanings and Study passages remain AI-assisted **DRAFTS** awaiting qualified Sikh/Punjabi/santhiya review.
- More complete Simran guidance and gurdwara photos, relevant licensing and external media playback are **NOT approved/implemented**.
- The standalone research prototype in [PR #4](https://github.com/sskhangura82/gurbani-learning-library/pull/4) remains unmerged and nondeployed. R7's limited silent Room and arrival link designs were separately implemented under the founder's instructions; do not mistake PR #4 for a production merger.
- Browser learning is local to the device/profile; not synced among relatives. The public family link can be accessed by anyone with the URL, not a private authenticated site.

Source/design documentation: `docs/R7_HOME_SPEED_AND_SPACES.md`, `docs/TEACHING_EXPANSION_ARCHITECTURE.md`, `docs/R7_RELEASE_CANDIDATE.md`.
