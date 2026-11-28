# RT-008 — RB-01 on PR #53: frozen attack criteria

Committed **before** opening `knowledge/registry.mjs`, the builder's tests, docs
or evidence. Read first: PR shape and changed file **names** only.

- Candidate: PR #53, head `83acf3f9e4c69c346f2be16d02f407838a137cf9` — **matches
  the commit the founder named exactly**.
- Base: `94f004a842eb1bdf2da879074c2f4c701d54030e`, the knowledge-pilot commit
  this seat reviewed in round 3b.
- Runtime change is confined to `knowledge/registry.mjs` (+22/−1). Everything
  else is tests, docs, evidence and a workflow line.

## Prior exposure, disclosed

None on this candidate beyond the file-name list. I have not read
`knowledge/registry.mjs` on this head, nor the builder's
`tests/knowledge-editorial-title.mjs`, nor
`docs/GLP_KNOWLEDGE_EDITORIAL_TITLE_REPAIR_20261126.md`, nor the evidence files.

I do carry my own prior knowledge of the defect, because I raised it: in the
round-3b 30-case edit test, 28 edits were unwanted and 27 were caught; **one
unwanted edit passed**, letting an editorial title display `ਸਲੋਕੁ ਮਃ ੧ ॥` under
a "Library topic" label. The scripture text itself stayed intact.

## What this review is, and is not

The founder's instruction is to **attempt to make editorial titles,
interpretations or teaching material appear as original Gurbani or
author-attributed scripture, and verify the attempts fail.** This is an attack,
not an inspection. A repair that merely blocks the one string I reported in
round 3b is not repaired; it is patched against my test. So the attacks below
deliberately go wider than the original leak.

## Attack criteria — each PASSES only if the attempt FAILS

| ID | Attack | Repair passes if |
|---|---|---|
| RT8-A1 | Put the exact original leak `ਸਲੋਕੁ ਮਃ ੧ ॥` in an editorial title | refused or rendered unmistakably as editorial, never as scripture |
| RT8-A2 | Put a **different** scripture heading — `ਮਹਲਾ ੫ ॥`, `ਮਃ ੩ ॥`, `ਸਲੋਕੁ ॥` — in the same field | same |
| RT8-A3 | Put a real Gurbani **verse line** (not a heading) in an editorial or teaching field | same |
| RT8-A4 | Put an author attribution — `ਨਾਨਕ`, "Guru Arjan", a Mahalla number — in an editorial field so it reads as authorship | refused, or no authorship is conferred |
| RT8-A5 | Put Gurmukhi in **every** editorial/teaching field the schema allows, not only the title | every field refuses or labels |
| RT8-A6 | Use a closing danda `॥` and Gurmukhi numerals to imitate a numbered scripture unit | refused or labelled |
| RT8-A7 | Smuggle markup — HTML tags, entities — into an editorial field to escape its label | no markup executes and the label survives |
| RT8-A8 | Use zero-width, bidi or combining characters to defeat a string-level block | a character-class or structural rule still catches it, not a blocklist |
| RT8-A9 | Make a teaching passage render inside the scripture region of the DOM | structurally impossible |
| RT8-A10 | Mutate the teaching package only, leaving scripture untouched, and check the scripture integrity record is unaffected | scripture record unchanged **and** the teaching change still detected |

## The question behind the attacks

RT8-A8 is the one that matters most. If the repair is a **blocklist of strings**,
it will pass A1 and fail A8. If it is a **structural or character-class rule** —
no Gurmukhi permitted in editorial fields at all, or editorial fields rendered
only inside a labelled container that cannot be escaped — it will pass both. I
will report which kind it is, because that determines whether the next
scripture-shaped string someone types also gets caught.

## Method limits

- Synthetic learning records only. No real reflections touched.
- No scripture is modified. Mutations are applied to in-memory copies or to a
  throwaway worktree, never to the repository's scripture packages.
- Every genuine failure is preserved and reported, including any of my own.

Verdicts: PASS / NEEDS_REVISION / INCOMPLETE.

Frozen at this point.
