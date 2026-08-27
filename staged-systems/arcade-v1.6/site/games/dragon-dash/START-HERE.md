# START HERE — Dragon Dash

## Fastest test

1. Keep this entire folder together.
2. Double-click `index.html`.
3. Click **PLAY** and choose **First Flight**.

If your browser blocks local-file behavior, serve the folder instead:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## What this build is

This is a playable from-scratch rhythm-platformer engine designed to closely reproduce the *gameplay language* of Geometry Dash without copying RobTop's protected art, songs, level layouts, branding, or proprietary source.

The engine already supports:

- Cube
- Ship
- Ball
- UFO
- Wave
- Robot
- Spider
- Gravity portals
- Speed portals
- Jump orbs
- Jump pads
- Blocks
- Spikes
- Saws
- Practice checkpoints
- Instant death/restart
- Attempt counter
- Progress percentage
- Original synthesized rhythm music/SFX
- Three built-in levels
- Built-in custom level editor
- Local save/load
- Touch, mouse, and keyboard input

## Files to know

- `index.html` — app shell
- `styles.css` — menus and interface
- `game.js` — complete current game engine, renderer, levels, audio, editor, and input logic
- `assets/` — original replacement SVG artwork
- `FEATURE-PARITY-ROADMAP.md` — what remains before claiming broad modern feature parity
- `QA-REPORT.md` — verification performed on this package
- `LEGAL-SCOPE.md` — exactly what was intentionally not copied

## Core rule for future work

Preserve the existing playable engine as the base. Extend it. Do not replace it with an older GitHub clone or introduce official Geometry Dash assets, songs, levels, or proprietary source code.
