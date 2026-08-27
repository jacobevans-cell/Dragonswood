# Three.js local vendor behavior

Void Runner requires Three.js 0.185.1. v1.5 makes local/offline Three.js a deployment invariant rather than relying on school devices to reach public CDNs.

The source ZIP intentionally pins the dependency in `vendor-deps/package.json`. Before a hosted deploy:

- GitHub Pages workflow runs `node scripts/vendor-three.mjs` automatically.
- Firebase Hosting `predeploy` runs the same script automatically.
- The script installs exactly `three@0.185.1` and copies `three.module.js` plus `three.core.js` into `site/games/void-runner/vendor/`.
- Void Runner still has CDN fallbacks for resilience, but deployed Chromebooks should normally load the local copy.

This build environment had no outbound package-network access, so the generated ZIP cannot truthfully claim the npm library bytes were downloaded here. The deployment pipeline is what creates and verifies that local copy. If manually uploading only `site/` to a host without running a build step, run `node scripts/vendor-three.mjs` first from the package root.
