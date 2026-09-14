import { strategyDiagram } from "./diagrams.js?v=dragon-path-6";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

export function scienceStrategyChooser(strategies) {
  return `<section class="panel" id="science-strategy"><div class="eyebrow">YOUR INDIVIDUAL PROJECT · CHOOSE A STRATEGY</div><h2>Five approaches. One choice for your egg.</h2><p>You will design, build and explain your own egg-protection device. Read the five methods and their supply rules, then choose one strategy to use throughout your project.</p><div class="notice"><strong>27 students · 5 categories.</strong> Each category has five guaranteed spots. Two categories can receive one extra spot each, awarded to the first students who confirm those sixth spots. Several students may study the same method; each student creates their own project.</div><p class="small muted">Exploring a method does not reserve it. Your spot is saved only after you confirm, and your strategy stays locked for this project. You can improve your design within that strategy.</p><div class="row"><p data-strategy-total></p><button class="btn small" data-strategy-action="refresh">Refresh availability</button></div><p class="small muted" data-strategy-update role="status"></p><div class="strategy-grid">${strategies.map((s) => `<article class="strategy" data-strategy-card="${esc(s.id)}"><div class="row"><h3>${esc(s.name)}</h3><span class="tag" data-strategy-badge="${esc(s.id)}">Checking spots…</span></div>${strategyDiagram(s.id)}<p>${esc(s.mechanism)}</p><p><strong>Think ahead:</strong> ${esc(s.question)}</p><details><summary>${esc(s.name)} supplies & restrictions</summary><h4>You may use</h4><ul>${s.allowed.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>${s.directions.map((x) => `<p>${esc(x)}</p>`).join("")}<h4>You may not</h4><ul>${s.forbidden.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></details><p class="small" data-strategy-spots="${esc(s.id)}"></p><button class="btn" data-strategy-action="choose" data-strategy-id="${esc(s.id)}" disabled>Review ${esc(s.name)}</button></article>`).join("")}</div><div data-strategy-confirm></div></section>`;
}

export function bindScienceStrategy({
  grade,
  initial,
  api,
  onChange,
  root = document.querySelector("#science-strategy"),
}) {
  if (!root) return () => {};
  let current = initial,
    selected = null,
    busy = false,
    uncertain = false,
    disposed = false,
    polling = false,
    epoch = 0;
  const confirmation = root.querySelector("[data-strategy-confirm]");
  const message = root.querySelector("[data-strategy-update]");
  function update(next) {
    current = next;
    onChange(next);
    root.querySelector("[data-strategy-total]").textContent =
      `${next.reserved} of ${next.total} spots reserved · ${next.extrasRemaining} shared extra ${next.extrasRemaining === 1 ? "spot" : "spots"} remaining`;
    for (const c of next.categories) {
      const chosen = next.choice?.strategyId === c.id;
      root.querySelector(`[data-strategy-badge="${c.id}"]`).textContent = chosen
        ? "✓ Your locked strategy"
        : c.available
          ? `${c.count} reserved`
          : "Full";
      root.querySelector(`[data-strategy-spots="${c.id}"]`).textContent =
        c.guaranteedRemaining
          ? `${c.guaranteedRemaining} guaranteed ${c.guaranteedRemaining === 1 ? "spot" : "spots"} left${c.extraAvailable ? "; a sixth spot may also be available from the shared extras." : "."}`
          : c.extraAvailable
            ? "One sixth spot is available from the shared extras."
            : `${c.count} spots reserved. This category is full.`;
      const button = root.querySelector(`[data-strategy-id="${c.id}"]`);
      button.disabled = busy || uncertain || !!next.choice || !c.available;
      button.textContent = chosen
        ? "Strategy locked"
        : next.choice
          ? `${c.name} · explore above`
          : !c.available
            ? `${c.name} · full`
            : `Review ${c.name}`;
      root
        .querySelector(`[data-strategy-card="${c.id}"]`)
        .classList.toggle("strategy-chosen", chosen);
    }
    const confirm = confirmation.querySelector(
      '[data-strategy-action="confirm"]',
    );
    if (confirm)
      confirm.disabled =
        busy ||
        !confirmation.querySelector("input")?.checked ||
        (!uncertain &&
          !next.categories.find((c) => c.id === selected)?.available);
    const back = confirmation.querySelector('[data-strategy-action="back"]');
    if (back) back.disabled = busy || uncertain;
    if (next.choice) {
      const newlyLocked =
        confirmation.dataset.locked !== next.choice.strategyId;
      selected = null;
      uncertain = false;
      if (newlyLocked) {
        confirmation.dataset.locked = next.choice.strategyId;
        confirmation.innerHTML = `<div class="notice success strategy-confirm"><h3 tabindex="-1">Your strategy is locked: ${esc(next.choice.strategy.name)}</h3><p>Your spot is saved for this entire egg-drop project. Keep your design, notes and test results in your own notebook below. Return to your category's supply rules whenever you need them.</p><p class="small">Your science answers save separately. Locking a strategy does not submit today's lesson.</p></div>`;
      }
    }
  }
  async function refresh(manual = false) {
    if (disposed || busy || polling) return;
    polling = true;
    const stamp = epoch;
    try {
      const next = await api(`/api/science/strategy?grade=${grade}`);
      if (disposed || busy || stamp !== epoch) return;
      update(next);
      message.textContent =
        uncertain && !next.choice
          ? "Confirmation is still unverified. Retry the same choice to check and save it safely."
          : manual
            ? "Availability updated. A spot is reserved only when your confirmation succeeds."
            : "";
    } catch {
      if (!disposed && stamp === epoch)
        message.textContent =
          "Availability could not refresh. Counts may have changed; the final confirmation will check your spot.";
    } finally {
      polling = false;
    }
  }
  async function click(e) {
    const button = e.target.closest("[data-strategy-action]");
    if (!button || button.disabled || !root.contains(button)) return;
    const action = button.dataset.strategyAction;
    if (action === "refresh") return refresh(true);
    if (busy || current?.choice) return;
    if (action === "choose" && !uncertain) {
      selected = button.dataset.strategyId;
      const category = current.categories.find((c) => c.id === selected);
      if (!category?.available) return;
      confirmation.innerHTML = `<div class="notice strategy-confirm"><h3 tabindex="-1">Lock in ${esc(category.name)}?</h3><p>You will use <strong>${esc(category.name)}</strong> for your own device throughout this project. Other students may choose the same category, but your design and work are yours.</p><p>Read the supplies and restrictions above before confirming. We will check availability when you confirm; reviewing does not hold a spot.</p><label class="strategy-agreement"><input type="checkbox"> I have read the rules and want to keep this strategy for my project.</label><div class="btn-row"><button class="btn primary" data-strategy-action="confirm" disabled>Confirm and lock ${esc(category.name)}</button><button class="btn quiet" data-strategy-action="back">Keep exploring</button></div><p role="status" data-strategy-result></p></div>`;
      confirmation.querySelector("h3").focus();
      confirmation.scrollIntoView({ block: "nearest" });
    } else if (action === "back" && !uncertain) {
      const previous = selected;
      selected = null;
      confirmation.innerHTML = "";
      root.querySelector(`[data-strategy-id="${previous}"]`)?.focus();
    } else if (
      action === "confirm" &&
      selected &&
      confirmation.querySelector("input")?.checked
    ) {
      busy = true;
      epoch++;
      const requested = selected;
      update(current);
      const status = confirmation.querySelector("[data-strategy-result]");
      status.textContent = "Checking availability and saving your strategy…";
      confirmation.querySelector("input").disabled = true;
      try {
        const next = await api("/api/science/strategy", {
          grade,
          projectId: current.projectId,
          policyVersion: current.policyVersion,
          strategyId: requested,
          confirmed: true,
        });
        if (disposed) return;
        busy = false;
        uncertain = false;
        update(next);
        message.textContent = "Your strategy and spot are saved.";
        confirmation.querySelector("h3")?.focus();
      } catch (error) {
        if (disposed) return;
        busy = false;
        uncertain = !error.scienceStrategy;
        update(error.scienceStrategy || current);
        if (!current.choice) {
          status.textContent = uncertain
            ? "We could not verify the save. Retry this confirmation; it cannot reserve a second spot."
            : error.message;
          confirmation.querySelector("input").disabled = false;
          if (uncertain)
            confirmation.querySelector(
              '[data-strategy-action="confirm"]',
            ).textContent = "Retry this confirmation";
        } else
          message.textContent =
            "Your previously confirmed strategy has been loaded.";
      }
    }
  }
  const change = () => {
    if (current) update(current);
  };
  root.addEventListener("click", click);
  root.addEventListener("change", change);
  if (current) update(current);
  refresh();
  const timer = setInterval(() => {
    if (document.visibilityState === "visible") refresh();
  }, 5000);
  return () => {
    disposed = true;
    clearInterval(timer);
    root.removeEventListener("click", click);
    root.removeEventListener("change", change);
  };
}
