# One Dragonswood portal

The canonical student site is https://dragonswood-9289e.web.app/. The GitHub Pages index is a bookmark entry point that redirects before loading authentication. It must not start the old student application or display a separate Google login.

Firebase Hosting serves the existing public school tools on this same origin. The new learning homepage and authenticated APIs use the existing `dragonswood-learning` service. `school-tools.html` retains the other school features. It is not the default homepage. Teacher dashboard authentication uses the default Firebase app on the canonical origin, while teacher authority remains controlled by verified identity and existing Firebase rules.

Do not copy tokens into URLs, transfer browser credentials between domains, or weaken API authentication to make navigation appear seamless. Existing bookmarks may require the first normal login on the canonical origin; navigating between school tools and lessons then uses that same browser session.

When releasing changes, update the reviewed Firebase backend/public assets and Firebase Hosting static-tool version before changing the GitHub entry point. Retain the previous Hosting version and service revision. A GitHub merge alone does not update the Firebase-hosted tool files. Keep the public Hosting manifest separate from backend banks, transcripts, saved work, deployment credentials, and private grading evidence.

Run the current learning release gate, plus affected application checks and browser navigation verification. Include root bookmarks, direct activity URLs, teacher-dashboard session reuse, save-before-navigation, mobile layout, and sign-out/account separation. The routing tests do not by themselves prove a live student gradebook submission.
