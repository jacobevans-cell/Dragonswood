# Dragonswood v56.11 test checklist

## Before testing

- [ ] Confirm v56.11 GitHub files are live.
- [ ] Publish v56.11 Firestore rules.
- [ ] Hard-refresh teacher and student browsers.
- [ ] Use a test student, not a live student, for purchase/hatch tests.

## Grade policy

- [ ] One 60% attempt displays 60%.
- [ ] A 60% first attempt followed by 100% displays 80%.
- [ ] A 90% first attempt followed by 70% still displays 90%.
- [ ] Teacher and student cumulative grades match.
- [ ] A future assignment does not lower a grade.
- [ ] An unassigned assignment does not lower a grade.
- [ ] A hidden assignment does not lower a grade.
- [ ] An excused assignment does not lower a grade.
- [ ] An assigned, visible, counted, past-due assignment with no attempt displays Missing and contributes zero.

## Security and rewards

- [ ] Clicking leaderboard rewards twice does not pay twice.
- [ ] The receiving student's Gold increases by the exact reward amount.
- [ ] One student cannot read another student's leaderboard reward ledger.
- [ ] A shop purchase removes the exact catalog price.
- [ ] A different-class item cannot be bought through a forged request.
- [ ] An unowned item cannot be equipped.
- [ ] Hatching consumes exactly one egg and adds exactly one new pet.
- [ ] Dragon, Gargoyle, and Elemental cannot hatch below Level 10.
- [ ] A rare boss goal find says teacher review pending.
- [ ] Approving it once adds exactly 25 goal points; approving again adds nothing.

## Regression

- [ ] Daily Quest completion and RPG reward still save.
- [ ] Curriculum Quest progress still resumes after refresh.
- [ ] Witches test saves a reading grade.
- [ ] Boss chest remains once per day.
- [ ] Class shop, appearance equip, active pet, and profile display still work.
