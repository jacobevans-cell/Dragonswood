import {eraName,buildingStageName} from './kingdom-visual-renderer.mjs';
import {renderStyledKingdom,STYLE_LABELS} from './kingdom-style-renderer.mjs';
import {PALETTES,CLASS_DEFAULT_PALETTE,paletteObject} from './kingdom-palette-engine.mjs';
import {requireKingdomTester} from './kingdom-wars-test-access.mjs';
import {initKingdomLife} from './kingdom-life.mjs';
import {SAVE_VERSION,VALID_STYLES,normalizeCustomPalette,normalizePersistedPrivate,normalizePersistedPublic,ticketIsValid,accrueProduction} from './kingdom-wars-state.mjs';
const K=window.DWKingdomWars;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Math.round(Number(n)||0).toLocaleString();
const money=r=>`🪵 ${fmt(r?.timber)} · 🪨 ${fmt(r?.stone)} · ✨ ${fmt(r?.essence)}`;
const CLASS_ART={warrior:'assets/rpg/class-warrior.png',ranger:'assets/rpg/class-ranger.png',mage:'assets/rpg/class-mage.png',healer:'assets/rpg/class-healer.png'};

const RPG=window.DWRPG||null;
const PET_REGISTRY=Array.isArray(window.DRAGONSWOOD_PET_REGISTRY)?window.DRAGONSWOOD_PET_REGISTRY:[];

function firstAsset(...values){
  const queue=values.flat(Infinity);
  for(const v of queue){
    if(typeof v==='string'&&v.trim())return v.trim();
    if(v&&typeof v==='object'){
      for(const key of ['src','url','idle','art','image','staticArt','idleArt']){
        if(typeof v[key]==='string'&&v[key].trim())return v[key].trim();
      }
    }
  }
  return '';
}
function petData(id){
  id=RPG?.canonicalPetId?.(id)||id;if(!id)return null;
  return PET_REGISTRY.find(p=>p?.id===id)
    || [...(RPG?.pets||[]),...(RPG?.prestigePets||[])].find(p=>p?.id===id)
    || null;
}
function petCandidates(p){
  if(!p)return [];
  const values=[
    p.idleArt,p.idleGif,p.art,p.staticArt,p.image,p.src,p.gif,p.webp,
    p.animations?.idle,p.motion?.idle,p.files?.idle,p.files?.static,p.assets?.idle,p.assets?.static,
    `assets/rpg/pets/${p.id}-idle.gif`,`assets/rpg/pets/${p.id}.gif`,`assets/rpg/pets/${p.id}.png`
  ].flat(Infinity);
  return [...new Set(values.map(v=>firstAsset(v)).filter(Boolean))];
}
function heroCandidates(student){
  const cls=RPG?.characterClassId?.(student)||student?.classId||'warrior',pack=RPG?.resolveAppearance?.(student)||null,c=RPG?.classes?.[cls];
  return [...new Set([
    pack?.idleArt,pack?.skinArt,pack?.art,
    c?.art,c?.artGirl,c?.artBoy,`assets/rpg/skin-${cls}-5.png`,`assets/rpg/skin-${cls}-4.png`,`assets/rpg/skin-${cls}.png`,CLASS_ART[cls],CLASS_ART.warrior
  ].filter(v=>typeof v==='string'&&v))];
}
function setImageWithFallback(img,candidates,{hideOnFail=false}={}){
  const list=[...new Set((candidates||[]).filter(Boolean))];
  let i=0;
  img.onerror=()=>{
    i++;
    if(i<list.length){img.src=list[i];return}
    img.onerror=null;
    if(hideOnFail)img.classList.add('hidden');
  };
  if(list.length){img.classList.remove('hidden');img.src=list[0]}
  else if(hideOnFail)img.classList.add('hidden');
}
function phoenixDateKey(){
  return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Phoenix',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
}
function integritySummary(buildings,health){
  const normalized=K.normalizeBuildingHealth(buildings,health),rows=Object.values(normalized).filter(x=>x.maxHp>0),hp=rows.reduce((sum,x)=>sum+x.hp,0),maxHp=rows.reduce((sum,x)=>sum+x.maxHp,0),damaged=rows.filter(x=>x.hp<x.maxHp).length;
  return {percent:maxHp?Math.round(hp/maxHp*100):100,damaged,total:rows.length};
}
function damageRowsHtml(applied){
  const rows=Object.entries(applied||{}).filter(([,x])=>Number(x?.damage)>0);if(!rows.length)return'';
  return `<div class="raid-damage-report"><b>🏚️ Building Aftermath</b>${rows.map(([id,x])=>`<div class="raid-damage-row"><span>${K.BUILDINGS[id]?.icon||'🏚️'} ${esc(K.BUILDINGS[id]?.name||id)}</span><strong>−${fmt(x.damage)} HP • ${fmt(x.after)}/${fmt(x.maxHp)} • ${esc(({healthy:'Healthy',damaged:'Damaged',burning:'Burning',destroyed:'Destroyed',repair:'Repairing'})[x.state]||x.state)}</strong></div>`).join('')}</div>`;
}

