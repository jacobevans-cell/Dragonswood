import * as pdfjsLib from "./vendor/pdf.mjs";
import { BOOKS } from "./catalog.js?v=20260905-5";
import { CLASSROOM_DICTIONARY } from "./dictionary/classroom.js?v=20260831-16";
import { CHAPTER_MAPS } from "./assessment-data.js?v=20260905-5";
import {
  emptyStudentState,
  gradeSummary,
  gradeTest,
  loadStudentPlans,
  loadStudentState,
  loadTests,
  resetLocalTest,
  saveStudentState,
  saveTest,
  SUMMARY_PROMPT,
  allowNextSeriesBook,
  assignStudentBook,
  forceStudentChapter,
  unlockStudentBook
} from "./assessment-store.js?v=20260905-5";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("./vendor/pdf.worker.mjs", import.meta.url).href;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const elements = {
  libraryView: $("[data-library-view]"),
  readerView: $("[data-reader-view]"),
  bookGrid: $("[data-book-grid]"),
  filters: $("[data-filters]"),
  search: $("[data-search]"),
  empty: $("[data-empty]"),
  storageMessage: $("[data-storage-message]"),
  readingPlan: $("[data-reading-plan]"),
  teacherTools: $("[data-teacher-tools]"),
  title: $("[data-reader-title]"),
  author: $("[data-reader-author]"),
  loading: $("[data-loading]"),
  loadingBar: $("[data-loading-bar]"),
  loadingTitle: $("[data-loading-title]"),
  loadingDetail: $("[data-loading-detail]"),
  stage: $("[data-stage]"),
  spread: $("[data-page-spread]"),
  footer: $("[data-reader-footer]"),
  previous: $("[data-previous]"),
  next: $("[data-next]"),
  pageInput: $("[data-page-input]"),
  pageTotal: $("[data-page-total]"),
  progress: $("[data-progress]"),
  progressLabel: $("[data-progress-label]"),
  zoomLabel: $("[data-zoom-label]"),
  layout: $("[data-layout]"),
  dictionary: $("[data-dictionary]"),
  dictionaryDialog: $("[data-dictionary-dialog]"),
  dictionaryWord: $("[data-dictionary-word]"),
  dictionaryResult: $("[data-dictionary-result]"),
  speech: $("[data-speech]"),
  lockBook: $("[data-lock-book]"),
  lockDialog: $("[data-lock-dialog]"),
  lockCover: $("[data-lock-cover]"),
  lockTitle: $("[data-lock-title]"),
  lockAuthor: $("[data-lock-author]"),
  lockTeaser: $("[data-lock-teaser]"),
  confirmLock: $("[data-confirm-lock]"),
  quizDialog: $("[data-quiz-dialog]"),
  quizForm: $("[data-quiz-form]"),
  quizTitle: $("[data-quiz-title]"),
  quizIntro: $("[data-quiz-intro]"),
  quizProgress: $("[data-quiz-progress]"),
  quizQuestions: $("[data-quiz-questions]"),
  quizResult: $("[data-quiz-result]"),
  quizActions: $("[data-quiz-actions]"),
  testEditor: $("[data-test-editor]"),
  testEditorForm: $("[data-test-editor-form]"),
  testSelect: $("[data-test-select]"),
  testEditorFields: $("[data-test-editor-fields]"),
  resetTest: $("[data-reset-test]"),
  toast: $("[data-toast]"),
  shells: {
    left: $("[data-page-shell='left']"),
    right: $("[data-page-shell='right']")
  },
  canvases: {
    left: $("[data-page-canvas='left']"),
    right: $("[data-page-canvas='right']")
  },
  textLayers: {
    left: $("[data-page-text-layer='left']"),
    right: $("[data-page-text-layer='right']")
  },
  reflowPages: {
    left: $("[data-reflow-page='left']"),
    right: $("[data-reflow-page='right']")
  },
  pageNumbers: {
    left: $("[data-page-number='left']"),
    right: $("[data-page-number='right']")
  }
};

const state = {
  category: "All",
  query: "",
  book: null,
  pdf: null,
  reflowData: null,
  reflowDataPromise: null,
  ocrText: null,
  ocrTextPromise: null,
  ocrLayout: null,
  ocrLayoutPromise: null,
  pageTextCache: new Map(),
  pageWords: new Map(),
  loadingTask: null,
  renderTasks: [],
  renderToken: 0,
  page: 1,
  total: 1,
  zoom: 1,
  layout: localStorage.getItem("dw-class-library-layout") || "auto",
  theme: localStorage.getItem("dw-class-library-theme") || "dark",
  speech: null,
  spokenWords: [],
  activePageWord: null,
  defineMode: false,
  dictionaryCache: new Map(),
  student: emptyStudentState(),
  tests: {},
  pendingBook: null,
  activeTest: null,
  activeGatePage: null,
  editorTestId: "",
  teacherPlans: [],
  studentReady: false,
  teacherMode: false,
  saveTimer: null,
  lastActive: Date.now(),
  toastTimer: null
};

const categories = ["All", "Class Read", "Fantasy", "Adventure", "Realistic", "Funny"];
const progressKey = id => `dw-class-library-progress:${id}`;

function isLocalTester() {
  return location.hostname === "localhost" || location.hostname === "::1" || location.hostname.startsWith("127.");
}

function bookById(id) {
  return BOOKS.find(book => book.id === id);
}

function seriesPrerequisite(book) {
  const number = Number(book?.seriesNumber || 0);
  if (!book?.seriesId || number <= 1) return null;
  return BOOKS.find(candidate => candidate.seriesId === book.seriesId && Number(candidate.seriesNumber) === number - 1) || null;
}

function nextSeriesBook(book) {
  const number = Number(book?.seriesNumber || 0);
  if (!book?.seriesId || !number) return null;
  return BOOKS.find(candidate => candidate.seriesId === book.seriesId && Number(candidate.seriesNumber) === number + 1) || null;
}

function seriesLock(book) {
  if (state.teacherMode || state.student.lockedBookId === book?.id) return null;
  if (state.student.seriesOverrideBookIds?.includes(book?.id)) return null;
  const prerequisite = seriesPrerequisite(book);
  if (!prerequisite || state.student.completedBookIds.includes(prerequisite.id)) return null;
  return prerequisite;
}

function lockedBook() {
  return bookById(state.student.lockedBookId);
}

function persistStudentSoon() {
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(async () => {
    state.student = await saveStudentState(state.student);
    renderReadingPlan();
  }, 180);
}

function setSavedPage(book, page) {
  if (!book) return;
  const safePage = Math.max(1, Math.min(book.pages || state.total || 9999, Math.round(Number(page) || 1)));
  state.student.pages[book.id] = safePage;
  localStorage.setItem(progressKey(book.id), String(safePage));
  persistStudentSoon();
}

function migrateReflowProgress(book) {
  if (book?.kind !== "reflow" || !book.progressVersion) return;
  state.student.pageVersions ||= {};
  if (state.student.pageVersions[book.id] === book.progressVersion) return;
  const accountPage = Number(state.student.pages?.[book.id] || 0);
  const devicePage = Number(localStorage.getItem(progressKey(book.id)) || 0);
  const oldPage = Math.max(accountPage, devicePage, 1);
  const currentVersion = state.student.pageVersions[book.id] || "";
  const oldTotal = Math.max(2, Number(book.progressMigrations?.[currentVersion]) || Number(book.previousPages) || Number(book.pages) || 2);
  const newTotal = Math.max(2, Number(book.pages) || 2);
  const migratedPage = oldPage > 1
    ? Math.max(1, Math.min(newTotal, 1 + Math.round(((oldPage - 1) / (oldTotal - 1)) * (newTotal - 1))))
    : 1;
  state.student.pages[book.id] = migratedPage;
  state.student.pageVersions[book.id] = book.progressVersion;
  localStorage.setItem(progressKey(book.id), String(migratedPage));
  persistStudentSoon();
}

function savedPage(book) {
  const accountPage = Number(state.student.pages?.[book.id]);
  const page = Number.isFinite(accountPage) && accountPage > 0
    ? accountPage
    : Number(localStorage.getItem(progressKey(book.id)) || 1);
  return Math.max(1, Math.min(book.pages || 9999, Number.isFinite(page) ? page : 1));
}

function renderReadingPlan() {
  const chosen = lockedBook();
  const storageLabel = state.student.storageMode === "account" ? "Saved to this student account" : "Saved on this device";
  elements.storageMessage.textContent = state.student.storageMode === "account"
    ? "Your book, page, and chapter-test scores are saved to your student account."
    : "Your book, page, and chapter-test scores are saved in this browser tester.";
  if (!chosen) {
    elements.readingPlan.innerHTML = `
      <div class="reading-plan-icon" aria-hidden="true">◇</div>
      <div class="reading-plan-main">
        <strong>Find the book that fits you</strong>
        <span>Choose a cover to read a quick invitation. The reader opens after you lock in. Only your teacher can release an unfinished book.</span>
      </div>
      <small>${storageLabel}</small>`;
    return;
  }
  const page = savedPage(chosen);
  const teacherUnlock = state.teacherMode && !state.student.completedBookIds.includes(chosen.id)
    ? '<button class="secondary-action" type="button" data-teacher-unlock>Teacher unlock</button>'
    : "";
  elements.readingPlan.innerHTML = `
    <div class="reading-plan-icon" aria-hidden="true">◆</div>
    <div class="reading-plan-main">
      <strong>${chosen.title}</strong>
      <span>Locked reading quest · Continue on page ${page}</span>
    </div>
    <small>${storageLabel}</small>
    ${teacherUnlock}`;
}

