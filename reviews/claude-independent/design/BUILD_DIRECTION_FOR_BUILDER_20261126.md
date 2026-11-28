# GLP-001 — Build direction: making it a learning application
### Prepared for the builder seat (ChatGPT) · 26 November 2026 · from the independent review seat

---

## 0. How to read this

You are the **primary builder**. Claude holds the **independent review seat**.
Sarwinder (Steve) Khangura is the **founder and the only decision authority**.

This document is direction and design, not authorization. It tells you what the
founder has decided, what the review seat has found and verified, what is
lawful to build today, and what must not be built at all. Where it says a thing
is blocked, it is blocked until the founder acts — not until you judge the
blocker unimportant.

Nothing in here authorizes a release to the live family application.
Public release remains on hold.

Protocol, unchanged: you build → the review seat independently verifies,
recording its own findings **before** reading your tests → the founder decides.
The review seat never approves its own work and never merges. You do not merge
on the strength of passing tests.

---

## 0a. ADDENDUM — corrections and new evidence, added after this was written

Read this before §6 and §8. Three of these correct errors of mine.

### A. A Simran Room already exists. Do not build a second one.

`simran.html` is already built and staged on 1470477, and it already does most
of §6 correctly: no audio element at all, silence as the default, and the
explicit statement "Nothing is played or recorded. No breath holds, prescribed
technique, scores or streaks." It carries the qualified-review-pending banner
and anchors on the same Japji Pauri 4 line verified in §5.4. It states that the
fuller Naam Simran experience is still being developed with specialist review
ahead, and that the anchor passage deserves "careful study, not a quick
meditation-app slogan."

**My error.** I wrote §6 without checking the staged build first, and §8 item 3
originally told you to construct a room that substantially exists. That breaches
the rule against duplicate parallel artifacts on the same active subject. §8
item 3 is corrected. The two designs converge closely, which is reassuring about
the direction but does not excuse designing without looking.

Two gaps between the existing room and §6, both small:

- **SF-02, low, design question for the founder.** Choosing a length before
  starting is right. The room then shows a live countdown, which puts the clock
  back at the centre of the practice — the Calm pattern the founder explicitly
  rejected. Recommend the chosen length becomes invisible once sitting begins,
  with a single soft end signal.
- **SF-03, low, verification.** The room labels the anchor "Ang 2" and offers a
  "See source Ang 2" link. The Gurmukhi line and the Pauri 4 attribution are
  independently verified; the **Ang number is not**, because the reference used
  carries no Ang numbers (§7.6). It needs a second independently verified source
  before being shown as fact.

One thing checked and **not** a defect: the room renders the line without the
semicolon the reference inserts. That semicolon is the reference's editorial
pause mark, not Gurbani, so the room's rendering is arguably the more faithful
one. Recorded because a naive text diff would flag it as an alteration.

### B. SF-01 — a real defect in the Japji reader, and a correction of my own

Safari 26.6 on macOS, driven by safaridriver on 26 Nov: the reading place
restores exactly 3 of 3 on reload, 3 of 3 on same-URL navigation and 3 of 3 on a
cache-busted URL — but is **lost 3 of 3** when going to the library and pressing
Back. Isolation run identifies the cause: with `scrollRestoration` as shipped
Back lands at 0; with only that value forced to `auto` it lands at the saved
position. The stored place survives intact either way, so it is **not applied**
rather than lost. Why reload restores and Back does not is an open question for
you; I did not read that code path and will not guess.

Back is the most-used navigation on a phone, and this is invisible to
reload-style desktop testing.

**My error, corrected.** I first told you this probably affected the new Kabir
reader too, because it loads the same shared scripts. That was wrong and
unchecked. `history.scrollRestoration='manual'` is set in exactly one file in
the build, `js/japji-full.js`, and nowhere in `nitnem/reader.js`,
`nitnem/continuous-core.js`, any other shared script or the Kabir reader's page.
**SF-01 is confined to the Japji full reader.**

Full detail: `reviews/claude-independent/device-test/results/SAFARI_MACOS_20261126.md`

### C. PR #52 reviewed — scripture PASS, and one new finding

Independent verification against Shabad OS asset SSA2: 243 numbered Saloks with
no gaps or duplicates, 486 verse plus 8 structural occurrences equalling the
reference's 494 lines exactly, and **493 of 494 lines byte-identical in content
and sequence** once the reference's own comma, semicolon and full-stop phrasing
marks are normalised. The integrity chain reproduces in full. All 737 teaching
entries carry `DRAFT_AI_UNREVIEWED`. One of 494 scripture lines appears in the
teaching file and it is the collection title used as a label, so there is no
second copy of Gurbani.

