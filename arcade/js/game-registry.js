export const GAMES = [
  {
    id: 'dragon-dash',
    title: 'Dragon Dash',
    subtitle: 'Runes. Spikes. No Brakes.',
    kicker: 'DON’T HIT THAT!',
    description: 'Tap to move your tiny dragon-cube. Dodge the spikes, follow the beat, and try not to crash. Think you can make a better level? Build your own!',
    button: 'START THE DASH',
    path: 'games/dragon-dash/index.html?arcade=1',
    art: 'assets/veil/game-card-tiles/veil-card-bg-dragon-dash-1200x660.webp',
    className: 'dash',
    tags: ['One Button', 'Build a Level', 'Feels Like: Geometry Dash'],
    boards: ['dragon-dash']
  },
  {
    id: 'void-runner',
    title: 'Void Runner',
    subtitle: 'Wait…Which Way Is Down?',
    kicker: 'GRAVITY IS OPTIONAL.',
    description: 'Run through a tunnel that twists, flips, and changes shape. The floor may become a wall without warning. Keep moving and don’t fall into the void!',
    button: 'ENTER THE VOID',
    path: 'games/void-runner/index.html?arcade=1',
    art: 'assets/veil/game-card-tiles/veil-card-bg-void-runner-1200x660.webp',
    className: 'void',
    tags: ['3D Runner', 'Endless Mode', 'Feels Like: Run 3'],
    boards: ['void-runner-explore', 'void-runner-infinite']
  },
  {
    id: 'runeball-arena', title: 'Runeball Arena', subtitle: 'Make the Save.', kicker: 'NOT IN MY GOAL!',
    description: 'Protect your goal from powerful rune shots. Watch the ball, move quickly, and block every shot you can. One amazing save could win the match!', button: 'TAKE THE FIELD',
    path: 'games/runeball-arena/Runeball-Arena.html', art: 'assets/veil/game-card-tiles/veil-card-bg-runeball-arena-1200x660.webp', className: 'dash',
    tags: ['Goal Defense', 'Quick Matches', 'Feels Like: Penalty Saves'], boards: []
  },
  {
    id: 'runewheel-rally', title: 'Runewheel Rally', subtitle: 'Leave Them in the Crystal Dust.', kicker: 'BOOST NOW. THINK LATER.',
    description: 'Race through magical tracks, grab crystals, and hit every boost you can find. Stay on the road, speed past your rivals, and race for first place!', button: 'START YOUR ENGINE',
    path: 'games/runewheel-rally/Runewheel-Rally.html', art: 'assets/veil/game-card-tiles/veil-card-bg-runewheel-rally-1200x660.webp', className: 'void',
    tags: ['Kart Racing', 'Speed Boosts', 'Feels Like: Mario Kart'], boards: []
  },
  {
    id: 'dragons-gambit-hall', title: 'Dragon’s Gambit Hall', subtitle: 'Plan Your Next Move.', kicker: 'OUTSMART THE CROWN.',
    description: 'Challenge the royal hall to a game of chess. Move your pieces, protect your king, and watch for traps. A smart plan can beat a powerful attack!', button: 'MAKE YOUR MOVE',
    path: 'games/dragons-gambit-hall/Dragons-Gambit-Hall.html', art: 'assets/veil/game-card-tiles/veil-card-bg-dragons-gambit-hall-1200x660.webp', className: 'dash',
    tags: ['Full Chess', 'Strategy', 'Feels Like: Classic Chess'], boards: []
  },
  {
    id: 'starfall-squadron', title: 'Starfall Squadron', subtitle: 'Fly Into the Starfall.', kicker: 'THE SKY NEEDS A HERO!',
    description: 'Pilot your dragon craft through the kingdom skies. Dodge attacks, blast invaders, and survive each new wave. Dragonswood is counting on you!', button: 'LAUNCH THE SQUADRON',
    path: 'games/starfall-squadron/Starfall-Squadron.html', art: 'assets/veil/game-card-tiles/veil-card-bg-starfall-squadron-1200x660.webp', className: 'void',
    tags: ['Flying Blaster', 'Wave Survival', 'Feels Like: Arcade Blasters'], boards: []
  },
  {
    id: 'defenders-of-dragonswood', title: 'Defenders of Dragonswood', subtitle: 'Hold the Line.', kicker: 'NOT ONE STEP FARTHER!',
    description: 'Build towers along the path and stop the enemies before they reach Dragonswood. Choose your defenses, make them stronger, and get ready for the next wave!', button: 'DEFEND DRAGONSWOOD',
    path: 'games/defenders-of-dragonswood/Defenders-of-Dragonswood.html', art: 'assets/veil/game-card-tiles/veil-card-bg-defenders-of-dragonswood-1200x660.webp', className: 'dash',
    tags: ['Tower Defense', 'Build & Upgrade', 'Feels Like: Kingdom Rush'], boards: []
  }
];

export const BOARDS = [
  { id: 'dragon-dash', gameId: 'dragon-dash', title: 'Dragon Dash' },
  { id: 'void-runner-explore', gameId: 'void-runner', title: 'Void Runner • Explore' },
  { id: 'void-runner-infinite', gameId: 'void-runner', title: 'Void Runner • Infinite' }
];
