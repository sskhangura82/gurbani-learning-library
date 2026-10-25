# GLP-001 · Pauri 13: web-text corroboration of the frozen Gurmukhi

**Research-only addendum, 24 October 2026 Pacific. NOT edition certification, NOT a scripture change, NOT a family release.**

## Narrow finding

The existing frozen occurrence `pauri13.line01` is on Ang 3 of Sri Guru Granth Sahib Ji and carries source SHA-256 `b5b6448d48770ad74e695ff84fa87f0705fd528688297468c1bda066e1288a44`.

Its exact Gurmukhi as already stored is:

> ਮੰਨੈ ਸੁਰਤਿ ਹੋਵੈ ਮਨਿ ਬੁਧਿ ॥

A new *read-only web corroboration* compared this exact NFC Unicode string against public Ang 3 transcriptions retrieved by HTTPS. The first line matched **3 of 3** accessed domains. Each of the **six Pauri 13 lines** matched **at least 2 of 3** domains. No source text was edited or normalized in the application.

| Web reference | Exact-match scope under simple HTML extraction | Interpretation |
|---|---|---|
| [SriGranth — Ang 3, line 6](https://www.srigranth.org/servlet/gurbani.gurbani?Action=KeertanPage&I=21743&K=3&L=6&Lang=1) | First line 1/6 | The page is a line-focused view; absence of other lines under this extraction is **not** a textual disagreement |
| [Siri Guru Granth — Ang 3](https://srigurugranth.net/0003.html) | All six lines 6/6 | All six source substrings matched literally in NFC Gurmukhi |
| [GurbaniTabs — Ang 3](https://www.gurbanitabs.com/angs/3/%E0%A8%85%E0%A9%B0%E0%A8%97-%E0%A9%A9) | All six lines 6/6 | All six source substrings matched literally in NFC Gurmukhi |

**Method and custody.** `tests/capture-pauri13-web.py` retrieves only these named public HTML pages (HTTPS/HTTP 200, size-bounded, no private data), records each full-page SHA-256 *receipt* and positive exact matches after entity decoding, HTML-tag removal and NFC/whitespace normalization. It does not write to `js/`, modify the canonical passage or scrape translations. The page-byte digests in `evidence/pauri13-web-corroboration.json` are time-of-retrieval receipts, **not** eternal expected hashes for dynamic websites. `tests/pauri13-web-corroboration.mjs` offline-checks the receipt against all six unchanged Gurmukhi occurrence IDs/source SHA-256s. CI tests do not fetch third-party sites.

## What this does NOT prove

Three domains can share the same database, edition, spelling normalization or editorial assumptions. Exact digital agreement is **not three independently collated SGPC/physical editions**; machine-success here is **web corroboration**, not independent religious-source certification. A web page's failure to yield exact text after simple parsing is not evidence of an alternate scriptural reading. The prior apparent corrupted source-comparison line must be investigated separately; no frozen original should be replaced because of it.

**Required release gate remains OPEN:** independently selected authoritative SGGS source edition with exact Ang and line identification, full original-line collation and human Sikh/Punjabi reviewer adjudication. Founder product approval remains separate from that scholarly decision. Original scripture, 385-line reader, bilingual drafts, learning records, GitHub main, service workers and family URL were not touched by this research packet.
