

---

## Full inventory, 27 November 2026 — and a correction to how I have been framing this

I have been describing SRI-01 as pages "lacking an integrity attribute," which
is accurate but has been making the pinning look accidental. It is not. A full
inventory shows a deliberate two-tier design, and the gap is narrower and more
specific than I implied.

### `main` — the live site

Seven served pages with external scripts. **43 script tags, 0 integrity
attributes.** Nothing on the live site is pinned at all.
`salok-mahalla9/index.html` is **absent from `main`**, so the one page I had been
citing as the pinned counter-example is not live.

### `389e79b` — the build deployed as Preview 4

| Page | Pins |
|---|---|
| `salok-kabir/index.html` | **6 / 6** |
| `salok-mahalla9/index.html` | **6 / 6** |
| `sukhmani.html` | 2 / 7 |
| `full-japji.html` | 2 / 11 |
| `index.html` | 0 / 3 |
| `nitnem/index.html` | **0 / 6** |
| `pauri-2-lesson.html` | 0 / 5 |
| `breathing.html`, `articles/*`, `gurdwara.html`, `simran.html` | 0 |

### Every pin that exists is valid

I recomputed each one against the real file bytes. **No mismatches.** The
`salok-*` readers use sha256; `sukhmani.html` and `full-japji.html` use sha384.
Nothing here is broken, and a page with a wrong pin would fail closed anyway.

### The pattern is intentional, and that matters

The two partial pages pin exactly two things each:

- `sukhmani.html` → `js/source-integrity.js` and `js/sukhmani-data.js`
- `full-japji.html` → `js/source-integrity.js` and `js/japji-full-data.js`

That is **the integrity checker plus the scripture data file**, with presentation
code left unpinned. It is a coherent design: protect the scripture bytes and the
verifier, and accept that UI code changes often.

### Why the gap is still real

Pinning the verifier guarantees the verifier's **bytes**. It does not guarantee
that the verifier is **called**, or that its result is honoured — because the
code that invokes it is unpinned. That is not hypothetical: in RT-018 I
neutralised the guard in unpinned JavaScript on `knowledge/index.html` and the
page loaded a forged scripture heading while still reporting "Source files
checked".

So the two-tier design protects against **substituting scripture data** and not
against **skipping the check**.

### The sharpest version of the finding

`nitnem/reader.js` is pinned — by `salok-mahalla9/index.html` and
`salok-kabir/index.html`, which pin all six of their scripts. But
`nitnem/index.html` pins **nothing**. The same file is protected when the new
readers load it and unprotected when its own page does.

The builder has already moved to the stronger pattern in the newest readers. The
remaining work is applying it to the older pages, and the order that follows
from this inventory is: `nitnem/index.html` (0 / 6, and it owns the reader the
others protect), then `sukhmani.html` and `full-japji.html` (scripture-bearing,
currently 2-tier), then the rest.

### Limits

Static inspection of served HTML plus hash recomputation against the files in
the same tree. I did not test these pages under tampering in a browser beyond
the `knowledge/index.html` demonstration already recorded in RT-018. Nothing
here is a device or Safari claim.
