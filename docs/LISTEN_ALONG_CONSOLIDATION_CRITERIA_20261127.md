# Listen-along consolidation acceptance criteria

Date: 2026-11-27 (America/Los_Angeles)
Parent: PR #77, `7b0f8a35a093b4d4f10e95a1f65b2201f80d0c58`
Status: BUILDER_RECORD_UNREVIEWED. This is a separate proposed increment, not an amendment to earlier independent review or editorial approval.

## Authorized outcome

Steve supplied Claude's original findings and patch and asked to continue the YouTube Gurbani read-along work. Retrieve and preserve the exact original patch, apply it on its matching base, reproduce its tests, and carry useful composition selection and teaching/replay controls into the existing optional companion. Keep the feature in draft; no production merge or deployment is authorized by this increment.

Original patch SHA-256: `bbd3eac9cbc238cef40c4fb2d671c4b36f69cf4f5fb5bfeaabeeb8e022d173f4`, 790,219 bytes.
Original patch applied with `git am` on production base `a3476ac4b9be90dde350fb35dd13ce0b672c120d`: `b2d34796a4a5f22d3d526b0fd04d495fa0744d30`, branch `review/claude-listen-along-20261127`.
The supplied original is retained separately; its tests/evidence are not relabelled as verification of the consolidation.

## Required behavior

1. Keep the existing full-source Japji default and SGGS/Dasam complete-group selection unchanged. Add the eight existing named Bani readings plus the five-composition Morning Nitnem sequence as explicit options. These are separate named editions; never migrate a timing by position between them.
2. Fetch only the selected existing source files. Check exact bounded file bytes against a pinned SHA-256 before parsing. Parse the two existing JavaScript data wrappers as inert JSON, never by evaluating or inserting scripts. Require crypto and verify every original row's existing SHA-256 before rendering any part of a selection.
3. Preserve full original row strings, order, prefaces, headings, and Jaap Chhand 62's mid-unit heading. No whitespace normalization or retyping. Morning sequence is Japji, Jaap, Tav-Prasad Savaiye, Benti Chaupai, Anand. Existing scripture files remain byte-identical.
4. Bind timings to `daily-bani`, the exact selection, the pinned edition/manifest identity, and all ordered constituent file hashes. Existing full-source timing files and new named-Bani files must reject one another. Invalid/foreign imports leave the current source and timing map intact.
5. Retain explicit Load video consent, provider preflight and current video identity checks, stale-request cancellation, hidden/offscreen pauses, disposal, and the complete existing privacy disclosure. A source preset or restored/shared address must not initiate a provider connection.
6. Offer a compact teaching cue and replay of the currently bounded marked interval. Repeated lines replay the occurrence at the current media time. An unbounded final marker, a marked text pause, or an untimed interval must not invent a playable line. Seeking respects the existing paused state.
7. Keep manual timing labels accurate. Line markers record the listener's input; there is no promise of automatic speech recognition, measured word timing, or guaranteed perfect alignment. Claude's one-tap/word estimates are not promoted into measured timings.
8. Preserve explicit Save/Load/Export/Import/Delete, unsaved-map protection, old reading notes, private PIN/material, psychology access, and all older source/script integrity gates.
9. Keep one companion page at `listen/`. Register only the two new Bani adapter/lock modules in the existing exact owned-bundle graph. No broad dynamic-script or extra-HTML exception, no duplicated alternate reader route, and no external media in the offline cache.
10. Verify original patch tests separately from new source/core/UI regressions. Retain actual browser evidence with exact source/runtime hashes. Distinguish stand-in provider checks, any diagnostic real-provider attempt on the supplied prototype, and physical-iPhone/Safari testing.

## Real provider boundary

The PR #77 browser API configuration remains empty. The consolidated app must continue refusing provider setup before any external request when unconfigured. A live-data diagnostic on the supplied prototype cannot certify this release or waive the required configured status lookup. The target origin must have an owner-configured, restricted YouTube Data API browser key and undergo live integration testing before release. No credentials, Google Cloud projects, billing settings, or device-wide browser profiles are modified here.

Official references:
- [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference)
- [Developer policies](https://developers.google.com/youtube/terms/developer-policies)
- [Made for Kids status guide](https://developers.google.com/youtube/data/guides/made_for_kids_status)
- [Required minimum functionality](https://developers.google.com/youtube/terms/required-minimum-functionality)

Source fingerprint verification preserves the named digital edition. It does not change its existing editorial or human-collation status.
