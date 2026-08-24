# Dragonswood v56.22 — Curriculum Integrity

Production-only patch based on GitHub `main` commit `12b022c85d8099323740460c925be60c1652717d`.

## Files

- `index.html`
- `daily-quest.html`
- `curriculum-question-engine.js`
- `teacher.html`
- `curriculum-pacing-selftest.cjs`

## What changed

- Daily Work now derives its grade/day assignment from the Q1 pacing records embedded in Dragonswood.
- Removed the rotating unrelated-skill injection and reteach topic replacement.
- Game engines rotate without changing the assigned academic topic.
- Pacing-locked questions fail closed instead of falling back to an unrelated generic question.
- Curriculum Quest uses lesson-topic matching for Math as well as HUM.
- Fourth-grade Day 16 is locked to multi-digit addition; Day 17 is locked to subtraction.
- Existing deterministic grading, contextual accepted answers, AI rescue, and teacher review remain in place.
- Teacher review cards include pacing metadata and combine identical pending requests.
- Returning a question sends that question back for revision; it does not restart the whole activity.

## No backend deployment

Do not deploy Firestore rules, Firebase Functions, Storage, or R2 for this patch.

## Required verification

```bash
node grading-hardening-selftest.cjs
node academic-grading-v2-selftest.cjs
node curriculum-pacing-selftest.cjs
git diff --check
```

Live authenticated testing is still required after GitHub Pages publishes.
