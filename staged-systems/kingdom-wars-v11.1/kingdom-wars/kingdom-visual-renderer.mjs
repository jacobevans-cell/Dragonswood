const THEMES={
  warrior:{accent:'#e7655e',accent2:'#ffd36a',roof:'#7f2d39',roof2:'#ca594f',glow:'#ff9d72',label:'Warrior Hold'},
  ranger:{accent:'#49d58d',accent2:'#b7ef73',roof:'#225f46',roof2:'#3b9b68',glow:'#7dffbc',label:'Ranger Enclave'},
  mage:{accent:'#a36bff',accent2:'#43d8ff',roof:'#42266f',roof2:'#7553c4',glow:'#a870ff',label:'Mage Dominion'},
  healer:{accent:'#60e2d3',accent2:'#ffd990',roof:'#2c6671',roof2:'#4ba7a7',glow:'#7ff5e4',label:'Sanctuary Realm'}
};
const ERA_NAMES={1:'Frontier Camp',2:'Woodland Keep',3:'Fortified Castle',4:'Great Stronghold',5:'Legendary Citadel'};
const BUILDING_STAGE={
  watchtower:['Survey Plot','Wooden Lookout','Stone Watch','High Watchtower','Royal Observatory','Dragonwatch Spire'],
  rangerTower:['Training Plot','Archer Post','Ranger Lodge','Marksman Tower','Warden Tower','Eaglewatch Bastion'],
  mageTower:['Arcane Plot','Rune Shrine','Apprentice Spire','Mage Tower','Grand Arcanum','Astral Spire'],
  creatureDen:['Den Site','Creature Nest','Creature Den','Beast Sanctuary','Grand Creature Sanctuary','Legendary Menagerie'],
  petStable:['Hatchery Plot','Egg Nursery','Pet Stable','Hatchery Hall','Royal Hatchery','Legendary Dragon Sanctuary'],
  lumberMill:['Timber Plot','Chopping Camp','Sawmill','Lumber Mill','Master Mill','Royal Timberworks'],
  quarry:['Stone Plot','Rock Pit','Stone Yard','Quarry','Deep Quarry','Royal Masonry'],
  essenceWell:['Essence Plot','Glow Spring','Rune Well','Essence Well','Arcane Fountain','Starlight Font']
};

function clamp(v,min,max){return Math.max(min,Math.min(max,Number(v)||0))}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function themeFor(cls){return THEMES[cls]||THEMES.warrior}
export function eraName(level){return ERA_NAMES[clamp(level,1,5)]||ERA_NAMES[1]}
export function buildingStageName(id,level){const a=BUILDING_STAGE[id]||[];return a[clamp(level,0,5)]||`Level ${level}`}

function defs(t){
  return `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#090b27"/><stop offset=".46" stop-color="#1a1744"/><stop offset="1" stop-color="#071b2e"/>
    </linearGradient>
    <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#214b36"/><stop offset="1" stop-color="#0d2a22"/>
    </linearGradient>
    <linearGradient id="stone" x1="0" x2="1">
      <stop offset="0" stop-color="#606981"/><stop offset=".47" stop-color="#c0c9dc"/><stop offset=".72" stop-color="#929cb4"/><stop offset="1" stop-color="#4e566d"/>
    </linearGradient>
    <linearGradient id="stoneGold" x1="0" x2="1">
      <stop offset="0" stop-color="#706d79"/><stop offset=".43" stop-color="#d9d5c1"/><stop offset=".72" stop-color="#b9a869"/><stop offset="1" stop-color="#595466"/>
    </linearGradient>
    <linearGradient id="wood" x1="0" x2="1">
      <stop offset="0" stop-color="#593824"/><stop offset=".5" stop-color="#9c6640"/><stop offset="1" stop-color="#462b20"/>
    </linearGradient>
    <linearGradient id="roof" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${t.roof2}"/><stop offset="1" stop-color="${t.roof}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" x2="1">
      <stop offset="0" stop-color="${t.accent}"/><stop offset="1" stop-color="${t.accent2}"/>
    </linearGradient>
    <radialGradient id="magic"><stop offset="0" stop-color="${t.accent2}" stop-opacity=".95"/><stop offset=".48" stop-color="${t.accent}" stop-opacity=".55"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></radialGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#000" flood-opacity=".55"/></filter>
    <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="goldGlow" x="-80%" y="-80%" width="260%" height="260%"><feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#ffd766" flood-opacity=".85"/></filter>
    <pattern id="stonePattern" width="36" height="22" patternUnits="userSpaceOnUse">
      <rect width="36" height="22" fill="#7b8499"/><path d="M0 11h36M18 0v11M6 11v11M30 11v11" stroke="#50586d" stroke-width="2" opacity=".55"/>
    </pattern>
  </defs>`;
}

