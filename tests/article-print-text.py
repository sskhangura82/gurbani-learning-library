#!/usr/bin/env python3
"""Regression for the actual Gurmukhi extraction defect, using existing PDFs.

Only temporary PDF copies are altered. An /ActualText cluster mutation is a
genuine change to the PDF's semantic text, not a relaxed expectation or mock.
"""
import importlib.util
import json
import re
import tempfile
import unittest
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("article_print_inspect", ROOT / "tests/article-print-inspect.py")
inspector = importlib.util.module_from_spec(spec)
spec.loader.exec_module(inspector)


class PrintTextFidelity(unittest.TestCase):
    def test_all_six_documents_retain_exact_expected_lines_once(self):
        for stem, pair in [("haumai-source-sheet", "haumai-source-sheet"),
                           ("dubidha-source-sheet", "dubidha-source-sheet"),
                           ("pagination-stress", "haumai-source-sheet")]:
            pairs, _ = inspector.load_pairs(ROOT / f"evidence/articles/print/{pair}-pairs.json")
            for paper in ["a4", "letter"]:
                pdf = ROOT / f"evidence/articles/print/{stem}-{paper}.pdf"
                with fitz.open(pdf) as document:
                    pages = [inspector.normalized(inspector.poppler_text(pdf, n + 1))
                             for n in range(len(document))]
                for expected_pair in pairs:
                    page_sets = []
                    for value in expected_pair["markers"] + expected_pair["gurmukhi"]:
                        needle = inspector.normalized(value)
                        self.assertEqual(sum(page.count(needle) for page in pages), 1,
                                         (pdf.name, value))
                        page_sets.append({i for i, page in enumerate(pages) if needle in page})
                    self.assertEqual(len(set.union(*page_sets)), 1, pdf.name)

    def test_real_pdf_semantic_text_mutation_is_not_repaired(self):
        source = ROOT / "evidence/articles/print/haumai-source-sheet-a4.pdf"
        pairs, _ = inspector.load_pairs(ROOT / "evidence/articles/print/haumai-source-sheet-pairs.json")
        line = next(line for pair in pairs for line in pair["gurmukhi"] if "ਪ੍ਰਾਨੀ" in line)
        self.assertIn(inspector.normalized(line), inspector.normalized(inspector.poppler_text(source, 1)))
        with tempfile.TemporaryDirectory(prefix="glp-print-mutation-") as temp:
            changed = Path(temp) / "changed.pdf"
            with fitz.open(source) as document:
                mutations = 0
                for xref in document[0].get_contents():
                    stream = document.xref_stream(xref)
                    def alter(match):
                        nonlocal mutations
                        text = bytes.fromhex(match.group(1).decode("ascii")).decode("utf-16-be")
                        if text == "\ufeffਪ੍ਰਾ" and mutations == 0:
                            mutations += 1
                            return b"/ActualText <" + "\ufeffਪ੍ਰਾਾ".encode("utf-16-be").hex().encode("ascii") + b">"
                        return match.group(0)
                    updated = re.sub(rb"/ActualText\s*<([^>]+)>", alter, stream)
                    if updated != stream:
                        document.update_stream(xref, updated)
                self.assertEqual(mutations, 1, "The negative control must alter an actual source cluster")
                document.save(changed)
            text = inspector.normalized(inspector.poppler_text(changed, 1))
            self.assertNotIn(inspector.normalized(line), text)
            self.assertIn(inspector.normalized(line.replace("ਪ੍ਰਾਨੀ", "ਪ੍ਰਾਾਨੀ")), text)
            backend, module = inspector.get_backend()
            report = inspector.inspect(changed, pairs, Path(temp), backend, module, 10, 72)
            self.assertEqual(report["status"], "FAIL")
            self.assertTrue(any("gurmukhi expected once, found 0" in error for error in report["failures"]))

    def test_normalization_keeps_vowel_signs_joiners_and_punctuation(self):
        for left, right in [("ਪ੍ਰਾਨੀ", "ਪ੍ਰਾਾਨੀ"), ("ਪ੍ਰੀਤਿ", "ਪ੍ਰੀੀਤਿ"),
                            ("ਕ", "ਕ\u200d"), ("ਕ ॥", "ਕ")]:
            self.assertNotEqual(inspector.normalized(left), inspector.normalized(right))


if __name__ == "__main__":
    unittest.main()
