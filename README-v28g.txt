DRAGONSWOOD v28g — BATHROOM PERMISSION FIX

Why v28f could show "Could not update the pass":
The new /bathroomSlots rules tried to verify genderGroup by reading the student's
profile document. Older/existing profiles may not contain that field, causing
Firestore to reject the slot transaction.

FIX:
• /bathroomSlots/boy and /bathroomSlots/girl remain protected.
• Students may only claim a slot as themselves.
• A student cannot overwrite another student's occupied same-day slot.
• Students may only release a slot they own.
• Teacher retains management access.
• No dependency on an existing genderGroup field in the student Firestore profile.
• A blocked same-group student still DOES NOT lose a bathroom pass.
• Permission errors now explicitly tell you when the newest rules need publishing.

DEPLOY:
1. Upload/replace the files from this ZIP.
2. Publish the included firestore.rules in Firebase.
3. Refresh the student page.
