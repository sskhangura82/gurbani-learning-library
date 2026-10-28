# Full Nitnem V13 — Jaap Sahib Chhands 61–75

**Date:** October 28, 2026

**Source branch:** `feature/glp-jaap-61-75-20261028`

**Status:** Active in the existing private reader as V13. Activated October 28, 2026 at **2:47:25 p.m. PDT** after local, hosting-Mac, exact-commit CI, staging and authenticated HTTPS checks passed.

## Teaching increment

V13 adds **58 English/Punjabi line explanation entries and 15 deeper Study lessons** for Jaap Sahib Chhands 61–75. The established **Read, Meaning and Study** structure continues. The new lessons retain bilingual summaries, close readings, source vocabulary, interpretation care, reflection and teach-back prompts.

The frozen source grouping matters for this batch. Chhand 61 has two longer lines; Chhand 62 includes the prefatory invocation `ਤੇਰਾ ਜੋਰੁ ॥` and four following lines; Chhand 73 has three lines. The remaining chhands have four lines each. The three metrical headings at 62, 64 and 74 stay separate and do not receive extra line-count credit. The explanation for the invocation identifies its prefatory role without moving or renumbering the original text.

| Coverage | V12 | V13 |
| --- | ---: | ---: |
| Jaap explained source records | 228/782 | 286/782 |
| Jaap Study drafts | 60/199 | 75/199 |
| Six additional banis: explained source records | 801/1,361 | 859/1,361 |
| Six additional banis: Study drafts | 187/327 | 202/327 |

These totals count covered source occurrences, including the existing aggregated Rehras records. They do not count unique translations. Japji's original teaching remains separately preserved.

## Source evidence and interpretation

Author research is in `tools/nitnem/jaap-chhands61-67-research.json` and `jaap-chhands68-75-research.json`. Shared comparisons are in `tools/nitnem/jaap-chhands61-75-source-notes.mjs`; the separate assistant review is `evidence/glp-jaap-61-75-source-review.json`.

The frozen comparison ledger contains eight matching groups and seven flagged groups within this batch. Chhand 62 concerns the position of the invocation relative to the heading; 67 and 68 contain spelling differences; 72 and 73 include internal punctuation and grouping differences; 74 and 75 include word-form or addak differences. None is silently corrected. In particular, the stored `ਅੰਬ੍ਰਿਤ` and `ਅਖੱਲ` spellings remain intact, with interpretation distinguished from source-edition resolution.

The phrase `ਸਮਸਤੋ ਪਰਾਜੀ` in Chhand 61 has distinct creation and conquest readings in the consulted commentaries. The selected explanation identifies its basis and retains the alternative. Other passages require care with anger and dissolution, illness and enjoyment, spiritual accomplishment, and the different senses of repeated vocabulary. The lessons preserve the devotional language while avoiding cure guarantees, illness blame, promises of extraordinary powers or permission for cruelty.

Seven repeated phrases retain the main English and Punjabi wording already used in earlier lessons: fearlessness and mystery at 62, birthlessness at 63, honour and abundance at 64, timelessness at 66, and song at 68. Their local explanations and Study contexts still address the new passage.

All teaching remains **`DRAFT_AI_UNREVIEWED`**, with **zero qualified human reviews**. Source comparison and assistant review do not confer an approved translation, santhiya authority, textual approval or public publication clearance. **Anand Pauri 24's teaching remains fully withheld:** all six explanation entries and its Study lesson remain absent, while the disputed source line keeps its existing hold flag.

## Reader and preservation

The Light/Dark controls and saved appearance behavior are unchanged. The silent visual pace remains available up to 200. The active reader change selects the new course and its exact hash; the generated worker includes that course in its separate versioned package.

The V13 contract checks all **801 earlier explanation objects and 187 earlier Study objects** for exact preservation, all twelve earlier course hashes, the six original source packs, source grouping, separate headings, repeated explanations, public Japji files and the existing appearance assets. The actual learning renderer is exercised against every new explanation and Study lesson, including pending-review labels and wrong-hash rejection.

