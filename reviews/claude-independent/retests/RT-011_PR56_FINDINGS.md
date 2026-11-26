# RT-011 — PR #56, Unified Library v1: findings

Candidate `389e79baff4016a2ff61d1851908de0bd66beb8f`, verified by commit id and
confirmed to contain PR #55's head by ancestry. Criteria frozen in
`RT-011_FROZEN_CRITERIA_PR56.md` **before** I opened any code. Exposure disclosed
there.

## Verdict: PASS, with one pre-existing finding raised and three criteria inherited rather than re-tested

| ID | Criterion | Result |
|---|---|---|
| RT11-C1 | no scripture, teaching or source-lock byte changed | **PASS** |
| RT11-C2 | every pin in `nitnem/reader.js` survives | **PASS** |
| RT11-C3 | pinned pages carry matching integrity hashes | **PASS** — see SRI-01 |
| RT11-C4 | damaged scripture refuses through the new entrances | **PASS** |
| RT11-C5 | teaching refuses independently, scripture stays readable | inherited |
| RT11-C6 | existing storage keys unchanged | **PASS** |
| RT11-C7 | saved notes and reading place round-trip exactly | inherited |
| RT11-C8 | the SF-01 reading-place repair still holds | **PASS**, by code path |
| RT11-C9 | a failed offline update cannot destroy a working version | **PASS** |
| RT11-C10 | draft labelling on each new entrance | **PASS** |
| RT11-C11 | no new exposition anywhere in the new layer | **PASS** |
| RT11-C12 | committed failures are genuine and preserved | **PASS** |
| RT11-C13 | the knowledge pilot is genuinely absent | **PASS** |
| RT11-C14 | no Daily Hukamnama substitution path | **PASS** |
| RT11-C15 | no clipping or overflow at 320/390 and 200% text | **PARTIAL** — my instrument was weaker than theirs |
| RT11-C16 | nothing can deploy | **PASS** |

## The root of trust held, and that was the main risk

`nitnem/reader.js` holds every pin in the project, so I checked it mechanically
rather than by eye. **All five pin constant names and all nine sixty-four-character
pin values are byte-identical to PR #55.** None removed, none added, none replaced
by a computed value.

The diff is small and careful. `chooseBani` gains a `savedEntry` option; when a
Saved link is used, the URL's `unit` parameter is deliberately ignored so the link
cannot move the reader's stored occurrence. The new entry reads its query
parameters with `getAll()` and requires `length===1` on both `learning` and
`bani` — parameter-pollution hardening, so a duplicated parameter cannot trigger
the path. And the branch is guarded by `!state.sourceVerified || state.savingBlocked`,
with a comment saying a source failure never reaches the tools.

No scripture, teaching, source-lock, research, knowledge or articles byte changed.
The "no new scripture or exposition" claim holds, and I verified it rather than
accepting it.

## The new entrance is fail-closed, tested rather than reasoned

I damaged one Gurmukhi character in the Japji source (`ਨਾਨਕ` → `ਮਾਨਕ`) at two
levels: data only, so the page's own integrity hash blocks the file; and data
plus a restamped hash, so the source-verification code actually runs.

| | integrity state | Saved list opened | refusal shown |
|---|---|---|---|
| Control | `verified` | **yes** | no |
| Damaged, hash stale | `failed` | **no** | yes |
| Damaged, hash restamped | `failed` | **no** | yes |

The altered line `ਮਾਨਕ` appears **nowhere** in the document. The only Gurmukhi on
the refusal page is the page's own static title `ਜਪੁਜੀ ਸਾਹਿਬ` — chrome, not
scripture. The reader shows the honest message that the scripture could not be
verified and has not been displayed, and offers the learning export.

The mechanism is the `return` in the verification `catch`, which exits before the
initialisation that contains the new Saved branch. I verified that empirically; a
control-flow argument alone would not have been enough.

## Existing users are safe

Every production storage key is identical between PR #55 and PR #56. The only
addition is `glp001.synthetic.other-reader`, inside the test-only `synthetic`
namespace. **No key was renamed, namespaced or migrated**, so no family member's
existing notes or reading place can be orphaned by this candidate. That was the
largest risk to real users in a change that adds a "saved learning" entrance, and
it is clean.

The offline shell is consistent: VERSION bumped 0.18 → 0.19, the four new
`library/` files added to the manifest, and **all 85 manifest hashes match the
real bytes on disk** — so `build-offline` was genuinely run, not hand-edited. The
cache is keyed by version, so an interrupted update leaves the previous cache
serving.

## The new surfaces are honest

