// Student-facing projections of the server's frozen assessment contract.
// This module never decides correctness, changes points, or invents rubric rules.
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export function points(value) {
  if (value && typeof value === 'object') {
    const { numerator, denominator } = value;
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return '—';
    let d = denominator;
    while (d % 2 === 0) d /= 2;
    while (d % 5 === 0) d /= 5;
    return d === 1 ? String(numerator / denominator) : `${numerator}/${denominator}`;
  }
  return Number.isFinite(value) ? String(Math.round(value * 1000) / 1000) : '—';
}
export const objectiveComponents = (contract) => contract?.components?.filter((c) => c.kind === 'objective') || [];
export const questionComponent = (contract, qid) => objectiveComponents(contract).find((c) => c.questionId === qid);
export function questionsReady(contract, questions = {}) {
  return objectiveComponents(contract).every((c) => questions[c.questionId]?.finalized === true);
}
export function questionControlLocked(progress, { videoLocked = false, conflict = false, busy = false, recovery = false } = {}) {
  return videoLocked || conflict || busy || !!progress?.finalized || (recovery ? progress?.stage !== 'recovery' : progress?.stage === 'recovery');
}
export function questionAnswer(component, draftAnswer, progress, recoveryAnswer) {
  if (!component || progress?.finalized) throw new Error('This question is already checked or its scoring rule is unavailable.');
  if (progress?.stage === 'recovery') {
    if (!progress.recoveryChoices?.some((choice) => choice.id === recoveryAnswer)) throw new Error('Choose your final recovery answer first.');
    return { stage: 'recovery', answer: recoveryAnswer };
  }
  if (component.responseType === 'choiceId') {
    const choice = Number.isInteger(draftAnswer) && component.choices?.[draftAnswer];
    if (!choice) throw new Error('Choose an answer first.');
    return { stage: 'independent', answer: choice.id };
  }
  if (draftAnswer === undefined || draftAnswer === null || !String(draftAnswer).trim()) throw new Error('Write your answer first. A blank answer does not use an attempt.');
  return { stage: 'independent', answer: String(draftAnswer) };
}
export function publicRubric(contract) {
  if (!contract) return '';
  const objectives = objectiveComponents(contract);
  const plan = contract.assignment === 'writing' && contract.day === 30;
  return `<details class="assessment-rubric"><summary>How today’s work is scored · ${points(contract.maxPoints)} points${plan ? ' · Your plan' : ''}</summary><p><strong>Full credit is ${points(contract.maxPoints)} out of ${points(contract.maxPoints)}.</strong> The requirements below are the ones used to check this work.</p>${plan ? '<p>Today we assess your opinion essay <strong>plan</strong>. The essay draft is optional today. The essay’s paragraph and sentence requirements do not apply to the planning boxes.</p>' : ''}${objectives.length ? `<h3>Question points</h3><ul>${objectives.map((c, i) => `<li>Question ${i + 1}: <strong>${points(c.allocation)} point${points(c.allocation) === '1' ? '' : 's'}</strong>. ${c.recoveryEligibility ? 'Up to three independent answers. A correct independent answer earns full question credit. After three incorrect answers, one final recovery choice can earn half credit.' : 'One confirmed answer. A correct answer earns full question credit; an incorrect answer earns zero.'}</li>`).join('')}</ul><p class="small muted">Blank answers, format clarification, and connection problems do not use academic attempts. A finalized question stays checked, even when it earns zero points.</p>` : ''}${contract.studentRubric?.length ? `<h3>${plan ? 'Your plan’s requirements' : 'Written-work requirements'}</h3>${contract.studentRubric.map((r) => `<div class="notice"><strong>${esc(r.requirement)} · ${points(r.allocation || r.maxPoints)} points</strong><p><strong>Full credit:</strong> ${esc(r.fullCredit)}</p>${r.partialCredit ? `<p><strong>Half credit:</strong> ${esc(r.partialCredit)}</p>` : ''}<p class="small muted"><strong>Zero credit:</strong> ${esc(r.zeroCredit)}</p></div>`).join('')}<p class="small muted">You can revise the written work. Your grade keeps your highest complete result for this assignment; requirements from separate submissions are not combined.</p>` : ''}<h3>Ready to submit</h3><ul>${(contract.readiness?.rules || []).map((rule) => `<li>${esc(rule)}</li>`).join('')}</ul></details>`;
}
export function questionAssessment({ assignment, component, progress = {}, pending = false, busy = false, message = '', recoveryAnswer = '' }) {
  if (!component) return '';
  const qid = component.questionId;
  const maximum = points(component.allocation || component.maxPoints);
  const common = `data-id="${esc(assignment)}" data-qid="${esc(qid)}"`;
  if (progress.finalized) return `<div class="question-result ${progress.correct ? '' : 'wrong'}" role="status"><strong>✓ Question complete · ${points(progress.earned)} / ${maximum} points</strong>${progress.checkedAnswer !== undefined || progress.assisted ? `<p><strong>${progress.assisted ? 'Your saved recovery choice' : 'Your saved answer'}:</strong> ${esc(progress.checkedAnswer ?? progress.recoveryChoices?.find((c) => c.id === progress.lastAnswer)?.text ?? 'Saved')}</p>` : ''}${!progress.correct && progress.reviewAnswer !== undefined ? `<p><strong>Review the correct answer:</strong> ${esc(progress.reviewAnswer)}</p>` : ''}<p>${progress.assisted ? (progress.correct ? 'Your final recovery answer is correct and earns half credit.' : 'Your final recovery answer earns zero credit.') : progress.correct ? 'Your checked answer is correct.' : 'Your checked answer earns zero credit.'} This answer stays saved. You can use the visual coach to review.</p>${pending ? `<p class="small">Confirm the saved receipt before submitting; this will not start another attempt.</p><button type="button" class="btn small" data-action="check-question" ${common} ${busy ? 'disabled' : ''}>Retry saved answer check</button>` : ''}</div>`;
  const recovery = progress.stage === 'recovery';
  return `<div class="assessment-question-status" aria-live="polite">${message ? `<p class="notice">${esc(message)}</p>` : ''}${progress.hint ? `<p class="small"><strong>Try this:</strong> ${esc(progress.hint)}</p>` : ''}${recovery ? `<p><strong>One final recovery choice.</strong> A correct choice earns half of this question’s ${maximum} points. An incorrect choice earns zero. Your earlier work stays saved.</p>${(progress.recoveryChoices || []).map((c) => `<label class="choice"><input type="radio" name="recovery-${esc(assignment)}-${esc(qid)}" data-recovery-question="${esc(qid)}" data-assignment="${esc(assignment)}" value="${esc(c.id)}" ${recoveryAnswer === c.id ? 'checked' : ''} ${pending || busy ? 'disabled' : ''}><span>${esc(c.text)}</span></label>`).join('')}` : `<p class="small muted">${component.recoveryEligibility ? `${Math.max(0, 3 - (progress.wrongCount || 0))} independent attempt${3 - (progress.wrongCount || 0) === 1 ? '' : 's'} remaining · ${maximum} points available.` : `Check your choice carefully. Confirming saves your one answer for ${maximum} points.`}</p>`}<button type="button" class="btn small primary" data-action="check-question" ${common} ${busy ? 'disabled' : ''}>${busy ? 'Checking…' : pending ? 'Retry saved answer check' : recovery ? 'Confirm final recovery answer' : component.responseType === 'choiceId' ? 'Confirm & check answer' : 'Check answer'}</button></div>`;
}
function resultPoints(result) {
  return result?.earned ? points(result.earned) : points(result?.score);
}
export function assessmentFeedback(record, contract) {
  // A newly published contract must not erase feedback from an older submission.
  if (!record?.latestFeedback && !record?.gradeOfRecord && !record?.held) return '';
  const best = record.gradeOfRecord;
  const latest = record.latestFeedback;
  const result = latest?.result;
  const pending = !result || ['pending', 'held', 'hold'].includes(result.status) || (result.pendingPossible || 0) > 0;
  const different = best && latest && best.submissionId !== latest.submissionId;
  const criteria = result?.criteria || [];
  return `<div class="notice ${best ? 'success' : ''}" data-assessment-feedback><strong>${best ? `Grade of record: ${resultPoints(best.result)} / ${points(contract?.maxPoints || 5)} points` : record.held ? 'Your work is saved · scoring is on hold' : 'Your work is saved · grading pending'}</strong>${best ? `<p class="small">${best.override ? 'A teacher correction is recorded for this grade.' : `Saved submission ${esc(best.sequence)}${different || record.revisionPending ? ' stays your grade while your newer work is reviewed.' : ' is your highest complete result for this assignment.'}`}</p>` : '<p>Pending work is not a zero.</p>'}${latest ? `<h3>Latest submission · ${esc(latest.sequence)}</h3>${result ? `<p>${esc(result.feedback || (pending ? 'Some feedback is still pending.' : 'Your work has been checked.'))}</p>${result.status === 'graded' ? `<p><strong>This submission: ${resultPoints(result)} / ${points(contract?.maxPoints || 5)} points.</strong>${different || best?.override ? ' Your grade of record stays above.' : ''}</p>` : ''}` : '<p>Written feedback is still pending. Your answers and submission are saved.</p>'}` : ''}${record.held ? '<p>We are checking a question or scoring issue. This work will not receive an invalid grade while that issue is unresolved.</p>' : ''}${result?.components?.length ? `<details><summary>Points by part</summary><ul>${result.components.map((c) => `<li>${esc(c.kind === 'objective' ? `Question ${objectiveComponents(contract).findIndex((item) => item.id === c.id) + 1}` : 'Written work')}: ${c.status === 'graded' || c.earned ? `${points(c.earned || c.score)} / ${points(contract?.components?.find((part) => part.id === c.id)?.allocation || c.maxPoints)} points` : `${points(contract?.components?.find((part) => part.id === c.id)?.allocation || c.maxPoints)} points pending`}</li>`).join('')}</ul></details>` : ''}${criteria.length ? `<ul>${criteria.map((c) => { const rubric = contract?.studentRubric?.find((r) => r.criterionId === c.criterionId || r.criterionId === c.criterion); return `<li><strong>${esc(rubric?.requirement || c.criterion || c.criterionId)}</strong> · ${c.level === 1 ? 'Full credit' : c.level === 0.5 ? 'Half credit' : c.level === 0 ? 'Not yet shown' : esc(c.level)}: ${esc(c.evidence || c.rationale || '')}</li>`; }).join('')}</ul>` : ''}${record.revisionPending ? '<p class="small">A newer revision is pending. It has not replaced your saved grade.</p>' : ''}</div>`;
}
export function teacherAssessment(record, contract) {
  if (!record?.latestFeedback && !record?.gradeOfRecord && !record?.held) return '';
  const best = record.gradeOfRecord, latest = record.latestFeedback;
  return `<p class="small"><strong>Grade of record:</strong> ${best ? `${resultPoints(best.result)} / ${points(contract?.maxPoints || 5)}${best.override ? ' · Teacher correction' : ` · Submission ${esc(best.sequence)}`}` : record.held ? 'On hold' : 'Pending; not zero'}</p>${latest ? `<p class="small muted">Latest submission ${esc(latest.sequence)}: ${latest.result?.status === 'graded' ? `${resultPoints(latest.result)} / ${points(contract?.maxPoints || 5)}` : 'feedback pending'}${record.revisionPending ? ' · Earlier grade preserved' : ''}</p>` : ''}`;
}
export function assessmentTotals(assessment) {
  if (!assessment?.totals) return '';
  const t = assessment.totals;
  const possible = Number(t.possiblePoints) || 0;
  const pending = Number(t.pendingPossible) || 0;
  const held = Number(t.heldPossible) || 0;
  const revisions = Object.values(assessment.records || {}).filter((r) => r?.revisionPending).length;
  return `<p class="caption" data-assessment-totals><strong>Curriculum Quest points:</strong> ${possible ? `${points(t.earned)} / ${points(t.possible)}${Number.isFinite(t.percent) ? ` · ${points(t.percent)}%` : ''}` : 'No completed grades yet'}${pending ? ` · ${points(pending)} points pending` : ''}${held ? ` · ${points(held)} points on hold` : ''}${revisions ? ` · ${revisions} revision${revisions === 1 ? '' : 's'} pending` : ''}. ${t.provisional ? 'This total is provisional. ' : ''}Daily Battle is scored separately.</p>`;
}
