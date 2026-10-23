I read the prior FAIL, `js/japji-full.js`, `css/japji-full.css`, `full-japji.html`, `js/continuous-core.js`, `tests/reader-browser.js`, `tests/r6-contract.mjs`, `tests/reduced-motion-fixture.js`, the three evidence JSONs and the screenshot manifest, and I opened the three named images.

# Independent Claude Design Review — R6 Darbar Reader, third pass

**Verdict: PASS DESIGN.** All three of my pass-2 blockers are closed in the code, in the instrumented evidence, and in the fresh captures. I found no new blocker.

Scope: bounded AI design review only. Not Sikh/Punjabi/santhiya/raag approval. Physical iPhone/Safari/VoiceOver/Home Screen/real airplane-mode remain NOT TESTED and I claim nothing about them; HTTPS lifecycle and elapsed-time evidence are the owner's separate gates.

---

## 1. The three blockers

**D1 — closed.** `js/japji-full.js:57` adds `mool-mantar` to the opening unit's tuk (`ui===0`), and `css/japji-full.css:101` is `.tuk.mool-mantar{font-weight:600}` — weight only, against `background:none!important` at `:71`. No card, no rule, no colour change. `tests/reader-browser.js:25` asserts both halves (computed weight ≥600 *and* `rgba(0,0,0,0)` background), which is the right shape for a requirement whose negative half matters as much as its positive half.

`mool-long-line.jpg` is what actually settles it. The four wrapped Mool Mantar rows carry a clear, visible weight step; `॥ ਜਪੁ ॥` and the Salok `ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਸਚੁ ॥` immediately below are plainly lighter. The capture that disproved the claim last time now demonstrates it, and the scoping is correct — the emphasis stops at the Mool Mantar rather than bleeding into the opening Salok. Specificity holds too: `.tuk.mool-mantar` (0,2,0) beats the `.tuk` font shorthand, and nothing in the ≤380px block at `:105` resets it.

**D2 — closed, and closed the way I asked.** `tokensMarkup` (`js/japji-full.js:44–50`) computes the non-whitespace indices, tests the final token against `/^[॥।੦-੯0-9]+$/u`, and opens a `<span class="tuk-ending">` before the *penultimate* word, closing it after the danda — with `.tuk-ending{white-space:nowrap}` at `:100`. The whitespace between is still emitted verbatim through `h(part)`, and `token++` increments only on non-whitespace, so the guide's token numbering is untouched by the wrapper.

I did not take that on assertion. Three independent checks pin it:
- `reader-browser.js:24` compares `.tuk.textContent` against the frozen `source[i].text` for all 385 occurrences — exact characters including whitespace.
- `:27` asserts `data-token` is contiguous `0..n-1` per row and that the count equals `flatten()`'s token count, so no index shifted.
- `r6-contract.mjs:7` hashes `js/japji-full-data.js` against the R5 manifest — the source file is byte-identical, so this is presentation-only by construction.

Geometry is checked at `:48` across 385 endings × {30px, 48px} × {320px, 390px}: each `.tuk-ending` must hold exactly two `.g-word` children on the same row *and* fit inside `.tuk` clientWidth. That last clause is the one that matters, because `nowrap` converts a wrapping defect into an overflow defect if the pair is too wide — and `R6_CANDIDATE.md:54` records that this check actually caught the Pauri 25 pair at 48px, which is why `:105` drops the inner tuk padding at ≤380px. A test that found a bug before I did is worth more than a test that passes.

The captures agree. `read-day.jpg`: every `॥` rides with its word, including on wrapped lines (`ਚਾਰ ॥`, `ਵੀਚਾਰੁ ॥`). `mool-long-line.jpg`: the Salok's `॥੧॥`, stranded alone last time, now sits on the wrapped row with `ਸਚੁ`. `large-320.jpg` at 320px/48px: four wrapped Pauri 24 lines, every ending intact, no horizontal overflow, matras on ਅੰਤੁ and ਸਿਫਤੀ clean. `.tuk{overflow-wrap:break-word}` at `:99` also retires my nonblocking #8.

**D3 — closed.** `full-japji.html:26` is now `aria-label="Meaning · Understand in English and Punjabi"` against visible `Meaning`. The name *begins* with the visible label, which satisfies both 2.5.3 containment and the stronger speech-input start-match. Read and Study follow the same pattern. `reader-browser.js:26` enforces it generically by extracting each button's visible **text nodes only** — and the candidate record discloses that the first version of this test wrongly counted the `aria-hidden` dot and was repaired. Disclosing a broken test you fixed is the behaviour that makes the rest of the packet credible.

