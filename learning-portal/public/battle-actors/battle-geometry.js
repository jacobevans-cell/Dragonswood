// Arena coordinates are presentation only. They never determine a grade or HP.
export const ARENA = Object.freeze({
  width: 1000,
  height: 420,
  floor: 372,
  heroX: 263,
  heroHeight: 291,
  heroShadowWidth: 111,
  heroShadowHeight: 19,
  petX: 456,
  petHeight: 120,
  petMaxWidth: 128,
  enemyX: 757,
  enemyHeight: 246,
  bossHeight: 280,
  enemyMaxWidth: 271,
});

/** Cover the compact viewport without stretching the original illustration. */
export function arenaBackgroundFrame(sourceWidth, sourceHeight) {
  const scale = Math.max(
    ARENA.width / sourceWidth,
    ARENA.height / sourceHeight,
  );
  const width = sourceWidth * scale,
    height = sourceHeight * scale;
  return {
    x: (ARENA.width - width) / 2,
    y: (ARENA.height - height) / 2,
    width,
    height,
  };
}
export const clamp = (value, low = 0, high = 1) =>
  Math.max(low, Math.min(high, value));
export const smooth = (value) => {
  const p = clamp(value);
  return p * p * (3 - 2 * p);
};

/** One outward flight ending at the actual opposing actor, with no return arc. */
export function targetFlight(progress, origin, target, lift = 44) {
  const p = smooth(progress);
  return {
    x: origin.x + (target.x - origin.x) * p,
    y: origin.y + (target.y - origin.y) * p - Math.sin(Math.PI * p) * lift,
  };
}

/** Reflect artwork and all authored attachment points around the same foot pivot. */
export function heroPoint(point, anchor, pose) {
  const angle = (pose.angle * Math.PI) / 180;
  const x = (point[0] - anchor[0]) * pose.scaleX;
  const y = (point[1] - anchor[1]) * pose.scaleY;
  return {
    x: pose.x + x * Math.cos(angle) - y * Math.sin(angle),
    y: pose.y + x * Math.sin(angle) + y * Math.cos(angle),
  };
}

export function enemyFacing(definition, direction = -1) {
  const authored = definition.effectOrigin.x < 0.5 ? -1 : 1;
  return authored === direction ? 1 : -1;
}
