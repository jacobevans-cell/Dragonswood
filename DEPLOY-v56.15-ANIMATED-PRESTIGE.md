# Dragonswood v56.15 — Animated Prestige Patch

## Included

- Three animated Level 10 Dragons: Embercrest, Verdantwing, and Amethyst.
- Three animated Level 10 Gargoyles: Ironwing, Goldvein, and Froststone.
- Three animated Level 10 Elementals: Frosttide, Emberheart, and Stonebound.
- Four animated Daily Boss models: Elder Rootwarden, Mossstone Colossus, Boneguard Captain, and Frosthorn Yeti.
- Existing `dragon`, `gargoyle`, and `elemental` ownership IDs are preserved and upgraded in place.
- Six additional prestige companions are added, increasing the Bestiary from 76 to 82.
- Existing approved standard sources remain active: Land Monsters, Flying Monsters, Bee/Crab/Bird, Monster packs 1 and 2, Boar/Monkey/Mouse/Piranha, and Hedgehog/Snail/Turtle.

## Explicit exclusions

- Monster pack V5 is not included.
- Monster pack V9 is not included.
- Raw ZIP, AI, EPS, and full-resolution source frames are not deployed.

## Deployment

Upload the ZIP contents to the GitHub repository root, preserving folders, then commit and push.

No Firebase Firestore Rules update is required. No Firebase Storage upload is required. No R2 upload is required. All optimized assets are served by GitHub Pages with the rest of Dragonswood.

## Verification

1. Hard-refresh the deployed site.
2. Open Adventurer Hall → Pet Sanctuary.
3. Confirm the Bestiary reads 82 total companions.
4. Test an owned Dragon, Gargoyle, or Elemental and confirm its idle loop plays.
5. Enable reduced-motion at the operating-system/browser level and confirm static pet art is used.
6. Open Daily Boss on several test dates/accounts to confirm the four new bosses can rotate into the encounter pool.

