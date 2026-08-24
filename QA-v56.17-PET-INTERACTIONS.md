# Dragonswood v56.17 Pet Interaction QA

## Automated checks completed

- [x] JavaScript parse: pet motion controller
- [x] JavaScript parse: pet registry
- [x] JavaScript parse: RPG data
- [x] Module parse: Adventurer Hall
- [x] Module parse: Daily Boss
- [x] Module parse: current Daily Quest
- [x] Balanced opening and closing script tags
- [x] Current v56.16 pet IDs, rarity data, notes, abilities, and prestige assets preserved
- [x] No Firestore schema or permission change introduced

## Browser smoke test after deployment

- [ ] Open Pet Sanctuary with no active pet; empty state is readable.
- [ ] Activate a pet; exactly one active pet remains.
- [ ] Tap PLAY; pet reacts and returns to idle.
- [ ] Tap SHOW ABILITY; pet reacts and ability text remains accurate.
- [ ] Hatch a new pet; reveal opens, celebrates, and closes.
- [ ] Hatch a duplicate; one Pet Token is awarded and explained.
- [ ] Complete Daily Quest; active pet celebrates without blocking the saved result.
- [ ] Enter Daily Boss; active pet appears with the scholar.
- [ ] Correct answer triggers pet attack; incorrect answer triggers defend.
- [ ] Boss victory triggers celebration and still awards only one daily chest.
- [ ] Test Chromebook width and `prefers-reduced-motion`.