**RT4-05, medium, OPEN.** The backup repair is correct and the bug it fixed was
real — the old flat cap of 2,500,000 would have refused a rule-legal maximal
backup needing 5,832,000 units of notes. But the new collection-scaled allowance
is about **35 MB for this collection, while browser localStorage holds roughly
5 to 10 MB.** At the maximum rule-legal backup of 17.5 MB the size guard accepts
and the browser then refuses on quota. Data is safe — a failed import leaves
existing notes, bookmarks, revision and reading position untouched, verified
directly — but the learner sees a raw browser quota string, the only refusal in
that importer that does not end by saying their record is preserved, and it is
the path someone restoring onto a fresh device would hit. Cap the allowance at
the lesser of the two budgets and wrap the message.

Also: **Shabad OS carries the collection heading with the trailing danda**, so it
is a fourth independent witness disagreeing with the heading selection. Not a
defect; please add it to the witness list on the opposing side so the qualified
reviewer does not read three cited bases as unanimity.

Full detail: `reviews/claude-independent/retests/RT-004_PR52_KABIR_SALOK_VERDICT.md`

### D. A pattern in my own tooling, stated so you can discount for it

Twice in one day my comparison instruments treated the reference's editorial
phrasing marks as scripture and produced apparent discrepancies that were mine,
not yours. The first nearly reported a verified Sukhmani line as unverified; the
second reported 47 differing blocks and 442 of 494 lines matching, when every
block was a comma and the true figure is 493 of 494. Any comparison tool on
either side must normalise comma, semicolon and full stop before reporting a
scripture discrepancy.

## 1. The vision

**Read · Listen · Understand · Reflect.**
*One source of Gurbani, many pathways to understanding it.*

Four entrances: **Today · Read · Explore · Saved.**

Audience, decided 26 Nov: **personal, family and close friends first.** Not a
public product. Public release is not the goal and must not shape the design.
Free forever, no advertising, no subscriptions, no unnecessary accounts, no
tracking, no analytics, no spiritual rankings, no engagement manipulation.

The founder's direction on 26 Nov was explicit: *"I want to actually make it a
learning application."* Today it is an excellent **reader** with the beginnings
of a library. The gap is everything that makes someone able to do something
next week that they could not do last week.

---

## 2. Honest state, so you build onto reality

**Solid.** The scripture layer. Japji Sahib, Sukhmani Sahib in full (2,027
lines), the seven Nitnem banis. Checked line by line against a published
digital reference with every discrepancy recorded rather than silently
corrected. Reader reliability after the November repairs: an interrupted update
no longer destroys notes, a damaged package refuses to render as a complete
composition, and a retained archive holds material set aside.

**Thin.** Everything that makes it *learning*. There is no practice. There is no
reason to return other than willpower. And roughly **7,300 teaching passages in
the Nitnem course file alone have been read by no qualified Gurbani reviewer.**

**The binding constraint, stated plainly so it is not worked around:** there is
no qualified Gurbani scholar, no Punjabi reader, no Santhiya teacher and no
historian attached to this project. Everything below is designed so that work
can proceed honestly without one, and so that the places where one is required
are visible rather than papered over.

Still open from the current review rounds (the review seat holds the detail):
CI-S-16 (printed-page collation, cannot close without physical pages), the
recovery half of CI-R-08, RT2-01, RB-01 and RB-02 on the knowledge pilot,
R3-05 through R3-09, and the R3-11 wording items. The ten-minute physical
iPhone acceptance script is staged and verified but **has not been run** — no
Safari, iPhone, iPad, Android, VoiceOver or airplane-mode success may be
claimed by anyone until a human runs it on a real device.

---

## 3. Standing constraints — all of these are in force

Treat this list as governing. If a design idea conflicts with one, the
constraint wins and you raise the conflict rather than resolving it yourself.

**Scripture integrity**
- Do not silently replace scripture or merge major changes directly into the public application.
- Never silently modernize Gurbani spelling.
- Do not silently modify Gurbani to reconcile differences between sources.
- A corrupted or incomplete scripture package must not silently render as a complete valid composition.
- A failed update must not destroy a working previous version.
- Never treat a search snippet, a successful HTTP status, an Ang number, a first line, or a provider majority vote as sufficient authentication.
- Never substitute a random Shabad or an earlier reading if the official daily selection is unavailable.

