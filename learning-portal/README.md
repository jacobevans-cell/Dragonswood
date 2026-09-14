# Dragonswood learning release

The main site's Daily Battle, Curriculum Quest, and adventurer selection open the Firebase application at https://dragonswood-9289e.web.app/. This folder contains public assets shared with the main portal. Server code, answer banks, transcripts, deployment credentials, and student records are kept out of this public repository.

Day 30 uses an initial AI pilot: Luna independently checks submitted rubric work, Terra reviews it, and Sol adjudicates disagreements. Math and Daily Battle use deterministic scoring. Morphology AI grades remain pending while its meaning/development boundaries are validated. Saved work and activity completion do not depend on a successful AI grade. No Daily Battle prizes are awarded. The retired Boss Battle and its browser reward writes are disabled.

Rollback baseline: `c882bce9b57271560203ecda06409d0a147cfdc2`. Deployment and character migration receipts are retained privately in the operator workspace. Existing character and pet fields remain available for rollback; new progression and mapped ownership are versioned separately.

Validation: 441 application checks passed, followed by 11 affected policy checks. The official gradebook adapter passed nine checks; Firebase's rules simulator passed 28. Real signed-in student and hosted grading-callback verification are still required. The AI diagnostic set is implementation-authored and does not establish independent full qualification.

The PR gate now runs `run-learning-release-gate.sh`: current entry points, versioned characters, dated schedule, authoritative gradebook, existing core/pass/substitute checks, and the complete Firebase identity/rules emulator suite. The legacy `run-student-beta-gate.sh` remains available for its older pages and pixel baselines. Its Hall, curriculum, and Boss expectations describe the retired implementation. The identity fixture was corrected to submit a currently allowed game with an owner-prefixed ID and server timestamp, and to deny new Boss chests while retaining historical read isolation.
