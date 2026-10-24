# GUR-D · Gurdwara Arrival — reverent place identity, arrival experience, and playback design

**Owner:** Claude creative design lead, not implementation. Scope includes a **different sense of arrival for each real Gurdwara**, while staying one library. Rely on GUR-R for authentic names, history, sources, photo rights and verified broadcast routes before designing final content.

## Inspect actual existing prototypes

- [R7 main](https://github.com/sskhangura82/gurbani-learning-library) `gurdwaras.html`, `gurdwara.html`, `css/arrivals.css`, `js/arrivals.js` — already place-specific palettes and local IANA clocks. Live pages are *limited introductions*, not confirmed immersive broadcasts or licensed-photo visits.
- [PR #4](https://github.com/sskhangura82/gurbani-learning-library/pull/4) `GURDWARA_ARRIVAL_CONCEPT.md`, screenshots, `prototypes/rooms/`, rights ledger — preliminary intro → Skip/Enter → verified facts → deliberate official outbound route.
- Family reading experience: Day / Amrit Vela, uncluttered Gurmukhi and quiet light; preserve exact return-to-paath anchor, bookmark/note position and accessibility.

## Split design tasks

**GUR-D1: One information architecture, three different identities.** Compare “Gurdwara map/list first,” “place-themed arrival cards,” and “place-search with recent visits” (no tracking unless explicitly opted in). Choose one. Show how users select a Gurdwara, see trustworthy facts, experience respectful arrival, deliberately start a compliant official stream, stop/leave, and return to where they were reading. Avoid navigation dead ends and link mazes.

**GUR-D2: Three independent place experiences.** For each of Sri Harmandir Sahib, Fremont and San Jose, give an actual screen sequence, mood palette, typographic treatment, image treatment (rights-cleared photo OR no-photo fallback), cultural framing, local clock behavior and a succinct place-specific narrative **grounded in GUR-R's source register**. Think of “a sense of visiting” as a calm respectful threshold, not a gamified virtual pilgrimage. No invented gurdwara image, gratuitous Sikh iconography, floating candles or musical overlays pretending to be an authentic gurdwara atmosphere.

**GUR-D3: Three visual art directions per place.** Offer a compact, non-repetitive matrix of art directions:
- **Photo-led documentary** (only if licensed/owned; alt text/attribution).
- **Typography-led arrival** (works without any photo, true to naming).
- **Quiet place/light abstraction** (inspired by environment but never masquerading as a real building).
Illustrate what truly differentiates the three institutions besides changing background hues, and choose one recommended option per place. If supplying moodboard references, tag sources and licensing; screenshots of live sites are evidence references, not production asset rights.

**GUR-D4: Arrival as a skippable threshold.** Compare immediate entry, optional ~3-second fade, and a deliberately chosen “Enter place” page. Show exact iPhone timeline/interaction. Always skip/tap, follow reduced-motion (no animation), allow VoiceOver to bypass threshold, and never autoplay audio during arrival. Gurmukhi name and verified English name dominate; source/credit labels remain discreet but accessible.

**GUR-D5: Listening without faking technical capability.** Propose official YouTube visible embed only if policy and provider support confirmed; minimum actual visible player viewport, controls, ads and branding intact; no hidden audio extraction or fake locked-screen background player. When a source only supports outbound links, design a **graceful clear provider handoff** and return. Handle unavailable stream, broken link, permission denied, buffering, offline app, inaccurate programme claims, unverified live status, unsupported Safari embed and accessibility.

**GUR-D6: Connected teaching and place context.** Where verified, a short factual timeline/importance, local sangat/seva, appropriate visitor etiquette and related study links may be offered as optional “Learn about this place” rather than clutter in the primary arrival. No place name or religious history invented by the UI; each phrase should bind to a source record and review state. Should a place have a contextual Ang/Gurbani connection? Evaluate, but don't use it as proof that Guru Granth Sahib Ji describes the modern institution.

**GUR-D7: Future scalability.** Propose a design for searching/browsing future verified international Gurdwaras by geographic area or name; privacy-first, no user location tracking needed, and clear standards for place admission and periodic review. No badges/rankings of spiritual significance, viewer counts, 'trending temples' or advertisement-driven sorting.

## Output contract

Return `GUR_D_PLACE_ARRIVAL_UX_BLUEPRINT.md` containing:
- **Evidence-based critique** of live R7 and PR #4 actual screens; do not claim physical iPhone test when not done.
- One-page side-by-side journey for **all three places**, not one template with names switched.
- Per-place 2–3 concise verified history/etiquette strings referenced to GUR-R evidence IDs, and a no-licensed-photo fallback.
- Three visual directions with recommended style and reusable/special-case design tokens. Indicate typography scales, Gurmukhi matra clearance, appropriate alt text and no excessive decoration.
- Annotated phone screen states: choose place → arrival → place story → media choice → compliant YouTube/embed or official outbound → exit/return, plus error/offline/reduced-motion/VoiceOver at 320/390px and large fonts.
- Provider/compliance and rights gates, including separate factual link/stream availability.
- **Two distinct small Work orders:** (a) place metadata and evidence view, (b) accessible mobile arrival/listening UX. Include tests, screenshots, rollback and the exact stage at which licensed imagery is required.
- A 3/5/10-place growth strategy that doesn't make the home or the reading room busy.

**Do not code or publish.** Claude's deliverable must work even if the gurdwaras never grant photo rights or embed permissions. Design calm by default, not by false sacred imagery or proprietary media workarounds.
