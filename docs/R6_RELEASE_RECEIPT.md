# Revision 6 release receipt — 2026-10-23

Live reader: https://sskhangura82.github.io/gurbani-learning-library/full-japji.html

Promoted runtime commit: **`fa6e4fecd1a5c602b30ffd13ca23416ae911ea83`** (merge of PR #3). Tag: `japji-v1-0.9-r6`. Accepted candidate head: `848b14f5f2c6534fe8ab4351c5003fa42627226b`. Service worker: `0.9-japji-v1-r6-darbar-6`.

GitHub Actions run `40026705972` passed the 53-check portable gate on the exact accepted head. GitHub Pages built the promoted commit successfully. All 24 public HTTP paths returned 200 and matched the final runtime SHA-256 manifest (`evidence/r6-public-assets.json`). A normal browser update from an already cached Revision 4 used Explore → iPhone & offline help → Load update and displayed Revision 6, without clearing site data. The resulting public DOM contained 385 original occurrences and hash attributes, 385 meaning controls, 42 Study drafts and a 54px dock (`evidence/r6-public-browser.json`). Production checks did not export or inspect private reflection contents; persistence proof uses the separate synthetic HTTPS fixture.

The family URL remains account-free, independent of ChatGPT and the Mac. A curated copy of the accepted runtime was saved in the existing Mac releases directory under `0.9-japji-v1-r6/site`; the previous R5 release was retained. R5 tag `japji-v1-0.9-r5` pins `c1bc7c90ef172509edd6dc7b206bc6b8f2a6a9ec`. See `R6_RELEASE_AND_ROLLBACK.md` for safe versioned return instructions.

## Verification retained

53 portable checks, 47 desktop interaction checks, 8 forced reduced-motion checks, final 31-minute session, actual HTTPS R6 → R5 → R6, cached loading after test server files were removed, and independent Claude PASS DESIGN. See `R6_ACCEPTANCE.md` for evidence and precise limits. Ten screenshots include the final public family page and nine viewport captures in `docs/screenshots/r6/`.

Physical iPhone/Safari, VoiceOver, Home Screen, Dynamic Type, notched safe-area, OS reduced-motion and airplane mode remain **NOT TESTED**. Pauri 13 line 1 comparison remains **OPEN**. All 385 bilingual meaning drafts and 42 Study drafts remain **UNREVIEWED**; no religious endorsement is implied. Horizontal gestures remain deferred.

No future room, new audio, image assets, account data or private learning was deployed. Later receipt-only commits may rebuild Pages with identical runtime assets; the runtime commit above remains the release identity.