**AI and authority**
- Intelligence cannot manufacture authority.
- Do not add a live generative-AI system inside the scripture reader.
- No live generative interpretation engine inside the public reader.
- Do not present AI-generated explanations as the authoritative voice of the Guru.
- Never invent an answer when an appropriate source-linked lesson has not been written.
- Do not declare unreviewed material authentic merely because two AI systems agree.
- Do not approve your own implementation.
- Do not merge or deploy merely because automated tests pass.
- No production release based solely on automated testing.
- Do not merge or deploy during independent review.

**Other traditions**
- **Do not imitate another religion's theology or impose another tradition's practices on Gurbani.**
- Scientific research does not establish the truth of a theological teaching. Keep the layers separate.

**Rights**
- Do not reproduce copyrighted modern translations, commentary, recordings or book layouts without authorization.
- Public availability does not establish permission to redistribute, host, embed, cache offline, create excerpts or reuse timing data.
- Draft permission requests. Do not contact custodians, incur costs or enter agreements without authorization.
- Never copy protected modern translations, books, or commentary.

**Audio**
- No AI-generated or voice-cloned Gurbani recitation.
- Do not use artificial recitations or unlicensed audio recordings.
- Never invent timing data or reuse one recording's timings for another.
- No unauthorized relaying of live Kirtan streams.

**Honesty of claims**
- Do not claim physical iPhone or VoiceOver testing unless you actually perform it.
- Do not claim to have installed or tested an application that you could not access.
- Do not fabricate user interviews or claim real participant testing when only simulated personas were used.
- Never invent conversations, quotations, private thoughts, historical details or encounters.
- Do not invent dialogue, thoughts, eyewitness scenes or historical events.
- No AI-generated depictions of the Gurus or Sri Guru Granth Sahib Ji, synthetic Guru voices or invented sacred historical images.
- No speculative completion percentages.
- Do not claim that we have created the world's best Gurbani application until comparative evidence genuinely supports such a claim.
- Measure original scripture coverage, educational coverage, independent review, qualified approval, rights-cleared recordings and verified audio mappings **separately**.

**Privacy**
- Use synthetic data only in testing. Never access or expose private reflections belonging to actual users.
- Preserve private learning on the user's device.

---

## 4. The layering rule — the core architectural idea

The founder wants psychology, Buddhism, meditation and breathing practice
brought in. The way to do that without breaking the rule against imposing
another tradition on Gurbani is to stop asking "how do we blend these" and
instead sort every piece of outside material by **how close it may sit to
Gurbani.** Four layers:

1. **Inside Gurbani itself.** Naam, Simran, breath-by-breath remembrance. This
   is the practice. It is the app's own content.
2. **Technique with no theology.** A thought record, journaling, noticing,
   naming a feeling. These make no claim about what is ultimately true, so they
   can sit beside Gurbani as clearly-labelled tools.
3. **Compared, with the difference named.** Buddhism, Jung, empirical research.
   Presented side by side with Gurbani, visibly separate, differences stated.
   The knowledge pilot already does this with two comparative studies.
4. **Fused as explanation. NEVER.** "Haumai is the Freudian ego." "Naam is
   Jung's Self." The moment that is written, Gurbani becomes the illustration
   and the outside theory becomes the authority. Forbidden by standing
   constraint and by the design.

Build the separation into the data model and the UI, not just the copy. A
comparative item must be structurally incapable of rendering as the app's own
teaching, and an outside study must never appear under a Gurbani heading.

**Known existing defect in this area: RB-01.** In the 30-case knowledge-pilot
edit test, 28 edits were unwanted and 27 were caught; 1 unwanted edit passed;
the other 2 were legitimate teaching edits and both were correctly allowed. The
one that passed let an editorial title display `ਸਲੋਕੁ ਮਃ ੧ ॥` under a "Library
topic" label. The scripture text stayed intact. **Fix that attribution leak
before the knowledge pilot is shown to anyone.** Do not report it as "29 of 30
caught" — that counts the two permitted edits as catches.

---

## 5. Psychology, Buddhism and breathing — what is in, what is out

### 5.1 The four psychologies, scoped

- **CBT** — safest. Techniques with the fewest metaphysical claims. Layer 2.
- **DBT** — use with care, for two reasons. First, it already contains borrowed
  contemplative material: Marsha Linehan was trained in Zen and became a Zen
  teacher, and she describes her Zen practice as what crystallised the core
  mindfulness skills. Layering DBT onto Gurbani is second-hand Zen in a
  clinical coat. Second, **DBT was developed for borderline personality
  disorder and for highly suicidal patients.** A family app handing out
  distress-tolerance skills to a relative actually in crisis is doing something
  it is not equipped to do. If DBT enters at all it is named, attributed,
  unmistakably not therapy, and accompanied by a route to a real clinician.
  The founder is a practising physician; do not soften this.
