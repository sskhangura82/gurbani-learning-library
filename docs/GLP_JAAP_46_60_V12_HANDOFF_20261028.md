# Full Nitnem V12 — Jaap Sahib Chhands 46–60

**Date:** October 28, 2026

**Source branch:** `feature/glp-jaap-46-60-20261028`

**Status:** Content and local release checks passed. Mac, CI and private delivery verification are pending activation; teaching remains unreviewed educational draft material.

## Teaching increment

V12 adds **46 English/Punjabi line explanations and 15 deeper Study lessons** for Jaap Sahib Chhands 46–60. The source contains eight four-record chhands and seven two-record chhands. Longer records can contain several epithets; the explanations address those clauses without splitting the original text or inflating coverage.

| Coverage | V11 | V12 |
| --- | ---: | ---: |
| Jaap explained source records | 182/782 | 228/782 |
| Jaap Study drafts | 45/199 | 60/199 |
| Six additional banis: explained source records | 755/1,361 | 801/1,361 |
| Six additional banis: Study drafts | 172/327 | 187/327 |

These are source-occurrence coverage counts, including the existing aggregated Rehras records. They do not count unique translations or imply a literal translation of every internal tuk. Japji's original teaching remains separately preserved.

The batch retains the established **Read, Meaning and Study** structure. Its themes include Divine independence, light and musical imagery, form and formlessness, power and maternal care, generosity, healing language, spiritual practice, truth, awareness, bliss and hidden nurture. Each Study includes a bilingual summary, close reading, source vocabulary, interpretation care, reflection and teach-back prompt.

## Source evidence and interpretive limits

Author research is recorded in `tools/nitnem/jaap-chhands46-52-research.json` and `jaap-chhands53-60-research.json`. The combined source notes are in `tools/nitnem/jaap-chhands46-60-source-notes.mjs` (16 references and 19 source checks). The separate assistant review, `evidence/glp-jaap-46-60-source-review.json`, passed 13 bounded checks and found no remaining draft-content blocker. This is assistant review, not qualified scholarly approval.

The frozen comparison ledger records ten matching groups and five unresolved flags within this batch. Chhand 54 has a conjunct-spelling difference. Chhands 55 and 56 have punctuation and grouping differences. Chhands 59 and 60 include short-vowel or word-form differences that can affect grammatical interpretation. These remain visible research questions; the draft does not correct the original Gurmukhi or treat comparison agreement as textual approval.

The selected explanations distinguish difficult terms rather than blending every possible sense into one. They retain alternatives for such language as `ਪਾਨ`, `ਪ੍ਰੇਤ/ਅਪ੍ਰੇਤ`, `ਰਾਗ`, `ਸਨਾਨੇ` and attainment-related vocabulary. Illness language is explained as devotional praise, without a guaranteed cure or judgment of the reader's faith. Ritual and spiritual-power vocabulary is historical interpretation, without a promise of results. Martial imagery is read alongside knowledge and care, without treating it as permission for cruelty.

The repeated sun address in Chhands 46 and 47, and honour address in Chhands 46 and 56, have identical main English and Punjabi explanations. Their original source hashes and contextual notes remain distinct where appropriate.

All teaching remains **`DRAFT_AI_UNREVIEWED`**. Qualified human reviews remain **zero**. This work does not establish an approved translation, santhiya authority, source-edition approval or public publication clearance. **Anand Pauri 24 remains fully withheld:** six explanations and one Study lesson await correction of its disputed text.

## Reader and preservation

The Light/Dark controls, sticky header, saved appearance preference and theme behavior are unchanged from V11. The silent visual pace still reaches 200. The runtime change is limited to selecting the new course and its exact hash, together with the corresponding generated worker manifest.

The V12 contract checks all 755 earlier explanation objects and 172 earlier Study objects for exact preservation, all eleven earlier course file hashes, the source manifest and six original packs, the public Japji files and the existing appearance assets. The actual learning renderer is exercised against every new source record and Study lesson, including wrong-hash rejection and pending-review labels.

The separate V12 package contains 43 assets in its own cache namespace. Its gateway retains the existing 445 extra allowlisted routes and adds 43 V12 routes, for 488 total. Historical snapshot preservation is checked separately from the gateway's synthetic fixtures; a synthetic fixture is not proof of a historical binary.

## Verification and delivery

All local checks below passed. The local sandbox initially prevented the gateway test from binding its loopback socket; the same bounded synthetic test passed with the required execution permission. Mac, CI and private HTTPS outcomes are pending. The detailed release receipt is `evidence/glp-nitnem-v12-validation.json`.

| Gate | Count | Local result |
| --- | ---: | --- |
| Source, teaching, preservation and actual renderer contract | 14 | PASS |
| Shared Light/Dark behavior and saved-learning isolation | 14 | PASS |
| Private worker lifecycle | 7 | PASS |
| Original Japji reader/data | 27 | PASS |
| Shared learning | 12 | PASS |
| Original service worker | 8 | PASS |
| Synthetic private gateway | 514 | PASS |
| Immutable V12 package | 43 assets | PASS |

The V11 and V12 courses and the generated private worker reproduce their recorded bytes. These suites overlap; they do not establish qualified religious review or physical-device acceptance.

- **Course SHA-256:** `431642c41ce9634643f115737d63dd6067a2c2fe16eba7a29302134ce41e3d3b`
- **Versioned worker SHA-256:** `583efbf287b44bc7fa0239a25ac1ead6282bcc962c0f08e0fc155f0a94de5a0b`
- **Cache namespace:** `glp-nitnem-learning-v12-review:`


This content increment does not introduce a new browser walkthrough. The unchanged appearance assets retain their bounded V11 browser evidence; the new teaching receives source, rendering and package checks. Physical iPhone, Safari, VoiceOver and real offline behavior remain unverified.

No invitation token, session cookie, private hostname or operational process identifier belongs in this document. Deployment will preserve the existing invitation, authentication configuration, tunnel and audience, and retain the previous snapshot for rollback.

## Continuation

After V12, Jaap has **554 source records and 139 Study lessons** still to draft. Anand's held section adds six records and one lesson, leaving **560 records and 140 lessons** overall. The next contiguous batch is **Jaap Sahib Chhands 61–75**.
