export const SAVE_VERSION=111;
export const VALID_STYLES=Object.freeze(['dark','dragon','bright']);
const HEX_COLOR=/^#[0-9a-f]{6}$/i;

function plainObject(value){
  return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
}

function finiteNonnegative(value,fallback=0){
  const number=Number(value);
  const safe=Number.isFinite(number)?number:(Number(fallback)||0);
  return Math.min(Number.MAX_SAFE_INTEGER,Math.max(0,Math.floor(safe)));
}

export function validHexColor(value){
  return typeof value==='string'&&HEX_COLOR.test(value);
}

export function normalizeCustomPalette(value,fallback){
  const source=plainObject(value),safeFallback=plainObject(fallback);
  return {
    primary:validHexColor(source.primary)?source.primary:(validHexColor(safeFallback.primary)?safeFallback.primary:'#1769d2'),
    secondary:validHexColor(source.secondary)?source.secondary:(validHexColor(safeFallback.secondary)?safeFallback.secondary:'#f4c85a'),
    glow:validHexColor(source.glow)?source.glow:(validHexColor(safeFallback.glow)?safeFallback.glow:'#54d9ff')
  };
}

export function normalizePersistedPublic(base,saved,{fallbackStyle='dragon',fallbackPalette='royal'}={}){
  const merged={...plainObject(base),...plainObject(saved)};
  merged.kingdomStyle=VALID_STYLES.includes(merged.kingdomStyle)?merged.kingdomStyle:fallbackStyle;
  merged.kingdomPalette=typeof merged.kingdomPalette==='string'&&merged.kingdomPalette?merged.kingdomPalette:fallbackPalette;
  merged.kingdomCustomPalette=normalizeCustomPalette(merged.kingdomCustomPalette,base?.kingdomCustomPalette);
  merged.kingdomMotion=merged.kingdomMotion!==false;
  merged.crowns=finiteNonnegative(merged.crowns,base?.crowns);
  return merged;
}

export function normalizePersistedPrivate(K,base,saved){
  const safeSaved=plainObject(saved),savedBuildings=plainObject(safeSaved.buildings);
  const buildings={...plainObject(base?.buildings),...savedBuildings};
  for(const id of Object.keys(K.BUILDINGS))buildings[id]=K.clamp(Math.floor(Number(buildings[id])||0),0,K.MAX_BUILDING_LEVEL);
  const savedHealth=plainObject(safeSaved.buildingHealth);
  const merged={...plainObject(base),...safeSaved,buildings};
  for(const resource of K.RESOURCE_KEYS)merged[resource]=finiteNonnegative(safeSaved[resource],base?.[resource]);
  merged.buildingHealth=K.normalizeBuildingHealth(buildings,savedHealth);
  merged.recentRankedTargets=Array.isArray(merged.recentRankedTargets)?merged.recentRankedTargets.slice(0,50):[];
  merged.battleFeed=Array.isArray(merged.battleFeed)?merged.battleFeed.slice(0,25):[];
  return merged;
}

export function ticketIsValid(ticket,targets,providedTicket,defenderId,expiresAt,now=Date.now()){
  return !!ticket&&providedTicket===ticket&&Array.isArray(targets)&&targets.includes(defenderId)&&Number.isFinite(Number(expiresAt))&&Number(now)<=Number(expiresAt);
}

export function accrueProduction(K,priv,now=Date.now()){
  const safe=normalizePersistedPrivate(K,K.defaultKingdomPrivate(),priv);
  const claim=K.claimableProduction(safe.buildings,safe.lastResourceClaim,now,K.DEFAULT_CONFIG,safe.catchupUntil,K.DEFAULT_CONFIG.starterBoostMultiplier);
  for(const resource of K.RESOURCE_KEYS)safe[resource]=finiteNonnegative(safe[resource])+finiteNonnegative(claim.gained?.[resource]);
  safe.lastResourceClaim=Number(now);
  return {privateState:safe,claim};
}
