#!/usr/bin/env python3
"""Synthetic extraction/boundary tests; no scripture fixture or provider review."""
import importlib.util
import json
import os
import sqlite3
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
loader = importlib.util.spec_from_file_location("original_importer", ROOT / "tools/build-shabados-original-collections.py")
module = importlib.util.module_from_spec(loader)
loader.loader.exec_module(module)
SPEC = {"sourceId": "SYN", "assetId": "SYNA", "sections": 2,
        "units": 3, "lines": 5, "pages": 2, "authors": 1}


def fixture():
    db = sqlite3.connect(":memory:")
    db.row_factory = sqlite3.Row
    db.executescript("""
      CREATE TABLE sources(id TEXT,name TEXT);
      CREATE TABLE sections(id TEXT,source_id TEXT,source_order INTEGER,name TEXT);
      CREATE TABLE line_groups(id TEXT,author_id TEXT,section_id TEXT,section_order INTEGER);
      CREATE TABLE lines(id TEXT,line_group_id TEXT,line_group_order INTEGER);
      CREATE TABLE asset_lines(asset_id TEXT,line_id TEXT,type TEXT,data TEXT,additional TEXT,priority INTEGER);
      CREATE TABLE authors(id TEXT,name TEXT);
    """)
    db.execute("INSERT INTO sources VALUES (?,?)", ("SYN", json.dumps({"Latn": "Synthetic source", "Guru": "ਪਰਖ"})))
    db.execute("INSERT INTO authors VALUES (?,?)", ("AU", json.dumps({"Guru": "ਪਰਖ", "Latn": "Synthetic author"})))
    db.executemany("INSERT INTO sections VALUES (?,?,?,?)", [
        ("SA", "SYN", 1, json.dumps({"Latn": "Synthetic section one"})),
        ("SB", "SYN", 2, json.dumps({"Latn": "Synthetic section two"}))])
    db.executemany("INSERT INTO line_groups VALUES (?,?,?,?)", [
        ("UA", "AU", "SA", 1), ("UB", "AU", "SA", 2), ("UC", "AU", "SB", 1)])
    # Artificial Punjabi labels, not represented as scripture or source evidence.
    for line_id, unit, order, page in [("L1", "UA", 1, 1), ("L2", "UA", 2, 2),
                                       ("L3", "UB", 1, 2), ("L4", "UC", 1, 2), ("L5", "UC", 2, 2)]:
        db.execute("INSERT INTO lines VALUES (?,?,?)", (line_id, unit, order))
        db.execute("INSERT INTO asset_lines VALUES (?,?,?,?,?,?)", (
            "SYNA", line_id, "primary", "ਪਰਖ; ਬਣਾਵਟੀ ਲਿਖਤ ॥", json.dumps({"type": "primary", "page": page}), 1))
        db.execute("INSERT INTO asset_lines VALUES (?,?,?,?,?,?)", (
            "PROTECTED", line_id, "translation", "RESTRICTED_TRANSLATION_SENTINEL", "{}", 1))
    return db


