# Dragonswood v56.21.3 — Urgent Classroom Fixes

This patch is based on the supplied current repository snapshot and contains five GitHub files only.

## Fixed

- Boys now see the existing masculine Warrior starter artwork; Girls retain the current feminine Warrior starter artwork.
- Home, Adventurer Hall, class shop, and Daily Boss use the same gender-aware starter Warrior fallback.
- Gradebook Daily Quest and Reading grades now use `gameResults`, the collection that is actually loaded by the gradebook.
- Gradebook loading is a small non-blocking status pill instead of a full black screen.
- Firestore gradebook requests time out after 12 seconds, preserve visible grades, show a warning, and restore the Refresh button.
- Teacher content now starts immediately after the 218px sidebar instead of leaving a large dead gap.
- The signed-in teacher email and Logout button now live in a readable top-right account pill.

## Deploy

Unzip at the repository root, then commit the changed files. No Firebase Rules, Storage, or R2 update is included or required.

## Test

1. Sign in with a Boys student profile and open Adventurer Hall; Warrior should show the bearded armored starter.
2. Open Home and Daily Boss with that Warrior selected; the same starter should appear unless an appearance pack is equipped.
3. Open Teacher Command; verify the sidebar-to-content gap is gone and the account controls are readable.
4. Open Gradebook and press Refresh; existing rows remain visible while a small `Updating grades…` pill appears.
5. Confirm Daily Quest and Reading submissions populate cumulative grades.
