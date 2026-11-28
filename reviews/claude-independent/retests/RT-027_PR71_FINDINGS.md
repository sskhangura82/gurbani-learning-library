# RT-027 — #71 Kartarpur source chapter: findings

Reviewer: Claude (independent). Date: 2026-11-27.
Criteria frozen at commit `c371460` **before** examination. Candidate head `64fcfd10aeb0`.

> **These findings were written before I opened any builder test or evidence file for
> #71 or #68.** An addendum will follow once I do, and will say so.

## Verdict: PASS, 14 of 14 hard criteria. My falsifier fired.

I froze this falsifier in advance:

> "If the draft asserts no historical event without a source, invents no speech, thought or
> scene, and labels its own status to the reader, then my concern about this surface was
> unfounded for this candidate and I will say so plainly rather than hunting for a lesser
> finding to justify the review."

**It does all three.** I am saying so plainly. This is the most disciplined candidate I have
reviewed in this project, and it is the one I expected to go worst.

| # | Criterion | Result |
|---|---|---|
| C1 | No invented dialogue or quotation | **PASS** — zero quoted passages ≥15 chars anywhere in the narrative |
| C2 | No invented thoughts or motives | **PASS** |
| C3 | No invented eyewitness scene | **PASS** — and refused explicitly in the text |
| C4 | No event asserted without a source | **PASS** |
| C5 | Narrative does not exceed its registry | **PASS** — exact bijection, see below |
| C6 | No depiction of a Guru or of SGGS | **PASS** — no image files added |
| C7 | No copyrighted translation or commentary reproduced | **PASS** — zero source text reproduced; Macauliffe (1909) is public domain in any case |
| C8 | Gurmukhi verified before display | **NOT APPLICABLE** — the document contains **zero** Gurmukhi characters |
| C9 | AI authorship disclosed to the reader | **PASS** — first line of the document |
| C10 | Not presented as authoritative | **PASS** |
| C11 | Contested facts not presented as settled | **PASS** |
| C12 | No imitation of another tradition's theology | **PASS** — no comparative claim made |
| C13 | Nothing published to a live reader surface | **PASS** — verified three ways |
| C14 | Questions do not invite invented fact | **PASS** — they are source-criticism exercises |

## C5 — the registry bijection, measured

Narrative claim references: C1–C10. Claims defined: C1–C10. **Unresolved references: none.
Defined-but-unused: none.** Source references S1–S5, all five defined.

Narrative paragraphs carrying no claim reference: **four**, and all four are the disclosure
header plus the three discussion questions. **No paragraph asserts historical fact without a
reference.** That is what C5 asked for, met exactly.

## Independent verification of the verse citations

The draft cites a **BaniDB** witness (shabad 40038, verseIds 200334–200341). I checked its
line-level claims against the **pinned Shabad OS corpus** — a different provider — at
`VBGJ` Vaar 1, section `MAKL`, line-group `DBW`, section_order 38, which has 8 primary lines.

| claim | cited locator | what the pinned corpus has at that line |
|---|---|---|
| C8 return, udasi garb set aside, householder clothes | lines 1–2 | line 1 `ਫਿਰਿ ਬਾਬਾ ਆਇਆ ਕਰਤਾਰਪੁਰਿ; ਭੇਖੁ ਉਦਾਸੀ ਸਗਲ ਉਤਾਰਾ`, line 2 `ਪਹਿਰਿ ਸੰਸਾਰੀ ਕਪੜੇ` |
| C1 names Guru Angad | line 3 | line 3 contains `ਗੁਰ ਅੰਗਦੁ` |
| C7 recitation and discussion; Sodar, Aarti; Jap at Amrit Vela | lines 5–7 | line 5 `ਬਾਣੀ ਮੁਖਹੁ ਉਚਾਰੀਐ`, line 6 `ਗਿਆਨੁ ਗੋਸਟਿ ਚਰਚਾ`, line 7 `ਸੋਦਰੁ ਆਰਤੀ ਗਾਵੀਐ; ਅੰਮ੍ਰਿਤ ਵੇਲੇ ਜਾਪੁ ਉਚਾਰਾ` |
| C10 Bhai Gurdas names Aarti | line 7 | `ਆਰਤੀ` is on line 7 |

**All four line-level citations are exactly correct, including the line numbers.**

**What this does and does not establish.** It corroborates **citation accuracy** across two
digital providers. It does **not** establish textual authenticity: both providers may share a
lineage, and the standing constraint is explicit that a provider majority vote is never
sufficient authentication. The draft says as much itself — S1 records that the print edition
and manuscript basis were *"not supplied by this response."*

## The thing that most deserves credit

Pauri 38 line 3 reads, in full, `ਉਲਟੀ ਗੰਗ ਵਹਾਈਓਨਿ; ਗੁਰ ਅੰਗਦੁ ਸਿਰਿ ਉਪਰਿ ਧਾਰਾ` — the Ganga
made to flow backwards. **That metaphor is the single most tempting invention vector in the
whole pauri**, and the draft names the temptation and refuses it:

