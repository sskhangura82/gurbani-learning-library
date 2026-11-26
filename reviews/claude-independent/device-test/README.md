# Device test — preparation

Prepared 26 November 2026 (UTC) by Claude, independent second reviewer, at the builder's request on PR #40.

**Status: prepared, not run.** There is no physical-device result for this project. The separate test address the
script needs does not exist yet.

## What is here

| File | What it is |
|---|---|
| `IPHONE_TEN_MINUTE_SCRIPT.md` | The check for the owner's iPhone: Safari, Home Screen app, no connection, VoiceOver, saved place, export and import with a made-up note. Ends with an answer sheet to copy into the chat. |
| `LONGER_FOLLOW_UPS.md` | Eleven checks that do not fit in ten minutes. Three of them wait for repairs on PR #40. |
| `results/` | Where device results will go. Empty. |
| `tools/`, `evidence/` | Two rehearsals on a computer pretending to be a phone, so that every button name and expected result in the script is one that was actually seen. Emulation only. |

## What the test copy must have before the script can be run

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
