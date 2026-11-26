# Future rooms — local review only

Two separate concepts in the existing library: Simran Room and Gurdwara Arrival. **Do not deploy or merge this prototype.** The public-safe source belongs on an unmerged review branch; the interactive prototype runs locally. No root reader asset, production link, manifest or service-worker shell entry is changed.

Serve the repository root with a local static server, then open `prototypes/rooms/index.html`. It embeds the unchanged accepted `full-japji.html` and uses a native dialog to explore rooms. The parent adapter has no learning storage or external media request. Returning retains the mounted reader and restores its occurrence offset; the guide remains paused until deliberately resumed.

Run `node prototypes/rooms/verify.mjs` for source, custody, silence, rights and timezone checks. Open `prototypes/rooms/qa.html` and select Run room checks for interaction verification. The QA page constrains the prototype to 390px and 320px; these are desktop CSS viewports, not physical iPhones.

Design briefs and exact claim/source/rights boundaries are in `docs/future-rooms/`. Practice instructions and new interpretations are withheld. Natural breath attention is an optional UX experiment, not a Sikh practice prescription. The arrival contains no image, no autoplay and no invented broadcast status.

Physical iPhone/Safari, VoiceOver, Home Screen, external-app return, true offline behavior and specialist content review remain untested or pending. No public release is implied by passing prototype engineering checks.

## Recorded verification

10 Node contracts, 34 browser interaction checks, and 4 manual keyboard/label checks passed. Five screenshots are in `docs/future-rooms/screenshots/`. The adapter preserves all 23 accepted runtime-file hashes. These results do not authorize public religious instruction or physical-device claims.

Harness corrections are retained: initial readiness expected Play and did not accept the preserved Resume state; initial return comparison used the position before pressing Play, although Play legitimately resumed its guide position before room entry; an early focus check sampled before the native dialog close event. The final harness measures the actual room-entry position (6411 CSS px) and verifies exact return, waits for close, and tests both widths. No source text or reader runtime was changed to satisfy a test.
