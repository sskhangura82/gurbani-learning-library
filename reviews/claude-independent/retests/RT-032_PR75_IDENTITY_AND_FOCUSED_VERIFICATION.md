# RT-032 — #75: identity verification and focused verification results

Reviewer: Claude (independent). Date: 2026-11-27.
Review request: `docs/CLAUDE_REVIEW_NEXT_20261127.md`, pasted by the founder.
**Findings first, as the request asks. This is Part 1 of 2; the deep review of Task A
sections 1–4 and all of Task B are not yet done and nothing here is a verdict.**

## 1. Identity — the request's first requirement, answered

> "Confirm the available Git object and report its SHA; do not assume the mutable PR head is
> this target."

| | |
|---|---|
| stated target | `c3a4cc027b48c246027b545d9120dfb72d7ebe6f` — **exists**, committed 2026-11-27T22:30:49Z, *"Preserve newer saved-place actions during an in-flight resume"* |
| stated baseline | `320537b0cc4aceb2e6007b32057a3c4a36c83520` — **exists**, committed 2026-11-27T21:16:14Z |
| **actual PR #75 head** | **`68f47ffba4782271651716c71a97bc1825f96f48` — DIFFERENT, 12 commits ahead** |
| `main` | `a3476ac4b9be90dde350fb35dd13ce0b672c120d`, unchanged |

The request anticipated this: *"If subsequent browser fixes change runtime, the builder must
update this target and identify the new evidence before an exact-head verdict."*

### The runtime did not change, so that condition does not bite

I checked rather than assumed. Diffing target against current head, restricted to paths
outside `tests/`, `docs/` and `evidence/`:

**Differing runtime paths: zero.** Tree hashes of every served artifact are identical:

| path | tree/blob at both SHAs |
|---|---|
| `collections` | `6dd54f2c8aec` IDENTICAL |
| `private-library` | `b6aa19f0d0f7` IDENTICAL |
| `library` | `31bc18dbd41b` IDENTICAL |
| `index.html` | `be8949f9bee2` IDENTICAL |
| `sw.js` | `d228559d7a49` IDENTICAL |
| `tools` | `0ecbdb17550e` IDENTICAL |

So **an exact-head verdict on application runtime is available** — a better position than the
request assumed. The 12-commit delta is docs, evidence, and **three test files**:
`tests/library-script-integrity-offline.mjs` (+3/-1), `tests/service-worker.mjs` (+3/-1),
`tests/source-reader-browser.mjs` (+58/-6).

**Consequence, stated precisely:** my test results below are from the **target's** test
versions. Because `tests/source-reader-browser.mjs` changed by +58/-6 after the target, a
test-suite result at the target is **not** automatically a test-suite result at the head.
Runtime verdict transfers; test-run results do not.

## 2. Focused verification — all six requested commands run

Disposable checkout at the target, clean tree confirmed before starting. Inspected file
hashes recorded:

| file | sha256 (first 16) |
|---|---|
| `collections/source-reader/core.mjs` | `97a2ec588071d317` |
| `collections/source-reader/reader.mjs` | `fddc5f2cd6a564a7` |
| `collections/source-reader/source-lock.mjs` | `5313e5b2103e5cc9` |
| `collections/source-reader/reader.bundle.mjs` | `cfabe33b6c174b44` |
| `private-library/app.mjs` | `1f553882551e6b6c` |
| `tools/private-library/seal.mjs` | `f900037d558a172e` |
| `tools/build-shabados-original-collections.py` | `fbb50cb95586fe3a` |
| `collections/source-data/sggs/manifest.json` | `04da157b5e7ba85c` |
| `collections/source-data/dasam/manifest.json` | `2ba6005655429eeb` |

| command | result |
|---|---|
| `python3 tests/shabados-original-importer.py` | **OK — 11 tests, 0 failures** |
| `node tests/sikh-source-reader-core.mjs` | **exit 0** |
| `node tests/private-library-contract.mjs` | **24 checks passed** |
| `node --test …integrity-inputs …integrity …library-catalog` | **28 tests, 28 pass, 0 fail** |
| `node tests/source-reader-browser.mjs` | **PASS — 31 checks, 0 failures** |
| `node tests/private-library-browser.mjs` | **18 checks passed** |

Browser runs used the fixtures' own documented overrides — `GLP_PLAYWRIGHT_MODULE`,
`GLP_CHROMIUM_EXECUTABLE`, `GLP_SOURCE_READER_OUTPUT` — so nothing was patched to make them
run.

