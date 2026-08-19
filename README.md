# Dragonswood

**Current build: v49.2**

## Student portal
Home • Daily Missions • Games • Jobs • Schedule • Calendar • Poll • Shop • Leaderboard • My Journal

## Daily Missions
- Morning Bell Work and Exit Quest
- The Witches eReader
- Daily progress
- The old Bonus Missions placeholder has been removed.

## Games
### Math
Decimal Deception • Long Division Quest • Long Division Quest: Custom • Fraction Forge

### ELA
- Spelling Practice

The Witches eReader is intentionally not in Games. It lives in Daily Missions.

### Science
Elemental Laboratory • Cosmic Architect • Arcane Forge

### History
History Adventures placeholder

## Firebase / Firestore
v49.1 requires no new Firebase changes. Continue using the Firestore rules from the v48.9 job compatibility fix.

## Change history
- **v49.1:** Restored the ELA/spelling game cards accidentally removed in v49. Kept The Witches eReader in Daily Missions.
- **v49:** Renamed Quests to Daily Missions and moved The Witches eReader into the former Bonus Missions position.
- **v48.9:** Cosmic Architect plus robust job check-off / legacy Firestore compatibility.
- **v48.8:** Initial job check-off fix.
- **v48.7:** Added Cosmic Architect.
- **v48.6:** Subject-organized Games library and Elemental Laboratory.


## v49.2
- Added an optional Level-Up Challenge to Daily Missions between the required Daily Quest and The Witches eReader.
- Level-Up automatically serves one level above the student's assigned track: 4th → 5th, 5th → Challenge (early-mid 6th).
- Level-Up does not change the teacher-assigned Daily Mission track.
- Level-Up progress/reward claims are separated from required Daily Mission claims.
- Teacher sign-in button made explicitly active/high-contrast.
- Teacher Auth now uses browser session persistence before email/password sign-in to reduce teacher/student testing-session collisions.
- No new Firestore schema is introduced by the Level-Up feature.
