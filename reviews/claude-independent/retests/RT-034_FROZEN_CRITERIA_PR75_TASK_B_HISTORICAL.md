# RT-034 — FROZEN CRITERIA: #75 Task B (historical / editorial source review)

Reviewer: Claude (independent). Frozen 2026-11-27, **before** opening the editorial packet.

## Prior-exposure disclosure — material for this task

This is the one place where I have **substantial prior exposure**, and it must be declared.

Earlier today, under the founder's ruling *"historical review is between chatgpt and claude —
you can make initial calc and claude double checks it. Keep in mind we are focused on
authentic sources"* and with his explicit approval to fetch, I verified **6 of the 10
Kartarpur claims against 5 of 5 cited sources**, plus four line-level Gurmukhi citations
against the pinned corpus. Recorded in `RT-027_ADDENDUM_SOURCE_FIDELITY_VERIFIED.md`.

**Consequence I accept:** for those 6 claims I am no longer a cold reader. I will mark them
`PRIOR-EXPOSURE` in the findings, keep the earlier verdicts visible rather than re-deriving
them as if fresh, and apply the criteria below principally to **the 4 claims I have not
examined, the 7 narrative paragraphs, and the 3 editorial questions** — none of which I have
read. I have **not** opened the editorial packet `0d663e0b…`.

Under the standing seat rule I am verifier here, not author. I did not write any of this
material.

## Falsifiers

| id | fires if | instrument |
|---|---|---|
| **FB.1** | A cited source does not support the claim attached to it. | Fetch the cited source, read the relevant passage, compare. This is the **HIST-01** class: a citation's *presence* is not its *support*, and nothing in the repo checks support. |
| **FB.2** | A claim is stated more strongly than its source warrants — a source's "probably" or "tradition holds" rendered as fact. | Compare modal strength of claim and source, word for word. |
| **FB.3** | Invented material: dialogue, private thoughts, eyewitness scenes, encounters, or a date, place or number appearing in no cited source. | Every concrete particular traced to a source or marked unsupported. Standing constraint: never invent conversations, quotations, private thoughts, historical details or encounters. |
| **FB.4** | A paragraph imports another tradition's theology, framing or practice onto Gurbani. | Read for imported categories. Standing constraint. |
| **FB.5** | Gurmukhi is quoted or paraphrased inaccurately against the pinned corpus, or spelling is modernised. | Byte-compare every Gurmukhi string to the pinned corpus. Standing constraints: never silently modernise spelling; never silently modify Gurbani to reconcile differences. |
| **FB.6** | A copyrighted modern translation, commentary or book layout is reproduced. | Check each rendering against its claimed basis; a public-domain source must actually be the one used. |
| **FB.7** | Editorial or AI-written explanation is presented as the authoritative voice of the Guru, or an interpretation is presented as scripture. | Check the `contentKind` classification and the presentation boundary of every passage. |
| **FB.8** | A genuinely disputed historical point is presented as settled, with no indication of the dispute. | Where sources disagree, the text must show the disagreement, not pick a side silently. |
| **FB.9** | An editorial question is answered in a way that **resolves a scholarly dispute by AI or builder fiat**. | The three editorial questions must route to qualified human scholarship, not be closed by two AI systems agreeing. Standing constraint: do not declare unreviewed material authentic merely because two AI systems agree. |
| **FB.10** | The text I review is not the text bound — draft binding `bd4169a6…` or editorial packet `0d663e0b…` digests do not match what I read. | Recompute both digests before reading a word of content. |
| **FB.11** | A claim rests on a search snippet, an HTTP 200, an Ang number, a first line, or a provider majority vote. | Standing constraint: none of these is ever sufficient authentication. |

## Hard limit on what a clean Task B can mean

I can verify that a cited source **says** what is claimed. I **cannot** verify that the
source is **correct**, that the historiography is sound, or that the presentation is
appropriate for Sikh practice. **Qualified Sikh scholarly review remains explicitly
outstanding whatever this task returns**, and I will not let a clean finding list read as a
substitute for it. The request's instruction not to reintroduce a mandatory human gate from
older handoff language is about *gating mechanics*; it does not make my review equivalent to
scholarly review, and I will not report it as such.

## Commands to run (contracts, no activation)

`node --test tests/history-registry.mjs tests/history-draft.mjs tests/history-editorial.mjs`
and `node tools/history/editorial-check.mjs`, plus the daily-reading contracts
`node --test tests/hukamnama-preparation.mjs tests/hukamnama-test-publisher.mjs`.
**No publisher is activated and no flag is enabled.**
