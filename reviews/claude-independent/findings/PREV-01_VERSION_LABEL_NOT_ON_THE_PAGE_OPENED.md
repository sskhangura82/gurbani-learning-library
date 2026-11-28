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


---

# WITHDRAWN, 27 November 2026 — my instrument could not answer the question I asked it

**PREV-01 is withdrawn. Not "unresolved" — withdrawn.** The builder's evidence
stands, and the defect I reported should be treated as never established.

## What the builder produced

They re-checked the live root and `preview.html` at 02:06–02:07 UTC and reported
the raw root response byte-identical to QA main `63780b0a15c5`, containing the
literal `Source build: 389e79b · 26 Nov 2026 · Preview 4` and all four
Today / Read / Explore / Saved links, with a fresh desktop Chrome context at
390px and 1440px displaying the label and each link opening its panel. Response
hashes `b12d261ae558…` (root) and `c2a02014f7d9…` (guide), with raw responses,
headers, DOM, screenshots and the browser instrument retained.

They also said, fairly, that my extraction is not in their record so they cannot
distinguish stale retrieval from extraction loss, and asked me to compare.

## Why I cannot, and why that settles it against me

I asked my fetching tool a third time, with a maximally targeted prompt. It
returned "Source build": ABSENT and "Preview": ABSENT again. Then I asked it for
the page's script tags, and it answered:

> It appears to be a text or markdown rendering with the markup stripped, so
> tags may have been removed before I received it.

**That is the whole finding.** The tool hands me converted text, not bytes. It
cannot see a `<script>` tag, which means it does not execute JavaScript, which
means anything rendered by script is invisible to it — and it cannot speak to
raw bytes at all. Its three "ABSENT" verdicts are three readings of the same
unsuitable measurement, not three corroborating observations. I treated
consistency as confirmation when it was only repetition.

I then tried the correct instrument: a real Chromium via Playwright in this
workspace. The network allowlist refuses that host —
`net::ERR_TUNNEL_CONNECTION_FAILED`. So I have **no instrument capable of
rendering that page**, and I cannot perform the comparison the builder asked
for; repository access to `glp001-iphone-qa/glp001-iphone-test` was also denied
to this session.

A finding whose only support is an instrument structurally incapable of
answering the question is not a finding.

## What I should have done

My own PREV-01 text already listed the limitation — "Pages and any CDN in front
of it can serve a cached copy, so what I fetched may lag the deployed commit."
I wrote the caveat and then reported the conclusion anyway, including to the
founder, whom I told the label was missing and advised to append
`/preview.html`. Naming a limitation does not discharge it. The instrument
should have been established as fit for the question **before** the finding was
raised, not footnoted after.

## Status

- **PREV-01: WITHDRAWN.** No product defect is asserted. No remedy is requested.
  The suggestion that the root needs a build label and a guide link is also
  withdrawn, since its premise is unsupported.
- The founder has been told directly that I was wrong and what the correct
  instruction is.
- Instrument error **twenty-one**, and the most consequential of the session: it
  reached the founder and concerned the build he was about to test.
