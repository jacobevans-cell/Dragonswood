DRAGONSWOOD v43 — DAILY QUEST LOCATION + LOUD ALERTS + DUAL LOGIN

DAILY QUESTS
• Removed Dragonswood Daily Quest from the student GAMES page.
• Kept the existing 📜 image/icon and "Daily Quests" title in QUESTS.
• Updated the description to explain Morning Bell Work + Exit Quest.
• Replaced "Quest Board Opening Soon" with an ENTER TODAY'S QUEST button.
• Button opens the existing daily-quest.html.
• No Daily Quest scoring/Firebase behavior was changed.

LOUDER TEACHER ALERTS
• Bathroom/pass alert is dramatically louder and longer.
• Uses layered frequencies and repeated pulses to be easier to hear on laptop speakers.
• General notice alert is also louder.
• The browser cannot exceed the computer's physical/OS maximum volume, but the source signal is now much stronger.
• Teacher badge reads "LOUD Alerts Armed."

SIMULTANEOUS TEACHER + STUDENT LOGIN
• teacher.html now initializes Firebase as a separate named app: DragonswoodTeacherPortal.
• Student portal continues using the default Firebase app.
• Firebase Auth storage is therefore isolated by app name.
• You can keep a student/testing account signed in on index.html while your teacher/admin account stays signed in on teacher.html in another tab in the SAME browser.
• Signing in/out of teacher.html should no longer replace the student's login.

FIRESTORE
• Same Firebase project and same data.
• No Firestore rule changes required for these three changes.
