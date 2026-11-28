# RT-020 — integration-order review of the Knowledge chain

Criteria frozen at `3b04187` before examining any member for this purpose.
**Verdict: the chain is sound as a unit. The hazard is a partial landing.**

## RT20-C1 — the chain, confirmed from the server

| PR | head | base ref | base sha | state |
|---|---|---|---|---|
| #45 | `8fa9206d9` | **`main`** | `a3476ac4b` | mergeable / clean |
| #48 | `94f004a84` | #45's branch | `8fa9206d9` | mergeable / clean |
| #53 | `83acf3f9e` | #48's branch | `94f004a84` | mergeable / clean |
| #57 | `f720099b6` | #53's branch | `83acf3f9e` | mergeable / clean |
| #58 | `b68e08004` | #57's branch | `f720099b6` | mergeable / clean |

Each base sha equals the previous head sha: a clean linear stack. Only #45 is
based on `main`, and `main` is `protected: false`.

## RT20-C2 — #45's behaviour, tested rather than inferred

#45 contains **no** `validateEditorialText`, **no** `EDITORIAL_TITLE_ATTRIBUTION`
guard and **no** `contentKind` classifier. Its `knowledge/` is five files; there
is no `scripture.json` and no `source-lock.mjs`. The 19 scripture `occurrences`
sit in the same `pilot.json` as the editorial nodes, under a single
`PACK_SHA256`, and its `nodes` array mixes `passage`, `author`, `composition`,
`raag` and `edition` with `concept`, `lesson` and `study`.

That is precisely the data shape #58's loader is written to reject —
`!Object.hasOwn(e,"occurrences")` and a five-type allowlist whose failure message
is "Editorial pack attempts to define scripture or its attribution."

Served and tested directly, with a control:

| Variant | Result |
|---|---|
| #45 unmodified | loads; **0** `data-content-kind` values; **0** kind or editorial labels |
| #45 with `concept.humility.title` set to `ਸਲੋਕੁ ਮਹਲਾ ੯`, digest re-pinned | **loads, and displays the scripture heading as an editorial title**, status still reading "Development pack verified" |

The same forgery is refused by #58. So the editorial-attribution leak RB-01
describes is present in #45 as behaviour, not merely as a missing guard, and
nothing in #45's rendering distinguishes scripture from editorial draft.

## RT20-C3 — how exposed #45 actually is, stated fairly

Three mitigations, which matter as much as the defect:

1. `knowledge/` is **not linked** from #45's `index.html`.
2. #45's `knowledge/index.html` carries a **`noindex` robots directive**.
3. #45 adds files only — **+1349 / −0**.

So a #45-only landing would be reachable by direct URL, unindexed and unlinked.
That is materially narrower than "a defective reader published to the public,"
and I am not going to describe it that way.

## RT20-C4 — no landing order can alter scripture already on `main`

Across the entire chain, `main`→#58 touches exactly one path outside
`knowledge/`, `tests/`, `docs/`, `.github/` and `evidence/`: a **new**
`.gitattributes`. Status **A**, an addition. **Zero existing files are
modified.** No ordering of these five merges can change scripture or reader code
already on `main`.

## RT20-C6 — real merge simulation, nothing pushed

In a throwaway worktree from `main` `a3476ac4`:

- `main` has no `knowledge/`.
- Merging **#45 alone**: clean. `knowledge/` appears with its five files.
- Then #48, #53, #57, #58 in order: **each clean.**
- End state correct: the attribution guard present in `registry.mjs`,
  `kinds.mjs` present, and `occurrences` **no longer** in `pilot.json`.

The worktree was destroyed and nothing was pushed.

## An ordering detail worth naming: the LF pin exists only at the tip

`.gitattributes` — "Canonical source and retrieval files use deterministic LF
bytes", pinning `knowledge/*.json` and `knowledge/*.mjs` to `eol=lf` — is
introduced by **#58 only**; it is absent from #45, #48, #53 and #57.

A partial landing therefore leaves the digest-verified files without byte
determinism across checkout platforms. A CRLF checkout would change their bytes
and `PACK_SHA256` would mismatch. That **fails closed** — the page refuses with
"Knowledge pack could not be verified. Nothing is displayed." So this is an
availability consequence, not an integrity one, and the safeguard is good work.
It is simply one more reason the chain belongs together.

## CHAIN-01 — integration-order hazard

**Severity: low, because of the three mitigations above. Real, because `main` is
unprotected and all five are simultaneously mergeable.**

Every member reports mergeable/clean right now, so nothing in the repository
prevents #45 being merged first and alone. The result would be the
pre-separation, pre-guard pilot sitting in the branch that serves the site,
behind no link and no index, with the rest of the chain still open.

**Suggested remedy, for the builder and founder to accept or reject:** land the
chain as a single unit — one squashed merge, or all five in strict order in one
sitting — and never #45 by itself. A branch-protection rule on `main` is what
makes that order enforceable rather than merely intended; it is already the
outstanding founder act, and this is a concrete scenario for it rather than a
general principle.

## Limits

GitHub Pages configuration could not be read through this session's proxy, so I
cannot restate as current whether `main` is served at the root. If it is, a
landing that includes #45 would serve `/knowledge/`. I verified repository
presence, which is not the same as serving, and I am keeping those separate.
Desktop Chromium only. Synthetic mutations in throwaway copies; no candidate
branch was altered. No approval, no merge, no push to `main`.
