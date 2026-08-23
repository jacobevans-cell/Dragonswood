# Dragonswood v56.1 Deployment Notes

## Included corrections and additions

- Fixed the Daily Work Progress box so it displays completed school days—not raw XP.
- Removed the teacher-facing Legacy Shop tab; historical data remains untouched in Firestore.
- Split Adventurer Hall into **Class**, **Pet Sanctuary**, and **Class Shop** screens.
- Class selection is a one-time student choice. A teacher can reset it when necessary.
- Class Shop displays only the chosen class's equipment and appearance packs.
- Replaced random icon assignment with deterministic class/slot art so swords, wands, armor, and shields match their names.
- Added complete class appearance packs at Levels 5, 10, and 15.
- Added animated ordinary pets, a dedicated active-pet display, and exactly one active companion at a time.
- Dragon, Gargoyle, and Elemental companions remain Level 10 prestige pets.
- Simplified combat to ATK, DEF, HP, and HEAL. Critical chance, dodge, and elemental-weakness systems are not used.
- Daily Boss continues to use harder, no-hint questions derived from completed Morning and Exit work and grants one chest per day.
- Boss chests may contain 1–3 Gold, XP within the daily cap, a class-compatible item, an egg, or a rare +25 Class Pet/Field Trip goal award. Every fifth win guarantees an egg.
- Merged student **Scribe** and **Journal** navigation into **Scribe & Journal**.
- Merged student **Schedule** and **Calendar** into one responsive half-and-half page.
- Added a Profile link to Adventurer Hall for class, equipment, appearance, and pet management.
- Added the reusable Cedar narration pilot, manifest, private dry-run batch generator, source hashing, and browser-speech fallback. No paid API call was made.

## Cedar pilot status

The approved Cedar sample MP3 was not present in the supplied workspace. The player and manifest integration are ready, but currently fall back to browser speech until approved MP3 clips are added. See `CEDAR-NARRATION-AUDIT.md`. The batch job currently reports 0 clips, 0.0 minutes, and therefore $0 generated cost.

## Manual deployment

1. Upload everything inside the changed-files ZIP, preserving `assets/rpg/` and `tools/` folders.
2. Publish the separate `firestore.rules` from the Firestore rules ZIP.
3. Hard-refresh the browser.
4. Test one student: verify the day counter, choose a class once, confirm other classes lock, buy/equip a correctly named item, hatch and activate one pet, and complete a Daily Boss.
5. Test teacher view: confirm Legacy Shop is absent and Manage Student still exposes v56 RPG fields.

Legacy purchases and records are preserved; v56.1 does not erase them.
