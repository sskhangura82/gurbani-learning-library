# RT-012 — PR #51, complete Salok Mahalla 9 reader: findings

Candidate `50ba6e1750963573b1ba7d50d54100fab2856e50`. Criteria frozen in
`RT-012_FROZEN_CRITERIA_PR51.md` before I opened the implementation. Exposure
disclosed there, and it was substantial — this collection's digest arithmetic was
already verified by me as a dependency of PR #55.

## Verdict: PASS, with one finding (ANG-01) and one demonstrated pre-existing weakness (SRI-01)

| ID | Criterion | Result |
|---|---|---|
| RT12-C1 | 117 occurrences identical to my reference | **PASS — 117 / 117** |
| RT12-C2 | complete and correctly ordered | **PASS** |
| RT12-C3 | boundary claims hold | **PASS** |
| RT12-C4 | no silent modernisation; danda preserved | **PASS** |
| RT12-C5 | every stored digest matches its text | **PASS — 0 mismatches** |
| RT12-C6 | no existing pin removed or loosened | **PASS** |
| RT12-C7 | new pins are genuine constants | **PASS** |
| RT12-C8 | the page's integrity hashes match | **PASS — 6 / 6** |
| RT12-C9 | teaching bound to source, cannot render as scripture | inherited |
| RT12-C10 | damaged scripture refuses | **PASS** |
| RT12-C11 | draft labelling visible | **PASS** |
| RT12-C12 | no Ang asserted as an established locator | **FINDING — ANG-01** |
| RT12-C13 | no claim of qualified review or device acceptance | **PASS** |
| RT12-C14 | existing readers and keys unaffected | **PASS** |
| RT12-C15 | offline shell consistent | inherited |

## Scripture: 117 of 117, with three controls

All 117 occurrences are **identical** to my reference database, section `SO3P`
"Salok Ninth Mehl", after comparison-only punctuation normalisation. The
reference holds exactly 117 lines for this section, which matched the claimed
count before I compared any text.

Three controls, all passing: an unaltered line matches; a line I deliberately
altered is detected; and the reference does carry the editorial pause marks, so
the normalisation is genuinely needed rather than hiding a difference.

Separately, all 117 lines are **byte-exact** in Open Granth, the candidate's
declared upstream — no normalisation needed at all against its own source. So no
Gurmukhi spelling was silently modernised, and the danda is preserved throughout.
Zero fingerprint mismatches.

## The boundary claims hold, and one apparent discrepancy was my own artefact

| Claim | Result |
|---|---|
| Dohra precedes Salok 53 | **verified** — Salok 53's metrical heading is `ਦੋਹਰਾ ॥` |
| Salok 29 spans two Angs | **verified** — its two lines sit on Ang 1427 and Ang 1428 |
| Mundavani Mahalla 5 excluded | **verified** — `ਮੁੰਦਾਵਣੀ` appears nowhere |
| Opening invocation and collection heading present | **verified** — `ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥` and `ਸਲੋਕ ਮਹਲਾ ੯ ॥` |
| 117 occurrences across Ang 1426–1429 | **verified**, see below |

My first Ang pass reported Ang **1425** as well, which would have contradicted the
claim. It was my matching method: I matched text to any Ang containing that exact
line, and exactly one candidate line — the standard invocation `ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥` —
recurs on Angs 1421, 1425, 1426 and 1429. **All 116 other lines have a unique
Ang, and those are exactly 1426, 1427, 1428, 1429.** Ang 1425 is Salok Vaaran Thay
Vadheek by Guru Arjan, a different composition. I checked before reporting.

The per-Ang distribution the builder records — 20, 39, 37, 21 — **matches my
independent count exactly**, derived from the corpus rather than from their file.

## The pin work is correct, and the Ang assertions corroborate my own checking

No existing pin was removed, loosened or made computed. `EXPECTED_LIBRARY`,
`EXPECTED_LEARNING`, `EXPECTED_SOURCE_COMMIT`, `RELEASE` and `NAMES` all survive.
The change adds `SALOK_SOURCE_MANIFEST` and `SALOK_TEACHING` plus collection-scoped
selectors, with the property stated in the code: *"Adding a lesson to Salok
Mahalla 9 never re-seals the existing Nitnem scripture."* An unrecognised
collection id refuses rather than defaulting.

The new pins are genuine hand-written constants, not regenerated from the data
they authenticate. The hardcoded sequence digest `16649b80d412b71d…` is **the
exact value I reproduced independently** from the package earlier today. The block
also hardcodes `unitCount 57`, `originalLineCount 114`, 117 occurrences, 117
unique ids, and the release channel.

And it hardcodes **per-Salok Ang expectations**, including `index===28 →
[1427,1428]` — that is, Salok 29 spanning Angs 1427 to 1428. That is independently
the same conclusion I reached from the corpus. Their structural pin and my
external check agree, which is the most useful kind of agreement.

## The refusal path works, and the outermost layer works better than expected

Control: **114 lines rendered.** Harness proven.

| Mutation | Result |
|---|---|
| One Gurmukhi character changed in Salok 5 | **refused** — "Source SHA-256 verification failed" |
| Same, every in-file digest regenerated as a build script would | **refused** — same gate |
| Same, plus the library entry and the reader's manifest pin repinned | **blocked before any app code ran** |

