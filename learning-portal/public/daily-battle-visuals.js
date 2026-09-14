const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const ink = "#255b61",
  gold = "#a26722",
  paper = "#fffdf5",
  mint = "#a3c9b2";
const text = (x, y, value, extra = "") =>
  `<text x="${x}" y="${y}" ${extra}>${esc(value)}</text>`;
const svg = (body, label, width = 600, height = 200, klass = "") =>
  `<svg class="${klass}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}" style="display:block;width:100%;height:auto;max-height:${Math.max(200, height)}px;margin:12px auto"><g font-family="Segoe UI,sans-serif" font-size="15" fill="${ink}">${body}</g></svg>`;
// Keep dense diagram labels readable without widening the page itself.
function readableDiagram(markup, label, minWidth = 560) {
  return `<p style="font-size:12px;line-height:1.5;color:#496455;margin:8px 0">On a small screen, scroll the diagram left and right. Keyboard: focus the diagram, then use the arrow keys.</p><div role="region" tabindex="0" aria-label="${esc(label)}; scroll horizontally when needed" style="width:100%;max-width:100%;min-width:0;overflow-x:auto;overscroll-behavior-x:contain;outline-offset:3px;box-sizing:border-box"><div style="width:100%;min-width:${minWidth}px">${markup}</div></div>`;
}
const line = (x1, y1, x2, y2, extra = "") =>
  `<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="${ink}" stroke-width="3" ${extra}/>`;
const arrow = (x, y, left = false) =>
  `<path d="M${x + (left ? 8 : -8)} ${y - 5} L${x} ${y} L${x + (left ? 8 : -8)} ${y + 5}" fill="none" stroke="${ink}" stroke-width="3"/>`;

