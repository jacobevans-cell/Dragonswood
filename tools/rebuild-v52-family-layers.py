#!/usr/bin/env python3
"""Regenerate V5.3 skin/hair animation layers for one prepared family."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
from pathlib import Path

from PIL import Image


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("repo", type=Path)
    parser.add_argument("prepared", type=Path)
    parser.add_argument("class_id")
    parser.add_argument("family")
    args = parser.parse_args()

    builder_path = args.repo.resolve() / "tools" / "build-v52-character-system.py"
    spec = importlib.util.spec_from_file_location("v52_builder", builder_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {builder_path}")
    builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)

    family_row = builder.FAMILIES.get(args.class_id, {}).get(args.family)
    if not family_row:
        raise SystemExit(f"Unknown family: {args.class_id}/{args.family}")
    _, _, affinity, hair_kind = family_row
    action_name = "heal" if args.class_id == "healer" else "attack"
    generated = 0
    for tier_id, _, _, _ in builder.TIERS:
        source = args.prepared.resolve() / args.class_id / args.family / f"{tier_id}.png"
        # Prepared sources are already normalized. Normalizing them again makes
        # the appearance layers a different scale from the production base.
        base = Image.open(source).convert("RGBA")
        char_id = f"{args.class_id}-{args.family}-{tier_id}"
        skin_mask, hair_mask = builder.appearance_masks(
            base,
            hair_kind,
            hide_hair=tier_id in builder.HIDDEN_HAIR_TIERS.get((args.class_id, args.family), set()),
            character_id=char_id,
        )
        for logical_state in builder.STATE_NAMES:
            filename_state = action_name if logical_state == "attack" else logical_state
            durations = builder.render_state(base, None, logical_state, args.class_id, affinity, int(hashlib.sha1(char_id.encode()).hexdigest()[:8], 16))[1]
            skin_frames = builder.render_state(base, skin_mask, logical_state, args.class_id, affinity, 0)[0]
            hair_frames = builder.render_state(base, hair_mask, logical_state, args.class_id, affinity, 0)[0]
            layer_root = args.repo.resolve() / "assets" / "rpg" / "v5-appearance" / "layers" / args.class_id / char_id
            builder.save_webp(layer_root / f"{filename_state}-skin.webp", skin_frames, durations, quality=70)
            builder.save_webp(layer_root / f"{filename_state}-hair.webp", hair_frames, durations, quality=70)
            generated += 2
    print(f"Regenerated {generated} layers for {args.class_id}/{args.family}.")


if __name__ == "__main__":
    main()
