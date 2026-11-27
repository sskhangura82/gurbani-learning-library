# MOD-01 — the reader-page pinning mechanism will not extend to the Knowledge module graph

**Raised before the work is built, because the stated next step is to extend the
same protection to Explore and the Knowledge library.**
Severity: medium as a design constraint; no current defect asserted.

## The constraint

`knowledge/index.html` loads exactly one script:

    <script type="module" src="app.mjs">

Two things follow, and the second is the substantive one.

**1. The new tool refuses module scripts by policy.** `refresh-reader-sri.mjs`
throws on "unexpected, inline, module or reordered script". That is a
deliberate choice and a correct one for its declared scope — "Five reader pages
only; trusted HTML, worker and library module graph remain outside this check."

**2. Subresource integrity on a module entry point does not cover its static
imports.** This is the part no policy change fixes. The browser fetches
`app.mjs` with its `integrity` attribute honoured, then the module loader
fetches everything `app.mjs` imports **without any integrity applied**. There is
no attribute that pins a module graph.

The Knowledge graph, as of `b68e080`:

    index.html → app.mjs → core.mjs → kinds.mjs
                         → registry.mjs → source-lock.mjs
                         → search.mjs  → kinds.mjs

Pinning `app.mjs` would protect **one** of six files and leave five unprotected.

## Why that is not an abstract concern

The five unprotected files include **`registry.mjs`, which holds the attribution
guard**, and **`source-lock.mjs`, which holds the scripture digest**. In RT-018 I
demonstrated the exploit on exactly this surface: neutralising
`validateEditorialText` in `registry.mjs` and re-pinning both digests loaded a
forged scripture heading while the page still reported "Source files checked".

So extending entry-point pinning to `knowledge/index.html` would produce a page
that *looks* protected and whose guard remains editable. That is worse than the
current honest state, because it invites the conclusion that the module graph is
covered.

## What would actually close it, for the builder to weigh

Not my call, and I am not proposing an implementation. The options I can see
differ sharply in cost, and the choice is an architecture decision:

- **Bundle the graph into one pinned classic script**, so the existing
  mechanism applies unchanged. Cheapest, and it loses module structure.
- **Verify the graph in the application**, the way scripture is already verified:
  have the entry point fetch, digest and compare each module before use. This is
  what the existing `source-integrity.js` pattern does for data, and it makes the
  verifier's own integrity the remaining root — which is the same residual the
  reader pages already have.
- **Import maps with integrity.** The specification work exists; browser support
  does not, and the project targets Safari on iPhone. I would not plan on it.
- **Accept and state the limit**, pinning nothing on that page rather than
  pinning one file of six. Honest, and it keeps SRI-01 open there explicitly.

The fourth is not a failure. Of the four, the thing to avoid is pinning only the
entry point and describing the page as protected.

## Status

No defect in current code. `knowledge/` is unreachable from `main` and from the
phone preview, confirmed in RT-020, so nothing is exposed today. This is
recorded now only because the next build step runs straight into it, and the
cheapest moment to know is before the work.

## Limits

Read from the committed HTML and module sources. I did not test a module-graph
tampering scenario on a page that pins its entry point, because no such page
exists yet in the project.
