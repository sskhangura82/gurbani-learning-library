# Safari 26.6 on macOS — reading-place checks on the isolated QA build

**This is NOT an iPhone test.** Desktop Safari on macOS, driven by safaridriver.
No iOS device was involved. No iPhone, iPad, VoiceOver or airplane-mode result
may be derived from this file. The ten-minute physical iPhone script remains
unrun.

- Date: 26 Nov 2026
- Engine: Safari **26.6**, platformName macOS — real WebKit. This workspace has
  no installable WebKit, so this is the first WebKit evidence in the project.
- Target: `https://glp001-iphone-qa.github.io/glp001-iphone-test/`
- Build label read from the live page: **`Source build ID: 1470477 · 26 Nov 2026 UTC · QA 2`**
- Founder unblocked remote automation at approximately 11:34 local. He reported
  opening and closing a WebDriver session; the developer-menu checkbox could not
  be separately verified, and nothing here depends on that.
- Synthetic data only. No real reflections touched. Temporary scripts written to
  `/tmp/glp001_safari` on the Mac and removed afterwards; all safaridriver
  instances I started were stopped. One pre-existing `safaridriver --enable`
  process (PID 15815, started 10:41) belongs to the founder and was left alone.

## 1. Environment facts, confirmed in Safari

| Check | Result |
|---|---|
| Secure context | true |
| `crypto.subtle` present | true (SHA-256 verification can run) |
| Service worker controlling | true |
| `history.scrollRestoration` on the reader page | **`manual`** — the 1470477 repair is live in WebKit |
| `history.scrollRestoration` on the home page | `auto` |
| Lines carrying `data-occurrence` in the Japji reader | 385 |
| Reader document height | ~27,400 px |
| Recovery notice element present | true |
| localStorage keys at first load | `glp001.continuous.v2` only |

## 2. Reading-place retention — four ways of reopening, three times each

Scrolled to y = 11,201 (about 42% through Japji), let the page record the place,
then reopened. "Restored" means landing within 200 px of the mark.

| Way of reopening | Landed | Verdict |
|---|---|---|
| `reload()` | 11201, 11201, 11201 | **3/3 exact** |
| Navigate to the same URL | 11201, 11201, 11201 | **3/3 exact** |
| Fresh URL with a cache-busting query | 11201, 11201, 11201 | **3/3 exact** |
| **Go to the library, press Back** | **0, 0, 0** | **0/3 — place lost every time** |

## 3. FINDING SF-01 (medium) — back-navigation loses the reading place, and the cause is the 1470477 repair

Isolation run, same build, same page, same navigation, only
`history.scrollRestoration` differing:

| Condition | scrollY after Back | Stored place length |
|---|---|---|
| **As shipped (`manual`)** | 0, 0, 0 | 277–280 bytes, intact |
| **Forced to `auto`** | 10884, 11201, (third cycle hung) | 279–280 bytes, intact |

Two conclusions, and I am separating what is shown from what is inferred.

**Shown.** With `scrollRestoration` left as shipped, Back lands at the top of
Japji, three times out of three. With the same page and the same navigation and
only that value changed to `auto`, Back lands at or within ~320 px of the saved
position. The stored place is **intact in both cases** — roughly 280 bytes of
`glp001.continuous.v2` survive the round trip. So the place is not lost; it is
simply not applied on a back-navigation.

**Not yet established.** Why the app restores correctly on reload but not after
Back, when the navigation type reported in both cases was `navigate`. I have not
read the restore code path on this build and will not guess at the mechanism. A
plausible reading is that the app restores only when it judges the visit a
continuation, and treats arrival from the library as a fresh entry — but that is
a hypothesis for the builder to confirm against the code, not a finding.

**Why it matters more than the numbers suggest.** Back is the most-used
navigation on a phone. The repair that fixed one defect appears to have opened
this one, and it is invisible on desktop reload-style testing, which is exactly
the kind of testing done so far.

**Status:** OPEN. Raised against build 1470477. Not a regression against the
published build — the published build does not set `manual` — so this is a cost
of the repair, to be weighed against what the repair fixed.

