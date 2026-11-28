Note: the `Write` tool is disabled in this session, so no plan file was created — which is consistent with the read-only constraint anyway. The review is below in full. No files were changed, no shell commands run, nothing merged, pushed, or sent anywhere.

# Independent review — Listen-along consolidation candidate

**Verdict: changes required.** One concrete correctness defect in the new replay/alignment path (F1), plus smaller actionable items. Nothing I found undermines exact source preservation, pre-parse pinning, the unconfigured-provider refusal, edition-bound timings, or stale-load handling. No release approval and no content/historical approval is given or implied.

## Review scope

Candidate runtime commit `8ec9b599dba4d112b6cc371e69d1515d2c9591ab`; parent target PR #77 `7b0f8a35a093b4d4f10e95a1f65b2201f80d0c58`.

Read in full: the criteria doc first; then `collections/source-reader/read-along-bani.mjs`, `read-along-bani-lock.mjs`, `read-along-core.mjs`, `read-along.mjs`, `listen/index.html`, `listen/read-along.css`, `tests/youtube-bani-read-along.mjs`, and all 1027 lines of `tests/youtube-read-along-browser.mjs`. Consulted for interaction contracts only: `read-along-player.mjs`, `read-along-source.mjs`, `read-along-config.mjs`. Corroborating reads: `nitnem/reader.js`, `nitnem/data/jaap.json`, the `js/sukhmani-data.js` / `js/japji-full-data.js` headers, `sw.js`, `tools/script-integrity/policy.mjs`, `app-graphs.json`, and the consolidation `change-scope.json`.

Not reviewed: automatic recognition / word timing, other religions, deployment (all explicitly out of scope). Not inspected: private-library material, owner credentials, user profiles, unrelated folders, other sessions. Provider setup left empty and untouched.

Per the scope record, the only modified application logic is `read-along-core.mjs` and `read-along.mjs`; `read-along-player.mjs` and `read-along-config.mjs` are unchanged from PR #77, so player-side observations below are inherited rather than introduced.

## Findings

### F1 — Medium — ms↔s float round-trip can mis-highlight and mis-replay after a seek — *observed*

`read-along-core.mjs:136-143` (`lineAt`), `read-along.mjs:33-40` (`currentCue`), `read-along.mjs:133-141` (`alignmentMessage`); seek callers `read-along.mjs:374` and `:530-536`.

Cues are integer milliseconds. Seeks pass `cue.at / 1000` seconds, and the interval comparison recomputes `mediaSeconds * 1000`. For many integers `n`, `(n/1000)*1000 < n` in binary64 — e.g. `1005 → 1.005 → 1004.9999999999999`. So after `↺ Replay line` or clicking a marker in the review list, the reported media time can compare as *just before* its own cue; `lineAt` then returns the previous interval's `lineId` and `currentCue` returns the previous cue. On a paused recording this persists, and a second Replay click walks backwards one line instead of repeating the same one.

Real cues come from `Math.round(timeSeconds * 1000)` (`read-along.mjs:384`), i.e. arbitrary integers — so this is the normal case in use, not an edge case. Found by reading, not by test; see the test caveats for why the suite structurally cannot show it.

Fix: compare in integer milliseconds (`Math.round(mediaSeconds * 1000)`) via one shared helper used by all three call sites — choosing the tolerance together with F2.

### F2 — Medium — real `seekTo` lands before the target — *hypothesis, needs the configured live run*

`read-along-player.mjs:250-258`, `read-along.mjs:398-408`. The IFrame API snaps to a keyframe unless the exact position is buffered, so `getCurrentTime()` after `seekTo(t)` commonly reports slightly *less* than `t`. Same visible symptom as F1 from a different cause, and not fixed by rounding alone. Either add a few milliseconds of tolerance, or pin the replayed cue as active until the clock leaves its interval.

### F3 — Low/Medium — a link start offset beyond the recording kills the player session — *observed*

`read-along.mjs:157-166` → `read-along-player.mjs:250-258`. `parseYouTubeURL` accepts `t=` up to 7 days (`read-along-core.mjs:4,28`). `pendingStart` is applied via `controller.seek(start)`, which fails terminally with `YOUTUBE_SEEK_INVALID` / "This timing marker is outside the recording." — wording about a timing marker for what is actually a share-link offset. Clamp to `durationSeconds`, or ignore it with its own message, rather than failing the connection.

### F4 — Low — stale `controller` after the player self-destroys — *observed*

`read-along.mjs:171-181`. Terminal player failures (`YOUTUBE_PAUSE_FAILED`, and MutationObserver / `pagehide` / IntersectionObserver-driven `destroy()`) notify through `onError` but never clear `controller`. `#video-disconnect` stays enabled, and the discard-dialog close handler (`:560-564`) can unhide `#youtube-player` onto an empty `.player-instance` box. No bogus timing can result — `currentClock()` and `seek()` both re-validate against a fresh `controller.snapshot()`. State/UI only.

