# INT-01 — Every parallel candidate collides in the same four files

Reviewer: Claude (independent). Opened: 2026-11-27. Status: **OPEN — for the builder.**
Severity: S3, process/integration. Not a scripture defect. Not a reader defect.

## What this is, and what it is not

This is an **integration and mergeability assessment** of the eleven new candidates
(#64–#74), prompted by the builder's own note that *"the combined version then needs its own
check, particularly where Farid and Explore share offline-delivery files."*

**It is not a review of any candidate's content.** Those reviews are still outstanding and
will carry their own frozen criteria. Nothing here says any candidate passes.

## Topology, measured

`main` is unchanged at `a3476ac4b9be`, still `protected: false`. All eleven new candidates
stack on #62's branch (`7f36c30`), forming **five parallel lines**:

| line | chain |
|---|---|
| Daily | #62 → #64 → #69 → **#73** |
| Farid | #62 → #65 → **#72** |
| Explore | #62 → #65 → #70 → **#74** |
| Haumai | #62 → **#66** |
| QA visibility | #62 → **#67** |
| History | #62 → #68 → **#71** |

Verified by `git merge-base --is-ancestor`, not inferred from PR metadata. Every declared PR
base **is** a true ancestor of its head, and GitHub's `changed_files` matches the three-dot
delta exactly for #70 (14), #74 (87) and #71 (13). There is no base mislabelling.

## The finding: a sequential merge into `main` converges on four files, twice

Trial merge into `main`, in a throwaway worktree, never pushed:

| step | result |
|---|---|
| composite #62 | **clean** |
| daily #73 | **clean** |
| farid #72 | **clean** |
| haumai #66 | **CONFLICT** — 4 files |
| qa-visibility #67 | clean |
| history #71 | clean |
| explore #74 | **CONFLICT** — the same 4 files |

Both conflict points are the **same four files**:

- `sw.js` — generated offline manifest
- `tools/build-offline.mjs` — the generator
- `tests/library-script-integrity.mjs`
- `tests/library-script-integrity-inputs.mjs`

### Why this is systemic rather than a one-off

`tools/build-offline.mjs` hardcodes the candidate's release label **inside the generator**:

```
.replace(/const VERSION="[^"]+";/,'const VERSION="0.24-farid-source-only-20261127-1";')
.replace(/const VERSION="[^"]+";/,'const VERSION="0.24-explore-complete-passages-20261127-1";')
```

Both candidates edit **the same line**, so any two candidates conflict there **by
construction**. With five parallel lines that is a predictable, repeating merge chore, not
an accident of these two. The `additions.push(...)` lines, by contrast, union automatically —
git merged Farid's line 14 and Explore's line 20 with no conflict.

The two integrity harnesses collide for the same structural reason: each candidate registers
its own entries in a shared list and its own scope function in a shared harness.

| file | Farid side adds | Haumai side adds |
|---|---|---|
| `library-script-integrity.mjs` | `salok-farid/index.html` | `knowledge/journey.mjs`, `knowledge/learning.mjs`, `knowledge/json.mjs` |
| `library-script-integrity-inputs.mjs` | `faridReaderScope` | `journeyScope` |

Fifteen list entries are common to both sides; both retain `navigationScope`. So the
conflicts are **additive in character** — neither side contradicts the other.

## The generator resolution is verified. The harness resolution is not.

**Verified working.** Resolve `tools/build-offline.mjs` by keeping both `additions.push`
lines and choosing one VERSION label, then **re-run `node tools/build-offline.mjs`**. On the
Farid/Explore pair this produced a manifest of **107 entries containing 4 of 4 Farid files
and 6 of 6 Explore files, nothing missing**. `sw.js` must be **regenerated, never
hand-merged**.

**Not verified, and I will not claim it.** My automated union of
`library-script-integrity-inputs.mjs` produced **invalid JavaScript** — `node --check` fails
with two unbalanced braces, while each candidate's own copy parses fine. Both sides' content
is additive, but joining two function bodies and their call sites is **not safely
automatable** and needs hand authoring. That resolution is the builder's to write; I do not
repair builder code and am proposing no patch.

## The hazard, and the guard that already catches it

If `sw.js` were hand-resolved toward either side, the other candidate's files would drop out
of `EXPECTED` — #72's manifest lacks Explore's six files and #74's lacks Farid's four. That
would be an incomplete offline package.

**That hazard is already caught.** Multiple workflows run the generator and then assert the
committed artifact matches:

```
node tools/build-offline.mjs
git diff --exit-code -- sw.js
```

present in `library-script-integrity-qa.yml`, `hukamnama-foundation-qa.yml`,
`explore-complete-passages-qa.yml`, `article-source-print-qa.yml`,
`salok-farid-reader-qa.yml`, `unified-library-qa.yml`, `learning-practice-qa.yml`,
`salok-kabir-qa.yml`, `salok-mahalla9-qa.yml`. `tests/build-sw.mjs` additionally refuses a
reused release version.

I had hypothesised that CI regenerating `sw.js` before testing would **mask** a bad committed
manifest. **The evidence refutes that** — the `git diff --exit-code` guard is exactly the
right guard, and several of the workflows carrying it have no branch filter, so it fires on
any PR. Severity is accordingly S3, a guarded merge chore, not a silent-corruption risk.

## Related, and separately good news on CI-02

The newer workflows — `explore-complete-passages-qa.yml`, `farid-source-intake-qa.yml`,
`hukamnama-foundation-qa.yml`, `knowledge-pilot-qa.yml`, `library-script-integrity-qa.yml`,
`sggs-original-search-research-qa.yml` — carry **no `branches:` filter**, so they run on all
PRs. That is the right direction on **CI-02** and the builder deserves the credit.

The older ones are still filtered (`article-source-print-qa.yml`, `learning-practice-qa.yml`,
`reader-qa.yml`, `salok-kabir-qa.yml`, `salok-mahalla9-qa.yml`, `unified-library-qa.yml`), so
CI-02 stays open, and **`main` carries exactly one workflow** (`reader-qa.yml`) while the
newest candidate carries thirteen. Twelve of thirteen QA workflows exist only on unmerged
branches.

### #67 is the builder answering CI-02 directly

**#67 runs 16 checks and shows `browser-and-print` failing.** Every other new candidate runs
only 4–7. So the report that *"the applicable automated checks for all four new candidates
completed successfully"* is **literally true and materially narrower than it sounds**: a
4-to-7-check subset passed, and the pre-existing ART-P01 failure is visible on #67 alone.
That is not concealment — #67 exists precisely to surface it — but the aggregate phrasing
overstates coverage.

## Consequence for the founder's pending merge decision

When I reported this morning, one clean merge delivered everything. That is **no longer
true**. The object has grown by eleven candidates across five lines, and merging the current
stack requires two hand resolutions in the same four files, one of which I have shown is not
safely automatable.

`#63`'s composite validation covered the stack **up to #62 only**. There is no composite
validation of the current stack against `main`. Whether to merge the #62 composite now and
take the newer lines separately, or wait for a fresh composite, is a **sequencing decision
for the builder to propose and the founder to make.** Not mine.

## My instrument errors in this assessment

- **33.** I asserted a PR base/ancestry discrepancy for #70 from a misread of my own first
  listing — I had read #71's base onto #70's row. Re-reading the API directly showed every
  declared base is a true ancestor. Caught before publishing.
- **34.** I reported `haumai#66 merged with union resolutions` on the strength of **zero
  conflict markers**, when the resulting file does not parse. No markers is not valid code.
  Caught only because I then ran the tests. The correct instrument is `node --check`, and
  the downstream merge results (qa-visibility clean, history clean, explore conflicting) were
  computed on a tree containing that broken file — they remain valid as **git-level conflict
  topology**, which does not depend on the JavaScript parsing, but nothing more.

Running total: **34**.
