import {
  ENERGY_STAGES,
  eggStagePicture,
  eggStageGallery,
  videoEnergyConnections,
} from "./egg-energy.js?v=dragon-path-8";
import { scienceStrategyChooser } from "./science-strategy.js?v=dragon-path-8";
import { lockedVideo } from "./lesson-video.js?v=dragon-path-8";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function scienceLesson({
  content,
  grade,
  state,
  field,
  questions,
  videos,
}) {
  const project = content.scienceProject,
    first = ENERGY_STAGES[0];
  const previous = state.archivedScience;
  const archived =
    previous &&
    (previous.draft || previous.submissions.length || previous.versions.length)
      ? `<details class="panel"><summary>Your earlier science work is preserved</summary><p>The energy lesson has been updated. Your earlier work remains here and in Export my work; it does not complete the new questions.</p><pre class="preserved-work">${esc(JSON.stringify({ draft: previous.draft?.data, submissions: previous.submissions.map((s) => ({ created: s.created, data: s.data })), versions: previous.versions }, null, 2))}</pre></details>`
      : "";
  return `${archived}<section class="panel egg-welcome"><div><div class="eyebrow">CRACKLE & NESTLE'S EGG-DROP LAB</div><h2>One egg. A question worth investigating.</h2><p class="egg-character"><strong>Crackle:</strong> “An egg, a big drop… what could possibly go wrong?”</p><p class="egg-character"><strong>Nestle:</strong> “Let's follow the energy before we design anything.”</p><p>Over two school weeks, you will investigate one way to protect an egg. Today, learn what happens before, during and after a fall.</p><div class="notice"><strong>This week: learn and plan digitally.</strong> No building supplies or physical tests are needed. Choose your own strategy below. Your teacher reviews your design and supply request on Day 33. Building begins on Day 35.</div></div><img src="${esc(project.welcomeImage)}" width="1536" height="1024" alt="Crackle, a green goblin, leans toward Nestle, a purple owl carefully holding an egg. Neither character has chosen a protection device."></section>
  <section class="panel"><div class="eyebrow">1 · FOLLOW THE EGG</div><h2>Height → motion → landing</h2><p>Choose a moment to explore. You can replay the falling moment by choosing it again.</p><div class="btn-row egg-stage-buttons" role="group" aria-label="Explore the three moments">${ENERGY_STAGES.map((s) => `<button class="btn" data-egg-stage="${s.id}" aria-pressed="${s.id === first.id}">${s.label}</button>`).join("")}</div><div class="egg-explorer"><div id="egg-energy-model">${eggStagePicture(first.id)}</div><p id="egg-energy-caption" class="notice" aria-live="polite">${esc(first.term)}: ${esc(first.text)}</p></div><p class="small muted">This is a model of the stages, not a measured fall or an actual test result.</p><details open><summary>Your complete written science lesson</summary>${content.scienceText.map((p) => `<p>${esc(p)}</p>`).join("")}</details><div class="glossary">${project.definitions.map(([word, meaning]) => `<div><strong>${esc(word)}</strong><br>${esc(meaning)}</div>`).join("")}</div></section>
  <section class="panel"><div class="eyebrow">2 · WATCH & NOTICE</div><h2>Where does the energy go?</h2><p>Listen for <strong>stored energy</strong> and <strong>energy of motion</strong>. Notice the raised-book example and imagine our raised egg in its place.</p><p class="small muted">The video includes advanced equations. Today's work uses the words and pictures in this lesson; no equation calculations or experiments from the video are assigned.</p>${lockedVideo(
    videos.find((v) => v.id === "energy"),
    state.videoProgress?.energy,
  )}</section>
  <section class="panel"><div class="eyebrow">3 · CONNECT THE VIDEO & THE EGG</div><h2>Energy changes. It does not vanish.</h2><p>Use the examples you watched to explain our egg model. Focus on the ideas: no formulas or calculations are needed.</p>${videoEnergyConnections()}${questions("science", ["s-energy-motion", "s-energy-height", "s-video-conservation", "s-video-pendulum"])}</section>
  <section class="panel"><div class="eyebrow">4 · PUT THE PICTURES IN ORDER</div><h2>First, next, last.</h2><p>These pictures are mixed up. Look at all three, then choose a picture for each position below.</p>${eggStageGallery()}<div class="egg-order-questions">${questions("science", ["s-sequence-first", "s-sequence-next", "s-sequence-last"])}</div></section>
  <section class="panel"><div class="row"><div><div class="eyebrow">5 · MAKE YOUR FIRST PREDICTION</div><h2>What do you expect—and why?</h2></div><button class="btn small" data-action="versions" data-id="science">Version history</button></div>${field("science", "prediction", "My initial prediction", project.predictionPrompt, 5)}<div id="version-list"></div><p class="small muted">Use the pictured egg and landing surface. This prediction is about the pictured egg. No physical test is due today. ${grade === 4 ? "Use the word bank above to help explain your idea." : "Connect the evidence to your prediction and be clear about what is still uncertain."}</p></section>
  ${scienceStrategyChooser(content.strategies)}<section class="panel"><details><summary>What is a cardstock egg holder?</summary><p>A small cardstock cup or collar keeps the egg attached. The diagram shows a simple open holder with a base; tabs connect it to the device. It is a holder, not padding or a second protection system. Your teacher approves its fit and attachment before building.</p><svg class="diagram" role="img" aria-label="A cardstock collar surrounds the lower part of an egg. Its cardstock base supports the egg, and side tabs attach to the device. There is no padding." viewBox="0 0 480 190"><ellipse cx="150" cy="77" rx="29" ry="42" fill="#fff7df" stroke="#80613e" stroke-width="3"/><path d="M110 80 Q150 100 190 80 V128 Q150 146 110 128 Z M110 125 H83 V137 H111 M190 125 H215 V137 H190" fill="#c9a676" stroke="#80613e" stroke-width="3"/><path d="M185 105 H256 M177 137 L258 151" stroke="#5b4a80" stroke-width="2"/><text x="267" y="108">cardstock collar</text><text x="267" y="155">base and attachment tabs</text></svg></details></section>
  <section class="panel"><h2>Your continuing project notebook</h2><p>Your design notes and test results stay with your individual science project. Return to this notebook as you learn, build and improve your device.</p>${field("science", "design", "Design notes · optional today", "Record a question or a design idea you want to investigate later. Your final design and supply request are not due today.", 3)}<details><summary>Test log · for Week 2</summary><p>Record actual tests only after teacher approval. Keep height, surface, release method, observations and proposed explanations separate. No result is due today.</p>${field("science", "testLog", "Test log · optional today", "Leave this blank until an approved physical test takes place.", 4)}</details></section>
  <section class="panel"><h2>Our eight-day science plan</h2><p>Monday–Thursday. Days 30–33 and 35–38 each have their own daily assignment. Week 1 is digital preparation. Week 2 is building and testing after teacher review.</p><div class="egg-schedule">${project.schedule
    .map(
      (day) =>
        `<article class="egg-day ${day.day === 30 ? "current" : ""}"><div class="eyebrow">WEEK ${day.week} · ${esc(day.weekday)} · DAY ${day.day}</div><h3>${esc(day.title)}</h3><p>${esc(day.work)}</p><p class="small"><strong>Video:</strong> ${
          day.videoIds.length
            ? day.videoIds
                .map((id) => {
                  const v = project.videos.find((v) => v.id === id);
                  return `${esc(v.title)} (${v.duration})`;
                })
                .join(" + ")
            : `${esc(day.videoTopic)} · selection pending`
        }</p></article>`,
    )
    .join(
      "",
    )}</div><p class="small muted">Later videos open with their assigned day. Today, watch the energy video above.</p></section>
  <section class="panel"><h2>Rules & supplies</h2><div class="notice"><strong>Plan first; gather supplies after approval.</strong> ${esc(project.pending)}</div><ul>${project.commonRules.map((rule) => `<li>${esc(rule)}</li>`).join("")}</ul><p><strong>For families:</strong> Please gather only approved supplies from your child's locked strategy list after the teacher approves the plan. No building supplies are needed during Week 1.</p><p class="small muted">The final drop is planned for Day 38. Your teacher will confirm the school-approved release location, height, viewing area, cleanup arrangements and weather alternative.</p></section>`;
}
