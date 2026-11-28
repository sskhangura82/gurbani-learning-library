# RT-037 — #75 Task A §3 reader integrity and navigation, plus the deferred §1 F1.7

Reviewer: Claude (independent). 2026-11-27. Criteria frozen in **RT-033**.
Target `c3a4cc027b48c246027b545d9120dfb72d7ebe6f`; parent `24fb8a2bf0d77511cf15a32e353d7489c7cd9a9c`.

Browser work used **my own** Playwright harness and a local server, not the repository's
fixtures, so this is an independent instrument. For the private library I served a
**synthetic sealed collection** in place of `collection.enc.json`; the owner's file was never
served, read or unlocked.

## Verdict

**All seven §3 falsifiers did not fire, and F1.7 did not fire.** One result is a negative I
am reporting as a negative: I could not reproduce the race this target repairs.

| id | result |
|---|---|
| F3.1 corrupted package renders as complete | **did not fire** |
| F3.2 per-line verification not reached | **did not fire** — proven at the right layer |
| F3.3 navigation loses or misplaces position | **did not fire** |
| F3.4 saved-place key collision | **did not fire** |
| F3.5 the `c3a4cc0` race repair | **correct code; defect not reachable from the UI** |
| F3.6 named unit line counts | **did not fire** — five of five |
| F3.7 320 px layout | **did not fire** |
| F1.7 automatic locks / key retention | **did not fire** — five of six driven |

## F3.1 and F3.2 — the chain, proven layer by layer

**The control came first.** The real manifest verifies against the pinned binding
(1,116,397 bytes and digest both match `source-lock.mjs`), yielding 5,549 units / 1,430 pages
/ 75 chunks, and chunk `c0001` verifies to 69 units and 840 lines. Only then did I tamper.

I altered **one Gurmukhi character** in one line and walked the layers:

| what the attacker controls | what refuses it |
|---|---|
| the chunk only | `SOURCE_CHUNK_DIGEST` |
| chunk + the manifest's chunk descriptor | `SOURCE_MANIFEST_DIGEST` |
| chunk + descriptor + the pinned binding | **`SOURCE_UNIT_DIGEST`** ← per-line coverage proven |
| all of the above + the manifest's unit digest | accepted — **trust terminates here** |

That fourth row is the honest terminus and worth stating plainly: whoever controls the pinned
binding **and** the unit digests controls what renders. That is inherent to a static
application — something must be the root. The root here is `source-lock.mjs`, which is
compiled into `reader.bundle.mjs`, whose digest I recomputed as
`sha384-mbsKG/ldpgpQb9R2jDaHkm9KmeskuVKH/WIpwU2gGyEA5BtvFgWdd7eY4cevOni7` and found **pinned
by `integrity` in both reader pages**. So substituting the binding requires changing the
bundle *and* the HTML that pins it, which lands in the committed tree rather than passing
unnoticed. That is a defensible chain, and I am describing where it ends rather than implying
it ends nowhere.

Single-field tampers, each tested at the layer where the unit digest is the gate:

| tamper | refused by |
|---|---|
| line order renumbered | `SOURCE_LINE` |
| line page changed | `SOURCE_LINE` |
| `printedLine` nulled | `SOURCE_UNIT_DIGEST` |
| one line deleted | `SOURCE_COMPLETE_UNIT` |
| line duplicated within a unit | `SOURCE_COMPLETE_UNIT` |
| `authorId` changed | `SOURCE_UNIT_BINDING` |
| extra field added to a line | `SOURCE_SCHEMA` |
| **zero-width joiner inserted** | `SOURCE_UNIT_DIGEST` |
| **danda `॥` replaced with ASCII `||`** | `SOURCE_UNIT_DIGEST` |
| decomposed nukta character prepended | `SOURCE_UNIT_DIGEST` |
| single trailing space appended | `SOURCE_UNIT_DIGEST` |

The ZWJ result matters given **RT-029**: the ZWJ divergence I found between Shabad OS and Open
Granth would be *caught* by this chain rather than passing silently. The danda substitution
matters because that is a classic silent-modernisation vector.

