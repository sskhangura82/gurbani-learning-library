# Device test — preparation

Prepared 26 November 2026 (UTC) by Claude, independent second reviewer, at the builder's request on PR #40.

**Status: prepared, not run.** There is no physical-device result for this project.

**Update, 26 November 2026, later the same day.** The owner approved the separate test address directly, in chat,
and it exists: `glp001-iphone-qa.github.io/glp001-iphone-test/`. The missing address and the missing approval are no
longer blockers. The copy there has been checked against the candidate (`TEST_COPY_VERIFICATION_20261126.md`): it is
PR #40 at `09e829e` plus a label, nothing else. What remains before the formal phone check: the repaired commit, my
re-test of it, and a build label on a banner that does not cover the reading line.

**Update, 26 November 2026, 16:10 UTC.** The builder pushed the second repair candidate (PR #40 at `1470477`) and I
have re-tested it: three of its five repairs fixed, two partly, nothing broken
(`../retests/RT-002_PR40_SECOND_REPAIRS.md`). It is fit to be staged for the phone check on one condition: **the
banner must come off the top of the reader first.** Staged with today's banner, the repaired notice is entirely
hidden under it at all three phone widths.

## What is here

| File | What it is |
|---|---|
| `IPHONE_TEN_MINUTE_SCRIPT.md` | The check for the owner's iPhone: Safari, Home Screen app, no connection, VoiceOver, saved place, export and import with a made-up note. Ends with an answer sheet to copy into the chat. |
| `TEST_COPY_VERIFICATION_20261126.md` | The test copy compared file by file with the candidate it names: 47 of 60 files identical, including every script and data file; 58 of 58 offline fingerprints match. Three corrections asked for on the label (TC-01 to TC-03). |
| `LONGER_FOLLOW_UPS.md` | Eleven checks that do not fit in ten minutes. Three of them wait for repairs on PR #40. |
| `results/` | Where device results will go. Empty. |
| `tools/`, `evidence/` | Two rehearsals on a computer pretending to be a phone, so that every button name and expected result in the script is one that was actually seen. Emulation only. |

## What the test copy must have before the formal check is run

Where it stands on 26 November: 1 done · 2 banner done, build label missing (TC-02), and the banner covers the
reading line (TC-01) · 3 done · 4 source commit recorded, first copy so nothing earlier to keep.

1. Its own secure address on a hostname different from the published site's, so that test notes and real notes can
   never share storage. (A home-network address will not do: the readers show nothing without a secure connection —
   `consolidated/evidence/readers_on_plain_http_address.json`.)
2. A banner on every page: **"Test copy — not the library"**, with a **build label** (source commit and date). The app
   shows no version anywhere today, so without the label a phone result cannot be tied to a build.
3. A request to search engines not to list it, on every page. It is public and unlisted — not private.
4. One pinned build, with the source commit and any test-only changes written down, and the previous copy kept.

## What the rehearsals found (emulation — not device results)

Run on the published version (main at a3476ac) and on the repair candidate (PR #40 at 09e829e); Chromium, phone-sized
window. No WebKit engine is installed in this workspace, so nothing here speaks for Safari.

- **13 of 14 scripted steps behaved as written, on both versions** (`evidence/dt_02_journey_rehearsal_*.json`):
  open, jump to Pauri 5, save the line, write a note, Meaning with its draft notice, find the line and note again,
  export one file, start from empty storage, import, merge, note back.
- **The one that did not — the saved place (now CI-R-11).** After a reload, or after the browser's Back button, the
  reader comes back about three lines early, and then saves that wrong place. Each further reload moves it back
  again: from Pauri 20 line 1, three reloads end at Pauri 19 line 5. Closing the tab and opening afresh is exact.
  Cause established for Chromium: the browser restores its own remembered scroll position onto a page whose heading
  is showing again; telling the browser not to do that removes the fault in all four ways of reopening
  (`evidence/dt_01_saved_place_on_reopen.json`). Whether an iPhone does the same is what step A7 asks.
- **Found alongside (now CI-U-11).** In the Japji reader a written note is listed nowhere. The screen headed
  "BOOKMARKS · NOTES · BACKUP" lists saved lines only; with one note and no saved line it says "No saved lines yet."
  The note is not lost — it is in the record and in the export, and reappears at its line — but a reader cannot see
  that it exists. The other two readers do list lines that carry a note (read in their code; not exercised here).

## What depends on the PR #40 repairs

The ten-minute script can be run on the current candidate as it stands. Three longer follow-ups cannot give a useful
answer until their repair lands: FU-3 (RT1-01), FU-4 (CI-R-09), FU-5 (CI-R-08).

## Re-running the rehearsals

```
python3 tools/dt_01_saved_place_on_reopen.py evidence/dt_01_saved_place_on_reopen.json "<label>=<address ending in />" ...
python3 tools/dt_02_journey_rehearsal.py "<label>" <address ending in /> evidence/dt_02_journey_rehearsal_<name>.json
```

Both need the site served from a local address (localhost counts as secure). Both write made-up notes only, into a
throw-away browser profile.
