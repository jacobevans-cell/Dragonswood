#!/usr/bin/env python3
"""Render human-review contact sheets for V5.3 appearance and motion."""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


SKINS = {"light": (232, 174, 139), "medium": (176, 103, 70), "deep": (105, 63, 52)}
HAIRS = {"dark": (34, 29, 43), "brown": (91, 55, 38), "silver": (185, 194, 210)}


def read_frame(path: Path, index: int = 0) -> Image.Image:
    image = Image.open(path)
    image.seek(min(index, getattr(image, "n_frames", 1) - 1))
    return image.convert("RGBA")


def tint_layer(layer: Image.Image, color: tuple[int, int, int], kind: str) -> Image.Image:
    data = np.asarray(layer.convert("RGBA"), dtype=np.uint8)
    shade = data[:, :, 0].astype(np.float32) / 255
    factor = .76 + .34 * shade if kind == "skin" else .58 + .50 * shade
    rgb = np.stack([factor * channel for channel in color], axis=2).clip(0, 255).astype(np.uint8)
    return Image.fromarray(np.dstack([rgb, data[:, :, 3]]), "RGBA")


def appearance(repo: Path, class_id: str, char_id: str, state: str, skin: str, hair: str, index: int = 0) -> Image.Image:
    base = read_frame(repo / "assets" / "rpg" / "v5" / class_id / char_id / f"{state}.webp", index)
    layer_root = repo / "assets" / "rpg" / "v5-appearance" / "layers" / class_id / char_id
    base.alpha_composite(tint_layer(read_frame(layer_root / f"{state}-skin.webp", index), SKINS[skin], "skin"))
    base.alpha_composite(tint_layer(read_frame(layer_root / f"{state}-hair.webp", index), HAIRS[hair], "hair"))
    return base


def make_action_appearance_sheet(repo: Path, output: Path, class_id: str, char_id: str) -> None:
    action = "heal" if class_id == "healer" else "attack"
    font = ImageFont.load_default()
    sheet = Image.new("RGBA", (5 * 330, 360), (15, 11, 42, 255))
    draw = ImageDraw.Draw(sheet)
    for index in range(5):
        art = appearance(repo, class_id, char_id, action, "deep", "silver", index)
        sheet.alpha_composite(art, (index * 330 + 5, 26))
        draw.text((index * 330 + 8, 7), f"{action} frame {index} / deep + silver", fill=(255, 228, 130, 255), font=font)
    sheet.convert("RGB").save(output / f"{char_id}-{action}-appearance.jpg", quality=94)


def make_appearance_sheet(repo: Path, output: Path, class_id: str, char_id: str) -> None:
    font = ImageFont.load_default()
    sheet = Image.new("RGBA", (3 * 340, 3 * 360), (15, 11, 42, 255))
    draw = ImageDraw.Draw(sheet)
    for row, skin in enumerate(SKINS):
        for col, hair in enumerate(HAIRS):
            art = appearance(repo, class_id, char_id, "static", skin, hair)
            sheet.alpha_composite(art, (col * 340 + 10, row * 360 + 24))
            draw.text((col * 340 + 10, row * 360 + 7), f"{skin} skin / {hair} hair", fill=(255, 228, 130, 255), font=font)
    sheet.convert("RGB").save(output / f"{char_id}-appearance.jpg", quality=92)


def make_motion_sheet(repo: Path, output: Path, class_id: str, char_id: str) -> None:
    action = "heal" if class_id == "healer" else "attack"
    states = ("idle", "walk-left", "walk-right", action, "happy", "celebrate")
    font = ImageFont.load_default()
    sheet = Image.new("RGBA", (8 * 170, len(states) * 190), (15, 11, 42, 255))
    draw = ImageDraw.Draw(sheet)
    root = repo / "assets" / "rpg" / "v5" / class_id / char_id
    for row, state in enumerate(states):
        with Image.open(root / f"{state}.webp") as image:
            count = getattr(image, "n_frames", 1)
            for col in range(8):
                if col >= count:
                    continue
                image.seek(col)
                frame = image.convert("RGBA").resize((160, 160), Image.Resampling.LANCZOS)
                sheet.alpha_composite(frame, (col * 170 + 5, row * 190 + 24))
            draw.text((7, row * 190 + 7), f"{state} / {count} frames", fill=(255, 228, 130, 255), font=font)
    sheet.convert("RGB").save(output / f"{char_id}-motion.jpg", quality=92)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("repo", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    repo, output = args.repo.resolve(), args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    for class_id, char_id in (
        ("warrior", "warrior-dawnscale-level-15"),
        ("warrior", "warrior-sunshield-level-20"),
        ("ranger", "ranger-sunleaf-starter"),
        ("ranger", "ranger-moonshadow-level-20"),
        ("mage", "mage-celestial-level-15"),
        ("ranger", "ranger-sunleaf-level-20"),
        ("ranger", "ranger-dawnfeather-level-10"),
        ("healer", "healer-dawnkeeper-level-20"),
        ("mage", "mage-starfire-level-20"),
        ("warrior", "warrior-nightwyrm-level-20"),
        ("warrior", "warrior-dawnscale-starter"),
        ("healer", "healer-dawnwing-level-20"),
    ):
        make_appearance_sheet(repo, output, class_id, char_id)
    make_motion_sheet(repo, output, "warrior", "warrior-nightwyrm-level-20")
    make_motion_sheet(repo, output, "warrior", "warrior-dawnscale-starter")
    make_motion_sheet(repo, output, "warrior", "warrior-dawnscale-level-20")
    make_motion_sheet(repo, output, "ranger", "ranger-sunleaf-level-20")
    make_motion_sheet(repo, output, "mage", "mage-starfire-level-20")
    make_motion_sheet(repo, output, "healer", "healer-dawnkeeper-level-20")
    make_action_appearance_sheet(repo, output, "warrior", "warrior-dawnscale-level-20")
    print(output)


if __name__ == "__main__":
    main()
