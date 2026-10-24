# GLP-001 · Physical iPhone acceptance matrix (M0)

**Status: NOT RUN.** Prepared 2026-10-24. This is a scripted *manual device test*, not evidence that any physical iPhone behavior has passed. The accepted family site stays R7 unless a later accepted release certificate changes it.

## Preconditions

- User-controlled iPhone, iOS version recorded **privately** for compatibility (not a device identifier, phone number, Apple ID or location).
- Stable family URL: https://sskhangura82.github.io/gurbani-learning-library/ ; direct Japji: https://sskhangura82.github.io/gurbani-learning-library/full-japji.html .
- Device connected at first launch and legitimate cached/installed app; no login. **Before any navigation or reinstall, use Explore → Saved learning → Export learning and save a backup.** Do not erase site data or remove an existing installed icon as a default repair.
- Note exactly whether tests run in Safari browser tab, installed Home Screen standalone, or both. Browsers and Home Screen apps may not share identical local storage contexts.
- Test only nonprivate synthetic text such as “GLP acceptance 1”; don't share personal reflections or consented recordings in screenshots or support reports.

## High-priority path for the founder (5–10 minutes of user actions)

1. Open **Home** in Safari. Confirm Nitnem/Japji, Gurdwaras and Simran Room are plainly visible without navigating a ten-option reader menu. Open Japji.
2. In **Read**, tap Play and observe Gurmukhi radiance and scrolling across the next pauri boundary. Pause, change visual speed to 160, resume; no words are clipped.
3. Switch **Understand**, tap a short English/Punjabi explanation and return. Confirm same Gurbani location. Switch **Study** and back. Original script must remain intact and largest.
4. Save a synthetic reflection and a bookmark, close Safari, reopen the site, and verify both remain. Export and retain a local backup.
5. Open the stable root in Safari → Share → Add to Home Screen if an icon is desired. Open it. Note separately whether an older icon still opens the direct Japji route. **Do not delete the older app or clear data to solve that.** Record whether backup/import is needed.

## Full evidence matrix

| Test | Action and expected result | Result |
|---|---|---|
| Safari entry and no account | Open root URL in new tab; library home loads, no ChatGPT or account prompt | NOT RUN |
| Three visual environments | Home Day/Amrit Vela and reader Day/Amrit Vela are separately selectable, legible and not visually overbusy | NOT RUN |
| 320/390 CSS width / orientation | Physical portrait and landscape without horizontal scrolling, clipped matras or overlapping dock | NOT RUN |
| Large Gurmukhi / Dynamic Type | Test largest in-app size and iOS text scaling up to 200% where supported; preserve matra visibility and taps | NOT RUN |
| Tap targets | All visible Play/Pause, levels, pace, Jump and close actions reachable at approximately 44×44 CSS px | NOT RUN |
| Source continuity | All Read and Understand continue across Pauri 1→2, 2→3, and later sample boundary without a page replacement or source mutation | NOT RUN |
| Guided-clock truth | Silent guide is labeled independent of audio; setting 160 speeds glow/scroll visually but never claims to follow YouTube | NOT RUN |
| Explain in place | A line's simple meaning opens deeper panel; exit restores precise source position; no surprise swipe away | NOT RUN |
| Saved-learning integrity | Bookmark, reflection, mode/theme/pacing survive reload, tab close/reopen, and version-update attempt | NOT RUN |
| Home Screen manifest | Add from **root** to Home Screen; standalone opens the intended home, not an unintended old deep-link | NOT RUN |
| Airplane mode | After verified offline cache, enable actual airplane mode and reopen Home/Read/Understand/Study as cached; external broadcast not expected offline | NOT RUN |
| VoiceOver | Rotor landmarks and buttons; Gurmukhi marked `lang="pa"`; source order natural; modal focus and close work; device voice support recorded, not assumed | NOT RUN |
| Reduced Motion | Device Accessibility → Reduce Motion; no compulsory breathing radiance or smooth scroll; current passage remains indicated without glow | NOT RUN |
| Long session | 20–30 minutes of uninterrupted reading and controlled pause/resume without accumulating drift, heat or lost place | NOT RUN |
| R8 YouTube beta (separate candidate) | Do **not** test on family site until PR #7 has a valid controlled test address and provider policy review; embedded real visible video, user gesture and close/pause | NOT RUN |

## Evidence and decision fields (fill after running; no sensitive identifiers)

- Date, iOS version and viewport/orientation: `__________`.
- Tested URL/version/worker: `__________`.
- Test operator and scope: `__________`.
- Pass/fail/blocked for each row, with a short reproducible description and an optional redacted screenshot.
- Saved-learning test: pass/fail + verified exported backup filename (no private contents).
- Accessibility reviewer qualified? `__________`; if not, mark **informal check only**.
- Founder product acceptance? `__________`; **does not equal qualified religious translation review**.
- Open defect(s) for Work, reproduction steps, bug severity and rollback need: `__________`.

**Exit requirement:** no critical scripture/source mismatch, invisible controls, lost learning or clipped text; honest labeling of untested modes. UI acceptance does not close the separate Pauri 13 line 1 independent scriptural collation or bless the AI-assisted lessons as authoritative.
