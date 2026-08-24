(function(){
  const A="assets/rpg/";
  const classes={
    warrior:{name:"Warrior",icon:"⚔️",art:A+"class-warrior.png",color:"#ef9b45",base:{atk:3,def:2,hp:6,heal:0},trait:"Steadfast",traitText:"Defensive sets trade a little attack for extra DEF."},
    ranger:{name:"Ranger",icon:"🏹",art:A+"class-ranger.png",color:"#54d894",base:{atk:4,def:1,hp:3,heal:0},trait:"True Shot",traitText:"A steady attack bonus rewards accurate work."},
    mage:{name:"Mage",icon:"🔮",art:A+"class-mage.png",color:"#b76cff",base:{atk:5,def:0,hp:2,heal:1},trait:"Spellcraft",traitText:"The strongest starting attack, balanced by lighter defense."},
    healer:{name:"Healer",icon:"✨",art:A+"class-healer.png",color:"#65dff1",base:{atk:1,def:1,hp:5,heal:5},trait:"Restoration",traitText:"Correct answers restore a small amount of battle HP."}
  };
  const petRegistry=Array.isArray(window.DRAGONSWOOD_PET_REGISTRY)?window.DRAGONSWOOD_PET_REGISTRY:[];
  const pets=petRegistry.filter(p=>!p.prestige);
  const prestigePets=petRegistry.filter(p=>p.prestige);
  const enemies=[
    {id:"goblin_scout",name:"Briar Goblin Scout",art:A+"enemy-goblin.png",element:"nature",hp:28,atk:5,loot:"Briar Cache"},
    {id:"orc_guard",name:"Ironwood Orc Guard",art:A+"enemy-orc.png",element:"earth",hp:34,atk:6,loot:"Ironwood Chest"},
    {id:"shaman",name:"Storm Shaman",art:A+"enemy-ogre.png",element:"storm",hp:31,atk:7,loot:"Stormbound Satchel"},
    {id:"elder_rootwarden",name:"Elder Rootwarden",art:A+"enemies/elder-rootwarden-idle.gif",staticArt:A+"enemies/elder-rootwarden.webp",element:"nature",hp:44,atk:7,loot:"Ancient Grove Chest"},
    {id:"mossstone_colossus",name:"Mossstone Colossus",art:A+"enemies/mossstone-colossus-idle.gif",staticArt:A+"enemies/mossstone-colossus.webp",element:"earth",hp:48,atk:7,loot:"Colossus Coffer"},
    {id:"boneguard_captain",name:"Boneguard Captain",art:A+"enemies/boneguard-captain-idle.gif",staticArt:A+"enemies/boneguard-captain.webp",element:"arcane",hp:42,atk:8,loot:"Captain's Lockbox"},
    {id:"frosthorn_yeti",name:"Frosthorn Yeti",art:A+"enemies/frosthorn-yeti-idle.gif",staticArt:A+"enemies/frosthorn-yeti.webp",element:"frost",hp:46,atk:8,loot:"Frostbound Chest"},
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
  /* ---- Appearance pack collection -------------------------------------
     48 packs: four classes x four level tiers x three distinct characters.
     Curated, not exhaustive — 161 characters are available, but a shop with
     288 costumes is worse than one with 48. Each tier is three genuinely
     different characters rather than recolours, and the art gets visibly more
     elaborate as the level gate rises. Levels 16-20 used to reward nothing at
     all; L20 is now the top of a real ladder. */
  const APPEARANCE_ROWS=[
    ["healer_appearance_5","Hearthside Helper","healer",5,"rare",225,"skin-healer-5.png"],
    ["healer_appearance_5_b","Village Apprentice","healer",5,"rare",225,"skin-healer-5-b.png"],
    ["healer_appearance_5_c","Chapel Novice","healer",5,"rare",225,"skin-healer-5-c.png"],
    ["healer_appearance_10","Tinkerbrew Gnome","healer",10,"epic",450,"skin-healer-10.png"],
    ["healer_appearance_10_b","Greybeard Mentor","healer",10,"epic",450,"skin-healer-10-b.png"],
    ["healer_appearance_10_c","Dunewalker Healer","healer",10,"epic",450,"skin-healer-10-c.png"],
    ["healer_appearance_15","Saffron Monk","healer",15,"legendary",675,"skin-healer-15.png"],
    ["healer_appearance_15_b","Sunmark Shaman","healer",15,"legendary",675,"skin-healer-15-b.png"],
    ["healer_appearance_15_c","Ramhorn Shaman","healer",15,"legendary",675,"skin-healer-15-c.png"],
    ["healer_appearance_20","Golden Oracle","healer",20,"mythic",900,"skin-healer-20.png"],
    ["healer_appearance_20_b","Shadow Seer","healer",20,"mythic",900,"skin-healer-20-b.png"],
    ["healer_appearance_20_c","Keeper of Hours","healer",20,"mythic",900,"skin-healer-20-c.png"],
    ["mage_appearance_5","Apprentice Conjurer","mage",5,"rare",225,"skin-mage-5.png"],
    ["mage_appearance_5_b","Bluepeak Spellcaster","mage",5,"rare",225,"skin-mage-5-b.png"],
    ["mage_appearance_5_c","Stormcuff Adept","mage",5,"rare",225,"skin-mage-5-c.png"],
    ["mage_appearance_10","Emberhair Sorceress","mage",10,"epic",450,"skin-mage-10.png"],
    ["mage_appearance_10_b","Voltcore Technomage","mage",10,"epic",450,"skin-mage-10-b.png"],
    ["mage_appearance_10_c","Violet Enchantress","mage",10,"epic",450,"skin-mage-10-c.png"],
    ["mage_appearance_15","Frostcrown Witch","mage",15,"legendary",675,"skin-mage-15.png"],
    ["mage_appearance_15_b","Aegiscore Technomage","mage",15,"legendary",675,"skin-mage-15-b.png"],
    ["mage_appearance_15_c","Silverfrost Sorceress","mage",15,"legendary",675,"skin-mage-15-c.png"],
    ["mage_appearance_20","Tidecaller Ascendant","mage",20,"mythic",900,"skin-mage-20.png"],
    ["mage_appearance_20_b","Emberheart Ascendant","mage",20,"mythic",900,"skin-mage-20-b.png"],
    ["mage_appearance_20_c","Wildhorn Ascendant","mage",20,"mythic",900,"skin-mage-20-c.png"],
    ["ranger_appearance_5","Greenhood Scout","ranger",5,"rare",225,"skin-ranger-5.png"],
    ["ranger_appearance_5_b","Crimsonmask Archer","ranger",5,"rare",225,"skin-ranger-5-b.png"],
    ["ranger_appearance_5_c","Palewood Elf","ranger",5,"rare",225,"skin-ranger-5-c.png"],
    ["ranger_appearance_10","Nightpetal Shinobi","ranger",10,"epic",450,"skin-ranger-10.png"],
    ["ranger_appearance_10_b","Snowveil Shinobi","ranger",10,"epic",450,"skin-ranger-10-b.png"],
    ["ranger_appearance_10_c","Emberbraid Elf","ranger",10,"epic",450,"skin-ranger-10-c.png"],
    ["ranger_appearance_15","Antlerhelm Tracker","ranger",15,"legendary",675,"skin-ranger-15.png"],
    ["ranger_appearance_15_b","Thornmantle Ranger","ranger",15,"legendary",675,"skin-ranger-15-b.png"],
    ["ranger_appearance_15_c","Silent Blade","ranger",15,"legendary",675,"skin-ranger-15-c.png"],
    ["ranger_appearance_20","Heartwood Warden","ranger",20,"mythic",900,"skin-ranger-20.png"],
    ["ranger_appearance_20_b","Stonebark Sentinel","ranger",20,"mythic",900,"skin-ranger-20-b.png"],
    ["ranger_appearance_20_c","Mosscrown Keeper","ranger",20,"mythic",900,"skin-ranger-20-c.png"],
    ["warrior_appearance_5","Ironwatch Sergeant","warrior",5,"rare",225,"skin-warrior-5.png"],
    ["warrior_appearance_5_b","Bronze Hoplite","warrior",5,"rare",225,"skin-warrior-5-b.png"],
    ["warrior_appearance_5_c","Northvale Raider","warrior",5,"rare",225,"skin-warrior-5-c.png"],
    ["warrior_appearance_10","Silverbrand Knight","warrior",10,"epic",450,"skin-warrior-10.png"],
    ["warrior_appearance_10_b","Phalanx Spearguard","warrior",10,"epic",450,"skin-warrior-10-b.png"],
    ["warrior_appearance_10_c","Azure Bushi","warrior",10,"epic",450,"skin-warrior-10-c.png"],
    ["warrior_appearance_15","Crowned Sovereign","warrior",15,"legendary",675,"skin-warrior-15.png"],
    ["warrior_appearance_15_b","Order Templar","warrior",15,"legendary",675,"skin-warrior-15-b.png"],
    ["warrior_appearance_15_c","Goldshield Amazon","warrior",15,"legendary",675,"skin-warrior-15-c.png"],
    ["warrior_appearance_20","Rimeguard Sovereign","warrior",20,"mythic",900,"skin-warrior-20.png"],
    ["warrior_appearance_20_b","Glacierborn Vigil","warrior",20,"mythic",900,"skin-warrior-20-b.png"],
    ["warrior_appearance_20_c","Winterlight Champion","warrior",20,"mythic",900,"skin-warrior-20-c.png"]
  ];
  const appearancePacks=APPEARANCE_ROWS.map(([id,name,cls,level,rarity,cost,file])=>({
    id, name:`${name} Appearance Pack`, classId:cls, slot:"appearance",
    level, rarity, cost, art:`${A}${file}`, skinArt:`${A}${file}`,
    idleArt:`${A}appearances/animated/${file.replace('.png','-idle.gif')}`,
    attackArt:`${A}appearances/animated/${file.replace('.png','-attack.gif')}`,
    hurtArt:`${A}appearances/animated/${file.replace('.png','-hurt.gif')}`,
    appearance:true, stats:{atk:0,def:0,hp:0,heal:0}
  }));
  // The Class Shop renders from `items`, so the packs have to live there too.
  items.push(...appearancePacks);
  const setPieces=[
    ["warrior","dawnshield","Dawnshield",1,"uncommon",["head","armor","weapon","offhand"],["Dawnshield Helm","Dawnshield Plate","Dawnshield Sword","Dawnshield Aegis"],["🪖","🛡️","⚔️","🔰"]],
    ["warrior","dragonward","Dragonward",10,"legendary",["head","armor","weapon","back"],["Dragonward Helm","Dragonward Warplate","Wyrmbane Blade","Dragonward Mantle"],["🐲","🥋","🗡️","🪽"]],
    ["ranger","briarfox","Briarfox",1,"uncommon",["head","outfit","weapon","accessory"],["Briarfox Hood","Briarfox Leathers","Briarfox Longbow","Scout's Compass"],["🧢","🥷","🏹","🧭"]],
    ["ranger","moonhawk","Moonhawk",10,"legendary",["head","outfit","weapon","back"],["Moonhawk Cowl","Moonhawk Raiment","Moonhawk Bow","Moonhawk Cape"],["🦅","🥋","🏹","🌙"]],
    ["mage","sparkweaver","Sparkweaver",1,"uncommon",["head","outfit","weapon","offhand"],["Sparkweaver Hat","Sparkweaver Robes","Sparkweaver Set Wand","Beginner's Grimoire"],["🎓","🥻","🪄","📘"]],
    ["mage","winterwitch","Winter Witch",10,"legendary",["head","outfit","weapon","accessory"],["Frostweave Hat","Frostweave Robes","Winter Staff","Snowflake Charm"],["❄️","🧥","🔮","💠"]],
    ["healer","dawnlight","Dawnlight",1,"uncommon",["head","outfit","weapon","accessory"],["Dawnlight Circlet","Dawnlight Vestments","Dawnlight Set Staff","Restoration Charm"],["😇","🥻","✨","💎"]],
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
  /* Explicit art per item id. The old visualMap gave ONE picture per
     (class, slot), so a Level 1 sword and a Level 10 sword looked the
     same — gear that never changes appearance is a weak reward. These
     icons get visibly better as the level requirement climbs. */
  const ITEM_ART={
    briarfox_accessory:"assets/rpg/items/item-briarfox-accessory.png",
    briarfox_bow:"assets/rpg/items/item-briarfox-bow.png",
    briarfox_head:"assets/rpg/items/item-briarfox-head.png",
    briarfox_outfit:"assets/rpg/items/item-briarfox-outfit.png",
    briarfox_weapon:"assets/rpg/items/item-briarfox-weapon.png",
    crimson_potion_belt:"assets/rpg/items/item-crimson-potion-belt.png",
    dawnlight_accessory:"assets/rpg/items/item-dawnlight-accessory.png",
    dawnlight_head:"assets/rpg/items/item-dawnlight-head.png",
    dawnlight_outfit:"assets/rpg/items/item-dawnlight-outfit.png",
    dawnlight_staff:"assets/rpg/items/item-dawnlight-staff.png",
    dawnlight_weapon:"assets/rpg/items/item-dawnlight-weapon.png",
    dawnshield_armor:"assets/rpg/items/item-dawnshield-armor.png",
    dawnshield_head:"assets/rpg/items/item-dawnshield-head.png",
    dawnshield_offhand:"assets/rpg/items/item-dawnshield-offhand.png",
    dawnshield_weapon:"assets/rpg/items/item-dawnshield-weapon.png",
    dragonward_armor:"assets/rpg/items/item-dragonward-armor.png",
    dragonward_back:"assets/rpg/items/item-dragonward-back.png",
    dragonward_head:"assets/rpg/items/item-dragonward-head.png",
    dragonward_weapon:"assets/rpg/items/item-dragonward-weapon.png",
    ironroot_guard:"assets/rpg/items/item-ironroot-guard.png",
    moonhawk_back:"assets/rpg/items/item-moonhawk-back.png",
    moonhawk_head:"assets/rpg/items/item-moonhawk-head.png",
    moonhawk_outfit:"assets/rpg/items/item-moonhawk-outfit.png",
    moonhawk_weapon:"assets/rpg/items/item-moonhawk-weapon.png",
    nightstep_cloak:"assets/rpg/items/item-nightstep-cloak.png",
    restoration_satchel:"assets/rpg/items/item-restoration-satchel.png",
    sparkweaver_head:"assets/rpg/items/item-sparkweaver-head.png",
    sparkweaver_offhand:"assets/rpg/items/item-sparkweaver-offhand.png",
    sparkweaver_outfit:"assets/rpg/items/item-sparkweaver-outfit.png",
    sparkweaver_wand:"assets/rpg/items/item-sparkweaver-wand.png",
    sparkweaver_weapon:"assets/rpg/items/item-sparkweaver-weapon.png",
    starbloom_back:"assets/rpg/items/item-starbloom-back.png",
    starbloom_head:"assets/rpg/items/item-starbloom-head.png",
    starbloom_outfit:"assets/rpg/items/item-starbloom-outfit.png",
    starbloom_weapon:"assets/rpg/items/item-starbloom-weapon.png",
    sunsteel_blade:"assets/rpg/items/item-sunsteel-blade.png",
    winterwitch_accessory:"assets/rpg/items/item-winterwitch-accessory.png",
    winterwitch_head:"assets/rpg/items/item-winterwitch-head.png",
    winterwitch_outfit:"assets/rpg/items/item-winterwitch-outfit.png",
    winterwitch_weapon:"assets/rpg/items/item-winterwitch-weapon.png"
  };
  const FALLBACK_ART=`${A}items/armor-01.png`;
  items.forEach(item=>{
    if(item.appearance)return;                       // packs carry their own skinArt
    if(item.egg){item.art=item.prestige?`${A}items/egg-22.png`:`${A}items/egg-7.png`;return}
    item.art=ITEM_ART[item.id]||FALLBACK_ART;
  });

  function dateKey(){return new Intl.DateTimeFormat("en-CA",{timeZone:"America/Phoenix",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date())}
  function levelForXp(xp){const t=[0,200,450,750,1100,1500,1950,2450,3000,3600,4250,4950,5700,6500,7350,8250,9200,10200,11100,12000];let l=1;t.forEach((v,i)=>{if(Number(xp||0)>=v)l=i+1});return Math.min(20,l)}
  function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
  function dailyEnemy(uid,day){return enemies[hash(`${uid}|${dateKey()}|${day}`)%enemies.length]}

  window.DWRPG={classes,pets,prestigePets,petRegistry,enemies,items,appearancePacks,dateKey,levelForXp,hash,dailyEnemy,version:"56.16"};
})();
