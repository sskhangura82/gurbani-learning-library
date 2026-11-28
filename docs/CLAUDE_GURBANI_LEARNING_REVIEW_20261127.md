# Claude review — Gurbani opening and public psychology

Prepared 2026-11-27 (America/Los_Angeles).

## Review target

This is a separate continuation after PR #75. Finish the current review against its existing head before switching targets. This packet does not update that PR, its review instructions or its branch.

- Stable parent: `68f47ffba4782271651716c71a97bc1825f96f48`.
- Tested application revision: `90b232c39742ef64d817f3273ee4a98218f89486`.
- Continuation branch: `feature/gurbani-learning-next-20261127`.
- Later packaging commits contain evidence and documentation. Confirm their application bytes against `evidence/gurbani-learning/verification/runtime-digests.json` before treating the browser evidence as applicable.
- Current editorial state: AI-assisted draft; actual Claude review pending. Builder tests and other ChatGPT agents are not an independent Claude review.

The user prioritizes Gurbani and open psychology. Concise thematic comparison of the Bible, Quran, Buddhist traditions and Vedas is deferred. Keep that later collection private under the existing simple PIN approach; no work on it is requested by this packet.

## Read first

1. `docs/GURBANI_LEARNING_NEXT_CRITERIA_20261127.md` and `docs/GURBANI_LEARNING_NEXT_HANDOFF_20261127.md`.
2. `docs/SGGS_OPENING_EDITORIAL_SOURCES_20261127.md`, then the actual named original/commentary witnesses.
3. `docs/PSYCHOLOGY_STUDY_SOURCES_20261127.md`, then the four cited primary papers.
4. The new lesson data, three psychology pages, change scope and retained verification summary.

## Gurbani source and meaning review

Review every English/Punjabi paragraph, reflection and source reference at Simple, Detailed and Deep study. The two admitted source groups are DMP (invocation, Jap heading, opening Salok, Pauri 1; ten rows) and LLL (Pauri 2; six rows), from `shabados-5.0.0-next.0-SGGS-SSA2`.

- Check complete clause coverage, source-row ownership and Punjabi/English alignment. Do not infer semantic completeness from a structural coverage test.
- Check named differences concerning ਸੋਚੈ, the last clause of Pauri 1, and the suffering/joy and rebirth clauses of Pauri 2 against the actual linked witnesses.
- Check the boundaries among original text, commentary, unresolved interpretation, personal reflection and psychology. Source group ownership must not settle disputed doctrinal, recital-boundary or authorship questions.
- Check that simple language does not turn Hukam or haumai into an unqualified modern self-help claim, clinical statement or instruction to accept mistreatment.
- Check citation sufficiency, correct edition/translator attribution and original paraphrasing of modern commentary.

## Psychology review

Review `psychology/intellectual-humility.html`, `attention.html` and `emotion-regulation.html` against their primary papers and exact locators. Check sample descriptions, study designs, associations versus causal results, strategy choice versus effectiveness, and transfer beyond the study setting. Check that the optional questions are newly authored and not copied assessment instruments. The current prose is English with Punjabi topic headings; it is not a full bilingual psychology curriculum.

## Engineering review

Inspect `verifiedSourceIdentity()`, the independent admission table in `lesson-core.mjs`, DOM rendering in `learning.mjs`, closed-bundle/SRI changes and the bounded preservation scope. Check stale/foreign/unverified source rejection, ordered coverage at every depth, refusal of fabricated review status, local optional-teaching failure, original-text preservation, public/private separation and saved-learning preservation.

Retained verification: 50 integrated contract checks, 16 full-source core checks, 25 new learning Chrome scenarios, 35 source-reader scenarios, 10 navigation scenarios, seven real service-worker/offline scenarios and nine simulations. Counts overlap. Actual desktop Chrome evidence is not physical iPhone/Safari/VoiceOver acceptance.

## Review output

Return findings with severity, exact file/lesson/section, source evidence, a proposed correction and the revision reviewed. Distinguish checks you performed from checks you only read. Explicitly identify any remaining uncertainty rather than converting it to approval. Do not publish, merge or mark lesson metadata reviewed as part of a read-only review. A separate mandatory human-review gate is not requested.