export function geometryMarkup(d = {}) {
  let art = "",
    label = d.alt || d.label || `${d.kind || d.shape || "angle"} diagram`;
  if (d.shape === "line" || d.shape === "ray") {
    const start = 80,
      end = 420,
      y = 95;
    art = line(start, y, end, y);
    const ends = d.segment
      ? [start, end]
      : d.shape === "ray"
        ? [start, 330]
        : [160, 330];
    if (!d.segment)
      art += arrow(end, y) + (d.shape === "line" ? arrow(start, y, true) : "");
    art += ends
      .map(
        (x, i) =>
          `<circle cx="${x}" cy="${y}" r="5"/>${text(x, 126, "AB"[i], 'text-anchor="middle"')}`,
      )
      .join("");
    label = d.segment
      ? "Line segment AB, with two endpoints"
      : d.shape === "ray"
        ? "Ray AB: endpoint A, continuing through B"
        : "Line AB continuing in both directions";
  } else if (["parallel", "perpendicular"].includes(d.shape)) {
    const sets =
      d.shape === "parallel"
        ? [
            [80, 60, 420, 60],
            [80, 125, 420, 125],
          ]
        : [
            [100, 100, 400, 100],
            [250, 25, 250, 170],
          ];
    art = sets.map((p) => line(...p)).join("");
    if (d.shape === "parallel")
      art += [60, 125].map((y) => arrow(80, y, true) + arrow(420, y)).join("");
    else
      art += `<path d="M250 78h22v22" fill="none" stroke="${gold}" stroke-width="3"/>${text(283, 67, "90°")}`;
  } else if (d.shape === "triangle") {
    const side = 155,
      bottom = 169,
      left = (500 - side) / 2,
      right = left + side,
      top = bottom - (side * Math.sqrt(3)) / 2;
    art = `<path d="M${left} ${bottom} L250 ${top} L${right} ${bottom} Z" fill="#dbe8dd" stroke="${ink}" stroke-width="3"/>`;
    if (d.side)
      art +=
        text(left - 9, 102, `${d.side} ${d.unit || ""}`, 'text-anchor="end"') +
        text(right + 9, 102, `${d.side} ${d.unit || ""}`) +
        text(250, 194, `${d.side} ${d.unit || ""}`, 'text-anchor="middle"');
    label = `Equilateral triangle${d.side ? `; every side ${d.side} ${d.unit || ""}` : ""}`;
  } else if (d.shape === "quadrilateral") {
    const ratio =
      Number(d.width) > 0 && Number(d.height) > 0 ? d.width / d.height : 2;
    const w = Math.min(280, 112 * ratio),
      h = w / ratio,
      x = (500 - w) / 2,
      y = 100 - h / 2;
    art = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#dbe8dd" stroke="${ink}" stroke-width="3"/>`;
    art += `<path d="M${x} ${y + 15}h15v-15 M${x + w - 15} ${y}v15h15 M${x + w} ${y + h - 15}h-15v15 M${x + 15} ${y + h}v-15h-15" fill="none" stroke="${ink}" stroke-width="1.5"/>`;
    if (d.width)
      art +=
        text(
          250,
          y - 12,
          `${d.width} ${d.unit || ""}`,
          'text-anchor="middle"',
        ) +
        text(
          250,
          y + h + 26,
          `${d.width} ${d.unit || ""}`,
          'text-anchor="middle"',
        );
    if (d.height)
      art +=
        text(x - 12, 105, `${d.height} ${d.unit || ""}`, 'text-anchor="end"') +
        text(x + w + 12, 105, `${d.height} ${d.unit || ""}`);
    if (d.symmetry === "vertical")
      art +=
        line(250, y - 5, 250, y + h + 5, `stroke-dasharray="7 5"`) +
        text(
          250,
          209,
          d.hideIdentity ? "Proposed fold line" : "Fold: matching halves",
          'text-anchor="middle" fill="#a26722"',
        );
    label = `Rectangle ${d.width || ""} by ${d.height || ""} ${d.unit || ""}${d.symmetry ? "; vertical center line divides matching halves" : ""}`;
  } else {
    const a = Math.max(0, Math.min(180, Number(d.angle) || 60)),
      rad = (a * Math.PI) / 180,
      ox = 250,
      oy = 165,
      r = 132;
    art =
      line(ox, oy, ox + r, oy) +
      line(ox, oy, ox + r * Math.cos(rad), oy - r * Math.sin(rad));
    art += `<circle cx="${ox}" cy="${oy}" r="4"/><path d="M${ox + 36} ${oy} A36 36 0 0 0 ${ox + 36 * Math.cos(rad)} ${oy - 36 * Math.sin(rad)}" fill="none" stroke="${gold}" stroke-width="2"/>`;
    art += text(
      ox + 63 * Math.cos(rad / 2),
      oy - 63 * Math.sin(rad / 2),
      `${a}°`,
      'text-anchor="middle"',
    );
    if (a === 90)
      art += `<path d="M250 146h19v19" fill="none" stroke="${gold}" stroke-width="2"/>`;
    label = `Angle with measure ${a} degrees; rays use a uniform scale`;
  }
  if (d.hideIdentity) {
    // Describe observable marks, without naming the category being assessed.
    label = d.segment ? "Straight path from marked endpoint A to marked endpoint B; no arrows"
      : d.shape === "ray" ? "Straight path beginning at dot A, passing through B, with an arrow beyond B"
      : d.shape === "line" ? "Straight path through marked points with an arrow at each end"
      : d.shape === "parallel" ? "Two straight paths that remain the same distance apart, with continuing arrows"
      : d.shape === "perpendicular" ? "Two crossing straight paths with a small square marking a 90 degree angle"
      : d.shape === "quadrilateral" ? `Closed four-sided figure; opposite sides labeled ${d.width} and ${d.height}; four square corner marks${d.symmetry ? "; dashed proposed fold through the center" : ""}`
      : `Two rays meet at a vertex; marked angle ${d.angle} degrees`;
  }
  const rotation = Number(d.rotation) || 0;
  if (rotation) {
    // Use a taller viewBox so both endpoints and arrows remain visible when
    // the authored figure is turned. Rotation preserves the actual features.
    art = `<g transform="translate(0 45) rotate(${rotation} 250 100)">${art}</g>`;
    label += `; the complete drawing is rotated ${rotation} degrees`;
    return readableDiagram(svg(art, label, 500, 310), label, 440);
  }
  return readableDiagram(svg(art, label, 500, 225), label, 440);
}