### F5 — Low — row `kind` is computed and discarded — *observed*

`read-along-bani.mjs:72` sets `kind: 'heading' | 'line'`; `read-along.mjs:197-228` never renders it and the CSS has no heading style. "ਚਾਚਰੀ ਛੰਦ ॥" looks identical to a verse row, where the existing readers distinguish metrical headings and prefaces (`nitnem/reader.js:352-358`). Order and bytes are preserved correctly — the criteria requirement is met — but the edition's own typographic distinction is lost. Cheap fix: `row.dataset.kind`, a muted style, and include it in `.read-along-line-state` for screen readers.

### F6 — Low — `sourceDisplayOrder` validation weaker than the existing reader's — *observed*

`read-along-bani.mjs:90-107` enforces coverage (every line and heading exactly once) but, unlike `nitnem/reader.js:78-80`, does not require the relative order of lines in `sourceDisplayOrder` to match `unit.lines`. Not exploitable — the whole file is SHA-256 pinned before parsing — but two consumers of the same data now enforce different contracts.

### F7 — Low — menu labels diverge from the pinned edition titles — *observed*

`listen/index.html:25` offers "Rehras Sahib" / "Sohila Sahib"; the pinned editions are "Sodar Rehras Sahib" / "Kirtan Sohila" (`read-along-bani-lock.mjs:85,98`), which is what then appears in `#source-title` and every row locator. "Morning Nitnem · five Banis" opens as "Morning Bani selection" (`:199`). Naming consistency, not integrity.

### F8 — Low, accessibility — arrow-key navigation during teaching scrolls the list away — *observed*

`read-along.mjs:110-120` with `:492-499`. The keydown handler calls `selectLine(..., {focus:true, reveal:true})`, which also sets `teachLineId` and runs `revealTeaching()` — window-scrolling the teaching panel to the top on every ArrowUp/ArrowDown. On narrow layouts the focused row can end up below the fold while keeping DOM focus. Suppress `revealTeaching()` for in-panel keyboard navigation.

### F9 — Low, accessibility — chatty live regions while following — *observed*

`#alignment-status` (`listen/index.html:62`) is `role="status" aria-live="polite"` and `updateAlignment()` rewrites it to "Timed line N · <label>" on every interval change under the 250 ms poll; `.teach-preview` is additionally `aria-live="polite" aria-atomic="true"`. `text()` suppresses no-op writes, so it is one announcement per line — but with a dense map that is a continuous stream of interruptions.

### F10 — Low — teaching preview clips long rows on small phones, and the test metric is unasserted — *observed*

`.teach-original` is `max-height:180px` (`listen/read-along.css:4`), and `clamp(100px, calc(100svh - 520px), 180px)` under 760px (`:10`), with `overflow:auto`. At 320×640 that is roughly 120 px for text at 25px/1.9, so the Mool Mantar row — which the suite deliberately selects as a >60-character row — is readable only by scrolling the preview. It is operable (`tabindex="0"`, `role="region"`, `scrollTop = 0` per line change) but not fully visible. The browser scenario records `previewTextHeight` / `previewClientHeight` (`tests/youtube-read-along-browser.mjs:950-951`) and never asserts on them; its `fullyVisible` / `uncovered` assertions are on the bounded container. A PASS here does not establish that the complete line is visible.

### F11 — Informational — `madeForKids` is required but unused — *observed*

`read-along-player.mjs:67,79` demands a boolean `status.madeForKids` and returns it; `createYouTubePlayer` discards the whole `readVideo` result (`:287`) and `read-along.mjs` never reads it. The only behavioral effect is refusing recordings whose MFK status YouTube does not report; `tests/youtube-read-along-browser.mjs:546-559` confirms MFK=true connects normally. There is no differential handling or disclosure. Whether the Made for Kids guide should be satisfied by behavior rather than preflight alone is a release decision, not a code defect.

### F12 — Hypotheses only a configured live run can settle

(a) `listen/index.html:6` sets `style-src 'self'` with no `'unsafe-inline'`. If YouTube's `www-widgetapi` sizes the host iframe via `setAttribute('style', …)` rather than CSSOM, that write is blocked. The adapter supplies its own pre-built, CSS-sized iframe (`read-along-player.mjs:292-305`; `listen/read-along.css:6`), so the likely outcome is only a CSP report — but the intercepted SDK cannot show it.

