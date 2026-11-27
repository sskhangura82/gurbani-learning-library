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


---

## Correction, same evening — the rate is 1 in 60, not 1 in 16

I published 1-in-16 after sixteen runs. Continuing to push review documents kept
the experiment running on byte-identical application code, and the count is now:

| | |
|---|---|
| Runs of `verify-sukhmani-browser` | **61** |
| Passed | **60** |
| Failed | **1** |
| Non-review files differing between those commits | **0** |

**So the failure rate is roughly 1 in 60, not 1 in 16.** The single failure is
unchanged; the denominator grew.

This cuts two ways and both matter:

- **Harder to reproduce deliberately.** Anyone trying to catch this race will need
  roughly sixty runs per expected failure, not sixteen. A fix attempt that passes
  twenty runs has demonstrated very little.
- **More likely to be dismissed.** A 1-in-60 failure looks far more like
  infrastructure noise than a 1-in-16 one does. The earlier number made the case
  for investigating; this number makes the case for *recording the rate* so that
  when it next appears, nobody has to re-derive whether it matters.

The defect itself is unchanged: a real reader occasionally resumes Sukhmani Sahib
one line past where they stopped, and it is a race in the reload-and-resume path
rather than a fixed off-by-one.

Correcting it here because I published the worse-looking figure, and a rate stated
once tends to get quoted. The measurement was accidental both times — sixty-one
pushes for unrelated reasons — which is worth noting as method: if a flake rate is
wanted deliberately, run the same commit N times and count, rather than inferring
from however many pushes happened to occur.


---

## Second correction, 2026-11-27 — it is deterministically reproducible, and my "not an off-by-one" claim was wrong

Established while reviewing PR #47 (RT-019). Full evidence there; the correction
belongs here because this is the document that will be quoted.

**It reproduces on demand.** Seed a saved place, open the reader, click
"Continue reading", then dispatch a single scroll event. The stored place moves
forward. Four seeded positions, four drifts, with the scroll offset **identical
before and after** — the page does not move at all:

| Seeded | After one scroll event | scrollY |
|---|---|---|
| `a03.p01.l01` | `a03.p01.l03` | 21071 → 21071 |
| `a03.p01.l02` | `a03.p01.l03` | 21137 → 21137 |
| `a05.p02.l04` | `a05.p02.l06` | 40356 → 40356 |
| `a12.p01.l01` | `a12.p01.l03` | 102185 → 102185 |

The second row is this finding's original CI failure exactly. Controls: the click
alone does not move it, and a scroll event alone does not move it. It needs both.

**The mechanism.** `capture()` picks the row whose top is nearest **+28px**.
After the restore, the restored line's top measures **−103px**, so the row
nearest +28px is two rows on. `jump()` clears its `internalScroll` guard after a
single animation frame and never clears the pending scroll timer, so one scroll
event is enough to save that wrong line.

**What I got wrong above.** I wrote that this is a race "which is precisely why
an off-by-one hunt would not have found it." That was my worst steer on this
finding. There is a deterministic off-by-N inside the race — a fixed
disagreement between the restore alignment and the capture anchor — and comparing
those two numbers would have found it. Only the *trigger* is random.

**And the cost estimate I attached was wrong in the expensive direction.** I said
a fix attempt passing twenty runs "has demonstrated very little" and implied
about sixty runs per expected failure. That no longer holds: the defect is now a
deterministic test. Anyone verifying a fix should assert on the controlled
reproduction, not run the suite sixty times.

The defect itself is unchanged, and still matters for the same reason: a person
occasionally resumes Sukhmani Sahib past where they stopped. **It is still open,
and PR #47 does not address it.**
