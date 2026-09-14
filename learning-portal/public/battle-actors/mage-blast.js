/**
 * A staff spell drawn with Phaser Graphics. All motion derives from progress,
 * so a paused / scrubbed timeline is exactly reproducible. The caller owns
 * clearing front and behind, and should use a 1600 ms attack duration.
 */
const TAU = Math.PI * 2;
const WHITE = 0xf2ffff;
const ICE = 0xa4f4ff;
const CYAN = 0x46caff;
const BLUE = 0x3885ff;
const GOLD = 0xffd888;
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const smooth = (a, b, t) => {
  const q = clamp((t - a) / (b - a));
  return q * q * (3 - 2 * q);
};
const windowAt = (p, a, b, c, d) => smooth(a, b, p) * (1 - smooth(c, d, p));
const fract = n => n - Math.floor(n);

/** Small whole-character cast pose; degrees and scene-pixel offsets. */
export function blastPose(progress) {
  const p = clamp(progress);
  const prepare = windowAt(p, 0, .25, .30, .42);
  const release = windowAt(p, .30, .37, .43, .58);
  const sustain = windowAt(p, .39, .48, .68, .94);
  return {
    rootAngle: -1.6 * prepare + 2.5 * release + .65 * sustain,
    rootX: -2.5 * prepare - 5 * release - 1.5 * sustain,
    rootY: -1.2 * prepare + 1.5 * release,
    staffAngle: -4 * prepare + 6 * release + 1.5 * sustain,
    staffLift: -7 * prepare + 3 * release,
    charge: windowAt(p, .02, .28, .33, .43),
    release,
  };
}

/**
 * @param {object} options
 * @param {Phaser.GameObjects.Graphics} options.front Cleared by the caller.
 * @param {Phaser.GameObjects.Graphics} options.behind Cleared by the caller.
 * @param {number} options.progress Attack timeline, 0..1.
 * @param {{x:number,y:number,direction:1|-1}[]} options.origins Staff tips.
 * @param {number} [options.elapsed] Accepted for scene API compatibility.
 */