function scenery(keep,t){
  const extraTrees=keep>=3?`
    <g opacity=".88">${tree(44,285,.86)}${tree(930,280,.95)}${tree(902,330,.72)}${tree(95,355,.65)}</g>`:'';
  const settlement=keep>=2?`
    <path d="M490 430 C360 445 280 488 208 528" stroke="#aa996e" stroke-width="${16+keep*2}" fill="none" opacity=".47"/>
    <path d="M522 432 C650 451 735 483 805 526" stroke="#aa996e" stroke-width="${14+keep*2}" fill="none" opacity=".40"/>`:'';
  const stars=Array.from({length:18},(_,i)=>{
    const x=(i*83+37)%960+20,y=(i*47+22)%200+18,r=i%4===0?2.3:1.3;
    return `<circle class="kw-star s${i%3}" cx="${x}" cy="${y}" r="${r}" fill="${i%5===0?t.accent2:'#fff'}" opacity="${.35+(i%4)*.12}"/>`;
  }).join('');
  return `
    <rect width="1000" height="560" rx="24" fill="url(#sky)"/>
    ${stars}
    <circle cx="855" cy="88" r="44" fill="#e7e6d0" opacity=".16"/><circle cx="843" cy="79" r="41" fill="#fbf6cc" opacity=".12"/>
    <path d="M0 257 L104 177 183 236 289 144 387 246 490 178 609 244 722 136 810 228 903 154 1000 228V356H0Z" fill="#14183c"/>
    <path d="M0 292 L112 224 214 281 332 205 438 274 551 218 665 287 794 207 894 263 1000 219V365H0Z" fill="#171f35" opacity=".84"/>
    <path d="M0 320 C145 294 256 329 380 310 C526 288 666 330 1000 292V560H0Z" fill="url(#grass)"/>
    ${settlement}
    ${tree(20,330,.9)}${tree(958,340,.88)}${tree(70,252,.65)}${tree(900,250,.62)}
    ${extraTrees}
    <ellipse cx="500" cy="502" rx="${170+keep*28}" ry="${35+keep*4}" fill="#000" opacity=".23"/>
    <g opacity="${.14+keep*.04}"><ellipse cx="500" cy="390" rx="${215+keep*22}" ry="${108+keep*8}" fill="url(#magic)"/></g>
  `;
}
function tree(x,y,s=1){
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity=".86"><rect x="16" y="58" width="10" height="40" rx="3" fill="#503820"/><path d="M21 0 0 63h42z" fill="#193f32"/><path d="M21 19 3 78h36z" fill="#22533f"/></g>`;
}
function banner(x,y,t,scale=1){
  return `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M0 0v63" stroke="#dfc077" stroke-width="4"/><path d="M3 5h38l-10 15 10 15H3z" fill="url(#accent)" stroke="#f6dc87" stroke-width="2"/></g>`;
}
function campfire(x,y){
  return `<g transform="translate(${x} ${y})"><path d="m-18 11 36-20M-18-9l36 20" stroke="#8e6240" stroke-width="6" stroke-linecap="round"/><path class="kw-fire" d="M0-32C18-16 15-4 0 5-15-4-18-17 0-32Z" fill="#ff9f43"/><path class="kw-fire" d="M0-20C8-10 7-3 0 2-8-3-8-10 0-20Z" fill="#ffe169"/></g>`;
}
function plot(x,y,label,active,focus){
  if(active)return '';
  return `<g class="kw-building-plot ${focus?'kw-upgrade-focus':''}" transform="translate(${x} ${y})">
    <ellipse rx="53" ry="22" fill="#0b1620" stroke="#596575" stroke-width="2" stroke-dasharray="6 6" opacity=".78"/>
    <path d="M-30 0 0-12 30 0 0 12Z" fill="#637080" opacity=".24"/>
    <text y="38" text-anchor="middle" class="kw-plot-label">${esc(label)}</text>
  </g>`;
}
function tag(x,y,label,level,t){
  return `<g transform="translate(${x} ${y})"><rect x="-55" y="-12" width="110" height="24" rx="12" fill="#060819" opacity=".9" stroke="${level>=5?'#ffd766':t.accent}" stroke-opacity=".7"/><text text-anchor="middle" y="5" class="kw-tag">${esc(label)} · L${level}</text></g>`;
}

