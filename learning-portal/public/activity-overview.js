// Planning estimates, not deadlines or grading inputs. Video and question counts
// come from the current bootstrap; timings describe a full, unfinished lesson.
import {getLessonPractice} from './lesson-practice.js?v=dragon-path-4';
import {PRACTICE_DURATION_RECEIPTS} from './practice-duration-receipts.js?v=dragon-path-4';
export const ACTIVITY_ESTIMATE_VERSION = 'day30-38-planning.2';
export const OVERVIEW_SUBJECTS = ['math', 'reading', 'writing', 'science', 'morphology', 'ccf'];

// Minutes of student work WITHOUT video playback or physical science activity.
// Each row is [Grade 4 range, Grade 5 range]. Revisit after classroom observation
// or a material change to the lesson; do not shrink estimates to fit a timetable.
const WORK_MINUTES = {
  math: {
    30: [[20, 30], [20, 30]], 31: [[15, 25], [15, 25]],
    32: [[15, 25], [15, 25]], 33: [[15, 25], [15, 25]],
    35: [[15, 25], [15, 25]], 36: [[15, 25], [15, 25]],
    37: [[15, 25], [15, 25]], 38: [[15, 25], [15, 25]],
  },
  reading: {
    30: [[25, 35], [30, 40]], 31: [[25, 35], [30, 40]],
    32: [[20, 30], [25, 35]], 33: [[25, 35], [30, 40]],
    35: [[25, 35], [30, 40]], 36: [[25, 35], [30, 40]],
    37: [[20, 30], [25, 35]], 38: [[25, 35], [30, 40]],
  },
  writing: {
    30: [[25, 40], [25, 40]], 31: [[15, 25], [20, 30]],
    32: [[20, 30], [25, 35]], 33: [[20, 30], [25, 35]],
    35: [[20, 30], [25, 35]], 36: [[15, 25], [20, 30]],
    37: [[15, 25], [20, 30]], 38: [[10, 20], [10, 20]],
  },
  science: {
    30: [[20, 30], [20, 30]], 31: [[15, 25], [15, 25]],
    32: [[15, 25], [15, 25]], 33: [[25, 40], [25, 40]],
    35: [[10, 20], [10, 20]], 36: [[15, 25], [15, 25]],
    37: [[15, 25], [15, 25]], 38: [[15, 25], [15, 25]],
  },
  ccf: {
    30: [[30, 45], [30, 45]], 31: [[25, 40], [25, 40]],
    32: [[25, 40], [25, 40]], 33: [[25, 40], [25, 40]],
    35: [[25, 40], [25, 40]], 36: [[25, 40], [25, 40]],
    37: [[25, 40], [25, 40]], 38: [[25, 40], [25, 40]],
  },
};
// Provisional class windows for 27 individual devices; testing assumes one
// station. Sum conservatively until the teacher's schedule defines overlapping
// notebook work, station count, trial count, setup and cleanup.
const PHYSICAL_MINUTES = { 35: [30, 50], 36: [30, 60], 37: [45, 80], 38: [45, 75] };
const PHYSICAL_LABELS = { 35: 'building', 36: 'class testing', 37: 'improving and retesting', 38: 'live class drop' };
const countLabel = (count, singular, plural = `${singular}s`) => `${count} ${count === 1 ? singular : plural}`;
const rangeLabel = range => `${range[0]}–${range[1]} min`;
const roundUpFive = minutes => Math.ceil(minutes / 5) * 5;
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function workload(subject, content) {
  const { day } = content;
  const questions = content.questions?.[subject]?.length || 0;
  const counts = { questions, writtenParts: 0 };
  const metrics = questions ? [countLabel(questions, 'question')] : [];
  let activity;
  if (subject === 'math') {
    const practice=getLessonPractice(content.grade,day,subject);
    counts.practiceTasks=practice?.tasks.length||0;
    if(practice)metrics.push(countLabel(practice.tasks.length,'practice activity','practice activities'));
    activity=practice ? (content.grade===4?'Build your own figures, explain, and check your thinking.':'Build place-value models, explain, and check your thinking.') : 'Explore the model, then check your answers.';
  }
  if (subject === 'reading') {
    counts.passages = 1;
    counts.minimumEvidenceSelections = 2;
    counts.organizerEntries = content.readingTask?.organizer.length ?? 3;
    counts.writtenParts = 2 + counts.organizerEntries + 1;
    metrics.push(`${counts.writtenParts}+ written parts`);
    activity = `1 passage · 2 evidence notes · ${counts.organizerEntries} organizer entries · 1 response`;
  }
  if (subject === 'writing') {
    counts.writtenParts = day === 30 ? 7 : content.writingDay.required.length + Number(!!content.writingDay.revision);
    counts.newParagraphs = [31, 32, 33].includes(day) ? 1 : 0;
    counts.revisionNotes = Number(!!content.writingDay?.revision);
    if (day === 30) { metrics.push('7 planning responses'); activity = 'Choose your topic and plan two supported reasons.'; }
    else if (day === 31) { metrics.push('1 new paragraph'); activity = 'Draft the introduction to your continuing essay.'; }
    else if (day === 32) { metrics.push('1 new paragraph'); activity = 'Develop both reasons in your body paragraph.'; }
    else if (day === 33) { metrics.push('1 new paragraph'); activity = 'Write the conclusion and assemble your 3-paragraph essay.'; }
    else if (content.writingDay.revision) { metrics.push('Essay revision', '1 revision note'); activity = 'Improve your saved essay; continue the same 3 paragraphs.'; }
    else { metrics.push('Final essay review'); activity = 'Check and submit the 3-paragraph essay you developed.'; }
  }
  if (subject === 'science') {
    counts.writtenParts = 1 + (content.scienceDay?.extra?.length || 0);
    metrics.push(countLabel(counts.writtenParts, 'notebook entry', 'notebook entries'));
    activity = day === 30 ? 'Explore energy, make a prediction, and choose your strategy.'
      : `${content.scienceDay.phase}${content.scienceDay.physical ? ' · includes physical activity' : ''}`;
  }
  if (subject === 'morphology') {
    counts.writtenParts = 1;
    metrics.push('1 written response');
    activity = content.morph.video ? 'Word lab practice and a written application.' : 'Study the picture, then write your quickwrite.';
  }
  if (subject === 'ccf') {
    counts.interviews = content.caseFile.witnesses.length;
    counts.records = content.caseFile.records.length;
    counts.minimumEvidenceSelections = 2;
    counts.writtenParts = 2;
    metrics.push(countLabel(counts.interviews, 'interview'));
    activity = `Case report · ${countLabel(counts.records, 'record')} · 2 evidence pins · notebook + conclusion`;
  }
  return { counts, metrics, activity };
}

