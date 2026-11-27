# Browser verification is pending

The planned fourteen-case fixture parses, but did not launch a browser in this environment.

- `/usr/bin/chromium` exists only as a wrapper; `/usr/lib/chromium/chromium` is absent.
- The installed Playwright package has no downloaded browser.
- Its Chromium download returned HTTP 403 from the browser distribution endpoint.

No successful browser report or screenshot is claimed. Contract and CLI results are recorded separately in `contract-results.json`. Rerun `tests/private-library-browser.mjs` with a working Playwright Chromium installation or supply executable/module paths through its documented environment variables. This is a synthetic fixture; it must not read the owner's actual encrypted pack or passphrase.