class SourceImportTests(unittest.TestCase):
    def test_exact_source_text_group_order_and_protected_layer_exclusion(self):
        result = module.project_collection(fixture(), "synthetic", SPEC)
        self.assertEqual([u["id"] for u in result["units"]], ["UA", "UB", "UC"])
        self.assertEqual([r["page"] for r in result["units"][0]["lines"]], [1, 2])
        self.assertEqual(result["units"][0]["lines"][0]["text"], "ਪਰਖ; ਬਣਾਵਟੀ ਲਿਖਤ ॥")
        self.assertIsNone(result["units"][0]["lines"][0]["printedLine"])
        self.assertNotIn("RESTRICTED_TRANSLATION_SENTINEL", json.dumps(result))
        self.assertEqual(result["stats"]["crossPageUnits"], 1)

    def test_missing_primary_row_refuses_instead_of_silently_skipping(self):
        db = fixture()
        db.execute("DELETE FROM asset_lines WHERE asset_id='SYNA' AND line_id='L2'")
        with self.assertRaisesRegex(ValueError, "unaccounted|Missing"):
            module.project_collection(db, "synthetic", SPEC)

    def test_duplicate_primary_row_refuses(self):
        db = fixture()
        db.execute("INSERT INTO asset_lines SELECT * FROM asset_lines WHERE asset_id='SYNA' AND line_id='L1'")
        with self.assertRaisesRegex(ValueError, "duplicate"):
            module.project_collection(db, "synthetic", SPEC)

    def test_missing_or_duplicate_group_order_refuses(self):
        for changed_order in (1, 3):
            db = fixture()
            db.execute("UPDATE line_groups SET section_order=? WHERE id='UB'", (changed_order,))
            with self.assertRaisesRegex(ValueError, "Group order"):
                module.project_collection(db, "synthetic", SPEC)

    def test_missing_or_duplicate_line_order_refuses(self):
        for changed_order in (1, 3):
            db = fixture()
            db.execute("UPDATE lines SET line_group_order=? WHERE id='L2'", (changed_order,))
            with self.assertRaisesRegex(ValueError, "Line order"):
                module.project_collection(db, "synthetic", SPEC)

    def test_unknown_primary_metadata_cannot_smuggle_a_reading_aid(self):
        db = fixture()
        db.execute("UPDATE asset_lines SET additional=? WHERE asset_id='SYNA' AND line_id='L1'",
                   (json.dumps({"type": "primary", "page": 1, "translation": "UNAPPROVED"}),))
        with self.assertRaisesRegex(ValueError, "locator metadata"):
            module.project_collection(db, "synthetic", SPEC)

    def test_source_page_label_decrease_does_not_reorder_or_repair_text(self):
        db = fixture()
        db.execute("UPDATE asset_lines SET additional=? WHERE asset_id='SYNA' AND line_id='L1'",
                   (json.dumps({"type": "primary", "page": 2}),))
        db.execute("UPDATE asset_lines SET additional=? WHERE asset_id='SYNA' AND line_id='L2'",
                   (json.dumps({"type": "primary", "page": 1}),))
        unit = module.project_collection(db, "synthetic", SPEC)["units"][0]
        self.assertEqual([r["id"] for r in unit["lines"]], ["L1", "L2"])
        self.assertEqual([r["page"] for r in unit["lines"]], [2, 1])

    def test_chunk_boundary_keeps_cross_page_group_whole(self):
        units = module.project_collection(fixture(), "synthetic", SPEC)["units"]
        with mock.patch.object(module, "CHUNK_BYTES", 650):
            chunks = module.chunk_collections("synthetic", "synthetic-edition", units)
        self.assertGreater(len(chunks), 1)
        self.assertEqual([u for c in chunks for u in c["units"]], units)
        self.assertTrue(all(len(module.encode(c, True)) <= 650 for c in chunks))
        self.assertEqual(len(chunks[0]["units"][0]["lines"]), 2)

    def test_oversized_group_refuses_instead_of_splitting(self):
        units = module.project_collection(fixture(), "synthetic", SPEC)["units"]
        with mock.patch.object(module, "CHUNK_BYTES", 100), self.assertRaisesRegex(ValueError, "no splitting"):
            module.chunk_collections("synthetic", "synthetic-edition", units)

    def test_source_pin_failure_prevents_any_output(self):
        with tempfile.TemporaryDirectory(prefix="glp-source-pin-test-") as directory:
            root = Path(directory)
            (root / "fake.sqlite").write_bytes(b"SYNTHETIC CHANGED SOURCE")
            (root / "fake-notice.md").write_text("SYNTHETIC NOTICE")
            result = subprocess.run([sys.executable, str(ROOT / "tools/build-shabados-original-collections.py"),
                                     "--database", str(root / "fake.sqlite"), "--notice", str(root / "fake-notice.md"),
                                     "--output", str(root / "output")], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Pinned source digest mismatch", result.stderr)
            self.assertFalse((root / "output").exists())

    def test_injected_git_environment_cannot_hide_an_ancestor_marker(self):
        with tempfile.TemporaryDirectory(prefix="glp-source-git-test-") as directory:
            root = Path(directory)
            (root / ".git").write_text("gitdir: /synthetic/dangling/worktree\n")
            with mock.patch.dict(os.environ, {"GIT_DIR": "/synthetic/missing", "GIT_CEILING_DIRECTORIES": str(root)}):
                with self.assertRaisesRegex(ValueError, "Git tree"):
                    module.outside_git(root / "new" / "payload")


if __name__ == "__main__":
    unittest.main(verbosity=2)
