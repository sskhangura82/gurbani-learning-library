# GLP-001 — Darbar Reader Standard v1 (working design law)

Date: 23 October 2026 · Status: proposed for implementation/QA, not a human-reviewed Sikh religious ruling
Owners: founder sets product direction; ChatGPT coordinates build; Claude provides independent design review; Work implements candidates.

## Source and precedence
This incorporates the founder's two physical-iPhone screenshots (10:59 Read, 11:00 Understand), the founder's requirement to listen separately and follow the complete Japji in one uninterrupted scroll, and Claude's four design recommendations shared 23 October 2026.

Precedence: (1) original Gurbani and provenance remain unchanged; (2) honest explanation/review status; (3) legibility, discoverability and accessibility; (4) calm visual composition; (5) preferences and animation. Treat this as a visual design standard, not a statement that the application is an actual sacred saroop.

## A. The page and its rhythm
- Read and Understand display all 385 source occurrences continuously in the same document. The text is never segmented into separate pauri pages. The danda and pauri numerals carry the scripture's division; navigation can offer pauri anchors without cropping/replacing surrounding Gurbani.
- Remove decorative containers, dividers, separators and cards around the Gurmukhi in Read and Understand. In Study, clearly labeled commentary cards may exist but never replace, truncate or visually dominate the source text. Pauri numbers remain reachable as accessible landmarks and via Jump.
- Starting typographic target: Gurmukhi line-height about 1.85–1.95, preserve the current comfortable 30px default or user-adjustable equivalent, and ensure matras never collide. Do not reduce size merely to compress.
- Spacing target: ~8–10 CSS px between consecutive tuks; ~36–40 CSS px across pauri boundaries. Mool Mantar is emphatic through typography/radiance, not a colored card.
- Understand: English then Punjabi immediately below the matching tuk with approximately 5–6px connection gap and 18–20px separation before the next tuk; accompanying explanations are smaller and lower-contrast but meet accessibility requirements. The meaning itself is a touch target to expand fuller Study without taking away the reading position.
- Missing meaning or unfinished source verification: no invented meaning and no disruptive paragraph of placeholder prose inserted in the reading column; the interface can show a subtle accessible absence marker or a separate coverage notice.

## B. One control surface, not a persistent banner
- A compact floating dock is the principal reading control. Target <=56 CSS px high excluding device safe-area inset. It must keep usable controls (minimum 44x44 CSS px touch targets) and not obscure the text or keyboard focus.
- Primary dock: current pauri/location, Play/Pause, 3 explanation-depth indicators (tappable; accessible names), and one expand affordance. Expansion houses Save, Start Here, visual pace, appearance, Jump, Return to glow, and Explore.
- No persistent top toolbar when actual reading is underway. Give a straightforward reveal action (tap or accessible control); if the dock recedes after ~4 seconds, the user must be able to disable auto-hide and keep controls persistently visible. Never require a hidden gesture for Play/Pause or navigating reading modes.
- Optional horizontal swipe to change reading depth without changing occurrence index or restarting the guide; it must not hijack iOS edge-back navigation, scroll, selection, VoiceOver or keyboard operation. Tappable equivalent remains mandatory.
- The first-run instruction may explain modes. Afterward omit ordinary interface explanations from the reading column. Any location “whisper” (e.g. ਪਉੜੀ ੭) should announce the new section subtly, be dispensable by reduced-motion setting, and not steal focus.

## C. Light, motion, and clock truth
- Keep warm, restrained letter radiance. Active word/line receives boldening and a soft luminous halo; other Gurmukhi stays readable. No neon, particles, devotional stock textures or continuous movement of the page when the user is studying.
- Respect reduced-motion, contrast, keyboard focus and large-text settings; glow must never be the only indicator of the current line.
- Read and Understand Play guide through all 38 pauris without an artificial page transition. Tapping an explanation stops visual auto-follow but should not silently reset or seize the reading position. Study may pause the visual guide.
- The guide is SILENT and estimates pace from chosen illustrative tokens/minute. It does not play sound and is not synchronized to external YouTube, Apple Music, recordings, microphones or live streams. Do not claim the glowing word is what a reciter is saying.
- If the screen/tab is hidden, pause the synthetic guide; a new user gesture resumes it. Keep reading anchor distinct from guide anchor.

