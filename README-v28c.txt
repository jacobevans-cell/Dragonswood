DRAGONSWOOD v28c — CLASSROOM FIX PACKAGE

FIXED NOW

1. BATHROOM PASSES
- Bathroom activation uses ONE Firestore document instead of depending on a second collection.
- This removes the failure point that was causing "Could not update the pass."
- Each student's bathroomStatus document now keeps today's visit history.
- Every visit records:
  * automatic or approved-extra pass
  * time out
  * time returned
  * duration
- Teacher portal shows who is OUT NOW and TODAY'S BATHROOM HISTORY.
- Teacher can still mark a student returned.
- 3 automatic passes per day remain.
- Extra trips still require teacher approval after the automatic passes are used.

2. RECOGNITION REQUESTS
- Student requests remain teacher-approval only.
- Teacher portal has realtime updates plus a 5-second refresh fallback.
- Requests include the school-day date.

3. STUDENT CLASS GOALS
- Second Recess, Class Pet, Field Trip, and Universal Point Bank are now all actually connected to Firestore on the student home page.
- Class Pet and Field Trip use the same live goals/points as teacher.html.
- Universal Points display live.
- Universal Points are teacher allocated; students do not spend these themselves.
- Personal Gold is still what students spend in the Shop.

4. WITCHES eREADER
- A− / A+ now zoom the WHOLE two-page book spread, not the content inside a fixed page.
- Range: 80% to 160%.
- Steps: 5%.
- The stage scrolls when the enlarged spread is bigger than the screen.
- Current percentage stays visible.
- Games exit button remains.
- Staff Preview badge remains removed.

FIREBASE RULES
No new collection is required by this version.
The bathroom visit history is stored inside each student's existing bathroomStatus document.
If your current Firebase rules already match the included firestore.rules, you do not need to publish anything.

REPLACE AT MINIMUM
- index.html
- teacher.html
- witches-reader.html

All current project files are included in this ZIP.