function numericRows(v) {
  const raw = [String(v.from ?? ""), String(v.to ?? "")];
  if (raw[0].includes(" + ")) return [...raw[0].split(" + "), raw[1]];
  return raw;
}
function placeValue(v) {
  const rows = numericRows(v),
    names = [
      "thousands",
      "hundreds",
      "tens",
      "ones",
      "tenths",
      "hundredths",
      "thousandths",
    ];
  if (rows.some((r) => !/^\d{1,4}(\.\d{1,3})?$/.test(r.replaceAll(",", ""))))
    return flow(v.labels, "Place-value steps");
  const parts = rows.map((row) => row.replaceAll(",", "").split(".")),
    wholePlaces = Math.max(1, ...parts.map(([whole]) => whole.length)),
    fractionPlaces = Math.max(
      1,
      ...parts.map(([, fraction = ""]) => fraction.length),
    ),
    firstColumn = 4 - wholePlaces,
    shownNames = names.slice(firstColumn, 4 + fractionPlaces),
    cell = 66,
    left = 70,
    top = 48,
    width = left + shownNames.length * cell + 16,
    height = top + rows.length * 60 + 12,
    decimalX = left + wholePlaces * cell;
  let art = shownNames
    .map((n, i) =>
      text(
        left + i * cell + cell / 2,
        23,
        n,
        'text-anchor="middle" font-size="11"',
      ),
    )
    .join("");
  rows.forEach((row, ri) => {
    const [whole, frac = ""] = row.replaceAll(",", "").split("."),
      digits = [
        ...whole.padStart(wholePlaces, " "),
        ...frac.padEnd(fractionPlaces, " "),
      ];
    const y = top + ri * 60;
    art += text(
      8,
      y + 18,
      rows.length === 3
        ? ["Addend", "Addend", "Total"][ri]
        : ri === 0
          ? "Before"
          : "After",
      'font-size="13"',
    );
    digits.forEach((digit, i) => {
      art += `<rect x="${left + i * cell}" y="${y - 14}" width="${cell}" height="46" fill="${i < wholePlaces ? paper : "#e1ecdf"}" stroke="#a5b9a9"/>`;
      if (digit.trim())
        art += text(
          left + i * cell + cell / 2,
          y + 18,
          digit,
          'text-anchor="middle" font-size="26" font-weight="700"',
        );
    });
    art += `<circle cx="${decimalX}" cy="${y + 23}" r="4" fill="${gold}"/>`;
  });
  art += line(decimalX, 28, decimalX, height - 12, 'stroke-dasharray="3 4"');
  const shifts = /[×÷]\s*([\d,]+)/.exec(v.operation || "");
  const op = shifts
    ? `${v.operation} · digits move ${v.operation.includes("×") ? "← left" : "right →"} ${Math.log10(Number(shifts[1].replaceAll(",", "")))} place${Number(shifts[1].replaceAll(",", "")) === 10 ? "" : "s"}`
    : v.operation;
  const chart = svg(
    art,
    `Place-value chart: ${rows.join("; ")}. Decimal column is fixed.`,
    width,
    height,
  );
  const region =
    width > 310
      ? readableDiagram(chart, "Place-value digit chart", width)
      : `<div role="region" aria-label="Place-value digit chart" style="width:100%;max-width:${width}px;min-width:0;margin:0 auto">${chart}</div>`;
  return `${region}<p style="text-align:center;font-size:13px;line-height:1.5">Decimal point stays between ones and tenths</p><p style="text-align:center;font-weight:700;color:${gold}">${esc(op)}</p>`;
}

