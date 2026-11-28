# D06 · User experience and accessibility audit

**How this was done.** Headless Chromium with iPhone 14 emulation (390×664 visible area),
plus 320 px, landscape and a desktop keyboard pass; axe-core 4.14.1 for automated
accessibility rules; my own measurements of contrast, target size and focus.

**What this is not.** Not Safari. Not an iPhone. Not VoiceOver or TalkBack. **No real
person took part.** The ten "readers" below are the assignment's personas walked through by
me; they are simulations and are labelled as such.

## 1. First use, as a new reader (recorded before any test file was opened)

Home is calm and dignified: one clear entry to the Nitnem collection, Sukhmani, two side
rooms. Opening Jaap Sahib, the first screen is title, counts and caveats; Gurbani starts
about a screen down. The dock at the bottom is clear: play, place, Read · Meaning · Study,
a chevron. Meaning appears under each line and reads well at arm's length. Pressing Study
changes nothing I can see — the study block is below the passage. The chevron opens a
sheet with "Gurmukhi size 30px" and "Pace 70". Sukhmani looks like a different app: gold
instead of green, a number grid, other words for the same controls. Japji is a third.

What works at once: reading, switching depth without losing my place, coming back
tomorrow. What makes me hesitate: which reader am I in, what did Study do, what do the
numbers mean, how do I save this line.

## 2. Tasks (U-01 … U-17)

All run in emulation. "Taps" are counted from the home page.

| ID | Task | Result | Notes |
|---|---|---|---|
| U-01 | Be reading Japji | Pass, 2 taps | The direct link on home is a 17 px line at the very bottom |
| U-02 | Read Jaap straight through | Pass, 2 taps | First screen is headings and counts (CI-U-02) |
| U-03 | Continue tomorrow | Partial | Nitnem exact; Japji about three lines early; Sukhmani asks first (CI-U-08) |
| U-04 | See a line's meaning and return | Pass | Place kept across depth switches in all readers |
| U-05 | Open Study for my passage | Partial | Works, but nothing changes on screen (CI-U-02) |
| U-06 | Go to a given place | Partial | Japji pauri 20 in 3 taps; Sukhmani ashtpadi 12 in 2 taps, then scroll to the pauri; Jaap chhand 150 means scrolling a flat list of 199 (CI-U-06) |
| U-07 | Much larger Gurmukhi, kept | Partial | Nitnem to 60, kept after reload, no clipping; Japji and Sukhmani stop at 48; meanings cannot be enlarged (CI-U-05) |
| U-08 | Dark and back | Partial | Works, but must be set in four places (CI-U-04) |
| U-09 | Save a line, find it again | Partial | Three different ways; hidden in Japji (CI-U-07) |
| U-10 | Private reflection survives reload | Pass | Marked private; stays on device |
| U-11 | Start, pause, re-pace the guide | Partial | Works; speed is "tokens per minute" (CI-U-03); three guide behaviours |
| U-12 | Back up, clear, restore | Partial | Notes and bookmarks return; eight separate files (CI-R-04) |
| U-13 | Read with no connection | Pass | Every composition, after one online visit (Chromium) |
| U-14 | Understand Read / Meaning / Study unaided | Pass | Labels are plain |
| U-15 | Where does the text come from; what is "draft" | Partial | One tap in Japji and Sukhmani; Nitnem shows one line and names no source for four banis (CI-U-08) |
| U-16 | Rotate the phone | Pass with note | No overflow; Nitnem reader loses about 39% of height to header and dock (CI-U-10) |
| U-17 | Same behaviour in all three readers | **Fail** | CI-U-01 |

6 pass · 10 partial · 1 fail.

## 3. The ten readers (simulated)

| Reader | What serves them today | What stands in the way |
|---|---|---|
| Reads Gurmukhi fluently | Clean continuous text; exact place; offline | No larivaar, no pause marks, no search; three readers to learn |
| Speaks Punjabi, struggles to read it | Punjabi meaning under each line | Romanised help only inside some study notes, never beside the line; no audio (rightly excluded until licensed); small Punjabi study text |
| Second-generation, outside Punjab | English meanings; teach-back questions | Core terms flattened in English (CI-M-06); the distancing voice in the Nitnem set (CI-M-01) |
| Complete beginner | Read / Meaning / Study is an easy ladder | No "start here"; Study seems to do nothing; jargon |
| Child with a parent | Calm, no ads, nothing to click away to | 9–11 px labels; no simple-words level; cautions about clinical efficacy on lines of prayer (CI-M-07) |
| Elder | Large Gurmukhi possible; strong contrast | Meanings stay small; controls say "30px"; four dark-mode switches |
| Impaired vision | Contrast 11–15:1 on Gurbani; zoom not blocked | **Screen reader cannot read the meanings** (CI-A-01); text ignores system font size (CI-U-05) |
| Daily Nitnem practitioner | All banis in one place, offline, exact resume (Nitnem reader) | Which Rehras and Chaupai is unclear (CI-S-09); Dasam text not established (D02) |
| Advanced student | Page references are right; Darpan cited for Japji and Sukhmani | No word-by-word layer, almost no cross-references (CI-E-01); cannot see variant readings |
| Seeking deeper understanding | Reflection prompts; private notes | Nothing brings saved lines back (CI-E-02); disclaimers interrupt the text |

