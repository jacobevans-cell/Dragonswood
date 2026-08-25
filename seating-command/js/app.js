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
  const frontCount = displayedPlan.filter(seat => seat.studentId && (seat.frontZone === true || seat.y <= 46)).length;
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



/* DRAGONSWOOD ROOM BUILDER V2.3
   Physical furniture and student assignment are deliberately separate:
   Edit Room moves desks. Assign Students moves names. */
Object.assign(state, {
  roomMode: 'assign',
  roomName: state.layout === 'evans' ? 'Evans Room' : 'Current Room',
  selectedDeskIds: [],
  snapRoomGrid: true,
  referenceVisible: false,
  roomDirty: false
});

const roomBuilderClone = value => JSON.parse(JSON.stringify(value));
const currentRoomSeats = () => state.seats.map(seat => ({
  id: seat.id,
  x: Number(seat.x),
  y: Number(seat.y),
  group: seat.group || 'Custom',
  rotation: Number(seat.rotation || 0),
  frontZone: Boolean(seat.frontZone),
  doorZone: Boolean(seat.doorZone)
}));

function syncPlanGeometryFromSeats() {
  const studentsBySeat = new Map(state.plan.map(seat => [seat.id, seat.studentId || null]));
  state.plan = state.seats.map(seat => ({ ...roomBuilderClone(seat), studentId: studentsBySeat.get(seat.id) || null }));
  state.previewPlan = null;
  state.candidates = [];
}

