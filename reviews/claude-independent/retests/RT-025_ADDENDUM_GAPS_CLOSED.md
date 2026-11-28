# RT-025 addendum — their criteria caught two gaps in mine, both now closed

Written after `RT-025_PR62_FINDINGS.md` was committed at `46e2e501`.
All six checks on `7f36c303` are `success`; the `unstable` at freeze was CI running.

## Gap 1 — nested conflict exports (their criterion 5)

I tested a single-level conflict: an original and one conflict copy. **I did not
test a conflict copy that itself has a conflict copy**, which is exactly where an
idempotence check keyed on `conflictOf` could misfire.

Tested with a three-level chain — `n1` original, `n2` a copy of `n1`, `n3` a copy
of `n2` — reimported from its own export:

| Restore | Result |
|---|---|
| 1st | `UNCHANGED`, 3 records, bytes unchanged, **0 storage writes** |
| 2nd | `UNCHANGED`, 0 writes |
| 3rd | `UNCHANGED`, 0 writes |

All three versions intact, and the chain preserved exactly: `n1 → –`,
`n2 → n1`, `n3 → n2`. **Passes.**

## Gap 2 — concurrent retries (their criterion 6)

I tested a lock that *throws*. I did not test **two retries racing**, which is
the realistic case: a person taps restore twice, or two tabs do.

Three simultaneous `importLearning` calls of the same backup, under a lock stub
that genuinely serializes the way an exclusive Web Lock does:

    statuses: CONFLICT_PRESERVED, UNCHANGED, UNCHANGED
    records:  2  — exactly one conflict copy
    texts:    base | variant

The first call does the work; the other two correctly find the version already
represented. **Concurrency cannot append the same incoming version twice.
Passes.**

## A refinement of theirs worth adopting

Their criterion 1 requires no **storage-write** and no **identity-generation**
change on a retry, where I had only checked that the stored bytes were identical.
Those are different claims: an identical write is still a write. Measured with a
counting storage stub: **0 writes across two no-op retries.** Stronger than what
I asked for, and the stricter criterion is the better one.

## What I did not do for this candidate

Their criterion 7 asks for the import/export controls demonstrated in fresh
synthetic browser contexts. **My testing here was node-level only.** Their
`browser` and `browser-learning-and-offline` jobs pass, and I am naming this
rather than letting those green checks stand in for my own browser testing.

## Standing

RT-025's verdict is unchanged: **PASS, 20 of 20**, with the two gaps above now
closed on their criteria and one named as untested by me.

This is the third consecutive candidate where the builder's frozen criteria
caught something mine missed — non-root URL hosting in RT-022, the offline cache
path in RT-024, and nested plus concurrent retries here. That is a pattern in my
own work worth stating: my criteria run deep on the failure I am hunting and
thinner on the surrounding operational surface. Theirs are the reverse. The
combination has been catching more than either would alone, which is the point
of the arrangement, but the asymmetry is mine to correct.
