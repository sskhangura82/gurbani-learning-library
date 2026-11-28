# RT-019 — frozen acceptance criteria, PR #47

**Candidate:** `d8202caa1b77` on `fix/pr40-sukhmani-passage-visit-20261126`
**Base:** `fix/claude-review-first-repairs-20261125`
**Size:** +464 / −28 across 21 files
**Title:** "R2-X-04: preserve saved Sukhmani reading place during linked visits"

Frozen before opening any of this candidate's implementation, test code or
evidence. I have read only the PR's metadata above, the title, and my own
SK-01 finding.

## Why this review exists, stated before I look

The builder's staging receipt excludes PR #47 from the phone preview, and the
founder update says "the intermittent Sukhmani reading-place issue also needs
repair." Yet #47's title says it preserves the saved Sukhmani reading place.
Either #47 addresses a different defect from SK-01, or it addresses SK-01 and
the receipt understates it.

**The risk I am reviewing for is a naming collision, not a code defect.** SK-01
is a race in the **reload-and-resume** path: after `page.reload()`, clicking
`#resume-reading` restored `sukhmani.a01.p01.l03` where `l02` was saved, roughly
1 run in 60 on byte-identical code. #47's title describes **linked visits**. If
those are two different failure modes, then merging #47 must not be read as
closing SK-01 — and a title containing "preserve saved Sukhmani reading place"
is very likely to be read that way.

## Criteria

| ID | Criterion | Fails if |
|---|---|---|
| RT19-C1 | The head commit is exactly `d8202caa1b77…`, open, unmerged | identity differs |
| RT19-C2 | Scripture bytes and every source digest are unchanged from its base | any scripture or pin moves |
| RT19-C3 | The defect #47 actually repairs is identified **from its code and tests**, not from its title | I restate the title as the finding |
| RT19-C4 | Whether #47 touches the **reload-and-resume** path SK-01 implicates is established by reading that path | inferred from the title either way |
| RT19-C5 | Whether #47's own tests exercise **reload** resume, or only linked visits, is stated | left ambiguous |
| RT19-C6 | Any claim inside #47 that it closes SK-01 is quoted if present, and its absence stated if not | characterised loosely |
| RT19-C7 | If SK-01's mode is untouched, that is recorded as an explicit **do-not-close** note against SK-01 | the collision is left to be discovered at merge |
| RT19-C8 | Any statistical claim I make about whether the race persists states its power | I call it fixed or not fixed from too few runs |
| RT19-C9 | The workflow in this candidate cannot deploy | it can |
| RT19-C10 | A failed update cannot destroy a working previous version, per the founder's standing rule, **or** the limits of what I verified are stated | I claim this without testing it |

## Method limits, stated in advance

SK-01 runs at roughly **1 failure in 60** on identical code. I wrote in SK-01
that "a fix attempt that passes twenty runs has demonstrated very little," and
that constrains me too: I cannot establish that a race is fixed by running a
test a handful of times, and I will not claim it. Any run count I report comes
with its power stated, and absence of failure in a small sample will be reported
as exactly that.

Desktop Chromium only. Not Safari, not a physical phone, and no substitute for
either.
