import { HERO_OPTIONS, PET_OPTIONS } from './actor-catalog.js';

export const DEFAULT_ACTORS = Object.freeze({
  heroId: 'warrior-light-male-1',
  petId: 'pet-new-emberdrake-bold',
});
export function actorSelection(value = {}) {
  return {
    heroId: HERO_OPTIONS.some(hero => hero.id === value?.heroId) ? value.heroId : DEFAULT_ACTORS.heroId,
    petId: value?.petId === null ? null : PET_OPTIONS.some(pet => pet.id === value?.petId) ? value.petId : DEFAULT_ACTORS.petId,
  };
}
const requests = new Map();
async function definition(kind, id) {
  const key = `${kind}:${id}`;
  if (!requests.has(key)) requests.set(key,
    fetch(`/assets/daily-battle/${kind}-definitions/${encodeURIComponent(id)}.json`, { signal: AbortSignal.timeout(8000) })
      .then(response => { if (!response.ok) throw new Error('Selected artwork is unavailable'); return response.json(); })
      .then(data => { if (data.id !== id) throw new Error('Actor identity mismatch'); return data; })
      .catch(error => { requests.delete(key); throw error; }));
  return requests.get(key);
}
export async function loadActorSelection(value) {
  const selected = actorSelection(value);
  const [hero, pet] = await Promise.all([
    definition('hero', selected.heroId),
    selected.petId ? definition('pet', selected.petId) : null,
  ]);
  return { hero, pet };
}

export function actorPalette(value = {}) {
  const allowed = { skin: ['light','medium','deep'], hair: ['white','black','brown','purple'], eyes: ['blue','green','brown','purple'] };
  const fallback = { skin:'medium', hair:'brown', eyes:'blue' };
  return Object.fromEntries(Object.entries(allowed).map(([key, choices]) => [key, choices.includes(value?.[key]) ? value[key] : fallback[key]]));
}
/** Already-authorized server profile projection. Never substitute a preview-owned pet. */
export function trustedActorSelection(profile) {
  const hero = !profile?.needsClassSelection && HERO_OPTIONS.find(item => item.id === profile?.heroId);
  const petId = hero && PET_OPTIONS.some(item => item.id === profile?.petId) &&
    profile?.ownedPetIds?.includes(profile.petId) && profile?.eligiblePetIds?.includes(profile.petId) ? profile.petId : null;
  return { heroId: hero?.id || null, petId, appearance: actorPalette(profile?.appearance) };
}
