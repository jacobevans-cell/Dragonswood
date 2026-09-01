const FIREBASE_VERSION = "12.1.0";
const TEACHER_APP_NAME = "DragonswoodV33TeacherIntegration";
const TEACHER_EMAIL = "jacobicusjax@gmail.com";
const PRODUCTION_CONFIG = Object.freeze({
  apiKey: "AIzaSyC918WJoGQgxRKsqcz-3bXI7iZWv_1bwYE",
  authDomain: "dragonswood-9289e.firebaseapp.com",
  projectId: "dragonswood-9289e",
  storageBucket: "dragonswood-9289e.firebasestorage.app",
  messagingSenderId: "1064477064695",
  appId: "1:1064477064695:web:283e1016ee2303d39042f2"
});
const EMULATOR_CONFIG = Object.freeze({
  apiKey: "demo-key",
  authDomain: "demo-dragonswood-v33.localhost",
  projectId: "demo-dragonswood-v33",
  storageBucket: "demo-dragonswood-v33.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:demo-v33"
});

const modules = Promise.all([
  import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`),
  import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`),
  import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`),
  import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-functions.js`)
]).then(([app, auth, firestore, functions]) => ({ app, auth, firestore, functions }));

const clone = value => JSON.parse(JSON.stringify(value));

function requestedEnvironment() {
  const declared = String(document.documentElement?.dataset?.dwEnvironment || "").toLowerCase();
  const query = new URL(location.href).searchParams.get("dw-env");
  const local = ["localhost", "127.0.0.1"].includes(location.hostname);
  return declared === "production" || query === "production" || !local ? "production" : "emulator";
}

function authReady(auth, sdk) {
  if (auth.authStateReady) return auth.authStateReady();
  return new Promise(resolve => {
    const stop = sdk.auth.onAuthStateChanged(auth, () => { stop(); resolve(); }, () => { stop(); resolve(); });
  });
}

async function appConnection(sdk, name = "") {
  const environment = requestedEnvironment();
  const config = environment === "production" ? PRODUCTION_CONFIG : EMULATOR_CONFIG;
  let firebaseApp;
  try { firebaseApp = name ? sdk.app.getApp(name) : sdk.app.getApp(); }
  catch { firebaseApp = name ? sdk.app.initializeApp(config, name) : sdk.app.initializeApp(config); }
  const auth = sdk.auth.getAuth(firebaseApp);
  const db = sdk.firestore.getFirestore(firebaseApp);
  const functions = sdk.functions.getFunctions(firebaseApp, "us-central1");
  if (environment === "emulator") {
    try { sdk.auth.connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true }); } catch {}
    try { sdk.firestore.connectFirestoreEmulator(db, "127.0.0.1", 8080); } catch {}
    try { sdk.functions.connectFunctionsEmulator(functions, "127.0.0.1", 5001); } catch {}
  }
  await authReady(auth, sdk);
  return { auth, db, functions, user: auth.currentUser };
}

async function connection({ allowTeacher = false, requireTeacher = false } = {}) {
  const sdk = await modules;
  const student = await appConnection(sdk);
  let teacher = null;
  if (allowTeacher || requireTeacher || !student.user) teacher = await appConnection(sdk, TEACHER_APP_NAME);
  const teacherSignedIn = String(teacher?.user?.email || "").toLowerCase() === TEACHER_EMAIL;
  if (requireTeacher && !teacherSignedIn) throw new Error("Open this from the signed-in Dragonswood teacher account.");
  const selected = teacherSignedIn && allowTeacher ? teacher : student.user ? student : teacher;
  const { auth, db, user } = selected || {};
  if (!user) throw new Error("Sign in before opening the class library.");
  return { ...sdk, auth, db, user };
}

export async function getAccess() {
  const session = await connection({ allowTeacher: true });
  const teacher = String(session.user.email || "").toLowerCase() === TEACHER_EMAIL;
  return { teacher, userId: session.user.uid, email: session.user.email || "" };
}

