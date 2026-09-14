import { HERO_OPTIONS } from './battle-actors/actor-catalog.js?v=dragon-path-7';

// A new setup version reopens the chooser without deleting any saved identity or work.
export const ADVENTURER_SETUP_VERSION = 'dragonswood-adventurer-setup.2';
export const APPEARANCE_OPTIONS = Object.freeze({
  skin: Object.freeze(['light', 'medium', 'deep']),
  hair: Object.freeze(['white', 'black', 'brown', 'purple']),
  eyes: Object.freeze(['blue', 'green', 'brown', 'purple']),
});
export function assignedCharacterGender(profile = {}) {
  const value = String(profile.genderGroup || '').trim().toLowerCase();
  if (['girl', 'girls', 'female'].includes(value)) return 'female';
  if (['boy', 'boys', 'male'].includes(value)) return 'male';
  return null;
}
export function setupHero(gender, alignment, characterClass) {
  return HERO_OPTIONS.find(hero => hero.level === 1 && hero.gender === gender && hero.alignment === alignment && hero.class === characterClass) || null;
}
export function validAppearance(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).length === 3 && Object.entries(APPEARANCE_OPTIONS).every(([key, values]) => values.includes(value[key]));
}