function bookCard(book) {
  const page = savedPage(book);
  const percent = Math.round(((page - 1) / Math.max(1, book.pages - 1)) * 100);
  const chosenId = state.student.lockedBookId;
  const isChoice = chosenId === book.id;
  const isOther = Boolean(chosenId && !isChoice);
  const prerequisite = seriesLock(book);
  const isSeriesLocked = Boolean(prerequisite);
  const disabled = isOther || isSeriesLocked;
  const badge = isChoice
    ? `◆ Locked · page ${page}`
    : isOther
      ? "Locked"
      : isSeriesLocked
        ? `Finish book ${prerequisite.seriesNumber} first`
        : book.badge || (page > 1 ? `Continue · page ${page}` : "See if it fits");
  const titleSize = book.title.length > 31 ? "long" : book.title.length > 20 ? "medium" : "";
  return `
    <button class="book-card ${isChoice ? "locked-choice" : ""} ${disabled ? "locked-other" : ""}" type="button" data-book-id="${book.id}" aria-label="${disabled ? "Locked. " : "Open "}${book.title} by ${book.author}" ${disabled ? "disabled" : ""}>
      <span class="cover-wrap">
        <img src="${book.cover}" alt="Cover of ${book.title}" loading="lazy" decoding="async">
        <span class="book-badge">${badge}</span>
        <span class="cover-title ${titleSize}">
          <strong>${book.title}</strong>
          <small>${book.author}</small>
        </span>
      </span>
      <span class="book-copy">
        <strong>${book.title}</strong>
        <small>${book.author}</small>
      </span>
      <span class="book-progress" aria-hidden="true"><span style="width:${percent}%"></span></span>
    </button>`;
}

function renderShelf() {
  const query = state.query.trim().toLowerCase();
  const filtered = BOOKS.filter(book => {
    const inCategory = state.category === "All" || book.category === state.category;
    const haystack = `${book.title} ${book.author} ${book.series || ""}`.toLowerCase();
    return inCategory && (!query || haystack.includes(query));
  });
  elements.bookGrid.innerHTML = filtered.map(bookCard).join("");
  elements.empty.hidden = filtered.length > 0;
  renderReadingPlan();
}

function renderFilters() {
  elements.filters.innerHTML = categories.map(category => `
    <button class="filter-chip ${state.category === category ? "active" : ""}" type="button" data-category="${category}" aria-pressed="${state.category === category}">${category}</button>
  `).join("");
}

function isCompact() {
  const breakpoint = state.book?.kind === "reflow" ? 720 : 900;
  return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
}

function useSpread() {
  if (isCompact()) return false;
  return state.layout === "spread" || state.layout === "auto";
}

function chapterMap(book = state.book) {
  const map = book ? CHAPTER_MAPS[book.id] : null;
  if (!map?.verified) return null;
  if (book.pages && map.editionPages && Number(book.pages) !== Number(map.editionPages)) return null;
  return map;
}

function testForChapter(chapter) {
  const test = chapter ? state.tests[chapter.testId] : null;
  return test?.status === "published" && test.summaryRequired === true && String(test.summaryGuide || "").trim() && Array.isArray(test.questions) && test.questions.length === 7 ? test : null;
}

function hasPassed(testId) {
  return Boolean(state.student.passedTests?.[testId]);
}

function gateForTarget(targetPage, book = state.book) {
  if (!book || (!state.teacherMode && state.student.lockedBookId !== book.id)) return null;
  const map = chapterMap(book);
  if (!map) return null;
  const target = Math.max(1, Math.round(Number(targetPage) || 1));
  const forcedChapter = Math.max(0, Number(state.student.chapterOverrides?.[book.id]?.chapterNumber) || 0);
  for (let index = 1; index < map.chapters.length; index += 1) {
    const chapter = map.chapters[index - 1];
    const nextChapter = map.chapters[index];
    const test = testForChapter(chapter);
    if (target >= nextChapter.startPage && Number(nextChapter.number) > forcedChapter && test && !hasPassed(test.id)) {
      return { test, chapter, nextChapter, gatePage: nextChapter.startPage };
    }
  }
  const lastChapter = map.chapters.at(-1);
  const finalTest = testForChapter(lastChapter);
  const chapterEndPage = Number(lastChapter?.endPage || book.pages || state.total || map.editionPages) || 1;
  if (target > chapterEndPage && Number(lastChapter?.number) > forcedChapter && finalTest && !hasPassed(finalTest.id)) {
    return { test: finalTest, chapter: lastChapter, nextChapter: null, gatePage: chapterEndPage + 1, completesBook: true };
  }
  return null;
}

function farthestUnlockedPage(book = state.book) {
  const map = chapterMap(book);
  if (!map || (!state.teacherMode && state.student.lockedBookId !== book?.id)) return book?.pages || state.total || 1;
  const gate = gateForTarget(book.pages || state.total || map.editionPages, book);
  return gate ? gate.gatePage - 1 : book.pages || state.total || map.editionPages;
}

function waitForReaderLayout() {
  return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

function settleReaderFit() {
  const bookId = state.book?.id;
  setTimeout(() => {
    if (state.book?.id === bookId && !elements.readerView.hidden) renderCurrent().catch(handleRenderError);
  }, 320);
}

function normalizedPage(page) {
  const safe = Math.max(1, Math.min(state.total, Math.round(Number(page) || 1)));
  if (!useSpread() || safe === 1) return safe;
  return safe % 2 === 0 ? safe : safe - 1;
}

function pagesForView() {
  if (!useSpread()) return [state.page];
  if (state.page === 1) return [1];
  const secondPage = Math.min(state.total, state.page + 1);
  if (gateForTarget(secondPage)) return [state.page];
  return [state.page, secondPage];
}

function toast(message) {
  clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  state.toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2600);
}

function updateUrl(bookId = "") {
  const url = new URL(location.href);
  if (bookId) url.searchParams.set("book", bookId);
  else url.searchParams.delete("book");
  history.replaceState(null, "", url);
}

function legacyUrl(book) {
  const url = new URL(book.href, location.href);
  const current = new URL(location.href);
  if (current.searchParams.get("dwEmbed") === "1") url.searchParams.set("dwEmbed", "1");
  const environment = current.searchParams.get("dw-env");
  if (environment) url.searchParams.set("dw-env", environment);
  return url.href;
}

function imageUrl(book, pageNumber) {
  const padded = String(pageNumber).padStart(3, "0");
  return new URL(book.imagePattern.replace("{page}", padded), document.baseURI).href;
}

async function loadReflowData() {
  if (!state.book?.contentFile) return null;
  if (!state.reflowDataPromise) {
    const url = new URL(state.book.contentFile, document.baseURI).href;
    state.reflowDataPromise = fetch(url).then(response => {
      if (!response.ok) throw new Error(`Book text request failed: ${response.status}`);
      return response.json();
    });
  }
  state.reflowData ||= await state.reflowDataPromise;
  return state.reflowData;
}

async function openBook(book) {
  if (state.student.lockedBookId && state.student.lockedBookId !== book.id) {
    toast(`Your reading quest is locked to ${lockedBook()?.title || "another book"}.`);
    return;
  }
  const prerequisite = seriesLock(book);
  if (prerequisite) {
    toast(`Finish ${prerequisite.title} before opening book ${book.seriesNumber}.`);
    return;
  }
  if (!state.teacherMode && !state.student.lockedBookId) {
    openBookInvitation(book);
    return;
  }
  if (book.kind === "legacy") {
    location.href = legacyUrl(book);
    return;
  }
  await closeDocument();
  state.book = book;
  state.total = book.pages || 1;
  migrateReflowProgress(book);
  state.page = Math.min(savedPage(book), farthestUnlockedPage(book));
  state.zoom = 1;
  elements.title.textContent = book.title;
  elements.author.textContent = book.series || book.author;
  elements.lockBook.hidden = Boolean(state.student.lockedBookId);
  elements.lockBook.textContent = "◆ Lock in";
  elements.layout.hidden = false;
  elements.libraryView.hidden = true;
  elements.readerView.hidden = false;
  elements.readerView.classList.toggle("reflow-reader", book.kind === "reflow");
  elements.loading.hidden = false;
  elements.stage.hidden = true;
  elements.footer.hidden = true;
  elements.loadingBar.style.width = "7%";
  elements.loadingTitle.textContent = `Opening ${book.title}…`;
  elements.loadingDetail.textContent = "Loading only what you need";
  updateUrl(book.id);

  if (book.kind === "reflow") {
    try {
      elements.loadingDetail.textContent = "Preparing flowing chapter text";
      const data = await loadReflowData();
      state.total = data?.pages?.length || book.pages || 1;
      state.page = normalizedPage(Math.min(state.page, state.total));
      elements.pageTotal.textContent = state.total;
      elements.progress.max = state.total;
      elements.loadingBar.style.width = "100%";
      elements.loadingDetail.textContent = "Opening your saved reading place";
      elements.stage.hidden = false;
      elements.footer.hidden = false;
      elements.loading.hidden = true;
      await waitForReaderLayout();
      await renderCurrent();
    } catch (error) {
      console.error(error);
      elements.loadingTitle.textContent = "This book could not open";
      elements.loadingDetail.textContent = "The flowing chapter text is missing from the class library.";
      elements.loadingBar.style.width = "0%";
    }
    return;
  }

  if (book.kind === "images") {
    state.total = book.pages;
    state.page = normalizedPage(state.page);
    elements.pageTotal.textContent = state.total;
    elements.progress.max = state.total;
    elements.loadingBar.style.width = "100%";
    elements.loadingDetail.textContent = "Opening your saved page";
    elements.stage.hidden = false;
    elements.footer.hidden = false;
    await waitForReaderLayout();
    await renderCurrent();
    settleReaderFit();
    elements.loading.hidden = true;
    return;
  }

  const base = new URL("./vendor/", import.meta.url).href;
  const task = pdfjsLib.getDocument({
    url: new URL(book.file, document.baseURI).href,
    cMapUrl: `${base}cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${base}standard_fonts/`,
    wasmUrl: `${base}wasm/`,
    iccUrl: `${base}iccs/`,
    rangeChunkSize: 131072
  });
  state.loadingTask = task;
  task.onProgress = ({ loaded, total }) => {
    const percent = total ? Math.max(7, Math.min(94, Math.round((loaded / total) * 100))) : 22;
    elements.loadingBar.style.width = `${percent}%`;
    elements.loadingDetail.textContent = total ? `${Math.round(loaded / 1048576)} of ${Math.round(total / 1048576)} MB` : "Preparing pages";
  };

  try {
    state.pdf = await task.promise;
    state.total = state.pdf.numPages;
    state.page = normalizedPage(state.page);
    elements.loadingBar.style.width = "100%";
    elements.pageTotal.textContent = state.total;
    elements.progress.max = state.total;
    elements.stage.hidden = false;
    elements.footer.hidden = false;
    await waitForReaderLayout();
    await renderCurrent();
    settleReaderFit();
    elements.loading.hidden = true;
  } catch (error) {
    if (error?.name === "AbortException") return;
    console.error(error);
    elements.loadingTitle.textContent = "This book could not open";
    elements.loadingDetail.textContent = "Check that its PDF is in the class-library/books folder.";
    elements.loadingBar.style.width = "0%";
  }
}

