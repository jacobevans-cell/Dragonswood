"""Build verified chapter boundaries for the classroom Wild Robot Protects PDF edition."""

from __future__ import annotations

import json
import re
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "class-library" / "books" / "wild-robot-3-protects.pdf"
OUTPUT = ROOT / "class-library" / "books" / "wild-robot-3" / "meta.js"
FINAL_STORY_PAGE = 230
CHAPTER_COUNT = 80


def main() -> None:
    reader = PdfReader(SOURCE)
    starts: list[tuple[int, int, str]] = []
    seen: set[int] = set()
    pattern = re.compile(r"CHAPTER\s+(\d+)\s*[\r\n]+([^\r\n]+)", re.IGNORECASE)

    for page_number, page in enumerate(reader.pages, 1):
        text = (page.extract_text() or "").replace("\ufffd", "'")
        match = pattern.search(text)
        if not match:
            continue
        chapter_number = int(match.group(1))
        if chapter_number not in range(1, CHAPTER_COUNT + 1) or chapter_number in seen:
            continue
        seen.add(chapter_number)
        title = " ".join(match.group(2).split()).title()
        starts.append((chapter_number, page_number, title))
        if chapter_number == CHAPTER_COUNT:
            break

    if [number for number, _, _ in starts] != list(range(1, CHAPTER_COUNT + 1)):
        raise RuntimeError(f"Could not find all {CHAPTER_COUNT} Wild Robot Protects chapters in order")

    chapters = []
    for index, (number, start_page, title) in enumerate(starts):
        end_page = starts[index + 1][1] - 1 if index + 1 < len(starts) else FINAL_STORY_PAGE
        chapters.append({
            "id": f"wild-robot-3-chapter-{number}",
            "number": number,
            "title": title,
            "startPage": start_page,
            "endPage": end_page,
            "testId": f"wild-robot-3-chapter-{number}",
        })

    metadata = {
        "schemaVersion": 1,
        "pages": len(reader.pages),
        "storyEndPage": FINAL_STORY_PAGE,
        "chapters": chapters,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        "export const WILD_ROBOT_3_META = "
        + json.dumps(metadata, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(json.dumps({"chapters": len(chapters), "pages": len(reader.pages), "storyEndPage": FINAL_STORY_PAGE}))


if __name__ == "__main__":
    main()
