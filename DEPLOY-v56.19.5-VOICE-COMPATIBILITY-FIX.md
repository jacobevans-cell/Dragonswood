# Dragonswood v56.19.5 — Voice Compatibility Fix

## Fixed

- Waits for Chrome/Windows speech voices to finish loading before narration begins.
- Maps Lewis, Liam, Bella, and Alex to explicit compatible browser-voice families.
- Prefers playable local voices when the exact named browser voice is unavailable.
- Adds a short post-cancel delay to prevent Chrome from silently discarding a new utterance.
- Gives Profile's `Hear This Voice` button a dedicated fixed-sample preview path and visible loading feedback.

## Deploy

Unzip at the repository root and commit the two changed code files plus this note.

No Firestore, Firebase Storage, or R2 changes are required.

## Test

1. Hard-refresh with `Ctrl + Shift + R`.
2. Open Profile and test Lewis, Liam, Bella, and Alex with `Hear This Voice`.
3. Open The Witches and test all four choices on the same selected page.
4. Confirm each selection begins speaking and the status line displays the browser voice actually used when a prerecorded clip is unavailable.
