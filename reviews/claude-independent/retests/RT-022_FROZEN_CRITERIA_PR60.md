# RT-022 — frozen acceptance criteria, PR #60

**Candidate:** `69e24fe4adfccbd535de2b5f8ac0bab5ed720d94`, draft, open, unmerged
**Base:** `fix/reader-load-resume-20261126` at `e0a6cff22771d42ce3a2fe91ad96863daae214ed` (PR #59)
**Builder pre-implementation freeze:** `bf744d1ac5b845d63c3324ed1f231c3fec31e40e`, 02:53:50Z
**`main` at freeze:** `a3476ac4b9be90dde350fb35dd13ce0b672c120d`, unchanged
**Shape:** 197 files, +13779/−50; 134 are evidence
**Observed at freeze:** `mergeable_state: unstable`. Recorded; I am not looking at which check fails until my findings are committed.

## Declared exposure, and a deliberate departure

**This candidate answers MOD-01, which is my own finding, raised 25 minutes
before it appeared.** Their pre-implementation freeze at 02:53:50Z postdates my
MOD-01 push at `08966abd`, so their criteria may derive from mine. That makes the
usual ordering insufficient: if I read their criteria first, this review becomes
"did they do what I suggested" rather than "is the page protected."

So I am **deliberately not reading `docs/LIBRARY_SCRIPT_INTEGRITY_CRITERIA_20261126.md`
until after my findings are committed**, even though the builder names it as a
starting point. I have read only the PR metadata, the changed-file name list, and
`LIBRARY_SCRIPT_INTEGRITY_HANDOFF_20261126.md`. I will record what their criteria
contain afterwards, and whether they cover anything I missed.

MOD-01 listed four options and said the one to avoid is pinning only the entry
point and calling the page protected. The file list shows `knowledge/app.bundle.mjs`
and `articles/app.bundle.mjs`, and the handoff says "Three same-directory ESM
bundles replace executable transitive imports. Original modules remain readable
and frozen." That is MOD-01's first option. **My criteria are therefore aimed at
the failure modes bundling introduces, which MOD-01 did not analyse.**

## The new risk this candidate creates

A bundle is a **regenerated artifact**. RT-018 passed the Knowledge unit as six
modules. What would now ship is a seventh file built from them by a private
toolchain. **My RT-018 verdict does not transfer to a bundle unless the bundle is
shown to behave as the reviewed modules did.** A faithful bundle inherits the
verdict; a divergent one silently discards an independent review.

## Criteria — the bundle's fidelity, which is the heart of this review

| ID | Criterion | Fails if |
|---|---|---|
| RT22-C1 | The imported Knowledge unit is **byte-identical** to the reviewed PR #58 bytes, file by file | any differs; RT-018 would not transfer |
| RT22-C2 | The bundle has **zero static imports**, so entry-point integrity actually covers the graph | it imports anything; MOD-01's gap persists |
| RT22-C3 | The RT-018 mutation battery, re-run against the **bundled** page, still refuses every forgery it refused before | any previously refused forgery now loads |
| RT22-C4 | SIG-01's closed half still holds on the bundled page: `ਨਾਨਕੁ` returns the Guru Angad passage with **source** provenance; `ਨਾਨਕ` returns editorial-lookup rows with no quotation | attribution regresses through bundling |
| RT22-C5 | Tampering a **loose** module (`registry.mjs`) has **no effect**, because the bundle is what executes | the loose graph is still live, i.e. MOD-01 unfixed |
| RT22-C6 | Tampering the **bundle** is refused by integrity, and the page renders no scripture and claims no verification | it executes, or it claims verification |
| RT22-C7 | The loose modules are not reachable as an **alternative execution path** from any production entrypoint | any entrypoint still executes them |

## Criteria — coverage and pins

| ID | Criterion | Fails if |
|---|---|---|
| RT22-C8 | Every production HTML entrypoint's scripts are pinned, and I enumerate them myself rather than trusting an inventory | any production entrypoint has an unpinned script |
| RT22-C9 | Every pin **recomputed valid** against real bytes | any mismatch; a wrong pin fails closed |
| RT22-C10 | The five reader pages and the reader pin tool from #59 are **unchanged** | they are churned |
| RT22-C11 | Check commands do not write; refreshing requires an explicit flag | any check mutates the tree |
| RT22-C12 | No workflow invokes a refresh in write mode | CI can silently re-pin |

## Criteria — containment

| ID | Criterion | Fails if |
|---|---|---|
| RT22-C13 | No scripture, teaching, source contract or learning schema byte changed | any changed |
| RT22-C14 | The service-worker manifest is reproducible and includes the bundles; its install/activate algorithm is unchanged | not reproducible, or the algorithm moved |
| RT22-C15 | The new `.gitignore` does not exclude anything a reviewer needs | it hides reviewable material |
| RT22-C16 | The build toolchain is **not loaded by the site** | any production page references it |
| RT22-C17 | Nothing deploys | it can |
| RT22-C18 | PR #58, #59 and #47 heads are untouched | any moved |

## Method limits, stated in advance

Desktop Chromium only, synthetic records only. The handoff excludes HTML
authenticity, a replacement worker, hosting accounts, the build dependency supply
chain and arbitrary hostile JavaScript; I make no claim on any of those, and I
note that a bundle produced by a toolchain **adds** a supply-chain surface that
loose reviewed modules did not have. That is a real trade and I will say so
rather than score it as a pure gain. Not Safari, not a physical device.
