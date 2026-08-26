# Grayson Mode Academic Basis — v58.0

Grayson Mode is an optional, reward-free Grade 7–10 academic challenge layer. It does **not** replace assigned fourth- or fifth-grade instruction, affect required progress, grades, XP, Gold, game rewards, or Daily/Curriculum completion.

## Non-negotiable design rules

- Most challenges must match the **current visible subject/topic or academic game**.
- The engine re-detects context before every challenge so Daily Quest and Curriculum Quest can change subjects without reloading the page.
- Difficulty must come from real Grade 7–10 reasoning and structure, not giant numbers or unexplained vocabulary.
- Every problem has a deterministic answer, four answer choices, a prerequisite mini-lesson, and a worked explanation.
- Grade band cycles through Grades 7 → 8 → 9 → 10.
- Every third challenge is a harder **cross-subject Math/Science challenge**:
  - Math current topic → Science cross-subject challenge.
  - Science current topic → Math cross-subject challenge.
  - ELA/History → alternates Math and Science.
- Cross-subject questions stay inside Grades 7–10 and include the teaching needed to attempt them.
- A visible **GIVE UP / SKIP → NEXT** control is always available.
- Skip is immediate, tracked separately, and carries no penalty.
- Students may close Grayson Mode at any time without penalty.
- Grayson Mode remains entirely reward-free.

## Current-topic families

### Math
- Multi-step expressions and integer/rational reasoning
- Division and quotient/remainder reasoning
- Fractions and rational equations
- Decimals, percentages, percent change
- Linear equations and introductory factorable quadratics
- Geometry, Pythagorean theorem, dilation/area scaling

### Science
- Chemistry: ions, atomic structure, density
- Physics: Newton's second law and kinetic energy
- Astronomy: speed and Kepler-style orbital-period reasoning
- Biology: genetics and trophic-level energy transfer

### ELA
- Reading inference and rhetorical analysis
- Grammar, clauses, punctuation, sentence structure
- Argumentative thesis/evidence reasoning

### History / Social Studies
- Source analysis, corroboration, audience, purpose, and evidence

## Context matching

The engine inspects the current page name/title and visible active/current problem text. Known games have strong topic overrides (Fractions, Decimals, Division, Chemistry, Space/Physics, Spelling/Language, Reading). Daily Quest and Curriculum Quest use their currently visible subject/problem text.

## Cross-subject rationale

Grayson Mode is meant to be an extreme optional challenge, so periodic domain switching is intentional. However, cross-subject questions are not cold guesses: each still contains a concise prerequisite lesson and stays within the defined Grade 7–10 band.

## Reward policy

`rewardFree: true` is part of the engine contract. Grayson Mode must never write Dragonswood game results, XP, Gold, grades, completion, or required progress.