class DemoBackend{
  constructor(session){
    const u=session.user||{},raw=session.student||{};
    const rawProfile={...raw,email:u.email},resolvedClass=RPG?.characterClassId?.(rawProfile)||raw.classId;
    const classId=['warrior','ranger','mage','healer'].includes(resolvedClass)?resolvedClass:'ranger';
    this.me={id:u.uid||'tester',student:{
      email:u.email||raw.email||'',
      classId,
      characterSystemVersion:raw.characterSystemVersion||'',
      characterV5Gender:raw.characterV5Gender||'',
      characterV5Affinity:raw.characterV5Affinity||'',
      characterV5ClassId:raw.characterV5ClassId||'',
      xp:Number(raw.xp)||740,
      rpgInventory:Array.isArray(raw.rpgInventory)?raw.rpgInventory:['briarfox_bow'],
      rpgEquipped:raw.rpgEquipped&&typeof raw.rpgEquipped==='object'?raw.rpgEquipped:{weapon:'briarfox_bow'},
      ownedPets:Array.isArray(raw.ownedPets)?raw.ownedPets:['embercub'],
      activePet:raw.activePet||'embercub',
      lastBossWinDate:new Date().toISOString().slice(0,10)
    }};
    const display=(u.displayName||u.email||'Tester').split(/[ @]/)[0]||'Tester';
    this.storageKey=`dw-kingdom-hidden-test-v11-1:${this.me.id}`;
    this.legacyStorageKey=`dw-kingdom-hidden-test-v2:${this.me.id}`;
    this.worldKey='dw-kingdom-hidden-test-world-v11';
    this.pub={...K.defaultKingdomPublic(this.me.id,display),kingdomName:`${display}'s Keep`,crowns:25,defenseStrategy:'fortify',cohortId:'hidden-test',seasonId:'test-season',kingdomStyle:'dragon',kingdomPalette:CLASS_DEFAULT_PALETTE[classId]||'royal',kingdomCustomPalette:{primary:'#1769d2',secondary:'#f4c85a',glow:'#54d9ff'}};
    this.priv={...K.defaultKingdomPrivate(),timber:1200,stone:1100,essence:700,lastResourceClaim:Date.now()-2*3600000,catchupUntil:Date.now()+36e5*24*3,buildings:{...K.defaultBuildings()}};
    this.priv.buildingHealth=K.defaultBuildingHealth(this.priv.buildings);
    this.raidsUsed=0;this.history=[];this.friendlyUsed=0;this.friendlyTargets={};this.matchTicket=null;this.matchTicketExpiresAt=0;this.ticketTargets=[];this.raidDate='';this.friendlyDate='';
    this.load();
    this.priv=normalizePersistedPrivate(K,this.priv,this.priv);
    this.pub=normalizePersistedPublic(this.pub,this.pub,{fallbackPalette:CLASS_DEFAULT_PALETTE[classId]||'royal'});
    if(!this.priv.lastResourceClaim)this.priv.lastResourceClaim=Date.now()-2*3600000;
    this.rollDailyState();
    this.persist();
    this.opponents=[
      this.op('demo-1','Benji','Ironroot Hold','warrior',72,3,{walls:3,watchtower:1,rangerTower:1,mageTower:0,creatureDen:1},'fortify'),
      this.op('demo-2','Nala','Moonpetal Citadel','mage',91,3,{walls:2,watchtower:2,rangerTower:1,mageTower:3,creatureDen:2},'ward'),
      this.op('demo-3','Krystal','Stormglass Keep','healer',105,4,{walls:4,watchtower:2,rangerTower:2,mageTower:2,creatureDen:2},'vigilance'),
      this.op('demo-4','Harper','Briarwatch','ranger',60,2,{walls:2,watchtower:2,rangerTower:2,mageTower:0,creatureDen:1},'patrol')
    ];
    this.loadOpponentWorld();this.persistWorld();
  }
  load(){
    try{
      const current=localStorage.getItem(this.storageKey),legacy=current?null:localStorage.getItem(this.legacyStorageKey),saved=JSON.parse(current||legacy||'null');
      if(!saved)return;
      this.pub=normalizePersistedPublic(this.pub,saved.pub,{fallbackPalette:CLASS_DEFAULT_PALETTE[this.me.student.classId]||'royal'});
      this.priv=normalizePersistedPrivate(K,this.priv,saved.priv);
      this.raidsUsed=Math.max(0,Number(saved.raidsUsed)||0);
      this.history=Array.isArray(saved.history)?saved.history.slice(0,25):[];
      this.friendlyUsed=Number(saved.friendlyUsed)||0;
      this.friendlyTargets=saved.friendlyTargets&&typeof saved.friendlyTargets==='object'?saved.friendlyTargets:{};
      this.raidDate=String(saved.raidDate||'');
      this.friendlyDate=String(saved.friendlyDate||'');
      if(legacy)localStorage.removeItem(this.legacyStorageKey);
    }catch(e){console.warn('Could not restore tester kingdom',e)}
  }
  loadOpponentWorld(){
    try{
      const saved=JSON.parse(localStorage.getItem(this.worldKey)||'null');if(!saved?.opponents)return;
      for(const o of this.opponents){const row=saved.opponents[o.id];if(!row)continue;o.pub=normalizePersistedPublic(o.pub,row.pub);o.priv=normalizePersistedPrivate(K,o.priv,row.priv);o.priv=accrueProduction(K,o.priv,Date.now()).privateState;o.pub.powerRating=K.powerSnapshot(o.student,o.priv,o.pub,'assault').rating}
    }catch(e){console.warn('Could not restore persistent demo opponents',e)}
  }
  persistWorld(){
    try{const opponents={};for(const o of this.opponents||[])opponents[o.id]={pub:o.pub,priv:o.priv};localStorage.setItem(this.worldKey,JSON.stringify({version:11,opponents,updatedAt:Date.now()}))}catch(e){console.warn('Could not save persistent demo opponents',e)}
  }
  rollDailyState(){
    const today=phoenixDateKey();
    if(this.raidDate!==today){this.raidDate=today;this.raidsUsed=0}
    if(this.friendlyDate!==today){this.friendlyDate=today;this.friendlyUsed=0;this.friendlyTargets={}}
  }
  persist(){
    try{
      localStorage.setItem(this.storageKey,JSON.stringify({
        saveVersion:SAVE_VERSION,pub:this.pub,priv:this.priv,raidsUsed:this.raidsUsed,raidDate:this.raidDate,
        history:this.history,friendlyUsed:this.friendlyUsed,friendlyDate:this.friendlyDate,friendlyTargets:this.friendlyTargets
      }));
    }catch(e){console.warn('Could not save tester kingdom',e)}
  }
  resetTesterRealm(){
    localStorage.removeItem(this.storageKey);
    location.reload();
  }
  setAppearance(style,palette,custom){if(VALID_STYLES.includes(style))this.pub.kingdomStyle=style;if(palette==='custom'||PALETTES[palette])this.pub.kingdomPalette=palette;if(custom)this.pub.kingdomCustomPalette=normalizeCustomPalette(custom,this.pub.kingdomCustomPalette);this.persist();}
  setKingdomMotion(enabled){this.pub.kingdomMotion=!!enabled;this.persist();}
  op(id,name,kingdomName,classId,crowns,keep,levels,defenseStrategy){const student={classId,xp:keep*210,rpgInventory:['weapon','armor'],rpgEquipped:{weapon:'weapon',armor:'armor'},ownedPets:['mossback'],activePet:'mossback'},pub={...K.defaultKingdomPublic(id,name),kingdomName,crowns,keepLevel:keep,kingdomLevel:keep,defenseStrategy,cohortId:'hidden-test',seasonId:'test-season'},priv={...K.defaultKingdomPrivate(),timber:520+keep*70,stone:470+keep*60,essence:260+keep*35,lastResourceClaim:Date.now(),buildings:{...K.defaultBuildings(),keep,lumberMill:keep,quarry:keep,essenceWell:Math.max(1,keep-1),...levels}};priv.buildingHealth=K.defaultBuildingHealth(priv.buildings);pub.powerRating=K.powerSnapshot(student,priv,pub,'assault').rating;return{id,student,pub,priv}}
  ready(){return Promise.resolve({uid:this.me.id})}
  dashboard(){this.rollDailyState();const power=K.powerSnapshot(this.me.student,this.priv,this.pub,'assault');this.pub.powerRating=power.rating;const base=K.productionPerHour(this.priv.buildings),boost=this.priv.catchupUntil>Date.now()?K.DEFAULT_CONFIG.starterBoostMultiplier:1,prod={};for(const r of K.RESOURCE_KEYS)prod[r]=K.round(base[r]*boost,1);const banked=K.claimableProduction(this.priv.buildings,this.priv.lastResourceClaim,Date.now(),K.DEFAULT_CONFIG,this.priv.catchupUntil,K.DEFAULT_CONFIG.starterBoostMultiplier);const now=Date.now();this.priv.buildingHealth=K.normalizeBuildingHealth(this.priv.buildings,this.priv.buildingHealth);for(const row of Object.values(this.priv.buildingHealth))if(row.repairingUntil&&row.repairingUntil<=now)row.repairingUntil=0;const buildingHealth=Object.fromEntries(Object.entries(this.priv.buildingHealth).map(([id,row])=>[id,{...row,state:K.buildingHealthState(row,now),repairCost:K.repairCost(id,this.priv.buildings[id],row)}]));return{kingdom:{...this.pub},resources:{timber:this.priv.timber,stone:this.priv.stone,essence:this.priv.essence},buildings:{...this.priv.buildings},buildingHealth,productionPerHour:prod,bankedProduction:banked,power,adventurer:{classId:this.me.student.classId,activePet:this.me.student.activePet,displayName:this.pub.displayName,xpTier:power.rpg.xpTier,equippedCount:power.rpg.equippedCount},eligibility:{bossWinToday:true,raidsUsed:this.raidsUsed,maxDailyRaids:1,canRaid:this.raidsUsed<1&&!this.pub.pvpDisabled,pvpDisabled:!!this.pub.pvpDisabled},friendly:{used:this.friendlyUsed,maxDaily:8,maxPerTarget:3},boost:{active:boost>1,until:this.priv.catchupUntil,multiplier:boost},season:{id:'test-season',name:'Tester Season'},config:{enabled:true,raidingEnabled:true,friendlyEnabled:true,shieldHours:8}}}
  logBattle(o,strategy,result,friendly){const row={id:`demo-${Date.now()}-${Math.random()}`,attackerId:this.me.id,defenderId:o.id,attackerName:this.pub.displayName,defenderName:o.pub.displayName,attackerKingdom:this.pub.kingdomName,defenderKingdom:o.pub.kingdomName,strategy,result:result.victory?'victory':'defeat',attackScore:result.attackScore,defenseScore:result.defenseScore,loot:result.loot,attackerCrownDelta:result.attackerCrownDelta,defenderCrownDelta:result.defenderCrownDelta,buildingDamage:result.damageApplied||{},friendly,createdAtMs:Date.now()};this.history.unshift(row);this.history=this.history.slice(0,25);if(!friendly){o.priv.battleFeed=Array.isArray(o.priv.battleFeed)?o.priv.battleFeed:[];o.priv.battleFeed.unshift({...row,perspective:'defender'});o.priv.battleFeed=o.priv.battleFeed.slice(0,25)}return row}
  async call(name,data={}){
    if(name==='kingdomCreate'||name==='kingdomGetDashboard')return this.dashboard();
    if(name==='kingdomClaimResources'){const claim=K.claimableProduction(this.priv.buildings,this.priv.lastResourceClaim,Date.now(),K.DEFAULT_CONFIG,this.priv.catchupUntil,K.DEFAULT_CONFIG.starterBoostMultiplier),total=K.RESOURCE_KEYS.reduce((s,r)=>s+(claim.gained[r]||0),0);if(total<=0)throw new Error('No new resources are ready yet. Production continues automatically over time.');for(const r of K.RESOURCE_KEYS)this.priv[r]+=claim.gained[r]||0;this.priv.lastResourceClaim=Date.now();this.persist();return{gained:claim.gained,resources:{timber:this.priv.timber,stone:this.priv.stone,essence:this.priv.essence},productionPerHour:claim.effectivePerHour,hours:claim.hours,boostedHours:claim.boostedHours}}
    if(name==='kingdomUpgradeBuilding'){const resources={timber:this.priv.timber,stone:this.priv.stone,essence:this.priv.essence},up=K.applyUpgrade(this.priv.buildings,resources,data.buildingId);if(!up.ok)throw new Error(up.reason==='KEEP_TOO_LOW'?'Upgrade your Keep first.':'Not enough resources.');Object.assign(this.priv,up.resources);this.priv.buildings=up.buildings;this.priv.buildingHealth=K.normalizeBuildingHealth(this.priv.buildings,this.priv.buildingHealth);this.priv.buildingHealth[data.buildingId]={hp:K.buildingMaxHp(data.buildingId,this.priv.buildings[data.buildingId]),maxHp:K.buildingMaxHp(data.buildingId,this.priv.buildings[data.buildingId]),repairingUntil:0};this.persist();return{...up,power:K.powerSnapshot(this.me.student,this.priv,this.pub,'assault')}}
    if(name==='kingdomSetDefense'){this.pub.defenseStrategy=data.defenseStrategy;this.persist();return{ok:true,defenseStrategy:data.defenseStrategy}}
    if(name==='kingdomRename'){const s=String(data.kingdomName||'').trim().replace(/[<>]/g,'').slice(0,40);if(s.length<3)throw new Error('Kingdom names must be at least 3 characters.');this.pub.kingdomName=s;this.persist();return{ok:true,kingdomName:s}}
    if(name==='kingdomTestDamage'){const out=K.testRaidDamage(this.priv.buildings,this.priv.buildingHealth,`incoming-${Date.now()}`,3);this.priv.buildingHealth=out.health;this.persist();return{ok:true,applied:out.applied,dashboard:this.dashboard()}}
    if(name==='kingdomRepairBuilding'){const resources={timber:this.priv.timber,stone:this.priv.stone,essence:this.priv.essence},out=K.applyRepair(this.priv.buildings,this.priv.buildingHealth,resources,data.buildingId,Date.now(),2400);if(!out.ok)throw new Error(out.reason==='FULL_HP'?'That building is already fully repaired.':out.reason==='NOT_ENOUGH_RESOURCES'?'Not enough resources to repair that building.':'That building cannot be repaired.');Object.assign(this.priv,out.resources);this.priv.buildingHealth=out.health;this.persist();return{ok:true,id:data.buildingId,cost:out.cost,row:out.row,dashboard:this.dashboard()}}
    if(name==='kingdomRepairAll'){let repaired=[],skipped=[],spent={timber:0,stone:0,essence:0};const candidates=Object.keys(K.BUILDINGS).map(id=>({id,check:K.canRepair(this.priv.buildings,this.priv.buildingHealth,{timber:this.priv.timber,stone:this.priv.stone,essence:this.priv.essence},id)})).filter(row=>row.check.reason!=='NOT_BUILT'&&row.check.reason!=='FULL_HP').sort((a,b)=>K.RESOURCE_KEYS.reduce((sum,r)=>sum+(a.check.cost?.[r]||0),0)-K.RESOURCE_KEYS.reduce((sum,r)=>sum+(b.check.cost?.[r]||0),0));for(const {id} of candidates){const resources={timber:this.priv.timber,stone:this.priv.stone,essence:this.priv.essence},out=K.applyRepair(this.priv.buildings,this.priv.buildingHealth,resources,id,Date.now(),1800);if(!out.ok){skipped.push({id,reason:out.reason,missing:out.missing||null,cost:out.cost||null});continue}Object.assign(this.priv,out.resources);this.priv.buildingHealth=out.health;repaired.push(id);for(const r of K.RESOURCE_KEYS)spent[r]+=out.cost[r]||0}this.persist();return{ok:true,repaired,skipped,spent,dashboard:this.dashboard()}}
    if(name==='kingdomGetRaidTargets'){const my=this.dashboard();for(const o of this.opponents){o.priv.buildingHealth=K.normalizeBuildingHealth(o.priv.buildings,o.priv.buildingHealth);o.pub.powerRating=K.powerSnapshot(o.student,o.priv,o.pub,'assault').rating}const eligible=this.opponents.filter(o=>K.isFairMatch(my.kingdom,o.pub,K.DEFAULT_CONFIG)).sort((a,b)=>K.matchmakingScore(my.kingdom,a.pub)-K.matchmakingScore(my.kingdom,b.pub)).slice(0,3);this.matchTicket=`demo-ticket-${Date.now()}`;this.matchTicketExpiresAt=Date.now()+K.DEFAULT_CONFIG.matchTicketMinutes*60000;this.ticketTargets=eligible.map(o=>o.id);return{canRaid:my.eligibility.canRaid,bossWinToday:true,matchTicket:this.matchTicket,matchTicketExpiresAt:this.matchTicketExpiresAt,targets:eligible.map(o=>({id:o.id,displayName:o.pub.displayName,kingdomName:o.pub.kingdomName,keepLevel:o.pub.keepLevel,crowns:o.pub.crowns,powerRating:o.pub.powerRating,integrity:integritySummary(o.priv.buildings,o.priv.buildingHealth),difficulty:K.estimateDifficulty(my.kingdom.powerRating,o.pub.powerRating)}))}}
    if(name==='kingdomGetClassmates')return{classmates:this.opponents.map(o=>({id:o.id,displayName:o.pub.displayName,kingdomName:o.pub.kingdomName,keepLevel:o.pub.keepLevel,crowns:o.pub.crowns}))};
    if(name==='kingdomScout'){if(!ticketIsValid(this.matchTicket,this.ticketTargets,data.matchTicket,data.defenderId,this.matchTicketExpiresAt))throw new Error('That scouting list expired. Find fair opponents again.');const o=this.opponents.find(x=>x.id===data.defenderId);if(!o)throw new Error('Opponent not found');return{defenderId:o.id,kingdomName:o.pub.kingdomName,displayName:o.pub.displayName,report:K.scoutReport(o.student,o.priv,o.pub,`demo-scout-${o.id}`,this.priv.buildings.watchtower)}}
    if(name==='kingdomResolveRaid'){if(!ticketIsValid(this.matchTicket,this.ticketTargets,data.matchTicket,data.defenderId,this.matchTicketExpiresAt))throw new Error('That opponent was not in your current unexpired fair-match list.');const o=this.opponents.find(x=>x.id===data.defenderId);if(!o)throw new Error('Opponent not found');if(this.raidsUsed>=1)throw new Error('Your ranked raid for today is already used.');o.priv.buildingHealth=K.normalizeBuildingHealth(o.priv.buildings,o.priv.buildingHealth);const seed=`raid-${this.me.id}-${o.id}-${Date.now()}`,result=K.resolveRaid({attackerStudent:this.me.student,defenderStudent:o.student,attackerKingdom:this.pub,defenderKingdom:o.pub,attackerPrivate:this.priv,defenderPrivate:o.priv,strategy:data.strategy,seed,friendly:false}),applied=K.applyRankedResult(this.pub,o.pub,this.priv,o.priv,result);this.pub=applied.attackerPublic;o.pub=applied.defenderPublic;this.priv=applied.attackerPrivate;o.priv=applied.defenderPrivate;result.damageApplied=applied.damageApplied||{};o.pub.powerRating=K.powerSnapshot(o.student,o.priv,o.pub,'assault').rating;this.raidsUsed++;this.matchTicket=null;this.matchTicketExpiresAt=0;this.ticketTargets=[];const report=this.logBattle(o,data.strategy,result,false);this.persist();this.persistWorld();return{raidId:report.id,defenderId:o.id,defenderName:o.pub.displayName,defenderKingdom:o.pub.kingdomName,defenderIntegrity:integritySummary(o.priv.buildings,o.priv.buildingHealth),defenderResources:{timber:o.priv.timber,stone:o.priv.stone,essence:o.priv.essence},defenderCrowns:o.pub.crowns,...result}}
    if(name==='kingdomFriendlyChallenge'){const o=this.opponents.find(x=>x.id===data.defenderId);if(!o)throw new Error('Opponent not found');const count=this.friendlyTargets[o.id]||0;if(this.friendlyUsed>=8)throw new Error('You have reached today’s Friendly Challenge limit.');if(count>=3)throw new Error('You have already challenged this classmate enough today. Try someone else.');const result=K.resolveRaid({attackerStudent:this.me.student,defenderStudent:o.student,attackerKingdom:this.pub,defenderKingdom:o.pub,attackerPrivate:this.priv,defenderPrivate:o.priv,strategy:data.strategy,seed:`friendly-${Date.now()}`,friendly:true});this.friendlyUsed++;this.friendlyTargets[o.id]=count+1;this.logBattle(o,data.strategy,result,true);this.persist();return{raidId:`demo-${Date.now()}`,defenderId:o.id,defenderName:o.pub.displayName,defenderKingdom:o.pub.kingdomName,...result,friendlyRemaining:8-this.friendlyUsed}}
    if(name==='kingdomGetRaidHistory')return{raids:this.history};
    if(name==='kingdomGetRankings'){const rows=[{id:this.me.id,displayName:this.pub.displayName,kingdomName:this.pub.kingdomName,pub:this.pub,priv:this.priv},...this.opponents.map(o=>({id:o.id,displayName:o.pub.displayName,kingdomName:o.pub.kingdomName,pub:o.pub,priv:o.priv}))],mk=(key,score)=>rows.map(x=>({...x,score:score(x)})).sort((a,b)=>b.score-a.score).slice(0,5).map((x,i)=>({rank:i+1,id:x.id,displayName:x.displayName,kingdomName:x.kingdomName,score:x.score}));return{season:{id:'test-season',name:'Tester Season'},categories:{crowns:mk('crowns',x=>x.pub.crowns),might:mk('might',x=>x.pub.powerRating),fortress:mk('fortress',x=>K.fortressRating(x.priv.buildings,x.pub.defenseStrategy)),builder:mk('builder',x=>K.builderScore(x.priv.buildings)),raider:mk('raider',x=>x.id===this.me.id?this.history.filter(r=>!r.friendly&&r.attackerId===this.me.id&&r.result==='victory').length:Math.floor(x.pub.crowns/30))}}}
    throw new Error(`Demo backend does not implement ${name}`);
  }
}

