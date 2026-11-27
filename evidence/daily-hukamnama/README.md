# Daily Hukamnama — builder evidence index

Read independent findings first. These are builder records, not approval, qualified interpretation or physical-device acceptance.

## Candidate and scope

The source-preservation baseline is 44401e35690322fb3dbc29c443bff86d73279fcb. Initial criteria and the imported historical foundation were committed before implementation at 4e2239ed3ea8815dc90a74a8c73b71ec34d34f9e. Local runs before the final implementation commit describe a working tree; the closed application graph records its exact source/bundle bytes. Hosted checks must be tied to the final candidate commit, not inferred from those earlier commit labels.

Current official original-only capture:
- capture-2026-11-27/manifest.json
- sealed-candidate-2026-11-27.json

This accepted sample is a complete digital comparison across Angs 719–720, with no in-app explanatory text. The 26 November archive-only probe is refused and is not an app event. ARCHIVE_20261126_REFUSAL_RESEARCH.json records the exact heading delimiter and spacing differences without normalizing them.

## Primary records

- INGESTOR_20261126.md: source capture, transport, rights/lineage, conservative boundaries and limitations.
- INGESTOR_TESTS_20261126_ATTEMPT2.txt: source importer refusal tests.
- SIGNING_TESTS_20261126_ATTEMPT1.txt through ATTEMPT4.txt: signing acceptance gaps, repairs and later parser/staging checks.
- STRICT_JSON_TESTS_20261126_ATTEMPT1.txt: duplicate-key and structural parsing cases.
- ui/README.md: complete UI evidence and its failed attempts.
- ui/2026-11-27T05-30-32-195Z/report.json: final compact-layout browser run.
- final-local-*/: precommit orchestration logs. Do not treat a successful earlier subset as the final combined check.
- NODE_RESPONSE_CLONE_DIAGNOSTIC_20261127.mjs and .json: deterministic local runtime lifetime investigation, independent of app content.

The final UI report uses fresh desktop Chromium contexts, including browser network emulation for offline checks. It does not represent a physical iPhone, iPad, Safari, VoiceOver, airplane-mode or participant test.

## Initial failures and corrections, retained

The first signing suite identified real gaps: a rehashed receipt Ang or publication time could disagree with the event. Both checks were added. The later staging audit found that unknown fields and contradictory nested evidence could survive signing; strict nested schemas, cross-record checks and duplicate-key rejection now refuse them. The captured original/event bytes themselves were not wrong and were not rewritten to force a match.

The first browser attempt could not find a Playwright-downloaded executable. It was rerun using installed Chrome in a fresh profile. The first offline UI attempt exposed a test-server error: its scoped root path returned 404. The worker correctly refused that incomplete shell; the test server was fixed.

Builder source review found an asynchronous note-reset edge, ambiguous date URL fallback and stale date-address behavior. The reader was repaired and corresponding browser scenarios added. The compact presentation is a later layout refinement, with prior passing reports preserved.

An initial global integrity run occurred while an explicitly requested reader repair was being written. Its frozen source-byte check correctly refused the changed working tree. The hashes/bundle were deliberately regenerated after the implementation stabilized.

The old foundation suite contains a historical UI assertion as well as its source/date contracts. Running it directly against the new connected UI correctly failed that obsolete fixture-only expectation. The original file remains unchanged; the preservation runner now executes it against its pinned historical HTML/reader. New UI behavior is covered by the current suites.

The local Node worker simulation encountered native Response clone garbage collection behavior on Node 22.15 / Undici 6.21.2. A deterministic synthetic diagnostic reproduced it with one, 85 and 97 responses: discarded consumed clones caused the still-live originals to be cancelled; strongly retained native clones preserved every original byte. The simulation now retains the native clones for its lifetime. It still uses native clone/read methods and verifies every cached body hash. Production worker code was not changed. Actual Chromium installation/update/offline checks remain separate evidence.

The first exploratory clone diagnostic did not reproduce the error when a local named clone remained live; the later forced-collection experiment provides the decisive distinction. Both records remain available.

## What this does not establish

A signature and resolving source references cannot establish scholarly truth, a reviewer's qualifications, copyright permission, SGPC endorsement or a successful real-phone experience. The current candidate has no approved in-app explanation, no audio, no automatic publisher and no release approval. A default date with no admitted record stays unavailable; the official source link remains usable.
