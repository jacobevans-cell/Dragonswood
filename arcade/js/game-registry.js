export const GAMES = [
  {
    id: 'dragon-dash',
    title: 'Dragon Dash',
    subtitle: 'Runestone Trials',
    kicker: 'RHYTHM TRIAL',
    description: 'Guide a dragon-cube through runes, spikes, portals, gravity shifts, and increasingly rude architecture.',
    path: 'games/dragon-dash/index.html?arcade=1',
    art: 'assets/veil/game-card-tiles/veil-card-bg-dragon-dash-1200x660.webp',
    className: 'dash',
    tags: ['One-button', 'Practice', 'Level Editor'],
    boards: ['dragon-dash']
  },
  {
    id: 'void-runner',
    title: 'Void Runner',
    subtitle: 'Astral Passage',
    kicker: 'GRAVITY TRIAL',
    description: 'Run a blocky baby dragon through fractured tunnels that change shape, width, and gravity as the walls become the floor.',
    path: 'games/void-runner/index.html?arcade=1',
    art: 'assets/veil/game-card-tiles/veil-card-bg-void-runner-1200x660.webp',
    className: 'void',
    tags: ['3D', 'Explore', 'Infinite'],
    boards: ['void-runner-explore', 'void-runner-infinite']
  },
  {
    id: 'runeball-arena', title: 'Runeball Arena', subtitle: 'Runic Rally', kicker: 'ARENA SPORT',
    description: 'Defend the goal and bend rune-powered shots through a fast magical arena match.',
    path: 'games/runeball-arena/Runeball-Arena.html', art: 'assets/veil/game-card-tiles/veil-card-bg-runeball-arena-1200x660.webp', className: 'dash',
    tags: ['Arcade', 'Sports', 'Local Play'], boards: []
  },
  {
    id: 'runewheel-rally', title: 'Runewheel Rally', subtitle: 'Crystal Circuit', kicker: 'RACING TRIAL',
    description: 'Race through enchanted circuits, collect boosts, and master every turn.',
    path: 'games/runewheel-rally/Runewheel-Rally.html', art: 'assets/veil/game-card-tiles/veil-card-bg-runewheel-rally-1200x660.webp', className: 'void',
    tags: ['Arcade', 'Racing', 'Chromebook'], boards: []
  },
  {
    id: 'dragons-gambit-hall', title: "Dragon's Gambit Hall", subtitle: 'Royal Strategy', kicker: 'STRATEGY HALL',
    description: 'Play a complete game of chess inside Dragonswood’s royal strategy hall.',
    path: 'games/dragons-gambit-hall/Dragons-Gambit-Hall.html', art: 'assets/veil/game-card-tiles/veil-card-bg-dragons-gambit-hall-1200x660.webp', className: 'dash',
    tags: ['Arcade', 'Chess', 'Strategy'], boards: []
  },
  {
    id: 'starfall-squadron', title: 'Starfall Squadron', subtitle: 'Skyward Defense', kicker: 'FLIGHT TRIAL',
    description: 'Pilot a dragon craft through starfall waves and defend the kingdom skies.',
    path: 'games/starfall-squadron/Starfall-Squadron.html', art: 'assets/veil/game-card-tiles/veil-card-bg-starfall-squadron-1200x660.webp', className: 'void',
    tags: ['Arcade', 'Flight', 'Action'], boards: []
  },
  {
    id: 'defenders-of-dragonswood', title: 'Defenders of Dragonswood', subtitle: 'Kingdom Stand', kicker: 'DEFENSE TRIAL',
    description: 'Build a defense, protect the path, and hold back each invading wave.',
    path: 'games/defenders-of-dragonswood/Defenders-of-Dragonswood.html', art: 'assets/veil/game-card-tiles/veil-card-bg-defenders-of-dragonswood-1200x660.webp', className: 'dash',
    tags: ['Arcade', 'Defense', 'Strategy'], boards: []
  }
];

export const BOARDS = [
  { id: 'dragon-dash', gameId: 'dragon-dash', title: 'Dragon Dash' },
  { id: 'void-runner-explore', gameId: 'void-runner', title: 'Void Runner • Explore' },
  { id: 'void-runner-infinite', gameId: 'void-runner', title: 'Void Runner • Infinite' }
];
