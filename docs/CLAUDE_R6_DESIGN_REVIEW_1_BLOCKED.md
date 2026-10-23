# GLP-001 Work Order 008 — Independent Claude Design Review of the R6 Darbar Reader Candidate

**Verdict: FAIL — review blocked on inaccessible visual evidence. This is not a rejection of the design.**

Reviewer: independent Claude design review only. Not a qualified Sikh/Punjabi/santhiya or raag endorsement. Date 23 October 2026.

---

## 1. Why the verdict is FAIL rather than PASS

The decisive evidence for this gate is the eight screenshots in `docs/screenshots/r6/`. **I could not open any of them, and I could not enumerate the directory.** In this session `Bash`, `Glob`, `Grep` and `LS` are all disabled, and `Read` returns `EISDIR` on a directory, so file discovery by path is the only route available. `docs/screenshots/r6/` is untracked in git, so the filenames do not appear in the commit record either.

I attempted ~24 plausible paths (for example `r6-day.png`, `r6-read.png`, `r6-understand.png`, `r6-study.png`, `r6-play.png`, `r6-amrit-vela.png`, `r6-48px-320.png`, `r6-day-read-390.png`, `day.png`, `01-day.png`, `screenshot-1.png`, `.jpeg` variants). All returned "File does not exist." No reference to the filenames exists in `docs/R6_CANDIDATE.md`, `docs/R6_REVIEW_REQUEST.md`, `evidence/r6-browser-checks.json` or `.github/workflows/reader-qa.yml`.

A design PASS would therefore have to be inferred from a self-reported PASS console and from source code. The brief is explicit that the PASS console "is engineering evidence, not a request that you agree," and that code may be read **only to clarify screenshot-backed findings**. I have deliberately not substituted a CSS/HTML/JS audit for the visual review: source cannot establish calm composition, warmth and restraint of radiance, absence of matra collision at 48px, perceived dominance of Study cards, or the honest look of the Amrit Vela palette. Under "state that rather than invent evidence," FAIL is the only defensible header.

**This FAIL is procedurally safe in any case:** physical iPhone/Safari/VoiceOver/Home Screen/offline are NOT TESTED and the HTTPS upgrade/rollback gate is still open, so Standard §F acceptance could not be met today even with a design PASS. Nothing is lost by re-issuing the verdict once I can see the captures.

**To unblock in one step:** send the eight exact filenames (or paste them inline). I will return the PASS/FAIL design verdict against the checklist in §5 without re-reading the standards.

---

## 2. What I did verify, from the documents and evidence files

These are document-level and arithmetic findings, independent of the screenshots. They are corroboration, not visual verification.

| Standard requirement | Candidate claim | Document check |
|---|---|---|
| Dock ≤56 CSS px excl. safe area (§B) | 54px, one dock | Consistent; `evidence/r6-browser-checks.json` metrics `dockHeight: 54`, `topChrome: 0` |
| Min 44×44px targets (§B, Phase 1.7) | six buttons ≥44px at 320 and 390px | Claimed PASS at both widths in the 28-check set |
| Dock composition: location, Play/Pause, 3 depth indicators, one expand (§B) | Play/Pause, location/Jump, Read, Meaning, Study, expand | Maps correctly; "Meaning" carrying accessible name *Understand* is the right call |
| ~8–10px intra-tuk, ~36–40px pauri (§A) | 9px / 38px | In range |
| Line-height 1.85–1.95 at 30px default (§A) | 1.9 | Consistent: metrics `scriptureSize 30px`, `lineHeight 57px` = 1.900 |
| Understand: 5–6px connection, 18–20px separation (§A) | 5px attachment, 19px before next tuk | In range |
| No persistent top toolbar during reading; auto-recede only with a keep-visible setting (§B) | header recedes, full dock always visible, persistent-controls preference | Stronger than the standard requires — the dock itself never hides, so the §B auto-hide escape hatch applies only to the header |
| Glow never the sole indicator of current line (§C) | radiance disableable, current word keeps underline | Addressed by check 23 |
| Optional horizontal swipe (§B, Phase 1.4) | deferred pending iOS/VoiceOver evidence | Compliant. §B makes swipe optional and tap mandatory; three visible buttons plus keyboard satisfy it. Deferring is the correct conservative choice, not a gap |
| Chrome reduction claim | 117.6px → 54px, "63.6px (54.1%)" | Arithmetic correct (63.6/117.6 = 54.08%). Headless-to-headless comparison, correctly labeled as not iPhone proof |
| Source immutability (§F) | 385 occurrences, 385 meanings, 42 Study drafts byte-identical; Pauri 13 line 1 OPEN; drafts unreviewed | Stated honestly and consistently across `R6_CANDIDATE.md` and the evidence file. No silent scripture repair claimed |

Honesty of the record is good. `R6_CANDIDATE.md` §"Open gates / honest limits" correctly refuses to claim device testing, correctly declines to treat the archived `r5-compact-amrit.png` as Amrit-theme proof, and correctly separates a deterministic traversal contract from elapsed-time scroll evidence. The `physicalIPhone / Safari / VoiceOver / HomeScreen / offline: NOT TESTED` fields in the evidence JSON are the right pattern.

---

## 3. Blocking fixes

