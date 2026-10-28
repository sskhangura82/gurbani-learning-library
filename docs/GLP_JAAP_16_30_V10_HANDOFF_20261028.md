# Full Nitnem V10 — Jaap Sahib Chhands 16–30 handoff

**Date:** October 28, 2026
**Source branch:** `feature/glp-jaap-16-30-20261028`
**Status:** Active private educational preview. Source, preservation, renderer, access and authenticated HTTPS delivery checks passed. Qualified review and physical-device acceptance remain pending.

## Content and coverage

V10 adds **60 English/Punjabi line explanations and 15 deeper Study lessons** for Jaap Sahib Chhands 16–30. Each numbered chhand contributes four source-bound explanations and one Study lesson. The new material continues the existing Read, Meaning and Study structure.

| Coverage | V9 | V10 |
| --- | ---: | ---: |
| Jaap explained source records | 62/782 | **122/782** |
| Jaap Study drafts | 15/199 | **30/199** |
| Six additional banis: explained source records | 635/1,361 | **695/1,361** |
| Six additional banis: Study drafts | 142/327 | **157/327** |

The increase contains newly authored Jaap drafts, with no new reuse occurrences or Rehras passage contexts. Overall counts measure covered source records, including the aggregated Rehras records already present in V9. They do not represent complete literal translation of every internal tuk. Original Japji teaching remains a separate preserved body of work.

The V10 course is `nitnem/learning/course.v10.json`. Its verified SHA-256 is:

`ba32eb65d0592738160ab1cece6e59ca01d608b80026a10ae3c51f80e9a59e28`

## Preservation and editorial limits

All **635 prior explanation objects and 142 prior Study objects are preserved exactly**. Course files V1–V9, original Gurmukhi files and their hashes remain unchanged. This continuation adds educational material without silently correcting scripture or rewriting previously admitted lessons.

**Anand Pauri 24 remains withheld:** six source-record explanations and one Study lesson await resolution of the disputed original text. Its held status is unchanged.

The frozen source comparison records matching verse words throughout this Jaap batch. Chhand 29’s recorded comparison flag concerns heading separation and spacing; its four verse texts match. The metre heading remains separate and is not counted as a fifth explained verse. The broader Jaap source caveat and unapproved edition status remain in force.

All new content remains `DRAFT_AI_UNREVIEWED`, with selective educational paraphrases rather than approved literal translations. Qualified reviewed coverage remains zero. Assistant comparisons and mechanical checks do not establish Sikh/Punjabi scholarly approval or permission for public publication.

## Research and interpretation

The research file, `tools/nitnem/jaap-chhands16-30-source-notes.mjs`, records citation URLs, consultation scope and source checks. It compares Jaswant Singh Neki, Sant Sewa Singh’s Rampur Khera steek, Bhai Vir Singh-derived commentary and selected historical dictionary entries. It also distinguishes an indexed Narain Singh scan from visually inspected material.

Material lexical differences remain visible in the line notes and Study care. Examples include pervasion, beauty and bliss in **ਰੰਮੇ**; caste/clan versus birthless/unfailing readings; time and ending in **ਕਾਲੇ**; and the particularly unsettled **ਸੁਬਨਮੇ**. Chhands 24 and 29 likewise retain alternative senses. New learning prose is original; no modern translation has been imported. Frozen spellings, including Chhand 28’s **ਦਿਆਲੇ**, are retained despite differences in another digital witness.

## Verification and browser status

| Completed verification | Result |
| --- | --- |
| V10 content/preservation contract | 12 passed |
| Private worker lifecycle | 7 passed |
| Original reader/data regression | 27 passed |
| Shared learning regression | 12 passed |
| Original service-worker regression | 8 passed |
| Synthetic private gateway contract | 429 passed |

The separate V10 package contains **39 assets, of which 38 are cached**. The reader UI and learning logic were verified unchanged except for the course path and expected course hash. The suites overlap and are not counts of independently reviewed linguistic claims.

**Browser QA was not rerun for V10.** Earlier attempts established that the managed HTTP preview lacked `crypto.subtle`, while the cloud browser blocked access to the private HTTPS reader. Those limitations were not bypassed. No new browser walkthrough, physical-device or real offline acceptance is claimed.

## Deployment and next batch

The deployment receipt below records the completed private update. This handoff contains no credentials, private hostnames or remote process identifiers.

The next planned content batch is **Jaap Chhands 31–45**. Remaining Jaap coverage is **660 source records and 169 Study lessons**; Anand’s held Pauri 24 adds six records and one lesson. Continue with exact source anchoring, original bilingual prose and explicit interpretive uncertainty.

## Private deployment receipt

V10 became active on **October 28, 2026 at 10:16 a.m. Pacific (PDT)** from source commit `ff807ec0ace9f037bc36fea545d44fc49609e03e`. The existing invitation now opens `/nitnem-learning-v10/index.html`. Authentication configuration, cookie protections, access duration, tunnel and public Japji deployment remain unchanged.

All **397 files** from the previous immutable snapshot were retained byte for byte, including its **364 extra allowlisted assets** and **33 root-manifest assets**. The candidate adds **39 files**, producing **403 extra routes**. Authenticated staging requests returned the expected bytes for every one of those 403 assets. Live loopback and HTTPS requests then verified the V10 index, reader, course and scoped worker, plus the preserved V9 course. Anonymous access returned 401; invitation exchange returned the intended 303 redirect.

GitHub Actions run `40733967704` completed successfully for the deployed source commit. The retained V9 snapshot and gateway remain available for rollback. Browser and physical-device verification limits stated above still apply. The sanitized evidence is `evidence/glp-nitnem-v10-validation.json`.
