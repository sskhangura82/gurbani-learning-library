# Guru history — research brief for a possible teaching layer

Author: **Claude.** Date: 2026-11-27. Commissioned by the founder.

> **STATUS: THIS IS MY OWN AUTHORED WORK, NOT AN INDEPENDENT REVIEW.**
> I cannot review it as independent. **ChatGPT must review it before any of it becomes
> app content.** Same rule that applies to my drafts in #44 and #46.
>
> It is a *research brief*, not finished content. Nothing here is app-ready text.

---

## Summary: the research produced a problem, not a fact sheet

I expected to collect dates and biographies. What the sources actually show is that
**mainstream published dates for the Gurus disagree with each other systematically**, in
three diagnosable ways. That finding matters more than any individual date, because it
decides how the layer must be built.

This is the same class of problem as the project's whole source-authentication thesis. A
history layer that renders a single unqualified date per Guru would be the scripture
lineage problem (RT-005) repeated in a new surface.

---

## Finding 1 — The dates are unreliable in three distinct, separable ways

### (a) Calendar conversion: Bikrami ↔ Julian ↔ Gregorian

The founding of the Khalsa, one of the best-attested events in Sikh history, appears in
reputable sources as **all three** of:

| Date given | Source |
|---|---|
| 30 March 1699 | Britannica; SikhRI |
| 13 April 1699 | Wikipedia infobox; New World Encyclopedia |
| 14 April 1699 | SikhiWiki |

Britannica states both at once: instituted **30 March 1699**, while *"Khalsa Sikhs
celebrate the birth of the order on April 13 of each year."* One source has crowds
gathering from 30 March with the founding on 13 April. These are not contradictions about
what happened; they are the Bikrami/Julian/Gregorian conversion showing through.

### (b) Observance date presented as event date

Guru Tegh Bahadur's death is given as **11 November 1675** (Wikipedia infobox, Google Arts
& Culture) and as **24 November 1675** (other Wikipedia revisions, widely elsewhere).

The reconciliation is in the sources themselves: 24 November is the **Shaheedi Divas
observance date under the Nanakshahi calendar released by the SGPC in 2003**, not a claim
about the day he died. Sources that list it as the date of death have conflated the
commemoration with the event.

His **birth** is given as **1 April 1621** and **21 April 1621** — both on Wikipedia. His
guruship start appears as **1664** (Britannica) and **1665** (Google Arts & Culture).

### (c) Genuine, live scholarly and community dispute

Guru Nanak's birth month is **actively contested**, not merely uncertain:

- The **earliest** sources give **Vaisakh** (around April). Bhai Gurdas, Vaar 1 Pauree 27,
  gives 1 Vaisakh; five of the six janamsakhi accounts give Vaisakh.
- The **observed** date is **Katak Puranmashi** (around November), which later janamsakhis
  give and which the community has kept for centuries.
- One argument offered for Vaisakh is arithmetical: the traditional lifespan of 70 years,
  5 months and 7 days is said to reconcile with Vaisakh and not with Katak.
- The dispute is **current**. The SGPC adopted the Nanakshahi calendar in 2003 and amended
  it in 2010; the amendment reopened the row, Guru Gobind Singh's birth anniversary has
  been celebrated on different days by different bodies, and the argument was still being
  published in **May 2026**.

One scholar quoted in the press puts the tension plainly: historians should keep
researching *but not reject the traditions*.

**This is not ours to settle.** The app has no business adjudicating it, and the standing
evenhandedness obligation applies directly.

### Design consequence

**No date should render without its calendar and its basis.** Concretely: a date field
needs a companion `calendar` (Gregorian / Julian / Bikrami / Nanakshahi) and `basis`
(what source says so), and where sources genuinely diverge the app shows the divergence
rather than choosing. This is **ANG-01's principle applied to dates** — the project
already refuses to assert an Ang without its basis, and the same reasoning applies here
with more force, because here the sources actually conflict.

---

## Finding 2 — The scripture contribution map, computed from our own pinned data

