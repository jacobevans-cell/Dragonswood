// Authored geometry resources. Exploration is independent of assessed answers.
const svg = (label, body, height = 180) =>
  `<svg class="geo-drawing" role="img" aria-label="${label}" viewBox="0 0 360 ${height}" xmlns="http://www.w3.org/2000/svg"><title>${label}</title>${body}</svg>`;
const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="6" fill="#087f79"/>`;
function stroke(a, b, arrows = 0, color = "#685493", dashed = false) {
  const [x, y] = a,
    [u, v] = b,
    angle = Math.atan2(v - y, u - x);
  const head = (px, py, theta) =>
    `<path d="M${px - 12 * Math.cos(theta - 0.48)} ${py - 12 * Math.sin(theta - 0.48)} L${px} ${py} L${px - 12 * Math.cos(theta + 0.48)} ${py - 12 * Math.sin(theta + 0.48)}" fill="none" stroke="${color}" stroke-width="4"/>`;
  return `<path d="M${x} ${y} L${u} ${v}" stroke="${color}" stroke-width="4" fill="none" ${dashed ? 'stroke-dasharray="7 6"' : ""}/>${arrows ? head(u, v, angle) : ""}${arrows === 2 ? head(x, y, angle + Math.PI) : ""}`;
}
export const BUILDING_BLOCKS = {
  point: {
    name: "Point",
    text: "A point marks an exact location. The dot shows its position; a mathematical point has no size.",
    clue: "Look for one labeled dot.",
  },
  line: {
    name: "Line",
    text: "A line is straight and continues forever in both directions. Arrowheads show that it keeps going beyond the picture.",
    clue: "Two arrowheads. No endpoints.",
  },
  ray: {
    name: "Ray",
    text: "A ray has one endpoint and continues forever in one direction. Name its endpoint first.",
    clue: "One endpoint and one arrowhead.",
  },
  segment: {
    name: "Line segment",
    text: "A line segment is the straight part between two endpoints. Its length is limited.",
    clue: "Two endpoints. No arrowheads.",
  },
};
export function buildingBlockDiagram(kind) {
  if (!BUILDING_BLOCKS[kind])
    throw new Error("Unknown geometry building block");
  if (kind === "point")
    return svg(
      "A single dot labeled P marks a location.",
      `${dot(180, 90)}<text x="194" y="82">P</text>`,
    );
  const arrows = kind === "line" ? 2 : kind === "ray" ? 1 : 0;
  return svg(
    kind === "line"
      ? "A straight drawing with an arrowhead at each end; it continues both ways."
      : kind === "ray"
        ? "Endpoint P on the left, point Q farther right, and an arrow continuing right."
        : "A straight connection with endpoints P and Q and no arrows.",
    stroke([55, 90], [305, 90], arrows) +
      (kind === "line" ? "" : dot(55, 90)) +
      dot(kind === "segment" ? 305 : 210, 90) +
      `<text x="${kind === "line" ? 100 : 49}" y="124">${kind === "line" ? "" : "P"}</text><text x="${kind === "segment" ? 297 : 204}" y="124">Q</text>`,
  );
}
const blockStage = (kind) =>
  `<h3>${BUILDING_BLOCKS[kind].name}</h3>${buildingBlockDiagram(kind)}<p>${BUILDING_BLOCKS[kind].text}</p><p class="geo-clue" role="status">${BUILDING_BLOCKS[kind].clue}</p>`;
export const RELATIONSHIPS = {
  parallel: {
    name: "Parallel",
    text: "Parallel lines lie in the same flat plane and never meet, even when extended. They stay the same distance apart.",
  },
  perpendicular: {
    name: "Perpendicular",
    text: "Perpendicular lines intersect to form right angles. A right angle measures 90°, like a square corner.",
  },
  intersecting: {
    name: "Intersecting, not perpendicular",
    text: "Intersecting lines meet. These lines meet without making square corners, so this pair is not perpendicular.",
  },
};
export function relationshipDiagram(kind, turned = false) {
  if (!RELATIONSHIPS[kind]) throw new Error("Unknown line relationship");
  const body =
    kind === "parallel"
      ? stroke([70, 58], [290, 58], 2) +
        stroke([70, 122], [290, 122], 2) +
        `<path d="M170 62 V118 M162 62 H178 M162 118 H178" stroke="#b47828" stroke-width="2"/><text x="197" y="98">equal gap</text>`
      : stroke([70, 90], [290, 90], 2) +
        stroke(
          kind === "perpendicular" ? [180, 18] : [75, 150],
          kind === "perpendicular" ? [180, 162] : [285, 30],
          2,
        ) +
        (kind === "perpendicular"
          ? '<path d="M180 72 H198 V90" stroke="#087f79" stroke-width="3" fill="none"/>'
          : "");
  return svg(
    `${RELATIONSHIPS[kind].name} line pair${turned ? ", turned together; the relationship stays the same" : ""}. ${RELATIONSHIPS[kind].text}`,
    `<g transform="rotate(${turned ? 25 : 0} 180 90)">${body}</g>`,
  );
}
export const GEO_SHAPES = {
  rectangle: {
    name: "Rectangle",
    label: "R",
    points: [
      [65, 45],
      [295, 45],
      [295, 175],
      [65, 175],
    ],
    families: ["Quadrilateral", "Parallelogram", "Rectangle"],
    equalSides: false,
  },
  square: {
    name: "Square",
    label: "S",
    points: [
      [115, 45],
      [245, 45],
      [245, 175],
      [115, 175],
    ],
    families: ["Quadrilateral", "Parallelogram", "Rectangle", "Square"],
    equalSides: true,
  },
  parallelogram: {
    name: "Slanted parallelogram",
    label: "T",
    points: [
      [115, 45],
      [300, 45],
      [245, 175],
      [60, 175],
    ],
    families: ["Quadrilateral", "Parallelogram"],
    equalSides: false,
  },
  triangle: {
    name: "Right triangle",
    label: "U",
    points: [
      [80, 45],
      [280, 175],
      [80, 175],
    ],
    families: ["Triangle", "Right triangle"],
    equalSides: false,
  },
};
export function shapeProperties(points) {
  const vectors = points.map((p, i) =>
    points[(i + 1) % points.length].map((n, k) => n - p[k]),
  );
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1],
    cross = (a, b) => a[0] * b[1] - a[1] * b[0];
  const right = points.map(
    (_, i) =>
      Math.abs(
        dot(vectors[(i + points.length - 1) % points.length], vectors[i]),
      ) < 1e-8,
  );
  const parallel = [];
  for (let i = 0; i < vectors.length; i++)
    for (let j = i + 1; j < vectors.length; j++)
      if (Math.abs(cross(vectors[i], vectors[j])) < 1e-8) parallel.push([i, j]);
  const lengths = vectors.map((v) => dot(v, v));
  return {
    sides: points.length,
    rightAngles: right.filter(Boolean).length,
    right,
    parallelPairs: parallel.length,
    parallel,
    equalSides: lengths.every((n) => Math.abs(n - lengths[0]) < 1e-8),
  };
}
export function shapeDiagram(kind, feature = "outline", turned = false) {
  const s = GEO_SHAPES[kind];
  if (!s) throw new Error("Unknown geometry shape");
  const p = shapeProperties(s.points);
  let body = `<polygon points="${s.points.map((p) => p.join(",")).join(" ")}" fill="#e7deef" stroke="#685493" stroke-width="4"/>`;
  if (feature === "parallel")
    p.parallel.forEach(([a, b], pair) =>
      [a, b].forEach((i) => {
        body += stroke(
          s.points[i],
          s.points[(i + 1) % p.sides],
          0,
          pair === 0 ? "#087f79" : "#b47828",
          pair === 1,
        );
      }),
    );
  if (feature === "angles")
    s.points.forEach((v, i) => {
      if (!p.right[i]) return;
      const unit = (q) => {
        const d = Math.hypot(q[0] - v[0], q[1] - v[1]);
        return q.map((n, k) => ((n - v[k]) / d) * 14);
      };
      const a = unit(s.points[(i + p.sides - 1) % p.sides]),
        b = unit(s.points[(i + 1) % p.sides]);
      body += `<path d="M${v[0] + a[0]} ${v[1] + a[1]} l${b[0]} ${b[1]} l${-a[0]} ${-a[1]}" stroke="#087f79" fill="none" stroke-width="3"/>`;
    });
  return svg(
    `${s.name}: ${p.sides} straight sides, ${p.rightAngles} right angle${p.rightAngles === 1 ? "" : "s"}, ${p.parallelPairs} pairs of parallel sides.${turned ? " The shape is rotated; its properties are unchanged." : ""}`,
    `<g transform="rotate(${turned ? 25 : 0} 180 110)">${body}</g>`,
    220,
  );
}
function shapeStage(kind, feature, turned) {
  const s = GEO_SHAPES[kind],
    p = shapeProperties(s.points);
  return `${shapeDiagram(kind, feature, turned)}<div class="geo-facts"><span><b>${p.sides}</b> straight sides</span><span><b>${p.rightAngles}</b> right angle${p.rightAngles === 1 ? "" : "s"}</span><span><b>${p.parallelPairs}</b> parallel pairs</span></div><p role="status">${turned ? "Turning a shape changes its direction, not its properties. " : ""}${feature === "parallel" ? (p.parallelPairs ? "Matching solid teal sides make one parallel pair. A second pair, when present, is dashed gold." : "This triangle has no parallel sides.") : feature === "angles" ? "Each little square marks one right angle. Count each corner once." : "Trace the closed outline. Every straight piece is a line segment."}</p><p class="geo-clue"><strong>Shape families:</strong> ${s.families.join(" → ")}.</p>`;
}
export function geometryLesson(checks) {
  return `<div class="geo-route"><span>01 · Building blocks</span><span>02 · Line relationships</span><span>03 · Shape families</span></div>
 <p class="geo-intro">Today we will rebuild geometry from the ground up. Explore each model, then answer the questions beside it. The pictures, definitions, and examples you need are all here.</p>
 <section class="panel geo-section"><div class="eyebrow">01 · POINTS, LINES, RAYS & SEGMENTS</div><h2>Look at the ends.</h2><div class="split"><div><p>Geometry describes positions, lines, and shapes. In a diagram, a <strong>dot</strong> marks a location and an <strong>arrowhead</strong> means “continues.” Choose a building block to see what changes.</p><div class="geo-lab"><div class="geo-buttons" aria-label="Explore building blocks">${Object.entries(
   BUILDING_BLOCKS,
 )
   .map(
     ([id, s]) =>
       `<button class="btn small" data-geo-block="${id}" aria-pressed="${id === "point"}">${s.name}</button>`,
   )
   .join(
     "",
   )}</div><div id="geo-block-stage">${blockStage("point")}</div></div><p><strong>Try it:</strong> compare a ray and a segment. Which one has two endpoints? You can revisit every example.</p></div><div class="geo-check"><h3>Your diagram gallery · A–D</h3><div class="geo-gallery">${["point", "line", "ray", "segment"].map((k, i) => `<figure>${buildingBlockDiagram(k)}<figcaption>Diagram ${String.fromCharCode(65 + i)}</figcaption></figure>`).join("")}</div><p class="small">For Questions 1–2, choose a letter from this gallery.</p>${checks.blocks}</div></div></section>
 <section class="panel geo-section"><div class="eyebrow">02 · PARALLEL, INTERSECTING & PERPENDICULAR</div><h2>Will the lines meet?</h2><div class="split"><div><p>Compare lines in the same flat plane. <strong>Intersect</strong> means meet or cross. <strong>Parallel</strong> lines never meet. <strong>Perpendicular</strong> lines meet at right angles.</p><div class="geo-lab"><label for="geo-relationship">Choose a line relationship</label><select id="geo-relationship">${Object.entries(
   RELATIONSHIPS,
 )
   .map(([k, v]) => `<option value="${k}">${v.name}</option>`)
   .join(
     "",
   )}</select><div id="geo-lines-stage">${relationshipDiagram("parallel")}<p role="status">${RELATIONSHIPS.parallel.text}</p></div><button class="btn small" id="geo-turn-lines" aria-pressed="false">Turn both lines</button></div><p><strong>A right angle is a square corner, or 90°.</strong> A little square marks it. Every perpendicular pair intersects; some intersecting pairs are not perpendicular. Turning both lines together keeps their relationship.</p></div><div class="geo-check"><h3>Your line gallery · X–Z</h3><div class="geo-gallery">${["parallel", "perpendicular", "intersecting"].map((k, i) => `<figure>${relationshipDiagram(k)}<figcaption>Pair ${"XYZ"[i]}</figcaption></figure>`).join("")}</div>${checks.lines}</div></div></section>
 <section class="panel geo-section"><div class="eyebrow">03 · CLASSIFY BY PROPERTIES</div><h2>A shape can belong to more than one family.</h2><p>A <strong>polygon</strong> is a flat, closed shape made of straight line segments. A <strong>property</strong> is a feature we can check, such as its number of sides or right angles. Classify means group by shared properties.</p><div class="geo-definitions"><div><strong>Triangle</strong><span>3 straight sides. A right triangle has one right angle.</span></div><div><strong>Quadrilateral</strong><span>4 straight sides.</span></div><div><strong>Parallelogram</strong><span>A quadrilateral with 2 pairs of parallel sides.</span></div><div><strong>Rectangle</strong><span>A quadrilateral with 4 right angles.</span></div><div><strong>Square</strong><span>4 equal sides and 4 right angles. Every square is also a rectangle.</span></div></div><div class="split"><div><div class="geo-lab"><label for="geo-shape">Choose a shape to investigate</label><select id="geo-shape">${Object.entries(
   GEO_SHAPES,
 )
   .map(([k, v]) => `<option value="${k}">${v.name}</option>`)
   .join(
     "",
   )}</select><label for="geo-feature">Make a property visible</label><select id="geo-feature"><option value="outline">Trace the sides</option><option value="parallel">Highlight parallel pairs</option><option value="angles">Mark right angles</option></select><div id="geo-shape-stage">${shapeStage("rectangle", "outline", false)}</div><button class="btn small" id="geo-turn-shape" aria-pressed="false">Turn the shape</button></div><p><strong>Reason from the definition:</strong> a square has four right angles, so it meets the rectangle rule. The extra rule—four equal sides—also makes it a square. Turning it does not create a new shape family.</p></div><div class="geo-check"><h3>Your shape gallery · R–U</h3><div class="geo-gallery">${Object.entries(
   GEO_SHAPES,
 )
   .map(
     ([k, s]) =>
       `<figure>${shapeDiagram(k, "angles")}<figcaption>${s.label} · ${s.name}</figcaption></figure>`,
   )
   .join(
     "",
   )}</div><p class="small">Little squares mark right angles. The labels and drawings belong together.</p>${checks.shapes}</div></div></section>`;
}
export function bindGeometryLab(root) {
  if (!root.querySelector("#geo-block-stage")) return;
  root.querySelectorAll("[data-geo-block]").forEach((button) =>
    button.addEventListener("click", () => {
      const kind = button.dataset.geoBlock;
      root
        .querySelectorAll("[data-geo-block]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      root.querySelector("#geo-block-stage").innerHTML = blockStage(kind);
    }),
  );
  let turnedLines = false,
    turnedShape = false;
  const showLines = () => {
    const kind = root.querySelector("#geo-relationship").value;
    root.querySelector("#geo-lines-stage").innerHTML =
      relationshipDiagram(kind, turnedLines) +
      `<p role="status">${RELATIONSHIPS[kind].text}${turnedLines ? " Both lines turned together. Their relationship is unchanged." : ""}</p>`;
    root
      .querySelector("#geo-turn-lines")
      .setAttribute("aria-pressed", String(turnedLines));
  };
  root.querySelector("#geo-relationship").addEventListener("change", showLines);
  root.querySelector("#geo-turn-lines").addEventListener("click", () => {
    turnedLines = !turnedLines;
    showLines();
  });
  const showShape = () => {
    root.querySelector("#geo-shape-stage").innerHTML = shapeStage(
      root.querySelector("#geo-shape").value,
      root.querySelector("#geo-feature").value,
      turnedShape,
    );
    root
      .querySelector("#geo-turn-shape")
      .setAttribute("aria-pressed", String(turnedShape));
  };
  for (const id of ["#geo-shape", "#geo-feature"])
    root.querySelector(id).addEventListener("change", showShape);
  root.querySelector("#geo-turn-shape").addEventListener("click", () => {
    turnedShape = !turnedShape;
    showShape();
  });
}
export function geometryCoach(id) {
  const step = (heading, visual, explanation, tryIt) => ({
    heading,
    visual,
    explanation,
    tryIt,
  });
  const lesson = (title, ...steps) => ({ title, steps });
  if (id === "m1" || id === "m2")
    return lesson(
      "Read the ends, not the length",
      step(
        "Compare a segment with a ray",
        buildingBlockDiagram("segment"),
        BUILDING_BLOCKS.segment.text,
        "Find two endpoints in this example. An endpoint is where the drawing stops.",
      ),
      step(
        "An arrow changes the meaning",
        buildingBlockDiagram("ray"),
        BUILDING_BLOCKS.ray.text +
          " The dot at Q is on the ray; the arrow continues past it.",
        "Return to gallery A–D. Count endpoints and arrowheads before choosing a letter.",
      ),
    );
  if (id === "m3")
    return lesson(
      "Imagine extending the lines",
      step(
        "Parallel lines keep their gap",
        relationshipDiagram("parallel", true),
        "These lines remain parallel when turned together. Their direction on the screen is not the rule.",
        "Look for a pair with a constant gap.",
      ),
      step(
        "Crossing lines are different",
        relationshipDiagram("intersecting"),
        "These lines meet. A short visible gap somewhere does not make two lines parallel.",
        "Compare all three pairs in X–Z. Which could keep going without meeting?",
      ),
    );
  if (id === "m4")
    return lesson(
      "Find the square corner",
      step(
        "A square mark means 90°",
        relationshipDiagram("perpendicular"),
        "Perpendicular lines meet at right angles. The little square marks one of these angles.",
        "Find the same square-corner mark in the question’s pair.",
      ),
      step(
        "Turning keeps the right angle",
        relationshipDiagram("perpendicular", true),
        "These perpendicular lines have turned together. Their intersection still makes square corners.",
        "Choose the term that describes the angle where the lines meet.",
      ),
    );
  if (id === "m5")
    return lesson(
      "Visit each corner once",
      step(
        "Count the marks around a shape",
        shapeDiagram("rectangle", "angles", true),
        "Each little square marks one right angle. Start at one corner and move around the outline without counting twice.",
        "Count the right-angle marks on each shape in R–U.",
      ),
      step(
        "Compare a different number of corners",
        shapeDiagram("triangle", "angles"),
        "A right triangle has three corners, but only one is a right angle. Count right angles, not every corner.",
        "Which two gallery shapes each have four right angles?",
      ),
    );
  if (id === "m6")
    return lesson(
      "Check every part of a definition",
      step(
        "A square meets the rectangle rule",
        shapeDiagram("square", "angles", true),
        "A square has four straight sides and four right angles. Its equal side lengths are an extra property.",
        "Use the stated rectangle definition to test square S.",
      ),
      step(
        "One shape, several families",
        `<div class="geo-family-coach"><span>4 straight sides → quadrilateral</span><span>4 right angles → also a rectangle</span><span>4 equal sides → also a square</span></div>`,
        "A more specific name does not erase a broader name. A square stays a rectangle even after it turns.",
        "Choose a reason about sides and angles, rather than the shape’s direction.",
      ),
    );
  if (id === "m7")
    return lesson(
      "Count pairs, not single sides",
      step(
        "Match opposite sides",
        shapeDiagram("rectangle", "parallel"),
        "The solid teal sides form one parallel pair. The dashed gold sides form a different pair.",
        "A pair contains two sides. Match each side with its parallel partner.",
      ),
      step(
        "Slanted sides can be parallel",
        relationshipDiagram("parallel", true),
        "Parallel sides do not have to run horizontally or vertically. Extend the sides in your imagination.",
        "Inspect both sets of opposite sides of T. Write how many pairs you found.",
      ),
    );
  return null;
}
