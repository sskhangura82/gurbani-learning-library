# Corrections to the build order (PR #42) — scoped and in priority order

**Reviewer:** Claude. **Reviewed:** `docs/GLP_DAILY_HUKAMNAMA_AUDIO_BUILD_ORDER_20261125.md` at `16a4846`.
**Judgement:** a sound plan. These are additions, not a rewrite. Nothing here asks for a new feature.

## 1. One exit test per phase — each can fail (R2-P-01)

| Phase | The plan says | Exit test I propose |
|---|---|---|
| A. Existing repairs | finish #40, reconcile #39, review #41 | Every finding in RT-001 is marked fixed, partly fixed or open **by the reviewer who did not write the fix**, on a named commit. Zero findings without a status. |
| B. Daily pilot | one dated Shabad, three lesson levels as drafts | For one real date: the passage equals a pinned source in every occurrence; the event record holds what was retrieved, when and its digest; all three levels exist in English and Punjabi and cover every occurrence; a second reviewer has returned findings. Fails if any occurrence has no teaching or any teaching has no occurrence. |
| C. Shabad registry | permanent identity, lesson reuse | Two different dates that selected the same Shabad resolve to **one** Shabad record and **one** lesson. A source revision that changes one letter makes the lesson show "needs re-review" and does not silently keep it. Bookmarks made before the revision still open the right line. |
| D. Audio foundation | permissions first; synthetic fixtures | With synthetic material only: seek, pause, repeat-a-line and resume land on the right line in 100% of scripted cases; a recording whose checksum does not match is refused; timings made for recording A are refused for recording B. No real recording is present in the repository. |
| E. Daily publisher | adapters, approval, rollback | Run against **at least 14 consecutive real days** without publishing: for each day record what was retrieved, the decision and why. Fails if any day publishes with a mismatch, publishes yesterday's reading as today's, or cannot be rolled back. Fed a wrong Shabad, a cut-off passage, a missing Rahao, a conflicting second source and an unreachable source, it publishes nothing and says why. |
| F. Reminders | optional | A calendar reminder works with no account and no stored identifier. Nothing else ships without the owner's decision. |
| G. Release | devices, access | A named person records each device result. Emulation is listed separately and is never counted as a device. |

## 2. Who approves each day (R2-P-02) — owner decision, before phase E

A program that commits a new reading to `main` every morning is automatic public deployment. The owner has said no automatic deployment of drafts. The plan says "manual/independent editorial approval" without saying who or what happens when nobody does.

Three workable arrangements, safest first:

1. **Original only, automatic, after a machine check.** The Gurmukhi of the day is published by itself when, and only when, it equals a Shabad already in the reviewed registry in every occurrence and SGPC's page carries today's Amritsar date. No teaching is published this way. Anything else waits for a person. *This is my recommendation:* the scripture itself is not a draft, the check is exact, and the reader gets the day's Hukamnama without anyone being a bottleneck.
2. **A person approves every day.** Safest on paper; in practice some days will have no reading.
3. **Fully automatic including teaching.** Not compatible with the owner's rules. Listed only to rule it out.

Whichever is chosen: a day with no approval shows "not yet available" and the last confirmed reading **under its own date**.

## 3. Take the Gurmukhi and nothing else (R2-P-03)

SGPC's Mukhwak page also carries a Punjabi explanation and an English translation. They are modern works by other hands. The page's "© SGPC" and the absence of any terms do not give this project the right to reuse them, and the owner has ruled out copying modern translations.

- The adapter keeps an allow-list of fields: date stamp, place, heading, Gurmukhi passage, Ang, calendar line. Everything else is dropped before anything is stored.
- A test feeds it a page with the explanation and translation present and asserts neither appears anywhere in the output, the cache or the evidence record (store a digest of the retrieved Gurmukhi, not a copy of the page).

## 4. Risks the plan does not name (R2-P-04)

**Source behaviour**
1. **Three SGPC hosts** (`sgpc.net`, `hs.sgpc.net`, `old.sgpc.net`), some HTTP-only, with **undated file names that are overwritten daily** (`hukamnama.mp3`) beside dated ones. An undated address cannot be evidence for a date.
2. **The new day's reading appears hours after Amritsar midnight.** Observed: at about 05:40 on 26 November the official page still showed 25 November. The publisher must read the date printed on the page.
3. **Other readings on the same pages**: Sangrand Hukamnama, evening readings, special occasions. The event's identity must include which reading it is, and the adapter must refuse one it was not asked for.
4. **Older font encodings** (SikhNet's date line; SGPC's 2017 entry). A mapping table must be tested against known lines, and a character it cannot map is a hold, never a guess.
5. **Calendar fields shift from year to year** (14 October was 29 Assu in the 2025 record and 28 Assu on SGPC's 2026 banner). Copy what SGPC prints. Never compute it.
6. **SGPC corrects a day after publication.** The append-only log is planned; what the reader is told is not. Say "corrected on …" on the reading.

**Integrity**
7. **"Signed manifest": who holds the key, and where is the signature checked?** On a static site the expected values travel with the site. Be exact about what this protects against (accident and stale copies) and what it does not (someone with write access to the repository).
8. **Today's reading and the offline copy.** Daily files live outside the release cache by design. Offline reading of today's Hukamnama then needs its own small store, with each day's digest checked on every open and a clear rule for when a stored day is too old to call "today".
9. **The device clock.** "Future date" is decided from the device's clock. The pointer to today must carry its own date so a wrong clock cannot relabel a reading.

**People and load**
10. **Editorial load.** A three-level bilingual lesson for each new Shabad, with qualified review, cannot be produced daily. Plan the honest default — original today, "teaching in preparation" — and measure how often a day's Shabad already has a lesson.
11. **Rights are more than copyright.** Many named reciters have died. Each recording needs a named rights-holder and, separately, the consent of the family or institution that this is a fitting use.
12. **Catalogues of mixed origin.** A file on a large audio archive is not provenance. Identity of reciter, text edition and completeness must be established per recording before any request is drafted.
13. **Web push needs a server and a stored identifier per device.** That sits badly with "no accounts, no tracking". Keep it out unless the owner decides otherwise; the calendar reminder is enough.
14. **Outside links tell the other site the reader's address.** Label links that leave the library.
15. **Devices.** No phase says who owns the phones and tablets or records the results. Until someone does, every device line stays "not tested".

## 5. One sentence to tighten

> "Surface last confirmed date explicitly when available"

Add: *under its own date and never beneath a heading that says today.* The reader in #43 already behaves this way; the plan should say it.
