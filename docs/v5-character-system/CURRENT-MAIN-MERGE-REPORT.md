# V5.1 Tester Merge into Current Main

## Baseline

- GitHub repository: `jacobevans-cell/Dragonswood`
- Current-main commit represented by the source archive: `94675686ba38364b8dc63a4fa34be3b9c7274bdc`
- Source archive: `Dragonswood-main (6).zip`
- Source archive SHA-256: `9AA351DF2ADAD64AEC388AA49C3DCC00290477D76E237D4F55E68B900CAFC242`
- Local safety tag: `pre-v5-tester-main-9467568`
- Integration branch: `v5-tester-merge`

The source archive was checkpointed before any integration work. The V5 changes were then replayed from their original Git history so Git could retain non-overlapping September 3 changes automatically.

## Integrated release

- Exact tester account: `jacobicusjax@gmail.com`
- 80 character profiles
- Four classes
- Male and female presentation
- Radiant and Shadow paths
- Five milestone tiers: Levels 1, 5, 10, 15, and 20
- 560 production character assets: 480 animated WebP files and 80 static fallbacks
- 80 distinct idle loops
- Adventurer Hall, student portal, Daily Boss, and Kingdom Wars routing
- Per-account legacy rollback and global emergency rollback

The integration adds 568 files and modifies ten files relative to the current-main checkpoint. Nine modifications are the V5 runtime surfaces; the tenth updates a stale test assertion so it accepts the newer `58.2.3` runtime version already present in current main.

## Conflict resolution

Eight existing V5 target files merged automatically. `adventurer-hall.html` had one overlapping feature area. Its resolution retains all of the following:

- September 3 Achievement Badges navigation and rendering
- immersive confirmation dialogs
- current shop language and safe purchase failure handling
- V5 gender-first and eight-character selection
- V5 class-aware purchases and authentication state
- tester choose-again and legacy rollback controls

## Isolation hardening

V5 runtime resolution now requires both a valid V5 selection and the normalized email `jacobicusjax@gmail.com`. A non-tester profile cannot activate V5 by carrying or forging V5-shaped fields in client data. Daily Boss supplies the authenticated email to every character-resolution path.

Both Firestore rule sets independently require the exact tester email and restrict owner writes to the five V5 fields plus `updatedAt`.

## Verification results

All checks passed:

- Integration matrix: 80 profiles and 720 runtime asset paths
- Production catalog: 80 characters and 560 assets
- Production asset comparison: all 561 files under `assets/rpg/v5` (catalog plus assets) exactly match the accepted V5.1 handoff hashes
- Animation quality: 320 happy frames, four corrected Dawnscale walk tiers, Moonshadow level progression, and 80 idle loops
- JavaScript syntax: RPG runtime, student runtime, student app, world bridge, and Kingdom Wars
- Existing integration-core, student-world, and consolidated student-beta contract tests
- Local browser: gender-first flow, all eight choices for both genders, all five Dawnscale tiers with distinct idle/walk paths, all five Moonshadow tiers through Ascendant, loaded artwork, and zero browser console warnings/errors

## Rollback

The fastest tester rollback is the **Roll Back to Legacy** button in Adventurer Hall. It changes only the tester account's additive V5 fields and immediately restores the saved legacy class and appearance.

The global emergency rollback is one edit in `dragonswood-rpg-v56.js`:

```js
const v5Config=Object.freeze({enabled:false, ...});
```

The handoff also includes a current-main rollback overlay containing the nine original runtime files. V5 asset files may safely remain deployed because the disabled resolver never loads them.

## Deployment status

This build is local only. No production deployment, GitHub push, database migration, or other account change was performed.
