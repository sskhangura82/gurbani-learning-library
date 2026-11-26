# Round 3 — my findings beside the builder's tests

**Written after** `01_INDEPENDENT_FINDINGS_ROUND3.md` was committed and pushed (`55e1f21`, 02:20 UTC,
26 November 2026). Only then did I open `tests/knowledge-contract.mjs`, `tests/knowledge-browser.mjs`
and `.github/workflows/knowledge-pilot-qa.yml`.

## What I re-ran

| Builder's test | Here | On GitHub |
|---|---|---|
| `tests/knowledge-contract.mjs` | **14 of 14 pass** | pass |
| `tests/knowledge-browser.mjs` | **13 of 13 pass**, with one difference: the browser build that the pinned driver (1.62.1) expects is not installed here, so I ran it with driver 1.63.0 and its build | pass with the pinned version |
| The readers' three existing checks | not re-run here | GitHub records all three as passing on this head |

The builder's tests state their own limits: "Node contracts only, not scholarly approval or
real-device verification" and "Chromium viewports; no physical devices, actual Safari or
assistive-technology acceptance". That is accurate.

## Where the two sets of tests differ

| Question | Builder's tests | Mine |
|---|---|---|
| Is the Gurbani right? | **8 of the 19 lines** are written into the test and compared (the heading, one middle line and the last line of each of the two Vaar Saloks; both lines of Bhagat Kabir Ji's), and the number of lines in each Salok (9, 8, 2). The other 11 lines are covered only by the file's fingerprint, which fixes whatever the file contained. | All 19 against a reference I loaded myself and against the cited file; boundaries fixed before the pilot was opened; Ang, printed line and source-file fingerprint for each; the line before and after each Salok. |
| Who is each Salok by? | A search for "Guru Angad Dev Ji" must return the Mahalla 2 Salok. | Author, Raag, Ang and Salok number for all three against the reference. |
| A careless edit with the fingerprint renewed | Nine changes given to the data check, all noticed: a wrong author in one place, a duplicated line, a reversed order, a wrong edition, a connection to nothing, a lesson marked approved, a missing "difference", a detached word-form, a counted approval. | 35 changes of my own choosing, some of the same kinds. The pilot's own data check noticed **14 of 35**; with the builder's test added, **22 of 35** (`evidence/k3_07_mutations_against_builder_test.json`). For Gurbani: **1 of 11** by the data check, **8 of 11** with the builder's test. See below. |
| Search that should find nothing | Two questions: "quantum computer" and "why do I get angry?". Both find nothing. | 55. Thirty-eight find nothing; nine are accidents of letters (**R3-05**). The builder's two behave for me too. |
| First letters | One line, with the mode chosen. | Every line, four ways. With the mode chosen, 19 of 19; as typed into the box as it opens, 0 of 19; by the carrier convention, 0 of 11 (**R3-06**). |
| Ang | "Ang 466" and "ਅੰਗ ੧੩੬੪". | 23 forms, including numbers that are not in the pilot or not in Sri Guru Granth Sahib Ji at all. |
| Names | Humility and Haumai in English, Gurmukhi and one Roman spelling each. | Every curated name in three forms (239), and 36 spellings a learner would try (**R3-13**). |
| Damaged data in the browser | One change (one word replaced). Refused. | 21 kinds. All refused. Nothing drawn while the check is pending. |
| Words | One word opens its meaning and focus returns to it, at three widths. | All 11 tappable words; Escape; the full entry and the way back; scroll position. |
| Lessons | The Humility deep study contains the words "hunter bows". | All 12 parts shown as stored; place kept; the draft notice at each depth; the content against the Saloks (**R3-07**); English against Punjabi (**R3-08**). |
| Comparisons | Each has a likeness, a difference, a passage and a reference address. | The same, and I looked both references up (**R3-16**). |
| Layout | Three widths, sideways scrolling. | Eight widths in four states, enlarged text, an automated access scan in 16 states, keyboard, print. |
| Names of things | not tested | Two Saloks fit one name (**R3-01**); a line has no lasting name (**R3-02**); the library's titles stand as the Saloks' names (**R3-04**). |
| Moving about | not tested beyond the word window | The browser's Back, addresses, reload (**R3-09**). |
| Offline worker; storage | A scan of the code for words such as `localStorage` and `innerHTML`. | Measured in the browser: nothing stored, nothing requested elsewhere; the readers' offline copy unchanged. |
| Things the builder tests and I did not | The search's collection filter (asking for Dasam Bani returns nothing; it is not offered on the page); that a dictionary headword's spelling does not open a meaning where the line has a different spelling; a scan of the code. All pass. | — |

**Nothing in the builder's tests contradicts my findings, and none of my findings is something
their tests claim to have covered.** No finding changes.

## One finding the builder's tests make more exact: R3-03

My finding said the page's only check on the text is one fingerprint shared with the teaching, and
that the pilot's own data check noticed 1 of 11 changes to Gurbani once that fingerprint is renewed.
The builder's contract test adds a real second guard, and I should say exactly how much:

- **Caught by the builder's test:** any line added or removed (the counts 9, 8 and 2), and any
  change to the 8 lines written into the test.
- **Still passing both the page and the builder's test:** a change inside any of the other
  **11 lines** — a dropped sign, an invisible character, two lines exchanged. Three of my eleven
  cases were of this kind and all three passed. Also a changed Ang, a changed Salok number, a Raag
  given to Bhagat Kabir Ji's Salok, and a replaced source-file fingerprint (4 of 6 attribution
  changes passed).

So R3-03 stands at S2 and its repair is unchanged: Gurbani in its own file with its own fingerprint,
a fingerprint for every line, and a build check that derives the lines again from the pinned source
rather than from a list typed into a test by the same hand that typed the data.

## The workflow

It runs when the pilot's files or tests change, with read-only permission. It deploys nothing and
uses no secrets. The browser driver is pinned to an exact version. Two notes, both S3: the actions it calls are named by major version rather than by an exact
commit (as in the repository's other workflows), and it does not run when only the document changes. Criterion KT-07: **pass**,
together with R3-20.

## Tests I would ask the builder to add

1. All 19 lines compared with lines derived from the pinned source, not typed into the test.
2. A list of words that must find nothing (the nine in R3-05 to begin with).
3. First letters typed into the box as it opens, and with the three carriers.
4. No two Saloks on one Ang may produce the same name (run over Ang 470).
5. Each lesson part has the same number of sentences in both languages.
6. The browser's Back after three moves stays inside the library.