async function closeDocument() {
  stopSpeech();
  closeDictionary();
  cancelRenders();
  if (state.loadingTask) {
    try { await state.loadingTask.destroy(); } catch {}
  }
  state.loadingTask = null;
  state.pdf = null;
  state.reflowData = null;
  state.reflowDataPromise = null;
  state.ocrText = null;
  state.ocrTextPromise = null;
  state.ocrLayout = null;
  state.ocrLayoutPromise = null;
  state.pageTextCache.clear();
  state.pageWords.clear();
  elements.lockBook.hidden = true;
  setDefineMode(false);
}

function cancelRenders() {
  for (const task of state.renderTasks) {
    try { task.cancel(); } catch {}
  }
  state.renderTasks = [];
}

function canvasSlot(slot) {
  return {
    shell: elements.shells[slot],
    canvas: elements.canvases[slot],
    textLayer: elements.textLayers[slot],
    reflowPage: elements.reflowPages[slot],
    number: elements.pageNumbers[slot]
  };
}

function clearSlot(slot) {
  const { shell, canvas, textLayer, reflowPage, number } = canvasSlot(slot);
  const oldPage = Number(textLayer.dataset.page || 0);
  if (oldPage) state.pageWords.delete(oldPage);
  const oldReflowPage = Number(reflowPage.dataset.page || 0);
  if (oldReflowPage) state.pageWords.delete(oldReflowPage);
  textLayer.replaceChildren();
  textLayer.removeAttribute("data-page");
  textLayer.hidden = false;
  reflowPage.replaceChildren();
  reflowPage.removeAttribute("data-page");
  reflowPage.hidden = true;
  shell.hidden = true;
  shell.classList.remove("reflow-shell");
  canvas.hidden = false;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = 1;
  canvas.height = 1;
  number.textContent = "";
}

function appendReflowWords(container, text, pageOffset, mappedWords) {
  let cursor = 0;
  for (const match of text.matchAll(/\S+/g)) {
    if (match.index > cursor) container.append(document.createTextNode(text.slice(cursor, match.index)));
    const lookupWord = dictionaryWord(match[0]);
    if (!lookupWord) {
      container.append(document.createTextNode(match[0]));
    } else {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "page-word reflow-word";
      button.dataset.word = lookupWord;
      button.textContent = match[0];
      button.tabIndex = state.defineMode ? 0 : -1;
      button.setAttribute("aria-label", `Define ${lookupWord}`);
      if (!state.defineMode) button.setAttribute("aria-hidden", "true");
      container.append(button);
      mappedWords.push({
        start: pageOffset + match.index,
        end: pageOffset + match.index + match[0].length,
        element: button
      });
    }
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) container.append(document.createTextNode(text.slice(cursor)));
}

async function renderReflowPage(pageNumber, slot, token) {
  const data = state.reflowData || await loadReflowData();
  if (token !== state.renderToken) return;
  const pageData = data?.pages?.[pageNumber - 1];
  if (!pageData) throw new Error(`Flowing page ${pageNumber} is missing.`);

  const { shell, canvas, textLayer, reflowPage, number } = canvasSlot(slot);
  const oldPage = Number(reflowPage.dataset.page || 0);
  if (oldPage) state.pageWords.delete(oldPage);
  shell.hidden = false;
  shell.classList.add("reflow-shell", "single-page");
  canvas.hidden = true;
  textLayer.hidden = true;
  reflowPage.hidden = false;
  reflowPage.dataset.page = pageNumber;
  reflowPage.replaceChildren();
  number.textContent = pageNumber;

  const stageWidth = Math.max(280, elements.stage.clientWidth - (isCompact() ? 116 : 180));
  const stageHeight = Math.max(320, elements.stage.clientHeight - 28);
  const availableWidth = useSpread() ? (stageWidth - 5) / 2 : stageWidth;
  const displayWidth = Math.min(useSpread() ? 640 : 860, availableWidth);
  shell.style.width = `${displayWidth * state.zoom}px`;
  shell.style.height = `${stageHeight * state.zoom}px`;
  let fontSize = (isCompact() ? 16 : 18.5) * state.zoom;
  reflowPage.style.fontSize = `${fontSize}px`;

  const heading = document.createElement("header");
  heading.className = "reflow-heading";
  const kicker = document.createElement("p");
  kicker.className = "reflow-kicker";
  kicker.textContent = `Chapter ${pageData.chapterNumber} of ${data.chapters.length}`;
  const title = document.createElement(pageData.chapterPage === 1 ? "h2" : "h3");
  title.textContent = pageData.chapterTitle;
  const position = document.createElement("small");
  position.textContent = pageData.chapterPage === 1 ? "Chapter opening" : `Continued · reading page ${pageData.chapterPage}`;
  heading.append(kicker, title, position);
  reflowPage.append(heading);

  const mappedWords = [];
  let pageOffset = 0;
  pageData.blocks.forEach((block, index) => {
    const paragraph = document.createElement("p");
    paragraph.className = block.kind === "display" ? "reflow-display" : "reflow-paragraph";
    appendReflowWords(paragraph, block.text, pageOffset, mappedWords);
    reflowPage.append(paragraph);
    pageOffset += block.text.length + (index < pageData.blocks.length - 1 ? 2 : 0);
  });

  let illustrationImage = null;
  if (pageData.illustration?.src) {
    const figure = document.createElement("figure");
    figure.className = "reflow-illustration";
    illustrationImage = document.createElement("img");
    illustrationImage.src = new URL(pageData.illustration.src, document.baseURI).href;
    illustrationImage.alt = pageData.illustration.alt || "Classroom illustration";
    illustrationImage.loading = "eager";
    illustrationImage.decoding = "async";
    illustrationImage.style.height = `${(useSpread() ? 150 : 180) * state.zoom}px`;
    const caption = document.createElement("figcaption");
    const range = pageData.illustration.pageRange ? `${pageData.illustration.pageRange} · ` : "";
    caption.textContent = `${range}${pageData.illustration.credit || "Original classroom illustration created for Dragonswood."}`;
    figure.append(illustrationImage, caption);
    reflowPage.append(figure);
  }

  state.pageTextCache.set(pageNumber, pageData.text || pageData.blocks.map(block => block.text).join("\n\n"));
  state.pageWords.set(pageNumber, mappedWords);
  elements.author.textContent = `Chapter ${pageData.chapterNumber} · ${pageData.chapterTitle}`;
  reflowPage.scrollTop = 0;
  while (reflowPage.scrollHeight > reflowPage.clientHeight + 1 && fontSize > 12 * state.zoom) {
    fontSize -= 0.25 * state.zoom;
    reflowPage.style.fontSize = `${fontSize}px`;
  }
  if (illustrationImage) {
    let imageHeight = Number.parseFloat(illustrationImage.style.height);
    const minimumHeight = 96 * state.zoom;
    while (reflowPage.scrollHeight > reflowPage.clientHeight + 1 && imageHeight > minimumHeight) {
      imageHeight -= 8 * state.zoom;
      illustrationImage.style.height = `${imageHeight}px`;
    }
  }
}

function installPageWords(pageNumber, slot, pageWidth, pageHeight, words) {
  const layer = elements.textLayers[slot];
  const oldPage = Number(layer.dataset.page || 0);
  if (oldPage) state.pageWords.delete(oldPage);
  layer.dataset.page = pageNumber;
  layer.style.width = `${pageWidth}px`;
  layer.style.height = `${pageHeight}px`;
  const fragment = document.createDocumentFragment();
  const mappedWords = [];
  for (const word of words) {
    const lookupWord = dictionaryWord(word.text);
    if (!lookupWord) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "page-word";
    button.dataset.word = lookupWord;
    button.tabIndex = state.defineMode ? 0 : -1;
    button.setAttribute("aria-label", `Define ${lookupWord}`);
    if (!state.defineMode) button.setAttribute("aria-hidden", "true");
    button.style.left = `${Math.max(0, word.x)}px`;
    button.style.top = `${Math.max(0, word.y)}px`;
    button.style.width = `${Math.max(3, word.width)}px`;
    button.style.height = `${Math.max(3, word.height)}px`;
    if (word.angle) button.style.transform = `rotate(${word.angle}rad)`;
    fragment.append(button);
    mappedWords.push({
      start: word.start,
      end: word.start + word.text.length,
      element: button
    });
  }
  layer.replaceChildren(fragment);
  state.pageWords.set(pageNumber, mappedWords);
}

function nativeTextAndWords(textContent, viewport) {
  const text = textContent.items.map(item => item.str || "").join(" ");
  const words = [];
  let itemStart = 0;
  textContent.items.forEach((item, index) => {
    const value = item.str || "";
    if (value) {
      const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
      const angle = Math.atan2(tx[1], tx[0]);
      const fontHeight = Math.max(4, Math.hypot(tx[2], tx[3]));
      const measuredWidth = Math.abs((item.width || 0) * viewport.scale);
      const itemWidth = Math.max(measuredWidth, fontHeight * Math.max(1, value.length) * 0.35);
      for (const match of value.matchAll(/\S+/g)) {
        const startRatio = match.index / Math.max(1, value.length);
        const widthRatio = match[0].length / Math.max(1, value.length);
        words.push({
          text: match[0],
          start: itemStart + match.index,
          x: tx[4] + itemWidth * startRatio,
          y: tx[5] - fontHeight,
          width: Math.max(fontHeight * 0.3, itemWidth * widthRatio),
          height: fontHeight * 1.08,
          angle
        });
      }
    }
    itemStart += value.length + (index < textContent.items.length - 1 ? 1 : 0);
  });
  return { text, words };
}

function ocrWords(layoutPage, displayWidth, displayHeight) {
  if (!layoutPage) return [];
  const scaleX = displayWidth / Math.max(1, layoutPage.w);
  const scaleY = displayHeight / Math.max(1, layoutPage.h);
  return (layoutPage.a || []).map(word => ({
    text: word.t,
    start: word.s,
    x: word.x * scaleX,
    y: word.y * scaleY,
    width: word.w * scaleX,
    height: word.h * scaleY,
    angle: 0
  }));
}