function installRoomBuilderUi() {
  const roomPanel = document.querySelector('.room-panel');
  const heading = roomPanel?.querySelector('.room-heading-row');
  const toolbar = roomPanel?.querySelector('.room-toolbar');
  const stage = document.getElementById('roomStage');
  if (!roomPanel || !heading || !toolbar || !stage || document.getElementById('roomModeBar')) return;

  const mode = document.createElement('div');
  mode.id = 'roomModeBar';
  mode.className = 'room-mode-bar';
  mode.innerHTML = `
    <div class="room-mode-switch" role="group" aria-label="Seating Command mode">
      <button class="room-mode-button active" type="button" data-room-mode="assign">👥 Assign Students</button>
      <button class="room-mode-button" type="button" data-room-mode="build">🛠 Edit Room</button>
    </div>
    <div class="room-name-chip"><span>ROOM</span><strong id="roomNameLabel">${escapeHtml(state.roomName)}</strong></div>`;
  heading.insertAdjacentElement('afterend', mode);

  const layoutSelector = document.getElementById('layoutSelector');
  if (layoutSelector && !layoutSelector.querySelector('[data-layout="evans"]')) {
    layoutSelector.insertAdjacentHTML('afterbegin', '<button class="segment" type="button" data-layout="evans">⭐ Evans Room</button>');
  }

  const builder = document.createElement('div');
  builder.id = 'roomBuilderToolbar';
  builder.className = 'room-builder-toolbar';
  builder.hidden = true;
  builder.innerHTML = `
    <div class="builder-tool-group">
      <button class="button compact secondary" id="useEvansRoomButton" type="button">⭐ Use My Classroom</button>
      <button class="button compact quiet" id="addDeskButton" type="button">＋ Desk</button>
      <button class="button compact quiet" id="duplicateDeskButton" type="button">Duplicate</button>
      <button class="button compact quiet" id="rotateDeskButton" type="button">↻ Rotate</button>
      <button class="button compact quiet" id="deleteDeskButton" type="button">Delete</button>
    </div>
    <div class="builder-tool-group">
      <button class="button compact quiet" id="alignDeskHButton" type="button">Align Row</button>
      <button class="button compact quiet" id="alignDeskVButton" type="button">Align Column</button>
      <button class="button compact quiet" id="spaceDeskHButton" type="button">Space ↔</button>
      <button class="button compact quiet" id="spaceDeskVButton" type="button">Space ↕</button>
    </div>
    <div class="builder-tool-group builder-options">
      <label><input id="snapRoomGridToggle" type="checkbox" checked> Snap</label>
      <button class="button compact quiet" id="referenceToggleButton" type="button">Reference</button>
      <label class="reference-opacity">Opacity <input id="referenceOpacity" type="range" min="15" max="85" value="42"></label>
      <button class="button compact primary" id="saveRoomButton" type="button">Save Room</button>
    </div>`;
  toolbar.insertAdjacentElement('afterend', builder);

  const reference = document.createElement('img');
  reference.id = 'roomReferenceOverlay';
  reference.className = 'room-reference-overlay';
  reference.src = 'assets/evans-room-reference.png';
  reference.alt = '';
  reference.hidden = true;
  stage.prepend(reference);

  const fixtures = document.createElement('div');
  fixtures.id = 'roomFixtureLayer';
  fixtures.className = 'room-fixture-layer';
  fixtures.setAttribute('aria-hidden', 'true');
  fixtures.innerHTML = `
    <div class="room-fixture backpack-hooks">BACKPACK HOOKS</div>
    <div class="room-fixture cubbies cubbies-4">4TH GRADE CUBBIES</div>
    <div class="room-fixture bookshelf">BOOK SHELF</div>
    <div class="room-fixture cubbies cubbies-5">5TH GRADE CUBBIES</div>
    <div class="room-fixture cow">COW</div>
    <div class="room-fixture screen">SCREEN</div>
    <div class="room-fixture actual-door">DOOR</div>
    <div class="room-fixture actual-teacher-desk">TEACHER DESK</div>
    <div class="room-fixture station station-1">STATION 1</div>
    <div class="room-fixture station station-2">STATION 2</div>`;
  stage.prepend(fixtures);

  document.querySelectorAll('[data-room-mode]').forEach(button => button.addEventListener('click', () => setRoomMode(button.dataset.roomMode)));
  document.getElementById('useEvansRoomButton').addEventListener('click', useEvansRoom);
  document.getElementById('addDeskButton').addEventListener('click', addRoomDesk);
  document.getElementById('duplicateDeskButton').addEventListener('click', duplicateRoomDesk);
  document.getElementById('rotateDeskButton').addEventListener('click', rotateRoomDesks);
  document.getElementById('deleteDeskButton').addEventListener('click', deleteRoomDesks);
  document.getElementById('alignDeskHButton').addEventListener('click', () => alignRoomDesks('row'));
  document.getElementById('alignDeskVButton').addEventListener('click', () => alignRoomDesks('column'));
  document.getElementById('spaceDeskHButton').addEventListener('click', () => spaceRoomDesks('x'));
  document.getElementById('spaceDeskVButton').addEventListener('click', () => spaceRoomDesks('y'));
  document.getElementById('snapRoomGridToggle').addEventListener('change', event => { state.snapRoomGrid = event.target.checked; });
  document.getElementById('referenceToggleButton').addEventListener('click', toggleRoomReference);
  document.getElementById('referenceOpacity').addEventListener('input', event => {
    reference.style.opacity = String(Number(event.target.value) / 100);
  });
  document.getElementById('saveRoomButton').addEventListener('click', saveRoomLayout);
}

function setRoomMode(mode) {
  state.roomMode = mode === 'build' ? 'build' : 'assign';
  state.selectedDeskIds = [];
  state.previewPlan = null;
  document.querySelectorAll('[data-room-mode]').forEach(button => button.classList.toggle('active', button.dataset.roomMode === state.roomMode));
  const builderToolbar = document.getElementById('roomBuilderToolbar');
  if (builderToolbar) builderToolbar.hidden = state.roomMode !== 'build';
  const roomPanel = document.querySelector('.room-panel');
  roomPanel?.classList.toggle('room-builder-active', state.roomMode === 'build');
  renderRoom();
  showToast(state.roomMode === 'build' ? 'Room Builder: move physical desks. Student assignments stay attached to desk IDs.' : 'Assign Students: furniture is locked. Move names between desks.');
}

