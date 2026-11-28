# YouTube Gurbani read-along — acceptance criteria

Prepared 2026-11-27 (America/Los_Angeles), before implementation.

Base: `cfded3e2186c1f6e325d135f1fa62da1f03d34bb` (PR #76).
Branch: `feature/youtube-read-along-20261127`.

## User intent

Play an existing YouTube Gurbani recording and read the matching original text at the recording's pace, using little local storage. The user explicitly requests this audio/video increment; older work-order statements that audio was paused describe their earlier scopes. Preserve PRs #75 and #76 and the production application while building a separate reviewable candidate.

## Experience

- Add an optional Read along with YouTube companion. Use a visible native YouTube player above/beside a separately scrolling original-text panel. Keep controls usable at 320px, with a player viewport at least 200 by 200 CSS pixels. Text and app controls must not cover the video.
- Start with complete Japji Sahib from the verified full-source SGGS edition (section `1DSA`, 39 complete source groups, 385 original rows), and allow another complete SGGS/Dasam group selected by Ang/page. Do not transfer the legacy Japji edition's timings or notes by ordinal or spelling.
- Accept recognized YouTube watch, share, shorts and embed links for one recording. Do not accept arbitrary iframe HTML, hosts, scripts or playlists as recording identities.
- Loading YouTube is explicit. No provider request, iframe, autoplay or thumbnail before the user chooses to connect. Keep the ordinary player controls, branding and advertisements, use the genuine app origin/referrer and privacy-enhanced embedding, and provide a normal YouTube fallback when playback is unavailable.
- A URL alone does not identify the recited line. Support user-created per-recording timing markers: mark the selected line, mark the next line, mark a text pause/end, undo and replay. Repetitions may revisit an earlier source row. Untimed intervals must not pretend to be aligned. Do not fabricate word-level precision.
- Follow the actual media clock rather than a wall-clock pace estimate. Pause/buffering/seek/rate changes and switching videos or passages must not leave stale highlights, timers or source labels. Pause the player when the page becomes hidden; do not implement audio extraction, hidden/background playback or video downloading.
- Save only explicit local timing annotations, bound to the video ID and exact source edition, manifest and ordered group digests. Include export, import and deletion, clear storage-failure messages and a bounded file format. Do not read or write old reflections, reading progress, PIN or private plaintext.

## Provider integration and configuration

Use documented YouTube IFrame Player API methods only. The new opt-in route may load the exact official API entry script; every old route keeps its current script/frame restrictions. The owned application bundle and source verifier remain hash-pinned. Provider code is a disclosed external execution dependency, not a claimed SRI-pinned or sandboxed part of that bundle.

Current YouTube policy requires checking each video's MadeForKids status through the Data API. Add a small metadata preflight, with no analytics, user tracking or cached provider metadata. No missing/invalid key, failed/ambiguous status response or embedding-disabled video may be silently treated as checked. Keep developer configuration separate from the ordinary reading flow. Do not create billing commitments or substitute scraped player metadata for the official API.

The initial candidate is for fixed recordings. It does not claim automatic speech recognition, caption access for arbitrary third-party videos, live-stream alignment or policy-approved deployment. Actual provider setup and live playback verification must be reported accurately if unavailable.

## Preservation and verification

- Reuse the existing verified original-source objects and immutable source files; do not import old reader scripts or run their saved-progress initialization.
- Keep old application bytes unchanged except a declared navigation entrance and the public offline shell inventory where necessary. Preserve the prior bounded change-scope checks through an exact amendment rather than rewriting older evidence.
- Give the provider loader an exact capability restricted to its new pinned module and generated bundle. All other dynamic script creation, unapproved URLs and old-graph changes must continue to fail.
- Test URL admission, source/video mismatches, repeated lines and gaps, boundaries, seeking and playback rates, malformed/oversized imports, explicit storage actions and source corruption. Use fresh browser contexts and synthetic timing/learning records.
- Test the real interface with a clearly identified synthetic player fixture, separately report any real-provider check, inspect narrow and desktop layouts, and run the existing source/integrity/preservation regressions affected by this addition. Do not relabel a simulated clock as actual YouTube playback.
- Retain evidence, source references and a concise handoff. Deliver a separate draft PR. No production merge or deployment is included.
