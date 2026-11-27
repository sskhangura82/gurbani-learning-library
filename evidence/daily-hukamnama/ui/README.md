# Daily Hukamnama UI — builder evidence

This is builder evidence, not an independent review verdict or release approval.

## Implemented scope

The existing imported Daily foundation now opens the dated original, Simple explanation, Detailed explanation and Learning destinations. The official SGPC link is ordinary static HTML outside script/source gates. Current explanatory slots stay empty with qualified-review-pending labels and an attributed external link to SGPC's current publication; they do not imply a date-matched archive.

The UI uses the dated delivery and dedicated Daily learning modules. It does not change the original fixture, the existing reader stores, or their backup formats. Questions and reflections bind to the exact event, edition, source bytes, full text identity and optional occurrence identity. Saved historical notes remain accessible under their original binding even when that source is unavailable.

Explicit Daily backup/import is separate from the other readers. A separate unsaved-text recovery download preserves a failed-save draft and is plainly labelled as not an importable backup.

The selected date and address remain consistent across reloads. Empty, malformed or duplicate supplied date parameters refuse instead of opening today; an absent date parameter deliberately means Today. Today deliberately removes the fixed date parameter. The next Amritsar midnight is scheduled directly; visibility, pageshow and focus checks cover sleeping pages. Unsaved text keeps its historical source and date.

Direct entry can install the existing offline shell. It never sends an activation message, forces an update or reloads the reader. The existing Library home remains the explicit update destination. Dated public originals use the delivery module's separately verified cache, not the shell inventory.

## Final browser run

Report: `2026-11-27T05-30-32-195Z/report.json`

Command on the authorized Mac:

```sh
GLP_CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/hukamnama-browser.mjs
```

The run used fresh, non-persistent synthetic Chromium contexts against the generated production bundle and its pinned HTML, with the staged signed 27 November 2026 event. No personal browser profile or actual private reflection was accessed.

Demonstrated behavior includes:

- Exact original text at narrow phone, phone, tablet and desktop viewport sizes, including the complete cross-Ang continuation and Rahao.
- Keyboard font enlargement without horizontal overflow.
- Useful pending explanation panels and an official link even without JavaScript or with the bundle blocked.
- No replacement reading for invalid or duplicate dates, source mutations, unavailable dates or refused data.
- Late source responses cannot replace a later date selection or reset an edited saved note.
- Address and reload consistency through explicit date selection, Today and the Saved destination.
- Midnight changes within one second of the simulated Amritsar boundary; dirty historical drafts remain attached to their original date.
- Exact Gurmukhi, emoji, newlines and spacing through private save/export/import.
- Conflicting tab edits kept separately; malformed imports and quota failures preserve the existing record.
- Oversized pasted text is refused intact and remains downloadable as recovery text.
- Print shows the original without private notes.
- No private text or third-party request during writing, saving, import or export.
- Direct Daily URL shell installation followed by a complete same-date offline reopen; an uncached date stays unavailable.

A focused presentation refinement moved date/offline/help controls into a closed native “Choose another date” disclosure, compacted the title and navigation, and retained detailed source checking below the original. At 390 × 844 with initial scroll at zero, the original heading begins at 651 pixels and ends at 714 pixels; the first verse starts at 759 pixels. The always-available official source link begins at 191 pixels. These positions are asserted by the browser check.

Final screenshots are in the same run directory. `phone-offline-ready.png` uses an allowed service-worker context; the layout-only screenshots deliberately block workers to isolate source/UI checks. `phone-simple.png`, `phone-detailed.png` and `phone-learning.png` show the actual pending and neutral learning states.

The earlier full functional pass at `2026-11-27T05-19-26-293Z/report.json` remains preserved. The subsequent run verifies the compact presentation and all the same functional guards; the earlier pass has not been withdrawn.

## Preserved earlier failures

- `2026-11-27T05-09-46-272Z/report.json`: the expected Playwright-downloaded browser binary was absent. No browser scenario ran. The test gained an optional executable-path setting and used installed Chrome; dependencies were not installed or changed.
- `2026-11-27T05-10-08-378Z/report.json` and `2026-11-27T05-12-46-499Z/report.json`: offline installation refused because the test server incorrectly returned 404 for the empty scoped root path with the worker's release query. The existing worker correctly refused an incomplete shell. Only the test server was repaired.
- `2026-11-27T05-13-53-592Z/report.json`: the focused offline check then passed.

The async saved-note reset risk found during builder self-review was repaired before the first real browser scenario run. The test now covers text entered while an unavailable historical source is pending.

## Remaining limits

These results are browser automation, not physical iPhone, iPad, Safari, VoiceOver or human acceptance. No qualified interpretation is supplied. Daily automatic publication remains disabled. No merge, deployment, release approval or custodian contact was performed by this UI work.
