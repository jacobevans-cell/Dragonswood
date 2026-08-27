export const GAMES = [
  {
    id: 'dragon-dash',
    title: 'Dragon Dash',
    subtitle: 'Runestone Trials',
    kicker: 'RHYTHM TRIAL',
    description: 'Guide a dragon-cube through runes, spikes, portals, gravity shifts, and increasingly rude architecture.',
    path: 'games/dragon-dash/index.html?arcade=1',
    art: 'assets/dragon-cube.svg',
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
    art: 'assets/dragon-runner.svg',
    className: 'void',
    tags: ['3D', 'Explore', 'Infinite'],
    boards: ['void-runner-explore', 'void-runner-infinite']
  }
];

export const BOARDS = [
  { id: 'dragon-dash', gameId: 'dragon-dash', title: 'Dragon Dash' },
  { id: 'void-runner-explore', gameId: 'void-runner', title: 'Void Runner • Explore' },
  { id: 'void-runner-infinite', gameId: 'void-runner', title: 'Void Runner • Infinite' }
];