## 2. Earlier nonblocking items

Resolved: #1 Study heading is 22px (`:102`, later in source order than the ≤380px 25px rule, so it wins everywhere). #4 the suspected active-word offset is now an assertion — `reader-browser.js:40` requires exactly one `data-active` word carrying both underline and a colour distinct from the tuk; the colour lag is gone at the source, since `.g-word{transition:text-shadow .2s ease}` (`:11`) transitions the shadow and nothing else. #5 `r6-contract.mjs:11` brace-matches the production media query and asserts the fixture contains it, and the fixture now loops `radiance` true *and* false explicitly. #6 anchor retention during active Play is now a check with recorded detail (`opening.line01`, −24.875 → −25, still playing).

Still open and still nonblocking: #2 the `expand-hint` repeats per passage rather than per first use (`:54`, unchanged); #3 the Understand pauri ratio stays 19px/38px; #7 `#dock-position` still truncates to `Pauri…` at 320px/48px, with the accessible name intact.

## 3. New nonblocking observations

1. **`.simple-meaning` accessible name omits its visible hint.** `aria-label="Read more about {title} line N"` against visible `Draft meaning · tap to explore`. This is an arguable 2.5.3 case, not a clear one — the button's visible content is the meaning itself rather than a short label, and the hint is hidden after the first line of each passage. I'm flagging it because I twice passed over it, not to move the goalposts: appending `· Draft meaning` would close it cheaply. I am not blocking on it.
2. **600 resolves differently per platform.** `Gurmukhi MN` ships Regular and Bold, so CSS weight matching will pick real Bold (700) on macOS, while Noto Serif Gurmukhi gives a true 600. Emphasis strength will vary, and on a face with no bold the browser synthesizes, which can thicken matras at 48px. Worth one glance when a device is available — it costs nothing to check alongside the existing device list.
3. **Record hygiene.** `R6_CANDIDATE.md:19` still says "38 browser interaction checks"; the evidence file, the README and all three screenshot consoles say 47. Stale line, not a wrong claim.
4. **The drift guard covers one of two motion blocks.** `r6-contract.mjs:11` extracts the first `prefers-reduced-motion` block (`:23`). The second at `:61` is unguarded — substantively redundant, since `:23` is unqualified and already kills both shadow states, but the guard is partial.
5. **Endings geometry is measured in Read only.** The tuk column width is identical across depths, so the risk is low, but the 385-ending sweep runs at `reader-browser.js:48` with mode `read`.
6. **320px margins are now the tightest they have been** (10px main, zero tuk padding). Necessary for D2 at 48px and it reads fine in `large-320.jpg`; just noting where the headroom went.

## 4. Limits of this verdict

I reviewed the three fresh images. The manifest states plainly at line 20 that the other six are being recaptured, so I have **not** visually re-verified Understand, Study or immersive after the ending and Mool changes. I accept that on the instrumented checks plus the fact that both changes are depth-independent — but it is a gap in the visual record, and I'd rather name it than let a PASS imply I saw screens I didn't.

Desktop Chrome iframe captures at 320/390/844 CSS px remain early evidence, not iPhone acceptance. Physical iPhone Safari at both widths, real Dynamic Type, VoiceOver traversal of the dock and depth switches, Home Screen standalone with a real safe-area inset, real airplane-mode offline, and a sustained >30-minute session stay NOT TESTED. I am not converting any of them into a condition of this design verdict. My pass-2 observation that the dock will render ~88px tall with ~34px of empty inset interior on a notched iPhone remains a proportion question for the device gate, not a defect here.

Design approval is not release approval. R5 should stay deployed until the device and HTTPS lifecycle gates close, and the 385 meanings and 42 Study drafts remain unreviewed AI-assisted drafts pending qualified human review — a gate this review does not touch.

---

**Summary.** The Mool Mantar now carries typographic emphasis with no container; every terminal danda stays with its word across 385 occurrences at both text sizes and both widths, with the frozen source proven byte-identical and token indices proven contiguous; and the Meaning control's accessible name leads with its visible label. **PASS DESIGN.**

Want me to write this up as `docs/CLAUDE_R6_DESIGN_REVIEW_3_PASS.md` alongside the prior review?