function wallSystem(level,t,focus){
  level=clamp(level,0,5);
  if(level<=0)return '';
  const cls=focus?'kw-upgrade-focus':'';
  if(level===1){
    const posts=Array.from({length:18},(_,i)=>{
      const x=292+i*25;
      return `<path d="M${x} 423v-42l7-12 7 12v42" fill="url(#wood)" stroke="#33221a" stroke-width="2"/>`
    }).join('');
    return `<g class="${cls}" filter="url(#shadow)">${posts}<path d="M286 416h440" stroke="#6f482d" stroke-width="10"/></g>`;
  }
  const stroke=level>=5?'#bfa86b':level>=4?'#858ca4':'#737c94';
  const width=level===2?16:level===3?22:level===4?29:33;
  const glow=level>=5?'filter="url(#goldGlow)"':'';
  const towers=level>=3?`
    <g fill="url(#stoneGold)" stroke="${stroke}" stroke-width="3">
      ${wallTower(283,345,level,t)}${wallTower(717,345,level,t)}
    </g>`:'';
  const second=level>=4?`<path d="M310 389 Q500 296 690 389 L680 433 Q500 354 320 433Z" fill="none" stroke="${level>=5?t.accent2:'#5b6176'}" stroke-width="9" opacity=".58"/>`:'';
  const runes=level>=5?`<path class="kw-rune-line" d="M325 418 Q500 336 675 418" fill="none" stroke="${t.accent2}" stroke-width="3" stroke-dasharray="4 14" filter="url(#softGlow)"/>`:'';
  return `<g class="${cls}" ${glow}>
    <path d="M278 428 Q500 323 722 428" fill="none" stroke="#25293a" stroke-width="${width+9}"/>
    <path d="M278 428 Q500 323 722 428" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-dasharray="${level>=3?'18 5':'0'}"/>
    ${second}${towers}${runes}
  </g>`;
}
function wallTower(x,y,level,t){
  return `<g transform="translate(${x} ${y})"><rect x="-25" y="0" width="50" height="${72+level*4}" rx="4"/><path d="M-29 4h58v-15h-12v8h-13v-8H-9v8h-12v-8h-8z"/><path d="M0 18v35" stroke="#394052" stroke-width="5"/><circle cx="0" cy="16" r="5" fill="${t.accent2}" opacity="${level>=5?.9:.22}"/></g>`;
}

