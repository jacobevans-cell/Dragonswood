#!/usr/bin/env python3
"""Verify the V5.1 visual contracts that the original file-only QA missed."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image


EXPECTED_FAMILIES = {
    ("warrior", "dawnscale"): ("male", "radiant"),
    ("warrior", "sunshield"): ("female", "radiant"),
    ("warrior", "eclipse"): ("male", "shadow"),
    ("warrior", "nightwyrm"): ("female", "shadow"),
    ("ranger", "dawnfeather"): ("male", "radiant"),
    ("ranger", "sunleaf"): ("female", "radiant"),
    ("ranger", "nightfang"): ("male", "shadow"),
    ("ranger", "moonshadow"): ("female", "shadow"),
    ("mage", "starfire"): ("male", "radiant"),
    ("mage", "celestial"): ("female", "radiant"),
    ("mage", "voidcore"): ("male", "shadow"),
    ("mage", "eclipse-witch"): ("female", "shadow"),
    ("healer", "dawnkeeper"): ("male", "radiant"),
    ("healer", "dawnwing"): ("female", "radiant"),
    ("healer", "mooncleric"): ("male", "shadow"),
    ("healer", "twilight"): ("female", "shadow"),
}


def alpha_mask(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert("RGBA"))[:, :, 3] > 8


def bbox_height(mask: np.ndarray) -> int:
    ys = np.where(mask)[0]
    return int(ys.max() - ys.min() + 1) if len(ys) else 0


def family_from_id(character_id: str, class_id: str, tier: str) -> str:
    return character_id.removeprefix(f"{class_id}-").removesuffix(f"-{tier}")


def animated_masks(path: Path) -> tuple[list[np.ndarray], list[bytes]]:
    masks: list[np.ndarray] = []
    pixels: list[bytes] = []
    with Image.open(path) as image:
        for index in range(getattr(image, "n_frames", 1)):
            image.seek(index)
            rgba = np.asarray(image.convert("RGBA"))
            masks.append(rgba[:, :, 3] > 8)
            pixels.append(rgba.tobytes())
    return masks, pixels


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source_build", type=Path)
    parser.add_argument("--production", type=Path, default=Path("assets/rpg/v5"))
    args = parser.parse_args()
    source_build = args.source_build.resolve()
    production = args.production.resolve()
    failures: list[str] = []

    manifests = sorted(source_build.glob("runtime/*/*/manifest.json"))
    if len(manifests) != 80:
        failures.append(f"Expected 80 source manifests, found {len(manifests)}.")

    for manifest_path in manifests:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        happy_cells = [cell for cell in manifest["extraction"]["cells"] if cell["row"] == 4]
        for cell in happy_cells:
            recovered = cell["method"].get("overlap_margin", 0) >= 64
            fallback = cell["method"].get("overlap_fallback") == "strict-cell-clean"
            if not recovered and not fallback:
                failures.append(f"{manifest['character_id']} happy frame {cell['column']} was not overlap-recovered.")
        for state in manifest["display_states"]:
            frame_dir = manifest_path.parent / "frames" / state
            frames = sorted(frame_dir.glob("frame-*.png"))
            if len(frames) != 4:
                failures.append(f"{manifest['character_id']}/{state} has {len(frames)} PNG frames.")
            for frame in frames:
                with Image.open(frame) as image:
                    if image.size != (640, 640) or image.mode != "RGBA":
                        failures.append(f"{frame} is not 640x640 RGBA.")
                    if state == "happy":
                        alpha = np.asarray(image.getchannel("A")) > 8
                        ys = np.where(alpha)[0]
                        if len(ys) and int(ys.min()) < 40:
                            failures.append(f"{frame} has insufficient happy-frame headroom.")

    for tier in ("starter", "level-10", "level-15", "level-20"):
        frame_dir = source_build / "runtime" / "warrior" / f"warrior-dawnscale-{tier}" / "frames" / "walk-left"
        masks = [alpha_mask(path) for path in sorted(frame_dir.glob("frame-*.png"))]
        if len(masks) != 4:
            continue
        def iou(left: np.ndarray, right: np.ndarray) -> float:
            union = np.count_nonzero(left | right)
            return np.count_nonzero(left & right) / union if union else 0.0
        guard_pair = iou(masks[0], masks[2])
        step_pair = iou(masks[1], masks[3])
        pose_change = iou(masks[0], masks[1])
        if guard_pair < 0.74 or step_pair < 0.88:
            failures.append(f"Dawnscale {tier} guarded walk poses are unstable ({guard_pair:.3f}/{step_pair:.3f}).")
        if pose_change > 0.88:
            failures.append(f"Dawnscale {tier} walk still reads as a single-pose idle bob (IoU {pose_change:.3f}).")

    moonshadow_heights = {}
    for tier in ("level-15", "level-20"):
        frame = source_build / "runtime" / "ranger" / f"ranger-moonshadow-{tier}" / "frames" / "walk-left" / "frame-01.png"
        moonshadow_heights[tier] = bbox_height(alpha_mask(frame))
    if moonshadow_heights.get("level-20", 0) < moonshadow_heights.get("level-15", 0) * 0.90:
        failures.append(f"Moonshadow Ascendant still regresses in scale: {moonshadow_heights}.")

    catalog_path = production / "catalog.json"
    if not catalog_path.exists():
        failures.append(f"Missing production catalog: {catalog_path}")
        catalog = {"characters": []}
    else:
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    idle_loops_checked = 0
    for character in catalog.get("characters", []):
        family = character["family"]
        expected = EXPECTED_FAMILIES.get((character["classId"], family))
        actual = (character["gender"], character["affinity"])
        if expected != actual:
            failures.append(f"Gender/affinity mismatch for {character['id']}: expected {expected}, got {actual}.")
        idle_path = production / character["classId"] / character["id"] / "idle.webp"
        if not idle_path.exists():
            failures.append(f"Missing derived idle loop: {idle_path}.")
            continue
        masks, pixels = animated_masks(idle_path)
        idle_loops_checked += 1
        if len(masks) != 4:
            failures.append(f"{character['id']} idle has {len(masks)} frames, expected 4.")
            continue
        if len(set(pixels)) < 3:
            failures.append(f"{character['id']} idle is not visibly animated.")
        base = masks[0]
        for index, mask in enumerate(masks[1:], 2):
            union = np.count_nonzero(base | mask)
            overlap = np.count_nonzero(base & mask)
            iou = overlap / union if union else 0.0
            if iou < 0.90:
                failures.append(f"{character['id']} idle frame {index} moves like a walk pose (IoU {iou:.3f}).")

    result = {
        "passed": not failures,
        "sourceCharacters": len(manifests),
        "happyFramesChecked": len(manifests) * 4,
        "dawnscaleWalkTiersChecked": 4,
        "moonshadowWalkHeights": moonshadow_heights,
        "catalogCharacters": len(catalog.get("characters", [])),
        "idleLoopsChecked": idle_loops_checked,
        "failures": failures,
    }
    print(json.dumps(result, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
