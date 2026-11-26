# Practice space — design v0 (DRAFT, not approved, not built)

Status: DESIGN DRAFT by Claude (independent review seat). Not authorized, not
implemented, not reviewed by a qualified Gurbani reviewer. No part of this is
in the live family application.

Founder direction (26 Nov 2026), recorded verbatim in substance:
- "meditation, naam, is primary"
- breathing exercises matter because "they become an important part of society"
- the Yogi Bhajan / 3HO "Sikh yogic" synthesis is out: "that's not authentic"
- "Calm and head space: there are still Western interpretations. I want an
  authentic way to do things."
- "That would be a separate part where we're building the space to do simran,
  as well as we could have breathing exercises there as well."

## 1. What makes the existing apps inauthentic (form, not just content)

Calm and Headspace are not wrong because their content is Eastern-derived.
They are wrong for this purpose because of their FORM:

| Their form | Why it cannot carry Simran |
|---|---|
| A narrator interprets the practice for you | Sikh practice has no intermediary; the Shabad is the teacher |
| Timer is the unit of practice | Gurbani gives a TIME (Amrit Vela), not a duration |
| Streaks, counts, session history | Spiritual ranking; already barred by founder constraint |
| Proprietary ambient music engineered for effect | Not Gurbani; manufactures the state rather than pointing at it |
| Solo, headphones, individual | Sikh practice is communal (Sangat) |

So copying the Calm form and swapping in Gurbani audio would still be the
Western product. The form has to change.

## 2. Verified scriptural anchors

Verified against Shabad OS Database v5.0.0-next.0, asset SSA2, independently
of the application's own data.

- `ਅੰਮ੍ਰਿਤ ਵੇਲਾ ਸਚੁ ਨਾਉ; ਵਡਿਆਈ ਵੀਚਾਰੁ ॥` — Jap, Pauri 4, line 5.
  Establishes the WHEN of practice. 4 occurrences of Amrit Vela / Velai in SGGS.
- `ਸਾਸਿ ਸਾਸਿ; ਸਿਮਰਹੁ ਗੋਬਿੰਦ ॥` — Raag Gauree (Sukhmani). Establishes breath
  as the measure of remembrance.
- "with each breath" (ਸਾਸਿ ਸਾਸਿ / ਸਾਸ ਸਾਸ): **71 lines across 18 raags.**
  This is a recurring instruction of the Granth, not a single verse.

METHOD NOTE: the first query for the Sukhmani line returned zero rows and was
nearly reported as unverified. The reference inserts a pause mark mid-line
(`ਸਾਸਿ ਸਾਸਿ; ਸਿਮਰਹੁ`). The search string was wrong, not the scripture.
Recorded because a silent false negative on a scripture query is exactly the
failure class this review exists to catch.

## 3. The structural distinction the whole design rests on

Three traditions treat the breath three different ways:

- **Pranayama (hatha yoga):** breath is the INSTRUMENT, manipulated to produce
  a state. Hatha Yoga Pradipika ch.2. Gurbani rejects this explicitly
  (SGGS 857, 1343). OUT.
- **Anapanasati (early Buddhist):** breath is the OBJECT of attention.
  MN 118, sixteen steps. Legitimate to study and compare; not our practice.
- **Gurmat:** breath is the METRONOME. Naam is the content; the breath only
  measures it. `ਸਾਸਿ ਸਾਸਿ ਸਿਮਰਹੁ ਗੋਬਿੰਦ`.

Design consequence: in the Simran space the breath is never the thing attended
to and never manipulated. It paces Naam. Nothing else.

## 4. The space — four parts

### A. Simran (primary)
- Opens into near-silence. No menu, no narrator, no music.
- One verified line in Gurmukhi, or Waheguru alone. Drawn from the verified
  71-line set once a qualified reviewer has approved the subset.
- Optional quiet visual pacer at a rate the user sets. It instructs nothing.
  Labelled plainly as a tool.
- No timer displayed. Optional single soft bell at an end time chosen BEFORE
  starting, so the user is not watching a clock.
- Nothing counted. No streak, no history, no session log, no sync.
- Optional private note afterwards, on-device only, same storage rules as the
  reader.

### B. Amrit Vela (offered, never enforced)
- User may set an hour. The app is simply ready then.
- No guilt mechanics: no "you missed it", no streak break, no reminder nagging.
- The Japji Pauri 4 line shown once with its reference, as the reason the hour
  exists.

### C. Breathing exercise (separate room, physiology only)
- A plain slow-paced breathing pacer, approximately six breaths per minute.
- Presented as physiology with its evidence, in ordinary language. No spiritual
  framing of any kind.
- Evidence base (for the lesson text, to be reviewed):
  - Breathing near 0.1 Hz (~6/min) produces baroreflex resonance and maximal
    heart rate variability. PMC6753868.
  - Meta-analysis in nonclinical populations: immediate reduction in systolic
    blood pressure, increase in time-domain HRV. Springer s12671-023-02294-2.
  - 6/min breathing increases baroreflex sensitivity and reduces sympathetic
    activity in essential hypertension. PMID 16129818.
  - Resonance-frequency breathing and HRV/BP/mood. PMID 28890890.
- HARD RULES for this room:
  - Never framed as a route to Naam or as preparation for Simran.
  - The research is NEVER presented as validating a teaching of Gurbani.
    (Founder constraint: "Scientific research does not establish the truth of
    a theological teaching. Keep the layers separate.")
  - Carries a plain line that it is not treatment and does not replace care.
  - No breath retention (kumbhak) of any kind. Retention is the pranayama
    technique Gurbani names and rejects, and it is the one with real physical
    risk in untrained users.

### D. Sangat mode
- Two or more family members practising at the same hour or in the same room.
- Nothing shared but the fact of presence. No scores, no comparison, no
  visibility into anyone's notes.
- This is the one thing the existing apps structurally cannot do.

## 5. The temptation to bar explicitly

A slow natural `ਸਾਸਿ ਸਾਸਿ` pace and the ~6 breaths/minute resonance figure fall
in the same physiological range. This WILL tempt someone to write "science
confirms what the Guru said." That claim must not appear. The coincidence of
rate is not evidence for a theological teaching, and writing it that way would
subordinate Gurbani to physiology — the exact failure the layer separation
exists to prevent.

## 6. Audio: version one is silent, on purpose

A Simran space wants recitation. Standing constraints:
- No AI-generated or voice-cloned Gurbani recitation.
- No unlicensed recordings; public availability is not permission.
- Never invent timing data or reuse one recording's timings for another.

We hold no rights-cleared recordings. Therefore v1 ships silent. This is not a
compromise: silence is the authentic default for Simran, and it keeps the
project out of a rights hole. Audio enters only after a drafted permission
request is actually granted by a custodian, by founder act.

## 7. What this needs before it is built

1. A qualified Gurbani reviewer on the design itself — in particular whether a
   visual breath pacer beside Naam is acceptable at all, or whether it is the
   thin end of the practice Gurbani rejects. I cannot answer that; it is a
   theological question, not an engineering one.
2. Approval of a subset of the 71 verified lines for the Simran space.
3. Independent review of the breathing-room lesson text against its sources.
4. Founder decision on Sangat mode, which is the only part touching more than
   one person's device.

Open question for the founder: nothing blocking. The ten-minute iPhone check
remains the single founder act outstanding.
