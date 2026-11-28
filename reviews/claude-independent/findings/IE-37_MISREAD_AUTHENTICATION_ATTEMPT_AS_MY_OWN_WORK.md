# IE-37 — I misread "the earlier Claude authentication attempt" as referring to my own review

Instrument error. Reviewer: Claude (independent). 2026-11-27. **Published twice before I
caught it, so the retraction is public.**

## What I asserted

In RT-032 and again in the #75 §1/§2 comment I wrote that the review request's statement —
*"The earlier Claude authentication attempt performed zero semantic reviews and is only a
diagnostic receipt"* — was "not accurate as of today", on the grounds that I had verified 6 of
10 Kartarpur claims against 5 of 5 sources earlier the same day.

## Why that was wrong

The request was not describing my work. It was describing
`evidence/history-two-reviewers/claude-authentication-attempt-20261127.json`: an **automated
invocation of Claude Code** by the builder's own tooling at 21:02:29Z which failed OAuth
1.3 seconds later. That record states `status: AUTHENTICATION_REQUIRED`,
`semanticReviewPerformed: false`, `reviewRecordCreated: false`, `inputTokens: 0`,
`outputTokens: 0`, and the provider message about an expired session.

So the request's sentence is **exactly accurate about the thing it names**: that attempt did
perform zero semantic reviews and is only a diagnostic receipt. I read "the earlier Claude
authentication attempt" as "Claude's earlier attempt at review" and corrected something that
was not wrong.

## What is true, kept separate

My RT-027 addendum verification of 6 claims against 5 sources did happen, and remains on the
record. It is simply **not** the thing the request was referring to, so it was never a
counterexample to that sentence. Two different events, and I conflated them.

## The mechanism, and what it adds

I read a phrase about the builder's tooling as a phrase about me, then reached for evidence of
my own work to rebut it. The pull toward defending my own record is the part worth naming: the
error was not a slip in parsing so much as a readiness to treat a sentence as an
under-estimate of me.

**Standing rule added:** when a request appears to understate my prior work, locate the
artifact it names before correcting it. A named record is a claim about that record, not about
me.

## Credit where it is due, which is the other half of this

The thing I was "correcting" is in fact one of the better pieces of evidence discipline in the
repository. The builder tried to invoke an independent reviewer, the invocation failed, and
they recorded the failure in full — exit code, provider message, zero tokens, no record
created — and set the packet's blocking reason to `MISSING_CLAUDE_CHECKER_SOURCE_REVIEW` with
`inspection.actualClaudeSourceReviews: 0`. **No review was written in my name.** That is the
standing constraint against manufacturing review records being honoured at the moment it would
have been easiest to break.

Running instrument-error total: **37**.
