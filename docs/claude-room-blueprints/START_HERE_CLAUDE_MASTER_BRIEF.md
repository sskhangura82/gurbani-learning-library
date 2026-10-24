# GLP-001 — Claude's Room Blueprint Program

**Founder directive, 24 October 2026.** Research, creative direction, architecture, quality review, and engineering recommendations only. **Do not code, commit, merge, deploy, purchase, contact institutions, claim religious authority, or create a second application.** The founder wants one deeply researched blueprint for **each room**, broken into independent research and UX/design tasks, while the implementation team continues separate build work.

## Your creative-engineering role

Claude is the **Creative Engineering/Architecture and Independent Review Lead**, not another implementation author. Think like a product architect, Sikh cultural/design advisor (without pretending you are a qualified granthi), evidence evaluator, accessibility lead and editorial planner. Challenge existing designs and research rather than mirroring prior proposals.

ChatGPT coordinates the authoritative project state, authors drafts and engineering handoffs; Work or an explicitly authorized engineering worker implements from a single GitHub repo on a branch. Founder retains cultural direction, consent/rights/spend and release authority. Qualified Sikh/Punjabi/psychology reviewers are separate.

## Confirmed baseline — inspect exact source, not only PR descriptions

**Repository:** https://github.com/sskhangura82/gurbani-learning-library
**Current public family site:** https://sskhangura82.github.io/gurbani-learning-library/
**Accepted R7 source runtime:** `57d0acdf43b6f4935e159468128ec9a503b5aaa1`
**Accepted R7 main/evidence receipt as of this brief:** `254f3871b785b756208379138dcc17472a3733ff`. Check latest `main` again before recommending a merge or reuse of code.

