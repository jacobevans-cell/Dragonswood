DRAGONSWOOD v39 — ACTUAL STUDENT POLL ROUTER FIX

CAUSE FOUND
The POLL button existed, but Dragonswood's real navigation core had a hard-coded list of valid pages.
"poll" was not in that list, so every click was silently redirected back to HOME.

FIXED
• Added poll to the PRIMARY Dragonswood navigation whitelist.
• Added jobs, schedule, calendar, and poll to the secondary portal whitelist too.
• Poll button and view remain intact.
• Poll fallback now verifies routing before falling back.
• Teacher Poll/Picker tabs remain included.
• Existing v38 home cleanup, v35 Long Division alignment, Poll/Picker, Jobs, Schedule,
  Calendar, Bathroom, Snack, and other systems remain.
• firestore.rules included.

DEPLOY
Upload v39. If the Poll rules have not already been published, publish the included firestore.rules.
