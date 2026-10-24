# GLP-001 M1 — Response to Claude's conditional PR #10 review

Date: 2026-10-24. Status: Revised, still a research-only and media-free candidate.

## What Claude found

The earlier timing-map validator checked the video ID, frozen Gurmukhi hashes, rights state, ordered timestamps and reviewer seal. It did not prove the checked timing map corresponded to the **current edited upload**. An eight-second introduction inserted by a creator under the same YouTube ID would shift the recitation while the earlier validator could still claim a match.

**Corrected.** The validated metadata now carries an explicit version-binding record for every reviewed YouTube-backed map:

- Exact YouTube video ID plus separately supplied source-media checksum (no source recording on GitHub).
- Reviewer-observed YouTube video duration in milliseconds.
- Signed source-to-video time offset in milliseconds, representing a constant insertion/trimming offset.
- At least three distinct and distributed reviewer-confirmed alignment anchors. Each binds a canonical Gurmukhi occurrence ID and SHA, the permitted source file's media time, and the matching reviewed YouTube clock time.
- Anchor video times must lie within their own **mapped segment**, agree with the documented offset within 500 ms, be ordered and substantially distributed through the mapped portion, and have a reviewer confirmation.
- Runtime approval checks the actual current video ID and player-reported duration against the checked edition's duration; missing duration, mismatch, or a change greater than the declared tolerance produces **NOT SYNCHRONIZED**. Original and current user notes are independent of this feature.
- YouTube provider position must drive the light only if the runtime attestation still matches; it never uses a wall-clock simulation to pretend to know what is being recited.

**Limits that remain:** YouTube's official player does **not** grant the application access to decoded audio. An edit that preserves exact video duration can evade metadata-only comparison. Reviewer-confirmed anchors attest the version observed during editorial verification, **not** a live cryptographic fingerprint of every playback byte. Creator notices and periodic review/version demotion may be necessary. Do not claim zero-risk universal playback matching.

## New fail-closed tests

The original 18 M1 synthetic timing/rights tests still pass; the 12 new video-edition tests pass. The new tests deliberately try:

1. Same video ID but an eight-second-longer edit.
2. Unknown runtime duration or different video ID.
3. Reviewed map without a binding record.
4. Wrong source-file-to-video offset.
5. Anchors with incorrect canonical text hashes, missing reviewer confirmation or out-of-order times.
6. A shifted anchor outside the previously mapped tuk.
7. Sample anchors too sparse to validate the mapped portion.
8. Pauses, commentary and introductions that must display **no highlighted line**.
9. A same-duration edit that the interface cannot detect—and an explicit test/documentation warning against falsely claiming it can.

All audio tests are synthetic metadata. **No real voice was processed or permission inferred.**

## iPhone acceptance gate added

The physical-device checklist now requires actual visible YouTube player, no autoplay, minimum 200×200 dimensions, controls and ad integrity, pause/seek behavior, modal handling, unmapped fallback, provider duration mismatch and failure states, and honest background/lock-screen expectations. These tests remain **NOT RUN**, including the real Recitation Playback event loop.

## Remaining before human-synced release

- J-1 founder source selection followed by separate recorded performer rights and permission to process the lawful original copy; no contact or recording occurred.
- Approved recording-specific checked time map, with independent human timing review and correction.
- Correct iPhone Safari / Home Screen behavior, provider API compliance and actual video seek/time reliability.
- Explicit rights to publish derived timing metadata and associate a public YouTube ID; if absent, remain private research.
- Qualified Gurbani pronunciation/santhiya review separately.

Claude should now re-check PR #10 against the failure test and source before upgrading CONDITIONAL PASS. This work does not request the founder's release word, credentials or money.
