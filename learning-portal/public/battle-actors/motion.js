export const MOTIONS=Object.freeze(['idle','hurt','heal','attack']);
export const ATTACKS=Object.freeze(['slash','thrust','claw','spell','charge','burst']);
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
export function durationFor(motion,style='slash') {
  if(!MOTIONS.includes(motion))throw new Error(`Unknown enemy motion: ${motion}`);
  return motion==='idle'?2600:motion==='hurt'?1050:motion==='heal'?1800:style==='spell'||style==='burst'?2300:2100;
}
export function poseAt(motion,time,definition={}) {
  const duration=durationFor(motion,definition.attackStyle),p=clamp(time/duration);
  const pose={x:0,y:0,scaleX:1,scaleY:1,angle:0,red:0};
  if(motion==='idle'){
    const wave=Math.sin(p*Math.PI*2);
    pose.y=definition.floating?-6-5*wave:-1.5*(1-Math.cos(p*Math.PI*2));
    pose.scaleY=1+.012*wave;pose.scaleX=1-.005*wave;pose.angle=definition.floating?.5*wave:.18*wave;
  }else if(motion==='hurt'){
    const e=Math.sin(p*Math.PI)*(1-p);pose.x=Math.sin(p*Math.PI*12)*8*e;pose.angle=-4*e;pose.scaleY=1-.025*e;
    pose.red=p>.08&&p<.73?Math.pow(Math.max(0,Math.sin((p-.08)*Math.PI*9)),.6)*.82:0;
  }else if(motion==='heal'){
    pose.y=-7*Math.sin(p*Math.PI);pose.scaleY=1+.012*Math.sin(p*Math.PI);
  }else{
    const wind=Math.sin(clamp(p/.25)*Math.PI/2)*(1-smooth((p-.25)/.13));
    const strike=Math.sin(clamp((p-.24)/.48)*Math.PI);
    const sign=(definition.effectOrigin?.x??.75)<.5?-1:1;
    if(definition.attackStyle==='charge') {pose.y=-12*wind+24*strike;pose.scaleX=pose.scaleY=1-.045*wind+.15*strike;pose.angle=-2*wind;}
    else if(definition.attackStyle==='spell'||definition.attackStyle==='burst'){pose.y=-9*strike;pose.scaleX=pose.scaleY=1+.025*strike;pose.angle=-1.7*wind*sign;}
    else{pose.x=(-8*wind+18*strike)*sign;pose.y=-5*wind+4*strike;pose.angle=(-6*wind+7*strike)*sign;pose.scaleY=1-.025*wind+.025*strike;}
  }
  return pose;
}
// Battle flights live in battle-geometry.js and terminate at their opponent.
export function validateDefinition(d){
  if(!d||!/^[-a-z0-9]+$/.test(d.id)||!d.name||!d.path||!ATTACKS.includes(d.attackStyle))throw new Error('Invalid enemy definition');
  if(!/^#[\da-f]{6}$/i.test(d.effectColor))throw new Error(`Invalid effect color: ${d.id}`);
  const b=d.bounds,o=d.effectOrigin;
  if(!b||![b.x,b.y,b.width,b.height].every(Number.isFinite)||b.x<0||b.y<0||b.width<1||b.height<1)throw new Error(`Invalid sprite bounds: ${d.id}`);
  if(!o||![o.x,o.y].every(n=>Number.isFinite(n)&&n>=0&&n<=1))throw new Error(`Invalid effect origin: ${d.id}`);
  return d;
}
