# Knowledge pilot: editorial-title attribution repair (RB-01)

Builder candidate only, 26 November 2026. Based on PR #48 at 94f004a842eb1bdf2da879074c2f4c701d54030e, the exact candidate named by the independent reviewer. The reviewer published the acceptance criterion in `reviews/claude-independent/round3b/candidate_findings.json` before this change. PR #49 remains separate and frozen.

## Demonstrated behavior

The original loader accepted the reported scripture heading as an editorial title even with the teaching digest regenerated. The new test reproduced this failure before changing the implementation. Now both language fields must be nonempty strings and cannot duplicate a pinned original line or match the guarded structural-heading forms (including the exact reported heading and common punctuation, spacing and digit variations). A refusal has the named reason EDITORIAL_TITLE_ATTRIBUTION; malformed titles receive INVALID_EDITORIAL_TITLE. Comparison normalization is used only for detection; canonical text is never normalized, edited or re-sealed. Legitimate editorial revisions still work and the original incipit remains the passage name.

The actual browser refuses the entire changed package, even when its editorial checksum is renewed. No knowledge content renders and search stays disabled. The normal pack still opens and retains the existing navigation and dictionary behavior.

## Evidence and limits

- New red-first contract: 72 rejected invalid/attribution fixtures and eight allowed topic-title fixtures, both language fields, 19 unchanged source occurrences. Evidence: `evidence/knowledge-editorial-title/contracts.json`.
- Local Mac Chromium: existing 15 scenarios plus two new refusal scenarios, all passed. `evidence/knowledge-pilot/report.json`.
- Existing knowledge contracts, source registry checks and pinned digital witness test passed.
- `knowledge/scripture.json`, `knowledge/source-lock.mjs` and `knowledge/pilot.json` are byte-identical to the base. No new interpretation, content, rights, or storage behavior.
- The guard is deliberately a bounded syntactic attribution check. It is not a general classifier of every possible heading in the full Granth, nor a qualified assessment of editorial meaning. The future article/comparative engine will need its own typed rendering contract.
- RB-01 is builder-repaired, pending independent verification. RB-02, R3-05–09 and R3-11 remain separately tracked. No claim of physical iPhone, Safari, VoiceOver, human approval or release readiness. No changes to production or the isolated hosted phone build.

Review request: freeze this candidate, independently run the previously recorded RB-01 criterion before reading builder tests, including both title fields and a re-sealed editorial mutation. Confirm valid editorial text remains allowed and the source assets remain unchanged. Record findings before comparing with the builder tests. No merge or deployment.
