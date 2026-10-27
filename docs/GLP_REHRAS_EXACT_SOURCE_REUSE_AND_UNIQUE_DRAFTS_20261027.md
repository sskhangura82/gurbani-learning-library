# GLP-001 · Rehras source-only bridge — exact-source reuse and 27 unique bilingual drafts

**October 27, 2026 · Branch:** `feature/glp-rehras-exact-origin-learning-20261027` · **Status:** source-only candidate, **NOT merged, NOT deployed, NOT religiously approved**, no public family app change.

## Product goal

Continue the existing full Nitnem project without starting another application or publishing outside the established Japji-style Read / Meaning / Study structure. The Rehras Sahib frozen source is a **44-unit, 159-record SGGS+Dasam composite, not yet an independently collated edition**. Its records mix short four-line Chaupai pauris, SGGS hymns concatenated into longer records, an evening Savaiya and Dohira, Anand Sahib excerpts, Mundawani, and a final slok. Source-family, edition and exact original bytes may not be silently mixed.

### Decisive engineering discovery: 132 of 159 original Rehras source records are byte-identical to source text already in this SAME library

| Rehras component | Complete source records | Exactly matched original text & SHA |
|---|---:|---:|
| Rehras Chaupai 25×4 lines (named SGPC-bounded excerpt) | 100 | 100 in Benti Chaupai source candidate |
| Rehras Anand Pauris 1–5, 40 | 32 | 32 in Anand Sahib source candidate |
| Rehras-specific SGGS hymns, evening Pae Gahe Savaiya, Sagal Duar Dohira, Mundawani, final slok | 27 | 0 from either of those same-witness duplicate sets |
| **Total** | **159** | **132** |

**This proof is stricter than similarity/normalization**: each Rehras line is compared to the exact source-unit position in the already-frozen Chaupai or Anand corpus. We demand equal Gurmukhi text, identical SHA-256, correctly declared SGGS/Dasam source family, complete unit-length match, original source SHA self-integrity and no held line. We reject changes to one character, swapped line order, unexpected source edition, forged teaching approval or a misattributed source family. There is no fuzzy match, transliteration-based merge or automatic assumption that different bani variants are equivalent.

### How teaching is reused safely

`tools/nitnem/rehras-exact-source-reuse.mjs` is a pure derivation module that takes source-exact `rehras`, `chaupai`, `anand` source packs and a frozen prior **draft** educational course; it derives new per-Rehras-occurrence English/Punjabi draft notes and Study drafts. The new Rehras IDs and exact source SHA are bound by the subsequent course compiler, while teaching provenance identifies its original source bani and occurrence. Reusing already-authored **drafts** does NOT equal scholarly or religious approval.

- Chaupai's **100 direct line drafts** already exist in course V7 and can be reused after exact-text checking.
- Rehras includes **32 exact Anand occurrences**. Course V7 has direct line drafts on **8**; the following Anand V8 source work has drafted the remaining **24**, but that upstream branch is separately active/uncommitted at this evidence cut. Do not copy or publish from its uncommitted workspace, nor create a competing Anand V8 release. The course-level rule **requires all** 32 source notes before finalizing the complete Rehras package.
- Existing Rehras direct note records `rehras.chaupai-rehras01.line01` and `rehras.anand01.line01` are preserved verbatim; they are NEVER overwritten by a re-used note.
- The prior Rehras course has 14 deep units, including its first Chaupai pauri and first/final Anand excerpt. The 31 exact source-matched units offer **28 additional, fully sourced deep-unit candidates**, while those 3 existing deep units remain untouched.
- `tools/nitnem/rehras-unique-source-drafts.mjs` now contains original, independently drafted English/Punjabi contextual explanations for **all 27 other Rehras digital source records** and **two new deep SGGS studies** (`rehras.sggs07` and `rehras.sggs08`). Combined with 28 exact-source deep reuse and 14 historical deep lessons, this covers all **44 Rehras original units as educational Study candidates** when compiled in the next version.
- An important UI rule: the frozen Rehras source has SGGS records containing multiple original tuks in ONE stored line/source record. Thus the 27 new summaries are explicitly tagged `AGGREGATED_SOURCE_RECORD_EDUCATIONAL_CONTEXT_NOT_LITERAL_TRANSLATION`. Render them *under the corresponding original record* in the Japji-format learning layer, but label them **“Passage context · educational draft,”** not as a certified literal translation of each internal tuk. No new Gurmukhi source is invented.

