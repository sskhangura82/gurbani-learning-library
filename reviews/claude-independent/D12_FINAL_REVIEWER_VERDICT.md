# D12 · Final reviewer verdict

**Version:** `a3476ac` · **Date:** 2026-11-25 · **Reviewer:** Claude (AI system; not a
Sikh scholar, not a lawyer; no physical device)

## Verdict

**Not approved as verified scripture or as a finished teaching product.**
**Acceptable to remain online as a clearly labelled family preview, on the conditions
below.**
**Not ready for wider promotion, for new compositions, or for any comparative claim.**

## Why

Under the gate rule fixed before testing, an open critical defect means "not approved".
No critical defect is confirmed. But six findings in the Dasam Bani text would be critical
if a print collation confirms them, and no print collation exists. Unknown is not a pass.

| Question | Answer | Basis |
|---|---|---|
| Is any displayed Gurbani proven wrong? | No | Nothing has been checked against print |
| Is all displayed Gurbani shown to be right? | No | Sri Guru Granth Sahib text agrees with one digital family (2,735 of 2,735 at letter level). Dasam Bani: 138 of 1,074 occurrences differ from the reference |
| Is anything missing or duplicated? | No, within the selections the app says it follows | Counts and sequences correct for all nine compositions |
| Do private reflections leave the device? | No | Network logs of every flow |
| Can saved learning be lost? | In one unusual case today (Japji reader); in ordinary use the moment any line ID changes, unless migration is built first | CI-R-02, CI-R-03 |
| Would a corrupted scripture file be caught? | In one reader of three | CI-R-01 |
| Can a blind reader use the meanings? | No | CI-A-01 (emulation; needs VoiceOver confirmation) |
| Are the meanings faithful? | Largely, in Japji and Sukhmani (139 lines read). Unevenly, in the six newer banis (203 lines read) | D03; a 9% sample by an AI reviewer |
| Has a qualified person reviewed text or meanings? | No | The app says so; the data says 0 |
| Has it been tested on an iPhone? | Not in any recorded review | Builder's documents and this review agree |

## Conditions for staying online as a preview

1. The app keeps saying, as it does now, that explanations are drafts awaiting qualified
   review — and adds, in plain words, that they were drafted with AI assistance.
2. A plain notice is added to Savaiye, Chaupai and the Chaupai within Rehras that the
   text is being checked against a printed edition. (Owner's decision; Gate 0, item 2.)
3. No new composition is added until waves 1 and 2 of the backlog are closed.
4. The README stops saying every source record is checked against its hash, until that is
   true in all three readers.
5. No statement anywhere that the app is verified, complete in scholarship, or best.

## What would change this verdict

| To reach | Needs |
|---|---|
| "Approved as a reliable reader" | Wave 1 closed and independently reviewed; a device session passed; Dasam Bani and Rehras text settled against named printed editions by qualified reviewers, with records |
| "Approved as a teaching resource for a given bani" | That bani's meanings reviewed and signed by qualified people under an agreed voice rule |
| Any comparative claim | The same tasks run by real people on real devices against the other products |

## What I am confident of, and what I am not

**Confident (verified by me, repeatable from the scripts in this folder):** the counts;
the hashes; that screen equals data in every reader and depth; the collation figures
against the stated reference; offline and update behaviour in Chromium; the tamper and
saved-learning results; the accessibility scan results; that nothing is sent off the
device.

**Not confident, and labelled so:** which of two differing readings is correct anywhere;
every observation about meaning; how anything looks or behaves on Apple devices; the
current state of other products.

**Known to have been wrong once:** my first report on Jaap Sahib chhand 62. Found and
corrected in the comparison step (`02_COMPARISON_WITH_BUILDER_TESTS.md`).

## Outstanding verifications

| # | What | Who can do it |
|---|---|---|
| 1 | Print collation of all Dasam Bani text; spot collation of Sri Guru Granth Sahib text | Qualified reviewers |
| 2 | Review of meanings, starting with the 110 lines and 157 entries listed | Qualified reviewers |
| 3 | iPhone, Safari, VoiceOver session (D06 §6) | Anyone with an iPhone |
| 4 | Live site serves exactly the reviewed files | Anyone with a normal connection, using `evidence/baseline-sha256.txt` |
| 5 | Second digital witness for the 138 differences | Reviewer with access to BaniDB and SriGranth |
| 6 | Hands-on comparison with other apps | People with devices |
| 7 | Licence and rights positions | Owner, with legal advice |

ਭੁੱਲ ਚੁੱਕ ਮਾਫ਼ — errors and omissions in this review are mine; please correct them.