Four entrances — Today, Read, Explore, Saved — all present at 320 and 390 pixels,
each carrying draft, awaiting-qualified-review, educational and
development-preview wording. **Zero exposition verbs anywhere in the new layer**:
no "means", "teaches", "signifies", "interpretation" or "translation".

The Explore view is the best part. Six future capabilities ship as
`available: false`, each saying *why* rather than teasing:

- Daily Hukamnama — "The verified daily selection is not connected to this library yet."
- Full Sri Guru Granth Sahib Ji — "Complete sequential reading is a future library expansion."
- Knowledge Explorer — "The separate pilot is awaiting integration and outstanding review."
- Gurbani dictionary — "A source-linked vocabulary library remains to be built and reviewed."
- Sikh History — "Historical narratives and their source records remain to be developed and reviewed."
- Gurbani audio — "Recordings require permission and verified mapping before they can be included."

That is the fail-closed Hukamnama posture I recommended in the architecture review
earlier today, implemented as honest absence rather than a placeholder that shows
something. And the knowledge pilot's exclusion is not merely claimed — the
builder wrote a test asserting that no path contains `/knowledge/` or
`/hukamnama/`.

`library/app.mjs` also rejects any catalog-supplied destination that is not a
string, is empty, starts with `/`, or contains a backslash — so catalog data
cannot supply an arbitrary navigation target.

## SRI-01 — a pre-existing gap this review surfaced, and a correction to myself

Checking RT11-C3 produced something more interesting than the criterion.

The two Salok pages pin all six nitnem scripts, and their `reader.js` hash
**matches the new bytes exactly** — correctly re-stamped for this change. But:

- **`nitnem/index.html` — the primary Nitnem reader — has no `integrity`
  attribute on any of its six script tags**, `reader.js` included.
- The new `index.html` loads `js/home.js`, `js/pwa.js` and `library/app.mjs` with
  no integrity attribute either.

**This is pre-existing, not a regression from PR #56.** I checked `main`, #40,
#52, #55 and #56: `nitnem/index.html` has zero integrity attributes on every one
of them, and PR #56 does not touch the file. It is live on `main` today.

**It corrects something I stated twice.** In RT-009 and RT-010 I concluded that
"the root of trust is the served HTML, which carries the subresource integrity
attribute for `reader.js`." For the Nitnem reader **there is no such attribute**.
The pins inside `reader.js` still protect the data, but nothing protects
`reader.js` itself on that page. My earlier statement was true of the Salok pages
and false of the primary reader, and I did not distinguish them.

Raised as **SRI-01**, pre-existing, for the builder to place in their own queue.
Not a PR #56 defect and not a reason to hold this candidate.

## Where my instrument was weaker than the builder's

I tested 200% text at 320 and 390 pixels and found no horizontal overflow. The
builder's own harness caught something mine could not: a committed failure at
22:59 shows `Final read action clears fixed navigation at 320px
(measured-text-200-percent)` with the action measured at `top: -92.23` — the
action pushed **off the top of the viewport** by fixed navigation at 200% text.

That is a vertical-clearance failure. **My check measured horizontal overflow
only and would have passed a page whose primary action was unreachable.** Their
instrument was better. Their last two runs, at 23:01 and 23:03, are fully green
across all ten checks, and the earlier failing runs are preserved in the
committed evidence rather than replaced — which is what the standing rules
require and what RT11-C12 asked for.

So RT11-C15 is **verified by their instrument and only partially by mine**, and I
am recording that rather than claiming the pass as my own.

## Inherited, not re-tested — stated plainly

- **RT11-C5** — teaching refusing independently while scripture stays readable.
  The `reader.js` pins are byte-identical and the Kabir path is untouched, so the
  PR #52 result carries. Not separately re-run on this candidate.
- **RT11-C7** — exact export/import round trip. `nitnem/local-learning.js` is
  unmodified and the keys are unchanged, so the RT-006 result carries. Not
  separately re-run.
- **RT11-C8** — the SF-01 away-and-back repair. The `pageshow` handler is
  untouched by this diff; the change skips `rememberVisible()` **only** on the new
  Saved-link entry, with the correct reason that the stored occurrence should not
  be replaced by whatever is visible behind a dialog. Verified by code path, not
  by a fresh away-and-back run.

## Still outstanding, and not mine to close

Physical iPhone, iPad, Home Screen and VoiceOver acceptance — **this candidate
adds four new entrances and a larger-text layout, which is exactly the kind of
change a desktop width cannot sign off.** Qualified Sikh scholarly and Punjabi
review. Printed-source collation. Audio rights.

**No approval. No merge. Nothing here is a device result or a qualified review.**
