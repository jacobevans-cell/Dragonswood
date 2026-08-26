# Unified Math v56.27 + Grayson Mode v58 staging

These are verified donors on the isolated massive-integration branch. They are not live, not linked into V3.3, and their historical installers must not be run against the modern repository.

## Verified against frozen production

- Math v56.27: 29/29 hardening gates and all arithmetic-engine cases passed in a detached worktree at `2258a321077a39ca71e36409d9bc6a1fb5bb3ecc`.
- Grayson v58: 371/371 generator tests passed.
- Grayson v58 was applied after Math in the detached worktree and loaded exactly once on all 14 supported academic pages.
- The combined final intentionally uses `dragonswood-grayson-mode.js?v=58.0`; Math's intermediate `v=57.1` expectation is superseded by the later Grayson install.
- Grayson remains reward-free. Custom/Worksheet Math remains ineligible for Player XP or Gold.

## Integration rule

Unified Math belongs inside the V3.3 Academic Games route. Preserve current production module-host behavior and every later production feature; transplant the v56.27 behavior surgically rather than overwriting modern files with the old installer. V3.3 remains the visual/navigation authority.

Run the donor-only gate with:

```bash
bash tools/verify-staged-donors.sh
```
