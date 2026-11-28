# YouTube Gurbani read-along handoff

Prepared 2026-11-27 (America/Los_Angeles).

## What the candidate provides

The new `listen/index.html` companion places an optional YouTube recording beside the original Gurbani text. On a narrow screen the player sits above the text; the text scrolls in its own panel. The player remains visible, uses YouTube's native controls and is at least 200 by 200 CSS pixels. The home page's Read area provides the entrance.

The default reading is the complete Japji Sahib section from the existing verified Shabad OS SGGS edition: 39 complete groups and 385 original rows. Readers can also select an Ang in the full SGGS source or a page in Dasam Granth, then choose a complete passage beginning there or continuing across that page. These are the source provider's complete groups; they are not a claim that every traditional Bani has its own preset. Existing originals and study explanations are unchanged.

For one fixed recording, select a row and press **Mark selected line** when it begins. Press **Next line starts** at the next row, select an earlier row for a repetition, or press **Text pause or end** for an introduction, commentary gap or ending. The next marker closes the previous interval. A final unclosed marker does not invent a duration. **Undo marker** corrects a recent edit. **Follow recorded timings** highlights the bounded current row and keeps it in view using the actual player clock, including native pauses, seeks and playback-rate changes.

Markers are the reader's annotations. A pasted video link does not recognize spoken Gurbani or supply trustworthy timings. No speech recognition, arbitrary caption extraction, live-stream alignment, video download or hidden/background listening is implemented.

## Small, explicit timing storage

**Save on device** stores only the current video/source timing map. Saved maps load only on request; import, export, clear and deletion are separate controls. Unsaved replacements offer save/export/discard choices. The application never calls `localStorage.clear()` or initializes an older reader's saved learning.

The map records the video ID, exact source edition and manifest, ordered complete-group digests and millisecond/row markers. A synthetic complete-Japji map with 386 cues serializes to **15,512 bytes**. This is a size measurement, not an actual recitation map. The maximum accepted file is 256 KiB; no media is included. Application-owned timing keys start with `glp001.youtube-timing.v1:`. Private material, PIN state, bookmarks and older notes are outside this feature's storage operations.

The public offline shell adds only this route, stylesheet and owned bundle. It caches neither YouTube media nor provider metadata. Full source files retain the existing on-demand behavior, so the new companion does not promise offline scripture loading or offline playback.

## Setup still needed for live playback

`collections/source-reader/read-along-config.mjs` intentionally contains an empty `YOUTUBE_DATA_API_KEY`. The unchanged candidate therefore reports that playback setup is not connected and offers **Watch this recording on YouTube**. It makes no provider request before this refusal, and original-text reading remains available.

An owner-controlled YouTube Data API v3 browser key is needed for the required recording-status lookup. Restrict it to the intended website referrers and YouTube Data API v3; a browser key is visible to clients. Do not substitute a private credential, account password or OAuth client secret. No cloud project, credentials, billing commitment or deployment has been created by this work. The ordinary reader screen does not ask visitors for a key.

Configuration changes owned application bytes. After setting the key, update the read-along input hash in `tools/script-integrity/policy.mjs`, rebuild the owned bundle, refresh its HTML SRI, regenerate the public offline hashes, and create a fresh explicit change-scope/verification record for the configured candidate. Run the relevant checks and test real permitted Gurbani recordings on the intended HTTPS origin. A key added after the recorded browser run is a new runtime, not covered by those prior hashes.

The provider adapter checks the video's ID, embeddability, privacy, MadeForKids field and fixed-recording status before loading the official SDK. It uses privacy-enhanced embedding, the genuine origin/referrer, native controls and no autoplay. Playback still depends on the video owner and YouTube; unavailable, private, embedding-disabled and live recordings refuse with a fallback link. The official SDK is an explicitly disclosed live dependency outside owned-bundle SRI. It is not a sandbox that isolates YouTube code from the embedding origin.

See [provider notes](YOUTUBE_PROVIDER_NOTES_20261127.md) for official API/policy sources, precise interface semantics and setup constraints. Advertisement behavior and exact alignment through real advertisements require actual-provider verification; a synthetic clock cannot establish them.

## Review and preservation

This candidate is stacked on PR #76 at `cfded3e2186c1f6e325d135f1fa62da1f03d34bb`, in `feature/youtube-read-along-20261127`. PRs #75 and #76 remain separate review targets. No production merge or deployment is included.

Only two pre-existing application files change: the home navigation and the generated public service worker. Eight new application files form the companion. The exact amendment is recorded in `evidence/youtube-read-along/change-scope.json`; earlier review records keep their original bytes and meaning. Old reader pages keep their no-frame restrictions. The one new provider loader capability is limited to the new player source and its owned generated bundle, with an exact official URL and no element aliases or helper escapes. Every older application graph continues to reject dynamic script creation.

Review status remains **BUILDER_RECORD_UNREVIEWED**. An assistant team review and passing tests are not a Claude review. The independent reviewer should check the real user flow, exact-source binding, source/video switching, storage refusal, external-provider boundary and the honest distinction between recorded user timings and automatic recognition. Existing historical and daily publication decisions are unchanged.

## Verification scope

The focused Node tests cover recognized URL admission, exact originals, repetitions and gaps, media-clock behavior, malformed/foreign/oversized files, explicit provider preflight, cancellation and stale callbacks, source corruption and the isolated loader capability.

The actual-browser fixture uses a real Chrome browser and fresh contexts. Its default-config case runs the unchanged candidate. Positive cases replace only the provider key in a separately repinned fixture bundle and intercept metadata, the official SDK request and the iframe with visibly labelled **TEST ONLY** responses. They establish the owned interface's behavior with a controlled media clock; they do not establish live YouTube playback, rights to a recording, actual recitation timing, physical iPhone/Safari behavior or independent editorial approval.

Final run identities, checks, hashes and screenshots belong in the adjacent verification evidence. Read those recorded results before treating this candidate as ready for release.
