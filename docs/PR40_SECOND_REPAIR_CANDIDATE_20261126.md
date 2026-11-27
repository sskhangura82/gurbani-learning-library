# GLP-001 — PR 40 second repair candidate

Status: builder-tested development candidate. Independent review pending.
No production deployment or qualified human approval.

Baseline: 09e829efd63e99fc5c3f5f849f122a49b0dc22a9.
Published older-reader test fixture: a3476ac4b9be90dde350fb35dd13ce0b672c120d.
Offline version: 0.14.2-claude-review-repairs-20261126-2.

## Scope
- RT1-01: archive retained Japji learning under an independent key before replacing the v2 state. Merge the archive on current-reader reads/imports, preserve original malformed records, export both records. Test the actual published normalizer and writer, including a second browser tab dropping the inline keptAside field. The archive is not a backup against clearing site data or storage eviction. This repair does not retrofit old versions or protect an unarchived unknown note if an old reader alone handles it before migration.
- CI-R-09: a dedicated recovery notice remains visible during immersive reading. Measured size, viewport position and hit-testing after settling and scrolling for four return scenarios.
- CI-R-08 (backup/recovery portion): an explicit export control remains available on Japji and Sukhmani verification-failure screens. No storage access until invoked; all other reading controls remain disabled and no unverified Gurbani renders. Valid synthetic records can be restored through the verified readers. Invalid records are preserved raw, not represented as automatically repairable. No claim that a normal reload repairs a corrupted offline cache.
- CI-R-11: browser scroll restoration is manual; Japji's own saved-occurrence restore remains in control. Three successive reloads and actual browser Back tested.
- CI-U-11: notes without bookmarks appear in Saved learning, and remain in backup.
- New offline cache version. Original scripture and teaching files unchanged; the initial runtime amendment ledger is unchanged, and a follow-up hash chain records intentional runtime amendments.

## Builder verification
Node: 203 passing checks across 12 suites (including 20 retained learning and 46 source integrity).
Desktop Chromium 158.0.8127.37 with Playwright 1.62.1: 135 passing scenarios (18 repair/learning, 18 integrity and recovery, 35 Sukhmani, 64 Nitnem). Computed accessible names checked for 3,773 meaning buttons. All fixtures and downloads synthetic, in disposable localhost browser contexts.

Evidence: evidence/japji-retained-learning-verification.json,
evidence/review-repairs-browser-verification.json,
evidence/source-integrity-browser-verification.json,
evidence/sukhmani-browser-verification.json,
evidence/nitnem-browser-verification.json,
evidence/claude-review-runtime-followup-amendments.json.

The browser results are desktop emulation, not iPhone/Safari/VoiceOver acceptance. The original production site and separate iPhone test site are not updated by this commit. No independent verdict, printed-edition collation, audio rights, or scholarly approval is claimed.

## Remaining work
CI-S-16 (source-backed displayed-text correction), CI-R-07 (related passage integrity), R2-X-04 (Sukhmani deep link versus saved place), remaining CI-R-08 cache-recovery work and CI-R-10 (unplaceable backup import), qualified review, and physical-iPhone acceptance. Keep PR draft, do not merge or publish. Claude should pin the new head and independently exercise these repairs before reading builder tests, preserving the review protocol.
