# Salok Sheikh Farid: teaching drafts (Claude content lane)

**Status:** `DRAFT_AI_UNREVIEWED`. These are original, AI-assisted English and Punjabi drafts. They have not yet had qualified Sikh scholarship or Punjabi language review, and nothing here marks them as reviewed.

**Bound to:** the selected Farid edition `salok-farid-selected-witness-34d2a7c-20261127` (`salok-farid/data/salok-farid.json`, SHA-256 `4141000d…d643`). The scripture text and manifest are unchanged and pinned by the checker.

## What is in this change

| File | What it is |
|---|---|
| `research/salok-farid/teaching-001-016.json` | Saloks 1–16 (41 verse lines) in the Salok Kabir authoring format: one meaning and one care note per verse line, then a passage lesson. |
| `research/salok-farid/heading-context-drafts.json` | Context for all 13 original headings: the collection title, the invocation, and the 11 Mahalla headings (Saloks 13, 52, 75, 82, 83, 104, 105, 108–111). |
| `research/salok-farid/teaching-evidence-001-016.json` | Binds every line to the frozen edition and records the Shabad OS line used for comparison. |
| `research/salok-farid/teaching-overlap-001-016.json` | Measured result: no authored field shares 8 or more consecutive words with the commentary text for its Salok. The longest shared run is 5 words. |
| `tools/check-salok-farid-teaching-drafts.mjs` | Validator. It has no network access and writes nothing. |
| `tools/check-salok-farid-teaching-overlap.py` | Overlap check. It needs the Shabad OS `master.sqlite`, which is not in this repository. |

Run `node tools/check-salok-farid-teaching-drafts.mjs`.

## How the drafts were written

- **Sources compared.** Four commentaries were read line by line from the pinned Shabad OS database (5.0.0-next.0): Prof. Sahib Singh's Darpan, the Faridkot Teeka, Bhai Manmohan Singh and Sant Singh Khalsa. They were used to check readings, not as text to copy.
- **Differences are taught, not hidden.** Where these commentaries read a line differently, the line's care note names them and paraphrases each reading. In this batch, 32 of the 41 line notes name at least one commentator. Examples:
  - Salok 1, line 1: the wedding day versus the day the soul entered the body.
  - Salok 2: the bundle as attachment to the world versus the bundle of devotion.
  - Salok 4: ਤਿਲ as breaths versus as sesame seeds.
  - Salok 5: whose hem is held.
  - Salok 6: other people's faults versus one's own wrongdoing.
  - Salok 15: Shaitan as the misled mind versus as Satan.
- **Authorship.** A Mahalla heading identifies the Guru for its own numbered Salok only. A name such as Farid inside a verse is treated as an address, not a signature. The source package already records this with `collectionTitleAssignsAuthorship=false` and `signatureAloneAssignsAuthorship=false`.
- **Wellbeing.** Care notes cover the places where a literal reading could harm:
  - Salok 7 and Salok 16: not taking revenge, or humility like grass on a path, is not a reason to stay in an abusive situation.
  - Salok 6: not judging others does not mean staying silent about real harm.
  - Salok 10: telling one's pain to the Lord does not rule out telling a trusted person or getting care.
  - Saloks 1 and 14: how to teach these with grieving readers or children.
- **Gender.** The bride and Husband-Lord voice is explained as a devotional convention used for every devotee. The Punjabi reflection questions avoid gendered first-person verbs.

## Needs from ChatGPT (build seat)

1. **Assembler.** Generalise the Kabir assembler for Farid:
   - Replace the two-lines-per-Salok assertion with `unit.lines.length`. Farid Saloks have 2, 3, 4, 5, 6 or 8 lines.
   - Read heading notes from `heading-context-drafts.json` instead of hard-coding them.
   - Assemble only drafted ranges until all 130 Saloks are present.
2. **Independent review.** Review this batch and record `editorial-review-001-016.json` and `editorial-amendments-001-016.json` in the Kabir shape. Claude does not write review or amendment records.
3. **Reader.** Show line care notes that name commentators in the line-meaning view. Mahalla heading context should appear beside its heading.

## Questions for Steve and qualified reviewers

1. **Which Farid.** Historians have discussed whether these verses are by Baba Farid Shakarganj or by a later Chishti successor, Sheikh Ibrahim. Macauliffe raised the question, and others dispute it. The collection note is deliberately neutral ("associated with Sheikh Farid Ji"). Should it stay neutral?
2. **Naming commentators in learner text.** Is it acceptable to name Prof. Sahib Singh, the Faridkot Teeka, Bhai Manmohan Singh and Sant Singh Khalsa in learner-facing notes, with paraphrase only?
3. **ਨਾਨਕ without a heading.** Saloks 32, 121 and 124 contain the name ਨਾਨਕ but have no Mahalla heading. They will be taught without assigning authorship from the name alone, and each will be flagged when drafted.

## Remaining work

There are 114 Saloks left: 17–130. They will follow in batches on this branch, starting with 17–32.
