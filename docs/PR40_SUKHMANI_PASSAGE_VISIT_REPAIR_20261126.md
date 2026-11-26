# R2-X-04 — Sukhmani passage visit follow-up

Builder-tested, separate from the frozen PR #40 candidate. No independent verdict.

Parent candidate: 1470477b5a27a8f975f1efce74443a0e136aa94e.
Working branch: fix/pr40-sukhmani-passage-visit-20261126.
Offline version: 0.14.3-sukhmani-passage-visit-20261126-1.

## Problem and chosen behavior

The existing Explore link to sukhmani.html#ashtpadi-17 can silently replace
a reader's previously saved position. A linked passage is now a temporary
visit. Opening, scrolling, using the visual guide, reloading, following
another fragment, or leaving that visit does not itself save a new
reading/guide position. An explicit sticky notice offers two choices:
return to the saved place, or use the currently visible place as the
new saved reading position. The return action reads the most recent
saved position rather than a stale tab snapshot.

Exact existing occurrence IDs, unit IDs and Ashtpadi fragments resolve
against verified Sukhmani source. Malformed and unknown fragments are
not treated as a new saved position. This change does not invent a
new global canonical ID scheme.

Intentional notes, bookmarks and preferences can still merge during
a visit. The shared writer preserves the latest durable read, guide
and hasGuided fields under the existing write lock; ordinary reader
saves retain their previous behavior. Exports from visits carry
the saved position, not the transient view.

## Test evidence

Desktop Chrome 158.0.8127.37 / Playwright 1.62.1. Synthetic records in
disposable localhost contexts only. A hidden-document signal is
simulated; actual physical device backgrounding is not established.

- 9 new passage-visit browser scenarios passed: Ashtpadi 17 arrival,
  notice geometry/hit-testing and byte-identical saved state; passive
  scroll/guide/reload; return; deliberate adoption; later position from
  a different tab with note/bookmark/preference edits and export; exact
  line/unit/hash history; invalid fragments; first-time visit; real
  service-worker cache with desktop networking disabled.
- 135 existing browser scenarios passed (35 Sukhmani, 18 recovery and
  accessibility, 18 integrity/recovery, 64 Nitnem).
- All 12 Node suites passed, including 13 shared-learning checks
  (one added for the preserve-position option) and 46 integrity checks.

Evidence: evidence/sukhmani-passage-visit-verification.json and the
four existing browser evidence reports. Shared-learning verification
records the new write-lock contract.

## Preservation and release boundaries

Original scripture data, educational content and prior source hashes
unchanged. The existing R5 sharing-module pin initially caught the
intentional runtime modification; the original pin stays unchanged.
The new evidence/claude-review-passage-visit-amendments.json chains the
exact old/new runtime hashes to the earlier ledger. The preservation
tests allow only these named runtime amendments, and continue to
check immutable source and teaching hashes. Rebuilt the offline
manifest with a distinct version.

This is a follow-up against the frozen PR #40 development branch, not
a change to that candidate. Its existing hosted checks are green,
but this follow-up has no hosted result yet. The normal main-targeted
workflow includes the focused test for eventual integration; stacked
draft PRs may not automatically trigger that workflow.

No merge, no QA-site update and no production deployment. No real
notes accessed. No Safari, real iPhone, VoiceOver, print collation or
qualified religious approval claimed. Independent review and release
acceptance still required. CI-S-16, CI-R-07, further offline-cache
recovery, and the canonical knowledge work remain separate.