function cleanStudentState(raw = {}) {
  const pages = Object.fromEntries(Object.entries(raw.pages || {})
    .slice(0, 100)
    .map(([id, page]) => [String(id).slice(0, 100), Math.max(1, Math.min(5000, Math.round(Number(page) || 1)))]));
  const pageVersions = Object.fromEntries(Object.entries(raw.pageVersions || {})
    .slice(0, 100)
    .map(([id, version]) => [String(id).slice(0, 100), String(version || "").slice(0, 100)]));
  const passedTests = Object.fromEntries(Object.entries(raw.passedTests || {}).slice(0, 1000));
  const attempts = Object.fromEntries(Object.entries(raw.attempts || {}).slice(0, 1000));
  return {
    version: 2,
    lockedBookId: String(raw.lockedBookId || "").slice(0, 100),
    lockedAt: String(raw.lockedAt || "").slice(0, 80),
    pages,
    pageVersions,
    passedTests,
    attempts,
    completedBookIds: [...new Set(Array.isArray(raw.completedBookIds) ? raw.completedBookIds.map(String).slice(0, 100) : [])],
    seriesOverrideBookIds: [...new Set(Array.isArray(raw.seriesOverrideBookIds) ? raw.seriesOverrideBookIds.map(String).slice(0, 100) : [])]
  };
}

function cleanTest(raw = {}) {
  const id = String(raw.id || "").slice(0, 160);
  if (!id || !String(raw.bookId || "")) throw new Error("This test is missing its chapter information.");
  const questions = (Array.isArray(raw.questions) ? raw.questions : []).slice(0, 7).map((question, index) => ({
    id: `q${index + 1}`,
    type: "multiple-choice",
    prompt: String(question.prompt || "").trim().slice(0, 1000),
    choices: (Array.isArray(question.choices) ? question.choices : []).slice(0, 6).map(choice => String(choice || "").trim().slice(0, 500)),
    correctIndex: Math.max(0, Math.min(5, Math.round(Number(question.correctIndex) || 0))),
    explanation: String(question.explanation || "").trim().slice(0, 1200),
    skill: String(question.skill || "").trim().slice(0, 80)
  }));
  if (questions.length !== 7 || questions.some(question => !question.prompt || question.choices.length !== 4 || question.choices.some(choice => !choice))) {
    throw new Error("Every chapter test must contain exactly seven complete questions with four choices each.");
  }
  const positions = questions.map(question => question.correctIndex);
  const counts = [0, 1, 2, 3].map(position => positions.filter(value => value === position).length);
  const rarePosition = counts.indexOf(1);
  const expectedRarePosition = (Math.max(1, Math.round(Number(raw.chapterNumber) || 1)) - 1) % 4;
  const recognizablePattern = positions.join("") === "0123012";
  const hasTriple = positions.some((value, index) => index > 1 && value === positions[index - 1] && value === positions[index - 2]);
  if ([...counts].sort().join(",") !== "1,2,2,2" || rarePosition !== expectedRarePosition || hasTriple || recognizablePattern) {
    throw new Error("Correct answers must use A–D, use three positions twice and the chapter's rotating position once, and avoid repeated or recognizable patterns.");
  }
  const summaryGuide = String(raw.summaryGuide || "").trim().slice(0, 500);
  if (raw.status === "published" && !summaryGuide) throw new Error("Add the private chapter context for AI summary grading before publishing.");
  return {
    id,
    bookId: String(raw.bookId).slice(0, 100),
    bookTitle: String(raw.bookTitle || "").slice(0, 300),
    chapterNumber: Math.max(1, Math.min(500, Math.round(Number(raw.chapterNumber) || 1))),
    chapterTitle: String(raw.chapterTitle || "").slice(0, 300),
    title: String(raw.title || "Chapter Check").slice(0, 300),
    status: raw.status === "published" ? "published" : "draft",
    passingPercent: Math.max(1, Math.min(100, Math.round(Number(raw.passingPercent) || 80))),
    questions,
    summaryRequired: true,
    summarySentenceCount: 5,
    summaryPrompt: "Write one paragraph of exactly five complete sentences summarizing what happened in this chapter. Include the most important characters, events, problem or conflict, and outcome. Use your own words and describe events from this chapter only.",
    summaryGuide
  };
}