export function activityOverview(content, videoLessons, verifiedVideoProgress = {}) {
  const { grade, day } = content;
  if (![4, 5].includes(grade) || !WORK_MINUTES.math[day]) throw new RangeError('No activity estimate for this grade and day.');
  if (!Array.isArray(videoLessons)) throw new TypeError('Provide the current assigned video catalog.');
  return Object.fromEntries(OVERVIEW_SUBJECTS.map(subject => {
    // Count assigned lessons, not iframe elements, resource links, or optional
    // videos from other project days. Do not infer completion from these counts.
    const clips = videoLessons.filter(v => v.assignment === subject && v.day === day).map(v => {
      // A Day 30 length may be verified by the server on first play, after the
      // initial catalog was loaded. Use that current profile/day snapshot for
      // display only; never read a browser media element's claimed duration.
      const progress = verifiedVideoProgress[v.id];
      const receipt = PRACTICE_DURATION_RECEIPTS.find(r=>r.grade===grade&&r.id===v.sourceId&&r.url===v.url);
      const verified = progress?.id===v.id&&progress.durationSeconds>0 ? progress.durationSeconds : receipt?.durationSeconds;
      return !v.durationSeconds && verified ? {...v,durationSeconds:verified} : v;
    });
    const unknownVideoCount = clips.filter(v => !Number.isFinite(v.durationSeconds) || v.durationSeconds <= 0).length;
    const knownVideoSeconds = clips.reduce((sum, v) => sum + (Number.isFinite(v.durationSeconds) && v.durationSeconds > 0 ? v.durationSeconds : 0), 0);
    const baseWorkMinutes = subject === 'morphology'
      ? (day === 30 || day === 31 && grade === 4 ? [10, 15] : [10, 20])
      : WORK_MINUTES[subject][day][grade - 4];
    const practice=getLessonPractice(grade,day,subject);
    const workMinutes=baseWorkMinutes.map((minutes,i)=>minutes+(practice?.minutes[i]||0));
    const physicalMinutes = subject === 'science' && content.scienceDay?.physical ? PHYSICAL_MINUTES[day] : [0, 0];
    if (!physicalMinutes) throw new RangeError('A physical activity needs an authored time allowance.');
    const knownSubtotalMinutes = workMinutes.map((minutes, i) => roundUpFive(minutes + physicalMinutes[i] + knownVideoSeconds / 60));
    const details = workload(subject, content);
    return [subject, {
      subject, grade, day, estimateVersion: ACTIVITY_ESTIMATE_VERSION,
      ...details, videoCount: clips.length, knownVideoSeconds, unknownVideoCount,
      workMinutes: [...workMinutes], physicalMinutes: [...physicalMinutes],
      baseWorkMinutes:[...baseWorkMinutes], addedPracticeMinutes:practice?.minutes||[0,0],
      practiceTasks:practice?.tasks.map(t=>({id:t.id,title:t.title,type:t.type,phase:t.phase,minutes:t.minutes,scored:false,requiredForCompletion:false}))||[],
      physicalActivity: subject === 'science' ? PHYSICAL_LABELS[day] || null : null,
      // An unknown clip must never turn into a zero-minute or complete estimate.
      estimatedMinutes: unknownVideoCount ? null : knownSubtotalMinutes,
      knownSubtotalMinutes, scheduledMinutes: null,
      estimateBasis: 'Planning allowance; full videos at 1× plus lesson work and any physical class window, added sequentially. Not measured student timing. Physical work assumes 27 devices; overlapping work or extra test stations need a teacher plan.',
    }];
  }));
}

