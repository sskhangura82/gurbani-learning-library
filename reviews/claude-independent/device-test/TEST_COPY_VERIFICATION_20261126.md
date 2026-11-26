# The iPhone test copy — is it what it says it is?

Checked 26 November 2026 (UTC) by Claude, independent second reviewer. I did not build or deploy the test copy and
have not changed it.

| | |
|---|---|
| Test address | `glp001-iphone-qa.github.io/glp001-iphone-test/` — public, unlisted, not private |
| Test repository | `glp001-iphone-qa/glp001-iphone-test`, one commit: `99297203cf1b30f700a6cef0b75e616026cc88ee` |
| Says it was built from | PR #40 at `09e829efd63e99fc5c3f5f849f122a49b0dc22a9` |
| Owner's approval | Given to me directly in chat on 26 November 2026. The earlier blocker is closed. |
| How I checked | A copy of the test repository compared file by file with the candidate; every offline fingerprint recomputed; the copy served on this machine and put through the same rehearsals as the candidate (Chromium, phone-sized window). |
| Not checked | That the live address serves exactly the repository's files — this workspace cannot reach the address. One page read through a fetch tool showed the banner and no build label. No phone, no Safari, no VoiceOver. |

## 1. The answer

**Yes — it is the repair candidate, plus a label.** Nothing in the reading, saving or checking code was touched.
Two things about the label itself need correcting before a phone result taken on it can be trusted, and one small
file is missing.

## 2. What matches

| Checked | Result |
|---|---|
| Files in the test copy | 60 |
| Byte-identical to the candidate | 47 — including **all 27 scripts** that read, save and check, **all 8 data files** (Gurbani and teaching) and all 8 style sheets |
| Changed | 12, all as the builder described: the 8 pages (title prefixed "TEST COPY", one style-sheet link, the banner), the app's Home Screen name ("GLP QA"), one comment in `robots.txt`, the read-me, and the offline list (new version name and new fingerprints for the 8 changed pages) |
| Added | 1 — `qa-banner.css` |
| Offline list | 58 entries; **58 of 58 fingerprints match their files** |
| Banner | on 8 of 8 pages: "TEST COPY — NOT THE LIBRARY · Unreleased reader repair candidate · Use made-up notes only · Not scholar approved" |
| Request to search engines not to list it | on 8 of 8 pages, and in `robots.txt` |
| Separate storage | The hostname differs from the published site's, so notes typed here cannot reach the real site's saved data, and the reverse |
| Anything personal | No e-mail address, no exported notes file, no saved learning in the repository |
| Left out of the copy | 181 files — tests, evidence, documents, research, tools. None is needed to run the app |
| Behaves like the candidate | The Safari part of the iPhone script: 13 of 14 steps as written, the same as the candidate. The reading-place fault (CI-R-11) and the unlisted notes (CI-U-11) are present, as expected — it is the unrepaired candidate |

Evidence: `evidence/tc_01_test_copy_compared_with_source.json`, `evidence/dt_02_journey_rehearsal_test_copy.json`,
`evidence/dt_01_saved_place_on_reopen_test_copy.json`.

## 3. What needs correcting on the test copy (builder's lane)

These are faults of the test label, not of the reader. They are kept out of the main findings register.

### TC-01 · The banner covers the line being read — matters for the phone check

The banner is fixed to the top of the screen and is 76 pixels tall. The Japji reader places the line being read 14
pixels from the top. So the banner sits on top of it.

- After jumping to Pauri 5, 20 and 38, at three phone widths: in **9 of 9** cases what is on top at the reading line
  is the banner, covering 57–62 pixels of it. At Pauri 5 the first line of the Pauri wraps onto two rows and the banner
  hides the first row — a line of Gurbani shown cut in half (`evidence/screenshots/testcopy_japji_pauri5.jpg`).
- In the Nitnem reader the banner covers the reader's own top bar once the page is scrolled: the back arrow, the
  title and the Light and Dark buttons — **4 of 4** covered (`evidence/screenshots/testcopy_nitnem_scrolled.jpg`).

Why it matters: the phone check asks which line the reader returns to, and what VoiceOver reads first. With the
banner over the reading line, a correct reader looks one line off, and the tester saves a line he cannot see.

Suggested correction, without touching any script: let the full banner scroll away with the page, and keep only a
thin coloured strip fixed at the top (under 14 pixels), so the copy is still unmistakable at every moment and
nothing is covered. Acceptance: `tools/dt_03_test_copy_banner.py` reports "the line itself" on top in 9 of 9, and
the Nitnem bar's four controls reachable.

Evidence: `evidence/dt_03_test_copy_banner.json`. Emulation only.

### TC-02 · No build label can be seen

The offline list carries a version name (`iphone-qa-pr40-09e829e-1`) but no page shows it. The owner has asked for a
visible source commit and build date. Until it is there, a phone observation cannot be tied to a build by looking at
the screen — only by the time it was made. Put the label in the banner text: source commit, staging build number,
date.

### TC-03 · Two small licence files were not copied

The Gurbani data in the app comes by way of Open Granth, whose licence asks that its copyright and permission notice
travel with copies. The candidate carries them (`vendor/opengranth/LICENSE`, `vendor/opengranth/NOTICE`); the test
copy leaves them out. The data files still name their source. Copy the two files across. I am not a lawyer; this is
a low-cost courtesy either way.

## 4. What this does and does not establish

- It establishes that the repository behind the test address holds the repair candidate with a label, and nothing
  else.
- It does not establish that the candidate is good. PR #40 is unrepaired and unmerged; the open findings stand.
- It does not establish anything about an iPhone. The owner has opened the address on his phone and seen it work;
  by his own words that is a first look, not the formal check.

## 5. For each later build of the test copy

Before a phone result is taken on a new build, rerun:

```
python3 -I tools/tc_01_compare_test_copy_with_source.py <source repo> <source commit> <test repo> <staging commit> evidence/<name>.json
python3 tools/dt_03_test_copy_banner.py <local address of the copy, ending in /> evidence/<name>.json
```

The first shows that the copy is the named commit and nothing else. The second shows the label is not in the way.