export async function loadReadingState() {
  const { firestore, db, user } = await connection();
  const snapshot = await firestore.getDoc(firestore.doc(db, "studentReadingPlans", user.uid));
  return snapshot.exists() ? clone(snapshot.data().state || {}) : null;
}

export async function saveReadingState(input) {
  const { firestore, db, user } = await connection();
  const incoming = cleanStudentState(input);
  const ref = firestore.doc(db, "studentReadingPlans", user.uid);
  await firestore.runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref);
    const existing = cleanStudentState(snapshot.exists() ? snapshot.data().state || {} : {});
    const completedExistingBook = existing.lockedBookId && existing.completedBookIds.includes(existing.lockedBookId);
    if (existing.lockedBookId && incoming.lockedBookId !== existing.lockedBookId && !completedExistingBook) {
      throw new Error("Only a teacher can unlock an unfinished book.");
    }
    transaction.set(ref, {
      studentId: user.uid,
      studentEmail: user.email || "",
      state: incoming,
      updatedAt: firestore.serverTimestamp()
    }, { merge: true });
  });
  return incoming;
}

export async function loadChapterTests() {
  const { firestore, db } = await connection({ allowTeacher: true });
  const snapshot = await firestore.getDocs(firestore.collection(db, "chapterTests"));
  return Object.fromEntries(snapshot.docs.map(document => [document.id, { id: document.id, ...document.data() }]));
}

export async function saveChapterTest(input) {
  const { firestore, db, user } = await connection({ allowTeacher: true, requireTeacher: true });
  const test = cleanTest(input);
  await firestore.setDoc(firestore.doc(db, "chapterTests", test.id), {
    ...test,
    updatedBy: user.uid,
    updatedAt: firestore.serverTimestamp()
  }, { merge: false });
  return test;
}

export async function gradeLibrarySummary(input = {}) {
  const session = await connection();
  const studentAnswer = String(input.studentAnswer || "").trim().slice(0, 800);
  const chapterGuide = String(input.chapterGuide || "").trim().slice(0, 500);
  if (!studentAnswer || !chapterGuide) throw new Error("The summary and private chapter context are required.");
  const callable = session.functions.httpsCallable(session.functions.getFunctions(session.auth.app, "us-central1"), "gradeAcademicAnswer");
  const response = await callable({
    source: "dragonswood-storyvault",
    mode: "reasoning",
    questionId: String(input.testId || "").slice(0, 180),
    skillId: "ela.chapter-summary",
    gradeBand: "4-5",
    prompt: `${String(input.bookTitle || input.bookId || "Book").slice(0, 180)} — Chapter ${Math.max(1, Number(input.chapterNumber) || 1)}: ${String(input.chapterTitle || "").slice(0, 220)}. ${String(input.prompt || "Summarize this chapter in exactly five complete sentences.").slice(0, 850)}`,
    expectedAnswer: chapterGuide,
    studentAnswer,
    rubric: "Approve only a connected paragraph of exactly five complete sentences that accurately identifies important characters, major events, the main problem/conflict/discovery/change, the chapter outcome, and presents events in sensible order using the student's own words. Reject wrong-chapter, materially inaccurate, off-topic, repetitive, generic, disconnected, prompt-copying, or keyword-stuffing responses. Accept reasonable supported interpretations and minor grade 4–5 spelling, punctuation, or grammar errors when meaning is clear. Grade meaning and comprehension, not exact wording. Give concise supportive revision feedback without a model answer or hidden keywords."
  });
  const grade = response?.data || {};
  const decision = String(grade.decision || "review");
  return {
    passed: decision === "approve",
    decision,
    feedback: String(grade.reason || (decision === "approve" ? "Your summary shows genuine understanding of this chapter." : "Revise the summary using the chapter details and try again.")).slice(0, 500),
    ai: grade
  };
}

