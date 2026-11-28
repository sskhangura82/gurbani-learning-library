# Architecture review — Gurbani knowledge library, encyclopedia, lifelong learning

Founder order item 5. Ten dimensions, evaluated against what is **built**, not
what is planned. The founder's two guardrails are applied throughout:

- a literal word match is not a theological interpretation;
- shared digital ancestry is not independent textual verification.

## 0. The honest scale, before anything else

The full Sri Guru Granth Sahib Ji is **60,555 original lines across 1,430 Angs** —
I counted it from the pinned corpus's own per-Ang declarations rather than
repeating a figure.

| Layer | Lines | Share of SGGS |
|---|---|---|
| The three readers plus Nitnem | 3,809 | **6.29 %** |
| Salok Bhagat Kabir Ji | 494 | 0.82 % |
| Salok Mahalla 9 | 117 | 0.19 % |
| The knowledge pilot graph | **19** | **0.03 %** |
| **Qualified-approved, anywhere** | **0** | **0 %** |

The architecture is in much better shape than the content. Roughly 6 % of
scripture is carried, 0.03 % is in the knowledge graph, and **nothing has been
approved by a qualified person.** The pilot's own status line says so on screen:
*"three selected Saloks · two topic lessons. Qualified review pending; not the
full 1,430-Ang library."* That honesty is worth more than the coverage.

## 1. Canonical source identity — sound design, one lineage

The design is right: byte-pinned packages, per-line digests, a sequence digest, a
pinned upstream commit, and a policy object that states its own limit —
*"Digital witness comparison is not independent print collation or qualified
scholarly approval."*

**But the whole structure sits on one textual lineage.** Open Granth declares
`source: Shabad OS Database` in its Ang frontmatter, in all 1,430 files. So the
app's upstream and my review reference are the same tradition, and no digital
check anywhere in this project — mine included — is independent verification.

**The sharpest instance, and it needs a name change.** PR #52 reproduces Salok
Kabir "from fourteen pinned witnesses." I read the fetcher: it constrains
`w.ang >= 1364 && w.ang <= 1377` and `w.path === corpus/ang-${w.ang}.md`, all at
commit `34d2a7c` of `opengranth/open-granth`.

So the fourteen witnesses are **Angs 1364–1377 of one repository at one commit** —
fourteen consecutive pages of one book, not fourteen independent traditions. The
per-file byte pinning is good engineering and I am not criticising it. The word
**witness** is the problem: in textual criticism it means an independent
manuscript tradition, and `sourceStatus:
SELECTED_DIGITAL_WITNESSES_WITH_DOCUMENTED_DIFFERENCES` can read to a
non-specialist as corroboration by fourteen sources. It is one source, fourteen
pages. **Recommend renaming to `sourceFiles` or `pinnedPages`** throughout.
Fourteen pages of one book is not fourteen witnesses, and the vocabulary should
not do work the evidence cannot.

Printed-page collation (CI-S-16) remains the only route to a second lineage.

## 2. Passage boundaries — the strongest part of the architecture

Verified in round 3b: logical IDs independent of a file row, heading IDs distinct
from verse IDs, edition locators separate, a complete legacy crosswalk, and
bindings that go stale when either side moves. R3-01 and R3-02 are properly
fixed.

The restraint is as good as the structure. The article engine carries the comment
*"Deliberately do not forward source Ang fields or infer a musical Raag. A
digital locator is not a separately collated printed-page reference"* — and the
code honours it. An Ang is never presented as an established locator. That is the
correct epistemic position built into the data flow rather than written in a
document.

## 3. Search — architecturally fine, least reviewed, one judgment baked into code

`search.mjs` indexes `title, pa, editorialTitle, editorialPa, aliases` plus a
static `lookupAliases` map. Normalisation is retrieval-only and never touches
stored text, which is the right rule and is stated in `identityPolicy`.

Two things to raise.

**It is unreviewed.** PR #49 has no frozen criteria and no verdict from me.

