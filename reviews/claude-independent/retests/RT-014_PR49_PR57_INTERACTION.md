# RT-014 — the PR #49 / PR #57 interaction

The builder asked for an interaction review of PR #49 with the knowledge repair,
noting correctly that *"neither clean merging nor separate branch checks
establish that result."* They were right, and the answer is sharper than either
of us expected.

**Measurement only.** I constructed the merge locally. Nothing was pushed, no ref
on origin moved, nothing was approved, merged or repaired. I did not author a
resolution — that is builder work, and doing it would make me the author of what I
am reviewing.

## The headline: there is no combined state to review, because the two do not merge

| Combination | Merge result |
|---|---|
| #49 + **#53** (what I measured earlier) | **clean** — no conflict |
| #49 + **#57** (the current repair) | **CONFLICT** — 11 regions across 4 files |

| File | Conflict regions |
|---|---|
| `knowledge/app.mjs` | **5** |
| `knowledge/core.mjs` | **2** |
| `knowledge/style.css` | 1 |
| `.github/workflows/knowledge-pilot-qa.yml` | 3 |

The two conflicted files are **exactly the two files RB-01 lives in**. So the
combined behaviour cannot be tested yet: the tree does not exist until somebody
authors a resolution, and **that resolution is a new artifact that needs its own
review.** I am not able to pass or fail a combined state, and I will not simulate
one by inventing a resolution and then reviewing my own work.

This is a better situation than #49 + #53, not a worse one. A clean merge of those
two meant nobody would ever be prompted to look at the interaction. A conflict
forces a human to look. The risk has moved from *silent* to *visible*, which is
where it belongs.

## What a resolution must not lose — and this is the part that matters

Reading the conflict regions changed my view of PR #57. **RT-013 under-reported
it.** I tested the loader guard thoroughly and did not credit how much #57 also
did to the *display* layer. It implements, independently, the thing I recommended
in the architecture review a few hours earlier: making editorial and source
material visibly distinct in results.

On #57's side of the conflict:

- `kindLabel()` gives every node an explicit label — *"Original Gurbani · digital
  source"*, *"Source index"*, *"Comparative study · editorial draft"*,
  *"Dictionary entry · editorial draft"*, *"Lesson · editorial draft"*,
  *"Learning pathway · editorial draft"*, *"Library topic · editorial draft"*.
- `addText()` wraps editorial copy in `.editorial-copy` with
  `aria-label="Editorial explanation draft"`, an on-screen *"Editorial explanation
  · awaiting qualified review"*, and renders the Punjabi as **`.editorial-pa`, not
  `.pa`**.
- `row()` tags each result `result-{kind}` with `data-contentKind`, gives titles
  `scripture-title` / `editorial-title` / `source-index-title`, and applies
  `lang="pa"` **only** to scripture.
- `core.mjs` gains `contentKind()` and an origin-tagged `names()` that carries
  provenance into every search label — *"Editorial title or alias"* versus
  *"Source title or alias"* — and threads `matchOrigin` through scoring.

**That is the rendering half of RB-01 closed, and the search-provenance fix from
the architecture review implemented.** I should have reported it in RT-013 and did
not, because I was looking at `registry.mjs`.

On #49's side of the same regions: `addText()` is the **old bare version**
(`el("p",x.pa,"pa")`), with no editorial wrapper, no label, no `data-contentKind`,
and `core.mjs` drops the `contentKind`/`names()` block entirely because search
moved to `search.mjs`.

## The three ways a resolution goes wrong

1. **Take #49's side of `app.mjs`.** This silently reverts the whole
   editorial/source display separation — back to bare `.pa`, no kind labels, no
   provenance on results. **RB-01's rendering half reopens**, and no test of the
   loader guard would detect it, because the guard in `registry.mjs` is
   unconflicted and would still pass.
2. **Take #49's side of `core.mjs` while keeping #57's `app.mjs`.** `app.mjs`
   imports `contentKind` from `core.mjs`; #49's side does not export it. This
   fails at import time. That is the **safe** failure — loud, immediate, and
   impossible to ship by accident.
3. **"Fix" failure 2 by deleting the `contentKind` usages.** This is the dangerous
   path: it makes the import error go away and quietly lands outcome 1. A resolver
   under time pressure, seeing an import error and removing the offending symbol,
   produces exactly the regression nobody is looking for.

So the resolution must **keep #57's provenance labelling and `contentKind`** while
taking #49's routing and search work, and `search.mjs` must carry the origin
tagging that `core.mjs`'s `names()` currently provides. That is a design decision
for the builder, not a merge.

## RB-02 is weaker than I recorded in RT-013

With #57's `.editorial-pa` replacing `.pa` for editorial nodes, the split-line
residual renders inside an **editorially labelled** element rather than one real
Gurbani uses. That is consistent with what I observed and could not explain in
RT-013: no `.pa` element rendered at all in the mutated view. **RB-02 stays low,
and is lower than I wrote.**

## PR #49 itself is still unreviewed as a candidate

This document is the interaction finding, **not** a review of PR #49. It has no
frozen criteria of its own and no verdict from me. What I can say from the
conflict regions, as scope rather than verdict: it adds hash routing, a selected
line, scroll-position restoration, `resolveIdentity`, and a 121-line `search.mjs`
with modes, Ang matching and first-letter search. That is substantial navigation
and search behaviour which deserves its own frozen criteria.

One thing to carry into that review, from the architecture work: `search.mjs`
holds a static `lookupAliases` map that routes `ਨਾਨਕ` to the author node. It is
builder-authored, not attacker-supplied, so **it is not an RB-01 surface** — I
checked that and said so. But it is a theological judgment living in code, and
#57's origin tagging is what would let a result distinguish *the author* from
*lines containing the word*. The two changes are complementary, which is one more
reason the resolution should preserve both.

## Recommended sequence, offered as a reviewer and not a decision

1. Review **PR #49** on its own, with frozen criteria.
2. The builder authors a resolution of #49 + #57 that preserves #57's provenance
   labelling and `contentKind`.
3. **That resolution gets its own independent review** — it is new code, not a
   merge, and it sits on the surface RB-01 came from.
4. Only then does the knowledge stack become integrable.

Nothing in the knowledge stack should be integrated before step 3.

**No approval. No merge. Nothing authored or repaired by me.**
