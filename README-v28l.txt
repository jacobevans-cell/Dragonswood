DRAGONSWOOD v28l — SNACK APPROVE / DENY FIX

BUG FOUND
The Snack APPROVE / DENY buttons were being rendered, but their click handlers were never attached.
That is why pressing them did nothing.

FIXED
• APPROVE now calls approveSnack(..., true).
• DENY now calls approveSnack(..., false).
• MARK DONE is also explicitly bound.
• Added error feedback if Firestore rejects a snack action.
• Positive/negative sounds remain.
• 5-minute snack and bathroom timers remain.
• Firestore realtime cleanup remains.

FILES CHANGED
• teacher.html

NO FIRESTORE RULE CHANGE REQUIRED FOR THIS FIX.
