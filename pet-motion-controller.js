(function(){
  "use strict";
  const reduced=()=>window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const aliases={
    idle:["idle","animatedArt","art"],play:["play","jump","walk","fly","run","special","attack","idle"],
    ability:["ability","special","attack","throw","bite","defend","jump","idle"],attack:["attack","ability","special","throw","bite","jump","idle"],
    hurt:["hurt","defend","hide","idle"],defend:["defend","hide","hurt","idle"],celebrate:["celebrate","jump","play","fly","attack","idle"],sleep:["sleep","idle"],walk:["walk","run","fly","idle"]
  };
  function candidates(pet,state){const motion=pet&&pet.motion||{};return(aliases[state]||aliases.idle).map(key=>key==="animatedArt"?pet.animatedArt:key==="art"?pet.art:motion[key]).filter(Boolean)}
  function sourceFor(pet,state){if(!pet)return"";if(reduced())return pet.art||pet.animatedArt||"";return candidates(pet,state)[0]||pet.animatedArt||pet.art||""}
  function labelFor(pet,state){const words=(pet&&Array.isArray(pet.animations)?pet.animations:[]).map(x=>String(x).toLowerCase()),wanted=(aliases[state]||[]).filter(x=>!["art","animatedArt","idle"].includes(x)),matched=wanted.find(x=>words.some(w=>w.includes(x)));return matched||((state==="ability")?"companion spirit":state)}
  class PetActor{
    constructor(host,pet,options={}){this.host=typeof host==="string"?document.querySelector(host):host;this.pet=pet;this.options=options;this.timer=0;this.img=null;if(this.host&&pet)this.mount()}
    mount(){if(!this.host||!this.pet)return;this.host.innerHTML="";this.host.classList.add("dw-pet-actor");const img=document.createElement("img");img.className="dw-pet-actor-art";img.alt=this.pet.name+" — active companion";img.decoding="async";this.host.appendChild(img);this.img=img;if(this.options.caption){const cap=document.createElement("div");cap.className="dw-pet-actor-caption";cap.textContent=this.pet.name;this.host.appendChild(cap)}this.play("idle",0)}
    setPet(pet){this.pet=pet;this.mount();return this}
    play(state="idle",duration=900){if(!this.img||!this.pet)return Promise.resolve(false);clearTimeout(this.timer);this.host.dataset.petState=state;this.host.classList.remove("dw-pet-pop");void this.host.offsetWidth;this.host.classList.add("dw-pet-pop");const src=sourceFor(this.pet,state);if(src&&this.img.getAttribute("src")!==src)this.img.src=src;this.host.setAttribute("aria-label",`${this.pet.name} performs ${labelFor(this.pet,state)}`);if(duration>0&&state!=="idle")this.timer=setTimeout(()=>this.play("idle",0),duration);return Promise.resolve(true)}
    destroy(){clearTimeout(this.timer);if(this.host)this.host.innerHTML=""}
  }
  function installStyles(){if(document.getElementById("dw-pet-motion-style"))return;const s=document.createElement("style");s.id="dw-pet-motion-style";s.textContent=`
    .dw-pet-actor{display:grid;place-items:center;position:relative;min-height:96px;isolation:isolate}.dw-pet-actor-art{width:100%;height:100%;max-height:190px;object-fit:contain;filter:drop-shadow(0 10px 7px #0009)}.dw-pet-actor-caption{position:absolute;bottom:0;padding:4px 9px;border:1px solid #8b6db4;border-radius:999px;background:#07081ddd;color:#fff4b0;font-size:11px;font-weight:900}.dw-pet-pop{animation:dwPetPop .28s ease-out}.dw-pet-pop[data-pet-state="attack"],.dw-pet-pop[data-pet-state="ability"]{animation:dwPetAttack .7s ease-in-out}.dw-pet-pop[data-pet-state="hurt"],.dw-pet-pop[data-pet-state="defend"]{animation:dwPetGuard .55s ease-in-out;filter:saturate(.78)}.dw-pet-pop[data-pet-state="celebrate"],.dw-pet-pop[data-pet-state="play"]{animation:dwPetCelebrate .9s ease-in-out;filter:drop-shadow(0 0 10px #ffe06c)}
    @keyframes dwPetPop{0%{transform:scale(.96)}55%{transform:scale(1.045)}100%{transform:scale(1)}}@keyframes dwPetAttack{0%,100%{transform:translateX(0) scale(1)}45%{transform:translateX(16px) scale(1.08)}65%{transform:translateX(7px) scale(1.03)}}@keyframes dwPetGuard{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px) rotate(-2deg)}55%{transform:translateX(4px) rotate(1deg)}}@keyframes dwPetCelebrate{0%,100%{transform:translateY(0) scale(1)}35%{transform:translateY(-14px) scale(1.06)}65%{transform:translateY(-4px) scale(1.03)}}@media(prefers-reduced-motion:reduce){.dw-pet-pop{animation:none!important}.dw-pet-actor{transform:none!important}}
  `;document.head.appendChild(s)}
  installStyles();window.DWPetMotion={PetActor,sourceFor,labelFor,reduced};
})();

(() => {
  if (document.getElementById('dw-pet-motion-fallback-style')) return;
  const style=document.createElement('style');style.id='dw-pet-motion-fallback-style';
  style.textContent=`.dw-pet-play-fallback img{animation:dwPetPlayFallback .72s ease-in-out infinite alternate}.dw-pet-ability-fallback img{animation:dwPetAbilityFallback .82s ease-in-out infinite alternate;filter:drop-shadow(0 0 14px #ffe36d)}@keyframes dwPetPlayFallback{to{transform:translateY(-10px) rotate(-4deg) scale(1.06)}}@keyframes dwPetAbilityFallback{to{transform:translateY(-4px) rotate(5deg) scale(1.12);filter:drop-shadow(0 0 22px #ffe36d)}}`;
  document.head.appendChild(style);
})();
