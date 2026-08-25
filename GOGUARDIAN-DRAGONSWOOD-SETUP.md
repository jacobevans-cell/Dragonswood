# GoGuardian Dragonswood Scene

Use GoGuardian Teacher for enforcement and Dragonswood's built-in focus log as the classroom record. A normal webpage cannot stop a Chromebook from changing tabs by itself.

## Recommended scene

Create an **Allowed Websites List** Scene named `Dragonswood Focus`.

1. Add the live Dragonswood domain and auto-open it.
2. Add the required service domains below.
3. Set the tab limit to the lowest number appropriate for the lesson.
4. During Morning Work, Curriculum Quest, Scribe, or an assessment, set the open Dragonswood page as the **Focus Tab**.
5. Release Focus Tab before students are expected to use an outside source.

## Core allow list

- Live Dragonswood website domain
- `www.gstatic.com`
- `dragonswood-9289e.firebaseapp.com`
- `firestore.googleapis.com`
- `identitytoolkit.googleapis.com`
- `securetoken.googleapis.com`
- `pub-005ee88ce4da43c5a2afcbb4b730333c.r2.dev`

## Allow only when the lesson needs it

- `docs.google.com`
- `drive.google.com`
- `commons.wikimedia.org`
- `phet.colorado.edu`
- `icscdn.vantezzen.io`

Do not allow `api.openai.com` for student browsing. Dragonswood's protected AI work must remain server-side.

## Required smoke test

Test the Scene with a student Chromebook account—not the teacher account:

- Sign in and load the student portal.
- Complete Morning Work and confirm it saves.
- Open Curriculum Quest and play a hosted video.
- Submit a Scribe draft and confirm autosave.
- Open a math game and Grayson Mode.
- Complete a Boss Battle and verify only one daily chest is issued.
- Confirm images, pet animation, narration, and R2 media load.
- Set and release Focus Tab.

If a feature fails only while the Scene is active, inspect the blocked request in GoGuardian and add only that exact service domain.
