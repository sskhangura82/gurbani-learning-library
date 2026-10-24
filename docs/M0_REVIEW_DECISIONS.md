# M0 independent review and integration decisions

Claude's original read-only review of candidate 1 returned **CONDITIONAL PASS for design; BLOCKED for release**. It is preserved verbatim in `M0_CLAUDE_DESIGN_REVIEW_1.md`. ChatGPT owns the following integration decisions. This document is not a substitute for independent review or device acceptance.

| Finding | Integration decision |
|---|---|
| D1: stale R6 version in Sources | Fixed. Sources and the debug identity use one `READER_VERSION` constant; candidate 2 has a fresh worker version. A browser assertion checks the displayed version against the running identity. |
| D2: draft disclosure disappears below the first meaning | Fixed. Every one of the 385 meaning blocks visibly retains “Draft meaning · tap to explore”, including immersive reading. A regression checks all 385 labels in immersive Meaning mode. No scripture or draft text was changed. |
| D3: Meaning / Understand vocabulary | Retain the compact visible dock label **Meaning** to fit the existing 44px target without smaller type. The accessible name already maps Meaning to Understand. Sources and the QA surface now explicitly say **Meaning (Understand)**. New certificate prose uses the same mapping. Historical work orders and test names retain their original terminology. This is an explicit naming tradeoff, not an assertion that the two strings are identical. |
| D4: Pace has no return-to-menu action | Fixed. Pace now offers **← Reading menu**, matching Appearance. Close/Escape still dismisses the controls and returns to the visible dock; Back returns to Reading. A new browser check covers the Back path. |
| D5: long location titles at 320px | Open device/visual follow-up. Full titles remain available in the accessible name and native title; the visible narrow label may ellipsize. Check Mool Mantar, Opening Salok and Closing Salok at 320px, with VoiceOver and large system text. Do not claim complete title legibility from the Pauri 3 screenshot. |
| D6: automatic immersive mode is unannounced | Defer to the VoiceOver gate. The persistent dock and optional persistent page controls remain. Adding automatic announcements without device testing may interrupt reading; no VoiceOver pass is claimed. |
| D7: 60px cap on R7 downgrade | Accepted documented limitation. R7 has no 60px option; rollback instructions explicitly require reselecting 60px after re-upgrade. No note/bookmark/schema loss is accepted. Avoid adding release-management detail to normal reading controls. |
| D8: secondary disclosure groups passage and display actions | Retained. Its label explicitly names both groups; a second nested menu would add navigation. Revisit with actual device feedback. |
| D9: synonymous unsynchronized-guide wording | Retained as low severity. Every wording explicitly separates visual guidance from recording synchronization; no actual audio is introduced. |
| D10: sequential traversal of 385 meaning buttons | Add to physical VoiceOver/switch/keyboard acceptance. Test navigation between pauris and exit paths; do not infer accessible traversal from desktop DOM counts. |

Candidate 2 regression evidence adds the version, all-line disclosure and Pace Back checks to the full width/size/theme/depth matrix. The actual lifecycle, browser persistence, physical iPhone and independent Pauri 13 line 1 gates remain open. A design verdict never authorizes publication.
