# RT-009 — PR #52: the two outstanding checks, now run

Closes RT4-C5 and RT4-C7, which RT-004 left explicitly unverified.

- Candidate: `792afa209c98bb53f257a8dfd5500bef10bfc8e3` — matches the commit the
  founder named. Confirmed by `git rev-parse` on a detached worktree.
- Synthetic mutations on throwaway copies. **No repository file was modified.**

## RT4-C7 — mobile label check: PASS

| | 320 px | 390 px |
|---|---|---|
| Draft/unreviewed labels on the landing view | **yes** — "development preview", "educational", "draft", "awaiting qualified" | **yes**, same |
| A label visible without scrolling | **yes** | **yes** |
| Labels still present inside the reader | **yes** | **yes** |
| Labels still present in Meaning mode | **yes** | **yes** |
| Labels still present in Study mode | **yes** | **yes** |
| Lines rendered | 486 | 486 |
| Horizontal overflow | **none** | **none** |

The labelling travels with the content rather than sitting only on the entry
page, which is the part that matters: a reader who lands directly in Meaning mode
still sees that the explanations are unreviewed drafts.

## RT4-C5 — integrity boundaries: PASS, and the layering is real

Seven mutations, each applied to a throwaway copy with the data file's own
digests legitimately recomputed and `library.json` repinned, as a rebuild would.

| Mutation | Result |
|---|---|
| Control, nothing rewritten | **renders 486 lines** — harness proven |
| One Gurmukhi character changed, file left inconsistent | **refused** |
| Same change, every in-file digest recomputed | **refused** |
| A verse line deleted | **refused** |
| Two Saloks reordered | **refused** |
| An extra verse appended | **refused** |
| `sourceAudit` attribution altered | **refused** |
| `humanCollationApproved` flipped to `true` | **refused** |

All seven died at the **outermost** gate — the pin on `library.json` held in
`reader.js` — with "Source SHA-256 verification failed: data/library.json". So
that result alone does **not** prove the inner pins work. I went further.

### The decisive test: defeat every derived digest, leave the semantic pins

The realistic failure mode is not an attacker but **a build script that
regenerates every derived digest**. So I regenerated all of them — per-line
hashes, unit `sourceDigest`s, the data file's `sourceTextSequenceSha256`, the
`library.json` entry digest, `library.json`'s own digest inside `reader.js`, and
the subresource integrity hash for `reader.js` in the page — and left only the
two **semantic** pins alone.

**Result: REFUSED.** Message: *"Kabir source sequence or review status changed."*

That is the important positive finding. **An automated rebuild cannot silently
ship altered scripture.** The two human-written semantic assertions in code —
the text sequence digest and the structure/attribution digest — are the thing
that catches it, and they earn their place.

### What full code-write does, stated as a limit rather than a defect

With the semantic pins **also** forged, the reader rendered 486 lines including
my altered text (`ਕਬੀਰ ਮੇਰਾ …` where the source reads `ਮੇਰੀ`). That is inherent:
if you can rewrite `reader.js` and the page's integrity attribute, you control
the application and no in-app check can survive it. Not a defect, and I am not
reporting it as one.

It does locate the root of trust precisely: **the served HTML**, which carries
the subresource integrity attribute for `reader.js`. Nothing inside the
application protects that file. Worth carrying into the architecture review.

### A separation result I did not expect, and it is a good one

In that fully-forged run the page said: *"Meanings could not load. Gurbani
remains readable. Learning draft identity does not match this release."*

Changing scripture text invalidated the teaching entries' source anchors, so the
**teaching layer refused independently while Gurbani stayed readable**, and the
application said so plainly. That is RT4-C5's question answered from the other
direction: the two boundaries are genuinely independent and the teaching side
fails closed without taking the scripture layer down with it.

## Method honesty — my fourth instrument error today

My first harness reported all seven mutations refused **and the untouched control
refused too**. That was my harness, not the build: I was measuring the Kabir
landing page, which does not render verses until you enter the reader, and I was
querying `[data-occurrence]`, which does not exist in this reader — the real
attribute is `data-line-id` on `article.scripture-line`. Had I reported the first
run it would have been a false PASS on a broken measurement.

That is the fourth time today an instrument of mine produced a wrong first
answer — twice on the reference's punctuation, once on the `LINE:n` anchor
convention, now this. The common cause is assuming a format instead of reading
it. The control case is what caught it, and every future harness of mine gets one.

**No approval. No merge. Draft stays a draft.**
