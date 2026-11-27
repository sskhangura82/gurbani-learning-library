#!/usr/bin/env python3
"""Build exact original-only collections from one pinned Shabad OS release.

Inputs and generated payloads must remain outside Git. This tool performs no
downloads, source corrections, translations, provider review or publication.
"""
import argparse
import hashlib
import json
import os
import re
import sqlite3
import subprocess
from collections import OrderedDict
from pathlib import Path

PACKAGE = "@shabados/database"
VERSION = "5.0.0-next.0"
REPORTED_GIT_HEAD = "693f879e2d00d192abaa77f53d61328e47cdbb2d"
ARCHIVE_SHA256 = "839fa79860804550ca7e654f9ccdef3889451a7a95626e6c99466c6fc1b902b2"
DATABASE_SHA256 = "517890c7e7c2f3dcef7f21b51d074a581b8eded4ebe14c504b84ea075ff16aeb"
NOTICE_SHA256 = "cacf8c7e24899b1202170b6fceedd4547fe4b09c78711f016cc7c4ee8613f795"
CHUNK_BYTES = 128 * 1024
COLLECTIONS = {
    "sggs": {"sourceId": "SGGS", "assetId": "SSA2", "sections": 51,
             "units": 5549, "lines": 60555, "pages": 1430, "authors": 35},
    "dasam": {"sourceId": "SDGR", "assetId": "DGDG", "sections": 17,
              "units": 5470, "lines": 67758, "pages": 1428, "authors": 1},
}


def need(condition, message):
    if not condition:
        raise ValueError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def encode(value, newline=False):
    # Fixed insertion order is part of the unit contract. This is byte-identical
    # to JSON.stringify(value) for the admitted integer/string/object fields.
    return (json.dumps(value, ensure_ascii=False, separators=(",", ":"),
                       allow_nan=False) + ("\n" if newline else "")).encode("utf-8")


