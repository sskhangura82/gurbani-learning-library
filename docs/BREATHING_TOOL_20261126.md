# Separate physiological breathing tool — candidate, 26 November 2026

## Behaviour

`breathing.html` is a standalone optional physiological exercise. It does not load scripture, teaching, reader storage, the Simran controller, or a shared practice session. Its immutable contract has the content kind `physiology-tool` and the practice kind `paced-breathing`. The controller refuses a document with another content kind. The UI is visibly labelled as a physiological tool.

The guide starts only after an explicit button press. It alternates five seconds of gentle inhalation with five seconds of exhalation. Its two-phase timing contract has no holding phase, user-configurable sequence, sacred content input, or tracking output. The circle changes size continuously; text cues change at the phase boundaries. Stop is always available during operation and returns keyboard focus to Begin. The tool explicitly says not to take bigger breaths to keep up, to return to normal breathing at any time, and to stop with dizziness, breathlessness or discomfort.

The default is six cycles per minute, not an individualized prescription. This is not treatment and does not replace care. No clinical effect is promised. The page states it has not been clinically validated and that the evidence note awaits independent review.

The tool is silent. There is no timer, completed-breath counter, session count, streak, record, export, account, network data request, persistent storage, analytics or connection to another person's device. It stops when the page becomes hidden or is left. A return does not silently restart it. This is intentionally different from trying to maintain a breathing cue in a suspended background tab.

Reduced-motion preference starts the tool with a stationary circle and disables the moving-circle option with an explanation. Other users can choose the stationary circle themselves while retaining text cues. Dynamic cues use a polite live region, but timing and intelligibility with a real screen reader remain unverified. No VoiceOver success is claimed.

## Sources actually read

Only the short original evidence note is carried in the page. No article text, diagram or recording was copied.

1. Joseph CN and colleagues. *Slow breathing improves arterial baroreflex sensitivity and decreases blood pressure in essential hypertension.* Hypertension. 2005;46(4):714–718. DOI: [10.1161/01.HYP.0000179581.68566.7d](https://doi.org/10.1161/01.HYP.0000179581.68566.7d), [PMID 16129818](https://pubmed.ncbi.nlm.nih.gov/16129818/). Read the abstract through the PubMed search result and publisher PDF result. The study compared spontaneous breathing with controlled rates of six and fifteen per minute in 20 hypertensive participants and 26 controls. It does not validate this app or a long-term treatment claim.
2. Steffen PR and colleagues. *The Impact of Resonance Frequency Breathing on Measures of Heart Rate Variability, Blood Pressure, and Mood.* Front Public Health. 2017;5:222. DOI: [10.3389/fpubh.2017.00222](https://doi.org/10.3389/fpubh.2017.00222), [PMID 28890890](https://pubmed.ncbi.nlm.nih.gov/28890890/). Read the PubMed abstract. Participants in the resonance group used a personally determined frequency; this app does not perform such a measurement. The existence of research near six per minute is not evidence that one rate is optimal for everyone.
3. Shao R, Man ISC, Lee TMC. *The Effect of Slow-Paced Breathing on Cardiovascular and Emotion Functions: A Meta-Analysis and Systematic Review.* Mindfulness. 2024;15:1–18. DOI: [10.1007/s12671-023-02294-2](https://doi.org/10.1007/s12671-023-02294-2). Read publisher abstract, conclusions and limitations. The review synthesized 31 studies with 1,133 participants, found immediate physiological effects, and left long-term efficacy uncertain. No mood or anxiety treatment claim appears in this tool.
4. Noble DJ and Hochman S. *Hypothesis: Pulmonary Afferent Activity Patterns During Slow, Deep Breathing Contribute to the Neural Induction of Physiological Relaxation.* Front Physiol. 2019;10:1176. DOI: [10.3389/fphys.2019.01176](https://doi.org/10.3389/fphys.2019.01176), [PMC6753868](https://pmc.ncbi.nlm.nih.gov/articles/PMC6753868/). Read the abstract and introductory limitations. It is a hypothesis paper, not proof of efficacy. It informed caution in wording and is not required by the visible evidence note. The app does not tell the learner to deepen breaths.

All source checks were made on 26 November 2026. Evidence about physiology is not used to support a theological conclusion. No spiritual practice or preparation for one is offered here.

## Verification

Run `CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/breathing-browser.mjs` on this Mac, or select another installed Chromium executable. The test creates a temporary localhost origin, a new nonpersistent browser context, and no real user records. It writes `evidence/breathing/report.json` and three screenshots. The report records exact input digests and actual browser version.

Focused checks cover the phase boundaries and immutable two-phase contract; keyboard Begin and Stop; a complete inhale/exhale cycle using the browser's test clock; reduced-motion behaviour; stopped state after page hiding or page return; narrow layouts; source anchors; content-layer refusal; and the absence of storage access, fetches, cookies, media elements and runtime errors.

These are builder checks, not independent acceptance. Desktop narrow viewports are not physical iPhones. The visibility check dispatches a synthetic hidden-state event; real device backgrounding and screen-reader cue timing still need human acceptance. Clinical review of the short evidence and safety wording remains separate from code verification.

## Delivery boundaries

No source corpus, scripture bytes, teaching passage, recording, privacy record or existing reader was changed by this tool. Root integration may add navigation and service-worker caching of these static files. No deployment or release is authorized by this document.