(b) `videoFromPlayerUrl` (`read-along-player.mjs:133-141`) accepts only `youtube.com` / `www.` / `m.` watch URLs, while the embed is created on `youtube-nocookie.com`. If a real `getVideoUrl()` returns a nocookie URL, `actualId` is `null` and `refresh()` throws `YOUTUBE_CLOCK_UNAVAILABLE` as soon as `state === 'playing'` or `timeSeconds > 0` (`:199-203`) — following would never start. The simulated SDK returns the `www.youtube.com` form (`tests/youtube-read-along-browser.mjs:169`), so the suite asserts the happy branch by construction.

### F13 — Informational — `manifestSha256` is a self-consistency receipt

`selectionIdentity()` (`read-along-bani.mjs:25-35`) digests values read from `read-along-bani-lock.mjs` and compares against a constant in that same file. It reliably catches an inconsistent lock edit and binds timing maps to an exact ordered constituent set; it adds no authentication beyond the bundle. The real pinning chain is `listen/index.html` SRI → `policy.mjs` + `app-graphs.json` → `sw.js` `EXPECTED`. Worth stating so the digest is not over-described in release notes.

### F14 — Informational — the scope record omits the gating integrity changes

`evidence/claude-listen-along/consolidation/change-scope.json` lists 8 application files against a 376-file "application" set. `tools/script-integrity/policy.mjs:277-338` and `app-graphs.json:436-540` carry the new graph entries, and `tests/youtube-bani-read-along.mjs` plus the new browser scenarios are new or changed; none appear in the record. Nothing suspicious, but the record alone does not describe everything that gates the bundle.

## What I positively confirmed

- **Unconfigured refusal before any provider request.** `read-along-config.mjs:4` is `''`; `createYouTubePlayer` calls `validateRequest(videoId, apiKey)` as its first action (`read-along-player.mjs:154`) and throws `YOUTUBE_NOT_CONFIGURED` before `readVideo`, `fetch`, or `loadYouTubeApi`. No module-scope network call exists.
- **No address or preset can start a connection.** `read-along.mjs` has no `location`, `history` or `sessionStorage` reference at all; `localStorage` is touched only in `saveTiming`, `loadSaved` and the delete handler, each keyed by `timingKey`. The criterion is met by absence of the capability, not by a guard.
- **Pinning before parsing.** `reading()` requires crypto, validates the selection id, and verifies the selection manifest digest *before* fetching (`read-along-bani.mjs:166-172`). `bounded()` enforces `redirect:'error'`, `!response.redirected`, exact `content-length` when unencoded, and a fixed-size buffer (`:119-144`). The whole-file SHA-256 is checked before `parseSource` (`:150-151`), then every row's own digest (`:154-158`). Parsing strips a literal wrapper prefix/suffix and uses `JSON.parse` only — no `eval`, no `new Function`, no script insertion; `TextDecoder(…, {fatal:true})` rejects invalid UTF-8.
- **The pinned editions are the existing published files.** All eight `sha256` values in `read-along-bani-lock.mjs` are byte-identical to the pre-existing `sw.js` `EXPECTED` release hashes for `js/japji-full-data.js`, `js/sukhmani-data.js` and the six `nitnem/data/*.json` — an in-repo cross-check independent of the new tests.
- **Jaap Chhand 62.** `nitnem/data/jaap.json:5382-5407` places `metricalHeading` index 0 after `jaap062.line01`; `:5274-5278` holds "ਚਾਚਰੀ ਛੰਦ ॥"; `read-along-bani.mjs:90-107` honours `sourceDisplayOrder`, matching `nitnem/reader.js:352-358`, and the preface-then-units fallback matches `nitnem/reader.js:94`. Coverage is enforced, so no row can be silently dropped.
- **Nine selections, five-part Morning.** Eight named Banis plus `morning` (385+808+43+121+210 = 1567), with per-row id uniqueness and a 2048-row cap. Row strings go into the DOM via `textContent` with `white-space:pre-wrap`, so no normalization or retyping occurs.
- **Edition-bound timings and safe import.** `checkedReading` constrains `daily-bani` to exactly the nine ids (`read-along-core.mjs:63-68`); `sameBinding` compares collection, edition, manifest digest, selection id and the *ordered* unit id/sha pairs (`:85-91`); `timingKey` partitions storage by video, collection, manifest digest and selection (`:145-149`). Full-source readings carry `sggs`/`dasam` with `section:`/`unit:` (`read-along-source.mjs:68-71`), so a 385-row `bani:japji` map and a 385-row `section:1DSA` map cannot cross — asserted at `tests/youtube-bani-read-along.mjs:190-195`. Refused imports and loads return before `replaceTiming`, leaving both the current map and the stored record intact.
- **No invented playable line.** `lineAt` requires at least two cues and a strictly following cue (`read-along-core.mjs:136-143`); `currentCue` additionally requires `lineId !== null`. An unfinished final marker, a marked text pause, and a pre-first-marker gap all disable Replay and highlight nothing. `#timing-replay` reads a fresh `controller.snapshot()` (`read-along.mjs:531`), so a repeated line targets the occurrence at the current media time — subject to F1/F2.
- **Paused state preserved across seeks.** `seek()` re-pauses only when the state is not playing/buffering (`:402`).
- **Stale loads.** `sourceSequence`/`contextSequence`, `playerSequence`, `browseSequence`, and `importSequence` + `mapRevision` + `contextSequence` + reading/video identity. Every late continuation re-checks before mutating; `connectVideo` destroys a superseded player.
- **Disposal and pauses.** `visibilitychange`→pause and `pagehide`→destroy in both the app (`:568-569`) and the player (`read-along-player.mjs:285-286`), plus `IntersectionObserver`→pause offscreen and a `MutationObserver` self-destroy when the mount is detached.
- **Teaching, Undo, scrolling.** Teaching refuses to advance without a clock, ends cleanly at the last row, and re-queues an earlier row on selection; Undo re-queues the just-marked row (`:519-524`); follow-scrolling yields to keyboard focus inside the panel and to the unchecked follow control (`:103-109`).
- **Owned-bundle graph and offline cache.** Exactly the two new modules registered (`app-graphs.json:447-461`; `policy.mjs:288-289,330-336`); the single dynamic-script capability scoped to `read-along-player.mjs`'s `youtubeAPIScript` and `https://www.youtube.com/iframe_api` (`policy.mjs:9-13`); one page entry (`policy.mjs:355`); the HTML SRI `sha384-IWil4Gdh…` matches the graph output integrity. `sw.js` precaches only `listen/`, `listen/index.html`, `listen/read-along.css` and the bundle — no provider origin, no external media. CSP is narrow.
- **Privacy disclosure and storage discipline.** The full notice, the Data API status check, YouTube ToS and Google Privacy Policy links are retained (`listen/index.html:21,77-81`). The browser suite's `Storage.prototype` audit asserts no read, write, remove or clear outside `glp001.youtube-timing.v1:`, and that the seeded legacy and private sentinels stay byte-identical.
- **Manual-timing honesty.** `timingStatus: 'USER_MARKED'` is the only accepted value, and `#text-help` states words are not recognised automatically. No word-level or estimated timing is produced anywhere.

