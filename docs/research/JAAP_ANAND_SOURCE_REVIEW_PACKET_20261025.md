# GLP-001 — Jaap and Anand independent source-adjudication packet

**25 October 2026 — source-review candidates, not publication authority.**

This packet is for an independent human editor/collator with demonstrated Sikh scripture and Gurmukhi expertise. Its machine PASS results are software verification, **not** religious/linguistic approval. No candidate may self-attest its own source approval.

## Jaap Sahib — complete original digital candidate

- Source family: **Dasam Bani**. Never assign SGGS Ang identifiers.
- Primary captured digital original: [Gurdwaras.com Jaap](https://gurdwaras.com/nitnem/jaap-sahib). Secondary compared digital original: [Discover Sikhism Jaap](https://www.discoversikhism.com/learn_gurbani/learn_jaap_sahib.html). Different URLs do not prove independent editions or lineage.
- Source candidate `docs/research/n3-dasam-jaap/jaap-199-original-candidate.json`: 199 consecutively numbered chhands; **782 original website Gurmukhi verse paragraphs**, 21 separate digital metrical headings, and six separate prefatory rows. Every source original line carries occurrence ID, exact Unicode, SHA-256 and non-SGGS location.
- Comparison ledger `docs/research/n3-dasam-jaap/jaap-text-discrepancy-ledger.json`: **132/199 exact normalized Unicode matches across complete chhand groups**, after only whitespace differences and exact headings omitted from the second site's comparison. **67/199 differences are preserved individually**, including source text variants and meter-heading placement. The stored original is never auto-repaired. Exact numeric chhand order is 1–199 in both web transcriptions.

**Human review required:** select the named source edition, authenticate complete original text and 199 chhand sequence, adjudicate 67 comparison records in context (not only spelling similarity), approve each meter/chhand heading from the printed source, distinguish printed headings from recited text, and record publisher/license or public-domain reuse reasoning. There are NO approved modern translations or recorded timings in this candidate.

**Machine gate:** `tests/jaap-full-source-intake.mjs` and `tests/jaap-continuous-parity.mjs` validate 199 units, 782 SHA hashes, 21 distinct metrical headings and unchanged source bytes. The underlying existing continuous word engine can navigate any chhand without introducing fictitious SGGS Angs or migrating family notes.

## Anand Sahib — complete forty-pauri digital candidate with a deliberate stop

- Source: original SGGS Gurmukhi, Angs **917–922**, full forty-pauri morning composition. Do not swap this for the selected first-five-plus-fortieth Anand recitation within Rehras.
- Source candidate `docs/research/n2-anand/anand-40-original-candidate.json`: two original header rows and **208 original verse rows in 40 consecutively numbered pauris**; each exact original and source location SHA preserved.
- Two websites agree on **208/210** Ang-page digital rows. The first mismatch is a header terminator at Ang 917. The second is at original global row 123, **Ang 920, Anand Pauri 24, `anand24.line03`**: the primary digital transcription contains **U+F03D (private-use code point)**; the second transcription contains a different Gurmukhi combining form. The actual originals and both SHA-256 digests remain in `docs/research/n2-anand/anand-complete-text-candidate-ledger.json`.
- The source-review browser emits a prominent quarantine message *instead of displaying the unresolved Pauri 24 original glyph as approved text*, and its silent guide **stops at that line**. No automatic Unicode replacement has been made.

**Human review required:** inspect authoritative SGGS edition/source at Ang 920, confirm original matras and Unicode codepoints in that complete line and its context, reconcile header punctuation, approve an exact new source-edition snapshot rather than editing the old hashed receipt, and independently sign off original-source correctness. Do not infer religious approval from digital-web agreement.

## Full Nitnem reader and approval boundary

The local-only, nonshipping `tests/nonshipping-source-reader.html` has source screens for Kirtan Sohila, Tav-Prasad Savaiye, evening Rehras Benti Chaupai excerpt, full Jaap, and full Anand. It uses the **same existing pure continuous reader core**; Jaap/Anand render one source unit at a time, and original wording is never mixed with unapproved modern meanings. The browser proof is `evidence/nitnem-original-qa-browser.json` (**38 Mac Chrome checks**), including two additional numbered-chhand and quarantined-source screenshots. This proves engineering parity, **not** native iPhone recitation quality.

**Required approvals before family release:** edition authority, source collation, publisher/rights verification, qualified Sikh/Punjabi original and explanatory review, independent review of the new code/UX, real iPhone Safari/VoiceOver/airplane-mode acceptance, and separate founder publication authorization. The existing public Japji R7, the current working Full Nitnem Today external-links hub, saved learning and service worker have not changed.
