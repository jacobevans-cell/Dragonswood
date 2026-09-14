/** Runtime-only sprite materials. Source artwork is never modified. */
import {viewFrame} from './roster-model.js?v=dragon-path-7';
const SKIN = {light:[214,130,90], medium:[153,79,52], deep:[90,47,37]};
const HAIR = {black:[49,46,60], brown:[114,72,51], purple:[120,82,160]};
const EYES = {green:[82,179,102], brown:[193,135,56], purple:[154,111,212]};
const clamp = (x, lo = 0, hi = 255) => Math.max(lo, Math.min(hi, x));
const luminance = (r,g,b) => r * .2126 + g * .7152 + b * .0722;
const frameCache = new Map();
const MAX_CACHED_FRAMES = 8;
const textureBuffers = new WeakMap();
const median = values => {
  values.sort((a,b) => a-b);
  const m = values.length >> 1;
  return values.length % 2 ? values[m] : (values[m-1] + values[m]) / 2;
};

// Warm skin gate rejects silver, dark ink, saturated blue and yellow-gold trim.
// The authored geometry remains authoritative: colors alone never define skin.
const isSkin = (r,g,b,maxWarmth=65) => r > 45 && r - g > 13 && r > g * 1.16
  && g > b * 1.055 && g - b < maxWarmth && r - g > (g - b) * .95;
const skinPixel = (r,g,b,metadata={}) => metadata.skinRelaxedHue
  ? r>45 && r>g+6 && g>b+3 && r>b+14
  : isSkin(r,g,b,metadata.skinMaxWarmth??65);
// Silver is painted with warm mauve shadow strokes as well as neutral light.
// Include those strokes so dark hair has no leftover pink flecks. Yellow gold
// still fails the blue/green ratio, and geometric masks exclude the costume.
const isSilver = (r,g,b) => Math.max(r,g,b) - Math.min(r,g,b) < 90
  && r <= g * 1.5 + 8 && b >= g * .9 && b >= r * .66
  && luminance(r,g,b) > 10;
const isBlueIris = (r,g,b) => b > r + 18 && g > r + 8 && b > g * .95
  && r < 210 && b - r > 35 && luminance(r,g,b) > 35;
const isHair = (r,g,b,source) => source==='brown'
  ? r>=g*.95&&r>=b&&r-b>3&&g-b<85&&luminance(r,g,b)>12
  : source==='black'
    ? luminance(r,g,b)>8&&luminance(r,g,b)<130&&Math.max(r,g,b)-Math.min(r,g,b)<85&&b>=g*.55
    : isSilver(r,g,b);

function backgroundSample(data, width, height) {
  const channels = [[],[],[]];
  for(const [cx,cy] of [[2,2],[width-3,2],[2,height-3],[width-3,height-3]]) {
    for(let dy=-2;dy<=2;dy++) for(let dx=-2;dx<=2;dx++) {
      const x=clamp(cx+dx,0,width-1),y=clamp(cy+dy,0,height-1),i=(y*width+x)*4;
      if(data[i+3]<128 || data[i+1]<data[i]+60 || data[i+1]<data[i+2]+60)continue;
      for(let c=0;c<3;c++)channels[c].push(data[i+c]);
    }
  }
  return channels[0].length ? channels.map(median) : [9,245,10];
}

/**
 * Key just the narrow green hue sector. Mixed edge pixels receive fractional
 * alpha and are unmixed against the sampled green backing, avoiding a green
 * fringe around white hair and pale cloth on a dark stage.
 */
export function keyGreenPixel(r,g,b,a=255,background=[9,245,10]) {
  if(a===0)return [0,0,0,0];
  // These masters have no green costume paint. Remove the full range of
  // near-pure generated backing before constructing a feathered edge matte.
  if(r<70 && b<70 && g>200)return [0,0,0,0];
  const max=Math.max(r,g,b),min=Math.min(r,g,b),range=max-min;
  if(g!==max || range<12 || g-Math.max(r,b)<10 || range/Math.max(1,max)<.18)
    return [r,g,b,a];
  const hue=120+60*(b-r)/Math.max(1,range);
  if(hue<95 || hue>145)return [r,g,b,a];
  const spill=g-Math.max(r,b);
  const backingExcess=Math.max(120,background[1]-Math.max(background[0],background[2]));
  const coverage=clamp(1-spill/backingExcess,0,1);
  if(coverage<.035)return [0,0,0,0];
  const out=[r,g,b].map((channel,c)=>clamp((channel-background[c]*(1-coverage))/coverage));
  // Numerical mismatch / backing variation must not leave excess green after
  // unmixing. Other channels and any preexisting source alpha are preserved.
  out[1]=Math.min(out[1],Math.max(out[0],out[2]));
  return [...out,a*coverage];
}

