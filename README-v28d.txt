DRAGONSWOOD v28d — SOUND + BATHROOM ALERTS

ADDED
1. POSITIVE SOUND
   • Three-note success chime.
   • Plays when visible feedback changes to things such as correct, earned, approved,
     completed, purchased, saved, won, level-up, etc.
   • Added across the student portal and main Dragonswood games.

2. NEGATIVE SOUND
   • Two-note lower failure sound.
   • Plays on feedback such as wrong, incorrect, failed, denied, banned, blocked,
     not enough, could not, try again, etc.
   • Teacher consequence/deny/ban actions also use the negative sound.

3. AUTOMATIC BATHROOM TEACHER ALERT
   • Distinct three-note door-chime.
   • Plays when a student STARTS a bathroom pass.
   • Also plays when a student sends an EXTRA bathroom-pass request.
   • Works from Firestore state, not from whichever teacher tab is currently selected.
   • teacher.html only needs to remain OPEN in the browser.
   • The tab title also changes to 🚻 BATHROOM ALERT when a new bathroom event arrives.

4. RECOGNITION REQUEST TEACHER SOUND
   • New recognition requests use a softer notification chime.
   • Tab title changes to ⭐ NEW REQUEST.

5. SOUND ARM / MUTE BUTTON
   • teacher.html gets a floating sound button in the lower-right.
   • It shows:
       🔔 Click to Arm Sounds
       🔔 Alerts Armed
       🔇 Sounds Off

IMPORTANT BROWSER LIMIT
Chrome/Edge will not allow a website to make automatic sound until you interact with
that page at least once. When you open teacher.html, click anywhere on the teacher
portal once (or click the floating 🔔 button). After that, leave teacher.html open.
The bathroom alert can then sound while you are working in another browser tab.

No Firebase rule changes are required.

FASTEST DEPLOYMENT
At minimum replace:
• teacher.html
• index.html

For consistent positive/negative sounds inside the games too, replace the other HTML
files from this package as well.
