# SK-01 — the Sukhmani one-line shift is intermittent, and CI measures it at 1 in 16

Raised from a CI failure on **my own review branch**, which is why I can measure it
cleanly: that branch changes nothing but review documents, so sixteen runs
exercised byte-identical application code.

## What failed

`verify-sukhmani-browser`, job 140226023231, on `8975171a`:

```
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
+ actual   'sukhmani.a01.p01.l03'
- expected 'sukhmani.a01.p01.l02'
  tests/sukhmani-browser.mjs:198
```

Line 198 is the saved-place assertion: after `page.reload()`, waiting for
`#resume-reading` and clicking it, the test asserts `s.read === firstStudyLine.id`.
**The restored reading position came back one line further on than the line that
was saved.**

## Not attributable to this branch, established rather than asserted

```
git diff --name-only origin/main..HEAD → 366 files
   all under reviews/claude-independent/
   outside that path: 0 files
```

Every commit on the branch shows **0** non-review files changed against `main`. No
application code, no test code, no workflow, no data. So the failure cannot come
from anything I wrote.

## The measurement, which is the useful part

| | |
|---|---|
| Runs of `verify-sukhmani-browser` across my commits today | **16** |
| Passed | **15** |
| Failed | **1** |
| Non-review files differing between those commits | **0** |

Sixteen runs of identical code, fifteen green, one red. **The test is
intermittent, not deterministically failing.**

## Why that matters more than the failure

**It re-characterises a known defect.** The founder asked that the Sukhmani
one-line shift be kept on record and noted it also occurred on the published
version. Until now it could be read as a fixed off-by-one. It is not: on identical
code it appears roughly **1 run in 16**. That makes it a **race** in the
reload-and-resume path — something being read before or after it settles — which
is precisely why an off-by-one hunt would not have found it.

**It affects a real reader.** The thing that shifts is a person's saved place in
Sukhmani Sahib. Occasionally, on reopening, they resume one line past where they
stopped.

**And it weakens every green run in this area.** A test that fails 1 in 16 on
correct code trains everyone to discount it. If a genuine regression ever lands in
Sukhmani saved-place handling, the most likely response is "that flaky test
again." An intermittent test is not only a symptom here; it is a hole in the
evidence the project relies on.

## What I am not doing

Not fixing it. I am the independent reviewer, application repair is not mine, and
diagnosing a race properly needs instrumentation in the reader rather than
guesswork from a CI log. Recorded for the builder with the measurement attached,
since the rate is the part that was not previously known.

Also outstanding and unrelated to this: the Sukhmani reader has **no subresource
integrity** on its scripts, same as `nitnem/index.html` — see SRI-01.

**No approval. No merge. No application code touched.**
