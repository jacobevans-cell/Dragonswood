# CHROMEBOOK ROLLOUT — GO / NO-GO CHECKLIST

Use the **deployed** site, not the single-file TEST-NOW artifact, for this gate.

## Before deploying
- [ ] Set Firebase configuration if cloud leaderboard/sync is required.
- [ ] Confirm Firebase Anonymous Auth is enabled for student leaderboard identity.
- [ ] Confirm teacher Google sign-in authorized domains include the production host.
- [ ] Run `node scripts/vendor-three.mjs`.
- [ ] Run `node scripts/preflight.mjs --strict`. It must exit 0.
- [ ] Deploy Hosting/Pages, Firestore rules/indexes, and Functions from this same package.

## One real managed student Chromebook
- [ ] Open `/device-check.html`.
- [ ] No red checks. Hardware warning is acceptable; Auto Performance should choose Chromebook Low when appropriate.
- [ ] Open Dragonswood Arcade in a normal browser tab.
- [ ] Launch Dragon Dash; verify Space/click/touch input and restart.
- [ ] Launch Void Runner; verify 3D tunnel renders, A/D, jump, wall rotation, and falling panels.
- [ ] Verify Settings → Performance says Auto → Standard or Auto → Chromebook Low.
- [ ] Play Void Runner for at least 3 minutes. No persistent stutter, tab crash, black canvas, or input lag.
- [ ] If Auto drops the renderer to Chromebook Low, keep it there. That is expected behavior, not a failure.
- [ ] Return to `/device-check.html` and click **Prime offline cache**.
- [ ] Reload the arcade once while online.
- [ ] Turn Wi‑Fi off.
- [ ] Cold-open/reload the arcade.
- [ ] Dragon Dash launches offline.
- [ ] Void Runner launches offline using local vendored Three.js.
- [ ] Local progress survives a reload.
- [ ] Turn Wi‑Fi back on; cloud/leaderboard status recovers without losing local progress.

## Small classroom pilot
- [ ] Test on 3–5 student Chromebooks at the same time.
- [ ] Confirm Firebase reads/writes and leaderboard updates are not blocked by the school network.
- [ ] Confirm teacher review login works on the managed teacher account.
- [ ] Confirm no student can create direct reward/class-point writes.

## Full rollout GO criteria
All of the above pass. If Void Runner fails but Dragon Dash works, do **not** disable the entire arcade: use `/device-check.html` to identify WebGL/vendor/cache/network failure and keep Dragon Dash available.
