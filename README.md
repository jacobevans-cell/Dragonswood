# Dragonswood

**Current build: v50.3 — Draft Create Fix**

## New in v50
Dragonswood now includes a first working Scribe Arena / Quickwrite system.

### Student
- New **SCRIBE ARENA** navigation tab.
- Active teacher-launched Quickwrite prompt.
- Configurable timer, minimum word goal, and target writing skill.
- Autosaving drafts to Firestore.
- Permanent submitted writing.
- Local mechanics data: word count, sentence count, paragraph count, capitalization starts, ending punctuation.
- Optional AI feedback after submission.
- AI rubric: Ideas, Organization, Language/Style, Conventions, Target Skill.
- Grammar, punctuation, capitalization, and spelling percentages.
- Strength + one concrete next step.
- Writing Portfolio with average score and mechanics growth indicators.

### Teacher
- New **WRITING** command tab.
- Launch Quickwrite, Scribe Battle, or Writing Workshop sessions.
- Select writing type, target skill, timer, minimum words, prompt, and up to four hints.
- Live drafting/submission counts.
- View every saved response.
- View AI rubric feedback.
- Enter/override the official teacher score and teacher feedback.
- Close the active mission.

### AI architecture
Student browser never receives the OpenAI API key.

Student -> Firestore -> Firebase callable Cloud Function -> OpenAI -> structured rubric result -> Firestore.

The Cloud Function uses the OpenAI Responses API with Structured Outputs and the `OPENAI_API_KEY` Firebase secret.

### Firebase files included
- `firebase.json`
- `.firebaserc`
- `firestore.rules`
- `functions/package.json`
- `functions/index.js`

### Required deployment
This build **does require a Firebase update** because it adds writing collections and a Cloud Function.

From the project folder:
1. `firebase login`
2. `firebase functions:secrets:set OPENAI_API_KEY`
3. Paste the secret API key when prompted.
4. `firebase deploy --only firestore:rules,functions`

Do not put the OpenAI secret in GitHub or any HTML file.

### New Firestore collections
- `writingSessions`
- `writingResponses`
- `writingVotes` (reserved for the Scribe Battle voting phase)

## Current Scribe Arena scope
v50 establishes the complete Quickwrite storage, teacher workflow, AI grading, portfolio, and growth foundation. Anonymous peer duels/finalist voting can now be layered onto the `writingVotes` collection without changing the core response model.


## v50.1 — Scribe Live Fix
- Fixed a first-open race condition that could leave students seeing **No active Quickwrite** after the teacher had launched a mission.
- The active mission now renders immediately, then Dragonswood creates the student's draft, then attaches the response listener.
- Added visible error feedback if a writing-session or response listener fails.
- Firestore writing rules now also recognize an authenticated Dragonswood test/student account that already has a `students/{uid}` profile. This supports the Technology test student without opening writing access to arbitrary accounts.
- The AI `gradeWriting` Cloud Function does not need to be redeployed for this fix.


## v50.2 — Scribe Button Fix
- Submit Quickwrite now has explicit loading, success, and Firestore error states.
- Pending autosave is canceled before final submission to prevent draft/submission races.
- Local response state flips to submitted immediately after Firestore confirms the write, so AI feedback unlocks without waiting on the listener.
- AI Feedback now reports actual callable-function errors instead of appearing to do nothing.
- Disabled AI Feedback button is visually obvious before submission.
- AI grader model changed to `gpt-5-mini` for a broadly supported, low-cost production model.
- Firestore rules do not need another change for this patch.
- `gradeWriting` Cloud Function DOES need redeployment because its model configuration changed.


## v50.3 — Draft Create Fix
- Root cause fixed: a new student's `writingResponses/{sessionId_uid}` document did not exist yet, but the client first called `getDoc()` to check for it. The old rule required `resource.data.studentId`, which cannot exist on a nonexistent document, so Firestore denied the check before Dragonswood could create the draft.
- Writing-response reads now safely permit the signed-in student to check only a response document whose ID ends in their own Firebase UID.
- Existing responses remain private to their owner; teacher access is unchanged.
- Includes all v50.2 button/error improvements and the `gpt-5-mini` grader configuration.
- Requires one Firestore-rules deployment and one `gradeWriting` function deployment.
