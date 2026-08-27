(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.DWKingdomWars=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const VERSION='1.5.0-real-raids';
  const MAX_BUILDING_LEVEL=5;
  const HEALTH_THRESHOLDS=Object.freeze({burning:.25,damaged:.65});
  const DEFAULT_CONFIG=Object.freeze({
    enabled:true,
    raidingEnabled:true,
    friendlyEnabled:true,
    maxDailyRaids:1,
    shieldHours:8,
    starterShieldHours:48,
    seasonStartShieldHours:24,
    antiTargetHours:48,
    claimCapHours:12,
    starterBoostHours:120,
    starterBoostMultiplier:1.75,
    protectedResourceFloor:100,
    lootPercent:0.10,
    maxLootPerResource:75,
    rankedVariance:0.07,
    matchTicketMinutes:15,
    targetRefreshCooldownSeconds:2,
    scoutCooldownSeconds:1,
    maxMatchScore:0.42,
    maxFriendlyPerDay:8,
    maxFriendlyPerTargetPerDay:3,
    raidDamageMinTargets:2,
    raidDamageMaxTargets:4,
    raidDamageMinPercent:0.14,
    raidDamageMaxPercent:0.42,
    activeSeasonId:'season-1',
    seasonName:'Season 1',
    seasonResetMode:'crowns',
    defaultCohortId:'default'
  });

  const RESOURCE_KEYS=Object.freeze(['timber','stone','essence']);
  const STRATEGIES=Object.freeze({
    assault:{id:'assault',name:'Assault',icon:'⚔️',description:'Direct force. Warriors excel here; strong walls blunt it.'},
    flank:{id:'flank',name:'Flank',icon:'🏹',description:'A mobile strike. Rangers excel here; Ranger Towers punish it.'},
    magic:{id:'magic',name:'Magic',icon:'✨',description:'Arcane pressure. Mages excel here; Mage Towers resist it.'},
    sneak:{id:'sneak',name:'Sneak',icon:'🕵️',description:'A surprise raid. Watchtowers make it harder, but successful loot improves.'}
  });
  const DEFENSES=Object.freeze({
    fortify:{id:'fortify',name:'Fortify',icon:'🛡️',description:'Reliable all-around defense.'},
    patrol:{id:'patrol',name:'Patrol',icon:'🏇',description:'Especially strong against Flank raids.'},
    ward:{id:'ward',name:'Arcane Ward',icon:'🔮',description:'Especially strong against Magic raids.'},
    vigilance:{id:'vigilance',name:'Vigilance',icon:'👁️',description:'Especially strong against Sneak raids.'}
  });

  const BUILDINGS=Object.freeze({
    keep:{id:'keep',name:'Keep',icon:'🏰',category:'core',startsAt:1,description:'Controls kingdom level and the maximum level of every other building.',baseCost:{timber:120,stone:160,essence:40},costScale:1.72,power:{attack:6,defense:4}},
    walls:{id:'walls',name:'Walls',icon:'🧱',category:'defense',startsAt:1,description:'The strongest general defensive upgrade, especially against Assault.',baseCost:{timber:70,stone:150,essence:10},costScale:1.66,power:{attack:1,defense:2}},
    watchtower:{id:'watchtower',name:'Watchtower',icon:'👁️',category:'defense',startsAt:0,description:'Improves scouting and protects against Sneak raids.',baseCost:{timber:120,stone:95,essence:35},costScale:1.63,power:{attack:1,defense:2}},
    rangerTower:{id:'rangerTower',name:'Ranger Tower',icon:'🏹',category:'defense',startsAt:0,description:'Adds defense and specializes against Flank attacks.',baseCost:{timber:155,stone:110,essence:20},costScale:1.64,power:{attack:3,defense:3}},
    mageTower:{id:'mageTower',name:'Mage Tower',icon:'🔮',category:'defense',startsAt:0,description:'Adds magical offense and specializes against Magic attacks.',baseCost:{timber:90,stone:105,essence:120},costScale:1.67,power:{attack:5,defense:3}},
    creatureDen:{id:'creatureDen',name:'Creature Den',icon:'🐾',category:'support',startsAt:0,description:'Lets an owned active pet reinforce both raids and defense.',baseCost:{timber:145,stone:75,essence:75},costScale:1.62,power:{attack:3,defense:3}},
    petStable:{id:'petStable',name:'Pet Stable / Hatchery',icon:'🥚',category:'support',startsAt:0,description:'A home for eggs and companions. Strengthens an active pet’s contribution to kingdom defense.',baseCost:{timber:135,stone:90,essence:95},costScale:1.63,power:{attack:1,defense:2}},
    lumberMill:{id:'lumberMill',name:'Lumber Mill',icon:'🪵',category:'production',startsAt:1,description:'Produces Timber while the student is away.',baseCost:{timber:90,stone:55,essence:10},costScale:1.60,production:{timber:10}},
    quarry:{id:'quarry',name:'Quarry',icon:'🪨',category:'production',startsAt:1,description:'Produces Stone while the student is away.',baseCost:{timber:70,stone:80,essence:10},costScale:1.60,production:{stone:8}},
    essenceWell:{id:'essenceWell',name:'Essence Well',icon:'✨',category:'production',startsAt:1,description:'Produces Essence while the student is away.',baseCost:{timber:60,stone:65,essence:55},costScale:1.64,production:{essence:5}}
  });

  function n(v,fallback=0){const x=Number(v);return Number.isFinite(x)?x:fallback}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function round(v,places=0){const p=10**places;return Math.round(v*p)/p}
  function clone(v){return JSON.parse(JSON.stringify(v))}
  function timeMs(v){if(v&&typeof v.toMillis==='function')return v.toMillis();if(v instanceof Date)return v.getTime();if(typeof v==='number')return v;const t=new Date(v).getTime();return Number.isFinite(t)?t:0}
  function hoursBetween(a,b){return Math.max(0,(timeMs(b)-timeMs(a))/3600000)}
  function hash32(input){let h=2166136261>>>0;const s=String(input??'');for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h>>>0}
  function seeded01(seed,label=''){let x=(hash32(`${seed}|${label}`)||0x9e3779b9)>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967295}
  function seededRange(seed,label,min,max){return min+(max-min)*seeded01(seed,label)}

  function defaultBuildings(){const out={};for(const [id,b] of Object.entries(BUILDINGS))out[id]=b.startsAt||0;return out}
  function defaultKingdomPublic(ownerId='',displayName='Adventurer'){
    return {ownerId,displayName,kingdomName:`${displayName}'s Keep`,seasonId:DEFAULT_CONFIG.activeSeasonId,cohortId:DEFAULT_CONFIG.defaultCohortId,keepLevel:1,kingdomLevel:1,crowns:0,powerRating:100,visualTheme:'dragonswood',bannerId:'dragon-gold',shieldUntil:null,defenseStrategy:'fortify',pvpDisabled:false};
  }
  function defaultKingdomPrivate(){
    return {timber:240,stone:220,essence:140,buildings:defaultBuildings(),lastResourceClaim:null,catchupUntil:null,raidDate:'',raidsUsed:0,lastRaidAt:null,recentRankedTargets:[],battleFeed:[],friendlyDate:'',friendlyUsed:0,friendlyDailyTargets:[],matchTicket:null,rankedWins:0,rankedLosses:0,defenseWins:0,timesRaided:0,friendlyChallenges:0,pvpDisabledReason:''};
  }

  function buildingCost(id,currentLevel){
    const b=BUILDINGS[id];if(!b)throw new Error(`Unknown building: ${id}`);
    const lvl=clamp(Math.floor(n(currentLevel)),0,MAX_BUILDING_LEVEL);if(lvl>=MAX_BUILDING_LEVEL)return null;
    const factor=b.costScale**Math.max(0,lvl),out={};for(const r of RESOURCE_KEYS)out[r]=Math.max(0,Math.round(n(b.baseCost?.[r])*factor));return out;
  }
  function canUpgrade(buildings,id,resources){
    const current=clamp(Math.floor(n(buildings?.[id])),0,MAX_BUILDING_LEVEL);if(current>=MAX_BUILDING_LEVEL)return {ok:false,reason:'MAX_LEVEL'};
    const keep=clamp(Math.floor(n(buildings?.keep,1)),1,MAX_BUILDING_LEVEL);if(id!=='keep'&&current>=keep)return {ok:false,reason:'KEEP_TOO_LOW'};
    const cost=buildingCost(id,current);for(const r of RESOURCE_KEYS)if(n(resources?.[r])<n(cost?.[r]))return {ok:false,reason:'NOT_ENOUGH_RESOURCES',missing:r,cost};return {ok:true,cost,nextLevel:current+1};
  }
  function applyUpgrade(buildings,resources,id){
    const check=canUpgrade(buildings,id,resources);if(!check.ok)return {ok:false,...check};
    const nextBuildings={...buildings,[id]:Math.floor(n(buildings?.[id]))+1},nextResources={...resources};for(const r of RESOURCE_KEYS)nextResources[r]=Math.max(0,Math.floor(n(nextResources[r])-n(check.cost[r])));return {ok:true,buildings:nextBuildings,resources:nextResources,cost:check.cost,nextLevel:check.nextLevel};
  }

  function productionPerHour(buildings){
    const result={timber:0,stone:0,essence:0};
    for(const [id,b] of Object.entries(BUILDINGS)){const level=clamp(Math.floor(n(buildings?.[id])),0,MAX_BUILDING_LEVEL);if(!b.production||!level)continue;for(const r of RESOURCE_KEYS)result[r]+=n(b.production[r])*level}
    return result;
  }
  function claimableProduction(buildings,lastClaimAt,now,config=DEFAULT_CONFIG,boostUntil=null,boostMultiplier=1){
    if(!lastClaimAt)return {hours:0,boostedHours:0,perHour:productionPerHour(buildings),effectivePerHour:productionPerHour(buildings),gained:{timber:0,stone:0,essence:0}};
    const end=timeMs(now),rawStart=timeMs(lastClaimAt),capHours=Math.max(0,n(config.claimCapHours,12)),start=Math.max(rawStart,end-capHours*3600000),hours=Math.max(0,(end-start)/3600000);
    const boostEnd=Math.min(end,timeMs(boostUntil));const boostedHours=boostEnd>start?Math.max(0,(boostEnd-start)/3600000):0;const normalHours=Math.max(0,hours-boostedHours);const mult=Math.max(1,n(boostMultiplier,1));
    const perHour=productionPerHour(buildings),gained={},effectivePerHour={};
    for(const r of RESOURCE_KEYS){gained[r]=Math.floor(perHour[r]*(normalHours+boostedHours*mult));effectivePerHour[r]=round(perHour[r]*(boostedHours>0?mult:1),1)}
    return {hours:round(hours,2),boostedHours:round(boostedHours,2),perHour,effectivePerHour,gained};
  }

  const CLASS_BASE=Object.freeze({warrior:{attack:16,defense:15},ranger:{attack:18,defense:12},mage:{attack:20,defense:10},healer:{attack:14,defense:17}});
  const GEAR_SLOT_BONUS=Object.freeze({weapon:{attack:4,defense:0},offhand:{attack:0,defense:4},armor:{attack:0,defense:4},outfit:{attack:1,defense:3},head:{attack:0,defense:2},back:{attack:1,defense:2},accessory:{attack:2,defense:2}});

  function studentRpgPower(student){
    student=student||{};const cls=CLASS_BASE[student.classId]||CLASS_BASE.warrior,xp=Math.max(0,n(student.xp)),xpTier=clamp(Math.floor(xp/100),0,20);let attack=cls.attack+xpTier*1.3,defense=cls.defense+xpTier*1.2;
    const owned=new Set(Array.isArray(student.rpgInventory)?student.rpgInventory:[]),equipped=student.rpgEquipped&&typeof student.rpgEquipped==='object'?student.rpgEquipped:{};let equippedCount=0;
    for(const [slot,id] of Object.entries(equipped)){if(slot==='appearance'||!id||!owned.has(id))continue;const bonus=GEAR_SLOT_BONUS[slot];if(!bonus)continue;equippedCount++;attack+=bonus.attack;defense+=bonus.defense}
    const ownedPets=new Set(Array.isArray(student.ownedPets)?student.ownedPets:[]),hasPet=!!student.activePet&&ownedPets.has(student.activePet);if(hasPet){attack+=3;defense+=3}
    return {attack:round(attack,1),defense:round(defense,1),xpTier,equippedCount,hasPet,classId:student.classId||'warrior'};
  }

  function kingdomBuildingPower(buildings,strategy,defenseStrategy='fortify',hasPet=false,buildingHealth=null){
    const lvl=id=>clamp(Math.floor(n(buildings?.[id])),0,MAX_BUILDING_LEVEL);
    const healthFactor=id=>{const level=lvl(id);if(!level)return 0;const max=buildingMaxHp(id,level),row=buildingHealth?.[id];if(!row||!max)return 1;const ratio=clamp(n(row.hp,max)/Math.max(1,max),0,1);if(ratio<=0)return 0;if(ratio<=HEALTH_THRESHOLDS.burning)return .25;if(ratio<=HEALTH_THRESHOLDS.damaged)return .6;return 1};
    const eff=id=>lvl(id)*healthFactor(id);let attack=0,defense=0;
    for(const [id,b] of Object.entries(BUILDINGS)){const level=eff(id);attack+=n(b.power?.attack)*level;defense+=n(b.power?.defense)*level}
    if(strategy==='assault')defense+=eff('walls')*2;
    if(strategy==='flank')defense+=eff('rangerTower')*4;
    if(strategy==='magic')defense+=eff('mageTower')*4;
    if(strategy==='sneak')defense+=eff('watchtower')*4;
    if(defenseStrategy==='fortify')defense*=1.06;
    if(defenseStrategy==='patrol'&&strategy==='flank')defense*=1.12;
    if(defenseStrategy==='ward'&&strategy==='magic')defense*=1.12;
    if(defenseStrategy==='vigilance'&&strategy==='sneak')defense*=1.12;
    if(hasPet&&eff('creatureDen')>0){attack+=eff('creatureDen');defense+=eff('creatureDen')*2}
    if(hasPet&&eff('petStable')>0){attack+=eff('petStable')*.5;defense+=eff('petStable')*1.5}
    return {attack:round(attack,1),defense:round(defense,1)};
  }
  function classStrategyMultiplier(classId,strategy){
    if(classId==='warrior'&&strategy==='assault')return 1.12;
    if(classId==='ranger'&&strategy==='flank')return 1.12;
    if(classId==='mage'&&strategy==='magic')return 1.12;
    if(classId==='healer')return 1.07;
    return 1;
  }
  function classDefenseMultiplier(classId){return classId==='healer'?1.08:1}
  function strategyAttackMultiplier(strategy){return strategy==='sneak'?1.04:1}

  function powerSnapshot(student,kingdomPrivate,kingdomPublic,strategy='assault'){
    const rpg=studentRpgPower(student),building=kingdomBuildingPower(kingdomPrivate?.buildings,strategy,kingdomPublic?.defenseStrategy||'fortify',rpg.hasPet,kingdomPrivate?.buildingHealth);
    const attack=(rpg.attack+building.attack)*classStrategyMultiplier(rpg.classId,strategy)*strategyAttackMultiplier(strategy),defense=(rpg.defense+building.defense)*classDefenseMultiplier(rpg.classId);
    const rating=Math.round((attack+defense)*2.5+Math.max(0,n(kingdomPublic?.crowns))*0.08);return {attack:round(attack,1),defense:round(defense,1),rating,rpg,building};
  }
  function estimateDifficulty(attackerRating,defenderRating){const ratio=n(defenderRating,1)/Math.max(1,n(attackerRating,1));if(ratio<=0.82)return{id:'easy',label:'Favorable',icon:'🟢'};if(ratio<=1.08)return{id:'fair',label:'Fair Fight',icon:'🟡'};if(ratio<=1.32)return{id:'tough',label:'Tough',icon:'🟠'};return{id:'dangerous',label:'Dangerous',icon:'🔴'}}
  function matchmakingScore(attacker,defender){const powerGap=Math.abs(n(attacker?.powerRating,100)-n(defender?.powerRating,100))/Math.max(100,n(attacker?.powerRating,100)),crownGap=Math.abs(n(attacker?.crowns)-n(defender?.crowns))/200,keepGap=Math.abs(n(attacker?.keepLevel,1)-n(defender?.keepLevel,1))/5;return round(powerGap*.65+crownGap*.20+keepGap*.15,4)}
  function isFairMatch(attacker,defender,config=DEFAULT_CONFIG){if(!attacker||!defender)return false;if(Math.abs(n(attacker.keepLevel,1)-n(defender.keepLevel,1))>2)return false;return matchmakingScore(attacker,defender)<=Math.max(.05,n(config.maxMatchScore,.42))}

  function resourceLoot(defenderResources,seed,strategy,config=DEFAULT_CONFIG){
    const loot={},floor=Math.max(0,n(config.protectedResourceFloor,100)),pct=clamp(n(config.lootPercent,.1),0,.25),maxLoot=Math.max(0,n(config.maxLootPerResource,75));
    for(const r of RESOURCE_KEYS){const stealable=Math.max(0,Math.floor(n(defenderResources?.[r])-floor)),swing=seededRange(seed,`loot-${r}`,.85,1.15);loot[r]=Math.min(maxLoot,Math.max(0,Math.floor(stealable*pct*swing)))}
    if(strategy==='sneak')for(const r of RESOURCE_KEYS)loot[r]=Math.min(maxLoot,Math.floor(loot[r]*1.15));return loot;
  }
  function crownCatchupBonus(attackerCrowns,defenderCrowns){const gap=n(defenderCrowns)-n(attackerCrowns);if(gap>=100)return 3;if(gap>=50)return 2;if(gap>=25)return 1;return 0}

  function resolveRaid({attackerStudent,defenderStudent,attackerKingdom,defenderKingdom,attackerPrivate,defenderPrivate,strategy='assault',seed='raid',config=DEFAULT_CONFIG,friendly=false}){
    if(!STRATEGIES[strategy])throw new Error(`Invalid strategy: ${strategy}`);
    const atk=powerSnapshot(attackerStudent,attackerPrivate,attackerKingdom,strategy),def=powerSnapshot(defenderStudent,defenderPrivate,defenderKingdom,strategy),variance=clamp(n(config.rankedVariance,.07),0,.15),attackRoll=1+seededRange(seed,'attack-roll',-variance,variance),defenseRoll=1+seededRange(seed,'defense-roll',-variance,variance),attackScore=atk.attack*attackRoll,defenseScore=def.defense*defenseRoll,victory=attackScore>=defenseScore,ratio=attackScore/Math.max(1,defenseScore),difficulty=estimateDifficulty(atk.rating,def.rating);
    let loot={timber:0,stone:0,essence:0},attackerCrownDelta=0,defenderCrownDelta=0,catchupBonus=0;
    if(!friendly){
      if(victory){loot=resourceLoot(defenderPrivate,seed,strategy,config);const hardBonus=difficulty.id==='dangerous'?5:difficulty.id==='tough'?3:difficulty.id==='fair'?1:0;catchupBonus=crownCatchupBonus(attackerKingdom?.crowns,defenderKingdom?.crowns);attackerCrownDelta=8+hardBonus+catchupBonus;defenderCrownDelta=-Math.min(Math.max(0,n(defenderKingdom?.crowns)),5+hardBonus)}
      else{attackerCrownDelta=-Math.min(Math.max(0,n(attackerKingdom?.crowns)),attackerStudent?.classId==='healer'?2:3);defenderCrownDelta=4}
    }
    const buildingDamage=!friendly&&victory?raidDamagePlan(defenderPrivate?.buildings,defenderPrivate?.buildingHealth,strategy,ratio,seed,config):{};
    return {version:VERSION,seed,strategy,victory,friendly,difficulty,attackScore:round(attackScore,1),defenseScore:round(defenseScore,1),ratio:round(ratio,3),attackerSnapshot:atk,defenderSnapshot:def,loot,attackerCrownDelta,defenderCrownDelta,catchupBonus,buildingDamage};
  }
  function applyRankedResult(attackerPublic,defenderPublic,attackerPrivate,defenderPrivate,result){
    if(result.friendly)throw new Error('Friendly results must not mutate resources, crowns, or building health.');
    const aPub=clone({...attackerPublic,crowns:Math.max(0,n(attackerPublic?.crowns)+n(result.attackerCrownDelta))}),dPub=clone({...defenderPublic,crowns:Math.max(0,n(defenderPublic?.crowns)+n(result.defenderCrownDelta))}),aPriv=clone(attackerPrivate||{}),dPriv=clone(defenderPrivate||{});
    for(const r of RESOURCE_KEYS){const requested=Math.max(0,Math.floor(n(result.loot?.[r]))),available=Math.max(0,Math.floor(n(dPriv[r]))),moved=Math.min(requested,available);aPriv[r]=Math.max(0,Math.floor(n(aPriv[r])+moved));dPriv[r]=available-moved}
    const damaged=applyBuildingDamage(dPriv.buildings,dPriv.buildingHealth,result.buildingDamage||{});dPriv.buildingHealth=damaged.health;
    return {attackerPublic:aPub,defenderPublic:dPub,attackerPrivate:aPriv,defenderPrivate:dPriv,damageApplied:damaged.applied};
  }

  function scoutRange(value,seed,label,scoutLevel=0){value=Math.max(0,n(value));const spread=clamp(.12-clamp(n(scoutLevel),0,5)*.014,.05,.12),jitter=seededRange(seed,label,-.01,.01),s=clamp(spread+jitter,.045,.13);return {min:Math.max(0,Math.floor(value*(1-s))),max:Math.ceil(value*(1+s))}}
  function buildingBand(level){level=clamp(Math.floor(n(level)),0,MAX_BUILDING_LEVEL);if(level<=1)return'Low (0–1)';if(level<=3)return'Guarded (2–3)';return'Strong (4–5)'}
  function doctrineHint(id){return({fortify:'Heavy fortification signs',patrol:'Mounted patrol activity',ward:'Arcane warding signs',vigilance:'Extra sentries and watch posts'})[id]||'Defense plan unclear'}
  function scoutReport(defenderStudent,defenderPrivate,defenderPublic,seed='scout',scoutLevel=0){
    const snap=powerSnapshot(defenderStudent,defenderPrivate,defenderPublic,'assault'),level=clamp(Math.floor(n(scoutLevel)),0,5),ids=['walls','watchtower','rangerTower','mageTower'].sort((a,b)=>seeded01(seed,`intel-${a}`)-seeded01(seed,`intel-${b}`)),count=[1,1,2,2,3,4][level],buildingIntel=ids.slice(0,count).map(id=>({id,name:BUILDINGS[id].name,band:buildingBand(defenderPrivate?.buildings?.[id])})),defenseStrategy=defenderPublic?.defenseStrategy||'fortify';
    return {defense:scoutRange(snap.defense,seed,'defense',level),rating:scoutRange(snap.rating,seed,'rating',level),buildingIntel,doctrine:level>=5?{known:true,id:defenseStrategy,label:DEFENSES[defenseStrategy]?.name||defenseStrategy}:level>=3?{known:false,hint:doctrineHint(defenseStrategy)}:{known:false,hint:'Defense plan hidden'},activePet:!!snap.rpg.hasPet,classId:snap.rpg.classId,scoutLevel:level};
  }


  const BUILDING_HP_BASE=Object.freeze({keep:320,walls:260,watchtower:170,rangerTower:180,mageTower:165,creatureDen:175,petStable:180,lumberMill:145,quarry:180,essenceWell:155});
  function buildingMaxHp(id,level){const base=n(BUILDING_HP_BASE[id],150),lvl=clamp(Math.floor(n(level)),0,MAX_BUILDING_LEVEL);return lvl<=0?0:Math.round(base*(1+(lvl-1)*.28))}
  function defaultBuildingHealth(buildings){const out={};for(const id of Object.keys(BUILDINGS)){const maxHp=buildingMaxHp(id,buildings?.[id]);out[id]={hp:maxHp,maxHp,repairingUntil:0}}return out}
  function normalizeBuildingHealth(buildings,health){const out={};for(const id of Object.keys(BUILDINGS)){const maxHp=buildingMaxHp(id,buildings?.[id]),hasRow=!!health&&Object.prototype.hasOwnProperty.call(health,id)&&health[id]&&typeof health[id]==='object'&&!Array.isArray(health[id]),row=hasRow?health[id]:{},hp=maxHp?clamp(Math.round(hasRow?n(row.hp,maxHp):maxHp),0,maxHp):0;out[id]={hp,maxHp,repairingUntil:hasRow?Math.max(0,n(row.repairingUntil)):0}}return out}
  function buildingHealthState(row,now=Date.now()){if(!row||n(row.maxHp)<=0)return'none';if(n(row.repairingUntil)>timeMs(now))return'repair';if(n(row.hp)<=0)return'destroyed';const ratio=n(row.hp)/Math.max(1,n(row.maxHp));if(ratio<=HEALTH_THRESHOLDS.burning)return'burning';if(ratio<=HEALTH_THRESHOLDS.damaged)return'damaged';return'healthy'}
  function repairCost(id,level,row){const maxHp=Math.max(0,n(row?.maxHp,buildingMaxHp(id,level))),hp=clamp(n(row?.hp,maxHp),0,maxHp);if(!maxHp||hp>=maxHp)return{timber:0,stone:0,essence:0};const missing=(maxHp-hp)/maxHp,upgrade=buildingCost(id,Math.max(0,Math.floor(n(level))-1))||BUILDINGS[id]?.baseCost||{};const out={};for(const r of RESOURCE_KEYS)out[r]=Math.max(0,Math.ceil(n(upgrade[r])*missing*.58));return out}
  function canRepair(buildings,health,resources,id){const level=Math.floor(n(buildings?.[id]));if(level<=0)return{ok:false,reason:'NOT_BUILT'};const row=normalizeBuildingHealth(buildings,health)[id];if(row.hp>=row.maxHp)return{ok:false,reason:'FULL_HP',row,cost:{timber:0,stone:0,essence:0}};const cost=repairCost(id,level,row);for(const r of RESOURCE_KEYS)if(n(resources?.[r])<n(cost[r]))return{ok:false,reason:'NOT_ENOUGH_RESOURCES',missing:r,row,cost};return{ok:true,row,cost}}
  function applyRepair(buildings,health,resources,id,now=Date.now(),durationMs=2400){const check=canRepair(buildings,health,resources,id);if(!check.ok)return check;const nextResources={...resources};for(const r of RESOURCE_KEYS)nextResources[r]=Math.max(0,Math.floor(n(nextResources[r])-n(check.cost[r])));const nextHealth=normalizeBuildingHealth(buildings,health);nextHealth[id]={...nextHealth[id],hp:nextHealth[id].maxHp,repairingUntil:timeMs(now)+Math.max(0,n(durationMs,2400))};return{ok:true,id,cost:check.cost,health:nextHealth,resources:nextResources,row:nextHealth[id]}}
  function raidDamagePlan(buildings,health,strategy='assault',ratio=1,seed='raid-damage',config=DEFAULT_CONFIG){
    const normalized=normalizeBuildingHealth(buildings,health),priority={assault:['walls','keep','watchtower','lumberMill','quarry'],flank:['rangerTower','watchtower','lumberMill','quarry','walls'],magic:['mageTower','essenceWell','keep','creatureDen','petStable'],sneak:['watchtower','lumberMill','quarry','essenceWell','petStable']}[strategy]||[];
    const built=Object.keys(BUILDINGS).filter(id=>n(buildings?.[id])>0&&n(normalized[id]?.hp)>0);if(!built.length)return{};
    const minTargets=clamp(Math.floor(n(config.raidDamageMinTargets,2)),1,built.length),maxTargets=clamp(Math.floor(n(config.raidDamageMaxTargets,4)),minTargets,built.length),strength=clamp((n(ratio,1)-1)/.65,0,1),targetCount=clamp(Math.round(minTargets+(maxTargets-minTargets)*strength),minTargets,maxTargets);
    const ranked=built.map(id=>{const priorityIndex=priority.indexOf(id),priorityScore=priorityIndex>=0?(priority.length-priorityIndex)*.12:0;return{id,score:seeded01(seed,`target-${id}`)+priorityScore}}).sort((a,b)=>b.score-a.score).slice(0,targetCount);
    const minPct=clamp(n(config.raidDamageMinPercent,.14),.05,.5),maxPct=clamp(n(config.raidDamageMaxPercent,.42),minPct,.7),damage={};
    for(const [i,row] of ranked.entries()){const id=row.id,maxHp=normalized[id].maxHp,currentHp=normalized[id].hp,base=seededRange(seed,`pct-${id}-${i}`,minPct,maxPct),ratioBoost=1+strength*.22,keepCap=id==='keep'?.28:maxPct,pct=Math.min(keepCap,base*ratioBoost),amount=Math.min(currentHp,Math.max(1,Math.round(maxHp*pct)));damage[id]=amount}
    return damage;
  }
  function applyBuildingDamage(buildings,health,damageById){const next=normalizeBuildingHealth(buildings,health),applied={};for(const[id,amountRaw]of Object.entries(damageById||{})){if(!next[id]||next[id].maxHp<=0)continue;const amount=Math.max(0,Math.round(n(amountRaw)));const before=next[id].hp;next[id].hp=clamp(before-amount,0,next[id].maxHp);next[id].repairingUntil=0;applied[id]={before,after:next[id].hp,damage:before-next[id].hp,maxHp:next[id].maxHp,state:buildingHealthState(next[id])}}return{health:next,applied}}
  function testRaidDamage(buildings,health,seed='test-damage',count=3){const normalized=normalizeBuildingHealth(buildings,health),built=Object.keys(BUILDINGS).filter(id=>n(buildings?.[id])>0&&n(normalized[id]?.hp)>0);if(!built.length)return{health:normalized,applied:{}};const ranked=built.map(id=>({id,sort:seeded01(seed,id)})).sort((a,b)=>a.sort-b.sort).slice(0,clamp(Math.floor(n(count,3)),1,built.length)),damage={};for(const[idIndex,row]of ranked.entries()){const id=row.id,maxHp=buildingMaxHp(id,buildings[id]),pct=seededRange(seed,`damage-${id}-${idIndex}`,.18,.62);damage[id]=Math.max(1,Math.round(maxHp*pct))}return applyBuildingDamage(buildings,normalized,damage)}

  function builderScore(buildings){return Object.keys(BUILDINGS).reduce((sum,id)=>sum+clamp(Math.floor(n(buildings?.[id])),0,MAX_BUILDING_LEVEL),0)}
  function fortressRating(buildings,defenseStrategy='fortify'){const values=Object.keys(STRATEGIES).map(s=>kingdomBuildingPower(buildings,s,defenseStrategy,false).defense);return Math.round(values.reduce((a,b)=>a+b,0)/values.length)}

  return {VERSION,MAX_BUILDING_LEVEL,HEALTH_THRESHOLDS,DEFAULT_CONFIG,RESOURCE_KEYS,STRATEGIES,DEFENSES,BUILDINGS,BUILDING_HP_BASE,defaultBuildings,defaultKingdomPublic,defaultKingdomPrivate,buildingCost,canUpgrade,applyUpgrade,productionPerHour,claimableProduction,studentRpgPower,kingdomBuildingPower,classStrategyMultiplier,classDefenseMultiplier,strategyAttackMultiplier,powerSnapshot,estimateDifficulty,matchmakingScore,isFairMatch,resourceLoot,crownCatchupBonus,resolveRaid,applyRankedResult,scoutReport,builderScore,fortressRating,buildingMaxHp,defaultBuildingHealth,normalizeBuildingHealth,buildingHealthState,repairCost,canRepair,applyRepair,raidDamagePlan,applyBuildingDamage,testRaidDamage,hash32,seeded01,clamp,round,clone,timeMs};
});