**It contains a theological judgment in code.** `lookupAliases` maps `ਨਾਨਕ` to
`author.guru-nanak` and `ਕਬੀਰ` to `author.bhagat-kabir`. But `ਨਾਨਕ` is the poetic
signature used by later Gurus throughout the text; the word appears in thousands
of lines not composed by Guru Nanak. So searching `ਨਾਨਕ` resolves to an author
node at score 100, labelled *"Exact name or indexed alias"*, when the word's
occurrence in a line is not evidence of that line's authorship.

This is guardrail 1 exactly: a literal word match being treated as an
attribution. The fix is not to remove the alias — it is useful — but to make the
result say which it is: *the author Guru Nanak* versus *lines containing the word
ਨਾਮ/ਨਾਨਕ*, as two distinct result kinds.

## 4. Authorship — honest at collection level, unresolved at line level

Attribution is carried as a collection-level label with the gap stated:
*"Collection attribution: Salok Bhagat Kabir Ji; individual attribution review
pending"*, and for Mahalla 9, *"attribution from the collection heading."* The
engine refuses to infer a Raag where none is assigned. Correct restraint.

Line-level authorship is genuinely hard and genuinely unresolved, and the
architecture does not pretend otherwise. It needs a qualified reviewer, not a
better algorithm. Keep it outstanding.

## 5. Vocabulary — bound to source, entirely draft

`word` nodes carry `senses`, each bound to real `occurrenceIds` with
`review: "AI_ASSISTED_DRAFT"`, and the UI appends *"Context-specific vocabulary
draft. Grammar and pronunciation review pending."* Structurally sound: a sense
cannot float free of the occurrence it claims to explain. Six words. Zero
qualified review.

## 6. Themes — the best thing in the architecture, because the guardrail is enforced in code

The #55 model is the right one, and it is not merely documented — it is
**structurally enforced**, which I verified at runtime in RT-010. A topic sheet
carries `selection.kind: "LITERAL_TOKEN"`, `semanticReviewed: false`, the
complete Salok, an empty labelled explanation slot, and on-screen text saying the
source-word match *does not establish what the passage teaches about this topic*.

Injecting an explanation sentence is refused (`ARTICLE_EXPOSITION`). Injecting a
teaching claim is refused. Raising the review status is refused
(`ARTICLE_LAYER`). Flipping `semanticReviewed` is refused (`ARTICLE_SELECTION`).

**That is guardrail 1 made unbypassable rather than promised.** It is the pattern
the rest of the platform should copy: every layer that could assert meaning
should be structurally incapable of asserting it until a qualified person
changes frozen code.

## 7. Daily Hukamnama — not built, and the pending piece is the risky one

The pilot records `dailyHukamnama: "PR43 distinct event references; identity
crosswalk pending"`. Nothing is built in the reviewed PRs.

The standing rule is that an unavailable official selection must **never** be
replaced by a random Shabad or an earlier reading. The pending identity crosswalk
is precisely where that rule gets broken by accident: a crosswalk that resolves a
missing or renamed selection to a nearby passage would substitute silently and
look like success. **This needs an explicit fail-closed design, reviewed before
it is built** — when the official selection cannot be resolved exactly, the
feature must show nothing and say why, in the same way the article engine already
refuses rather than degrades.

## 8. Learning pathways — right shape, pilot content

`course → orderedLessonIds → lesson`, each lesson carrying `simple`/`detailed`/
`deep` layers with `sourceBindings` and `sourcePassageIds`. One course, two
lessons, both `AI_ASSISTED_DRAFT`. The shape supports the Read / Understand /
Study depths; the content is a pilot. No architectural objection.

## 9. Authentic audio — correctly absent, with one thing to decide before it is built

Nothing is built, no rights are cleared, and there is no AI-generated recitation
anywhere. All correct.

