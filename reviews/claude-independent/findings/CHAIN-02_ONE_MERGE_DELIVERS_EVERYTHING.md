# CHAIN-02 — one merge delivers all reviewed work, and the Knowledge chain must now be closed rather than merged

**This supersedes CHAIN-01's recommendation.** CHAIN-01 said to land the
Knowledge chain as a unit and never #45 alone. That was correct when the chain
was the only route to that work. It no longer is, and following it now would
cause the harm it was written to prevent.

Severity: **medium**, because the wrong action here silently reverts a fix.
Established 2026-11-27 by merge simulation in a throwaway worktree. Nothing was
pushed; `main` is `a3476ac4b9be90dde350fb35dd13ce0b672c120d` and unchanged.

## There are two stacks, not one

**Stack A, Knowledge — 5 links, all reviewed:**

    main → #45 → #48 → #53 → #57 → #58

**Stack B, reader and Daily — 10 links, all reviewed:**

    main → #40 → #51 → #52 → #54 → #55 → #56 → #59 → #60 → #61 → #62

| Link | My review |
|---|---|
| #40 | register reconciliation |
| #51 | RT-012 |
| #52 | RT-009 |
| #54 | RT-006 |
| #55 | RT-010 |
| #56 | RT-011 |
| #59 | RT-021 |
| #60 | RT-022, RT-023 |
| #61 | RT-024 |
| #62 | RT-025 |

**Every link in both stacks has been independently reviewed.**

## Stack B already contains Stack A

PR #60 imported the complete reviewed Knowledge unit rather than merging it.
Checked at the tip, #62:

- **All 86 of #58's paths are present. None is absent.**
- 10 of the 11 `knowledge/` files are **byte-identical** to the reviewed #58.
- The single difference is `knowledge/index.html`, which legitimately changed
  from `<script type="module" src="app.mjs">` to
  `<script type="module" src="app.bundle.mjs" integrity="sha384-Z4lwp…">` — that
  is the MOD-01 fix.
- #58 is **not an ancestor** of #62; the content was imported.

## One merge delivers everything, and it is clean

Simulated from `main`:

| Step | Result |
|---|---|
| merge #62 into `main` | **CLEAN** |
| composite `knowledge/` | 7 modules **plus** the pinned bundle |
| composite `hukamnama/` | 12 entries |
| attribution guard in `registry.mjs` | present |
| **all pins recomputed in the composite** | **15 pages, 52 scripts, 52 valid, 0 mismatched, 0 unpinned** |

So the entire reviewed body of work — ten links of reader and Daily work plus the
imported Knowledge unit — lands in a single clean merge whose end state I have
verified rather than assumed.

## Merging Stack A afterwards would be harmful

With #62 landed, merging #58 **conflicts on five files**:

    .github/workflows/knowledge-pilot-qa.yml
    knowledge/index.html
    tests/knowledge-browser.mjs
    tests/knowledge-editorial-boundary-browser.mjs
    tests/knowledge-integration-browser.mjs

These are **add/add** conflicts: both branches created the files independently,
so there is no common ancestor to merge from and git cannot choose.

**The dangerous one is `knowledge/index.html`.** Resolving it toward #58's side
restores `src="app.mjs"` — the unpinned module entry — and **silently undoes
MOD-01**, reopening the exact gap where I demonstrated in RT-018 that editing
`registry.mjs` loads a forged scripture heading while the page reports "Source
files checked". The page would still look protected.

This is the same failure shape CHAIN-01 warned about, arriving from the opposite
direction: not a chain landed too early, but a superseded chain landed too late.

## Recommended action, for the founder and builder to accept or reject

1. **Merge #62.** One merge, clean, and it carries all ten reviewed links plus
   the Knowledge unit.
2. **Close #45, #48, #53, #57 and #58 as superseded, without merging them.**
   Their reviewed content is already delivered by step 1. Closing them is not
   discarding reviewed work; it is recognising that the work is already included.
3. If any of those five is merged anyway, `knowledge/index.html` **must** resolve
   to the `app.bundle.mjs` side, and the pins must be revalidated afterwards.

I am recommending, not approving. The merge decision is the founder's, and I have
merged nothing.

## Limits

Local simulation only; every worktree destroyed and nothing pushed. A clean merge
is not a passing test suite: I verified the composite's pins and structure, not
its full behaviour as a merged whole. The 930 paths #62 adds relative to `main`
is a large single landing, and the composite has never been exercised by CI as a
merge into `main` — only each link against its own base. Physical-device
acceptance, printed-source collation, audio rights and qualified content remain
open and are untouched by any of this.
