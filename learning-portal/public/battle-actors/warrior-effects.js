const TAU=Math.PI*2;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=(a,b,t)=>{const q=clamp((t-a)/(b-a));return q*q*(3-2*q);};
const envelope=(p,a,b,c,d)=>smooth(a,b,p)*(1-smooth(c,d,p));
const fract=x=>x-Math.floor(x);
const kindOf=kind=>/spear|pike|lance|polearm|trident/i.test(kind||'')?'spear':/axe|hammer|mace/i.test(kind||'')?'axe':'sword';

/** Whole-sprite motion preserves every painted joint and the weapon grip. */
export function warriorPose(progress,weaponKind='sword') {
  const p=clamp(progress),kind=kindOf(weaponKind);
  const wind=envelope(p,0,.23,.28,.40),strike=envelope(p,.285,.39,.46,.64),recoil=envelope(p,.49,.60,.71,.93);
  if(kind==='spear')return {rootAngle:-3*wind+4*strike-1.4*recoil,rootX:-11*wind+29*strike-4*recoil,rootY:-2*wind+strike};
  if(kind==='axe')return {rootAngle:-7*wind+9*strike-2.2*recoil,rootX:-8*wind+21*strike-5*recoil,rootY:-4*wind+3*strike};
  return {rootAngle:-5.5*wind+7.5*strike-1.8*recoil,rootX:-8*wind+22*strike-4*recoil,rootY:-2.5*wind+2*strike};
}