The architectural point to settle **now, not later**: the standing rule is never
to invent timing data and never to reuse one recording's timings for another. If
timing is added later as a loose table keyed by line, reuse becomes the path of
least resistance the first time a second recording appears. Timings should be
modelled from the outset as belonging to a specific licensed recording — a
binding that cannot resolve without naming its recording — exactly as a teaching
entry cannot resolve without naming its source occurrence.

## 10. Sikh history — the only dimension with no containment model, and the highest fabrication risk

`gurdwara.html` and `gurdwaras.html` exist outside the knowledge graph. There is
no `historical_event` node type and no history content in the pilot.

History is the most dangerous content type this project will take on. The
standing rules already say: never invent dialogue, thoughts, eyewitness scenes or
historical events, and no AI-generated depictions of the Gurus or of Sri Guru
Granth Sahib Ji. Prose about history invites exactly those inventions, and unlike
scripture there is no digest to catch it.

**The good news is that the architecture has already invented the right pattern
and simply has not applied it here.** The `study` node is the template:

```
study.buddhist-conceit
  discipline : comparative religion
  citation   : Saṃyutta Nikāya 22.49, Soṇa
  reference  : https://suttacentral.net/sn22.49/en/bodhi
  review     : EDITORIAL_DRAFT
  rendered with: "Comparative study — not a literal Gurbani interpretation"
```

A required `citation`, a required `reference`, a `discipline`, a draft review
status, and an on-screen note that it is not Gurbani interpretation. History
should be a node type with the same mandatory fields, so an uncited historical
claim cannot load at all.

## 11. Cross-tradition containment — better than I had assumed, and a correction to my own finding

The pilot already carries outside material: a psychology study (Porter et al.,
*J Pers Assess* 2022) and a Buddhist reflection (Saṃyutta Nikāya 22.49), each
with `discipline`, `citation`, `reference` and `EDITORIAL_DRAFT`.

I expected to find this material rendering as though it were Gurbani, and to
report a breach of *"do not imitate another religion's theology."* **That is not
what the code does, and I am correcting myself.** `app.mjs` renders, for a study
node, the note *"Comparative study — not a literal Gurbani interpretation"*
together with the citation and a link to the source. In search results the
English title sits adjacent to the Punjabi, and `lang="pa"` is correctly applied
only to passage nodes. The containment is implemented.

The residual point is narrow and is RB-01, correctly scoped: `if(n.pa){...}` is
ungated, so a node's `pa` — including `ਬੁੱਧ ਧਰਮ ਵਿੱਚ ਮਾਨ ਦਾ ਵਿਚਾਰ` on the Buddhist
node — renders as unlabelled Gurmukhi in the Gurmukhi typeface, above the note
rather than carrying a label itself.

**A second correction.** In RT-008 I wrote that a node's `pa` "renders identically
to Gurbani." That was too strong. `.pa` and `.pankti` share the Gurmukhi font
family, but `.pankti` is centred at 1.5–2 rem while `.pa` is left-aligned at
1.15 rem. They are visually distinguishable. What `pa` lacks is a **label**, not a
distinct appearance. RB-01 is real, and narrower than I framed it twice.

## 12. What I would fix first, in order

1. **#51 reviewed** — the whole of Stack A stands on an unreviewed candidate.
2. **Hukamnama fail-closed design settled before it is built** — the one place a
   standing rule can be broken by a well-meaning crosswalk.
3. **Rename `witnesses`** to something true. Vocabulary that overstates the
   evidence is a correctness problem in a project whose first rule is fidelity.
4. **Split the search result kinds** — author versus word-occurrence — so a
   literal match cannot read as an attribution.
5. **RB-01 closed by labelling node `pa`**, which also closes the narrow
   cross-tradition residue.
6. **A history node type with mandatory citation**, defined before any history
   content is written.
7. **Timing bound to a named recording** in the data model, before any audio.

Items 2, 6 and 7 cost nothing today and get very expensive after content exists.

**No approval. No merge. Nothing here is a device result or a qualified review.**
