# 05 — Subsystem Integration Checklist

For every subsystem, complete ALL five gates before moving on:

1. **Inventory gate** — identify current production sources and data contracts.
2. **Integration gate** — wire production behavior into V3.3.
3. **Functional gate** — prove the subsystem works for expected states and edge cases.
4. **Visual gate** — prove approved V3.3 appearance has not regressed.
5. **Production-safety gate** — confirm live production remained untouched/unbroken.

## A. Authentication / identity

- [ ] Student identity resolves correctly.
- [ ] Teacher/tester identity resolves correctly.
- [ ] Grade/group/profile mapping preserved.
- [ ] Unauthorized users cannot gain teacher powers.
- [ ] No tester-only identity logic remains in production candidate.

## B. Student stats / progression

- [ ] HP loads from correct source.
- [ ] Gold loads/writes correctly.
- [ ] XP/level logic matches production.
- [ ] Streak logic matches production.
- [ ] Class state matches production.
- [ ] Equipment/progression state matches production.

## C. Daily Missions / curriculum

- [ ] Current pacing source identified.
- [ ] All required videos preserved.
- [ ] Watch/unlock behavior preserved.
- [ ] Quest/applications map to correct content.
- [ ] Sequential rules preserved.
- [ ] Teacher verification/override preserved.
- [ ] Recovery behavior preserved.
- [ ] Weekends/recovery rules preserved where applicable.

## D. Grading

- [ ] Production grading engine used.
- [ ] AI grading path used where intended.
- [ ] Teacher review path preserved.
- [ ] Gradebook receives correct results.
- [ ] Rejection/retry behavior preserved.
- [ ] No keyword-password regression.

## E. Scribe

- [ ] Real draft/submission state integrated.
- [ ] Required validation preserved.
- [ ] Teacher review path preserved.
- [ ] Student drafts are not lost during navigation.

## F. Academic Games

- [ ] All current production games inventoried.
- [ ] Every approved game remains launchable.
- [ ] Rewards/progression hooks preserved.
- [ ] Access restrictions preserved.

## G. My Day / schedule

- [ ] Real schedule/day state integrated.
- [ ] Teacher schedule controls reflected correctly.
- [ ] Current-day behavior is timezone/date safe.

## H. Adventurer Hall

- [ ] Classes integrated.
- [ ] Equipment integrated.
- [ ] Appearance/progression rules integrated.
- [ ] Lock/restriction rules preserved.

## I. Pets

- [ ] Complete current pet registry integrated.
- [ ] Active-pet rule preserved.
- [ ] Hatchery/sanctuary/shop logic preserved.
- [ ] Rarity/level restrictions preserved.
- [ ] Teacher/tester secret-pet rules preserved where currently authoritative.
- [ ] Animations and motion controller preserved.
- [ ] No approved asset pack silently omitted.

## J. Boss Battle

- [ ] Correct question sources used.
- [ ] Damage/HP logic preserved.
- [ ] Daily completion state preserved.
- [ ] Rewards preserved.
- [ ] No duplicate reward exploit introduced.

## K. Leaderboards

- [ ] Correct ranking data source used.
- [ ] Privacy/display rules preserved.
- [ ] Ties/order handled predictably.

## L. Passes

- [ ] Student pass request/status integrated.
- [ ] Teacher pass approval/return controls integrated.
- [ ] State stays synchronized.
- [ ] Restrictions/status wording preserved as current authority requires.

## M. Rewards

- [ ] Student rewards integrated.
- [ ] Teacher reward controls integrated.
- [ ] Gold/XP/items update correct record exactly once.

## N. Guild jobs

- [ ] Current job assignment/state integrated.
- [ ] Teacher controls integrated.
- [ ] Student My Day state reflects current job.

## O. Teacher portal

- [ ] Student Command real.
- [ ] Gradebook real.
- [ ] Scribe Command real.
- [ ] Class Rewards real.
- [ ] Pass Control real.
- [ ] Guild Jobs real.
- [ ] Schedule real.
- [ ] Classroom Tools real.
- [ ] Leaderboards real.
- [ ] Serious actions include appropriate confirmation/guardrails.

## P. Narration/media

- [ ] Production narration architecture preserved.
- [ ] Students do not load development-only TTS model.
- [ ] Audio files resolve.
- [ ] Video/media mappings resolve.
- [ ] Performance on student Chromebook remains acceptable.

## Q. Security / Firestore rules

- [ ] Every production read path allowed appropriately.
- [ ] Every production write path allowed appropriately.
- [ ] Student cannot write teacher-only state.
- [ ] Teacher can perform required controls.
- [ ] Rule changes are backward-compatible during transition where needed.
