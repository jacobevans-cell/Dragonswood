import { HERO_OPTIONS, PET_OPTIONS } from "./battle-actors/actor-catalog.js?v=dragon-path-6";
import { actorSelection, trustedActorSelection } from "./battle-actors/actor-selection.js?v=dragon-path-6";
import { mountDailyBattleScene } from "./daily-battle-scene.js?v=dragon-path-6";
import {
  geometryMarkup as geometry,
  coachVisualMarkup as coachVisual,
} from "./daily-battle-visuals.js?v=dragon-path-6";

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const tracks = [
  { id: "foundation", label: "Foundation · Grades 2–3" },
  { id: "4", label: "Grade 4" },
  { id: "5", label: "Grade 5" },
  { id: "6", label: "Grade 6" },
];
const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};
const put = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};
const forget = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {}
};

export function dailyBattlePage(day = 30) {
  return `<section class="daily-battle" id="daily-battle"><div class="battle-title"><div><div class="eyebrow">DAY ${esc(day)} · YOUR DAILY PRACTICE</div><h1>Daily Battle<span>.</span></h1></div><div class="battle-meta"><span>25 questions</span><span>20–25 minutes</span></div></div><div id="battle-body" aria-live="polite"><div class="battle-loading">Opening your saved adventure…</div></div></section>`;
}

function resource(question) {
  const r = question?.resource;
  if (!r) return "";
  return `<section class="battle-resource" aria-label="Supplied question resource"><div class="battle-resource-label">${r.diagram ? "LOOK CLOSELY" : "READ & THINK"}</div>${r.title ? `<h3>${esc(r.title)}</h3>` : ""}${r.text ? `<div class="battle-passage">${esc(r.text)}</div>` : ""}${r.diagram ? geometry(r.diagram) : ""}</section>`;
}

function coachMarkup(result, open = false) {
  const c = result?.coach || result?.question?.coach;
  if (!c) return "";
  return `<details class="battle-coach" ${open ? "open" : ""}><summary><span aria-hidden="true">◈</span> Visual coach <span class="small">See the thinking</span></summary><div class="battle-coach-content"><h3>${esc(c.title || "Make the idea visible")}</h3>${coachVisual(c.visual)}${c.text && c.text !== c.visual?.steps?.join(" ") ? `<p>${esc(c.text)}</p>` : ""}</div></details>`;
}

