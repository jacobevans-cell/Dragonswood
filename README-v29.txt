DRAGONSWOOD v29 — JOBS + SCHEDULE + CALENDAR INTEGRATION

ADDED TO THE CURRENT LIVE BASE

1. DRAGONWOOD GUILD JOBS
• Scroll Keeper / Paper Passer — 40 Gold
• Groundskeeper / Sweeper & Garbage — 75 Gold
• Courier / Runner — 50 Gold
• Rune Warden / Doors, Lights & Board — 60 Gold
• Gearsmith / Technology — 70 Gold
• Mimic / Substitute — 50 Gold
• First Flame / Line Leader — 40 Gold
• Students check off one box per weekday.
• 4/5 days = 80% of salary.
• 5/5 days = 100% of salary.
• Payroll is automatic the next week when teacher.html is open.
• Paid weeks are marked paid and logged to studentTransactions.
• Teacher JOBS tab assigns jobs and edits salary.

2. DAILY SCHEDULE
• Student SCHEDULE tab.
• NOW / NEXT display.
• Full timeline with current block highlighted and completed blocks dimmed.
• Home page receives RIGHT NOW + NEXT widgets.
• Monday–Thursday schedule preloaded from the supplied STEM schedule PDF.
• Friday is represented as remote / half-day.
• Teacher SCHEDULE editor can add/delete/reorder/save blocks.

3. SCHOOL + SPORTS CALENDAR
• Student CALENDAR tab with category filters.
• Home page COMING UP widget.
• Explore Academy 2026–27 major dates preloaded from supplied calendar.
• All 9 current volleyball games preloaded.
• Multicultural Day added for September 24, 2026.
• Teacher CALENDAR panel can add/edit/delete future events.

4. FIRESTORE EFFICIENCY
• Uses realtime listeners.
• No 5-second polling added.
• Jobs and schedule live in compact classData documents.
• Calendar uses a small event collection.

IMPORTANT FIREBASE STEP
Publish the included firestore.rules because:
• studentJobWeeks
• classCalendarEvents
are new protected paths.

FILES CHANGED
• index.html
• teacher.html
• firestore.rules

All other files are preserved from the current ZIP supplied for this build.
