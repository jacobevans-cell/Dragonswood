# V3.3 Isolated Manual Preview

This preview is an acceptance surface for the integration candidate. It is not
a deployment and it must not run from `main`.

## Start

```bash
bash v33-integration/tools/run-manual-preview.sh
```

Open port `4173` from the Codespace **Ports** tab and keep its visibility
**Private**. The launcher path is:

`/v33-integration/manual-preview.html`

## Safety boundary

- Student and teacher identities are fictional and browser-local.
- Arcade Token awards, locks, sessions, refunds, and audit entries use only
  local browser storage.
- The Arcade timer is a 30-minute preview timer and responds to the teacher
  class or individual lock across open tabs.
- Kingdom Wars uses its existing hidden local tester realm with a fictional,
  preview-only tester session. The real tester authentication module is not
  changed or bypassed.
- Existing production module pages are placed in a scriptless, formless iframe
  for visual inspection. Automated emulator and behavioral gates remain the
  authority for their runtime behavior.
- The preview server blocks Firebase and all other outbound connections with a
  restrictive Content Security Policy.
- No GitHub push, deployment, merge, or production write occurs.