const testerSession=await requireKingdomTester();
const demo=true,backend=new DemoBackend(testerSession);
let dashboard=null,currentMatchTicket=null,lastFocus=null,modalResolver=null,lastUpgradeId='',visualCondition='actual';
const uiActions=new Set(),timers=new Map();
let battleAudioContext=null;
const kingdomScene=document.querySelector('.kingdom-scene-v3');
const kingdomLife=initKingdomLife({scene:kingdomScene,heroActor:document.querySelector('.hero-actor'),petActor:document.querySelector('.pet-actor')});
function syncPageVisibility(){document.body.classList.toggle('kw-page-hidden',document.hidden)}
document.addEventListener('visibilitychange',syncPageVisibility);syncPageVisibility();
function status(message,type='info'){const el=$('status');el.textContent=message;el.style.borderColor=type==='error'?'rgba(255,123,145,.5)':type==='success'?'rgba(113,224,160,.45)':'rgba(121,231,255,.26)'}
async function runUiAction(key,action){if(uiActions.has(key)){status('That action is already in progress.','error');return null}uiActions.add(key);try{return await action()}finally{uiActions.delete(key)}}
function schedule(key,action,delay){if(timers.has(key))clearTimeout(timers.get(key));const timer=setTimeout(()=>{timers.delete(key);action()},delay);timers.set(key,timer);return timer}
function setTab(name){document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===name));for(const n of ['kingdom','war','history','rankings'])$(`tab-${n}`).classList.toggle('hidden',n!==name);if(name==='war')loadClassmates();if(name==='history')loadHistory();if(name==='rankings')loadRankings()}
function levelDots(level){return `<div class="level-dots" aria-label="Level ${level} of 5">${[1,2,3,4,5].map(x=>`<i class="${x<=level?'on':''}"></i>`).join('')}</div>`}
function render(){
  if(!dashboard)return;const d=dashboard,r=d.resources,b=d.buildings,k=d.kingdom;
  for(const key of K.RESOURCE_KEYS){$(key).textContent=fmt(r[key]);$(`${key}Rate`).textContent=`+${fmt(d.productionPerHour?.[key])}/hr`}
  $('crowns').textContent=fmt(k.crowns);$('seasonLabel').textContent=d.season?.name||'Season ranking';$('kingdomName').textContent=k.kingdomName;$('sceneKingdomName').textContent=k.kingdomName;$('sceneSub').textContent=`Keep Level ${b.keep} • ${d.adventurer?.displayName||'Adventurer'}`;
  $('attackPower').textContent=fmt(d.power.attack);$('defensePower').textContent=fmt(d.power.defense);$('powerRating').textContent=fmt(d.power.rating);$('keepLevel').textContent=b.keep;
  const heroName=d.adventurer?.displayName||'Adventurer';
  $('heroLabel').textContent=heroName;
  const student=backend.me.student,heroPack=RPG?.resolveAppearance?.(student);let heroArt=$('heroArt');
  if(heroPack?.v5){if(heroArt?.tagName==='IMG'){const stage=document.createElement('div');stage.id='heroArt';stage.className='scene-hero';heroArt.replaceWith(stage);heroArt=stage}RPG.renderV5Character(heroArt,heroPack,'idle',{version:'56.28-v5.3.4',alt:`${heroName}'s adventurer`})}else setImageWithFallback(heroArt,heroCandidates(student));
  const petId=d.adventurer?.activePet,pd=petData(petId),pc=petCandidates(pd),petStage=$('petStage');
  petStage.classList.toggle('hidden',!petId||!pc.length);
  if(petId&&pc.length){$('petLabel').textContent=pd?.name||petId;$('petArt').alt=`Active pet: ${pd?.name||petId}`;setImageWithFallback($('petArt'),pc,{hideOnFail:true})}
  const keep=Math.max(1,Math.min(5,Number(b.keep)||1));
  $('sceneSub').textContent=`${eraName(keep)} • Keep Level ${keep} • ${heroName}`;
  renderStyledKingdom($('kingdomVisualStage'),{buildings:b,buildingStates:d.buildingHealth,style:k.kingdomStyle||'dragon',paletteId:k.kingdomPalette||'royal',customPalette:k.kingdomCustomPalette,condition:visualCondition,focusId:lastUpgradeId});
  kingdomLife.update({style:k.kingdomStyle||'dragon',condition:visualCondition,motionEnabled:k.kingdomMotion!==false,heroName,petName:pd?.name||petId||'',petVisible:!!petId&&pc.length>0});
  const banked=d.bankedProduction||{hours:0,gained:{}},bankedTotal=K.RESOURCE_KEYS.reduce((s,r)=>s+(Number(banked.gained?.[r])||0),0);
  $('claimBtn').disabled=bankedTotal<=0;$('claimBtn').textContent=bankedTotal>0?`Collect ${fmt(bankedTotal)} Resources`:'Collect Resources';
  $('claimBanked').textContent=bankedTotal>0?`${Number(banked.hours||0).toFixed(2)}h banked • ${money(banked.gained)}`:'Producing now • nothing banked yet';
  const boost=$('boostNotice');boost.classList.toggle('hidden',!d.boost?.active);if(d.boost?.active)boost.textContent=`🌱 Starter Catch-Up Boost: resource production is ×${Number(d.boost.multiplier).toFixed(2)} while your new kingdom gets established.`;
  $('friendlyLimitText').textContent=`Friendly Challenges today: ${d.friendly?.used||0}/${d.friendly?.maxDaily||0} • Max ${d.friendly?.maxPerTarget||0} per classmate.`;
  renderIntegrity();renderBuildings();renderDefense();renderEligibility();renderCustomizer();
}
function renderCustomizer(){const k=dashboard.kingdom,style=k.kingdomStyle||'dragon',pal=k.kingdomPalette||'royal';document.querySelectorAll('[data-style]').forEach(b=>b.classList.toggle('active',b.dataset.style===style));const pp=$('palettePicker');pp.innerHTML='';for(const[id,p]of Object.entries(PALETTES)){const b=document.createElement('button');b.className=`palette-choice ${pal===id?'active':''}`;b.innerHTML=`<span style="--p:${p.primary};--s:${p.secondary};--g:${p.glow}"><i></i><i></i><i></i></span><small>${esc(p.name)}</small>`;b.onclick=()=>setAppearance(style,id);pp.appendChild(b)}document.querySelectorAll('[data-condition]').forEach(b=>b.classList.toggle('active',b.dataset.condition===visualCondition));const cp=k.kingdomCustomPalette||paletteObject(pal);$('customPrimary').value=cp.primary;$('customSecondary').value=cp.secondary;$('customGlow').value=cp.glow;if($('kingdomMotionToggle'))$('kingdomMotionToggle').checked=k.kingdomMotion!==false;}function setAppearance(style,palette,custom=null){backend.setAppearance(style,palette,custom);dashboard.kingdom.kingdomStyle=backend.pub.kingdomStyle;dashboard.kingdom.kingdomPalette=backend.pub.kingdomPalette;dashboard.kingdom.kingdomCustomPalette=backend.pub.kingdomCustomPalette;renderCustomizer();render();status(`${STYLE_LABELS[dashboard.kingdom.kingdomStyle]} appearance applied.`,'success');}
function setKingdomMotion(enabled){backend.setKingdomMotion(enabled);dashboard.kingdom.kingdomMotion=!!enabled;render();status(enabled?'Living Kingdom motion enabled.':'Living Kingdom motion paused.','success');}
function renderIntegrity(){const rows=Object.values(dashboard.buildingHealth||{}).filter(x=>x.maxHp>0),hp=rows.reduce((s,x)=>s+x.hp,0),max=rows.reduce((s,x)=>s+x.maxHp,0),pct=max?Math.round(hp/max*100):100,damaged=rows.filter(x=>x.hp<x.maxHp).length;$('integrityText').textContent=`${pct}% integrity • ${damaged} damaged structure${damaged===1?'':'s'}`;$('repairAllBtn').disabled=!damaged}
function renderBuildings(){const grid=$('buildingGrid');grid.innerHTML='';for(const[id,def]of Object.entries(K.BUILDINGS)){const level=Number(dashboard.buildings[id])||0,cost=K.buildingCost(id,level),check=K.canUpgrade(dashboard.buildings,id,dashboard.resources),health=dashboard.buildingHealth?.[id]||{hp:0,maxHp:0,state:'healthy',repairCost:{}},card=document.createElement('article');card.className=`building-card ${level>=K.MAX_BUILDING_LEVEL?'max':''} health-${health.state}`;card.dataset.buildingCard=id;const label=level>=K.MAX_BUILDING_LEVEL?'MAX LEVEL':check.ok?'Upgrade':check.reason==='KEEP_TOO_LOW'?'Keep Too Low':'Need Resources',stage=id==='keep'?eraName(Math.max(1,level)):id==='walls'?(['No Walls','Wood Palisade','Stone Wall','Fortified Wall','Royal Rampart','Legendary Ward'][Math.max(0,Math.min(5,level))]):buildingStageName(id,level),pct=health.maxHp?Math.round(health.hp/health.maxHp*100):100,damaged=level>0&&health.hp<health.maxHp,repairable=damaged&&health.state!=='repair',stateLabel={healthy:'Healthy',damaged:'Repair Needed',burning:'Burning!',repair:'Repairing…',destroyed:'Destroyed'}[health.state]||health.state;card.innerHTML=`<div class="building-head"><span class="building-icon">${def.icon}</span><div><h3>${esc(def.name)}</h3><span class="pill">Level ${level}</span> ${level>0?`<span class="pill hp-pill hp-${health.state}">${pct}% • ${stateLabel}</span>`:''}</div></div>${levelDots(level)}<div class="visual-stage-name">${esc(stage)}</div><div class="hp-bar ${health.state}"><i style="width:${pct}%"></i></div><div class="desc">${esc(def.description)}</div><div class="building-actions"><div class="cost">${cost?money(cost):'Maximum level reached'}</div><button class="btn small ${check.ok?'gold':'secondary'}" ${check.ok?'':'disabled'} data-upgrade>${label}</button>${damaged?`<button class="btn small repair-btn" ${repairable?'':'disabled'} data-repair>🔨 ${health.state==='repair'?'Repairing…':'Repair'} • ${money(health.repairCost)}</button>`:''}</div>`;card.querySelector('[data-upgrade]').onclick=()=>upgrade(id);card.querySelector('[data-repair]')?.addEventListener('click',()=>repairBuilding(id));grid.appendChild(card)}}
function renderDefense(){$('defenseGrid').innerHTML=Object.values(K.DEFENSES).map(s=>`<button class="strategy ${dashboard.kingdom.defenseStrategy===s.id?'active':''}" data-defense="${s.id}"><span class="strategy-icon">${s.icon}</span><span><strong>${esc(s.name)}</strong><small>${esc(s.description)}</small></span></button>`).join('');document.querySelectorAll('[data-defense]').forEach(x=>x.onclick=()=>setDefense(x.dataset.defense))}
function renderEligibility(){const e=dashboard.eligibility,el=$('raidEligibility');el.innerHTML=e.pvpDisabled?'⛔ <b>Ranked PvP is paused for your kingdom by your teacher.</b> Friendly Challenges may still be available.':e.canRaid?`✅ <b>Ranked raid ready.</b> Today’s Daily Boss is defeated. ${e.raidsUsed}/${e.maxDailyRaids} raid used.`:e.bossWinToday?`🛡️ <b>Ranked raid already used.</b> ${e.raidsUsed}/${e.maxDailyRaids} used today. Friendly Challenges are still open.`:`🔒 <b>Ranked raid locked.</b> Defeat today’s Daily Boss first. Friendly Challenges are still open.`}
async function refresh(){try{dashboard=await backend.call('kingdomGetDashboard');render();status(`Welcome to ${dashboard.kingdom.kingdomName}.`,'success')}catch(e){status(e.message||'Could not load Kingdom Wars.','error');console.error(e)}}
async function claim(){return runUiAction('claim',async()=>{try{$('claimBtn').disabled=true;const r=await backend.call('kingdomClaimResources');status(`Collected ${money(r.gained)} from ${Number(r.hours||0).toFixed(2)} hours of real banked production${r.boostedHours?` (${Number(r.boostedHours).toFixed(2)}h boosted)`:''}.`,'success');await refresh()}catch(e){status(e.message,'error')}finally{$('claimBtn').disabled=false}})}
async function upgrade(id){return runUiAction(`upgrade:${id}`,async()=>{try{
  const r=await backend.call('kingdomUpgradeBuilding',{buildingId:id});
  lastUpgradeId=id;
  await refresh();
  const name=K.BUILDINGS[id].name,stage=id==='keep'?eraName(r.nextLevel):id==='walls'?(['No Walls','Wood Palisade','Stone Wall','Fortified Wall','Royal Rampart','Legendary Ward'][r.nextLevel]):buildingStageName(id,r.nextLevel);
  status(`${name} upgraded to Level ${r.nextLevel}: ${stage}.`,'success');
  const banner=$('upgradeBanner');banner.innerHTML=`✨ <strong>${esc(name)} LEVEL ${r.nextLevel}</strong><br><span>${esc(stage)}</span>`;banner.classList.remove('hidden','show');void banner.offsetWidth;banner.classList.add('show');
  schedule('upgrade-banner',()=>{banner.classList.add('hidden');banner.classList.remove('show');if(lastUpgradeId===id)lastUpgradeId='';if(dashboard)render()},1750);
  const card=document.querySelector(`[data-building-card="${id}"]`);card?.classList.add('just-upgraded');schedule(`upgrade-card:${id}`,()=>card?.classList.remove('just-upgraded'),1000);
}catch(e){status(e.message,'error')}})}
async function repairBuilding(id){return runUiAction(`repair:${id}`,async()=>{try{status(`Repairing ${K.BUILDINGS[id].name}…`);await backend.call('kingdomRepairBuilding',{buildingId:id});await refresh();schedule(`repair-refresh:${id}`,async()=>{await refresh();status(`${K.BUILDINGS[id].name} fully repaired.`,'success')},2550)}catch(e){status(e.message,'error')}})}
async function testIncomingDamage(){return runUiAction('test-damage',async()=>{try{const r=await backend.call('kingdomTestDamage');await refresh();const names=Object.entries(r.applied||{}).filter(([,row])=>Number(row?.damage)>0).map(([id])=>K.BUILDINGS[id]?.name||id);status(names.length?`💥 Test raid damaged ${names.join(', ')}.`:'No intact buildings were available to damage.',names.length?'error':'success')}catch(e){status(e.message,'error')}})}
async function repairAll(){return runUiAction('repair-all',async()=>{try{const r=await backend.call('kingdomRepairAll');await refresh();if(!r.repaired?.length&&!r.skipped?.length){status('No repairs were needed.','success');return}const skipped=r.skipped?.length?` ${r.skipped.length} skipped for insufficient ${r.skipped[0]?.missing||'resources'}.`:'';status(`🔨 Repair crews started on ${r.repaired.length} structures • ${money(r.spent)}.${skipped}`,r.repaired.length?'success':'error');if(r.repaired?.length)schedule('repair-all-refresh',refresh,2100)}catch(e){status(e.message,'error')}})}
async function setDefense(id){return runUiAction('set-defense',async()=>{try{await backend.call('kingdomSetDefense',{defenseStrategy:id});dashboard.kingdom.defenseStrategy=id;renderDefense();status(`${K.DEFENSES[id].name} is now your defensive plan.`,'success')}catch(e){status(e.message,'error')}})}
async function rename(){const name=prompt('Name your kingdom (school-appropriate, 3–40 characters):',dashboard?.kingdom?.kingdomName||'');if(!name)return;return runUiAction('rename',async()=>{try{const r=await backend.call('kingdomRename',{kingdomName:name});dashboard.kingdom.kingdomName=r.kingdomName;render();status(`Your kingdom is now ${r.kingdomName}.`,'success')}catch(e){status(e.message,'error')}})}

