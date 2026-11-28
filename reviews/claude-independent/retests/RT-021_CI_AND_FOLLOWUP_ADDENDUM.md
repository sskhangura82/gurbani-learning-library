# RT-021 addendum — the three red checks, and the second commit

Written after `RT-021_PR59_FINDINGS.md` was committed at `30c1c73d`.
**The PASS verdict stands.** None of the three failing checks is a regression in
this candidate.

## What was failing, and whose it is

At freeze time I recorded `mergeable_state: unstable` without looking at which
check failed. Three did: `verify-sukhmani-browser`, `verify-nitnem-browser`,
`verify-review-repairs-browser`.

CI could not attribute them. The base `389e79ba` ran only `library-candidate`,
because the workflows are path-filtered — **the three suites never ran on the
parent at all.** So I ran them myself.

| Suite | On the candidate, locally |
|---|---|
| `verify-sukhmani-browser` | **passed 3 / 3** |
| `verify-review-repairs-browser` | **passed 1 / 1** |
| `verify-nitnem-browser` | **failed**, `85 !== 81` |

### The nitnem failure is inherited from PR #56, established four ways

| Measure | Base `389e79ba` | Candidate |
|---|---|---|
| `sw.js` manifest asset count | **85** | **85** |
| test asserts | `assets[0].length,81` | `assets[0].length,81` |
| assets added by the candidate | — | **zero** (empty diff) |

The candidate changed neither the count nor the assertion. The mismatch existed
at the frozen parent and surfaced only because this candidate touched paths that
made the suite run.

**That has a consequence worth stating on its own: PR #56 — the build currently
deployed as Preview 4 — carries a red check that its own CI never exercised,
because path filtering hid it.** Not a scripture or reader defect; a stale test
assertion. But it was invisible, and invisible red checks are how real
regressions get dismissed later.

The builder reached the same place independently: "The old Nitnem browser test
asserted 81 files despite frozen PR #56 already containing 85." Two instruments,
separately, same conclusion.

### On the two that passed locally, my own standard applies

Three passes of `verify-sukhmani-browser` against a defect I measured at roughly
**1 in 60** demonstrates very little, and I wrote exactly that in SK-01. I am
**not** claiming the CI failures are explained. The builder's follow-up
attributes the first reader-workflow failure to an Ubuntu 26.04 package index
returning HTTP 403 before browsers ran, which is environmental and consistent
with suites passing here, but I did not verify that myself.

## The second commit, verified rather than accepted

Head is now `e0a6cff22771d42ce3a2fe91ad96863daae214ed`, and `mergeable_state` is
`clean`. The builder claims it changes only workflows, test instruments and
evidence, with application bytes identical.

- Paths differing outside `.github/workflows/`, `tests/`, `evidence/`, `docs/`: **0**
- Byte-identical by git object hash across both commits: `sukhmani.html`,
  `nitnem/index.html`, `full-japji.html`, `js/sukhmani-reader.js`,
  `js/shared-learning.js`, `js/sukhmani-data.js`, `js/sukhmani-teaching.js`,
  `js/source-integrity.js`, `sw.js`, `tools/refresh-reader-sri.mjs`,
  `tools/build-offline.mjs`, and both Salok pages — **13 of 13 identical**

**So RT-021's findings carry forward to `e0a6cff2` unchanged.** The 36 valid
pins, the blocked-script behaviour, the resume repair and the containment results
were all measured on bytes that did not move.

## I tested their replacement instrument rather than trusting it

The follow-up claims the new nitnem check "rejects omission of source/library
files from the manifest itself." A test that claims to catch omissions and does
not is worse than no test, so I removed `./nitnem/data/jaap.json` from the
manifest and ran it:

    AssertionError: Required source or library asset retained: ./nitnem/data/jaap.json

Exit 1, the asset named. Control run, unmodified: exit 0. **The claim holds.**

## What remains open, in their words and mine

The builder records full-151 reader BFCache verification as **INCOMPLETE** and
keeps the first hosted BFCache assertion as a retained failure rather than
resolving it. They also preserved their own wrong replacement test, which had
omitted the worker's `glp_release=VERSION` cache key. I make **no** BFCache claim
of any kind: I observed no `pageshow.persisted` evidence myself and did not test
for it.

Their note that "local success does not predict or replace" the hosted run is
correct and applies equally to my three local passes.

## Limits

I ran these suites in this workspace's Chromium, not the CI runner, which is the
whole reason the comparison was needed. I did not verify the Ubuntu image change
or the HTTP 403. Nothing here is a physical-device, Safari or qualified-content
claim. The candidate worktrees were restored and verified clean after every run;
the test suites write evidence files, and I checked for and reverted those each
time.
