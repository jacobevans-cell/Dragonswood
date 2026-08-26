# Deployment Checklist — v1.5

- [ ] Upload package contents to repository root.
- [ ] Confirm GitHub Actions runs **Vendor pinned Three.js for offline school devices** successfully.
- [ ] Confirm published site contains `games/void-runner/vendor/three.module.js` and `three.core.js`.
- [ ] Confirm service worker reports cache `dragonswood-arcade-v6`.
- [ ] Confirm PWA install is offered and 192/512 PNG icons load.
- [ ] Test a cold offline launch of **both** games after one successful online install/update.
- [ ] Test Comfort Mode and device Reduced Motion preference.
- [ ] Test keyboard focus visibility throughout shell and teacher review.
- [ ] Test long student names (>32 chars) and URL-supplied `studentId` persistence.
- [ ] Test score 0 and best-score replacement behavior.
- [ ] Add Firebase web config and enable Authentication.
- [ ] Deploy Firestore rules and indexes.
- [ ] Add teacher/admin custom claims before using `admin.html`.
- [ ] Confirm Google teacher sign-in returns correctly after redirect.
- [ ] Deploy scheduled functions under Node 22.
- [ ] Verify daily eligibility, weekly archives, and score-retention scheduler in Firebase logs.
- [ ] Keep direct game rewards and direct class-point writes disabled.
- [ ] Test real gameplay/collision/touch feel on a student Chromebook; automated syntax tests are not a substitute for this.

## v1.6 mandatory production gate
1. `node scripts/vendor-three.mjs`
2. `node scripts/preflight.mjs --strict`
3. Deploy.
4. Open `/device-check.html` on a managed student Chromebook.
5. Complete `CHROMEBOOK-ROLLOUT-CHECKLIST.md`, including the Wi‑Fi-off cold-start test.