async function findTargets(){return runUiAction('find-targets',async()=>{const grid=$('targetGrid');currentMatchTicket=null;grid.innerHTML='<p class="muted">Scouting the realm for fair opponents…</p>';try{const r=await backend.call('kingdomGetRaidTargets');currentMatchTicket=r.matchTicket||null;grid.innerHTML='';if(!r.targets?.length){grid.innerHTML='<p class="muted">No safe ranked opponents are available right now. Your teacher’s safety rules are working, not broken.</p>';return}for(const t of r.targets){const card=document.createElement('article');card.className='target';card.innerHTML=`<h3>${esc(t.kingdomName)}</h3><div>${esc(t.displayName)}</div><div class="target-meta"><span class="pill">🏰 L${t.keepLevel}</span><span class="pill">👑 ${fmt(t.crowns)}</span><span class="pill">${t.difficulty?.icon||'🟡'} ${esc(t.difficulty?.label||'Fair')}</span><span class="pill">🏚️ ${fmt(t.integrity?.percent??100)}% integrity</span></div><div class="target-actions"><button class="btn small secondary" data-scout>Scout</button><button class="btn small" data-raid ${r.canRaid?'':'disabled'}>Raid</button></div><div class="scout hidden"></div>`;card.querySelector('[data-scout]').onclick=()=>scout(t,card);card.querySelector('[data-raid]').onclick=()=>rankedRaid(t);grid.appendChild(card)}}catch(e){grid.innerHTML=`<p class="muted">${esc(e.message)}</p>`}})}
async function scout(t,card){return runUiAction(`scout:${t.id}`,async()=>{try{const r=await backend.call('kingdomScout',{defenderId:t.id,matchTicket:currentMatchTicket}),s=r.report,box=card.querySelector('.scout'),intel=(s.buildingIntel||[]).map(x=>`<div class="intel-row"><span>${esc(x.name)}</span><b>${esc(x.band)}</b></div>`).join('');box.classList.remove('hidden');box.innerHTML=`<b>🕵️ Scout Report • Watchtower L${fmt(s.scoutLevel)}</b><div class="intel-row"><span>Estimated defense</span><b>${fmt(s.defense.min)}–${fmt(s.defense.max)}</b></div><div class="intel-row"><span>Defender</span><b>${esc(s.classId)} ${s.activePet?'• 🐾 Pet':''}</b></div>${intel}<div class="intel-row"><span>Defense plan</span><b>${esc(s.doctrine?.known?s.doctrine.label:s.doctrine?.hint||'Hidden')}</b></div>`}catch(e){status(e.message,'error')}})}

