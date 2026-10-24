# GLP-001 · Recording alignment preregistration v0.1

**2026-10-24 · PREPARATORY RESEARCH ONLY.** No audio was collected, recorded, uploaded, downloaded, transcribed, analyzed, shared or published. No external reciter was contacted. No performer consent is implied by the founder's instruction to proceed with planning. The founder has not yet selected a particular J-1 recitation.

## Question and hypothesis

**Question:** Given a lawfully supplied copy of one Japji Sahib recitation and frozen Gurmukhi source text, can we produce **independently reviewed line-boundary timestamps** that make the original Japji Sahib reader follow the reciter's actual YouTube-clock position through pauses, seeking and tempo changes?

Hypothesis: a source-constrained aligner plus a human correction step may produce accurate line-level timing; word-level onset timing is out-of-domain for available models and must be separately measured before offering it. The application must remain truthful for recordings without maps.

**Primary outcome:** line onset error and false positive line glow against hand-annotated ground truth, together with 100% source-hash integrity, rights scope and reviewer signoff. A fast automatic aligner is **not** an acceptable substitute for these conditions.

## Project state at preregistration

- Canonical app: GitHub `main` R7 (`japji-v1-0.9-r7` tag), full original Gurmukhi source including 385 occurrence IDs, all line SHA-256 hashes; site remains https://sskhangura82.github.io/gurbani-learning-library/
- R8 beta YouTube player is **draft PR #7 only**, not a family release. It can ask a viewer to paste a URL and open YouTube's visible IFrame player after user selection; its sync is correctly marked unavailable without a reviewed map.
- Preferred future J-1 source is the founder's own or separately consenting family recording. No recording selected and no processing permission yet. A consenting creator-provided original is equally acceptable.
- Current tool state: a **pure metadata timing validator** in `tools/alignment/alignment-core.mjs` and **synthetic tests only**. No media handling or cloud GPU provisioned.
- YouTube provider APIs: player `getCurrentTime()` gives **where the clip is**, not **which Gurmukhi words are spoken**. Runtime recording-to-Gurmukhi ASR over a YouTube iframe's audio is neither present nor represented as supported. Captions cannot be scraped or downloaded from arbitrary creators under our app.

## Rights and publication gates (hard separation)

**Stage R0 (now):** synthetic timeline tests, canonical source binding, risk register, sample review templates. **No contributor data.**

**Stage R1 (founder act required):** identify a lawful source recording and record scope-limited permission for *off-site alignment analysis*, private retention/erasure conditions, derived time-map research and any public video-ID reference. No public voice/audio rights assumed.

**Stage R2 (source receipt):** obtain original recording file **directly from an authorized person** or human-created timestamps; record SHA-256 checksum, media duration, intended version, language/register, possible background music, coverage, repeating tuks and rights scope. Store any audio/identity/consent **outside the public GitHub repository** in an appropriate controlled workspace.

**Stage R3 (benchmark):** human editor annotates sample line-onset and offset times with an independent review pass. Experiment outputs go into private working files until rights and status are checked. Ground truth file has stable occurrence IDs and strict hash assertions.

**Stage R4 (candidate maps):** perform source-constrained alignment using candidates actually capable of handling Punjabi/Gurmukhi, identify undetected/repeated/commentary sections as `unmapped`, and compare aligners on the exact same legally supplied material. No arbitrary YouTube ripping, audio isolation from embeds, or scraping third-party captions.

**Stage R5 (reviewed map):** independent timing reviewer examines all suspected mismatches, pauses, loops and large onset/offset errors. Reviewer record contains role, date, scope and a map-content checksum. A human who helped align should not be the sole acceptance reviewer. Only checked segments are labeled synchronized.

**Stage R6 (user playback):** under official visible YouTube playback, map `getCurrentTime()` → binary-search checked segments → update highlighted line; pause/seek/ad transitions reconsult playback position rather than a fabricated global speed. Unknown/partially mapped audio never changes the label from unsynchronized to synchronized. Keep a user-visible manual guide fallback.

Publication of derived timing maps, rights attestation and any replay through our own player requires **separate, explicit rights scope**. A file given for private timing research is *not* permission to distribute its voice, even within the family site.

## Exact proposed data contract

A versioned `recording_timings/v1/<opaque-recording-id>.json` contains:
- `schema`, `source.scriptureRelease`, `source.corpusSha256`: pin the map to the exact published text version.
- `recording.recordingId` (opaque); `recording.provenance` (synthetic_fixture/self_recorded/creator_supplied); optional 11-character `videoId` only if the creator's playback matches the lawfully supplied original.
- `recording.contentSha256` (hash of supplied original, never the raw recording); `recording.rights.privateConsentRef` is a **placeholder to a nonpublic record**, not a person name or a file path in a public release.
- `reviewStatus`: synthetic / candidate / line_checked / word_checked. Line/word-checked require an independent reviewer record, and public synchronization requires separate public timing + video-reference permissions.
- `segments[]`, sorted by `startMs` and without overlaps: `kind=mapped` with `occurrenceId`, original-text SHA-256, timing and optional reviewed `wordIndex`; or `kind=unmapped` with a reason intro, commentary, silence, pause, ad or other. Explicit `repeatTake` is required when a reciter repeats the same source occurrence.
- `confidence` is a *candidate model score*, not an ethical/clinical or accuracy guarantee. Unknown interstitials and pauses produce no glow.
- Accepted maps are immutable with a version suffix and content hash; revising a time boundary mints a new candidate/review record.

