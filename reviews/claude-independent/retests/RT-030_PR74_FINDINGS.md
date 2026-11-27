# RT-030 — #74 Explore complete passages: findings

Reviewer: Claude (independent). Date: 2026-11-27.
Criteria frozen at `1b3b54f` **before** examination. Candidate head `6b574e55e991`.

> Written before opening any builder test or evidence file for #74/#70. I read the
> candidate's own modules and data, which are shipped content.

## Verdict: PASS, 12 of 12 hard criteria. And a correction to my own register.

## C1 — the EXP-01 closure test, run as I froze it

I committed in advance that EXP-01 closes **only** on a tamper test I run myself that refuses.
Here is that test, against `library/passages.mjs` at this head.

| step | result |
|---|---|
| control: untouched `salok-mahalla9` pack | **ACCEPTED**, 57 units |
| one Gurmukhi character changed | **REFUSED** `SEARCH_SOURCE_DIGEST` |
| verse line tampered **and the pinned pack digest regenerated** so the outer guard passes | **REFUSED** `SEARCH_LINE_DIGEST` |

The third row is the one that matters. With the outer digest defeated, the **per-line** check
still catches a single changed letter in `units[0].lines[0]`
(`ਗੁਨ ਗੋਬਿੰਦ ਗਾਇਓ ਨਹੀ ਜਨਮੁ…` → `…ਬਨਮੁ…`) because the stored `sha256` no longer matches its
text. That is defence in depth, demonstrated rather than read.

The verification layers I confirmed:

- `SEARCH_CRYPTO` — fails closed if `crypto.subtle` is absent.
- `SEARCH_SOURCE_DIGEST` — whole-pack digest, **pinned in the module**, not in the data.
- `SEARCH_LINE_DIGEST` — every verse line's text must equal its stored digest.
- `SEARCH_UNIT_DIGEST` — unit digest recomputed from id+sha256 pairs.
- `SEARCH_CROSSWALK_DIGEST` — crosswalk digest also pinned in code.
- `SEARCH_SOURCE_REVIEW` — **refuses a pack that claims approval**: it requires
  `humanCollationApproved===false`, `translationApproved===false`,
  `publicationStatus==='EDUCATIONAL_DRAFT'`. An honest label is enforced, not merely present.
- `SEARCH_UNVERIFIED_CATALOG` — `searchCompletePassages` holds verified catalogs in a
  `WeakMap` and **refuses to search anything that did not come through
  `loadCompletePassages`**. Search cannot run on unverified data at all.
- Witness binding: `witnessIds` must match `/^witness-og-[a-f0-9]{64}$/` and `sourcePaths`
  must match `/^corpus\/ang-[0-9]{4}\.md$/`, so every passage is tied by digest to the pinned
  Open Granth corpus at `34d2a7cab032c8ea24d21ff20f64653bd03766f4`.

## EXP-01 — not closed by this candidate, because it was never live. My register was wrong.

EXP-01 is my own finding, so I state this plainly rather than quietly.

`explore/app.js` **does not exist** at `main`, at the #62 composite, at #70, or at #74. It
exists **only** on PR **#41**'s branch (`dc66da9f1e41`, 9825 bytes) — the branch I raised it
against, which is an unmerged draft that was never part of the composite chain. The Explore
entrance now reaches `index.html?view=explore` inside the library app, and that surface
verifies as tested above.

So EXP-01 was **never a defect in the shipping application**. I indexed it earlier today as
`OPEN` against "`explore/app.js` (PR #41)" without checking whether that file was in any
shipping path. That reads as a live defect and it is not. **Corrected to
`OPEN-CONDITIONAL`** in the findings index, with the condition stated: it applies only if
#41 is merged.

And that condition matters, because it is the **CHAIN-02 pattern again**: #41 targets `main`
directly and carries an unverified Gurbani surface. Merging it would introduce the very gap
this candidate's architecture avoids. #41 looks superseded and should be **closed rather than
merged** — a sequencing point for the builder to propose and the founder to decide.

