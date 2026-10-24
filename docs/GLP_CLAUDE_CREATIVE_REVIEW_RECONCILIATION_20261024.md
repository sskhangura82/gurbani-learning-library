# GLP-001 — Claude Creative Engineering Review v1: integration and decision record

**Date:** 2026-10-24
**Status:** Coordination synthesis; no new code, consent, merge, deployment, or scholarly approval.
**Source:** Founder pasted the complete 2026-10-23 Claude *Creative Engineering & Product Architecture Review v1* into ChatGPT, including A–J, Scope of Inspection and J-1 through J-5. This document is an integration assessment, not a verbatim archive of the private Claude artifact.

## 1. Decision

**ADOPT DIRECTION WITH EXPLICIT CORRECTIONS.**

The unique goal is one untouched Gurbani source, deeply authored and review-labeled layers, a beautifully continuous reader, optional lawful listening, and eventually source-grounded Simran and Gurdwara experiences. Prioritize the *quality* of lesson teaching and ease of iPhone reading, not volume of features or claims of universal automatic synchronization.

Responsibility remains: **founder** owns consequential product, cultural, rights, access and release choices; **Claude** leads creative architecture and independently reviews substantial UX/educational candidates; **ChatGPT** reconciles source evidence, program decisions and editorial draft production; **Work** implements from one GitHub source; **qualified human reviewers** separately review Gurmukhi, Punjabi, interpretation, pronunciation, musical and institutional authenticity. AI concurrence is not human religious review.

**One candidate/author per subject; avoid two simultaneous implementation branches modifying the same surfaces.** Pre-authorized low-risk engineering fixes can be batched; do not create a founder approval ping for trivial CSS/automated corrections unless scope or release authority requires it. Claude receives meaningful design/editorial review gates, not mandatory re-review of every harmless engineering adjustment.

## 2. Verified state on 2026-10-24