async function renderPage(pageNumber, slot, token) {
  if (state.book.kind === "reflow") {
    await renderReflowPage(pageNumber, slot, token);
    return;
  }
  if (state.book.kind === "images") {
    await renderImagePage(pageNumber, slot, token);
    return;
  }
  const page = await state.pdf.getPage(pageNumber);
  if (token !== state.renderToken) return;
  const { shell, canvas, textLayer, reflowPage, number } = canvasSlot(slot);
  shell.hidden = false;
  shell.classList.remove("reflow-shell");
  shell.classList.toggle("single-page", !useSpread());
  canvas.hidden = false;
  textLayer.hidden = false;
  reflowPage.hidden = true;
  number.textContent = pageNumber;

  const baseViewport = page.getViewport({ scale: 1 });
  const stageWidth = Math.max(280, elements.stage.clientWidth - (isCompact() ? 116 : 180));
  const stageHeight = Math.max(280, elements.stage.clientHeight - 28);
  const availableWidth = useSpread() ? (stageWidth - 5) / 2 : stageWidth;
  const fitScale = Math.min(availableWidth / baseViewport.width, stageHeight / baseViewport.height);
  const viewport = page.getViewport({ scale: Math.max(0.2, fitScale * state.zoom) });
  const displayWidth = Math.floor(viewport.width);
  const displayHeight = Math.floor(viewport.height);
  const outputScale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;
  shell.style.width = canvas.style.width;
  shell.style.height = canvas.style.height;

  const context = canvas.getContext("2d", { alpha: false });
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const transform = outputScale === 1 ? null : [outputScale, 0, 0, outputScale, 0, 0];
  const task = page.render({ canvasContext: context, transform, viewport });
  state.renderTasks.push(task);
  const [textContent] = await Promise.all([page.getTextContent(), task.promise]);
  if (token !== state.renderToken) return;
  const native = nativeTextAndWords(textContent, viewport);
  if (native.text.replace(/\s+/g, " ").trim().length >= 12 || !state.book.textLayoutFile) {
    state.pageTextCache.set(pageNumber, native.text);
    installPageWords(pageNumber, slot, displayWidth, displayHeight, native.words);
    return;
  }
  const layout = await loadOcrLayout();
  if (token !== state.renderToken) return;
  const layoutPage = layout[String(pageNumber)];
  state.pageTextCache.set(pageNumber, layoutPage?.t || native.text);
  installPageWords(pageNumber, slot, displayWidth, displayHeight, ocrWords(layoutPage, displayWidth, displayHeight));
}

async function renderImagePage(pageNumber, slot, token) {
  const image = new Image();
  image.decoding = "async";
  image.src = imageUrl(state.book, pageNumber);
  await image.decode();
  if (token !== state.renderToken) return;

  const { shell, canvas, textLayer, reflowPage, number } = canvasSlot(slot);
  shell.hidden = false;
  shell.classList.remove("reflow-shell");
  shell.classList.toggle("single-page", !useSpread());
  canvas.hidden = false;
  textLayer.hidden = false;
  reflowPage.hidden = true;
  number.textContent = pageNumber;

  const stageWidth = Math.max(280, elements.stage.clientWidth - (isCompact() ? 116 : 180));
  const stageHeight = Math.max(280, elements.stage.clientHeight - 28);
  const availableWidth = useSpread() ? (stageWidth - 5) / 2 : stageWidth;
  const fitScale = Math.min(availableWidth / image.naturalWidth, stageHeight / image.naturalHeight);
  const displayScale = Math.max(0.2, fitScale * state.zoom);
  const displayWidth = Math.floor(image.naturalWidth * displayScale);
  const displayHeight = Math.floor(image.naturalHeight * displayScale);
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;
  shell.style.width = canvas.style.width;
  shell.style.height = canvas.style.height;
  const context = canvas.getContext("2d", { alpha: false });
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);

  const layout = await loadOcrLayout();
  if (token !== state.renderToken) return;
  const layoutPage = layout[String(pageNumber)];
  state.pageTextCache.set(pageNumber, layoutPage?.t || "");
  installPageWords(pageNumber, slot, displayWidth, displayHeight, ocrWords(layoutPage, displayWidth, displayHeight));
}

async function renderCurrent() {
  if (!state.pdf && !["images", "reflow"].includes(state.book?.kind)) return;
  const token = ++state.renderToken;
  cancelRenders();
  state.page = normalizedPage(state.page);
  const pages = pagesForView();
  elements.spread.classList.add("turning");
  if (pages.length === 1) {
    clearSlot("left");
    await renderPage(pages[0], "right", token);
  } else {
    await Promise.all([
      renderPage(pages[0], "left", token),
      renderPage(pages[1], "right", token)
    ]);
  }
  if (token !== state.renderToken) return;
  elements.spread.classList.remove("turning");
  updateControls();
  setSavedPage(state.book, state.page);
  localStorage.setItem("dw-class-library-last-book", state.book.id);
  await markBookCompleteIfFinished(pages.at(-1));
  warmNearbyPages();
}

async function markBookCompleteIfFinished(lastShownPage) {
  const book = state.book;
  if (!book || state.student.lockedBookId !== book.id || lastShownPage < state.total) return;
  const map = chapterMap(book);
  const requiredTests = map ? map.chapters.map(testForChapter).filter(Boolean) : [];
  if (!requiredTests.every(test => hasPassed(test.id))) return;
  if (!state.student.completedBookIds.includes(book.id)) {
    state.student.completedBookIds.push(book.id);
    state.student = await saveStudentState(state.student);
  }
  state.student.lockedBookId = "";
  state.student.lockedAt = "";
  state.student = await saveStudentState(state.student);
  elements.lockBook.hidden = true;
  toast(`Quest complete: ${book.title}! You may choose your next book.`);
}

function updateControls() {
  const shown = pagesForView();
  const last = shown[shown.length - 1];
  const finalGate = last >= state.total ? gateForTarget(state.total + 1) : null;
  elements.previous.disabled = state.page <= 1;
  elements.next.disabled = last >= state.total && !finalGate;
  elements.next.setAttribute("aria-label", finalGate ? "Take final chapter test" : "Next page");
  elements.next.title = finalGate ? "Take final chapter test" : "Next page";
  elements.pageInput.value = state.page;
  elements.progress.value = state.page;
  const percent = Math.round(((last - 1) / Math.max(1, state.total - 1)) * 100);
  elements.progressLabel.textContent = `${percent}%`;
  elements.zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
}

function warmNearbyPages() {
  const step = useSpread() ? 2 : 1;
  if (state.book?.kind === "reflow") return;
  if (state.book?.kind === "images") {
    for (const page of [state.page + step, state.page - step]) {
      if (page >= 1 && page <= state.total) {
        const image = new Image();
        image.src = imageUrl(state.book, page);
      }
    }
    return;
  }
  if (!state.pdf) return;
  for (const page of [state.page + step, state.page - step]) {
    if (page >= 1 && page <= state.total) state.pdf.getPage(page).catch(() => {});
  }
}

function goTo(page) {
  if (!state.pdf && !["images", "reflow"].includes(state.book?.kind)) return;
  const target = Math.max(1, Math.min(state.total, Math.round(Number(page) || 1)));
  const gate = gateForTarget(target);
  if (gate) {
    openChapterTest(gate, target);
    return;
  }
  stopSpeech();
  closeDictionary();
  state.page = normalizedPage(target);
  state.lastActive = Date.now();
  renderCurrent().catch(handleRenderError);
}

function nextPage() {
  const shown = pagesForView();
  const last = shown[shown.length - 1];
  if (last >= state.total) {
    const finalGate = gateForTarget(state.total + 1);
    if (finalGate) openChapterTest(finalGate, state.total + 1);
    return;
  }
  goTo(useSpread() && state.page === 1 ? 2 : state.page + (useSpread() ? 2 : 1));
}

function previousPage() {
  if (state.page <= 1) return;
  goTo(useSpread() && state.page <= 2 ? 1 : state.page - (useSpread() ? 2 : 1));
}

function handleRenderError(error) {
  if (error?.name === "RenderingCancelledException" || error?.name === "AbortException") return;
  console.error(error);
  toast("That page had trouble loading. Try it again.");
}

function changeZoom(delta) {
  stopSpeech();
  state.zoom = Math.max(0.7, Math.min(1.8, Math.round((state.zoom + delta) * 10) / 10));
  renderCurrent().catch(handleRenderError);
}

function fitPage() {
  stopSpeech();
  state.zoom = 1;
  renderCurrent().catch(handleRenderError);
}

function toggleLayout() {
  stopSpeech();
  state.layout = useSpread() ? "single" : "spread";
  localStorage.setItem("dw-class-library-layout", state.layout);
  state.page = normalizedPage(state.page);
  renderCurrent().catch(handleRenderError);
  toast(useSpread() ? "Two-page view" : "Single-page view");
}

async function loadOcrText() {
  if (!state.book?.textFile) return {};
  if (!state.ocrTextPromise) {
    const url = new URL(state.book.textFile, document.baseURI).href;
    state.ocrTextPromise = fetch(url).then(response => {
      if (!response.ok) throw new Error(`OCR text request failed: ${response.status}`);
      return response.json();
    });
  }
  state.ocrText ||= await state.ocrTextPromise;
  return state.ocrText;
}

async function loadOcrLayout() {
  if (!state.book?.textLayoutFile) return {};
  if (!state.ocrLayoutPromise) {
    const url = new URL(state.book.textLayoutFile, document.baseURI).href;
    state.ocrLayoutPromise = fetch(url).then(response => {
      if (!response.ok) throw new Error(`OCR layout request failed: ${response.status}`);
      return response.json();
    });
  }
  state.ocrLayout ||= await state.ocrLayoutPromise;
  return state.ocrLayout;
}

