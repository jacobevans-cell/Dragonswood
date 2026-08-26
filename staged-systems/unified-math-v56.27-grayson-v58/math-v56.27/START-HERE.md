# START HERE — Math Operations Hardening v56.27

This package takes the useful, low-risk findings from the Claude audit and turns them into a production-ready follow-up.

## What it fixes

- Includes Claude's already-verified debug corrections whether or not you applied Claude's patch first.
- Custom / Worksheet Mode **never awards Dragonswood Player XP or Gold**. It may still track local Quest Points in Normal/Hard.
- A solved worksheet problem cannot simply reload itself as the "next" problem. The app clears the board and waits for new worksheet numbers.
- Normal/Hard reject deliberately trivial custom problems; Easy still allows them for scaffolded practice.
- Custom problems are capped at 18 coached steps so a single problem cannot become a 40-step wall.
- Random Division now introduces remainders in later rounds: Round 1 stays exact, Round 2 has ~35% remainder problems, Round 3 ~60%.
- Teacher data records the actual solved count and round solved count instead of a hard-coded 10.
- Reward claims get a stable per-run/per-round ID and detect an already-saved claim before adding XP/Gold again.
- Practice mode and operation choices lock after a round starts, preventing mode-switch reward exploits.
- Mixed mode is restored after leaving Custom mode.
- Keyboard focus moves to the next-action button after each completed problem.
- The active algorithm step now exposes `aria-current="step"`.
- Place-value labels remain visible on small screens.
- Grayson Mode cache references are bumped together to `v=57.1`.
- Math Operations cache version becomes `56.27.0`.

## Deliberately NOT included

The audit's `INT-2` daily-XP-cap Firestore issue is real, but it affects the **shared academic-game reward contract**, not just this math app. Fixing it correctly requires migrating every academic game to the same server-day key. This package does not make a narrow rules change that could break Fraction Forge, Daily Boss, or legacy games tomorrow.

See `docs/SECURITY-FOLLOWUP.md`.

## Apply

From a clean Dragonswood Codespace:

```bash
unzip DRAGONSWOOD-MATH-OPERATIONS-HARDENING-v56.27.zip -d /workspaces/dragonswood-installers/
bash /workspaces/dragonswood-installers/DRAGONSWOOD-MATH-OPERATIONS-HARDENING-v56.27/APPLY-HARDENING.sh --push
```

The installer creates a rollback branch before touching files, verifies the math engine, runs 29 hardening gates, commits, and optionally pushes.
