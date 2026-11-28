# RT-008 — RB-01 on PR #53: findings

Criteria frozen first in RT-008_FROZEN_CRITERIA_RB01_PR53.md, committed before
opening `knowledge/registry.mjs`, the builder's tests, docs or evidence.

- Candidate: PR #53, head `83acf3f9e4c69c346f2be16d02f407838a137cf9` — matches
  the commit the founder named.
- Base: `94f004a842eb1bdf2da879074c2f4c701d54030e`.

## Verdict: NEEDS_REVISION. The repair is sound where it applies, but it applies to two fields out of several, and the original rendering surface is still reachable.

**RB-01 is not closed.** Reproduced on screen, not inferred.

## 1. Where the repair applies, it is genuinely good — not a blocklist

`validateEditorialTitle` builds a comparison signature by NFKC-normalising,
**stripping format characters** (`\p{Cf}`), mapping Gurmukhi digits to ASCII and
removing punctuation and separators. It then refuses the value if its signature
matches **any** source occurrence's signature, or matches structural heading
forms.

All eight attacks on the guarded fields were refused:

| Attack | Result |
|---|---|
| The original leak `ਸਲੋਕੁ ਮਃ ੧ ॥` | **refused** |
| A different heading `ਮਹਲਾ ੫ ॥` | **refused** |
| Bare `ਸਲੋਕੁ` | **refused** |
| `ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥` | **refused** |
| Zero-width joiner and zero-width space inside the heading | **refused** |
| Bidi marks wrapped around the heading | **refused** |
| ASCII `1` substituted for `੧` | **refused** |
| A real in-pack Gurbani line | **refused** |
| Control: an honest editorial title | accepted, correctly |

This answers the question I set in the frozen criteria. It is a **structural and
character-class guard, not a blocklist of my round-3b string.** Signature
derivation from the live scripture means the next scripture-shaped string anyone
types is also caught. That is the right design and it deserves saying plainly.

**RT8-A10 PASS.** Across every mutation, `verifyScripture` ran first against the
separate `SCRIPTURE_SHA256` and passed. **No mutation of teaching material
affected the scripture integrity record at any point, and no scripture byte was
modified by this review.**

## 2. FINDING RB-01-a (medium) — the heading regex is `^`-anchored, so an embedded heading reaches the original surface

The guard's heading pattern is anchored only at the start. A title whose heading
is not the first token passes.

Attempted: `passageDescriptions[0].title = "ਵਿਸ਼ਾ ਸਲੋਕੁ ਮਃ ੧ ॥"` — **accepted by
the loader.** Rendered on screen as:

```
<p class="note" lang="en">   Library topic: ਵਿਸ਼ਾ ਸਲੋਕੁ ਮਃ ੧ ॥
```

That is literally the "Library topic:" note that was the original RB-01 surface,
displaying a scripture heading again. One word of prefix defeats the guard.

## 3. FINDING RB-01-b (medium) — node `pa` is unguarded and renders in the same element as Gurbani

`validateEditorialTitle` is called on `passageDescriptions[].title` and
`.pa` only. It is never called on `nodes[].title`, `nodes[].pa` or
`nodes[].aliases`.

`app.mjs` line 33 renders **any** node's `pa` as:
`const p=el("p",n.pa,"pa"); p.lang="pa";`

That is the identical element, class and language tag used for real Gurbani.
Attempted: a `concept` node's `pa` set to `ਸਲੋਕੁ ਮਃ ੧ ॥` — accepted, and rendered:

```
mutated concept node   <p class="pa" lang="pa">  ਸਲੋਕੁ ਮਃ ੧ ॥
real Gurbani elsewhere <p class="pa">            ਸਲੋਕੁ ਮਃ ੧ ॥
```

**Indistinguishable.** The same bypass was accepted into `word` node `pa` and
`lesson` node `pa`. A `concept` node title of `ਮਹਲਾ ੧` was also accepted.

## 4. FINDING RB-01-c (medium) — a real Gurbani line in a node renders as a result row beside the genuine one

Attempted: a `word` node's `pa` set to the real in-pack line
`ਸਿੰਮਲ ਰੁਖੁ ਸਰਾਇਰਾ ਅਤਿ ਦੀਰਘ ਅਤਿ ਮੁਚੁ ॥` — accepted. The search results then show
that text twice: once as the genuine passage row and once as my editorial node,
both as `<button class="result">` with the same text. A reader cannot tell which
row is scripture.

## 5. FINDING RB-01-d (low) — editorial `aliases` are attached to the scripture node and feed search

`registry.mjs` line 89 builds each scripture `sourceNode` as
`{...p, title: <incipit text>, editorialTitle: d.title, editorialPa: d.pa, aliases: d.aliases}`
and `core.mjs` line 65 indexes `[title, pa, editorialTitle, editorialPa, ...aliases]`.

So unvalidated editorial aliases become **search terms on a scripture passage
node**. A heading placed in `aliases` was accepted. I did not observe aliases
rendering as visible text, so this is a search-identity issue rather than a
display one — but it is editorial content steering how a scripture passage is
found, which is the same family as RB-01.

## 6. Accepted but harmless — recorded so it is not mistaken for a vulnerability

Markup in an editorial title (`<b lang=pa>…</b>`) is accepted by the loader, but
`el()` assigns via `textContent`, so **nothing executes**. The only consequence
is that literal angle brackets would display. Cosmetic, not a security or
attribution defect. No action needed beyond knowing it.

## 7. What would actually close this

Not my call to implement, and I will not repair builder code. Stated as the shape
of the problem rather than a patch:

1. Apply `validateEditorialTitle` to **every** editorial text field that can
   reach the DOM or the search index — at minimum `nodes[].title`,
   `nodes[].pa`, `nodes[].aliases` and `passageDescriptions[].aliases`.
2. Make the heading test **unanchored**, or test every token, so a prefix does
   not defeat it.
3. Consider the stronger structural rule: refuse Gurmukhi in editorial fields
   whose purpose is English labelling, and render editorial `pa` in a container
   that is visually and programmatically distinct from the scripture `pa`
   element — so the boundary is enforced by the DOM, not only by validation.

Item 3 is the one that makes the class of defect go away rather than this
instance of it. Points 1 and 2 close what I found; point 3 closes what I did not
think to try.

## 8. Method and limits

- Synthetic mutations only, applied to a throwaway copy at `/home/claude/rb01`.
  **No repository scripture or teaching file was modified.**
- Mutated packs were legitimately re-digested and re-pinned, because the threat
  being modelled is **bad content entering through the authoring path**, not
  byte tampering — the digests already catch tampering. That is what RB-01 was.
- Rendering observed in Chromium at 390px. Not an iPhone result.
- Builder tests, docs and evidence for this PR were not read before this file.

**No approval. No merge. Draft stays a draft.**
