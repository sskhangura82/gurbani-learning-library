# Revision 6 actual browser screenshot manifest

The left panel is the application. The right panel is QA instrumentation, not product UI. The console records the last suite run and may describe a different theme from the later screenshot; the toolbar and actual reader show the capture state. Full viewport JPEGs are retained because the browser service timed out on clipped captures.

| Exact filename | App viewport | Theme / depth | Evidence |
| --- | --- | --- | --- |
| read-day.jpg | 390×844 CSS px, 30px Gurmukhi | Day / Read | Pauri 3; single dock; no decorative section rules |
| read-amrit.jpg | 390×844, 30px | Amrit Vela / Read | Distinct dark palette and restrained radiance |
| understand-amrit.jpg | 390×844, 30px | Amrit Vela / Understand | English then Punjabi immediately below each tuk |
| study-amrit.jpg | 390×844, 30px | Amrit Vela / Study | Clearly labeled unreviewed Study draft |
| pauri1-day.jpg | 390×844, 30px | Day / Read | Complete Pauri 1 with native ending numeral |
| pauri2-day.jpg | 390×844, 30px | Day / Read | Pauri 2; no scripture containers |
| immersive-day.jpg | 390×844, 30px | Day / immersive (Quiet) Read | Running silent guide, word underline, Pause and every dock control visible |
| large-320.jpg | 320×844, 48px | Day / Read | Pauri 24 wrapping, intact matras and dock. This is a large-text test, not evidence that this tuk is the longest source line. |

These are desktop Chrome iframe captures. Physical iPhone/Safari/VoiceOver/Dynamic Type/Home Screen are NOT TESTED. Pauris 1, 2 and 3 are represented across the set, not compressed into a single phone screen.

`mool-long-line.jpg`: 390×844, 30px, Amrit Vela / Read. Full Mool Mantar (the longest frozen occurrence, 71 Unicode code points in this source) wraps naturally, with the title and opening Salok below and no colored scripture container. Captured after the final typography, ending-pair and active-color corrections.

All nine images now show the final darbar-6 runtime and the 47-check passing harness. The final independent Claude pass inspected read-day, mool-long-line and large-320; the other six were recaptured afterward with unchanged runtime code. Study shows the Mool Mantar source and its clearly separate, unreviewed Study draft. The first three failed-design captures remain in Git history at commit 7463f5b; the current files replace those superseded captures.

## Public release

`public-family.jpg` shows the actual GitHub Pages reader after the normal explicit update flow to Revision 6. Desktop Chrome; not a physical iPhone capture.