export function drawWarriorAttack({front,behind,progress,origins,alignment='light'}) {
  const p=clamp(progress),wind=envelope(p,.04,.22,.28,.40),power=envelope(p,.29,.355,.43,.60);
  if(p<=0||p>=.97)return;
  const dark=alignment==='dark',white=dark?0xffddeb:0xfffcdf,edge=dark?0xef688b:0xffd080,
    glow=dark?0xb13dc7:0x68cfff,mote=dark?0xf19bb7:0xffdc96;
  for(const origin of origins) {
    const direction=origin.direction<0?-1:1,kind=kindOf(origin.weaponKind),left=origin.x<600?14:614,right=left+572;
    const available=Math.max(0,(direction>0?right-origin.x:origin.x-left)-12),reach=Math.max(28,Math.min(190,available));
    const at=(u,v)=>({x:clamp(origin.x+u*direction,left,right),y:origin.y+v});
    const poly=(g,points,color,alpha)=>{if(alpha<=.001)return;g.fillStyle(color,clamp(alpha));g.fillPoints(points.map(([x,y])=>at(x,y)),true);};
    const line=(g,x0,y0,x1,y1,width,color,alpha)=>{if(alpha<=.001)return;const a=at(x0,y0),b=at(x1,y1);g.lineStyle(width,color,clamp(alpha));g.lineBetween(a.x,a.y,b.x,b.y);};
    const star=(g,x,y,r,color,alpha)=>poly(g,[[x-r,y],[x-r*.2,y-r*.2],[x,y-r],[x+r*.2,y-r*.2],[x+r,y],[x+r*.2,y+r*.2],[x,y+r],[x-r*.2,y+r*.2]],color,alpha);
    if(wind>.001) {
      star(front,0,0,6+5*wind,white,wind*.85);
      for(let i=0;i<4;i++){const angle=i*TAU/4+p*6,r=15-6*wind;line(front,Math.cos(angle)*r,Math.sin(angle)*r,Math.cos(angle)*(r+5),Math.sin(angle)*(r+5),1.3,edge,wind*.5);}
    }
    if(power<=.001)continue;
    const q=smooth(.29,.58,p),impact=envelope(p,.38,.43,.52,.72);
    if(kind==='spear') {
      const length=reach*(.22+.78*smooth(.29,.43,p));
      for(let k=3;k>=1;k--)poly(behind,[[0,-3*k],[length*.65,-9*k],[length,0],[length*.65,9*k],[0,3*k]],glow,power*.09);
      poly(front,[[0,-4],[length*.68,-16],[length,0],[length*.68,16],[0,4]],edge,power*.58);
      poly(front,[[0,-2],[length*.75,-5],[length+3,0],[length*.75,5],[0,2]],white,power*.95);
      star(front,length-4,0,15*impact,white,impact);
      for(let i=0;i<6;i++){const side=i%2?1:-1,t=fract(q+i*.19);line(front,length*.3,length*.04*side,length*(.35+t*.5),side*(9+i*3),1.6,mote,power*(1-t)*.7);}
    }else {
      // A long blade may already reach the lane edge. Its crescent then trails
      // back along the blade and sweeps vertically instead of disappearing.
      const radius=kind==='axe'?100:85,nearEdge=available<85;
      const center=nearEdge?-Math.min(42,85-available):Math.min(reach*.32,40);
      const rx=Math.max(30,Math.min(radius,nearEdge?available+55:reach-center)),ry=radius*(kind==='axe'?1.08:1);
      const head=-1.27+q*2.68,start=Math.max(-1.42,head-(kind==='axe'?1.34:1.72));
      const crescent=(g,thickness,color,alpha)=>{
        const points=[];
        for(let i=0;i<=24;i++){const t=i/24,angle=start+(head-start)*t;points.push([center+Math.cos(angle)*rx,Math.sin(angle)*ry]);}
        for(let i=24;i>=0;i--){const t=i/24,angle=start+(head-start)*t,cut=thickness*Math.sin(t*Math.PI*.86);points.push([center+Math.cos(angle)*(rx-cut),Math.sin(angle)*(ry-cut)]);}
        poly(g,points,color,alpha);
      };
      crescent(behind,kind==='axe'?49:37,glow,power*.30);
      crescent(front,kind==='axe'?32:25,edge,power*.72);
      crescent(front,kind==='axe'?12:8,white,power*.96);
      const tip=[center+Math.cos(head)*rx,Math.sin(head)*ry];
      line(front,0,0,tip[0],tip[1],kind==='axe'?3:1.5,white,power*.25);
      star(front,tip[0],tip[1],(kind==='axe'?15:10)*impact,white,impact);
      for(let i=0;i<14;i++) {
        const age=fract(q*.75+i*.071),angle=head+(i%2?1:-1)*(.3+i*.17),distance=10+age*(kind==='axe'?48:33);
        const x=tip[0]+Math.cos(angle)*distance,y=tip[1]+Math.sin(angle)*distance;
        line(front,x-Math.cos(angle)*7,y-Math.sin(angle)*7,x,y,1.2+(i%3)*.5,mote,power*(1-age)*.78);
        if(i%4===0)star(front,x,y,2.8,mote,power*(1-age));
      }
    }
  }
}

/** Recolors the approved mage geometry without changing its drawing code. */
export function darkMageGraphics(graphics) {
  return paletteGraphics(graphics,new Map([[0xf2ffff,0xffefff],[0xa4f4ff,0xe5baff],[0x46caff,0xc278ff],[0x3885ff,0x763cda],[0xffd888,0xf0a1dc]]));
}

export function fireMageGraphics(graphics) {
  return paletteGraphics(graphics,new Map([[0xf2ffff,0xfff9de],[0xa4f4ff,0xffdf94],[0x46caff,0xffac42],[0x3885ff,0xef5a22],[0xffd888,0xffd888]]));
}

function paletteGraphics(graphics,colors) {
  return {
    fillStyle(color,alpha){graphics.fillStyle(colors.get(color)??color,alpha);return this;},
    lineStyle(width,color,alpha){graphics.lineStyle(width,colors.get(color)??color,alpha);return this;},
    fillPoints(...args){graphics.fillPoints(...args);return this;},
    lineBetween(...args){graphics.lineBetween(...args);return this;},
    fillCircle(...args){graphics.fillCircle(...args);return this;},
  };
}
