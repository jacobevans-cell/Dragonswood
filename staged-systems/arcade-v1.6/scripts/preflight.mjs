import {existsSync,readFileSync,statSync} from 'node:fs';
import {resolve,dirname} from 'node:path';import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),site=resolve(root,'site');
let fail=0,warn=0;const good=m=>console.log('PASS',m),bad=m=>{console.error('FAIL',m);fail++},note=m=>{console.warn('WARN',m);warn++};
function file(rel,min=1){const p=resolve(root,rel);if(!existsSync(p)||statSync(p).size<min)bad(`${rel} missing or too small`);else good(rel)}
['site/index.html','site/admin.html','site/device-check.html','site/sw.js','site/manifest.webmanifest','site/games/dragon-dash/game.js','site/games/void-runner/js/game.js'].forEach(x=>file(x,100));
file('site/games/void-runner/vendor/three.module.js',10000);file('site/games/void-runner/vendor/three.core.js',10000);
const sw=readFileSync(resolve(site,'sw.js'),'utf8');for(const x of ['device-check.html','games/void-runner/js/cloud-sync.js','games/void-runner/js/runtime-config.js'])sw.includes(x)?good(`SW caches ${x}`):bad(`SW missing ${x}`);
const manifest=JSON.parse(readFileSync(resolve(site,'manifest.webmanifest'),'utf8'));for(const size of ['192x192','512x512'])manifest.icons?.some(i=>i.sizes===size)?good(`PWA ${size}`):bad(`PWA ${size} icon missing`);
const fn=JSON.parse(readFileSync(resolve(root,'functions/package.json'),'utf8'));fn.engines?.node==='22'?good('Functions Node 22'):bad('Functions must use Node 22');
const cfg=readFileSync(resolve(site,'js/arcade-config.js'),'utf8');cfg.includes("directGameRewardsEnabled: false")?good('Direct rewards disabled'):bad('Direct rewards boundary missing');
if(cfg.includes("firebase: {\n    enabled: false"))note('Firebase is disabled in the shipped example config. Enable/configure it before cloud leaderboard rollout.');
console.log(`\nPreflight: ${fail} failed, ${warn} warnings.`);if(fail)process.exit(1);
