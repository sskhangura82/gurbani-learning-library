# Listen-along Bani and teaching handoff

Prepared 2026-11-27 (America/Los_Angeles).

## Outcome and review target

[Draft PR #78](https://github.com/sskhangura82/gurbani-learning-library/pull/78) adds verified Bani choices and compact line-by-line teaching to the existing optional `listen/` companion. It is stacked on PR #77 at `7b0f8a35a093b4d4f10e95a1f65b2201f80d0c58`. The tested application runtime is `8ec9b599dba4d112b6cc371e69d1515d2c9591ab`. Subsequent packaging consists of documentation and evidence; the [complete application digest inventory](../evidence/claude-listen-along/consolidation/application-runtime-hashes.json) records all 376 application files against that runtime.

Claude's supplied patch was retrieved intact, applied with `git am` on its matching production base, and preserved separately as `review/claude-listen-along-20261127` at `b2d34796a4a5f22d3d526b0fd04d495fa0744d30`. Its useful Bani picker, teaching and replay interactions were carried into the newer companion. Its alternate page and weaker timing/import/provider boundaries were not merged wholesale. The [prototype review](CLAUDE_LISTEN_ALONG_REVIEW_20261127.md) records the original reproduction and findings.

The combined application still has an empty YouTube browser configuration. It is a draft implementation with verified source and interface behavior, not a live-enabled release. Production, earlier PR review targets, private material and existing scripture files remain unchanged.

## What the reader can do

The existing complete-source Japji default and SGGS/Dasam complete-passage selection remain available. **Bani** adds the eight existing named readings and Morning Nitnem:

| Selection | Original rows |
| --- | ---: |
| Japji Sahib | 385 |
| Jaap Sahib | 808 |
| Tav-Prasad Savaiye | 43 |
| Benti Chaupai | 121 |
| Anand Sahib | 210 |
| Rehras Sahib | 159 |
| Sohila Sahib | 56 |
| Sukhmani Sahib | 2,027 |
| Morning Nitnem, in the existing five-composition order | 1,567 |

The eight distinct compositions contain 3,809 rows. Morning is a sequence of Japji, Jaap, Savaiye, Chaupai and Anand, so its rows are not additional source material. Choosing a menu item does not load text or connect YouTube; **Open selected text** makes the source change explicit.

Inside **Set or adjust line timings**, turn on **Teach line by line**. The preview shows the exact next row. Press **This line starts now** when that row begins; the app records the actual player time and advances the preview. Select any row again for a repetition. **Text pause or end** marks a gap or ending, **Undo marker** corrects the last edit, and **Save on device** explicitly saves the map. Export/import remain available for moving a timing file between devices.

**Replay line**, beside the visible player, seeks to the start of the currently bounded occurrence. A repeated line uses the occurrence at the present media time. A gap, text pause or unfinished last marker does not invent a line interval. Seeking preserves the existing paused state; replay does not silently force playback.

The player stays beside the text on desktop and above it on a narrow screen. Teaching uses one preview and one large tap button. Long source rows scroll within the preview instead of hiding the button. The final browser checks covered 320×640, 390×844 and 1280×900 layouts with both a long Mool Mantar row and Jaap's short interleaved heading, before and after a teaching tap. They verified the visible player, preview and hit-tested button without corrective test scrolling. The 320px and 1280px screenshots were also inspected visually.

Line markers are the listener's annotations. There is no automatic speech recognition, inferred word timing, estimated pace mode or claim of perfect alignment from a pasted link. Playback-rate changes follow the player's real clock; the accuracy of a saved map still depends on when its marks were made.

## Source and timing protection

The adapter fetches only the selected existing files, bounds their bytes and verifies independent pinned SHA-256 receipts before parsing. Existing JavaScript data wrappers are parsed as inert JSON, never evaluated as scripts. Every row's existing digest is checked, full original strings are retained, and missing crypto or a failed constituent prevents the whole selection from rendering. Prefaces, headings and Jaap Chhand 62's interleaved heading retain their exact order.

Named Bani readings have a separate edition identity from the complete SGGS/Dasam corpus. Timing files bind the recording, collection, exact selection, edition receipt, constituent order and all source hashes. Identical row counts do not permit cross-edition reuse. Invalid or foreign imports leave the current reading and timings intact. This verifies fidelity to the pinned digital edition; it does not upgrade that edition's editorial or collation status.

The existing provider adapter and configuration are unchanged. Explicit Load consent, required video-status lookup, current video identity checks, stale-request cancellation, hidden/offscreen pauses, disposal and the privacy/YouTube-terms notice are retained. A source selection or shared address does not connect to YouTube automatically. Saved timing operations remain separate from older notes, bookmarks and private storage.

## Recorded verification

| Combined runtime 8ec9b59 | Result |
| --- | --- |
| Source, timing, provider, integrity and access Node contracts | 86 passed |
| Additional private-library and workflow contracts | 14 passed |
| Service-worker simulation | 9 passed |
| Read-along UI in actual Mac Chrome | 35 passed |
| Existing navigation in actual Mac Chrome | 10 passed |
| Actual offline/update regressions in Mac Chrome | 7 passed |
| GitHub checks on runtime 8ec9b59 | 22 passed across 12 workflows |

The new Bani source tests verify all 3,809 distinct rows and the 1,567-row Morning sequence, raw receipts, literal strings, interleaved headings, forged text plus a changed embedded row digest, missing crypto, partial failure and cross-edition refusal.

Positive read-along browser cases use separately configured fixtures with **TEST ONLY** metadata, SDK and iframe responses. They prove the owned interface's behavior with a controlled media clock. The unchanged empty-config candidate is tested separately and makes zero provider requests. The report records the runtime, input digests, browser environment and request traces. These tests do not certify live YouTube playback, advertisements, actual recitation alignment or physical iPhone/Safari behavior.

The original prototype was tested separately: its 17 logic tests and 137 checks in ten older suites passed. On actual Mac Chrome, its original browser assertions produced 22 passes and one share-path failure: the Copy link action used `navigator.share`, while the test assumed an immediately populated clipboard. That failure is retained and is not relabelled as a pass.

The original prototype also underwent native YouTube diagnostics with fresh browser contexts and no SDK/iframe replacement. Japji `8soV6l6is4Q`, Jaap `0TzTgHveO_I` and alternate kirtan `kDI-2FPyu3w` played. The alternate kirtan's actual playback rate changed to 0.75. Kirtan `BpMxd2gT9G0` refused embedding and displayed the normal YouTube fallback. These observations establish native desktop playback in that original prototype; they do not certify the combined candidate or the correspondence of marked text to recitation.

## Independent Claude Code review

The connected Claude Code review is being recorded separately for runtime `8ec9b599dba4d112b6cc371e69d1515d2c9591ab`. Its final result belongs in the adjacent evidence before this handoff is finalized. Builder records retain their original review labels; any independent review is scoped to this increment and cannot be treated as historical-content approval or approval of the older stack.

## Size, build and preservation

The companion's unique owned HTML, stylesheet and bundle total **123,273 bytes** before transport compression, an increase of **24,241 bytes** over PR #77. This excludes YouTube's resources, existing on-demand source files and timing maps. No audio/video file is downloaded or hosted by the application.

A synthetic map marking every named Japji row plus its end is **14,693 bytes**; equivalent capacity examples are 83,176 bytes for Sukhmani and 59,498 bytes for Morning. These use synthetic three-second intervals and are size measurements, not measured recitation maps. The exact construction and byte counts are in [timing-size.json](../evidence/claude-listen-along/consolidation/timing-size.json). The accepted timing-file limit remains 256 KiB. No media enters the public offline cache.

The owned build contains six bundles, 41 declared graph inputs, 25 HTML pages and 62 script-integrity attributes. The public offline shell has 125 assets. Only two application modules are added; six existing application files change relative to PR #77. The exact eight-path increment is in [change-scope.json](../evidence/claude-listen-along/consolidation/change-scope.json). Source text files, provider adapter, provider configuration, private material and older learning schemas are unchanged.

## Remaining release work

1. Configure an owner-controlled YouTube Data API v3 browser key restricted to the intended website referrers and that API. The browser key is public client configuration, not a private account credential. No project, credential or billing setting was created in this work.
2. Rebuild the owned bundle and refresh its integrity/offline/change-scope records for that configured runtime, then test the combined app with real permitted Japji, Jaap and kirtan recordings on the intended HTTPS origin. Verify seeks, speed changes, pauses, timing correspondence and advertisements where present.
3. Test the final configured page on a physical iPhone in Safari, including the short viewport, scrolling, rotations and foreground/background transitions. Desktop phone-size viewports are not an iPhone acceptance test. No physical iPhone was accessible in this session.
4. Keep the draft unmerged until Steve's merge decision. Existing historical review and daily-publishing decisions remain separate.

The status lookup requirement is documented in YouTube's [developer policies](https://developers.google.com/youtube/terms/developer-policies) and [Made for Kids guide](https://developers.google.com/youtube/data/guides/made_for_kids_status). The native player/clock and minimum size are described in the [IFrame Player API reference](https://developers.google.com/youtube/iframe_api_reference). Detailed configuration instructions remain in the [parent companion handoff](YOUTUBE_READ_ALONG_HANDOFF_20261127.md).

## Evidence

- [Verification summary](../evidence/claude-listen-along/consolidation/summary.json)
- [Read-along browser report](../evidence/claude-listen-along/browser/8ec9b59/read-along/report.json)
- [Browser execution and clean-checkout receipt](../evidence/claude-listen-along/browser/8ec9b59/execution.json)
- [Navigation report](../evidence/claude-listen-along/browser/8ec9b59/navigation/results.json)
- [Offline/update report](../evidence/claude-listen-along/browser/8ec9b59/offline/report.json)
- [320px teaching screenshot — synthetic player](../evidence/claude-listen-along/browser/8ec9b59/read-along/bani-teach-320.png)
- [1280px teaching screenshot — synthetic player](../evidence/claude-listen-along/browser/8ec9b59/read-along/bani-teach-1280.png)
- [Original prototype review and native playback evidence](CLAUDE_LISTEN_ALONG_REVIEW_20261127.md)