function groups(v) {
  const m = v.model;
  if (!m) return flow(v.labels, "Connected number facts");
  let art = "",
    height = 200;
  if (m.kind === "array") {
    const gap = 31,
      columnGap = Math.min(31, 330 / m.columns),
      cols = m.columns,
      rows = m.rows,
      x = 230,
      y = 32;
    height = rows * gap + 60;
    for (let r = 0; r < rows; r++) {
      art += `<rect x="${x - 15}" y="${y + r * gap - 16}" width="${cols * columnGap}" height="28" rx="9" fill="#dfe9dc"/>${text(205, y + r * gap + 5, `Group ${r + 1}`, 'text-anchor="end" font-size="12"')}`;
      for (let c = 0; c < cols; c++) {
        const removed = r * cols + c >= rows * cols - (m.remove || 0),
          cx = x + c * columnGap;
        art += `<circle cx="${cx}" cy="${y + r * gap}" r="${Math.min(8,columnGap*.3)}" fill="${removed ? "#ead6ca" : ink}"/>`;
        if (removed)
          art += `<path d="M${cx - 9} ${y + r * gap - 9}l18 18m-18 0l18 -18" stroke="#a0442d" stroke-width="2"/>`;
      }
    }
    art += text(
      300,
      height - 10,
      `${rows} groups of ${cols} = ${rows * cols}${m.remove ? `; cross out ${m.remove} → ${rows * cols - m.remove} left` : ""} ${m.unit}`,
      'text-anchor="middle" font-weight="700"',
    );
  } else if (m.kind === "fractions") {
    height = 35 + m.rows.length * 58;
    m.rows.forEach((row, r) => {
      const x = 185,
        y = 18 + r * 58,
        cell = 300 / row.denominator;
      art += text(174, y + 22, row.label, 'text-anchor="end" font-size="13"');
      for (let i = 0; i < row.denominator; i++)
        art += `<rect x="${x + i * cell}" y="${y}" width="${cell}" height="34" fill="${i < row.numerator ? mint : paper}" stroke="${ink}" stroke-width="1.5"/>`;
      art += text(
        502,
        y + 23,
        `${row.numerator}/${row.denominator}`,
        'font-weight="700"',
      );
    });
  } else if (m.kind === "area") {
    const total = m.parts.reduce((a, b) => a + b, 0),
      x = 132,
      y = 43,
      full = 370;
    let done = 0;
    art += text(104, 110, m.height, 'text-anchor="end" font-weight="700"');
    m.parts.forEach((part, i) => {
      const w = (full * part) / total,
        start = x + (full * done) / total;
      art += `<rect x="${start}" y="${y}" width="${w}" height="100" fill="${i % 2 ? "#e9dabc" : "#d5e6d8"}" stroke="${ink}" stroke-width="2"/>`;
      art +=
        text(start + w / 2, 29, part, 'text-anchor="middle"') +
        text(
          start + w / 2,
          103,
          part * m.height,
          'text-anchor="middle" font-weight="700"',
        );
      done += part;
    });
    art += text(
      300,
      181,
      `${m.height} × (${m.parts.join(" + ")}) = ${m.height * total}`,
      'text-anchor="middle" font-weight="700"',
    );
  } else if (m.kind === "ratio") {
    height = 228;
    [1, m.factor].forEach((f, r) => {
      const y = 55 + r * 98;
      art += text(
        135,
        y + 6,
        f === 1 ? "One group" : `${f} equal groups`,
        'text-anchor="end"',
      );
      for (let i = 0; i < m.blue * f; i++)
        art += `<rect x="${165 + i * 17}" y="${y - 18}" width="13" height="22" fill="#3c849d"/>`;
      for (let i = 0; i < m.gold * f; i++)
        art += `<rect x="${165 + i * 17}" y="${y + 12}" width="13" height="22" fill="#b48c34"/>`;
      art +=
        text(460, y, `${m.blue * f} blue`) +
        text(460, y + 30, `${m.gold * f} gold`);
    });
  }
  return readableDiagram(
    svg(art, `${m.kind} model: ${v.labels.join("; ")}`, 600, height),
    `${m.kind} quantity model`,
    560,
  );
}

