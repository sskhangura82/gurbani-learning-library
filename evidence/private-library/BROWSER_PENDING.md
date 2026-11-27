# Browser environment blocker resolved with isolated Mac verification

The original blocker below was resolved on 2026-11-27 by transferring only the four fixture source files to a new temporary directory on the authorized Mac. All **15 browser checks passed**, with zero page errors, using a fresh headless Chrome profile and entirely synthetic ciphertext. The browser and HTTP server closed at test completion. No owner password, actual private collection, existing browser profile, reflection or production page was used.

Results: `browser/results.json`. Environment and exact transferred-source SHA-256 hashes: `browser/environment.json`. The source hashes were independently compared with the local candidate at `67125703fd04a370a74bb098470bb14368f4ac40`; all four matched. Three screenshots contain only synthetic content. The 390- and 320-pixel layouts were inspected.

This is desktop Chrome at mobile CSS dimensions. Physical iPhone, Safari, VoiceOver and independent Claude review remain separate.

## Original local-environment failure

The planned fifteen-case fixture parses, but did not launch a browser in this environment.

- `/usr/bin/chromium` exists only as a wrapper; `/usr/lib/chromium/chromium` is absent.
- The installed Playwright package has no downloaded browser.
- Its Chromium download returned HTTP 403 from the browser distribution endpoint.

At that stage no successful browser report or screenshot existed. Contract and CLI results were recorded separately in `contract-results.json`. The later Mac run above established the planned browser behavior without changing the fixture. Future runs of `tests/private-library-browser.mjs` can use a working Playwright Chromium installation or executable/module paths through its documented environment variables. It remains a synthetic fixture and must not read the owner's actual encrypted pack or passphrase.
