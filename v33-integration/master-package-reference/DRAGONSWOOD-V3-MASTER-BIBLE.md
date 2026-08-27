# THE DRAGONSWOOD V3 MASTER BIBLE

## Definitive Visual, Architectural, Migration, Safety, Testing, and Handoff Authority

**Owner:** Jacob Evans  
**Project:** Dragonswood classroom adventure portal  
**Primary users:** Fourth- and fifth-grade students and their teacher  
**Document status:** Master authority for planning and building the clean V3 system  
**Reference set reviewed:** 9 approved teacher screenshots, 8 approved student screenshots, the V2 tester handoff supplied by Jacob, and `DRAGONSWOOD-AESTHETICS-AND-ARCHITECTURE-HANDOFF.md`

---

## 0. Read This First

Dragonswood V3 will be a clean implementation of the approved student and teacher experiences. It will not be a cosmetic patch layered onto the current oversized portal files.

The V3 goal is to achieve all three of these outcomes at the same time:

1. **Exact visual fidelity:** Reproduce the approved screenshot system closely enough that it clearly feels like the same product.
2. **Full functional continuity:** Preserve every approved working classroom, game, account, Firebase, and teacher-management feature from the newest production version.
3. **Long-term maintainability:** Organize the same vanilla technologies so future changes do not require dangerous CSS patch stacking or editing enormous mixed-purpose files.

### The central rule

> The approved screenshots and approved reference implementation own the appearance and workflow. The newest verified production repository owns the behavior and data contracts. V3 must combine both without casually sacrificing either.

### The architectural decision

V3 will remain:

- vanilla HTML;
- vanilla CSS;
- vanilla JavaScript;
- Firebase Authentication;
- Cloud Firestore;
- static hosting compatible;
- free of React, Vue, Angular, Next.js, or another runtime framework;
- free of a required runtime bundler or compilation service.

Development-only tools are allowed for generation, verification, screenshots, accessibility checks, and tests. They must emit or test ordinary static files. A teacher must not need Node, Python, a package manager, or a build server to open the deployed website.

---

## 1. Executive Decision: Is This the Best Approach?

### Decision

Yes—with one important correction to the earlier V2 workflow.

The best approach is:

1. Preserve the current production repository as the functional reference and emergency fallback.
2. Create a clean V3 repository for the approved visual system and modular implementation.
3. Build the full visual prototype with representative mock data before connecting production behavior.
4. Use a separate Firebase staging project and Firebase emulators while developing and testing.
5. Transplant production features subsystem by subsystem.
6. Keep production and V3 running in parallel until visual and functional acceptance are complete.
7. Promote only after Jacob explicitly approves the normal student and teacher workflows.

### Why this is better than continuing to patch V2

The current V2 tester model protects `index.html` and `teacher.html`, which is good. However, it still inherits a major structural constraint: hundreds of legacy IDs and large scripts are being preserved inside redesigned versions of the same monolithic pages. That is useful as a short-term bridge, but it is not the ideal final foundation.

The approved screenshots use page structures that were designed as coherent products. Attempting to force those structures into legacy wrappers has already produced oversized headers, doubled offsets, clipped account controls, overlapping student controls, and black loading overlays.

A clean V3 repository removes the visual history while preserving the production repository as a behavioral specification.

### Why a framework is not required

React would not make Dragonswood prettier. The screenshots can be reproduced using modern HTML and CSS. A framework may organize state, but it also introduces a conversion project, dependency chain, build process, and new regression surface.

Native JavaScript modules, template functions, semantic HTML, CSS Grid/Flexbox, custom properties, and cascade layers provide the organization V3 needs while keeping deployment simple. CSS cascade layers are widely supported and allow explicit control over precedence without specificity wars or `!important` patches ([MDN: `@layer`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40layer)).

### The major safety improvement