I did not take these numbers from any website. I computed them from the pinned Shabad OS
reference database the project already uses, so they are checkable and consistent with the
app's own text.

**Guru Granth Sahib as recorded in this edition: 5,549 line-groups, 60,555 lines,
35 distinct authors.**

| Guru | Mahalla | line-groups | lines | share |
|---|---|---|---|---|
| Guru Arjan | 5 | 2,374 | 24,887 | **41.1%** |
| Guru Nanak | 1 | 793 | 12,181 | 20.1% |
| Guru Amardas | 3 | 749 | 9,999 | 16.5% |
| Guru Ramdas | 4 | 610 | 6,560 | 10.8% |
| Guru Tegh Bahadur | 9 | 116 | 591 | 1.0% |
| Guru Angad | 2 | 63 | 295 | 0.5% |

Largest non-Guru contributors: Bhagat Kabir (472 groups / 3,385 lines), Bhagat Namdev
(60 / 751), Bhagat Ravidas (38 / 462), Sheikh Farid (121 / 318), Bhatt Kalh Sahar (53 / 283).

### This settles the "six, seven or eight Gurus" question *for this edition*

Published sources say the SGGS carries *"6 gurus, possibly as many as 7 or 8"*, with a
Salok Mahalla 7 and a Dohra Mahalla 10 attributed by some to the seventh and tenth Gurus.

In **this edition**, measurably:

- **six** Gurus are attributed in the SGGS;
- **Guru Gobind Singh has zero lines in the SGGS** — his 5,470 line-groups / 67,758 lines
  sit in the Dasam Granth, plus 4 groups in Sarabloh Granth;
- **Guru Har Rai has no author record at all.**

So the "seven or eight" claims rest on attributions **this edition does not make**. The
honest statement for the app is exactly that — what the edition does and does not
attribute — without adjudicating the wider dispute.

### Caveat that must travel with these numbers

This is **one lineage**, not an independent establishment. Per RT-005 and the builder's own
receipt, Shabad OS traces upstream to SGPC Shabadaarth, and the portal and its archive are
one publisher rather than two witnesses. Printed-source collation remains outstanding and
is not closable by review. These counts are therefore *"as recorded in this edition,"*
never *"the number of hymns in the Guru Granth Sahib."*

### It also confirms the app's existing readers

Guru Tegh Bahadur's material in this edition spans **15 raags plus "Salok Ninth Mehl,"
which has exactly 57 line-groups / 117 lines** — the app's existing Salok Mahalla 9 reader.
Bhagat Kabir's 472 groups correspond to the Salok Kabir reader. The history layer and the
existing readers line up without new data.

---

## Finding 3 — The signature convention, which is the answer to SIG-01

**Every Guru who contributed to the SGGS signed as "Nanak."** Successors are identified not
by a different signature but by the **Mahalla number**: Mahalla 1 is Guru Nanak, Mahalla 2
is Guru Angad, and so on. The doctrinal basis is the unity of Guruship — the same light in
each — expressed in Guru Nanak's own image of one lamp lighting another.

**This is the direct explanation of SIG-01.** My finding there was that searching ਨਾਨਕ
returns a Guru Nanak passage *because its author is Guru Nanak*, while omitting
`pauri007.salok02.line07` — a **Guru Angad** composition in which the word ਨਾਨਕੁ literally
appears.

The search engine cannot distinguish signature from authorship. **A history layer that
teaches the signature convention and the Mahalla numbering is the pedagogical complement
to that defect** — and arguably the more durable fix, since it teaches the reader to read
the Mahalla number rather than relying on the index to disambiguate for them.

This is the strongest reason to build the layer at all, and it is a reason that comes from
the app's own measured behaviour rather than from a content wishlist.

---

## Finding 4 — Evidential tiers: the janamsakhi problem

The main narrative sources for Guru Nanak's life are the **janamsakhis**, and their status
is the single most important thing for this layer to get right.

What the scholarship says:

