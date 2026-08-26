# V3.3 Stage 4 Acceptance Gate

Stage 4 connects the approved V3.3 Daily Missions shell to the current
production Daily Quest and Curriculum Quest engines. This remains an isolated
candidate and does not deploy or modify `main`.

## Automated acceptance

Run from the repository root:

```bash
bash v33-integration/tools/run-stage-4-gate.sh
```

The gate must finish with all of the following:

- fictional Firebase project `demo-dragonswood-v33` only;
- embedded Daily Quest and Curriculum Quest authenticated in the emulator;
- current assignment read;
- Daily Quest progress persisted from in-progress to complete;
- canonical Curriculum evidence persisted;
- cross-student and unauthorized access denied;
- all 96 production scripts parsed;
- all 31 protected visual files unchanged;
- 8/8 student and 9/9 teacher routes at zero changed pixels.

Any failure stops acceptance. Do not commit, push, merge, deploy, or switch to
`main` after a failed or interrupted gate.

## Safety boundary

- `main` must remain `2258a321077a39ca71e36409d9bc6a1fb5bb3ecc`.
- The working branch must remain
  `massive-v33-integration-recovery-dd40cd4`.
- The package installer must begin from
  `9bfe2a19b730034f6919ca6c74fbff6ece531846`.
- Production-readonly embedded modules execute no scripts or forms.
- A passing gate authorizes only manual Stage 4 review on the isolated branch;
  it does not authorize production promotion.
