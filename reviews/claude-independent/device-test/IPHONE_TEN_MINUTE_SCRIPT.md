# iPhone check — about ten minutes

**For:** the owner, on his own iPhone.
**Prepared by:** Claude (independent second reviewer), 26 November 2026.
**Status: not yet run.** The owner has opened the test address on his phone and seen it work — a first look, by his
own words, not this check. Nothing in this folder is an iPhone result.

**Test address:** `https://glp001-iphone-qa.github.io/glp001-iphone-test/`
**When to run it:** on the repaired build, once its banner shows a build label. Running it earlier on today's copy is
allowed and useful, but it is an early look at the unrepaired candidate, and is recorded as that.

This script checks one journey in the Japji Sahib reader: open it, find a passage, save a line, write a note, come back
to it, carry it into the Home Screen app, open it with no connection, and listen to it with VoiceOver.

Every button name below was taken from the app itself, and the Safari part was rehearsed on a computer pretending to be a
phone (13 of 14 steps behaved as written; the one that did not is marked at step A7). A rehearsal is not a phone. What your
phone does is the result.

---

## Before you start

1. **Use the test address only.** The page must show a banner that says **TEST COPY — NOT THE LIBRARY**.
   If there is no banner, stop — that is the real site, and test notes do not belong there.
2. **Use made-up notes only.** Type exactly `TEST NOTE 1`. Do not type a real reflection during this check.
3. Safari must **not** be in Private Browsing.
4. Wi-Fi or mobile data on (until step B5).
5. **One-time safety step for VoiceOver** (part C): Settings → Accessibility → Accessibility Shortcut → tick **VoiceOver**.
   Now three quick presses of the side button turn VoiceOver on and off. This matters, because VoiceOver changes how
   every tap works and can be hard to switch off from the screen.

Write down four things first:

| | |
|---|---|
| iPhone model (Settings → General → About → Model Name) | |
| iOS version (same screen → iOS Version) | |
| Build label shown in the test banner (if none is shown, write "none") | |
| Date and time | |

### Which build

The repaired build is PR #40 at `1470477`. I have re-tested it on a computer (`retests/RT-002_PR40_SECOND_REPAIRS.md`):
on it, step A7 should name the same line after both reloads, and a note should appear in the Saved list marked
"Reflection". It is not on the test address yet. Until the banner shows a build label, assume the address still
holds the first candidate, where A7 is expected to slip.

### Known about the test copy as it stands today (26 November)

It holds the unrepaired candidate — checked file by file (`TEST_COPY_VERIFICATION_20261126.md`). Two things about
its banner will show up in this check until the builder corrects them:

- **The banner covers the top line of the reader.** After step A3 you may see only the end of the first line of
  Pauri 5 (ਹੋਇ ॥) under the banner. That is the banner's fault, not the reader's. Write down what you see.
- **The banner shows no build label yet.** Write "none" and the time.

---

## Part A — in Safari (about 4 minutes)

| Step | Do this | You should see |
|---|---|---|
| **A1** | Open the test address in Safari. | The banner **TEST COPY — NOT THE LIBRARY**, with a build label once one has been added. Home page of the library. |
| **A2** | Tap **Open Japji Sahib directly**. | Gurbani in Gurmukhi, beginning with the Mool Mantar. A bar at the bottom: **▶**, the passage name (**Mool Mantar**, and under it **Line 1**), **Read**, **Meaning**, **Study**, a number with the word **pace**, and **⌃**. |
| **A3** | Tap the passage name on the bottom bar. (On a small or zoomed screen the bar may show no passage name: tap **⌃** → **Jump to a passage** instead.) In the list (**Jump within Japji Sahib**) tap **Pauri 5**. | The reader moves. The bar now says **Pauri 5**, **Line 1**. The first line on screen is ਥਾਪਿਆ ਨ ਜਾਇ ਕੀਤਾ ਨ ਹੋਇ ॥ |
| **A4** | Tap **⌃**, then **Save this reading line**. | A short message: **Reading line saved.** |
| **A5** | Tap **⌃**, then **Keep a reflection here**. Type `TEST NOTE 1`. Wait two seconds. Tap **×**. | Under the box: **Saved in this browser.** |
| **A6** | Tap **Meaning** on the bar. Look. Then tap **Read**. | A short meaning in English and Punjabi under each line, and a notice that the teaching is a draft awaiting human review. Back in Read: Gurmukhi only. |
| **A7** | Make sure the bar says **Pauri 5**. Reload the page (the ↻ in the address bar, or ⋯ → Reload). Read the bar. Reload once more. Read the bar again. | The bar should still say **Pauri 5**, **Line 1** both times. **Known on a computer: it moved back about three lines on every reload (Pauri 4, Line 5 — then Pauri 4, Line 3).** Write down exactly what your phone's bar says after each reload. |
| **A8** | Tap **⌃** → **Explore · learning, raag & gurdwaras** → **Saved places & reflections**. Tap the line **Pauri 5 · line 1**. Then **⌃** → **Keep a reflection here**. Tap **×**. | The list shows **Pauri 5 · line 1** with its Gurmukhi. After tapping it, the bar says Pauri 5, Line 1. The box holds `TEST NOTE 1`. |
| **A9** | **⌃** → **Explore…** → **Saved places & reflections** → **Export learning**. If Safari asks, tap **Download**. | A file named **Gurbani-learning.json** is saved (Files app → Downloads). Note where it went. |

---

## Part B — the Home Screen app, and no connection (about 4 minutes)

