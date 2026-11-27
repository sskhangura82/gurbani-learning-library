#!/usr/bin/env python3
"""Prepare, but never sign or publish, one fully compared official selection.

Only original Gurmukhi and its source/date metadata leave process memory.
Output is a new, transactionally staged directory. No deployed path is changed.
"""
import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from html.parser import HTMLParser
from zoneinfo import ZoneInfo

PORTAL = "https://hs.sgpc.net/"
ARCHIVE = PORTAL + "archiveView.php"
ARCHIVE_QUERY = PORTAL + "hssearchhukmanamaTestCalender.php"
REPOSITORY = "opengranth/open-granth"
COMMIT = "34d2a7cab032c8ea24d21ff20f64653bd03766f4"
EDITION = "opengranth-34d2a7c"
RAW_BASE = "https://raw.githubusercontent.com/opengranth/open-granth/" + COMMIT + "/"
MAX_HTTP_BYTES = 3 * 1024 * 1024
MAX_PAGE_BYTES = 256 * 1024
MAX_WITNESS_ANGS = 16
ORIGINAL_KEYS = ("date", "ang", "gheading1", "gheading2", "ghukamnama", "gfooter1", "gfooter2")
POLICY_PINS = (
    ("opengranth-code-license", RAW_BASE + "LICENSE", "7c8ad948da650fdec6bca1dc769a1a80f8cdf527f9248e1df56aed46e75c3dc2"),
    ("opengranth-notice", RAW_BASE + "NOTICE", "7b2776c739ed3baa5e424597ad2b304d729dd2dfb87b657deffe3ef06e8155bf"),
    ("opengranth-provenance", RAW_BASE + "docs/provenance.md", "0e1f1c0b267b0c86bd4ac7b1a882b68f19aa3e3929059662fca47b69c098132e"),
    ("upstream-original-text-notice", "https://raw.githubusercontent.com/shabados/database/918c1d42d02e385e7ed48ef44994c75a2cb50293/README.md", "e06d574b19e31a876c987555329ef5959eb6735b081495a2a64136973d7456da"),
)


class Refusal(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code


def refuse(code, message):
    raise Refusal(code, message)


def sha256(value):
    return hashlib.sha256(value if isinstance(value, bytes) else value.encode("utf-8")).hexdigest()


def json_bytes(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2, allow_nan=False) + "\n").encode("utf-8")


def utc_now():
    return dt.datetime.now(dt.timezone.utc)


