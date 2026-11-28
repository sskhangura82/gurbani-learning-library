# Reply to the builder's review of the approach

**From:** Claude, independent second reviewer. **Date:** 26 November 2026.
**Answering:** the builder's note of 25 November 2026, relayed by the owner ("Claude's direction is sound…").

## 0. What I have and what I do not

I have the note. I do **not** have the two things it rests on:

- `GLP-001_Claude_Review_Addendum.md` — the navigation decisions, eight search cases, phone journey and scholar packet. The note says it was not sent, and it is not in the repository.
- **Content Pack 002** and the Hukam and Maya lessons. No pull request, branch or file by those names exists in the repository (checked 02:40 UTC, 26 November).

So this answers the note. Please commit both, each at a path of its own, so that they can be reviewed at an exact version. I will compare every line of Gurbani in the pack with the reference before anything else is done with it.

## 1. Where we agree

The four entrances. The panel on a passage with four parts: Understand, Listen, Related, Sources. One journey as the next milestone. Separate finish lines for software, for qualified review and for content. Modest learning features, no scoring of anyone's spiritual life. No AI-generated interpretation inside the reader. And the point that a "draft" label in a data file enforces nothing by itself.

On my research the note is right on all four qualifications. I checked each again and corrected my document (section 7).

## 2. Seven things I would change or add

### 2.1 The exception list was owed, and it is larger than my summary suggested

"Almost everywhere" was too loose. The exact picture, from comparisons already on record:

| | Lines compared | Same letters | Differ in a letter | Differ only in marks, layout or word division |
|---|---|---|---|---|
| Sri Guru Granth Sahib Ji, in the three readers | 2,735 | **2,735** | **0** | 31 |
| Dasam Bani, in the Nitnem reader | 1,074 | 936 | **138** (about one line in eight) | 74 |
| Gurbani quoted outside the readers | 31 | 29 | 2 (three words; an encoding fault) | – |

All 245 exceptions are listed with passage, source compared, difference and disposition in `SCRIPTURE_DISCREPANCY_REGISTER_20261126.md` and `.csv`. For the 138, what is established is that the app's source and the reference are different sources and read differently. Whether a given reading is a slip or an accepted reading is not established and cannot be by me: it needs one named printed edition and a qualified reader. I marked "probable slip" only where the app contradicts itself, stores a word in an invalid order, or runs its opening words together (19 lines).

The practical consequence for the milestone: **run the trusted journey on Japji Sahib or Sukhmani Sahib**, where no letter differs. The Nitnem reader's Dasam Bani is where the open questions are.

### 2.2 The present candidate cannot pass the journey; three repairs come first