- They are **hagiographies**, considered by scholars **semi-legendary biographies**, built
  on oral tradition mixing historical fact, homily and legend.
- The first were composed **50 to 80 years after Guru Nanak's death**; the earliest dated
  surviving manuscript is **1588**; the genre runs from the late 16th to the 19th century.
- Four traditions survive: **Bala, Miharban, Adi, Puratan**. The Puratan (1588) was the
  most widely circulated account for two centuries.
- Critics identify **anachronisms, hagiographic enlargement and redactional layering**.
- One academic assessment: *not* reliable historical sources for Guru Nanak's life, but
  genuinely valuable evidence for the period in which they were written.
- The debate is **live**: W. H. McLeod's *Guru Nanak and the Sikh Religion* (1968) set the
  skeptical frame; later scholarship (e.g. Mann in the *Journal of Punjab Studies*)
  challenges McLeod's claim that little historical information survives.
- They have been and are **broadly believed within the community** as true biography, and
  are recited at gatherings and festivals.

### Design consequence: three tiers, labelled, never flattened

1. **Documented** — attested in contemporary or near-contemporary record, or computable
   from the edition itself (the contribution map above).
2. **Contested** — reputable sources genuinely disagree (every date in Finding 1).
   Show the disagreement and its basis.
3. **Later tradition** — janamsakhi and hagiographic material. May be *described as
   tradition*, with its tradition and approximate date named. **Never recounted as fact.**

The project already has the right pattern for tier 3, and it was written voluntarily: the
Explore lesson's `caution` field says *"The Sri Chand authorship/encounter story is a later
tradition…"*. That sentence is the model. Tier 3 content should read like that or not ship.

---

## Finding 5 — The martyrdoms are sacred *and* presently politically contested

Both are central to Sikh history and both need unusual care, for a reason that is not
primarily theological.

**Guru Arjan, 1606.** Executed under Jahangir. Published accounts note that the record and
tradition are **unclear whether he was executed by drowning or died under torture**. He
appointed Guru Hargobind before leaving for Lahore. Competing explanations in the
literature include his meeting with the rebel prince Khusrau, a Mughal official's personal
grievance, and his brother Prithi Chand.

**Guru Tegh Bahadur, 1675.** Beheaded in Delhi under Aurangzeb; Gurdwara Sis Ganj Sahib
marks the execution site and Rakab Ganj Sahib the cremation.

The **source traditions compete, and they are not neutral**:

