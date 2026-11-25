# Sukhmani Sahib — first six Ashtpadis

Date: 2026-11-23 (Pacific)

Historical first-six checkpoint, frozen at commit `28337270a1f149b96882acf420cf7dcd5c8910ce`. The current continuation completes Ashtpadi 24; see [complete scope and evidence](SUKHMANI_COMPLETE.md). Counts below describe the original first-six checkpoint.

## What this change delivers

The existing Gurbani Learning Library gains `sukhmani.html`, a continuous reader for **Ashtpadis 1–6 of 24**. The home page links to it. The original Japji reader, its source text, existing meanings and saved-learning modules are unchanged. Later Nitnem branches are not merged or overwritten by this change.

This is a development preview with complete first-six source coverage and original editorial drafts. It is not the complete Sukhmani Sahib and it does not claim qualified human approval of scripture collation, pronunciation or interpretation.

| Included material | Count |
| --- | ---: |
| Ashtpadis | 6 |
| Introductory Saloks | 6 |
| Pauris | 48 |
| Pauri verse lines | 480 |
| Salok verse lines | 14 |
| Rahau verse lines | 2 |
| Original headings and invocation | 14 |
| Total source occurrences | 510 |
| English and Punjabi line explanation pairs | 510 |
| Passage study drafts (Salok, pauri and Rahau) | 55 |
| Ashtpadi introductions and vocabulary sets | 6 |
| Qualified human-reviewed explanations | 0 |

The 510 count includes headings. It must not be described as 510 verses. The first Salok is displayed as four verse lines, and each later Salok as two; all six Saloks are complete.

## Passage map

| Ashtpadi | Angs in this pack | Central teaching explored in the draft |
| --- | --- | --- |
| 1 | 262–263 | Remembrance of the Divine, spiritual peace, grace and the company of devotees; the Rahau provides a central refrain. |
| 2 | 263–265 | Naam as enduring support where wealth, status and worldly relationships cannot accompany a person. |
| 3 | 265–266 | Spiritual practice joined to Naam, humility and pure conduct; external observance and ascetic effort alone are insufficient. |
| 4 | 266–268 | Remembering the Giver, examining forgetfulness and hypocrisy, and turning to a prayer of dependence and grace. |
| 5 | 268–269 | Gratitude, the impermanence of possessions, responsible use of the senses, and integrity between words and conduct. |
| 6 | 269–271 | Recognizing bodily faculties and daily sustenance as gifts; remembrance and understanding themselves arise through grace. |

These are editorial descriptions, not added scriptural headings. The original sequence, punctuation, numerals, invocation and Rahau are retained.

## Source and comparison

