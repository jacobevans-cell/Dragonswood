# Production Delta Ledger — `1043751…` to `2258a321…`

## Current functional authority

- Repository: `jacobevans-cell/Dragonswood`
- Branch: `main`
- Frozen SHA: `2258a321077a39ca71e36409d9bc6a1fb5bb3ecc`
- Frozen ZIP and Git checkout were compared byte-for-byte and match.

## Four additional protected commits

1. `a681d60422524645c64d2a644ac9ce5b3e2beb2e` — removed student dependencies on retired V2 destinations.
2. `c156c1e3b18e7b83c24ad45e9a4dcb113a806fb6` — integrated current large standalone features into the current portal module shell.
3. `452ee8fcc9856e4f22477a024dfba3c6c3992d61` — removed module-presentation remnants and duplicate standalone headings.
4. `2258a321077a39ca71e36409d9bc6a1fb5bb3ecc` — retired seven disconnected V2 runtime files and added `v2-retirement-selftest.cjs`.

## Files affected

The delta changes 18 files. It adds `dragonswood-module-host.js`, `dragonswood-module-host.css`, `portal-modules-selftest.cjs`, and `v2-retirement-selftest.cjs`; updates current student/module pages and tests; and removes only the seven explicitly retired V2 runtime files.

## Migration consequence

- Do not restore `index-v2.html`, `teacher-v2.html`, or their retired CSS/runtime files.
- Preserve the current module host as functional evidence for how large features remain inside the portal shell.
- V3.3 still replaces the final presentation/navigation shell; the module host does not become the V3.3 visual authority.
- Seating Command remains a real teacher module and must receive a V3.3 home under Classroom Tools.
- All current production regression tests must remain green after transplantation.

## Stage 2-3 impact

The four commits do not alter student profile identity, teacher identity, Firebase SDK version, or the Stage 2-3 read-only contracts. They add later-stage navigation/module behavior only. The fictional Firebase identity matrix therefore remains the required gate before Stage 4.
