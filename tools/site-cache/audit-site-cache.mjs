#!/usr/bin/env node
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const read=path=>readFile(resolve(root,path),"utf8");
const [client,worker,index,teacher,narrator,generator,manifest,arcadeWorker,tonguesWorker,versionWorkflow]=await Promise.all([
  read("dragonswood-site-cache.js"),read("dragonswood-sw.js"),read("index.html"),read("teacher.html"),
  read("dragonswood-narrator.js"),read("tools/narration/generate-azure-brian.mjs"),
  read("narration-manifest.generated.json").then(JSON.parse),read("arcade/sw.js"),read("dragon-tongues/service-worker.js"),
  read(".github/workflows/publish-site-version.yml")
]);

assert.match(index,/dragonswood-site-cache\.js[^>]+data-dw-site-cache/,"student portal must install the site updater");
assert.match(teacher,/dragonswood-site-cache\.js[^>]+data-dw-site-cache/,"teacher portal must install the site updater");
assert.match(client,/updateViaCache:\s*"none"/,"worker updates must bypass the browser's script cache");
assert.match(client,/serviceWorker\.register/,"site updater must register the root worker");
assert.match(client,/Dragonswood update ready/,"site updater must present an update-ready message");
assert.match(client,/data-dw-update-now/,"site updater must offer Update now");
assert.match(client,/data-dw-update-later/,"site updater must offer Later");
assert.match(client,/automation\/site-version/,"site updater must read the deployment version signal");
assert.match(worker,/cache:\s*"reload"/,"code requests must bypass stale browser caches");
assert.match(worker,/request\.headers\.has\("range"\)/,"range requests must bypass Cache Storage");
assert.match(worker,/\["audio","video"\]/,"large media must not be duplicated in Cache Storage");
assert.match(worker,/staleWhileRevalidate/,"images and fonts should remain reusable while updating in the background");
assert.match(narrator,/narration-manifest\.generated\.json/,"Brian must refresh its manifest independently of an old script tag");
assert.match(narrator,/new URL\(value,assetRoot\)/,"Brian audio paths must resolve from the repository root even when a page uses <base>");
assert.match(generator,/versionedSource/,"generated Brian sources must carry content hashes");
assert.match(arcadeWorker,/networkFirst/,"Arcade must retain its specialized fresh-code worker");
assert.match(arcadeWorker,/staleWhileRevalidate/,"Arcade images must refresh without losing offline reuse");
assert.match(tonguesWorker,/fetch\(event\.request\)/,"Dragon Tongues must retain its network-first offline worker");
assert.match(tonguesWorker,/key\.startsWith\(CACHE_PREFIX\)/,"Dragon Tongues must not delete other Dragonswood caches");
assert.match(versionWorkflow,/branches:\s*\n\s*- main/,"site version workflow must run only for main pushes");
assert.match(versionWorkflow,/automation\/site-version/,"site version workflow must publish to the dedicated version branch");

const clips=Object.entries(manifest.clips||{});
assert.ok(clips.length>0,"narration manifest must contain generated clips");
for(const [id,clip] of clips){
  const source=String(clip.sources?.[manifest.voices?.[clip.defaultVoice]?clip.defaultVoice:"us-brian"]||clip.sources?.["us-brian"]||"");
  assert.ok(source.includes(`?h=${clip.hash}`),`${id} must use its text hash in the MP3 URL`);
}

console.log(JSON.stringify({
  siteCache:"ready",
  portals:["student","teacher"],
  codeStrategy:"network-first",
  mediaStrategy:"HTTP cache for audio/video; stale-while-revalidate for images/fonts",
  brianClips:clips.length,
  hashedBrianSources:true,
  updatePopup:["Update now","Later"],
  versionTrigger:"push to main",
  dynamicFirebaseNarration:"unchanged"
},null,2));