def stamp(value):
    return value.astimezone(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def valid_date(value):
    if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        refuse("DATE_SCHEMA", "A date must use YYYY-MM-DD.")
    try:
        parsed = dt.date.fromisoformat(value)
    except ValueError:
        refuse("DATE_SCHEMA", "The calendar date is invalid.")
    if parsed.isoformat() != value:
        refuse("DATE_SCHEMA", "The calendar date is not canonical.")
    return parsed


def decode_utf8(raw, label):
    try:
        value = raw.decode("utf-8", errors="strict")
    except UnicodeDecodeError:
        refuse("ENCODING", label + " is not exact UTF-8; no repair was attempted.")
    if "\ufffd" in value or value.startswith("\ufeff"):
        refuse("ENCODING", label + " contains a replacement character or unexpected byte-order mark.")
    return value


def load_json(raw, label):
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                refuse("DUPLICATE_JSON_KEY", label + " contains a duplicate key.")
            result[key] = value
        return result
    try:
        return json.loads(decode_utf8(raw, label), object_pairs_hook=pairs,
                          parse_constant=lambda _: refuse("JSON_SCHEMA", label + " has a non-finite number."))
    except json.JSONDecodeError:
        refuse("JSON_SCHEMA", label + " is not valid JSON.")


def page_url(ang):
    return RAW_BASE + "corpus/ang-" + str(ang).zfill(4) + ".md"


def allowed_url(url):
    if url in (PORTAL, ARCHIVE_QUERY) or url in {pin[1] for pin in POLICY_PINS}:
        return True
    return bool(re.fullmatch(re.escape(RAW_BASE) + r"corpus/ang-\d{4}\.md", url))


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        refuse("SOURCE_REDIRECT", "A source redirected; the fixed source contract needs review.")


@dataclass(frozen=True)
class Response:
    body: bytes
    content_type: str
    fetched_at: str
    headers: dict


class HTTPClient:
    def __init__(self, timeout=15):
        self.timeout = timeout
        self.opener = urllib.request.build_opener(NoRedirect())

    def fetch(self, url, *, form=None, limit=MAX_HTTP_BYTES):
        if not allowed_url(url):
            refuse("SOURCE_URL", "An unapproved source URL was requested.")
        headers = {"User-Agent": "GLP-001-original-text-verifier/1.0", "Accept-Encoding": "identity"}
        data = None
        if form is not None:
            if url != ARCHIVE_QUERY or set(form) != {"selected_date"}:
                refuse("SOURCE_QUERY", "Only the observed read-only archive date query is allowed.")
            data = urllib.parse.urlencode(form).encode("ascii")
            headers.update({"Content-Type": "application/x-www-form-urlencoded", "X-Requested-With": "XMLHttpRequest"})
        request = urllib.request.Request(url, data=data, headers=headers)
        try:
            with self.opener.open(request, timeout=self.timeout) as response:
                if response.status != 200:
                    refuse("SOURCE_HTTP", "A source did not return HTTP 200.")
                if response.headers.get("Content-Encoding", "identity").lower() not in ("", "identity"):
                    refuse("SOURCE_ENCODING", "An unexpected HTTP content encoding was refused.")
                length = response.headers.get("Content-Length")
                if length and (not length.isdigit() or int(length) > limit):
                    refuse("SOURCE_SIZE", "A source exceeds the bounded input size.")
                raw = response.read(limit + 1)
                if len(raw) > limit:
                    refuse("SOURCE_SIZE", "A source exceeds the bounded input size.")
                mime = response.headers.get_content_type()
                return Response(raw, mime, stamp(utc_now()), {
                    key: response.headers.get(key) for key in
                    ("Content-Type", "Date", "X-Frame-Options", "Content-Security-Policy", "Access-Control-Allow-Origin")
                    if response.headers.get(key) is not None
                })
        except Refusal:
            raise
        except (urllib.error.URLError, TimeoutError, OSError) as error:
            refuse("SOURCE_UNAVAILABLE", "Source retrieval failed (" + type(error).__name__ + "); no record is promotable.")


class PortalParser(HTMLParser):
    """Read original card and displayed date, never explanation-card content."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.script_chunks = []
        self.script_count = 0
        self.in_script = False
        self.card_depth = 0
        self.card_count = 0
        self.capture = None
        self.capture_tag = None
        self.capture_parts = []
        self.fields = {"gheading1": [], "gheading2": [], "ghukamnama": [], "footers": [], "dates": []}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get("class", "").split()
        if tag == "script" and attrs.get("id") == "hukamnamaPdfData":
            if attrs.get("type") != "application/json":
                refuse("PORTAL_SCHEMA", "The official structured original payload has an unexpected type.")
            self.in_script = True
            self.script_count += 1
            return
        if self.in_script:
            return
        if tag == "div":
            if self.card_depth:
                self.card_depth += 1
            elif "hukamnama-card" in classes:
                self.card_depth = 1
                self.card_count += 1
        field = None
        if self.card_depth:
            if tag == "h4" and "hukamnama-title" in classes:
                field = "gheading1"
            elif tag == "h5" and "hukamnama-subtitle" in classes:
                field = "gheading2"
            elif tag == "p" and "hukamnama-text" in classes:
                field = "ghukamnama"
            elif tag == "p" and "customDate" in classes:
                field = "footers"
        elif tag == "p" and "customDate" in classes:
            field = "dates"
        if field:
            if self.capture:
                refuse("PORTAL_SCHEMA", "Original fields unexpectedly overlap.")
            self.capture, self.capture_tag, self.capture_parts = field, tag, []

    def handle_data(self, data):
        if self.in_script:
            self.script_chunks.append(data)
        elif self.capture:
            self.capture_parts.append(data)

    def handle_endtag(self, tag):
        if tag == "script" and self.in_script:
            self.in_script = False
            return
        if self.capture and tag == self.capture_tag:
            self.fields[self.capture].append("".join(self.capture_parts).strip())
            self.capture, self.capture_tag, self.capture_parts = None, None, []
        if tag == "div" and self.card_depth:
            self.card_depth -= 1


def text_field(row, name, *, empty=False):
    value = row.get(name)
    if not isinstance(value, str) or (not empty and not value) or len(value) > 200000:
        refuse("ORIGINAL_SCHEMA", "The original-text field " + name + " is missing or invalid.")
    if value != value.strip() or "\ufffd" in value or any(ord(ch) < 32 or 0xD800 <= ord(ch) <= 0xDFFF for ch in value):
        refuse("ORIGINAL_ENCODING", "Original-text whitespace/control/encoding differences require review; no repair was attempted.")
    return value


def extract_original(row, requested_date, *, time_field=False):
    if not isinstance(row, dict):
        refuse("ORIGINAL_SCHEMA", "The official original-text record is not an object.")
    valid_date(row.get("date"))
    if row["date"] != requested_date:
        refuse("OFFICIAL_DATE_MISMATCH", "The official selection date differs from the requested Amritsar date.")
    ang = row.get("ang")
    if not isinstance(ang, str) or not re.fullmatch(r"[1-9]\d{0,3}", ang) or not 1 <= int(ang) <= 1430:
        refuse("ANG_SCHEMA", "The official starting Ang is absent or invalid.")
    result = {"date": row["date"], "ang": ang}
    for key in ORIGINAL_KEYS[2:]:
        result[key] = text_field(row, key, empty=key == "gheading2")
    if not re.search(r"[\u0a00-\u0a7f]", result["gheading1"]) or not re.search(r"[\u0a00-\u0a7f]", result["ghukamnama"]):
        refuse("ORIGINAL_SCHEMA", "Original Gurmukhi heading and body are required.")
    if time_field:
        value = row.get("hukamnama_time")
        if not isinstance(value, str) or not re.fullmatch(r"\d{2}:\d{2}:\d{2}", value):
            refuse("TIME_SCHEMA", "The official displayed time is invalid.")
        try:
            dt.time.fromisoformat(value)
        except ValueError:
            refuse("TIME_SCHEMA", "The official displayed time is invalid.")
        result["hukamnama_time"] = value
    return result


def parse_portal(response, requested_date):
    if response.content_type != "text/html":
        refuse("PORTAL_SCHEMA", "The portal did not return HTML.")
    parser = PortalParser()
    parser.feed(decode_utf8(response.body, "Official portal"))
    parser.close()
    if parser.script_count != 1 or parser.card_count != 1:
        refuse("PORTAL_SCHEMA", "Exactly one structured payload and visible original card are required.")
    raw = "".join(parser.script_chunks).encode("utf-8")
    original = extract_original(load_json(raw, "Official structured payload"), requested_date, time_field=True)
    for key in ("gheading1", "gheading2", "ghukamnama"):
        if parser.fields[key] != [original[key]]:
            refuse("VISIBLE_STRUCTURED_MISMATCH", "The visible and structured original " + key + " disagree.")
    if parser.fields["footers"] != [original["gfooter1"], original["gfooter2"]]:
        refuse("VISIBLE_STRUCTURED_MISMATCH", "The visible and structured original footer fields disagree.")
    observed = []
    for value in parser.fields["dates"]:
        match = re.fullmatch(r"(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2})\s*(AM|PM)", value)
        if match:
            try:
                observed.append(dt.datetime.strptime(" ".join(match.groups()), "%d-%m-%Y %I:%M %p"))
            except ValueError:
                refuse("VISIBLE_DATE", "The displayed official date/time is invalid.")
    if len(observed) != 1 or observed[0].date().isoformat() != requested_date or observed[0].strftime("%H:%M") != original["hukamnama_time"][:5]:
        refuse("VISIBLE_DATE", "Visible and structured official publication date/time do not agree.")
    return original


def parse_archive(response, requested_date):
    if response.content_type != "application/json":
        refuse("ARCHIVE_SCHEMA", "The archive did not return JSON.")
    payload = load_json(response.body, "Official archive response")
    if not isinstance(payload, dict) or payload.get("supported") is not True:
        refuse("OFFICIAL_UNAVAILABLE", "The official archive has no supported reading for that date.")
    return extract_original(payload.get("hukamnama"), requested_date)


def original_joined(original):
    return " ".join(value for value in (original["gheading1"], original["gheading2"], original["ghukamnama"]) if value)


def fetch_official(requested_date, client, now):
    requested = valid_date(requested_date)
    today = now.astimezone(ZoneInfo("Asia/Kolkata")).date()
    if requested > today:
        refuse("FUTURE_DATE", "A future Amritsar selection cannot be imported.")
    observations = []
    portal_original = None
    if requested == today:
        response = client.fetch(PORTAL)
        portal_original = parse_portal(response, requested_date)
        observations.append({"kind": "portal", "url": PORTAL, "retrievedAtUtc": response.fetched_at,
                             "original": portal_original, "transport": response.headers,
                             "verification": "VISIBLE_AND_STRUCTURED_ORIGINAL_EQUAL"})
    response = client.fetch(ARCHIVE_QUERY, form={"selected_date": requested_date})
    archive_original = parse_archive(response, requested_date)
    observations.append({"kind": "archive", "url": ARCHIVE_QUERY, "method": "POST", "requestedDate": requested_date,
                         "retrievedAtUtc": response.fetched_at, "original": archive_original,
                         "transport": response.headers, "verification": "EXPLICIT_DATED_COMPLETE_ORIGINAL"})
    if portal_original and any(portal_original[key] != archive_original[key] for key in ORIGINAL_KEYS):
        refuse("OFFICIAL_SOURCE_CONFLICT", "Official portal and archive original/date fields disagree.")
    return portal_original or archive_original, observations


def parse_page(raw, ang):
    text = decode_utf8(raw, "Pinned original witness")
    header = re.match(r"\A---\r?\n(.*?)\r?\n---\r?\n", text, re.S)
    if not header:
        refuse("WITNESS_SCHEMA", "The pinned corpus page has no expected metadata header.")
    fields = dict(re.findall(r"^([a-z_]+): (.+)$", header.group(1), re.M))
    if fields.get("ang") != str(ang) or fields.get("source") != "Shabad OS Database":
        refuse("WITNESS_SCHEMA", "The pinned corpus page identity is inconsistent.")
    rows = []
    waiting = False
    for line in text[header.end():].splitlines():
        if re.fullmatch(r"<!-- LINE:\d+ -->", line):
            if waiting:
                refuse("WITNESS_SCHEMA", "An original witness entry is missing.")
            waiting = True
        elif waiting and line:
            match = re.fullmatch(r"\*\*(.+)\*\*", line)
            if not match:
                refuse("WITNESS_SCHEMA", "An original witness entry has an unexpected structure.")
            value = match.group(1)
            text_field({"value": value}, "value")
            rows.append({"text": value, "ang": ang})
            waiting = False
    if waiting or not rows or fields.get("lines") != str(len(rows)):
        refuse("WITNESS_SCHEMA", "The pinned corpus page entry count is incomplete or inconsistent.")
    return rows


def is_boundary_heading(value):
    # Conservative structural recognition, never a semantic or fuzzy locator.
    if len(value) > 180:
        return False
    if re.search(r"(?:ਮਹਲਾ|ਮਃ)\s*[੦-੯]+", value):
        return True
    return bool(re.fullmatch(r"(?:ਪਉੜੀ|ਸਲੋਕੁ|ਸਲੋਕ|ਛੰਤੁ|ਛੰਤ)(?:\s+॥)?", value) or value.startswith("ੴ "))


def has_numbered_close(value):
    return bool(re.search(r"॥[੦-੯]+(?:॥[੦-੯]+)*॥$", value))


def fetch_complete_witness(original, client):
    start_ang = int(original["ang"])
    target = original_joined(original)
    rows, pages = [], []
    def fetch_page(ang, prepend=False):
        response = client.fetch(page_url(ang), limit=MAX_PAGE_BYTES)
        if response.content_type not in ("text/plain", "text/markdown", "application/octet-stream"):
            refuse("WITNESS_SCHEMA", "The pinned original witness did not return a text source.")
        found = parse_page(response.body, ang)
        page = {"ang": ang, "url": page_url(ang), "sha256": sha256(response.body)}
        if prepend:
            rows[:0], pages[:0] = found, [page]
        else:
            rows.extend(found)
            pages.append(page)
    fetch_page(start_ang)
    if rows[0]["text"] == original["gheading1"] and start_ang > 1:
        fetch_page(start_ang - 1, prepend=True)
    for extra in range(MAX_WITNESS_ANGS):
        candidates = [i for i, row in enumerate(rows) if row["ang"] == start_ang and row["text"] == original["gheading1"]]
        if not candidates:
            refuse("WITNESS_HEADING", "The exact official heading is absent from the pinned starting Ang.")
        matches, incomplete = [], False
        for begin in candidates:
            combined = ""
            for end in range(begin, len(rows)):
                combined += (" " if combined else "") + rows[end]["text"]
                if combined == target:
                    matches.append((begin, end + 1))
                    break
                if not target.startswith(combined) or len(combined) >= len(target):
                    break
            else:
                if target.startswith(combined):
                    incomplete = True
        if len(matches) > 1:
            refuse("AMBIGUOUS_SELECTION", "More than one complete ordered selection matches at the official starting Ang.")
        if matches and not incomplete:
            begin, end = matches[0]
            if end < len(rows):
                selected = rows[begin:end]
                before = rows[begin - 1]["text"] if begin else None
                after = rows[end]["text"]
                if before is None or not has_numbered_close(before):
                    refuse("START_BOUNDARY", "A complete preceding-unit boundary was not established.")
                if not has_numbered_close(selected[-1]["text"]) or not is_boundary_heading(after):
                    refuse("END_BOUNDARY", "The official selection does not reach a supported complete-unit ending and following heading.")
                heading_prefix = " ".join(v for v in (original["gheading1"], original["gheading2"]) if v)
                heading_count = None
                for count in range(1, len(selected) + 1):
                    if " ".join(row["text"] for row in selected[:count]) == heading_prefix:
                        heading_count = count
                        break
                if heading_count is None or heading_count == len(selected):
                    refuse("HEADING_BOUNDARY", "Official headings do not align to complete original witness entries.")
                return selected, heading_count, pages, before, after
        if not matches and not incomplete:
            refuse("FULL_TEXT_MISMATCH", "The full original selection does not exactly match the pinned ordered witness; no normalization was attempted.")
        next_ang = pages[-1]["ang"] + 1
        if next_ang > 1430 or extra + 1 >= MAX_WITNESS_ANGS:
            refuse("WITNESS_BOUND", "A complete supported selection and its boundaries were not established within the bounded witness window.")
        fetch_page(next_ang)
    refuse("WITNESS_BOUND", "The witness window is exhausted.")


def verify_policy_pins(client):
    records = []
    for name, url, expected in POLICY_PINS:
        response = client.fetch(url, limit=MAX_PAGE_BYTES)
        if sha256(response.body) != expected:
            refuse("POLICY_PIN_MISMATCH", "A pinned provenance or rights notice changed; review is required.")
        records.append({"name": name, "url": url, "sha256": expected})
    return records


def assemble(requested_date, client, now=None):
    now = now or utc_now()
    original, observations = fetch_official(requested_date, client, now)
    selected, heading_count, pages, before, after = fetch_complete_witness(original, client)
    policy_pins = verify_policy_pins(client)
    full_text = " ".join(row["text"] for row in selected)
    digest = sha256(full_text)
    if full_text != original_joined(original):
        refuse("INTERNAL_COMPARISON", "Full source equality was not preserved.")
    unit_id = "sggs.text." + digest
    occurrence_counts = {}
    occurrences = []
    for index, row in enumerate(selected):
        line_digest = sha256(row["text"])
        occurrence_counts[line_digest] = occurrence_counts.get(line_digest, 0) + 1
        kind = "heading" if index < heading_count else ("rahao" if re.search(r"ਰਹਾਉ(?:\s+ਦੂਜਾ)?\s*॥", row["text"]) else "verse")
        occurrences.append({"id": unit_id + ".line." + line_digest + "." + str(occurrence_counts[line_digest]),
                            "text": row["text"], "sha256": line_digest, "kind": kind, "ang": row["ang"]})
    provenance = {"repository": REPOSITORY, "commit": COMMIT, "pages": pages,
                  "comparison": "COMPLETE_ORDERED_TEXT_EQUALITY",
                  "comparisonScope": "Unique full ordered sequence among entries beginning at the official starting Ang; adjacent pages establish continuation and boundaries. Global corpus uniqueness is not asserted.",
                  "precedingSha256": sha256(before) if before is not None else None,
                  "followingSha256": sha256(after)}
    source = {"schema": "glp.hukamnama.source.v1", "id": unit_id, "edition": EDITION,
              "textSha256": digest, "angStart": selected[0]["ang"], "angEnd": selected[-1]["ang"],
              "occurrences": occurrences, "provenance": provenance}
    checked_at = max(observation["retrievedAtUtc"] for observation in observations)
    receipt = {"schema": "glp.hukamnama.receipt.v1", "requestedDate": requested_date, "timezone": "Asia/Kolkata",
               "original": {**original, "hukamnama_time": original.get("hukamnama_time")},
               "checkedAtUtc": checked_at, "officialOriginalSha256": digest, "observations": observations,
               "witness": {"provenance": provenance, "headingEntries": heading_count, "originalEntries": len(selected),
                           "precedingOriginal": before, "followingOriginal": after,
                           "normalization": "NONE; original witness entries joined by one ASCII space"},
               "policyPins": policy_pins,
               "limitations": [
                   "Digital full-text comparison is not qualified scholarly or printed-page approval.",
                   "The portal and its archive are one publisher, not independent historical witnesses.",
                   "Open Granth derives its original text from Shabad OS SSA2, attributed upstream to SGPC Shabadaarth.",
                   "Open Granth MIT covers code/tooling, expressly not its corpus. The pinned upstream notice identifies original Gurbani/Panthic text as public domain; modern translations/commentary are excluded from this import.",
                   "The upstream rights notice is pinned to the archived repository commit, not asserted to be the notice bundled with npm 5.0.0-next.0; that registry gitHead returned 404 during research.",
                   "The archive endpoint is observed official implementation, not a documented external API contract.",
                   "No publisher time-zone offset is invented for the displayed time.",
               ]}
    source_raw, receipt_raw = json_bytes(source), json_bytes(receipt)
    source_path = "sources/" + digest + ".json"
    receipt_path = "receipts/" + requested_date + ".original.json"
    payload_path = "events/" + requested_date + ".payload.json"
    event = {"schema": "glp.hukamnama.event.v1", "id": "harmandir-morning." + requested_date,
             "date": requested_date, "timezone": "Asia/Kolkata", "venue": "sri-harmandir-sahib", "ritual": "morning-mukhwak",
             "sourceUrl": PORTAL, "archiveUrl": ARCHIVE, "officialPublishedDate": original["date"],
             "officialDisplayedTime": original.get("hukamnama_time"), "checkedAtUtc": checked_at,
             "officialOriginalSha256": digest, "officialReceiptSha256": sha256(receipt_raw),
             "source": {"id": unit_id, "edition": EDITION, "textSha256": digest, "sha256": sha256(source_raw), "path": "./" + source_path},
             "verification": "COMPLETE_ORDERED_TEXT_EQUALITY", "status": "DIGITAL_TEXT_VERIFIED_PREVIEW",
             "publicationApproved": False, "revision": 1, "lessons": {"simple": None, "detailed": None, "learning": None}}
    payload_raw = json_bytes(event)
    manifest = {"schema": "glp.hukamnama.ingest-manifest.v1", "date": requested_date,
                "source": {"path": source_path, "sha256": sha256(source_raw)},
                "payload": {"path": payload_path, "sha256": sha256(payload_raw)},
                "receipt": {"path": receipt_path, "sha256": sha256(receipt_raw)}, "publicationApproved": False}
    return {source_path: source_raw, payload_path: payload_raw, receipt_path: receipt_raw, "manifest.json": json_bytes(manifest)}


def write_transaction(output, files):
    output = Path(output).absolute()
    if os.path.lexists(output):
        refuse("OUTPUT_EXISTS", "The output already exists; existing staged or deployed records were not changed.")
    if not output.parent.is_dir():
        refuse("OUTPUT_PARENT", "The staging parent must already exist.")
    for name in files:
        relative = Path(name)
        if relative.is_absolute() or ".." in relative.parts:
            refuse("OUTPUT_PATH", "An output path is not confined to the new staging directory.")
    lock = output.parent / ("." + output.name + ".import-lock")
    lock_fd = None
    temporary = None
    try:
        try:
            lock_fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
        except FileExistsError:
            refuse("OUTPUT_BUSY", "Another importer owns this staging destination; no record was changed.")
        if os.path.lexists(output):
            refuse("OUTPUT_EXISTS", "The output already exists; no record was changed.")
        temporary = Path(tempfile.mkdtemp(prefix="." + output.name + ".pending-", dir=output.parent))
        for name, raw in files.items():
            path = temporary / name
            path.parent.mkdir(parents=True, exist_ok=True)
            with path.open("xb") as handle:
                handle.write(raw)
                handle.flush()
                os.fsync(handle.fileno())
        if os.path.lexists(output):
            refuse("OUTPUT_EXISTS", "The output appeared while staging; existing records were not changed.")
        os.rename(temporary, output)
        temporary = None
    finally:
        if temporary is not None:
            shutil.rmtree(temporary, ignore_errors=True)
        if lock_fd is not None:
            os.close(lock_fd)
            lock.unlink()
    return output


def ingest(requested_date, output, client=None, now=None):
    if os.path.lexists(output):
        refuse("OUTPUT_EXISTS", "The output already exists; no source was fetched and no record was changed.")
    files = assemble(requested_date, client or HTTPClient(), now)
    result = write_transaction(output, files)
    return json.loads(files["manifest.json"].decode("utf-8")), result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", help="Exact Amritsar YYYY-MM-DD; defaults to today's Asia/Kolkata date.")
    parser.add_argument("--out", required=True, type=Path, help="New staging directory; existing paths are never overwritten.")
    args = parser.parse_args()
    now = utc_now()
    day = args.date or now.astimezone(ZoneInfo("Asia/Kolkata")).date().isoformat()
    try:
        manifest, output = ingest(day, args.out, now=now)
        print(json.dumps({"status": "STAGED_UNSIGNED_PREVIEW", "date": day, "output": str(output),
                          "manifest": manifest, "message": "No signing, publication, deployment or qualified approval occurred."}, sort_keys=True))
        return 0
    except Refusal as error:
        print(json.dumps({"status": "REFUSED", "code": error.code, "message": str(error), "promotableArtifact": False}), file=sys.stderr)
        return 2
    except OSError as error:
        print(json.dumps({"status": "REFUSED", "code": "STAGING_IO", "message": type(error).__name__ + ": staging did not complete; existing records remain untouched.", "promotableArtifact": False}), file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