## 4. Accessibility against WCAG 2.2 AA (A-01 … A-09)

| ID | Test | Result |
|---|---|---|
| A-01 | Automated scan, every page and main state | **Fail.** Meaning buttons carry a fixed spoken label that replaces their text: 62 in Sohila, 387 in Japji, 2,028 in Sukhmani (2.5.3, 4.1.2). Sukhmani also has 2,027 labels on elements that may not carry one (CI-A-01, CI-A-02) |
| A-02 | Contrast | Pass with two exceptions: collection numbers 3.28:1; two labels on the Pauri 2 lesson 4.07:1 (CI-A-03). Gurbani 11–15:1; meanings 4.73 light, 8.93 dark |
| A-03 | Target size | Pass for controls (44 px); a few text links under 24 px (CI-A-03) |
| A-04 | Keyboard | Pass. Visible focus ring on every stop; all three dialogs keep focus inside, close on Escape, return focus. Sukhmani has 24 stops before content and 2,027 line-buttons (CI-A-02) |
| A-05 | Language tagging | Pass. Gurmukhi is tagged as Punjabi |
| A-06 | Zoom and reflow | Pass for reflow: no sideways scroll at 320 px on any page or depth; pinch-zoom allowed. Text sizes are fixed pixels, so the browser's default font size has no effect (CI-U-05) |
| A-07 | Reduced motion | Pass. Transitions and animations are removed; the guide still advances when the reader starts it, which is acceptable |
| A-08 | Names and roles of custom controls | **Fail** for the same reason as A-01 |
| A-09 | Real screen reader on a real device | **Not tested** (CI-A-05) |

## 5. Design direction (recommendation)

1. **One reader.** The Nitnem reader has the best saved-learning and integrity code; the
   Japji and Sukhmani readers have the calmer page (no fixed header), as the owner decided
   on 23 October. Keep the first's engine and the second's face.
2. **Gurbani first.** The first line within the first screen; counts and caveats one tap
   away.
3. **One gesture.** Touch a line → *Meaning · Save · Note · Words*. The same everywhere.
4. **One text-size control** scaling Gurmukhi, meanings and labels together; nothing below
   12 px; follow the phone's own text-size setting.
5. **One appearance setting**, following the phone by default.
6. **Plain words in both languages.** "Slower / Faster", not "tokens per minute".
7. **Find by first letters**, offline — the habit of every Gurbani tool.
8. **Meanings that a screen reader reads**, in the right language voice.

## 6. A device session for a person with an iPhone (about 30 minutes)

Nobody has done this in any recorded review. Please record the screen or take photos.

| # | Do this | Look for | Finding |
|---|---|---|---|
| 1 | Open the library in Safari; add to Home Screen; open from the icon | Opens full-screen; nothing cut off at the notch or bottom bar | CI-A-05 |
| 2 | Open Jaap Sahib, chhands 96–98 | Does "ਚੱਤ੍ਰੁ" look the same in all three chhands? Any dotted circle (◌)? | CI-S-02 |
| 3 | Open Anand Sahib, pauri 24, third line | Is "ਕਚਂੀ" drawn cleanly, without a dotted circle? | CI-S-13 |
| 4 | Read ten minutes of Sukhmani in Meaning | Any stutter while scrolling; does the phone get warm | CI-U-09 |
| 5 | Turn on aeroplane mode; open each of the nine compositions from the icon | All open | CI-R-06 |
| 6 | Write a note in each reader; close the app fully; reopen | Notes still there | CI-R-04 |
| 7 | Settings → Accessibility → VoiceOver on; in Sohila, swipe through three lines in Meaning | Is the meaning *read aloud*, or only "Meaning for this line. Tap to explore"? Is Gurmukhi read in a Punjabi voice? | CI-A-01 |
| 8 | Settings → Display → Text Size to the largest; reopen | Does any text grow? | CI-U-05 |
| 9 | Turn the phone sideways in Jaap Sahib | How many lines of Gurbani are visible | CI-U-10 |
| 10 | Phone in Dark mode; open home, Nitnem, Japji, Sukhmani in turn | Which pages come up dark | CI-U-04 |
| 11 | Leave the app unopened for eight days (Safari tab, not the Home Screen icon), then open | Are notes still there? | CI-R-04 |

## 7. Findings

Use: CI-U-01 … CI-U-10 (all medium or low). Accessibility: CI-A-01 (high), CI-A-02
(medium), CI-A-03 (low), CI-A-05 (high: nothing tested on a device), CI-A-04 (passed
checks). Full entries in [`FINDINGS_REGISTER.md`](FINDINGS_REGISTER.md).