function markRect(flags,width,height,rect,bit) {
  const x0=clamp(Math.floor(rect[0]),0,width),y0=clamp(Math.floor(rect[1]),0,height);
  const x1=clamp(Math.ceil(rect[2]),0,width),y1=clamp(Math.ceil(rect[3]),0,height);
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)flags[y*width+x]|=bit;
}

// Scanline rasterization does the expensive polygon work once per master.
// Sampling at pixel centers gives stable edges independent of canvas scale.
function markPolygon(flags,width,height,polygon,bit) {
  if(!polygon || polygon.length<3)return;
  const start=clamp(Math.floor(Math.min(...polygon.map(p=>p[1]))),0,height);
  const stop=clamp(Math.ceil(Math.max(...polygon.map(p=>p[1]))),0,height);
  for(let y=start;y<stop;y++) {
    const intersections=[],sampleY=y+.5;
    for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
      const [x0,y0]=polygon[j],[x1,y1]=polygon[i];
      if((y0>sampleY)!==(y1>sampleY))intersections.push(x0+(sampleY-y0)*(x1-x0)/(y1-y0));
    }
    intersections.sort((a,b)=>a-b);
    for(let i=0;i+1<intersections.length;i+=2) {
      const left=clamp(Math.ceil(intersections[i]-.5),0,width);
      const right=clamp(Math.ceil(intersections[i+1]-.5),0,width);
      for(let x=left;x<right;x++)flags[y*width+x]|=bit;
    }
  }
}

function sampleSkin(data,width,height,point,skinIndices,metadata={}) {
  if(point)for(const radius of [4,12]) {
    const channels=[[],[],[]];
    const x0=clamp(Math.floor(point[0])-radius,0,width-1),x1=clamp(Math.floor(point[0])+radius,0,width-1);
    const y0=clamp(Math.floor(point[1])-radius,0,height-1),y1=clamp(Math.floor(point[1])+radius,0,height-1);
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++) {
      const i=(y*width+x)*4;
      if(data[i+3]>220 && skinPixel(data[i],data[i+1],data[i+2],metadata)) {
        for(let c=0;c<3;c++)channels[c].push(data[i+c]);
      }
    }
    if(channels[0].length>=3)return channels.map(median);
  }
  // A malformed / occluded sample does not turn the character black. Prefer
  // the actual cached skin region before falling back to a warm source tone.
  if(skinIndices.length) {
    const channels=[[],[],[]],step=Math.max(1,Math.floor(skinIndices.length/1000));
    for(let n=0;n<skinIndices.length;n+=step) {
      const i=skinIndices[n];
      if(data[i+3]>220)for(let c=0;c<3;c++)channels[c].push(data[i+c]);
    }
    if(channels[0].length)return channels.map(median);
  }
  return [190,126,95];
}

/**
 * Pure preparer for raw RGBA pixels; caches may retain this returned object.
 * Returns keyed pixels and compact byte-offset lists of paintable materials.
 */
export function prepareSpritePixels(source,width,height,metadata={}) {
  if(source.length!==width*height*4)throw new Error('Sprite pixel dimensions do not match RGBA data.');
  const data=new Uint8ClampedArray(source),flags=new Uint8Array(width*height);
  const background=backgroundSample(source,width,height);
  for(let i=0;i<data.length;i+=4) {
    const pixel=keyGreenPixel(data[i],data[i+1],data[i+2],data[i+3],background);
    data[i]=pixel[0];data[i+1]=pixel[1];data[i+2]=pixel[2];data[i+3]=pixel[3];
  }
  for(const rect of metadata.skinRects||[])markRect(flags,width,height,rect,1);
  for(const polygon of metadata.skinPolygons||[])markPolygon(flags,width,height,polygon,1);
  for(const polygon of metadata.hairPolygons||[])markPolygon(flags,width,height,polygon,2);
  for(const polygon of metadata.hairExcludePolygons||[])markPolygon(flags,width,height,polygon,8);
  for(const rect of metadata.eyeRects||[])markRect(flags,width,height,rect,4);
  const skin=[],hair=[],eyes=[];
  for(let pixel=0;pixel<flags.length;pixel++) {
    const bits=flags[pixel],i=pixel*4;
    if(!bits || data[i+3]<16)continue;
    const r=data[i],g=data[i+1],b=data[i+2];
    if((bits&4) && isBlueIris(r,g,b))eyes.push(i);
    else if((bits&1) && skinPixel(r,g,b,metadata))skin.push(i);
    else if((bits&2) && !(bits&8) && isHair(r,g,b,metadata.hairSource||'silver'))hair.push(i);
  }
  const hairLightness=[];
  if(metadata.hairSource&&metadata.hairSource!=='silver')for(let n=0;n<hair.length;n+=Math.max(1,Math.floor(hair.length/1500))) {
    const i=hair[n];hairLightness.push(luminance(data[i],data[i+1],data[i+2]));
  }
  return {
    width,height,data,background,
    skinIndices:Uint32Array.from(skin),hairIndices:Uint32Array.from(hair),eyeIndices:Uint32Array.from(eyes),
    sourceSkin:sampleSkin(data,width,height,metadata.skinSample,skin,metadata),
    hairSource:metadata.hairSource||'silver',sourceHairLum:hairLightness.length?Math.max(24,median(hairLightness)):210,
  };
}

