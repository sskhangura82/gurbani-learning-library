I read all four documents, both evidence JSONs, the reduced-motion fixture and forced CSS, `full-japji.html`, `css/japji-full.css`, `js/japji-full.js` and `js/continuous-core.js`, and I opened and inspected all nine screenshots.

# Independent Claude Design Review — R6 Darbar Reader, second pass

**Verdict: FAIL DESIGN — three specific, cheap, confirmed defects. This is not a repeat of the first FAIL.**

Scope note: independent AI design review only. Not Sikh/Punjabi/santhiya/raag approval. Physical iPhone/Safari/VoiceOver/Home Screen/offline remain NOT TESTED and I make no claim about them. HTTPS lifecycle and the 31-minute session are separate gates; I assess neither.

---

## 1. First-pass blockers: all three genuinely closed

**B1 — closed.** The manifest exists, filenames are tracked and exact, and I opened all nine. Each capture does what the manifest says. The manifest's own caveats are accurate: the QA console in most captures reads `"total": 28` from an earlier run while `mool-long-line.jpg` shows `38` — disclosed in advance, and I confirmed it rather than being surprised by it. The disclaimer that `large-320.jpg` is a large-text test and *not* longest-line proof is exactly the right kind of self-limiting label.

**B2 — closed, and the mechanism is real, not just the numbers.** `css/japji-full.css:64` sets `scroll-padding-bottom:calc(88px + env(safe-area-inset-bottom))`, `:69` gives `.scripture-line` a matching `scroll-margin-bottom:88px`, and `js/japji-full.js:173–178` adds a `focusin` handler that scrolls any focused `button,a,input,select,textarea,summary` inside `main` to clear `dock.top − 12`. The six recorded checks show focused meanings at 320 and 390 × 48px bottoming at 755.5–756.4 against `dockTop: 782` — ~26px clearance — plus the final Study action. The 88px reserve comfortably exceeds the 54px dock. That satisfies WCAG 2.4.11 (Minimum), which is an *on-focus* obligation. The handler correctly uses `behavior:'instant'`, so it does not fight reduced motion.

**B3 — closed as far as it honestly can be, and it earned its keep.** The fixture injects `matchMedia` (`tests/reduced-motion-fixture.js:3`), which exercises the genuine production branch at `js/japji-full.js:102` (`behavior:reduced.matches?'instant':'smooth'`), and loads declarations copied from the production media query. Six checks pass. The characterisation in the brief is accurate: a real JS branch and real CSS declarations, but **not** an OS-toggle test, and it is labeled that way in the evidence file itself. The retained `r6-reduced-motion-before-fix.json` and the fix at `css/japji-full.css:23` — adding `.g-word[data-active=true]` to the unqualified `text-shadow:none!important` so the `:11` emphasis shadow dies in *both* radiance states — is a real defect found by a real test. §B's "whisper" clause is vacuous because no whisper animation exists, which the evidence states plainly rather than claiming a pass.

Prior nonblocking items 1–4 are also resolved: Quiet/immersive vocabulary reconciled in the manifest; `mool-long-line.jpg` supplies the long-line capture; the 57px tuk box / 66px row pitch figure restores the measurement series; and the anchor sample is now four anchors (`pauri03` 0.27px, `pauri04` 0.09px, `pauri24` 0.30px, `closing` 0.19px), not one.

## 2. What the screenshots actually show, and it is mostly good

Composition is calm and the standard's geometry is visibly real, not just asserted. Read and Understand carry no rules, cards, dividers or section decoration around the Gurmukhi — `.section-caption` is clipped to screen-reader-only at `:67` and the accessible `<h2>` survives, which is the right way to satisfy §A without drawing a line on the page. Pauri 1 and Pauri 2 complete with native `॥੧॥`/`॥੨॥` and no page-break artefact; `immersive-day.jpg` shows the Pauri 1 → Pauri 2 boundary reading as a clear 38px breath against the 9px intra-tuk rhythm, which is the single best piece of evidence in the set.

