# GLP-001 — Serenity private phone-preview QA handoff (not a release)

**25 October 2026 UTC / 24 October Pacific. Status: REVIEW PREVIEW AVAILABLE, FAMILY RELEASE BLOCKED.**

## Custody and exact build

- Source for running static preview: GitHub PR #18, commit `3033fc26f8b6da85c689bea209efdc68297ff609`. The new preview build uses exactly the same versioned worker `0.9-japji-v1-m0-serenity-review-1`. Further documentation/test commits do not alter its frozen runtime bytes.
- Main and the accepted public Revision 7 family URL were **not changed**. Parent M0 PR #11 and Mind PR #19 remain draft and independently gated.
- `tests/prepare-private-preview.mjs` verifies every SHA-256 manifest entry from `sw.js` and creates a **new immutable directory containing only the pinned static assets and worker** (33 files; two URL routes share index.html). No Git metadata, source review documents, QA harnesses, personal learning, credentials or private recordings are staged.
- `tests/serve-private-preview.py` serves only manifest-allowlisted read-only GET/HEAD routes, binds `127.0.0.1`, blocks directory listing, rejects uploads and adds noindex/nosniff headers.
- An existing user-controlled **Tailscale Serve, tailnet-only HTTPS** route forwards its own separate review port to that loopback server. Existing web services/ports are preserved. Never use Funnel/public internet exposure for this preview. The actual tailnet hostname is held in the private local project record, **not** committed to the public GitHub repo.

## Evidence

The running private HTTPS preview returned HTTP 200 for Home, Japji, generated worker and Serenity CSS with a trusted TLS certificate; attempts to fetch source/test paths returned 404. `evidence/serenity-private-https-readiness.json` records **12 PASS** assertions from a completely new Mac Chrome browser profile, including:

- HTTPS secure context, real Web Locks and real service-worker installation.
- All 385 original frozen Gurmukhi source occurrences exact, with Serenity CSS loaded.
- Six ≥44px controls and no overflow at simulated 320/390 mobile CSS widths.
- Unique versioned cache containing the new reader and Serenity stylesheet.
- An **app-UI-created, synthetic-only** Punjabi reflection and bookmark retained across full page reload.
- Reader and Home loading while Chrome network emulation is OFFLINE; synthetic learning remains after returning to the cached reader.
- No browser runtime exceptions in this tested path.

This is an actual Mac Chrome HTTPS/service-worker test, **not** physical iOS Safari/Home Screen/VoiceOver validation or independent design/editorial approval. Browser-local data is siloed by origin; copying family notes between URLs requires an intentional user export/import. The QA route is not a permanent family URL and requires a running Mac, Tailscale and the review server.

## Founder physical iPhone QA — not yet performed

Use only sample notes in the private candidate; no real private reflections or screenshots containing them. Preserve the existing live R7 family icon, app data and exports. At the private candidate URL in Safari with Tailscale connected:

1. Verify Gurmukhi readability and complete matras in Read from Mool Mantar, the opening/closing Saloks and a later pauri. Switch Day/Amrit backgrounds.
2. Check all six bottom controls, location label, Read → Meaning → Study → Read, Jump and Return, including changing scripture size to 60px and enlarged iOS text.
3. Play and pause the *silent visual* guide; pace and location must remain usable. It is not audio synchronization.
4. Add a synthetic bookmark and reflection, close/reopen the Safari tab and confirm they remain; export test learning. Do not import the family reader's private notes for this QA.
5. With the offline shell installed, turn on actual Airplane Mode and reopen the cached reader. Simulated desktop offline tests do not answer this step.
6. If possible, test VoiceOver order, meaning-controls discoverability, modal focus and reduced motion. Record any rendering defects, lost learning, clipped labels or unreadable words.
7. Use the existing `docs/acceptance/M0_PHYSICAL_IPHONE_ACCEPTANCE.md` and `docs/M0_DEVICE_REVIEW_FOLLOWUPS.md` for complete device evidence. All actual iPhone entries are currently **NOT RUN**.

## Release decision boundary

**No merge, no public production deployment, no teaching approval.** The user may continue using accepted R7 immediately. A private, short-lived phone QA session is not family release acceptance. After actual iPhone evidence and independent design review, prepare a new release certificate; preserve the immutable source, visibly draft meanings, separate Mind/editorial holds and distinct founder publication authorization. Never silently swap the public family site or erase existing saved learning.

**Rollback / shutdown:** remove only the separate review HTTPS port from Tailscale Serve and stop its loopback server; do not reset other Tailscale ports, user devices, R7 service worker or production GitHub branch. The immutable preview folder and result receipt may remain as private evidence. A future accepted release gets a new worker version; never reuse the review worker cache identifier.

## Second private device candidate — accessibility review-2 (24 October Pacific)

After the original Serenity private preview, the same GitHub child PR gained reader accessibility changes (source commit `5637eabc22c3ac37857b4fc95c13e8d66c6714a5`; unique worker `0.9-japji-v1-m0-serenity-review-2`). A **separate** immutable 33-file, manifest-hash-checked snapshot serves this follow-on candidate, over **a different tailnet-only HTTPS port** and its own loopback-only allowlist server. The earlier private candidate is not overwritten; neither changes accepted R7, public GitHub Pages or the Mind Room.

Isolated Mac Chrome on the new trusted HTTPS candidate returned **12 PASS** checks again for source identity, service worker/Web Locks, 320/390px geometry, app-UI-written synthetic reflection/bookmark, cache integrity, blocked-network reader/Home use and persistence. The updated `evidence/serenity-private-https-readiness.json` is sanitized and never contains the private hostname. The new reader-specific 14-check Chrome accessibility pass and 10-check versioned upgrade/rollback pass are separate receipts. The tailnet hostname, port mapping and local immutable snapshot location belong only in the private Mac operator record, not in this public review packet.

**NOT RUN:** actual iPhone Safari, VoiceOver, Home Screen storage or Airplane Mode, qualified Sikh/Punjabi or accessibility review, founder publication word. Both test candidates remain unpublished review previews. Different HTTPS origins intentionally have different browser-local learning; use synthetic notes only, and never silently copy family R7 reflections.
