# GLP-001 · Full Nitnem — simple Meaning and deeper Learn pilot

**October 25, 2026 Pacific. PRIVATE DRAFT. Source text, educational prose and the founder's personal learning remain three separately governed layers.**

## Founder goal and actual outcome

The founder's goal is to study **the complete Nitnem with the same quality and educational structure as the existing Japji Sahib lessons**: unmodified Gurmukhi, clear English and easy Punjabi, progressively deeper context, key words, honest alternatives, reflection and teach-back, all inside the application. No external scripture-reading websites, no separate competing reader.

This candidate upgrades the same continuous Full Nitnem reader, keeping **Read / Meaning / Learn** controls. Read displays the same six locally hashed digital-source candidates as the previous private continuous edition; Japji continues to open the existing original 385-line reader. Meaning displays authored bilingual simple explanations beneath the relevant source passage and selective per-line educational notes. Learn adds thematic introduction, vocabulary, close reading, interpretive caution, reflection and teach-back. All editorial text uses safe `textContent` DOM construction, not HTML interpolation, generated-on-click answers, TTS or a third-party API. The original Gurbani and its source IDs/SHA-256 never change.

## Honest lesson coverage (as of this commit)

| Bani | Source units | Detailed bilingual draft units | Selective source-line draft notes | Independently reviewed |
|---|---:|---:|---:|---:|
| Jaap Sahib | 199 | 7 | 6 | 0 |
| Tav-Prasad Savaiye | 10 | 10 | 2 | 0 |
| Benti Chaupai Sahib (29-pauri website variant) | 29 | 7 | 4 | 0 |
| Anand Sahib (full 40) | 40 | 7 | 3 | 0 |
| Sodar Rehras (six SGPC-sequence components) | 44 | 14 | 2 | 0 |
| Kirtan Sohila (five shabads) | 5 | 5 | 3 | 0 |
| **Total (beyond Japji)** | **327** | **50** | **20** | **0** |

There are also **six complete English/Punjabi bani introductions** and source-bound context/glossaries. Japji Sahib keeps its own established original reader and educational draft corpus; we do not duplicate or migrate its material.

**50 drafted lessons is NOT full coverage.** In particular, Jaap Chhand 99 has no written explanation. The UI says the lesson has *not been written yet* rather than displaying a synthetic generic paragraph. Unauthored passages remain completely readable in Gurmukhi. The source-authorized, human-reviewed line-by-line translation count is **zero**, and the program never calls 50/327 "complete" or gives every verse the same fake meaning. If the founder wants full Nitnem explanation, the remaining 277 unit lessons and many more specific line-level renderings must be written and individually checked.

## What we reused from Japji learning

Reference standard: `docs/TEACHING_EXPANSION_ARCHITECTURE.md` and the independent `docs/research/M2_PAURI_01_02_DEEP_LESSON_EXEMPLARS.md` on the M2 pilot branch. The exemplary Japji lessons connect **exact unchanged original**, working vocabulary, simple bilingual interpretation, close reading, qualified differences, historical context, useful reflection and a teach-back question. All these dimensions are modeled in `tools/nitnem/lesson-drafts.mjs` and the compiled `nitnem/learning/course.v1.json`.

The educational content is original working prose, **NOT copied translations** of Sant Singh Khalsa, Sahib Singh or SikhRI. The following sources are editorial research anchors whose claims and scope need rechecking passage by passage, not permission to reproduce their text:

