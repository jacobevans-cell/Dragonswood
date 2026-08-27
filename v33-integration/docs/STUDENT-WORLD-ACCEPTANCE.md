# V3.3 Student World Wave Acceptance

This combined wave covers My Day, weekly Guild Job check-off, the full
Adventurer Hall/Pet Sanctuary, Daily Boss, and student leaderboards. It remains
isolated and does not deploy or modify `main`.

## Automated acceptance

Run from the repository root:

```bash
bash v33-integration/tools/run-student-world-gate.sh
```

The gate must pass all of these together:

- all inherited Stage 4 and Academic Systems Firebase/browser checks;
- live schedule, event, assigned-job, and weekly job persistence;
- full pet registry and motion-controller Hall loading in the fictional
  emulator, with ownership and Gold constraints;
- Morning + Exit gated Daily Boss loading and one-chest reward caps;
- weekly best-score leaderboard calculation and daily reward marker;
- all 96 production scripts parsed and 31 protected visual files unchanged;
- 8/8 student and 9/9 teacher routes at zero changed pixels.

The gate preflights `rg`, Node, Python, Pillow, Playwright, and Chromium before
starting Firebase. Any failure stops installation before the isolated branch
is changed.

## Safety boundary

- Base branch: `massive-v33-integration-recovery-dd40cd4`.
- Required base HEAD: `2c0fd7457470d1abb709879473c46e02df38276f`.
- Required base tree: `b5abb99927574d412a3af9ed4f8f6c250b3779a9`.
- Frozen `main`: `2258a321077a39ca71e36409d9bc6a1fb5bb3ecc`.
- Writes are enabled only against `demo-dragonswood-v33`.
- Passing authorizes one isolated candidate commit only—never a push, merge,
  deployment, live-rules promotion, or change to `main`.
