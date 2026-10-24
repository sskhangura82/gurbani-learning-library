# GLP-001 WO-M0 Reader Excellence — candidate certificate

**Decision: BLOCKED FOR MERGE / PUBLICATION. Candidate review only.**

Date: 2026-10-24. ChatGPT integrates; Claude independently reviews the bounded candidate. This certificate is not founder acceptance or qualified religious review.

## Custody and scope

Built from verified main `254f3871b785b756208379138dcc17472a3733ff`, following WO-M0 in PR #8 (`4837d8aa0704e155cbebb662387ef769953660fa`). Accepted runtime is R7 commit `57d0acdf43b6f4935e159468128ec9a503b5aaa1`. Candidate branch: `feature/glp-m0-reader-excellence-20261024`. No merge or deployment has been performed.

The R7 home, Gurdwara and Simran navigation, editorial drafts, original source and shared-learning implementation are preserved byte-for-byte. No R8 YouTube code, media ingestion, artificial voice, recording alignment, M1 timing work or M2 lesson changes enter this candidate. The grouped menu concept from PR #7 was selectively implemented against R7; PR #7 was not merged.

## Changes

- Six controls in one 54px dock (safe area excluded): Play/Pause, current location, Read/Meaning/Study and expand. Location remains visible at 320px; R7 hid it below 370px to accommodate a pace shortcut.
- Four grouped Reading essentials: Jump, Saved learning, Appearance and Pace. Passage actions sit in a native disclosure. Explore and Library home remain one tap away in the menu.
- Pace uses a native modal with keyboard focus, range 50–160 and an explicit unsynchronized visual-guide label. Escape/close restores the source anchor and focus to the visible dock.
- Scripture size extends from 30px default to 60px (200%). End-of-tuk pairs stay together where they fit and can wrap at the largest size rather than exceed the column. Source characters, token indices and hashes are untouched.
- Study location now identifies the draft's own pauri; it previously displayed the following pauri while the lesson filled the viewport. Passage save/start/reflection actions use that pauri's first occurrence. Saved reading anchor format is unchanged.
- Existing immersive reveal, optional persistent controls, glow, themes, silent guide, bookmarks and reflections remain. No horizontal swipe gesture was introduced; existing iOS navigation and VoiceOver gestures are left to the browser.

## Verification ledger

| Gate | Result | Evidence / limit |
|---|---|---|
| Portable regression suite | PASS — 75 checks | `evidence/m0-portable.json`; 27 source/learning + 8 worker simulation + 12 shared-learning simulation + 7 R6 + 12 R7 + 9 M0 |
| Source and draft coverage | PASS | 385 exact Gurmukhi hashes; 385 English and 385 Punjabi short drafts; 42 Study drafts across 42 units / 38 pauris; `evidence/m0-coverage.json` |
| R7 preservation | PASS | 28 unchanged runtime files; `tests/fixtures/m0-r7-preserved-sha256.json` |
| Desktop browser regression | PASS — 88 checks | Real Chrome rendering at CSS viewports; in-page scripted checks are not physical iPhone or Web Locks evidence |
| Keyboard pace / Escape | PASS, informal | End sets 160; Tab reaches increment; Escape closes the native dialog and focus returns to `tools-open` |
| Actual browser R7 → M0 → R7 → M0 | **NOT RUN — BLOCKED** | Available controlled preview is insecure HTTP; no service worker or Web Locks. Four versioned loopback bundles built successfully; not executed in a controlled loopback browser |
| Browser saved-learning write / reload / upgrade | **NOT RUN — BLOCKED** | Insecure preview safely refuses writes without Web Locks. Portable export/import, stale-tab and concurrency contracts pass; no claim of real-browser persistence |
| Physical iPhone Safari / Home Screen / VoiceOver / Dynamic Type / airplane mode | **NOT RUN — BLOCKED** | No physical iPhone available. Exact PR #10 manual matrix included with provenance |
| Independent Claude design review | CONDITIONAL PASS (candidate 1); candidate 2 follow-up pending | Original review and integration decisions are preserved; device/lifecycle gates remain blocked |
| Independent Pauri 13 line 1 comparison | **OPEN** | No source decision or text edit in this UI work |
| Qualified religious / translation review | NOT COMPLETE | All bilingual meanings and Study drafts retain their honest review status |

The two older source contracts were deliberately updated for the new pace placement: R6 checks the retained pace slider instead of a fixed-dock shortcut; R7 checks the numeric shortcut in the Reading menu. They are not reported as unchanged assertions. New M0 contracts cover preserved files, the 60px format/export/import, stale preference protection, dock/menu architecture and media exclusions.

## Visual evidence and limits

Screenshots in `evidence/m0-*.jpg` are **desktop Chrome approximations**, showing the QA frame and its surrounding context. They are not Safari screenshots or evidence of iOS text rendering. The browser suite checks all 385 occurrence strings against the frozen source, all token indices, word bounding boxes at 60px, focus clearance, 9px Read tuk spacing and 38px pauri spacing. Understand retains its established 19px block separation and 5px attachment to meanings. Matra clearance is checked geometrically at 1.9 line-height and visually in samples; comprehensive Gurmukhi typography review and actual iOS rendering remain open.

- `m0-before-r7-menu-320.jpg`: previous tall menu and narrow dock comparison.
- `m0-grouped-menu-390.jpg`: compact grouped Reading menu.
- `m0-day-read-390.jpg`: unboxed continuous Day reading, immersive header.
- `m0-day-understand-390.jpg`: attached English/Punjabi drafts.
- `m0-amrit-understand-390.jpg`: Amrit Vela meanings and scripture.
- `m0-study-390.jpg`: separated Study draft with its own current pauri.
- `m0-large-320.jpg`: 60px / 200% scripture and reachable dock at 320px.

Do not infer OS-level 200% Dynamic Type, global browser zoom, VoiceOver, reduced-motion system settings, physical safe-area geometry or a 20–30 minute iPhone session from these screenshots.

## Open requirements and next acceptance step

Keep this PR draft and unmerged until the actual versioned lifecycle, browser persistence and physical iPhone matrix pass, and the founder accepts the complete candidate. Review any Claude findings and resolve material issues before acceptance. See `M0_ROLLBACK_AND_LIFECYCLE.md` for pinned R7 rollback, test-only fixture commands, downgrade-size caveat and no-data-loss rules. A blocked candidate is never the family release.

Candidate 2 resolves Claude findings D1, D2 and D4; see `M0_REVIEW_DECISIONS.md`. Draft labels remain visible under every meaning, Sources shows the actual candidate identity, and Pace offers an explicit Reading-menu return. The compact label Meaning is mapped explicitly to Understand. Runtime worker version advanced for the changed shell.

## Physical checklist provenance

`docs/acceptance/M0_PHYSICAL_IPHONE_ACCEPTANCE.md` is copied byte-for-byte from PR #10 head `860b7820c164154620a2a729be0729f3461feb00`. Its family URL references identify R7, not an M0 test address. Before running M0 device acceptance, record a controlled candidate URL and verify the M0 runtime/worker; testing the current family R7 release cannot pass M0. R8/video rows in that shared checklist are outside M0 scope. All M0 physical rows remain NOT RUN.

Additional screenshots: `m0-grouped-menu-320.jpg` provides a same-width comparison with R7, and `m0-pace-back-390.jpg` shows the explicit return action. All candidate screenshots are desktop approximations; see the original review for the first-pass findings.
