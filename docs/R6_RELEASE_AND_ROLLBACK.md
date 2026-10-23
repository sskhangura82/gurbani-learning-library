# Revision 6 release and rollback

Family entrypoint remains https://sskhangura82.github.io/gurbani-learning-library/full-japji.html. Root `index.html` is identical. No account or Mac process is needed to read it. Notes are browser-local; different devices and origins do not synchronize automatically.

## Update a reader

Open the dock's expansion, then Explore → iPhone & offline help → Check for update. Export learning before a consequential update or moving between browser/Home Screen contexts. Use Load update when ready; the app persists pending learning before activation. Close old reader tabs after the new version loads. Never clear site data as an update step.

The worker validates all 23 shell routes (22 distinct content files; plus the worker gives 23 distinct runtime files) against SHA-256 before installation. A failed or incomplete download cannot activate a partial shell. Waiting updates do not take over until the reader requests them. The scope-specific static cache contains no notes or reflections.

## Preserved rollback target

Tag `japji-v1-0.9-r5` points at `c1bc7c90ef172509edd6dc7b206bc6b8f2a6a9ec`. The complete previous Mac release remains retained. The actual HTTPS test used this R5 runtime with only a QA learning-key namespace and a new worker version.

To prepare a rollback, use a separate checkout and copy only the runtime files listed in `evidence/r6-artifact-manifest.json` from the R5 tag. Keep current docs and tests. Generate `sw.js` using `node tests/build-sw.mjs <new-unique-rollback-version>`; do not reuse an installed cache version. Run the portable checks appropriate to the restored bundle and the same explicit HTTPS lifecycle test with synthetic learning. Commit a complete bundle, compare current main against the expected head, and use a reviewed PR. No force push or protected infrastructure changes are required.

Retain the R6 tag and source so a return upgrade can generate another fresh worker version. Never remove the service worker or delete localStorage to roll back. Existing notes, bookmarks, original settings and export formats are the preservation contract. The R6-only “Keep page controls visible” preference is not a feature of R5 and may need to be selected again after a downgrade/return; it is not part of the tested R5 preference set.

## Coverage and limits

The final HTTPS receipt records R6 → R5 → R6 on one browser/origin/scope using actual service-worker installation and explicit activation. It checks all three legacy/current synthetic learning stores, bookmark, theme, text size and radiance. A separate UI observation verifies a new R6 reflection under R5. The cached-reader test removes the server files and verifies cached content still loads; this is an unavailable-origin/cache-fallback check, **not physical airplane-mode testing**.

Physical Safari, Home Screen, VoiceOver, actual OS reduced-motion and real device offline behavior remain NOT TESTED. Pauri 13 line 1 remains an open independent source comparison. Do not describe these as passes.
