DRAGONSWOOD v55 — DEPLOYMENT CANDIDATE
Audit date: 2026-08-22

This package continues the v54 build. It does not redesign or restart Dragonswood.

Primary deployment files:
- index.html
- daily-quest.html
- curriculum-quest.html
- curriculum-question-engine.js
- foundation-track.js
- q1-curriculum-data.js
- q1-video-map.js
- teacher.html
- firestore.rules
- firebase.json

Review V55-AUDIT.md before release. The source is locally verified, but live deployment is intentionally gated on Firestore Emulator tests and owner confirmation.

Important preserved behavior:
- Students may use 2× video playback.
- Video completion requires the full video content to be watched; playback speed does not waive coverage.
- Teacher verification is separate from student-submitted evidence.

Rollback: preserve the current production release before deploying this package.