## D. Authentic future Simran Room — separate project lane
- Prototype only after the reader passes its visual and reading gates. Do not deploy an unreviewed religious lesson.
- Anchor each instructional practice in an exactly verified Gurbani tuk with Ang and source metadata. Separate close text, commentary, practical guidance and tradition-specific interpretation. Use Sikh Rehat Maryada Articles III–IV as orientation on Naam, Gurbani and personal practice; never claim one optional method is mandatory.
- Silence by default; spoken guidance only with an identified consenting human voice and recording rights. No AI-generated recitation or imitated Guru/granthi speech. One voice at a time.
- Potential modes: Arrive, gentle optional breath attention, Naam Simran, Stillness, Learn. Offer modest, adjustable breath prompts only; no forced breath holds, hyperventilation or implied clinical treatment.
- No streaks, badges, completion scores or attendance analytics. An optional physical/digital mala count may be explored only after review; 108 is not to be presented as a universally mandated Sikh count. Offer a no-count option.
- The same light may cue breath or attention only when the user elects it, with reduced-motion alternative and no prescriptive spiritual achievement promises.

## E. Gurdwara arrival — place truth before ambiance
- Choose real, source-checked gurdwara entities and official broadcaster links. The arrival presents verified photograph (creator/license/attribution/rights recorded), proper Gurmukhi and English names, location and authoritative short history, and the actual local clock time for that gurdwara.
- Visual palette may respond to local hour, with a time-zone-derived day/Amrit Vela/evening look. This is *a visual reference*, not evidence of the local gurdwara's actual seva schedule or a current live programme.
- Arrival image/title may fade up over ~3 seconds but is entirely skippable, respects reduced-motion, creates no audio, and never blocks a clearly labeled Enter/Listen action.
- Prefer official streaming URLs. A provider-approved visible YouTube embed must not hide the player, strip audio, modify controls or ads, bypass background playback rules, or obscure overlays. When embed/legal clearance is not available, a clear outbound “Open official stream” is the truthful experience.
- An iframe player is never launched without affirmative user action; “Live now” is displayed only with verified current provider status. No viewer counts, chat surfaces or made-up site sounds are necessary.

## F. Acceptance and authority gates
- Source strings/line IDs/Ang mapping must exactly match Revision 4 frozen hashes; preserve all 385 English/Punjabi meaning drafts and 42 draft Study units, separate sources and qualified-review status. The Pauri 13 line 1 independent-digital-comparison discrepancy remains OPEN; do not revise original Gurmukhi silently.
- Existing saved reflections, notes, preferences and bookmarks survive actual versioned upgrades and rollback; retain Web Locks protection and export/import format. No new personal data leaves the browser; no service worker cache of private notes.
- On a real iPhone, compare 390px and 320px widths, portrait/landscape, 30–48px scripture, Dynamic Type, VoiceOver, Safari Home Screen, airplane-mode and long-session behavior. Preserve 44px targets and visible focus.
- Record the viewport metrics before/after; the current local compact candidate reduced combined top+bottom reserved chrome from about 260.5px to 117.6px in one headless 390px-wide test, line-block height 100px to 66.5px. This is useful early evidence, NOT physical iPhone proof.
- Keep the current public GitHub Pages Revision 4 and the Mac temporary preview unchanged until a complete replacement passes with a rollback plan.
- Changes go to a feature branch and PR with screenshots, tests, documented baseline hashes, reviewer verdict and an explicit promotion receipt. Work may commit/push branch changes without asking again; do not merge or deploy failed candidates.
- GitHub repository holds code, immutable source snapshots or declared upstream hashes, manifests, the design charter and test evidence. Do not commit personal notes, credentials, private addresses, unlicensed photographs, or private reports.

References:
- SGPC Sikh Rehat Maryada (Naam, scripture, personal discipline): https://sgpc.net/wp-content/uploads/2025/06/Sikh-Rehat-Maryada-English-n.pdf
- W3C persistent-control guidance: https://www.w3.org/WAI/WCAG21/Techniques/general/hidden-control-2
- WCAG 2.2 Focus Not Obscured: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- YouTube API developer policies: https://developers.google.com/youtube/terms/developer-policies-guide
- YouTube embedded minimum functionality: https://developers.google.com/youtube/terms/required-minimum-functionality
