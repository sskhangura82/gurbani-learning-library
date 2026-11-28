# RT-028 Addendum — builder coverage, and one of their open items is already closed

Reviewer: Claude (independent). Date: 2026-11-27.
Written after opening the builder's tests and evidence for #73, as RT-028 said it would be.
**The PASS verdict stands unchanged.**

## Their tests cover the three things my environment would not let me test

`tests/hukamnama-test-publisher.mjs` carries 14 publisher tests. Several map exactly onto
criteria I could only verify by reading:

| their test | my criterion |
|---|---|
| "official unavailability is retained without signing, substituting or contacting publisher" | **C1** |
| "CLI refuses wrong repository, wrong branch and disabled activation before Git or preparation" | **C5 layer 2** — the one my classifier declined |
| "prepare-only creates a reconstructable commit but never calls network transport" | **C5 layer 3** |
| "wrong effective target and changed or dirty checkout refuse before acquisition" | **C5 layer 4** |
| "an acknowledged build with wrong served bytes cannot count as delivered" | **C2** |
| "lost push acknowledgement is reconciled by exact remote head, never falsely rolled back" | **C3** |
| "lease refusal after observation preserves concurrent work" | **C3** |
| "unknown push outcome retains durable intent and does not request a build or claim delivery" | **C3** |
| "concurrent remote work is preserved and no push or build follows the refusal" | **C3** |

**This does not convert my static reading into a behavioural result of mine.** Their tests are
their evidence. What it does mean is that the gap I declared is covered by someone, and the
coverage is aimed at the right scenarios rather than at the happy path.

## Their open item is closed, and they can stop carrying it

Their results say: *"Hosted Node 22 results are to be recorded separately once the draft PR
runs."* They tested on Node 26 locally.

**The draft PR has run and the hosted result is green.** `hukamnama-foundation-qa.yml`
declares the job `original-source-and-learning-contracts`, which is one of the four checks
that ran on `43b0a37ec310` and **succeeded**. The step the candidate modified is precisely
the one that now invokes `tests/hukamnama-test-publisher.mjs`. That workflow has **no
`branches:` filter**, so it runs on all PRs.

So the publisher test has executed on hosted Node 22 and passed. I briefly suspected the
opposite — that the new test might not have run in CI at all — and checked rather than
asserting it. It ran.

## Worth crediting: a self-found hardening finding, disclosed as such

> "A bounded builder peer check identified that local Git configuration could cause
> tag-following or recursive submodule pushes. The implementation now explicitly disables both
> on the single target push. The regression enables both configurations and confirms the
> actual generated arguments override them while leaving policy hooks enabled. This was a
> pre-review hardening finding, not a reported live incident."

That is the `--no-follow-tags --no-recurse-submodules` I read on the push line. They found a
real way local configuration could widen a push beyond the intended ref, fixed it, wrote a
regression that *enables* the dangerous configuration to prove the override holds, and
labelled it honestly as pre-review hardening rather than dressing it as an incident caught in
the wild.

They also state plainly: *"No real signing key was accessed. No secret or activation variable
was created, no publisher workflow was dispatched and no new-code push to the test site
occurred,"* and separate Preview 5 from this work — *"must not be presented as this publisher
succeeding in production."* Both are the right distinctions, made unprompted.

## Unchanged

RIGHTS-01 stands: activation puts custodian-sourced readings on a public `github.io` URL five
times a day, and the permission question is founder-reserved. Nothing in their evidence
addresses rights, which is correct — it is not theirs to settle either.

The first real delivery after activation remains untestable by anyone until activation, and
they say so. I make no claim about it.
