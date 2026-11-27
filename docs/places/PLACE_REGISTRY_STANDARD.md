# GLP-001 · Gurdwara place registry v2 · research-safe draft

**Data and validation only. This packet does NOT change the existing family site, reader, gurdwara arrival UI, media playback, photographs, or any Studio service.** Branch base: accepted R7 `254f3871b785b756208379138dcc17472a3733ff`.

The files `data/places/registry.json` and `data/places/evidence.json` hold three distinct real places: Sri Harmandir Sahib, Gurdwara Sahib Fremont, and Sikh Gurdwara Sahib San Jose. All claims are source-linked. English arrival copy remains **editorial draft**; Fremont and San Jose Gurmukhi names are **withheld pending Punjabi review**, not invented or automatically transliterated.

## Exact data contract

- Stable `placeId`, names with independent review states, location and a valid IANA timezone. This is a place's timezone, not permission to locate the user.
- Every English fact, name and arrival line has `evidenceIds`; `evidence.json` records the institution's HTTPS page, date checked, and a short exact quoted excerpt. The validator proves records bind; it cannot replace independent historical/cultural review.
- `routes` distinguish `linkStatus` from `liveStatus`; **all live statuses are `not_checked`**. Every route is an explicit user-initiated **outbound** link. No stream is embedded, played, or classified as active on the basis of local time.
- No photographs are included. An asset can enter only with an explicit license/permission record, author/attribution, public-use approval and separate founder cultural acceptance.
- `programme.schedule=null`: no published schedule guessed from a clock.
- Conflicts/ambiguous history remain records with `publicDisplay:false`; we do not quietly choose the friendlier story.
- Public publication, founder product acceptance and qualified place/Punjabi review remain **unset**. This does not promote R7 gurdwara views or drafts.

## Primary sources checked on 2026-10-24

| Evidence | Verified source | Relevant scope |
|---|---|---|
| H1/H2/H4 | [SGPC: Sri Harmandir Sahib](https://new.sgpc.net/sri-harmandir-sahib/) | Four entrances, 1604 installation, official kirtan link |
| H3 | [SGPC broadcast rights notice (July 2023)](https://sgpc.net/gurbani-broadcast-to-start-on-sgpcs-own-web-channel-on-july-24/) | SGPC reserves transmission rights: default outbound only |
| F1–F4 | [Fremont Gurdwara: history/visit](https://fremontgurdwara.org/gurdwara-new/) | Established in 1978, open daily, institution-linked radio/YouTube |
| S1/S2 | [San Jose Gurdwara: history](https://sanjosegurdwara.org/history.html) | Founded in 1984, Evergreen Hills and Gurdwara Avenue |
| S3 | [San Jose: transparency](https://sanjosegurdwara.org/transparency.html) | Operating in Santa Clara County since 1985 |
| S4 | [San Jose: financials](https://sanjosegurdwara.org/financials.html) | Uses Murillo Avenue on an official historical financial page |
| S5 | [San Jose: Audio Streaming](https://sanjosegurdwara.org/audioStreaming.html) | Official outbound audio directory; direct mobile link says TBD |

The source register quotes only short evidence fragments; factual summaries are newly authored. **We did not observe any stream being live or verify any particular broadcast schedule.**

## Unresolved conflicts preserved

1. **Fremont year:** its own site says established 1978; a secondary legacy directory reportedly lists a different year (1980). The latter source was *not* independently re-fetched and is excluded from facts and public display.
2. **San Jose 1984/1985:** official history says founded 1984; official transparency reports operations since 1985. These may denote distinct milestones. Do not announce a contradiction or erase either statement before place-history review.
3. **San Jose street:** official history/contact says 3636 Gurdwara Avenue; an older official financial page says 3636 Murillo Avenue. Current institutional contact is used in the draft registry; the reason for the naming difference is **not assumed**.

## Release and rights gates

- SGPC's broadcast-rights statement is a material permission issue. A reference link to the official SGPC page is okay; **embedding/relaying requires the institution's permission** and separate founder release authority.
- YouTube cannot be an invisible/background audio extraction source. Video embedding, when permitted, must remain visible and provider compliant, and is outside this packet.
- No licensed photo has been selected or attributed; generated lookalikes of a real Gurdwara are not acceptable.
- Any eventual Punjabi name, visitor guidance or place narrative requires its named reviewer.
- The intended future arrival is an optional still threshold with real place identity, not timed forced transitions.
- Shared reader-return `#occ=` logic belongs to the PR #11 reader owner; do not modify `js/japji-full.js` on this branch.

## Engineering and rollback

Run `node --test tests/places-registry.mjs`. The test includes source presence, privacy, the no-embed/no-autoplay rule, all statuses, unresolved claims, and deliberately malicious fixture mutations. Link reachability and provider availability must be checked separately in a network-enabled step; HTTP 200 does **not** indicate a live stream.

The packet is additive. Revert by removing `data/places/registry.json`, `data/places/evidence.json`, `tools/places/validate-registry.mjs`, `tests/places-registry.mjs` and this document. No live user behavior or saved learning changes.

Blueprint input: attached Claude GUR-R and GUR-D (2026-10-24). Neither blueprint is asserted to be a human place or religious review.
