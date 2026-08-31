# Dragonswood site-wide cache update

This update prevents old browser-cached code and narration manifests from
surviving a normal Dragonswood reload.

## What it changes

- The student and teacher portals register one root Dragonswood service worker.
- Every push or pull-request merge into `main` publishes a tiny version signal
  after the Pages deployment has had time to finish.
- Open Dragonswood tabs show **Update ready** with **Update now** and **Later**.
- HTML, JavaScript, CSS, JSON, and narration manifests use a network-first
  strategy that bypasses stale browser cache entries.
- Images and fonts remain reusable and refresh in the background.
- Audio and video stay in the browser HTTP cache instead of being duplicated in
  Cache Storage. Brian MP3 URLs contain their text hash, so unchanged narration
  is reused and changed narration receives a new URL.
- Direct lesson pages that load `dragonswood-narrator.js` also install the root
  updater.
- Arcade and Dragon Tongues retain their specialized offline workers without
  deleting the central site cache.

The first visit after this update may reload once automatically while the root
worker takes control. Future normal page loads receive fresh site code without
requiring Ctrl+Shift+R. Work on separate branches does not show the update
message until it is merged into `main`.

## What it does not change

- It does not deploy the changing-text Firebase narration function.
- It does not call Azure or create new MP3 files.
- It does not clear student progress, authentication, or local settings.

## Verification

```bash
npm run narration:plan
npm run narration:audit
npm run site-cache:audit
```

The narration plan should report 89 reusable clips and zero clips to generate.