/** Pure recolorer, optionally writing into an existing ImageData.data buffer. */
export function recolorSpritePixels(prepared,{skin='medium',hair='white',eyes='blue'}={},output) {
  const data=output||new Uint8ClampedArray(prepared.data.length);
  if(data.length!==prepared.data.length)throw new Error('Sprite output buffer has the wrong size.');
  data.set(prepared.data);
  const skinTarget=SKIN[skin]||SKIN.medium;
  for(const i of prepared.skinIndices)for(let c=0;c<3;c++) {
    data[i+c]=clamp(prepared.data[i+c]*skinTarget[c]/Math.max(1,prepared.sourceSkin[c]));
  }
  const hairTarget=HAIR[hair]||(hair==='white'&&prepared.hairSource!=='silver'?[217,213,229]:null);
  if(hairTarget)for(const i of prepared.hairIndices) {
    let lum=luminance(prepared.data[i],prepared.data[i+1],prepared.data[i+2]);
    if(prepared.hairSource!=='silver')lum=lum/prepared.sourceHairLum*155;
    const value=(lum/210)**1.08,specular=Math.max(0,lum-225)*.65;
    for(let c=0;c<3;c++)data[i+c]=clamp(hairTarget[c]*value+specular);
  }
  if(EYES[eyes])for(const i of prepared.eyeIndices) {
    const lum=luminance(prepared.data[i],prepared.data[i+1],prepared.data[i+2]);
    const value=lum/145,specular=Math.max(0,lum-180)*.35;
    for(let c=0;c<3;c++)data[i+c]=clamp(EYES[eyes][c]*value+specular);
  }
  return data;
}

/**
 * Compose directly into a reused Phaser CanvasTexture. Call with stable names
 * such as 'front-appearance' / 'rear-appearance': changing tier or palettes
 * creates no additional appearance GPU textures.
 */
export function makeSpriteAppearance(scene,masterKey,textureKey,metadata,selection) {
  const master=scene.textures.get(masterKey).getSourceImage();
  const sourceWidth=master.naturalWidth||master.width,sourceHeight=master.naturalHeight||master.height;
  const {x,y,width,height}=viewFrame(metadata,sourceWidth,sourceHeight);
  const signature=JSON.stringify({skinSample:metadata.skinSample,skinRects:metadata.skinRects,skinMaxWarmth:metadata.skinMaxWarmth,skinPolygons:metadata.skinPolygons,skinRelaxedHue:metadata.skinRelaxedHue,
    eyeRects:metadata.eyeRects,hairPolygons:metadata.hairPolygons,hairExcludePolygons:metadata.hairExcludePolygons,hairSource:metadata.hairSource});
  const cacheKey=`${masterKey}|${sourceWidth},${sourceHeight}|${x},${y},${width},${height}|${signature}`;
  let cached=frameCache.get(cacheKey);
  if(!cached) {
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const context=canvas.getContext('2d',{willReadFrequently:true});
    // This is standard runtime sprite-atlas sampling; the master stays intact.
    context.drawImage(master,x,y,width,height,0,0,width,height);
    const pixels=context.getImageData(0,0,width,height);
    cached={prepared:prepareSpritePixels(pixels.data,width,height,metadata)};
    // The cached material pixels outlive this temporary sampling canvas.
    canvas.width=0;canvas.height=0;
  }
  frameCache.delete(cacheKey);frameCache.set(cacheKey,cached);
  while(frameCache.size>MAX_CACHED_FRAMES)frameCache.delete(frameCache.keys().next().value);
  let texture=scene.textures.exists(textureKey)?scene.textures.get(textureKey):null;
  if(texture && (typeof texture.getContext!=='function' || typeof texture.refresh!=='function'))
    throw new Error(`Appearance texture ${textureKey} must be a Phaser CanvasTexture.`);
  if(!texture)texture=scene.textures.createCanvas(textureKey,width,height);
  if(texture.width!==width || texture.height!==height)texture.setSize(width,height);
  const context=texture.getContext();
  let image=textureBuffers.get(texture);
  if(!image || image.width!==width || image.height!==height) {
    image=context.createImageData(width,height);textureBuffers.set(texture,image);
  }
  recolorSpritePixels(cached.prepared,selection,image.data);
  context.putImageData(image,0,0);texture.refresh();
  return texture;
}

export function getSpriteAppearanceCacheStats(){return {frames:frameCache.size,limit:MAX_CACHED_FRAMES};}
export function clearSpriteAppearanceCache(){frameCache.clear();}
