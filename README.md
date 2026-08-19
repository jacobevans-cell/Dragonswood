# Dragonswood

**Current build: v49.5**

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


## v49.3
- Games and My Journal are locked until the student satisfies the morning-work requirement.
- Either assigned Morning Daily Work OR Level-Up Morning Challenge satisfies the requirement.
- Level-Up and assigned work remain separate records, but the school date counts only once toward completion.
- Teacher Students page includes daily access overrides for the whole class or selected students; the override is date-scoped.
- Daily Missions displays the student's actual completed Daily Work day count.
- Daily Quest also displays the completed-day count and today's completion status.
- The 180-day journey map now shows actual completed days instead of automatically marking every past day complete.
- No new Firestore rules are required; the teacher override uses the existing teacher-writable/readable classData collection.


## v49.4
- Preserves the first 12 school days as completed for every current student, matching the original Dragonswood journey before daily completion tracking was introduced.
- Daily Work progress now begins at 12 / 180 instead of resetting students to 0.
- Days 1–12 display as completed on the 180-day journey map.
- From Day 13 forward, actual assigned Morning Daily Work OR Level-Up Morning Challenge completion is tracked normally.
- Today's Games/Journal unlock still requires today's actual Morning Daily Work or Level-Up completion, unless a teacher override is active.
- No Firebase migration or rule change is required.


## v49.5
- Added the Daily Work completion dashboard directly to the main Daily Missions page.
- Daily Missions now mirrors:
  - completed Daily Work days / 180
  - today's completion status
  - the 180-day Dragonswood Journey
  - Next Break / Last School Day / Summer Break countdowns
- The dedicated Daily Quest page still keeps the same progress interface.
- No Firebase changes required.
