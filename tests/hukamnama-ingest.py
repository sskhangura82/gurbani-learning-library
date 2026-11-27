#!/usr/bin/env python3
"""Original-only synthetic transport fixtures; no real learner data or network."""
import copy
import datetime as dt
import html
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
import unicodedata

HERE = Path(__file__).resolve()
TARGET = HERE.parent.parent / "tools" / "ingest-hukamnama.py"
if not TARGET.exists():
    TARGET = HERE.parent / "ingest-hukamnama.py"
SPEC = importlib.util.spec_from_file_location("glp_hukamnama_ingest", TARGET)
M = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = M
SPEC.loader.exec_module(M)

DAY = "2026-11-27"
NOW = dt.datetime(2026, 11, 27, 4, 40, tzinfo=dt.timezone.utc)
HEADING = "ਬੈਰਾੜੀ ਮਹਲਾ ੪ ॥"
BODY = [
    "ਹਰਿ ਜਨੁ ਰਾਮ ਨਾਮ ਗੁਨ ਗਾਵੈ ॥",
    "ਜੇ ਕੋਈ ਨਿੰਦ ਕਰੇ ਹਰਿ ਜਨ ਕੀ ਅਪੁਨਾ ਗੁਨੁ ਨ ਗਵਾਵੈ ॥੧॥ ਰਹਾਉ ॥",
    "ਜੋ ਕਿਛੁ ਕਰੇ ਸੁ ਆਪੇ ਸੁਆਮੀ ਹਰਿ ਆਪੇ ਕਾਰ ਕਮਾਵੈ ॥",
    "ਹਰਿ ਆਪੇ ਹੀ ਮਤਿ ਦੇਵੈ ਸੁਆਮੀ ਹਰਿ ਆਪੇ ਬੋਲਿ ਬੁਲਾਵੈ ॥੧॥",
    "ਹਰਿ ਆਪੇ ਪੰਚ ਤਤੁ ਬਿਸਥਾਰਾ ਵਿਚਿ ਧਾਤੂ ਪੰਚ ਆਪਿ ਪਾਵੈ ॥",
    "ਜਨ ਨਾਨਕ ਸਤਿਗੁਰੁ ਮੇਲੇ ਆਪੇ ਹਰਿ ਆਪੇ ਝਗਰੁ ਚੁਕਾਵੈ ॥੨॥੩॥",
]
BEFORE = "ਜਨ ਨਾਨਕ ਕਉ ਹਰਿ ਭੇਟੇ ਸੁਆਮੀ ਦੁਖੁ ਹਉਮੈ ਰੋਗੁ ਗਵਾਇਓ ॥੨॥੨॥"
PROTECTED = "PROTECTED_COMMENTARY_MUST_NOT_ESCAPE"
PIN_DATA = b"Synthetic provenance pin fixture, not a real licence."
PINS = (("synthetic-test-only-policy", M.RAW_BASE + "NOTICE", M.sha256(PIN_DATA)),)


def original(day=DAY, body=None):
    return {"date": day, "ang": "719", "hukamnama_time": "05:30:00", "gheading1": HEADING, "gheading2": "",
            "ghukamnama": " ".join(BODY if body is None else body), "gfooter1": "ਸਿੰਥੈਟਿਕ ਮਿਤੀ-ਲਿਖਤ", "gfooter2": "(ਅੰਗ: ੭੧੯)"}


def portal(row, visible=None):
    view = row if visible is None else visible
    displayed = dt.date.fromisoformat(view["date"]).strftime("%d-%m-%Y") + " 05:30AM"
    payload = {**row, "ghukamnamadesc": PROTECTED, "ehukamnamadesc": PROTECTED, "audio": "https://invalid.example/PROTECTED_AUDIO.mp3"}
    value = '<p class="fs-5 customDate">' + displayed + '</p><div class="hukamnama-card">'
    for tag, cls, key in (("h4", "hukamnama-title", "gheading1"), ("h5", "hukamnama-subtitle", "gheading2"), ("p", "hukamnama-text", "ghukamnama")):
        value += '<' + tag + ' class="' + cls + '">' + html.escape(view[key]) + '</' + tag + '>'
    for key in ("gfooter1", "gfooter2"):
        value += '<p class="customDate"><strong>' + html.escape(view[key]) + '</strong></p>'
    value += '</div><div class="hukamnama-card2">' + PROTECTED + '</div>'
    value += '<script type="application/json" id="hukamnamaPdfData">' + json.dumps(payload, ensure_ascii=False) + '</script>'
    return value.encode("utf-8")


