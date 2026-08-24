import { seatGeometry, evaluatePlan, generateCandidates, quickShuffle } from './optimizer.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

const firebaseConfig = { apiKey: 'AIzaSyC918WJoGQgxRKsqcz-3bXI7iZWv_1bwYE', authDomain: 'dragonswood-9289e.firebaseapp.com', projectId: 'dragonswood-9289e', storageBucket: 'dragonswood-9289e.firebasestorage.app', messagingSenderId: '1064477064695', appId: '1:1064477064695:web:283e1016ee2303d39042f2' };
const TEACHER_EMAIL = 'jacobicusjax@gmail.com';
const CLASSROOM_ID = 'evans-4-5';
// Match Teacher Command's named app so its session-auth persistence is reused
// inside the embedded seating workspace.
const app = initializeApp(firebaseConfig, 'DragonswoodTeacherPortal');
const auth = getAuth(app);
const db = getFirestore(app);
const clone = value => JSON.parse(JSON.stringify(value));
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const state = {
  students: [],
  rules: [],
  layout: 'pods',
  flipped: false,
  studentFlipped: false,
  seats: [],
  plan: [],
  previousPlan: null,
  candidates: [],
  previewPlan: null,
  selectedSeatId: null,
  history: [],
  purpose: 'focus'
};

async function loadState() {
  const roster = await getDocs(collection(db, 'students'));
  state.students = roster.docs.map(snapshot => {
    const data = snapshot.data();
    return { id: snapshot.id, name: String(data.firstName || data.displayName || 'Scholar'), grade: Number(data.grade) === 5 ? 5 : 4 };
  }).sort((a, b) => a.name.localeCompare(b.name));
  const saved = await getDoc(doc(db, 'classrooms', CLASSROOM_ID, 'seatingPlans', 'current'));
  const data = saved.exists() ? saved.data() : null;
  state.rules = Array.isArray(data?.rules) ? data.rules : [];
  state.layout = data?.layout || 'pods';
  state.flipped = Boolean(data?.flipped);
  state.purpose = data?.purpose || 'focus';
  state.seats = seatGeometry(state.layout, Math.max(24, state.students.length));
  const validIds = new Set(state.students.map(student => student.id));
  const savedPlan = Array.isArray(data?.plan) ? data.plan.filter(seat => !seat.studentId || validIds.has(seat.studentId)) : [];
  state.plan = savedPlan.length === state.seats.length ? savedPlan : assignInOrder(state.seats, state.students);
  state.previousPlan = Array.isArray(data?.previousPlan) ? data.previousPlan : null;
}

function assignInOrder(seats, students) {
  return seats.map((seat, index) => ({ ...seat, studentId: students[index]?.id ?? null }));
}

async function initialize() {
  await loadState();
  bindEvents();
  renderAll();
}

function bindEvents() {
  $$('#layoutSelector .segment').forEach(button => button.addEventListener('click', () => changeLayout(button.dataset.layout)));
  $$('.tab').forEach(button => button.addEventListener('click', () => setTab(button.dataset.tab)));
  $('#flipButton').addEventListener('click', () => { state.flipped = !state.flipped; renderRoom(); });
  $('#studentFlipButton').addEventListener('click', () => { state.studentFlipped = !state.studentFlipped; renderStudentRoom(); });
  $('#undoButton').addEventListener('click', undo);
  $('#shuffleButton').addEventListener('click', doQuickShuffle);
  $('#smartArrangeButton').addEventListener('click', doSmartArrange);
  $('#savePlanButton').addEventListener('click', savePlan);
  $('#presentButton').addEventListener('click', openStudentView);
  $('#closeStudentViewButton').addEventListener('click', () => $('#studentViewDialog').close());
  $('#rosterSearch').addEventListener('input', renderRoster);
  $('#clearSelectionButton').addEventListener('click', () => { state.selectedSeatId = null; renderRoom(); });
  $('#ruleType').addEventListener('change', updateRuleFormVisibility);
  $('#ruleForm').addEventListener('submit', addRule);
  $('#refreshInsightsButton').addEventListener('click', () => { renderMetricsAndInsights(); showToast('Plan intelligence refreshed.'); });
  $('#refreshRosterButton').addEventListener('click', () => window.location.reload());
  $('#purposeSelector').value = state.purpose;
  $('#purposeSelector').addEventListener('change', event => { state.purpose = event.target.value; showToast('Purpose updated. Save the plan to keep it.'); });
  $('#cancelImportButton').addEventListener('click', () => $('#importDialog').close());
  $('#importForm').addEventListener('submit', importRoster);
  $('#csvFileInput').addEventListener('change', readCsvFile);
  window.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); savePlan(); }
  });
}

