(() => {
  'use strict';
  const KEY='dragonswoodMathSoundsEnabledV1';
  let ctx=null,unlocked=false;
  let enabled=localStorage.getItem(KEY)!=='off';
  const toggle=document.getElementById('soundToggle');

  function updateToggle(){
    if(!toggle)return;
    toggle.setAttribute('aria-pressed',String(enabled));
    toggle.textContent=enabled?'🔔 Sounds On':'🔇 Sounds Off';
  }
  function getCtx(){
    if(!enabled)return null;
    try{
      if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)();
      if(ctx.state==='suspended')ctx.resume();
      unlocked=true;
      return ctx;
    }catch{return null}
  }
  function tone(freq,start,duration,type,gain){
    const ac=getCtx();if(!ac)return;
    const o=ac.createOscillator(),g=ac.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,ac.currentTime+start);
    g.gain.setValueAtTime(.0001,ac.currentTime+start);
    g.gain.exponentialRampToValueAtTime(gain,ac.currentTime+start+.015);
    g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+start+duration);
    o.connect(g);g.connect(ac.destination);o.start(ac.currentTime+start);o.stop(ac.currentTime+start+duration+.03);
  }
  function positive(){if(!enabled||!unlocked)return;tone(523.25,0,.12,'sine',.05);tone(659.25,.08,.13,'sine',.055);tone(783.99,.16,.18,'sine',.06)}
  function negative(){if(!enabled||!unlocked)return;tone(233.08,0,.16,'triangle',.055);tone(174.61,.13,.21,'triangle',.06)}
  function setEnabled(value){enabled=Boolean(value);localStorage.setItem(KEY,enabled?'on':'off');if(enabled)getCtx();updateToggle()}

  ['pointerdown','keydown','touchstart'].forEach(ev=>window.addEventListener(ev,()=>{if(enabled)getCtx()},{passive:true,once:true}));
  toggle?.addEventListener('click',()=>setEnabled(!enabled));
  updateToggle();
  window.DWMathAudio={positive,negative,unlock:getCtx,setEnabled,isEnabled:()=>enabled};
})();
