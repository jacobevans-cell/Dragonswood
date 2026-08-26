import {getFirebaseContext,getCurrentAccess} from '../../../js/access-client.js';
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
  try {
    status('CONNECTING…');
    const C=await getFirebaseContext(),user=C.user,dbMod=C.fsMod;
    state.docRef = dbMod.doc(C.db, 'voidRunnerPlayers', user.uid);
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
      arcadeSessionId: String(getCurrentAccess()?.sessionId||''),
      updatedAt: state.serverTimestamp()
    }, { merge: true });
    status('CLOUD SAVE ON');
  } catch (error) {
    console.warn('Void Runner cloud save failed:', error);
    status('SAVE RETRY');
    state.pending = snapshot;
  }
}
