# V5 Replacement Map

| Game surface | Legacy source | V5 source | Rollback behavior |
| --- | --- | --- | --- |
| Adventurer Hall selector | Four static class cards | Gender-first flow and eight animated class/path cards | Legacy selector/data remains in the same page |
| Adventurer Hall current appearance | Equipped appearance pack or class PNG | Tier-resolved V5 static/animated character | Existing equipped appearance becomes visible again |
| Class Shop | Legacy class and appearance packs | Effective V5 class; legacy appearance packs hidden during V5 | Original shop and appearance packs reappear |
| Student portal hero | Legacy equipped idle GIF/static skin | V5 idle, ability, celebrate, and static fallback art | Resolver returns the original pack |
| Daily Boss hero | Legacy class/appearance idle, attack, hurt | V5 idle, attack/heal, and hurt states | Resolver returns the original battle art |
| Daily Boss class trait/rewards | `profile.classId` | `DWRPG.characterClassId(profile)` | Effective class returns to legacy `classId` |
| Kingdom Wars hero | Legacy appearance candidates | V5 tier-resolved idle character | Legacy candidate list resumes |
| Firestore student profile | `classId`, `rpgEquipped` | Five additive V5 fields | Legacy fields never changed |

## Family assignment

| Class | Radiant male | Radiant female | Shadow male | Shadow female |
| --- | --- | --- | --- | --- |
| Warrior | Dawnscale | Sunshield | Eclipse | Nightwyrm |
| Ranger | Dawnfeather | Sunleaf | Nightfang | Moonshadow |
| Mage | Starfire | Celestial | Voidcore | Eclipse Witch |
| Healer | Dawnkeeper | Dawnwing | Mooncleric | Twilight |