V3 should not use the production Firestore database for ordinary development. Firebase recommends a separate Firebase project for each environment ([Firebase environment best practices](https://firebase.google.com/docs/projects/dev-workflows/general-best-practices)). The Local Emulator Suite can emulate Authentication, Firestore, Storage, Hosting, and other Firebase services for safe local testing ([Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite)).

Therefore:

- **Local development:** Firebase Emulator Suite with seeded fictional data.
- **Shared V3 testing:** Separate Dragonswood staging Firebase project with test accounts and sanitized data.
- **Production:** Existing live Firebase project, connected only during final controlled validation and promotion.

---

## 2. Authority Hierarchy

When instructions conflict, use this order.

### 2.1 Safety authority

The protection of students, classroom records, live accounts, grades, permissions, and the current working website overrides convenience.

### 2.2 Explicit current instruction from Jacob

Jacob’s newest direct instruction overrides an older preference or handoff. Record the superseded decision rather than silently mixing both.

### 2.3 Functional authority

The newest verified commit of the current GitHub production repository owns:

- Firebase initialization;
- Authentication behavior;
- roles and account eligibility;
- Firestore collection/document contracts;
- security assumptions;
- working reads and writes;
- current calculations;
- current feature behavior;
- current bug fixes;
- current asset references and routes.

Repository: `https://github.com/jacobevans-cell/Dragonswood`

Record the exact production commit before every transplant. “Newest ZIP in a folder” is not an adequate authority.

### 2.4 Visual authority

The supplied screenshot collections are the visual authority:

- `dragonswood-command-all-page-screenshots.zip`
- `dragonswood-student-all-page-screenshots.zip`

They define the intended:

- composition;
- hierarchy;
- density;
- palette;
- visual mood;
- navigation shell;
- card system;
- artwork placement;
- workflow presentation;
- relative proportions.

If reference HTML/CSS exists for these screenshots, it is the preferred measurement source. The screenshots remain the final visual truth if rendered output contradicts implementation notes.

### 2.5 V2 preservation authority

The attached `DRAGONSWOOD-V2-TESTER-PORTALS.zip` remains authoritative for the existing V2 tester workflow and known traps. Its fixes and verifier lessons must be carried forward unless V3 deliberately replaces the underlying dependency.

### 2.6 This Bible

This document controls the V3 process, repository shape, gates, reporting, and promotion path.

---

## 3. Absolute Protection Rules

### 3.1 Current production

Until Jacob explicitly authorizes production promotion:

- do not edit production `index.html`;
- do not edit production `teacher.html`;
- do not rename, overwrite, replace, or delete either file;
- do not deploy V3 over the normal production URLs;
- do not change live Firestore rules for V3 convenience;
- do not migrate, delete, normalize, or rewrite live classroom data;
- do not test destructive or stat-changing actions on real students.

### 3.2 V2 tester pages

The current V2 tester pages remain protected reference artifacts:

- `index-v2.html`
- `teacher-v2.html`
- `dragonswood-v2-core.css`
- `dragonswood-v2-student.css`
- `dragonswood-v2-teacher.css`

Do not mutate the V2 tester package while building V3 unless Jacob separately requests a V2 fix.

### 3.3 Current V2 intentional fixes

Do not lose the lessons or behaviors represented by these known fixes:

- declarations for `battleUnsub` and `battleState`;
- deferred narrator loading so narration mounts after the body exists;
- teacher navigation for Shop & Redemptions and Quest Command;
- removal of the hard-hidden Shop Archive lock;
- removal of obsolete inline teacher sign-in styling;
- external stylesheets instead of embedded override blocks;
- verification of IDs, scripts, CSS coverage, markup, references, inline styling, and Shop reachability;
- gradebook calculations must use the correct `gameResults` data source;
- loading failures must never leave an indefinite black overlay;
- login and application shells must never remain visible simultaneously;
- account controls must occupy layout space and never float over page actions.

---

## 4. Approved Screenshot Inventory

The following screenshots are not loose inspiration. They define the V3 target experience.

### 4.1 Teacher portal reference pages

1. `dragonswood-teacher-01-student-command.jpg`
2. `dragonswood-teacher-02-gradebook.jpg`
3. `dragonswood-teacher-03-scribe-command.jpg`
4. `dragonswood-teacher-04-class-rewards.jpg`
5. `dragonswood-teacher-05-pass-control.jpg`
6. `dragonswood-teacher-06-guild-jobs.jpg`
7. `dragonswood-teacher-07-schedule.jpg`
8. `dragonswood-teacher-08-classroom-tools.jpg`
9. `dragonswood-teacher-09-leaderboards-final.jpg`

### 4.2 Student portal reference pages

1. `dragonswood-student-01-my-adventure-final.jpg`
2. `dragonswood-student-02-daily-missions-final.jpg`
3. `dragonswood-student-03-academic-games-final.jpg`
4. `dragonswood-student-04-scribe-arena-final.jpg`
5. `dragonswood-student-05-my-day-final.jpg`
6. `dragonswood-student-06-adventurer-hall-final.jpg`
7. `dragonswood-student-07-boss-battle-final.jpg`
8. `dragonswood-student-08-leaderboards-final.jpg`

### 4.3 What the screenshot set establishes globally

- Deep navy and midnight-purple fantasy environment.
- Warm gold display typography for Dragonswood titles.
- Electric violet and cyan accents for interactive states.
- Thin luminous borders rather than bulky light cards.
- A fixed/narrow left navigation rail.
- A compact top utility area that does not consume the page.
- Rich forest and magical-sky artwork visible behind content without impairing readability.
- Dense but organized teacher workspaces.
- More visual, character-forward, icon-rich student workspaces.
- Consistent page banners, cards, buttons, chips, tabs, status meters, and empty states.
- Strong first-viewport usefulness with minimal dead space.

---

## 5. Visual Specification: Shared Dragonswood System

### 5.1 Product identity

Dragonswood should feel like a polished storybook fantasy command center built specifically for a classroom—not a generic corporate admin dashboard with a purple background.

Desired qualities:

- magical;
- adventurous;
- warm;
- organized;
- trustworthy;
- rewarding;
- readable;
- mature enough for fourth and fifth graders;
- fast enough for classroom use.

Avoid:

- generic white SaaS cards;
- random neon gaming effects;
- excessively childish clip art;
- tiny decorative text;
- excessive empty space;
- fantasy ornament that obscures actions;
- unrelated pixel-art scales placed together without visual framing;
- multiple competing title treatments.

### 5.2 Shell geometry

The screenshots were captured at approximately 1348–1363 pixels wide and 926–936 pixels tall. Their geometry should be measured and translated into fluid CSS rather than copied as fixed desktop-only pixel coordinates.

Required shell behavior:

- left navigation remains narrow and stable;
- main content begins immediately after the rail with one intentional gutter;
- page title/header consumes only the height shown by the reference;
- utility controls occupy their own layout columns;
- no absolute-positioned account/pass control may cover page content;
- content width should expand intelligently without creating long unreadable lines;
- key actions should remain within the first viewport on a 1366 × 768 Chromebook;
- sticky elements must reserve or respect layout space.

### 5.3 Design tokens

Create a measured token system before styling pages:

- semantic colors;
- background and raised-surface colors;
- text and muted-text colors;
- gold/violet/cyan/success/warning/danger accents;
- spacing scale;
- type scale;
- border widths;
- radii;
- shadows and glows;
- sidebar and header dimensions;
- control heights;
- animation durations;
- content maximum widths;
- breakpoints.

Token values must be derived from the screenshots/reference CSS and recorded in `docs/DESIGN-SYSTEM.md`. Do not invent new values page by page.

### 5.4 CSS cascade

Declare cascade order explicitly:

```css
@layer reset, tokens, base, layout, components, utilities, states;
```

Rules:

- no `!important` unless Jacob explicitly approves one documented browser-specific exception;
- no HTML `<style>` blocks;
- no inline presentation styles for permanent UI;
- selectors should be component-scoped and low-specificity;
- state changes use attributes or clear state classes;
- utility classes must be documented and limited;
- page-specific CSS may not silently redefine shared components.

### 5.5 Typography

Use two coordinated families at most:

- a distinctive fantasy/display face for product and page titles;
- a highly readable interface face for controls, data, student instructions, and body text.

Requirements:

- student instructions must remain readable at normal Chromebook zoom;
- labels may not depend on all-caps at very small sizes;
- names and emails must wrap or truncate cleanly;
- numerical data must align predictably;
- headings must not grow so large that they displace important controls;
- fonts must be licensed and locally or reliably hosted.

### 5.6 Components

Create one approved implementation of each shared component:

- app shell;
- navigation item;
- product crest/title;
- page hero/banner;
- account control;
- pass/restriction control;
- primary/secondary/danger/quiet buttons;
- chips and status badges;
- cards and inset panels;
- tabs;
- meters and progress bars;
- data tables;
- student roster row;
- selection state;
- dialog/review sheet;
- toast/notification;
- loading skeleton;
- empty state;
- permission-denied state;
- recoverable error state.

Do not create a new visual version of a shared component on every page.

### 5.7 Motion and sound

Motion should support feedback and fantasy, not distract from instruction.

- animate meaningful state changes;
- keep interface transitions short;
- reserve larger animation for pets, bosses, rewards, and celebrations;
- provide reduced-motion behavior with `prefers-reduced-motion` ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion));
- do not rely on animation alone to communicate status;
- do not autoplay disruptive sounds;
- preserve narration and intentional SFX controls.