The immutable V13 package contains **44 assets**. Its private gateway retains all **488 earlier extra allowlisted routes** and adds 44 V13 routes, for **532 total**. Historical snapshot preservation is checked separately from synthetic gateway fixtures; synthetic fixtures do not establish preservation of actual historical binaries.

## Verification and private delivery

Local verification passed:

| Check | Result |
| --- | ---: |
| Source, teaching, preservation and actual-renderer contract | 14/14 |
| Independent assistant source and draft checks | 13/13 |
| Light/Dark controller and reader integration | 14/14 |
| Private worker integrity and lifecycle | 7/7 |
| Original Japji regression | 27/27 |
| Shared saved-learning regression | 12/12 |
| Original root service worker | 8/8 |
| Synthetic private gateway | 558/558 |
| Immutable V13 package assets | 44/44 |

The previous V12 course, new V13 course and generated private worker reproduce exactly. The gateway test passed using the automatically reviewed localhost socket exception after the default sandbox blocked socket creation. Its invitations are synthetic; actual historical assets and live access are verified separately during staging and activation.

Course SHA-256: `4d9ba106831d499fdec8982a0c9ec1415f90e64cb86f02a93db0b6096280fdb4`.

Independent source-review receipt SHA-256: `229b27ceb6c19e1f95336b42cacd2fa1f4076681a6528e9879e2e313997c72fb`.

The generated source worker uses `glp-private-nitnem-qa-9eefd3ea55c8a9969a`, with 43 cached assets. Its SHA-256 is `fabf3436781403896e71a2cc51203d507790b1a3a9f23e6c2d5f0de432f6fecf`; the isolated package worker SHA-256 is `e868f5d0a3fa3eb073be0390aa1a4250a59327e4645aba7bbd56b45aa6888b8b`.

The release receipt is `evidence/glp-nitnem-v13-validation.json`.

**Deployed source commit:** `1d4ec287139040d569663a531d1e2dd9261833bf`.

[GitHub Actions run 40774755994](https://github.com/sskhangura82/gurbani-learning-library/actions/runs/40774755994) completed successfully for that exact source commit. The workflow is nondeploying; private activation was performed separately after success.

Hosting-Mac content, appearance, private-worker and synthetic-gateway checks also passed. Staging verified all **532 authenticated extra assets**, including all 44 new V13 files. Actual historical preservation separately verified all **521 previous snapshot files**, all **488 previous extra allowlisted assets**, and the **33 root-manifest assets**. These were compared byte-for-byte; the previous V12 snapshot remains unchanged.

After activation, ten representative assets passed exact-hash checks through both live loopback and the existing HTTPS tunnel. They include the V13 course, reader, worker and appearance assets, plus the previous V12 course. Anonymous requests return 401; the existing invitation returns a 303 redirect to `/nitnem-learning-v13/index.html`. Secure, HttpOnly and SameSite=Lax cookie flags were retained. The temporary staging server was closed after the live checks.

The initial file-write transfer did not complete. The source bundle was subsequently transferred in bounded chunks through the existing authorized process connector, checked against its complete SHA-256, and applied only by a verified fast-forward to the prepared feature worktree. Activation began only after the complete transfer, staging and exact-commit CI succeeded.

This content increment does not introduce a new browser walkthrough. Unchanged appearance assets retain the bounded browser evidence from V11. New teaching receives source, actual-renderer, package and delivery checks; physical iPhone, Safari, VoiceOver and real offline behavior remain unverified.

Deployment preserved the existing invitation, authentication configuration, tunnel and audience. Public/root Japji and public main were not changed. The previous V12 snapshot remains available for rollback. This document contains no invitation token, cookie, private hostname or operational process identifier.

## Continuation

After V13, Jaap has **496 source records and 124 Study lessons** still to draft. Anand's held section adds six records and one lesson, leaving **502 records and 125 lessons** overall. The next contiguous batch is **Jaap Sahib Chhands 76–90**.
