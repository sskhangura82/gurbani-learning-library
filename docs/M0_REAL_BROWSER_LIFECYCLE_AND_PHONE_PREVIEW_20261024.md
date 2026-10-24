# GLP-001 M0: independent browser lifecycle and phone-preview evidence

**Recorded 2026-10-24.** This is an additive QA supplement to candidate PR #11. It does **not** authorize PR merge, production publication, or human scriptural approval. The accepted family site remains R7.

## Candidate and preview identification

- Candidate PR: https://github.com/sskhangura82/gurbani-learning-library/pull/11
- Candidate source HEAD tested: 33360d2b7102dfffada6493390b261f8917723d3
- Candidate runtime files: from candidate-2 commit b599b11789d0e07120a913e9f071e8ccaeb744eb
- Reader runtime version: 0.9-japji-v1-m0-candidate-2
- Stable family site (unchanged): https://sskhangura82.github.io/gurbani-learning-library/
- **Temporary iPhone QA link:** https://act-blank-depot-verification.trycloudflare.com/full-japji.html

This is a **public-link preview**, not an authenticated family service. It shares no storage with the stable family site's origin. It serves only the 31 actual pinned static app files plus generated SW; 32 expected URL response hashes were checked against exact candidate source bytes (root and index.html hash the same file). There is no Git metadata, private notes, model secrets, user recordings, or QA-test interface exposed through its server. Temporary Cloudflare Quick Tunnel has **no uptime guarantee** and requires the Mac mini and tunnel to remain online. Do not use it as a permanent family bookmark.

## A. Real-browser versioned service-worker lifecycle — PASS

Executed in a fresh, isolated desktop Chrome profile through a trusted loopback origin http://127.0.0.1:8766. A unique QA fixture contains the following four independently hashed complete bundles:

1. Accepted R7 source -> real browser worker install -> synthetic stored learning.
2. M0 candidate-2 -> waiting worker -> explicit user-triggered activation -> M0 loaded.
3. Independently versioned complete R7 rollback -> explicit activation -> R7 loaded.
4. Freshly versioned complete M0 again -> explicit activation -> M0 loaded.

**25 positive assertions passed**, including preserved synthetic Punjabi reflection, reading bookmark, Day/Amrit theme, 36px scripture size, radiance setting and three generations of synthetic storage across all four transitions; no Web Locks or worker API was mocked. An additional origin-503 failure followed by reload served M0 from verified cache and retained the same synthetic learning. No browser JavaScript exceptions were reported.

**Key technical qualification:** the production PWA registers its worker only when the URL uses HTTPS. Loopback HTTP is a secure context but that application condition prevented the old fixture from registering. The QA harness therefore modified **only each disposable fixture copy** of its PWA registration condition to also admit 127.0.0.1 or localhost HTTP, then regenerated every worker and pin. No runtime file on the candidate GitHub branch or production site was edited for this test. The exercise proves the actual worker/lifecycle and data behavior in Chrome under secure-context loopback conditions, not Safari iOS equivalence.

Machine-readable receipt: evidence/m0-loopback-actual-browser-20261024.json

## B. Actual temporary HTTPS preview — PASS

A second completely fresh Chrome browser profile loaded the publicly reachable temporary HTTPS candidate.

**15 checks passed**, including:
- Secure HTTPS context, real Web Locks API and real service-worker installation.
- All 385 Gurmukhi text occurrences exact against the frozen corpus, all 385 short-meaning controls and all 42 Study sections.
- Correct M0 reader identity, four-group compact menu, and 54px visible dock with source-location text at 320 CSS pixels without horizontal overflow.
- A genuine synthetic Punjabi reflection written through the reader's UI, then retained after closing the modal and reloading under an installed real service worker.
- No unexpected autoplay, JavaScript exceptions or third-party requests by the static reader. Existing outward broadcast links were not opened.

Machine-readable receipt: evidence/m0-https-phone-preview-checks-20261024.json. Screenshots from desktop Chrome only: evidence/m0-https-menu-390.png and evidence/m0-https-reading-320.png.

**Not claimed:** actual iPhone Safari rendering; VoiceOver access; iOS Home Screen installation/standalone storage; real iPhone airplane-mode reopening; system Dynamic Type at 200%; real 20–30 minute phone usage; qualified Punjabi/santhiya/Gurbani review; independent Pauri 13 line 1 collation. Those rows remain **NOT RUN / OPEN**.

## C. Phone testing — user-action checklist

Open the temporary QA link in Safari on the iPhone, not an old Cloudflare family link, and test with a **synthetic note**, not a private reflection. Do not delete the existing installed family app or clear the live R7 site's Safari data.

1. Read: see Gurmukhi from Mool Mantar onward; tap Play, pause, advance across a pauri boundary and confirm the glowing guide remains gentle.
2. Dock: current section and Play are available at normal font; tap the three Read / Meaning (Understand) / Study modes; no disappearing controls or clipped text.
3. Menu: open the chevron. The Reading popup should be a grouped, compact menu rather than the old tall stack; Jump, Saved learning, Appearance and Pace are reachable.
4. Text: Appearance -> scripture size, try 30px and 60px (200%) in Day and Amrit Vela; confirm full Gurmukhi matras and numerals remain readable. Do not mistake in-app 60px for OS Dynamic Type certification.
5. Study: touch a concise bilingual meaning, inspect longer lesson, close and confirm the original reading location is preserved.
6. Saved learning: save one synthetic note and bookmark, close/reopen the preview and confirm they remain. These are stored only for the preview origin.
7. Offline: after the preview opens successfully and says offline shell installed, enable Airplane Mode and reopen the page; record whether cached Home, Japji and learning remain accessible. Turn networking back on after the test. This is a test, not a promised pass.
8. VoiceOver/large system text if the user wishes: check the dock's label order, close-button focus, location labels and ability to escape from 385 meanings. Record failures rather than overlooking them.

**Report back:** iPhone model/iOS version only if comfortable, whether using Safari tab or Home Screen, the first action that failed or felt awkward, and any cropped Gurmukhi or overwritten learning. Never send actual private reflection contents.

## D. Release boundaries and the next review

- The stable R7 family site and GitHub main were not modified by these tests. PR #11 remains **DRAFT, BLOCKED FOR MERGE** pending genuine physical iPhone acceptance and any final independent design/release decision.
- Full original source and existing educational drafts remain unchanged. Pauri 13 line 1 independent text comparison and qualified editorial review remain separately open.
- Video and timing features from R8 and PR #10 were not merged into M0. This preview is a **silent visual guide**, not real audio synchronization.
- If the temporary tunnel stops, the preview link may become unavailable or change. Stable phone-testing can be repeated with another disposable URL without modifying production code or clearing user data.

**Governance:** ChatGPT independent QA on actual Mac / trusted loopback + temporary HTTPS, not Work or Claude's independent review. This evidence supplements rather than overwrites the original M0 candidate certificate.
