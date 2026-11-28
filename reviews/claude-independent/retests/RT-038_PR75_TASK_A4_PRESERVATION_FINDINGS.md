# RT-038 — #75 Task A §4: preservation of the existing application — independent findings

Reviewer: Claude (independent). 2026-11-27. Criteria frozen in **RT-033**.
Increment reviewed: **`320537b0cc4aceb2e6007b32057a3c4a36c83520` → `c3a4cc027b48c246027b545d9120dfb72d7ebe6f`**,
the comparison the request asked for.

## Verdict for §4

**All three falsifiers did not fire.** No pre-existing reader is regressed by this increment.

| id | result |
|---|---|
| F4.1 existing readers removed / regressed / altered | **did not fire** |
| F4.2 navigation-scope amendment weakens a prior proof | **did not fire** — it strengthens it |
| F4.3 Knowledge projection access policy changed | **did not fire** — untouched |

## F4.1 — the ten-reader catalog, and what the increment actually touches

`READERS` holds **exactly ten** entries at the target and is deeply frozen (`Object.isFrozen` true).

**No pre-existing reader code is touched by this increment.** `js/`, `nitnem/`, `css/` and
`icons/` are all byte-unchanged between the baseline and the target. (Across the whole stack
from `main` they do change, but that belongs to earlier PRs in the chain, not to the increment
the request scoped.)

The catalog edits are all honest status movements, not quiet substitutions:

- Dasam summary moves from "three selected readings are available; the complete collection is
  still being prepared" to all 17 sections of the named edition — which my §2 and §3 work
  confirms is true.
- A new `sggs-collection` entry is added.
- Two **unavailable** entries are *removed* — `full-dasam-granth` and
  `full-guru-granth-sahib` — because the text they said was missing is now present.
- Two new **unavailable** entries replace them — `dasam-explanations` and
  `sggs-explanations` — moving the admitted gap from "we do not have the text" to "we do not
  have the explanations". That is the correct direction and it keeps a gap declared rather
  than closing one silently.
- Wording moves from "password"/"passphrase" to "six-digit PIN", which matches the
  implementation I tested in §1.
- The `history` entry now reads that the Kartarpur draft and source records are prepared and
  **the independent second review is pending**. That is accurate: it is Task B, and it is not
  yet done. The catalog does not claim a review that has not happened.

## Offline behaviour — worth naming because it protects a standing constraint

The increment adds to the service-worker cache **only the reader shells**:
`collections/sggs/`, `collections/sggs/index.html`, `collections/dasam/read.html`,
`collections/source-reader/reader.css` and `reader.bundle.mjs`. I verified the cache list
directly: **117 entries, zero under `source-data/`, zero manifests.** None of the 155 source
chunks is cached.

Their own comment states the reasoning — a cached shell never implies a complete source can
be read — and §3 confirms the behaviour: with chunks unavailable the reader lands in
`state="refused"` with "Reading unavailable" and zero groups. So offline, this reader declines
to show scripture rather than showing part of it. That is **"a corrupted or incomplete
scripture package must not silently render as a complete valid composition"** satisfied in the
offline case, which is the case most likely to be overlooked.

The cache list is also a hash allow-list, so a corrupted cache entry is not served.

## F4.2 — the amendment strengthens the prior proof

The pre-existing `continuationNavigationScope()` proved, for each navigation file, that the
content at its own base hashed to `beforeSha256` **and** that the current content hashed to
`afterSha256`. The increment changes only the second term, from `read(path)` to
`readBeforeSourceReaderNavigation(path, read)`.

That helper is the part that matters:

- if the file is **not** in the source-reader scope list, it falls back to a plain read —
  the older proof is unchanged for those files;
- if it **is**, it first `await`s `sourceReaderNavigationScope()` and only then returns the
  content as it stood *before* the source-reader change.

So the older proof still runs against exactly the bytes it originally proved, and the new
delta gets its own assertion. Critically, the "before" content **cannot be obtained without
the new scope assertion passing first**. This is layered, not relaxed.

I verified the recorded digests myself rather than trusting the file: for
`library/catalog.mjs` and `collections/dasam/index.html`, both `beforeSha256` and
`afterSha256` match what I computed from the baseline and target objects — four of four.

### One thing I probed hard and am recording as an observation, not a finding

`comparable()` normalises `index.html` by replacing **every** `<script>…</script>` block with
a placeholder. That is broader than stripping an `integrity` attribute: it means *any* change
inside *any* script element in `index.html`, inline code included, is invisible to this
particular proof. I went looking for a hole.

There is not one, because scripts are owned by a different proof.
`tools/script-integrity/policy.mjs` pins the exact loader list for `index.html`
(`js/home.js`, `js/pwa.js`, `library/app.bundle.mjs`) and for every other page including the
two new readers, and `tests/library-script-integrity.mjs` states in its own test name that the
loader policy **refuses missing, extra, inline, duplicate, reordered, async and foreign
scripts**, with a second test that a pinned bundle cannot recover an inline execution path.
The normalisation is correct separation of concerns: navigation markup to one proof, scripts
to another.

**The observation worth keeping:** the two proofs are load-bearing *together*, and the
coupling is implicit. If `index.html` were ever dropped from the script-integrity page list,
the navigation-scope proof would not notice, because it has deliberately blinded itself to
scripts. Nothing is wrong today — both proofs exist and both run — but neither file says it
depends on the other.

## F4.3 — Knowledge projection access policy untouched

`knowledge/` is **byte-unchanged** in this increment, and the `knowledge/app.bundle.mjs`
digest in the service-worker list is identical before and after
(`190127810890d9ab…`). The loader's stated policy — that it accepts the explicit public
projection only — is not modified.

`library/passages.mjs` is likewise unchanged (`58973fe1097e764b…` before and after), so
`SEARCH_CROSSWALK_IDENTITY` still requires `status === 'DEVELOPMENT_REVIEW'` with
`independentCollation === false` and `qualifiedApproval === false`. The application continues
to refuse to represent itself as independently collated or qualifiedly approved. This
increment does not quietly promote that status.

The only `library/` runtime files in the increment are `catalog.mjs` and the rebuilt
`app.bundle.mjs` that contains it — both pinned in the script-integrity graph, and
`catalog.mjs` additionally pinned before-and-after in the navigation-scope record I verified.

## Task A, all four sections: closing position

No defect found in §1, §2, §3 or §4. What that does **not** mean:

- **F1.7's five-minute idle lock was not driven** — handler and constant present, timer not
  run.
- **F3.5's race is not reachable from the UI**, so the repair is verified as correct code and
  not as a verified behaviour change.
- **Physical iPhone and iPad acceptance, VoiceOver and airplane mode are untested.** A
  desktop Chromium at 320 px is not a phone.
- **Printed-source collation is not performed**, as the builder's own ledger declares.
- **Qualified Sikh scholarly review remains outstanding**, and the notice's judgment-bearing
  conditions from §2 are open.
- **Task B is not done.**

A clean finding list across four sections is not permission to merge, deploy, activate a
publisher or release.
