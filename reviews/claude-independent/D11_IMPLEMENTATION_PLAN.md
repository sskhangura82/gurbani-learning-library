# D11 · Implementation plan

Proposed. Every step that changes the public app goes through a separately scoped pull
request, is reviewed by the other reviewer (ChatGPT reviews Claude's; Claude reviews
ChatGPT's), and is never merged directly by its author. This review branch changes no
application file.

Status words used: **proposed** → **implemented** → **tested** → **independently
reviewed** → **publicly deployed**. Nothing below is past "proposed".

## Gate 0 — decisions only the owner can make

| # | Decision | Why it cannot be delegated | My recommendation |
|---|---|---|---|
| 1 | Which printed edition each text follows, and who the qualified reviewers are | Theological authority | SGPC standard saroop for Sri Guru Granth Sahib; one named SGPC or other gutka for nitnem Dasam Bani; two or three reviewers, at least one with santhya training |
| 2 | Whether Savaiye and Chaupai stay public while their text is unsettled | Reputation and reverence | Keep them, with a plain notice: "This text is being checked against a printed edition" |
| 3 | Which Rehras and Chaupai the app follows, and whether to offer lengths | Tradition | Follow one maryada by default, name it plainly; add named lengths later |
| 4 | Voice and caution policy for meanings | Theological tone | Plain meaning in the line's own voice; notes separate; no per-line disclaimers |
| 5 | Licences for code and for teaching text | Rights | An open-source licence for code; a Creative Commons licence for original teaching text; scripture text credited to its sources |
| 6 | Pause on new compositions | Product direction | Pause until waves 1 and 2 are closed |
| 7 | Whether to approach The Guru Granth Sahib Project, Shabad OS and Khalis Foundation | Relationships | Yes: report the slips found; ask about linking |

## Wave 1 — safety, honesty and access (no Gurbani text changes)

Small pull requests, each with its own test added to the quality gate.

| PR | Contents | Closes | Acceptance |
|---|---|---|---|
| 1a | Screen readers can read meanings: remove the fixed spoken labels in all three readers; add an automated accessibility scan to the gate | CI-A-01 | Scan clean on every reader; device step 7 in D06 passes |
| 1b | Japji and Sukhmani readers refuse altered data: whole-file hash, per-line hash, expected counts; clear message | CI-R-01 | Tamper script reports "refused" for every variant |
| 1c | Japji reader keeps what it cannot place; no silent trimming | CI-R-02 | Unknown-ID test shows the note preserved and visible |
| 1d | Words on screen: plain labels for size and speed; fix "after25", "All40"; remove working notes and "the app" from reader-facing text; say once, plainly, what a draft is | CI-U-03, CI-M-08, CI-M-09 | String screen returns 0; family tester reads every label |
| 1e | README and counts corrected; missing audit files committed; printed source named | CI-M-03 (count), CI-X-03 | Every cited file exists |
| 1f | Saved-learning migration: old ID → new ID table; "kept aside" list; one backup file for the whole library | CI-R-03, CI-R-04 | Synthetic notes survive a test edition change |
| — | A person runs the 30-minute iPhone session in D06 | CI-A-05, CI-S-13 | Checklist with photos |

1f must be **independently reviewed and deployed before any wave 2 text change**.

## Wave 2 — scripture and meaning foundation

Sequence for each composition, Dasam Bani first:

1. Reviewers collate against the named edition using the packet in `scholar-packet/`.
2. Builder applies the decisions with a before/after record per line (the existing
   `source-amendments.json` format is good; add edition, page, reviewer).
3. The other reviewer re-runs the collation script and the on-screen order check.
4. Meanings bound to changed lines are re-read by a person.
5. Saved-learning migration is exercised on the change.
6. Deploy; record in a public change log inside the app's About page.

Then Rehras is re-divided into tuks (CI-S-10) the same way, and its line meanings written.

In parallel, human review of meanings begins with the 110 lines in the reading register
and the 157 screened entries, then Chaupai and Savaiye in full (CI-M-01, CI-M-02), using
the voice rule from Gate 0.

## Wave 3 — one reader

One reader program, one data shape (D08 §2), one learner store. Order: move Japji onto
the Nitnem reader's engine; then Sukhmani, loading one ashtpadi at a time; then apply the
single-dock design to all. Each move keeps the old page reachable until the new one has
passed the same browser suite and a device session.

Adds: search by first letters, one text-size control, one appearance setting, one save
gesture, grouped navigation (CI-U-01 … CI-U-10, CI-A-02, CI-U-09).

## Wave 4 — depth

The Sohila pilot from D08 §6: word layer, concept notes, cross-references, Punjabi-first
study — all reviewed by named people — before anything wider.

## Standing rules

- No direct merge of an author's own change. No merge with the quality gate red.
- A failed update must leave the working version intact (already true; keep the test).
- No account, no analytics, no AI inside the reader, no synthetic voice.
- No sentence of the form "best in the world" until real comparative evidence exists.
- Every release note states what is tested in emulation only, what on a device, and what
  by qualified people — in those words.

## What I can start on at once, within the authority already given

PRs 1a, 1b, 1c and 1e touch no scripture and no doctrine. I can prepare each on its own
branch for ChatGPT's review. I have not started them inside this review branch, so that
the review stays a review.
