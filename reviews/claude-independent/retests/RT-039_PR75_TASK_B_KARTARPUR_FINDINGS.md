# RT-039 — #75 Task B: Kartarpur historical and editorial source review — independent findings

Reviewer: Claude (independent). 2026-11-27. Criteria frozen in **RT-034** before opening the
editorial packet. **This is the independent source review the packet records as missing.**

## Prior exposure, restated

I verified 6 of the 10 claims earlier today against 5 of 5 cited sources
(`RT-027_ADDENDUM_SOURCE_FIDELITY_VERIFIED.md`) — C2, C3, C4, C5, C6 and C9's chronology.
Those are marked **PRIOR-EXPOSURE** and their verdicts stand rather than being re-derived as
if cold. The fresh work here is **C1, C7, C8 and C10**, the seven narrative paragraphs, the
three editorial questions, and the source register — none of which I had read.

## Instrument: stronger than the request assumed

All four fresh claims rest on **S1, Vaaran Bhai Gurdas Ji, Vaar 1, Pauri 38**. The draft cites
it through the BaniDB web API. I did **not** verify it that way. Vaaran Bhai Gurdas is present
in the Shabad OS database as source `VBGJ`, and that database is the artifact whose digest I
independently confirmed in RT-036 (`517890c7…`). So I verified these claims against a
**pinned, hash-verified offline corpus** rather than a live endpoint — which also satisfies
the standing rule that an HTTP status is never authentication.

Vaar 1 contains 49 pauris; pauri 38 is group `DBW` with **8 verse lines**. The draft
references lines 1–7.

## FB.10 — binding verified before reading content

`node tools/history/editorial-check.mjs` recomputed `packetSha256` from the actual files to
**`0d663e0b8f772c8a35aeb4c6bfbfc64d54ce57a2225257df14cc695397d4680e`** — identical to the
declared value. The draft digest `bd4169a6…` is stated identically in
`docs/history/KARTARPUR_DRAFT_20261127.md` and `evidence/history-two-reviewers/draft-20261127.json`.

**Stated precisely:** the packet digest was recomputed by *their* tool over the real files, so
a tampered input would have changed it; I did not reimplement `draftDigest()` myself. Contract
tests: **52/52** history, **30/30** daily-reading, **no publisher activated**, **zero tracked
files changed**.

## Verdict for Task B

**None of the eleven falsifiers fired.** The four fresh claims are supported at the exact
verse lines cited.

| id | result |
|---|---|
| FB.1 cited source does not support the claim | **did not fire** — 4 of 4 fresh claims verified |
| FB.2 claim stated more strongly than the source warrants | **did not fire** |
| FB.3 invented dialogue, thoughts, scenes, dates | **did not fire** |
| FB.4 imported theology or another tradition's framing | **did not fire** |
| FB.5 Gurmukhi inaccurate or modernised | **did not fire** — none reproduced |
| FB.6 copyrighted translation or commentary reproduced | **did not fire** |
| FB.7 editorial presented as the Guru's authoritative voice | **did not fire** |
| FB.8 disputed point presented as settled | **did not fire** — preserved instead |
| FB.9 scholarly dispute resolved by AI fiat | **did not fire** |
| FB.10 digest mismatch | **did not fire** |
| FB.11 snippet / HTTP status / majority vote as authentication | **did not fire** — see observation 1 |

## FB.1 — the four fresh claims, checked line by line

**C8 (return and change of dress) — supported.** Line 1 names Kartarpur and states the udasi
garb was entirely set aside (`ਭੇਖੁ ਉਦਾਸੀ … ਉਤਾਰਾ`); line 2 states worldly clothes were worn
(`ਪਹਿਰਿ ਸੰਸਾਰੀ ਕਪੜੇ`). Both elements are at the cited lines 1–2.

