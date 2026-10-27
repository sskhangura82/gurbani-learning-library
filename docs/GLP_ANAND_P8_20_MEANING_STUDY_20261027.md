# GLP-001 · Anand Sahib Pauris 8–20, source-specific bilingual Meaning and deeper Study

**Date:** October 27, 2026. **Source branch:** `feature/glp-anand-pa8-20-bilingual-20261027`. **Status:** Private owner beta, original scripture unchanged, independent Sikh/Punjabi original-edition and interpretive review PENDING.

## Founder request

Continue the **full** Nitnem learning build in the exact proven Japji Sahib format. Do not break the existing one-product library, the saved reflections or the free iPhone reading path. Place short original English/Punjabi explanations directly under each corresponding unchanged Gurmukhi line, and make each one open a deeper passage Study with context, words and grammar, interpretation care, reflection and teach-back. Silent visual reading pace remains adjustable through 200, not an audio/santhiya speed claim. Never fabricate withheld or unwritten teachings.

## Done in this candidate

- **Anand Sahib Pauris 8–20**: **68 newly authored source-specific bilingual line notes**, covering all 68 exact original source occurrences in 13 consecutive pauris. Every one is explicitly an original educational paraphrase draft, **not a reviewed literal translation or a quotation of a published teeka**.
- **13 newly authored deeper Study units** for Pauris 8–20, each with a distinct simple English/Punjabi meaning, substantial close reading tied to that pauri, two words that are actually present in that frozen original source pauri, interpretation care, reflection and a teach-back question. The prior 7 authored Anand Pauri 1–7 deep Study units are unchanged.
- **Anand total now**: 20/40 pauris have full separate deep Study drafts. 71 of 208 original source records have authored direct line meanings (68 new plus the three prior notes at Pauris 1, 2 and 7). The rest remain visibly unwritten; **Pauri 24 `anand24.line03` is still quarantined** because the frozen digital witness includes a disputed U+F03D character. No replacement Gurmukhi or made-up translation has been supplied.
- **Bilingual learning integrity**: all previous 223 additional-bani line notes, all previous 72 deep units, 56 Sohila, 40 morning Savaiye, 116 Chaupai, the exact 385 original Japji line meanings and its 42 Study units are preserved byte-identically inside the next version.
- **Whole six new bani coverage**: **291/1,361 source record line drafts, 85/327 source-specific deeper Study units**; qualified human Sikh/Punjabi approvals are **zero**. Completing all line explanations remains necessary, especially Anand Pauris 21–40, Rehras, and long Jaap Sahib.

## Source custody, theological and interpretation cautions

- Original witness: `nitnem/data/anand.json`, 40 pauris and 208 UTF-8 source line records; source pack SHA from `nitnem/data/library.json` pinned to upstream `373ccc34f4a1c0ccb6ce36654bf6e9574087200f`. It is a **digital source candidate, not yet independently collated against a qualified SGGS reference edition**.
- A new deterministic compiler `tools/nitnem/build-learning-pack-v5.mjs` independently binds all 68 newly written line meanings to exact source occurrence IDs and original per-line SHA-256, rejects held lines, requires source-exact vocabulary for each of the 13 new deep units and refuses duplicates. It also proves the old accepted versioned lesson files are not being overwritten.
- Authored notes contain new wording; no copied Sahib Singh Darpan, SikhRI or modern translator’s extended interpretations are republished. Their external websites are **research sources only**, not alternative reader pages. Anand themes and source text for scholarly comparison: SGGS Angs 917–922, SikhRI Guru Granth Sahib Project; Professor Sahib Singh *Guru Granth Darpan*, if licensed or cited but not copied.
- Pauri 8 emphasizes **grace instead of bargaining**; Pauri 9 names the **unsayable Divine** and Guru/Hukam; Pauris 10–11 address the restless mind and impermanence without disparaging worldly care or family duty; Pauri 12 develops unknowability and Divine presence; Pauri 13 describes **amrit as spiritual** rather than an ingestible medical cure; Pauri 14’s razor-sharp path is **not an act of physical self-harm**; Pauris 15–16 distinguish the Guru’s Shabad from an unrelated night-bani meaning of “Sohila”; Pauri 17’s family purity is **not caste/medical exclusion**; Pauri 18’s Sahaj is **not clinical anxiety treatment**; Pauris 19–20 contrast inner/outer ethical integrity, not actual medical diagnoses or moral condemnation of patients.
- These caveats are attached to the particular underlying original pauris and excerpts. No unreviewed commentary can promote itself to religious authority.

