# Explore: complete original passages in existing readers

27 November 2026 · builder candidate · independent review required · no merge or deployment

## What this changes

The existing Explore entrance now accepts original Gurmukhi words and first letters. A result shows the entire carried source unit, then opens that exact unit in its existing reader. The current query and method survive browser Back and reload through a URL fragment. Nothing is added to the reader's private learning records.

The runtime scope is **302 distinct complete passages, owned by 303 existing source views**:

| Owning package | Complete units | Reader |
| --- | ---: | --- |
| Salok Mahalla 9 | 57 | Existing Salok Mahalla 9 reader |
| Kabir Salok collection | 243 | Existing Kabir reader |
| Knowledge | 3 | Existing Knowledge passage view |

Knowledge's Kabir Salok 7 is also present in the Kabir collection. One result preserves both owning links, rather than counting the same exact witness sequence twice. The other two Knowledge passages are complete Asa Di Vaar Saloks. The Haumai result contains all eight original source rows, including the full remedy clause.

**The 60,555-occurrence original research packet is not delivered to the application.** It is used to reconstruct a metadata-only exact-sequence crosswalk. Full sequential coverage, full-corpus semantic indexing, independent printed-Ang authentication, qualified approval and new exposition are not claims of this candidate. Japji Sahib, Sukhmani Sahib and Farid Ji are not admitted through this increment.

## Source boundaries

The parent is PR70's `d1fe71f4eabf8e2fb8695e1b624880fa1a8c639a`. Builder criteria were committed before implementation as `6238a63`. They do not substitute for the independent review seat's own frozen criteria.

All existing source packages, teaching packages and reader scripts remain byte-identical. Search fetches these three existing source files, checks their fixed complete-file hashes, and checks their edition, unit, ordered occurrence and digest contracts before producing results:

- `salok-mahalla9/data/salok-mahalla9.json`
- `salok-kabir/data/salok-kabir.json`
- `knowledge/scripture.json`

M9 and Kabir units use their own ordered occurrence digest recipe. Knowledge uses its existing passage digest recipe, including its pinned metadata and ordered occurrence identities. The importer does not replace these different contracts with a common weaker checksum.

`library/complete-passages.json` contains identities, digests and witness bindings, not a second copy of original text. Every complete unit is tested against every candidate start in the full fixed source packet. Matching requires every original occurrence's literal text and digest in order. No normalization, first-line, row, ordinal, Ang-only, fuzzy or author-inference fallback is used. The fixed corpus projection and source commit are also pinned.

One exact full sequence enables a link. Zero complete sequences or multiple complete sequences produce explicit withheld statuses. All 303 current owning units have one complete sequence. Synthetic missing, reordered, truncated and repeated-sequence cases verify the refusal rules; those synthetic cases are not counted as real source coverage.

The browser verifies the entire crosswalk's fixed digest before processing it. Links are derived from the known package/edition/unit contracts. A reader's unit ordinal is a destination parameter after source identity is established, never a method of identifying a source occurrence. Source-file paths remain witness provenance, not certified Ang values or author assignments. The selected Kabir collection heading difference remains stated in the searchable-scope explanation and in its owning reader.

## Retrieval and presentation

The source search offers three explicit methods: complete words, first letters at a line's start, and first letters anywhere in a line. Joined and spaced first letters have the same meaning. Latin topic terms are not silently translated into scripture matches; the existing topic cards remain available separately.

The implementation reuses the existing Knowledge retrieval engine. Because the closed-module policy permits only same-directory imports, `library/search.mjs` and `library/kinds.mjs` are byte-identical local mirrors of their Knowledge counterparts. A test enforces equality. There is no fork in their behavior and no relaxation of the import policy.

Each card separates the library reference from original Gurmukhi, preserves attached original headings, marks matched lines, and states that qualified review is pending. It supplies no new translation or explanation. The source sheets' empty explanations and the existing readers' draft labels are unchanged.

Search loads lazily in Explore. Missing or corrupted source material withholds search results while the other library entrances remain usable. Narrow, tablet, desktop, enlarged-text and dark appearances have fresh desktop-browser evidence; that is not physical-device acceptance.

## Privacy and Back behavior

Search runs locally and fetches only fixed same-origin packages. Queries are absent from those requests and their referrers. The application stores no search history, sends no analytics and does not read private notes for search.

Back and reload use the current query/method in the URL fragment via `replaceState`. A browser can retain that address in its normal history. The criteria file carries this clarification additively; this candidate does not claim that the browser stores no URL. No private reflection is put in a URL.

## Delivery protection

The library's complete module closure, generated bundle, root page script pin and offline inventory were updated. The exact previous Daily entrance change is checked against the PR70 base; a separate narrow before/after record covers only `index.html`, `library/app.mjs` and `library/library.css`. The preservation test still checks the prior application outside those explicit scopes. All other module closures and original reader code remain frozen.

The offline inventory contains 103 exact assets. It includes the new metadata and code, not the full research corpus. The fixture-copy and offline-inventory tests name the precise added files so a missing new dependency cannot be hidden by a broad exception.

### Offline defect found and repaired

The first actual offline search run failed. The service worker correctly returned cached source bytes, but its Response URL carried the single `glp_release` cache marker. The new loader had required raw URL equality and therefore withheld valid offline data.

The correction allows only the same origin and exact source pathname, without credentials, hash or redirect, and either no query or a single `glp_release` entry containing 1–96 ASCII letters/digits/dot/underscore/hyphen characters, beginning with a letter or digit. Foreign paths, foreign origins, duplicate markers, other parameters, blank markers and oversized markers are rejected. Full crosswalk and source byte hashes are still mandatory. This exception is a transport rule, not an alternate authentication method.

The final fresh-browser run observes the worker's actual release-marked response, reloads offline, searches, opens the existing Kabir reader, and returns with Back. The separate failed-update regression retains its previous working release and synthetic learning when a candidate bundle is missing or corrupted.

## Evidence and review order

Review the source scope and freeze independent acceptance criteria before reading builder results. Builder evidence is in `evidence/explore-complete-passages/`; existing shell and failed-update regression reports remain in their respective evidence folders. The new workflow reconstructs the full source packet outside the repository and retains receipts and browser evidence, including failures. It runs against the exact pull-request head and has no deployment permission.

Earlier failures are retained:

1. The first adapter attempt used the M9 digest recipe for Knowledge and refused it. It was corrected to Knowledge's actual existing contract; no check was relaxed.
2. An initial local bundle attempt lacked the build dependencies at the assumed directory. The already-installed locked toolchain was connected from its real directory.
3. The first browser harness used a trailing separator twice in its server path guard and refused its own pages. The guard's root normalization was corrected.
4. The next negative-source check asserted the Read-card count before navigation completed. It now waits for the Read view and exact expected cards; the expectation remains unchanged.
5. The real offline Response-URL defect described above was reproduced and fixed.
6. The first standalone offline regression had no Playwright-downloaded browser on this Mac. It was rerun with the installed Chrome executable explicitly selected, without changing the test.

Physical iPhone/Safari/VoiceOver, printed-source collation, qualified review, release approval and Farid admission remain open. No production or preview branch was changed by this workstream.

## Integration note for the parent builder

Keep this separate from the Farid candidate while both are reviewed. Both candidates necessarily update the shared delivery inventory and integrity-test inventory. Combining them requires reconstructing the exact union of source graphs, page policies and offline assets, then rerunning the combined guards. Do not select one candidate's generated worker or policy wholesale and discard the other's additions.