function numberLine(v) {
  const labels = v.labels || [];
  const numeric = labels.map((l) => {
    const value = String(l)
      .replaceAll("−", "-")
      .replaceAll(",", "")
      .replace("°C", "");
    if (/^\d{1,2}:\d{2}$/.test(value)) {
      const [h, m] = value.split(":").map(Number);
      return h * 60 + m;
    }
    return /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : NaN;
  });
  if (
    numeric.some((n) => !Number.isFinite(n)) ||
    numeric.length < 2 ||
    Math.max(...numeric) === Math.min(...numeric)
  )
    return flow(labels, "Number steps");
  const min = Math.min(...numeric),
    max = Math.max(...numeric),
    x = (n) => 65 + ((n - min) / (max - min)) * 470;
  let art = line(45, 73, 555, 73) + arrow(45, 73, true) + arrow(555, 73);
  numeric.forEach((n, i) => {
    const px = x(n),
      labelx = 65 + (i * 470) / (labels.length - 1),
      ly = 133 + (i % 2) * 35;
    art += line(px, 64, px, 82) + `<circle cx="${px}" cy="73" r="4"/>`;
    art += `<path d="M${px} 86L${labelx} ${ly - 18}" stroke="#7c9786" fill="none" stroke-width="1.4"/>${text(labelx, ly, labels[i], 'text-anchor="middle"')}`;
    if (i && numeric[i] > numeric[i - 1]) {
      const from = x(numeric[i - 1]),
        to = px,
        high = 22 + (i % 2) * 12;
      art += `<path d="M${from} 58 Q${(from + to) / 2} ${high - 30} ${to} 58" fill="none" stroke="${gold}" stroke-width="2"/>`;
      if (to - from > 52)
        art += text(
          (from + to) / 2,
          high,
          `+${Number((numeric[i] - numeric[i - 1]).toFixed(6))}`,
          'text-anchor="middle" font-size="12" fill="#a26722"',
        );
    }
  });
  return readableDiagram(
    svg(
      art,
      `Number line with true value spacing: ${labels.join(", ")}`,
      600,
      200,
    ),
    "Number line and its value labels",
    560,
  );
}

function flow(labels = [], label = "Idea connections", arrows = true) {
  return `<div role="group" aria-label="${esc(label)}" style="display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:10px;margin:20px 0">${labels.map((l, i) => `${i && arrows ? `<span aria-hidden="true" style="font-size:24px;color:${gold}">→</span>` : ""}<span style="padding:12px 16px;border:1px solid #89a795;border-radius:9px;background:${i % 2 ? "#e8e1cd" : "#dbe9dc"};color:${ink};font-size:15px;max-width:260px;line-height:1.5">${esc(l)}</span>`).join("")}</div>`;
}

