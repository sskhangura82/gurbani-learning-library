# Nitnem: complete reading and educational draft coverage

Open the [Nitnem collection](https://sskhangura82.github.io/gurbani-learning-library/nitnem/index.html) from the existing library home. It requires no account or ChatGPT subscription.

## Included readings

| Bani | Reading scope | Additional-reader records | Passage studies |
| --- | --- | ---: | ---: |
| Japji Sahib | Existing complete reader: Mool Mantar, opening Salok, 38 pauris and closing Salok | 385 in the existing reader | 42 existing |
| Jaap Sahib | All 199 chhands, with original preface and metrical headings | 782 | 199 |
| Tav-Prasad Savaiye | Ten Savaiye beginning Sravag Sudh | 40 | 10 |
| Benti Chaupai Sahib | 25-pauri section followed by four visibly marked additional pauris | 116 | 29 |
| Anand Sahib | All 40 pauris | 208 | 40 |
| Sodar Rehras Sahib | The six-part selection described in SGPC Rehat Maryada | 159 | 44 |
| Kirtan Sohila | All five shabads | 56 | 5 |

The six newly integrated readers therefore contain 1,361 stored source records, 1,361 English/Punjabi meaning pairs and 327 passage studies. Source records are an editorial storage unit, not a universal verse count: 27 Rehras records aggregate several verse lines. Their explanations are labeled passage context. Separate prefatory and metre headings are preserved without inflating the table's record count.

The collection presents the familiar five morning banis, evening Rehras and night Sohila. The SGPC Rehat Maryada's morning list and its initiation instructions should not be conflated. Its Rehras description establishes the six-part selection and the ending of the 25-pauri Chaupai section; it does not make this app's additional four Chaupai pauris universal. Ardas is a separate accompanying prayer, outside these seven readers.

## What was recovered and completed

The latest generated V16 course was recovered from repository history, rather than replaced by an older tracked version. It already contained 1,039 bilingual meanings and 247 studies. Completion adds Jaap Chhands 121–199 (316 meaning pairs and 79 studies) and Anand Pauri 24 (six meaning pairs and one study). All 80 new studies have bilingual close readings, contextual focus, vocabulary glosses, interpretation notes, reflections and teach-back questions. Earlier detailed studies are chiefly English, with bilingual line meanings and passage summaries.

The earlier 1,039 meanings and 247 studies are preserved except for individually documented source-related rebindings, two paired Chaupai/Rehras meaning refinements and vocabulary corrections. The existing Japji and complete Sukhmani scripture, teaching and saved-learning implementations remain intact.

## Source selection and corrections

The source audit identifies each digital witness, its retrieval or pinned commit, and the scope of comparison. Twelve existing source occurrences have explicit before/after Gurmukhi and hashes: Jaap 177.4; two Savaiye words; Anand 24.3; and four Chaupai corrections repeated in Rehras. No silent global spelling normalization is applied.

Jaap's selected reading was collated against direct BaniDB. Its introductory `ਤੇਰਾ ਜੋਰੁ ॥` retains the existing saved-line ID but is displayed before the Chachari metre heading, as in the selected witness. A duplicated website title was removed from the prefatory source sequence; the composition title remains in the interface. Anand's font-specific private-use character is replaced by the exact pinned Open Granth reading, also matched by the selected BaniDB text. SriGranth and Darpan's font-specific rendering is not claimed as evidence for that Unicode conversion.

The narrow Savaiye and Chaupai corrections are supported by inspected printed-source pages and the direct provider. Other documented readings are retained as variants rather than silently harmonized. Rehras SGGS records now have checked Ang/range locations, including the two records that cross an Ang boundary. Dasam passages use work/section references and are never assigned fictitious Guru Granth Sahib Ji Angs.

The frozen proposed-pack hashes describe the source auditor's artifacts. Runtime packs add release metadata and earlier edition aliases; a separate runtime-source receipt verifies that their complete source payloads remain equal.

Research records are in [research/nitnem/20261125](../research/nitnem/20261125/), particularly the source audit, source amendments, unit boundaries, teaching-rebinding review, independent editorial reviews and runtime-source receipt. Explanations are original educational paraphrases, with named sources and explicit interpretive choices. Modern prose translations are not imported.

## Saving, backup and offline use

Each bani keeps its reading position, preferences, bookmarks and reflections in the browser. The saved-lines list returns to the exact bookmarked or annotated record. Reflection editing is coordinated across tabs; writes merge explicit edits with the latest stored record. A damaged, unknown or newer saved record is kept unchanged. Reading remains available and the unchanged record can be exported for recovery.

Import merges bookmarks and reflections. Distinct notes on the same line are both retained; an oversized conflict refuses before making a change. Imports retain the current reading position and settings. Earlier documented Nitnem edition backups are accepted through explicit edition aliases. Japji and Sukhmani learning use their existing separate stores.

The root service worker caches the seven Nitnem readers and the existing library assets, including Sukhmani. The first online visit must finish preparation before offline reading is available. Updates wait for a user action; an open reflection is saved before the app reloads. Browser storage is not a durable backup, so readers can export their learning as a JSON file.

On iPhone, open the library in Safari, tap Share and choose Add to Home Screen. Share the public library URL with other people; their learning stays on their own device.

## Verification and review status

Source, coverage and preservation contracts run in Node. Browser acceptance checks render the actual Gurmukhi and teaching, exercise small and large layouts, learning migration and merging, and offline navigation. The quality-gate workflow retains exact-run reports and screenshots. The release pull request records the tested commit and publication checks.

AI source collation and independent AI editorial review are documented separately from qualified human review, which remains zero. These drafts are not a certified Gutka, a scholarly approved translation or santhiya. Physical iPhone, Home Screen, VoiceOver and actual airplane-mode acceptance remain distinct from automated Chromium tests.

The next requested addition is **Salok Mahalla 9**.
