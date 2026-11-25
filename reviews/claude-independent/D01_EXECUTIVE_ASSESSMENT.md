# D01 · Executive assessment

**For:** Sarwinder (Steve) Khangura, product owner
**From:** Claude, independent second reviewer
**Reviewed:** Gurbani Learning Library at commit `a3476ac` (release PR #37), 2026-11-25
**What this is:** a first complete pass. Scripted checks covered everything. Reading of
meanings, market research and device testing are partial or not done, and are marked so.

---

## Is it working?

**As a reading app: yes.** All nine compositions open, read cleanly, keep your place and
work with no connection. Nothing leaves the device. A failed update does not break the
working version. These were tested and they hold (in a desktop browser pretending to be a
phone — not on an iPhone).

**As verified scripture: not yet.** The Sri Guru Granth Sahib text (Japji, Sukhmani, Anand,
Sohila, the Rehras shabads) matches a respected digital reference letter for letter. The
Dasam Bani text (Jaap, Savaiye, Chaupai) does not: about one line in eight differs in some
letter or mark, and two of the three come from a web copy nobody has named. Nothing has
been checked against a printed saroop or gutka by anyone.

**As a teacher: in part.** Japji and Sukhmani meanings are careful. The six banis added in
the last release are uneven: many "meanings" describe the verse from a distance — "the
poet portrays…" — instead of saying what the line says, and some soften it.

## What has been completed?

- The exact version was pinned and my test criteria were written and committed **before** I
  looked at the builder's tests.
- **Every one of the 3,809 pieces of Gurbani in the app** was checked by script: stored
  correctly, drawn correctly, in the right order, with the right page number, and compared
  word by word with a reference database.
- All 3,773 line meanings and 610 studies were screened by script; I read **342 meanings
  myself** (9%) against the Gurmukhi.
- First-use walk-through, 17 reader tasks, accessibility scan, offline, update, tamper and
  saved-notes tests — all with made-up data.
- Only then did I read the builder's tests and documents, and compare.
- A packet for scholars: every one of the 138 differing Dasam Bani occurrences, laid out
  for checking against print.

One thing to say plainly: **the comparison caught a mistake of mine.** I had reported that
one heading in Jaap Sahib was in reversed order. It is not; my own script had shuffled it.
The builder had it right. I corrected the record and lowered that finding. It is a good
reminder that my scripture findings are candidates for qualified people to check, not
rulings.

## What is holding us back?

In order of weight:

1. **No qualified person has looked at any of it.** Every check so far — the builder's and
   mine — is a machine comparing copies. That can prove faithful copying. It cannot prove
   the copy is right.
2. **Dasam Bani text is unsettled.** 138 of 1,074 occurrences differ from the reference;
   opening lines of Savaiye and Chaupai are visibly fused; one word in Jaap Sahib is spelled
   two ways three verses apart.
3. **Two of the three readers would show altered Gurbani without noticing** if their data
   were ever corrupted, and the Japji reader can silently drop a saved note it cannot place.
4. **Blind readers cannot hear the meanings.** A label added to each meaning hides its text
   from screen readers, in all three readers.
5. **The newest meanings keep Gurbani at arm's length** and carry hundreds of
   medical-style disclaimers ("not clinical efficacy data") that a test forced onto every
   line.
6. **Three different readers.** Japji, the six Nitnem banis and Sukhmani look and behave
   differently, save separately and back up separately. Every fix has to be made three
   times.
7. **Nobody has tried it on a real iPhone** in any recorded review since October.

None of these is hidden damage. The builder has been honest about limits; most of what I
found sits where its tests never looked: is the text right, can everyone use it, does the
meaning say what the line says.

## What happens next?

Four waves, detailed in D10 and D11:

1. **Safety, honesty, access** — fixes that touch no Gurbani text: screen-reader access,
   integrity checks in every reader, never losing a note, plain words on screen. These go
   out as small pull requests for ChatGPT to review. **The first is already open as a
   draft (#39):** screen readers can read the meanings in the six Nitnem readers — built
   and tested in emulation, not yet reviewed, not deployed.
2. **Scripture and meanings on firm ground** — a named printed edition, qualified
   reviewers, the 138 differences decided one by one, Rehras properly divided into lines,
   meanings reviewed by people.
3. **One reader** instead of three.
4. **Depth** — word-by-word study and cross-references, piloted on one short bani.

My advice on direction: **do not add more banis yet.** The next one planned is Salok
Mahalla 9. Each addition multiplies today's gaps.

## Do you need anything from me?

Yes — seven decisions that are yours and cannot be made by a reviewer. They are set out
with my recommendation for each in D11, "Gate 0". The three that unblock the most:

1. **Who are the qualified reviewers, and which printed edition do we follow?**
2. **Thirty minutes with your iPhone**, following the checklist in D06 §6.
3. **A licence.** Today the project has none, so nobody may legally reuse a gift meant for
   everyone.

Everything else I will keep moving within the authority already given.

---

## The score, for the record

**34 of 100** on the rubric fixed before testing (D09). Read it with care: 75 is the most
any product can score before qualified scholars and real devices have validated it, and
four categories are held at the lowest working mark by specific, fixable, high-severity
items. Closing those lifts the total to about 48; closing the medium ones, to about 72.
The number measures this app against its own standard. It says nothing about any other
app, and nothing in this review supports a claim of "best".

## Where everything is

| # | Deliverable | File |
|---|---|---|
| 1 | Executive assessment | this file |
| 2 | Gurbani source audit | `D02_GURBANI_SOURCE_AUDIT.md`, `scholar-packet/` |
| 3 | Translation and teaching audit | `D03_TRANSLATION_AND_TEACHING_AUDIT.md` |
| 4 | Market research (first pass) | `D04_MARKET_RESEARCH_REPORT.md` |
| 5 | Competitive feature matrix (first pass) | `D05_COMPETITIVE_FEATURE_MATRIX.md` |
| 6 | UX and accessibility audit | `D06_UX_AND_ACCESSIBILITY_AUDIT.md` |
| 7 | Technical and privacy review | `D07_TECHNICAL_AND_PRIVACY_REVIEW.md` |
| 8 | Learning architecture blueprint | `D08_LEARNING_ARCHITECTURE_BLUEPRINT.md` |
| 9 | Scorecard | `D09_PRODUCT_EXCELLENCE_SCORECARD.md` |
| 10 | Prioritized backlog | `D10_PRIORITIZED_IMPROVEMENT_BACKLOG.md` |
| 11 | Implementation plan | `D11_IMPLEMENTATION_PLAN.md` |
| 12 | Final reviewer verdict | `D12_FINAL_REVIEWER_VERDICT.md` |
| — | All findings, with evidence and acceptance tests | `FINDINGS_REGISTER.md` |
| — | What was and was not examined | `COVERAGE_REGISTER.md` |
| — | Order of work, and my correction | `00_…`, `01_…`, `02_…` |
