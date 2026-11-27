# CI-02 — Workflow branch filtering hides real red checks from candidate PRs

Reviewer: Claude (independent). Opened: 2026-11-27. Status: **OPEN — for the builder.**
Severity: process / evidence integrity. Not a scripture or reader defect.

## The defect

Workflows scoped with `on: pull_request: branches: [...]` do not run on candidate PRs
whose base is not in that list. A check that is **failing** therefore shows as absent
rather than red, and a reviewer reading the checks on that PR sees nothing wrong.

Automated tests passing is already not sufficient to merge (standing constraint).
This is the weaker and more deceptive case: tests that are **not running** and so cannot
report what they would have found.

## Instances observed, twice

**Instance 1 — RT-021 (the 85-vs-81 case).** Attributed there. Recorded for the pattern.

**Instance 2 — RT-026, `browser-and-print`.** Owned by
`.github/workflows/article-source-print-qa.yml`, which triggers on
`branches: [main, feature/learning-reliability-practice-20261126]`.

| PR | `browser-and-print` |
|----|---------------------|
| #55 (`acfeb0a157fc...`) | **failure** |
| #56 | DID NOT RUN |
| #59 | DID NOT RUN |
| #60 | DID NOT RUN |
| #61 | DID NOT RUN |
| #62 / #63 composite (`7f36c303...`) | failure |

Failing since #55. Invisible for four consecutive candidates. Surfaced only because the
builder ran the composite against `main` in validation-only #63.

## Why it matters here specifically

`main` **is** in the trigger list. So the filtering does not prevent the failure from
landing — it only delays when anyone sees it, until after a merge to `main`. The
concealment window closes at exactly the moment the cost of discovery is highest.

In this instance the red check is, on the one document I verified, an instrument
limitation rather than a content defect (RT-026). That is luck, not a mitigation. The same
filtering would equally have hidden a genuine scripture or rendering defect for four
candidates.

## What I am not claiming

- Not that the filtering was added to hide anything. It reads as ordinary scoping.
- Not that every filtered check is failing. I attributed one, and RT-021's earlier one.
  I have not swept all workflows against all candidates.
- Not that this is the builder's error rather than a repository-configuration gap.

## For the builder

A reviewer cannot distinguish "did not run" from "has nothing to say" without going and
asking each workflow, per candidate, by hand. I did that twice because I had reason to
suspect it; there is no guarantee I would a third time.

Worth considering: whether checks that gate `main` should run on every candidate intended
to reach `main`, so the signal arrives while the candidate is still a candidate. That is a
repository-configuration decision and is **not mine to make** — I do not modify builder
code or CI.

## Founder-reserved, recorded not acted on

The branch-protection rule on `main` remains outstanding and is his act, not mine.
This finding is a reason that rule matters more, not a substitute for it.
