# GitHub portal replacement

The student homepage remains https://jacobevans-cell.github.io/Dragonswood/. It loads the approved new learning UI directly. School tools, spelling, Storyvault, teacher dashboard and learning links remain on this origin and share the default Firebase Auth session.

Firebase remains the private authenticated API and saved-work backend. CORS allows the exact GitHub origin only when configured; all API calls still verify Firebase tokens, roster ownership, grade and teacher authority. Cross-origin sessions bind to verified UID and authentication time and retain idle, absolute-expiry and logout enforcement without third-party cookies. Tokens are never passed in navigation URLs.

Deploy the reviewed backend with the GitHub origin allowlist before merging the frontend. No separate Firebase homepage redirect is released. Existing AI pilot scope and assessment rules are unchanged.

Rollback: revert this PR to the prior GitHub commit and restore the previous Cloud Run image and pilot digest from the private deployment receipt. No student data migration or reset is part of this change.
