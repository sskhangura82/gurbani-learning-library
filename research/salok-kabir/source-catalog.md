# Salok Bhagat Kabir Ji — selected source research

26 November 2026 · AI-assisted source research · qualified human approvals: 0

## Frozen selection

The selected collection has **243 consecutively numbered Saloks**, all with two original verse occurrences, from Ang 1364 through 1377. The collection title comes **before** the invocation. Six additional Mahalla headings are retained in their original positions, giving **494 selected original occurrences: 486 verses and eight headings/invocation occurrences**.

The pinned Open Granth raw span contains 495 occurrences. One previously quarantined foreign occurrence at Ang 1377, row 2, is explicitly excluded from this proposed Kabir collection and retained with its original locator in the selection's quarantine record. This selection does not silently relocate it, erase the frozen witness, or close the PR50 canonical discrepancy. The companion discrepancy workstream records further page-layout and upstream metadata evidence.

`source-selected.json` is frozen for authoring. Its status remains a research selection pending discrepancy adjudication and qualified review; it is not a publication permission. Any subsequent adopted source choice belongs in a separate ledger and derived application pack.

## Structure and identities

- Collection heading: Ang 1364, source row 19, printed line 10.
- Invocation: Ang 1364, source row 20, printed line 10.
- First verse: Ang 1364, source row 21, printed line 11.
- Final verse: Ang 1377, source row 26, printed line 14; terminal number 243.
- Following composition: the Farid collection heading, Ang 1377, source row 27.
- Cross-Ang Saloks: 10, 29, 67, 104, 141, 159, 177, 195, 213 and 231.
- Unit identities: `sggs.salok-kabir.salok001` through `sggs.salok-kabir.salok243`; each has `.line01` and `.line02`.
- Explicit Mahalla headings have their own occurrence identities attached to the immediately following numbered Salok. Row, Ang and printed line remain separate source locators.

## Attribution

| Explicit heading | Immediately following Saloks |
| --- | --- |
| Mahalla 5 | 209, 210, 211, 214, 221 |
| Mahalla 3 | 220 |

The heading is not automatically carried over later unheaded Saloks. The named voices in 212/213 (Namdev and Trilochan) and 241/242 (Namdev and Ravidas) are also recorded separately from author identity. A signature or dialogue name is insufficient to force a canonical author assignment.

Professor Sahib Singh's commentary on Ang 1377 treats 212/213 and 241/242 as Kabir's compositions referring to those Bhagats. That is a named interpretive position, retained for review rather than disguised as an explicit scriptural author heading. The selection therefore preserves collection context and explicit Mahalla evidence while leaving final canonical author IDs unassigned.

Attribution references:

- Original headings and sequence: https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=1375&g=1&h=0&k=0&p=0&r=0&t=0
- Original continuation: https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=1376&g=1&h=0&k=0&p=0&r=0&t=1
- Limited named interpretation check: https://www.gurugranthdarpan.net/1377.html
- Secondary structural corroboration of 237 Kabir-context, five Mahalla5 and one Mahalla3 Salok: https://sikhwisdom.org/GGSJ%20Di%20Bantar/salok/

## Comparison with a second digital display

All **494 selected occurrences align by Ang and order** with separately retrieved SriGranth page text. **492 match exactly**. The exact comparison does not normalize punctuation, Unicode or glyphs.

1. The Open Granth opening title ends with danda punctuation; the SriGranth displayed title does not. The following Farid heading, outside this collection, has the same punctuation difference.
2. Salok 177, first verse, uses **U+0A01 GURMUKHI SIGN ADAK BINDI** after `ਗਈ` in the selected source, while SriGranth web extraction contains private-use **U+F03D** in that position. All other characters of that verse agree. This audit does not establish glyph equivalence.

Thus **485 of 486 verse strings match exactly**. The remaining comparison is an encoding/glyph issue requiring separately recorded evidence or a declared witness choice. Do not claim all 494 selected strings match exactly. The source selection itself remains unchanged.

The source audit preserves the exact primary and secondary strings, their hashes, source locators, retrieval references and comparison result for every occurrence. The second display is not proof of independent manuscript lineage, and the web-extracted comparison is not a raw-HTML or physical-saroop collation.

## Deliverable files

- `source-selected.json`: frozen original Gurmukhi, units, locators, boundaries, headings, attribution evidence, quarantine record and witness hashes.
- `source-witnesses.json`: all 14 raw witness byte counts, SHA-256 and Git blob fingerprints.
- `source-secondary-v1.json`: separately retrieved original Gurmukhi display rows, URLs and tool references; no modern translation prose.
- `source-audit.json`: complete 494-occurrence exact-string comparison and its two differences.
- `source-catalog.md`: this explanation.

The `witnesses/` and `tmp/` directories are temporary research inputs. They include raw upstream files containing modern translations and must not be copied into the application or committed as selected source. The extraction helper is a temporary research tool rather than the application builder.

source-selected.json SHA-256: `e4649489194a7842a7bfb4bd06d69308a15b8ab79c0dfc455740011717d5af05`

source-witnesses.json SHA-256: `7cd4c93b27b07d3a541947f1eb9245a52d7241a19a4e7b35dd98783fe74d0b00`

source-secondary-v1.json SHA-256: `787466e2c14f61c8f9d9de374c0f4dd92f3710c6ac002617b7d9182669b71693`

source-audit.json SHA-256: `d6c278185132c70f624f90b72109477df38623e0dea37f41224f18bad956bfec`

Ordered original text SHA-256: `0b313346222ccc4363ae8feb37a06e01387c5fe8b928de7d9e8c5eb69ae14c6d` (UTF-8 strings joined with LF; no final LF).