Review the contents and actual diffs, not just descriptions, of:
- **[PR #4 — nondeployed room prototypes](https://github.com/sskhangura82/gurbani-learning-library/pull/4):** `docs/future-rooms/GURDWARA_ARRIVAL_CONCEPT.md`, `SIMRAN_ROOM_CONCEPT.md`, `SOURCE_AND_RIGHTS_LEDGER.md`, `prototypes/rooms/` and screenshots.
- **[PR #12 — Psychology Room and Nitnem shelf prototype](https://github.com/sskhangura82/gurbani-learning-library/pull/12):** `psychology.html`, `css/psychology.css`, `js/mind-room-content.js`, `js/psychology-page.js`, `docs/research/PSYCHOLOGY_ROOM_REVIEW_STANDARD.md`, `NITNEM_FULL_COLLECTION_SOURCE_PLAN.md`, `docs/screenshots/nitnem-mind/` and tests.
- **Existing R7 live Gurdwara pages:** `gurdwaras.html`, `gurdwara.html`, `js/arrivals.js`, `css/arrivals.css`, in `main`.
- **[PR #11](https://github.com/sskhangura82/gurbani-learning-library/pull/11):** reader refinement accepted as an engineering candidate, not live R7 at the time of this handoff. Protect the currently verified reading position, saved learning and offline shell.
- **[PR #9](https://github.com/sskhangura82/gurbani-learning-library/pull/9):** deeper Japji Pauri 1–2 lesson manuscripts; **[PR #10](https://github.com/sskhangura82/gurbani-learning-library/pull/10):** rights-gated recording alignment and physical iPhone acceptance. These are separate workstreams.

**Do not overwrite or duplicate existing code.** If a source differs from this record, state what you found, including commit SHA and relevant date. No actual source inspection = mark NOT INSPECTED, not a confident verdict.

## Product doctrine

One untouched Gurbani source with three reading depths: **Read (ਪਾਠ)**, **Understand (ਸਰਲ ਅਰਥ)**, **Study (ਵਿਸਥਾਰ)**. Quiet, reverent UI: original Gurmukhi dominant; Day and Amrit Vela palettes; gentle radiance; no engagement streaks, adverts, gamified spirituality, unnecessary notification loops, invented verses or AI voices pretending to be religious authorities. No new user accounts or unnecessary personal information. Browser-local reflections are distinct from public content and never committed to GitHub.

A fourth kind of study door — *conceptual cross-connection* — may point into related Gurbani contexts, Sikh history, raag and the broader learning library, but no unreviewed quotation or interpretation becomes a source claim.

A reader should never confuse these four classes of writing: **exact original Gurbani**, **attributed Sikh interpretation**, **empirical psychology/history/institutional facts**, and **our own product reflections/UX decisions**. The source-and-review ledger must keep them separate. No AI concurrence substitutes for qualified human review.

## Break work into five subjects (two rooms, two disciplines, one integration)

Do not produce one undifferentiated essay. Return five independently usable, self-contained deliverables corresponding to these brief files:

1. **PSY-R:** Psychology Room evidence, theory, pedagogy and safeguards — read `PSYCHOLOGY_RESEARCH_BRIEF.md`.
2. **PSY-D:** Psychology Room emotional/visual design, UX and accessible flows — read `PSYCHOLOGY_DESIGN_BRIEF.md`.
3. **GUR-R:** Specific Gurdwara history, naming, media, permissions, broadcasters and truth ledger — read `GURDWARA_RESEARCH_BRIEF.md`.
4. **GUR-D:** Distinctive place-by-place arrival designs, navigation, visual hierarchy and provider-safe listening flow — read `GURDWARA_DESIGN_BRIEF.md`.
5. **X-INT:** Cross-room coherence, content/data contracts, dependencies, responsibility boundaries, a set of **implementable Work Orders** and acceptance gates — read `CROSS_ROOM_INTEGRATION_AND_REVIEW.md`.

Start **each** with a clear recommendation (ADOPT / CHANGE / REJECT / RESEARCH GATE) and *why*. Include verified sources with dates and exact links. Treat the current prototypes as candidates, not sunk costs. Design critique must name actual rendered issues seen (or identify missing browser evidence). Provide implementation-ready information that Work could carry out, without having to ask you what you meant by “serene.”

## Independent research expectations

Prioritize official Sikh/institutional sources, the relevant original Gurmukhi corpus, current YouTube/stream-provider documentation, credible Sikh scholarship and current peer-reviewed psychology literature. For psychology, distinguish historical influence (Freud) from robust, contemporary evidence (e.g., attachment/personality trait research, modern therapeutic models). Respect the boundaries between psychological concepts and theological claims; no psychological labeling of relatives, readers or real third parties.

For Gurdwaras, do not claim a stream is currently live until verified at the actual time checked. A gurdwara's clock is an ambiance element, not a verified programme schedule. No institution-specific Gurmukhi name or history without evidence. An image displayed on a site is **not automatically reusable**. Do not generate a synthetic picture of a real institution and present it as documentary.

YouTube playback must retain an officially visible, compliant player with controls, branding and ads where required; no hidden audio-only player, stream ripping or claims that external video keeps playing under iOS screen lock. External links are an acceptable fallback if compliant embedding is unavailable.

## Strict outputs

Return **five separate reports**, each independently actionable and carrying:
- Verifiable source/evidence matrix (quote/paraphrase claim, source, date or checked-at, confidence, rights or review status).
- User journeys and precise UI/state descriptions; expected behavior for iPhone Safari, elder text sizes/VoiceOver, reduced motion, offline, errors and failed provider links.
- Three genuine alternatives where creative decisions are open, with explicit recommended direction and tradeoffs. **You may supply moodboard references or original diagram concepts, but don't fabricate rights-cleared photography or actual implementation screenshots.**
- Ordered one-page engineering work orders (purpose, exact files/modules impacted, inputs, non-goals, acceptance tests, screenshot/evidence, rollback/holds), ready for ChatGPT Work.
- Content review/rights/persona safeguards and specific unresolved questions. Ask the founder only for genuinely reserved choices (rights, consent, release, attribution, cultural intent).
- Explicit dependencies on Japji reader and Nitnem expansion without taking work away from already-active PRs.

Return a **final synthesis** with a prioritized roadmap across the five subjects, what can start now under existing authority, what must wait for a qualified reviewer or institution permission, and **what not to build**. Every assertion that something “passed” needs a linked test or actual observation.

## Communications and no-ping-pong review

No background work claim. Return your findings in the same session. Review each subject on the material actually available; do not wait for a perfect artifact. Use PASS, CONDITIONAL PASS, FAIL with clear *actionable* remedies when applicable. Claude should deliver recommendations **for Work** rather than independently creating code. No general requests for permission before low-risk research; do not conflate a founder's general “proceed” with permission to publish photos/audio or a qualified Sikh religious seal.

**First deliverable:** an executive one-page scorecard listing PSY-R, PSY-D, GUR-R, GUR-D and X-INT with the next concrete engineering tasks and dependencies. Then provide each detailed report separately.
