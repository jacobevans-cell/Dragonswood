# Dragon Dash

Dragon Dash is a from-scratch browser rhythm-platformer inspired by the *mechanical genre* popularized by Geometry Dash. It does **not** include Geometry Dash source code, official art, levels, music, logos, names, or ripped game assets.

## What is included

- Responsive HTML5 Canvas game
- Desktop and touch controls
- Auto-run gameplay and instant restart loop
- Cube mode
- Ship mode
- Ball mode
- UFO mode
- Wave mode
- Robot mode
- Spider mode
- Gravity portals
- Speed portals
- Yellow and blue jump orbs
- Yellow and blue jump pads
- Blocks, spikes, saws, portals, finish gates
- Normal and Practice mode
- Automatic and manual practice checkpoints
- Attempt counter and completion percentage
- Procedurally drawn backgrounds, particles, screen shake and original synthesized music/SFX
- Three original built-in levels
- Built-in grid level editor
- Local save/load for custom levels
- Custom level test-play
- Original SVG replacement assets
- Optional hitbox visualization

## Run it

The simplest route is to serve this folder with any static web server:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

Most modern browsers will also open `index.html` directly, but a local web server is more reliable.

## Input responsiveness update

This build uses press-down input for mouse, touch, and keyboard, a short 90 ms action buffer, and a 40 ms ground-contact grace window. Raised platforms now count as valid grounded surfaces for cube/robot jumps. Multiple simultaneous input sources are tracked independently so releasing touch does not cancel a held keyboard input (or vice versa).

## Controls

- Space / Up / W / click / touch: action
- R: restart
- Escape or P: pause
- C: manual practice checkpoint
- Backspace: remove newest practice checkpoint

Editor:

- Left click: place
- Right click: erase nearest object
- Mouse wheel or A/D: pan
- Shift + mouse wheel: faster pan

## Important scope note

This package intentionally recreates **gameplay concepts**, not copyrighted expression. To move it closer to feature parity, extend the engine with additional original triggers, decorations, editor tools, game modes, level metadata and original audio/art rather than importing copyrighted Geometry Dash resources.
