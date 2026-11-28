# Listen along with a YouTube recitation — findings and prototype

GLP-001 · 2026-11-27 · Prepared by Claude (Independent Second Reviewer, Gurbani Researcher) for Steve and ChatGPT.
Status: working prototype on branch `claude/listen-along-prototype`, delivered as a patch. Not merged, not linked from the home page.

## The short answer

Yes. Any Gurbani video on YouTube can play inside the app while the Gurbani lights up line by line at the reciter's real pace. It takes almost no space.

- **The video plays in YouTube's own player** embedded in our page (privacy-enhanced mode). Nothing is downloaded or stored. The app keeps only a small timing note per video: under 1 KB after a few taps, and about 23 KB for an exact, line-by-line timing of Japji Sahib.
- **The page asks the player "which second are we at?"** several times a second and lights the line that belongs to that second. At 0.75× or 1.5× speed the text still matches, because it follows the video's own clock.
- **The only missing piece is the timing**: which second each line starts. There are three ways to get it, and all of them work today:
  1. **One tap (estimate).** Tap "First line starts now" when the recitation begins. The app spreads the bani across the rest of the video in proportion to each line's length. This is good enough to follow along, but it can drift.
  2. **Fix taps.** When the light drifts, tap the line actually being recited. The light snaps there and learns the reciter's pace from then on.
  3. **Teach once (exact).** In "Teach timing", tap a big button as each line begins. This takes one listen. After that the video always follows exactly, and the timing can be shared with family as a link or shipped inside the app.
- **Fully automatic "any video, no taps" is not ready yet.** The page cannot hear the YouTube sound, because the player is sealed off from our page and YouTube forbids downloading its audio. The best public research system (July 2026) is right about 58–70% of the time in its hardest live setting. This is a later step, not a blocker.

## What YouTube allows and forbids

These rules shaped the design. Links are in Sources.

| Rule | What it means for us |
|---|---|
| Use the official embedded player. Don't cover, change or block it. Its viewport must be at least 200×200 px. | The text sits beside or below the video, never over it. |
| No downloading, caching or storing copies of videos, and no offline playback. | Listen-along needs internet. It is not in the offline cache. |
| No separating the audio from the video. No background play. | The screen must stay on. The page keeps it awake while playing, and playback stops when the phone locks. |
| The player must identify the site asking (HTTP Referer). | This works on the website. Inside a future iPhone app wrapper (Capacitor/WKWebView), the wrapper must set a base URL, or YouTube shows **Error 153**. |
| Video owners can switch off embedding. | The page explains this plainly and offers an "Open it on YouTube" link. |
| Caption files of other people's videos cannot be downloaded through the API (it needs edit rights on the video). | YouTube's auto-captions are not a timing source. |
| On phones, the first play may have to be tapped on the video itself. | Handled: the page shows that hint when YouTube reports the play was blocked. |

## How this fits the project's standing rules

- **Scripture accuracy.** The page reads the library's own text files: Japji (Open Granth/Shabad OS), the six Nitnem files and Sukhmani. It checks every line against its stored SHA-256 fingerprint before showing anything. If a single line fails, the text is not shown. No Gurbani was retyped, modernized or edited. Display order follows the reader's own rules: prefaces, metrical headings, and the mid-chhand heading in Jaap 62.
- **No AI in the reader, no microphone, no accounts, no analytics.** The timing is the listener's own taps.
- **Privacy change (founder decision).** This is the first page that contacts an outside service. It has its own Content-Security-Policy that allows only `www.youtube.com` (the official player script) and `www.youtube-nocookie.com` (the player frame). Every other page still has `frame-src 'none'` and is unchanged. YouTube is not contacted until the reader presses Open.
- **Audio rights (founder decision).** We do not host, copy or redistribute any recording. Playback happens in YouTube's player under YouTube's terms, and the owner decides whether embedding is allowed. Steve should still confirm that this fits his "no unlicensed audio" rule.

## Answering "match the reading speed"

- The light moves at the speed of the actual recitation in the video, not at a fixed reading pace. Each line gets time in proportion to its spoken length: Gurmukhi letters, plus a breath at each line end and a longer one at each pauri end.
- Every tap corrects the pace. After two taps, the light uses the measured pace between them. That is what makes one video at 18 minutes and another at 25 minutes both line up.
- The playback speed control (0.75×–1.5×) slows a recitation down for learning. The text stays matched because the timing is in video seconds.
- "↺" plays the glowing line again, for learning pronunciation.
- **Paath vs kirtan.** In paath, the light glides smoothly. In kirtan, where lines repeat and come back, the light waits on the line you tapped until your next tap. That is a setting.

## What was built

| File | Purpose |
|---|---|
| `listen-along.html` | The page (own CSP, privacy-enhanced YouTube player) |
| `css/listen-along.css` | The library's Day/Amrit palette and Gurmukhi serif. Phone layout keeps the video and controls on top; wide screens put the video on the left. |
| `js/listen-along-core.js` | Pure timing logic (no screen, no network): line weights, marks, estimating, kirtan hold, timing files, share links, YouTube link parsing |
| `js/listen-along.js` | The page: loads and verifies text, drives the official IFrame API, tap-to-mark, teach mode, save/share/open timing |
| `timings/index.json` | Empty "family timing library". Reviewed timing files placed here make a video follow with no taps for everyone. |
| `tests/listen-along-core.mjs` | 17 Node tests of the timing logic against the real scripture files |
| `tests/listen-along-browser.mjs` | 23 Chromium checks of the whole page, with a stand-in YouTube player |

