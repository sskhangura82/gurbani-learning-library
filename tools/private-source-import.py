#!/usr/bin/env python3
"""Losslessly package approved local public-domain sources OUTSIDE any Git tree.

No downloads, passwords, encryption, AI rewriting, publishing, or private text
is embedded in this importer. Input digests must be supplied by the caller.
"""
import argparse
import hashlib
import json
import os
import re
import subprocess
from collections import OrderedDict
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from zipfile import ZipFile

CHAPTER = re.compile(r"eng-web_(\d{3})_([A-Z0-9]{3})_(\d+)_read\.txt\Z")
NOTICE = "eng-web_000_000_000_read.txt"
ANCILLARY = {"copr.htm", NOTICE, "keys.asc", "signature.txt.asc"}
MAX_BYTES = 12 * 1024 * 1024


def sha(data):
    return hashlib.sha256(data).hexdigest()


def decoded(data):
    text = data.decode("utf-8-sig", errors="strict")
    restored = text.encode("utf-8-sig" if data.startswith(b"\xef\xbb\xbf") else "utf-8")
    if restored != data:
        raise ValueError("Source UTF-8 round-trip mismatch")
    return text


class CopyrightText(HTMLParser):
    """Retain all rendered BODY text; no word, spelling or punctuation edits."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_body = False
        self.hidden = 0
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag == "body":
            self.in_body = True
        if tag in ("script", "style"):
            self.hidden += 1

    def handle_endtag(self, tag):
        if tag == "body":
            self.in_body = False
        if tag in ("script", "style"):
            self.hidden -= 1

    def handle_data(self, data):
        if self.in_body and not self.hidden:
            self.parts.append(data)


def metadata(url, attribution, checked_on):
    return {"url": url, "rights": "public-domain", "attribution": attribution,
            "checkedOn": checked_on, "permissionRef": ""}


def bible(archive, checked_on):
    works, entries, groups = [], [], OrderedDict()
    with ZipFile(archive) as z:
        infos = z.infolist()
        names = [info.filename for info in infos]
        if len(names) != len(set(names)) or sum(i.file_size for i in infos) > 20 * 1024 * 1024:
            raise ValueError("Duplicate or oversized archive entries")
        if z.testzip() is not None:
            raise ValueError("ZIP CRC failure")
        if set(names).difference(ANCILLARY).difference(n for n in names if CHAPTER.fullmatch(n)):
            raise ValueError("Unclassified archive entry: review source before importing")
        for name in names:
            data = z.read(name)
            match = CHAPTER.fullmatch(name) if name not in ANCILLARY else None
            item = {"name": name, "bytes": len(data), "sha256": sha(data)}
            if not match:
                item["disposition"] = "publisher-notice" if name in (NOTICE, "copr.htm") else "signing-metadata-not-reader-text"
                entries.append(item)
                continue
            order, code, chapter_number = match.groups()
            key = (order, code)
            text = decoded(data)
            lines = text.splitlines()
            number = int(chapter_number)
            if not lines or lines[1] != f"Chapter {number}.":
                raise ValueError(f"Source chapter heading differs from filename: {name}")
            group = groups.setdefault(key, [])
            if number != len(group) + 1:
                raise ValueError(f"Missing, duplicate or reordered chapter in {code}: {number}")
            group.append((name, text))
            item.update({"disposition": "chapter", "bookCode": code, "chapter": number,
                         "textUtf8Sha256": sha(text.encode("utf-8")), "characters": len(text),
                         "bomOnlyRemoved": data.startswith(b"\xef\xbb\xbf")})
            entries.append(item)
        if list(groups) != sorted(groups):
            raise ValueError("Archive book ordering changed; inspect publisher order")
        notice = decoded(z.read(NOTICE))
        copyright_html = decoded(z.read("copr.htm"))
        parser = CopyrightText()
        parser.feed(copyright_html)
        copyright_text = "".join(parser.parts)
        if "Public Domain" not in copyright_text or "Trademark" not in copyright_text:
            raise ValueError("Publisher rights declaration missing")
        if "footnotes, introductions, and verse numbers have been stripped out" not in notice:
            raise ValueError("Read-aloud edition notice changed")
        source = metadata("https://ebible.org/eng-web/", "World English Bible Classic, eBible.org. Publisher-selected ecumenical book set. Unmodified publisher read-aloud chapter text; the publisher omits footnotes, introductions and verse numbers in this format. The full edition and rights notices are included separately.", checked_on)
        works.append({"id": "web-classic-edition-notices", "tradition": "bible",
                      "title": "World English Bible Classic — publisher notices", "language": "English",
                      "edition": "Publisher read-aloud archive; edition and rights notices",
                      "source": source, "paragraphs": [notice, copyright_text]})
        books = []
        for (order, code), chapters in groups.items():
            # Titles come from the actual first chapter. Source spellings remain
            # untouched, including any publisher typographical errors.
            title = chapters[0][1].splitlines()[0]
            paragraphs = [text for _, text in chapters]
            works.append({"id": "web-classic-" + code.lower(), "tradition": "bible", "title": title,
                          "language": "English", "edition": "World English Bible Classic — publisher read-aloud text",
                          "source": source, "paragraphs": paragraphs})
            books.append({"code": code, "archiveOrder": order, "title": title, "chapterCount": len(chapters),
                          "filenames": [name for name, _ in chapters],
                          "joinedTextSha256": sha("".join(paragraphs).encode("utf-8"))})
        # Verify every canonical chapter against its ZIP bytes after packaging.
        by_id = {w["id"]: w for w in works}
        for book in books:
            actual = by_id["web-classic-" + book["code"].lower()]["paragraphs"]
            expected = [decoded(z.read(name)) for name in book["filenames"]]
            if actual != expected:
                raise ValueError("Packaged Bible differs from source")
        expected_names = [n for n in names if n not in ANCILLARY and CHAPTER.fullmatch(n)]
        included_names = [n for book in books for n in book["filenames"]]
        if included_names != expected_names:
            raise ValueError("A chapter was omitted, duplicated or reordered")
        ancillary_bytes = {name: z.read(name) for name in ANCILLARY if name in names}
    return works, {"archiveEntries": len(entries), "bookCount": len(books),
                   "chapterCount": sum(b["chapterCount"] for b in books), "books": books, "files": entries,
                   "preservation": "All canonical chapter characters and line endings retained; only UTF-8 BOM removed. All headings retained. Publisher notice retained. Copyright rendered BODY text retained; original HTML archived separately.",
                   "signatures": "Publisher key and signature files retained outside Git; signature trust not verified."}, ancillary_bytes


def dhammapada(path, checked_on):
    data = path.read_bytes()
    text = decoded(data)
    headings = list(re.finditer(r"(?m)^Chapter ([IVXLCDM]+)\.[^\r\n]*", text))
    if len(headings) != 26:
        raise ValueError("Expected the documented 26 chapter headings")
    start_marker = "*** START OF THE PROJECT GUTENBERG EBOOK "
    end_marker = "*** END OF THE PROJECT GUTENBERG EBOOK "
    if text.count(start_marker) != 1 or text.count(end_marker) != 1:
        raise ValueError("Gutenberg source boundary markers missing/ambiguous")
    end = text.index(end_marker)
    if "FULL PROJECT GUTENBERG" not in text[end:] or "Section 5." not in text[end:]:
        raise ValueError("Full Gutenberg license missing")
    if "[Note: The introduction, notes and index have been omitted.]" not in text:
        raise ValueError("Publisher edition omission notice missing")
    body = text[headings[0].start():end]
    labels = re.findall(r"(?m)^(\d+(?:, \d+)*)\. ", body)
    verses = [int(n) for label in labels for n in label.split(", ")]
    if verses != list(range(1, 424)):
        raise ValueError("Verse labels do not cover 1–423 in exact order")
    # Front matter, all chapters, and complete end notice/license. Slicing adds,
    # removes and normalizes no character. Each segment stays below schema limit.
    boundaries = [0] + [h.start() for h in headings] + [end, len(text)]
    paragraphs = [text[a:b] for a, b in zip(boundaries, boundaries[1:])]
    if "".join(paragraphs) != text:
        raise ValueError("Dhammapada reconstruction mismatch")
    work = {"id": "dhammapada-muller-pg2017", "tradition": "early-buddhist", "title": "The Dhammapada — F. Max Müller",
            "language": "English", "edition": "Project Gutenberg eBook 2017; F. Max Müller translation; source update 11 December 2024",
            "source": metadata("https://www.gutenberg.org/ebooks/2017", "F. Max Müller, translation from Pali; The Sacred Books of the East, Volume X, Part I. Project Gutenberg eBook 2017, produced by Tom Weiss and David Widger. The source edition omits the introduction, notes and index. Full source notice and Project Gutenberg license are retained. Public domain in the USA.", checked_on),
            "paragraphs": paragraphs}
    return work, {"file": path.name, "bytes": len(data), "sha256": sha(data), "textUtf8Sha256": sha(text.encode("utf-8")),
                  "chapterCount": len(headings), "verseNumbers": len(verses), "verseParagraphGroups": len(labels),
                  "chapterHeadings": [h.group(0) for h in headings], "paragraphs": len(paragraphs),
                  "completeSourceNoticeAndLicenseRetained": True,
                  "preservation": "Every decoded character and CRLF retained, including front matter, all 26 chapters and full end notice/license. Only UTF-8 BOM removed."}


def outside_git(path):
    # Resolve symlink ancestors before testing even a not-yet-created output.
    # Reject markers ourselves: Git can otherwise be redirected by environment
    # variables, stopped at a mount boundary, or fail because a marker is broken.
    existing = Path(path).resolve()
    while not existing.exists():
        existing = existing.parent
    if not existing.is_dir():
        existing = existing.parent
    for ancestor in (existing, *existing.parents):
        marker = ancestor / ".git"
        if marker.exists() or marker.is_symlink():
            raise ValueError("Private source files must remain outside every Git worktree")
    environment = {key: value for key, value in os.environ.items() if not key.startswith("GIT_")}
    environment["LC_ALL"] = "C"
    try:
        result = subprocess.run(
            ["git", "-C", str(existing), "rev-parse", "--is-inside-work-tree", "--is-bare-repository"],
            capture_output=True, text=True, check=False, env=environment)
    except OSError as error:
        raise ValueError("Git location checks are unavailable; refusing private source processing") from error
    if result.returncode == 0:
        raise ValueError("Private source files must remain outside every Git repository, including bare repositories")
    if result.returncode != 128 or "not a git repository" not in result.stderr:
        raise ValueError("Could not establish that private source files are outside Git")


def private_write(path, data):
    if path.is_symlink():
        raise ValueError("Refusing symlink output")
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "wb") as f:
        f.write(data)
    os.chmod(path, 0o600)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--bible-zip", type=Path, required=True)
    ap.add_argument("--dhammapada-text", type=Path, required=True)
    ap.add_argument("--bible-sha256", required=True)
    ap.add_argument("--dhammapada-sha256", required=True)
    ap.add_argument("--dhammapada-retrieval-receipt", type=Path)
    ap.add_argument("--output-dir", type=Path, required=True)
    ap.add_argument("--checked-on", required=True)
    args = ap.parse_args()
    if date.fromisoformat(args.checked_on).isoformat() != args.checked_on:
        raise ValueError("Use an exact YYYY-MM-DD checked-on date")
    for path, expected in ((args.bible_zip, args.bible_sha256), (args.dhammapada_text, args.dhammapada_sha256)):
        outside_git(path)
        if not re.fullmatch(r"[a-f0-9]{64}", expected) or sha(path.read_bytes()) != expected:
            raise ValueError(f"Pinned input digest mismatch: {path.name}")
    output = args.output_dir.resolve()
    outside_git(output)
    output.mkdir(parents=True, exist_ok=True, mode=0o700)
    works, bible_receipt, ancillary = bible(args.bible_zip, args.checked_on)
    dhamma_work, dhamma_receipt = dhammapada(args.dhammapada_text, args.checked_on)
    works.append(dhamma_work)
    works.append({"id": "tibetan-84000-reading-room", "tradition": "tibetan-buddhist",
                  "title": "84000 Tibetan Buddhist reading room", "language": "English",
                  "edition": "External source reference; no hosted translation",
                  "source": {"url": "https://84000.co/", "rights": "link-only",
                             "attribution": "84000: Translating the Words of the Buddha. No source text imported.",
                             "checkedOn": args.checked_on, "permissionRef": "NO_TEXT_IMPORTED_LINK_ONLY"},
                  "paragraphs": ["This entry opens the publisher's reading room. No text or translation has been imported into this library."]})
    payload = {"schema": "glp.private-collection.v1", "title": "Private comparative reading collection",
               "editionId": "web-classic-dhammapada-20261127", "works": works}
    encoded = (json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8")
    if len(encoded) > MAX_BYTES or len(works) > 200 or sum(len(w["paragraphs"]) for w in works) > 100000:
        raise ValueError("Payload schema size limit exceeded")
    for work in works:
        if len(work["paragraphs"]) > 10000 or any(not p.strip() or len(p) > 100000 for p in work["paragraphs"]):
            raise ValueError("Paragraph schema limit exceeded")
    # Validation is repeated against JSON-decoded output, not just builder objects.
    written = json.loads(encoded)
    if written != payload:
        raise ValueError("Serialization round trip mismatch")
    bible_receipt.update({"archiveName": args.bible_zip.name, "archiveBytes": args.bible_zip.stat().st_size,
                          "archiveSha256": args.bible_sha256, "sourceLandingPage": "https://ebible.org/eng-web/"})
    receipt = {"schema": "glp.private-source-receipt.v1", "checkedOn": args.checked_on, "payloadFile": "collection.json",
               "payloadBytes": len(encoded), "payloadSha256": sha(encoded), "works": len(works),
               "paragraphs": sum(len(w["paragraphs"]) for w in works), "bible": bible_receipt, "dhammapada": dhamma_receipt,
               "privacy": "Plaintext build input only, outside Git, not published or encrypted. No password created.",
               "omissions": "No canonical text omitted from either selected source. No Bible audio/maps imported. The selected publisher editions already omit the ancillary material disclosed in their notices."}
    if args.dhammapada_retrieval_receipt:
        outside_git(args.dhammapada_retrieval_receipt)
        retrieval = json.loads(args.dhammapada_retrieval_receipt.read_bytes())
        if retrieval.get("sha256") != args.dhammapada_sha256:
            raise ValueError("Retrieval receipt does not match the pinned Dhammapada file")
        receipt["dhammapada"]["retrieval"] = retrieval
    receipt["tibetan"] = {"id": "tibetan-84000-reading-room", "url": "https://84000.co/",
                          "rights": "link-only", "sourceTextImported": False}
    for name, data in ancillary.items():
        private_write(output / ("web-original-" + name), data)
    private_write(output / "collection.json", encoded)
    private_write(output / "source-receipt.json", (json.dumps(receipt, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
    print(json.dumps({k: receipt[k] for k in ("payloadFile", "payloadBytes", "payloadSha256", "works", "paragraphs")}, indent=2))
    print(json.dumps({"bibleBooks": bible_receipt["bookCount"], "bibleChapters": bible_receipt["chapterCount"],
                      "dhammapadaChapters": dhamma_receipt["chapterCount"], "dhammapadaVerseNumbers": dhamma_receipt["verseNumbers"]}))


if __name__ == "__main__":
    main()