Supporting gates also hold: a hand-made manifest object is refused by `SOURCE_UNVERIFIED_MANIFEST`
at `verifyChunk` and at `unitsForPage`; a hand-made unit is refused by `SOURCE_UNVERIFIED_UNIT`
at `lineForRoute`; pretty-printed JSON is refused by `SOURCE_SIZE`; and omitting the trailing
LF is refused by `SOURCE_CHUNK_SIZE`. The canonical-JSON check (`decoded === JSON.stringify(value) + '\n'`)
is what makes the unit digest well-defined, since it pins the serialisation.

### A no-op of mine, caught before it became a finding

My first normalisation test reported "NFD applied → ACCEPTED", which reads like undetected
normalisation. **It was a no-op.** This corpus is invariant under all four normalisation forms
— 840 of 840 lines in `c0001` are unchanged by NFC, NFD, NFKC and NFKD — so my mutation
changed no bytes and tested nothing. I re-tested with substitutions that *do* change bytes
(danda, decomposed nukta, trailing space) and every one fired. Recorded because a test that
"passes" without changing anything is the same trap as **instrument-error 35**, from the other
direction.

## F3.5 — the repair is right; the defect is not reachable from the UI

The defect in the parent is real and I can state it exactly. The `resume` handler captured
`navigationAtStart = sequence` and checked it on the **success** path only; the `catch` had
**no guard at all**, and it executed `savedRecord = null; resume.disabled = true`. So a
superseded, failing resume could invalidate the in-memory state of a *newer* successful save
and tell the reader their saved line was unavailable. The repair adds `stillCurrent()` —
navigation sequence unchanged **and** progress sequence unchanged **and** `savedRecord === record`
by identity — and applies it to both paths. Correct fix, and the identity check is the right
belt.

**But I could not drive it, on either commit.** `loadSavedPlace()` awaits `unitFor(descriptor)`
and only sets `savedRecord` after that chunk has loaded and validated. So:

- If the saved chunk loads, it is **already in `chunkCache`** when Resume is clicked, so
  `unitFor` resolves without a network request. I confirmed this directly: with the chunk
  blocked at the server, the server logged **zero** requests after clicking Resume, and
  navigation completed to the saved page anyway.
- If the saved chunk **fails** to load, `savedRecord` stays null and **resume stays disabled**,
  so the handler cannot run. Confirmed on both commits: with the chunk blocked from first
  load, resume was disabled and the message was *"The saved place cannot be matched to this
  edition. It has been kept unchanged."* — and I verified the localStorage record genuinely
  did survive.

There is no in-flight window between those two states long enough for a human click. My
attempt to produce one gave "preserved" on **both** parent and target, which is not evidence
the repair works — it is evidence my test did not reach the path, and I checked rather than
claiming a pass.

**What this means, stated carefully:** the fix is correct and harmless defensive hardening of
a genuine logical gap, and it closes the gap before some future change (chunk-cache eviction,
a deferred load, a second resume affordance) makes it reachable. **I did not verify a
user-visible behaviour change, because I could not produce one.** Combined with RT-032's
result that the runtime is byte-identical at target and head, the practical risk carried by
this target is very low. If the builder has a test that *does* exercise the catch path, it
will be a handler-level test rather than a browser one, and that distinction is worth
recording in the evidence.

## F3.3 — navigation holds, and invalid routes refuse rather than degrade

| route | result |
|---|---|
| `?page=1` | Ang 1 of 1430, 3 groups, first `DMP`, previous disabled |
| next / previous | Ang 2 (7 groups, first `ZKH`) and back to Ang 1 |
| `?page=1430` | 1 group, `FD3`, next disabled |
| `?page=929&unit=TNM` | Ang 929, 7 groups |
| `?page=1429&unit=FD3` | Ang 1429, 13 groups |
| Back / Forward / reload from 500→501 | 500, 501, 501 — all correct |

