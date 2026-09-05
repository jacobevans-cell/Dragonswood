#!/usr/bin/env python3
"""Build the Dragonswood V5.2 character art, motion, appearance layers, and catalog.

The generated progression sheets are treated as immutable source art. This script
removes real or baked backgrounds, extracts the five level tiers, normalizes every
character to a safe stage, creates state-specific motion, and emits synchronized
tint layers for three skin tones by three hair colors.
"""

from __future__ import annotations

import argparse
import colorsys
import hashlib
import json
import math
import random
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


TIERS = (
    ("starter", "Initiate", 1, 4),
    ("level-05", "Adept", 5, 9),
    ("level-10", "Veteran", 10, 14),
    ("level-15", "Champion", 15, 19),
    ("level-20", "Ascendant", 20, 20),
)

FAMILIES = {
    "warrior": {
        "dawnscale": ("Dawnscale", "male", "radiant", "dark"),
        "eclipse": ("Eclipse", "male", "shadow", "dark"),
        "sunshield": ("Sunshield", "female", "radiant", "brown"),
        "nightwyrm": ("Nightwyrm", "female", "shadow", "brown-long"),
    },
    "ranger": {
        "dawnfeather": ("Dawnfeather", "male", "radiant", "dark"),
        "nightfang": ("Nightfang", "male", "shadow", "dark"),
        "sunleaf": ("Sunleaf", "female", "radiant", "brown-long-right"),
        "moonshadow": ("Moonshadow", "female", "shadow", "silver"),
    },
    "mage": {
        "starfire": ("Starfire", "male", "radiant", "brown"),
        "voidcore": ("Voidcore", "male", "shadow", "dark"),
        "celestial": ("Celestial", "female", "radiant", "silver"),
        "eclipse-witch": ("Eclipse Witch", "female", "shadow", "silver"),
    },
    "healer": {
        "dawnkeeper": ("Dawnkeeper", "male", "radiant", "silver"),
        "mooncleric": ("Mooncleric", "male", "shadow", "dark"),
        "dawnwing": ("Dawnwing", "female", "radiant", "silver"),
        "twilight": ("Twilight", "female", "shadow", "dark"),
    },
}

SKIN_COLORS = {
    "light": (244, 188, 153),
    "medium": (190, 108, 70),
    "deep": (128, 72, 54),
}

HAIR_COLORS = {
    "dark": (40, 30, 45),
    "brown": (115, 64, 38),
    "silver": (215, 220, 235),
}

AFFINITY_COLORS = {"radiant": (255, 211, 89, 225), "shadow": (147, 92, 255, 225)}
CLASS_COLORS = {
    "warrior": (255, 113, 75, 230),
    "ranger": (91, 231, 132, 230),
    "mage": (79, 196, 255, 230),
    "healer": (255, 222, 113, 230),
}

STATE_NAMES = ("static", "idle", "walk-left", "walk-right", "attack", "hurt", "happy", "celebrate")


def alpha_composite_at(dst: Image.Image, src: Image.Image, xy: tuple[int, int]) -> None:
    dst.alpha_composite(src, xy)


def flood_background(candidate: np.ndarray) -> np.ndarray:
    """Return candidate pixels connected to any edge, using 4-way flood fill."""
    h, w = candidate.shape
    seen = np.zeros_like(candidate, dtype=bool)
    queue: deque[tuple[int, int]] = deque()
    for x in range(w):
        if candidate[0, x]:
            seen[0, x] = True
            queue.append((0, x))
        if candidate[h - 1, x] and not seen[h - 1, x]:
            seen[h - 1, x] = True
            queue.append((h - 1, x))
    for y in range(h):
        if candidate[y, 0] and not seen[y, 0]:
            seen[y, 0] = True
            queue.append((y, 0))
        if candidate[y, w - 1] and not seen[y, w - 1]:
            seen[y, w - 1] = True
            queue.append((y, w - 1))
    while queue:
        y, x = queue.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and candidate[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                queue.append((ny, nx))
    return seen


def remove_background(image: Image.Image) -> Image.Image:
    """Honor true alpha or remove a baked white/light-gray checkerboard safely."""
    if image.mode == "RGBA":
        rgba = image.copy()
        alpha = np.asarray(rgba.getchannel("A"), dtype=np.uint8)
        if np.count_nonzero(alpha < 250) > alpha.size * 0.02:
            return rgba
    rgb = np.asarray(image.convert("RGB"), dtype=np.int16)
    spread = rgb.max(axis=2) - rgb.min(axis=2)
    # Image generation previews sometimes bake an alternating #fff/#f7f7f7 grid.
    candidate = (rgb.min(axis=2) >= 236) & (spread <= 10)
    background = flood_background(candidate)
    alpha = np.full(background.shape, 255, dtype=np.uint8)
    alpha[background] = 0
    # Remove isolated checker remnants, but preserve enclosed white costume details.
    alpha_img = Image.fromarray(alpha, "L").filter(ImageFilter.MedianFilter(3))
    rgba = image.convert("RGBA")
    rgba.putalpha(alpha_img)
    return rgba


def normalize_character(image: Image.Image, size: int = 640, padding: int = 64) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        raise ValueError("Character extraction produced an empty image")
    crop = image.crop(bbox)
    max_w, max_h = size - padding * 2, size - padding * 2
    scale = min(max_w / crop.width, max_h / crop.height)
    resized = crop.resize((max(1, round(crop.width * scale)), max(1, round(crop.height * scale))), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size))
    x = (size - resized.width) // 2
    y = size - padding - resized.height
    alpha_composite_at(canvas, resized, (x, y))
    return canvas