**B1 — Supply the screenshot filenames (or a manifest).** Add `docs/screenshots/r6/README.md` listing each capture with its mode, theme, CSS viewport, Gurmukhi size and what it is offered to prove. Without discoverable filenames the packet is unreviewable by any tool-restricted reviewer, and the review cannot be reproduced later from the repo alone.

**B2 — No evidence for WCAG 2.2 "Focus Not Obscured" against the persistent dock.** Standard §B requires that the dock "not obscure the text or keyboard focus" and cites the WCAG 2.2 criterion directly. The 28 browser checks cover dock height, target size and overflow, but none asserts that a keyboard-focused element — in particular the last tuk, a meaning button near the bottom, or a Study control — remains fully visible above the 54px dock plus safe-area inset. With the dock now permanently visible this is a higher risk than in R5, where chrome could recede. This needs an explicit automated check at 320 and 390px, and at 48px scripture.

**B3 — No `prefers-reduced-motion` evidence.** Standard §C requires reduced-motion support, and §B requires the location "whisper" to be dispensable by reduced-motion setting. Neither appears in the 28 checks nor in the candidate's "Implemented" list. Radiance being user-disableable is a preference, not the same thing as honouring the OS setting. Add a check that reduced-motion suppresses guide transitions and the section whisper, and that the whisper does not steal focus.

I have classified B2 and B3 as blocking because both are explicit lettered requirements of the standard with no evidence of any kind, not merely absent visual confirmation.

---

## 4. Nonblocking observations

1. **"Quiet" naming drift.** Work Order line 34 asks for a *Quiet* capture; the packet lists *immersive Play*. These are probably the same surface, but the Work Order's vocabulary should be reconciled in the candidate record so the deliverable maps to the gate one-to-one.
2. **"A long line" is not confirmed.** Work Order line 34 requires at least three pauris *and a long line*. The packet lists Pauris 1/2/3 and 48px text at 320px; 48px at 320px very likely forces wrapping, but no capture is described as demonstrating a long tuk specifically. Label whichever capture serves that purpose.
3. **Missing R6 line-block measurement.** The Work Order asks for measured old/new top, dock *and tuk* heights. R5's 100px → 66.5px line-block figure is on record; R6 reports gaps (9/38px) but no comparable line-block height. Add it for continuity of the measurement series.
4. **Mode-anchor evidence is single-sample.** `evidence/r6-browser-checks.json` records one Read→Understand transition at `pauri03.line01` (13.78125 → 14.078125, 0.30px). The "less than 1px" claim is honest about what was recorded, but one sample at one anchor is thin for a core promise of the standard (§C, Phase 1.4/1.5). Sample several anchors, including mid-pauri, deep in the document, and during active Play.
5. **`docs/CLAUDE_R6_DESIGN_REVIEW.md` exists but is 0 bytes.** I have not written to it, per the review remit. Someone on the integration side should paste the final verdict there.
6. **>30-minute scroll session remains unrecorded.** Correctly disclosed. Worth pairing with a DOM-node-count and reflow observation at 385 lines, since Phase 1.7 asks for performance review and the 28-check set does not cover sustained behaviour.

---

## 5. What I will check per screenshot once filenames are supplied

So the next round is a single pass: Day and Amrit Vela — palette warmth, that Amrit is visually distinct and not merely dimmed, no neon or devotional texture. Read — absence of rules, cards and dividers around Gurmukhi; danda and pauri numerals carrying structure; 9px/38px rhythm reading as calm rather than cramped; Mool Mantar emphatic by typography, not a coloured card. Understand — English then Punjabi beneath the matching tuk, geometric connection without a card, explanation contrast lower but still legible. Study — commentary clearly labeled and visually subordinate to source. Immersive Play — full dock visible, no top banner, radiance restrained, current line indicated by more than glow. Pauris 1/2/3 — continuity across pauri boundaries with no page-break artefact. 48px at 320px — no clipped or colliding matras, no horizontal overflow, dock and targets intact. Across all eight: dock proportion against the text column, and whether anything sits under the dock's 54px band.

---

## 6. Remaining physical-device checks (NOT TESTED, and I make no claim about them)

Per Standard §F and Work Order Phase 1 testing, all of the following remain outstanding on real hardware, which was unavailable: physical iPhone Safari at 390px and 320px, portrait and landscape; 30–48px scripture with real Dynamic Type; VoiceOver traversal of the dock, depth switches, meaning expansion and the options dialog, including focus return on Escape/dismiss; Safari Home Screen standalone mode with safe-area inset; real airplane-mode offline; long-session (>30 min) scroll and memory behaviour; HTTPS versioned service-worker upgrade *and* rollback with real saved notes, bookmarks and theme surviving, on a disposable origin, with no family release downgraded.

Desktop Chrome iframe captures at 320/390/844 CSS px are legitimate early evidence and are labeled as such in the candidate record. They are not iPhone acceptance. Until the device gate and the HTTPS lifecycle gate close, the publicly deployed Revision 5 should stay exactly where it is.

---

**Summary:** the measured geometry, dock consolidation, swipe deferral and honesty of the limits all read as a disciplined candidate, and nothing in the documents suggests a design regression. But I cannot certify a *design* candidate I have not been able to look at. Send me the eight filenames plus fixes for B2 and B3, and I will re-issue the verdict.
