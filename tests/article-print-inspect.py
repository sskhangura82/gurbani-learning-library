#!/usr/bin/env python3
"""Inspect article print PDFs; rendering still requires human visual review.

Example:
  python3 tests/article-print-inspect.py a4.pdf letter.pdf \
    --expect-pair pairs.json --output-dir evidence/article-print

pairs.json is either a list, or {"pairs": [...]}; each item contains:
  {"id": "pair-a", "markers": ["Unique printed citation", "Unique end label"],
   "gurmukhi": ["Exact original line from a canonical test fixture"]}

Use unique visible markers for each pair. A repeated generic heading such as
"Explanation" cannot identify one pair in a multi-pair document. Expected text
is compared only after NFC and whitespace normalization of PDF extraction.
Canonical source files are never read or modified by this tool.
"""

import argparse
import hashlib
import importlib.util
import json
import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path

FORMATS = {"A4": (595.2756, 841.8898), "Letter": (612.0, 792.0)}
LIMITS = (
    "PDF geometry and extracted text checks only. Resolving or matching a "
    "reference does not prove its meaning, authenticity, rights, or qualified "
    "approval. PNGs require human visual review of glyphs and layout. These "
    "results are not physical printing, printed scripture collation, phone, "
    "Safari, or VoiceOver acceptance."
)


def normalized(value):
    return re.sub(r"\s+", " ", unicodedata.normalize("NFC", value)).strip()


def sha(value):
    return hashlib.sha256(value).hexdigest()


def load_pairs(path):
    if path is None:
        return [], None
    raw = path.read_bytes()
    data = json.loads(raw)
    pairs = data.get("pairs") if isinstance(data, dict) else data
    if not isinstance(pairs, list):
        raise ValueError("Expected a JSON pair list or an object with a pairs list")
    seen_ids = set()
    for pair in pairs:
        if not isinstance(pair, dict) or not isinstance(pair.get("id"), str):
            raise ValueError("Each pair needs a string id")
        if not pair["id"].strip() or pair["id"] in seen_ids:
            raise ValueError("Pair ids must be nonempty and unique")
        seen_ids.add(pair["id"])
        markers = pair.get("markers", [])
        lines = pair.get("gurmukhi", [])
        if not isinstance(markers, list) or not isinstance(lines, list):
            raise ValueError("markers and gurmukhi must be lists")
        if len(markers) < 2:
            raise ValueError("Each pair needs at least two unique printed markers")
        if not lines:
            raise ValueError("Each pair needs its expected original Gurmukhi line(s)")
        values = markers + lines
        if any(not isinstance(x, str) or not normalized(x) for x in values):
            raise ValueError("Every expected marker and line must be a nonempty string")
        if len({normalized(x) for x in markers}) != len(markers):
            raise ValueError("Markers within a pair must be distinct")
    return pairs, {"path": str(path), "sha256": sha(raw)}


def get_backend():
    if importlib.util.find_spec("fitz"):
        import fitz
        if hasattr(fitz, "open") and hasattr(fitz, "Matrix"):
            return "PyMuPDF", fitz
    if importlib.util.find_spec("pdfplumber") and shutil.which("pdftoppm"):
        import pdfplumber
        return "pdfplumber+Poppler", pdfplumber
    raise RuntimeError("Install PyMuPDF, or provide pdfplumber and pdftoppm, in the test runtime. No packages were installed by this tool.")