function renderRoomBuilder() {
  const layer = document.getElementById('seatLayer');
  const stage = document.getElementById('roomStage');
  if (!layer || !stage) return;
  stage.classList.toggle('evans-room', state.layout === 'evans');
  stage.classList.remove('flipped');
  const selected = new Set(state.selectedDeskIds);
  layer.innerHTML = state.plan.map(seat => {
    const student = studentById(seat.studentId);
    const label = student ? escapeHtml(student.name) : 'Open desk';
    const selectedClass = selected.has(seat.id) ? ' selected' : '';
    return `<button class="desk-object${selectedClass}" type="button" data-desk-id="${seat.id}" style="left:${seat.x}%;top:${seat.y}%;--desk-rotation:${Number(seat.rotation || 0)}deg" aria-label="${label}">
      <span class="desk-surface"><span class="desk-number">${escapeHtml(seat.id.replace('seat-', '#'))}</span><strong>${label}</strong></span><span class="desk-chair" aria-hidden="true"></span>
    </button>`;
  }).join('');
  bindRoomDeskInteractions(layer);
  const center = document.querySelector('.room-center-label');
  if (center) center.textContent = 'ROOM BUILDER • drag desks • Shift+click selects several';
  updateRoomBuilderUi();
}

function updateRoomBuilderUi() {
  const roomLabel = document.getElementById('roomNameLabel');
  if (roomLabel) roomLabel.textContent = state.roomName + (state.roomDirty ? ' • Unsaved' : '');
  const stage = document.getElementById('roomStage');
  stage?.classList.toggle('evans-room', state.layout === 'evans');
  const reference = document.getElementById('roomReferenceOverlay');
  if (reference) reference.hidden = !state.referenceVisible || state.roomMode !== 'build';
  document.querySelectorAll('[data-room-mode]').forEach(button => button.classList.toggle('active', button.dataset.roomMode === state.roomMode));
  const builderToolbar = document.getElementById('roomBuilderToolbar');
  if (builderToolbar) builderToolbar.hidden = state.roomMode !== 'build';
  document.querySelector('.room-panel')?.classList.toggle('room-builder-active', state.roomMode === 'build');
}

function bindRoomDeskInteractions(layer) {
  layer.querySelectorAll('.desk-object').forEach(desk => {
    desk.addEventListener('click', event => {
      event.preventDefault();
      const id = desk.dataset.deskId;
      if (event.shiftKey) {
        state.selectedDeskIds = state.selectedDeskIds.includes(id)
          ? state.selectedDeskIds.filter(item => item !== id)
          : [...state.selectedDeskIds, id];
      } else if (!state.selectedDeskIds.includes(id)) {
        state.selectedDeskIds = [id];
      }
      renderRoomBuilder();
    });
    desk.addEventListener('pointerdown', beginDeskDrag);
  });
}

function beginDeskDrag(event) {
  if (state.roomMode !== 'build') return;
  event.preventDefault();
  const id = event.currentTarget.dataset.deskId;
  if (!state.selectedDeskIds.includes(id)) state.selectedDeskIds = [id];
  const stage = document.getElementById('roomStage');
  const rect = stage.getBoundingClientRect();
  const start = { x: event.clientX, y: event.clientY };
  const originals = new Map(state.selectedDeskIds.map(seatId => {
    const seat = state.plan.find(item => item.id === seatId);
    return [seatId, { x: Number(seat.x), y: Number(seat.y) }];
  }));
  let moved = false;

  const onMove = moveEvent => {
    const dx = ((moveEvent.clientX - start.x) / rect.width) * 100;
    const dy = ((moveEvent.clientY - start.y) / rect.height) * 100;
    if (Math.abs(dx) + Math.abs(dy) > 0.25) moved = true;
    for (const seatId of state.selectedDeskIds) {
      const original = originals.get(seatId);
      const seat = state.plan.find(item => item.id === seatId);
      const geometry = state.seats.find(item => item.id === seatId);
      if (!original || !seat || !geometry) continue;
      let x = Math.max(7, Math.min(93, original.x + dx));
      let y = Math.max(8, Math.min(92, original.y + dy));
      if (state.snapRoomGrid) { x = Math.round(x / 2) * 2; y = Math.round(y / 2) * 2; }
      seat.x = geometry.x = x;
      seat.y = geometry.y = y;
      // Custom placement makes zones explicit from physical position.
      seat.frontZone = geometry.frontZone = y >= 70;
      seat.doorZone = geometry.doorZone = x <= 35;
    }
    if (moved) state.roomDirty = true;
    renderRoomBuilder();
  };
  const onUp = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    if (moved) {
      state.candidates = [];
      state.previewPlan = null;
      renderRoster();
      renderMetricsAndInsights();
    }
  };
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp, { once: true });
}

