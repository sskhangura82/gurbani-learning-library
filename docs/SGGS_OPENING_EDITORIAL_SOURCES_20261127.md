# Opening SGGS explanations: source and editorial record

Authored for the continuation work begun on 2026-11-27. The source inspection and this record were completed on **2026-11-28 UTC**.

## Scope and status

`collections/source-reader/lesson-data.mjs` contains two new bilingual explanatory drafts. Its 36 English/Punjabi paragraph pairs span seven sections and three depths. Each paragraph identifies its actual source rows and any named commentary witness. These explanations are not a replacement translation.

Both entries have revision 1, `AI_ASSISTED_DRAFT`, and actual second-review status `PENDING`. `COMPLETE_DRAFT` means that the authored section coverage is complete in both languages at every depth. It does not mean that an independent reviewer has approved the meanings. No Claude review receipt has been invented, and no mandatory qualified-human review gate is introduced.

The earlier application drafts were background reading only. No old lesson object, edition binding, review status, saved note or progress record is imported or migrated. Comparative religious expansion is deferred. The optional psychology link is a separate question about intellectual humility, not proof of a theological claim or a definition of Hukam or Haumai.

## Exact original-text binding

Edition: `shabados-5.0.0-next.0-SGGS-SSA2`.

The original rows were read directly from the admitted local manifest and `collections/source-data/sggs/chunks/c0001.json`. Every displayed unit remains complete; this module changes no original text or source metadata.

| Binding | SHA-256 |
| --- | --- |
| SGGS manifest | `04da157b5e7ba85ce0fe35aae983baba3284bc75990be374e556ab3c52da5def` |
| DMP complete unit | `ae2d9ba49508ddb5b05c818c55925fa7e51c9067aa62a26f00730c4babcd6566` |
| LLL complete unit | `55bd7530247d2464e0cde6eac490588557c8f1676d3e618737d7006dce4d6eab` |

The unit digests are for the canonical unit serialization defined by the existing reader contract. Both units have source-reported page 1, section `1DSA`, and author `NANK`. Their source section orders are 1 and 2.

| Lesson / section | Exact ordered row IDs |
| --- | --- |
| `lesson.sggs.dmp.r1` / opening invocation | `0NVY` |
| DMP / Jap heading | `RBP6` |
| DMP / opening Salok | `J92N K0U6` |
| DMP / Pauri 1 | `BL70 GJW9 ZERL 9MN2 MK1Q H0PC` |
| `lesson.sggs.lll.r1` / forms and life | `60LK UVSL` |
| LLL / contrasting conditions | `GLXS P2VG` |
| LLL / understanding and Haumai | `MX4P FKUU` |

DMP is not labelled as though all ten rows were Pauri 1. Its four subdivisions describe the actual material in that provider group. The opening-row label Mool Mantar does not purport to settle every tradition's recitation boundary.

## Sources actually inspected

These links identify the consulted publications. The external bibliography is not the byte-verification mechanism; the admitted local source objects and digests provide that binding.

| Source | Passage inspected / role |
| --- | --- |
| [ShabadOS bibliography](https://www.shabados.com/docs/database/sources/) | Original-work notice and SGGS bibliography; distinct punctuation and translation listings. |
| [Darpan, Ang 1](https://www.gurugranthdarpan.net/0001.html) | Opening through Pauri 2; lexical and interpretive notes for `BL70 H0PC P2VG`. |
| [SriGranth, Ang 1](https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=1) | Original rows and default English; `BL70 GLXS` checkpoints. |
| [SriGranth credits](https://www.srigranth.org/guru_granth_sahib.html) | The Sant Singh Khalsa entry identifies the default English translator. |

The rights/custody evidence for the original collection remains in [the original-source notice](SHABADOS_ORIGINAL_SOURCE_NOTICE_20261127.md) and [the collection handoff](SHABADOS_ORIGINAL_COLLECTIONS_HANDOFF_20261127.md). A public-domain original-text notice does not confer permission to reproduce modern translations or commentary.

No modern translation, complete commentary passage or downloaded commentary page is added to the repository. The explanation is newly composed around the original rows, with a small number of explicitly attributed interpretive checkpoints. The modern prose is not presented as scripture.

### Bounded commentary use

The named-checkpoint locations are:

- DMP / `pauri-1` / `simple[0]`.
- DMP / `pauri-1` / `detailed[4]`.
- DMP / `pauri-1` / `deep[0]`.
- LLL / `different-conditions` / `detailed[0]` and `detailed[1]`.

The whole cited paragraph pairs, including independent framing sentences and both languages, total **156 whitespace-delimited words for Darpan** and **157 for SriGranth Ang 1**. Including those sources' labels and locators across both lessons gives **182** and **180** respectively. The short source-identification entries in this record keep each page's derived material below its 200-word allowance. Repeated retrievals of the same page were not treated as new allowances. No modern prose quotation is used; Gurmukhi source words come from the original.

## Editorial decisions and pending checks

The opening-term disagreement remains visible instead of being combined into a purportedly single literal reading. The written-ordinance and wandering clauses receive positive explanations as well as interpretation limits. The draft distinguishes a theological account of Hukam from a claim that an identifiable person deserves harm. It does not infer permission for abuse, withholding help, passivity or loss of personal dignity from these rows.

Before recording any actual second review, ask Claude to check the exact lesson bytes against the cited passages and original row IDs. The review should address English/Punjabi parity, the opening invocation's scope, the distinct `ਸੋਚੈ` readings, `ਲਿਖਿਆ ਨਾਲਿ`, `ਹੁਕਮਿ ਲਿਖਿ ਦੁਖ ਸੁਖ ਪਾਈਅਹਿ`, `ਸਦਾ ਭਵਾਈਅਹਿ`, and the conditional movement from understanding Hukam to the speech associated with Haumai. In particular, distinguish what a named witness says from our own explanatory or practical inference. Corrections should identify the affected paragraph and supporting passage; passing a software check is not semantic approval.

## Verification recorded here

After the final clause revisions:

- `node --check collections/source-reader/lesson-data.mjs` passed.
- `node tests/gurbani-learning-contracts.mjs` passed all eight contracts. These include actual complete-unit admission, all six language/depth choices, exact row ownership, hostile cross-edition/repinned inputs, truthful review status, and restricted citation/psychology destinations.

Browser rendering and branch-wide integration results belong in the continuation handoff; this record does not claim to have completed them.
