# Dragonswood v56 Deployment Notes

## What v56 replaces

v56 replaces the five-day RPG shop experiment with a separate four-class inventory. Legacy purchases remain archived in Firestore but do not unlock, equip, or affect v56 items.

## Four launch classes

- Warrior: ATK/DEF/MAX HP; absorbs Guardian gear.
- Ranger: ATK plus a fixed 10% critical-hit and 5% dodge chance; absorbs Rogue gear.
- Mage: strongest base ATK and one simple boss-weakness bonus; absorbs offensive Alchemist gear.
- Healer: HEAL/MAX HP and small healing after correct boss answers; absorbs support Alchemist gear.

There are no skill trees, mana bars, elemental inventories, or separate pet-leveling systems in v56.

## Shop and equipment

- The Adventurer Hall contains the class selector, stat summary, pet hatchery, equipment, and redesigned market.
- Every class has a starter set and a Level 10 prestige set.
- Completing and equipping a whole set grants +1 ATK, +1 DEF, +1 HEAL, and +3 MAX HP.
- The new inventory uses `rpgInventory`, `rpgEquipped`, and `rpgPurchases` so old purchases cannot interfere.

## Pets and eggs

- Ordinary pets hatch from Woodland Eggs and grant small fixed ATK/DEF bonuses.
- Eggs can be bought in the Hatchery, found randomly in the daily boss chest, granted by a teacher, and are guaranteed after every fifth boss victory.
- Dragon, Gargoyle, and Elemental are Level 10 prestige pets and use the supplied sprite art.
- Separate pet XP/levels are intentionally deferred.

## Daily boss

- The boss is locked until both Morning Work and Exit Quest are complete for the current date.
- It uses the current day's stored Math and ELA skills to create harder, no-hint questions.
- Enemies are enlarged and receive additional HP based on player level; bosses do not use a separate combat system.
- The once-daily chest grants 1–3 Gold, up to 12 XP, and a possible class-compatible item or egg.
- Rare finds can grant +25 Class Pet Goal Points or +25 Field Trip Goal Points.
- Each chest is protected by an immutable `bossLoot/{uid}_{date}` record.

## Teacher controls

Manage Student now includes class, eggs, v56 owned item IDs, owned pets, active pet, and boss wins. The older shop panel is labeled Legacy Shop.

## Manual deployment order

1. Upload every file from the changed-files deployment ZIP, preserving folders.
2. Publish the separate `firestore.rules` file from the rules folder in Firebase.
3. Hard refresh the browser.
4. Test with one student: choose a class, buy/equip an item, hatch an egg, complete Morning and Exit work, win the boss, and reopen the boss page to confirm the chest cannot be claimed twice.