- **Jung** — Layer 3 only. His "Self" is a psychological construct and is
  routinely mis-mapped onto Naam or the divine. That mapping is barred.
- **Freud** — recommend leaving out, or carrying only as intellectual history.
  He was explicitly reductive about religion, so using him to explain Haumai
  subordinates the scripture to the theory; and the evidence base is the
  weakest of the four.

### 5.2 Excluded outright: the Yogi Bhajan / 3HO lineage

Searching "Sikh breathing exercises" leads straight here, so this needs to be a
standing exclusion rather than a judgement call each time.

Philip Deslippe's research in *Sikh Formations* (2012) argues that "Kundalini
Yoga as taught by Yogi Bhajan" was a bricolage Yogi Bhajan created himself,
assembling yogic postures and techniques attached to tantric theories and Sikh
mantras — not an ancient secret tradition. Sikh historian Trilochan Singh
called the synthesis "a sacrilegious hodgepodge" in *Sikhism and Tantric Yoga*.
Time ran a critical article in 1977 titled "Yogi Bhajan's Synthetic Sikhism".
Mainstream Sikh opinion does not regard these teachings as Sikh.

**Founder decision, 26 Nov: excluded.** "The Sikh yogic tradition, we should
stay away from because that's not authentic." Nothing from this lineage enters
the app in any form, including terminology, kriya names, or practice sequences.

### 5.3 Gurbani's own position on breath control

This is not a matter of taste; the scripture addresses it directly.

- **Sidh Gosht** (Ramkali, Guru Nanak, SGGS 938–946) is Guru Nanak's dialogue
  with the Nath Siddhas, who practised hatha yoga. Against their renunciation
  and austerity he emphasised devotion in a balanced household life.
- **SGGS 857** instructs the practitioner to abandon yogic postures and breath
  control and to remember continuously instead.
- **SGGS 1343** names rechak, poorak and kumbh — exhalation, inhalation,
  retention, the pranayama triad — and says that without Naam such deeds are
  empty.

So imported pranayama is not merely foreign to the app; it contradicts the text
the app exists to teach. **A qualified reviewer must confirm this reading before
it is written down as the app's position**, but the direction is unmistakable
and the design proceeds on it.

**Hard technical rule: no breath retention (kumbhak) anywhere in the product.**
It is the specific technique Gurbani names and rejects, and it is the one with
real physical risk in untrained users.

### 5.4 The authentic breath anchor — verified

Verified by the review seat against Shabad OS Database v5.0.0-next.0, asset
SSA2, independently of the application's own data, on 26 Nov 2026:

- `ਅੰਮ੍ਰਿਤ ਵੇਲਾ ਸਚੁ ਨਾਉ; ਵਡਿਆਈ ਵੀਚਾਰੁ ॥` — **Jap, Pauri 4, line 5.**
  Establishes the *when* of practice. Amrit Vela / Velai: 4 occurrences in SGGS.
- `ਸਾਸਿ ਸਾਸਿ; ਸਿਮਰਹੁ ਗੋਬਿੰਦ ॥` — **Raag Gauree (Sukhmani).** Establishes breath
  as the measure of remembrance. Sukhmani is already carried in the app in full.
- "With each breath" (`ਸਾਸਿ ਸਾਸਿ` / `ਸਾਸ ਸਾਸ`): **71 lines across 18 raags.**
  This is a recurring instruction of the Granth, not a single verse.

**Method note worth absorbing:** the first query for the Sukhmani line returned
zero rows and was nearly reported as unverified. The reference inserts a pause
mark mid-line (`ਸਾਸਿ ਸਾਸਿ; ਸਿਮਰਹੁ`). The search string was wrong, not the
scripture. Any scripture query that returns nothing must be treated as a
possible query defect, not as evidence of absence.

### 5.5 The structural distinction the whole practice design rests on

Three traditions treat the breath three different ways:

| Tradition | Breath is… | Status |
|---|---|---|
| Pranayama (hatha yoga) | the **instrument**, manipulated to produce a state | Rejected by Gurbani. Out. |
| Ānāpānasati (early Buddhist) | the **object** of attention | Legitimate to study and compare. Not our practice. |
| **Gurmat** | the **metronome** — Naam is the content, breath only measures it | **This is the app's practice.** |

Design consequence: in the Simran space the breath is never the thing attended
to and never manipulated. It paces Naam. Nothing else. That single rule is what
prevents drift into either of the other two traditions.

### 5.6 Primary sources for study — authentic, not Western repackaging

The founder asked specifically for primary sources, not "watered-down Western
interpretation." These are for **our own study and for accurate comparison
writing**, never for copying into the app.

