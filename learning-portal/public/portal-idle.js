// The six-beat, foot-anchored idle from the approved character handoff.
export function portalIdlePose(elapsed) {
  const breath=Math.sin(Math.floor((elapsed%2400)/400)*Math.PI/3);
  return {x:breath*.65,angle:breath*.14,scaleY:1+breath*.002};
}
export function animatePortalIdle(canvas,{win=window,doc=document}={}) {
  const reduced=win.matchMedia('(prefers-reduced-motion: reduce)');
  let stopped=false,visible=true,frame=null,start=null;
  const still=()=>{canvas.style.transform='none';};
  const tick=time=>{frame=null;if(stopped||!canvas.isConnected)return;
    if(!reduced.matches&&!doc.hidden&&visible){start??=time;const p=portalIdlePose(time-start);canvas.style.transformOrigin='50% 100%';canvas.style.transform=`translateX(${p.x}px) rotate(${p.angle}deg) scaleY(${p.scaleY})`;canvas.dataset.idleState='playing';}
    frame=win.requestAnimationFrame(tick);
  };
  const sync=()=>{if(frame!==null){win.cancelAnimationFrame(frame);frame=null;}if(stopped)return;if(reduced.matches||doc.hidden||!visible){still();canvas.dataset.idleState='paused';return;}start=null;frame=win.requestAnimationFrame(tick);};
  const observer=win.IntersectionObserver?new win.IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting!==false;sync();}):null;
  observer?.observe(canvas);reduced.addEventListener?.('change',sync);doc.addEventListener('visibilitychange',sync);sync();
  return()=>{stopped=true;if(frame!==null)win.cancelAnimationFrame(frame);observer?.disconnect();reduced.removeEventListener?.('change',sync);doc.removeEventListener('visibilitychange',sync);still();delete canvas.dataset.idleState;};
}
