# GLP-001 — Rehras Sahib and Chaupai source-adjudication packet

**25 October 2026. NONSHIPPING / SOURCE EDITORIAL REVIEW.**

This evidence may support a qualified Sikh/Punjabi original-source specialist. It does **not** transfer religious/editorial authority to an LLM, webpage, digital hash, automated test or the project founder alone. The working Full Nitnem Today hub links readers to external readings; none of the candidate original texts below are silently promoted into the family app.

## A. Official reference boundaries

The [SGPC Sikh Rehat Maryada, Article IV (English official PDF)](https://sgpc.net/wp-content/uploads/2025/06/Sikh-Rehat-Maryada-English-n.pdf) identifies six ordered groups for evening Sodar Rehras. Our candidate deliberately applies that **narrow named version**, not a claim that every Sikh community uses an identical gutka.

| Position | Source family | Source scope | Candidate unit count |
|---|---|---|---:|
| 1 | SGGS | Nine hymns starting So Dar, ending Saran Pare Ki Rakho Sarma | 9 hymns, 23 web paragraphs |
| 2 | Dasam Bani | Benti Chaupai, Hamri Karo through Dust Dokh Te Leho Bachai | 25 pauris, 100 original tuk records |
| 3 | Dasam Bani | Evening Savaiya beginning Pae Gahe | One source unit |
| 4 | Dasam Bani | Dohira beginning Sagal Duar | One source unit |
| 5 | SGGS | Original first five and 40th Anand pauris | Six original units, 32 verse rows |
| 6 | SGGS | Mundawani and Slok Mahla 5, Tera Keeta | Two units |

**Machine assembly:** `docs/research/n4-rehras-composite/rehras-sgpc-digital-composite-candidate.json` stores six explicitly named sections, **44 source reading units and 159 original Gurmukhi text records**, preserving exact Gurmukhi text, SHA-256, composition family, source locator and original source cross-references. The source-unit and full-candidate aggregate SHA-256 digests are verified by `tests/rehras-complete-sgpc-source.mjs`.

## B. Original web-text sources and digital source limitations

Rehras primary digital text: [Discover Sikhism Gurmukhi Rehras](https://www.discoversikhism.com/learn_gurbani/learn_rehras_sahib.html), 52 extracted Gurmukhi digital HTML paragraphs. The declared SGPC set uses its paragraphs **3–48**, inclusive, but uses **previously frozen original source candidates** for the Chaupai 25 and selected Anand pauris, to avoid accidentally mixing versions or silently normalizing source characters.

Second digital reference: [Gurdwaras.com Rehras](https://gurdwaras.com/nitnem/rehras-sahib), 531 independently displayed HTML Gurmukhi paragraphs (web document, **not proven independent printed edition**). The two pages can contain additional prayers and different original wording, so this is source evidence, not a definitive religious text. Current web receipts/digests are in `docs/research/n4-rehras-composite/rehras-sgpc-source-differences.json`.

The primary website has six extra original Gurmukhi HTML paragraph positions beyond the selected SGPC subset: **0, 1, 2 and 49, 50, 51**. Their page offsets, original lengths and SHA-256 digests remain recorded. We neither silently insert these verses into the SGPC-specific candidate nor claim these passages are inappropriate in all Sikh traditions. Each longer Rehras practice belongs in a **separately identified variant manifest** after qualified review.

The nine SGGS hymn selections currently use a *typed SGGS Rehras hymn locator*; they do **not claim independently authenticated exact SGGS Angs**, which must come from an independent printed/reference edition. Three mixed-source sections are SGGS; three are Dasam Bani. Dasam components never receive invented SGGS Ang numbers.

## C. Benti Chaupai: 25 versus expanded 29 pauri website variant

The SGPC Rehras **25-pauri excerpt** is pinned independently: `docs/research/n4-chaupai-excerpt/chaupai-sgpc-excerpt-candidate.json` (100 original tuk rows, source-family Dasam, exact occurrence hashes). Rehras **reuses those original bytes** rather than creating a different 'equivalent' text. Even the bounded SGPC excerpt has substantial differences between public web transcriptions; see its 49-item disputed-line ledger.

A second, longer **website-specific expanded Chaupai source** is stored separately at `docs/research/n3-chaupai-variants/chaupai-site-expanded-29-pauri-candidate.json`:

- The first **25 pauris / 100 original tuks** are exact copies of the separately pinned Rehras excerpt.
- Website original pauris **26–29 contribute 16 additional original tuks**, giving **29 pauris / 116 original rows**. Pauri 28's printed *Arill* heading and Pauri 29's printed *Chaupai* heading are preserved as distinct source-heading candidates, never duplicated as verses.
- A following Savaiya (four printed original lines) and Dohira (two lines) are preserved as **separate candidate postscript components**, not silently counted as Chaupai pauris; the devotional website signoff is *not* treated as a scriptural verse.
- Comparing the **16 additional original tuks** with the Gurdwaras.com longer page found **7/16 exact NFC matches**, **9/16 comparable after only the terminal verse numbers were removed for comparison**, and **7 unresolved spelling/text differences**. The full primary/secondary originals remain in `chaupai-long-short-boundary-ledger.json`.

**Critical decision not yet made:** the expanded website's 29-pauri/associated postscript format is not automatically the universally accepted *morning* Chaupai edition, nor is the shorter SGPC Rehras 25-pauri excerpt automatically the totality of all morning practice. A Sikh/Punjabi specialist must select and sign the named edition/tradition/boundaries and any reuse permissions. No automatic text harmonization is lawful for source custody.

## D. UI and tests

The existing R7 `js/continuous-core.js` now supports a **nonshipping, source-only mixed SGGS+Dasam Rehras adapter** in `tools/compositions/continuous-rehras-composite.mjs`. It enforces six source sections, immutable original lines, 44 correct units and no borrowed source publication flag. The local testing screen `tests/nonshipping-source-reader.html` offers direct navigation across all six sections, from So Dar to Tera Keeta, with the same original text, source hashes, silent progress and mobile layout. It does not install a service worker, store private notes or enable unapproved Meaning/Study content.

Tests: `tests/rehras-complete-sgpc-source.mjs` (source and 6-section composition); `tests/rehras-continuous-parity.mjs` (unchanged word guide, source-family boundaries, false Ang or fake authority refusals); `tests/chaupai-expanded-variant.mjs` (two scopes, separate numbered headings and original source hashes); actual isolated Mac Chrome `tests/nonshipping-source-browser.mjs` (**52 checks**, with new `nitnem-original-qa-rehras-320.png`). There is no native iPhone family reader in this source PR.

## E. Release gates

Independent original SGGS and Dasam printed/reference-edition collation, a qualified Sikh/Punjabi specialist's adjudication of spelling and variants, source rights, modern exegesis and translations, physical iPhone Safari/VoiceOver/offline approval, versioned worker integrity, rollback evidence, and explicit founder final publication authorization remain **OPEN**. The accepted Japji R7, working externally linked Full Nitnem Today hub, PR #21 access controls, browser learning and private family data are unchanged.

**Verdict:** SGPC-sequence *digital original source candidate structurally COMPLETE*; **NOT** an authoritative, source-approved, family-published Full Nitnem reader.
