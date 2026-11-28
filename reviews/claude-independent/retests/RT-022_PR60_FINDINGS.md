# RT-022 — independent findings, PR #60

**Candidate:** `69e24fe4adfccbd535de2b5f8ac0bab5ed720d94`, draft, open, unmerged
**Base:** `e0a6cff2` (PR #59)
**Criteria frozen at:** `c4333e8`, before opening implementation
**Verdict: PASS on the protection it claims, with BUILD-01 opened at medium.**
17 of 18 criteria met; C11 **not genuinely tested** by me, for the reason BUILD-01 records.

## MOD-01 is closed, and the proof is the part worth reading

MOD-01 said entry-point integrity cannot cover a module graph, and that the one
thing to avoid was pinning the entry and calling the page protected. This
candidate took the bundling option: `knowledge/index.html` changes by exactly one
line —

    #58: <script type="module" src="app.mjs">
    #60: <script type="module" src="app.bundle.mjs" integrity="sha384-Z4lwp…" crossorigin="anonymous">

— and the three bundles carry **zero static imports and zero dynamic imports**,
so there is no transitive fetch left for integrity to miss.

**The decisive test.** In RT-018 I defeated the Knowledge guard by neutralising
`validateEditorialText` in the loose `registry.mjs`. Doing exactly that here has
**no effect**: the page loads normally, all three content kinds present, guard
still active. The loose modules are genuinely dead code. No production page loads
`app.mjs`; the modules remain on disk as readable frozen originals, which is what
the handoff said they would be.

## The bundle is faithful — which is what makes RT-018 transfer

A bundle is a regenerated artifact, so the reviewed thing and the shipped thing
are different files. I treated that as the central risk.

**Byte-level:** 10 of the 11 reviewed `knowledge/` paths from PR #58 are
**byte-identical** by git object hash. The only difference is `index.html`, which
must change to load the pinned bundle. `pilot.json` and `scripture.json` are
**additions** relative to #59, not modifications, and identical to the reviewed
bytes. The bundle contains exactly two 64-hex literals and both match: the sha256
of `pilot.json` and of `scripture.json`, with
`need(await sha256(bytes) === SCRIPTURE_SHA256, …)` intact.

**Behavioural**, re-running the RT-018 battery against the **bundled** page, with
the bundle's `PACK_SHA256` and the page's integrity attribute both re-pinned so
transport refusal cannot be what blocks it:

| Variant | Result |
|---|---|
| control | loads, three content kinds |
| guard neutralised in **loose** `registry.mjs` | **loads normally, guard still active** |
| bundle altered, **not** re-pinned | refused, integrity error, no scripture |
| forged scripture heading, fully re-pinned | **refused** — "Knowledge pack could not be verified", no integrity error, so the **semantic** guard |
| copied source line as title, fully re-pinned | **refused**, semantic |
| accepted heading-like `ਸਲੋਕ ਵਿਚਾਰ`, re-pinned | **loads, labelled editorial** |

Every outcome matches RT-018, and transport refusal is cleanly distinguishable
from semantic refusal — the separation the handoff claimed to preserve.

**Attribution**, on the bundled page, identical to RT-018:

| Query | Result |
|---|---|
| `ਨਾਨਕੁ` phrase | Guru Angad passage, origin **source**, occurrence `…salok02.line07` quoted |
| `ਨਾਨਕ` phrase | **0 results** — no inference manufactured |
| `ਨਾਨਕ` auto | two rows, **both editorial** author-lookup, **both without quotation** |
| `ਕਬੀਰ` auto | literal source match with occurrence, plus editorial lookup without quotation |

## Coverage: every production entrypoint, enumerated myself

| | |
|---|---|
| Production HTML pages | **14** |
| Script tags | **51** |
| Pinned | **51** |
| Recomputed valid against real bytes | **51**, zero mismatches |
| Unpinned | **0** |

sha384 ×39, sha256 ×12. For comparison: `main` has 43 tags and 0 pins; #59
covered 36 on reader pages only.

## Containment

- **C10 PASS** — the five reader pages, `tools/refresh-reader-sri.mjs` and
  `js/sukhmani-reader.js` are byte-identical to #59. The reviewed reader repair
  is untouched.
- **C13 PASS** — no scripture, teaching or schema byte modified anywhere.
- **C14 PASS** — cache identity `0.21-library-script-integrity-20261126-1`, all
  three bundles in the manifest, 93 assets, install/activate algorithm **zero
  changed lines**, and the manifest **regenerates byte-identical**.
- **C15 PASS** — the new `.gitignore` ignores `node_modules` only.
- **C16 PASS** — no production HTML references the toolchain.
- **C12 PASS** — all four workflow invocations use an explicit `--check`; no
  write mode anywhere.
- **C17 PASS** — the new workflow is `pull_request` plus `workflow_dispatch` with
  `permissions: contents: read`. `workflow_dispatch` is new relative to the other
  workflows; read-only permissions make it harmless.
- **C18 PASS** — #58, #59 and #47 heads all exactly unchanged.

## C11 — not tested, and why: BUILD-01

The documented install `npm ci --prefix tools/script-integrity --ignore-scripts
--no-audit --no-fund` **fails on the committed tree**. The lockfile's package
keys are absolute paths from the generating machine
(`../../../../../private/tmp/glp001-iphoneqa-20261126/…`), so there is no
project-relative entry for `acorn` or `esbuild` and npm reports both declared
dependencies as missing.

Both documented checks therefore cannot run, and CI invokes them. The check
commands did not write to the tree — but they never executed, so that is not
evidence of anything, and I am recording C11 as untested rather than passed.

Full detail, severity reasoning and remedy in `BUILD-01_LOCKFILE_NOT_PORTABLE.md`.
The consequence for this review: I could not confirm the bundles are what the
toolchain produces, so **the fidelity conclusion above rests on behaviour, not on
a reproducible build.** That is weaker than the candidate deserves once the lock
is regenerated.

## A trade I will not score as a pure gain

Bundling closes MOD-01, and it also **adds a build dependency surface that six
loose reviewed modules did not have**. Two pinned packages installed with
`--ignore-scripts` is a careful setup and the handoff excludes the supply chain
explicitly. I audited neither package and make no claim about them. The honest
summary is that the page moved from an unprotectable graph to a protected
artifact whose provenance now depends on a toolchain — better, not free.

## Method limits

Desktop Chromium only; synthetic mutations in throwaway copies; the candidate
worktree verified clean after every run. I did not run `npm install` to repair
the lock, because mutating dependency state is not mine to do and would not tell
me what the committed tree does. I have **not** opened
`docs/LIBRARY_SCRIPT_INTEGRITY_CRITERIA_20261126.md` or the builder report; see
the freeze document for why, and the addendum that follows for what they
contained. No HTML-authenticity, worker-replacement, hosting, physical-device,
Safari or qualified-content claim. No approval, no merge.