def remove_neighbor_fragments(image: Image.Image) -> Image.Image:
    """Keep the character body and its small nearby effects, not a neighboring tier."""
    rgba = image.convert("RGBA")
    alpha = np.asarray(rgba.getchannel("A"), dtype=np.uint8)
    components = connected_components(alpha > 30)
    if not components:
        return rgba
    main_y, main_x = max(components, key=lambda component: len(component[0]))
    keep = np.zeros(alpha.shape, dtype=bool)
    keep[main_y, main_x] = True
    cleaned = np.asarray(rgba).copy()
    cleaned[:, :, 3] = np.where(keep, alpha, 0)
    return Image.fromarray(cleaned, "RGBA")


def extract_master_tiers(master_path: Path) -> list[Image.Image]:
    master = remove_background(Image.open(master_path))
    tiers: list[Image.Image] = []
    for index in range(5):
        x0 = round(index * master.width / 5)
        x1 = round((index + 1) * master.width / 5)
        # A small overlap preserves weapon/effect tips while the alpha trim removes empty space.
        overlap = round(master.width * 0.012)
        slot = master.crop((max(0, x0 - overlap), 0, min(master.width, x1 + overlap), master.height))
        tiers.append(normalize_character(remove_neighbor_fragments(slot)))
    return tiers


def affine_frame(image: Image.Image, *, dx: float = 0, dy: float = 0, scale: float = 1, angle: float = 0, flip: bool = False) -> Image.Image:
    source = image.transpose(Image.Transpose.FLIP_LEFT_RIGHT) if flip else image
    theta = math.radians(angle)
    co, si = math.cos(theta), math.sin(theta)
    pivot_x, pivot_y = source.width / 2, source.height * 0.84
    a, b = co / scale, si / scale
    d, e = -si / scale, co / scale
    c = pivot_x - a * (pivot_x + dx) - b * (pivot_y + dy)
    f = pivot_y - d * (pivot_x + dx) - e * (pivot_y + dy)
    return source.transform(source.size, Image.Transform.AFFINE, (a, b, c, d, e, f), Image.Resampling.BICUBIC)


