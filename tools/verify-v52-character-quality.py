#!/usr/bin/env python3
"""Evidence-based QA for V5.3 progression, animation separation, and colors."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image


EXPECTED_FRAMES = {"static": 1, "idle": 4, "walk-left": 6, "walk-right": 6, "attack": 5, "heal": 5, "hurt": 4, "happy": 6, "celebrate": 8}
TIERS = ("starter", "level-05", "level-10", "level-15", "level-20")
SKINS = ("light", "medium", "deep")
HAIRS = ("dark", "brown", "silver")
HIDDEN_HAIR_IDS = {
    "warrior-dawnscale-level-10",
    "warrior-dawnscale-level-15",
    "warrior-dawnscale-level-20",
    "warrior-eclipse-level-05",
    "warrior-eclipse-level-10",
    "warrior-eclipse-level-15",
    "warrior-eclipse-level-20",
}


def frames(path: Path) -> list[np.ndarray]:
    result = []
    with Image.open(path) as image:
        for index in range(getattr(image, "n_frames", 1)):
            image.seek(index)
            result.append(np.asarray(image.convert("RGBA"), dtype=np.uint8))
    return result


def digest(images: list[np.ndarray]) -> str:
    value = hashlib.sha256()
    for image in images:
        value.update(image.tobytes())
    return value.hexdigest()


def progression_distance(left: Path, right: Path) -> float:
    def sample(path: Path) -> np.ndarray:
        with Image.open(path) as image:
            rgba = image.convert("RGBA").resize((64, 64), Image.Resampling.LANCZOS)
        data = np.asarray(rgba, dtype=np.float32) / 255
        alpha = data[:, :, 3:4]
        return data[:, :, :3] * alpha + np.array([.035, .025, .09], dtype=np.float32) * (1 - alpha)
    return float(np.mean(np.abs(sample(left) - sample(right))))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("repo", type=Path)
    args = parser.parse_args()
    repo = args.repo.resolve()
    base_root = repo / "assets" / "rpg" / "v5"
    appearance_root = repo / "assets" / "rpg" / "v5-appearance"
    catalog = json.loads((base_root / "catalog.json").read_text(encoding="utf-8"))
    failures: list[str] = []
    checked_base = checked_layers = checked_wrappers = progression_pairs = 0

    if catalog.get("schemaVersion") != 2:
        failures.append(f"Catalog schema is {catalog.get('schemaVersion')}, expected 2.")
    if len(catalog.get("characters", [])) != 80:
        failures.append(f"Catalog has {len(catalog.get('characters', []))} characters, expected 80.")
    if catalog.get("productionAssetCount") != 640:
        failures.append(f"Catalog has {catalog.get('productionAssetCount')} base assets, expected 640.")
    if catalog.get("appearance", {}).get("wrapperAssetCount") != 0:
        failures.append("Catalog still reports obsolete SVG appearance wrappers.")

    by_family: dict[tuple[str, str], dict[str, Path]] = {}
    for character in catalog.get("characters", []):
        class_id, char_id = character["classId"], character["id"]
        char_dir = base_root / class_id / char_id
        action = "heal" if class_id == "healer" else "attack"
        state_hashes = {}
        for state in ("static", "idle", "walk-left", "walk-right", action, "hurt", "happy", "celebrate"):
            base_path = char_dir / f"{state}.webp"
            if not base_path.exists():
                failures.append(f"Missing base: {base_path}")
                continue
            image_frames = frames(base_path)
            checked_base += 1
            if len(image_frames) != EXPECTED_FRAMES[state]:
                failures.append(f"{char_id}/{state} has {len(image_frames)} frames, expected {EXPECTED_FRAMES[state]}.")
            for index, frame in enumerate(image_frames):
                if frame.shape[:2] != (320, 320):
                    failures.append(f"{char_id}/{state}/{index} is not 320x320.")
                alpha = frame[:, :, 3]
                edge = np.concatenate((alpha[:2, :].ravel(), alpha[-2:, :].ravel(), alpha[:, :2].ravel(), alpha[:, -2:].ravel()))
                if np.count_nonzero(edge > 8):
                    failures.append(f"{char_id}/{state}/{index} touches the canvas edge and can clip.")
            state_hashes[state] = digest(image_frames)
            for layer in ("skin", "hair"):
                layer_path = appearance_root / "layers" / class_id / char_id / f"{state}-{layer}.webp"
                if not layer_path.exists():
                    failures.append(f"Missing {layer} layer: {layer_path}")
                    continue
                layer_frames = frames(layer_path)
                checked_layers += 1
                hidden_hair = layer == "hair" and char_id in HIDDEN_HAIR_IDS
                if len(layer_frames) != len(image_frames) and not (hidden_hair and len(layer_frames) == 1):
                    failures.append(f"{char_id}/{state}-{layer} frame count does not match the base.")
                layer_pixels = sum(np.count_nonzero(frame[:, :, 3] > 8) for frame in layer_frames)
                if hidden_hair:
                    if layer_pixels:
                        failures.append(f"{char_id}/{state}-hair tints a fully enclosed helmet.")
                elif layer_pixels < 25:
                    failures.append(f"{char_id}/{state}-{layer} mask is empty or too small.")
                for index, (base_frame, layer_frame) in enumerate(zip(image_frames, layer_frames)):
                    outside = (layer_frame[:, :, 3] > 24) & (base_frame[:, :, 3] <= 2)
                    if np.count_nonzero(outside) > 24:
                        failures.append(f"{char_id}/{state}-{layer}/{index} extends outside the character body.")
        if state_hashes.get("idle") == state_hashes.get("walk-left") or state_hashes.get("idle") == state_hashes.get("walk-right"):
            failures.append(f"{char_id} idle and walk are identical.")
        if state_hashes.get("happy") == state_hashes.get("celebrate"):
            failures.append(f"{char_id} happy and celebrate are identical.")
        by_family.setdefault((class_id, character["family"]), {})[character["tier"]] = char_dir / "static.webp"

    for (class_id, family), tiers in by_family.items():
        for left, right in zip(TIERS, TIERS[1:]):
            if left not in tiers or right not in tiers:
                failures.append(f"Missing progression tier for {class_id}/{family}: {left} or {right}.")
                continue
            distance = progression_distance(tiers[left], tiers[right])
            progression_pairs += 1
            if distance < .018:
                failures.append(f"{class_id}/{family} {left}->{right} is not visually progressive enough ({distance:.4f}).")

    nightwyrm = base_root / "warrior" / "warrior-nightwyrm-level-20"
    if digest(frames(nightwyrm / "happy.webp")) == digest(frames(nightwyrm / "celebrate.webp")):
        failures.append("Nightwyrm Ascendant Celebrate still duplicates Happy.")

    result = {
        "passed": not failures,
        "characters": len(catalog.get("characters", [])),
        "baseAssetsChecked": checked_base,
        "appearanceLayersChecked": checked_layers,
        "appearanceWrappersChecked": checked_wrappers,
        "progressionPairsChecked": progression_pairs,
        "failures": failures,
    }
    print(json.dumps(result, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