The third case produced a page with no refusal message, which I investigated
rather than reporting either way. The console gave the answer: *"Failed to find a
valid digest in the 'integrity' attribute for resource `nitnem/reader.js`."*
Repinning required editing `reader.js`, which broke its subresource integrity
hash, so **the browser refused to execute it at all.** That is the outermost
defence succeeding, and it is a stronger outcome than an in-app refusal message.

## SRI-01 demonstrated, not inferred — and it is live on `main`

In the PR #56 review I raised SRI-01: `nitnem/index.html` carries no `integrity`
attribute on any of its six script tags, including the pin-holding `reader.js`,
while the Salok pages pin all six. Here I was able to demonstrate the consequence
directly.

I injected one harmless marker line into `reader.js` and loaded **two pages of the
same build** against the **same tampered bytes**:

| Page | Tampered `reader.js` executed | Blocked by integrity |
|---|---|---|
| `salok-mahalla9/index.html` (pinned) | **no** | **yes** |
| `nitnem/index.html` (no attribute) | **yes** | no |

Identical tampering, identical bytes, opposite outcomes. On the primary Nitnem
reader the modified pin-holding file runs, which means the pins it contains are
whatever the modified file says they are.

This is **pre-existing and not a defect of PR #51** — the attribute is absent on
`main` and on every branch I checked, and this candidate does not touch that file.
Its weight has changed, though: `main` is the published branch and is unprotected,
so this is the live state of the family application today. The remedy is one
attribute per script tag on that page, which the Salok pages already demonstrate.

## ANG-01 — the Ang is correct, and presented without its basis

The page header reads **"Guru Tegh Bahadur Ji · Ang 1426–1429"** as a plain
statement, with no basis note beside it.

The Ang range is **factually correct** within the lineage I can check — I verified
it twice, by unique-Ang analysis and by per-Ang distribution. So this is not a
scripture error.

It is a consistency gap measured against **the project's own later standard**. The
PR #55 article engine deliberately refuses to forward an Ang, carrying the comment
*"A digital locator is not a separately collated printed-page reference"*, and its
register states that no Ang is presented as an independently established locator
with printed collation outstanding. This reader asserts one in its header.

The page is not silent about its limits — it carries "Development preview · Text
compared with two digital sources. Explanations are educational drafts awaiting
qualified review", the same in Punjabi, and "Editorial status: Documented digital
edition; qualified human collation and teaching review pending". The gap is that
the Ang itself sits beside the attribution without that qualification. Recommend
the PR #55 treatment, which is the newer and better pattern. Raised as **ANG-01**,
low severity, not a blocker.

## A correction to my own criticism of the "witnesses" vocabulary

In the architecture review I criticised PR #52's "fourteen pinned witnesses" as
fourteen consecutive pages of one book at one commit, and recommended a rename.
**That criticism does not transfer to this collection, and I want to be precise
about the difference.**

This package's four `witnesses` are likewise four Angs of Open Granth — one
lineage. But it *also* records a genuine `secondarySource`: **"SriGranth, Angs
1426–1429; independently retrieved web-extracted Unicode strings"**, with
`secondaryExactMatches: 117` and `secondaryMismatches: 0`. SriGranth is a
different digital project from Shabad OS and Open Granth. So the page's claim
"compared with two digital sources" is **accurate**, and this collection sits in a
better evidential position than the Kabir one.

Two limits I will not paper over. I have **not verified the SriGranth comparison
myself** — I cannot reach that source from this environment, so it stands as
documented builder evidence, not my finding. And whether SriGranth is a genuinely
independent lineage, rather than another descendant of common modern typesetting,
is a scholarly question I am not placed to settle. The builder's own audit file is
honest about its method: it records the reviewer as *"ChatGPT source-audit agent;
not a qualified human reviewer"*, notes that upstream raw-byte verification was
not performed by it, and states the secondary scope was web textual extraction
rather than page images. `qualifiedHumanReviewCount` is `0`.

## Existing users and existing readers

Every pre-existing storage key is preserved. The one addition,
`glp001.continuous.retained.v1`, is the Japji retained-learning key from the PR
#40 repair chain that this branch contains — not a rename. No existing reader data
or learning file is touched: `js/japji-full-data.js`, `js/sukhmani-data.js`,
`nitnem/data` and the Nitnem course file are all unchanged.

## Inherited rather than re-tested

- **RT12-C9** — teaching bound to source and unable to render as scripture. The
  collection has its own separate `SALOK_TEACHING` pin, and I verified independent
  teaching refusal on the shared mechanism in PR #52. Not separately re-run here.
- **RT12-C15** — offline shell consistency. Verified complete on PR #56, which
  contains this candidate: all 85 manifest hashes matched their bytes.

## Still outstanding and not mine to close

Qualified Sikh scholarly and Punjabi review of this collection's drafts —
`qualifiedHumanReviewCount` is zero. Printed-page collation, still the only route
to a lineage outside digital transcription. Physical iPhone, iPad, Home Screen and
VoiceOver acceptance.

**No approval. No merge. Draft stays a draft.**
