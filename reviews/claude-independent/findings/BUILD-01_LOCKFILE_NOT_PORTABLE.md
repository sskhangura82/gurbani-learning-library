# BUILD-01 — the locked toolchain cannot be installed from the committed tree

**Severity: medium.** It does not affect the shipped application. It does block
the candidate's own documented verification path, and almost certainly its CI.
Opened 2026-11-27 during RT-022 on PR #60 `69e24fe4`.

## What fails

The handoff documents the install exactly:

    npm ci --prefix tools/script-integrity --ignore-scripts --no-audit --no-fund

Run verbatim against the committed tree it fails:

    npm error code EUSAGE
    npm error `npm ci` can only install packages when your package.json and
    npm error package-lock.json ... are in sync.
    npm error Missing: acorn@8.19.0 from lock file
    npm error Missing: esbuild@0.28.2 from lock file

`package.json` declares exactly `{"acorn":"8.19.0","esbuild":"0.28.2"}`.

## Why

`tools/script-integrity/package-lock.json` is `lockfileVersion: 3` with 29
`packages` entries, and their keys are **absolute paths from the machine that
generated them**, expressed as upward traversals out of the project:

    ../../../../../private/tmp/glp001-iphoneqa-20261126/library-script-integrity/tools/script-integrity/node_modules/@esbuild/aix-ppc64

There is consequently **no project-relative `node_modules/acorn` or
`node_modules/esbuild` entry**, so npm reports both declared dependencies as
missing and refuses to install. The lock was produced in a temporary directory
outside the repository and is bound to that machine's layout.

## What it blocks

Neither documented check can run, for me or for anyone:

    node tools/build-app-bundles.mjs --check      → ERR_MODULE_NOT_FOUND
    node tools/refresh-app-sri.mjs --check        → ERR_MODULE_NOT_FOUND

Both are invoked by CI — `library-script-integrity-qa.yml` lines 24–25 and
`knowledge-pilot-qa.yml` lines 65–66 — so those jobs should fail at install.
I recorded `mergeable_state: unstable` at freeze time without looking at which
check failed; this is the most likely explanation, and I say "likely" because I
have not yet opened the run.

## Why it matters more here than it usually would

This candidate replaces six independently reviewed modules with a **generated
bundle**. The reviewed thing and the shipped thing are no longer the same file.
A reproducible build is what would let anyone confirm the bundle is derived from
the reviewed modules rather than hand-edited. With the install broken, **that
path is unavailable, and my behavioural tests are the only evidence of
fidelity.**

Those tests are strong — the bundle refuses the same forgeries, accepts the same
heading-like string, and reproduces SIG-01's attribution exactly, all documented
in RT-022 — but "behaves the same in the cases I tried" is weaker than "rebuilds
to the same bytes," and the candidate is entitled to the stronger claim once this
is fixed.

## Remedy

Regenerate the lockfile with the project at its repository path rather than in a
temporary directory, and confirm `npm ci` succeeds from a clean checkout. I am
not prescribing beyond that.

## Minor, noted not escalated

The lockfile discloses the builder's local directory layout
(`/private/tmp/glp001-iphoneqa-20261126/…`). Not a security finding; worth
removing along with the regeneration.

## What this is NOT

- Not a defect in the shipped application. All 51 pins recompute valid, the
  three bundles carry zero static imports, the semantic guard and attribution
  behaviour match RT-018, and no production page loads the toolchain.
- Not a supply-chain judgement. Two pinned dependencies, `acorn` and `esbuild`,
  both exact versions, installed with `--ignore-scripts`. That is a careful
  setup. I did not audit either package and make no claim about them.

## Limits

I did not attempt `npm install` to repair the lock, because mutating dependency
state is not mine to do and would not tell me what the committed tree does. I
therefore could not verify the builder's claim that the committed bundles are
what the toolchain produces; RT-022's fidelity conclusion rests on behaviour.
