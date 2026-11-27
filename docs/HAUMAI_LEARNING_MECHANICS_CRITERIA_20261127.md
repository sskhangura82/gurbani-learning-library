# Haumai learning mechanics — builder acceptance criteria

Frozen before implementation on 27 November 2026. These are builder criteria, not the independent review seat's criteria or approval. Baseline: 7f36c3039ca95fac6e69ca28f631b9e3734c70e9.

## Scope

Extend the existing Knowledge page with one source-bound Haumai learning-mechanics candidate. Do not duplicate scripture or generate interpretation. The original passage is the complete eight-occurrence Guru Angad Dev Ji Salok already present in knowledge/scripture.json. The distinct Mahalla 9 Haumai source sheet stays distinct and unchanged.

## Acceptance behavior

1. The full existing source passage resolves through its existing verified package and frozen stable identity/digest. Scripture, teaching, source-lock and registry bytes remain unchanged.
2. Qualified explanation and Gurbani practice slots are visibly empty. Existing AI-assisted draft material is optional and labelled; its remedy-clause omission is disclosed as unresolved, without writing a replacement interpretation.
3. A learner can write a private question and initial reflection, choose an optional return date (including a week from their device's local date), and later retain that reflection alongside a separate later reflection. No generated answers, imposed practice, activity logging, completion scores, streaks or notifications.
4. The original reflection becomes read-only after saving. A new record permits another independent reflection. A return date is an explicit personal intention, not a claimed theological or evidence-based schedule.
5. Notes have exact passage/edition/digest and lesson-revision bindings. Existing bindings never move to changed source bytes. Unavailable bindings remain visible as historical private records and exportable, but cannot be edited against a different source.
6. A Knowledge-owned bounded store uses an exclusive Web Lock, rereads current data before mutation, and writes once. Stale concurrent edits preserve both versions. Missing locks, malformed current data, quota errors and size refusal preserve existing data and unsaved input.
7. Export/import is explicit and scoped to Knowledge learning. Import preserves all identities and conflicting versions; repeated restoration of the same backup is idempotent, including conflict copies in either order. Invalid, duplicate-identity or oversized backups leave the store byte-identical.
8. Private text never enters a URL or network request, renders as text, and is hidden from print. Saved navigation in the owning Knowledge page works without aggregating other readers' private data.
9. Return dates compare local calendar dates without session telemetry. Notes show immediately whenever requested; the return prompt is gentle and available on revisiting the page, with no missed-day wording.
10. Existing comparisons remain distinctly labelled and outside qualified explanation/practice slots. No new comparative or theological claims are authored.
11. Existing knowledge navigation/search/attribution safeguards continue to work. Protected closed module bundles, exact input policy, SRI and offline hashes are refreshed only for intentional changes.
12. Test meaningful failure and recovery paths with synthetic data and fresh Chromium contexts, including mobile widths, reload, Back, stale edit, repeated import, corruption, quota, source mismatch, private-print exclusion and no network leakage. No real-device, Safari, VoiceOver, qualified review or live-release claim.

## Review boundary

Local branch and commits only for this work. No push, PR, merge, deployment, reviewer-folder edits or custodian contact. Independent review and founder release decisions remain pending. This is not a complete qualified learning journey.