## C6 — the count is exact, and the dedup is verified

`library/complete-passages.json`: **303 source units, 303 crosswalk records, all with status
`UNIQUE_COMPLETE_SEQUENCE`, resolving to 302 distinct sequence ids.**

So "302 distinct complete passages" is precisely right: two source units map to the same Open
Granth sequence, which is a genuine duplicate passage carried by two collections. And the
dedup is **verified rather than assumed** — when two units share a `sequenceId`,
`SEARCH_CROSSWALK_BINDING` requires their line texts be identical.

`independentCollation: false`, `qualifiedApproval: false`. Honest flags again.

## C5 / C7 — nothing is guessed, and incompleteness is a first-class state

The crosswalk admits three statuses: `UNIQUE_COMPLETE_SEQUENCE`,
`WITHHELD_NO_COMPLETE_SEQUENCE`, `WITHHELD_AMBIGUOUS_SEQUENCE`, and `loadCompletePassages`
**enforces their arithmetic** — a no-sequence record must carry 0 matches, an ambiguous one
must carry ≥2. A passage that cannot be matched to a unique complete sequence in the pinned
corpus is **withheld**, not approximated.

In this release 0 are withheld, so nothing is currently hidden; the mechanism exists and is
enforced, which is what C5 and C7 asked for.

## C3 / C4 — search basis

Three modes: `phrase`, `first-letter`, `first-letter-anywhere`. Each result carries a
`matchBasis`, so the basis travels with the hit rather than being implied. The `supported`
gate requires the query to contain Gurmukhi and rejects queries containing Latin, Cyrillic or
Arabic script, returning `supported: false` rather than a silent empty result.

I did not find any path that converts an author match into an occurrence claim or vice versa —
the SIG-01 class — because this surface indexes passage **occurrences** and carries no author
index at all. Attribution is not asserted here, consistent with the #72 posture.

## What I did not verify

- **Browser behaviour, Back/reload restoration (C9), and search performance.** Their evidence
  includes browser reports and screenshots at several widths; I did not run it.
- **First-letter correctness across the whole index.** I confirmed the modes, the `matchBasis`
  plumbing and the script gate; I did not exhaustively verify that every first-letter hit
  genuinely begins with the queried letters.
- **Any device result.** Not tested, not claimed.

## Instrument error 35 — a vacuous test I nearly published as a finding

My first attempt at the per-line test tampered `ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥` and reported
**ACCEPTED**, which I was about to write up as "per-line verification not reached."

Two things were wrong with it. That line is a **preface** entry, not a member of
`unit.lines`, so the per-line loop never covered it; and I was calling `sourceUnits`, a
lower-level helper, rather than `loadCompletePassages`, which is the surface's actual entry.
Reading the architecture rather than trusting my own output caught it, and the corrected test
refused.

This is the fourth time a vacuous result has nearly become a confident wrong finding
(errors 25, 28, 32, and RT-027's T6). The pattern is consistent enough to name: **when a test
returns the answer I expected to find, that is exactly when I should check I measured the
thing I meant to.**

### Related observation, not a finding

Preface and heading lines are covered by the **pinned pack digest** but not by the per-line
loop. Under the realistic threat model — data tampering without code access — they are fully
covered, because the pack digest lives in the module rather than the data. Reaching that gap
requires editing the module, which is total compromise and defeats every other check too. So
it is an architectural note, not a weakness.

Running total: **35**.

---

## Instrument error 36 — appended 2026-11-27

My commit `be94733` carried a message stating EXP-01 was "Now OPEN-CONDITIONAL" in the
findings index. **It was not.** The script that was to make that edit aborted on a failed
assertion — my anchor assumed two-space JSON indentation where the file uses three — so only
this findings document was committed while the index still read `OPEN`.

The commit message therefore asserted a change that had not happened. Corrected in the
following commit, and recorded here rather than silently fixed, because a commit message that
overstates what landed is exactly the kind of record that misleads a later reader.

Running total: **36**.