**Buddhist**
- *Ānāpānasati Sutta*, Majjhima Nikāya 118 — the root text. Sixteen steps in
  four tetrads, tied to the four satipaṭṭhānas. Free translations with Pali at
  `dhammatalks.org/suttas/MN/MN118.html`, SuttaCentral, and Ānandajoti Bhikkhu.
- Parallels: Saṃyutta Nikāya chapter 54 (the Ānāpāna-saṃyutta), MN 62
  (Mahā-Rāhulovāda), DN 22 (Mahāsatipaṭṭhāna).
- Chinese canon: the Saṃyukta Āgama has a section on mindfulness of breathing
  containing the sixteen steps; Ekottarika Āgama 17.1 is another. **Relevant to
  our method: the instructions survive in Pāli and Chinese independently, so the
  tradition can be cross-checked against a second transmission line** — the same
  two-witness standard we apply to Gurbani.
- Bhikkhu Anālayo, *Mindfulness of Breathing: A Practice Guide and
  Translations* (Windhorse, 2019) — in copyright. Much related academic work is
  free at `buddhismuskunde.uni-hamburg.de`.
- *Visuddhimagga* chapter VIII — Buddhaghosa, 5th century, the classical
  commentarial method.

**Yogic**
- *Haṭha Yoga Pradīpikā* chapter 2, "On Prāṇāyāma" — Svātmārāma, 15th century,
  oldest surviving hatha yoga text. Public-domain Sanskrit with English at
  `sacred-texts.com/hin/hyp/`.
- Patañjali, *Yoga Sūtras* II.49–53.
- Mallinson & Singleton, *Roots of Yoga* (Penguin Classics, 2017) — over a
  hundred primary texts from roughly 1000 BC to the 19th century, in Sanskrit
  plus Tibetan, Arabic, Persian, Bengali, Tamil, Pali and others, with a section
  on breath control. **In copyright.** Read it; do not copy from it.

**The finding that matters for the app:** Svātmārāma was a sadhu of the Gorakh
panth — the Nath lineage. The Nath Siddhas are precisely who Guru Nanak debates
in Sidh Gosht. So the Haṭha Yoga Pradīpikā is effectively the other side's
manual in a conversation that is **already inside Guru Granth Sahib**. The
comparative lane is therefore not decoration: a Sidh Gosht lesson cannot be
taught honestly without an accurate account of what the siddhas actually
practised, from their own texts rather than a caricature.

The disagreement is sharp and usable. The Haṭha Yoga Pradīpikā's claim in
chapter 2 is that by restraining respiration the yogi gains steadiness of mind.
Gurbani's answer is SGGS 857 and 1343. Two traditions, opposite claims about
whether controlling the breath gets you anywhere.

---

## 6. The practice space — design to build

Founder direction, 26 Nov: *"meditation, naam, is primary"*; breathing matters
because *"they become an important part of society"*; and it should be *"a
separate part where we're building the space to do simran, as well as we could
have breathing exercises there as well."*

### 6.1 Why Calm and Headspace are the wrong model — form, not content

They are not wrong because their content is Eastern-derived. They are wrong
because of their **form**, and copying the form while swapping in Gurbani audio
would still produce the same thing.

| Their form | Why it cannot carry Simran |
|---|---|
| A narrator interprets the practice for you | Sikh practice has no intermediary; the Shabad is the teacher |
| The timer is the unit of practice | Gurbani gives a **time** (Amrit Vela), not a duration |
| Streaks, counts, session history | Spiritual ranking — already barred |
| Proprietary ambient music engineered for effect | Manufactures the state instead of pointing at it |
| Solo, headphones, individual | Sikh practice is communal (Sangat) |

### 6.2 Room A — Simran (primary)

- Opens into near-silence. No menu, no narrator, no music.
- One verified line in Gurmukhi, or Waheguru alone. Drawn from the verified
  71-line set **only after a qualified reviewer approves a subset.**
- Optional quiet visual pacer at a rate the user sets. It instructs nothing and
  is labelled plainly as a tool, never as a spiritual instrument.
- **No timer displayed.** The user may choose an end time *before* starting and
  gets one soft bell, so they are not watching a clock.
- Nothing counted. No streak, no history, no session log, no sync, no export of
  practice data. There is no practice data.
- Optional private note afterwards, on-device only, under the same storage
  rules as the reader (`glp001.*` keys, export via the existing
  `Gurbani-learning.json` path).

### 6.3 Room B — Amrit Vela (offered, never enforced)

