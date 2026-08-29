const CACHE='dragonswood-arcade-v12-native-portal';
const CORE=[
  './','index.html','admin.html','device-check.html','style.css','access.css','manifest.webmanifest',
  'assets/dragonswood-arcade-crest.svg','assets/dragon-cube.svg','assets/dragon-runner.svg','assets/arcade-stars.svg',
  'assets/pwa-icon-192.png','assets/pwa-icon-512.png','assets/pwa-maskable-512.png',
  'js/arcade-config.js','js/access-client.js','js/access-bootstrap.js','js/game-registry.js','js/leaderboard-service.js','js/arcade.js',
  'games/dragon-dash/index.html','games/dragon-dash/access-loader.js','games/dragon-dash/styles.css','games/dragon-dash/dragonswood-theme.css','games/dragon-dash/game.js',
  'games/dragon-dash/assets/cube-dragon.svg','games/dragon-dash/assets/orb.svg','games/dragon-dash/assets/pad.svg','games/dragon-dash/assets/portal.svg','games/dragon-dash/assets/saw.svg','games/dragon-dash/assets/spike.svg',
  'games/void-runner/index.html','games/void-runner/style.css','games/void-runner/dragonswood-theme.css',
  'games/void-runner/js/access-loader.js','games/void-runner/js/game.js','games/void-runner/js/three-loader.js','games/void-runner/js/cloud-sync.js','games/void-runner/js/runtime-config.js',
  'games/void-runner/assets/icon.svg','games/void-runner/assets/power-cell.svg',
  'games/void-runner/assets/runner-scout.svg','games/void-runner/assets/runner-skimmer.svg','games/void-runner/assets/runner-hopper.svg','games/void-runner/assets/runner-drifter.svg','games/void-runner/assets/runner-cloudwing.svg','games/void-runner/assets/runner-goldwing.svg','games/void-runner/assets/runner-bumblewing.svg','games/void-runner/assets/runner-frostwing.svg','games/void-runner/assets/runner-lanternwing.svg','games/void-runner/assets/runner-currentwing.svg','games/void-runner/assets/runner-runewing.svg','games/void-runner/assets/runner-skywing.svg'
];
const OPTIONAL=['games/void-runner/vendor/three.module.js','games/void-runner/vendor/three.core.js'];
self.addEventListener('install',e=>e.waitUntil((async()=>{const c=await caches.open(CACHE);await c.addAll(CORE);await Promise.all(OPTIONAL.map(async p=>{try{await c.add(p)}catch(err){console.warn('Optional offline asset not present yet:',p)}}));await self.skipWaiting()})()));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r.ok&&new URL(e.request.url).origin===location.origin){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r}).catch(()=>hit)))})
