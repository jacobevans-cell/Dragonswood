const PRESETS={royal:{name:'Royal Blue',primary:'#1769d2',secondary:'#f4c85a',glow:'#54d9ff'},emerald:{name:'Emerald',primary:'#238957',secondary:'#e7ce62',glow:'#7cf3b4'},crimson:{name:'Crimson',primary:'#b9353d',secondary:'#f4c35a',glow:'#ff8a72'},arcane:{name:'Arcane Purple',primary:'#713fc1',secondary:'#d4c7ff',glow:'#63e8ff'},aqua:{name:'Sanctuary Aqua',primary:'#2d9eaa',secondary:'#f5d889',glow:'#7ff5e4'},amber:{name:'Amber & Navy',primary:'#c66a20',secondary:'#173f73',glow:'#ffd56a'},rose:{name:'Rose Gold',primary:'#b64c86',secondary:'#efc86c',glow:'#ff9dda'},obsidian:{name:'Obsidian Gold',primary:'#303142',secondary:'#d4aa50',glow:'#a184ff'},sunlight:{name:'Sunlight',primary:'#dfa72c',secondary:'#f7f2dc',glow:'#fff19a'},frost:{name:'Frost',primary:'#3d79c9',secondary:'#d9f1ff',glow:'#93f3ff'},forest:{name:'Forest Night',primary:'#255a40',secondary:'#c9b06e',glow:'#66d7a2'},violet:{name:'Violet Gold',primary:'#71358c',secondary:'#e6bd59',glow:'#d69aff'}};
const CLASS_DEFAULT={warrior:'crimson',ranger:'emerald',mage:'arcane',healer:'aqua'};
const MAX_RESULT_CACHE=40,MAX_IMAGE_CACHE=64,cache=new Map(),imgs=new Map();
const HEX=/^#[0-9a-f]{6}$/i;
let outputCanvas=null,maskCanvas=null;

function touch(map,key,value){map.delete(key);map.set(key,value)}
function remember(map,key,value,limit){touch(map,key,value);while(map.size>limit)map.delete(map.keys().next().value);return value}
function safePalette(value){const p=value&&typeof value==='object'?value:PRESETS.royal;return{primary:HEX.test(p.primary||'')?p.primary:PRESETS.royal.primary,secondary:HEX.test(p.secondary||'')?p.secondary:PRESETS.royal.secondary,glow:HEX.test(p.glow||'')?p.glow:PRESETS.royal.glow}}
function rgb(hex){const h=hex.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function colorAtLightness(target,lightness){const factor=lightness<.5?.58+lightness*.85:.8+(lightness-.5)*.42;return target.map(value=>Math.max(0,Math.min(255,Math.round(value*factor))))}
function load(url){if(imgs.has(url)){const hit=imgs.get(url);touch(imgs,url,hit);return hit}const promise=new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=error=>{imgs.delete(url);reject(error)};image.src=url});return remember(imgs,url,promise,MAX_IMAGE_CACHE)}
function canvases(width,height){outputCanvas=outputCanvas||document.createElement('canvas');maskCanvas=maskCanvas||document.createElement('canvas');outputCanvas.width=maskCanvas.width=width;outputCanvas.height=maskCanvas.height=height;return{outputCanvas,maskCanvas}}

export const PALETTES=PRESETS;
export const CLASS_DEFAULT_PALETTE=CLASS_DEFAULT;
export const PALETTE_CACHE_LIMITS=Object.freeze({results:MAX_RESULT_CACHE,images:MAX_IMAGE_CACHE});
export function paletteObject(id,custom){return safePalette(id==='custom'?custom:PRESETS[id]||PRESETS.royal)}
export async function paletteSwapMasked(baseUrl,maskUrls,palette){
  const normalized=safePalette(typeof palette==='string'?PRESETS[palette]:palette),key=baseUrl+'|'+JSON.stringify(normalized);
  if(cache.has(key)){const hit=cache.get(key);touch(cache,key,hit);return hit}
  const [image,...maskImages]=await Promise.all([load(baseUrl),...maskUrls.map(load)]),{outputCanvas:canvas,maskCanvas:scratch}=canvases(image.naturalWidth,image.naturalHeight),context=canvas.getContext('2d',{willReadFrequently:true}),scratchContext=scratch.getContext('2d',{willReadFrequently:true});
  context.clearRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0);
  const data=context.getImageData(0,0,canvas.width,canvas.height),pixels=data.data,targets=[rgb(normalized.primary),rgb(normalized.secondary),rgb(normalized.glow)],masks=[];
  for(const maskImage of maskImages){scratchContext.clearRect(0,0,scratch.width,scratch.height);scratchContext.drawImage(maskImage,0,0,scratch.width,scratch.height);masks.push(scratchContext.getImageData(0,0,scratch.width,scratch.height).data)}
  for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]<8)continue;const lightness=(pixels[i]+pixels[i+1]+pixels[i+2])/765;for(let channel=0;channel<3;channel++){const strength=(masks[channel][i+3]/255)*.84;if(strength<.01)continue;const color=colorAtLightness(targets[channel],lightness);pixels[i]=pixels[i]*(1-strength)+color[0]*strength;pixels[i+1]=pixels[i+1]*(1-strength)+color[1]*strength;pixels[i+2]=pixels[i+2]*(1-strength)+color[2]*strength}}
  context.putImageData(data,0,0);
  return remember(cache,key,canvas.toDataURL('image/webp',.94),MAX_RESULT_CACHE);
}
