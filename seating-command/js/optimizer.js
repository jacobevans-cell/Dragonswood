const clone = value => JSON.parse(JSON.stringify(value));

export function seatGeometry(layout, count = 24) {
  const seats = [];
  const add = (x, y, group) => seats.push({ id: `seat-${seats.length + 1}`, x, y, group });

  if (layout === 'evans') {
    // Physical Evans classroom: three banks, four desk columns, two desks per pair.
    // Front of room is at the BOTTOM, matching the teacher-provided floor plan.
    const xs = [25, 40, 55, 70];
    const pairs = [[25, 34], [52, 61], [78, 87]];
    let pair = 1;
    pairs.forEach((ys, bankIndex) => {
      xs.forEach((x, colIndex) => {
        ys.forEach(y => {
          add(x, y, `Pair ${pair}`);
          const seat = seats[seats.length - 1];
          seat.rotation = 0;
          seat.frontZone = bankIndex === 2;
          seat.doorZone = colIndex === 0;
        });
        pair += 1;
      });
    });
  } else if (layout === 'rows') {
    const xs = [20, 32, 44, 56, 68, 80];
    const ys = [28, 44, 60, 76];
    ys.forEach((y, row) => xs.forEach(x => add(x, y, `R${row + 1}`)));
  } else if (layout === 'trios') {
    const centers = [[22, 31], [42, 31], [62, 31], [82, 31], [22, 66], [42, 66], [62, 66], [82, 66]];
    const offsets = [[-4.8, -4], [4.8, -4], [0, 5.4]];
    centers.forEach((center, index) => offsets.forEach(([dx, dy]) => add(center[0] + dx, center[1] + dy, `T${index + 1}`)));
  } else if (layout === 'horseshoe') {
    const top = [20, 30, 40, 50, 60, 70, 80];
    top.forEach(x => add(x, 27, 'U-top'));
    [37, 49, 61, 73].forEach(y => add(17, y, 'U-left'));
    [37, 49, 61, 73].forEach(y => add(83, y, 'U-right'));
    [25, 36, 47, 58, 69, 80].forEach(x => add(x, 80, 'U-bottom'));
    [[35, 50], [50, 50], [65, 50]].forEach(([x, y], i) => add(x, y, `U-island-${i + 1}`));
  } else {
    const centers = [[26, 34], [50, 34], [74, 34], [26, 69], [50, 69], [74, 69]];
    const offsets = [[-5.5, -5], [5.5, -5], [-5.5, 5], [5.5, 5]];
    centers.forEach((center, index) => offsets.forEach(([dx, dy]) => add(center[0] + dx, center[1] + dy, `P${index + 1}`)));
  }

  return seats.slice(0, count);
}

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function assignmentMap(plan) {
  const map = new Map();
  plan.forEach(item => { if (item.studentId) map.set(item.studentId, item); });
  return map;
}

function isNear(a, b) {
  if (!a || !b) return false;
  return distance(a, b) < 14;
}