**C1 (Guru Angad named) — supported, and the scoping is the notable part.** Line 3 contains
`ਗੁਰ ਅੰਗਦੁ`. It also contains the reversed-Ganga image (`ਉਲਟੀ ਗੰਗ`) and `ਸਿਰਿ ਉਪਰਿ ਧਾਰਾ`.
A careless writer would narrate that as an installation scene. The claim says only that the
pauri **names** Guru Angad, and its Limits say in as many words that the draft does not
translate the pauri's imagery into an invented event. **That Limit is load-bearing, not
decorative** — the imagery it forbids narrating is right there on the line. I also checked for
`ਥਾਪਿ` (installation): **absent**, so no installation is claimed and none is in the text.

**C7 (recitation and discussion; Sodar, Aarti, Jap at Amrit Vela) — supported across all
three cited lines.** Line 5 concerns Bani uttered from the mouth (`ਬਾਣੀ ਮੁਖਹੁ ਉਚਾਰੀਐ`);
line 6 has knowledge, discourse and discussion (`ਗਿਆਨੁ ਗੋਸਟਿ ਚਰਚਾ`); line 7 carries `ਸੋਦਰੁ`,
`ਆਰਤੀ`, `ਅੰਮ੍ਰਿਤ ਵੇਲੇ` and `ਜਾਪੁ`. Every named element is present at the cited position.

**C10 (wording difference) — supported on the Bhai Gurdas side.** `ਆਰਤੀ` is on line 7 as
cited, and **`ਸੋਹਿਲਾ` does not appear anywhere in pauri 38** — so the asymmetry the claim
describes is real rather than asserted. S4 Macauliffe is marked **(context)**, not
**(supports)**, which is the correct distinction for a source that supplies the other half of
a comparison.

**A boundary the draft gets right and could easily have blurred:** `ਲਹਿਣਾ` (Lahina) appears
**nowhere** in pauri 38. C4 therefore cites the Encyclopaedia for Bhai Lahina's instruction
and nomination, and C1 cites the pauri only for the name Angad. The narrative keeps the two
apart in the same sentence — the pauri "names Guru Angad too", the Encyclopaedia "places Bhai
Lahina Ji's instruction here". The two are not merged into one sourced claim.

### My own instrument near-miss, recorded

My first pass searched for `ਜਪੁ` and reported **Jap absent** from lines 5–7 — which would have
been an FB.1 finding against C7. The line uses `ਜਾਪੁ`. My search was one spelling too narrow.
I widened it before writing anything, and C7 is fully supported. **An unexpected negative is
the moment to check the instrument**, and that is the second time today the rule earned its
keep.

## FB.3, FB.2, FB.8 — no fabrication, and the caveats are real

Across the seven narrative paragraphs I found **no invented dialogue, no invented thoughts, no
eyewitness scene, and no date, place or number absent from a cited source.** Every concrete
particular carries a claim reference. One sentence declines to go further in as many words —
that the details can be followed without pretending to recover an entire day.

Modal strength matches the sources throughout: "describes", "distinguishes", "places", and for
the pauri's date, that its exact date and manuscript history are separate questions still to
research.

**FB.8 is actively inverted.** The draft states that an early account is not automatically an
eyewitness account, lays out the Encyclopaedia's chronology (Bhai Gurdas 1551–1636; Guru Nanak
1469–1539) and concludes a later generation — and C9 classifies that conclusion as
**"Unverified attribution"** whose uncertainty is "an inference explicitly conditional on the
cited reference's chronology." That is the correct epistemic status for a dated inference drawn
from a secondary source, and treating Bhai Gurdas's Vaaran as eyewitness is one of the easiest
errors in this subject to make.

The Aarti/Sohila divergence is **preserved rather than reconciled**, with the explicit
statement that the difference alone does not prove the accounts describe incompatible
practices, and C10's Limits forbid replacing one title with the other, equating the named
compositions, or building a new daily sequence out of the two. That is "do not silently modify
to reconcile differences" implemented as an instruction to future editors.

## FB.5, FB.6, FB.7 — reproduction, rights, and voice

**No Gurmukhi is reproduced in the draft at all.** The claims reference positions; the text
stays in the source. So there is nothing to modernise and no spelling to drift.

**Every one of the five sources carries the same reuse line — metadata only, no source text,
modern translation, scan or image reproduced — and I verified that this is true.** Not one
quotation from the two copyrighted Encyclopaedia entries, nor from the 2019 SikhRI article,
nor even from Macauliffe, which is public domain and could have been quoted freely. The
register describes what each source says and cites a locator.

