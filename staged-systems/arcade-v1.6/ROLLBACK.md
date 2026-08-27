# Rollback

The games are contained in their own folders and the arcade shell is additive. To roll back a bad release:

1. In GitHub, identify the last known-good commit.
2. Revert the failing commit or redeploy the last known-good commit.
3. Firestore leaderboard documents are append/update data and do not alter the game files.
4. Reward eligibility is separate from reward fulfillment, so a game deployment cannot directly change Dragonswood reward totals.
