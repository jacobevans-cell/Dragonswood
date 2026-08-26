# Massive Integration Collision Map

## Resolved production delta

| Surface | Collision | Resolution |
|---|---|---|
| Student navigation | Older handoffs expected V2 or standalone destinations; frozen production now uses `dragonswood-module-host.js`. | Preserve module-host behavior as the functional donor, then map every destination into V3.3. Never restore V2 links. |
| V2 files | V3 Bible originally named V2 runtime references that frozen production intentionally retired. | Preserve historical documentation only. Do not recreate retired runtime files. |
| Teacher Seating Command | V3.3 has nine approved routes, while production also has Seating Command. | Preserve it as a real module within V3.3 Classroom Tools; do not omit it or add an old-portal link. |
| `math-operations-quest.html` | Frozen production contains portal-module cleanup not present in v56.27 package. | Apply v56.27 behavior surgically and preserve the current portal return/module presentation. |
| Grayson script mounts | v58 targets fourteen academic pages and normalizes script tags. | Patch only current pages; never replace a page. Keep Grayson optional and reward-free. |
| `firestore.rules` | Production rules are newer than all subsystem rules. Arcade and future Kingdom services need new collections. | Current rules remain the base. Add narrowly scoped rules only after emulator tests; never overlay package rules. |
| Firebase initialization | V3.3, production, Arcade and Kingdom packages each contain Firebase assumptions. | One V3.3 environment/auth service owns production initialization. Subsystems consume the authenticated identity; no duplicate live app. Teacher remains a separately named app where production requires it. |
| Student identity | Arcade accepts query/local profile IDs; Kingdom tester has its own access helper. | Replace trust in query/local identifiers with the authenticated V3.3 UID and exact production profile. Local values may be display/cache only. |
| Access gates | Academic Games use Morning Work; Arcade needs token + teacher gate; Kingdom Wars needs Morning Work + tester gate. | Use one route/access service with explicit per-module policy and enforce it again inside direct subsystem URLs. |
| Rewards/currency | Production Gold/XP, Arcade internal cosmetics, new Arcade Tokens, Arcade leaderboard eligibility, and Kingdom raid resources coexist. | Keep separate schemas. Arcade Tokens purchase time only. Arcade game performance never awards Tokens, Gold, XP, or class points. Kingdom raid resources never touch academic/profile currency. |
| Service workers | Arcade has `sw.js`; production currently has no root service worker. | Host Arcade under `/arcade/` so its worker scope cannot control V3.3 or production root. Include access-gate assets in its cache and version cache deliberately. |
| Routes/back links | Standalone modules historically linked to `index.html`. | V3.3 owns Home/back/exit behavior. Same-origin modules communicate with the V3.3 shell and direct loads return to the V3.3 hub after authorization. |
| CSS/globals | V3.3 uses layered external CSS; production pages contain large inline CSS/global functions. | Do not inject production markup/CSS into the frozen shell. Use isolated modules/adapters and V3.3 components. Avoid duplicate IDs and globals. |
| Persistence | Existing production has live classroom schemas; Kingdom has local tester saves; Arcade has local/cloud progress. | Migrations are additive and backward-compatible. No bulk live-data rewrite. Kingdom migration is confined to its tester save schema. |

## Exact staged file ownership

| System | Create/add | Patch | Must not replace |
|---|---|---|---|
| V3.3 | isolated `v33-integration/` candidate, services, tests and docs | none in production root before promotion | root `index.html`, `teacher.html`, current `firestore.rules` |
| Math v56.27 | no new runtime surface | five Math Operations runtime files and current cache references | unrelated pages, teacher portal, Firestore rules |
| Grayson v58 | updated Grayson engine/basis | script tags on current academic pages | full academic HTML pages, production progress/reward logic |
| Arcade v1.6 | isolated `/arcade/` package, access adapter and tests | V3.3 routes/services; later rules/functions after tests | production reward contracts or root service-worker scope |
| Kingdom Wars V11.1 | isolated `/kingdom-wars/` tester module and hardening tests | V3.3 tester navigation/services; later narrow rules | production profile, grades, Gold, XP, pets, equipment, achievements, teacher rewards |

## Deferred/blocked collisions

- Firebase emulator execution must pass before Stage 4 and before any production-rule integration.
- Real managed-Chromebook Arcade online/cache/offline/cold-open certification cannot be claimed from this environment.
- Kingdom Wars remains local/hidden tester; server-authoritative live PvP and V12 protection are not part of V11.1.
- Crowns remain ladder semantics pending a separate balance decision; V11.1 will not silently conserve/rebalance them.
