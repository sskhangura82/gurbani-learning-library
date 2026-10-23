# GLP-001 Revision 5 — Compact/Quiet Reader Candidate Evidence

As of 2026-10-23T19:20:55.981319+00:00
Base release: **0.9-japji-v1-r4** (public; unchanged)
Candidate: **0.9-japji-v1-r5-candidate**, local-only at authoring time
GitHub integration: review branch, not main; NOT READY TO MERGE.

## One isolated headless-browser comparison, 390px wide
| Measurement | R4 | R5 candidate |
|---|---:|---:|
| Top persistent reading bar height | 127.5px | 60.6px |
| Bottom reading dock height | 133.0px | 57.0px |
| Combined controls | 260.5px | 117.6px |
| Typical Gurmukhi row | 100.0px | 66.5px |
| Top bar in explicit Quiet mode | N/A | 0.0px |

Measured combined chrome reduction **54.9%**, typical row reduction **33.5%**.

## Automated status
- Baseline test suites rerun on candidate: 27 source/learning checks, 8 SW tests, 12 shared-learning checks **PASS**. Total 47.
- Candidate browser harness: **24 checks passed before the following unresolved harness gate**: Error: Not ready: (async()=>!!(await navigator.serviceWorker.getRegistration()).waiting)().
- This is NOT a successful upgrade/rollback test. The test tried to detect the waiting service worker after a local symlink-based preview swap and did not observe it. Work must diagnose real HTTPS installation/activation and preservation; do not erase this limitation or promote on the partial result.
- Physical iPhone/Safari/VoiceOver, complete focus audit, and full redesign to Claude's requested single 56px dock are **NOT DONE**.

## Visual proof to review
- docs/screenshots/r4-before.png — old r4 reader
- docs/screenshots/r5-compact-day.png — candidate compact banner+slim bottom
- docs/screenshots/r5-quiet-day.png — candidate explicit Quiet, top hidden, Play available
- docs/screenshots/r5-compact-amrit.png — candidate Amrit Vela compact

## Source custody
- Candidate modifications limited to the reader's index.html, full-japji.html, css/japji-full.css, js/japji-full.js, and generated service-worker manifest sw.js; no canonical scripture source, 385 concise drafts, 42 Study drafts, saved-learning modules, nor current live family site changed.
- Generated service worker version: 0.9-japji-v1-r5-quiet-final.
- No new player or external audio SDK.
- This branch is for Work to finish and review before merging.

## Follow-up acceptance
- Finish single dock / three explanation-depth controls with 44px tap targets, no persistent header while reading, optional auto-recede with accessible persistent option.
- Remove per-pauri decorative separators from the Read and Understand scripture canvas; preserve accessible headings/Jumps.
- Repeat 47+ automated checks and relevant real HTTPS tests, and demonstrate note preservation across update and rollback.
- If physical iPhone unavailable, report NOT RUN.
