# Dragonswood Arcade v1.1 — Easy Visual Fixes

## Requested changes

### Dragon wing movement
- Void Runner's blocky 3D dragons now visibly flap their wings.
- Wing movement is modest while running and stronger while airborne.
- Wing tips move with the main wings.
- Dragon Dash's dragon-cube wings also get a subtle visual flutter.
- No player hitboxes, movement values, jump physics, gravity, or collision rules were changed.

### Falling tunnel panels
- Existing fragile Void Runner panels now telegraph their collapse with a short wobble.
- After the existing break timer, the panel cracks, detaches, tumbles outward into the void, and disappears after the animation.
- Falling panels begin appearing after the opening Explore level, with early levels biased toward the starting floor so the mechanic is learnable.
- Infinite mode begins introducing them slightly earlier.
- This reuses the existing fragile-tile gameplay system rather than adding a second collision system.

## Safety / scope
This is intentionally a small visual/game-feel patch. Arcade scoring, leaderboard rules, Firestore security, reward eligibility, progression, input buffering, and both games' core physics are unchanged.
