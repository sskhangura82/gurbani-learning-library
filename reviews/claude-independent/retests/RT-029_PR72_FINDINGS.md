# RT-029 — #72 source-only Farid Salok candidate: findings

Reviewer: Claude (independent). Date: 2026-11-27.
Criteria frozen at `b605a81` **before** examination, with ground truth established first.
Candidate head `ea7186e7127d`.

> Written before opening any builder test or evidence file for #72/#65. I did read the
> candidate's own data, selection ledger and source audit, which are shipped content rather
> than test evidence.

## Verdict: PASS, 12 of 12 hard criteria. My falsifier fired.

I froze: *"If the eleven Guru-authored saloks are correctly attributed, the text matches the
pinned reference exactly, and the count claim is reconciled, then the candidate's scripture
integrity holds and I will say so plainly rather than manufacturing a lesser finding."*

**All three hold.** No finding is raised against this candidate.

## C1 — attribution, and it is handled better than I asked for

My criterion required the eleven Guru-authored saloks be attributed to Guru Arjan and Guru
Amardas. **The candidate attributes authorship to nobody at all**, which is more
conservative and, on reflection, more correct:

```
authorId: null                              (all 130 units)
attribution.canonicalAuthorId: null
attribution.collectionTitleAssignsAuthorship: false
attribution.signatureAloneAssignsAuthorship: false
attribution.qualifiedAttributionReviewed: false
```

`signatureAloneAssignsAuthorship: false` is **SIG-01's lesson encoded as data.** Asserting
"Guru Arjan" would have meant adopting a digital provider's attribution as established, which
the standing constraints forbid.

Eleven units carry `explicitMahallaHeadingIds`, recording that the **source itself** declares
a different author at those points. Their ordinals:

```
candidate flagged : [13, 52, 75, 82, 83, 104, 105, 108, 109, 110, 111]
reference Guru-authored section_orders : [13, 52, 75, 82, 83, 104, 105, 108, 109, 110, 111]
```

**Identical.** The reference authors at those positions are 3× Guru Amardas and 8× Guru
Arjan — exactly the ground truth I established before opening the candidate.

And the reader **enforces** it at runtime: `u.authorId!==null` throws.

## C2 / C3 — text fidelity against the candidate's own pinned source

Their pin is `opengranth/open-granth` at commit
`34d2a7cab032c8ea24d21ff20f64653bd03766f4` — the same commit RT-005 examined. I had that
checkout already and verified it is at that exact commit.

Reconstructing all 297 occurrences (preface + 11 metrical headings + 284 verse lines) and
comparing against Angs 1377–1384 of the pinned source:

- **candidate occurrences not found in the pinned source: 0** (with multiplicity)
- **per-occurrence `sha256` self-consistency: 297 of 297 match**

No letter, matra or danda differs. **C3 holds: nothing is modernized or regularized.**

## C4 — the count claim is reconciled, not asserted

The builder's claim was "all 130 numbered Saloks" against the reference's 128 line-groups.
`research/salok-farid/selection-summary.json` reconciles it explicitly:

| field | value |
|---|---|
| units | 130 |
| verseOccurrences | 284 |
| structuralOccurrences | 13 |
| allOccurrences | **297** |

**297 is exactly the line count I measured independently in the reference section.** The 13
structural occurrences are the 11 Mahalla headings, the collection title
`ਸਲੋਕ ਸੇਖ ਫਰੀਦ ਕੇ ॥`, and `ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥`. The 130-vs-128 difference is printed
numbering against the reference's group segmentation, which is a segmentation choice, not a
missing or extra salok.

## C8 — source selection recorded, with differences retained rather than resolved

`secondaryByteIdenticalOccurrences: 291 of 297`, with **six** documented differences. Each
carries `action: RETAIN_PINNED_SOURCE_BYTES` and `equivalenceAdjudicated: false` — the
difference is preserved and explicitly *not* adjudicated. Two of them are the bindi in
`ਨਂੀਵਾਂ` and `ਕਾਲਂੀ`, where the secondary witness omits `ਂ` and the candidate keeps the
pinned bytes.

