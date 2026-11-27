# RT-027 — Frozen criteria for #71 (Kartarpur source chapter)

Reviewer: Claude (independent). Frozen: 2026-11-27, **before examining the implementation.**
Candidate: #71, head `64fcfd10aeb0`, branch `feature/kartarpur-source-chapter-20261127`,
base `feature/history-claim-registry-20261127` (#68).

## Why this candidate gets the strictest reading in the project so far

Every other candidate I have reviewed handles **scripture**, which is pinned, digest-checked
and verifiable. This one produces **narrative history**, which is none of those things. It is
the first surface where the failure mode is not a wrong digest but a plausible sentence that
nobody wrote down in 1520.

Three standing constraints land directly on it, verbatim:

> "Never invent conversations, quotations, private thoughts, historical details or encounters."
> "Do not invent dialogue, thoughts, eyewitness scenes or historical events."
> "No AI-generated depictions of the Gurus or Sri Guru Granth Sahib Ji, synthetic Guru voices
> or invented sacred historical images."

## Authority of my criteria — stated, because it limits me

**Pass/fail criteria below derive only from the founder's standing constraints and the
project's own existing patterns.** Those are authoritative.

I published a Guru-history research brief earlier today proposing a three-tier evidential
scheme. **That brief is my own authored work and ChatGPT has not reviewed it.** It is
therefore *not* a gate. Where a criterion below rests on the brief rather than on a standing
constraint, it is marked **[RECOMMENDATION]** and cannot fail the candidate.

## Disclosure of prior exposure

I have read ChatGPT's founder update describing this candidate: *"Wrote the first Kartarpur
research draft using five sources and ten individual claim records, with a readable narrative,
source discussion and family questions. AI assistance, uncertainty and differing accounts are
explicitly identified,"* and *"It remains an unreviewed research draft."* I have **not** opened
any file in #71 or #68, nor any builder test or evidence for either.

## Criteria

### Hard — any failure blocks

| # | Criterion |
|---|---|
| C1 | No invented dialogue, speech or quotation attributed to any Guru or historical person. |
| C2 | No invented private thoughts, motives or inner states attributed to any person. |
| C3 | No invented eyewitness scene, sensory description or staged moment presented as something that happened. |
| C4 | No historical event, encounter or detail asserted as fact without a source. |
| C5 | Every substantive historical claim in the narrative resolves to a record in the claim registry; the narrative does not exceed its registry. |
| C6 | No AI-generated or invented depiction of a Guru or of Sri Guru Granth Sahib Ji; no synthetic Guru voice. |
| C7 | No copyrighted modern translation, commentary or book layout reproduced. |
| C8 | Any Gurmukhi rendered is verified against the pinned source digests before display (the EXP-01 standard). |
| C9 | AI authorship is disclosed to the reader, not only in the repository. |
| C10 | Not presented as authoritative, and not as the voice of the Guru; review status visible to the reader. |
| C11 | A contested date or fact is not presented as settled. |
| C12 | No imitation of another tradition's theology, and comparative similarity is not treated as identity of teaching. |
| C13 | Nothing is published to a live reader surface by this candidate. |
| C14 | "Family questions" do not supply answers that the sources do not support, and do not invite the reader to imagine events as fact. |

### Soft — recorded, cannot block

| # | Criterion |
|---|---|
| S1 | Differing accounts are explicitly identified where sources disagree (builder's own claim). |
| S2 | Uncertainty is marked at the level of the individual claim, not only in a global disclaimer. |
| S3 | **[RECOMMENDATION]** Claims separate documented / contested / later-tradition rather than flattening them. |
| S4 | **[RECOMMENDATION]** Janamsakhi-derived material is named as the tradition it comes from, with its approximate date. |
| S5 | **[RECOMMENDATION]** Dates carry their calendar and basis. |
| S6 | No political framing adopted where the historiography is contested. |

## Method commitments, binding on me

- I will record my findings **before** opening any builder test or evidence file for #71/#68,
  and will say so when I do open them.
- I will not treat my own research brief as a gate.
- I can verify that **interpretation is absent** and that **claims carry sources**. I cannot
  verify that a historical claim is **true**, and I will not imply that I have.
- Where a claim rests on a source I cannot reach, I will say the source is unreachable rather
  than call the claim unsupported.
- Punjabi-language sources: I cannot read them. If the draft cites any, that is a limit on my
  review, not a defect in the draft.

## Falsifier

If the draft asserts no historical event without a source, invents no speech, thought or
scene, and labels its own status to the reader, then my concern about this surface was
unfounded for this candidate and I will say so plainly rather than hunting for a lesser
finding to justify the review.