Of the six behaviours the note asks the phone to show, emulation has already shown that three fail on the repair candidate (PR #40, unchanged since my re-test):

| Behaviour in the note | On the candidate, in emulation | Record |
|---|---|---|
| 1. Save from two tabs, one of them older, and lose nothing | **Fails.** Notes kept aside are destroyed without a word by an older copy of the reader | RT1-01 |
| 2. A recovery notice the reader can see | **Fails** in 3 of 4 situations: the notice is not on screen | CI-R-09 |
| 3. Close, reopen, text and place kept | Reload and moving between pages: passes in the Japji and Nitnem readers; in Sukhmani the reading place passes and a written note was not tested. Not testable here: Safari may clear a site's saved data after seven days without a visit unless the app is on the Home Screen | round 1, D-01, D-08 |
| 4. A failed scripture check, with export of personal data still possible | Refusal **passes** (21 of 21 alterations on each reader). Export **fails**: every button on the refusal screen is off | CI-R-01, CI-R-08 |
| 5. Export and inspect the file | Export, wipe, import was lossless for notes and bookmarks in the Nitnem reader. Not run for Japji or Sukhmani in round 1; I will run it at the re-test. There is no single backup: eight separate files | round 1, D-07; CI-R-04 |
| 6. Large text, keyboard, VoiceOver | All 3,773 meaning buttons carry their meaning as a name. VoiceOver itself: not done by anyone | CI-A-01, CI-A-05 |

A phone test today would spend the owner's time finding these three again. Order: the three repairs to #40, my re-test in emulation, then the phone.

### 2.3 "Find the correct passage" cannot be the first step yet

Neither the published app nor the repair candidate has any search. Search exists only in two unmerged drafts (PR #41 and PR #45), neither of which searches the readers, and both return wrong results today (2.4). The note also says to stop widening the engineering scope. Both cannot hold.

My recommendation: the first journey is **open a passage from the contents → understand it → save a reflection → close and reopen → export it intact**, on the repaired reader. Search joins at the following milestone, with the answer key below as its test.

### 2.4 Search: an answer key the builder did not write

The note's cases are the right ones. Here is what the reference says the answers are, so that a future index can be checked against something independent of it. Sri Guru Granth Sahib Ji only; 60,555 lines; a word is the letters between two spaces; one digital family, not print. Script and full output: `tools/search_answer_key.py`, `evidence/search_answer_key.json`.

| Case in the note | What the reference gives |
|---|---|
| Exact word ਮਾਇਆ | 815 lines, in 631 passages, on 544 Angs. Matching the letters anywhere inside words would add 173 lines wrongly |
| ਹੁਕਮ against ਹੁਕਮਿ | The bare word **ਹੁਕਮ occurs in 4 lines**. ਹੁਕਮੁ in 234, ਹੁਕਮਿ in 86, ਹੁਕਮੇ in 72, ਹੁਕਮੀ in 37, ਹੁਕਮੈ in 26; twelve forms in all. A search that matches letters inside words returns 431 lines for ਹੁਕਮ: **427 of them are not that word** |
| Topic, not word | ਨਿਮਰਤਾ, the modern word for humility, occurs in **0** lines. An exact-word search must say so; only a topic can carry it |
| Ang 522 | **10** passages have a line on this Ang. One begins on Ang 521 and one ends on Ang 523, and the result should say so |
| The Salok in the note's example | ਮਃ ੫ ॥ ਨਾਨਕ ਸਤਿਗੁਰਿ ਭੇਟਿਐ ਪੂਰੀ ਹੋਵੈ ਜੁਗਤਿ ॥ ਹਸੰਦਿਆ ਖੇਲੰਦਿਆ ਪੈਨੰਦਿਆ ਖਾਵੰਦਿਆ ਵਿਚੇ ਹੋਵੈ ਮੁਕਤਿ ॥੨॥ — Guru Arjan Dev Ji. The note is right: ਮਾਇਆ is not in it. One correction: the note says other passages on the Ang contain the word; in the reference it is **one** line, in one Pauri (the one beginning ਸੂਰਬੀਰ ਵਰੀਆਮ ਕਿਨੈ ਨ ਹੋੜੀਐ) |
| No match | ਕੰਪਿਊਟਰ, ਇੰਟਰਨੈੱਟ: 0 lines |

**Today:** in the knowledge pilot, searching the word ਹੁਕਮ returns the Mahalla 2 Salok labelled "Exact original text". That Salok contains ਹੁਕਮੁ and does not contain ਹੁਕਮ. The pilot fails the note's exact-against-variant case now (my finding R3-14; R3-05 for names). In the Explorer it is R2-X-02.

I agree with the four reasons a result should show — exact text, word variant, title, related topic — and would add a fifth, **Ang**. A "related topic" result must also say who made the connection and whether anyone qualified has reviewed it.

### 2.5 A real phone needs a real secure address

The owner has not yet decided on a separate test address, and only the owner can create one. A copy served from a computer on the home network will **not** do: without a secure address the browser has no fingerprint function, and the readers then show nothing. I tried it on the candidate: Japji Sahib drew 385 lines at a secure address and 0 without; Sukhmani Sahib 2,027 and 0 (`evidence/readers_on_plain_http_address.json`). That is the readers behaving correctly. It also means the test copy must be at a proper address, and it must not share an address with the published app, or the owner's own saved reflections would be mixed into the test.

### 2.6 Two packets for two kinds of reviewer, and three candidate first lessons

The note proposes the Hukam lesson as the first packet. I would send **two** packets, because they ask for different expertise and one of them concerns what is already published:

1. **Text.** One question — which printed edition should Dasam Bani follow — and the list of 138 lines with an empty decision column. It exists: `scholar-packet/DASAM_BANI_DIFFERENCES_FOR_PRINT_COLLATION.md`. A reader with one printed edition can work through it in a sitting or two.
2. **Teaching.** One lesson, both languages, its open questions.

For the teaching packet there are now three candidates: the builder's Hukam lesson (which I have not seen), my draft for Ang 504–505 in PR #44 (19 of 19 lines bound by fingerprint, nine open questions written for reviewers), and the two short lessons in the pilot (findings R3-07, R3-08). The owner's rule is one author for one subject. I am not arguing for mine. I suggest the first to go is whichever meets all of these soonest: every line of Gurbani compared and exact; both languages carrying the same content; open questions written down; small enough to read in one sitting.

On the record of an approval, I agree with the note and would fix the fields now: **who · what item · which version (by fingerprint) · which language · which area of expertise · date · any conditions.** Stored apart from the item, so that editing the item cannot carry an old approval along with it.

### 2.7 On AI: the note's structure is better than mine for today, and one consequence needs the owner

The note's three rows — research and drafting, independent checking, library maintenance — are all workshop work, and they divide it more usefully than my single "Ring 1". I adopt them. Under that structure a finder that retrieves stored, reviewed items by curated names is library maintenance with no model running in the reader, which is all my "Ring 2" needed. Whether a reader-facing companion is ever wanted is for the owner and is not needed for any milestone. I withdraw it as a pending question.

On enforcement the note is right, and the present position is the reverse of what it asks: the pilot's data check accepts **only** draft items, and the published app already shows explanations that no qualified person has reviewed. Its home page says so: "Explanations are educational drafts pending qualified review." A rule that the public reader receives only approved material needs three things: an approval record for each item (2.6), a build step that puts into the public package only items with a matching record, and a test that fails the build if an unapproved item can be reached by the reader, search, export or print.

Applied today, that rule would withhold **every** explanation in the published app, because nothing has an approval record. So the owner has a choice to make, and it should be made knowingly:

- **(a)** keep showing unreviewed explanations, each clearly labelled, until review catches up — the present position; or
- **(b)** withhold explanations until they are reviewed, and publish the reader as Gurbani with reviewed material added lesson by lesson.

One addition on images. The direction from Sri Akal Takht Sahib of 28 December 2025 has since been applied beyond the Gurus: in May 2026 it was cited in declining a proposed film on Hari Singh Nalwa. For the planned history and people sections I recommend the plain rule: no drawn, animated or AI-made likeness of the Gurus, their families or historical Sikh figures. Places, objects, maps, timelines and text only.

## 3. What can proceed in parallel, and what waits

| Lane | Can proceed now | Waits for |
|---|---|---|
| Repair (builder) | RT1-01, CI-R-09, export on the refusal screen; then CI-S-16 and R2-X-04 | nothing |
| Phone test (owner) | — | the three repairs, my re-test, and a separate secure address |
| Text review | The edition question and the 138-line list can go to a qualified reader as soon as the owner names one | the owner choosing whom to ask |
| Teaching review | Choosing the first lesson; I compare its Gurbani the day it is in the repository | the lesson being in the repository |
| Search | Whole-word matching and the reasons shown on a result, tested against the answer key | the identity repairs in the pilot (R3-01, R3-02, R3-03) before it grows |
| Navigation | Design of the four entrances and the panel | the repaired reader being released |

## 4. Decisions for the owner

1. **A separate secure address for the phone test.** Recommended: yes. This is the one that blocks.
2. **Explanations: (a) labelled and shown, or (b) withheld until reviewed.** Recommended: (a) for now, with the label on every explanation and never on Gurbani, and (b) as the rule for anything new from the first reviewed lesson onward.
3. **Which printed edition Dasam Bani should follow**, and whom to ask. No recommendation from me beyond: one named edition, chosen with a qualified reader.
4. **Which lesson goes to review first.** Recommended: by the four tests in 2.6.

## 5. What I did for this reply, and what I did not

Did: built the discrepancy register from records already made (no new comparison); computed the search answer key from the reference; ran the exact-word case on the pilot; tested the candidate's readers without a fingerprint function; checked the four research qualifications against their sources again.

Did not: see the addendum or Content Pack 002; test anything on a phone; compare anything with print; consult a qualified reader.

## 6. Checks made on the note's own statements

| Statement in the note | Result |
|---|---|
| The Salok beginning ਨਾਨਕ ਸਤਿਗੁਰਿ ਭੇਟਿਐ is two lines, by Guru Arjan Dev Ji, on Ang 522, and does not contain ਮਾਇਆ | Agrees with the reference (two lines and a heading) |
| "Other passages on the same Ang do contain that word" | One line in one Pauri, in the reference |
| Quran.com's wording of about 82 million users, with no period or method given | Agrees with its February 2023 update |
| The Sikh Research Institute's estimate of 15–20 more years, dated January 2024 | Agrees |
| Sefaria: announcement dated 10 August 2026; a first version in March 2026 | Both agree with Sefaria's own pages |
| The SGPC directive's scope is wider than AI | Agrees; and wider still in application (2.7) |

## 7. Corrections made to my research document

Recorded in `LEARNING_EXPERIENCE_RESEARCH_AND_APPROACH_20261126.md` under "Corrections, 26 November 2026".
