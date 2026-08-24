# Dragonswood Pet Asset Audit — v56.14

## Result

- Source archives inspected: **15**
- Source creatures visually inspected: **68**
- Source creatures imported: **68**
- Rejected after inspection: **0**
- Existing deployed creatures mapped to stable IDs: **8**
- Existing unique companions retained: **8**
- Final distinct Bestiary size: **76**
- Optimized new idle loops: **68**
- Deployed generated pet payload: **about 5.4 MB**
- Missing source packs: **Monster V5 and Monster V9 — awaiting assets**

Every archive passed ZIP integrity checks. Source ZIPs, Illustrator files, EPS files, Spine projects, death effects, and full raw frame families are not deployed.

## Canonical source set

Dedicated Pets folder:

- Monster V1, V2, V3, V4, V6, V7, V8, V10, V11
- Robots V1

Required additional creature archives:

- Land Monster
- Flying Monster
- Bee / Crab / Bird
- Hedgehog / Snail / Turtle
- Boar / Monkey / Mouse / Piranha

The broader Drive folder was also inspected. It contains 99 mixed entries, primarily class skins, humanoid enemies, item icons, duplicate archives, and the nested Pets folder. Those non-pet sources were excluded from this pet-specific import instead of being mislabeled as companions.

## Animation findings

- All 68 imported creatures provide a usable idle or combined move/idle sequence.
- Source animations range from 10–24 idle frames, with additional walk, attack, fly, hurt, jump, sleep, defend, and other actions depending on the pack.
- These packs are single-view side-facing assets; direction count is recorded as 1.
- Source dimensions range from 184×188 to 840×420 and were normalized to a bottom-center 256×256 stage.
- Collection grids load optimized static WebP art.
- Only active/detail pets load a 192×192 animated GIF, avoiding dozens of simultaneous loops.
- Reduced-motion users receive the static art instead of the animation loop.

The complete per-creature source inventory is included as `pet-source-catalog.csv` and `pet-source-catalog.json` in the audit package.

## Identity and migration

The eight previously deployed land/flying companions keep their original IDs:

`mossling`, `embercub`, `riverback`, `thornpup`, `moonwing`, `cloudbeak`, `starflutter`, `stormlet`.

The existing companion IDs `sproutling`, `puffbeak`, `curlshell`, `finnick`, `hootling`, `dragon`, `gargoyle`, and `elemental` are also retained. Existing `ownedPets` and `activePet` data therefore remain valid without a destructive migration.

## Final distribution

Rarity:

- Common: 14
- Uncommon: 16
- Rare: 21
- Epic: 16
- Legendary: 9

The roster spans 23 habitats, including Woodland, Sky, Cavern, Clockwork Reach, Emberlands, Frostlands, Moonlit Sky, Garden, Shore, River, and Arcane Wilds. Legendary companions remain Level 10 prestige discoveries.

## Safety decisions preserved

- One active pet only.
- Every fifth Boss victory creates an egg **chance**, never a guarantee.
- No unlimited Woodland Egg store.
- Hatching does not prioritize missing pets.
- A repeated pet becomes exactly one Pet Token.
- Tokens remain saved and visible but unspendable for now.
- Existing rare real-world pass rewards and teacher redemption remain unchanged.