function keepArt(level,t,cls,focus){
  level=clamp(level,1,5);
  const F=focus?'kw-upgrade-focus':'';
  if(level===1){
    return `<g class="${F}" filter="url(#shadow)">
      <ellipse cx="500" cy="426" rx="128" ry="60" fill="#412f22" opacity=".8"/>
      <rect x="433" y="326" width="134" height="102" rx="7" fill="url(#wood)" stroke="#2c2018" stroke-width="5"/>
      <path d="M419 335 500 274 581 335Z" fill="url(#roof)" stroke="#322436" stroke-width="5"/>
      <rect x="483" y="375" width="34" height="53" rx="16 16 2 2" fill="#171321"/>
      <circle cx="500" cy="323" r="14" fill="${t.accent}" stroke="#f5d777" stroke-width="3"/>
      ${banner(560,288,t,.82)}
      <g transform="translate(354 369)">${tent(-40,0,t)}${tent(32,20,t)}${campfire(15,57)}</g>
      <g transform="translate(640 380)">${tent(-20,8,t)}</g>
    </g>`;
  }
  if(level===2){
    return `<g class="${F}" filter="url(#shadow)">
      <rect x="413" y="315" width="174" height="121" rx="7" fill="url(#stone)" stroke="#4f566b" stroke-width="5"/>
      <path d="M407 320h186v-20h-25v11h-29v-11h-28v11h-29v-11h-30v11h-25v-11h-20Z" fill="#969fb4"/>
      <rect x="467" y="368" width="66" height="68" rx="30 30 2 2" fill="#1d1826" stroke="#4b4055" stroke-width="5"/>
      <g>${smallTower(393,344,94,t)}${smallTower(607,344,94,t)}</g>
      ${banner(500,265,t,1)}
      <path d="M500 368v68" stroke="#b28d5d" stroke-width="4" opacity=".45"/>
    </g>`;
  }
  if(level===3){
    return `<g class="${F}" filter="url(#shadow)">
      <rect x="382" y="327" width="236" height="117" rx="6" fill="url(#stone)" stroke="#50586d" stroke-width="5"/>
      ${tower(382,280,78,164,t,3)}${tower(540,280,78,164,t,3)}
      <rect x="442" y="244" width="116" height="200" rx="7" fill="url(#stone)" stroke="#50586d" stroke-width="5"/>
      ${crenels(438,239,124,15)}
      <path d="M442 244 500 198 558 244Z" fill="url(#roof)" stroke="#43354e" stroke-width="5"/>
      <circle cx="500" cy="281" r="17" fill="${t.accent}" stroke="#f7dd8c" stroke-width="4"/>
      <path d="M500 268v27M487 281h26" stroke="#fff" stroke-width="3" opacity=".7"/>
      <rect x="474" y="374" width="52" height="70" rx="25 25 2 2" fill="#1a1623"/>
      ${banner(555,208,t,.9)}${banner(623,278,t,.75)}
    </g>`;
  }
  if(level===4){
    return `<g class="${F}" filter="url(#shadow)">
      <rect x="355" y="338" width="290" height="112" rx="6" fill="url(#stone)" stroke="#555d75" stroke-width="5"/>
      ${tower(354,259,86,190,t,4)}${tower(560,259,86,190,t,4)}
      <rect x="424" y="223" width="152" height="227" rx="7" fill="url(#stoneGold)" stroke="#5c5872" stroke-width="5"/>
      ${crenels(420,217,160,16)}
      <path d="M423 224 500 159 577 224Z" fill="url(#roof)" stroke="#493a59" stroke-width="5"/>
      <path d="M459 194 500 137 541 194" fill="none" stroke="${t.accent2}" stroke-width="5" opacity=".8"/>
      <circle cx="500" cy="258" r="23" fill="#151528" stroke="${t.accent}" stroke-width="5"/>
      <path d="m486 258 9 9 20-24" fill="none" stroke="${t.accent2}" stroke-width="5" stroke-linecap="round"/>
      <rect x="469" y="370" width="62" height="80" rx="30 30 2 2" fill="#17131f" stroke="#aa9166" stroke-width="3"/>
      ${banner(584,194,t,1)}${banner(642,266,t,.78)}${banner(348,266,t,.78)}
      <g opacity=".85"><rect x="393" y="370" width="25" height="30" fill="#3f455a"/><rect x="582" y="370" width="25" height="30" fill="#3f455a"/></g>
    </g>`;
  }
  return `<g class="${F}" filter="url(#shadow)">
    <ellipse cx="500" cy="427" rx="200" ry="66" fill="${t.accent}" opacity=".08" filter="url(#softGlow)"/>
    <rect x="330" y="350" width="340" height="108" rx="6" fill="url(#stoneGold)" stroke="#9c864b" stroke-width="6"/>
    ${tower(326,245,98,213,t,5)}${tower(576,245,98,213,t,5)}
    <rect x="403" y="207" width="194" height="251" rx="7" fill="url(#stoneGold)" stroke="#a38d54" stroke-width="6"/>
    ${crenels(398,199,204,18)}
    <path d="M402 208 500 105 598 208Z" fill="url(#roof)" stroke="#bca054" stroke-width="6"/>
    <path d="M446 158 500 80 554 158" fill="none" stroke="${t.accent2}" stroke-width="7" filter="url(#softGlow)"/>
    <path d="M500 81v-42" stroke="#f4d978" stroke-width="5"/><path d="m500 34 18 21-18 21-18-21Z" fill="${t.accent2}" stroke="#fff0a8" stroke-width="3" filter="url(#goldGlow)"/>
    <circle cx="500" cy="251" r="31" fill="#12142a" stroke="#f0cf68" stroke-width="6" filter="url(#goldGlow)"/>
    <path d="M500 232 517 248 500 276 483 248Z" fill="url(#accent)"/>
    <rect x="462" y="362" width="76" height="96" rx="36 36 2 2" fill="#16121d" stroke="#d1ad5e" stroke-width="4"/>
    ${banner(608,168,t,1.12)}${banner(677,244,t,.85)}${banner(316,244,t,.85)}
    <path class="kw-rune-line" d="M380 424 Q500 365 620 424" fill="none" stroke="${t.accent2}" stroke-width="4" stroke-dasharray="5 12" filter="url(#softGlow)"/>
  </g>`;
}
function smallTower(x,y,h,t){
  return `<g transform="translate(${x} ${y})"><rect x="-26" width="52" height="${h}" fill="url(#stone)" stroke="#4f566b" stroke-width="4"/><path d="M-30 5h60v-18h-12v9H6v-9H-6v9h-12v-9h-12z" fill="#8d96ab"/><path d="M-34 3 0-34 34 3" fill="url(#roof)" opacity=".55"/></g>`;
}
function tower(x,y,w,h,t,level){
  return `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" rx="5" fill="${level>=5?'url(#stoneGold)':'url(#stone)'}" stroke="${level>=5?'#9c864b':'#50586d'}" stroke-width="5"/>${crenels(-4,-7,w+8,14)}<path d="M${w*.23} ${h*.43}h${w*.54}" stroke="#3b4153" stroke-width="5"/><circle cx="${w/2}" cy="${h*.2}" r="7" fill="${t.accent2}" opacity="${level>=5?.8:.18}"/></g>`;
}
function crenels(x,y,w,step){
  const count=Math.max(4,Math.floor(w/step));
  return `<g fill="#969fb4">${Array.from({length:count},(_,i)=>`<rect x="${x+i*(w/count)}" y="${y}" width="${Math.max(7,w/count*.55)}" height="18"/>`).join('')}</g>`;
}
function tent(x,y,t){
  return `<g transform="translate(${x} ${y})"><path d="M0 0 28 52H-28Z" fill="${t.roof2}" stroke="#3c2d3d" stroke-width="3"/><path d="M0 0v52" stroke="#dfc27b" stroke-width="3"/><path d="M0 20 11 52H-11Z" fill="#171622"/></g>`;
}