The original Gurmukhi is extracted from [Open Granth](https://github.com/opengranth/open-granth/tree/34d2a7cab032c8ea24d21ff20f64653bd03766f4), pinned at `34d2a7cab032c8ea24d21ff20f64653bd03766f4`, corpus files Ang 262–271. Its provenance records Shabad OS `5.0.0-next.0`, the SGGS source and primary SSA2 asset, attributed upstream to Shabadaarth/SGPC (2009–2012). Modern English translations present in the upstream corpus are **not** shipped in this addition.

The selected text begins at `ਗਉੜੀ ਸੁਖਮਨੀ ਮਃ ੫ ॥` on Ang 262 and ends at `ਨਾਨਕ ਇਨ ਕੈ ਕਛੂ ਨ ਹਾਥ ॥੮॥੬॥` on Ang 271. The separate preceding Gurdev Salok on Ang 262 is outside this selected composition.

Each entry retains a stable occurrence ID, exact Unicode Gurmukhi, Ang, upstream line and record reference, its position in the composition, and SHA-256. The whole source sequence, joined with a single newline between occurrences, has SHA-256:

`0f732567f161ac7f5c5f1035c6c14147cd57ca98702197aea715f035f15ebdf6`

A separate retrieval of [SriGranth.org's Gurmukhi](https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=262&g=1&h=0&k=0&p=0&r=0&t=0), across Ang 262–271, matched **510/510 occurrences in order and Ang**. HTML-generated whitespace is collapsed in the comparison copy only; the original source strings are not normalized or changed. `evidence/sukhmani-source-collation.json` records URLs and retrieved-page hashes, and `evidence/sukhmani-srigranth-gurmukhi.json` retains the Gurmukhi comparison extract.

These are two digital sources. Their independence as physical editions or editorial lineages is not established. The comparison is useful error detection, not qualified letter-by-letter human collation or an institutional endorsement.

## Teaching and pronunciation

`js/sukhmani-teaching.js` contains original AI-assisted English and Punjabi explanations, separate from `js/sukhmani-data.js`. Every line explanation is attached to a source occurrence and its exact source hash. Every passage study names the source occurrences it discusses. Teaching is labeled **draft** in the interface.

The studies explain the movement of the passage, important vocabulary, a reflection question and a teach-back question for each Ashtpadi. Devotional claims, metaphor, interpretation and personal application remain distinguishable. The material does not turn scriptural references to suffering or healing into clinical promises, and it does not treat historical or biological status as proof of spiritual attainment.

Roman transliteration is optional and generated by the pinned Open Granth transliteration tool. It is a rough reading aid. It is not certified santhiya, an audio recording, or a definitive pronunciation guide. The tool's MIT license and the upstream source notices are retained in `vendor/opengranth/`. No third-party modern translation or recorded recitation is copied into the app.

## Reader behavior

- All 510 original source nodes stay mounted in a single continuous reading. Switching Read, Meaning and Study does not substitute commentary for scripture.
- Jump by Ashtpadi, Salok, pauri or Rahau. Each source entry has an Ang reference.
- Meaning shows the English and Punjabi explanation under the matching line. Study adds passage explanations and vocabulary. Optional transliteration can be enabled separately.
- The existing paper and Amrit Vela appearance are reused. Gurmukhi size is adjustable from 24 to 48 pixels.
- The optional line guide is silent and advances at an illustrative pace. It has no recording, audio synchronization, microphone or synthetic voice.
- Bookmarks, reflections and reading place remain in the browser, under `glp001.sukhmani.v1`. The existing Japji keys are never written by this reader.
- Export and import explicitly cover **Sukhmani learning only**. Existing Japji learning has its separate export. An original-record download supports recovery when stored data is damaged or comes from a newer reader.
- Imports merge bookmarks and reflections without replacing the current reading preferences. Unsupported versions and unfamiliar fields are refused without overwriting stored data. Web Locks serialize saved-learning writes.

## Verification and limitations

Run the existing portable regression checks, then:

```sh
node tests/sukhmani-content.mjs
node tests/sukhmani-reader-core.mjs
node tests/sukhmani-browser.mjs
```

The browser harness uses only synthetic learning in isolated browser contexts. It writes its result and screenshots under `evidence/`. The GitHub Actions workflow installs a pinned Playwright version and runs Chromium checks. See the final check results on the pull request; do not treat the existence of a test file as a passing result.

The script `python3 tools/sukhmani/verify-upstream.py` checks the source against the pinned upstream files, including their stored hashes. Its `--cache` option verifies already retrieved source files without networking.

The build environment used for authoring could run the portable checks, but could not launch local Chromium because the environment refused its process socket. The connected Mac was offline and the cloud browser could not reach the local preview. Browser evidence is produced by the isolated CI runner; no local browser pass is claimed. See the pull request's browser check and downloadable evidence for the observed result.

Physical iPhone Safari, VoiceOver, installed Home Screen and real airplane-mode behavior remain untested. A Chromium viewport check is not a physical iPhone test. The first-six teaching needs qualified Punjabi/Gurbani editorial review; the remaining 18 Ashtpadis are not in this pack.

## Release and rollback

Public main at the start of work is `254f3871b785b756208379138dcc17472a3733ff`. `docs/R7_RELEASE_AND_ROLLBACK.md` confirms that R7 was published on 2026-10-23; the older candidate document should not be used to infer current production status.

This work is on `feature/sukhmani-reader-foundation-20261123`, building on the earlier specification commit `8dd18a036ea46aef18ce9c1106c0c818c8a24814`. It does not merge or deploy the public family site. Source comparison, content completion, automated testing, human editorial review and production publication are separate statuses.

The static offline shell includes the new route and assets with fresh content hashes and a new version. Installation still waits for an explicit update action. No code clears personal learning. A release or rollback must use a complete runtime and a newly generated worker version, preserve both Japji and Sukhmani storage, and rerun the relevant checks. Do not clear site data or reset bookmarks as an update step.
