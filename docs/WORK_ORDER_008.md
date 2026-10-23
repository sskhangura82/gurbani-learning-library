# GLP-001 Work Order 008 — Darbar Reader Polish & Future Sacred Spaces

Status: Work-ready source-controlled handoff. Founder accepted direction 2026-10-23.
Authoritative stable family site: https://sskhangura82.github.io/gurbani-learning-library/full-japji.html
Repo: https://github.com/sskhangura82/gurbani-learning-library
Current production baseline for remaining work: Revision 5, commit c1bc7c90ef172509edd6dc7b206bc6b8f2a6a9ec (Revision 4 commit 924cd58b57483e8a26b14cf185e328823672076b preserved as history)
Review branch for standards, screenshots and portable QA: feature/glp-darbar-reader-r5-20261023 (the five R5 source-file changes were already independently promoted to main and are identical here)

## Objective
Make the existing complete Japji Sahib reader as serene and effortless as possible on iPhone. Only after the reader passes acceptance, move to design and prototype of (1) authentic Sikh Naam Simran/meditation, and (2) destination-specific Gurdwara arrival. Do not create competing apps or switch away from the canonical GitHub repo.

## Inputs to inspect first
- docs/DARBAR_STANDARD_V1.md — precise design and editorial guardrails, including Claude's four recommendations with safety/accessibility refinements
- Two founder iPhone screenshots from conversation 2026-10-23 showing top-bar/dock overhead and excessive vertical spacing
- Revision 4 release evidence: ChatGPT Library /Gurbani Learning Library/Family access - 2026-10-23/GLP-001_Japji_v1_Release_Evidence_2026-10-23.html
- Current 0.9 Revision 5 source, tests and public GitHub Pages. Do not depend on legacy Mac Cloudflare link.
- Revision 5 was independently promoted by Work before this handoff was complete; the Mac release is ~/Library/Application Support/GurbaniLearningLibrary/releases/0.9-japji-v1-r5. Its compact/Quiet screenshots and measurements now describe the deployed baseline, not a competing candidate.

## Phase 1 — finish the reading canvas FIRST
1. One continuous immutable Gurmukhi document (all 385 occurrences; all 38 Pauris, beginning/closing passages). Keep all 385 short English+Punjabi drafts and 42 Study drafts unchanged, explicitly draft-labeled. Do not invent, modify or import scripture from a new source.
2. Remove section-label/divider clutter in Read and Understand. Let native danda and pauri numerals convey structure; retain accessible navigation landmarks and optional Jump. Keep ~8–10px intra-tuk, ~36–40px between Pauris, line-height ~1.9, user-adjustable large Gurmukhi without clipped matras. No boxes around Bani. Explain the semantic distinction in tests.
3. Make a single accessible bottom dock, <=56px tall excluding iOS safe area, with location, Play/Pause, three tappable depth indicators and expansion affordance; remaining controls under expansion. The persistent top banner should disappear during reading. A user-controlled Quiet/Controls mode already exists in the local candidate; refine it without trapping people. Auto-recede after inactivity may be offered only with a setting to keep controls visible, support for tap, keyboard and VoiceOver and a reliably visible Play control.
4. Preserve direct Read ⇄ Understand ⇄ Study switching without losing the original passage, active guide index, bookmarks or notes. Optional horizontal swipes must have tap/keyboard equivalents and must not conflict with iOS back swipe, text selection or screen-reader navigation.
5. Understand: short bilingual meaning immediately under each respective Gurmukhi line, geometry linking them without cards, and tap-to-expand a richer explanation. Opening an explanation may stop auto-follow but never resets the visual clock or browser reading anchor; closing returns to the same place.
6. Glow remains warm, optional, subtle and source-truthful. The guide is silent, illustrative and NOT synchronized to a recording. Play in Read/Understand must flow across the entire Japji including Pauri boundaries. Study may pause the guide for deep reading. Don't add synthetic audio or a media SDK.
7. Review performance: CSS flow/reflow, DOM updates at 385 lines, >30 min scroll session, no unintended shifts when controls recede, reduced-motion support, accessible focus, min 44x44px touch target.