function nextDeskId() {
  const used = new Set(state.seats.map(seat => seat.id));
  let index = 1;
  while (used.has(`seat-${index}`)) index += 1;
  return `seat-${index}`;
}

function addRoomDesk() {
  snapshot();
  const id = nextDeskId();
  const desk = { id, x: 50, y: 50, group: 'Custom', rotation: 0, frontZone: false, doorZone: false };
  state.seats.push(roomBuilderClone(desk));
  state.plan.push({ ...roomBuilderClone(desk), studentId: null });
  state.selectedDeskIds = [id];
  state.roomDirty = true;
  renderAll();
}

function duplicateRoomDesk() {
  const source = state.plan.find(seat => seat.id === state.selectedDeskIds[0]);
  if (!source) { showToast('Select a desk first.'); return; }
  snapshot();
  const id = nextDeskId();
  const desk = { ...roomBuilderClone(source), id, x: Math.min(93, Number(source.x) + 4), y: Math.min(92, Number(source.y) + 4), studentId: null };
  const { studentId, ...geometry } = desk;
  state.seats.push(geometry);
  state.plan.push(desk);
  state.selectedDeskIds = [id];
  state.roomDirty = true;
  renderAll();
}

function rotateRoomDesks() {
  if (!state.selectedDeskIds.length) { showToast('Select one or more desks first.'); return; }
  snapshot();
  for (const id of state.selectedDeskIds) {
    const seat = state.plan.find(item => item.id === id);
    const geometry = state.seats.find(item => item.id === id);
    if (!seat || !geometry) continue;
    const rotation = (Number(seat.rotation || 0) + 90) % 360;
    seat.rotation = geometry.rotation = rotation;
  }
  state.roomDirty = true;
  renderAll();
}

function deleteRoomDesks() {
  if (!state.selectedDeskIds.length) { showToast('Select an empty desk first.'); return; }
  const occupied = state.plan.filter(seat => state.selectedDeskIds.includes(seat.id) && seat.studentId);
  if (occupied.length) { showToast('Move the student off that desk before deleting the furniture.'); return; }
  snapshot();
  const remove = new Set(state.selectedDeskIds);
  state.seats = state.seats.filter(seat => !remove.has(seat.id));
  state.plan = state.plan.filter(seat => !remove.has(seat.id));
  state.rules = state.rules.filter(rule => !(rule.type === 'lock' && remove.has(rule.seatId)));
  state.selectedDeskIds = [];
  state.roomDirty = true;
  renderAll();
}

function selectedRoomSeats() {
  return state.selectedDeskIds.map(id => state.plan.find(seat => seat.id === id)).filter(Boolean);
}

function applySeatCoordinates(id, x, y) {
  const seat = state.plan.find(item => item.id === id);
  const geometry = state.seats.find(item => item.id === id);
  if (!seat || !geometry) return;
  seat.x = geometry.x = x;
  seat.y = geometry.y = y;
  seat.frontZone = geometry.frontZone = y >= 70;
  seat.doorZone = geometry.doorZone = x <= 35;
}

function alignRoomDesks(axis) {
  const seats = selectedRoomSeats();
  if (seats.length < 2) { showToast('Select at least two desks with Shift+click.'); return; }
  snapshot();
  if (axis === 'row') {
    const y = seats.reduce((sum, seat) => sum + Number(seat.y), 0) / seats.length;
    seats.forEach(seat => applySeatCoordinates(seat.id, Number(seat.x), Math.round(y * 2) / 2));
  } else {
    const x = seats.reduce((sum, seat) => sum + Number(seat.x), 0) / seats.length;
    seats.forEach(seat => applySeatCoordinates(seat.id, Math.round(x * 2) / 2, Number(seat.y)));
  }
  state.roomDirty = true;
  renderAll();
}

