# Optional local Three.js

The game first checks for `vendor/three.module.js`. If it is not present, it falls back to jsDelivr, unpkg, then esm.sh for Three.js 0.185.1.

For a completely network-independent build, place the official `three.module.js` for npm package `three@0.185.1` in this directory and retain the MIT license in `THREE-LICENSE.txt`.
