export const PLAYBACK_RATES = Object.freeze([0.5, 0.75, 1, 1.25, 1.5]);
export const validPlaybackRate = (rate) => PLAYBACK_RATES.includes(rate);
