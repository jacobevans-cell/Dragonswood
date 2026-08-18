DRAGONSWOOD v36 — CLEAN NEWLINES + POLL TAB RESTORED

FIXED
• Removed literal backslash-n artifacts from visible HTML content.
• Preserved legitimate JavaScript and CSS escape sequences.
• Restored/verified student POLL tab.
• Restored/verified teacher POLL tab.
• Restored/verified teacher PICKER tab.
• Poll student view and teacher poll/picker panels are present.
• v35 custom Long Division alignment fix remains.
• v35 rules remain included.

VISIBLE LITERAL \n COUNTS AFTER CLEANUP
index.html: 0
teacher.html: 0
long-division-custom.html: 0

FIRESTORE
Publish the included firestore.rules when deploying because Polls use classPollVotes.