export async function loadStudentPlans() {
  const { firestore, db } = await connection({ allowTeacher: true, requireTeacher: true });
  const [planSnapshot, studentSnapshot] = await Promise.all([
    firestore.getDocs(firestore.collection(db, "studentReadingPlans")),
    firestore.getDocs(firestore.collection(db, "students"))
  ]);
  const plans = new Map(planSnapshot.docs.map(document => [document.id, document.data()]));
  const rows = studentSnapshot.docs.map(document => {
    const student = document.data() || {};
    const plan = plans.get(document.id) || {};
    plans.delete(document.id);
    return {
      id: document.id,
      studentName: String(student.firstName || student.displayName || student.email || `Scholar ${document.id.slice(0, 5)}`),
      studentEmail: String(plan.studentEmail || student.email || ""),
      state: cleanStudentState(plan.state || {})
    };
  });
  for (const [id, plan] of plans) rows.push({
    id,
    studentName: String(plan.studentEmail || `Scholar ${id.slice(0, 5)}`),
    studentEmail: String(plan.studentEmail || ""),
    state: cleanStudentState(plan.state || {})
  });
  return rows.sort((a, b) => a.studentName.localeCompare(b.studentName));
}

export async function unlockStudentBook(studentId) {
  const { firestore, db } = await connection({ allowTeacher: true, requireTeacher: true });
  const id = String(studentId || "").trim();
  if (!id) throw new Error("Choose a student reading plan.");
  await firestore.updateDoc(firestore.doc(db, "studentReadingPlans", id), {
    "state.lockedBookId": "",
    "state.lockedAt": "",
    updatedAt: firestore.serverTimestamp()
  });
  return true;
}

export async function allowNextSeriesBook(studentId, nextBookId) {
  const { firestore, db } = await connection({ allowTeacher: true, requireTeacher: true });
  const id = String(studentId || "").trim();
  const bookId = String(nextBookId || "").trim().slice(0, 100);
  if (!id || !bookId) throw new Error("Choose a student and the next series book.");
  await firestore.updateDoc(firestore.doc(db, "studentReadingPlans", id), {
    "state.lockedBookId": "",
    "state.lockedAt": "",
    "state.seriesOverrideBookIds": firestore.arrayUnion(bookId),
    updatedAt: firestore.serverTimestamp()
  });
  return true;
}

export async function assignStudentBook(studentId, selectedBookId) {
  const { firestore, db } = await connection({ allowTeacher: true, requireTeacher: true });
  const id = String(studentId || "").trim();
  const bookId = String(selectedBookId || "").trim().slice(0, 100);
  if (!id || !bookId) throw new Error("Choose a student and a book.");
  const planRef = firestore.doc(db, "studentReadingPlans", id);
  const studentRef = firestore.doc(db, "students", id);
  await firestore.runTransaction(db, async transaction => {
    const [studentSnapshot, planSnapshot] = await Promise.all([
      transaction.get(studentRef),
      transaction.get(planRef)
    ]);
    if (!studentSnapshot.exists()) throw new Error("That student is no longer in the class roster.");
    const student = studentSnapshot.data() || {};
    const plan = planSnapshot.exists() ? planSnapshot.data() || {} : {};
    const state = cleanStudentState(plan.state || {});
    state.lockedBookId = bookId;
    state.lockedAt = new Date().toISOString();
    transaction.set(planRef, {
      studentId: id,
      studentEmail: String(plan.studentEmail || student.email || ""),
      state,
      updatedAt: firestore.serverTimestamp()
    }, { merge: false });
  });
  return true;
}
