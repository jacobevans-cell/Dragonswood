import { STARTER_TESTS } from "./assessment-data.js?v=20260905-5";

const STUDENT_KEY = "dw-class-library-student-state:v2";
const TESTS_KEY = "dw-class-library-test-overrides:v2";
export const SUMMARY_PROMPT = "Write one paragraph of exactly five complete sentences summarizing what happened in this chapter. Include the most important characters, events, problem or conflict, and outcome. Use your own words and describe events from this chapter only.";

const clone = value => JSON.parse(JSON.stringify(value));
let directStorePromise = null;

function directStore() {
  if (window.parent !== window) return Promise.resolve(null);
  const local = ["localhost", "127.0.0.1"].includes(location.hostname);
  if (local && new URL(location.href).searchParams.get("dw-env") !== "production") return Promise.resolve(null);
  directStorePromise ||= import("../v33-integration/js/integration/class-library-store.js").catch(() => null);
  return directStorePromise;
}

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value && typeof value === "object" ? value : clone(fallback);
  } catch {
    return clone(fallback);
  }
}

function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function parentRequest(action, payload = {}, timeout = 10000) {
  if (window.parent === window) return Promise.resolve(null);
  const requestId = `library-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      window.removeEventListener("message", onMessage);
      resolve(null);
    }, timeout);
    const onMessage = event => {
      if (event.origin !== location.origin || event.source !== window.parent) return;
      if (event.data?.type !== "dw-class-library-account-response" || event.data.requestId !== requestId) return;
      clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      resolve(event.data);
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({
      type: "dw-class-library-account-request",
      requestId,
      action,
      payload
    }, location.origin);
  });
}

export function emptyStudentState() {
  return {
    version: 2,
    lockedBookId: "",
    lockedAt: "",
    pages: {},
    pageVersions: {},
    passedTests: {},
    attempts: {},
    chapterOverrides: {},
    completedBookIds: [],
    seriesOverrideBookIds: [],
    storageMode: "device"
  };
}

function normalizeStudentState(value) {
  const base = emptyStudentState();
  const next = value && typeof value === "object" ? value : {};
  return {
    ...base,
    ...next,
    pages: next.pages && typeof next.pages === "object" ? next.pages : {},
    pageVersions: next.pageVersions && typeof next.pageVersions === "object" ? next.pageVersions : {},
    passedTests: next.passedTests && typeof next.passedTests === "object" ? next.passedTests : {},
    attempts: next.attempts && typeof next.attempts === "object" ? next.attempts : {},
    chapterOverrides: next.chapterOverrides && typeof next.chapterOverrides === "object" ? next.chapterOverrides : {},
    completedBookIds: Array.isArray(next.completedBookIds) ? [...new Set(next.completedBookIds)] : [],
    seriesOverrideBookIds: Array.isArray(next.seriesOverrideBookIds) ? [...new Set(next.seriesOverrideBookIds)] : []
  };
}

export async function loadStudentState() {
  const local = normalizeStudentState(readJson(STUDENT_KEY, emptyStudentState()));
  const response = await parentRequest("load-reading-state");
  let accountState = response?.ok ? response.state : null;
  let permissions = response?.permissions && typeof response.permissions === "object" ? response.permissions : null;
  if (!response?.ok) {
    const store = await directStore();
    if (store) {
      try {
        const access = await store.getAccess();
        permissions = access.teacher ? { canManageLibrary: true } : null;
        if (!access.teacher) accountState = await store.loadReadingState();
      } catch {}
    }
  }
  if (!accountState && !permissions) return local;
  const account = normalizeStudentState({ ...(accountState || local), permissions, storageMode: accountState || permissions ? "account" : "device" });
  writeJson(STUDENT_KEY, account);
  return account;
}

export async function saveStudentState(value) {
  const state = normalizeStudentState(value);
  writeJson(STUDENT_KEY, state);
  const response = await parentRequest("save-reading-state", { state }, 10000);
  let savedToAccount = Boolean(response?.ok);
  if (!savedToAccount) {
    const store = await directStore();
    if (store) {
      try { await store.saveReadingState(state); savedToAccount = true; } catch {}
    }
  }
  if (savedToAccount) {
    state.storageMode = "account";
    writeJson(STUDENT_KEY, state);
  }
  return state;
}

export async function loadTests() {
  const localOverrides = readJson(TESTS_KEY, {});
  const response = await parentRequest("load-chapter-tests");
  let accountOverrides = response?.ok && response.tests && typeof response.tests === "object" ? response.tests : {};
  if (!response?.ok) {
    const store = await directStore();
    if (store) {
      try { accountOverrides = await store.loadChapterTests(); } catch {}
    }
  }
  return { ...clone(STARTER_TESTS), ...localOverrides, ...accountOverrides };
}

export async function saveTest(test) {
  const overrides = readJson(TESTS_KEY, {});
  overrides[test.id] = clone(test);
  writeJson(TESTS_KEY, overrides);
  const response = await parentRequest("save-chapter-test", { test }, 10000);
  let savedToAccount = Boolean(response?.ok);
  if (!savedToAccount) {
    const store = await directStore();
    if (store) {
      try { await store.saveChapterTest(test); savedToAccount = true; } catch {}
    }
  }
  return { savedToAccount, test: clone(test) };
}

function summaryStructure(text) {
  const value = String(text || "").trim();
  const paragraphs = value ? value.split(/\n\s*\n/).filter(Boolean) : [];
  const sentences = globalThis.Intl?.Segmenter
    ? [...new Intl.Segmenter(undefined, { granularity: "sentence" }).segment(value)].map(item => item.segment.trim()).filter(item => /[.!?][\"'”’)]*$/.test(item))
    : (value.match(/[^.!?]+[.!?]+(?:[\"'”’)]*)?(?=\s|$)/g) || []);
  if (!value) return { ok: false, sentenceCount: 0, feedback: "Write your five-sentence summary before submitting." };
  if (paragraphs.length !== 1) return { ok: false, sentenceCount: sentences.length, feedback: "Put all five sentences into one connected paragraph." };
  if (sentences.length !== 5) return { ok: false, sentenceCount: sentences.length, feedback: `Your paragraph has ${sentences.length} complete sentence${sentences.length === 1 ? "" : "s"}. Revise it so it has exactly five.` };
  return { ok: true, sentenceCount: 5, feedback: "" };
}

export async function gradeSummary(test, studentAnswer) {
  const structure = summaryStructure(studentAnswer);
  if (!structure.ok) return { passed: false, decision: "not_approved", ...structure, ai: null };
  const payload = {
    testId: test.id,
    bookId: test.bookId,
    bookTitle: test.bookTitle || "",
    chapterNumber: test.chapterNumber,
    chapterTitle: test.chapterTitle,
    prompt: test.summaryPrompt || SUMMARY_PROMPT,
    chapterGuide: test.summaryGuide,
    studentAnswer: String(studentAnswer || "").trim()
  };
  const response = await parentRequest("grade-library-summary", payload, 30000);
  let result = response?.ok ? response.result : null;
  if (!result) {
    const store = await directStore();
    if (store) {
      try { result = await store.gradeLibrarySummary(payload); } catch {}
    }
  }
  if (!result) return {
    passed: false,
    decision: "review",
    sentenceCount: 5,
    feedback: "AI summary grading is unavailable in this standalone tester. Your work was preserved; reopen Storyvault inside your signed-in Dragonswood account to submit it.",
    ai: null
  };
  return {
    passed: result.passed === true,
    decision: result.decision || (result.passed ? "approve" : "not_approved"),
    sentenceCount: 5,
    feedback: String(result.feedback || result.reason || (result.passed ? "Your summary shows clear chapter understanding." : "Revise the summary using the feedback and try again.")),
    ai: result.ai || result
  };
}

export function resetLocalTest(testId) {
  const overrides = readJson(TESTS_KEY, {});
  delete overrides[testId];
  writeJson(TESTS_KEY, overrides);
}

export function gradeTest(test, answers) {
  const questions = Array.isArray(test?.questions) ? test.questions : [];
  const results = questions.map(question => {
    const selectedIndex = Number(answers?.[question.id]);
    const correct = Number.isInteger(selectedIndex) && selectedIndex === Number(question.correctIndex);
    return {
      questionId: question.id,
      selectedIndex: Number.isInteger(selectedIndex) ? selectedIndex : -1,
      correctIndex: Number(question.correctIndex),
      correct,
      explanation: question.explanation || ""
    };
  });
  const correctCount = results.filter(result => result.correct).length;
  const percent = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
  return {
    correctCount,
    total: questions.length,
    percent,
    passed: percent >= Math.max(1, Number(test?.passingPercent) || 80),
    results
  };
}

export async function loadStudentPlans() {
  const response = await parentRequest("load-student-plans", {}, 10000);
  if (response?.ok && Array.isArray(response.plans)) return response.plans;
  const store = await directStore();
  if (!store) return [];
  try { return await store.loadStudentPlans(); } catch { return []; }
}

export async function forceStudentChapter(studentId, bookId, chapterNumber, startPage) {
  const response = await parentRequest("force-student-chapter", { studentId, bookId, chapterNumber, startPage }, 10000);
  if (response?.ok) return true;
  const store = await directStore();
  if (!store) return false;
  await store.forceStudentChapter(studentId, bookId, chapterNumber, startPage);
  return true;
}

export async function unlockStudentBook(studentId) {
  const response = await parentRequest("unlock-student-book", { studentId }, 10000);
  if (response?.ok) return true;
  const store = await directStore();
  if (!store) return false;
  await store.unlockStudentBook(studentId);
  return true;
}

export async function allowNextSeriesBook(studentId, nextBookId) {
  const response = await parentRequest("allow-next-series-book", { studentId, nextBookId }, 10000);
  if (response?.ok) return true;
  const store = await directStore();
  if (!store) return false;
  await store.allowNextSeriesBook(studentId, nextBookId);
  return true;
}

export async function assignStudentBook(studentId, bookId) {
  const response = await parentRequest("assign-student-book", { studentId, bookId }, 10000);
  if (response?.ok) return true;
  const store = await directStore();
  if (!store) return false;
  await store.assignStudentBook(studentId, bookId);
  return true;
}
