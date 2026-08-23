(function(global){
  "use strict";

  const number = value => Number.isFinite(Number(value)) ? Number(value) : null;
  const clamp = value => Math.max(0, Math.min(100, Number(value) || 0));
  const timestampMs = row => {
    const value = row?.createdAt ?? row?.updatedAt ?? row?.submittedAt ?? row?.timestamp;
    if (value?.toMillis) return value.toMillis();
    if (Number.isFinite(value?.seconds)) return value.seconds * 1000;
    const parsed = Date.parse(value || "");
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const accuracy = row => {
    const direct = number(row?.teacherScore ?? row?.accuracy ?? row?.percent);
    if (direct !== null) return clamp(direct);
    const correct = number(row?.questionsCorrect ?? row?.correct);
    const total = number(row?.questionsSeen ?? row?.total ?? row?.attempts);
    return correct !== null && total > 0 ? clamp(Math.round(correct / total * 100)) : null;
  };

  function attemptGrade(rows){
    const ordered = (rows || []).map(row => ({row, score:accuracy(row)}))
      .filter(entry => entry.score !== null)
      .sort((a,b) => timestampMs(a.row) - timestampMs(b.row));
    if (!ordered.length) return null;
    const first = ordered[0].score;
    const best = Math.max(...ordered.map(entry => entry.score));
    return {first, best, score:Math.round((first + best) / 2), attempts:ordered.length};
  }

  function phoenixDayKey(date = new Date()){
    return new Intl.DateTimeFormat("en-CA", {timeZone:"America/Phoenix",year:"numeric",month:"2-digit",day:"2-digit"}).format(date);
  }
  function phoenixWeekKey(date = new Date()){
    const [year,month,day] = phoenixDayKey(date).split("-").map(Number);
    const utc = new Date(Date.UTC(year, month - 1, day));
    const mondayOffset = (utc.getUTCDay() + 6) % 7;
    utc.setUTCDate(utc.getUTCDate() - mondayOffset);
    return `${utc.getUTCFullYear()}-${String(utc.getUTCMonth()+1).padStart(2,"0")}-${String(utc.getUTCDate()).padStart(2,"0")}`;
  }
  function isActuallyMissing(assignment, override, today = phoenixDayKey()){
    if (!assignment || assignment.hidden || assignment.countsTowardGrade === false) return false;
    if (override?.status === "Excused") return false;
    const assigned = assignment.assigned === true || (Array.isArray(assignment.assignedStudentIds) && assignment.assignedStudentIds.length > 0) || (Array.isArray(assignment.assignedGrades) && assignment.assignedGrades.length > 0) || (Array.isArray(assignment.assignedGroups) && assignment.assignedGroups.length > 0);
    return assigned && !!assignment.dueDate && assignment.dueDate < today;
  }
  function letter(score){ return score == null ? "—" : score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F"; }

  global.DWGradebook = Object.freeze({accuracy, attemptGrade, phoenixDayKey, phoenixWeekKey, isActuallyMissing, letter});
})(window);