## 4. Process honesty note

The cause-isolation run **hung on its sixth cycle** and was killed. Five of six
cycles completed and are reported above; the sixth produced nothing and is shown
as such rather than dropped or inferred. The three `manual` cycles and the first
two `auto` cycles are complete and consistent, which is enough to identify the
cause but is one cycle short of the three-by-three design. If the builder wants
the full matrix, it should be rerun.

## 5. Simran Room already exists on this build — and my design draft did not account for it

While on the site I found `simran.html`, titled "Simran Room", already built and
staged on 1470477.

What it already does, read from the live page:

- "ਸਿਮਰਨ · A SILENT SPACE", "Come into stillness." **No audio element at all.**
- States plainly: *"Nothing is played or recorded. No breath holds, prescribed
  technique, scores or streaks."*
- Carries the banner "Use made-up notes only · Qualified review pending" and
  "TEST COPY — NOT THE LIBRARY".
- Says the fuller Naam Simran experience "is being developed from Gurbani and
  Sikh sources, with specialist review still ahead", and that the anchor passage
  deserves "careful study, not a quick meditation-app slogan".
- Gurbani anchor displayed: `ਅੰਮ੍ਰਿਤ ਵੇਲਾ ਸਚੁ ਨਾਉ ਵਡਿਆਈ ਵੀਚਾਰੁ ॥`, attributed to
  Japji Sahib, Pauri 4, labelled "ANG 2".
- Optional sitting times 3 / 5 / 10 / 15 min chosen before starting, with a
  visible countdown (`05:00`), a "Begin quiet sitting" button and an "End" button.

**My error, recorded.** I wrote `PRACTICE_SPACE_DESIGN_v0.md` earlier today
without first checking the staged build, and the build direction I handed the
founder tells the builder to construct a "Room A skeleton" that substantially
exists. That breaches the standing rule against duplicate parallel artifacts on
the same active subject. The designs converge closely — silence by default, no
retention, no streaks, the same Amrit Vela anchor — which is reassuring about
the direction but does not excuse designing without looking. Both documents need
reconciling into one, with the existing room as the baseline.

### Three observations on the existing room

**SF-02 (low) — a visible countdown is a clock to watch.** Choosing a length
before starting matches the design intent. Displaying a live `05:00` counting
down does not: it reintroduces the timer as the unit of practice, which is the
Calm/Headspace pattern the founder explicitly rejected. Recommend the chosen
length stay invisible once sitting begins, with a single soft end signal.
Design question for the founder, not a defect.

**SF-03 (low, rights/verification) — the "Ang 2" claim is not verified.** The
Gurmukhi line and the Pauri 4 attribution I verified independently today against
Shabad OS Database v5.0.0-next.0 asset SSA2. That reference **carries no Ang
numbers**, so I cannot confirm "Ang 2" from it, and I will not confirm it from
memory. The page also offers a "See source Ang 2" link. Per the standing rule
that an Ang number is never sufficient authentication, this needs a second
independently verified source before it is shown as fact.

**Checked and NOT a defect.** The page renders the line without the semicolon
that the reference inserts (`ਸਚੁ ਨਾਉ; ਵਡਿਆਈ`). That semicolon is the reference's
editorial pause mark, not part of Gurbani, so the app's rendering is arguably the
more faithful one. Recorded because a naive text diff would flag it as a
scripture alteration and it is not.

**False positive in my own instrument.** My detector for counters and streaks
fired `true` on this page. It matched the sentence saying there are *no* scores
or streaks. There are no counters on the page. My regex was wrong, not the build.

## 6. What this does and does not close

**Closes:** the absence of any WebKit evidence. Reading-place retention now has
real-Safari results on three of four reopen paths, and a cause-identified
failure on the fourth.

**Does not close:** anything about iPhone, iOS Safari, iPad, VoiceOver or
airplane mode. Desktop Safari and iOS Safari differ in navigation behaviour,
memory pressure and tab eviction — the very areas SF-01 touches. The ten-minute
physical script is still the only thing that can settle those, and it has not
been run.
