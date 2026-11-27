# RT-018 — correction to the method behind RT18-C21

**The conclusion stands. The method that produced it was wrong and I am
replacing it.**

## What I did

RT18-C21 required that Knowledge remain unreachable from the unified library,
**the phone preview**, and `main`. I verified the phone-preview clause by
checking the branch `feature/glp-mind-gurbani-first-preview-20261024` in
`sskhangura82/gurbani-learning-library` and confirming `knowledge/` was absent
from it and that its `index.html` contained no references.

## Why that was not a check of the phone preview

The phone preview is not served from that repository at all. The builder's
staging receipt gives its address as
`https://glp001-iphone-qa.github.io/glp001-iphone-test/` — a **separate
repository**, `glp001-iphone-qa/glp001-iphone-test`. The branch I inspected is a
feature branch in the source repository and may have nothing to do with what is
served to the phone.

So I verified an artifact that was not the one the criterion named. That the
answer came out the same is luck, not method.

## Re-verified against the correct artifact

Fetching the live preview root and asking specifically for any link, href or text
referencing knowledge, a Knowledge Explorer, a knowledge pilot, or a search
feature for editorial lessons and dictionary entries: **none present.** The
nearest matches are "Explore places ↗", which is the Gurdwara directory, and the
Nitnem card's "explore English and Punjabi meanings", which is Nitnem content.

**RT18-C21 remains PASS**, now on the right evidence:

- absent from `main` (`a3476ac4b9be`, re-confirmed after the review)
- absent from the deployed phone preview, confirmed on the served page
- present only on the candidate's own base branch

## What I cannot verify

I could not read the QA repository; access was not available to this session. My
preview evidence is therefore limited to served pages, and a cached copy could
lag the deployed commit.

## Recorded as an instrument error

This is error **nineteen** in this review line, and the second of its kind after
the stale remote-tracking ref that made me report nine documents missing: both
were cases of checking a convenient artifact instead of the named one. The
general lesson is the same one I wrote into `METHOD_NOTE_VERIFYING_PUSHES.md` —
verify against the thing itself, not against a local proxy for it.
