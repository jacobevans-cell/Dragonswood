# Dragonswood v56.5 — changed files only

Upload everything in this zip over your repo, preserving folders.
`assets/rpg/` and `tools/` must keep their structure.

Unchanged files (witches-reader.html, the ten games, curriculum pages) are
deliberately absent — nothing in them was touched.

## Deploy order

1. **Publish `firestore.rules` first.** Without it the entire RPG stays
   write-blocked: no class choice, no purchases, no equipping, no pets, no
   boss loot.
2. Upload the rest of the files.
3. Hard-refresh.
4. Teacher portal → set **Day credit** to 12 for your current roster.

## What's in here

| File | Change |
|---|---|
| `firestore.rules` | Four new student-write paths for the RPG, plus `bossLoot`, `rpgPurchases`, and a bounded `classData` goal path |
| `dragonswood-rpg-v56.js` | 48 appearance packs, 40 tiered item icons, 13 pets, explicit per-item art |
| `index.html` | Unified character model, per-student day counter, Jobs tracker in Daily Missions |
| `teacher.html` | RPG snapshot, Reset Class, day-credit field, item/pet pickers |
| `adventurer-hall.html` | Battle-equipment vs cosmetic labelling with stat lines |
| `boss-battle.html` | Boss questions now drawn from skills the student actually missed |
| `assets/rpg/` | 48 appearance skins, 40 item icons, 5 animated pets |
| `tools/` | Coverage check, parse check, recolour tool, tier builder |

## Verify before you trust it

```
node tools/check-parse.mjs              # 62 scripts, 0 failures
node tools/check-firestore-coverage.mjs # must print COVERAGE CHECK PASSED
```

Both pass on this build. Run the coverage check on every future change — it is
what would have caught the v56.1 write-blocking bug.

**Still not done:** Firestore emulator tests. `firebase-tools` is blocked in my
environment, so rules were verified structurally but never executed. That gate
remains open and it is the one thing I could not close for you.
