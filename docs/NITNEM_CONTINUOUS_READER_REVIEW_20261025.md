# GLP-001 — Continuous Nitnem Reader · Private candidate Revision 2

**25 October 2026 Pacific — QA and engineering only.** User goal: every bani should be as natural to read as the existing full Japji Sahib, **inside the same library without third-party scripture links**.

## What changed

The source reader now defaults to **Continuous reading**. Every original Gurmukhi line of the selected digital source candidate is present in one uninterrupted vertical reading, with original ordering, source SHA-256, separately identified printed headings, and passage boundaries retained. Users can scroll naturally through Sohila's five shabads, the ten morning Savaiye, 29-pauri site-specific Chaupai, complete 40-pauri Anand, 44-unit SGPC-sequence Rehras, and 199-chhand Jaap. One Passage remains available for focused reading or resource-constrained devices; the same original byte sequence is used in both modes, with no separate source or competing application.

Read, Meaning and Study controls, Gurmukhi size (28–60px), Day/Amrit theme, direct passage-jump, silent word guide, individual bookmarks, local original-source reflections, and source-edition scoped import/export remain intact. **Meaning and Study translations have not been approved and are not invented**; Study currently contains only source facts. Ardas remains a separate companion practice under source review.

**Continuous reading implementation:** `nitnem/reader.js` renders all source units with a bounded, line-ID-keyed map for O(1) active word updates rather than scanning thousands of word spans each frame. Manual scrolling updates the selected source occurrence via a throttled binary search over the loaded ordered lines; the displayed location and saved state follow. Direct jumps and passage toggles preserve the source location and do not reword or reorder scripture. Jaap's 782 original rows are fully present, rather than requiring 199 Next taps. The original Japji `js/continuous-core.js` is copied byte-identically and remains unchanged.

**Anand source discrepancy safety:** `anand24.line03` stays hash-pinned in the source-review asset but is never rendered as approved scripture; both reading layouts display the source-review hold and the silent guide stops when it reaches that occurrence. The original digital text remains unmodified pending independent Unicode/SGGS edition adjudication.

## Release strategy and persistence

The first private Full Nitnem source-review application lived at `/nitnem/` with its own `glp-nitnem-source-review:` cache. Simply changing those exact URLs could leave a Safari/iPhone holding on to previously cached HTML and worker scripts, so this release deliberately uses a **new private versioned route**: `/nitnem-continuous/`. The *same existing owner invitation* now redirects there. It shares the same host, notes and source-edition browser keys, and it preserves the previous `/nitnem/` source reader as a rollback.

Its service worker is separately scoped to `/nitnem-continuous/` and has a disjoint cache prefix `glp-nitnem-continuous-review:`. It does **not** remove the legacy review cache, the original root Japji `glp-static:` cache, or canonical Japji `glp001.continuous.v2` learning. The Quick Tunnel, bearer invitation, authenticated cookie, private manifest and owner-only keys are reused; nothing is merged or deployed to public GitHub Pages. The private invitation is a bearer capability, not named-person authentication. No URL tokens, hostnames, private notes or cookies are checked into GitHub.

**New immutable snapshot:** `~/Library/Application Support/GurbaniLearningLibrary/previews/full-nitnem-continuous-20261025`, derived from the last verified snapshot with 12 newly pinned assets under `nitnem-continuous/`, 15 older allowed assets untouched. Private 27-file extension manifest: `previews/serenity-invite-20261025/full-nitnem-continuous-extra-sha256.json`. Only the private gateway on port 8908 was switched; the existing Cloudflare tunnel stays pointed at that port.

**Rollback:** stop only the upgraded gateway on loopback 8908. Restore the previous `tests/serve-gated-internal-nitnem.py` with `previews/full-nitnem-integrated-20261025` and the previous 15-asset manifest. That returns the owner invitation to the old `/nitnem/` reader; existing original Japji and both reading caches are left intact. Do not reset Tailscale, delete browser storage, overwrite earlier snapshots, or merge unapproved source changes. The previous externally linked Nitnem Today remains at its prior route for historical rollback, but is no longer our product direction.

## Evidence

- 52 **real isolated Mac Chrome** checks PASSED against local version: continuous 56-line Sohila, 199-chhand/782-original Jaap scroll, One Passage fallback, text/source SHA parity, manual scroll and resume from Chhand 50, 60px script, 320px layout, source-edition notes/bookmarks and blocked network offline access to Jaap, Anand, Rehras.
- 54 **real Mac Chrome checks on the existing external HTTPS invitation** PASSED: secure tokenless reader session, same-site original readers and continuous navigation, source SHA, navigation, blocked-network offline test, no third-party source requests.
- 61 **real Mac Chrome versioned rollback checks** PASSED: legacy and new candidate service workers installed under disjoint scopes; earlier Jaap synthetic note preserved into the new version without migration; both offline caches and source texts reopened with networking blocked; no JavaScript errors.
- 50 **ephemeral gateway defense checks** PASSED: exact 27-route allowlist, false-source-hash refusal, anonymous 401, forged cookie 401, token access, no POST, no private source/test/doc disclosures.
- Static source checker remains pinned to 1,361 original digital Gurmukhi occurrences and the exact source-candidate commit, and all separate original Japji/learning/service-worker regression tests remain required.
- Public GitHub Actions performs only read-only offline source custody/QA and does **not** deploy anything. Reports/screenshots are sanitized to exclude token, host and personal reading data.

## Remaining release gates

Original digital transcriptions are **not independently SGGS/Dasam edition collated or authorized as a certified Gutka**; qualified Sikh/Punjabi review, source rights, the disputed Anand Pauri 24 character, the explicit Chaupai morning variant choice, approved line meanings and deeper study are unfinished. The physical iPhone Safari, VoiceOver, long-session and real Airplane Mode checks remain unverified by the Mac Chrome tests. A named authenticated permanent domain and fully versioned public family release also remain future decisions. The founder's final publication authority is separate from technical checks.

**Actual delivered outcome:** one coherent, privately usable seven-bani original-text source-review application, defaulting to a continuous full-bani reading experience without external scripture links. It is still a private beta, not an approved family publication.
