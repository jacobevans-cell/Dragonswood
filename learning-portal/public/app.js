import { lockedVideo, bindLessonVideos } from "./lesson-video.js";
import { activityOverview, activityOverviewMarkup, battleOverviewMarkup } from "./activity-overview.js";
import { renderLessonPractice, bindLessonPractice } from "./lesson-practice.js";
import { scienceLesson } from "./science-lab.js";
import { caseDesk, bindCaseDesk } from "./ccf-desk.js";
import { bindScienceStrategy } from "./science-strategy.js";
import { bindEggEnergy } from "./egg-energy.js";
import { essayGuide, essayPreview, bindEssayPreview } from "./opinion-essay.js";
import { topicChooser, lockedTopic } from "./writing-topics.js";
import { energyDiagram, strategyDiagram } from "./diagrams.js";
import { geometryLesson, bindGeometryLab } from "./geometry-lab.js";
import { powersLab, bindPowersLab } from "./powers-lab.js";
import { visualCoach, bindVisualCoaches } from "./visual-coach.js";
import { publicRubric, questionComponent, objectiveComponents, questionsReady, questionControlLocked, questionAnswer, questionAssessment, assessmentFeedback, assessmentTotals, teacherAssessment } from "./assessment-ui.js";
import { stageSafeQuestionCoach } from "./assessment-coach.js";
import {renderCurriculumMath,renderCurriculumReading,renderCurriculumMorphology,curriculumMathVisual,curriculumCoach,bindCurriculumDays} from './curriculum-days.js';
import {writingMilestone,scienceMilestone,learningMethodCoach,bindProjectDayEditors,teacherProjectPanel} from './project-days.js';
import {
  dailyBattlePage,
  bindDailyBattle,
  battleTeacherPanel,
  bindBattleTeacher,
} from "./daily-battle.js";
import {portalIdentityMarkup,portalGuideMarkup,adventurerHomeMarkup,bindPortalIdentity} from './portal-identity.js';
import {scheduleMarkup,lockedSubjectMarkup,teacherScheduleMarkup,bindSchoolSchedule} from './school-schedule.js';
import {scienceConditionsMarkup,bindScienceConditions} from './science-conditions.js';
import {publicResources} from './public-resources.js';
const runtimeConfig=await fetch(new URL('./runtime-config.json',import.meta.url),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Runtime configuration unavailable.');return r.json();});
const hosted=runtimeConfig.mode!=='preview';
let hostedAuth=null;
let stopScienceConditions=()=>{};
let stopPortalIdentity=()=>{},stopSchoolSchedule=()=>{};
const $ = (s) => document.querySelector(s);
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const TEACHING_DAYS=[30,31,32,33,35,36,37,38];
const weekday=d=>["Monday","Tuesday","Wednesday","Thursday"][TEACHING_DAYS.indexOf(d)%4];
let day=Number(localStorage.getItem("dw-preview-day")||30);
if(!TEACHING_DAYS.includes(day))day=30;
let grade = Number(localStorage.getItem("dw-preview-grade") || 4),
  content,
  state,
  route = location.hash.slice(1) || "home";
let work = {},
  dirty = new Set(),
  conflicts = new Set(),
  resolvingConflicts = new Set(),
  profileGeneration = 0,
  loadingProfile = false,
  switchingProfile = false,
  saveChain = Promise.resolve(),
  saveTimer,
  selection = null,
  clockOffset = 0,
  pendingRequests = {},
  pendingWritingTopic = null,
  lockingTopic = false;
const questionChecking = new Set(), questionMessages = new Map(), recoveryAnswers = new Map();
let pendingQuestions = {};
let videos = [],
  stopVideos = () => {};
let stopScienceStrategy = () => {};
let stopCCF = () => {};
let stopBattle = () => {};
const profileContext = () => ({ grade, day, generation: profileGeneration, previewId: state?.previewId });
const profileCurrent = (bound) => bound.grade === grade && bound.day === day && bound.generation === profileGeneration && bound.previewId === state?.previewId;
const responseMatchesProfile = (next, bound) => next?.grade === bound.grade && (next.day ?? 30) === bound.day && next.previewId === bound.previewId;
const names = {
  morning: "Daily Battle",
  math: "Math",
  reading: "Reading",
  writing: "Writing",
  science: "Science",
  morphology: "Morphology",
  ccf: "Case Files",
};
const icons = {
  morning: "⚔",
  math: "∠",
  reading: "▤",
  writing: "✎",
  science: "⚗",
  morphology: "Aa",
  ccf: "⌕",
};
async function api(path, body) {
  const requestedDay=body?.day??day;
  if(!/[?&]day=/.test(path))path+=(path.includes("?")?"&":"?")+"day="+requestedDay;
  if(body)body={...body,day:requestedDay};
  let res;
  try {
    res = await (hosted ? hostedAuth.fetch : fetch)(path, {
      method: body ? "POST" : "GET",
      signal: AbortSignal.timeout(hosted?45000:12000),
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "We couldn’t connect. Your draft is kept in this browser. Try saving again.",
    );
  }
  const data = await res.json();
  if (!res.ok)
    throw Object.assign(new Error(data.error), data, { status: res.status });
  return publicResources(data);
}
let toastTimer;
function toast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").className = "show";
  toastTimer = setTimeout(() => {
    $("#toast").className = "";
    $("#toast").textContent = "";
  }, 5000);
}
function nav() {
  return `<a class="nav-link ${route === "home" ? "active" : ""}" href="#home"><span class="nav-icon">◈</span>Curriculum Quest</a><div class="nav-label">DAY ${day} · ${weekday(day).toUpperCase()}</div>${Object.entries(
    names,
  )
    .map(
      ([id, name]) =>
        `<a class="nav-link ${route === id ? "active" : ""}" href="#${id}"><span class="nav-icon">${icons[id]}</span>${name}<span class="nav-status">${state.completion.sections[id] ? "✓" : ""}</span></a>`,
    )
    .join(
      "",
    )}${hosted?`<div class="nav-label">YOUR SCHOOL TOOLS</div><a class="nav-link" href="/Dragonswood/school-tools.html#module/rune-spelling" data-school-tool>Rune Spelling</a><a class="nav-link" href="/Dragonswood/school-tools.html#module/class-reader" data-school-tool>Storyvault</a><a class="nav-link" href="/Dragonswood/school-tools.html#games" data-school-tool>Games &amp; school tools</a>${hostedAuth.teacher()?'<a class="nav-link" href="/Dragonswood/teacher.html" data-school-tool>Teacher dashboard &amp; gradebook</a>':''}`:''}<div class="sidebar-note"><strong>One day at a time.</strong><p>Your work stays with you. Come back, reflect, and keep building.</p><span>Monday–Thursday</span></div>`;
}
function shell(body) {
  $("#app").innerHTML =
    `<header class="topbar"><a class="brand" href="#home"><span class="crest"><img src="/Dragonswood/learning-portal/public/assets/dragonswood-mascot/assets/icons/dragonswood-mascot-64.png" alt="" width="32" height="32"></span> DRAGONSWOOD</a><div class="top-actions">${hosted?'<a class="btn quiet small" href="/Dragonswood/school-tools.html#passes" data-school-tool>Passes &amp; school tools</a>':''}${hosted?'':'<span class="preview-label">ROUND ONE · LOCAL PREVIEW</span>'}<select id="day" aria-label="Teaching day">${TEACHING_DAYS.map(d=>`<option value="${d}" ${d===day?"selected":""}>Day ${d} · ${weekday(d)}</option>`).join("")}</select>${hosted?hostedAuth.controls():`<select id="grade" aria-label="Preview grade"><option value="4" ${grade === 4 ? "selected" : ""}>Grade 4 · Preview</option><option value="5" ${grade === 5 ? "selected" : ""}>Grade 5 · Preview</option></select><a href="#teacher" class="btn quiet small">Teacher view</a>`}</div></header><div class="shell"><aside aria-label="Quest navigation">${portalIdentityMarkup(state.adventurer)}${nav()}</aside><main id="main" tabindex="-1">${[...conflicts].map((id) => `<div class="notice error conflict"><strong>${esc(names[id] || id)} draft needs attention.</strong> Export this draft before loading its saved version. Your other work can keep saving. <button class="btn small" data-action="export-conflict" data-id="${esc(id)}">Export this draft</button> <button class="btn small" data-action="reload-saved" data-id="${esc(id)}" ${resolvingConflicts.has(id) ? 'disabled' : ''}>Export and load saved version</button></div>`).join('')}${portalGuideMarkup(route)}${route==="science"?scienceConditionsMarkup(state.scienceConditions):""}${body}</main></div>`;
  if(hosted)hostedAuth.bind();
  document.querySelectorAll('[data-school-tool]').forEach(link=>link.addEventListener('click',async event=>{
    event.preventDefault();
    try{await flush();if(dirty.size||conflicts.size||questionChecking.size||Object.keys(pendingRequests).length||Object.keys(pendingQuestions).length)throw Error('Save or resolve your current work before opening another school tool.');
      location.assign(link.href);
    }catch(error){toast(error.message);}
  }));
  $("#day").disabled = lockingTopic || loadingProfile || switchingProfile || questionChecking.size > 0;
  $("#day").addEventListener("change",async(e)=>{
    const next=Number(e.target.value);if(!TEACHING_DAYS.includes(next)||switchingProfile||loadingProfile||lockingTopic||questionChecking.size){e.target.value=day;return;}
    switchingProfile=true;e.target.disabled=true;
    try{await flush();if(conflicts.size||dirty.size||Object.keys(pendingRequests).length||Object.keys(pendingQuestions).length){e.target.value=day;toast("Save or resolve current work before switching days.");return;}
      stopVideos();stopScienceStrategy();stopCCF();stopBattle();day=next;localStorage.setItem("dw-preview-day",day);await load();
    }finally{switchingProfile=false;if($("#day"))$("#day").disabled=lockingTopic||loadingProfile;if($("#grade"))$("#grade").disabled=lockingTopic||loadingProfile;}
  });
  if($("#grade"))$("#grade").disabled = lockingTopic || loadingProfile || switchingProfile || questionChecking.size > 0;
  $("#grade")?.addEventListener("change", async (e) => {
    const next = Number(e.target.value);
    if (switchingProfile || loadingProfile || lockingTopic || questionChecking.size || ![4, 5].includes(next)) {
      e.target.value = grade;
      return;
    }
    switchingProfile = true;
    e.target.disabled = true;
    try {
      await flush();
      if (conflicts.size || dirty.size || Object.keys(pendingRequests).length || Object.keys(pendingQuestions).length || resolvingConflicts.size) {
        e.target.value = grade;
        toast("Save or resolve your current drafts before switching profiles.");
        return;
      }
      stopVideos();
      stopScienceStrategy();
      stopCCF();
      stopBattle();
      grade = next;
      localStorage.setItem("dw-preview-grade", grade);
      await load();
    } finally {
      switchingProfile = false;
      if ($("#day")) $("#day").disabled = lockingTopic || loadingProfile;
      if ($("#grade")) $("#grade").disabled = lockingTopic || loadingProfile;
    }
  });
}
function home() {
  const overview = activityOverview(content, videos, state.videoProgress);
  const cards = [
    [
      "math",
      grade === 4
        ? "Geometry from the ground up"
        : "Powers of ten & decimal patterns",
      "Explore a model. Practice. Explain your thinking.",
      "Video + workshop",
    ],
    [
      "reading",
      "Different ideas. Shared purpose.",
      "Read Two Ways Across, collect evidence, and compare its characters.",
      "Video + evidence studio",
    ],
    [
      "writing",
      state.writingProject
        ? "Your opinion is taking shape"
        : "Four questions. Your choice.",
      "Develop your ideas in a short opinion essay across two weeks.",
      "Day 1 · Make a plan",
    ],
    [
      "science",
      "Can you protect an egg?",
      "Follow the energy. Meet Crackle, Nestle and five engineering approaches.",
      "Day 1 · Investigate",
    ],
    [
      "morphology",
      content.morph.word,
      "Study the picture and put today’s word to work in a short response.",
      "Picture quickwrite",
    ],
    [
      "ccf",
      content.caseFile.title,
      "Read the report, interview three witnesses, and test your theory.",
      "Separate daily case",
    ],
  ];
  if(day>30){cards[0]=["math",content.curriculum.math.title,content.curriculum.math.goal,"Interactive workshop"];cards[1]=["reading",content.passage.title,content.readingTask.mission,"Evidence studio"];cards[2]=["writing",content.writingDay.title,content.writingDay.task,content.writingDay.phase];cards[3]=["science",content.scienceDay.title,content.scienceDay.phase,"Individual egg-drop project"];if(content.morph.video)cards[4]=["morphology",content.morph.word,"Explore the word, practice its meaning, then explain your own idea.","Video + word lab"];}
  return `${adventurerHomeMarkup(state.adventurer)}<section class="hero hero-grid"><div><div class="eyebrow">CURRICULUM QUEST · GRADE ${grade}</div><h1>Ideas take flight.</h1><p>Welcome to Day ${day}. Read, investigate, create, and use evidence to explain your thinking. Your projects continue across our four-day school weeks.</p><a href="#morning" class="btn primary">Start with Daily Battle <span>→</span></a>${battleOverviewMarkup(state.dailyBattle)}</div><img class="hero-art" src="/Dragonswood/learning-portal/public/assets/bridge-choices.png" alt="Two children consider a safe plan beside a damaged garden bridge."></section><div class="week-strip">${TEACHING_DAYS.map(d=>`<button class="day-chip ${d===day?"current":""}" data-action="open-day" data-day="${d}">${weekday(d).slice(0,3)} · Day ${d}</button>`).join("")}</div>${scheduleMarkup(state.schedule)}<div class="overview-line"><h2>Your learning path</h2><span id="home-count" class="tag ${state.completion.complete ? "good" : ""}">${state.completion.done} of ${state.completion.total} submitted</span></div><div class="progress"><i style="width:${(state.completion.done / state.completion.total) * 100}%"></i></div>${state.completion.complete ? `<div class="notice success">Day ${day} is complete. Your projects stay open for revision. Written feedback may still be on its way.</div>` : ""}<p class="activity-overview-note">Plan your day: estimates include videos, lesson work, and any building or testing. Some days need more time than others. These are planning guides, not timers.</p><div class="cards">${cards.map(([id, title, desc, tag]) => `<a href="#${id}" class="quest-card"><div class="row"><span class="card-icon">${icons[id]}</span><span class="tag ${state.completion.sections[id] ? "good" : ""}">${state.completion.sections[id] ? "✓ Submitted" : tag}</span></div><div class="eyebrow">${names[id]}</div><h3>${title}</h3><p>${desc}</p>${activityOverviewMarkup(overview[id])}<span class="quest-card-action">${state.drafts[id] ? "Continue" : "Open lesson"} →</span></a>`).join("")}</div><p class="caption">Eight teaching days · Monday–Thursday. Each day keeps its own work and completion; your essay and science notebook continue across days.</p>`;
}
function heading(id, title, sub) {
  return `<a class="back" href="#home">← Curriculum Quest</a><div class="lesson-heading"><div class="eyebrow">${names[id]} · DAY ${day} · GRADE ${grade}</div><h1>${title}</h1><p class="muted">${sub}</p></div>${publicRubric(state.assessment?.contracts?.[id])}`;
}
const data = (id) =>
  work[id] || (work[id] = structuredClone(state.drafts[id]?.data || {}));
const value = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);
function field(id, path, label, hint = "", rows = 3) {
  const uid = `${id}-${path.replaceAll(".", "-")}`;
  return `<label for="${uid}">${label}</label>${hint ? `<p class="small muted" id="${uid}-hint">${hint}</p>` : ""}<textarea id="${uid}" data-field="${path}" data-assignment="${id}" rows="${rows}" ${hint ? `aria-describedby="${uid}-hint"` : ""}>${esc(value(data(id), path) || "")}</textarea>${day>30?learningMethodCoach(id,path,label,day):visualCoach(id, path, grade, label, id === "writing" ? state.writingProject?.topic.prompt : undefined)}`;
}
function video(id) {
  if(!content.videos[id])return "";
  return `<details open><summary>Watch: ${esc(content.videos[id].title)} · Explore Academy</summary>${lockedVideo(
    videos.find((v) => v.id === id),
    state.videoProgress?.[id],
  )}</details>`;
}
function assignmentVideos(assignment) {
  return Object.keys(content.videos).filter(id => (content.videos[id].assignment || id) === assignment).map(video).join('');
}
function mergeVideoProgress(next) {
  if (next.grade !== state.grade || (next.day??30)!==day) return;
  next.videoProgress ||= {};
  for (const [id, p] of Object.entries(state.videoProgress || {})) {
    if (p.updated > (next.videoProgress[id]?.updated || 0))
      next.videoProgress[id] = p;
  }
  // A slower draft response must not reopen a newer finalized question.
  for (const [id, questions] of Object.entries(state.assessment?.questions || {})) {
    if (state.assessment.contracts?.[id]?.contractHash !== next.assessment?.contracts?.[id]?.contractHash) continue;
    for (const [qid, progress] of Object.entries(questions)) {
      if (progress.revision > (next.assessment?.questions?.[id]?.[qid]?.revision || 0))
        next.assessment.questions[id][qid] = progress;
    }
  }
}
function updateVideoLocks() {
  const required = videos.filter((v) => v.assignment === route);
  const locked = required.some((v) => !state.videoProgress?.[v.id]?.complete);
  const main = document.querySelector("#main");
  if (!main) return;
  main.querySelectorAll('[data-video-activity]').forEach((fieldset) => {
    fieldset.disabled = locked || resolvingConflicts.has(route);
  });
  main
    .querySelectorAll(
      '[data-field], [data-recovery-question], [data-action="check-question"], [data-action="submit"], [data-action="add-selection"], [data-action="add-sentence"], [data-action="insert-quote"], #sentence-picker, [data-action="remove-evidence"]',
    )
    .forEach((el) => {
      const id = el.dataset.assignment || el.dataset.id || route;
      const qid = el.dataset.field?.startsWith('answers.') ? el.dataset.field.slice(8) : el.dataset.recoveryQuestion || el.dataset.qid;
      const progress = state.assessment?.questions?.[id]?.[qid];
      const key = `${id}:${qid}`;
      const conflict = resolvingConflicts.has(id) || (qid && conflicts.has(id));
      const checking = el.dataset.action === 'check-question';
      el.disabled = qid ? questionControlLocked(checking && pendingQuestions[key] ? { ...progress, finalized: false } : progress, { videoLocked: locked, conflict,
        busy: questionChecking.has(key) || (!checking && !!pendingQuestions[key]), recovery: !!el.dataset.recoveryQuestion || (checking && progress?.stage === 'recovery') })
        : locked || conflict || (el.dataset.action === 'submit' && (!questionsReady(state.assessment?.contracts?.[id], state.assessment?.questions?.[id]) || Object.keys(pendingQuestions).some((k) => k.startsWith(`${id}:`))));
    });
  let notice = main.querySelector("[data-watch-lock]");
  if (required.length && !notice) {
    notice = document.createElement("p");
    notice.className = "notice";
    notice.dataset.watchLock = "";
    main
      .querySelector(".lesson-video")
      ?.parentElement.insertAdjacentElement("afterend", notice);
  }
  if (notice) {
    notice.hidden = !locked;
    notice.textContent =
      "Watch the required video first to unlock the activity. Your existing answers and drafts stay saved.";
  }
}
function questions(id, include = null) {
  return content.questions[id]
    .map((q, i) => {
      if (include && !include.includes(q.id)) return "";
      const component = questionComponent(state.assessment?.contracts?.[id], q.id),
        progress = state.assessment?.questions?.[id]?.[q.id], key = `${id}:${q.id}`;
      const original = data(id).answers?.[q.id];
      const a = progress?.finalized && !progress.assisted ? (q.options ? component?.choices?.findIndex((choice) => choice.id === progress.lastAnswer) : progress.lastAnswer) : original,
        r = state.submissions[id]?.result.checks?.find((r) => r.id === q.id);
      return `<fieldset class="question" data-assessment-question="${esc(q.id)}"><legend>${i + 1}. ${esc(q.prompt)}</legend>${day>30&&q.visual?curriculumMathVisual(q.visual):""}${q.options ? q.options.map((option, index) => `<label class="choice"><input id="${id}-${q.id}-choice-${index}" type="radio" name="${id}-${q.id}" data-field="answers.${q.id}" data-assignment="${id}" data-number="true" value="${index}" ${a === index ? "checked" : ""}><span>${esc(option)}</span></label>`).join("") : `<label class="small" for="${q.id}">${progress?.stage === "recovery" || progress?.assisted ? "Last independent answer" : "Your answer · numbers, fractions, or number words"}</label><input id="${q.id}" autocomplete="off" data-assignment="${id}" data-field="answers.${q.id}" value="${esc(a ?? "")}" aria-label="${esc(q.prompt)}">`}${day>30?(q.coach?curriculumCoach(q.coach):learningMethodCoach(id,`answers.${q.id}`,q.prompt)):stageSafeQuestionCoach(id, q.id, grade, visualCoach(id, `answers.${q.id}`, grade, q.prompt), { finalized: !!progress?.finalized })}${questionAssessment({ assignment: id, component, progress, pending: !!pendingQuestions[key], busy: questionChecking.has(key), message: questionMessages.get(key), recoveryAnswer: recoveryAnswers.get(key) })}${r && !progress?.revision ? `<p class="question-result ${r.correct ? "" : "wrong"}">${r.correct ? "✓ Correct on earlier submission" : "Earlier submission feedback"} · ${esc(r.feedback)}</p>` : ""}</fieldset>`;
    })
    .join("");
}
function finish(id, requirements) {
  const submitted = state.submissions[id];
  const checked = questionsReady(state.assessment?.contracts?.[id], state.assessment?.questions?.[id]);
  return `<div class="panel"><h3>Before you submit</h3><ul class="requirements">${requirements.map((s) => `<li>${s}</li>`).join("")}${objectiveComponents(state.assessment?.contracts?.[id]).length ? '<li>Use each question’s check button and finish any required recovery choice.</li>' : ''}</ul><p class="small muted">Completion rule: finish the required activities and submit all required parts. Points measure understanding separately. Finalized question answers stay checked. Written work can be revised.</p>${!checked ? '<p class="notice">Finish checking each question before submitting this section. Checked questions count as complete even if they earn zero points.</p>' : ''}<div id="feedback">${feedback(id)}</div><div id="missing" role="alert"></div><div class="submit-bar"><button class="btn primary" data-action="submit" data-id="${id}" ${checked ? '' : 'disabled'}>${submitted ? "Submit revision" : "Submit today’s work"}</button><button class="btn quiet" data-action="save" data-id="${id}">Save draft</button><span class="save-label" role="status" data-save="${id}">${dirty.has(id) ? "Changes waiting to save" : state.drafts[id] ? (hosted ? "Saved to your account" : "Saved on this device’s preview server") : "Not started"}</span><button class="btn small quiet" data-action="export">Export my work</button></div></div>`;
}
function feedback(id) {
  const current = assessmentFeedback(state.assessment?.records?.[id], state.assessment?.contracts?.[id]);
  if (current) return current;
  const s = state.submissions[id];
  if (!s) return "";
  return `<div class="notice ${s.result.mastery === "demonstrated" ? "success" : ""}"><strong>${state.completion.sections[id] ? "✓ Today’s submission is complete." : "Your written work is submitted."}</strong><p>${!state.completion.sections[id] ? (id === "science" && s.contentVersion !== content.lessonVersions.science ? "Your earlier answers are saved. Complete the updated video questions and prediction, then submit this lesson. " : "Your submitted answers are saved. Watch the required video to complete this section. ") : ""}${esc(s.result.feedback)}</p><span class="tag">${s.result.status === "pending" ? "Written feedback pending" : s.result.mastery === "practice-needed" ? "Practice suggested" : s.result.mastery === "pending" ? "Feedback under review" : s.result.mastery === "developing" ? "Developing understanding" : "Skills checked"}</span>${s.result.criteria ? `<ul>${s.result.criteria.map((c) => `<li><strong>${esc(c.criterion)}</strong> · ${esc(c.level)}: ${esc(c.evidence)}</li>`).join("")}</ul>` : ""}${s.result.status === "pending" ? ` <button class="btn small quiet" data-action="retry" data-id="${s.id}">Check feedback</button>` : ""}</div>`;
}
function morning() {
  return dailyBattlePage(day);
}
function math() {
  const practice = renderLessonPractice(grade,day,'math',data('math'));
  if(day>30)return heading('math',content.curriculum.math.title,content.standards.math)+assignmentVideos('math')+renderCurriculumMath(content.curriculum.math)+practice+`<section class="panel"><div class="eyebrow">2 · PUT IT TO WORK</div><h2>Your question checks</h2>${questions('math')}</section>`+finish('math',content.curriculum.math.requirements);
  if (grade === 4)
    return (
      heading(
        "math",
        "Geometry starts here.",
        "Points, lines, rays, segments, line relationships, and shape families. · " +
          content.standards.math,
      ) +
      video("math") +
      geometryLesson({
        blocks: questions("math", ["m1", "m2"]),
        lines: questions("math", ["m3", "m4"]),
        shapes: questions("math", ["m5", "m6", "m7"]),
      }) +
      practice +
      finish("math", [
        "Answer all seven questions using the supplied galleries and definitions.",
        "The explorers and visual coaches are practice. Their settings do not count as answers.",
      ])
    );
  return (
    heading(
      "math",
      "Every place has a purpose.",
      "Build your foundation: place value, decimal patterns, and multiplying or dividing by powers of ten. · " +
        content.standards.math,
    ) +
    video("math") +
    `<div class="split"><section class="panel"><div class="eyebrow">1 · LEARN & EXPLORE</div><h2>Ten times as much. One tenth as much.</h2>` +
    `<p>A <strong>power of ten</strong> is made by multiplying tens: <strong>10¹ = 10</strong>, <strong>10² = 10 × 10 = 100</strong>, and <strong>10³ = 10 × 10 × 10 = 1,000</strong>. The small raised number tells how many factors of 10 there are.</p><p>A <strong>tenth</strong> is one of 10 equal parts of a whole: <strong>0.1 = 1/10</strong>. So 2.4 means 2 ones and 4 tenths. A hundredth is one of 100 equal parts: <strong>0.01 = 1/100</strong>.</p><div class="glossary"><div><strong>One place left</strong><br>A digit is worth 10 times as much.</div><div><strong>One place right</strong><br>A digit is worth one tenth as much.</div></div><p><strong>Watch the digits:</strong> the decimal point marks the boundary between ones and tenths. Moving digits to new places changes their values.</p>${powersLab()}<h3>Two jumps make a hundredfold change</h3><p><strong>Multiply:</strong> 4.2 × 10 = 42; then 42 × 10 = 420. Therefore, 4.2 × 100 = 420.</p><p><strong>Divide:</strong> 4.2 ÷ 10 = 0.42; then 0.42 ÷ 10 = 0.042. Therefore, 4.2 ÷ 100 = 0.042. The zeros hold empty places.</p><p><strong>Check the direction:</strong> for these positive numbers, ×10 makes the number larger; ÷10 makes it smaller. Reverse the change to check: 0.42 × 10 = 4.2.</p>` +
    `</section><section class="panel"><div class="eyebrow">2 · PUT IT TO WORK</div><h2>Try it yourself</h2><p class="muted">Use the place-value chart and patterns. Enter the first three answers as numbers, fractions, or number words. Then choose the statement that explains the pattern. Equivalent forms such as 0.5, .500, and one half are accepted.</p>` +
    questions("math") +
    "</section></div>" +
    practice +
    finish("math", [
      "Answer all four questions using the models and lesson.",
      "The explorer is practice; using its buttons is not a graded answer.",
    ])
  );
}
function markedParagraph(text, para) {
  const ranges = (data("reading").evidence || [])
    .filter((e) => e.para === para)
    .sort((a, b) => a.start - b.start);
  let pos = 0,
    out = "";
  for (const e of ranges) {
    if (e.end <= pos) continue;
    const start = Math.max(pos, e.start);
    out +=
      esc(text.slice(pos, start)) +
      `<mark>${esc(text.slice(start, e.end))}</mark>`;
    pos = e.end;
  }
  return out + esc(text.slice(pos));
}
function sentences() {
  return content.passage.paragraphs.flatMap((text, para) => {
    const arr = [];
    const re = /[^.!?]+[.!?]+[”"]?|[^.!?]+$/g;
    let match;
    while ((match = re.exec(text))) {
      const trim = match[0].trim(),
        start = match.index + match[0].indexOf(trim);
      if (trim) {
        const previous = arr.at(-1);
        if (previous && /\b(?:Ms|Mr|Dr)\.$/.test(previous.quote)) {
          previous.end = start + trim.length;
          previous.quote = text.slice(previous.start, previous.end);
        } else arr.push({ para, start, end: start + trim.length, quote: trim });
      }
    }
    return arr;
  });
}
function reading() {
  if(day>30)return heading('reading',content.readingTask.title,content.standards.reading)+assignmentVideos('reading')+renderCurriculumReading(content.readingTask,{field,markedParagraph,sentences,work:data('reading'),finish});
  const evidence = data("reading").evidence || [];
  return (
    heading(
      "reading",
      "Different ideas. Shared purpose.",
      `Compare Mira and Rowan using details from the story. ${content.standards.reading}`,
    ) +
    video("reading") +
    `<div class="notice"><strong>Your reading mission:</strong> Explain one way Mira and Rowan are alike and one way they are different. ${grade === 5 ? "Use two accurate quotations and explain what each shows." : "Use specific story details; you may quote or explain the details in your own words."}</div><div class="split"><section class="panel light"><div class="eyebrow" style="color:#785b3f">1 · READ THE WHOLE STORY</div><h2>${content.passage.title}</h2><p class="small muted">${content.passage.author} · Fiction</p><div class="passage" id="passage">${content.passage.paragraphs.map((p, i) => `<div class="para-row"><span class="para-number" aria-label="Paragraph ${i + 1}">${i + 1}</span><p data-para="${i}">${markedParagraph(p, i)}</p></div>`).join("")}</div><hr><p><strong>Compare</strong> means explain how things are alike and different. <strong>Evidence</strong> is a detail that supports an idea.</p><p><strong>Example of the method:</strong> If a story says a character checks a map, you could use that action to explain that the character plans ahead. Explain the connection; a copied sentence alone is not an explanation.</p></section><section><div class="panel"><div class="eyebrow">2 · COLLECT EVIDENCE</div><h2>Make the text work for you.</h2><p class="muted">Select a useful part of one paragraph. Then choose <strong>Add selected text</strong>. Or use the sentence picker below with your keyboard or touch.</p>${visualCoach("reading", "evidence-source", grade, "Selecting evidence from the story")}<div class="btn-row"><button class="btn primary" id="add-selection" data-action="add-selection">Add selected text</button></div><details><summary>Choose a sentence instead</summary><label for="sentence-picker">Exact sentence from the story</label><select id="sentence-picker">${sentences()
      .map(
        (s, i) =>
          `<option value="${i}">¶${s.para + 1} · ${esc(s.quote)}</option>`,
      )
      .join(
        "",
      )}</select><button class="btn small" data-action="add-sentence">Add this sentence</button></details><p class="small muted">Place evidence under Mira, Both, or Rowan, then explain what it shows. Your highlights and notes save with your work.</p>${evidence.length ? evidence.map((e, i) => `<article class="evidence-card"><blockquote>“${esc(e.quote)}”</blockquote><span class="small muted">Two Ways Across · paragraph ${e.para + 1}</span><label for="category-${i}">Supports an idea about</label><select id="category-${i}" data-assignment="reading" data-field="evidence.${i}.category">${["Mira", "Both", "Rowan"].map((x) => `<option ${e.category === x ? "selected" : ""}>${x}</option>`).join("")}</select>${visualCoach("reading", `evidence.${i}.category`, grade, "Choosing who this evidence supports")}${field("reading", `evidence.${i}.note`, "What does this detail show?", "Explain how it supports your idea.", 2)}<div class="btn-row"><button class="btn small" data-action="insert-quote" data-index="${i}">Insert quote in response</button><button class="btn small quiet" data-action="remove-evidence" data-index="${i}">Remove</button></div></article>`).join("") : '<div class="empty">Your evidence cards will appear here.</div>'}</div></section></div><section class="panel"><div class="eyebrow">3 · COMPARE</div><h2>Two characters. Three places for ideas.</h2><p class="muted">Write a difference in each outside column and a similarity in the middle. Use your evidence cards to support the ideas. Two different excerpts can support one shared trait.</p><div class="organizer">${["Mira", "Both", "Rowan"].map((x) => `<div>${field("reading", `claims.${x}`, x, x === "Both" ? "What do they have in common?" : `What is distinctive about ${x}’s approach?`)}</div>`).join("")}</div>${field("reading", "response", "Your comparison response", grade === 5 ? "Explain one similarity and one difference. Insert at least two exact saved quotes, then explain how they support your comparison." : "Explain one similarity and one difference with specific details. You might start: Both characters… However, Mira… while Rowan…", 6)}</section>` +
    finish("reading", [
      "Save at least two different excerpts and explain each one.",
      "Complete all three organizer columns and your comparison response.",
      grade === 5
        ? "Use two different saved quotations in quotation marks. The Insert quote button copies them accurately."
        : "Support your ideas with specific details; quotation and accurate paraphrase are both welcome.",
      "Relevance and reasoning are assessed separately from the presence of evidence.",
    ])
  );
}
function writing() {
  const is4 = grade === 4;
  const structure = content.writingProject.finalArtifact;
  if (!state.writingProject)
    return (
      heading(
        "writing",
        "An opinion worth developing.",
        `Your two-week short opinion essay · ${content.standards.writing}`,
      ) +
      topicChooser(
        content.writingProject,
        pendingWritingTopic,
        state.archivedWriting,
      )
    );
  if(day>30)return heading('writing',content.writingDay.title,`One continuing opinion essay · ${content.writingDay.phase}`)+writingMilestone({content,state,grade,field,work:data('writing'),finish});
  return (
    heading(
      "writing",
      "One opinion. An essay to develop.",
      `Your two-week short opinion essay · ${content.standards.writing}`,
    ) +
    lockedTopic(state.writingProject, content.writingProject) +
    essayGuide(structure) +
    `<div class="panel"><div class="eyebrow">ONE PROJECT · ROOM TO DEVELOP</div><h2>Your writing journey</h2><div class="timeline">${[
      ["30", "Plan"],
      ["31", "Draft"],
      ["32", "Develop reasons"],
      ["33", "Review"],
      ["35", "Revise"],
      ["36", "Edit"],
      ["37", "Publish"],
      ["38", "Reflect"],
    ]
      .map(
        ([d, t]) =>
          `<div class="milestone ${d === "30" ? "now" : ""}"><strong>Day ${d}</strong>${t}</div>`,
      )
      .join(
        "",
      )}</div><p class="caption">Your plan starts here. The writing milestones continue through Day 38.</p><div class="notice"><strong>Due today: your plan.</strong> Your final piece is not due today. ${is4 ? "Plan a three-paragraph short opinion essay. Your introduction states your opinion, your one body paragraph develops two related reasons with examples, and your conclusion gives closure." : "Plan a three-paragraph short opinion essay. Establish a clear focus, develop two related reasons with specific support and explanation in one body paragraph, and conclude in new words."}</div></div><div class="split"><section class="panel"><div class="eyebrow">1 · FIND YOUR POSITION</div><h2>What do you want readers to believe?</h2>${field("writing", "opinion", "My opinion", "Give your position on your locked writing question. You can agree, disagree, or explain when your answer changes.")}${field("writing", "audience", "My audience", "Who will read this: classmates, student leaders, or another school audience?", 2)}<details><summary>Planning help</summary><p>A reason explains <em>why</em> you hold an opinion. An example makes the reason concrete. For a different topic, “Our class should label supplies because labels save time” gives an opinion and reason. “Yesterday we found the tape quickly because its drawer had a label” gives an example.</p></details>${field("writing", "ending", "My closing idea", "How will you leave your reader thinking about your opinion?", 2)}</section><section class="panel"><div class="eyebrow">2 · BUILD YOUR SUPPORT</div><h2>Build the support for your body paragraph.</h2><p>Both reasons will help develop the same opinion in <strong>one body paragraph</strong>. Explain how each example supports its reason.</p>${field("writing", "reason1", "Reason 1", "Why should a reader agree?")}${field("writing", "example1", "Example or detail for reason 1", "Use the supplied situation, a real experience, or a clearly labeled imagined example. Explain how it supports your reason.")}${field("writing", "reason2", "Reason 2", "Add a different reason that supports the same opinion. Both reasons belong in your one body paragraph.")}${field("writing", "example2", "Example or detail for reason 2", "Give a specific detail and explain how it supports your second reason. Label imagined examples clearly.")}</section></div><section class="panel"><div class="row"><div><div class="eyebrow">YOUR LONG-TERM WORKSPACE</div><h2>Keep your whole essay here.</h2></div><button class="btn small" data-action="versions" data-id="writing">Version history</button></div><p class="muted">This is your continuing essay workspace. Your topic, plan, and draft stay together as you return and revise. Start a draft when you are ready; today’s plan stays alongside it.</p>${field("writing", "draft", "My essay draft · optional today", "Write an introduction, one body paragraph, and a conclusion. Leave a blank line between paragraphs. Your draft saves as you write.", 14)}<details class="essay-preview-toggle"><summary>Read my essay</summary><p class="small muted">This preview follows the paragraph breaks in your draft.</p><div class="essay-paper" id="essay-preview">${essayPreview(data("writing").draft)}</div></details><div id="version-list"></div><details><summary>Review your finished short essay</summary><ul><li>Does the introduction introduce the topic and clearly state your opinion?</li><li>Does your one body paragraph develop both related reasons with specific examples and explanations?</li><li>Do linking words connect your ideas within and between paragraphs?</li><li>Does your conclusion return to the opinion in new words and give closure?</li><li>Are sentences clear, complete, and useful?</li></ul><p>Today, we assess the plan. Drafting, revision, and final publication belong to later milestones.</p></details></section>` +
    finish("writing", [
      "State your opinion and identify your audience.",
      "Plan two distinct reasons, each with a supporting example.",
      "Plan your closing idea. The complete draft is optional today.",
    ])
  );
}
function science() {
  if(day>30)return heading('science',content.scienceDay.title,'Energy transfer and engineering · Individual project')+scienceMilestone({content,state,grade,field,questions,videos,finish});
  return (
    heading(
      "science",
      "Follow the energy. Protect the egg.",
      `Energy transfer & engineering · Day 1 of 8 · ${content.standards.science}`,
    ) +
    scienceLesson({ content, grade, state, field, questions, videos }) +
    finish("science", [
      "Watch the required energy video without skipping.",
      "Answer the four questions connecting the video to the egg, including conservation of energy.",
      "Choose the first, next and last pictures in the drop.",
      "Write your prediction. Connect a video example to the egg and explain where energy goes when motion stops. No equations, build or test are due today.",
    ])
  );
}
function morphology() {
  if(day>30)return heading('morphology',content.morph.title,'Word meaning · A supplied picture · Your own idea')+renderCurriculumMorphology(content.morph,{field,work:data('morphology'),finish,video:()=>video('morphology')});
  const m = content.morph;
  return (
    heading(
      "morphology",
      `A picture. A word. Your idea.`,
      `Today’s word: ${m.word} · No matched video in the retained Day 30 resources`,
    ) +
    `<div class="split"><section class="panel"><img class="art" src="/Dragonswood/learning-portal/public/assets/bridge-choices.png" alt="Two children stand safely beside a damaged garden bridge. One studies a route sketch; the other holds a spare board. Branches block part of the shallow stream."><p class="caption">Original story illustration · Use the scene to develop your own idea.</p><details><summary>Picture description</summary><p>Two children stand on solid ground beside a small garden bridge. One bridge plank is damaged. One child studies a sketch of a safe route; the other holds a spare board. Fallen branches block part of the shallow stream. Both are considering how to help.</p></details><h3>Your context</h3><p>${m.context}</p></section><section class="panel"><div class="eyebrow">WORD SPOTLIGHT</div><h2>${m.word}</h2><p>${m.meaning}</p><div class="tile-row"><span class="word-tile">${m.base}</span><span>+</span><span class="word-tile">${m.suffix}</span></div><p>${m.spelling}</p><hr><h3>Put the word to work.</h3><p>${m.prompt}</p>${field("morphology", "response", "My picture quickwrite", "Aim for a few thoughtful sentences. Length is a guide, not a grading rule. Use the target word meaningfully.", 8)}<details><summary>What makes this successful?</summary><p>Use the word with the right meaning. Connect your idea to the supplied scene or context. Give a detail that helps your reader understand. You can imagine possibilities; you do not have to guess one hidden story.</p></details></section></div>` +
    finish("morphology", [
      `Use <strong>${m.word}</strong> meaningfully in a short response connected to this picture or context.`,
      "Your word use and explanation receive written feedback. This quickwrite is separate from your full opinion piece.",
    ])
  );
}
function interviewNow() {
  return Date.now() + clockOffset;
}
function ccf() {
  return (
    heading(
      "ccf",
      "Your detective desk",
      "Recall · comprehension · evidence · your own conclusion",
    ) +
    caseDesk({
      caseFile: content.caseFile,
      grade,
      state,
      work: data("ccf"),
      field,
      questions,
      now: interviewNow,
    }) +
    finish("ccf", [
      "Finish all three 60-second interviews and save your notes.",
      "Pin at least two different evidence records and answer the three comprehension questions.",
      "Explain your finding using two records, a contradiction, and what remains unproven. This is separate from Reading and Writing.",
    ])
  );
}
async function teacher({ preserveInteraction = false } = {}) {
  const bound = profileContext();
  const result = await api(`/api/teacher?grade=${bound.grade}`);
  if (route !== "teacher" || !profileCurrent(bound)) return;
  const selectedTeacherProfile=result.profiles.find(p=>p.grade===grade);
  if(selectedTeacherProfile){state.schedule=selectedTeacherProfile.schedule;state.scienceConditions=selectedTeacherProfile.scienceConditions;}
  if (preserveInteraction && (document.activeElement?.closest("main select, main input, main textarea, main button") || document.querySelector("main details[open]"))) return;
  shell(
    `<div class="eyebrow">TEACHER VIEW${hosted?'':' · LOCAL DEMONSTRATION'}</div><h1>The same record. A clearer picture.</h1>${hosted?'<div class="notice">Review the selected student’s saved work. Use the roster above to switch students.</div>':'<div class="notice">These are this browser’s two preview profiles. They are not real student accounts.</div>'}${teacherScheduleMarkup(result.profiles)}${scienceConditionsMarkup(state.scienceConditions,{teacher:true})}${battleTeacherPanel(result.profiles)}${teacherProjectPanel(result.profiles)}<div class="panel table-wrap"><table><thead><tr><th>Assignment</th>${result.profiles.map(p=>`<th>Grade ${p.grade}${p.previewOnly?" preview":""}</th>`).join("")}</tr></thead><tbody>${Object.entries(
      names,
    )
      .map(
        ([id, n]) =>
          `<tr><th>${n}</th>${result.profiles.map((p) => `<td><strong>${p.completion.sections[id] ? "✓ Submitted" : id === "morning" && p.dailyBattle?.session ? `${p.dailyBattle.session.completedCount}/25 steps saved` : p.drafts[id] ? "Draft saved" : "Not started"}</strong><br><span class="small muted">${p.submissions[id] ? esc(p.submissions[id].result.mastery === "pending" ? "Written feedback pending" : p.submissions[id].result.mastery) : ""}</span>${teacherAssessment(p.assessment?.records?.[id], p.assessment?.contracts?.[id])}${id === "science" && p.scienceStrategy?.choice ? `<p class="small"><strong>Locked strategy:</strong> ${esc(p.scienceStrategy.choice.strategy.name)} · individual project</p>` : ""}${id === "writing" && p.writingProject ? `<p class="small"><strong>Locked topic:</strong> ${esc(p.writingProject.topic.prompt)}</p>` : ""}${p.drafts[id] ? `<details><summary>Saved work</summary><pre style="white-space:pre-wrap;font:14px/1.6 inherit">${esc(JSON.stringify(p.drafts[id].data, null, 2))}</pre></details>` : ""}</td>`).join("")}</tr>`,
      )
      .join(
        "",
      )}<tr><th>Day ${day}</th>${result.profiles.map((p) => `<td>${p.completion.done}/${p.completion.total} submitted${p.completion.complete ? " · Complete" : ""}</td>`).join("")}</tr></tbody></table></div><div class="panel"><h2>Grading connection</h2><p>${state.aiConnected ? "The grading runtime is enabled under its verified release policy." : "Live AI grading is disabled until its provider and release checks pass. Objective grading works now; written responses stay saved and pending."}</p><p>Deterministic checks → Luna → Terra → Sol. Routine high-confidence judgments finish automatically. Uncertain content and unresolved judgments are exceptional reviews. Completion comes from the saved submission, independently of those judgments.</p>${hosted?'<p class="muted">Submitted work is saved in Firebase. Confirmed grades connect to your teacher gradebook; pending grades remain separate from completion.</p>':'<p class="muted">This local preview does not write to the production gradebook.</p>'}</div>`,
  );
  bind();
  stopSchoolSchedule();
  stopSchoolSchedule=bindSchoolSchedule({root:document.querySelector('#app'),profiles:result.profiles,api,onChange:()=>teacher(),onError:toast});
  stopScienceConditions=bindScienceConditions({root:document.querySelector('#app'),conditions:state.scienceConditions,grade,api,onChange:async()=>{const next=await api(`/api/state?grade=${grade}`);state.scienceConditions=next.scienceConditions;await teacher();},onError:toast});
  bindBattleTeacher({
    day,
    api,
    onAssigned: (next) => {
      if (profileCurrent(bound) && next.state?.grade === grade)
        state.dailyBattle = next.state.dailyBattle;
    },
  });
}
function render() {
  selection = null;
  if (!content || !state) return;
  if(hosted&&route==='teacher'&&!hostedAuth.teacher())route='home';
  stopVideos();
  stopScienceStrategy();
  stopCCF();
  stopBattle();
  const views = {
    home: () => home() + assessmentTotals(state.assessment),
    math,
    morning,
    reading,
    writing,
    science,
    morphology,
    ccf,
  };
  shell(
    route === "teacher"
      ? "<h1>Opening teacher view…</h1>"
      : state.schedule?.subjects[route]?.open===false?lockedSubjectMarkup(route,state.schedule):(views[route] || home)(),
  );
  bind();
  if (route === "teacher") teacher().catch((e) => toast(e.message));
}
function renderKeepingFocus() {
  const focused = document.activeElement;
  const id = focused?.id;
  const start = focused?.selectionStart;
  const end = focused?.selectionEnd;
  render();
  if (id && focused?.dataset?.assignment) {
    const replacement = document.getElementById(id);
    replacement?.focus({ preventScroll: true });
    if (typeof start === "number") replacement?.setSelectionRange(start, end);
  }
}
function recoveryKey(id) {
  return `dw-recovery:${state.previewId || "local"}:${grade}:${id}${day===30?"":`:day${day}`}${["math", "writing", "science", "ccf"].includes(id) ? `:${id === "science" ? "egg-drop-energy-day30.1" : content.lessonVersions[id]}` : ""}`;
}
const projectBaseRevisions = new Map();
const sharedProjectFields = {
  writing: ['topicId','opinion','audience','reason1','example1','reason2','example2','ending','draft','introduction','body','conclusion','reflection'],
  science: ['prediction','design','supplies','buildNotes','testLog','analysis','improvement','finalReflection'],
};
function projectBaseRevision(id) {
  if (!sharedProjectFields[id]) return undefined;
  if (!projectBaseRevisions.has(id)) projectBaseRevisions.set(id, state.projectWork?.[id]?.revision);
  return projectBaseRevisions.get(id);
}
function sharedProjectDiffers(id, recovered, saved = state.projectWork?.[id]?.data || {}) {
  return (sharedProjectFields[id] || []).some(field => Object.hasOwn(recovered || {},field) && JSON.stringify(recovered[field]) !== JSON.stringify(saved[field]));
}
function savedAssignmentData(id, next) {
  return structuredClone({...next.drafts[id]?.data,...(sharedProjectFields[id] ? next.projectWork?.[id]?.data : {})});
}
function recoveryEnvelope(id, pending = pendingRequests[id]) {
  return { grade, day, previewId: state.previewId, revision: state.drafts[id]?.revision || 0,
    projectRevision: projectBaseRevision(id), data: data(id), ...(pending ? {pending} : {}) };
}
function questionStorageKey() {
  return `dw-question-checks:${state.previewId}:${grade}${day===30?"":`:day${day}`}`;
}
function persistQuestionRequests() {
  // A lost connection must be retried with the original identity and answer.
  // If durable browser storage is unavailable, stop before sending the check.
  localStorage.setItem(questionStorageKey(), JSON.stringify(pendingQuestions));
}
async function checkQuestion(id, qid) {
  const bound = profileContext(), key = `${id}:${qid}`;
  if (questionChecking.has(key) || resolvingConflicts.has(id) || conflicts.has(id)) return;
  if (videos.some((v) => v.assignment === id && !state.videoProgress?.[v.id]?.complete)) {
    toast('Finish the required video before checking an answer.');
    return;
  }
  questionChecking.add(key);
  updateVideoLocks();
  if ($('#grade')) $('#grade').disabled = true;
  try {
    await queueSave(id);
    if (!profileCurrent(bound)) return;
    if (dirty.has(id) || conflicts.has(id) || pendingRequests[id]) throw new Error('Save or resolve this draft before checking its answer. Your work has been kept.');
    const contract = state.assessment?.contracts?.[id];
    const component = questionComponent(contract, qid);
    const progress = state.assessment?.questions?.[id]?.[qid];
    let pending = pendingQuestions[key];
    if (!pending) {
      const answer = questionAnswer(component, data(id).answers?.[qid], progress, recoveryAnswers.get(key));
      pending = { grade: bound.grade, day: bound.day, assignment: id, questionId: qid, ...answer,
        revision: progress?.revision || 0, key: crypto.randomUUID(), contractHash: contract.contractHash };
      pendingQuestions[key] = pending;
      try { persistQuestionRequests(); } catch {
        delete pendingQuestions[key];
        throw new Error('This browser could not keep the answer-check receipt. Free some browser storage, then try again. Your answer has not been sent.');
      }
    }
    if (pending.grade !== bound.grade || (pending.day ?? 30) !== bound.day || pending.assignment !== id || pending.questionId !== qid || pending.contractHash !== contract?.contractHash)
      throw new Error('This saved check belongs to an earlier scoring version. Its receipt is kept for review; do not start a second check.');
    updateVideoLocks();
    let reply;
    try { reply = await api('/api/assessment/question', pending); }
    catch (error) {
      if (!profileCurrent(bound)) return;
      // A definitive rejection did not accept this request. Refresh the frozen
      // question state, preserving all local drafts and any other pending checks.
      if (error.status && error.status < 500) {
        delete pendingQuestions[key];
        persistQuestionRequests();
        const next = await api(`/api/state?grade=${bound.grade}&day=${bound.day}`);
        if (profileCurrent(bound) && responseMatchesProfile(next,bound)) state.assessment = next.assessment;
      }
      throw error;
    }
    if (!profileCurrent(bound)) return;
    const next = reply.state;
    if (!responseMatchesProfile(next,bound))
      throw new Error('This check returned another profile. The original check receipt has been kept for a safe retry.');
    mergeVideoProgress(next);
    state = next;
    delete pendingQuestions[key];
    persistQuestionRequests();
    recoveryAnswers.delete(key);
    const progressNow = state.assessment?.questions?.[id]?.[qid];
    const message = reply.decision?.message || (progressNow?.finalized ? 'Your question is checked and saved.' : progressNow?.stage === 'recovery' ? 'Your independent attempts are complete. Choose one final recovery answer.' : reply.decision?.kind === 'incorrect' ? 'That answer is not correct yet. Use the visual coach, then try again.' : 'No attempt was used. Check the form of your answer and try again.');
    questionMessages.set(key, message);
    toast(message);
  } catch (error) {
    if (!profileCurrent(bound)) return;
    questionMessages.set(key, pendingQuestions[key] ? 'We have not confirmed delivery yet. Your original answer is kept. Use “Retry saved answer check” to check that same answer safely.' : error.message);
    toast(error.message);
  } finally {
    questionChecking.delete(key);
    if (profileCurrent(bound)) {
      if (route === id) renderKeepingFocus();
      updateVideoLocks();
      if ($('#grade')) $('#grade').disabled = lockingTopic || loadingProfile || switchingProfile || questionChecking.size > 0;
    }
  }
}
function changed(id) {
  dirty.add(id);
  try {
    localStorage.setItem(
      recoveryKey(id),
      JSON.stringify(recoveryEnvelope(id)),
    );
  } catch {}
  document
    .querySelectorAll(`[data-save="${id}"]`)
    .forEach((e) => (e.textContent = "Saving…"));
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => queueSave(id), 700);
}
function queueSave(id, submit = false) {
  const bound = profileContext();
  const storageKey = recoveryKey(id);
  saveChain = saveChain
    .then(async () => {
      if (!profileCurrent(bound) || loadingProfile) return;
      if (conflicts.has(id) || resolvingConflicts.has(id))
        throw new Error(`Resolve the ${names[id] || id} draft conflict before saving that assignment.`);
      if (!dirty.has(id) && !submit && !pendingRequests[id]) return;
      let submitted = false;
      const recovering = !!pendingRequests[id];
      // Retry uncertain delivery with the same id before sending any newer work.
      do {
        const pending = pendingRequests[id] || {
          submit,
          payload: {
            grade: bound.grade,
            day: bound.day,
            projectRevision: projectBaseRevision(id),
            assignment: id,
            lessonVersion: content.lessonVersions[id],
            ...(submit ? { assessmentContractHash: state.assessment?.contracts?.[id]?.contractHash } : {}),
            data: structuredClone(data(id)),
            revision: state.drafts[id]?.revision || 0,
            key: crypto.randomUUID(),
          },
        };
        if (pending.payload.grade !== bound.grade || (pending.payload.day ?? 30) !== bound.day || pending.payload.assignment !== id)
          throw new Error("This saved request belongs to another profile or assignment. Its recovery copy has been kept.");
        pendingRequests[id] = pending;
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify(recoveryEnvelope(id,pending)),
          );
        } catch {}
        let next;
        try {
          next = await api(
            pending.submit ? "/api/submit" : "/api/save",
            pending.payload,
          );
        } catch (e) {
          if (!profileCurrent(bound)) return;
          if (
            e.conflict ||
            e.topicLocked ||
            e.topicRequired ||
            e.lessonChanged
          ) {
            conflicts.add(id);
            renderKeepingFocus();
          }
          if (e.missing && route === id && $("#missing"))
            $("#missing").innerHTML =
              `<div class="notice error"><strong>${esc(e.message)}</strong><ul>${e.missing.map((r) => `<li>${esc(r.label)}</li>`).join("")}</ul></div>`;
          if (e.status && e.status < 500) {
            delete pendingRequests[id];
            try {
              localStorage.setItem(
                storageKey,
                JSON.stringify(recoveryEnvelope(id,null)),
              );
            } catch {}
          }
          throw e;
        }
        if (!profileCurrent(bound)) return;
        if (!responseMatchesProfile(next,bound))
          throw new Error("The save response belongs to another preview profile. Your recovery copy has been kept.");
        const copy = pending.payload.data;
        const hasNewEdits = JSON.stringify(data(id)) !== JSON.stringify(copy);
        const nextProjectRevision = next.projectWork?.[id]?.revision;
        const interveningProjectChange = sharedProjectFields[id] && hasNewEdits &&
          ((Number.isInteger(pending.payload.projectRevision) && Number.isInteger(nextProjectRevision) && nextProjectRevision > pending.payload.projectRevision + 1) ||
            (pending.payload.projectRevision === undefined && Number(next.projectWork?.[id]?.sourceDay)>30)) &&
          sharedProjectDiffers(id,data(id),next.projectWork[id].data);
        mergeVideoProgress(next);
        state = next;
        if (sharedProjectFields[id] && !interveningProjectChange) projectBaseRevisions.set(id,nextProjectRevision);
        delete pendingRequests[id];
        submitted ||= pending.submit;
        if (!hasNewEdits) {
          if (sharedProjectFields[id]) work[id] = savedAssignmentData(id,next);
          dirty.delete(id);
          localStorage.removeItem(storageKey);
        } else {
          dirty.add(id);
          try {
            localStorage.setItem(
              storageKey,
              JSON.stringify(recoveryEnvelope(id,null)),
            );
          } catch {}
        }
        if (interveningProjectChange) {
          conflicts.add(id);
          renderKeepingFocus();
          throw new Error('The continuing project changed again while your save was being confirmed. Your newer text is kept; export it and load the latest saved project before continuing.');
        }
        if (submit && !pending.submit && !dirty.has(id)) dirty.add(id);
      } while (dirty.has(id) && profileCurrent(bound) && !conflicts.has(id));
      document
        .querySelectorAll(`[data-save="${id}"]`)
        .forEach((e) => (e.textContent = "All changes saved"));
      if (submitted && route === id) {
        render();
        toast(state.completion.sections[id] ? "Submitted. Your section is complete." : "Submitted and saved. Finish the remaining required activity to complete this section.");
      } else if (recovering) toast("Connection restored. Your draft is saved.");
    })
    .catch((e) => {
      if (!profileCurrent(bound)) return;
      toast(e.message);
      document
        .querySelectorAll(`[data-save="${id}"]`)
        .forEach(
          (el) =>
            (el.textContent =
              "Not saved yet · Your draft is kept in this browser"),
        );
    });
  return saveChain;
}
async function flush() {
  clearTimeout(saveTimer);
  for (const id of new Set([...dirty, ...Object.keys(pendingRequests)])) {
    if (!conflicts.has(id) && !resolvingConflicts.has(id)) await queueSave(id);
  }
  await saveChain;
}
async function exportWork() {
  const exportGrade = grade;
  const exportDay = day;
  const exportState = structuredClone(state);
  const exportWorkData = structuredClone(work);
  let battleHistory;
  try {
    battleHistory = await api(`/api/battle/export?grade=${exportGrade}`);
  } catch {
    battleHistory = {
      savedSummary: exportState.dailyBattle,
      exportUnavailable: true,
    };
  }
  const blob = new Blob(
      [
        JSON.stringify(
          {
            grade: exportGrade,
            day: exportDay,
            exportedAt: new Date().toISOString(),
            work: exportWorkData,
            dailyBattle: battleHistory,
            archivedMorning: exportState.archivedMorning,
            pendingBattleAnswer: localStorage.getItem(
              `dw-daily-battle-pending:${exportState.previewId}:${exportGrade}${exportDay===30?'':`:day${exportDay}`}`,
            ),
            allPendingBattleAnswers: Object.keys(localStorage).filter(key=>key===`dw-daily-battle-pending:${exportState.previewId}:${exportGrade}`||key.startsWith(`dw-daily-battle-pending:${exportState.previewId}:${exportGrade}:day`)).map(key=>({key,data:localStorage.getItem(key)})),
            unsentBattleAnswers: Object.keys(localStorage)
              .filter((key) =>
                key.startsWith(
                  `dw-daily-battle-unsent:${exportState.previewId}:${exportGrade}:`,
                ),
              )
              .map((key) => ({ key, data: localStorage.getItem(key) })),
            earlierBrowserMorning: localStorage.getItem(
              `dw-recovery:${exportState.previewId || "local"}:${exportGrade}:morning`,
            ),
            writingProject: exportState.writingProject,
            assessment: exportState.assessment,
            pendingQuestionChecks: structuredClone(pendingQuestions),
            archivedWriting: exportState.archivedWriting,
            earlierBrowserWriting: localStorage.getItem(
              `dw-recovery:${exportState.previewId || "local"}:${exportGrade}:writing`,
            ),
            archivedMath: exportState.archivedMath,
            archivedScience: exportState.archivedScience,
            archivedCCF: exportState.archivedCCF,
            earlierBrowserCCF: localStorage.getItem(
              `dw-recovery:${exportState.previewId || "local"}:${exportGrade}:ccf`,
            ),
            earlierBrowserScience: localStorage.getItem(
              `dw-recovery:${exportState.previewId || "local"}:${exportGrade}:science`,
            ),
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    ),
    url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dragonswood-day30-grade${exportGrade}-work.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("A copy of your work has been exported.");
}
function exportAssignment(id) {
  const payload = { grade, day, assignment: id, exportedAt: new Date().toISOString(),
    lessonVersion: content.lessonVersions[id], data: structuredClone(data(id)),
    revision: state.drafts[id]?.revision || 0, projectRevision: projectBaseRevision(id), pendingRequest: structuredClone(pendingRequests[id] || null),
    browserRecovery: localStorage.getItem(recoveryKey(id)),
    ...(id === "writing" ? { writingProject: structuredClone(state.writingProject) } : {}) };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `dragonswood-day${day}-grade${grade}-${id}-draft.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function resolveConflict(id) {
  if (!conflicts.has(id) || resolvingConflicts.has(id)) return;
  const bound = profileContext();
  resolvingConflicts.add(id);
  document.querySelectorAll(`[data-assignment="${id}"], [data-action="reload-saved"][data-id="${id}"]`).forEach((element) => { element.disabled = true; });
  try {
    await saveChain;
    if (!profileCurrent(bound)) return;
    exportAssignment(id);
    const next = await api(`/api/state?grade=${bound.grade}&day=${bound.day}`);
    if (!profileCurrent(bound)) return;
    if (!responseMatchesProfile(next,bound))
      throw new Error("The saved draft belongs to a different preview profile. Your work has been kept.");
    // Only this assignment is replaced. Unrelated in-memory edits, requests,
    // revisions, and recovery copies remain untouched and can keep saving.
    if (next.drafts[id]) state.drafts[id] = structuredClone(next.drafts[id]);
    else delete state.drafts[id];
    if (next.submissions[id]) state.submissions[id] = structuredClone(next.submissions[id]);
    else delete state.submissions[id];
    state.assessment = next.assessment;
    const accessChanged=JSON.stringify(state.schedule?.subjects)!==JSON.stringify(next.schedule?.subjects);
    state.schedule=next.schedule;
    state.scienceConditions=next.scienceConditions;
    state.adventurer=next.adventurer;
    if (id === "writing") state.writingProject = structuredClone(next.writingProject);
    if (id === "science") state.scienceStrategy = structuredClone(next.scienceStrategy);
    if (sharedProjectFields[id]) {
      state.projectWork ||= {};
      if (next.projectWork?.[id]) state.projectWork[id] = structuredClone(next.projectWork[id]);
      else delete state.projectWork[id];
      projectBaseRevisions.set(id,next.projectWork?.[id]?.revision);
      if (id === 'science') state.projectReviews = structuredClone(next.projectReviews);
    }
    if (id === "ccf") state.interviews = structuredClone(next.interviews);
    work[id] = savedAssignmentData(id,next);
    delete pendingRequests[id];
    dirty.delete(id);
    conflicts.delete(id);
    localStorage.removeItem(recoveryKey(id));
    state.completion.sections[id] = !!next.completion.sections[id];
    state.completion.done = Object.values(state.completion.sections).filter(Boolean).length;
    state.completion.complete = state.completion.done === state.completion.total;
    renderKeepingFocus();
    toast(`${names[id] || id} draft exported. Its saved version is loaded; your other work is unchanged.`);
  } finally {
    resolvingConflicts.delete(id);
    if (profileCurrent(bound)) {
      document.querySelectorAll(`[data-action="reload-saved"][data-id="${id}"]`).forEach((element) => { element.disabled = false; });
      updateVideoLocks();
    }
  }
}
function addEvidence(e) {
  if (!e) {
    toast(
      "Select text inside one story paragraph, or use the sentence picker.",
    );
    return;
  }
  const d = data("reading");
  d.evidence ||= [];
  if (
    d.evidence.some(
      (x) => x.para === e.para && x.start === e.start && x.end === e.end,
    )
  ) {
    toast("That excerpt is already in your evidence cards.");
    return;
  }
  d.evidence.push({
    ...e,
    id: crypto.randomUUID(),
    source: content.passage.id,
    version: content.passage.version,
    category: content.readingTask?.evidenceCategories?.[0]?.id || "Both",
    note: "",
  });
  changed("reading");
  selection = null;
  render();
  document
    .querySelectorAll(".evidence-card textarea")
    .item(d.evidence.length - 1)
    ?.focus();
  toast("Evidence saved to your workspace. Add a note explaining it.");
}
function captureSelection({ preserveCollapsed = false } = {}) {
  const s = window.getSelection();
  if (!s?.rangeCount || s.isCollapsed) {
    if (!preserveCollapsed) selection = null;
    return;
  }
  selection = null;
  if (route !== 'reading') return;
  const range = s.getRangeAt(0);
  const node =
    range.startContainer.nodeType === 3
      ? range.startContainer.parentElement
      : range.startContainer;
  const para = node?.closest?.("[data-para]");
  if (!para || para.closest('#passage') !== document.getElementById('passage') || !para.contains(range.endContainer)) return;
  const before = document.createRange();
  before.selectNodeContents(para);
  before.setEnd(range.startContainer, range.startOffset);
  let start = before.toString().length,
    end = start + range.toString().length;
  const text = content.passage.paragraphs[Number(para.dataset.para)];
  if (typeof text !== 'string' || text.slice(start,end) !== range.toString()) return;
  while (start < end && /\s/.test(text[start])) start++;
  while (end > start && /\s/.test(text[end - 1])) end--;
  if (end > start)
    selection = {
      para: Number(para.dataset.para),
      start,
      end,
      quote: text.slice(start, end),
    };
}
function bindPassageSelection() {
  selection = null;
  const passage = document.getElementById('passage'), bound = profileContext();
  if (route !== 'reading' || !passage) return;
  const capture = () => {
    if (profileCurrent(bound) && document.getElementById('passage') === passage) captureSelection();
  };
  for (const event of ['pointerup','keyup','touchend']) passage.addEventListener(event,capture);
  document.getElementById('add-selection')?.addEventListener('pointerdown',capture);
}
function bind() {
  stopScienceConditions();
  stopPortalIdentity();stopSchoolSchedule();
  const identityProfile=profileContext();
  stopPortalIdentity=bindPortalIdentity({root:document.querySelector('#app'),profile:state.adventurer,onError:toast,onSave:async payload=>{
    const next=await api('/api/adventurer/select',{...payload,grade:identityProfile.grade,day:identityProfile.day});
    if(profileCurrent(identityProfile)){state.adventurer=next.adventurer;renderKeepingFocus();}return next;
  }});
  stopVideos();
  stopScienceStrategy();
  stopCCF();
  stopBattle();
  const boundGrade = grade, boundDay=day;
  const boundApi=(path,body)=>api(path+(path.includes("?")?"&":"?")+"day="+boundDay,body?{...body,day:boundDay}:undefined);
  const boundProfile = profileContext();
  if (route === "morning")
    stopBattle = bindDailyBattle({
      grade: boundGrade,
      day: boundDay,
      previewId: state.previewId,
      appearance:state.adventurer,
      api:boundApi,
      onExport: exportWork,
      onState: (next) => {
        if (!profileCurrent(boundProfile)) return;
        state.dailyBattle = next.dailyBattle;
        state.submissions = next.submissions;
        state.completion = next.completion;
        state.schedule = next.schedule;
        document.querySelectorAll(".nav-link").forEach((a) => {
          const label = a.querySelector(".nav-status");
          if (label)
            label.textContent = state.completion.sections[a.hash.slice(1)]
              ? "✓"
              : "";
        });
      },
    });
  stopScienceStrategy = bindScienceStrategy({
    grade: boundGrade,
    initial: state.scienceStrategy,
    api:boundApi,
    onChange: (next) => {
      if (profileCurrent(boundProfile)) state.scienceStrategy = next;
    },
  });
  stopVideos = bindLessonVideos({
    grade,
    api:boundApi,
    onProgress: (id, p) => {
      if (!profileCurrent(boundProfile)) return;
      state.videoProgress ||= {};
      const wasComplete = state.videoProgress[id]?.complete;
      state.videoProgress[id] = p;
      updateVideoLocks();
      if (p.complete && !wasComplete)
        api(`/api/state?grade=${boundGrade}`)
          .then((next) => {
            if (!profileCurrent(boundProfile)) return;
            state.completion = next.completion;
            document.querySelectorAll(".nav-link").forEach((a) => {
              const label = a.querySelector(".nav-status");
              if (label)
                label.textContent = state.completion.sections[a.hash.slice(1)]
                  ? "✓"
                  : "";
            });
          })
          .catch(() => {});
    },
  });
  updateVideoLocks();
  bindPassageSelection();
  if (route === "ccf")
    stopCCF = bindCaseDesk({
      caseFile: content.caseFile,
      grade: boundGrade,
      getWork: () => data("ccf"),
      patch: (changes) => {
        if (!profileCurrent(boundProfile) || resolvingConflicts.has("ccf")) return;
        Object.assign(data("ccf"), changes);
        changed("ccf");
      },
      api:boundApi,
    });
  bindCurriculumDays(document);
  bindLessonPractice(document,{grade,day,getWork:data,patch:(id,practice)=>{
    if(!profileCurrent(boundProfile)||loadingProfile||resolvingConflicts.has(id))return;
    data(id).practice=practice;changed(id);
  }});
  bindProjectDayEditors(document);
  document.querySelectorAll("[data-project-approve]").forEach(button=>button.addEventListener("click",async()=>{const g=Number(button.dataset.projectApprove),status=document.querySelector(`[data-project-review-status="${g}"]`);button.disabled=true;try{const reply=await boundApi("/api/project/review",{grade:g,kind:document.querySelector(`#review-kind-${g}`).value,note:document.querySelector(`#review-note-${g}`).value,approved:true,confirmed:true});status.textContent="Teacher review saved.";if(g===grade)state.projectReviews=reply.reviews;}catch(error){status.textContent=error.message;}finally{button.disabled=false;}}));
  bindEssayPreview(document);
  $("#topic-agreement")?.addEventListener("change", (e) => {
    document.querySelector('[data-action="confirm-topic"]').disabled =
      !e.target.checked || lockingTopic;
  });
  if (lockingTopic)
    document
      .querySelectorAll(
        '[data-action="choose-topic"], [data-action="confirm-topic"], #topic-agreement',
      )
      .forEach((el) => (el.disabled = true));
  bindVisualCoaches(document);
  bindPowersLab(document);
  bindGeometryLab(document);
  bindEggEnergy(document);
  document.querySelectorAll('[data-recovery-question]').forEach((el) => el.addEventListener('change', () => {
    const id = el.dataset.assignment, qid = el.dataset.recoveryQuestion, key = `${id}:${qid}`;
    if (!profileCurrent(boundProfile) || loadingProfile || el.disabled || questionChecking.has(key) || pendingQuestions[key]) return;
    recoveryAnswers.set(key, el.value);
  }));
  document.querySelectorAll("[data-field]").forEach((el) =>
    el.addEventListener(
      el.tagName === "SELECT" || el.type === "radio" ? "change" : "input",
      () => {
        const id = el.dataset.assignment,
          path = el.dataset.field.split(".");
        if (!profileCurrent(boundProfile) || loadingProfile || resolvingConflicts.has(id) || el.disabled) return;
        if (path[0] === 'answers' && questionControlLocked(state.assessment?.questions?.[id]?.[path[1]], { busy: questionChecking.has(`${id}:${path[1]}`) || !!pendingQuestions[`${id}:${path[1]}`] })) return;
        let o = data(id);
        for (let i = 0; i < path.length - 1; i++)
          o = o[path[i]] ??= /^\d+$/.test(path[i + 1]) ? [] : {};
        o[path.at(-1)] = el.dataset.number ? Number(el.value) : el.value;
        if(id==="writing"&&day>30&&["introduction","body","conclusion"].includes(path[0]))data(id).draft=["introduction","body","conclusion"].map(k=>data(id)[k]||"").join("\n\n");
        changed(id);
      },
    ),
  );
  document
    .querySelectorAll("[data-action]")
    .forEach((el) =>
      el.addEventListener("click", () =>
        profileCurrent(boundProfile) && action(el).catch((e) => { if (profileCurrent(boundProfile)) toast(e.message); }),
      ),
    );
}
async function action(el) {
  if (loadingProfile) return;
  const actionProfile = profileContext();
  const a = el.dataset.action,
    id = el.dataset.id;
  if (a === 'check-question') {
    await checkQuestion(id, el.dataset.qid);
    return;
  }
  if (["choose-topic", "back-to-topics", "confirm-topic"].includes(a)) {
    if (lockingTopic || state.writingProject) return;
    if (a !== "confirm-topic") {
      pendingWritingTopic = a === "choose-topic" ? id : null;
      render();
      (document.querySelector("#topic-confirm-heading") || $("#main"))?.focus();
      window.scrollTo(0, 0);
      return;
    }
    if (!$("#topic-agreement")?.checked || id !== pendingWritingTopic) return;
    lockingTopic = true;
    el.disabled = true;
    $("#grade").disabled = true;
    $("#topic-agreement").disabled = true;
    $("#topic-lock-status").textContent = "Saving your topic…";
    let next,
      message = day===30 ? "Your topic is locked. Start building your plan." : "Your topic is locked. Continue today’s writing milestone.";
    try {
      await flush();
      if (!profileCurrent(actionProfile)) return;
      if (dirty.size || conflicts.has("writing"))
        throw new Error(
          "Save or export your current work before confirming a topic.",
        );
      try {
        next = await api("/api/writing/topic", {
          grade,
          projectId: content.writingProject.id,
          topicVersion: content.writingProject.topicVersion,
          topicId: id,
          confirmed: true,
        });
      } catch (error) {
        if (error.topicLocked && error.state) {
          next = error.state;
          message =
            "A topic was already confirmed in another tab. Your saved topic and work are here.";
        } else throw error;
      }
      if (!profileCurrent(actionProfile)) return;
      state = next;
      work.writing = structuredClone(state.drafts.writing.data);
      pendingWritingTopic = null;
      lockingTopic = false;
      render();
      $("#main")?.focus();
      window.scrollTo(0, 0);
      toast(message);
    } catch (error) {
      if ($("#topic-lock-status"))
        $("#topic-lock-status").textContent =
          "Confirmation has not been verified. Try again; we will check for an already saved choice.";
      throw error;
    } finally {
      lockingTopic = false;
      if ($("#grade")) $("#grade").disabled = loadingProfile || switchingProfile;
      if ($("#topic-agreement")) {
        $("#topic-agreement").disabled = false;
        el.disabled = !$("#topic-agreement").checked;
      }
    }
    return;
  }
  if(a==="open-day"){const selector=$("#day");selector.value=el.dataset.day;selector.dispatchEvent(new Event("change"));return;}
  if (a === "save") {
    await queueSave(id);
    return;
  }
  if (a === "submit") {
    if (!questionsReady(state.assessment?.contracts?.[id], state.assessment?.questions?.[id]) || Object.keys(pendingQuestions).some((key) => key.startsWith(`${id}:`))) {
      toast('Finish checking each question and any required recovery choice before submitting.');
      return;
    }
    el.disabled = true;
    await queueSave(id, true);
    updateVideoLocks();
    return;
  }
  if (a === "export") {
    await exportWork();
    return;
  }
  if (a === "export-conflict") {
    exportAssignment(id);
    toast(`${names[id] || id} draft exported.`);
    return;
  }
  if (a === "reload-saved") {
    await resolveConflict(id);
    return;
  }
  if (a === "retry") {
    await api("/api/retry", { grade: actionProfile.grade, id });
    if (!profileCurrent(actionProfile)) return;
    toast(
      state.aiConnected
        ? "Feedback check requested."
        : "Your work is saved. Written grading is waiting for its API connection.",
    );
    return;
  }
  if (a === "add-selection") {
    captureSelection({preserveCollapsed:true});
    addEvidence(selection);
    return;
  }
  if (a === "add-sentence") {
    addEvidence(sentences()[Number($("#sentence-picker").value)]);
    return;
  }
  if (a === "remove-evidence") {
    data("reading").evidence.splice(Number(el.dataset.index), 1);
    changed("reading");
    render();
    $("#add-selection")?.focus();
    return;
  }
  if (a === "insert-quote") {
    const e = data("reading").evidence[Number(el.dataset.index)];
    data("reading").response =
      (data("reading").response || "") +
      ` “${e.quote}” (paragraph ${e.para + 1}) `;
    changed("reading");
    render();
    const responseBox = $("#reading-response");
    responseBox?.focus();
    responseBox?.setSelectionRange(
      responseBox.value.length,
      responseBox.value.length,
    );
    toast("Exact quote inserted. Explain what it shows.");
    return;
  }
  if (a === "strategy") {
    data("science").strategy = id;
    changed("science");
    render();
    return;
  }
  if (a === "interview") {
    const interviewGrade = grade,
      caseId = content.caseFile.id,
      caseVersion = content.caseFile.version;
    await flush();
    if (!profileCurrent(actionProfile)) return;
    if (conflicts.has("ccf") || dirty.has("ccf") || pendingRequests.ccf) {
      toast("Save or export your notes before opening the next interview.");
      return;
    }
    if (
      !profileCurrent(actionProfile) || grade !== interviewGrade ||
      content.caseFile.id !== caseId ||
      content.caseFile.version !== caseVersion
    )
      return;
    const next = await api("/api/interview", {
      grade: interviewGrade,
      witness: id,
      caseId,
      caseVersion,
    });
    if (
      !profileCurrent(actionProfile) || grade !== interviewGrade ||
      content.caseFile.id !== caseId ||
      content.caseFile.version !== caseVersion
    )
      return;
    state = next;
    clockOffset = state.serverTime - Date.now();
    render();
    document.querySelector(".ccf-statement h3")?.focus();
    document
      .querySelector(".ccf-statement")
      ?.scrollIntoView({ block: "center" });
    return;
  }
  if (a === "versions") {
    const versions = await api(`/api/versions?grade=${actionProfile.grade}&assignment=${id}`);
    if (!profileCurrent(actionProfile) || !$("#version-list") || route !== id) return;
    $("#version-list").innerHTML = versions.length
      ? `<h3>Recover a saved version</h3>${versions.map((v, i) => `<details><summary>${new Date(v.created).toLocaleString()} · ${esc(v.reason)}</summary><pre style="white-space:pre-wrap;font:14px/1.7 inherit">${esc(JSON.stringify(v.data, null, 2))}</pre><button class="btn small" data-restore="${i}">Restore this version as a new draft</button></details>`).join("")}`
      : '<p class="muted">Previous versions appear after later saves. Your current draft is already saved.</p>';
    document.querySelectorAll("[data-restore]").forEach((b) =>
      b.addEventListener("click", async () => {
        if (!profileCurrent(actionProfile)) return;
        const restored = versions[Number(b.dataset.restore)].data;
        if (
          id === "writing" &&
          restored.topicId !== state.writingProject?.topicId
        ) {
          toast(
            "This version belongs to a different topic. Your current draft has been kept.",
          );
          return;
        }
        work[id] = structuredClone(restored);
        changed(id);
        await queueSave(id);
        if (!profileCurrent(actionProfile)) return;
        render();
        toast(
          "Version restored as a new draft. Existing submissions remain complete.",
        );
      }),
    );
    return;
  }
}
async function load() {
  selection = null;
  const loadGrade = grade, loadDay=day;
  const generation = ++profileGeneration;
  loadingProfile = true;
  if ($("#grade")) $("#grade").disabled = true;
  try {
    const boot = await api(`/api/bootstrap?grade=${loadGrade}&day=${loadDay}`);
    if (generation !== profileGeneration || grade !== loadGrade || day !== loadDay) return;
    if (boot.content.grade !== loadGrade || boot.state.grade !== loadGrade || boot.content.day !== loadDay || (boot.state.day??30) !== loadDay)
      throw new Error("The server returned a different grade or day. Your saved work has not been changed.");
    content = boot.content;
    videos = boot.videoLessons;
    state = boot.state;
    const display=state.assessment?.assignmentDisplay;
    if(display?.science&&day>30){content.questions.science=display.science.questions;content.scienceDay.questions=display.science.questions;content.scienceDay.version=display.science.lessonVersion;content.lessonVersions.science=display.science.lessonVersion;}
    if(display?.writing&&day>30)content.lessonVersions.writing=display.writing.lessonVersion;
    clockOffset = state.serverTime - Date.now();
    work = {};
    pendingWritingTopic = null;
    pendingRequests = {};
    questionMessages.clear();
    recoveryAnswers.clear();
    questionChecking.clear();
    pendingQuestions = {};
    try {
      const savedChecks = JSON.parse(localStorage.getItem(questionStorageKey()) || '{}');
      if (savedChecks && typeof savedChecks === 'object' && !Array.isArray(savedChecks)) pendingQuestions = savedChecks;
    } catch (error) {
      throw new Error('The saved answer-check receipts could not be loaded. They have been kept in this browser for recovery.');
    }
    dirty.clear();
    conflicts.clear();
    projectBaseRevisions.clear();
    for (const id of content.assignments) {
      if (id === "morning") continue;
      work[id] = structuredClone(state.drafts[id]?.data || {});
      if (sharedProjectFields[id]) projectBaseRevisions.set(id,state.projectWork?.[id]?.revision);
      const saved = localStorage.getItem(recoveryKey(id));
      if (saved) {
        try {
          const r = JSON.parse(saved);
          if ((r.grade !== undefined && r.grade !== loadGrade) || (r.day !== undefined && r.day !== loadDay) ||
              (r.previewId !== undefined && r.previewId !== state.previewId)) conflicts.add(id);
          if (
            id === "science" &&
            r.pending?.payload?.lessonVersion !== content.lessonVersions.science
          )
            delete r.pending;
          if (
            id === "writing" &&
            r.data?.topicId !== state.writingProject?.topicId
          )
            conflicts.add(id);
          if (
            !r.pending &&
            r.revision !== (state.drafts[id]?.revision || 0) &&
            JSON.stringify(r.data) !== JSON.stringify(work[id])
          )
            conflicts.add(id);
          if (r.pending?.payload?.grade !== undefined && r.pending.payload.grade !== loadGrade)
            conflicts.add(id);
          if (r.pending && ((r.pending.payload.day ?? 30) !== loadDay || r.pending.payload.assignment !== id)) conflicts.add(id);
          if (sharedProjectFields[id]) {
            const recoveredRevision = r.projectRevision ?? r.pending?.payload?.projectRevision;
            if (r.pending) {
              // An uncertain delivery must replay its original receipt. Do not
              // rewrite its expected revision to match a newer server snapshot.
              projectBaseRevisions.set(id,recoveredRevision);
            } else if ((loadDay>30 || Number(state.projectWork?.[id]?.sourceDay)>30 || recoveredRevision !== undefined) &&
                (recoveredRevision === undefined || recoveredRevision !== state.projectWork?.[id]?.revision) && sharedProjectDiffers(id,r.data)) {
              conflicts.add(id);
              projectBaseRevisions.set(id,recoveredRevision);
            }
          }
          if (r.pending) pendingRequests[id] = r.pending;
          work[id] = r.data;
          dirty.add(id);
        } catch {}
      }
      if (loadDay===30 && sharedProjectFields[id] && !pendingRequests[id] &&
          Number(state.projectWork?.[id]?.sourceDay)>30 && sharedProjectDiffers(id,work[id])) {
        // Day 30 keeps its historical server draft. Never silently pair those
        // older project fields with the revision of a newer continuing project.
        conflicts.add(id);
        dirty.add(id);
      }
    }
    document.title = `Dragonswood · Day ${day} · Grade ${grade}`;
    render();
    if (dirty.size)
      toast(
        "Recovered an unfinished draft from this browser. Save it when ready.",
      );
  } catch (e) {
    if (generation !== profileGeneration || grade !== loadGrade || day !== loadDay) return;
    $("#app").innerHTML =
      `<main class="loading"><h1>We couldn’t open your quest.</h1><p>${esc(e.message)}</p><a class="btn" href="/">Try again</a></main>`;
  } finally {
    if (generation === profileGeneration && grade === loadGrade && day === loadDay) {
      loadingProfile = false;
      if ($("#day")) $("#day").disabled = lockingTopic || switchingProfile;
      if ($("#grade")) $("#grade").disabled = lockingTopic || switchingProfile;
    }
  }
}
window.addEventListener("hashchange", () => {
  flush();
  route = location.hash.slice(1) || "home";
  render();
  window.scrollTo(0, 0);
});
$(".skip").addEventListener("click", (e) => {
  e.preventDefault();
  $("#main")?.focus();
});
window.addEventListener("beforeunload", (e) => {
  if (dirty.size || questionChecking.size || Object.keys(pendingQuestions).length) {
    e.preventDefault();
    e.returnValue = "";
  }
});
window.addEventListener("online", () => {
  if (!loadingProfile) flush();
});
setInterval(() => {
  if (route !== "ccf" || !state) return;
  const active = Object.values(state.interviews).find((x) => !x.complete);
  if (!active) return;
  const remaining = Math.max(
    0,
    Math.ceil((active.ends - interviewNow()) / 1000),
  );
  if ($("#timer")) $("#timer").textContent = `${remaining}s remaining`;
  if (!remaining) {
    const focused = document.activeElement,
      fieldId = focused?.id,
      start = focused?.selectionStart,
      end = focused?.selectionEnd;
    active.complete = true;
    render();
    if (fieldId && focused?.dataset.assignment === "ccf") {
      const replacement = document.getElementById(fieldId);
      replacement?.focus();
      if (typeof start === "number") replacement?.setSelectionRange(start, end);
    }
  }
}, 500);
setInterval(async () => {
  if (!state || loadingProfile || switchingProfile || lockingTopic || questionChecking.size) return;
  try {
    const bound = profileContext();
    const next = await api(`/api/state?grade=${bound.grade}`);
    if (!profileCurrent(bound) || loadingProfile || switchingProfile || lockingTopic || questionChecking.size) return;
    if (!responseMatchesProfile(next,bound)) return;
    if (!state.writingProject && next.writingProject && !dirty.has("writing") && !conflicts.has("writing") && !pendingRequests.writing) {
      state.writingProject = next.writingProject;
      state.drafts.writing = next.drafts.writing;
      work.writing = structuredClone(next.drafts.writing.data);
      pendingWritingTopic = null;
      if (route === "writing") {
        render();
        toast("Your confirmed topic has been loaded from the saved project.");
      }
    }
    mergeVideoProgress(next);
    state.videoProgress = next.videoProgress;
    const questionStateChanged = JSON.stringify(state.assessment?.questions?.[route]) !== JSON.stringify(next.assessment?.questions?.[route]);
    const assessmentChanged = JSON.stringify(state.assessment?.records) !== JSON.stringify(next.assessment?.records);
    state.assessment = next.assessment;
    updateVideoLocks();
    const accessChanged=JSON.stringify(state.schedule?.subjects)!==JSON.stringify(next.schedule?.subjects);
    state.schedule=next.schedule;state.adventurer=next.adventurer;state.scienceConditions=next.scienceConditions;
    const overviewChanged = JSON.stringify(state.completion) !== JSON.stringify(next.completion) || JSON.stringify(state.submissions) !== JSON.stringify(next.submissions);
    state.submissions = next.submissions;
    state.completion = next.completion;
    document.querySelectorAll(".nav-link").forEach((a) => {
      const label = a.querySelector(".nav-status");
      if (label) label.textContent = state.completion.sections[a.hash.slice(1)] ? "✓" : "";
    });
    // Home has no editing controls. Teacher polling waits until focus is outside
    // its controls and no saved-work disclosure is open, preserving interaction.
    if ((overviewChanged || assessmentChanged || accessChanged) && route === "home") render();
    else if(accessChanged&&names[route])renderKeepingFocus();
    else if (questionStateChanged && ['math', 'science', 'ccf'].includes(route)) renderKeepingFocus();
    if (route === "teacher" && !document.activeElement?.closest("main select, main input, main textarea, main button") && !document.querySelector("main details[open]")) {
      teacher({ preserveInteraction: true }).catch(() => {});
    }
    if ($("#feedback")) {
      $("#feedback").innerHTML = feedback(route);
      $("#feedback")
        .querySelectorAll("[data-action]")
        .forEach((el) =>
          el.addEventListener("click", () =>
            action(el).catch((e) => toast(e.message)),
          ),
        );
    }
  } catch {}
}, 15000);
if(hosted){
  const {startHostedAuth}=await import('./hosted-auth.js');
  hostedAuth=await startHostedAuth({config:runtimeConfig,
    onClear:()=>{clearTimeout(saveTimer);profileGeneration++;stopVideos();stopScienceStrategy();stopCCF();stopBattle();stopSchoolSchedule();stopPortalIdentity();stopScienceConditions();content=null;state=null;work={};dirty.clear();conflicts.clear();pendingRequests={};pendingQuestions={};questionChecking.clear();loadingProfile=false;},
    beforeSwitch:async()=>{await flush();if(dirty.size||conflicts.size||questionChecking.size||Object.keys(pendingRequests).length||Object.keys(pendingQuestions).length)throw Error('Save or resolve your current work before switching accounts.');},
    onReady:async session=>{grade=session.student.grade;day=TEACHING_DAYS.includes(session.teachingDay)?session.teachingDay:30;await load();},onError:toast});
  hostedAuth.start();
}else await load();
