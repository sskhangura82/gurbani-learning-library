# Existing Simran Room: silent boundary refinement

Candidate work only, 26 November 2026. Not deployed, independently approved, or tested on a physical phone.

## What changed

The room that already exists in `simran.html` is retained. The live countdown is removed. A person chooses an optional length before beginning; the duration controls and summary then leave both the visible page and the accessibility tree, including while paused. An end message is shown once. There is no bell or other sound, and the page describes this honestly. An early End returns to preparation.

A `pagehide` event now pauses the sitting as well as stopping its interval. Before this change, a document frozen for history navigation could retain a running flag and a Pause button after its interval had stopped. Resume now schedules the remaining interval explicitly. Hidden pages continue to pause; this room does not promise background or lock-screen completion.

Visual inspection also found that the generic explanatory-paragraph selector overrode the scripture anchor’s intended type size. Its selector now excludes the original-text block, retaining the existing intended 23–31px Gurmukhi sizing (25px on narrow viewports). The source bytes are unchanged.

Nothing is stored, counted or synchronized. No breath pacer, new practice instructions, theological interpretation, recitation, session log or account has been added.

## Source attribution boundary

The displayed Gurmukhi is unchanged, and retains `lang="pa"`. The heading uses the verified composition/section attribution **Japji Sahib, Pauri 4**. The external link is named **Guru Granth Darpan reference** instead of claiming an independently verified Ang in the interface.

The builder located a candidate digital Ang witness at OpenGranth commit `34d2a7cab032c8ea24d21ff20f64653bd03766f4`, `corpus/ang-0002.md`, source line 5, file SHA-256 `04feb2d0646711d3ac40cd9c42f602bda3756890ba25cdf2a0ac1df38c2d5c33`. This is recorded for independent review; it is not physical-page collation and does not establish independent upstream transmission. SF-03 remains with the independent reviewer to adjudicate.

## Reproduce the focused browser check

`CHROMIUM_PATH` is optional; omit it when using Playwright's installed Chromium.

```sh
CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/simran-session-browser.mjs
```

The check uses a fresh temporary localhost origin, nonpersistent Chromium context, synthetic storage sentinel and simulated clock. It verifies original Gurmukhi preservation, removal of duration from visual and accessibility trees, pause/resume timing, one end message, the pagehide and hidden-page state transitions, all offered lengths, narrow/wide layout, and unchanged unrelated synthetic storage. Results are in `evidence/simran-session/report.json`.

The same script can serve only the three pre-repair Simran files from frozen source commit `792afa209c98bb53f257a8dfd5500bef10bfc8e3`, without changing the worktree:

```sh
SIMRAN_TEST_BASELINE=1 CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/simran-session-browser.mjs
```

That baseline mode intentionally exits unsuccessfully: its three targeted checks demonstrate the displayed countdown, old attribution wording and inconsistent pagehide control state. Results are in `evidence/simran-session/baseline.json`.

## Limits

The pagehide and visibility events in these focused tests are explicitly simulated; actual browser back-cache behavior remains a separate check. Viewport checks at 320, 390, 820 and 1440 pixels are desktop Chromium checks. They do not establish iPhone, iOS Safari, VoiceOver or real background-timing behavior. No qualified interpretation review or printed-page collation is claimed. The source text and teaching packages are untouched.
