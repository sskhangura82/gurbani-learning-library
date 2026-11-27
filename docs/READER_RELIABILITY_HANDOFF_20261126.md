# Reader reliability candidate — 26 November 2026

Status: builder candidate; independent review and founder decision remain outstanding. No source merge, production release or isolated-site deployment is part of this branch.

## Frozen starting point and ownership

- Parent: PR #56, `389e79baff4016a2ff61d1851908de0bd66beb8f` (`feature/unified-library-v1-20261126`).
- Candidate branch: `fix/reader-load-resume-20261126`.
- Rollback branch: `rollback/reader-reliability-base-20261126`, at the same parent.
- PR #58 remains frozen at `b68e080043bb0b4e5cb3d17977e65c8cd62c15b3`; this work does not amend that candidate or its independent review.
- PR #47 remains separate at `d8202caa1b7761c493f70eb9c13514f9b87f2801`. Its linked-visit behavior is not included or claimed here. Future integration must preserve both behaviors explicitly.

## Scope to review before opening builder evidence

### Reader script loading

The five existing reader pages retain their script order and source packages. The candidate pins all 36 classic-script occurrences through browser subresource integrity. The two Salok pages already had pins and remain unchanged. The Japji, Sukhmani and Nitnem HTML changes add the missing pins.

The refresh tool has an explicit inventory and checks every page before writing. It must refuse unknown, omitted, reordered, inline or module scripts. It must also refuse to bless changed frozen source or verifier files. Its default operation checks; writing requires an explicit flag.

An altered script response must not execute. Where an entry reader is blocked, the page must not render scripture or claim completed source verification, and existing browser learning must remain untouched. Unchanged reader pages must still render normally.

This is the reader-page subset of SRI-01. It does not close the finding for the library module graph, protect a replaced HTML document, or establish the service worker as a new trust root. Matching hashes establish expected bytes, not theological or scholarly authority.

### Sukhmani saved place

- Fresh entry with an existing record continues to offer the optional Resume action.
- Resume removes its in-flow notice before aligning the selected source occurrence. A delayed scroll callback from before that action must not replace its position.
- Reload and a cold history return align the stored source occurrence after browser/layout readiness without rewriting the learning record merely to restore it.
- A genuine retained-document history return keeps its existing viewport. Native history scroll restoration remains enabled.
- Explicit reader navigation or genuine manual scrolling during delayed restoration takes precedence over the pending restoration.
- After initialization, ordinary scrolling remains able to save a new place regardless of whether it came from wheel, touch, keyboard, assistive technology, a scrollbar or script. There is no input whitelist for ongoing saving.
- The Saved-list URL intent continues to open the native Saved dialog.
- Notes, bookmarks, guide position, appearance preferences and existing storage formats retain their existing semantics.

No scripture, teaching, source identity, source digest contract, storage schema or shared storage implementation is changed.

## Review ordering

Please freeze your own acceptance criteria, then record independent findings before opening builder test scripts, run receipts, diagnostics or result summaries. The scope above describes intended behavior; it does not report a verdict. The builder's criteria and evidence remain separate from the independent review.

Builder records to consult only after recording findings:

- `docs/BUILDER_READER_RELIABILITY_CRITERIA_20261126.md`
- `evidence/reader-reliability/BUILDER_REPORT.md`
- `evidence/reader-sri/`
- `evidence/sukhmani-resume/`
- Tests added or adapted in this branch.

The pull-request notification intentionally contains no builder outcome summary.

## Boundaries and unresolved work

Physical iPhone, iPad, Android, Safari, VoiceOver and airplane-mode acceptance are not established by this branch's desktop Chromium tests. Existing review and qualified-content gates remain in force.

The inherited case of scrolling and leaving within the 200 ms save debounce is outside the settled-navigation claim. A normal settled Back/Forward check must not be described as proving that rapid-exit case. BFCache must be reported only when the browser actually supplies a retained document and `pageshow.persisted` evidence.

The source-content checks keep their original immutable scripture fixtures. Where legacy checks expect the former home-page wording or an earlier runtime ledger, the test changes identify the frozen-parent failure and extend the runtime history explicitly; they do not replace scripture digests to obtain a pass.

The service worker version is distinct for this candidate. Its complete asset manifest must be reproducible and the existing failed-update preservation check must remain in force. This branch does not deploy it.
