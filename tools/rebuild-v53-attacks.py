#!/usr/bin/env python3
"""Regenerate only V5.3 class action assets and refresh catalog hashes."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
from pathlib import Path

from PIL import Image


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("repo", type=Path)
    parser.add_argument("prepared", type=Path)
    args = parser.parse_args()
    repo, prepared = args.repo.resolve(), args.prepared.resolve()
    builder_path = repo / "tools" / "build-v52-character-system.py"
    spec = importlib.util.spec_from_file_location("v53_builder", builder_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {builder_path}")
    builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)

    catalog_path = repo / "assets" / "rpg" / "v5" / "catalog.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    catalog_rows = {row["id"]: row for row in catalog["characters"]}
    generated = 0
    for class_id, families in builder.FAMILIES.items():
        for family, (_, _, affinity, _) in families.items():
            action_name = "heal" if class_id == "healer" else "attack"
            for tier_id, _, _, _ in builder.TIERS:
                char_id = f"{class_id}-{family}-{tier_id}"
                base = Image.open(prepared / class_id / family / f"{tier_id}.png").convert("RGBA")
                seed = int(hashlib.sha1(char_id.encode()).hexdigest()[:8], 16)
                frames, durations = builder.render_state(base, None, "attack", class_id, affinity, seed)
                target = repo / "assets" / "rpg" / "v5" / class_id / char_id / f"{action_name}.webp"
                builder.save_webp(target, frames, durations, quality=82)
                row = catalog_rows[char_id]["files"][action_name]
                row["bytes"] = target.stat().st_size
                row["sha256"] = builder.sha256(target)
                generated += 1

    catalog_path.write_text(json.dumps(catalog, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({"actionAssets": generated, "catalog": str(catalog_path)}, indent=2))


if __name__ == "__main__":
    main()
