# Dragonswood v56.14 Pet QA Checklist

## Completed automatically

- [x] All 15 supplied canonical pet archives downloaded and ZIP-tested.
- [x] All 68 distinct source creatures cataloged and visually inspected.
- [x] No color-only duplicates treated as separate pets.
- [x] Eight deployed land/flying pet IDs mapped instead of duplicated.
- [x] Final registry contains 76 unique IDs.
- [x] Every imported creature has static WebP art and an optimized idle GIF.
- [x] Generated pet payload is about 5.4 MB; no raw sheets or source archives ship.
- [x] Student grid uses static lazy-loaded art; animations load only for active/detail views.
- [x] Reduced-motion preference uses still art.
- [x] True per-creature silhouettes are shown for undiscovered pets.
- [x] Search, rarity, habitat, discovery, and favorite filters implemented.
- [x] Discovery counter and progress meter implemented.
- [x] Detail view includes identity, rarity, habitat, nature, personality, unlock source, animation, and battle bonus.
- [x] One-active-pet rule preserved.
- [x] Existing ownership and active-pet IDs preserved without destructive migration.
- [x] Duplicate hatch creates exactly one Pet Token.
- [x] Every fifth Boss victory remains a 25% egg chance, not a guarantee.
- [x] Unlimited egg purchase UI absent and forged egg purchase receipts rejected by rules.
- [x] Legendary companions remain Level 10 locked.
- [x] Teacher visual pet manager supports search, filters, grant/remove, and one active pet.
- [x] Firestore favorites are limited to owned pets.
- [x] Student/teacher/boss/home JavaScript syntax passed.
- [x] All registry art references exist.
- [x] Prohibited deployed labels (`Hell`, `Demon`, `Devil`) absent from pet names/descriptions.
- [x] Monster V5 and V9 recorded as awaiting assets.

## Live test after upload

- [ ] Sign in with a student who already owns a legacy pet and confirm ownership/active state.
- [ ] Activate a new companion and confirm Home and Boss Battle update.
- [ ] Hatch once on a test account and verify either a new discovery or one token for a repeat.
- [ ] Verify a Level 9 account cannot hatch a legendary pet.
- [ ] Save/remove a favorite and reload.
- [ ] Use Teacher → Manage Student to grant, remove, and activate a pet, then save.
- [ ] Test desktop Chrome, Chromebook-width layout, mobile layout, and reduced motion.