Every invalid route **refuses**: unknown unit id, `?page=99999`, `?page=0`, `?page=abc` and an
unknown line id all land in `state="refused"` with "Reading unavailable", zero groups, and
"This reading could not be verified." Nothing renders partially. That is F3.1's requirement
met at the routing layer as well as the digest layer.

**The Dasam reader says "Page 1 of 1428", not "Ang".** The `locator` field in `source-lock.mjs`
is `Ang` for SGGS and `Page` for Dasam, and it reaches the UI. The distinction the entry page
promises is actually implemented.

**A correction to my own RT-036:** I wrote there that the per-line locator carries no
qualifier in the reading view. The **page status line does** — it reads *"N complete source
groups. Page labels follow the named digital edition."* on every page of both readers. So the
provenance qualifier is present in the reading view, not only on the entry pages. My earlier
sentence understated it.

## F3.6 — five of five named units match

| unit | declared | chunk-verified | section / author | pages |
|---|---|---|---|---|
| sggs `ZKH` | 14 | **14** | 1DSA ord 3 / NANK | 1–2 |
| sggs `SKD` | 15 | **15** | GAS9 ord 333 / NANK | 465–466 |
| sggs `TNM` | 399 | **399** | 87DX ord 135 / NANK | 929–938 |
| sggs `FD3` | 62 | **62** | 6EZX ord 1 / ALAM | 1429–1430 |
| dasam `4TJ` | 426 | **426** | MFTS ord 12 / GGSN | 738–748 |

`FD3` is the final SGGS unit and the only unit on page 1430; `BTE` is the last Dasam unit
(pages 1427–1428, 43 lines). Printed-line labels are present on 399/399 of `TNM` and on
**0/426** of `4TJ`, consistent with my independent derivation that only 801 of 67,758 Dasam
records carry a printed line at all.

## F3.4 — saved-place records are bound, not merely namespaced

Keys are distinct per collection and edition:
`glp001.sikh-source-place.v1:sggs:shabados-5.0.0-next.0-SGGS-SSA2` and
`…:dasam:shabados-5.0.0-next.0-SDGR-DGDG`.

Separation is enforced, not just hoped for. A valid SGGS record presented to the Dasam
manifest is refused (`SOURCE_PROGRESS_BINDING`), as are a swapped `editionId` and a swapped
`unitSha256`; an extra field is refused (`SOURCE_PROGRESS_SCHEMA`); a `lineId` not in that
unit is refused (`SOURCE_PROGRESS_LINE`). Because the record carries `unitSha256`, a saved
place cannot survive a content change in its unit — it is refused rather than silently
pointing at different text. That is the right failure direction for scripture.

## F1.7 — locks hold, five of six driven

With a synthetic collection unlocked by a synthetic PIN:

| trigger | result |
|---|---|
| tab hidden (`visibilitychange`) | **locked**, passages 0, PIN field cleared |
| `beforeprint` | **locked** — "Private content is excluded from printing." |
| `pagehide` | **locked** |
| `pageshow` with `persisted` (bfcache) | **locked** |
| explicit Lock button | **locked**; passage text to 0 chars and the synthetic text no longer anywhere in `document.body.innerHTML` |

**Nothing is persisted.** `localStorage` and `sessionStorage` were empty at every checkpoint —
before unlock, while unlocked, and after every lock. The derived key is a non-extractable
`CryptoKey` that is never stored, and plaintext is zeroed on every exit path.

**Not driven: the five-minute idle lock.** The handler and the `IDLE_MILLISECONDS = 5 * 60 * 1000`
constant are present and the interval runs each second, but I did not wait out five minutes of
wall-clock idleness, and I will not report a timer as tested when I did not run it.

## 320 px

No horizontal overflow on the SGGS reader, the Dasam reader, or the private library:
`scrollWidth` equals the 320 px viewport in all three.

## Still outstanding after §3

A desktop Chromium at a 320 px viewport is **not** an iPhone. Physical iPhone and iPad
acceptance, VoiceOver, and airplane-mode behaviour remain untested and unclosed, exactly as
the standing constraints require.
