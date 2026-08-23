"""Palette-swap an appearance pack into new colourways.

The skins are anti-aliased 900x900 art with ~2,600 distinct colours, so a
find-and-replace on exact colours would leave halos. Instead this rotates hue
in HSV while preserving value (light/dark) and alpha, which keeps every
shadow, highlight and soft edge intact.

Skin tone is protected: pixels inside a narrow warm-hue, mid-saturation band
are left alone so the character's face and hands don't turn green with the
armour.
"""
from PIL import Image
import numpy as np
import os

def recolor(src, dst, hue_shift, sat_scale=1.0, protect_skin=True):
    im = Image.open(src).convert('RGBA')
    a = np.array(im).astype(np.float32)
    rgb, alpha = a[..., :3] / 255.0, a[..., 3:]

    mx = rgb.max(-1); mn = rgb.min(-1); df = mx - mn
    v = mx
    s = np.where(mx > 0, df / np.maximum(mx, 1e-6), 0)

    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    h = np.zeros_like(mx)
    nz = df > 1e-6
    idx = nz & (mx == r); h[idx] = ((g - b)[idx] / df[idx]) % 6
    idx = nz & (mx == g); h[idx] = ((b - r)[idx] / df[idx]) + 2
    idx = nz & (mx == b); h[idx] = ((r - g)[idx] / df[idx]) + 4
    h = (h / 6.0) % 1.0

    # Leave believable skin tones alone: warm hue, moderate saturation.
    keep = np.zeros_like(h, dtype=bool)
    if protect_skin:
        keep = (((h < 0.09) | (h > 0.96)) & (s > 0.15) & (s < 0.62) & (v > 0.45))

    h2 = np.where(keep, h, (h + hue_shift) % 1.0)
    s2 = np.where(keep, s, np.clip(s * sat_scale, 0, 1))

    i = np.floor(h2 * 6.0); f = h2 * 6.0 - i
    p = v * (1 - s2); q = v * (1 - f * s2); t = v * (1 - (1 - f) * s2)
    i = i.astype(int) % 6
    out = np.zeros_like(rgb)
    for k, (rr, gg, bb) in enumerate([(v,t,p),(q,v,p),(p,v,t),(p,q,v),(t,p,v),(v,p,q)]):
        m = i == k
        out[..., 0][m] = rr[m]; out[..., 1][m] = gg[m]; out[..., 2][m] = bb[m]

    res = np.concatenate([np.clip(out * 255, 0, 255), alpha], axis=-1).astype(np.uint8)
    Image.fromarray(res, 'RGBA').save(dst)
    return dst


# Six colourways that stay clearly distinct from each other and from the
# original. Beyond about six they start reading as the same costume.
# Hue values are rotations, not colour names — the resulting colour depends on
# what the source art already was, so preview before you name a pack.
VARIANTS = [
    ('var-a', 0.14, 1.10),
    ('var-b', 0.28, 1.15),
    ('var-c', 0.42, 1.15),
    ('var-d', 0.56, 1.20),
    ('var-e', 0.70, 1.15),
    ('var-f', 0.84, 1.20),
]

if __name__ == '__main__':
    import sys
    SRC = sys.argv[1] if len(sys.argv) > 1 else 'assets/rpg/skin-warrior-5.png'
    OUT = sys.argv[2] if len(sys.argv) > 2 else 'assets/rpg/recolored'
    os.makedirs(OUT, exist_ok=True)
    made = [SRC]
    for name, shift, sat in VARIANTS:
        made.append(recolor(SRC, f'{OUT}/skin-warrior-15-{name}.png', shift, sat))
        print(f'  {name:10s} hue +{shift:.2f}  sat x{sat}')

    # contact sheet
    ims = [Image.open(m).convert('RGBA') for m in made]
    w = 240
    sheet = Image.new('RGB', (w * len(ims), w), (18, 14, 30))
    for k, im in enumerate(ims):
        im = im.crop(im.getbbox()); im.thumbnail((w-16, w-16), Image.LANCZOS)
        sheet.paste(im, (k*w+(w-im.width)//2, (w-im.height)//2), im)
    sheet.save(f'{OUT}/_preview.png')
    print(f'\n{len(made)-1} recolours from 1 source -> _recolor_demo.png')
