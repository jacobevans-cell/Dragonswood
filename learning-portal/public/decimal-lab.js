// Exploration is deliberately separate from student responses and completion.
const colors = ["#685493", "#087f79", "#b7793b", "#9d4f75"];
export function formatTenths(tenths) {
  if (!Number.isSafeInteger(tenths) || tenths < 0)
    throw new Error("Use a nonnegative whole number of tenths.");
  return `${Math.floor(tenths / 10)}.${tenths % 10}`;
}
export function shareTenths(tenths, groups) {
  if (
    !Number.isSafeInteger(groups) ||
    groups < 1 ||
    !Number.isSafeInteger(tenths) ||
    tenths < 0 ||
    tenths % groups
  )
    throw new Error("This model needs equal groups of whole tenths.");
  const each = tenths / groups;
  return {
    tenths,
    groups,
    each,
    total: formatTenths(tenths),
    quotient: formatTenths(each),
    ones: Math.floor(each / 10),
    remainder: each % 10,
  };
}
// String/BigInt arithmetic keeps 0.03 and placeholder zeros exact.
export function scaleDecimal(value, jumps) {
  if (
    !/^\d+(?:\.\d+)?$/.test(value) ||
    !Number.isInteger(jumps) ||
    jumps < 0 ||
    jumps > 6
  )
    throw new Error("Invalid decimal jump.");
  const [whole, fraction = ""] = value.split(".");
  const digits = (BigInt(whole + fraction) * 10n ** BigInt(jumps))
    .toString()
    .padStart(fraction.length + 1, "0");
  const split = digits.length - fraction.length;
  return fraction.length
    ? `${digits.slice(0, split)}.${digits.slice(split)}`.replace(/\.?0+$/, "")
    : digits;
}
export const jumpExamples = [
  {
    dividend: "2.4",
    divisor: "0.3",
    jumps: 1,
    quotient: "8",
    label: "2.4 ÷ 0.3 · one jump",
  },
  {
    dividend: "0.24",
    divisor: "0.03",
    jumps: 2,
    quotient: "8",
    label: "0.24 ÷ 0.03 · two jumps",
  },
  {
    dividend: "2.4",
    divisor: "0.03",
    jumps: 2,
    quotient: "80",
    label: "2.4 ÷ 0.03 · use a zero",
  },
];
export function jumpState(index, step) {
  const example = jumpExamples[index];
  if (!example || !Number.isInteger(step) || step < 0 || step > example.jumps)
    throw new Error("Unknown jump step.");
  return {
    ...example,
    step,
    top: scaleDecimal(example.dividend, step),
    bottom: scaleDecimal(example.divisor, step),
    factor: 10 ** step,
  };
}
const diagram = (label, body, view = "0 0 600 260") =>
  `<svg class="diagram lab-diagram" role="img" aria-label="${label}" viewBox="${view}" xmlns="http://www.w3.org/2000/svg"><title>${label}</title>${body}</svg>`;