The unknown fields are marked unknown rather than filled in: the pauri's composition date "not
established in this intake", its print edition and manuscript basis "not supplied by this
response", the Encyclopaedia web edition carrying no publication date or printed page, and
Macauliffe's "physical edition and scan not collated".

**FB.7:** the document opens by stating it is an AI-assisted draft awaiting source checks,
that no human approval is claimed, and the claim register's preamble says the labels describe
research status, not approval — adding that secondary-source assertions are **conservatively**
marked unverified because the registry has no separate secondary-account class. Conservative
in the safe direction.

## FB.9 — the three editorial questions do not adjudicate anything

They ask the reader to separate what comes from the pauri from what comes from a later writer;
to write their own question before asking what source could answer it; and how two accounts
using different words can both be preserved fairly while investigation continues. **The third
teaches source preservation rather than resolution.** None resolves a disputed matter, and
none asks the reader to accept a conclusion.

## Observations — not findings

**1. The BaniDB numeric verseIds cannot be verified offline, and could drift.** The draft
cites `shabadId 40038` and `verseIds 200334–200341`. Those are provider-assigned identifiers
in an id space the pinned database does not share — its own line ids for this pauri are
`UR4D, R96G, CT7S, UFCX, 21RC, AXFY, J63F, 5GW8`. If BaniDB ever renumbers, a citation would
point elsewhere while still looking valid. **This is not a defect, because the stable locator
is present alongside it** — "Vaar 1, Pauri 38, original verse line N" — and that is what I
verified and what will still be true in fifty years. Worth recording that the stable locator
is the load-bearing one and the numeric id is a convenience.

**2. One rendering for the Punjabi reviewer to confirm, with the exact spot.** Line 2 reads
`ਪਹਿਰਿ ਸੰਸਾਰੀ ਕਪੜੇ`. `ਸੰਸਾਰੀ` is *worldly / of the world*; the draft's narrative renders this
as "the clothes of a householder". Given the contrast with `ਭੇਖੁ ਉਦਾਸੀ` the rendering is
defensible, but "householder" is a specific category (`ਗ੍ਰਿਹਸਤੀ`) and the English imports
slightly more than the Punjabi word carries. **The draft already routes this correctly** —
C8's Limits say the English historical description remains subject to Punjabi and historical
review. I am naming the precise line so that reviewer knows where to look rather than leaving
it as a general caution.

**3. Line 2 also contains `ਮੰਜੀ ਬੈਠਿ ਕੀਆ ਅਵਤਾਰਾ`, which the draft does not narrate at all.**
Restraint worth noting, since it is the kind of phrase that invites invented scene-setting.

## What a clean Task B does and does not mean — for the founder

**What I verified:** that each cited source *says* what the claim attributes to it, at the
exact position cited, against a pinned corpus.

**What I cannot verify, and no amount of review by me will change:** whether the sources are
*correct*, whether the historiography is sound, or whether the presentation is appropriate for
Sikh practice.

**The thing that needs saying plainly.** The packet's only blocking reason was
`MISSING_CLAUDE_CHECKER_SOURCE_REVIEW`. This record removes that reason. What remains is
**ChatGPT as author and Claude as checker — two AI systems in agreement.** The project's own
standing constraint says in as many words: *do not declare unreviewed material authentic
merely because two AI systems agree.* My clean finding list is exactly the input that
constraint warns against over-reading.

The draft's binding statement says it correctly — a digest can bind a review to an exact
manuscript, and cannot establish truth, independence, rights or scholarly qualification. The
records hold the line: `status: WITHHELD`, `humanReview: NOT_PERFORMED`,
`releaseAuthorization: NOT_GRANTED_BY_THIS_TOOL`.

The draft also states that human *authorship* is not a prerequisite, which is the founder's
settled decision and not mine to revisit. **Human authorship and qualified review are
different things.** Nothing in Task B closes qualified Sikh scholarly review, and I am not a
substitute for it. **The remaining gate is the founder's.**
