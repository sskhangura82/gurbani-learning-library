"""GLP N1: source-only capture of candidate Sohila Ang 12–13 originals.
Requires network explicitly at execution time; CI uses pinned immutable JSON only.
Not a source edition certification, human verification, translation, audio or release.
Never changes the frozen Japji app / GitHub main.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import html
import json
import re
import unicodedata
import urllib.request
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "docs" / "research" / "n1-sohila"
PRIMARY_TEMPLATE = "https://srigurugranth.net/{:04d}.html"
COMPARATOR_TEMPLATE = "https://opengranth.org/ang/{}/"
PRIMARY_PATTERN = r"<P class=Gurb><SPAN lang=PA>(.*?)</SPAN></p>"
SECONDARY_PATTERN = r'<p class="gurmukhi">(.*?)</p>'
HEADINGS = (
    "ਸੋਹਿਲਾ ਰਾਗੁ ਗਉੜੀ ਦੀਪਕੀ ਮਹਲਾ ੧",
    "ਰਾਗੁ ਆਸਾ ਮਹਲਾ ੧ ॥",
    "ਰਾਗੁ ਧਨਾਸਰੀ ਮਹਲਾ ੧ ॥",
    "ਰਾਗੁ ਗਉੜੀ ਪੂਰਬੀ ਮਹਲਾ ੪ ॥",
    "ਰਾਗੁ ਗਉੜੀ ਪੂਰਬੀ ਮਹਲਾ ੫ ॥",
)
EXPECTED_COUNTS = (12, 8, 14, 11, 11)
UNIT_META = [
    ("sohila01", "Shabad 1 · Gauree Deepakee · Guru Nanak Sahib"),
    ("sohila02", "Shabad 2 · Aasaa · Guru Nanak Sahib"),
    ("sohila03", "Shabad 3 · Dhanaasree · Guru Nanak Sahib"),
    ("sohila04", "Shabad 4 · Gauree Poorbee · Guru Ram Das Sahib"),
    ("sohila05", "Shabad 5 · Gauree Poorbee · Guru Arjan Sahib"),
]
END_EXACT = "ਨਾਨਕ ਦਾਸੁ ਇਹੈ ਸੁਖੁ ਮਾਗੈ ਮੋ ਕਉ ਕਰਿ ਸੰਤਨ ਕੀ ਧੂਰੇ ॥੪॥੫॥"
START_EXACT = "ਸੋਹਿਲਾ ਰਾਗੁ ਗਉੜੀ ਦੀਪਕੀ ਮਹਲਾ ੧"
UA = "Mozilla/5.0 (compatible; GLP-001 source research; original Gurbani only)"
def sha(text: str | bytes) -> str:
    return hashlib.sha256(text if isinstance(text, bytes) else text.encode("utf-8")).hexdigest()
def norm(text: str) -> str:
    return re.sub(r"\s+", " ", unicodedata.normalize("NFC", text).replace("\xa0", " ")).strip()
def collect(fmt: str, pattern: str):
    rows, receipts = [], []
    for ang in (12, 13):
        url = fmt.format(ang)
        request = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(request, timeout=25) as response:
            resolved = response.geturl()
            if response.status != 200 or urlsplit(resolved).scheme != "https" or urlsplit(resolved).netloc != urlsplit(url).netloc:
                raise ValueError("Untrusted source response: " + url)
            raw = response.read(300001)
        if len(raw) > 300000:
            raise ValueError("Refusing unexpectedly large source response: " + url)
        text = raw.decode("utf8", errors="strict")
        extracted = re.findall(pattern, text, re.I | re.S)
        if not 30 <= len(extracted) <= 80:
            raise ValueError("Unexpected amount of Ang " + str(ang) + " source text")
        for index, piece in enumerate(extracted):
            original = html.unescape(re.sub(r"<[^>]*>", "", piece))
            original = original.replace("\xa0", " ").strip()
            if not original or "\0" in original or not any("\u0a00" <= ch <= "\u0a7f" for ch in original):
                raise ValueError("Source contains non-original segment")
            rows.append({"ang": ang, "webPageRow": index, "original": original})
        receipts.append({"url": url, "httpStatus": 200, "retrievedBytes": len(raw), "pageSha256": sha(raw), "extractedGurmukhiRows": len(extracted)})
    return rows, receipts

def bounded(rows):
    start = [i for i, row in enumerate(rows) if row["original"] == START_EXACT]
    if len(start) != 1:
        raise ValueError("Sohila start heading changed or duplicated")
    start = start[0]
    ends = [i for i, row in enumerate(rows) if row["original"] == END_EXACT and i >= start]
    if len(ends) != 1:
        raise ValueError("Sohila closing boundary missing or duplicated")
    chosen = rows[start:ends[0] + 1]
    if len(chosen) != sum(EXPECTED_COUNTS):
        raise ValueError(f"Expected 56 original rows, got {len(chosen)} — STOP, do not alter source")
    starts = [i for i, row in enumerate(chosen) if row["original"] in HEADINGS]
    if starts != [0, 12, 20, 34, 45]:
        raise ValueError("One of the five source headings/sequence boundaries changed: " + repr(starts))
    if chosen[0]["ang"] != 12 or chosen[-1]["ang"] != 13:
        raise ValueError("Wrong Ang boundaries")
    return chosen, starts

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--capture", action="store_true", help="Explicit public-source HTTPS retrieval; never used in CI")
    args = parser.parse_args()
    if not args.capture:
        parser.error("Use --capture explicitly. No automated network on import or CI.")
    if (OUTPUT / "sohila-candidate-original.json").exists() or (OUTPUT / "sohila-source-comparison.json").exists():
        parser.error("Refuse overwrite; source review receipts are immutable snapshots")
    primary, primary_receipts = collect(PRIMARY_TEMPLATE, PRIMARY_PATTERN)
    secondary, secondary_receipts = collect(COMPARATOR_TEMPLATE, SECONDARY_PATTERN)
    chosen, starts = bounded(primary)
    # Compare normalized positive Gurmukhi only. Non-match means REVIEW, not a
    # proved scripture disagreement. The comparator sometimes merges two lines
    # or has distinct line breaks around an Ang boundary.
    comparator_normalized = [(r["ang"], norm(r["original"])) for r in secondary]
    secondary_lines = {t for _, t in comparator_normalized}
    combined = " ".join(t for _, t in comparator_normalized)
    checks = []
    for index, row in enumerate(chosen):
        original = row["original"]
        x = norm(original)
        is_line = x in secondary_lines
        substring = x in combined
        checks.append({
            "primaryOrdinal": index + 1, "ang": row["ang"], "digitalRow": row["webPageRow"],
            "primaryOriginalSha256": sha(original),
            "comparatorExactNormalizedRow": is_line,
            "comparatorExactNormalizedSubstring": substring,
            "requiresSegmentReview": not is_line,
        })
    if not all(x["comparatorExactNormalizedSubstring"] for x in checks):
        raise ValueError("Comparator contains unresolved text/nonpositive match: STOP, do not silently normalize.")
    if sum(x["comparatorExactNormalizedRow"] for x in checks) != 51:
        raise ValueError("Exact-row match count changed; inspect each source before intake")
    units = []
    for i, (unitId, title) in enumerate(UNIT_META):
        body = chosen[starts[i]:(starts[i+1] if i+1 < len(starts) else len(chosen))]
        if len(body) != EXPECTED_COUNTS[i] or body[0]["original"] != HEADINGS[i]:
            raise ValueError("Invalid source shabad boundary")
        lines = [{
            "id": f"{unitId}.line{j+1:02d}",
            "text": row["original"],
            "sha256": sha(row["original"]),
            "location": {"system": "ang", "ang": row["ang"]},
            "digitalPageRow": row["webPageRow"],
            "sourceLayer": "gurmukhi_original_candidate"
        } for j, row in enumerate(body)]
        units.append({
            "unitId": unitId, "kind": "shabad", "title": title, "titleGurmukhi": "",
            "printedRaag": HEADINGS[i],
            "raagEvidence": {"source": PRIMARY_TEMPLATE.format(body[0]["ang"]), "sourceRow": body[0]["webPageRow"]},
            "sourceHeadingIncludedInLines": True,
            "lines": lines
        })
    edition_id = "sggs-digital-ang12-13-source-candidate-20261025"
    model = {
        "schemaVersion": 1, "compositionId": "kirtan-sohila", "title": "Kirtan Sohila",
        "titleGurmukhi": "ਸੋਹਿਲਾ",
        "edition": {
            "editionId": edition_id, "sourceFamily": "sggs", "locationScheme": "ang",
            "sourceRelease": "retrieved-2026-10-25-primary-html",
            "sourceFileHash": sha(b"".join(bytes.fromhex(r["pageSha256"]) for r in primary_receipts)),
            "sourceStatus": "machine_frozen",
            "rightsStatus": "original_gurmukhi_not_yet_cleared_for_project_release",
            "humanCollationApproved": False,
            "editionAuthority": None,
            "editionCitation": None,
            "secondSource": "opengranth.org/ang/12-13",
        },
        "ui": {"readable": False, "meaningReviewStatus": "not_ingested",
               "studyReviewStatus": "not_ingested", "preserveLegacyLearningKeys": False,
               "raagStatus": "printed_source_pending_review"},
        "units": units
    }
    evidence = {
        "capturedAtUtc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "scope": "DIGITAL SOURCE CANDIDATE ONLY; not independently collated edition or approved Nitnem paath",
        "primary": primary_receipts, "comparator": secondary_receipts,
        "sourceModelEditionId": edition_id,
        "primaryUnits": len(units), "primaryOriginalRows": len(chosen),
        "shabadLineCountsIncludingSourceHeadings": list(EXPECTED_COUNTS),
        "comparatorExactNormalizedRows": sum(x["comparatorExactNormalizedRow"] for x in checks),
        "comparatorExactPositiveSubstrings": sum(x["comparatorExactNormalizedSubstring"] for x in checks),
        "segmentationOrHeadingReviewRequired": [x for x in checks if x["requiresSegmentReview"]],
        "allComparisons": checks,
        "warnings": [
            "A digital comparator is not an independently checked physical/SGPC source edition",
            "Comparator may share underlying Shabad OS or derivative databases with other websites",
            "Open Granth merges two source rows and adds a terminal danda to a heading; original strings were NOT auto-corrected",
            "Source headings are included in 56 original rows; a future reader must NOT duplicate them as extra lyrics",
            "No translations, pronunciation rules, audio, personal user data or unapproved verse boundaries were imported",
            "This record is for review and NEVER marks the source as approved or available on the family site"
        ],
        "qualifiedSikhPunjabiApproval": "PENDING",
        "independentEditionCollation": "PENDING",
        "publicationAllowed": False
    }
    OUTPUT.mkdir(parents=True, exist_ok=True)
    (OUTPUT / "sohila-candidate-original.json").write_text(json.dumps(model, ensure_ascii=False, indent=2) + "\n")
    (OUTPUT / "sohila-source-comparison.json").write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({
        "status": "SOURCE_DIGITAL_CANDIDATE_ONLY",
        "originals": len(chosen), "shabads": len(units),
        "exactPositiveRowMatches": evidence["comparatorExactNormalizedRows"],
        "normalizedSubstringMatches": evidence["comparatorExactPositiveSubstrings"],
        "heldForHumanSourceReview": True
    }))

if __name__ == "__main__":
    main()
