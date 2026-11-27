# Review register — current state, 27 November 2026

**This supersedes the classification in
`REVIEW_REGISTER_RECONCILIATION_20261126.md` wherever the two differ.** That
document is a dated snapshot and stays as it is; its §4 still lists #53 as
"requires repair (RB-01)", which was true when written and is no longer true.
I am not editing it, because the founder quoted from it and a silently rewritten
record is worse than a superseded one.

## Candidates and current verdicts

| PR | head | review | verdict now |
|---|---|---|---|
| #58 | `b68e08004` | RT-018 | **PASS**, 20 of 21 criteria; C18 passes with a stated limitation |
| #57 | `f720099b6` | RT-013, RB-01 closure | RB-01 **closed** against my frozen bar; RB-02 opened (low) |
| #56 | `389e79ba` | RT-011 | reviewed; this is the build deployed as Preview 4 |
| #55 | `acfeb0a1` | RT-010 | reviewed; ART-P01 characterised |
| #54 | `8917beaa` | RT-006 | reviewed; RT4-05 **closed** (my error, corrected) |
| #53 | `83acf3f9` | RT-008 | RB-01 raised here; **repaired in #57**, so no longer "requires repair" |
| #52 | `792afa20` | RT-009 | reviewed |
| #51 | `50ba6e17` | RT-012 | reviewed |
| #50, #41, #42 | — | RT-017 | reviewed |
| #49 | `1a4537ed` | RT-015 | reviewed; its conflict with #57 was re-authored into #58 |
| #48, #45 | `94f004a84`, `8fa9206d9` | RT-020 | chain members; #45 tested directly |
| #47 | `d8202caa1` | RT-019 | **PASS on its own claim.** Does **not** address SK-01 |
| #44, #46 | — | — | **my own drafts.** I may not review them; they need ChatGPT |

## Findings

### Closed

| ID | How |
|---|---|
| RB-01 | repaired in #57, verified against the bar I froze before seeing it |
| RT4-05 | **my register error.** The builder was right; I had conflated "my proposed remedy was rejected" with "no remedy exists" |
| RT17-C14 | closed by RT18-C17 — the Kabir entrance states only selected passages are indexed |
| SIG-01, attribution half | closed in #58: `ਨਾਨਕੁ` returns the Guru Angad passage with source provenance, an occurrence id and correct attribution |

### Open, for the builder

| ID | Severity | State |
|---|---|---|
| SK-01 | **open** | **Now deterministically reproducible** and the mechanism identified (RT-019). Not addressed by #47 |
| SRI-01 | pre-existing | demonstrated on `nitnem/index.html` and now also on `knowledge/index.html` |
| ART-P01 | open | characterised across four PDF engines on byte-identical input |
| SIG-01, recall half | open **by design** | `ਨਾਨਕ` does not infer `ਨਾਨਕੁ`. Stated in the UI and the handoff. I am **not** asking for this to be closed — inferring it would be a linguistic claim the pilot cannot support |
| CHAIN-01 | low | partial-landing hazard across #45→#58; three mitigations recorded |
| PREV-01 | low | the "Preview 4" label is on `preview.html`, not on the root the founder was told to open |
| RB-02 | low | split-field |
| ANG-01 | low | — |
| EXP-01 | low | — |

### Not closable by review at all

- Printed-source collation against a second textual lineage. Open Granth and my
  Shabad OS reference both declare the same upstream, so they are **one** lineage,
  not two witnesses.
- Physical iPhone / iPad / VoiceOver / airplane-mode acceptance.
- Audio rights; the gurbani.org permission letter is drafted and unsent.

## Corrections I have made to my own record

Kept together deliberately, because a reviewer's error rate belongs in the same
document as the findings.

1. **RT4-05** — downgraded verified work to "requires repair" in the document the
   founder was using to decide integration order. The builder caught it.
2. **SK-01 rate** — published 1-in-16, corrected to 1-in-60.
3. **SK-01 character** — wrote that an off-by-one hunt "would not have found it."
   Wrong: there is a deterministic off-by-N inside the race.
