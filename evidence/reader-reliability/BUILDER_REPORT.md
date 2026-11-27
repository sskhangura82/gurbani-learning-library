# Builder evidence — reader reliability, 26 November 2026

Read after independent findings are recorded. This is builder evidence, not independent approval, qualified-content approval or a release decision.

## Candidate and scope

The work starts from frozen PR #56, `389e79baff4016a2ff61d1851908de0bd66beb8f`, on `fix/reader-load-resume-20261126`. The matching rollback branch is `rollback/reader-reliability-base-20261126`. No source merge, production deployment or isolated phone-preview deployment was performed.

The final Sukhmani runtime SHA-256 is `2deaff782567dd7d57bd2d19d37fc47c0242c2faecdea5c0bd15fc4466f04fe9`. Final code, HTML, test and workflow fingerprints are in `20261127T020754Z-final-contracts/summary.json`. The subsequent hosted workflow must identify the committed head explicitly; these local runs identify the actual bytes rather than pretending a working tree already has a new commit.

## Useful behavior demonstrated

### Script loading

The final candidate has 36 classic-script occurrences across five reader pages. Five unchanged-page controls rendered; all 36 altered-script probes were refused. When an entry-reader response was blocked, no scripture rows, successful source-verification state or receipt appeared, and all five seeded synthetic learning records remained byte-identical. Healthy controls required zero uncaught runtime errors.

The explicit HTML-repin control permitted its marker to execute. This records the real boundary: integrity attributes protect scripts relative to trusted served HTML. They do not authenticate the HTML, protect every module import in the library or Knowledge Explorer, or confer scholarly authority. SRI-01 is only partially addressed by this reader-page candidate.

Final script-browser receipts:

- `20261127T020808Z-final-script-browser/summary.json`
- `20261127T020808Z-final-script-browser/reader-sri-browser.log`
- `../reader-sri/2026-11-27T02-08-09-123Z-candidate/report.json`
- `20261127T020808Z-final-script-browser/source-integrity-browser-report.json`

The existing 18 source-integrity browser checks also passed on the final bytes. Their runtime-mutation fixture now intercepts the source global assignment after the valid source script passes SRI; it no longer modifies a reader response that the new pins rightly reject. Served HTML, source scripts and reader scripts stay unmodified in these runtime-verifier cases. Separate cases continue to test network-byte tampering.

### Sukhmani position

The reproduced mechanism is retained in `../sukhmani-resume/`: the old Resume action aligned before removing an in-flow notice, and a queued capture could then save a different visible occurrence. Immediate storage assertions could finish before that callback. The original report's single failed run is not converted into a statistical failure-rate claim.

The repair removes the notice before alignment, cancels obsolete capture, restores reload/cold-history position after layout without writing merely to restore, and permits new reading input to cancel a pending restoration. Fresh entry retains optional Resume. Saved-list intent and the distinct guide state remain intact.

The final focused run demonstrates the selected occurrence both in storage and visibly after settling; UI-created synthetic Punjabi notes/bookmarks survive; subsequent ordinary scrolling still saves; cold history and an observed retained-document return are distinguished. Real wheel input during deliberately delayed font readiness wins over automatic restoration.

Final Sukhmani receipts:

- `../sukhmani-resume/FINAL_VERIFICATION.json`
- `../sukhmani-resume/regression-runs/2026-11-27T02-04-17-684Z/report.json`
- `../sukhmani-resume/existing-suite/20261127T020431Z/sukhmani-browser-verification.json`
- `../sukhmani-resume/IMPLEMENTATION_AND_VERIFICATION.md`

All ten focused checks and all 35 existing Sukhmani checks passed on the final runtime. The latter includes the guide interaction, earlier learning compatibility, import preservation and offline reload.

## Source preservation and existing gates

`preserved-content.json` records 94 protected files compared byte-for-byte with frozen PR #56, with no differences. They include original scripture, teaching, source verification, shared learning stores, article contracts, research records and the existing practice rooms. This is byte preservation, not qualified approval of their contents.

The initial local contract batch is `20261127T015924Z/summary.json`. Three checks failed and remain recorded:

1. The source-refusal VM lacked the browser event API needed by the new early pageshow listener. The fixture now uses a real EventTarget and a loading document; zero model/storage/source-render assertions remain.
2. A Sukhmani test expected old homepage prose. The current library uses a structured catalogue. The replacement checks the unique catalogue entry, target links, complete-24 description and exact source binding.
3. The Nitnem preservation chain stopped before PR #56's two Saved-entry runtime amendments. It is extended through a fixed retrospective parent receipt, then the current explicit repair receipt. Old ledgers and all scripture fixtures remain unchanged.

The latter two failures were reproduced against an extracted, unmodified PR #56 parent in `20261127T020132Z-frozen-parent-check/`. No product defect was hidden by deleting these failures. `library-parent-amendments.json` and `runtime-amendments.json` identify the exact permitted runtime changes and explicitly deny approval.

The final rerun is `20261127T020754Z-final-contracts/summary.json`: source refusal, Sukhmani and Nitnem content/preservation, fixed script inventory, script integrity contracts, service-worker preservation and whitespace checks all pass. The worker contains 85 verified assets and the distinct candidate version `0.20-reader-reliability-20261126-1`. CI retains the full existing reader gates plus the new focused checks and the unified-library/Saved checks.

## Failures and test-instrument corrections retained

The Sukhmani index retains its frozen-source failures, an early note-wait bug in the test, the incorrect wait for a new load event on BFCache return, the intermediate candidate, and the real-wheel regression that failed before its additional repair. Assertions and instruments evolved explicitly; no assertion of unchanged tests across those runs is made. Each focused report records its test and runtime fingerprints.

Earlier SRI baseline and candidate reports remain under `../reader-sri/`; final reports above supersede them for this candidate. All checks used disposable profiles and synthetic learning. Local environment: Node 22.15.0, Playwright 1.62.1, desktop Chrome 158.0.8127.37.

## Limits and next review

- PR #47 is a separate linked-visit repair. It is not integrated or claimed closed here.
- The inherited scroll-and-leave-within-200-ms case remains outside these settled-navigation claims.
- Library and Knowledge module-graph integrity remain outside this classic-reader repair.
- No physical iPhone, Safari, Home Screen, VoiceOver, iPad, Android or airplane-mode acceptance is established.
- No theological, Punjabi, Santhiya, historical, audio-rights or printed-source gate is closed by these tests.
- The latest independent review register at `319266054b0c805c8862af3067866007b5ce7c26` was read after these workstreams were already underway. It separately confirms that PR #47 is not SK-01 and reports a deterministic SK-01 mechanism. This candidate still requires its own independent criteria and findings.

The source main branch and phone-preview main branch remain unchanged. This report requests independent verification of a frozen candidate, not a merge or deployment.
