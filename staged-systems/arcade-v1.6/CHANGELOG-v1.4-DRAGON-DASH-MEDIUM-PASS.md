# Dragonswood Arcade v1.4 — Dragon Dash Medium Parity Pass

## Scope

This pass deliberately targets the previously classified normal/medium Dragon Dash systems while preserving Void Runner v1.3 and the Arcade leaderboard/reward boundary.

## Dragon Dash gameplay added

- Mini mode portal (`0.65x`) and full-size restore portal.
- Swing form with press-to-toggle gravity arc behavior and a Dragonswood winged visual.
- Linked teleport entry/exit portals.
- Reverse-direction portals with direction-aware camera follow and progress tracking.
- Free-fly on/off portals for open ship/wave/swing chambers.
- Floor slopes with playable slope collision.
- Moving platforms with configurable X/Y travel and period.
- Orbiting/rotating platforms with runtime collision and visual rotation.
- Dash Orb with configurable angle.
- Gravity Dash Orb.
- Spider Orb.
- Teleport Orb with linked target markers.
- Fourth built-in level, **Runestone Engine**, that exposes the new mechanics in normal gameplay.

## Editor foundation added

- Select mode.
- Shift-click multiselect.
- Drag selected objects.
- Arrow-key nudging; Shift+Arrow for fine nudging.
- Duplicate and Delete selection tools.
- Object group IDs.
- Object layers / Z-order.
- Apply group/layer to selection.
- Moving-platform placement controls.
- Rotating-platform placement controls.
- Slope objects.
- Mini/full, Swing, teleport, reverse, and free-fly portals.
- Dash/Gravity Dash/Spider/Teleport orbs.
- Move Trigger.
- Rotate Trigger.
- Spawn Trigger.
- Camera Zoom/Offset Trigger.
- Teleport Target object.
- Level metadata: name, creator, difficulty, description.
- Optional custom HTTPS music URL and song offset.

## Trigger/runtime behavior

- Move triggers tween grouped objects.
- Rotate triggers animate grouped object rotation.
- Spawn triggers can activate grouped triggers.
- Camera triggers tween target zoom and offsets.
- Objects render by layer.

## Intentionally compact equivalents

This is not a claim of full Geometry Dash 2.2 editor parity. v1.4 uses a deliberately smaller, classroom-friendly implementation:

- Rotating-platform collision uses a practical dynamic bounding box while the platform visually rotates/orbits; it is not a full rotated-surface solver.
- Dash behavior is a short fixed-duration line dash rather than reproducing every edge case of Geometry Dash dash-orb hold/release behavior.
- Trigger configuration uses a compact shared property strip rather than Geometry Dash's much larger per-trigger dialogs.
- Custom music accepts an optional user-provided HTTPS audio URL; no copyrighted Geometry Dash songs are bundled.

## Preserved

- Dragon cube visuals and wing flutter.
- Responsive press-down input buffering.
- Existing seven classic Dragon Dash forms.
- Practice checkpoints.
- v1.2 easy parity orbs/pads and fifth speed tier.
- Void Runner v1.3 geometry, branches, dragons, challenges, and saves.
- Arcade games still cannot directly grant Dragonswood rewards.