- Source of truth: [GitHub](https://github.com/sskhangura82/gurbani-learning-library) — **public repository**. Public family home: https://sskhangura82.github.io/gurbani-learning-library/. Anyone with the link can open it; the content site is *not access-restricted*. Individual browser notes and reflections are local-only and not in GitHub.
- R7 production `main` commit: `254f3871b785b756208379138dcc17472a3733ff` — merged evidence/documentation snapshot. The underlying **accepted R7 app runtime** was `57d0acdf43b6f4935e159468128ec9a503b5aaa1`. These two IDs are complementary, not a contradiction.
- [R8 draft PR #7](https://github.com/sskhangura82/gurbani-learning-library/pull/7) at `808243c8a2013c1ae9ce26f9dea344cb36fe6b85` remains unmerged. It has a compact Reading menu, opt-in visible official YouTube iframe, honest unsynchronized labels and a reviewed-map validator. Do not publish or say audio/word matching has shipped.
- [Simran/Gurdwara concept PR #4](https://github.com/sskhangura82/gurbani-learning-library/pull/4) remains an unmerged draft. R7 has limited, explicitly labeled preview spaces but not a reviewed full Simran course or licensed place photography.
- 385 Gurmukhi occurrences, 385 bilingual draft meanings and 42 passage-level Study drafts are **draft educational coverage**, with no qualified human approvals. Pauri 13, line 1 independent textual comparison remains open. Current physical iPhone/Safari, Home Screen, VoiceOver and true airplane-mode acceptance remain open.

## 3. Specific integration amendments to Claude's report

**A. Teaching drafts need depth, not wholesale replacement.** Read-only inspection of `js/japji-lessons.js` confirms Pauris 1–4 already have 3–4 vocabulary entries each, named source links, contextual text, interpretative notes, reflection and teach-back fields, though marked `draft` and `humanReviewed=false`. Claude's report was honest that it did not inspect all actual draft text, but “no vocabulary work” is incorrect. Run a data-informed audit: KEEP / DEEPEN / REWRITE / RETIRE with exact textual citations per pauri. Pilot rich line-level Pauris 1 and 2 before bulk writing.

**B. Preserve publisher-status truth.** Founder-approved design/cultural feedback is different from `source_checked` and from `qualified_human_reviewed`. The founder is not automatically a qualified Sikh textual/pronunciation reviewer by virtue of owning the project. Proposed status dimensions: `founder_product_accepted`, `source_verified`, `qualified_reviewed_by_role`, `published_revision`. Never quietly promote AI text or machine citations into religious approval.

**C. YouTube search quota changed.** Current YouTube docs describe **100 `search.list` calls/day by default and one unit per call**, rather than 100 units per search; avoid stale 10,000-unit/100-unit assumptions when recommending backend/credentials. See https://developers.google.com/youtube/data/reference/rest/v3/search/list and https://developers.google.com/youtube/data/getting-started. Do not assume allocations without reading the actual project quotas.

**D. The suggested Qwen ForcedAligner-Ultra does not list Punjabi.** Its own model card lists 11 other languages. Official Qwen3 ForcedAligner likewise does not list Punjabi. Do NOT present Qwen3 Ultra as Punjabi-ready or infer alignment quality from its published non-Punjabi numbers: https://huggingface.co/17slever17/Qwen3-ForcedAligner-Ultra and https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/qwen3_asr.md. The 2024 MFA > WhisperX/MMS result evaluated TIMIT/Buckeye English speech, not Gurbani recitation: https://www.isca-archive.org/interspeech_2024/rousso24_interspeech.html. Construct actual benchmark only from lawfully held Punjabi paath and transcript. Compare capable tools, not fixed brand-name roster.

**E. “Arbitrary-video sync is permanently impossible” is too categorical.** For a random YouTube video where neither audio nor timing may lawfully be accessed, *verified automatic word synchronization is unsupported with current provider constraints*. Creators might lawfully provide separate files, captions or timestamps; provider rules could evolve. Keep an explicit three-state UX: `unmapped` (honest manual guide), `candidate` (internal only), `reviewed_line_or_word` (actual synced claim). Playback availability and sync coverage are separate.

**F. A hidden/minimized YouTube “balcony” conflicts with the official playing-video standard.** Minimum embedded viewport 200×200px, unoccluded standard player controls/branding/ads, and no background-only playback. See https://developers.google.com/youtube/iframe_api_reference and https://developers.google.com/youtube/terms/developer-policies-guide. If the reader enters full-screen Study, either pause provider video with position preserved or maintain a genuinely visible, policy-compliant split layout. Never play it behind an obscuring sheet. Auto-play remains user-initiated only.

**G. Reader access > visual novelty.** A ≤56px dock and receding chrome are design targets, not reasons to conceal Play/Pause, squeeze below readable touch sizes, or break VoiceOver. Default to discoverable controls; optional timed receding only with an always-visible preference. Horizontal swipes supplement, never replace, labeled tappable level controls. “The page is the saroop” should be treated solely as a design metaphor, not a religious equivalence between app and scripture.

**H. M0 release gate: preserve source integrity without gratuitous unrelated holds.** Close Pauri 13 line 1 independent comparison promptly and do not silently change Gurmukhi. Require unaltered hashes as a standard gate for new UI candidates. The *content approval* remains separate from *technical QA*; don't block harmless draft-reader usability improvements indefinitely while expert collation is scheduled, but never call unresolved lines human-verified.

**I. Reuse current data architecture until parity justifies a refactor.** Already versioned `js/japji-full-data.js`, `js/line-meanings.js`, `js/japji-lessons.js` and independent reader code exist. “Every bani is hand-assembled HTML” is a scalability risk, not a verified current defect for multiple banis: only one complete bani currently exists. Before M4, prove one renderer can support a second differently structured bani while keeping Japji byte-for-byte stable. Maintain deep links to existing standalone Pauri 2 page until bookmarks and learning import work under integrated Study.

## 4. Founder decision ledger — no implied approval

| Decision | Recommended default | Present authority and status |
| --- | --- | --- |
| **J-1** First alignment recording | Founder-created or separately consenting family recitation is the simplest rights path; a separately consenting outside reciter is equally valid. Needs original audio or authorized timestamp data, correct version tied to chosen YouTube video if applicable. | **PENDING founder choice.** No recording, request, upload, publication, expenditure or analysis approved merely by selecting an option. Rights scope to be confirmed before ingest. |
| **J-2** Scholar bench | Founder provides cultural/learning/product judgment; recruit qualified Punjabi/Gurbani textual and pronunciation reviewers. Distinct roles and provenance of each approval. | **PENDING** invitations and qualification decisions. No founder endorsement automatically converted to religious seal. |
| **J-3** Gurdwara photography | Founder-shot Fremont/San Jose is an option if respectful/allowed; official rights-cleared Harmandir photos later. Current atmospheric CSS is acceptable meanwhile. | **DEFER** until rights/source review; no public photo ingestion. |
| **J-4** YouTube Data API | Defer credential creation. A compliant curated shelf and external-search + pasted URL remain usable, while policy and rate-limited server/static-key options are evaluated. | **DEFER**; do not create credentials or bill automatically. |
| **J-5** Product name | Keep Gurbani Learning Library through family testing. | **DEFER** long-term naming decision until wider public release. |

When J-1 is decided, create a bounded consent/rights intake covering allowed processing, derived timing data, private retention, whether recording may be played within the application or must remain YouTube-hosted, withdrawal/retention boundaries, and manuscript/audio quality checks. No blanket permission assumed.

## 5. Single roadmap with independent lanes

**Lane A — Reader M0, immediate.** Check real iPhone Safari (Read/Understand/Study, dark/Day, dock, 200% Gurmukhi, VoiceOver, Home Screen installed and offline), reduce R8 modal clutter within provider constraints; continuous original source and notes never change. Use existing R7 stable production until a verified PR and actual device acceptance. Do not republish draft R8 just because Chrome tests passed.

**Lane B — Teaching M2, immediate and parallel.** Audit all 42 drafts and existing Pauri 2 original learning; author Pauri 1–2 full lesson exemplars with nine-section conceptual spine, precise words/grammar and attribution of `ਸੋਚੈ` interpretations, two short bilingual levels, contextual link(s), practical reflection and teach-back. Add source-bound machine certificate and open human-review request. Subsequent cluster-by-cluster authoring under the same standard. Never imply all 42 are comprehensive.

**Lane C — Listen M1, preparatory research now, media ingest after J-1.** Complete timing schema/test harness and player-screen QA without access to anyone's recording. When an authorized source is provided, pilot a **single line-level** alignment from one consented recitation; obtain human boundary checks, test pause/seek/ads on iPhone, then expand to two or three recordings. Benchmark actual Punjabi/Gurbani with ground-truth. Word-level follows measured evidence, not promises. Do not assume every video becomes synchronized.

**Lane D — Corpus parity M4.** Only after reader and teaching models stabilize, use a second Nitnem bani as an architecture parity test: same reader UI, source identity and edition metadata. Avoid duplicating application or confusing SGGS Angs for other source collections.

**Lane E — Sacred spaces M3.** The already separated Simran and Gurdwara concepts remain bounded design/editorial lanes. Curate verified Sikh practice texts, role-reviewed instructions, image rights and official broadcasts before wider public claims. Simran is not a stress/medical treatment product, and YouTube video must remain visible when playing.

**Later M5** reviewed word-level timing only when per-recording human-labeled samples justify a declared onset-error gate; long-term wider library, closed-domain librarian and santhiya are separate founder-approved work.

## 6. First proposed Work packet — no new permission required for planning

Create **two bounded reviewable subjects**, not another complete rebuild:

**WO-M0 Reader acceptance**: derive tests from screenshots and current deployed R7/R8 draft; candidate UI remains on feature branch, preserve note locks, add focus/contrast/200% matra/tap-target checks and policy-safe visible video. Require physical iPhone checks before release claims; no code promotion without applicable authority.

**WO-M2 Lesson exemplars**: inspect exact Pauri 1–2 source and existing Study drafts, produce sourced English+Punjabi deeper teaching, content metadata and a one-page verification certificate. Label `draft` and `source_checked` separately. Qualified reviewer involvement separately approved; no fresh scripture transcription.

**WO-M1 Bench preregistration (no recordings yet)**: draft timing-map JSON schema and validator, consent language, benchmark protocol and accuracy metrics, including pauses, repeats, noisy source, ad/seek and tool failure. Avoid source media download, YouTube captions scraping, API credentials or any unapproved provider use.

## 7. Review process

For each substantial candidate: written work order → Work implementation on current-main feature branch → test/citation/visual certificate → Claude PASS / CONDITIONAL PASS / FAIL against named standards → founder's applicable release or rights decision → merge and release receipt, reusing previous rollback. For trivial contained corrections under preauthorized scope, don't force an unnecessary founder ping or complete redesign.

Open red findings: physical iPhone/Safari/VoiceOver/offline; Pauri 13 line 1 independent collation; status and citation quality of all 42 draft lessons; playback rights and video provider compliance; valid timing for first creator-consented recording. No conclusion or AI consensus closes those on its own.

**This document is a coordination synthesis from a user-supplied Claude review, not Claude's verbatim signed original.** It must not be mistaken for scholarly approval or authorization to process voices.