function spaceRoomDesks(axis) {
  const seats = selectedRoomSeats();
  if (seats.length < 3) { showToast('Select at least three desks to space them evenly.'); return; }
  snapshot();
  const key = axis === 'x' ? 'x' : 'y';
  const sorted = seats.slice().sort((a, b) => Number(a[key]) - Number(b[key]));
  const min = Number(sorted[0][key]);
  const max = Number(sorted[sorted.length - 1][key]);
  const step = (max - min) / (sorted.length - 1);
  sorted.forEach((seat, index) => {
    const value = min + step * index;
    applySeatCoordinates(seat.id, axis === 'x' ? value : Number(seat.x), axis === 'y' ? value : Number(seat.y));
  });
  state.roomDirty = true;
  renderAll();
}

function useEvansRoom() {
  const occupied = state.plan.map(seat => seat.studentId).filter(Boolean);
  snapshot();
  state.layout = 'evans';
  state.roomName = 'Evans Room';
  state.seats = seatGeometry('evans', 24);
  state.plan = state.seats.map((seat, index) => ({ ...roomBuilderClone(seat), studentId: occupied[index] || null }));
  state.rules = state.rules.filter(rule => rule.type !== 'lock');
  state.selectedDeskIds = [];
  state.roomDirty = true;
  state.candidates = [];
  state.previewPlan = null;
  renderAll();
  showToast('Evans Room loaded from your classroom floor plan. Student names were preserved in order.');
}

function toggleRoomReference() {
  state.referenceVisible = !state.referenceVisible;
  updateRoomBuilderUi();
  const button = document.getElementById('referenceToggleButton');
  if (button) button.textContent = state.referenceVisible ? 'Hide Reference' : 'Reference';
}

async function saveRoomLayout() {
  if (state.roomMode !== 'build') return;
  const payload = {
    roomName: state.roomName,
    roomLayout: currentRoomSeats(),
    layout: state.layout,
    roomUpdatedAt: typeof serverTimestamp === 'function' ? serverTimestamp() : new Date().toISOString()
  };
  try {
    if (typeof db !== 'undefined') {
      await setDoc(doc(db, 'classrooms', CLASSROOM_ID, 'seatingPlans', 'current'), payload, { merge: true });
    } else {
      const key = typeof STORAGE_KEY !== 'undefined' ? STORAGE_KEY : 'dragonswood-seating-command-v1';
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      localStorage.setItem(key, JSON.stringify({ ...saved, ...payload, roomUpdatedAt: new Date().toISOString() }));
    }
    state.roomDirty = false;
    updateRoomBuilderUi();
    showToast('Physical room layout saved. Smart Arrange will move students, not desks.');
  } catch (error) {
    console.error('Room layout save failed', error);
    showToast('Room layout could not be saved. Your unsaved desk positions are still on screen.');
  }
}

// Preserve custom furniture in Undo instead of regenerating a preset room.
snapshot = function roomBuilderSnapshot() {
  state.history.push({
    plan: roomBuilderClone(state.plan),
    seats: roomBuilderClone(state.seats),
    layout: state.layout,
    rules: roomBuilderClone(state.rules),
    roomName: state.roomName,
    roomDirty: state.roomDirty
  });
  if (state.history.length > 20) state.history.shift();
};

undo = function roomBuilderUndo() {
  const prior = state.history.pop();
  if (!prior) { showToast('Nothing to undo yet.'); return; }
  state.layout = prior.layout;
  state.seats = roomBuilderClone(prior.seats || prior.plan.map(({ studentId, ...seat }) => seat));
  state.plan = roomBuilderClone(prior.plan);
  state.rules = roomBuilderClone(prior.rules);
  state.roomName = prior.roomName || state.roomName;
  state.roomDirty = Boolean(prior.roomDirty);
  state.candidates = [];
  state.previewPlan = null;
  state.selectedSeatId = null;
  state.selectedDeskIds = [];
  renderAll();
  showToast('Last seating or room change undone.');
};

