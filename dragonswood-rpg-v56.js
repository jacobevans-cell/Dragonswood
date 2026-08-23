(function(){
  const A="assets/rpg/";
  const classes={
    warrior:{name:"Warrior",icon:"⚔️",art:A+"class-warrior.png",color:"#ef9b45",base:{atk:3,def:2,hp:6,heal:0},trait:"Steadfast",traitText:"Defensive sets trade a little attack for extra DEF."},
    ranger:{name:"Ranger",icon:"🏹",art:A+"class-ranger.png",color:"#54d894",base:{atk:4,def:1,hp:3,heal:0},crit:.10,dodge:.05,trait:"True Shot",traitText:"10% critical-hit chance and 5% dodge chance."},
    mage:{name:"Mage",icon:"🔮",art:A+"class-mage.png",color:"#b76cff",base:{atk:5,def:0,hp:2,heal:1},element:"arcane",trait:"Spellcraft",traitText:"Element-tagged attacks can exploit a boss weakness."},
    healer:{name:"Healer",icon:"✨",art:A+"class-healer.png",color:"#65dff1",base:{atk:1,def:1,hp:5,heal:5},trait:"Restoration",traitText:"Correct answers restore a small amount of battle HP."}
  };
  const pets=[
    ["mossling","Mossling",A+"pet-land-01.png","common",1,"A sturdy forest friend.",1,1],
    ["embercub","Embercub",A+"pet-land-02.png","common",1,"A warm-hearted burrow beast.",2,0],
    ["riverback","Riverback",A+"pet-land-03.png","uncommon",2,"A calm companion with a shell-like back.",0,2],
    ["thornpup","Thornpup",A+"pet-land-04.png","uncommon",3,"A quick woodland tracker.",2,1],
    ["moonwing","Moonwing",A+"pet-flying-01.png","rare",4,"A silent flyer that scouts ahead.",2,0],
    ["cloudbeak","Cloudbeak",A+"pet-flying-02.png","common",2,"A bright-eyed sky companion.",1,1],
    ["starflutter","Starflutter",A+"pet-flying-03.png","rare",5,"Its wings sparkle over Dragonswood.",1,0],
    ["stormlet","Stormlet",A+"pet-flying-04.png","epic",7,"A tiny storm creature with a brave heart.",3,1]
  ].map(x=>({id:x[0],name:x[1],art:x[2],rarity:x[3],level:x[4],description:x[5],atk:x[6],def:x[7],prestige:false}));
  const prestigePets=[
    {id:"dragon",name:"Dragon",art:A+"pet-prestige-dragon.png",rarity:"legendary",level:10,atk:3,def:2,prestige:true,description:"A Level 10 Dragonswood bond."},
    {id:"gargoyle",name:"Gargoyle",art:A+"pet-prestige-gargoyle.png",rarity:"legendary",level:10,atk:1,def:4,prestige:true,description:"A Level 10 stone guardian."},
    {id:"elemental",name:"Elemental",art:A+"pet-prestige-elemental.png",rarity:"legendary",level:10,atk:4,def:1,prestige:true,description:"A Level 10 elemental companion."}
  ];
  const enemies=[
    {id:"goblin_scout",name:"Briar Goblin Scout",art:A+"enemy-goblin.png",element:"nature",hp:28,atk:5,loot:"Briar Cache"},
    {id:"orc_guard",name:"Ironwood Orc Guard",art:A+"enemy-orc.png",element:"earth",hp:34,atk:6,loot:"Ironwood Chest"},
    {id:"shaman",name:"Storm Shaman",art:A+"enemy-ogre.png",element:"storm",hp:31,atk:7,loot:"Stormbound Satchel"},
    {id:"night_magician",name:"Nightfall Magician",icon:"🧙",element:"arcane",hp:30,atk:8,loot:"Arcane Lockbox"},
    {id:"anubis",name:"Dune Gatekeeper",icon:"🐺",element:"light",hp:38,atk:8,loot:"Sunstone Coffer"},
    {id:"medusa",name:"Emerald Gaze",icon:"🐍",element:"nature",hp:36,atk:8,loot:"Emerald Vault"},
    {id:"flying",name:"Moonwing Marauder",art:A+"pet-flying-03.png",element:"storm",hp:32,atk:7,loot:"Sky Chest"},
    {id:"land",name:"Ancient Mossback",art:A+"pet-land-04.png",element:"earth",hp:40,atk:6,loot:"Rootbound Chest"}
  ];
  const items=[
    {id:"ironroot_guard",name:"Ironroot Guard",classId:"warrior",slot:"offhand",icon:"🛡️",cost:90,level:1,rarity:"uncommon",stats:{atk:0,def:3,hp:3,heal:0}},
    {id:"sunsteel_blade",name:"Sunsteel Blade",classId:"warrior",slot:"weapon",icon:"⚔️",cost:150,level:4,rarity:"rare",stats:{atk:5,def:1,hp:2,heal:0}},
    {id:"briarfox_bow",name:"Briarfox Bow",classId:"ranger",slot:"weapon",icon:"🏹",cost:95,level:1,rarity:"uncommon",stats:{atk:4,def:0,hp:1,heal:0}},
    {id:"nightstep_cloak",name:"Nightstep Cloak",classId:"ranger",slot:"back",icon:"🥷",cost:165,level:5,rarity:"rare",stats:{atk:3,def:2,hp:2,heal:0}},
    {id:"sparkweaver_wand",name:"Sparkweaver Wand",classId:"mage",slot:"weapon",icon:"🪄",cost:95,level:1,rarity:"uncommon",element:"arcane",stats:{atk:5,def:0,hp:0,heal:1}},
    {id:"crimson_potion_belt",name:"Crimson Potion Belt",classId:"mage",slot:"accessory",icon:"🧪",cost:155,level:4,rarity:"rare",element:"fire",stats:{atk:4,def:1,hp:2,heal:2}},
    {id:"dawnlight_staff",name:"Dawnlight Staff",classId:"healer",slot:"weapon",icon:"✨",cost:95,level:1,rarity:"uncommon",stats:{atk:1,def:1,hp:2,heal:5}},
    {id:"restoration_satchel",name:"Restoration Satchel",classId:"healer",slot:"accessory",icon:"🧴",cost:155,level:4,rarity:"rare",stats:{atk:0,def:2,hp:4,heal:5}},
    {id:"plain_egg",name:"Mysterious Woodland Egg",classId:"all",slot:"egg",icon:"🥚",cost:125,level:1,rarity:"uncommon",egg:true},
    {id:"prestige_egg",name:"Prestige Dragonwood Egg",classId:"all",slot:"egg",icon:"🌟🥚",cost:850,level:10,rarity:"legendary",egg:true,prestige:true}
  ];
  const setPieces=[
    ["warrior","dawnshield","Dawnshield",1,"uncommon",["head","armor","weapon","offhand"],["Dawnshield Helm","Dawnshield Plate","Dawnshield Sword","Dawnshield Aegis"],["🪖","🛡️","⚔️","🔰"]],
    ["warrior","dragonward","Dragonward",10,"legendary",["head","armor","weapon","back"],["Dragonward Helm","Dragonward Warplate","Wyrmbane Blade","Dragonward Mantle"],["🐲","🥋","🗡️","🪽"]],
    ["ranger","briarfox","Briarfox",1,"uncommon",["head","outfit","weapon","accessory"],["Briarfox Hood","Briarfox Leathers","Briarfox Longbow","Scout's Compass"],["🧢","🥷","🏹","🧭"]],
    ["ranger","moonhawk","Moonhawk",10,"legendary",["head","outfit","weapon","back"],["Moonhawk Cowl","Moonhawk Raiment","Moonhawk Bow","Moonhawk Cape"],["🦅","🥋","🏹","🌙"]],
    ["mage","sparkweaver","Sparkweaver",1,"uncommon",["head","outfit","weapon","offhand"],["Sparkweaver Hat","Sparkweaver Robes","Sparkweaver Wand","Beginner's Grimoire"],["🎓","🥻","🪄","📘"]],
    ["mage","winterwitch","Winter Witch",10,"legendary",["head","outfit","weapon","accessory"],["Frostweave Hat","Frostweave Robes","Winter Staff","Snowflake Charm"],["❄️","🧥","🔮","💠"]],
    ["healer","dawnlight","Dawnlight",1,"uncommon",["head","outfit","weapon","accessory"],["Dawnlight Circlet","Dawnlight Vestments","Dawnlight Staff","Restoration Charm"],["😇","🥻","✨","💎"]],
    ["healer","starbloom","Starbloom",10,"legendary",["head","outfit","weapon","back"],["Starbloom Crown","Starbloom Vestments","Starbloom Scepter","Mercywing Mantle"],["🌸","👘","🪄","🪽"]]
  ];
  for(const [classId,setId,setName,level,rarity,slots,names,icons] of setPieces){
    slots.forEach((slot,n)=>{
      if(items.some(i=>i.id===`${setId}_${slot}`))return;
      const main=slot==="weapon",protect=slot==="armor"||slot==="outfit"||slot==="offhand",support=classId==="healer";
      items.push({id:`${setId}_${slot}`,setId,setName,name:names[n],classId,slot,icon:icons[n],cost:(level===1?55:300)+n*(level===1?15:45),level,rarity,
        stats:{atk:main?(classId==="mage"?5:4):1,def:protect?3:0,hp:protect?3:1,heal:support?(main?4:2):(classId==="mage"&&slot==="offhand"?2:0)}});
    });
  }
  const weaponArt=["01","07","13","22","31","44","58","73"].map(n=>`${A}items/weapon-${n}.png`);
  const armorArt=["01","07","13","22","31","44","58","73"].map(n=>`${A}items/armor-${n}.png`);
  const shieldArt=["01","07","13","22"].map(n=>`${A}items/shield-${n}.png`);
  items.forEach((item,n)=>{
    if(item.egg){item.art=item.prestige?`${A}items/egg-22.png`:`${A}items/egg-7.png`;return}
    const pool=item.slot==="weapon"?weaponArt:item.slot==="offhand"?shieldArt:armorArt;
    item.art=pool[n%pool.length];
  });
  function dateKey(){return new Intl.DateTimeFormat("en-CA",{timeZone:"America/Phoenix",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date())}
  function levelForXp(xp){const t=[0,200,450,750,1100,1500,1950,2450,3000,3600,4250,4950,5700,6500,7350,8250,9200,10200,11100,12000];let l=1;t.forEach((v,i)=>{if(Number(xp||0)>=v)l=i+1});return Math.min(20,l)}
  function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
  function dailyEnemy(uid,day){return enemies[hash(`${uid}|${dateKey()}|${day}`)%enemies.length]}
  window.DWRPG={classes,pets,prestigePets,enemies,items,dateKey,levelForXp,hash,dailyEnemy,version:"56.0"};
})();