async function pageText(pageNumber) {
  if (state.pageTextCache.has(pageNumber)) return state.pageTextCache.get(pageNumber);
  if (state.book?.kind === "reflow") {
    const data = state.reflowData || await loadReflowData();
    const text = data?.pages?.[pageNumber - 1]?.text || "";
    state.pageTextCache.set(pageNumber, text);
    return text;
  }
  if (state.book?.kind === "images") {
    if (state.book.textLayoutFile) {
      const layout = await loadOcrLayout();
      const text = layout[String(pageNumber)]?.t || "";
      state.pageTextCache.set(pageNumber, text);
      return text;
    }
    const ocrText = await loadOcrText();
    const text = ocrText[String(pageNumber)] || "";
    state.pageTextCache.set(pageNumber, text);
    return text;
  }
  const page = await state.pdf.getPage(pageNumber);
  const content = await page.getTextContent();
  const nativeText = content.items.map(item => item.str || "").join(" ");
  if (nativeText.replace(/\s+/g, " ").trim().length >= 12) {
    state.pageTextCache.set(pageNumber, nativeText);
    return nativeText;
  }
  if (state.book?.textLayoutFile) {
    const layout = await loadOcrLayout();
    const text = layout[String(pageNumber)]?.t || nativeText;
    state.pageTextCache.set(pageNumber, text);
    return text;
  }
  if (!state.book?.textFile) return nativeText;
  const ocrText = await loadOcrText();
  const text = ocrText[String(pageNumber)] || nativeText;
  state.pageTextCache.set(pageNumber, text);
  return text;
}

async function currentViewSpeech() {
  const pages = pagesForView();
  const texts = await Promise.all(pages.map(pageText));
  state.spokenWords = [];
  let pageOffset = 0;
  pages.forEach((pageNumber, index) => {
    const words = state.pageWords.get(pageNumber) || [];
    words.forEach(word => state.spokenWords.push({
      start: pageOffset + word.start,
      end: pageOffset + word.end,
      element: word.element
    }));
    pageOffset += texts[index].length + (index < texts.length - 1 ? 1 : 0);
  });
  return texts.join(" ");
}