## Current mechanical evidence, without false completion

`tests/glp-rehras-source-reuse-contract.mjs` — **14 PASS**:
1. Exact frozen Rehras source, 44 units, 159 records and original source SHA.
2. Base historical source and educational V7 learning intact.
3. 31 exact unit matches covering 132 original source lines.
4. 106 safe immediate direct note reuses from V7, **24 explicitly pending Anand V8** source-note reuses.
5. 28 non-duplicating deep unit reuses, preserving 3 existing.
6. 2 historical Rehras direct notes preserved.
7. 27 separate bilingual Rehras-specific source-record summaries with source family and caution.
8. 2 independent deep units `rehras.sggs07` / `rehras.sggs08`, source word presence verified.
9. No confusion of **Pae Gahe evening** with **Sravag Sudh morning** Savaiye.
10. One-character changed source and reordered unit source both fail closed.
11. Any forged prior publication/approval state rejects reuse.
12. Synthetic-only in-memory fixture validates that having all 24 missing Anand source notes yields **130 new direct source-matched Rehras note candidates**, plus the 2 retained originals and 27 unique notes — precisely **159/159 potential educational drafts**. This synthetic placeholder is never exported or served to the reader.
13. Strict final mode refuses a V7 course with the 24 missing Anand notes; no claim that Rehras is ready for release yet.

**Potential final course after canonical V8 integration:** 159 of 159 Rehras source records with bilingual educational context/notes; 44 of 44 deep unit educational candidates; all original source texts/variants unchanged, all new material marked draft, **zero human reviewer approvals**. These are *anticipated* coverage outcomes, not yet compiled live app results.

## Source and interpretive care

- Rehras source edition `sgpc-digital-composite-unreviewed-20261025`: **not independently adjudicated as an authoritative SGPC edition**, despite being digitally hashed.
- SGGS source parts: So Dar, Aasa and Gujri shabads, So Purakh, Mundawani and final slok. Dasam parts: Rehras Chaupai 1–25, **evening Pae Gahe Savaiya** and **Sagal Duar Dohira**. We preserve these family identities in all source descriptors.
- A particularly important distinction is that our separately named expanded 29-pauri Chaupai witness contains Pauris 26–29, **but the Rehras composition only uses its exact first 25-pauri selection**. This bridge does not import the extended source into Rehras.
- Bilingual unique-source notes for SGGS often summarize multiple original tuks in a single frozen record; no unwarranted claim of line-for-line literal translation.
- Historically charged descriptions of other faiths, martial imagery, craving, dependence and claims about relief from suffering are described with attribution and high-care explanations, never as human group hatred, a physical harm instruction, medical advice or proof of clinical cure.
- Qualified Sikh, Punjabi, Dasam/Braj, source-corpus and publication-rights reviews are independent future gates. Read-only CI/Chrome tests can check bytes and displayed provenance, **not truth of religious interpretation**.

## Next authorized engineering step

Await the current distinct Anand V8 source candidate being **committed and independently checked** by its existing owner seat. Then build one new source-linked `course.v9.json` on that exact committed branch, importing these two Rehras data modules, and require all 132 source matches, 130 new exact-reuse notes, 27 unique Rehras-specific notes, 28 deep-reuse units and 2 new SGGS deep units, while the 2 old direct Rehras notes/14 old deep Rehras lessons remain byte-identical. Validate exact original, source-family/edition boundaries, explicit aggregated-context labels in UI, saved learner state, and offline on the real private signed HTTPS invitation. Keep this a **draft review PR**, not public GitHub Pages or final family release; only qualified source/rights/editorial and physical device acceptance may unlock final publication.

**No additional service, model, cost, token, private owner address, personal notes or new deploy is authorized by this source-only packet.**
