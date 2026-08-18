DRAGONSWOOD v32 — LIVE POLLS + RANDOM PICKER

LIVE POLL
Teacher:
• New POLL tab.
• Type a question.
• Add 2–6 answer choices.
• Launch the poll.
• Watch vote totals and percentages update live.
• Close poll when finished.

Student:
• New POLL tab.
• Student sees active question and choices.
• One vote per student per poll.
• Results tally live on student screens.
• Vote buttons lock after voting.

RANDOM PICKER
Teacher:
• New PICKER tab.
• Pick one random student.
• Make random groups of 2, 3, 4, or 5.
• If a final group would contain only one student, that student is added to the previous group.
• Uses the current live student roster.

FIRESTORE
• Added classPollVotes collection rules.
• activePoll is stored in classData/activePoll using existing teacher-write/class-read behavior.

DEPLOY
Replace:
• index.html
• teacher.html
• firestore.rules

Then publish firestore.rules.
