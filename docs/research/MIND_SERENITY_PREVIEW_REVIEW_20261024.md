# GLP-001 · ਮਨ / The Mind — Gurbani-first mobile prototype review

**October 24, 2026. DRAFT visual candidate only.** Child branch of PR #12 `76431c86519b706fda5b90f33ec4c595bd9e89f5`. Nothing deployed, no qualified religious or psychology approval, no family release authorization.

## What changed from the original PR #12 screenshot

The original prototype placed a prominent English hero and decorative circle **before** the first Gurbani line. A fourth Home link advertised “Freud to modern personality science.” This review fixes the *visual hierarchy* while retaining the same underlying source records and four draft topics:

- **Gurbani leads.** The original full text of the selected frozen occurrence appears prominently at the top of the screen, before theme choices and English commentary; no sacred text is inside a card.
- **Man / The Mind** is a small working title, not the final founder-approved name. All theological claims, source references, simple Punjabi and psychology paragraphs remain marked unapproved drafts.
- Four questions form a quiet vertical list beneath the original passage; selection is from the same PR #12 `js/mind-room-content.js` records. The source text is never substituted by a paraphrase.
- Sikh explanation uses sepia ink. The separately labeled psychology lens uses muted slate ink with a thin left rule. These are **distinct kinds of knowledge**, not an equation or evidence of spiritual attainment.
- History, including Freud, lives in a closed `<details>` shelf; no decorative emblem, score, quiz or self-assessment.
- The Home page still has **three primary doors**: Nitnem, Gurdwaras, Simran. A one-line **Study paths** entry beneath Nitnem links to Mind and the Nitnem roadmap, not a fourth prominent card.
- No new player, breath practice, user profiling, local storage, outgoing network request, media, figure, photo, API, or AI voice.
- The existing source-bound four-topic JS and its data remain **byte-identical** to PR #12's parent. Claim repair/research from PSY-R and draft PR #17 is separate.

## Test evidence

The candidate passed **29 focused real-browser checks** in isolated headless Mac Chrome at 320×740 and 390×844 emulated mobile viewports, including exact original first passage and selected Pauri 2 source, first-screen Gurmukhi dominance, vertical topic rows, source/psychology separation, no horizontal overflow, no decorative source card, closed history shelf, the Home three-door contract, and light/dark variants. **No physical iPhone or VoiceOver test.**

The parent `node tests/nitnem-mind-contract.mjs` also passed after the HTML changes. The test files and real screenshots are in `evidence/mind-serenity-browser.json`, `docs/screenshots/nitnem-mind/mind-serenity-day-390.png`, `...day-320.png`, `...amrit-390.png`, and `...home-390.png`.

## Unresolved editorial + product holds

1. The existing PR #12 psychology claims/research references still require claim-by-claim verification; **the prior ACT-mechanisms review does not independently justify craving/attention claims**. Consider PR #17 as an additive source/content packet, not ready-to-replace runtime.
2. Qualified Sikh/Punjabi and psychology-evidence reviewers are absent; exact attributed commentary excerpts need retrieval. No external Gurmukhi can be shown until exact corpus collation.
3. Founder's room naming/framing approval remains separate. Working label is `ਮਨ · The Mind`; no Freud-first front door.
4. Exact `#occ=` deep-link return is **not yet implemented** by this candidate; PR #11 owns the reader-side return contract. The present “Return to Japji Sahib” link goes to the reader without promising exact scroll restoration.
5. Visual typography and responsive tests are **Mac Chrome only**, not Safari/VoiceOver/200% Dynamic Type tests. Content/cultural appropriateness and clinical evidence tier remain unreviewed.

## Integration/rollback

This is a child PR targeted at PR #12's branch. It changes only `psychology.html`, `css/mind-serenity-preview.css`, `index.html`, `css/home.css`, and adds a browser smoke test/screenshots/review record. Do not merge it independently into accepted main. It must pass independent design, religious/psychology claim review, source/corpus validation, physical device/a11y QA and separate founder release decision. A release would need a fresh service worker version and new asset checksum; do not alter the accepted public worker without those gates.

Rollback is reverting this child branch; its parent PR #12 original screenshots and content remain preserved. No runtime state/schema changes, no data migration.

**Research basis:** Claude's founder-supplied PSY-R / PSY-D / X-INT October 24 briefs and the accepted three-door Darbar Standard.

## Engineering repair after initial visual review · 24 October 2026 (Pacific)

**Problem confirmed:** after the psychology/home redesign, the draft service worker still pinned the parent HTML hashes and did not cache `css/mind-serenity-preview.css`. The parent visual-pass result alone therefore did not demonstrate that this review candidate could install or load offline.

**Review-only repair:** add the new stylesheet to `tests/build-sw.mjs` and regenerate `sw.js` with a unique **candidate** cache version `0.9-japji-v1-mind-serenity-review-1`. No original Gurbani, psychology/source records, content renderers, learning data, Home Screen identity, live worker or provider integration changed.

**Verification:** `node tests/mind-precache-contract.mjs` verified **69 file-hash and local-resource assertions** across a **41-route** manifest. The 16 parent Nitnem/Mind source/privacy contracts and 8 worker-simulation checks were updated and passed, along with baseline source (27), shared-learning (12), R6 (7) and R7 (12) contracts. An actual isolated Mac Chrome run using `GLP_QA_BASE=http://127.0.0.1:8959 node tests/nitnem-mind-offline.mjs` passed **12 checks** with Chrome network emulation set to offline: Home, Japji (385 lines), Simran, Gurdwara directory, seven-entry Nitnem roadmap and four-topic Mind room; the Mind original Gurmukhi was visible and its new CSS loaded from cache. See `evidence/nitnem-mind-offline.json` and `evidence/service-worker-verification.json`. The QA server was loopback-only and stopped afterward. No private learning records were read or exported.

**Holds unchanged:** simulated offline Chrome is not physical iPhone airplane-mode or Safari/VoiceOver acceptance. No independent Sikh/Punjabi or psychology evidence signoff has been obtained; PR #17 remains research, not automatic content promotion. No merger with PR #12, main, deployment or family publication. Any future accepted release requires a fresh worker version and independent release authorization.