4. **SK-01 cost** — implied ~60 runs to verify a fix. Wrong in the expensive
   direction; it is now a deterministic test.
5. **RT18-C21 method** — verified the phone-preview clause against a branch in
   this repository when the preview is served from a different repository. Right
   answer, wrong method; re-verified against the served page.
6. Nineteen instrument errors recorded across the review line, four of them in
   RT-018 alone, plus two defects in my own frozen criteria.

## Outstanding founder acts

Unchanged, and still only these two:

1. **A branch-protection rule on `main`.** `main` is `protected: false`. CHAIN-01
   is now a concrete scenario for it: five stacked drafts are all simultaneously
   mergeable, and nothing prevents the oldest landing alone.
2. Closing the historical PRs that triage identified as housekeeping.

Neither is urgent tonight. Nothing else requires him, and I have not approved,
merged, deployed or pushed to `main`.


---

## Update, later the same evening — appended, not rewritten

Three entries above changed after I wrote them. Appending rather than editing, so
nothing already read changes meaning.

### Candidate added

| PR | head | review | verdict |
|---|---|---|---|
| #59 | `e0a6cff2` (app bytes identical to `b69d6b31`) | RT-021 | **PASS**, 25 of 26 criteria; C24 untested by me |

PR #59 repairs the reader-page subset of SRI-01 and the ordinary resume/reload
portion of SK-01. It is based on #56 and remains unmerged.

### Findings that moved

| ID | Was | Now |
|---|---|---|
| **PREV-01** | low, open | **WITHDRAWN.** My instrument was unfit for the question; the builder's raw bytes and rendered DOM stand. No defect asserted |
| **SK-01** | open, diagnosed | **open, with a verified fix awaiting merge.** The repair in #59 is independently confirmed: four zero-movement controls preserved, no input whitelist across three input paths, reload leaves the record byte-identical |
| **SRI-01** | pre-existing, open | **reader-page subset addressed in #59** — 36 of 36 pins valid, altered scripts refused, no scripture rendered when blocked, learning preserved. **Still open** for the library module graph, the served HTML document itself, and every page on `main`, which has 43 script tags and 0 pins |

### New

| ID | Severity | State |
|---|---|---|
| **CI-56-01** | low | PR #56, the build deployed as Preview 4, carries a stale test assertion — the manifest holds 85 assets, the test asserts 81 — which its own CI never ran because the workflows are path-filtered. Established four ways, and the builder reached it independently. Not a scripture or reader defect; the concern is that an unexplained red check is how a real regression gets dismissed later. Addressed in #59's follow-up commit |

### Unchanged

Open for the builder: RB-02, ANG-01, EXP-01, ART-P01, SIG-01's recall half (open
**by design**), CHAIN-01.

Not closable by review: printed-source collation against a genuinely second
textual lineage, physical iPhone / iPad / VoiceOver / airplane-mode acceptance,
and audio rights.

Founder acts: still only the branch-protection rule on `main` and closing the
housekeeping PRs. Neither urgent.

### My corrections and error count, updated

The six corrections above become seven, with PREV-01's withdrawal the most
consequential of the session because it reached the founder and concerned the
build he was about to open. Instrument errors now stand at **twenty-three**, of
which two in RT-021 were **repeats of errors I had already written down** — a
crude regex reading a denial as a claim, and measuring the Nitnem landing page.
Writing an error down has not been sufficient to stop me repeating it, which is
the honest summary of my own reliability tonight.


---

## Second update — PR #60 and the build lock

### Candidate added

| PR | head | review | verdict |
|---|---|---|---|
| #60 | `44401e35` (app bytes identical to `69e24fe4`) | RT-022, RT-023 | **PASS.** Closes MOD-01; all 9 delta criteria met; CI green on all nine checks |

### Findings that moved

