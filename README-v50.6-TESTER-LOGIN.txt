DRAGONSWOOD v50.6 — TESTER LOGIN

• Adds a Tester Login section to the normal student portal.
• Tester enters only username + password.
• Dragonswood internally maps username to username@dragonswood.test for Firebase Email/Password authentication.
• Password is NEVER stored in index.html or GitHub.
• A tester is authorized only when students/{uid} exists and tester == true.
• Normal @explore.academy Google login is unchanged.
• No Firebase/Firestore deployment is required for this update.

For the account created in Firebase, the visible username is the portion before @dragonswood.test.
