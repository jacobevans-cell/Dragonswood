#!/usr/bin/env python3
"""Build the production-sized Dragonswood V5 animated character runtime."""

from __future__ import annotations

import argparse
import hashlib
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image


FAMILY_META = {
    "warrior": {
        "dawnscale": ("male", "radiant", "Dawnscale"),
        "sunshield": ("female", "radiant", "Sunshield"),
        "nightwyrm": ("female", "shadow", "Nightwyrm"),
        "eclipse": ("male", "shadow", "Eclipse"),
    },
    "ranger": {
        "dawnfeather": ("male", "radiant", "Dawnfeather"),
        "sunleaf": ("female", "radiant", "Sunleaf"),
        "nightfang": ("male", "shadow", "Nightfang"),
        "moonshadow": ("female", "shadow", "Moonshadow"),
    },
    "mage": {
        "celestial": ("female", "radiant", "Celestial"),
        "starfire": ("male", "radiant", "Starfire"),
        "voidcore": ("male", "shadow", "Voidcore"),
        "eclipse-witch": ("female", "shadow", "Eclipse Witch"),
    },
    "healer": {
        "dawnkeeper": ("male", "radiant", "Dawnkeeper"),
        "dawnwing": ("female", "radiant", "Dawnwing"),
        "mooncleric": ("male", "shadow", "Mooncleric"),
        "twilight": ("female", "shadow", "Twilight"),
    },
}

