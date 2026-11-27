# Builder browser evidence — 27 November 2026

These checks exercised the isolated candidate through a local HTTP server and fresh synthetic browser contexts. They are builder checks, not independent review or release approval.

## Environment and scope

- macOS; Node v22.15.0.
- Installed Google Chrome 158.0.8127.37, launched headlessly from /Applications/Google Chrome.app/Contents/MacOS/Google Chrome through Playwright.
- The module-transport harness mounts the app below /preview/ and refuses every Library, Articles or Knowledge JavaScript module URL except the three generated app.bundle.mjs files.
- Service workers are blocked in that harness to isolate module network loading and browser Subresource Integrity. Offline update behavior is outside this browser suite.
- Every context starts fresh. No existing profile, private reflection, bookmark, user backup or other real user record was accessed.
- These are CSS viewport checks, not physical iPhone, Safari, VoiceOver or other device acceptance.

## Observed behavior

The normal Library, Articles index, Haumai source sheet and Knowledge pages loaded below /preview/ without requesting any original source module or additional module chunk. Directory links and source-reader links retained the preview prefix. All four pages measured 390 CSS pixels wide in a 390-pixel viewport, with no horizontal overflow.

For each of the Library, Articles and Knowledge module graphs, the harness prepended a synthetic observable side effect to an actual dependency source in memory and rebuilt the complete bundle. When the changed bundle was served under the original HTML integrity pin, Chrome refused execution and the app never reached readiness. The same changed bundle, explicitly re-pinned in fixture HTML, executed its dependency side effect and retained normal application behavior. No source file on disk was changed by these synthetic mutations.

The three existing Knowledge browser suites now rebuild and re-pin fixture bundles when intentionally renewing the editorial package pin. Every such semantic fixture proves that the rebuilt bundle reached source verification and, when appropriate, fetched the teaching package. It also refuses to count a browser integrity rejection as a content-guard rejection. Existing permitted editorial controls still passed, alongside attribution, corrupted-source and navigation checks.

## Evidence folders

- 2026-11-27T03-02-39-763Z-module-transport — transport report and four 390-pixel screenshots.
- 2026-11-27T03-02-48-414Z-knowledge-integration — integrated semantic/navigation evidence.
- 2026-11-27T03-02-52-884Z-knowledge-editorial-boundary — attribution boundary and permitted-control evidence.
- 2026-11-27T03-02-58-220Z-knowledge-pilot — pilot interactions and source/editorial re-pin evidence.

All four runs passed on the first executed browser run. There was no failed browser run to discard or overwrite. Imported earlier evidence was not changed; all new results are under this browser directory.

## Recorded limitations and visible issues

- Chrome reports an existing Library-page console message: frame-ancestors is ignored when supplied in a Content-Security-Policy meta element. It is preserved in the transport report; no claim of a completely clean console is made.
- Visual inspection of library-390.png shows the Clear button splitting into “Cle” and “ar” after a search. This is a small existing layout issue, reported to the builder; these test changes do not alter application CSS.
- The full-page Library screenshot places its fixed bottom navigation at the captured viewport position. A full-page screenshot is not a literal image of the entire page simultaneously visible on a phone.
- The source sheet retains its empty explanation and qualified-review notices. Knowledge continues to label its existing educational and comparative drafts. These browser checks make no theological or scholarly approval claim.
