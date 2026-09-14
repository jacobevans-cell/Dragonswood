import { HERO_OPTIONS, PET_OPTIONS } from './battle-actors/actor-catalog.js?v=dragon-path-8';
import { loadActorSelection, actorPalette } from './battle-actors/actor-selection.js?v=dragon-path-8';
import { prepareSpritePixels, recolorSpritePixels } from './battle-actors/sprite-appearance.js?v=dragon-path-8';
import { alphaBounds, containSilhouette } from './battle-actors/portrait-fit.js?v=dragon-path-8';
import { animatePortalIdle } from './portal-idle.js?v=dragon-path-8';
import { adventurerChooserMarkup, bindAdventurerChooser } from './adventurer-chooser.js?v=dragon-path-8';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MASCOT = '/Dragonswood/learning-portal/public/assets/dragonswood-mascot/';
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
export const adventurerHomeMarkup = adventurerChooserMarkup;
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
  const idleStops=new Map();
  const targetEpochs = new WeakMap();
  async function draw(canvas, heroId, appearance = profile?.appearance) {
    for(const [old,stop] of idleStops)if(!old.isConnected){stop();idleStops.delete(old);}
    const token = (targetEpochs.get(canvas) || 0) + 1; targetEpochs.set(canvas, token);
    if (!HERO_OPTIONS.some(hero => hero.id === heroId)) return;
    try {
      const source = await portraitSource(heroId, actorPalette(appearance));
      if (disposed || !canvas.isConnected || targetEpochs.get(canvas) !== token) return;
      const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bounds = source.bounds, fit = containSilhouette(bounds, canvas.width, canvas.height);
      if (!fit) throw new Error('Character artwork is empty.');
      ctx.drawImage(source.canvas, bounds.x, bounds.y, bounds.width, bounds.height, fit.x, fit.y, fit.width, fit.height);
      canvas.hidden = false; canvas.parentElement.querySelector('.portal-portrait-fallback').hidden = true;
      canvas.setAttribute('aria-label', `${HERO_OPTIONS.find(h => h.id === heroId).family} adventurer`);
      if(canvas.closest('.portal-adventurer-art,[data-live-adventurer]')&&!canvas.closest('.portal-hero-option')){idleStops.get(canvas)?.();idleStops.set(canvas,animatePortalIdle(canvas));}
    } catch { if (!disposed && targetEpochs.get(canvas) === token) { canvas.hidden = true; const fallback = canvas.parentElement?.querySelector('.portal-portrait-fallback'); if (fallback) {fallback.hidden = false;if(fallback.tagName!=='IMG')fallback.textContent='Portrait unavailable · select to retry';} } }
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
  if (profile?.petId) drawPet(profile.petId);
  const stopChooser=bindAdventurerChooser({root,profile,drawPortrait:draw,onSave,onError});
  return () => { disposed = true; epoch++; stopChooser(); idleStops.forEach(stop=>stop()); idleStops.clear(); };
}