const roomBuilderBaseRenderRoom = renderRoom;
renderRoom = function roomBuilderAwareRenderRoom() {
  const stage = document.getElementById('roomStage');
  stage?.classList.toggle('evans-room', state.layout === 'evans');
  if (state.roomMode === 'build') {
    renderRoomBuilder();
    renderStudentRoom();
    renderMetricsAndInsights();
    return;
  }
  roomBuilderBaseRenderRoom();
  const center = document.querySelector('.room-center-label');
  if (center) center.textContent = 'Drag a student, or click two seats to swap';
  updateRoomBuilderUi();
};

const roomBuilderBaseRenderStudentRoom = renderStudentRoom;
renderStudentRoom = function roomBuilderAwareStudentRoom() {
  roomBuilderBaseRenderStudentRoom();
  document.getElementById('studentRoom')?.classList.toggle('evans-room', state.layout === 'evans');
};

const roomBuilderBaseRenderAll = renderAll;
renderAll = function roomBuilderAwareRenderAll() {
  roomBuilderBaseRenderAll();
  updateRoomBuilderUi();
};

const roomBuilderBaseChangeLayout = changeLayout;
changeLayout = function roomBuilderAwareChangeLayout(layout) {
  state.roomMode = 'assign';
  state.roomName = layout === 'evans' ? 'Evans Room' : ({ pods: 'Pods', trios: 'Groups of 3', rows: 'Focus Rows', horseshoe: 'Horseshoe' }[layout] || 'Custom Room');
  state.roomDirty = true;
  roomBuilderBaseChangeLayout(layout);
};

const roomBuilderBaseLoadState = loadState;
loadState = async function roomBuilderAwareLoadState() {
  const result = await roomBuilderBaseLoadState();
  try {
    let roomData = null;
    if (typeof db !== 'undefined') {
      const savedRoomDoc = await getDoc(doc(db, 'classrooms', CLASSROOM_ID, 'seatingPlans', 'current'));
      roomData = savedRoomDoc.exists() ? savedRoomDoc.data() : null;
    } else {
      const key = typeof STORAGE_KEY !== 'undefined' ? STORAGE_KEY : 'dragonswood-seating-command-v1';
      roomData = JSON.parse(localStorage.getItem(key) || 'null');
    }
    if (Array.isArray(roomData?.roomLayout) && roomData.roomLayout.length) {
      const existingStudents = new Map(state.plan.map(seat => [seat.id, seat.studentId || null]));
      state.seats = roomData.roomLayout.map(seat => ({ ...roomBuilderClone(seat), rotation: Number(seat.rotation || 0) }));
      state.plan = state.seats.map(seat => ({ ...roomBuilderClone(seat), studentId: existingStudents.get(seat.id) || null }));
      state.roomName = roomData.roomName || (roomData.layout === 'evans' ? 'Evans Room' : 'Saved Room');
      state.layout = roomData.layout || state.layout;
    } else {
      // First Room Builder load: use the teacher's actual 24-desk classroom by default.
      // Preserve the current student ordering while changing only physical geometry.
      const currentAssignments = state.plan.map(seat => seat.studentId).filter(Boolean);
      state.layout = 'evans';
      state.roomName = 'Evans Room';
      state.seats = seatGeometry('evans', 24);
      state.plan = state.seats.map((seat, index) => ({ ...roomBuilderClone(seat), studentId: currentAssignments[index] || null }));
      state.rules = state.rules.filter(rule => rule.type !== 'lock');
      state.roomDirty = true;
    }
  } catch (error) {
    console.warn('Room Builder could not load saved furniture; using the seating plan geometry.', error);
  }
  return result;
};

// Install UI before ordinary bindings so the new controls are first-class parts of Seating Command.
initialize = async function roomBuilderInitialize() {
  await loadState();
  installRoomBuilderUi();
  bindEvents();
  renderAll();
};

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
