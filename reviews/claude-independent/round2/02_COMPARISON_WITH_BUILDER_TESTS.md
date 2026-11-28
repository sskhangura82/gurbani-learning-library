# Round 2 — my findings beside the builder's tests

**Written after** `01_INDEPENDENT_FINDINGS_ROUND2.md` was committed and pushed (`9a0cc51`). Only then did I open `tests/hukamnama-*.mjs` and `tests/explore-*.mjs`.

## What I re-ran

| Builder's test | Here | On GitHub |
|---|---|---|
| `tests/hukamnama-foundation.mjs` (#43) | **13 of 13 pass** | pass |
| `tests/explore-learning.mjs` (#41) | **11 of 11 pass** | pass |
| `tests/hukamnama-browser.mjs`, `tests/explore-browser.mjs` | **not run here** — they import a browser-driving package that is not installed in the checkout | GitHub records both as passing |

The builder's tests are honest about their limits. Each one prints that it establishes no live retrieval, no rights, no scholarly approval and no device result.

## PR #43 — where the two sets of tests differ

| Question | Builder's tests | Mine |
|---|---|---|
| Is the Gurbani right? | Five of the 19 lines are written into the test and compared. The other 14 are covered only by the file's fingerprint, which fixes whatever the file contained. | All 19 compared with a reference I loaded myself; Ang and printed line for each; the lines before and after the Shabad. |
| Amritsar date | The date function at four instants. | Through the page, in five device time zones at three instants (15 cases); wrong device clocks. |
| Damaged data | One changed bit; one changed author name in the browser; eight changes given to the checker directly. | 24 kinds of change delivered to the browser, including removing the Rahao, removing the last stanza, Windows line endings and a re-saved file. |
| While the check is running | not tested | no Gurbani shown |
| Offline worker | not tested | holds none of these files; no stale copy possible |
| Links to outside sites | not tested | **R2-H-01**: the SGPC listening link has a wrong character |
| Opening state | Tested as correct: the page opens on the 25 November example. | **R2-H-02**: correct for a fixture, wrong for a daily reader |
| Evidence for each date | Checks that the stored strings are present. | **R2-H-03**: I tried to retrieve the sources; the stored evidence is a sentence, not a record |
| Access | Four widths, sideways scrolling. | Eight widths, automated scan in 12 states, keyboard, print, enlarged text |
| Things the builder tests and I did not | A summer-time instant in California; that the loaded record cannot be modified; a scan of the code for `innerHTML` and `Math.random`. All pass. | — |

**Nothing in the builder's tests contradicts my findings, and none of my findings is something their tests claim to have covered.** The two points I would ask to be added as tests: every outside address is on a reviewed list (would have caught R2-H-01), and each event carries a retrieval time and digest (R2-H-03).

## PR #41 — where the two sets of tests differ

| Question | Builder's tests | Mine |
|---|---|---|
| Are the nine opening lines right? | Compared with a list written into the test — the same hand that wrote the file. | Compared with the reference: 9 of 9, each the first line of its unit; 9 of 9 Angs. |
| Headwords | Each has Gurmukhi, Roman, English and Punjabi. | Each must occur in its own unit: 25 of 27 (**R2-X-07**). |
| Sources | Each address begins `https://`. | **R2-X-01**: one address is an unauthorised copy of a book. Beginning with `https://` does not catch that. |
| Finding | Three questions: "What is Hukam?", "Sukhmani Ashtpadi 12", "Is the moon a quantum computer?". All behave. | 77 questions. The three the builder tests behave for me too. Fragment matching, Gurmukhi numerals, non-existent Pauri numbers and words of distress do not (**R2-X-02, R2-X-03**). |
| Link to the reader | Opens Ashtpadi 17. | Opens Ashtpadi 17 — **and replaces the saved place** (**R2-X-04**). |
| Altered lesson file | not tested | 6 of 6 content changes displayed (**R2-X-05**) |
| Punjabi | Each unit has some Gurmukhi script in its Punjabi field. | Punjabi exists at the first level only; the introduction and glossary are never shown (**R2-X-06**). |
| Mangled address | not tested | **R2-X-09** |
| Things the builder tests and I did not | That the comparison list has exactly the three kinds promised; that "Surprise me" moves to a different passage (I confirmed this over 300 presses). | — |

**Again no contradiction.** The builder's tests check that the promised parts exist. Mine check whether each part is right, and what happens off the expected path. Both are needed; neither replaces a qualified human reader.

## What I changed in my own findings after reading the builder's tests

Nothing. No finding was withdrawn or softened, and none was added from reading them.
