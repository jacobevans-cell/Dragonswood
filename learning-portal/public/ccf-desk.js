import { mountCaseScene } from "./ccf-scene.js";
import { documentMarkup, portraitMarkup } from "./ccf-documents.js";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function caseDesk({
  caseFile: c,
  grade,
  state,
  work,
  field,
  questions,
  now,
}) {
  const active = c.witnesses.find(
    (w) =>
      state.interviews[w.id] &&
      !state.interviews[w.id].complete &&
      state.interviews[w.id].ends > now(),
  );
  const old = state.archivedCCF;
  const vocabulary = Array.isArray(c.vocabulary) ? c.vocabulary : [];
  const sentenceFrames = Array.isArray(c.conclusionSupport?.[grade])
    ? c.conclusionSupport[grade]
    : [];
  const conclusionSupport = sentenceFrames.length
    ? `<details class="ccf-conclusion-support"><summary>${grade === 4 ? "Sentence starters (optional)" : "Help organize my explanation (optional)"}</summary><p>${grade === 4 ? "Use these starters if they help. Add your own finding, evidence, and explanation." : "Use these reminders to develop your own evidence-based finding."}</p><ul>${sentenceFrames.map((frame) => `<li>${esc(frame)}</li>`).join("")}</ul></details>`
    : "";
  const preserved =
    old && (old.draft || old.submissions.length || old.versions.length)
      ? `<details class="panel"><summary>Your earlier compass case is preserved</summary><p>This is a new case. Your earlier notes, answers and submitted work remain saved here and in Export my work.</p><pre class="preserved-work">${esc(JSON.stringify({ draft: old.draft?.data, submissions: old.submissions.map((s) => ({ created: s.created, data: s.data })), versions: old.versions }, null, 2))}</pre></details>`
      : "";
  return `${preserved}<section class="panel ccf-hero"><div class="ccf-case-stamp" aria-hidden="true">CASE<br><strong>${String(c.day || 30).padStart(3, "0")}</strong><span>OPEN FILE</span></div><div><div class="eyebrow">CHARACTER CASE FILES · A FICTIONAL MYSTERY</div><h2>${esc(c.title)}</h2><p class="ccf-deck">${esc(c.overview || c.subtitle)}</p>${c.day > 30 && c.tone?.contentNote ? `<p class="small muted">${esc(c.tone.contentNote)}</p>` : ""}<div class="ccf-process" aria-label="Your investigation steps"><span>01 · Read</span><span>02 · Investigate</span><span>03 · Interview</span><span>04 · Explain</span></div></div></section>
  <section class="panel ccf-report"><div class="eyebrow">THE INCIDENT REPORT</div><h2>Start with what we know.</h2>${c.report.map((p, i) => `<p><span class="ccf-paragraph" aria-label="Paragraph ${i + 1}">${i + 1}</span>${esc(p)}</p>`).join("")}<div class="notice"><strong>Detective's rule:</strong> A secret is not proof. Compare what people say with what the records establish. Portraits, clothing and expressions are character art, not evidence.</div><details><summary>Words detectives use</summary><div class="glossary">${vocabulary.map(({ term, meaning }) => `<div><strong>${esc(term)}</strong><br>${esc(meaning)}</div>`).join("")}</div></details></section>
  <section class="panel ccf-investigate" id="ccf-investigation"><div class="row"><div><div class="eyebrow">YOUR INVESTIGATION SCENE</div><h2>Follow the records.</h2></div><span class="tag" data-ccf-discovery></span></div><p>${c.sceneMode === "records-desk" ? "Choose a numbered document station on the desk, or use the evidence buttons below. The desk artwork identifies the collected records; exact maps, letters and messages appear in their source panels." : "Choose a numbered clue in the room, or use the evidence buttons below."} Open records, compare times, and pin the evidence you want to use. All clues are supplied as text; you do not need to hunt for tiny objects.</p><div id="ccf-scene" class="ccf-scene" aria-label="Interactive investigation scene"></div><div class="ccf-evidence-buttons" aria-label="Choose an evidence record">${c.records.map((r, i) => `<button class="btn" data-ccf-inspect="${esc(r.id)}"><span>${String(i + 1).padStart(2, "0")}</span> ${esc(r.title)}</button>`).join("")}</div><article class="ccf-evidence-reader" data-ccf-reader><h3>Select a record to examine it.</h3><p>The complete record will appear here. Then decide whether to pin it to your evidence board.</p></article><div class="ccf-pinboard"><div class="row"><div><div class="eyebrow">YOUR EVIDENCE BOARD</div><h3>Build a case with sources.</h3></div><span class="tag" data-ccf-pincount role="status" aria-live="polite"></span></div><p>Pin at least two different records to support your conclusion. Pinning organizes your sources; explain their connection in your own words.</p><div data-ccf-pins></div></div></section>
  <section class="panel ccf-interviews"><div class="eyebrow">THREE PEOPLE. THREE VERSIONS.</div><h2>Who should we believe?</h2><p>Each interview opens for <strong>60 seconds</strong>. Read the statements and save useful details in your notebook. One interview at a time. The clock keeps running if you leave or refresh.</p><div class="ccf-cast">${c.witnesses
    .map((w) => {
      const record = state.interviews[w.id],
        done = record && record.ends <= now();
      return `<article class="ccf-person ${active?.id === w.id ? "active" : ""}">${portraitMarkup(w)}<div><span class="eyebrow">${esc(w.role)}</span><h3>${esc(w.name)}</h3>${w.publicBio ? `<p>${esc(w.publicBio)}</p>` : ""}${done ? '<span class="tag good">✓ Interview finished</span>' : active?.id === w.id ? '<span class="timer" id="timer" role="timer" aria-live="off"></span>' : `<button class="btn" data-action="interview" data-id="${esc(w.id)}" ${active ? "disabled" : ""}>Interview ${esc(w.name)} · 60 seconds</button>`}</div></article>`;
    })
    .join(
      "",
    )}</div><div class="split ccf-statement-notes"><article class="ccf-statement">${active ? `<div class="eyebrow">LIVE INTERVIEW</div><h3 tabindex="-1">${esc(active.name)}'s statement</h3>${(state.interviewStatements?.[active.id] || []).map(([q, a]) => `<p><strong>${esc(q)}</strong><br>${esc(a)}</p>`).join("")}` : '<div class="eyebrow">INTERVIEW ROOM</div><h3>Listen. Compare. Remember.</h3><p>Open an interview when you are ready. Record the claim, its time, and which source supports or challenges it. The evidence records stay available after interviews close.</p>'}</article><div>${field("ccf", "notebook", "Detective notebook", "Save who said what, the time they described, and any detail you need to compare with a record.", 10)}</div></div></section>
  <section class="panel" id="ccf-timeline"><div class="eyebrow">OPTIONAL DETECTIVE PRACTICE</div><h2>Reconstruct the timeline.</h2><p>Move the events into earliest-to-latest order. Use the times in the evidence records. Choose an event, then use Move earlier or Move later. This practice helps your reasoning and does not block submission.</p><ol class="ccf-timeline" data-ccf-timeline-list></ol><div class="btn-row"><button class="btn" data-ccf-action="check-timeline">Check my timeline</button><button class="btn quiet" data-ccf-action="reset-timeline">Reset practice order</button></div><p class="notice" data-ccf-timeline-feedback role="status">Your arrangement saves with your notebook. Check it when you are ready.</p></section>
  <section class="panel"><div class="eyebrow">CHECK THE STORY</div><h2>What do the records actually show?</h2>${questions("ccf")}</section>
  <section class="panel"><div class="row"><div><div class="eyebrow">YOUR DETECTIVE'S FINDING</div><h2>Make the case.</h2></div><button class="btn small" data-action="versions" data-id="ccf">Version history</button></div><p>${c.day > 30 ? esc(c.conclusionPrompt) : grade === 4 ? "Name the person best supported by the evidence. Use at least two records, explain one contradiction, and tell what the evidence still does not prove." : "Weigh the strongest explanation against a believable alternative. Use at least two independent records, explain the contradiction, and distinguish an action from an unproven motive."}</p><div class="ccf-reasoning-path"><span>My finding</span><span>Two records</span><span>How they connect</span><span>What remains unknown</span></div>${conclusionSupport}${field("ccf", "conclusion", "My evidence-based conclusion", "Refer to record titles or numbers and explain how the details support your conclusion. Being suspicious is not enough.", 10)}<div id="version-list"></div></section>`;
}