export function bindDailyBattle({ grade, day = 30, previewId, appearance = null, api, onState, onExport }) {
  const root = document.querySelector("#daily-battle");
  if (!root) return () => {};
  const body = root.querySelector("#battle-body");
  const daySuffix = Number(day) === 30 ? "" : `:day${day}`;
  const pendingKey = `dw-daily-battle-pending:${previewId}:${grade}${daySuffix}`;
  const appearanceKey = `dw-daily-battle-appearance:${previewId}:${grade}`;
  const hasTrustedAppearance = appearance !== null && typeof appearance === "object";
  let actors = hasTrustedAppearance ? trustedActorSelection(appearance) : actorSelection(read(appearanceKey));
  let battle,
    scene,
    disposed = false,
    busy = false,
    selected = null,
    showingFeedback = false,
    sceneEnemy = null,
    sceneLoading = false,
    mountEpoch = 0,
    presentationEpoch = 0;
  let motion =
    read("dw-battle-reduced-motion") ??
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pending = read(pendingKey),
    chosenKey = `dw-daily-battle-choice:${previewId}:${grade}${daySuffix}`;
  let selectedRecord = read(chosenKey);
  function feedbackKey() {
    return `dw-battle-read:${previewId}:${grade}:${battle?.session?.id}`;
  }
  function wasRead() {
    try {
      return sessionStorage.getItem(feedbackKey()) === battle.lastResult?.id;
    } catch {
      return false;
    }
  }
  function adopt(next) {
    if (Number(next.day) !== Number(day)) throw new Error("The response belongs to another teaching day. Reload to continue your saved battle.");
    battle = next;
    if (next.state) onState(next.state);
    showingFeedback = Boolean(next.lastResult?.finalized && !wasRead());
    selected =
      selectedRecord &&
      selectedRecord.sessionId === next.session?.id &&
      selectedRecord.questionId === next.question?.id
        ? selectedRecord.choiceId
        : null;
  }
  function announce(text) {
    const box = root.querySelector("#battle-announcement");
    if (box) box.textContent = text;
  }
  function error(text) {
    const box = root.querySelector("#battle-error");
    if (box)
      box.innerHTML = `<strong>${esc(text)}</strong>${pending ? '<button class="btn small" data-battle="retry-save">Retry saved answer</button>' : ""}`;
    else
      body.innerHTML = `<div class="notice error"><p>${esc(text)}</p><button class="btn" data-battle="reload">Try again</button></div>`;
  }
  function displayQuestion() {
    return showingFeedback ? battle.lastResult?.question : battle.question;
  }
  function currentEnemy() {
    const index = Math.min(
      4,
      Math.floor(
        (displayQuestion()?.number
          ? displayQuestion().number - 1
          : showingFeedback
            ? Math.max(0, battle.session.completedCount - 1)
            : battle.session?.completedCount || 0) / 5,
      ),
    );
    return battle.encounters[index] || battle.encounters[0];
  }
  async function mountScene() {
    if (disposed || sceneLoading) return;
    const host = root.querySelector("#battle-scene");
    if (!host) return;
    const enemy = currentEnemy();
    if (!actors.heroId) {
      host.innerHTML = '<div class="battle-art-fallback">Your adventure is ready.<br><small><a href="#home">Choose your adventurer on Home</a> to bring your character into battle. You can keep answering.</small></div>';
      return;
    }
    if (scene) {
      if (sceneEnemy !== enemy.id) {
        sceneEnemy = enemy.id;
        try {
          await scene.setEnemy(enemy.id);
        } catch {
          announce(
            "The illustration is unavailable. Your questions and answers still work.",
          );
        }
      }
      return;
    }
    const epoch = mountEpoch,
      requestedMotion = motion;
    sceneLoading = true;
    sceneEnemy = enemy.id;
    try {
      const mounted = await mountDailyBattleScene({
        root: host,
        enemyId: enemy.id,
        heroId: actors.heroId,
        petId: actors.petId,
        appearance: actors.appearance,
        reducedMotion: requestedMotion,
      });
      if (disposed || epoch !== mountEpoch || !host.isConnected) {
        mounted.destroy();
        return;
      }
      scene = mounted;
    } catch {
      if (!disposed && epoch === mountEpoch)
        host.innerHTML =
          '<div class="battle-art-fallback">The forest is quiet for a moment.<br><small>You can keep answering while the artwork is unavailable.</small></div>';
    } finally {
      sceneLoading = false;
      if (!disposed && epoch !== mountEpoch) {
        host.innerHTML = "";
        mountScene();
      }
    }
  }
  function actorLabel() {
    const hero = HERO_OPTIONS.find(item => item.id === actors.heroId);
    const pet = PET_OPTIONS.find(item => item.id === actors.petId);
    if (!hero) return "Choose your adventurer on Home";
    return `${hero.family} · ${hero.class === 'mage' ? 'Mage' : 'Warrior'}${pet ? ` · ${pet.name}` : ' · No companion'}`;
  }
  function appearancePicker() {
    if (hasTrustedAppearance) return `<p class="battle-saved-identity small">Your saved adventurer${actors.petId ? ' and companion' : ''} · <a href="#home">Character & companion</a></p>`;
    return `<details class="battle-appearance"><summary>Preview character & companion</summary><p class="small">Local appearance preview · saved in this browser. These choices do not equip or unlock pets on a student account, or change questions, points or health.</p><div class="battle-appearance-grid"><label>Character<select id="battle-preview-hero">${HERO_OPTIONS.map(hero => `<option value="${esc(hero.id)}" ${actors.heroId === hero.id ? 'selected' : ''}>${esc(hero.family)} · ${hero.class === 'mage' ? 'Mage' : 'Warrior'} · Lv. ${hero.level}</option>`).join('')}</select></label><label>Companion<select id="battle-preview-pet"><option value="" ${actors.petId === null ? 'selected' : ''}>No companion</option>${PET_OPTIONS.map(pet => `<option value="${esc(pet.id)}" ${actors.petId === pet.id ? 'selected' : ''}>${esc(pet.name)} · Lv. ${pet.level} preview</option>`).join('')}</select></label></div><p class="small muted">Character and pet levels describe this artwork. Your assigned learning track stays the same.</p></details>`;
  }
  function remountAppearance() {
    mountEpoch++;
    presentationEpoch++;
    scene?.destroy();
    scene = null;
    sceneEnemy = null;
    const host = root.querySelector('#battle-scene');
    if (host && !sceneLoading) host.innerHTML = '';
    mountScene();
  }
  function frame() {
    body.innerHTML = `<div class="battle-track-row"><span class="battle-track">${esc(battle.trackLabel)} <small>· assigned practice</small></span><label class="battle-motion"><input type="checkbox" id="battle-reduce-motion" ${motion ? "checked" : ""}> Less motion</label></div>${appearancePicker()}<div class="battle-shell"><div class="battle-hud"><div class="battle-fighter"><div class="fighter-emblem" aria-hidden="true">✦</div><div><strong>Your adventurer</strong><small id="battle-actor-label">${esc(actorLabel())}</small><div id="hero-hp" class="battle-health" role="progressbar" aria-label="Your health" aria-valuemin="0" aria-valuemax="100"><i></i></div><span class="battle-hp-label" id="hero-hp-text"></span></div></div><span class="battle-vs">VS</span><div class="battle-fighter enemy-fighter"><div><strong id="enemy-name"></strong><small id="enemy-encounter"></small><div id="enemy-hp" class="battle-health enemy-health" role="progressbar" aria-label="Questions remaining in this encounter" aria-valuemin="0" aria-valuemax="5"><i></i></div><span class="battle-hp-label" id="enemy-hp-text"></span></div><div class="fighter-emblem enemy-emblem" aria-hidden="true">✧</div></div></div><div class="battle-scene-wrap"><div id="battle-scene"></div><div class="battle-scene-caption"><span>THE WILDWOOD GATE</span><span id="battle-encounter-caption"></span></div></div><div id="battle-question-panel" class="battle-question-panel"></div></div><div id="battle-progress"></div><p id="battle-announcement" class="battle-save-state" role="status"></p><div id="battle-error" class="battle-error" role="alert"></div><details class="battle-rules"><summary>How Daily Battle works</summary><ul><li>25 questions: 12 math, 11 language arts and 2 science.</li><li>Your first answer earns 0.2 points when correct. The total is 5 points.</li><li>A first-answer mistake lowers the score and costs 20 health. Read the coach and try once more. That retry does not change your grade.</li><li>After the retry, review the worked answer and continue. You will never be stuck in an endless retry.</li><li>At zero health, you recover and continue. Saved answers stay with you.</li><li>Finish all 25 question steps to complete Daily Battle. There are no prizes or XP. There is no countdown or speed penalty.</li></ul></details><button class="btn small quiet" data-battle="export">Export my saved work</button>`;
    renderBody();
    mountScene();
  }
  function renderBody() {
    if (disposed) return;
    const s = battle.session,
      q = displayQuestion(),
      r = battle.lastResult;
    const enemy = currentEnemy();
    root.querySelector("#hero-hp-text").textContent =
      `${s?.hp ?? 100} / 100 health`;
    const hp = root.querySelector("#hero-hp");
    hp.setAttribute("aria-valuenow", s?.hp ?? 100);
    hp.querySelector("i").style.width = `${s?.hp ?? 100}%`;
    root.querySelector("#enemy-name").textContent = enemy.name;
    const encounterIndex = battle.encounters.findIndex(
      (e) => e.id === enemy.id,
    );
    root.querySelector("#enemy-encounter").textContent =
      encounterIndex === 4
        ? "Final encounter"
        : `Encounter ${encounterIndex + 1} of 5`;
    const doneInEncounter = Math.max(
      0,
      Math.min(5, (s?.completedCount || 0) - encounterIndex * 5),
    );
    root.querySelector("#enemy-hp-text").textContent =
      `${doneInEncounter} / 5 questions resolved`;
    const eh = root.querySelector("#enemy-hp");
    eh.setAttribute("aria-valuenow", 5 - doneInEncounter);
    eh.querySelector("i").style.width = `${(5 - doneInEncounter) * 20}%`;
    root.querySelector("#battle-encounter-caption").textContent =
      `ENCOUNTER ${encounterIndex + 1} / 5`;
    const panel = root.querySelector("#battle-question-panel");
    if (!s) {
      panel.innerHTML = `<div class="battle-intro"><div><div class="eyebrow">THINK CAREFULLY. MAKE YOUR MOVE.</div><h2>Your path through the Wildwood.</h2><p>Five encounters. A little math, a little reading, and a spark of science. Each answer moves your adventure forward.</p></div><div class="battle-start-block"><button class="btn primary battle-start" data-battle="start">Begin Daily Battle <span>→</span></button><p>5 points · Saves after every answer</p></div></div>`;
    } else if (s.complete && !showingFeedback) {
      panel.innerHTML = `<div class="battle-complete"><div class="eyebrow">ALL 25 QUESTION STEPS COMPLETE</div><h2>You made it through the Wildwood.</h2><p>Your work is saved, and Daily Battle is complete.</p><div class="battle-results"><div><strong>${formatScore(s.score)}<small> / 5</small></strong><span>Your grade</span></div><div><strong>${s.firstCorrect}<small> / 25</small></strong><span>Correct on the first try</span></div><div><strong>${s.recoveries}</strong><span>Recovery moments</span></div></div><p class="small">Coached retries are saved separately. They help you learn and do not erase first-attempt mistakes.</p><a class="btn primary" href="#home">Back to your learning path →</a><details class="battle-review"><summary>Review your questions</summary>${(
        battle.review || []
      )
        .map((item) => {
          const question = item.question || item;
          return `<article><h3>${esc(question.prompt || question.id)}</h3>${resource(question)}<p>${esc(item.explanation || item.feedback || "")}</p>${coachMarkup(item)}</article>`;
        })
        .join("")}</details></div>`;
    } else {
      const retry =
        !showingFeedback && r && !r.finalized && r.questionId === q?.id;
      const number = showingFeedback ? s.completedCount : s.completedCount + 1;
      panel.innerHTML = `<div class="battle-question-top"><span class="battle-subject">${esc(q?.subject === "ela" ? "LANGUAGE ARTS" : q?.subject?.toUpperCase())}</span><span>Question ${number} of 25 ${retry ? "· coached retry" : ""}</span></div>${resource(q)}<div class="battle-problem-grid"><div class="battle-prompt"><span class="battle-skill">${esc(q?.skill)}</span><h2 id="battle-question" tabindex="-1">${esc(q?.prompt)}</h2><p>${showingFeedback ? "Review your thinking before you move on." : retry ? "Use the visual coach, then make one more choice." : "Choose your answer, then make your move."}</p></div><fieldset class="battle-choices" ${showingFeedback ? "disabled" : ""}><legend class="sr-only">Answer choices</legend>${(
        q?.choices || []
      )
        .map((choice, i) => {
          const picked = showingFeedback
            ? r.choiceId === choice.id
            : selected === choice.id;
          const correct = showingFeedback && r.correctChoiceId === choice.id;
          return `<label class="battle-choice ${picked ? "chosen" : ""} ${correct ? "correct-choice" : ""}"><input type="radio" name="daily-battle-answer" value="${esc(choice.id)}" ${picked ? "checked" : ""} ${busy || showingFeedback ? "disabled" : ""}><span class="choice-letter">${String.fromCharCode(65 + i)}</span><span>${esc(choice.text)}</span>${correct ? '<span class="choice-check" aria-label="Correct answer">✓</span>' : ""}</label>`;
        })
        .join(
          "",
        )}</fieldset></div>${retry ? `<div class="battle-feedback practice"><strong>Take another look.</strong><p>${esc(r.feedback)}</p>${r.recovered ? '<div class="battle-recovery">Your health is restored. Your saved answers are safe—keep going.</div>' : ""}</div>${coachMarkup(r, true)}` : ""}${showingFeedback ? `<div class="battle-feedback ${r.correct ? "success" : "practice"}"><strong>${r.firstAttempt && r.correct ? "That’s it. Your thinking landed." : r.correct ? "You found it on your retry." : "Let’s make the idea clear."}</strong><p>${esc(r.explanation || r.feedback)}</p><p class="small">${r.firstAttempt && r.correct ? "0.2 points earned." : "Your first-attempt result stays recorded. This practice step is complete."}</p></div>${coachMarkup(r, !r.correct)}` : ""}<div class="battle-answer-actions">${showingFeedback ? `<button class="btn primary" data-battle="next">${s.complete ? "See my results" : s.completedCount % 5 === 0 ? "Next encounter" : "Next question"} →</button>` : `<button class="btn primary" data-battle="answer" ${!selected || busy || pending ? "disabled" : ""}>${busy ? "Saving your answer…" : retry ? "Check my retry" : "Check answer & attack"} <span>→</span></button>`}<span class="small">${s.completedCount} of 25 steps saved</span></div>`;
    }
    const score = s?.score;
    root.querySelector("#battle-progress").innerHTML =
      `<div class="battle-journey">${battle.encounters.map((e, i) => `<div class="${(s?.completedCount || 0) >= (i + 1) * 5 ? "done" : i === encounterIndex ? "current" : ""}"><span>${(s?.completedCount || 0) >= (i + 1) * 5 ? "✓" : i + 1}</span><small>${esc(e.name)}</small></div>`).join("")}</div>${s ? `<div class="battle-scoreline"><span>First-try points earned: <strong>${formatScore(score)} / 5</strong></span><span>${s.firstCorrect} first-try correct · ${s.attemptCount} answers saved</span></div>` : ""}`;
    announce(
      pending
        ? "An answer is waiting to reach the server. Retry it before continuing."
        : s
          ? "Progress saved · You can leave and come back."
          : "Your adventure is ready.",
    );
    root.querySelectorAll("button[data-battle]").forEach((btn) => {
      btn.disabled =
        busy ||
        (btn.dataset.battle === "answer" && (!selected || Boolean(pending)));
    });
  }
  async function request(path, payload) {
    if (busy || disposed) return;
    busy = true;
    pending = { path, payload };
    put(pendingKey, pending);
    renderBody();
    try {
      const next = await api(path, payload);
      if (disposed) return;
      const previousResult = battle?.lastResult?.id;
      adopt(next);
      pending = null;
      forget(pendingKey);
      forget(chosenKey);
      selectedRecord = null;
      selected = null;
      busy = false;
      renderBody();
      if (path.endsWith("/answer") && next.lastResult?.id !== previousResult) {
        const result = next.lastResult,
          epoch = ++presentationEpoch;
        if (scene && !motion)
          root
            .querySelector(".battle-scene-wrap")
            ?.scrollIntoView({ block: "center", behavior: "smooth" });
        const play =
          scene?.play(result.correct ? "correct" : "incorrect") ||
          Promise.resolve();
        play
          .then(() => {
            if (result.recovered && !disposed && epoch === presentationEpoch)
              return scene?.play("recovery");
          })
          .catch(() => {})
          .finally(() => {
            if (!disposed && epoch === presentationEpoch)
              root.querySelector(".battle-feedback")?.scrollIntoView({
                block: "nearest",
                behavior: motion ? "auto" : "smooth",
              });
          });
      }
      if (path.endsWith("/start")) mountScene();
      if (path.endsWith("/start"))
        root.querySelector("#battle-question")?.scrollIntoView({
          block: "nearest",
          behavior: motion ? "auto" : "smooth",
        });
    } catch (e) {
      if (disposed) return;
      busy = false;
      if ([400, 401, 403, 409, 422].includes(e.status)) {
        put(
          `dw-daily-battle-unsent:${previewId}:${grade}${daySuffix}:${pending?.payload?.sessionId || "start"}`,
          { ...pending, error: e.message, savedAt: Date.now() },
        );
        pending = null;
        forget(pendingKey);
        try {
          adopt(await api(`/api/battle?grade=${grade}&day=${day}`));
        } catch {}
      }
      renderBody();
      error(
        e.status === 409
          ? "Another tab or a track change updated this battle. The latest saved work is shown; your unsent answer is kept in this browser for export."
          : e.message,
      );
    }
  }
  const onClick = async (event) => {
    const button = event.target.closest("[data-battle]");
    if (!button || !root.contains(button)) return;
    const action = button.dataset.battle;
    if (action === "export") {
      await onExport?.();
      return;
    }
    if (action === "reload") {
      await boot();
      return;
    }
    if (!battle) return;
    if (action === "start")
      return request("/api/battle/start", {
        grade,
        day,
        version: battle.version,
        key: crypto.randomUUID(),
      });
    if (action === "retry-save" && pending)
      return request(pending.path, pending.payload);
    if (action === "answer" && selected && !pending)
      return request("/api/battle/answer", {
        grade,
        day,
        sessionId: battle.session.id,
        version: battle.version,
        questionId: battle.question.id,
        choiceId: selected,
        revision: battle.session.revision,
        key: crypto.randomUUID(),
      });
    if (action === "next") {
      presentationEpoch++;
      try {
        sessionStorage.setItem(feedbackKey(), battle.lastResult.id);
      } catch {}
      showingFeedback = false;
      selected = null;
      renderBody();
      mountScene();
      root.querySelector("#battle-question")?.focus({ preventScroll: true });
      root.querySelector("#battle-question-panel")?.scrollIntoView({
        block: "start",
        behavior: motion ? "auto" : "smooth",
      });
    }
  };
  const onChange = (event) => {
    if (!hasTrustedAppearance && (event.target.id === 'battle-preview-hero' || event.target.id === 'battle-preview-pet')) {
      actors = actorSelection({
        heroId: root.querySelector('#battle-preview-hero').value,
        petId: root.querySelector('#battle-preview-pet').value || null,
      });
      put(appearanceKey, actors);
      root.querySelector('#battle-actor-label').textContent = actorLabel();
      remountAppearance();
      return;
    }
    if (event.target.name === "daily-battle-answer") {
      selected = event.target.value;
      selectedRecord = {
        sessionId: battle.session.id,
        questionId: battle.question.id,
        choiceId: selected,
      };
      put(chosenKey, selectedRecord);
      root
        .querySelectorAll(".battle-choice")
        .forEach((label) =>
          label.classList.toggle(
            "chosen",
            label.querySelector("input").checked,
          ),
        );
      const button = root.querySelector('[data-battle="answer"]');
      if (button) button.disabled = busy || Boolean(pending);
    }
    if (event.target.id === "battle-reduce-motion") {
      motion = event.target.checked;
      put("dw-battle-reduced-motion", motion);
      mountEpoch++;
      presentationEpoch++;
      scene?.destroy();
      scene = null;
      sceneEnemy = null;
      const host = root.querySelector("#battle-scene");
      if (host && !sceneLoading) host.innerHTML = "";
      mountScene();
    }
  };
  async function boot() {
    try {
      const next = await api(`/api/battle?grade=${grade}&day=${day}`);
      if (disposed) return;
      adopt(next);
      frame();
      if (pending)
        error(
          "Your previous answer may still need saving. Retry the same saved answer to confirm it.",
        );
    } catch (e) {
      if (!disposed) error(e.message);
    }
  }
  function onOnline() {
    if (pending && !busy) request(pending.path, pending.payload);
  }
  root.addEventListener("click", onClick);
  root.addEventListener("change", onChange);
  window.addEventListener("online", onOnline);
  boot();
  return () => {
    disposed = true;
    mountEpoch++;
    presentationEpoch++;
    scene?.destroy();
    root.removeEventListener("click", onClick);
    root.removeEventListener("change", onChange);
    window.removeEventListener("online", onOnline);
  };
}

