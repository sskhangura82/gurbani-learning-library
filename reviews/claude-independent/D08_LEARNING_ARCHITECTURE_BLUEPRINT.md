# D08 · Learning architecture blueprint

A proposal. Nothing here is built. Everything touching Gurbani text or its meaning needs
qualified human approval before it is shown to readers.

## 1. The six levels are the steek tradition, made digital

| Level (assignment) | Traditional name (to be confirmed by Punjabi reviewers) | A learner at this level can… | Today |
|---|---|---|---|
| 1 Read | ਪਾਠ | read or follow the bani correctly, with pauses | Present. No pause marks, no larivaar |
| 2 Understand | ਅਰਥ | say in plain words what a line says | Drafts for 3,746 lines; 27 Rehras blocks have summaries only |
| 3 Word by word | ਪਦ-ਅਰਥ | explain each word: its form, its root, why this ending | **Absent.** 2–8 chosen words per passage |
| 4 Deep study | ਵਿਆਖਿਆ / ਭਾਵ | follow how named teachers have read the passage, and where they differ | Partial for Japji and Sukhmani; thin elsewhere |
| 5 Cross-scriptural | ਪ੍ਰਮਾਣ | show the same idea elsewhere in Gurbani | **Absent.** 1 reference in 610 studies |
| 6 Reflection | ਵਿਚਾਰ | connect it to their own life, in their own words | Present: prompt, private note, teach-back |

Teaching order matters. The books go word → line → passage. The app today goes passage
paraphrase → a few words. The blueprint restores the traditional order underneath, while
letting a beginner stay on level 2 for as long as they like.

## 2. One data model for the whole library

Three kinds of thing, never mixed in one record (the app already holds to this; keep it).

```
SCRIPTURE (unchanging; owned by an Edition)
  Edition      name, publisher, year, who collated it, who approved it
  Composition  Japji Sahib, Jaap Sahib …  (author, raag, source Granth)
  Section      pauri, chhand, ashtpadi, shabad — with its own heading records
  Line         one tuk: id, text, Ang or page, order, hash
  Token        one word as it stands in that line: id, position, text
  Variant      a reading that differs in another named edition (never silently merged)

TEACHING (drafted, reviewed, versioned; points at scripture by id + hash)
  Meaning      per Line, per language. Fields: says (the plain meaning), status, reviewer
  Note         per Line or Section. Kind: alternative reading | grammar | context | pronunciation
  Lexeme       a dictionary headword: forms, language of origin, senses, each with a source
  TokenGloss   Token → Lexeme + the form's grammar (case, number, person …) + sense used here
  Commentary   a pointer to a named work and place (title, author, page or link) + a short
               summary in our own words; never the copyrighted text itself
  CrossRef     Line ↔ Line elsewhere in Gurbani, with the reason, and who approved it
  Concept      Naam, Hukam, Haumai … a reviewed essay in Punjabi and English, linked from tokens
  Reflection   a prompt — clearly labelled as the editors' prompt, not Gurbani's meaning

LEARNER (private; on the device only)
  Place, Bookmark, Note, SavedWord, Setting — one store, one backup file
```

Rules that follow from this review:

1. **Every teaching record carries `status`** (draft · reviewed · approved), **`drafted_by`**
   (person or "AI-assisted") and **`reviewed_by`** (a named person or empty). The screen
   shows it in plain words. (Closes CI-M-09.)
2. **The plain meaning and any note are separate fields and separate things on screen.**
   (Closes CI-M-01, CI-M-07.)
3. **A Line is one tuk.** No record holds several. (Closes CI-S-10, CI-M-03.)
4. **IDs never change meaning.** When an edition changes, a migration table maps old IDs
   to new, and the learner store follows it. (Closes CI-R-03.)
5. **Headings are headings**, typed, in print order. (Closes CI-S-01, CI-S-05.)
6. **Bani length is data, not a fork.** A composition can have named selections — for
   example "Rehras: SGPC Rehat Maryada", "Rehras: [another named tradition]" — each a list
   of Section IDs. (Addresses CI-S-09.)

## 3. Where the content for levels 3–5 can lawfully come from

I am not a lawyer; each line needs checking before use.

| Need | Possible source | Position |
|---|---|---|
| Word forms and positions | Derived from the approved text itself | Ours |
| Dictionary senses | Bhai Kahn Singh Nabha's *Mahan Kosh* (1930) | Likely public domain; confirm, and credit the digitisation used |
| Grammar of each form | The published Gurbani grammar tradition (Prof. Sahib Singh; Principal Teja Singh) — as *method*, applied afresh by qualified people | Facts and method are free to use; their wording is not |
| How teachers read the passage | Faridkot Teeka (likely public domain); pointers to Darpan, Santhya, Shabdarth | Link and summarise; do not reproduce modern texts |
| Word-level study of Sri Guru Granth Sahib banis | The Guru Granth Sahib Project | Link out; approach them about collaboration (owner's call) |
| Cross-references | Proposed by tools from shared vocabulary, **approved one by one by a qualified person** | Ours once approved |
| Dasam Bani word study | Little exists openly; this is where original, reviewed work would add most | Needs scholars |
| Pronunciation | Human recordings with written permission only | No synthetic voice, as the assignment says |

AI may help *prepare* candidates (find every occurrence of a word, propose a parse, list
verses sharing a phrase). It does not sit in the reader, and nothing it proposes is shown
to a reader as approved until a named person approves it.

## 4. Learning design without game mechanics

| Principle | What it looks like here | What it never becomes |
|---|---|---|
| Recall strengthens memory | "Teach-back" already asks the reader to say it in their own words; add "cover the meaning, recall it, reveal" | Quizzes with scores |
| Spaced return | A quiet "Return to" shelf: saved lines and words, ordered by how long since last seen | Streaks, daily targets, reminders that nag |
| One step at a time | A beginner sees Read and Understand; Words and Study open when asked for | Locked levels, badges |
| Meaning before analysis | A child-level sentence first ("simple words"), then the fuller meaning | Simplification that changes doctrine |
| Punjabi first | Concept notes and study written in Punjabi, then English — not translated back | English as the master copy |
| The learner's own words | Notes, private, exportable, never analysed | Sharing feeds, "popular highlights" |

## 5. What the reader's screen becomes (words only; design to follow)

- A line of Gurbani. Touch it: **Meaning · Words · Save · Note**.
- **Words** lays the line out word by word; touch a word for its form, root and sense here,
  each with its source and review status; "see this word elsewhere" lists other lines.
- **Study** for the passage: how named teachers read it; where they differ; related
  verses (ਪ੍ਰਮਾਣ) with one line on why each is related.
- **About this text**: edition, who collated, who approved, what is still a draft.
- **My library**: saved lines, saved words, notes; one backup; a "Return to" shelf.

## 6. Order of building (see D11)

1. One reader on one data shape, with the integrity check and migration (no new content).
2. Scripture established on named editions.
3. Meanings reviewed by people, voice rule applied.
4. Word layer for **one** short composition as a pilot (suggestion: Sohila — 56 lines, all
   Sri Guru Granth Sahib, well served by existing scholarship), fully reviewed, before any
   wider roll-out.
5. Cross-references and concept notes for that pilot.
6. Only then: more compositions.

## 7. A test for "world-class", for later

When a learner, after a month with one bani, can read it correctly, say what each line
says, explain any word in it, name one place where teachers differ, and point to one
related verse elsewhere — measured with real learners who agree to take part — the claim
can be discussed. Not before, and not from a feature list.
