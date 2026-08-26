# Dragonswood Arcade v1.3 — Easy + Normal Parity Pass

This release intentionally applies the easy and normal/medium **Void Runner** parity items identified after v1.2 while preserving the Arcade reward boundary. Dragon Dash remains on its stable v1.2 gameplay set in this pass.

## Void Runner additions

- Explore campaign expanded from 24 to **48 levels**.
- Explore now uses six named branches: Astral Passage, Frozen Vault, Dark Passage, Current Way, Runic Ruins, and Celestial Ring.
- Branch unlocks use completion prerequisites rather than one strictly linear path.
- Existing v1.2 linear progress migrates into the branch-aware completion model.
- Levels can use **4, 6, 8, 10, 12, or 16 tunnel sides**.
- Levels can use **2, 3, or 4 lanes per wall**.
- Tunnel radius/width varies by level.
- Branch-specific fog, sky, and tunnel palettes added.
- Real paired **ramp-up/ramp-down** tiles added with continuous collision height.
- Five Backtrack stages reverse generated obstacle order.
- Optional per-level challenge goals added: no fragile breaks, limited jumps, and shard collection.
- 11 internal achievements added.
- Eight lightweight story/character encounters added at major route milestones.
- Infinite Mode now builds from named handcrafted chunk patterns: zigzag, ice road, fragile bridge, flow weave, dark beacons, ramp run, gate run, and mixed.
- Infinite tunnel geometry/theme varies between runs.
- 2x and 3x Astral Shards are visually distinct as well as more valuable.

## New dragons

- **Frostwing** — retains steering grip on ice.
- **Lanternwing** — sees low-power tunnels more clearly.
- **Currentwing** — resists side currents and gains more from speed-flow runes.
- **Runewing** — manual gravity rotation with Q/E or touch ability control.
- **Skywing** — airborne dash plus hold-to-glide ability.

These join Mosswing, Starwing, Emberhop, Moondrift, Cloudwing, Goldwing, and Bumblewing for 12 Void Runner dragons total.

## Controls

- Q / E: Runewing gravity rotation.
- Shift / X: Skywing dash; hold to glide.
- Touchscreen ability rune appears only for dragons that use it.

## Cloud/save correction

The v1.2 client contained optional `voidRunnerPlayers` cloud-sync code, but the bundled Firestore rules did not include an owner-write match for that collection. v1.3 adds a strict owner-only progress rule allowing only cells, route progress, runner choice, achievements, challenges, story flags, schema version, and timestamp. No reward/class-point fields are accepted.

## Explicitly unchanged

- Arcade games still do **not** grant Dragonswood Gold, XP, class points, pets, fragments, or other rewards.
- Arcade leaderboard reward eligibility remains the only reward bridge.
- Dragon Dash remains functionally on the stable v1.2 gameplay feature set during this Void Runner parity pass.