Amrit Vela is genuinely a different palette, not a dimmed Day: deep blue-black `#111929` against warm parchment `#f3e6c7`, accent `#f6d28a`. No neon, no particles, no devotional texture. Radiance is restrained in both themes — `0 0 7px/11px` at 27% (Day) and 40% (Amrit) alpha reads as warmth, not a halo effect.

Understand places English then Punjabi immediately under the matching tuk with no container, the explanation genuinely subordinate in size and weight while remaining legible. I checked the contrast arithmetic rather than eyeballing it: muted-on-paper is ~6.1:1 (Day) and ~9.6:1 (Amrit); the accent hint is ~6.2:1 and ~12.2:1; scripture ink is 12.3:1 and 14.2:1. All clear of 4.5:1 including the 10px hint.

Immersive Day shows zero top chrome (`topChrome: 0`, text running to y=0) with the complete six-control dock still present — stronger than §B requires. The current line carries three independent signals: a left accent bar (`:72`), accent colour, and an unconditional underline (`:30`), so glow is never the sole indicator even before anyone touches a setting.

`large-320.jpg` at 320px/48px is the strongest accessibility capture: matras on ਅੰਤੁ and ਸਿਫਤੀ are intact and uncollided, no horizontal overflow, and all six dock targets hold their 44px. `mool-long-line.jpg` wraps the full Mool Mantar over three lines with no coloured container.

Swipe deferral, the passive non-cancelling `touchmove` handler, `visibilitychange` pause, silent-guide captions, and the Escape-restores-focus path all check out in source.

## 3. Blockers

**D1 — Mool Mantar has no typographic emphasis at all.** §A: "Mool Mantar is emphatic through typography/radiance, not a colored card." The negative half is satisfied; the positive half is unimplemented. There is no Mool-specific class in `js/japji-full.js:48–53` and no corresponding rule anywhere in `css/japji-full.css` — `.tuk` is uniform across all 385 occurrences. `mool-long-line.jpg` confirms it: the Mool Mantar renders at the identical size, weight and colour as the Salok two blocks below it. The capture submitted to prove this surface is the capture that disproves it. Fix is a class on the opening unit plus a modest weight/tracking or radiance lift — not a card, not a colour block.

**D2 — The danda and pauri numerals are being orphaned onto their own line.** §A makes the danda and numerals the carriers of the scripture's division; stranding them alone is the opposite. This is not rare. In `read-day.jpg` and `read-amrit.jpg` two of ten visible lines end with a bare `॥` on its own row. `understand-amrit.jpg` shows the same twice. `large-320.jpg` shows it at 48px. `mool-long-line.jpg` strands the Salok's closing `॥੧॥` entirely alone. Root cause: `continuous-core.js:12` splits on whitespace so the danda is an independent token, `japji-full.js:44` wraps each token in its own span, and `.tuk` carries `overflow-wrap:anywhere` (`:32`) with nothing joining the final word to its danda. Fix is a non-breaking join (or `white-space:nowrap` on the trailing token pair) in `tokensMarkup`, with no change to the frozen source string.

**D3 — WCAG 2.5.3 Label in Name failure on the Understand control (Level A).** `full-japji.html:26` is `aria-label="Understand · English and Punjabi meanings"` with visible text `Meaning`, and `applyMode()` never updates it. The visible label is not contained in the accessible name, so voice-control users saying "tap Meaning" get nothing. §B requires accessible names on the depth indicators and the standard cites WCAG directly. The first review called this mismatch "the right call" — that was wrong, and I'm correcting it. One-line fix: lead the accessible name with "Meaning". Note that `#dock-position` does *not* have this problem — `js/japji-full.js:83` rebuilds its `aria-label` to include the visible location text, which is the correct pattern already in the codebase.

All three are small. None requires touching scripture, the dock geometry, the guide, or the reduced-motion work.

## 4. Nonblocking findings