function dictionaryWord(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/^[^a-z]+|[^a-z'-]+$/g, "")
    .replace(/^'+|'+$/g, "");
}

function clearPageHighlight() {
  if (state.activePageWord) {
    state.activePageWord.classList.remove("speaking");
    state.activePageWord.removeAttribute("aria-current");
  }
  state.activePageWord = null;
}

function highlightPageWord(charIndex) {
  const match = state.spokenWords.find(word => charIndex >= word.start && charIndex < word.end)
    || state.spokenWords.find(word => word.start >= charIndex);
  if (!match || match.element === state.activePageWord) return;
  clearPageHighlight();
  state.activePageWord = match.element;
  state.activePageWord.classList.add("speaking");
  state.activePageWord.setAttribute("aria-current", "true");
  const reflowPage = state.activePageWord.closest(".reflow-page");
  if (reflowPage) {
    const wordTop = state.activePageWord.offsetTop;
    const visibleTop = reflowPage.scrollTop;
    const visibleBottom = visibleTop + reflowPage.clientHeight;
    if (wordTop < visibleTop + 72 || wordTop > visibleBottom - 72) {
      reflowPage.scrollTo({ top: Math.max(0, wordTop - reflowPage.clientHeight * 0.42), behavior: "smooth" });
    }
  }
}

function setDefineMode(enabled) {
  state.defineMode = Boolean(enabled);
  elements.readerView.classList.toggle("define-mode", state.defineMode);
  elements.dictionary.setAttribute("aria-pressed", String(state.defineMode));
  elements.dictionary.setAttribute("aria-label", state.defineMode ? "Turn off page dictionary" : "Turn on page dictionary");
  elements.dictionary.innerHTML = state.defineMode
    ? '<span aria-hidden="true">✓</span><span class="dictionary-label"> Done</span>'
    : '<span aria-hidden="true">Aa</span><span class="dictionary-label"> Define</span>';
  $$(".page-word", elements.spread).forEach(word => {
    word.tabIndex = state.defineMode ? 0 : -1;
    if (state.defineMode) word.removeAttribute("aria-hidden");
    else word.setAttribute("aria-hidden", "true");
  });
}

function toggleDefineMode() {
  if (!state.defineMode && !pagesForView().some(page => state.pageWords.get(page)?.length)) {
    toast("No readable words were found on this page.");
    return;
  }
  setDefineMode(!state.defineMode);
  toast(state.defineMode ? "Tap any word directly on the page." : "Page dictionary off");
}

function dictionaryCandidates(word) {
  const candidates = [word];
  const add = value => {
    if (value.length > 1 && !candidates.includes(value)) candidates.push(value);
  };
  if (word.endsWith("'s")) add(word.slice(0, -2));
  if (word.endsWith("ies")) add(`${word.slice(0, -3)}y`);
  if (word.endsWith("es")) add(word.slice(0, -2));
  if (word.endsWith("s")) add(word.slice(0, -1));
  if (word.endsWith("ing")) {
    const stem = word.slice(0, -3);
    add(stem);
    add(`${stem}e`);
    if (stem.at(-1) === stem.at(-2)) add(stem.slice(0, -1));
  }
  if (word.endsWith("ed")) {
    const stem = word.slice(0, -2);
    add(stem);
    add(`${stem}e`);
    if (stem.at(-1) === stem.at(-2)) add(stem.slice(0, -1));
  }
  return candidates;
}

async function loadDictionaryLetter(letter) {
  if (!state.dictionaryCache.has(letter)) {
    const url = new URL(`./dictionary/wordset/${letter}.json`, import.meta.url).href;
    state.dictionaryCache.set(letter, fetch(url).then(response => {
      if (!response.ok) throw new Error(`Dictionary request failed: ${response.status}`);
      return response.json();
    }));
  }
  return state.dictionaryCache.get(letter);
}

async function findDictionaryEntry(word) {
  const candidates = dictionaryCandidates(word);
  for (const candidate of candidates) {
    const entry = CLASSROOM_DICTIONARY[candidate];
    if (entry?.meanings?.length) return entry;
  }
  const data = await loadDictionaryLetter(word[0]);
  for (const candidate of candidates) {
    const entry = data[candidate]
      || data[candidate[0].toUpperCase() + candidate.slice(1)]
      || data[candidate.toUpperCase()];
    if (entry?.meanings?.length) return entry;
  }
  return null;
}

function dictionaryMessage(message) {
  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  elements.dictionaryResult.replaceChildren(paragraph);
}

function renderDictionaryEntry(entry) {
  const fragment = document.createDocumentFragment();
  entry.meanings.slice(0, 5).forEach(meaning => {
    const section = document.createElement("section");
    section.className = "dictionary-meaning";
    if (meaning.speech_part) {
      const part = document.createElement("span");
      part.className = "dictionary-part";
      part.textContent = meaning.speech_part;
      section.append(part);
    }
    const definition = document.createElement("p");
    definition.className = "dictionary-definition";
    definition.textContent = meaning.def;
    section.append(definition);
    if (meaning.example) {
      const example = document.createElement("p");
      example.className = "dictionary-example";
      example.textContent = `“${meaning.example}”`;
      section.append(example);
    }
    if (meaning.synonyms?.length) {
      const synonyms = document.createElement("p");
      synonyms.className = "dictionary-synonyms";
      synonyms.textContent = `Similar words: ${meaning.synonyms.slice(0, 6).join(", ")}`;
      section.append(synonyms);
    }
    fragment.append(section);
  });
  elements.dictionaryResult.replaceChildren(fragment);
}

function closeDictionary() {
  if (elements.dictionaryDialog.open) elements.dictionaryDialog.close();
}

async function openDictionary(value) {
  const word = dictionaryWord(value);
  if (!word || !/^[a-z]/.test(word)) return;
  stopSpeech();
  elements.dictionaryWord.textContent = word;
  dictionaryMessage("Looking up this word…");
  if (!elements.dictionaryDialog.open) elements.dictionaryDialog.showModal();
  try {
    const entry = await findDictionaryEntry(word);
    if (!entry) {
      dictionaryMessage("No definition was found. It may be a name, an invented word, or an OCR spelling.");
      return;
    }
    elements.dictionaryWord.textContent = entry.word || word;
    renderDictionaryEntry(entry);
  } catch (error) {
    console.error(error);
    dictionaryMessage("The offline dictionary could not load this word. Please try again.");
  }
}

async function readAloud() {
  if (!("speechSynthesis" in window)) {
    toast("Read aloud is not supported in this browser.");
    return;
  }
  if (!state.pdf && !["images", "reflow"].includes(state.book?.kind)) return;
  if (speechSynthesis.speaking || speechSynthesis.pending || state.speech) {
    stopSpeech();
    return;
  }
  elements.speech.disabled = true;
  elements.speech.textContent = "Preparing…";
  try {
    const text = await currentViewSpeech();
    if (text.replace(/\s+/g, " ").trim().length < 12) {
      toast("No readable text was found on this page.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onstart = () => highlightPageWord(0);
    utterance.onboundary = event => highlightPageWord(event.charIndex);
    utterance.onend = () => stopSpeech();
    utterance.onerror = () => stopSpeech();
    state.speech = utterance;
    elements.speech.textContent = "■ Stop";
    speechSynthesis.speak(utterance);
  } catch (error) {
    console.error(error);
    toast("Read aloud is not available for this page.");
  } finally {
    elements.speech.disabled = false;
    if (!state.speech) elements.speech.textContent = "▶ Read";
  }
}

function stopSpeech() {
  const utterance = state.speech;
  state.speech = null;
  if (utterance) {
    utterance.onstart = null;
    utterance.onboundary = null;
    utterance.onend = null;
    utterance.onerror = null;
  }
  if ("speechSynthesis" in window && (speechSynthesis.speaking || speechSynthesis.pending)) speechSynthesis.cancel();
  clearPageHighlight();
  state.spokenWords = [];
  elements.speech.disabled = false;
  elements.speech.textContent = "▶ Read";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openBookInvitation(book) {
  if (!book || state.student.lockedBookId) return;
  const prerequisite = seriesLock(book);
  if (prerequisite) {
    toast(`Finish ${prerequisite.title} before choosing book ${book.seriesNumber}.`);
    return;
  }
  state.pendingBook = book;
  elements.lockCover.src = book.cover;
  elements.lockCover.alt = `Cover of ${book.title}`;
  elements.lockTitle.textContent = `Could ${book.title} be your book?`;
  elements.lockAuthor.textContent = `${book.author}${book.series ? ` · ${book.series}` : ""}`;
  elements.lockTeaser.textContent = book.teaser || `Meet the characters, problem, and world of ${book.title} before deciding whether this is your next reading quest.`;
  if (!elements.lockDialog.open) elements.lockDialog.showModal();
}

function openLockDialog() {
  openBookInvitation(state.book);
}

async function confirmBookLock() {
  const book = state.pendingBook;
  if (!book || state.student.lockedBookId) return;
  state.student.lockedBookId = book.id;
  state.student.lockedAt = new Date().toISOString();
  const permittedPage = Math.min(savedPage(book), farthestUnlockedPage(book));
  state.student.pages[book.id] = permittedPage;
  state.page = normalizedPage(permittedPage);
  state.student = await saveStudentState(state.student);
  state.pendingBook = null;
  elements.lockDialog.close();
  renderShelf();
  await openBook(book);
  toast(`${book.title} is now your reading quest.`);
}

function closeQuiz() {
  if (elements.quizDialog.open) elements.quizDialog.close();
  state.activeTest = null;
  state.activeGatePage = null;
}

function quizQuestionMarkup(question, index) {
  return `
    <fieldset class="quiz-question" data-quiz-question="${escapeHtml(question.id)}">
      <legend><span>${index + 1}</span>${escapeHtml(question.prompt)}</legend>
      <div class="quiz-choices">
        ${question.choices.map((choice, choiceIndex) => `
          <label class="quiz-choice">
            <input type="radio" name="answer-${escapeHtml(question.id)}" value="${choiceIndex}">
            <span>${escapeHtml(choice)}</span>
          </label>`).join("")}
      </div>
    </fieldset>`;
}

function openChapterTest(gate, targetPage = gate.gatePage) {
  stopSpeech();
  closeDictionary();
  state.activeTest = gate;
  state.activeGatePage = targetPage;
  const attempts = state.student.attempts?.[gate.test.id]?.count || 0;
  elements.quizTitle.textContent = gate.test.title || `Chapter ${gate.chapter.number} Check`;
  elements.quizIntro.textContent = gate.completesBook
    ? `Complete all seven questions and pass the required five-sentence summary to finish ${state.book.title}.`
    : `Complete all seven questions and pass the required five-sentence summary to open Chapter ${gate.nextChapter.number}: ${gate.nextChapter.title}.`;
  elements.quizProgress.textContent = attempts ? `Attempts so far: ${attempts}` : "7 questions + 1 required summary";
  elements.quizQuestions.innerHTML = `${gate.test.questions.map(quizQuestionMarkup).join("")}
    <section class="quiz-summary">
      <label for="chapterSummary"><strong>Required chapter summary</strong></label>
      <p>${escapeHtml(gate.test.summaryPrompt || SUMMARY_PROMPT)}</p>
      <textarea id="chapterSummary" name="chapter-summary" rows="8" maxlength="800" required aria-describedby="chapterSummaryHint"></textarea>
      <small id="chapterSummaryHint">One paragraph · exactly five complete sentences · your own words</small>
    </section>`;
  elements.quizResult.hidden = true;
  elements.quizResult.replaceChildren();
  elements.quizActions.innerHTML = `
    <button class="secondary-action" type="button" data-close-quiz>Reread chapter</button>
    <button class="primary-action" type="submit">Grade my test</button>`;
  if (!elements.quizDialog.open) elements.quizDialog.showModal();
  elements.quizQuestions.querySelector("input")?.focus({ preventScroll: true });
}

async function submitChapterTest(event) {
  event.preventDefault();
  const gate = state.activeTest;
  if (!gate) return;
  const data = new FormData(elements.quizForm);
  const answers = {};
  for (const question of gate.test.questions) {
    const selected = data.get(`answer-${question.id}`);
    if (selected === null) {
      toast("Answer every question before grading your test.");
      return;
    }
    answers[question.id] = Number(selected);
  }
  const summary = String(data.get("chapter-summary") || "").trim();
  if (!summary) {
    toast("Write the required five-sentence summary before grading your test.");
    return;
  }
  const submitButton = $("button[type='submit']", elements.quizActions);
  if (submitButton) { submitButton.disabled = true; submitButton.textContent = "Checking understanding…"; }
  const result = gradeTest(gate.test, answers);
  const summaryResult = await gradeSummary(gate.test, summary);
  const prior = state.student.attempts[gate.test.id] || { count: 0, history: [] };
  const attemptNumber = Number(prior.count || 0) + 1;
  const passed = result.passed && summaryResult.passed;
  const submittedAt = new Date().toISOString();
  const history = Array.isArray(prior.history) ? prior.history.slice(-9) : [];
  history.push({
    attemptNumber,
    submittedAt,
    multipleChoicePercent: result.percent,
    multipleChoicePassed: result.passed,
    summary,
    summaryPassed: summaryResult.passed,
    summaryDecision: summaryResult.decision,
    summaryFeedback: summaryResult.feedback,
    aiResult: summaryResult.ai || null,
    passed
  });
  state.student.attempts[gate.test.id] = {
    count: attemptNumber,
    lastPercent: result.percent,
    lastPassed: passed,
    lastSubmittedAt: submittedAt,
    history
  };
  if (passed) {
    state.student.passedTests[gate.test.id] = {
      percent: result.percent,
      passedAt: submittedAt,
      attemptNumber,
      summaryDecision: summaryResult.decision,
      aiResult: summaryResult.ai || null
    };
  }
  state.student = await saveStudentState(state.student);
  const review = result.results.map((answer, index) => {
    const question = gate.test.questions[index];
    return `<li class="${answer.correct ? "correct" : "incorrect"}">
      <strong>${answer.correct ? "✓ Correct" : "✕ Check this one"}: ${escapeHtml(question.prompt)}</strong>
      <span>${escapeHtml(answer.explanation || "Review this part of the chapter before trying again.")}</span>
    </li>`;
  }).join("");
  elements.quizResult.hidden = false;
  elements.quizResult.innerHTML = `
    <div class="quiz-score ${passed ? "passed" : "retry"}">
      <strong>${result.percent}%</strong>
      <span>${passed ? "Both parts passed — checkpoint complete!" : `${result.passed ? "Questions passed." : `Questions need ${gate.test.passingPercent}%.`} ${summaryResult.passed ? "Summary passed." : "Summary needs revision."}`}</span>
    </div>
    <ol class="quiz-review">${review}</ol>
    <section class="quiz-summary-feedback ${summaryResult.passed ? "passed" : "retry"}">
      <strong>${summaryResult.passed ? "✓ Summary passed" : "Revise your summary"}</strong>
      <p>${escapeHtml(summaryResult.feedback)}</p>
    </section>`;
  $$(`input`, elements.quizQuestions).forEach(input => { input.disabled = true; });
  elements.quizActions.innerHTML = passed
    ? `<button class="primary-action" type="button" data-continue-quiz>${gate.completesBook ? "Finish book ✓" : `Continue to Chapter ${gate.nextChapter.number} →`}</button>`
    : `<button class="secondary-action" type="button" data-close-quiz>Reread chapter</button>
       <button class="primary-action" type="button" data-retry-quiz>Try again</button>`;
  elements.quizResult.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function continueAfterQuiz() {
  const gate = state.activeTest;
  const target = state.activeGatePage || gate?.nextChapter?.startPage;
  closeQuiz();
  if (!gate) return;
  if (gate.completesBook) {
    await markBookCompleteIfFinished(state.total);
    renderShelf();
    showLibrary();
    return;
  }
  goTo(Math.max(gate.nextChapter.startPage, target));
}

function teacherTestRows() {
  const rows = [];
  for (const [bookId, map] of Object.entries(CHAPTER_MAPS)) {
    const book = bookById(bookId);
    if (!book || !map.verified) continue;
    for (const chapter of map.chapters) rows.push({ book, chapter, test: state.tests[chapter.testId] || null });
  }
  return rows;
}

const TEST_SKILLS = [
  "Meaningful recall",
  "Sequence",
  "Cause and effect",
  "Motivation or relationship",
  "Inference or evidence",
  "Character development",
  "Central idea, significance, or theme"
];

function balancedAnswerPositions(chapterNumber) {
  const patterns = [
    [1, 2, 3, 1, 3, 2, 0],
    [0, 2, 3, 0, 3, 2, 1],
    [0, 1, 3, 0, 3, 1, 2],
    [0, 1, 2, 0, 2, 1, 3]
  ];
  return patterns[(Math.max(1, Number(chapterNumber) || 1) - 1) % 4];
}

function testTemplate(row) {
  const positions = balancedAnswerPositions(row.chapter.number);
  return {
    id: row.chapter.testId,
    bookId: row.book.id,
    chapterNumber: row.chapter.number,
    chapterTitle: row.chapter.title,
    bookTitle: row.book.title,
    title: `Chapter ${row.chapter.number} Check`,
    status: "draft",
    passingPercent: 80,
    summaryRequired: true,
    summarySentenceCount: 5,
    summaryPrompt: SUMMARY_PROMPT,
    summaryGuide: "",
    questions: TEST_SKILLS.map((skill, index) => ({
      id: `q${index + 1}`,
      type: "multiple-choice",
      prompt: "",
      choices: ["", "", "", ""],
      correctIndex: positions[index],
      explanation: "",
      skill
    }))
  };
}

function currentEditorTest() {
  const row = teacherTestRows().find(item => item.chapter.testId === state.editorTestId) || teacherTestRows()[0];
  if (!row) return null;
  state.editorTestId = row.chapter.testId;
  const validExisting = row.test && Array.isArray(row.test.questions) && row.test.questions.length === 7;
  return JSON.parse(JSON.stringify(validExisting ? { ...testTemplate(row), ...row.test } : testTemplate(row)));
}

function editorQuestionMarkup(question, index) {
  const choices = Array.from({ length: 4 }, (_, choiceIndex) => question.choices?.[choiceIndex] || "");
  return `
    <section class="editor-question" data-editor-question data-question-id="${escapeHtml(question.id || `q${index + 1}`)}" data-question-skill="${escapeHtml(question.skill || TEST_SKILLS[index])}">
      <div class="editor-question-heading">
        <strong>Question ${index + 1} · ${escapeHtml(question.skill || TEST_SKILLS[index])}</strong>
      </div>
      <label class="editor-field">Question prompt
        <textarea data-question-prompt rows="2" required>${escapeHtml(question.prompt)}</textarea>
      </label>
      <div class="editor-choices">
        ${choices.map((choice, choiceIndex) => `
          <label class="editor-choice">
            <input type="radio" name="correct-${index}" value="${choiceIndex}" ${Number(question.correctIndex) === choiceIndex ? "checked" : ""} aria-label="Make choice ${choiceIndex + 1} correct">
            <input type="text" data-choice="${choiceIndex}" value="${escapeHtml(choice)}" placeholder="Choice ${choiceIndex + 1}" required>
          </label>`).join("")}
      </div>
      <label class="editor-field">Explanation shown after grading
        <textarea data-question-explanation rows="2">${escapeHtml(question.explanation || "")}</textarea>
      </label>
    </section>`;
}

function renderTestEditor() {
  const rows = teacherTestRows();
  if (!rows.length) return;
  if (!state.editorTestId) state.editorTestId = rows[0].chapter.testId;
  elements.testSelect.innerHTML = rows.map(row => `
    <option value="${escapeHtml(row.chapter.testId)}" ${row.chapter.testId === state.editorTestId ? "selected" : ""}>
      ${escapeHtml(row.book.title)} · Chapter ${row.chapter.number}${row.test?.status === "published" ? " · Published" : " · Draft"}
    </option>`).join("");
  const test = currentEditorTest();
  const chapterOptions = BOOKS.flatMap(option => {
    const map = chapterMap(option);
    return map?.chapters?.map(chapter => `<option value="${escapeHtml(option.id)}::${Number(chapter.number)}">${escapeHtml(option.title)} · Chapter ${Number(chapter.number)} — ${escapeHtml(chapter.title || "")}</option>`) || [];
  }).join("");
  const lockManager = state.teacherPlans.length ? `
    <section class="teacher-lock-manager">
      <h3>Student book assignments</h3>
      <p>Assign books, force a student directly to a chapter, or unlock an unfinished book. Forced chapters bypass earlier chapter checks without changing test scores.</p>
      ${state.teacherPlans.map(plan => {
        const book = bookById(plan.state.lockedBookId);
        const nextBook = nextSeriesBook(book);
        return `<div class="teacher-lock-row">
          <span><strong>${escapeHtml(plan.studentName || plan.studentEmail || plan.id)}</strong><small>${book ? `Locked: ${escapeHtml(book.title)}` : "No book currently locked"}</small></span>
          <div class="teacher-lock-actions">
            <label class="sr-only" for="assign-book-${escapeHtml(plan.id)}">Book to assign</label>
            <select id="assign-book-${escapeHtml(plan.id)}" data-assign-book-select>
              <option value="">Choose any book…</option>
              ${BOOKS.map(option => `<option value="${escapeHtml(option.id)}" ${option.id === plan.state?.lockedBookId ? "selected" : ""}>${escapeHtml(option.title)}</option>`).join("")}
            </select>
            <button class="secondary-action" type="button" data-assign-student="${escapeHtml(plan.id)}">Force assign</button>
            <label class="sr-only" for="force-chapter-${escapeHtml(plan.id)}">Chapter to force</label>
            <select id="force-chapter-${escapeHtml(plan.id)}" data-force-chapter-select>
              <option value="">Choose target chapter…</option>
              ${chapterOptions}
            </select>
            <button class="secondary-action" type="button" data-force-chapter-student="${escapeHtml(plan.id)}">Force chapter</button>
            ${nextBook ? `<button class="secondary-action" type="button" data-allow-next-student="${escapeHtml(plan.id)}" data-next-series-book="${escapeHtml(nextBook.id)}">Allow ${escapeHtml(nextBook.title)}</button>` : ""}
            ${book ? `<button class="secondary-action" type="button" data-unlock-student="${escapeHtml(plan.id)}">Unlock</button>` : ""}
          </div>
        </div>`;
      }).join("")}
    </section>` : "";
  elements.testEditorFields.innerHTML = `
    ${lockManager}
    <div class="editor-test-settings">
      <label class="editor-field">Test title
        <input type="text" data-editor-title value="${escapeHtml(test.title)}" required>
      </label>
      <label class="editor-field">Passing score
        <input type="number" data-editor-passing min="1" max="100" value="${Number(test.passingPercent) || 80}" required>
      </label>
      <label class="editor-field">Status
        <select data-editor-status>
          <option value="draft" ${test.status !== "published" ? "selected" : ""}>Draft — does not block students</option>
          <option value="published" ${test.status === "published" ? "selected" : ""}>Published — required to continue</option>
        </select>
      </label>
    </div>
    <div data-editor-questions>${test.questions.map(editorQuestionMarkup).join("")}</div>
    <section class="editor-summary-contract">
      <h3>Required five-sentence summary</h3>
      <p>${escapeHtml(SUMMARY_PROMPT)}</p>
      <label class="editor-field">Private chapter context for Dragonswood AI grading
        <textarea data-editor-summary-guide rows="5" maxlength="500" placeholder="Write a concise, accurate chapter synopsis. Students never see this guide.">${escapeHtml(test.summaryGuide || "")}</textarea>
      </label>
      <small>The AI grades meaning and chapter understanding—not keywords or exact phrasing.</small>
    </section>`;
}

function openTestEditor() {
  if (!state.teacherMode) return;
  renderTestEditor();
  if (!elements.testEditor.open) elements.testEditor.showModal();
  loadStudentPlans().then(plans => {
    state.teacherPlans = plans;
    if (elements.testEditor.open) renderTestEditor();
  }).catch(() => {});
}

function collectEditorTest() {
  const row = teacherTestRows().find(item => item.chapter.testId === state.editorTestId);
  if (!row) return null;
  const questions = $$(`[data-editor-question]`, elements.testEditorFields).map((section, index) => ({
    id: `q${index + 1}`,
    type: "multiple-choice",
    prompt: $("[data-question-prompt]", section).value.trim(),
    choices: $$(`[data-choice]`, section).map(input => input.value.trim()),
    correctIndex: Number($("input[type='radio']:checked", section)?.value || 0),
    explanation: $("[data-question-explanation]", section).value.trim(),
    skill: section.dataset.questionSkill || TEST_SKILLS[index]
  }));
  return {
    id: row.chapter.testId,
    bookId: row.book.id,
    chapterNumber: row.chapter.number,
    chapterTitle: row.chapter.title,
    bookTitle: row.book.title,
    title: $("[data-editor-title]", elements.testEditorFields).value.trim(),
    status: $("[data-editor-status]", elements.testEditorFields).value,
    passingPercent: Number($("[data-editor-passing]", elements.testEditorFields).value),
    questions,
    summaryRequired: true,
    summarySentenceCount: 5,
    summaryPrompt: SUMMARY_PROMPT,
    summaryGuide: $("[data-editor-summary-guide]", elements.testEditorFields).value.trim()
  };
}

function testContractError(test) {
  if (test.questions.length !== 7) return "Every chapter test must have exactly seven questions.";
  if (test.questions.some(question => !question.prompt || question.choices.length !== 4 || question.choices.some(choice => !choice))) return "Complete all seven questions and all four choices.";
  const positions = test.questions.map(question => Number(question.correctIndex));
  const counts = [0, 1, 2, 3].map(position => positions.filter(value => value === position).length);
  const rare = counts.indexOf(1);
  const expectedRare = (Math.max(1, Number(test.chapterNumber) || 1) - 1) % 4;
  if ([...counts].sort().join(",") !== "1,2,2,2" || rare !== expectedRare) return `Answer balance must use three positions twice and ${["A", "B", "C", "D"][expectedRare]} once for this chapter.`;
  if (positions.some((value, index) => index > 1 && value === positions[index - 1] && value === positions[index - 2]) || positions.join("") === "0123012") return "Reorder correct answers to avoid repeated or recognizable patterns.";
  if (test.status === "published" && !test.summaryGuide) return "Add the private chapter context before publishing so the AI receives the correct chapter.";
  return "";
}

async function submitTestEditor(event) {
  event.preventDefault();
  if (!state.teacherMode) return;
  const test = collectEditorTest();
  const contractError = test ? testContractError(test) : "Choose a chapter test.";
  if (contractError) { toast(contractError); return; }
  const result = await saveTest(test);
  state.tests[test.id] = result.test;
  renderTestEditor();
  toast(result.savedToAccount ? "Test saved to the teacher account." : "Test saved in this browser tester.");
}

async function teacherUnlockBook() {
  if (!state.teacherMode || !state.student.lockedBookId) return;
  const title = lockedBook()?.title || "book";
  state.student.lockedBookId = "";
  state.student.lockedAt = "";
  state.student = await saveStudentState(state.student);
  renderShelf();
  toast(`${title} is unlocked. The student may choose again.`);
}

async function showLibrary() {
  await closeDocument();
  state.book = null;
  elements.readerView.hidden = true;
  elements.libraryView.hidden = false;
  updateUrl();
  renderShelf();
  elements.search.focus({ preventScroll: true });
}

function toggleTheme() {
  state.theme = document.body.classList.toggle("light") ? "light" : "dark";
  localStorage.setItem("dw-class-library-theme", state.theme);
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen?.();
  else document.documentElement.requestFullscreen?.();
}

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (state.pdf || ["images", "reflow"].includes(state.book?.kind)) {
      stopSpeech();
      state.page = normalizedPage(state.page);
      renderCurrent().catch(handleRenderError);
    }
  }, 180);
});

let swipeStart = null;
elements.stage.addEventListener("pointerdown", event => {
  swipeStart = { x: event.clientX, y: event.clientY, at: performance.now() };
  state.lastActive = Date.now();
});
elements.stage.addEventListener("pointerup", event => {
  if (!swipeStart) return;
  const dx = event.clientX - swipeStart.x;
  const dy = event.clientY - swipeStart.y;
  const quick = performance.now() - swipeStart.at < 700;
  swipeStart = null;
  if (quick && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) {
    dx < 0 ? nextPage() : previousPage();
  }
});

document.addEventListener("keydown", event => {
  if (elements.readerView.hidden) return;
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;
  if (elements.dictionaryDialog.open || elements.lockDialog.open || elements.quizDialog.open || elements.testEditor.open) return;
  if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
    event.preventDefault();
    nextPage();
  } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    previousPage();
  } else if (event.key === "Escape" && !document.fullscreenElement) {
    showLibrary();
  }
});