---

## 6. Teacher Portal Visual and Workflow Requirements

### 6.1 Shared teacher shell

The teacher screenshot set establishes:

- compact branded navigation rail;
- `DRAGONSWOOD COMMAND` gold product heading;
- small school/teacher context above or near the title;
- teacher identity presented cleanly without obscuring page actions;
- page-specific command banner below the global header;
- dark inset work surfaces with violet/cyan outlines;
- high information density without visual chaos;
- safe review/confirmation workflows for writes.

### 6.2 Student Command

Must provide:

- visible classroom attention/status summary;
- a real scrollable scholar roster;
- search and useful filters;
- persistent selected count;
- clear student selection states;
- command categories for rewards, corrections, custom changes, and management;
- compact action cards with exact effects visible;
- a review-before-write dock/dialog listing students and changes;
- additional confirmation for serious consequences;
- no hidden write triggered merely by clicking a visual card.

### 6.3 Gradebook

Must provide:

- compact gradebook header and refresh/export actions;
- high-level class metrics;
- category-weight visibility;
- readable table rows and status color legend;
- stable scroll behavior;
- explicit loading skeleton rather than page-blocking black overlay;
- visible empty/error/retry states;
- correct calculations from the intended result collection;
- no claim of synchronization until live Firestore reads are verified.

### 6.4 Scribe Command

Must provide:

- mission-builder form in the primary workspace;
- clear mission type, prompt, genre, length, and reward controls;
- a live writing-status panel;
- student-response workspace below;
- useful empty state when no writing mission is active;
- launch/close controls that cannot double-submit.

### 6.5 Class Rewards & Goals

Must provide:

- large class progress focus;
- compact editing controls;
- reward milestone cards;
- visible current/target values;
- clear progress meters;
- class milestones and status;
- controls appropriate for live classroom projection.

### 6.6 Pass Control

Must provide:

- pass queue and active/returned status clarity;
- student identity and request context;
- rapid approve/deny/return workflows;
- duplicate-action prevention;
- historical/archive access;
- no indefinite loading state;
- immediate confirmation of the resulting status.

### 6.7 Guild Jobs & Payroll

Must provide:

- payroll summary cards;
- class job roster with student, job, status, and pay;
- compact inline assignment controls;
- payroll preview;
- explicit approval before applying payroll;
- duplicate-payroll safeguards;
- transparent totals.

### 6.8 Schedule & Calendar

Must provide:

- daily timeline and class calendar side by side at desktop widths;
- add/edit controls that are not visually dominant;
- clear current day and selected day;
- classroom event details;
- save/copy actions with confirmation;
- sensible single-column stacking at smaller widths.

### 6.9 Classroom Tools

Must provide:

- tools grouped by purpose;
- recognizable icons;
- compact descriptions;
- fast launch behavior;
- no unorganized wall of buttons;
- teacher-only access enforcement independent of visual hiding.

### 6.10 Leaderboards

Must provide:

- visually strong podium;
- clear time-range controls;
- readable ranked list;
- reward-rule panel;
- duplicate-reward protection;
- avatar/identity display appropriate to the student audience;
- explicit state when insufficient data exists.

---

## 7. Student Portal Visual and Workflow Requirements

### 7.1 Shared student shell

The student screenshot set establishes:

- narrow left navigation with clear icons;
- crest and `DRAGONSWOOD` identity in the header;
- persistent Passes, Read Aloud, and profile controls in their own layout area;
- visible streak/progress element;
- deep enchanted-forest background;
- generous but efficient cards;
- gold display headings and highly readable instructions;
- prominent character and pet artwork;
- cyan/violet calls to action;
- clear separation between Explore and Organization destinations.