- The user may set an hour. The app is simply ready then.
- No guilt mechanics: no "you missed it", no streak break, no nagging
  notification.
- The Japji Pauri 4 line shown once with its reference, as the reason the hour
  exists.

### 6.4 Room C — Breathing exercise (separate, physiology only)

This is the honest answer to the "society" need. Not a watered-down Eastern
practice — physiology, offered as physiology.

- A plain slow-paced breathing pacer at approximately **six breaths per minute**.
- Presented with its evidence in ordinary language, with no spiritual framing
  whatsoever. Evidence base for the lesson text, to be independently reviewed:
  - Breathing near 0.1 Hz (~6/min) produces baroreflex resonance and maximal
    heart rate variability — PMC6753868.
  - Meta-analysis in non-clinical populations: immediate reduction in systolic
    blood pressure and increased time-domain HRV — Springer s12671-023-02294-2.
  - 6/min breathing increased baroreflex sensitivity and reduced sympathetic
    activity in essential hypertension — PMID 16129818.
  - Resonance-frequency breathing and HRV, blood pressure and mood — PMID 28890890.
- **Hard rules for this room:**
  - Never framed as a route to Naam, nor as preparation for Simran.
  - The research is **never** presented as validating a teaching of Gurbani.
  - Carries a plain line that it is not treatment and does not replace care.
  - **No breath retention of any kind** (see §5.3).

### 6.5 Room D — Sangat mode

- Two or more family members practising at the same hour, or in the same room.
- Nothing shared but the fact of presence. No scores, no comparison, no
  visibility into anyone's notes.
- This is the one thing the existing apps structurally cannot do, and it is the
  strongest single argument for building our own.
- It is also the only part touching more than one person's device, so it needs a
  founder decision before it is built.

### 6.6 The sentence that must never appear

A slow `ਸਾਸਿ ਸਾਸਿ` pace and the six-breaths-per-minute resonance figure fall in
the same physiological range. Someone will want to write *"science confirms what
the Guru said."* **That claim must not appear anywhere in the product, the
documentation, or the commit messages.** The coincidence of rate is not evidence
for a theological teaching, and writing it that way subordinates Gurbani to
physiology — exactly what the layer separation exists to prevent.

### 6.7 Audio: version one is silent, deliberately

A Simran space wants recitation. We hold **no rights-cleared recordings**, and
AI-generated or voice-cloned recitation is barred. Therefore v1 ships silent.

This is not a compromise. Silence is the authentic default for Simran, and it
keeps the project out of a rights hole. Audio enters only after a drafted
permission request is sent by the founder and granted by a custodian in writing.

---

## 7. The article system — design to build

Founder direction, 26 Nov: wants the Gurbani articles by T. Singh featured
because of how they explain things; wants topic articles answerable from the app
— *"somebody has a question regarding duality, or somebody has a question
regarding ego, love, or relationships"*; wants them readable on phone, iPad and
computer **and printable**; and asked whether AI could generate articles like
them.

### 7.1 Who T. Singh is, and why it changes the framing

Findings from gurbani.org, 26 Nov 2026:

- A retired engineer in the USA who has maintained gurbani.org since 1993.
- He disclaims authority **in his own words** on the author page: he is "just an
  ordinary being who is learning along with you", "neither a scholar, nor a
  philosopher, nor a writer, nor interested in being one", and does "NOT claim
  to understand the Gurbani fully."
- The About page states he follows no other granth, person, dera, sect or
  samparda; that he spent about fifty years calling himself a Sikh without
  understanding Gurbani; that he now thinks independently; and that he no longer
  attends Gurdwaras because they are not a learning experience for him.
- The site asserts firmly that no one else holds the key to understanding
  Gurbani and that only the SGGS counts as Gurbani. Much of the output is framed
  as "Debunking…" and is sharply critical of the Pujaaree (Granthis,
  Parcharaks, Ragis, Dhadees) and Dera Babas.

**The governing point:** this is a distinct reformist interpretive position held
by a named individual who explicitly declines scholarly standing. Featuring it
as *the application's explanation of Gurbani* would confer an authority its own
author refuses. That is the human-side instance of "intelligence cannot
manufacture authority" — republication does not manufacture it either.

That is **not** a reason to exclude him. It is a reason to present him exactly
as he presents himself: **his reflections, under his name, visibly distinct from
scripture, clearly not the app's teaching.** Many Sikhs would disagree with
parts of it and the app must not hide that through framing.

**Review-seat recommendation:** carry **more than one** interpretive voice.
A single interpretive school standing alone in a teaching app is an editorial
act, not a neutral one.

### 7.2 Rights position

