"""Build the full appearance-pack collection: 4 tiers x 3 characters x 4 classes.

Curated rather than exhaustive. 161 characters are available and a shop with
288 costumes is worse than one with 48 — the point is that a student browsing
the Class Shop sees a clear ladder, not a wall.

Each tier is three genuinely different characters, not recolours, so nothing
looks like filler. Art gets visibly more elaborate as the level gate rises.
"""
import os, json, sys
from PIL import Image, ImageDraw

SHOTS  = '/tmp/dw/chars/_shots'
GAME   = '/tmp/dw/fix/assets/rpg'
CANVAS = 900

# class -> level -> [(shot file, shop name), ...]
TIERS = {
 'warrior': {
   5:  [('medieval-king-defender-and-sergeant~Medieval-Sergeant', 'Ironwatch Sergeant'),
        ('spartan-knight-and-warrior~Greek-Warrior',              'Bronze Hoplite'),
        ('viking~Viking-3',                                       'Northvale Raider')],
   10: [('girl-knight~Girl-Knight-1',                             'Silverbrand Knight'),
        ('spartan-knight-and-warrior~Spartan-Knight-with-Spear',  'Phalanx Spearguard'),
        ('samurai~Samurai-1',                                     'Azure Bushi')],
   15: [('medieval-king-defender-and-sergeant~Medieval-King',     'Crowned Sovereign'),
        ('armored-knight~Templar-Knight',                         'Order Templar'),
        ('amazon-warrior~Amazon-Warrior-3',                       'Goldshield Amazon')],
   20: [('frost-knight~Frost-Knight-1',                           'Rimeguard Sovereign'),
        ('frost-knight~Frost-Knight-2',                           'Glacierborn Vigil'),
        ('frost-knight~Frost-Knight-3',                           'Winterlight Champion')],
 },
 'ranger': {
   5:  [('free-forest-ranger~Forest-Ranger-1',                    'Greenhood Scout'),
        ('archer-barbarian-mage~Archer-Guy',                      'Crimsonmask Archer'),
        ('elf-archer~Archer-1',                                   'Palewood Elf')],
   10: [('ninja-and-assassin~Black-Ninja',                        'Nightpetal Shinobi'),
        ('ninja-and-assassin~White-Ninja',                        'Snowveil Shinobi'),
        ('elf-archer~Archer-2',                                   'Emberbraid Elf')],
   15: [('free-forest-ranger~Forest-Ranger-3',                    'Antlerhelm Tracker'),
        ('free-forest-ranger~Forest-Ranger-2',                    'Thornmantle Ranger'),
        ('ninja-and-assassin~Assassin-Guy',                       'Silent Blade')],
   20: [('forest-guardian~Forest-Guardian-1',                     'Heartwood Warden'),
        ('forest-guardian~Forest-Guardian-2',                     'Stonebark Sentinel'),
        ('forest-guardian~Forest-Guardian-3',                     'Mosscrown Keeper')],
 },
 'mage': {
   5:  [('human-magician~Human-Magician-1',                       'Apprentice Conjurer'),
        ('archer-barbarian-mage~Medieval-Mage',                   'Bluepeak Spellcaster'),
        ('human-magician~Human-Magician-3',                       'Stormcuff Adept')],
   10: [('magician-girl~Magician-Girl-1',                         'Emberhair Sorceress'),
        ('chibi-technomage~Technomage-2',                         'Voltcore Technomage'),
        ('magician-girl~Magician-Girl-3',                         'Violet Enchantress')],
   15: [('chibi-winter-witch~Winter-Witch-1',                     'Frostcrown Witch'),
        ('chibi-technomage~Technomage-3',                         'Aegiscore Technomage'),
        ('magician-girl~Magician-Girl-2',                         'Silverfrost Sorceress')],
   20: [('elemental-spirits~Elemental-Spirits-1',                 'Tidecaller Ascendant'),
        ('elemental-spirits~Elemental-Spirits-2',                 'Emberheart Ascendant'),
        ('elemental-spirits~Elemental-Spirits-3',                 'Wildhorn Ascendant')],
 },
 'healer': {
   5:  [('villager~Villager-2',                                   'Hearthside Helper'),
        ('citizen~Citizen-3',                                     'Village Apprentice'),
        ('priest~Priest-1',                                       'Chapel Novice')],
   10: [('gnome~Gnome-2',                                         'Tinkerbrew Gnome'),
        ('old-hero~Old-hero-2',                                   'Greybeard Mentor'),
        ('desert-nomad~Desert-Nomad-1',                           'Dunewalker Healer')],
   15: [('chibi-spiritual-monk~Spiritual-Monk-2',                 'Saffron Monk'),
        ('human-shaman~Human-Shaman-1',                           'Sunmark Shaman'),
        ('shaman~Shaman-2',                                       'Ramhorn Shaman')],
   20: [('free-seer~Seer-1',                                      'Golden Oracle'),
        ('free-seer~Seer-2',                                      'Shadow Seer'),
        ('chibi-time-keeper~Time-Keeper-2',                       'Keeper of Hours')],
 },
}

