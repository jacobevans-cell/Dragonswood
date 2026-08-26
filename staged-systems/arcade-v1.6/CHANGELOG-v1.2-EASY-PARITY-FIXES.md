# Dragonswood Arcade v1.2 — Easy Parity Fixes

This release deliberately adds only contained, low-risk gameplay parity improvements. It does not change Arcade reward rules, Firestore reward authority, the core 8-sided Void Runner tunnel geometry, or Dragon Dash collision shapes.

## Dragon Dash

- Exposed Pink Orb in the editor.
- Exposed Green Orb in the editor.
- Exposed Pink Pad in the editor.
- Added Red Orb and Red Pad for stronger jumps.
- Added Black Orb for a strong downward impulse.
- Added a fifth `fastest` speed tier and editor portal.
- Added the new interactions to stock levels so they can be encountered without using the editor.
- Kept the dragon-cube hitbox unchanged.

## Void Runner

- Fragile rune panels can now generate in connected clusters.
- Breaking a fragile panel can trigger a staggered chain collapse through connected fragile neighbors.
- Added Ice rune panels: faster forward momentum with reduced steering grip.
- Added Fast, Slow, Left-current, and Right-current rune panels.
- Level 5 `THIN ICE` now deliberately teaches the ice mechanic.
- Added later Low-Power sections with dim/flickering panels, glow-route clues, and sparser music.
- Added first-encounter toasts and expanded How To Play instructions for special panels.
- Added CLOUDWING: fragile panels do not collapse under it.
- Added GOLDWING: attracts nearby Astral Shards from adjacent lanes/segments.
- Added BUMBLEWING: automatically hops after landing.
- Added SVG character cards for all three new dragons.
- Infinite Mode now increases Astral Shard frequency deeper in a run and supports shard values up to 3.

## Architecture preserved

- Games still report performance only.
- Games still cannot award Dragonswood Gold, XP, pets, fragments, or class points.
- Arcade leaderboard/reward eligibility remains separate and teacher-controlled.
- Existing leaderboard IDs and score bridges are unchanged.
