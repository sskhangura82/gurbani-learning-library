# YouTube provider adapter

Prepared 2026-11-27 (America/Los_Angeles); official documentation inspected 2026-11-28 UTC.

## Delivery and setup status

The adapter is an optional external provider for the dedicated read-along route. Importing its module does not load a player, script, thumbnail or metadata request. `YOUTUBE_DATA_API_KEY` in `collections/source-reader/read-along-config.mjs` intentionally defaults to an empty string. An unconfigured build reports `YOUTUBE_NOT_CONFIGURED` before making any provider request. This candidate does not claim configured or verified real YouTube playback.

Deployment needs an owner-configured browser API key for YouTube Data API v3, restricted to the intended website referrers and API. Browser keys are visible to clients; do not substitute an OAuth client secret, private token or account password. Enabling the API and maintaining the key are deployment configuration, not steps in the reader's ordinary flow. Google documents API keys for public metadata and application/API restrictions in [Implement authorization, Project setup](https://developers.google.com/youtube/data/guides/authentication).

Changing the configuration changes owned application bytes: regenerate and verify the read-along bundle and its integrity receipts. This work creates no cloud project, credentials, billing commitment or deployment.

## Interface and lifecycle

```js
createYouTubePlayer({mount, videoId, onUpdate, onError, apiKey})
// Promise -> {snapshot(), seek(seconds), pause(), destroy()}

checkVideo(videoId, {apiKey, fetcher})
// Promise -> {videoId, madeForKids, embeddable, privacyStatus, liveBroadcastContent}
```

The returned player snapshot is frozen and has exactly `ready`, `videoId`, `timeSeconds`, `durationSeconds`, `state` and `rate`. States are `unstarted`, `cued`, `playing`, `paused`, `buffering`, `ended` and `error`. The controller can resolve before asynchronous readiness. A synchronous constructor callback is buffered until the constructed instance exists; `onUpdate` can nevertheless precede resolution of the creation Promise. The consumer must guard its own current request token and destroy obsolete results.

`snapshot()` reads the current provider clock. The adapter also polls at 250 ms while ready, connected and visible, including paused players to notice a native seek. It does not extrapolate media time from wall time or multiply cue positions by playback rate. `seek` and `pause` return success booleans; invalid seeks report an error. `destroy` is idempotent, aborts pending checks, clears timers/listeners, and removes only the controller's own host/frame. A same-mount replacement cancels an earlier request. Fresh disconnected mounts are refused after every asynchronous stage and immediately before construction.

Hiding the document or moving the player out of view pauses it; visibility restoration does not play it. Page exit/disconnection destroys it. Late callbacks from a destroyed or different player are ignored. A native related-video change reports `YOUTUBE_RECORDING_CHANGED`, changes the snapshot's video ID, and clears the old alignment state while preserving YouTube's own UI. It still pauses when hidden.

Callbacks receive only snapshots or `{code, message}`. Obsolete requests reject with `YOUTUBE_CANCELLED` without a stale error callback. Provider error bodies and key-bearing request URLs are not copied into messages. Native errors have codes such as `YOUTUBE_PLAYER_153`. Readiness, transport, clock and constructor failures become explicit error states. `YOUTUBE_PLAYBACK_BLOCKED` is recoverable by a later native Play action.

The documented player clock, rate events, seek behavior and error codes are in the [IFrame API reference](https://developers.google.com/youtube/iframe_api_reference), under Playback controls, Playback status and Events. Seeking can land before the requested time; the subsequent reported clock is authoritative. The public event list provides no advertisement lifecycle guarantee. Exact alignment through advertisements is not established by the synthetic tests.

## Minimal metadata preflight

Before either the external script or iframe is created, the adapter requests `videos.list` from `https://www.googleapis.com/youtube/v3/videos`, with `part=id,status,snippet` and a field filter for only:

```text
items(id,status(embeddable,privacyStatus,madeForKids),snippet(liveBroadcastContent))
```

It requires one matching ID, explicit boolean `madeForKids`, `embeddable: true`, public/unlisted status and `liveBroadcastContent: 'none'`. Unknown, missing, inaccessible, private, live or upcoming responses fail. Made-for-kids recordings are not rejected solely for that designation; the adapter has no analytics or user-tracking implementation. Status remains in memory and is checked afresh per creation, with `credentials: omit` and `cache: no-store`. No title, thumbnail, statistics, captions or provider metadata cache is requested or persisted.

Sources: [videos.list parameters](https://developers.google.com/youtube/data/reference/rest/v3/videos/list), [video resource fields](https://developers.google.com/youtube/data/reference/rest/v3/videos), and [MadeForKids status guide](https://developers.google.com/youtube/data/guides/made_for_kids_status). The lookup requirement is in [Developer Policies III.E.4.j](https://developers.google.com/youtube/terms/developer-policies#e.-handling-youtube-data-and-content).

## External execution and visible player

The lazy loader contains exactly one literal script creation and assignment for `https://www.youtube.com/iframe_api`. Its code is a disclosed live provider dependency, not an SRI-pinned part of the owned bundle. Production has no test mode or injected fake-player option. Tests replace the official response only in their isolated fixture environment.

The adapter creates a `youtube-nocookie.com` iframe with native controls, no autoplay, inline mobile playback and the real page origin. Its default height is 270 CSS pixels; route CSS must preserve at least 200 by 200 pixels and keep controls visible. It applies `strict-origin-when-cross-origin` to the iframe and loader. The embedding route must also provide the genuine referring origin and appropriate narrowly scoped CSP. See [player parameters](https://developers.google.com/youtube/player_parameters) and [Required Minimum Functionality: identity, player size and overlays](https://developers.google.com/youtube/terms/required-minimum-functionality).

Privacy-enhanced mode limits personalization; it does not promise no data exchange or advertisements. Provider connection is an explicit user choice. See [YouTube embedding help, privacy-enhanced mode and HTTP Referer](https://support.google.com/youtube/answer/171780?hl=en).

The feature preserves advertisements and native links. It provides no audio extraction, media downloading, offline playback or hidden/background listening. These constraints are documented in the [policy guide, standard YouTube experience](https://developers.google.com/youtube/terms/developer-policies-guide). Recording availability and embedding permission can change after the preflight; native player errors remain authoritative.

## Alignment and verification limits

User timing annotations belong to the application and must be presented as such. The player adapter does not create, persist or claim to verify annotations, source text or editorial interpretations. It reads none of the application's reflections, progress, private-library or PIN storage. The reading layer owns exact source bindings, gaps and repeated-line behavior.

Arbitrary caption extraction is not implemented: [captions.list](https://developers.google.com/youtube/data/reference/rest/v3/captions/list) does not return caption text, and [captions.download](https://developers.google.com/youtube/data/reference/rest/v3/captions/download) requires permission to edit the video. A link alone does not supply a trustworthy line-timing map.

Run the network-free provider contracts with:

```sh
node --test tests/youtube-player-contracts.mjs
```

These contracts use synthetic metadata, a minimal DOM and a synthetic clock/player delivered only through the intercepted official loader. They cover refusal before network, metadata ambiguity, media-clock/rate/seek behavior, synchronous readiness, detach/replacement races, native errors, timeout recovery, visibility and absence of persistence. They are not evidence of real YouTube playback, advertisement behavior, deployment permission or physical-device compatibility. Report actual provider/browser checks separately.