# Cost climbs with the gate; three packs at a level share a price.
COST = {5: 225, 10: 450, 15: 675, 20: 900}
RARITY = {5: 'rare', 10: 'epic', 15: 'legendary', 20: 'mythic'}

def to_canvas(src, dst):
    im = Image.open(src).convert('RGBA')
    bb = im.getbbox()
    if bb: im = im.crop(bb)
    im.thumbnail((int(CANVAS*.62), int(CANVAS*.62)), Image.LANCZOS)
    c = Image.new('RGBA', (CANVAS, CANVAS), (0,0,0,0))
    c.paste(im, ((CANVAS-im.width)//2, int(CANVAS*.835)-im.height))
    c.save(dst)

built, missing = [], []
for klass, levels in TIERS.items():
    for lvl, picks in levels.items():
        for slot, (shot, name) in enumerate(picks, start=1):
            src = f'{SHOTS}/{shot}.png'
            if not os.path.exists(src):
                missing.append(shot); continue
            fname = f'skin-{klass}-{lvl}' + ('' if slot == 1 else f'-{chr(96+slot)}') + '.png'
            to_canvas(src, f'{GAME}/{fname}')
            built.append({'classId': klass, 'level': lvl, 'slot': slot,
                          'name': name, 'file': fname,
                          'cost': COST[lvl], 'rarity': RARITY[lvl], 'source': shot})

json.dump(built, open('/tmp/dw/chars/appearance-manifest.json','w'), indent=1)
print(f'{len(built)} appearance packs built' + (f'   MISSING {len(missing)}' if missing else ''))
for m in missing: print('   missing:', m)
for k in TIERS:
    print(f'  {k:8s} ' + '  '.join(f'L{l}:{sum(1 for b in built if b["classId"]==k and b["level"]==l)}'
                                   for l in (5,10,15,20)))

# preview sheet, grouped by class then level
cols, cell = 6, 210
rows = (len(built)+cols-1)//cols
sheet = Image.new('RGB', (cols*cell, rows*cell+28), (18,14,30))
d = ImageDraw.Draw(sheet)
d.text((10,8), f'APPEARANCE PACK COLLECTION  —  {len(built)} packs  |  4 classes x 4 tiers x 3',
       fill=(255,215,102))
COLOR = {'warrior':(239,155,69),'ranger':(84,216,148),'mage':(183,108,255),'healer':(101,223,241)}
for i,b in enumerate(sorted(built, key=lambda x:(list(TIERS).index(x['classId']), x['level'], x['slot']))):
    im = Image.open(f'{GAME}/{b["file"]}').convert('RGBA')
    bb = im.getbbox()
    if bb: im = im.crop(bb)
    im.thumbnail((cell-26, cell-46), Image.LANCZOS)
    x,y = (i%cols)*cell, 28+(i//cols)*cell
    sheet.paste(im, (x+(cell-im.width)//2, y+3), im)
    d.text((x+4, y+cell-32), b['name'][:26], fill=(238,236,246))
    d.text((x+4, y+cell-18), f'{b["classId"]}  L{b["level"]}  {b["cost"]}g', fill=COLOR[b['classId']])
sheet.save('/tmp/dw/appearance-collection.png')
print('\npreview -> /tmp/dw/appearance-collection.png')