function formatScore(n) {
  return Number(n || 0)
    .toFixed(1)
    .replace(/\.0$/, "");
}

export function battleTeacherPanel(profiles) {
  return `<section class="panel battle-teacher"><div class="eyebrow">DAILY BATTLE · TEACHER PLACEMENT</div><h2>The right practice for each learner.</h2><p>A battle track changes Daily Battle questions only. Enrolled grade and the six curriculum lessons stay the same.</p><div class="battle-placement-grid">${profiles
    .map((p) => {
      const b = p.dailyBattle || {},
        s = b.session || b;
      return `<div><h3>Grade ${p.grade} preview profile</h3><label for="battle-track-${p.grade}">Assigned Daily Battle track</label><select id="battle-track-${p.grade}" data-battle-track="${p.grade}">${tracks.map((t) => `<option value="${t.id}" ${(b.track || String(p.grade)) === t.id ? "selected" : ""}>${t.label}</option>`).join("")}</select><button class="btn small" data-battle-assign="${p.grade}">Save track assignment</button><p class="small" data-track-status="${p.grade}" role="status">${s.completedCount || 0} / 25 completed${s.complete ? ` · ${formatScore(s.score)} / 5 points` : ""}</p></div>`;
    })
    .join(
      "",
    )}</div><p class="small muted">Changing tracks preserves previous battle sessions. This local preview has two demonstration profiles; production teacher authentication and the real class roster are still separate integration work.</p></section>`;
}

export function bindBattleTeacher({ api, day = 30, onAssigned }) {
  document.querySelectorAll("[data-battle-assign]").forEach((button) =>
    button.addEventListener("click", async () => {
      const grade = Number(button.dataset.battleAssign),
        select = document.querySelector(`[data-battle-track="${grade}"]`),
        status = document.querySelector(`[data-track-status="${grade}"]`);
      button.disabled = true;
      select.disabled = true;
      try {
        const next = await api("/api/battle/track", {
          grade,
          day,
          track: select.value,
          key: crypto.randomUUID(),
        });
        status.textContent = `${next.trackLabel} assigned. Previous work is preserved.`;
        onAssigned?.(next);
      } catch (e) {
        status.textContent = e.message;
      } finally {
        button.disabled = false;
        select.disabled = false;
      }
    }),
  );
}