def poppler_text(path, page_number):
    """Use one declared extractor for fidelity checks, independently of rendering.

    PyMuPDF 1.26.6 duplicates dependent Gurmukhi vowel signs in some subjoined-ra
    clusters in these PDFs despite correct /ActualText. It remains useful for
    geometry/rendering; it is not the fidelity instrument. No matching-driven
    fallback or character repair is performed here.
    """
    if not shutil.which("pdftotext"):
        raise RuntimeError("Poppler pdftotext is required for canonical text checks; no alternate extractor is silently substituted.")
    result = subprocess.run(
        ["pdftotext", "-f", str(page_number), "-l", str(page_number),
         "-enc", "UTF-8", "-nopgbrk", str(path), "-"],
        check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return result.stdout.decode("utf-8", errors="strict")


def poppler_version():
    result = subprocess.run(["pdftotext", "-v"], check=True,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return (result.stderr or result.stdout).decode("utf-8", errors="strict").splitlines()[0]


def page_records(path, output, backend, module, dpi):
    records = []
    if backend == "PyMuPDF":
        with module.open(path) as document:
            for number, page in enumerate(document, 1):
                blocks = page.get_text("dict", flags=0).get("blocks", [])
                spans = [span for block in blocks for line in block.get("lines", [])
                         for span in line.get("spans", []) if span.get("text", "").strip()]
                image = output / ("page-%02d.png" % number)
                page.get_pixmap(matrix=module.Matrix(dpi / 72, dpi / 72), alpha=False).save(image)
                records.append({"number": number, "width": page.rect.width,
                                "height": page.rect.height,
                                "text": poppler_text(path, number),
                                "boxes": [{"text": s["text"], "bbox": s["bbox"]} for s in spans],
                                "image": str(image)})
    else:
        with module.open(path) as document:
            for number, page in enumerate(document.pages, 1):
                words = page.extract_words()
                records.append({"number": number, "width": page.width,
                                "height": page.height,
                                "text": poppler_text(path, number),
                                "boxes": [{"text": w["text"], "bbox": [w["x0"], w["top"], w["x1"], w["bottom"]]} for w in words],
                                "image": str(output / ("page-%02d.png" % number))})
        for record in records:
            prefix = output / ("page-%02d" % record["number"])
            subprocess.run(["pdftoppm", "-f", str(record["number"]), "-l", str(record["number"]),
                            "-singlefile", "-r", str(dpi), "-png", str(path), str(prefix)], check=True,
                           stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    return records


def inspect(path, pairs, output, backend, module, margin_mm, dpi):
    raw = path.read_bytes()
    document_hash = sha(raw)
    target = output / (path.stem + "-" + document_hash[:8])
    target.mkdir(parents=True, exist_ok=True)
    pages = page_records(path, target, backend, module, dpi)
    failures = []
    public_pages = []
    margin_pt = margin_mm * 72 / 25.4
    tolerance_pt = 1.0
    for page in pages:
        width, height = page["width"], page["height"]
        detected = next((name for name, size in FORMATS.items()
                         if abs(width - size[0]) <= 2 and abs(height - size[1]) <= 2), None)
        if detected is None:
            failures.append("Page %s is neither portrait A4 nor portrait Letter" % page["number"])
        if not page["text"].strip():
            failures.append("Page %s has no extractable text" % page["number"])
        outside = []
        for box in page["boxes"]:
            x0, y0, x1, y1 = box["bbox"]
            if (x0 < margin_pt - tolerance_pt or y0 < margin_pt - tolerance_pt
                    or x1 > width - margin_pt + tolerance_pt
                    or y1 > height - margin_pt + tolerance_pt):
                outside.append(box)
        if outside:
            failures.append("Page %s has %s text bounds outside the configured minimum margin" % (page["number"], len(outside)))
        public_pages.append({"number": page["number"], "format": detected,
                             "widthPt": width, "heightPt": height,
                             "nonemptyTextBounds": len(page["boxes"]),
                             "outsideMinimumMargin": outside,
                             "renderedPNG": page["image"]})
    if not pages:
        failures.append("PDF contains no pages")
    pair_results = []
    for pair in pairs:
        checks = []
        for kind, values in [("marker", pair.get("markers", [])), ("gurmukhi", pair.get("gurmukhi", []))]:
            for expected in values:
                needle = normalized(expected)
                hits = [{"page": p["number"], "count": normalized(p["text"]).count(needle)} for p in pages]
                hits = [hit for hit in hits if hit["count"]]
                count = sum(hit["count"] for hit in hits)
                checks.append({"kind": kind, "expected": expected,
                               "expectedUTF8Sha256": sha(expected.encode("utf-8")),
                               "occurrences": hits, "exactlyOnce": count == 1})
                if count != 1:
                    failures.append("Pair %s: %s expected once, found %s after declared extraction normalization" % (pair["id"], kind, count))
        matched_pages = {hit["page"] for check in checks for hit in check["occurrences"]}
        together = len(matched_pages) == 1 and all(check["exactlyOnce"] for check in checks)
        if not together:
            failures.append("Pair %s is not proven complete on one page" % pair["id"])
        pair_results.append({"id": pair["id"], "allOnOnePage": together,
                             "page": next(iter(matched_pages)) if together else None, "checks": checks})
    return {"pdf": str(path), "sha256": document_hash, "status": "FAIL" if failures else "PASS",
            "minimumMarginMm": margin_mm, "marginTolerancePt": tolerance_pt,
            "pages": public_pages, "pairs": pair_results, "failures": failures}


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("pdf", nargs="+", type=Path)
    parser.add_argument("--expect-pair", type=Path, help="JSON pair expectations, shared by the supplied PDFs")
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--min-margin-mm", type=float, default=10.0)
    parser.add_argument("--dpi", type=int, default=150)
    args = parser.parse_args()
    if args.min_margin_mm < 0 or not 72 <= args.dpi <= 300:
        parser.error("Margin must be nonnegative and render resolution must be 72-300 dpi")
    try:
        pairs, expectation = load_pairs(args.expect_pair)
        backend, module = get_backend()
        text_backend_version = poppler_version()
        args.output_dir.mkdir(parents=True, exist_ok=True)
        results = [inspect(path, pairs, args.output_dir, backend, module,
                           args.min_margin_mm, args.dpi) for path in args.pdf]
        report = {"schemaVersion": 1, "backend": backend,
                  "backendVersion": getattr(module, "VersionBind", getattr(module, "__version__", "unknown")),
                  "geometryBackend": backend, "textBackend": "Poppler pdftotext",
                  "textBackendVersion": text_backend_version,
                  "status": "FAIL" if any(item["status"] == "FAIL" for item in results) else "PASS",
                  "extractionNormalization": "Unicode NFC and collapsed whitespace only; no punctuation or letter removal",
                  "expectationFile": expectation,
                  "pairCoverage": "Configured pairs only" if pairs else "No pair assertions supplied; geometry and rendering only",
                  "visualReview": "NOT_PERFORMED_BY_SCRIPT", "limits": LIMITS, "documents": results}
        report_path = args.output_dir / "inspection.json"
        report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(json.dumps({"status": report["status"], "report": str(report_path),
                          "documents": [{"pdf": r["pdf"], "pages": len(r["pages"]),
                                         "status": r["status"], "failures": r["failures"]} for r in results],
                          "visualReview": report["visualReview"]}, ensure_ascii=False))
        return 1 if report["status"] == "FAIL" else 0
    except (OSError, ValueError, RuntimeError, subprocess.CalledProcessError) as error:
        print(json.dumps({"status": "ERROR", "message": str(error), "limits": LIMITS}), file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
