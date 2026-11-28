# RT-029 — Frozen criteria for #72 (source-only Farid Salok candidate)

Reviewer: Claude (independent). Frozen: 2026-11-27, **before examining the implementation.**
Candidate: #72, head `ea7186e7127d`, branch `feature/farid-source-only-reader-20261127`,
base `feature/farid-source-intake-20261127` (#65).

## Ground truth established first, from the pinned reference corpus

I queried the pinned Shabad OS corpus **before** opening the candidate, so the yardstick is
independent of what the candidate claims. SGGS section `X63C`, "Salok Fareed Jee",
source_order 41:

| author | line-groups | lines |
|---|---|---|
| Sheikh Farid | **117** | 260 |
| **Guru Arjan** | **8** | 24 |
| **Guru Amardas** | **3** | 13 |
| total | **128** | 297 |

**Eleven of the saloks in the collection titled "Salok Fareed Jee" are authored by Gurus, not
by Sheikh Farid.** That is the well-known interpolation in this collection, and it is the
single most likely place for an attribution error in this candidate.

Separately, Sheikh Farid has **121** line-groups across the whole SGGS against 117 in this
section, so **4 groups sit elsewhere** in the Granth. The builder's own caveat — *"This covers
the numbered Salok collection, not every Farid Ji composition elsewhere in the Granth"* — is
therefore accurate and I can check it.

The builder claims **"all 130 numbered Saloks"**. The reference has **128 line-groups**. That
is not necessarily a discrepancy — printed numbering and line-group segmentation need not
agree — but it must be **reconciled explicitly rather than asserted**.

## Disclosure of prior exposure

I have read the builder's founder update: *"Completed the explicit source-selection record and
added all 130 numbered Saloks through the existing reader, including longer units, original
headings, bookmarks, reflections and offline support. Source differences remain documented."*
I reviewed the Salok Kabir reader (#52) and the knowledge/attribution chain previously, and I
raised **SIG-01**, which is the same class of error as the attribution risk above. I have
**not** opened any file in #72 or #65, nor any builder test or evidence.

## Criteria

### Hard — any failure blocks

| # | Criterion |
|---|---|
| C1 | The eleven Guru-authored saloks inside the collection are attributed to **Guru Arjan** and **Guru Amardas**, not to Sheikh Farid, wherever an author is shown or stored. |
| C2 | The scripture text matches the pinned reference corpus exactly, byte for byte after declared normalization. No silent divergence. |
| C3 | No modernized or regularized Gurmukhi spelling. |
| C4 | Any count claim ("130 Saloks") is either exactly true of what ships or explicitly reconciled against the segmentation used. No unexplained number. |
| C5 | An incomplete or corrupted package does not render as a complete valid composition. |
| C6 | No copyrighted modern translation, commentary or book layout reproduced. |
| C7 | No AI-generated explanation presented as authoritative or as the voice of the Guru or of Farid Ji. |
| C8 | Source selection is recorded, with any discrepancies against other witnesses documented rather than silently resolved. |
| C9 | Original-scripture coverage is reported separately from educational coverage; no blended completion figure. |
| C10 | New scripture files are digest-verified before display, and are present in the offline manifest if offline is claimed. |
| C11 | Synthetic records only; no real reader reflection accessed or exposed. |
| C12 | Nothing deployed, merged or published by this candidate. |

### Soft — recorded, cannot block

| # | Criterion |
|---|---|
| S1 | "Longer units" are handled without truncation or silent merging. |
| S2 | Original headings preserved as headings, not folded into verse lines (the CI-S-01 class). |
| S3 | Bookmarks and reflections survive the collection being added. |
| S4 | The four Farid compositions elsewhere in the Granth are not implied to be included. |

## Method commitments, binding on me

- Findings recorded **before** opening any builder test or evidence for #72/#65.
- Text comparison by digest or byte equality, not by eye.
- Normalization stated explicitly before any comparison, and NFC/NFD checked, so I do not
  repeat errors 26 or 30.
- Where a guard refuses, I will confirm **which** guard and why — the RT-027 T6 lesson.
- `node --check` or an actual run rather than absence of markers — the error 34 lesson.
- I will not claim any device, Safari, VoiceOver or airplane-mode result.
- My reference corpus is **one lineage**. Agreement with it establishes consistency with the
  pinned edition, never textual authenticity. Printed collation stays outstanding.

## Falsifier

If the eleven Guru-authored saloks are correctly attributed, the text matches the pinned
reference exactly, and the count claim is reconciled, then the candidate's scripture integrity
holds and I will say so plainly rather than manufacturing a lesser finding.