def archive(row):
    return M.json_bytes({"supported": True, "hukamnama": {**row, "ghukamnamadesc": PROTECTED, "ehukamnamadesc": PROTECTED}, "pdfFiles": ["PROTECTED_LAYOUT.pdf"]})


def page(ang, rows, declared=None):
    header = "---\nang: " + str(ang) + "\nauthor: ignored page-level author\nraag: ignored page-level raag\nlines: " + str(len(rows) if declared is None else declared) + "\nsource: Shabad OS Database\n---\n\n"
    content = "\n\n---\n\n".join("<!-- LINE:" + str(index // 2 + 1) + " -->\n**" + text + "**\n\n*PROTECTED_TRANSLITERATION*\n\n" + PROTECTED for index, text in enumerate(rows))
    return (header + content + "\n").encode("utf-8")


class FakeClient:
    def __init__(self, row=None):
        self.row = copy.deepcopy(row or original())
        self.calls = []
        self.fail_url = None
        self.data = {
            M.PORTAL: (portal(self.row), "text/html"),
            M.ARCHIVE_QUERY: (archive(self.row), "application/json"),
            M.page_url(719): (page(719, [BEFORE, HEADING] + BODY[:4]), "text/plain"),
            M.page_url(720): (page(720, BODY[4:] + [HEADING, "ਕਲਪਿਤ ਅਗਲਾ ਅੰਸ਼ ॥੧॥"]), "text/plain"),
            PINS[0][1]: (PIN_DATA, "text/plain"),
        }

    def fetch(self, url, *, form=None, limit=M.MAX_HTTP_BYTES):
        self.calls.append((url, form))
        if url == self.fail_url:
            raise M.Refusal("SOURCE_UNAVAILABLE", "Synthetic unavailable source.")
        if url not in self.data:
            raise AssertionError("Unexpected network source in synthetic fixture: " + url)
        raw, mime = self.data[url]
        if len(raw) > limit:
            raise M.Refusal("SOURCE_SIZE", "Synthetic bounded input refusal.")
        return M.Response(raw, mime, "2026-11-27T04:40:00Z", {"Content-Type": mime})


class ImporterTests(unittest.TestCase):
    def setUp(self):
        self.policy = patch.object(M, "POLICY_PINS", PINS)
        self.policy.start()
        self.addCleanup(self.policy.stop)
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.output = Path(self.temporary.name) / "new-stage"

    def refusal(self, client, expected, day=DAY):
        with self.assertRaises(M.Refusal) as caught:
            M.ingest(day, self.output, client=client, now=NOW)
        self.assertEqual(caught.exception.code, expected)
        self.assertFalse(self.output.exists())
        self.assertEqual(list(self.output.parent.iterdir()), [])

    def test_complete_cross_ang_selection_is_preserved_with_protected_layers_absent(self):
        manifest, output = M.ingest(DAY, self.output, client=FakeClient(), now=NOW)
        source = json.loads((output / manifest["source"]["path"]).read_text())
        event = json.loads((output / manifest["payload"]["path"]).read_text())
        receipt = json.loads((output / manifest["receipt"]["path"]).read_text())
        self.assertEqual(source["textSha256"], "c7f434800aae668f63cb398304cfcaf6159e6343156653778ebef37bf3bcb20d")
        self.assertEqual([row["text"] for row in source["occurrences"]], [HEADING] + BODY)
        self.assertEqual([source["angStart"], source["angEnd"]], [719, 720])
        self.assertEqual([row["kind"] for row in source["occurrences"]], ["heading", "verse", "rahao", "verse", "verse", "verse", "verse"])
        self.assertEqual(receipt["original"]["ghukamnama"], " ".join(BODY))
        self.assertEqual(event["source"]["sha256"], M.sha256((output / manifest["source"]["path"]).read_bytes()))
        self.assertEqual(event["officialReceiptSha256"], M.sha256((output / manifest["receipt"]["path"]).read_bytes()))
        self.assertEqual(event["lessons"], {"simple": None, "detailed": None, "learning": None})
        self.assertIs(event["publicationApproved"], False)
        for path in output.rglob("*.json"):
            raw = path.read_bytes()
            self.assertNotIn(b"PROTECTED", raw)
            self.assertNotIn(b"ghukamnamadesc", raw)
            self.assertNotIn(b"ehukamnamadesc", raw)
            self.assertNotIn(b"pdfFiles", raw)

    def test_future_request_is_refused_before_fetching(self):
        client = FakeClient()
        self.refusal(client, "FUTURE_DATE", "2026-11-28")
        self.assertEqual(client.calls, [])

    def test_http_200_missing_reading_does_not_make_an_event(self):
        client = FakeClient()
        client.data[M.ARCHIVE_QUERY] = (M.json_bytes({"supported": False, "hukamnama": {"date": DAY, "message": "No Hukamnama Available for this date."}, "pdfFiles": []}), "application/json")
        self.refusal(client, "OFFICIAL_UNAVAILABLE")

    def test_stale_official_selection_is_not_relabelled_as_today(self):
        self.refusal(FakeClient(original("2026-11-26")), "OFFICIAL_DATE_MISMATCH")

    def test_visible_original_cannot_disagree_with_structured_original(self):
        client = FakeClient()
        changed = copy.deepcopy(client.row)
        changed["ghukamnama"] = changed["ghukamnama"].replace("ਝਗਰੁ", "ਝਗਰ")
        client.data[M.PORTAL] = (portal(client.row, changed), "text/html")
        self.refusal(client, "VISIBLE_STRUCTURED_MISMATCH")

    def test_official_portal_archive_disagreement_refuses_both(self):
        client = FakeClient()
        changed = copy.deepcopy(client.row)
        changed["ghukamnama"] = changed["ghukamnama"].replace("ਝਗਰੁ", "ਝਗਰ")
        client.data[M.ARCHIVE_QUERY] = (archive(changed), "application/json")
        self.refusal(client, "OFFICIAL_SOURCE_CONFLICT")

    def test_matching_starting_ang_only_is_a_truncated_unit(self):
        self.refusal(FakeClient(original(body=BODY[:4])), "END_BOUNDARY")

    def test_missing_final_verse_does_not_pass_a_first_line_match(self):
        self.refusal(FakeClient(original(body=BODY[:-1])), "END_BOUNDARY")

    def test_changed_final_line_is_refused_even_when_first_line_and_ang_match(self):
        changed = BODY[:-1] + [BODY[-1].replace("ਝਗਰੁ", "ਝਗਰ")]
        self.refusal(FakeClient(original(body=changed)), "FULL_TEXT_MISMATCH")

    def test_truncated_witness_page_cannot_validate_a_selection(self):
        client = FakeClient()
        client.data[M.page_url(720)] = (page(720, BODY[4:5], declared=4), "text/plain")
        self.refusal(client, "WITNESS_SCHEMA")

    def test_invalid_utf8_is_not_decoded_with_replacement(self):
        client = FakeClient()
        raw, mime = client.data[M.page_url(720)]
        client.data[M.page_url(720)] = (raw + b"\xff", mime)
        self.refusal(client, "ENCODING")

    def test_json_surrogate_escape_is_refused_as_invalid_original_unicode(self):
        client = FakeClient()
        raw, mime = client.data[M.PORTAL]
        client.data[M.PORTAL] = (raw.replace(b'"ghukamnama": "', b'"ghukamnama": "\\ud800', 1), mime)
        self.refusal(client, "ORIGINAL_ENCODING")

    def test_unicode_canonical_equivalence_is_not_silent_source_repair(self):
        # Explicitly synthetic token, not a proposed change to any sacred text.
        synthetic = BODY.copy()
        synthetic[0] = "ਕਲਪਿਤ ਲ਼ ॥"
        changed = synthetic.copy()
        changed[0] = unicodedata.normalize("NFD", synthetic[0])
        self.assertNotEqual(changed[0], synthetic[0])
        client = FakeClient(original(body=changed))
        client.data[M.page_url(719)] = (page(719, [BEFORE, HEADING] + synthetic[:4]), "text/plain")
        self.refusal(client, "FULL_TEXT_MISMATCH")

    def test_punctuation_difference_is_not_silently_normalized(self):
        changed = BODY.copy()
        changed[0] = changed[0].replace("ਨਾਮ", "ਨਾਮ;")
        self.refusal(FakeClient(original(body=changed)), "FULL_TEXT_MISMATCH")

    def test_duplicate_complete_witness_sequence_is_refused(self):
        client = FakeClient()
        client.data[M.page_url(719)] = (page(719, [BEFORE, HEADING] + BODY + [HEADING] + BODY + [HEADING]), "text/plain")
        self.refusal(client, "AMBIGUOUS_SELECTION")

    def test_source_request_failure_creates_no_promotable_artifact(self):
        client = FakeClient()
        client.fail_url = M.page_url(720)
        self.refusal(client, "SOURCE_UNAVAILABLE")

    def test_pinned_policy_change_refuses_import(self):
        client = FakeClient()
        client.data[PINS[0][1]] = (b"changed policy", "text/plain")
        self.refusal(client, "POLICY_PIN_MISMATCH")

    def test_duplicate_json_key_is_refused(self):
        client = FakeClient()
        raw, mime = client.data[M.ARCHIVE_QUERY]
        client.data[M.ARCHIVE_QUERY] = (raw.replace(b'"supported": true', b'"supported": false, "supported": true'), mime)
        self.refusal(client, "DUPLICATE_JSON_KEY")

    def test_existing_destination_is_preserved_without_network(self):
        self.output.mkdir()
        marker = self.output / "existing.json"
        marker.write_bytes(b"existing record must survive")
        client = FakeClient()
        with self.assertRaises(M.Refusal) as caught:
            M.ingest(DAY, self.output, client=client, now=NOW)
        self.assertEqual(caught.exception.code, "OUTPUT_EXISTS")
        self.assertEqual(marker.read_bytes(), b"existing record must survive")
        self.assertEqual(client.calls, [])

    def test_partial_staging_io_failure_is_cleaned_without_final_directory(self):
        with patch.object(M.os, "fsync", side_effect=OSError("synthetic disk failure")):
            with self.assertRaises(OSError):
                M.write_transaction(self.output, {"a.json": b"one", "nested/b.json": b"two"})
        self.assertFalse(self.output.exists())
        self.assertEqual(list(self.output.parent.iterdir()), [])

    def test_source_bytes_are_independent_of_retrieval_timestamp(self):
        first = M.assemble(DAY, FakeClient(), NOW)
        client = FakeClient()
        original_fetch = client.fetch
        def later(url, **kwargs):
            response = original_fetch(url, **kwargs)
            return M.Response(response.body, response.content_type, "2026-11-27T04:45:00Z", response.headers)
        client.fetch = later
        second = M.assemble(DAY, client, NOW)
        source_path = next(path for path in first if path.startswith("sources/"))
        self.assertEqual(first[source_path], second[source_path])
        self.assertNotEqual(first["events/" + DAY + ".payload.json"], second["events/" + DAY + ".payload.json"])

    def test_explicit_history_is_retained_as_history_without_portal_substitution(self):
        day = "2026-11-26"
        client = FakeClient(original(day))
        files = M.assemble(day, client, NOW)
        event = json.loads(files["events/" + day + ".payload.json"])
        self.assertEqual(event["date"], day)
        self.assertIsNone(event["officialDisplayedTime"])
        self.assertNotIn(M.PORTAL, [call[0] for call in client.calls])


if __name__ == "__main__":
    unittest.main(verbosity=2)
