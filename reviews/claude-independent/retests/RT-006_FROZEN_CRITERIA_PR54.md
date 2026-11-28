# RT-006 — PR #54: frozen acceptance criteria

Committed **before** reading any diff, any `docs/` file or any `evidence/` file
on this candidate. What I looked at first was only the PR shape and the list of
changed file **names**, which I needed in order to know what to test; I state
that rather than claim a cleaner separation than exists.

- Candidate: PR #54, head `8917beaab7acc5770cb5a8fee682c9702a0689cb`, draft,
  branch `feature/learning-reliability-practice-20261126`.
- Base: frozen PR #52 at `792afa209c98bb53f257a8dfd5500bef10bfc8e3`.
- The builder requests no verdict and assigns none. No merge or deploy requested.

This candidate claims to repair four defects **I** raised: SF-01, SF-02, SF-03
and RT4-05. A reviewer checking repairs to his own findings has an obvious bias
toward confirming them. The criteria below are therefore written to try to
**break** each repair, not to observe it working.

Runtime files changed, from the names alone: `js/japji-full.js`,
`nitnem/local-learning.js`, `js/simran.js`, `simran.html`, `css/simran.css`,
`index.html`, `css/home.css`, `sw.js`, `tools/build-offline.mjs`, plus new
`breathing.html`, `css/breathing.css`, `js/breathing.js`, `js/breathing-core.js`.
**No scripture data file appears in the list.** That is consistent with their
claim and is itself criterion RT6-C12.

## Criteria

### SF-01, the Japji reading place

| ID | Criterion | Fails if |
|---|---|---|
| RT6-C1 | Go to the library, press Back: the place is restored, 3 of 3, in **real Safari** | it lands at the top even once |
| RT6-C2 | The reload fix is preserved, not reverted | `history.scrollRestoration` is no longer `manual` on the reader |
| RT6-C3 | Reload, same-URL navigation and a fresh cache-busted URL still restore | any of the three regresses from its 3 of 3 |
| RT6-C4 | No transient top-of-page position is persisted | after a departure and return, the **stored** place points at or near 0 |
| RT6-C5 | The guide returns paused, not playing | it resumes on its own |

RT6-C1 must be judged in Safari. This workspace cannot install WebKit, so the
candidate will be served from the founder's own Mac over localhost and driven
with safaridriver. Chromium evidence does not satisfy RT6-C1.

### RT4-05, the storage refusal

| ID | Criterion | Fails if |
|---|---|---|
| RT6-C6 | A write that fails on quota produces a plain preservation message | the learner sees a raw browser string, or no message |
| RT6-C7 | Existing notes, bookmarks, revision and reading position survive the failure | any of them changes |
| RT6-C8 | **No fixed lower cap was introduced** | a new constant byte or character ceiling gates the import |
| RT6-C9 | No clearing, eviction or probing of storage, and no invented available-quota figure | `removeItem`, `clear`, a trial-write probe or an assumed quota appears |
| RT6-C10 | No silent partial import | a partially merged record is written |
| RT6-C11 | The per-note limit and the format ceiling are unchanged | `NOTE_LIMIT` or `maxBackupBytes` arithmetic differs |

RT6-C8 and RT6-C9 matter because the remedy I originally proposed — a fixed
lower cap — was wrong, and the builder rejected it. If it has crept in anyway,
that is a finding.

### SF-02 and SF-03, the Simran Room

| ID | Criterion | Fails if |
|---|---|---|
| RT6-C12 | No live countdown anywhere | a ticking time is rendered while sitting |
| RT6-C13 | The selected length is hidden while sitting and while paused | it is displayed |
| RT6-C14 | The UI no longer asserts an independently established Ang | an Ang is presented as established fact |
| RT6-C15 | The anchor's Gurmukhi is byte-unchanged from the base | it differs by even one character |

RT6-C15 is the one that matters most in this group. A UI refinement must not
touch scripture.

### The new breathing tool

| ID | Criterion | Fails if |
|---|---|---|
| RT6-C16 | Two phases only, **no breath holds** anywhere in code, UI or copy | any hold, retention or kumbhak appears |
| RT6-C17 | No sacred text, no Gurmukhi, no Simran data, no shared storage key | any appears |
| RT6-C18 | No persistence of any kind | anything is written to storage |
| RT6-C19 | Explicitly optional, and carries a not-treatment line | either is absent |
| RT6-C20 | Reduced-motion preference respected; stops when the page is hidden | animation continues under either |
| RT6-C21 | No claim that six per minute is optimal, and no scriptural equivalence | either appears |

RT6-C21 exists because my own earlier framing overstated the evidence and the
builder corrected me. The repaired copy must not repeat my error.

### Across the whole candidate

| ID | Criterion | Fails if |
|---|---|---|
| RT6-C22 | No scripture package, teaching file, source selection or source lock changed | any differs from the frozen base |
| RT6-C23 | No new exposition, interpretation or licensed content | any appears |
| RT6-C24 | No device, VoiceOver or airplane-mode success claimed | such a claim appears in the PR or the UI |

## Method and its limits, stated in advance

- Scripture comparisons normalise the reference's editorial comma, semicolon and
  full stop **for comparison only**. Raw strings are never altered. The danda
  `॥` is part of the text and is never touched.
- Any Ang locator I can check sits inside a single textual lineage: the
  application pins Open Granth, and Open Granth declares Shabad OS as its source
  (RT-005). So no Ang finding here can be called independently authenticated, and
  SF-03 cannot be closed by me on digital evidence of any kind.
- Safari results are **desktop macOS only**. They say nothing about iPhone, iPad,
  Home Screen, VoiceOver or airplane mode. The physical script remains unrun.

Verdicts: PASS / NEEDS_REVISION / INCOMPLETE.
Statuses: FIX-VERIFIED-ON-CANDIDATE / PARTLY-FIXED-ON-CANDIDATE / OPEN.

Frozen at this point. Findings follow in a separate file.
