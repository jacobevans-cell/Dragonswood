(function () {
  "use strict";

  const courses = window.DRAGON_TONGUES_COURSES;
  const packagedVoiceLibrary = window.DRAGON_TONGUES_VOICE_LIBRARY || { schemaVersion: 1, clips: {}, coverage: {} };
  const packagedAslLibrary = window.DRAGON_TONGUES_ASL_VIDEO_LIBRARY || { schemaVersion: 1, clips: {} };
  const academicEngine = window.DRAGON_TONGUES_ACADEMIC_ENGINE;
  const APP_VERSION = "1.5.4";
  const BUILD_ID = "v1.5.4-teach-me-2026-08-29";
  const STORAGE_KEY = "dragonswood-dragon-tongues-v1";
  const previewParams=new URLSearchParams(location.search),safeDatePreview=previewParams.get("dw-safe-preview")==="1"&&/^\d{4}-\d{2}-\d{2}$/.test(String(previewParams.get("date")||""));
  const ASL_READY_LICENSES = new Set(["OWNED", "CC0-1.0", "CC-BY-4.0", "CC-BY-SA-4.0", "CUSTOM-REDISTRIBUTION"]);
  const todayKey = () => safeDatePreview?previewParams.get("date"):new Date().toISOString().slice(0, 10);

  const defaultState = {
    activeCourse: "spanish",
    xp: 120,
    gems: 180,
    hearts: 5,
    streak: 3,
    sound: true,
    lastStudyDate: null,
    dailyDate: todayKey(),
    dailyXP: 0,
    lessonsToday: 0,
    perfectLessons: 0,
    completed: { spanish: [], french: [], japanese: [], korean: [], icelandic: [], somali: [], russian: [], mandarin: [], arabic: [], vietnamese: [], navajo: [], asl: [] },
    mastery: { spanish: {}, french: {}, japanese: {}, korean: {}, icelandic: {}, somali: {}, russian: {}, mandarin: {}, arabic: {}, vietnamese: {}, navajo: {}, asl: {} },
    meaningFirstSeen: { spanish: {}, french: {}, japanese: {}, korean: {}, icelandic: {}, somali: {}, russian: {}, mandarin: {}, arabic: {}, vietnamese: {}, navajo: {}, asl: {} },
    placement: { spanish: null, french: null, japanese: null, korean: null, icelandic: null, somali: null, russian: null, mandarin: null, arabic: null, vietnamese: null, navajo: null, asl: null },
    showReadings: { japanese: true, korean: true, russian: true, mandarin: true, arabic: true },
    mistakes: [],
    purchases: { streakFreeze: 0, scholarAura: false }
  };

  let state = loadState();
  let currentView = "learn";
  let lessonSession = null;
  let activeRecognition = null;
  let runtimeAslLibrary = null;
  let runtimeAslObjectUrls = [];
  let activeLessonAudio = null;
  let audioSequenceToken = 0;

  const viewRoot = document.querySelector("#view-root");
  const courseDialog = document.querySelector("#course-dialog");
  const lessonShell = document.querySelector("#lesson-shell");
  const lessonCard = document.querySelector("#lesson-card");
  const lessonPrompt = document.querySelector("#lesson-prompt");
  const lessonMascot = document.querySelector("#lesson-mascot");
  const lessonFooter = document.querySelector("#lesson-footer");
  const feedback = document.querySelector("#answer-feedback");
  const checkButton = document.querySelector("#check-button");

  resetDailyIfNeeded();
  bindGlobalEvents();
  primeSpeechVoices();
  renderCourseDialog();
  renderView("learn");
  updateChrome();
  registerOfflineSupport();
  if(safeDatePreview){const banner=document.createElement("div");banner.setAttribute("role","status");banner.style.cssText="position:fixed;z-index:99999;top:0;left:0;right:0;padding:8px;text-align:center;background:#06392f;color:#fff;font:900 13px Arial;border-bottom:2px solid #53e4c2";banner.textContent=`🧪 SAFE DATE PREVIEW • ${todayKey()} • progress is not saved`;document.body.append(banner)}

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || typeof saved !== "object") return structuredClone(defaultState);
      const nextState = {
        ...structuredClone(defaultState),
        ...saved,
        completed: { ...structuredClone(defaultState.completed), ...(saved.completed || {}) },
        mastery: { ...structuredClone(defaultState.mastery), ...(saved.mastery || {}) },
        meaningFirstSeen: { ...structuredClone(defaultState.meaningFirstSeen), ...(saved.meaningFirstSeen || {}) },
        placement: { ...structuredClone(defaultState.placement), ...(saved.placement || {}) },
        showReadings: { ...structuredClone(defaultState.showReadings), ...(saved.showReadings || {}) },
        purchases: { ...defaultState.purchases, ...(saved.purchases || {}) }
      };
      if (typeof saved.showJapaneseReadings === "boolean" && saved.showReadings?.japanese === undefined) {
        nextState.showReadings.japanese = saved.showJapaneseReadings;
      }
      return nextState;
    } catch {
      return structuredClone(defaultState);
    }
  }

  function saveState() {
    if(!safeDatePreview)localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateChrome();
  }

  function resetDailyIfNeeded() {
    if (state.dailyDate === todayKey()) return;
    state.dailyDate = todayKey();
    state.dailyXP = 0;
    state.lessonsToday = 0;
    state.perfectLessons = 0;
    saveState();
  }

  function bindGlobalEvents() {
    document.addEventListener("click", event => {
      const aslRateButton = event.target.closest("[data-asl-rate]");
      if (aslRateButton) {
        const video = aslRateButton.closest(".asl-model")?.querySelector("video");
        if (video) {
          video.playbackRate = Number(aslRateButton.dataset.aslRate) || 1;
          video.play().catch(() => {});
          aslRateButton.closest(".asl-model").querySelectorAll("[data-asl-rate]").forEach(button => {
            button.classList.toggle("is-active", button === aslRateButton);
          });
        }
        return;
      }

      const viewButton = event.target.closest("[data-view]");
      if (viewButton) {
        renderView(viewButton.dataset.view);
        return;
      }

      const lessonNode = event.target.closest("[data-lesson-id]");
      if (lessonNode && !lessonNode.disabled) {
        startLesson(Number(lessonNode.dataset.unit), Number(lessonNode.dataset.lesson));
        return;
      }

      const courseOption = event.target.closest("[data-course]");
      if (courseOption) {
        switchCourse(courseOption.dataset.course);
        return;
      }

      const shopButton = event.target.closest("[data-shop]");
      if (shopButton) {
        purchaseItem(shopButton.dataset.shop);
        return;
      }

      if (event.target.closest("[data-start-practice]")) {
        startLesson(0, 0, true);
        return;
      }

      if (event.target.closest("[data-start-placement]")) {
        startPlacement();
        return;
      }

      if (event.target.closest("[data-toggle-readings]")) {
        const course = activeCourse();
        state.showReadings[course.id] = !readingVisible(course);
        saveState();
        renderLearn();
        toast(`${course.readingLabel} support ${readingVisible(course) ? "shown" : "hidden"}`);
        return;
      }

      if (event.target.closest("[data-play-portal-greeting]")) {
        playPortalGreeting();
        return;
      }

      if (event.target.closest("[data-audio-check]")) {
        const course = activeCourse();
        if (course.modality === "visual") toast("ASL uses native-signer video instead of spoken audio.");
        else {
          const sample = course.units[0].vocab[0].target;
          const source = speechSourceFor(sample, course.speechLang);
          if (!source) toast(`No compatible ${course.name} voice is available. English fallback is blocked; generate or install the packaged voice pack.`);
          else if (speak(sample, course.speechLang)) toast(`${course.name} ${source === "packaged" ? "packaged audio" : "device voice"} playing.`);
        }
        return;
      }

      if (event.target.closest("[data-load-asl-pack]")) {
        loadAslVideoPack();
        return;
      }

      if (event.target.closest("[data-export-progress]")) {
        exportProgress();
        return;
      }

      if (event.target.closest("[data-import-progress]")) {
        importProgress();
        return;
      }

      if (event.target.closest("[data-reset-progress]")) {
        if (window.confirm("Reset all Dragon Tongues progress on this device?")) {
          state = structuredClone(defaultState);
          saveState();
          renderCourseDialog();
          renderView("learn");
          toast("Progress reset. Your new quest begins!");
        }
      }
    });

    document.querySelector("#course-button").addEventListener("click", openCourseDialog);
    document.querySelector("#mobile-course-button").addEventListener("click", openCourseDialog);
    document.querySelector("#sound-toggle").addEventListener("click", toggleSound);
    document.querySelector("#lesson-close").addEventListener("click", closeLesson);
    checkButton.addEventListener("click", handleCheck);
  }

  function primeSpeechVoices() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.getVoices();
    const refreshAudioStatus = () => {
      if (currentView === "learn" && lessonShell.hidden) renderLearn();
    };
    if (typeof window.speechSynthesis.addEventListener === "function") {
      window.speechSynthesis.addEventListener("voiceschanged", refreshAudioStatus, { once: true });
    } else {
      window.speechSynthesis.onvoiceschanged = refreshAudioStatus;
    }
  }

  function openCourseDialog() {
    renderCourseDialog();
    courseDialog.showModal();
  }

  function switchCourse(courseId) {
    if (!courses[courseId]) return;
    state.activeCourse = courseId;
    saveState();
    renderCourseDialog();
    courseDialog.close();
    renderView("learn");
    toast(`${courses[courseId].sigil} · ${courses[courseId].name} path selected`);
  }

  function renderCourseDialog() {
    const grid = document.querySelector("#course-grid");
    grid.innerHTML = Object.values(courses).map(course => {
      const count = state.completed[course.id]?.length || 0;
      return `
        <button type="button" class="course-option ${course.id === state.activeCourse ? "is-current" : ""}"
          style="--option-accent:${course.accent}" data-course="${course.id}">
          <span class="language-sigil language-sigil-option" aria-hidden="true">${escapeHtml(course.sigil)}</span>
          <span><strong>${course.name}</strong><small>${course.nativeName} · ${count} lessons complete</small></span>
          <span class="course-check" aria-hidden="true">${course.id === state.activeCourse ? "✓" : "→"}</span>
        </button>`;
    }).join("");
  }

  function renderView(viewName) {
    currentView = viewName;
    document.querySelectorAll("[data-view]").forEach(button => {
      button.classList.toggle("is-active", button.dataset.view === viewName);
    });

    const renderers = {
      learn: renderLearn,
      practice: renderPractice,
      quests: renderQuests,
      league: renderLeague,
      shop: renderShop,
      profile: renderProfile
    };
    (renderers[viewName] || renderLearn)();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderLearn() {
    const course = activeCourse();
    setCourseTheme(course);
    const completedCount = state.completed[course.id].length;
    const totalLessons = course.units.reduce((sum, unit) => sum + unit.lessonNames.length, 0);
    const percentage = Math.round((completedCount / totalLessons) * 100);
    const portalAction = course.id === "asl"
      ? hasAslVideoModel(course.portalGreeting) ? course.portalAction : "HELLO video pending"
      : speechSourceFor(course.portalGreeting, course.speechLang) === "packaged"
        ? "Hear packaged voice"
        : speechSourceFor(course.portalGreeting, course.speechLang) === "device"
          ? "Hear device voice"
          : "Voice pack pending";
    let flatIndex = 0;

    const unitsMarkup = course.units.map((unit, unitIndex) => {
      const nodes = unit.lessonNames.map((lessonName, lessonIndex) => {
        const id = lessonId(course.id, unitIndex, lessonIndex);
        const completed = state.completed[course.id].includes(id);
        const open = completed || flatIndex === completedCount;
        const crown = lessonIndex === unit.lessonNames.length - 1;
        const icons = course.modality === "visual"
          ? ["👁️", "🤟", "🖐️", "⚡", "🧠", "🎁"]
          : ["📖", "🔊", "🧩", "⚡", "💬", "🎁"];
        const node = `
          <div class="lesson-node-wrap">
            <button class="lesson-node ${completed ? "is-complete" : open ? "is-open" : ""} ${crown ? "is-crown" : ""}"
              data-lesson-id="${id}" data-unit="${unitIndex}" data-lesson="${lessonIndex}"
              ${open ? "" : "disabled"} aria-label="${escapeHtml(lessonName)}${completed ? ", complete" : open ? ", available" : ", locked"}">
              <span class="lesson-node-icon" aria-hidden="true">${completed ? "✓" : open ? icons[lessonIndex] : "🔒"}</span>
              ${completed ? '<span class="node-stars">★ 3</span>' : ""}
              <span class="node-label">${escapeHtml(lessonName)}</span>
            </button>
          </div>`;
        flatIndex += 1;
        return node;
      }).join("");

      return `
        <section class="unit-block" aria-labelledby="unit-${unitIndex}">
          <div class="unit-banner">
            <span class="unit-number">${unitIndex + 1}</span>
            <div><h2 id="unit-${unitIndex}">${escapeHtml(unit.title)}</h2><p>${escapeHtml(unit.subtitle)}</p></div>
          </div>
          <div class="lesson-path">${nodes}</div>
        </section>`;
    }).join("");

    viewRoot.innerHTML = `
      <section class="course-hero" data-course-identity="${escapeHtml(course.id)}">
        <div class="course-hero-pattern" aria-hidden="true">
          ${course.bannerGlyphs.map(glyph => `<span>${escapeHtml(glyph)}</span>`).join("")}
        </div>
        <div class="course-hero-copy">
          <div class="hero-language-heading">
            <span class="language-sigil language-sigil-hero" aria-hidden="true">${escapeHtml(course.sigil)}</span>
            <span><small>${escapeHtml(course.nativeName.toUpperCase())} · ${escapeHtml(course.level || "BEGINNER")}</small><b>${escapeHtml(course.bannerKicker)}</b></span>
          </div>
          <h1>Enter the ${escapeHtml(course.name)} Portal</h1>
          <p>${escapeHtml(course.description)}</p>
          <div class="hero-progress">
            <div class="progress-track"><div class="progress-fill" style="width:${percentage}%"></div></div>
            <strong>${completedCount}/${totalLessons}</strong>
          </div>
          <div class="hero-actions">
            <button class="hero-button" data-start-placement>${state.placement[course.id] ? `Path check: Unit ${state.placement[course.id]}` : "Take path check"}</button>
            ${course.readingLabel ? `<button class="hero-button secondary" data-toggle-readings>${escapeHtml(course.readingLabel)} ${readingVisible(course) ? "on" : "off"}</button>` : ""}
          </div>
        </div>
        <div class="course-hero-scene">
          <button type="button" class="language-portal" data-play-portal-greeting aria-label="${escapeAttribute(course.portalAction)}: ${escapeAttribute(course.portalGreeting)}">
            <span class="portal-constellation" aria-hidden="true">${Array.from({ length: 8 }, () => "<i></i>").join("")}</span>
            <span class="portal-orbit-copy">${escapeHtml(course.portalOrbit)}</span>
            <strong class="portal-greeting" dir="auto">${escapeHtml(course.portalGreeting)}</strong>
            <span class="portal-reading">${escapeHtml(course.portalReading)}</span>
            <span class="portal-action"><span aria-hidden="true">${course.modality === "spoken" ? "🔊" : "▶"}</span> ${escapeHtml(portalAction)}</span>
          </button>
          <div class="course-hero-mascot"><div class="mascot-sprite mascot-wave" role="img" aria-label="Dragon mascot welcoming you to the ${escapeAttribute(course.name)} portal"></div></div>
        </div>
      </section>
      ${course.modality === "visual" ? renderAslResource(course) : ""}
      ${unitsMarkup}`;
  }

  function renderAslResource(course) {
    const stats = aslLibraryStats();
    return `
      <section class="asl-resource">
        <img src="${course.visualAsset}" alt="${escapeHtml(course.visualAssetAlt)}" loading="lazy">
        <div>
          <span class="eyebrow">VISUAL LANGUAGE MODE</span>
          <h3>Watch first. Then recognize and produce.</h3>
          <p>ASL is not signed English. This path uses the public-domain fingerspelling chart now and automatically activates rights-cleared native-signer models as they pass Deaf-educator review.</p>
          <div class="asl-library-status"><strong>${stats.ready}/${stats.required}</strong><span>reviewed video models installed${stats.runtime ? " · local test pack active" : ""}</span></div>
          <p><b>Accessibility:</b> Spoken-audio questions are replaced with visual comprehension tasks.</p>
          <button class="hero-button asl-pack-button" type="button" data-load-asl-pack>Test local video pack</button>
          <div class="asl-links">
            <a href="https://gallaudet.edu/asl-connect/" target="_blank" rel="noreferrer">Gallaudet ASL Connect</a>
            <a href="https://nad.org/knowledge-hub/american-sign-language/learning-american-sign-language/" target="_blank" rel="noreferrer">National Association of the Deaf learning resources</a>
            <a href="https://asl-lex.org/visualization/" target="_blank" rel="noreferrer">Search ASL-LEX on its website</a>
            <a href="https://commons.wikimedia.org/wiki/File:Asl_alphabet_gallaudet_ann.svg" target="_blank" rel="noreferrer">${escapeHtml(course.visualCredit)}</a>
          </div>
        </div>
      </section>`;
  }

  function playPortalGreeting() {
    const course = activeCourse();
    const portal = document.querySelector(".language-portal");
    if (!portal) return;
    portal.classList.remove("is-playing");
    void portal.offsetWidth;
    portal.classList.add("is-playing");
    window.setTimeout(() => portal.classList.remove("is-playing"), 1600);

    if (course.modality === "spoken") {
      if (speak(course.portalGreeting, course.speechLang)) {
        toast(`${course.portalGreeting} · ${course.name} portal greeting`);
      } else {
        toast(`No compatible ${course.name} voice is available. English fallback is blocked; add the packaged voice pack.`);
      }
      return;
    }

    const clip = getAslVideoClip(course.portalGreeting);
    if (!clip) {
      toast("The portal is ready for HELLO, but the reviewed native-signer video is still pending.");
      return;
    }

    portal.querySelector(".portal-video")?.remove();
    const video = document.createElement("video");
    video.className = "portal-video";
    video.src = clip.src;
    video.playsInline = true;
    video.muted = true;
    video.setAttribute("aria-label", "Reviewed native-signer ASL greeting model");
    video.addEventListener("ended", () => video.remove(), { once: true });
    portal.append(video);
    video.play().catch(() => {
      video.remove();
      toast("Tap again to play the ASL greeting model.");
    });
  }

  function renderPractice() {
    const course = activeCourse();
    const courseMistakes = state.mistakes.filter(item => item.courseId === course.id).slice(-8).reverse();
    const masteryEntries = Object.values(state.mastery[course.id] || {});
    const masteredCount = masteryEntries.filter(item => item.level === "mastered").length;
    const learningCount = masteryEntries.filter(item => item.level === "learning" || item.level === "strong").length;
    const fallbackWords = course.units[0].vocab.slice(0, 6).map(word => ({ ...word, courseId: course.id }));
    const words = courseMistakes.length ? courseMistakes : fallbackWords;

    viewRoot.innerHTML = `
      ${pageHeader("Practice Hall", "Sharpen weak words without risking your lesson path.", "TARGETED REVIEW")}
      <div class="mastery-strip">
        <div><strong>${masteredCount}</strong><span>Mastered</span></div>
        <div><strong>${learningCount}</strong><span>Learning</span></div>
        <div><strong>${courseMistakes.length}</strong><span>Needs repair</span></div>
      </div>
      <div class="view-grid">
        <section class="panel-card feature-card">
          <span aria-hidden="true">🎯</span>
          <h2>${courseMistakes.length ? "Repair recent mistakes" : "Warm-up review"}</h2>
          <p>${courseMistakes.length ? `${courseMistakes.length} recent words are ready for another try.` : "No mistakes yet, so the Hall prepared a foundation review."}</p>
          <button class="practice-button" data-start-practice>Start practice</button>
        </section>
        <section class="panel-card feature-card">
          <span aria-hidden="true">💜</span>
          <h2>Heart practice</h2>
          <p>Every practice session restores one heart, up to five.</p>
          <button class="primary-button" data-start-practice>Practice for a heart</button>
        </section>
        <section class="panel-card full-span">
          <span class="eyebrow">YOUR REVIEW WORDS</span>
          <div class="word-list">
            ${words.map(word => `<div class="word-row"><strong dir="auto">${escapeHtml(word.target)}</strong>${word.reading ? `<small>${escapeHtml(word.reading)}</small>` : ""}<span style="margin-left:auto;color:var(--muted)">${escapeHtml(word.english)}</span></div>`).join("")}
          </div>
        </section>
      </div>`;
  }

  function renderQuests() {
    const quests = questData();
    viewRoot.innerHTML = `
      ${pageHeader("Daily Quests", "Complete short goals to earn gems and keep your learning streak alive.", "TODAY IN DRAGONSWOOD")}
      <section class="panel-card">
        <div class="quest-list">
          ${quests.map(quest => `
            <div class="quest-row">
              <span aria-hidden="true">${quest.icon}</span>
              <div>
                <strong>${quest.title}</strong>
                <p>${quest.copy}</p>
                <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, (quest.value / quest.goal) * 100)}%"></div></div>
              </div>
              <div class="quest-status">${quest.value >= quest.goal ? "✓ Done" : `${quest.value}/${quest.goal}`}</div>
            </div>`).join("")}
        </div>
      </section>`;
  }

  function renderLeague() {
    const players = [
      ["1", "🧙", "Sky Scribe", 980], ["2", "🛡️", "Rune Ranger", 845], ["3", "🐉", "Ember Scholar", 790],
      ["4", "🧪", "Potion Page", 670], ["5", "🏹", "Forest Scout", 610], ["6", "📚", "Tower Reader", 540],
      ["7", "⭐", "You", Math.max(320, state.xp)], ["8", "🦉", "Night Owl", 305], ["9", "⚔️", "Brave Blade", 280]
    ].sort((a, b) => b[3] - a[3]).map((player, index) => [String(index + 1), ...player.slice(1)]);

    viewRoot.innerHTML = `
      ${pageHeader("Amethyst League", "Earn XP in any language. The top ten advance when the weekly tower closes.", "FRIENDLY CLASSROOM LEAGUE")}
      <section class="panel-card">
        <div class="league-list">
          ${players.map(player => `<div class="leader-row ${player[2] === "You" ? "is-player" : ""}"><span class="leader-rank">${player[0]}</span><span class="leader-avatar">${player[1]}</span><strong class="leader-name">${player[2]}</strong><strong class="leader-xp">${player[3]} XP</strong></div>`).join("")}
        </div>
      </section>`;
  }

  function renderShop() {
    const items = [
      { id: "hearts", icon: "💜", title: "Heart refill", copy: "Refill to five hearts immediately.", cost: 60, owned: state.hearts >= 5 },
      { id: "freeze", icon: "🧊", title: "Streak shield", copy: "Protect one missed day automatically.", cost: 100, owned: state.purchases.streakFreeze > 0 },
      { id: "aura", icon: "✨", title: "Scholar aura", copy: "Unlock a golden glow on your profile.", cost: 150, owned: state.purchases.scholarAura }
    ];
    viewRoot.innerHTML = `
      ${pageHeader("Dragon Market", `You have ${state.gems} dragon gems. Rewards are saved on this device.`, "SPEND YOUR QUEST REWARDS")}
      <div class="shop-grid">
        ${items.map(item => `
          <section class="shop-item">
            <span aria-hidden="true">${item.icon}</span>
            <div><strong>${item.title}</strong><p>${item.copy}</p></div>
            <button class="shop-button" data-shop="${item.id}" ${item.owned || state.gems < item.cost ? "disabled" : ""}>
              ${item.owned ? "Owned" : `💎 ${item.cost}`}
            </button>
          </section>`).join("")}
      </div>`;
  }

  function renderProfile() {
    const totalComplete = Object.values(state.completed).reduce((sum, lessons) => sum + lessons.length, 0);
    const dineOpenClips = Object.values(packagedVoiceLibrary.clips || {}).filter(clip => clip.provider === "wikimedia-commons-open-audio");
    const dineOpenSources = [...new Map(dineOpenClips.map(clip => [clip.sourceFile, clip])).values()]
      .sort((left, right) => String(left.sourceFile).localeCompare(String(right.sourceFile)));
    const dineCoverage = packagedVoiceLibrary.coverage?.navajo;
    const achievements = [
      ["🔥", "Streak Keeper", `${state.streak}-day study streak`, state.streak >= 3],
      ["🌍", "Twelve Paths", "Open every launch language", Object.keys(courses).length === 12],
      ["💯", "Century Scholar", "Earn at least 100 total XP", state.xp >= 100],
      ["🏰", "Pathfinder", "Complete ten lessons", totalComplete >= 10]
    ];
    viewRoot.innerHTML = `
      ${pageHeader("Scholar Profile", "Your language progress across every Dragon Tongues path.", "MY ADVENTURER")}
      <section class="panel-card profile-banner">
        <div class="mascot-sprite mascot-wave" role="img" aria-label="Dragon mascot waving"></div>
        <div>
          <span class="eyebrow" style="color:#ffe7a3">DRAGON TONGUES SCHOLAR</span>
          <h2>${state.purchases.scholarAura ? "✨ " : ""}Language Adventurer</h2>
          <p>Study a little each day. Courage and consistency beat perfection.</p>
          <div class="profile-stats">
            <div><strong>${state.xp}</strong><small>Total XP</small></div>
            <div><strong>${state.streak}</strong><small>Day streak</small></div>
            <div><strong>${totalComplete}</strong><small>Lessons</small></div>
            <div><strong>${Object.keys(courses).length}</strong><small>Languages</small></div>
          </div>
        </div>
      </section>
      <section class="panel-card" style="margin-top:20px">
        <span class="eyebrow">ACHIEVEMENTS</span>
        <div class="achievement-list">
          ${achievements.map(item => `<div class="achievement-row" style="opacity:${item[3] ? 1 : .48}"><span>${item[0]}</span><div><strong>${item[1]}</strong><p>${item[2]}</p></div><span>${item[3] ? "✓" : "🔒"}</span></div>`).join("")}
        </div>
      </section>
      ${dineOpenSources.length ? `<details class="panel-card" style="margin-top:20px">
        <summary><strong>Diné open-audio credits · ${dineCoverage?.ready || dineOpenClips.length}/${dineCoverage?.required || 130} course targets ready</strong></summary>
        <p style="margin-top:12px">These exact-match native-speaker recordings come from Navajo Word of the Day files preserved by Wikimedia Commons. Each recording retains its listed Creative Commons license. Ogg sources were converted to 24 kHz mono MP3 for Chromebook playback; the words were not edited. No endorsement is implied.</p>
        <ul class="resource-list">
          ${dineOpenSources.map(clip => `<li><a href="${escapeHtml(clip.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(clip.sourceFile)}</a> · ${escapeHtml(clip.author)} · <a href="${escapeHtml(clip.licenseUrl)}" target="_blank" rel="noreferrer">${escapeHtml(clip.license)}</a></li>`).join("")}
        </ul>
      </details>` : ""}
      <div class="profile-actions">
        <button class="primary-button" data-export-progress>Export progress backup</button>
        <button class="primary-button secondary-action" data-import-progress>Import progress backup</button>
      </div>
      <button class="text-button" data-reset-progress style="margin:28px auto;display:block;color:#a94b5c">Reset device progress</button>`;
  }

  function startLesson(unitIndex, lessonIndex, isPractice = false) {
    const course = activeCourse();
    const unit = course.units[unitIndex];
    const questions = buildQuestions(course, unit, lessonIndex, isPractice);
    const mediaGaps = requiredMediaGaps(course, questions);
    lessonSession = {
      courseId: course.id,
      unitIndex,
      lessonIndex,
      lessonId: lessonId(course.id, unitIndex, lessonIndex),
      isPractice,
      questions,
      index: 0,
      selected: null,
      checked: false,
      correct: 0,
      independentCorrect: 0,
      assisted: 0,
      gradedTotal: questions.filter(question => !question.ungraded && !question.guided && !["teach", "dialogue", "media-pending"].includes(question.type)).length,
      integrityBlocked: mediaGaps.length > 0,
      mediaGaps,
      earnedXP: 0,
      finished: false,
      isPlacement: false
    };
    lessonShell.hidden = false;
    document.body.style.overflow = "hidden";
    renderQuestion();
  }

  function startPlacement() {
    const course = activeCourse();
    const sampleUnits = [0, 1, 2, 3, 5, 7, 9, 11];
    const questions = sampleUnits.map((unitIndex, index) => {
      const unit = course.units[unitIndex];
      const word = unit.vocab[index % unit.vocab.length];
      if (index % 3 === 0) return makeModelRecognitionQuestion(course, unit.vocab, word);
      return makeChoiceQuestion("target-to-english", course, unit.vocab, word, "english");
    });
    const mediaGaps = requiredMediaGaps(course, questions);
    if (mediaGaps.length) {
      toast(`Path check paused: ${mediaGaps.length} required reviewed ${course.modality === "visual" ? "video" : "audio"} model${mediaGaps.length === 1 ? " is" : "s are"} not installed.`);
      return;
    }
    lessonSession = {
      courseId: course.id,
      unitIndex: 0,
      lessonIndex: 0,
      lessonId: `placement-${course.id}`,
      isPractice: false,
      isPlacement: true,
      questions,
      index: 0,
      selected: null,
      checked: false,
      correct: 0,
      independentCorrect: 0,
      assisted: 0,
      gradedTotal: questions.length,
      earnedXP: 0,
      finished: false
    };
    lessonShell.hidden = false;
    document.body.style.overflow = "hidden";
    renderQuestion();
  }

  function buildQuestions(course, unit, lessonIndex, isPractice) {
    let pool = unit.vocab;
    if (isPractice) {
      const allWords = course.units.flatMap(item => item.vocab);
      const weakTargets = Object.entries(state.mastery[course.id] || {})
        .filter(([, item]) => item.level !== "mastered" || Number(item.nextReviewAt || 0) <= Date.now())
        .sort((a, b) => Number(a[1].nextReviewAt || 0) - Number(b[1].nextReviewAt || 0))
        .map(([target]) => target);
      const weakWords = weakTargets.map(target => allWords.find(word => word.target === target)).filter(Boolean);
      const mistakes = state.mistakes.filter(item => item.courseId === course.id);
      const review = [...mistakes, ...weakWords].filter((word, index, list) => list.findIndex(item => item.target === word.target) === index);
      if (review.length >= 4) pool = review.slice(-10);
    }
    const rotated = [...pool.slice(lessonIndex), ...pool.slice(0, lessonIndex)];
    const words = rotated.slice(0, Math.min(6, rotated.length));
    while (words.length < 6) words.push(pool[words.length % pool.length]);

    if (isPractice) {
      const practiceQuestions = words.map((word, index) => {
        if (index === 1) return makeModelRecognitionQuestion(course, words, word);
        if (index === 3) return makeBuildQuestion(course, word);
        if (index === 4) return makeTypingQuestion(course, word);
        return makeChoiceQuestion(index % 2 === 0 ? "target-to-english" : "english-to-target", course, words, word, index % 2 === 0 ? "english" : "target");
      });
      const unknownWords = uniqueWords(words.filter(word => !state.mastery[course.id]?.[word.target] || !state.meaningFirstSeen[course.id]?.[word.target]));
      return [
        ...unknownWords.map(word => makeTeachActivity(course, word, true)),
        ...practiceQuestions
      ];
    }

    const plan = academicEngine.standardPlan(words, lessonIndex);
    const exposureWords = plan.exposureWords;
    const dialogueWord = unit.dialogue[(lessonIndex + 1) % unit.dialogue.length];
    const dialogueAsWord = { target: dialogueWord.target, english: dialogueWord.english, reading: dialogueWord.reading };
    const listen = makeModelRecognitionQuestion(course, exposureWords, words[0]);
    const reverse = makeChoiceQuestion("english-to-target", course, exposureWords, words[1], "target");
    const recognize = makeChoiceQuestion("target-to-english", course, exposureWords, words[2], "english");
    const typing = makeTypingQuestion(course, words[3]);
    const build = { ...makeBuildQuestion(course, dialogueAsWord), guided: true };
    const response = makeDialogueResponseQuestion(course, unit, lessonIndex, exposureWords);
    const speaking = {
      type: "speaking",
      prompt: course.modality === "spoken" ? "Hear the model, then say it" : "Watch the model, then sign it",
      word: dialogueAsWord,
      answer: dialogueAsWord.target,
      ungraded: true
    };

    const roleQuestions = { listen, recognize, build, typing, response, reverse, speaking };
    const practiceQuestions = plan.practiceRoles.map(role => roleQuestions[role.kind]);
    return [
      ...exposureWords.map(word => makeTeachActivity(course, word, false)),
      {
        type: "dialogue",
        prompt: course.modality === "spoken" ? "Your first conversation" : "Your first signed exchange",
        lines: unit.dialogue || [],
        requiresVideo: Boolean(unit.dialogueRequiresVideo)
      },
      ...practiceQuestions
    ];
  }

  function makeTeachActivity(course, word, isPracticePreview) {
    return {
      type: "teach",
      prompt: course.modality === "spoken" ? "See it. Hear it. Say it." : "Watch first. Notice the visual details.",
      word,
      isPracticePreview
    };
  }

  function uniqueWords(words) {
    return words.filter((word, index, list) => list.findIndex(item => item.target === word.target) === index);
  }

  function lessonExposureWords(words, lessonIndex) {
    const primaryIndexes = [
      [0, 2, 3],
      [0, 3],
      [0, 1, 2],
      [0, 1, 3],
      [0, 3],
      [0, 1, 2, 3]
    ][lessonIndex] || [0, 1, 2, 3];
    const primary = uniqueWords(primaryIndexes.map(index => words[index]).filter(Boolean));
    const support = words.filter(word => !primary.some(item => item.target === word.target));
    return uniqueWords([...primary, ...support]).slice(0, 4);
  }

  function makeDialogueResponseQuestion(course, unit, lessonIndex, knownWords = []) {
    const lineIndex = lessonIndex % Math.max(1, unit.dialogue.length - 1);
    const cue = unit.dialogue[lineIndex];
    const response = unit.dialogue[lineIndex + 1] || unit.dialogue[0];
    const distractors = uniqueChoiceValues(shuffle([
      ...unit.dialogue.filter(line => line.target !== response.target).map(line => line.target),
      ...knownWords.map(word => word.target)
    ]), response.target).slice(0, 3);
    return {
      type: "dialogue-response",
      prompt: course.modality === "spoken" ? "Choose the best reply" : "Choose the next meaning/gloss",
      word: { target: response.target, english: response.english, reading: response.reading },
      display: cue.target,
      reading: cue.reading,
      cueEnglish: cue.english,
      answer: response.target,
      choices: shuffle([response.target, ...distractors])
    };
  }

  function makeBuildQuestion(course, word) {
    const target = word.target.replace(/[.!?¿¡。؟،؛]/g, "").trim();
    let tokens;
    let joiner = " ";
    if (course.id === "japanese") {
      joiner = "";
      tokens = Array.from(target);
      if (tokens.length > 10) {
        const grouped = [];
        for (let index = 0; index < tokens.length; index += 2) grouped.push(tokens.slice(index, index + 2).join(""));
        tokens = grouped;
      }
    } else {
      tokens = target.split(/\s+/);
      if (tokens.length === 1 && target.length > 3) {
        joiner = "";
        tokens = Array.from(target);
      }
    }
    return {
      type: "build",
      prompt: course.id === "asl" ? "Build the meaning/gloss in order" : `Build the ${course.name} phrase`,
      word,
      display: word.english,
      answer: target,
      tokens: shuffle(tokens.map((token, index) => ({ token, index }))),
      joiner
    };
  }

  function makeTypingQuestion(course, word) {
    const accepted = [word.target];
    return {
      type: "typing",
      prompt: word.reading ? `Type the ${course.name} form in its target script` : course.id === "asl" ? "Type the ASL term exactly" : `Type the ${course.name} word or phrase`,
      word,
      display: word.english,
      reading: null,
      answer: word.target,
      accepted
    };
  }

  function makeChoiceQuestion(type, course, pool, word, answerField) {
    const answer = word[answerField];
    const distractors = uniqueChoiceValues(shuffle(pool.filter(item => item.target !== word.target)).map(item => item[answerField]), answer).slice(0, 3);
    return {
      type,
      prompt: questionPrompt(type, course),
      word,
      display: type === "english-to-target" ? word.english : word.target,
      reading: word.reading,
      answer,
      choices: shuffle([answer, ...distractors])
    };
  }

  function uniqueChoiceValues(values, answer) {
    return academicEngine.uniqueChoiceValues(values, answer);
  }

  function makeModelRecognitionQuestion(course, pool, word) {
    if (course.modality === "spoken" && reviewedSpeechSourceFor(course, word.target)) return makeChoiceQuestion("listening", course, pool, word, "english");
    if (course.modality === "spoken") return makeMediaPendingQuestion(course, word, "audio");
    if (hasAslVisualModel(word.target)) return makeChoiceQuestion("visual", course, pool, word, "english");
    return makeMediaPendingQuestion(course, word, "video");
  }

  function makeMediaPendingQuestion(course, word, medium) {
    return {
      type: "media-pending",
      prompt: `Reviewed ${medium} required`,
      word,
      medium,
      ungraded: true,
      answer: null
    };
  }

  function reviewedSpeechSourceFor(course, target) {
    if (course.id === "navajo") return packagedVoiceClip(target, course.speechLang) ? "packaged" : null;
    return speechSourceFor(target, course.speechLang);
  }

  function requiredMediaGaps(course, questions) {
    const gaps = new Set();
    const checkWord = word => {
      if (!word?.target) return;
      if (course.modality === "visual") {
        if (!hasAslVisualModel(word.target)) gaps.add(word.target);
      } else if (!reviewedSpeechSourceFor(course, word.target)) gaps.add(word.target);
    };
    questions.forEach(question => {
      if (["teach", "listening", "visual", "speaking", "media-pending"].includes(question.type)) checkWord(question.word);
      if (question.type === "dialogue") question.lines.forEach(checkWord);
    });
    return [...gaps];
  }

  function questionPrompt(type, course) {
    if (type === "listening") return "Listen and choose the meaning";
    if (type === "visual") return course.id === "asl" ? "Use the visual reference and choose the meaning" : "Choose the visual meaning";
    if (type === "english-to-target") return `Choose the ${course.name} translation`;
    return course.id === "asl" ? "Choose the meaning of this ASL gloss" : "Choose the English meaning";
  }

  function teachingSceneData(word, unit) {
    const meaning = normalizeExact(word.english).toLocaleLowerCase();
    const exactScenes = {
      "hello": { symbols: "👋 🙂", title: "Two people meet and greet each other", copy: "Picture someone arriving, making eye contact, and saying hello." },
      "good morning": { symbols: "🌅 👋", title: "A greeting at the start of the day", copy: "Picture greeting someone after the sun comes up." },
      "good afternoon": { symbols: "☀️ 👋", title: "A greeting later in the day", copy: "Picture meeting someone after midday and greeting them politely." },
      "good evening / good night": { symbols: "🌙 👋", title: "An evening greeting or farewell", copy: "Picture greeting someone in the evening or saying good night before leaving." },
      "goodbye": { symbols: "👋 🚶", title: "Someone is leaving", copy: "Picture waving as a person goes away." },
      "thank you": { symbols: "🙏 💜", title: "Someone has helped you", copy: "Picture showing appreciation after receiving help." },
      "please": { symbols: "🤲 ✨", title: "A polite request", copy: "Picture asking for something kindly." },
      "yes": { symbols: "✅ 🙂", title: "Agreeing or confirming", copy: "Picture answering positively." },
      "no": { symbols: "❌ 🙂", title: "Disagreeing or declining", copy: "Picture answering negatively but respectfully." }
    };
    if (exactScenes[meaning]) return exactScenes[meaning];

    const sceneRules = [
      { test: /\b(mother|father|sister|brother|family|friend|person|people|teacher|student)\b/, symbols: "👪 🧑", title: "Connect it to a person", copy: "Picture the person or relationship named by this meaning." },
      { test: /\b(water|milk|coffee|tea|bread|rice|apple|food|eat|drink|breakfast|dinner|chicken)\b/, symbols: "🍽️ 🥤", title: "Connect it to food or drink", copy: "Picture seeing, ordering, eating, or drinking it." },
      { test: /\b(house|home|room|kitchen|bathroom|school|class|library|park|street|store|restaurant)\b/, symbols: "🏠 📍", title: "Connect it to a place", copy: "Picture standing in or pointing toward this place." },
      { test: /\b(book|pencil|paper|backpack|table|chair|door|window|phone|computer)\b/, symbols: "🎒 📚", title: "Connect it to an object", copy: "Picture touching or pointing to the object." },
      { test: /\b(red|blue|green|yellow|black|white|color)\b/, symbols: "🎨 🟥", title: "See the color", copy: "Picture the named color on an everyday object." },
      { test: /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|number|how many)\b/, symbols: "1️⃣ 2️⃣ 3️⃣", title: "Picture a countable group", copy: "Imagine counting a small group of objects." },
      { test: /\b(happy|sad|tired|excited|sick|afraid|angry|feeling)\b/, symbols: "🙂 😢", title: "Read the feeling", copy: "Picture the face and body language that show this feeling." },
      { test: /\b(sun|rain|hot|cold|weather|wind|snow)\b/, symbols: "☀️ 🌧️", title: "Picture the weather", copy: "Imagine looking outside and noticing this condition." },
      { test: /\b(left|right|near|far|straight|here|there|where)\b/, symbols: "🗺️ 📍", title: "Place it in space", copy: "Picture pointing or moving in the direction described." },
      { test: /\b(read|write|draw|sing|dance|play|study|sleep|wake|go|come|wear|carry)\b/, symbols: "🎬 ✨", title: "Picture the action", copy: "Imagine someone performing this action." },
      { test: /\b(today|tomorrow|yesterday|morning|afternoon|evening|monday|tuesday|wednesday|thursday|friday|time)\b/, symbols: "🗓️ ⏰", title: "Place it in time", copy: "Picture a calendar or clock marking this time." }
    ];
    const match = sceneRules.find(rule => rule.test.test(meaning));
    if (match) return { symbols: match.symbols, title: match.title, copy: match.copy };
    return {
      symbols: "🎭 💬",
      title: "Picture it in the lesson scene",
      copy: `Imagine using this meaning while you ${String(unit?.objective || "take part in the conversation").replace(/^./, value => value.toLocaleLowerCase())}.`
    };
  }

  function listeningCoachData(course, word) {
    const generalCues = {
      spanish: "Track the clear vowel sounds from left to right; Spanish vowels usually stay steady.",
      french: "Listen for the whole phrase rhythm. Some written final letters may be quiet, while nearby words can link together.",
      japanese: "Count the short, even sound beats and match them to the written kana or reading support.",
      korean: "Match each heard syllable to one Hangul block; sounds can shift slightly where blocks meet.",
      icelandic: "Listen for vowel length and the consonant pattern instead of relying on English letter values.",
      somali: "Listen carefully for vowel length and doubled consonants; both can distinguish words.",
      russian: "Find the strongest stressed syllable first, then connect the remaining sounds to the Cyrillic form.",
      mandarin: "Match both the syllable and its pitch movement; the tone is part of the word.",
      arabic: "Track the consonant sequence and long vowels; not every short vowel is normally written.",
      vietnamese: "Match the syllable sounds and the tone contour; the written tone mark is part of the word.",
      navajo: "Listen for vowel length, tone, nasalization, and glottal stops; each mark can carry meaning."
    };
    const exactCues = {
      "spanish::hola": "The written h is silent. Listen for two clear beats: o · la."
    };
    return {
      cue: exactCues[`${course.id}::${normalizeExact(word.target)}`] || generalCues[course.id] || "Replay slowly and match the sound pattern to the written form.",
      reading: word.reading || ""
    };
  }

  function renderQuestion() {
    const session = lessonSession;
    const course = courses[session.courseId];
    const unit = course.units[session.unitIndex];
    const question = session.questions[session.index];
    session.selected = null;
    session.checked = false;
    session.hintUsed = false;
    session.answerRevealed = false;
    session.correctionRetry = false;
    checkButton.disabled = true;
    checkButton.textContent = "Check answer";
    lessonFooter.className = "lesson-footer";
    feedback.innerHTML = "";
    lessonMascot.className = "mascot-sprite mascot-idle";
    lessonPrompt.textContent = question.prompt;
    document.querySelector("#lesson-progress-fill").style.width = `${(session.index / session.questions.length) * 100}%`;
    document.querySelector("#lesson-heart-count").textContent = state.hearts;

    if (question.type === "teach") {
      const word = question.word;
      const scene = teachingSceneData(word, unit);
      const speechReady = course.modality === "spoken" && Boolean(reviewedSpeechSourceFor(course, word.target));
      const audioControls = speechReady
        ? `<div class="exposure-actions"><button class="audio-pill" id="teach-audio" type="button">🔊 Hear it</button><button class="audio-pill secondary" id="teach-slow" type="button">🐢 Hear it slowly</button></div>`
        : course.modality === "spoken"
          ? `<div class="audio-pending-note"><strong>🔇 Reviewed audio pending</strong><span>${escapeHtml(course.audioPendingNote || `A compatible ${course.name} voice pack is not installed yet. English fallback is blocked.`)}</span></div>`
          : renderAslModel(word.target, word.english, course, { context: "teach" });
      const exposureKicker = question.isPracticePreview ? "PREVIEW BEFORE PRACTICE" : "LEARN FIRST";
      const exposureName = question.isPracticePreview ? "FOUNDATION REVIEW" : "NEW LANGUAGE";
      lessonCard.innerHTML = `
        <span class="question-kicker">${exposureKicker} · ACTIVITY ${session.index + 1} OF ${session.questions.length}</span>
        <div class="exposure-card">
          <span class="exposure-label">${exposureName}</span>
          <h1 class="exposure-target" dir="auto">${escapeHtml(word.target)}</h1>
          ${word.reading && readingVisible(course) ? `<span class="reading">${escapeHtml(word.reading)}</span>` : ""}
          <p class="exposure-meaning"><span dir="auto">${escapeHtml(word.target)}</span><span class="meaning-equals" aria-hidden="true">=</span><strong>${escapeHtml(word.english)}</strong></p>
          <div class="teaching-scene" role="group" aria-label="Visual meaning cue: ${escapeAttribute(scene.title)}">
            <div class="teaching-scene-symbols" aria-hidden="true">${scene.symbols}</div>
            <div><span>PICTURE THE MEANING</span><strong>${escapeHtml(scene.title)}</strong><p>${escapeHtml(scene.copy)}</p></div>
          </div>
          ${audioControls}
          ${session.index === 0 && unit?.tip ? `<div class="lesson-tip"><strong>Dragon tip</strong><span>${escapeHtml(unit.tip)}</span></div>` : ""}
          <p class="no-risk-note"><strong>This is teaching, not a test.</strong> ${course.modality === "spoken" ? speechReady ? "Connect the scene, English meaning, written form, and sound before continuing." : "Connect the scene, English meaning, and written form now. Listening activates when the correct reviewed voice is installed." : "Connect the scene and meaning now. Production is requested only when a reviewed visual model is available."}</p>
        </div>`;
      checkButton.disabled = false;
      checkButton.textContent = "Continue";
      if (speechReady) {
        document.querySelector("#teach-audio").addEventListener("click", () => speak(word.target, course.speechLang));
        document.querySelector("#teach-slow").addEventListener("click", () => speak(word.target, course.speechLang, 0.58));
        setTimeout(() => speak(word.target, course.speechLang), 220);
      }
      return;
    }

    if (question.type === "dialogue") {
      const dialogueSpeechReady = course.modality === "spoken" && question.lines.length > 0 && question.lines.every(line => reviewedSpeechSourceFor(course, line.target));
      const playButton = dialogueSpeechReady ? `<button class="audio-pill" id="play-dialogue" type="button">▶ Play conversation</button>` : "";
      const readyLineCount = course.modality === "visual" ? question.lines.filter(line => hasAslVideoModel(line.target)).length : 0;
      const videoNote = question.requiresVideo
        ? `<div class="asl-video-note"><strong>${readyLineCount}/${question.lines.length} reviewed exchange models installed</strong><span>Yellow “video pending” lines remain meaning/gloss previews. They are not a substitute for watching a qualified signer.</span></div>`
        : "";
      lessonCard.innerHTML = `
        <span class="question-kicker">USE IT EARLY · ACTIVITY ${session.index + 1} OF ${session.questions.length}</span>
        <div class="dialogue-head"><div><span class="exposure-label">MINI CONVERSATION</span><h1>${escapeHtml(question.prompt)}</h1></div>${playButton}</div>
        <div class="dialogue-list">
          ${question.lines.map((line, index) => `
            <div class="dialogue-turn ${course.modality === "visual" ? "is-visual-dialogue" : ""}">
              <span class="speaker-badge">${escapeHtml(line.speaker)}</span>
              <div><strong dir="auto">${escapeHtml(line.target)}</strong>${line.reading && readingVisible(course) ? `<small>${escapeHtml(line.reading)}</small>` : ""}<span>${escapeHtml(line.english)}</span></div>
               ${course.modality === "spoken" ? reviewedSpeechSourceFor(course, line.target) ? `<button class="line-audio" type="button" data-dialogue-line="${index}" aria-label="Hear line ${index + 1}">🔊</button>` : `<span class="audio-pending-badge">Audio pending</span>` : renderAslDialogueModel(line, course)}
            </div>`).join("")}
        </div>
        ${videoNote}
        ${course.modality === "spoken" && !dialogueSpeechReady ? `<div class="audio-pending-note"><strong>🔇 Conversation audio pending</strong><span>${escapeHtml(course.audioPendingNote || `Install the compatible ${course.name} voice pack to activate listening. English fallback is blocked.`)}</span></div>` : ""}
        <p class="no-risk-note">Listen or watch, read both roles, then say or sign the response. This preview is not graded.</p>`;
      checkButton.disabled = false;
      checkButton.textContent = "Start practice";
      if (dialogueSpeechReady) {
        document.querySelector("#play-dialogue").addEventListener("click", () => speakDialogue(question.lines, course.speechLang));
        lessonCard.querySelectorAll("[data-dialogue-line]").forEach(button => {
          button.addEventListener("click", () => speak(question.lines[Number(button.dataset.dialogueLine)].target, course.speechLang));
        });
        setTimeout(() => speakDialogue(question.lines, course.speechLang), 250);
      }
      return;
    }

    if (question.type === "media-pending") {
      lessonCard.innerHTML = `
        <span class="question-kicker">REVIEW GATE · ACTIVITY ${session.index + 1} OF ${session.questions.length}</span>
        <div class="exposure-card integrity-gate-card">
          <span class="exposure-label">NOT GRADED</span>
          <h1>Reviewed ${escapeHtml(question.medium)} model pending</h1>
          <p class="exposure-meaning" dir="auto">${escapeHtml(question.word.target)} · ${escapeHtml(question.word.english)}</p>
          <div class="audio-pending-note"><strong>Progress protection is active</strong><span>This activity cannot silently become a text quiz. The lesson remains an orientation preview until this exact ${escapeHtml(question.medium)} model is installed and reviewed.</span></div>
        </div>`;
      checkButton.disabled = false;
      checkButton.textContent = "Continue preview";
      return;
    }

    if (question.type === "speaking") {
      const hasVisualModel = course.modality === "visual" && hasAslVisualModel(question.word.target);
      const hasSpeechModel = course.modality === "spoken" && Boolean(reviewedSpeechSourceFor(course, question.word.target));
      const visualModel = course.modality === "visual" ? renderAslModel(question.word.target, question.word.english, course, { context: "production" }) : "";
      const visualNote = course.modality === "visual" && !hasVisualModel
        ? `<div class="asl-video-note"><strong>Production intentionally paused</strong><span>A reviewed moving model is required before this response becomes a sign-along activity.</span></div>`
        : "";
      lessonCard.innerHTML = `
        <span class="question-kicker">PRODUCE · ACTIVITY ${session.index + 1} OF ${session.questions.length}</span>
        <div class="speaking-card">
          <span class="exposure-label">${course.modality === "spoken" ? "SPEAK ALOUD" : "SIGN WITH A MODEL"}</span>
          <h1 class="exposure-target" dir="auto">${escapeHtml(question.word.target)}</h1>
          ${question.word.reading && readingVisible(course) ? `<span class="reading">${escapeHtml(question.word.reading)}</span>` : ""}
          <p class="exposure-meaning">${escapeHtml(question.word.english)}</p>
          ${hasSpeechModel ? '<div class="exposure-actions"><button class="audio-pill" id="speak-model" type="button">🔊 Hear model</button><button class="audio-pill secondary" id="record-speech" type="button">🎙️ Use microphone</button></div>' : ""}
          ${course.modality === "spoken" && !hasSpeechModel ? `<div class="audio-pending-note"><strong>🔇 Speaking model pending</strong><span>${escapeHtml(course.audioPendingNote || `A compatible ${course.name} model is required before scored speaking practice is enabled.`)}</span></div>` : ""}
          ${visualModel}
          <p id="speech-result" class="speech-result">${course.modality === "spoken" ? hasSpeechModel ? "Practice the complete response. Pronunciation practice never costs a heart." : "Study the written response now; speaking practice activates when its reviewed model is installed." : hasVisualModel ? "Watch at normal and half speed, then practice the complete response." : "Study the meaning now; return to production after the reviewed model is installed."}</p>
          ${visualNote}
          ${hasSpeechModel || hasVisualModel ? `<button class="practice-spoken-button" id="practice-spoken" type="button">${course.modality === "spoken" ? "I practiced it aloud" : "I practiced with the model"}</button>` : ""}
        </div>`;
      checkButton.textContent = course.modality === "visual" && !hasVisualModel ? "Continue — model pending" : "Continue";
      checkButton.disabled = Boolean(hasSpeechModel || hasVisualModel);
      if (hasSpeechModel) {
        document.querySelector("#speak-model").addEventListener("click", () => speak(question.word.target, course.speechLang));
        document.querySelector("#record-speech").addEventListener("click", () => startSpeechRecognition(question, course));
        setTimeout(() => speak(question.word.target, course.speechLang), 180);
      }
      const practiceButton = document.querySelector("#practice-spoken");
      if (practiceButton) practiceButton.addEventListener("click", () => {
        document.querySelector("#speech-result").textContent = course.modality === "spoken"
          ? "Practice recorded for this lesson. Keep the model in your ears and try once more if needed."
          : "Practice recorded for this lesson. Watch the complete model once more and compare all five parameters.";
        checkButton.disabled = false;
      });
      return;
    }

    if (question.type === "build") {
      session.buildTokens = [];
      lessonCard.innerHTML = `
        <span class="question-kicker">BUILD · ACTIVITY ${session.index + 1} OF ${session.questions.length}</span>
        <h1>${escapeHtml(question.prompt)}<span class="target-word build-meaning">${escapeHtml(question.display)}</span></h1>
        <div class="build-answer" id="build-answer" dir="auto" aria-live="polite"><span>Choose pieces below</span></div>
        <div class="word-bank" id="word-bank">
          ${question.tokens.map(item => `<button type="button" class="word-token" dir="auto" data-token-index="${item.index}" data-token="${escapeAttribute(item.token)}">${escapeHtml(item.token)}</button>`).join("")}
        </div>
        <button type="button" class="undo-token" id="undo-token" disabled>↶ Undo last piece</button>`;
      const renderBuild = () => {
        const area = document.querySelector("#build-answer");
        area.textContent = session.buildTokens.length ? session.buildTokens.map(item => item.token).join(question.joiner) : "Choose pieces below";
        checkButton.disabled = session.buildTokens.length !== question.tokens.length;
        document.querySelector("#undo-token").disabled = session.buildTokens.length === 0;
      };
      lessonCard.querySelectorAll("[data-token-index]").forEach(button => {
        button.addEventListener("click", () => {
          button.disabled = true;
          session.buildTokens.push({ token: button.dataset.token, index: Number(button.dataset.tokenIndex) });
          renderBuild();
        });
      });
      document.querySelector("#undo-token").addEventListener("click", () => {
        const last = session.buildTokens.pop();
        if (last) lessonCard.querySelector(`[data-token-index="${last.index}"]`).disabled = false;
        renderBuild();
      });
      return;
    }

    const listeningCoach = question.type === "listening" ? listeningCoachData(course, question.word) : null;
    const listeningScene = question.type === "listening" ? teachingSceneData(question.word, unit) : null;
    const display = question.type === "listening"
      ? `<div class="listening-panel">
          <div class="listening-actions"><button class="listen-button" id="listen-button" aria-label="Play ${escapeHtml(course.name)} audio">🔊</button><button class="audio-pill secondary" id="listen-slow" type="button">🐢 Slow</button></div>
          <button class="listening-clue-button" id="show-listening-clue" type="button">Need help? Open the listening coach</button>
          <div class="listening-clue" id="listening-clue" role="region" aria-label="Listening coach" aria-live="polite" tabindex="-1" hidden>
            <div class="listening-coach-head"><span aria-hidden="true">🎧</span><div><small>LISTENING COACH</small><strong>Connect sound to form</strong></div></div>
            <div class="listening-coach-grid">
              <section>
                <span>WRITTEN FORM</span>
                <strong dir="auto">${escapeHtml(question.word.target)}</strong>
                ${listeningCoach.reading ? `<small>Reading support: ${escapeHtml(listeningCoach.reading)}</small>` : ""}
              </section>
              <section>
                <span>LISTEN FOR</span>
                <p>${escapeHtml(listeningCoach.cue)}</p>
              </section>
            </div>
            <ol class="listening-coach-steps" aria-label="Listening support steps">
              <li><b>1</b><span>Replay slowly</span></li>
              <li><b>2</b><span>Point to each sound</span></li>
              <li><b>3</b><span>Echo it once</span></li>
              <li><b>4</b><span>Choose the taught meaning</span></li>
            </ol>
            <div class="listening-coach-actions">
              <button class="audio-pill secondary listening-coach-replay" id="support-replay-slow" type="button">🐢 Replay slowly now</button>
              <button class="teach-meaning-button" id="teach-listening-meaning" type="button">💡 I don't know it — teach me</button>
            </div>
            <div class="listening-meaning-reveal" id="listening-meaning-reveal" role="region" aria-label="Meaning lesson" tabindex="-1" hidden>
              <div class="listening-meaning-symbols" aria-hidden="true">${listeningScene.symbols}</div>
              <div><span>MEANING LESSON</span><strong><bdi>${escapeHtml(question.word.target)}</bdi> = ${escapeHtml(question.word.english)}</strong><p>${escapeHtml(listeningScene.copy)}</p></div>
            </div>
            <p class="support-credit-note">The answer is still yours to retrieve. Coach use earns supported credit and protects your heart.</p>
          </div>
        </div>`
      : question.type === "visual"
        ? `<div class="visual-prompt">${renderAslModel(question.word.target, question.word.english, course, { context: "receptive", hideLabel: true, compact: true })}<div><span class="question-kicker">LOOK CAREFULLY</span><h1>What does this model represent?</h1><p>Study the handshape, orientation, movement, location, and facial information before choosing.</p></div></div>`
        : `<h1>${escapeHtml(question.prompt)}<span class="target-word" dir="auto">${escapeHtml(question.display)}</span>${question.reading && readingVisible(course) ? `<span class="reading">${escapeHtml(question.reading)}</span>` : ""}${question.cueEnglish ? `<span class="cue-meaning">${escapeHtml(question.cueEnglish)}</span>` : ""}</h1>`;

    const answers = question.type === "typing"
      ? `<input class="typing-answer" id="typing-answer" dir="auto" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type your answer…" aria-label="Type your answer">`
      : `<div class="answer-grid">${question.choices.map((choice, index) => `<button class="answer-option" dir="auto" data-answer-index="${index}" data-answer="${escapeAttribute(choice)}"><span>${escapeHtml(choice)}</span></button>`).join("")}</div>`;

    lessonCard.innerHTML = `<span class="question-kicker">PRACTICE · ACTIVITY ${session.index + 1} OF ${session.questions.length}</span>${display}${answers}`;

    if (question.type === "listening") {
      document.querySelector("#listen-button").addEventListener("click", () => speak(question.word.target, course.speechLang));
      document.querySelector("#listen-slow").addEventListener("click", () => speak(question.word.target, course.speechLang, 0.58));
      document.querySelector("#show-listening-clue").addEventListener("click", event => {
        session.hintUsed = true;
        const coach = document.querySelector("#listening-clue");
        coach.hidden = false;
        event.currentTarget.disabled = true;
        event.currentTarget.textContent = "Listening coach open";
        document.querySelector("#support-replay-slow").addEventListener("click", () => speak(question.word.target, course.speechLang, 0.58));
        document.querySelector("#teach-listening-meaning").addEventListener("click", revealEvent => {
          session.answerRevealed = true;
          const reveal = document.querySelector("#listening-meaning-reveal");
          reveal.hidden = false;
          revealEvent.currentTarget.disabled = true;
          revealEvent.currentTarget.textContent = "Meaning shown";
          document.querySelector(".support-credit-note").textContent = "This is now a learning review: no heart, XP, or mastery credit is at risk.";
          lessonFooter.className = "lesson-footer is-guided";
          feedback.innerHTML = `<strong>Meaning lesson opened.</strong><span>${escapeHtml(question.word.target)} means ${escapeHtml(question.word.english)}. Study the scene, then choose it below to complete the review.</span>`;
          requestAnimationFrame(() => {
            reveal.focus({ preventScroll: true });
            reveal.scrollIntoView({ block: "end", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
          });
        });
        lessonFooter.className = "lesson-footer is-guided";
        feedback.innerHTML = "<strong>Listening coach activated.</strong><span>Replay slowly, track the sound pattern, echo once, then retrieve the meaning. No heart can be lost on this activity.</span>";
        requestAnimationFrame(() => {
          coach.focus({ preventScroll: true });
          coach.scrollIntoView({ block: "end", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        });
        setTimeout(() => speak(question.word.target, course.speechLang, 0.58), 100);
      });
      setTimeout(() => speak(question.word.target, course.speechLang), 180);
    }
    if (question.type === "typing") {
      const input = document.querySelector("#typing-answer");
      input.addEventListener("input", () => { checkButton.disabled = !input.value.trim(); });
      input.addEventListener("keydown", event => {
        if (event.key === "Enter" && !checkButton.disabled) handleCheck();
      });
      input.focus();
    } else {
      lessonCard.querySelectorAll(".answer-option").forEach(button => {
        button.addEventListener("click", () => {
          if (session.checked) return;
          lessonCard.querySelectorAll(".answer-option").forEach(option => option.classList.remove("is-selected"));
          button.classList.add("is-selected");
          session.selected = button.dataset.answer;
          checkButton.disabled = false;
        });
      });
    }
  }

  function handleCheck() {
    if (!lessonSession || lessonSession.finished) {
      closeLesson(true);
      return;
    }
    const course = courses[lessonSession.courseId];
    const currentQuestion = lessonSession.questions[lessonSession.index];
    if (["teach", "dialogue"].includes(currentQuestion.type) || currentQuestion.ungraded) {
      if (currentQuestion.type === "teach") markMeaningFirstSeen(lessonSession.courseId, currentQuestion.word);
      lessonSession.index += 1;
      if (lessonSession.index >= lessonSession.questions.length) finishLesson();
      else renderQuestion();
      return;
    }
    if (lessonSession.checked) {
      lessonSession.index += 1;
      if (lessonSession.index >= lessonSession.questions.length) finishLesson();
      else renderQuestion();
      return;
    }

    const question = lessonSession.questions[lessonSession.index];
    const selected = question.type === "typing"
      ? document.querySelector("#typing-answer").value
      : question.type === "build"
        ? lessonSession.buildTokens.map(item => item.token).join(question.joiner)
        : lessonSession.selected;
    const accepted = question.accepted || [question.answer];
    const evaluation = evaluateAnswer(selected, accepted, course, question.word);
    if (evaluation === "near" && question.type === "typing" && !lessonSession.correctionRetry) {
      lessonSession.correctionRetry = true;
      const input = document.querySelector("#typing-answer");
      input.style.borderColor = "#d5961d";
      input.focus();
      input.select();
      lessonFooter.className = "lesson-footer is-guided";
      feedback.innerHTML = `<strong>Almost—fix the language marks.</strong><span>Accent, tone, nasalization, glottal, and significant capitalization marks can change meaning. Try the exact form; no heart is at risk.</span>`;
      checkButton.textContent = "Check correction";
      return;
    }
    const correct = evaluation === "correct";
    const assisted = Boolean(lessonSession.hintUsed || lessonSession.answerRevealed || lessonSession.correctionRetry || question.guided || lessonSession.integrityBlocked);
    lessonSession.checked = true;

    if (question.type === "typing") {
      const input = document.querySelector("#typing-answer");
      input.disabled = true;
      input.style.borderColor = correct ? "#16ae77" : "#ed5d72";
    } else if (question.type === "build") {
      lessonCard.querySelectorAll(".word-token, .undo-token").forEach(button => { button.disabled = true; });
      document.querySelector("#build-answer").classList.add(correct ? "is-correct" : "is-wrong");
    } else {
      lessonCard.querySelectorAll(".answer-option").forEach(button => {
        button.disabled = true;
        if (answersMatchExact(button.dataset.answer, question.answer, course, question.word)) button.classList.add("is-correct");
        else if (button.classList.contains("is-selected")) button.classList.add("is-wrong");
      });
    }

    if (correct) {
      lessonSession.correct += 1;
      if (assisted && !question.guided) lessonSession.assisted += 1;
      else lessonSession.independentCorrect += 1;
      const earned = lessonSession.integrityBlocked || question.guided || lessonSession.answerRevealed ? 0 : assisted ? 5 : 10;
      lessonSession.earnedXP += earned;
      lessonFooter.className = "lesson-footer is-correct";
      lessonMascot.className = "mascot-sprite mascot-celebrate";
      feedback.innerHTML = `<strong>${lessonSession.integrityBlocked ? "Correct for preview—no academic credit." : question.guided ? "Guided build complete—no mastery credit." : lessonSession.answerRevealed ? "Meaning review complete—no mastery credit." : assisted ? `Correct with support! +${earned} XP` : `Excellent! +${earned} XP`}</strong><span>${escapeHtml(question.word.target)} means ${escapeHtml(question.word.english)}.${assisted ? " Review it again later for independent mastery." : ""}</span>`;
    } else {
      if (assisted && !question.guided) lessonSession.assisted += 1;
      if (!lessonSession.isPlacement && !lessonSession.isPractice && !assisted) state.hearts = Math.max(0, state.hearts - 1);
      if (!lessonSession.integrityBlocked) addMistake(lessonSession.courseId, question.word);
      lessonFooter.className = "lesson-footer is-wrong";
      lessonMascot.className = "mascot-sprite mascot-hint";
      feedback.innerHTML = `<strong>${evaluation === "near" ? "The meaning was close, but the exact form matters." : "Keep going—the answer stays visible."}</strong><span>Correct answer: ${escapeHtml(question.answer)}${assisted || lessonSession.isPractice ? " · No heart lost." : state.hearts === 0 ? " · Practice mode is still available." : ""}</span>`;
      document.querySelector("#lesson-heart-count").textContent = state.hearts;
    }
    if (!lessonSession.integrityBlocked && !question.guided) recordMastery(lessonSession.courseId, question.word, correct, assisted);
    checkButton.disabled = false;
    checkButton.textContent = lessonSession.index === lessonSession.questions.length - 1 ? "Finish" : "Continue";
    saveState();
  }

  function markMeaningFirstSeen(courseId, word) {
    if (!word?.target) return;
    if (!state.meaningFirstSeen[courseId]) state.meaningFirstSeen[courseId] = {};
    state.meaningFirstSeen[courseId][word.target] = true;
    saveState();
  }

  function finishLesson() {
    const session = lessonSession;
    if (session.isPlacement) {
      finishPlacement();
      return;
    }
    if (session.integrityBlocked) {
      session.finished = true;
      document.querySelector("#lesson-progress-fill").style.width = "100%";
      lessonMascot.className = "mascot-sprite mascot-hint";
      lessonPrompt.textContent = "Orientation preview complete. Progress remains protected.";
      lessonCard.innerHTML = `
        <div class="lesson-summary integrity-summary">
          <div class="mascot-sprite mascot-hint" role="img" aria-label="Dragon holding a review note"></div>
          <h1>Preview complete—no academic credit awarded</h1>
          <p>${session.mediaGaps.length} required reviewed ${courses[session.courseId].modality === "visual" ? "video" : "audio"} model${session.mediaGaps.length === 1 ? " is" : "s are"} pending. This node stays open, mastery is unchanged, and no XP or gems were awarded.</p>
          <div class="summary-stats">
            <div><strong>0</strong><small>XP earned</small></div>
            <div><strong>0</strong><small>Mastery credit</small></div>
            <div><strong>${session.mediaGaps.length}</strong><small>Media gates</small></div>
          </div>
        </div>`;
      feedback.innerHTML = `<strong>Integrity gate preserved.</strong><span>Pending: ${escapeHtml(session.mediaGaps.slice(0, 4).join(", "))}${session.mediaGaps.length > 4 ? "…" : ""}</span>`;
      lessonFooter.className = "lesson-footer is-guided";
      checkButton.textContent = "Return to path";
      checkButton.disabled = false;
      return;
    }
    const firstCompletion = !state.completed[session.courseId].includes(session.lessonId);
    if (!session.isPractice && firstCompletion) state.completed[session.courseId].push(session.lessonId);
    if (session.isPractice) state.hearts = Math.min(5, state.hearts + 1);

    const completionBonus = session.isPractice ? 10 : 20;
    const totalEarned = session.earnedXP + completionBonus;
    state.xp += totalEarned;
    state.dailyXP += totalEarned;
    state.lessonsToday += 1;
    if (session.independentCorrect === session.gradedTotal && session.assisted === 0) state.perfectLessons += 1;
    state.gems += session.isPractice ? 2 : 5;
    updateStreak();
    saveState();

    session.finished = true;
    document.querySelector("#lesson-progress-fill").style.width = "100%";
    lessonMascot.className = "mascot-sprite mascot-celebrate";
    lessonPrompt.textContent = "Quest complete! Your new knowledge is secured.";
    lessonCard.innerHTML = `
      <div class="lesson-summary">
        <div class="mascot-sprite mascot-celebrate" role="img" aria-label="Dragon celebrating"></div>
        <h1>${session.isPractice ? "Practice complete!" : "Lesson complete!"}</h1>
        <p>You connected meaning, sound, conversation, and written form. Independent answers advance mastery fastest.</p>
        <div class="summary-stats">
          <div><strong>+${totalEarned}</strong><small>XP earned</small></div>
          <div><strong>${session.independentCorrect}/${session.gradedTotal}</strong><small>Independent</small></div>
          <div><strong>${session.assisted}</strong><small>With support</small></div>
          <div><strong>+${session.isPractice ? 2 : 5}</strong><small>Dragon gems</small></div>
        </div>
      </div>`;
    feedback.innerHTML = `<strong>${session.isPractice ? "One heart restored." : firstCompletion ? "A new path node is unlocked." : "Review complete."}</strong><span>Your progress is saved on this device.</span>`;
    lessonFooter.className = "lesson-footer is-correct";
    checkButton.textContent = "Return to path";
    checkButton.disabled = false;
    burstConfetti();
  }

  function finishPlacement() {
    const session = lessonSession;
    const course = courses[session.courseId];
    const ratio = session.correct / session.gradedTotal;
    const recommendedUnit = ratio >= 0.88 ? 4 : ratio >= 0.63 ? 3 : ratio >= 0.38 ? 2 : 1;
    state.placement[session.courseId] = recommendedUnit;

    for (let unitIndex = 0; unitIndex < recommendedUnit - 1; unitIndex += 1) {
      course.units[unitIndex].lessonNames.forEach((_, lessonIndex) => {
        const id = lessonId(course.id, unitIndex, lessonIndex);
        if (!state.completed[course.id].includes(id)) state.completed[course.id].push(id);
      });
    }

    const earned = 25;
    state.xp += earned;
    state.dailyXP += earned;
    state.gems += 3;
    saveState();
    session.finished = true;
    document.querySelector("#lesson-progress-fill").style.width = "100%";
    lessonMascot.className = "mascot-sprite mascot-celebrate";
    lessonPrompt.textContent = "Path check complete. Your recommended starting point is ready.";
    lessonCard.innerHTML = `
      <div class="lesson-summary">
        <div class="mascot-sprite mascot-celebrate" role="img" aria-label="Dragon celebrating"></div>
        <h1>Start at Unit ${recommendedUnit}</h1>
        <p>You scored ${session.correct}/${session.gradedTotal}. Earlier units remain available for review, and your result is saved on this device.</p>
        <div class="summary-stats">
          <div><strong>${session.correct}/${session.gradedTotal}</strong><small>Path check</small></div>
          <div><strong>Unit ${recommendedUnit}</strong><small>Recommended</small></div>
          <div><strong>+${earned}</strong><small>XP earned</small></div>
        </div>
      </div>`;
    feedback.innerHTML = `<strong>Placement saved.</strong><span>The path has opened through your recommended starting point.</span>`;
    lessonFooter.className = "lesson-footer is-correct";
    checkButton.textContent = "Return to path";
    checkButton.disabled = false;
    burstConfetti();
  }

  function closeLesson(force = false) {
    if (lessonSession && !lessonSession.finished && !force) {
      const leave = window.confirm("Leave this lesson? Finished questions will not count toward path progress.");
      if (!leave) return;
    }
    stopSpeechPlayback();
    if (activeRecognition) activeRecognition.abort();
    lessonShell.hidden = true;
    document.body.style.overflow = "";
    lessonSession = null;
    renderView(currentView === "practice" ? "practice" : "learn");
  }

  function registerOfflineSupport() {
    if (!("serviceWorker" in navigator) || !/^https?:$/.test(window.location.protocol)) return;
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // The app remains fully usable online or from a local folder if registration is unavailable.
    });
  }

  function purchaseItem(itemId) {
    const items = {
      hearts: { cost: 60, buy: () => { state.hearts = 5; }, message: "Hearts refilled!" },
      freeze: { cost: 100, buy: () => { state.purchases.streakFreeze += 1; }, message: "Streak shield equipped!" },
      aura: { cost: 150, buy: () => { state.purchases.scholarAura = true; }, message: "Scholar aura unlocked!" }
    };
    const item = items[itemId];
    if (!item || state.gems < item.cost) return;
    state.gems -= item.cost;
    item.buy();
    saveState();
    renderShop();
    toast(item.message);
  }

  function toggleSound() {
    state.sound = !state.sound;
    if (!state.sound) stopSpeechPlayback();
    saveState();
  }

  function exportProgress() {
    const payload = JSON.stringify({ app: "Dragon Tongues", version: 2, exportedAt: new Date().toISOString(), state }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `dragon-tongues-progress-${todayKey()}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Progress backup downloaded.");
  }

  function importProgress() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.addEventListener("change", async () => {
      try {
        const payload = JSON.parse(await input.files[0].text());
        validateProgressBackup(payload);
        state = {
          ...structuredClone(defaultState),
          ...payload.state,
          completed: { ...structuredClone(defaultState.completed), ...(payload.state.completed || {}) },
          mastery: { ...structuredClone(defaultState.mastery), ...(payload.state.mastery || {}) },
          meaningFirstSeen: { ...structuredClone(defaultState.meaningFirstSeen), ...(payload.state.meaningFirstSeen || {}) },
          placement: { ...structuredClone(defaultState.placement), ...(payload.state.placement || {}) },
          showReadings: { ...structuredClone(defaultState.showReadings), ...(payload.state.showReadings || {}) },
          purchases: { ...defaultState.purchases, ...(payload.state.purchases || {}) }
        };
        saveState();
        renderCourseDialog();
        renderView("profile");
        toast("Progress backup restored.");
      } catch {
        toast("That file is not a valid Dragon Tongues progress backup.");
      }
    });
    input.click();
  }

  function validateProgressBackup(payload) {
    if (!payload || payload.app !== "Dragon Tongues" || payload.version !== 2 || !payload.state || typeof payload.state !== "object" || Array.isArray(payload.state)) throw new Error("invalid backup envelope");
    const candidate = payload.state;
    const finiteInteger = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
    for (const key of ["xp", "gems", "dailyXP", "lessonsToday", "perfectLessons"]) if (!finiteInteger(candidate[key], 0, 100000000)) throw new Error(`${key} is invalid`);
    if (!finiteInteger(candidate.hearts, 0, 5) || !finiteInteger(candidate.streak, 0, 100000)) throw new Error("heart or streak count is invalid");
    if (typeof candidate.sound !== "boolean" || !courses[candidate.activeCourse]) throw new Error("course or sound setting is invalid");
    const courseIds = Object.keys(courses);
    if (!candidate.completed || !candidate.mastery || !candidate.placement) throw new Error("progress maps are missing");
    for (const courseId of courseIds) {
      const completed = candidate.completed[courseId];
      if (!Array.isArray(completed) || completed.length > 72 || completed.some(id => typeof id !== "string" || !new RegExp(`^${courseId}-u(?:[0-9]|1[01])-l[0-5]$`).test(id))) throw new Error(`${courseId} completion data is invalid`);
      const mastery = candidate.mastery[courseId];
      if (!mastery || typeof mastery !== "object" || Array.isArray(mastery) || Object.keys(mastery).length > 250) throw new Error(`${courseId} mastery data is invalid`);
      const validTargets = new Set(courses[courseId].units.flatMap(unit => unit.vocab).map(word => word.target));
      for (const [target, item] of Object.entries(mastery)) {
        if (!validTargets.has(target) || !item || typeof item !== "object") throw new Error(`${courseId} mastery target is invalid`);
        for (const field of ["attempts", "correct", "supported", "streak"]) if (!finiteInteger(Number(item[field] || 0), 0, 1000000)) throw new Error(`${courseId} mastery count is invalid`);
        if (item.independentDates !== undefined && (!Array.isArray(item.independentDates) || item.independentDates.length > 12 || item.independentDates.some(value => !/^\d{4}-\d{2}-\d{2}$/.test(value)))) throw new Error(`${courseId} review dates are invalid`);
      }
      if (!(candidate.placement[courseId] === null || finiteInteger(candidate.placement[courseId], 1, 12))) throw new Error(`${courseId} placement is invalid`);
    }
    if (!Array.isArray(candidate.mistakes) || candidate.mistakes.length > 40 || candidate.mistakes.some(item => !item || !courses[item.courseId] || typeof item.target !== "string" || typeof item.english !== "string")) throw new Error("mistake data is invalid");
    if (!candidate.purchases || !finiteInteger(Number(candidate.purchases.streakFreeze || 0), 0, 1000) || typeof candidate.purchases.scholarAura !== "boolean") throw new Error("purchase data is invalid");
  }

  function canonicalAslKey(value) {
    return String(value || "")
      .toUpperCase()
      .replace(/[.!?,;:]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function aslMediaKey(value) {
    if (value === "Deaf") return "DEAF-CULTURAL";
    if (value === "deaf") return "DEAF-AUDIOLOGICAL";
    return canonicalAslKey(value);
  }

  function isAslLetter(value) {
    return /^[A-Z]$/.test(canonicalAslKey(value));
  }

  function isReadyAslClip(clip, library) {
    if (!clip || clip.status !== "ready" || !clip.src || !clip.creator || !(clip.reviewedBy || library?.reviewedBy)) return false;
    if (!ASL_READY_LICENSES.has(clip.license)) return false;
    if (clip.license === "CUSTOM-REDISTRIBUTION" && !clip.rightsConfirmation) return false;
    return true;
  }

  function getAslVideoClip(target) {
    const key = aslMediaKey(target);
    const runtimeClip = runtimeAslLibrary?.clips?.[key];
    if (isReadyAslClip(runtimeClip, runtimeAslLibrary)) return runtimeClip;
    const packagedClip = packagedAslLibrary.clips?.[key];
    return isReadyAslClip(packagedClip, packagedAslLibrary) ? packagedClip : null;
  }

  function hasAslVideoModel(target) {
    return Boolean(getAslVideoClip(target));
  }

  function hasAslVisualModel(target) {
    return isAslLetter(target) || hasAslVideoModel(target);
  }

  function aslLibraryStats() {
    const requirements = new Set();
    courses.asl.units.forEach(unit => {
      unit.vocab.forEach(word => requirements.add(aslMediaKey(word.target)));
      unit.dialogue.forEach(line => requirements.add(aslMediaKey(line.target)));
    });
    const ready = [...requirements].filter(target => hasAslVideoModel(target)).length;
    return { required: requirements.size, ready, runtime: Boolean(runtimeAslLibrary) };
  }

  function renderAslModel(target, english, course, options = {}) {
    const clip = getAslVideoClip(target);
    const compactClass = options.compact ? " is-compact" : "";
    if (clip) {
      const reviewer = clip.reviewedBy || runtimeAslLibrary?.reviewedBy || packagedAslLibrary.reviewedBy;
      const creator = clip.sourceUrl
        ? `<a href="${escapeAttribute(clip.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(clip.creator)}</a>`
        : escapeHtml(clip.creator);
      const license = clip.licenseUrl
        ? `<a href="${escapeAttribute(clip.licenseUrl)}" target="_blank" rel="noreferrer">${escapeHtml(clip.license)}</a>`
        : escapeHtml(clip.license);
      return `<div class="asl-model${compactClass}">
        <video controls playsinline loop preload="metadata" src="${escapeAttribute(clip.src)}" aria-label="${options.hideLabel ? "Reviewed ASL model for this question" : `Reviewed ASL model for ${escapeAttribute(target)}`}"></video>
        <div class="asl-speed-controls" aria-label="Video speed"><button type="button" data-asl-rate="0.5">½ speed</button><button class="is-active" type="button" data-asl-rate="1">Normal</button></div>
        ${options.hideLabel ? "" : `<strong class="asl-model-label">${escapeHtml(target)}</strong><span>${escapeHtml(english)}</span>`}
        <small>Model: ${creator} · Reviewed by ${escapeHtml(reviewer)} · ${license}</small>
      </div>`;
    }

    if (isAslLetter(target)) {
      const positions = {
        A: [15, 10], B: [80, 10], C: [145, 10], D: [210, 10], E: [275, 10], F: [340, 10], G: [405, 10],
        H: [15, 175], I: [90, 175], J: [170, 175], K: [245, 175], L: [325, 175], M: [400, 175],
        N: [15, 350], O: [90, 350], P: [170, 350], Q: [245, 350], R: [325, 350], S: [400, 350],
        T: [15, 505], U: [80, 505], V: [145, 505], W: [210, 505], X: [275, 505], Y: [340, 505], Z: [405, 505]
      };
      const letter = canonicalAslKey(target);
      const [left, top] = positions[letter];
      return `<div class="asl-model asl-letter-model${compactClass}">
        <div class="asl-chart-window" role="img" aria-label="${options.hideLabel ? "Unlabeled ASL fingerspelling handshape for this question" : `ASL fingerspelling handshape for ${letter}`}">
          <img src="${escapeAttribute(course.visualAsset)}" alt="" style="--asl-left:-${left}px;--asl-top:-${top}px">
        </div>
        ${options.hideLabel ? "" : `<strong class="asl-model-label">Letter ${escapeHtml(letter)}</strong>`}
        <small>Public-domain Gallaudet fingerspelling chart${/[JZ]/.test(letter) ? " · moving letter; reviewed video still required for production" : ""}</small>
      </div>`;
    }

    const message = options.context === "production"
      ? "Production stays paused until this exact sign or exchange has a reviewed moving model."
      : "This is a meaning/gloss preview. A reviewed native-signer model is scheduled in the production shot list.";
    return `<div class="asl-model asl-model-pending${compactClass}">
      <span aria-hidden="true">🎬</span>
      <strong>Reviewed video model pending</strong>
      <p>${escapeHtml(message)}</p>
    </div>`;
  }

  function renderAslDialogueModel(line) {
    const clip = getAslVideoClip(line.target);
    if (!clip) return `<span class="video-pending-badge">Video pending</span>`;
    return `<div class="dialogue-video"><video controls playsinline loop preload="metadata" src="${escapeAttribute(clip.src)}" aria-label="Reviewed ASL model for dialogue line ${escapeAttribute(line.speaker)}"></video><small>${escapeHtml(clip.creator)} · ${escapeHtml(clip.license)}</small></div>`;
  }

  function loadAslVideoPack() {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".json,.webm,.mp4,application/json,video/webm,video/mp4";
    input.addEventListener("change", async () => {
      try {
        const files = [...input.files];
        const manifestFile = files.find(file => file.name.toLowerCase() === "asl-video-pack.json") || files.find(file => file.name.toLowerCase().endsWith(".json"));
        if (!manifestFile) throw new Error("Select asl-video-pack.json together with its videos.");
        const manifest = JSON.parse(await manifestFile.text());
        if (manifest.schemaVersion !== 1 || !manifest.clips || typeof manifest.clips !== "object") throw new Error("The video-pack manifest is not schema version 1.");

        const filesByName = new Map(files.filter(file => file !== manifestFile).map(file => [file.name, file]));
        const readyClips = {};
        const newUrls = [];
        for (const [rawKey, rawClip] of Object.entries(manifest.clips)) {
          if (rawClip.status !== "ready") continue;
          const reviewer = rawClip.reviewedBy || manifest.reviewedBy;
          if (!rawClip.creator || !reviewer) throw new Error(`${rawKey}: creator and Deaf ASL educator review are required.`);
          if (!ASL_READY_LICENSES.has(rawClip.license)) throw new Error(`${rawKey}: ${rawClip.license || "missing license"} is not an approved redistribution license.`);
          if (rawClip.license === "CUSTOM-REDISTRIBUTION" && !rawClip.rightsConfirmation) throw new Error(`${rawKey}: a signed rights-confirmation identifier is required.`);

          let source = rawClip.src;
          if (!source || !/^https:\/\//i.test(source)) {
            const requestedName = String(rawClip.assetFile || source || "").split(/[\\/]/).pop();
            const videoFile = filesByName.get(requestedName);
            if (!videoFile) throw new Error(`${rawKey}: select the referenced file ${requestedName || "(missing assetFile)"}.`);
            source = URL.createObjectURL(videoFile);
            newUrls.push(source);
          }
          readyClips[aslMediaKey(rawKey)] = { ...rawClip, reviewedBy: reviewer, src: source };
        }
        if (!Object.keys(readyClips).length) throw new Error("The selected pack contains no clips marked ready.");

        runtimeAslObjectUrls.forEach(url => URL.revokeObjectURL(url));
        runtimeAslObjectUrls = newUrls;
        runtimeAslLibrary = { ...manifest, clips: readyClips };
        if (state.activeCourse === "asl" && currentView === "learn") renderLearn();
        toast(`${Object.keys(readyClips).length} reviewed ASL video model${Object.keys(readyClips).length === 1 ? "" : "s"} loaded for this session.`);
      } catch (error) {
        toast(error.message || "That ASL video pack could not be loaded.");
      } finally {
        input.remove();
      }
    });
    input.click();
  }

  function startSpeechRecognition(question, course) {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const result = document.querySelector("#speech-result");
    if (!Recognition) {
      result.textContent = "Microphone scoring is unavailable in this browser. Practice with the model, then use the confirmation button.";
      return;
    }
    if (activeRecognition) activeRecognition.abort();
    activeRecognition = new Recognition();
    activeRecognition.lang = course.speechLang;
    activeRecognition.interimResults = false;
    activeRecognition.maxAlternatives = 3;
    result.textContent = "Listening… say the complete phrase.";
    activeRecognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      result.textContent = `Heard: “${transcript}” — compare it with the model and try again if needed.`;
      checkButton.disabled = false;
      activeRecognition = null;
    };
    activeRecognition.onerror = () => {
      result.textContent = "The microphone could not score this attempt. You can still practice and confirm it yourself.";
      activeRecognition = null;
    };
    activeRecognition.onend = () => { activeRecognition = null; };
    activeRecognition.start();
  }

  function canonicalVoiceText(text) {
    return String(text || "").trim().replace(/\s+/g, " ");
  }

  function packagedVoiceClip(text, language) {
    if (!language) return null;
    const key = `${language}::${canonicalVoiceText(text)}`;
    const clip = packagedVoiceLibrary.clips?.[key];
    return clip?.status === "ready" && clip.src ? clip : null;
  }

  function compatibleBrowserVoice(language) {
    if (!language || !("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return null;
    const normalize = value => String(value || "").replace(/_/g, "-").toLowerCase();
    const requested = normalize(language);
    const requestedBase = requested.split("-")[0];
    const voices = window.speechSynthesis.getVoices();
    return voices.find(voice => normalize(voice.lang) === requested)
      || voices.find(voice => normalize(voice.lang).split("-")[0] === requestedBase)
      || null;
  }

  function speechSourceFor(text, language) {
    if (packagedVoiceClip(text, language)) return "packaged";
    if (compatibleBrowserVoice(language)) return "device";
    return null;
  }

  function stopSpeechPlayback() {
    audioSequenceToken += 1;
    if (activeLessonAudio) {
      activeLessonAudio.pause();
      activeLessonAudio.removeAttribute("src");
      activeLessonAudio.load();
      activeLessonAudio = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  function packagedPlaybackRate(rate) {
    return rate ? Math.max(0.68, Math.min(1.15, rate / 0.78)) : 1;
  }

  function playPackagedClip(clip, rate, token) {
    return new Promise(resolve => {
      if (token !== audioSequenceToken) return resolve(false);
      const audio = new Audio(clip.src);
      activeLessonAudio = audio;
      audio.preload = "auto";
      audio.playbackRate = packagedPlaybackRate(rate);
      audio.preservesPitch = true;
      audio.mozPreservesPitch = true;
      audio.webkitPreservesPitch = true;
      const finish = result => {
        if (activeLessonAudio === audio) activeLessonAudio = null;
        resolve(result);
      };
      audio.addEventListener("ended", () => finish(true), { once: true });
      audio.addEventListener("error", () => finish(false), { once: true });
      audio.play().catch(() => finish(false));
    });
  }

  function speak(text, language, rate) {
    if (!state.sound || !language) return false;
    const clip = packagedVoiceClip(text, language);
    if (clip) {
      stopSpeechPlayback();
      const token = audioSequenceToken;
      playPackagedClip(clip, rate, token).then(played => {
        if (!played && token === audioSequenceToken) toast("The packaged audio file could not be played on this device.");
      });
      return true;
    }

    const voice = compatibleBrowserVoice(language);
    if (!voice) return false;
    stopSpeechPlayback();
    window.speechSynthesis.resume();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = voice.lang;
    utterance.voice = voice;
    utterance.rate = rate || (["ja-JP", "ko-KR", "zh-CN"].includes(language) ? 0.72 : 0.78);
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  function speakDialogue(lines, language) {
    if (!state.sound || !language) return false;
    const clips = lines.map(line => packagedVoiceClip(line.target, language));
    if (clips.every(Boolean)) {
      stopSpeechPlayback();
      const token = audioSequenceToken;
      (async () => {
        for (const clip of clips) {
          if (token !== audioSequenceToken) return;
          const played = await playPackagedClip(clip, null, token);
          if (!played) return;
        }
      })();
      return true;
    }

    const voice = compatibleBrowserVoice(language);
    if (!voice) return false;
    stopSpeechPlayback();
    window.speechSynthesis.resume();
    lines.forEach(line => {
      const utterance = new window.SpeechSynthesisUtterance(line.target);
      utterance.lang = voice.lang;
      utterance.voice = voice;
      utterance.rate = ["ja-JP", "ko-KR", "zh-CN"].includes(language) ? 0.7 : 0.76;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    });
    return true;
  }

  function updateChrome() {
    const course = activeCourse();
    document.documentElement.dataset.dragonTonguesBuild = BUILD_ID;
    document.querySelectorAll("[data-build-version]").forEach(element => {
      element.textContent = `V${APP_VERSION} · TEACH ME`;
      element.title = BUILD_ID;
    });
    document.querySelector("#course-flag").textContent = course.sigil;
    document.querySelector("#course-name").textContent = course.name;
    document.querySelector("#mobile-course-flag").textContent = course.sigil;
    document.querySelector("#mobile-course-name").textContent = course.name;
    document.querySelector("#streak-count").textContent = state.streak;
    document.querySelector("#gem-count").textContent = state.gems;
    document.querySelector("#heart-count").textContent = state.hearts;
    document.querySelector("#sound-toggle").setAttribute("aria-pressed", String(state.sound));
    document.querySelector("#sound-toggle").innerHTML = `<span aria-hidden="true">${state.sound ? "🔊" : "🔇"}</span><span>Sound ${state.sound ? "on" : "off"}</span>`;

    const quest = questData()[0];
    document.querySelector("#rail-quest-title").textContent = quest.title;
    document.querySelector("#rail-quest-progress").style.width = `${Math.min(100, (quest.value / quest.goal) * 100)}%`;
    document.querySelector("#rail-quest-copy").textContent = `${quest.value} / ${quest.goal} XP`;
    document.querySelector("#league-position").textContent = `#${Math.max(1, 7 - Math.floor(state.xp / 400))}`;

    const nextLesson = state.completed[course.id].length + 1;
    document.querySelector("#mascot-message-title").textContent = state.dailyXP >= 50 ? "Quest cleared!" : "Ready, scholar?";
    document.querySelector("#mascot-message").textContent = state.dailyXP >= 50 ? "Your daily XP quest is complete." : `Lesson ${nextLesson} is waiting on the ${course.name} path.`;
  }

  function updateStreak() {
    const today = todayKey();
    if (state.lastStudyDate === today) return;
    if (state.lastStudyDate) {
      const previous = new Date(`${state.lastStudyDate}T00:00:00Z`);
      const current = new Date(`${today}T00:00:00Z`);
      const gap = Math.round((current - previous) / 86400000);
      state.streak = gap === 1 ? state.streak + 1 : 1;
    } else {
      state.streak += 1;
    }
    state.lastStudyDate = today;
  }

  function addMistake(courseId, word) {
    if (!word) return;
    state.mistakes = state.mistakes.filter(item => !(item.courseId === courseId && item.target === word.target));
    state.mistakes.push({ courseId, target: word.target, english: word.english, reading: word.reading || "" });
    if (state.mistakes.length > 40) state.mistakes = state.mistakes.slice(-40);
  }

  function recordMastery(courseId, word, correct, assisted = false) {
    if (!word?.target) return;
    if (!state.mastery[courseId]) state.mastery[courseId] = {};
    const current = state.mastery[courseId][word.target] || { attempts: 0, correct: 0, supported: 0, streak: 0, lastSeen: null, independentDates: [] };
    current.attempts += 1;
    current.correct += correct ? 1 : 0;
    current.supported = (current.supported || 0) + (assisted ? 1 : 0);
    if (!assisted) current.streak = correct ? current.streak + 1 : 0;
    current.independentDates = Array.isArray(current.independentDates) ? current.independentDates.filter(value => /^\d{4}-\d{2}-\d{2}$/.test(value)) : [];
    if (correct && !assisted && !current.independentDates.includes(todayKey())) current.independentDates.push(todayKey());
    current.independentDates = current.independentDates.slice(-12);
    current.lastSeen = Date.now();
    const distinctDays = current.independentDates.length;
    current.level = distinctDays >= 3 ? "mastered" : distinctDays >= 2 ? "strong" : distinctDays >= 1 ? "learning" : "new";
    const intervalDays = current.level === "mastered" ? 14 : current.level === "strong" ? 7 : 1;
    current.nextReviewAt = Date.now() + intervalDays * 86400000;
    state.mastery[courseId][word.target] = current;
    if (correct && !assisted && distinctDays >= 3) {
      state.mistakes = state.mistakes.filter(item => !(item.courseId === courseId && item.target === word.target));
    }
  }

  function questData() {
    return [
      { icon: "⚡", title: "Earn 50 XP", copy: "Complete lessons or practice rounds.", value: state.dailyXP, goal: 50 },
      { icon: "🗺️", title: "Complete 2 lessons", copy: "Any launch language counts.", value: state.lessonsToday, goal: 2 },
      { icon: "👑", title: "Finish a perfect lesson", copy: "Answer every question correctly.", value: state.perfectLessons, goal: 1 }
    ];
  }

  function activeCourse() { return courses[state.activeCourse] || courses.spanish; }
  function readingVisible(course) { return Boolean(course.readingLabel && state.showReadings?.[course.id]); }
  function lessonId(courseId, unitIndex, lessonIndex) { return `${courseId}-u${unitIndex}-l${lessonIndex}`; }
  function setCourseTheme(course) {
    document.documentElement.style.setProperty("--course-accent", course.accent);
    document.documentElement.style.setProperty("--course-gradient", course.gradient);
  }

  function pageHeader(title, copy, eyebrow) {
    return `<header class="page-header"><span class="eyebrow">${escapeHtml(eyebrow)}</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(copy)}</p></header>`;
  }

  function normalizeExact(value, caseSensitive = false) {
    const normalized = String(value ?? "")
      .normalize("NFC")
      .trim()
      .replace(/[’‘‛ʼʻ]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[.!?¿¡。؟،؛,:;"()\[\]]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return caseSensitive ? normalized : normalized.toLocaleLowerCase();
  }

  function normalizeLenient(value) {
    return normalizeExact(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/'/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function requiresCasePrecision(course, expected) {
    if (course?.id !== "asl") return false;
    const folded = normalizeExact(expected);
    const variants = new Set(course.units.flatMap(unit => unit.vocab).map(word => word.target).filter(target => normalizeExact(target) === folded));
    return variants.size > 1;
  }

  function answersMatchExact(selected, expected, course) {
    const caseSensitive = requiresCasePrecision(course, expected);
    return normalizeExact(selected, caseSensitive) === normalizeExact(expected, caseSensitive);
  }

  function evaluateAnswer(selected, accepted, course) {
    if (accepted.some(expected => answersMatchExact(selected, expected, course))) return "correct";
    if (accepted.some(expected => normalizeLenient(selected) === normalizeLenient(expected))) return "near";
    return "wrong";
  }

  function shuffle(values) {
    const copy = [...values];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  }

  function escapeAttribute(value) { return escapeHtml(value).replace(/`/g, "&#96;"); }

  function toast(message) {
    const region = document.querySelector("#toast-region");
    const element = document.createElement("div");
    element.className = "toast";
    element.textContent = message;
    region.append(element);
    setTimeout(() => element.remove(), 3000);
  }

  function burstConfetti() {
    const layer = document.querySelector("#confetti-layer");
    const colors = ["#7043d1", "#23a7e9", "#f3b83f", "#18b77f", "#ee5c72"];
    for (let index = 0; index < 32; index += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[index % colors.length];
      piece.style.setProperty("--drift", `${Math.round(Math.random() * 180 - 90)}px`);
      piece.style.animationDelay = `${Math.random() * .35}s`;
      layer.append(piece);
      setTimeout(() => piece.remove(), 2400);
    }
  }

  window.DRAGON_TONGUES_TEST_API = Object.freeze({
    version: APP_VERSION,
    buildId: BUILD_ID,
    evaluateAnswer: (selected, accepted, courseId) => evaluateAnswer(selected, accepted, courses[courseId]),
    planLesson: (courseId, unitIndex, lessonIndex) => buildQuestions(courses[courseId], courses[courseId].units[unitIndex], lessonIndex, false).map(question => ({
      type: question.type,
      target: question.word?.target || null,
      choices: question.choices ? [...question.choices] : [],
      ungraded: Boolean(question.ungraded),
      guided: Boolean(question.guided)
    })),
    integrityStatus: (courseId, unitIndex, lessonIndex) => {
      const course = courses[courseId];
      const questions = buildQuestions(course, course.units[unitIndex], lessonIndex, false);
      const mediaGaps = requiredMediaGaps(course, questions);
      return { blocked: mediaGaps.length > 0, mediaGaps };
    },
    aslMediaKey
  });
})();