document.addEventListener("pointerdown", () => { state.lastActive = Date.now(); }, { passive: true });
document.addEventListener("keydown", () => { state.lastActive = Date.now(); }, { passive: true });

elements.bookGrid.addEventListener("click", event => {
  const card = event.target.closest("[data-book-id]");
  const book = BOOKS.find(item => item.id === card?.dataset.bookId);
  if (book) openBook(book);
});
elements.filters.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  renderFilters();
  renderShelf();
});
elements.search.addEventListener("input", () => {
  state.query = elements.search.value;
  renderShelf();
});
elements.previous.addEventListener("click", previousPage);
elements.next.addEventListener("click", nextPage);
elements.pageInput.addEventListener("change", () => goTo(elements.pageInput.value));
elements.pageInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    goTo(elements.pageInput.value);
    elements.pageInput.blur();
  }
});
elements.progress.addEventListener("input", () => {
  elements.pageInput.value = elements.progress.value;
  elements.progressLabel.textContent = `${Math.round(((elements.progress.value - 1) / Math.max(1, state.total - 1)) * 100)}%`;
});
elements.progress.addEventListener("change", () => goTo(elements.progress.value));
$("[data-zoom-in]").addEventListener("click", () => changeZoom(0.1));
$("[data-zoom-out]").addEventListener("click", () => changeZoom(-0.1));
$("[data-fit-page]").addEventListener("click", fitPage);
$("[data-layout]").addEventListener("click", toggleLayout);
elements.dictionary.addEventListener("click", toggleDefineMode);
elements.speech.addEventListener("click", readAloud);
elements.spread.addEventListener("click", event => {
  if (!state.defineMode) return;
  const word = event.target.closest(".page-word")?.dataset.word;
  if (word) openDictionary(word);
});
$("[data-close-dictionary]").addEventListener("click", closeDictionary);
elements.dictionaryDialog.addEventListener("click", event => {
  if (event.target === elements.dictionaryDialog) closeDictionary();
});
elements.lockBook.addEventListener("click", openLockDialog);
elements.confirmLock.addEventListener("click", confirmBookLock);
elements.lockDialog.addEventListener("close", () => { state.pendingBook = null; });
elements.quizForm.addEventListener("submit", submitChapterTest);
elements.quizActions.addEventListener("click", event => {
  if (event.target.closest("[data-close-quiz]")) closeQuiz();
  else if (event.target.closest("[data-retry-quiz]") && state.activeTest) openChapterTest(state.activeTest, state.activeGatePage);
  else if (event.target.closest("[data-continue-quiz]")) continueAfterQuiz();
});
$$('[data-close-quiz]').forEach(button => button.addEventListener("click", closeQuiz));
elements.teacherTools.addEventListener("click", openTestEditor);
elements.testSelect.addEventListener("change", () => {
  state.editorTestId = elements.testSelect.value;
  renderTestEditor();
});
elements.testEditorForm.addEventListener("submit", submitTestEditor);
elements.testEditorFields.addEventListener("click", event => {
  const forceChapter = event.target.closest("[data-force-chapter-student]");
  if (forceChapter) {
    const row = forceChapter.closest(".teacher-lock-row");
    const selected = String($("[data-force-chapter-select]", row)?.value || "");
    const separator = selected.lastIndexOf("::");
    const selectedBook = bookById(separator > 0 ? selected.slice(0, separator) : "");
    const chapterNumber = Number(separator > 0 ? selected.slice(separator + 2) : 0);
    const chapter = chapterMap(selectedBook)?.chapters?.find(item => Number(item.number) === chapterNumber);
    const plan = state.teacherPlans.find(item => item.id === forceChapter.dataset.forceChapterStudent);
    if (!selectedBook || !chapter) {
      toast("Choose a target chapter.");
      return;
    }
    const studentName = plan?.studentName || plan?.studentEmail || "this student";
    if (!window.confirm(`Move ${studentName} to ${selectedBook.title}, Chapter ${chapter.number}? Earlier chapter checks will be bypassed, but their scores will not change.`)) return;
    forceChapter.disabled = true;
    forceStudentChapter(forceChapter.dataset.forceChapterStudent, selectedBook.id, chapter.number, chapter.startPage).then(async saved => {
      if (!saved) throw new Error("Account storage is unavailable in this tester.");
      state.teacherPlans = await loadStudentPlans();
      renderTestEditor();
      toast(`${studentName} moved to Chapter ${chapter.number}.`);
    }).catch(error => {
      forceChapter.disabled = false;
      toast(error?.message || "That chapter could not be forced.");
    });
    return;
  }
  const assign = event.target.closest("[data-assign-student]");
  if (assign) {
    const row = assign.closest(".teacher-lock-row");
    const selectedBook = bookById($("[data-assign-book-select]", row)?.value);
    const plan = state.teacherPlans.find(item => item.id === assign.dataset.assignStudent);
    if (!selectedBook) {
      toast("Choose a book to assign.");
      return;
    }
    const currentBook = bookById(plan?.state?.lockedBookId);
    const prompt = currentBook && currentBook.id !== selectedBook.id
      ? `Replace ${currentBook.title} with ${selectedBook.title} for this student?`
      : `Force-assign ${selectedBook.title} to this student?`;
    if (!window.confirm(prompt)) return;
    assign.disabled = true;
    assignStudentBook(assign.dataset.assignStudent, selectedBook.id).then(async saved => {
      if (!saved) throw new Error("Account storage is unavailable in this tester.");
      state.teacherPlans = await loadStudentPlans();
      renderTestEditor();
      toast(`${selectedBook.title} assigned.`);
    }).catch(error => {
      assign.disabled = false;
      toast(error?.message || "That book could not be assigned.");
    });
    return;
  }
  const allowNext = event.target.closest("[data-allow-next-student]");
  if (allowNext) {
    const nextBook = bookById(allowNext.dataset.nextSeriesBook);
    if (!nextBook || !window.confirm(`Allow this student to choose ${nextBook.title}? Their current book lock will be released.`)) return;
    allowNext.disabled = true;
    allowNextSeriesBook(allowNext.dataset.allowNextStudent, nextBook.id).then(async saved => {
      if (!saved) throw new Error("Account storage is unavailable in this tester.");
      state.teacherPlans = await loadStudentPlans();
      renderTestEditor();
      toast(`${nextBook.title} is now available for that student.`);
    }).catch(error => {
      allowNext.disabled = false;
      toast(error?.message || "That series book could not be unlocked.");
    });
    return;
  }
  const unlock = event.target.closest("[data-unlock-student]");
  if (unlock) {
    unlock.disabled = true;
    unlockStudentBook(unlock.dataset.unlockStudent).then(async saved => {
      if (!saved) throw new Error("Account storage is unavailable in this tester.");
      state.teacherPlans = await loadStudentPlans();
      renderTestEditor();
      toast("Student book unlocked.");
    }).catch(error => {
      unlock.disabled = false;
      toast(error?.message || "That book could not be unlocked.");
    });
    return;
  }
  if (event.target.closest("[data-add-question]")) {
    const questions = $("[data-editor-questions]", elements.testEditorFields);
    const index = $$(`[data-editor-question]`, questions).length;
    questions.insertAdjacentHTML("beforeend", editorQuestionMarkup({ id: `q${index + 1}`, choices: ["", "", "", ""], correctIndex: 0 }, index));
  }
  const remove = event.target.closest("[data-remove-question]");
  if (remove && !remove.disabled) {
    remove.closest("[data-editor-question]")?.remove();
    $$(`[data-editor-question]`, elements.testEditorFields).forEach((question, index) => {
      $(".editor-question-heading strong", question).textContent = `Question ${index + 1}`;
    });
  }
});
elements.resetTest.addEventListener("click", () => {
  if (!state.teacherMode || !state.editorTestId) return;
  resetLocalTest(state.editorTestId);
  const row = teacherTestRows().find(item => item.chapter.testId === state.editorTestId);
  if (row) {
    const starter = state.tests[state.editorTestId];
    if (starter) delete state.tests[state.editorTestId];
  }
  loadTests().then(tests => {
    state.tests = tests;
    renderTestEditor();
    toast("Local edits reset.");
  });
});
$$('[data-close-test-editor]').forEach(button => button.addEventListener("click", () => elements.testEditor.close()));
elements.readingPlan.addEventListener("click", event => {
  if (event.target.closest("[data-teacher-unlock]")) teacherUnlockBook();
});
$$('[data-home], [data-close-reader]').forEach(button => button.addEventListener("click", showLibrary));
$$('[data-theme]').forEach(button => button.addEventListener("click", toggleTheme));
$$('[data-fullscreen]').forEach(button => button.addEventListener("click", toggleFullscreen));