export function activityOverviewMarkup(item) {
  const metrics = [countLabel(item.videoCount, 'video'), ...item.metrics];
  const time = item.estimatedMinutes ? `Est. ${rangeLabel(item.estimatedMinutes)}` : `Est. ${rangeLabel(item.knownSubtotalMinutes)} + video time`;
  const included = [];
  if (item.knownVideoSeconds) included.push(`${Math.ceil(item.knownVideoSeconds / 60)} min video at 1×`);
  if (item.physicalActivity) included.push(`${rangeLabel(item.physicalMinutes)} ${item.physicalActivity}`);
  return `<div class="activity-overview" data-activity-overview="${escapeHTML(item.subject)}"><div class="activity-metrics">${metrics.map(label => `<span>${escapeHTML(label)}</span>`).join('')}</div><div class="activity-work">${escapeHTML(item.activity)}</div><div class="activity-time"><strong>${escapeHTML(time)}</strong>${included.length ? `<span>Includes ${escapeHTML(included.join(' + '))}</span>` : ''}${item.unknownVideoCount ? `<span>${escapeHTML(countLabel(item.unknownVideoCount, 'video length'))} not yet verified; add that time.</span>` : ''}</div></div>`;
}

export function battleOverviewMarkup(battle) {
  const count = battle?.policy?.questionCount;
  if (!Number.isInteger(count)) return '';
  return `<p class="battle-home-overview">${countLabel(count, 'question')} · ${escapeHTML(battle.trackLabel)} · 20–25 min target</p>`;
}
