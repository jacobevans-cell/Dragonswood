import{paletteSwapMasked,paletteObject}from"./kingdom-palette-engine.mjs";
const F={keep:"keep",walls:"walls-gates",watchtower:"watchtower",rangerTower:"ranger-tower",mageTower:"mage-tower",creatureDen:"creature-den",lumberMill:"lumber-mill",quarry:"quarry",essenceWell:"essence-well",petStable:"pet-stable-hatchery"};
const P={walls:[50,59,61,1],keep:[50,48,43,3],watchtower:[13,40,18,2],rangerTower:[87,40,18,2],mageTower:[76,20,20,2],creatureDen:[84,74,18,4],lumberMill:[25,76,19,4],quarry:[8,76,18,4],essenceWell:[62,78,16,4],petStable:[75,76,17,4]};
const N={dark:"Dark Keep",dragon:"Dragon Nest",bright:"Bright Keep"},E={1:"Frontier Camp",2:"Woodland Keep",3:"Fortified Castle",4:"Great Stronghold",5:"Legendary Citadel"};
const W=new Set(["walls","watchtower","rangerTower","mageTower"]),BC=new Set(["creatureDen","petStable","lumberMill","quarry","essenceWell"]);let token=0;
function bg(){return`<svg viewBox="0 0 1000 560" preserveAspectRatio="none"><defs><linearGradient id="s" x2="1" y2="1"><stop stop-color="#0b0c2d"/><stop offset=".55" stop-color="#1c1746"/><stop offset="1" stop-color="#082237"/></linearGradient><linearGradient id="g"><stop stop-color="#28523b"/><stop offset="1" stop-color="#102f27"/></linearGradient></defs><rect width="1000" height="560" fill="url(#s)"/><circle cx="858" cy="91" r="48" fill="#fff4c7" opacity=".12"/><path d="M0 292 100 200 190 277 314 156 440 277 560 196 682 282 806 164 912 255 1000 205V376H0Z" fill="#151a3e"/><path d="M0 329 138 247 250 332 392 228 523 337 666 249 802 338 936 240 1000 299V390H0Z" fill="#17283a"/><path d="M0 333Q320 300 530 338T1000 313V560H0Z" fill="url(#g)"/></svg>`}
function assetRoot(style,id,lvl){
 if(id==="keep")return`kingdom-wars/keep-production/keeps/${style}/level-${lvl}`;
 if(W.has(id))return`kingdom-wars/wave-a-production/assets/${F[id]}/${style}/level-${lvl}`;
 if(BC.has(id))return`kingdom-wars/wave-bc-production/assets/${F[id]}/${style}/level-${lvl}`;
 throw new Error(`Unknown Kingdom Wars building asset: ${id}`);
}
function assets(style,id,lvl,state){const root=assetRoot(style,id,lvl);return{url:`${root}/${state}.webp`,masks:state==="destroyed"?null:["primary","secondary","glow"].map(x=>`${root}/mask-${x}.png`)}}
function ambient(style){
 const pts=[[8,22],[16,61],[24,34],[34,18],[43,67],[53,27],[61,57],[72,17],[81,47],[90,29],[94,68],[68,76]];
 return`<div class="kw-life-ambient kw-life-${style}">${pts.map((p,i)=>`<i class="kw-life-mote m${i%4}" style="left:${p[0]}%;top:${p[1]}%;--delay:${(i*.37).toFixed(2)}s"></i>`).join("")}<i class="kw-life-drift d1"></i><i class="kw-life-drift d2"></i></div>`;
}
function lifeMarkup(id,lvl,state){if(state==="destroyed")return"";const L=Math.max(1,lvl);
 if(id==="lumberMill")return`<div class="kw-life-hotspot kw-life-mill"><i></i><b></b></div>`;
 if(id==="essenceWell")return`<div class="kw-life-hotspot kw-life-well"><i></i><i></i><i></i><b></b></div>`;
 if(id==="mageTower")return`<div class="kw-life-hotspot kw-life-magic">${Array.from({length:Math.min(5,2+L)},(_,i)=>`<i style="--i:${i}"></i>`).join("")}</div>`;
 if(id==="petStable")return`<div class="kw-life-hotspot kw-life-hatch"><i></i><i></i><i></i></div>`;
 if(id==="creatureDen")return`<div class="kw-life-hotspot kw-life-den"><i></i><i></i></div>`;
 if(id==="quarry")return`<div class="kw-life-hotspot kw-life-quarry"><i></i><i></i><i></i></div>`;
 if(id==="keep")return`<div class="kw-life-hotspot kw-life-smoke"><i></i><i></i><i></i></div>`;
 if(id==="watchtower"||id==="rangerTower"||id==="walls")return`<div class="kw-life-hotspot kw-life-flag"><i></i></div>`;
 return"";
}
export const STYLE_LABELS=N;
export async function renderStyledKingdom(h,{buildings:b,buildingStates=null,style="dragon",paletteId="royal",customPalette,condition="actual",focusId=""}){
 style=Object.prototype.hasOwnProperty.call(N,style)?style:'dragon';
 const t=++token,pal=paletteObject(paletteId,customPalette),keep=Math.max(1,Math.min(5,+b.keep||1));
 h.innerHTML=`<div class="kw4-world kw-condition-${condition}" style="--kw-primary:${pal.primary};--kw-secondary:${pal.secondary};--kw-glow:${pal.glow}"><div class="kw4-bg">${bg()}</div>${ambient(style)}<div class="kw4-aura"></div><div class="kw4-assets"></div><div class="kw4-world-title"><b>${N[style]}</b><span>${E[keep]} • Keep L${keep}</span></div></div>`;
 const L=h.querySelector(".kw4-assets");
 for(const[id,[x,y,w,z]]of Object.entries(P).sort((a,b)=>a[1][3]-b[1][3])){
   const lvl=Math.max(id==="keep"||id==="walls"?1:0,Math.min(5,+b[id]||0));if(!lvl)continue;
   const actual=buildingStates?.[id]?.state||"healthy",effective=condition&&condition!=="actual"?condition:actual,st=effective==="destroyed"?"destroyed":effective==="damaged"||effective==="burning"||effective==="repair"?"damaged":"healthy",A=assets(style,id,lvl,st),wrap=document.createElement("div");
   wrap.className=`kw4-building kw4-${id} kw-life-building ${focusId===id?"focus":""} ${effective==="damaged"?"damaged":""}`;wrap.dataset.condition=effective;wrap.style.cssText=`left:${x}%;top:${y}%;width:${w}%;z-index:${z}`;
   const im=document.createElement("img");im.alt=`${F[id]} level ${lvl}`;im.draggable=false;wrap.appendChild(im);wrap.insertAdjacentHTML("beforeend",lifeMarkup(id,lvl,st));L.appendChild(wrap);
   try{const src=A.masks?await paletteSwapMasked(A.url,A.masks,pal):A.url;if(t!==token)return;im.src=src}catch{if(t!==token)return;im.src=A.url}
   if(effective==="burning"){const fx=document.createElement("img");fx.className="kw4-effect fire";fx.src="kingdom-wars/keep-production/effects/fire.gif";wrap.appendChild(fx)}
   else if(effective==="repair"){const fx=document.createElement("img");fx.className="kw4-effect repair";fx.src="kingdom-wars/keep-production/effects/repair.gif";wrap.appendChild(fx);wrap.classList.add("repairing")}
 }
}
