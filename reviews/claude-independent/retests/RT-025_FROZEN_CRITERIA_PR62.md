# RT-025 — frozen acceptance criteria, PR #62 (Daily backup retry idempotence)

**Candidate:** `7f36c3039ca95fac6e69ca28f631b9e3734c70e9`, draft, open, unmerged
**Base:** `feature/daily-hukamnama-learning-20261126` at `df2c62fb` (PR #61, which I passed in RT-024)
**`main` at freeze:** `a3476ac4b9be90dde350fb35dd13ce0b672c120d`, unchanged; nothing merged
**Shape:** 35 files, +1479/−24. Runtime change is **16 added / 5 removed lines in `hukamnama/learning.mjs`**
**Observed at freeze:** `mergeable_state: unstable` — recorded, not investigated until findings are committed.

## Declared reading

PR metadata, the changed-file name list, and
`docs/DAILY_BACKUP_REPAIR_HANDOFF_20261126.md`. Deferring
`docs/DAILY_BACKUP_REPAIR_CRITERIA_20261126.md` and all evidence until findings
are committed, as in RT-022 and RT-024.

**This defect was found by the builder, not by me.** They disclosed it against
their own passing candidate and stated plainly that my RT-024 verdict is not
rewritten by it, because the earlier test repeated the combined post-merge
export — a different operation. That is accurate, and the disclosure is the
right behaviour.

## The central risk, which is not the reported defect

The reported defect is **duplication**, and duplication is recoverable. The
danger in fixing it is the opposite error: **over-deduplication, which destroys
a person's text and is not recoverable.** A fix that collapses two genuinely
different notes, or two distinct notes that happen to share wording, would be
far worse than the duplicate copies it removes.

The standing constraint is "preserve private learning on the user's device."
So my criteria weight data loss far above duplication.

## Criteria — idempotence, the claimed fix

| ID | Criterion | Fails if |
|---|---|---|
| RT25-C1 | Head is exactly `7f36c303…`, draft, unmerged | identity differs |
| RT25-C2 | **First** restore of a conflicting backup preserves **every** distinct version | any version is lost |
| RT25-C3 | **Retrying the same backup** adds no further copy | duplicates accumulate |
| RT25-C4 | A no-op retry leaves **storage bytes and revision unchanged** | revision churns, or bytes change |
| RT25-C5 | A third and fourth retry remain no-ops | it is idempotent only once |

## Criteria — the ways this fix could destroy data

| ID | Criterion | Fails if |
|---|---|---|
| RT25-C6 | Two notes with **distinct explicit identities** and **identical text** both survive | they are collapsed |
| RT25-C7 | **No text normalization**: notes differing only in whitespace, case or Unicode form stay separate | any are merged |
| RT25-C8 | Notes with different **source bindings** stay separate even with identical text | merged across readings or lines |
| RT25-C9 | Notes with different **timestamps** stay separate | merged |
| RT25-C10 | **Existing duplicates from the earlier importer are not silently removed** | the fix deletes pre-existing copies |
| RT25-C11 | A generated identity never takes an **incoming** note's identity | identity theft between records |
| RT25-C12 | Import remains **atomic**: a mid-import failure leaves the prior store intact, not partial | a partial store is written |
| RT25-C13 | Refusals still preserve existing learning and still say so | any refusal loses text |

## Criteria — order independence

| ID | Criterion | Fails if |
|---|---|---|
| RT25-C14 | The same backup presented in **different record orders** yields the same resulting store | order changes the outcome |
| RT25-C15 | An original-plus-conflict-copy backup is order-independent specifically | that pairing is order-sensitive |

## Criteria — containment

| ID | Criterion | Fails if |
|---|---|---|
| RT25-C16 | The bundle **reproduces** from `learning.mjs` via the toolchain (BUILD-01's path, now working) | it does not rebuild to the committed bytes |
| RT25-C17 | Every production pin recomputes valid, including the updated `hukamnama/index.html` | any mismatch |
| RT25-C18 | No scripture, dated event, source package, explanation, publication key, other reader or other storage schema changed | any changed |
| RT25-C19 | Nothing deploys | it can |
| RT25-C20 | #59, #60, #61, #47 heads and `main` unchanged | any moved |

## What I will not claim

The handoff states a retained format limit: when a conflict copy itself
collides, the schema records only the immediate `conflictOf` identity and no
complete ancestry graph. I will verify that limit is **stated**, not that
lineage is reconstructed, and I will not treat its absence as a defect since it
is disclosed.

Synthetic records only; no real reader data. Desktop Chromium and node only. No
device, Safari, rights or qualified-content claim.
