# Dragonswood v56.17 — Pet Interactions

This patch was merged forward from the older v56.14 interaction prototype into the current v56.16 pet rarity and animated-prestige build. It does not install the older project files.

## Included

- Active pet displayed beside the scholar in Daily Boss battles.
- Pet attack reaction after a correct answer.
- Pet defend reaction after an incorrect answer.
- Pet celebration after a Boss victory.
- `PLAY` and `SHOW ABILITY` interactions in Pet Sanctuary.
- Animated hatch reveal, including the duplicate-to-Pet-Token explanation.
- Active-pet celebration after Daily Quest completion.
- Universal motion-state controller with safe idle/static fallbacks.
- Reduced-motion support and browser-only animation with no usage fee.
- Preserved v56.16 rarity reclassification, pet notes, abilities, 82-pet registry, animated prestige pets, boss enemies, and current Daily Quest.

## GitHub upload

Unzip at the repository root, preserving folders, then commit:

```bash
unzip -o DRAGONSWOOD-v56.17-PET-INTERACTIONS.zip
git add adventurer-hall.html boss-battle.html daily-quest.html \
  pet-motion-controller.js pet-registry-v5614.js dragonswood-rpg-v56.js \
  assets/rpg/pets assets/rpg/enemies \
  DEPLOY-v56.17-PET-INTERACTIONS.md QA-v56.17-PET-INTERACTIONS.md
git commit -m "Merge pet interactions into Dragonswood v56.17"
git pull --rebase origin main
git push origin main
```

## Other services

- Firestore rules: no change.
- Firebase Storage: no upload.
- Cloudflare R2: no upload.
- OpenAI/Cedar: no paid generation call.

All images and GIFs in this package are ordinary GitHub Pages assets under `assets/rpg`.