## Test-quality caveats (passing counts are not correctness)

- `tests/youtube-bani-read-along.mjs:61-84` derives the japji/sukhmani expectation with the same "units → lines" traversal the adapter uses, so for those two formats the ordering assertion is a re-implementation rather than an independent oracle. Row digests, counts and forged-row rejection are genuinely independent; the nitnem expectation does mirror `nitnem/reader.js`'s published contract, which is the right oracle.
- The synthetic clock only uses whole seconds, so every cue `at` is a multiple of 1000 and exact in float — F1 is unreachable by construction.
- The simulated SDK defines away F2 (`seekTo` sets `this.time = seconds` exactly) and F12b (`getVideoUrl` returns the `www.youtube.com` form).
- `previewTextHeight` / `previewClientHeight` are recorded but never asserted (F10).
- No scenario covers Undo *during* teaching, nor a `t=` offset beyond the recording duration (F3).
- Real-device performance is untested: up to 2048 rows render without virtualisation (Sukhmani 2027, Morning 1567) alongside a `subtree` MutationObserver on `documentElement` (`read-along-player.mjs:281-284`) and repeated full-reading revalidation per mark.

## Remaining release prerequisites — separate from the code defects above

None of these is cleared by fixing F1, and none is something code review can settle:

1. An owner-configured, referrer-restricted YouTube Data API v3 browser key on the target origin plus a live integration run — the only way to settle F2 and F12.
2. Physical iPhone / Safari testing, including VoiceOver. Still untested.
3. The Made for Kids policy decision behind F11.
4. Existing source and editorial qualifications are unchanged by this review: fingerprint verification preserves a named digital edition and establishes nothing about printed collation, authorship, teaching review, or recitation alignment. No new human-review gate is proposed here.
5. The prototype's native-Mac diagnostic (Japji, Jaap and one kirtan played; another kirtan refused embedding) is not verification of this configured consolidated release or of recitation alignment.

## Minimum to clear the verdict

F1, via one shared integer-millisecond helper used by `lineAt`, `currentCue` and `alignmentMessage`, with the tolerance chosen together with F2 — plus a regression test that drives the synthetic clock with non-round milliseconds (e.g. cues at 1005 ms and 40001 ms) and asserts Replay keeps the same line active. F3, F4, F5, F7 and F8 are small and independent. F6, F9 and F10 are judgement calls for Steve. F11–F14 are statements of fact for the release record rather than work items.
