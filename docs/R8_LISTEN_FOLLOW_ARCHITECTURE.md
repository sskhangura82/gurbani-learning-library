# GLP-001 · R8 — Listen & Follow + compact reader controls

23 October 2026 · Design/engineering candidate, **not published or accepted**.

## Founder feedback
The current Reading controls modal fills nearly the entire iPhone screen with ten near-identical large buttons. Reduce it to a small, organized, immediately dismissible reader menu. The next educational priority is depth: preserve exact Gurmukhi and grow trustworthy English and Punjabi explanations at each passage, including vocabulary, competing interpretations, connected SGGS contexts and musical information. The user also wants searchable YouTube recitations inside the app, with highlighted Gurbani following their actual pace.

## What is technically supported by YouTube today
1. **Selection/playback:** A user can search for a recording and select it, or paste an HTTPS YouTube video URL. The YouTube IFrame Player API supplies a **visible, genuine YouTube player** in our reader. Its `getCurrentTime()`, `onStateChange` and `seekTo` methods allow us to track a video time and react to pause/seek/play.
2. **In-app search:** YouTube Data API `search.list` supports video-only/embeddable filters. It requires an authorized application configuration and use of a managed API credential. GitHub Pages is a public static site; do not put an unrestricted API key or provider secrets in its source. Use a bounded server-side search adapter with caching, rate limits, approved quota and explicit privacy notices; until then, a labeled in-app query field that opens official YouTube Search results in a new tab, plus paste-URL is the honest no-key fallback. Search success does not mean timed alignment exists.
3. **Time alignment:** `getCurrentTime()` knows **where the player is** but not **which Gurmukhi word is spoken**. YouTube's Data API `captions.list` provides track metadata only with authorization; arbitrary third-party caption downloads require video editing permission. Therefore claim neither automatic caption access nor universal word alignment.
4. **The timing map:** A separately governed `recording_timings/<youtubeVideoId>/<mappingRevision>` holds `{videoId, sourceTextRelease, segments:[{occurrenceId, wordIndex?, startMs, endMs, confidence, provenance}], contributor, reviewStatus}`. Require monotonically non-overlapping times, full source-hash matching and explicit states `unmapped / candidate / line_checked / word_checked / rejected`. Display current-line glow from checked segments only. On video seek or speed change, consult the player clock directly instead of assuming nominal words/min. No padding, smoothing or interpolation may be called “matched” unless it is explicitly approximate.
5. **Long-term automatic pipeline:** With permission from a performer/rightsholder, ingest a *separately supplied lawful recording*, segment introductions/commentary/repeats, align human-verified Gurmukhi with Punjabi-capable ASR/forced-alignment, then review sampled line/word boundaries by humans. Retain approved timing metadata and source provenance; do not copy or download arbitrary YouTube audiovisual content, extract audio from embedded players, or scrape subtitles. A first pilot should focus on 2–3 approved recordings at different paces. Unknown recordings remain visually **unsynchronized** until a lawful source-backed map is created.
6. **Display compliance and iPhone constraints:** YouTube player stays fully visible at least 200×200px, with YouTube branding, controls, ads and metadata intact. No audio-only extractor, CSS-hidden background player, muted background hack, blocked overlays, autoplay prior to user action, or guaranteed background iOS playback. Use a visible 16:9 player area with >=200px height on narrow screens, and the official API with playback started by the user. Respect iPhone browser behavior/consent and expose clear fallback to YouTube direct. Referrer policy should be strict-origin-when-cross-origin to preserve required playback origin identity.
7. **When a page is offline:** Original Gurbani/lessons and silent guide remain available from the hashed static shell; a YouTube recording is **not available offline through this integration**.

## Two-stage feature implementation
**R8 technical spike (current branch)**:
- Simplify Reading controls into a small, accessible grouped panel: Continue/Jump; Saved learning/reflection; Listen & Follow beta; Study/related teachings; Appearance; More options. Reader's Play, depth tabs and pace are already in the dock and must not be duplicated here.
- Add a **consent-activated visible YouTube player** and validated paste URL selection. For search, open the YouTube website until an approved search adapter exists. Keep navigation and saved reading intact, and label video clock as unsynchronized unless a checked map exists.
- Test that no third-party YouTube requests occur before selection, the iframe does not autoplay, a bad URL is rejected, closing player destroys it and does not leave audio playing, unknown videos do not cause misleading auto-glow, and three depth modes and browser learning remain intact.
- Do not publish beta playback without iPhone/Safari video-player QA and policy review.

**R9+ alignment path**:
- Provider-backed YouTube Search API (credential not in public static app) with embeddability check.
- Rights-cleared curated 2–3 recordings and reviewed timing maps; line-based follow by `player.getCurrentTime()`, pause/seek handling, per-video provenance and coverage.
- Word-level sync only when timing quality supports it. Real recorded audio changes timing per word, not global tokens/minute. Unknown videos show a manual pace guide or an “alignment unavailable” message.

## Editorial-depth workstream, in parallel
For each unit: original exact text → close meaning → simple English/Punjabi → original word/grammar → historical/conceptual context → attributed translation variants → related shabad/Ang with enclosing context → practical reflection distinctly labeled → teach-back → human review status. Begin with Pauris 1–2 against Professor Sahib Singh, SikhRI, and scripture itself; expand in source-grounded batches, not automatic hallucinated interpretations. The Pauri 13 line 1 independent comparison remains OPEN. Never rewrite the canonical scripture to match an audio model or an interpretation.

## Relevant verified primary sources
- YouTube IFrame API: https://developers.google.com/youtube/iframe_api_reference
- Required minimum functions including visible unoccluded player: https://developers.google.com/youtube/terms/required-minimum-functionality
- YouTube developer policies: https://developers.google.com/youtube/terms/developer-policies
- Search: https://developers.google.com/youtube/data/reference/rest/v3/search/list
- Captions list: https://developers.google.com/youtube/data/reference/rest/v3/captions/list
- Captions download restrictions: https://developers.google.com/youtube/data/reference/rest/v3/captions/download
- Text and interpretation source: https://www.gurugranthdarpan.net/0001.html
- SikhRI methodology: https://gurugranthsahib.io/info/english/methodology

## Source and rollout custody
Stable family site: https://sskhangura82.github.io/gurbani-learning-library/
Current accepted version: R7 (`japji-v1-0.9-r7` tag). R8 code branch is separate, does not touch production or saved learning. Keep all previous release evidence, 385 exact original scripture occurrences, 385 bilingual drafts, 42 Study drafts, and previous saved-learning Web Locks modules intact. Attach tests, screenshots, and an explicit diff and policy review before merging. No user recordings or private notes stored in GitHub.
