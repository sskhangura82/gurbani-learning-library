# PR #78 — real YouTube readiness and marker-jump repair

Prepared November 28, 2026 (America/Los_Angeles). Builder evidence; not release approval.

## Outcome and exact scope

Claude's [live-provider finding](https://github.com/sskhangura82/gurbani-learning-library/pull/78#issuecomment-7234549597) was correct. The prior draft rejected the real YouTube player before its playback methods existed. Its synthetic players exposed those methods too early and therefore missed the defect.

The repaired application runtime is **`55ccad9b150de130370cda5eeaefec2bc6974ac9`**. The implementation commit is `3e6017453a2b1f6702cc859d82431b7e08c896cf`; the next commit gives the repaired candidate a distinct offline-cache version. The live YouTube diagnostic used the exact repaired runtime. The full feature-browser run used `3e60174`; every application input it read is byte-identical at `55ccad9`.

Both B1 and L6 are repaired. PR #78 remains a draft. No merge, production deployment, browser-key configuration, or change to the family's saved learning was performed.

## What changed

### B1 — validate playback controls at player readiness

Construction now requires the cleanup method `destroy`. The complete clock/playback-method check runs in the player's `onReady` handler, before any clock read. This follows YouTube's documented distinction between [SDK availability and player readiness](https://developers.google.com/youtube/iframe_api_reference#onReady).

If methods are still missing at readiness, the adapter reports `YOUTUBE_PLAYER_INVALID` and disposes its own iframe and timers. This also works when the consumer only records the error. Constructor-synchronous callbacks, current-player identity checks, cancellation, late-event protection, timeouts, and hidden/offscreen pauses are retained. Zero duration at readiness remains valid while metadata loads.

Both synthetic SDKs now attach playback controls only when they dispatch readiness. Their prototypes do not expose those methods early. The browser test can deliberately withhold readiness and checks that the connecting iframe survives without clock reads, seeks, or enabled marking controls.

### L6 — return to the player before seeking

A marker-list activation immediately scrolls the stable workspace into view, then seeks. Keyboard focus follows the jump to the native iframe with `preventScroll`, so it is not left below the player. Replay beside the player retains its existing behavior.

The offscreen-pause rule remains active. If reviewing the lower marker list has already paused playback, a jump returns a visible, paused player at the selected time. It does not automatically resume playback.

The new browser regressions use normal pointer clicks and Enter activation at 320×640 and 1280×900. They inspect the iframe's actual rectangle inside the synthetic `seekTo` call and again after observers run. They also verify the selected repeated occurrence, focus, and paused state.

### Packaging — separate the repaired candidate's cache

The candidate cache version advances from `0.31-youtube-bani-read-along-20261127-3` to `0.31-youtube-bani-read-along-20261128-1`. Reusing the old version with changed assets could let a failed same-origin candidate installation delete the active candidate's cache. The generator and worker agree on the new version. Owned bundle, HTML integrity, build graph, and offline receipts were regenerated without weakening their checks.

## Verification

| Check | Observed result |
| --- | --- |
| Updated readiness browser case against original `206cddb` | Fails: old adapter destroys the unready player |
| Marker-jump cases against original `206cddb` | Both widths fail: player is offscreen when seek is called |
| Updated player contract suite against original source | 11 pass / 14 fail, before the adapter repair |
| Repaired player contract suite | 25 pass |
| Focused source, timing, provider, access and integrity contracts | 88 pass |
| Build-toolchain and workflow-coverage contracts | 16 pass |
| Service-worker simulation | 9 pass |
| Complete listen-along browser suite | 42 pass |
| Actual browser offline/update checks | 7 pass |
| Real SDK, embed and streamed recording on the Mac | Pass; details below |
| GitHub checks on runtime `55ccad9` | 22 successful jobs across 12 workflows |

The initial local contract run could not find two historical commits referenced by preservation checks. Fetching those exact existing objects resolved the checkout prerequisite; the final complete 88-case run passed without changing those tests or their references. The offline/update suite compares the existing frozen `e0a6cff` release with this candidate and checks failed installations, retained cache contents and synthetic notes, explicit activation, and offline rendering.

The feature-browser simulations still do not count as live playback evidence. Their provider responses are labelled TEST ONLY. The unconfigured production bundle is exercised separately and makes no provider requests. The live diagnostic is documented separately below.

## Real YouTube diagnostic on the Mac

The diagnostic uses recording `8soV6l6is4Q` in a fresh headless Chrome context. The official `www.youtube.com/iframe_api` script, `youtube-nocookie.com` embed, and `googlevideo.com` media responses are real and unmodified. The player reaches Ready and reports approximately 23 minutes 27 seconds.

Only the public configuration slot and the Data API status response are supplied as test fixtures in memory. The HTML integrity pin is recomputed for that configuration-only bundle. No runtime logic is bypassed, no real key is used, and the repository configuration remains empty.

Four deliberately spaced marks and an ending/text-pause mark are entered through the application while the real media clock advances. A normal marker-list click returns the player to view and leaves it paused. After test-triggered playback resumes, the active-row sequence is **`[1, 2, 3, 4, null]`**. The exact marks, samples, native seek observations, provider host categories, screenshots, runtime hashes, and limitations are in the [native report](../evidence/listen-along-b1-l6-20261128/native/report.json).

These marks test clock following. They are not recitation-aligned teaching timings and must not be shipped as a usable timing map. Audio is muted. Playback is started by a test API command with a headless autoplay override; it is not a human tap-to-play test. The harness closes its own browser and localhost server.

## Preservation and remaining work

Of the 376 application files at the reported baseline, **371 remain byte-identical**. The five changed application files are the adapter, companion controller, generated companion bundle, companion HTML integrity pin, and candidate worker. Original Gurbani, translations, study content, source bindings, provider configuration, older readers, private material, and saved-learning code are unchanged. Tests use synthetic learning records. See the [preservation inventory](../evidence/listen-along-b1-l6-20261128/application-preservation.json).

Before enabling this feature for family use, the remaining checks are:

- Real YouTube Data API status lookup with an owner-controlled key restricted to the intended website and API.
- Native tap-to-play, permitted recordings, seek behavior and advertisements on the intended origin.
- Physical iPhone/Safari and assistive-technology acceptance.
- Claude's focused review of this correction and Steve's merge/release decision.

Claude's separate L1–L5 product observations are not closed by B1/L6: default edition and pause-mark display, timing-control wording, reuse of existing meanings, a practical first-recording timing experience, and key restrictions remain in their existing workstream. Existing teaching should be reused through verified mappings; this repair does not rewrite it.

## Reproduction and rollback

Install the pinned build tooling with `npm ci --prefix tools/script-integrity --ignore-scripts`. The relevant automated commands are:

```sh
node --test tests/youtube-player-contracts.mjs
node tests/youtube-read-along-browser.mjs
node tests/library-script-integrity-offline.mjs
node tools/build-app-bundles.mjs --check
node tools/refresh-app-sri.mjs --check
```

The browser suite accepts `GLP_PLAYWRIGHT_MODULE`, `GLP_CHROMIUM_EXECUTABLE`, `GLP_YOUTUBE_OUTPUT`, and an optional `GLP_YOUTUBE_SCENARIO` substring for focused reproduction. Its default runs the complete suite. Use `GLP_TARGET_DIRECTORY` pointing at an isolated `206cddb` checkout to reproduce the two old defects. Historical preservation checks also require their referenced git objects, as the full-history CI checkout provides.

The [live diagnostic harness](../tests/youtube-read-along-live-smoke.mjs) accepts `GLP_TARGET_DIRECTORY`, `GLP_EXPECTED_COMMIT`, `GLP_YOUTUBE_OUTPUT`, `GLP_PLAYWRIGHT_MODULE`, and a Chrome channel or executable override. Its output must be outside the target repository. Run only against an isolated public-source checkout with an empty provider configuration.

No production rollback is needed because this change has not been released. If the repair must be withdrawn from the draft branch, revert `55ccad9` followed by `3e60174` on that branch and keep the PR in draft. This returns the previous candidate with its known B1 defect; it is not a release recommendation.

## Evidence index

- [Verification summary](../evidence/listen-along-b1-l6-20261128/summary.json)
- [Old readiness failure](../evidence/listen-along-b1-l6-20261128/red-b1/report.json)
- [Old marker-jump failures](../evidence/listen-along-b1-l6-20261128/red-l6/report.json)
- [Updated player contracts against the old adapter](../evidence/listen-along-b1-l6-20261128/player-contracts-baseline.log)
- [42-case browser report](../evidence/listen-along-b1-l6-20261128/browser/report.json)
- [Final 88-case contract output](../evidence/listen-along-b1-l6-20261128/node-contracts-final.log)
- [16 toolchain and workflow contracts](../evidence/listen-along-b1-l6-20261128/toolchain-workflow-contracts.log)
- [Offline/update report](../evidence/listen-along-b1-l6-20261128/offline/report.json)
- [Runtime GitHub checks](../evidence/listen-along-b1-l6-20261128/github-runtime-checks.json)
- [Real recording, returned to the visible paused player](../evidence/listen-along-b1-l6-20261128/native/marker-jump-visible-paused.png)
- [Real recording with clock-driven line following](../evidence/listen-along-b1-l6-20261128/native/real-clock-following.png)

The older consolidation and Claude-review files retain their historical claims and exact targets. This document records the later defect, correction, and new evidence. Internal builder peer inspection is not labelled as Claude's independent review or release approval.