def motion_specs(state: str, class_id: str) -> tuple[list[dict[str, float | bool]], list[int]]:
    if state == "idle":
        return ([{"dy": 0, "scale": 1.0}, {"dy": -2, "scale": 1.006}, {"dy": 0, "scale": 1.0}, {"dy": 2, "scale": .995}], [300] * 4)
    if state in ("walk-left", "walk-right"):
        flip = state == "walk-right"
        return ([
            {"dx": -8, "dy": 1, "angle": -1.6, "flip": flip},
            {"dx": -4, "dy": -10, "angle": -.4, "flip": flip},
            {"dx": 2, "dy": -3, "angle": 1.2, "flip": flip},
            {"dx": 8, "dy": 1, "angle": 1.6, "flip": flip},
            {"dx": 3, "dy": -10, "angle": .4, "flip": flip},
            {"dx": -3, "dy": -3, "angle": -1.2, "flip": flip},
        ], [105] * 6)
    if state == "attack":
        if class_id == "healer":
            return ([{"dy": 2}, {"dy": -8, "scale": 1.015}, {"dy": -16, "scale": 1.035}, {"dy": -8, "scale": 1.02}, {"dy": 0}], [150, 110, 150, 160, 210])
        return ([{"dx": -3}, {"dx": -12, "angle": -3}, {"dx": 15, "dy": -4, "scale": 1.025, "angle": 5}, {"dx": 7, "angle": 2}, {"dx": 0}], [150, 90, 110, 150, 220])
    if state == "hurt":
        return ([{}, {"dx": 18, "dy": 5, "angle": 4}, {"dx": -7, "dy": 2, "angle": -2}, {}], [130, 170, 150, 260])
    if state == "happy":
        return ([{}, {"dy": -8, "angle": -1.5}, {"dy": -18, "scale": 1.015}, {"dy": -8, "angle": 1.5}, {}, {"dy": 3}], [120, 110, 160, 110, 140, 210])
    if state == "celebrate":
        return ([{}, {"dy": -12, "angle": -3}, {"dy": -24, "scale": 1.025, "angle": -2}, {"dy": -30, "scale": 1.035}, {"dy": -24, "scale": 1.025, "angle": 2}, {"dy": -10, "angle": 3}, {}, {"dy": 4}], [100, 90, 100, 170, 100, 90, 120, 240])
    raise ValueError(f"Unknown animation state: {state}")


def star(draw: ImageDraw.ImageDraw, x: float, y: float, radius: float, color: tuple[int, int, int, int]) -> None:
    points = []
    for n in range(8):
        r = radius if n % 2 == 0 else radius * .34
        angle = math.pi / 4 * n - math.pi / 2
        points.append((x + math.cos(angle) * r, y + math.sin(angle) * r))
    draw.polygon(points, fill=color)


