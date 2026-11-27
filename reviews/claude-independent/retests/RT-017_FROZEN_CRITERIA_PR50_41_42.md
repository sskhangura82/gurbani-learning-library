# RT-017 — PRs #50, #41, #42: frozen acceptance criteria

The remainder of the real queue from `OPEN_PR_TRIAGE_20261126.md`. Small enough to
review together; criteria frozen before opening any implementation. Read before
freezing: PR shapes and changed file **names** only.

| PR | Head | Files | Base |
|---|---|---|---|
| #50 | `3af5ba7332...` | 26 | `feature/kabir-source-intake-20261126` |
| #41 | `dc66da9f...` | 8 | `feature/learning-explorer-ashtpadi17-20261125` |
| #42 | `16a48464...` | 1 | `plan/daily-hukamnama-authentic-audio-20261125` |

All three verified by ancestry as **not contained in any PR I have reviewed**.

## PR #50 — the question that matters

I verified Salok Bhagat Kabir Ji's scripture in **PR #52** against fourteen pinned
Open Granth Ang files. PR #50 adds `content-intake/kabir/manifest.json` — a
**second** intake artifact for the same collection.

| ID | Criterion | Fails if |
|---|---|---|
| RT17-C1 | #50 and #52 do not disagree about Kabir's text | the same line differs between the two intake paths |
| RT17-C2 | Which intake path is authoritative is unambiguous | both present as canonical with no precedence |
| RT17-C3 | #50 introduces no second source lineage presented as corroboration | a second path is counted as an independent witness when it shares ancestry |
| RT17-C4 | Any discrepancy #50 records is **held**, not reconciled by choosing a side | a difference is silently resolved |
| RT17-C5 | No scripture, teaching or source-lock byte of the verified readers changes | any differs |

## PR #41 — a new reading surface

`explore/` with `app.js`, `index.html`, `lesson-17.json`, `style.css`.

| ID | Criterion | Fails if |
|---|---|---|
| RT17-C6 | Any Gurmukhi it displays is identical to my reference | one character differs |
| RT17-C7 | It verifies its source before rendering, and refuses when verification fails | unverified scripture renders |
| RT17-C8 | Draft and awaiting-review labelling is present | a teaching surface omits it |
| RT17-C9 | It introduces no exposition presented as authoritative | an explanation reads as settled meaning |
| RT17-C10 | It does not claim qualified review or device acceptance | any appears |

## PR #42 — one document

| ID | Criterion | Fails if |
|---|---|---|
| RT17-C11 | It is documentation only, with no executable or data change | it ships code or scripture |
| RT17-C12 | Its claims do not assert rights, approval or authenticity not held | audio rights or approval are implied as obtained |

## Common

| ID | Criterion | Fails if |
|---|---|---|
| RT17-C13 | None of the three can deploy the application | any workflow can publish |
| RT17-C14 | None is reachable from `main` or from a family device today | any is live without review |

## Method limits, stated in advance

- One lineage (RT-005). Chromium only; **nothing here is device acceptance.**
- Synthetic data only.
- **Every harness gets a control case.** Thirteen of my instruments have produced a
  wrong first answer today, two of them in the PR #43 review an hour ago — one of
  which looked like a catastrophic scripture mismatch and was my own sort order.

Verdicts: PASS / NEEDS_REVISION / INCOMPLETE, one per PR.

Frozen at this point.
