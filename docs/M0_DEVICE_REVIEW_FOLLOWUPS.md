# M0 device follow-ups from independent design review

All rows are **NOT RUN**. Supplement the exact PR #10 physical checklist using an identified M0 candidate URL/version; current family R7 is not M0 evidence.

| Finding | Required actual-device check | Result |
|---|---|---|
| D5 | At 320px and 390px, inspect Mool Mantar, Opening Salok and Closing Salok labels, with large system text; confirm the full accessible name is understandable and location is usable despite any visual ellipsis | NOT RUN |
| D6 | With VoiceOver, enter immersive reading via scroll and Play; confirm hidden heading does not strand focus, reveal is discoverable, and any future announcement would help rather than interrupt reading | NOT RUN |
| D10 | Traverse scripture and meanings with VoiceOver/switch/keyboard; assess burden of 385 buttons and useful pauri-level navigation and exit paths | NOT RUN |
| D2 residual | Verify the clipped qualified-review banner is discoverable with VoiceOver and that meaning-button accessible names provide adequate context; inspect repeated draft-hint legibility and contrast with 60px scripture and system text scaling | NOT RUN |

No qualified accessibility or religious review is claimed. Preserve synthetic learning backup and record failures before any release decision.

## Automated browser preflight, distinct from physical acceptance

On 24 October 2026 Pacific, the Serenity child PR introduced adjacent Previous/Next passage controls in the existing Jump dialog, a current-passage marker, improved draft-meaning accessible names, and a polite location announcement. An isolated Mac Chrome test passed 14 checks using the actual accessibility tree for the name, keyboard/Escape focus restoration, reduced-motion stylesheet behavior and 320px layout. **These tests do not close any D5/D6/D10 or D2-residual rows above**; qualified human accessibility checks and native iPhone VoiceOver remain NOT RUN. Evidence: `tests/serenity-a11y-browser.mjs`, `evidence/serenity-a11y-qa.json`, `evidence/serenity-a11y-jump-320.png`. Preserve all original text and real family reading data.