### The checkout-mutation warning, tested

> "inspect the diff afterwards: some existing fixtures regenerate integrity pins. A changed
> checkout is not evidence that the starting runtime passed unchanged."

- The **integrity batch left zero tracked files changed.** That pass is on the starting
  runtime, not a regenerated one.
- The **private-library browser fixture does regenerate evidence in place** — it rewrote
  4 committed files (`results.json` and three screenshots). I restored the checkout to the
  exact target afterwards and re-confirmed zero changes. A reviewer running that command must
  diff and restore; the request was right to warn.

### Independent reproduction corroborates their browser evidence

My `private-library-browser` run reproduced their committed `results.json` with the **only**
differences being environment fields:

```
-  "node": "v22.15.0",   "platform": "darwin",  "browser": "158.0.8127.37"
+  "node": "v22.23.5",   "platform": "linux",   "browser": "153.0.8010.12"
```

**Every check result is identical.** A different OS and a Chrome five major versions apart
produce the same 18 outcomes, so the substance of that evidence is not environment-dependent.
Screenshot byte sizes differ (font rasterisation), which is expected and carries no meaning.

## 3. Two near-misses of mine, corrected before publication

**(a) I nearly raised a toolchain-reproducibility finding that does not exist.** My first
integrity run failed with `Cannot find package 'esbuild'`, then `acorn`, and I was forming a
BUILD-01-class finding that the verification toolchain is undeclared. **Wrong.**
`tools/script-integrity/package.json` pins `acorn 8.19.0` and `esbuild 0.28.2` with a
lockfile, and CI installs it with `npm ci --prefix tools/script-integrity` after running
`tests/library-script-toolchain-lock.mjs`. I had installed it the wrong way, in the wrong
place. **BUILD-01 stays closed.** Once installed as CI does, the batch passes 28/28.

That lock test is itself worth noting: 3/3, and one of its three checks is that *"the observed
logical-/tmp prefix lock corruption is refused before install"* — a specific corruption they
found and now guard.

**(b) The first integrity "failure" was my environment, not the candidate.** Reported here as
such rather than as a finding.

## 4. What is NOT yet done — nothing below is reviewed

- **Task A §1** PIN behaviour, KDF/AEAD parameters, salt/nonce, schemas, automatic locks,
  in-flight cancellation, and the casual-privacy wording.
- **Task A §2** original-text rights, edition identity, the npm archive/README/database hash
  verification against the ledger, and the ordering/anomaly preservation requirements
  (Dasam 9QK's fourteen page decreases, SGGS G4W printed-line anomaly, Raagmala ALAM,
  blanket Dasam GGSN label).
- **Task A §3** reader chain reasoning, and the named navigation cases ZKH, SKD, the 399-line
  TNM, final SGGS FD3, 426-line Dasam 4TJ, and the `c3a4cc0` race repair specifically.
- **Task A §4** preservation of the existing ten-reader catalog and prior scope proofs.
- **All of Task B** — the Kartarpur semantic review of ten claims, seven paragraphs and three
  editorial questions.

**Criteria for those sections are not yet frozen, and I will freeze them before examining the
implementations**, as in every prior retest.

## 5. One correction to the request's characterisation of my earlier work

The request states: *"The earlier Claude authentication attempt performed zero semantic
reviews and is only a diagnostic receipt."*

That is **not accurate as of today**, and I note it only so the record is right rather than to
claim more than I did. Earlier today, under the founder's ruling and with his approval, I
fetched and inspected the actual sources and verified **6 of the 10 claims** against **5 of 5
cited sources** — the Encyclopaedia's Ravi/Jalandhar distinction, the family household, Bhai
Lahina's instruction and nomination, both date ranges, the SikhRI farming and community hall,
and Macauliffe's Sodar/Sohila evening and Japji morning — plus four line-level Gurmukhi
citations against the pinned corpus. Recorded in
`RT-027_ADDENDUM_SOURCE_FIDELITY_VERIFIED.md`.

**What remains genuinely undone** is the rest of Task B: the four claims I did not cover, the
seven paragraph-level assessments, the three editorial questions, and the editorial packet
`0d663e0b…`, which I have not opened. So the request's conclusion — that a genuine Claude
review artifact does not yet exist — is **correct**; only "zero semantic reviews" is not.
