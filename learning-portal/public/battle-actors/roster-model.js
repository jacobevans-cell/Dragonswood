export const CLASSES=['warrior','mage'];
export const ALIGNMENTS=['light','dark'];
export const GENDERS=['male','female'];
export const LEVELS=[1,5,10,15,20];
export const TIERS=['Initiate','Adept','Veteran','Champion','Ascendant'];
export const titleCase=value=>value[0].toUpperCase()+value.slice(1);
export const combinationKey=({class:kind,alignment,gender,level})=>`${kind}-${alignment}-${gender}-${level}`;

function point(value,label) {
  if(!Array.isArray(value)||value.length!==2||!value.every(Number.isFinite))throw new Error(`${label} requires two finite coordinates.`);
}
export function validateView(view,label) {
  if(!view||typeof view.path!=='string'||!view.path.trim())throw new Error(`${label} has no source artwork.`);
  point(view.anchor,`${label} anchor`);point(view.weaponTip||view.staffTip,`${label} weapon tip`);
  if(!Number.isFinite(view.topY)||view.topY<0||view.topY>=view.anchor[1])throw new Error(`${label} has invalid vertical registration.`);
  if(view.frame&&(!Array.isArray(view.frame)||view.frame.length!==4||!view.frame.every(Number.isFinite)
    ||view.frame[0]<0||view.frame[1]<0||view.frame[2]<=0||view.frame[3]<=0))throw new Error(`${label} has an invalid atlas frame.`);
  if(!Array.isArray(view.skinRects))throw new Error(`${label} has no skin-region descriptor.`);
  if(!Array.isArray(view.hairPolygons))throw new Error(`${label} has no hair-region descriptor.`);
  if(!Array.isArray(view.eyeRects))throw new Error(`${label} has no eye-region descriptor.`);
  if(view.attackDirection!==undefined&&![1,-1].includes(view.attackDirection))throw new Error(`${label} attackDirection must be 1 or -1.`);
  return view;
}

/** Fail explicitly if a roster entry is missing, duplicated or incomplete. */
export function createRosterModel(entries) {
  if(!Array.isArray(entries)||entries.length!==40)throw new Error('The complete workshop requires all 40 character designs.');
  const byId=new Map(),byCombination=new Map();
  for(const entry of entries) {
    if(typeof entry.id!=='string'||!entry.id||byId.has(entry.id))throw new Error('Roster IDs must be present and unique.');
    if(!CLASSES.includes(entry.class)||!ALIGNMENTS.includes(entry.alignment)||!GENDERS.includes(entry.gender)||!LEVELS.includes(entry.level))
      throw new Error(`${entry.id} has an unsupported roster selection.`);
    const key=combinationKey(entry);
    if(byCombination.has(key))throw new Error(`Duplicate roster combination: ${key}`);
    validateView(entry.views?.front,`${entry.id} front`);validateView(entry.views?.back,`${entry.id} back`);
    byId.set(entry.id,entry);byCombination.set(key,entry);
  }
  const ordered=[];
  for(const kind of CLASSES)for(const alignment of ALIGNMENTS)for(const gender of GENDERS)for(const level of LEVELS) {
    const key=combinationKey({class:kind,alignment,gender,level}),entry=byCombination.get(key);
    if(!entry)throw new Error(`Missing roster combination: ${key}`);
    ordered.push(entry);
  }
  return {
    entries:ordered,byId,byCombination,
    select:selection=>byCombination.get(combinationKey(selection)),
    next(id,delta=1){const index=ordered.findIndex(entry=>entry.id===id);return ordered[(Math.max(0,index)+delta%40+40)%40];},
  };
}

export function viewFrame(view,sourceWidth,sourceHeight) {
  const frame=view.frame||[0,0,sourceWidth,sourceHeight];
  const [x,y,width,height]=frame;
  if(frame.some(value=>!Number.isInteger(value))||x<0||y<0||width<=0||height<=0||x+width>sourceWidth||y+height>sourceHeight)
    throw new Error(`Atlas frame exceeds source bounds: ${view.path}`);
  return {x,y,width,height};
}