1. **Study card heading competes with scripture.** `.unit-lesson h3` is 28px Georgia (`:29`) against 30px Gurmukhi. In `study-amrit.jpg` the bordered panel plus that heading reads heavier than the single source line above it. §A is not breached — the source is not replaced, truncated, or smaller — but the margin is thin. Drop the heading to ~22px.
2. **"Draft meaning · tap to explore" repeats ~42 times.** `.scripture-line~.scripture-line .expand-hint{display:none}` (`:54`) hides it after the first line *of each passage*, not after first use. §B asks to omit ordinary interface explanations from the reading column after the first run. Gate it on a first-use flag.
3. **Pauri boundary weakens in Understand.** Intra-tuk spacing rises to 19px (`:73`) while `.passage` stays at 38px, so the division signal drops from 4.2× to 2×. Still inside §A's 36–40px, but consider raising the passage margin in Understand and Study.
4. **Possible one-word offset between the two active-word indicators.** In `immersive-day.jpg` the amber emphasis appears on ਸਦਾ while the underline appears on the adjacent ਭਵਾਈਅਹਿ. `paint()` (`js/japji-full.js:90–96`) sets a single `data-active` token and CSS `:11` + `:30` put colour and underline on that same span, so they should coincide — and in `mool-long-line.jpg` they do, both landing on `॥੧॥`. Either I am misreading a 390px-wide JPEG or there is a stale-attribute condition. Confirm with a DOM dump at that frame; do not spend a new screenshot on it.
5. **Reduced-motion fixture can drift.** `tests/reduced-motion-forced.css` is a hand-copy of the production block at `css/japji-full.css:23`. It is byte-faithful today, but nothing enforces that. Add an assertion that the forced declarations are extracted from (or compared against) the production media query, and run one case explicitly at `radiance=false`, since that is the state the fix was for — today it is only covered incidentally via the default `radiance=true`.
6. **No anchor sample during active Play.** Four anchors now, all sub-pixel, but all with the guide stopped. One depth change mid-guide would close the last corner of this contract.
7. **`#dock-position` truncates to "Pauri…" at 320px/48px** (`large-320.jpg`). Cosmetic only — the accessible name stays complete — but dropping the "Line n" sub-row at narrow widths would recover the space.
8. **`overflow-wrap:anywhere` on `.tuk` permits mid-word breaks in Gurmukhi.** Not observed in any capture, including 48px/320px. Consider `break-word` so arbitrary breaking stays a true last resort. Related to D2.

## 5. Remaining device checks — NOT TESTED, and I claim nothing about them

Physical iPhone Safari at 390 and 320px, portrait and landscape; 30–48px with real Dynamic Type; VoiceOver traversal of the dock, depth switches, meaning expansion and the options dialog including focus return on Escape; Safari Home Screen standalone with real safe-area inset; real airplane-mode offline; sustained >30-minute scroll and memory behaviour. The owner's position that these may remain untested is reasonable and I am not converting an unavailable device into a new demand.

One item belongs on that list specifically because of R6: the dock sets `bottom:8px` *and* `padding-bottom:calc(4px + env(safe-area-inset-bottom))` (`:81`). On a notched iPhone the box will render roughly 88px tall with ~34px of empty interior below the controls. That is standard-compliant — 54px excluding the inset, exactly as §B measures it — but the dock will read visually heavier against the text column than any of these 844px desktop captures show. It is a proportion question for the device gate, not a defect here.

Desktop Chrome iframe captures at 320/390/844 CSS px are legitimate early evidence and are labeled as such throughout. They are not iPhone acceptance. Revision 5 should stay deployed until the device and HTTPS lifecycle gates close.

---

**Summary.** The packet is now reviewable, the first pass's three blockers are genuinely closed, and the reduced-motion work found and fixed a real bug rather than rubber-stamping one. Geometry, palette, hierarchy, contrast, dock consolidation and the honesty of the record all hold up under inspection. The FAIL rests on three narrow defects: the Mool Mantar carries none of the emphasis §A requires, the danda and pauri numerals are visibly orphaned across every Read capture at both sizes, and the Understand control fails Label in Name. Fix those three and re-send only `read-day.jpg`, `mool-long-line.jpg` and `large-320.jpg` — I can re-issue the design verdict from those plus the diff.