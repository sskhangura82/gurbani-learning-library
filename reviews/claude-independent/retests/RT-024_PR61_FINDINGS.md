# RT-024 — independent findings, PR #61 (Daily Hukamnama)

**Candidate:** `df2c62fb3fef3d85cab9b752772e3f3f201dd791`, draft, open, unmerged
**Base:** `44401e35` (PR #60's reviewed head)
**Criteria frozen at:** `16bd68b`, before opening implementation
**Verdict: PASS. 24 of 25 criteria met; RT24-C17 is not independently verifiable by me and is reported as such.**

This is the first candidate to touch scripture authenticity against an external
authority and third-party rights at the same time. It holds.

## The constraint that matters most: it will not substitute a reading

Tested against the module directly, with a stubbed fetch:

| Situation | Result |
|---|---|
| today, both files served | `DIGITAL_TEXT_VERIFIED_PREVIEW`, source present |
| a date with no published event | `DATE_UNAVAILABLE`, **source absent** |
| **asked for 26 Nov, server returns the 27 Nov event** | **`SOURCE_REFUSED`, source absent** |
| HTTP 200 with an empty body | `SOURCE_REFUSED`, source absent |
| HTTP 200 with an HTML error page | `SOURCE_REFUSED`, source absent |
| HTTP 200 with a valid-schema but **wrong** source | `SOURCE_REFUSED`, source absent |
| event valid, source 404 | `TODAY_PENDING`, source absent |

The third row is the standing constraint "never substitute a random Shabad or an
earlier reading" tested at its sharpest: **handed another date's genuine signed
event, it refuses rather than displaying it.** And no 200 response is ever
treated as authentication.

Date refusals carry two distinct and correct reasons — "The official date does
not match the requested date" for a past date, "This date has not arrived in
Amritsar" for a future one, using Asia/Kolkata. That is the `resolveDate`
vocabulary I reviewed on PR #43 in RT-016, now wired to real delivery.

## Authenticity chain, recomputed by me

| Check | Result |
|---|---|
| `textSha256` recomputed from the 7 occurrences joined by one space | **matches** declared value and the filename |
| raw source file sha256 vs the event's `source.sha256` | **matches** |
| all 7 per-occurrence digests | **0 mismatches** |
| `officialOriginalSha256` vs source `textSha256` | **equal** — the provider's original text digest equals the shipped text |

Source mutations, with the event untouched: a **single trailing space** on one
line, two occurrences reordered, one occurrence removed, and a heading
relabelled as a verse — **all four refused**, each on raw-byte binding. That is
complete ordered text equality, not Ang or first-line matching.

Signature attacks: a forged signature, an altered payload with the original
signature, and a removed signature — **all three refused**, and the messages show
the envelope and encoding are checked before the payload is used.

## Independent cross-check against my own reference

I located the reading in the Shabad OS v5 reference (asset SSA2, 60,555 primary
lines) in canonical order: **exact contiguous match at row 30941, all 7
occurrences in order, heading included, Rahao in its original position.**

**What that proves and does not.** RT-005 established that Open Granth declares
`source: Shabad OS Database` in all 1,430 Ang files, so this is a consistency
check *within one lineage*. It confirms the extraction is faithful — nothing
dropped, added or reordered — and **not** that the text is independently
witnessed. Printed-page collation remains the only route to a second lineage.

## Lineage honesty — RT24-C12 and C13

The candidate's own `provenance.comparisonScope` reads: *"Unique full ordered
sequence among entries beginning at the official starting Ang; adjacent pages
establish continuation and boundaries. **Global corpus uniqueness is not
asserted.**"* That declines precisely the overclaim I was watching for. **C12 and
C13 PASS.**

One wording observation, not a defect: the data contract describes `angStart`/
`angEnd` as an "independently witnessed digital page span." The data's own
`comparisonScope` is narrower and more accurate than that phrase. I would retire
the phrase rather than the scoping.

A genuine open question I can state but not settle: SGPC's own digital text may
well be a second lineage, which would make the `officialOriginalSha256` equality
a real second witness for this selection. Whether it is independent of the
Shabad OS lineage is **unestablished — by them or by me** — and I declined to
fetch from `hs.sgpc.net` as a matter of review conduct. The candidate does not
claim it, which is the right posture.

## No invented interpretation

| Check | Result |
|---|---|
| `admitLesson` with a plausible candidate, all three layers | returns **null** — nothing admitted |
| event `lessons` | `{simple:null, detailed:null, learning:null}` |
| "Simple explanation" destination | **"AWAITING QUALIFIED REVIEW"** |
| "Detailed explanation" destination | **"AWAITING QUALIFIED REVIEW"** |
| generated-explanation phrasing anywhere | **none** |
| Gurmukhi nodes on every destination | **constant** — scripture is never hidden by a pending explanation |
| network APIs in `learning.mjs`, `reader.mjs`, `core.mjs` | **0** |
| `eval` / `new Function` / AI endpoints | **0** |

Four destinations render exactly as specified: Original, Simple explanation,
Detailed explanation, Learning. Status line: **"DEVELOPMENT PREVIEW · NOT
RELEASED"**.

## The signature is never passed off as the custodian's

"This is not an SGPC signature" appears in **four** places, including the first
line of `publication-key.mjs` and of `delivery.mjs`. The key id is
`development-a11f39dec6ddf5238bd0a338`, `publicationApproved` is `false`, and
nothing in the rendered page claims SGPC signed or attested anything. **C6 PASS.**

## Rights

| Check | Result |
|---|---|
| provider text or markup stored in the event payload | **none** — every field checked; only two digests, a date and a displayed time |
| official link | plain `<a target="_blank" rel="noopener noreferrer">`; **0** iframe/embed/object |
| explanation routed to | SGPC's own site: "Read SGPC's own explanation on its official site ↗" |
| off-origin requests at runtime | **NONE** |
| license basis | recorded, **with its limits stated**: "Open Granth's MIT licence does not grant blanket permission for its corpus, modern translations or commentary. No recording is hosted, embedded or relayed." |

Linking out for commentary rather than reproducing it is the correct answer to
the copyright constraint, and stating that MIT does not cover the corpus is more
honest than claiming permission.

**RT24-C17 — not independently verifiable by me.** `officialReceiptSha256` is
specified as the digest of a "whitelisted original-only receipt, NOT modern
commentary." The receipt's *input* is not in the application files, so I cannot
confirm what was hashed. I am recording this as unverified rather than passed.

## Private learning

| Check | Result |
|---|---|
| malformed existing store (3 shapes) | `MALFORMED_STORE` returned, **store preserved** in all three |
| bad imports over a **real** saved record (4 shapes) | `INVALID_IMPORT`, **existing learning intact** |
| reflections of 100 / 4,000 / 4,001 / 20,000 characters | **all saved, end marker intact — no truncation** |
| over-limit path in code | refuses with "Nothing was saved", never trims |
| network writes | none |

Every refusal message ends by telling the person their existing record is
preserved. That is the right instinct for private reflection.

**A forward-looking note for the physical-device test, which only the founder can
run.** Saving requires the Web Locks API and **fails closed** without it:
`LOCK_UNAVAILABLE` — "This browser cannot safely coordinate private note edits
between tabs. Saving and importing are unavailable; existing notes remain
readable." Failing closed is the right choice. But it means **if `navigator.locks`
is unavailable in iOS Safari on the target device, private notes cannot be saved
at all.** Worth checking explicitly during iPhone acceptance rather than
discovering it later.

## Containment

- **C22 PASS** — PR #60's reviewed bytes unchanged: both bundles,
  `knowledge/index.html`, `pilot.json`, `scripture.json`, `sukhmani.html`,
  `nitnem/index.html` all byte-identical.
- **C23 PASS** — 15 production pages, 52 scripts, **52 pinned, all recomputed
  valid**, including the new `hukamnama/index.html` at 1/1.
- **C24 PASS** — both new workflows `permissions: contents: read`; zero files
  anywhere carry deploy capability. `hukamnama-prepare-evidence.yml` is
  `workflow_dispatch` with an `amritsar_date` input: manual, artifact-only, no
  auto-publish.
- **C25 PASS** — #58, #59, #60, #47 heads and `main` `a3476ac4` unchanged.

## My own errors in this review

26. Left Python f-string syntax inside a JS template literal; the script would
    not parse.
27. **Two vacuous results I nearly reported as findings.** My first learning
    tests used the wrong record shape, so `saveLearning` refused with
    `INVALID_NOTE`; C20's "existing intact" was comparing `null` with `null`, and
    C21's "end marker missing" reflected my rejected input, not truncation.
    Caught by noticing the store was never written. Re-run with the real shape
    and an injected lock, both criteria passed non-vacuously.
28. Python interpreted `਀` escapes inside a JS regex before the browser saw
    it, producing an invalid expression. Fixed with a raw string.
29. Counted my own page's `<div>` tags as "stored provider markup" when checking
    C15, then re-checked properly field by field.

## Method limits

Synthetic learning records only; no real reader data read or written. **I did not
fetch from `hs.sgpc.net` or contact any custodian** — drafting permission requests
is permitted, contacting is not — so every statement about what the provider
serves is limited to committed evidence. Desktop Chromium only. I have not opened
`docs/DAILY_HUKAMNAMA_CRITERIA_20261126.md` or the evidence record; an addendum
follows. **No qualified-content judgement:** I can verify interpretation is
absent, never that a translation or explanation is correct. No approval, no merge.
