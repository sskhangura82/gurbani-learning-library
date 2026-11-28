# Review register reconciliation — nine PRs, 26 November 2026

Founder order item 4. Settled work is **not** re-verified; I re-opened only where
there was a concrete regression risk, and I say what the risk was in each case.

All nine PRs are **open drafts. Nothing is merged.** Every candidate head I have
reviewed still matches what I froze — verified by commit id, not by PR title.

## 1. The register

| PR | Head | My record | Head still current? | Classification |
|---|---|---|---|---|
| #40 | `1470477b5a27` | RT-001, RT-002 | **yes** | Integrable |
| #47 | `d8202caa1b77` | RT-003 | **yes** | Integrable |
| #48 | `94f004a842eb` | round 3b | **yes** | Integrable; RB-01 was raised against its own new machinery |
| **#49** | `1a4537edeece` | **none** | — | **Never reviewed. Review needed** |
| **#51** | `50ba6e175096` | **none by commit id** | — | **Never reviewed as a candidate. Review needed** |
| #52 | `792afa209c98` | RT-004, RT-009 | **yes** | Integrable — all criteria closed |
| #53 | `83acf3f9e4c6` | RT-008 | **yes** | **Requires repair** (RB-01) |
| #54 | `8917beaab7ac` | RT-006 | **yes** | Integrable |
| #55 | `acfeb0a157fc` | RT-007, RT-010 | **yes** | Integrable — all criteria closed |

## 2. The topology matters more than the individual verdicts

These are not nine independent PRs against `main`. They are two stacks, and I
established the containment by ancestry rather than by reading the base-branch
names.

**Stack A — readers, practice tools, reading sheets**

```
main
 └── #40
      ├── #47                       (side branch, NOT in the chain below)
      └── #51 ─ #52 ─ #54 ─ #55     (strict linear chain)
```

`#55 ⊃ #54 ⊃ #52 ⊃ #51 ⊃ #40`, each strictly containing the last.

**The consequence is the single most important line in this document: #55 cannot
be integrated on its own.** Merging #55 merges #54, #52, #51 and #40 with it. The
integration unit is the whole chain, not a PR.

That is mostly good news — my passes on #52, #54 and #55 were measured on trees
that already contained #40 and #51 beneath them, so that code was exercised
throughout. But it has one sharp edge, in §3.

**Stack B — knowledge pilot**

```
#48
 ├── #49    siblings
 └── #53
```

Merge base of #49 and #53 is exactly #48's head. **Neither contains the other.**

## 3. Two register gaps, both in need of work before integration

### #51 was never reviewed as a candidate, and the whole of Stack A sits on it

30 changed files, no frozen criteria, never examined as a candidate, no verdict by
commit id — and yet it is beneath #52, #54 and #55. Its code has been implicitly
exercised by every test I ran on those three, which is real but is not the same
thing as a review: I never asked what #51 was *supposed* to do, so I cannot say
whether it does it. It is the clearest gap in Stack A, and it is load-bearing.

### #49 and #53 are siblings that merge cleanly — so the combination ships unreviewed

I constructed the merge **locally, for measurement only**. Nothing was pushed, no
ref on origin moved, nothing was approved or merged.

It merges with **no conflict**. That is the dangerous case, not the safe one: a
clean textual merge means no human is ever forced to look at the interaction,
and the two PRs touch the same files — #49 rewrites `knowledge/app.mjs` and
`knowledge/core.mjs`, which is exactly where RB-01 lives.

What I found in the merged tree:

- **#53's guard survives intact.** `validateEditorialTitle` is still called on
  `d.title` and `d.pa` in `passageDescriptions`.
- **#49 genuinely improves the display half of RB-01.** The editorial title is
  labelled, and `editorialPa` now renders behind a Gurmukhi label,
  `ਲਾਇਬ੍ਰੇਰੀ ਦਾ ਵਿਸ਼ਾ:`. On #53's tree alone it rendered bare. That is a real step
  toward closing RB-01 and it was not in the PR I reviewed.
- **RB-01's core gap persists, character-identical.** `if(n.pa){const p=el("p",
  n.pa,"pa");p.lang="pa";section.append(p);}` — line 33 on #53, line 89 in the
  merge, unchanged. Any node's own `pa` still renders bare, in scripture styling,
  with `lang="pa"`, no label and no validation; #53's guard does not cover it.
- #49 moved the search label set from `core.mjs` into `search.mjs`, where it
  still indexes `title, pa, editorialTitle, editorialPa, aliases`.

**A correction to my own suspicion.** I expected `lookupAliases`, which #49 adds
to that label set, to be a new unvalidated external channel widening RB-01. It
is not. It is a static constant the builder wrote in `search.mjs`, with no path
from package data. It does **not** widen the surface, and I am recording that
because I raised it.

One observation from reading it, carried to the architecture review rather than
filed as a defect: `lookupAliases` hardcodes `ਨਾਨਕ` and `ਕਬੀਰ` as *author*
aliases. Both words also occur throughout the text itself as the poetic
signature. Mapping the word to the author node is a reasonable editorial choice,
but it is an editorial choice living in code, and it sits precisely on the
boundary the founder named: a literal word match is not an attribution.

## 4. Classification

**Technically suitable for integration** — #40, #47, #48, #52, #54, #55, subject
to the chain in §2 and to #51 being reviewed first, since it is beneath three of
them.

**Requires repair** — #53 (RB-01 open; the merged state in §3 shows the gap
persisting while the labelling improves).

**Correction, 26 November, after the builder challenged this entry.** An earlier
version of this section listed **RT4-05** under "requires repair," saying no
remedy had been implemented. **That was wrong, and it contradicted my own
verified finding.** `RT-006_PR54_FINDINGS.md` records RT4-05 as
**FIX-VERIFIED-ON-CANDIDATE** on PR #54 `8917bea`, with six criteria all passing:
the plain preservation message, notes and bookmarks and revision and reading
position all surviving, no fixed lower cap, no clearing or probing or invented
quota, no silent partial import, and the per-note limit unchanged.

I conflated two different things: **my** proposed remedy — a fixed lower byte cap
— was not implemented, and should not have been. The builder's remedy was: one
write under the existing lock, a typed `LearningStorageError` with
`LEARNING_STORAGE_FULL`, and preservation wording. That **was** implemented and I
**did** verify it at runtime. RT4-05 is **closed**, not open.

The candidate has not moved, so no retest is needed. The builder caught this, and
they were right to. It is the more consequential kind of error: it downgraded
verified work to "requires repair" in the document the founder is using to decide
integration order.

**Requires review before integration** — #51 and #49, and separately the **#49 +
#53 merged state**, which no current process will prompt anyone to look at.

**Requires the founder or a qualified human, and is not mine to close** —
physical iPhone, iPad, Home Screen and VoiceOver acceptance; qualified Sikh
scholarly and Punjabi review; printed-source collation (CI-S-16), still the only
route to a second textual lineage; the gurbani.org permission letter, drafted and
unsent; audio rights; the Pages deploy source, which I could not read; and the
Sangat mode decision.

## 5. What I deliberately did not redo

The 73 frozen test cases in `COVERAGE_REGISTER.md`, the 3,809-occurrence
scripture register, RT-001 through RT-008, and round 3b. No regression risk was
identified against any of them, and every reviewed head is unchanged.

**No approval. No merge. Nothing pushed but my own review records.**