def file_sha(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def outside_git(path):
    existing = path.resolve()
    while not existing.exists() and existing != existing.parent:
        existing = existing.parent
    if not existing.is_dir():
        existing = existing.parent
    for parent in (existing, *existing.parents):
        marker = parent / ".git"
        need(not marker.exists() and not marker.is_symlink(),
             "Source preparation must remain outside every Git tree")
    environment = {k: v for k, v in os.environ.items() if not k.startswith("GIT_")}
    environment["LC_ALL"] = "C"
    # Inspect all ancestors instead of treating a mount boundary as proof that
    # no enclosing repository exists. Caller-supplied Git overrides stay removed.
    environment["GIT_DISCOVERY_ACROSS_FILESYSTEM"] = "1"
    try:
        result = subprocess.run(
            ["git", "-C", str(existing), "rev-parse", "--is-inside-work-tree", "--is-bare-repository"],
            capture_output=True, text=True, check=False, env=environment)
    except OSError as error:
        raise ValueError("Git location checks unavailable") from error
    need(result.returncode == 128 and result.stdout == "" and
         re.fullmatch(r"fatal: not a git repository \(or any of the parent directories\): \.git\s*", result.stderr),
         "Destination is a Git repository or outside-Git status is unverified")


def source_name(raw, expected_keys):
    value = json.loads(raw)
    need(isinstance(value, dict) and set(value) == set(expected_keys), "Unexpected provider name metadata")
    need(all(isinstance(x, str) and x and not re.search(r"[<>\x00-\x1f]", x) for x in value.values()),
         "Invalid provider name metadata")
    return value


def project_collection(connection, collection_id, spec):
    """Project source groups intact; the caller pins the database before entry."""
    source_id, asset_id = spec["sourceId"], spec["assetId"]
    source = connection.execute("SELECT id,name FROM sources WHERE id=?", (source_id,)).fetchone()
    need(source is not None, "Missing source")
    name = source_name(source["name"], ("Latn", "Guru"))
    sections = [{"id": r["id"], "order": r["source_order"],
                 "name": source_name(r["name"], ("Latn",))}
                for r in connection.execute(
                    "SELECT id,source_order,name FROM sections WHERE source_id=? ORDER BY source_order", (source_id,))]
    need(len(sections) == spec["sections"], "Section coverage mismatch")
    need([s["order"] for s in sections] == list(range(1, len(sections) + 1)), "Section order gap or duplicate")
    rows = connection.execute("""
      SELECT s.id AS section_id, s.source_order, g.id AS unit_id,
             g.section_order, g.author_id, l.id AS line_id,
             l.line_group_order, a.asset_id, a.type, a.data, a.additional, a.priority
      FROM sections s JOIN line_groups g ON g.section_id=s.id
      JOIN lines l ON l.line_group_id=g.id
      LEFT JOIN asset_lines a ON a.line_id=l.id AND a.asset_id=? AND a.type='primary'
      WHERE s.source_id=?
      ORDER BY s.source_order,g.section_order,l.line_group_order
    """, (asset_id, source_id)).fetchall()
    # Page/printed-line labels are source metadata, not ordering keys. The named
    # edition includes known label decreases (Dasam 9QK and SGGS G4W).
    need(len(rows) == spec["lines"], "Missing or duplicate original records")
    need(len({r["line_id"] for r in rows}) == len(rows), "Duplicate original line identity")
    asset_count = connection.execute(
        "SELECT COUNT(*) FROM asset_lines WHERE asset_id=? AND type='primary'", (asset_id,)).fetchone()[0]
    need(asset_count == len(rows), "Primary asset contains unaccounted records")
    unit_count = connection.execute(
        "SELECT COUNT(*) FROM line_groups g JOIN sections s ON s.id=g.section_id WHERE s.source_id=?",
        (source_id,)).fetchone()[0]
    need(unit_count == spec["units"], "Source group coverage mismatch")

    units = OrderedDict()
    all_pages = set()
    printed_lines_missing = 0
    for row in rows:
        need(row["asset_id"] == asset_id and row["type"] == "primary" and row["priority"] == 1,
             "Missing, ambiguous or non-original asset row")
        text = row["data"]
        need(isinstance(text, str) and re.search(r"[\u0a00-\u0a7f]", text)
             and not re.search(r"[A-Za-z<>\x00-\x1f]", text), "Unexpected original text field")
        need(text.encode("utf-8").decode("utf-8") == text, "Original UTF-8 does not round trip")
        additional = json.loads(row["additional"])
        need(set(additional) in ({"type", "page"}, {"type", "page", "line"})
             and additional["type"] == "primary", "Unexpected primary locator metadata")
        page, printed_line = additional["page"], additional.get("line")
        need(type(page) is int and 1 <= page <= spec["pages"], "Reported page outside named edition")
        need(printed_line is None or type(printed_line) is int and printed_line > 0, "Invalid reported printed line")
        printed_lines_missing += printed_line is None
        all_pages.add(page)
        unit = units.setdefault(row["unit_id"], {
            "id": row["unit_id"], "sectionId": row["section_id"],
            "sectionOrder": row["section_order"], "authorId": row["author_id"], "lines": []})
        need((unit["sectionId"], unit["sectionOrder"], unit["authorId"]) ==
             (row["section_id"], row["section_order"], row["author_id"]), "Group metadata conflict")
        need(row["line_group_order"] == len(unit["lines"]) + 1, "Line order gap or duplicate")
        unit["lines"].append({"id": row["line_id"], "order": row["line_group_order"],
                              "page": page, "printedLine": printed_line, "text": text})
    need(len(units) == unit_count, "Empty or omitted source group")
    need(all_pages == set(range(1, spec["pages"] + 1)), "Missing reported page labels")
    for section in sections:
        groups = [u for u in units.values() if u["sectionId"] == section["id"]]
        need([u["sectionOrder"] for u in groups] == list(range(1, len(groups) + 1)), "Group order gap or duplicate")

    author_ids = sorted({u["authorId"] for u in units.values()})
    authors = []
    for author_id in author_ids:
        row = connection.execute("SELECT id,name FROM authors WHERE id=?", (author_id,)).fetchone()
        need(row is not None, "Missing source-reported author metadata")
        authors.append({"id": row["id"], "name": source_name(row["name"], ("Guru", "Latn"))})
    need(len(authors) == spec["authors"], "Source-reported author coverage mismatch")
    stats = {"sections": len(sections), "units": len(units), "lines": len(rows), "pages": len(all_pages),
             "authors": len(authors), "missingPrintedLineLabels": printed_lines_missing,
             "crossPageUnits": sum(len({r["page"] for r in u["lines"]}) > 1 for u in units.values()),
             "maxUnitLines": max(len(u["lines"]) for u in units.values()),
             "maxUnitBytes": max(len(encode(u)) for u in units.values())}
    return {"name": name, "sections": sections, "authors": authors,
            "units": list(units.values()), "stats": stats}


def chunk_collections(collection_id, edition_id, units):
    result, current = [], []

    def wrapped(index, values):
        return {"schema": "glp.sikh-reader.chunk.v1", "collectionId": collection_id,
                "editionId": edition_id, "id": f"c{index:04d}", "units": values}

    for unit in units:
        candidate = wrapped(len(result) + 1, current + [unit])
        if len(encode(candidate, True)) > CHUNK_BYTES and current:
            result.append(wrapped(len(result) + 1, current))
            current = []
        current.append(unit)
        need(len(encode(wrapped(len(result) + 1, current), True)) <= CHUNK_BYTES,
             "Whole group exceeds reviewed chunk cap; no splitting permitted")
    if current:
        result.append(wrapped(len(result) + 1, current))
    need([u for chunk in result for u in chunk["units"]] == units, "Chunking changed source group sequence")
    return result


def build_collection(connection, collection_id, spec, output):
    projected = project_collection(connection, collection_id, spec)
    edition_id = f"shabados-{VERSION}-{spec['sourceId']}-{spec['assetId']}"
    source = {"packageName": PACKAGE, "packageVersion": VERSION, "reportedGitHead": REPORTED_GIT_HEAD,
              "archiveSha256": ARCHIVE_SHA256, "databaseSha256": DATABASE_SHA256,
              "noticeSha256": NOTICE_SHA256, "sourceId": spec["sourceId"], "assetId": spec["assetId"]}
    unit_entries, chunk_entries = [], []
    root = output / collection_id
    (root / "chunks").mkdir(parents=True)
    for chunk in chunk_collections(collection_id, edition_id, projected["units"]):
        raw = encode(chunk, True)
        relative = f"chunks/{chunk['id']}.json"
        (root / relative).write_bytes(raw)
        chunk_entries.append({"id": chunk["id"], "path": relative, "bytes": len(raw),
                              "sha256": sha(raw), "unitIds": [u["id"] for u in chunk["units"]]})
        for unit in chunk["units"]:
            unit_entries.append({"id": unit["id"], "sectionId": unit["sectionId"],
                                 "sectionOrder": unit["sectionOrder"], "authorId": unit["authorId"],
                                 "lineCount": len(unit["lines"]), "pages": sorted({r["page"] for r in unit["lines"]}),
                                 "sha256": sha(encode(unit)), "chunkId": chunk["id"]})
    manifest = {"schema": "glp.sikh-reader.manifest.v1", "status": "NAMED_DIGITAL_EDITION_ORIGINAL_ONLY",
                "locatorStatus": "SOURCE_REPORTED", "collectionId": collection_id,
                "editionId": edition_id, "name": projected["name"], "source": source,
                "counts": {k: projected["stats"][k] for k in ("units", "lines", "pages")},
                "sections": projected["sections"], "authors": projected["authors"],
                "units": unit_entries, "chunks": chunk_entries}
    raw_manifest = encode(manifest, True)
    (root / "manifest.json").write_bytes(raw_manifest)
    # Read all output files back and compare every original field with the actual
    # query result. This is exact extraction verification, not source collation.
    reconstructed = []
    for entry in chunk_entries:
        raw = (root / entry["path"]).read_bytes()
        need(len(raw) == entry["bytes"] and sha(raw) == entry["sha256"], "Written chunk bytes changed")
        chunk = json.loads(raw)
        need(encode(chunk, True) == raw, "Written encoding changed")
        reconstructed.extend(chunk["units"])
    need(reconstructed == projected["units"], "Output original fields differ from database")
    return {"collectionId": collection_id, "editionId": edition_id,
            "manifestSha256": sha(raw_manifest), "manifestBytes": len(raw_manifest),
            "chunkCount": len(chunk_entries), "chunkBytes": sum(c["bytes"] for c in chunk_entries),
            "originalSequenceSha256": sha(encode(projected["units"])),
            "exactOriginalFieldsAndOrderReproduced": True, **projected["stats"],
            "sections": [{**s, "units": sum(u["sectionId"] == s["id"] for u in projected["units"]),
                          "lines": sum(len(u["lines"]) for u in projected["units"] if u["sectionId"] == s["id"])}
                         for s in projected["sections"]]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", required=True, type=Path)
    parser.add_argument("--notice", required=True, type=Path, help="Exact README.md from pinned npm package")
    parser.add_argument("--output", required=True, type=Path, help="Fresh destination outside every Git tree")
    args = parser.parse_args()
    for path, expected in ((args.database, DATABASE_SHA256), (args.notice, NOTICE_SHA256)):
        outside_git(path)
        need(path.is_file() and not path.is_symlink(), "Input must be an ordinary pinned file")
        need(file_sha(path) == expected, "Pinned source digest mismatch: " + path.name)
    outside_git(args.output)
    need(not args.output.exists() and not args.output.is_symlink(), "Refusing existing output destination")
    notice = args.notice.read_text(encoding="utf-8")
    need("## Gurbani and Panthic Compositions" in notice and "public domain" in notice,
         "Pinned original-text notice missing")
    database = args.database.resolve()
    connection = sqlite3.connect(database.as_uri() + "?mode=ro&immutable=1", uri=True)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA query_only = ON")
    need(connection.execute("PRAGMA integrity_check").fetchone()[0] == "ok", "Database integrity check failed")
    # Verify both source projections completely before creating output files.
    for collection_id, spec in COLLECTIONS.items():
        project_collection(connection, collection_id, spec)
    args.output.mkdir(parents=True, mode=0o700)
    receipts = [build_collection(connection, collection_id, spec, args.output)
                for collection_id, spec in COLLECTIONS.items()]
    connection.close()
    receipt = {"schema": "glp.shabados-original-preparation.v1", "package": PACKAGE, "version": VERSION,
               "archiveSha256": ARCHIVE_SHA256, "databaseSha256": DATABASE_SHA256,
               "noticeSha256": NOTICE_SHA256, "reportedGitHead": REPORTED_GIT_HEAD,
               "gitHeadResolution": "REGISTRY_REPORTED_GITHUB_OBJECT_NOT_RESOLVED",
               "modernTranslationsImported": False, "commentaryImported": False,
               "transliterationsImported": False, "audioImported": False,
               "textNormalizationPerformed": False, "sourceAuthorshipAdjudicated": False,
               "independentPrintedCollationPerformed": False, "runtimeAdmissionGrantedByImporter": False,
               "collections": receipts}
    (args.output / "preparation-receipt.json").write_bytes(encode(receipt, True))
    print(json.dumps({"output": str(args.output.resolve()), "collections": [
        {k: r[k] for k in ("collectionId", "manifestSha256", "manifestBytes", "chunkCount", "chunkBytes", "units", "lines", "pages")}
        for r in receipts]}, indent=2))


if __name__ == "__main__":
    main()
