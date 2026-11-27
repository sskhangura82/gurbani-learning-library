# Original-text source notice

The new SGGS and Dasam source readers use exact original-text records from **Shabad OS Database 5.0.0-next.0**, a named digital edition. Shabad OS and its contributors are credited for the database, source bibliography and correction work. Existing reader editions remain separate.

## Rights basis

The release's README has a separate **Gurbani and Panthic Compositions** notice. It identifies the historical original texts as public domain and calls for preserving their wording and dignity. This is the basis for the original-text projection. The package's MIT software license is recorded separately and is not treated as a license to reproduce modern translations, commentary, recordings, scans or book layouts.

Only the `primary` original-text rows of `SSA2` and `DGDG` are projected. Exact Unicode, punctuation, source headings and source ordering remain unchanged. No translation, note, transliteration, audio, English section description, image or PDF is included. Provider names and bibliographic facts identify the edition; they are not imported scripture explanations.

The exact notice artifact is `package/README.md` inside the publisher's [5.0.0-next.0 npm archive](https://registry.npmjs.org/@shabados/database/-/database-5.0.0-next.0.tgz). Its SHA-256 is `cacf8c7e24899b1202170b6fceedd4547fe4b09c78711f016cc7c4ee8613f795`. The [current official source notice and bibliography](https://www.shabados.com/docs/database/sources/) provide a readable reference; reproducibility is bound to the exact release artifact rather than the changing website.

## SGGS source bibliography

The release identifies **Shabadaarth**, volumes 1–4, SGPC, Sri Amritsar, 2009–2012, as its SGGS original-text source. The primary asset is `SSA2`, within source `SGGS`. Its separately listed modern translations and reading aids are excluded.

The extraction contains every original record and complete source group in that named asset. Printed Ang labels, source groups and author names remain source-reported metadata. They do not establish independent manuscript collation or settle individual attribution. In particular, the source's Raagmala author field and known Farid location discrepancy are preserved as provider metadata; no canonical attribution or Ang correction is silently applied.

## Dasam source bibliography

The release's Dasam bibliography combines several sources:

| Scope recorded by the publisher | Bibliographic source |
| --- | --- |
| Jaap, the identified Tav-Prasad Savaiye and Chaupai selections, the closing Savaiya/Dohira of Chaubees Avtaar, and the first Pauri of Vaar Sri Bhagauti Ji Ki | *Nitnem Te Hor Baniaa(n)*, SGPC, Sri Amritsar, May 2017 |
| Shabad Hazare Patshahi 10, Akal Ustat, Bachittar Natak, the two Chandi Charittar compositions, Vaar Sri Bhagauti Ji Ki, and Gyan Prabodh | *Das Granthi*, SGPC, July 2014; also the March 2006 edition |
| Zafarnama | Piara S. Padam, *Zafarnama*, sixth edition, Singh Brothers, Amritsar, September 2013 |
| Remaining material | *Dasam Sri Guru Granth Sahib Ji*, volumes 1–2, Baba Teja Singh Ji Nihung Singh Mehron Wale, Moga, 2011; and Eshar S. Ramgarhia, *Dasam Sri Guru Granth Sahib Ji Shiromani Steek*, first edition, volumes 1–6, the same publisher, Vaisakhi 1999 |

The database labels all selected Dasam originals with asset `DGDG`, whose brief asset reference says *Das Granthi*, SGPC, July 2014. That coarse label does not establish that every line comes from one SGPC print edition. The more detailed release bibliography must remain visible. Its composition-level citations do not provide a separately authenticated print-page witness for every line.

All 17 Dasam source sections are included, through Charitropakhyan, Zafarnama and Hikayat. This is complete coverage of the release's `SDGR`/`DGDG` original asset; it is not a claim to include every manuscript variant or establish a critically collated canonical edition. Every group carries the upstream `GGSN` author label. Preserve that as **source-reported attribution**, without claiming that extraction adjudicates historical authorship of every composition.

The source group `9QK` has fourteen decreases in reported page labels within its otherwise consecutive line order, including transitions from 158 or 159 back to 155. These values remain unchanged. Reading order follows the source's explicit group and line order, never a sort by these page labels. The SGGS source likewise retains the known `G4W` printed-line decrease from 19 to 1 on reported page 1377. These observations are recorded in `locator-anomalies.json`; they are not silent page corrections or a claim that the complete edition has been collated against print.

## Artifact identity and limits

The npm archive SHA-256 is `839fa79860804550ca7e654f9ccdef3889451a7a95626e6c99466c6fc1b902b2`; its published SHA-1 and SHA-512 integrity values matched. The extracted `master.sqlite` SHA-256 is `517890c7e7c2f3dcef7f21b51d074a581b8eded4ebe14c504b84ea075ff16aeb`.

The npm registry reports Git head `693f879e2d00d192abaa77f53d61328e47cdbb2d`. The corresponding README URL in the old GitHub repository returned 404 during this preparation. It is therefore retained as registry-reported metadata, not asserted as a verified Git object. The actual archive, database and notice hashes identify the inspected artifacts independently of that unresolved link.

Full extraction checks establish faithful copying of this digital edition. They do not constitute an independent historical review, printed-source collation, a new license for excluded modern material, or a release decision.