function buildingArt(id,level,x,y,t,focus){
  level=clamp(level,0,5);
  if(level<=0)return plot(x,y,BUILDING_STAGE[id]?.[0]||id,false,focus);
  const S=.74+level*.085,cls=focus?'kw-upgrade-focus':'';
  const label=buildingStageName(id,level);
  let art='';
  if(id==='watchtower')art=watchtower(level,t);
  if(id==='rangerTower')art=rangerTower(level,t);
  if(id==='mageTower')art=mageTower(level,t);
  if(id==='creatureDen')art=creatureDen(level,t);
  if(id==='lumberMill')art=lumberMill(level,t);
  if(id==='quarry')art=quarry(level,t);
  if(id==='essenceWell')art=essenceWell(level,t);
  return `<g class="kw-building ${cls}" data-building="${id}" transform="translate(${x} ${y}) scale(${S})" filter="url(#shadow)">${art}</g>${tag(x,y+58,label,level,t)}`;
}
function watchtower(l,t){
  const stone=l>=3,extra=l>=4;
  return `<ellipse cy="33" rx="43" ry="14" fill="#000" opacity=".24"/>
    <rect x="-25" y="-65" width="50" height="91" rx="5" fill="${stone?'url(#stone)':'url(#wood)'}" stroke="#3f4658" stroke-width="4"/>
    <path d="M-38-64 0-96 38-64Z" fill="url(#roof)" stroke="#46384d" stroke-width="4"/>
    <rect x="-8" y="-37" width="16" height="22" rx="7" fill="#121520"/>
    ${extra?`<circle cx="0" cy="-108" r="13" fill="#111629" stroke="${t.accent2}" stroke-width="4"/><circle cx="0" cy="-108" r="5" fill="${t.accent2}" filter="url(#softGlow)"/>`:''}
    ${l>=5?banner(28,-78,t,.55):''}`;
}
function rangerTower(l,t){
  return `<ellipse cy="35" rx="48" ry="14" fill="#000" opacity=".23"/>
    <rect x="-31" y="-52" width="62" height="80" rx="6" fill="${l>=3?'url(#stone)':'url(#wood)'}" stroke="#3e4654" stroke-width="4"/>
    <path d="M-45-50 0-89 45-50Z" fill="#296447" stroke="#bedf82" stroke-width="${l>=4?5:3}"/>
    <path d="M0-40v45M-14-18h28" stroke="#c9e68c" stroke-width="3"/>
    <path d="M12-24q22 20 0 39M12-24q-13 20 0 39" fill="none" stroke="#e3c779" stroke-width="4"/>
    ${l>=3?`<rect x="-48" y="-5" width="14" height="31" fill="#8e6137"/><path d="M-41-22v17" stroke="#e5c46e" stroke-width="3"/>`:''}
    ${l>=5?banner(34,-71,{...t,accent:'#3ac47c',accent2:'#c9f47d'},.55):''}`;
}
function mageTower(l,t){
  return `<ellipse cy="37" rx="49" ry="14" fill="#000" opacity=".25"/>
    <path d="M-31 29 -23-46 0-81 23-46 31 29Z" fill="${l>=3?'url(#stoneGold)':'#51477c'}" stroke="#51456a" stroke-width="4"/>
    <path d="M-35-43 0-104 35-43Z" fill="url(#roof)" stroke="${t.accent}" stroke-width="4"/>
    <circle class="kw-magic-core" cx="0" cy="-112" r="${8+l*2}" fill="${t.accent2}" stroke="#fff0c1" stroke-width="2" filter="url(#softGlow)"/>
    <path class="kw-orbit" d="M-27-111a27 9 0 1 0 54 0 27 9 0 1 0-54 0" fill="none" stroke="${t.accent}" stroke-width="3" opacity="${l>=3?.9:.4}"/>
    ${l>=4?`<circle cx="-19" cy="-27" r="5" fill="${t.accent2}"/><circle cx="19" cy="-6" r="5" fill="${t.accent2}"/>`:''}`;
}
function creatureDen(l,t){
  return `<ellipse cy="25" rx="58" ry="18" fill="#000" opacity=".24"/>
    <path d="M-56 24Q-48-45 0-58Q48-45 56 24Z" fill="${l>=3?'#596557':'#4e4232'}" stroke="#2e342c" stroke-width="5"/>
    <path d="M-24 25Q-20-19 0-26Q20-19 24 25Z" fill="#151719"/>
    <path d="M-46-2 0-43 46-2" fill="none" stroke="${l>=4?t.accent2:'#776746'}" stroke-width="${l>=4?5:3}" opacity=".9"/>
    ${l>=2?`<path d="M-35 6h-24v20M35 6h24v20" stroke="#8c6c43" stroke-width="6"/>`:''}
    ${l>=5?`<path d="M-11-54 0-70 11-54" fill="${t.accent2}" filter="url(#softGlow)"/>`:''}`;
}
function lumberMill(l,t){
  return `<ellipse cy="31" rx="58" ry="17" fill="#000" opacity=".23"/>
    <rect x="-45" y="-35" width="90" height="59" rx="5" fill="url(#wood)" stroke="#3e2b20" stroke-width="4"/>
    <path d="M-54-34 0-72 54-34Z" fill="#6f4931" stroke="#37291f" stroke-width="4"/>
    <circle cx="${l>=3?52:46}" cy="-4" r="${18+l*2}" fill="#6e5540" stroke="#c59a5e" stroke-width="5"/><path d="M${l>=3?52:46}-25v42M${l>=3?31:25}-4h42M${l>=3?37:31}-19l30 30M${l>=3?67:61}-19l-30 30" stroke="#d4b178" stroke-width="3"/>
    <g fill="#8b5b34">${Array.from({length:Math.min(l,4)},(_,i)=>`<rect x="${-62+i*8}" y="${18-i*5}" width="30" height="8" rx="4"/>`).join('')}</g>
    ${l>=5?banner(-47,-60,t,.5):''}`;
}
function quarry(l,t){
  return `<ellipse cy="26" rx="62" ry="21" fill="#000" opacity=".28"/>
    <path d="M-61 18 -50-18 -28-36 -8-18 12-52 32-23 53-31 64 18Z" fill="#696f7b" stroke="#454a55" stroke-width="4"/>
    <path d="M-39 3-24-13-10 4M5 6 22-14 38 5" fill="none" stroke="#9ca2ad" stroke-width="4"/>
    ${l>=2?`<path d="M-57-17v-56h7v56M-54-67h64" stroke="#8c623c" stroke-width="6"/><path d="M4-66v37" stroke="#c19a61" stroke-width="3"/><rect x="-3" y="-31" width="14" height="14" fill="#777f8c"/>`:''}
    ${l>=4?`<rect x="42" y="-5" width="28" height="18" rx="4" fill="#a5804c"/><circle cx="49" cy="16" r="7" fill="#30343c"/><circle cx="65" cy="16" r="7" fill="#30343c"/>`:''}`;
}
function essenceWell(l,t){
  return `<ellipse cy="23" rx="52" ry="19" fill="#000" opacity=".23"/>
    <ellipse cy="-2" rx="${31+l*3}" ry="${16+l}" fill="#2f3450" stroke="${t.accent}" stroke-width="5"/>
    <ellipse class="kw-well-glow" cy="-4" rx="${23+l*2}" ry="${10+l}" fill="${t.accent2}" opacity=".55" filter="url(#softGlow)"/>
    <path d="M-34-5v33M34-5v33" stroke="#7a7188" stroke-width="6"/>
    ${l>=2?`<path d="M-22-26 0-53 22-26" fill="${t.accent}" stroke="#f5dfa0" stroke-width="3" opacity=".9"/>`:''}
    ${l>=3?`<circle cx="-35" cy="-33" r="5" fill="${t.accent2}"/><circle cx="35" cy="-41" r="4" fill="${t.accent2}"/>`:''}
    ${l>=5?`<path class="kw-orbit" d="M-44-5a44 15 0 1 0 88 0 44 15 0 1 0-88 0" fill="none" stroke="#fff0a8" stroke-width="2"/>`:''}`;
}

