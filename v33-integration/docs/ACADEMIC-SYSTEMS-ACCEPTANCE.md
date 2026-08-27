# V3.3 Academic Systems Wave Acceptance

This combined wave covers grading/Recovery contracts, student and teacher
Scribe, live gradebook reporting, and every current Academic Game destination.
It remains isolated and does not deploy or modify `main`.

## Automated acceptance

Run from the repository root:

```bash
bash v33-integration/tools/run-academic-systems-gate.sh
```

The gate must pass all of these together:

- fictional Auth and Firestore identities only;
- Daily + Curriculum Stage 4 regression;
- Scribe draft, one-time submission, ownership isolation, teacher launch, and
  teacher review persistence;
- gradebook aggregation across Daily, Curriculum, and Reading/Game evidence;
- reward caps and the complete 11-destination Academic Game catalog;
- `gradeAcademicAnswer` and `gradeWriting` backend contracts;
- all 96 production scripts parsed;
- all 31 protected visual files unchanged;
- 8/8 student and 9/9 teacher routes at zero changed pixels.

Any failure stops installation before the isolated branch is changed.

## Safety boundary

- Base branch: `massive-v33-integration-recovery-dd40cd4`.
- Required base HEAD: `fc6298808affc7faa642a8605cccb96fb96bce47`.
- Frozen `main`: `2258a321077a39ca71e36409d9bc6a1fb5bb3ecc`.
- Writes are enabled only against `demo-dragonswood-v33`.
- Passing authorizes an isolated candidate commit only—never a push, merge,
  deployment, live Functions release, or production-rules promotion.
