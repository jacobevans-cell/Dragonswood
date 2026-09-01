# Dragonswood V5 Character System

## Implemented scope

The V5 character system is account-gated to `jacobicusjax@gmail.com` while the rest of the student roster continues using the legacy system.

The tester flow is:

1. Existing V5 choice is treated as reset.
2. Choose `male` or `female` first.
3. Compare eight characters: Radiant and Shadow versions of Warrior, Ranger, Mage, and Healer.
4. Confirm one character.
5. The chosen class and animated character replace the legacy visual in Adventurer Hall, the student portal, Daily Boss, and Kingdom Wars.
6. The character automatically changes visual tier at Levels 5, 10, 15, and 20.

No legacy field or asset is deleted. The existing `classId`, `rpgEquipped`, inventory, pets, XP, Gold, and appearance-pack ownership remain intact.

## Additive profile fields

```text
characterSystemVersion: "v5" | "legacy" | ""
characterV5Gender: "male" | "female" | ""
characterV5Affinity: "radiant" | "shadow" | ""
characterV5ClassId: "warrior" | "ranger" | "mage" | "healer" | ""
characterV5SelectedAt: timestamp | null
```

`classId` remains the rollback source of truth. V5 gameplay uses `DWRPG.characterClassId(profile)` so the selected V5 class is effective everywhere without destroying the legacy class.

## Level tiers

| Student level | Asset tier | Display title |
| --- | --- | --- |
| 1–4 | `starter` | Initiate |
| 5–9 | `level-05` | Adept |
| 10–14 | `level-10` | Veteran |
| 15–19 | `level-15` | Champion |
| 20 | `level-20` | Ascendant |

Each of the 80 character/tier combinations includes four-frame `walk-left`, `walk-right`, class action (`attack` or `heal`), `hurt`, and `happy` animations. Production uses 400 animated WebP files plus 80 static WebP fallbacks. The 640px PNG/APNG/WebP/GIF masters remain in the full animation handoff.

### V5.1 animation repair

- Happy frames recover raised weapons, hands, hair, and effects that cross source-sheet row boundaries instead of cutting them off.
- Animation states scale from their own silhouettes, so a long attack effect cannot shrink every state in a tier. This corrects Moonshadow Ascendant's apparent level regression.
- Dawnscale starter, Veteran, Champion, and Ascendant use a guarded four-frame stride without the original leg crossover.
- Visual gender assignment is based on the actual art: Warrior Shadow uses Eclipse for male and Nightwyrm for female; Mage Radiant uses Starfire for male and Celestial for female.

## Rollback

Per-account rollback is available in Adventurer Hall. It writes `characterSystemVersion: "legacy"` and clears only the four V5 selection fields. The exact prior class and equipped legacy appearance immediately become active again.

Global emergency rollback is one edit in `dragonswood-rpg-v56.js`:

```js
const v5Config=Object.freeze({enabled:false, ...});
```

No database migration is required for either rollback.

## Security boundary

Both production and emulator Firestore rules accept V5 selection writes only for the authenticated owner whose token email is exactly `jacobicusjax@gmail.com`. Allowed writes are restricted to the six V5/timestamp fields. Legacy class, inventory, currency, XP, rewards, and equipment cannot be changed by this rule.

## Verification

Run:

```powershell
node tools/verify-v5-character-integration.mjs
```

Expected result:

```json
{
  "passed": true,
  "profiles": 80,
  "checkedFiles": 720,
  "catalogCharacters": 80,
  "productionAssets": 480,
  "failures": []
}
```

Open `tools/v5-character-preview.html` through a local web server for the no-write visual tester. It exercises gender selection, all eight class/path choices, every level tier, animation-state switching, and legacy rollback preview.
