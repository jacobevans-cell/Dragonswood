import { clamp, smooth } from "./motion.js?v=dragon-path-8";
import { targetFlight } from "./battle-geometry.js?v=dragon-path-8";
const TAU = Math.PI * 2;
function line(g, points, width, color, alpha) {
  if (points.length < 2 || alpha <= 0) return;
  g.lineStyle(width, color, alpha);
  g.beginPath();
  g.moveTo(points[0].x, points[0].y);
  for (const p of points.slice(1)) g.lineTo(p.x, p.y);
  g.strokePath();
}
function star(g, x, y, r, color, alpha, rotation = 0) {
  g.fillStyle(color, alpha);
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + rotation,
      rr = i % 2 ? r * 0.22 : r;
    const px = x + Math.cos(a) * rr,
      py = y + Math.sin(a) * rr;
    if (!i) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.fillPath();
}
function ring(g, x, y, r, color, alpha, width = 2) {
  g.lineStyle(width, color, alpha);
  g.strokeEllipse(x, y, r * 2, r * 0.75);
}
function impact(g, x, y, p, color, size = 1) {
  if (p < 0 || p > 1) return;
  const a = Math.pow(1 - p, 1.5);
  g.lineStyle(4 * size * (1 - p) + 1, color, a * 0.8);
  g.strokeCircle(x, y, (12 + 48 * p) * size);
  g.fillStyle(0xfff6dc, a * 0.72);
  g.fillCircle(x, y, 13 * (1 - p) * size);
  for (let i = 0; i < 12; i++) {
    const angle = (i * TAU) / 12 + 0.3;
    const r = (16 + 66 * p) * size;
    star(
      g,
      x + Math.cos(angle) * r,
      y + Math.sin(angle) * r,
      4 * size * (1 - p) + 1,
      i % 2 ? color : 0xfff7d9,
      a,
      angle,
    );
  }
}
function crescent(g, x, y, angle, color, alpha, size = 1) {
  const points = [];
  for (let i = 0; i <= 20; i++) {
    const a = angle - 1.3 + (i / 20) * 2.6;
    points.push({
      x: x + Math.cos(a) * 34 * size,
      y: y + Math.sin(a) * 34 * size,
    });
  }
  line(g, points, 16 * size, color, alpha * 0.12);
  line(g, points, 8 * size, color, alpha * 0.7);
  line(g, points, 2.5 * size, 0xfff7db, alpha);
}
function comet(g, x, y, angle, color, alpha) {
  const transform = (u, v) => ({
    x: x + Math.cos(angle) * u - Math.sin(angle) * v,
    y: y + Math.sin(angle) * u + Math.cos(angle) * v,
  });
  for (const [size, a, c] of [
    [1.5, alpha * 0.1, color],
    [1, alpha * 0.85, color],
    [0.55, alpha, 0xfff8df],
  ]) {
    const shape = [
      [29, 0],
      [13, -14],
      [-7, -17],
      [-19, -10],
      [-53, -5],
      [-28, 1],
      [-45, 12],
      [-12, 13],
      [11, 11],
    ].map(([u, v]) => transform(u * size, v * size));
    g.fillStyle(c, a);
    g.beginPath();
    g.moveTo(shape[0].x, shape[0].y);
    for (const p of shape.slice(1)) g.lineTo(p.x, p.y);
    g.closePath();
    g.fillPath();
  }
  const a = transform(-8, -24),
    b = transform(17, -18),
    c = transform(34, 0),
    d = transform(16, 17);
  line(g, [a, b, c, d], 2.5, 0xfff5d6, alpha * 0.8);
}
export function drawEnemyEffects(g, motion, time, d, layout) {
  g.clear();
  const { x, y, width, height, origin, duration, target } = layout;
  const p = clamp(time / duration),
    color = Number.parseInt(d.effectColor.slice(1), 16),
    centerY = y - height * 0.47;
  if (motion === "heal") {
    const a = Math.sin(p * Math.PI);
    ring(g, x, y + 1, 38 + 65 * p, 0xa5ffd8, a * 0.5, 3);
    ring(g, x, y + 2, 27 + 36 * p, 0xffe6a4, a * 0.7, 1);
    for (let i = 0; i < 18; i++) {
      const q = (p + i / 18) % 1;
      const xx = x + Math.sin(i * 2.4 + q * 2) * width * 0.38;
      const yy = y - q * (height + 30);
      star(
        g,
        xx,
        yy,
        3 + 3 * Math.sin(q * Math.PI),
        i % 3 ? 0xa4ffe2 : 0xffe6a4,
        a * Math.sin(q * Math.PI),
        p + i,
      );
    }
    g.lineStyle(3, 0xb2ffde, a * 0.23);
    g.strokeEllipse(x, centerY, width * 0.82, height * 0.95);
    return;
  }
  if (motion === "hurt") {
    if (p > 0.08 && p < 0.75) {
      const a = Math.sin(((p - 0.08) / 0.67) * Math.PI);
      for (let i = 0; i < 5; i++)
        star(
          g,
          x + Math.cos(i * 2.3) * width * 0.35,
          centerY + Math.sin(i * 2.3) * height * 0.25,
          4,
          0xff877e,
          a * 0.65,
          i,
        );
    }
    return;
  }
  if (motion !== "attack") return;
  const charge = clamp(p / 0.29) * (1 - smooth((p - 0.29) / 0.13));
  if (charge > 0) {
    g.fillStyle(color, charge * 0.14);
    g.fillCircle(origin.x, origin.y, 12 + 17 * charge);
    ring(g, origin.x, origin.y, 8 + 13 * charge, color, charge * 0.8, 2);
    star(g, origin.x, origin.y, 5 + 5 * charge, 0xfff6df, charge, p * 5);
  }
  const f = (p - 0.27) / 0.36;
  if (f < 0) return;
  // The flight reaches the opponent exactly at p=.63, matching onImpact.
  // Its terminal burst fades there rather than flying back to its owner.
  const destination = target || { x: origin.x, y: origin.y };
  const flight = (t) =>
    targetFlight(t, origin, destination, Math.min(50, height * 0.16));
  if (f > 1) {
    impact(
      g,
      destination.x,
      destination.y,
      (p - 0.63) / 0.23,
      color,
      d.isBoss ? 1.2 : 0.9,
    );
    return;
  }
  const opacity = Math.min(1, f * 12, (1 - f) * 9);
  const point = flight(f),
    previous = flight(Math.max(0, f - 0.012));
  const angle = Math.atan2(point.y - previous.y, point.x - previous.x);
  const trail = [];
  for (let i = 0; i <= 32; i++)
    trail.push(flight(Math.max(0, f - 0.28 + (i / 32) * 0.28)));
  const style = d.attackStyle;
  if (style === "slash" || style === "thrust" || style === "claw") {
    line(g, trail, 26, color, opacity * 0.045);
    line(g, trail, 13, color, opacity * 0.12);
    line(g, trail, 5, color, opacity * 0.45);
    line(g, trail, 1.6, 0xfff5d5, opacity * 0.85);
    if (style === "slash")
      crescent(g, point.x, point.y, angle, color, opacity, 1.15);
    if (style === "thrust") {
      const tail = {
        x: point.x - Math.cos(angle) * 70,
        y: point.y - Math.sin(angle) * 70,
      };
      line(g, [tail, point], 13, color, opacity * 0.2);
      line(g, [tail, point], 4, 0xfff2d1, opacity);
      g.fillStyle(color, opacity);
      g.fillTriangle(
        point.x + Math.cos(angle) * 17,
        point.y + Math.sin(angle) * 17,
        point.x + Math.cos(angle + 2.4) * 18,
        point.y + Math.sin(angle + 2.4) * 18,
        point.x + Math.cos(angle - 2.4) * 18,
        point.y + Math.sin(angle - 2.4) * 18,
      );
    }
    if (style === "claw")
      for (let i = -1; i <= 1; i++)
        crescent(
          g,
          point.x + Math.cos(angle + Math.PI / 2) * i * 16,
          point.y + Math.sin(angle + Math.PI / 2) * i * 16,
          angle,
          color,
          opacity,
          0.65,
        );
  } else if (style === "spell" || style === "burst") {
    line(g, trail, 44, color, opacity * 0.05);
    line(g, trail, 27, color, opacity * 0.13);
    line(g, trail, 15, color, opacity * 0.5);
    line(g, trail, 5, 0xfff6dc, opacity * 0.95);
    comet(g, point.x, point.y, angle, color, opacity);
    for (let i = 0; i < 10; i++) {
      const t = Math.max(0, f - i * 0.019);
      const s = flight(t);
      const a = f * 14 + i * 2.4;
      star(
        g,
        s.x + Math.cos(a) * (10 + i),
        s.y + Math.sin(a) * (10 + i),
        3 + (10 - i) * 0.15,
        i % 3 ? color : 0xfff7de,
        opacity * (1 - i / 12),
        a,
      );
    }
    if (style === "burst") {
      g.lineStyle(2, color, opacity * 0.6);
      g.strokeCircle(point.x, point.y, 25 + 5 * Math.sin(f * TAU * 3));
      for (let i = 0; i < 5; i++)
        star(
          g,
          point.x + Math.cos((i * TAU) / 5 + f * 8) * 32,
          point.y + Math.sin((i * TAU) / 5 + f * 8) * 32,
          4,
          color,
          opacity * 0.8,
          f,
        );
    }
  } else if (style === "charge") {
    line(g, trail, 24, color, opacity * 0.14);
    line(g, trail, 8, color, opacity * 0.7);
    comet(g, point.x, point.y, angle, color, opacity);
    for (let i = -3; i <= 3; i++) {
      const xx = x + i * width * 0.12;
      const yy = y - height * 0.3 + Math.abs(i) * 12;
      line(
        g,
        [
          { x: xx - i * 8, y: yy - 70 - 35 * f },
          { x: xx + i * 5, y: yy + 60 * f },
        ],
        5,
        color,
        opacity * 0.25,
      );
      line(
        g,
        [
          { x: xx - i * 8, y: yy - 70 - 35 * f },
          { x: xx + i * 5, y: yy + 60 * f },
        ],
        1.3,
        0xfff5da,
        opacity * 0.65,
      );
    }
    ring(g, x, y + 5, 35 + width * 0.38 * f, color, opacity * 0.9, 4);
    ring(g, x, y + 7, 22 + width * 0.35 * f, 0xfff2d1, opacity * 0.65, 1.4);
    for (let i = 0; i < 8; i++) {
      const a = (i * TAU) / 8;
      star(
        g,
        x + Math.cos(a) * (25 + 70 * f),
        y + Math.sin(a) * (8 + 25 * f),
        5,
        color,
        opacity,
        a,
      );
    }
  }
  const hit = (p - 0.63) / 0.23;

  impact(g, destination.x, destination.y, hit, color, d.isBoss ? 1.2 : 0.9);
}