| ID | State |
|---|---|
| **MOD-01** | **CLOSED** by #60. Bundling removes transitive imports, so entry-point integrity covers the graph. The RT-018 exploit — neutralising the guard in the loose `registry.mjs` — now has no effect |
| **BUILD-01** | **opened and CLOSED the same evening.** The lockfile held absolute paths from the generating machine, so `npm ci` and both documented checks could not run. Regenerated; install succeeds and the bundles now **reproduce byte-for-byte** from the reviewed modules |
| **SRI-01** | reader pages (#59) and Library/Articles/Knowledge (#60) now covered — **14 pages, 51 scripts, all pinned and recomputed valid.** Still open for the served HTML document itself, the worker, and all of `main`, which has 43 script tags and 0 pins |
| update-failure preservation | was "demonstrated by neither of us"; now **builder-demonstrated, not independently verified** — the previously skipped job ran and passed |

### A correction that was not mine

The builder corrected their own reference: the Explorer carrying EXP-01 is PR
#41, not #50. My RT-017 findings already attributed it to #41, so nothing of
mine needed changing. Recorded so the correction is not later credited to a fix
of mine.

### Error count

Unchanged at twenty-three. RT-022 and RT-023 added none — but their frozen
criteria caught a real gap in mine: I had tested nothing under a non-root URL
path, which is how the site is actually served. It passes, on their criterion.


---

## Third update — Daily Hukamnama and the backup retry repair

### Candidates added

| PR | head | review | verdict |
|---|---|---|---|
| #61 | `df2c62fb` | RT-024 | **PASS, 25 of 25.** Daily Hukamnama: refuses to substitute a reading, authenticity chain recomputed, no invented interpretation, digests-only rights posture |
| #62 | `7f36c303` | RT-025 | **PASS, 20 of 20.** Backup retry idempotence; builder-disclosed defect against their own passing candidate |

### Findings

| ID | State |
|---|---|
| RT24-C17 | **CLOSED** — the committed receipt's raw sha256 matches `officialReceiptSha256`; zero translation or commentary keys |
| lineage (RT-005 / CI-S-16) | **unchanged as a limit, now stated by both of us.** The builder's receipt records that the portal and its archive are one publisher, and traces Shabad OS SSA2 upstream to SGPC Shabadaarth. Printed-page collation remains the only route to an independent lineage |
| Web Locks dependency | **new, for device acceptance only.** Saving and importing private notes need `navigator.locks` and fail closed without it. If iOS Safari lacks it on the target device, notes cannot be saved at all. Not a defect; a thing to check on the phone |

### Untested by me, named rather than assumed

Next-day rollover and late asynchronous results (#61), and browser-level
import/export demonstration (#62). Their CI covers all three and passes; I have
not independently verified them.

### Error count

Now **thirty**, including two vacuous results in RT-024 I nearly reported as
findings, and a Unicode test in RT-025 that used the escape for the letter `x`.

---

## Fourth update — the composite CI run, and the print gate

### Candidate added

| PR | head | review | verdict |
|---|---|---|---|
| #63 | `7f36c303` | RT-026 | **No new code.** Validation-only draft; identical SHA to #62's reviewed head, zero differing paths. RT-025 applies unchanged |

#63 is the composite CI run I named as the open limit in CHAIN-02 and said was the
builder's to arrange. They arranged it. It found something.

### What it found

One check failed: `browser-and-print`. **Pre-existing, not a composite regression.**
Failing at #55's own head (`acfeb0a157fc`); did not run at #56, #59, #60 or #61, whose
bases fall outside the workflow's `branches:` list. Invisible for four candidates.

### Findings

| ID | State |
|---|---|
| **ART-P01** | **OPENED.** The print gate fails on correct PDFs. `PyMuPDF==1.26.6` (the engine the workflow pins) duplicates the dependent vowel sign after a subjoined-ਰ cluster: `ਪ੍ਰਾਨੀ` → `ਪ੍ਰਾਾਨੀ` (U+0A3E twice), `ਪ੍ਰੀਤਿ` → `ਪ੍ਰੀੀਤਿ` (U+0A40 twice). Signature across all six print artifacts, both page sizes: line01 exact=False, line02 exact=True, because only line01 holds such a cluster |
| **CI-02** | **OPENED.** Branch filtering reports a failing check as absent on candidate PRs. Second instance of the class (first: the 85-vs-81 case in RT-021). `main` *is* in the trigger list, so filtering delays discovery until after a merge rather than preventing the failure |
| CHAIN-02's stated limit | **CLOSED as far as review can close it.** The composite has now been exercised by CI as a merge into `main`. One red check, attributed |

### The documents are correct — three independent checks

1. Canonical text from `salok-mahalla9/data/` and `salok-kabir/data/` is **digest-exact**
   to the pins in `articles/source-contracts.mjs`, under none/NFC/NFD alike.
2. The PDF's own `/ActualText` span for the affected cluster is four codepoints with
   **one** matra. The duplication does not exist in the document.
3. Poppler `pdftotext` 24.02.0 extracts **all twelve** pinned lines exact, exactly once,
   both lines of each pair on one page. Pagination-stress: complete on page 2 of 3.

Artifact identity held: the haumai A4 I measured is sha256 `6a5bc6b6…`, and the inspector's
own output directory is named `haumai-source-sheet-a4-6a5bc6b6`.

### The constraint I recorded against ART-P01

The gate's declared normalization — NFC plus whitespace collapsing, **no letter or
punctuation removal** — is correct and cannot absorb this defect, because the defect
inserts a letter. Loosening the matcher to pass would make the gate blind to a duplicated
matra, which is a silent Gurmukhi spelling corruption. The gate is load-bearing exactly
where it misfires. The fix belongs in the engine, and it is the builder's to choose.

### Still open by design

`"visualReview": "NOT_PERFORMED_BY_SCRIPT"` — no script closes it; I have not performed it.

### Error count

Now **thirty-two**. Error 31: I built and verified a pdfium space-insertion mechanism
before checking which engine the workflow pins — right measurement, wrong instrument.
Error 32: a guessed filename produced a silent 0-byte download that, unchecked, would have
reported zero Gurmukhi and corroborated the CI failure for the wrong reason. Both disclosed
in the thread; RT-026 carries an appended correction rather than a silent edit.

### Bearing on the founder's decision

Merging the reviewed composite puts a red `browser-and-print` check on `main`. It is
pre-existing from #55 and, on all six documents I verified, a measurement limitation rather
than broken scripture or a broken PDF. Not a reason to withhold the merge; not something to
merge unknowingly. Not mine to decide.

---

## Fifth update — recording the founder's ruling on scholarly review

### The ruling

The founder has ruled, directly: *"We are not waiting on any scholar to check it. We have
more than enough knowledge here and you're following strict rules as well as ChatGPT so
let's not worry about that."*

He is the release authority. This is his call to make, and it is made.

### What it changes

**Qualified scholarly review is no longer a release gate.** I will not hold eligible work
on it, will not list it as a blocker, and will not keep raising it for decision. The
thirteen `OPEN-NEEDS-SCHOLAR` entries in the index are **not thirteen blockers**, and
should not be read as such.

### What it does not change, and why I am recording it rather than relabelling

The label stays on those entries as a **description of what the item rests on**, not as a
gate. The distinction is a capability limit on my side, not a procedural preference:

- I can verify that interpretation is **absent** — that no translation, commentary or
  teaching claim has been smuggled in. I have done that repeatedly and it holds.
- I **cannot** verify that a translation or a teaching is **correct**. No amount of rule-
  following substitutes for that, and two AI systems agreeing does not establish it — which
  is itself a standing constraint: *"Do not declare unreviewed material authentic merely
  because two AI systems agree."*

So relabelling those entries as resolved would be a false record. Leaving them labelled,
while treating them as non-blocking, is the accurate one.

### Why this costs nothing in the product

The application already tells the reader the truth, unprompted and in its own data:

- `articles/catalog.json` carries `"reviewStatus": "AWAITING_QUALIFIED_REVIEW"` and
  `"semanticReviewed": false`
- the rendered source sheet reads *"Awaiting qualified review. No explanation has been
  written. The passage is selected by a source-word match; that match does not establish
  what the passage teaches about this topic."*
- readers carry *"Explanations are educational drafts awaiting qualified review"*, in
  English and Punjabi

So the standing constraint *"Do not present AI-generated explanations as the authoritative
voice of the Guru"* is satisfied **by labelling, not by waiting.** Shipping labelled drafts
honours both his ruling and that constraint at the same time. Nothing in the product needs
to change for his decision to take effect.

### The two items his ruling does not reach

These are not scholarly-review items and remain genuinely outstanding on their own terms:

- **Printed-source collation** against a second textual lineage (RT-005 / CI-S-16). Not a
  judgement call — a missing second witness. Both the builder and I have now stated it.
- **Physical iPhone/iPad/VoiceOver/airplane-mode acceptance**, and **audio rights**. Not
  closable by review, and I will not claim either.

---

## Sixth update — eleven new candidates, and what merging now actually requires

### The queue grew

#64–#74 arrived, stacking on #62 in **five parallel lines**: Daily (#64→#69→#73), Farid
(#65→#72), Explore (#65→#70→#74), Haumai (#66), QA visibility (#67), History (#68→#71).
`main` unchanged at `a3476ac4b9be`, still unprotected.

**These candidates are not yet reviewed.** What follows is integration analysis only.

### INT-01 opened

A sequential trial merge into `main` is clean for the #62 composite, Daily and Farid, then
conflicts at Haumai and again at Explore — **both times in the same four files**: `sw.js`,
`tools/build-offline.mjs`, and the two `library-script-integrity` harnesses. Systemic, not
incidental: the generator hardcodes each candidate's release label on one shared line, so any
two candidates conflict there by construction.

Generator resolution **verified** (union the additions, pick one VERSION, regenerate →
107 manifest entries, both candidates' files present). Harness resolution **not verified** —
my automated union produced invalid JavaScript.

### What I got wrong, and what the evidence refuted

- I hypothesised CI would **mask** a bad committed `sw.js`. It would not: nine workflows run
  the generator then `git diff --exit-code -- sw.js`. Severity dropped accordingly.
- Error **33**: asserted a PR base/ancestry discrepancy from a misread of my own listing.
- Error **34**: called a merge resolved on zero conflict markers when the file does not
  parse. `node --check` is the instrument; no markers is not valid code.

Count now **34**.

### Credit where due

**#67 runs 16 checks and surfaces the failing `browser-and-print`**, which every other new
candidate hides by running only 4–7. That is the builder answering **CI-02** directly, and
the newer workflows carry no branch filter. CI-02 stays open for the older filtered ones,
and `main` still carries exactly **one** workflow against the newest candidate's thirteen.

The report that *"applicable automated checks for all four new candidates completed
successfully"* is true but materially narrower than it sounds.

### Correction to this morning's advice to the founder

I told him one clean merge delivers everything. **That is no longer true.** The object has
grown by eleven candidates, #63's validation covers only up to #62, and no composite
validation of the current stack exists. Sequencing is the builder's to propose and his to
decide.

---

## Seventh update — the queue closes: all five candidates reviewed

| PR | review | criteria frozen at | verdict |
|---|---|---|---|
| #71 Kartarpur | RT-027 | `c371460` | **PASS 14/14** |
| #73 Daily publisher | RT-028 | `4d412c0` | **PASS 14/14** |
| #72 Farid | RT-029 | `b605a81` | **PASS 12/12** |
| #74 Explore | RT-030 | `1b3b54f` | **PASS 12/12** |
| #66 Haumai | RT-031 | `a9ea8e0` | **PASS 13/13** |

Every criteria set was committed before the candidate was opened, and findings were committed
before builder tests or evidence were opened. Both orderings are in git rather than asserted.

**Three falsifiers fired and I recorded them as such** rather than hunting for lesser
findings: #71 sources every claim and invents nothing; #73 fails closed and activates nothing;
#72's attribution and text are exact.

### Findings opened

| ID | State | Substance |
|---|---|---|
| **HIST-01** | OPEN | The history registry checks that a sentence *cites* a claim, not that the claim *supports* it. An invented dawn scene with invented speech passed every structural guard once the readable copy was regenerated. Not a defect in #71, which invents nothing; a gap in the mechanism the project will lean on as chapters accumulate |
| **RIGHTS-01** | OPEN-OWNER-DECISION | Activating the Daily publisher hosts custodian-sourced readings at a public `github.io` URL five times a day. "Not approved" is a status we set; it is not a permission |

### Finding corrected

**EXP-01 → OPEN-CONDITIONAL.** `explore/app.js` does not exist at `main`, at the #62
composite, at #70 or at #74 — only on unmerged #41. It was never a live defect in the
shipping application, and my indexing it `OPEN` this morning read as though it were. It
applies only if #41 is merged.

### Two superseded branches that must be closed rather than merged

This is now a pattern with three instances, and the hazard is identical each time: merging a
superseded branch silently undoes what a later candidate fixed.

- the **Knowledge chain** (CHAIN-02) — resolving `knowledge/index.html` toward #58 undoes MOD-01
- **#41** (EXP-01) — targets `main` directly carrying an unverified Gurbani surface

### What the builder got right, recorded because it is most of the story

- #71 named the pauri's Ganga-flowing-backwards metaphor as a temptation and **refused to
  literalise it**; flagged Macauliffe's colonial framing unprompted; preserved the
  Aarti/Sohila divergence rather than reconciling it; under-claimed its own generational
  inference relative to the arithmetic.
- #73 found its own near-miss (local git config could widen a push), fixed it, and wrote a
  regression that **enables** the dangerous configuration to prove the override holds.
- #72 assigned authorship to **nobody** rather than to Farid, encoding SIG-01's lesson as
  data, and flagged exactly the eleven Guru-authored saloks.
- #74 made search structurally incapable of running on unverified data, and made the loader
  **refuse a pack that claims approval**.
- #66 closed the Web Locks dependency the right way — refusing the save while **keeping the
  reader's unsaved text** — and covered a disclosure channel I had not specified (print).

### Error count

Now **36**. Three of today's are worth carrying forward as method:

- **35** — a vacuous test through the wrong entry point nearly became "per-line verification
  not reached". Fourth such result of the session, so the rule is now explicit: **when a test
  returns the answer I expected, that is exactly when to check I measured the right thing.**
  It then prevented a false accusation of spiritual scoring in RT-031.
- **36** — a commit message of mine claimed a register correction that had silently failed.
  Recorded rather than quietly fixed.
- The **wrong-yardstick near-miss** in RT-029: I almost reported dropped joiners as an
  undocumented difference, measuring against a provider the candidate never claimed to follow.

### Outstanding, and not closable by review

Physical iPhone/iPad/VoiceOver/airplane-mode acceptance · printed-source collation against a
second textual lineage · audio rights · qualified content review (de-gated by founder ruling,
but that ruling does not make my historical claims authoritative) · the branch-protection rule
on `main` · and the three founder decisions above.

`main` remains `a3476ac4b9be90dde350fb35dd13ce0b672c120d`, `protected: false`, unchanged
throughout the entire session.

---

## Eighth update — the founder's rulings on HIST-01 and RIGHTS-01

### Ruling 1 — historical support verification: ChatGPT proposes, Claude double-checks

Founder, verbatim: *"historical review is between chatgpt and claude - you can make initial
clalc and claude double checks it. Keep in mind we are focused on authentic sources."*

**Accepted, and it gives me a real job I had explicitly left undone.** RT-027 listed as not
verified: *"The four web sources' content. I did not fetch learnpunjabi.org,
sacred-texts.com or sikhri.org to confirm the quoted locators say what the draft reports."*
That is precisely this task, and it is checkable.

**What this arrangement can establish.** Claim-to-source fidelity: that every claim cites a
source, that the cited locator exists, and that **the source actually says what the claim
reports it says**. That is mechanical, repeatable, and exactly what *"focused on authentic
sources"* asks for. It closes the larger half of HIST-01.

**What it cannot establish, stated once and then left alone.** That a source is *right*. Two
systems agreeing that the Encyclopaedia of Sikhism says X does not make X historically true,
and the standing constraint remains in force:

> "Do not declare unreviewed material authentic merely because two AI systems agree."

So the arrangement moves HIST-01 from *unowned* to *owned for the checkable half*. The
app's labelling must keep carrying the distinction: a claim can be **faithfully sourced**
without being **established**. #71 already does this — its classifications are
`Early historical account` / `Unverified attribution` / `Traditional Sakhi`, and
`qualifiedHumanReviewCount: 0` sits in the data.

**HIST-01 status: OPEN → OPEN-OWNED.** Owner: ChatGPT proposes, Claude verifies
claim-to-source fidelity. Residual, permanently: historical truth and contested adjudication.

**First action attempted immediately, and blocked.** I tried to fetch
`eos.learnpunjabi.org/KARTARPUR.html` and the SikhRI article to verify #71's C2, C3, C4, C6
and C9 against their stated locators. Both calls required approval that went unanswered, so
I stopped rather than retrying. **The check is queued, not done.** It needs one approval and
then it runs.

### Ruling 2 — the Daily Hukamnama: provenance given, permission not yet settled

Founder, verbatim: *"daily hukumnama is published by golden temple or harimandir sahib ji. We
get it from the published hulumnama and we should have the explanation since we are doing
complete guru granth sahib ji."*

The provenance is right and matches what the code does — the reading comes from the published
Hukamnama. But this does not yet answer RIGHTS-01, for a reason that is the founder's own
standing rule rather than my opinion:

> "Public availability does not establish permission to redistribute, host, embed, cache
> offline, create excerpts or reuse timing data."

I am recording that once and not re-arguing it. What is more useful is that **the question
splits into three parts with three different answers**, and only one of them is actually a
problem:

| what | status |
|---|---|
| **The scripture text itself** — the Gurmukhi of the shabad | Centuries old, not subject to copyright. Hosting the original text is **not** a rights problem |
| **The daily selection** — *which* passage, on *which* date | This is Harmandir Sahib's act, and the rule above names timing data explicitly. Re-publishing it as a dated feed is the part worth asking about |
| **The explanation or translation** | If taken from any modern published source it is **copyrighted and cannot be used**: *"Do not reproduce copyrighted modern translations, commentary, recordings or book layouts without authorization"* |

So *"we should have the explanation"* needs splitting. We cannot take theirs. If we write our
own, that is Ruling 1's territory and the qualified-review question, not a rights matter —
and the app currently ships **empty, labelled explanation slots** rather than generated prose,
which is the correct posture.

**My recommendation, lowest-risk and quickest:** publish the **original Gurmukhi only**, carry
no third-party explanation, and send a short courtesy request to the custodian for the dated
selection before activation. The legal exposure on the text alone is slight. The reason to
ask anyway is not primarily legal: this is built with reverence toward the institution that
publishes the Hukamnama, and a letter costs very little against that.

**I have drafted that request** — see
`reviews/claude-independent/drafts/HUKAMNAMA_PERMISSION_REQUEST_DRAFT.md`. Drafting is
permitted; contacting is not, and I have contacted nobody. Sending it is the founder's act.

**RIGHTS-01 status: unchanged, OPEN-OWNER-DECISION.** Narrowed: the text is fine, the
explanation is settled (we write our own or ship none), the dated selection is the open item.