function position(i, total, groups, phase) {
  if (phase === 0) return [35 + (i % 10) * 24, 30 + Math.floor(i / 10) * 56];
  if (phase === 1) return [35 + (i % 12) * 39, 30 + Math.floor(i / 12) * 65];
  const row = Math.floor(i / (total / groups));
  return [35 + (i % (total / groups)) * 28, 30 + row * 56];
}
export function tenthsDiagram(
  total = 24,
  groups = 3,
  phase = 2,
  previous = phase,
) {
  const model = shareTenths(total, groups);
  const cells = Array.from({ length: total }, (_, i) => {
    const [x, y] = position(i, total, groups, phase),
      [px, py] = position(i, total, groups, previous);
    const fill =
      phase >= 2
        ? colors[Math.floor(i / model.each)]
        : colors[Math.floor(i / 10) % 4];
    return `<rect width="20" height="32" rx="3" fill="${fill}" class="moving-tenth" style="--from-x:${px}px;--from-y:${py}px;transform:translate(${x}px,${y}px);animation-delay:${i * 8}ms"/>`;
  }).join("");
  const bundles =
    phase === 0
      ? Array.from(
          { length: Math.floor(total / 10) },
          (_, i) =>
            `<rect x="29" y="${24 + i * 56}" width="246" height="44" rx="7" fill="none" stroke="${colors[i]}" stroke-width="2"/><text x="300" y="${53 + i * 56}">10 tenths = 1 whole</text>`,
        ).join("") +
        `<text x="300" y="${53 + Math.floor(total / 10) * 56}">${total % 10} more tenths</text>`
      : phase === 2
        ? Array.from(
            { length: groups },
            (_, i) =>
              `<text x="${44 + model.each * 28}" y="${53 + i * 56}">${i + 1}</text>`,
          ).join("")
        : "";
  const label =
    phase === 0
      ? `${Math.floor(total / 10)} wholes and ${total % 10} tenths. Every whole contains ten tenths.`
      : phase === 1
        ? `${model.total} is ${total} tenths. The same amount has been regrouped, not multiplied.`
        : `${total} tenths shared into ${groups} equal groups. Each row is one group with ${model.each} tenths.`;
  return diagram(
    label,
    cells + bundles,
    `0 0 600 ${Math.max(220, (phase === 2 ? groups : Math.ceil(total / (phase === 1 ? 12 : 10))) * 60 + 20)}`,
  );
}
export function placeValue(ones, tenths) {
  return `<div class="place-value" aria-label="${ones} ones and ${tenths} tenths"><div><span>Ones</span><strong>${ones}</strong></div><b class="decimal-dot" aria-label="decimal point">.</b><div><span>Tenths</span><strong>${tenths}</strong></div></div>`;
}
function shareStage(total, groups, step, previous = step) {
  const m = shareTenths(total, groups);
  const headings = [
    "Start with wholes and parts",
    "Rename the same amount",
    "Share every tenth equally",
    "Put the decimal in its place",
  ];
  const text = [
    `${m.total} meters is ${Math.floor(total / 10)} whole meters and ${total % 10} tenths of a meter. Each outlined bundle holds 10 tenths.`,
    `Open the bundles: ${Math.floor(total / 10)} wholes become ${Math.floor(total / 10) * 10} tenths. Add the other ${total % 10}: ${total} tenths altogether. The amount of ribbon has not changed.`,
    `Each colored row is one group. ${total} tenths ÷ ${groups} = ${m.each} tenths in each group. We are still measuring in tenths.`,
    `${m.each} tenths is ${m.ones} ${m.ones === 1 ? "whole" : "wholes"} and ${m.remainder} tenths, so write ${m.quotient}. ${m.ones === 0 ? "The zero shows that there is less than one whole in each group." : "Every 10 tenths makes one whole. The remaining tenths go after the decimal point."}`,
  ];
  const equation =
    step === 0
      ? `${Math.floor(total / 10)} + ${total % 10}/10 = ${m.total}`
      : step === 1
        ? `${m.total} = ${total} tenths`
        : step === 2
          ? `${total} tenths ÷ ${groups} = ${m.each} tenths`
          : `${m.total} ÷ ${groups} = ${m.quotient}`;
  return `<h3>${headings[step]}</h3><p class="small">Each small block = <strong>0.1 meter</strong> · Total ribbon = ${m.total} meters</p>${step < 3 ? tenthsDiagram(total, groups, step, Math.min(previous, 2)) : `<div class="tenths-rebuild">${Array.from({ length: m.ones }, () => `<div class="tenth-bundle" aria-label="One whole: ten tenths">${"<i></i>".repeat(10)}<span>1 whole</span></div>`).join("")}<div class="tenth-bundle loose" aria-label="${m.remainder} remaining tenths">${"<i></i>".repeat(m.remainder)}<span>${m.remainder} tenths</span></div></div>${placeValue(m.ones, m.remainder)}`}<div class="lab-equation">${equation}</div><p class="lab-narration" role="status">${text[step]}</p>${step === 3 ? `<p class="lab-check"><strong>Build it back:</strong> ${groups} × ${m.quotient} = ${m.total} meters. All the ribbon is accounted for.</p>` : ""}`;
}
function jumpTrack(value, step, label) {
  // The original digit strip stays fixed while the point visibly jumps right.
  const raw = value.replace(".", ""),
    original = value.includes(".") ? value.indexOf(".") : value.length;
  const digits = raw.padEnd(original + step, "0");
  const at = original + step;
  return `<div class="jump-track"><span class="jump-label">${label}</span><div class="digit-window"><div class="digit-strip">${[...digits].map((d, i) => `<span class="jump-digit ${i >= raw.length ? "placeholder-zero" : ""} ${i < at - 1 && /^0+$/.test(digits.slice(0, i + 1)) ? "leading-zero" : ""}">${d}</span>`).join("")}<b class="jump-point" style="left:${at * 2.15}rem;--point-start:${Math.max(original, at - 1) * 2.15}rem" aria-hidden="true">.</b>${step ? `<span class="jump-arc" style="left:${(at - 1) * 2.15}rem" aria-hidden="true">↷</span>` : ""}</div></div><span class="jump-value">${scaleDecimal(value, step)}</span></div>`;
}
function jumpStage(index, step) {
  const m = jumpState(index, step);
  return `<div class="jump-pair" role="img" aria-label="Both numbers multiplied by ${m.factor}. Dividend ${m.dividend} becomes ${m.top}. Divisor ${m.divisor} becomes ${m.bottom}. The quotient stays ${m.quotient}.">${jumpTrack(m.dividend, step, "Amount")}${jumpTrack(m.divisor, step, "Group size")}</div><div class="lab-equation">${m.top} ÷ ${m.bottom}${step === m.jumps ? ` = ${m.quotient}` : ""}</div><p class="lab-narration" role="status">${step === 0 ? `How many groups of ${m.divisor} fit into ${m.dividend}? Make the group size a whole number. Every jump must happen in both rows.` : `Jump ${step}: multiply both numbers by 10${step > 1 ? ` again (${m.factor} times their starting values)` : ""}. ${step === m.jumps ? `Now divide ${m.top} by ${m.bottom}. The number of groups is still ${m.quotient}.` : "The divisor is still a decimal. Both numbers need another jump."}`}</p>${index === 2 && step === 2 ? '<p class="lab-check"><strong>That final zero matters:</strong> 2.4 → 24 → 240. Write a zero to hold the ones place after the second jump.</p>' : ""}<p class="small">Faded zeros at the front can be left out. The value at the right shows the usual way to write the number.</p><p class="small">Writing the point farther right records multiplication by 10. In a place-value chart, each digit takes a place worth ten times as much. Scaling both amounts equally keeps the number of groups unchanged.</p>`;
}
export function decimalLab(groups = 3) {
  return `<div class="decimal-lab" id="decimal-lab"><div class="lab-controls"><div><label for="amount-select">Amount of ribbon</label><select id="amount-select"><option value="24">2.4 meters · 24 tenths</option><option value="36">3.6 meters · 36 tenths</option></select></div><div><label for="group-select">Explore equal groups</label><select id="group-select">${[2, 3, 4].map((n) => `<option value="${n}" ${n === groups ? "selected" : ""}>${n} groups</option>`).join("")}</select></div></div><div class="lab-progress" aria-label="Four steps"><span class="active">Wholes</span><span>Tenths</span><span>Groups</span><span>Decimal</span></div><div id="share-stage">${shareStage(24, groups, 0)}</div><div class="lab-buttons"><button class="btn small" id="share-back" disabled>← Back</button><span id="share-count">1 of 4</span><button class="btn primary small" id="share-next">Next step →</button><button class="btn small quiet" id="share-replay">Replay motion</button></div></div><details class="jump-explorer"><summary>Decimal jumps · what if the divisor is a decimal?</summary><p><strong>A different question:</strong> 2.4 ÷ 0.3 asks how many groups of 0.3 fit into 2.4. It does not ask us to share into 3 groups.</p><div class="decimal-lab"><label for="jump-example">Choose a decimal jump</label><select id="jump-example">${jumpExamples.map((e, i) => `<option value="${i}">${e.label}</option>`).join("")}</select><div id="jump-stage">${jumpStage(0, 0)}</div><div class="lab-buttons"><button class="btn primary small" id="jump-next">Jump both ×10 →</button><button class="btn small quiet" id="jump-reset">Reset jumps</button></div></div><p class="small muted">Extra exploration. Today’s four questions still focus on dividing by whole numbers.</p></details>`;
}
export function bindDecimalLab(root, onGroupsChange = () => {}) {
  const lab = root.querySelector("#decimal-lab");
  if (!lab) return;
  let total = 24,
    groups = Number(lab.querySelector("#group-select").value),
    step = 0,
    jumpIndex = 0,
    jumps = 0;
  const show = (previous) => {
    lab.querySelector("#share-stage").innerHTML = shareStage(
      total,
      groups,
      step,
      previous,
    );
    lab.querySelector("#share-count").textContent = `${step + 1} of 4`;
    lab.querySelector("#share-back").disabled = step === 0;
    lab.querySelector("#share-next").disabled = step === 3;
    lab
      .querySelectorAll(".lab-progress span")
      .forEach((el, i) => el.classList.toggle("active", i === step));
  };
  lab.querySelector("#share-next").addEventListener("click", () => {
    const previous = step;
    step = Math.min(3, step + 1);
    show(previous);
  });
  lab.querySelector("#share-back").addEventListener("click", () => {
    const previous = step;
    step = Math.max(0, step - 1);
    show(previous);
  });
  lab
    .querySelector("#share-replay")
    .addEventListener("click", () => show(Math.max(0, step - 1)));
  lab.querySelector("#amount-select").addEventListener("change", (e) => {
    total = Number(e.target.value);
    step = 0;
    show(0);
  });
  lab.querySelector("#group-select").addEventListener("change", (e) => {
    groups = Number(e.target.value);
    show(step);
    onGroupsChange(groups);
  });
  const showJumps = () => {
    root.querySelector("#jump-stage").innerHTML = jumpStage(jumpIndex, jumps);
    root.querySelector("#jump-next").disabled =
      jumps === jumpExamples[jumpIndex].jumps;
  };
  root.querySelector("#jump-next").addEventListener("click", () => {
    jumps = Math.min(jumpExamples[jumpIndex].jumps, jumps + 1);
    showJumps();
  });
  root.querySelector("#jump-reset").addEventListener("click", () => {
    jumps = 0;
    showJumps();
  });
  root.querySelector("#jump-example").addEventListener("change", (e) => {
    jumpIndex = Number(e.target.value);
    jumps = 0;
    showJumps();
  });
}