That is the no-silent-reconciliation constraint applied correctly.

## The source audit is honest about everything it has not done

```
independentTextualLineageEstablished : false
canonicalAngAdjudicated             : false
canonicalAuthorAdjudicated          : false
modernTranslationsImported          : false
completePrintedCollation            : false
qualifiedHumanReviewCount           : 0
```

`independentTextualLineageEstablished: false` is **RT-005's limit encoded in the shipped
data**. They are not claiming two witnesses.

## C6 / C7 — no translation or explanation ships

Line objects carry only `family, held, id, kind, location, sha256, source, text`. There is
**no translation, meaning or explanation field anywhere** in the pack; the only matching keys
are the flags `translationApproved: false` and `modernTranslationsImported: false`.
`publicationStatus: EDUCATIONAL_DRAFT`.

The reader is explicit:
`if(pack.compositionId==='salok-farid')return null; // This source-only edition has no
explanation asset.`

## C10 — verified before display, in layers

`nitnem/reader.js` asserts, before rendering: `unitCount===130`, `originalLineCount===284`,
297 occurrences, 297 unique line ids, `releaseChannel==='DEVELOPMENT_REVIEW'`,
`translationApproved===false`, the **text-sequence digest** `1f76efa45d…`, the **custody
digest** `79088bc1…`, and per unit the id, ordinal, `authorId===null`, line-id sequence and a
recomputed `sourceDigest`. It also requires `'sourceDisplayOrder' in u` to be **absent**,
which guards the CI-S-01 display-order class.

All four Farid paths are present in the offline manifest.

## A correction I made before publishing, not after

I nearly raised a finding that the candidate drops five zero-width joiners (U+200D) present
in my reference corpus, undocumented among their six differences.

**Wrong yardstick.** My corpus is Shabad OS; their pin is Open Granth. **ZWJ count is 0 in
both the pinned source and the candidate.** The candidate is faithful to its pin, and the
joiners exist only in my corpus. Had I published that, it would have been a false finding
produced by measuring against a provider the candidate never claimed to follow.

### Incidental lineage observation, about Open Granth rather than this candidate

Shabad OS section `X63C` contains **5 zero-width joiners** in these lines; Open Granth at
`34d2a7ca` contains **0** for the same lines, while declaring `source: Shabad OS Database`.

So the Open Granth derivation is **not byte-faithful to its declared upstream** — it drops
joiner control characters. This bears on RT-005 / CI-S-16: Open Granth is not merely a copy
of Shabad OS but a *transformed* copy, and the transformation is undocumented in the Ang
files I read. Not a defect in #72, which correctly follows its pin. Recorded for the lineage
record.

## Soft criteria

| # | Result |
|---|---|
| S1 longer units handled without truncation | **MET** — 297 occurrences round-trip, per-unit digests recomputed |
| S2 headings preserved as headings | **MET** — held in `preface` and `metricalHeadings`, never folded into verse lines; this is the CI-S-01 class and it is handled |
| S3 bookmarks and reflections survive | **not verified by me** — browser-level, and their evidence covers it |
| S4 the four Farid compositions elsewhere not implied included | **MET** — Farid has 121 groups in SGGS against 117 here; the caveat says exactly that |

## What I did not verify

- **Browser and offline behaviour.** Their evidence covers it; I did not run it.
- **Printed collation.** Outstanding by design, and the data says so.
- **Any device result.** Not tested, not claimed.
- **Whether the 130-unit segmentation matches a specific printed edition's numbering.** I
  verified internal consistency and the pinned source, not a printed witness.

## Instrument errors in this retest

None published. Two caught in-flight:

- **The wrong-yardstick ZWJ finding**, corrected above before publication.
- A crude check of mine reported "284 lines carrying latin prose", which was an artifact of
  iterating dict values such as `SELECTED_DIGITAL_WITNESS`. Discarded rather than reported —
  the same regex-as-evidence class as errors 18, 27 and 29.

Running total: **34**.
