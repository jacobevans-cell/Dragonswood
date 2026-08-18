DRAGONSWOOD v37 — CLEAN NEWLINES + POLL/PICKER VISIBLE

FIXED
• Removed visible literal \n artifacts from index.html, teacher.html, and long-division-custom.html.
• Student POLL tab is now inserted using the portal's ACTUAL data-view + DragonswoodNav markup.
• Teacher POLL and PICKER tabs now use the portal's ACTUAL data-p navigation system.
• Poll and Picker panels are connected to those tabs.
• Existing poll live-vote code and group-picker code are preserved.
• v35 Long Division alignment fix remains.
• firestore.rules remains included and contains classPollVotes plus current Bathroom/Snack/Jobs/Calendar rules.

DEPLOY
Upload this package and publish the included firestore.rules.
