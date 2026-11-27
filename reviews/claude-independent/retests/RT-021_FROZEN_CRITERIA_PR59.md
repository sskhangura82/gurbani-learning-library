# RT-021 — frozen acceptance criteria, PR #59

**Candidate:** `b69d6b31941adc025a1159ab0826d39a3fb58bc3`, draft, open, unmerged
**Base:** `feature/unified-library-v1-20261126` at `389e79baff4016a2ff61d1851908de0bd66beb8f` (PR #56, the Preview 4 build)
**Rollback branch:** `rollback/reader-reliability-base-20261126`, verified to sit at that same parent
**`main` at freeze:** `a3476ac4b9be90dde350fb35dd13ce0b672c120d`, unchanged, no merge
**Shape:** 130 files, +32123/−47 — of which **111 are evidence**; the source change is 9 files

## What I read before freezing, declared

PR metadata; the changed-file **name and status list** only; and
`docs/READER_RELIABILITY_HANDOFF_20261126.md`, which the builder designates as
pre-freeze reading and which states intended behaviour and limits rather than
outcomes. I have **not** opened any candidate source, test, or anything under
`evidence/`, and will not until these findings are committed.

I also observed from PR metadata that `mergeable_state` is **`unstable`**. I am
recording that at freeze time and deliberately **not** looking at which check is
failing until after my findings, because that is builder evidence.

## Why this candidate exists

It addresses two of my own findings: the reader-page subset of SRI-01, and the
ordinary Resume/reload/history portion of SK-01. The builder keeps PR #47
separate and does not claim it closes SK-01, which was my do-not-close note.

**Because these are my findings, the risk is that I grade generously.** The
criteria below are therefore written to try to break the fix, and in particular
to catch a fix that passes *my own* published reproduction without repairing the
defect.

## The trap I must not fall into

My SK-01 reproduction dispatches a **script** scroll event. A fix that ignored
synthetic events would make my published test pass while the real defect
survived — and would break scrolling driven by assistive technology, keyboard and
scrollbars. The handoff explicitly claims **"There is no input whitelist for
ongoing saving."** That claim is the single most important thing in this review.

## Criteria — SK-01

| ID | Criterion | Fails if |
|---|---|---|
| RT21-C1 | My published reproduction no longer drifts: seed a place, open, Resume, dispatch one scroll event, stored place unchanged | it still drifts |
| RT21-C2 | **No input whitelist.** After initialization, a place saved by a **script-dispatched** scroll still persists | synthetic scrolls are ignored, which would fake a pass on C1 |
| RT21-C3 | **No input whitelist**, keyboard: a place saved by keyboard scrolling still persists | keyboard scrolling stops saving |
| RT21-C4 | **No input whitelist**, programmatic: `window.scrollTo`/`scrollBy` driven movement still saves | script-driven movement stops saving |
| RT21-C5 | Resume still restores the **correct** stored occurrence, not merely a stable wrong one | it restores a different line but stably |
| RT21-C6 | Reload and a cold history return align the stored occurrence **without rewriting the record** merely to restore it | the record is rewritten on restore |
| RT21-C7 | Explicit reader navigation or genuine manual scrolling during a pending restoration **takes precedence** | restoration overrides a deliberate user action |
| RT21-C8 | Notes, bookmarks, guide position and storage format semantics are unchanged | any shifts |
| RT21-C9 | The fix addresses the alignment-versus-capture-anchor disagreement, not just the guard window | the two still disagree and only the timing is widened |

## Criteria — SRI-01 reader-page subset

| ID | Criterion | Fails if |
|---|---|---|
| RT21-C10 | All claimed classic-script pins are **present** on the three changed pages | any is missing |
| RT21-C11 | Every pin is **valid against real file bytes**, recomputed by me | any mismatch; a wrong pin fails closed and that is a broken page, not a protected one |
| RT21-C12 | The three previously unpinned/partial pages reach full coverage of their classic scripts | partial coverage remains unexplained |
| RT21-C13 | The two already-pinned Salok pages are **unchanged** | they are churned |
| RT21-C14 | An **altered script does not execute** | it executes |
| RT21-C15 | With an entry reader blocked, the page renders **no scripture** and makes **no completed-verification claim** | it renders scripture, or claims verification |
| RT21-C16 | With a reader blocked, **existing browser learning is untouched** | a note or bookmark is lost or rewritten |
| RT21-C17 | Unchanged reader pages still render normally | any regresses |

## Criteria — the new pin-refresh tool, `tools/refresh-reader-sri.mjs`

A tool that regenerates integrity pins is the same class of hazard as the digest
regeneration I tested in RT-018. These are mine, not drawn from the handoff.

| ID | Criterion | Fails if |
|---|---|---|
| RT21-C18 | Default operation **checks only**; writing requires an explicit flag | it writes by default |
| RT21-C19 | It **refuses** unknown, omitted, reordered, inline and module scripts | it silently accepts any |
| RT21-C20 | It **refuses to bless changed frozen source or verifier files** | it re-pins a tampered verifier |
| RT21-C21 | **No workflow invokes it in write mode**, so CI cannot silently re-pin a tampered script | any workflow auto-regenerates pins |

## Criteria — containment

| ID | Criterion | Fails if |
|---|---|---|
| RT21-C22 | No scripture bytes, source digest contract or storage schema changed | any changed |
| RT21-C23 | The service-worker asset manifest is **reproducible** and the cache identity is distinct | not reproducible, or the identity is reused |
| RT21-C24 | The failed-update preservation behaviour remains in force, **or** the limits of what I verified are stated | I assert it without testing |
| RT21-C25 | Nothing in this branch deploys | it can |
| RT21-C26 | PR #58 and PR #47 are untouched by this candidate | either is amended |

## Method limits, stated in advance

Desktop Chromium only, synthetic records only. The handoff itself excludes the
rapid-exit case inside the 200 ms save debounce from its claim, and I will not
report on that case as if it were covered. I will report BFCache only on actual
`pageshow.persisted` evidence. Not Safari, not a physical device, and no
substitute for either.
