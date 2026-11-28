# RT-018 addendum — RT18-C18, assessed after findings were committed

Written only after `RT-018_PR58_FINDINGS.md` was committed at
`478fb16b35f2f493f1bdd8ccaf9ff63f866d19f8` and verified on the server, because
C18 is an assessment of builder evidence and could not precede it.

**C18 verdict: PASS, with one limitation I cannot close.**

## What the four runs actually contain

| Run | Status | Checks | Failures |
|---|---|---|---|
| `01-09-19` contracts | PASS | 11 | 0 |
| `01-10-43` browser | FAIL | 8 | **8** |
| `01-11-30` browser | — | — | **no report.json**; `harness-crash.txt` retained |
| `01-12-18` browser | FAIL | 8 | **3** |
| `01-13-31` browser | PASS | 8 | 0 |

Every count matches the builder's written account. Nothing was deleted or
overwritten. The run that produced no report is retained anyway, with the exact
Node `ERR_HTTP_HEADERS_SENT` terminal output preserved verbatim, and its absence
of a report is explained rather than hidden. The eight `failure-N.png`
screenshots correspond to the eight failures of the first run.

## Why the failures are credibly not superseded

The builder froze interaction criteria in
`2026-11-27T010603Z-criteria.md` at **01:06:03**, before the first run at
**01:09**. The eight checks in the clean run map onto those seven criteria, and
criterion 6 — mutants refused "even after their teaching digest is recomputed,
proving the guard rather than the stale-digest gate" — was **expanded** into
three separately named mutant checks, not narrowed. Assertions were not
weakened to fit results.

Each failure is labelled a builder instrument error with its mechanism stated:
a test-server path containment bug rejecting every file with 404; headers written
before an awaited file read; a locator measuring only the clickable button.

## The limitation

The claim "no acceptance assertion or application code changed" between runs is
**not verifiable from this repository.** The candidate is a single commit,
`b68e080`, and all four runs report `base=f720099b6181`. The intermediate harness
states were never committed, so git history cannot confirm what changed between
runs. The pre-run criteria file is what makes the claim credible; the commit
history does not corroborate it. I am recording this as a limitation of the
evidence, not as a finding against the builder.

## Independent convergence worth recording

Two of the builder's instrument errors are the same errors I made, reached
separately:

1. The builder's third run failed three search checks because its locator
   "measured only the clickable result button" while "the result reason is a
   visible sibling within the same result row." This is **my error 17**, made
   independently against the same `row()` wrapper shape. Both of us initially
   read a passing criterion as a failure, and both corrections moved the
   measurement to the enclosing row.
2. The builder made control-page readiness depend on the enabled Search button
   "because same-document routing can leave the current search-status text in
   place." My own harness used the same readiness signal, for the same reason.

The mutants differ, which matters. The builder used a prefixed heading, a source
line in a word label, and a source line in a passage alias. I used a copied line
in `title`, a copied line in `pa`, a scripture heading, and a numbered unit. Four
of mine and three of theirs, overlapping only partly, all refused with digests
re-pinned. That is corroboration from two instruments, not one instrument twice.

Per the founder's standing rule, two systems agreeing does not make the material
authentic. What it supports here is narrower and legitimate: that the refusal
behaviour is a property of the candidate rather than of either harness.
