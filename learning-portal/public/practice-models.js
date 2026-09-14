// Deterministic feedback for unscored learning practice. This is not a grade bank.
const vector = s => [s.points[1][0] - s.points[0][0], s.points[1][1] - s.points[0][1]];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const subtract = (a, b) => a.map((v, i) => v - b[i]);
const length2 = a => dot(a, a);
const paths = shapes => shapes.filter(s => ['segment', 'ray', 'line'].includes(s.tool) && s.points.length === 2 && length2(vector(s)) > 0);

export function rectangle(points, nonSquare = false) {
  if (points?.length !== 4 || new Set(points.map(p => p.join(','))).size !== 4) return false;
  const edges = points.map((p, i) => subtract(points[(i + 1) % 4], p));
  return edges.every((v, i) => length2(v) > 0 && dot(v, edges[(i + 1) % 4]) === 0)
    && (!nonSquare || length2(edges[0]) !== length2(edges[1]));
}
export function parallel(a, b) {
  const u = vector(a), v = vector(b);
  return length2(u) > 0 && length2(v) > 0 && cross(u, v) === 0
    && cross(subtract(b.points[0], a.points[0]), u) !== 0;
}
function perpendicular(a, b) {
  const u = vector(a), v = vector(b), diff = subtract(b.points[0], a.points[0]);
  if (!length2(u) || !length2(v) || dot(u, v) !== 0) return false;
  const det = cross(u, v), t = cross(diff, v) / det, w = cross(diff, u) / det;
  const within = (value, tool) => tool === 'line' || value >= 0 && (tool === 'ray' || value <= 1);
  return within(t, a.tool) && within(w, b.tool);
}
function insideRectangle(point, polygon) {
  const turns = polygon.map((p, i) => cross(subtract(polygon[(i + 1) % 4], p), subtract(point, p)));
  return turns.every(x => x > 0) || turns.every(x => x < 0);
}
export function checkGeometry(key, model = {}) {
  if (model.pending?.length) return false;
  const shapes = model.shapes || [], lines = paths(shapes);
  if (['segment', 'ray', 'line'].includes(key)) return shapes.length === 1 && lines.length === 1 && lines[0].tool === key;
  if (key === 'parallel' || key === 'perpendicular') return shapes.length === 2 && lines.length === 2 && lines.every(s=>s.tool==='line')
    && (key === 'parallel' ? parallel(...lines) : perpendicular(...lines));
  const rectangles = shapes.filter(s => s.tool === 'polygon' && rectangle(s.points, key === 'non-square-rectangle'));
  if (key === 'rectangle' || key === 'non-square-rectangle') return shapes.length === 1 && rectangles.length === 1;
  if (key === 'garden') return shapes.length === 3 && rectangles.length === 1 && rectangles.some(r => {
    const trails = lines.filter(s => s.tool === 'segment' && s.points.every(p => insideRectangle(p, r.points)));
    return trails.length === 2 && parallel(...trails);
  });
  return false;
}

