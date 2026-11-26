# Kabir intake discrepancy review

Prepared 26 November 2026. This is a source evidence review for a proposed collection selection, not qualified Gurbani review or authorization to publish.

## Decisions

| Frozen discrepancy | Evidence and decision | Formal status |
|---|---|---|
| `og-location-1377-row002` | Exclude **exactly** OpenGranth Ang 1377, ordinal 2 from the proposed Salok Kabir collection. It is the closing line of Farid Salok 2. Preserve its original bytes, hash and reported 1377 locator in the intake and sidecar. | Collection exclusion is evidence backed. Canonical locator and author fields remain unassigned pending authenticated edition and qualified review. |
| `og-location-0324-row001` | Keep the original 324 source locator and SriGranth's alternate 323 locator in the record. The inspected printed page and SikhNet PDF support **324**. This Gauri passage is outside the Salok Kabir collection. | Proposed 324 locator is supported; frozen quarantine remains unchanged. |

## Why the Farid line appeared among Kabir's Saloks

The exact upstream package, `@shabados/database` version `5.0.0-next.0`, was downloaded from its [npm tarball](https://registry.npmjs.org/@shabados/database/-/database-5.0.0-next.0.tgz). Its published SHA1 and SHA512 integrity checks passed. The extracted SQLite database was queried in read-only mode.

The upstream record has:

- Line ID `V41B`; line group `G4W`; group order `2`.
- Section `X63C`, named “Salok Fareed Jee”; section order `2`; author `FRID`, “Sheikh Farid”.
- Exact raw text `ਬੰਨੑਿ ਉਠਾਈ ਪੋਟਲੀ; ਕਿਥੈ ਵੰਞਾ ਘਤਿ ॥੨॥`.
- Asset `SSA2`, metadata page `1377`, line `1`.

Its same-group predecessor, `9RH3`, is order `1`, with page `1377`, line `19`. Thus the metadata puts the second line before the first if sorted by page and physical line. The [pinned importer](https://github.com/opengranth/open-granth/blob/34d2a7cab032c8ea24d21ff20f64653bd03766f4/scripts/import_shabados.py) uses that physical-line sort, explaining the misplaced entry inside the OpenGranth Kabir sequence. The original cause of the bad upstream page value is unknown.

The frozen OpenGranth text omits the ASCII semicolon because its [pinned normalization function](https://github.com/opengranth/open-granth/blob/34d2a7cab032c8ea24d21ff20f64653bd03766f4/scripts/transliteration.py) strips source pause punctuation. Reproducing that function for these two records produces the frozen text exactly. Neither the frozen strings nor the new reader source strings were changed by this review.

## Page images inspected

The Commons files are images of printed SGPC-labelled Saenchis. Both covers visibly name SGPC, Sri Amritsar. Commons identifies the uploader as Wikilover (WIR), with upload date 2 October 2019. The publishing date and an authenticated chain of custody were not established.

| Printed Ang | Commons file / one-based PDF page | Direct observation |
|---|---|---|
| 323 | [Part One, PDF page 331](https://commons.wikimedia.org/w/index.php?title=File%3AGuru_Granth_Sahib_Part_One.pdf&page=331) | Ends with `ਮੰਦਭਾਗੀ ਤੇਰੋ ਦਰਸਨੁ ਨਾਹਿ ॥੩॥`. |
| 324 | [Part One, PDF page 332](https://commons.wikimedia.org/w/index.php?title=File%3AGuru_Granth_Sahib_Part_One.pdf&page=332) | Starts `ਤੂੰ ਸਤਿਗੁਰੁ ਹਉ ਨਉਤਨੁ ਚੇਲਾ ॥`, then `ਕਹਿ ਕਬੀਰ ਮਿਲੁ ਅੰਤ ਕੀ ਬੇਲਾ ॥੪॥੨॥`. |
| 1377 | [Part Two, PDF page 663](https://commons.wikimedia.org/w/index.php?title=File%3AGuru_Granth_Sahib_Part_Two.pdf&page=663) | Kabir 231 proceeds to 232 without the disputed Farid line. Farid heading follows Kabir 243; Farid Salok 2 opens at the page end. |
| 1378 | [Part Two, PDF page 664](https://commons.wikimedia.org/w/index.php?title=File%3AGuru_Granth_Sahib_Part_Two.pdf&page=664) | Starts with the disputed Farid Salok 2 closing line. |

The [SikhNet Gurmukhi PDF](https://www.sikhnet.com/files/ereader/SGGS%20%5BGurmukhi%5D.pdf), inspected visually after local rendering, shows the same two relevant boundaries. It is a digitally typeset edition, not a photographed physical saroop.

SriGranth's [1377](https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=1377) and [1378](https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=1378) web displays support the Farid sequence. Its [323](https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=323) and [324](https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=324) displays place the Gauri line on 323 instead. That is a real reported-location difference; the continuous verse order agrees.

## Limits that matter for the build

The exact exclusion changes the bounded raw selection from **495 occurrences to 494**, retaining **243 numbered Saloks, 486 verse occurrences and eight headings/invocation records**. It is an explicit collection-membership decision, not deletion of scripture or a silent correction to PR50.

The images also show why this check must not be described as validating every page locator. Salok 231 begins on printed 1377 in these images, whereas the pinned OpenGranth file begins there with its second line. Salok 177 line 1 crosses the printed 1373/1374 boundary in these images. The proposed reader should distinguish source-reported Ang metadata from fully adjudicated canonical location.

Two supplemental differences were inspected for the source catalog:

- The title on printed Ang 1364 and in the SikhNet PDF has no terminal double danda; OpenGranth's title does. Preserve this as a witness difference. The parent build agent proposes the alternate heading without terminal double danda through an explicit overlay, retaining the original frozen string and both hashes.
- The nasal mark on `ਗਈ` is visible on printed Ang 1374, but a raster glyph cannot establish whether a web encoding should be Unicode `U+0A01` or a private-use code point. Preserve the pinned selected text; do not copy a private-use replacement into the reader merely to make strings match.

Different websites may share source data. OpenGranth and the examined ShabadOS package explicitly do. No independence claim is made for the other witnesses, and no human/scholarly approval has occurred. Saloks 241/242 were not reassigned to authors by signature words.

## Review artifacts

`intake-discrepancy-review.json` contains the full original frozen claims, exact source locators, retained text hashes, upstream rows, image URLs, artifact hashes and decisions. `discrepancy-witnesses/upstream-line-groups.json` contains the exact query and all 13 primary rows for the two relevant line groups.

Frozen manifest SHA256 remains `fd82b3f37c33437d02b3ae76f60f13a3b8241a58d10fe686b61c35a3ac49258a`. PR50 head remains `3af5ba739cd8bf5ab2d358d12704ad9e48452b1e`. No PR50, source-corpus, runtime, Mac-checkout or live-site changes were made by this review.

Large downloaded PDF/database files are research witnesses, not assets to bundle into the app. The small metadata extract, sidecar, and relevant page images are sufficient for a reviewer to reproduce the decision using the retained source URLs and fingerprints.