## Phase 1 testing and promotion gate
- Preserve Revision 5 verification: 47 automated checks, 26 isolated-browser checks (including a secure loopback service-worker update/rollback), 12 live-site browser checks and 24 hash-matched public assets. Those results are not physical iPhone acceptance.
- Additional tests cover all 385 exact source hashes, all 385 meaning controls/42 Study layers, compact/quiet UI, no hidden controls lost, 320/390px and largest scripture size, external radio links and optional menus unchanged.
- Test every new R6 candidate for versioned service-worker upgrade/rollback with saved notes/bookmarks/theme retained. The early R5 harness did stall on one waiting-update observation; Work subsequently diagnosed the race and recorded 26 passing isolated-browser checks, including loopback update and rollback. Do not conflate that with a tested real-device iPhone upgrade or with a full live-HTTPS rollback; repeat the relevant gates for any further code changes.
- Real physical iPhone Safari portrait/landscape/standalone Home Screen/VoiceOver/offline if accessible; if not, mark NOT RUN. Do not describe desktop viewport as physical device evidence.
- Keep publicly deployed Revision 5 stable while building a NEW R6 single-dock/reader-layout candidate on a separate branch and PR. Promote only after tests and review to the SAME GitHub Pages family URL; preserve rollback+update instructions. This documentation/QA PR does not require changing the current site.
- Capture Day, Amrit Vela, Read, Understand, Study, and Quiet screenshots showing at least three pauris and a long line, and record measured old/new top, dock and tuk heights.

## Phase 2 — separate Meditation/Simran Room concept (not public shipping)
- Create docs and a private/public-safe nondeployed prototype branch, not a second app. Follow DARBAR_STANDARD_V1.md.
- Anchor instructional content to exactly source-matched Gurbani and Ang; source & interpretation layers distinct. Every Sikh practice claim must say whether it comes from Bani, Sikh Rehat Maryada, a named tradition, or our UX choice.
- Arrive, optional gentle breath attention, Naam Simran, Stillness, Learn. Silence by default; if human guidance later becomes available, rights and performer/consent recorded. No synthetic sacred voice, no unsolicited sound, no inappropriate breath holds.
- No streaks or performance scoring. Optional beads/rounds are not canon law; 108 is not a universal Sikh requirement. Give a no-count path.
- Deliver prototype and source ledger, accessibility and content-review requests; no audio recording, spend, celebrity/Granthi likeness, or public content release without authorization.

## Phase 3 — separate Gurdwara arrival concept (not public shipping)
- Curate at least 3 source-verified examples (Sri Harmandir Sahib, Gurdwara Sahib Fremont, Sikh Gurdwara San Jose). Provide actual place photos only if rights cleared, otherwise use clean typography and accessible fallback.
- Gurdwara's real local time via timezone; its color environment may reflect local hour. Don't infer official service/live status or exact morning programme from clock alone.
- Small skippable 3-second arrival may include photo, Gurmukhi name, accurate location, and short historically sourced description, then one Enter / Listen.
- No autoplay or audio before Enter. Official source pages only. YouTube embedding may be offered only in a visible compliant player preserving all required controls, ads, metadata, referral context; otherwise open official browser/YouTube route. Do not separate the audio stream or provide prohibited background playback. Return to the exact reading place.
- Deliver place/source/license register and static UX prototype as an isolated review, not a production change.

## Collaboration
- ChatGPT remains integration lead; Claude supplies design/review verdict only (PASS/FAIL, evidence, fixes) after the next R6 reader candidate. Work implements and tests.
- Distinguish independent AI review from qualified Gurbani/Punjabi/santhiya or raag endorsement.
- Open GitHub PRs with exact source diff, screenshots, test reports, branch base SHA and rollback. No protected Governed Studio infrastructure changes.
- Use GitHub as canonical source; copy nonsecret summaries/evidence into ChatGPT Library /Gurbani Learning Library. Optional Google Drive backup only if a connected writable destination is clearly available; don't store private user notes or any credentials in public source.

## Delivery back to founder
Return (i) stable iPhone URL unchanged, (ii) PR/commit, (iii) screenshots with measured chrome savings, (iv) Read/Understand/Study and full Japji checks, (v) update instruction preserving browser learning, (vi) remaining gaps and whether physical iPhone was actually verified, (vii) design concept briefs for the two future rooms only after Phase 1 passes.

Priority rule: This must be a finished usable reader improvement, not just another general plan.