The shell must never allow Passes, restrictions, account controls, or narration controls to overlap the Dragonswood title.

### 7.2 My Adventure

Must provide:

- greeting and immediate next-step context;
- large adventurer/character card;
- active pet visible beside or near the adventurer;
- compact HP, gold, XP/level, and relevant stats;
- one dominant next action;
- class quest progress below;
- no obsolete legacy appearance controls;
- same equipped appearance and active pet used throughout the portal.

### 7.3 Daily Missions

Must provide:

- one-mission-at-a-time progress path;
- ordered Morning Math, Curriculum Quest, and Exit Quest;
- visible lock/completion/current states;
- estimated time and rewards;
- class reading and bonus challenge separated clearly;
- student-friendly language;
- no cold guessing in instructional activities;
- video-first unlock rules preserved where required;
- recovery progression kept in order.

### 7.4 Academic Games

Must provide:

- subject filter tabs;
- large visual game cards;
- short descriptions;
- clear play action;
- readable subject/category labels;
- consistent artwork scale;
- no misleading enabled state for unavailable games.

### 7.5 Scribe Arena

Must provide:

- current writing mission in plain language;
- spacious writing area;
- word/progress feedback;
- hint access that does not replace student thinking;
- writing coach feedback panel;
- portfolio summary and access;
- autosave/error visibility;
- no accidental duplicate submission.

### 7.6 My Day

Must provide:

- Yesterday/Today/Tomorrow navigation;
- readable daily timeline;
- current block emphasis;
- job card and job check-in;
- upcoming events;
- minimal scrolling at Chromebook size;
- accessible schedule status without visual clutter.

### 7.7 Adventurer Hall

Must provide:

- character presentation and class selection;
- Warrior, Ranger, Mage, and Healer only unless Jacob explicitly changes the roster;
- active pet selection separate from shop purchasing;
- equipped item summary;
- battle stats without removed crit/dodge/element systems;
- consistent gender/presentation choices controlled by the student’s approved appearance—not hard-coded stereotypes;
- one active animated pet at a time;
- clear locked/unlocked states;
- character changes reflected on Home, Hall, Scribe, and Boss pages.

### 7.8 Boss Battle

Must provide:

- dramatic boss identity and HP meter;
- visible student character and active pet;
- clear move choices;
- readable battle feedback;
- daily/reward context;
- no hints where the approved Daily Boss rules forbid hints;
- reduced-motion fallback;
- no unbounded animation or asset load on Chromebooks.

### 7.9 Leaderboards

Must provide:

- positive class-celebration framing;
- weekly/all-time choice;
- readable ranking and personal position;
- more-ways-to-shine panel so rank is not the only recognition;
- student privacy appropriate to the classroom;
- stable long-name handling.

---

## 8. Clean V3 Repository Architecture

Recommended repository name: `Dragonswood-V3` or `dragonswood-v3`.

```text
dragonswood-v3/
├── index.html
├── teacher.html
├── 404.html
├── favicon.svg
├── README.md
├── HANDOFF.md
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
│
├── css/
│   ├── layers.css
│   ├── tokens.css
│   ├── reset.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── states.css
│   ├── student.css
│   ├── teacher.css
│   └── print.css
│
├── js/
│   ├── config/
│   │   ├── environment.js
│   │   └── firebase-config.js
│   ├── services/
│   │   ├── auth-service.js
│   │   ├── firestore-service.js
│   │   ├── storage-service.js
│   │   ├── narration-service.js
│   │   └── error-service.js
│   ├── components/
│   │   ├── app-shell.js
│   │   ├── navigation.js
│   │   ├── dialog.js
│   │   ├── toast.js
│   │   ├── loading-state.js
│   │   └── empty-state.js
│   ├── student/
│   │   ├── student-app.js
│   │   ├── adventure.js
│   │   ├── missions.js
│   │   ├── games.js
│   │   ├── scribe.js
│   │   ├── day.js
│   │   ├── hall.js
│   │   ├── boss.js
│   │   └── leaderboards.js
│   └── teacher/
│       ├── teacher-app.js
│       ├── student-command.js
│       ├── gradebook.js
│       ├── scribe-command.js
│       ├── class-rewards.js
│       ├── passes.js
│       ├── jobs.js
│       ├── schedule.js
│       ├── tools.js
│       └── leaderboards.js
│
├── assets/
│   ├── branding/
│   ├── backgrounds/
│   ├── characters/
│   ├── pets/
│   ├── enemies/
│   ├── equipment/
│   ├── items/
│   ├── icons/
│   ├── audio/
│   └── fonts/
│
├── data/
│   ├── mock/
│   ├── seeds/
│   └── schemas/
│
├── docs/
│   ├── DESIGN-SYSTEM.md
│   ├── SCREEN-SPECIFICATIONS.md
│   ├── FEATURE-INVENTORY.md
│   ├── FUNCTION-MAP.md
│   ├── FIREBASE-DATA-MAP.md
│   ├── ASSET-INVENTORY.md
│   ├── ACCESSIBILITY.md
│   ├── PERFORMANCE-BUDGET.md
│   ├── SECURITY-AND-PRIVACY.md
│   ├── VISUAL-ACCEPTANCE.md
│   ├── FUNCTIONAL-ACCEPTANCE.md
│   ├── MIGRATION-LOG.md
│   └── TRAPS.md
│
├── tests/
│   ├── unit/
│   ├── rules/
│   ├── integration/
│   ├── visual/
│   └── accessibility/
│
└── tools/
    ├── verify.py
    ├── asset-audit.py
    ├── seed-emulators.js
    └── capture-reference-screens.js
```

