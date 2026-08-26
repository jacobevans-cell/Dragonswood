let state = {
  ready: false,
  docRef: null,
  setDoc: null,
  serverTimestamp: null,
  pending: null,
  timer: null,
  getSnapshot: null,
  onStatus: null
};

function status(text) {
  try { state.onStatus?.(text); } catch {}
}

export async function initCloudSync({ getSnapshot, applySnapshot, onStatus } = {}) {
  state.getSnapshot = getSnapshot || null;
  state.onStatus = onStatus || null;
  const cfg = window.VOID_RUNNER_CONFIG?.firebase || {};

  if (!cfg.enabled) {
    status('LOCAL SAVE');
    return { enabled: false };
  }
  if (!cfg.apiKey || !cfg.projectId || !cfg.appId) {
    status('CLOUD CONFIG NEEDED');
    console.warn('Void Runner: Firebase is enabled but required config fields are missing.');
    return { enabled: false };
  }

  try {
    status('CONNECTING…');
    const [{ initializeApp }, authMod, dbMod] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
    ]);

    const app = initializeApp({
      apiKey: cfg.apiKey,
      authDomain: cfg.authDomain || `${cfg.projectId}.firebaseapp.com`,
      projectId: cfg.projectId,
      appId: cfg.appId
    });
    const auth = authMod.getAuth(app);

    if ((cfg.authMode || 'anonymous') !== 'anonymous') {
      throw new Error(`Unsupported authMode: ${cfg.authMode}. This package ships with anonymous auth only.`);
    }
    if (!auth.currentUser) await authMod.signInAnonymously(auth);
    const user = auth.currentUser;
    if (!user) throw new Error('Firebase authentication did not return a user.');

    const db = dbMod.getFirestore(app);
    state.docRef = dbMod.doc(db, 'voidRunnerPlayers', user.uid);
    state.setDoc = dbMod.setDoc;
    state.serverTimestamp = dbMod.serverTimestamp;

    const existing = await dbMod.getDoc(state.docRef);
    if (existing.exists()) {
      try { applySnapshot?.(existing.data()); } catch (error) { console.warn('Cloud progress merge failed:', error); }
    }

    state.ready = true;
    status('CLOUD SAVE ON');
    queueCloudSync(getSnapshot?.());
    return { enabled: true, uid: user.uid };
  } catch (error) {
    console.warn('Void Runner cloud sync unavailable:', error);
    status('LOCAL SAVE');
    return { enabled: false, error };
  }
}

export function queueCloudSync(snapshot) {
  if (snapshot) state.pending = snapshot;
  if (!state.ready || !state.docRef || !state.setDoc) return;
  clearTimeout(state.timer);
  state.timer = setTimeout(flushCloudSync, 750);
}

export async function flushCloudSync() {
  if (!state.ready || !state.docRef || !state.setDoc) return;
  const snapshot = state.pending || state.getSnapshot?.();
  if (!snapshot) return;
  state.pending = null;
  try {
    status('SAVING…');
    await state.setDoc(state.docRef, {
      ...snapshot,
      schemaVersion: 2,
      updatedAt: state.serverTimestamp()
    }, { merge: true });
    status('CLOUD SAVE ON');
  } catch (error) {
    console.warn('Void Runner cloud save failed:', error);
    status('SAVE RETRY');
    state.pending = snapshot;
  }
}
