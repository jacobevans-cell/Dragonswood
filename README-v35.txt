DRAGONSWOOD v35 — FINAL CUSTOM LONG DIVISION ALIGNMENT + RULES

WHAT WAS WRONG
The quotient/dividend looked aligned, but the multiply/subtract/work rows could start
at a different horizontal origin. That made correct digits appear one place-value
column too far left.

FIX
• The dividend row is now the single source of truth for alignment.
• After every render, JavaScript measures the dividend's actual left edge.
• Quotient, multiply, subtract, remainder, and bring-down rows all use that exact edge.
• Works dynamically for 1–5 digit dividends.
• Recalculates on browser resize/zoom.
• Subtraction sign stays attached to the working row instead of shifting the digit cells.

PACKAGE
This is the full v34 package plus this alignment fix.
It still includes Polls, Random Student/Group Picker, expanded Custom Long Division,
Jobs/Schedule/Calendar and the existing Dragonswood systems.

FIRESTORE RULES
The included firestore.rules is part of this package. Publish it when deploying.
It includes the currently needed Poll, Bathroom, Snack, Jobs, and Calendar paths.
