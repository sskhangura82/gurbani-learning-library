# RT-020 — frozen criteria: integration-order review of the Knowledge chain

Frozen before examining any chain member's contents for this purpose.

## The chain, established from PR metadata

    main
     └── #45  feature/knowledge-library-foundation-20261125   (base: main)
          └── #48  fix/knowledge-source-identity-20261126
               └── #53  (RB-01 editorial attribution repair)
                    └── #57  fix/knowledge-editorial-boundary-20261126
                         └── #58  (candidate reviewed in RT-018)

Only **#45** is based on `main`. `main` is `protected: false`.

## Why this review exists

RT-018 reviewed the chain's tip. Nobody has reviewed what reaches `main`
**depending on how the chain lands**. Five stacked drafts whose base branch is
another draft can be merged in orders that are individually plausible and jointly
wrong. The founder's standing instruction covers this directly: do not silently
replace scripture or merge major changes into the public application.

## Criteria

| ID | Criterion | Fails if |
|---|---|---|
| RT20-C1 | The chain's shape and each member's base are confirmed from the server, not inferred | asserted from branch names |
| RT20-C2 | Whether #45 alone, merged to `main`, would carry the RB-01 defect that #53 repaired is **established by testing #45's own code**, not assumed from its age | inferred from commit order |
| RT20-C3 | Whether #45 makes the Knowledge pilot **publicly reachable** from the served site is established | left to assumption |
| RT20-C4 | Scripture bytes on `main` are unaffected by any landing order, or the exposure is named | not checked |
| RT20-C5 | Whether the GitHub Pages root would serve Knowledge after each candidate landing order is stated | conflated with repository presence |
| RT20-C6 | Any claim about what "merging #45 alone" does is tested against a real merge simulation, not reasoned | reasoned only |
| RT20-C7 | Nothing in this review merges, approves, pushes to `main`, or alters a candidate | any occurs |

## Method limits, stated in advance

I will simulate merges locally in a throwaway worktree and never push any of
them. Pages configuration could not be read through this session's proxy
earlier; where that matters I will say so rather than restate an earlier reading
as current. Desktop Chromium only.
