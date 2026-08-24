# Dragonswood v56.14 Pet Overhaul — Deployment

## GitHub Pages

Upload the contents of `DRAGONSWOOD-v56.14-PET-OVERHAUL-GITHUB.zip` at the repository root, preserving folders. It contains:

- `adventurer-hall.html`
- `boss-battle.html`
- `index.html`
- `teacher.html`
- `dragonswood-rpg-v56.js`
- `pet-registry-v5614.js`
- `assets/rpg/pets/` (136 optimized static/animated files)
- this deployment note and the asset audit

## Firebase Firestore Rules

Publish the separate `firestore.rules` from `DRAGONSWOOD-v56.14-PET-OVERHAUL-FIRESTORE-RULES.zip` in Firebase Console → Firestore Database → Rules.

The update adds the new stable `pet-*` ID family, protects Level 10 prestige pets, and allows students to save favorites only for pets they already own.

## R2 and Firebase Storage

No upload is required. The optimized pet art ships with GitHub Pages under `assets/rpg/pets/`. No Cloudflare R2 object, Firebase Storage rule, bucket configuration, API key, Cloud Function, or server is added.

## Verification after deployment

1. Hard-refresh the student portal.
2. Open Adventurer Hall → Pet Sanctuary.
3. Confirm the counter reads a total of 76 pets.
4. Test All, Discovered, Undiscovered, Favorites, rarity, habitat, and search filters.
5. Open a discovered pet and verify the idle loop; enable reduced motion and verify a still image.
6. Activate a pet and confirm only one remains active on Home and in Boss Battle.
7. Hatch an egg on a test account and verify new discovery or duplicate-to-token behavior.
8. Open Teacher → Manage Student and verify the searchable visual pet manager.