The accompanying validator is **research-only**: no media file intake, no ASR, no HTTP network, no YouTube secrets.

## Proposed sampling and blind review

For the first single permitted recording:
- Record the intended version and runtime, and mark introduction, non-recitation commentary and repeated sections separately. Avoid assuming the reciter follows the same exact pauri division or does not sing/repeat words.
- Sample at least 30 line boundaries spread across: Mool Mantar/intro, Pauri 1–2, middle recitation, the Suniai 8–11 and Mannai 12–15 clusters when present, later Panj Khand 34–37, and closing Salok. If a recording omits sections, record the omission rather than fabricating alignment.
- At least two people review a subset of the same onsets independently; capture disagreement without hiding it behind an average. Use frame-accurate listening from the **permitted source file**, not the embedded YouTube player's decoded audio.
- Track median absolute onset error, 95th percentile, missed/incorrect source occurrence, false glow during pauses/comments, erroneous order, reviewer time and seek behavior. Do **not** report word accuracy from line-only annotations.
- **Candidate thresholds to validate, not achieved metrics:** initial line onset median <=500ms and p95 <=1500ms; zero confidently incorrect source-line highlights in critical sample; all shipped segments human checked. Word-level onset median <=250ms on held-out human-checked samples, plus explicit p95/false-match criteria to set after pilot.
- Test seek backwards, seek into a long introduction, pause/resume, changing YouTube playback speed, provider buffering, repeated tuks, network loss, ad interruptions and an omitted line. Seek and pause should not advance artificial highlighting beyond player time.

## Aligner comparators (candidate research, not approved capabilities)

- **MMS/CTC alignment** where an actual available Punjabi acoustic model and tokenizer support the relevant Gurmukhi/script. Verify the specific model's language list and source normalization before testing.
- **Montreal Forced Aligner** when a usable pronunciation lexicon/acoustic model for these historical/liturgical forms can be constructed and tested. The comparative paper sometimes cited for MFA's superiority used English TIMIT/Buckeye; it does **not** establish Gurbani accuracy.
- **WhisperX** only if the chosen underlying alignment model supports the actual words/language; recitation quality is an unknown. Otherwise reject before spending compute.
- **Qwen3-ForcedAligner-Ultra is not currently listed as Punjabi-supporting** on its model card. It is **not** admitted as a Punjabi baseline merely because it is recent or multilingual. A new model may enter only by documented language capability and measured result.

The benchmark's job is to rank by **verified time error per recitation**, not reputation or marketing.

## Consent form and privacy contract

See `docs/research/M1_PRIVATE_RIGHTS_INTAKE_TEMPLATE.md`. It contains no submitted personal information; fill it only in an authorized nonpublic environment when J-1 is resolved. The GitHub public repository must not contain any real recording, voice biometric, person-identifying consent, original private file path, API token, privately shared URL, or unreleased timing map.

## Platform restrictions and sourcing

- [Official YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference): video playback position/events, permitted player interaction.
- [YouTube player required functionality](https://developers.google.com/youtube/terms/required-minimum-functionality): genuine visible player, controls and minimum sizes.
- [YouTube developer policies](https://developers.google.com/youtube/terms/developer-policies): no unauthorized audiovisual downloading, extracting, or hidden playback.
- [YouTube Data API search](https://developers.google.com/youtube/data/reference/rest/v3/search/list): as documented October 2026, default 100 `search.list` calls/day in its own quota bucket, costing one unit per call. Quotas must be checked in the actual project before configuration.
- [YouTube caption listing](https://developers.google.com/youtube/data/reference/rest/v3/captions/list) and [download](https://developers.google.com/youtube/data/reference/rest/v3/captions/download): no assumed arbitrary third-party caption permissions.
- [WhisperX paper](https://arxiv.org/abs/2303.00747), [Interspeech 2024 alignment comparison](https://www.isca-archive.org/interspeech_2024/rousso24_interspeech.html): research context only; not evidence of Gurbani performance.
- [Original Gurmukhi provenance](https://github.com/opengranth/open-granth): source hash registered in the project; Pauri 13 line 1 independent digital comparison remains open.

**Exit criteria for this preregistration packet:** zero media processed, a synthetic validation suite passes, timing metadata and rights are distinct, and the next founder question (who supplies an original permitted recitation) is unambiguously documented. The core library and live reader remain unchanged.
