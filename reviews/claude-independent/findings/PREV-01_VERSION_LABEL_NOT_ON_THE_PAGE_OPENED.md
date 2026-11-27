# PREV-01 — the version label the founder is told to look for is not on the page he is told to open

**Severity: low technically, but it sits directly in the one acceptance path only the founder can walk.**
Opened 2026-11-27. Verified from outside, against the live site.

## What the staging receipt instructs

The builder's staging receipt on PR #38 (comment `7207276350`) gives the address

    https://glp001-iphone-qa.github.io/glp001-iphone-test/

and instructs: "Look for **Preview 4**. The existing update guide remains at
`preview.html` on that address."

The founder was told the same thing in chat: open it in Safari on the phone and
look for "Preview 4" at the top; and if the phone shows an older version, open
the preview guide and use its update controls.

## What the live site actually serves

**The root page carries no version label at all.** Fetched twice, the second
time with an explicit instruction to search the whole page including below the
fold and the `#destinations` section:

- the string "Preview" does not appear anywhere on the root page
- no version number, build label or date stamp of any kind
- no entrances named **Today**, **Read** or **Saved**; "Explore" appears only
  inside "Explore places ↗" on the Gurdwaras card
- **no link to `preview.html`**

The root page shows "TEST COPY — NOT THE LIBRARY", "Unreleased reader repair
candidate · Use made-up notes only · Not scholar approved", and cards for
Nitnem, Sukhmani Sahib, Gurdwaras, Simran Room and Japji Sahib.

**`preview.html` does exist and is correct.** It carries
"Source build: 389e79b · 26 Nov 2026 · Preview 4", names "Today, Read, Explore
and Saved: the new library entrances", and offers "Check for an update" and
"Load available update", with the warning "Do not clear website data to update."

`389e79b` matches the receipt's frozen source
`389e79baff4016a2ff61d1851908de0bd66beb8f`. **The deployment is the claimed
build.** This is not a deployment failure.

## Why it still matters

The failure mode is the one the builder's own message anticipates. A person who
opens the bare address, finds no "Preview 4" anywhere, and was told to look for
it at the top will reasonably conclude the phone is showing a stale version —
and the root page offers no link to the update controls that would resolve it.
The self-check the founder was given is unreachable from the page he was told to
run it on.

It also means a genuinely stale cache and a correctly updated install look
identical at the root. The version label is the instrument for telling those
apart, and it is on a different page.

## Suggested remedy, for the builder to accept or reject

Put the build label and a link to `preview.html` on the root page. This is a
content change to a test-only address and touches no scripture, no reader logic
and no production path.

## Method limits

Read from outside with a fetching tool, not in Safari and not on a phone. GitHub
Pages and any CDN in front of it can serve a cached copy, so what I fetched may
lag the deployed commit; `389e79b` appearing on `preview.html` argues against
that for the guide page at least. I could not read the
`glp001-iphone-qa/glp001-iphone-test` repository — access was not available to
this session — so every statement above is about served pages only, not about
that repository's contents.

This is not physical iPhone, Safari, Home Screen, VoiceOver or airplane-mode
acceptance, and nothing here substitutes for it.
