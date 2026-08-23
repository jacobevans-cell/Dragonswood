"""Build the Level 20 appearance tier.

Levels 16-20 currently give a student nothing at all: the highest appearance
pack gates at 15, the highest gear at 10. That is roughly 4,650 XP — about 31
school days — of climbing with no reward, and the students who reach it are the
ones who worked hardest.

This installs one Level 20 appearance pack per class, plus two recoloured
variants of each so two students who both reach 20 don't look identical.
"""
import os, sys, shutil
from PIL import Image
sys.path.insert(0, '/tmp/dw/assets')
from recolor import recolor

SHOTS = '/tmp/dw/chars/_shots'
GAME  = '/tmp/dw/fix/assets/rpg'
CANVAS = 900          # matches every existing skin-*.png

# class -> (source character, pack name shown in the shop)
TIER20 = {
    'warrior': ('paladin~Paladin-1.png',                 'Dawnward Paladin'),
    'ranger':  ('elf-archer~Archer-1.png',               'Silverwood Sentinel'),
    'mage':    ('chibi-winter-witch~Winter-Witch-1.png',  'Hoarfrost Sovereign'),
    'healer':  ('priest~Priest-3.png',                    'Aurelian Keeper'),
}
# two extra colourways per class so a shared level doesn't mean a shared look
VARIANTS = [('i', 0.34, 1.12), ('ii', 0.62, 1.15)]

def to_canvas(src, dst):
    """Normalise onto the 900x900 canvas the game already expects."""
    im = Image.open(src).convert('RGBA')
    bb = im.getbbox()
    if bb: im = im.crop(bb)
    im.thumbnail((int(CANVAS * .62), int(CANVAS * .62)), Image.LANCZOS)
    canvas = Image.new('RGBA', (CANVAS, CANVAS), (0, 0, 0, 0))
    canvas.paste(im, ((CANVAS - im.width) // 2, int(CANVAS * .835) - im.height))
    canvas.save(dst)
    return dst

made = []
for klass, (shot, name) in TIER20.items():
    src = f'{SHOTS}/{shot}'
    if not os.path.exists(src):
        print(f'  MISSING {src}'); continue
    base = f'{GAME}/skin-{klass}-20.png'
    to_canvas(src, base)
    made.append((klass, 20, name, os.path.basename(base)))
    for suffix, hue, sat in VARIANTS:
        out = f'{GAME}/skin-{klass}-20-{suffix}.png'
        recolor(base, out, hue, sat)
        made.append((klass, 20, f'{name} {suffix.upper()}', os.path.basename(out)))

print(f'{len(made)} Level 20 skins installed\n')
for k, lvl, n, f in made:
    print(f'  {k:8s} L{lvl}  {n:26s} {f}')

# contact sheet so Jacob can see them before they go live
cols, cell = 6, 220
rows = (len(made) + cols - 1) // cols
sheet = Image.new('RGB', (cols*cell, rows*cell + 30), (18, 14, 30))
from PIL import ImageDraw
d = ImageDraw.Draw(sheet)
d.text((10, 9), f'LEVEL 20 APPEARANCE TIER  —  {len(made)} packs, {len(TIER20)} classes',
       fill=(255, 215, 102))
for i, (k, lvl, n, f) in enumerate(made):
    im = Image.open(f'{GAME}/{f}').convert('RGBA')
    bb = im.getbbox()
    if bb: im = im.crop(bb)
    im.thumbnail((cell-30, cell-52), Image.LANCZOS)
    x, y = (i % cols)*cell, 30 + (i//cols)*cell
    sheet.paste(im, (x + (cell-im.width)//2, y + 4), im)
    d.text((x+5, y+cell-32), n[:26], fill=(238, 236, 246))
    d.text((x+5, y+cell-18), k, fill=(150, 145, 170))
sheet.save('/tmp/dw/tier20-preview.png')
print('\npreview -> /tmp/dw/tier20-preview.png')
