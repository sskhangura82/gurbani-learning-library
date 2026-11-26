# Browser storage refusal: preservation and recovery wording

Candidate work, 26 November 2026. No deployment or independent approval.

## The defect and bounded repair

A structurally valid learning backup can exceed available localStorage. The
existing importer correctly leaves the old record unchanged when setItem fails,
but its raw browser exception gave the learner no preservation reassurance.

The existing one-write path now reports a named, plain-language storage error.
The message says that existing saved learning is preserved, tells the learner to
keep the backup and export any unsaved reflection, and suggests another browser
or device with more available space. Other storage write failures receive a
preservation message without falsely saying the storage is full. Native vendor
exception strings are not rendered.

The same existing write lock, single setItem, edition aliases, per-note limits,
merge semantics and export format remain. No record is deleted to make room.
There is no automatic partial import, quota probing, cloud upload or access to
another person's notes.

## RT4-05: message repair on candidate, finding OPEN

The error-message repair is implemented and builder-tested. Claude's later
RT-005 response withdrew the fixed lower-cap recommendation and accepted retaining
the format ceiling with an atomic storage attempt and a clear quota refusal.
That design agreement is not independent verification of this candidate.
RT4-05 remains OPEN for retest. The collection-derived JSON limit is a bounded
format/parser allowance, not a storage-capacity promise.

A hard 5 MB or 10 MB UTF-8 file cap is not adopted here because the native browser
test restored and re-exported an 11,682,786-byte Punjabi backup exactly. Its
encoded file bytes differ from the storage representation. Conversely an
11,756-byte valid import could not fit an already full origin. No fixed file cap
can by itself represent available capacity. The independent reviewer accepted this distinction in
RT-005 at review commit 1a4c525a3e0ec92e4fb9c022a5493f685340ba64.
No extra founder decision is requested for this mechanism; neither that response
nor these builder tests authorize release.

The maximum valid synthetic file in the native test was 17,514,786 bytes.
It was refused by actual browser storage and every existing record stayed
byte-identical. This shows safe refusal, not successful maximal restore.

## Reproduction and evidence

~~~sh
node tests/nitnem-storage-quota.mjs
node tests/nitnem-learning.mjs
node tests/nitnem-backup-capacity.mjs
node tests/nitnem-ui-lifecycle.mjs
CHROMIUM_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/nitnem-storage-quota-browser.mjs
~~~

The new unit cases failed against the original raw exceptions before the repair.
Native desktop Chromium tests use a fresh localhost origin and nonpersistent
contexts, with synthetic notes only. They exercise the actual file-picker import
and export UI, a fresh collection, a nonempty collection whose current note is
nonempty, and an already-full origin. Incoming maximum notes exclude the existing
note ID, so the quota path is reached rather than the conflicting-note size guard.
The test compares every storage key/value byte-for-byte, including revision,
preferences, reading place and unrelated synthetic reader records.

One initial test assertion incorrectly read an absent QA lineId property. It was
corrected to read the selected rendered occurrence and use a nonempty editor.
The final retry also goes through the file-picker UI, not only a manager call.
Both corrections are reflected in the final browser evidence.

The test's filling and clearing of synthetic filler is fixture preparation only.
The product contains no such quota probes or deletions. Browser evidence and a
screenshot are in evidence/storage-quota/. Chrome behavior does not establish
Safari/iPhone behavior or available capacity on another device.