- [SGPC Sikh Rehat Maryada, Article IV](https://sgpc.net/sikh-rehat-maryada-in-english/) — official daily source scope and distinguishing evening Rehras, short Anand and Ardas practice
- [SikhRI Anand Sahib course](https://sikhri.org/courses/anandu-sahib) — distinct full Anand pauri teaching and Guru Amar Das's central themes
- [SikhRI, A Call to Inner Bliss](https://sikhri.org/inspiration/a-call-to-inner-bliss-will-you-answer) — Anand's opening theme; no modern translations copied
- [SikhRI, Guru Gobind Singh Sahib remembrance](https://sikhri.org/inspiration/guru-gobind-singh-sahibs-prakash-purab-today-2) — Tav-Prasad Savaiye love emphasis, with full stanza context
- [Professor Sahib Singh, Guru Granth Darpan, Ang 12](https://www.gurugranthdarpan.net/0012.html) — Kirtan Sohila, imagery of praise, union, human lifetime and departure
- [SikhNet Kirtan Sohila](https://sikhnet.com/banis/kirtan-sohila) — five-shabad structure (its health/supernatural claims are not adopted)
- [SikhRI Guru Granth Sahib Project methodology](https://gurugranthsahib.io/info/english/methodology) — source/translation separation and careful interpretation

The original wording for a lesson is **only** the source-bound `nitnem/data/*.json` under pinned PR #20 commit `373ccc34f4a1c0ccb6ce36654bf6e9574087200f`. A teaching compiler binds each lesson to one existing source unit and exact original SHA; close-to-text notes have a separate exact line SHA; 50/20 links and the source-package/teaching-course SHA are checked independently. Its `editorialStatus` is always `DRAFT_AI_UNREVIEWED`, `reviewer=null`, `publicationAllowed=false`.

**Text caution:** Jaap has 67 recorded second-digital-source discrepancies and several Sanskritic/Braj terms requiring human lexical adjudication. Savaiye and Chaupai have differences and stronger rhetoric that must be interpreted in context; no app meaning should denigrate another living religious community. Anand Pauri 24 contains the quarantined U+F03D transcription discrepancy—there is **no** meaning or lesson for that quarantined line. Rehras's SGGS versus Dasam passages retain distinct author/source attribution. None of the teaching prose is endorsed santhiya, recording alignment, clinical guidance or supernatural evidence.

## Private release and rollback

The *existing* private owner invitation now opens **`/nitnem-learning/`**, a separate versioned learning path on the same Gurmukhi Learning Library host. The prior `/nitnem-continuous/`, `/nitnem/`, and original Japji `/full-japji.html` remain available via signed session and retained as rollback paths. Only a private gateway on Mac loopback port 8908 was switched; the original Quick Tunnel, bearer invitation, public GitHub Pages, root original scripture, family reflections and prior caches are untouched.

New offline worker scope `/nitnem-learning/` uses `glp-nitnem-learning-review:`, caching 14 hash-checked UI/source/teaching files. Older source and continuous worker caches use different prefixes. Even after source-content drafts are loaded, the app never writes the user's private reflection to a public course or repository; personal notes remain under separate source-edition browser keys.

Rollback: replace only the new loopback gateway with the last version of `tests/serve-gated-continuous-nitnem.py`, using immutable `previews/full-nitnem-continuous-20261025` and owner-only `full-nitnem-continuous-extra-sha256.json`. Do not delete or mutate local learning, reset Tailscale or change public main.

## What the checks establish, and what they do NOT

- **63 local Chrome checks PASS**: all original source line hashes unchanged, 50 authored unit drafts visible only where written, Meaning English/Punjabi display, detailed Learn vocabulary and reflection, 20 selective line notes, transparent absence for Jaap Chhand 99, explicit Anand held line, notes/bookmarks/continuous reading and blocked-network original text.
- **65 private HTTPS Chrome checks PASS**: existing invitation token redeemed into same-origin learning, source-anchored bilingual lessons, 320/390px reading, stored notes, hash-verified offline source access under Chrome networking disabled, no third-party requests or JS exceptions.
- **60 ephemeral gateway defence checks PASS**, including a tampered lesson-course manifest blocking startup, 401 anonymous source/teaching assets, signed secure invitation, no private engineering paths or unauthorized writes. The older/source-only versions are synthetic fixtures in this isolated gateway test; real old version files are preserved in immutable Mac snapshots.
- **14 static teaching/source checks PASS**, proving 50 lessons and 20 selected notes reference the exact source hashes and cannot declare scholar approval. Separate 16 source-integrity checks still protect 1,361 original Gurmukhi records.
- **Real iPhone Safari/Home Screen/VoiceOver/airplane-mode** is NOT YET independently observed. The temporary tunnel has no uptime guarantee. None of these mechanical tests establishes correct scholarly Punjabi, pronunciation or an authorized line-by-line Gurbani translation.

## Next authored teaching batches — not artificial blanket coverage

Prioritize human review of current Sohila 5/5 and Savaiye 10/10, anchored teaching for Anand Pauris 8–20, Chaupai Pauris 8–29, Rehras remaining mixed-source hymns and selected Anand, then Jaap Chhands 8–40 and onward in contiguous units. Each new batch must be checked against its original text and verse context, with working bilingual glosses and review status that cannot self-promote. Full unit-wise teaching would require **277 more draft unit lessons** beyond this first tranche; full line-by-line coverage would demand far more individual anchored explanations.

This remains **one existing product, one original source corpus, two distinct draft levels and no competing application or public source promotion.**