export const PLACE_LABELS = ['thousands', 'hundreds', 'tens', 'ones', 'tenths', 'hundredths', 'thousandths'];
const weights = [1000000, 100000, 10000, 1000, 100, 10, 1];
export function placeValue(digits = []) {
  if (digits.length !== 7 || !digits.some(x => x !== '') || digits.some(x => !/^\d?$/.test(String(x)))) return null;
  return digits.reduce((sum, digit, i) => sum + Number(digit || 0) * weights[i], 0) / 1000;
}
export function placeDigits(value) {
  const [whole, decimal = ''] = String(value).split('.');
  return (whole.padStart(4, '0') + decimal.padEnd(3, '0')).split('');
}
function numeric(value) {
  const raw = String(value ?? '').trim();
  if (raw.includes(',') && !/^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d*)?$/.test(raw)) return NaN;
  const text = raw.replaceAll(',', '');
  if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return Number(text);
  const fraction = text.match(/^([+-]?\d+)\s*\/\s*(\d+)$/);
  return fraction && Number(fraction[2]) !== 0 ? Number(fraction[1]) / Number(fraction[2]) : NaN;
}
export function checkPracticeTask(task, response = {}) {
  if (task.type === 'explain') return { kind: 'reflect', message: 'Compare your explanation with the model. Keep your own wording and improve any missing connection.' };
  const entered = task.type === 'geometry' ? !!response.model?.shapes?.length : task.type === 'place' ? placeValue(response.digits) !== null : String(response.answer ?? '').trim() !== '';
  if (!entered) return { kind: 'empty', message: 'Make your first attempt, then check it. The help is here if you need a starting point.' };
  const correct = task.type === 'geometry' ? checkGeometry(task.geometry.check, response.model)
    : task.type === 'place' ? placeValue(response.digits) === Number(task.place.value)
    : task.type === 'choice' ? String(response.answer) === String(task.answer)
    : Number.isFinite(numeric(response.answer)) && Math.abs(numeric(response.answer) - Number(task.answer)) < 1e-9;
  return { kind: correct ? 'correct' : 'retry', message: correct ? 'Your model or answer matches the idea. Use it to explain why.' : 'Take another look. Use the visual and the help, then revise your attempt.' };
}

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function geometrySVG(model = {}, uid = 'practice') {
  const px = p => p.map(n => 20 + n * 40), arrow = `arrow-${uid}`;
  const body = (model.shapes || []).map(s => {
    if (s.tool === 'polygon') return `<polygon points="${s.points.map(px).map(p => p.join(',')).join(' ')}" fill="#087f7920" stroke="#087f79" stroke-width="4"/>`;
    if (s.points.length < 2) return '';
    let [a, b] = s.points.map(px), u = subtract(b, a);
    const extend = (point, direction) => {
      const factors = direction.map((v, i) => v > 0 ? (352 - point[i]) / v : v < 0 ? (8 - point[i]) / v : Infinity);
      const t = Math.min(...factors.filter(x => x >= 0));
      return point.map((v, i) => v + t * direction[i]);
    };
    if (s.tool === 'line') { const start = a; b = extend(start, u); a = extend(start, u.map(v => -v)); }
    if (s.tool === 'ray') b = extend(a, u);
    return `<path d="M${a.join(' ')}L${b.join(' ')}" stroke="#674c8d" stroke-width="4" fill="none" ${s.tool === 'line' ? `marker-start="url(#${arrow})"` : ''} ${s.tool !== 'segment' ? `marker-end="url(#${arrow})"` : ''}/>${s.tool !== 'line' ? `<circle cx="${a[0]}" cy="${a[1]}" r="5" fill="#087f79"/>` : ''}${s.tool === 'segment' ? `<circle cx="${b[0]}" cy="${b[1]}" r="5" fill="#087f79"/>` : ''}`;
  }).join('');
  const pending = (model.pending || []).map(px).map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="#c68629"/>`).join('');
  return `<svg viewBox="0 0 360 360" role="img" aria-label="Your constructed figure: ${(model.shapes || []).length} saved shapes. Gold dots show an unfinished figure."><defs><marker id="${esc(arrow)}" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto-start-reverse"><path d="M1 1L5 3.5L1 6" fill="none" stroke="#674c8d" stroke-width="1.2"/></marker></defs>${body}${pending}</svg>`;
}
export function geometryExample(check, uid) {
  const line = (tool, a, b) => ({tool, points:[a,b]});
  const shape = {tool:'polygon',points:[[1,1],[7,1],[7,6],[1,6]]};
  const examples = {
    segment:[line('segment',[2,6],[6,2])], ray:[line('ray',[2,6],[5,3])], line:[line('line',[2,6],[5,3])],
    parallel:[line('line',[2,1],[2,7]),line('line',[6,1],[6,7])],
    perpendicular:[line('line',[1,4],[7,4]),line('line',[4,1],[4,7])],
    rectangle:[shape], 'non-square-rectangle':[shape],
    garden:[shape,line('segment',[2,3],[6,3]),line('segment',[2,5],[6,5])],
  };
  return geometrySVG({shapes:examples[check] || []}, uid);
}
