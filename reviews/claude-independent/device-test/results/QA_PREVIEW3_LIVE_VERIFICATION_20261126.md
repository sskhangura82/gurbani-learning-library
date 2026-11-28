# Staged QA preview 3 — live verification before the founder samples it

**Desktop Safari on macOS only. NOT an iPhone test.** The physical acceptance
script remains unrun and nothing here claims any iPhone, iPad, Home Screen,
VoiceOver or airplane-mode result.

The builder reported staging frozen PR #55 (`acfeb0a`, carrying PR #54's
repairs) to the isolated QA site at `preview.html`. A staging claim is a claim,
so it was checked before telling the founder the preview is good to use.

- Engine: Safari **26.6**, real WebKit, driven by safaridriver.
- Target: `https://glp001-iphone-qa.github.io/glp001-iphone-test/preview.html`
- Date: 26 Nov 2026. Synthetic data only. Mac left as found; every process
  started here was stopped and temporary files removed.

## What the live site actually serves

| Check | Result |
|---|---|
| Visible label | **Preview 3** |
| Page title | Latest preview · Gurbani Learning Library |
| Readers linked | Japji, Sukhmani, Nitnem, **Salok Mahalla 9**, **Salok Kabir**, Gurdwaras |
| New rooms linked | **Simran**, **Breathing**, **Articles** |
| `breathing.html`, `simran.html`, `articles/index.html`, `full-japji.html` | all **HTTP 200** |

So the staged site carries the content of PR #51, #52, #54 and #55 — all of
which this seat has reviewed (RT-004, RT-006, RT-007).

## The SF-01 repair is genuinely in the served script

Fetched `js/japji-full.js` from the live origin and inspected it:

| | Result |
|---|---|
| `pageSuspended` guard present | **yes** |
| `pageshow` → `restoreAnchor` path present | **yes** |
| Still sets `scrollRestoration='manual'` | **yes** — the reload fix was not reverted |

## The behaviour the founder will actually feel — PASS

Live site, real Safari, read Japji to 42%, go to the preview page, press Back:

| | |
|---|---|
| `history.scrollRestoration` on the live reader | `manual` |
| Target | y = 11209 |
| Landed, three attempts | **11209, 11209, 11209** |
| Within 200px | **3 of 3** |

On build 1470477 this was 0 of 3. **The defect is closed on the live staged
site, not only on a candidate branch.**

## The Simran refinements are live too

| Check | Result |
|---|---|
| Countdown element present | **no** |
| Any clock visible on screen | **no** |
| Copy states the clock stays out of view | **yes** |
| Any Ang asserted as fact | **no** |

## What this changes, and what it does not

**Changes:** the founder can sample the preview now, and the two rough edges I
warned him about this morning — losing his reading place on Back, and the
ticking Simran countdown — are both gone from the live site, verified rather
than reported.

**Does not change:** this is desktop WebKit. iOS Safari differs precisely where
SF-01 lives, in navigation, memory pressure and tab eviction. Sampling on the
phone is still the only way to learn how it behaves there, and the ten-minute
physical script is still unrun. Qualified Gurbani review of every teaching draft
is untouched, as are RB-01, the PR #52 mutation and mobile-label checks, the
printed-source collation gate and ART-P01's cross-viewer question.

No approval, no merge, no release. Production and the source PR heads are
unchanged.
