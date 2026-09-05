(function(){
  const A="assets/rpg/";
  const classes={
    warrior:{name:"Warrior",icon:"⚔️",art:A+"class-warrior.png",artGirl:A+"class-warrior.png",artBoy:A+"skin-warrior-5.png",color:"#ef9b45",base:{atk:3,def:2,hp:6,heal:0},trait:"Steadfast",traitText:"Defensive sets trade a little attack for extra DEF."},
    ranger:{name:"Ranger",icon:"🏹",art:A+"class-ranger.png",color:"#54d894",base:{atk:4,def:1,hp:3,heal:0},trait:"True Shot",traitText:"A steady attack bonus rewards accurate work."},
    mage:{name:"Mage",icon:"🔮",art:A+"class-mage.png",color:"#b76cff",base:{atk:5,def:0,hp:2,heal:1},trait:"Spellcraft",traitText:"The strongest starting attack, balanced by lighter defense."},
    healer:{name:"Healer",icon:"✨",art:A+"class-healer.png",color:"#65dff1",base:{atk:1,def:1,hp:5,heal:5},trait:"Restoration",traitText:"Correct answers restore a small amount of battle HP."}
  };
  const registrySource=Array.isArray(window.DRAGONSWOOD_PET_REGISTRY)?window.DRAGONSWOOD_PET_REGISTRY:[];
  const nyx={id:"pet-nyx",name:"Nyx",art:"v33-integration/assets/art/pet-nyx.jpg",animatedArt:"",rarity:"rare",level:1,description:"The original Dragonswood companion.",habitat:"Dragonswood",nature:"dragon",personality:"loyal",unlockSource:"Legacy Dragonswood companion",bonusSummary:"+1 ATK, +1 DEF",atk:1,def:1,prestige:false,ability:"Dragon Bond",abilityText:"Nyx supports the equipped adventurer without replacing another active pet."};
  const petRegistry=registrySource.some(p=>p?.id==="pet-nyx")?registrySource:[...registrySource,nyx];
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
  function canonicalPetId(value){const id=String(value||"").trim();return id.toLowerCase()==="nyx"?"pet-nyx":id}
  function resolvePet(profile={}){const id=canonicalPetId(profile.activePet);return id?[...pets,...prestigePets].find(p=>p.id===id)||null:null}
  const v5Config=Object.freeze({enabled:true,testerEmail:"jacobicusjax@gmail.com",rollback:"Set enabled to false to restore every legacy character immediately."});
  const v5Families=Object.freeze({
    warrior:{male:{radiant:{id:"dawnscale",name:"Dawnscale"},shadow:{id:"eclipse",name:"Eclipse"}},female:{radiant:{id:"sunshield",name:"Sunshield"},shadow:{id:"nightwyrm",name:"Nightwyrm"}}},
    ranger:{male:{radiant:{id:"dawnfeather",name:"Dawnfeather"},shadow:{id:"nightfang",name:"Nightfang"}},female:{radiant:{id:"sunleaf",name:"Sunleaf"},shadow:{id:"moonshadow",name:"Moonshadow"}}},
    mage:{male:{radiant:{id:"starfire",name:"Starfire"},shadow:{id:"voidcore",name:"Voidcore"}},female:{radiant:{id:"celestial",name:"Celestial"},shadow:{id:"eclipse-witch",name:"Eclipse Witch"}}},
    healer:{male:{radiant:{id:"dawnkeeper",name:"Dawnkeeper"},shadow:{id:"mooncleric",name:"Mooncleric"}},female:{radiant:{id:"dawnwing",name:"Dawnwing"},shadow:{id:"twilight",name:"Twilight"}}}
  });
  const v5Tiers=Object.freeze([
    {id:"starter",name:"Initiate",min:1,max:4},
    {id:"level-05",name:"Adept",min:5,max:9},
    {id:"level-10",name:"Veteran",min:10,max:14},
    {id:"level-15",name:"Champion",min:15,max:19},
    {id:"level-20",name:"Ascendant",min:20,max:20}
  ]);
  function normalizedEmail(value){return String(value||"").trim().toLowerCase()}
  function isV5Tester(profile={},email=""){return v5Config.enabled&&normalizedEmail(email||profile.email)===v5Config.testerEmail}
  const v5SkinTones=Object.freeze({light:{name:"Light",color:"#e8ae8b"},medium:{name:"Medium",color:"#b06746"},deep:{name:"Deep",color:"#693f34"}});
  const v5HairColors=Object.freeze({dark:{name:"Dark",color:"#221d2b"},brown:{name:"Brown",color:"#5b3726"},silver:{name:"Silver",color:"#b9c2d2"}});
  function v5SkinTone(profile={}){return Object.hasOwn(v5SkinTones,String(profile.characterV5SkinTone||""))?String(profile.characterV5SkinTone):"medium"}
  function v5HairColor(profile={}){return Object.hasOwn(v5HairColors,String(profile.characterV5HairColor||""))?String(profile.characterV5HairColor):"dark"}
  function hasV5Selection(profile={}){return profile.characterSystemVersion==="v5"&&["male","female"].includes(profile.characterV5Gender)&&["radiant","shadow"].includes(profile.characterV5Affinity)&&Object.hasOwn(classes,String(profile.characterV5ClassId||""))}
  function v5SelectionRequired(profile={},email=""){return isV5Tester(profile,email)&&!hasV5Selection(profile)}
  function characterClassId(profile={}){return isV5Tester(profile)&&hasV5Selection(profile)?String(profile.characterV5ClassId):String(profile.classId||"")}
  function v5TierForLevel(value){const level=Math.max(1,Math.min(20,Number(value)||1));return v5Tiers.find(tier=>level>=tier.min&&level<=tier.max)||v5Tiers[0]}
  function resolveV5Character(profile={}){
    if(!isV5Tester(profile)||!hasV5Selection(profile))return null;
    const classId=characterClassId(profile),gender=profile.characterV5Gender,affinity=profile.characterV5Affinity,family=v5Families[classId]?.[gender]?.[affinity];
    if(!family)return null;
    const level=Number(profile.level)||levelForXp(profile.xp),tier=v5TierForLevel(level),id=`${classId}-${family.id}-${tier.id}`,skinTone=v5SkinTone(profile),hairColor=v5HairColor(profile),base=`assets/rpg/v5/${classId}/${id}`,layers=`assets/rpg/v5-appearance/layers/${classId}/${id}`;
    const action=classId==="healer"?"heal":"attack";
    return {id,name:`${family.name} ${tier.name}`,classId,gender,affinity,skinTone,hairColor,familyId:family.id,familyName:family.name,tierId:tier.id,tierName:tier.name,levelMin:tier.min,levelMax:tier.max,appearance:true,v5:true,v5Base:base,v5LayerBase:layers,
      art:`${base}/static.webp`,skinArt:`${base}/static.webp`,idleArt:`${base}/idle.webp`,playArt:`${base}/happy.webp`,walkLeftArt:`${base}/walk-left.webp`,walkRightArt:`${base}/walk-right.webp`,attackArt:`${base}/${action}.webp`,healArt:`${base}/${action}.webp`,abilityArt:`${base}/${action}.webp`,hurtArt:`${base}/hurt.webp`,happyArt:`${base}/happy.webp`,celebrateArt:`${base}/celebrate.webp`};
  }
  function v5StateFile(pack,state="idle"){
    let key=String(state||"idle").replace(/Art$/i,"");
    const names={art:"static",skin:"static",static:"static",idle:"idle",play:"happy",walkLeft:"walk-left",walkRight:"walk-right",attack:pack?.classId==="healer"?"heal":"attack",heal:pack?.classId==="healer"?"heal":"attack",ability:pack?.classId==="healer"?"heal":"attack",hurt:"hurt",happy:"happy",celebrate:"celebrate"};
    return names[key]||"idle";
  }
  function v5Path(path,prefix="",version=""){
    const value=String(path||"");
    const resolved=/^(?:https?:|data:|blob:|\/)/i.test(value)?value:`${prefix||""}${value}`;
    return version?`${resolved}${resolved.includes("?")?"&":"?"}v=${encodeURIComponent(version)}`:resolved;
  }
  function v5StatePaths(pack,state="idle",options={}){
    if(!pack?.v5)return null;
    const file=v5StateFile(pack,state),prefix=String(options.prefix||""),version=String(options.version||"");
    return {base:v5Path(`${pack.v5Base}/${file}.webp`,prefix,version),skin:v5Path(`${pack.v5LayerBase}/${file}-skin.webp`,prefix,version),hair:v5Path(`${pack.v5LayerBase}/${file}-hair.webp`,prefix,version)};
  }
  function v5Attr(value){return String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]))}
  const v5FrameCache=new Map(),v5TintCache=new Map(),v5CanvasRuns=new WeakMap();
  function v5MotionTimeline(pack,state="idle"){
    const file=v5StateFile(pack,state);
    if(file==="static")return[1000];
    if(file==="idle")return[360,360,360,360];
    if(file==="walk-left"||file==="walk-right")return[120,120,120,120,120,120];
    if(file==="heal")return[160,130,170,180,240];
    if(file==="attack"&&pack?.classId==="warrior")return[150,105,125,165,260];
    if(file==="attack"&&pack?.classId==="ranger")return[150,120,115,160,260];
    if(file==="attack"&&pack?.classId==="mage")return[150,120,150,170,240];
    if(file==="attack")return[150,120,150,170,240];
    if(file==="hurt")return[160,190,170,300];
    if(file==="happy")return[160,130,170,130,180,260];
    if(file==="celebrate")return[130,110,140,190,140,110,160,280];
    return[250];
  }
  function v5Rgb(value){const hex=String(value||"").replace("#","");return hex.length===6?[parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16)]:[255,255,255]}
  async function v5DecodeFrames(url){
    if(v5FrameCache.has(url))return v5FrameCache.get(url);
    const promise=(async()=>{
      if(!window.ImageDecoder||!window.createImageBitmap)throw Error("Animated canvas decoding is unavailable");
      const response=await fetch(url,{cache:"force-cache"});if(!response.ok)throw Error(`V5 art ${response.status}: ${url}`);
      const decoder=new ImageDecoder({data:new Uint8Array(await response.arrayBuffer()),type:"image/webp",preferAnimation:true});
      await decoder.tracks.ready;const count=Math.max(1,Number(decoder.tracks.selectedTrack?.frameCount)||1),frames=[];
      for(let index=0;index<count;index++){const result=await decoder.decode({frameIndex:index,completeFramesOnly:true}),bitmap=await createImageBitmap(result.image);result.image.close();frames.push(bitmap)}
      decoder.close();return frames;
    })();v5FrameCache.set(url,promise);return promise;
  }
  async function v5TintFrames(url,color,kind){
    const key=`${url}|${color}|${kind}`;if(v5TintCache.has(key))return v5TintCache.get(key);
    const promise=(async()=>{const rgb=v5Rgb(color),source=await v5DecodeFrames(url),frames=[];
      for(const bitmap of source){const canvas=document.createElement("canvas");canvas.width=bitmap.width;canvas.height=bitmap.height;const context=canvas.getContext("2d",{willReadFrequently:true});context.drawImage(bitmap,0,0);const pixels=context.getImageData(0,0,canvas.width,canvas.height),data=pixels.data;
        for(let i=0;i<data.length;i+=4){if(!data[i+3])continue;const shade=data[i]/255,factor=kind==="skin"?.76+.34*shade:.58+.50*shade;data[i]=Math.min(255,Math.round(rgb[0]*factor));data[i+1]=Math.min(255,Math.round(rgb[1]*factor));data[i+2]=Math.min(255,Math.round(rgb[2]*factor))}
        context.putImageData(pixels,0,0);frames.push(await createImageBitmap(canvas))}
      return frames;
    })();v5TintCache.set(key,promise);return promise;
  }
  function v5DrawCanvas(canvas,base,skin,hair,index){const context=canvas.getContext("2d");context.clearRect(0,0,canvas.width,canvas.height);context.drawImage(base[index%base.length],0,0,canvas.width,canvas.height);context.drawImage(skin[index%skin.length],0,0,canvas.width,canvas.height);context.drawImage(hair[index%hair.length],0,0,canvas.width,canvas.height)}
  function v5FallbackCanvas(canvas){canvas.hidden=true;const image=document.createElement("img");image.className="dw-v5-fallback";image.src=canvas.dataset.base;image.alt="";image.decoding="async";canvas.after(image)}
  async function v5HydrateCanvas(canvas){
    if(!canvas||canvas.dataset.ready||v5CanvasRuns.has(canvas))return;v5CanvasRuns.set(canvas,true);
    try{const [base,skin,hair]=await Promise.all([v5DecodeFrames(canvas.dataset.base),v5TintFrames(canvas.dataset.skin,canvas.dataset.skinColor,"skin"),v5TintFrames(canvas.dataset.hair,canvas.dataset.hairColor,"hair")]);if(!canvas.isConnected)return;
      const timeline=String(canvas.dataset.timeline||"1000").split(",").map(Number).filter(x=>x>0),duration=timeline.reduce((sum,value)=>sum+value,0)||1000,cumulative=[];timeline.reduce((sum,value,index)=>(cumulative[index]=sum+value,sum+value),0);let last=-1,start=performance.now();canvas.dataset.ready="true";
      const tick=now=>{if(!canvas.isConnected)return;const elapsed=(now-start)%duration,index=Math.max(0,cumulative.findIndex(end=>elapsed<end)),frame=index<0?0:index;if(frame!==last){v5DrawCanvas(canvas,base,skin,hair,frame);last=frame}requestAnimationFrame(tick)};requestAnimationFrame(tick);
    }catch(error){console.warn("[Dragonswood V5 synchronized renderer]",error);if(canvas.isConnected)v5FallbackCanvas(canvas)}
  }
  function v5HydrateRoot(root){if(!root)return;if(root.matches?.("canvas.dw-v5-canvas"))v5HydrateCanvas(root);root.querySelectorAll?.("canvas.dw-v5-canvas").forEach(v5HydrateCanvas)}
  function ensureV5Renderer(doc=window.document){
    if(!doc||doc.getElementById("dw-v5-renderer-style"))return;
    const style=doc.createElement("style");style.id="dw-v5-renderer-style";style.textContent='.dw-v5-character{display:block;position:relative;width:100%;height:100%;min-height:0;line-height:0}.dw-v5-character>.dw-v5-canvas,.dw-v5-character>.dw-v5-fallback{position:absolute;inset:0;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:contain!important;filter:drop-shadow(0 10px 7px #0008)}.class-card>.dw-v5-character{height:200px}.shop-intro>.dw-v5-character{height:190px}.hero-v5-art{width:100%;height:270px}@media(max-width:900px){.hero-v5-art{height:190px}}';(doc.head||doc.documentElement).appendChild(style);
    const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)v5HydrateRoot(node)})));observer.observe(doc.documentElement,{childList:true,subtree:true});v5HydrateRoot(doc);
  }
  function v5Markup(pack,state="idle",options={}){
    if(!pack?.v5)return "";ensureV5Renderer(options.document||window.document);const paths=v5StatePaths(pack,state,options),label=v5Attr(options.alt||pack.name||"V5 adventurer"),skin=Object.hasOwn(v5SkinTones,pack.skinTone)?pack.skinTone:"medium",hair=Object.hasOwn(v5HairColors,pack.hairColor)?pack.hairColor:"dark",extra=v5Attr(options.className||""),timeline=v5MotionTimeline(pack,state).join(",");
    return `<span class="dw-v5-character${extra?` ${extra}`:""}" role="img" aria-label="${label}"><canvas class="dw-v5-canvas" width="320" height="320" aria-hidden="true" data-base="${v5Attr(paths.base)}" data-skin="${v5Attr(paths.skin)}" data-hair="${v5Attr(paths.hair)}" data-skin-color="${v5Attr(v5SkinTones[skin].color)}" data-hair-color="${v5Attr(v5HairColors[hair].color)}" data-timeline="${timeline}"></canvas></span>`;
  }
  function renderV5Character(host,pack,state="idle",options={}){if(!host||!pack?.v5)return false;host.innerHTML=v5Markup(pack,state,options);v5HydrateRoot(host);return true}
  function resolveAppearance(profile={}){const v5=resolveV5Character(profile);if(v5)return v5;const id=String(profile?.rpgEquipped?.appearance||"").trim();if(!id)return null;return items.find(item=>item.id===id&&item.appearance===true&&item.classId===String(profile.classId||""))||null}
  function resolveBackground(profile={}){const ids=new Set(["fairy-purple","fairy-bamboo","fairy-mushroom","crystal-cave","jungle","mountain-night","snow-aurora","snow-village"]),id=String(profile.homeBackgroundId||"fairy-purple");return ids.has(id)?{id,art:`assets/rpg/backgrounds/${id}.webp`}:null}
  function inventory(profile={}){return Array.isArray(profile.rpgInventory)?profile.rpgInventory.map(String):[]}
  function dailyXp(profile={}){return String(profile.dailyXpDate||"")===dateKey()?Math.max(0,Math.min(150,Number(profile.dailyXpEarned)||0)):0}

  window.DWRPG={classes,pets,prestigePets,petRegistry,enemies,items,appearancePacks,v5Config,v5Families,v5Tiers,v5SkinTones,v5HairColors,v5SkinTone,v5HairColor,dateKey,levelForXp,hash,dailyEnemy,canonicalPetId,resolvePet,isV5Tester,hasV5Selection,v5SelectionRequired,characterClassId,v5TierForLevel,resolveV5Character,v5StatePaths,v5MotionTimeline,v5Markup,renderV5Character,ensureV5Renderer,resolveAppearance,resolveBackground,inventory,dailyXp,version:"56.32-v5.3.8-tester"};
})();
