# Simran Room — source-grounded review concept

Status: **NONDEPLOYED PROTOTYPE, NOT APPROVED RELIGIOUS INSTRUCTION**. Prepared after Revision 6 passed and was promoted. Base reader: `fa6e4fecd1a5c602b30ffd13ca23416ae911ea83`. The live reader remains the product; this branch explores an optional room in the same library.

## Experience

A reader opens an optional quiet room, pauses the visual guide and returns to the same scripture occurrence and pixel offset. There is no required sequence, duration or completion. All five views are directly accessible by buttons; Return to reading and Escape close the modal. The existing reader remains mounted, including its notes, depth and guide position.

| View | Prototype behavior | Authority and limit |
| --- | --- | --- |
| Arrive | Quiet introduction, immediate choice to stay or leave | UX choice; not a religious prerequisite |
| Breath attention | Off by default; explicit button reveals a modest natural-breath attention cue; no pacing, holds or animation | Optional UX experiment, not attributed to Bani or Rehat Maryada, not clinical advice or a prescribed Sikh method |
| Naam Simran | Silent space; practice instruction withheld | Named subject grounded in Rehat Maryada Articles III–IV; exact instructional wording requires qualified review |
| Stillness | Unmeasured quiet view; no success state | UX choice; no claim about spiritual achievement |
| Learn | Two exact frozen Gurbani passages with Ang and context links; separate withheld interpretation area | Bani source display, not a breath-method proof text |

The interface has no mala count, 108 requirement, streak, score, reward, attendance analytics, breath timer, haptic rhythm or artificial voice. It stores no new personal data. Any future optional counting tool needs separate review and an equally complete no-count path.

## Source and editorial boundaries

`prototypes/rooms/content.json` records the exact original source IDs, texts, Ang references and SHA-256 hashes. Both anchors are from Japji Sahib, Ang 2: `pauri04.line05` and `pauri05.line05`. They were compared with displayed Gurmukhi on SriGranth Ang 2 on 2026-10-23. That independent digital check does not replace qualified collation. Pauri 13 line 1 remains OPEN and is not altered by this work.

Sikh Rehat Maryada Article III places Naam and scripture alongside living the Guru's teachings and voluntary service. Article IV addresses personal remembrance and daily reading. These are orientation, not evidence for this application's proposed breath interface. See the source ledger for the SGPC index and the HTML reproduction actually read. The large SGPC PDF could not be retrieved by the research tool; no full-PDF review is claimed.

No modern translation from an external site is copied. No new interpretive or practical religious lesson is delivered in this prototype. Existing reader drafts remain separately labeled and unchanged. No prescribed raag is asserted for Japji Sahib.

## Review request before any release

1. A qualified Sikh/Gurbani reviewer should assess whether the room framing is appropriate, verify the two source passages and context, and supply or approve any proposed instruction. Review each statement's authority: Bani, Rehat Maryada, explicitly named tradition, or UX choice.
2. A Punjabi reviewer should approve interface terminology and any future bilingual guidance. Do not silently convert English UI prose into authoritative Punjabi instruction.
3. Test VoiceOver focus containment, reading order, Escape/return equivalent, large text, zoom, reduced motion and Safari standalone on a real iPhone. Current evidence is desktop only.
4. Human recordings, if proposed later, need performer identity and consent, recording and distribution rights, source alignment, one-voice-at-a-time behavior and separate deliberate playback controls. No synthetic sacred voice or imitation is contemplated.

## Engineering boundary

`prototypes/rooms/rooms.js` is a small overlay adapter around the unchanged `full-japji.html`, not another reading engine. It pauses through the existing Play button, remembers a DOM anchor in memory, marks the reader inert while the native modal is open and restores the anchor on close. It does not read or write a learning store. This is a review integration sketch; production wiring into Explore would be a later reviewed change.

This branch must remain unmerged and absent from the Pages runtime and service-worker shell. Local preview instructions and test receipts are in `prototypes/rooms/README.md`.