### 8.1 Important architecture rules

- HTML files own semantic page shells and stable mount points.
- CSS files own visual presentation.
- JavaScript components own rendering and local interaction.
- services own Firebase access.
- page modules may call services but may not duplicate Firebase initialization.
- components must not know Firestore collection names.
- Firestore services must not manipulate page layout directly.
- authentication state must gate application mounting.
- every listener must have an unsubscribe/cleanup path.
- every async operation must have loading, success, error, and retry behavior.
- dynamic HTML must be safely created; do not insert untrusted student text as raw HTML.
- one subsystem owns each calculation and write path.

---

## 9. Environments and Data Isolation

### 9.1 Required environments

| Environment | Purpose | Data |
|---|---|---|
| Local emulator | Fast development and automated tests | Seeded fictional data |
| V3 staging Firebase project | Shared authenticated testing | Test accounts and sanitized data |
| Production Firebase project | Real classroom use | Live protected classroom data |

Firebase officially recommends separate projects for separate workflow environments, and specifically warns against using production data for development environments ([Firebase general best practices](https://firebase.google.com/docs/projects/dev-workflows/general-best-practices), [Firebase Hosting multisite guidance](https://firebase.google.com/docs/hosting/multisites)).

### 9.2 Environment configuration

Use explicit configuration, not manual code edits:

```js
export const ENVIRONMENT = 'staging';
```

or a hostname/config-file mapping that selects only approved public Firebase web configuration. Never place service-account credentials, private keys, or secrets in client-side code or GitHub.

### 9.3 Emulator requirements

Use emulators for:

- Authentication flows;
- Firestore reads/writes;
- Security Rules tests;
- seeded roster and student profiles;
- rewards and corrections;
- gradebook data;
- passes;
- shop and currency;
- duplicate-write tests;
- permission-denied and offline behavior.

Firestore rules should be tested with the emulator and rules unit testing tools ([Firebase rules testing](https://firebase.google.com/docs/firestore/security/test-rules-emulator)).

### 9.4 Staging data rule

Do not clone personally identifiable student data into staging. Use fictional names and synthetic values unless Jacob explicitly authorizes a carefully sanitized dataset.

---

## 10. Required Inputs Before Full Construction

Jacob or the project owner must provide or approve the following.

### 10.1 Required immediately

- this Bible;
- both approved screenshot ZIPs;
- the current V2 tester package;
- access to the newest production repository;
- exact production commit identified as functional authority;
- confirmation of the new V3 repository name;
- permission to create a separate staging Firebase project, or confirmation that emulator-only development should begin first.

### 10.2 Required before feature transplantation

- complete feature inventory;
- Firebase collection/document map;
- current Firestore rules and indexes;
- roles/account eligibility map;
- route/page inventory;
- list of known production bugs;
- current R2/Firebase Storage asset manifest;
- current narration map;
- asset ownership/license notes;
- test accounts or emulator account definitions.

### 10.3 Required asset package

- final crest/logo variants;
- favicon;
- backgrounds with focal-point notes;
- character sprites and animation metadata;
- pet sprites and animation metadata;
- boss/enemy art;
- equipment/items;
- subject and navigation icons;
- decorative panels/textures;
- fonts and license files;
- audio and narration;
- fallback images.

Every asset should record:

- stable asset ID;
- filename/path;
- category;
- visual family;
- intended screens;
- dimensions;
- frame layout;
- animation states;
- license/source;
- approval status;
- performance tier;
- fallback.

### 10.4 Decisions Jacob must approve

- exact display and body fonts;
- whether the screenshot palette is locked exactly or may be refined slightly;
- mobile priority beyond basic access;
- which features are launch-critical versus later;
- whether teacher/tester secret pets remain part of V3 launch;
- staging Firebase creation;
- final production promotion date.

---

## 11. Feature Inventory and Migration Classification

Every feature must be recorded in `docs/FEATURE-INVENTORY.md` with:

- feature name;
- user/role;
- current page;
- current source files/functions;
- Firestore reads;
- Firestore writes;
- required IDs/hooks;
- referenced assets;
- known bugs;
- V3 destination;
- launch priority;
- test owner;
- acceptance status.

Use these classifications:

- **Launch critical** — V3 cannot replace production without it.
- **Launch preferred** — important but not a blocker if Jacob explicitly defers it.
- **Post-launch** — intentionally scheduled later.
- **Teacher only** — inaccessible to students by both UI and authorization.
- **Tester only** — unavailable to normal production accounts.
- **Retired** — intentionally removed with Jacob’s approval.
- **Unresolved** — requires a decision.

Nothing disappears merely because it was omitted from a screenshot.

---

## 12. Build and Migration Phases

### Gate 0: Establish truth

1. Clone the newest production repository read-only for analysis.
2. Record commit hash and clean/dirty status.
3. Inventory all pages, modules, Firebase paths, IDs, routes, and assets.
4. Read V2 `HANDOFF.md`, `README-V2-PREVIEW.md`, `AUDIT-REPORT.md`, `ORIGINALS-NOT-DEPLOYED.txt`, `build.py`, and `verify.py` completely.
5. Extract known traps and fixes into V3 `docs/TRAPS.md`.
6. Do not code V3 features before this inventory is complete.

### Gate 1: Visual system prototype

1. Create V3 repository.
2. Build tokens, shared shell, components, and responsive rules.
3. Implement all 17 reference pages with representative mock data.
4. Implement every important UI state.
5. Do not connect production Firestore.
6. Capture screenshots at all required target sizes.
7. Compare against the approved references.
8. Obtain Jacob’s visual approval.

**Gate 1 exit:** Jacob confirms the V3 prototype is the definitive visual authority.

### Gate 2: Safe platform foundation

1. Configure Emulator Suite.
2. Create staging Firebase project if approved.
3. Add environment selection.
4. Implement central authentication service.
5. Implement central Firestore service.
6. Seed fictional users and classroom data.
7. Test roles and permission-denied behavior.

**Gate 2 exit:** student, teacher, and tester can authenticate safely without production data.

### Gate 3: Read-only feature transplantation

Connect read paths first:

- profile;
- class roster;
- appearance and pet;
- missions;
- schedule;
- gradebook results;
- passes;
- shop/inventory;
- jobs;
- leaderboards;
- rewards state.

Compare each V3 value to production behavior using controlled test fixtures.

**Gate 3 exit:** V3 renders correct data and handles loading, empty, offline, and permission errors.

### Gate 4: Controlled writes

Add writes in small groups:

1. profile preferences;
2. harmless student choices;
3. mission progress;
4. pass requests;
5. teacher pass actions;
6. rewards and corrections;
7. shop/currency;
8. jobs/payroll;
9. gradebook/overrides;
10. boss/reward systems.

Every write requires tests for:

- valid user;
- wrong role;
- invalid input;
- duplicate click;
- network interruption;
- partial failure;
- retry;
- visible success;
- auditability where appropriate.

### Gate 5: Full classroom flows

Test complete journeys rather than isolated buttons.

Student journey:

1. sign in;
2. load profile;
3. open today’s mission;
4. complete required progression;
5. update rewards/progress;
6. visit Hall/pet;
7. request pass;
8. sign out and return.

Teacher journey:

1. sign in;
2. load roster;
3. select students;
4. review and apply a reward;
5. open gradebook;
6. inspect Scribe;
7. manage pass;
8. inspect jobs/calendar;
9. verify leaderboard safeguards;
10. sign out and return.

### Gate 6: Performance, accessibility, and resilience

Run automated and manual checks. Lighthouse supports performance and accessibility audits on public and authenticated pages ([Chrome Lighthouse](https://developer.chrome.com/docs/lighthouse/overview)). Playwright supports screenshot comparison and browser testing ([Playwright visual comparisons](https://playwright.dev/docs/test-snapshots)).

### Gate 7: Production reconciliation

1. Freeze a production release candidate.
2. Compare current production with the original transplant commit.
3. Bring every newer approved production feature/fix into V3.
4. Rerun all gates.
5. Record exact migration differences.

### Gate 8: Promotion

1. Obtain explicit approval from Jacob.
2. Tag current production for rollback.
3. Export/verify any required configuration.
4. Deploy V3 static files.
5. Connect production configuration only in the approved release.
6. Run smoke tests on normal URLs.
7. Monitor errors and classroom-critical workflows.
8. Keep rollback immediately available.

---

## 13. Visual Verification Protocol

### 13.1 Required viewport matrix

Capture every major page at:

- 1440 × 900 desktop;
- 1366 × 768 Chromebook primary target;
- 1024 × 768 tablet landscape;
- 768 × 1024 tablet portrait;
- 390 × 844 phone.

### 13.2 Comparison method

For each approved desktop reference:

1. capture V3 with deterministic mock data;
2. normalize fonts and animation timing;
3. compare expected and actual screenshots;
4. inspect automated image difference;
5. manually inspect any allowed dynamic regions;
6. record variance and approval.

Playwright’s `toHaveScreenshot()` can store and compare reference screenshots in repeatable tests ([Playwright documentation](https://playwright.dev/docs/test-snapshots)).

### 13.3 Visual acceptance checklist

- global shell geometry matches;
- navigation width and rhythm match;
- product title does not dominate or collide;
- first viewport contains the same priority content;
- cards have consistent dimensions and padding;
- backgrounds have equivalent focal points and contrast;
- control colors/states are consistent;
- typography hierarchy matches;
- long names/emails do not break layout;
- no horizontal scrolling at target widths;
- dialogs remain centered and reachable;
- sticky controls do not cover content;
- loading/error/empty states look intentional;
- student pages retain more visual engagement than teacher pages;
- teacher pages retain higher usable density.

### 13.4 What an automated screenshot cannot prove

- correct Firestore data;
- correct permissions;
- correct writes;
- keyboard usability;
- screen-reader usability;
- acceptable classroom speed;
- clarity to a fourth-grade student;
- safety of a destructive teacher action.

---

## 14. Functional Verification Protocol

### 14.1 Static verification

The V3 verifier must check:

- JavaScript syntax;
- module import resolution;
- duplicate IDs;
- broken local references;
- unresolved assets;
- missing route destinations;
- missing labels/names for interactive controls;
- invalid or unbalanced markup;
- prohibited inline style blocks;
- prohibited `!important` rules;
- environment configuration safety;
- accidental production Firebase identifiers in development configuration;
- forbidden service-account/private-key patterns;
- source-map or debug artifact leakage where relevant.

### 14.2 Firebase rules tests

Test each protected operation as:

- signed out;
- normal student;
- different student;
- teacher;
- tester;
- unauthorized domain/account;
- malformed document write.

Security must be enforced by Firestore rules or trusted backend logic, never merely by hiding a button. Firestore rules can validate authentication, incoming data, and related documents ([Firebase rule conditions](https://firebase.google.com/docs/firestore/security/rules-conditions)).

### 14.3 Authentication tests

- initial signed-out state;
- popup and redirect behavior appropriate to supported browsers;
- return from Google sign-in;
- wrong-role handling;
- unauthorized account handling;
- session restoration;
- sign-out;
- account switch;
- permission-denied after authentication;
- login shell hidden after successful mount;
- app shell hidden before authorization succeeds.

### 14.4 Data and transaction tests

- correct collection/document paths;
- correct field names and defaults;
- missing/legacy field tolerance;
- atomic increments or transactions where required;
- duplicate submission protection;
- teacher review before material stat changes;
- accurate gradebook source arrays and weighting;
- payroll idempotency;
- reward duplication safeguards;
- consistent profile/pet/appearance across pages;
- listener cleanup on route/account changes.

---

## 15. Performance Bible

The screenshots may look rich without sending every asset to a Chromebook at startup.

### 15.1 Performance principles

- load only the active page module;
- load only the active character/pet animation where possible;
- do not preload entire asset packs;
- use modern compressed image formats;
- include image width/height to prevent layout shifts;
- lazy-load offscreen, noncritical images;
- never lazy-load the primary above-the-fold/LCP hero image;
- use responsive image sizes;
- pause animations when offscreen or tab-hidden;
- avoid giant JavaScript initialization on every page;
- unsubscribe unused Firestore listeners;
- cache stable registries and manifests sensibly;
- prefer CSS effects over large decorative raster overlays when appearance is equivalent.

Browser-native lazy loading is broadly supported and avoids extra JavaScript dependencies ([web.dev lazy loading](https://web.dev/articles/browser-level-image-lazy-loading)). The primary LCP image should not be lazy-loaded and may use high fetch priority ([web.dev Core Web Vitals guidance](https://web.dev/articles/top-cwv)).

### 15.2 Initial budgets to validate and tune

These are engineering targets, not promises until measured on the actual school devices:

- initial critical HTML/CSS/JS compressed transfer: aim below 500 KB excluding the principal visual asset;
- initial above-the-fold imagery: aim below 700 KB total;
- no single ordinary interface image above 300 KB without documented reason;
- no full pet/character pack loaded on startup;
- no blocking black loading overlay;
- meaningful loading skeleton visible quickly;
- interactive primary navigation within roughly 2.5 seconds on the target Chromebook/network under normal conditions;
- maintain stable layout while images and fonts load.

Use Lighthouse as a diagnostic tool, but also test on the real Chromebook and school network. A single score is not a substitute for observed classroom performance.

---

## 16. Accessibility and Student Readability

Minimum requirements:

- semantic buttons, links, headings, forms, tables, and dialogs;
- keyboard access to every teacher action;
- visible focus indicators;
- accessible names for icon-only buttons;
- sufficient text contrast over fantasy backgrounds;
- readable base font size;
- touch targets appropriate for student devices;
- no information communicated only by color;
- alt text for meaningful images;
- decorative artwork hidden from assistive technology;
- logical focus movement after dialogs and route changes;
- reduced-motion mode;
- text remains usable at 200% zoom;
- error messages identify the problem and recovery action.

Automated accessibility testing can catch issues such as insufficient contrast, missing labels, and duplicate IDs, but manual keyboard and screen-reader checks remain necessary ([Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)). Prefer native semantic controls; custom controls require deliberate keyboard behavior and labeling ([Chrome accessibility guidance](https://developer.chrome.com/docs/lighthouse/accessibility/custom-controls-labels)).

---

## 17. Security, Privacy, and Classroom Safety

- do not expose private teacher information in the student portal;
- do not log sensitive student writing or identity data unnecessarily;
- sanitize or safely render student-supplied text;
- keep authorization independent of the interface;
- use least-privilege Firestore rules;
- never commit service-account credentials;
- do not copy real classroom records to public fixtures;
- do not use student names in public screenshot baselines unless approved;
- distinguish test banners clearly from production;
- protect teacher/tester-only secret pets and tools with role enforcement, not visual hiding;
- serious consequences require a second explicit acknowledgement;
- every bulk stat-changing action must show the exact selected students and exact changes before committing;
- destructive data migration requires backup, exact scope, explicit authorization, and rollback.

---

## 18. Git and Release Strategy

### 18.1 Repositories

- Existing `Dragonswood`: production authority and fallback.
- New `Dragonswood-V3`: clean implementation.

Do not routinely copy entire ZIP overlays into either repository without reviewing the file manifest and diff.

### 18.2 V3 branches

- `main`: last accepted V3 staging release;
- `develop`: integrated work awaiting acceptance;
- focused branches such as `feature/student-shell` or `feature/gradebook`;
- tagged visual milestones such as `visual-v1-approved`;
- tagged release candidates and rollback points.

### 18.3 Pull/merge requirements

Before integration:

- clean working tree understood;
- changed-file list reviewed;
- automated verifier passes;
- visual tests pass or approved differences documented;
- functional tests for affected feature pass;
- no production configuration accidentally included;
- handoff updated.

---

## 19. Definition of Done

A page or feature is not done merely because it renders, parses, or resembles the screenshot.

It is done only when:

1. Its visual composition matches the approved reference.
2. It works at all required viewports.
3. It has loading, empty, error, success, and disabled states.
4. It is keyboard usable.
5. It works with emulator/staging data.
6. Its permissions are tested.
7. Its reads and writes are verified.
8. Duplicate actions are controlled.
9. Its assets meet the performance strategy.
10. It introduces no regression in already accepted pages.
11. Documentation and feature maps are updated.
12. Anything not verified is stated plainly.

The entire V3 release is not production-ready until both student and teacher end-to-end journeys pass and Jacob explicitly approves the appearance.

---

## 20. Mandatory Handoff Report Format

Every coding handoff must contain:

### Base

- repository;
- branch;
- starting commit;
- ending commit;
- whether the working tree was clean;
- authority documents read.

### Changes

- exact files changed;
- exact behaviors changed;
- visual components changed;
- data contracts touched;
- intentional differences from screenshots.

### Verification

- full verifier output;
- unit/integration/rules results;
- pages and viewports rendered;
- screenshot comparisons performed;
- authenticated roles tested;
- live/staging/emulator environment used;
- device/network tests performed.

### Not verified

State every untested area plainly. Never imply that static checks prove authenticated Firebase behavior or visual fidelity.

### Deployment

- exact files/configuration to deploy;
- GitHub changes;
- Firebase project/rules/index changes;
- Storage/R2 changes;
- environment selected;
- rollback commit/tag;
- post-deployment smoke tests.

---

## 21. Immediate V2 Rules While V3 Is Being Planned

The existing V2 tester workflow remains valid for examining the current bridge design.

### Protected production files

- `index.html`
- `teacher.html`

### V2 tester files

- `index-v2.html`
- `teacher-v2.html`
- `dragonswood-v2-core.css`
- `dragonswood-v2-student.css`
- `dragonswood-v2-teacher.css`

### V2 editing rules

1. Never delete or rename an existing required ID.
2. Do not add `<style>` blocks.
3. Do not add inline or external `!important` rules.
4. Put structural changes in `build-tools/build.py`.
5. Do not manually edit generated HTML when the generator owns the change.
6. Put intentional JS edits in `JS_PATCHES`.
7. Mirror approved JS differences in verifier `ALLOWED`.
8. Comment the precise bug being fixed.
9. Run:

```bash
python build-tools/build.py
python build-tools/verify.py
```

10. Do not claim completion without:

```text
RESULT: ALL GATES PASSED
```

11. State what was not tested with authenticated data.

### V2 warning

The current V2 pages use live production data. Merely visiting is generally read-only, but actions involving points, passes, grades, purchases, profiles, missions, or rewards may change real data. Prefer test accounts and avoid experimenting with real students.

---

## 22. One-Shot Prompt for a New Claude or ChatGPT Coding Thread

Copy the following with this Bible, both screenshot ZIPs, the current V2 package, and access to the newest production repository:

```text
You are beginning the controlled Dragonswood V3 project.

Read DRAGONSWOOD-V3-MASTER-BIBLE.md completely before taking any action. Then read every authority file it names, including the V2 handoff, verifier, build tool, audit, and traps. Inspect all 17 approved screenshot references. Do not summarize or edit until that reading is complete.

The existing jacobevans-cell/Dragonswood repository is the functional authority and production fallback. The approved teacher and student screenshot collections are the exact visual/workflow authority. This Bible is the architecture, safety, testing, and migration authority. Jacob's newest explicit instruction overrides older instructions.

Do not modify, rename, replace, or delete the production index.html or teacher.html. Do not write to live classroom data. Do not begin by copying legacy markup into a new stylesheet. Do not approximate the screenshots with late CSS overrides.

Create or work only in the clean V3 repository. Keep vanilla HTML, CSS, and JavaScript, Firebase Authentication, and Firestore. No React, Vue, Angular, Next.js, runtime bundler, or framework conversion. Development-only verification and screenshot tools are allowed, but the deployed output must remain static and build-free.

Begin with Gate 0: record the newest production commit and inventory every route, feature, required ID/hook, script/module, Firestore collection/document field, read/write path, role check, asset, and known bug. Extract all known V2 traps. Report inconsistencies before coding.

Then complete Gate 1 using deterministic mock data: reproduce the approved shared shells and all 17 reference screens. Derive and document exact design tokens and component measurements. Use external layered CSS, semantic HTML, reusable vanilla JavaScript components, and real supplied assets. Build loading, empty, error, disabled, selected, and responsive states. Do not connect production Firebase during the visual prototype.

Render and compare every major page at 1440x900, 1366x768, 1024x768, 768x1024, and 390x844. Use screenshot-difference tests plus manual inspection. Do not claim visual fidelity from syntax checks.

Stop at the visual approval gate and give Jacob live tester URLs or a safe preview artifact. Do not transplant writes, connect production data, or promote V3 until Jacob approves the complete visual system.

For every handoff, state the base commit, exact files changed, checks run, pages/viewports rendered, environment used, what was not verified, deployment requirements, and rollback point. Never say a Firebase workflow works unless it was tested in the stated environment.
```

---

## 23. First Action Checklist

Before anyone begins V3:

- [ ] Jacob selects the V3 repository name.
- [ ] New empty V3 repository is created.
- [ ] This Bible is placed at its root.
- [ ] Both screenshot ZIPs are stored as immutable references.
- [ ] Current V2 package is stored as an immutable reference.
- [ ] Newest production commit is recorded.
- [ ] Production repository is not modified.
- [ ] Gate 0 inventory begins.
- [ ] Staging Firebase project decision is made.
- [ ] Emulator Suite is configured.
- [ ] Fictional seed data is prepared.
- [ ] Asset inventory begins.
- [ ] Design tokens are measured from the references.
- [ ] Shared student and teacher shells are built with mock data.
- [ ] All 17 reference pages are reproduced.
- [ ] Jacob performs the visual approval review.
- [ ] Only then does functional transplantation begin.

---

## 24. Final Principle

HTML and CSS are not preventing Dragonswood from looking like the approved mockups. The limitation has been attempting to reconcile a clean, purpose-built visual design with a legacy production structure through incremental overrides.

V3 solves that problem by preserving production as the behavioral truth while giving the approved interface a clean structural home.

> Build the ideal Dragonswood first. Approve its complete visual language. Then reconnect each proven classroom system carefully, visibly, and testably—without gambling with the live portal or live student data.
