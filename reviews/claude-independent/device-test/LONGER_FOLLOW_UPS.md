# Longer follow-ups — kept apart from the ten-minute check

These do not fit in ten minutes, or need something that does not exist yet. Each gets its own dated result in
`results/`. None has been run. A follow-up that has not been run is recorded as "not done" — never as passed.

| # | Check | How | What it needs | Waits for a repair? |
|---|---|---|---|---|
| FU-1 | **Notes survive a week away (Safari).** | Write `TEST NOTE 1` in Safari — not in the Home Screen app. Do not open the test address for eight days. Open it. Is the note there? | A calendar reminder. Safari may clear a site's saved data after seven days without a visit when the site is not on the Home Screen (round 1, D-08: could not be tested without a phone). | No |
| FU-2 | **A background tab that Safari reloads.** | Open the reader in Safari at Pauri 20. Use other apps for an hour or more. Return to the tab. Which line does the bar name? | Nothing extra. | No — but see CI-R-11: on a computer the place moves back on every reload. |
| FU-3 | **Updating while an older copy is open.** | With build 1 open in a Safari tab, the test copy is updated to build 2. Import a made-up backup in a new tab, go back to the old tab and read on. Are the kept-aside notes still there? | Two builds of the test copy, published one after the other; a made-up backup file (Claude prepares it). | **Yes — RT1-01.** Fails today on a computer: the older copy destroys kept-aside notes without a word. |
| FU-4 | **The "notes kept aside" notice can be seen.** | Import a made-up backup holding a note on a line this edition does not have. Close and reopen the reader. Is there a notice on screen, and can it be tapped? | The made-up backup file (Claude prepares it). | **Yes — CI-R-09.** Fails today on a computer in 3 of 4 situations. |
| FU-5 | **Recovering from a damaged offline copy.** | A special test build whose offline copy of the Gurbani file is deliberately damaged. Open it online, then offline. Does the reader recover, and can notes still be exported from the refusal screen? | A special build from the builder. | **Yes — CI-R-08.** Today there is no way back from inside the app. |
| FU-6 | **The other two readers.** | The same journey (save a line, write a note, reopen, export, import) in Sukhmani Sahib and in the Nitnem collection. | About ten minutes each. | No |
| FU-7 | **Reading comfort.** | Largest text size (Settings → Accessibility → Display & Text Size → Larger Text); phone turned sideways; Dark appearance. Is any Gurmukhi cut off? Any sideways scrolling? Is the bottom bar usable? | Nothing extra. | No (CI-U-04, CI-U-05, CI-U-10 are open and expected to show). |
| FU-8 | **The silent reading guide and the lock screen.** | Tap ▶. Lock the phone for a minute. Unlock. | Nothing extra. Expected by the app's own help text: the guide pauses; tap Resume. | No |
| FU-9 | **Rendering of the difficult letters.** | Jaap Sahib chhands 96–98 and Anand Sahib pauri 24, third line: any dotted circle (◌), any letter drawn differently from the others? Photograph the screen. | Nothing extra (round 1, D06 §6, steps 2–3). | No (CI-S-02, CI-S-13). |
| FU-10 | **iPad, and an Android phone.** | The ten-minute check again. | The device. Results are recorded per device and never inferred from the iPhone. | No |
| FU-11 | **A first-time reader.** | A family member who has not seen the app is asked to open Japji Sahib and save a line, with no help. Did they find it? | A willing person; made-up notes only; nothing recorded about them except what they agree to. | No (CI-U-07). |

The 30-minute session written in round 1 (`D06_UX_AND_ACCESSIBILITY_AUDIT.md`, section 6) stays valid. The ten-minute
script is its first slice; FU-6, FU-7 and FU-9 above are the rest of it.
