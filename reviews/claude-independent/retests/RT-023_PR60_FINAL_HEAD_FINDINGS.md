# RT-023 — PR #60 final head: BUILD-01 resolved, and RT-022's fidelity claim upgrades

**Head:** `44401e35690322fb3dbc29c443bff86d73279fcb`
**Criteria frozen at:** `40cbbb7`, before examining the delta
**Verdict: all 9 delta criteria PASS. BUILD-01 is CLOSED.**

## RT-022 carries forward

| | |
|---|---|
| Paths differing outside `tools/`, `tests/`, `evidence/`, `docs/`, `.github/` | **0** |
| Application, bundle, worker and scripture files byte-identical to `69e24fe4` | **12 of 12** |

The three bundles, both entry HTMLs, `sw.js`, `pilot.json`, `scripture.json`,
`registry.mjs`, `source-lock.mjs`, `sukhmani.html` and `nitnem/index.html` all
match. So RT-022's PASS applies to this head unchanged.

## BUILD-01 is closed, tested rather than accepted

| Check | Before (`69e24fe4`) | Now (`44401e35`) |
|---|---|---|
| machine paths in the lockfile | present, `/private/tmp/glp001-iphoneqa-…` | **0** |
| lockfile package keys | absolute traversals out of the project | proper `node_modules/…`, 29 entries |
| `npm ci --prefix tools/script-integrity --ignore-scripts --no-audit --no-fund` | **EUSAGE, refused** | **exit 0**, "added 3 packages in 643ms" |

## The upgrade — this is the part that matters

RT-022 could only establish the bundles' fidelity *behaviourally*, and I wrote
there that "behaves the same in the cases I tried" is weaker than "rebuilds to
the same bytes," and that the candidate was entitled to the stronger claim once
the lock was fixed. It now is, so I ran it:

    node tools/build-app-bundles.mjs --check
    {"status":"PASS","mode":"check","applications":3,"changedFiles":[],"sourceInputs":12}

**`changedFiles: []` across 3 applications and 12 source inputs. The committed
bundles reproduce byte-for-byte from the reviewed modules.** That closes the gap
I named: the shipped generated artifact is provably derived from the six modules
RT-018 reviewed, not merely behaviourally similar to them.

The pin checks also ran, and independently reproduce counts I had derived myself:

    refresh-app-sri.mjs --check    → PASS, pages 14, scriptOccurrences 51, moduleOccurrences 4, changedPages []
    refresh-reader-sri.mjs --check → PASS, pages 5,  scriptOccurrences 36, changedPages []

14 pages and 51 scripts is exactly what I counted by hand in RT-022; 36 is
exactly what I counted in RT-021. Two instruments, same numbers.

**C6, now tested for real:** the checks wrote nothing — 0 tracked modifications
before and after. In RT-022 I could only observe that commands which failed to
start had written nothing, which was no evidence at all.

## Containment

- **C8 PASS** — both workflows `permissions: contents: read`; **zero** files
  anywhere contain `deploy-pages`, `gh-pages` or `pages: write`. All six tool
  invocations use an explicit `--check`, and all three `npm ci` invocations carry
  `--ignore-scripts --no-audit --no-fund`.
- **C9 PASS** — #58 `b68e0800`, #59 `e0a6cff2`, #47 `d8202caa` and `main`
  `a3476ac4` all exactly unchanged. Nothing merged.
- **C7 PASS** — no machine path or timestamp in the lockfile; the bundles were
  already clean at `69e24fe4` and are byte-identical here.

## The skipped job now ran

CI is green on all nine checks, and `browser-enforcement-and-update-preservation`
— **skipped** at the previous head — now **passes**. That is the job covering
their criterion 5, browser enforcement, and criterion 8, update-failure
preservation.

So update-failure preservation moves from "demonstrated by neither of us" to
**"builder-demonstrated, not independently verified."** I did not test it myself
and am not claiming it. But it is no longer unproven by everyone, which is what I
said I wanted closed before this lands.

## Open, unchanged by this delta

RB-02, ANG-01, EXP-01, ART-P01, SIG-01's recall half (open by design), CHAIN-01,
and SRI-01 for the served HTML document itself, the worker, and every page on
`main`. Not closable by review: printed-source collation, physical device
acceptance, audio rights.

## Limits

I installed two third-party packages, `acorn` and `esbuild`, in a throwaway
worktree with the handoff's exact flags. I audited neither and claim nothing
about their contents; a reproducible build establishes that the bundle came from
the declared inputs through the declared toolchain, not that the toolchain is
trustworthy. No HTML-authenticity, worker-replacement, hosting-account,
physical-device, Safari or qualified-content claim. No approval, no merge.
