# GLP-001 — Revision 7: Home, accessible visual pace, distinct entry spaces

Status: R7 implementation candidate, not yet an accepted release.

## Founder feedback, 23 October 2026

The founder's iPhone screenshots and 26-second screen recording show that the Revision 6 Japji reader itself has a calming Day/Amrit Vela palette, radiant moving Gurmukhi, and an acceptable three-depth reading model. The problem is **app information architecture**: the Home Screen opens inside Japji Sahib; Gurdwara, meditation, and future scripture are buried in the reader's Explore panel. Pace tops out at 140 illustrative tokens/minute and is too hard to reach.

## Revision 7 changes

1. Home Screen opens to a **distinct library home**, not directly to the reader. The front page has three true destinations: Nitnem → Japji Sahib (fully operational), Visit a Gurdwara, and Simran Room. A small future-library text keeps the roadmap to other Nitnem, Sukhmani Sahib and wider Sri Guru Granth Sahib Ji visible without claiming these have been implemented. No login and no analytics.
2. The Japji reader retains the full continuous Gurmukhi, all 385 English/Punjabi original editorial drafts and 42 Study drafts. A compact, **one-tap pace chip** in the 54px dock opens an adjustable range from 50–160 illustrative tokens/minute, in 5-token steps, with direct minus/plus and numeric output. This controls only the *silent visual guide*, not external audio, and does not claim to follow YouTube, Apple Music or an individual reciter.
3. The reader's Home link returns to the root. Browser learning state and versioned Web Locks serialization are preserved; no new accounts or centralized data storage. Installable manifest starts at the new home. Existing Home Screen installations that retain their old deep-start may need Safari refresh/re-add; back up learning first and never clear site data as an update step.
4. **Gurdwaras** is a distinct editorial visit pathway with three verified institution stories and authentic IANA local time. Every choice has its own palette and explicit official outbound broadcast route. No image is bundled until its creator, license, distribution conditions and attribution are documented. No live status is claimed; local time does not prove the current programme. No audio embeds or autoplay.
5. **Simran Room** has its own jade/teal quiet environment and an optional silent-sitting timer. It is an explicitly labeled *preview*, not a reviewed method of Naam Simran. The original Japji Pauri 4 line “ਅੰਮ੍ਰਿਤ ਵੇਲਾ ਸਚੁ ਨਾਉ ਵਡਿਆਈ ਵੀਚਾਰੁ ॥” is attributed to Ang 2; no translated text or invented spiritual promise is presented as scripture. The timer never records a streak, score, attendance or personal data. More authentic Sikh teaching will follow expert review of Gurbani and Rehat Maryada sources.
6. **Three-depth education** remains a separate source-backed content system: original Gurmukhi, short bilingual meanings and deeper Study drafts. Future schema will add relationship edges to other Angs and raag metadata without rewriting source text, and a human-review gate for final educational claims.

## Primary institution sources used for R7
- [SGPC official Sri Harmandir Sahib history](https://new.sgpc.net/sri-harmandir-sahib/): designed by Guru Arjan Sahib, Sarovar development under Guru Ram Das Ji, four open directions, installation of Adi Granth in 1604; [SGPC kirtan source](https://kirtan.sgpc.net/). Avoid unsupported current-live claims.
- [Gurdwara Sahib Fremont official institutional history](https://fremontgurdwara.org/gurdwara-new/): 1978 establishment, community service, programme context; [official main website](https://fremontgurdwara.org/) links its YouTube channel. Its formal Punjabi name remains pending community review.
- [Sikh Gurdwara Sahib San Jose official history](https://sanjosegurdwara.org/about.html): founded 1984, first phase 2004, second phase 2011; [official audio page](https://sanjosegurdwara.org/audioStreaming.html). Formal Punjabi name remains pending community review.
- [Sri Guru Granth Darpan, Ang 2](https://www.gurugranthdarpan.net/0002.html): source-linked Japji Pauri 4 line for the Simran introductory preview; do not infer a prescribed breath cycle.
- [Official SGPC Sikh Rehat Maryada index](https://sgpc.net/sikh-rehat-maryada-in-english/): formal guidance to be researched before authored instructional meditations.
- [Earlier separate prototype, draft PR #4](https://github.com/sskhangura82/gurbani-learning-library/pull/4): retains detailed design concepts, source/rights ledger, and reviewer notes; it remains unmerged and nondeployed. R7 does not publish PR4's separate unreviewed religious instructions or embed any recordings.

## Rights, privacy and status
- Photography: not used; official page display does not grant reuse rights. Distinct gradients are original CSS instead of fake gurdwara photography.
- The three institution summaries above are original brief paraphrases of official sources. The religious identity of a real sacred place is not represented by a fictional structure.
- External sources open by affirmative user click, with visible labels and no audio extraction. Source links are not proof of approval by gurdwara management.
- App content is publicly reachable by anyone with the URL and not a private membership site. No ChatGPT account or login is needed.
- Private browser learning remains on the device/browser only; no backend, telemetry, payments or advertisements.
- Sikh theology, Gurmukhi transcription (including the unresolved independent Pauri 13 line 1 comparison), pronunciation and deeper interpretive lessons require qualified review; R7 is an interface release only.
- Existing R6 application, previous rollback, and public family URL remain stable until R7 has browser and version-upgrade acceptance.

## Release gate
- All R6 source and learning regression tests remain passing.
- Verify root home is not a duplicate reader, each destination works, place sources are valid, 320/390px layouts reflow without horizontal scroll, 160 speed is saved/used without data loss, and original Japji source bytes and all meaning/Study drafts are unchanged.
- Test a real versioned HTTPS service-worker transition R6 → R7 (and rollback where feasible), retaining notes/preferences and browsing history. If physical iPhone/Safari, VoiceOver or airplane mode are unavailable, record NOT TESTED.
- Any publication must keep the existing independent GitHub Pages URL. No new provider account or public disclosure of user learning. Do not merge PR4 as a shortcut.
