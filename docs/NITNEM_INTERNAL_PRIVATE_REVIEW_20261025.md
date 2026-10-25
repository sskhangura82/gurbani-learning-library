# GLP-001 · Same-library Full Nitnem original reader — private review beta

**Date:** 25 October 2026. **Branch:** `feature/glp-internal-nitnem-reader-review-20261025`. **Status:** Build and local Chrome QA PASS, family publication and qualified scripture-review gates OPEN.

## Founder request and actual delivery

The founder rejected external Gurmukhi reading links. The product direction is **one native-feeling Gurbani Learning Library reader**, preserving the existing Japji Sahib experience. This build adds `/nitnem/index.html` inside that same library and private HTTPS invitation. All seven daily banis are reachable from that collection: **Japji Sahib** goes to the existing same-origin, 385-original-line continuous reader; the other six load **Gurmukhi source data locally from our own protected app**, not third-party webpages. External website links and their embedded translations are absent from the new reader UI.

The same `js/continuous-core.js` byte-for-byte is reused under `nitnem/continuous-core.js`. The new frontend offers Read / Meaning / Study controls, passage jumping, direct Jaap chhand selection, silent guide, text size 28–60px, Day/Amrit appearance, bookmarks, private notes, export and import. **Read is functional with original digital-source candidates. Meaning and Study translations are NOT ready**: Meaning displays an explicit pending-review notice; Study displays provenance facts, never invented translations or spiritual interpretation. Silent word highlighting is not synchronized audio or santhiya.

### Exact new source scope

| Bani | Source units | Original source records | Source disclosure |
|---|---:|---:|---|
| Jaap Sahib | 199 chhands | 782 | Digital candidate, 21 original metre headings, 67 disputed comparison groups |
| Tav-Prasad Savaiye | 10 | 40 | Sravag Sudh, 13 compared text differences |
| Benti Chaupai Sahib | 29 pauris | 116 | Site-specific expanded **digital variant**, not a universal morning boundary |
| Anand Sahib | 40 pauris | 208 | Original Ang 917–922; `anand24.line03` source Unicode is held and **not displayed as approved Gurbani** |
| Sodar Rehras Sahib | 44 mixed-source units | 159 | SGPC six-part digital candidate, SGGS/Dasam differentiated; independently approved Angs and optional variants pending |
| Kirtan Sohila | 5 shabads | 56 | SGGS Ang 12–13 digital candidate; source-heading differences pending |

**Total: 1,361 original Gurmukhi candidate records** outside Japji. The six source packages are reproducibly compiled only from PR #20 pinned commit `373ccc34f4a1c0ccb6ce36654bf6e9574087200f`, with every original occurrence's unchanged UTF-8 text and SHA-256 verified. `tools/nitnem/build-source-packs.py` refuses unapproved source promotion, different source SHA/commit, duplicated occurrences or fabricated Dasam SGGS Ang. The library manifest is hard-pinned to SHA `b5865b293acc3ea91a20487dd82efd6f503d22dc5823bc2a67effcd146840d7a`. The cached private worker and entire source bundle are similarly SHA-verified.

**Anand cannot yet honestly be called a complete approved recitation**: Pauri 24 has a digital private-use-codepoint discrepancy. The unaltered original is preserved in the review data, but its line is replaced **visually** with a clear source-review hold; the silent guide stops there. The alternate digital transcription is not silently substituted.

## Architecture, privacy and rollback

- Existing accepted public **Japji R7** remains byte-identical. Private Serenity `full-japji.html` and older linked Full Nitnem Today page remain available at their same-origin routes.
- A **new service worker only for the `/nitnem/` path** hashes and caches 11 exact approved-for-QA assets (site shell, one original-only reader, existing byte-identical pure core, source manifest and six original-data packages). It does **not** modify the existing root `sw.js`, its root cache namespace or canonical user learning. Chrome with network blocked successfully reopened Jaap, Anand and Rehras source candidates. Physical iOS airplane mode remains NOT RUN.
- Each candidate's notes, bookmarks, size and place are stored in an independent source-and-edition-scoped `glp001.nitnem.PRIVATE-SOURCE-REVIEW.v1.*` browser key. No existing `glp001.continuous.v2` data is read, migrated or overwritten; exports/imports require exact source edition match. No analytics, account APIs, media calls, embedded providers or third-party links.
- The private URL is granted by the same high-entropy bearer invitation via a Secure/HttpOnly/SameSite=Lax cookie. This is **access by possession of link, not named-user authentication**. Invitation and signing key remain exclusively in owner-only Mac files, never GitHub. No personal learning or raw tunnel URL appears in the public PR.
- The **existing Cloudflare Quick Tunnel is temporary** and may become unavailable after reboot/expiry. All QA originals and cached copies remain the same edition even when its endpoint is unavailable.

**Rollback (no accidental family changes):** stop only the upgraded reader gateway on loopback `127.0.0.1:8908`, restart the prior `tests/serve-gated-nitnem-today.py` against the unchanged `previews/full-nitnem-today-20261025` folder and `full-nitnem-extra-sha256.json`. Leave Cloudflare tunnel, public GitHub Pages, Tailscale ports 443/8443/10000/10001, and personal reading/learning storage untouched. The new static preview and manifest persist as evidence. Never use `tailscale serve reset` or GitHub-main deployment as a rollback.

## Tested

- **38 actual isolated Mac Chrome UI checks PASS**: all seven internal cards (no external text providers), complete six source-manifest identities, originals, source variants, working passage navigation, Jaap 199-chhand jump, 320px six-button dock, 60px Gurmukhi/Amrit mode, draft-only Meaning/Study states, separate notes/bookmarks across reload and editions, held Anand Pauri 24, mixed SGGS/Dasam Rehras, SHA-verified private `/nitnem/` service worker and offline source loading under blocked browser network.
- **16 deterministic source-and-UI contracts PASS**, covering all 1,361 exact Gurmukhi SHA entries, 11 cached asset hashes, no external links and separation from family Japji originals.
- **38 temporary private gateway defense checks PASS**: anonymous 401, bad invitation 403, valid invitation 303, 15 authenticated old/new allowlisted assets, 404 for private engineering paths, forged cookies rejected, POST 405 and tampered source asset-manifest rejection.
- Hosted GitHub Actions CI runs **without hosting, deploying or touching private authentication**. QA evidence screenshots include `evidence/nitnem-internal-rehras-390.png`. Chrome ≠ iPhone Safari/VoiceOver.

## Remaining release requirements

1. Human-verified original authoritative SGGS and Dasam editions, legitimate reuse/rights reasoning, and independent adjudication of digital source discrepancies (especially the Anand Pauri 24 Unicode and morning Chaupai choice).
2. Qualified Sikh/Punjabi text/exegesis reviewers for original, Punjabi/English meanings and deeper Study. Draft educational content must be separate from source.
3. Real physical iPhone Safari/Home Screen, large Gurmukhi, VoiceOver, actual airplane mode and prolonged reading/call/Bluetooth behavior as relevant.
4. Versioned family-release candidate, cold-start/offline/rollback demonstration, and separate explicit founder family-publication authorization.

**Not done:** no human scripture approval, published family Gutka, reviewed Meaning/Study text, timed recording, or physical iPhone PASS. **Done:** all six original digital sources and Japji are reachable within one coherent source-review library without links to external scripture sites.
