# Dragonswood v56.16 — Pet Rarity Rebalance

## What changed

- Individually reviewed all 82 deployed pet sprites.
- Reassigned 34 pets whose former rarity did not match their visual power or toughness.
- Established one consistent five-rarity progression.
- Reserved Legendary for the nine animated Level 10 Dragons, Gargoyles, and Elementals.
- Standardized pet level and total battle bonus by rarity.
- Added a visual field note, passive ability, ability explanation, and rarity basis to every pet.
- Updated Sanctuary cards to show ability and battle bonus without uneven long descriptions.
- Updated pet detail views with the full field note, passive ability, and battle bonus.
- Preserved all 82 IDs, ownership, active-pet selections, favorites, and Pet Tokens.

## Final progression

| Rarity | Level | Total bonus | Count |
|---|---:|---:|---:|
| Common | 1 | 1 | 14 |
| Uncommon | 3 | 2 | 22 |
| Rare | 5 | 3 | 23 |
| Epic | 8 | 4 | 14 |
| Legendary | 10 | 5 | 9 |

## Deployment

Upload the ZIP contents to the GitHub repository root, preserving paths. No Firestore Rules, Firebase Storage, or R2 update is required.