export function bindCaseDesk({
  caseFile: c,
  grade,
  getWork,
  patch,
  api,
  root = document.querySelector("#ccf-investigation"),
}) {
  if (!root) return () => {};
  let disposed = false,
    selected = null,
    scene = null,
    checking = false;
  const timelineRoot = document.querySelector("#ccf-timeline");
  const order = () =>
    getWork().timeline?.length
      ? getWork().timeline
      : c.timelineCards.map((t) => t.id);
  const redraw = () => {
    const w = getWork(),
      pins = w.pins || [],
      seen = w.inspected || [];
    root.querySelector("[data-ccf-discovery]").textContent =
      `${seen.length} of ${c.records.length} records opened`;
    root.querySelector("[data-ccf-pincount]").textContent =
      `${pins.length} pinned`;
    root
      .querySelectorAll("[data-ccf-inspect]")
      .forEach((b) =>
        b.setAttribute(
          "aria-pressed",
          String(b.dataset.ccfInspect === selected),
        ),
      );
    root.querySelector("[data-ccf-pins]").innerHTML = pins.length
      ? pins
          .map((id) => {
            const r = c.records.find((r) => r.id === id);
            return `<article class="ccf-pinned"><span class="ccf-pin" aria-hidden="true"></span><h4>${esc(r.title)}</h4>${documentMarkup(r.document)}<p>${esc(r.text)}</p><button class="btn small" data-ccf-unpin="${esc(id)}">Unpin ${esc(r.title)}</button></article>`;
          })
          .join("")
      : '<p class="empty">Your board is ready. Open a record above and choose Pin this record.</p>';
    if (selected) {
      const r = c.records.find((r) => r.id === selected);
      root.querySelector("[data-ccf-reader]").innerHTML =
        `<div class="eyebrow">RECORD ${c.records.indexOf(r) + 1} · ${esc(r.kind || r.type || "SUPPLIED EVIDENCE")}</div><h3 tabindex="-1">${esc(r.title)}</h3>${documentMarkup(r.document)}${c.day > 30 ? `<p class="small"><strong>Source:</strong> ${esc(r.source)}</p>` : ""}<p>${esc(r.text)}</p><button class="btn primary" data-ccf-pin="${esc(r.id)}" ${pins.includes(r.id) ? "disabled" : ""}>${pins.includes(r.id) ? "✓ Pinned to your board" : "Pin this record"}</button>`;
    }
    scene?.update({ inspected: seen, selectedEvidenceId: selected });
  };
  function inspect(id, focus = false) {
    if (disposed || !c.records.some((r) => r.id === id)) return;
    selected = id;
    const seen = getWork().inspected || [];
    if (!seen.includes(id)) patch({ inspected: [...seen, id] });
    redraw();
    if (focus) root.querySelector("[data-ccf-reader] h3")?.focus();
  }
  const click = (e) => {
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    if (b.dataset.ccfInspect) inspect(b.dataset.ccfInspect, true);
    if (b.dataset.ccfPin) {
      const pins = getWork().pins || [];
      if (!pins.includes(b.dataset.ccfPin))
        patch({ pins: [...pins, b.dataset.ccfPin] });
      redraw();
      root.querySelector("[data-ccf-reader] h3")?.focus();
    }
    if (b.dataset.ccfUnpin) {
      patch({
        pins: (getWork().pins || []).filter((id) => id !== b.dataset.ccfUnpin),
      });
      redraw();
      root.querySelector(`[data-ccf-inspect="${b.dataset.ccfUnpin}"]`)?.focus();
    }
  };
  function drawTimeline() {
    const list = order();
    timelineRoot.querySelector("[data-ccf-timeline-list]").innerHTML = list
      .map((id, i) => {
        const card = c.timelineCards.find((t) => t.id === id);
        return `<li><div><span class="eyebrow">POSITION ${i + 1}</span><strong>${esc(card.title)}</strong></div><div class="btn-row"><button class="btn small" aria-label="Move ${esc(card.title)} earlier" data-ccf-move="${esc(id)}" data-direction="-1" ${i === 0 ? "disabled" : ""}>↑ Earlier</button><button class="btn small" aria-label="Move ${esc(card.title)} later" data-ccf-move="${esc(id)}" data-direction="1" ${i === list.length - 1 ? "disabled" : ""}>↓ Later</button></div></li>`;
      })
      .join("");
  }
  const timelineClick = async (e) => {
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    const feedback = timelineRoot.querySelector("[data-ccf-timeline-feedback]");
    if (b.dataset.ccfMove) {
      const list = [...order()],
        i = list.indexOf(b.dataset.ccfMove),
        j = i + Number(b.dataset.direction);
      if (j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
      patch({ timeline: list });
      drawTimeline();
      feedback.textContent =
        "Order changed. Check this arrangement when you are ready.";
      timelineRoot
        .querySelector(`[data-ccf-move="${b.dataset.ccfMove}"]:not(:disabled)`)
        ?.focus();
    }
    if (b.dataset.ccfAction === "reset-timeline") {
      patch({ timeline: c.timelineCards.map((t) => t.id) });
      drawTimeline();
      feedback.textContent =
        "Practice order reset. Your evidence and written work are unchanged.";
    }
    if (b.dataset.ccfAction === "check-timeline" && !checking) {
      checking = true;
      b.disabled = true;
      const submitted = [...order()];
      try {
        const result = await api("/api/ccf/timeline", {
          grade,
          caseId: c.id,
          caseVersion: c.version,
          order: submitted,
        });
        if (!disposed)
          feedback.textContent =
            JSON.stringify(order()) === JSON.stringify(submitted)
              ? result.feedback
              : "Your order changed while the check was running. Check the new arrangement.";
      } catch (error) {
        if (!disposed) feedback.textContent = error.message;
      } finally {
        checking = false;
        if (!disposed) b.disabled = false;
      }
    }
  };
  root.addEventListener("click", click);
  timelineRoot.addEventListener("click", timelineClick);
  redraw();
  drawTimeline();
  mountCaseScene({
    root: document.querySelector("#ccf-scene"),
    caseFile: { ...c, evidence: c.records },
    onInspect: (id) => inspect(id, false),
    inspected: getWork().inspected || [],
    selectedEvidenceId: selected,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
  })
    .then((controller) => {
      if (disposed) controller.destroy();
      else {
        scene = controller;
        scene.update({
          inspected: getWork().inspected || [],
          selectedEvidenceId: selected,
        });
      }
    })
    .catch(() => {
      if (!disposed)
        document.querySelector("#ccf-scene").textContent =
          "Use the evidence buttons below to investigate. Every clue is available there.";
    });
  return () => {
    disposed = true;
    scene?.destroy();
    root.removeEventListener("click", click);
    timelineRoot.removeEventListener("click", timelineClick);
  };
}
