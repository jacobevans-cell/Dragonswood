// Exact place-value exploration; these controls never write student answers.
export function powerValue(value, steps) {
  if (
    !/^\d+(?:\.\d+)?$/.test(value) ||
    !Number.isInteger(steps) ||
    Math.abs(steps) > 6
  )
    throw new Error("Invalid power-of-ten step.");
  const [whole, fraction = ""] = value.split(".");
  let digits = BigInt(whole + fraction).toString();
  const places = fraction.length - steps;
  if (places <= 0) return (BigInt(digits) * 10n ** BigInt(-places)).toString();
  digits = digits.padStart(places + 1, "0");
  return `${digits.slice(0, -places)}.${digits.slice(-places)}`.replace(
    /\.?0+$/,
    "",
  );
}
const places = [
  "Thousands",
  "Hundreds",
  "Tens",
  "Ones",
  "Tenths",
  "Hundredths",
  "Thousandths",
];
const placeValues = ["1,000", "100", "10", "1", "0.1", "0.01", "0.001"];
function chartDigits(number) {
  const [whole, fraction = ""] = number.split(".");
  return [...whole.padStart(4, " "), ...fraction.padEnd(3, " ")];
}
export function powerChart(number, direction = 0) {
  const digits = chartDigits(number);
  return `<div class="power-chart-scroll" tabindex="0" role="region" aria-label="Place-value chart from thousands to thousandths."><div class="power-chart">${places.map((place, i) => `<div class="power-place ${i === 3 ? "ones-place" : ""}"><span title="${place}" aria-label="${place}: ${placeValues[i]}">${placeValues[i]}</span><strong ${digits[i] !== " " ? `class="power-digit" style="--power-from:${direction * 100}%"` : ""}>${digits[i] === " " ? '<span class="empty-place" aria-label="empty place">—</span>' : digits[i]}</strong></div>`).join("")}</div></div><p class="small power-chart-note">Each heading shows a place’s value. <strong>0.1 = tenths · 0.01 = hundredths · 0.001 = thousandths.</strong> The gold line is the decimal point, always between ones and tenths.</p>`;
}
export function powerSteps(start, mode, step) {
  if (
    !["multiply", "divide"].includes(mode) ||
    !Number.isInteger(step) ||
    step < 0 ||
    step > 2 ||
    !["2.4", "3.6", "24"].includes(start)
  )
    throw new Error("Unknown explorer setting.");
  const sign = mode === "multiply" ? 1 : -1;
  return {
    start,
    mode,
    step,
    sign,
    factor: 10 ** step,
    result: powerValue(start, sign * step),
    trail: Array.from({ length: step + 1 }, (_, i) =>
      powerValue(start, sign * i),
    ),
  };
}
function stage(start, mode, step, animate = true) {
  const m = powerSteps(start, mode, step),
    times = mode === "multiply",
    mark = times ? "×" : "÷";
  return `<h3>${step === 0 ? "Find the starting places" : `${times ? "Multiply" : "Divide"} by ${m.factor}`}</h3>${powerChart(m.result, animate && step ? m.sign : 0)}<div class="power-trail" aria-label="${m.trail.join(` ${mark} 10 becomes `)}">${m.trail.map((n, i) => `${i ? `<span class="power-arrow"><b>${mark} 10</b>→</span>` : ""}<strong>${n}</strong>`).join("")}</div><div class="lab-equation">${step ? `${start} ${mark} ${m.factor} = ${m.result}` : `${start} · our starting number`}</div><p class="lab-narration" role="status">${step === 0 ? "Read each digit’s place. A digit’s value depends on where it is. Choose Next jump to change every digit’s value by a factor of 10." : `${times ? "Each digit takes a place worth ten times as much: one place to the left in the chart." : "Each digit takes a place worth one tenth as much: one place to the right in the chart."} ${step === 2 ? `${mark} 100 means ${mark} 10, then ${mark} 10 again. It takes two jumps.` : "This is one jump."}`}</p>${step ? `<div class="lab-check"><strong>Writing the decimal:</strong> Relative to the digits, the point is ${step} ${step === 1 ? "place" : "places"} farther ${times ? "right" : "left"}. ${times && !m.result.includes(".") ? "A whole number does not need a written decimal point. Zeros hold any empty places." : !times && m.result.startsWith("0.") ? "The zero before the point shows there are no whole ones. Any zero after the point holds an empty decimal place." : "Keep every digit in its correct place."}</div>` : ""}`;
}
export function powersLab() {
  return `<div class="decimal-lab powers-lab" id="powers-lab"><div class="lab-controls"><div><label for="power-start">Starting number</label><select id="power-start"><option>2.4</option><option>3.6</option><option>24</option></select></div><div><label for="power-mode">Make the number…</label><select id="power-mode"><option value="multiply">10 times as large · ×10</option><option value="divide">One tenth as large · ÷10</option></select></div></div><div id="power-stage">${stage("2.4", "multiply", 0, false)}</div><div class="lab-buttons"><button class="btn small" id="power-back" disabled>← Back</button><span id="power-count">0 of 2 jumps</span><button class="btn primary small" id="power-next">Next jump ×10 →</button><button class="btn small quiet" id="power-reset">Start again</button><button class="btn small quiet" id="power-replay" disabled>Replay motion</button></div></div>`;
}
export function bindPowersLab(root) {
  const lab = root.querySelector("#powers-lab");
  if (!lab) return;
  let start = "2.4",
    mode = "multiply",
    step = 0;
  const show = (animate = true) => {
    lab.querySelector("#power-stage").innerHTML = stage(
      start,
      mode,
      step,
      animate,
    );
    lab.querySelector("#power-count").textContent = `${step} of 2 jumps`;
    lab.querySelector("#power-back").disabled = step === 0;
    lab.querySelector("#power-next").disabled = step === 2;
    lab.querySelector("#power-replay").disabled = step === 0;
    lab.querySelector("#power-next").textContent =
      `Next jump ${mode === "multiply" ? "×" : "÷"}10 →`;
  };
  lab.querySelector("#power-start").addEventListener("change", (e) => {
    start = e.target.value;
    step = 0;
    show(false);
  });
  lab.querySelector("#power-mode").addEventListener("change", (e) => {
    mode = e.target.value;
    step = 0;
    show(false);
  });
  lab.querySelector("#power-next").addEventListener("click", () => {
    step = Math.min(2, step + 1);
    show();
  });
  lab.querySelector("#power-back").addEventListener("click", () => {
    step = Math.max(0, step - 1);
    show(false);
  });
  lab.querySelector("#power-reset").addEventListener("click", () => {
    step = 0;
    show(false);
  });
  lab.querySelector("#power-replay").addEventListener("click", () => show());
}
