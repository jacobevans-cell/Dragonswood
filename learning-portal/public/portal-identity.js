import { HERO_OPTIONS, PET_OPTIONS } from './battle-actors/actor-catalog.js';
import { loadActorSelection, actorPalette } from './battle-actors/actor-selection.js';
import { prepareSpritePixels, recolorSpritePixels } from './battle-actors/sprite-appearance.js';
import { alphaBounds, containSilhouette } from './battle-actors/portrait-fit.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MASCOT = '/assets/dragonswood-mascot/';
const starterHeroes = HERO_OPTIONS.filter(hero => hero.level === 1);
const imageCache = new Map();
const portraitCache = new Map();
const heroFor = profile => HERO_OPTIONS.find(hero => hero.id === profile?.heroId);
export function eligiblePortalPets(profile) {
  const owned = new Set(profile?.ownedPetIds || []), eligible = new Set(profile?.eligiblePetIds || []);
  return PET_OPTIONS.filter(pet => owned.has(pet.id) && eligible.has(pet.id));
}
function heroDescription(hero) { return hero ? `${hero.family} · ${hero.class === 'mage' ? 'Mage' : 'Warrior'}` : 'Choose your adventurer'; }
function portraitMarkup(profile, large = false) {
  const hero = profile?.needsClassSelection ? null : heroFor(profile);
  return `<span class="portal-portrait ${large ? 'portal-portrait--large' : ''}"><img class="portal-portrait-fallback" src="${MASCOT}assets/icons/dragonswood-mascot-64.png" width="64" height="64" alt=""><canvas data-adventurer-portrait="${esc(hero?.id || '')}" width="256" height="${large ? 300 : 256}" role="img" aria-label="${esc(hero ? `${hero.family} adventurer` : 'Choose an adventurer')}" hidden></canvas></span>`;
}
export function portalIdentityMarkup(profile) {
  return `<a class="portal-identity" href="#home" aria-label="Your adventurer and companion">${portraitMarkup(profile)}<span><strong>${esc(profile?.displayName || 'Your adventurer')}</strong><small>${esc(profile?.needsClassSelection ? 'Choose your class' : heroDescription(heroFor(profile)))}</small></span></a>`;
}
const GUIDE = {
  home: ['assets/animations/guide-right/frame-1.webp', 'Your next step is waiting.', 'Choose a lesson below. Your saved work stays with you.'],
  morning: ['assets/actions/boss.webp', 'Think carefully. Make your move.', 'Take one question at a time. Use the coach when you need another look.'],
  math: ['assets/actions/math.webp', 'Make the thinking visible.', 'Explore the model, then show what you understand.'],
  reading: ['assets/actions/reading.webp', 'Let the text help you.', 'Keep the passage close and use its details as evidence.'],
  writing: ['assets/actions/scribe.webp', 'Your ideas can grow.', 'Return to your draft, develop your reasons, and revise with care.'],
  science: ['assets/actions/science.webp', 'Notice. Explain. Test.', 'Use what you observe to explain your thinking.'],
  morphology: ['assets/actions/languages.webp', 'Look inside the word.', 'Word parts can help you discover meaning.'],
  ccf: ['assets/actions/reading.webp', 'Follow the evidence.', 'Check what the supplied records show before you decide.'],
  teacher: ['assets/badges/neutral.webp', 'A clear view of the work.', 'Saved work and confirmed results tell the story.'],
};
export function portalGuideMarkup(route) {
  const guide = GUIDE[route];
  if (!guide) return '';
  return `<section class="portal-guide" aria-label="Dragonswood guide"><img src="${MASCOT}${guide[0]}" width="128" height="128" alt="" decoding="async"><div><strong>${esc(guide[1])}</strong><p>${esc(guide[2])}</p></div></section>`;
}
export function adventurerHomeMarkup(profile) {
  if (!profile) return '';
  const current = heroFor(profile), needs = Boolean(profile.needsClassSelection), allowedPets = eligiblePortalPets(profile);
  const choices = needs ? starterHeroes : (current ? [current] : []);
  const selectedPet = allowedPets.find(pet => pet.id === profile.petId);
  return `<section class="panel portal-adventurer" data-adventurer-home><div class="portal-adventurer-art">${portraitMarkup(profile, true)}<canvas data-adventurer-pet class="portal-companion" width="256" height="300" role="img" aria-label="Your companion" hidden></canvas></div><div class="portal-adventurer-copy"><div class="eyebrow">YOUR ADVENTURER</div><h2>${needs ? 'Choose your beginning.' : esc(profile.displayName || 'Your journey continues.')}</h2><p>${needs ? 'Choose a Warrior or Mage family. Every new class choice begins at level 1.' : `${esc(heroDescription(current))} · Level ${esc(profile.level ?? current?.level ?? 1)}`}</p><details class="portal-character-editor" ${needs ? 'open' : ''}><summary>${needs ? 'Choose your character' : 'Character & companion'}</summary><div class="portal-character-fields"><label>Character family<select data-adventurer-hero ${needs ? "" : "disabled"}>${choices.map(hero => `<option value="${esc(hero.id)}" ${hero.id === profile.heroId ? 'selected' : ''}>${esc(heroDescription(hero))} · Level ${hero.level}</option>`).join('')}</select></label><label>Companion<select data-adventurer-pet-choice><option value="" ${!selectedPet ? 'selected' : ''}>No companion</option>${allowedPets.map(pet => `<option value="${esc(pet.id)}" ${pet.id === selectedPet?.id ? 'selected' : ''}>${esc(pet.name)}</option>`).join('')}</select></label></div><p class="small">${allowedPets.length ? 'Only your owned companions that meet the level requirement appear here.' : 'No eligible owned companion is available yet. You can complete every lesson without a pet.'}</p><p class="small">${needs ? "Your character class and level do not change your assigned learning track." : "Your class is saved. You can change your eligible companion here."}</p><button type="button" class="btn primary" data-adventurer-save>${needs ? 'Save my adventurer' : 'Save character & companion'}</button><p data-adventurer-status class="small" role="status"></p></details></div></section>`;
}
function imageAt(url) {
  if (!imageCache.has(url)) imageCache.set(url, new Promise((resolve, reject) => {
    const image = new Image();
    const timer = setTimeout(() => finish(new Error('Character artwork could not load.')), 8000);
    const finish = error => { clearTimeout(timer); image.onload = image.onerror = null; error ? reject(error) : resolve(image); };
    image.onload = () => finish(); image.onerror = () => finish(new Error('Character artwork could not load.')); image.src = url;
  }).catch(error => { imageCache.delete(url); throw error; }));
  while (imageCache.size > 4) imageCache.delete(imageCache.keys().next().value);
  return imageCache.get(url);
}
async function portraitSource(heroId, appearance) {
  const key = `${heroId}:${JSON.stringify(appearance || {})}`;
  if (!portraitCache.has(key)) portraitCache.set(key, (async () => {
    const { hero } = await loadActorSelection({ heroId, petId: null });
    const metadata = hero.views.front, source = await imageAt(metadata.path);
    const [x, y, width, height] = metadata.frame || [0, 0, source.naturalWidth, source.naturalHeight];
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(source, x, y, width, height, 0, 0, width, height);
    const data = context.getImageData(0, 0, width, height);
    data.data.set(recolorSpritePixels(prepareSpritePixels(data.data, width, height, metadata), appearance || { skin:'medium', hair:'brown', eyes:'blue' }));
    context.putImageData(data, 0, 0); return { canvas, bounds:alphaBounds(data.data, width, height) };
  })().catch(error => { portraitCache.delete(key); throw error; }));
  const result = portraitCache.get(key);
  while (portraitCache.size > 4) portraitCache.delete(portraitCache.keys().next().value);
  return result;
}
/** Root owns the trusted save request and profile state; this binder never writes local profile authority. */
export function bindPortalIdentity({ root = document, profile, onSave, onError } = {}) {
  let disposed = false, saving = false, epoch = 0;
  const targetEpochs = new WeakMap();
  async function draw(canvas, heroId) {
    const token = (targetEpochs.get(canvas) || 0) + 1; targetEpochs.set(canvas, token);
    if (!HERO_OPTIONS.some(hero => hero.id === heroId)) return;
    try {
      const source = await portraitSource(heroId, actorPalette(profile?.appearance));
      if (disposed || !canvas.isConnected || targetEpochs.get(canvas) !== token) return;
      const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bounds = source.bounds, fit = containSilhouette(bounds, canvas.width, canvas.height);
      if (!fit) throw new Error('Character artwork is empty.');
      ctx.drawImage(source.canvas, bounds.x, bounds.y, bounds.width, bounds.height, fit.x, fit.y, fit.width, fit.height);
      canvas.hidden = false; canvas.parentElement.querySelector('.portal-portrait-fallback').hidden = true;
      canvas.setAttribute('aria-label', `${HERO_OPTIONS.find(h => h.id === heroId).family} adventurer`);
    } catch { if (!disposed && targetEpochs.get(canvas) === token) { canvas.hidden = true; const fallback = canvas.parentElement?.querySelector('.portal-portrait-fallback'); if (fallback) fallback.hidden = false; } }
  }
  async function drawPet(petId) {
    const token = ++epoch, target = root.querySelector('[data-adventurer-pet]');
    if (!target) return;
    target.hidden = true;
    if (!eligiblePortalPets(profile).some(pet => pet.id === petId)) return;
    try {
      const { pet } = await loadActorSelection({ heroId: profile.heroId, petId });
      const image = await imageAt(pet.views.front.path);
      if (disposed || token !== epoch || !target.isConnected) return;
      const source = document.createElement('canvas'); source.width = image.naturalWidth; source.height = image.naturalHeight;
      const sourceContext = source.getContext('2d', {willReadFrequently:true}); sourceContext.drawImage(image,0,0);
      const bounds = alphaBounds(sourceContext.getImageData(0,0,source.width,source.height).data,source.width,source.height);
      const fit = containSilhouette(bounds,target.width,target.height);
      if (!fit) return;
      const context = target.getContext('2d'); context.clearRect(0,0,target.width,target.height);
      context.drawImage(source,bounds.x,bounds.y,bounds.width,bounds.height,fit.x,fit.y,fit.width,fit.height);
      target.setAttribute('aria-label',`${pet.name} companion`); target.hidden = false;
    } catch {}
  }
  root.querySelectorAll('[data-adventurer-portrait]').forEach(canvas => draw(canvas, canvas.dataset.adventurerPortrait));
  if (profile?.needsClassSelection) {
    const select = root.querySelector('[data-adventurer-hero]');
    const canvas = root.querySelector('[data-adventurer-home] [data-adventurer-portrait]');
    if (select && canvas) draw(canvas, select.value);
    const status = root.querySelector('[data-adventurer-status]');
    if (status) status.textContent = 'Character preview · save your choice to begin.';
  }
  if (profile?.petId) drawPet(profile.petId);
  const onChange = event => {
    if (event.target.matches('[data-adventurer-hero]')) {
      const canvas = root.querySelector('[data-adventurer-home] [data-adventurer-portrait]');
      if (canvas) draw(canvas, event.target.value);
      const status = root.querySelector('[data-adventurer-status]');
      if (status) status.textContent = 'Previewing this character. Save to make it your adventurer.';
    }
    if (event.target.matches('[data-adventurer-pet-choice]')) drawPet(event.target.value || null);
  };
  const onClick = async event => {
    const button = event.target.closest('[data-adventurer-save]');
    if (!button || !root.contains(button) || disposed || saving) return;
    const home = button.closest('[data-adventurer-home]'), status = home.querySelector('[data-adventurer-status]');
    const heroId = home.querySelector('[data-adventurer-hero]').value, petId = home.querySelector('[data-adventurer-pet-choice]').value || null;
    if (!starterHeroes.some(hero => hero.id === heroId) && heroId !== profile.heroId) return;
    if (petId && !eligiblePortalPets(profile).some(pet => pet.id === petId)) return;
    if (typeof onSave !== 'function') { status.textContent = 'Character saving is not connected yet.'; return; }
    saving = true;
    home.querySelectorAll('button,select').forEach(control => control.disabled = true);
    status.textContent = 'Saving your adventurer…';
    try {
      await onSave({ expectedRevision: profile.revision, heroId, petId, requestId: crypto.randomUUID() });
      if (!disposed) status.textContent = 'Your adventurer is saved.';
    } catch (error) {
      if (!disposed) { status.textContent = error.message || 'Your choice could not be saved. Try again.'; onError?.(error); }
    } finally {
      saving = false;
      if (!disposed) home.querySelectorAll('button,select').forEach(control => control.disabled = control.matches('[data-adventurer-hero]') && !profile.needsClassSelection);
    }
  };
  root.addEventListener('change', onChange); root.addEventListener('click', onClick);
  return () => { disposed = true; epoch++; root.removeEventListener('change', onChange); root.removeEventListener('click', onClick); };
}
