# Security — v1.5

## Non-negotiable reward boundary

- Games report performance only.
- Games cannot write Dragonswood Gold, XP, class points, pets, fragments, or reward totals.
- Student clients cannot create or update `arcadeRewardEligibility`.
- Reward fulfillment remains teacher-reviewed.

## Firebase

- Firebase browser config is public configuration, not a server secret.
- Never place service-account credentials in `site/`.
- Firestore rules enforce monotonic best-score updates and owner-only Void Runner progress.
- Scheduled retention uses the Admin SDK and prunes only stale raw daily/weekly score documents.

## R2

- Never place R2 secret keys in browser code.
- Public game assets may use a public R2/custom-domain URL.
- Upload credentials remain server/developer side only.

## Custom music

- Dragon Dash accepts HTTPS custom-music URLs only.
- `site/js/arcade-config.js` can optionally restrict music to approved hostnames.
- Only audio the project owns or is licensed to use should be hosted/linked.

## HTML / custom level metadata

- User-controlled level metadata is length-bounded.
- Level-card metadata is HTML-escaped before rendering.
- Keep that rule if online level sharing is ever added; do not reintroduce raw `innerHTML` interpolation for untrusted content.

## Identity

- URL-provided display names and student IDs are bounded before storage/submission.
- Anonymous Firebase Auth is a fallback device identity, not a guaranteed roster identity across devices.
- For strict one-student/one-account behavior, bridge the Arcade to the same authenticated Dragonswood identity used by the main portal.