TIER_META = {
    "starter": (1, 4, "Initiate"),
    "level-05": (5, 9, "Adept"),
    "level-10": (10, 14, "Veteran"),
    "level-15": (15, 19, "Champion"),
    "level-20": (20, 20, "Ascendant"),
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def family_and_tier(character_id: str, class_id: str) -> tuple[str, str]:
    stem = character_id.removeprefix(f"{class_id}-")
    for tier in sorted(TIER_META, key=len, reverse=True):
        suffix = f"-{tier}"
        if stem.endswith(suffix):
            return stem[: -len(suffix)], tier
    raise ValueError(f"Unknown tier in {character_id}")


def make_idle_frames(base: Image.Image, size: int) -> list[Image.Image]:
    """Create a quiet bottom-anchored breathing loop without reusing walk poses."""
    frames = []
    for scale in (1.0, 1.006, 1.01, 1.006):
        scaled_size = max(size, round(size * scale))
        scaled = base.resize((scaled_size, scaled_size), Image.Resampling.LANCZOS)
        frame = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        frame.alpha_composite(scaled, ((size - scaled_size) // 2, size - scaled_size))
        frames.append(frame)
    return frames


def build_character(source_dir: Path, destination_root: Path, size: int) -> dict:
    manifest = json.loads((source_dir / "manifest.json").read_text(encoding="utf-8"))
    character_id = manifest["character_id"]
    class_id = manifest["class"]
    family, tier = family_and_tier(character_id, class_id)
    gender, affinity, family_name = FAMILY_META[class_id][family]
    level_min, level_max, tier_name = TIER_META[tier]
    output_dir = destination_root / class_id / character_id
    output_dir.mkdir(parents=True, exist_ok=True)
    files = {}

    for state in manifest["display_states"]:
        frame_paths = sorted((source_dir / "frames" / state).glob("frame-*.png"))
        frames = [
            Image.open(path).convert("RGBA").resize((size, size), Image.Resampling.LANCZOS)
            for path in frame_paths
        ]
        if len(frames) != 4:
            raise ValueError(f"{character_id}/{state} has {len(frames)} frames")
        output = output_dir / f"{state}.webp"
        frames[0].save(
            output,
            format="WEBP",
            save_all=True,
            append_images=frames[1:],
            duration=manifest["timings_ms"][state],
            loop=0,
            quality=86,
            method=4,
            exact=True,
        )
        files[state] = {
            "path": output.relative_to(destination_root.parent.parent).as_posix(),
            "bytes": output.stat().st_size,
            "sha256": sha256(output),
        }

    static_frame = Image.open(source_dir / "frames" / "walk-right" / "frame-01.png")
    static_frame = static_frame.convert("RGBA").resize((size, size), Image.Resampling.LANCZOS)
    static_output = output_dir / "static.webp"
    static_frame.save(static_output, format="WEBP", quality=90, method=4, exact=True)
    files["static"] = {
        "path": static_output.relative_to(destination_root.parent.parent).as_posix(),
        "bytes": static_output.stat().st_size,
        "sha256": sha256(static_output),
    }

    idle_frames = make_idle_frames(static_frame, size)
    idle_output = output_dir / "idle.webp"
    idle_frames[0].save(
        idle_output,
        format="WEBP",
        save_all=True,
        append_images=idle_frames[1:],
        duration=[500, 350, 500, 350],
        loop=0,
        quality=88,
        method=4,
        exact=True,
    )
    files["idle"] = {
        "path": idle_output.relative_to(destination_root.parent.parent).as_posix(),
        "bytes": idle_output.stat().st_size,
        "sha256": sha256(idle_output),
    }

    return {
        "id": character_id,
        "classId": class_id,
        "family": family,
        "familyName": family_name,
        "gender": gender,
        "affinity": affinity,
        "tier": tier,
        "tierName": tier_name,
        "levelMin": level_min,
        "levelMax": level_max,
        "states": ["idle", *manifest["display_states"]],
        "files": files,
    }


def validate(catalog: list[dict], destination_root: Path, size: int) -> dict:
    failures = []
    animated = 0
    static = 0
    for character in catalog:
        for state, entry in character["files"].items():
            path = destination_root.parent.parent / entry["path"]
            try:
                with Image.open(path) as image:
                    frames = getattr(image, "n_frames", 1)
                    if image.size != (size, size):
                        failures.append(f"{path}: size {image.size}")
                    if state == "static":
                        static += 1
                        if frames != 1:
                            failures.append(f"{path}: expected 1 frame, got {frames}")
                    else:
                        animated += 1
                        if frames != 4:
                            failures.append(f"{path}: expected 4 frames, got {frames}")
            except Exception as error:  # pragma: no cover - validation report path
                failures.append(f"{path}: {error}")
    return {
        "passed": not failures,
        "characters": len(catalog),
        "animatedFiles": animated,
        "staticFiles": static,
        "dimensions": [size, size],
        "failures": failures,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="V5 build root containing runtime/")
    parser.add_argument("destination", type=Path, help="Game assets/rpg/v5 directory")
    parser.add_argument("--size", type=int, default=320)
    parser.add_argument("--workers", type=int, default=4)
    args = parser.parse_args()

    source_runtime = args.source.resolve() / "runtime"
    destination = args.destination.resolve()
    character_dirs = sorted(
        directory
        for class_dir in source_runtime.iterdir()
        if class_dir.is_dir()
        for directory in class_dir.iterdir()
        if directory.is_dir()
    )
    if len(character_dirs) != 80:
        raise SystemExit(f"Expected 80 characters, found {len(character_dirs)}")

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        catalog = list(pool.map(lambda path: build_character(path, destination, args.size), character_dirs))
    catalog.sort(key=lambda row: (row["classId"], row["gender"], row["affinity"], row["levelMin"]))
    report = validate(catalog, destination, args.size)
    payload = {
        "schemaVersion": 1,
        "characterSystem": "dragonswood-v5",
        "sourceCharacterCount": 80,
        "productionAssetCount": report["animatedFiles"] + report["staticFiles"],
        "characters": catalog,
        "validation": report,
    }
    destination.mkdir(parents=True, exist_ok=True)
    (destination / "catalog.json").write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    if not report["passed"]:
        raise SystemExit(json.dumps(report, indent=2))
    total_bytes = sum(entry["bytes"] for row in catalog for entry in row["files"].values())
    print(json.dumps({**report, "totalBytes": total_bytes}, indent=2))


if __name__ == "__main__":
    main()
