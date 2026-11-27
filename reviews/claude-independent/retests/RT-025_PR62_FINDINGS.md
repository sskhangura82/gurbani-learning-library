# RT-025 — independent findings, PR #62 (Daily backup retry idempotence)

**Candidate:** `7f36c3039ca95fac6e69ca28f631b9e3734c70e9`, draft, open, unmerged
**Base:** `df2c62fb` (PR #61, passed in RT-024)
**Criteria frozen at:** `eca5fb7`, before opening implementation
**Verdict: PASS, 20 of 20 criteria.**

The runtime change is **16 added / 5 removed lines** in `hukamnama/learning.mjs`.
The reported defect was found and disclosed by the builder against their own
passing candidate, and their statement that my RT-024 verdict is not rewritten is
correct: the earlier test repeated the combined post-merge export, which is a
different operation.

## The repair works, and it is idempotent beyond the first retry

| Restore of the same conflicting backup | Result |
|---|---|
| 1st | `CONFLICT_PRESERVED` — 2 records, revision 2, **both texts kept** |
| 2nd | `UNCHANGED` — **storage bytes identical**, revision still 2 |
| 3rd | `UNCHANGED` — bytes identical |
| 4th | `UNCHANGED` — bytes identical |

Both versions survive the first restore: "ORIGINAL text" and "DIFFERENT text",
the second as a conflict copy bound by `conflictOf`. Retries change nothing at
all — not the bytes, not the revision, not the identities.

## What I actually weighted: the ways this fix could lose text

The reported defect is duplication, which is recoverable. Over-deduplication is
not, so eight criteria tested for it. All held.

| Scenario | Result |
|---|---|
| distinct explicit identities, **identical** text | **both survive** |
| text differing only by a **trailing space** | kept separate |
| text differing only by **case** | kept separate |
| genuine **NFC vs NFD** pair (`café`), identical after normalization | **kept separate** |
| identical text, **different source binding** | kept separate |
| identical text, **different `updatedAt`** | kept separate |
| **pre-existing** duplicate conflict copies from the old importer | **not removed** — 3 before, 3 after, `UNCHANGED` |
| `idFactory` deliberately returning **incoming** identities | generated copy skipped them; no duplicate ids; incoming `p2`/`p3` kept their own |

The NFC/NFD case is the one I would single out. Two reflections that *display*
identically are retained as separate versions because their bytes differ. That
is the right call for someone's own writing: the importer preserves what they
typed rather than what it renders as.

## Order independence

An original-plus-conflict-copy backup presented in both orders produces an
identical store. The two-pass design — admit absent explicit identities first,
then resolve collisions — is what buys this, and it also replaces a
`JSON.stringify(existing)===JSON.stringify(item)` comparison that was sensitive
to object key order. That old comparison could have manufactured spurious
conflicts from a re-serialized but unchanged record; it is now a fixed-field
comparison.

## Atomicity and refusal

A lock that throws mid-import yields `LOCK_UNAVAILABLE` with the store **byte
untouched**, and the message tells the person their existing record is preserved
and their unsaved text is still theirs. No partial store is ever written.

Nothing in the diff removes a record — only `push`. So pre-existing data cannot
be deleted by this code path structurally, not merely by test.

## Containment

- **C18 PASS** — only seven paths change outside evidence, docs, tests and
  workflows, all of them the learning path and its regenerated artifacts.
  Byte-identical: the dated event, the source package, `publication-key.mjs`,
  `delivery.mjs`, `core.mjs`, `reader.mjs`, the Knowledge bundle, `sukhmani.html`,
  `nitnem/index.html`, `knowledge/scripture.json`.
- **C16 PASS** — `build-app-bundles --check` →
  `{"status":"PASS","applications":4,"changedFiles":[],"sourceInputs":18}`. The
  bundle **reproduces** from `learning.mjs`. Applications moved 3 → 4 and source
  inputs 12 → 18, so the Daily reader is now under the same reproducible-build
  policy as the rest — a quiet extension worth noting.
- **C17 PASS** — `refresh-app-sri --check` → 15 pages, 52 script occurrences,
  5 module occurrences, `changedPages: []`. All pins valid.
- **C19 PASS** — zero files carry deploy capability; cache identity bumped
  `0.22-daily-hukamnama-20261126-1` → `-2`.
- **C20 PASS** — #59, #60, #61, #47 heads and `main` `a3476ac4` unchanged.

## The disclosed limit, which I verified is stated rather than solved

The handoff records that when a conflict copy itself collides, the schema keeps
only the immediate `conflictOf` identity and no complete ancestry graph, and that
this repair does not claim to reconstruct that history. That is stated, not
hidden, and I am not scoring it as a defect.

## My own error in this review

30. My first NFC/NFD test used `x`, which **is** the letter `x`, so the
    "variant" string was identical to the original. The result — one record —
    was correct idempotence, and I nearly wrote it up as a normalization failure.
    Re-run with a real combining-character pair, the criterion passed.

## Limits

Synthetic records only, built by hand against the documented store envelope; no
real reader data read or written. node and desktop Chromium only. Not Safari,
not a physical device. The Web Locks note from RT-024 still applies: saving and
importing need `navigator.locks` and fail closed without it, which iPhone
acceptance should confirm. I have not opened
`docs/DAILY_BACKUP_REPAIR_CRITERIA_20261126.md` or the evidence record; an
addendum follows. No approval, no merge.
