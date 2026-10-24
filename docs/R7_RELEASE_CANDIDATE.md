# GLP-001 R7 — Home, pace and sacred-space preview candidate

**Status:** implementation candidate; production family GitHub Pages is still Revision 6 until deliberate promotion.
**Baseline:** afd5843ac6a85b872a7edd1786c1fef3c4d37a2a
**Service worker:** `0.9-japji-v1-r7-home-speed-2`; 32 hash-verified static shell entries.

## Shipped into candidate
- New front page under `index.html`: serene Day/Amrit Vela library home with **Nitnem → Japji Sahib**, **Gurdwaras**, and **Simran Room** as clearly labeled destinations. Home Screen app manifest starts at root. Japji remains at `full-japji.html`.
- Reading dock retains R6's three levels and accessible immersive controls. One-tap 50–160 illustrative-token/min visual speed shortcut + numeric range slider and ±5 controls; no sound and no claim of real recording alignment. Site state uses existing cross-tab storage locks; source/meaning/Study unaffected.
- New Gurdwara directory and three arrival pages with individually themed environment, IANA local time, official histories and deliberate provider links. Photos deferred until license/attribution; no livestream or live-status invention.
- New jade/teal Simran Room silent **preview**: optional pause timer with no stored metrics, and exact Japji Pauri 4 Gurbani quotation (Ang 2) with source; **no unreviewed Sikh practice instruction, no speech, no special breathing techniques**.
- Future SGGS/Nitnem content architecture documented separately. Does not merge/deploy PR #4 prototypes.

## Verified
- 27 immutable scripture/data & learning contracts; 8 service-worker; 12 shared-learning; 7 R6 inherited/pacing and 12 R7 home/pace/room contracts: **66 portable checks passed**.
- Mac Chrome browser 320/390 CSS width, navigating all new pages and changing speed while guiding: **36 passed**.
- Chrome simulated-network-offline reloads of new Home, Japji, Gurdwara and Simran from the cached, hash-verified 32-route shell: **8 passed**.
- Actual service-worker lifecycle at trusted loopback: **R6→R7→R6→R7**, three synthetic saved-learning generations and bookmarks/reflections preserved: **16 passed**.
- 7 immutable data modules byte-for-byte match R6 (including 385 original Gurmukhi, 385 bilingual drafts, 42 Study drafts, source and Web Locks modules).
- Screenshots at `docs/screenshots/r7/`, safe to share. No private user reflections, credentials, photos or audio included.

## Important limitations
- No physical iPhone Safari, installed Home Screen, VoiceOver, actual OS reduced-motion or physical airplane-mode acceptance; these are **NOT TESTED**. GitHub Pages production HTTPS version change still needs independent post-push checks and an explicit update/rollback assessment.
- Existing iPhone Home Screen installations may continue launching `full-japji.html` even though the new manifest starts at Home. Do not delete local data. Export learning and, if needed, open root in Safari and add a *new Home shortcut* instead of clearing site storage.
- All 385 bilingual and 42 Study lessons remain **AI-assisted educational drafts** without expert approval; Pauri 13 line 1 independent digital collation OPEN. Sikh Simran instructional content remains held.
- No gurdwara photographs (rights not yet documented), stream embeds or real audio synchronization. Gurdwara local time is not a live programme indicator.
- App remains family-shareable without login, but the public GitHub Pages URL is reachable by anyone with the link.

## Safe promotion
Compare current `origin/main` head against recorded base; abort and reconcile if advanced. Run 54 portable checks and focused browser route/speed/navigation/lifecycle tests on candidate. Use a PR with scope-limited diff and rollback tag. Promote to the same GitHub Pages URL only after CI and web validation; preserve R6 complete runtime for rollback. Never force-push or clear any reader's local learning.