function scienceModel(v) {
  const scene=v.model.scene;
  const egg=(x,y)=>`<ellipse cx="${x}" cy="${y}" rx="13" ry="18" fill="#f4e3ad" stroke="${ink}" stroke-width="2"/>`;
  const box=(x,y,w,h,fill='#dbe8dd')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill}" stroke="${ink}" stroke-width="2"/>`;
  const label=(x,y,s)=>text(x,y,s,'text-anchor="middle" font-size="13"');
  const down=(x,y)=>line(x,y,x,y+28)+`<path d="M${x-6} ${y+20}l6 8 6-8" fill="none" stroke="${ink}" stroke-width="2"/>`;
  let art='';
  if(scene.startsWith('31')) {
    for(const [i,x] of [160,440].entries()) {
      art+=label(x,23,i?'Parachute open':'Parachute folded');
      art+=line(x-74,186,x+74,186)+egg(x,i?117:153);
      if(i)art+=`<path d="M${x-65} 73Q${x} 1 ${x+65} 73Z" fill="#b6cecf" stroke="${ink}" stroke-width="2"/>`+line(x-65,73,x,99)+line(x+65,73,x,99);
      else art+=box(x-5,88,10,32,'#b6cecf')+line(x,120,x,135);
      art+=down(x+82,99);
    }
    art+=label(300,211,'Compare the same object and release height');
  } else if(scene.startsWith('32')||scene==='35-1') {
    for(const [i,x] of [160,440].entries()) {
      art+=label(x,23,i?'During landing':'Before contact')+line(x-84,180,x+84,180)+egg(x,i?(scene==='32-1'?143:139):85);
      if(scene==='32-1')art+=`<path d="M${x-65} 177l13 -${i?16:45} 13 ${i?16:45} 13 -${i?16:45} 13 ${i?16:45} 13 -${i?16:45} 13 ${i?16:45}" fill="none" stroke="${gold}" stroke-width="5"/>`;
      else art+=box(x-67,i?157:141,134,i?21:37,'#b6cecf');
      if(!i)art+=down(x+38,101);
    }
    art+=label(300,211,scene==='32-1'?'Folded material changes shape':'Padding compresses during the stop');
  } else if(scene.startsWith('33')||scene==='37-0') {
    const shell=scene==='33-1';
    art+=box(150,40,300,143,'none')+egg(300,119);
    if(shell)art+=line(150,40,205,183)+line(450,40,395,183)+line(150,57,450,57)+line(150,165,450,165);
    else art+=line(150,40,290,106)+line(450,40,310,106)+line(150,183,290,132)+line(450,183,310,132);
    art+=label(300,23,shell?'Connected outer cage':'Object supported inside the frame')+label(300,209,shell?'Contact spreads through connected parts':'Check the space between the object and the sides');
  } else if(scene==='35-0') {
    for(const [i,x] of [160,440].entries()) {
      art+=label(x,23,i?'Actual build: 8 straws':'Plan: 6 straws')+box(x-80,42,160,146,'#fffdf5');
      for(let n=0;n<(i?8:6);n++)art+=line(x-60+n*17,65,x-55+n*17,154);
    }
    art+=label(300,212,'Keep the plan and record what changed');
  } else if(scene==='36-1') {
    for(const [i,x] of [160,440].entries()) {
      art+=label(x,23,`Test ${i+1}`)+line(x-70,180,x+70,180)+egg(x,i?70:115)+down(x+30,i?91:135)+box(x-65,i?153:169,130,i?25:9,'#b6cecf');
    }
    art+=label(300,210,'Both release height AND padding changed');
  } else if(scene==='38-0') {
    art+=label(115,25,'Falling')+egg(115,80)+down(149,90);
    art+=label(300,25,'Landing')+egg(300,130)+box(250,148,100,20,'#b6cecf')+line(240,170,360,170);
    art+=label(485,25,'Surroundings')+`<path d="M460 67q20 20 0 40 M477 52q35 35 0 70 M447 87l-18 -15v32Z" fill="none" stroke="${gold}" stroke-width="3"/>`+label(485,153,'sound and warming');
    art+=label(300,210,'Energy changes form and transfers; it is not destroyed');
  } else if(scene==='37-1') {
    art+=label(155,24,'Small test: observed')+box(100,113,110,62,'none')+egg(155,148)+line(70,180,240,180);
    art+=label(440,24,'Higher drop: still untested')+egg(440,64)+down(480,91)+line(350,180,530,180);
    art+=label(300,210,'A result supports a claim about the conditions actually tested');
  } else {
    art+=label(155,24,scene==='38-1'?'Prediction: no damage':'Prediction: frame may bend');
    art+=box(105,57,100,113,'none')+(scene==='38-1'?egg(155,118):'');
    art+=label(440,24,'Observed after the test');
    art+=`<path d="M390 57h100v70l-20 43h-80Z" fill="none" stroke="${ink}" stroke-width="3"/>`+(scene==='38-1'?egg(440,118):'');
    art+=label(300,211,scene==='38-1'?'Record the bent corner and the actual condition of the egg':'Record the corner that actually bent');
  }
  return readableDiagram(svg(art,`Science model: ${v.labels.join('; ')}`,600,230),'Science observation model',560)+flow(v.labels,'Science connections');
}

export function coachVisualMarkup(v = {}) {
  const steps = Array.isArray(v.steps) ? v.steps : [],
    labels = Array.isArray(v.labels) ? v.labels : [];
  let art = "";
  if (v.type === "geometry") art = geometryMarkup(v);
  else if (v.type === "place-value") art = placeValue(v);
  else if (v.type === "groups") art = groups(v);
  else if (v.type === "number-line") art = numberLine(v);
  else if (v.type === "energy" && v.model?.kind === "science") art = scienceModel(v);
  else
    art = flow(
      labels,
      v.type === "energy"
        ? "Science connections"
        : v.type === "evidence"
          ? "Evidence connections"
          : "Sentence and word parts",
      v.type !== "sentence",
    );
  return `${art}<div class="battle-coach-steps ${["evidence", "sentence"].includes(v.type) ? "text-steps" : ""}">${steps.map((s, i) => `<div><span class="coach-step-number">${i + 1}</span><p>${esc(s)}</p></div>`).join("")}</div>`;
}
