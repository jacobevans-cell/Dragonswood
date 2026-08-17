DRAGONSWOOD v28i — BATHROOM TRANSACTION READ-ORDER FIX

WHAT WAS WRONG
The live student error identified the exact Firebase problem:

"Transactions require all reads to be executed before all writes."

The bathroom code used Promise.all() around two transaction reads.
Firebase's transaction implementation can reject that pattern because it strictly
tracks the ordering of transaction reads and writes.

FIX
Both bathroom transactions now perform explicit reads in order:

1. read bathroomStatus / bathroomSlots
2. read the other required document
3. only after ALL reads finish, perform transaction writes

This was fixed for:
• starting/claiming a bathroom pass
• returning from the bathroom / releasing the slot

PRESERVED
• One boy + one girl maximum at once
• Same-group blocked students do NOT lose a pass
• 3 automatic passes
• approved extra passes
• bathroom history
• teacher Mark Returned
• bathroom alerts/sounds
• recognition requests
• checkbox student selection
• all other current Dragonswood systems

FIRESTORE RULES
No additional rule change was required for THIS specific fix.
Keep the current v28g/v28f bathroomSlots rules already included in this package.

FASTEST DEPLOYMENT
Replace index.html.
The full current package is included for convenience.