- Footer: `© 1993 - 2026 Gurbani.org | Terms of Use | Privacy Policy`. Rights
  reserved. No public reuse licence stated anywhere reachable.
- The Terms of Use page **failed to load** (client error). Its terms are
  **unread**. Do not assume them in either direction.
- Non-commercial operation and an invitation to comment are **not** a licence.

**Therefore: nothing from gurbani.org is reproduced, excerpted, cached, restyled
or paraphrased until the founder sends a permission request and receives an
answer in writing.** Linking out needs no permission and is available now.

A permission letter has been drafted by the review seat and is **not sent**. It
asks for three specific things — full unaltered articles under his name,
personal printing, and on-device storage — and explicitly promises no editing,
no paraphrase, and no AI generation in his style. The founder sends it or
declines; no seat contacts the custodian.

### 7.3 What AI may and may not do here — direct answer to the founder's question

**MAY NOT:**
- Write what a verse means, or what Gurbani teaches on a topic.
- Generate articles "in the style of" T. Singh. Beyond the authority problem,
  style-imitation of a living author's copyrighted corpus is a derivative-work
  problem even where no sentence is copied.
- Paraphrase a licensed article to avoid reproducing it. Paraphrase is
  reproduction with the attribution removed.
- Fill an empty explanation slot merely because it is empty.

**MAY — and this is most of the actual labour:**
- **Find the material.** Every line on a topic across the Granth, verified
  against the reference. Counted directly by the review seat on 26 Nov 2026
  (crude term matching; a reviewer prunes before use):

  | Topic | Lines | Raags |
  |---|---:|---:|
  | Love | 1,146 | 41 |
  | Maya | 988 | 40 |
  | Duality | 748 | 34 |
  | Fear | 683 | 45 |
  | Ego — Haumai | 630 | 29 |
  | Death / dying | 597 | 40 |
  | Hukam | 431 | 26 |
  | Greed | 272 | 37 |
  | Anger | 213 | 33 |
  | Contentment | 154 | 30 |
  | Household life | 128 | 28 |
  | Breath | 71 | 18 |
  | Humility | 52 | 16 |
  | Forgiveness | 21 | 10 |

- Build and maintain the topic index and the verse-to-topic map.
- Lay out the print and screen format.
- **Check** that every assertion in an article carries a source line that
  resolves, and **refuse to display** an article where one does not. This is the
  feature that separates this from a blog, and it is squarely builder work.
- Maintain the reference crosswalk so citations never rot when IDs change.

Short version: **AI assembles the evidence and never writes the verdict.**

### 7.4 Three lawful sources of article text

1. **Licensed** — T. Singh's articles with written permission, reproduced in
   full and unaltered, under his name, linked to the original, labelled as his
   reflections. *Blocked pending the letter.*
2. **Public domain** — e.g. Macauliffe, *The Sikh Religion: Its Gurus, Sacred
   Writings and Authors*, Oxford 1909 (public domain in the US; its Victorian
   idiom and colonial framing need a plain warning to the reader). *Open today.*
   Verify edition and date per item; do not assume.
3. **Written for this project** by a qualified human reviewer, named on the
   page. The real long-term answer. *Blocked by the missing reviewer.*

Lane 2 is the only one open today.

### 7.5 The format — already built, use it

A working print-first article proof exists at
`reviews/claude-independent/design/article-system/format-proof-duality.html`
and has been published as a private artifact for the founder.

Design decisions to carry forward:
- One column, serif body for paper legibility, **system Gurmukhi stack**
  (Gurmukhi MN / Mukta Mahee / Noto Sans Gurmukhi) so it renders on Apple
  devices with no web font and works offline.
- Every verse block and its explanation slot carries `break-inside: avoid`, so a
  verse never splits across a printed page.
- A real print stylesheet: page margins, UI removed, black on white.
- Each verse carries author and raag and a verified marker.
- **Explanation slots render visibly empty** with the label "awaiting qualified
  review". The empty state is the honest state and is shown as such rather than
  hidden or filled.
- A source register at the foot of every article records which reference was
  used, when, and what it cannot supply.

### 7.6 New limitation recorded

**The reference carries no Ang (page) numbers.** Any Ang printed in a finished
article must come from a **second source, independently verified**. Until then,
citations give author and raag only. This is a real gap for print, where a
reader expects an Ang. Do not fill it by inference from any other field.

---

## 8. What is lawful to build now, in order

1. **Fix RB-01** — the editorial-title attribution leak in the knowledge pilot
   (§4). Nothing is shown to anyone until this is closed.