setInterval(() => {
  if (!state.book || (!state.pdf && !["images", "reflow"].includes(state.book.kind)) || document.hidden || Date.now() - state.lastActive > 90000) return;
  window.parent?.postMessage({
    type: "dw-storyvault-reading-heartbeat",
    bookId: state.book.id,
    bookTitle: state.book.title,
    page: state.page,
    seconds: 8
  }, location.origin);
}, 8000);

async function start() {
  if (state.theme === "light") document.body.classList.add("light");
  const [student, tests] = await Promise.all([loadStudentState(), loadTests()]);
  state.student = student;
  state.tests = tests;
  const localTeacherPreview = isLocalTester() && new URL(location.href).searchParams.get("role") === "teacher";
  state.teacherMode = Boolean(localTeacherPreview || student.permissions?.canManageLibrary);
  state.studentReady = true;
  elements.teacherTools.hidden = !state.teacherMode;
  renderFilters();
  renderShelf();

  const requestedBook = new URL(location.href).searchParams.get("book");
  const initialBook = bookById(requestedBook);
  if (initialBook) {
    if (state.student.lockedBookId && state.student.lockedBookId !== initialBook.id) {
      toast(`Continue ${lockedBook()?.title || "your locked book"} first.`);
    } else {
      openBook(initialBook);
    }
  }
}

start().catch(error => {
  console.error(error);
  state.studentReady = true;
  renderFilters();
  renderShelf();
  toast("The library opened in device-only mode.");
});
