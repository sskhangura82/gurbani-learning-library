# GLP-001 · Full Nitnem Today — usable linked-reading preview

**25 October 2026. User asked for a usable seven-bani daily Nitnem experience today.**

## Delivery truth

This is **not** seven original transcriptions inside the library. It is an intentionally small, usable launchpad with 7 one-tap readings in order, external complete Gurmukhi text for six banis, the existing frozen Serenity Japji reader for the first, and a separate Ardas entry. Source editions, translations and teaching are NOT elevated to final approved status by any link or website statement.

The exact private preview invitation used for the existing Japji test now lands on `nitnem-today.html` on **the same host**, preserving original Japji at `full-japji.html`. The original public Revision 7 family site and the reader's existing hashed 33-file service worker are **byte-identical**. A new immutable snapshot was derived from the already verified source, with only three new files:
`nitnem-today.html`, `css/nitnem-today.css`, `js/nitnem-today.js`. They are SHA-256-allowlisted independently and **not inserted into the existing reader worker precache**.

The gateway still uses the existing owner-only private 256-bit bearer invitation, HMAC-signed Secure/HttpOnly/SameSite=Lax session cookie, same-origin static allowlist, no source/docs access, no writes, no query logs, and a Cloudflare Quick Tunnel with no long-term uptime guarantee. The origin and token live only in the owner's private Mac operator record and user chat—not GitHub. This is bearer-link access, **not** named-user authentication. The existing invitation expires November 8, 2026 UTC unless revoked sooner.

## Today’s external source paths

| Time | Bani | Source |
|---|---|---|
| Morning | Japji Sahib | Our same-origin 385-occurrence Serenity review reader, with link to accepted public R7 as fallback |
| Morning | Jaap Sahib | `https://www.discoversikhism.com/learn_gurbani/learn_jaap_sahib.html` |
| Morning | Tav-Prasad Savaiye | `https://www.discoversikhism.com/learn_gurbani/learn_tav_prasad_savaiye.html` |
| Morning | Benti Chaupai Sahib | `https://www.discoversikhism.com/learn_gurbani/learn_chaupai_sahib.html` |
| Morning | Anand Sahib (full 40) | `https://www.discoversikhism.com/learn_gurbani/learn_anand_sahib.html` |
| Evening | Rehras Sahib | `https://www.discoversikhism.com/learn_gurbani/learn_rehras_sahib.html` |
| Night | Kirtan Sohila | `https://discoversikhism.com/learn_gurbani/learn_sohila_sahib.html` |
| Companion | Ardas | `https://gurdwaras.com/nitnem/ardas` |

The six Discover Sikhism reading pages were confirmed live (HTTP 200 with Gurmukhi content) from the Mac on 25 October. Alternate Gurdwaras.com sources are provided except for Sohila: its online aggregation included additional unrelated passages beyond the five shabads, so we deliberately **do not** promote that URL as the alternative five-shabad reader. These links are external independent websites: they can change and may present different editions/recitation variants. Our canonical future original-text reader remains gated on qualified collation and rights.

## Usability, privacy and acceptance

- All seven reading actions are in HTML, functional even if the local progress script fails.
- Morning/evening/night order; 44px+ tappable targets, tested at 320px and 390px simulated phone widths.
- Optional marks set by user clicks, not automatically after clicking a third-party site. Progress is stored in a single **browser-local** date-scoped JSON record under `glp001.nitnem-today.progress.v1`; no server analytics or personal learning data is copied.
- No third-party code, iframe, API calls, audio or ads are embedded in our launchpad. Reading a linked external text navigates to an independently operated provider.
- External texts need internet; our linked-reading page is NOT a true all-seven-bani offline Gutka.
- 16 actual isolated Chrome loopback checks passed (layout, seven links, mark/unmark, persistence, daily rollover, zero third-party network calls).
- **22 actual Chrome private-HTTPS checks passed**, including bearer-invitation 303 redirect to Nitnem page, secure session cookie, linked Gurmukhi routes, daily marks, unchanged Japji 385-line reader navigation, and return from the original reader even after service-worker installation.
- Anonymous public access returns 401; unrelated Git or review files still return 404; writes are forbidden. No public main merge, Mind Room release, new translation, editorial approval or SGGS source change.

**Physical iPhone Safari acceptance is still not claimed**: user confirmed the prior invitation worked; user confirmation of this new landing page is the next real device acceptance. PR20 source candidate work remains separate and active. Full Nitnem Done definition still requires locally hosted approved texts, named editions, optional audio rights, qualified religious/linguistic review and true iPhone/offline testing.

## Rollback

Return the existing gate to `tests/serve-gated-phone-preview.py` with the unaltered `serenity-a11y-5637eab-20261024` snapshot and same original credentials; the Cloudflare tunnel, private token, original reader and existing family link can remain untouched. Or stop the preview gateway/tunnel only; do not touch public GitHub Pages, other Tailscale serves or user browser data. Never delete or auto-migrate existing Japji reflections.
