"""Build the Dragonswood reflow payload for the 123-chapter Wonder EPUB."""

from __future__ import annotations

import argparse
import json
import re
import zipfile
from pathlib import Path

from lxml import html


CHAPTER_PATTERN = "OEBPS/Pala_9780375899881_epub_c{number:02d}_r1.htm"
TARGET_WORDS = 175
MAX_WORDS = 210
TITLE_OVERRIDES = {
    22: "Wake Me Up When September Ends",
    35: "August Through the Peephole",
    70: "Why I Didn't Sit with August the First Day of School",
    76: "Our Town",
}


def normalize(text: str) -> str:
    return " ".join(text.replace("\u00a0", " ").split())


def split_sentences(text: str) -> list[str]:
    pieces = re.split(r"(?<=[.!?])\s+(?=[\"'\u201c\u2018A-Z0-9])", text)
    return [normalize(piece) for piece in pieces if normalize(piece)]


def split_long_piece(text: str, limit: int = MAX_WORDS) -> list[str]:
    words = text.split()
    return [" ".join(words[index:index + limit]) for index in range(0, len(words), limit)]


def paginate(paragraphs: list[str]) -> list[list[str]]:
    units: list[str] = []
    for paragraph in paragraphs:
        for sentence in split_sentences(paragraph):
            units.extend(split_long_piece(sentence))

    pages: list[list[str]] = []
    current: list[str] = []
    current_words = 0
    for unit in units:
        unit_words = len(unit.split())
        if current and current_words + unit_words > TARGET_WORDS:
            pages.append(current)
            current = []
            current_words = 0
        current.append(unit)
        current_words += unit_words
    if current:
        pages.append(current)
    return pages or [[""]]


def chapter_pov(number: int) -> str:
    if number <= 31:
        return "August"
    if number <= 47:
        return "Via"
    if number <= 53:
        return "Summer"
    if number <= 73:
        return "Jack"
    if number <= 81:
        return "Justin"
    if number <= 92:
        return "August"
    if number <= 98:
        return "Miranda"
    return "August"


def build(epub_path: Path) -> dict:
    chapters: list[dict] = []
    pages: list[dict] = []
    with zipfile.ZipFile(epub_path) as archive:
        for chapter_number in range(1, 124):
            document = html.fromstring(archive.read(CHAPTER_PATTERN.format(number=chapter_number)))
            title_nodes = document.xpath("//h1[contains(@class, 'chapter')]") or document.xpath("//h1")
            title = TITLE_OVERRIDES.get(chapter_number, normalize(title_nodes[0].text_content()))
            paragraphs = [normalize(node.text_content()) for node in document.xpath("//body//p")]
            paragraphs = [paragraph for paragraph in paragraphs if paragraph]
            chapter_pages = paginate(paragraphs)
            start_page = len(pages) + 1
            for chapter_page, blocks in enumerate(chapter_pages, start=1):
                page_number = len(pages) + 1
                page_text = " ".join(blocks)
                pages.append({
                    "number": page_number,
                    "chapterNumber": chapter_number,
                    "chapterTitle": title,
                    "chapterPage": chapter_page,
                    "pov": chapter_pov(chapter_number),
                    "blocks": [{"kind": "body", "text": page_text}],
                    "text": page_text,
                })
            chapters.append({
                "id": f"wonder-chapter-{chapter_number}",
                "number": chapter_number,
                "title": title,
                "pov": chapter_pov(chapter_number),
                "startPage": start_page,
                "endPage": len(pages),
                "testId": f"wonder-chapter-{chapter_number}",
            })
    return {
        "schemaVersion": 1,
        "id": "wonder",
        "title": "Wonder",
        "author": "R. J. Palacio",
        "sourceFormat": "EPUB",
        "chapters": chapters,
        "illustrations": [],
        "pages": pages,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("epub", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()
    payload = build(args.epub)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / "book.json").write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    meta = {
        "schemaVersion": payload["schemaVersion"],
        "pages": len(payload["pages"]),
        "chapters": payload["chapters"],
    }
    (args.output_dir / "meta.js").write_text(
        "export const WONDER_META = " + json.dumps(meta, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(json.dumps({"chapters": len(payload["chapters"]), "pages": len(payload["pages"])}))


if __name__ == "__main__":
    main()