## Mechanical tests and what they do not prove

- **14 source/editorial contract checks PASS:** exact 68 novel line explanations and 13 new deep units, no changes in all historical 223 line notes and 72 deep lessons, original SGGS-source hash and vocabulary alignment, Pauri24 quarantine, no false human approvals, honest coverage 291/1,361 and 85/327.
- **78 isolated real Mac Chrome checks PASS:** exact original 208 Anand rows, 68 Pauri8–20 matching bilingual line notes and 20 authored deep-unit cards, line-meaning tap to exact original excerpt and interpretation care, all older banis and saved 200 guide control, no JS exceptions and source-only offline reading with network blocked.
- **80 existing owner-private HTTPS real Chrome checks PASS:** original signed Secure/HttpOnly/SameSite invitation, exact versioned-source reader, full above regression plus genuinely blocked-network offline Anand, Chaupai, Savaiye, Sohila and Japji. Hostname and invitation are redacted from evidence. **Mac Chrome is not physical iPhone Safari/VoiceOver acceptance.**
- **242 synthetic signed-gateway checks PASS**, including the 218 allowed versioned original-source/teaching assets, intentionally corrupted V5 course digest refusing startup, no anonymous source access, invalid session and no hidden endpoints or unapproved writes.
- Existing root original Japji/learning/service worker regressions remain source-identical. **Native physical iPhone Safari, Home Screen, VoiceOver and real Airplane Mode remain unverified.** None of these software passes is an endorsement by a qualified Sikh or Punjabi scholar.

## Private release and rollback

Source-safe private route `/nitnem-anand/` on the same existing signed-owner HTTPS invitation. Own independent cache namespace `glp-nitnem-anand-p8-20-review:`. Immutable Mac snapshot `~/Library/Application Support/GurbaniLearningLibrary/previews/full-nitnem-anand-p8-20-20261027`, 34 exact SHA-pinned current assets and **218 total old/new allowlisted versioned extensions** under the private manifest `previews/serenity-invite-20261025/full-nitnem-anand-p8-20-extra-sha256.json`. Previous `/nitnem-chaupai/`, `/nitnem-savaiye/`, `/nitnem-sohila/`, `/nitnem-parity/`, `/nitnem-trust/`, root `full-japji.html` and old source-only paths remain protected and available. User notes/bookmarks are never migrated or erased.

**Rollback:** stop only `tests/serve-gated-anand-nitnem.py` on 127.0.0.1:8908, restart `tests/serve-gated-chaupai-nitnem.py` with `previews/full-nitnem-chaupai-116-20261027` and owner-only `full-nitnem-chaupai-116-extra-sha256.json`. Preserve the existing Cloudflare tunnel, public GitHub Pages, original source, personal local browser data and prior package receipts. No public release, GitHub merge, new third-party service or artificial completion status is authorized here.

## Next engineering work

Continue source-anchored line and deep lessons for the **remaining Anand Pauris 21–23 and 25–40**, but retain the Pauri24 hold; do not quietly skip it when claiming completion. Then Rehras (SGGS/Dasam composite with named provenance for each unit) and Jaap Sahib (782 Braj/Sanskrit-heavy lines) before any all-Nitnem educational-completeness claim. Pursue qualified Sikh/Punjabi/Dasam original-edition review and rights collation in parallel. This route is a usable private working learning aid, **not a certified finished Nitnem Gutka**.
