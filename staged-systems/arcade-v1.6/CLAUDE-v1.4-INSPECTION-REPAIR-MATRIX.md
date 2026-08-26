# Claude v1.4 Inspection → v1.5 Repair Matrix

This document maps the critical v1.4 inspection findings to the v1.5 implementation.

| Inspection finding | v1.5 status | Implementation |
|---|---|---|
| Void Runner cold-offline module cache incomplete | FIXED | Service-worker CORE now includes game, cloud-sync, runtime-config, and Three loader modules; cache bumped to v6. |
| Three.js not locally vendored | FIXED AT DEPLOY | Pinned `three@0.185.1`; GitHub Pages and Firebase predeploy run `scripts/vendor-three.mjs`, copying `three.module.js` + `three.core.js` into the hosted site. CDN remains fallback only. |
| PWA missing installable PNG/maskable icons | FIXED | Added exact 192×192 and 512×512 PNG icons plus dedicated 512×512 maskable icon and manifest entries. |
| Firebase Functions Node 20 EOL | FIXED | Functions engine moved to Node 22. |
| Teacher popup auth unreliable on managed Chromebooks | FIXED | Teacher page uses Google redirect auth and redirect-result recovery. |
| Long URL student names can violate Firestore 32-char rule | FIXED | Name capped before persistence and score submission. |
| URL studentId not persisted | FIXED | Student ID is bounded and saved to localStorage. |
| Legitimate score 0 discarded | FIXED | Finite score validation accepts zero. |
| Champion's Choice scope ambiguous | CLARIFIED / PRESERVED | Existing behavior is explicit: first place on any board makes that student Champion's Choice eligible that day; placements collapse to one teacher-reviewed record per student/day. |
| Void Runner shard pickup causes excessive synchronous localStorage work | FIXED | Progress is memory-backed; local persistence debounced and flushed on page hide; cloud sync snapshots on flush. |
| Leaderboard submission performs redundant sequential Firestore reads/writes | FIXED | Removed pre-read; daily/weekly/all-time best-score attempts run in parallel; Firestore monotonic rule remains authority. |
| No reduced-motion / comfort handling | FIXED | Shell + both games honor OS Reduce Motion; persistent Comfort Mode reduces shake, parallax, rotation, wobble, flicker, and fast visual motion. |
| No visible keyboard focus treatment | FIXED | Added `:focus-visible` styling in shell and both games. |
| Dragon Dash custom music URL insufficiently validated | FIXED | HTTPS required; optional host allowlist; UI states owned/licensed audio requirement. |
| Dragon Dash level metadata could become stored-XSS if sharing is added | FIXED NOW | Length bounds plus HTML escaping before level-card rendering. |
| Void Runner registers nonexistent local service worker | FIXED | Dead registration removed; arcade shell owns the PWA worker. |
| `leaderboard.topN` ignored | FIXED | Shell reads and clamps configured Top-N. |
| Global admin auth object exposed | FIXED | Auth state remains module-local. |
| Teacher replacement used `prompt()` | FIXED | Accessible dialog + textarea workflow. |
| Local leaderboard grows indefinitely | FIXED | Daily/weekly local history pruned; all-time retained. |
| Firestore raw score rows have no retention | FIXED | Weekly scheduled Admin cleanup prunes stale daily/weekly rows; all-time, eligibility, and archives retained. |

## Deliberately not claimed as automatically verified

- Actual feel of Dragon Dash collision/input on a student Chromebook.
- Actual Void Runner WebGL rendering and frame-rate on target Chromebook hardware.
- True cold-offline Void Runner launch after the online deployment step vendors Three.js.
- Real Google Workspace redirect behavior under the school's managed-browser policy.
- Real scheduled Firebase function execution after deployment.

Those are deployment/device validation tasks, not source-code assertions.
