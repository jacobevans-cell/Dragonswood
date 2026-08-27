let controller=null;
function seedFrom(text){let h=2166136261;for(const c of String(text||'')){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0)}
export function initKingdomLife({scene,heroActor,petActor}={}){
  if(controller)return controller;
  if(!scene)return {update(){},destroy(){}};
  let visible=true,pageVisible=!document.hidden,motion=true;
  const syncPause=()=>scene.classList.toggle('kw-life-paused',!(visible&&pageVisible&&motion));
  const io='IntersectionObserver'in window?new IntersectionObserver(entries=>{visible=!!entries[0]?.isIntersecting;syncPause()},{rootMargin:'80px',threshold:.05}):null;
  io?.observe(scene);
  const onVis=()=>{pageVisible=!document.hidden;syncPause()};
  document.addEventListener('visibilitychange',onVis);
  controller={
    update({style='dragon',condition='healthy',motionEnabled=true,heroName='Adventurer',petName='',petVisible=false}={}){
      motion=motionEnabled!==false;
      scene.dataset.lifeStyle=style;scene.dataset.lifeCondition=condition;
      scene.classList.toggle('kw-life-enabled',motion);
      scene.classList.toggle('kw-life-motion',motion);
      heroActor?.style.setProperty('--kw-actor-phase',String(seedFrom(heroName)%7));
      if(petActor){petActor.style.setProperty('--kw-pet-phase',String(seedFrom(petName||'pet')%5));petActor.classList.toggle('kw-life-actor-hidden',!petVisible)}
      syncPause();
    },
    destroy(){io?.disconnect();document.removeEventListener('visibilitychange',onVis);controller=null}
  };
  syncPause();
  return controller;
}
