# Original-text reader browser acceptance

Recorded before fixture implementation against root `fdcb2a2`.

The browser fixture will exercise the real public SGGS and Dasam reader
delivery, using only the named imported digital source and synthetic saved
places. No private collection, owner PIN, existing browser profile or personal
reflection record is part of this test.

1. Verify exact complete owning source groups at both ends of their reported
   page spans: SGGS ZKH (14 lines, Ang 1–2), SKD (15, 465–466), TNM (399,
   929–938), and FD3 (62, 1429–1430). Compare every rendered original-text
   node, line identifier and source page against a unit whose hash is fixed in
   the fixture. These are provider groups, not inferred traditional
   composition boundaries.
2. Verify Dasam KKH, 4TJ and BTE against their complete source groups and
   edition-specific page labels. Page labels must not be presented as SGGS Ang
   references. Source-reported metadata must retain that qualification.
3. Exercise page entry, previous/next, reload, Back/Forward, and a line-specific
   deep link. A deep-linked line must belong to both the selected group and
   the selected source page. Malformed, duplicate and unknown route parameters
   and mismatched ownership must refuse with no original text. A Go action may
   recover after refusal.
4. No automatic resume or save. Explicit Save writes only the new
   collection-and-edition-specific key. Resume must verify the saved unit and
   line/page relationship. Unrelated, corrupt and stale synthetic records
   remain byte-for-byte unchanged; invalid records are not silently repaired.
5. A changed manifest or source chunk must refuse before source text appears.
   Record baseline and modified hashes and confirm the corresponding valid
   path renders successfully. Source-script delivery should remain within the
   intended same-origin reader/data paths.
6. Verify 320 CSS pixel layout, retain representative screenshots and report
   uncaught script errors or unexpected external requests. Use a fresh
   temporary headless Chrome context and close test contexts and servers.
7. Preserve actual failures, report exact source/fixture hashes and distinguish
   synthetic desktop verification from real iPhone/Safari/VoiceOver or Claude
   review. Do not change application files to make assertions pass silently.

Agreed UI hooks: `html[data-source-state]`, `#source-status`,
`#source-page-label`, `#source-page-form`, `#source-page`, `#source-groups`,
`[data-group-id]`, `[data-source-line-id]`, `[data-source-page]`,
`#source-previous`, `#source-next`, `#source-save-place`, `#source-resume`, and
`#source-progress-status`. The line attribute belongs on the exact original
text node, with metadata outside it.