> "The draft does not translate the pauri's imagery into an invented event."

Line 4, `ਪੁਤਰੀ ਕਉਲੁ ਨ ਪਾਲਿਆ`, touches the succession dispute. It is in the source and is
**not narrated**, and C4's limits say *"No quoted speech or selection scene is
reconstructed."*

This is restraint exercised at exactly the points where restraint is hard, which is the only
place restraint counts.

Three more things done right without being asked:

- **"An early account is not automatically an eyewitness account."** The draft dates Bhai
  Gurdas to 1551–1636 against Guru Nanak's 1469–1539 and draws the generational conclusion
  itself. The arithmetic is in fact **stronger** than the draft claims: 1551 is twelve years
  *after* 1539, so Bhai Gurdas was not alive during the Kartarpur years at all. **Under-claimed
  in the safe direction.**
- **The Aarti/Sohila divergence is preserved rather than reconciled** — *"We preserve that
  difference instead of silently replacing one title with another. The difference alone does
  not prove that the accounts describe incompatible practices."* That is the no-silent-
  reconciliation constraint, applied voluntarily.
- **Macauliffe's colonial framing is named** as *"a review consideration"*, and his
  interpretation of intention is explicitly not adopted. This is the hazard I had flagged
  independently for the martyrdom narratives, handled here unprompted.

It also **does not state Guru Nanak's birth date** — the most contested fact in this subject
area. Whether deliberate or not, the effect is correct.

## C13 — verified three ways

1. The offline manifest at this head has **97 EXPECTED entries and no history or kartarpur
   entry.**
2. `index.html`, `library/app.mjs`, `knowledge/app.bundle.mjs` and `articles/app.mjs` contain
   **zero** mentions of kartarpur.
3. The draft is **absent from `main`** entirely, so it is not on the deployed site.

The document's own claim — *"This document is withheld from the application"* — is accurate.

Forward-looking note, not a defect in this candidate: the repository has a `.nojekyll` file
and no exclude configuration, so after a merge `docs/` would be fetchable by direct URL even
though nothing links to it. The draft's own header labels it unapproved, so a reader reaching
it would be told. Worth a decision before merge rather than after.

## Soft criteria

| # | Result |
|---|---|
| S1 differing accounts identified | **MET** — the Aarti/Sohila divergence, explicitly |
| S2 uncertainty per claim, not global | **MET** — every claim carries its own Uncertainty and Limits |
| S3 evidential tiers **[RECOMMENDATION]** | **SUBSTANTIALLY MET** — Early historical account / Unverified attribution / Traditional Sakhi |
| S4 janamsakhi material named with its tradition **[RECOMMENDATION]** | **PARTIAL** — Macauliffe is classified "Traditional Sakhi" and dated 1909; the underlying janamsakhi editions are explicitly not inspected, which is honest rather than complete |
| S5 dates carry calendar and basis **[RECOMMENDATION]** | **PARTIAL** — basis yes, calendar no; the only dates are CE year ranges from a named source, so the ambiguity does not bite here |
| S6 no political framing adopted | **MET** |

## One observation to pass on, which the builder already named

Every Encyclopaedia-sourced claim is classified **"Unverified attribution"**, and the draft
explains why: *"the current registry has no separate secondary-account classification."*

The consequence is that a well-attributed modern encyclopaedia entry and a genuinely
unsupported assertion **carry the same label**. That under-sells the Encyclopaedia claims and,
more importantly, makes the label less informative where it matters. The builder identified
this themselves, so this is agreement rather than discovery. A distinct class for
"attributed, not independently collated" would fix it. Their schema decision, not mine.

## What I verified, and what I did not

**Verified:** claim/source bijection; absence of quotation; absence of Gurmukhi; verse-line
citation accuracy against a second provider; no reader-surface publication; the generational
arithmetic.

**Not verified, and not claimed:**

- **Whether any historical claim is true.** I can check that claims carry sources and that
  interpretation is absent. I cannot establish historical fact and have not tried.
- **The four web sources' content.** I did not fetch learnpunjabi.org, sacred-texts.com or
  sikhri.org to confirm the quoted locators say what the draft reports. The citations are
  specific enough to be checkable by someone who does.
- **The combined `Draft and linked evidence SHA-256`** (`bd4169a6…`). Its composition is
  defined by the builder's tooling, which I have not yet opened.
- **Punjabi-language review.** The draft asks for it by name. I cannot supply it.
- **The manuscript basis of the Vaar text**, which the draft also leaves open.

## Instrument errors in this retest

None detected. One avoided: I used `[਀-੿]` to test for Gurmukhi, the same range
whose exclusion of the danda misled me in RT-026. Here the question was presence rather than
completeness, so the range is adequate and the result (zero) is not sensitive to it.

Running total: **34**.
