# HIST-01 — The history registry checks that a sentence cites a claim, not that the claim supports it

Reviewer: Claude (independent). Opened: 2026-11-27 from RT-027 (#71).
Status: **OPEN — for the builder.** Severity: S2 as a mechanism gap.
**Not a defect in #71**, which passes 14 of 14 criteria and invents nothing I can find.

## The guards that work

Verified behaviourally against #71's head, in a throwaway worktree:

| injected | result |
|---|---|
| one word changed in the readable draft | **REFUSED** `STALE_DRAFT_REVIEW_COPY` |
| forged `humanReview` / `approved` fields | **REFUSED** `INVALID_DRAFT_FIELDS` |
| narrative block with `claimIds: []` | **REFUSED** `UNSOURCED_DRAFT_BLOCK` |
| block citing a non-existent claim id | **REFUSED** `UNRESOLVED_DRAFT_CLAIM` |

The readable markdown is generated from the structured source and must match it byte for
byte. A sentence cannot enter without citing a claim, and the claim must resolve.

## The gap

Nothing checks that the cited claim **bears on** the text citing it.

Injected into the structured draft with a unique block id, pointed at the real, resolving
`claim.kartarpur-return-dress` (which concerns the Guru's change of clothes on returning):

> "The Guru rose before dawn and looked out across the fields with quiet satisfaction,
> speaking of the harvest to those who had gathered."

An invented eyewitness scene **and** invented speech — the pair the standing constraints
forbid by name. After `draft-check.mjs --write` regenerated the readable copy, it passed
every structural guard: `status: WITHHELD`, a valid new
`draftSha256: 441e5d5984f215932b57fdcf74fd127ae92f3ed1afee7b3e35e93d4806317a50`,
`manuscriptBlocks: 11`, and the sentence rendered into the draft at line 20.

The digest chain behaved correctly throughout — it changed because content changed, and
restoring the source returned it to `bd4169a6…`. The binding is sound; it is not a support
check and does not claim to be.

## Why it matters

The risk is **false assurance**. The builder's own frozen criterion 3 reads *"Every
historical sentence in the draft must map to one or more claim IDs."* That is satisfied by a
sentence that merely **points at** a claim. It reads, to anyone downstream, as *every
sentence is supported*.

For scripture this class of risk is covered: text is digest-pinned against a reference
corpus. **For narrative history there is no digest for "this actually happened."** The
structural layer here is good and the semantic layer is the whole question.

## Probably not mechanically closable, which is the point

Deciding whether a claim supports a sentence is semantic judgement. That is what qualified
human review exists for, and #71's own first line asks for it.

The founder has ruled that qualified review is **not a release gate**. That ruling is his, it
is recorded, and I am not re-litigating it. The consequence specific to this surface:
**the semantic half of this check currently has no owner.** The structural half is automated
and strong; the half that would catch a plausible fabricated sentence is human and de-gated.

## For the builder

I propose no patch and do not repair builder code. Two constraints I record:

1. **Do not let the labelling imply verification that does not happen.** *"Every sentence maps
   to a claim"* is accurate. *"Every sentence is sourced"* is not, and the gap between those
   two phrasings is exactly where an invented sentence would live.
2. **Decide who owns support verification before the second chapter, not after the tenth.**
   A per-claim human sign-off field, distinct from the existing all-or-nothing
   `humanReview: NOT_PERFORMED`, would at least make the unowned half visible.

Related: the registry also has no class for *"attributed but not independently collated"*, so
every Encyclopaedia-sourced claim in #71 is labelled `Unverified attribution` alongside
genuinely unsupported ones. The builder named that limitation themselves.