| Step | Do this | You should see |
|---|---|---|
| **B1** | In Safari, on the test copy's home page: Share → **Add to Home Screen** → leave "Open as Web App" on if it is offered → **Add**. | A new icon on the Home Screen. Expected name: **GLP QA**. Write down the name you see. |
| **B2** | Open the app from that icon. Tap **Open Japji Sahib directly**. | The library opens without Safari's address bar. The banner is still there. Japji Sahib opens. |
| **B3** | **⌃** → **Explore…** → **Saved places & reflections**. | Either your saved line is listed, or the screen says **No saved lines yet.** (on the repaired build: **No saved lines or reflections yet.**) Both are acceptable — iPhone normally keeps a Home Screen app's saved data apart from Safari's. **Write down which one you see.** |
| **B4** | On that same screen tap **Import or merge learning from any GLP reader** and choose **Gurbani-learning.json**. When asked **Merge this learning backup?** tap **Merge learning**. Then tap **Pauri 5 · line 1**, then **⌃** → **Keep a reflection here**. Tap **×**. | Message: **Learning merged. Existing reflections were preserved.** The line **Pauri 5 · line 1** is listed. The box holds `TEST NOTE 1`. |
| **B5a** | **⌃** → **Explore…** → **iPhone & offline help**. Read the last line above the button **Check for a reader update**. | One of these four sentences — write down which: "Offline shell is installed. Export learning to keep a durable backup." · "Offline shell is installing; keep the page open until ready." · "Offline cache could not install. Online reading still works." · "Offline caching is not available in this browser." If it says *installing*, wait half a minute and open the panel again. |
| **B5b** | Close the app completely (swipe it away in the app switcher). Turn on **Airplane Mode** and check **Wi-Fi is off** too. Open the app from its icon. Tap **Open Japji Sahib directly**. | The library opens. Japji Sahib opens with Gurbani. The bar names **Pauri 5**. **⌃** → **Keep a reflection here** still holds `TEST NOTE 1`. |
| **B6** | Turn Airplane Mode off. | — |

**If at any point you see** "The original scripture could not be verified, so it has not been displayed. Reload while
online. Your saved learning has not been changed." — that is the app refusing to show text it could not check. Do not
keep retrying. Take a screenshot, write down the step, and carry on with the next part.

---

## Part C — VoiceOver (about 3 minutes; can be done another day)

VoiceOver reads the screen aloud. While it is on: **one tap** selects, **double-tap** presses, **swipe right** moves to the
next item, **swipe left** goes back. Three presses of the side button turn it on and off (set up in "Before you start").

| Step | Do this | Listen for |
|---|---|---|
| **C1** | In the Japji Sahib reader, in **Read**, turn VoiceOver on. Tap once on a line of Gurbani. Swipe right four times. | For each line: is the Gurmukhi read aloud, skipped, or spelled letter by letter? Does it add a word such as "button"? Write down what you hear for one line. |
| **C2** | Swipe until you reach **Meaning**. Write down what VoiceOver calls it. Double-tap. Then tap once on a meaning under a line. | Expected name: "Meaning · Understand in English and Punjabi". On a meaning: it should speak the English meaning **and** the Punjabi meaning — not a fixed phrase such as "Draft meaning, tap to explore". |
| **C3** | Find **⌃** (expected name: "Expand reading controls"). Double-tap. Swipe through the panel to **×**. Double-tap **×**. | The panel's items are read in order. After closing, VoiceOver is back in the reading, not lost at the top of the page. |
| **C4** | Turn VoiceOver off (three presses of the side button). | — |

---

## What to send back

Copy this, fill it in, and send it in the chat. A few words per line is enough. Three screenshots help: the banner with
the build label (A1), the Home Screen app open in Airplane Mode (B5b), and the saved list after import (B4).

```
iPhone model:
iOS version:
Build label in banner:
Date and time:

A1 banner seen (yes/no):
A2 Japji opened, bar as described (yes/no, what differed):
A3 bar said Pauri 5, Line 1 (yes/no):
A4 "Reading line saved." (yes/no):
A5 "Saved in this browser." (yes/no):
A6 meanings + draft notice (yes/no):
A7 bar after 1st reload:
A7 bar after 2nd reload:
A8 line listed, note still there (yes/no):
A9 file saved, where:

B1 icon name:
B2 opened without address bar (yes/no):
B3 saved line there, or "No saved lines (or reflections) yet.":
B4 merged, line listed, note back (yes/no, what differed):
B5a offline sentence shown:
B5b offline: library opened / Japji opened / bar said / note there:

C1 what VoiceOver said for a line of Gurbani:
C2 name of the Meaning button; what it said on a meaning:
C3 panel read in order; back in the reading after closing (yes/no):

Anything odd, in your own words:
```

## Afterwards (optional tidy-up)

- Remove the test icon: press and hold it → Remove App.
- Remove the test copy's saved data from Safari: Settings → Apps → Safari → Advanced → Website Data (on older iOS:
  Settings → Safari → Advanced → Website Data) → find the test address → delete. This removes `TEST NOTE 1` and touches nothing on the real site.

---

## How the answers will be recorded

- Your answers go, in your words, into `reviews/claude-independent/device-test/results/`, with the phone model, iOS
  version and build label. Only that file may be called an iPhone result.
- The computer rehearsals stay in `evidence/` and stay labelled "emulation".
- A step you did not do is recorded as "not done" — never as passed.
- Longer checks that do not fit in ten minutes are listed separately in `LONGER_FOLLOW_UPS.md`.