export function evaluatePlan(plan, students, rules, previousPlan = null) {
  const byStudent = assignmentMap(plan);
  const studentById = new Map(students.map(s => [s.id, s]));
  let raw = 1000;
  let hardConflicts = 0;
  let softMisses = 0;
  const reasons = [];
  const hasExplicitDoorZone = plan.some(seat => seat.doorZone === true);

  for (const rule of rules) {
    const a = byStudent.get(rule.a);
    const b = rule.b ? byStudent.get(rule.b) : null;
    let satisfied = true;
    if (rule.type === 'apart') satisfied = !isNear(a, b);
    if (rule.type === 'together') satisfied = isNear(a, b);
    if (rule.type === 'front') satisfied = Boolean(a && (a.frontZone === true || a.y <= 46));
    if (rule.type === 'door') satisfied = Boolean(a && (a.doorZone === true || (!hasExplicitDoorZone && a.x >= 64)));
    if (rule.type === 'lock') satisfied = Boolean(a && a.id === rule.seatId);

    if (!satisfied) {
      if (rule.priority === 'hard') { raw -= 420; hardConflicts += 1; }
      else { raw -= 65; softMisses += 1; }
    } else {
      raw += rule.priority === 'hard' ? 12 : 7;
    }
  }

  const groups = new Map();
  plan.forEach(seat => {
    if (!seat.studentId) return;
    if (!groups.has(seat.group)) groups.set(seat.group, []);
    groups.get(seat.group).push(studentById.get(seat.studentId));
  });
  let mixedGroups = 0;
  let eligibleGroups = 0;
  groups.forEach(group => {
    if (group.length < 2) return;
    eligibleGroups += 1;
    const grades = new Set(group.filter(Boolean).map(s => s.grade));
    if (grades.size > 1) { mixedGroups += 1; raw += 8; }
  });

  const previous = previousPlan ? assignmentMap(previousPlan) : null;
  let fresh = 0;
  let compared = 0;
  if (previous) {
    for (const seat of plan) {
      if (!seat.studentId) continue;
      const priorSeat = previous.get(seat.studentId);
      if (!priorSeat) continue;
      compared += 1;
      const currentNeighbors = plan.filter(other => other.studentId && other.studentId !== seat.studentId && isNear(seat, other)).map(other => other.studentId);
      const priorNeighbors = previousPlan.filter(other => other.studentId && other.studentId !== seat.studentId && isNear(priorSeat, other)).map(other => other.studentId);
      const changed = currentNeighbors.some(id => !priorNeighbors.includes(id));
      if (changed) { fresh += 1; raw += 2; }
      else raw -= 4;
    }
  }

  const hardSatisfied = Math.max(0, rules.filter(r => r.priority === 'hard').length - hardConflicts);
  const hardTotal = rules.filter(r => r.priority === 'hard').length;
  const score = Math.max(0, Math.min(100, Math.round(75 + (raw - 1000) / 10)));
  const freshPercent = compared ? Math.round((fresh / compared) * 100) : 100;
  const mixedText = eligibleGroups ? `${mixedGroups}/${eligibleGroups} table groups mix grade levels` : 'Layout does not use table groups';

  reasons.push(hardTotal ? `${hardSatisfied}/${hardTotal} hard rules satisfied` : 'No hard-rule conflicts');
  reasons.push(mixedText);
  reasons.push(`${freshPercent}% of scholars gain a fresh nearby peer`);
  if (softMisses === 0) reasons.push('All seating preferences satisfied');
  else reasons.push(`${softMisses} soft preference${softMisses === 1 ? '' : 's'} traded off`);

  return { raw, score, hardConflicts, softMisses, freshPercent, mixedGroups, eligibleGroups, reasons };
}

function randomPermutation(items) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildCandidate(seats, students, rules, lockedAssignments) {
  const plan = clone(seats).map(seat => ({ ...seat, studentId: null }));
  const usedStudents = new Set();
  const usedSeats = new Set();

  for (const lock of lockedAssignments) {
    const seat = plan.find(item => item.id === lock.seatId);
    if (seat && students.some(student => student.id === lock.studentId)) {
      seat.studentId = lock.studentId;
      usedStudents.add(lock.studentId);
      usedSeats.add(lock.seatId);
    }
  }

  const remainingStudents = randomPermutation(students.filter(student => !usedStudents.has(student.id)));
  const remainingSeats = plan.filter(seat => !usedSeats.has(seat.id));
  remainingSeats.forEach((seat, index) => { seat.studentId = remainingStudents[index]?.id ?? null; });
  return plan;
}

export function generateCandidates(seats, students, rules, currentPlan, previousPlan, iterations = 1800) {
  const lockRules = rules.filter(rule => rule.type === 'lock' && rule.seatId).map(rule => ({ studentId: rule.a, seatId: rule.seatId }));
  const best = [];
  const signatures = new Set();

  const consider = plan => {
    const evaluation = evaluatePlan(plan, students, rules, previousPlan);
    const signature = plan.map(seat => seat.studentId ?? '-').join('|');
    if (signatures.has(signature)) return;
    signatures.add(signature);
    best.push({ plan, evaluation });
    best.sort((a, b) => b.evaluation.raw - a.evaluation.raw);
    if (best.length > 3) best.pop();
  };

  if (currentPlan?.length) consider(clone(currentPlan));
  for (let i = 0; i < iterations; i += 1) consider(buildCandidate(seats, students, rules, lockRules));

  return best.map((candidate, index) => ({ ...candidate, rank: index + 1 }));
}

export function quickShuffle(seats, students, rules) {
  const best = generateCandidates(seats, students, rules, null, null, 180);
  return best[0]?.plan || buildCandidate(seats, students, rules, rules.filter(rule => rule.type === 'lock' && rule.seatId).map(rule => ({ studentId: rule.a, seatId: rule.seatId })));
}

export function nearbyStudents(plan, seat) {
  return plan.filter(other => other.studentId && other.studentId !== seat.studentId && isNear(seat, other));
}
