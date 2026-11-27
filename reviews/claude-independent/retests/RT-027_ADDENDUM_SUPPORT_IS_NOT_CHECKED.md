# RT-027 Addendum — the structural guard is strong; the support guard does not exist

Reviewer: Claude (independent). Date: 2026-11-27.
Written **after** opening the builder's tooling, tests and evidence for #71, as RT-027 said
it would be. The PASS verdict in RT-027 stands.

## What I opened

`tools/history/draft-check.mjs`, `docs/KARTARPUR_CHAPTER_CRITERIA_20261127.md`,
`evidence/kartarpur-chapter/BUILDER_RESULTS_20261127.md`, and the draft's structured source.

## First, the digest I could not verify is now verified

RT-027 listed the combined `Draft and linked evidence SHA-256` as unverified. Running their
checker on the untouched candidate returns:

```
draftSha256: bd4169a62517d75951d95a1da7be5234fa55bddb9a06a7ea0ccd46df260febe6
status: WITHHELD   humanReview: NOT_PERFORMED
releaseAuthorization: NOT_GRANTED_BY_THIS_TOOL
manuscriptBlocks: 10   claims: 10   sources: 5   unverifiedClaims: 5   admittedChapters: 0
```

**That digest is exactly the one printed in the document's Review binding section.** Verified.
`tools/history/check.mjs` independently reports `RESEARCH_ONLY`, `publicationAuthorized: false`.

## Their frozen criteria overlap mine, and go further in places

They froze scope **before authoring**, and criterion 3 requires that *"Every historical
sentence in the draft must map to one or more claim IDs"* — my C5, arrived at independently.
Criterion 9 forbids any app route, reader, service worker or deployment — my C13. Criterion 8
commits to testing *"missing or stale claim link, changed draft digest, unknown/unsourced
block, forged human authorship, a source field attempting"* to carry body text — failure
modes I had not all listed.

The readable markdown is **generated** from `kartarpur-draft.json` plus `registry.json`, and
without `--write` the checker throws `STALE_DRAFT_REVIEW_COPY` if the committed copy differs.
Same guard pattern as `sw.js`. Good design.

They also disclose their own failure honestly: *"One initial failure was an old placeholder
assertion that the real registry had zero claims."*

## Behavioural tamper tests — four guards confirmed working

I tested the guards rather than trusting the suite. All in a throwaway worktree, nothing
pushed, tree restored clean after each.

| test | injected | result |
|---|---|---|
| T1 | changed one word of the readable draft | **REFUSED** `STALE_DRAFT_REVIEW_COPY` |
| T3 | forged `humanReview` / `approved` fields | **REFUSED** `INVALID_DRAFT_FIELDS` |
| T5 | narrative block with `claimIds: []` | **REFUSED** `UNSOURCED_DRAFT_BLOCK` |
| T7 | block citing a claim id that does not exist | **REFUSED** `UNRESOLVED_DRAFT_CLAIM` |

A single altered word is caught. Forged approval is rejected outright. An unsourced sentence
cannot enter. A dangling claim reference cannot enter. That is a real mechanism, not a
decorative one.

## The finding: nothing checks that a cited claim supports the text citing it

I injected this sentence into the structured draft, with a unique block id, pointed at the
**real, resolving** claim `claim.kartarpur-return-dress`:

> "The Guru rose before dawn and looked out across the fields with quiet satisfaction,
> speaking of the harvest to those who had gathered."

That is an invented eyewitness scene **and** invented speech — the exact pair the standing
constraints forbid. The claim it cites is about the Guru's change of clothes on returning to
Kartarpur. It supports none of it.

**After regenerating the readable copy with `--write`, it passes every structural guard:**

```
status: WITHHELD
draftSha256: 441e5d5984f215932b57fdcf74fd127ae92f3ed1afee7b3e35e93d4806317a50
manuscriptBlocks: 11   claims: 10
```

…and the sentence appears in the readable draft at line 20. The digest chain behaved
**correctly** — it changed because the content changed, and restoring returned it to
`bd4169a6…`. The binding is sound. The binding is simply not a support check.

### Why I nearly missed this, recorded as a method note

My first attempt at this test was refused with `STALE_DRAFT_REVIEW_COPY`. Had I stopped
there I would have concluded the support check works. **It fired for an unrelated reason** —
the readable copy was stale, not the citation bad. A guard that refuses for the wrong reason
looks exactly like coverage it does not have. An earlier attempt was also vacuous
(`INVALID_DRAFT_BLOCK_ID`, because I had duplicated a block id, so the claim path never
ran — the same class as my error 25).

## How to read this, precisely

**This is not a defect in the current draft.** Its ten blocks are genuinely supported: I
verified the claim/source bijection, and independently confirmed all four verse-line citations
against a second provider. Nothing in #71 is fabricated as far as I can establish.

**It is a gap in the mechanism**, and the mechanism is what the project will lean on as
chapters accumulate. The risk is **false assurance**: criterion 3's *"every historical
sentence must map to one or more claim IDs"* reads as *every sentence is supported*, while
mechanically it guarantees only that *every sentence points at something that exists*.

**It is probably not mechanically closable.** Deciding whether a claim supports a sentence is
semantic judgement. That is what qualified human review is for, and the draft asks for it by
name in its first line.

Which leads to the one thing the founder should know, stated without re-opening a decision
that is his: he has ruled that qualified review is **not a release gate**, and I recorded
that ruling and will not re-litigate it. The consequence specific to this surface is that
**the semantic half of this check currently has no owner** — the structural half is
automated and strong, and the half that would catch a plausible fabricated sentence is human
and de-gated. For scripture that gap is covered by digests. For narrative history there is no
digest for "this actually happened."

Not a reason to withhold #71, which invents nothing. A reason to decide who owns that half
before the second chapter, rather than after the tenth.

## Recommendation, which is the builder's to accept or reject

I propose no patch and do not repair builder code. The constraint I record: as long as support
is unverified, the labelling should not imply it is verified. *"Every sentence maps to a
claim"* is the accurate phrasing; *"every sentence is sourced"* is not, and the difference
is exactly where an invented sentence would live.

## Criteria outcome unchanged

14 of 14 hard criteria **PASS**. The gap above is a mechanism finding against the history
registry, not a failure of this candidate. Opened as **HIST-01**.

## Instrument errors

None newly detected. Two vacuous results caught in-flight and reported above rather than
mistaken for coverage. Running total: **34**.
