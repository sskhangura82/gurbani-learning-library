# Revision 6 acceptance — 2026-10-23

Accepted runtime: `0.9-japji-v1-r6-darbar-6`. Release scope is the Darbar reader refinement, continuing Revision 5. The artifact hashes in `evidence/r6-artifact-manifest.json` bind these results to the final runtime.

| Gate | Result | Evidence |
| --- | --- | --- |
| Frozen scripture and editorial coverage | PASS: 385 original occurrences, 385 exact hashes, 385 English and Punjabi drafts, 42 Study drafts | `evidence/r6-coverage.json`; 42 per-unit rows |
| Portable regression tests | PASS: 53 checks | `tests/verify.mjs`, `service-worker.mjs`, `shared-learning.mjs`, `r6-contract.mjs`; CI |
| Browser reader interactions | PASS: 47 checks | `evidence/r6-browser-checks.json` |
| Reduced-motion branch | PASS: 8 checks | forced fixture; not physical OS switch |
| Final 31-minute session | PASS: 31.000005 active visible minutes, zero failures, zero visibility interruptions, all 385 original nodes stable | `evidence/r6-long-session-final.json` |
| Independent design review | PASS DESIGN | `docs/CLAUDE_R6_DESIGN_REVIEW.md` |
| Actual versioned HTTPS upgrade and rollback | PASS: final R6 → R5 → R6; all three synthetic learning generations and original preferences retained | `evidence/r6-https-final-lifecycle.json` |
| New R6 reflection across downgrade and return | PASS | `evidence/r6-final-rollback-new-note.json`, `r6-final-return-new-note.json` |
| Cached load after fixture removed from server | PASS: 385 occurrences and synthetic learning retained; server HTTP 404 checked independently | `evidence/r6-qa-origin-removed.json`, `r6-https-final-lifecycle.json` |
| Screenshot inspection | PASS within desktop viewport scope | `docs/screenshots/r6/README.md` |

The 31-minute run starts near the opening (guide index 2) and reaches index 143 at the deliberately slow test pace. It is not a full real-time reading of all 385 occurrences. Full ordered traversal and all 41 unit boundaries are separate portable checks. An explicit Mool Mantar Start here check is recorded in `evidence/r6-start-mool.json`.

## Open requirements retained

- Physical iPhone/Safari, VoiceOver, Home Screen, Dynamic Type, notched safe-area, physical airplane mode and OS reduced-motion: **NOT TESTED**. No available physical iPhone was represented as a pass.
- Pauri 13, line 1 independent comparison: **OPEN**. No scripture change in this release.
- All meaning and Study drafts: **UNREVIEWED** by a qualified Sikh/Punjabi/santhiya reviewer. Claude's bounded design review is not editorial or religious approval.
- Horizontal gestures deferred pending iOS navigation and VoiceOver testing. Accessible depth buttons remain supported.
- R6-only persistent-page-controls preference may need reselection after an R5 downgrade. Existing saved learning and original preferences passed the actual lifecycle.

Acceptance does not convert these open items into passes. The user explicitly authorized promotion after available verification while recording unavailable physical-device checks. Preserve R5 tag `japji-v1-0.9-r5` and the previous Mac release. Only the accepted runtime should replace the root family reader; no concept room is part of this release.