Banis offered: Japji, Jaap, Tav-Prasad Savaiye, Benti Chaupai, Anand, Morning Nitnem (all five in order), Rehras, Kirtan Sohila and Sukhmani. That is 3,809 fingerprinted lines. Sukhmani loads only when chosen.

## How it works (for the builder)

- **Weights.** Each line's weight counts Gurmukhi consonants and independent vowels (U+0A05–0A14, 0A15–0A39, 0A59–0A5E), with ੴ counted as 3. Vowel signs and verse numbers count 0. Each line gets +2 for a line-end breath and +3 more at a unit end. Japji weighs about 6,000. The fallback pace is 5 units/s (Japji in about 20 minutes, an assumption), used only when there are no marks and no video length.
- **Marks.** A mark is `(video second, line)`. Between two marks going forward, the position is interpolated by weight. After the last mark, the measured pace from the last 6 forward segments carries on. With a single mark, the rest of the bani is spread over the remaining video length (97% of it). Taps are shifted 0.2 s earlier to allow for reaction time. Two marks within 0.3 s replace each other.
- **Corrections.** In paath, a new mark removes marks that contradict its order, and Undo restores them. In kirtan, marks may repeat and go backwards, and the line is held until the next mark.
- **Timing file** (`GLP-LISTEN-ALONG-TIMING-1`) holds the YouTube id, the bani, the text edition (line count plus fingerprint) and marks as `{t, line key}`. Lines are named by key, never by text. A full Japji tap-along is about 23 KB as a saved file, and about 2.6 KB of text as a share link.
- **Share link.** `listen-along.html#v=<id>&b=<bani>&s=p|k&n=<lines>&a=<marks>`, with marks in base-36 deciseconds and line index. The page imports it, saves it locally, then strips the marks from the address. A link made for a different edition is refused.
- **Storage.** Browser localStorage key `glp.listenAlong.v1` holds settings, the last session and timings by `bani|videoId`. All of it is wrapped in try/catch. Shared or shipped timings fall back in this order: link, then this device, then `timings/`.
- **Player.** `new YT.Player(..., {host:'https://www.youtube-nocookie.com', playerVars:{playsinline:1, rel:0, origin}})`. It handles `onReady`, `onStateChange`, `onPlaybackRateChange`, `onAutoplayBlocked` and `onError` (2, 5, 100, 101/150, 153). Time is sampled every 250 ms and interpolated between samples so the word glow is smooth. A Screen Wake Lock is held while playing.

## Evidence

- `node tests/listen-along-core.mjs`: 17/17 pass.
- `node tests/listen-along-browser.mjs`: 23/23 pass in Chromium at 320, 390 and 1280 px widths, in night and day themes. Screenshots are in `evidence/screenshots/listen-along/` and the results in `evidence/listen-along-browser.json`.
- All 10 existing Node suites still pass. No existing app page, script or scripture file was changed; the only edit to an existing file adds the new tests to the quality-check workflow.
- **Not yet tested:** real YouTube playback (this workspace cannot reach YouTube), a physical iPhone, Safari, VoiceOver, and a Capacitor wrapper. Until those are done, "tested" means tested with a stand-in player only.

## Decisions for Steve

1. **Allow YouTube on this one page?** Recommended: yes, limited to this page, in privacy-enhanced mode, with YouTube contacted only after Open.
2. **Confirm** that embedding public videos through YouTube's own player fits the "no unlicensed audio" rule.
3. **Pick 3–5 favourite videos** (reciters the family trusts) to teach once and ship in `timings/`, so the family gets exact following with no taps.

## Next steps for ChatGPT

1. Apply the patch on a branch (`git am`) and run both new tests plus the existing suites.
2. Do a real-world check on iPhone Safari and a desktop browser with three videos: a Japji paath, a Jaap Sahib, and a kirtan shabad. Confirm the player loads without Error 153, the light follows, speed changes stay matched, the screen stays awake, and the first-play hint appears if needed.
3. After Steve approves, merge and add a home-page link.
4. Later: set the Referer/base URL in the Capacitor wrapper; support any shabad by first-letter search over bundled Shabad OS data; optionally ask channels for permission to turn their own line-timed captions into timing files; study on-device listening as an opt-in.

## Sources

- YouTube IFrame Player API reference — https://developers.google.com/youtube/iframe_api_reference
- YouTube API Services Developer Policies — https://developers.google.com/youtube/terms/developer-policies
- Required Minimum Functionality (Referer, player size, no overlays) — https://developers.google.com/youtube/terms/required-minimum-functionality
- Complying with YouTube's Developer Policies (background play) — https://developers.google.com/youtube/terms/developer-policies-guide
- Captions: download requires edit permission — https://developers.google.com/youtube/v3/docs/captions/download
- Error 153 in iOS WebViews / Capacitor — https://dev.to/davidvesely/fixing-youtube-error-153-in-ios-capacitor-apps-a-simple-proxy-solution-607 and https://github.com/openai/openai-apps-sdk-examples/issues/161
- Live Gurbani Tracking benchmark (Karanbir Singh, July 2026) — https://arxiv.org/abs/2607.13457 and https://github.com/karanbirsingh/live-gurbani-captioning-benchmark-v1
- Existing Gurbani apps with one bundled recording and synced highlighting — e.g. Gurbani Guide (https://apps.apple.com/app/id6736921603), Sukhmani Sahib MP3 Lite (https://apps.apple.com/app/id1125008796). None of the apps found lets you choose any YouTube video.