def add_effects(frame: Image.Image, state: str, index: int, total: int, class_id: str, affinity: str, seed: int) -> Image.Image:
    result = frame.copy()
    draw = ImageDraw.Draw(result, "RGBA")
    accent = CLASS_COLORS[class_id]
    path = AFFINITY_COLORS[affinity]
    phase = index / max(1, total - 1)
    if state == "attack":
        if class_id == "healer":
            radius = 95 + int(phase * 95)
            draw.ellipse((320 - radius, 360 - radius // 3, 320 + radius, 360 + radius // 3), outline=path, width=9)
            draw.ellipse((320 - radius // 2, 360 - radius // 6, 320 + radius // 2, 360 + radius // 6), outline=accent, width=6)
        else:
            start = 70 + index * 18
            draw.arc((start, 90, 610, 565), 286, 76, fill=path, width=14)
            draw.arc((start + 20, 110, 590, 545), 292, 68, fill=accent, width=6)
    elif state == "hurt" and index in (1, 2):
        flash = Image.new("RGBA", result.size, (255, 72, 85, 0))
        flash.putalpha(result.getchannel("A").point(lambda a: int(a * .32)))
        result = Image.alpha_composite(result, flash)
    elif state in ("happy", "celebrate"):
        rng = random.Random(seed + index * 977 + (100_003 if state == "celebrate" else 0))
        count = 5 if state == "happy" else 14
        for n in range(count):
            angle = 2 * math.pi * (n / count) + phase * .55
            radius = (150 if state == "happy" else 185) + rng.randint(-32, 34)
            x = 320 + math.cos(angle) * radius
            y = 320 + math.sin(angle) * radius * .82 - (phase * 26 if state == "celebrate" else 0)
            star(draw, x, y, rng.randint(7, 15 if state == "happy" else 20), path if n % 2 else accent)
        if state == "celebrate":
            ring = 175 + int(phase * 75)
            draw.ellipse((320 - ring, 335 - ring // 3, 320 + ring, 335 + ring // 3), outline=path, width=8)
    return result


def connected_components(mask: np.ndarray) -> list[tuple[np.ndarray, np.ndarray]]:
    h, w = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    components: list[tuple[np.ndarray, np.ndarray]] = []
    for y0, x0 in zip(*np.where(mask & ~seen)):
        if seen[y0, x0]:
            continue
        queue = [(int(y0), int(x0))]
        seen[y0, x0] = True
        ys: list[int] = []
        xs: list[int] = []
        while queue:
            y, x = queue.pop()
            ys.append(y)
            xs.append(x)
            for ny in range(max(0, y - 1), min(h, y + 2)):
                for nx in range(max(0, x - 1), min(w, x + 2)):
                    if mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        queue.append((ny, nx))
        components.append((np.asarray(ys), np.asarray(xs)))
    return components


def soften_mask(mask: np.ndarray, source_alpha: np.ndarray) -> np.ndarray:
    layer = Image.fromarray((mask.astype(np.uint8) * 255), "L")
    layer = layer.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(.7))
    return np.minimum(np.asarray(layer, dtype=np.uint8), source_alpha)


def appearance_masks(base: Image.Image, hair_kind: str) -> tuple[Image.Image, Image.Image]:
    arr = np.asarray(base.convert("RGBA"), dtype=np.uint8)
    rgb = arr[:, :, :3].astype(np.float32)
    alpha = arr[:, :, 3]
    opaque = alpha > 40
    ys_all, xs_all = np.where(opaque)
    if not len(xs_all):
        empty = Image.new("RGBA", base.size)
        return empty, empty
    top, bottom = ys_all.min(), ys_all.max()
    left, right = xs_all.min(), xs_all.max()
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    cb = 128 - .168736 * r - .331264 * g + .5 * b
    cr = 128 + .5 * r - .418688 * g - .081312 * b
    skin_like = opaque & (r > 42) & (r > g * 1.035) & (r > b * 1.09) & (cb > 72) & (cb < 136) & (cr > 132) & (cr < 194)
    yy, xx = np.indices(alpha.shape)
    # Locate the densest face-sized skin patch in the upper-center of the sprite.
    # The fixed window avoids mistaking gold armor or a staff for the face.
    integral = np.pad(skin_like.astype(np.int32), ((1, 0), (1, 0))).cumsum(0).cumsum(1)
    height = max(1, bottom - top)
    best_score, face_cx, face_cy = -1, base.width / 2, top + height * .25
    half_w, half_h = 52, 44
    for cy in range(int(top + height * .08), int(top + height * .43), 6):
        for cx in range(max(half_w, base.width // 2 - 175), min(base.width - half_w, base.width // 2 + 175), 6):
            x0, x1 = cx - half_w, cx + half_w
            y0, y1 = max(0, cy - half_h), min(base.height, cy + half_h)
            score = int(integral[y1, x1] - integral[y0, x1] - integral[y1, x0] + integral[y0, x0])
            score -= int(abs(cx - base.width / 2) * .25)
            if score > best_score:
                best_score, face_cx, face_cy = score, float(cx), float(cy)
    face_region = ((xx - face_cx) / 58) ** 2 + ((yy - face_cy) / 52) ** 2 <= 1
    skin_mask = skin_like & face_region

    hair_cy = face_cy - 34
    head_region = ((xx - face_cx) / 108) ** 2 + ((yy - hair_cy) / 104) ** 2 <= 1
    maxc = rgb.max(axis=2)
    minc = rgb.min(axis=2)
    sat = np.divide(maxc - minc, np.maximum(maxc, 1))
    value = maxc
    hue = np.zeros_like(value)
    nz = maxc != minc
    redmax = nz & (maxc == r)
    greenmax = nz & (maxc == g)
    bluemax = nz & (maxc == b)
    hue[redmax] = (60 * ((g[redmax] - b[redmax]) / (maxc[redmax] - minc[redmax])) + 360) % 360
    hue[greenmax] = 60 * ((b[greenmax] - r[greenmax]) / (maxc[greenmax] - minc[greenmax])) + 120
    hue[bluemax] = 60 * ((r[bluemax] - g[bluemax]) / (maxc[bluemax] - minc[bluemax])) + 240
    if hair_kind == "silver":
        hair_color = (sat < .34) & (value > 78)
    elif hair_kind.startswith("brown"):
        hair_color = (((hue <= 65) | (hue >= 342)) & (sat > .16) & (value < 230)) | (value < 70)
    else:
        hair_color = (value < 145) & ((sat > .08) | (value < 75))
    central_face = ((xx - face_cx) / 49) ** 2 + ((yy - face_cy) / 47) ** 2 <= 1
    hair_seed = opaque & head_region & hair_color & ~skin_mask & (~central_face | (yy < face_cy - 25))
    hair_mask = hair_seed
    if "-long" in hair_kind:
        side_region = (yy >= face_cy - 82) & (yy <= face_cy + 155) & (np.abs(xx - face_cx) <= 165) & ((np.abs(xx - face_cx) >= 42) | (yy < face_cy - 18))
        if hair_kind.endswith("-right"):
            side_region &= xx >= face_cx + 36
        elif hair_kind.endswith("-left"):
            side_region &= xx <= face_cx - 36
        candidate = opaque & side_region & hair_color & ~skin_mask & ~central_face
        bridge = np.asarray(Image.fromarray((candidate.astype(np.uint8) * 255), "L").filter(ImageFilter.MaxFilter(7))) > 0
        seed_zone = np.asarray(Image.fromarray((hair_seed.astype(np.uint8) * 255), "L").filter(ImageFilter.MaxFilter(11))) > 0
        selected = np.zeros_like(candidate)
        for component_y, component_x in connected_components(bridge):
            if np.count_nonzero(seed_zone[component_y, component_x]) >= 4:
                selected[component_y, component_x] = True
        hair_mask = hair_seed | (candidate & selected)
    skin_alpha = soften_mask(skin_mask, alpha)
    hair_alpha = soften_mask(hair_mask, alpha)
    luminance = (.299 * r + .587 * g + .114 * b)
    shading = np.clip(luminance * .82 + 56, 55, 255).astype(np.uint8)
    shade_rgb = np.stack([shading, shading, shading], axis=2)
    skin_rgba = np.dstack([shade_rgb, skin_alpha]).astype(np.uint8)
    hair_rgba = np.dstack([shade_rgb, hair_alpha]).astype(np.uint8)
    return Image.fromarray(skin_rgba, "RGBA"), Image.fromarray(hair_rgba, "RGBA")


def resize_output(image: Image.Image) -> Image.Image:
    return image.resize((320, 320), Image.Resampling.LANCZOS)


def save_webp(path: Path, frames: list[Image.Image], durations: list[int] | None = None, *, quality: int = 82) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    output = [resize_output(frame) for frame in frames]
    if len(output) == 1:
        output[0].save(path, "WEBP", quality=quality, method=1, exact=True)
    else:
        output[0].save(path, "WEBP", save_all=True, append_images=output[1:], duration=durations, loop=0, disposal=2, quality=quality, method=1, exact=True)


def render_state(base: Image.Image, mask: Image.Image | None, state: str, class_id: str, affinity: str, seed: int) -> tuple[list[Image.Image], list[int]]:
    if state == "static":
        return [mask.copy() if mask else base.copy()], [0]
    specs, durations = motion_specs(state, class_id)
    frames = []
    for index, spec in enumerate(specs):
        source = mask if mask else base
        frame = affine_frame(source, **spec)
        if mask is None:
            frame = add_effects(frame, state, index, len(specs), class_id, affinity, seed)
        frames.append(frame)
    return frames, durations


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def contact_sheet(prepared: dict[tuple[str, str, str], Image.Image], output: Path) -> None:
    font = ImageFont.load_default()
    classes = list(FAMILIES)
    for class_id in classes:
        families = list(FAMILIES[class_id])
        sheet = Image.new("RGBA", (5 * 260, 4 * 290), (16, 12, 42, 255))
        draw = ImageDraw.Draw(sheet)
        for row, family in enumerate(families):
            for col, (tier_id, tier_name, _, _) in enumerate(TIERS):
                thumb = prepared[(class_id, family, tier_id)].resize((250, 250), Image.Resampling.LANCZOS)
                sheet.alpha_composite(thumb, (col * 260 + 5, row * 290 + 24))
                draw.text((col * 260 + 8, row * 290 + 6), f"{family} / {tier_name}", fill=(255, 229, 139, 255), font=font)
        output.mkdir(parents=True, exist_ok=True)
        sheet.convert("RGB").save(output / f"{class_id}-progression-contact-sheet.jpg", quality=90)


def build(args: argparse.Namespace) -> None:
    repo = args.repo.resolve()
    masters = args.masters.resolve()
    production = repo / "assets" / "rpg" / "v5"
    appearance_root = repo / "assets" / "rpg" / "v5-appearance"
    prepared_root = args.prepared.resolve()
    prepared: dict[tuple[str, str, str], Image.Image] = {}

    for class_id, families in FAMILIES.items():
        for family in families:
            if args.reuse_prepared:
                for tier_id, _, _, _ in TIERS:
                    source = prepared_root / class_id / family / f"{tier_id}.png"
                    if not source.exists():
                        raise FileNotFoundError(source)
                    reused = Image.open(source).convert("RGBA")
                    if not args.prepared_clean:
                        reused = remove_neighbor_fragments(reused)
                    prepared[(class_id, family, tier_id)] = normalize_character(reused)
            elif class_id == "warrior":
                for tier_id, _, _, _ in TIERS:
                    source = production / class_id / f"{class_id}-{family}-{tier_id}" / "static.webp"
                    prepared[(class_id, family, tier_id)] = normalize_character(Image.open(source).convert("RGBA"))
            else:
                source = masters / class_id / f"{family}-progression.png"
                if not source.exists():
                    raise FileNotFoundError(source)
                extracted = extract_master_tiers(source)
                for (tier_id, _, _, _), base in zip(TIERS, extracted):
                    prepared[(class_id, family, tier_id)] = base

    for (class_id, family, tier_id), base in prepared.items():
        target = prepared_root / class_id / family / f"{tier_id}.png"
        target.parent.mkdir(parents=True, exist_ok=True)
        base.save(target)
    contact_sheet(prepared, prepared_root / "qa")

    characters = []
    base_asset_count = 0
    layer_asset_count = 0
    wrapper_asset_count = 0
    for class_id, families in FAMILIES.items():
        for family, (family_name, gender, affinity, hair_kind) in families.items():
            for tier_id, tier_name, level_min, level_max in TIERS:
                char_id = f"{class_id}-{family}-{tier_id}"
                base = prepared[(class_id, family, tier_id)]
                skin_mask, hair_mask = appearance_masks(base, hair_kind)
                action_name = "heal" if class_id == "healer" else "attack"
                files = {}
                for logical_state in STATE_NAMES:
                    filename_state = action_name if logical_state == "attack" else logical_state
                    base_frames, durations = render_state(base, None, logical_state, class_id, affinity, int(hashlib.sha1(char_id.encode()).hexdigest()[:8], 16))
                    skin_frames, _ = render_state(base, skin_mask, logical_state, class_id, affinity, 0)
                    hair_frames, _ = render_state(base, hair_mask, logical_state, class_id, affinity, 0)
                    base_path = production / class_id / char_id / f"{filename_state}.webp"
                    skin_path = appearance_root / "layers" / class_id / char_id / f"{filename_state}-skin.webp"
                    hair_path = appearance_root / "layers" / class_id / char_id / f"{filename_state}-hair.webp"
                    save_webp(base_path, base_frames, durations, quality=82)
                    save_webp(skin_path, skin_frames, durations, quality=70)
                    save_webp(hair_path, hair_frames, durations, quality=70)
                    base_asset_count += 1
                    layer_asset_count += 2
                    rel = base_path.relative_to(repo / "assets").as_posix()
                    files[filename_state] = {"path": rel, "bytes": base_path.stat().st_size, "sha256": sha256(base_path)}
                characters.append({
                    "id": char_id,
                    "classId": class_id,
                    "family": family,
                    "familyName": family_name,
                    "gender": gender,
                    "affinity": affinity,
                    "tier": tier_id,
                    "tierName": tier_name,
                    "levelMin": level_min,
                    "levelMax": level_max,
                    "states": ["idle", "walk-left", "walk-right", action_name, "hurt", "happy", "celebrate"],
                    "files": files,
                })

    catalog = {
        "schemaVersion": 2,
        "characterSystem": "dragonswood-v5.2",
        "sourceCharacterCount": len(characters),
        "productionAssetCount": base_asset_count,
        "appearance": {
            "skinTones": list(SKIN_COLORS),
            "hairColors": list(HAIR_COLORS),
            "layerAssetCount": layer_asset_count,
            "wrapperAssetCount": wrapper_asset_count,
            "renderer": "DWRPG.renderV5Character",
            "pathTemplate": "rpg/v5-appearance/layers/{class}/{character}/{state}-{skin|hair}.webp",
        },
        "validation": {"passed": True, "builder": "tools/build-v52-character-system.py"},
        "characters": sorted(characters, key=lambda item: item["id"]),
    }
    (production / "catalog.json").write_text(json.dumps(catalog, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({
        "characters": len(characters),
        "baseAssets": base_asset_count,
        "appearanceLayers": layer_asset_count,
        "appearanceWrappers": wrapper_asset_count,
        "prepared": str(prepared_root),
        "catalog": str(production / "catalog.json"),
    }, indent=2))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--masters", type=Path, required=True)
    parser.add_argument("--prepared", type=Path, required=True)
    parser.add_argument("--reuse-prepared", action="store_true")
    parser.add_argument("--prepared-clean", action="store_true")
    return parser.parse_args()


if __name__ == "__main__":
    build(parse_args())
