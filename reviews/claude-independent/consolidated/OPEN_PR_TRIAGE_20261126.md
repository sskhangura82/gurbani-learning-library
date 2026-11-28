# Open pull-request triage — 47 open, and only four are real unreviewed work

Commissioned by the founder: *"Make sure you review everything."* Before
reviewing 47 pull requests I established which of them are actually live, because
reviewing superseded development branches would consume the founder's time and
hide the real queue.

## The result

| Class | Count | PRs |
|---|---|---|
| **Reviewed, with a verdict from me** | 12 | #40, #45, #47, #48, #49, #51, #52, #53, #54, #55, #56, #57 |
| **Genuinely unreviewed and current** | **4** | **#43, #50, #41, #42** |
| **My own drafts — I may not review these** | 2 | #44, #46 |
| **Historical development chain** | 28 | #4 — #33 |
| My own review branch | 1 | #38 |

## How I established it, including two tests of mine that were wrong

This took three attempts, and the first two would have produced a wrong answer.

**Attempt 1 — ancestry.** `git merge-base --is-ancestor <head> main` said **no** for
all 47, which would have meant nothing had ever landed. Wrong test: `main` is at
`a3476ac`, a **squash** merge of PR #37, and a squash destroys the original commit
identities. This is the same hazard recorded in the Product 0 design notes — the
approved SHA is not the landed SHA under squash.

**Attempt 2 — do the changed files still differ from main?** Everything came back
"LIVE," which is also wrong: a file differing from `main` cannot distinguish *work
absent from main* from *work in main that was later refined*.

**Attempt 3 — do the files each branch added exist in main at all?** This works,
and it revealed the actual structure: `main` is a **curated 229-file product
tree**, while the old branches carry 300–400 files each. What never landed is
development scaffolding — `tools/compositions/` intake scripts, `docs/research/`
packets, extra workflows, evidence. The *product* landed, refined, through #37.

## The 28 historical branches (#4 — #33) — housekeeping, not review work

A single long development chain from 23 October to 27 October, with file counts
growing monotonically as each built on the last. Their product outcome is in
`main`; what remains unlanded in them is intake tooling and research material that
was never intended to ship.

**They are not pending review.** Leaving them open makes the real queue
unreadable — it was why "review everything" looked like 47 items instead of four.
Closing them is a founder or builder act, not mine. I recommend it.

## The four that are real

Verified by ancestry: **none** of these is contained in any PR I have reviewed, so
none is covered by my existing verdicts.

| PR | Files | What it is | Why it matters |
|---|---|---|---|
| **#43** | 9 | `hukamnama/` — `core.mjs`, `reader.mjs`, `index.html`, **`fixture.json`** | **Highest risk.** An implementation of Daily Hukamnama, the one feature the standing rules fence most tightly, and it ships with a fixture |
| **#50** | 26 | `content-intake/kabir/manifest.json` + docs | A **second** Kabir intake path, separate from the one I verified in #52 |
| **#41** | 8 | `explore/` — a new app directory | An unreviewed new reading surface |
| **#42** | 1 | one build-order document | No code |

**#43 is where I am starting.** The standing rule is that an unavailable official
daily selection must **never** be replaced by a random Shabad or an earlier
reading. A reader shipping with a `fixture.json` is exactly the shape in which
that rule gets broken by accident — and note that the much later PR #56
deliberately ships Daily Hukamnama as **unavailable**, saying "the verified daily
selection is not connected to this library yet." So #43 implements what the later
work chose to defer, and the relationship between the two needs stating.

**#50 matters for a different reason.** I verified Kabir's scripture in #52
against Open Granth witnesses. If #50 establishes a *different* intake path for
the same collection, then there are two routes to the same scripture, and the
question is which one is authoritative.

## #44 and #46 — mine, and I may not review them

`draft/claude-audio-provenance-register-20261126` and
`draft/claude-hukamnama-lesson-ang504-20261126` are **my own drafts**, written for
cross-review. The standing rule is explicit: *do not review your own authored work
as independent.* They need ChatGPT's cross-review, and I am recording that rather
than quietly leaving them unverdicted.

Note the overlap worth flagging: my own unreviewed draft #44 is a **Hukamnama
lesson**, and #43 is a **Hukamnama reader**. Those two should be looked at
together by someone who authored neither.

**No approval. No merge. No pull request closed by me.**
