# RT-031 — #66 Haumai reading and private reflection mechanics: findings

Reviewer: Claude (independent). Date: 2026-11-27.
Criteria frozen at `a9ea8e0` **before** examination. Candidate head `ebc190509759`.
**Last candidate in the queue.**

> Written before opening builder test or evidence files. I then read their evidence report,
> which is noted where I rely on it.

## Verdict: PASS, 13 of 13 hard criteria. My falsifier fired. The queue closes.

I committed in advance that I would not create, read or inspect any real reflection. **I did
not.** Nothing I ran touched stored notes; the checks below are static and structural.

## C1 — a reflection cannot leave the device

This is the criterion that mattered most, and it holds **structurally**, not by policy:

- The three new modules (`journey.mjs`, `learning.mjs`, `json.mjs`) contain **zero** network
  calls — no `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket` or `EventSource`.
- The served bundle (`knowledge/app.bundle.mjs`, 1409 lines) contains exactly **two** network
  operations, both same-origin **GET**s of static data:
  `fetch("./scripture.json", {credentials:"same-origin", cache:"no-store"})` and the same for
  `./pilot.json`.
- **There is no `POST` and no request `body` anywhere in the bundle.** There is no mechanism
  by which reflection text could be transmitted.
- `localStorage` appears **once**, in the injectable `storageOf` seam. No `indexedDB`, no
  analytics, no `gtag`, no `dataLayer`.

The builder's own browser check asserts the same property in their words: *"private text never
sent over the network or put in a URL."* The URL half is a route I had not thought to specify.

## C3 / C4 — storage fails closed, and preserves the reader's words

`learning.mjs` returns named failures rather than silently succeeding or discarding:

- `STORAGE_UNAVAILABLE` — *"Private notes are unavailable in this browser."*
- `STORAGE_REFUSED` — *"The browser could not save this learning record. Keep or export your
  unsaved text before…"*

That second message is the right instinct: on failure it tells the reader to preserve their
own words rather than pretending the save worked. `storageOf` and `locksOf` are wrapped in
try/catch returning `null`, which routes to those failures instead of throwing raw.

`LIMITS` caps records at 100, question at 4000 chars, reflection at 12000, store at 500000 —
bounded rather than unbounded.

**This closes the Web Locks dependency I raised in RT-025.** I had recorded that
`saveLearning` fails closed without `navigator.locks` and flagged it as a thing to check on
the phone. Their evidence now carries the check explicitly: *"missing Web Locks refuses save
and keeps unsaved text."* Refusing and keeping the text is the correct resolution — the
defect would have been refusing and losing it.

Their evidence also covers four data-loss paths I would have had to test by hand: quota
refusal preserving the store and the unsaved words; a stale two-tab edit preserving both
later versions; a delayed save unable to erase a newer draft; and a corrupted private record
preserved rather than reset on open or import. I did not run these; I verified the failure
paths exist in the code and record their evidence as theirs.

## C5 — the reading is digest-verified before anything renders

```
if (!crypto?.subtle) throw Error("Knowledge data unavailable");
const original = await fetch("./scripture.json", …);
if (!original.ok) throw Error("Knowledge source unavailable");
const sourceBytes = await original.arrayBuffer();
await verifyScripture(sourceBytes);
…
index = buildIndex(await loadKnowledge(sourceBytes, await teaching.arrayBuffer(), PACK_SHA256));
```

Fails closed without `crypto.subtle`; verifies the scripture digest **before** use; passes
`PACK_SHA256` into the loader; and only then builds the index and enables the search button.
Same posture as the Explore surface I tamper-tested in RT-030.

## C6 / C7 / C8 — it asks, and it does not answer

`journey.mjs` renders explanation slots as **empty, labelled placeholders**:

```
slot.dataset.reviewStatus = "AWAITING_QUALIFIED_REVIEW"
```

So an unwritten lesson renders as a visibly pending slot, not as generated prose. Their
evidence states it plainly: *"complete unchanged original with empty qualified slots and
labelled optional drafts"* and *"Qualified explanation and Gurmat practice remain empty;
existing draft omission remains visible."*

The reflection form's own words are questions, not instruction: *"Your question and
reflection"*, *"What would you like to understand about this passage?"*, and for a returning
reader *"Return to your own words"*. **The app asks the reader what they want to understand;
it does not tell them what Haumai means.** On the most tempting surface in the project for an
AI to start explaining, nothing explains.

No comparative or cross-tradition framing appears anywhere in the journey module. C9 holds.

## C10 / C11 — no ranking, and no identity

My first grep for `streak|score|rank|points|login|account|uuid` returned hits, and **every one
was a false positive.** Checked rather than reported:

| hit | what it actually is |
|---|---|
| `score` ×15 | **search relevance** scores (`hit.score - hit.score`, `matchBasis, score, reason`) |
| `provenanceRank` ×3 | ranking of **source provenance**, not of readers |
| `randomUUID` ×5 | `entryKey` for **navigation history entries** (`step`, `scroll`), ephemeral per-tab state |
| `endpoints` ×1 | the word containing "points" |
| `scores` ×1 | the app's own sentence: *"No practice sessions, scores, or reminders are recorded"* |

That last one is the opposite of a finding — the application states in its own text that it
records none of this. No account, login or persistent identifier is introduced.

Their evidence adds *"no automatic notification or session record"* and *"unsaved later
reflection survives Saved and Back navigation without becoming an activity log."* Not
becoming an activity log is exactly the right thing to have worried about.

## One privacy route I had not specified, and they covered

*"Saved and editor private content excluded from print, while original stays visible."*

Printing a page is a disclosure channel — a reflection on a shared printer is as exposed as
one sent over a network. My criteria did not mention print. Theirs did.

## What I did not verify

- **Browser behaviour.** Their report lists 15 checks passing in fresh Chromium contexts with
  synthetic notes; I did not run them.
- **The four data-loss paths** named above — code paths verified, behaviour not run by me.
- **Any device result.** Their limits say it themselves: *"Synthetic notes in fresh desktop
  Chromium contexts only; no physical phone, Safari, VoiceOver or qualified content
  approval."* I claim none of those either.
- **C2 beyond the declaration.** Their evidence states synthetic notes only and the fixture is
  1509 bytes; I did not audit every evidence file for reflection-like prose.

## Instrument discipline in this retest

No errors. One trap avoided deliberately: the ranking/identity grep returned exactly the
shape of a finding, and under my frozen method rule — *when a test returns the answer I
expected, check I measured the right thing* — I examined each match and found all five
classes benign. Had I reported that grep as-is it would have been a false accusation of
spiritual scoring against an app that explicitly disclaims it.

Running total: **36**.
