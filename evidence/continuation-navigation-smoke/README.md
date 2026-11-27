# Combined continuation browser verification

All **39 checks passed** on the combined application at commit
`da9fe489921addc33591f25204a9bbf07d40ef6f` on 27 November 2026.

| Suite | Checks | Result | Evidence |
| --- | ---: | --- | --- |
| Public/private navigation at 320 CSS pixels | 10 | PASS | `results.json` |
| Closed bundles and script integrity transport | 13 | PASS | `../library-script-integrity/browser/2026-11-27T21-06-24-952Z-module-transport/report.json` |
| Knowledge integration and source boundary mutations | 10 | PASS | `../library-script-integrity/browser/2026-11-27T21-06-27-610Z-knowledge-integration/report.json` |
| Offline release installation and update preservation | 6 | PASS | `../library-script-integrity/offline/2026-11-27T21-06-30-736Z/report.json` |

The tests ran in fresh temporary headless Chrome contexts on macOS, using
Chrome 158.0.8127.37, Node v22.15.0 and Playwright 1.62.1. The isolated checkout
was `/tmp/glp-final-browser-y5b4ko9n/repo`; an existing browser profile was not
used. The candidate arrived through a verified Git bundle, with SHA-256
`a8ffd86b2b850747b66306d6b437cc84d6e034ffd0e14aa49ff1713d5ae59314`.
No remote push or deployment was performed by this verification task.

## Observed coverage

The navigation suite opens the root Read and Explore views, the public Dasam
entrance, each of its three correctly mapped existing readers, the public
Psychology page and the locked private reading entrance. It verifies that the
public offline manifest excludes the private reader and encrypted collection,
that the private collection is not requested on a locked visit, and that no
uncaught script errors or external requests occur. The five screenshots record
the 320 CSS pixel layouts. All five were visually inspected; the fixture's
horizontal overflow assertions passed.

The other three reports retain their complete assertions and observed data.
These include blocked modified bundles with unchanged integrity pins,
successful repinned controls, scripture/editorial separation and refusal
cases, corrupt and missing offline update refusal, preserved synthetic learning
records, explicit update activation and offline rendering after the update.
Expected integrity-refusal console messages remain in their original report.
The root page's pre-existing warning that `frame-ancestors` is ignored in a
meta-delivered CSP is also retained; no frame protection is inferred from it.

## Initial fixture failure and correction

The first navigation run failed because the fixture's default repository path
retained a trailing slash. Its containment comparison added another slash and
rejected the first root page with HTTP 404. This happened before a page was
loaded. `initial-fixture-failure.json` and `first-run-logs/` preserve that
failure and the three other suites' successful first runs.

The correction wraps the fixture's default `fileURLToPath(...)` result with
`path.resolve(...)`. It changes one test line and no application bytes. The
navigation rerun passed all ten checks; see `navigation-rerun.log` and
`environment.json`. Its fixture SHA-256 was checked against the transferred
test file. All 38 source-file hashes recorded across the navigation and
Knowledge reports were independently matched to the application commit above.

## Privacy and limits

No real private passphrase, plaintext collection or personal reflection data
was transferred to or used on the Mac. The navigation fixture refuses the
actual ciphertext route before reading the file, and never attempts to unlock
the real collection. The committed screenshots show public pages and a locked
private page only. The earlier separate private-reader browser evidence uses
synthetic encrypted content.

The navigation fixture blocks service workers and checks manifest exclusion;
the offline suite tests the public worker separately. These are desktop Chrome
checks at narrow viewports, not physical iPhone, Safari or VoiceOver acceptance.
They are builder verification, not independent Claude review, source-rights
approval or a release decision. Later history metadata changes were not part
of this application-byte verification.
