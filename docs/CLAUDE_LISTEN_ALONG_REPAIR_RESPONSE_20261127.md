# Response to Claude Code's listen-along review

Date: 2026-11-27 (America/Los_Angeles).

## Review identity and status

The actual connected Claude Code reviewed runtime `8ec9b599dba4d112b6cc371e69d1515d2c9591ab` in a separate read-only session. Its verdict was **changes required**, with no tool permission denials. The [original request](../evidence/claude-listen-along/consolidation/claude-code/request.txt), [complete review](../evidence/claude-listen-along/consolidation/claude-code/review.md) and [machine-readable result](../evidence/claude-listen-along/consolidation/claude-code/result.json) are retained unchanged. This is not a content, historical, production or older-stack approval.

The repair contract below addresses the concrete code findings. The later verified repair runtime and focused Claude follow-up must be recorded separately; passing older tests is not closure of the reported defect.

## Concrete repairs

**F1 — integer-millisecond boundaries.** The defect was independently reproduced from the frozen original core: a 1,005 ms marker becomes 1.005 seconds on seek, then 1,004.9999999999999 when multiplied back, selecting the previous interval. The [reproduction](../evidence/claude-listen-along/consolidation/claude-code/f1-original-reproduction.json) preserves the observed wrong row. A shared `mediaTimeMs` helper rounds the verified media clock to the timing format's integer-millisecond resolution. `lineAt`, the UI's current-cue lookup, alignment messages and marker creation use the same conversion. Invalid clocks remain invalid. Regressions must exercise 1,005 ms and 40,001 ms, paused repeated Replay, marker-list seeks, and true gaps.

This numerical correction does not add an arbitrary provider tolerance or claim that a clock before the marked line has reached it. That distinction matters for F2.

**F3 — a start offset longer than the video.** An invalid share-link start must be ignored with a specific notice while retaining the connected recording. It must not be sent to the adapter as a timing seek, trigger a terminal marker error or silently rewrite the timing map. Valid offsets retain the existing behavior.

**F4 — terminal controller cleanup.** Terminal failures dispose the failed current instance, clear the app controller/clock and restore the placeholder. Snapshot/pause/seek chains capture their controller and re-check ownership after synchronous callbacks. Autoplay-blocked playback remains recoverable. A native recording change retains its visible native player with following disabled, preserving the prior navigation contract. The review's broader statement about every self-destroy notifying `onError` is not how the adapter is written: `destroy()` is silent, and the app already has its own pagehide cleanup. The concrete regression is a pause failure that reports an error and then closes itself, including the discard-dialog close/reconnect path.

**F5 and F7 — source typography and names.** Source rows retain their declared heading/line kind, metrical headings have a modest distinct presentation and an accessible state label, and menu names agree with the pinned source titles. All original strings and their order remain unchanged.

**F6 — relative source order.** In addition to complete one-time coverage, `sourceDisplayOrder` must preserve the relative line and metrical-heading order from the original arrays, matching the established Nitnem reader. Raw-file and per-row checks remain in force. This is a defensive parser-contract correction; the pinned originals already obey the contract.

**F8 and F9 — keyboard and announcements.** Arrow navigation inside the original-text panel must keep its focused row visible instead of scrolling the whole window back to the teaching controls. Automatic current-line updates remain readable without announcing every line through a live region. Deliberate teaching actions and manual/error status feedback retain accessible announcements.

Teaching Undo is an additional coverage check, not a newly claimed defect: restoring the prior map and returning the preview to the just-marked row must work during teaching.

## Accepted behavior and remaining integration observations

**F2 — native seek precision.** YouTube documents that an unbuffered seek can land at an earlier keyframe. The app should continue displaying the actual clock and the row belonging to that clock; it must not fabricate a later time or pin a false active line. A configured live run must measure paused and playing Replay, repeated presses and unbuffered seeks. The numeric F1 test cannot settle this provider behavior. [Official seek reference](https://developers.google.com/youtube/iframe_api_reference#seekTo).

**F10 — long rows on a short screen.** The accepted design uses a bounded, keyboard-scrollable preview so the native player and marking button remain visible together at 320×640. The complete original string remains in the preview, but all its characters are not claimed to fit simultaneously. The earlier handoff already stated this. The browser assertion should additionally establish that an overflowing long preview can actually scroll with the keyboard; it should not assert `scrollHeight <= clientHeight` or remove source text to fit.

**F11 — universal privacy treatment.** The app checks each recording's reported Made for Kids status and universally embeds through `youtube-nocookie.com`. It adds no advertising, analytics or provider-metadata persistence; explicit timing annotations remain on the device unless the user exports them. The [status guide](https://developers.google.com/youtube/data/guides/made_for_kids_status) requires tracking-off treatment for MFK recordings, while [official embedding help](https://support.google.com/youtube/answer/171780?hl=en) describes privacy-enhanced playback and non-personalized advertising. A [Google staff clarification](https://issuetracker.google.com/issues/581916703), dated November 5, 2026 and retrieved from the public search index, explicitly identifies this embed domain as the tracking-off implementation and distinguishes local playback timestamps from storing media.

Our implementation assessment is that applying this treatment universally does not need an additional conditional MFK branch or rejection of MFK recordings. It is not a claim of zero provider data exchange or a legal certification. No new owner approval gate is introduced by this informational finding; the configured provider check remains required.

**F12a — SDK inline styles and CSP.** The iframe has owned CSS and width/height attributes; essential sizing is not delegated to an unverified SDK style mutation. Inline-attribute restrictions are described by [CSP Level 3](https://www.w3.org/TR/CSP3/#directive-style-src-attr). No current native failure has been observed. Keep the narrow CSP and capture `securitypolicyviolation` events plus actual player geometry/controls in the configured live run. The original prototype allowed inline style attributes, so its native results cannot settle this question.

**F12b — `getVideoUrl()` host.** The [official API contract](https://developers.google.com/youtube/iframe_api_reference#getVideoUrl) specifies a YouTube.com URL. A nocookie-host return is an unsupported hypothesis, not a demonstrated defect. No speculative hostname expansion is made. Record the native method's actual return during the configured live test.

## Evidence qualifications

**F13 — receipt versus authentication.** The Bani selection receipt binds ordered pinned constituents and detects inconsistent lock edits; it is not an independent signature or proof of authorship. Whole-file pins are separate from the source file's embedded per-row hashes. Their trusted release boundary remains the owned bundle, declared build inputs, HTML SRI and verified offline release. The existing edition's collation/editorial qualifications remain unchanged.

**F14 — complete code scope.** The existing `change-scope.json` deliberately inventories application files only. The repair packaging also records a complete code-change inventory including workflow, test and build-gate paths, so the application-only record cannot be mistaken for the entire PR diff.

The unchanged empty-key candidate, synthetic-provider browser cases, original-prototype native diagnostics and any future configured live run remain separate evidence sets. Physical iPhone, Safari, VoiceOver, advertisement behavior and measured recitation alignment remain unverified. These limits are not cleared by an independent code review.