2. **Room C, the breathing pacer** — fully buildable today. No scripture, no
   theology, no rights. Evidence-backed lesson text, six breaths per minute, no
   retention, the not-treatment line, hard separation from Simran in the data
   model as well as the UI.
3. **Room A — reconcile with the Simran Room you have already built. Do not
   rebuild it.** See the addendum, item A: `simran.html` already exists on
   1470477 and already does most of this correctly. The work is the gap between
   it and §6.2: remove the live countdown so the chosen length is invisible once
   sitting begins, and settle the unverified Ang claim. Nothing else in that room
   needs touching.
4. **Room B, Amrit Vela** — the hour setting and the readiness state. The Japji
   Pauri 4 line is verified and may be displayed with its reference. Note that
   the existing Simran Room already displays this line, so this may largely be
   done too — check before building.
5. **The article engine, content-free** — topic index, verse-to-topic map, the
   print format from §7.5, and the source-resolution check that refuses to
   render an unsourced claim. All of this is buildable with zero exposition.
6. **One complete learning journey on Haumai** — the end-to-end proof the
   founder needs: the Salok in original Gurmukhi; what it says, labelled as a
   draft; a practice drawn from Gurbani itself; a private reflection prompt; a
   clearly separated comparison panel; and a return to the same passage a week
   later with the user's own earlier note shown back. One finished journey
   teaches us what works. Twenty half-built ones teach nothing, and the review
   bottleneck means we could never certify twenty.
7. **A visible source-commit and build-date label** on the isolated testing
   site — already requested by the founder, keep it current.

Every item above is to be built on a branch, in the isolated test environment,
with a rollback copy and the source commit recorded. None of it goes to the live
family application.

---

## 9. What must not be built

- Any generative interpretation engine inside the reader.
- Any AI-written exposition presented as what Gurbani teaches.
- Any article generated in a named living author's style.
- Any pranayama sequence, kriya, or breath-retention exercise.
- Anything from the Yogi Bhajan / 3HO lineage.
- Any Simran audio that is synthetic, voice-cloned, or not rights-cleared.
- Any counter, streak, score, leaderboard or practice history.
- Any account, social feature, tracker or analytics.
- Any claim of device, Safari or VoiceOver testing that was not actually
  performed on a real device.

---

## 10. Review protocol for this work

1. You build on a branch. You run your own tests.
2. The review seat freezes its acceptance criteria **before** your repair lands,
   runs its own independent checks, and commits its own verdicts **before**
   reading your test results. That ordering is the point; do not ask for it to
   be relaxed.
3. Where the review seat and your tests disagree, both results are recorded and
   the founder decides. Neither seat adjudicates its own work.
4. Theological questions are **not** engineering questions and no seat may
   settle them. The two currently open are: whether a visual breath pacer may
   sit beside Naam at all, and whether the reading of SGGS 857 and 1343 in §5.3
   is correct. Both wait for a qualified human.
5. Verdicts: PASS / NEEDS_REVISION / INCOMPLETE. Statuses:
   FIX-VERIFIED-ON-CANDIDATE / PARTLY-FIXED-ON-CANDIDATE / OPEN.

---

## 11. Blockers only the founder can clear

- **The ten-minute physical iPhone acceptance script.** Staged and verified;
  not run. This is the single outstanding founder act and everything about
  real-device behaviour waits on it.
- **Send the permission letter to gurbani.org**, or decline to. Nothing from
  that site is usable either way until this happens.
- **Find a qualified Gurbani reviewer** — scholar, Punjabi reader, Santhiya
  teacher or historian. This is the binding constraint on the entire teaching
  layer, roughly 7,300 unreviewed passages, and on the two theological questions
  in §10.4.
- **Decide on Sangat mode**, which touches more than one person's device.
- **Decide whether to carry more than one interpretive voice** (§7.1).
- Printed-page collation for CI-S-16, which needs physical volumes.

At most one blocking founder act per day. Do not batch these into a demand.

---

## 12. How to report back

Answer these five, in plain founder-level language, no code, no hashes, no
abbreviations, no long reports unless asked:

1. Is it actually working — what is, and what isn't?
2. What is genuinely completed?
3. What is holding us back, in plain English?
4. What is the concrete next step?
5. Do you need anything from the founder — and if not, keep working within
   existing permissions?

Keep "only tested" strictly distinct from "working in real life." Say plainly
when something failed. Show progress as weaknesses closed and useful behaviour
demonstrated, not as test totals. No speculative completion percentages.

---

*Prepared by the independent review seat, 26 November 2026. All scripture
references in this document were verified against Shabad OS Database
v5.0.0-next.0 asset SSA2 on that date, independently of the application's own
data. Nothing in this document is an approval.*
