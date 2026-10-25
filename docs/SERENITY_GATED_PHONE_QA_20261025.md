# GLP-001 Serenity — iPhone-link delivery repair (25 October 2026)

**Status: bearer-invitation gated QA preview, not public family release. No merge or production publishing.**

## Failure observed and bounded diagnosis

The prior `.ts.net:10001` link was not opening for the user from the iPhone chat context. At the time of diagnosis, the Mac's HTTPS endpoint returned 200, Tailscale reported both devices online, and the Mac received an authenticated Tailscale ping from the iPhone. This **does not prove** that the phone Safari browser or the ChatGPT in-app browser resolved or opened the link. Possible browser/VPN differences are unconfirmed; do not blame a specific UI or tell the user it was tested on native Safari.

The working family **R7** public GitHub Pages reader and prior tailnet previews were left unchanged.

## Alternative access method built

- Existing reviewed runtime only: frozen Serenity review-2 snapshot from PR #18 source commit `5637eabc22c3ac37857b4fc95c13e8d66c6714a5`, with generated service worker `0.9-japji-v1-m0-serenity-review-2` and all **33 pinned static files**. This is still the same 385-source-line Japji reader, no new teachings.
- A separate loopback HTTP gateway `tests/serve-gated-phone-preview.py` uses the existing SHA-256 allowlist, rejects Git/source/docs/test paths and all uploads, and holds neither reader notes nor account details.
- A new independent Cloudflare **Quick Tunnel** terminates public HTTPS without requiring the iPhone's Tailscale connection. Anonymous requests to Home, reader, worker and CSS return **401**. A high-entropy 256-bit invitation link exchanges its bearer token for an HMAC-signed, **Secure + HttpOnly + SameSite=Lax** first-party session cookie. The bearer token is removed from the final reader URL by redirect; the server does not log requests or cookies and sets `no-referrer` / `noindex` / `no-store`. The local invitation and signing key are in owner-only, mode-0600 config files **outside GitHub**.
- This is **bearer-link access control, not named-user or identity authentication**: anyone forwarded the invitation can enter. Users must not forward it or upload private family reflections. Different origins have separate browser-local saved learning.
- Invitation expiry is **8 November 2026 at 11:55 UTC**; it can be revoked immediately by shutting off the new tunnel and gateway. The anonymous Quick Tunnel itself has **no uptime or permanent-hostname guarantee**. Neither the public hostname nor token is present in this public repository. A permanent, account-managed authentication/domain deployment is a separate authorized release task.

## Verification

**15 / 15 actual desktop Chrome checks passed** using a fresh browser profile and the new external HTTPS invitation flow. These cover cookie security, removal of token from final URL, Git file denial, HTTPS context and Web Locks, 385 unchanged source lines, compact 320/390px controls, installed versioned service worker and Serenity CSS, synthetic Punjabi note/bookmark retained after real reload, blocked-network Home/reader operation and saved learning, and zero browser exceptions.

A separate `tests/gated-preview-contract.py` runs a fresh throwaway-secret gateway only on loopback and verifies anonymous 401, invalid-token 403, valid 303 + cookie, allowed reader/worker/assets, forbidden paths, write refusal, tamper rejection and safe headers. **21 defensive checks passed locally.** These are automated QA checks, not native iPhone/Safari/VoiceOver results. Receipts are in `evidence/serenity-gated-https-readiness.json`; secrets and hostname intentionally omitted.

## User acceptance

Send the private invitation URL to the founder **through the existing chat**, not the public PR. Ask the user to tap once; if the ChatGPT in-app browser does not open an external website, open the same link in **Safari**. It needs internet access but **not Tailscale**. Confirm actual page load, one change of mode, 60px scripture reading, a synthetic bookmark, and—only after the app indicates caching—physical Airplane Mode reopen. Report the first failure without disclosing private notes or device identifiers.

**Remaining release gates:** physical iPhone Safari/Home Screen/VoiceOver/Dynamic Type/airplane-mode tests, design acceptance, qualified Sikh/Punjabi scripture and psychology review where applicable, independent source-edition collation, final founder publication word. PR #18 stays DRAFT; R7 remains the live family version and Mind PR #19 remains held. A passing QA access test is not release authorization.
