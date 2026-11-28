# RT-022 addendum — the deferred builder criteria, and what they caught that I missed

Written after `RT-022_PR60_FINDINGS.md` was committed at `1af04b09`. At freeze I
said I would defer their criteria document to protect independence and then
record what it contained. This is that record.

## The failing checks, now examined

| Check | Result |
|---|---|
| `contracts` | success |
| `verify-nitnem-browser` | success |
| `verify-review-repairs-browser` | success |
| `verify-sukhmani-browser` | success |
| `browser` | **failure** |
| `frozen-inputs-and-delivery-contracts` | **failure** |
| `library-candidate` | **failure** |
| `verify-reader` | **failure** |
| `browser-enforcement-and-update-preservation` | **skipped** |

BUILD-01 is the likely cause of the jobs that run the toolchain, since
`npm ci` cannot complete on the committed tree. I say likely because I have not
opened the run logs.

**The skipped job is the part worth flagging.** `browser-enforcement-and-update-preservation`
is the job that would demonstrate their criterion 5, browser enforcement, and
their criterion 8, update-failure preservation. It did not run. So the
candidate's own evidence for its two strongest claims is absent from CI. I
verified enforcement independently and it holds; **update-failure preservation
is demonstrated by neither of us.**

## BUILD-01 fails their own criterion 4

Their frozen criterion 4 reads, in part: "Reproducibility: pinned compiler and
parser versions with lockfile; explicit generation only. Default checks rebuild
without writing and compare bundle bytes… **No timestamp or machine path enters
generated output.**"

I found BUILD-01 against my own criteria, without having read that. It is a
failure of theirs as well, on both halves: the default checks cannot rebuild
anything, and a machine path did enter a committed build artifact.

**One narrowing, in their favour, which I checked after reading it.** The three
bundles themselves are clean — zero machine paths, zero timestamps, zero
references to the generating directory. Their criterion says "generated output",
and for the bundles it holds exactly. The leak is confined to the lockfile. That
makes BUILD-01 smaller than their criterion's wording would suggest, and I have
noted it in the finding.

## What their criteria caught that mine did not

Two substantive gaps, and I am recording them because the point of deferring was
to find out.

**1. Non-root URL path hosting — their criterion 7, absent from my criteria.**
I tested everything served from a server root. The site is actually served under
`/gurbani-learning-library/`. A bundle resolved relative to the wrong base, or a
pin computed against a differently-served file, would have passed every test I
wrote and failed in production.

I tested it after reading their criteria: served under
`/gurbani-learning-library/`, the Knowledge page loads, all three content kinds
render, and there are **no integrity errors**. It passes — but it passes on their
criterion, not mine, and it would have been a real hole.

**2. Update-failure preservation — their criterion 8.** "A deliberately failed
update leaves an independently established prior working shell and synthetic
learning intact. Do not infer preservation merely from a rollback reference."
That sentence is sharper than my RT-021 C24, where I settled for recording the
rollback branch and saying I had not tested it. They explicitly forbid the
inference I nearly leaned on. Still untested by me, and now also unproven in CI
because the job that covers it was skipped.

**3. Minor.** Their criterion 2 requires test-only HTML to be "explicitly
excluded rather than silently ignored." In my enumeration I excluded `tests/`
silently. The result was the same; the discipline was theirs, not mine.

## What my criteria had that theirs did not

For balance, and it is narrow. My C1 required the imported Knowledge unit to be
byte-identical to the reviewed PR #58 bytes **file by file by git object hash**,
and my C3/C4 required re-running the specific RT-018 mutation battery and the
SIG-01 attribution queries against the bundled page. Their criterion 1 covers
byte-identity of frozen inputs and their criterion 6 covers semantic tests
generally; the particular instruction to reproduce a prior independent review's
exact findings through the new artifact is mine, and it is what lets RT-018's
verdict transfer rather than being re-asserted.

## Effect on the verdict

None. RT-022 stands: PASS on the protection claimed, BUILD-01 at medium, C11
untested. The two gaps their criteria exposed are now one tested and passing
(non-root hosting) and one openly untested by anyone (update-failure
preservation), which I would want closed before this lands rather than after.