const POS={
  watchtower:[135,253],rangerTower:[865,255],mageTower:[785,128],creatureDen:[858,430],
  lumberMill:[245,440],quarry:[98,438],essenceWell:[705,458]
};

export function renderKingdomVisual(host,{buildings={},classId='warrior',kingdomName='My Kingdom',focusId='',displayName='Adventurer'}={}){
  const keep=clamp(buildings.keep||1,1,5),t=themeFor(classId);
  const active=id=>clamp(buildings[id]||0,0,5);
  const roads=Object.entries(POS).filter(([id])=>active(id)>0).map(([id,[x,y]])=>
    `<path d="M500 420 Q${(500+x)/2} ${(410+y)/2} ${x} ${y}" stroke="#a99b72" stroke-width="${8+keep}" opacity=".32" fill="none"/>`
  ).join('');
  const allBuildings=Object.entries(POS).map(([id,[x,y]])=>buildingArt(id,active(id),x,y,t,focusId===id)).join('');
  const svg=`<svg class="kw-world-svg kw-era-${keep} kw-class-${esc(classId)}" viewBox="0 0 1000 560" role="img" aria-label="${esc(kingdomName)}, ${eraName(keep)}, Keep Level ${keep}">
    ${defs(t)}
    ${scenery(keep,t)}
    <g class="kw-roads">${roads}</g>
    ${wallSystem(buildings.walls||0,t,focusId==='walls')}
    <g class="kw-side-buildings">${allBuildings}</g>
    ${keepArt(keep,t,classId,focusId==='keep')}
    <g class="kw-era-banner">
      <rect x="20" y="19" width="223" height="58" rx="13" fill="#070919" opacity=".84" stroke="${t.accent}" stroke-opacity=".68"/>
      <text x="35" y="44" class="kw-era-name">${eraName(keep)}</text>
      <text x="35" y="63" class="kw-era-sub">${esc(t.label)} · Keep L${keep}</text>
    </g>
    ${keep>=4?`<g class="kw-motes">${Array.from({length:12},(_,i)=>`<circle cx="${330+(i*53)%350}" cy="${140+(i*37)%245}" r="${2+(i%2)}" fill="${i%3===0?t.accent2:t.accent}" opacity=".7"/>`).join('')}</g>`:''}
  </svg>`;
  host.innerHTML=svg;
}
