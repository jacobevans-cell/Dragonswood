import {existsSync,mkdirSync,copyFileSync,statSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const deps=resolve(root,'vendor-deps');
const dest=resolve(root,'site/games/void-runner/vendor');
const cache=process.env.DW_ARCADE_NPM_CACHE||resolve(root,'.npm-cache');
const sources=['three.module.js','three.core.js'];
function ready(){return sources.every(f=>{const p=resolve(dest,f);return existsSync(p)&&statSync(p).size>10000})}
if(!ready()){
  const npm=process.platform==='win32'?'npm.cmd':'npm';
  const run=spawnSync(npm,['install','--prefix',deps,'--no-audit','--no-fund','--ignore-scripts','--cache',cache],{stdio:'inherit'});
  if(run.status!==0)throw new Error('Could not install pinned Three.js dependency.');
  mkdirSync(dest,{recursive:true});
  for(const f of sources)copyFileSync(resolve(deps,'node_modules/three/build',f),resolve(dest,f));
}
console.log('Three.js 0.185.1 vendored for offline Void Runner use.');
