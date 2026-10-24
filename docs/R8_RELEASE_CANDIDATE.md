# GLP-001 R8 — Compact Reading Menu + YouTube IFrame Technical Spike

As of 2026-10-23 · **REVIEW-ONLY CANDIDATE, NOT DEPLOYED.** Existing family site remains R7, commit `254f3871b785b756208379138dcc17472a3733ff`.

## Founder feedback satisfied in prototype
- Reduce the crowded nearly full-screen reading controls popup to a short grouped choice. The new quick actions are **Listen with YouTube beta, Jump, Saved, Explore and Appearance**, plus collapsible less-frequent controls and a small Home button. Existing functionality remains available; Play/Pause, depth choices and pace slider are already in the 54px dock. Native dialog, keyboard focus and 44px targets are retained.
- Prepare a **visible official YouTube embedded player** within the existing full Japji reader, after an explicit user-selected HTTPS video. Input validation accepts YouTube watch/share/shorts/live/embed forms while rejecting lookalike hosts and non-HTTPS. Playback remains entirely under YouTube controls and YouTube's ads/branding. The player stays sticky and visible when reading; opening another modal pauses/hides it, then restores it paused. Closing destroys it.
- Offer `Search YouTube` as an honest external search link for now, with paste-URL return. A real in-app search requires the official YouTube Data API, an approved credential kept out of public GitHub Pages, rate limiting, query quota and an accessible fallback.
- The YouTube player time clock is readable when its official API is active, but **zero recordings have a checked time map**. The prototype does **not** synchronize a glowing word to any recording. The separate existing visual pace guide remains manual. The timing map utility validates video/source identity, approved source-line hashes, monotonic ranges and human review status; candidate/unknown maps never masquerade as verified alignment.

## Scope preserved
- All 385 original Gurmukhi occurrences, 385 English/Punjabi educational drafts, 42 Study drafts, source registration, gurdwara directory, Web Locks saved-learning and browser notes modules **byte-identical to accepted R7**.
- Source/education expansion is a separate `docs/R8_EDUCATIONAL_DEPTH_PILOT.md` lane: Pauris 1–4 chosen for a line-by-line scholarly upgrade with named interpretive alternatives (especially `ਸੋਚੈ`) and Punjabi explanations before generalizing across SGGS.
- No audio/media downloads, caption scraping, background hidden player, artificial voices, playback autoplay, payments, telemetry, or API keys were introduced.

## Candidate verification
- **79 portable Node contracts PASS:** 27 original/data, 8 service-worker, 12 shared-learning, 7 R6, 12 R7, 13 YouTube URL/timing validators.
- **36 R7 regression-browser checks PASS**, preserving prior Home, Japji modes, pace, Gurdwaras and Simran.
- **22 R8 isolated headless Chrome checks PASS:** compact menu geometry and grouping, chooser validation, no YouTube requests before opt-in, mocked player controls and visible minimum size, stop/destroy on close, pause when modal opens, no fake synchronization, original Gurmukhi retained, 320px layout and JavaScript errors.
- **8 simulated-offline checks PASS:** all **34** static app assets pre-cached; original reading/rooms available without network. Actual YouTube video is not and should not be cached for offline playback.
- **Additional live API diagnostic:** Google's official IFrame JavaScript successfully initialized a visible player and emitted `onReady` in isolated Mac Chrome with the video ID from YouTube's own API documentation. This is *not proof the video played audibly, a real Japji video is embeddable, or phone inline playback works*.
- Evidence: `evidence/r8-browser.json`, `evidence/r8-candidate-offline.json`, `evidence/r7-r8-regression-browser.json`, `docs/screenshots/r8/`, and hash manifest `docs/R8_CANDIDATE_MANIFEST.json`.

## Required before any live user-facing rollout
1. **Real iPhone Safari**: consent, playback controls, no background/offscreen video while playing, min 200×200 viewport, safe-area/layout while following all 385 lines, blocking and embedding-disabled video behavior, modal pause/resume, retaining notes and Home Screen URL. If unavailable, record NOT TESTED.
2. **Provider compliance review**: YouTube IFrame API visible player, player integrity, API client referrer (prefer strict-origin-when-cross-origin), no hidden playback, no ad blocking, no audio isolation or automated stream access. No arbitrary caption download.
3. **Versioned worker lifecycle R7→R8→R7→R8** with synthetic learning and no changes to user data. Existing R7 accepted rollback source must stay reachable.
4. **Actual search**: establish authorized YouTube Data API search service/credential, quotas, cache policy and embeddability filter. Do not advertise this as available until implemented. YouTube's official `captions.download` requires permission to edit the video.
5. **Alignment research**: use 2–3 creator-permitted Japji recordings and a rights-cleared separate recording copy or creator-provided timing/caption data; align with Punjabi-compatible tooling, independently review Pauri/tuk/word timing, and label confidence. Unknown user videos show unsynchronized/manual guide, never pretend the light follows words.

## Release policy
Do not merge/publish this branch until iPhone/provider checks and the next verified R8 worker rollout are complete. The R7 family link remains stable. No private learning, copyrighted audiovisual data, unlicensed photographs or credentials were committed.
