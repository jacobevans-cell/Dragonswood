# Dragonswood v56.13 — Rare Eggs, Pet Discovery, and Legendary Passes

This is cumulative with the v56.12 Champion Display.

## GitHub files

Upload these files to the repository root:

- `index.html`
- `adventurer-hall.html`
- `boss-battle.html`
- `teacher.html`

## Firebase

Publish the separate `firestore.rules` file in Firebase Console → Firestore Database → Rules.

Publish the rules first, then upload the GitHub files. The rules remain compatible with the immediately previous Boss client while GitHub Pages updates.

## Reward behavior

- Woodland Eggs are no longer sold.
- Only every fifth Boss win is an egg opportunity.
- Each opportunity has a 25% egg chance; it is not guaranteed.
- Hatches roll from every level-eligible companion, including discovered pets.
- A new roll permanently reveals the companion.
- A duplicate roll becomes exactly one saved Pet Token.
- Pet Tokens have no spend action yet.
- Undiscovered pets show the actual pet's black silhouette, `???`, and no identifying details.
- Prestige companions remain unavailable before Level 10.
- Boss chests have a 0.5% combined chance to drop a Recess, Ice Cream, or Lunch Pass.
- Each physical pass is stored as a unique, one-time item.
- Students request redemption from Pet Sanctuary.
- Teachers mark requested passes redeemed from the selected student's RPG snapshot.

## Not required

- No Firebase Storage upload
- No Cloudflare R2 upload
- No asset upload
- No data migration

After GitHub Pages deploys, hard-refresh with `Ctrl + Shift + R`.
