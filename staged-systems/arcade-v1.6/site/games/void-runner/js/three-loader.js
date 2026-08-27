const THREE_VERSION = '0.185.1';

const sources = [
  '../vendor/three.module.js',
  `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/build/three.module.js`,
  `https://unpkg.com/three@${THREE_VERSION}/build/three.module.js`,
  `https://esm.sh/three@${THREE_VERSION}`
];

export async function loadThree() {
  const errors = [];
  for (const source of sources) {
    try {
      return await import(source);
    } catch (error) {
      errors.push(`${source}: ${error?.message || error}`);
    }
  }
  throw new Error(`3D engine unavailable. Local Three.js was missing and network fallbacks were blocked. Open Device Check from the arcade. Details: ${errors.join(' | ')}`);
}