- the roughly contemporary **Bachittar Natak** (his son's memoir, late 1680s);
- **Siyar-ul-Mutakhkherin** (c. 1782), a hostile account attributing Aurangzeb's action to
  the Guru's alleged oppression of subjects;
- official Mughal records emphasising that he moved with several thousand followers;
- and a documented **colonial historiography** that shaped how the martyrdoms were framed.

Further: the **350th martyrdom anniversary is being commemorated right now**, by Union and
state governments and by political organisations. The framing of these events is live
political territory in present-day South Asia.

### Design consequence

State what is documented. **Attribute each narrative to its named source and date.** Where
the mechanism is genuinely unknown — as with Guru Arjan — say so. Adopt **no** political
framing, including the common framing of whose religious freedom was being defended, which
is precisely the contested part. This is where the project's evenhandedness obligation
bites hardest, and where an AI-written paragraph could do real harm while sounding devout.

---

## The succession, with its caveats attached

Reign dates per Britannica, which gives a clean internally-consistent set. **Every one of
these should carry Finding 1's caveats** — they are Gregorian-converted and some are
disputed by a year.

| # | Guru | Guruship (Britannica) |
|---|---|---|
| 1 | Nanak | to 1539 |
| 2 | Angad | 1539–52 |
| 3 | Amar Das | 1552–74 |
| 4 | Ram Das | 1574–81 |
| 5 | Arjan | 1581–1606 |
| 6 | Hargobind | 1606–44 |
| 7 | Har Rai | 1644–61 |
| 8 | Har Krishen | 1661–64 (died of smallpox, aged eight) |
| 9 | Tegh Bahadur | 1664–75 |
| 10 | Gobind Rai / Gobind Singh | 1675–1708 |

Documented structural facts, each sourced:

- Guru Nanak **established the practice of naming a successor** before his death; from Guru
  Ram Das onward the Gurus came from one family. The succession at Khadur was **disputed by
  Guru Nanak's biological heirs** — a documented dispute, not a smooth handover.
- The **book of compositions was passed at succession**: Guru Angad received Guru Nanak's,
  and passed it on with his own added.
- **Guru Arjan compiled the Adi Granth (1604)**, is the largest contributor, and composed
  Sukhmani Sahib; Ramsar in Amritsar is named as the compilation site and Harmandir Sahib
  as the first installation.
- **Guru Hargobind** militarised the community after Guru Arjan's execution and introduced
  the **Miri-Piri** principle of joined temporal and spiritual authority, symbolised by two
  swords.
- **Guru Har Rai** was summoned to Delhi by Aurangzeb over his role in the succession war;
  he had favoured Dara Shikoh.
- **Guru Gobind Singh** instituted the **Khalsa** in 1699 at Anandpur (date per Finding 1a),
  took Amrit from the five he had initiated, and introduced the Five Ks.
- Before his death in **1708** he **ended the line of personal Gurus**, vesting religious
  authority in the Guru Granth Sahib and temporal authority in the panth. He added Guru
  Tegh Bahadur's hymns to the Granth.
- The term **khalsa predates 1699** — it appears in hukamnamas from Guru Hargobind's and
  Guru Tegh Bahadur's guruship, and in Bhagat Kabir's work. Worth noting because it
  corrects a common simplification.

---

## Proposed modelling in the existing architecture

Not a patch and not a spec — a shape, for ChatGPT to accept, reject or rebuild.

- **`contentKind: editorial`**, never `scripture`. This layer is *about* the Gurus; it is
  not their word. The existing three-way classifier already handles this.
- A per-Guru record carrying: name; Mahalla number where applicable; guruship period
  **with `calendar` and `basis` per date**; contribution figures **computed from the pinned
  edition, labelled as that edition**; documented institutional facts each with a source;
  and a **separate `laterTradition` array that the renderer never presents as fact**.
- `reviewStatus: AWAITING_QUALIFIED_REVIEW` and `semanticReviewed: false`, matching
  `articles/catalog.json`. The founder has ruled that qualified review is **not a release
  gate**; the labels stay because they are **true**, and because shipping labelled drafts
  is what satisfies *"do not present AI-generated explanations as the authoritative voice of
  the Guru"* by labelling rather than by waiting.
- **No Ang asserted without its basis** (ANG-01).
- Source-linked throughout, like the article engine: a claim with no source does not render.
- **EXP-01 applies**: if this layer renders any Gurmukhi, it must verify digests first.
  `explore/app.js` currently does not, and that gap should not be propagated into a new
  surface.

---

## What must never be asserted in this layer

Restating the standing constraints that bear on it, because this is the surface where they
are easiest to break while sounding reverent:

- **No invented dialogue, thoughts, eyewitness scenes, encounters or historical details.**
  Hagiographic narrative is exactly the register that invites this.
- **No AI-generated depictions of the Gurus or of Sri Guru Granth Sahib Ji**, no synthetic
  Guru voices, no invented sacred historical images. Note that even the well-known group
  portraits of the ten Gurus are described in catalogues as *imaginary portraits*.
- **No contested date presented as settled.**
- **No political framing** of the martyrdoms.
- **No copyrighted modern translations or commentary.** Our own text comes from the pinned
  edition; narrative claims get citations, not quotations.
- **No imitation of another tradition's theology**, and no treatment of similarity across
  traditions as identity of teaching — the pattern the Explore `caution` field already sets.

---

## What I did not do, stated rather than implied

- **No printed-edition verification.** Everything scriptural here comes from the one pinned
  digital lineage.
- **No Punjabi-language scholarship consulted.** The dispute literature named in the
  sources — Karam Singh's *Kattak ki Vaisakh*, Giani Ishar Singh Naara's reply, Asa Singh
  Ghuman's *Katak Kay Visakh? Kay Dovain?* — is Punjabi and I have not read any of it. For
  a question this contested that is a real limit, not a formality.
- **No per-Guru biographical narrative written.** Deliberately. That is where invention risk
  concentrates, and it should be written against named sources per claim, not drafted from
  general knowledge and cited afterwards.
- **No qualified Sikh review.** Per the founder's ruling this is not a gate. It also does
  not make my historical claims authoritative, and two AI systems agreeing establishes
  nothing.
- **I have not reviewed this independently and cannot.** ChatGPT must.

---

## Sources

Computed data: pinned Shabad OS reference database (`master.sqlite`, asset SSA2), queried
directly; see Finding 2 for the caveat on lineage.

Web sources consulted:

- Britannica, *Guru (Sikhism)* — https://www.britannica.com/topic/Guru-Sikhism
- Britannica, *Khalsa* — https://www.britannica.com/topic/Khalsa
- Wikipedia, *Writers of the Guru Granth Sahib* — https://en.wikipedia.org/wiki/Writers_of_the_Guru_Granth_Sahib
- Wikipedia, *Guru Granth Sahib* — https://en.wikipedia.org/wiki/Guru_Granth_Sahib
- Wikipedia, *Janamsakhis* — https://en.wikipedia.org/wiki/Janamsakhis
- Wikipedia, *Guru Tegh Bahadur* — https://en.wikipedia.org/wiki/Guru_Tegh_Bahadur
- Wikipedia, *Guru Arjan* — https://en.wikipedia.org/wiki/Arjan_Dev
- Wikipedia, *Khalsa* — https://en.wikipedia.org/wiki/Khalsa
- Wikipedia, *Nanakshahi calendar* — https://en.wikipedia.org/wiki/Nanakshahi_calendar
- Journal of Punjab Studies 17(1–2), Mann on McLeod and early Sikh history — https://punjab.global.ucsb.edu/sites/default/files/sitefiles/journals/volume17/JPS_17_nos_1-2_Mann.pdf
- McLeod, *Early Sikh Tradition: A Study of the Janam-Sakhis* — https://archive.org/items/EarlySikhTraditionAStudyOfTheJanamSakhis
- Columbia Academic Commons, thesis on the Puratan Janamsakhi — https://academiccommons.columbia.edu/doi/10.7916/D8N29WS3
- UBC Open Library, janamsakhi reliability and the Bhai Bala tradition — https://open.library.ubc.ca/
- Khalsa Chronicle on the Vaisakh/Kattak nativity debate — https://khalsachronicle.substack.com/p/vaisakhi-and-the-debate-about-the
- Asia Samachar, May 2026, on the ongoing calendar dispute — https://asiasamachar.com/2026/05/19/panthik-confusion-really/
- The Tribune, scholars divided over the birth month — https://m.tribuneindia.com/news/amritsar/scholars-divided-over-birth-month-of-guru-nanak-dev-172303
- The Tribune, on Guru Tegh Bahadur's 350th anniversary — https://www.tribuneindia.com/news/comment/the-guru-gave-his-all-for-freedom-of-faith
- Dawn, *History: Gurus and Kings* — https://www.dawn.com/news/1952562
- The Wire, on Guru Arjan's martyrdom and colonial historiography — https://thewire.in/history/guru-arjan-martyrdom-colonial-historiography
- Pluralism Project, Harvard — https://pluralism.org/the-khalsa
- Patheos, *Sikhism: Founders*, Rahuldeep Singh Gill — https://patheos.com/library/sikhism/origins/founders
- SikhRI on Vaisakhi and Miri-Piri — https://sikhri.org/vaisakhi_of_the_pure_and_sovereign

Tertiary and community sources are cited as what they are. Where a claim rests on a single
source I have said so in the text rather than presenting it as consensus.
