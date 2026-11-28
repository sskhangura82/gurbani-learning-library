# RT-024 — frozen acceptance criteria, PR #61 (Daily Hukamnama)

**Candidate:** `df2c62fb3fef3d85cab9b752772e3f3f201dd791`, draft, open, unmerged
**Base:** `fix/library-script-integrity-20261126` at `44401e35` (PR #60's reviewed head)
**`main` at freeze:** `a3476ac4b9be90dde350fb35dd13ce0b672c120d`, unchanged; nothing merged
**Shape:** 129 files, +12121/−82; 82 are evidence
**Observed at freeze:** `mergeable_state: unstable`. Recorded; not investigated until findings are committed.

## Eligibility, checked first

PR #44 is **my own** draft Hukamnama lesson and I may not review it. Verified:
`0a047f87e3ca` is **not an ancestor** of this candidate, and none of my draft's
paths — `drafts/hukamnama-lessons/*`, `tools/hukamnama/render-lesson-draft.mjs`,
`tests/hukamnama-lesson-draft.mjs` — appear in its 129 files. I am eligible.

## Declared reading

PR metadata, the changed-file name list, and
`docs/DAILY_HUKAMNAMA_DATA_CONTRACT_20261126.md`. I am **deferring**
`docs/DAILY_HUKAMNAMA_CRITERIA_20261126.md` until my findings are committed, as
in RT-022. The real bar here is the founder's standing constraints, which are
not the builder's document, and I want my criteria derived from those
independently. I will record afterwards what theirs contained.

## Why this is the highest-stakes candidate so far

It is the first to touch **scripture authenticity against an external authority**
and **third-party rights** at the same time. The standing constraints that bite:
never substitute a random Shabad or an earlier reading; never treat a search
snippet, HTTP status, Ang number, first line or provider majority vote as
sufficient authentication; public availability does not establish permission to
redistribute, host, embed or cache; never invent an answer where no source-linked
lesson exists; no live generative interpretation in the reader; do not present
AI-generated explanation as the authoritative voice of the Guru.

## Criteria — authenticity and refusal

| ID | Criterion | Fails if |
|---|---|---|
| RT24-C1 | A date with no published event **refuses**, naming the reason, and shows **no** scripture | it substitutes another date, a random Shabad, or renders anything |
| RT24-C2 | `officialPublishedDate` ≠ requested date **refuses** | any different-date fallback occurs |
| RT24-C3 | Mutating **one line** of the source package refuses — complete ordered text equality, not Ang or first-line matching | a partial or positional match is accepted |
| RT24-C4 | A 200 response with wrong content refuses; HTTP status is never authentication | status alone admits content |
| RT24-C5 | A bad or absent signature refuses **before** the payload is parsed | payload is parsed first, or a bad signature admits |
| RT24-C6 | Nowhere does the UI or data present the signature as SGPC's attestation | any text implies the custodian signed it |
| RT24-C7 | Reordering occurrences refuses; Rahao stays in its original position | order is not enforced |

## Criteria — no invented interpretation

| ID | Criterion | Fails if |
|---|---|---|
| RT24-C8 | Null lesson slots render as **pending**, never as generated text | any generated explanation appears |
| RT24-C9 | `admitLesson` rejects every unapproved candidate; no lesson is currently approved | any lesson is admitted |
| RT24-C10 | A pending explanation never hides or replaces the original Gurbani | scripture is withheld because a lesson is missing |
| RT24-C11 | No live generative path exists in the reader | any runtime generation |

## Criteria — lineage honesty, from my own RT-005 finding

| ID | Criterion | Fails if |
|---|---|---|
| RT24-C12 | The edition is `opengranth-34d2a7c`. **RT-005 established that Open Granth declares `source: Shabad OS Database` in all 1,430 Ang files, so it and my review reference are one textual lineage, not two witnesses.** Any claim of independent witness must not rest on that single lineage | "independently witnessed" is asserted where only one lineage exists |
| RT24-C13 | The candidate does not treat SGPC agreement plus Open Granth text as **two** independent authentications of the text itself | provider agreement is counted as textual corroboration |

## Criteria — rights

| ID | Criterion | Fails if |
|---|---|---|
| RT24-C14 | A hosted copy of Open Granth text is redistribution. A license basis must exist and be identifiable | no license basis is recorded or discoverable |
| RT24-C15 | **No SGPC page content is stored, cached or excerpted** — digests only | any provider text, markup or timing data is retained |
| RT24-C16 | The official reading link stays an external link, never an embed or proxied render | it is embedded or re-hosted |
| RT24-C17 | No modern translation or commentary is captured by the receipt digest path | commentary is included |

## Criteria — private learning

| ID | Criterion | Fails if |
|---|---|---|
| RT24-C18 | Learning stays on the device; nothing is transmitted | any network write of learning |
| RT24-C19 | An unknown or malformed existing store is **preserved**, not replaced | it is overwritten |
| RT24-C20 | A bad import is rejected without destroying existing learning | existing data is lost |
| RT24-C21 | No silent truncation of private text | text is shortened without saying so |

## Criteria — containment

| ID | Criterion | Fails if |
|---|---|---|
| RT24-C22 | PR #60's reviewed bytes — bundles, pins, scripture, worker algorithm — are unchanged except where this candidate must extend them, and every extension is identified | an unexplained change |
| RT24-C23 | Every production script stays pinned and recomputes valid, including the new reader | any unpinned or mismatched pin |
| RT24-C24 | Nothing deploys; no daily publisher is enabled | any deploy or enabled publisher |
| RT24-C25 | #58, #59, #60, #47 heads and `main` unchanged | any moved |

## Method limits, stated in advance

Synthetic learning records only; I will not read or write real reader data.
Desktop Chromium only. **I will not contact SGPC or any custodian, incur cost, or
fetch from `hs.sgpc.net`** — drafting permission requests is permitted, contacting
is not, and I am not going to probe a custodian's site as part of a review. Any
claim about what the provider serves is therefore limited to what the committed
evidence shows. Not Safari, not a physical device, and no qualified-content
judgement: I can check that interpretation is absent, never that a translation is
correct.