export function drawMageBlast({ front, behind, progress, origins, elapsed }) {
  // `elapsed` deliberately has no influence: scrub position determines every
  // ring, mote and filament, including after a pause or repeated attack.
  void elapsed;
  const p = clamp(progress);
  if (p <= 0 || p >= .985) return;
  const charge = windowAt(p, .015, .285, .33, .47);
  const power = windowAt(p, .305, .375, .66, .91);
  const release = windowAt(p, .315, .35, .39, .47);
  const extension = smooth(.31, .46, p);

  for (const origin of origins) {
    if (!Number.isFinite(origin.x) || !Number.isFinite(origin.y)) continue;
    const direction = origin.direction < 0 ? -1 : 1;
    const stageLeft = origin.x < 600 ? 14 : 614;
    const stageRight = origin.x < 600 ? 586 : 1186;
    // A shallow upward trajectory leaves the robe and head unobscured. Reserve
    // room for the curved wavefront so it never reaches the neighboring actor.
    const available = direction > 0 ? stageRight - origin.x : origin.x - stageLeft;
    const length = Math.max(0, Math.min(220, available - 10));
    const tilt = -.16;
    const cos = Math.cos(tilt), sin = Math.sin(tilt);
    const at = (u, v = 0) => ({
      x: clamp(origin.x + direction * (u * cos - v * sin), stageLeft, stageRight),
      y: origin.y + u * sin + v * cos,
    });
    const polygon = (g, points, color, alpha) => {
      if (alpha <= .001) return;
      g.fillStyle(color, clamp(alpha));
      g.fillPoints(points.map(([u, v]) => at(u, v)), true);
    };
    const line = (g, a, b, width, color, alpha) => {
      if (alpha <= .001) return;
      const from = at(...a), to = at(...b);
      g.lineStyle(width, color, clamp(alpha));
      g.lineBetween(from.x, from.y, to.x, to.y);
    };
    const circle = (g, u, v, radius, color, alpha) => {
      if (alpha <= .001 || radius <= 0) return;
      const q = at(u, v);
      g.fillStyle(color, clamp(alpha));
      g.fillCircle(q.x, q.y, radius);
    };
    const star = (g, u, v, r, color, alpha) => polygon(g, [
      [u, v - r], [u + r * .22, v - r * .22], [u + r, v],
      [u + r * .22, v + r * .22], [u, v + r],
      [u - r * .22, v + r * .22], [u - r, v],
      [u - r * .22, v - r * .22],
    ], color, alpha);
    // A foreshortened circular rune oriented perpendicular to the spell axis.
    // Segment groups create deliberate gaps rather than a flat HUD circle.
    const ring = (g, u, radius, depth, rotation, color, alpha, width = 1.5, runes = false) => {
      for (let i = 0; i < 48; i++) {
        if (i % 12 >= 9) continue;
        const a = rotation + i / 48 * TAU;
        const b = rotation + (i + 1) / 48 * TAU;
        line(g, [u + Math.cos(a) * depth, Math.sin(a) * radius],
          [u + Math.cos(b) * depth, Math.sin(b) * radius], width, color, alpha);
      }
      if (runes) for (let i = 0; i < 6; i++) {
        const a = rotation + i / 6 * TAU;
        const x = u + Math.cos(a) * depth, y = Math.sin(a) * radius;
        const r = 2.5;
        line(g, [x - r, y], [x, y - r * 1.8], 1.3, GOLD, alpha);
        line(g, [x, y - r * 1.8], [x + r, y], 1.3, GOLD, alpha);
        line(g, [x - r * .65, y - r * .4], [x + r * .65, y - r * .4], 1, GOLD, alpha);
      }
    };

    // Charge stays close to the staff crystal, with motes visibly converging.
    if (charge > .001) {
      for (let k = 5; k >= 1; k--) circle(behind, 0, 0, 5 + k * 5.5, CYAN, charge * .023);
      const radius = 29 - charge * 7;
      ring(front, 1, radius, radius * .79, p * 5, GOLD, charge * .8, 1.3, true);
      ring(front, 0, radius * .72, radius * .58, -p * 7, ICE, charge * .65, 1.2);
      for (let i = 0; i < 9; i++) {
        const phase = fract(p * 3.2 + i * .6180339);
        const a = i * TAU / 9 + p * 3.4;
        const r = 9 + 28 * (1 - phase);
        const u = Math.cos(a) * r, v = Math.sin(a) * r;
        const alpha = charge * Math.sin(phase * Math.PI);
        line(front, [u * 1.14, v * 1.14], [u, v], 1.4, ICE, alpha * .5);
        star(front, u, v, 1.8 + 1.5 * phase, i % 3 ? ICE : GOLD, alpha);
      }
      circle(front, 0, 0, 8 + charge * 2, CYAN, charge * .9);
      star(front, 0, 0, 7 + charge * 5, WHITE, charge);
    }

    if (power <= .001 || length < 12) continue;
    const reach = length * extension;
    const width = (45 + 18 * release) * (.64 + .36 * extension);
    const fade = 1 - smooth(.70, .93, p);

    // The long tapered bloom is translucent at its edges, then narrows through
    // cyan ribbons to a white-hot shaft. It reads as a blast even in a small
    // 120–150 px lane; no single traveling dot carries the attack.
    for (let k = 4; k >= 1; k--) {
      const w = width * (1 + k * .16);
      polygon(behind, [[-3, -5], [reach * .22, -w * .55], [reach * .72, -w],
        [reach, -w * .67], [reach + 5, 0], [reach, w * .67],
        [reach * .72, w], [reach * .22, w * .55], [-3, 5]],
      k > 2 ? BLUE : CYAN, power * .067);
    }
    polygon(front, [[0, -5], [reach * .23, -width * .44],
      [reach * .66, -width * .67], [reach * .92, -width * .49],
      [reach + 3, 0], [reach * .92, width * .49],
      [reach * .66, width * .67], [reach * .23, width * .44], [0, 5]], CYAN, power * .52);

    // Airy flame tongues and rolling energy filaments break the beam contour.
    for (let i = 0; i < 7; i++) {
      const side = i % 2 ? 1 : -1;
      const wobble = Math.sin(p * 48 + i * 2.3);
      const start = .10 + i * .045;
      const end = .83 + .13 * Math.sin(i * 2.9) ** 2;
      const spread = side * width * (.35 + i * .075);
      polygon(front, [[reach * start, side * 3],
        [reach * .50, spread * .78 + wobble * 2.5],
        [reach * .76, spread], [reach * end, spread * .34],
        [reach * .67, spread * .57], [reach * .36, side * 4]],
      i % 3 ? ICE : WHITE, power * (.22 + .045 * (i % 3)));
    }
    polygon(front, [[0, -3], [reach * .28, -9], [reach * .64, -12],
      [reach * .91, -6], [reach + 2, 0], [reach * .91, 6],
      [reach * .64, 12], [reach * .28, 9], [0, 3]], ICE, power * .8);
    polygon(front, [[0, -2], [reach * .32, -4.3], [reach * .65, -6],
      [reach, 0], [reach * .65, 6], [reach * .32, 4.3], [0, 2]], WHITE, power * .96);

    // A broad leading shockwave makes the release legible at gameplay scale.
    // Its ellipse is narrow along the travel axis and roughly 90–140 px tall.
    const waveRadius = width * (1.04 + .13 * Math.sin(p * 31));
    ring(front, reach - 5, waveRadius, 9, -p * 4, ICE, power * .68, 2.6);
    ring(front, reach - 11, waveRadius * .83, 5, p * 3, WHITE, power * .78, 1.3);

    // Two counter-rotating gold casting seals stay near the staff, visibly
    // connecting the held weapon to the beam. The wider seal opens at release.
    ring(front, 11, 19 + release * 7, 7, p * 7, GOLD, power * .95, 1.8, true);
    ring(front, 33, 26 + release * 9, 9, -p * 5, GOLD, power * .62, 1.3, true);
    circle(front, 0, 0, 10, CYAN, power * .55);
    circle(front, 0, 0, 5, WHITE, power);
    if (release > .001) {
      star(front, 2, 0, 26 * release, WHITE, release * .9);
      ring(behind, 15, 22 + smooth(.32, .47, p) * 28, 12,
        0, GOLD, release * .5, 1.5);
    }

    // Streamed embers carry the same direction as the blast. Their positions
    // are deterministic functions of the timeline and disappear with power.
    for (let i = 0; i < 20; i++) {
      const q = fract(p * (2.1 + i % 3 * .19) + i * .6180339);
      const u = (15 + q * Math.max(0, reach - 22));
      const side = i % 2 ? 1 : -1;
      const v = side * (8 + width * (.20 + .57 * Math.sin(i * 4.71) ** 2))
        * Math.sin(q * Math.PI * .82);
      const alpha = power * Math.sin(q * Math.PI) * (.6 + .4 * fade);
      const color = i % 4 === 0 ? GOLD : ICE;
      line(front, [Math.max(3, u - 9), v * .96], [u, v], i % 4 ? 1.2 : 1.6, color, alpha * .58);
      if (i % 3 === 0) star(front, u, v, 2.1 + (i % 2) * .8, color, alpha);
    }
  }
}
