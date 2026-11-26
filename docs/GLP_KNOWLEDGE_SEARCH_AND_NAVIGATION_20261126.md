# Knowledge search and reading navigation — 26 November 2026

## Purpose and scope

This candidate repairs the knowledge pilot's inaccurate retrieval and incomplete reading navigation before the collection expands. It is based on source-registry commit 94f004a842eb1bdf2da879074c2f4c701d54030e (PR48). The existing PR40, PR45, PR47 and PR48 review commits remain unchanged.

The runtime still contains three selected Saloks, nineteen source occurrences (seventeen verses and two headings), and the existing teaching drafts. The source JSON, source lock, editorial JSON and original scripture strings are unchanged. This candidate does not deploy, import further scripture, or confer human approval.

## Resulting behavior

- Exact indexed names and optional narrow question frames replace arbitrary substring matching. NASA cannot become Asa, category cannot become ego, and "psychology of colour" cannot become the psychology study.
- Gurmukhi word/phrase queries use complete tokens in one source occurrence, preserving order and combining marks. Punctuation-only, numeral-only closure marks, one-letter snippets and interior-word fragments do not produce text results.
- Automatic mode tries complete Gurmukhi words before beginning-of-line initials within the active passage filters. Explicit Start and Anywhere modes are distinct.
- Literal independent vowels and vowel-carrier initials retrieve the same occurrence. Nukta-bearing consonants remain distinct. NFC normalization and Latin diacritic handling apply only to retrieval copies.
- Ang references accept Arabic and Gurmukhi numerals and common labels. Indexed composition references distinguish Kabir Salok 7 from Asa Di Vaar Pauri 7 / Salok 2.
- Every direct text/initial result carries exact occurrence IDs. Related-topic results are labelled as relationships, with no invented literal-line match.
- Opening a text result shows the complete selected Salok, selects its matching line, and moves visual and keyboard focus there.
- Individual items, selected lines and explanation depths have hash addresses. Old passage/row identities resolve through the existing crosswalk. Unknown lines and cross-passage line combinations are refused explicitly.
- Browser Back/Forward and reload preserve the current item, depth and reading position. Each history entry has its own position key. Same-document new line links reveal their target.
- Query text is not placed in URLs, local storage or network requests. Native session-history state contains reading routes/positions only.
- The author directory has a direct Bhagat Kabir Ji entrance and states its current pilot coverage.
- Source-passage labels no longer call the Guru's words a development draft; the opening status distinguishes source-file checks from qualified review.
- Scoped Git attributes enforce LF for knowledge JSON and module files whose bytes are pinned.

## Independent technical counterexamples addressed

A separate read-only agent examined the implementation before opening builder tests. Its counterexamples exposed and led to corrections for:

1. Dropped consonant nukta in first-letter indexing.
2. An excluded author's word match suppressing selected-author automatic initials.
3. Unknown requested line IDs being silently ignored.
4. Lost Back/Forward/reload reading positions.
5. Fresh same-document line links remaining offscreen.
6. Focus remaining on the containing article instead of the selected line.
7. Scroll positions colliding between separate history entries with the same navigation depth.
8. A reload inside the debounce window losing the position.

The reviewer independently reran the original counterexamples. This is technical AI cross-review, not Claude's independent verdict, human scholarship or iPhone/VoiceOver acceptance.

## Builder verification

- Existing knowledge contracts: 14 passed.
- Source registry contracts: 29 passed.
- New retrieval contracts: 29 passed, including manually transcribed expectations for all 17 verses and separate checks for both headings.
- Exact source witnesses: 19/19 occurrences still match the same four pinned files.
- Existing desktop Chromium scenarios: 15 passed.
- New desktop Chromium scenarios: 18 passed, at 390px and 1440px widths.
- Original scripture and editorial content remain unchanged.

Evidence: evidence/knowledge-search/contracts.json, browser.json and claude-matrix-rerun.json. Existing source evidence remains in evidence/knowledge-registry/.

The builder also reran Claude's frozen 582-example search matrix, using the existing old-to-new ID map and preserving all expectations. Result: 575/582. Every original first-letter case, Ang case, curated-name case, negative case, phrase-boundary case and author-filter case now passes. Seven additional vocabulary/association suggestions remain unsupported: egoism, pride, hankar, ahankar, simmal, simmal tree and grace. These need explicit editorial decisions and, where applicable, qualified vocabulary/meaning review; this report does not call R3-13 complete.

The frozen input matrix SHA-256 is dabb2b6b64238c419a10a6b5863b5210f64465e25322bafd16fd952c985f2b22. The reproducible adapter is tests/knowledge-search-review-rerun.mjs; it reads the review evidence without changing it.

## Provenance for retrieval conventions

The independent-vowel groups follow the primary implementations inspected at:

- https://github.com/shabados/gurmukhi-utils/blob/3.2.2/lib/firstLetters.js
- https://github.com/shabados/gurmukhi-utils/blob/3.2.2/lib/accents.json

Groups are ੳ/ਉ/ਊ/ਓ, ਅ/ਆ/ਐ/ਔ, and ੲ/ਇ/ਈ/ਏ. This is retrieval behavior, not a change to how scripture is spelled or pronounced. No upstream code was copied wholesale.

Start/Anywhere distinctions are also described by the BaniDB API specification:
https://github.com/KhalisFoundation/banidb-api/blob/dev/swagger.json

Complete-word boundaries, narrow question framing, minimum input length and automatic fallback are GLP product choices. They are not claims about religious authority or every other search implementation.

## Remaining work

Claude should evaluate this exact candidate under the findings-first protocol. R3-05, R3-06, R3-09, R3-14 and the scoped line-ending repair are ready for re-test; R3-13 is partial. This candidate does not resolve the Haumai lesson's omitted clause, Punjabi parity, dictionary scholarship, comparison coverage or other editorial findings.

The full library, rights-cleared audio, new Bani intake, production cross-reader links, offline support for this pilot and qualified review remain separate work. The prototype's browser checks do not establish behavior on a physical iPhone, Safari Home Screen installation or VoiceOver.

## Reproduction

Run the existing contracts, then:

    node tests/knowledge-search.mjs
    node tests/knowledge-search-browser.mjs
    node tests/knowledge-search-review-rerun.mjs /path/to/k3_02_search_matrix.json

For a locally installed browser, set CHROMIUM_PATH. CI installs its pinned Playwright browser. Search and browser evidence is collected by the knowledge QA workflow.
