# START HERE — Dragonswood V3.3 Production Integration

## Your role

You are the lead integration engineer for Dragonswood.

This package is the complete handoff for the next phase. Read the package before editing anything. Do not ask the user to separately re-upload the V3.3 tester, handoff, screenshots, or repository pointer unless a file is actually missing from this package.

## The mission in one sentence

**Make the approved V3.3 model behave like the newest working production Dragonswood without changing the approved V3.3 visual design and without disrupting the students or teacher who are already using production.**

This is architecture transplantation, not redesign.

---

# 1. Absolute priority: protect the live classroom

Students are already using the production Dragonswood portal. The live portal is not a sandbox.

Therefore:

1. Do **not** begin by replacing production `index.html`, `teacher.html`, Firestore rules, or shared production JS/CSS.
2. Do **not** integrate directly on `main` as the working environment.
3. Do **not** delete or simplify existing production functionality because V3.3 does not yet display it.
4. Do **not** promote incomplete subsystems to the live student portal.
5. Do **not** make a production promotion until a rollback point and rollback procedure are already verified.
6. Prefer additive, isolated integration over destructive replacement.
7. Every integration milestone must prove both:
   - production behavior is preserved; and
   - the V3.3 visual freeze has not regressed.

If there is a conflict between “move quickly” and “protect the live classroom,” protecting the live classroom wins.

---

# 2. Authorities and precedence

Use these authorities in this order:

### A. Newest verified production repository = functional authority

Repository:

`jacobevans-cell/Dragonswood`

GitHub Pages base:

`https://jacobevans-cell.github.io/Dragonswood/`

Verified `main` at package creation:

`beb1f5968268bf168c3d43b82bd79c69bc71ca0c`

Commit message:

`Add isolated Dragonswood V3.3 fidelity tester`

**Important:** Treat that SHA as a package-creation checkpoint, not as permission to assume it is still newest. Before integration, query the repository again and inventory the current `main` branch completely. If production moved forward after this package was created, the newer production behavior wins.

### B. V3.3 tester = visual authority

Approved visual model is bundled here:

`v33-approved-visual-model/dragonswood-v33-test/`

Safe hosted launcher:

`https://jacobevans-cell.github.io/Dragonswood/dragonswood-v33-test/launcher.html`

### C. Full current-state handoff = project-history and law reference

`DRAGONSWOOD-V3.3-CURRENT-STATE-AND-INTEGRATION-HANDOFF.docx`

### D. Screenshot references

The student and teacher reference screenshots are bundled inside the V3.3 tester under:

`assets/reference/`

Visible screenshot content is the authority when teacher screenshot filenames are mislabeled.

---

# 3. Visual freeze

During this integration phase, **do not redesign V3.3**.

V3.3 owns:

- page geometry
- sidebar/header geometry
- card dimensions
- spacing
- typography hierarchy
- background placement
- glossy/glass treatment
- metallic treatment
- gradients
- borders/radii
- artwork placement/cropping
- navigation appearance
- overall visual hierarchy

Production owns:

- authentication
- Firebase initialization
- Firestore contracts
- student identity/data
- curriculum/pacing
- videos and media
- grading / AI grading
- recovery logic
- academic games
- XP / levels / gold
- classes / equipment
- pets / pet assets / pet animation
- boss logic
- rewards
- passes
- jobs
- schedule logic
- teacher controls
- leaderboards
- narration
- security rules
- all other verified working behavior

The job is to connect production behavior **under the V3.3 presentation layer**.

Read `docs/02-VISUAL-FREEZE-CONTRACT.md` before making UI changes.

---

# 4. Integration order

Do not attempt a giant blind merge. Integrate in this order:

1. Current production inventory and dependency map
2. Safety branch / rollback baseline / visual-freeze baseline
3. Authentication and student identity
4. Student stats/profile/progression shell
5. Daily Missions + curriculum + pacing + video behavior
6. Grading + teacher verification + recovery
7. Scribe Arena
8. Academic Games
9. My Day + schedule/calendar behavior
10. Adventurer Hall + classes + equipment
11. Complete pet system + approved assets + animation
12. Boss Battle
13. Leaderboards
14. Passes + rewards + jobs
15. Full teacher portal functionality
16. Narration + media
17. Firestore/security rules integration
18. Full functional regression audit
19. Full visual regression audit against V3.3/screenshots
20. Staged production promotion
21. Post-promotion live smoke test
22. Rollback immediately if a release-blocking failure appears

Read `docs/01-INTEGRATION-MASTER-PLAN.md` and `docs/05-SUBSYSTEM-INTEGRATION-CHECKLIST.md` for the detailed version.

---

# 5. First action in the new chat

Before editing anything, perform and report a **read-only audit** of the newest GitHub `main` branch.

The audit must identify:

- current production entry files
- shared CSS and JS dependencies
- Firebase/auth initialization
- Firestore collection/document contracts
- curriculum data sources
- grading systems
- recovery systems
- narration/media systems
- pet/class/equipment systems
- boss/reward systems
- pass systems
- schedule/jobs systems
- teacher-side systems
- security rules
- any functionality present in production but not represented in the V3.3 tester
- any V3.3 mock behavior that must be replaced with production behavior

Do not make edits until that map exists.

---

# 6. Production promotion rule

The final production change must be designed as a **controlled release**, not a pile of unrelated commits drifting into `main`.

Before promotion:

- current production is tagged or otherwise given an immutable rollback reference;
- integration has passed the functional checklist;
- V3.3 visual checks pass;
- all required assets exist at their final URLs;
- cache behavior is considered so old HTML cannot accidentally pair with incompatible new JS/CSS;
- promotion changes are known and reviewable;
- rollback commands are already written down with the exact promotion commit SHA once created.

Preferred rollback mechanism after a bad promotion:

`git revert <PROMOTION_COMMIT_SHA> --no-edit`

then:

`git push origin main`

This preserves history and allows GitHub Pages to redeploy the previously working state within normal Pages deployment time.

Do not use a force-reset rollback as the normal first choice.

Read `docs/03-ZERO-DOWNTIME-PRODUCTION-SAFETY.md` and `docs/04-ROLLBACK-WITHIN-MINUTES.md`.

---

# 7. Definition of done

Integration is not done merely because V3.3 “loads.”

It is done when:

- all verified current production functionality required by the system is present;
- production data contracts remain compatible;
- no student progress is lost or orphaned;
- no teacher control silently becomes mock-only;
- curriculum and pacing behavior remain correct;
- permissions/security rules remain correct;
- V3.3 visuals remain within the approved visual freeze;
- all 8 student routes pass functional smoke tests;
- all 9 teacher routes pass functional smoke tests;
- responsive behavior passes target devices;
- rollback has been rehearsed conceptually and is executable from a known commit;
- promotion is performed as a controlled change;
- the live portal is checked immediately after deployment.

Read `docs/07-DEFINITION-OF-DONE.md`.

---

# 8. Do not make the user reconstruct this handoff

Everything needed to begin is in this package. If additional information is needed, first inspect:

1. this package;
2. the newest GitHub `main` branch;
3. the bundled handoff;
4. the bundled tester and screenshot references.

Only then ask the user for something truly unavailable.