function focusables(){return[...$('battleModal').querySelectorAll('button,[href],select,input,[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled&&!x.classList.contains('hidden'))}
function modalKey(e){if($('battleModal').classList.contains('hidden'))return;if(e.key==='Escape'){e.preventDefault();closeModal(null);return}if(e.key!=='Tab')return;const f=focusables();if(!f.length)return;e.preventDefault();const i=f.indexOf(document.activeElement),next=e.shiftKey?(i<=0?f.length-1:i-1):(i<0||i===f.length-1?0:i+1);f[next].focus()}
function openModal(title,html,resolver=null){lastFocus=document.activeElement;modalResolver=resolver;$('battleTitle').textContent=title;$('battleBody').innerHTML=html;$('battleModal').classList.remove('hidden');document.addEventListener('keydown',modalKey);requestAnimationFrame(()=>focusables()[0]?.focus())}
function closeModal(value=null){$('battleModal').classList.add('hidden');document.removeEventListener('keydown',modalKey);const r=modalResolver;modalResolver=null;if(r)r(value);lastFocus?.focus?.()}
function strategyPicker(title){return new Promise(resolve=>{openModal(title,`<p class="muted">Choose how your adventurer approaches the kingdom. Scout information is intentionally incomplete, so your choice still matters.</p><div class="strategy-grid">${Object.values(K.STRATEGIES).map(s=>`<button class="strategy" data-pick="${s.id}"><span class="strategy-icon">${s.icon}</span><span><strong>${esc(s.name)}</strong><small>${esc(s.description)}</small></span></button>`).join('')}</div>`,resolve);$('battleBody').querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>closeModal(b.dataset.pick))})}
async function rankedRaid(t){return runUiAction('ranked-raid',async()=>{const strategy=await strategyPicker(`Raid ${t.kingdomName}`);if(!strategy)return;try{status(`Your ${K.STRATEGIES[strategy].name} raid is being resolved…`);const r=await backend.call('kingdomResolveRaid',{defenderId:t.id,strategy,matchTicket:currentMatchTicket});showBattle(r,false);currentMatchTicket=null;await refresh();$('targetGrid').innerHTML='<p class="muted">Ranked raid complete. A new fair-match list will be generated next time.</p>'}catch(e){status(e.message,'error')}})}
async function friendly(){return runUiAction('friendly-challenge',async()=>{const id=$('classmateSelect').value;if(!id){status('Choose a classmate first.','error');return}const strategy=await strategyPicker('Friendly Challenge');if(!strategy)return;try{const r=await backend.call('kingdomFriendlyChallenge',{defenderId:id,strategy});showBattle(r,true);status(`Friendly Challenge complete. ${r.friendlyRemaining??0} remain today.`,'success');await refresh()}catch(e){status(e.message,'error')}})}
function showBattle(r,friendly){const win=r.victory;roomSound(win);const damage=damageRowsHtml(r.damageApplied);openModal(win?'🏆 VICTORY':'🛡️ DEFENDED',`<p><b>${esc(r.defenderKingdom||'Opponent Kingdom')}</b> ${friendly?'<span class="pill">Friendly</span>':'<span class="pill">Ranked</span>'}</p><div class="battle-score"><div><span>⚔️ Your Attack</span><strong>${fmt(r.attackScore)}</strong></div><div class="vs">VS</div><div><span>🛡️ Their Defense</span><strong>${fmt(r.defenseScore)}</strong></div></div><p class="center"><span class="pill">${K.STRATEGIES[r.strategy]?.icon||'⚔️'} ${esc(K.STRATEGIES[r.strategy]?.name||r.strategy)}</span> <span class="pill">${r.difficulty?.icon||'🟡'} ${esc(r.difficulty?.label||'Battle')}</span></p>${friendly?'<div class="lock">Friendly Challenge: no resources, Crowns, or building HP changed. The battle is only a simulation.</div>':`<div class="report ${win?'win':'loss'}"><b>${win?'Raid successful':'Defenses held'}</b><div class="loot-row"><span>🪵 ${fmt(r.loot?.timber)}</span><span>🪨 ${fmt(r.loot?.stone)}</span><span>✨ ${fmt(r.loot?.essence)}</span><span>👑 ${r.attackerCrownDelta>=0?'+':''}${fmt(r.attackerCrownDelta)}</span>${r.catchupBonus?`<span>🌱 +${fmt(r.catchupBonus)} comeback</span>`:''}</div></div>${damage}${r.defenderIntegrity?`<div class="lock">Defender kingdom now has <b>${fmt(r.defenderIntegrity.percent)}% integrity</b> with ${fmt(r.defenderIntegrity.damaged)} damaged structure${r.defenderIntegrity.damaged===1?'':'s'}. This aftermath is saved in the local V11 test world.</div>`:''}`}`)}
function roomSound(win){try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;battleAudioContext=battleAudioContext||new Audio();if(battleAudioContext.state==='suspended')battleAudioContext.resume();const o=battleAudioContext.createOscillator(),g=battleAudioContext.createGain();o.frequency.value=win?660:220;g.gain.setValueAtTime(.04,battleAudioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,battleAudioContext.currentTime+.18);o.connect(g);g.connect(battleAudioContext.destination);o.start();o.stop(battleAudioContext.currentTime+.18)}catch{}}

async function loadClassmates(){try{const r=await backend.call('kingdomGetClassmates'),s=$('classmateSelect');s.innerHTML='<option value="">Choose a classmate…</option>'+r.classmates.map(x=>`<option value="${esc(x.id)}">${esc(x.displayName)} • ${esc(x.kingdomName)} (L${x.keepLevel})</option>`).join('')}catch(e){status(e.message,'error')}}
async function loadHistory(){const box=$('historyList');box.innerHTML='<p class="muted">Loading battle reports…</p>';try{const r=await backend.call('kingdomGetRaidHistory');if(!r.raids?.length){box.innerHTML='<p class="muted">No battles yet.</p>';return}const myId=backend?.me?.id;box.innerHTML=r.raids.map(x=>{const attacked=x.attackerId===myId,win=attacked?x.result==='victory':x.result!=='victory',other=attacked?x.defenderKingdom:x.attackerKingdom;return`<article class="report ${win?'win':'loss'}"><div class="report-title"><b>${x.friendly?'Friendly: ':attacked?'You raided ':'Your kingdom was raided by '}${esc(other)}</b><span class="pill">${x.friendly?'🏹 Friendly':'⚔️ Ranked'}</span></div><div>${fmt(x.attackScore)} attack vs ${fmt(x.defenseScore)} defense • ${esc(K.STRATEGIES[x.strategy]?.name||x.strategy)}</div>${x.friendly?'<div class="muted">No resources, Crowns, or building HP moved.</div>':`<div class="loot-row"><span>🪵 ${fmt(x.loot?.timber)}</span><span>🪨 ${fmt(x.loot?.stone)}</span><span>✨ ${fmt(x.loot?.essence)}</span></div>${damageRowsHtml(x.buildingDamage)}`}</article>`}).join('')}catch(e){box.innerHTML=`<p class="muted">${esc(e.message)}</p>`}}
async function loadRankings(){const box=$('rankingGrid');box.innerHTML='<p class="muted">Loading rankings…</p>';try{const r=await backend.call('kingdomGetRankings'),labels={crowns:['👑','Crowns'],might:['⭐','Might'],fortress:['🛡️','Fortress'],builder:['🏗️','Builder'],raider:['⚔️','Raider']};box.innerHTML=Object.entries(r.categories||{}).map(([key,rows])=>`<article class="ranking-card"><h3>${labels[key]?.[0]||'🏆'} ${labels[key]?.[1]||key}</h3>${rows.map(x=>`<div class="ranking-row"><span><b>#${x.rank}</b> ${esc(x.displayName)}</span><strong>${fmt(x.score)}</strong></div>`).join('')||'<p class="muted">No rankings yet.</p>'}</article>`).join('')}catch(e){box.innerHTML=`<p class="muted">${esc(e.message)}</p>`}}

for(const tab of document.querySelectorAll('.tab'))tab.onclick=()=>setTab(tab.dataset.tab);
$('customizeBtn').onclick=()=>{$('customizer').classList.toggle('hidden');renderCustomizer()};$('closeCustomizer').onclick=()=>$('customizer').classList.add('hidden');document.querySelectorAll('[data-style]').forEach(b=>b.onclick=()=>setAppearance(b.dataset.style,dashboard.kingdom.kingdomPalette||'royal'));$('classPaletteBtn').onclick=()=>setAppearance(dashboard.kingdom.kingdomStyle||'dragon',CLASS_DEFAULT_PALETTE[backend.me.student.classId]||'royal');$('randomPaletteBtn').onclick=()=>{const ids=Object.keys(PALETTES);setAppearance(dashboard.kingdom.kingdomStyle||'dragon',ids[Math.floor(Math.random()*ids.length)])};$('applyCustomPalette').onclick=()=>setAppearance(dashboard.kingdom.kingdomStyle||'dragon','custom',{primary:$('customPrimary').value,secondary:$('customSecondary').value,glow:$('customGlow').value});document.querySelectorAll('[data-condition]').forEach(b=>b.onclick=()=>{visualCondition=b.dataset.condition;renderCustomizer();render();});if($('kingdomMotionToggle'))$('kingdomMotionToggle').onchange=e=>setKingdomMotion(e.target.checked);$('testDamageBtn').onclick=testIncomingDamage;$('repairAllBtn').onclick=repairAll;$('claimBtn').onclick=claim;$('resetTesterBtn').onclick=()=>{if(confirm('Reset this browser\'s Kingdom Wars tester realm back to Level 1? This only clears local test progress.'))backend.resetTesterRealm()};$('renameBtn').onclick=rename;$('findTargetsBtn').onclick=findTargets;$('friendlyBtn').onclick=friendly;$('refreshHistoryBtn').onclick=loadHistory;$('refreshRankingsBtn').onclick=loadRankings;$('closeModalBtn').onclick=()=>closeModal(null);$('battleModal').addEventListener('click',e=>{if(e.target===$('battleModal'))closeModal(null)});
$('demoNotice').classList.remove('hidden');
try{await backend.ready();await backend.call('kingdomCreate');await refresh();await loadClassmates()}catch(e){status(e.message||'Kingdom Wars could not start.','error');console.error(e)}
