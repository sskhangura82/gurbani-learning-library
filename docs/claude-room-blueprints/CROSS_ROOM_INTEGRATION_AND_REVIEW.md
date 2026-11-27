# X-INT · Cross-room integration, roles, implementation order and design gates

**Owner:** Claude creative-architecture integrator. Deliver blueprint and review process, **not code**. Use research outputs PSY-R, GUR-R; design outputs PSY-D, GUR-D; reconcile with the actual library and active GitHub branches.

## Integration architecture to research and decide

**X-1: One library and an uncluttered threshold.** R7 Home begins with three distinct destinations (Nitnem, Gurdwaras, Simran Room); PR #12 tentatively introduces a fourth Psychology Room. Consider whether Psychology remains a home door or lives under a “Learn” shelf. Test navigation discoverability on an actual 390px iPhone screenshot and elder text settings. No endless room carousel or engagement mechanics. The app's source-centered Japji reader is still the core.

**X-2: Shared source/evidence protocol.** Design a common versioned record envelope across scripture lessons, psychological evidence and place claims without collapsing their distinct authority:
- `subjectId` / domain `scripture | exegesis | psychology | institution | media | UX`.
- exact source reference and checked date, exact quote or claim, author/steward, scope/locale, permissible paraphrase, rights/license, confidence/evidence rank, editorial draft status and qualification of human reviewer where applicable.
- site elements bind to provenance, but the source is not the visual headline; calm citation links and quiet review status remain present.
- never treat a modern psychological concept, unreviewed history or caption as scripture; never treat a page image as licensed because it appears publicly.

**X-3: Shared design tokens, separate emotional identity.** Define what stays constant (Gurmukhi type family and readability, font scaling, focus/VoiceOver rules, 44px targets, reduced-motion, footer and library navigation, accessibility), and what differs:
- Japji reader: Day/Amrit Vela, original text dominant.
- Simran: quiet, silent, source-grounded, no compelled breath techniques.
- Gurdwaras: factually individual place atmospheres with rights-aware photo fallback.
- Psychology: distinct reflective/study aesthetic, no mock therapy-office design, no psychology labels treated as religious rank.
Three design options per room should not require three separate apps or bespoke state managers.

**X-4: Reader state and links.** Entering any room must preserve last read/understand/study position, selected bani/edition, text size, user setting, bookmark and note with no private data sent to the room, provider or GitHub. Return-to-reader should be reliable from both official outbound media and offline experience. Never let an unfinished new room block paath. Technical proposals must specify referrer/safe-tab policy, back behavior, optional deep-link resolution and server-free PWA fallback.

**X-5: Concrete review division.** Founder: cultural/product and rights/release word. Claude: concept lead + independent PASS/CONDITIONAL PASS/FAIL design and architecture review. ChatGPT: coordination, evidence-led content drafting, state reconciliation. Work: single author of implementation PR for each adopted work order. Qualified human reviewers separately approve Sikh scripture/Punjabi, psychology facts and institution/asset rights. No AI model signing its own candidate or substituting for qualified human reviewer. No implicit provider credentials, spending, external outreach or public media rights.

## Prevent collisions with ongoing builds

These subjects remain separate:
- **[PR #11](https://github.com/sskhangura82/gurbani-learning-library/pull/11)**: reader controls/iPhone acceptance; no silent merge or overwrite.
- **[PR #12](https://github.com/sskhangura82/gurbani-learning-library/pull/12)**: current **draft** Psychology/Nitnem prototype; no bypassing content/scholarly review.
- **[PR #4](https://github.com/sskhangura82/gurbani-learning-library/pull/4)**: nondeployed Simran/Gurdwara concept evidence and rights.
- **[PR #9](https://github.com/sskhangura82/gurbani-learning-library/pull/9)**: deep Japji Pauri 1–2 editorial exemplars.
- **[PR #10](https://github.com/sskhangura82/gurbani-learning-library/pull/10)**: rights-gated recitation timing and iPhone checklist.
- **[PR #7](https://github.com/sskhangura82/gurbani-learning-library/pull/7)**: visible official YouTube player prototype, not universally synchronized.
- Parallel next architecture lane: *generic multi-bani reader contract*, verified original corpus and Kirtan Sohila parity—no writer should duplicate the source intake while another branch owns it.

All Work orders should state **the current base SHA** when created, retest/reconcile on main changes, never cherry-pick all of an unrelated concept branch as a shortcut, never force push or duplicate a competing app.

## Prioritized dependences and deliverables

| Wave | Research/design deliverable | Engineering may do in parallel | Gate before public use |
| --- | --- | --- | --- |
| 0 | PSY-R/GUR-R source and rights ledgers, PSY-D/GUR-D design comparison | Finish M0 reader QA; generic source registry with synthetic fixtures; continue Pauri draft audits | No claims of reviewed guidance/photos/streams |
| 1 | Selected Room architecture, approved UX flows and style directions | Source schema and evidence-bound APIs, screen-reader/contrast test tools | Claude creative verdict and source permission boundaries |
| 2 | Psychology content modules and Gurdwara place registry | Focused implementation PRs, one room per author/branch | Qualifed Sikh/Punjabi/psych evidence review; public place facts and media rights |
| 3 | Place-specific arrivals and optional official playback; learning connections | iPhone QA, offline version lifecycle, rollback | Provider compliance, real iPhone Safari/VoiceOver, reviewer/founder release word |
| 4 | International Gurdwara and expanded psychology teaching | New metadata-driven records (no new apps), source version tracking | Strong per-entry source/rights review; no fabricated claims |

Do not produce fixed delivery dates if dependent approvals and evidence are missing. Show critical path with independent lanes: for example, place research can advance while phone reader tests are open; content research can advance before visual choices, while merging blocked public lessons must wait on review.

## Expected final output

Return `X_INT_COHERENT_LIBRARY_BLUEPRINT.md` including:
1. One-page master verdict explaining the product strategy and specifically why the rooms do not fragment the library.
2. A **diagram of information architecture and state transitions** that does not rely on invented routes or a second codebase.
3. An explicit per-room data/publishing contract and source-review state machine.
4. A shared component and typography token policy; distinct selected emotions for each room.
5. The **integration contract** (input/output of rooms, deep links, status and back-to-paath, privacy and offline).
6. The five-subject dependencies and an ordered set of **implementation-ready Work packets**: PSY-CONTENT, PSY-UI, GUR-PLACE-DATA, GUR-ARRIVAL-UI, CROSS-ACCESSIBILITY. Each must specify exact destination files in existing repo, tests/certificates, qualified human review, rights/media gates, and rollback.
7. A consolidated evidence register of open questions, clearly separating research-safe actions from founder-reserved decisions.
8. The next two highest-value engineering actions *we can complete without waiting for Claude's final blueprint*, and what to keep unchanged.

**No direct GitHub mutation, no merging and no deployment by Claude.** Return the plans to the founder and ChatGPT for reconciliation. Your strongest output is a blueprint that a coding worker can implement without guessing what “spiritual,” “calming,” “psychological” or “visiting” means.
