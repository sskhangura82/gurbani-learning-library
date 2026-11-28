# Review of Claude's Listen-along prototype

Date: 2026-11-27 (America/Los_Angeles)
Review status: BUILDER_RECORD_UNREVIEWED. This review and the consolidation are ChatGPT builder work; they do not represent an independent Claude approval of the combined candidate.

## Outcome

The supplied prototype demonstrates a useful compact player, Bani chooser and tap-to-teach interaction. Its original patch has been preserved on a separate review branch. Its own logic tests and the older app suites pass. Actual Chrome on Steve's Mac also played three real recordings through YouTube's native player.

The original prototype is not ready to merge unchanged. The edition checks, import/save behavior and player lifecycle have gaps that the existing PR #77 companion already handles. The consolidation therefore adds the useful Bani menu and current-line teaching/replay controls to that companion, retaining its source-bound timing schema, explicit saving, provider status lookup and privacy boundary.

## Provenance

- [Supplied findings document](https://docs.google.com/document/d/1uXPkjywCpluB_kjNqYdx6qm6dqdq5AlOm_oSba_d6WM/edit)
- [Supplied patch](https://drive.google.com/file/d/1n5tnrSlP6f5UHsdwEqAZGAMGmeTnAb-s/view)
- Patch: 790,219 bytes; SHA-256 `bbd3eac9cbc238cef40c4fb2d671c4b36f69cf4f5fb5bfeaabeeb8e022d173f4`.
- The patch matches production main `a3476ac4b9be90dde350fb35dd13ce0b672c120d`. Applying it directly to PR #77 conflicts in the older quality workflow, so no current quality checks were replaced.
- Original applied commit: [b2d34796a4a5f22d3d526b0fd04d495fa0744d30](https://github.com/sskhangura82/gurbani-learning-library/commit/b2d34796a4a5f22d3d526b0fd04d495fa0744d30).
- Review branch: `review/claude-listen-along-20261127`.
- Consolidation parent: PR #77 `7b0f8a35a093b4d4f10e95a1f65b2201f80d0c58`. Earlier PRs and production remain unchanged.

The eight original source files are unchanged in both implementations. The existing named Bani files and the complete SGGS/Dasam provider corpus are distinct digital editions; equal line counts do not make them interchangeable.

## Original test reproduction

| Check on original b2d3479 | Result |
| --- | --- |
| Original `tests/listen-along-core.mjs` | 17 passed |
| All ten older Node suites named in the handoff | 137 checks passed |
| Original page script syntax | Passed |
| Original browser assertions on actual Mac Chrome, with stand-in provider | 22 passed, 1 failed |
| Native YouTube playback attempts, fresh Chrome contexts | 3 played; 1 recording refused embedding |
| Physical iPhone, Safari and VoiceOver | Not exercised |

The original browser failure is the share-link assertion. On Mac Chrome, the button labelled Copy link chooses `navigator.share` before the clipboard fallback. The original test assumes the clipboard contains a link after 300 ms. It received an empty string. This is a real difference in the path exercised, not evidence that the timing core failed.

The browser harness changed only the root, output and Playwright import paths; its original assertions and stand-in player were retained. Reports and screenshots were written outside the original checkout, which remained clean. The original test digest is `538412540b61729c079a6c45eb3f143aba48fd05838d81187cc90595813fde62`.

## Real desktop playback

These were diagnostic tests of the untouched supplied prototype. The player SDK and iframe were not replaced, requests were not intercepted, and no provider checks were disabled. Fresh browser contexts contained no signed-in user profile. Videos/audio were streamed by YouTube's player and were not extracted or saved.

| Recording | Observed result |
| --- | --- |
| Japji, [8soV6l6is4Q](https://www.youtube.com/watch?v=8soV6l6is4Q) | Native video played, media time advanced, no player refusal |
| Jaap, [0TzTgHveO_I](https://www.youtube.com/watch?v=0TzTgHveO_I) | Native video played, media time advanced, no player refusal |
| Kirtan, [BpMxd2gT9G0](https://www.youtube.com/watch?v=BpMxd2gT9G0) | Player refused embedding; the page displayed its normal YouTube link |
| Alternate kirtan, [kDI-2FPyu3w](https://www.youtube.com/watch?v=kDI-2FPyu3w) | Native video played; actual media playback rate became 0.75; a test tap exercised estimated highlighting |

No external request occurred before pressing Open on the ordinary initial route. This does not cure the separate automatic shared-link path described below. Once connected, the native iframe requested YouTube/Google dependencies including video, image and font hosts; the owning page's CSP does not constrain the iframe's internal resource list.

The mark in the alternate kirtan check was a synthetic interaction marker, not an assertion about the recited words. The full Sukhmani text selected for this UI diagnostic does not establish the correct excerpt for that recording. These checks establish native playback and a real playback-rate change, not correct recitation-to-text alignment, background behavior, advertisement behavior, iPhone behavior, or release readiness.

[Native playback observations](../evidence/claude-listen-along/original-browser/original-real-youtube.json) and [alternate kirtan observations](../evidence/claude-listen-along/original-browser/original-real-youtube-kirtan-alternate.json) retain the results. The consolidated candidate has its own separate browser evidence and retains the empty provider configuration.

## Findings requiring correction before use

### 1. Timing identity is not enforced

The exported timing format includes an edition fingerprint, but `readTimingFile` does not enforce it. A changed line count becomes an `editionMatches: false` result that callers ignore. Unknown marks can be silently dropped. Shared links bind only the line count and ordinal positions. A same-sized edition can therefore accept another edition's timing.

The consolidated companion retains exact recording, collection, edition, selection and ordered source-hash matching. It rejects foreign files without changing the current map.

### 2. Imports and automatic saves can lose work

The original file importer changes the Bani before validating the timing file. An invalid import can leave a new displayed text paired with the old timing state. A malformed shared cue string can become an empty map and automatically delete an existing saved timing. Initial settings application also rewrites malformed storage, and paath normalization can discard a repeated sequence such as lines 5, 6, 5 on reload.

The consolidation keeps the existing explicit save/load/import/delete and unsaved-change protection. Repeated lines remain separate time occurrences. No automatic shared-link timing import is added.

### 3. Source verification needs an independent file receipt

The original verifies line text against digests carried in the same fetched data; changing both can pass. If Web Crypto is unavailable, it displays text with verification unavailable. This does not provide the later reader's fail-closed source boundary.

The new adapter first verifies a pinned digest over the entire original raw file, then parses inert JSON and verifies each row's existing digest. Without crypto, the selection is refused. Displayed rows retain their complete original strings.

### 4. External connection and player lifecycle are incomplete

A URL fragment identifying a video immediately calls `openSession`, loading YouTube without pressing Open. The original page has no own privacy/YouTube-terms assent and does not perform the required Made for Kids status lookup. Its visibility handler never pauses hidden playback; modal settings can cover the running player; there is no disconnect/disposal path. A player error displays text while the ready/playing/timing state can remain active. Native video identity and asynchronous source/session ownership are not checked.

The existing PR #77 provider adapter is retained unchanged. It provides explicit connection, metadata preflight, errors, identity checks, hidden/offscreen pause and disposal. Its required Data API browser configuration remains empty; no key or Google Cloud account was created or borrowed.

### 5. Estimated highlighting is not measured word timing

The original distributes text using character weights and video duration and interpolates between taps. Its final marked line can acquire an assumed remaining duration. Its displayed clock extrapolates wall time when the player's current-time value is unavailable. These methods may be useful as visibly approximate guides, but they do not support “always follows exactly” or precise word-level claims.

The consolidation retains bounded user-marked line intervals. Untimed gaps and the unfinished final mark do not assert alignment. It adds a compact teaching cue and replay of the bounded occurrence at the current real clock. Automatic speech recognition and an optional estimated-pace mode are not part of this increment.

### 6. Passing stand-in tests do not cover native behavior

The original stand-in is a DIV rather than a native iframe and intentionally exercises a limited API surface. It cannot prove iframe policy, real referrer behavior, advertised video changes, actual phone lock behavior, or pronunciation alignment. The reproduced Mac share-path difference also shows why a fixed synthetic environment is insufficient on its own.

The newer integrity gates also correctly reject an undeclared second HTML route and unregistered dynamic script loading. They remain in place. The implementation uses the single existing companion and two declared source modules, with the bundle and script hashes rebuilt.

## Official provider references

- [IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
- [Developer policies, including privacy/terms and Made for Kids status](https://developers.google.com/youtube/terms/developer-policies)
- [Made for Kids lookup guide](https://developers.google.com/youtube/data/guides/made_for_kids_status)
- [Required minimum functionality](https://developers.google.com/youtube/terms/required-minimum-functionality)

The required configured provider lookup and physical-device release check remain separate from the successful diagnostic playback above. The new branch stays in draft, awaiting actual independent review and Steve's merge decision.
