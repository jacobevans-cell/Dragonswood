DRAGONSWOOD v48.4 - SCHOOL CALENDAR FIX + COUNTDOWNS

WHY 182 WAS WRONG
- The prior Daily Quest seed contained 182 dated lessons.
- The Explore Academy 2026-27 calendar labels Semester 1 as 88 days and Semester 2 as 92 days: 180 total student school days.
- Correct school-day sequence runs Aug 3, 2026 through May 20, 2027.
- Aug 19, 2026 remains Day 13.

FIXES
- Daily Quest journey changed from /182 to /180.
- Journey map now has 180 nodes.
- Daily Quest seeder rebuilt onto the actual 180 school dates.
- Old quest dates that landed on breaks/summer/teacher work days are removed when the seeder is rerun.
- Existing question content/mechanics remain in the same academic order.

COUNTDOWNS
- Added live School-Year Countdown cards to the student portal Home and Daily Quest page:
  Next Break
  Last School Day - May 20, 2027
  Summer Break - begins May 21, 2027
- Next Break automatically advances through Fall, Thanksgiving, Winter, and Spring Break.

AFTER UPLOAD
1. Publish this package to GitHub.
2. Sign in as teacher.
3. Open daily-quest-seed.html once.
4. Click SEED / UPDATE ALL 180 DAILY QUESTS.
This is needed because the existing Firestore dailyQuests collection still contains the old date mapping.
