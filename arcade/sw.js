const CACHE='dragonswood-arcade-v19-definitive-header';
const CORE=[
  './','index.html','admin.html','device-check.html','style.css','access.css','visual-v11.css','veil-game-card-tiles.css','manifest.webmanifest',
  '../v33-integration/assets/branding/dragonswood-mascot-crest.png','assets/dragon-cube.svg','assets/dragon-runner.svg','assets/arcade-stars.svg',
  'assets/veil/hero/dragonswood-arcade-header-definitive-v1.webp',
  'assets/veil/game-card-tiles/veil-card-bg-dragon-dash-1200x660.webp','assets/veil/game-card-tiles/veil-card-bg-void-runner-1200x660.webp',
  'assets/veil/game-card-tiles/veil-card-bg-runeball-arena-1200x660.webp','assets/veil/game-card-tiles/veil-card-bg-runewheel-rally-1200x660.webp',
  'assets/veil/game-card-tiles/veil-card-bg-dragons-gambit-hall-1200x660.webp','assets/veil/game-card-tiles/veil-card-bg-starfall-squadron-1200x660.webp',
  'assets/veil/game-card-tiles/veil-card-bg-defenders-of-dragonswood-1200x660.webp',
  'js/arcade-config.js','js/access-client.js','js/access-bootstrap.js','js/game-registry.js','js/leaderboard-service.js','js/arcade.js',
  'games/dragon-dash/index.html','games/dragon-dash/access-loader.js','games/dragon-dash/styles.css','games/dragon-dash/dragonswood-theme.css','games/dragon-dash/game.js',
  'games/dragon-dash/assets/cube-dragon.svg','games/dragon-dash/assets/orb.svg','games/dragon-dash/assets/pad.svg','games/dragon-dash/assets/portal.svg','games/dragon-dash/assets/saw.svg','games/dragon-dash/assets/spike.svg',
  'games/void-runner/index.html','games/void-runner/style.css','games/void-runner/dragonswood-theme.css',
  'games/void-runner/js/access-loader.js','games/void-runner/js/game.js','games/void-runner/js/three-loader.js','games/void-runner/js/cloud-sync.js','games/void-runner/js/runtime-config.js',
  'games/void-runner/assets/icon.svg','games/void-runner/assets/power-cell.svg',
  'games/void-runner/assets/runner-scout.svg','games/void-runner/assets/runner-skimmer.svg','games/void-runner/assets/runner-hopper.svg','games/void-runner/assets/runner-drifter.svg','games/void-runner/assets/runner-cloudwing.svg','games/void-runner/assets/runner-goldwing.svg','games/void-runner/assets/runner-bumblewing.svg','games/void-runner/assets/runner-frostwing.svg','games/void-runner/assets/runner-lanternwing.svg','games/void-runner/assets/runner-currentwing.svg','games/void-runner/assets/runner-runewing.svg','games/void-runner/assets/runner-skywing.svg'
];
const OPTIONAL=['games/void-runner/vendor/three.module.js','games/void-runner/vendor/three.core.js'];

self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(CORE);
  await Promise.all(OPTIONAL.map(async path=>{try{await cache.add(path)}catch(err){console.warn('Optional offline asset not present:',path,err)}}));
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key!==CACHE&&key.startsWith('dragonswood-arcade-')).map(key=>caches.delete(key)));
  await self.clients.claim();
})()));
self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting()});

async function networkFirst(request){
  const cache=await caches.open(CACHE);
  try{
    const response=await fetch(request);
    if(response.ok)cache.put(request,response.clone());
    return response;
  }catch(err){
    const cached=await cache.match(request);
    if(cached)return cached;
    throw err;
  }
}
async function staleWhileRevalidate(request){
  const cache=await caches.open(CACHE);
  const cached=await cache.match(request);
  const update=fetch(request).then(response=>{
    if(response.ok)cache.put(request,response.clone());
    return response;
  });
  if(cached){update.catch(()=>{});return cached}
  return update;
}
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  const freshCode=event.request.mode==='navigate'||['script','style','worker'].includes(event.request.destination)||/\.(?:js|mjs|css|html)$/.test(url.pathname);
  event.respondWith(freshCode?networkFirst(event.request):staleWhileRevalidate(event.request));
});