function snapshot() {
  state.history.push({ plan: clone(state.plan), layout: state.layout, rules: clone(state.rules) });
  if (state.history.length > 20) state.history.shift();
}

function undo() {
  const prior = state.history.pop();
  if (!prior) { showToast('Nothing to undo yet.'); return; }
  state.layout = prior.layout;
  state.seats = seatGeometry(state.layout, Math.max(24, state.students.length));
  state.plan = prior.plan;
  state.rules = prior.rules;
  state.candidates = [];
  state.previewPlan = null;
  state.selectedSeatId = null;
  renderAll();
  showToast('Last seating change undone.');
}

function changeLayout(layout) {
  if (layout === state.layout) return;
  snapshot();
  const assignments = state.plan.map(seat => seat.studentId).filter(Boolean);
  state.layout = layout;
  state.seats = seatGeometry(layout, Math.max(24, state.students.length));
  state.plan = state.seats.map((seat, index) => ({ ...seat, studentId: assignments[index] ?? null }));
  state.rules = state.rules.filter(rule => rule.type !== 'lock');
  state.candidates = [];
  state.previewPlan = null;
  state.selectedSeatId = null;
  renderAll();
  showToast('Layout changed. Seat locks were cleared because the room geometry changed.');
}

function setTab(tab) {
  $$('.tab').forEach(button => {
    const active = button.dataset.tab === tab;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  $$('.tab-panel').forEach(panel => {
    const active = panel.dataset.panel === tab;
    panel.classList.toggle('active', active);
    panel.hidden = !active;
  });
}

function studentById(id) { return state.students.find(student => student.id === id); }
function seatById(id) { return state.plan.find(seat => seat.id === id); }
function rulesForStudent(id) { return state.rules.filter(rule => rule.a === id || rule.b === id); }

function renderAll() {
  $$('#layoutSelector .segment').forEach(button => button.classList.toggle('active', button.dataset.layout === state.layout));
  renderRoom();
  renderRoster();
  renderRules();
  populateRuleSelectors();
  renderCandidates();
  renderMetricsAndInsights();
  updateRuleFormVisibility();
}

function seatMarkup(seat, student, studentView = false) {
  if (!student) return `<button class="seat open" type="button" data-seat-id="${seat.id}" style="left:${seat.x}%;top:${seat.y}%"><span>Open seat</span></button>`;
  const locked = state.rules.some(rule => rule.type === 'lock' && rule.a === student.id && rule.seatId === seat.id);
  const hasRules = rulesForStudent(student.id).length > 0;
  const initial = student.name.trim().charAt(0).toUpperCase();
  return `<button class="seat ${hasRules && !studentView ? 'rule-aware' : ''} ${state.selectedSeatId === seat.id && !studentView ? 'selected' : ''}" type="button" draggable="${studentView ? 'false' : 'true'}" data-seat-id="${seat.id}" data-student-id="${student.id}" style="left:${seat.x}%;top:${seat.y}%">
    <span class="student-avatar grade${student.grade}">${initial}</span>
    <span class="seat-name"><strong>${escapeHtml(student.name)}</strong><small>${studentView ? '' : `Grade ${student.grade} • ${seat.group}`}</small></span>
    ${locked && !studentView ? '<span class="seat-lock" aria-label="Seat locked">🔒</span>' : ''}
  </button>`;
}

function renderRoom() {
  const layer = $('#seatLayer');
  const displayedPlan = state.previewPlan || state.plan;
  layer.innerHTML = displayedPlan.map(seat => seatMarkup(seat, studentById(seat.studentId))).join('');
  $('#roomStage').classList.toggle('flipped', state.flipped);
  addPodRings(layer, displayedPlan);
  bindSeatInteractions(layer);
  renderStudentRoom();
  renderMetricsAndInsights();
}

function addPodRings(layer, plan) {
  if (!['pods', 'trios'].includes(state.layout)) return;
  const groups = [...new Set(plan.map(seat => seat.group))];
  for (const group of groups) {
    const groupSeats = plan.filter(seat => seat.group === group);
    if (!groupSeats.length) continue;
    const xs = groupSeats.map(seat => seat.x);
    const ys = groupSeats.map(seat => seat.y);
    const ring = document.createElement('div');
    ring.className = 'pod-ring';
    ring.style.left = `${Math.min(...xs) - 5}%`;
    ring.style.top = `${Math.min(...ys) - 6}%`;
    ring.style.width = `${Math.max(...xs) - Math.min(...xs) + 10}%`;
    ring.style.height = `${Math.max(...ys) - Math.min(...ys) + 12}%`;
    layer.prepend(ring);
  }
}

function bindSeatInteractions(layer) {
  layer.querySelectorAll('.seat').forEach(seatEl => {
    seatEl.addEventListener('click', () => handleSeatClick(seatEl.dataset.seatId));
    seatEl.addEventListener('dragstart', event => {
      event.dataTransfer.setData('text/plain', seatEl.dataset.seatId);
      event.dataTransfer.effectAllowed = 'move';
    });
    seatEl.addEventListener('dragover', event => { event.preventDefault(); seatEl.classList.add('drag-over'); });
    seatEl.addEventListener('dragleave', () => seatEl.classList.remove('drag-over'));
    seatEl.addEventListener('drop', event => {
      event.preventDefault();
      seatEl.classList.remove('drag-over');
      const fromId = event.dataTransfer.getData('text/plain');
      if (fromId && fromId !== seatEl.dataset.seatId) swapSeats(fromId, seatEl.dataset.seatId);
    });
  });
}

function handleSeatClick(seatId) {
  if (state.previewPlan) {
    state.previewPlan = null;
    state.selectedSeatId = null;
    renderRoom();
    showToast('Candidate preview closed. Your working plan was not changed.');
    return;
  }
  if (!state.selectedSeatId) {
    state.selectedSeatId = seatId;
    renderRoom();
    return;
  }
  if (state.selectedSeatId === seatId) {
    state.selectedSeatId = null;
    renderRoom();
    return;
  }
  swapSeats(state.selectedSeatId, seatId);
  state.selectedSeatId = null;
}

function swapSeats(aId, bId) {
  const a = seatById(aId);
  const b = seatById(bId);
  if (!a || !b) return;
  const lockedA = a.studentId && state.rules.some(rule => rule.type === 'lock' && rule.a === a.studentId && rule.seatId === a.id);
  const lockedB = b.studentId && state.rules.some(rule => rule.type === 'lock' && rule.a === b.studentId && rule.seatId === b.id);
  if (lockedA || lockedB) { showToast('Unlock that scholar before moving the seat.'); return; }
  snapshot();
  [a.studentId, b.studentId] = [b.studentId, a.studentId];
  state.candidates = [];
  renderAll();
}

function renderStudentRoom() {
  const layer = $('#studentSeatLayer');
  if (!layer) return;
  const displayedPlan = state.previewPlan || state.plan;
  layer.innerHTML = displayedPlan.map(seat => seatMarkup(seat, studentById(seat.studentId), true)).join('');
  $('#studentRoom').classList.toggle('flipped', state.studentFlipped);
}

function renderRoster() {
  const query = ($('#rosterSearch')?.value || '').trim().toLowerCase();
  const rows = state.students.filter(student => student.name.toLowerCase().includes(query)).map(student => {
    const seat = state.plan.find(item => item.studentId === student.id);
    const ruleCount = rulesForStudent(student.id).length;
    const locked = state.rules.some(rule => rule.type === 'lock' && rule.a === student.id);
    return `<button class="roster-row" type="button" data-student-id="${student.id}">
      <span class="student-avatar grade${student.grade}">${escapeHtml(student.name.charAt(0).toUpperCase())}</span>
      <span class="roster-copy"><strong>${escapeHtml(student.name)}</strong><small>Grade ${student.grade} • ${seat ? `${seat.group} / ${seat.id.replace('seat-', 'Seat ')}` : 'Unseated'}</small></span>
      <span class="roster-meta">${ruleCount ? `<span class="micro-chip rule">✦ ${ruleCount}</span>` : ''}${locked ? '<span class="micro-chip">🔒</span>' : ''}</span>
    </button>`;
  }).join('');
  $('#rosterList').innerHTML = rows || '<div class="empty-state"><strong>No scholars found</strong></div>';
  $('#rosterList').querySelectorAll('.roster-row').forEach(row => row.addEventListener('click', () => focusStudent(row.dataset.studentId)));
  const seated = state.plan.filter(seat => seat.studentId).length;
  $('#rosterSeatedSummary').textContent = `${seated}/${state.students.length} seated`;
}

function focusStudent(studentId) {
  const seat = state.plan.find(item => item.studentId === studentId);
  if (!seat) return;
  state.selectedSeatId = seat.id;
  renderRoom();
  $('#roomStage').focus();
}

function ruleDescription(rule) {
  const a = studentById(rule.a)?.name || 'Unknown';
  const b = studentById(rule.b)?.name || 'Unknown';
  if (rule.type === 'apart') return { icon: '↔', title: `${a} + ${b}`, detail: 'Keep out of the same nearby cluster' };
  if (rule.type === 'together') return { icon: '🤝', title: `${a} + ${b}`, detail: 'Prefer the same nearby group' };
  if (rule.type === 'front') return { icon: '⬆', title: a, detail: 'Place in the front zone' };
  if (rule.type === 'door') return { icon: '🚪', title: a, detail: 'Prefer the door side of the room' };
  if (rule.type === 'lock') return { icon: '🔒', title: a, detail: `Keep ${rule.seatId?.replace('seat-', 'Seat ') || 'current seat'} fixed` };
  return { icon: '✦', title: a, detail: 'Custom seating preference' };
}

function renderRules() {
  $('#ruleList').innerHTML = state.rules.map(rule => {
    const description = ruleDescription(rule);
    return `<article class="rule-card ${rule.priority}"><span class="rule-icon">${description.icon}</span><span class="rule-copy"><strong>${escapeHtml(description.title)}</strong><small>${escapeHtml(description.detail)} • ${rule.priority === 'hard' ? 'Hard rule' : 'Preference'}</small></span><button class="delete-rule" type="button" data-rule-id="${rule.id}" aria-label="Delete rule">×</button></article>`;
  }).join('') || '<div class="empty-state"><span>✦</span><strong>No rules yet</strong><p>Add only the placement rules that actually help this class learn.</p></div>';
  $('#ruleList').querySelectorAll('.delete-rule').forEach(button => button.addEventListener('click', () => deleteRule(button.dataset.ruleId)));
  $('#ruleBadge').textContent = String(state.rules.length);
}

function populateRuleSelectors() {
  const options = state.students.map(student => `<option value="${student.id}">${escapeHtml(student.name)} • Grade ${student.grade}</option>`).join('');
  $('#ruleStudentA').innerHTML = options;
  $('#ruleStudentB').innerHTML = options;
  if (state.students.length > 1) $('#ruleStudentB').selectedIndex = 1;
}

function updateRuleFormVisibility() {
  const type = $('#ruleType').value;
  const pair = type === 'apart' || type === 'together';
  $('#ruleStudentBWrap').hidden = !pair;
  if (type === 'lock') {
    $('#rulePriority').value = 'hard';
    $('#rulePriority').disabled = true;
  } else {
    $('#rulePriority').disabled = false;
  }
}

function addRule(event) {
  event.preventDefault();
  const type = $('#ruleType').value;
  const a = $('#ruleStudentA').value;
  const b = $('#ruleStudentB').value;
  const priority = type === 'lock' ? 'hard' : $('#rulePriority').value;
  if ((type === 'apart' || type === 'together') && a === b) { showToast('Choose two different scholars for a pair rule.'); return; }
  const rule = { id: `r-${Date.now()}`, type, a, priority };
  if (type === 'apart' || type === 'together') rule.b = b;
  if (type === 'lock') {
    const seat = state.plan.find(item => item.studentId === a);
    if (!seat) { showToast('That scholar is not currently seated.'); return; }
    rule.seatId = seat.id;
    state.rules = state.rules.filter(existing => !(existing.type === 'lock' && existing.a === a));
  }
  snapshot();
  state.rules.push(rule);
  state.candidates = [];
  renderAll();
  showToast('Seating rule added.');
}

function deleteRule(ruleId) {
  snapshot();
  state.rules = state.rules.filter(rule => rule.id !== ruleId);
  state.candidates = [];
  renderAll();
}

function doQuickShuffle() {
  state.previewPlan = null;
  snapshot();
  state.plan = quickShuffle(state.seats, state.students, state.rules);
  state.candidates = [];
  state.selectedSeatId = null;
  renderAll();
  showToast('Quick shuffle complete. Hard rules are checked in the plan summary.');
}

function doSmartArrange() {
  state.previewPlan = null;
  const button = $('#smartArrangeButton');
  button.disabled = true;
  button.textContent = 'Thinking…';
  window.setTimeout(() => {
    state.candidates = generateCandidates(state.seats, state.students, state.rules, state.plan, state.previousPlan || state.plan, 2200);
    renderCandidates();
    setTab('plans');
    $('#planBadge').textContent = String(state.candidates.length);
    button.disabled = false;
    button.textContent = '✦ Smart Arrange';
    showToast('Three local candidates generated and scored.');
  }, 40);
}

function renderCandidates() {
  const list = $('#candidateList');
  $('#planBadge').textContent = String(state.candidates.length);
  if (!state.candidates.length) {
    list.innerHTML = '<div class="empty-state"><span>✦</span><strong>No candidates yet</strong><p>Choose Smart Arrange to compare three high-scoring plans.</p></div>';
    return;
  }
  list.innerHTML = state.candidates.map(candidate => {
    const label = candidate.rank === 1 ? 'Best fit' : candidate.rank === 2 ? 'Strong alternate' : 'Fresh-neighbor alternate';
    const points = candidate.evaluation.reasons.slice(0, 3).map(reason => `<span>• ${escapeHtml(reason)}</span>`).join('');
    return `<article class="candidate-card"><div class="candidate-top"><div class="candidate-copy"><strong>${label}</strong><span>${candidate.evaluation.hardConflicts ? `${candidate.evaluation.hardConflicts} hard conflict(s)` : 'All hard rules satisfied'}</span></div><div class="candidate-score">${candidate.evaluation.score}</div></div><div class="candidate-points">${points}</div><div class="candidate-actions"><button class="button compact quiet" type="button" data-preview-rank="${candidate.rank}">Preview</button><button class="button compact primary" type="button" data-apply-rank="${candidate.rank}">Use Plan</button></div></article>`;
  }).join('');
  list.querySelectorAll('[data-preview-rank]').forEach(button => button.addEventListener('click', () => previewCandidate(Number(button.dataset.previewRank))));
  list.querySelectorAll('[data-apply-rank]').forEach(button => button.addEventListener('click', () => applyCandidate(Number(button.dataset.applyRank))));
}

function previewCandidate(rank) {
  const candidate = state.candidates.find(item => item.rank === rank);
  if (!candidate) return;
  state.previewPlan = clone(candidate.plan);
  renderRoom();
  showToast(`Previewing candidate ${rank}. Your working plan has not changed.`);
}

function applyCandidate(rank) {
  const candidate = state.candidates.find(item => item.rank === rank);
  if (!candidate) return;
  snapshot();
  state.plan = clone(candidate.plan);
  state.previewPlan = null;
  state.candidates = [];
  state.selectedSeatId = null;
  renderAll();
  setTab('roster');
  showToast(`Candidate ${rank} applied. Save when you are ready.`);
}

async function savePlan() {
  if (state.previewPlan) {
    showToast('This is only a preview. Choose Use Plan before saving it.');
    return;
  }
  const evaluation = evaluatePlan(state.plan, state.students, state.rules, state.previousPlan || state.plan);
  if (evaluation.hardConflicts > 0) {
    showToast(`Plan not saved: ${evaluation.hardConflicts} hard rule conflict${evaluation.hardConflicts === 1 ? '' : 's'} remain.`);
    setTab('rules');
    return;
  }
  if (!window.confirm('Save this plan as the active classroom seating chart? The previous active plan will remain in history.')) return;
  const previous = clone(state.previousPlan || state.plan);
  const payload = { layout: state.layout, flipped: state.flipped, purpose: state.purpose, plan: clone(state.plan), previousPlan: previous, rules: clone(state.rules), status: 'active', updatedAt: serverTimestamp(), updatedBy: auth.currentUser?.uid || '' };
  const button = $('#savePlanButton');
  button.disabled = true;
  try {
    await addDoc(collection(db, 'classrooms', CLASSROOM_ID, 'seatingHistory'), { ...payload, plan: previous, previousPlan: null, archivedAt: serverTimestamp() });
    await setDoc(doc(db, 'classrooms', CLASSROOM_ID, 'seatingPlans', 'current'), payload, { merge: false });
    state.previousPlan = clone(state.plan);
    renderMetricsAndInsights();
    showToast('Active seating plan saved. A rollback copy was added to history.');
  } catch (error) {
    console.error('Seating plan save failed', error);
    showToast(`Save failed: ${error.code || error.message || 'unknown error'}`);
  } finally { button.disabled = false; }
}

function openStudentView() {
  renderStudentRoom();
  $('#studentViewDialog').showModal();
}

function renderMetricsAndInsights() {
  const displayedPlan = state.previewPlan || state.plan;
  const evaluation = evaluatePlan(displayedPlan, state.students, state.rules, state.previousPlan);
  const grade4 = state.students.filter(student => Number(student.grade) === 4).length;
  const grade5 = state.students.filter(student => Number(student.grade) === 5).length;
  const seated = displayedPlan.filter(seat => seat.studentId).length;
  const open = Math.max(0, displayedPlan.length - seated);
  const hardTotal = state.rules.filter(rule => rule.priority === 'hard').length;
  $('#studentCountMetric').textContent = String(state.students.length);
  $('#gradeSplitMetric').textContent = `${grade4} fourth • ${grade5} fifth`;
  $('#seatCountMetric').textContent = String(displayedPlan.length);
  $('#openSeatsMetric').textContent = `${open} open seat${open === 1 ? '' : 's'}`;
  $('#hardRuleMetric').textContent = evaluation.hardConflicts ? String(evaluation.hardConflicts) : '0';
  $('#hardRuleDetail').textContent = evaluation.hardConflicts ? 'Resolve before saving' : `${hardTotal} rule${hardTotal === 1 ? '' : 's'} satisfied`;
  $('#freshNeighborMetric').textContent = state.previousPlan ? `${evaluation.freshPercent}%` : '—';
  const freshDetail = document.querySelector('#freshNeighborMetric + span');
  if (freshDetail) freshDetail.textContent = state.previousPlan ? 'Compared with last saved plan' : 'Save once to establish a baseline';
  const health = $('#planHealth');
  health.classList.remove('warning', 'danger');
  if (evaluation.hardConflicts) { health.classList.add('danger'); health.innerHTML = '<span class="health-dot"></span> Needs attention'; }
  else if (evaluation.softMisses) { health.classList.add('warning'); health.innerHTML = '<span class="health-dot"></span> Strong plan'; }
  else health.innerHTML = '<span class="health-dot"></span> Plan ready';

  const locked = state.rules.filter(rule => rule.type === 'lock').length;
  const frontCount = displayedPlan.filter(seat => seat.studentId && seat.y <= 46).length;
  const groupCount = new Set(displayedPlan.map(seat => seat.group)).size;
  const insights = [
    { icon: '🛡️', title: 'Hard-rule check', text: evaluation.hardConflicts ? `${evaluation.hardConflicts} conflict(s) remain. The system will not save this as final.` : 'Every must-follow placement rule is currently satisfied.' },
    { icon: '🔄', title: 'Neighbor rotation', text: `${evaluation.freshPercent}% of scholars have at least one fresh nearby peer compared with the saved reference.` },
    { icon: '⚖️', title: 'Grade balance', text: evaluation.eligibleGroups ? `${evaluation.mixedGroups} of ${evaluation.eligibleGroups} collaborative groups currently mix grade levels.` : 'This layout prioritizes forward-facing focus rather than mixed table groups.' },
    { icon: '🧭', title: 'Room geometry', text: `${frontCount} seats are in the front zone across ${groupCount} seating group${groupCount === 1 ? '' : 's'}; ${locked} seat${locked === 1 ? '' : 's'} locked.` }
  ];
  $('#insightGrid').innerHTML = insights.map(item => `<article class="insight-card"><span class="insight-icon">${item.icon}</span><strong>${item.title}</strong><p>${escapeHtml(item.text)}</p></article>`).join('');
}

function importRoster(event) {
  event.preventDefault();
  const parsed = parseRoster($('#importText').value);
  if (!parsed.length) { showToast('Add at least one name before importing.'); return; }
  snapshot();
  state.students = parsed;
  state.rules = [];
  state.seats = seatGeometry(state.layout, Math.max(24, state.students.length));
  state.plan = assignInOrder(state.seats, state.students);
  state.previousPlan = null;
  state.candidates = [];
  state.previewPlan = null;
  state.history = [];
  $('#importDialog').close();
  $('#importText').value = '';
  renderAll();
  showToast(`${parsed.length} scholars imported. Rules were cleared for privacy and accuracy.`);
}

function parseRoster(text) {
  return text.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map((line, index) => {
    const [rawName, rawGrade] = line.split(',').map(part => part.trim());
    const name = rawName || `Scholar ${index + 1}`;
    const grade = Number(rawGrade) === 5 ? 5 : 4;
    return { id: `import-${Date.now()}-${index}`, name, grade };
  }).slice(0, 40);
}

function readCsvFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { $('#importText').value = String(reader.result || ''); };
  reader.readAsText(file);
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

onAuthStateChanged(auth, async user => {
  if (!user || String(user.email || '').toLowerCase() !== TEACHER_EMAIL) {
    document.body.innerHTML = '<main class="auth-block"><h1>Teacher authorization required</h1><p>Open Teacher Command and sign in with the authorized Dragonswood teacher account.</p><a href="../teacher.html">Return to Teacher Command</a></main>';
    return;
  }
  try { await initialize(); }
  catch (error) {
    console.error('Seating Command startup failed', error);
    document.body.innerHTML = `<main class="auth-block"><h1>Seating Command could not load</h1><p>${escapeHtml(error.code || error.message || String(error))}</p></main>`;
  }
});
