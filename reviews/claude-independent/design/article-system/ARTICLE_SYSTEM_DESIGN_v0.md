# Topic article system — design v0 (DRAFT, not approved, not built)

Status: DESIGN DRAFT by Claude (independent review seat). Nothing here is in
the live family application. No permission has been requested or granted.

Founder direction (26 Nov 2026): wants the Gurbani articles by T. Singh
featured because of how they explain things; wants topic articles answerable
from the app ("duality... ego, love, or relationships"); wants them readable on
phone, iPad and computer AND printable; asked whether AI could generate
articles like them.

## 1. Who the author actually is — and why it changes the plan

Findings from gurbani.org, 26 Nov 2026:

- The author is "T. Singh", a retired engineer in the USA who has maintained
  gurbani.org since 1993.
- He disclaims authority in his own words on the author page: he is "just an
  ordinary being who is learning along with you", "neither a scholar, nor a
  philosopher, nor a writer, nor interested in being one", and does "NOT claim
  to understand the Gurbani fully".
- The About page states he follows no other granth, person, dera, sect or
  samparda; that he spent about 50 years calling himself a Sikh without
  understanding Gurbani; that he now thinks independently; and that he no
  longer attends Gurdwaras because they are not a learning experience for him.
- The site asserts firmly that no one else holds the key to understanding
  Gurbani and that only the SGGS counts as Gurbani. Much of the output is
  framed as "Debunking..." and is sharply critical of the Pujaaree (Granthis,
  Parcharaks, Ragis, Dhadees) and Dera Babas.

Consequence for the design, and this is the governing point:

This is a distinct reformist interpretive position, held by a named individual
who explicitly declines scholarly standing. Featuring it as the application's
explanation of Gurbani would confer an authority its own author refuses. That
is the human-side instance of the founder's standing principle, "Intelligence
cannot manufacture authority" — and republication does not manufacture it
either.

That is NOT a reason to exclude the material. It is a reason to present it
exactly as the author presents it: one named person's reflections, under his
name, visibly distinct from scripture, and not the app's teaching. Many Sikhs
would disagree with parts of it, and the app should not hide that by framing.

RECOMMENDATION: if a second and third exposition voice can be licensed or
written, carry more than one. A single interpretive school presented alone in a
teaching app is an editorial act, not a neutral one.

## 2. Rights position

- Footer: "© 1993 - 2026 Gurbani.org | Terms of Use | Privacy Policy". Rights
  reserved. No public reuse licence stated anywhere reachable.
- The Terms of Use page failed to load (client error). Its terms are UNREAD.
  Do not assume them in either direction.
- Non-commercial operation and an invitation to comment are not a licence.
- Founder constraint: "Public availability does not establish permission to
  redistribute, host, embed, cache offline, create excerpts or reuse timing
  data."

Therefore: nothing from gurbani.org is reproduced, excerpted, cached or
restyled until the founder sends a permission request and receives an answer in
writing. Linking out needs no permission and is available immediately.

Permission letter drafted at PERMISSION_REQUEST_DRAFT_gurbani_org.md. NOT SENT.
Assessment: a named, reachable, non-commercial individual who wants his
understanding shared is among the most likely yeses in this project. Worth
asking.

## 3. What AI may and may not do here

MAY NOT — any of these would breach a standing constraint:
- Write what a verse means, or what Gurbani teaches on a topic.
  ("Do not present AI-generated explanations as the authoritative voice of the
  Guru." / "Never invent an answer when an appropriate source-linked lesson has
  not been written.")
- Generate articles "in the style of" T. Singh. Beyond the authority problem,
  style-imitation of a living author's copyrighted corpus is a derivative-work
  problem even where no sentence is copied.
- Paraphrase a licensed article to avoid reproducing it. Paraphrase is
  reproduction with the attribution removed.
- Fill an empty explanation slot because a slot is empty.

MAY — and this is most of the actual labour:
- Find the material. Every line on a topic across the Granth, verified against
  the reference. Counted directly, 26 Nov 2026 (crude term matching; a reviewer
  prunes before use):

  | Topic             | Lines | Raags |
  |-------------------|------:|------:|
  | Love              |  1146 |    41 |
  | Maya              |   988 |    40 |
  | Duality           |   748 |    34 |
  | Fear              |   683 |    45 |
  | Ego / Haumai      |   630 |    29 |
  | Death / dying     |   597 |    40 |
  | Hukam             |   431 |    26 |
  | Greed             |   272 |    37 |
  | Anger             |   213 |    33 |
  | Contentment       |   154 |    30 |
  | Household life    |   128 |    28 |
  | Breath            |    71 |    18 |
  | Humility          |    52 |    16 |
  | Forgiveness       |    21 |    10 |

- Build and maintain the topic index and the verse-to-topic map.
- Lay out the print and screen format (done — see §5).
- CHECK every assertion in an article carries a source line that resolves, and
  refuse to display an article where one does not. This is the feature that
  separates this from a blog, and it is squarely AI work.
- Maintain the reference crosswalk so a citation never rots when IDs change.

Short version: AI assembles the evidence and never writes the verdict.

## 4. Three lawful sources of article text

1. LICENSED — T. Singh's articles with written permission, reproduced in full
   and unaltered, under his name, linked to the original, labelled as his
   reflections. Blocked pending the letter.
2. PUBLIC DOMAIN — e.g. Macauliffe, *The Sikh Religion: Its Gurus, Sacred
   Writings and Authors*, Oxford 1909 (public domain in the US; its
   Victorian idiom and colonial framing need a plain warning to the reader).
   Available now, no permission needed. Verify edition and date per item.
3. WRITTEN FOR THIS PROJECT by a qualified human reviewer, named on the page.
   The real long-term answer, and still blocked by the same bottleneck as
   everything else: we have no qualified Gurbani reviewer.

Lane 2 is the only one open today. Lane 1 needs one letter. Lane 3 needs a
person.

## 5. The format — built and published

Working proof: format-proof-duality.html (also published as a private artifact
for the founder to open on phone, iPad or computer and print).

Design decisions in it:
- One column, serif body for paper legibility, system Gurmukhi stack
  (Gurmukhi MN / Mukta Mahee / Noto Sans Gurmukhi) so it renders on Apple
  devices without a web font and works offline.
- Every verse block and its explanation slot is marked break-inside: avoid, so
  a verse never splits across a printed page.
- Print stylesheet: proper page margins, UI removed, black on white.
- Each verse carries author and raag and a verified marker.
- Explanation slots are rendered VISIBLY EMPTY with the label "awaiting
  qualified review". The empty state is the honest state and is shown as such.
- A source register at the foot of every article records which reference was
  used, when, and what it cannot supply.

Recorded limitation found while building: the reference carries no Ang (page)
numbers. Any Ang printed in a finished article must come from a second source
and be verified separately. Until then citations give author and raag only.
This is a real gap for a print article, where a reader expects an Ang.

## 6. What this needs before it is built

1. Founder sends the permission letter (or declines to).
2. A qualified Gurbani reviewer — to prune the topic line sets, and to write or
   approve exposition.
3. Decision on whether to carry more than one interpretive voice (§1
   recommendation).
4. A second reference that supplies Ang numbers, independently verified.

Nothing blocking today. The ten-minute iPhone check remains the single
outstanding founder act.
