import {HERO_OPTIONS,PET_OPTIONS} from './battle-actors/actor-catalog.js?v=dragon-path-10';
import {actorPalette} from './battle-actors/actor-selection.js?v=dragon-path-10';
import {ADVENTURER_SETUP_VERSION,APPEARANCE_OPTIONS,setupHero} from './adventurer-setup.js?v=dragon-path-10';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const title=v=>v[0].toUpperCase()+v.slice(1);
const orders={light:{name:'Wardens of the Light',short:'Light',symbol:'☀',copy:'Stand in the open. Bring courage, hope, and a steady light to the places that need it.'},dark:{name:'Sentinels of the Shadow',short:'Shadow',symbol:'☾',copy:'Watch from the quiet places. Use mystery, clever plans, and the cover of night to protect the realm.'}};
const colors={light:'#e9bd99',medium:'#b57952',deep:'#654331',white:'#e6e2e3',black:'#22232b',brown:'#784a2d',purple:'#a568d4',blue:'#55a5e5',green:'#69ad7c'};
const portrait=(hero,large=false)=>`<span class="setup-portrait ${large?'portal-adventurer-art':''}"><span class="portal-portrait-fallback">Preparing your hero…</span><canvas data-adventurer-portrait="${esc(hero?.id||'')}" width="320" height="384" role="img" aria-label="${esc(hero?.family||'Your hero')}" hidden></canvas></span>`;
const petsFor=p=>PET_OPTIONS.filter(pet=>p.ownedPetIds?.includes(pet.id)&&p.eligiblePetIds?.includes(pet.id));
function progress(step){return `<ol class="setup-progress" aria-label="Character setup steps">${['Your path','Your class','Your appearance'].map((label,i)=>`<li ${step===i+1?'aria-current="step"':''}><span>${i+1}</span>${label}</li>`).join('')}</ol>`;}
function appearanceFields(appearance){return Object.entries(APPEARANCE_OPTIONS).map(([key,values])=>`<fieldset class="setup-palette"><legend>${key==='skin'?'Skin tone':key==='eyes'?'Eye color':'Hair color'}</legend><div>${values.map(value=>`<label class="setup-swatch"><input type="radio" name="adventurer-${key}" value="${value}" data-appearance="${key}" ${appearance[key]===value?'checked':''}><span class="setup-swatch-dot" style="--swatch:${colors[value]}"></span><span>${title(value)}</span></label>`).join('')}</div></fieldset>`).join('');}
export function adventurerChooserMarkup(profile){
 if(!profile)return '';
 return `<section class="panel adventurer-setup" data-adventurer-home data-adventurer-setup aria-labelledby="adventurer-setup-title"><div data-setup-body>${chooserBody(profile,{step:profile.needsClassSelection?1:3,appearance:actorPalette(profile.appearance),petId:profile.petId||null})}</div></section>`;
}
function chooserBody(profile,draft){
 const needs=profile.needsClassSelection,gender=profile.assignedGender;
 if(!['male','female'].includes(gender))return `<div class="eyebrow">YOUR ADVENTURER</div><h1 id="adventurer-setup-title" tabindex="-1">Your journey is waiting.</h1><p>Your teacher needs to confirm your character profile in Dragonswood. Your lessons are ready while we get that sorted out.</p><a class="btn primary" href="#home">Continue to Dragon’s Path →</a>`;
 const current=HERO_OPTIONS.find(h=>h.id===profile.heroId),hero=needs?setupHero(gender,draft.alignment,draft.characterClass):current;
 const top=needs?`<div class="eyebrow">A NEW CHAPTER · YOUR ADVENTURER</div>${progress(draft.step)}`:'<div class="eyebrow">YOUR ADVENTURER</div>';
 if(draft.step===1)return `${top}<h1 id="adventurer-setup-title" tabindex="-1">Dragonswood is calling.</h1><p class="setup-intro">The realm needs brave warriors and wise mages. Two ancient orders answer the call. <strong>Both protect Dragonswood.</strong> Which path will you follow?</p><div class="setup-choices">${Object.entries(orders).map(([key,order])=>`<button type="button" class="setup-choice setup-order-${key}" data-setup-alignment="${key}" aria-pressed="${draft.alignment===key}"><span class="setup-order-symbol" aria-hidden="true">${order.symbol}</span><div class="setup-pair">${['warrior','mage'].map(c=>portrait(setupHero(gender,key,c))).join('')}</div><h2>${order.name}</h2><p>${order.copy}</p><span class="setup-choice-action">Choose ${order.short} →</span></button>`).join('')}</div><p class="small setup-note">Your character choices match the profile your teacher assigned. Choose the story that feels right to you.</p>`;
 if(draft.step===2)return `${top}<h1 id="adventurer-setup-title" tabindex="-1">How will you defend the realm?</h1><p class="setup-intro">You chose the <strong>${orders[draft.alignment].name}</strong>. Now choose your class.</p><div class="setup-choices">${['warrior','mage'].map(c=>{const option=setupHero(gender,draft.alignment,c);return `<button type="button" class="setup-choice" data-setup-class="${c}" aria-pressed="${draft.characterClass===c}">${portrait(option)}<h2>${title(c)}</h2><strong>${esc(option.family)}</strong><p>${c==='warrior'?'Step forward with courage. Wield your weapon and stand guard when Dragonswood needs you.':'Study ancient mysteries. Wield your staff and channel magic to defend Dragonswood.'}</p><span class="setup-choice-action">Become a ${title(c)} →</span></button>`;}).join('')}</div><button type="button" class="btn" data-setup-back="1">← Change my path</button>`;
 const pets=petsFor(profile);
 return `${top}<h1 id="adventurer-setup-title" tabindex="-1">${needs?'Make this hero yours.':esc(profile.displayName||'Your adventurer')}</h1><p class="setup-intro">${esc(hero?.family)} · ${title(hero?.class||'warrior')} · ${orders[hero?.alignment||'light'].name}${!needs?` · Level ${profile.level}`:''}</p><div class="setup-customize"><div class="setup-preview">${portrait(hero,true)}<span class="setup-preview-caption">Your live character preview</span></div><div>${appearanceFields(draft.appearance)}<label class="setup-companion">Companion<select data-adventurer-pet-choice><option value="">No companion</option>${pets.map(pet=>`<option value="${esc(pet.id)}" ${draft.petId===pet.id?'selected':''}>${esc(pet.name)}</option>`).join('')}</select></label><p class="small">${pets.length?'Choose from your owned companions that are unlocked at your level.':'You can complete every lesson without a pet.'}</p></div></div><div class="setup-save-row">${needs?'<button type="button" class="btn" data-setup-back="2">← Change my class</button>':'<a class="btn" href="#home">Dragon’s Path →</a>'}<button type="button" class="btn primary" data-adventurer-save>${needs?'Begin my journey →':'Save my appearance'}</button></div><p class="small setup-note">${needs?'Your path and class lock when you begin. You can come back to change your colors and companion.':'Your path and class are saved. Your colors and companion can change.'}</p><p data-adventurer-status class="small" role="status" aria-live="polite"></p>`;
}
export function bindAdventurerChooser({root,profile,drawPortrait,onSave,onError}){
 const host=root.querySelector('[data-adventurer-setup]');if(!host)return ()=>{};
 let disposed=false,saving=false,saveRequest=null;
 const draft={step:profile.needsClassSelection?1:3,alignment:null,characterClass:null,appearance:actorPalette(profile.appearance),petId:profile.petId||null};
 function paint(){host.querySelectorAll('[data-adventurer-portrait]').forEach(canvas=>drawPortrait(canvas,canvas.dataset.adventurerPortrait,draft.appearance));}
 function show(){host.querySelector('[data-setup-body]').innerHTML=chooserBody(profile,draft);paint();host.querySelector('#adventurer-setup-title')?.focus({preventScroll:true});host.scrollIntoView({block:'start',behavior:'instant'});}
 function change(event){if(saving||disposed)return;const key=event.target.dataset.appearance;if(key&&APPEARANCE_OPTIONS[key]?.includes(event.target.value)){draft.appearance={...draft.appearance,[key]:event.target.value};saveRequest=null;paint();}if(event.target.matches('[data-adventurer-pet-choice]')){draft.petId=event.target.value||null;saveRequest=null;}}
 async function click(event){
  const button=event.target.closest('button');if(!button||!host.contains(button)||saving||disposed)return;
  if(button.dataset.setupAlignment){draft.alignment=button.dataset.setupAlignment;draft.characterClass=null;draft.step=2;saveRequest=null;show();return;}
  if(button.dataset.setupClass){draft.characterClass=button.dataset.setupClass;draft.step=3;saveRequest=null;show();return;}
  if(button.dataset.setupBack){draft.step=Number(button.dataset.setupBack);saveRequest=null;show();return;}
  if(!button.matches('[data-adventurer-save]'))return;
  const hero=profile.needsClassSelection?setupHero(profile.assignedGender,draft.alignment,draft.characterClass):HERO_OPTIONS.find(h=>h.id===profile.heroId);
  const status=host.querySelector('[data-adventurer-status]');if(!hero||typeof onSave!=='function'){status.textContent='Your character cannot be saved yet. Refresh your saved profile and try again.';return;}
  // Retry the exact receipt after an uncertain network response; changing a choice creates a new request.
  saveRequest ||= {expectedRevision:profile.revision,heroId:hero.id,petId:draft.petId,appearance:{...draft.appearance},setupVersion:ADVENTURER_SETUP_VERSION,requestId:crypto.randomUUID()};
  saving=true;host.setAttribute('aria-busy','true');host.querySelectorAll('button,input,select').forEach(el=>el.disabled=true);status.textContent='Saving your adventurer…';
  try{await onSave(saveRequest);if(!disposed)status.textContent='Your adventurer is saved.';}
  catch(error){if(!disposed){status.textContent=error.message||'Your choice could not be saved. Your selections are still here. Try again.';onError?.(error);}}
  finally{saving=false;if(!disposed){host.removeAttribute('aria-busy');host.querySelectorAll('button,input,select').forEach(el=>el.disabled=false);}}
 }
 paint();host.addEventListener('change',change);host.addEventListener('click',click);
 return()=>{disposed=true;host.removeEventListener('change',change);host.removeEventListener('click',click);};
}
